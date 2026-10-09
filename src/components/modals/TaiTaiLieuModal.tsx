import React, { useState, useRef } from 'react';

export interface TaiTaiLieuSubmitData {
  tenTaiLieu: string;
  loaiTaiLieu: string;
  category: string;
  soKyHieu?: string;
  ngayBanHanh?: string;
  nguoiCungCap: string;
  trichYeu: string;
  fileName: string;
  fileSize: string;
  fileType: string;
}

interface TaiTaiLieuModalProps {
  isOpen: boolean;
  onClose: () => void;
  donInfo: {
    code: string;
    nguoiNop: string;
    loaiDon: string;
  };
  onSubmit: (data: TaiTaiLieuSubmitData) => void;
}

const LOAI_TAI_LIEU_OPTIONS = [
  { id: 'chung_cu', label: 'Chứng cứ, tài liệu người dân cung cấp', category: 'Chứng cứ ban đầu' },
  { id: 'don_goc', label: 'Bản chính / Đơn viết tay gốc', category: 'Hồ sơ đơn' },
  { id: 'giay_to_tuy_than', label: 'Bản sao CCCD / Giấy tờ nhân thân', category: 'Giấy tờ pháp lý' },
  { id: 'bien_ban', label: 'Biên bản làm việc / Xác minh', category: 'Văn bản xác minh' },
  { id: 'van_ban_co_quan', label: 'Văn bản trả lời của cơ quan chức năng', category: 'Văn bản nghiệp vụ' },
  { id: 'trich_luc_dia_chinh', label: 'Bản đồ / Trích lục địa chính thửa đất', category: 'Hồ sơ kỹ thuật' },
  { id: 'khac', label: 'Tài liệu, hồ sơ khác', category: 'Tài liệu khác' },
];

