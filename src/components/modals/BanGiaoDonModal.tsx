import React, { useState, useMemo } from 'react';
import { DEPARTMENTS, OFFICERS, Officer } from '../../constants/departments';

export interface TaiLieuBanGiaoItem {
  id: string;
  tenTaiLieu: string;
  loaiBan: 'ban_chinh' | 'ban_sao_chung_thuc' | 'ban_chup' | 'file_so_hoa';
  soLuong: number;
  tinhTrang: string;
  selected: boolean;
}

export interface BanGiaoDonSubmitData {
  stepId: 'STEP-03C';
  huongXuLy: 'ban_giao';
  banGiaoType: 'don_vi_khac' | 'can_bo_noi_bo';
  // Đơn vị nhận (nếu đơn vị khác)
  donViNhanId?: string;
  donViNhanName?: string;
  phongBanNhan?: string;
  canBoDauMoi?: string;
  phuongThucChuyen: 'lien_thong_dien_tu' | 'buu_chinh_cong_ich' | 'truc_tiep_ho_so_giay';
  // Cán bộ nhận (nếu nội bộ)
  canBoNhanId?: string;
  canBoNhan?: Officer;
  // Dữ liệu bàn giao bắt buộc
  lyDoBanGiao: string;
  canCuPhapLy: string;
  ghiChuBanGiao?: string;
  thoiHanTiepNhan: string;
  danhMucTaiLieu: TaiLieuBanGiaoItem[];
  // Cấu hình sản phẩm / văn bản bàn giao
  cauHinhVanBan: {
    taoVanBan: boolean;
    loaiVanBan: 'bien_ban_ban_giao' | 'phieu_chuyen_don';
    soKyHieu: string;
    ngayLap: string;
    nguoiLap: string;
  };
}

export interface BanGiaoDonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BanGiaoDonSubmitData) => void;
  currentOfficerName?: string;
  currentDepartmentName?: string;
  donInfo?: {
    code?: string;
    luotNhanId?: string;
    nguoiNop?: string;
    cccd?: string;
    sdt?: string;
    diaChi?: string;
    loaiDon?: string;
    noiDung?: string;
    ngayNhan?: string;
    suggestedDeptId?: string;
  };
}

