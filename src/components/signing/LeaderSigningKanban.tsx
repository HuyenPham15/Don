// src/components/signing/LeaderSigningKanban.tsx
import React, { useState, useMemo } from 'react';
import { Screen } from '../../types';
import {
  SigningDocument,
  SigningStatus,
  DocumentType,
  CurrentUserAccount,
  DEMO_ACCOUNTS,
} from '../../types/signing';

interface LeaderSigningKanbanProps {
  documents: SigningDocument[];
  onUpdateDocuments: (docs: SigningDocument[]) => void;
  onNav: (s: Screen) => void;
  onSelectHoSo?: (hoSoCode: string) => void;
  currentAccount?: CurrentUserAccount;
  onSwitchAccount?: (account: CurrentUserAccount) => void;
  onOpenDetailedView?: () => void;
  onSwitchToTasksView?: () => void;
  initialKpiFilter?: 'all' | 'urgent' | 'pending' | 'returned' | 'signed';
}

export default function LeaderSigningKanban({
  documents,
  onUpdateDocuments,
  onNav,
  onSelectHoSo,
  currentAccount = DEMO_ACCOUNTS[1], // Default Lãnh đạo
  onSwitchAccount,
  onOpenDetailedView,
  onSwitchToTasksView,
  initialKpiFilter = 'all',
}: LeaderSigningKanbanProps) {
  // Lọc chỉ những văn bản ĐÃ ĐƯỢC TRÌNH TỚI LÃNH ĐẠO (không lấy bản nháp hoặc chờ trình của cán bộ)
  const submittedDocs = useMemo(() => {
    return documents.filter((d) => d.status !== 'nhap' && d.status !== 'cho_trinh');
  }, [documents]);

  // Bộ lọc & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLoaiVB, setFilterLoaiVB] = useState<string>('all');
  const [filterCanBo, setFilterCanBo] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // KPI Filter nhanh
  const [kpiFilter, setKpiFilter] = useState<'all' | 'urgent' | 'pending' | 'returned' | 'signed'>(initialKpiFilter);

  React.useEffect(() => {
    if (initialKpiFilter) {
      setKpiFilter(initialKpiFilter);
    }
  }, [initialKpiFilter]);

  // Modal xem & ký số
  const [activeSignDoc, setActiveSignDoc] = useState<SigningDocument | null>(null);
  const [leaderOpinion, setLeaderOpinion] = useState<string>('');
  const [certType, setCertType] = useState<'vgca' | 'usb_token' | 'smart_ca'>('vgca');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Modal yêu cầu chỉnh sửa
  const [activeReturnDoc, setActiveReturnDoc] = useState<SigningDocument | null>(null);
  const [returnReason, setReturnReason] = useState<string>('');
  const [returnError, setReturnError] = useState<string | null>(null);

  // Modal từ chối ký
  const [activeRejectDoc, setActiveRejectDoc] = useState<SigningDocument | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Toast thông báo
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3800);
  };

  // Thống kê 5 chỉ số cho Lãnh đạo
  const kpis = useMemo(() => {
    const total = submittedDocs.length;
    const urgent = submittedDocs.filter(
      (d) => d.status === 'da_trinh' && (d.mucDoUuTien === 'khan' || d.mucDoUuTien === 'hoa_toc')
    ).length;
    const regularPending = submittedDocs.filter(
      (d) => d.status === 'da_trinh' && d.mucDoUuTien === 'thuong'
    ).length;
    const returned = submittedDocs.filter((d) => d.status === 'yeu_cau_chinh_sua').length;
    const signed = submittedDocs.filter((d) => d.status === 'da_ky').length;
    return { total, urgent, regularPending, returned, signed };
  }, [submittedDocs]);

  // Danh sách cán bộ trình duy nhất
  const uniqueCanBoList = useMemo(() => {
    const set = new Set<string>();
    submittedDocs.forEach((d) => {
      if (d.nguoiTrinh) set.add(d.nguoiTrinh);
    });
    return Array.from(set);
  }, [submittedDocs]);

  // Áp dụng bộ lọc
  const filteredDocs = useMemo(() => {
    return submittedDocs.filter((d) => {
      // Tìm kiếm
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        d.id.toLowerCase().includes(term) ||
        d.hoSoCode.toLowerCase().includes(term) ||
        d.tenVanBan.toLowerCase().includes(term) ||
        d.nguoiGuiDon.toLowerCase().includes(term) ||
        (d.nguoiTrinh || '').toLowerCase().includes(term);

      if (!matchSearch) return false;

      // Loại văn bản
      if (filterLoaiVB !== 'all' && d.loaiVanBan !== filterLoaiVB) return false;

      // Cán bộ trình
      if (filterCanBo !== 'all' && d.nguoiTrinh !== filterCanBo) return false;

      // Mức độ ưu tiên
      if (filterPriority !== 'all' && d.mucDoUuTien !== filterPriority) return false;

      // KPI filter
      if (kpiFilter === 'urgent') {
        return d.status === 'da_trinh' && (d.mucDoUuTien === 'khan' || d.mucDoUuTien === 'hoa_toc');
      }
      if (kpiFilter === 'pending') {
        return d.status === 'da_trinh' && d.mucDoUuTien === 'thuong';
      }
      if (kpiFilter === 'returned') {
        return d.status === 'yeu_cau_chinh_sua';
      }
      if (kpiFilter === 'signed') {
        return d.status === 'da_ky' || d.status === 'tu_choi';
      }

      return true;
    });
  }, [submittedDocs, searchTerm, filterLoaiVB, filterCanBo, filterPriority, kpiFilter]);

  // Phân chia vào 4 cột Kanban cho Lãnh đạo
  const colUrgent = useMemo(
    () => filteredDocs.filter((d) => d.status === 'da_trinh' && (d.mucDoUuTien === 'khan' || d.mucDoUuTien === 'hoa_toc')),
    [filteredDocs]
  );
  const colPending = useMemo(
    () => filteredDocs.filter((d) => d.status === 'da_trinh' && d.mucDoUuTien === 'thuong'),
    [filteredDocs]
  );
  const colReturned = useMemo(
    () => filteredDocs.filter((d) => d.status === 'yeu_cau_chinh_sua'),
    [filteredDocs]
  );
  const colSigned = useMemo(
    () => filteredDocs.filter((d) => d.status === 'da_ky' || d.status === 'tu_choi'),
    [filteredDocs]
  );

  // Xử lý Ký số văn bản
  const handleExecuteSign = (doc: SigningDocument, opinionOverride?: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const certLabel =
        certType === 'vgca'
          ? 'Chữ ký số chuyên dùng công vụ - Ban Cơ yếu Chính phủ (VGCA)'
          : certType === 'smart_ca'
            ? 'Chữ ký số từ xa - VNPT SmartCA'
            : 'Chứng thư số Token USB Viettel-CA';

      const updated = documents.map((item) => {
        if (item.id !== doc.id) return item;
        return {
          ...item,
          status: 'da_ky' as SigningStatus,
          hanXuLy: 'Đã hoàn thành',
          chuKyInfo: {
            nguoiKy: currentAccount.name || 'Trần Văn Hùng',
            chucVu: currentAccount.roleLabel || 'Phó Chánh Thanh tra thành phố',
            coQuan: currentAccount.coQuan || currentAccount.phongBan || 'Thanh tra Thành phố',
            thoiGianKy: timeStr,
            loaiChungThu: certLabel,
            soSeri: '54 02 1A BC 89 22 FE 09',
            yKienLanhDao: opinionOverride || leaderOpinion || 'Phê duyệt ban hành theo đề xuất của Cán bộ thụ lý.',
          },
          history: [
            ...item.history,
            {
              id: `h-${Date.now()}`,
              time: timeStr,
              actor: `${currentAccount.name} (${currentAccount.roleLabel})`,
              action: 'Ký số văn bản phê duyệt thành công',
              note: `Ký duyệt bằng ${certLabel}. Ý kiến: ${opinionOverride || leaderOpinion || 'Đồng ý phê duyệt.'}`,
              signatureCert: certLabel,
            },
          ],
        };
      });

      onUpdateDocuments(updated);
      setIsProcessing(false);
      setActiveSignDoc(null);
      setLeaderOpinion('');
      showToast(`✓ Đã ký số công vụ thành công văn bản ${doc.id} bằng ${certType.toUpperCase()}!`);
    }, 700);
  };

  // Xử lý Yêu cầu chỉnh sửa
  const handleExecuteReturn = () => {
    if (!returnReason.trim()) {
      setReturnError('Vui lòng nhập ý kiến chỉ đạo / nội dung cần cán bộ chỉnh sửa');
      return;
    }
    if (!activeReturnDoc) return;

    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const updated = documents.map((item) => {
        if (item.id !== activeReturnDoc.id) return item;
        return {
          ...item,
          status: 'yeu_cau_chinh_sua' as SigningStatus,
          lyDoTraLai: returnReason,
          history: [
            ...item.history,
            {
              id: `h-${Date.now()}`,
              time: timeStr,
              actor: `${currentAccount.name} (${currentAccount.roleLabel})`,
              action: 'Yêu cầu Cán bộ chỉnh sửa hoàn thiện dự thảo',
              note: returnReason,
            },
          ],
        };
      });

      onUpdateDocuments(updated);
      setIsProcessing(false);
      setActiveReturnDoc(null);
      setReturnReason('');
      setReturnError(null);
      showToast(`✓ Đã chuyển trả văn bản ${activeReturnDoc.id} về Cán bộ thụ lý (${activeReturnDoc.nguoiTrinh || 'Cán bộ'})!`);
    }, 500);
  };

  // Xử lý Từ chối ký
  const handleExecuteReject = () => {
    if (!rejectReason.trim()) return;
    if (!activeRejectDoc) return;

    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = documents.map((item) => {
      if (item.id !== activeRejectDoc.id) return item;
      return {
        ...item,
        status: 'tu_choi' as SigningStatus,
        hanXuLy: 'Đã đóng (Từ chối ký)',
        lyDoTuChoi: rejectReason,
        history: [
          ...item.history,
          {
            id: `h-${Date.now()}`,
            time: timeStr,
            actor: `${currentAccount.name} (${currentAccount.roleLabel})`,
            action: 'Từ chối ký văn bản',
            note: rejectReason,
          },
        ],
      };
    });

    onUpdateDocuments(updated);
    setActiveRejectDoc(null);
    setRejectReason('');
    showToast(`✓ Đã từ chối ký văn bản ${activeRejectDoc.id}`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-bounce border border-slate-700">
          <span className="material-symbols-outlined text-emerald-400 text-base">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER BÀN LÀM VIỆC LÃNH ĐẠO */}
      <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 to-blue-800 text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Văn bản trình tới Lãnh đạo
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                {kpis.total} văn bản
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Thẩm định, chỉ đạo bổ sung và thực hiện ký số công vụ các văn bản do Cán bộ thụ lý trình tới
            </p>
          </div>
        </div>

        {/* Nút thao tác nhanh bên phải */}
        <div className="flex items-center gap-2">
          {/* Chuyển đổi Kanban / Danh sách */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all ${viewMode === 'kanban'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              title="Xem bảng Kanban 4 cột"
            >
              <span className="material-symbols-outlined text-[17px]">view_kanban</span>
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all ${viewMode === 'table'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              title="Xem danh sách dạng bảng chi tiết"
            >
              <span className="material-symbols-outlined text-[17px]">view_list</span>
              <span>Danh sách</span>
            </button>
          </div>

          {/* Mở bàn ký chi tiết master-detail nếu có */}
          {onOpenDetailedView && (
            <button
              type="button"
              onClick={onOpenDetailedView}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
              title="Mở giao diện duyệt tuần tự văn bản kèm trình xem dự thảo tài liệu lớn"
            >
              <span className="material-symbols-outlined text-[17px] text-indigo-600">splitscreen</span>
              <span>Bàn duyệt chi tiết</span>
            </button>
          )}

          {/* Nút chuyển sang Bàn xử lý Lượt nhận / Đơn / Vụ việc */}
          {onSwitchToTasksView && (
            <button
              type="button"
              onClick={onSwitchToTasksView}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
              title="Chuyển sang Bàn trực tiếp xử lý Lượt nhận, Đơn và Vụ việc"
            >
              <span className="material-symbols-outlined text-[17px] text-indigo-700">folder_managed</span>
              <span>Xử lý Lượt nhận / Đơn / Vụ việc ➔</span>
            </button>
          )}

          {/* Nút đổi vai trò tài khoản để test */}
          {onSwitchAccount && (
            <button
              type="button"
              onClick={() => {
                const canBo = DEMO_ACCOUNTS.find((a) => a.role === 'can_bo');
                if (canBo) onSwitchAccount(canBo);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              title="Đổi sang tài khoản Cán bộ để xem quy trình thụ lý và trình ký"
            >
              <span className="material-symbols-outlined text-[17px] text-amber-600">swap_horiz</span>
              <span>Đổi sang Cán bộ</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI RIBBON - 5 CHỈ SỐ CỦA LÃNH ĐẠO */}
      <div className="px-5 pt-3.5 pb-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* KPI 1: Tổng văn bản trình tới */}
          <button
            type="button"
            onClick={() => setKpiFilter('all')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${kpiFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
              }`}
          >
            <div className="flex items-center justify-between text-[11.5px] font-medium opacity-80">
              <span>Tổng trình tới</span>
              <span className="material-symbols-outlined text-[16px]">folder_managed</span>
            </div>
            <div className="text-2xl font-bold font-mono mt-1.5 tracking-tight">
              {String(kpis.total).padStart(2, '0')}
            </div>
            <span className="text-[10px] opacity-70 mt-1">Toàn bộ văn bản đã tiếp nhận</span>
          </button>

          {/* KPI 2: HỎA TỐC & KHẨN CẤP */}
          <button
            type="button"
            onClick={() => setKpiFilter(kpiFilter === 'urgent' ? 'all' : 'urgent')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${kpiFilter === 'urgent'
                ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-600/30'
                : 'bg-rose-50/70 border-rose-200 hover:border-rose-300 text-rose-950'
              }`}
          >
            <div className="flex items-center justify-between text-[11.5px] font-bold">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${kpiFilter === 'urgent' ? 'bg-white' : 'bg-rose-500'} animate-ping`}></span>
                <span>Hỏa tốc / Khẩn</span>
              </span>
              <span className={`material-symbols-outlined text-[16px] ${kpiFilter === 'urgent' ? 'text-white' : 'text-rose-600'}`}>
                notifications_active
              </span>
            </div>
            <div className={`text-2xl font-bold font-mono mt-1.5 tracking-tight ${kpiFilter === 'urgent' ? 'text-white' : 'text-rose-700'}`}>
              {String(kpis.urgent).padStart(2, '0')}
            </div>
            <span className={`text-[10px] font-medium mt-1 ${kpiFilter === 'urgent' ? 'text-white/90' : 'text-rose-700'}`}>
              Ưu tiên ký duyệt ngay trong ngày
            </span>
          </button>

          {/* KPI 3: CHỜ KÝ DUYỆT THƯỜNG */}
          <button
            type="button"
            onClick={() => setKpiFilter(kpiFilter === 'pending' ? 'all' : 'pending')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${kpiFilter === 'pending'
                ? 'bg-indigo-700 text-white border-indigo-700 ring-2 ring-indigo-700/30'
                : 'bg-indigo-50/70 border-indigo-200 hover:border-indigo-300 text-indigo-950'
              }`}
          >
            <div className="flex items-center justify-between text-[11.5px] font-bold">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${kpiFilter === 'pending' ? 'bg-white' : 'bg-indigo-500'}`}></span>
                <span>Chờ ký duyệt</span>
              </span>
              <span className={`material-symbols-outlined text-[16px] ${kpiFilter === 'pending' ? 'text-white' : 'text-indigo-600'}`}>
                draw
              </span>
            </div>
            <div className={`text-2xl font-bold font-mono mt-1.5 tracking-tight ${kpiFilter === 'pending' ? 'text-white' : 'text-indigo-700'}`}>
              {String(kpis.regularPending).padStart(2, '0')}
            </div>
            <span className={`text-[10px] font-medium mt-1 ${kpiFilter === 'pending' ? 'text-white/90' : 'text-indigo-700'}`}>
              Hồ sơ bình thường trong hạn
            </span>
          </button>

          {/* KPI 4: ĐÃ YÊU CẦU CHỈNH SỬA */}
          <button
            type="button"
            onClick={() => setKpiFilter(kpiFilter === 'returned' ? 'all' : 'returned')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${kpiFilter === 'returned'
                ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-600/30'
                : 'bg-amber-50/70 border-amber-200 hover:border-amber-300 text-amber-950'
              }`}
          >
            <div className="flex items-center justify-between text-[11.5px] font-bold">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-amber-600">replay</span>
                <span>Yêu cầu chỉnh sửa</span>
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 text-[10px] font-bold">
                Trả lại
              </span>
            </div>
            <div className={`text-2xl font-bold font-mono mt-1.5 tracking-tight ${kpiFilter === 'returned' ? 'text-white' : 'text-amber-700'}`}>
              {String(kpis.returned).padStart(2, '0')}
            </div>
            <span className={`text-[10px] font-medium mt-1 ${kpiFilter === 'returned' ? 'text-white/90' : 'text-amber-700'}`}>
              Cán bộ đang tiếp thu sửa lại
            </span>
          </button>

          {/* KPI 5: ĐÃ KÝ BAN HÀNH */}
          <button
            type="button"
            onClick={() => setKpiFilter(kpiFilter === 'signed' ? 'all' : 'signed')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${kpiFilter === 'signed'
                ? 'bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-700/30'
                : 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300 text-emerald-950'
              }`}
          >
            <div className="flex items-center justify-between text-[11.5px] font-bold">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">task_alt</span>
                <span>Đã ký số ban hành</span>
              </span>
            </div>
            <div className={`text-2xl font-bold font-mono mt-1.5 tracking-tight ${kpiFilter === 'signed' ? 'text-white' : 'text-emerald-700'}`}>
              {String(kpis.signed).padStart(2, '0')}
            </div>
            <span className={`text-[10px] font-medium mt-1 ${kpiFilter === 'signed' ? 'text-white/90' : 'text-emerald-700'}`}>
              Đã ký số VGCA &amp; ban hành
            </span>
          </button>
        </div>
      </div>

      {/* THANH TÌM KIẾM & BỘ LỌC ĐA CHIỀU */}
      <div className="px-5 py-2">
        <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Mã văn bản, Mã hồ sơ, Tên văn bản, Cán bộ trình, Người nộp đơn..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Dropdown Lọc Loại văn bản */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterLoaiVB}
              onChange={(e) => setFilterLoaiVB(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Tất cả loại văn bản</option>
              <option value="to_trinh_thu_ly">Tờ trình đề xuất thụ lý</option>
              <option value="quyet_dinh_thu_ly">Quyết định thụ lý</option>
              <option value="thong_bao_khong_thu_ly">Thông báo không thụ lý</option>
              <option value="bao_cao_xac_minh">Báo cáo kết quả xác minh</option>
              <option value="ket_luan_to_cao">Kết luận nội dung tố cáo</option>
              <option value="bien_ban_ban_giao">Biên bản bàn giao</option>
            </select>

            {/* Dropdown Lọc Cán bộ trình */}
            <select
              value={filterCanBo}
              onChange={(e) => setFilterCanBo(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Tất cả cán bộ trình</option>
              {uniqueCanBoList.map((cb) => (
                <option key={cb} value={cb}>
                  {cb}
                </option>
              ))}
            </select>

            {/* Dropdown Lọc Mức độ ưu tiên */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Mọi mức độ ưu tiên</option>
              <option value="hoa_toc">Hỏa tốc</option>
              <option value="khan">Khẩn</option>
              <option value="thuong">Bình thường</option>
            </select>

            {/* Nút Đặt lại lọc nếu đang lọc */}
            {(searchTerm || filterLoaiVB !== 'all' || filterCanBo !== 'all' || filterPriority !== 'all' || kpiFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterLoaiVB('all');
                  setFilterCanBo('all');
                  setFilterPriority('all');
                  setKpiFilter('all');
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                title="Xóa toàn bộ bộ lọc"
              >
                <span className="material-symbols-outlined text-[15px]">filter_alt_off</span>
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH: KANBAN 4 CỘT HOẶC DANH SÁCH BẢNG */}
      <div className="flex-1 px-5 pb-5 overflow-auto">
        {viewMode === 'kanban' ? (
          /* BẢNG KANBAN 4 CỘT VĂN BẢN TRÌNH KÝ */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full min-h-[580px] items-start">
            {/* CỘT 1: HỎA TỐC & KHẨN CẤP */}
            <div className="flex flex-col h-full bg-slate-100/80 rounded-2xl border border-rose-200/80 p-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-rose-200 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1">
                    <span>Cần xử lý</span>
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[11px] font-bold shadow-2xs">
                  {colUrgent.length}
                </span>
              </div>

              {/* Danh sách Card Cột 1 */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-0.5">
                {colUrgent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 border border-dashed border-rose-200 rounded-xl bg-white/50">
                    <span className="material-symbols-outlined text-3xl text-rose-300 mb-1">done_all</span>
                    <span className="text-xs font-medium">Không có văn bản hỏa tốc nào cần duyệt</span>
                  </div>
                ) : (
                  colUrgent.map((doc) => (
                    <LeaderDocumentCard
                      key={doc.id}
                      doc={doc}
                      variant="urgent"
                      onQuickSign={() => {
                        setActiveSignDoc(doc);
                        setLeaderOpinion('');
                      }}
                      onQuickReturn={() => {
                        setActiveReturnDoc(doc);
                        setReturnReason('');
                      }}
                      onOpenDetail={() => {
                        setActiveSignDoc(doc);
                        setLeaderOpinion('');
                      }}
                      onSelectHoSo={onSelectHoSo}
                    />
                  ))
                )}
              </div>
            </div>

            {/* CỘT 2: CHỜ KÝ DUYỆT (HỒ SƠ THƯỜNG) */}
            <div className="flex flex-col h-full bg-slate-100/80 rounded-2xl border border-indigo-200/80 p-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-indigo-200 mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[18px]">pending_actions</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Chờ ký duyệt
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-700 text-white font-mono text-[11px] font-bold shadow-2xs">
                  {colPending.length}
                </span>
              </div>

              {/* Danh sách Card Cột 2 */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-0.5">
                {colPending.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 border border-dashed border-indigo-200 rounded-xl bg-white/50">
                    <span className="material-symbols-outlined text-3xl text-indigo-300 mb-1">checklist</span>
                    <span className="text-xs font-medium">Đã xử lý hết văn bản chờ ký</span>
                  </div>
                ) : (
                  colPending.map((doc) => (
                    <LeaderDocumentCard
                      key={doc.id}
                      doc={doc}
                      variant="pending"
                      onQuickSign={() => {
                        setActiveSignDoc(doc);
                        setLeaderOpinion('');
                      }}
                      onQuickReturn={() => {
                        setActiveReturnDoc(doc);
                        setReturnReason('');
                      }}
                      onOpenDetail={() => {
                        setActiveSignDoc(doc);
                        setLeaderOpinion('');
                      }}
                      onSelectHoSo={onSelectHoSo}
                    />
                  ))
                )}
              </div>
            </div>

            {/* CỘT 3: ĐÃ YÊU CẦU CHỈNH SỬA */}
            <div className="flex flex-col h-full bg-slate-100/80 rounded-2xl border border-amber-200/80 p-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-amber-200 mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">replay</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Yêu cầu chỉnh sửa
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white font-mono text-[11px] font-bold shadow-2xs">
                  {colReturned.length}
                </span>
              </div>

              {/* Danh sách Card Cột 3 */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-0.5">
                {colReturned.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 border border-dashed border-amber-200 rounded-xl bg-white/50">
                    <span className="material-symbols-outlined text-3xl text-amber-300 mb-1">assignment_turned_in</span>
                    <span className="text-xs font-medium">Không có văn bản nào bị trả lại chỉnh sửa</span>
                  </div>
                ) : (
                  colReturned.map((doc) => (
                    <LeaderDocumentCard
                      key={doc.id}
                      doc={doc}
                      variant="returned"
                      onOpenDetail={() => {
                        setActiveSignDoc(doc);
                        setLeaderOpinion(doc.lyDoTraLai || '');
                      }}
                      onSelectHoSo={onSelectHoSo}
                    />
                  ))
                )}
              </div>
            </div>

            {/* CỘT 4: ĐÃ KÝ SỐ & BAN HÀNH */}
            <div className="flex flex-col h-full bg-slate-100/80 rounded-2xl border border-emerald-200/80 p-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-emerald-200 mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Đã ký số ban hành
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-mono text-[11px] font-bold shadow-2xs">
                  {colSigned.length}
                </span>
              </div>

              {/* Danh sách Card Cột 4 */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-0.5">
                {colSigned.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 border border-dashed border-emerald-200 rounded-xl bg-white/50">
                    <span className="material-symbols-outlined text-3xl text-emerald-300 mb-1">history_edu</span>
                    <span className="text-xs font-medium">Chưa có văn bản nào được ký ban hành</span>
                  </div>
                ) : (
                  colSigned.map((doc) => (
                    <LeaderDocumentCard
                      key={doc.id}
                      doc={doc}
                      variant="signed"
                      onOpenDetail={() => {
                        setActiveSignDoc(doc);
                        setLeaderOpinion(doc.chuKyInfo?.yKienLanhDao || '');
                      }}
                      onSelectHoSo={onSelectHoSo}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* DANH SÁCH BẢNG CHO LÃNH ĐẠO */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">Mã VB / Hồ sơ</th>
                    <th className="py-3 px-4">Tên văn bản trình ký</th>
                    <th className="py-3 px-4">Cán bộ trình</th>
                    <th className="py-3 px-4">Độ ưu tiên</th>
                    <th className="py-3 px-4">Thời hạn xử lý</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác Lãnh đạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Không tìm thấy văn bản phù hợp với bộ lọc
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => {
                      const isUrgent = doc.mucDoUuTien === 'khan' || doc.mucDoUuTien === 'hoa_toc';
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-slate-900">{doc.id}</div>
                            <div
                              onClick={() => onSelectHoSo && onSelectHoSo(doc.hoSoCode)}
                              className="font-mono text-[11px] text-blue-600 hover:underline cursor-pointer"
                              title="Xem hồ sơ đơn gốc"
                            >
                              {doc.hoSoCode}
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-slate-900 leading-snug line-clamp-1">{doc.tenVanBan}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{doc.trichYeu}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{doc.nguoiTrinh || doc.nguoiLap}</div>
                            <div className="text-[10.5px] text-slate-500">{doc.thoiGianTrinh || doc.ngayTao}</div>
                          </td>
                          <td className="py-3 px-4">
                            {doc.mucDoUuTien === 'hoa_toc' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider">
                                Hỏa tốc
                              </span>
                            )}
                            {doc.mucDoUuTien === 'khan' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase tracking-wider">
                                Khẩn
                              </span>
                            )}
                            {doc.mucDoUuTien === 'thuong' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                                Thường
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[11px] font-semibold ${isUrgent ? 'text-rose-700' : 'text-slate-700'}`}>
                              {doc.hanXuLy || 'Trong hạn'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {doc.status === 'da_trinh' && (
                              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Chờ ký duyệt
                              </span>
                            )}
                            {doc.status === 'yeu_cau_chinh_sua' && (
                              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Đã yêu cầu sửa
                              </span>
                            )}
                            {doc.status === 'da_ky' && (
                              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Đã ký số ban hành
                              </span>
                            )}
                            {doc.status === 'tu_choi' && (
                              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                                Từ chối ký
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {doc.status === 'da_trinh' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveSignDoc(doc);
                                      setLeaderOpinion('');
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">draw</span>
                                    <span>Ký số</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveReturnDoc(doc);
                                      setReturnReason('');
                                    }}
                                    className="px-2 py-1 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-50 border border-amber-300 transition-colors cursor-pointer"
                                    title="Yêu cầu cán bộ chỉnh sửa lại"
                                  >
                                    Sửa
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveSignDoc(doc);
                                    setLeaderOpinion(doc.chuKyInfo?.yKienLanhDao || doc.lyDoTraLai || '');
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                                >
                                  Chi tiết
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: XEM DỰ THẢO & THỰC HIỆN KÝ SỐ CÔNG VỤ (LEADER SIGN MODAL)       */}
      {/* ========================================================================= */}
      {activeSignDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-xl">verified_user</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                      {activeSignDoc.id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {activeSignDoc.status === 'da_ky' ? 'Văn bản đã ký duyệt' : 'Thẩm định & Phê duyệt ký số văn bản'}
                    </h3>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Hồ sơ liên quan: <strong className="font-mono text-slate-800">{activeSignDoc.hoSoCode}</strong></span>
                    {onSelectHoSo && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectHoSo(activeSignDoc.hoSoCode);
                          setActiveSignDoc(null);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-[10.5px] cursor-pointer transition-colors"
                        title="Mở trực tiếp hồ sơ Lượt nhận / Đơn / Vụ việc này để xem xét hoặc trực tiếp xử lý"
                      >
                        <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                        <span>Mở xử lý hồ sơ gốc</span>
                      </button>
                    )}
                    <span>•</span>
                    <span>Cán bộ trình: <strong>{activeSignDoc.nguoiTrinh || activeSignDoc.nguoiLap}</strong> ({activeSignDoc.thoiGianTrinh || activeSignDoc.ngayTao})</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSignDoc(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
              {/* Banner cảnh báo Khẩn / Hạn */}
              {activeSignDoc.mucDoUuTien === 'hoa_toc' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-900 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="material-symbols-outlined text-rose-600 text-lg">warning</span>
                    <span>VĂN BẢN HỎA TỐC: Cần hoàn tất ký số và phát hành ngay trong buổi làm việc</span>
                  </div>
                  <span className="font-mono font-bold px-2 py-0.5 bg-rose-600 text-white rounded">
                    {activeSignDoc.hanXuLy}
                  </span>
                </div>
              )}

              {/* Thông tin hồ sơ & Trích yếu */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-slate-500">Tên văn bản:</span>
                    <div className="font-bold text-slate-900 mt-0.5 text-sm">{activeSignDoc.tenVanBan}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Người nộp đơn tố cáo:</span>
                    <div className="font-semibold text-slate-900 mt-0.5">{activeSignDoc.nguoiGuiDon}</div>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-slate-500">Trích yếu nội dung:</span>
                  <div className="font-medium text-slate-800 mt-0.5 italic bg-white p-2.5 rounded-xl border border-slate-200">
                    "{activeSignDoc.trichYeu}"
                  </div>
                </div>
              </div>

              {/* Ý kiến cán bộ trình */}
              {activeSignDoc.yKienCanBo && (
                <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                    <span className="material-symbols-outlined text-blue-600 text-[16px]">record_voice_over</span>
                    <span>Ý kiến đề xuất của Cán bộ thụ lý ({activeSignDoc.nguoiTrinh}):</span>
                  </div>
                  <p className="text-blue-950 leading-relaxed pl-5">
                    {activeSignDoc.yKienCanBo}
                  </p>
                </div>
              )}

              {/* Toàn văn dự thảo văn bản trình duyệt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[17px] text-indigo-600">article</span>
                    <span>Nội dung dự thảo trình Lãnh đạo phê duyệt</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Định dạng hành chính chuẩn</span>
                </div>
                <div className="p-5 rounded-2xl border border-slate-300 bg-slate-50/30 text-xs font-serif leading-relaxed text-slate-900 whitespace-pre-line shadow-2xs max-h-72 overflow-y-auto">
                  {activeSignDoc.noiDungChiTiet}
                </div>
              </div>

              {/* Danh sách tệp đính kèm */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px] text-slate-600">attach_file</span>
                  <span>Tài liệu đính kèm ({activeSignDoc.tepDinhKem?.length || 0})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {activeSignDoc.tepDinhKem?.map((file) => (
                    <div
                      key={file.id}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 transition-colors flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-indigo-600 text-lg">
                          {file.tenTep.endsWith('.docx') ? 'description' : 'picture_as_pdf'}
                        </span>
                        <div className="truncate">
                          <div className="text-[11.5px] font-bold text-slate-800 truncate" title={file.tenTep}>
                            {file.tenTep}
                          </div>
                          <span className="text-[10px] text-slate-400">{file.dungLuong}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer shrink-0">
                        Xem
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nếu đã ký: Hiển thị chứng thư số & thời gian ký */}
              {activeSignDoc.status === 'da_ky' && activeSignDoc.chuKyInfo && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-2">
                    <span className="material-symbols-outlined text-emerald-600">verified</span>
                    <span>THÔNG TIN CHỨNG THƯ KÝ SỐ CÔNG VỤ (ĐÃ BAN HÀNH)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-950">
                    <div>Người ký: <strong>{activeSignDoc.chuKyInfo.nguoiKy}</strong> ({activeSignDoc.chuKyInfo.chucVu})</div>
                    <div>Thời gian ký: <strong>{activeSignDoc.chuKyInfo.thoiGianKy}</strong></div>
                    <div>Loại chứng thư: <strong>{activeSignDoc.chuKyInfo.loaiChungThu}</strong></div>
                    <div>Số seri: <strong className="font-mono">{activeSignDoc.chuKyInfo.soSeri}</strong></div>
                  </div>
                  {activeSignDoc.chuKyInfo.yKienLanhDao && (
                    <div className="mt-2 pt-2 border-t border-emerald-200 text-xs text-emerald-900">
                      Ý kiến chỉ đạo: <em>"{activeSignDoc.chuKyInfo.yKienLanhDao}"</em>
                    </div>
                  )}
                </div>
              )}

              {/* Nếu đang chờ duyệt: Khu vực chọn chứng thư & ký số */}
              {activeSignDoc.status === 'da_trinh' && (
                <div className="p-4 bg-slate-50 border border-indigo-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-indigo-600 text-[17px]">edit_note</span>
                      <span>Ý kiến chỉ đạo / Ghi chú của Lãnh đạo khi phê duyệt:</span>
                    </label>
                    <span className="text-[10.5px] text-slate-400">Tùy chọn ghi thêm chỉ đạo</span>
                  </div>
                  <textarea
                    rows={2}
                    value={leaderOpinion}
                    onChange={(e) => setLeaderOpinion(e.target.value)}
                    placeholder="Ví dụ: Đồng ý phê duyệt thụ lý. Yêu cầu Tổ xác minh làm việc khẩn trương và báo cáo tiến độ trước ngày 25/09..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  />

                  {/* Lựa chọn phương thức ký số */}
                  <div>
                    <label className="text-[11.5px] font-bold text-slate-700 block mb-1.5">
                      Phương thức ký số điện tử:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${certType === 'vgca'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name="certType"
                          checked={certType === 'vgca'}
                          onChange={() => setCertType('vgca')}
                          className="text-indigo-600"
                        />
                        <div className="text-[11px] leading-tight">
                          <div>Ban Cơ yếu (VGCA)</div>
                          <div className="text-[9.5px] text-slate-400 font-normal">Chữ ký số công vụ</div>
                        </div>
                      </label>

                      <label
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${certType === 'usb_token'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name="certType"
                          checked={certType === 'usb_token'}
                          onChange={() => setCertType('usb_token')}
                          className="text-indigo-600"
                        />
                        <div className="text-[11px] leading-tight">
                          <div>USB Token</div>
                          <div className="text-[9.5px] text-slate-400 font-normal">Viettel / VNPT Token</div>
                        </div>
                      </label>

                      <label
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${certType === 'smart_ca'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name="certType"
                          checked={certType === 'smart_ca'}
                          onChange={() => setCertType('smart_ca')}
                          className="text-indigo-600"
                        />
                        <div className="text-[11px] leading-tight">
                          <div>VNPT SmartCA</div>
                          <div className="text-[9.5px] text-slate-400 font-normal">Ký số từ xa di động</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveSignDoc(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                {activeSignDoc.status === 'da_trinh' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const target = activeSignDoc;
                        setActiveSignDoc(null);
                        setActiveReturnDoc(target);
                      }}
                      className="px-4 py-2 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[17px]">replay</span>
                      <span>Yêu cầu chỉnh sửa</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleExecuteSign(activeSignDoc)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <>
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                          <span>Đang xác thực chứng thư số...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                          <span>KÝ SỐ CÔNG VỤ ({certType.toUpperCase()})</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: YÊU CẦU CHỈNH SỬA VĂN BẢN (RETURN FOR EDIT)                     */}
      {/* ========================================================================= */}
      {activeReturnDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <span className="material-symbols-outlined text-amber-600">replay</span>
                <span>Yêu cầu Cán bộ chỉnh sửa hoàn thiện dự thảo</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveReturnDoc(null);
                  setReturnReason('');
                  setReturnError(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-amber-100 text-amber-800 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div>Văn bản: <strong className="font-mono text-slate-800">{activeReturnDoc.id}</strong> - {activeReturnDoc.tenVanBan}</div>
                <div>Cán bộ trình: <strong>{activeReturnDoc.nguoiTrinh || activeReturnDoc.nguoiLap}</strong> ({activeReturnDoc.donViNguoiLap})</div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1.5">
                  Ý kiến chỉ đạo / Nội dung cần sửa đổi, bổ sung <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  rows={4}
                  value={returnReason}
                  onChange={(e) => {
                    setReturnReason(e.target.value);
                    if (returnError) setReturnError(null);
                  }}
                  placeholder="Nêu rõ căn cứ cần bổ sung, sai sót trong dự thảo hoặc tài liệu kiểm tra thực địa cần đối chất thêm..."
                  className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 ${returnError
                      ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-600'
                    }`}
                />
                {returnError && <p className="text-[11px] text-rose-600 mt-1">{returnError}</p>}
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                Khi xác nhận, văn bản sẽ được chuyển về tab "Trình ký" của Cán bộ thụ lý kèm theo thông báo và ý kiến chỉ đạo trên.
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveReturnDoc(null);
                  setReturnReason('');
                  setReturnError(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteReturn}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">send</span>
                <span>Chuyển trả cán bộ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// COMPONENT CARD CHO VĂN BẢN TRÌNH KÝ TRONG BẢNG KANBAN CỦA LÃNH ĐẠO
// =========================================================================
interface LeaderDocumentCardProps {
  doc: SigningDocument;
  variant: 'urgent' | 'pending' | 'returned' | 'signed';
  onQuickSign?: () => void;
  onQuickReturn?: () => void;
  onOpenDetail?: () => void;
  onSelectHoSo?: (hoSoCode: string) => void;
}

function LeaderDocumentCard({
  doc,
  variant,
  onQuickSign,
  onQuickReturn,
  onOpenDetail,
  onSelectHoSo,
}: LeaderDocumentCardProps) {
  const isUrgent = doc.mucDoUuTien === 'khan' || doc.mucDoUuTien === 'hoa_toc';

  return (
    <div
      onClick={onOpenDetail}
      className={`bg-white rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col gap-2 relative cursor-pointer group/card border ${variant === 'urgent'
          ? 'border-rose-300 hover:border-rose-500 ring-1 ring-rose-100'
          : variant === 'returned'
            ? 'border-amber-300 hover:border-amber-500'
            : variant === 'signed'
              ? 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/20'
              : 'border-slate-200 hover:border-indigo-400'
        }`}
    >
      {/* DÒNG 1: BADGE MỨC ĐỘ & MÃ VĂN BẢN & MÃ HỒ SƠ */}
      <div className="flex items-center gap-1.5 text-xs flex-wrap">
        {doc.mucDoUuTien === 'hoa_toc' && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider animate-pulse">
            HỎA TỐC
          </span>
        )}
        {doc.mucDoUuTien === 'khan' && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider">
            KHẨN
          </span>
        )}
        {doc.mucDoUuTien === 'thuong' && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
            THƯỜNG
          </span>
        )}

        {/* Mã văn bản */}
        <span className="font-mono text-[11px] font-bold text-slate-800 group-hover/card:text-indigo-600 transition-colors">
          {doc.id}
        </span>

        {/* Mã hồ sơ liên kết */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectHoSo) onSelectHoSo(doc.hoSoCode);
          }}
          className="font-mono text-[10.5px] font-semibold text-blue-600 hover:underline bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 shrink-0 cursor-pointer"
          title="Bấm để mở hồ sơ đơn gốc"
        >
          {doc.hoSoCode}
        </span>

        {/* Số lượng tệp đính kèm */}
        {doc.tepDinhKem && doc.tepDinhKem.length > 0 && (
          <div className="ml-auto flex items-center gap-0.5 text-[10px] font-semibold text-slate-400" title={`${doc.tepDinhKem.length} tệp đính kèm`}>
            <span className="material-symbols-outlined text-[13px]">attach_file</span>
            <span>{doc.tepDinhKem.length}</span>
          </div>
        )}
      </div>

      {/* DÒNG 2: TÊN VĂN BẢN TRÌNH KÝ */}
      <h4 className="text-[12.5px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover/card:text-indigo-700 transition-colors">
        {doc.tenVanBan}
      </h4>

      {/* DÒNG 3: TRÍCH YẾU NGẮN */}
      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
        {doc.trichYeu}
      </p>

      {/* NẾU ĐÃ YÊU CẦU CHỈNH SỬA: HIỂN THỊ HỘP LÝ DO */}
      {variant === 'returned' && doc.lyDoTraLai && (
        <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[10.5px] text-amber-900 leading-tight">
          <span className="font-bold">Ý kiến Lãnh đạo:</span> {doc.lyDoTraLai}
        </div>
      )}

      {/* NẾU ĐÃ KÝ BAN HÀNH: HIỂN THỊ CHỮ KÝ */}
      {variant === 'signed' && (
        <div className="p-2 bg-emerald-50/80 rounded-xl border border-emerald-200 text-[10.5px] text-emerald-900 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
          <span className="truncate">Đã ký số VGCA lúc {doc.chuKyInfo?.thoiGianKy?.split(' ')[1] || '15:20'}</span>
        </div>
      )}

      {/* DÒNG 4: CÁN BỘ TRÌNH & THỜI HẠN */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500">
        <div className="flex items-center gap-1 truncate max-w-[130px]" title={doc.nguoiTrinh || doc.nguoiLap}>
          <span className="material-symbols-outlined text-[13px] text-slate-400">person</span>
          <span className="truncate font-medium">{doc.nguoiTrinh || doc.nguoiLap}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-slate-400">Hạn:</span>
          <span className={`font-semibold ${isUrgent ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
            {doc.hanXuLy ? doc.hanXuLy.split('(')[0].trim() : '24h'}
          </span>
        </div>
      </div>

      {/* DÒNG 5: HÀNG NÚT THAO TÁC CHO LÃNH ĐẠO */}
      {variant !== 'signed' && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
          {/* Nút chính Ký số */}
          {variant !== 'returned' ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onQuickSign) onQuickSign();
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-2xs ${variant === 'urgent'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
              >
                <span className="material-symbols-outlined text-[14px]">draw</span>
                <span>Ký số ngay</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onQuickReturn) onQuickReturn();
                }}
                className="p-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-slate-600 hover:text-amber-800 text-xs font-medium transition-colors cursor-pointer"
                title="Yêu cầu cán bộ chỉnh sửa lại"
              >
                Sửa
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenDetail}
              className="w-full py-1.5 px-2 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">visibility</span>
              <span>Xem chi tiết ý kiến chỉ đạo</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
