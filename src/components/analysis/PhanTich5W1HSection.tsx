// src/components/analysis/PhanTich5W1HSection.tsx
import React, { useState } from 'react';
import MoHinhHoa5W1HWidget from './MoHinhHoa5W1HWidget';

export type TrangThaiThongTin5W1H =
  | 'da_nhan_dien'        // Đã nhận diện
  | 'chua_de_cap'         // Chưa đề cập trong đơn
  | 'chua_doc_duoc'       // Chưa đọc được từ tài liệu
  | 'can_doi_chieu';      // Cần đối chiếu do thông tin chưa rõ hoặc mâu thuẫn

export interface ChiTiet5W1HItem {
  id: string;
  nhan: string;
  giaTri: string;
  trangThai: TrangThaiThongTin5W1H;
  nguonTrichXuat?: {
    fileIndex: number;
    fileName: string;
    trang?: number;
    doan?: string;
    highlightKey?: string;
  };
  canhBao?: string;
  ghiChuCanBo?: string;
}

export interface ThanhPhan5W1H {
  key: 'what' | 'who' | 'when' | 'where' | 'why' | 'how';
  tieuDe: string;
  tenTiengViet: string;
  moTa: string;
  icon: string;
  badgeColor: string;
  borderColor: string;
  bgLight: string;
  danhSachChiTiet: ChiTiet5W1HItem[];
  tomTatThanhPhan: string;
}

export interface PhanTich5W1HSectionProps {
  extractData: any;
  onNavigateToDocument: (fileIndex: number, highlightKey?: string) => void;
  onSelectHuongXuLy?: (huong: 'tiep-nhan' | 'chuyen' | 'ghep', note?: string) => void;
  showToast: (msg: string) => void;
  isAiReading?: boolean;
}

