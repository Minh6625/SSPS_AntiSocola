'use client';

import { useState, useEffect } from 'react';
import locationService, { Campus, Building, Room } from '@/services/locationService';

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState<'campus' | 'building' | 'room'>('campus');
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Campus | Building | Room | null>(null);

  // Load campuses and buildings for dropdowns (always needed)
  const loadReferenceData = async () => {
    try {
      const [campusData, buildingData] = await Promise.all([
        locationService.getAllCampuses(),
        locationService.getAllBuildings()
      ]);
      setCampuses(campusData);
      setBuildings(buildingData);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'campus') {
        const data = await locationService.getAllCampuses();
        setCampuses(data);
      } else if (activeTab === 'building') {
        const data = await locationService.getAllBuildings();
        setBuildings(data);
      } else {
        const data = await locationService.getAllRooms();
        setRooms(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load reference data once on mount
  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: Campus | Building | Room) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    let confirmMessage = 'Bạn có chắc chắn muốn xóa?';
    
    if (activeTab === 'campus') {
      confirmMessage = '⚠️ CẢNH BÁO: Xóa Cơ sở này sẽ xóa TẤT CẢ các Tòa nhà và Phòng trong cơ sở!\n\nBạn có chắc chắn muốn xóa?';
    } else if (activeTab === 'building') {
      confirmMessage = '⚠️ CẢNH BÁO: Xóa Tòa nhà này sẽ xóa TẤT CẢ các Phòng trong tòa nhà!\n\nBạn có chắc chắn muốn xóa?';
    }
    
    if (!confirm(confirmMessage)) return;

    try {
      const typeName = activeTab === 'campus' ? 'Cơ sở' : activeTab === 'building' ? 'Tòa nhà' : 'Phòng';
      
      if (activeTab === 'campus') {
        await locationService.deleteCampus(id);
      } else if (activeTab === 'building') {
        await locationService.deleteBuilding(id);
      } else {
        await locationService.deleteRoom(id);
      }
      
      alert(`Xóa ${typeName} thành công!`);
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Lỗi khi xóa');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Vị trí Máy in</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Thêm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('campus')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'campus'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cơ sở
            </button>
            <button
              onClick={() => setActiveTab('building')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'building'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tòa nhà
            </button>
            <button
              onClick={() => setActiveTab('room')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'room'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Phòng
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : (
            <>
              {activeTab === 'campus' && (
                <CampusTable data={campuses} onEdit={handleEdit} onDelete={handleDelete} />
              )}
              {activeTab === 'building' && (
                <BuildingTable data={buildings} onEdit={handleEdit} onDelete={handleDelete} />
              )}
              {activeTab === 'room' && (
                <RoomTable data={rooms} onEdit={handleEdit} onDelete={handleDelete} />
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <LocationModal
          type={activeTab}
          item={editingItem}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadData();
          }}
          campuses={campuses}
          buildings={buildings}
        />
      )}
    </div>
  );
}


// Campus Table Component
function CampusTable({ data, onEdit, onDelete }: { 
  data: Campus[]; 
  onEdit: (item: Campus) => void; 
  onDelete: (id: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên cơ sở</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item: Campus) => (
            <tr key={item.campusId}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.campusCode}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.campusName}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{item.address}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => onEdit(item)} 
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                  title="Chỉnh sửa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  onClick={() => onDelete(item.campusId)} 
                  className="text-red-600 hover:text-red-900"
                  title="Xóa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Building Table Component
function BuildingTable({ data, onEdit, onDelete }: { 
  data: Building[]; 
  onEdit: (item: Building) => void; 
  onDelete: (id: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên tòa nhà</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cơ sở</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tầng</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item: Building) => (
            <tr key={item.buildingId}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.buildingCode}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.buildingName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.campusName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.floorCount}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => onEdit(item)} 
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                  title="Chỉnh sửa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  onClick={() => onDelete(item.buildingId)} 
                  className="text-red-600 hover:text-red-900"
                  title="Xóa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// Room Table Component
function RoomTable({ data, onEdit, onDelete }: { 
  data: Room[]; 
  onEdit: (item: Room) => void; 
  onDelete: (id: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số phòng</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên phòng</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tòa nhà</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại phòng</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sức chứa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item: Room) => (
            <tr key={item.roomId}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.roomNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.roomName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.buildingName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.roomType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.capacity}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => onEdit(item)} 
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                  title="Chỉnh sửa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  onClick={() => onDelete(item.roomId)} 
                  className="text-red-600 hover:text-red-900"
                  title="Xóa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Modal Component
function LocationModal({ type, item, onClose, onSuccess, campuses, buildings }: { 
  type: 'campus' | 'building' | 'room';
  item: Campus | Building | Room | null;
  onClose: () => void;
  onSuccess: () => void;
  campuses: Campus[];
  buildings: Building[];
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>(item || {});
  const [loading, setLoading] = useState(false);
  const [occupiedRoomNumbers, setOccupiedRoomNumbers] = useState<string[]>([]);
  const [occupiedBuildingCodes, setOccupiedBuildingCodes] = useState<string[]>([]);

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ isActive: true });
    }
  }, [item]);

  // Load occupied building codes when campus is selected
  useEffect(() => {
    const loadOccupiedBuildings = async () => {
      if (type === 'building' && formData.campusId) {
        try {
          const allBuildings = await locationService.getAllBuildings();
          const occupied = allBuildings
            .filter((b: Building) => b.campusId === formData.campusId && b.buildingId !== (item as Building)?.buildingId)
            .map((b: Building) => b.buildingCode);
          setOccupiedBuildingCodes(occupied);
        } catch (error) {
          console.error('Error loading occupied buildings:', error);
        }
      }
    };
    loadOccupiedBuildings();
  }, [formData.campusId, type, item]);

  // Load occupied room numbers when building is selected
  useEffect(() => {
    const loadOccupiedRooms = async () => {
      if (type === 'room' && formData.buildingId) {
        try {
          const rooms = await locationService.getAllRooms();
          const occupied = rooms
            .filter((r: Room) => r.buildingId === formData.buildingId && r.roomId !== (item as Room)?.roomId)
            .map((r: Room) => r.roomNumber);
          setOccupiedRoomNumbers(occupied);
        } catch (error) {
          console.error('Error loading occupied rooms:', error);
        }
      }
    };
    loadOccupiedRooms();
  }, [formData.buildingId, type, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isUpdate = !!item;
      const typeName = type === 'campus' ? 'Cơ sở' : type === 'building' ? 'Tòa nhà' : 'Phòng';
      
      if (type === 'campus') {
        if (item && 'campusId' in item) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await locationService.updateCampus(item.campusId, formData as any);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await locationService.createCampus(formData as any);
        }
      } else if (type === 'building') {
        if (item && 'buildingId' in item) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await locationService.updateBuilding(item.buildingId, formData as any);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await locationService.createBuilding(formData as any);
        }
      } else {
        if (item && 'roomId' in item) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await locationService.updateRoom(item.roomId, formData as any);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await locationService.createRoom(formData as any);
        }
      }
      
      alert(`${isUpdate ? 'Cập nhật' : 'Thêm mới'} ${typeName} thành công!`);
      onSuccess();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[95vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">
            {item ? 'Chỉnh sửa' : 'Thêm mới'} {type === 'campus' ? 'Cơ sở' : type === 'building' ? 'Tòa nhà' : 'Phòng'}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-3" id="location-form">
          {type === 'campus' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã cơ sở *</label>
                <input
                  type="text"
                  required
                  value={formData.campusCode || ''}
                  onChange={(e) => setFormData({ ...formData, campusCode: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên cơ sở *</label>
                <input
                  type="text"
                  required
                  value={formData.campusName || ''}
                  onChange={(e) => setFormData({ ...formData, campusName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}


          {type === 'building' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cơ sở *</label>
                <select
                  required
                  value={formData.campusId || ''}
                  onChange={(e) => setFormData({ ...formData, campusId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Chọn cơ sở</option>
                  {campuses.map((c: Campus) => (
                    <option key={c.campusId} value={c.campusId}>{c.campusName}</option>
                  ))}
                </select>
              </div>
              
              {formData.campusId && occupiedBuildingCodes.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  <p className="text-xs font-medium text-yellow-800 mb-1">
                    Tòa nhà đã sử dụng trong cơ sở này:
                  </p>
                  <p className="text-xs text-yellow-700">
                    {occupiedBuildingCodes.join(', ')}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã tòa nhà *</label>
                  <input
                    type="text"
                    required
                    value={formData.buildingCode || ''}
                    onChange={(e) => setFormData({ ...formData, buildingCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="H1, H2, A..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tầng</label>
                  <input
                    type="number"
                    value={formData.floorCount || ''}
                    onChange={(e) => setFormData({ ...formData, floorCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tòa nhà</label>
                <input
                  type="text"
                  value={formData.buildingName || ''}
                  onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          {type === 'room' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tòa nhà *</label>
                <select
                  required
                  value={formData.buildingId || ''}
                  onChange={(e) => setFormData({ ...formData, buildingId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Chọn tòa nhà</option>
                  {buildings.map((b: Building) => (
                    <option key={b.buildingId} value={b.buildingId}>{b.buildingName}</option>
                  ))}
                </select>
              </div>
              
              {formData.buildingId && occupiedRoomNumbers.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  <p className="text-xs font-medium text-yellow-800 mb-1">
                    Số phòng đã sử dụng:
                  </p>
                  <p className="text-xs text-yellow-700">
                    {occupiedRoomNumbers.join(', ')}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số phòng *</label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber || ''}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="101, A201..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                  <input
                    type="number"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng</label>
                  <input
                    type="text"
                    value={formData.roomName || ''}
                    onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
                  <select
                    value={formData.roomType || ''}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Chọn loại phòng</option>
                    <option value="Phòng học">Phòng học</option>
                    <option value="Phòng thí nghiệm">Phòng thí nghiệm</option>
                    <option value="Phòng máy tính">Phòng máy tính</option>
                    <option value="Phòng thực hành">Phòng thực hành</option>
                    <option value="Phòng hội thảo">Phòng hội thảo</option>
                    <option value="Phòng họp">Phòng họp</option>
                    <option value="Văn phòng">Văn phòng</option>
                    <option value="Thư viện">Thư viện</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive !== false}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="ml-2 text-sm text-gray-700">Hoạt động</label>
          </div>
          </form>
        </div>

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              type="submit"
              form="location-form"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-medium"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
