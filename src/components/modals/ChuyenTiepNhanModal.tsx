import React, { useState, useMemo } from 'react';
import { DEPARTMENTS, OFFICERS, Officer } from '../../constants/departments';

export interface ChuyenTiepNhanSubmitData {
  donViTiepNhanId: string;
  donViTiepNhanName: string;
  hinhThuc: 'hang_cho' | 'truc_tiep';
  canBoNhan?: Officer;
  ghiChu: string;
}

interface ChuyenTiepNhanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChuyenTiepNhanSubmitData) => void;
  donInfo: {
    code?: string;
    loaiDon: string;
    nguoiNop: string;
    ngayNhan: string;
    donViHienTai: string;
    noiDungTomTat?: string;
  };
}

export default function ChuyenTiepNhanModal({
  isOpen,
  onClose,
  onSubmit,
  donInfo,
}: ChuyenTiepNhanModalProps) {
  const [donViId, setDonViId] = useState<string>('tiep-dan');
  const [hinhThuc, setHinhThuc] = useState<'hang_cho' | 'truc_tiep'>('hang_cho');
  const [selectedCanBoId, setSelectedCanBoId] = useState<string>('');
  const [officerSearch, setOfficerSearch] = useState<string>('');
  const [ghiChu, setGhiChu] = useState<string>('');
  const [errors, setErrors] = useState<{ donVi?: string; canBo?: string }>({});

  // Lọc cán bộ thuộc đơn vị đã chọn (BR-06)
  const availableOfficers = useMemo(() => {
    return OFFICERS.filter((o) => o.departmentId === donViId);
  }, [donViId]);

  // Lọc cán bộ theo từ khóa tìm kiếm
  const filteredOfficers = useMemo(() => {
    if (!officerSearch.trim()) return availableOfficers;
    const query = officerSearch.toLowerCase().trim();
    return availableOfficers.filter(
      (o) =>
        o.name.toLowerCase().includes(query) ||
        o.role.toLowerCase().includes(query) ||
        (o.phone && o.phone.includes(query))
    );
  }, [availableOfficers, officerSearch]);

  const selectedDepartment = useMemo(() => {
    return DEPARTMENTS.find((d) => d.id === donViId) || DEPARTMENTS[0];
  }, [donViId]);

  // Reset officer khi đổi đơn vị
  const handleDepartmentChange = (newDeptId: string) => {
    setDonViId(newDeptId);
    setSelectedCanBoId('');
    setOfficerSearch('');
    if (errors.donVi || errors.canBo) {
      setErrors({});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { donVi?: string; canBo?: string } = {};

    if (!donViId) {
      newErrors.donVi = 'Vui lòng chọn đơn vị tiếp nhận';
    }

    if (hinhThuc === 'truc_tiep') {
      if (!selectedCanBoId) {
        newErrors.canBo = 'Vui lòng chọn cán bộ tiếp nhận và xử lý';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedOfficer = availableOfficers.find((o) => o.id === selectedCanBoId);

    onSubmit({
      donViTiepNhanId: donViId,
      donViTiepNhanName: selectedDepartment.name,
      hinhThuc,
      canBoNhan: selectedOfficer,
      ghiChu,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C62828]/10 text-[#C62828] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">forward_to_inbox</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-headline-md tracking-tight">
                Bàn giao &amp; chuyển tiếp nhận xử lý
              </h2>
              <p className="text-xs text-slate-500">
                Bàn giao đơn sang đơn vị tiếp nhận (chuyển vào mục "Đã bàn giao / theo dõi")
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* 1. Thẻ tóm tắt đơn */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-label-technical flex items-center justify-between">
              <span>Thông tin đơn tiếp nhận</span>
              {donInfo.code && (
                <span className="text-[#C62828] font-mono font-bold">{donInfo.code}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Loại đơn:</span>
                <span className="font-semibold text-slate-900">{donInfo.loaiDon}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Người nộp đơn:</span>
                <span className="font-semibold text-slate-900">{donInfo.nguoiNop}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Ngày tiếp nhận:</span>
                <span className="font-medium text-slate-800">{donInfo.ngayNhan}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Đơn vị hiện tại:</span>
                <span className="font-medium text-slate-800">{donInfo.donViHienTai}</span>
              </div>
            </div>

            {donInfo.noiDungTomTat && (
              <div className="pt-2 border-t border-slate-200/70">
                <span className="text-slate-500 block text-[11px] mb-0.5">Nội dung tóm tắt:</span>
                <p className="text-slate-700 italic line-clamp-2 leading-relaxed">
                  "{donInfo.noiDungTomTat}"
                </p>
              </div>
            )}
          </div>

          <form id="chuyen-tiep-nhan-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Trường 1: Đơn vị tiếp nhận * */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-800">
                Đơn vị tiếp nhận <span className="text-[#C62828]">*</span>
              </label>
              <div className="relative">
                <select
                  value={donViId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className={`w-full px-3 py-2.5 bg-white border rounded-xl text-xs text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] transition-all cursor-pointer ${
                    errors.donVi ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.leaderName ? `Trưởng phòng: ${dept.leaderName}` : ''})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none text-[18px]">
                  arrow_drop_down
                </span>
              </div>
              {errors.donVi && (
                <p className="text-[11px] text-[#C62828] font-medium">{errors.donVi}</p>
              )}
            </div>

            {/* Trường 2: Hình thức phân công */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-800">
                Hình thức phân công <span className="text-[#C62828]">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option 1: Chuyển về hàng chờ đơn vị (MẶC ĐỊNH) */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    hinhThuc === 'hang_cho'
                      ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="hinhThuc"
                    value="hang_cho"
                    checked={hinhThuc === 'hang_cho'}
                    onChange={() => {
                      setHinhThuc('hang_cho');
                      setSelectedCanBoId('');
                      setErrors({});
                    }}
                    className="mt-0.5 text-[#C62828] focus:ring-[#C62828] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-900 block text-xs">
                      Chuyển về hàng chờ của đơn vị
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Đơn vào hàng chờ "Chờ phân công". Trưởng phòng sẽ duyệt và giao cán bộ sau.
                    </span>
                  </div>
                </label>

                {/* Option 2: Giao trực tiếp cho cán bộ */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    hinhThuc === 'truc_tiep'
                      ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="hinhThuc"
                    value="truc_tiep"
                    checked={hinhThuc === 'truc_tiep'}
                    onChange={() => {
                      setHinhThuc('truc_tiep');
                      setErrors({});
                    }}
                    className="mt-0.5 text-[#C62828] focus:ring-[#C62828] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-900 block text-xs">
                      Giao trực tiếp cho cán bộ
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Chỉ định ngay cán bộ thụ lý. Đơn chuyển thành "Đã phân công" và sinh task.
                    </span>
                  </div>
                </label>
              </div>

              {/* Thông báo hướng dẫn khi chọn Hàng chờ đơn vị */}
              {hinhThuc === 'hang_cho' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 flex items-start gap-2 animate-fade-in">
                  <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">
                    info
                  </span>
                  <div className="text-[11.5px] leading-relaxed">
                    <span className="font-bold">Quy tắc chuẩn: </span>
                    Sau khi chuyển, Trưởng phòng hoặc người có quyền phân công sẽ giao đơn cho cán bộ xử lý.
                  </div>
                </div>
              )}
            </div>

            {/* Trường Cán bộ tiếp nhận (Chỉ hiển thị khi chọn Giao trực tiếp) */}
            {hinhThuc === 'truc_tiep' && (
              <div className="space-y-2 p-3.5 bg-blue-50/30 rounded-xl border border-blue-200/70 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">
                    Cán bộ tiếp nhận <span className="text-[#C62828]">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Thuộc {selectedDepartment.shortName} ({availableOfficers.length} cán bộ)
                  </span>
                </div>

                {/* Ô tìm kiếm cán bộ */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[17px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm theo tên cán bộ, chức vụ..."
                    value={officerSearch}
                    onChange={(e) => setOfficerSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Danh sách cán bộ để chọn */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-lg p-1.5 bg-white">
                  {filteredOfficers.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs">
                      Không tìm thấy cán bộ phù hợp trong đơn vị
                    </div>
                  ) : (
                    filteredOfficers.map((officer) => {
                      const isSelected = selectedCanBoId === officer.id;
                      return (
                        <div
                          key={officer.id}
                          onClick={() => {
                            setSelectedCanBoId(officer.id);
                            if (errors.canBo) setErrors((prev) => ({ ...prev, canBo: undefined }));
                          }}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
                              : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
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
                                    Lãnh đạo
                                  </span>
                                )}
                                {officer.isCurrentUser && (
                                  <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                    Chính mình
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 truncate block">
                                {officer.role}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Workload badge */}
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
                {errors.canBo && (
                  <p className="text-[11px] text-[#C62828] font-medium">{errors.canBo}</p>
                )}
              </div>
            )}

            {/* Trường 3: Ghi chú chuyển (không bắt buộc) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-800">
                  Ghi chú chuyển <span className="text-slate-400 font-normal">(Không bắt buộc)</span>
                </label>
                <span className="text-[11px] text-slate-400">Tối đa 500 ký tự</span>
              </div>
              <textarea
                rows={3}
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="Nhập lý do chuyển hoặc lưu ý chỉ đạo chuyển tiếp nhận cho đơn vị/cán bộ..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] transition-all resize-none"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            Hủy
          </button>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              form="chuyen-tiep-nhan-form"
              className="px-5 py-2 rounded-xl bg-[#C62828] hover:bg-[#b71c1c] active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">outbox</span>
              <span>Bàn giao hồ sơ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
