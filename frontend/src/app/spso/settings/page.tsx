"use client";

import { useState, useEffect } from "react";
import { systemSettingsService, SystemSettingsResponse, SemesterDTO } from "@/services/systemSettingsService";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "semesters">("general");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await systemSettingsService.getAllSettings();
      setSettings(data);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Không thể tải cấu hình hệ thống</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-gray-600 mt-1">Quản lý cấu hình hệ thống in ấn</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "general"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Cấu hình chung
            </button>
            <button
              onClick={() => setActiveTab("semesters")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "semesters"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Quản lý học kỳ
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "general" && <GeneralSettingsTab settings={settings} onUpdate={loadSettings} />}
        {activeTab === "semesters" && <SemestersTab settings={settings} onUpdate={loadSettings} />}
      </div>
    </div>
  );
}

// General Settings Component
interface GeneralSettingsTabProps {
  settings: SystemSettingsResponse | null;
  onUpdate: () => void;
}

function GeneralSettingsTab({ settings, onUpdate }: GeneralSettingsTabProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const availableFileTypes = [
    { ext: "pdf", label: "PDF" },
    { ext: "doc", label: "DOC" },
    { ext: "docx", label: "DOCX" },
    { ext: "ppt", label: "PPT" },
    { ext: "pptx", label: "PPTX" },
    { ext: "xls", label: "XLS" },
    { ext: "xlsx", label: "XLSX" },
    { ext: "txt", label: "TXT" },
  ];

  useEffect(() => {
    if (!settings) return;
    
    const data: Record<string, string> = {};
    Object.entries(settings.configs).forEach(([key, config]: [string, { configValue: string }]) => {
      data[key] = config.configValue;
    });
    setFormData(data);

    // Parse file extensions
    const extensions = data.allowed_file_extensions?.split(",") || [];
    setFileTypes(extensions);
  }, [settings]);

  const handleFileTypeToggle = (ext: string) => {
    setFileTypes((prev) => {
      if (prev.includes(ext)) {
        return prev.filter((e) => e !== ext);
      } else {
        return [...prev, ext];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate: Phải chọn ít nhất 1 định dạng file
      if (fileTypes.length === 0) {
        alert("Vui lòng chọn ít nhất 1 định dạng file cho phép!");
        setSaving(false);
        return;
      }
      
      // Update file extensions
      const updatedFormData = {
        ...formData,
        allowed_file_extensions: fileTypes.join(","),
      };

      await systemSettingsService.updateMultipleConfigs(updatedFormData, "SPSO001");
      alert("Cập nhật cấu hình thành công!");
      onUpdate();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      // Hiển thị error message chi tiết từ server
      const errorMessage = error?.response?.data?.message || error?.message || "Lỗi khi cập nhật cấu hình";
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cấu hình sinh viên */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Cấu hình sinh viên</h2>
            <p className="text-sm text-gray-600">Cài đặt liên quan đến sinh viên và trang in</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số trang A4 mặc định mỗi học kỳ
            </label>
            <input
              type="number"
              value={formData.default_a4_pages_per_semester || ""}
              onChange={(e) => setFormData({ ...formData, default_a4_pages_per_semester: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Số trang sinh viên nhận được đầu mỗi học kỳ</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá mỗi trang A4 (VND)
            </label>
            <input
              type="number"
              value={formData.a4_price_per_page || ""}
              onChange={(e) => setFormData({ ...formData, a4_price_per_page: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Giá khi sinh viên mua thêm trang</p>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.auto_allocate_pages === "true"}
                onChange={(e) => setFormData({ ...formData, auto_allocate_pages: e.target.checked ? "true" : "false" })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Tự động cấp trang đầu học kỳ</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">Hệ thống sẽ tự động cấp trang cho sinh viên khi bắt đầu học kỳ mới</p>
          </div>
        </div>
      </div>

      {/* Cấu hình file */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Cấu hình file</h2>
            <p className="text-sm text-gray-600">Cài đặt liên quan đến tài liệu upload</p>
          </div>
        </div>

        <div className="space-y-6 ml-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kích thước file tối đa (MB)
            </label>
            <input
              type="number"
              value={formData.max_file_size_mb || ""}
              onChange={(e) => setFormData({ ...formData, max_file_size_mb: e.target.value })}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="100"
            />
            <p className="text-xs text-gray-500 mt-1">Giới hạn dung lượng file sinh viên có thể upload</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Định dạng file cho phép
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableFileTypes.map((type) => (
                <label
                  key={type.ext}
                  className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    fileTypes.includes(type.ext)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={fileTypes.includes(type.ext)}
                    onChange={() => handleFileTypeToggle(type.ext)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">.{type.ext}</span>
                  <span className="text-xs text-gray-500">({type.label})</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Chọn các định dạng file sinh viên được phép upload</p>
          </div>
        </div>
      </div>

      {/* Cấu hình hệ thống */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Cấu hình hệ thống</h2>
            <p className="text-sm text-gray-600">Cài đặt chung của hệ thống</p>
          </div>
        </div>

        <div className="ml-4">
          <label className="flex items-center gap-2 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={formData.system_maintenance_mode === "true"}
              onChange={(e) => setFormData({ ...formData, system_maintenance_mode: e.target.checked ? "true" : "false" })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Chế độ bảo trì hệ thống</span>
              <p className="text-xs text-gray-500 mt-1">Khi bật, sinh viên sẽ không thể sử dụng hệ thống</p>
            </div>
            {formData.system_maintenance_mode === "true" && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">Đang bảo trì</span>
            )}
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang lưu...
            </span>
          ) : (
            "Lưu cấu hình"
          )}
        </button>
      </div>
    </div>
  );
}

// Semesters Tab Component
interface SemestersTabProps {
  settings: SystemSettingsResponse;
  onUpdate: () => void;
}

function SemestersTab({ settings, onUpdate }: SemestersTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<SemesterDTO | null>(null);

  // Check if semester is current based on dates
  const isCurrentSemester = (semester: SemesterDTO): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const startDate = new Date(semester.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(semester.endDate);
    endDate.setHours(0, 0, 0, 0);
    
    return today >= startDate && today <= endDate;
  };

  // Get semester status
  const getSemesterStatus = (semester: SemesterDTO): { label: string; color: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(semester.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(semester.endDate);
    endDate.setHours(0, 0, 0, 0);
    
    if (!semester.isActive) {
      return { label: 'Đã xóa', color: 'bg-gray-100 text-gray-800' };
    }
    
    if (today < startDate) {
      return { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800' };
    } else if (today >= startDate && today <= endDate) {
      return { label: 'Đang diễn ra', color: 'bg-green-100 text-green-800' };
    } else {
      return { label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-600' };
    }
  };

  const handleCreate = () => {
    setEditingSemester(null);
    setShowModal(true);
  };

  const handleEdit = (semester: SemesterDTO) => {
    setEditingSemester(semester);
    setShowModal(true);
  };

  const handleDelete = async (semesterId: number) => {
    if (!confirm("Bạn có chắc muốn xóa học kỳ này?")) return;
    
    try {
      await systemSettingsService.deleteSemester(semesterId);
      alert("Xóa học kỳ thành công!");
      onUpdate();
    } catch (error: any) {
      console.error("Error deleting semester:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Lỗi khi xóa học kỳ";
      alert(errorMessage);
    }
  };

  // Find current semester based on dates
  const currentSemester = settings.semesters.find(sem => isCurrentSemester(sem) && sem.isActive);

  return (
    <div className="space-y-6">
      {/* Current Semester Card */}
      {currentSemester && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Học kỳ hiện tại</p>
              <h3 className="text-2xl font-bold mt-1">{currentSemester.semesterName}</h3>
              <p className="text-sm opacity-90 mt-2">
                {currentSemester.startDate} - {currentSemester.endDate}
              </p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Semesters List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Danh sách học kỳ</h2>
              <p className="text-sm text-gray-600 mt-1">Quản lý tất cả các học kỳ trong hệ thống</p>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm học kỳ
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã học kỳ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên học kỳ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settings.semesters.map((semester: SemesterDTO) => {
                const isCurrent = isCurrentSemester(semester);
                const status = getSemesterStatus(semester);
                
                return (
                <tr key={semester.semesterId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-medium text-gray-900">{semester.semesterCode}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{semester.semesterName}</div>
                        <div className="text-xs text-gray-500">{semester.academicYear}</div>
                      </div>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full" title="Học kỳ hiện tại">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Hiện tại
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {semester.startDate} - {semester.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(semester)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      {/* Delete Button */}
                      {!isCurrent && semester.isActive && (
                        <button
                          onClick={() => handleDelete(semester.semesterId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <SemesterModal
          semester={editingSemester}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}

// Semester Modal Component
interface SemesterModalProps {
  semester: SemesterDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

function SemesterModal({ semester, onClose, onSuccess }: SemesterModalProps) {
  const [formData, setFormData] = useState({
    semesterCode: semester?.semesterCode || "",
    semesterName: semester?.semesterName || "",
    academicYear: semester?.academicYear || "",
    startDate: semester?.startDate || "",
    endDate: semester?.endDate || "",
    pageAllocationDate: semester?.pageAllocationDate || "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate semester code from semester name and academic year
  const generateSemesterCode = (semesterName: string, academicYear: string): string => {
    if (!semesterName || !academicYear || !/^\d{4}-\d{4}$/.test(academicYear)) {
      return "";
    }
    
    const startYear = academicYear.split('-')[0];
    const nameLower = semesterName.toLowerCase();
    
    // Detect semester number from name (check in specific order)
    let semesterNum = "";
    
    // Check for summer semester first (most specific)
    if (nameLower.includes("hè") || nameLower.includes("he") || nameLower.includes("summer") || nameLower.includes("hè")) {
      semesterNum = "3";
    }
    // Check for semester 2 (look for "kỳ 2", "kì 2", "semester 2", "ii")
    else if (
      /k[ỳì]\s*2/.test(nameLower) || 
      /semester\s*2/.test(nameLower) || 
      nameLower.includes(" ii") ||
      nameLower.endsWith("ii")
    ) {
      semesterNum = "2";
    }
    // Check for semester 1 (look for "kỳ 1", "kì 1", "semester 1", "i")
    else if (
      /k[ỳì]\s*1/.test(nameLower) || 
      /semester\s*1/.test(nameLower) ||
      nameLower.includes(" i") ||
      nameLower.endsWith("i")
    ) {
      semesterNum = "1";
    }
    // Default to 1 if can't detect
    else {
      semesterNum = "1";
    }
    
    return `HK${semesterNum}-${startYear}`;
  };

  // Update semester code when semester name or academic year changes
  const handleSemesterNameChange = (value: string) => {
    setFormData({ 
      ...formData, 
      semesterName: value,
      semesterCode: generateSemesterCode(value, formData.academicYear)
    });
    if (errors.semesterName) setErrors({ ...errors, semesterName: '' });
    if (errors.semesterCode) setErrors({ ...errors, semesterCode: '' });
  };

  // Update semester code when academic year changes
  const handleAcademicYearChange = (value: string) => {
    setFormData({ 
      ...formData, 
      academicYear: value,
      semesterCode: generateSemesterCode(formData.semesterName, value)
    });
    if (errors.academicYear) setErrors({ ...errors, academicYear: '' });
    if (errors.semesterCode) setErrors({ ...errors, semesterCode: '' });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate semester code (auto-generated, just check format)
    if (!formData.semesterCode.trim()) {
      newErrors.semesterCode = "Mã học kỳ không được để trống";
    } else if (!/^HK[1-3]-\d{4}$/i.test(formData.semesterCode)) {
      newErrors.semesterCode = "Mã học kỳ phải có định dạng HK[1-3]-YYYY (VD: HK1-2024, HK2-2024, HK3-2024)";
    }
    
    // Validate semester name
    if (!formData.semesterName.trim()) {
      newErrors.semesterName = "Tên học kỳ không được để trống";
    } else if (formData.semesterName.length < 5) {
      newErrors.semesterName = "Tên học kỳ phải có ít nhất 5 ký tự";
    }
    
    // Validate academic year
    if (!formData.academicYear.trim()) {
      newErrors.academicYear = "Năm học không được để trống";
    } else if (!/^\d{4}-\d{4}$/.test(formData.academicYear)) {
      newErrors.academicYear = "Năm học phải có định dạng YYYY-YYYY (VD: 2024-2025)";
    }
    
    // Validate dates
    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu không được để trống";
    }
    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc không được để trống";
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      // Check end date is after start date FIRST
      if (end <= start) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      } 
      // Only check duration if dates are valid
      else {
        const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        if (durationDays < 30) {
          newErrors.endDate = "Học kỳ phải kéo dài ít nhất 30 ngày";
        } else if (durationDays > 365) {
          newErrors.endDate = "Học kỳ không được dài quá 365 ngày";
        }
      }
    }
    
    // Validate page allocation date (if provided)
    if (formData.pageAllocationDate) {
      const allocDate = new Date(formData.pageAllocationDate);
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (allocDate < start || allocDate > end) {
        newErrors.pageAllocationDate = "Ngày cấp phát phải nằm trong khoảng thời gian học kỳ";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Auto-fill pageAllocationDate with startDate if empty
    const finalFormData = {
      ...formData,
      pageAllocationDate: formData.pageAllocationDate || formData.startDate
    };
    
    try {
      setSaving(true);
      setErrors({});
      
      if (semester) {
        // Update
        await systemSettingsService.updateSemester({
          semesterId: semester.semesterId,
          ...finalFormData,
          defaultA4Pages: 0, // Not used, will be read from SystemConfig
          updatedBy: "SPSO001",
        });
        alert("Cập nhật học kỳ thành công!");
      } else {
        // Create
        await systemSettingsService.createSemester({
          ...finalFormData,
          defaultA4Pages: 0, // Not used, will be read from SystemConfig
          createdBy: "SPSO001",
        });
        alert("Tạo học kỳ thành công!");
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving semester:", error);
      const errorMsg = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : error instanceof Error 
        ? error.message 
        : "Lỗi khi lưu học kỳ";
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {semester ? "Cập nhật học kỳ" : "Thêm học kỳ mới"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên học kỳ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.semesterName}
                onChange={(e) => handleSemesterNameChange(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.semesterName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="VD: Học kỳ 1 2024-2025, Học kỳ hè 2024-2025"
                required
              />
              {errors.semesterName && (
                <p className="mt-1 text-sm text-red-600">{errors.semesterName}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Mã học kỳ sẽ tự động tạo từ tên này</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => handleAcademicYearChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.academicYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="VD: 2024-2025"
                  required
                  disabled={!!semester}
                />
                {errors.academicYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.academicYear}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã học kỳ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.semesterCode}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                  placeholder="Tự động tạo"
                  disabled
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">HK1/2/3-năm (1: kỳ 1, 2: kỳ 2, 3: hè)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value });
                    if (errors.startDate) setErrors({ ...errors, startDate: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => {
                    setFormData({ ...formData, endDate: e.target.value });
                    if (errors.endDate) setErrors({ ...errors, endDate: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày cấp trang tự động
              </label>
              <input
                type="date"
                value={formData.pageAllocationDate}
                onChange={(e) => {
                  setFormData({ ...formData, pageAllocationDate: e.target.value });
                  if (errors.pageAllocationDate) setErrors({ ...errors, pageAllocationDate: '' });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.pageAllocationDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.pageAllocationDate && (
                <p className="mt-1 text-sm text-red-600">{errors.pageAllocationDate}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Scheduler sẽ tự động cấp phát trang vào ngày này (lúc 00:05). Để trống sẽ dùng ngày bắt đầu.
              </p>
            </div>

            {semester && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Trạng thái học kỳ</p>
                    <p className="text-xs text-gray-500 mt-1">Tự động tính dựa vào ngày hiện tại</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    (() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const start = new Date(formData.startDate);
                      start.setHours(0, 0, 0, 0);
                      const end = new Date(formData.endDate);
                      end.setHours(0, 0, 0, 0);
                      
                      if (today < start) return 'bg-blue-100 text-blue-800';
                      if (today >= start && today <= end) return 'bg-green-100 text-green-800';
                      return 'bg-gray-100 text-gray-600';
                    })()
                  }`}>
                    {(() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const start = new Date(formData.startDate);
                      start.setHours(0, 0, 0, 0);
                      const end = new Date(formData.endDate);
                      end.setHours(0, 0, 0, 0);
                      
                      if (today < start) return 'Sắp diễn ra';
                      if (today >= start && today <= end) return 'Đang diễn ra';
                      return 'Đã kết thúc';
                    })()}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-900">Học kỳ hiện tại</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Học kỳ có StartDate ≤ Hôm nay ≤ EndDate sẽ tự động được đánh dấu là học kỳ hiện tại
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
