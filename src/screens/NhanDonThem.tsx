import React, { useState } from 'react';
import { Screen, UploadedFile, LuotNhan } from '../types';

interface NhanDonThemProps {
  onNav: (s: Screen) => void;
  onSubmit?: (newRecord?: LuotNhan) => void;
}

type NguoiNopType = 'khong-ro' | 'ca-nhan' | 'to-chuc';
type TuCachCaNhan = 'nguoi-dung-don' | 'nguoi-dai-dien' | 'nguoi-duoc-uy-quyen';
type TuCachToChuc = 'dai-dien-phap-luat' | 'nguoi-duoc-uy-quyen';

export default function NhanDonThem({ onNav, onSubmit }: NhanDonThemProps) {
  // ─── 1. THÔNG TIN TIẾP NHẬN STATE ─────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0];
  const [ngayNhan, setNgayNhan] = useState(todayStr);
  const [ngayLamDon, setNgayLamDon] = useState('');
  const [hinhThucNhan, setHinhThucNhan] = useState('Trực tiếp');
  const [canBoNhan, setCanBoNhan] = useState('Nguyễn Thị Hải Yến');
  const [donViNhan, setDonViNhan] = useState('Phòng Hành chính - Tổng hợp');

  // ─── 2. LOẠI NGƯỜI NỘP ĐƠN STATE ──────────────────────────────
  const [loaiNguoiNop, setLoaiNguoiNop] = useState<NguoiNopType>('ca-nhan');

  // ─── 3. THÔNG TIN CÁ NHÂN ──────────────────────────────────────
  const [cnHoTen, setCnHoTen] = useState('');
  const [cnCccd, setCnCccd] = useState('');
  const [cnNgaySinh, setCnNgaySinh] = useState('');
  const [cnSdt, setCnSdt] = useState('');
  const [cnEmail, setCnEmail] = useState('');
  const [cnTinhThanh, setCnTinhThanh] = useState('Thành phố Hà Nội');
  const [cnPhuongXa, setCnPhuongXa] = useState('');
  const [cnDiaChiChiTiet, setCnDiaChiChiTiet] = useState('');
  const [cnTuCach, setCnTuCach] = useState<TuCachCaNhan>('nguoi-dung-don');

  // Người được ủy quyền (Cá nhân)
  const [cnUqHoTen, setCnUqHoTen] = useState('');
  const [cnUqCccd, setCnUqCccd] = useState('');
  const [cnUqSdt, setCnUqSdt] = useState('');
  const [cnUqDiaChi, setCnUqDiaChi] = useState('');
  const [cnUqVanBan, setCnUqVanBan] = useState<File | null>(null);

  // ─── 4. THÔNG TIN TỔ CHỨC ──────────────────────────────────────
  const [tcTen, setTcTen] = useState('');
  const [tcMst, setTcMst] = useState('');
  const [tcTenVietTat, setTcTenVietTat] = useState('');
  const [tcLoaiHinh, setTcLoaiHinh] = useState('Công ty TNHH');
  const [tcSdt, setTcSdt] = useState('');
  const [tcEmail, setTcEmail] = useState('');
  const [tcTinhThanh, setTcTinhThanh] = useState('Thành phố Hà Nội');
  const [tcPhuongXa, setTcPhuongXa] = useState('');
  const [tcDiaChiChiTiet, setTcDiaChiChiTiet] = useState('');

  // Người đại diện (Tổ chức)
  const [tcDdHoTen, setTcDdHoTen] = useState('');
  const [tcDdChucVu, setTcDdChucVu] = useState('Giám đốc');
  const [tcDdCccd, setTcDdCccd] = useState('');
  const [tcDdSdt, setTcDdSdt] = useState('');
  const [tcDdEmail, setTcDdEmail] = useState('');
  const [tcTuCach, setTcTuCach] = useState<TuCachToChuc>('dai-dien-phap-luat');

  // Người được ủy quyền (Tổ chức)
  const [tcUqHoTen, setTcUqHoTen] = useState('');
  const [tcUqCccd, setTcUqCccd] = useState('');
  const [tcUqSdt, setTcUqSdt] = useState('');
  const [tcUqChucVu, setTcUqChucVu] = useState('');
  const [tcUqVanBan, setTcUqVanBan] = useState<File | null>(null);

  // ─── 5. GHI CHÚ ────────────────────────────────────────────────
  const [ghiChu, setGhiChu] = useState('');

  // ─── 6. TÀI LIỆU KÈM THEO ──────────────────────────────────────
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // ─── 7. VALIDATION & FEEDBACK ─────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  // Quét nhanh thẻ CCCD gắn chip (Simulation)
  const handleScanCccd = () => {
    setCnHoTen('Trần Đức Minh');
    setCnCccd('001092015882');
    setCnNgaySinh('1986-04-12');
    setCnSdt('0912 345 678');
    setCnPhuongXa('Phường Kim Mã, Quận Ba Đình');
    setCnDiaChiChiTiet('Số 42 ngõ 82 phố Kim Mã');
    showToast('Đã quét thông tin thẻ CCCD gắn chip thành công!');
  };

  // Quét tài liệu từ máy scan
  const handleScanDocument = () => {
    const newDoc: UploadedFile = {
      name: `Scan_Don_tiep_nhan_${Date.now().toString().slice(-4)}.pdf`,
      size: '2.4 MB',
      category: 'main',
    };
    setFiles((prev) => [...prev, newDoc]);
    showToast('Đã quét tài liệu thành công từ máy scan!');
  };

  // Thêm tệp tải lên
  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const added: UploadedFile[] = Array.from(fileList).map((f) => {
      const kb = f.size / 1024;
      const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
      return {
        name: f.name,
        size: sizeStr,
        category: files.length === 0 ? 'main' : 'attach',
      };
    });
    setFiles((prev) => [...prev, ...added]);
    showToast(`Đã thêm ${added.length} tệp tài liệu.`);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── 8. VALIDATE & SUBMIT ──────────────────────────────────────
  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    // Validate Thông tin tiếp nhận
    if (!ngayNhan) {
      newErrors.ngayNhan = 'Vui lòng chọn ngày nhận hồ sơ';
    }
    if (ngayLamDon && ngayNhan && ngayLamDon > ngayNhan) {
      newErrors.ngayLamDon = 'Ngày làm đơn không được lớn hơn Ngày nhận';
    }
    if (!hinhThucNhan) {
      newErrors.hinhThucNhan = 'Vui lòng chọn hình thức nhận';
    }
    if (!canBoNhan.trim()) {
      newErrors.canBoNhan = 'Vui lòng nhập tên cán bộ nhận';
    }
    if (!donViNhan.trim()) {
      newErrors.donViNhan = 'Vui lòng chọn/nhập đơn vị tiếp nhận';
    }

    // Validate theo loại người nộp
    if (loaiNguoiNop === 'ca-nhan') {
      if (!cnHoTen.trim()) {
        newErrors.cnHoTen = 'Họ và tên cá nhân là bắt buộc';
      }
      if (cnTuCach === 'nguoi-duoc-uy-quyen') {
        if (!cnUqHoTen.trim()) {
          newErrors.cnUqHoTen = 'Họ và tên người được ủy quyền là bắt buộc';
        }
        if (!cnUqVanBan && files.every((f) => !f.name.toLowerCase().includes('uy_quyen'))) {
          newErrors.cnUqVanBan = 'Bắt buộc tải lên giấy ủy quyền/công văn ủy quyền hợp lệ';
        }
      }
    } else if (loaiNguoiNop === 'to-chuc') {
      if (!tcTen.trim()) {
        newErrors.tcTen = 'Tên tổ chức / doanh nghiệp là bắt buộc';
      }
      if (!tcDdHoTen.trim()) {
        newErrors.tcDdHoTen = 'Họ và tên người đại diện là bắt buộc';
      }
      if (tcTuCach === 'nguoi-duoc-uy-quyen') {
        if (!tcUqHoTen.trim()) {
          newErrors.tcUqHoTen = 'Họ và tên người được ủy quyền cho tổ chức là bắt buộc';
        }
        if (!tcUqVanBan && files.every((f) => !f.name.toLowerCase().includes('uy_quyen'))) {
          newErrors.tcUqVanBan = 'Bắt buộc tải lên giấy ủy quyền/công văn ủy quyền từ tổ chức';
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Vui lòng kiểm tra lại các trường thông tin bắt buộc còn thiếu hoặc không hợp lệ.');
      return;
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `LN-2026-${randomCode}_HC`;

    let submitterName = 'Chưa xác định (Không rõ)';
    if (loaiNguoiNop === 'ca-nhan') {
      submitterName = cnHoTen.trim();
    } else if (loaiNguoiNop === 'to-chuc') {
      submitterName = tcTen.trim();
    }

    const newRecord: LuotNhan = {
      id: generatedId,
      ngayNhan: ngayNhan.split('-').reverse().join('/'),
      nguoiNop: submitterName,
      hinhThuc: hinhThucNhan,
      noiDung: ghiChu.trim() || 'Đơn tiếp nhận mới vào hàng đợi (Chờ tiếp nhận)',
      donVi: donViNhan,
      aiJob: 0, // Trạng thái ban đầu: "Chờ tiếp nhận"
    };

    showToast(`Đã lưu thành công đơn tiếp nhận ${generatedId}!`);

    setTimeout(() => {
      if (onSubmit) {
        onSubmit(newRecord);
      } else {
        onNav('cong-viec');
      }
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden w-full">
      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-bounce text-xs font-medium">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ─── 1. FULL WIDTH HEADER BAR ─────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex flex-col min-w-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11.5px] text-slate-400 font-label-technical mb-1">
            <button
              type="button"
              onClick={() => onNav('cong-viec')}
              className="hover:text-blue-700 cursor-pointer"
            >
              Trang chủ
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => onNav('nhan-don-list')}
              className="hover:text-blue-700 cursor-pointer"
            >
              Nhận đơn
            </button>
            <span>/</span>
            <span className="text-slate-700 font-semibold">Thêm mới đơn tiếp nhận</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNav('nhan-don-list')}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Quay lại"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[18px] font-bold text-slate-900 font-headline-md tracking-tight">
                Thêm mới đơn tiếp nhận
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#004ac6] border border-blue-200 text-[11px] font-semibold font-label-technical">
                Chờ tiếp nhận
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNav('nhan-don-list')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[13px] transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white font-semibold text-[13px] shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Lưu đơn tiếp nhận</span>
          </button>
        </div>
      </div>

      {/* ─── FULL WIDTH SCROLLABLE BODY ───────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-8 w-full">
        {/* ─── SECTION 1: THÔNG TIN TIẾP NHẬN ─────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h2 className="text-[15px] font-bold text-slate-900 uppercase font-label-technical tracking-wide">
                Thông tin tiếp nhận
              </h2>
            </div>
            <span className="text-[12px] text-slate-400">
              Các trường có dấu (<span className="text-red-500">*</span>) là bắt buộc
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ngày nhận * */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Ngày nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={ngayNhan}
                onChange={(e) => {
                  setNgayNhan(e.target.value);
                  if (errors.ngayNhan) setErrors((prev) => ({ ...prev, ngayNhan: '' }));
                }}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                  errors.ngayNhan ? 'border-red-500' : 'border-slate-200'
                }`}
              />
              {errors.ngayNhan && (
                <p className="text-[11px] text-red-500 mt-1">{errors.ngayNhan}</p>
              )}
            </div>

            {/* Ngày làm đơn */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-semibold text-slate-700">
                  Ngày làm đơn
                </label>
                <span className="text-[10.5px] text-slate-400 italic">Không bắt buộc</span>
              </div>
              <input
                type="date"
                value={ngayLamDon}
                onChange={(e) => {
                  setNgayLamDon(e.target.value);
                  if (errors.ngayLamDon) setErrors((prev) => ({ ...prev, ngayLamDon: '' }));
                }}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                  errors.ngayLamDon ? 'border-red-500' : 'border-slate-200'
                }`}
              />
              {errors.ngayLamDon && (
                <p className="text-[11px] text-red-500 mt-1">{errors.ngayLamDon}</p>
              )}
            </div>

            {/* Hình thức nhận * */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Hình thức nhận <span className="text-red-500">*</span>
              </label>
              <select
                value={hinhThucNhan}
                onChange={(e) => setHinhThucNhan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                <option value="Trực tiếp">Trực tiếp</option>
                <option value="Bưu điện">Bưu điện</option>
                <option value="Trực tuyến">Trực tuyến (Cổng DVC)</option>
                <option value="Chuyển phát">Chuyển phát cơ quan khác</option>
              </select>
            </div>

            {/* Cán bộ nhận * */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Cán bộ nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={canBoNhan}
                onChange={(e) => setCanBoNhan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="Tên cán bộ tiếp nhận"
              />
            </div>

            {/* Đơn vị nhận * */}
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Đơn vị nhận <span className="text-red-500">*</span>
              </label>
              <select
                value={donViNhan}
                onChange={(e) => setDonViNhan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                <option value="Phòng Hành chính - Tổng hợp">Phòng Hành chính - Tổng hợp</option>
                <option value="Ban Tiếp công dân tỉnh">Ban Tiếp công dân tỉnh</option>
                <option value="Thanh tra tỉnh">Thanh tra tỉnh</option>
                <option value="Sở Tài nguyên và Môi trường">Sở Tài nguyên và Môi trường</option>
                <option value="Sở Xây dựng">Sở Xây dựng</option>
              </select>
            </div>
          </div>
        </section>

        {/* ─── SECTION 2: LOẠI NGƯỜI NỘP ĐƠN ───────────────────── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h2 className="text-[15px] font-bold text-slate-900 uppercase font-label-technical tracking-wide">
                Loại người nộp đơn &amp; Thông tin chủ thể
              </h2>
            </div>
          </div>

          {/* Full-width Segmented Bar */}
          <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setLoaiNguoiNop('khong-ro')}
              className={`p-3 rounded-xl flex items-center justify-center gap-2 text-[13.5px] font-semibold transition-all cursor-pointer ${
                loaiNguoiNop === 'khong-ro'
                  ? 'bg-white text-amber-800 shadow-sm border border-amber-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-amber-600">help</span>
              <span>Không rõ</span>
            </button>

            <button
              type="button"
              onClick={() => setLoaiNguoiNop('ca-nhan')}
              className={`p-3 rounded-xl flex items-center justify-center gap-2 text-[13.5px] font-semibold transition-all cursor-pointer ${
                loaiNguoiNop === 'ca-nhan'
                  ? 'bg-white text-[#004ac6] shadow-sm border border-blue-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-blue-600">person</span>
              <span>Cá nhân</span>
            </button>

            <button
              type="button"
              onClick={() => setLoaiNguoiNop('to-chuc')}
              className={`p-3 rounded-xl flex items-center justify-center gap-2 text-[13.5px] font-semibold transition-all cursor-pointer ${
                loaiNguoiNop === 'to-chuc'
                  ? 'bg-white text-purple-800 shadow-sm border border-purple-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-purple-600">apartment</span>
              <span>Tổ chức</span>
            </button>
          </div>

          {/* ─── TRƯỜNG HỢP: CÁ NHÂN ─── */}
          {loaiNguoiNop === 'ca-nhan' && (
            <div className="space-y-6 pt-1">
              {/* Thông tin cá nhân */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-bold text-slate-800 uppercase font-label-technical">
                    Thông tin cá nhân
                  </h3>
                  <button
                    type="button"
                    onClick={handleScanCccd}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">nfc</span>
                    <span>Quét CCCD gắn chip</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cnHoTen}
                      onChange={(e) => {
                        setCnHoTen(e.target.value);
                        if (errors.cnHoTen) setErrors((prev) => ({ ...prev, cnHoTen: '' }));
                      }}
                      placeholder="VD: Nguyễn Văn An"
                      className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                        errors.cnHoTen ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {errors.cnHoTen && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.cnHoTen}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Số định danh cá nhân / CCCD
                    </label>
                    <input
                      type="text"
                      value={cnCccd}
                      onChange={(e) => setCnCccd(e.target.value)}
                      placeholder="12 chữ số"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={cnNgaySinh}
                      onChange={(e) => setCnNgaySinh(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={cnSdt}
                      onChange={(e) => setCnSdt(e.target.value)}
                      placeholder="09xx xxx xxx"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={cnEmail}
                      onChange={(e) => setCnEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Tỉnh / Thành phố
                    </label>
                    <input
                      type="text"
                      value={cnTinhThanh}
                      onChange={(e) => setCnTinhThanh(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Phường / Xã
                    </label>
                    <input
                      type="text"
                      value={cnPhuongXa}
                      onChange={(e) => setCnPhuongXa(e.target.value)}
                      placeholder="Phường/Xã/Thị trấn"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Địa chỉ chi tiết
                    </label>
                    <input
                      type="text"
                      value={cnDiaChiChiTiet}
                      onChange={(e) => setCnDiaChiChiTiet(e.target.value)}
                      placeholder="Số nhà, đường phố, ngõ ngách..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Tư cách nộp đơn */}
              <div className="space-y-3 pt-2">
                <h3 className="text-[13px] font-bold text-slate-800 uppercase font-label-technical">
                  Tư cách nộp đơn
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setCnTuCach('nguoi-dung-don')}
                    className={`py-2.5 px-4 rounded-xl border text-[13px] font-semibold transition-all cursor-pointer ${
                      cnTuCach === 'nguoi-dung-don'
                        ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Người đứng đơn
                  </button>
                  <button
                    type="button"
                    onClick={() => setCnTuCach('nguoi-dai-dien')}
                    className={`py-2.5 px-4 rounded-xl border text-[13px] font-semibold transition-all cursor-pointer ${
                      cnTuCach === 'nguoi-dai-dien'
                        ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Người đại diện
                  </button>
                  <button
                    type="button"
                    onClick={() => setCnTuCach('nguoi-duoc-uy-quyen')}
                    className={`py-2.5 px-4 rounded-xl border text-[13px] font-semibold transition-all cursor-pointer ${
                      cnTuCach === 'nguoi-duoc-uy-quyen'
                        ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Người được ủy quyền
                  </button>
                </div>

                {/* Nếu chọn Người được ủy quyền */}
                {cnTuCach === 'nguoi-duoc-uy-quyen' && (
                  <div className="mt-3 p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <span className="material-symbols-outlined text-[18px]">badge</span>
                      <span>Thông tin người được ủy quyền &amp; Giấy ủy quyền (Bắt buộc)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          Họ và tên người được ủy quyền <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cnUqHoTen}
                          onChange={(e) => setCnUqHoTen(e.target.value)}
                          placeholder="Họ tên người nhận ủy quyền"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                        {errors.cnUqHoTen && (
                          <p className="text-[11px] text-red-500 mt-1">{errors.cnUqHoTen}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          CCCD / Số định danh
                        </label>
                        <input
                          type="text"
                          value={cnUqCccd}
                          onChange={(e) => setCnUqCccd(e.target.value)}
                          placeholder="12 chữ số"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-label-technical"
                        />
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          value={cnUqSdt}
                          onChange={(e) => setCnUqSdt(e.target.value)}
                          placeholder="09xx xxx xxx"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          Địa chỉ người được ủy quyền
                        </label>
                        <input
                          type="text"
                          value={cnUqDiaChi}
                          onChange={(e) => setCnUqDiaChi(e.target.value)}
                          placeholder="Địa chỉ cư trú người được ủy quyền"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          Tải lên Giấy ủy quyền / Công văn ủy quyền <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-amber-300 rounded-xl p-3.5 text-center bg-white">
                          <input
                            type="file"
                            id="file-cn-uq-full"
                            className="hidden"
                            accept=".pdf,.docx,.doc,.jpg,.png"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setCnUqVanBan(e.target.files[0]);
                                setFiles((prev) => [
                                  ...prev,
                                  {
                                    name: `Giay_uy_quyen_${e.target.files![0].name}`,
                                    size: '1.5 MB',
                                    category: 'attach',
                                  },
                                ]);
                                if (errors.cnUqVanBan) setErrors((prev) => ({ ...prev, cnUqVanBan: '' }));
                              }
                            }}
                          />
                          <label
                            htmlFor="file-cn-uq-full"
                            className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-blue-700 hover:underline font-medium"
                          >
                            <span className="material-symbols-outlined text-[18px]">upload_file</span>
                            <span>{cnUqVanBan ? cnUqVanBan.name : 'Chọn tệp Giấy ủy quyền hợp lệ (PDF / Ảnh)'}</span>
                          </label>
                          {errors.cnUqVanBan && (
                            <p className="text-[11px] text-red-500 mt-1">{errors.cnUqVanBan}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── TRƯỜNG HỢP: TỔ CHỨC ─── */}
          {loaiNguoiNop === 'to-chuc' && (
            <div className="space-y-6 pt-1">
              {/* Thông tin tổ chức */}
              <div className="space-y-3.5">
                <h3 className="text-[13px] font-bold text-slate-800 uppercase font-label-technical">
                  Thông tin tổ chức
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Tên tổ chức <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tcTen}
                      onChange={(e) => {
                        setTcTen(e.target.value);
                        if (errors.tcTen) setErrors((prev) => ({ ...prev, tcTen: '' }));
                      }}
                      placeholder="Tên đầy đủ theo ĐKKD hoặc QĐ thành lập"
                      className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                        errors.tcTen ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {errors.tcTen && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.tcTen}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Mã số thuế / Mã định danh
                    </label>
                    <input
                      type="text"
                      value={tcMst}
                      onChange={(e) => setTcMst(e.target.value)}
                      placeholder="MST / Số ĐKKD"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Tên viết tắt
                    </label>
                    <input
                      type="text"
                      value={tcTenVietTat}
                      onChange={(e) => setTcTenVietTat(e.target.value)}
                      placeholder="VD: VINACONEX, EVN..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Loại hình tổ chức
                    </label>
                    <select
                      value={tcLoaiHinh}
                      onChange={(e) => setTcLoaiHinh(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                    >
                      <option value="Công ty TNHH">Công ty TNHH</option>
                      <option value="Công ty Cổ phần">Công ty Cổ phần</option>
                      <option value="Doanh nghiệp tư nhân">Doanh nghiệp tư nhân</option>
                      <option value="Cơ quan nhà nước / Đơn vị sự nghiệp">Cơ quan nhà nước / Đơn vị sự nghiệp</option>
                      <option value="Hợp tác xã">Hợp tác xã</option>
                      <option value="Tổ chức xã hội">Tổ chức xã hội</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Số điện thoại tổ chức
                    </label>
                    <input
                      type="text"
                      value={tcSdt}
                      onChange={(e) => setTcSdt(e.target.value)}
                      placeholder="Số hotline / Fax"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Email tổ chức
                    </label>
                    <input
                      type="email"
                      value={tcEmail}
                      onChange={(e) => setTcEmail(e.target.value)}
                      placeholder="contact@company.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Tỉnh / Thành phố
                    </label>
                    <input
                      type="text"
                      value={tcTinhThanh}
                      onChange={(e) => setTcTinhThanh(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Phường / Xã
                    </label>
                    <input
                      type="text"
                      value={tcPhuongXa}
                      onChange={(e) => setTcPhuongXa(e.target.value)}
                      placeholder="Phường/Xã trụ sở"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Địa chỉ trụ sở chi tiết
                    </label>
                    <input
                      type="text"
                      value={tcDiaChiChiTiet}
                      onChange={(e) => setTcDiaChiChiTiet(e.target.value)}
                      placeholder="Địa chỉ trụ sở chính"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Người đại diện */}
              <div className="space-y-3.5 pt-2">
                <h3 className="text-[13px] font-bold text-slate-800 uppercase font-label-technical">
                  Người đại diện tổ chức
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Họ và tên người đại diện <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tcDdHoTen}
                      onChange={(e) => {
                        setTcDdHoTen(e.target.value);
                        if (errors.tcDdHoTen) setErrors((prev) => ({ ...prev, tcDdHoTen: '' }));
                      }}
                      placeholder="Họ tên người đại diện theo pháp luật"
                      className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                        errors.tcDdHoTen ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {errors.tcDdHoTen && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.tcDdHoTen}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Chức vụ
                    </label>
                    <input
                      type="text"
                      value={tcDdChucVu}
                      onChange={(e) => setTcDdChucVu(e.target.value)}
                      placeholder="Giám đốc / Tổng Giám đốc..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      CCCD / Số định danh
                    </label>
                    <input
                      type="text"
                      value={tcDdCccd}
                      onChange={(e) => setTcDdCccd(e.target.value)}
                      placeholder="12 chữ số"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={tcDdSdt}
                      onChange={(e) => setTcDdSdt(e.target.value)}
                      placeholder="09xx xxx xxx"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={tcDdEmail}
                      onChange={(e) => setTcDdEmail(e.target.value)}
                      placeholder="email@company.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Tư cách nộp đơn & Ủy quyền */}
              <div className="space-y-3 pt-2">
                <div>
                  <h3 className="text-[13px] font-bold text-slate-800 uppercase font-label-technical">
                    Tư cách nộp đơn &amp; Ủy quyền
                  </h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Xác định tư cách của người thực hiện nộp hồ sơ cho tổ chức
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setTcTuCach('dai-dien-phap-luat')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      tcTuCach === 'dai-dien-phap-luat'
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-200 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        checked={tcTuCach === 'dai-dien-phap-luat'}
                        onChange={() => setTcTuCach('dai-dien-phap-luat')}
                        className="text-blue-600"
                      />
                      <span className="font-bold text-slate-900 text-[13px]">
                        Người đại diện theo pháp luật
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 mt-1 pl-6">
                      Chính người đại diện đứng tên và nộp đơn
                    </p>
                  </div>

                  <div
                    onClick={() => setTcTuCach('nguoi-duoc-uy-quyen')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      tcTuCach === 'nguoi-duoc-uy-quyen'
                        ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-200 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        checked={tcTuCach === 'nguoi-duoc-uy-quyen'}
                        onChange={() => setTcTuCach('nguoi-duoc-uy-quyen')}
                        className="text-amber-600"
                      />
                      <span className="font-bold text-slate-900 text-[13px]">
                        Người được ủy quyền
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 mt-1 pl-6">
                      Có giấy ủy quyền/công văn ủy quyền hợp lệ từ tổ chức
                    </p>
                  </div>
                </div>

                {/* Khi chọn Người được ủy quyền của Tổ chức */}
                {tcTuCach === 'nguoi-duoc-uy-quyen' && (
                  <div className="mt-3 p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                      <span>Thông tin người nhận ủy quyền &amp; Giấy ủy quyền từ tổ chức (Bắt buộc)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      <div>
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          Họ và tên người được ủy quyền <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={tcUqHoTen}
                          onChange={(e) => setTcUqHoTen(e.target.value)}
                          placeholder="Họ tên người đến nộp thay"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                        {errors.tcUqHoTen && (
                          <p className="text-[11px] text-red-500 mt-1">{errors.tcUqHoTen}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          Chức vụ trong tổ chức
                        </label>
                        <input
                          type="text"
                          value={tcUqChucVu}
                          onChange={(e) => setTcUqChucVu(e.target.value)}
                          placeholder="Chuyên viên pháp lý..."
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          CCCD người được ủy quyền
                        </label>
                        <input
                          type="text"
                          value={tcUqCccd}
                          onChange={(e) => setTcUqCccd(e.target.value)}
                          placeholder="12 chữ số"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-label-technical"
                        />
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          Số điện thoại liên hệ
                        </label>
                        <input
                          type="text"
                          value={tcUqSdt}
                          onChange={(e) => setTcUqSdt(e.target.value)}
                          placeholder="09xx xxx xxx"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          Khu vực tải Giấy ủy quyền / Công văn ủy quyền <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-amber-300 rounded-xl p-3.5 text-center bg-white">
                          <input
                            type="file"
                            id="file-tc-uq-full"
                            className="hidden"
                            accept=".pdf,.docx,.doc,.jpg,.png"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setTcUqVanBan(e.target.files[0]);
                                setFiles((prev) => [
                                  ...prev,
                                  {
                                    name: `Cong_van_uy_quyen_${e.target.files![0].name}`,
                                    size: '1.8 MB',
                                    category: 'attach',
                                  },
                                ]);
                                if (errors.tcUqVanBan) setErrors((prev) => ({ ...prev, tcUqVanBan: '' }));
                              }
                            }}
                          />
                          <label
                            htmlFor="file-tc-uq-full"
                            className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-blue-700 hover:underline font-medium"
                          >
                            <span className="material-symbols-outlined text-[18px]">upload_file</span>
                            <span>
                              {tcUqVanBan ? tcUqVanBan.name : 'Chọn Giấy ủy quyền / Công văn có dấu đỏ'}
                            </span>
                          </label>
                          {errors.tcUqVanBan && (
                            <p className="text-[11px] text-red-500 mt-1">{errors.tcUqVanBan}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── TRƯỜNG HỢP: KHÔNG RÕ ─── */}
          {loaiNguoiNop === 'khong-ro' && (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-[13px]">
                <span className="material-symbols-outlined text-[20px] text-amber-600">info</span>
                <span>Chế độ: Chưa xác định thông tin người nộp</span>
              </div>
              <p className="text-[12.5px] text-amber-900/90 leading-relaxed">
                Cho phép cán bộ tạo lượt/đơn tiếp nhận mà chưa xác định được thông tin người nộp (đơn gửi nặc danh, đơn thư qua bưu điện chưa đủ thông tin nhân thân).
                <br />
                <strong>Không bắt buộc</strong> nhập thông tin cá nhân hoặc tổ chức. Cán bộ có thể ghi nhận thông tin bổ sung tại ô <em>“Ghi chú”</em> bên dưới.
              </p>
            </div>
          )}
        </section>

        {/* ─── SECTION 3: GHI CHÚ ───────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h2 className="text-[15px] font-bold text-slate-900 uppercase font-label-technical tracking-wide">
                Ghi chú nghiệp vụ
              </h2>
            </div>
          </div>

          <textarea
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            rows={3}
            placeholder="Nhập các ghi chú ban đầu chưa chuẩn hóa (ví dụ: công dân hẹn bổ sung sổ hộ khẩu vào thứ 2, đơn kèm 2 tập hồ sơ gốc, hoặc trích yếu nội dung sơ bộ...)"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none transition-all"
          />
        </section>

        {/* ─── SECTION 4: TÀI LIỆU KÈM THEO ──────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold text-slate-900 uppercase font-label-technical tracking-wide">
                  Tài liệu kèm theo
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] font-label-technical">
                  {files.length} tài liệu
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleScanDocument}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-600">scanner</span>
              <span>Quét tài liệu từ máy scan</span>
            </button>
          </div>

          {/* Full-width Upload Dropzone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleAddFiles(e.dataTransfer.files);
            }}
          >
            <input
              type="file"
              id="file-upload-full"
              className="hidden"
              multiple
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.tiff"
              onChange={(e) => handleAddFiles(e.target.files)}
            />
            <label htmlFor="file-upload-full" className="cursor-pointer block">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#004ac6] mx-auto mb-2 flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[28px]">upload_file</span>
              </div>
              <div className="text-[13.5px] font-semibold text-slate-800 mb-0.5">
                Nhấn để chọn tệp hoặc kéo thả tài liệu vào đây
              </div>
              <p className="text-[11.5px] text-slate-400">
                Hỗ trợ tệp PDF, DOCX, JPG, PNG (Tối đa 25MB)
              </p>
            </label>
          </div>

          {/* Danh sách tệp đã đính kèm */}
          {files.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <p className="text-[12.5px] font-medium text-slate-700">Chưa có tài liệu đính kèm</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tải tệp lên hoặc quét tài liệu ngay.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-[22px] text-red-600 shrink-0">
                      description
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-medium text-slate-800 truncate">
                        {file.name}
                      </p>
                      <span className="text-[10.5px] text-slate-400 font-label-technical">
                        {file.size} • {file.category === 'main' ? 'Tài liệu chính' : 'Tài liệu kèm theo'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Xóa tệp"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ─── STICKY FOOTER ACTION ─────────────────────────────── */}
      <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="text-[12px] text-slate-500">
          Trạng thái ban đầu sau khi lưu: <strong className="text-blue-700 font-medium font-label-technical">Chờ tiếp nhận</strong>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNav('nhan-don-list')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[13px] transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white font-semibold text-[13px] shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Lưu</span>
          </button>
        </div>
      </div>
    </div>
  );
}