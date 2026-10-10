import React, { useState, useEffect, useRef } from 'react';
import { DonDetail } from '../../types';
import { VanBanXacMinhItem } from '../modals/XacMinhVaDeXuatModal';
import { SigningDocument, SigningStatus } from '../../types/signing';
import { BaoCaoDeXuatFormData } from '../modals/TaoBaoCaoDeXuatModal';

export interface TabTaiLieuProps {
  currentDon: DonDetail;
  onDocCountChange?: (count: number) => void;
  initialEditingDoc?: {
    id?: string;
    loai?: 'giay_moi' | 'bien_ban' | 'cong_van' | 'quyet_dinh' | 'thong_bao' | 'file_scan' | string;
    soHieu: string;
    tenVanBan: string;
    category?: string;
    ngayLap?: string;
    coQuanBanHanh?: string;
    nguoiNhan?: string;
    diaDiem?: string;
    thoiGianHen?: string;
    trichYeu?: string;
    noiDungChiTiet?: string;
    signer?: string;
    trangThai?: 'du_thao' | 'da_ban_hanh' | 'da_dinh_kem';
    fromXacMinh?: boolean;
  } | null;
  onClearInitialEditingDoc?: () => void;
  onReturnToXacMinh?: () => void;
  sharedVanBanList?: VanBanXacMinhItem[];
  onUpdateSharedVanBanList?: (list: VanBanXacMinhItem[] | ((prev: VanBanXacMinhItem[]) => VanBanXacMinhItem[])) => void;
  signingDocuments?: SigningDocument[];
  onUpdateSigningDocuments?: React.Dispatch<React.SetStateAction<SigningDocument[]>>;
  onOpenBaoCaoDeXuat?: (doc?: any) => void;
  onTrinhKyBaoCao?: (docId?: string, updatedDoc?: SigningDocument) => void;
}

export interface DocItem {
  id: string;
  name: string;
  category: string;
  soHieu?: string;
  size: string;
  pages: number;
  uploadDate: string;
  signer: string;
  coQuanBanHanh?: string;
  stepBelongsTo?: string;
  ocrStatus: 'Hoàn tất' | 'Đang xử lý';
  previewExcerpt: string;
  isProcessDoc?: boolean;
  isEditable?: boolean;
  loaiVanBan?: 'giay_moi' | 'bien_ban' | 'cong_van' | 'quyet_dinh' | 'thong_bao' | 'khac' | 'bao_cao_de_xuat' | 'bao_cao_xac_minh';
  tenVanBan?: string;
  nguoiNhan?: string;
  diaDiem?: string;
  thoiGianHen?: string;
  trichYeu?: string;
  noiDungChiTiet?: string;
  trangThai?: 'du_thao' | 'da_ban_hanh' | 'da_dinh_kem';
  fromXacMinh?: boolean;
  signingStatus?: SigningStatus;
  formData?: any;
  canCuPhapLy?: string;
  lyDoChinh?: string;
  lyDoChiTiet?: string;
  fileUrl?: string;
}

export interface StepDocTemplate {
  id: string;
  stepNumber: number;
  stepTitle: string;
  docTitle: string;
  docCode: string;
  loaiVanBan: 'giay_moi' | 'bien_ban' | 'cong_van' | 'quyet_dinh' | 'thong_bao' | 'bao_cao_de_xuat' | 'khac';
  category: string;
  isBaoCao?: boolean;
  trichYeu: string;
  nguoiNhan?: string;
  thoiGian?: string;
  diaDiem?: string;
  noiDung: string;
}

export const WORKFLOW_STEPS_DOCS: StepDocTemplate[] = [
  // BƯỚC 1: Tiếp nhận & Phân loại
  {
    id: 'step1-01',
    stepNumber: 1,
    stepTitle: 'Tiếp nhận & Phân loại',
    docTitle: 'Phiếu đề xuất phân loại & xử lý đơn',
    docCode: '01/PĐX-TCD',
    loaiVanBan: 'quyet_dinh',
    category: 'Phiếu đề xuất',
    trichYeu: 'Đề xuất phân loại thẩm quyền và hình thức xử lý đơn ban đầu',
    nguoiNhan: 'Lãnh đạo đơn vị tiếp công dân / xử lý đơn',
    thoiGian: 'Ngày tiếp nhận đơn',
    noiDung: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nPHIẾU ĐỀ XUẤT XỬ LÝ ĐƠN\nSố: 01/PĐX-TCD\n\nKính gửi: Lãnh đạo đơn vị\nCán bộ tiếp nhận báo cáo kết quả kiểm tra sơ bộ hồ sơ đơn:\n1. Người nộp đơn: Cung cấp đầy đủ thông tin định danh cá nhân.\n2. Nội dung đơn: Phản ánh, khiếu nại, tố giác vụ việc trên địa bàn.\n3. Đề xuất: Phân loại đơn thuộc thẩm quyền thụ lý xác minh làm rõ theo quy định.`,
  },
  {
    id: 'step1-02',
    stepNumber: 1,
    stepTitle: 'Tiếp nhận & Phân loại',
    docTitle: 'Giấy biên nhận tiếp nhận hồ sơ, tài liệu',
    docCode: '12/BN-TCD',
    loaiVanBan: 'bien_ban',
    category: 'Biên nhận hồ sơ',
    trichYeu: 'Biên nhận tiếp nhận đơn và các chứng cứ gốc của người gửi',
    nguoiNhan: 'Công dân nộp đơn',
    thoiGian: 'Giờ hành chính tiếp nhận',
    diaDiem: 'Bộ phận Tiếp công dân & Xử lý đơn',
    noiDung: `GIẤY BIÊN NHẬN HỒ SƠ TÀI LIỆU\nSố: 12/BN-TCD\n\nBộ phận Tiếp công dân đã tiếp nhận từ công dân các tài liệu gồm:\n1. Đơn chính (01 bản gốc có ký tên);\n2. Bản sao Căn cước công dân;\n3. Tài liệu chứng cứ, hình ảnh kèm theo.\nBiên nhận được lập thành 02 bản, giao người nộp đơn giữ 01 bản để đối chiếu.`,
  },

  // BƯỚC 2: Xác minh thông tin & Đề xuất
  {
    id: 'step2-01',
    stepNumber: 2,
    stepTitle: 'Xác minh thông tin & Đề xuất',
    docTitle: 'Báo cáo kết quả xác minh (Báo cáo đề xuất)',
    docCode: 'BC-CQĐT',
    loaiVanBan: 'bao_cao_de_xuat',
    category: 'Báo cáo đề xuất',
    isBaoCao: true,
    trichYeu: 'Báo cáo kết quả xác minh và đề xuất hướng xử lý giải quyết đơn',
    nguoiNhan: 'Thủ trưởng / Phó Thủ trưởng Cơ quan có thẩm quyền',
    thoiGian: 'Theo thời hạn phân công',
    noiDung: `BÁO CÁO KẾT QUẢ XÁC MINH\nVề việc giải quyết đơn theo quy định của pháp luật.\nTiến hành báo cáo kết quả xác minh, đánh giá nhận xét và đề xuất hướng xử lý: Thụ lý đơn / Chuyển thẩm quyền / Trả lời đơn / Yêu cầu bổ sung.`,
  },
  {
    id: 'step2-02',
    stepNumber: 2,
    stepTitle: 'Xác minh thông tin & Đề xuất',
    docTitle: 'Giấy mời làm việc, cung cấp chứng cứ',
    docCode: '18/GM-TCD',
    loaiVanBan: 'giay_moi',
    category: 'Giấy mời xác minh',
    trichYeu: 'Mời công dân có mặt làm việc, làm rõ nội dung đơn và bổ sung tài liệu',
    nguoiNhan: 'Người đứng tên trong đơn',
    thoiGian: '08:30 ngày làm việc tiếp theo',
    diaDiem: 'Phòng Tiếp công dân & Xử lý đơn',
    noiDung: `GIẤY MỜI LÀM VIỆC\nSố: 18/GM-TCD\n\nKính mời Ông/Bà có mặt tại Phòng Tiếp công dân để làm việc về nội dung đơn.\nKhi đi mang theo Căn cước công dân và toàn bộ bản chính tài liệu, chứng cứ có liên quan để đối chiếu, xác minh làm rõ theo quy định pháp luật.`,
  },
  {
    id: 'step2-03',
    stepNumber: 2,
    stepTitle: 'Xác minh thông tin & Đề xuất',
    docTitle: 'Biên bản làm việc xác minh ban đầu',
    docCode: '02/BB-XM',
    loaiVanBan: 'bien_ban',
    category: 'Biên bản làm việc',
    trichYeu: 'Ghi nhận ý kiến giải trình và giao nộp tài liệu chứng minh của đương sự',
    nguoiNhan: 'Công dân đứng đơn',
    thoiGian: 'Tại thời điểm làm việc',
    diaDiem: 'Phòng Tiếp công dân & Xử lý đơn',
    noiDung: `BIÊN BẢN LÀM VIỆC XÁC MINH\nSố: 02/BB-XM\n\nCán bộ đã tiến hành làm rõ các mốc thời gian, đối tượng có hành vi sai phạm được nêu trong đơn. Công dân khẳng định nội dung đơn gửi là hoàn toàn chính xác, cam kết chịu trách nhiệm trước pháp luật.\nBiên bản đọc lại cho các bên cùng nghe và ký tên xác nhận.`,
  },
  {
    id: 'step2-04',
    stepNumber: 2,
    stepTitle: 'Xác minh thông tin & Đề xuất',
    docTitle: 'Thông báo yêu cầu bổ sung thông tin, chứng cứ',
    docCode: '19/TB-TCD',
    loaiVanBan: 'thong_bao',
    category: 'Thông báo bổ sung',
    trichYeu: 'Yêu cầu người nộp bổ sung tài liệu, chứng cứ gốc trong thời hạn 10 ngày',
    nguoiNhan: 'Người làm đơn',
    thoiGian: 'Thời hạn 10 ngày làm việc',
    diaDiem: 'Bộ phận Tiếp nhận & Trả kết quả một cửa',
    noiDung: `THÔNG BÁO\nVề việc yêu cầu bổ sung thông tin, tài liệu chứng cứ\n\nĐể có cơ sở xem xét thụ lý giải quyết đơn, yêu cầu Ông/Bà bổ sung tài liệu chứng cứ chứng minh nội dung đơn trong thời hạn 10 ngày làm việc.`,
  },
  {
    id: 'step2-05',
    stepNumber: 2,
    stepTitle: 'Xác minh thông tin & Đề xuất',
    docTitle: 'Thông báo không thụ lý giải quyết đơn',
    docCode: 'TB-KTL/UBND',
    loaiVanBan: 'thong_bao',
    category: 'Thông báo không thụ lý',
    trichYeu: 'Thông báo không thụ lý giải quyết đơn theo Điều 29 Luật Tố cáo 2018',
    nguoiNhan: 'Người nộp đơn',
    thoiGian: 'Theo thời hạn luật định',
    diaDiem: 'UBND quận Cầu Giấy',
    noiDung: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nỦY BAN NHÂN DÂN QUẬN CẦU GIẤY\nSố: TB-KTL/2026/TB-UBND\n\nTHÔNG BÁO\nVề việc không thụ lý giải quyết tố cáo\n\nCăn cứ Điều 29 Luật Tố cáo 2018, Ủy ban nhân dân quận thông báo không thụ lý giải quyết nội dung đơn do không đủ điều kiện theo quy định của pháp luật.`,
  },

  // BƯỚC 3: Thụ lý & Phân công
  {
    id: 'step3-01',
    stepNumber: 3,
    stepTitle: 'Thụ lý & Phân công',
    docTitle: 'Thông báo thụ lý giải quyết đơn',
    docCode: '22/TB-TL',
    loaiVanBan: 'thong_bao',
    category: 'Thông báo thụ lý',
    trichYeu: 'Thông báo thụ lý chính thức và thời hạn giải quyết đơn theo luật định',
    nguoiNhan: 'Người làm đơn và các bên liên quan',
    thoiGian: 'Theo thời hạn luật định',
    diaDiem: 'Cơ quan có thẩm quyền',
    noiDung: `THÔNG BÁO THỤ LÝ GIẢI QUYẾT ĐƠN\nSố: 22/TB-TL\n\nCăn cứ quy định pháp luật; xét hồ sơ đơn;\nCơ quan thông báo chính thức thụ lý giải quyết nội dung đơn kể từ ngày ký thông báo này.\nThời hạn giải quyết theo đúng quy định của pháp luật.`,
  },
  {
    id: 'step3-02',
    stepNumber: 3,
    stepTitle: 'Thụ lý & Phân công',
    docTitle: 'Quyết định phân công Điều tra viên thụ lý',
    docCode: '42/QĐ-PC03',
    loaiVanBan: 'quyet_dinh',
    category: 'Quyết định tố tụng',
    trichYeu: 'Phân công Điều tra viên / Cán bộ chủ trì xác minh giải quyết',
    nguoiNhan: 'Điều tra viên được phân công, Viện Kiểm sát',
    thoiGian: 'Ngay khi ban hành',
    diaDiem: 'Cơ quan Cảnh sát điều tra',
    noiDung: `QUYẾT ĐỊNH\nPhân công Phó Thủ trưởng CQĐT và Điều tra viên giải quyết nguồn tin\n\nCăn cứ Điều 36, Điều 145 và Điều 146 Bộ luật Tố tụng hình sự 2015;\nPhân công Điều tra viên chính thụ lý xác minh làm rõ các dấu hiệu vi phạm và báo cáo đúng thời hạn.`,
  },
  {
    id: 'step3-03',
    stepNumber: 3,
    stepTitle: 'Thụ lý & Phân công',
    docTitle: 'Quyết định thành lập Tổ / Đoàn xác minh',
    docCode: '108/QĐ-UBND',
    loaiVanBan: 'quyet_dinh',
    category: 'Quyết định hành chính',
    trichYeu: 'Thành lập Tổ công tác kiểm tra, xác minh làm rõ vụ việc',
    nguoiNhan: 'Các thành viên Tổ xác minh, người bị tố cáo',
    thoiGian: 'Thời hạn xác minh 15 - 30 ngày',
    diaDiem: 'UBND quận/huyện',
    noiDung: `QUYẾT ĐỊNH\nVề việc thành lập Tổ xác minh nội dung đơn\n\nThành lập Tổ xác minh gồm các cán bộ chuyên môn chịu trách nhiệm xác minh, thu thập chứng cứ và báo cáo Thủ trưởng cơ quan.`,
  },

  // BƯỚC 4: Xác minh thực địa & Thu thập chứng cứ
  {
    id: 'step4-01',
    stepNumber: 4,
    stepTitle: 'Xác minh thực địa & Thu thập chứng cứ',
    docTitle: 'Công văn đề nghị phối hợp xác minh / cung cấp thông tin',
    docCode: '105/CV-CQĐT',
    loaiVanBan: 'cong_van',
    category: 'Công văn phối hợp',
    trichYeu: 'Đề nghị Văn phòng Đăng ký đất đai / Ngân hàng / Cơ quan liên quan cung cấp tài liệu',
    nguoiNhan: 'Cơ quan, tổ chức, ngân hàng liên quan',
    thoiGian: 'Thời hạn 05 ngày làm việc',
    diaDiem: 'Gửi qua Trục liên thông văn bản quốc gia',
    noiDung: `CÔNG VĂN ĐỀ NGHỊ PHỐI HỢP CUNG CẤP TÀI LIỆU\nSố: 105/CV-CQĐT\n\nĐể phục vụ công tác xác minh đơn đúng pháp luật, Cơ quan đề nghị Quý đơn vị tra soát và cung cấp toàn bộ hồ sơ, tài liệu liên quan theo danh sách gửi kèm.`,
  },
  {
    id: 'step4-02',
    stepNumber: 4,
    stepTitle: 'Xác minh thực địa & Thu thập chứng cứ',
    docTitle: 'Biên bản xác minh thực địa / hiện trường',
    docCode: '05/BB-TD',
    loaiVanBan: 'bien_ban',
    category: 'Biên bản hiện trường',
    trichYeu: 'Biên bản kiểm tra hiện trạng đất đai, công trình thực tế có sự chứng kiến',
    nguoiNhan: 'Chính quyền địa phương và các bên liên quan',
    thoiGian: 'Thời điểm kiểm tra hiện trường',
    diaDiem: 'Vị trí khu đất / công trình bị phản ánh',
    noiDung: `BIÊN BẢN XÁC MINH THỰC ĐỊA\nSố: 05/BB-TD\n\nTổ công tác đã có mặt tại hiện trường cùng đại diện chính quyền địa phương và các bên liên quan. Ghi nhận hiện trạng thực tế, đo đạc kích thước và lập sơ đồ hiện trạng đính kèm.`,
  },
  {
    id: 'step4-03',
    stepNumber: 4,
    stepTitle: 'Xác minh thực địa & Thu thập chứng cứ',
    docTitle: 'Biên bản ghi lời khai người có quyền & nghĩa vụ liên quan',
    docCode: '06/BB-LK',
    loaiVanBan: 'bien_ban',
    category: 'Biên bản ghi lời khai',
    trichYeu: 'Lấy lời khai của người có quyền, nghĩa vụ liên quan hoặc người làm chứng',
    nguoiNhan: 'Người làm chứng / Đương sự',
    thoiGian: 'Tại buổi làm việc',
    diaDiem: 'Trụ sở cơ quan thụ lý',
    noiDung: `BIÊN BẢN GHI LỜI KHAI\nSố: 06/BB-LK\n\nĐiều tra viên / Cán bộ đã tiến hành lấy lời khai đối với người có nghĩa vụ và quyền lợi liên quan. Lời khai đã được ghi nhận trung thực, đầy đủ và các bên ký xác nhận.`,
  },

  // BƯỚC 5: Kết luận & Ban hành
  {
    id: 'step5-01',
    stepNumber: 5,
    stepTitle: 'Kết luận & Ban hành',
    docTitle: 'Báo cáo kết luận nội dung xác minh',
    docCode: '25/KL-XM',
    loaiVanBan: 'quyet_dinh',
    category: 'Báo cáo kết luận',
    trichYeu: 'Báo cáo tổng hợp toàn diện kết quả xác minh làm căn cứ ra quyết định',
    nguoiNhan: 'Thủ trưởng cơ quan có thẩm quyền',
    thoiGian: 'Kết thúc thời hạn xác minh',
    diaDiem: 'Cơ quan thụ lý',
    noiDung: `BÁO CÁO KẾT LUẬN XÁC MINH\nSố: 25/KL-XM\n\nTổng hợp toàn bộ tài liệu, chứng cứ thu thập được trong quá trình xác minh; khẳng định nội dung đơn là đúng, đúng một phần hay sai toàn bộ; kiến nghị biện pháp xử lý theo quy định.`,
  },
  {
    id: 'step5-02',
    stepNumber: 5,
    stepTitle: 'Kết luận & Ban hành',
    docTitle: 'Quyết định giải quyết khiếu nại / tố cáo chính thức',
    docCode: '145/QĐ-GQ',
    loaiVanBan: 'quyet_dinh',
    category: 'Quyết định giải quyết',
    trichYeu: 'Quyết định giải quyết vụ việc có hiệu lực thi hành của Thủ trưởng cơ quan',
    nguoiNhan: 'Người nộp đơn, người bị khiếu nại/tố cáo, các cơ quan hữu quan',
    thoiGian: 'Ngày ban hành quyết định',
    diaDiem: 'Cơ quan có thẩm quyền ban hành',
    noiDung: `QUYẾT ĐỊNH GIẢI QUYẾT\nSố: 145/QĐ-GQ\n\nBan hành Quyết định giải quyết chính thức theo đúng trình tự pháp luật; giao các đơn vị liên quan tổ chức thực hiện và công khai kết quả.`,
  },
  {
    id: 'step5-03',
    stepNumber: 5,
    stepTitle: 'Kết luận & Ban hành',
    docTitle: 'Thông báo kết quả giải quyết đơn đến công dân',
    docCode: '30/TB-KQ',
    loaiVanBan: 'thong_bao',
    category: 'Thông báo kết quả',
    trichYeu: 'Thông báo kết quả xử lý giải quyết đến người nộp đơn',
    nguoiNhan: 'Người đứng tên nộp đơn',
    thoiGian: 'Cùng ngày ban hành quyết định',
    diaDiem: 'Gửi qua bưu điện bảo đảm / Cổng DVC',
    noiDung: `THÔNG BÁO KẾT QUẢ GIẢI QUYẾT ĐƠN\nSố: 30/TB-KQ\n\nCơ quan xin thông báo đến Ông/Bà kết quả giải quyết nội dung đơn kèm theo Quyết định giải quyết chính thức.`,
  },
];

