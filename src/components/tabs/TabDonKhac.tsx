import React, { useState } from 'react';
import { DonDetail } from '../../types';

interface TabDonKhacProps {
  currentDon: DonDetail;
}

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  date: string;
  type: string;
}

interface MergedItem {
  id: string;
  type: 'don' | 'luot_nhan';
  code: string;
  maThamChieu?: string;
  maLuotNhanGoc?: string;
  ngayNhan: string;
  ngayGhep: string;
  nguoiGhep: string;
  soQuyetDinhGhep: string;
  nguoiNop: string;
  cccd: string;
  sdt: string;
  diaChi: string;
  tieuDe: string;
  noiDungChiTiet: string;
  trangThai: string;
  canCuGhep: string[];
  quyMo: string;
  files: AttachedFile[];
}

export default function TabDonKhac({ currentDon }: TabDonKhacProps) {
  const isToGiac =
    currentDon.code?.startsWith('Đ-2026') ||
    currentDon.nguoiNop === 'Nguyễn Văn A' ||
    currentDon.title?.toLowerCase().includes('tố giác');

  // Danh sách các đơn hoặc lượt nhận ĐÃ ĐƯỢC GHÉP VÀO hồ sơ này
  const initialItems: MergedItem[] = isToGiac
    ? [
      {
        id: 'merged-1',
        type: 'don',
        code: 'Đ-2026-00098',
        maLuotNhanGoc: 'LN-2026-00098',
        ngayNhan: '08/09/2026 14:30',
        ngayGhep: '11/09/2026 16:00',
        nguoiGhep: 'ĐTV. Lê Tuấn Anh',
        soQuyetDinhGhep: 'QĐ-NH/2026-098',
        nguoiNop: 'Trần Thị Mai (Đại diện 12 hộ góp vốn)',
        cccd: '001185002144',
        sdt: '0903 112 334',
        diaChi: 'P. Dịch Vọng, Q. Cầu Giấy, TP. Hà Nội',
        tieuDe: 'Tố giác Công ty CP X có hành vi huy động vốn trái luật và chiếm giữ tiền tại Dự án Khu đô thị Y',
        noiDungChiTiet:
          'Tố giác ông Trần Văn B cùng Ban điều hành Công ty CP Đầu tư X đã ký kết hợp đồng góp vốn cam đoan sinh lời 12%/năm tại Dự án Khu đô thị Y với 12 hộ dân, thu số tiền 14.2 tỷ đồng nhưng quá thời hạn cam kết không thực hiện và có dấu hiệu tẩu tán tài sản.',
        trangThai: 'Đã phân công điều tra viên',
        canCuGhep: [
          'Cùng đối tượng bị tố giác: Ông Trần Văn B (Chủ tịch kiêm Tổng Giám đốc CTCP X)',
          'Cùng địa bàn dự án: Dự án Khu đô thị Y - Phường Hà Cầu, Quận Hà Đông',
          'Cùng phương thức, thủ đoạn: Ký hợp đồng góp vốn cam kết sinh lời 12%/năm nhưng cố tình chiếm đoạt',
        ],
        quyMo: '14.200.000.000 VNĐ',
        files: [
          { id: 'f1', name: 'Don_to_giac_tap_the_12_ho.pdf', size: '2.5 MB', date: '08/09/2026', type: 'PDF' },
          { id: 'f2', name: 'Hop_dong_gop_von_mau_CTCP_X.pdf', size: '5.1 MB', date: '08/09/2026', type: 'PDF' },
          { id: 'f3', name: 'Bang_sao_ke_chuyen_tien_14ty2.pdf', size: '3.8 MB', date: '08/09/2026', type: 'PDF' },
        ],
      },
      {
        id: 'merged-2',
        type: 'luot_nhan',
        code: 'LN-2026-00104',
        maThamChieu: 'Đ-2026-00104',
        ngayNhan: '11/09/2026 09:10',
        ngayGhep: '13/09/2026 11:30',
        nguoiGhep: 'ĐTV. Lê Tuấn Anh',
        soQuyetDinhGhep: 'TB-XL/2026-104',
        nguoiNop: 'Lê Quốc Bảo',
        cccd: '001092004561',
        sdt: '0977 889 900',
        diaChi: 'P. Khương Đình, Q. Thanh Xuân, TP. Hà Nội',
        tieuDe: 'Lượt nhận bổ sung: Đề nghị phong tỏa tài khoản ngân hàng của Công ty CP X do có dấu hiệu tẩu tán tài sản',
        noiDungChiTiet:
          'Bổ sung tình tiết số tài khoản nhận tiền của CTCP X tại ngân hàng Vietcombank và đề nghị Cơ quan CSĐT khẩn cấp áp dụng biện pháp phong tỏa ngăn chặn giao dịch để bảo toàn tài sản cho các nạn nhân.',
        trangThai: 'Chuyển PC03 xác minh dòng tiền',
        canCuGhep: [
          'Cùng tài khoản thụ hưởng dòng tiền: Vietcombank - STK 0011004567899 (CTCP X)',
          'Thời điểm nộp tiền trùng khớp: Tháng 11/2024 - Tháng 03/2025',
          'Tài liệu kèm theo: Giấy nộp tiền và phiếu thu đóng dấu của CTCP X',
        ],
        quyMo: '2.800.000.000 VNĐ',
        files: [
          { id: 'f4', name: 'Don_yeu_cau_ngan_chan_tau_tan.pdf', size: '1.4 MB', date: '11/09/2026', type: 'PDF' },
          { id: 'f5', name: 'Chung_tu_giao_dich_VCB_2ty8.pdf', size: '2.9 MB', date: '11/09/2026', type: 'PDF' },
        ],
      },
    ]
    : [
      {
        id: 'merged-1',
        type: 'don',
        code: 'Đ-2026-00042',
        maLuotNhanGoc: 'LN-2026-00042',
        ngayNhan: '10/09/2026 08:30',
        ngayGhep: '13/09/2026 14:20',
        nguoiGhep: 'Chuyên viên Hoàng Văn Nam',
        soQuyetDinhGhep: 'QĐ-GH/2026-042',
        nguoiNop: 'Phạm Văn Thành (Hộ liền kề Thửa 44)',
        cccd: '081084001928',
        sdt: '0918 223 445',
        diaChi: '142/6 Nguyễn Văn Cừ, P. An Khánh, Q. Ninh Kiều, TP. Cần Thơ',
        tieuDe: 'Khiếu nại phương án bồi thường đất nông nghiệp Dự án nâng cấp mở rộng QL1A',
        noiDungChiTiet:
          'Khiếu nại Quyết định thu hồi đất số 1422/QĐ-UBND ngày 20/08/2026 của UBND TP. Cần Thơ về việc bồi thường giá đất nông nghiệp 18.5 triệu/m² là chưa thỏa đáng so với đơn giá chuyển nhượng thực tế; đề nghị xem xét điều chỉnh lên 28 triệu/m² và có chính sách hỗ trợ chuyển đổi nghề nghiệp.',
        trangThai: 'Đang rà soát thực địa',
        canCuGhep: [
          'Cùng dự án đầu tư: Nâng cấp, mở rộng Quốc lộ 1A (đoạn qua TP. Cần Thơ)',
          'Cùng quyết định thu hồi: Quyết định 1422/QĐ-UBND của UBND thành phố',
          'Cùng vị trí thửa đất: Cùng Tờ bản đồ số 12, tiếp giáp chỉ giới đường đỏ',
        ],
        quyMo: 'Đơn giá 18.5 triệu → Đề xuất 28 triệu/m²',
        files: [
          { id: 'f1', name: 'Don_khieu_nai_goc_00042.pdf', size: '1.8 MB', date: '10/09/2026', type: 'PDF' },
          { id: 'f2', name: 'Trich_luc_ban_do_thua_44.pdf', size: '3.4 MB', date: '10/09/2026', type: 'PDF' },
          { id: 'f3', name: 'Bien_ban_kiem_ke_hien_trang.pdf', size: '2.1 MB', date: '10/09/2026', type: 'PDF' },
        ],
      },
      {
        id: 'merged-2',
        type: 'luot_nhan',
        code: 'LN-2026-00055',
        maThamChieu: 'Đ-2026-00055',
        ngayNhan: '12/09/2026 15:00',
        ngayGhep: '14/09/2026 09:15',
        nguoiGhep: 'Chuyên viên Hoàng Văn Nam',
        soQuyetDinhGhep: 'TB-TN/2026-055',
        nguoiNop: 'Nguyễn Thị Bích (Hộ Thửa 46)',
        cccd: '081179003841',
        sdt: '0939 445 667',
        diaChi: '142/10 Nguyễn Văn Cừ, P. An Khánh, Q. Ninh Kiều, TP. Cần Thơ',
        tieuDe: 'Lượt nhận bổ sung: Đề nghị bố trí tái định cư tại chỗ cho các hộ dân bị giải tỏa trắng mặt đường',
        noiDungChiTiet:
          'Đề nghị Hội đồng bồi thường bố trí 01 nền tái định cư tại chỗ hoặc gần khu vực giải tỏa do hộ gia đình sinh sống lâu năm, nhà mặt tiền phục vụ kinh doanh; cam kết bàn giao mặt bằng đúng hạn khi được giải quyết suất tái định cư.',
        trangThai: 'Chờ đối thoại',
        canCuGhep: [
          'Cùng đối tượng kiến nghị: Hội đồng bồi thường & Ban QLDA Giao thông',
          'Cùng nội dung yêu cầu: Bố trí suất tái định cư tại chỗ cho các hộ liền kề dự án',
          'Căn cứ pháp lý: Luật Đất đai 2024 về chính sách bồi thường, hỗ trợ tái định cư',
        ],
        quyMo: '01 Nền tái định cư tại chỗ',
        files: [
          { id: 'f4', name: 'Phieu_tiep_nhan_LN-00055.pdf', size: '1.2 MB', date: '12/09/2026', type: 'PDF' },
          { id: 'f5', name: 'Giay_xac_nhan_nguon_goc_nha_dat.pdf', size: '4.2 MB', date: '12/09/2026', type: 'PDF' },
        ],
      },
    ];

  const [items, setItems] = useState<MergedItem[]>(initialItems);
  const [filterType, setFilterType] = useState<'all' | 'don' | 'luot_nhan'>('all');
  const [selectedDetailItem, setSelectedDetailItem] = useState<MergedItem | null>(null);
  const [selectedSeparateItem, setSelectedSeparateItem] = useState<MergedItem | null>(null);
  const [separateReason, setSeparateReason] = useState('Tách để thụ lý độc lập theo thẩm quyền');
  const [separateNote, setSeparateNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredItems = items.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const countDon = items.filter((i) => i.type === 'don').length;
  const countLuotNhan = items.filter((i) => i.type === 'luot_nhan').length;

  const handleConfirmSeparate = () => {
    if (!selectedSeparateItem) return;
    const code = selectedSeparateItem.code;
    setItems((prev) => prev.filter((i) => i.id !== selectedSeparateItem.id));
    setSelectedSeparateItem(null);
    setSeparateNote('');
    showToast(`✓ Đã tách ${selectedSeparateItem.type === 'don' ? 'đơn' : 'lượt nhận'} ${code} ra khỏi hồ sơ thành công!`);
  };

  return (
    <div className="space-y-5 animate-fade-in relative">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner: Giải thích bản chất màn hình */}
      <div className=" p-4.5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#004ac6] flex items-center justify-center shrink-0 border border-blue-100">
                <span className="material-symbols-outlined text-[20px]">folder_shared</span>
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Đơn &amp; Lượt nhận đã ghép vào hồ sơ
                </h2>

              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-slate-500">Đã ghép:</span>
              <span className="font-bold text-slate-800">{items.length} mục</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-2 text-emerald-800 font-medium">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>Đang xử lý hợp nhất</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1 text-[11.5px]">Bộ lọc hiển thị:</span>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${filterType === 'all'
              ? 'bg-[#004ac6] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
          >
            Tất cả ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('don')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${filterType === 'don'
              ? 'bg-[#004ac6] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
          >
            <span className="material-symbols-outlined text-[14px]">description</span>
            Đơn ghép ({countDon})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('luot_nhan')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${filterType === 'luot_nhan'
              ? 'bg-[#004ac6] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
          >
            <span className="material-symbols-outlined text-[14px]">history_edu</span>
            Lượt nhận ghép ({countLuotNhan})
          </button>
        </div>
      </div>

      {/* Danh sách các thẻ đơn / lượt nhận đã ghép */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[24px]">folder_off</span>
          </div>
          <div className="font-bold text-slate-700 text-sm">Không có đơn hoặc lượt nhận nào trong mục này</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tất cả các hồ sơ ghép đã được tách hoặc không có dữ liệu phù hợp với bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredItems.map((item, idx) => {
            const isDon = item.type === 'don';
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                {/* 1. Header Thẻ */}
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-[#004ac6] font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-[13px] font-mono tracking-tight">
                      {item.code}
                    </span>

                    {/* Badge loại hình */}
                    {isDon ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#004ac6] border border-blue-200 text-[10.5px] font-bold">
                        <span className="material-symbols-outlined text-[13px]">description</span>
                        Đơn ghép
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10.5px] font-bold">
                        <span className="material-symbols-outlined text-[13px]">history_edu</span>
                        Lượt nhận ghép
                      </span>
                    )}

                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-[11.5px] text-slate-500">{item.ngayNhan}</span>
                  </div>

                  {/* Trạng thái xác nhận: Đã ghép vào hồ sơ */}
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      Đã ghép vào hồ sơ
                    </span>
                  </div>
                </div>

                {/* 2. Dòng thông tin phê duyệt ghép */}
                <div className="px-5 py-2 bg-slate-50/50 border-b border-slate-100 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-slate-400">how_to_reg</span>
                    <span>Quyết định ghép: <strong className="font-mono text-slate-800">{item.soQuyetDinhGhep}</strong></span>
                    <span className="text-slate-300">|</span>
                    <span>Ngày ghép: <strong className="text-slate-800">{item.ngayGhep}</strong></span>
                  </div>
                  <div className="text-slate-500">
                    Cán bộ: <span className="font-medium text-slate-700">{item.nguoiGhep}</span>
                  </div>
                </div>

                {/* 3. Thân Thẻ */}
                <div className="p-5 space-y-3.5 text-xs flex-1">
                  {/* Khối người nộp */}
                  <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[10.5px] text-slate-400 uppercase font-semibold">
                        {isDon ? 'Người đứng đơn:' : 'Người nộp lượt nhận:'}
                      </div>
                      <div className="font-bold text-slate-900 text-[12.5px] truncate">{item.nguoiNop}</div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        CCCD: <span className="font-semibold text-slate-800">{item.cccd}</span> • SĐT: {item.sdt}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Địa chỉ: {item.diaChi}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#004ac6] text-[11px] font-semibold shrink-0 border border-blue-100">
                      {item.trangThai}
                    </span>
                  </div>

                  {/* <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-slate-500">attach_file</span>
                        <span>Tài liệu đính kèm ({item.files.length} tệp):</span>
                      </span>
                    </div>
                    <div className="space-y-1">
                      {item.files.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-50 hover:bg-blue-50/60 border border-slate-100 text-[11.5px] text-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="material-symbols-outlined text-[14px] text-rose-500 shrink-0">
                              picture_as_pdf
                            </span>
                            <span className="font-medium truncate">{f.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">({f.size})</span>
                          </div>
                          <span className="text-[10.5px] text-slate-400 shrink-0 font-mono">{f.date}</span>
                        </div>
                      ))}
                    </div>
                  </div> */}
                </div>

                {/* 4. Chân Thẻ: Thao tác phù hợp cho đơn đã ghép (KHÔNG CÒN GHÉP HỒ SƠ HAY XEM ĐỐI CHIẾU) */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <span className="text-[11.5px] text-slate-600">
                    Quy mô: <strong className="text-slate-800">{item.quyMo}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Nút Xem chi tiết hồ sơ đơn đã ghép */}
                    <button
                      type="button"
                      onClick={() => setSelectedDetailItem(item)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#004ac6] text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1.5 transition-colors"
                      title="Xem toàn bộ thông tin chi tiết của đơn này"
                    >
                      <span className="material-symbols-outlined text-[15px]">visibility</span>
                      <span>Xem chi tiết</span>
                    </button>

                    {/* Nút Tách đơn khỏi hồ sơ (nếu cần xử lý riêng) */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSeparateItem(item);
                        setSeparateReason('Tách để thụ lý độc lập theo thẩm quyền');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-700 text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1.5 transition-colors"
                      title="Tách đơn hoặc lượt nhận này ra khỏi hồ sơ gốc để xử lý riêng"
                    >
                      <span className="material-symbols-outlined text-[15px] text-slate-400 hover:text-rose-600">
                        call_split
                      </span>
                      <span>Tách khỏi hồ sơ</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: XEM CHI TIẾT ĐƠN / LƯỢT NHẬN ĐÃ GHÉP                              */}
      {/* ========================================================================= */}
      {selectedDetailItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in duration-150"
          onClick={() => setSelectedDetailItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-[#004ac6] flex items-center justify-center font-bold text-sm">
                  <span className="material-symbols-outlined text-[18px]">
                    {selectedDetailItem.type === 'don' ? 'description' : 'history_edu'}
                  </span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base font-mono">
                      {selectedDetailItem.code}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#004ac6] font-semibold text-[10.5px]">
                      {selectedDetailItem.type === 'don' ? 'Đơn đã ghép' : 'Lượt nhận đã ghép'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10.5px]">
                      {selectedDetailItem.trangThai}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Hồ sơ gốc tiếp nhận: <strong className="font-mono text-slate-700">{currentDon.code}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 overflow-y-auto space-y-4.5 text-xs text-slate-700">
              {/* Lịch sử ghép hồ sơ */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-[12.5px]">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span>Tình trạng: Đã hợp nhất vào luồng xử lý của hồ sơ chính</span>
                </div>
                <div className="text-[11.5px] text-emerald-800 grid grid-cols-2 gap-2 pt-1 border-t border-emerald-100">
                  <div>Số quyết định: <strong className="font-mono">{selectedDetailItem.soQuyetDinhGhep}</strong></div>
                  <div>Thời gian ghép: <strong>{selectedDetailItem.ngayGhep}</strong></div>
                  <div>Cán bộ thực hiện: <strong>{selectedDetailItem.nguoiGhep}</strong></div>
                  <div>Tiếp nhận gốc lúc: <strong>{selectedDetailItem.ngayNhan}</strong></div>
                </div>
              </div>

              {/* Thông tin người nộp */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 uppercase tracking-tight text-[11px] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#004ac6]">badge</span>
                  <span>Thông tin người nộp đơn</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div>Họ tên: <strong className="text-slate-900">{selectedDetailItem.nguoiNop}</strong></div>
                  <div>CCCD: <strong className="font-mono text-slate-900">{selectedDetailItem.cccd}</strong></div>
                  <div>Số điện thoại: <strong className="font-mono text-slate-900">{selectedDetailItem.sdt}</strong></div>
                  <div>Địa chỉ: <span className="text-slate-800">{selectedDetailItem.diaChi}</span></div>
                </div>
              </div>

              {/* Nội dung chi tiết */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#004ac6]">subject</span>
                  <span>Nội dung chi tiết yêu cầu:</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[12px] leading-relaxed text-slate-800">
                  {selectedDetailItem.noiDungChiTiet}
                </div>
              </div>

              {/* Căn cứ pháp lý ghép */}
              <div className="space-y-1.5">
                <div className="font-bold text-[#004ac6] text-[11px] uppercase tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">fact_check</span>
                  <span>Căn cứ ghép vụ việc:</span>
                </div>
                <ul className="space-y-1.5 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 text-[11.5px] text-slate-800">
                  {selectedDetailItem.canCuGhep.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Danh sách tài liệu */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#004ac6]">folder</span>
                  <span>Tài liệu kèm theo ({selectedDetailItem.files.length} tệp):</span>
                </div>
                <div className="space-y-1.5">
                  {selectedDetailItem.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-[18px] text-rose-500">picture_as_pdf</span>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 truncate">{file.name}</div>
                          <div className="text-[10.5px] text-slate-400 font-mono">{file.size} • {file.date}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast(`Đang mở tệp ${file.name}...`)}
                        className="px-2.5 py-1 rounded bg-blue-50 text-[#004ac6] hover:bg-blue-100 text-xs font-semibold cursor-pointer shrink-0"
                      >
                        Tải về
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: XÁC NHẬN TÁCH ĐƠN KHỎI HỒ SƠ                                       */}
      {/* ========================================================================= */}
      {selectedSeparateItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in duration-150"
          onClick={() => setSelectedSeparateItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/70">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">call_split</span>
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Tách {selectedSeparateItem.type === 'don' ? 'đơn' : 'lượt nhận'} khỏi hồ sơ
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Mục: {selectedSeparateItem.code} ➔ Hồ sơ gốc: {currentDon.code}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSeparateItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">warning</span>
                  Lưu ý khi tách hồ sơ
                </div>
                <p className="text-[11.5px] leading-relaxed">
                  Khi thực hiện tách, mục này sẽ được gỡ khỏi luồng giải quyết chung của hồ sơ{' '}
                  <strong className="font-mono">{currentDon.code}</strong> và trở thành một vụ việc/lượt nhận độc lập để thụ lý theo quy trình riêng.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Lý do tách đơn/lượt nhận:
                </label>
                <select
                  value={separateReason}
                  onChange={(e) => setSeparateReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Tách để thụ lý độc lập theo thẩm quyền">Tách để thụ lý độc lập theo thẩm quyền</option>
                  <option value="Người nộp yêu cầu giải quyết riêng biệt">Người nộp yêu cầu giải quyết riêng biệt</option>
                  <option value="Ghép nhầm / Nội dung không cùng vụ việc">Ghép nhầm / Nội dung không cùng vụ việc</option>
                  <option value="Chuyển sang cơ quan khác theo địa bàn">Chuyển sang cơ quan khác theo địa bàn</option>
                  <option value="Lý do khác...">Lý do khác...</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Ghi chú / Căn cứ phê duyệt tách (tùy chọn):
                </label>
                <textarea
                  value={separateNote}
                  onChange={(e) => setSeparateNote(e.target.value)}
                  placeholder="Nhập số văn bản hoặc ý kiến chỉ đạo phê duyệt việc tách hồ sơ..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedSeparateItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSeparate}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">call_split</span>
                Xác nhận tách hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
