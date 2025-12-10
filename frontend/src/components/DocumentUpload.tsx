/**
 * DOCUMENT UPLOAD COMPONENT
 * Cho phép user chọn nhiều file từ thiết bị và upload lên backend
 * Hỗ trợ: PDF, DOCX, PPTX, XLSX (max 50MB mỗi file)
 */

'use client';

import { useState, useRef } from 'react';
import { documentService } from '@/services/documentService';

interface DocumentUploadProps {
  onUploadSuccess?: (documentId: number, fileName: string) => void;
  onUploadError?: (error: string) => void;
  onUploadStart?: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  documentId?: number;
}

export default function DocumentUpload({
  onUploadSuccess,
  onUploadError,
  onUploadStart,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Bật file picker khi click button
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    const allowedExtensions = ['.pdf', '.docx', '.pptx', '.xlsx'];
    const fileName = file.name.toLowerCase();
    const isValidType = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      return 'Chỉ hỗ trợ file PDF, DOCX, PPTX, XLSX';
    }

    if (file.size > 50 * 1024 * 1024) {
      return 'File quá lớn. Tối đa 50MB';
    }

    return null;
  };

  // Xử lý khi user chọn file
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files));
    }
  };

  // Thêm files vào danh sách
  const addFiles = (files: File[]) => {
    const newFiles: UploadingFile[] = files.map(file => {
      const error = validateFile(file);
      return {
        file,
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined,
      };
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  // Xử lý kéo thả file
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files));
    }
  };

  // Xóa file khỏi danh sách
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload từng file
  const uploadFile = async (fileItem: UploadingFile, index: number) => {
    setSelectedFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, status: 'uploading', progress: 0 } : item
    ));

    try {
      const result = await documentService.uploadDocument(
        { file: fileItem.file },
        (progress) => {
          setSelectedFiles(prev => prev.map((item, i) => 
            i === index ? { ...item, progress } : item
          ));
        }
      );

      setSelectedFiles(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'success', progress: 100, documentId: result.id } : item
      ));

      onUploadSuccess?.(result.id, result.fileName);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload thất bại';
      setSelectedFiles(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'error', error: errorMsg } : item
      ));
      onUploadError?.(errorMsg);
    }
  };

  // Upload tất cả file
  const handleUploadAll = async () => {
    const pendingFiles = selectedFiles.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    onUploadStart?.();

    for (let i = 0; i < selectedFiles.length; i++) {
      if (selectedFiles[i].status === 'pending') {
        await uploadFile(selectedFiles[i], i);
      }
    }

    setIsUploading(false);
  };

  // Reset tất cả
  const handleReset = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Tải Tài Liệu Lên</h2>

      {/* File Input (Hidden) - cho phép chọn nhiều file */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.pptx,.xlsx"
        onChange={handleFileSelect}
        className="hidden"
        multiple
        disabled={isUploading}
      />

      {/* File Selection Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          isDragging 
            ? 'border-blue-500 bg-blue-100' 
            : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
        }`}
        onClick={handleBrowseClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-gray-700 font-medium">
            <span className="text-blue-600">Nhấp để chọn file</span> hoặc kéo thả vào đây
          </p>
          <p className="text-sm text-gray-500">
            Hỗ trợ: PDF, DOCX, PPTX, XLSX • Tối đa 50MB/file • Có thể chọn nhiều file
          </p>
        </div>
      </div>

      {/* File List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Danh sách file ({selectedFiles.length})
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-red-600 hover:text-red-800"
              disabled={isUploading}
            >
              Xóa tất cả
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedFiles.map((fileItem, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {/* File Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                  fileItem.file.name.endsWith('.pdf') ? 'bg-red-100 text-red-700' :
                  fileItem.file.name.endsWith('.docx') ? 'bg-blue-100 text-blue-700' :
                  fileItem.file.name.endsWith('.xlsx') ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {fileItem.file.name.split('.').pop()?.toUpperCase()}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  
                  {/* Progress Bar */}
                  {fileItem.status === 'uploading' && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${fileItem.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {fileItem.error && (
                    <p className="text-xs text-red-600 mt-1">{fileItem.error}</p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {fileItem.status === 'pending' && (
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-600"
                      disabled={isUploading}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {fileItem.status === 'uploading' && (
                    <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  )}
                  {fileItem.status === 'success' && (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {fileItem.status === 'error' && (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUploadAll}
            disabled={isUploading || selectedFiles.every(f => f.status !== 'pending')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Đang tải lên...' : `Tải lên ${selectedFiles.filter(f => f.status === 'pending').length} file`}
          </button>
        </div>
      )}
    </div>
  );
}
