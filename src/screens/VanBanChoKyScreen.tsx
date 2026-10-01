// src/screens/VanBanChoKyScreen.tsx
import React, { useState, useMemo } from 'react';
import { Screen } from '../types';
import { SigningDocument, SigningStatus, DocumentType } from '../types/signing';

interface VanBanChoKyScreenProps {
  onNav: (s: Screen) => void;
  documents: SigningDocument[];
  onUpdateDocuments: (docs: SigningDocument[]) => void;
  onSelectHoSo?: (hoSoCode: string) => void;
  isEmbedded?: boolean;
  onSwitchAccount?: (role: 'can_bo' | 'lanh_dao') => void;
}

export default function VanBanChoKyScreen({
  onNav,
  documents,
  onUpdateDocuments,
  onSelectHoSo,
  isEmbedded = false,
  onSwitchAccount,
}: VanBanChoKyScreenProps) {
  // Lọc và Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [loaiVanBanFilter, setLoaiVanBanFilter] = useState<string>('all');
  const [canBoFilter, setCanBoFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [thoiGianFilter, setThoiGianFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'newest'>('priority');

  // Văn bản đang được mở chi tiết để ký
  const [activeDocId, setActiveDocId] = useState<string>(() => {
    // Mặc định chọn văn bản 'da_trinh' đầu tiên hoặc văn bản đầu tiên
    const firstPending = documents.find((d) => d.status === 'da_trinh');
    return firstPending ? firstPending.id : documents[0]?.id || '';
  });

  const [activeTabLeft, setActiveTabLeft] = useState<'preview' | 'attachments' | 'dossier'>('preview');
  const [leaderOpinion, setLeaderOpinion] = useState<string>('');
  const [signatureMethod, setSignatureMethod] = useState<'vgca' | 'usb_token' | 'smart_ca'>('vgca');

  // Modal xác nhận thao tác
  const [confirmModalType, setConfirmModalType] = useState<'sign' | 'return' | 'reject' | null>(null);
  const [actionReason, setActionReason] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3800);
  };

  // Thống kê dành cho Lãnh đạo
  const stats = useMemo(() => {
    const choKy = documents.filter((d) => d.status === 'da_trinh').length;
    const khan = documents.filter((d) => d.status === 'da_trinh' && (d.mucDoUuTien === 'khan' || d.mucDoUuTien === 'hoa_toc')).length;
    const daKy = documents.filter((d) => d.status === 'da_ky').length;
    const daYeuCauSua = documents.filter((d) => d.status === 'yeu_cau_chinh_sua').length;
    return { choKy, khan, daKy, daYeuCauSua };
  }, [documents]);

  // Danh sách cán bộ trình duy nhất để tạo dropdown lọc
  const uniqueCanBoList = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => {
      if (d.nguoiTrinh) set.add(d.nguoiTrinh);
    });
    return Array.from(set);
  }, [documents]);

  // Lọc và Sắp xếp danh sách
  const filteredAndSortedDocs = useMemo(() => {
    let result = documents.filter((d) => {
      const matchSearch =
        d.hoSoCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.tenVanBan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.nguoiGuiDon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.nguoiTrinh || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchLoaiVB = loaiVanBanFilter === 'all' || d.loaiVanBan === loaiVanBanFilter;
      const matchCanBo = canBoFilter === 'all' || d.nguoiTrinh === canBoFilter;
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;

      return matchSearch && matchLoaiVB && matchCanBo && matchStatus;
    });

    // Sắp xếp
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const pWeight = { hoa_toc: 3, khan: 2, thuong: 1 };
        const wA = pWeight[a.mucDoUuTien] || 1;
        const wB = pWeight[b.mucDoUuTien] || 1;
        if (wA !== wB) return wB - wA;
        return a.status === 'da_trinh' ? -1 : 1;
      }
      if (sortBy === 'deadline') {
        return (a.hanXuLy || '').localeCompare(b.hanXuLy || '');
      }
      return b.id.localeCompare(a.id);
    });

    return result;
  }, [documents, searchTerm, loaiVanBanFilter, canBoFilter, statusFilter, sortBy]);

  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === activeDocId) || filteredAndSortedDocs[0] || documents[0];
  }, [documents, activeDocId, filteredAndSortedDocs]);

  // 1. Thao tác Ký số văn bản
  const handleExecuteSign = () => {
    if (!activeDoc) return;
    setIsProcessing(true);

    setTimeout(() => {
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const certName =
        signatureMethod === 'vgca'
          ? 'Chữ ký số chuyên dùng công vụ - VGCA (Ban Cơ yếu Chính phủ)'
          : signatureMethod === 'usb_token'
            ? 'Chữ ký số USB Token Viettel-CA'
            : 'Chữ ký số SmartCA / VNeID cấp độ 2';

      const newLog = {
        id: `h-${Date.now()}`,
        time: timeStr,
        actor: `${activeDoc.lanhDaoName} (${activeDoc.lanhDaoChucVu})`,
        action: 'Ký số văn bản thành công',
        note: leaderOpinion ? `Ý kiến chỉ đạo: ${leaderOpinion}` : 'Đã ký số phê chuẩn tờ trình',
        signatureCert: `${certName} • Seri: 54 02 1A BC 89 22 FE ${Math.floor(Math.random() * 90) + 10}`,
      };

      const updatedDocs = documents.map((d) => {
        if (d.id === activeDoc.id) {
          return {
            ...d,
            status: 'da_ky' as SigningStatus,
            chuKyInfo: {
              nguoiKy: d.lanhDaoName.replace('Đ/c ', ''),
              chucVu: d.lanhDaoChucVu,
              coQuan: 'Thanh tra Thành phố',
              thoiGianKy: timeStr,
              loaiChungThu: certName,
              soSeri: `54 02 1A BC 89 22 FE ${Math.floor(Math.random() * 90) + 10}`,
              yKienLanhDao: leaderOpinion || 'Đồng ý phê duyệt nội dung đề xuất.',
            },
            history: [newLog, ...(d.history || [])],
            stepId: 'STEP-05',
          };
        }
        return d;
      });

      onUpdateDocuments(updatedDocs);
      setIsProcessing(false);
      setConfirmModalType(null);
      setLeaderOpinion('');
      showToast(
        `✓ Lãnh đạo đã ký số thành công văn bản ${activeDoc.id}! Hồ sơ chuyển sang bước [STEP-06: Cấp số thụ lý].`
      );
    }, 600);
  };

  // 2. Thao tác Trả lại yêu cầu chỉnh sửa
  const handleExecuteReturn = () => {
    if (!activeDoc) return;
    if (!actionReason.trim()) {
      setActionError('Bắt buộc phải nhập ý kiến/lý do yêu cầu cán bộ chỉnh sửa.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newLog = {
        id: `h-${Date.now()}`,
        time: timeStr,
        actor: `${activeDoc.lanhDaoName} (${activeDoc.lanhDaoChucVu})`,
        action: 'Yêu cầu cán bộ chỉnh sửa văn bản',
        note: actionReason,
      };

      const updatedDocs = documents.map((d) => {
        if (d.id === activeDoc.id) {
          return {
            ...d,
            status: 'yeu_cau_chinh_sua' as SigningStatus,
            lyDoTraLai: actionReason,
            history: [newLog, ...(d.history || [])],
            stepId: 'STEP-03A',
          };
        }
        return d;
      });

      onUpdateDocuments(updatedDocs);
      setIsProcessing(false);
      setConfirmModalType(null);
      setActionReason('');
      setActionError(null);
      showToast(
        `↺ Đã trả lại văn bản ${activeDoc.id} cho cán bộ ${activeDoc.nguoiTrinh} kèm ý kiến yêu cầu chỉnh sửa.`
      );
    }, 400);
  };

  // 3. Thao tác Từ chối ký
  const handleExecuteReject = () => {
    if (!activeDoc) return;
    if (!actionReason.trim()) {
      setActionError('Bắt buộc phải nhập lý do từ chối ký văn bản.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newLog = {
        id: `h-${Date.now()}`,
        time: timeStr,
        actor: `${activeDoc.lanhDaoName} (${activeDoc.lanhDaoChucVu})`,
        action: 'Từ chối ký duyệt văn bản',
        note: actionReason,
      };

      const updatedDocs = documents.map((d) => {
        if (d.id === activeDoc.id) {
          return {
            ...d,
            status: 'tu_choi' as SigningStatus,
            lyDoTuChoi: actionReason,
            history: [newLog, ...(d.history || [])],
          };
        }
        return d;
      });

      onUpdateDocuments(updatedDocs);
      setIsProcessing(false);
      setConfirmModalType(null);
      setActionReason('');
      setActionError(null);
      showToast(`✕ Lãnh đạo đã từ chối ký văn bản ${activeDoc.id}.`);
    }, 400);
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f7fb] text-slate-800 overflow-hidden font-body-md">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. BODY SPLIT WORKSPACE: DANH SÁCH BÊN TRÁI + CHI TIẾT KÝ BÊN PHẢI   */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* ==================== CỘT TRÁI: DANH SÁCH VĂN BẢN (40%) ==================== */}
        <div className="w-full lg:w-[420px] xl:w-[460px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
          {/* Search & Filters */}
          <div className="p-3.5 border-b border-slate-200 space-y-2 bg-slate-50/60">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[17px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã đơn, tên văn bản, cán bộ..."
                className="w-full pl-8.5 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={loaiVanBanFilter}
                onChange={(e) => setLoaiVanBanFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="all">Tất cả loại văn bản</option>
                <option value="to_trinh_thu_ly">Tờ trình đề xuất thụ lý</option>
                <option value="quyet_dinh_thu_ly">Quyết định thụ lý</option>
                <option value="thong_bao_khong_thu_ly">Thông báo không thụ lý</option>
                <option value="bien_ban_ban_giao">Biên bản bàn giao</option>
              </select>

              <select
                value={canBoFilter}
                onChange={(e) => setCanBoFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="all">Tất cả cán bộ trình</option>
                {uniqueCanBoList.map((cb) => (
                  <option key={cb} value={cb}>
                    {cb}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Sắp xếp:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSortBy('priority')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${sortBy === 'priority' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'hover:bg-slate-200 text-slate-600'
                    }`}
                >
                  Ưu tiên
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('deadline')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${sortBy === 'deadline' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'hover:bg-slate-200 text-slate-600'
                    }`}
                >
                  Hạn xử lý
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('newest')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${sortBy === 'newest' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'hover:bg-slate-200 text-slate-600'
                    }`}
                >
                  Mới nhất
                </button>
              </div>
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredAndSortedDocs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không tìm thấy văn bản nào trong mục này.
              </div>
            ) : (
              filteredAndSortedDocs.map((doc) => {
                const isSelected = doc.id === activeDoc?.id;
                const isPending = doc.status === 'da_trinh';
                const isSigned = doc.status === 'da_ky';
                const isReturned = doc.status === 'yeu_cau_chinh_sua';

                return (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className={`p-3.5 transition-all cursor-pointer relative ${isSelected
                        ? 'bg-indigo-50/70 border-l-4 border-indigo-600 shadow-2xs'
                        : 'hover:bg-slate-50'
                      }`}
                  >
                    {/* Hàng 1: Mã hồ sơ, nhãn khẩn, trạng thái */}
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-[#004ac6] flex items-center gap-1 font-mono">
                        {doc.hoSoCode}
                        {doc.mucDoUuTien === 'khan' && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold text-[9.5px]">
                            KHẨN
                          </span>
                        )}
                        {doc.mucDoUuTien === 'hoa_toc' && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-bold text-[9.5px]">
                            HỎA TỐC
                          </span>
                        )}
                      </span>

                      {isPending ? (
                        <span className="inline-flex items-center gap-1 text-amber-800 font-bold text-[10.5px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Chờ duyệt ký
                        </span>
                      ) : isSigned ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10.5px]">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          Đã ký số
                        </span>
                      ) : isReturned ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[10.5px]">
                          Đã yêu cầu sửa
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">{doc.status}</span>
                      )}
                    </div>

                    {/* Hàng 2: Tên văn bản */}
                    <h3 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                      {doc.tenVanBan}
                    </h3>

                    {/* Hàng 3: Cán bộ trình & Thời gian */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span>
                        Trình bởi: <strong className="text-slate-700">{doc.nguoiTrinh}</strong>
                      </span>
                      <span>{doc.thoiGianTrinh || doc.ngayTao}</span>
                    </div>

                    {/* Hạn ký */}
                    {doc.hanXuLy && isPending && (
                      <div className="text-[10.5px] text-rose-600 font-semibold mt-1">
                        Hạn ký: {doc.hanXuLy}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ==================== CỘT PHẢI: CHI TIẾT VĂN BẢN ĐỂ LÃNH ĐẠO KÝ (60%) ==================== */}
        <div className="flex-1 bg-[#f8fafc] flex flex-col overflow-hidden">
          {activeDoc ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Action Bar của Lãnh đạo */}
              <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 flex-wrap shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    VĂN BẢN: {activeDoc.id}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-700">
                    Hồ sơ: <strong className="text-[#004ac6]">{activeDoc.hoSoCode}</strong>
                  </span>
                </div>

                {/* 3 Nút thao tác chính: [Ký văn bản] [Trả lại chỉnh sửa] [Từ chối ký] */}
                <div className="flex items-center gap-2">
                  {activeDoc.status === 'da_ky' ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                        <span className="material-symbols-outlined text-[17px] text-emerald-600">verified</span>
                        <span>Văn bản đã được ký số thành công</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectHoSo) onSelectHoSo(activeDoc.hoSoCode);
                          onNav('don-tiep-nhan');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Chuyển cấp số thụ lý
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Nút 3: Từ chối ký */}
                      <button
                        type="button"
                        onClick={() => {
                          setActionReason('');
                          setActionError(null);
                          setConfirmModalType('reject');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="Từ chối ký văn bản nếu không đúng quy định pháp luật"
                      >
                        <span className="material-symbols-outlined text-[16px]">block</span>
                        <span>Từ chối ký</span>
                      </button>

                      {/* Nút 2: Trả lại chỉnh sửa */}
                      <button
                        type="button"
                        onClick={() => {
                          setActionReason('');
                          setActionError(null);
                          setConfirmModalType('return');
                        }}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
                        title="Trả lại cho cán bộ để yêu cầu bổ sung chứng cứ hoặc sửa đổi tờ trình"
                      >
                        <span className="material-symbols-outlined text-[16px] text-amber-700">replay</span>
                        <span>Trả lại chỉnh sửa</span>
                      </button>

                      {/* Nút 1: Ký văn bản */}
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModalType('sign');
                        }}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[17px]">draw</span>
                        <span>KÝ VĂN BẢN (KÝ SỐ)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Workspace chia 2 khu vực: Chi tiết tài liệu + Thông tin trình ký & Khu vực ký */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* ==================== KHU VỰC B: VĂN BẢN TRÌNH KÝ & XEM TRƯỚC (7 cột) ==================== */}
                <div className="xl:col-span-7 flex flex-col space-y-3">
                  {/* Tabs xem trước */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTabLeft('preview')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeTabLeft === 'preview'
                            ? 'bg-white text-[#004ac6] shadow-2xs border border-slate-200'
                            : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>Xem trước văn bản (Preview)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTabLeft('attachments')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeTabLeft === 'attachments'
                            ? 'bg-white text-[#004ac6] shadow-2xs border border-slate-200'
                            : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">attachment</span>
                        <span>Tài liệu đính kèm ({activeDoc.tepDinhKem.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTabLeft('dossier')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeTabLeft === 'dossier'
                            ? 'bg-white text-[#004ac6] shadow-2xs border border-slate-200'
                            : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">description</span>
                        <span>Hồ sơ vụ việc gốc</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Định dạng chuẩn NĐ 30/2020/NĐ-CP
                    </div>
                  </div>

                  {/* Tab 1: Khung giả lập văn bản A4 thể thức chuẩn */}
                  {activeTabLeft === 'preview' && (
                    <div className="bg-white rounded-xl border border-slate-300 p-8 shadow-md text-slate-900 font-serif leading-relaxed text-xs space-y-5 relative min-h-[580px]">
                      {/* Tiêu ngữ */}
                      <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                        <div className="text-center space-y-0.5">
                          <div className="font-bold text-[11px] uppercase tracking-wide">
                            THANH TRA THÀNH PHỐ
                          </div>
                          <div className="font-semibold text-[10px]">
                            PHÒNG TIẾP DÂN &amp; XỬ LÝ ĐƠN
                          </div>
                          <div className="text-[10px] text-slate-500 pt-1 font-sans">
                            Số: ......./TTr-TTTP
                          </div>
                        </div>

                        <div className="text-center space-y-0.5">
                          <div className="font-bold text-[11px] uppercase">
                            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                          </div>
                          <div className="font-bold text-[11px] underline underline-offset-4">
                            Độc lập - Tự do - Hạnh phúc
                          </div>
                          <div className="text-[10px] text-slate-500 italic pt-1 font-sans">
                            Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                          </div>
                        </div>
                      </div>

                      {/* Tiêu đề văn bản */}
                      <div className="text-center pt-2 space-y-1">
                        <h2 className="text-sm font-bold uppercase tracking-wide">
                          {activeDoc.tenVanBan}
                        </h2>
                        <div className="text-[11px] font-sans italic text-slate-600">
                          {activeDoc.trichYeu}
                        </div>
                      </div>

                      {/* Nội dung chi tiết */}
                      <div className="font-sans text-[11.5px] leading-relaxed whitespace-pre-wrap text-slate-800 pt-2">
                        {activeDoc.noiDungChiTiet}
                      </div>

                      {/* Khu vực Chữ ký số điện tử */}
                      <div className="pt-8 flex justify-between items-end border-t border-slate-100 font-sans">
                        <div className="text-[10.5px] text-slate-500 space-y-0.5">
                          <div className="font-bold text-slate-700">Nơi nhận:</div>
                          <div>- Như kính gửi;</div>
                          <div>- Người tố cáo (để biết);</div>
                          <div>- Lưu: VT, HS.</div>
                        </div>

                        <div className="text-center space-y-1 min-w-[200px]">
                          <div className="font-bold text-xs uppercase text-slate-800">
                            {activeDoc.lanhDaoChucVu}
                          </div>

                          {/* Dấu mộc chữ ký số nếu đã ký */}
                          {activeDoc.status === 'da_ky' && activeDoc.chuKyInfo ? (
                            <div className="p-2.5 rounded-lg border-2 border-emerald-600 bg-emerald-50 text-emerald-900 text-left text-[10.5px] shadow-sm animate-scale-up space-y-0.5">
                              <div className="flex items-center gap-1 font-bold text-emerald-800">
                                <span className="material-symbols-outlined text-[15px]">verified</span>
                                <span>KÝ BỞI: {activeDoc.chuKyInfo.nguoiKy}</span>
                              </div>
                              <div className="text-[10px] text-emerald-700">
                                Chức vụ: {activeDoc.chuKyInfo.chucVu}
                              </div>
                              <div className="text-[9.5px] text-emerald-600 font-mono">
                                Thời gian: {activeDoc.chuKyInfo.thoiGianKy}
                              </div>
                              <div className="text-[9px] text-emerald-700 pt-0.5 border-t border-emerald-200">
                                {activeDoc.chuKyInfo.loaiChungThu}
                              </div>
                            </div>
                          ) : (
                            <div className="h-20 flex items-center justify-center border border-dashed border-slate-300 rounded-lg text-slate-400 text-[11px] italic bg-slate-50/50">
                              (Chờ Lãnh đạo ký số)
                            </div>
                          )}

                          <div className="font-bold text-xs text-slate-800 pt-1">
                            {activeDoc.lanhDaoName.replace('Đ/c ', '')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Danh sách tài liệu đính kèm */}
                  {activeTabLeft === 'attachments' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                      <h4 className="font-bold text-slate-800 text-xs">
                        Danh mục hồ sơ và tệp đính kèm theo văn bản trình:
                      </h4>
                      <div className="space-y-2">
                        {activeDoc.tepDinhKem.map((f, i) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs font-mono">
                                0{i + 1}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800 text-xs">{f.tenTep}</div>
                                <div className="text-[10.5px] text-slate-400">
                                  Dung lượng: {f.dungLuong} • Loại: {f.loai === 'du_thao' ? 'Văn bản dự thảo' : 'Tài liệu minh chứng'}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => showToast(`Đang tải tệp: ${f.tenTep}...`)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">download</span>
                              <span>Tải về</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Hồ sơ đơn gốc */}
                  {activeTabLeft === 'dossier' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">Trích xuất hồ sơ đơn gốc</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectHoSo) onSelectHoSo(activeDoc.hoSoCode);
                            onNav('don-tiep-nhan');
                          }}
                          className="text-[#004ac6] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Mở màn hình Đơn tiếp nhận</span>
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div>
                          <span className="text-slate-400">Mã đơn / Mã tiếp nhận:</span>{' '}
                          <strong className="text-slate-900">{activeDoc.hoSoCode}</strong> (Lượt nhận: {activeDoc.luotNhanId})
                        </div>
                        <div>
                          <span className="text-slate-400">Người đứng đơn:</span>{' '}
                          <strong className="text-slate-900">{activeDoc.nguoiGuiDon}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Loại đơn:</span>{' '}
                          <strong className="text-slate-900">{activeDoc.loaiDon}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Tóm tắt nội dung:</span>
                          <p className="mt-1 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                            {activeDoc.noiDungDon}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ==================== KHU VỰC A, C, D: THÔNG TIN TRÌNH KÝ & THAO TÁC KÝ (5 cột) ==================== */}
                <div className="xl:col-span-5 space-y-4">
                  {/* KHU VỰC A: Thông tin hồ sơ & Quá trình xử lý liên quan */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-800 text-[11.5px] uppercase tracking-wider">
                        A. Thông tin hồ sơ vụ việc
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#004ac6] font-bold text-[10.5px]">
                        {activeDoc.loaiDon}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11.5px]">
                      <div>
                        <span className="text-slate-400">Số đơn:</span>{' '}
                        <strong className="text-slate-800">{activeDoc.hoSoCode}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Người gửi:</span>{' '}
                        <strong className="text-slate-800">{activeDoc.nguoiGuiDon}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Tiến độ quy trình:</span>
                        <div className="mt-1 flex items-center gap-1.5 text-[10.5px]">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                            ✓ Tiếp nhận
                          </span>
                          <span className="text-slate-300">→</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                            ✓ Xác minh sơ bộ
                          </span>
                          <span className="text-slate-300">→</span>
                          <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                            Trình phê duyệt
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KHU VỰC C: Thông tin trình ký */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-800 text-[11.5px] uppercase tracking-wider">
                        C. Thông tin cán bộ trình ký
                      </span>
                      <span className="text-slate-400 text-[11px]">{activeDoc.thoiGianTrinh || activeDoc.ngayTao}</span>
                    </div>

                    <div className="space-y-1.5 text-[11.5px]">
                      <div>
                        <span className="text-slate-400">Cán bộ trình:</span>{' '}
                        <strong className="text-slate-800">{activeDoc.nguoiTrinh}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Đơn vị:</span>{' '}
                        <span className="text-slate-700">{activeDoc.donViNguoiLap}</span>
                      </div>
                      {activeDoc.yKienCanBo && (
                        <div>
                          <span className="text-slate-400">Ý kiến cán bộ:</span>
                          <div className="mt-1 p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-900 font-medium italic">
                            “{activeDoc.yKienCanBo}”
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KHU VỰC D: Thao tác ký của Lãnh đạo */}
                  <div className="bg-white rounded-2xl border-2 border-indigo-200 p-4.5 shadow-sm space-y-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-indigo-700 text-[20px]">draw</span>
                        <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                          D. Khu vực ký &amp; Phê duyệt của Lãnh đạo
                        </span>
                      </div>
                    </div>

                    {/* Phương thức ký */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 text-[11.5px] block">
                        Chọn phương thức ký số điện tử:
                      </label>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-[11px]">
                          <input
                            type="radio"
                            name="signMethod"
                            checked={signatureMethod === 'vgca'}
                            onChange={() => setSignatureMethod('vgca')}
                            className="text-indigo-600 focus:ring-0"
                          />
                          <span className="font-semibold text-slate-800">
                            Chữ ký số chuyên dùng công vụ VGCA (Ban Cơ yếu CP)
                          </span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-[11px]">
                          <input
                            type="radio"
                            name="signMethod"
                            checked={signatureMethod === 'usb_token'}
                            onChange={() => setSignatureMethod('usb_token')}
                            className="text-indigo-600 focus:ring-0"
                          />
                          <span className="font-semibold text-slate-800">
                            Chữ ký số USB Token Viettel-CA / VNPT-CA
                          </span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-[11px]">
                          <input
                            type="radio"
                            name="signMethod"
                            checked={signatureMethod === 'smart_ca'}
                            onChange={() => setSignatureMethod('smart_ca')}
                            className="text-indigo-600 focus:ring-0"
                          />
                          <span className="font-semibold text-slate-800">
                            Ký số từ xa SmartCA / VNeID cấp độ 2
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Nhập ý kiến chỉ đạo / Bút phê */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 text-[11.5px] block">
                        Ý kiến chỉ đạo / Bút phê của Lãnh đạo (Tùy chọn):
                      </label>
                      <textarea
                        rows={3}
                        value={leaderOpinion}
                        onChange={(e) => setLeaderOpinion(e.target.value)}
                        placeholder="Nhập ý kiến chỉ đạo giao việc hoặc lưu ý khi thụ lý vụ việc..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    {/* Lịch sử xử lý */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-700 text-[11px] block mb-1">
                        Lịch sử trình duyệt văn bản này:
                      </span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {activeDoc.history.map((h) => (
                          <div
                            key={h.id}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10.5px]"
                          >
                            <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
                              <span>{h.time}</span>
                              <strong className="text-slate-700">{h.actor}</strong>
                            </div>
                            <div className="font-medium text-slate-800 mt-0.5">{h.action}</div>
                            {h.note && <div className="text-slate-500 italic mt-0.5">“{h.note}”</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12 text-center text-slate-400">
              Vui lòng chọn một văn bản từ danh sách bên trái để xem xét và ký duyệt.
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MODAL XÁC NHẬN KÝ SỐ / TRẢ LẠI / TỪ CHỐI                           */}
      {/* ===================================================================== */}
      {confirmModalType && activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[24px] ${confirmModalType === 'sign'
                      ? 'text-emerald-600'
                      : confirmModalType === 'return'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                >
                  {confirmModalType === 'sign'
                    ? 'verified'
                    : confirmModalType === 'return'
                      ? 'replay'
                      : 'cancel'}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  {confirmModalType === 'sign'
                    ? 'Xác nhận Ký số văn bản'
                    : confirmModalType === 'return'
                      ? 'Yêu cầu Cán bộ chỉnh sửa'
                      : 'Xác nhận Từ chối ký'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalType(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Nội dung modal Ký */}
            {confirmModalType === 'sign' && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <div>
                    <strong>Văn bản:</strong> {activeDoc.tenVanBan} ({activeDoc.id})
                  </div>
                  <div>
                    <strong>Người ký:</strong> {activeDoc.lanhDaoName} ({activeDoc.lanhDaoChucVu})
                  </div>
                  <div>
                    <strong>Phương thức ký:</strong>{' '}
                    {signatureMethod === 'vgca'
                      ? 'Ban Cơ yếu Chính phủ VGCA'
                      : signatureMethod === 'usb_token'
                        ? 'USB Token'
                        : 'SmartCA / VNeID'}
                  </div>
                </div>

                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Sau khi ký số thành công:
                  <br />• Văn bản sẽ chuyển sang trạng thái <strong>"Đã ký"</strong> và lưu trữ chứng thư số hợp lệ.
                  <br />• Hệ thống tự động chuyển tiếp hồ sơ sang <strong>[STEP-06: Cấp số thụ lý]</strong>.
                  <br />• Cán bộ thụ lý sẽ nhận được thông báo để hoàn tất văn bản thụ lý.
                </p>
              </div>
            )}

            {/* Nội dung modal Trả lại chỉnh sửa */}
            {confirmModalType === 'return' && (
              <div className="space-y-3 text-xs text-slate-700">
                <p className="text-slate-600">
                  Hồ sơ sẽ được hoàn trả về cho cán bộ <strong>{activeDoc.nguoiTrinh}</strong> tại bước <strong>[STEP-03A: Đề xuất thụ lý]</strong> để chỉnh sửa và trình ký lại.
                </p>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Nhập ý kiến chỉ đạo / Nội dung yêu cầu chỉnh sửa <span className="text-rose-500">*</span>:
                  </label>
                  <textarea
                    rows={4}
                    value={actionReason}
                    onChange={(e) => {
                      setActionReason(e.target.value);
                      setActionError(null);
                    }}
                    placeholder="Ví dụ: Bổ sung xác nhận nguồn gốc đất của UBND Phường, làm rõ thời hiệu trước khi trình ký..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-600"
                  />
                  {actionError && <p className="text-[11px] text-rose-600 mt-1">{actionError}</p>}
                </div>
              </div>
            )}

            {/* Nội dung modal Từ chối */}
            {confirmModalType === 'reject' && (
              <div className="space-y-3 text-xs text-slate-700">
                <p className="text-slate-600">
                  Văn bản sẽ bị từ chối ký và dừng quy trình đề xuất thụ lý hiện hành. Cán bộ thụ lý sẽ nhận được lý do từ chối để chuyển sang hướng xử lý khác.
                </p>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Nhập lý do từ chối ký <span className="text-rose-500">*</span>:
                  </label>
                  <textarea
                    rows={4}
                    value={actionReason}
                    onChange={(e) => {
                      setActionReason(e.target.value);
                      setActionError(null);
                    }}
                    placeholder="Nhập lý do từ chối căn cứ theo quy định của pháp luật..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-600"
                  />
                  {actionError && <p className="text-[11px] text-rose-600 mt-1">{actionError}</p>}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModalType(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>

              {confirmModalType === 'sign' && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecuteSign}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isProcessing ? 'Đang xác thực chữ ký...' : 'Xác nhận Ký số'}
                </button>
              )}

              {confirmModalType === 'return' && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecuteReturn}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isProcessing ? 'Đang gửi trả...' : 'Gửi yêu cầu chỉnh sửa'}
                </button>
              )}

              {confirmModalType === 'reject' && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecuteReject}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isProcessing ? 'Đang xử lý...' : 'Xác nhận Từ chối'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
