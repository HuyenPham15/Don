import React, { useState, useMemo } from 'react';
import { OFFICERS, Officer, TiepNhanDonItem } from '../../constants/departments';

export interface PhanCongSubmitData {
  itemIds: string[];
  canBo: Officer;
  ghiChu: string;
}

interface PhanCongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PhanCongSubmitData) => void;
  itemsToAssign: TiepNhanDonItem[];
  currentDepartmentId?: string;
  departmentName?: string;
}

export default function PhanCongModal({
  isOpen,
  onClose,
  onSubmit,
  itemsToAssign,
  currentDepartmentId = 'tiep-dan',
  departmentName = 'Phòng Tiếp công dân & Xử lý đơn',
}: PhanCongModalProps) {
  const [selectedCanBoId, setSelectedCanBoId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ghiChu, setGhiChu] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Lọc cán bộ thuộc đơn vị hiện tại
  const departmentOfficers = useMemo(() => {
    return OFFICERS.filter((o) => o.departmentId === currentDepartmentId);
  }, [currentDepartmentId]);

  // Tìm kiếm cán bộ
  const filteredOfficers = useMemo(() => {
    if (!searchQuery.trim()) return departmentOfficers;
    const q = searchQuery.toLowerCase().trim();
    return departmentOfficers.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.role.toLowerCase().includes(q) ||
        (o.phone && o.phone.includes(q))
    );
  }, [departmentOfficers, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCanBoId) {
      setError('Vui lòng chọn cán bộ xử lý đơn');
      return;
    }

    const selectedOfficer = departmentOfficers.find((o) => o.id === selectedCanBoId);
    if (!selectedOfficer) return;

    onSubmit({
      itemIds: itemsToAssign.map((it) => it.id),
      canBo: selectedOfficer,
      ghiChu,
    });
  };

  if (!isOpen || itemsToAssign.length === 0) return null;

  const isBulk = itemsToAssign.length > 1;
  const singleItem = itemsToAssign[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C62828]/10 text-[#C62828] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-headline-md tracking-tight">
                {isBulk ? `Phân công cán bộ xử lý (${itemsToAssign.length} đơn)` : 'Phân công cán bộ xử lý'}
              </h2>
              <p className="text-xs text-slate-500">
                {departmentName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Thông tin đơn */}
          {!isBulk ? (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-label-technical flex items-center justify-between">
                <span>Thông tin đơn</span>
                <span className="text-[#C62828] font-mono font-bold">{singleItem.code}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div>
                  <span className="text-slate-500 block text-[11px]">Mã đơn / Lượt nhận:</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {singleItem.code} ({singleItem.luotNhanId})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Người nộp đơn:</span>
                  <span className="font-semibold text-slate-900">{singleItem.nguoiNop}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[11px]">Loại đơn:</span>
                  <span className="font-medium text-slate-800">{singleItem.loaiDon}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-label-technical flex items-center justify-between">
                <span>Danh sách đơn phân công hàng loạt ({itemsToAssign.length} đơn)</span>
                <span className="text-blue-700 font-bold font-mono">HÀNG CHỜ PHÒNG</span>
              </div>
              <div className="max-h-28 overflow-y-auto divide-y divide-slate-200/80 pr-1">
                {itemsToAssign.map((item) => (
                  <div key={item.id} className="py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{item.code}</span>
                      <span className="text-slate-600 truncate max-w-[200px]">{item.nguoiNop}</span>
                    </div>
                    <span className="text-slate-500 text-[11px] truncate max-w-[180px]">{item.loaiDon}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form id="phan-cong-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Trường: Cán bộ xử lý * */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-800">
                  Cán bộ xử lý <span className="text-[#C62828]">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Có thể tự phân công cho chính mình
                </span>
              </div>

              {/* Ô tìm kiếm */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[17px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm cán bộ theo tên, chức vụ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Danh sách cán bộ */}
              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-lg p-1.5 bg-white">
                {filteredOfficers.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    Không tìm thấy cán bộ phù hợp
                  </div>
                ) : (
                  filteredOfficers.map((officer) => {
                    const isSelected = selectedCanBoId === officer.id;
                    return (
                      <div
                        key={officer.id}
                        onClick={() => {
                          setSelectedCanBoId(officer.id);
                          setError(null);
                        }}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
                            : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {officer.name
                              .split(' ')
                              .slice(-2)
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs truncate">
                                {officer.name}
                              </span>
                              {officer.isLeader && (
                                <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                                  Trưởng phòng
                                </span>
                              )}
                              {officer.isCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                  Tôi (Tự phân công)
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 truncate block">
                              {officer.role}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Indicator số việc đang xử lý */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold font-label-technical ${
                              officer.workloadCount > 12
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {officer.workloadCount} việc đang xử lý
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && (
                              <span className="material-symbols-outlined text-[12px]">check</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {error && <p className="text-[11px] text-[#C62828] font-medium">{error}</p>}
            </div>

            {/* Trường: Ghi chú phân công */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-800">
                  Ghi chú phân công <span className="text-slate-400 font-normal">(Không bắt buộc)</span>
                </label>
                <span className="text-[11px] text-slate-400">Chỉ đạo nghiệp vụ nếu có</span>
              </div>
              <textarea
                rows={2}
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="Ví dụ: Đề nghị cán bộ khẩn trương phối hợp kiểm tra hiện trường trước ngày..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] transition-all resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="submit"
            form="phan-cong-form"
            className="px-5 py-2 rounded-xl bg-[#C62828] hover:bg-[#b71c1c] active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
            <span>Xác nhận phân công</span>
          </button>
        </div>
      </div>
    </div>
  );
}
