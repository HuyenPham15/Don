import React, { useState } from 'react';

export interface GhepDonSubmitData {
  targetDonCode: string;
  targetDonTitle: string;
  targetNguoiNop: string;
  soQuyetDinhGhep: string;
  ngayGhep: string;
  canCuGhep: string[];
  ghiChuGhep: string;
  chuyenToanBoFile: boolean;
}

interface GhepDonModalProps {
  isOpen: boolean;
  onClose: () => void;
  donInfo: {
    code: string;
    luotNhanId?: string;
    nguoiNop: string;
    loaiDon: string;
    noiDung: string;
    ngayNhan?: string;
  };
  onSubmit: (data: GhepDonSubmitData) => void;
}

interface TargetDonItem {
  code: string;
  nguoiNop: string;
  loaiDon: string;
  tieuDe: string;
  ngayNhan: string;
  canBoXuLy: string;
  trangThai: string;
  lyDoGoiY: string;
}

const GOI_Y_DON_DICH: TargetDonItem[] = [
  {
    code: 'Đ-2026-00098',
    nguoiNop: 'Trần Thị Mai (Đại diện 12 hộ góp vốn)',
    loaiDon: 'Đơn tố cáo / tố giác',
    tieuDe: 'Tố giác Công ty CP X có hành vi huy động vốn trái luật và chiếm giữ tiền tại Dự án KĐT Y',
    ngayNhan: '08/09/2026',
    canBoXuLy: 'ĐTV. Lê Tuấn Anh (PC03)',
    trangThai: 'Đang thụ lý xác minh',
    lyDoGoiY: 'Cùng đối tượng và địa bàn dự án (Độ trùng khớp 94%)',
  },
  {
    code: 'Đ-2026-00042',
    nguoiNop: 'Phạm Văn Thành',
    loaiDon: 'Đơn khiếu nại đất đai',
    tieuDe: 'Khiếu nại phương án bồi thường đất nông nghiệp Dự án nâng cấp mở rộng QL1A',
    ngayNhan: '10/09/2026',
    canBoXuLy: 'Hoàng Văn Nam',
    trangThai: 'Đang xác minh thực địa',
    lyDoGoiY: 'Cùng dự án thu hồi đất và quyết định bồi thường',
  },
  {
    code: 'Đ-2025-0089',
    nguoiNop: 'Hoàng Văn Hải',
    loaiDon: 'Đơn khiếu nại',
    tieuDe: 'Khiếu nại việc chậm trễ giải quyết hồ sơ cấp GCNQSDĐ tại phường Quan Hoa',
    ngayNhan: '12/09/2026',
    canBoXuLy: 'Nguyễn Minh Anh',
    trangThai: 'Đã có báo cáo đề xuất',
    lyDoGoiY: 'Cùng người đứng đơn và cùng thửa đất số 45',
  },
];

const CAN_CU_OPTIONS = [
  'Cùng đối tượng, tổ chức, cá nhân bị khiếu nại / tố cáo',
  'Cùng nội dung vụ việc, dự án hoặc địa bàn tranh chấp',
  'Cùng người nộp đơn gửi nhiều lần bổ sung tình tiết / tài liệu mới',
  'Vụ việc đã có quyết định / thông báo giải quyết của cấp có thẩm quyền',
  'Thuộc trường hợp nhập nhiều vụ việc cùng tính chất theo Điều 29 Luật Khiếu nại',
];

