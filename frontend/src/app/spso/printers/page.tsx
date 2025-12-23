'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { printerService } from '@/services/printerService';
import { referenceService } from '@/services/referenceService';
import { Printer, PrinterFilters } from '@/types/printer';

export default function PrinterManagementPage() {
  // State management
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  
  // Filters
  const [filters, setFilters] = useState<PrinterFilters>({});
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Reference data
  const [brands, setBrands] = useState<Array<{ brandId: number; brandName: string }>>([]);
  const [campuses, setCampuses] = useState<Array<{ campusId: number; campusName: string }>>([]);
  const [buildings, setBuildings] = useState<Array<{ buildingId: number; buildingName: string; campusId: number; buildingCode: string }>>([]);
  const [models, setModels] = useState<Array<{ modelId: number; modelName: string }>>([]);
  const [rooms, setRooms] = useState<Array<{ roomId: number; roomNumber: string; buildingId: number }>>([]);
  
  // Selected filter IDs
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedCampusId, setSelectedCampusId] = useState<number | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToggleConfirmModal, setShowToggleConfirmModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkToggleModal, setShowBulkToggleModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Refill form state
  const [refillData, setRefillData] = useState({
    a4Paper: false,
    a3Paper: false,
    tonerBlack: false,
    tonerCyan: false,
    tonerMagenta: false,
    tonerYellow: false,
  });
  
  // Form state
  const [formData, setFormData] = useState({
    printerName: '',
    brand: '',
    model: '',
    campus: '',
    building: '',
    roomNumber: '',
    ipAddress: '',
    paperSizes: 'A4',
    colorPrinting: false,
    duplexPrinting: false,
    status: 'Active',
    lastMaintenanceDate: '',
  });

  const resetForm = () => {
    setFormData({
      printerName: '',
      brand: '',
      model: '',
      campus: '',
      building: '',
      roomNumber: '',
      ipAddress: '',
      paperSizes: 'A4',
      colorPrinting: false,
      duplexPrinting: false,
      status: 'Active',
      lastMaintenanceDate: '',
    });
    setSelectedBrandId(null);
    setSelectedModelId(null);
    setSelectedCampusId(null);
    setSelectedBuildingId(null);
    setSelectedRoomId(null);
    setModels([]);
    setBuildings([]);
    setRooms([]);
  };

  // Load printers
  const loadPrinters = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await printerService.getPrinters(filters, currentPage, pageSize);
      setPrinters(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError((err as Error).message || 'Không thể tải danh sách máy in');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  // Load reference data
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

  useEffect(() => {
    loadPrinters();
  }, [loadPrinters]);

  // Clear selection when printers list changes (e.g., after reload)
  useEffect(() => {
    setSelectedIds(new Set());
  }, [printers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('button') && !target.closest('.fixed-menu')) {
          setOpenMenuId(null);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    if (openMenuId === null) setMenuPosition(null);
  }, [openMenuId]);

  const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    e.stopPropagation();
    const btn = e.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 192; // approx w-48
    let left = rect.right - menuWidth;
    if (left < 8) left = Math.max(8, rect.left);

    // Save anchor rect and provisional position; we'll measure actual menu height after mount
    setAnchorRect(rect);
    const provisionalTop = rect.bottom + 8 + window.scrollY;
    setMenuPosition({ top: provisionalTop, left: left + window.scrollX });
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  // After menu mounts, measure its height and adjust position so it sits snugly against the anchor
  React.useLayoutEffect(() => {
    if (!anchorRect || !menuRef.current || !menuPosition || openMenuId === null) return;
    const menuEl = menuRef.current;
    const menuHeight = menuEl.offsetHeight;
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    let top: number;
    if (spaceBelow < menuHeight + 8) {
      // place above anchor
      top = anchorRect.top + window.scrollY - menuHeight - 8;
      if (top < 8) top = 8;
    } else {
      // place below anchor
      top = anchorRect.bottom + window.scrollY + 8;
    }
    // Only update if difference is noticeable
    if (Math.abs(top - menuPosition.top) > 2) {
      setMenuPosition({ top, left: menuPosition.left });
    }
  }, [anchorRect, openMenuId, menuPosition]);

  // Load edit form data when opening edit modal - set initial campus and brands
  useEffect(() => {
    if (showEditModal && selectedPrinter && brands.length > 0 && campuses.length > 0) {
      const loadEditData = async () => {
        try {
          console.log('Loading edit data for printer:', selectedPrinter);
          console.log('Available brands:', brands);
          console.log('Available campuses:', campuses);

          // Fetch fresh printer details from backend (ensures ipAddress and other fields present)
          let source = selectedPrinter;
          try {
            const details = await printerService.getPrinterById(String(selectedPrinter.printerId));
            console.log('Printer details from API:', details);
            if (details) source = details;
          } catch {
            console.warn('Failed to fetch printer details, falling back to list data');
          }

          // Format lastMaintenanceDate for input type="date" (YYYY-MM-DD)
          let formattedMaintenanceDate = '';
          if (source.lastMaintenanceDate) {
            const date = new Date(source.lastMaintenanceDate);
            if (!isNaN(date.getTime())) {
              formattedMaintenanceDate = date.toISOString().split('T')[0];
            }
          }

          console.log('IP Address:', source.ipAddress);
          console.log('Last Maintenance Date (raw):', source.lastMaintenanceDate);
          console.log('Last Maintenance Date (formatted):', formattedMaintenanceDate);

          // Initialize formData with printer values
          setFormData({
            printerName: source.printerName,
            brand: source.brand,
            model: source.model,
            campus: source.campus,
            building: source.building,
            roomNumber: source.roomNumber,
            ipAddress: source.ipAddress || '',
            paperSizes: source.paperSizes,
            colorPrinting: source.colorPrinting,
            duplexPrinting: source.duplexPrinting,
            status: source.status,
            lastMaintenanceDate: formattedMaintenanceDate,
          });

          console.log('FormData set with:', {
            ipAddress: source.ipAddress || '',
            lastMaintenanceDate: formattedMaintenanceDate,
            paperSizes: source.paperSizes,
            colorPrinting: source.colorPrinting,
            duplexPrinting: source.duplexPrinting,
          });

          // Set brand and model
          const brand = brands.find(b => b.brandName === source.brand);
          if (brand) {
            console.log('Found brand:', brand);
            setSelectedBrandId(brand.brandId);
            const modelsData = await referenceService.getModelsByBrand(brand.brandId);
            setModels(modelsData);
            const model = modelsData.find(m => m.modelName === source.model);
            if (model) {
              console.log('Found model:', model);
              setSelectedModelId(model.modelId);
            }
          } else {
            console.warn('Brand not found:', source.brand);
          }
          
          // Set campus and load buildings, then load rooms
          const campus = campuses.find(c => c.campusName === selectedPrinter.campus);
          if (campus) {
            console.log('Found campus:', campus);
            setSelectedCampusId(campus.campusId);
            
            // Load buildings for this campus
            const buildingsData = await referenceService.getBuildingsByCampus(campus.campusId);
            console.log('Loaded buildings:', buildingsData);
            console.log('Looking for building:', selectedPrinter.building);
            console.log('Available building codes:', buildingsData.map(b => b.buildingCode).join(', '));
            setBuildings(buildingsData);
            
            // Find and set building - compare with buildingCode (backend returns buildingCode, not buildingName)
            const building = buildingsData.find(b => 
              b.buildingCode.trim().toLowerCase() === selectedPrinter.building.trim().toLowerCase()
            );
            if (building) {
              console.log('Found building:', building);
              setSelectedBuildingId(building.buildingId);
              
              // Load rooms for this building
              const roomsData = await referenceService.getRoomsByBuilding(building.buildingId);
              console.log('Loaded rooms:', roomsData);
              console.log('Looking for room:', selectedPrinter.roomNumber);
              setRooms(roomsData);
              
              // Find and set room - use trim and case-insensitive comparison
              const room = roomsData.find(r => 
                r.roomNumber.trim().toLowerCase() === selectedPrinter.roomNumber.trim().toLowerCase()
              );
              if (room) {
                console.log('Found room:', room);
                setSelectedRoomId(room.roomId);
              } else {
                console.warn('Room not found:', selectedPrinter.roomNumber);
                console.warn('Available rooms:', roomsData.map(r => r.roomNumber));
              }
            } else {
              console.warn('Building not found:', selectedPrinter.building);
              console.warn('Available buildings:', buildingsData.map(b => b.buildingName));
            }
          } else {
            console.warn('Campus not found:', selectedPrinter.campus);
          }
        } catch (err) {
          console.error('Failed to load edit data:', err);
        }
      };
      
      loadEditData();
    }
  }, [showEditModal, selectedPrinter]);

  // Debug: Log state changes
  useEffect(() => {
    if (showEditModal) {
      console.log('Edit Modal State:');
      console.log('- selectedCampusId:', selectedCampusId);
      console.log('- selectedBuildingId:', selectedBuildingId);
      console.log('- selectedRoomId:', selectedRoomId);
      console.log('- buildings length:', buildings.length);
      console.log('- rooms length:', rooms.length);
    }
  }, [showEditModal, selectedCampusId, selectedBuildingId, selectedRoomId, buildings, rooms]);

  // Filtered buildings based on selected campus
  const filteredBuildings = useMemo(() => {
    if (!selectedCampusId) return [];
    return buildings.filter(b => b.campusId === selectedCampusId);
  }, [buildings, selectedCampusId]);

  // Handle filter change
  const handleFilterChange = (key: keyof PrinterFilters, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0);
  };

  // Handle brand change
  const handleBrandChange = (brandId: string) => {
    (async () => {
      const id = brandId ? Number(brandId) : null;
      setSelectedBrandId(id);
      setSelectedModelId(null);
      const brand = brands.find(b => b.brandId === id);
      handleFilterChange('brand', brand?.brandName);
      if (id) {
        try {
          const modelsData = await referenceService.getModelsByBrand(id);
          setModels(modelsData);
        } catch (err) {
          console.error('Failed to load models for filter:', err);
          setModels([]);
        }
      } else {
        setModels([]);
      }
      setCurrentPage(0);
    })();
  };

  // Handle campus change
  const handleCampusChange = async (campusId: string) => {
    const id = campusId ? Number(campusId) : null;
    setSelectedCampusId(id);
    setSelectedBuildingId(null);
    const campus = campuses.find(c => c.campusId === id);
    setFilters(prev => ({ 
      ...prev, 
      campus: campus?.campusName,
      building: undefined,
    }));
    setCurrentPage(0);
    
    // Load buildings for selected campus
    if (id) {
      try {
        const buildingsData = await referenceService.getBuildingsByCampus(id);
        setBuildings(buildingsData);
      } catch (err) {
        console.error('Failed to load buildings:', err);
        setBuildings([]);
      }
    } else {
      setBuildings([]);
    }
  };

  // Handle building change
  const handleBuildingChange = (buildingId: string) => {
    (async () => {
      const id = buildingId ? Number(buildingId) : null;
      setSelectedBuildingId(id);
      setSelectedRoomId(null);
      const building = buildings.find(b => b.buildingId === id);
      // Backend filters by buildingCode; use code to avoid UTF-8 display issues
      handleFilterChange('building', building?.buildingCode);
      if (id) {
        try {
          const roomsData = await referenceService.getRoomsByBuilding(id);
          setRooms(roomsData);
        } catch (err) {
          console.error('Failed to load rooms for filter:', err);
          setRooms([]);
        }
      } else {
        setRooms([]);
      }
      setCurrentPage(0);
    })();
  };

  const handleModelChange = (modelId: string) => {
    const id = modelId ? Number(modelId) : null;
    setSelectedModelId(id);
    const model = models.find(m => m.modelId === id);
    handleFilterChange('model', model?.modelName);
    setCurrentPage(0);
  };

  const handleRoomChange = (roomId: string) => {
    const id = roomId ? Number(roomId) : null;
    setSelectedRoomId(id);
    const room = rooms.find(r => r.roomId === id);
    // Backend expects `room` param that matches roomNumber
    handleFilterChange('room', room?.roomNumber);
    setCurrentPage(0);
  };

  // Handle search
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, keyword: searchKeyword }));
    setCurrentPage(0);
  };

  // Handle add printer
  const handleAddPrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate IDs are selected
    if (!selectedBrandId || !selectedModelId || !selectedRoomId) {
      alert('Vui lòng chọn đầy đủ thông tin: Thương hiệu, Model và Phòng');
      return;
    }
    
    try {
      setLoading(true);
      await printerService.addPrinter({
        printerName: formData.printerName,
        brandId: selectedBrandId,
        modelId: selectedModelId,
        roomId: selectedRoomId,
          ipAddress: formData.ipAddress || undefined,
          paperSizes: formData.paperSizes,
          lastMaintenanceDate: formData.lastMaintenanceDate || undefined,
        colorPrinting: formData.colorPrinting,
        duplexPrinting: formData.duplexPrinting,
      });
      setShowAddModal(false);
      resetForm();
      loadPrinters();
      alert('Thêm máy in thành công!');
    } catch (err) {
      alert((err as Error).message || 'Thêm máy in thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit printer
  const handleEditPrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrinter) return;
    
    // Validate IDs are selected
    if (!selectedBrandId || !selectedModelId || !selectedRoomId) {
      alert('Vui lòng chọn đầy đủ thông tin: Thương hiệu, Model và Phòng');
      return;
    }
    
    try {
      setLoading(true);
      await printerService.updatePrinter(selectedPrinter.printerId, {
        printerName: formData.printerName,
        brandId: selectedBrandId,
        modelId: selectedModelId,
        roomId: selectedRoomId,
          ipAddress: formData.ipAddress || undefined,
        paperSizes: formData.paperSizes,
        colorPrinting: formData.colorPrinting,
        duplexPrinting: formData.duplexPrinting,
        status: formData.status,
        lastMaintenanceDate: formData.lastMaintenanceDate,
      });
      setShowEditModal(false);
      resetForm();
      setSelectedPrinter(null);
      loadPrinters();
      alert('Cập nhật máy in thành công!');
    } catch (err) {
      alert((err as Error).message || 'Cập nhật máy in thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Get status badge color
  const handleDeletePrinter = async () => {
    if (!selectedPrinter) return;
    try {
      setLoading(true);
      await printerService.deletePrinter(selectedPrinter.printerId);
      setShowDeleteModal(false);
      setSelectedPrinter(null);
      loadPrinters();
      alert('Xóa máy in thành công!');
    } catch (err) {
      alert((err as Error).message || 'Xóa máy in thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      Maintenance: 'bg-yellow-100 text-yellow-800',
      Error: 'bg-red-100 text-red-800',
      OutOfPaper: 'bg-orange-100 text-orange-800',
      OutOfToner: 'bg-orange-100 text-orange-800',
      OutOfBoth: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      Active: 'Đang hoạt động',
      Inactive: 'Không hoạt động',
      Maintenance: 'Bảo trì',
      Error: 'Lỗi',
      OutOfPaper: 'Hết giấy',
      OutOfToner: 'Hết mực',
      OutOfBoth: 'Hết giấy và mực',
    };
    return labels[status] || status;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Quản lý Máy in</h1>
      </div>

      {/* Add Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm Máy In
        </button>
      </div>

      {/* bulk actions moved above the table (see Results Count area) */}

      {/* Filters (compact) */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg shadow-sm p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nhập tên, ID, thương hiệu..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Campus */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cơ sở</label>
            <select
              value={selectedCampusId || ''}
              onChange={(e) => handleCampusChange(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              {campuses.map(campus => (
                <option key={campus.campusId} value={campus.campusId}>
                {campus.campusName}
                </option>
              ))}
            </select>
          </div>

          {/* Building */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tòa nhà</label>
            <select
              value={selectedBuildingId || ''}
              onChange={(e) => handleBuildingChange(e.target.value)}
              disabled={!selectedCampusId}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Tất cả</option>
              {filteredBuildings.map(building => (
                <option key={building.buildingId} value={building.buildingId}>
                  {building.buildingCode} - {building.buildingName}
                </option>
              ))}
            </select>
          </div>

          {/* Room (moved) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phòng</label>
            <select
              value={selectedRoomId || ''}
              onChange={(e) => handleRoomChange(e.target.value)}
              disabled={!selectedBuildingId}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Tất cả</option>
              {rooms.map(room => (
                <option key={room.roomId} value={room.roomId}>{room.roomNumber}</option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Thương hiệu</label>
            <select
              value={selectedBrandId || ''}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              {brands.map(brand => (
                <option key={brand.brandId} value={brand.brandId}>
                {brand.brandName}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Mẫu mã</label>
            <select
              value={selectedModelId || ''}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={!selectedBrandId}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Tất cả</option>
              {models.map(model => (
                <option key={model.modelId} value={model.modelId}>{model.modelName}</option>
              ))}
            </select>
          </div>

          {/* Maintenance Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ngày bảo trì</label>
            <input
              type="date"
              value={filters.lastMaintenanceDate || ''}
              onChange={(e) => handleFilterChange('lastMaintenanceDate', e.target.value || undefined)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status (moved) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="Active">Đang hoạt động</option>
              <option value="Inactive">Không hoạt động</option>
              <option value="Maintenance">Bảo trì</option>
              <option value="Error">Lỗi</option>
              <option value="OutOfPaper">Hết giấy</option>
              <option value="OutOfToner">Hết mực</option>
              <option value="OutOfBoth">Hết giấy và mực</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count + Bulk Actions */}
      <div className="text-sm text-gray-600 mb-3 flex items-center justify-between">
        <div>
          Hiện thị <span className="font-semibold">{printers.length > 0 ? ((currentPage * pageSize) + 1) : 0}-{Math.min((currentPage + 1) * pageSize, totalElements)}</span> trên <span className="font-semibold">{totalElements}</span> máy in
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700 mr-2">{selectedIds.size} đã chọn</div>
          <button
            onClick={() => setShowBulkDeleteModal(true)}
            disabled={selectedIds.size === 0}
            className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Xóa hàng loạt
          </button>
          <button
            onClick={() => setShowBulkToggleModal(true)}
            disabled={selectedIds.size === 0}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Bật/Tắt hàng loạt
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-100 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-blue-600 border-transparent bg-transparent focus:ring-0"
                  checked={printers.length > 0 && printers.every(p => selectedIds.has(p.printerId))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(new Set(printers.map(p => p.printerId)));
                    } else {
                      setSelectedIds(new Set());
                    }
                  }}
                />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Tên máy in
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Thương hiệu
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Cơ sở
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Tòa - Phòng
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Giấy A4
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Mực đen
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Bảo trì lần cuối
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  Đang tải...
                </td>
                </tr>
              ) : printers.length === 0 ? (
                <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  Không tìm thấy máy in nào
                </td>
                </tr>
              ) : (
                printers.map((printer) => (
                <tr key={printer.printerId} className={"hover:bg-gray-50 " + (selectedIds.has(printer.printerId) ? 'shadow-md' : '')}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-600 border-transparent bg-transparent focus:ring-0"
                      checked={selectedIds.has(printer.printerId)}
                      onChange={(e) => {
                        const next = new Set(selectedIds);
                        if (e.target.checked) next.add(printer.printerId);
                        else next.delete(printer.printerId);
                        setSelectedIds(next);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-900">{printer.printerName}</td>
                  <td className="px-4 py-3 text-gray-700">{printer.brand}</td>
                  <td className="px-4 py-3 text-gray-700">{printer.campus}</td>
                  <td className="px-4 py-3 text-gray-700">{printer.building} - {printer.roomNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(printer.status)}`}>
                      {printer.statusMessage || getStatusLabel(printer.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        {printer.a4PaperRemaining ?? 0}/{printer.a4PaperCapacity ?? 500}
                      </span>
                      {(printer.a4PaperRemaining ?? 0) <= 50 && (
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${(printer.a4PaperRemaining ?? 0) <= 50 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, ((printer.a4PaperRemaining ?? 0) / (printer.a4PaperCapacity ?? 500)) * 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        {printer.tonerBlackRemaining ?? 0}%
                      </span>
                      {(printer.tonerBlackRemaining ?? 0) <= 20 && (
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${(printer.tonerBlackRemaining ?? 0) <= 20 ? 'bg-red-500' : 'bg-gray-700'}`}
                        style={{ width: `${printer.tonerBlackRemaining ?? 0}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm">
                    {printer.lastMaintenanceDate ? new Date(printer.lastMaintenanceDate).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className="px-4 py-3 relative">
                    <button 
                      onClick={(e) => handleMenuToggle(e, printer.printerId)}
                      className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    {openMenuId === printer.printerId && menuPosition && (
                      <div ref={menuRef} className="fixed-menu bg-white border border-gray-200 rounded-lg shadow-lg" style={{position: 'fixed', top: menuPosition.top, left: menuPosition.left, width: 192, zIndex: 9999}}>
                        <button
                          onClick={() => {
                            setSelectedPrinter(printer);
                            setShowDetailModal(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPrinter(printer);
                            setFormData({
                              printerName: printer.printerName,
                              brand: printer.brand,
                              model: printer.model,
                              campus: printer.campus,
                              building: printer.building,
                              roomNumber: printer.roomNumber,
                              ipAddress: printer.ipAddress || '',
                              paperSizes: printer.paperSizes,
                              colorPrinting: printer.colorPrinting,
                              duplexPrinting: printer.duplexPrinting,
                              status: printer.status,
                              lastMaintenanceDate: printer.lastMaintenanceDate || '',
                            });
                            setShowEditModal(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedPrinter(printer);
                            setShowToggleConfirmModal(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                        >
                          {printer.status === 'Active' ? (
                            <>
                              <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 7v5" />
                              </svg>
                              <span className="ml-2">Tắt</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 7v5" />
                              </svg>
                              <span className="ml-2">Bật</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPrinter(printer);
                            setRefillData({
                              a4Paper: false,
                              a3Paper: false,
                              tonerBlack: false,
                              tonerCyan: false,
                              tonerMagenta: false,
                              tonerYellow: false,
                            });
                            setShowRefillModal(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Nạp giấy/mực
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPrinter(printer);
                            setShowDeleteModal(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition rounded-b-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Xóa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Trang {currentPage + 1} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Thêm Máy In Mới</h2>
              <form onSubmit={handleAddPrinter}>
                {/* Thông tin cơ bản */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Thông tin cơ bản</h3>
                  <div className="grid grid-cols-2 gap-3 mt-1 pl-2 md:pl-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tên máy in <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.printerName}
                        onChange={(e) => setFormData({ ...formData, printerName: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tên máy in"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Thương hiệu <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedBrandId || ''}
                        onChange={async (e) => {
                          const brandId = e.target.value ? Number(e.target.value) : null;
                          setSelectedBrandId(brandId);
                          setSelectedModelId(null);
                          const brand = brands.find(b => b.brandId === brandId);
                          setFormData({ ...formData, brand: brand?.brandName || '', model: '' });
                          
                          if (brandId) {
                            try {
                              const modelsData = await referenceService.getModelsByBrand(brandId);
                              setModels(modelsData);
                            } catch (err) {
                              console.error('Failed to load models:', err);
                              setModels([]);
                            }
                          } else {
                            setModels([]);
                          }
                        }}
                        className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Chọn thương hiệu</option>
                        {brands.map(brand => (
                          <option key={brand.brandId} value={brand.brandId}>
                            {brand.brandName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Mẫu mã <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedModelId || ''}
                        onChange={(e) => {
                          const modelId = e.target.value ? Number(e.target.value) : null;
                          setSelectedModelId(modelId);
                          const model = models.find(m => m.modelId === modelId);
                          setFormData({ ...formData, model: model?.modelName || '' });
                        }}
                        disabled={!selectedBrandId}
                        className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Chọn mẫu mã</option>
                        {models.map(model => (
                          <option key={model.modelId} value={model.modelId}>
                            {model.modelName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Vị trí */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Vị trí</h3>
                  <div className="grid grid-cols-3 gap-3 mt-1 pl-2 md:pl-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Campus <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedCampusId || ''}
                        onChange={async (e) => {
                          const campusId = e.target.value ? Number(e.target.value) : null;
                          setSelectedCampusId(campusId);
                          setSelectedBuildingId(null);
                          setSelectedRoomId(null);
                          const campus = campuses.find(c => c.campusId === campusId);
                          setFormData({ ...formData, campus: campus?.campusName || '', building: '', roomNumber: '' });
                          
                          if (campusId) {
                            try {
                              const buildingsData = await referenceService.getBuildingsByCampus(campusId);
                              setBuildings(buildingsData);
                            } catch (err) {
                              console.error('Failed to load buildings:', err);
                              setBuildings([]);
                            }
                          } else {
                            setBuildings([]);
                            setRooms([]);
                          }
                        }}
                        className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Chọn campus</option>
                        {campuses.map(campus => (
                          <option key={campus.campusId} value={campus.campusId}>
                            {campus.campusName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tòa nhà <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedBuildingId || ''}
                        onChange={async (e) => {
                          const buildingId = e.target.value ? Number(e.target.value) : null;
                          setSelectedBuildingId(buildingId);
                          setSelectedRoomId(null);
                          const building = buildings.find(b => b.buildingId === buildingId);
                          setFormData({ ...formData, building: building?.buildingName || '', roomNumber: '' });
                          
                          if (buildingId) {
                            try {
                              const roomsData = await referenceService.getRoomsByBuilding(buildingId);
                              setRooms(roomsData);
                            } catch (err) {
                              console.error('Failed to load rooms:', err);
                              setRooms([]);
                            }
                          } else {
                            setRooms([]);
                          }
                        }}
                        disabled={!selectedCampusId}
                        className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Chọn tòa nhà</option>
                        {filteredBuildings.map(building => (
                          <option key={building.buildingId} value={building.buildingId}>
                            {building.buildingName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Phòng <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedRoomId || ''}
                        onChange={(e) => {
                          const roomId = e.target.value ? Number(e.target.value) : null;
                          setSelectedRoomId(roomId);
                          const room = rooms.find(r => r.roomId === roomId);
                          setFormData({ ...formData, roomNumber: room?.roomNumber || '' });
                        }}
                        disabled={!selectedBuildingId}
                        className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Chọn phòng</option>
                        {rooms.map(room => (
                          <option key={room.roomId} value={room.roomId}>
                            {room.roomNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {selectedCampusId && selectedBuildingId && selectedRoomId && (
                    <div className="mt-1.5 ml-2 md:ml-4 p-1.5 bg-blue-50 border border-blue-200 rounded-md col-span-3">
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">Vị trí:</span> {
                          campuses.find(c => c.campusId === selectedCampusId)?.campusName
                        } - {
                          buildings.find(b => b.buildingId === selectedBuildingId)?.buildingName
                        } - Phòng {
                          rooms.find(r => r.roomId === selectedRoomId)?.roomNumber
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Thông tin kỹ thuật */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Thông tin kỹ thuật</h3>
                  <div className="grid grid-cols-2 gap-4 mt-1 pl-2 md:pl-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        IP Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.ipAddress}
                        onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                        className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="192.168.1.100"
                      />
                    </div>
                    {/* Status removed: default is Active when adding */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Ngày bảo trì lần cuối <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.lastMaintenanceDate}
                        onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Khổ giấy hỗ trợ <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.paperSizes.includes('A4')}
                            onChange={(e) => {
                              const sizes = formData.paperSizes.split(',').filter(s => s);
                              if (e.target.checked) {
                                sizes.push('A4');
                              } else {
                                const index = sizes.indexOf('A4');
                                if (index > -1) sizes.splice(index, 1);
                              }
                              setFormData({ ...formData, paperSizes: sizes.join(',') });
                            }}
                            className="mr-1.5 w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">A4</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.paperSizes.includes('A3')}
                            onChange={(e) => {
                              const sizes = formData.paperSizes.split(',').filter(s => s);
                              if (e.target.checked) {
                                sizes.push('A3');
                              } else {
                                const index = sizes.indexOf('A3');
                                if (index > -1) sizes.splice(index, 1);
                              }
                              setFormData({ ...formData, paperSizes: sizes.join(',') });
                            }}
                            className="mr-1.5 w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">A3</span>
                        </label>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tính năng in
                      </label>
                      <div className="flex gap-4 p-2 bg-gray-50 border border-gray-200 rounded-md">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.colorPrinting}
                            onChange={(e) => setFormData({ ...formData, colorPrinting: e.target.checked })}
                            className="mr-1.5 w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">In màu</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.duplexPrinting}
                            onChange={(e) => setFormData({ ...formData, duplexPrinting: e.target.checked })}
                            className="mr-1.5 w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">In 2 mặt</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {loading ? 'Đang lưu...' : 'Lưu máy in'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

          {/* Bulk Delete Confirmation Modal */}
          {showBulkDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Xác nhận xóa hàng loạt</h3>
                  <p className="text-sm text-gray-600 text-center mb-6">
                    Bạn có chắc chắn muốn xóa <span className="font-semibold">{selectedIds.size}</span> máy in đã chọn?
                    <br />Hành động này không thể hoàn tác.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setShowBulkDeleteModal(false)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={async () => {
                        if (selectedIds.size === 0) return;
                        try {
                          setLoading(true);
                          await printerService.deletePrinters(Array.from(selectedIds));
                          alert('Xóa hàng loạt thành công');
                          loadPrinters();
                          setSelectedIds(new Set());
                          setShowBulkDeleteModal(false);
                        } catch (err) {
                          alert((err as Error).message || 'Xóa hàng loạt thất bại');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Xác nhận xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Toggle Confirmation Modal */}
          {showBulkToggleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v6" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.364 5.636A9 9 0 1112 3v2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Xác nhận Bật/Tắt hàng loạt</h3>
                  <p className="text-sm text-gray-600 text-center mb-6">
                    Bạn có chắc chắn muốn thay đổi trạng thái cho <span className="font-semibold">{selectedIds.size}</span> máy in đã chọn?
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setShowBulkToggleModal(false)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={async () => {
                        if (selectedIds.size === 0) return;
                        try {
                          setLoading(true);
                          await printerService.togglePrinters(Array.from(selectedIds));
                          alert('Thay đổi trạng thái hàng loạt thành công');
                          loadPrinters();
                          setSelectedIds(new Set());
                          setShowBulkToggleModal(false);
                        } catch (err) {
                          alert((err as Error).message || 'Thay đổi trạng thái hàng loạt thất bại');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Xác nhận
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Single Toggle Confirmation Modal */}
          {showToggleConfirmModal && selectedPrinter && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v6M20.364 5.636A9 9 0 1112 3v2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Xác nhận thay đổi trạng thái</h3>
                  <p className="text-sm text-gray-600 text-center mb-6">
                    Bạn có chắc chắn muốn {selectedPrinter.status === 'Active' ? 'tắt' : 'bật'} máy in <span className="font-semibold">{selectedPrinter.printerName}</span>?
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setShowToggleConfirmModal(false)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={async () => {
                        if (!selectedPrinter) return;
                        try {
                          setLoading(true);
                          await printerService.togglePrinter(selectedPrinter.printerId);
                          alert('Thay đổi trạng thái máy in thành công');
                          setShowToggleConfirmModal(false);
                          setSelectedPrinter(null);
                          loadPrinters();
                        } catch (err) {
                          alert((err as Error).message || 'Thay đổi trạng thái thất bại');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                    >
                      Xác nhận
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        {/* Edit Modal */}
        {showEditModal && selectedPrinter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
              <div className="p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Chỉnh sửa Máy In</h2>
                <form onSubmit={handleEditPrinter}>
                {/* Thông tin cơ bản */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Thông tin cơ bản</h3>
                  <div className="grid grid-cols-2 gap-3 mt-1 pl-2 md:pl-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tên máy in <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.printerName}
                        onChange={(e) => setFormData({ ...formData, printerName: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Thương hiệu <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedBrandId || ''}
                        onChange={async (e) => {
                          const brandId = e.target.value ? Number(e.target.value) : null;
                          setSelectedBrandId(brandId);
                          setSelectedModelId(null);
                          const brand = brands.find(b => b.brandId === brandId);
                          setFormData({ ...formData, brand: brand?.brandName || '', model: '' });
                          
                          if (brandId) {
                            try {
                              const modelsData = await referenceService.getModelsByBrand(brandId);
                              setModels(modelsData);
                            } catch (err) {
                              console.error('Failed to load models:', err);
                              setModels([]);
                            }
                          } else {
                            setModels([]);
                          }
                        }}
                        className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Chọn thương hiệu</option>
                        {brands.map(brand => (
                          <option key={brand.brandId} value={brand.brandId}>
                            {brand.brandName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Mẫu mã <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedModelId || ''}
                        onChange={(e) => {
                          const modelId = e.target.value ? Number(e.target.value) : null;
                          setSelectedModelId(modelId);
                          const model = models.find(m => m.modelId === modelId);
                          setFormData({ ...formData, model: model?.modelName || '' });
                        }}
                        disabled={!selectedBrandId}
                        className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Chọn mẫu mã</option>
                        {models.map(model => (
                          <option key={model.modelId} value={model.modelId}>
                            {model.modelName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Trạng thái <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Active">Đang hoạt động</option>
                        <option value="Inactive">Không hoạt động</option>
                        <option value="Maintenance">Bảo trì</option>
                        <option value="Error">Lỗi</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Vị trí */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Vị trí</h3>
                  <div className="grid grid-cols-3 gap-3 mt-1 pl-2 md:pl-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Campus <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedCampusId || ''}
                        onChange={async (e) => {
                          const campusId = e.target.value ? Number(e.target.value) : null;
                          setSelectedCampusId(campusId);
                          setSelectedBuildingId(null);
                          setSelectedRoomId(null);
                          const campus = campuses.find(c => c.campusId === campusId);
                          setFormData({ ...formData, campus: campus?.campusName || '', building: '', roomNumber: '' });
                          
                          if (campusId) {
                            try {
                              const buildingsData = await referenceService.getBuildingsByCampus(campusId);
                              setBuildings(buildingsData);
                            } catch (err) {
                              console.error('Failed to load buildings:', err);
                              setBuildings([]);
                            }
                          } else {
                            setBuildings([]);
                            setRooms([]);
                          }
                        }}
                        className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Chọn campus</option>
                        {campuses.map(campus => (
                          <option key={campus.campusId} value={campus.campusId}>
                            {campus.campusName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tòa nhà <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedBuildingId || ''}
                        onChange={async (e) => {
                          const buildingId = e.target.value ? Number(e.target.value) : null;
                          setSelectedBuildingId(buildingId);
                          setSelectedRoomId(null);
                          const building = buildings.find(b => b.buildingId === buildingId);
                          setFormData({ ...formData, building: building?.buildingName || '', roomNumber: '' });
                          
                          if (buildingId) {
                            try {
                              const roomsData = await referenceService.getRoomsByBuilding(buildingId);
                              setRooms(roomsData);
                            } catch (err) {
                              console.error('Failed to load rooms:', err);
                              setRooms([]);
                            }
                          } else {
                            setRooms([]);
                          }
                        }}
                        disabled={!selectedCampusId}
                        className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Chọn tòa nhà</option>
                        {buildings.filter(b => !selectedCampusId || b.campusId === selectedCampusId).map(building => (
                          <option key={building.buildingId} value={building.buildingId}>
                            {building.buildingName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Phòng <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedRoomId || ''}
                        onChange={(e) => {
                          const roomId = e.target.value ? Number(e.target.value) : null;
                          setSelectedRoomId(roomId);
                          const room = rooms.find(r => r.roomId === roomId);
                          setFormData({ ...formData, roomNumber: room?.roomNumber || '' });
                        }}
                        disabled={!selectedBuildingId}
                        className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Chọn phòng</option>
                        {rooms.map(room => (
                          <option key={room.roomId} value={room.roomId}>
                            {room.roomNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {selectedCampusId && selectedBuildingId && selectedRoomId && (
                    <div className="mt-1.5 ml-2 md:ml-4 p-1.5 bg-blue-50 border border-blue-200 rounded-md col-span-3">
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">Vị trí:</span> {
                          campuses.find(c => c.campusId === selectedCampusId)?.campusName
                        } - {
                          buildings.find(b => b.buildingId === selectedBuildingId)?.buildingName
                        } - Phòng {
                          rooms.find(r => r.roomId === selectedRoomId)?.roomNumber
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Thông tin kỹ thuật */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Thông tin kỹ thuật</h3>
                  <div className="space-y-2 mt-1 pl-2 md:pl-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          IP Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                            value={formData.ipAddress}
                            onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="192.168.1.100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Ngày bảo trì lần cuối <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.lastMaintenanceDate}
                          onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Khổ giấy hỗ trợ <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-3 p-1.5 bg-gray-50 border border-gray-200 rounded-md">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.paperSizes.includes('A4')}
                            onChange={(e) => {
                              const sizes = formData.paperSizes.split(',').filter(s => s);
                              if (e.target.checked) {
                                sizes.push('A4');
                              } else {
                                const index = sizes.indexOf('A4');
                                if (index > -1) sizes.splice(index, 1);
                              }
                              setFormData({ ...formData, paperSizes: sizes.join(',') });
                            }}
                            className="mr-1.5 w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">A4</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.paperSizes.includes('A3')}
                            onChange={(e) => {
                              const sizes = formData.paperSizes.split(',').filter(s => s);
                              if (e.target.checked) {
                                sizes.push('A3');
                              } else {
                                const index = sizes.indexOf('A3');
                                if (index > -1) sizes.splice(index, 1);
                              }
                              setFormData({ ...formData, paperSizes: sizes.join(',') });
                            }}
                            className="mr-1.5 w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">A3</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tính năng in
                      </label>
                      <div className="flex gap-4 p-1.5 bg-gray-50 border border-gray-200 rounded-md">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.colorPrinting}
                            onChange={(e) => setFormData({ ...formData, colorPrinting: e.target.checked })}
                            className="mr-1.5 w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">In màu</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.duplexPrinting}
                            onChange={(e) => setFormData({ ...formData, duplexPrinting: e.target.checked })}
                            className="mr-1.5 w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">In 2 mặt</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedPrinter(null);
                      resetForm();
                    }}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {loading ? 'Đang lưu...' : 'Cập nhật'}
                  </button>
                </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedPrinter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedPrinter.printerName}</h2>
                      <p className="text-xs text-gray-500">{selectedPrinter.printerId}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${getStatusBadge(selectedPrinter.status)}`}>
                    {getStatusLabel(selectedPrinter.status)}
                  </span>
                </div>

                {/* Thông tin cơ bản */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Thông tin cơ bản</h3>
                  <div className="grid grid-cols-4 gap-3 pl-2 md:pl-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Thương hiệu & Mẫu mã</label>
                      <p className="text-sm text-gray-900 mt-0.5">{selectedPrinter.brand} {selectedPrinter.model}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Vị trí</label>
                      <p className="text-sm text-gray-900 mt-0.5">{selectedPrinter.campus} - {selectedPrinter.building}</p>
                      <p className="text-xs text-gray-600">Phòng {selectedPrinter.roomNumber}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">IP Address</label>
                      <p className="text-sm text-gray-900 mt-0.5 font-mono">{selectedPrinter.ipAddress || 'Chưa cấu hình'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Bảo trì lần cuối</label>
                      <p className="text-sm text-gray-900 mt-0.5">
                        {selectedPrinter.lastMaintenanceDate 
                          ? new Date(selectedPrinter.lastMaintenanceDate).toLocaleDateString('vi-VN')
                          : 'Chưa có thông tin'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tính năng & Thông số */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Tính năng & Thông số</h3>
                  <div className="grid grid-cols-4 gap-3 pl-2 md:pl-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Khổ giấy hỗ trợ</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {selectedPrinter.paperSizes.split(',').map((size) => (
                          <span
                            key={size}
                            className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded"
                          >
                            {size.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">In màu</label>
                      <p className="text-sm text-gray-900">
                        {selectedPrinter.colorPrinting ? (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Có hỗ trợ
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 rounded">
                            Không hỗ trợ
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">In 2 mặt tự động</label>
                      <p className="text-sm text-gray-900">
                        {selectedPrinter.duplexPrinting ? (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 rounded">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Có hỗ trợ
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 rounded">
                            Không hỗ trợ
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Tổng số trang đã in</label>
                      <p className="text-xl font-bold text-blue-600">{selectedPrinter.totalPagesPrinted.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Giấy và Mực */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Giấy và Mực</h3>
                  <div className="grid grid-cols-2 gap-4 pl-2 md:pl-4">
                    {/* Giấy A4 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">Giấy A4</label>
                        <span className="text-sm font-bold text-gray-900">
                          {selectedPrinter.a4PaperRemaining ?? 0}/{selectedPrinter.a4PaperCapacity ?? 500} tờ
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${(selectedPrinter.a4PaperRemaining ?? 0) <= 50 ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(100, ((selectedPrinter.a4PaperRemaining ?? 0) / (selectedPrinter.a4PaperCapacity ?? 500)) * 100)}%` }}
                        ></div>
                      </div>
                      {(selectedPrinter.a4PaperRemaining ?? 0) <= 50 && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Sắp hết giấy
                        </p>
                      )}
                    </div>

                    {/* Giấy A3 */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">Giấy A3</label>
                        <span className="text-sm font-bold text-gray-900">
                          {selectedPrinter.a3PaperRemaining ?? 0}/{selectedPrinter.a3PaperCapacity ?? 250} tờ
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${(selectedPrinter.a3PaperRemaining ?? 0) <= 25 ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, ((selectedPrinter.a3PaperRemaining ?? 0) / (selectedPrinter.a3PaperCapacity ?? 250)) * 100)}%` }}
                        ></div>
                      </div>
                      {(selectedPrinter.a3PaperRemaining ?? 0) <= 25 && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Sắp hết giấy
                        </p>
                      )}
                    </div>

                    {/* Mực đen */}
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">Mực đen</label>
                        <span className="text-sm font-bold text-gray-900">
                          {selectedPrinter.tonerBlackRemaining ?? 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${(selectedPrinter.tonerBlackRemaining ?? 0) <= 20 ? 'bg-red-500' : 'bg-gray-700'}`}
                          style={{ width: `${selectedPrinter.tonerBlackRemaining ?? 0}%` }}
                        ></div>
                      </div>
                      {(selectedPrinter.tonerBlackRemaining ?? 0) <= 20 && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Sắp hết mực
                        </p>
                      )}
                    </div>

                    {/* Mực màu (nếu có) */}
                    {selectedPrinter.colorPrinting && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Mực màu</label>
                        <div className="space-y-2">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-cyan-600">Xanh</span>
                              <span className="font-semibold">{selectedPrinter.tonerCyanRemaining ?? 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-cyan-500" style={{ width: `${selectedPrinter.tonerCyanRemaining ?? 0}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-pink-600">Đỏ</span>
                              <span className="font-semibold">{selectedPrinter.tonerMagentaRemaining ?? 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-pink-500" style={{ width: `${selectedPrinter.tonerMagentaRemaining ?? 0}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-yellow-600">Vàng</span>
                              <span className="font-semibold">{selectedPrinter.tonerYellowRemaining ?? 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-yellow-500" style={{ width: `${selectedPrinter.tonerYellowRemaining ?? 0}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedPrinter.tonerLastReplaced && (
                    <p className="text-xs text-gray-500 mt-2 pl-2 md:pl-4">
                      Thay mực lần cuối: {new Date(selectedPrinter.tonerLastReplaced).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>

                {/* Thông tin bổ sung */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Thông tin bổ sung</h3>
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg pl-2 md:pl-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Ngày thêm vào hệ thống</label>
                      <p className="text-sm text-gray-900 mt-0.5">
                        {new Date(selectedPrinter.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">ID máy in</label>
                      <p className="text-sm text-gray-900 mt-0.5 font-mono font-semibold">{selectedPrinter.printerId}</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end pt-3 border-t">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedPrinter(null);
                    }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedPrinter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Xác nhận xóa máy in</h3>
                <p className="text-sm text-gray-600 text-center mb-6">
                Bạn có chắc chắn muốn xóa máy in <span className="font-semibold">{selectedPrinter.printerName}</span>?
                <br />Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedPrinter(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDeletePrinter}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Refill Modal */}
      {showRefillModal && selectedPrinter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Nạp giấy và mực</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedPrinter.printerName}</p>
                </div>
                <button
                  onClick={() => setShowRefillModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Current Status */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Trạng thái hiện tại</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Giấy A4</label>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPrinter.a4PaperRemaining ?? 0}/{selectedPrinter.a4PaperCapacity ?? 500} tờ
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Giấy A3</label>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPrinter.a3PaperRemaining ?? 0}/{selectedPrinter.a3PaperCapacity ?? 250} tờ
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Mực đen</label>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPrinter.tonerBlackRemaining ?? 0}%
                    </p>
                  </div>
                  {selectedPrinter.colorPrinting && (
                    <>
                      <div>
                        <label className="text-xs text-gray-600">Mực xanh</label>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedPrinter.tonerCyanRemaining ?? 0}%
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Mực đỏ</label>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedPrinter.tonerMagentaRemaining ?? 0}%
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Mực vàng</label>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedPrinter.tonerYellowRemaining ?? 0}%
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Refill Options */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Chọn mục cần nạp</h3>
                <p className="text-xs text-gray-500 mb-4">
                  ⚠️ Lưu ý: Khi nạp, giấy và mực sẽ được reset về đầy (100%)
                </p>
                
                <div className="space-y-3">
                  {/* Giấy A4 */}
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={refillData.a4Paper}
                      onChange={(e) => setRefillData({ ...refillData, a4Paper: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Giấy A4</span>
                        <span className="text-xs text-gray-500">
                          Hiện có: {selectedPrinter.a4PaperRemaining ?? 0} → Sau nạp: {selectedPrinter.a4PaperCapacity ?? 500} tờ
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* Giấy A3 */}
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={refillData.a3Paper}
                      onChange={(e) => setRefillData({ ...refillData, a3Paper: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Giấy A3</span>
                        <span className="text-xs text-gray-500">
                          Hiện có: {selectedPrinter.a3PaperRemaining ?? 0} → Sau nạp: {selectedPrinter.a3PaperCapacity ?? 250} tờ
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* Mực đen */}
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={refillData.tonerBlack}
                      onChange={(e) => setRefillData({ ...refillData, tonerBlack: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Mực đen</span>
                        <span className="text-xs text-gray-500">
                          Hiện có: {selectedPrinter.tonerBlackRemaining ?? 0}% → Sau nạp: 100%
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* Mực màu (chỉ hiển thị nếu máy in màu) */}
                  {selectedPrinter.colorPrinting && (
                    <>
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={refillData.tonerCyan}
                          onChange={(e) => setRefillData({ ...refillData, tonerCyan: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">Mực xanh (Cyan)</span>
                            <span className="text-xs text-gray-500">
                              Hiện có: {selectedPrinter.tonerCyanRemaining ?? 0}% → Sau nạp: 100%
                            </span>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={refillData.tonerMagenta}
                          onChange={(e) => setRefillData({ ...refillData, tonerMagenta: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">Mực đỏ (Magenta)</span>
                            <span className="text-xs text-gray-500">
                              Hiện có: {selectedPrinter.tonerMagentaRemaining ?? 0}% → Sau nạp: 100%
                            </span>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={refillData.tonerYellow}
                          onChange={(e) => setRefillData({ ...refillData, tonerYellow: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">Mực vàng (Yellow)</span>
                            <span className="text-xs text-gray-500">
                              Hiện có: {selectedPrinter.tonerYellowRemaining ?? 0}% → Sau nạp: 100%
                            </span>
                          </div>
                        </div>
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowRefillModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    // Kiểm tra có chọn ít nhất 1 mục
                    const hasSelection = Object.values(refillData).some(v => v);
                    if (!hasSelection) {
                      alert('Vui lòng chọn ít nhất 1 mục cần nạp');
                      return;
                    }

                    try {
                      setLoading(true);
                      await printerService.refillSupplies(selectedPrinter.printerId, {
                        a4PaperToAdd: refillData.a4Paper ? 1 : 0,
                        a3PaperToAdd: refillData.a3Paper ? 1 : 0,
                        tonerBlackToAdd: refillData.tonerBlack ? 1 : 0,
                        tonerCyanToAdd: refillData.tonerCyan ? 1 : 0,
                        tonerMagentaToAdd: refillData.tonerMagenta ? 1 : 0,
                        tonerYellowToAdd: refillData.tonerYellow ? 1 : 0,
                      });
                      
                      alert('Nạp giấy/mực thành công!');
                      setShowRefillModal(false);
                      setSelectedPrinter(null);
                      loadPrinters();
                    } catch (err: any) {
                      // Extract error message from API response
                      const errorMessage = err?.response?.data?.message 
                        || err?.response?.data?.error
                        || err?.message 
                        || 'Nạp giấy/mực thất bại';
                      
                      alert(errorMessage);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {loading ? 'Đang nạp...' : 'Xác nhận nạp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
