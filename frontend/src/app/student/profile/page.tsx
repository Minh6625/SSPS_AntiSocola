'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/StudentLayout';
import { profileService, UserProfile, UpdateProfileRequest } from '@/services/profileService';
import { authService } from '@/services/authService';

export default function StudentProfile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<UpdateProfileRequest>({ fullName: '', phoneNumber: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) { router.push('/login'); return; }
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setFormData({ fullName: data.fullName, phoneNumber: data.phoneNumber || '' });
    } catch (err) { setError('Không thể tải thông tin cá nhân'); console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(''); setSuccess(''); setIsSaving(true);
      const updated = await profileService.updateProfile(formData);
      setProfile(updated); setIsEditing(false);
      setSuccess('Cập nhật thông tin thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Cập nhật thông tin thất bại'); console.error(err); }
    finally { setIsSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordData.newPassword !== passwordData.confirmPassword) { setPasswordError('Mật khẩu mới không khớp'); return; }
    if (passwordData.newPassword.length < 8) { setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự'); return; }
    try {
      await profileService.changePassword(passwordData);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      setSuccess('Đổi mật khẩu thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setPasswordError('Đổi mật khẩu thất bại'); console.error(err); }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log('Avatar file selected:', file);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${date.toLocaleDateString('vi-VN')}`;
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
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h1>
            <p className="text-sm text-gray-500">Quản lý thông tin tài khoản của bạn</p>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">{success}</div>}

        {profile && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                      {profile.fullName?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <button onClick={handleAvatarClick} className="absolute bottom-0 right-0 w-8 h-8 bg-gray-700 hover:bg-gray-800 rounded-full flex items-center justify-center text-white shadow-md transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-gray-800">{profile.fullName}</h2>
                    <p className="text-gray-500">{profile.email}</p>
                    <div className="flex gap-12 text-sm pt-1">
                      <div><span className="text-gray-400">Số điện thoại</span><p className="text-gray-700">{profile.phoneNumber || 'Chưa cập nhật'}</p></div>
                      <div><span className="text-gray-400">Vai trò</span><p className="text-gray-700">Student</p></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full border border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm font-medium">Hoạt động</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 ml-1 cursor-pointer hover:text-gray-700" onClick={handleAvatarClick}>Đổi ảnh đại diện</p>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Thông tin cá bản</h3>
                  {isEditing && <p className="text-sm text-gray-500">Thông tin cơ bản về tài khoản</p>}
                </div>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setIsEditing(false); setFormData({ fullName: profile.fullName, phoneNumber: profile.phoneNumber || '' }); }} className="px-4 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Hủy</button>
                    <button onClick={handleUpdateProfile} disabled={isSaving} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-1 disabled:opacity-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">Họ và tên</label>
                    <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">Email</label>
                    <input type="email" value={profile.email} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">Số điện thoại</label>
                    <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="Chưa cập nhật" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    <p className="text-xs text-gray-400 mt-1">Định dạng: 0xxxxxxxxx (10-11 số)</p>
                  </div>
                </form>
              ) : (
                <div className="mt-6 space-y-5">
                  <div><p className="text-sm text-gray-400 mb-1">Họ và tên</p><p className="text-gray-800">{profile.fullName}</p></div>
                  <div><p className="text-sm text-gray-400 mb-1">Email</p><p className="text-gray-800">{profile.email}</p></div>
                  <div><p className="text-sm text-gray-400 mb-1">Số điện thoại</p><p className="text-gray-800">{profile.phoneNumber || 'Chưa cập nhật'}</p></div>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Thông tin tài khoản</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Loại tài khoản</span><span className="text-gray-800">Student</span></div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Ngày tạo tài khoản</span><span className="text-gray-800">{new Date(profile.createdAt).toLocaleDateString('vi-VN')}</span></div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Lần đăng nhập cuối</span><span className="text-gray-800">{profile.lastLogin ? formatDateTime(profile.lastLogin) : 'Chưa có'}</span></div>
                <div className="flex items-center justify-between py-2"><span className="text-gray-500">Trạng thái tài khoản</span><span className="flex items-center gap-2 text-green-600"><span className="w-2 h-2 bg-green-500 rounded-full"></span>Active</span></div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Bảo mật</h3>
              <p className="text-gray-600 mb-4">Mật khẩu của bạn được bảo vệ bằng mã hóa. Hãy chọn mật khẩu mạnh và không chia sẻ với ai.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-4">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-sm text-amber-800">Mẹo: Sử dụng mật khẩu có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p>
              </div>
              <button onClick={() => setShowPasswordModal(true)} className="px-5 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">Đổi mật khẩu</button>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Bảo mật</h3>
                <button onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-5">
                <p className="text-gray-600 text-sm mb-4">Mật khẩu của bạn được bảo vệ bằng mã hóa. Hãy chọn mật khẩu mạnh và không chia sẻ với ai.</p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 mb-5">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <p className="text-xs text-amber-800">Mẹo: Sử dụng mật khẩu có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p>
                </div>
                {passwordError && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm mb-4">{passwordError}</div>}
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <input type={showPassword.current ? 'text' : 'password'} value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
                      <button type="button" onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPassword.current ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Mật khẩu mới</label>
                    <div className="relative">
                      <input type={showPassword.new ? 'text' : 'password'} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
                      <button type="button" onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPassword.new ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                      <input type={showPassword.confirm ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
                      <button type="button" onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPassword.confirm ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => { setShowPasswordModal(false); setPasswordError(''); }} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">Hủy</button>
                    <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">Đổi mật khẩu</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
