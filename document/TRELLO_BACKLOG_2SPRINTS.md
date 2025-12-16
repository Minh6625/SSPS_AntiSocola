# TRELLO BACKLOG - HCMSIU SSPS (2 SPRINTS)

**Dự án:** Student Smart Printing Service  
**Timeline:** 4 tuần (2 sprints x 2 tuần)  
**Team:** 4-6 người (BA, UI/UX, Backend Dev, Frontend Dev, QA)

---

## SPRINT 0: SETUP & FOUNDATION (Week 0 - Before Sprint 1)

### 📋 List: PROJECT SETUP

**001 - [SETUP] Khởi tạo dự án và môi trường**

- Mô tả:
  - Thiết lập kho Git (GitHub/GitLab)
  - Tạo cấu trúc dự án cho Frontend (Next.js) và Backend (Spring Boot)
  - Thiết lập cơ sở dữ liệu SQL Server (local + cloud)
  - Cấu hình đường ống CI/CD cơ bản
  - Thiết lập workspace Figma cho thiết kế UI
- Assignee: Tech Lead + Team
- Time: 4 giờ
- Checklist:
  - [ ] Kho lưu trữ được tạo với README
  - [ ] Frontend: Next.js 14 + TypeScript được khởi tạo
  - [ ] Backend: Dự án Spring Boot 3.x được tạo
  - [ ] Cơ sở dữ liệu SQL Server được tạo
  - [ ] Workspace Figma được thiết lập
  - [ ] Biến môi trường được cấu hình

**002 - [BE] Thiết kế Database Schema toàn bộ hệ thống**

- Mô tả:
  - Thiết kế database schema cho toàn bộ hệ thống SSPS
  - Tables: Users, Documents, Printers, PrintJobs, PageBalance, PageTransactions, SystemConfig
  - Relationships: Foreign keys, Indexes, Constraints
  - SQL Server migration scripts
- Assignee: Backend Dev + DBA
- Time: 8 giờ
- Checklist:
  - [ ] Users table (id, email, password, fullName, studentId, role, createdAt)
  - [ ] Documents table (id, userId, fileName, fileType, fileSize, fileUrl, uploadDate)
  - [ ] Printers table (id, name, brand, model, campus, building, room, status, paperSizes)
  - [ ] PrintJobs table (id, userId, documentId, printerId, paperSize, pageRange, sides, copies, pagesUsed, status, submittedAt, completedAt)
  - [ ] PageBalance table (id, userId, pagesA4, pagesA3, lastUpdated)
  - [ ] PageTransactions table (id, userId, type, amount, balanceAfter, relatedJobId, transactionDate)
  - [ ] SystemConfig table (id, configKey, configValue, description, updatedAt)
  - [ ] Foreign keys và constraints
  - [ ] Indexes cho performance (userId, status, dates)
  - [ ] SQL migration scripts (CREATE TABLE, ALTER TABLE)
  - [ ] Sample data for testing

**003 - [DOCS] Task 1.1 - Văn bản mô tả ngữ cảnh (3 đoạn văn)**

- Mô tả:
  - Viết Domain Context: Mô tả bối cảnh hệ thống in ấn tại HCMIU
  - Viết Stakeholders: Student, SPSO, Admin
  - Viết Benefits: Lợi ích của hệ thống cho từng stakeholder
- Assignee: BA
- Time: 3 giờ
- Output: Document PDF/Word
- Checklist:
  - [ ] Domain context (1 đoạn văn)
  - [ ] Stakeholders analysis (1 đoạn văn)
  - [ ] Benefits mapping (1 đoạn văn)

**004 - [DOCS] Task 1.2 - Danh sách yêu cầu Functional & Non-functional**

- Mô tả:
  - List 5+ functional requirements cho Student
  - List 5+ functional requirements cho SPSO
  - List non-functional requirements (performance, security, usability)
  - Mỗi requirement viết dưới dạng câu đơn, rõ ràng, không mơ hồ
- Assignee: BA
- Time: 4 giờ
- Output: Requirements document
- Checklist:
  - [ ] Student requirements (≥5)
  - [ ] SPSO requirements (≥5)
  - [ ] Non-functional requirements (≥5)
  - [ ] Review và validate với team

**005 - [DOCS] Task 1.3 - Use-case Diagram toàn hệ thống**

- Mô tả:
  - Vẽ Use-case Diagram cho toàn bộ hệ thống
  - Bao gồm: Student actor, SPSO actor, System boundary
  - Use cases: Authentication, Upload Document, Print Configuration, Printer Management, Reports, etc.
- Assignee: BA
- Time: 3 giờ
- Tool: Draw.io / Lucidchart / PlantUML
- Output: Use-case diagram PNG/SVG
- Checklist:
  - [ ] Actors defined (Student, SPSO)
  - [ ] System boundary drawn
  - [ ] All major use cases included
  - [ ] Relationships (include, extend) shown

**006 - [DOCS] Task 1.4 - Use-case Description (Module: Print Document Flow)**

- Mô tả:
  - Chọn module: "In tài liệu" (Upload → Select Printer → Configure → Submit)
  - Viết bảng mô tả chi tiết cho use case "Print Document"
  - Bao gồm: Preconditions, Main Flow (>3 steps), Alternative Flows, Exception Flows, Postconditions
- Assignee: BA
- Time: 4 giờ
- Output: Use-case description table
- Checklist:
  - [ ] Use case name & ID
  - [ ] Actors, Preconditions, Postconditions
  - [ ] Main flow (>3 bước)
  - [ ] Alternative flows
  - [ ] Exception flows (≥2)

---

## SPRINT 1: MVP CORE FEATURES (Week 1-2)

**Mục tiêu:** Hoàn thành core printing flow + authentication + printer management

### 📋 List: AUTHENTICATION & USER MANAGEMENT

**007 - [DOCS] Task 2.1 - Activity Diagrams (5 use cases - Tối đa 5 diagrams)**

- Mô tả:
  - Vẽ 5 Activity Diagrams cho 5 use cases quan trọng nhất (có swimlanes)
  - **Diagram 1: Login** - Swimlanes: User, Frontend, Backend, Database
  - **Diagram 2: Upload Document** - Swimlanes: Student, Frontend, Backend, File Storage, Database
  - **Diagram 3: Print Job Submission** - Swimlanes: Student, Frontend, Backend, Database, Printer
  - **Diagram 4: Add Printer (SPSO)** - Swimlanes: SPSO, Frontend, Backend, Database
  - **Diagram 5: Generate Report (SPSO)** - Swimlanes: SPSO, Frontend, Backend, Database
  - Mỗi diagram có 1 đoạn văn mô tả (5 đoạn văn)
- Assignee: BA
- Time: 8 giờ
- Tool: Draw.io / Lucidchart
- Output: 5 Activity Diagrams + 5 đoạn văn mô tả
- Checklist:
  - [ ] Diagram 1: Login (User authentication flow)
  - [ ] Diagram 2: Upload Document (File upload với validation)
  - [ ] Diagram 3: Print Job Submission (Configure + Balance check + Submit)
  - [ ] Diagram 4: Add Printer (SPSO adds new printer)
  - [ ] Diagram 5: Generate Report (Monthly/Yearly report)
  - [ ] Mỗi diagram có swimlanes rõ ràng
  - [ ] Decision nodes cho validation/error handling
  - [ ] 5 đoạn văn mô tả (1 đoạn/diagram)

**008 - [DOCS] Task 2.2 - Sequence Diagrams (5 use cases - Tối đa 5 diagrams)**