export default function TaiTaiLieuModal({
  isOpen,
  onClose,
  donInfo,
  onSubmit,
}: TaiTaiLieuModalProps) {
  const [tenTaiLieu, setTenTaiLieu] = useState<string>('');
  const [loaiTaiLieu, setLoaiTaiLieu] = useState<string>('chung_cu');
  const [soKyHieu, setSoKyHieu] = useState<string>('');
  const [ngayBanHanh, setNgayBanHanh] = useState<string>(new Date().toLocaleDateString('vi-VN'));
  const [nguoiCungCap, setNguoiCungCap] = useState<string>(donInfo.nguoiNop || 'Công dân nộp trực tiếp');
  const [trichYeu, setTrichYeu] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>({
    name: `Tai_lieu_dinh_kem_${donInfo.code}.pdf`,
    size: '2.4 MB',
    type: 'PDF',
  });
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      setSelectedFile({
        name: file.name,
        size: `${sizeMB} MB`,
        type: ext,
      });
      if (!tenTaiLieu.trim()) {
        const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        setTenTaiLieu(rawName);
      }
    }
  };

  const handleSelectPredefined = (name: string, type: string, size: string) => {
    setSelectedFile({ name, size, type });
    if (!tenTaiLieu.trim()) {
      setTenTaiLieu(name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenTaiLieu.trim()) {
      setError('Vui lòng nhập tên tài liệu / văn bản');
      return;
    }

    if (!selectedFile) {
      setError('Vui lòng chọn hoặc tải lên tệp tài liệu');
      return;
    }

    const selectedConfig = LOAI_TAI_LIEU_OPTIONS.find((o) => o.id === loaiTaiLieu);

    onSubmit({
      tenTaiLieu: tenTaiLieu.trim(),
      loaiTaiLieu,
      category: selectedConfig?.category || 'Tài liệu bổ sung',
      soKyHieu: soKyHieu.trim() || undefined,
      ngayBanHanh: ngayBanHanh.trim() || undefined,
      nguoiCungCap: nguoiCungCap.trim(),
      trichYeu: trichYeu.trim() || `Tài liệu đính kèm phục vụ giải quyết hồ sơ đơn ${donInfo.code}`,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-500/10 via-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <span className="material-symbols-outlined text-[24px]">upload_file</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                  HỒ SƠ & TÀI LIỆU
                </span>
                <span className="text-[11.5px] text-slate-500 font-mono">
                  Đơn: <strong className="text-slate-900 font-bold">{donInfo.code}</strong>
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 font-headline-md tracking-tight mt-0.5">
                Tải lên & Đính kèm tài liệu vào hồ sơ
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-rose-600">error</span>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Tên tài liệu */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-900">
                Tên tài liệu / Văn bản <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={tenTaiLieu}
                onChange={(e) => setTenTaiLieu(e.target.value)}
                placeholder="VD: Hợp đồng góp vốn có công chứng, Trích lục bản đồ địa chính..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Loại tài liệu & Nguồn gốc */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-900">
                  Phân loại tài liệu <span className="text-rose-500">*</span>
                </label>
                <select
                  value={loaiTaiLieu}
                  onChange={(e) => setLoaiTaiLieu(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {LOAI_TAI_LIEU_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-900">
                  Người / Đơn vị cung cấp
                </label>
                <input
                  type="text"
                  value={nguoiCungCap}
                  onChange={(e) => setNguoiCungCap(e.target.value)}
                  placeholder="VD: Nguyễn Văn A, UBND phường..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Số ký hiệu & Ngày văn bản */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-900">
                  Số ký hiệu văn bản (nếu có)
                </label>
                <input
                  type="text"
                  value={soKyHieu}
                  onChange={(e) => setSoKyHieu(e.target.value)}
                  placeholder="VD: 15/HĐ-GV hoặc 82/UBND-TNMT"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-900">
                  Ngày lập / Ngày ban hành
                </label>
                <input
                  type="text"
                  value={ngayBanHanh}
                  onChange={(e) => setNgayBanHanh(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Tệp đính kèm Dropzone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900">
                Tệp đính kèm (PDF, DOCX, JPG, PNG) <span className="text-rose-500">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 rounded-2xl p-5 text-center cursor-pointer transition-all"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Nhấp để tải tệp lên từ thiết bị hoặc kéo thả tệp vào đây
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hỗ trợ tệp PDF, Word, Excel, Hình ảnh (Tối đa 50MB/tệp)
                </p>
              </div>

              {/* Tệp đang được chọn */}
              {selectedFile && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs uppercase">
                      {selectedFile.type}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 text-xs block">
                        {selectedFile.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {selectedFile.size} • Sẵn sàng đính kèm
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer"
                    title="Xóa tệp"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              )}

              {/* Gợi ý chọn tệp mẫu nhanh */}
              <div className="pt-1">
                <span className="text-[11px] text-slate-400 block mb-1">
                  Hoặc chọn nhanh tệp mẫu mô phỏng:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectPredefined('Hop_dong_chuyen_nhuong_dat_goc.pdf', 'PDF', '3.8 MB')
                    }
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] text-slate-700 cursor-pointer"
                  >
                    + Hop_dong_chuyen_nhuong.pdf (3.8MB)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectPredefined('Trich_luc_thua_dat_so_45.pdf', 'PDF', '1.6 MB')
                    }
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] text-slate-700 cursor-pointer"
                  >
                    + Trich_luc_thua_dat.pdf (1.6MB)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectPredefined('Hinh_anh_hien_trang_xay_dung.jpg', 'JPG', '4.2 MB')
                    }
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] text-slate-700 cursor-pointer"
                  >
                    + Hinh_anh_hien_trang.jpg (4.2MB)
                  </button>
                </div>
              </div>
            </div>

            {/* Trích yếu / Ghi chú */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-900">
                Trích yếu nội dung tài liệu / Ghi chú
              </label>
              <textarea
                rows={2}
                value={trichYeu}
                onChange={(e) => setTrichYeu(e.target.value)}
                placeholder="Ghi chú nội dung chính của tài liệu, chứng cứ kèm theo..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Đính kèm vào hồ sơ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
