// src/components/modals/DonTrungDetailDrawer.tsx
import React, { useState, useEffect } from 'react';

export interface QuaTrinhXuLyItem {
  date: string;
  title: string;
  actor: string;
  desc: string;
  status: 'done' | 'in_progress' | 'pending';
}

export interface TaiLieuDinhKemItem {
  name: string;
  size: string;
  type: string;
  downloadUrl?: string;
}

export interface TieuChiSoSanhItem {
  tieuChi: string;
  donGoc: string;
  donMoi: string;
  match: boolean;
  note: string;
}

export interface DonTrungItem {
  id: string;
  code: string;
  status: string;
  title: string;
  matchPercent: number;
  tags: string[];
  ngayNhan: string;
  nguoiNop: string;
  cccd?: string;
  soDienThoai?: string;
  diaChi?: string;
  loaiDon?: string;
  linhVuc?: string;
  doiTuongBiPhanAnh?: string;
  canBoThuLy: string;
  donVi: string;
  noiDungGhepGoiY: string;
  tomTatNoiDung?: string;
  quaTrinhXuLy?: QuaTrinhXuLyItem[];
  taiLieuDinhKem?: TaiLieuDinhKemItem[];
  tieuChiSoSanh?: TieuChiSoSanhItem[];
}

export interface DonTrungDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  donTrung: DonTrungItem | null;
  currentLuotNhanCode?: string;
  currentNguoiGui?: string;
  currentCccd?: string;
  isSelectedForGhep?: boolean;
  isDetermined?: boolean;
  onSelectForGhep: (donTrung: DonTrungItem) => void;
  onOpenSoSanhChiTiet?: (donTrung: DonTrungItem) => void;
}

