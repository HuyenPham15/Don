import React, { useState, useRef } from 'react';
import { Screen } from '../../types';

export type HuongGiaiQuyetType = 'thu_ly' | 'yeu_cau_bo_sung' | 'khong_thu_ly' | 'ban_giao' | 'tra_lai';

export interface VanBanXacMinhItem {
  id: string;
  loai: 'giay_moi' | 'bien_ban' | 'cong_van' | 'file_scan';
  tenVanBan: string;
  soKyHieu: string;
  ngayLap: string;
  nguoiNhan: string;
  trichYeu: string;
  noiDungChiTiet: string;
  diaDiem?: string;
  thoiGianHen?: string;
  trangThai: 'du_thao' | 'da_ban_hanh' | 'da_dinh_kem';
  tenFileScan?: string;
  dungLuongFile?: string;
}

export interface XacMinhVaDeXuatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHuongXuLy: (huong: HuongGiaiQuyetType | 'quy_trinh') => void;
  onNav?: (screen: Screen) => void;
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
  };
}

export default function XacMinhVaDeXuatModal({
  isOpen,
  onClose,
  onSelectHuongXuLy,
  onNav,
  donInfo = {
    code: 'Đ-2026-00125',
    luotNhanId: 'LN-2026-0819',
    nguoiNop: 'Nguyễn Văn A',
    cccd: '001088012345',
    sdt: '0983 123 456',
    diaChi: 'Cầu Giấy, Hà Nội',
    loaiDon: 'Đơn tố cáo cán bộ vi phạm công vụ',
    noiDung: 'Tố cáo hành vi sách nhiễu, cố ý kéo dài thời gian giải quyết hồ sơ cấp GCNQSDĐ',
    ngayNhan: '16/09/2026',
  },
}: XacMinhVaDeXuatModalProps) {
  // ─── 1. DANH SÁCH VĂN BẢN XÁC MINH CẦN THIẾT ──────────────────────────
  const [danhSachVanBan, setDanhSachVanBan] = useState<VanBanXacMinhItem[]>([
    {
      id: 'vb-xm-01',
      loai: 'giay_moi',
      tenVanBan: 'Giấy mời làm việc với người gửi đơn',
      soKyHieu: '18/GM-TCD',
      ngayLap: '16/09/2026',
      nguoiNhan: donInfo.nguoiNop || 'Nguyễn Văn A',
      trichYeu: 'V/v Làm việc, cung cấp thông tin, tài liệu liên quan đến nội dung đơn',
      thoiGianHen: '08:30 ngày 18/09/2026',
      diaDiem: 'Phòng Tiếp công dân & Xử lý đơn (Phòng 102, Trụ sở UBND quận)',
      noiDungChiTiet: `Kính mời Ông/Bà ${donInfo.nguoiNop || 'Nguyễn Văn A'} có mặt tại Phòng Tiếp công dân để làm việc về nội dung đơn đề ngày ${donInfo.ngayNhan || '16/09/2026'}. Khi đi mang theo Căn cước công dân và toàn bộ bản chính tài liệu, chứng cứ có liên quan đến việc phản ánh/tố cáo.`,
      trangThai: 'da_ban_hanh',
    },
    {
      id: 'vb-xm-02',
      loai: 'bien_ban',
      tenVanBan: 'Biên bản làm việc xác minh thông tin ban đầu',
      soKyHieu: '02/BB-XM',
      ngayLap: '17/09/2026',
      nguoiNhan: `${donInfo.nguoiNop || 'Nguyễn Văn A'} (Người đứng đơn)`,
      trichYeu: 'Ghi nhận ý kiến trình bày và tiếp nhận tài liệu gốc của công dân',
      diaDiem: 'Phòng Tiếp công dân & Xử lý đơn',
      noiDungChiTiet: `Tại buổi làm việc, công dân ${donInfo.nguoiNop || 'Nguyễn Văn A'} khẳng định nội dung đơn gửi là hoàn toàn chính xác, cam kết chịu trách nhiệm trước pháp luật. Công dân đã giao nộp bản sao chứng thực Hợp đồng góp vốn, phiếu thu tiền và biên bản làm việc với Chi nhánh Văn phòng Đăng ký đất đai.`,
      trangThai: 'du_thao',
    },
  ]);

  // Trạng thái modal con: Tạo mới hoặc Xem chi tiết văn bản
  const [editingVanBan, setEditingVanBan] = useState<VanBanXacMinhItem | null>(null);
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);
  const [selectedVanBanType, setSelectedVanBanType] = useState<'giay_moi' | 'bien_ban' | 'cong_van'>('giay_moi');

  // Input file đính kèm ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form soạn thảo văn bản
  const [formSoKyHieu, setFormSoKyHieu] = useState<string>('');
  const [formTenVanBan, setFormTenVanBan] = useState<string>('');
  const [formNguoiNhan, setFormNguoiNhan] = useState<string>('');
  const [formThoiGianHen, setFormThoiGianHen] = useState<string>('');
  const [formDiaDiem, setFormDiaDiem] = useState<string>('');
  const [formTrichYeu, setFormTrichYeu] = useState<string>('');
  const [formNoiDung, setFormNoiDung] = useState<string>('');

  // ─── 2. GHI NHẬN KẾT QUẢ XÁC MINH THỰC TẾ & Ý KIẾN ĐỀ XUẤT CÁN BỘ ─────
  const [ghiChuXacMinh, setGhiChuXacMinh] = useState<string>(
    `Đã tiến hành làm việc trực tiếp với công dân theo Giấy mời số 18/GM-TCD và lập Biên bản làm việc số 02/BB-XM. Cán bộ đã kiểm tra hồ sơ thực tế, đối chiếu bản chính giấy tờ công dân cung cấp. Người nộp đủ năng lực hành vi dân sự, nội dung vụ việc thuộc thẩm quyền xem xét giải quyết của đơn vị, có tài liệu chứng cứ bước đầu rõ ràng, không có dấu hiệu nặc danh hay trùng lặp vụ việc đã giải quyết. Đề xuất: Đủ điều kiện để thụ lý giải quyết.`
  );

  // ─── 3. ĐỀ XUẤT HƯỚNG XỬ LÝ (5 HƯỚNG THEO LUẬT ĐỊNH) ───────────────────
  const [selectedHuong, setSelectedHuong] = useState<HuongGiaiQuyetType>('thu_ly');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => {
      setToastNotice((cur) => (cur === msg ? null : cur));
    }, 3000);
  };

  // Mở trình soạn thảo tạo văn bản mới
  const handleOpenCreateVanBan = (type: 'giay_moi' | 'bien_ban' | 'cong_van') => {
    setSelectedVanBanType(type);
    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const nextDayStr = `${String(now.getDate() + 2).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    if (type === 'giay_moi') {
      setFormSoKyHieu(`${Math.floor(19 + Math.random() * 80)}/GM-TCD`);
      setFormTenVanBan('Giấy mời làm việc xác minh nội dung đơn');
      setFormNguoiNhan(donInfo.nguoiNop || 'Nguyễn Văn A');
      setFormThoiGianHen(`09:00 ngày ${nextDayStr}`);
      setFormDiaDiem('Phòng Tiếp công dân & Xử lý đơn (Phòng 102, Trụ sở UBND quận)');
      setFormTrichYeu(`V/v Mời làm việc xác minh nội dung đơn số ${donInfo.code || 'Đ-2026-00125'}`);
      setFormNoiDung(
        `Kính mời Ông/Bà ${donInfo.nguoiNop || 'Nguyễn Văn A'} có mặt tại Phòng Tiếp công dân để làm việc về các nội dung đã nêu trong đơn. Đề nghị mang theo CCCD và các chứng cứ, tài liệu liên quan.`
      );
    } else if (type === 'bien_ban') {
      setFormSoKyHieu(`0${danhSachVanBan.length + 1}/BB-XM`);
      setFormTenVanBan('Biên bản làm việc xác minh nội dung phản ánh/tố cáo');
      setFormNguoiNhan(`${donInfo.nguoiNop || 'Nguyễn Văn A'} (Công dân đứng đơn)`);
      setFormThoiGianHen(`${todayStr} (14:30)`);
      setFormDiaDiem('Phòng Tiếp công dân & Xử lý đơn');
      setFormTrichYeu(`Biên bản ghi nhận ý kiến và giao nhận tài liệu hồ sơ ${donInfo.code || 'Đ-2026-00125'}`);
      setFormNoiDung(
        `Thành phần làm việc gồm Cán bộ thụ lý và Ông/Bà ${donInfo.nguoiNop || 'Nguyễn Văn A'}. Tại buổi làm việc, cán bộ đã làm rõ các mốc thời gian, người có hành vi vi phạm và lập biên nhận các tài liệu gồm: Bản sao GCNQSDĐ, giấy biên nhận hồ sơ.`
      );
    } else {
      setFormSoKyHieu(`${Math.floor(100 + Math.random() * 200)}/CV-UBND`);
      setFormTenVanBan('Công văn đề nghị cung cấp hồ sơ, tài liệu phục vụ xác minh');
      setFormNguoiNhan('Chi nhánh Văn phòng Đăng ký đất đai quận Cầu Giấy');
      setFormThoiGianHen(`Thời hạn phản hồi: Trong 03 ngày làm việc kể từ ngày nhận công văn`);
      setFormDiaDiem('Gửi qua Trục liên thông văn bản điện tử thành phố');
      setFormTrichYeu(`V/v Đề nghị cung cấp hồ sơ địa chính và tình trạng giải quyết liên quan đến đơn ${donInfo.code || 'Đ-2026-00125'}`);
      setFormNoiDung(
        `Để có căn cứ xử lý đơn của công dân ${donInfo.nguoiNop || 'Nguyễn Văn A'} theo đúng quy định pháp luật, Phòng Tiếp công dân & Xử lý đơn đề nghị Quý cơ quan kiểm tra, sao lục và cung cấp toàn bộ hồ sơ đăng ký cấp GCNQSDĐ của đương sự trước ngày ${nextDayStr}.`
      );
    }
    setEditingVanBan(null);
    setShowEditorModal(true);
  };

  // Mở xem/sửa văn bản đã có trong danh sách
  const handleOpenEditVanBan = (vb: VanBanXacMinhItem) => {
    setSelectedVanBanType(vb.loai === 'file_scan' ? 'bien_ban' : vb.loai);
    setFormSoKyHieu(vb.soKyHieu);
    setFormTenVanBan(vb.tenVanBan);
    setFormNguoiNhan(vb.nguoiNhan);
    setFormThoiGianHen(vb.thoiGianHen || '');
    setFormDiaDiem(vb.diaDiem || '');
    setFormTrichYeu(vb.trichYeu);
    setFormNoiDung(vb.noiDungChiTiet);
    setEditingVanBan(vb);
    setShowEditorModal(true);
  };

  // Lưu văn bản vừa tạo/sửa
  const handleSaveVanBanForm = () => {
    if (!formSoKyHieu.trim() || !formTenVanBan.trim()) {
      showToast('Vui lòng nhập đầy đủ Số ký hiệu và Tên văn bản.');
      return;
    }

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    if (editingVanBan) {
      setDanhSachVanBan((prev) =>
        prev.map((item) =>
          item.id === editingVanBan.id
            ? {
                ...item,
                tenVanBan: formTenVanBan,
                soKyHieu: formSoKyHieu,
                nguoiNhan: formNguoiNhan,
                trichYeu: formTrichYeu,
                noiDungChiTiet: formNoiDung,
                thoiGianHen: formThoiGianHen,
                diaDiem: formDiaDiem,
              }
            : item
        )
      );
      showToast(`✓ Đã cập nhật văn bản ${formSoKyHieu} vào hồ sơ xác minh.`);
    } else {
      const newItem: VanBanXacMinhItem = {
        id: `vb-xm-${Date.now()}`,
        loai: selectedVanBanType,
        tenVanBan: formTenVanBan,
        soKyHieu: formSoKyHieu,
        ngayLap: todayStr,
        nguoiNhan: formNguoiNhan || 'Công dân / Cơ quan phối hợp',
        trichYeu: formTrichYeu,
        noiDungChiTiet: formNoiDung,
        thoiGianHen: formThoiGianHen,
        diaDiem: formDiaDiem,
        trangThai: 'du_thao',
      };
      setDanhSachVanBan((prev) => [newItem, ...prev]);
      showToast(`✓ Đã tạo thành công văn bản ${formSoKyHieu} phục vụ xác minh!`);
    }
    setShowEditorModal(false);
  };

  // Xóa văn bản
  const handleDeleteVanBan = (id: string, soHieu: string) => {
    setDanhSachVanBan((prev) => prev.filter((v) => v.id !== id));
    showToast(`Đã gỡ văn bản ${soHieu} khỏi danh sách xác minh.`);
  };

  // Xử lý đính kèm file scan bên ngoài
  const handleUploadScanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);

    const scanDoc: VanBanXacMinhItem = {
      id: `scan-${Date.now()}`,
      loai: 'file_scan',
      tenVanBan: `Bản scan: ${file.name.replace(/\.[^/.]+$/, '')}`,
      soKyHieu: `SCAN-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      ngayLap: todayStr,
      nguoiNhan: donInfo.nguoiNop || 'Hồ sơ đơn',
      trichYeu: `Tài liệu/Biên bản scan giấy đã ký ngoài thực tế: ${file.name}`,
      noiDungChiTiet: `Đã đính kèm tệp văn bản giấy scan: ${file.name} (${fileSizeMb} MB). Cán bộ đã lưu vào hồ sơ vụ việc phục vụ làm căn cứ đề xuất.`,
      trangThai: 'da_dinh_kem',
      tenFileScan: file.name,
      dungLuongFile: `${fileSizeMb} MB`,
    };

    setDanhSachVanBan((prev) => [scanDoc, ...prev]);
    showToast(`✓ Đã đính kèm thành công tệp: ${file.name} (${fileSizeMb} MB) vào hồ sơ xác minh.`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Xác nhận hướng xử lý để chuyển sang bước tiếp theo
  const handleConfirm = () => {
    onSelectHuongXuLy(selectedHuong);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in font-body-md select-none">
      {/* Toast thông báo nhanh */}
      {toastNotice && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 text-[18px]">info</span>
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Main Modal Box */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-scale-up">
        {/* ===================== HEADER ===================== */}
        <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-white px-6 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
              <span className="material-symbols-outlined text-[24px]">fact_check</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#004ac6] border border-blue-300">
                  Nghiệp vụ xác minh
                </span>
                <span className="text-[11.5px] text-slate-500 font-mono">
                  Hồ sơ: <strong className="text-slate-800">{donInfo.code || 'Đ-2026-00125'}</strong> • Lượt nhận: {donInfo.luotNhanId || 'LN-2026-0819'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-headline-md tracking-tight mt-0.5">
                Xác minh thông tin &amp; Đề xuất hướng xử lý đơn
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ===================== BANNER NÊU RÕ BẢN CHẤT NGHIỆP VỤ THỦ CÔNG ===================== */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-2.5 flex items-start gap-2.5 text-xs text-blue-950 shrink-0">
          <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">info</span>
          <div className="leading-relaxed">
            <span className="font-bold text-blue-900">Quy định nghiệp vụ:</span>{' '}
            <span>
              Công tác xác minh thông tin, gặp gỡ đương sự và thu thập tài liệu do cán bộ thụ lý thực hiện <strong>thủ công ngoài thực tế</strong>. Tại màn hình này, cán bộ chỉ <strong>tạo các văn bản hành chính cần thiết khi xác minh</strong> (Giấy mời làm việc, Biên bản xác minh, Công văn đề nghị phối hợp...) và ghi nhận kết luận để đề xuất hướng xử lý tiếp theo.
            </span>
          </div>
        </div>

        {/* ===================== BODY CHÍNH CỦA MODAL ===================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* KHỐI 1: THÔNG TIN TÓM TẮT ĐƠN CẦN XÁC MINH */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Người đứng đơn</span>
              <p className="font-bold text-slate-900 text-sm">{donInfo.nguoiNop || 'Nguyễn Văn A'}</p>
              <p className="text-slate-500 font-mono text-[11px]">
                CCCD: {donInfo.cccd || '001088012345'} • SĐT: {donInfo.sdt || '0983 123 456'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Loại đơn &amp; Ngày nhận</span>
              <p className="font-semibold text-slate-800">{donInfo.loaiDon || 'Đơn tố cáo cán bộ vi phạm công vụ'}</p>
              <p className="text-slate-500 text-[11px]">Tiếp nhận ngày: {donInfo.ngayNhan || '16/09/2026'}</p>
            </div>
            <div className="space-y-1 md:border-l md:border-slate-200 md:pl-3">
              <span className="text-[11px] text-slate-400 block font-medium">Nội dung tóm tắt</span>
              <p className="text-slate-700 leading-snug line-clamp-2 italic" title={donInfo.noiDung}>
                "{donInfo.noiDung || 'Tố cáo hành vi kéo dài thời gian giải quyết hồ sơ cấp GCNQSDĐ'}"
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* KHỐI 2: TẠO VĂN BẢN CẦN THIẾT PHỤC VỤ XÁC MINH (TRỌNG TÂM YÊU CẦU)      */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[20px]">assignment</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  1. Văn bản phục vụ quá trình xác minh ({danhSachVanBan.length} văn bản):
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 italic">
                * Cán bộ tạo văn bản hành chính theo mẫu chuẩn hoặc đính kèm biên bản giấy scan
              </span>
            </div>

            {/* Thanh công cụ 4 nút tạo văn bản nhanh */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleOpenCreateVanBan('giay_moi')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-blue-200 text-[#004ac6] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                <span>+ Tạo Giấy mời làm việc</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenCreateVanBan('bien_ban')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span>+ Tạo Biên bản làm việc / Xác minh</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenCreateVanBan('cong_van')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>+ Tạo Công văn đề nghị phối hợp</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadScanFile}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95 ml-auto"
                title="Tải lên tệp biên bản làm việc hoặc tài liệu scan đã lập ngoài thực tế"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-600">upload_file</span>
                <span>Đính kèm tệp văn bản scan</span>
              </button>
            </div>

            {/* Danh sách văn bản đã tạo / đã có */}
            <div className="space-y-2">
              {danhSachVanBan.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                  <span className="material-symbols-outlined text-3xl mb-1 text-slate-300 block">description</span>
                  Chưa tạo văn bản xác minh nào. Nhấn các nút phía trên để tạo Giấy mời, Biên bản hoặc đính kèm tệp scan.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3.5 w-12 text-center">STT</th>
                        <th className="py-2.5 px-3">Tên &amp; Số ký hiệu văn bản</th>
                        <th className="py-2.5 px-3">Người nhận / Đối tượng</th>
                        <th className="py-2.5 px-3">Ngày lập</th>
                        <th className="py-2.5 px-3 text-center">Trạng thái</th>
                        <th className="py-2.5 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {danhSachVanBan.map((vb, idx) => (
                        <tr key={vb.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2.5 px-3.5 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  vb.loai === 'giay_moi'
                                    ? 'bg-blue-100 text-[#004ac6]'
                                    : vb.loai === 'bien_ban'
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : vb.loai === 'cong_van'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {vb.loai === 'giay_moi'
                                    ? 'mail'
                                    : vb.loai === 'bien_ban'
                                    ? 'edit_note'
                                    : vb.loai === 'cong_van'
                                    ? 'send'
                                    : 'picture_as_pdf'}
                                </span>
                              </span>
                              <div>
                                <strong className="text-slate-900 block leading-tight">{vb.tenVanBan}</strong>
                                <span className="text-[11px] text-slate-500 font-mono">
                                  Số: <span className="font-semibold text-slate-700">{vb.soKyHieu}</span>
                                  {vb.dungLuongFile && ` • Dung lượng: ${vb.dungLuongFile}`}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800 block">{vb.nguoiNhan}</span>
                            <span className="text-[11px] text-slate-500 line-clamp-1 italic">{vb.trichYeu}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11.5px] text-slate-600">{vb.ngayLap}</td>
                          <td className="py-2.5 px-3 text-center">
                            {vb.trangThai === 'da_ban_hanh' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Đã ban hành
                              </span>
                            ) : vb.trangThai === 'da_dinh_kem' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                Đã đính kèm tệp
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Dự thảo
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditVanBan(vb)}
                                className="px-2 py-1 rounded-md text-[11px] font-bold text-[#004ac6] hover:bg-blue-100/70 border border-blue-200 transition-colors cursor-pointer"
                                title="Xem nội dung và chỉnh sửa văn bản"
                              >
                                Xem / Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  showToast(`Đang in văn bản: ${vb.soKyHieu}...`);
                                  window.print();
                                }}
                                className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 cursor-pointer"
                                title="In văn bản"
                              >
                                <span className="material-symbols-outlined text-[16px]">print</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVanBan(vb.id, vb.soKyHieu)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Xóa văn bản"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* KHỐI 3: GHI NHẬN KẾT QUẢ XÁC MINH THỰC TẾ & Ý KIẾN CỦA CÁN BỘ            */}
          {/* ========================================================================= */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">rate_review</span>
                2. Ghi nhận kết quả xác minh thực tế &amp; Kết luận của cán bộ:
              </label>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="font-medium">Mẫu gợi ý nhanh:</span>
                <button
                  type="button"
                  onClick={() => {
                    setGhiChuXacMinh(
                      `Đã làm việc trực tiếp với công dân theo Giấy mời số 18/GM-TCD và lập Biên bản số 02/BB-XM. Công dân đã xuất trình bản chính các tài liệu chứng minh. Hồ sơ đủ điều kiện luật định để đề xuất hướng thụ lý giải quyết.`
                    );
                    setSelectedHuong('thu_ly');
                  }}
                  className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold cursor-pointer"
                >
                  Đủ ĐK Thụ lý
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGhiChuXacMinh(
                      `Đã làm việc với công dân nhưng chưa xuất trình được bản gốc hợp đồng và chứng từ chuyển tiền liên quan. Đề xuất ban hành văn bản yêu cầu công dân bổ sung hồ sơ chứng minh trong thời hạn 10 ngày.`
                    );
                    setSelectedHuong('yeu_cau_bo_sung');
                  }}
                  className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-semibold cursor-pointer"
                >
                  Thiếu hồ sơ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGhiChuXacMinh(
                      `Qua xác minh, nội dung phản ánh thuộc thẩm quyền giải quyết của UBND phường sở tại theo phân cấp quản lý. Đề xuất chuyển đơn sang đúng cơ quan có thẩm quyền xử lý.`
                    );
                    setSelectedHuong('ban_giao');
                  }}
                  className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-semibold cursor-pointer"
                >
                  Chuyển đơn
                </button>
              </div>
            </div>

            <textarea
              value={ghiChuXacMinh}
              onChange={(e) => setGhiChuXacMinh(e.target.value)}
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 leading-relaxed bg-white shadow-2xs"
              placeholder="Nhập nội dung ghi nhận kết quả xác minh thực tế của cán bộ, tình tiết làm việc và căn cứ đề xuất..."
            />
          </div>

          {/* ========================================================================= */}
          {/* KHỐI 4: CHỌN ĐỀ XUẤT HƯỚNG XỬ LÝ (5 HƯỚNG CHUẨN LUẬT ĐỊNH)               */}
          {/* ========================================================================= */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">alt_route</span>
                <span>3. Chọn Đề xuất hướng xử lý theo kết quả xác minh (5 hướng xử lý):</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Căn cứ Điều 24, 29 Luật Tố cáo &amp; Thông tư 05/2021/TT-TTCP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Hướng 1: Thụ lý đơn */}
              <div
                onClick={() => setSelectedHuong('thu_ly')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedHuong === 'thu_ly'
                    ? 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-200 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-emerald-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      1
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Đủ ĐK Thụ lý
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 pt-1">Thụ lý giải quyết ➔ Lập Tờ trình</h4>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Hồ sơ đủ điều kiện; chuyển sang bước Lập Tờ trình (Mẫu số 01/TT-TTCP) trình Lãnh đạo phê duyệt thụ lý.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-emerald-700 flex items-center justify-between border-t border-emerald-100 mt-2">
                  <span>LẬP TỜ TRÌNH ➔ LUỒNG KÝ</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </div>
              </div>

              {/* Hướng 2: YÊU CẦU BỔ SUNG */}
              <div
                onClick={() => setSelectedHuong('yeu_cau_bo_sung')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedHuong === 'yeu_cau_bo_sung'
                    ? 'border-blue-600 bg-blue-50/90 ring-2 ring-blue-200 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      2
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      Thiếu tài liệu
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 pt-1">Yêu cầu bổ sung tài liệu, hồ sơ</h4>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Chưa đủ căn cứ; chuyển sang lập Thông báo yêu cầu người nộp bổ sung hồ sơ chứng minh (thời hạn 10 ngày).
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-blue-700 flex items-center justify-between border-t border-blue-100 mt-2">
                  <span>THÔNG BÁO BỔ SUNG</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </div>
              </div>

              {/* Hướng 3: KHÔNG THỤ LÝ */}
              <div
                onClick={() => setSelectedHuong('khong_thu_ly')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedHuong === 'khong_thu_ly'
                    ? 'border-red-600 bg-red-50/90 ring-2 ring-red-200 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-red-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      3
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                      KẾT THÚC ĐƠN
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 pt-1">Không thụ lý giải quyết [Điều 29]</h4>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Không đủ điều kiện (nặc danh, không tình tiết mới, hết thời hiệu); chuyển sang Ban hành Thông báo không thụ lý.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-red-700 flex items-center justify-between border-t border-red-100 mt-2">
                  <span>THÔNG BÁO KHÔNG THỤ LÝ</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </div>
              </div>

              {/* Hướng 4: Bàn giao / Chuyển đơn */}
              <div
                onClick={() => setSelectedHuong('ban_giao')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedHuong === 'ban_giao'
                    ? 'border-amber-600 bg-amber-50/90 ring-2 ring-amber-200 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-amber-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      4
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Khác thẩm quyền
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 pt-1">Bàn giao / Chuyển đơn [STEP-03C]</h4>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Nội dung thuộc thẩm quyền cơ quan/đơn vị khác; chuyển sang lập Biên bản chuyển đơn &amp; giao nhận.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-amber-700 flex items-center justify-between border-t border-amber-100 mt-2">
                  <span>BÀN GIAO ĐƠN</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </div>
              </div>

              {/* Hướng 5: Trả lại đơn & Hướng dẫn */}
              <div
                onClick={() => setSelectedHuong('tra_lai')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedHuong === 'tra_lai'
                    ? 'border-rose-600 bg-rose-50/90 ring-2 ring-rose-200 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-rose-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      5
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      KẾT THÚC ĐƠN
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 pt-1">Trả lại đơn &amp; Hướng dẫn [STEP-03D]</h4>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Trả lại đơn cho người nộp do không thuộc phạm vi và lập Phiếu hướng dẫn công dân gửi đúng cơ quan.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-rose-700 flex items-center justify-between border-t border-rose-100 mt-2">
                  <span>TRẢ LẠI ĐƠN</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== FOOTER ACTIONS ===================== */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNav?.('quy-trinh-xu-ly');
              }}
              className="px-4 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>Sơ đồ Quy trình</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 transition-all active:scale-95 ${
                selectedHuong === 'thu_ly'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  : selectedHuong === 'yeu_cau_bo_sung'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                  : selectedHuong === 'khong_thu_ly'
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                  : selectedHuong === 'ban_giao'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">
                {selectedHuong === 'thu_ly'
                  ? 'verified'
                  : selectedHuong === 'yeu_cau_bo_sung'
                  ? 'note_add'
                  : selectedHuong === 'khong_thu_ly'
                  ? 'block'
                  : selectedHuong === 'ban_giao'
                  ? 'swap_horiz'
                  : 'assignment_return'}
              </span>
              <span>
                {selectedHuong === 'thu_ly'
                  ? 'Xác nhận ➔ Lập Tờ trình đề xuất thụ lý'
                  : selectedHuong === 'yeu_cau_bo_sung'
                  ? 'Xác nhận ➔ Lập Thông báo bổ sung hồ sơ'
                  : selectedHuong === 'khong_thu_ly'
                  ? 'Xác nhận ➔ Ban hành Thông báo Không thụ lý'
                  : selectedHuong === 'ban_giao'
                  ? 'Xác nhận ➔ Bàn giao sang cơ quan khác'
                  : 'Xác nhận ➔ Lập văn bản Trả lại đơn'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL CON: SOẠN THẢO & XEM TRƯỚC VĂN BẢN XÁC MINH THEO THỂ THỨC HÀNH CHÍNH */}
      {/* ========================================================================= */}
      {showEditorModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-blue-400 text-[20px]">
                  {selectedVanBanType === 'giay_moi'
                    ? 'mail'
                    : selectedVanBanType === 'bien_ban'
                    ? 'edit_note'
                    : 'send'}
                </span>
                <div>
                  <h3 className="font-bold text-sm">
                    {editingVanBan ? 'Xem & Chỉnh sửa văn bản xác minh' : 'Tạo mới văn bản phục vụ xác minh'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedVanBanType === 'giay_moi'
                      ? 'Biểu mẫu Giấy mời làm việc chuẩn'
                      : selectedVanBanType === 'bien_ban'
                      ? 'Biểu mẫu Biên bản làm việc trực tiếp'
                      : 'Biểu mẫu Công văn đề nghị phối hợp cung cấp tài liệu'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Body Soạn thảo & Xem trước */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Form nhập thông số hành chính */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số ký hiệu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formSoKyHieu}
                    onChange={(e) => setFormSoKyHieu(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    placeholder="VD: 18/GM-TCD, 02/BB-XM..."
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên văn bản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTenVanBan}
                    onChange={(e) => setFormTenVanBan(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
                    placeholder="Tên văn bản..."
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Người nhận / Đối tượng làm việc
                  </label>
                  <input
                    type="text"
                    value={formNguoiNhan}
                    onChange={(e) => setFormNguoiNhan(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                    placeholder="Tên công dân hoặc cơ quan nhận..."
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Thời gian làm việc / Hạn phản hồi
                  </label>
                  <input
                    type="text"
                    value={formThoiGianHen}
                    onChange={(e) => setFormThoiGianHen(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                    placeholder="VD: 08:30 ngày 18/09/2026..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Địa điểm làm việc</label>
                  <input
                    type="text"
                    value={formDiaDiem}
                    onChange={(e) => setFormDiaDiem(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                    placeholder="Phòng Tiếp công dân, trụ sở cơ quan..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Trích yếu nội dung</label>
                  <input
                    type="text"
                    value={formTrichYeu}
                    onChange={(e) => setFormTrichYeu(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                    placeholder="Tóm tắt mục đích văn bản..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết văn bản</label>
                  <textarea
                    rows={4}
                    value={formNoiDung}
                    onChange={(e) => setFormNoiDung(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 leading-relaxed resize-none"
                    placeholder="Nội dung chi tiết của Giấy mời / Biên bản / Công văn..."
                  />
                </div>
              </div>

              {/* KHUNG XEM TRƯỚC VĂN BẢN THEO CHUẨN THỂ THỨC A4 */}
              <div className="p-6 bg-slate-100/80 rounded-xl border border-slate-300">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">preview</span>
                  <span>Xem trước văn bản in A4:</span>
                </div>

                <div className="bg-white p-6 shadow-sm border border-slate-200 text-slate-900 text-xs space-y-3 font-serif">
                  {/* Tiêu ngữ */}
                  <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                    <div>
                      <p className="font-bold uppercase">ỦY BAN NHÂN DÂN QUẬN CẦU GIẤY</p>
                      <p className="font-semibold underline">PHÒNG TIẾP CÔNG DÂN &amp; XỬ LÝ ĐƠN</p>
                      <p className="pt-1 font-mono text-[10.5px]">Số: {formSoKyHieu || '.../GM-TCD'}</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                      <p className="font-bold underline">Độc lập - Tự do - Hạnh phúc</p>
                      <p className="pt-1 italic font-sans text-[10.5px]">Hà Nội, ngày 16 tháng 09 năm 2026</p>
                    </div>
                  </div>

                  {/* Tên văn bản */}
                  <div className="text-center py-2">
                    <h4 className="text-sm font-bold uppercase tracking-wide">
                      {selectedVanBanType === 'giay_moi'
                        ? 'GIẤY MỜI LÀM VIỆC'
                        : selectedVanBanType === 'bien_ban'
                        ? 'BIÊN BẢN LÀM VIỆC'
                        : 'CÔNG VĂN ĐỀ NGHỊ PHỐI HỢP'}
                    </h4>
                    <p className="text-[11px] italic font-sans text-slate-600 mt-0.5">
                      ({formTrichYeu || 'V/v Xác minh làm rõ nội dung đơn'})
                    </p>
                  </div>

                  {/* Kính gửi */}
                  <div className="space-y-1 text-[11.5px] leading-relaxed">
                    <p>
                      <strong>Kính gửi: </strong>
                      <span>{formNguoiNhan || 'Ông/Bà...'}</span>
                    </p>
                    {formThoiGianHen && (
                      <p>
                        <strong>Thời gian: </strong>
                        <span>{formThoiGianHen}</span>
                      </p>
                    )}
                    {formDiaDiem && (
                      <p>
                        <strong>Địa điểm: </strong>
                        <span>{formDiaDiem}</span>
                      </p>
                    )}
                    <p className="pt-1">
                      <strong>Nội dung: </strong>
                      <span className="font-sans text-slate-800">{formNoiDung}</span>
                    </p>
                  </div>

                  {/* Chữ ký */}
                  <div className="pt-4 grid grid-cols-2 gap-4 text-center text-[11px]">
                    <div className="text-left text-[10px] text-slate-500 font-sans">
                      <p className="font-bold">Nơi nhận:</p>
                      <p>- Như trên;</p>
                      <p>- Lưu: Hồ sơ xác minh.</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase">CÁN BỘ THỤ LÝ XÁC MINH</p>
                      <div className="h-8 flex items-center justify-center italic text-blue-900 font-script text-sm">
                        NguyenMinhAnh
                      </div>
                      <p className="font-bold">Nguyễn Minh Anh</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer sub-modal */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Đang kết nối in văn bản...');
                    window.print();
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>In văn bản</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveVanBanForm}
                  className="px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da6] active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Lưu vào hồ sơ xác minh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
