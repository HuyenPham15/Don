import React, { useState } from 'react';
import { DonDetail } from '../../types';

interface TabDonKhacProps {
  currentDon: DonDetail;
}

export default function TabDonKhac({ currentDon }: TabDonKhacProps) {
  const [selectedDonId, setSelectedDonId] = useState<string | null>(null);
  const [showDoiChieuModal, setShowDoiChieuModal] = useState(false);

  const isToGiac = currentDon.code.startsWith('Đ-2026') || currentDon.nguoiNop === 'Nguyễn Văn A';

  const linkedDons = isToGiac
    ? [
      {
        code: 'Đ-2026-00098',
        ngayNhan: '08/09/2026 14:30',
        nguoiNop: 'Trần Thị Mai (Đại diện 12 hộ góp vốn)',
        cccd: '001185002144',
        sdt: '0903 112 334',
        diaChi: 'P. Dịch Vọng, Q. Cầu Giấy, TP. Hà Nội',
        tieuDe: 'Tố giác Công ty CP X có hành vi huy động vốn trái luật và chiếm giữ tiền tại Dự án Khu đô thị Y',
        mucDoTrung: 88,
        soTien: '14.200.000.000 VNĐ',
        trangThai: 'Đã phân công điều tra viên',
        diemTuongDong: [
          'Cùng đối tượng bị tố giác: Ông Trần Văn B (Chủ tịch CTCP X)',
          'Cùng địa bàn dự án: Dự án Khu đô thị Y - Phường Hà Cầu, Quận Hà Đông',
          'Cùng phương thức: Hợp đồng góp vốn cam kết sinh lời 12%/năm nhưng không thực hiện',
        ],
      },
      {
        code: 'Đ-2026-00104',
        ngayNhan: '11/09/2026 09:10',
        nguoiNop: 'Lê Quốc Bảo',
        cccd: '001092004561',
        sdt: '0977 889 900',
        diaChi: 'P. Khương Đình, Q. Thanh Xuân, TP. Hà Nội',
        tieuDe: 'Đề nghị phong tỏa tài khoản ngân hàng của Công ty CP X do có dấu hiệu tẩu tán tài sản',
        mucDoTrung: 76,
        soTien: '2.800.000.000 VNĐ',
        trangThai: 'Chuyển PC03 xác minh dòng tiền',
        diemTuongDong: [
          'Cùng số tài khoản thụ hưởng: Vietcombank - STK 0011004567899 (CTCP X)',
          'Thời điểm ký kết: Tháng 11/2024 - Tháng 03/2025',
          'Tài liệu kèm theo: Giấy nộp tiền và phiếu thu đóng dấu của CTCP X',
        ],
      },
    ]
    : [
      {
        code: 'Đ-2026-00042',
        ngayNhan: '10/09/2026 08:30',
        nguoiNop: 'Phạm Văn Thành (Hộ liền kề Thửa 44)',
        cccd: '081084001928',
        sdt: '0918 223 445',
        diaChi: '142/6 Nguyễn Văn Cừ, An Khánh, Ninh Kiều, Cần Thơ',
        tieuDe: 'Khiếu nại phương án bồi thường đất nông nghiệp Dự án nâng cấp mở rộng QL1A',
        mucDoTrung: 92,
        soTien: 'Đơn giá 18.5 triệu -> Đề xuất 28 triệu/m²',
        trangThai: 'Đang rà soát thực địa',
        diemTuongDong: [
          'Cùng dự án: Nâng cấp mở rộng Quốc lộ 1A (đoạn qua Cần Thơ)',
          'Cùng quyết định thu hồi: Quyết định 1422/QĐ-UBND',
          'Cùng vị trí thửa đất: Cùng Tờ bản đồ số 12, tiếp giáp chỉ giới đường đỏ',
        ],
      },
      {
        code: 'Đ-2026-00055',
        ngayNhan: '12/09/2026 15:00',
        nguoiNop: 'Nguyễn Thị Bích (Hộ Thửa 46)',
        cccd: '081179003841',
        sdt: '0939 445 667',
        diaChi: '142/10 Nguyễn Văn Cừ, An Khánh, Ninh Kiều, Cần Thơ',
        tieuDe: 'Đề nghị bố trí tái định cư tại chỗ cho các hộ dân bị giải tỏa trắng mặt đường',
        mucDoTrung: 81,
        soTien: '01 Nền tái định cư tại chỗ',
        trangThai: 'Chờ đối thoại',
        diemTuongDong: [
          'Cùng đối tượng kiến nghị: Hội đồng bồi thường & Ban QLDA',
          'Cùng yêu cầu: Bố trí suất tái định cư tại chỗ',
          'Căn cứ pháp lý: Luật Đất đai 2024 về bồi thường tái định cư',
        ],
      },
    ];

  return (
    <div className="space-y-6 animate-fade-in">


      {/* 2. Danh sách 2 đơn ghép chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {linkedDons.map((don, idx) => (
          <div
            key={don.code}
            className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-blue-300 transition-all"
          >
            {/* Header Thẻ */}
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#004ac6] font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="font-bold text-slate-900 text-[13px] font-label-technical">
                  {don.code}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs text-slate-500">{don.ngayNhan}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                  Trùng khớp {don.mucDoTrung}%
                </span>
              </div>
            </div>

            {/* Thân Thẻ */}
            <div className="p-5 space-y-3.5 text-xs">
              {/* Người nộp */}
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Người nộp đơn:</span>
                  <span className="font-bold text-slate-900 text-[12.5px]">{don.nguoiNop}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    CCCD: <span className="font-mono">{don.cccd}</span> • SĐT: {don.sdt}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#004ac6] text-[10.5px] font-semibold shrink-0">
                  {don.trangThai}
                </span>
              </div>

              {/* Tiêu đề & Tóm tắt */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Nội dung trích yếu:</span>
                <p className="text-[12px] font-medium text-slate-800 leading-snug bg-white p-2 rounded-lg border border-slate-100">
                  {don.tieuDe}
                </p>
              </div>

              {/* Điểm tương đồng do AI phát hiện */}
              <div>
                <span className="text-[11px] font-bold text-[#004ac6] uppercase tracking-tight block mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">psychology</span>
                  <span>Căn cứ ghép đơn &amp; Điểm tương đồng:</span>
                </span>
                <ul className="space-y-1.5 bg-blue-50/40 p-3 rounded-lg border border-blue-100/70 text-[11.5px] text-slate-700">
                  {don.diemTuongDong.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Chân Thẻ: Nút thao tác */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Quy mô: <strong>{don.soTien}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDonId(don.code);
                    setShowDoiChieuModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  Xem đối chiếu
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Đã xác lập liên kết vụ việc với đơn ${don.code} thành công!`)}
                  className="px-3 py-1.5 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Ghép hồ sơ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
