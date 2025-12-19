'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/StudentLayout';
import { profileService, UserProfile, UpdateProfileRequest } from '@/services/profileService';
import { authService } from '@/services/authService';

export default function StudentProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    fullName: '',
    phoneNumber: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    if (!authenticated) {
      router.push('/login');
      return;
    }

    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setFormData({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber || '',
      });
    } catch (err) {
      setError('Không thể tải thông tin cá nhân');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      const updated = await profileService.updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      setSuccess('Cập nhật thông tin thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Cập nhật thông tin thất bại');
      console.error(err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Mật khẩu mới không khớp');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('Mật khẩu mới phải có ít nhất 6 ký tự');
        return;
      }

      await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
      setSuccess('Đổi mật khẩu thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Đổi mật khẩu thất bại');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Thông tin cá nhân
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Quản lý thông tin tài khoản của bạn</p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Profile Information */}
        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto shadow-lg mb-4">
                  {profile.fullName?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{profile.fullName}</h2>
                <p className="text-sm text-gray-600 mt-1">{profile.email}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      profile.status?.toLowerCase() === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                    <span className="text-sm text-gray-600">
                      {profile.status?.toLowerCase() === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Thông tin cơ bản</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition"
                      >
                        Lưu thay đổi
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold transition"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Họ và tên</p>
                      <p className="text-gray-800 font-medium mt-1">{profile.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-800 font-medium mt-1">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="text-gray-800 font-medium mt-1">{profile.phoneNumber || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Thông tin tài khoản</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Loại tài khoản</p>
                    <p className="text-gray-800 font-medium mt-1 capitalize">
                      {profile.userType === 'student' ? 'Sinh viên' : profile.userType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày tạo tài khoản</p>
                    <p className="text-gray-800 font-medium mt-1">
                      {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lần đăng nhập cuối</p>
                    <p className="text-gray-800 font-medium mt-1">
                      {profile.lastLogin
                        ? new Date(profile.lastLogin).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Chưa có'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email xác thực</p>
                    <p className="text-gray-800 font-medium mt-1 flex items-center gap-2">
                      {profile.emailVerifiedAt ? (
                        <>
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                          Đã xác thực
                        </>
                      ) : (
                        <>
                          <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
                          Chưa xác thực
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Bảo mật</h3>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Đổi mật khẩu
                    </button>
                  )}
                </div>

                {isChangingPassword ? (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition"
                      >
                        Đổi mật khẩu
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold transition"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Mật khẩu của bạn được bảo vệ bằng mã hóa. Hãy chọn mật khẩu mạnh và không chia sẻ với ai.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        💡 Mẹo: Sử dụng mật khẩu có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