export default function TabTaiLieu({
  currentDon,
  onDocCountChange,
  initialEditingDoc,
  onClearInitialEditingDoc,
  onReturnToXacMinh,
  sharedVanBanList,
  onUpdateSharedVanBanList,
  signingDocuments,
  onOpenBaoCaoDeXuat,
  onUpdateSigningDocuments,
  onTrinhKyBaoCao,
}: TabTaiLieuProps) {
  const isToGiac = currentDon.code.startsWith('Đ-2026') || currentDon.nguoiNop === 'Nguyễn Văn A';

  const initialDocs: DocItem[] = isToGiac
    ? [
      {
        id: 'DOC-XM-01',
        name: 'Giay_moi_lam_viec_so_18_GM_TCD.pdf',
        category: 'Giấy mời xác minh',
        soHieu: '18/GM-TCD',
        size: '380 KB',
        pages: 1,
        uploadDate: '16/09/2026 10:00',
        signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        coQuanBanHanh: 'Phòng Tiếp công dân & Xử lý đơn - UBND quận',
        stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
        loaiVanBan: 'giay_moi',
        nguoiNhan: currentDon.nguoiNop || 'Nguyễn Văn A',
        thoiGianHen: '08:30 ngày 18/09/2026',
        diaDiem: 'Phòng Tiếp công dân & Xử lý đơn (Phòng 102, Trụ sở UBND quận)',
        trichYeu: 'V/v Làm việc, cung cấp thông tin, tài liệu liên quan đến nội dung đơn',
        noiDungChiTiet: `Kính mời Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'} có mặt tại Phòng Tiếp công dân để làm việc về nội dung đơn đề ngày 16/09/2026.\nKhi đi mang theo Căn cước công dân và toàn bộ bản chính tài liệu, chứng cứ có liên quan đến việc phản ánh/tố cáo để đối chiếu, xác minh làm rõ theo quy định pháp luật.`,
        trangThai: 'da_ban_hanh',
        fromXacMinh: true,
        previewExcerpt: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nGIẤY MỜI LÀM VIỆC\nSố: 18/GM-TCD\nKính mời Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'} có mặt tại Phòng Tiếp công dân để làm việc...`,
      },
      {
        id: 'DOC-XM-02',
        name: 'Bien_ban_lam_viec_xac_minh_so_02_BB_XM.pdf',
        category: 'Biên bản làm việc',
        soHieu: '02/BB-XM',
        size: '520 KB',
        pages: 2,
        uploadDate: '17/09/2026 15:30',
        signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        coQuanBanHanh: 'Phòng Tiếp công dân & Xử lý đơn',
        stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
        loaiVanBan: 'bien_ban',
        nguoiNhan: `${currentDon.nguoiNop || 'Nguyễn Văn A'} (Người đứng đơn)`,
        thoiGianHen: '14:30 ngày 17/09/2026',
        diaDiem: 'Phòng Tiếp công dân & Xử lý đơn',
        trichYeu: 'Ghi nhận ý kiến trình bày và tiếp nhận tài liệu gốc của công dân',
        noiDungChiTiet: `Tại buổi làm việc, công dân ${currentDon.nguoiNop || 'Nguyễn Văn A'} khẳng định nội dung đơn gửi là hoàn toàn chính xác, cam kết chịu trách nhiệm trước pháp luật.\nCông dân đã giao nộp bản sao chứng thực Hợp đồng góp vốn, phiếu thu tiền và biên bản làm việc với Chi nhánh Văn phòng Đăng ký đất đai.\nCán bộ thụ lý đã tiếp nhận, kiểm tra tính pháp lý ban đầu và lập biên nhận bàn giao tài liệu phục vụ xác minh.`,
        trangThai: 'du_thao',
        fromXacMinh: true,
        previewExcerpt: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nBIÊN BẢN LÀM VIỆC XÁC MINH\nSố: 02/BB-XM\nTại buổi làm việc, công dân ${currentDon.nguoiNop || 'Nguyễn Văn A'} khẳng định nội dung đơn gửi là hoàn toàn chính xác...`,
      },
      {
        id: 'DOC-01',
        name: 'Don_to_giac_toi_pham_NguyenVanA_16092026.pdf',
        category: 'Đơn gốc tiếp nhận',
        soHieu: 'Đ-2026-00125',
        size: '1.8 MB',
        pages: 3,
        uploadDate: '16/09/2026 09:18',
        signer: 'Công dân Nguyễn Văn A (Ký tươi + VNeID)',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nĐƠN TỐ GIÁC TỘI PHẠM\n(V/v: Hành vi lừa đảo chiếm đoạt tài sản tại Dự án Khu đô thị Y)\n\nKính gửi: Cơ quan Cảnh sát điều tra - Công an thành phố Hà Nội\nTôi là: Nguyễn Văn A, sinh năm 1988...\nTôi làm đơn này tố giác ông Trần Văn B - Giám đốc CTCP X...',
      },
      {
        id: 'DOC-02',
        name: 'CCCD_gan_chip_cong_chung_001088019482.pdf',
        category: 'Định danh cá nhân',
        soHieu: '001088019482',
        size: '850 KB',
        pages: 2,
        uploadDate: '16/09/2026 09:20',
        signer: 'Bộ Công an (Xác thực CSDL Dân cư)',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'CĂN CƯỚC CÔNG DÂN\nSố: 001088019482\nHọ và tên: NGUYỄN VĂN A\nNgày sinh: 15/05/1988\nQuê quán: Hà Nội\nNơi thường trú: Phường Dịch Vọng Hậu, Cầu Giấy, Hà Nội\nGiá trị đến: 15/05/2038',
      },
      {
        id: 'DOC-03',
        name: 'Hop_dong_gop_von_hop_tac_dau_tu_so_88_2024.pdf',
        category: 'Chứng cứ vụ việc',
        soHieu: '88/2024/HĐGV',
        size: '4.2 MB',
        pages: 12,
        uploadDate: '16/09/2026 09:22',
        signer: 'CTCP Đầu tư X (Dấu đỏ đại diện pháp luật)',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'HỢP ĐỒNG HỢP TÁC ĐẦU TƯ SỐ 88/2024/HĐGV\nDự án: Khu đô thị phức hợp Y - Hà Đông\nBên A: Công ty Cổ phần Đầu tư & Phát triển Đô thị X\nĐại diện: Ông Trần Văn B - Chức vụ: Tổng Giám đốc\nBên B: Ông Nguyễn Văn A\nĐiều 3: Số tiền góp vốn cam kết 3.500.000.000 VNĐ...',
      },
      {
        id: 'DOC-04',
        name: 'Sao_ke_uy_nhiem_chi_VCB_3.5_ty_dong.pdf',
        category: 'Tài liệu tài chính',
        soHieu: 'VCB-987654',
        size: '2.1 MB',
        pages: 5,
        uploadDate: '16/09/2026 09:24',
        signer: 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'ỦY NHIỆM CHI / LỆNH CHUYỂN TIỀN\nNgày hạch toán: 22/11/2024\nTài khoản trích: 0021000987654 (Nguyễn Văn A)\nTài khoản thụ hưởng: 0011004567899 (CTCP Đầu tư X)\nSố tiền bằng số: 3.500.000.000 VND\nBằng chữ: Ba tỷ năm trăm triệu đồng chẵn\nNội dung: Góp vốn Đợt 1 Dự án Khu đô thị Y theo HĐ số 88/2024',
      },
      {
        id: 'DOC-05',
        name: 'Phieu_tiep_nhan_ho_so_TN_2026_00125.pdf',
        category: 'Văn bản hành chính',
        soHieu: 'TN-2026-00125',
        size: '420 KB',
        pages: 1,
        uploadDate: '16/09/2026 09:26',
        signer: 'Cán bộ Nguyễn Minh Anh (Chứng thư số GOVEX CA)',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        stepBelongsTo: 'Bước 1: Tiếp nhận & Vào sổ',
        previewExcerpt:
          'PHIẾU TIẾP NHẬN HỒ SƠ & HẸN TRẢ KẾT QUẢ\nMã hồ sơ tiếp nhận: TN-2026-00125\nBộ phận: Tiếp dân & Tiếp nhận Một cửa\nNgười tiếp nhận: Nguyễn Minh Anh - Cán bộ thụ lý\nThời hạn thông báo kết quả thụ lý: 10 ngày làm việc kể từ ngày nhận',
      },
      {
        id: 'DOC-06',
        name: 'Quyet_dinh_phan_cong_dieu_tra_vien_so_42_QD_PC03.pdf',
        category: 'Quyết định tố tụng',
        soHieu: '42/QĐ-PC03',
        size: '650 KB',
        pages: 2,
        uploadDate: '17/09/2026 10:15',
        signer: 'Thượng tá Trần Quốc Dũng (Phó Thủ trưởng CQĐT)',
        coQuanBanHanh: 'Cơ quan CSĐT Công an TP. Hà Nội',
        stepBelongsTo: 'Bước 3: Phân công Điều tra viên',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        previewExcerpt:
          'CƠ QUAN CSĐT CÔNG AN TP. HÀ NỘI\nSố: 42/QĐ-PC03\n\nQUYẾT ĐỊNH\nPhân công Phó Thủ trưởng CQĐT và Điều tra viên thụ lý giải quyết nguồn tin về tội phạm\n\nCăn cứ Điều 36, Điều 145 và Điều 146 Bộ luật Tố tụng hình sự năm 2015;\nCăn cứ Thông tư liên tịch số 01/2017/TTLT-BCA-BQP-BTC-BNN&PTNT-VKSNDTC;\nXét hồ sơ tố giác tội phạm số Đ-2026-00125 do công dân Nguyễn Văn A gửi;\n\nQUYẾT ĐỊNH:\nĐiều 1. Phân công Trung tá Lê Văn Nam - Điều tra viên Đội Cảnh sát kinh tế (PC03) thụ lý chính xác minh làm rõ hành vi có dấu hiệu lừa đảo chiếm đoạt tài sản.\nĐiều 2. Gửi Quyết định này đến Viện kiểm sát nhân dân thành phố Hà Nội theo quy định pháp luật.',
      },
    ]
    : [
      {
        id: 'DOC-01',
        name: 'Don_khieu_nai_boi_thuong_dat_LeVanHung.pdf',
        category: 'Đơn gốc tiếp nhận',
        soHieu: 'KN-2026-0045',
        size: '2.1 MB',
        pages: 4,
        uploadDate: '15/09/2026 09:18',
        signer: 'Lê Văn Hùng (Ký tươi)',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'ĐƠN KHIẾU NẠI\n(V/v: Xem xét lại đơn giá bồi thường đất khi thu hồi phục vụ Dự án nâng cấp mở rộng Quốc lộ 1A)\nKính gửi: Chủ tịch UBND thành phố Cần Thơ\nNgười khiếu nại: Lê Văn Hùng...',
      },
      {
        id: 'DOC-02',
        name: 'GCN_Quyen_su_dung_dat_Thua_45_To_12.pdf',
        category: 'Tài liệu đất đai',
        soHieu: 'CM-892100',
        size: '3.8 MB',
        pages: 4,
        uploadDate: '15/09/2026 09:20',
        signer: 'Sở TN&MT TP. Cần Thơ',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'GIẤY CHỨNG NHẬN QUYỀN SỬ DỤNG ĐẤT, QUYỀN SỞ HỮU NHÀ Ở\nSố phát hành: CM 892100\nThửa đất số: 45, Tờ bản đồ số: 12\nĐịa chỉ: Phường An Khánh, Quận Ninh Kiều, TP. Cần Thơ\nDiện tích: 185.4 m² (Đất ở đô thị: 100m², Đất trồng cây lâu năm: 85.4m²)',
      },
      {
        id: 'DOC-03',
        name: 'Quyet_dinh_thu_hoi_dat_so_1422_QD_UBND.pdf',
        category: 'Quyết định hành chính',
        soHieu: '1422/QĐ-UBND',
        size: '1.9 MB',
        pages: 6,
        uploadDate: '15/09/2026 09:22',
        signer: 'UBND TP. Cần Thơ',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'QUYẾT ĐỊNH\nVề việc thu hồi đất để thực hiện Dự án nâng cấp mở rộng Quốc lộ 1A\nSố: 1422/QĐ-UBND ngày 20/06/2026 của UBND TP. Cần Thơ...',
      },
      {
        id: 'DOC-04',
        name: 'Phuong_an_boi_thuong_ho_tro_tai_dinh_cu.pdf',
        category: 'Phương án đền bù',
        soHieu: 'PA-2026-BT',
        size: '2.5 MB',
        pages: 8,
        uploadDate: '15/09/2026 09:24',
        signer: 'Hội đồng Bồi thường & GPMB',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'BẢNG TÍNH GIÁ TRỊ BỒI THƯỜNG, HỖ TRỢ\nHộ gia đình: Ông Lê Văn Hùng\nĐơn giá áp dụng: 18.500.000 đ/m²\nTổng giá trị bồi thường dự kiến: 3.429.900.000 đồng...',
      },
      {
        id: 'DOC-05',
        name: 'Giay_xac_nhan_nguon_goc_dat_UBND_Phuong.pdf',
        category: 'Xác nhận địa phương',
        soHieu: '45/XN-UBND',
        size: '640 KB',
        pages: 2,
        uploadDate: '15/09/2026 09:26',
        signer: 'UBND Phường An Khánh',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'GIẤY XÁC NHẬN NGUỒN GỐC VÀ THỜI ĐIỂM SỬ DỤNG ĐẤT\nUBND Phường An Khánh xác nhận: Thửa đất số 45 sử dụng ổn định từ năm 1996, không có tranh chấp...',
      },
      {
        id: 'DOC-06',
        name: 'Thong_bao_thu_ly_giai_quyet_khieu_nai_so_18_TB_UBND.pdf',
        category: 'Thông báo thụ lý',
        soHieu: '18/TB-UBND',
        size: '520 KB',
        pages: 2,
        uploadDate: '16/09/2026 14:30',
        signer: 'Chủ tịch UBND quận Ninh Kiều',
        coQuanBanHanh: 'UBND quận Ninh Kiều',
        stepBelongsTo: 'Bước 2: Thông báo thụ lý khiếu nại',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        previewExcerpt:
          'ỦY BAN NHÂN DÂN QUẬN NINH KIỀU\nSố: 18/TB-UBND\n\nTHÔNG BÁO\nVề việc thụ lý giải quyết khiếu nại (Lần 1)\n\nKính gửi: Ông Lê Văn Hùng và bà Nguyễn Thị Mai\nĐịa chỉ: 142/8 Nguyễn Văn Cừ, Phường An Khánh, Ninh Kiều, Cần Thơ\n\nChủ tịch UBND quận Ninh Kiều thông báo thụ lý giải quyết đơn khiếu nại của ông/bà về việc yêu cầu nâng đơn giá bồi thường đất tại Thửa 45, Tờ bản đồ số 12.\nThời hạn giải quyết khiếu nại lần 1 là 30 ngày theo quy định tại Điều 28 Luật Khiếu nại 2011.',
      },
    ];

  const [documents, setDocuments] = useState<DocItem[]>(initialDocs);
  const [filterTab, setFilterTab] = useState<'all' | 'process' | 'initial'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // =========================================================================
  // STATE CHẾ ĐỘ SOẠN THẢO & CHỈNH SỬA VĂN BẢN TRỰC TIẾP (DIRECT A4 EDITOR)
  // =========================================================================
  const [activeEditingDoc, setActiveEditingDoc] = useState<DocItem | null>(null);

  // Các trường form trong Live Direct Document Editor
  const [editSoHieu, setEditSoHieu] = useState('');
  const [editTenVanBan, setEditTenVanBan] = useState('');
  const [editLoaiVanBan, setEditLoaiVanBan] = useState<'giay_moi' | 'bien_ban' | 'cong_van' | 'quyet_dinh' | 'thong_bao' | 'khac' | 'bao_cao_de_xuat' | 'bao_cao_xac_minh'>('giay_moi');
  const [editCategory, setEditCategory] = useState('');
  const [editNgayLap, setEditNgayLap] = useState('');
  const [editCoQuanCapTren, setEditCoQuanCapTren] = useState('ỦY BAN NHÂN DÂN QUẬN CẦU GIẤY');
  const [editCoQuanBanHanh, setEditCoQuanBanHanh] = useState('PHÒNG TIẾP CÔNG DÂN & XỬ LÝ ĐƠN');
  const [editNguoiNhan, setEditNguoiNhan] = useState('');
  const [editThoiGianHen, setEditThoiGianHen] = useState('');
  const [editDiaDiem, setEditDiaDiem] = useState('');
  const [editTrichYeu, setEditTrichYeu] = useState('');
  const [editNoiDungChiTiet, setEditNoiDungChiTiet] = useState('');
  const [editSigner, setEditSigner] = useState('Nguyễn Minh Anh');
  const [editChucVuSigner, setEditChucVuSigner] = useState('CÁN BỘ THỤ LÝ XÁC MINH');
  const [editTrangThai, setEditTrangThai] = useState<'du_thao' | 'da_ban_hanh'>('du_thao');
  const [editIsSignedVGCA, setEditIsSignedVGCA] = useState<boolean>(true);
  const [editFromXacMinh, setEditFromXacMinh] = useState<boolean>(false);
  const [editorZoom, setEditorZoom] = useState<number>(100);
  const [showStepMenu, setShowStepMenu] = useState<boolean>(false);
  const [isFullscreenViewer, setIsFullscreenViewer] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Tạo văn bản tự động theo bước quy trình
  const handleCreateDocFromStep = (tpl: StepDocTemplate) => {
    setShowStepMenu(false);
    if (tpl.isBaoCao && onOpenBaoCaoDeXuat) {
      onOpenBaoCaoDeXuat();
      return;
    }

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const timeStr = `${todayStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const cleanFileName = tpl.docTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');

    const soHieu = `${Math.floor(10 + Math.random() * 89)}/${tpl.docCode.split('/')[1] || 'VB-CQĐT'}`;

    const newDoc: DocItem = {
      id: `DOC-STEP-${Date.now().toString().slice(-4)}`,
      name: `${cleanFileName}_so_${soHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      category: tpl.category,
      soHieu: soHieu,
      size: `${Math.floor(Math.random() * 200 + 400)} KB`,
      pages: Math.floor(Math.random() * 2 + 1),
      uploadDate: timeStr,
      signer: `${editSigner || 'Nguyễn Minh Anh'} - Cán bộ thụ lý`,
      coQuanBanHanh: editCoQuanBanHanh || (isToGiac ? 'Cơ quan CSĐT Công an TP. Hà Nội' : 'UBND quận'),
      stepBelongsTo: `Bước ${tpl.stepNumber}: ${tpl.stepTitle}`,
      ocrStatus: 'Hoàn tất',
      isProcessDoc: true,
      isEditable: true,
      loaiVanBan: tpl.loaiVanBan,
      tenVanBan: tpl.docTitle,
      nguoiNhan: tpl.nguoiNhan || currentDon.nguoiNop || 'Nguyễn Văn A',
      thoiGianHen: tpl.thoiGian,
      diaDiem: tpl.diaDiem,
      trichYeu: tpl.trichYeu,
      noiDungChiTiet: tpl.noiDung,
      previewExcerpt: tpl.noiDung,
      trangThai: 'du_thao',
      fromXacMinh: true,
      signingStatus: 'nhap',
    };

    setDocuments((prev) => [newDoc, ...prev]);
    handleStartEdit(newDoc);
    showToast(`✓ Đã tạo thành công "${tpl.docTitle}" thuộc Bước ${tpl.stepNumber}!`);
  };

  // Mở bản xem trước văn bản trực tiếp
  const handleStartEdit = (doc: DocItem) => {
    setActiveEditingDoc(doc);
    setEditSoHieu(doc.soHieu || `${Math.floor(10 + Math.random() * 89)}/VB`);
    const isBc = doc.loaiVanBan === 'bao_cao_de_xuat' || doc.loaiVanBan === 'bao_cao_xac_minh';
    const isKtl =
      doc.category?.includes('không thụ lý') ||
      doc.tenVanBan?.toLowerCase().includes('không thụ lý') ||
      Boolean(doc.lyDoChinh) ||
      Boolean(doc.soHieu?.includes('TB-KTL')) ||
      Boolean(doc.name?.toLowerCase().includes('khong_thu_ly'));
    const rawName = doc.tenVanBan || doc.name || 'Van_ban';
    setEditTenVanBan(
      isBc
        ? (doc.tenVanBan || 'Báo cáo kết quả xác minh')
        : isKtl
          ? (doc.tenVanBan || 'Thông báo không thụ lý giải quyết đơn')
          : rawName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
    );
    setEditLoaiVanBan(
      doc.loaiVanBan ||
      (isKtl
        ? 'thong_bao'
        : rawName.toLowerCase().includes('giay_moi')
          ? 'giay_moi'
          : rawName.toLowerCase().includes('bien_ban')
            ? 'bien_ban'
            : rawName.toLowerCase().includes('cong_van')
              ? 'cong_van'
              : isBc || rawName.toLowerCase().includes('bao_cao')
                ? 'bao_cao_de_xuat'
                : 'quyet_dinh')
    );
    setEditCategory(isBc ? 'Báo cáo đề xuất' : isKtl ? 'Thông báo không thụ lý' : (doc.category || 'Văn bản nghiệp vụ'));
    setEditNgayLap(doc.uploadDate ? doc.uploadDate.split(' ')[0] : '16/09/2026');
    setEditCoQuanBanHanh(doc.coQuanBanHanh || (isKtl ? 'UBND quận Cầu Giấy' : isBc ? 'CƠ QUAN CẢNH SÁT ĐIỀU TRA' : 'Phòng Tiếp công dân & Xử lý đơn'));
    setEditCoQuanCapTren(isBc ? 'CÔNG AN TP. HÀ NỘI' : 'ỦY BAN NHÂN DÂN QUẬN CẦU GIẤY');
    setEditNguoiNhan(doc.nguoiNhan || (isBc ? 'Thủ trưởng (Phó Thủ trưởng) Cơ quan Điều tra' : (currentDon.nguoiNop || 'Nguyễn Văn A')));
    setEditThoiGianHen(doc.thoiGianHen || '08:30 ngày 18/09/2026');
    setEditDiaDiem(doc.diaDiem || (isKtl ? 'Trụ sở UBND quận Cầu Giấy' : 'Phòng Tiếp công dân & Xử lý đơn (Phòng 102, Trụ sở UBND quận)'));
    setEditTrichYeu(doc.trichYeu || (isKtl ? `V/v Không thụ lý giải quyết đơn của ông/bà ${currentDon.nguoiNop}` : `V/v Xác minh đơn của ông/bà ${currentDon.nguoiNop}`));
    setEditNoiDungChiTiet(doc.noiDungChiTiet || doc.previewExcerpt || '');
    setEditSigner(doc.signer ? doc.signer.replace(/\s*\(.*\)/, '') : (isKtl ? 'Trần Văn Cường' : 'Nguyễn Minh Anh'));
    setEditChucVuSigner(isBc ? 'ĐIỀU TRA VIÊN / CÁN BỘ ĐIỀU TRA' : isKtl ? 'PHÓ CHỦ TỊCH UBND QUẬN' : 'CÁN BỘ THỤ LÝ XÁC MINH');
    setEditTrangThai(doc.trangThai === 'da_ban_hanh' ? 'da_ban_hanh' : 'du_thao');
    setEditFromXacMinh(Boolean(doc.fromXacMinh));
  };

  // Xử lý Đi trình ký trực tiếp từ dòng danh sách văn bản
  const handleTrinhKyFromRow = (doc: DocItem) => {
    // 1. Kiểm tra thông tin bắt buộc và nội dung văn bản trước khi trình ký
    if (!doc.soHieu || !doc.soHieu.trim()) {
      showToast('⚠️ Văn bản chưa có Số ký hiệu văn bản. Vui lòng bấm "Chỉnh sửa" để bổ sung trước khi trình ký!');
      return;
    }

    if (!doc.noiDungChiTiet || !doc.noiDungChiTiet.trim()) {
      showToast('⚠️ Nội dung văn bản chưa hoàn thiện. Vui lòng kiểm tra lại trước khi trình ký!');
      return;
    }

    const isKtl =
      doc.category?.includes('không thụ lý') ||
      doc.tenVanBan?.toLowerCase().includes('không thụ lý') ||
      Boolean(doc.lyDoChinh) ||
      Boolean(doc.soHieu?.includes('TB-KTL')) ||
      Boolean(doc.name?.toLowerCase().includes('khong_thu_ly'));
    const docLabel = isKtl ? 'Thông báo không thụ lý giải quyết đơn' : 'Báo cáo kết quả xác minh';

    // 2. Xác nhận chuyển trình ký
    const confirmMsg = `Xác nhận chuyển ${docLabel} (Số: ${doc.soHieu}) sang luồng trình ký Lãnh đạo phê duyệt?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    // 3. Cập nhật trong danh sách documents của tab
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id || (d.soHieu && d.soHieu === doc.soHieu)
          ? {
            ...d,
            signingStatus: 'cho_trinh',
            trangThai: 'du_thao',
          }
          : d
      )
    );

    // 4. Cập nhật trong signingDocuments
    const matchingSigningDoc = signingDocuments?.find(
      (sd) =>
        sd.id === doc.id ||
        (isKtl && (sd.id === doc.id || (sd.hoSoCode === currentDon.code && (sd.loaiVanBan === 'thong_bao' || sd.tenVanBan?.includes('không thụ lý'))))) ||
        (!isKtl && (sd.id === doc.id || (sd.hoSoCode === currentDon.code && (sd.loaiVanBan === 'bao_cao_de_xuat' || sd.loaiVanBan === 'to_trinh_thu_ly'))))
    );

    const updatedSigningDoc: SigningDocument = matchingSigningDoc
      ? {
        ...matchingSigningDoc,
        status: 'cho_trinh',
        thoiGianTrinh: `${todayStr} 10:15`,
        nguoiTrinh: doc.signer ? doc.signer.replace(/\s*\(.*\)/, '') : 'Nguyễn Minh Anh',
      }
      : {
        id: doc.id,
        soKyHieu: doc.soHieu,
        hoSoCode: currentDon.code,
        luotNhanId: currentDon.luotNhanId,
        loaiDon: currentDon.loaiDon || 'Đơn tố cáo',
        nguoiGuiDon: currentDon.nguoiNop,
        noiDungDon: currentDon.title,
        tenVanBan: doc.tenVanBan || docLabel,
        loaiVanBan: isKtl ? 'thong_bao' : 'bao_cao_de_xuat',
        loaiVanBanLabel: isKtl ? 'Thông báo không thụ lý' : 'Báo cáo đề xuất',
        trichYeu: doc.trichYeu || (isKtl ? `V/v Không thụ lý giải quyết đơn của ông/bà ${currentDon.nguoiNop}` : `V/v Xác minh đơn của ông/bà ${currentDon.nguoiNop}`),
        noiDungChiTiet: doc.noiDungChiTiet,
        nguoiLap: doc.signer ? doc.signer.replace(/\s*\(.*\)/, '') : 'Nguyễn Minh Anh',
        donViNguoiLap: doc.coQuanBanHanh || (isKtl ? 'UBND quận Cầu Giấy' : 'Cơ quan Cảnh sát điều tra'),
        ngayTao: doc.uploadDate || `${todayStr} 09:00`,
        status: 'cho_trinh',
        thoiGianTrinh: `${todayStr} 10:15`,
        nguoiTrinh: doc.signer ? doc.signer.replace(/\s*\(.*\)/, '') : 'Nguyễn Minh Anh',
        mucDoUuTien: 'thuong',
        hanXuLy: '24 giờ',
        signers: [
          {
            id: 'ld-01',
            name: isKtl ? (doc.signer?.replace(/\s*\(.*\)/, '') || 'Đ/c Trần Văn Cường') : 'Đ/c Trần Văn Hùng',
            chucVu: isKtl ? 'Phó Chủ tịch UBND quận' : 'Thủ trưởng / Phó Thủ trưởng Cơ quan Điều tra',
            coQuan: doc.coQuanBanHanh || (isKtl ? 'UBND quận Cầu Giấy' : 'Cơ quan Cảnh sát điều tra'),
            vaiTro: 'duyet',
            thuTu: 1,
            status: 'cho_ky',
          },
        ],
        currentSignerIndex: 0,
        lanhDaoId: 'ld-01',
        lanhDaoName: isKtl ? (doc.signer?.replace(/\s*\(.*\)/, '') || 'Đ/c Trần Văn Cường') : 'Đ/c Trần Văn Hùng',
        lanhDaoChucVu: isKtl ? 'Phó Chủ tịch UBND quận' : 'Thủ trưởng / Phó Thủ trưởng Cơ quan Điều tra',
        tepDinhKem: [
          {
            id: `att-${isKtl ? 'ktl' : 'bc'}-${Date.now()}`,
            tenTep: isKtl ? `Thong_bao_khong_thu_ly_${currentDon.code}.pdf` : `Bao_cao_ket_qua_xac_minh_${currentDon.code}.pdf`,
            dungLuong: '380 KB',
            loai: 'du_thao',
          },
        ],
        phienBanHienTai: 'V1',
        versionHistory: [
          {
            version: 'V1',
            thoiGian: `${todayStr} 10:15`,
            nguoiTao: doc.signer || 'Nguyễn Minh Anh',
            trangThaiLucDo: 'Chờ trình ký',
            ghiChu: `Trình Lãnh đạo ${docLabel}`,
            noiDungSnapshot: doc.noiDungChiTiet || '',
          },
        ],
        history: [
          {
            id: `hist-${Date.now()}`,
            time: `${todayStr} 10:15`,
            actor: doc.signer || 'Nguyễn Minh Anh',
            action: 'Chuyển trình Lãnh đạo phê duyệt',
          },
        ],
        auditLogs: [
          {
            id: `al-${Date.now()}`,
            time: `${todayStr} 10:15`,
            actor: doc.signer || 'Nguyễn Minh Anh',
            actorRole: 'Cán bộ thụ lý',
            action: 'Trình văn bản',
            statusBefore: 'nhap',
            statusAfter: 'cho_trinh',
            version: 'V1',
            note: doc.trichYeu,
          },
        ],
      };

    if (onUpdateSigningDocuments) {
      onUpdateSigningDocuments((prevDocs) => {
        const idx = prevDocs.findIndex((d) => d.id === updatedSigningDoc.id || d.hoSoCode === currentDon.code);
        if (idx >= 0) {
          const next = [...prevDocs];
          next[idx] = updatedSigningDoc;
          return next;
        }
        return [updatedSigningDoc, ...prevDocs];
      });
    }

    if (onTrinhKyBaoCao) {
      onTrinhKyBaoCao(updatedSigningDoc.id, updatedSigningDoc);
    }

    showToast(
      `✓ Đã chuyển ${docLabel} (${doc.soHieu}) sang luồng trình ký Lãnh đạo thành công!`
    );
  };

  // Đóng trình soạn thảo trực tiếp
  const handleExitDirectEdit = () => {
    setActiveEditingDoc(null);
    onClearInitialEditingDoc?.();
  };

  // Lưu văn bản trực tiếp
  const handleSaveDirectEdit = () => {
    if (!editSoHieu.trim()) {
      showToast('Vui lòng nhập Số ký hiệu văn bản!');
      return;
    }

    const updatedDoc: DocItem = {
      ...(activeEditingDoc || {
        id: `DOC-${Date.now().toString().slice(-4)}`,
        size: '450 KB',
        pages: 2,
        uploadDate: `${editNgayLap || '16/09/2026'} 10:00`,
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
      }),
      name: activeEditingDoc?.name || `${editTenVanBan.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      soHieu: editSoHieu,
      category: editCategory || 'Văn bản xác minh',
      signer: `${editSigner || 'Nguyễn Minh Anh'}${editIsSignedVGCA ? ' (Ký số VGCA)' : ''}`,
      coQuanBanHanh: editCoQuanBanHanh,
      stepBelongsTo: activeEditingDoc?.stepBelongsTo || 'Bước 2: Xác minh thông tin & Đề xuất',
      loaiVanBan: editLoaiVanBan,
      nguoiNhan: editNguoiNhan,
      diaDiem: editDiaDiem,
      thoiGianHen: editThoiGianHen,
      trichYeu: editTrichYeu,
      noiDungChiTiet: editNoiDungChiTiet,
      previewExcerpt: editNoiDungChiTiet,
      trangThai: editTrangThai,
      fromXacMinh: editFromXacMinh,
    };

    setDocuments((prev) => {
      const idx = prev.findIndex((d) => d.id === updatedDoc.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedDoc;
        return next;
      }
      return [updatedDoc, ...prev];
    });

    setActiveEditingDoc(updatedDoc);

    // Đồng bộ sang sharedVanBanList nếu có
    if ((updatedDoc.fromXacMinh || editFromXacMinh) && onUpdateSharedVanBanList) {
      onUpdateSharedVanBanList((prevList) => {
        const idx = prevList.findIndex((v) => v.id === updatedDoc.id || v.soKyHieu === updatedDoc.soHieu);
        const item: VanBanXacMinhItem = {
          id: updatedDoc.id,
          loai: (updatedDoc.loaiVanBan as any) || 'giay_moi',
          tenVanBan: editTenVanBan,
          soKyHieu: editSoHieu,
          ngayLap: editNgayLap || '16/09/2026',
          nguoiNhan: editNguoiNhan,
          trichYeu: editTrichYeu,
          noiDungChiTiet: editNoiDungChiTiet,
          diaDiem: editDiaDiem,
          thoiGianHen: editThoiGianHen,
          trangThai: editTrangThai,
        };
        if (idx >= 0) {
          const next = [...prevList];
          next[idx] = item;
          return next;
        }
        return [item, ...prevList];
      });
    }

    // Đồng bộ sang signingDocuments nếu là văn bản Báo cáo đề xuất / Tờ trình
    if (
      (updatedDoc.loaiVanBan === 'bao_cao_de_xuat' || updatedDoc.signingStatus) &&
      onUpdateSigningDocuments
    ) {
      onUpdateSigningDocuments((prevDocs) => {
        const existing = prevDocs.find(
          (d) =>
            d.id === updatedDoc.id ||
            (d.hoSoCode === currentDon.code && (d.loaiVanBan === 'bao_cao_de_xuat' || d.loaiVanBan === 'to_trinh_thu_ly'))
        );
        if (existing) {
          return prevDocs.map((d) =>
            d.id === existing.id
              ? {
                ...d,
                soKyHieu: editSoHieu,
                trichYeu: editTrichYeu,
                noiDungChiTiet: editNoiDungChiTiet,
                tenVanBan: editTenVanBan,
              }
              : d
          );
        }
        return prevDocs;
      });
    }

    showToast(`✓ Đã lưu thành công văn bản ${editSoHieu} vào Hồ sơ & Văn bản của đơn!`);
  };

  // Trình ký Báo cáo đề xuất Lãnh đạo trực tiếp từ trình xem trước A4
  const handleTrinhKyBaoCaoDirect = () => {
    if (!editSoHieu.trim()) {
      showToast('⚠️ Báo cáo chưa có Số ký hiệu văn bản. Vui lòng bổ sung trước khi trình ký!');
      return;
    }

    if (!editNoiDungChiTiet.trim() && !activeEditingDoc?.formData) {
      showToast('⚠️ Nội dung văn bản báo cáo chưa hoàn thiện. Vui lòng kiểm tra lại trước khi trình ký!');
      return;
    }

    const confirmMsg = `Xác nhận chuyển Báo cáo kết quả xác minh (Số: ${editSoHieu}) sang luồng trình ký Lãnh đạo phê duyệt?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    // 1. Lưu nội dung văn bản hiện tại
    handleSaveDirectEdit();

    // 2. Cập nhật DocItem trong danh sách documents
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === activeEditingDoc?.id || (d.soHieu && d.soHieu === editSoHieu)
          ? {
            ...d,
            signingStatus: 'cho_trinh',
            trangThai: 'du_thao',
            noiDungChiTiet: editNoiDungChiTiet,
            trichYeu: editTrichYeu,
            soHieu: editSoHieu,
          }
          : d
      )
    );

    if (activeEditingDoc) {
      setActiveEditingDoc((prev) =>
        prev
          ? {
            ...prev,
            signingStatus: 'cho_trinh',
            noiDungChiTiet: editNoiDungChiTiet,
            trichYeu: editTrichYeu,
            soHieu: editSoHieu,
          }
          : null
      );
    }

    // 3. Cập nhật hoặc tạo SigningDocument tương ứng với status 'cho_trinh'
    const matchingSigningDoc = signingDocuments?.find(
      (sd) =>
        sd.hoSoCode === currentDon.code &&
        (sd.loaiVanBan === 'bao_cao_de_xuat' || sd.loaiVanBan === 'to_trinh_thu_ly')
    );

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const preservedFormData = activeEditingDoc?.formData || (matchingSigningDoc as any)?.formData;

    const updatedSigningDoc: SigningDocument = matchingSigningDoc
      ? {
        ...matchingSigningDoc,
        status: 'cho_trinh',
        soKyHieu: editSoHieu,
        trichYeu: editTrichYeu,
        noiDungChiTiet: editNoiDungChiTiet,
        thoiGianTrinh: `${todayStr} 10:15`,
        nguoiTrinh: editSigner || 'Nguyễn Minh Anh',
      }
      : {
        id: activeEditingDoc?.id || `VB-BC-${Date.now().toString().slice(-4)}`,
        soKyHieu: editSoHieu,
        hoSoCode: currentDon.code,
        luotNhanId: currentDon.luotNhanId,
        loaiDon: currentDon.loaiDon || 'Đơn tố cáo',
        nguoiGuiDon: currentDon.nguoiNop,
        noiDungDon: currentDon.title,
        tenVanBan: editTenVanBan || `Báo cáo đề xuất hướng xử lý đơn ${currentDon.code}`,
        loaiVanBan: 'bao_cao_de_xuat',
        loaiVanBanLabel: 'Báo cáo đề xuất hướng xử lý',
        trichYeu: editTrichYeu,
        noiDungChiTiet: editNoiDungChiTiet,
        nguoiLap: editSigner || 'Nguyễn Minh Anh',
        donViNguoiLap: editCoQuanBanHanh || 'Phòng Tiếp công dân & Xử lý đơn',
        ngayTao: `${todayStr} 09:00`,
        status: 'cho_trinh',
        thoiGianTrinh: `${todayStr} 10:15`,
        nguoiTrinh: editSigner || 'Nguyễn Minh Anh',
        mucDoUuTien: 'thuong',
        hanXuLy: '24 giờ',
        signers: [
          {
            id: 'ld-01',
            name: 'Đ/c Trần Văn Hùng',
            chucVu: 'Phó Chánh Thanh tra thành phố',
            coQuan: 'Thanh tra Thành phố',
            vaiTro: 'duyet',
            thuTu: 1,
            status: 'cho_ky',
          },
        ],
        currentSignerIndex: 0,
        lanhDaoId: 'ld-01',
        lanhDaoName: 'Đ/c Trần Văn Hùng',
        lanhDaoChucVu: 'Phó Chánh Thanh tra thành phố',
        tepDinhKem: [
          {
            id: `att-bc-${Date.now()}`,
            tenTep: `Bao_cao_de_xuat_${currentDon.code}.pdf`,
            dungLuong: '380 KB',
            loai: 'du_thao',
          },
        ],
        phienBanHienTai: 'V1',
        versionHistory: [
          {
            version: 'V1',
            thoiGian: `${todayStr} 10:15`,
            nguoiTao: editSigner || 'Nguyễn Minh Anh',
            trangThaiLucDo: 'Chờ trình ký',
            ghiChu: 'Soạn thảo và trình ký Báo cáo đề xuất hướng xử lý',
            noiDungSnapshot: editNoiDungChiTiet,
          },
        ],
        history: [
          {
            id: `hist-${Date.now()}`,
            time: `${todayStr} 10:15`,
            actor: editSigner || 'Nguyễn Minh Anh',
            action: 'Hoàn thiện báo cáo và trình Lãnh đạo phê duyệt',
          },
        ],
        auditLogs: [
          {
            id: `al-${Date.now()}`,
            time: `${todayStr} 10:15`,
            actor: editSigner || 'Nguyễn Minh Anh',
            actorRole: 'Cán bộ thụ lý',
            action: 'Trình văn bản',
            statusBefore: 'nhap',
            statusAfter: 'cho_trinh',
            version: 'V1',
            note: editTrichYeu,
          },
        ],
      };

    if (preservedFormData) {
      (updatedSigningDoc as any).formData = preservedFormData;
    }

    if (onUpdateSigningDocuments) {
      onUpdateSigningDocuments((prevDocs) => {
        const idx = prevDocs.findIndex((d) => d.id === updatedSigningDoc.id || d.hoSoCode === currentDon.code);
        if (idx >= 0) {
          const next = [...prevDocs];
          next[idx] = updatedSigningDoc;
          return next;
        }
        return [updatedSigningDoc, ...prevDocs];
      });
    }

    if (onTrinhKyBaoCao) {
      onTrinhKyBaoCao(updatedSigningDoc.id, updatedSigningDoc);
    }

    showToast(
      `✓ Đã trình ký Báo cáo kết quả xác minh (${editSoHieu}) tới Lãnh đạo thành công! Nghiệp vụ Thụ lý và Chỉnh sửa thông tin đã được mở khóa.`
    );
  };

  // Trình ký Lãnh đạo cho Thông báo không thụ lý giải quyết đơn trực tiếp từ A4
  const handleTrinhKyKhongThuLyDirect = () => {
    if (!editSoHieu.trim()) {
      showToast('⚠️ Văn bản chưa có Số ký hiệu. Vui lòng bổ sung trước khi trình ký!');
      return;
    }

    const confirmMsg = `Xác nhận chuyển Thông báo không thụ lý giải quyết đơn (Số: ${editSoHieu}) sang luồng trình ký Lãnh đạo phê duyệt?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    // 1. Lưu nội dung văn bản hiện tại
    handleSaveDirectEdit();

    // 2. Cập nhật DocItem trong danh sách documents
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === activeEditingDoc?.id || (d.soHieu && d.soHieu === editSoHieu)
          ? {
            ...d,
            signingStatus: 'cho_trinh',
            trangThai: 'du_thao',
            noiDungChiTiet: editNoiDungChiTiet,
            trichYeu: editTrichYeu,
            soHieu: editSoHieu,
          }
          : d
      )
    );

    if (activeEditingDoc) {
      setActiveEditingDoc((prev) =>
        prev
          ? {
            ...prev,
            signingStatus: 'cho_trinh',
            noiDungChiTiet: editNoiDungChiTiet,
            trichYeu: editTrichYeu,
            soHieu: editSoHieu,
          }
          : null
      );
    }

    // 3. Cập nhật hoặc tạo SigningDocument tương ứng với status 'cho_trinh'
    const matchingSigningDoc = signingDocuments?.find(
      (sd) =>
        sd.id === activeEditingDoc?.id ||
        (sd.hoSoCode === currentDon.code && (sd.loaiVanBan === 'thong_bao' || sd.tenVanBan?.includes('không thụ lý')))
    );

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const updatedSigningDoc: SigningDocument = matchingSigningDoc
      ? {
        ...matchingSigningDoc,
        status: 'cho_trinh',
        soKyHieu: editSoHieu,
        trichYeu: editTrichYeu,
        noiDungChiTiet: editNoiDungChiTiet,
        thoiGianTrinh: `${todayStr} 10:15`,
        nguoiTrinh: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
      }
      : {
        id: activeEditingDoc?.id || `DOC-KTL-${Date.now().toString().slice(-4)}`,
        soKyHieu: editSoHieu,
        hoSoCode: currentDon.code,
        luotNhanId: currentDon.luotNhanId,
        loaiDon: currentDon.loaiDon || 'Đơn tố cáo',
        nguoiGuiDon: currentDon.nguoiNop,
        noiDungDon: currentDon.title,
        tenVanBan: editTenVanBan || 'Thông báo không thụ lý giải quyết đơn',
        loaiVanBan: 'thong_bao',
        loaiVanBanLabel: 'Thông báo không thụ lý',
        trichYeu: editTrichYeu || `V/v Không thụ lý giải quyết đơn của ông/bà ${currentDon.nguoiNop}`,
        noiDungChiTiet: editNoiDungChiTiet,
        nguoiLap: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
        donViNguoiLap: editCoQuanBanHanh || 'UBND quận Cầu Giấy',
        ngayTao: `${todayStr} 09:30`,
        status: 'cho_trinh',
        thoiGianTrinh: `${todayStr} 10:15`,
        nguoiTrinh: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
        mucDoUuTien: 'thuong',
        hanXuLy: '24 giờ',
        signers: [
          {
            id: 'ld-01',
            name: editSigner?.replace(/\s*\(.*\)/, '') || 'Đ/c Trần Văn Cường',
            chucVu: editChucVuSigner || 'Phó Chủ tịch UBND quận',
            coQuan: editCoQuanBanHanh || 'UBND quận Cầu Giấy',
            vaiTro: 'duyet',
            thuTu: 1,
            status: 'cho_ky',
          },
        ],
        currentSignerIndex: 0,
        lanhDaoId: 'ld-01',
        lanhDaoName: editSigner?.replace(/\s*\(.*\)/, '') || 'Đ/c Trần Văn Cường',
        lanhDaoChucVu: editChucVuSigner || 'Phó Chủ tịch UBND quận',
        tepDinhKem: [
          {
            id: `att-ktl-${Date.now()}`,
            tenTep: `Thong_bao_khong_thu_ly_${currentDon.code}.pdf`,
            dungLuong: '420 KB',
            loai: 'du_thao',
          },
        ],
        phienBanHienTai: 'V1',
        versionHistory: [
          {
            version: 'V1',
            thoiGian: `${todayStr} 10:15`,
            nguoiTao: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            trangThaiLucDo: 'Chờ trình ký',
            ghiChu: 'Trình Lãnh đạo phê duyệt Thông báo không thụ lý giải quyết đơn',
            noiDungSnapshot: editNoiDungChiTiet,
          },
        ],
        history: [
          {
            id: `hist-${Date.now()}`,
            time: `${todayStr} 10:15`,
            actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            action: 'Trình Lãnh đạo ký duyệt Thông báo không thụ lý giải quyết đơn',
          },
        ],
        auditLogs: [
          {
            id: `al-${Date.now()}`,
            time: `${todayStr} 10:15`,
            actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            actorRole: 'Cán bộ thụ lý',
            action: 'Trình văn bản',
            statusBefore: 'nhap',
            statusAfter: 'cho_trinh',
            version: 'V1',
            note: editTrichYeu,
          },
        ],
      };

    if (onUpdateSigningDocuments) {
      onUpdateSigningDocuments((prevDocs) => {
        const idx = prevDocs.findIndex((d) => d.id === updatedSigningDoc.id || (d.hoSoCode === currentDon.code && (d.loaiVanBan === 'thong_bao' || d.tenVanBan?.includes('không thụ lý'))));
        if (idx >= 0) {
          const next = [...prevDocs];
          next[idx] = updatedSigningDoc;
          return next;
        }
        return [updatedSigningDoc, ...prevDocs];
      });
    }

    if (onTrinhKyBaoCao) {
      onTrinhKyBaoCao(updatedSigningDoc.id, updatedSigningDoc);
    }

    showToast(
      `✓ Đã trình ký Thông báo không thụ lý (${editSoHieu}) tới Lãnh đạo UBND quận phê duyệt!`
    );
  };

  // Tạo văn bản xác minh mới trực tiếp ngay trong tab Hồ sơ & Văn bản (không cần quay lại popup)
  const handleCreateNewXacMinhDoc = (type: 'giay_moi' | 'bien_ban' | 'cong_van' | 'thong_bao') => {
    // Tự động lưu văn bản hiện hành nếu đang mở
    if (activeEditingDoc && editSoHieu) {
      handleSaveDirectEdit();
    }

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const nextDayStr = `${String(now.getDate() + 2).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    let newDoc: DocItem;
    if (type === 'giay_moi') {
      const count = documents.filter((d) => d.loaiVanBan === 'giay_moi').length;
      const soHieu = `${19 + count}/GM-TCD`;
      newDoc = {
        id: `DOC-XM-${Date.now().toString().slice(-4)}`,
        name: `Giay_moi_lam_viec_so_${soHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        category: 'Giấy mời xác minh',
        soHieu: soHieu,
        size: '390 KB',
        pages: 1,
        uploadDate: `${todayStr} 09:00`,
        signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        coQuanBanHanh: 'Phòng Tiếp công dân & Xử lý đơn - UBND quận',
        stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
        loaiVanBan: 'giay_moi',
        nguoiNhan: currentDon.nguoiNop || 'Nguyễn Văn A',
        thoiGianHen: `09:00 ngày ${nextDayStr}`,
        diaDiem: 'Phòng Tiếp công dân & Xử lý đơn (Phòng 102, Trụ sở UBND quận)',
        trichYeu: `V/v Mời làm việc xác minh nội dung đơn số ${currentDon.code}`,
        noiDungChiTiet: `Kính mời Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'} có mặt tại Phòng Tiếp công dân để làm việc về nội dung đơn đề ngày ${currentDon.ngayNhan || '16/09/2026'}.\nKhi đi mang theo Căn cước công dân và toàn bộ bản chính tài liệu, chứng cứ có liên quan đến việc phản ánh/tố cáo để đối chiếu, xác minh làm rõ theo quy định pháp luật.`,
        previewExcerpt: `Kính mời Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'} có mặt tại Phòng Tiếp công dân...`,
        trangThai: 'du_thao',
        fromXacMinh: true,
      };
    } else if (type === 'bien_ban') {
      const count = documents.filter((d) => d.loaiVanBan === 'bien_ban').length;
      const soHieu = `0${3 + count}/BB-XM`;
      newDoc = {
        id: `DOC-XM-${Date.now().toString().slice(-4)}`,
        name: `Bien_ban_lam_viec_so_${soHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        category: 'Biên bản làm việc',
        soHieu: soHieu,
        size: '510 KB',
        pages: 2,
        uploadDate: `${todayStr} 14:00`,
        signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        coQuanBanHanh: 'Phòng Tiếp công dân & Xử lý đơn',
        stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
        loaiVanBan: 'bien_ban',
        nguoiNhan: `${currentDon.nguoiNop || 'Nguyễn Văn A'} (Công dân đứng đơn)`,
        thoiGianHen: `${todayStr} (14:30)`,
        diaDiem: 'Phòng Tiếp công dân & Xử lý đơn',
        trichYeu: `Biên bản ghi nhận ý kiến và giao nhận tài liệu hồ sơ ${currentDon.code}`,
        noiDungChiTiet: `Tại buổi làm việc, công dân ${currentDon.nguoiNop || 'Nguyễn Văn A'} khẳng định nội dung đơn gửi là hoàn toàn chính xác, cam kết chịu trách nhiệm trước pháp luật.\nCông dân đã giao nộp bản sao chứng thực Hợp đồng góp vốn, phiếu thu tiền và biên bản làm việc với Chi nhánh Văn phòng Đăng ký đất đai.\nCán bộ thụ lý đã tiếp nhận, kiểm tra tính pháp lý ban đầu và lập biên nhận bàn giao tài liệu phục vụ xác minh.`,
        previewExcerpt: `Tại buổi làm việc, công dân ${currentDon.nguoiNop || 'Nguyễn Văn A'} khẳng định...`,
        trangThai: 'du_thao',
        fromXacMinh: true,
      };
    } else if (type === 'cong_van') {
      const count = documents.filter((d) => d.loaiVanBan === 'cong_van').length;
      const soHieu = `${106 + count}/CV-UBND`;
      newDoc = {
        id: `DOC-XM-${Date.now()}`,
        name: `Cong_van_de_nghi_so_${soHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        category: 'Công văn phối hợp',
        soHieu: soHieu,
        size: '420 KB',
        pages: 2,
        uploadDate: `${todayStr} 10:30`,
        signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        coQuanBanHanh: 'UBND quận - Phòng Tiếp công dân & Xử lý đơn',
        stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
        loaiVanBan: 'cong_van',
        nguoiNhan: 'Chi nhánh Văn phòng Đăng ký đất đai quận Cầu Giấy',
        thoiGianHen: `Thời hạn phản hồi: Trong 03 ngày làm việc kể từ ngày nhận công văn`,
        diaDiem: 'Gửi qua Trục liên thông văn bản điện tử thành phố',
        trichYeu: `V/v Đề nghị cung cấp hồ sơ địa chính và tình trạng giải quyết liên quan đến đơn ${currentDon.code}`,
        noiDungChiTiet: `Để có căn cứ xử lý đơn của công dân ${currentDon.nguoiNop || 'Nguyễn Văn A'} theo đúng quy định pháp luật, Phòng Tiếp công dân & Xử lý đơn đề nghị Quý cơ quan kiểm tra, sao lục và cung cấp toàn bộ hồ sơ đăng ký cấp GCNQSDĐ của đương sự trước ngày ${nextDayStr}.\nVăn bản phản hồi đề nghị gửi về Phòng Tiếp công dân qua Trục liên thông văn bản điện tử thành phố.`,
        previewExcerpt: `Để có căn cứ xử lý đơn của công dân...`,
        trangThai: 'du_thao',
        fromXacMinh: true,
      };
    } else {
      const count = documents.filter((d) => d.loaiVanBan === 'thong_bao').length;
      const soHieu = `${20 + count}/TB-TCD`;
      newDoc = {
        id: `DOC-XM-${Date.now()}`,
        name: `Thong_bao_yeu_cau_bo_sung_so_${soHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        category: 'Thông báo hành chính',
        soHieu: soHieu,
        size: '360 KB',
        pages: 1,
        uploadDate: `${todayStr} 11:00`,
        signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        coQuanBanHanh: 'Phòng Tiếp công dân & Xử lý đơn',
        stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
        loaiVanBan: 'thong_bao',
        nguoiNhan: currentDon.nguoiNop || 'Nguyễn Văn A',
        thoiGianHen: 'Thời hạn bổ sung: 10 ngày kể từ ngày nhận thông báo',
        diaDiem: 'Bộ phận Tiếp nhận & Trả kết quả một cửa',
        trichYeu: `V/v Yêu cầu bổ sung tài liệu chứng cứ đối với đơn ${currentDon.code}`,
        noiDungChiTiet: `Qua kiểm tra nội dung đơn số ${currentDon.code} của Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'}, cơ quan thụ lý nhận thấy hồ sơ chưa có đầy đủ tài liệu chứng cứ gốc chứng minh hành vi sai phạm.\nĐể có cơ sở xem xét thụ lý theo quy định tại Điều 29 Luật Tố cáo 2018, đề nghị Ông/Bà bổ sung:\n1. Bản sao có chứng thực giấy chứng nhận quyền sử dụng đất;\n2. Giấy tờ ủy quyền (nếu có đại diện);\n3. Tài liệu giao dịch tài chính có xác nhận ngân hàng.\nHết thời hạn 10 ngày nêu trên, nếu không bổ sung thì đơn sẽ không đủ điều kiện để thụ lý giải quyết.`,
        previewExcerpt: `Qua kiểm tra nội dung đơn số ${currentDon.code}...`,
        trangThai: 'du_thao',
        fromXacMinh: true,
      };
    }

    setDocuments((prev) => [newDoc, ...prev]);
    handleStartEdit(newDoc);

    if (onUpdateSharedVanBanList) {
      const xmItem: VanBanXacMinhItem = {
        id: newDoc.id,
        loai: (newDoc.loaiVanBan as any) || 'giay_moi',
        tenVanBan: newDoc.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        soKyHieu: newDoc.soHieu || '',
        ngayLap: todayStr,
        nguoiNhan: newDoc.nguoiNhan || '',
        trichYeu: newDoc.trichYeu || '',
        noiDungChiTiet: newDoc.noiDungChiTiet || '',
        diaDiem: newDoc.diaDiem,
        thoiGianHen: newDoc.thoiGianHen,
        trangThai: 'du_thao',
      };
      onUpdateSharedVanBanList((prev) => [xmItem, ...prev]);
    }

    showToast(`✓ Đã tạo thêm "${newDoc.soHieu}". Bạn có thể chỉnh sửa trực tiếp trên mặt giấy A4!`);
  };

  // Đồng bộ sharedVanBanList vào documents nếu có văn bản mới được tạo từ Modal Xác minh
  useEffect(() => {
    if (sharedVanBanList && sharedVanBanList.length > 0) {
      setDocuments((prev) => {
        let changed = false;
        let nextDocs = [...prev];
        sharedVanBanList.forEach((xm) => {
          const exists = nextDocs.some((d) => d.id === xm.id || (d.soHieu && d.soHieu === xm.soKyHieu));
          if (!exists) {
            changed = true;
            nextDocs.unshift({
              id: xm.id,
              name: (xm as any).name || `${(xm.tenVanBan || xm.soKyHieu || 'van_ban').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
              category:
                xm.loai === 'giay_moi'
                  ? 'Giấy mời xác minh'
                  : xm.loai === 'bien_ban'
                    ? 'Biên bản làm việc'
                    : 'Công văn phối hợp',
              soHieu: xm.soKyHieu,
              size: xm.dungLuongFile || '450 KB',
              pages: 1,
              uploadDate: `${xm.ngayLap} 09:30`,
              signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
              coQuanBanHanh: xm.coQuanBanHanh || 'Phòng Tiếp công dân & Xử lý đơn',
              stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
              ocrStatus: 'Hoàn tất',
              isProcessDoc: true,
              isEditable: true,
              loaiVanBan: (xm.loai as any) || 'giay_moi',
              nguoiNhan: xm.nguoiNhan,
              diaDiem: xm.diaDiem,
              thoiGianHen: xm.thoiGianHen,
              trichYeu: xm.trichYeu,
              noiDungChiTiet: xm.noiDungChiTiet,
              previewExcerpt: xm.noiDungChiTiet,
              trangThai: xm.trangThai,
              fromXacMinh: true,
            });
          }
        });
        return changed ? nextDocs : prev;
      });
    }
  }, [sharedVanBanList]);

  // Đồng bộ văn bản trình ký / Báo cáo đề xuất (SigningDocument) thuộc đơn này vào Hồ sơ & Văn bản
  useEffect(() => {
    if (!signingDocuments || signingDocuments.length === 0) return;

    // Lọc các văn bản thuộc đơn đang mở
    const relevantSigningDocs = signingDocuments.filter(
      (sd) =>
        sd.hoSoCode === currentDon.code ||
        sd.luotNhanId === currentDon.luotNhanId ||
        (currentDon.id && sd.hoSoCode === currentDon.id)
    );

    if (relevantSigningDocs.length === 0) return;

    setDocuments((prev) => {
      let nextDocs = [...prev];
      let hasChanges = false;

      relevantSigningDocs.forEach((sd) => {
        const isBc = sd.loaiVanBan === 'bao_cao_de_xuat' || sd.loaiVanBan === 'bao_cao_xac_minh';
        const item: DocItem = {
          id: sd.id,
          name: (sd as any).name || `${(sd.tenVanBan || sd.soKyHieu || 'Bao_cao_ket_qua_xac_minh').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          category: isBc ? 'Báo cáo đề xuất' : (sd.loaiVanBanLabel || 'Văn bản trình ký'),
          tenVanBan: sd.tenVanBan || (isBc ? 'Báo cáo kết quả xác minh' : undefined),
          soHieu: sd.soKyHieu,
          size: sd.tepDinhKem?.[0]?.dungLuong || '340 KB',
          pages: 2,
          uploadDate: sd.ngayTao,
          signer: `${sd.nguoiLap} (${sd.donViNguoiLap || 'Điều tra viên'})`,
          coQuanBanHanh: sd.donViNguoiLap || 'Phòng Tiếp công dân & Xử lý đơn',
          stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
          ocrStatus: 'Hoàn tất',
          isProcessDoc: true,
          isEditable: true,
          loaiVanBan: (sd.loaiVanBan as any) || 'bao_cao_de_xuat',
          trichYeu: sd.trichYeu,
          noiDungChiTiet: sd.noiDungChiTiet,
          previewExcerpt: sd.noiDungChiTiet,
          trangThai: sd.status === 'da_ky' || sd.status === 'hoan_tat' ? 'da_ban_hanh' : 'du_thao',
          fromXacMinh: true,
          signingStatus: sd.status,
          formData: (sd as any).formData,
        };

        const existingIdx = nextDocs.findIndex((d) => d.id === sd.id || (d.soHieu && d.soHieu === sd.soKyHieu));
        if (existingIdx >= 0) {
          // Cập nhật trạng thái và nội dung nếu đã tồn tại
          if (
            nextDocs[existingIdx].signingStatus !== sd.status ||
            nextDocs[existingIdx].soHieu !== sd.soKyHieu ||
            nextDocs[existingIdx].previewExcerpt !== sd.noiDungChiTiet ||
            (sd as any).formData
          ) {
            nextDocs[existingIdx] = {
              ...nextDocs[existingIdx],
              ...item,
              formData: (sd as any).formData || nextDocs[existingIdx].formData,
            };
            hasChanges = true;
          }
        } else {
          // Thêm mới lên đầu danh sách văn bản
          nextDocs = [item, ...nextDocs];
          hasChanges = true;
        }
      });

      return hasChanges ? nextDocs : prev;
    });
  }, [signingDocuments, currentDon.code, currentDon.luotNhanId, currentDon.id]);

  // Tự động nhận prop initialEditingDoc từ Modal Xác minh / Không thụ lý
  useEffect(() => {
    if (initialEditingDoc) {
      const match = documents.find(
        (d) => d.id === initialEditingDoc.id || (d.soHieu && d.soHieu === initialEditingDoc.soHieu)
      );
      if (match) {
        const mergedDoc: DocItem = {
          ...match,
          ...initialEditingDoc,
          name: (initialEditingDoc as any).name || match.name,
          tenVanBan: initialEditingDoc.tenVanBan || match.tenVanBan,
          signingStatus: (initialEditingDoc as any).signingStatus || match.signingStatus || 'nhap',
          canCuPhapLy: (initialEditingDoc as any).canCuPhapLy || match.canCuPhapLy,
          lyDoChinh: (initialEditingDoc as any).lyDoChinh || match.lyDoChinh,
          lyDoChiTiet: (initialEditingDoc as any).lyDoChiTiet || match.lyDoChiTiet,
        };
        setDocuments((prev) => prev.map((d) => d.id === mergedDoc.id ? mergedDoc : d));
        handleStartEdit(mergedDoc);
      } else {
        const newDoc: DocItem = {
          id: initialEditingDoc.id || `DOC-XM-${Date.now().toString().slice(-4)}`,
          name:
            (initialEditingDoc as any).name ||
            `${(initialEditingDoc.tenVanBan || initialEditingDoc.soHieu || 'van_ban').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          category: initialEditingDoc.category || 'Văn bản xác minh',
          soHieu: initialEditingDoc.soHieu,
          size: '420 KB',
          pages: 1,
          uploadDate: `${initialEditingDoc.ngayLap || '16/09/2026'} 09:30`,
          signer: initialEditingDoc.signer || 'Nguyễn Minh Anh - Cán bộ thụ lý',
          coQuanBanHanh: initialEditingDoc.coQuanBanHanh || 'Phòng Tiếp công dân & Xử lý đơn',
          stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
          ocrStatus: 'Hoàn tất',
          isProcessDoc: true,
          isEditable: true,
          loaiVanBan: (initialEditingDoc.loai as any) || (initialEditingDoc as any).loaiVanBan || 'giay_moi',
          tenVanBan: initialEditingDoc.tenVanBan,
          nguoiNhan: initialEditingDoc.nguoiNhan || currentDon.nguoiNop || 'Nguyễn Văn A',
          diaDiem: initialEditingDoc.diaDiem,
          thoiGianHen: initialEditingDoc.thoiGianHen,
          trichYeu: initialEditingDoc.trichYeu,
          noiDungChiTiet: initialEditingDoc.noiDungChiTiet || '',
          previewExcerpt: (initialEditingDoc as any).previewExcerpt || initialEditingDoc.noiDungChiTiet || '',
          trangThai: (initialEditingDoc.trangThai as any) || 'du_thao',
          fromXacMinh: initialEditingDoc.fromXacMinh ?? true,
          signingStatus: (initialEditingDoc as any).signingStatus || 'nhap',
          canCuPhapLy: (initialEditingDoc as any).canCuPhapLy,
          lyDoChinh: (initialEditingDoc as any).lyDoChinh,
          lyDoChiTiet: (initialEditingDoc as any).lyDoChiTiet,
        };
        setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
        handleStartEdit(newDoc);
      }
    }
  }, [initialEditingDoc]);

  // Các mẫu văn bản soạn thảo nhanh trong editor
  const DIRECT_TEMPLATES = [
    {
      title: 'Báo cáo đề xuất thụ lý (Mẫu BC-ĐX)',
      type: 'bao_cao_de_xuat' as any,
      ten: `Báo cáo đề xuất hướng xử lý đơn ${currentDon.code}`,
      soHieu: '01/BC-ĐX',
      trichYeu: `V/v Kiểm tra ban đầu và đề xuất thụ lý giải quyết đơn ${currentDon.code}`,
      thoiGian: '16/09/2026',
      diaDiem: 'Công an cấp xã / Cơ quan thụ lý',
      nguoiNhan: 'Lãnh đạo đơn vị có thẩm quyền giải quyết',
      noiDung: `Kính gửi: Lãnh đạo Công an cấp xã\n\nCăn cứ Luật Tố cáo năm 2018;\nCăn cứ Thông tư số 05/2021/TT-TTCP ngày 01/10/2021 của Thanh tra Chính phủ quy định quy trình xử lý đơn khiếu nại, đơn tố cáo, đơn kiến nghị, phản ánh;\nCăn cứ Thông tư số 129/2020/TT-BCA ngày 08/12/2020 của Bộ trưởng Bộ Công an;\n\nCán bộ thụ lý báo cáo kết quả kiểm tra ban đầu đối với hồ sơ đơn số: ${currentDon.code} của người làm đơn ${currentDon.nguoiNop}:\n\n1. THÔNG TIN NGƯỜI LÀM ĐƠN VÀ ĐỐI TƯỢNG BỊ TỐ CÁO\n- Người làm đơn: ${currentDon.nguoiNop}, CCCD: ${currentDon.cccd || '001088012345'}.\n- Người làm đơn có đủ năng lực hành vi dân sự, đơn ghi rõ ngày tháng và có chữ ký trực tiếp.\n- Đối tượng bị tố cáo: Hành vi sai phạm quy định pháp luật trong quản lý đất đai và trật tự xây dựng.\n\n2. TÓM TẮT NỘI DUNG ĐƠN VÀ TÀI LIỆU KÈM THEO\n- Nội dung đơn: ${currentDon.title || 'Tố cáo hành vi vi phạm trật tự xây dựng và quản lý đất đai'}.\n- Tài liệu gửi kèm: Bản sao Giấy chứng nhận quyền sử dụng đất, tài liệu hình ảnh sai phạm.\n\n3. KẾT QUẢ KIỂM TRA ĐIỀU KIỆN THỤ LÝ\n- Đơn thuộc thẩm quyền giải quyết của cơ quan.\n- Nội dung tố cáo có căn cứ pháp lý rõ ràng, không thuộc các trường hợp không được thụ lý quy định tại Điều 29 Luật Tố cáo 2018.\n\n4. ĐỀ XUẤT HƯỚNG XỬ LÝ\nKính trình Lãnh đạo phê duyệt:\n- Đồng ý THỤ LÝ GIẢI QUYẾT nội dung đơn theo quy định của pháp luật.\n- Ban hành Quyết định thụ lý giải quyết và phân công Cán bộ/Tổ xác minh tiến hành các bước tiếp theo.`,
    },
    {
      title: 'Thông báo không thụ lý giải quyết đơn (TB-KTL)',
      type: 'thong_bao' as const,
      ten: 'Thông báo không thụ lý giải quyết đơn',
      soHieu: 'TB-KTL/UBND',
      trichYeu: `V/v Không thụ lý giải quyết đơn số ${currentDon.code} theo quy định pháp luật`,
      thoiGian: 'Theo quy định pháp luật',
      diaDiem: 'UBND quận Cầu Giấy',
      nguoiNhan: currentDon.nguoiNop || 'Nguyễn Văn A',
      noiDung: `Căn cứ Luật Tố cáo năm 2018;\nCăn cứ Điều 29 Luật Tố cáo năm 2018 quy định các trường hợp không thụ lý giải quyết tố cáo;\nSau khi kiểm tra điều kiện thụ lý đơn số ${currentDon.code} của Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'}, Ủy ban nhân dân quận nhận thấy:\nNội dung đơn không đủ điều kiện thụ lý giải quyết theo quy định của pháp luật.\nỦy ban nhân dân quận thông báo: Không thụ lý giải quyết nội dung đơn nêu trên để Ông/Bà được biết và thực hiện theo đúng quy định./.`,
    },
    {
      title: 'Giấy mời làm việc xác minh (Mẫu 18/GM)',
      type: 'giay_moi' as const,
      ten: 'Giấy mời làm việc xác minh nội dung đơn',
      soHieu: '18/GM-TCD',
      trichYeu: `V/v Mời làm việc xác minh nội dung đơn số ${currentDon.code}`,
      thoiGian: '09:00 ngày 18/09/2026',
      diaDiem: 'Phòng Tiếp công dân & Xử lý đơn (Phòng 102, Trụ sở UBND quận)',
      nguoiNhan: currentDon.nguoiNop || 'Nguyễn Văn A',
      noiDung: `Kính mời Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'} có mặt tại Phòng Tiếp công dân để làm việc về nội dung đơn đề ngày 16/09/2026.\nKhi đi mang theo Căn cước công dân và toàn bộ bản chính tài liệu, chứng cứ có liên quan đến việc phản ánh/tố cáo để đối chiếu, xác minh làm rõ theo quy định pháp luật.`,
    },
    {
      title: 'Biên bản làm việc xác minh (Mẫu 02/BB)',
      type: 'bien_ban' as const,
      ten: 'Biên bản làm việc xác minh thông tin ban đầu',
      soHieu: '02/BB-XM',
      trichYeu: `Biên bản ghi nhận ý kiến và giao nhận tài liệu hồ sơ ${currentDon.code}`,
      thoiGian: '14:30 ngày 17/09/2026',
      diaDiem: 'Phòng Tiếp công dân & Xử lý đơn',
      nguoiNhan: `${currentDon.nguoiNop || 'Nguyễn Văn A'} (Công dân đứng đơn)`,
      noiDung: `Hồi 14 giờ 30 phút, ngày 17/09/2026, tại Phòng Tiếp công dân & Xử lý đơn.\nThành phần làm việc gồm:\n1. Cán bộ thụ lý: Nguyễn Minh Anh - Chuyên viên thụ lý giải quyết đơn.\n2. Người làm việc: Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'} (Người đứng đơn).\nNội dung làm việc:\nCán bộ đã tiến hành làm rõ các mốc thời gian, đối tượng có hành vi sai phạm được nêu trong đơn. Công dân khẳng định nội dung đơn gửi là hoàn toàn chính xác, cam kết chịu trách nhiệm trước pháp luật.\nCông dân đã giao nộp bản sao chứng thực Hợp đồng góp vốn, phiếu nộp tiền và biên bản làm việc với Chi nhánh Văn phòng Đăng ký đất đai.\nBiên bản được lập thành 02 bản có giá trị như nhau, đọc lại cho các bên cùng nghe và ký tên xác nhận.`,
    },
    {
      title: 'Công văn đề nghị phối hợp xác minh (CV-UBND)',
      type: 'cong_van' as const,
      ten: 'Công văn đề nghị cung cấp hồ sơ, tài liệu phục vụ xác minh',
      soHieu: '105/CV-UBND',
      trichYeu: `V/v Đề nghị cung cấp hồ sơ địa chính và tình trạng giải quyết liên quan đến đơn ${currentDon.code}`,
      thoiGian: 'Thời hạn cung cấp: Trong 03 ngày làm việc',
      diaDiem: 'Gửi qua Trục liên thông văn bản điện tử thành phố',
      nguoiNhan: 'Chi nhánh Văn phòng Đăng ký đất đai quận Cầu Giấy',
      noiDung: `Để có đầy đủ căn cứ xác minh, giải quyết đơn phản ánh/tố cáo của công dân ${currentDon.nguoiNop || 'Nguyễn Văn A'} theo đúng quy định pháp luật;\nPhòng Tiếp công dân & Xử lý đơn kính đề nghị Quý cơ quan kiểm tra, rà soát và cung cấp toàn bộ hồ sơ đăng ký cấp GCNQSDĐ của đương sự trước ngày 20/09/2026.\nVăn bản phúc đáp và tài liệu gửi kèm đề nghị chuyển qua Trục liên thông văn bản điện tử của thành phố.`,
    },
    {
      title: 'Thông báo yêu cầu bổ sung hồ sơ (Mẫu 02/TB)',
      type: 'thong_bao' as const,
      ten: 'Thông báo yêu cầu bổ sung thông tin, tài liệu chứng cứ',
      soHieu: '19/TB-TCD',
      trichYeu: `V/v Yêu cầu bổ sung tài liệu chứng cứ đối với đơn ${currentDon.code}`,
      thoiGian: 'Thời hạn bổ sung: 10 ngày kể từ ngày nhận thông báo',
      diaDiem: 'Bộ phận Tiếp nhận & Trả kết quả một cửa',
      nguoiNhan: currentDon.nguoiNop || 'Nguyễn Văn A',
      noiDung: `Qua kiểm tra nội dung đơn số ${currentDon.code} của Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'}, cơ quan thụ lý nhận thấy hồ sơ chưa có đầy đủ tài liệu chứng cứ gốc chứng minh hành vi sai phạm.\nĐể có cơ sở xem xét thụ lý theo quy định tại Điều 29 Luật Tố cáo 2018, đề nghị Ông/Bà bổ sung:\n1. Bản sao có chứng thực giấy chứng nhận quyền sử dụng đất;\n2. Giấy tờ ủy quyền (nếu có đại diện);\n3. Tài liệu giao dịch tài chính có xác nhận ngân hàng.\nHết thời hạn 10 ngày nêu trên, nếu không bổ sung thì đơn sẽ không đủ điều kiện để thụ lý giải quyết.`,
    },
  ];

  // Modal thêm văn bản / quyết định xử lý
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    soHieu: '',
    category: 'Quyết định tố tụng',
    stepBelongsTo: 'Bước 3: Phân công thụ lý & Xác minh',
    coQuanBanHanh: isToGiac ? 'Cơ quan CSĐT Công an TP. Hà Nội' : 'UBND quận/huyện',
    signer: isToGiac ? 'Thượng tá Trần Quốc Dũng - Phó Thủ trưởng CQĐT' : 'Chủ tịch UBND quận',
    previewExcerpt: '',
    pages: 2,
    size: '680 KB',
    isSignedVGCA: true,
    autoOcr: true,
    file: null as File | null,
    fileUrl: '' as string | undefined,
  });

  // Sync count to parent
  useEffect(() => {
    onDocCountChange?.(documents.length);
  }, [documents.length, onDocCountChange]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Các mẫu văn bản / quyết định xử lý phổ biến
  const QUICK_TEMPLATES = [
    {
      title: 'Quyết định phân công thụ lý / Điều tra viên',
      category: 'Quyết định tố tụng',
      soHieu: '45/QĐ-PC03',
      step: 'Bước 3: Phân công Điều tra viên',
      excerpt: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nCƠ QUAN CSĐT CÔNG AN TP. HÀ NỘI\nSố: 45/QĐ-PC03\n\nQUYẾT ĐỊNH\nPhân công Phó Thủ trưởng Cơ quan điều tra và Điều tra viên thụ lý giải quyết nguồn tin về tội phạm\n\nCăn cứ Điều 36, Điều 145 và Điều 146 Bộ luật Tố tụng hình sự 2015;\nXét đơn tố giác tội phạm số ${currentDon.code} của công dân ${currentDon.nguoiNop};\n\nQUYẾT ĐỊNH:\nĐiều 1. Phân công Trung tá Lê Văn Nam - Điều tra viên chính thụ lý xác minh nguồn tin.\nĐiều 2. Thời hạn giải quyết nguồn tin là 20 ngày kể từ ngày ban hành quyết định này.`,
    },
    {
      title: 'Thông báo thụ lý giải quyết đơn',
      category: 'Thông báo thụ lý',
      soHieu: '22/TB-TL',
      step: 'Bước 2: Thông báo thụ lý',
      excerpt: `THÔNG BÁO\nVề việc thụ lý giải quyết đơn thư\n\nKính gửi: Ông/bà ${currentDon.nguoiNop}\nCơ quan có thẩm quyền thông báo đã tiếp nhận và chính thức thụ lý giải quyết nội dung đơn số ${currentDon.code}.\nThời hạn giải quyết theo quy định của pháp luật hiện hành. Đề nghị người làm đơn phối hợp cung cấp tài liệu khi có yêu cầu.`,
    },
    {
      title: 'Quyết định thành lập Tổ / Đoàn xác minh',
      category: 'Quyết định hành chính',
      soHieu: '108/QĐ-UBND',
      step: 'Bước 3: Thành lập Tổ xác minh',
      excerpt: `QUYẾT ĐỊNH\nVề việc thành lập Tổ xác minh nội dung đơn\n\nCăn cứ Luật Khiếu nại, Luật Tố cáo;\nQUYẾT ĐỊNH:\nĐiều 1. Thành lập Tổ xác minh gồm 03 đồng chí do Trưởng phòng chuyên môn làm Tổ trưởng.\nĐiều 2. Tổ xác minh có trách nhiệm kiểm tra thực địa, thu thập chứng cứ và báo cáo kết quả trong 15 ngày làm việc.`,
    },
    {
      title: 'Công văn yêu cầu tra soát tài chính / Sao kê ngân hàng',
      category: 'Công văn phối hợp',
      soHieu: '92/CV-CQĐT',
      step: 'Bước 4: Xác minh dòng tiền & Chứng cứ',
      excerpt: `CÔNG VĂN YÊU CẦU CUNG CẤP THÔNG TIN TÀI LIỆU\n\nKính gửi: Các Ngân hàng TMCP trên địa bàn thành phố\nCơ quan điều tra đang tiến hành thụ lý xác minh nguồn tin tố giác lừa đảo chiếm đoạt tài sản.\nĐề nghị Quý Ngân hàng phối hợp cung cấp lịch sử giao dịch và bản in sao kê tài khoản của các đối tượng liên quan theo danh sách đính kèm.`,
    },
    {
      title: 'Biên bản làm việc / Ghi lời khai người làm đơn',
      category: 'Biên bản làm việc',
      soHieu: 'BB-01/XL',
      step: 'Bước 4: Làm việc & Thu thập chứng cứ',
      excerpt: `BIÊN BẢN LÀM VIỆC & GHI LỜI KHAI\n\nHồi 09 giờ 00 phút, ngày 17/09/2026 tại Trụ sở cơ quan.\nThành phần tham gia:\n1. Cán bộ thụ lý / Điều tra viên: Nguyễn Minh Anh\n2. Người được mời làm việc: ${currentDon.nguoiNop}\nNội dung làm việc: Xác minh làm rõ nội dung đơn số ${currentDon.code}, đối chiếu các giao dịch tài chính và bổ sung tài liệu chứng cứ gốc.`,
    },
    {
      title: 'Phiếu hướng dẫn / Yêu cầu bổ sung chứng cứ',
      category: 'Văn bản hướng dẫn',
      soHieu: '14/HD-TTD',
      step: 'Bước 2: Kiểm tra chứng cứ gốc',
      excerpt: `PHIẾU HƯỚNG DẪN BỔ SUNG TÀI LIỆU, CHỨNG CỨ\n\nKính gửi: Ông/bà ${currentDon.nguoiNop}\nSau khi kiểm tra hồ sơ số ${currentDon.code}, cơ quan thụ lý đề nghị công dân bổ sung các tài liệu sau:\n1. Bản in sao kê ngân hàng có dấu đỏ xác nhận của tổ chức tín dụng;\n2. Văn bản ủy quyền có chứng thực của cơ quan công chứng có thẩm quyền.\nThời hạn bổ sung: Trong vòng 07 ngày làm việc.`,
    },
  ];

  const handleApplyTemplate = (tpl: (typeof QUICK_TEMPLATES)[0]) => {
    const cleanFileName = tpl.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');

    setAddForm((prev) => ({
      ...prev,
      name: `${cleanFileName}_so_${tpl.soHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      soHieu: tpl.soHieu,
      category: tpl.category,
      stepBelongsTo: tpl.step,
      previewExcerpt: tpl.excerpt,
      pages: Math.floor(Math.random() * 3 + 1),
      size: `${Math.floor(Math.random() * 500 + 350)} KB`,
    }));
  };

  const handleOpenAddModal = () => {
    // Mặc định chọn mẫu đầu tiên
    handleApplyTemplate(QUICK_TEMPLATES[0]);
    setShowAddModal(true);
  };

  const handleSaveAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      alert('Vui lòng nhập tên tệp tin văn bản hoặc quyết định!');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newDoc: DocItem = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      name: addForm.name.includes('.') ? addForm.name : `${addForm.name}.pdf`,
      category: addForm.category,
      soHieu: addForm.soHieu || `${Math.floor(Math.random() * 89 + 10)}/QĐ`,
      size: addForm.size || '520 KB',
      pages: addForm.pages || 2,
      uploadDate: timeStr,
      signer: `${addForm.signer}${addForm.isSignedVGCA ? ' (Ký số VGCA)' : ''}`,
      coQuanBanHanh: addForm.coQuanBanHanh,
      stepBelongsTo: addForm.stepBelongsTo,
      ocrStatus: 'Hoàn tất',
      isProcessDoc: true,
      fileUrl: addForm.fileUrl,
      trangThai: addForm.fileUrl ? 'da_dinh_kem' : 'du_thao',
      previewExcerpt: addForm.previewExcerpt || `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\n${addForm.name}\nSố: ${addForm.soHieu}\nBan hành bởi: ${addForm.coQuanBanHanh}\nNgười ký: ${addForm.signer}\nNội dung: Tài liệu phát sinh trong quá trình xử lý đơn ${currentDon.code}.`,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setShowAddModal(false);
    handleStartEdit(newDoc);
    showToast(`✓ Đã thêm văn bản / quyết định "${newDoc.name}" vào hồ sơ xử lý thành công!`);
  };

  const handleDeleteDoc = (docId: string, docName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa văn bản "${docName}" khỏi hồ sơ vụ việc?`)) {
      setDocuments((prev) => {
        const next = prev.filter((d) => d.id !== docId);
        if (activeEditingDoc?.id === docId) {
          if (next.length > 0) {
            handleStartEdit(next[0]);
          } else {
            setActiveEditingDoc(null);
          }
        }
        return next;
      });
      showToast(`✓ Đã xóa văn bản "${docName}".`);
    }
  };

  // =========================================================================
  // XỬ LÝ TẢI TỆP TIN LÊN (FILE UPLOAD & DRAG DROP & OCR PARSING)
  // =========================================================================
  const processUploadedFiles = (files: File[]) => {
    if (!files || files.length === 0) return;

    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newDocs: DocItem[] = files.map((file, idx) => {
      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

      // Nhận diện phân loại thông minh theo tên file
      let category = 'Tài liệu đính kèm';
      let loaiVanBan: DocItem['loaiVanBan'] = 'khac';
      let stepBelongsTo = 'Bước 1: Tiếp nhận & Hồ sơ đơn';

      const lower = file.name.toLowerCase();
      if (lower.includes('don') || lower.includes('to_cao') || lower.includes('khieu_nai')) {
        category = 'Hồ sơ đơn (Bản quét)';
        loaiVanBan = 'khac';
        stepBelongsTo = 'Bước 1: Tiếp nhận & Vào sổ';
      } else if (lower.includes('cccd') || lower.includes('cmnd') || lower.includes('can_cuoc') || lower.includes('dinh_danh')) {
        category = 'Giấy tờ nhân thân';
        loaiVanBan = 'khac';
        stepBelongsTo = 'Bước 1: Tiếp nhận hồ sơ';
      } else if (lower.includes('gcn') || lower.includes('so_do') || lower.includes('dat') || lower.includes('dia_chinh') || lower.includes('ban_do')) {
        category = 'Hồ sơ kỹ thuật / Địa chính';
        loaiVanBan = 'khac';
        stepBelongsTo = 'Bước 2: Kiểm tra chứng cứ & Thụ lý';
      } else if (lower.includes('bien_ban') || lower.includes('bb')) {
        category = 'Biên bản làm việc';
        loaiVanBan = 'bien_ban';
        stepBelongsTo = 'Bước 4: Xác minh thực tế';
      } else if (lower.includes('cong_van') || lower.includes('cv')) {
        category = 'Công văn phối hợp';
        loaiVanBan = 'cong_van';
        stepBelongsTo = 'Bước 4: Phối hợp cơ quan chức năng';
      } else if (lower.includes('quyet_dinh') || lower.includes('qd')) {
        category = 'Quyết định hành chính';
        loaiVanBan = 'quyet_dinh';
        stepBelongsTo = 'Bước 3: Phân công thụ lý';
      }

      const randomPages = ext === 'pdf' ? Math.floor(Math.random() * 3 + 1) : 1;
      const soHieu = `TL-${Math.floor(1000 + Math.random() * 9000)}`;

      return {
        id: `DOC-UP-${Date.now()}-${idx}`,
        name: file.name,
        category,
        soHieu,
        size: sizeStr,
        pages: randomPages,
        uploadDate: timeStr,
        signer: currentDon.nguoiNop || 'Công dân nộp trực tiếp',
        coQuanBanHanh: 'Hồ sơ do công dân cung cấp',
        stepBelongsTo,
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        isEditable: true,
        loaiVanBan,
        tenVanBan: cleanName,
        trangThai: 'da_dinh_kem',
        trichYeu: `Tài liệu đính kèm: ${file.name}. Nguồn cung cấp: ${currentDon.nguoiNop || 'Công dân nộp trực tiếp'}. Đã kiểm tra tính toàn vẹn chữ ký và dữ liệu.`,
        previewExcerpt: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nTHÔNG TIN TÀI LIỆU ĐÍNH KÈM (KẾT QUẢ AI OCR):\nTên tệp: ${file.name}\nDung lượng: ${sizeStr} • Định dạng: ${ext.toUpperCase()}\nThời gian tiếp nhận: ${timeStr}\nNgười giao nộp: ${currentDon.nguoiNop || 'Người nộp đơn'}\nHồ sơ tiếp nhận vụ việc: ${currentDon.code}\n\n[NỘI DUNG TÀI LIỆU TRÍCH XUẤT]:\n- Toàn bộ nội dung tệp tin đã được số hóa an toàn và đưa vào hệ thống lưu trữ hồ sơ nghiệp vụ.\n- Mã băm kiểm định tính toàn vẹn: SHA-256 Verified.`,
        fileUrl: URL.createObjectURL(file),
      };
    });

    setDocuments((prev) => [...newDocs, ...prev]);
    if (newDocs.length > 0) {
      handleStartEdit(newDocs[0]);
    }
    showToast(`✓ Đã tải lên thành công ${files.length} tệp tin vào hồ sơ vụ việc!`);
  };

  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUploadedFiles(Array.from(files));
      e.target.value = '';
    }
  };

  const handleModalFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      let fileUrl = '';
      try {
        fileUrl = URL.createObjectURL(file);
      } catch {
        // ignore
      }

      setAddForm((prev) => ({
        ...prev,
        name: file.name,
        size: sizeStr,
        pages: file.name.endsWith('.pdf') ? Math.floor(Math.random() * 3 + 1) : 1,
        file: file,
        fileUrl: fileUrl,
      }));
      showToast(`✓ Đã nhận tệp "${file.name}" (${sizeStr}) vào form.`);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUploadedFiles(Array.from(files));
    }
  };

  // Tự động chọn tài liệu xem ban đầu nếu chưa có tài liệu nào được chọn
  useEffect(() => {
    if (!activeEditingDoc && documents.length > 0) {
      const bc = documents.find((d) => d.loaiVanBan === 'bao_cao_de_xuat' || d.loaiVanBan === 'bao_cao_xac_minh');
      handleStartEdit(bc || documents[0]);
    }
  }, [documents, activeEditingDoc]);

  const handleOpenPreview = (doc: DocItem) => {
    setSelectedDoc(doc);
    setShowPreviewModal(true);
    setPreviewZoom(100);
  };

  const processDocsCount = documents.filter((d) => d.isProcessDoc).length;
  const initialDocsCount = documents.filter((d) => !d.isProcessDoc).length;

  const verificationDocs = documents.filter(
    (d) =>
      d.fromXacMinh ||
      d.loaiVanBan === 'giay_moi' ||
      d.loaiVanBan === 'bien_ban' ||
      d.loaiVanBan === 'cong_van' ||
      d.loaiVanBan === 'thong_bao' ||
      d.stepBelongsTo?.includes('Xác minh') ||
      (sharedVanBanList && sharedVanBanList.some((s) => s.id === d.id || s.soKyHieu === d.soHieu))
  );

  const filteredDocs = documents.filter((doc) => {
    const matchTab =
      filterTab === 'all' ||
      (filterTab === 'process' && doc.isProcessDoc) ||
      (filterTab === 'initial' && !doc.isProcessDoc);

    const matchSearch =
      !searchKeyword.trim() ||
      doc.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (doc.soHieu && doc.soHieu.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      doc.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      doc.signer.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchTab && matchSearch;
  });

  const isEditingBaoCao = Boolean(
    activeEditingDoc &&
    (activeEditingDoc.loaiVanBan === 'bao_cao_de_xuat' ||
      activeEditingDoc.loaiVanBan === 'bao_cao_xac_minh' ||
      activeEditingDoc.tenVanBan?.includes('Báo cáo') ||
      activeEditingDoc.name.toLowerCase().includes('bao_cao'))
  );
  const isThongBaoKhongThuLy = Boolean(
    activeEditingDoc &&
    (activeEditingDoc.category?.includes('không thụ lý') ||
      activeEditingDoc.tenVanBan?.toLowerCase().includes('không thụ lý') ||
      activeEditingDoc.soHieu?.includes('TB-KTL') ||
      Boolean(activeEditingDoc.lyDoChinh) ||
      activeEditingDoc.name?.toLowerCase().includes('khong_thu_ly'))
  );
  const activeBaoCaoFormData = (activeEditingDoc?.formData || {}) as Partial<BaoCaoDeXuatFormData>;

  return (
    <div className="space-y-5 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl text-xs font-semibold border border-slate-700/80 animate-fade-in ring-1 ring-white/10">
          <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0">check_circle</span>
          <span className="leading-snug">{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BỐ CỤC SPLIT VIEW: DANH SÁCH VĂN BẢN (TRÁI) & XEM TRƯỚC SOẠN THẢO A4 (PHẢI) */}
      {/* ========================================================================= */}
      <div className={`grid grid-cols-1 ${isFullscreenViewer ? 'xl:grid-cols-1' : 'xl:grid-cols-12'} gap-5 items-start`}>
        {/* ========================================================================= */}
        {/* CỘT 1 (BÊN TRÁI): DANH SÁCH CÁC VĂN BẢN & HỒ SƠ (xl:col-span-5)           */}
        {/* ========================================================================= */}
        {!isFullscreenViewer && (
          <div className="xl:col-span-5 space-y-3.5 flex flex-col">
            {/* 1. Header Card Cột Trái: Tiêu đề + Thao tác Tạo văn bản */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#004ac6] shrink-0 shadow-2xs">
                    <span className="material-symbols-outlined text-[20px]">folder_open</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                      <span>Danh mục văn bản &amp; hồ sơ</span>
                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-mono font-extrabold bg-blue-100 text-[#004ac6]">
                        {filteredDocs.length}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-[240px]">
                      Hồ sơ: <span className="font-mono font-bold text-slate-700">{currentDon.code}</span>
                    </p>
                  </div>
                </div>

                {/* Các nút hành động: Tải file & Tạo theo bước & + Tạo văn bản */}
                <div className="flex items-center gap-1.5 relative">
                  {/* Native file input để chọn file trực tiếp từ máy tính */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                    onChange={handleDirectFileUpload}
                    className="hidden"
                  />

                  {/* Nút Tải file từ máy tính */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Tải văn bản / tài liệu đính kèm từ máy tính (PDF, Word, Excel, Ảnh)"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>Tải file</span>
                  </button>

                  {/* Dropdown Menu Tạo theo bước */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowStepMenu(!showStepMenu)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#004ac6] hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Tạo văn bản theo các bước quy trình nghiệp vụ xử lý đơn"
                    >
                      <span className="material-symbols-outlined text-[16px]">account_tree</span>
                      <span>Tạo theo bước</span>
                      <span className="material-symbols-outlined text-[15px] transition-transform duration-200">
                        {showStepMenu ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>

                    {/* Popover / Dropdown 5 bước quy trình */}
                    {showStepMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowStepMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-3 space-y-2.5 max-h-[80vh] overflow-y-auto animate-scale-up">
                          <div className="p-1 pb-2 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                              <span className="material-symbols-outlined text-[18px] text-[#004ac6]">alt_route</span>
                              <span>Chọn biểu mẫu văn bản theo bước</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowStepMenu(false)}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>

                          {/* 5 Nhóm bước */}
                          {[1, 2, 3, 4, 5].map((stepNum) => {
                            const stepItems = WORKFLOW_STEPS_DOCS.filter((s) => s.stepNumber === stepNum);
                            const stepTitle = stepItems[0]?.stepTitle || `Bước ${stepNum}`;
                            const stepColors = [
                              { bg: 'bg-indigo-50/70', border: 'border-indigo-200', text: 'text-indigo-800', dot: 'bg-indigo-600' },
                              { bg: 'bg-blue-50/70', border: 'border-blue-200', text: 'text-blue-800', dot: 'bg-blue-600' },
                              { bg: 'bg-purple-50/70', border: 'border-purple-200', text: 'text-purple-800', dot: 'bg-purple-600' },
                              { bg: 'bg-amber-50/70', border: 'border-amber-200', text: 'text-amber-800', dot: 'bg-amber-600' },
                              { bg: 'bg-emerald-50/70', border: 'border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-600' },
                            ][stepNum - 1];

                            return (
                              <div key={stepNum} className={`p-2.5 rounded-xl border ${stepColors.border} ${stepColors.bg} space-y-2`}>
                                <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-800">
                                  <span className={`w-2 h-2 rounded-full ${stepColors.dot}`}></span>
                                  <span>Bước {stepNum}: {stepTitle}</span>
                                </div>
                                <div className="space-y-1.5 pl-1">
                                  {stepItems.map((tpl) => (
                                    <button
                                      key={tpl.id}
                                      type="button"
                                      onClick={() => handleCreateDocFromStep(tpl)}
                                      className="w-full text-left p-2 rounded-xl bg-white hover:bg-blue-50/40 hover:shadow-xs border border-slate-200/80 transition-all flex items-start gap-2 group cursor-pointer"
                                    >
                                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                                        {tpl.docCode}
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-bold text-slate-800 group-hover:text-[#004ac6] truncate transition-colors">
                                          {tpl.docTitle}
                                        </p>
                                        <p className="text-[10px] text-slate-500 line-clamp-1">
                                          {tpl.trichYeu}
                                        </p>
                                      </div>
                                      <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-[#004ac6] group-hover:translate-x-0.5 transition-all shrink-0">
                                        add_circle
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Nút + Tạo văn bản (Mở Modal Thêm mới) */}
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                    title="Mở form tạo văn bản mới tùy chỉnh"
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-600">post_add</span>
                    <span className="hidden sm:inline">Tạo mới</span>
                  </button>
                </div>
              </div>

              {/* Ô tìm kiếm & Bộ lọc */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[17px] text-slate-400 pointer-events-none">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Tìm theo tên tệp, số hiệu, người ký..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#004ac6] focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={() => setSearchKeyword('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">cancel</span>
                    </button>
                  )}
                </div>

                {/* Tabs lọc */}
                <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${filterTab === 'all'
                      ? 'bg-white text-[#004ac6] shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Tất cả ({documents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('process')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${filterTab === 'process'
                      ? 'bg-white text-purple-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Quy trình ({processDocsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('initial')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${filterTab === 'initial'
                      ? 'bg-white text-rose-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Tiếp nhận ({initialDocsCount})
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Danh sách các Cards văn bản (Hỗ trợ kéo thả tệp tin Drag & Drop) */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`space-y-2.5 max-h-[calc(100vh-310px)] min-h-[440px] overflow-y-auto pr-1 relative transition-all rounded-2xl ${
                isDraggingOver ? 'ring-2 ring-emerald-500 bg-emerald-50/40 p-2' : ''
              }`}
            >
              {/* Overlay trực quan khi đang kéo thả tệp vào danh sách */}
              {isDraggingOver && (
                <div className="absolute inset-0 z-30 bg-emerald-50/95 border-2 border-dashed border-emerald-500 rounded-2xl flex flex-col items-center justify-center pointer-events-none backdrop-blur-xs p-6 text-center animate-fade-in shadow-lg">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-xs animate-bounce">
                    <span className="material-symbols-outlined text-[36px]">cloud_upload</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-emerald-950">Thả tệp tin vào đây để tải lên ngay</h4>
                  <p className="text-xs text-emerald-700 mt-1 max-w-xs font-medium">
                    Hỗ trợ định dạng PDF, Word, Excel, Hình ảnh (Tự động nhận diện phân loại hồ sơ &amp; trích xuất thể thức)
                  </p>
                </div>
              )}

              {filteredDocs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-2xs space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[26px]">folder_off</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Không tìm thấy văn bản phù hợp</p>
                    <button
                      type="button"
                      onClick={() => { setFilterTab('all'); setSearchKeyword(''); }}
                      className="mt-1 text-xs font-bold text-[#004ac6] hover:underline cursor-pointer"
                    >
                      Xem tất cả danh mục
                    </button>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload_file</span>
                      <span>Tải file mới lên</span>
                    </button>
                  </div>
                </div>
              ) : (
                filteredDocs.map((doc) => {
                  const isSelected = activeEditingDoc?.id === doc.id;
                  const isBaoCao = doc.loaiVanBan === 'bao_cao_de_xuat' || doc.loaiVanBan === 'bao_cao_xac_minh';
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleStartEdit(doc)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${isSelected
                        ? 'border-[#004ac6] bg-blue-50/60 shadow-sm ring-1 ring-blue-300'
                        : 'border-slate-200/90 bg-white hover:border-blue-200 hover:bg-slate-50/60 hover:shadow-2xs'
                        }`}
                    >
                      {/* Highlight bar bên trái khi selected */}
                      {isSelected && (
                        <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-[#004ac6] rounded-r-full" />
                      )}

                      <div className="flex items-start gap-3">
                        {/* Icon loại văn bản */}
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${
                            doc.fileUrl || doc.trangThai === 'da_dinh_kem'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : isBaoCao
                              ? 'bg-blue-50 border-blue-200 text-[#004ac6]'
                              : doc.isProcessDoc
                              ? 'bg-purple-50 border-purple-200 text-purple-700'
                              : 'bg-rose-50 border-rose-200 text-rose-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {doc.fileUrl || doc.trangThai === 'da_dinh_kem'
                              ? 'attachment'
                              : isBaoCao
                              ? 'rate_review'
                              : doc.isProcessDoc
                              ? 'gavel'
                              : 'picture_as_pdf'}
                          </span>
                        </div>

                        {/* Thông tin chính */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`font-bold text-xs truncate max-w-[220px] ${isSelected ? 'text-[#004ac6]' : 'text-slate-900 group-hover:text-[#004ac6]'
                                }`}
                            >
                              {isBaoCao ? (doc.tenVanBan || 'Báo cáo kết quả xác minh') : doc.name}
                            </span>
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#004ac6] text-white">
                                Đang xem
                              </span>
                            )}
                            {(doc.fileUrl || doc.trangThai === 'da_dinh_kem') && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[11px]">attachment</span>
                                <span>Tệp tải lên</span>
                              </span>
                            )}
                          </div>

                          {/* Số hiệu + Loại + Bước */}
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[10px]">
                            {doc.soHieu && (
                              <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {doc.soHieu}
                              </span>
                            )}
                            {doc.stepBelongsTo && (
                              <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 truncate max-w-[150px]">
                                {doc.stepBelongsTo}
                              </span>
                            )}
                            {doc.signingStatus && (
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold border ${doc.signingStatus === 'nhap'
                                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                                  : doc.signingStatus === 'da_ky' || doc.signingStatus === 'hoan_tat'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : doc.signingStatus === 'yeu_cau_chinh_sua'
                                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                                      : 'bg-blue-100 text-blue-800 border-blue-200'
                                  }`}
                              >
                                {doc.signingStatus === 'nhap'
                                  ? 'Bản nháp'
                                  : doc.signingStatus === 'da_ky' || doc.signingStatus === 'hoan_tat'
                                    ? 'Đã ký'
                                    : doc.signingStatus === 'yeu_cau_chinh_sua'
                                      ? 'Cần sửa'
                                      : 'Chờ ký'}
                              </span>
                            )}
                          </div>

                          {/* Trích yếu tóm tắt */}
                          {(doc.trichYeu || doc.previewExcerpt) && (
                            <p className="text-[10.5px] text-slate-500 italic line-clamp-1 mt-1.5">
                              {doc.trichYeu || doc.previewExcerpt}
                            </p>
                          )}

                          {/* Footer của card: Người ký, ngày lập, thao tác nhanh */}
                          <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100/90 text-[10px] text-slate-500">
                            <div className="flex items-center gap-2 truncate">
                              <span className="truncate max-w-[130px] font-medium" title={doc.signer}>
                                {doc.signer}
                              </span>
                              <span>•</span>
                              <span className="font-mono">{doc.pages} tr</span>
                              <span>•</span>
                              <span>{doc.uploadDate?.split(' ')[0]}</span>
                            </div>

                            {/* Nút thao tác nhanh */}
                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              {isBaoCao ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onOpenBaoCaoDeXuat?.(doc)}
                                    className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                                    title="Chỉnh sửa thông tin báo cáo"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                  </button>
                                  {doc.signingStatus === 'nhap' && (
                                    <button
                                      type="button"
                                      onClick={() => handleTrinhKyFromRow(doc)}
                                      className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer shadow-2xs"
                                      title="Chuyển trình ký"
                                    >
                                      Trình ký
                                    </button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(doc)}
                                    className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                                    title="Mở xem văn bản này"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                  </button>
                                  {doc.isProcessDoc && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDoc(doc.id, doc.name)}
                                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                      title="Xóa văn bản này"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Thanh tải nhanh / Kéo thả tệp tin ở chân cột trái */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-800 transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-2xs active:scale-[0.99]"
              title="Bấm để chọn file hoặc kéo thả file từ máy tính vào đây"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate text-slate-800 group-hover:text-emerald-800">
                    Tải tệp tin bổ sung từ máy tính
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    Hỗ trợ kéo thả PDF, Word, Ảnh • Trích xuất OCR tự động
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 group-hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 transition-colors shadow-2xs">
                Chọn tệp
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CỘT 2 (BÊN PHẢI): TRÌNH XEM & SOẠN THẢO VĂN BẢN A4 CHUẨN                  */}
        {/* ========================================================================= */}
        <div className={`${isFullscreenViewer ? 'col-span-1' : 'xl:col-span-7'} space-y-3.5`}>
          {activeEditingDoc ? (
            <div className="space-y-3 animate-fade-in">
              {/* Studio Header Toolbar Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
                {/* 1. Trái: Tên văn bản + Số hiệu + Trạng thái */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#004ac6] shrink-0">
                    <span className="material-symbols-outlined text-[18px]">
                      {isEditingBaoCao ? 'rate_review' : isThongBaoKhongThuLy ? 'gavel' : 'description'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[280px]">
                        {isEditingBaoCao ? (activeEditingDoc.tenVanBan || 'Báo cáo kết quả xác minh') : (editTenVanBan || activeEditingDoc.name)}
                      </h4>
                      {editSoHieu && (
                        <span className="font-mono font-bold text-[10.5px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                          {editSoHieu}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500">
                      <span>Loại: <strong className="text-slate-700">{activeEditingDoc.category || 'Văn bản'}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeEditingDoc.signingStatus === 'da_ky' ? 'bg-emerald-500' : activeEditingDoc.signingStatus === 'cho_trinh' ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                        <span>{activeEditingDoc.signingStatus === 'da_ky' ? 'Đã ký số VGCA' : activeEditingDoc.signingStatus === 'cho_trinh' ? 'Đang trình ký' : 'Dự thảo'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Giữa & Phải: Zoom + Fullscreen + Nhóm nút Thao tác */}
                <div className="flex items-center gap-2 flex-wrap ml-auto">
                  {/* Cụm Zoom & Fullscreen */}
                  <div className="flex items-center bg-slate-100/90 border border-slate-200 rounded-xl p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setEditorZoom((z) => Math.max(z - 10, 60))}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                      title="Thu nhỏ mặt giấy"
                    >
                      <span className="material-symbols-outlined text-[16px]">zoom_out</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorZoom(100)}
                      className="px-1.5 h-7 flex items-center justify-center font-mono text-[11px] font-bold text-slate-700 hover:text-[#004ac6] cursor-pointer"
                      title="Đặt lại 100%"
                    >
                      {editorZoom}%
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorZoom((z) => Math.min(z + 10, 140))}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                      title="Phóng to mặt giấy"
                    >
                      <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
                    <button
                      type="button"
                      onClick={() => setIsFullscreenViewer(!isFullscreenViewer)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${isFullscreenViewer ? 'bg-[#004ac6] text-white shadow-xs' : 'hover:bg-white text-slate-600'}`}
                      title={isFullscreenViewer ? 'Thu nhỏ về chế độ 2 cột' : 'Phóng to toàn màn hình'}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        {isFullscreenViewer ? 'fullscreen_exit' : 'fullscreen'}
                      </span>
                    </button>
                  </div>

                  {/* Nút Chỉnh sửa thông tin Báo cáo (Mở popup form) */}
                  {isEditingBaoCao && onOpenBaoCaoDeXuat && (
                    <button
                      type="button"
                      onClick={() => onOpenBaoCaoDeXuat(activeEditingDoc)}
                      className="px-3 py-1.5 rounded-xl border border-blue-300 bg-blue-50/90 hover:bg-blue-100 text-[#004ac6] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                      title="Mở popup để chỉnh sửa các trường thông tin Báo cáo đề xuất"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                      <span>Sửa thông tin</span>
                    </button>
                  )}

                  {/* Nhóm nút Lưu & Đi trình ký */}
                  {isEditingBaoCao ? (
                    activeEditingDoc.signingStatus === 'nhap' ? (
                      <button
                        type="button"
                        onClick={handleTrinhKyBaoCaoDirect}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
                        title="Chuyển Báo cáo kết quả xác minh sang luồng trình ký Lãnh đạo"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        <span>Đi trình ký</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Đã trình ký</span>
                      </span>
                    )
                  ) : isThongBaoKhongThuLy ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSaveDirectEdit}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        title="Lưu lại các chỉnh sửa trên văn bản"
                      >
                        <span className="material-symbols-outlined text-[15px]">save</span>
                        <span>Lưu</span>
                      </button>
                      {activeEditingDoc.signingStatus === 'nhap' ? (
                        <button
                          type="button"
                          onClick={handleTrinhKyKhongThuLyDirect}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
                          title="Chuyển Thông báo không thụ lý sang luồng trình ký Lãnh đạo"
                        >
                          <span className="material-symbols-outlined text-[16px]">send</span>
                          <span>Trình ký</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>Đã trình ký</span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSaveDirectEdit}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        title="Lưu lại các chỉnh sửa trên văn bản"
                      >
                        <span className="material-symbols-outlined text-[15px]">save</span>
                        <span>Lưu</span>
                      </button>
                      {activeEditingDoc.signingStatus === 'nhap' && (
                        <button
                          type="button"
                          onClick={() => handleTrinhKyFromRow(activeEditingDoc)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
                          title="Trình ký Lãnh đạo"
                        >
                          <span className="material-symbols-outlined text-[16px]">send</span>
                          <span>Trình ký</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Nút In ấn / Xuất bản */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors shadow-2xs"
                    title="In văn bản"
                  >
                    <span className="material-symbols-outlined text-[17px]">print</span>
                  </button>
                </div>
              </div>

              {/* Vùng Canvas A4 Sheet */}
              <div className="w-full bg-slate-200/70 rounded-2xl p-4 sm:p-8 flex justify-center border border-slate-300/80 overflow-x-auto shadow-inner min-h-[850px] relative">
                <div
                  className="bg-white shadow-2xl rounded-sm ring-1 ring-slate-900/10 w-full max-w-[840px] min-h-[1188px] p-8 sm:p-14 text-slate-900 font-serif relative transition-transform origin-top flex flex-col justify-between"
                  style={{ transform: `scale(${editorZoom / 100})` }}
                >
                  {/* Banner tệp gốc đính kèm nếu được tải lên từ máy tính */}
                  {(activeEditingDoc.fileUrl || activeEditingDoc.trangThai === 'da_dinh_kem') && (
                    <div className="mb-6 p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 rounded-xl flex items-center justify-between gap-3 font-sans shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <span className="material-symbols-outlined text-[20px]">attachment</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              Tệp tin gốc đính kèm: <strong className="font-mono">{activeEditingDoc.name}</strong>
                            </span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {activeEditingDoc.size || 'Đã tải lên'}
                            </span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-[#004ac6] border border-blue-200">
                              Trích xuất thể thức OCR
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Tệp tin đã được tải lên trực tiếp vào hồ sơ và hiển thị xem trước theo chuẩn thể thức văn bản hành chính A4.
                          </p>
                        </div>
                      </div>
                      {activeEditingDoc.fileUrl && (
                        <a
                          href={activeEditingDoc.fileUrl}
                          download={activeEditingDoc.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-2xs cursor-pointer active:scale-95"
                          title="Tải về hoặc mở tệp tin gốc"
                        >
                          <span className="material-symbols-outlined text-[16px] text-emerald-600">download</span>
                          <span>Tải tệp gốc</span>
                        </a>
                      )}
                    </div>
                  )}

                  {isEditingBaoCao ? (
                    /* ========================================================================= */
                    /* BIỂU MẪU CHUẨN: BÁO CÁO KẾT QUẢ XÁC MINH VỀ VIỆC GIẢI QUYẾT ĐƠN          */
                    /* ========================================================================= */
                    <div className="space-y-4 text-xs leading-relaxed font-serif text-slate-900">
                      {/* Header: Cơ quan ban hành & Quốc hiệu tiêu ngữ */}
                      <div className="grid grid-cols-2 gap-4 text-center pb-4 border-b border-slate-300">
                        <div className="space-y-0.5 text-center">
                          <p className="uppercase font-medium text-slate-700 text-[11px]">
                            {activeBaoCaoFormData.coQuanCapTren || editCoQuanCapTren || 'CÔNG AN TP. HÀ NỘI'}
                          </p>
                          <p className="uppercase font-bold text-slate-900 text-xs tracking-tight">
                            {activeBaoCaoFormData.coQuanLap || editCoQuanBanHanh || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA'}
                          </p>
                          <div className="w-20 h-px bg-slate-800 mx-auto my-1"></div>
                          <p className="font-mono text-[11px] text-slate-800">
                            Số: <strong>{activeBaoCaoFormData.soBaoCao || editSoHieu}</strong>
                          </p>
                        </div>
                        <div className="space-y-0.5 text-center">
                          <p className="font-bold uppercase text-slate-900 text-xs tracking-wider">
                            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                          </p>
                          <p className="font-bold text-slate-900 text-xs">
                            Độc lập - Tự do - Hạnh phúc
                          </p>
                          <div className="w-28 h-px bg-slate-800 mx-auto my-1"></div>
                          <p className="italic text-[11px] text-slate-700 pt-0.5">
                            Hà Nội, ngày {(activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026').split('/')[0] || '16'} tháng{' '}
                            {(activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026').split('/')[1] || '09'} năm{' '}
                            {(activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026').split('/')[2] || '2026'}
                          </p>
                        </div>
                      </div>

                      {/* Tiêu đề văn bản */}
                      <div className="text-center pt-4 pb-2">
                        <h1 className="text-center uppercase font-bold text-base sm:text-lg text-slate-900 tracking-wide">
                          BÁO CÁO KẾT QUẢ XÁC MINH
                        </h1>
                        <p className="text-center italic text-xs text-slate-700 mt-1">
                          Về việc giải quyết đơn (tố giác/tin báo/kiến nghị khởi tố) của ông/bà{' '}
                          <strong>{activeBaoCaoFormData.nguoiGuiDon || currentDon.nguoiNop}</strong>
                        </p>
                      </div>

                      {/* Kính gửi */}
                      <div className="py-1">
                        <p className="text-xs">
                          <strong>Kính gửi:</strong>{' '}
                          {activeBaoCaoFormData.nguoiNhan || editNguoiNhan || 'Thủ trưởng (Phó Thủ trưởng) Cơ quan Điều tra'}
                        </p>
                      </div>

                      {/* Phân công & Cán bộ */}
                      <div className="py-2 space-y-1.5 text-justify text-xs leading-relaxed">
                        <p>
                          Thực hiện Phân công giải quyết nguồn tin về tội phạm số:{' '}
                          <strong>{activeBaoCaoFormData.soPhanCong || `${editSoHieu.replace(/\D/g, '') || '24'}/QĐ-CQĐT`}</strong>{' '}
                          ngày{' '}
                          <strong>{activeBaoCaoFormData.ngayPhanCong || activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026'}</strong>{' '}
                          của Thủ trưởng/Phó Thủ trưởng Cơ quan Điều tra;
                        </p>
                        <p>
                          Hôm nay, ngày {(activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026').split('/')[0] || '16'} tháng{' '}
                          {(activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026').split('/')[1] || '09'} năm{' '}
                          {(activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026').split('/')[2] || '2026'}, Điều tra viên / Cán bộ điều tra:{' '}
                          <strong>{activeBaoCaoFormData.nguoiLap || editSigner || 'Nguyễn Minh Anh'}</strong>
                        </p>
                        <p>
                          Đơn vị công tác:{' '}
                          <strong>{activeBaoCaoFormData.coQuanLap || editCoQuanBanHanh || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA'}</strong>
                        </p>
                        <p>
                          Tiến hành báo cáo kết quả xác minh đơn của:{' '}
                          <strong>{activeBaoCaoFormData.nguoiGuiDon || currentDon.nguoiNop}</strong>
                        </p>
                        <p>
                          Cư trú / Địa chỉ:{' '}
                          <strong>{activeBaoCaoFormData.diaChiNguoiGui || currentDon.diaChi || 'Quận Cầu Giấy, TP. Hà Nội'}</strong>
                        </p>
                        <p>
                          Nội dung đơn phản ánh / tố giác:{' '}
                          <em>{activeBaoCaoFormData.noiDungDon || currentDon.title || 'Tố giác hành vi vi phạm quy định pháp luật'}</em>
                        </p>
                      </div>

                      {/* I. KẾT QUẢ XÁC MINH */}
                      <div className="pt-2 pb-1 space-y-2 text-justify">
                        <h2 className="font-bold text-xs uppercase text-slate-900 tracking-wide border-b border-slate-200 pb-1">
                          I. KẾT QUẢ XÁC MINH
                        </h2>
                        <div>
                          <h3 className="font-bold text-slate-900 text-xs">1. Các tài liệu, chứng cứ đã thu thập:</h3>
                          <div className="pl-4 pt-1 whitespace-pre-line text-slate-800 leading-relaxed text-[11.5px]">
                            {activeBaoCaoFormData.taiLieuThuThap ||
                              '- Tài liệu, chứng cứ do người nộp đơn cung cấp: Đơn tố giác tội phạm (Bản chính); Bản sao CCCD; Bảng kê chứng từ giao dịch chuyển tiền và các tài liệu liên quan.\n- Tài liệu, chứng cứ do Cơ quan Điều tra thu thập: Biên bản tiếp nhận nguồn tin về tội phạm; Biên bản ghi lời khai người tố giác; Báo cáo xác minh hiện trường, nhân thân đối tượng.'}
                          </div>
                        </div>
                        <div className="pt-1.5">
                          <h3 className="font-bold text-slate-900 text-xs">2. Nội dung diễn biến sự việc được xác minh:</h3>
                          <div className="pl-4 pt-1 whitespace-pre-line text-slate-800 leading-relaxed text-[11.5px]">
                            {activeBaoCaoFormData.noiDungXacMinh ||
                              (editNoiDungChiTiet
                                ? editNoiDungChiTiet
                                : 'Qua công tác xác minh ban đầu, các nội dung tố giác của công dân có căn cứ thực tế. Đã làm rõ diễn biến hành vi, các giao dịch và tài liệu liên quan đến dấu hiệu vi phạm pháp luật hình sự; các đối tượng liên quan đã được triệu tập, lấy lời khai bước đầu.')}
                          </div>
                        </div>
                      </div>

                      {/* II. NHẬN XÉT VÀ ĐỀ XUẤT */}
                      <div className="pt-2 pb-1 space-y-2 text-justify">
                        <h2 className="font-bold text-xs uppercase text-slate-900 tracking-wide border-b border-slate-200 pb-1">
                          II. NHẬN XÉT VÀ ĐỀ XUẤT
                        </h2>
                        <div>
                          <h3 className="font-bold text-slate-900 text-xs">1. Đánh giá, nhận xét:</h3>
                          <div className="pl-4 pt-1 whitespace-pre-line text-slate-800 leading-relaxed text-[11.5px]">
                            {activeBaoCaoFormData.danhGiaNhanXet ||
                              '- Về tính chất, mức độ của sự việc: Vụ việc có tính chất nghiêm trọng, ảnh hưởng đến quyền lợi hợp pháp của công dân và tình hình an ninh trật tự trên địa bàn.\n- Về dấu hiệu tội phạm: Đã phát hiện đủ căn cứ dấu hiệu tội phạm theo quy định của Bộ luật Hình sự; vụ việc thuộc thẩm quyền thụ lý, giải quyết của Cơ quan Điều tra.'}
                          </div>
                          <div className="pl-4 pt-1.5 text-slate-800 text-[11.5px]">
                            <strong>- Căn cứ pháp lý:</strong>{' '}
                            {activeBaoCaoFormData.canCuPhapLy || 'Căn cứ Điều 145, 146, 147 Bộ luật Tố tụng hình sự năm 2015; Điều 174 Bộ luật Hình sự 2015.'}
                          </div>
                        </div>

                        <div className="pt-1.5">
                          <h3 className="font-bold text-slate-900 text-xs">2. Đề xuất xử lý:</h3>
                          <p className="pl-4 pt-1 italic text-slate-800 text-[11.5px]">
                            Kính đề nghị Thủ trưởng (Phó Thủ trưởng) Cơ quan Điều tra xem xét, phê duyệt các nội dung sau:
                          </p>
                          <div className="pl-4 pt-1.5 space-y-1 font-mono text-[11px]">
                            <div
                              className={`p-1.5 rounded transition-all ${activeBaoCaoFormData.phuongAnDeXuat === 1 || !activeBaoCaoFormData.phuongAnDeXuat
                                ? 'bg-blue-50/80 font-bold text-blue-950 border border-blue-200'
                                : 'text-slate-600'
                                }`}
                            >
                              [{activeBaoCaoFormData.phuongAnDeXuat === 1 || !activeBaoCaoFormData.phuongAnDeXuat ? 'X' : '  '}] Phương án 1: Thụ lý đơn (Đủ điều kiện thụ lý giải quyết theo quy định của pháp luật).
                            </div>
                            <div
                              className={`p-1.5 rounded transition-all ${activeBaoCaoFormData.phuongAnDeXuat === 2
                                ? 'bg-blue-50/80 font-bold text-blue-950 border border-blue-200'
                                : 'text-slate-600'
                                }`}
                            >
                              [{activeBaoCaoFormData.phuongAnDeXuat === 2 ? 'X' : '  '}] Phương án 2: Chuyển thẩm quyền (Chuyển đơn, hồ sơ đến cơ quan, đơn vị có đúng thẩm quyền để giải quyết).
                            </div>
                            <div
                              className={`p-1.5 rounded transition-all ${activeBaoCaoFormData.phuongAnDeXuat === 3
                                ? 'bg-blue-50/80 font-bold text-blue-950 border border-blue-200'
                                : 'text-slate-600'
                                }`}
                            >
                              [{activeBaoCaoFormData.phuongAnDeXuat === 3 ? 'X' : '  '}] Phương án 3: Trả lời đơn (Lập văn bản trả lời, hướng dẫn hoặc giải thích cho công dân/người nộp đơn).
                            </div>
                            <div
                              className={`p-1.5 rounded transition-all ${activeBaoCaoFormData.phuongAnDeXuat === 4
                                ? 'bg-blue-50/80 font-bold text-blue-950 border border-blue-200'
                                : 'text-slate-600'
                                }`}
                            >
                              [{activeBaoCaoFormData.phuongAnDeXuat === 4 ? 'X' : '  '}] Phương án 4: Yêu cầu bổ sung (Yêu cầu người nộp bổ sung tài liệu, chứng cứ hoặc giải trình làm rõ nội dung).
                            </div>
                          </div>

                          {activeBaoCaoFormData.chiTietPhuongAn && (
                            <p className="pl-4 pt-1 text-[11px] italic text-slate-700">
                              (Ghi chú phương án đề xuất: {activeBaoCaoFormData.chiTietPhuongAn})
                            </p>
                          )}

                          <div className="pl-4 pt-2 text-slate-800 text-[11.5px] leading-relaxed">
                            <p>
                              Dự thảo các văn bản tố tụng kèm theo bao gồm:{' '}
                              <em>
                                {activeBaoCaoFormData.vanBanKemTheo ||
                                  'Dự thảo Quyết định khởi tố vụ án; Bản kết luận xác minh nguồn tin về tội phạm; Bảng kê danh mục tài liệu, chứng cứ trong hồ sơ.'}
                              </em>
                            </p>
                            <p className="pt-1 italic">Kính trình Đồng chí phê duyệt./.</p>
                          </div>
                        </div>
                      </div>

                      {/* Phần chữ ký: 2 cột theo đúng thể thức */}
                      <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-6 text-xs text-center font-sans">
                        <div className="space-y-1">
                          <p className="font-bold uppercase text-slate-900 text-xs">
                            Ý KIẾN PHÊ DUYỆT CỦA THỦ TRƯỞNG
                          </p>
                          <p className="font-bold text-slate-800 text-[11px]">(PHÓ THỦ TRƯỞNG)</p>
                          <p className="italic text-[10.5px] text-slate-500 pt-1">
                            (Ký, ghi rõ họ tên, ngày... tháng... năm...)
                          </p>
                          <div className="h-16"></div>
                        </div>

                        <div className="space-y-1">
                          <p className="font-bold uppercase text-slate-900 text-xs">
                            NGƯỜI LẬP BÁO CÁO
                          </p>
                          <p className="font-bold text-slate-800 text-[11px]">(Điều tra viên / Cán bộ điều tra)</p>
                          <p className="italic text-[10.5px] text-slate-500 pt-1">(Ký, ghi rõ họ tên)</p>

                          {activeEditingDoc.signingStatus === 'da_ky' ? (
                            <div className="my-2 p-2 rounded-lg border-2 border-red-500 bg-red-50/30 text-red-700 text-[10px] inline-block max-w-[200px] text-left shadow-2xs">
                              <div className="flex items-center gap-1 font-bold text-red-800 border-b border-red-300 pb-0.5">
                                <span className="material-symbols-outlined text-[13px]">verified</span>
                                <span>KÝ BỞI: {activeBaoCaoFormData.nguoiLap || editSigner || 'Nguyễn Minh Anh'}</span>
                              </div>
                              <p className="pt-0.5 font-mono text-[9px]">
                                CƠ QUAN: {activeBaoCaoFormData.coQuanLap || editCoQuanBanHanh || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA'}
                              </p>
                              <p className="font-mono text-[9px]">
                                NGÀY KÝ: {activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026'}
                              </p>
                            </div>
                          ) : (
                            <div className="h-16"></div>
                          )}

                          <p className="font-bold text-slate-900 text-sm pt-1">
                            {activeBaoCaoFormData.nguoiLap || editSigner || 'Nguyễn Minh Anh'}
                          </p>
                        </div>
                      </div>

                      {/* Banner CTA Trình ký Lãnh đạo */}
                      <div className="mt-8 pt-4 border-t border-slate-200">
                        {activeEditingDoc.signingStatus === 'cho_trinh' ||
                          activeEditingDoc.signingStatus === 'da_trinh' ||
                          activeEditingDoc.signingStatus === 'cho_ky' ? (
                          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/80 flex items-center justify-between gap-3 font-sans">
                            <div className="flex items-center gap-2.5 text-xs text-blue-900 font-medium">
                              <span className="material-symbols-outlined text-blue-600 text-[20px]">verified</span>
                              <span>
                                Báo cáo kết quả xác minh này <strong>đã được chuyển trình ký</strong> tới Lãnh đạo phê duyệt. Các chức năng <strong>Chỉnh sửa thông tin</strong> và <strong>Thụ lý đơn</strong> đã sẵn sàng trên thanh tác vụ.
                              </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shrink-0">
                              Đã trình ký
                            </span>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
                            <div>
                              <p className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-emerald-700 text-[19px]">approval</span>
                                <span>Hoàn tất xem trước &amp; Chuyển trình Lãnh đạo phê duyệt</span>
                              </p>
                              <p className="text-xs text-emerald-800 mt-0.5">
                                Sau khi nhấn "Đi trình ký", văn bản sẽ chuyển sang quy trình ký duyệt và hệ thống sẽ mở khóa nút <strong>Chỉnh sửa thông tin</strong> và <strong>Thụ lý đơn</strong>.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleTrinhKyBaoCaoDirect}
                              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer shrink-0 transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">send</span>
                              <span>Đi trình ký ngay</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : isThongBaoKhongThuLy ? (
                    /* ========================================================================= */
                    /* BIỂU MẪU CHUẨN: THÔNG BÁO VỀ VIỆC KHÔNG THỤ LÝ GIẢI QUYẾT ĐƠN / TỐ CÁO   */
                    /* ========================================================================= */
                    <div className="space-y-4 text-xs leading-relaxed font-serif text-slate-900 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Header: Cơ quan ban hành & Quốc hiệu tiêu ngữ */}
                        <div className="grid grid-cols-2 gap-4 text-center pb-4 border-b border-slate-300">
                          <div className="space-y-0.5 text-center">
                            <p className="uppercase font-medium text-slate-700 text-[11px]">
                              {editCoQuanCapTren || 'ỦY BAN NHÂN DÂN THÀNH PHỐ HÀ NỘI'}
                            </p>
                            <p className="uppercase font-bold text-slate-900 text-xs tracking-tight">
                              {editCoQuanBanHanh || 'ỦY BAN NHÂN DÂN QUẬN CẦU GIẤY'}
                            </p>
                            <div className="w-24 h-px bg-slate-800 mx-auto my-1"></div>
                            <div className="flex items-center justify-center gap-1 font-mono text-[11px] text-slate-800">
                              <span>Số:</span>
                              <input
                                type="text"
                                value={editSoHieu}
                                onChange={(e) => setEditSoHieu(e.target.value)}
                                className="font-bold font-mono text-center text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none w-44"
                              />
                            </div>
                          </div>
                          <div className="space-y-0.5 text-center">
                            <p className="font-bold uppercase text-slate-900 text-xs tracking-wider">
                              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                            </p>
                            <p className="font-bold text-slate-900 text-xs">
                              Độc lập - Tự do - Hạnh phúc
                            </p>
                            <div className="w-32 h-px bg-slate-800 mx-auto my-1"></div>
                            <p className="italic text-[11px] text-slate-700 pt-0.5">
                              Hà Nội, ngày {editNgayLap ? editNgayLap.split('/')[0] : '16'} tháng{' '}
                              {editNgayLap ? editNgayLap.split('/')[1] : '09'} năm 2026
                            </p>
                          </div>
                        </div>

                        {/* Tiêu đề thông báo */}
                        <div className="text-center pt-6 pb-4">
                          <h2 className="uppercase font-bold text-base sm:text-lg text-slate-900 tracking-wide">
                            THÔNG BÁO
                          </h2>
                          <p className="font-bold text-sm text-slate-800 mt-1 italic">
                            Về việc không thụ lý giải quyết tố cáo/đơn
                          </p>
                        </div>

                        {/* Kính gửi */}
                        <div className="pt-2 pb-3 text-xs leading-relaxed">
                          <div className="flex items-baseline gap-2">
                            <strong className="text-slate-900 shrink-0">Kính gửi:</strong>
                            <span className="font-semibold text-slate-900">
                              Ông/Bà {editNguoiNhan || currentDon.nguoiNop}
                            </span>
                          </div>
                          <p className="text-slate-700 mt-0.5">
                            Địa chỉ: {currentDon.diaChi || 'Cầu Giấy, TP. Hà Nội'}
                          </p>
                        </div>

                        {/* Thân văn bản thông báo theo thể thức hành chính */}
                        <div className="space-y-3 pt-2 text-justify text-xs leading-relaxed">
                          <p className="indent-6">
                            Ngày {currentDon.ngayNhan || '16/09/2026'}, Ủy ban nhân dân quận Cầu Giấy tiếp nhận đơn của Ông/Bà mang mã số tiếp nhận hồ sơ <strong>{currentDon.code}</strong>.
                          </p>
                          <p className="indent-6">
                            Nội dung đơn: <em>"{currentDon.title}"</em>.
                          </p>
                          <p className="indent-6">
                            Sau khi tiến hành kiểm tra điều kiện thụ lý tố cáo/đơn theo quy định tại Điều 24 và Điều 29 Luật Tố cáo năm 2018 (hoặc Điều 27 Luật Khiếu nại), Ủy ban nhân dân quận nhận thấy:
                          </p>

                          {/* Hộp căn cứ pháp lý & lý do không thụ lý */}
                          <div className="my-3 p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 text-slate-900 space-y-2 font-sans">
                            <div className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">gavel</span>
                              <div className="text-xs">
                                <span className="font-bold text-rose-900">Căn cứ pháp lý: </span>
                                <span className="text-slate-800">
                                  {activeEditingDoc.canCuPhapLy || 'Khoản 1 Điều 29 Luật Tố cáo năm 2018 (Không đủ điều kiện thụ lý giải quyết)'}
                                </span>
                              </div>
                            </div>
                            {activeEditingDoc.lyDoChinh && (
                              <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">info</span>
                                <div className="text-xs">
                                  <span className="font-bold text-amber-900">Lý do chính: </span>
                                  <span className="text-slate-800">{activeEditingDoc.lyDoChinh}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Nội dung diễn giải chi tiết có thể chỉnh sửa */}
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-sans font-bold text-slate-700">
                              Nội dung kiểm tra, xác minh ban đầu và căn cứ cụ thể:
                            </label>
                            <textarea
                              rows={6}
                              value={editNoiDungChiTiet}
                              onChange={(e) => setEditNoiDungChiTiet(e.target.value)}
                              placeholder="Nhập chi tiết lý do và kết quả kiểm tra điều kiện không thụ lý..."
                              className="w-full p-3 font-serif text-xs leading-relaxed text-slate-900 bg-transparent border border-dashed border-slate-300 hover:border-blue-400 focus:border-[#004ac6] focus:bg-blue-50/20 rounded-lg outline-none transition-all resize-y"
                            />
                          </div>

                          <p className="indent-6 font-bold text-slate-900">
                            Căn cứ quy định nêu trên, Ủy ban nhân dân quận thông báo: Không thụ lý giải quyết nội dung đơn nêu trên.
                          </p>
                          <p className="indent-6">
                            Ủy ban nhân dân quận thông báo để Ông/Bà {editNguoiNhan || currentDon.nguoiNop} được biết và thực hiện theo đúng quy định của pháp luật./.
                          </p>
                        </div>

                        {/* Chân trang: Nơi nhận và Ký tên đóng dấu */}
                        <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-4 text-xs mt-6">
                          <div className="text-left text-[11px] text-slate-700 font-sans space-y-0.5">
                            <p className="font-bold text-slate-900">Nơi nhận:</p>
                            <p>- Như kính gửi;</p>
                            <p>- Chủ tịch, các PCT UBND quận (để b/c);</p>
                            <p>- Thanh tra quận Cầu Giấy;</p>
                            <p>- Ban Tiếp công dân quận;</p>
                            <p>- Lưu: VT, HS {currentDon.code}.</p>
                          </div>

                          <div className="text-center space-y-1">
                            <p className="uppercase font-bold text-slate-900 text-xs">
                              TM. ỦY BAN NHÂN DÂN QUẬN
                            </p>
                            <p className="uppercase font-bold text-slate-800 text-[11px]">
                              KT. CHỦ TỊCH
                            </p>
                            <input
                              type="text"
                              value={editChucVuSigner}
                              onChange={(e) => setEditChucVuSigner(e.target.value)}
                              className="w-full text-center uppercase font-bold text-slate-900 text-xs bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                            />

                            {/* Dấu ký số điện tử VGCA hoặc Badge Trình ký */}
                            {activeEditingDoc.signingStatus === 'da_ky' ? (
                              <div className="my-2 p-2 rounded-lg border-2 border-red-500 bg-red-50/30 text-red-700 text-[10px] font-sans inline-block max-w-[210px] text-left shadow-2xs">
                                <div className="flex items-center gap-1 font-bold text-red-800 border-b border-red-300 pb-0.5">
                                  <span className="material-symbols-outlined text-[13px]">verified</span>
                                  <span>ĐÃ KÝ SỐ VGCA</span>
                                </div>
                                <p className="pt-0.5 font-mono text-[9px]">KÝ BỞI: {editSigner}</p>
                                <p className="font-mono text-[9px]">CƠ QUAN: {editCoQuanBanHanh}</p>
                                <p className="font-mono text-[9px]">NGÀY KÝ: {editNgayLap || '16/09/2026'}</p>
                              </div>
                            ) : activeEditingDoc.signingStatus === 'cho_trinh' || activeEditingDoc.signingStatus === 'cho_ky' ? (
                              <div className="my-3 py-2 px-3 rounded-lg border border-blue-300 bg-blue-50/60 text-blue-800 text-[11px] font-sans inline-flex items-center gap-1.5 shadow-2xs">
                                <span className="material-symbols-outlined text-[15px] animate-spin text-blue-600">sync</span>
                                <span className="font-semibold">Đang chờ Lãnh đạo ký số</span>
                              </div>
                            ) : (
                              <div className="h-16 flex items-center justify-center text-slate-400 italic text-[11px] font-sans">
                                (Chưa ký duyệt - Bản dự thảo)
                              </div>
                            )}

                            <div className="pt-1">
                              <input
                                type="text"
                                value={editSigner}
                                onChange={(e) => setEditSigner(e.target.value)}
                                className="w-full text-center font-bold text-slate-900 text-sm bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Banner chân trang A4: Hướng dẫn Trình ký Lãnh đạo */}
                      <div className="pt-6 border-t border-slate-200 mt-6">
                        {activeEditingDoc.signingStatus === 'cho_trinh' || activeEditingDoc.signingStatus === 'cho_ky' ? (
                          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/80 flex items-center justify-between gap-3 text-xs text-blue-900 font-sans">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-blue-600 text-[20px]">mark_email_read</span>
                              <span>
                                Thông báo không thụ lý số <strong>{editSoHieu}</strong> <strong>đã được chuyển trình Lãnh đạo UBND quận phê duyệt</strong>.
                              </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shrink-0">
                              Đã trình ký
                            </span>
                          </div>
                        ) : activeEditingDoc.signingStatus === 'da_ky' ? (
                          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/80 flex items-center justify-between gap-3 text-xs text-emerald-900 font-sans">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-emerald-600 text-[20px]">verified</span>
                              <span>
                                Thông báo không thụ lý số <strong>{editSoHieu}</strong> <strong>đã được Lãnh đạo phê duyệt và ký số thành công</strong>.
                              </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shrink-0">
                              Đã ký số VGCA
                            </span>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
                            <div>
                              <p className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-emerald-700 text-[19px]">approval</span>
                                <span>Hoàn tất xem trước &amp; Chuyển trình Lãnh đạo phê duyệt</span>
                              </p>
                              <p className="text-xs text-emerald-800 mt-0.5">
                                Nhấn "Trình ký Lãnh đạo ngay" để gửi Thông báo không thụ lý giải quyết đơn đến Lãnh đạo UBND quận xem xét và ký số VGCA.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleTrinhKyKhongThuLyDirect}
                              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer shrink-0 transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">send</span>
                              <span>Trình ký Lãnh đạo ngay</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* ========================================================================= */
                    /* SOẠN THẢO VĂN BẢN THÔNG THƯỜNG (GIẤY MỜI, BIÊN BẢN, CÔNG VĂN, THÔNG BÁO) */
                    /* ========================================================================= */
                    <div>
                      {/* Phần 1: Quốc hiệu & Tiêu ngữ */}
                      <div className="grid grid-cols-2 gap-4 text-center text-xs pb-4 border-b border-slate-200/80">
                        <div className="space-y-1 text-left">
                          <input
                            type="text"
                            value={editCoQuanCapTren}
                            onChange={(e) => setEditCoQuanCapTren(e.target.value)}
                            className="w-full text-center uppercase font-medium text-slate-600 text-[11px] bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                          />
                          <input
                            type="text"
                            value={editCoQuanBanHanh}
                            onChange={(e) => setEditCoQuanBanHanh(e.target.value)}
                            className="w-full text-center uppercase font-bold text-slate-900 text-xs bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                          />
                          <div className="w-24 h-px bg-slate-800 mx-auto my-1"></div>
                          <div className="flex items-center justify-center gap-1 font-mono text-[11px] text-slate-700">
                            <span>Số:</span>
                            <input
                              type="text"
                              value={editSoHieu}
                              onChange={(e) => setEditSoHieu(e.target.value)}
                              className="w-36 font-bold font-mono text-center text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="font-bold uppercase text-slate-900 text-xs tracking-wider">
                            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                          </p>
                          <p className="font-bold text-slate-900 text-xs">
                            Độc lập - Tự do - Hạnh phúc
                          </p>
                          <div className="w-36 h-px bg-slate-800 mx-auto my-1"></div>
                          <p className="italic text-[11px] text-slate-600 pt-0.5">
                            Hà Nội, ngày {editNgayLap ? editNgayLap.split('/')[0] : '16'} tháng{' '}
                            {editNgayLap ? editNgayLap.split('/')[1] : '09'} năm 2026
                          </p>
                        </div>
                      </div>

                      {/* Phần 2: Tiêu đề văn bản */}
                      <div className="text-center pt-6 pb-4">
                        <input
                          type="text"
                          value={editTenVanBan}
                          onChange={(e) => setEditTenVanBan(e.target.value)}
                          className="w-full text-center uppercase font-bold text-base sm:text-lg text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-2 outline-none tracking-wide"
                        />
                        <div className="flex items-center justify-center gap-1 mt-1 text-xs italic text-slate-600">
                          <span>(V/v:</span>
                          <input
                            type="text"
                            value={editTrichYeu}
                            onChange={(e) => setEditTrichYeu(e.target.value)}
                            className="w-4/5 text-center italic text-xs text-slate-700 bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                          />
                          <span>)</span>
                        </div>
                      </div>

                      {/* Phần 3: Kính gửi */}
                      <div className="pt-2 pb-3 text-xs leading-relaxed space-y-2">
                        <div className="flex items-baseline gap-2">
                          <strong className="text-slate-900 shrink-0">Kính gửi:</strong>
                          <input
                            type="text"
                            value={editNguoiNhan}
                            onChange={(e) => setEditNguoiNhan(e.target.value)}
                            className="flex-1 font-semibold text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none text-xs"
                          />
                        </div>

                        {editThoiGianHen && (
                          <div className="flex items-baseline gap-2">
                            <strong className="text-slate-900 shrink-0">Thời gian:</strong>
                            <input
                              type="text"
                              value={editThoiGianHen}
                              onChange={(e) => setEditThoiGianHen(e.target.value)}
                              className="flex-1 text-slate-800 bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none text-xs"
                            />
                          </div>
                        )}

                        {editDiaDiem && (
                          <div className="flex items-baseline gap-2">
                            <strong className="text-slate-900 shrink-0">Địa điểm:</strong>
                            <input
                              type="text"
                              value={editDiaDiem}
                              onChange={(e) => setEditDiaDiem(e.target.value)}
                              className="flex-1 text-slate-800 bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none text-xs"
                            />
                          </div>
                        )}
                      </div>

                      {/* Phần 4: NỘI DUNG VĂN BẢN CHÍNH */}
                      <div className="pt-2 pb-6">
                        <div className="relative">
                          <textarea
                            rows={14}
                            value={editNoiDungChiTiet}
                            onChange={(e) => setEditNoiDungChiTiet(e.target.value)}
                            placeholder="Nhập nội dung văn bản chi tiết..."
                            className="w-full p-3 font-serif text-sm leading-relaxed text-slate-900 bg-transparent border border-dashed border-slate-300 hover:border-blue-400 focus:border-[#004ac6] focus:bg-blue-50/20 rounded-lg outline-none transition-all resize-y"
                          />
                        </div>
                        <p className="text-[10.5px] text-slate-400 italic text-right mt-1">
                          * Khung soạn thảo trực tiếp chuẩn trang A4
                        </p>
                      </div>

                      {/* Phần 5: Nơi nhận & Ký tên */}
                      <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
                        <div className="text-left text-[11px] text-slate-600 font-sans space-y-0.5">
                          <p className="font-bold text-slate-800">Nơi nhận:</p>
                          <p>- Như kính gửi;</p>
                          <p>- Lưu: VT, Hồ sơ xác minh đơn {currentDon.code}.</p>
                        </div>

                        <div className="text-center space-y-1">
                          <input
                            type="text"
                            value={editChucVuSigner}
                            onChange={(e) => setEditChucVuSigner(e.target.value)}
                            className="w-full text-center uppercase font-bold text-slate-900 text-xs bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                          />

                          {/* Dấu ký số điện tử VGCA */}
                          {editIsSignedVGCA && (
                            <div className="my-2 p-2 rounded-lg border-2 border-red-500 bg-red-50/30 text-red-700 text-[10px] font-sans inline-block max-w-[200px] text-left shadow-2xs">
                              <div className="flex items-center gap-1 font-bold text-red-800 border-b border-red-300 pb-0.5">
                                <span className="material-symbols-outlined text-[13px]">verified</span>
                                <span>KÝ BỞI: {editSigner}</span>
                              </div>
                              <p className="pt-0.5 font-mono text-[9px]">CƠ QUAN: {editCoQuanBanHanh}</p>
                              <p className="font-mono text-[9px]">NGÀY KÝ: {editNgayLap || '16/09/2026'}</p>
                              <p className="font-mono text-[8.5px] text-red-500 truncate">SHA-256: 7F8E...3A21</p>
                            </div>
                          )}

                          <div className="pt-1">
                            <input
                              type="text"
                              value={editSigner}
                              onChange={(e) => setEditSigner(e.target.value)}
                              className="w-full text-center font-bold text-slate-900 text-sm bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs min-h-[500px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#004ac6] flex items-center justify-center mb-3 shadow-inner">
                <span className="material-symbols-outlined text-[32px]">find_in_page</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Vui lòng chọn một văn bản từ danh sách bên trái để xem</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Nhấp vào bất kỳ văn bản nào trong danh sách bên trái để xem trước theo thể thức A4 chuẩn, hoặc bấm <strong>"Tạo theo bước"</strong> để tạo văn bản mới theo quy trình.
              </p>
              <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  title="Tải văn bản hoặc tài liệu đính kèm từ máy tính"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Tải file từ máy tính</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowStepMenu(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#004ac6] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">account_tree</span>
                  <span>Tạo theo bước</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">post_add</span>
                  <span>Tạo văn bản</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL THÊM VĂN BẢN / QUYẾT ĐỊNH CHO QUÁ TRÌNH XỬ LÝ                     */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/90 via-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-[20px]">post_add</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Thêm văn bản / Quyết định cho quá trình xử lý
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Hồ sơ: <strong className="text-slate-800 font-mono">{currentDon.code}</strong> • Người nộp: {currentDon.nguoiNop}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveAddDoc} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Đính kèm tệp tin từ máy tính */}
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/90 flex items-center justify-between gap-3 shadow-2xs">
                <input
                  ref={modalFileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                  onChange={handleModalFileSelected}
                  className="hidden"
                />
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="material-symbols-outlined text-[20px]">attachment</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {addForm.file ? (
                        <span className="text-emerald-800 font-mono">{addForm.file.name}</span>
                      ) : (
                        'Đính kèm tệp tin tài liệu từ máy tính (Tùy chọn)'
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {addForm.file
                        ? `${addForm.size} • Đã gắn tệp vào biểu mẫu`
                        : 'Hỗ trợ PDF, DOCX, Hình ảnh... Tự động điền tên tệp và dung lượng'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => modalFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                >
                  <span className="material-symbols-outlined text-[15px]">folder_open</span>
                  <span>{addForm.file ? 'Đổi tệp khác' : 'Chọn tệp'}</span>
                </button>
              </div>

              {/* Chọn nhanh mẫu văn bản theo nghiệp vụ */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#004ac6] flex items-center gap-1.5 text-xs">
                    <span className="material-symbols-outlined text-[15px]">auto_stories</span>
                    <span>Chọn nhanh mẫu văn bản / quyết định nghiệp vụ:</span>
                  </span>
                  <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.2 rounded-full font-semibold">
                    1-Click điền tự động
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {QUICK_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.title}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${addForm.soHieu === tpl.soHieu
                        ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-2xs font-bold'
                        : 'bg-white hover:bg-blue-100 text-slate-700 border-blue-200'
                        }`}
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Tên tệp tin văn bản / quyết định <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="VD: Quyet_dinh_phan_cong_dieu_tra_vien_so_42.pdf"
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Số ký hiệu văn bản <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.soHieu}
                    onChange={(e) => setAddForm({ ...addForm, soHieu: e.target.value })}
                    placeholder="VD: 42/QĐ-PC03 hoặc 18/TB-UBND"
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Loại văn bản / Quyết định <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6] cursor-pointer"
                  >
                    <option value="Quyết định tố tụng">Quyết định tố tụng (CQĐT / VKSND)</option>
                    <option value="Quyết định hành chính">Quyết định hành chính (UBND)</option>
                    <option value="Thông báo thụ lý">Thông báo thụ lý (Khiếu nại / Tố cáo / Nguồn tin)</option>
                    <option value="Công văn phối hợp">Công văn trao đổi / Yêu cầu tra soát</option>
                    <option value="Biên bản làm việc">Biên bản làm việc / Ghi lời khai / Đối thoại</option>
                    <option value="Văn bản hướng dẫn">Phiếu hướng dẫn bổ sung tài liệu</option>
                    <option value="Báo cáo kết luận">Báo cáo kết luận xác minh</option>
                    <option value="Tài liệu chứng cứ mới">Tài liệu chứng cứ phát sinh</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Giai đoạn trong quy trình xử lý
                  </label>
                  <select
                    value={addForm.stepBelongsTo}
                    onChange={(e) => setAddForm({ ...addForm, stepBelongsTo: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6] cursor-pointer"
                  >
                    <option value="Bước 1: Tiếp nhận & Vào sổ">Bước 1: Tiếp nhận &amp; Vào sổ</option>
                    <option value="Bước 2: Kiểm tra chứng cứ & Thụ lý">Bước 2: Kiểm tra chứng cứ &amp; Thụ lý</option>
                    <option value="Bước 3: Phân công thụ lý & Xác minh">Bước 3: Phân công thụ lý / Lập tổ xác minh</option>
                    <option value="Bước 4: Xác minh thực địa & Thu thập chứng cứ">Bước 4: Xác minh thực tế / Sao kê / Đối thoại</option>
                    <option value="Bước 5: Báo cáo kết luận & Đề xuất">Bước 5: Báo cáo kết luận &amp; Đề xuất</option>
                    <option value="Bước 6: Ban hành Quyết định giải quyết">Bước 6: Ban hành Quyết định giải quyết</option>
                    <option value="Bước 7: Thông báo kết quả & Trả lời">Bước 7: Thông báo kết quả &amp; Trả lời</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Cơ quan ban hành <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.coQuanBanHanh}
                    onChange={(e) => setAddForm({ ...addForm, coQuanBanHanh: e.target.value })}
                    placeholder="VD: Cơ quan CSĐT Công an TP. Hà Nội"
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Người ký &amp; Chức vụ <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.signer}
                    onChange={(e) => setAddForm({ ...addForm, signer: e.target.value })}
                    placeholder="VD: Thượng tá Trần Quốc Dũng - Phó Thủ trưởng CQĐT"
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Số trang &amp; Dung lượng file
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={1}
                      value={addForm.pages}
                      onChange={(e) => setAddForm({ ...addForm, pages: Number(e.target.value) || 1 })}
                      className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                      placeholder="Số trang"
                    />
                    <input
                      type="text"
                      value={addForm.size}
                      onChange={(e) => setAddForm({ ...addForm, size: e.target.value })}
                      className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                      placeholder="Dung lượng"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Trích yếu &amp; Nội dung văn bản quyết định (Xem trước &amp; AI OCR)
                  </label>
                  <textarea
                    rows={4}
                    value={addForm.previewExcerpt}
                    onChange={(e) => setAddForm({ ...addForm, previewExcerpt: e.target.value })}
                    placeholder="Nhập trích yếu căn cứ và quyết định chỉ đạo..."
                    className="w-full p-3 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-[#004ac6] leading-relaxed"
                  />
                </div>
              </div>

              {/* Tùy chọn ký số VGCA & OCR */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addForm.isSignedVGCA}
                    onChange={(e) => setAddForm({ ...addForm, isSignedVGCA: e.target.checked })}
                    className="w-4 h-4 rounded text-[#004ac6] focus:ring-0 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
                    <span>Xác thực chữ ký số công vụ VGCA (Ban Cơ yếu Chính phủ)</span>
                  </span>
                </label>

                <span className="text-[11px] font-mono text-slate-400">SHA-256 Auto-Hashing</span>
              </div>

              {/* Modal footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Lưu &amp; Thêm vào hồ sơ xử lý</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL XEM TRƯỚC VĂN BẢN (PREVIEW PDF MODAL)                            */}
      {/* ========================================================================= */}
      {showPreviewModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full h-[88vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#004ac6] text-[22px]">description</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{selectedDoc.name}</h3>
                    {selectedDoc.soHieu && (
                      <span className="font-mono text-[11px] font-bold bg-slate-200/80 px-1.5 py-0.2 rounded text-slate-800">
                        Số: {selectedDoc.soHieu}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {selectedDoc.category} • {selectedDoc.pages} trang • {selectedDoc.size} • {selectedDoc.uploadDate}
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
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <span className="material-symbols-outlined text-[13px]">verified_user</span>
                    <span>Đã kiểm định chữ ký số VGCA</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Người ký: <strong>{selectedDoc.signer}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Tải về ${selectedDoc.name}`)}
                  className="px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs"
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