export const INITIAL_5W1H_DATA: ThanhPhan5W1H[] = [
  {
    key: 'what',
    tieuDe: 'What – Việc gì',
    tenTiengViet: 'Hành vi bị tố cáo & Hậu quả thiệt hại',
    moTa: 'Hành vi bị tố cáo, nội dung phản ánh, hậu quả hoặc thiệt hại được người tố cáo đề cập',
    icon: 'report_problem',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    borderColor: 'border-rose-200',
    bgLight: 'bg-rose-50/40',
    tomTatThanhPhan:
      'Hành vi cố ý làm trái trong bồi thường GPMB tại thửa đất số 48; tự ý cắt giảm 150m² đất và dìm đơn giá bồi thường; nghi vấn có hành vi vụ lợi, nhận hối lộ để trục lợi chênh lệch địa tô.',
    danhSachChiTiet: [
      {
        id: 'what-1',
        nhan: 'Hành vi chính bị tố cáo',
        giaTri:
          'Lợi dụng chức vụ quyền hạn lập phương án bồi thường sai thực tế, tự ý cắt giảm 150m² đất đền bù (từ 360m² xuống 210m²), áp giá đền bù thấp bất thường (2.5 triệu/m² thay vì 4.2 triệu/m²), có dấu hiệu thông đồng trục lợi chênh lệch địa tô dự án.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục III (Nội dung, hành vi bị tố cáo), Dòng 14-22',
          highlightKey: 'noiDung',
        },
        canhBao: 'Cần trưng cầu đối chiếu bản đồ địa chính gốc với thực địa hiện trạng thửa 48.',
      },
      {
        id: 'what-2',
        nhan: 'Hậu quả / Thiệt hại nêu trong đơn',
        giaTri:
          'Gia đình công dân bị thiệt hại ước tính hơn 1.250.000.000 VNĐ tiền bồi thường đất và đứng trước nguy cơ bị cưỡng chế thu hồi trắng đất mà không được xem xét bố trí tái định cư theo quy định.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục III, Dòng 23-28',
          highlightKey: 'noiDung',
        },
        canhBao: 'Số liệu thiệt hại do người tố cáo tự tính toán, chưa có kết luận giám định tài chính.',
      },
      {
        id: 'what-3',
        nhan: 'Hành vi cưỡng chế phá dỡ tài sản',
        giaTri:
          'Ngày 20/06/2026 huy động máy ủi san gạt cây trồng và phá dỡ mốc chỉ giới thửa đất khi chưa có quyết định cưỡng chế có hiệu lực pháp luật.',
        trangThai: 'can_doi_chieu',
        nguonTrichXuat: {
          fileIndex: 3,
          fileName: 'USB dữ liệu điện tử',
          doan: '12 file ảnh hiện trường & ghi âm đối thoại',
          highlightKey: 'taiLieu',
        },
        canhBao: 'Cần đối chiếu với hồ sơ cưỡng chế của UBND quận Hà Đông để xác minh tính hợp pháp.',
      },
    ],
  },
  {
    key: 'who',
    tieuDe: 'Who – Ai',
    tenTiengViet: 'Chủ thể đứng đơn & Đối tượng liên quan',
    moTa: 'Người tố cáo, người bị tố cáo, người làm chứng và các cá nhân, tổ chức liên quan',
    icon: 'groups',
    badgeColor: 'bg-blue-100 text-[#004ac6] border-blue-200',
    borderColor: 'border-blue-200',
    bgLight: 'bg-blue-50/40',
    tomTatThanhPhan:
      'Chủ thể đứng đơn gồm 02 công dân (Bà Vũ Thị Thanh & Ông Nguyễn Văn A) có nhân thân rõ ràng. Đối tượng bị tố cáo là ông Trần Văn B (Phó Trưởng phòng TN&MT) và Công ty CP X.',
    danhSachChiTiet: [
      {
        id: 'who-1',
        nhan: 'Người tố cáo (Đại diện chính)',
        giaTri:
          'Bà Vũ Thị Thanh, SN 15/08/1982, CCCD số 001082019482 (Cục Cảnh sát QLHC về TTXH cấp ngày 10/05/2021). Trú tại: Số 45 ngách 12 ngõ 84 Quang Trung, P. Quang Trung, Q. Hà Đông, Hà Nội. SĐT: 0983 123 456.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục I (Thông tin người làm đơn)',
          highlightKey: 'nguoiGui',
        },
      },
      {
        id: 'who-2',
        nhan: 'Người cùng đứng đơn',
        giaTri:
          'Ông Nguyễn Văn A, SN 12/04/1980, CCCD số 001088012345. Địa chỉ: Số 47 ngách 12 ngõ 84 Quang Trung, Hà Đông. Có chữ ký tươi và xác nhận đồng đứng đơn.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục I & Phần chữ ký trang cuối',
          highlightKey: 'nguoiGui',
        },
      },
      {
        id: 'who-3',
        nhan: 'Người bị tố cáo',
        giaTri:
          'Ông Trần Văn B – Chức vụ: Phó Trưởng phòng Tài nguyên & Môi trường quận Hà Đông kiêm Chủ tịch Hội đồng Bồi thường, hỗ trợ & TĐC Dự án Khu đô thị mới Y.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục II (Thông tin đối tượng bị tố cáo)',
          highlightKey: 'doiTuong',
        },
        canhBao: 'Xác định thẩm quyền: Thuộc diện cán bộ do UBND quận Hà Đông quản lý trực tiếp.',
      },
      {
        id: 'who-4',
        nhan: 'Doanh nghiệp liên quan bị phản ánh',
        giaTri:
          'Công ty Cổ phần Đầu tư Phát triển Đô thị X (MST: 0108293847), trụ sở tại Tòa nhà Stellar, Cầu Giấy, Hà Nội – Chủ đầu tư Dự án KĐT Y.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục II, Dòng 8-12',
          highlightKey: 'doiTuong',
        },
      },
      {
        id: 'who-5',
        nhan: 'Người làm chứng / Hộ dân xung quanh',
        giaTri:
          'Các hộ dân liền kề tại Tổ dân phố 4 phường Mộ Lao có chung diện tích thu hồi GPMB tại Dự án KĐT Y (trong đơn có nhắc đến nhưng chưa lập danh sách trích ngang cụ thể).',
        trangThai: 'can_doi_chieu',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục III, Đoạn 3',
          highlightKey: 'noiDung',
        },
        canhBao: 'Chưa có danh sách trích ngang người làm chứng. Cần yêu cầu người tố cáo cung cấp bổ sung khi thụ lý.',
      },
      {
        id: 'who-6',
        nhan: 'Luật sư / Đại diện ủy quyền',
        giaTri: 'Chưa có thông tin trong đơn (Công dân tự đứng tên làm đơn và trực tiếp liên hệ cơ quan tiếp nhận).',
        trangThai: 'chua_de_cap',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Không đề cập người đại diện pháp lý',
        },
      },
    ],
  },
  {
    key: 'when',
    tieuDe: 'When – Khi nào',
    tenTiengViet: 'Thời điểm & Các mốc thời gian liên quan',
    moTa: 'Thời điểm xảy ra sự việc, khoảng thời gian diễn ra, thời điểm phát hiện và các mốc thời gian',
    icon: 'schedule',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    borderColor: 'border-amber-200',
    bgLight: 'bg-amber-50/40',
    tomTatThanhPhan:
      'Sự việc diễn ra từ tháng 04/2025 đến tháng 06/2026. Đơn được nộp ngày 12/09/2026, bảo đảm còn thời hiệu tố cáo theo quy định Luật Tố cáo.',
    danhSachChiTiet: [
      {
        id: 'when-1',
        nhan: 'Khoảng thời gian diễn ra hành vi',
        giaTri: 'Từ ngày 15/04/2025 đến ngày 20/06/2026 (Kéo dài hơn 14 tháng qua nhiều đợt làm việc).',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục III, Dòng 2',
          highlightKey: 'thoiGian',
        },
      },
      {
        id: 'when-2',
        nhan: 'Thời điểm lập Biên bản kiểm đếm áp giá sai',
        giaTri: 'Ngày 18/05/2026 (Biên bản kiểm đếm ghi giảm diện tích từ 360m² xuống 210m²).',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 2,
          fileName: 'Biên bản kiểm đếm áp giá sai lệch',
          trang: 1,
          doan: 'Dòng tiêu đề và ngày tháng lập biên bản',
        },
      },
      {
        id: 'when-3',
        nhan: 'Thời điểm ban hành QĐ cưỡng chế số 142/QĐ-UBND',
        giaTri: 'Ngày 28/05/2026 do UBND quận Hà Đông ký ban hành.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục IV (Yêu cầu giải quyết), Yêu cầu số 2',
          highlightKey: 'yeuCau',
        },
      },
      {
        id: 'when-4',
        nhan: 'Thời điểm các cuộc đối thoại ghi âm',
        giaTri: 'Ngày 15/05/2026 và ngày 20/06/2026 (Chứa nội dung gợi ý tiền bôi trơn).',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 3,
          fileName: 'USB dữ liệu điện tử',
          doan: 'Tên file ghi âm Ghi_am_cuoc_gap_15-05-2026.wav và Ghi_am_doi_thoai_ubnd_20-06-2026.wav',
          highlightKey: 'taiLieu',
        },
        canhBao: 'Dữ liệu âm thanh cần được chuyển cho cơ quan chuyên môn giám định tính nguyên vẹn trước khi sử dụng.',
      },
      {
        id: 'when-5',
        nhan: 'Thời điểm nộp đơn tố cáo',
        giaTri: 'Ngày 12/09/2026 (Thời hiệu tố cáo còn hiệu lực theo Điều 3 Luật Tố cáo 2018).',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Phần mở đầu và ngày ký cuối đơn',
          highlightKey: 'ngayLamDon',
        },
      },
    ],
  },
  {
    key: 'where',
    tieuDe: 'Where – Ở đâu',
    tenTiengViet: 'Địa điểm xảy ra & Cơ quan, đơn vị liên quan',
    moTa: 'Địa điểm xảy ra sự việc, cơ quan, đơn vị hoặc địa chỉ có liên quan',
    icon: 'location_on',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    borderColor: 'border-emerald-200',
    bgLight: 'bg-emerald-50/40',
    tomTatThanhPhan:
      'Địa bàn xảy ra vụ việc tại Thửa đất số 48, tờ bản đồ 03, Dự án KĐT mới Y, phường Mộ Lao, quận Hà Đông. Trách nhiệm thuộc cơ quan quản lý đất đai địa phương.',
    danhSachChiTiet: [
      {
        id: 'where-1',
        nhan: 'Địa điểm xảy ra sự việc (Thực địa)',
        giaTri:
          'Thửa đất số 48, Tờ bản đồ số 03, Dự án Khu đô thị mới Y, phường Mộ Lao, quận Hà Đông, TP. Hà Nội.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 1,
          fileName: 'Trích lục quy hoạch 1/500 & bản đồ địa chính',
          trang: 1,
          doan: 'Khung thông tin thửa đất và tọa độ ranh giới',
          highlightKey: 'diaDiem',
        },
      },
      {
        id: 'where-2',
        nhan: 'Cơ quan, đơn vị bị tố cáo công tác',
        giaTri:
          'Phòng Tài nguyên và Môi trường quận Hà Đông & Hội đồng Bồi thường, hỗ trợ GPMB quận Hà Đông (Địa chỉ: Số 184 Quang Trung, Hà Đông, Hà Nội).',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục II, Dòng 3-6',
          highlightKey: 'doiTuong',
        },
      },
      {
        id: 'where-3',
        nhan: 'Trụ sở doanh nghiệp có quyền lợi liên quan',
        giaTri: 'Công ty Cổ phần X – Tòa nhà Stellar, phố Duy Tân, phường Dịch Vọng Hậu, quận Cầu Giấy, Hà Nội.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục II, Dòng 10-12',
          highlightKey: 'doiTuong',
        },
      },
      {
        id: 'where-4',
        nhan: 'Khu đất bố trí tái định cư',
        giaTri: 'Chưa có thông tin trong đơn (Phương án bồi thường chưa công khai vị trí cụ thể của ô đất tái định cư).',
        trangThai: 'chua_de_cap',
        nguonTrichXuat: {
          fileIndex: 2,
          fileName: 'Biên bản kiểm đếm áp giá',
          trang: 1,
          doan: 'Mục Tái định cư để trống',
        },
        canhBao: 'Cần yêu cầu Phòng TN&MT cung cấp bản đồ quy hoạch khu tái định cư phục vụ dự án KĐT Y.',
      },
    ],
  },
  {
    key: 'why',
    tieuDe: 'Why – Tại sao',
    tenTiengViet: 'Căn cứ & Lý do người tố cáo cho rằng có sai phạm',
    moTa: 'Lý do người tố cáo cho rằng có hành vi sai phạm, căn cứ hoặc tình tiết được trình bày trong đơn',
    icon: 'help_outline',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    borderColor: 'border-purple-200',
    bgLight: 'bg-purple-50/40',
    tomTatThanhPhan:
      'Người tố cáo căn cứ vào sự chênh lệch rõ ràng giữa Trích lục bản đồ 360m² với Biên bản ghi 210m² và đơn giá áp thấp hơn bảng giá Nhà nước; đồng thời viện dẫn file ghi âm đối thoại đòi tiền.',
    danhSachChiTiet: [
      {
        id: 'why-1',
        nhan: 'Căn cứ 1: Sai lệch diện tích đo đạc thực tế',
        giaTri:
          'Trích lục bản đồ địa chính 1/500 do Văn phòng Đăng ký đất đai cấp xác định thửa 48 có diện tích 360m² đất nông nghiệp trồng cây lâu năm, nhưng Hội đồng bồi thường chỉ lập hồ sơ bồi thường cho 210m², cắt giảm 150m² mà không có văn bản giải trình lý do hay quyết định thu hồi phần diện tích này.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 1,
          fileName: 'Trích lục quy hoạch 1/500',
          trang: 1,
          doan: 'Đối chiếu với Biên bản kiểm đếm ngày 18/05/2026',
        },
        canhBao: 'Cần xác minh xem 150m² chênh lệch có thuộc đất lưu không, đất hành lang giao thông hay đất mượn.',
      },
      {
        id: 'why-2',
        nhan: 'Căn cứ 2: Áp đơn giá bồi thường trái quy định',
        giaTri:
          'Áp đơn giá bồi thường 2.500.000 VNĐ/m² thấp hơn khung giá quy định của UBND TP Hà Nội áp dụng cho vị trí mặt đường nhánh tại phường Mộ Lao (4.200.000 VNĐ/m²), gây thiệt hại nghiêm trọng quyền lợi công dân.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 2,
          fileName: 'Biên bản kiểm đếm áp giá',
          trang: 1,
          doan: 'Bảng đối chiếu giá đất bồi thường',
        },
        canhBao: 'Cần tra cứu Quyết định ban hành bảng giá đất cụ thể của UBND TP tại thời điểm thu hồi đất.',
      },
      {
        id: 'why-3',
        nhan: 'Căn cứ 3: Nghi vấn hành vi nhận hối lộ, vụ lợi',
        giaTri:
          'Người tố cáo cho rằng ông Trần Văn B thông đồng với chủ đầu tư cố tình dìm giá đền bù để chuyển nhượng đất sạch giá rẻ cho doanh nghiệp và trong các buổi gặp gỡ có lời lẽ gợi ý công dân chi 200 triệu đồng "tiền bôi trơn" để lập lại phương án 360m².',
        trangThai: 'can_doi_chieu',
        nguonTrichXuat: {
          fileIndex: 3,
          fileName: 'USB dữ liệu điện tử',
          doan: 'Đoạn ghi âm ngày 15/05/2026 (Phút thứ 12:40 - 15:20)',
          highlightKey: 'taiLieu',
        },
        canhBao:
          'LƯU Ý NGHIỆP VỤ: Đây là lời trình bày một phía của công dân, chưa được cơ quan chức năng kết luận. Tuyệt đối không tự ý khẳng định có hành vi phạm tội nhận hối lộ khi chưa có kết luận điều tra.',
      },
    ],
  },
  {
    key: 'how',
    tieuDe: 'How – Như thế nào',
    tenTiengViet: 'Diễn biến sự việc theo trình tự thời gian & Phương thức',
    moTa: 'Diễn biến sự việc theo trình tự thời gian, phương thức thực hiện hành vi, cách thức phát hiện và tài liệu',
    icon: 'account_tree',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    borderColor: 'border-indigo-200',
    bgLight: 'bg-indigo-50/40',
    tomTatThanhPhan:
      'Diễn biến trải qua 6 bước từ đo đạc sơ bộ, lập biên bản sai lệch, ép ký nhận tiền, ban hành quyết định cưỡng chế và san ủi hiện trường. Đơn viện dẫn 4 tài liệu, chứng cứ đính kèm.',
    danhSachChiTiet: [
      {
        id: 'how-1',
        nhan: 'Trình tự diễn biến theo lời trình bày',
        giaTri:
          '• Bước 1 (15/04/2025): Tổ công tác đo đạc sơ bộ thửa đất số 48, ghi nhận 360m².\n• Bước 2 (18/05/2026): Lập Biên bản kiểm đếm rút xuống 210m², công dân từ chối ký biên bản.\n• Bước 3 (15/05 - 20/06/2026): Các cuộc gặp gỡ gợi ý đưa tiền để điều chỉnh số liệu diện tích.\n• Bước 4 (28/05/2026): UBND quận ban hành Quyết định cưỡng chế số 142/QĐ-UBND.\n• Bước 5 (20/06/2026): Đưa máy ủi vào san gạt hiện trường dù công dân đang gửi đơn khiếu nại.\n• Bước 6 (12/09/2026): Công dân làm đơn tố cáo khẩn cấp gửi cơ quan có thẩm quyền.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục III (Toàn bộ phần nội dung diễn biến)',
          highlightKey: 'noiDung',
        },
      },
      {
        id: 'how-2',
        nhan: 'Phương thức thực hiện hành vi theo đơn',
        giaTri:
          'Lợi dụng quy trình kiểm đếm đền bù GPMB; cố tình lập biên bản sai lệch số liệu thực tế; gây sức ép hành chính bằng biện pháp cưỡng chế nhằm buộc người dân nhận mức tiền thấp.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục III, Đoạn 2 & Đoạn 4',
          highlightKey: 'noiDung',
        },
        canhBao: 'Cần làm rõ thẩm quyền cá nhân của ông Trần Văn B trong quy trình ký duyệt phương án áp giá.',
      },
      {
        id: 'how-3',
        nhan: 'Tài liệu, chứng cứ được viện dẫn',
        giaTri:
          '1. Đơn tố cáo bản gốc có chữ ký tay và điểm chỉ;\n2. Trích lục bản đồ 1/500 và bản đồ địa chính thửa đất số 48;\n3. Biên bản kiểm đếm áp giá bồi thường có dấu hiệu sai lệch;\n4. USB chứa 02 đoạn ghi âm cuộc làm việc & 12 ảnh hiện trường san ủi.',
        trangThai: 'da_nhan_dien',
        nguonTrichXuat: {
          fileIndex: 0,
          fileName: 'Đơn tố cáo scan bản gốc',
          trang: 1,
          doan: 'Mục V (Danh mục tài liệu kèm theo)',
          highlightKey: 'taiLieu',
        },
      },
    ],
  },
];