export default function BanGiaoDonModal({
  isOpen,
  onClose,
  onSubmit,
  currentOfficerName = 'Nguyễn Minh Anh',
  currentDepartmentName = 'Phòng Tiếp công dân & Xử lý đơn',
  donInfo = {
    code: 'Đ-2026-00125',
    luotNhanId: 'LN-2026-0819',
    nguoiNop: 'Nguyễn Văn A',
    cccd: '001088012345',
    sdt: '0983 123 456',
    diaChi: 'Số 12, ngõ 45, Cầu Giấy, Hà Nội',
    loaiDon: 'Đơn tố giác tội phạm',
    noiDung: 'Tố giác vi phạm lừa đảo chiếm đoạt tài sản qua hình thức huy động vốn',
    ngayNhan: '16/09/2026',
    suggestedDeptId: 'pc03',
  },
}: BanGiaoDonModalProps) {
  // Tabs: 'form' (Biểu mẫu lập thông tin bàn giao) vs 'preview' (Xem trước Biên bản / Phiếu bàn giao)
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // Hướng bàn giao: 'don_vi_khac' (liên đơn vị) vs 'can_bo_noi_bo' (nội bộ phòng)
  const [banGiaoType, setBanGiaoType] = useState<'don_vi_khac' | 'can_bo_noi_bo'>('don_vi_khac');

  // Đơn vị nhận (khác)
  const [selectedDonViId, setSelectedDonViId] = useState<string>(donInfo.suggestedDeptId || 'pc03');
  const [phongBanNhan, setPhongBanNhan] = useState<string>('Bộ phận Tiếp nhận & Thụ lý');
  const [canBoDauMoi, setCanBoDauMoi] = useState<string>('');
  const [phuongThucChuyen, setPhuongThucChuyen] = useState<'lien_thong_dien_tu' | 'buu_chinh_cong_ich' | 'truc_tiep_ho_so_giay'>('lien_thong_dien_tu');

  // Cán bộ nội bộ nhận
  const [selectedCanBoNoiBoId, setSelectedCanBoNoiBoId] = useState<string>('');
  const [officerSearch, setOfficerSearch] = useState<string>('');

  // Thông tin bàn giao bắt buộc (Kiểm tra dữ liệu)
  const [lyDoSelect, setLyDoSelect] = useState<string>('tham_quyen_co_quan_khac');
  const [lyDoChiTiet, setLyDoChiTiet] = useState<string>(
    'Hồ sơ có dấu hiệu tội phạm lừa đảo chiếm đoạt tài sản số tiền lớn, thuộc thẩm quyền điều tra của Cơ quan Cảnh sát điều tra Công an thành phố (PC03) theo quy định tại Điều 145, 146 Bộ luật Tố tụng Hình sự 2015.'
  );
  const [canCuPhapLy, setCanCuPhapLy] = useState<string>(
    'Điều 26 Luật Tố cáo 2018; Thông tư liên tịch số 01/2017/TTLT; Điều 145 BLTTHS 2015.'
  );
  const [thoiHanTiepNhan, setThoiHanTiepNhan] = useState<string>('03 ngày làm việc (kể từ ngày chuyển hồ sơ)');
  const [ghiChuBanGiao, setGhiChuBanGiao] = useState<string>(
    'Đề nghị cơ quan tiếp nhận thông báo kết quả giải quyết ban đầu bằng văn bản cho Ban Tiếp công dân để theo dõi tiến độ theo quy định.'
  );

  // Danh mục tài liệu bàn giao
  const [taiLieuList, setTaiLieuList] = useState<TaiLieuBanGiaoItem[]>([
    {
      id: 'doc-1',
      tenTaiLieu: 'Đơn tố giác / phản ánh bản gốc có chữ ký của người nộp',
      loaiBan: 'ban_chinh',
      soLuong: 1,
      tinhTrang: 'Nguyên vẹn, đầy đủ chữ ký công dân',
      selected: true,
    },
    {
      id: 'doc-2',
      tenTaiLieu: 'Bản sao thẻ CCCD có chứng thực của người gửi đơn',
      loaiBan: 'ban_sao_chung_thuc',
      soLuong: 1,
      tinhTrang: 'Rõ nét, số 001088012345',
      selected: true,
    },
    {
      id: 'doc-3',
      tenTaiLieu: 'Tài liệu, hợp đồng huy động vốn, chứng từ chuyển khoản kèm theo',
      loaiBan: 'ban_sao_chung_thuc',
      soLuong: 12,
      tinhTrang: 'Tập chứng cứ gồm 12 trang có dấu giáp lai',
      selected: true,
    },
    {
      id: 'doc-4',
      tenTaiLieu: 'Phiếu phân loại & Báo cáo kết quả rà soát bước đầu của AI GOVEX',
      loaiBan: 'file_so_hoa',
      soLuong: 1,
      tinhTrang: 'Đã đính kèm trên hệ thống phần mềm',
      selected: true,
    },
  ]);

  // Cấu hình sản phẩm / văn bản bàn giao
  const [taoVanBan, setTaoVanBan] = useState<boolean>(true);
  const [loaiVanBan, setLoaiVanBan] = useState<'bien_ban_ban_giao' | 'phieu_chuyen_don'>('bien_ban_ban_giao');
  const [soKyHieu, setSoKyHieu] = useState<string>('15/BB-TCD');
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }, []);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Danh sách các cơ quan/đơn vị nhận
  const recipientDepartments = useMemo(() => {
    return [
      ...DEPARTMENTS,
      {
        id: 'ubnd-quan',
        name: 'UBND Quận / Huyện (Bộ phận Một cửa)',
        shortName: 'UBND Quận',
        code: 'UBND-Q',
        leaderName: 'Đ/c Nguyễn Hoàng Nam',
        officerCount: 8,
      },
      {
        id: 'tt-thanh-pho',
        name: 'Thanh tra Thành phố',
        shortName: 'Thanh tra TP',
        code: 'TT-TP',
        leaderName: 'Lê Hồng Minh',
        officerCount: 6,
      },
      {
        id: 'toaan-quan',
        name: 'Tòa án nhân dân Quận / Huyện',
        shortName: 'TAND Quận',
        code: 'TAND-Q',
        leaderName: 'Vũ Đức Thành',
        officerCount: 5,
      },
    ];
  }, []);

  // Cán bộ nội bộ trong phòng Tiếp dân (loại trừ Tôi nếu chuyển người khác)
  const noiBoOfficers = useMemo(() => {
    return OFFICERS.filter((o) => o.departmentId === 'tiep-dan' && !o.isCurrentUser);
  }, []);

  const filteredNoiBoOfficers = useMemo(() => {
    if (!officerSearch.trim()) return noiBoOfficers;
    const q = officerSearch.toLowerCase().trim();
    return noiBoOfficers.filter(
      (o) => o.name.toLowerCase().includes(q) || o.role.toLowerCase().includes(q) || (o.phone && o.phone.includes(q))
    );
  }, [noiBoOfficers, officerSearch]);

  // Đơn vị đang được chọn
  const currentSelectedDept = useMemo(() => {
    return recipientDepartments.find((d) => d.id === selectedDonViId) || recipientDepartments[0];
  }, [recipientDepartments, selectedDonViId]);

  // Đồng bộ lý do khi chọn dropdown lý do
  const handleSelectLyDo = (key: string) => {
    setLyDoSelect(key);
    switch (key) {
      case 'tham_quyen_co_quan_khac':
        setLyDoChiTiet('Đơn thuộc thẩm quyền giải quyết của cơ quan khác. Căn cứ Điều 26 Luật Tố cáo 2018, lập phiếu chuyển đơn và bàn giao hồ sơ sang cơ quan có thẩm quyền.');
        break;
      case 'nganh_doc_chuyen_mon':
        setLyDoChiTiet('Vụ việc phát sinh thuộc lĩnh vực quản lý chuyên ngành, chuyển đơn vị chuyên môn thụ lý giải quyết theo phân cấp thẩm quyền.');
        break;
      case 'co_quan_dieu_tra':
        setLyDoChiTiet('Nội dung phản ánh có dấu hiệu cấu thành tội phạm, bàn giao toàn bộ tài liệu sang Cơ quan Cảnh sát điều tra giải quyết nguồn tin tội phạm theo Điều 145 BLTTHS.');
        break;
      case 'phan_cong_lai_noi_bo':
        setLyDoChiTiet('Bàn giao nội bộ do cán bộ thụ lý thay đổi phân công công tác hoặc chuyển chuyên viên có chuyên môn phù hợp trực tiếp thụ lý.');
        break;
      default:
        break;
    }
  };

  // Toggle chọn tài liệu
  const handleToggleTaiLieu = (id: string) => {
    setTaiLieuList((prev) =>
      prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it))
    );
  };

  // Cập nhật số lượng tài liệu
  const handleUpdateSoLuong = (id: string, qty: number) => {
    setTaiLieuList((prev) =>
      prev.map((it) => (it.id === id ? { ...it, soLuong: Math.max(1, qty) } : it))
    );
  };

  // Kiểm tra ràng buộc dữ liệu bắt buộc (Validation)
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (banGiaoType === 'don_vi_khac') {
      if (!selectedDonViId) {
        errs.donVi = 'Vui lòng chọn cơ quan / đơn vị tiếp nhận bàn giao.';
      }
    } else {
      if (!selectedCanBoNoiBoId) {
        errs.canBo = 'Vui lòng chọn cán bộ chuyên môn trong phòng nhận bàn giao.';
      }
    }

    if (!lyDoChiTiet.trim()) {
      errs.lyDo = 'Bắt buộc nhập lý do và căn cứ bàn giao hồ sơ đơn.';
    }

    const selectedDocs = taiLieuList.filter((d) => d.selected);
    if (selectedDocs.length === 0) {
      errs.taiLieu = 'Bắt buộc chọn ít nhất 01 tài liệu trong danh mục hồ sơ bàn giao.';
    }

    if (taoVanBan && !soKyHieu.trim()) {
      errs.soKyHieu = 'Vui lòng nhập số / ký hiệu văn bản bàn giao.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Xử lý xác nhận bàn giao
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setActiveTab('form');
      return;
    }

    setIsSubmitting(true);

    const selectedCanBo = noiBoOfficers.find((o) => o.id === selectedCanBoNoiBoId);

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit({
        stepId: 'STEP-03C',
        huongXuLy: 'ban_giao',
        banGiaoType,
        donViNhanId: banGiaoType === 'don_vi_khac' ? selectedDonViId : undefined,
        donViNhanName: banGiaoType === 'don_vi_khac' ? currentSelectedDept.name : undefined,
        phongBanNhan: banGiaoType === 'don_vi_khac' ? phongBanNhan : undefined,
        canBoDauMoi: banGiaoType === 'don_vi_khac' ? canBoDauMoi : undefined,
        phuongThucChuyen,
        canBoNhanId: banGiaoType === 'can_bo_noi_bo' ? selectedCanBoNoiBoId : undefined,
        canBoNhan: selectedCanBo,
        lyDoBanGiao: lyDoChiTiet.trim(),
        canCuPhapLy: canCuPhapLy.trim(),
        ghiChuBanGiao: ghiChuBanGiao.trim(),
        thoiHanTiepNhan,
        danhMucTaiLieu: taiLieuList.filter((d) => d.selected),
        cauHinhVanBan: {
          taoVanBan,
          loaiVanBan,
          soKyHieu: soKyHieu.trim(),
          ngayLap: todayStr,
          nguoiLap: currentOfficerName,
        },
      });
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================== HEADER ===================== */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-500/10 via-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20 shrink-0">
              <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
            </div>

          </div>

          <div className="flex items-center gap-2">
            {/* Tab switcher: Lập thông tin vs Xem trước văn bản */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'form'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span>Thông tin bàn giao</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'preview'
                  ? 'bg-white text-amber-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">description</span>
                <span>Xem trước biểu mẫu ({loaiVanBan === 'bien_ban_ban_giao' ? 'Biên bản' : 'Phiếu chuyển'})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
              title="Đóng"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* ===================== HỒ SƠ TÓM TẮT BANNER ===================== */}
        <div className="bg-amber-50/60 border-b border-amber-200/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-amber-950 font-label-technical flex items-center gap-1">
              <span className="material-symbols-outlined text-amber-700 text-[16px]">folder_open</span>
              {donInfo.code || donInfo.luotNhanId}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-700">
              Người nộp: <strong className="text-slate-900">{donInfo.nguoiNop}</strong> ({donInfo.sdt || 'SĐT: 0983 123 456'})
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-700 hidden sm:inline">
              Loại: <strong className="text-slate-900">{donInfo.loaiDon}</strong>
            </span>
          </div>
          <div className="text-[11px] text-amber-800 font-medium">
            Cán bộ lập: <strong>{currentOfficerName}</strong> ({currentDepartmentName})
          </div>
        </div>

        {/* ===================== BODY CONTENT ===================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error summary */}
              {Object.keys(errors).length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-shake">
                  <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">error</span>
                  <div>
                    <strong className="block font-bold">Vui lòng kiểm tra lại các dữ liệu bắt buộc (STEP-03C):</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11.5px]">
                      {Object.values(errors).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ──────────────── 1. CHỌN NƠI NHẬN BÀN GIAO ──────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Nơi nhận bàn giao hồ sơ <span className="text-rose-500">*</span>
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Ràng buộc bắt buộc có nơi nhận</span>
                </div>

                {/* 2 tabs chọn loại nơi nhận */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setBanGiaoType('don_vi_khac');
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.canBo;
                        return next;
                      });
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${banGiaoType === 'don_vi_khac'
                      ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-200 shadow-2xs'
                      : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200'
                      }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${banGiaoType === 'don_vi_khac' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                        }`}
                    >
                      {banGiaoType === 'don_vi_khac' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>Cơ quan / Đơn vị khác</span>

                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Chuyển cơ quan điều tra, thanh tra, ngành dọc, UBND quận/huyện đúng thẩm quyền.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBanGiaoType('can_bo_noi_bo');
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.donVi;
                        return next;
                      });
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${banGiaoType === 'can_bo_noi_bo'
                      ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-200 shadow-2xs'
                      : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200'
                      }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${banGiaoType === 'can_bo_noi_bo' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                        }`}
                    >
                      {banGiaoType === 'can_bo_noi_bo' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>Cán bộ trong phòng</span>

                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Bàn giao cho chuyên viên khác trong Phòng Tiếp dân &amp; Xử lý đơn thụ lý thay thế.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Form chi tiết theo loại bàn giao */}
                {banGiaoType === 'don_vi_khac' ? (
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Cơ quan / Đơn vị tiếp nhận <span className="text-rose-500">*</span>:
                        </label>
                        <select
                          value={selectedDonViId}
                          onChange={(e) => setSelectedDonViId(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                        >
                          {recipientDepartments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>


                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Chọn cán bộ chuyên môn nhận bàn giao <span className="text-rose-500">*</span>:
                      </label>
                      <input
                        type="text"
                        value={officerSearch}
                        onChange={(e) => setOfficerSearch(e.target.value)}
                        placeholder="Tìm cán bộ..."
                        className="p-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs w-48 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {filteredNoiBoOfficers.map((officer) => {
                        const isSelected = selectedCanBoNoiBoId === officer.id;
                        return (
                          <div
                            key={officer.id}
                            onClick={() => setSelectedCanBoNoiBoId(officer.id)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${isSelected
                              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200 shadow-2xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {officer.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-slate-900 truncate">{officer.name}</div>
                                <div className="text-[10.5px] text-slate-500 truncate">{officer.role}</div>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold shrink-0">
                              {officer.workloadCount} việc
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ──────────────── 2. LẬP THÔNG TIN BÀN GIAO BẮT BUỘC ──────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Thông tin &amp; Dữ liệu bàn giao bắt buộc <span className="text-rose-500">*</span>
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Căn cứ &amp; Danh mục hồ sơ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Căn cứ phân loại lý do:
                    </label>
                    <select
                      value={lyDoSelect}
                      onChange={(e) => handleSelectLyDo(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      <option value="tham_quyen_co_quan_khac">Thuộc thẩm quyền cơ quan khác (Đ.26 Luật Tố cáo)</option>
                      <option value="nganh_doc_chuyen_mon">Thuộc thẩm quyền ngành dọc chuyên môn</option>
                      <option value="co_quan_dieu_tra">Chuyển Cơ quan CSĐT xử lý tin tội phạm</option>
                      <option value="phan_cong_lai_noi_bo">Bàn giao nội bộ / Thay đổi cán bộ thụ lý</option>
                      <option value="khac">Lý do khác...</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chi tiết lý do bàn giao <span className="text-rose-500">*</span>:
                    </label>
                    <textarea
                      rows={2}
                      value={lyDoChiTiet}
                      onChange={(e) => setLyDoChiTiet(e.target.value)}
                      placeholder="Nhập chi tiết căn cứ và lý do bàn giao..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Căn cứ pháp lý áp dụng:
                    </label>
                    <input
                      type="text"
                      value={canCuPhapLy}
                      onChange={(e) => setCanCuPhapLy(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời hạn tiếp nhận phản hồi:
                    </label>
                    <input
                      type="text"
                      value={thoiHanTiepNhan}
                      onChange={(e) => setThoiHanTiepNhan(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Danh mục tài liệu bàn giao */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-700">inventory_2</span>
                      <span>Danh mục tài liệu bàn giao kèm theo ({taiLieuList.filter((d) => d.selected).length}/{taiLieuList.length})</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500">Được in trong Biên bản bàn giao</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                          <th className="p-2.5 pl-3 w-10 text-center">Chọn</th>
                          <th className="p-2.5">Tên tài liệu / Hồ sơ</th>
                          <th className="p-2.5 w-32">Loại bản</th>
                          <th className="p-2.5 w-20 text-center">Số lượng</th>
                          <th className="p-2.5 hidden sm:table-cell">Tình trạng niêm phong</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {taiLieuList.map((doc) => (
                          <tr
                            key={doc.id}
                            className={`hover:bg-slate-50/80 transition-colors ${doc.selected ? 'bg-amber-50/30' : 'opacity-60'
                              }`}
                          >
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={doc.selected}
                                onChange={() => handleToggleTaiLieu(doc.id)}
                                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                              />
                            </td>
                            <td className="p-2.5 font-medium text-slate-800">
                              <span onClick={() => handleToggleTaiLieu(doc.id)} className="cursor-pointer">
                                {doc.tenTaiLieu}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-600">
                              {doc.loaiBan === 'ban_chinh' && (
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10.5px]">
                                  Bản chính
                                </span>
                              )}
                              {doc.loaiBan === 'ban_sao_chung_thuc' && (
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium text-[10.5px]">
                                  Sao chứng thực
                                </span>
                              )}
                              {doc.loaiBan === 'file_so_hoa' && (
                                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-medium text-[10.5px]">
                                  Số hóa PDF
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-center">
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={doc.soLuong}
                                onChange={(e) => handleUpdateSoLuong(doc.id, parseInt(e.target.value) || 1)}
                                className="w-14 p-1 text-center bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-amber-500 font-semibold"
                              />
                            </td>
                            <td className="p-2.5 text-slate-500 text-[11px] hidden sm:table-cell">
                              {doc.tinhTrang}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ghi chú / Yêu cầu phối hợp bàn giao:
                  </label>
                  <textarea
                    rows={2}
                    value={ghiChuBanGiao}
                    onChange={(e) => setGhiChuBanGiao(e.target.value)}
                    placeholder="Lưu ý đối với bên nhận hồ sơ..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              {/* ──────────────── 3. CẤU HÌNH SẢN PHẨM / ĐẦU RA (BIÊN BẢN/PHIẾU BÀN GIAO) ──────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Phiếu / Biên bản bàn giao
                    </h3>
                  </div>

                  {/* Switch cấu hình tạo văn bản */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taoVanBan}
                      onChange={(e) => setTaoVanBan(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600 relative"></div>
                    <span className="text-xs font-bold text-slate-800">
                      {taoVanBan ? 'Có cấu hình tạo văn bản' : 'Không tạo văn bản'}
                    </span>
                  </label>
                </div>

                {taoVanBan ? (
                  <div className="space-y-3 p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Loại biểu mẫu văn bản:
                        </label>
                        <select
                          value={loaiVanBan}
                          onChange={(e) => setLoaiVanBan(e.target.value as any)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-semibold"
                        >
                          <option value="bien_ban_ban_giao">Biên bản bàn giao hồ sơ đơn (Mẫu 01/BB-BG)</option>
                          <option value="phieu_chuyen_don">Phiếu chuyển đơn (Mẫu số 05/PC-Đ)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số / Ký hiệu văn bản <span className="text-rose-500">*</span>:
                        </label>
                        <input
                          type="text"
                          value={soKyHieu}
                          onChange={(e) => setSoKyHieu(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Ngày lập văn bản:
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={todayStr}
                          className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-700 font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 text-amber-800">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Văn bản sẽ được gắn kèm hồ sơ và lưu trữ trong lịch sử chuyển giao.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className="text-xs text-amber-800 hover:text-amber-950 font-bold underline flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>Xem trước văn bản này</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Chế độ bàn giao nhanh không xuất văn bản. Hệ thống chỉ cập nhật trạng thái bàn giao và chuyển Task.
                  </p>
                )}
              </div>
            </form>
          ) : (
            /* ===================== TAB 2: XEM TRƯỚC VĂN BẢN (A4 DOCUMENT PREVIEW) ===================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-xl">print</span>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Xem trước bản in thể thức chuẩn: {loaiVanBan === 'bien_ban_ban_giao' ? 'Biên bản bàn giao' : 'Phiếu chuyển đơn'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>In biểu mẫu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Chỉnh sửa thông tin</span>
                  </button>
                </div>
              </div>

              {/* Tờ A4 Mockup */}
              <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-md max-w-3xl mx-auto font-serif text-slate-900 space-y-6 text-sm leading-relaxed">
                {/* Quốc hiệu tiêu ngữ */}
                <div className="grid grid-cols-2 gap-4 text-center pb-4 border-b border-slate-300">
                  <div>
                    <p className="font-bold text-xs uppercase">{currentDepartmentName.toUpperCase()}</p>
                    <p className="font-bold text-xs">BỘ PHẬN XỬ LÝ ĐƠN THƯ</p>
                    <p className="text-[11px] font-sans mt-1">Số: {soKyHieu || '...../BB-BG'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-bold text-xs underline decoration-1 underline-offset-4">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="text-[11px] italic font-sans mt-1">Hà Nội, ngày {todayStr.split('/')[0]} tháng {todayStr.split('/')[1]} năm {todayStr.split('/')[2]}</p>
                  </div>
                </div>

                {/* Tiêu đề văn bản */}
                <div className="text-center space-y-1">
                  <h1 className="text-base sm:text-lg font-bold uppercase tracking-tight">
                    {loaiVanBan === 'bien_ban_ban_giao'
                      ? 'BIÊN BẢN BÀN GIAO HỒ SƠ ĐƠN THƯ'
                      : 'PHIẾU CHUYỂN ĐƠN THEO THẨM QUYỀN'}
                  </h1>
                  <p className="text-xs italic font-sans text-slate-700">
                    (V/v Bàn giao hồ sơ đơn {donInfo.code || donInfo.luotNhanId} của ông/bà {donInfo.nguoiNop})
                  </p>
                </div>

                {/* Căn cứ */}
                <div className="text-xs italic space-y-1 font-sans text-slate-700">
                  <p>• {canCuPhapLy}</p>
                  <p>• Căn cứ phân loại và kết quả xử lý ban đầu tại bước [STEP-03C: Bàn giao đơn].</p>
                </div>

                {/* Các bên tham gia */}
                <div className="space-y-3 font-sans text-xs">
                  <div>
                    <strong className="font-bold">I. BÊN BÀN GIAO (BÊN A):</strong>
                    <div className="pl-4 mt-1 space-y-0.5 text-slate-700">
                      <p>- Đại diện: <strong>{currentOfficerName}</strong> - Chức vụ: Cán bộ thụ lý chuyên môn</p>
                      <p>- Cơ quan/Đơn vị: {currentDepartmentName}</p>
                    </div>
                  </div>

                  <div>
                    <strong className="font-bold">II. BÊN NHẬN BÀN GIAO (BÊN B):</strong>
                    <div className="pl-4 mt-1 space-y-0.5 text-slate-700">
                      {banGiaoType === 'don_vi_khac' ? (
                        <>
                          <p>- Cơ quan/Đơn vị tiếp nhận: <strong>{currentSelectedDept.name}</strong></p>
                          <p>- Bộ phận tiếp nhận: {phongBanNhan} {canBoDauMoi ? `(Cán bộ: ${canBoDauMoi})` : ''}</p>
                          <p>- Phương thức chuyển giao: {phuongThucChuyen === 'lien_thong_dien_tu' ? 'Liên thông qua hệ thống điện tử GOVEX' : phuongThucChuyen === 'buu_chinh_cong_ich' ? 'Dịch vụ bưu chính công ích' : 'Trực tiếp hồ sơ giấy'}</p>
                        </>
                      ) : (
                        <>
                          <p>- Cán bộ chuyên môn nhận: <strong>{noiBoOfficers.find((o) => o.id === selectedCanBoNoiBoId)?.name || 'Cán bộ cùng phòng'}</strong></p>
                          <p>- Chức vụ: {noiBoOfficers.find((o) => o.id === selectedCanBoNoiBoId)?.role || 'Chuyên viên'}</p>
                          <p>- Đơn vị: {currentDepartmentName}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <strong className="font-bold">III. NỘI DUNG VÀ LÝ DO BÀN GIAO:</strong>
                    <p className="pl-4 mt-1 text-slate-800 leading-relaxed italic">
                      &quot;{lyDoChiTiet}&quot;
                    </p>
                  </div>

                  <div>
                    <strong className="font-bold">IV. DANH MỤC HỒ SƠ, TÀI LIỆU BÀN GIAO KÈM THEO:</strong>
                    <div className="mt-2 border border-slate-300 rounded-lg overflow-hidden">
                      <table className="w-full text-xs text-left border-collapse font-sans">
                        <thead className="bg-slate-100 font-bold border-b border-slate-300">
                          <tr>
                            <th className="p-2 text-center w-10">STT</th>
                            <th className="p-2">Tên tài liệu / Hồ sơ</th>
                            <th className="p-2 w-28 text-center">Hình thức</th>
                            <th className="p-2 w-20 text-center">Số lượng</th>
                            <th className="p-2">Tình trạng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {taiLieuList.filter((d) => d.selected).map((doc, idx) => (
                            <tr key={doc.id}>
                              <td className="p-2 text-center font-mono">{idx + 1}</td>
                              <td className="p-2 font-medium">{doc.tenTaiLieu}</td>
                              <td className="p-2 text-center">
                                {doc.loaiBan === 'ban_chinh' ? 'Bản chính' : doc.loaiBan === 'ban_sao_chung_thuc' ? 'Sao chứng thực' : 'Bản chụp/Scan'}
                              </td>
                              <td className="p-2 text-center font-bold">{doc.soLuong}</td>
                              <td className="p-2 text-slate-600">{doc.tinhTrang}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <p className="pt-2 text-slate-700 italic">
                    Biên bản được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để theo dõi và thực hiện.
                  </p>
                </div>

                {/* Chữ ký */}
                <div className="grid grid-cols-2 gap-8 text-center pt-8 font-sans">
                  <div>
                    <p className="font-bold text-xs uppercase">ĐẠI DIỆN BÊN NHẬN</p>
                    <p className="text-[11px] italic text-slate-500">(Ký, ghi rõ họ tên và đóng dấu)</p>
                    <div className="h-16"></div>
                    <p className="font-semibold text-xs text-slate-600">{canBoDauMoi || '(Người nhận bàn giao)'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-xs uppercase">CÁN BỘ BÀN GIAO</p>
                    <p className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="px-3 py-1 bg-amber-50 border border-dashed border-amber-300 text-amber-800 text-[11px] rounded font-mono font-bold">
                        ĐÃ KÝ SỐ: {currentOfficerName}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-slate-900">{currentOfficerName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================== FOOTER BUTTONS ===================== */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-amber-600">info</span>
            <span>Hồ sơ chuyển trạng thái <strong>Đã bàn giao</strong> và gửi thông báo xác nhận đến bên nhận.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Hủy bỏ
            </button>

            {activeTab === 'preview' ? (
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                Quay lại biểu mẫu
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (validateForm()) setActiveTab('preview');
                }}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Xem trước biểu mẫu</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-amber-600/20 cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">forward</span>
              <span>{isSubmitting ? 'Đang chuyển hồ sơ...' : 'Xác nhận bàn giao & Chuyển hồ sơ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
