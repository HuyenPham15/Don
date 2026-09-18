import React, { useState, useMemo } from 'react';
import { Screen, DonDetail } from '../types';
import {
  DEPARTMENTS,
  TiepNhanDonItem,
  Officer,
} from '../constants/departments';
import PhanCongModal, { PhanCongSubmitData } from '../components/modals/PhanCongModal';

interface TiepNhanVaXuLyScreenProps {
  onNav: (s: Screen) => void;
  items: TiepNhanDonItem[];
  onPhanCongDone: (data: PhanCongSubmitData) => void;
  onSelectDon?: (don: DonDetail) => void;
}

type TabKey = 'cho_phan_cong' | 'dang_xu_ly' | 'da_hoan_thanh';

export default function TiepNhanVaXuLyScreen({
  onNav,
  items,
  onPhanCongDone,
  onSelectDon,
}: TiepNhanVaXuLyScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('cho_phan_cong');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('tiep-dan');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [modalItems, setModalItems] = useState<TiepNhanDonItem[]>([]);
  const [isPhanCongModalOpen, setIsPhanCongModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const currentDepartment = useMemo(() => {
    return DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[0];
  }, [selectedDeptId]);

  // Lọc danh sách theo đơn vị và từ khóa
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchDept = item.donViTiepNhanId === selectedDeptId;
      const matchTab = item.trangThai === activeTab;
      if (!matchDept || !matchTab) return false;

      if (!searchKeyword.trim()) return true;
      const kw = searchKeyword.toLowerCase().trim();
      return (
        item.code.toLowerCase().includes(kw) ||
        item.luotNhanId.toLowerCase().includes(kw) ||
        item.nguoiNop.toLowerCase().includes(kw) ||
        item.loaiDon.toLowerCase().includes(kw) ||
        item.noiDungTomTat.toLowerCase().includes(kw)
      );
    });
  }, [items, selectedDeptId, activeTab, searchKeyword]);

  // Đếm số lượng theo tab
  const counts = useMemo(() => {
    const deptItems = items.filter((it) => it.donViTiepNhanId === selectedDeptId);
    return {
      cho_phan_cong: deptItems.filter((i) => i.trangThai === 'cho_phan_cong').length,
      dang_xu_ly: deptItems.filter((i) => i.trangThai === 'dang_xu_ly').length,
      da_hoan_thanh: deptItems.filter((i) => i.trangThai === 'da_hoan_thanh').length,
    };
  }, [items, selectedDeptId]);

  // Quản lý chọn checkbox
  const handleToggleSelectAll = () => {
    if (selectedItemIds.length === filteredItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredItems.map((it) => it.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Mở modal phân công đơn lẻ
  const handleOpenSingleAssign = (item: TiepNhanDonItem) => {
    setModalItems([item]);
    setIsPhanCongModalOpen(true);
  };

  // Mở modal phân công hàng loạt
  const handleOpenBulkAssign = () => {
    const toAssign = items.filter((it) => selectedItemIds.includes(it.id));
    if (toAssign.length === 0) return;
    setModalItems(toAssign);
    setIsPhanCongModalOpen(true);
  };

  // Xác nhận phân công từ modal
  const handlePhanCongSubmit = (data: PhanCongSubmitData) => {
    setIsPhanCongModalOpen(false);
    onPhanCongDone(data);
    setSelectedItemIds([]);
    showToast(`Phân công thành công cho cán bộ ${data.canBo.name}.`);
  };

  // Xem chi tiết đơn
  const handleViewDetail = (item: TiepNhanDonItem) => {
    onSelectDon?.({
      id: item.code,
      code: item.code,
      title: item.noiDungTomTat,
      luotNhanId: item.luotNhanId,
      nguoiNop: item.nguoiNop,
      ngayNhan: item.ngayNhan,
      loaiDon: item.loaiDon,
      type: 'ĐƠN TIẾP NHẬN',
      statusBadge: item.trangThai === 'cho_phan_cong' ? 'Chờ phân công' : 'Đang xử lý',
    });
    onNav('don-tiep-nhan');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f7fb] text-slate-800 select-none overflow-hidden font-body-md">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Màn hình */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex flex-col gap-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => onNav('cong-viec')}
              className="hover:text-blue-700 hover:underline cursor-pointer"
            >
              Trang chủ
            </button>
            <span>/</span>
            <span className="text-slate-800 font-bold">Tiếp nhận &amp; xử lý</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 font-headline-md tracking-tight">
              Tiếp nhận &amp; Xử lý đơn
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              Hàng chờ đơn vị
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Khu vực phân công nhiệm vụ và theo dõi tiến độ xử lý đơn của Phòng/Đơn vị
          </p>
        </div>

        {/* Department Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium pl-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-slate-400">domain</span>
              <span>Đơn vị:</span>
            </span>
            <select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                setSelectedItemIds([]);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 border-l border-slate-200 pl-3">
            <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
            <span>Trưởng phòng:</span>
            <strong className="text-slate-800">{currentDepartment.leaderName}</strong>
          </div>
        </div>
      </div>

      {/* 2. Tabs Bar + Search + Action */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('cho_phan_cong');
              setSelectedItemIds([]);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'cho_phan_cong'
                ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-amber-600">
              hourglass_top
            </span>
            <span>Chờ phân công</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-bold font-label-technical ${
                activeTab === 'cho_phan_cong'
                  ? 'bg-amber-200/80 text-amber-900'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {String(counts.cho_phan_cong).padStart(2, '0')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('dang_xu_ly');
              setSelectedItemIds([]);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'dang_xu_ly'
                ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-blue-600">
              pending_actions
            </span>
            <span>Đang xử lý</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-bold font-label-technical ${
                activeTab === 'dang_xu_ly'
                  ? 'bg-blue-200/80 text-blue-900'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {String(counts.dang_xu_ly).padStart(2, '0')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('da_hoan_thanh');
              setSelectedItemIds([]);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'da_hoan_thanh'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-emerald-600">
              task_alt
            </span>
            <span>Đã hoàn thành</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-bold font-label-technical ${
                activeTab === 'da_hoan_thanh'
                  ? 'bg-emerald-200/80 text-emerald-900'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {String(counts.da_hoan_thanh).padStart(2, '0')}
            </span>
          </button>
        </div>

        {/* Filter & Bulk Actions */}
        <div className="flex items-center gap-2.5">
          {/* Nút Phân công hàng loạt */}
          {activeTab === 'cho_phan_cong' && selectedItemIds.length > 0 && (
            <button
              type="button"
              onClick={handleOpenBulkAssign}
              className="px-3.5 py-1.5 rounded-xl bg-[#C62828] hover:bg-[#b71c1c] active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 animate-scale-up"
            >
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              <span>Phân công hàng loạt ({selectedItemIds.length})</span>
            </button>
          )}

          {/* Search box */}
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm mã đơn, người nộp, loại đơn..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bảng dữ liệu danh sách */}
      <div className="flex-1 p-5 overflow-auto">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  {activeTab === 'cho_phan_cong' && (
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredItems.length > 0 &&
                          selectedItemIds.length === filteredItems.length
                        }
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 text-[#C62828] focus:ring-[#C62828] cursor-pointer"
                        title="Chọn tất cả"
                      />
                    </th>
                  )}
                  <th className="py-3 px-3 w-32">Mã / Lượt nhận</th>
                  <th className="py-3 px-3 w-40">Người nộp đơn</th>
                  <th className="py-3 px-4 min-w-[200px]">Loại đơn</th>
                  <th className="py-3 px-3 w-28">Ngày nhận</th>
                  <th className="py-3 px-3 w-28">Ngày chuyển</th>
                  <th className="py-3 px-3 min-w-[160px]">Đơn vị</th>
                  <th className="py-3 px-3 w-28">Hạn xử lý</th>
                  <th className="py-3 px-3 w-32">Trạng thái</th>
                  {activeTab !== 'cho_phan_cong' && (
                    <th className="py-3 px-3 min-w-[150px]">Cán bộ xử lý</th>
                  )}
                  <th className="py-3 px-3 w-28 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeTab === 'cho_phan_cong' ? 10 : 10}
                      className="py-12 text-center text-slate-400"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-slate-300">
                          inbox
                        </span>
                        <p className="text-xs font-semibold text-slate-600">
                          Không có hồ sơ đơn nào trong tab này
                        </p>
                        <span className="text-[11px] text-slate-400">
                          {activeTab === 'cho_phan_cong'
                            ? 'Tất cả đơn trong hàng chờ đã được phân công.'
                            : 'Chưa có dữ liệu.'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        {activeTab === 'cho_phan_cong' && (
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectItem(item.id)}
                              className="rounded border-slate-300 text-[#C62828] focus:ring-[#C62828] cursor-pointer"
                            />
                          </td>
                        )}

                        {/* Mã / Lượt nhận */}
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-slate-900 block">
                            {item.code}
                          </span>
                          <span className="font-label-technical text-[10.5px] text-slate-400 block">
                            {item.luotNhanId}
                          </span>
                        </td>

                        {/* Người nộp đơn */}
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900 block truncate max-w-[150px]">
                            {item.nguoiNop}
                          </span>
                        </td>

                        {/* Loại đơn */}
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 block leading-snug">
                            {item.loaiDon}
                          </span>
                          <p className="text-[11px] text-slate-500 line-clamp-1 italic mt-0.5">
                            {item.noiDungTomTat}
                          </p>
                        </td>

                        {/* Ngày tiếp nhận */}
                        <td className="py-3 px-3 font-label-technical text-slate-600">
                          {item.ngayNhan.split(' ')[0]}
                          <span className="block text-[10.5px] text-slate-400">
                            {item.ngayNhan.split(' ')[1] || ''}
                          </span>
                        </td>

                        {/* Ngày chuyển đến */}
                        <td className="py-3 px-3 font-label-technical text-slate-600">
                          {item.ngayChuyenDen.split(' ')[0]}
                          <span className="block text-[10.5px] text-slate-400">
                            {item.ngayChuyenDen.split(' ')[1] || ''}
                          </span>
                        </td>

                        {/* Đơn vị */}
                        <td className="py-3 px-3">
                          <span className="text-slate-800 block text-xs truncate max-w-[150px]">
                            {item.donViTiepNhan}
                          </span>
                          {item.nguoiChuyen && (
                            <span className="text-[10.5px] text-slate-400 block truncate max-w-[150px]">
                              Từ: {item.nguoiChuyen}
                            </span>
                          )}
                        </td>

                        {/* Hạn xử lý */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-label-technical ${
                              item.hanXuLy.includes('Hôm nay')
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.hanXuLy}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            {item.hanXuLyFull}
                          </span>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3 px-3">
                          {item.trangThai === 'cho_phan_cong' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Chờ phân công</span>
                            </span>
                          )}
                          {item.trangThai === 'dang_xu_ly' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              <span>Đang xử lý</span>
                            </span>
                          )}
                          {item.trangThai === 'da_hoan_thanh' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Đã hoàn thành</span>
                            </span>
                          )}
                        </td>

                        {/* Cán bộ xử lý (hiển thị khi đang xử lý hoặc hoàn thành) */}
                        {activeTab !== 'cho_phan_cong' && (
                          <td className="py-3 px-3">
                            {item.canBoXuLy ? (
                              <div>
                                <span className="font-bold text-slate-800 block">
                                  {item.canBoXuLy}
                                </span>
                                <span className="text-[10.5px] text-slate-500 block truncate max-w-[140px]">
                                  {item.chucVuCanBo || ''}
                                </span>
                                {item.nguoiPhanCong && (
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    Giao bởi: {item.nguoiPhanCong}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Chưa giao</span>
                            )}
                          </td>
                        )}

                        {/* Thao tác */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {item.trangThai === 'cho_phan_cong' ? (
                              <button
                                type="button"
                                onClick={() => handleOpenSingleAssign(item)}
                                className="px-2.5 py-1 rounded-lg bg-[#C62828] hover:bg-[#b71c1c] active:scale-95 text-white text-[11.5px] font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1"
                                title="Phân công cán bộ xử lý"
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  how_to_reg
                                </span>
                                <span>Phân công</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleViewDetail(item)}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11.5px] font-semibold border border-blue-200 cursor-pointer transition-colors"
                              >
                                Chi tiết
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleViewDetail(item)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                              title="Xem chi tiết đơn"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                open_in_new
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer thông tin */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Hiển thị <strong className="text-slate-800">{filteredItems.length}</strong> đơn trong danh mục
            </span>
            <span className="font-label-technical text-[11px] text-slate-400">
              Quy chế phân công: Trưởng phòng trực tiếp giao việc theo thẩm quyền (BR-03)
            </span>
          </div>
        </div>
      </div>

      {/* Modal Phân công */}
      <PhanCongModal
        isOpen={isPhanCongModalOpen}
        onClose={() => setIsPhanCongModalOpen(false)}
        onSubmit={handlePhanCongSubmit}
        itemsToAssign={modalItems}
        currentDepartmentId={selectedDeptId}
        departmentName={currentDepartment.name}
      />
    </div>
  );
}
