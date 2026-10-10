// src/screens/quanLyTrinhKy/TaoLuotTrinhModal.tsx
import React, { useState } from 'react';
import {
  LuotTrinhKy,
  DoiTuongTrinhType,
  KieuTrinhKy,
  HanhDongYeuCauType,
  HoSoDocumentItem,
  NguoiNhanTrinhItem,
} from '../../types/quanLyTrinhKy';
import { CurrentUserAccount } from '../../types/signing';

interface TaoLuotTrinhModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount?: CurrentUserAccount;
  onCreated: (newLuotTrinh: LuotTrinhKy) => void;
  initialFromDon?: {
    maDon: string;
    tieuDeDon: string;
    stepId?: string;
    stepName?: string;
    docName?: string;
  };
}

const AVAILABLE_LEADERS = [
  {
    id: 'ld-tron-g',
    hoTen: 'Thượng tá Phạm Đình Trọng',
    chucVu: 'Phó Thủ trưởng Cơ quan CSĐT',
    phongBan: 'Lãnh đạo Cơ quan CSĐT',
    avatarBg: 'bg-emerald-700',
    defaultRole: 'phe_duyet' as HanhDongYeuCauType,
  },
  {
    id: 'ld-nghia',
    hoTen: 'Thượng tá Trần Tuấn Nghĩa',
    chucVu: 'Phó Trưởng Công an quận',
    phongBan: 'Chỉ huy phụ trách Cảnh sát',
    avatarBg: 'bg-blue-700',
    defaultRole: 'ky' as HanhDongYeuCauType,
  },
  {
    id: 'ld-long',
    hoTen: 'Thiếu tá Vũ Hoàng Long',
    chucVu: 'Đội trưởng Đội CSĐT Tổng hợp',
    phongBan: 'Chỉ huy Đội CSĐTTH',
    avatarBg: 'bg-indigo-700',
    defaultRole: 'ky' as HanhDongYeuCauType,
  },
  {
    id: 'ld-hung',
    hoTen: 'Trần Văn Hùng',
    chucVu: 'Phó Chánh Thanh tra thành phố',
    phongBan: 'Ban Lãnh đạo Thanh tra',
    avatarBg: 'bg-teal-700',
    defaultRole: 'phe_duyet' as HanhDongYeuCauType,
  },
];