- Mô tả:
  - Vẽ 5 Sequence Diagrams tương ứng với 5 Activity Diagrams ở task 006
  - **Diagram 1: Login** - User → LoginPage → AuthController → AuthService → UserRepository → Database → JWT Token
  - **Diagram 2: Upload Document** - Student → UploadPage → DocumentController → DocumentService → FileStorage → DocumentRepository → Database
  - **Diagram 3: Print Job Submission** - Student → PrintConfigPage → PrintJobController → BalanceService → PrintJobService → Database (deduct + create job)
  - **Diagram 4: Add Printer (SPSO)** - SPSO → PrinterManagementPage → PrinterController → PrinterService → PrinterRepository → Database
  - **Diagram 5: Generate Report (SPSO)** - SPSO → ReportPage → ReportController → ReportService → Database (aggregate queries)
  - Mỗi diagram có 1 đoạn văn mô tả (5 đoạn văn)
- Assignee: BA
- Time: 8 giờ
- Tool: Draw.io / Lucidchart / PlantUML
- Output: 5 Sequence Diagrams + 5 đoạn văn mô tả
- Checklist:
  - [ ] Diagram 1: Login sequence (authentication flow)
  - [ ] Diagram 2: Upload Document sequence (file upload flow)
  - [ ] Diagram 3: Print Job Submission sequence (balance check + job creation)
  - [ ] Diagram 4: Add Printer sequence (SPSO printer management)
  - [ ] Diagram 5: Generate Report sequence (data aggregation)
  - [ ] Lifelines cho tất cả objects/components
  - [ ] Messages (synchronous/asynchronous) rõ ràng
  - [ ] Return messages và response
  - [ ] 5 đoạn văn mô tả (1 đoạn/diagram)

**009 - [DOCS] Task 2.3 - Class Diagram: Print Document Module (1 comprehensive diagram)**

- Mô tả:
  - Vẽ 1 Class Diagram toàn diện cho module "In tài liệu" (Print Document Flow)
  - **Entity Layer:** User, Document, Printer, PrintJob, PageBalance, PageTransaction
  - **Controller Layer:** AuthController, DocumentController, PrinterController, PrintJobController, PageBalanceController
  - **Service Layer:** AuthService, DocumentService, PrinterService, PrintJobService, PageBalanceService, FileStorageService
  - **Repository Layer:** UserRepository, DocumentRepository, PrinterRepository, PrintJobRepository, PageBalanceRepository
  - **Utility Classes:** JwtUtil, FileValidator, PageCalculator
  - Relationships: inheritance, association, aggregation, composition, dependency
  - Multiplicity: 1-1, 1-N, N-M
