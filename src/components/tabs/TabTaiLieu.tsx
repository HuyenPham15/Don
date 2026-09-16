import React, { useState } from 'react';
import { DonDetail } from '../../types';

interface TabTaiLieuProps {
  currentDon: DonDetail;
}

interface DocItem {
  id: string;
  name: string;
  category: string;
  size: string;
  pages: number;
  uploadDate: string;
  signer: string;
  ocrStatus: 'Hoàn tất' | 'Đang xử lý';
  previewExcerpt: string;
}

export default function TabTaiLieu({ currentDon }: TabTaiLieuProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);

  const isToGiac = currentDon.code.startsWith('Đ-2026') || currentDon.nguoiNop === 'Nguyễn Văn A';

  const documents: DocItem[] = isToGiac
    ? [
        {
          id: 'DOC-01',
          name: 'Don_to_giac_toi_pham_NguyenVanA_16092026.pdf',
          category: 'Đơn gốc tiếp nhận',
          size: '1.8 MB',
          pages: 3,
          uploadDate: '16/09/2026 09:18',
          signer: 'Công dân Nguyễn Văn A (Ký tươi + VNeID)',
          ocrStatus: 'Hoàn tất',
          previewExcerpt:
            'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nĐƠN TỐ GIÁC TỘI PHẠM\n(V/v: Hành vi lừa đảo chiếm đoạt tài sản tại Dự án Khu đô thị Y)\n\nKính gửi: Cơ quan Cảnh sát điều tra - Công an thành phố Hà Nội\nTôi là: Nguyễn Văn A, sinh năm 1988...\nTôi làm đơn này tố giác ông Trần Văn B - Giám đốc CTCP X...',
        },
        {
          id: 'DOC-02',
          name: 'CCCD_gan_chip_cong_chung_001088019482.pdf',
          category: 'Định danh cá nhân',
          size: '850 KB',
          pages: 2,
          uploadDate: '16/09/2026 09:20',
          signer: 'Bộ Công an (Xác thực CSDL Dân cư)',
          ocrStatus: 'Hoàn tất',
          previewExcerpt:
            'CĂN CƯỚC CÔNG DÂN\nSố: 001088019482\nHọ và tên: NGUYỄN VĂN A\nNgày sinh: 15/05/1988\nQuê quán: Hà Nội\nNơi thường trú: Phường Dịch Vọng Hậu, Cầu Giấy, Hà Nội\nGiá trị đến: 15/05/2038',
        },
        {
          id: 'DOC-03',
          name: 'Hop_dong_gop_von_hop_tac_dau_tu_so_88_2024.pdf',
          category: 'Chứng cứ vụ việc',
          size: '4.2 MB',
          pages: 12,
          uploadDate: '16/09/2026 09:22',
          signer: 'CTCP Đầu tư X (Dấu đỏ đại diện pháp luật)',
          ocrStatus: 'Hoàn tất',
          previewExcerpt:
            'HỢP ĐỒNG HỢP TÁC ĐẦU TƯ SỐ 88/2024/HĐGV\nDự án: Khu đô thị phức hợp Y - Hà Đông\nBên A: Công ty Cổ phần Đầu tư & Phát triển Đô thị X\nĐại diện: Ông Trần Văn B - Chức vụ: Tổng Giám đốc\nBên B: Ông Nguyễn Văn A\nĐiều 3: Số tiền góp vốn cam kết 3.500.000.000 VNĐ...',
        },
        {
          id: 'DOC-04',
          name: 'Sao_ke_uy_nhiem_chi_VCB_3.5_ty_dong.pdf',
          category: 'Tài liệu tài chính',
          size: '2.1 MB',
          pages: 5,
          uploadDate: '16/09/2026 09:24',
          signer: 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)',
          ocrStatus: 'Hoàn tất',
          previewExcerpt:
            'ỦY NHIỆM CHI / LỆNH CHUYỂN TIỀN\nNgày hạch toán: 22/11/2024\nTài khoản trích: 0021000987654 (Nguyễn Văn A)\nTài khoản thụ hưởng: 0011004567899 (CTCP Đầu tư X)\nSố tiền bằng số: 3.500.000.000 VND\nBằng chữ: Ba tỷ năm trăm triệu đồng chẵn\nNội dung: Góp vốn Đợt 1 Dự án Khu đô thị Y theo HĐ số 88/2024',
        },
        {
          id: 'DOC-05',
          name: 'Phieu_tiep_nhan_ho_so_TN_2026_00125.pdf',
          category: 'Văn bản hành chính',
          size: '420 KB',
          pages: 1,
          uploadDate: '16/09/2026 09:26',
          signer: 'Cán bộ Nguyễn Minh Anh (Chứng thư số GOVEX CA)',
          ocrStatus: 'Hoàn tất',
          previewExcerpt:
            'PHIẾU TIẾP NHẬN HỒ SƠ & HẸN TRẢ KẾT QUẢ\nMã hồ sơ tiếp nhận: TN-2026-00125\nBộ phận: Tiếp dân & Tiếp nhận Một cửa\nNgười tiếp nhận: Nguyễn Minh Anh - Cán bộ thụ lý\nThời hạn thông báo kết quả thụ lý: 10 ngày làm việc kể từ ngày nhận',
        },
      ]
    : [
        {
          id: 'DOC-01',
          name: 'Don_khieu_nai_boi_thuong_dat_LeVanHung.pdf',
          category: 'Đơn gốc tiếp nhận',
          size: '2.1 MB',
          pages: 4,
          uploadDate: '15/09/2026 09:18',
          signer: 'Lê Văn Hùng (Ký tươi)',
          ocrStatus: 'Hoàn tất',
          previewExcerpt:
            'ĐƠN KHIẾU NẠI\n(V/v: Xem xét lại đơn giá bồi thường đất khi thu hồi phục vụ Dự án nâng cấp mở rộng Quốc lộ 1A)\nKính gửi: Chủ tịch UBND thành phố Cần Thơ\nNgười khiếu nại: Lê Văn Hùng...',
        },
        {
          id: 'DOC-02',
          name: 'GCN_Quyen_su_dung_dat_Thua_45_To_12.pdf',
          category: 'Tài liệu đất đai',
          size: '3.8 MB',
          pages: 4,
          uploadDate: '15/09/2026 09:20',
          signer: 'Sở TN&MT TP. Cần Thơ',
          ocrStatus: 'Hoàn tất',
          previewExcerpt:
            'GIẤY CHỨNG NHẬN QUYỀN SỬ DỤNG ĐẤT, QUYỀN SỞ HỮU NHÀ Ở\nSố phát hành: CM 892100\nThửa đất số: 45, Tờ bản đồ số: 12\nĐịa chỉ: Phường An Khánh, Quận Ninh Kiều, TP. Cần Thơ\nDiện tích: 185.4 m² (Đất ở đô thị: 100m², Đất trồng cây lâu năm: 85.4m²)',
        },
        {
          id: 'DOC-03',
          name: 'Quyet_dinh_thu_hoi_dat_so_1422_QD_UBND.pdf',
          category: 'Quyết định hành chính',
          size: '1.9 MB',
          pages: 6,
          uploadDate: '15/09/2026 09:22',
          signer: 'UBND TP. Cần Thơ',
          ocrStatus: 'Hoàn tất',
          previewExcerpt:
            'QUYẾT ĐỊNH\nVề việc thu hồi đất để thực hiện Dự án nâng cấp mở rộng Quốc lộ 1A\nSố: 1422/QĐ-UBND ngày 20/06/2026 của UBND TP. Cần Thơ...',
        },
        {
          id: 'DOC-04',
          name: 'Phuong_an_boi_thuong_ho_tro_tai_dinh_cu.pdf',
          category: 'Phương án đền bù',
          size: '2.5 MB',
          pages: 8,
          uploadDate: '15/09/2026 09:24',
          signer: 'Hội đồng Bồi thường & GPMB',
          ocrStatus: 'Hoàn tất',
          previewExcerpt:
            'BẢNG TÍNH GIÁ TRỊ BỒI THƯỜNG, HỖ TRỢ\nHộ gia đình: Ông Lê Văn Hùng\nĐơn giá áp dụng: 18.500.000 đ/m²\nTổng giá trị bồi thường dự kiến: 3.429.900.000 đồng...',
        },
        {
          id: 'DOC-05',
          name: 'Giay_xac_nhan_nguon_goc_dat_UBND_Phuong.pdf',
          category: 'Xác nhận địa phương',
          size: '640 KB',
          pages: 2,
          uploadDate: '15/09/2026 09:26',
          signer: 'UBND Phường An Khánh',
          ocrStatus: 'Hoàn tất',
          previewExcerpt:
            'GIẤY XÁC NHẬN NGUỒN GỐC VÀ THỜI ĐIỂM SỬ DỤNG ĐẤT\nUBND Phường An Khánh xác nhận: Thửa đất số 45 sử dụng ổn định từ năm 1996, không có tranh chấp...',
        },
      ];

  const handleOpenPreview = (doc: DocItem) => {
    setSelectedDoc(doc);
    setShowPreviewModal(true);
    setPreviewZoom(100);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header Overview Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#004ac6] flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">folder</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-bold text-slate-900 tracking-tight uppercase font-headline-md">
                  DANH MỤC HỒ SƠ &amp; TÀI LIỆU ĐÍNH KÈM
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  05 tệp tin số hóa (10.4 MB)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Toàn bộ tài liệu đã được bóc tách nội dung bằng AI OCR đa tầng, đối soát dấu giáp lai và kiểm tra chữ ký số VGCA.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => alert('Đang tạo gói nén ZIP tải xuống toàn bộ 05 tệp tin...')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
              <span>Tải trọn bộ (.ZIP)</span>
            </button>
            <button
              type="button"
              onClick={() => alert('Chức năng tải thêm tài liệu bổ sung đã sẵn sàng.')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>Thêm tài liệu mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Danh sách 5 tài liệu chi tiết */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Tên tệp tin &amp; Loại tài liệu</th>
                <th className="py-3 px-4">Dung lượng / Số trang</th>
                <th className="py-3 px-4">Thời gian số hóa</th>
                <th className="py-3 px-4">Đơn vị / Người ký xác thực</th>
                <th className="py-3 px-4 text-center">Trạng thái AI OCR</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-[11.5px]">
              {documents.map((doc, idx) => (
                <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block hover:text-[#004ac6] cursor-pointer" onClick={() => handleOpenPreview(doc)}>
                          {doc.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 text-[10px] font-semibold border border-slate-200">
                          {doc.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    <div>{doc.size}</div>
                    <span className="text-[10px] text-slate-400">{doc.pages} trang</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{doc.uploadDate}</div>
                    <span className="text-[10px] text-slate-400">Tự động gắn mã hash</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{doc.signer}</div>
                    <div className="flex items-center gap-1 text-[10.5px] text-emerald-700 font-medium mt-0.5">
                      <span className="material-symbols-outlined text-[13px] text-emerald-600">verified_user</span>
                      <span>Chữ ký số hợp lệ</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Đã bóc tách 100%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(doc)}
                        className="p-1.5 rounded-lg text-[#004ac6] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors cursor-pointer"
                        title="Xem trước văn bản"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Đang tải tệp: ${doc.name}`)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Tải tệp xuống"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] text-[18px]">lock</span>
            <span>
              Tài liệu được lưu trữ an toàn trên kho lưu trữ điện tử chính phủ GOVEX Cloud, đáp ứng tiêu chuẩn an toàn thông tin cấp độ 3.
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">SHA-256 Verified • RSA-2048</span>
        </div>
      </div>

      {/* MODAL XEM TRƯỚC VĂN BẢN (PREVIEW PDF MODAL) */}
      {showPreviewModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-3.5 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#004ac6] text-[22px]">description</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedDoc.name}</h3>
                  <span className="text-[11px] text-slate-500">
                    {selectedDoc.category} • {selectedDoc.pages} trang • {selectedDoc.size}
                  </span>
                </div>
              </div>

              {/* Toolbar zoom & close */}
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.max(z - 15, 70))}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                    title="Thu nhỏ"
                  >
                    <span className="material-symbols-outlined text-base">zoom_out</span>
                  </button>
                  <span className="px-2 text-xs font-mono text-slate-700">{previewZoom}%</span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.min(z + 15, 160))}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                    title="Phóng to"
                  >
                    <span className="material-symbols-outlined text-base">zoom_in</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body: Document Content Preview with Watermark */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-200/70 flex justify-center">
              <div
                className="bg-white shadow-xl rounded-lg p-10 max-w-2xl w-full border border-slate-300 relative transition-all"
                style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
              >
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <span className="text-6xl font-extrabold rotate-[-30deg] text-slate-900 tracking-widest uppercase">
                    GOVEX TECH
                  </span>
                </div>

                {/* Preformatted text simulating scan/OCR preview */}
                <div className="font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {selectedDoc.previewExcerpt}
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Trang 1 / {selectedDoc.pages}</span>
                  <span>Đã kiểm định chữ ký số VGCA</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Người ký: <strong>{selectedDoc.signer}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Tải về ${selectedDoc.name}`)}
                  className="px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span>Tải bản gốc</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
