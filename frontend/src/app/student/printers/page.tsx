'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { printerService } from '@/services/printerService';
import { referenceService, Brand, PrinterModel, Campus, Building, Room } from '@/services/referenceService';
import { Printer, PrinterFilters } from '@/types/printer';
import StudentLayout from '@/components/StudentLayout';

export const dynamic = 'force-dynamic';

export default function PrinterSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('documentId');
  const documentIds = searchParams.get('documentIds');

  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Reference data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<PrinterModel[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Selected values (IDs for reference data)
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedCampusId, setSelectedCampusId] = useState<number | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  
  // Filter values (names to send to API)
  const [keyword, setKeyword] = useState<string>('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  // Derive filters from selected IDs using useMemo for stability
  const filters = useMemo<PrinterFilters>(() => {
    const selectedBrand = selectedBrandId && brands.length > 0
      ? brands.find(b => b.brandId === selectedBrandId)?.brandName 
      : undefined;
    const selectedModel = selectedModelId && models.length > 0
      ? models.find(m => m.modelId === selectedModelId)?.modelName 
      : undefined;
    const selectedCampus = selectedCampusId && campuses.length > 0
      ? campuses.find(c => c.campusId === selectedCampusId)?.campusName 
      : undefined;
    const selectedBuilding = selectedBuildingId && buildings.length > 0
      ? buildings.find(b => b.buildingId === selectedBuildingId)?.buildingCode 
      : undefined;
    const selectedRoom = selectedRoomId && rooms.length > 0
      ? rooms.find(r => r.roomId === selectedRoomId)?.roomNumber 
      : undefined;
    
    return {
      brand: selectedBrand,
      model: selectedModel,
      campus: selectedCampus,
      building: selectedBuilding,
      room: selectedRoom,
      status: showAvailableOnly ? 'Active' : undefined,
      keyword: keyword || undefined,
    };
  }, [selectedBrandId, selectedModelId, selectedCampusId, selectedBuildingId, selectedRoomId, showAvailableOnly, keyword, brands, models, campuses, buildings, rooms]);

  // Load reference data on mount
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [brandsData, campusesData] = await Promise.all([
          referenceService.getBrands(),
          referenceService.getCampuses(),
        ]);
        console.log('Brands loaded:', brandsData);
        console.log('Campuses loaded:', campusesData);
        setBrands(brandsData);
        setCampuses(campusesData);
      } catch (err) {
        console.error('Failed to load reference data:', err);
      }
    };
    loadReferenceData();
  }, []);

  // Load models when brand changes
  useEffect(() => {
    if (selectedBrandId) {
      referenceService.getModelsByBrand(selectedBrandId)
        .then(setModels)
        .catch(err => console.error('Failed to load models:', err));
    } else {
      setModels([]);
      setSelectedModelId(null);
    }
  }, [selectedBrandId]);

  // Load buildings when campus changes and clear dependent selections
  useEffect(() => {
    if (selectedCampusId) {
      referenceService.getBuildingsByCampus(selectedCampusId)
        .then(setBuildings)
        .catch(err => console.error('Failed to load buildings:', err));
    } else {
      setBuildings([]);
      setSelectedBuildingId(null);
      setRooms([]);
      setSelectedRoomId(null);
    }
  }, [selectedCampusId]);

  // Load rooms when building changes and clear room selection
  useEffect(() => {
    if (selectedBuildingId) {
      referenceService.getRoomsByBuilding(selectedBuildingId)
        .then(setRooms)
        .catch(err => console.error('Failed to load rooms:', err));
    } else {
      setRooms([]);
      setSelectedRoomId(null);
    }
  }, [selectedBuildingId]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

  // Fetch printers
  const fetchPrinters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await printerService.getPrinters(filters, currentPage, 8);
      setPrinters(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách máy in');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchPrinters();
  }, [fetchPrinters]);

  // Select printer
  const handleSelectPrinter = (printerId: number) => {
    if (!documentId && !documentIds) {
      alert('Vui lòng chọn tài liệu trước');
      router.push('/student/print-document');
      return;
    }
    
    // Navigate to print configuration with selected printer
    if (documentIds) {
      // Multiple documents
      router.push(`/student/print/configure?documentIds=${documentIds}&printerId=${printerId}`);
    } else {
      // Single document
      router.push(`/student/print/configure?documentId=${documentId}&printerId=${printerId}`);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Chọn máy in</h1>
            <p className="text-sm text-gray-500 mt-0.5">Chọn máy in phù hợp với nhu cầu của bạn</p>
          </div>
        </div>

        {/* Filters (blue subtle) */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
          {/* Row 1: Location filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {/* Campus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cơ sở</label>
              <select
                value={selectedCampusId || ''}
                onChange={(e) => setSelectedCampusId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Tất cả</option>
                {campuses.map(campus => (
                  <option key={campus.campusId} value={campus.campusId}>{campus.campusName}</option>
                ))}
              </select>
            </div>

            {/* Building */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tòa nhà</label>
              <select
                value={selectedBuildingId || ''}
                onChange={(e) => setSelectedBuildingId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={!selectedCampusId}
              >
                <option value="">Tất cả</option>
                {buildings.map(building => (
                  <option key={building.buildingId} value={building.buildingId}>{building.buildingCode}</option>
                ))}
              </select>
            </div>

            {/* Room */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phòng</label>
              <select
                value={selectedRoomId || ''}
                onChange={(e) => setSelectedRoomId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={!selectedBuildingId}
              >
                <option value="">Tất cả</option>
                {rooms.map(room => (
                  <option key={room.roomId} value={room.roomId}>{room.roomNumber}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Printer filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hãng</label>
              <select
                value={selectedBrandId || ''}
                onChange={(e) => setSelectedBrandId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Tất cả</option>
                {brands.map(brand => (
                  <option key={brand.brandId} value={brand.brandId}>{brand.brandName}</option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <select
                value={selectedModelId || ''}
                onChange={(e) => setSelectedModelId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={!selectedBrandId}
              >
                <option value="">Tất cả</option>
                {models.map(model => (
                  <option key={model.modelId} value={model.modelId}>{model.modelName}</option>
                ))}
              </select>
            </div>

            {/* Keyword */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tên máy in..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Available Toggle - Separate row */}
          <div className="mt-2">
            <label className="inline-flex items-center gap-2 px-2 py-1 border border-blue-200 rounded-lg bg-blue-50 cursor-pointer hover:bg-blue-100 transition text-sm">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Chỉ hiển thị máy khả dụng</span>
            </label>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Đang tải...</p>
          </div>
        )}

        {/* Printer cards grid */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {printers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <p className="text-gray-500 mt-4">Không có máy in nào khả dụng</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {printers.map((printer) => (
                  <div
                    key={printer.printerId}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition duration-150 ease-out flex flex-col relative"
                    style={{ minHeight: '260px' }}
                  >
                    {/* Status badge - Fixed position top right */}
                    <div className="absolute top-4 right-4">
                      {printer.status === 'Active' && (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center" title="Khả dụng">
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {printer.status === 'Inactive' && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" title="Tắt">
                          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </div>
                      )}
                      {printer.status === 'Maintenance' && (
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center" title="Bảo trì">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      )}
                      {printer.status === 'Error' && (
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center" title="Lỗi">
                          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Printer name and model - Top left */}
                    <div className="mb-3 pr-12">
                      <div className="flex items-start gap-2 mb-1">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 break-words text-base">{printer.printerName}</h3>
                          <p className="text-xs text-gray-500 break-words">{printer.brand} {printer.model}</p>
                        </div>
                      </div>
                    </div>

                    {/* Spacer - Push content to bottom */}
                    <div className="flex-grow"></div>

                    {/* Location - Fixed position from bottom */}
                    <div className="mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="break-words">{printer.campus} - {printer.building} - {printer.roomNumber}</span>
                      </div>
                    </div>

                    {/* Features - Fixed position from bottom */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {printer.paperSizes?.split(',').map(size => (
                        <span key={size} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {size.trim()}
                        </span>
                      ))}
                      {printer.colorPrinting && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                          Màu
                        </span>
                      )}
                      {printer.duplexPrinting && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          2 mặt
                        </span>
                      )}
                    </div>

                    {/* Select button */}
                    <button
                      onClick={() => handleSelectPrinter(printer.printerId)}
                      disabled={printer.status !== 'Active'}
                      className={`w-full py-2 rounded-lg font-medium transition-all ${
                        printer.status === 'Active'
                          ? 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {printer.status === 'Active' ? 'Chọn máy in này' : 'Không khả dụng'}
                    </button>
                  </div>
                ))}
              </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white rounded-lg border border-gray-200 px-4 py-3">
                <div className="text-sm text-gray-600">
                  Hiển thị {printers.length} / {totalElements} máy in
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-1">
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
              </>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