export default function DonTrungDetailDrawer({
  isOpen,
  onClose,
  donTrung,
  currentLuotNhanCode = 'LN-56/2026-GOVEX',
  currentNguoiGui = 'Đại diện KDC số 4',
  currentCccd = '001075018392',
  isSelectedForGhep = false,
  isDetermined = false,
  onSelectForGhep,
  onOpenSoSanhChiTiet,
}: DonTrungDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'tong-quan' | 'tien-do' | 'tai-lieu' | 'doi-chieu'>('tong-quan');
  const [copiedCode, setCopiedCode] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('tong-quan');
      setPreviewFile(null);
    }
  }, [isOpen, donTrung?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !donTrung) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(donTrung.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const defaultQuaTrinhXuLy: QuaTrinhXuLyItem[] = [
    {
      date: donTrung.ngayNhan,
      title: 'Tiếp nhận đơn & Vào sổ theo dõi',
      actor: donTrung.canBoThuLy,
      desc: 'Tiếp nhận đơn thư, đối chiếu thông tin chủ thể và cấp mã hồ sơ chính thức.',
      status: 'done',
    },
    {
      date: '12/09/2026',
      title: 'Kiểm tra hiện trường & Thẩm tra ban đầu',
      actor: 'Tổ công tác TDP 4 & Cán bộ thụ lý',
      desc: 'Lập biên bản xác minh thực địa, ghi nhận hiện trạng phản ánh theo nội dung đơn.',
      status: 'done',
    },
    {
      date: '16/09/2026',
      title: 'Phối hợp đơn vị chuyên môn đo kiểm',
      actor: 'Phòng Tài nguyên & Môi trường',
      desc: 'Tiến hành đo đạc nồng độ khí thải, tiếng ồn tại khu vực dân sinh giáp ranh.',
      status: 'done',
    },
    {
      date: '20/09/2026',
      title: 'Tổng hợp kết quả & Dự thảo văn bản xử lý',
      actor: donTrung.canBoThuLy,
      desc: 'Đang xây dựng báo cáo kết quả xác minh và dự thảo thông báo trả lời công dân.',
      status: 'in_progress',
    },
  ];

  const defaultTaiLieu: TaiLieuDinhKemItem[] = [
    {
      name: `Don_thu_goc_${donTrung.code.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`,
      size: '2.4 MB',
      type: 'Đơn thư gốc scan (Bản có chữ ký)',
    },
    {
      name: 'Bien_ban_kiem_tra_hien_truong.pdf',
      size: '1.8 MB',
      type: 'Biên bản làm việc thực địa',
    },
    {
      name: 'Hinh_anh_hien_truong_ghi_nhan.jpg',
      size: '3.6 MB',
      type: 'Hình ảnh bằng chứng',
    },
    {
      name: 'Phieu_chuyen_thong_tin_chuyen_mon.pdf',
      size: '780 KB',
      type: 'Phiếu kiểm tra & thụ lý',
    },
  ];

  const defaultTieuChiSoSanh: TieuChiSoSanhItem[] = [
    {
      tieuChi: 'Người đứng đơn',
      donGoc: donTrung.nguoiNop,
      donMoi: currentNguoiGui,
      match: true,
      note: 'Trùng khớp 100% chủ thể',
    },
    {
      tieuChi: 'Số định danh CCCD',
      donGoc: donTrung.cccd || '001075018392',
      donMoi: currentCccd,
      match: true,
      note: 'Trùng khớp số CCCD/Định danh',
    },
    {
      tieuChi: 'Đối tượng bị phản ánh',
      donGoc: donTrung.doiTuongBiPhanAnh || 'Cơ sở tái chế phế liệu Minh Phát',
      donMoi: 'Cơ sở tái chế Minh Phát',
      match: true,
      note: 'Trùng khớp đối tượng vi phạm',
    },
    {
      tieuChi: 'Địa bàn phát sinh',
      donGoc: donTrung.diaChi || 'TDP số 4, Cầu Giấy, Hà Nội',
      donMoi: 'Khu dân cư TDP số 4, Cầu Giấy, Hà Nội',
      match: true,
      note: 'Cùng vị trí địa bàn vụ việc',
    },
    {
      tieuChi: 'Nội dung & Chứng cứ mới',
      donGoc: 'Biên bản ghi nhận ngày ' + donTrung.ngayNhan,
      donMoi: 'Bổ sung hợp đồng & biên bản đo đạc ban đêm',
      match: false,
      note: 'Cung cấp chứng cứ bổ sung cho đơn gốc',
    },
  ];

  const quaTrinhList = donTrung.quaTrinhXuLy || defaultQuaTrinhXuLy;
  const taiLieuList = donTrung.taiLieuDinhKem || defaultTaiLieu;
  const tieuChiList = donTrung.tieuChiSoSanh || defaultTieuChiSoSanh;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* 1. Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 animate-fade-in cursor-pointer"
        title="Nhấp ra ngoài để đóng ngăn kéo"
      />

      {/* 2. Slide-over Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-2xl lg:max-w-3xl bg-white shadow-2xl border-l border-slate-200/90 flex flex-col overflow-hidden pointer-events-auto animate-drawer-slide-in h-full">
          {/* DRAWER HEADER */}
          <div className="px-6 py-4 border-b border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#004ac6] text-white flex items-center justify-center shadow-xs shrink-0">
                <span className="material-symbols-outlined text-2xl">folder_shared</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-base font-extrabold text-slate-900">
                    {donTrung.code}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                    title="Sao chép mã đơn"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {copiedCode ? 'check' : 'content_copy'}
                    </span>
                  </button>
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-100 text-blue-700">
                    {donTrung.status}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      donTrung.matchPercent >= 90
                        ? 'bg-rose-100/90 text-rose-800 border-rose-200'
                        : 'bg-amber-100/90 text-amber-800 border-amber-200'
                    }`}
                  >
                    Trùng {donTrung.matchPercent}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  Thụ lý bởi: <strong className="text-slate-800">{donTrung.canBoThuLy}</strong> ({donTrung.donVi}) • Ngày nhận: <span className="font-mono">{donTrung.ngayNhan}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
                title="Đóng ngăn kéo (Esc)"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                <span>Đóng (Esc)</span>
              </button>
            </div>
          </div>

          {/* DRAWER TABS NAVIGATION */}
          <div className="px-6 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2 shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('tong-quan')}
              className={`py-3 px-3 border-b-2 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'tong-quan'
                  ? 'border-[#004ac6] text-[#004ac6]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">description</span>
              <span>Tổng quan &amp; Chủ thể</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tien-do')}
              className={`py-3 px-3 border-b-2 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'tien-do'
                  ? 'border-[#004ac6] text-[#004ac6]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">timeline</span>
              <span>Tiến độ xử lý</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                {quaTrinhList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tai-lieu')}
              className={`py-3 px-3 border-b-2 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'tai-lieu'
                  ? 'border-[#004ac6] text-[#004ac6]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">attach_file</span>
              <span>Tài liệu đính kèm</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                {taiLieuList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('doi-chieu')}
              className={`py-3 px-3 border-b-2 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'doi-chieu'
                  ? 'border-[#004ac6] text-[#004ac6]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">compare_arrows</span>
              <span>Đối chiếu AI</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                {donTrung.matchPercent}%
              </span>
            </button>
          </div>

          {/* DRAWER BODY (SCROLLABLE CONTENT) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* TAB 1: TỔNG QUAN & CHỦ THỂ */}
            {activeTab === 'tong-quan' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Thông báo phân tích AI */}
                <div className="p-3.5 bg-gradient-to-r from-rose-50/90 to-amber-50/90 border border-rose-200/90 rounded-2xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-950 flex items-center gap-1.5 text-xs">
                      <span className="material-symbols-outlined text-[17px] text-rose-700">psychology</span>
                      Đánh giá mức độ trùng lặp do AI phân tích
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900 text-[11px] font-extrabold">
                      Tương đồng {donTrung.matchPercent}%
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-700 leading-relaxed">
                    {donTrung.noiDungGhepGoiY}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10.5px] text-slate-500 font-medium">Yếu tố tương đồng:</span>
                    {donTrung.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-white border border-rose-200 text-rose-800 text-[10.5px] font-semibold shadow-2xs"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tiêu đề & Tóm tắt vụ việc */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                    Tiêu đề vụ việc
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {donTrung.title}
                  </h4>
                  {donTrung.tomTatNoiDung && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                        Tóm tắt nội dung đơn
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {donTrung.tomTatNoiDung}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bảng chi tiết chủ thể & Vụ việc */}
                <div className="border border-slate-200/90 rounded-2xl overflow-hidden text-xs">
                  <div className="bg-slate-100/80 px-4 py-2.5 font-bold text-slate-800 border-b border-slate-200 flex items-center justify-between">
                    <span>Thông tin chủ thể &amp; Phân loại vụ việc</span>
                    <span className="text-[11px] text-slate-500 font-normal">Hồ sơ CSDL số</span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 p-3 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Người đứng đơn:</span>
                        <strong className="text-slate-900 font-semibold">{donTrung.nguoiNop}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Số định danh CCCD:</span>
                        <strong className="text-slate-900 font-mono">{donTrung.cccd || '001075018392'}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 p-3 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Số điện thoại:</span>
                        <span className="text-slate-700 font-mono">{donTrung.soDienThoai || '0912 345 678'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Địa chỉ liên hệ:</span>
                        <span className="text-slate-700">{donTrung.diaChi || 'TDP số 4, Cầu Giấy, TP. Hà Nội'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 p-3 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Đối tượng bị phản ánh:</span>
                        <strong className="text-slate-800">{donTrung.doiTuongBiPhanAnh || 'Cơ sở tái chế Minh Phát'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Loại đơn &amp; Lĩnh vực:</span>
                        <span className="text-slate-700">{donTrung.loaiDon || 'Phản ánh / Kiến nghị'} • {donTrung.linhVuc || 'Môi trường'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 p-3 gap-2 bg-slate-50/50">
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Cơ quan thụ lý giải quyết:</span>
                        <span className="font-semibold text-slate-800">{donTrung.donVi}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Cán bộ thụ lý chính:</span>
                        <span className="font-bold text-[#004ac6]">{donTrung.canBoThuLy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TIẾN ĐỘ XỬ LÝ */}
            {activeTab === 'tien-do' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                  <span>Trạng thái hiện tại: <strong>{donTrung.status}</strong></span>
                  <span className="font-mono text-[11px] text-blue-700">Ngày vào sổ: {donTrung.ngayNhan}</span>
                </div>

                <div className="space-y-4 relative pl-4 before:content-[''] before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {quaTrinhList.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Icon mốc */}
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 text-[11px] font-bold ${
                          step.status === 'done'
                            ? 'bg-emerald-500 text-white shadow-2xs'
                            : step.status === 'in_progress'
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {step.status === 'done' ? '✓' : idx + 1}
                      </div>

                      {/* Nội dung mốc */}
                      <div className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <h5 className="font-bold text-slate-900 text-xs">{step.title}</h5>
                          <span className="text-[10.5px] font-mono text-slate-400">{step.date}</span>
                        </div>
                        <p className="text-[11.5px] text-slate-600 leading-relaxed">{step.desc}</p>
                        <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">person</span>
                          <span>{step.actor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: TÀI LIỆU ĐÍNH KÈM */}
            {activeTab === 'tai-lieu' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Tổng số {taiLieuList.length} tệp tài liệu trong hồ sơ đơn gốc</span>
                  <span className="text-emerald-700 font-medium">✓ Đã đối soát toàn vẹn CSDL</span>
                </div>

                <div className="space-y-2">
                  {taiLieuList.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-lg">
                            {file.name.endsWith('.pdf') ? 'picture_as_pdf' : 'image'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 text-xs block truncate">
                            {file.name}
                          </span>
                          <span className="text-[10.5px] text-slate-400 flex items-center gap-2">
                            <span>{file.type}</span>
                            <span>•</span>
                            <span className="font-mono">{file.size}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file.name)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-200"
                        >
                          Xem tệp
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {previewFile && (
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-blue-400">preview</span>
                        Xem trước: {previewFile}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewFile(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                    <div className="h-40 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs italic">
                      [Giao diện xem trước nội dung tài liệu scan của hồ sơ {donTrung.code}]
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ĐỐI CHIẾU AI */}
            {activeTab === 'doi-chieu' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center justify-between">
                  <span className="font-bold">Độ tương đồng nội dung: {donTrung.matchPercent}%</span>
                  <span className="text-emerald-800 font-semibold">Khuyến nghị: Ghép vào hồ sơ gốc</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[11px] uppercase tracking-wider font-semibold">
                        <th className="p-2.5 w-1/4">Tiêu chí</th>
                        <th className="p-2.5 w-3/8 bg-blue-50/50 text-blue-900">Lượt nhận mới ({currentLuotNhanCode})</th>
                        <th className="p-2.5 w-3/8 bg-indigo-50/50 text-indigo-900">Đơn gốc ({donTrung.code})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {tieuChiList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="p-2.5 font-semibold text-slate-600">{item.tieuChi}</td>
                          <td className="p-2.5">{item.donMoi}</td>
                          <td className="p-2.5">
                            <div className="flex items-center justify-between gap-1">
                              <span>{item.donGoc}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                  item.match
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {item.note}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11.5px] text-slate-600 leading-relaxed">
                  💡 <strong>Căn cứ xử lý:</strong> Theo Khoản 2 Điều 27 Thông tư 05/2021/TT-TTCP, trường hợp đơn cùng người đứng đơn, cùng đối tượng và nội dung mà vụ việc đang được thụ lý giải quyết thì tiếp nhận để ghép vào hồ sơ đang thụ lý, không mở mã đơn mới.
                </div>
              </div>
            )}
          </div>

          {/* DRAWER FOOTER (ACTIONS) */}
          <div className="px-6 py-3.5 border-t border-slate-200/90 bg-slate-50 flex items-center justify-between shrink-0 gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
              >
                Đóng
              </button>
              {onOpenSoSanhChiTiet && (
                <button
                  type="button"
                  onClick={() => onOpenSoSanhChiTiet(donTrung)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">compare</span>
                  <span>Mở bảng đối chiếu chi tiết</span>
                </button>
              )}
            </div>

            {isDetermined ? (
              <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-slate-500">lock</span>
                <span>Hồ sơ đã xác định hướng xử lý</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onSelectForGhep(donTrung)}
                className={`px-5 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm transition-all ${
                  isSelectedForGhep
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-[#a61c1c] text-white hover:bg-[#8f1818]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isSelectedForGhep ? 'check_circle' : 'merge_type'}
                </span>
                <span>
                  {isSelectedForGhep
                    ? 'Đang chọn đơn này để ghép'
                    : 'Chọn ghép vào đơn này'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