export default function GhepDonModal({
  isOpen,
  onClose,
  donInfo,
  onSubmit,
}: GhepDonModalProps) {
  const [selectedTargetCode, setSelectedTargetCode] = useState<string>('Đ-2026-00098');
  const [customTargetCode, setCustomTargetCode] = useState<string>('');
  const [isManualInput, setIsManualInput] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [soQuyetDinh, setSoQuyetDinh] = useState<string>(`QĐ-GD/2026-${donInfo.code.replace(/[^0-9]/g, '') || '0105'}`);
  const [selectedCanCu, setSelectedCanCu] = useState<string[]>([
    'Cùng đối tượng, tổ chức, cá nhân bị khiếu nại / tố cáo',
    'Cùng nội dung vụ việc, dự án hoặc địa bàn tranh chấp',
  ]);
  const [ghiChu, setGhiChu] = useState<string>(
    `Ghép hồ sơ đơn ${donInfo.code} do có nội dung và chứng cứ liên quan trực tiếp đến hồ sơ đang giải quyết, không tách riêng vụ việc nhằm đảm bảo tính thống nhất trong thụ lý.`
  );
  const [chuyenToanBoFile, setChuyenToanBoFile] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredGoiY = GOI_Y_DON_DICH.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.code.toLowerCase().includes(q) ||
      item.nguoiNop.toLowerCase().includes(q) ||
      item.tieuDe.toLowerCase().includes(q)
    );
  });

  const selectedItem = GOI_Y_DON_DICH.find((d) => d.code === selectedTargetCode);

  const toggleCanCu = (canCu: string) => {
    if (selectedCanCu.includes(canCu)) {
      setSelectedCanCu(selectedCanCu.filter((c) => c !== canCu));
    } else {
      setSelectedCanCu([...selectedCanCu, canCu]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = isManualInput ? customTargetCode.trim() : selectedTargetCode;
    if (!finalCode) {
      setError('Vui lòng chọn hoặc nhập mã hồ sơ đơn đích cần ghép');
      return;
    }

    if (finalCode === donInfo.code) {
      setError('Không thể ghép đơn vào chính nó');
      return;
    }

    if (!soQuyetDinh.trim()) {
      setError('Vui lòng nhập số quyết định hoặc thông báo ghép đơn');
      return;
    }

    const targetTitle = isManualInput
      ? `Hồ sơ vụ việc ${finalCode}`
      : selectedItem?.tieuDe || `Hồ sơ ${finalCode}`;

    const targetNguoiNop = isManualInput
      ? 'Hồ sơ đã nhập'
      : selectedItem?.nguoiNop || 'Hồ sơ đích';

    onSubmit({
      targetDonCode: finalCode,
      targetDonTitle: targetTitle,
      targetNguoiNop,
      soQuyetDinhGhep: soQuyetDinh.trim(),
      ngayGhep: new Date().toLocaleDateString('vi-VN'),
      canCuGhep: selectedCanCu,
      ghiChuGhep: ghiChu.trim(),
      chuyenToanBoFile,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-500/10 via-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <span className="material-symbols-outlined text-[24px]">merge_type</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase tracking-wide">
                  GHÉP HỒ SƠ ĐƠN
                </span>
                <span className="text-[11.5px] text-slate-500 font-mono">
                  Mã đơn hiện tại: <strong className="text-slate-900 font-bold">{donInfo.code}</strong>
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 font-headline-md tracking-tight mt-0.5">
                Ghép vào hồ sơ vụ việc đang giải quyết
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
          <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-rose-600">error</span>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Thông tin đơn nguồn hiện tại */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Hồ sơ đơn nguồn (Đang xử lý)
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[11px]">
                  {donInfo.code}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <span className="text-slate-500 block text-[11px]">Người nộp đơn:</span>
                  <span className="font-semibold text-slate-900">{donInfo.nguoiNop}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Loại đơn:</span>
                  <span className="font-semibold text-slate-900">{donInfo.loaiDon}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Ngày tiếp nhận:</span>
                  <span className="font-semibold text-slate-900">{donInfo.ngayNhan || '16/09/2026'}</span>
                </div>
              </div>
              <div className="pt-1 border-t border-slate-200/70">
                <span className="text-slate-500 text-[11px]">Nội dung đơn: </span>
                <span className="text-slate-800 font-medium">{donInfo.noiDung}</span>
              </div>
            </div>

            {/* Chọn hồ sơ đích */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-indigo-600">call_merge</span>
                  <span>Chọn hồ sơ đích cần ghép vào</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsManualInput(!isManualInput)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
                  >
                    {isManualInput ? '← Chọn từ gợi ý hệ thống' : 'Nhập mã hồ sơ khác'}
                  </button>
                </div>
              </div>

              {isManualInput ? (
                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Nhập mã đơn / số hồ sơ đích:
                  </label>
                  <input
                    type="text"
                    value={customTargetCode}
                    onChange={(e) => setCustomTargetCode(e.target.value)}
                    placeholder="VD: Đ-2026-00128 hoặc LN-2026-00128"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm uppercase"
                  />
                  <p className="text-[11px] text-slate-500">
                    Hệ thống sẽ liên kết và ghép toàn bộ tài liệu của đơn {donInfo.code} vào hồ sơ trên.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm hồ sơ theo mã đơn, người nộp, nội dung..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {filteredGoiY.map((item) => {
                      const isSelected = selectedTargetCode === item.code;
                      return (
                        <div
                          key={item.code}
                          onClick={() => setSelectedTargetCode(item.code)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-300/40 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={isSelected}
                                onChange={() => setSelectedTargetCode(item.code)}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                {item.code}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                {item.loaiDon}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {item.lyDoGoiY}
                            </span>
                          </div>

                          <p className="text-[11.5px] font-semibold text-slate-800 mt-1 pl-6 line-clamp-1">
                            {item.tieuDe}
                          </p>

                          <div className="flex items-center gap-3 pl-6 mt-1 text-[11px] text-slate-500">
                            <span>Người nộp: <strong className="text-slate-700">{item.nguoiNop}</strong></span>
                            <span>•</span>
                            <span>Cán bộ: <strong className="text-slate-700">{item.canBoXuLy}</strong></span>
                            <span>•</span>
                            <span className="text-indigo-600 font-medium">{item.trangThai}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quyết định và Căn cứ ghép đơn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Số Quyết định / Thông báo ghép đơn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={soQuyetDinh}
                  onChange={(e) => setSoQuyetDinh(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="VD: QĐ-GD/2026-0105"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Ngày quyết định ghép
                </label>
                <input
                  type="text"
                  defaultValue={new Date().toLocaleDateString('vi-VN')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 text-slate-700 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            {/* Căn cứ pháp lý ghép đơn */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900">
                Căn cứ ghép đơn:
              </label>
              <div className="space-y-1.5">
                {CAN_CU_OPTIONS.map((canCu, idx) => {
                  const isChecked = selectedCanCu.includes(canCu);
                  return (
                    <label
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-indigo-50/50 border-indigo-200 text-slate-900 font-medium'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCanCu(canCu)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-[11.5px] leading-tight">{canCu}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Chuyển file */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-amber-600">attach_file</span>
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    Đồng bộ hồ sơ tài liệu đính kèm
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Chuyển toàn bộ tài liệu số hóa, chứng cứ sang hồ sơ đích được ghép
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={chuyenToanBoFile}
                onChange={(e) => setChuyenToanBoFile(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {/* Ghi chú giải trình */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-900">
                Ghi chú / Giải trình căn cứ ghép đơn:
              </label>
              <textarea
                rows={3}
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                placeholder="Nhập nội dung giải trình chi tiết về việc ghép đơn..."
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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">merge_type</span>
              <span>Xác nhận ghép đơn</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
