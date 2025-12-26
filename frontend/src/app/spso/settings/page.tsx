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
function GeneralSettingsTab({ settings, onUpdate }: any) {
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
    const data: Record<string, string> = {};
    Object.entries(settings.configs).forEach(([key, config]: [string, any]) => {
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
      
      // Update file extensions
      const updatedFormData = {
        ...formData,
        allowed_file_extensions: fileTypes.join(","),
      };

      await systemSettingsService.updateMultipleConfigs(updatedFormData, "SPSO001");
      alert("Cập nhật cấu hình thành công!");
      onUpdate();
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Lỗi khi cập nhật cấu hình");
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
function SemestersTab({ settings, onUpdate }: any) {
  const [showModal, setShowModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<SemesterDTO | null>(null);

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
    } catch (error) {
      console.error("Error deleting semester:", error);
      alert("Lỗi khi xóa học kỳ");
    }
  };

  const handleSetCurrent = async (semesterId: number) => {
    try {
      await systemSettingsService.setCurrentSemester(semesterId, "SPSO001");
      alert("Đặt học kỳ hiện tại thành công!");
      onUpdate();
    } catch (error) {
      console.error("Error setting current semester:", error);
      alert("Lỗi khi đặt học kỳ hiện tại");
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Semester Card */}
      {settings.currentSemester && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Học kỳ hiện tại</p>
              <h3 className="text-2xl font-bold mt-1">{settings.currentSemester.semesterName}</h3>
              <p className="text-sm opacity-90 mt-2">
                {settings.currentSemester.startDate} - {settings.currentSemester.endDate}
              </p>
              <p className="text-sm opacity-90 mt-1">
                Cấp phát: {settings.currentSemester.defaultA4Pages} trang A4
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trang cấp phát</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settings.semesters.map((semester: SemesterDTO) => (
                <tr key={semester.semesterId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-medium text-gray-900">{semester.semesterCode}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{semester.semesterName}</div>
                    <div className="text-xs text-gray-500">{semester.academicYear}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {semester.startDate} - {semester.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {semester.defaultA4Pages} trang A4
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {semester.isCurrent && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Hiện tại
                        </span>
                      )}
                      {!semester.isActive && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                          Đã xóa
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(semester)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Sửa
                      </button>
                      {!semester.isCurrent && semester.isActive && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleSetCurrent(semester.semesterId)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Đặt hiện tại
                          </button>
                        </>
                      )}
                      {!semester.isCurrent && semester.isActive && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDelete(semester.semesterId)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
function SemesterModal({ semester, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    semesterCode: semester?.semesterCode || "",
    semesterName: semester?.semesterName || "",
    academicYear: semester?.academicYear || "",
    startDate: semester?.startDate || "",
    endDate: semester?.endDate || "",
    defaultA4Pages: semester?.defaultA4Pages || 100,
    pageAllocationDate: semester?.pageAllocationDate || "",
    isCurrent: semester?.isCurrent || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (semester) {
        // Update
        await systemSettingsService.updateSemester({
          semesterId: semester.semesterId,
          ...formData,
          updatedBy: "SPSO001",
        });
        alert("Cập nhật học kỳ thành công!");
      } else {
        // Create
        await systemSettingsService.createSemester({
          ...formData,
          createdBy: "SPSO001",
        });
        alert("Tạo học kỳ thành công!");
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Error saving semester:", error);
      alert(error.response?.data?.message || "Lỗi khi lưu học kỳ");
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã học kỳ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.semesterCode}
                  onChange={(e) => setFormData({ ...formData, semesterCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: HK1-2025"
                  required
                  disabled={!!semester}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: 2024-2025"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên học kỳ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.semesterName}
                onChange={(e) => setFormData({ ...formData, semesterName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: Học kỳ 1 năm 2024-2025"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số trang A4 cấp phát <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.defaultA4Pages}
                  onChange={(e) => setFormData({ ...formData, defaultA4Pages: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày cấp trang tự động
                </label>
                <input
                  type="date"
                  value={formData.pageAllocationDate}
                  onChange={(e) => setFormData({ ...formData, pageAllocationDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCurrent}
                  onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Đặt làm học kỳ hiện tại</span>
              </label>
              <p className="text-xs text-gray-600 mt-2 ml-6">
                Chỉ có một học kỳ được đánh dấu là hiện tại. Học kỳ cũ sẽ tự động bỏ đánh dấu.
              </p>
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