export default function TaoLuotTrinhModal({
  isOpen,
  onClose,
  currentAccount,
  onCreated,
  initialFromDon,
}: TaoLuotTrinhModalProps) {
  // Form states
  const [doiTuongTrinh, setDoiTuongTrinh] = useState<DoiTuongTrinhType>('van_ban');
  const [maHoSoLienQuan, setMaHoSoLienQuan] = useState(initialFromDon?.maDon || 'Đ-2026-00125');
  const [tieuDeDon, setTieuDeDon] = useState(
    initialFromDon?.tieuDeDon || 'Tố giác sai phạm trật tự xây dựng & lấn chiếm lối đi chung tại ngõ 128 Đội Cấn'
  );
  const [tenDoiTuong, setTenDoiTuong] = useState(
    initialFromDon?.docName || 'Báo cáo đề xuất thụ lý và Kế hoạch xác minh đơn tố cáo'
  );
  const [noiDungYeuCau, setNoiDungYeuCau] = useState(
    'Kính trình Đồng chí Chỉ huy xem xét, ký duyệt hồ sơ để triển khai các bước nghiệp vụ tiếp theo.'
  );
  const [kieuTrinh, setKieuTrinh] = useState<KieuTrinhKy>('dong_thoi');
  const [hanhDongYeuCauChung, setHanhDongYeuCauChung] = useState<HanhDongYeuCauType>('ky_va_phe_duyet');
  const [mucDoUuTien, setMucDoUuTien] = useState<'hoa_toc' | 'khan' | 'thuong'>('thuong');
  const [hanXuLy, setHanXuLy] = useState('18/03/2026');

  // Documents list
  const [docsList, setDocsList] = useState<HoSoDocumentItem[]>([
    {
      id: `doc-${Date.now()}-1`,
      tenTaiLieu: initialFromDon?.docName || 'Báo cáo đề xuất thụ lý và Kế hoạch xác minh số 01/BC-ĐX',
      loaiTaiLieu: 'Báo cáo đề xuất',
      soKyHieu: '01/BC-ĐX',
      phienBan: 'v1.0',
      dungLuong: '2.1 MB',
      yeuCauXuLy: 'ky_va_phe_duyet',
      trangThaiXuLy: 'chua_xu_ly',
      noiDungTrichYeu: 'Báo cáo đề xuất kế hoạch kiểm tra thực địa và làm việc với các bên liên quan.',
    },
  ]);

  // Selected Leaders
  const [selectedLeaderIds, setSelectedLeaderIds] = useState<string[]>(['ld-tron-g', 'ld-nghia']);

  if (!isOpen) return null;

  // Add document for dossier
  const handleAddDoc = () => {
    const newDoc: HoSoDocumentItem = {
      id: `doc-${Date.now()}-${docsList.length + 1}`,
      tenTaiLieu: `Tài liệu thành phần #${docsList.length + 1}`,
      loaiTaiLieu: 'Tài liệu đính kèm',
      phienBan: 'v1.0',
      dungLuong: '1.2 MB',
      yeuCauXuLy: 'tham_khao',
      trangThaiXuLy: 'chua_xu_ly',
    };
    setDocsList([...docsList, newDoc]);
  };

  const handleRemoveDoc = (id: string) => {
    if (docsList.length <= 1) return;
    setDocsList(docsList.filter((d) => d.id !== id));
  };

  const handleUpdateDocField = (id: string, field: keyof HoSoDocumentItem, value: any) => {
    setDocsList(
      docsList.map((d) => {
        if (d.id === id) {
          return { ...d, [field]: value };
        }
        return d;
      })
    );
  };

  // Toggle leader
  const handleToggleLeader = (id: string) => {
    if (selectedLeaderIds.includes(id)) {
      if (selectedLeaderIds.length <= 1) {
        alert('Cần chọn ít nhất 01 lãnh đạo nhận trình ký!');
        return;
      }
      setSelectedLeaderIds(selectedLeaderIds.filter((item) => item !== id));
    } else {
      setSelectedLeaderIds([...selectedLeaderIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenDoiTuong.trim()) {
      alert('Vui lòng nhập tên văn bản hoặc hồ sơ trình ký!');
      return;
    }

    const timeNow =
      new Date().toLocaleDateString('vi-VN') +
      ' ' +
      new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const newId = `LTK-2026-00${Math.floor(Math.random() * 90) + 10}`;

    // Construct leaders list
    const signers: NguoiNhanTrinhItem[] = selectedLeaderIds.map((lId, idx) => {
      const leaderDef = AVAILABLE_LEADERS.find((l) => l.id === lId)!;
      return {
        id: leaderDef.id,
        hoTen: leaderDef.hoTen,
        chucVu: leaderDef.chucVu,
        phongBan: leaderDef.phongBan,
        avatarBg: leaderDef.avatarBg,
        thuTu: idx + 1,
        kieuTrinh,
        hanhDongYeuCau: leaderDef.defaultRole,
        trangThai: kieuTrinh === 'tuan_tu' && idx > 0 ? 'chua_den_luot' : 'dang_cho_xu_ly',
        thoiDiemNhan: kieuTrinh === 'tuan_tu' && idx > 0 ? undefined : timeNow,
      };
    });

    const newLuotTrinh: LuotTrinhKy = {
      id: newId,
      doiTuongTrinh,
      tenDoiTuong,
      soLuongTaiLieu: docsList.length,
      maHoSoLienQuan,
      tieuDeDon,
      stepQuyTrinhId: initialFromDon?.stepId || 'tn-2',
      tenStepQuyTrinh: initialFromDon?.stepName || 'Bước 2: Phân loại, kiểm tra điều kiện & Báo cáo đề xuất',
      nguoiTao: currentAccount?.name || 'Nguyễn Minh Anh',
      chucVuNguoiTao: currentAccount?.chucVu || 'Chuyên viên xử lý đơn',
      nguoiTrinh: currentAccount?.name || 'Nguyễn Minh Anh',
      chucVuNguoiTrinh: currentAccount?.chucVu || 'Chuyên viên xử lý đơn',
      donViTrinh: currentAccount?.phongBan || 'Phòng Tiếp công dân & Xử lý đơn',
      thoiGianTao: timeNow,
      thoiGianTrinh: timeNow,
      noiDungYeuCau,
      status: 'da_trinh',
      mucDoUuTien,
      hanXuLy,
      kieuTrinh,
      hanhDongYeuCauChung,
      luotTrinhNumber: 1,
      tongSoLuotTrinh: 1,
      danhSachTaiLieu: docsList,
      danhSachNguoiNhan: signers,
      lichSuXuLy: [
        {
          id: `log-${Date.now()}-1`,
          thoiGian: timeNow,
          nguoiThucHien: currentAccount?.name || 'Nguyễn Minh Anh',
          chucVu: currentAccount?.chucVu || 'Chuyên viên xử lý đơn',
          hanhDong: 'Trình văn bản / hồ sơ',
          noiDungYKien: noiDungYeuCau,
          phienBanXuLy: docsList[0]?.phienBan || 'v1.0',
          luotTrinhIndex: 1,
        },
        {
          id: `log-${Date.now()}-0`,
          thoiGian: timeNow,
          nguoiThucHien: currentAccount?.name || 'Nguyễn Minh Anh',
          chucVu: currentAccount?.chucVu || 'Chuyên viên xử lý đơn',
          hanhDong: 'Tạo lượt trình',
          noiDungYKien: `Khởi tạo lượt trình ký mới: ${tenDoiTuong}`,
          phienBanXuLy: docsList[0]?.phienBan || 'v1.0',
          luotTrinhIndex: 1,
        },
      ],
    };

    onCreated(newLuotTrinh);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-400 text-2xl">post_add</span>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Tạo lượt trình ký / phê duyệt mới</h3>
              <p className="text-[11px] text-slate-300">
                Gắn văn bản hoặc tệp hồ sơ, thiết lập lãnh đạo duyệt theo quy định
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          {/* 1. Chọn loại đối tượng trình */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 text-xs block">
              1. Chọn đối tượng trình ký:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  doiTuongTrinh === 'van_ban'
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="doiTuongTrinh"
                  checked={doiTuongTrinh === 'van_ban'}
                  onChange={() => setDoiTuongTrinh('van_ban')}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">description</span>
                    <span>Một văn bản riêng lẻ</span>
                  </div>
                  <div className="text-[10.5px] text-slate-500 mt-0.5">
                    Ví dụ: Báo cáo đề xuất, Tờ trình, Quyết định thụ lý, Kế hoạch...
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  doiTuongTrinh === 'tep_ho_so'
                    ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-200'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="doiTuongTrinh"
                  checked={doiTuongTrinh === 'tep_ho_so'}
                  onChange={() => setDoiTuongTrinh('tep_ho_so')}
                  className="w-4 h-4 text-purple-600 cursor-pointer"
                />
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-purple-600 text-[18px]">folder_copy</span>
                    <span>Một tệp hồ sơ nhiều tài liệu</span>
                  </div>
                  <div className="text-[10.5px] text-slate-500 mt-0.5">
                    Gồm nhiều văn bản đính kèm, tài liệu chứng cứ, sơ đồ...
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Thông tin chung & Hồ sơ liên quan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-800 text-[11px] block">
                Tên văn bản hoặc tệp hồ sơ trình ký *
              </label>
              <input
                type="text"
                required
                value={tenDoiTuong}
                onChange={(e) => setTenDoiTuong(e.target.value)}
                placeholder="Ví dụ: Phiếu đề xuất thụ lý và Kế hoạch xác minh đơn tố cáo"
                className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 text-[11px] block">Mã đơn / Hồ sơ liên quan:</label>
              <input
                type="text"
                value={maHoSoLienQuan}
                onChange={(e) => setMaHoSoLienQuan(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 text-[11px] block">Mức độ ưu tiên &amp; Hạn xử lý:</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <select
                  value={mucDoUuTien}
                  onChange={(e) => setMucDoUuTien(e.target.value as any)}
                  className="p-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                >
                  <option value="thuong">Thường</option>
                  <option value="khan">Khẩn</option>
                  <option value="hoa_toc">Hỏa tốc</option>
                </select>
                <input
                  type="text"
                  value={hanXuLy}
                  onChange={(e) => setHanXuLy(e.target.value)}
                  placeholder="Hạn xử lý"
                  className="p-2 rounded-lg border border-slate-300 text-xs bg-white text-center"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 text-[11px] block">Nội dung / Yêu cầu trình ký:</label>
              <textarea
                rows={2}
                value={noiDungYeuCau}
                onChange={(e) => setNoiDungYeuCau(e.target.value)}
                placeholder="Kính trình Lãnh đạo xem xét..."
                className="w-full mt-1 p-2 rounded-lg border border-slate-300 text-xs bg-white"
              />
            </div>
          </div>

          {/* 3. Danh sách tài liệu thành phần (Cấu hình từng tài liệu) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs">
                3. Danh sách tài liệu &amp; Cấu hình yêu cầu xử lý:
              </label>
              {doiTuongTrinh === 'tep_ho_so' && (
                <button
                  type="button"
                  onClick={handleAddDoc}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] border border-blue-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  <span>Thêm tài liệu thành phần</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {docsList.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-slate-800 text-[11px]">
                      Tài liệu {idx + 1}:
                    </span>
                    {docsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer"
                      >
                        Xóa tài liệu này
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        value={doc.tenTaiLieu}
                        onChange={(e) => handleUpdateDocField(doc.id, 'tenTaiLieu', e.target.value)}
                        placeholder="Tên tài liệu..."
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={doc.loaiTaiLieu}
                        onChange={(e) => handleUpdateDocField(doc.id, 'loaiTaiLieu', e.target.value)}
                        placeholder="Loại văn bản..."
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <select
                        value={doc.yeuCauXuLy}
                        onChange={(e) => handleUpdateDocField(doc.id, 'yeuCauXuLy', e.target.value)}
                        className={`w-full p-2 border rounded-lg text-xs font-bold ${
                          doc.yeuCauXuLy === 'phe_duyet'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : doc.yeuCauXuLy === 'ky'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="phe_duyet">Yêu cầu Phê duyệt</option>
                        <option value="ky">Yêu cầu Ký nháy</option>
                        <option value="tham_khao">Chỉ dùng tham khảo</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Thiết lập Lãnh đạo nhận trình & Luồng xử lý */}
          <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="font-bold text-slate-900 text-xs">
                4. Người nhận trình &amp; Hình thức xử lý:
              </label>

              {/* Lựa chọn Tuần tự vs Đồng thời */}
              <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setKieuTrinh('dong_thoi')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    kieuTrinh === 'dong_thoi'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Trình đồng thời (Parallel)
                </button>
                <button
                  type="button"
                  onClick={() => setKieuTrinh('tuan_tu')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    kieuTrinh === 'tuan_tu'
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Trình tuần tự (Sequential)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_LEADERS.map((leader) => {
                const isSelected = selectedLeaderIds.includes(leader.id);
                return (
                  <label
                    key={leader.id}
                    onClick={() => handleToggleLeader(leader.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-white ring-1 ring-blue-200 shadow-2xs'
                        : 'border-slate-200 bg-white/60 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg text-white font-bold text-[10px] flex items-center justify-center shrink-0 ${
                          leader.avatarBg
                        }`}
                      >
                        {leader.hoTen.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{leader.hoTen}</div>
                        <div className="text-[10px] text-slate-500 truncate">{leader.chucVu}</div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Khởi tạo &amp; Trình lãnh đạo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