export const PhanTich5W1HSection: React.FC<PhanTich5W1HSectionProps> = ({
  extractData,
  onNavigateToDocument,
  onSelectHuongXuLy,
  showToast,
  isAiReading = false,
}) => {
  const [data5W1H, setData5W1H] = useState<ThanhPhan5W1H[]>(INITIAL_5W1H_DATA);
  const [activeFilter, setActiveFilter] = useState<'all' | 'what' | 'who' | 'when' | 'where' | 'why' | 'how' | 'canh_bao'>('all');
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({
    what: true,
    who: true,
    when: true,
    where: true,
    why: true,
    how: true,
  });
  const [isEditing5W1H, setIsEditing5W1H] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [confirmedTime, setConfirmedTime] = useState<string | null>(null);
  const [officerReviewNote, setOfficerReviewNote] = useState<string>(
    'Đã đối chiếu 6 thành phần 5W1H với hồ sơ tài liệu gốc. Thửa 48 có căn cứ sai lệch diện tích 150m² giữa trích lục và biên bản. Dấu hiệu đòi tiền cần chuyển cơ quan chức năng giám định file ghi âm.'
  );

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setExpandedKeys({ what: true, who: true, when: true, where: true, why: true, how: true });
  };

  const collapseAll = () => {
    setExpandedKeys({ what: false, who: false, when: false, where: false, why: false, how: false });
  };

  // Tính toán thống kê trạng thái
  const allItems = data5W1H.flatMap((tp) => tp.danhSachChiTiet);
  const countDaNhanDien = allItems.filter((i) => i.trangThai === 'da_nhan_dien').length;
  const countCanDoiChieu = allItems.filter((i) => i.trangThai === 'can_doi_chieu').length;
  const countChuaDeCap = allItems.filter((i) => i.trangThai === 'chua_de_cap').length;
  const countChuaDocDuoc = allItems.filter((i) => i.trangThai === 'chua_doc_duoc').length;
  const countCanhBao = allItems.filter((i) => Boolean(i.canhBao)).length;

  const handleUpdateItemValue = (tpKey: string, itemId: string, newVal: string) => {
    setData5W1H((prev) =>
      prev.map((tp) => {
        if (tp.key !== tpKey) return tp;
        return {
          ...tp,
          danhSachChiTiet: tp.danhSachChiTiet.map((item) =>
            item.id === itemId ? { ...item, giaTri: newVal } : item
          ),
        };
      })
    );
  };

  const handleResetToAI = () => {
    setData5W1H(INITIAL_5W1H_DATA);
    setIsEditing5W1H(false);
    showToast('Đã khôi phục phân tích 5W1H về kết quả AI ban đầu');
  };

  const handleConfirm5W1H = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ngày ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    setIsConfirmed(true);
    setConfirmedTime(timeStr);
    setIsEditing5W1H(false);
    showToast('✓ Cán bộ đã xác nhận kết quả phân tích 5W1H!');
  };

  const renderBadgeTrangThai = (status: TrangThaiThongTin5W1H) => {
    switch (status) {
      case 'da_nhan_dien':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Đã nhận diện
          </span>
        );
      case 'can_doi_chieu':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <span className="material-symbols-outlined text-[12px] text-amber-600">warning</span>
            Cần đối chiếu
          </span>
        );
      case 'chua_de_cap':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <span className="material-symbols-outlined text-[12px] text-slate-400">help_outline</span>
            Chưa có thông tin trong đơn
          </span>
        );
      case 'chua_doc_duoc':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="material-symbols-outlined text-[12px] text-rose-600">error</span>
            Chưa đọc được từ tài liệu
          </span>
        );
    }
  };

  const filteredThanhPhan = data5W1H.filter((tp) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'canh_bao') {
      return tp.danhSachChiTiet.some((i) => Boolean(i.canhBao));
    }
    return tp.key === activeFilter;
  });

  return (
    <div className="space-y-4">
      {/* 1. EXECUTIVE SUMMARY & THỐNG KÊ 5W1H */}
      <div className="p-3.5 rounded-md bg-linear-to-r from-blue-50/90 via-slate-50 to-indigo-50/80 border border-blue-200/90 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#004ac6] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-[13px] uppercase tracking-tight flex items-center gap-2">
                <span>Phân tích nội dung đơn tố cáo (Mô hình 5W1H)</span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-[#004ac6] border border-blue-200">
                  AI Trợ lý pháp lý
                </span>
              </h3>
              <p className="text-[11px] text-slate-600">
                Tự động cấu trúc hóa nội dung từ kết quả OCR • Xác định thông tin còn thiếu &amp; Liên kết đối chiếu văn bản gốc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {isConfirmed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Đã xác nhận ({confirmedTime})
              </span>
            ) : isEditing5W1H ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing5W1H(false);
                    showToast('Đã lưu thay đổi nội dung phân tích 5W1H');
                  }}
                  className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#004ac6] hover:bg-[#003ea8] text-white cursor-pointer shadow-xs transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">check</span>
                  Lưu chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={handleResetToAI}
                  className="px-2 py-1 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer border border-slate-300 transition-colors"
                >
                  Khôi phục AI
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing5W1H(true)}
                  className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                  title="Cho phép cán bộ chỉnh sửa nội dung phân tích (không làm thay đổi dữ liệu OCR gốc)"
                >
                  <span className="material-symbols-outlined text-[13px]">edit_note</span>
                  Chỉnh sửa 5W1H
                </button>
                <button
                  type="button"
                  onClick={handleConfirm5W1H}
                  className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs transition-colors flex items-center gap-1"
                  title="Xác nhận kết quả phân tích 5W1H để đưa vào hồ sơ thụ lý"
                >
                  <span className="material-symbols-outlined text-[13px]">task_alt</span>
                  Xác nhận 5W1H
                </button>
              </>
            )}
          </div>
        </div>

        {/* Thẻ thống kê các chỉ số nhận diện */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] pt-1">
          <div className="p-2 rounded bg-white border border-slate-200/80">
            <span className="text-[10px] text-slate-500 block">Tổng số chi tiết</span>
            <strong className="text-slate-900 font-bold text-[13px]">{allItems.length} chi tiết</strong>
          </div>
          <div className="p-2 rounded bg-white border border-emerald-200">
            <span className="text-[10px] text-emerald-700 font-medium block">✓ Đã nhận diện</span>
            <strong className="text-emerald-800 font-bold text-[13px]">{countDaNhanDien} mục</strong>
          </div>
          <div className="p-2 rounded bg-white border border-amber-200">
            <span className="text-[10px] text-amber-800 font-medium block">⚠ Cần đối chiếu</span>
            <strong className="text-amber-800 font-bold text-[13px]">{countCanDoiChieu} mục</strong>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Chưa đề cập</span>
            <strong className="text-slate-700 font-bold text-[13px]">{countChuaDeCap} mục</strong>
          </div>
          <div className="p-2 rounded bg-white border border-rose-200">
            <span className="text-[10px] text-rose-700 font-medium block">Cảnh báo nghiệp vụ</span>
            <strong className="text-rose-800 font-bold text-[13px]">{countCanhBao} cảnh báo</strong>
          </div>
        </div>

        {/* Tóm tắt bản chất sự việc */}
        <div className="p-2.5 rounded bg-white border border-slate-200 text-[11.5px] space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10.5px]">
            <span className="font-bold uppercase tracking-tight text-slate-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#004ac6]">summarize</span>
              Tóm tắt bản chất sự việc theo 5W1H (Executive Summary)
            </span>
            <span className="text-emerald-700 font-semibold">Độ tin cậy tổng hợp: 96.2%</span>
          </div>
          <p className="text-slate-800 leading-relaxed text-justify">
            Đơn của <strong>Bà Vũ Thị Thanh &amp; Ông Nguyễn Văn A</strong> (địa chỉ Hà Đông) tố cáo <strong>Ông Trần Văn B</strong> (Phó Trưởng phòng TN&amp;MT quận Hà Đông kiêm Chủ tịch HĐ Bồi thường GPMB) trong khoảng thời gian từ tháng 04/2025 đến 06/2026 có hành vi cố ý làm trái trong công tác bồi thường GPMB tại <strong>thửa đất số 48 (Dự án KĐT mới Y, Mộ Lao)</strong>, tự ý giảm diện tích từ <strong>360m² xuống 210m²</strong> (thiếu 150m²) và áp đơn giá thấp bất thường (2.5 triệu/m² thay vì 4.2 triệu/m²). Người tố cáo cho rằng hành vi trên có sự thông đồng với Công ty CP X và có dấu hiệu đòi tiền bôi trơn.
          </p>
        </div>
      </div>

      {/* KHỐI MÔ HÌNH HÓA THỰC THỂ 5W1H THEO YÊU CẦU */}
      <MoHinhHoa5W1HWidget
        extractData={extractData}
        onNavigateToDocument={onNavigateToDocument}
        onSelectComponent={(key) => setActiveFilter(key as any)}
      />

      {/* 2. THANH CÔNG CỤ LỌC THÀNH PHẦN 5W1H */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded text-[11px]">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-slate-500 font-medium mr-1 text-[10.5px]">Lọc thành phần:</span>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-2 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#004ac6] text-white font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tất cả (6)
          </button>
          {data5W1H.map((tp) => (
            <button
              key={tp.key}
              type="button"
              onClick={() => setActiveFilter(tp.key)}
              className={`px-2 py-0.5 rounded font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                activeFilter === tp.key
                  ? 'bg-slate-800 text-white font-bold'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{tp.key.toUpperCase()}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setActiveFilter('canh_bao')}
            className={`px-2 py-0.5 rounded font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
              activeFilter === 'canh_bao'
                ? 'bg-rose-700 text-white font-bold'
                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">warning</span>
            <span>Mục cảnh báo ({countCanhBao})</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-[10.5px]">
          <button
            type="button"
            onClick={expandAll}
            className="text-slate-600 hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-slate-200/70 cursor-pointer"
          >
            Mở rộng tất cả
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-slate-600 hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-slate-200/70 cursor-pointer"
          >
            Thu gọn tất cả
          </button>
        </div>
      </div>

      {/* 3. DANH SÁCH 6 THÀNH PHẦN 5W1H */}
      <div className="space-y-3">
        {filteredThanhPhan.map((tp) => {
          const isExpanded = expandedKeys[tp.key] ?? true;

          return (
            <div
              key={tp.key}
              className={`rounded-md border ${tp.borderColor} bg-white overflow-hidden shadow-2xs transition-all`}
            >
              {/* Header thành phần */}
              <div
                onClick={() => toggleExpand(tp.key)}
                className={`p-2.5 ${tp.bgLight} flex items-center justify-between cursor-pointer border-b ${tp.borderColor} select-none`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[17px] text-slate-700 shrink-0">
                    {tp.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-[12.5px] uppercase tracking-tight">
                        {tp.tieuDe}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">
                        — {tp.tenTiengViet}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${tp.badgeColor}`}>
                        {tp.danhSachChiTiet.length} thông tin
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
              </div>

              {/* Body thành phần */}
              {isExpanded && (
                <div className="divide-y divide-slate-100 text-[11.5px]">
                  {/* Tóm lược AI của thành phần */}
                  <div className="p-2.5 bg-slate-50/50 flex items-start gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight shrink-0 mt-0.5">
                      Tóm lược AI:
                    </span>
                    <p className="text-slate-700 italic leading-snug flex-1">
                      {tp.tomTatThanhPhan}
                    </p>
                  </div>

                  {/* Danh sách các chi tiết con */}
                  {tp.danhSachChiTiet.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 hover:bg-slate-50/70 transition-colors space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <strong className="text-slate-900 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          <span>{item.nhan}</span>
                        </strong>
                        <div className="flex items-center gap-1.5">
                          {renderBadgeTrangThai(item.trangThai)}
                        </div>
                      </div>

                      {/* Nội dung giá trị */}
                      <div>
                        {isEditing5W1H ? (
                          <textarea
                            rows={item.giaTri.length > 120 ? 3 : 2}
                            value={item.giaTri}
                            onChange={(e) => handleUpdateItemValue(tp.key, item.id, e.target.value)}
                            className="w-full p-2 bg-blue-50/30 border border-blue-300 rounded text-[11.5px] text-slate-900 focus:outline-none focus:bg-white resize-none"
                          />
                        ) : (
                          <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                            {item.giaTri}
                          </p>
                        )}
                      </div>

                      {/* Nguồn thông tin trích xuất & Nút liên kết xem tài liệu gốc */}
                      {item.nguonTrichXuat && (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-slate-50 border border-slate-200/70 text-[10.5px]">
                          <div className="flex items-center gap-1.5 text-slate-600 min-w-0 flex-1">
                            <span className="material-symbols-outlined text-[13px] text-[#004ac6] shrink-0">
                              menu_book
                            </span>
                            <span className="font-semibold text-slate-700">Nguồn trích xuất:</span>
                            <span className="truncate">
                              {item.nguonTrichXuat.fileName}
                              {item.nguonTrichXuat.trang ? ` (Trang ${item.nguonTrichXuat.trang})` : ''}
                              {item.nguonTrichXuat.doan ? ` • ${item.nguonTrichXuat.doan}` : ''}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              onNavigateToDocument(
                                item.nguonTrichXuat!.fileIndex,
                                item.nguonTrichXuat!.highlightKey
                              )
                            }
                            className="px-2 py-0.5 rounded font-semibold text-[#004ac6] bg-white hover:bg-blue-50 border border-blue-200 cursor-pointer shadow-2xs transition-colors flex items-center gap-1 shrink-0"
                            title="Chuyển sang tài liệu gốc bên trái và làm nổi bật đoạn văn tương ứng"
                          >
                            <span className="material-symbols-outlined text-[12px]">visibility</span>
                            <span>Xem vị trí trên tài liệu gốc ↗</span>
                          </button>
                        </div>
                      )}

                      {/* Hộp cảnh báo / Nội dung cần cán bộ kiểm tra */}
                      {item.canhBao && (
                        <div className="p-2 rounded bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-amber-700 shrink-0 mt-0.5">
                            warning
                          </span>
                          <div className="flex-1">
                            <strong className="text-amber-900 font-semibold">Cần kiểm tra: </strong>
                            <span>{item.canhBao}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. BẢNG TỔNG HỢP CẢNH BÁO & ĐIỂM CẦN XÁC MINH NGHIỆP VỤ */}
      <div className="p-3.5 rounded-md bg-white border border-amber-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-amber-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[17px] text-amber-700">fact_check</span>
            <h4 className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
              Cảnh báo &amp; Các điểm mâu thuẫn cần cán bộ kiểm tra xác minh
            </h4>
          </div>
          <span className="text-[10.5px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
            03 điểm trọng tâm
          </span>
        </div>

        <ul className="space-y-1.5 text-[11.5px] text-slate-800">
          <li className="flex items-start gap-2 p-1.5 rounded hover:bg-amber-50/50">
            <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              1
            </span>
            <div>
              <strong className="text-slate-900 font-semibold">Mâu thuẫn diện tích đất (150m²): </strong>
              <span>
                Trích lục bản đồ địa chính ghi nhận 360m², nhưng Biên bản kiểm đếm lập 210m². Cần yêu cầu Chi nhánh Văn phòng Đăng ký đất đai quận Hà Đông cung cấp hồ sơ kỹ thuật thửa đất gốc để làm rõ diện tích giảm có phải do thu hồi trước đó hay do sai số đo đạc.
              </span>
            </div>
          </li>
          <li className="flex items-start gap-2 p-1.5 rounded hover:bg-amber-50/50">
            <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              2
            </span>
            <div>
              <strong className="text-slate-900 font-semibold">Nghi vấn hành vi tiêu cực, nhận hối lộ: </strong>
              <span>
                Nội dung đòi tiền 200 triệu đồng chỉ là lời khai đơn phương của người tố cáo và các đoạn ghi âm trong USB chưa qua giám định tư pháp. Theo quy chế phối hợp, nếu có dấu hiệu tội phạm hình sự, cần lập hồ sơ chuyển cơ quan CSĐT phối hợp xác minh.
              </span>
            </div>
          </li>
          <li className="flex items-start gap-2 p-1.5 rounded hover:bg-amber-50/50">
            <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              3
            </span>
            <div>
              <strong className="text-slate-900 font-semibold">Tình trạng cưỡng chế thực địa: </strong>
              <span>
                Đang có mâu thuẫn về việc san ủi hiện trường ngày 20/06/2026 trong khi công dân đang thực hiện quyền khiếu nại, tố cáo. Cần yêu cầu UBND phường Mộ Lao tạm dừng các biện pháp tác động thực địa để chờ kết luận xác minh.
              </span>
            </div>
          </li>
        </ul>
      </div>

      {/* 5. GHI CHÚ ĐỐI SOÁT & XÁC NHẬN CỦA CÁN BỘ */}
      <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-[#004ac6]">edit_note</span>
            <span>Ý kiến đánh giá kết quả 5W1H của cán bộ tiếp nhận</span>
          </label>
          <span className="text-[10px] text-slate-500">Lưu độc lập vào hồ sơ xử lý</span>
        </div>
        <textarea
          rows={2}
          value={officerReviewNote}
          onChange={(e) => setOfficerReviewNote(e.target.value)}
          placeholder="Nhập ghi chú đối soát của cán bộ về kết quả 5W1H..."
          className="w-full p-2 bg-white border border-slate-200 rounded text-[11.5px] text-slate-800 focus:outline-none focus:border-blue-500 transition-all resize-none"
        />
        <div className="flex items-center justify-between text-[10.5px] text-slate-500">
          <span>Dữ liệu 5W1H được dùng làm căn cứ bổ trợ cho đề xuất hướng xử lý tại Mục 4 bên dưới</span>
          {!isConfirmed && (
            <button
              type="button"
              onClick={handleConfirm5W1H}
              className="text-[#004ac6] hover:underline font-bold cursor-pointer"
            >
              ✓ Xác nhận lưu kết quả
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhanTich5W1HSection;