- Assignee: BA
- Time: 5 giờ
- Tool: Draw.io / Lucidchart / PlantUML
- Output: 1 Class Diagram toàn diện
- Checklist:
  - [ ] Entity classes với attributes (id, name, type, etc.)
  - [ ] Controller classes với methods (endpoints)
  - [ ] Service classes với business logic methods
  - [ ] Repository classes với CRUD methods
  - [ ] Utility classes
  - [ ] Relationships rõ ràng (inheritance: User ← Student/SPSO)
  - [ ] Associations (User 1-N Document, Printer 1-N PrintJob)
  - [ ] Multiplicity labels
  - [ ] Visibility modifiers (+public, -private, #protected)

**010 - [UI] Thiết kế Wireframe Trang Đăng Nhập**

- Mô tả:
  - Thiết kế wireframe chi tiết cho Trang Đăng Nhập
  - Figma/Adobe XD, ngôn ngữ Tiếng Việt
  - Components: Logo, Email input, Password input, Remember me checkbox, Login button, Forgot password link
  - Responsive design (desktop + mobile)
- Assignee: UI/UX Designer
- Time: 4 giờ
- Tool: Figma
- Checklist:
  - [ ] Desktop layout
  - [ ] Mobile layout
  - [ ] Clickable prototype
  - [ ] Design system colors (HCMIU theme)

**011 - [UI] Thiết kế Wireframe Trang Đăng Ký**

- Mô tả:
  - Thiết kế wireframe cho Trang Đăng Ký
  - Components: Email (@hcmiu.edu.vn), MSSV, Full name, Password, Confirm password, Terms checkbox, Register button
- Assignee: UI/UX Designer
- Time: 4 giờ
- Checklist:
  - [ ] Desktop layout
  - [ ] Mobile layout
  - [ ] Validation states
  - [ ] Clickable prototype

**012 - [BE] Xây dựng API Đăng Nhập (POST /api/auth/login)**

- Mô tả:
  - Xây dựng API Đăng Nhập (Spring Boot)
  - Đầu vào: LoginRequest DTO (email, password)
  - Quá trình: Xác thực thông tin đăng nhập, Tạo mã JWT
  - Đầu ra: LoginResponse DTO (token, user info)
  - Bảo mật: Mã hóa mật khẩu BCrypt
- Assignee: Backend Dev
- Time: 6 giờ
- Checklist:
  - [ ] Điểm cuối AuthController.login()
  - [ ] Logic AuthService.authenticate()
  - [ ] Tạo mã JWT (JwtUtil)
  - [ ] Xử lý ngoại lệ (InvalidCredentials)
  - [ ] Kiểm tra đơn vị
  - [ ] Tài liệu Postman/Swagger

**013 - [BE] Xây dựng API Đăng Ký (POST /api/auth/register)**

- Mô tả:
  - Xây dựng API Đăng Ký (Spring Boot)
  - Đầu vào: RegisterRequest DTO (email, password, studentId, fullName)
  - Validation: Email must be @hcmiu.edu.vn, password strength check
  - Output: Success message
- Assignee: Backend Dev
- Time: 6 giờ
- Checklist:
  - [ ] AuthController.register() endpoint
  - [ ] Xác thực email (@hcmiu.edu.vn)
  - [ ] Mã hóa mật khẩu (BCrypt)
  - [ ] Lưu người dùng vào cơ sở dữ liệu
  - [ ] Xử lý ngoại lệ (DuplicateEmail)
  - [ ] Kiểm tra đơn vị

**014 - [FE] Triển khai Trang Đăng Nhập**

- Mô tả:
  - Triển khai Trang Đăng Nhập (Next.js + TypeScript)
  - Xác thực biểu mẫu (định dạng email, mật khẩu bắt buộc)
  - Tích hợp API: POST /api/auth/login
  - Lưu trữ mã (localStorage/cookies)
  - Redirect: Student → /student/dashboard, SPSO → /spso/dashboard
- Assignee: Frontend Dev
- Time: 6 giờ
- Checklist:
  - [ ] Login form component (Ant Design)
  - [ ] Form validation (email, password)
  - [ ] API call với Axios
  - [ ] Trạng thái tải và xử lý lỗi
  - [ ] JWT token storage
  - [ ] Chuyển hướng dựa trên vai trò
  - [ ] Responsive design

**015 - [FE] Triển khai Trang Đăng Ký**

- Mô tả:
  - Triển khai Trang Đăng Ký (Next.js)
  - Form fields: Email, MSSV, Full name, Password, Confirm password
  - Validation: Email @hcmiu.edu.vn, password match, strength indicator
  - Tích hợp API: POST /api/auth/register
- Assignee: Frontend Dev
- Time: 6 giờ
- Checklist:
  - [ ] Register form component
  - [ ] Xác thực email (@hcmiu.edu.vn)
  - [ ] Password strength indicator
  - [ ] Confirm password matching
  - [ ] API integration
  - [ ] Thông báo thành công/lỗi
  - [ ] Redirect to login after success

**016 - [QA] Kiểm thử luồng Xác thực**

- Mô tả:
  - Kiểm tra Đăng nhập: Thông tin đăng nhập hợp lệ, Thông tin đăng nhập không hợp lệ, Trường trống
  - Kiểm tra Đăng ký: Dữ liệu hợp lệ, Email trùng lặp, Định dạng email không hợp lệ, Mật khẩu yếu
  - Kiểm tra mã JWT: Hết hạn, Làm mới, Mã không hợp lệ
- Assignee: QA
- Time: 4 giờ
- Checklist:
  - [ ] Login test cases (≥5)
  - [ ] Register test cases (≥5)
  - [ ] Security tests (SQL injection, XSS)
  - [ ] Bug reports filed

---

### 📋 List: PRINT DOCUMENT FLOW (CORE)

**017 - [DOCS] Đặc tả yêu cầu: Luồng In Tài Liệu**

- Mô tả:
  - Viết tài liệu chi tiết requirement cho Print Document Flow
  - Bao gồm: Upload → Select Printer → Configure → Submit → History
  - User stories, Acceptance criteria, Business rules, Validation rules
- Assignee: BA
- Time: 4 giờ
- Checklist:
  - [ ] User stories (Upload, Select Printer, Configure, Submit, View History)
  - [ ] Acceptance criteria cho từng user story
  - [ ] Business rules (file types, file size limits, balance checking)
  - [ ] Validation rules (client-side & server-side)
  - [ ] Error handling scenarios
  - [ ] Document approval

**018 - [UI] Thiết kế Wireframe Trang Tải Tài Liệu Lên**

- Mô tả:
  - Thiết kế wireframe cho Upload Document Page
  - Components: Drag & drop zone, File list table, Actions (View, Print, Delete)
  - File type filter, Pagination
- Assignee: UI/UX Designer
- Time: 4 giờ
- Checklist:
  - [ ] Drag & drop area design
  - [ ] File list table layout
  - [ ] Action buttons
  - [ ] Empty state
  - [ ] Clickable prototype

**019 - [UI] Thiết kế Wireframe Trang Chọn Máy In**

- Mô tả:
  - Thiết kế wireframe cho Printer Selection Page
  - Components: Filters (Campus, Building), Printer cards (grid), Status badges
  - Empty state: "No printers available"
- Assignee: UI/UX Designer
- Time: 4 giờ
- Checklist:
  - [ ] Filter section
  - [ ] Printer card design
  - [ ] Grid layout
  - [ ] Status badges (Available, Busy, Maintenance)
  - [ ] Clickable prototype

**020 - [UI] Thiết kế Wireframe Trang Cấu Hình In**

- Mô tả:
  - Thiết kế wireframe cho Print Configuration Page
  - Components: Wizard steps, Form (Paper size, Pages, Sides, Copies), Preview panel (Balance check)
  - Warning state: Insufficient balance
- Assignee: UI/UX Designer
- Time: 5 giờ
- Checklist:
  - [ ] Wizard steps UI
  - [ ] Configuration form
  - [ ] Preview panel (balance calculation)
  - [ ] Warning/error states
  - [ ] Clickable prototype

**021 - [UI] Thiết kế Wireframe Trang Lịch Sử In**

- Mô tả:
  - Thiết kế wireframe cho Print History Page (Student)
  - Components: Filters (Date range, Status), Table (Date, Document, Printer, Pages, Status), Pagination
  - Status badges: Completed (green), Processing (yellow), Failed (red)
- Assignee: UI/UX Designer
- Time: 4 giờ
- Checklist:
  - [ ] Filter section
  - [ ] Table layout
  - [ ] Status badges
  - [ ] Detail modal design
  - [ ] Clickable prototype

**022 - [BE] Xây dựng API Tải Tài Liệu Lên (POST /api/documents/upload)**

- Mô tả:
  - Xây dựng API Tải Tài Liệu Lên
  - Accept multipart/form-data
  - Validate: File type (pdf, docx, pptx), File size (max 50MB)
  - Save file to storage (local/S3), Save metadata to database
- Assignee: Backend Dev
- Time: 6 giờ
- Checklist:
  - [ ] DocumentController.uploadDocument()
  - [ ] Multipart file handling
  - [ ] File type validation
  - [ ] File size validation
  - [ ] File storage (local/S3)
  - [ ] Save metadata to DB
  - [ ] Xử lý ngoại lệ
  - [ ] Kiểm tra đơn vị

**023 - [BE] Xây dựng API Lấy Danh Sách Tài Liệu (GET /api/documents)**

- Mô tả:
  - Xây dựng API Lấy Danh Sách Tài Liệu
  - Query params: userId, fileType, page, size
  - Return: List of documents với pagination
- Assignee: Backend Dev
- Time: 4 giờ
- Checklist:
  - [ ] DocumentController.getDocuments()
  - [ ] Pagination support
  - [ ] Filter by fileType
  - [ ] Sort by uploadDate
  - [ ] Kiểm tra đơn vị

**024 - [BE] Xây dựng API Lấy Danh Sách Máy In (GET /api/printers)**

- Mô tả:
  - Xây dựng API Lấy Danh Sách Máy In
  - Query params: status, campus, building
  - Return: List of active printers
- Assignee: Backend Dev
- Time: 4 giờ
- Checklist:
  - [ ] PrinterController.getPrinters()
  - [ ] Filter by status, location
  - [ ] Return printer details
  - [ ] Kiểm tra đơn vị

**025 - [BE] Xây dựng API Gửi Yêu Cầu In (POST /api/print-jobs)**

- Mô tả:
  - Xây dựng API Gửi Yêu Cầu In
  - Input: documentId, printerId, config (paperSize, pageRange, sides, copies)
  - Validation: Check page balance
  - Process: Deduct pages, Create print job, Update balance
- Assignee: Backend Dev
- Time: 8 giờ
- Checklist:
  - [ ] PrintJobController.submitPrintJob()
  - [ ] Balance validation
  - [ ] Page calculation logic
  - [ ] Deduct pages from balance
  - [ ] Create print job record
  - [ ] Transaction management (@Transactional)
  - [ ] Xử lý ngoại lệ (InsufficientBalance)
  - [ ] Kiểm tra đơn vị

**026 - [BE] Xây dựng API Lấy Lịch Sử In (GET /api/print-jobs/history)**

- Mô tả:
  - Xây dựng API Lấy Lịch Sử In
  - Query params: userId, status, startDate, endDate, page, size
  - Return: List of print jobs với pagination
- Assignee: Backend Dev
- Time: 4 giờ
- Checklist:
  - [ ] PrintJobController.getPrintHistory()
  - [ ] Filter by status, date range
  - [ ] Pagination
  - [ ] Kiểm tra đơn vị

**027 - [FE] Triển khai Trang Tải Tài Liệu Lên**

- Mô tả:
  - Implement Upload Document Page (Next.js)
  - Features: Drag & drop upload, File list table, Delete file
  - API integration: POST /api/documents/upload, GET /api/documents
- Assignee: Frontend Dev
- Time: 8 giờ
- Checklist:
  - [ ] Drag & drop component (Ant Design Upload)
  - [ ] File type validation (client-side)
  - [ ] Upload progress bar
  - [ ] File list table
  - [ ] Delete confirmation modal
  - [ ] API integration
  - [ ] Error handling
  - [ ] Responsive design

**028 - [FE] Triển khai Trang Chọn Máy In**

- Mô tả:
  - Implement Printer Selection Page (Next.js)
  - Features: Filters (Campus, Building, Status), Printer cards grid, Select printer
  - API integration: GET /api/printers
- Assignee: Frontend Dev
- Time: 6 giờ
- Checklist:
  - [ ] Filter components
  - [ ] Printer card component
  - [ ] Grid layout (responsive)
  - [ ] Status badge display
  - [ ] Select printer action
  - [ ] API integration
  - [ ] Empty state

**029 - [FE] Triển khai Trang Cấu Hình In**

- Mô tả:
  - Implement Print Configuration Page (Next.js)
  - Features: Wizard steps, Configuration form, Real-time balance calculation, Submit print job
  - API integration: POST /api/print-jobs
- Assignee: Frontend Dev
- Time: 10 giờ
- Checklist:
  - [ ] Wizard steps component
  - [ ] Configuration form (paper size, pages, sides, copies)
  - [ ] Balance calculation logic
  - [ ] Preview panel
  - [ ] Insufficient balance warning
  - [ ] Submit print job
  - [ ] API integration
  - [ ] Thông báo thành công/lỗi

**030 - [FE] Triển khai Trang Lịch Sử In**

- Mô tả:
  - Implement Print History Page (Next.js)
  - Features: Filters (Date range, Status), Print jobs table, View details modal
  - API integration: GET /api/print-jobs/history
- Assignee: Frontend Dev
- Time: 6 giờ
- Checklist:
  - [ ] Filter components (Date picker, Status dropdown)
  - [ ] Print jobs table
  - [ ] Status badges
  - [ ] Detail modal
  - [ ] Pagination
  - [ ] API integration

**031 - [QA] Kiểm thử Luồng In Tài Liệu**

- Mô tả:
  - Test Upload: Valid files, Invalid file types, Oversized files
  - Test Printer Selection: Filter, Select printer
  - Test Configuration: All combinations (A4/A3, 1/2 sides, copies)
  - Test Submit: Sufficient balance, Insufficient balance
  - Test History: Filter, View details
- Assignee: QA
- Time: 6 giờ
- Checklist:
  - [ ] Upload test cases (≥5)
  - [ ] Printer selection test cases (≥3)
  - [ ] Configuration test cases (≥8)
  - [ ] Submit print job test cases (≥5)
  - [ ] History test cases (≥3)
  - [ ] Bug reports filed

---

### 📋 List: PAGE BALANCE MANAGEMENT

**032 - [DOCS] Đặc tả yêu cầu: Quản Lý Số Trang**

- Mô tả:
  - Viết tài liệu chi tiết requirement cho Page Balance Management
  - Bao gồm: View balance, Purchase pages, Transaction history
  - User stories, Acceptance criteria, Business rules (pricing, allocation)
- Assignee: BA
- Time: 3 giờ
- Checklist:
  - [ ] User stories (View balance, Purchase pages, View transactions)
  - [ ] Acceptance criteria
  - [ ] Business rules (default allocation, pricing per page, A3 conversion)
  - [ ] Payment mock flow
  - [ ] Transaction types (Allocated, Purchased, Deducted)
  - [ ] Document approval

**033 - [UI] Thiết kế Wireframe Trang Số Dư Trang In**

- Mô tả:
  - Thiết kế wireframe cho Page Balance Page
  - Components: Balance cards (A4, A3, Total), Purchase form, Transaction history table
- Assignee: UI/UX Designer
- Time: 4 giờ
- Checklist:
  - [ ] Balance cards design
  - [ ] Purchase form
  - [ ] Transaction table
  - [ ] Clickable prototype

**034 - [BE] Xây dựng API Lấy Số Dư Trang In (GET /api/users/me/page-balance)**

- Mô tả:
  - Xây dựng API Lấy Số Dư Trang In
  - Return: pagesA4, pagesA3, totalA4Equivalent
- Assignee: Backend Dev
- Time: 3 giờ
- Checklist:
  - [ ] PageBalanceController.getBalance()
  - [ ] Calculate A4 equivalent
  - [ ] Kiểm tra đơn vị

**035 - [BE] Xây dựng API Mua Thêm Trang In (POST /api/page-balance/purchase)**

- Mô tả:
  - Xây dựng API Mua Thêm Trang In
  - Input: pages (A4)
  - Process: Calculate price, Mock payment, Update balance, Create transaction
- Assignee: Backend Dev
- Time: 6 giờ
- Checklist:
  - [ ] PageBalanceController.purchasePages()
  - [ ] Price calculation
  - [ ] Mock payment confirmation
  - [ ] Update balance (@Transactional)
  - [ ] Create transaction record
  - [ ] Kiểm tra đơn vị

**036 - [BE] Xây dựng API Lấy Lịch Sử Giao Dịch Trang (GET /api/page-balance/transactions)**

- Mô tả:
  - Xây dựng API Lấy Lịch Sử Giao Dịch Trang
  - Return: List of transactions (type: Allocated, Purchased, Deducted)
- Assignee: Backend Dev
- Time: 3 giờ
- Checklist:
  - [ ] PageBalanceController.getTransactions()
  - [ ] Pagination
  - [ ] Kiểm tra đơn vị

**037 - [FE] Triển khai Trang Số Dư Trang In**

- Mô tả:
  - Implement Page Balance Page (Next.js)
  - Features: Display balance, Purchase pages form, Transaction history
  - API integration: GET /api/users/me/page-balance, POST /api/page-balance/purchase, GET /api/page-balance/transactions
- Assignee: Frontend Dev
- Time: 6 giờ
- Checklist:
  - [ ] Balance cards (A4, A3, Total)
  - [ ] Purchase form
  - [ ] Price calculation
  - [ ] Payment confirmation modal
  - [ ] Transaction table
  - [ ] API integration

**038 - [QA] Kiểm thử Quản Lý Số Trang**

- Mô tả:
  - Test View Balance, Purchase pages (valid, invalid amounts), View transactions
- Assignee: QA
- Time: 3 giờ
- Checklist:
  - [ ] Balance display test
  - [ ] Purchase test cases (≥5)
  - [ ] Transaction history test
  - [ ] Bug reports filed

---

### 📋 List: PRINTER MANAGEMENT (SPSO)

**039 - [DOCS] Đặc tả yêu cầu: Quản Lý Máy In**

- Mô tả:
  - Viết tài liệu chi tiết requirement cho Printer Management (SPSO)
  - Bao gồm: Add printer, Edit printer, Enable/Disable printer
  - User stories, Acceptance criteria, Business rules
- Assignee: BA
- Time: 3 giờ
- Checklist:
  - [ ] User stories (Add, Edit, Toggle, View printers)
  - [ ] Acceptance criteria
  - [ ] Business rules (required fields, location format)
  - [ ] Validation rules (printer name unique, paper sizes)
  - [ ] Authorization rules (SPSO only)
  - [ ] Document approval

**040 - [UI] Thiết kế Wireframe Trang Quản Lý Máy In (SPSO)**

- Mô tả:
  - Thiết kế wireframe cho Printer Management Page
  - Components: Add button, Filters, Printers table, Actions (Edit, Delete, Toggle)
- Assignee: UI/UX Designer
- Time: 4 giờ
- Checklist:
  - [ ] Table layout
  - [ ] Add/Edit modal
  - [ ] Toggle switch
  - [ ] Clickable prototype

**041 - [BE] Xây dựng API Thêm Máy In (POST /api/printers)**

- Mô tả:
  - Xây dựng API Thêm Máy In
  - Input: name, brand, model, campus, building, room, paperSizes
  - Authorization: SPSO only
- Assignee: Backend Dev
- Time: 4 giờ
- Checklist:
  - [ ] PrinterController.addPrinter()
  - [ ] SPSO authorization check
  - [ ] Validation
  - [ ] Kiểm tra đơn vị

**042 - [BE] Xây dựng API Cập Nhật Máy In (PUT /api/printers/:id)**

- Mô tả:
  - Xây dựng API Cập Nhật Máy In
- Assignee: Backend Dev
- Time: 3 giờ
- Checklist:
  - [ ] PrinterController.updatePrinter()
  - [ ] Authorization check
  - [ ] Kiểm tra đơn vị

**043 - [BE] Xây dựng API Bật/Tắt Máy In (PATCH /api/printers/:id/toggle)**

- Mô tả:
  - Xây dựng API Bật/Tắt Máy In
  - Toggle: Active ↔ Inactive
- Assignee: Backend Dev
- Time: 3 giờ
- Checklist:
  - [ ] PrinterController.togglePrinter()
  - [ ] Authorization check
  - [ ] Kiểm tra đơn vị

**044 - [FE] Triển khai Trang Quản Lý Máy In (SPSO)**

- Mô tả:
  - Implement Printer Management Page (Next.js)
  - Features: Add printer modal, Edit printer modal, Toggle status, Delete printer
  - API integration: GET /api/printers, POST /api/printers, PUT /api/printers/:id, PATCH /api/printers/:id/toggle
- Assignee: Frontend Dev
- Time: 8 giờ
- Checklist:
  - [ ] Printers table
  - [ ] Add printer modal
  - [ ] Edit printer modal
  - [ ] Toggle switch
  - [ ] Delete confirmation
  - [ ] API integration
  - [ ] SPSO authorization

**045 - [QA] Kiểm thử Quản Lý Máy In**

- Mô tả:
  - Test Add, Edit, Toggle, Delete printer (authorization, validation)
- Assignee: QA
- Time: 4 giờ
- Checklist:
  - [ ] Add printer test cases (≥5)
  - [ ] Edit printer test cases (≥3)
  - [ ] Toggle test cases (≥2)
  - [ ] Authorization tests (Student cannot access)
  - [ ] Bug reports filed

---

### 📋 List: PRINT LOGS (SPSO)

**046 - [DOCS] Đặc tả yêu cầu: Nhật Ký In**

- Mô tả:
  - Viết tài liệu chi tiết requirement cho Print Logs (SPSO)
  - Bao gồm: View all print jobs, Filter logs, Export logs
  - User stories, Acceptance criteria, Business rules
- Assignee: BA
- Time: 2 giờ
- Checklist:
  - [ ] User stories (View logs, Filter, Export)
  - [ ] Acceptance criteria
  - [ ] Filter options (student, printer, date range, status)
  - [ ] Authorization rules (SPSO only)
  - [ ] Document approval

**047 - [UI] Thiết kế Wireframe Trang Nhật Ký In (SPSO)**

- Mô tả:
  - Thiết kế wireframe cho Print Logs Page
  - Components: Filters (Date, Student, Printer, Status), Logs table, Detail modal
- Assignee: UI/UX Designer
- Time: 4 giờ
- Checklist:
  - [ ] Filter section
  - [ ] Logs table
  - [ ] Detail modal
  - [ ] Clickable prototype

**048 - [BE] Xây dựng API Lấy Nhật Ký In (GET /api/print-logs)**

- Mô tả:
  - Xây dựng API Lấy Nhật Ký In (chỉ SPSO)
  - Query params: studentId, printerId, startDate, endDate, status
  - Return: All print jobs với filters
- Assignee: Backend Dev
- Time: 4 giờ
- Checklist:
  - [ ] PrintLogController.getPrintLogs()
  - [ ] SPSO authorization
  - [ ] Filters implementation
  - [ ] Pagination
  - [ ] Kiểm tra đơn vị

**049 - [FE] Triển khai Trang Nhật Ký In (SPSO)**

- Mô tả:
  - Implement Print Logs Page (Next.js)
  - Features: Filters, Logs table, View details modal
  - API integration: GET /api/print-logs
- Assignee: Frontend Dev
- Time: 6 giờ
- Checklist:
  - [ ] Filter components
  - [ ] Logs table
  - [ ] Detail modal
  - [ ] API integration
  - [ ] SPSO authorization

**050 - [QA] Kiểm thử Nhật Ký In**

- Mô tả:
  - Test Filters, View details, Authorization (Student cannot access)
- Assignee: QA
- Time: 3 giờ
- Checklist:
  - [ ] Filter test cases (≥5)
  - [ ] Detail view test
  - [ ] Authorization test
  - [ ] Bug reports filed

---

### 📋 List: SPRINT 1 CLOSURE

**051 - [DOCS] Task 3.1 - Sơ Đồ Kiến Trúc Phân Lớp**

- Mô tả:
  - Vẽ Layered Architecture diagram cho toàn bộ hệ thống
  - Layers: Presentation (Next.js), API Gateway, Business Logic (Spring Boot), Data Access (JPA), Database (SQL Server)
  - Viết 3 đoạn văn giải thích: UI Strategy, Data Storage Strategy, API Management
- Assignee: BA + Tech Lead
- Time: 4 giờ
- Checklist:
  - [ ] Architecture diagram
  - [ ] Đoạn văn 1: UI Strategy (Next.js SSR/CSR, State management)
  - [ ] Đoạn văn 2: Data Storage (SQL Server, Transaction management, File storage)
  - [ ] Đoạn văn 3: API Management (REST, JWT, Error handling)
  - [ ] References/links

**052 - [DOCS] Task 3.2 - Sơ Đồ Component: Module In Tài Liệu**

- Mô tả:
  - Vẽ Component Diagram cho Print Document module
  - Components: DocumentUploadComponent, PrinterSelectionComponent, PrintConfigComponent, PrintJobService, DocumentService, PrinterService, Database
  - Viết 1 đoạn văn mô tả
- Assignee: BA
- Time: 3 giờ
- Checklist:
  - [ ] Component diagram
  - [ ] Mô tả văn bản (1 đoạn)

**053 - [DEMO] Demo Sprint 1 & Tổng Kết**

- Mô tả:
  - Demo tất cả tính năng Sprint 1
  - Sprint retrospective: What went well, What to improve
  - Planning buffer for Sprint 2
- Assignee: Whole Team
- Time: 2 giờ
- Checklist:
  - [ ] Demo authentication
  - [ ] Demo print document flow
  - [ ] Demo printer management
  - [ ] Demo print logs
  - [ ] Retrospective notes
  - [ ] Sprint 2 planning

---

## SPRINT 2: DASHBOARD, REPORTS & POLISH (Week 3-4)

**Mục tiêu:** Dashboard, Reports, System Settings, Profile, UI Polish

### 📋 List: STUDENT DASHBOARD

**056 - [DOCS] Đặc tả yêu cầu: Dashboard Sinh Viên**

- Mô tả:
  - Viết tài liệu chi tiết requirement cho Student Dashboard
  - Bao gồm: Balance widget, Recent jobs widget, Quick actions, Charts
  - User stories, Acceptance criteria
- Assignee: BA
- Time: 2 giờ
- Checklist:
  - [ ] User stories (View dashboard, Quick actions)
  - [ ] Widget specifications (Balance, Recent jobs, Charts)
  - [ ] Quick actions list
  - [ ] Document approval

**057- [UI] Thiết kế Wireframe Dashboard Sinh Viên**

- Mô tả:
  - Thiết kế wireframe cho Student Dashboard
  - Components: Welcome header, Balance card, Recent jobs card, Quick actions card, Chart (Pages printed per month)
- Assignee: UI/UX Designer
- Time: 5 giờ
- Checklist:
  - [ ] Widget cards layout
  - [ ] Chart design
  - [ ] Quick actions
  - [ ] Clickable prototype

**058 - [BE] Xây dựng API Lấy Lịch Sử In Gần Đây (GET /api/print-jobs/recent)**

- Mô tả:
  - Xây dựng API Lấy Lịch Sử In Gần Đây
  - Query param: limit (default: 5)
  - Return: Recent print jobs for current user
- Assignee: Backend Dev
- Time: 3 giờ
- Checklist:
  - [ ] PrintJobController.getRecentJobs()
  - [ ] Sort by submittedAt DESC
  - [ ] Kiểm tra đơn vị

**059 - [FE] Triển khai Dashboard Sinh Viên**

- Mô tả:
  - Implement Student Dashboard (Next.js)
  - Features: Display balance, Recent jobs, Quick actions, Chart (Pages per month)
  - API integration: GET /api/users/me/page-balance, GET /api/print-jobs/recent
- Assignee: Frontend Dev
- Time: 8 giờ
- Checklist:
  - [ ] Dashboard layout
  - [ ] Balance widget
  - [ ] Recent jobs widget
  - [ ] Quick actions widget
  - [ ] Chart component (Chart.js/Recharts)
  - [ ] API integration
  - [ ] Responsive design

**060 - [QA] Kiểm thử Dashboard Sinh Viên**

- Mô tả:
  - Test Dashboard load, Widget display, Chart rendering
- Assignee: QA
- Time: 2 giờ
- Checklist:
  - [ ] Dashboard load test
  - [ ] Widget tests (≥4)
  - [ ] Chart test
  - [ ] Bug reports filed

---

### 📋 List: SPSO DASHBOARD & REPORTS

**061 - [DOCS] Đặc tả yêu cầu: Dashboard & Báo Cáo SPSO**

- Mô tả:
  - Viết tài liệu chi tiết requirement cho SPSO Dashboard & Reports
  - Bao gồm: Dashboard metrics, Monthly/Yearly reports, Export reports
  - User stories, Acceptance criteria, Report specifications
- Assignee: BA
- Time: 3 giờ
- Checklist:
  - [ ] User stories (View dashboard, Generate reports, Export)
  - [ ] Metrics specifications (Total jobs, pages, revenue, printers)
  - [ ] Report specifications (Monthly, Yearly, Top students, Top printers)
  - [ ] Chart specifications
  - [ ] Authorization rules (SPSO only)
  - [ ] Document approval

**062 - [UI] Thiết kế Wireframe Dashboard SPSO**

- Mô tả:
  - Thiết kế wireframe cho SPSO Dashboard
  - Components: Metric cards (Total jobs, Total pages, Revenue, Active printers), Charts (Pages per day, Paper distribution, Top students, Top printers)
- Assignee: UI/UX Designer
- Time: 5 giờ
- Checklist:
  - [ ] Metric cards
  - [ ] Charts layout
  - [ ] Clickable prototype

**063 - [UI] Thiết kế Wireframe Trang Báo Cáo (SPSO)**

- Mô tả:
  - Thiết kế wireframe cho Reports Page
  - Components: Month/Year selector, Report display (Stats, Top students table, Top printers table, Chart), Export buttons
- Assignee: UI/UX Designer
- Time: 4 giờ
- Checklist:
  - [ ] Report selector
  - [ ] Report layout
  - [ ] Tables design
  - [ ] Clickable prototype

**064 - [BE] Xây dựng API Thống Kê Dashboard (GET /api/reports/dashboard)**

- Mô tả:
  - Xây dựng API Thống Kê Dashboard (chỉ SPSO)
  - Return: totalJobs, totalPages, revenue, activePrinters, chartsData
- Assignee: Backend Dev
- Time: 6 giờ
- Checklist:
  - [ ] ReportController.getDashboardStats()
  - [ ] SPSO authorization
  - [ ] Aggregate queries (SQL)
  - [ ] Chart data calculation
  - [ ] Kiểm tra đơn vị

**065 - [BE] Xây dựng API Báo Cáo Theo Tháng (GET /api/reports/monthly)**

- Mô tả:
  - Xây dựng API Báo Cáo Theo Tháng
  - Query param: month (YYYY-MM)
  - Return: Stats, Top students, Top printers, Chart data
- Assignee: Backend Dev
- Time: 6 giờ
- Checklist:
  - [ ] ReportController.getMonthlyReport()
  - [ ] SPSO authorization
  - [ ] Aggregate queries
  - [ ] Kiểm tra đơn vị

**066 - [BE] Xây dựng API Báo Cáo Theo Năm (GET /api/reports/yearly)**

- Mô tả:
  - Xây dựng API Báo Cáo Theo Năm
  - Query param: year (YYYY)
- Assignee: Backend Dev
- Time: 4 giờ
- Checklist:
  - [ ] ReportController.getYearlyReport()
  - [ ] SPSO authorization
  - [ ] Kiểm tra đơn vị

**067 - [FE] Triển khai Dashboard SPSO**

- Mô tả:
  - Implement SPSO Dashboard (Next.js)
  - Features: Metric cards, Charts (Bar, Pie)
  - API integration: GET /api/reports/dashboard
- Assignee: Frontend Dev
- Time: 8 giờ
- Checklist:
  - [ ] Dashboard layout
  - [ ] Metric cards
  - [ ] Charts (Chart.js/Recharts)
  - [ ] API integration
  - [ ] SPSO authorization

**068 - [FE] Triển khai Trang Báo Cáo (SPSO)**

- Mô tả:
  - Implement Reports Page (Next.js)
  - Features: Month/Year selector, Report display, Export buttons
  - API integration: GET /api/reports/monthly, GET /api/reports/yearly
- Assignee: Frontend Dev
- Time: 6 giờ
- Checklist:
  - [ ] Month/Year selector
  - [ ] Report display
  - [ ] Tables (Top students, Top printers)
  - [ ] Charts
  - [ ] Export buttons (optional P2)
  - [ ] API integration

**069 - [QA] Kiểm thử Dashboard & Báo Cáo SPSO**

- Mô tả:
  - Test Dashboard metrics, Charts, Reports generation, Authorization
- Assignee: QA
- Time: 4 giờ
- Checklist:
  - [ ] Dashboard test cases (≥5)
  - [ ] Reports test cases (≥5)
  - [ ] Charts rendering test
  - [ ] Authorization test
  - [ ] Bug reports filed

---

### 📋 List: SYSTEM SETTINGS & PROFILE

**070 - [DOCS] Đặc tả yêu cầu: Cài Đặt Hệ Thống & Hồ Sơ**

- Mô tả:
  - Viết tài liệu chi tiết requirement cho System Settings & Profile
  - Bao gồm: System config (SPSO), User profile, Change password
  - User stories, Acceptance criteria, Business rules
- Assignee: BA
- Time: 2 giờ
- Checklist:
  - [ ] User stories (Update settings, Update profile, Change password)
  - [ ] System config fields (default pages, file types, pricing)
  - [ ] Profile fields (name, email, phone)
  - [ ] Password rules (strength, validation)
  - [ ] Authorization rules (SPSO for system settings)
  - [ ] Document approval

**071 - [UI] Thiết kế Wireframe Trang Cài Đặt Hệ Thống (SPSO)**

- Mô tả:
  - Thiết kế wireframe cho System Settings Page
  - Components: Page allocation settings, File settings, Payment settings, Save button
- Assignee: UI/UX Designer
- Time: 3 giờ
- Checklist:
  - [ ] Settings form layout
  - [ ] Clickable prototype

**072 - [UI] Thiết kế Wireframe Trang Hồ Sơ Người Dùng**

- Mô tả:
  - Thiết kế wireframe cho User Profile Page
  - Components: Profile form (Avatar, Name, Email, Phone), Change password section
- Assignee: UI/UX Designer
- Time: 3 giờ
- Checklist:
  - [ ] Profile form
  - [ ] Change password section
  - [ ] Clickable prototype

**073 - [BE] Xây dựng API Lấy Cấu Hình Hệ Thống (GET /api/system-config)**

- Mô tả:
  - Xây dựng API Lấy Cấu Hình Hệ Thống (chỉ SPSO)
  - Return: defaultPagesA4, defaultPagesA3, allowedFileTypes, maxFileSize, pricePerPageA4, pricePerPageA3
- Assignee: Backend Dev
- Time: 3 giờ
- Checklist:
  - [ ] SystemConfigController.getConfig()
  - [ ] SPSO authorization
  - [ ] Kiểm tra đơn vị

**074 - [BE] Xây dựng API Cập Nhật Cấu Hình Hệ Thống (PUT /api/system-config)**

- Mô tả:
  - Xây dựng API Cập Nhật Cấu Hình Hệ Thống (chỉ SPSO)
- Assignee: Backend Dev
- Time: 4 giờ
- Checklist:
  - [ ] SystemConfigController.updateConfig()
  - [ ] Validation
  - [ ] SPSO authorization
  - [ ] Kiểm tra đơn vị

**075 - [BE] Xây dựng API Lấy Hồ Sơ Người Dùng (GET /api/users/me)**

- Mô tả:
  - Xây dựng API Lấy Hồ Sơ Người Dùng
  - Return: User profile (email, fullName, studentId, phone)
- Assignee: Backend Dev
- Time: 2 giờ
- Checklist:
  - [ ] UserController.getProfile()
  - [ ] Kiểm tra đơn vị

**076 - [BE] Xây dựng API Cập Nhật Hồ Sơ Người Dùng (PUT /api/users/me)**

- Mô tả:
  - Xây dựng API Cập Nhật Hồ Sơ Người Dùng
- Assignee: Backend Dev
- Time: 3 giờ
- Checklist:
  - [ ] UserController.updateProfile()
  - [ ] Validation
  - [ ] Kiểm tra đơn vị

**077 - [BE] Xây dựng API Đổi Mật Khẩu (POST /api/auth/change-password)**

- Mô tả:
  - Xây dựng API Đổi Mật Khẩu
  - Input: currentPassword, newPassword
  - Validation: Current password correct, New password strength
- Assignee: Backend Dev
- Time: 4 giờ
- Checklist:
  - [ ] AuthController.changePassword()
  - [ ] Current password validation
  - [ ] Password hashing
  - [ ] Kiểm tra đơn vị

**078 - [FE] Triển khai Trang Cài Đặt Hệ Thống (SPSO)**

- Mô tả:
  - Implement System Settings Page (Next.js)
  - Features: Settings form, Save config
  - API integration: GET /api/system-config, PUT /api/system-config
- Assignee: Frontend Dev
- Time: 5 giờ
- Checklist:
  - [ ] Settings form
  - [ ] Validation
  - [ ] API integration
  - [ ] Success notification
  - [ ] SPSO authorization

**079 - [FE] Triển khai Trang Hồ Sơ Người Dùng**

- Mô tả:
  - Implement User Profile Page (Next.js)
  - Features: Profile form, Change password
  - API integration: GET /api/users/me, PUT /api/users/me, POST /api/auth/change-password
- Assignee: Frontend Dev
- Time: 6 giờ
- Checklist:
  - [ ] Profile form
  - [ ] Change password form
  - [ ] Validation
  - [ ] API integration
  - [ ] Success notifications

**080 - [QA] Kiểm thử Cài Đặt Hệ Thống & Hồ Sơ**

- Mô tả:
  - Test System settings update, Profile update, Change password
- Assignee: QA
- Time: 3 giờ
- Checklist:
  - [ ] System settings test cases (≥3)
  - [ ] Profile update test cases (≥3)
  - [ ] Change password test cases (≥5)
  - [ ] Bug reports filed

---

### 📋 List: UI/UX POLISH & OPTIMIZATION

**081 - [FE] Triển khai Điều Hướng & Bố Cục**

- Mô tả:
  - Implement global layout: Sidebar navigation, Top header (user menu, notifications)
  - Role-based navigation (Student vs SPSO)
  - Responsive design (mobile menu)
- Assignee: Frontend Dev
- Time: 8 giờ
- Checklist:
  - [ ] Sidebar component
  - [ ] Top header component
  - [ ] User menu dropdown
  - [ ] Role-based menu items
  - [ ] Mobile responsive menu
  - [ ] Active route highlighting

**082 - [FE] Triển khai Trạng Thái Tải & Xử Lý Lỗi**

- Mô tả:
  - Global loading spinner
  - Error boundary component
  - Toast notifications (success, error, warning)
  - 404 Page, 403 Forbidden Page, 500 Error Page
- Assignee: Frontend Dev
- Time: 6 giờ
- Checklist:
  - [ ] Loading spinner component
  - [ ] Error boundary
  - [ ] Toast notification system (Ant Design notification)
  - [ ] Error pages (404, 403, 500)

**083 - [FE] Triển khai Bảo Vệ Xác Thực**

- Mô tả:
  - Protected routes (require authentication)
  - Role-based access control (Student cannot access SPSO pages)
  - Redirect to login if not authenticated
- Assignee: Frontend Dev
- Time: 4 giờ
- Checklist:
  - [ ] Auth guard middleware
  - [ ] Role-based guard
  - [ ] Redirect logic
  - [ ] Token refresh logic

**084 - [FE] Tối Ưu Hiệu Suất Frontend**

- Mô tả:
  - Code splitting (Next.js dynamic imports)
  - Image optimization (Next.js Image)
  - API response caching (React Query/SWR)
  - Lazy loading components
- Assignee: Frontend Dev
- Time: 6 giờ
- Checklist:
  - [ ] Dynamic imports for large components
  - [ ] Image optimization
  - [ ] API caching setup
  - [ ] Lazy loading

**085 - [BE] Tối Ưu Hiệu Suất & Caching Backend**

- Mô tả:
  - Database query optimization (indexes)
  - API response caching (Redis - optional)
  - Connection pooling (HikariCP tuning)
  - Pagination for all list APIs
- Assignee: Backend Dev
- Time: 6 giờ
- Checklist:
  - [ ] Database indexes added
  - [ ] Slow query analysis
  - [ ] Connection pool tuning
  - [ ] Pagination review

**086 - [BE] Tăng Cường Bảo Mật Backend**

- Mô tả:
  - CORS configuration
  - Rate limiting (Spring Security)
  - Input validation (Bean Validation)
  - SQL injection prevention (Prepared statements)
  - XSS prevention (sanitize inputs)
- Assignee: Backend Dev
- Time: 6 giờ
- Checklist:
  - [ ] CORS configured
  - [ ] Rate limiting setup
  - [ ] Input validation on all APIs
  - [ ] Security headers configured

**087 - [QA] Kiểm thử Đa Trình Duyệt & Responsive**

- Mô tả:
  - Test trên Chrome, Firefox, Edge, Safari
  - Test responsive trên Desktop, Tablet, Mobile
  - Test các resolution: 1920x1080, 1366x768, 768x1024, 375x667
- Assignee: QA
- Time: 6 giờ
- Checklist:
  - [ ] Chrome test
  - [ ] Firefox test
  - [ ] Edge test
  - [ ] Safari test (if available)
  - [ ] Desktop responsive test
  - [ ] Tablet responsive test
  - [ ] Mobile responsive test
  - [ ] Bug reports filed

**088 - [QA] Kiểm thử End-to-End**

- Mô tả:
  - E2E test cho complete flow: Login → Upload Document → Select Printer → Configure → Submit → View History
  - E2E test cho SPSO flow: Login → Manage Printers → View Logs → Dashboard
- Assignee: QA
- Time: 6 giờ
- Checklist:
  - [ ] Student E2E flow test
  - [ ] SPSO E2E flow test
  - [ ] Bug reports filed

**089 - [QA] Kiểm thử Hiệu Suất & Tải**

- Mô tả:
  - Test response time của các API
  - Load test: 10 concurrent users, 50 concurrent users
  - File upload test: Large files (near 50MB)
- Assignee: QA
- Time: 4 giờ
- Checklist:
  - [ ] API response time test
  - [ ] Load test (10 users)
  - [ ] Load test (50 users)
  - [ ] Large file upload test
  - [ ] Performance report

---

### 📋 List: DOCUMENTATION & DEPLOYMENT

**090 - [DOCS] Tài Liệu API (Swagger/OpenAPI)**

- Mô tả:
  - Complete Swagger/OpenAPI documentation cho tất cả APIs
  - Request/Response examples
  - Error codes documentation
- Assignee: Backend Dev
- Time: 4 giờ
- Checklist:
  - [ ] Swagger UI configured
  - [ ] All endpoints documented
  - [ ] Request/Response schemas
  - [ ] Error codes documented

**091 - [DOCS] Hướng Dẫn Sử Dụng (Sinh Viên)**

- Mô tả:
  - Viết user manual cho Student
  - Screenshots cho mỗi màn hình
  - Step-by-step guide: Login → Upload → Print
- Assignee: BA + QA
- Time: 4 giờ
- Checklist:
  - [ ] Login guide
  - [ ] Upload document guide
  - [ ] Print configuration guide
  - [ ] Page balance guide
  - [ ] Screenshots

**092 - [DOCS] Hướng Dẫn Sử Dụng (SPSO)**

- Mô tả:
  - Viết user manual cho SPSO
  - Printer management guide
  - Reports generation guide
- Assignee: BA + QA
- Time: 3 giờ
- Checklist:
  - [ ] Printer management guide
  - [ ] Print logs guide
  - [ ] Reports guide
  - [ ] System settings guide
  - [ ] Screenshots

**093 - [DOCS] Hướng Dẫn Triển Khai**

- Mô tả:
  - Viết deployment guide
  - Frontend: Deploy to Vercel/Netlify
  - Backend: Deploy to AWS/Azure/Docker
  - Database: Setup SQL Server
  - Environment variables configuration
- Assignee: Tech Lead
- Time: 4 giờ
- Checklist:
  - [ ] Frontend deployment steps
  - [ ] Backend deployment steps
  - [ ] Database setup steps
  - [ ] Environment variables list
  - [ ] Troubleshooting section

**094 - [DEPLOY] Triển Khai Lên Production**

- Mô tả:
  - Deploy Frontend to Vercel/Netlify
  - Deploy Backend to AWS/Azure
  - Setup production database
  - Configure domain & SSL
  - Setup monitoring & logging
- Assignee: Tech Lead + DevOps
- Time: 8 giờ
- Checklist:
  - [ ] Frontend deployed
  - [ ] Backend deployed
  - [ ] Database configured
  - [ ] Domain & SSL configured
  - [ ] Monitoring setup (optional)
  - [ ] Smoke tests passed

---

### 📋 List: SPRINT 2 CLOSURE & FINAL DEMO

**095 - [QA] Kiểm Thử Hồi Quy Cuối Cùng**

- Mô tả:
  - Full regression test cho tất cả tính năng
  - Test trên production environment
  - Verify all critical bugs fixed
- Assignee: QA + Team
- Time: 6 giờ
- Checklist:
  - [ ] Sprint 1 features retest
  - [ ] Sprint 2 features test
  - [ ] Production environment test
  - [ ] Critical bugs verified fixed
  - [ ] Final test report

**096 - [DEMO] Demo Cuối Cùng & Kết Thúc Dự Án**

- Mô tả:
  - Final demo cho stakeholders
  - Demo tất cả tính năng: Student flow, SPSO flow, Reports
  - Project retrospective: Lessons learned
  - Handover documentation
- Assignee: Whole Team
- Time: 3 giờ
- Checklist:
  - [ ] Demo preparation
  - [ ] Student flow demo
  - [ ] SPSO flow demo
  - [ ] Dashboard & Reports demo
  - [ ] Q&A session
  - [ ] Retrospective notes
  - [ ] Documentation handover
  - [ ] Project closure celebration 🎉

---

## SUMMARY

**Total Tasks:** 94 tasks (đã tối ưu hóa và thêm BA requirements)
**Sprint 0:** 6 tasks (Setup + Database Schema tổng hợp + Foundation docs)
**Sprint 1:** 47 tasks (Authentication + Print Flow + Printer Management + Architecture)
**Sprint 2:** 41 tasks (Dashboard + Reports + Polish + Deployment)

**Task Distribution:**

- 📋 DOCS (BA): ~16 tasks (5 Activity + 5 Sequence + 1 Class + Architecture docs + 6 BA Requirements)
- 🎨 UI (Designer): ~15 tasks
- ⚙️ BE (Backend): ~30 tasks (bao gồm 1 task Database Schema tổng hợp)
- 💻 FE (Frontend): ~20 tasks
- 🧪 QA (Testing): ~10 tasks

**Workflow per Feature:**

1. **BA (Requirement Specification)** → 2-4 giờ
2. **UI (Wireframe)** → 3-5 giờ
3. **BE (API Implementation)** → 3-8 giờ
4. **FE (Frontend Implementation)** → 5-10 giờ
5. **QA (Testing)** → 2-6 giờ

**Note:**

- **Task 002:** Database Schema tổng hợp cho toàn bộ hệ thống (Users, Documents, Printers, PrintJobs, PageBalance, PageTransactions, SystemConfig)
- **BA Requirements** được thêm trước mỗi nhóm wireframe: Print Document Flow (017), Page Balance (031), Printer Management (038), Print Logs (045), Dashboards (052, 057), System Settings (067)
- Tất cả Activity & Sequence Diagrams cần thiết đã được tập trung vào Tasks 007-009 (5 Activity, 5 Sequence, 1 Class)
- Không có duplicate diagram tasks
- Không có duplicate database schema tasks

**Total Estimated Hours:** ~350-390 giờ
**Team Size:** 4-6 người
**Duration:** 4 tuần (2 sprints)

---

**END OF BACKLOG**
