import React, { useState, useMemo, useEffect } from 'react';
import { DEPARTMENTS, OFFICERS, Officer } from '../../constants/departments';

export interface ChuyenTiepNhanSubmitData {
  donViTiepNhanId: string;
  donViTiepNhanName: string;
  hinhThuc: 'hang_cho' | 'truc_tiep';
  canBoNhan?: Officer;
  ghiChu: string;
  banGiaoType: 'don_vi_khac' | 'can_bo_khac';
}

interface ChuyenTiepNhanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChuyenTiepNhanSubmitData) => void;
  currentDepartmentId?: string;
  donInfo: {
    code?: string;
    loaiDon: string;
    nguoiNop: string;
    ngayNhan: string;
    donViHienTai: string;
    noiDungTomTat?: string;
    suggestedDeptId?: string;
    isPersonalProcessing?: boolean;
  };
}

export default function ChuyenTiepNhanModal({
  isOpen,
  onClose,
  onSubmit,
  currentDepartmentId = 'tiep-dan',
  donInfo,
}: ChuyenTiepNhanModalProps) {
  // Đơn vị mặc định: ưu tiên đơn vị AI gợi ý, nếu không thì đơn vị chuyên môn đầu tiên
  const defaultDeptId = useMemo(() => {
    if (donInfo.suggestedDeptId && DEPARTMENTS.some((d) => d.id === donInfo.suggestedDeptId)) {
      return donInfo.suggestedDeptId;
    }
    const other = DEPARTMENTS.find((d) => d.id !== currentDepartmentId);
    return other?.id || 'qldt';
  }, [donInfo.suggestedDeptId, currentDepartmentId]);

  const [donViId, setDonViId] = useState<string>(defaultDeptId);
  const [selectedCanBoId, setSelectedCanBoId] = useState<string>('');
  const [expandedDeptIds, setExpandedDeptIds] = useState<string[]>([defaultDeptId]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTreeOpen, setIsTreeOpen] = useState<boolean>(true);
  const [ghiChu, setGhiChu] = useState<string>('');
  const [errors, setErrors] = useState<{ donVi?: string }>({});

  // Reset state mỗi khi mở modal hoặc thay đổi hồ sơ
  useEffect(() => {
    if (isOpen) {
      const initialId = (donInfo.suggestedDeptId && DEPARTMENTS.some((d) => d.id === donInfo.suggestedDeptId))
        ? donInfo.suggestedDeptId
        : (DEPARTMENTS.find((d) => d.id !== currentDepartmentId)?.id || 'qldt');
      setDonViId(initialId);
      setSelectedCanBoId('');
      setExpandedDeptIds([initialId]);
      setSearchQuery('');
      setIsTreeOpen(true);
      setGhiChu('');
      setErrors({});
    }
  }, [isOpen, donInfo.code, donInfo.suggestedDeptId, currentDepartmentId]);

  // Toggle mở rộng / thu gọn 1 nhánh đơn vị trong cây
  const toggleExpandDept = (deptId: string) => {
    setExpandedDeptIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  // Lấy danh sách cán bộ của 1 đơn vị
  const getDeptOfficers = (deptId: string) => {
    if (deptId === currentDepartmentId) {
      return OFFICERS.filter((o) => o.departmentId === deptId && !o.isCurrentUser);
    }
    return OFFICERS.filter((o) => o.departmentId === deptId);
  };

  // Lọc cây theo từ khóa tìm kiếm
  const treeDepartments = useMemo(() => {
    if (!searchQuery.trim()) return DEPARTMENTS;
    const q = searchQuery.toLowerCase().trim();
    return DEPARTMENTS.filter((dept) => {
      const nameMatch = dept.name.toLowerCase().includes(q) || dept.shortName.toLowerCase().includes(q);
      const officerMatch = OFFICERS.some(
        (o) => o.departmentId === dept.id && (o.name.toLowerCase().includes(q) || o.role.toLowerCase().includes(q))
      );
      return nameMatch || officerMatch;
    });
  }, [searchQuery]);

  const selectedDepartment = useMemo(() => {
    return DEPARTMENTS.find((d) => d.id === donViId) || DEPARTMENTS[0];
  }, [donViId]);

  const selectedOfficer = useMemo(() => {
    if (!selectedCanBoId) return undefined;
    return OFFICERS.find((o) => o.id === selectedCanBoId);
  }, [selectedCanBoId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donViId) {
      setErrors({ donVi: 'Vui lòng chọn đơn vị tiếp nhận chuyển đến' });
      return;
    }

    const hinhThuc: 'hang_cho' | 'truc_tiep' = selectedOfficer ? 'truc_tiep' : 'hang_cho';
    const banGiaoType: 'don_vi_khac' | 'can_bo_khac' = selectedDepartment.id === currentDepartmentId ? 'can_bo_khac' : 'don_vi_khac';

    onSubmit({
      donViTiepNhanId: selectedDepartment.id,
      donViTiepNhanName: selectedDepartment.name,
      hinhThuc,
      canBoNhan: selectedOfficer,
      ghiChu,
      banGiaoType,
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
              <span className="material-symbols-outlined text-[20px]">outbox</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-headline-md tracking-tight">
                Chuyển đơn vị xử lý - {donInfo.code}
              </h2>

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
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Thông tin vắn tắt hồ sơ */}
          <form id="chuyen-tiep-nhan-form" onSubmit={handleSubmit} className="space-y-4">
            {/* SELECT DẠNG CÂY: ĐƠN VỊ TIẾP NHẬN TRƯỚC -> MỞ RỘNG CÁN BỘ BÊN DƯỚI */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <span>Đơn vị &amp; Cán bộ tiếp nhận</span>
                  <span className="text-[#C62828]">*</span>
                </label>
                <span className="text-[10.5px] text-slate-500 font-normal">
                  Chọn đơn vị để mở rộng danh sách cán bộ
                </span>
              </div>

              {/* Ô trigger dạng select cây */}
              <div
                onClick={() => setIsTreeOpen(!isTreeOpen)}
                className={`w-full px-3 py-2.5 bg-white border rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs ${
                  errors.donVi
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : isTreeOpen
                    ? 'border-[#C62828] ring-2 ring-[#C62828]/15'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-md bg-rose-50 text-[#C62828] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px]">account_tree</span>
                  </div>

                  <div className="min-w-0 flex-1 flex flex-wrap items-center gap-1.5">
                    {!selectedDepartment ? (
                      <span className="text-slate-400">-- Nhấp chọn đơn vị và cán bộ tiếp nhận (Dạng cây) --</span>
                    ) : (
                      <>
                        <span className="font-bold text-slate-900 flex items-center gap-1 truncate">
                          <span className="material-symbols-outlined text-[15px] text-slate-500">domain</span>
                          {selectedDepartment.name}
                        </span>
                        <span className="text-slate-300">/</span>
                        {selectedOfficer ? (
                          <span className="font-bold text-blue-700 flex items-center gap-1 truncate bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            {selectedOfficer.name} ({selectedOfficer.role})
                          </span>
                        ) : (
                          <span className="font-semibold text-amber-800 flex items-center gap-1 truncate bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                            <span className="material-symbols-outlined text-[14px] text-amber-600">hourglass_top</span>
                            Hàng chờ đơn vị (Không chỉ định cán bộ)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {selectedCanBoId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCanBoId('');
                      }}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Bỏ chọn cán bộ (chuyển về hàng chờ đơn vị)"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                  )}
                  <span className="material-symbols-outlined text-slate-400 text-[20px] transition-transform">
                    {isTreeOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
              </div>

              {errors.donVi && (
                <p className="text-[11px] text-[#C62828] font-medium">{errors.donVi}</p>
              )}

              {/* KHUNG DANH SÁCH DẠNG CÂY (TREE VIEW) */}
              {isTreeOpen && (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs animate-fade-in mt-1.5">
                  {/* Thanh tìm kiếm nhanh */}
                  <div className="p-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[17px] shrink-0">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Tìm kiếm nhanh đơn vị, phòng ban hoặc tên cán bộ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </div>

                  {/* Danh sách các nút cây */}
                  <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                    {treeDepartments.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        Không tìm thấy đơn vị hoặc cán bộ phù hợp
                      </div>
                    ) : (
                      treeDepartments.map((dept) => {
                        const isExpanded = searchQuery.trim() ? true : expandedDeptIds.includes(dept.id);
                        const isDeptActive = donViId === dept.id;
                        const isQueueActive = isDeptActive && !selectedCanBoId;
                        const deptOfficers = getDeptOfficers(dept.id);
                        const filteredDeptOfficers = searchQuery.trim()
                          ? deptOfficers.filter(
                              (o) =>
                                o.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                                o.role.toLowerCase().includes(searchQuery.toLowerCase().trim())
                            )
                          : deptOfficers;

                        return (
                          <div key={dept.id} className="rounded-lg transition-colors">
                            {/* NÚT CẤP 1: ĐƠN VỊ TIẾP NHẬN */}
                            <div
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                                isDeptActive
                                  ? 'bg-rose-50/70 text-slate-900 font-semibold border border-rose-200'
                                  : 'hover:bg-slate-50 text-slate-800 border border-transparent'
                              }`}
                              onClick={() => {
                                setDonViId(dept.id);
                                if (!isExpanded) {
                                  setExpandedDeptIds((prev) => [...prev, dept.id]);
                                }
                                if (errors.donVi) setErrors({});
                              }}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                {/* Mũi tên mở rộng / thu gọn */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpandDept(dept.id);
                                  }}
                                  className="w-5 h-5 rounded hover:bg-slate-200/80 text-slate-500 flex items-center justify-center shrink-0 transition-colors"
                                  title={isExpanded ? 'Thu gọn' : 'Mở rộng cán bộ'}
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    {isExpanded ? 'arrow_drop_down' : 'arrow_right'}
                                  </span>
                                </button>

                                <span
                                  className={`material-symbols-outlined text-[18px] shrink-0 ${
                                    isDeptActive ? 'text-[#C62828]' : 'text-slate-500'
                                  }`}
                                >
                                  domain
                                </span>

                                <span className="text-xs truncate font-medium">
                                  {dept.name}
                                </span>

                                {dept.id === currentDepartmentId && (
                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-medium shrink-0">
                                    Hiện tại
                                  </span>
                                )}

                                {donInfo.suggestedDeptId === dept.id && (
                                  <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium shrink-0 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[11px]">auto_awesome</span>
                                    Gợi ý
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="text-[10.5px] text-slate-400">
                                  {deptOfficers.length} cán bộ
                                </span>
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    isDeptActive
                                      ? 'border-[#C62828] bg-[#C62828] text-white'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {isDeptActive && (
                                    <span className="material-symbols-outlined text-[10px]">check</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* NÚT CẤP 2: CÁN BỘ CỦA ĐƠN VỊ - CHỈ HIỂN THỊ KHI ĐƠN VỊ ĐƯỢC CHỌN / MỞ RỘNG! */}
                            {isExpanded && (
                              <div className="ml-5 pl-3 border-l-2 border-slate-200/90 space-y-1 my-1 animate-fade-in">
                                {/* Lựa chọn 1: Hàng chờ đơn vị (Không chỉ định cán bộ) */}
                                <div
                                  onClick={() => {
                                    setDonViId(dept.id);
                                    setSelectedCanBoId('');
                                    if (errors.donVi) setErrors({});
                                  }}
                                  className={`p-1.5 px-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                                    isQueueActive
                                      ? 'bg-amber-50/90 border border-amber-300 ring-1 ring-amber-300/60 text-amber-900 font-medium'
                                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="material-symbols-outlined text-amber-600 text-[16px] shrink-0">
                                      hourglass_top
                                    </span>
                                    <div className="min-w-0">
                                      <span className="text-[11.5px] font-bold block truncate">
                                        Không chỉ định (Chuyển về hàng chờ đơn vị)
                                      </span>
                                      <span className="text-[10px] text-slate-500 block truncate">
                                        Lãnh đạo {dept.shortName} ({dept.leaderName || 'Trưởng phòng'}) sẽ duyệt và phân công
                                      </span>
                                    </div>
                                  </div>
                                  {isQueueActive && (
                                    <span className="material-symbols-outlined text-amber-600 text-[16px] shrink-0">
                                      check_circle
                                    </span>
                                  )}
                                </div>

                                {/* Lựa chọn 2..N: Danh sách cán bộ của đơn vị */}
                                {filteredDeptOfficers.length === 0 ? (
                                  <div className="py-2 text-center text-slate-400 text-[11px] italic">
                                    {deptOfficers.length === 0 ? 'Đơn vị chưa có cán bộ tiếp nhận' : 'Không tìm thấy cán bộ phù hợp'}
                                  </div>
                                ) : (
                                  filteredDeptOfficers.map((officer) => {
                                    const isOfficerActive = isDeptActive && selectedCanBoId === officer.id;
                                    return (
                                      <div
                                        key={officer.id}
                                        onClick={() => {
                                          setDonViId(dept.id);
                                          setSelectedCanBoId(isOfficerActive ? '' : officer.id);
                                          if (errors.donVi) setErrors({});
                                        }}
                                        className={`p-1.5 px-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                                          isOfficerActive
                                            ? 'bg-blue-50 border border-blue-400 ring-1 ring-blue-300 text-blue-900 font-medium'
                                            : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[9.5px] flex items-center justify-center shrink-0">
                                            {officer.name.split(' ').slice(-2).map((n) => n[0]).join('')}
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-xs font-semibold text-slate-900 truncate">
                                                {officer.name}
                                              </span>
                                              {officer.isLeader && (
                                                <span className="px-1 py-0.1 bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold rounded shrink-0">
                                                  Lãnh đạo
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-[10px] text-slate-500 block truncate">
                                              {officer.role}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                          <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-medium">
                                            {officer.workloadCount} việc
                                          </span>
                                          {isOfficerActive && (
                                            <span className="material-symbols-outlined text-blue-600 text-[16px]">
                                              check_circle
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ghi chú chuyển bàn giao */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-800 text-xs">
                  Ghi chú chuyển bàn giao <span className="text-slate-400 font-normal">(Không bắt buộc)</span>
                </label>
                <span className="text-[11px] text-slate-400">Tối đa 500 ký tự</span>
              </div>
              <textarea
                rows={3}
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="Nhập lý do chuyển hoặc nội dung chỉ đạo, lưu ý khi bàn giao hồ sơ..."
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
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Xác nhận chuyển</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
