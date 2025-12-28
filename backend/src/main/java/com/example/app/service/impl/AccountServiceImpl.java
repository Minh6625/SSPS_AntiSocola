package com.example.app.service.impl;

import com.example.app.dto.*;
import com.example.app.entity.Notification;
import com.example.app.entity.PageBalance;
import com.example.app.entity.PageTransaction;
import com.example.app.entity.PrintLog;
import com.example.app.entity.User;
import com.example.app.exception.BusinessException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.AccountRepository;
import com.example.app.repository.NotificationRepository;
import com.example.app.repository.PageBalanceRepository;
import com.example.app.repository.PageTransactionRepository;
import com.example.app.repository.PrintLogRepository;
import com.example.app.service.interfaces.IAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SERVICE LAYER - Business Logic
 * Xử lý logic quản lý tài khoản (tất cả roles) cho SPSO
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AccountServiceImpl implements IAccountService {
    
    private final AccountRepository accountRepository;
    private final PageBalanceRepository pageBalanceRepository;
    private final PrintLogRepository printLogRepository;
    private final NotificationRepository notificationRepository;
    private final PageTransactionRepository pageTransactionRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Lấy danh sách tài khoản với filter
     */
    @Override
    @Transactional(readOnly = true)
    public Page<AccountListDTO> getAccountList(AccountFilterDTO filter) {
        log.info("Fetching account list: keyword={}, userType={}, status={}, page={}", 
                 filter.getKeyword(), filter.getUserType(), filter.getStatus(), filter.getPageNumber());
        
        validateFilterInput(filter);
        
        Pageable pageable = PageRequest.of(
            filter.getPageNumber() - 1,
            filter.getPageSize()
        );
        
        String keyword = filter.getKeyword() != null ? filter.getKeyword() : "";
        String userType = filter.getUserType();
        String status = filter.getStatus();
        Page<User> accounts;
        
        String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "userId";
        switch (sortBy) {
            case "fullName":
                accounts = accountRepository.findAccountsWithFilterSortByName(keyword, userType, status, pageable);
                break;
            case "lastLogin":
                accounts = accountRepository.findAccountsWithFilterSortByLastLogin(keyword, userType, status, pageable);
                break;
            case "createdAt":
                accounts = accountRepository.findAccountsWithFilterSortByCreatedAt(keyword, userType, status, pageable);
                break;
            default:
                accounts = accountRepository.findAccountsWithFilter(keyword, userType, status, pageable);
                break;
        }
        
        List<AccountListDTO> dtos = accounts.getContent().stream()
            .map(this::mapToAccountListDTO)
            .collect(Collectors.toList());
        
        log.info("Found {} accounts", dtos.size());
        return new PageImpl<>(dtos, pageable, accounts.getTotalElements());
    }
    
    /**
     * Lấy chi tiết tài khoản
     */
    @Override
    @Transactional(readOnly = true)
    public AccountDetailDTO getAccountDetail(String userId) {
        log.info("Fetching account detail: {}", userId);
        
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID không được để trống");
        }
        
        User user = accountRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại: " + userId));
        
        AccountDetailDTO dto = new AccountDetailDTO();
        dto.setUserId(user.getUserId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setUserType(user.getUserType());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLogin(user.getLastLogin());
        
        // Thông tin trang in chỉ có với Student
        if ("Student".equals(user.getUserType())) {
            PageBalance pageBalance = pageBalanceRepository.findById(userId)
                .orElse(new PageBalance(userId, 0, LocalDateTime.now(), user));
            
            dto.setA4Balance(pageBalance.getA4Balance());
            dto.setA3Balance(0); // System stores only A4 equivalent (A3 = 2×A4)
            dto.setTotalA4Equivalent(pageBalance.getA4Balance()); // Total A4 equivalent
            
            Long totalJobs = printLogRepository.countByStudentId(userId);
            Integer totalPages = printLogRepository.sumA4EquivalentByStudentId(userId);
            LocalDateTime lastPrint = printLogRepository.findLastPrintTimeByStudentId(userId);
            
            dto.setTotalPrintJobs(totalJobs != null ? totalJobs : 0L);
            dto.setTotalPagesPrinted(totalPages != null ? totalPages.longValue() : 0L);
            dto.setLastPrintTime(lastPrint);
        }
        
        log.info("Account detail fetched: {}", userId);
        return dto;
    }
    
    /**
     * Tạo tài khoản mới
     */
    @Override
    @Transactional
    public CreateAccountResponseDTO createAccount(CreateAccountRequestDTO request) {
        log.info("Creating new account: userId={}, userType={}", request.getUserId(), request.getUserType());
        
        // Validate userType
        if (!isValidRole(request.getUserType())) {
            throw new IllegalArgumentException("Loại tài khoản không hợp lệ: " + request.getUserType());
        }
        
        // Check if userId already exists
        if (accountRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new BusinessException("ID tài khoản đã tồn tại: " + request.getUserId());
        }
        
        // Check if email already exists
        if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BusinessException("Email đã được sử dụng: " + request.getEmail());
        }
        
        // Create new user
        User user = new User();
        user.setUserId(request.getUserId());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setUserType(request.getUserType());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus("Active");
        user.setCreatedAt(LocalDateTime.now());
        
        accountRepository.save(user);
        
        // If Student, create PageBalance
        if ("Student".equals(request.getUserType())) {
            PageBalance pageBalance = new PageBalance(user.getUserId(), 0, LocalDateTime.now(), user);
            pageBalanceRepository.save(pageBalance);
        }
        
        log.info("Account created successfully: {}", request.getUserId());
        
        return new CreateAccountResponseDTO(
            user.getUserId(),
            user.getEmail(),
            user.getFullName(),
            user.getUserType(),
            user.getStatus(),
            String.format("Đã tạo tài khoản %s (%s) thành công", user.getFullName(), user.getUserType())
        );
    }
    
    /**
     * Cập nhật trạng thái tài khoản
     */
    @Override
    @Transactional
    public UpdateStatusResponseDTO updateAccountStatus(UpdateAccountStatusRequestDTO request) {
        log.info("Updating account status: {}, status={}", request.getUserId(), request.getStatus());
        
        if (!isValidStatus(request.getStatus())) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + request.getStatus());
        }
        
        User user = accountRepository.findByUserId(request.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        
        String previousStatus = user.getStatus();
        user.setStatus(request.getStatus());
        accountRepository.save(user);
        
        log.info("Account status updated: {}", request.getUserId());
        
        return new UpdateStatusResponseDTO(
            user.getUserId(),
            user.getFullName(),
            previousStatus,
            request.getStatus(),
            String.format("Đã cập nhật trạng thái tài khoản %s từ '%s' sang '%s'", 
                         user.getFullName(), previousStatus, request.getStatus())
        );
    }
    
    /**
     * Đổi role cho tài khoản
     */
    @Override
    @Transactional
    public UpdateAccountRoleResponseDTO updateAccountRole(UpdateAccountRoleRequestDTO request) {
        log.info("Updating account role: {}, newRole={}", request.getUserId(), request.getNewRole());
        
        if (!isValidRole(request.getNewRole())) {
            throw new IllegalArgumentException("Role không hợp lệ: " + request.getNewRole());
        }
        
        User user = accountRepository.findByUserId(request.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        
        String previousRole = user.getUserType();
        
        // Không cho phép tự đổi role của chính mình (cần implement sau với SecurityContext)
        // Không cho phép đổi role của Admin (chỉ Admin khác mới được)
        
        user.setUserType(request.getNewRole());
        accountRepository.save(user);
        
        // Nếu đổi từ Student sang role khác, có thể cần xử lý PageBalance
        // Nếu đổi sang Student, cần tạo PageBalance nếu chưa có
        if ("Student".equals(request.getNewRole()) && !"Student".equals(previousRole)) {
            PageBalance pageBalance = pageBalanceRepository.findById(user.getUserId())
                .orElse(new PageBalance(user.getUserId(), 0, LocalDateTime.now(), user));
            pageBalanceRepository.save(pageBalance);
        }
        
        log.info("Account role updated: {} from {} to {}", request.getUserId(), previousRole, request.getNewRole());
        
        return new UpdateAccountRoleResponseDTO(
            user.getUserId(),
            user.getFullName(),
            previousRole,
            request.getNewRole(),
            String.format("Đã đổi role tài khoản %s từ '%s' sang '%s'", 
                         user.getFullName(), previousRole, request.getNewRole())
        );
    }
    
    /**
     * Cấp trang miễn phí cho sinh viên
     */
    @Override
    @Transactional
    public AllocatePageResponseDTO allocatePages(AllocatePageRequestDTO request) {
        log.info("Allocating pages: userId={}, A4={}, A3={}", 
                 request.getStudentId(), request.getA4Pages(), request.getA3Pages());
        
        if (request.getA4Pages() < 0 || request.getA3Pages() < 0) {
            throw new IllegalArgumentException("Số trang không được âm");
        }
        
        User user = accountRepository.findByUserId(request.getStudentId())
            .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        
        if (!"Student".equals(user.getUserType())) {
            throw new BusinessException("Chỉ có thể cấp trang cho tài khoản Student");
        }
        
        PageBalance pageBalance = pageBalanceRepository.findById(request.getStudentId())
            .orElse(new PageBalance(request.getStudentId(), 0, LocalDateTime.now(), user));
        
        // Convert A3 to A4 equivalent and add to A4 balance
        int totalA4ToAdd = request.getA4Pages() + (request.getA3Pages() * 2);
        int oldBalance = pageBalance.getA4Balance();
        pageBalance.setA4Balance(oldBalance + totalA4ToAdd);
        pageBalance.setLastUpdated(LocalDateTime.now());
        
        pageBalanceRepository.save(pageBalance);
        
        // Tạo lịch sử giao dịch
        PageTransaction transaction = new PageTransaction();
        transaction.setStudentId(request.getStudentId());
        transaction.setTransactionType("Allocate");
        transaction.setA4Pages(totalA4ToAdd);
        transaction.setBalanceAfterA4(pageBalance.getA4Balance());
        transaction.setTransactionStatus("Completed");
        transaction.setNotes(request.getReason() != null ? request.getReason() : "SPSO cấp trang miễn phí");
        transaction.setCreatedAt(LocalDateTime.now());
        pageTransactionRepository.save(transaction);
        
        // Tạo thông báo cho sinh viên
        Notification notification = new Notification();
        notification.setRecipientId(request.getStudentId());
        notification.setTitle("Bạn đã được cấp trang in miễn phí");
        notification.setMessage(String.format(
            "Bạn đã được cấp %d trang A4. Số dư hiện tại: %d trang A4.%s",
            totalA4ToAdd,
            pageBalance.getA4Balance(),
            request.getReason() != null ? " Lý do: " + request.getReason() : ""
        ));
        notification.setNotificationType("Success");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
        
        log.info("Pages allocated to: {}, transaction created, notification sent", request.getStudentId());
        
        return new AllocatePageResponseDTO(
            user.getUserId(),
            user.getFullName(),
            request.getA4Pages(),
            request.getA3Pages(),
            pageBalance.getA4Balance(),
            0, // No separate A3 balance
            pageBalance.getA4Balance(), // Total = A4 balance
            String.format("Đã cấp %d trang A4 cho %s", totalA4ToAdd, user.getFullName())
        );
    }
    
    /**
     * Lấy lịch sử in của tài khoản (chỉ Student)
     */
    @Override
    @Transactional(readOnly = true)
    public Page<PrintLogDTO> getAccountPrintHistory(String userId, Integer pageNumber, Integer pageSize) {
        log.info("Fetching print history: userId={}, page={}", userId, pageNumber);
        
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID không được để trống");
        }
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;
        
        User user = accountRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        
        if (!"Student".equals(user.getUserType())) {
            throw new BusinessException("Chỉ có thể xem lịch sử in của tài khoản Student");
        }
        
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize);
        Page<PrintLog> logs = printLogRepository.findByStudentIdOrderByPrintTimeDesc(userId, pageable);
        
        List<PrintLogDTO> dtos = logs.getContent().stream()
            .map(printLog -> modelMapper.map(printLog, PrintLogDTO.class))
            .collect(Collectors.toList());
        
        log.info("Found {} print logs for: {}", dtos.size(), userId);
        return new PageImpl<>(dtos, pageable, logs.getTotalElements());
    }
    
    /**
     * Xóa tài khoản (Soft delete)
     */
    @Override
    @Transactional
    public void deleteAccount(String userId) {
        log.info("Deleting account: {}", userId);
        
        User user = accountRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        
        user.setStatus("Inactive");
        accountRepository.save(user);
        
        log.info("Account deleted (soft): {}", userId);
    }
    
    // ============ HELPER METHODS ============
    
    private AccountListDTO mapToAccountListDTO(User user) {
        AccountListDTO dto = new AccountListDTO();
        dto.setUserId(user.getUserId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setUserType(user.getUserType());
        dto.setStatus(user.getStatus());
        dto.setLastLogin(user.getLastLogin());
        dto.setCreatedAt(user.getCreatedAt());
        
        // Thông tin trang in chỉ có với Student
        if ("Student".equals(user.getUserType())) {
            PageBalance pageBalance = pageBalanceRepository.findById(user.getUserId())
                .orElse(new PageBalance(user.getUserId(), 0, LocalDateTime.now(), user));
            dto.setA4Balance(pageBalance.getA4Balance());
            dto.setA3Balance(0); // No A3 support
            
            Long totalJobs = printLogRepository.countByStudentId(user.getUserId());
            dto.setTotalPrintJobs(totalJobs != null ? totalJobs : 0L);
        } else {
            dto.setA4Balance(null);
            dto.setA3Balance(null);
            dto.setTotalPrintJobs(null);
        }
        
        return dto;
    }
    
    private void validateFilterInput(AccountFilterDTO filter) {
        if (filter.getPageNumber() < 1) filter.setPageNumber(1);
        if (filter.getPageSize() < 1 || filter.getPageSize() > 100) filter.setPageSize(20);
        if (filter.getKeyword() == null) filter.setKeyword("");
    }
    
    private boolean isValidStatus(String status) {
        return status != null && 
               (status.equals("Active") || status.equals("Inactive"));
    }
    
    private boolean isValidRole(String role) {
        return role != null && 
               (role.equals("Student") || role.equals("SPSO"));
    }
}
