'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  accountManagementService, 
  AccountListDTO, 
  AccountFilterDTO,
  PageResponse 
} from '@/services/accountManagementService';
import AccountDetailModal from './AccountDetailModal';
import AllocatePageModal from './AllocatePageModal';
import UpdateStatusModal from './UpdateStatusModal';
import UpdateRoleModal from './UpdateRoleModal';

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function AccountManagementPage() {
  const [accounts, setAccounts] = useState<AccountListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  
  // Filters
  const [keyword, setKeyword] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('userId');
  const [sortDirection, setSortDirection] = useState('ASC');
  
  // Modals
  const [selectedAccount, setSelectedAccount] = useState<AccountListDTO | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filter: AccountFilterDTO = {
        keyword: keyword || undefined,
        userType: userTypeFilter as any || undefined,
        status: statusFilter || undefined,
        pageNumber: currentPage,
        pageSize,
        sortBy,
        sortDirection,
      };
      
      const response: PageResponse<AccountListDTO> = await accountManagementService.getAccountList(filter);
      setAccounts(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  }, [keyword, userTypeFilter, statusFilter, currentPage, pageSize, sortBy, sortDirection]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAccounts();
  };

  const handleViewDetail = (account: AccountListDTO) => {
    setSelectedAccount(account);
    setShowDetailModal(true);
  };

  const handleAllocatePages = (account: AccountListDTO) => {
    setSelectedAccount(account);
    setShowAllocateModal(true);
  };

  const handleUpdateStatus = (account: AccountListDTO) => {
    setSelectedAccount(account);
    setShowStatusModal(true);
  };

  const handleUpdateRole = (account: AccountListDTO) => {
    setSelectedAccount(account);
    setShowRoleModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      Suspended: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (userType: string) => {
    const styles: Record<string, string> = {
      Student: 'bg-blue-100 text-blue-800',
      SPSO: 'bg-purple-100 text-purple-800',
      Admin: 'bg-orange-100 text-orange-800',
    };
    return styles[userType] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (userType: string) => {
    const labels: Record<string, string> = {
      Student: 'Sinh viên',
      SPSO: 'SPSO',
      Admin: 'Admin',
    };
    return labels[userType] || userType;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      Active: 'Hoạt động',
      Inactive: 'Không hoạt động',
      Suspended: 'Bị khóa',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý tất cả tài khoản trong hệ thống (Student, SPSO, Admin)
          </p>
        </div>
        <button
          onClick={fetchAccounts}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <RefreshIcon />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Tìm theo ID, email, tên..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* User Type Filter */}
          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Tất cả loại tài khoản</option>
            <option value="Student">Sinh viên</option>
            <option value="SPSO">SPSO</option>
            <option value="Admin">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Inactive">Không hoạt động</option>
            <option value="Suspended">Bị khóa</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="userId">Sắp xếp theo ID</option>
            <option value="fullName">Sắp xếp theo tên</option>
            <option value="lastLogin">Sắp xếp theo đăng nhập</option>
            <option value="createdAt">Sắp xếp theo ngày tạo</option>
          </select>

          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ASC">Tăng dần</option>
            <option value="DESC">Giảm dần</option>
          </select>

          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Họ tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Loại TK
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Số dư trang
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-500">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy tài khoản nào
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{account.userId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {account.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                      {account.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(account.userType)}`}>
                        {getRoleLabel(account.userType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {account.userType === 'Student' ? (
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">{account.a4Balance}</span>
                          <span className="text-gray-500"> A4</span>
                          {account.a3Balance && account.a3Balance > 0 && (
                            <>
                              <span className="text-gray-400 mx-1">|</span>
                              <span className="font-medium text-gray-900">{account.a3Balance}</span>
                              <span className="text-gray-500"> A3</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(account.status)}`}>
                        {getStatusLabel(account.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(account)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <EyeIcon />
                        </button>
                        {account.userType === 'Student' && (
                          <button
                            onClick={() => handleAllocatePages(account)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Cấp trang"
                          >
                            <PlusIcon />
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(account)}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                          title="Cập nhật trạng thái"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleUpdateRole(account)}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Đổi role"
                        >
                          <UserIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Hiển thị {accounts.length} / {totalElements} tài khoản
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <span className="px-3 py-1 text-sm">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetailModal && selectedAccount && (
        <AccountDetailModal
          userId={selectedAccount.userId}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showAllocateModal && selectedAccount && (
        <AllocatePageModal
          account={selectedAccount}
          onClose={() => setShowAllocateModal(false)}
          onSuccess={() => {
            setShowAllocateModal(false);
            fetchAccounts();
          }}
        />
      )}

      {showStatusModal && selectedAccount && (
        <UpdateStatusModal
          account={selectedAccount}
          onClose={() => setShowStatusModal(false)}
          onSuccess={() => {
            setShowStatusModal(false);
            fetchAccounts();
          }}
        />
      )}

      {showRoleModal && selectedAccount && (
        <UpdateRoleModal
          account={selectedAccount}
          onClose={() => setShowRoleModal(false)}
          onSuccess={() => {
            setShowRoleModal(false);
            fetchAccounts();
          }}
        />
      )}
    </div>
  );
}
