/**
 * DOCUMENT UPLOAD COMPONENT
 * Cho phép user chọn file từ thiết bị và upload lên backend
 * Hỗ trợ: PDF, DOCX, PPTX, XLSX (max 50MB)
 */

'use client';

import { useState, useRef } from 'react';
import { documentService } from '@/services/documentService';

interface DocumentUploadProps {
  onUploadSuccess?: (documentId: number, fileName: string) => void;
  onUploadError?: (error: string) => void;
  onUploadStart?: () => void;
}

export default function DocumentUpload({
  onUploadSuccess,
  onUploadError,
  onUploadStart,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Bật file picker khi click button
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Xử lý khi user chọn file
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  // Xử lý upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn một file');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
    onUploadStart?.();

    try {
      const result = await documentService.uploadDocument(
        {
          file: selectedFile,
          description: description || undefined,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setSuccess(`✓ Upload thành công: ${result.fileName}`);
      setSelectedFile(null);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadSuccess?.(result.id, result.fileName);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload thất bại';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setDescription('');
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Tải Tài Liệu Lên</h2>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.pptx,.xlsx"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      {/* File Selection Area */}
      <div
        className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition"
        onClick={handleBrowseClick}
      >
        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-12 h-12 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="text-gray-700 font-medium">
            {selectedFile ? (
              <>
                <span className="text-green-600">✓ Đã chọn: </span>
                {selectedFile.name}
              </>
            ) : (
              <>
                <span className="text-blue-600">Nhấp để chọn file</span>
                <br />
                <span className="text-sm text-gray-600">
                  hoặc kéo thả file (PDF, DOCX, PPTX, XLSX - Max 50MB)
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* File Info */}
      {selectedFile && (
        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
          <p>
            <strong>Tên file:</strong> {selectedFile.name}
          </p>
          <p>
            <strong>Kích thước:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả (Tùy chọn)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả cho tài liệu này..."
          disabled={isLoading}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* Progress Bar */}
      {isLoading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Đang tải lên...</span>
            <span className="font-semibold text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">❌ Lỗi</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          {isLoading ? `Đang tải (${uploadProgress}%)` : 'Tải Lên'}
        </button>
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
        >
          Xóa
        </button>
      </div>

      {/* Info */}
      <p className="text-xs text-gray-600 text-center">
        Hỗ trợ: PDF, DOCX, PPTX, XLSX | Tối đa 50MB
      </p>
    </div>
  );
}
