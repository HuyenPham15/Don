import React, { useState, useEffect, useMemo } from 'react';
import { LuotNhan, Screen, UploadedFile, DonDetail } from '../types';
import { matchWorkflowByLoaiDon } from '../constants/workflows';
import { ActiveWorkflowState } from '../types/workflow';
import { DON_VI_OPTIONS } from '../constants';
import { TiepNhanDonItem, DEPARTMENTS, OFFICERS } from '../constants/departments';
import ChuyenTiepNhanModal, { ChuyenTiepNhanSubmitData } from '../components/modals/ChuyenTiepNhanModal';
import NguonTraCuuModal, { NguonTraCuuTabType } from '../components/modals/NguonTraCuuModal';
import BanGiaoDonModal, { BanGiaoDonSubmitData } from '../components/modals/BanGiaoDonModal';
import TraLaiDonModal, { TraLaiDonSubmitData } from '../components/modals/TraLaiDonModal';
import ThuLyDonModal, { ThuLyDonSubmitData } from '../components/modals/ThuLyDonModal';
import XacMinhVaDeXuatModal, { HuongGiaiQuyetType } from '../components/modals/XacMinhVaDeXuatModal';
import KhongThuLyModal from '../components/modals/KhongThuLyModal';
import ThongBaoBoSungModal from '../components/workflow/ThongBaoBoSungModal';
import TaoBaoCaoDeXuatModal, { BaoCaoDeXuatFormData } from '../components/modals/TaoBaoCaoDeXuatModal';
import { getSuggestedActionsForWorkflow } from '../components/workflow/QuyTrinhSuggestedActions';
import { SigningDocument, CurrentUserAccount } from '../types/signing';
import { INITIAL_LEADERS } from '../constants/signingData';
import DonTrungDetailDrawer, { DonTrungItem } from '../components/modals/DonTrungDetailDrawer';
import PhanTich5W1HSection from '../components/analysis/PhanTich5W1HSection';
import PhanTichTaiLieuKhongPhaiDonSection, {
  LoaiTaiLieuKhongPhaiDon,
  PhuongAnXuLyTaiLieuType,
  KetQuaTraCuuLienQuanItem,
  KICH_BAN_TAI_LIEU_MAP,
} from '../components/analysis/PhanTichTaiLieuKhongPhaiDonSection';
// import MoHinhHoa5W1HWidget from '../components/analysis/MoHinhHoa5W1HWidget';

export const DEFAULT_TO_CAO_DATA = {
  // A. Thông tin đơn
  soDon: 'TC-08/2026-ĐTC',
  ngayLamDon: '12/09/2026',
  loaiNoiDung: 'Đơn tố cáo',
  noiDungTomTat: 'Tố cáo hành vi cố ý làm trái quy định về bồi thường, hỗ trợ tái định cư; tự ý cắt giảm diện tích đất đền bù từ 360m² xuống 210m² và có dấu hiệu nhận hối lộ, thông đồng với doanh nghiệp tại Dự án Khu đô thị mới Y, phường Mộ Lao, quận Hà Đông.',
  thoiGian: '15/04/2025 – 20/06/2026',
  diaDiem: 'Dự án Khu đô thị mới Y, phường Mộ Lao, quận Hà Đông, TP. Hà Nội',
  coQuanToCao: 'Ông Trần Văn B (Chủ tịch HĐ Bồi thường GPMB kiêm Phó Trưởng phòng TN&MT quận Hà Đông) và Công ty Cổ phần Đầu tư Phát triển Đô thị X',
  yeuCau1: 'Thanh tra, làm rõ sai phạm trong việc lập hồ sơ kiểm đếm và áp giá bồi thường đất nông nghiệp tại Dự án KĐT Y.',
  yeuCau2: 'Đình chỉ thi hành Quyết định cưỡng chế thu hồi đất số 142/QĐ-UBND ngày 28/05/2026 đối với thửa đất số 48.',
  yeuCau3: 'Xem xét, xử lý trách nhiệm cá nhân đối với ông Trần Văn B về hành vi nhũng nhiễu, có dấu hiệu nhận hối lộ.',
  yeuCau4: 'Thực hiện việc bồi thường, bố trí tái định cư công khai, minh bạch đúng theo quy định pháp luật.',
  danhSachTaiLieu: '04 tài liệu: Đơn tố cáo scan bản gốc; Trích lục quy hoạch 1/500 & bản đồ địa chính; Bản sao Biên bản kiểm đếm áp giá sai lệch; Thiết bị USB ghi âm & ảnh hiện trường.',

  // B. Thông tin người tố cáo
  nguoiGui: 'Vũ Thị Thanh',
  namSinh: '15/08/1982',
  cccd: '001082019482',
  ngayCapCCCD: '10/05/2021',
  noiCapCCCD: 'Cục Cảnh sát QLHC về TTXH',
  sdt: '0983 123 456',
  email: 'vuthithanh.hd@gmail.com',
  diaChi: 'Số 45 ngách 12 ngõ 84 đường Quang Trung, phường Quang Trung, quận Hà Đông, TP. Hà Nội',
  diaChiThuongTru: 'Số 45 ngách 12 ngõ 84 đường Quang Trung, phường Quang Trung, quận Hà Đông, TP. Hà Nội',
  diaChiLienHe: 'Số 45 ngách 12 ngõ 84 đường Quang Trung, phường Quang Trung, quận Hà Đông, TP. Hà Nội',
  tuCachThamGia: 'Người tố cáo',
  dongNguoiGui: 'Nguyễn Văn A (Đồng đứng đơn)',
  cccdDongNguoiGui: '001088012345',
  diaChiDongNguoiGui: 'Số 47 ngách 12 ngõ 84 đường Quang Trung, phường Quang Trung, quận Hà Đông, TP. Hà Nội',
  luatSu: 'Không có',
  theLuatSu: 'N/A',

  // C. Thông tin đối tượng bị tố cáo
  doiTuong: 'Trần Văn B & Công ty CP Đầu tư Phát triển Đô thị X',
  chucVu: 'Phó Trưởng phòng kiêm Chủ tịch Hội đồng Bồi thường GPMB',
  donVi: 'Phòng Tài nguyên và Môi trường quận Hà Đông',
  congTyBiToGiac: 'Công ty Cổ phần Đầu tư Phát triển Đô thị X',
  mstCongTy: '0108293847',
  diaChiDoiTuong: 'Trụ sở UBND quận Hà Đông & Trụ sở Công ty CP X tại Tòa nhà Stellar, Cầu Giấy, Hà Nội',
  hanhViBiToCao: 'Lợi dụng chức vụ quyền hạn lập phương án bồi thường sai thực tế, ép giá đền bù từ 4.2 triệu/m² xuống 2.5 triệu/m², có dấu hiệu thông đồng trục lợi chênh lệch địa tô dự án.',
  dauHieu: 'Cố ý làm trái trong bồi thường đất đai & Dấu hiệu nhận hối lộ (Độ tin cậy 96%)',
  duAn: 'Dự án Khu đô thị mới Y',
  nguoiLienQuan: 'Công ty Cổ phần Đầu tư Phát triển Đô thị X',
  cccdNguoiLienQuan: 'MST: 0108293847',
};

export const NO_PETITION_ELEMENT_DATA = {
  // A. Thông tin tài liệu lượt nhận (Không có yếu tố là đơn — Chứng từ bổ sung)
  soDon: '18/2026/HĐKT-MK',
  ngayLamDon: '02/08/2026',
  loaiNoiDung: 'Tài liệu không có yếu tố là đơn (AI gợi ý Ghép chứng cứ bổ sung)',
  noiDungTomTat:
    'Tài liệu gửi qua bưu chính gồm Hợp đồng kinh tế cung ứng vật tư xây dựng số 18/2026/HĐKT-MK (giá trị 1,485 tỷ đồng) và Bảng thông báo điều chỉnh báo giá VLXD Quý III/2026. Văn bản không có hình thức đơn thư độc lập, nhưng qua tra cứu chéo CSDL phát hiện 04 dẫn chứng trùng khớp 95.8% với hồ sơ đang thụ lý Đ-2026-00125 (Vụ việc VV-2026-0042 tại Dự án KĐT mới Y, Mộ Lao, Hà Đông).',
  thoiGian: '05/08/2026 – 10/09/2026 (Khớp giai đoạn xác minh vụ việc VV-2026-0042)',
  diaDiem: 'Lô TT-02, Dự án Khu đô thị mới Y, phường Mộ Lao, quận Hà Đông, TP. Hà Nội',
  coQuanToCao: 'Công ty CP Đầu tư Phát triển Đô thị X (MST: 0105519820 - Bên Mua trong Hợp đồng)',
  yeuCau1: '[Dẫn chứng #1 - Khớp 100% MST] Bên Mua trong Hợp đồng là Công ty CP ĐTPT Đô thị X (MST 0105519820) trùng khớp tổ chức liên đới tại đơn Đ-2026-00125.',
  yeuCau2: '[Dẫn chứng #2 - Khớp 98% Địa bàn] Địa điểm giao vật tư tại Lô TT-02 Dự án KĐT mới Y (Mộ Lao, Hà Đông) nằm sát thửa đất số 48 đang thanh tra.',
  yeuCau3: '[Dẫn chứng #3 - Khớp 95% Nhân sự] Ông Phạm Đức Tùng (Chỉ huy trưởng Gói thầu 04 ký Bên B) trùng tên người ký Biên bản kiểm đếm ngày 18/05/2026.',
  yeuCau4: '[Dẫn chứng #4 - Khớp 92% Phiếu yêu cầu] Trùng khớp nội dung chứng cứ Tổ xác minh yêu cầu cung cấp theo Phiếu số 14/PYC-ĐXM ngày 10/09/2026.',
  danhSachTaiLieu:
    '02 tài liệu chứng từ: Hợp đồng cung ứng vật tư xây dựng số 18/2026/HĐKT-MK (bản sao có dấu đỏ); Thông báo điều chỉnh bảng báo giá VLXD Quý III/2026.',

  // B. Thông tin đơn vị gửi bưu phẩm (Bên A cung ứng vật tư)
  nguoiGui: 'Công ty TNHH Vật liệu Xây dựng Minh Khôi (Lê Quốc Khánh - Giám đốc)',
  namSinh: '1979',
  cccd: 'MST: 0108923471',
  ngayCapCCCD: '14/03/2019',
  noiCapCCCD: 'Sở Kế hoạch và Đầu tư TP. Hà Nội',
  sdt: '0243 998 1122',
  email: 'ketoan@vlxdminhkhoi.vn',
  diaChi: 'Lô B4, Cụm công nghiệp Yên Nghĩa, quận Hà Đông, TP. Hà Nội',
  diaChiThuongTru: 'Lô B4, Cụm công nghiệp Yên Nghĩa, quận Hà Đông, TP. Hà Nội',
  diaChiLienHe: 'Lô B4, Cụm công nghiệp Yên Nghĩa, quận Hà Đông, TP. Hà Nội',
  tuCachThamGia: 'Đơn vị gửi chứng từ bổ sung (Không đứng tên làm đơn mới)',
  dongNguoiGui: 'Không có',
  cccdDongNguoiGui: 'N/A',
  diaChiDongNguoiGui: 'N/A',
  luatSu: 'Không có',
  theLuatSu: 'N/A',

  // C. Thông tin đối tượng liên đới phát hiện qua đối soát CSDL
  doiTuong: 'Công ty CP Đầu tư Phát triển Đô thị X & Ông Phạm Đức Tùng (Chỉ huy trưởng Gói thầu 04)',
  chucVu: 'Chủ đầu tư Dự án KĐT mới Y / Đại diện Bên Mua (Bên B)',
  donVi: 'Ban Điều hành Gói thầu hạ tầng số 04 - Dự án KĐT mới Y',
  congTyBiToGiac: 'Công ty Cổ phần Đầu tư Phát triển Đô thị X',
  mstCongTy: '0105519820',
  diaChiDoiTuong: 'Kho bãi công trường Lô TT-02, Dự án KĐT mới Y, phường Mộ Lao, quận Hà Đông',
  hanhViBiToCao:
    'Tài liệu không trình bày tố cáo mới nhưng cung cấp chứng cứ thực tế về khối lượng, đơn giá cát san lấp và vật tư thi công hạ tầng Giai đoạn 2 tại Dự án KĐT mới Y (phục vụ đối chiếu hồ sơ Đ-2026-00125).',
  dauHieu: 'Không phải đơn thư (0/4 yếu tố) • Khớp 04 dẫn chứng với hồ sơ Đ-2026-00125 (AI gợi ý Ghép 95.8%)',
  duAn: 'Dự án Khu đô thị mới Y, phường Mộ Lao, quận Hà Đông (Vụ việc VV-2026-0042)',
  nguoiLienQuan: 'Bà Vũ Thị Thanh (Người đứng đơn gốc Đ-2026-00125) & Ông Phạm Đức Tùng (Đại diện Bên B)',
  cccdNguoiLienQuan: 'MST: 0105519820 / CCCD: 001082019482',
};

export interface NguoiDungDonItem {
  id: string;
  stt: number;
  vaiTro: 'dai_dien' | 'dong_dung_don' | 'dong_ky_ten';
  vaiTroLabel: string;
  hoTen: string;
  namSinh: string;
  cccd: string;
  ngayCapCCCD: string;
  noiCapCCCD: string;
  sdt: string;
  email: string;
  diaChi: string;
  coChuKy: boolean;
  coDiemChi: boolean;
  trangThaiVNeID: boolean;
}

export const MOCK_2_NGUOI_DUNG_DON: NguoiDungDonItem[] = [
  {
    id: 'nd-1',
    stt: 1,
    vaiTro: 'dai_dien',
    vaiTroLabel: 'Người đại diện chính',
    hoTen: 'Vũ Thị Thanh',
    namSinh: '15/08/1982',
    cccd: '001082019482',
    ngayCapCCCD: '10/05/2021',
    noiCapCCCD: 'Cục Cảnh sát QLHC về TTXH',
    sdt: '0983 123 456',
    email: 'vuthithanh.hd@gmail.com',
    diaChi: 'Số 45 ngách 12 ngõ 84 Quang Trung, P. Quang Trung, Q. Hà Đông, Hà Nội',
    coChuKy: true,
    coDiemChi: true,
    trangThaiVNeID: true,
  },
  {
    id: 'nd-2',
    stt: 2,
    vaiTro: 'dong_dung_don',
    vaiTroLabel: 'Đồng đứng đơn',
    hoTen: 'Nguyễn Văn A',
    namSinh: '22/11/1988',
    cccd: '001088012345',
    ngayCapCCCD: '18/09/2022',
    noiCapCCCD: 'Cục Cảnh sát QLHC về TTXH',
    sdt: '0912 345 678',
    email: 'nguyenvana.hd@gmail.com',
    diaChi: 'Số 47 ngách 12 ngõ 84 Quang Trung, P. Quang Trung, Q. Hà Đông, Hà Nội',
    coChuKy: true,
    coDiemChi: true,
    trangThaiVNeID: true,
  },
];

export const MOCK_TAP_THE_6_NGUOI: NguoiDungDonItem[] = [
  {
    id: 'nd-1',
    stt: 1,
    vaiTro: 'dai_dien',
    vaiTroLabel: 'Người đại diện cử',
    hoTen: 'Vũ Thị Thanh',
    namSinh: '15/08/1982',
    cccd: '001082019482',
    ngayCapCCCD: '10/05/2021',
    noiCapCCCD: 'Cục Cảnh sát QLHC về TTXH',
    sdt: '0983 123 456',
    email: 'vuthithanh.hd@gmail.com',
    diaChi: 'Số 45 ngách 12 ngõ 84 Quang Trung, P. Quang Trung, Q. Hà Đông, Hà Nội',
    coChuKy: true,
    coDiemChi: true,
    trangThaiVNeID: true,
  },
  {
    id: 'nd-2',
    stt: 2,
    vaiTro: 'dong_dung_don',
    vaiTroLabel: 'Đồng đứng đơn',
    hoTen: 'Nguyễn Văn A',
    namSinh: '22/11/1988',
    cccd: '001088012345',
    ngayCapCCCD: '18/09/2022',
    noiCapCCCD: 'Cục Cảnh sát QLHC về TTXH',
    sdt: '0912 345 678',
    email: 'nguyenvana.hd@gmail.com',
    diaChi: 'Số 47 ngách 12 ngõ 84 Quang Trung, P. Quang Trung, Q. Hà Đông, Hà Nội',
    coChuKy: true,
    coDiemChi: true,
    trangThaiVNeID: true,
  },
  {
    id: 'nd-3',
    stt: 3,
    vaiTro: 'dong_ky_ten',
    vaiTroLabel: 'Đồng ký tên (Tổ 4)',
    hoTen: 'Lê Văn Hùng',
    namSinh: '05/03/1975',
    cccd: '001075019284',
    ngayCapCCCD: '14/04/2021',
    noiCapCCCD: 'Cục Cảnh sát QLHC về TTXH',
    sdt: '0988 776 655',
    email: 'levanhung.hd@gmail.com',
    diaChi: 'Số 49 ngách 12 ngõ 84 Quang Trung, P. Quang Trung, Q. Hà Đông, Hà Nội',
    coChuKy: true,
    coDiemChi: false,
    trangThaiVNeID: true,
  },
  {
    id: 'nd-4',
    stt: 4,
    vaiTro: 'dong_ky_ten',
    vaiTroLabel: 'Đồng ký tên (Tổ 4)',
    hoTen: 'Phạm Thị Mai',
    namSinh: '19/10/1985',
    cccd: '001085028371',
    ngayCapCCCD: '20/12/2021',
    noiCapCCCD: 'Cục Cảnh sát QLHC về TTXH',
    sdt: '0904 567 890',
    email: 'phamthimai.hd@gmail.com',
    diaChi: 'Số 51 ngách 12 ngõ 84 Quang Trung, P. Quang Trung, Q. Hà Đông, Hà Nội',
    coChuKy: true,
    coDiemChi: false,
    trangThaiVNeID: true,
  },
  {
    id: 'nd-5',
    stt: 5,
    vaiTro: 'dong_ky_ten',
    vaiTroLabel: 'Đồng ký tên (Tổ 4)',
    hoTen: 'Đỗ Quang Tuấn',
    namSinh: '12/06/1978',
    cccd: '001078038492',
    ngayCapCCCD: '08/07/2022',
    noiCapCCCD: 'Cục Cảnh sát QLHC về TTXH',
    sdt: '0913 222 333',
    email: 'doquangtuan.hd@gmail.com',
    diaChi: 'Số 53 ngách 12 ngõ 84 Quang Trung, P. Quang Trung, Q. Hà Đông, Hà Nội',
    coChuKy: true,
    coDiemChi: false,
    trangThaiVNeID: true,
  },
  {
    id: 'nd-6',
    stt: 6,
    vaiTro: 'dong_ky_ten',
    vaiTroLabel: 'Đồng ký tên (Tổ 4)',
    hoTen: 'Vũ Minh Hạnh',
    namSinh: '30/01/1989',
    cccd: '001089018273',
    ngayCapCCCD: '15/03/2023',
    noiCapCCCD: 'Cục Cảnh sát QLHC về TTXH',
    sdt: '0977 444 555',
    email: 'vuminhhanh.hd@gmail.com',
    diaChi: 'Số 55 ngách 12 ngõ 84 Quang Trung, P. Quang Trung, Q. Hà Đông, Hà Nội',
    coChuKy: true,
    coDiemChi: false,
    trangThaiVNeID: true,
  },
];

export const MOCK_1_NGUOI_DUNG_DON: NguoiDungDonItem[] = [
  {
    id: 'nd-1',
    stt: 1,
    vaiTro: 'dai_dien',
    vaiTroLabel: 'Người tố cáo',
    hoTen: 'Vũ Thị Thanh',
    namSinh: '15/08/1982',
    cccd: '001082019482',
    ngayCapCCCD: '10/05/2021',
    noiCapCCCD: 'Cục Cảnh sát QLHC về TTXH',
    sdt: '0983 123 456',
    email: 'vuthithanh.hd@gmail.com',
    diaChi: 'Số 45 ngách 12 ngõ 84 Quang Trung, P. Quang Trung, Q. Hà Đông, Hà Nội',
    coChuKy: true,
    coDiemChi: true,
    trangThaiVNeID: true,
  },
];

interface BanPhanTichProps {
  luotNhan: LuotNhan;
  onNav: (s: Screen) => void;
  onAcceptAndProcess?: (don: any, wfState?: ActiveWorkflowState) => void;
  onChuyenTiepNhan?: (item: TiepNhanDonItem, isDirect: boolean, assignedOfficerName?: string) => void;
  onBanGiao?: (luotNhanId: string, donViName: string, canBoName?: string, lyDo?: string) => void;
  onTraLai?: (luotNhanId: string, lyDo: string) => void;
  onUpdateLuotNhan?: (updated: LuotNhan) => void;
  onCreateSigningDocument?: (doc: SigningDocument) => void;
  signingDocuments?: SigningDocument[];
  onUpdateSigningDocuments?: (docs: SigningDocument[]) => void;
  currentAccount?: CurrentUserAccount;
}

export default function BanPhanTich({
  luotNhan,
  onNav,
  onAcceptAndProcess,
  onChuyenTiepNhan,
  onBanGiao,
  onTraLai,
  onUpdateLuotNhan,
  onCreateSigningDocument,
  signingDocuments = [],
  onUpdateSigningDocuments,
  currentAccount,
}: BanPhanTichProps) {
  // ─── 1. TRẠNG THÁI AI: "none" (Thủ công) vs "reading" (Đang đọc) vs "done" (Đã đọc xong)
  const [aiState, setAiState] = useState<'none' | 'reading' | 'done'>('done');
  const [isNoPetitionElement, setIsNoPetitionElement] = useState<boolean>(false);
  const [readingProgress, setReadingProgress] = useState<number>(100);
  const [isSimulating, setIsSimulating] = useState(false);
  const [aiStepIndex, setAiStepIndex] = useState<number>(6); // 1..6 (BR-11)

  // BR-01..BR-24 State controls
  const [currentLuotNhanStatus, setCurrentLuotNhanStatus] = useState<string>(luotNhan?.status || 'cho_chuyen');
  const hasDeterminedHuongXuLy = currentLuotNhanStatus !== 'cho_chuyen' && currentLuotNhanStatus !== 'cho_xu_ly' && currentLuotNhanStatus !== 'chua_xu_ly';

  useEffect(() => {
    if (luotNhan?.status) {
      setCurrentLuotNhanStatus(luotNhan.status);
    }
  }, [luotNhan?.status]);

  const [validationErrorModal, setValidationErrorModal] = useState<string | null>(null);
  const [isOfficialData, setIsOfficialData] = useState<boolean>(Boolean(luotNhan?.isOfficialData));
  const [tiepNhanHuong, setTiepNhanHuong] = useState<'tu_xu_ly' | 'phan_cong'>('tu_xu_ly');
  const [selectedOfficerForPhanCong, setSelectedOfficerForPhanCong] = useState<string>('');
  const [ghiChuPhanCong, setGhiChuPhanCong] = useState<string>('');
  const [banGiaoHuong, setBanGiaoHuong] = useState<'don_vi_khac' | 'can_bo_khac'>('don_vi_khac');
  const [banGiaoCanBoId, setBanGiaoCanBoId] = useState<string>('');
  const [lyDoBanGiao, setLyDoBanGiao] = useState<string>('Chuyển thụ lý theo đúng thẩm quyền nghiệp vụ đơn vị');
  const [traLaiHuongDan, setTraLaiHuongDan] = useState<string>(
    'Đề nghị công dân gửi đơn đến đúng cơ quan có thẩm quyền hoặc bổ sung đầy đủ tài liệu, chứng cứ kèm theo theo quy định.'
  );


  // PDF Viewer Controls & Danh sách tài liệu tải lên thực tế
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeDocScenario, setActiveDocScenario] = useState<LoaiTaiLieuKhongPhaiDon>('minh_chung');
  const [selectedDocPhuongAn, setSelectedDocPhuongAn] = useState<PhuongAnXuLyTaiLieuType>('ghep_don');
  const [docTargetCode, setDocTargetCode] = useState<string>('Đ-2026-00125');
  const [showDocActionModal, setShowDocActionModal] = useState<boolean>(false);

  const currentFiles: UploadedFile[] = useMemo(() => {
    if (isNoPetitionElement) {
      if (activeDocScenario === 'van_ban') {
        return [
          { name: 'Thong_bao_412_TB_SXD_Kiem_tra_TTXD.pdf', size: '640 KB', category: 'main' },
        ];
      }
      if (activeDocScenario === 'bieu_mau') {
        return [
          { name: 'To_khai_Mau_02_DK_HT_NguyenVanHoa.pdf', size: '510 KB', category: 'main' },
        ];
      }
      if (activeDocScenario === 'tai_lieu_khac') {
        return [
          { name: 'Bao_cao_quan_trac_88_BC_TTQTMT_ThieuTrang3.pdf', size: '3.1 MB', category: 'main' },
        ];
      }
      return [
        { name: 'Hop_dong_cung_ung_vat_tu_so_18_2026.pdf', size: '1.4 MB', category: 'main' },
        { name: 'Bang_bao_gia_va_thong_bao_dieu_chinh_gia_VLXD.pdf', size: '850 KB', category: 'attach' },
      ];
    }
    if (luotNhan?.files && luotNhan.files.length > 0) {
      return luotNhan.files;
    }
    return [
      { name: 'Don_to_cao_ban_goc_VuThiThanh.pdf', size: '1.8 MB', category: 'main' },
      { name: 'Trich_luc_quy_hoach_1-500_thua_dat_48.pdf', size: '3.4 MB', category: 'attach' },
      { name: 'Bien_ban_kiem_dem_ap_gia_sai_lech.pdf', size: '2.1 MB', category: 'attach' },
      { name: 'Du_lieu_USB_ghi_am_anh_hien_truong.zip', size: '18.6 MB', category: 'attach' },
    ];
  }, [luotNhan?.files, isNoPetitionElement, activeDocScenario]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const activeFile = currentFiles[selectedFileIndex] || currentFiles[0];
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);
  const [analysisActiveTab, setAnalysisActiveTab] = useState<'5w1h' | 'ocr'>('5w1h');

  useEffect(() => {
    setSelectedFileIndex(0);
  }, [luotNhan?.id]);

  // Dữ liệu đơn trùng phục vụ đối soát CSDL và chọn đơn ghép
  const DON_TRUNG_LIST: DonTrungItem[] = [
    {
      id: 'dt-0',
      code: 'Đ-2026-00125',
      status: 'Đang xác minh (VV-2026-0042)',
      title: 'Tố cáo sai phạm trong bồi thường GPMB và san lấp hạ tầng tại Dự án Khu đô thị mới Y, phường Mộ Lao, quận Hà Đông',
      matchPercent: 96,
      tags: ['Khớp MST 0105519820', 'Cùng Dự án KĐT mới Y', 'Chờ bổ sung chứng cứ'],
      ngayNhan: '12/09/2026',
      nguoiNop: 'Vũ Thị Thanh & Nguyễn Văn A',
      cccd: '001082019482',
      soDienThoai: '0983 123 456',
      diaChi: 'Số 45 ngách 12 ngõ 84 Quang Trung, phường Quang Trung, quận Hà Đông, Hà Nội',
      loaiDon: 'Đơn tố cáo',
      linhVuc: 'Đất đai, Bồi thường GPMB & Đầu tư xây dựng',
      doiTuongBiPhanAnh: 'Công ty CP Đầu tư Phát triển Đô thị X (MST: 0105519820) & HĐ Bồi thường GPMB quận Hà Đông',
      canBoThuLy: 'Nguyễn Minh Anh (Tổ xác minh QĐ 89/QĐ-UBND)',
      donVi: 'Phòng Tiếp công dân & Thanh tra quận Hà Đông',
      noiDungGhepGoiY: 'Chứng từ Hợp đồng số 18/2026/HĐKT-MK & Bảng giá VLXD khớp 04 dẫn chứng với hồ sơ Đ-2026-00125 (Vụ việc VV-2026-0042) — Ghép làm chứng cứ bổ sung, không sinh mã đơn mới',
      tomTatNoiDung: 'Tố cáo hành vi tự ý cắt giảm diện tích đền bù từ 360m² xuống 210m² tại thửa đất số 48 (Dự án KĐT mới Y) và nghi vấn thông đồng nâng khống khối lượng, đơn giá vật tư san lấp mặt bằng Giai đoạn 2.',
      quaTrinhXuLy: [
        {
          date: '12/09/2026',
          title: 'Tiếp nhận đơn tố cáo & Cấp mã Đ-2026-00125',
          actor: 'Nguyễn Minh Anh (Phòng Tiếp công dân)',
          desc: 'Tiếp nhận đơn tố cáo của bà Vũ Thị Thanh, bóc tách 5W1H và liên kết vào Hồ sơ vụ việc VV-2026-0042.',
          status: 'done',
        },
        {
          date: '14/09/2026',
          title: 'Ban hành Phiếu yêu cầu cung cấp tài liệu số 14/PYC-ĐXM',
          actor: 'Tổ xác minh theo QĐ 89/QĐ-UBND',
          desc: 'Yêu cầu Chủ đầu tư (Công ty CP ĐTPT Đô thị X) và các nhà cung ứng nộp bản sao Hợp đồng cung ứng vật tư san lấp và bảng báo giá Quý III/2026 tại Lô TT-02 KĐT mới Y.',
          status: 'in_progress',
        },
      ],
      taiLieuDinhKem: [
        {
          name: 'Don_to_cao_ban_goc_VuThiThanh.pdf',
          size: '1.8 MB',
          type: 'Đơn tố cáo gốc có chữ ký & điểm chỉ',
        },
        {
          name: 'Trich_luc_quy_hoach_1-500_thua_dat_48.pdf',
          size: '3.4 MB',
          type: 'Trích lục bản đồ địa chính thửa 48',
        },
        {
          name: 'Phieu_yeu_cau_cung_cap_tai_lieu_14_PYC.pdf',
          size: '620 KB',
          type: 'Phiếu yêu cầu thu thập chứng cứ vật tư san lấp',
        },
      ],
      tieuChiSoSanh: [
        {
          tieuChi: 'Dẫn chứng #1: Pháp nhân & Mã số thuế',
          donGoc: 'Công ty CP Đầu tư Phát triển Đô thị X (MST: 0105519820)',
          donMoi: 'Bên Mua (Bên B): Công ty CP ĐTPT Đô thị X (MST: 0105519820)',
          match: true,
          note: 'Trùng khớp 100% mã số doanh nghiệp & tên pháp nhân tại Trang 1 HĐKT',
        },
        {
          tieuChi: 'Dẫn chứng #2: Địa bàn & Dự án',
          donGoc: 'Thửa 48, Dự án KĐT mới Y, phường Mộ Lao, quận Hà Đông',
          donMoi: 'Giao vật tư tại: Lô TT-02, Dự án KĐT mới Y, Mộ Lao, Hà Đông',
          match: true,
          note: 'Khớp 98% tọa độ ranh giới dự án đang thanh tra (VV-2026-0042)',
        },
        {
          tieuChi: 'Dẫn chứng #3: Nhân sự đại diện ký nhận',
          donGoc: 'Ông Phạm Đức Tùng (Ký Biên bản hiện trường ngày 18/05/2026)',
          donMoi: 'Ông Phạm Đức Tùng (Chỉ huy trưởng Gói thầu 04 ký Bên B)',
          match: true,
          note: 'Trùng khớp 95% họ tên và chức danh người đại diện tại công trường',
        },
        {
          tieuChi: 'Dẫn chứng #4: Mốc thời gian & Chứng cứ cần thu thập',
          donGoc: 'Phiếu yêu cầu 14/PYC-ĐXM (Thu thập HĐ vật tư T8–T9/2026)',
          donMoi: 'HĐKT số 18/2026 (05/08–10/09/2026) & Báo giá VLXD Quý III/2026',
          match: true,
          note: 'Khớp 92% với tài liệu Tổ xác minh đang yêu cầu cung cấp bổ sung',
        },
      ],
    },
    {
      id: 'dt-1',
      code: 'DS-29/2026-GOVEX',
      status: 'Đang xử lý',
      title: 'Phản ánh cơ sở tái chế phế liệu Minh Phát gây ô nhiễm môi trường và tiếng ồn tại TDP 4',
      matchPercent: 96,
      tags: ['Người đứng đơn', 'Nội dung tương tự'],
      ngayNhan: '10/09/2026',
      nguoiNop: 'Đại diện KDC số 4',
      cccd: '001075018392',
      soDienThoai: '0912 345 678',
      diaChi: 'Tổ dân phố số 4, phường Nghĩa Đô, quận Cầu Giấy, Hà Nội',
      loaiDon: 'Phản ánh / Kiến nghị',
      linhVuc: 'Môi trường & Trật tự đô thị',
      doiTuongBiPhanAnh: 'Cơ sở tái chế phế liệu Minh Phát',
      canBoThuLy: 'Nguyễn Minh Anh',
      donVi: 'Phòng QLĐT',
      noiDungGhepGoiY: 'Gói này giống hồ sơ DS-29/2026-GOVEX đang mở – ghép vào đó không sinh đơn mới, không tốn số',
      tomTatNoiDung: 'Tập thể người dân KDC số 4 phản ánh cơ sở tái chế phế liệu Minh Phát hoạt động phát tán mùi khói khét độc hại và xả thải không qua xử lý, đồng thời gây tiếng ồn nghiêm trọng từ 22h đêm đến 04h sáng, ảnh hưởng đến người già và trẻ nhỏ.',
      quaTrinhXuLy: [
        {
          date: '10/09/2026',
          title: 'Tiếp nhận đơn & Vào sổ theo dõi',
          actor: 'Nguyễn Minh Anh (Cán bộ thụ lý - Phòng QLĐT)',
          desc: 'Tiếp nhận đơn thư, đối chiếu thông tin chủ thể và cấp mã hồ sơ chính thức DS-29/2026-GOVEX.',
          status: 'done',
        },
        {
          date: '12/09/2026',
          title: 'Kiểm tra hiện trường & Lập biên bản xác minh',
          actor: 'Tổ công tác TDP 4 & Cán bộ thụ lý',
          desc: 'Lập biên bản xác minh thực địa, ghi nhận hiện trạng phản ánh cơ sở tái chế phế liệu Minh Phát.',
          status: 'done',
        },
        {
          date: '16/09/2026',
          title: 'Phối hợp Phòng TN&MT đo kiểm khí thải, tiếng ồn',
          actor: 'Phòng Tài nguyên & Môi trường quận',
          desc: 'Tiến hành đo đạc nồng độ khí thải và cường độ âm thanh ban đêm tại khu vực dân sinh giáp ranh.',
          status: 'done',
        },
        {
          date: '20/09/2026',
          title: 'Tổng hợp kết quả & Dự thảo văn bản xử lý',
          actor: 'Nguyễn Minh Anh',
          desc: 'Đang tổng hợp báo cáo kiểm tra và dự thảo văn bản yêu cầu cơ sở chấp hành quy định hoặc áp dụng biện pháp đình chỉ.',
          status: 'in_progress',
        },
      ],
      taiLieuDinhKem: [
        {
          name: 'Don_kien_nghi_goc_DS-29_2026_GOVEX.pdf',
          size: '2.4 MB',
          type: 'Đơn thư gốc scan (Bản có chữ ký tập thể hộ dân)',
        },
        {
          name: 'Bien_ban_kiem_tra_hien_truong_12-09.pdf',
          size: '1.8 MB',
          type: 'Biên bản làm việc thực địa',
        },
        {
          name: 'Hinh_anh_khoi_bui_co_so_Minh_Phat.jpg',
          size: '3.6 MB',
          type: 'Hình ảnh bằng chứng vi phạm',
        },
        {
          name: 'Phieu_de_nghi_do_kiem_TNMT.pdf',
          size: '780 KB',
          type: 'Phiếu kiểm tra chuyên môn',
        },
      ],
      tieuChiSoSanh: [
        {
          tieuChi: 'Người đứng đơn',
          donGoc: 'Đại diện KDC số 4',
          donMoi: 'Đại diện KDC số 4',
          match: true,
          note: 'Trùng khớp 100% chủ thể',
        },
        {
          tieuChi: 'Số định danh CCCD',
          donGoc: '001075018392',
          donMoi: '001075018392',
          match: true,
          note: 'Trùng khớp số CCCD/Định danh',
        },
        {
          tieuChi: 'Đối tượng bị phản ánh',
          donGoc: 'Cơ sở tái chế phế liệu Minh Phát',
          donMoi: 'Cơ sở tái chế Minh Phát',
          match: true,
          note: 'Trùng khớp đối tượng vi phạm',
        },
        {
          tieuChi: 'Địa bàn phát sinh',
          donGoc: 'Khu dân cư TDP số 4, Cầu Giấy, Hà Nội',
          donMoi: 'KDC số 4, Cầu Giấy, Hà Nội',
          match: true,
          note: 'Cùng vị trí địa bàn vụ việc',
        },
        {
          tieuChi: 'Nội dung & Chứng cứ mới',
          donGoc: 'Biên bản ghi nhận ngày 10/09/2026',
          donMoi: 'Bổ sung hợp đồng & biên bản đo đạc ban đêm',
          match: false,
          note: 'Cung cấp chứng cứ bổ sung cho đơn gốc',
        },
      ],
    },
    {
      id: 'dt-2',
      code: 'DS-4/2026-CATPHN',
      status: 'Đang xử lý',
      title: 'Tố giác cơ sở kinh doanh phế liệu Minh Phát lấn chiếm lối đi chung và xả khói bụi',
      matchPercent: 89,
      tags: ['Người đứng đơn', 'Nội dung tương tự'],
      ngayNhan: '05/09/2026',
      nguoiNop: 'Nguyễn Văn A',
      cccd: '001088019234',
      soDienThoai: '0903 888 999',
      diaChi: 'Số 12 ngõ 45 Cầu Giấy, Hà Nội',
      loaiDon: 'Tố giác vi phạm',
      linhVuc: 'An ninh trật tự & Môi trường',
      doiTuongBiPhanAnh: 'Cơ sở tái chế Minh Phát & chủ cơ sở',
      canBoThuLy: 'Trần Hoàng Long',
      donVi: 'Công an TP. Hà Nội',
      noiDungGhepGoiY: 'Gói này giống hồ sơ DS-4/2026-CATPHN đang mở – ghép vào đó không sinh đơn mới, không tốn số',
      tomTatNoiDung: 'Tố giác việc tụ tập xe tải bốc dỡ phế liệu lấn chiếm lòng lề đường, phát tán khói bụi độc hại vào ban đêm.',
      quaTrinhXuLy: [
        {
          date: '05/09/2026',
          title: 'Tiếp nhận tin báo tố giác',
          actor: 'Trần Hoàng Long (Cán bộ thụ lý)',
          desc: 'Tiếp nhận thông tin tố giác từ công dân, phân loại hồ sơ ban đầu.',
          status: 'done',
        },
        {
          date: '09/09/2026',
          title: 'Xác minh trật tự đô thị tại cơ sở',
          actor: 'Công an phường phối hợp',
          desc: 'Kiểm tra hiện trạng đỗ xe lấn chiếm ngõ xóm và lập biên bản nhắc nhở.',
          status: 'done',
        },
      ],
      taiLieuDinhKem: [
        {
          name: 'Don_to_giac_DS-4.pdf',
          size: '1.5 MB',
          type: 'Đơn tố giác của công dân',
        },
        {
          name: 'Anh_chup_xe_tai_lan_chiem.jpg',
          size: '2.8 MB',
          type: 'Hình ảnh vi phạm',
        },
      ],
    },
    {
      id: 'dt-3',
      code: 'DS-5/2026-CATPHN',
      status: 'Đang xử lý',
      title: 'Kiến nghị kiểm tra khí thải độc hại phát tán từ điểm thu mua phế liệu Minh Phát',
      matchPercent: 84,
      tags: ['Người đứng đơn', 'Nội dung tương tự'],
      ngayNhan: '01/09/2026',
      nguoiNop: 'Trần Thị C (Đồng đứng đơn)',
      cccd: '001180023412',
      soDienThoai: '0987 654 321',
      diaChi: 'KDC số 4, Cầu Giấy, Hà Nội',
      loaiDon: 'Kiến nghị / Phản ánh',
      linhVuc: 'Môi trường dân sinh',
      doiTuongBiPhanAnh: 'Cơ sở tái chế Minh Phát',
      canBoThuLy: 'Lê Thanh Tùng',
      donVi: 'Công an TP. Hà Nội',
      noiDungGhepGoiY: 'Gói này giống hồ sơ DS-5/2026-CATPHN đang mở – ghép vào đó không sinh đơn mới, không tốn số',
      tomTatNoiDung: 'Kiến nghị phối hợp cơ quan chức năng kiểm tra khí thải, mùi hóa chất đốt nhựa tái chế vào ban đêm.',
    },
    {
      id: 'dt-4',
      code: 'Đ-2025-00341',
      status: 'Đang thụ lý',
      title: 'Khiếu nại về bồi thường hỗ trợ tái định cư dự án Khu đô thị Y',
      matchPercent: 78,
      tags: ['Cùng đối tượng', 'Nội dung tương tự'],
      ngayNhan: '15/12/2025',
      nguoiNop: 'Đại diện KDC số 4',
      cccd: '001075018392',
      soDienThoai: '0912 345 678',
      diaChi: 'KDC số 4, Cầu Giấy, Hà Nội',
      loaiDon: 'Khiếu nại',
      linhVuc: 'Đất đai & Bồi thường GPMB',
      doiTuongBiPhanAnh: 'Hội đồng Bồi thường GPMB Dự án Y',
      canBoThuLy: 'Phạm Thu Hằng',
      donVi: 'Thanh tra Sở Xây dựng',
      noiDungGhepGoiY: 'Gói này giống hồ sơ Đ-2025-00341 đang mở – ghép vào đó không sinh đơn mới, không tốn số',
      tomTatNoiDung: 'Khiếu nại về đơn giá bồi thường đất nông nghiệp và phương án giao đất tái định cư.',
    },
  ];

  // Officer inputs
  const [selectedGhepDonCode, setSelectedGhepDonCode] = useState<string>('DS-29/2026-GOVEX');
  const [noPetitionLookupQuery, setNoPetitionLookupQuery] = useState<string>('');
  const [selectedLookupSourceFilter, setSelectedLookupSourceFilter] = useState<'all' | 'ho_so' | 'phap_nhan' | 'buu_chinh'>('all');
  const [showAllDonTrung, setShowAllDonTrung] = useState<boolean>(false);
  const [selectedDonTrungForDrawer, setSelectedDonTrungForDrawer] = useState<DonTrungItem | null>(null);
  const [showDonTrungDrawer, setShowDonTrungDrawer] = useState<boolean>(false);
  const [isGhepComboboxOpen, setIsGhepComboboxOpen] = useState<boolean>(false);
  const [ghepSearchQuery, setGhepSearchQuery] = useState<string>('');
  const [traCuuFilterType, setTraCuuFilterType] = useState<'tat_ca' | 'don_trung' | 'vu_viec'>('tat_ca');

  const selectedGhepItem = useMemo(() => {
    return DON_TRUNG_LIST.find((item) => item.code === selectedGhepDonCode) || DON_TRUNG_LIST[0];
  }, [selectedGhepDonCode]);

  const filteredGhepList = useMemo(() => {
    if (!ghepSearchQuery.trim()) return DON_TRUNG_LIST;
    const q = ghepSearchQuery.toLowerCase();
    return DON_TRUNG_LIST.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.nguoiNop.toLowerCase().includes(q)
    );
  }, [ghepSearchQuery]);
  const [officerNote, setOfficerNote] = useState<string>(
    'Đề xuất tiếp nhận thụ lý giải quyết đơn tố cáo theo thẩm quyền quy định tại Luật Tố cáo 2018; đồng thời thành lập Tổ xác minh kiểm tra thực địa bồi thường GPMB tại Dự án KĐT Y.'
  );
  const [huongXuLy, setHuongXuLy] = useState<'tiep-nhan' | 'chuyen' | 'ghep' | 'xep-luu'>('tiep-nhan');
  const [showXepLuuModal, setShowXepLuuModal] = useState<boolean>(false);
  const [lyDoXepLuu, setLyDoXepLuu] = useState<string>(
    'Tài liệu gửi đến là chứng từ thương mại / hợp đồng rời, không có văn bản đơn và không chứa nội dung khiếu nại, tố cáo, kiến nghị, phản ánh (Theo Điều 28 Thông tư 05/2021/TT-TTCP)'
  );
  const [ghiChuXepLuu, setGhiChuXepLuu] = useState<string>(
    'Xác nhận không tiếp nhận thụ lý, thực hiện xếp lưu theo dõi tài liệu lượt nhận và kết thúc task xử lý.'
  );
  const [expandedCanCu, setExpandedCanCu] = useState<string | null>(null);
  const [showGhepModal, setShowGhepModal] = useState<boolean>(false);
  const [showDetailTargetDonModal, setShowDetailTargetDonModal] = useState<boolean>(false);
  const [lyDoGhep, setLyDoGhep] = useState<string>(
    'Bổ sung tài liệu, chứng cứ cho hồ sơ đang thụ lý giải quyết'
  );
  const [ghiChuGhep, setGhiChuGhep] = useState<string>(
    'Ghép lượt nhận vào hồ sơ DS-29/2026-GOVEX để theo dõi tập trung, không tạo mã đơn mới.'
  );
  const [banGiaoUnit, setBanGiaoUnit] = useState<string>('Phòng Cảnh sát kinh tế (PC03) - Công an TP. Hà Nội');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showXacMinhModal, setShowXacMinhModal] = useState<boolean>(false);
  const [showThuLyModal, setShowThuLyModal] = useState<boolean>(false);
  const [showKhongThuLyModal, setShowKhongThuLyModal] = useState<boolean>(false);
  const [showBoSungModal, setShowBoSungModal] = useState<boolean>(false);
  const [showChuyenModal, setShowChuyenModal] = useState<boolean>(false);
  const [showTraLaiModal, setShowTraLaiModal] = useState<boolean>(false);
  const [showBanGiaoModal, setShowBanGiaoModal] = useState<boolean>(false);
  const [traLaiReason, setTraLaiReason] = useState<string>('Không thuộc thẩm quyền giải quyết');
  const [showCanCuModal, setShowCanCuModal] = useState<boolean>(false);
  const [showTaoBaoCaoDeXuatModal, setShowTaoBaoCaoDeXuatModal] = useState<boolean>(false);
  const [showNguonTraCuuModal, setShowNguonTraCuuModal] = useState<boolean>(false);
  const [nguonTraCuuTab, setNguonTraCuuTab] = useState<NguonTraCuuTabType>('nguoi-gui');

  const openNguonTraCuu = (tab: NguonTraCuuTabType) => {
    setNguonTraCuuTab(tab);
    setShowNguonTraCuuModal(true);
  };

  // ─── QUẢN LÝ VĂN BẢN TRÌNH KÝ LIÊN KẾT TRỰC TIẾP VỚI ĐƠN HIỆN HÀNH ───
  const currentDonCode = useMemo(() => {
    return luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';
  }, [luotNhan?.id]);

  const linkedSigningDoc = useMemo(() => {
    return (
      signingDocuments.find(
        (d) => d.hoSoCode === currentDonCode || (luotNhan?.id && d.luotNhanId === luotNhan.id)
      ) || null
    );
  }, [signingDocuments, currentDonCode, luotNhan?.id]);

  const [activeSigningDoc, setActiveSigningDoc] = useState<SigningDocument | null>(() => linkedSigningDoc);
  const [showSigningDocModal, setShowSigningDocModal] = useState<boolean>(false);
  const [showDanhSachDongNguoiModal, setShowDanhSachDongNguoiModal] = useState<boolean>(false);
  const [signingModalTab, setSigningModalTab] = useState<'van_ban' | 'luong_ky'>('van_ban');
  const [isSigningSubmitting, setIsSigningSubmitting] = useState<boolean>(false);
  const [signingNoteInput, setSigningNoteInput] = useState<string>('');

  useEffect(() => {
    if (linkedSigningDoc) {
      setActiveSigningDoc(linkedSigningDoc);
    }
  }, [linkedSigningDoc]);

  const handleQuickSignDocument = (doc: SigningDocument, note?: string) => {
    setIsSigningSubmitting(true);
    setTimeout(() => {
      const now = new Date();
      const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const updatedSigners = doc.signers.map((s, idx) => {
        if (s.status === 'cho_ky' || idx === 1) {
          return {
            ...s,
            status: 'da_ky' as const,
            thoiGianKy: `${timeStr} ${todayStr}`,
            yKien: note || signingNoteInput || 'Đồng ý thụ lý giải quyết theo đề xuất. Giao Tổ xác minh khẩn trương tiến hành theo đúng quy định pháp luật.',
            signatureCert: 'VGCA - Ban Cơ yếu Chính phủ (Token: 5402-9912-8812)',
          };
        }
        return s;
      });

      const updatedDoc: SigningDocument = {
        ...doc,
        status: 'da_ky',
        signers: updatedSigners,
        auditLogs: [
          ...(doc.auditLogs || []),
          {
            id: `al-${Date.now()}`,
            time: `${todayStr} ${timeStr}`,
            actor: doc.lanhDaoName || 'Lãnh đạo ký duyệt',
            actorRole: 'Lãnh đạo phê duyệt',
            action: 'Ký số điện tử phê duyệt',
            statusBefore: doc.status,
            statusAfter: 'da_ky',
            version: 'V1',
            note: note || signingNoteInput || 'Đồng ý thụ lý giải quyết. Đã ký số phê duyệt Tờ trình.',
            signatureCert: 'VGCA - Ban Cơ yếu Chính phủ',
          },
        ],
        history: [
          ...(doc.history || []),
          {
            id: `h-${Date.now()}`,
            time: `${todayStr} ${timeStr}`,
            actor: doc.lanhDaoName || 'Lãnh đạo ký duyệt',
            action: 'Ký số điện tử phê duyệt Tờ trình Mẫu số 01',
            note: note || signingNoteInput || 'Đã ký số phê duyệt đề xuất thụ lý.',
            signatureCert: 'VGCA - Ban Cơ yếu Chính phủ',
          },
        ],
      };

      setActiveSigningDoc(updatedDoc);
      if (onUpdateSigningDocuments && signingDocuments.length > 0) {
        onUpdateSigningDocuments(
          signingDocuments.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
        );
      }
      setIsSigningSubmitting(false);
      setSigningNoteInput('');
      showToast(`✓ Đã ký số phê duyệt Tờ trình ${updatedDoc.soKyHieu || ''} cho đơn ${currentDonCode}!`);
    }, 600);
  };

  // Xử lý lưu nháp từ popup TaoBaoCaoDeXuatModal
  const handleSaveDraftBaoCaoModal = (
    _formData: BaoCaoDeXuatFormData,
    updatedDoc: SigningDocument
  ) => {
    if (onUpdateSigningDocuments) {
      onUpdateSigningDocuments(
        signingDocuments.some((d) => d.id === updatedDoc.id || d.hoSoCode === currentDonCode)
          ? signingDocuments.map((d) => (d.id === updatedDoc.id || d.hoSoCode === currentDonCode ? updatedDoc : d))
          : [updatedDoc, ...signingDocuments]
      );
    } else if (onCreateSigningDocument) {
      onCreateSigningDocument(updatedDoc);
    }
    setActiveSigningDoc(updatedDoc);
    setShowTaoBaoCaoDeXuatModal(false);
    showToast(`✓ Đã lưu bản nháp Báo cáo đề xuất (${updatedDoc.soKyHieu || 'Mẫu BC-01'})!`);
  };

  // Xử lý trình lãnh đạo từ popup TaoBaoCaoDeXuatModal
  const handleSubmitToLeaderBaoCaoModal = (
    _formData: BaoCaoDeXuatFormData,
    updatedDoc: SigningDocument
  ) => {
    if (onUpdateSigningDocuments) {
      onUpdateSigningDocuments(
        signingDocuments.some((d) => d.id === updatedDoc.id || d.hoSoCode === currentDonCode)
          ? signingDocuments.map((d) => (d.id === updatedDoc.id || d.hoSoCode === currentDonCode ? updatedDoc : d))
          : [updatedDoc, ...signingDocuments]
      );
    } else if (onCreateSigningDocument) {
      onCreateSigningDocument(updatedDoc);
    }
    setActiveSigningDoc(updatedDoc);
    setShowTaoBaoCaoDeXuatModal(false);
    showToast(`✓ Đã trình lãnh đạo duyệt Báo cáo đề xuất (${updatedDoc.soKyHieu || 'Mẫu BC-01'})!`);
  };

  // Chỉnh sửa trực tiếp dạng text cho Khối 2: Thông tin trích xuất từ đơn
  const [isEditingExtract, setIsEditingExtract] = useState<boolean>(false);
  const [extractData, setExtractData] = useState(DEFAULT_TO_CAO_DATA);
  const [savedExtractData, setSavedExtractData] = useState(DEFAULT_TO_CAO_DATA);

  // Quản lý chế độ người đứng đơn: '2_nguoi' (Đồng đứng đơn) | 'tap_the' (Tập thể 06 người) | '1_nguoi' (Cá nhân)
  const [cheDoNguoiDungDon, setCheDoNguoiDungDon] = useState<'2_nguoi' | 'tap_the' | '1_nguoi'>('2_nguoi');
  const [danhSachNguoiDungDon, setDanhSachNguoiDungDon] = useState<NguoiDungDonItem[]>(MOCK_2_NGUOI_DUNG_DON);

  const handleChonCheDoNguoiDungDon = (mode: '2_nguoi' | 'tap_the' | '1_nguoi') => {
    setCheDoNguoiDungDon(mode);
    if (mode === '2_nguoi') {
      setDanhSachNguoiDungDon(MOCK_2_NGUOI_DUNG_DON);
      updateExtractField('dongNguoiGui', 'Nguyễn Văn A (Đồng đứng đơn)');
      showToast('Đã chuyển sang chế độ: Đồng đứng đơn (02 người)');
    } else if (mode === 'tap_the') {
      setDanhSachNguoiDungDon(MOCK_TAP_THE_6_NGUOI);
      updateExtractField('dongNguoiGui', 'Tập thể 06 hộ dân TDP 4 (Bà Thanh đại diện)');
      showToast('Đã chuyển sang chế độ: Đơn tập thể (06 người)');
    } else {
      setDanhSachNguoiDungDon(MOCK_1_NGUOI_DUNG_DON);
      updateExtractField('dongNguoiGui', 'Không có');
      showToast('Đã chuyển sang chế độ: Đơn cá nhân (01 người)');
    }
  };

  const updateNguoiDungDonField = (id: string, field: keyof NguoiDungDonItem, value: any) => {
    setDanhSachNguoiDungDon((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };


  // ─── ĐỒNG BỘ THÔNG TIN BÓC TÁCH KHI MỞ TỪ MÀN HÌNH "CÔNG VIỆC CỦA TÔI" ─────
  useEffect(() => {
    if (!luotNhan) return;

    if (luotNhan.id.includes('LN-56') || luotNhan.noiDung?.includes('môi trường')) {
      const data = {
        ...DEFAULT_TO_CAO_DATA,
        nguoiGui: luotNhan.nguoiNop || 'Đại diện khu dân cư số 4',
        namSinh: '1975',
        cccd: '001075018392',
        sdt: '0984 556 789',
        diaChi: 'Khu dân cư số 4, Cầu Giấy, Hà Nội',
        dongNguoiGui: 'Ông Trần Văn Nam (Tổ phó TDP 4)',
        cccdDongNguoiGui: '001175029182',
        luatSu: 'Không có',
        theLuatSu: 'N/A',
        loaiNoiDung: 'Đơn phản ánh kiến nghị',
        dauHieu: 'Tiếp nhận trực tiếp theo ghi chú Một cửa (Không OCR - BR-09)',
        congTyBiToGiac: 'Cơ sở thu gom & tái chế phế liệu Minh Phát',
        mstCongTy: '0109283746',
        doiTuong: 'Cơ sở tái chế Minh Phát',
        chucVu: 'Chủ cơ sở sản xuất',
        donVi: 'Cơ sở tư nhân',
        nguoiLienQuan: 'Các hộ dân liền kề Khu dân cư số 4',
        cccdNguoiLienQuan: 'N/A',
        thoiGian: 'Tháng 8/2026 - nay',
        duAn: 'Khu dân cư số 4',
        diaDiem: 'Quận Cầu Giấy, Hà Nội',
        noiDungTomTat: luotNhan.noiDung || 'Phản ánh cơ sở tái chế phế liệu xả khói bụi và tiếng ồn ban đêm vượt quy chuẩn kỹ thuật môi trường tại Khu dân cư số 4, gây ảnh hưởng nghiêm trọng đến đời sống sinh hoạt của các hộ dân.',
        yeuCau1: 'Kiểm tra hiện trạng môi trường và đo đạc chỉ số khí thải.',
        yeuCau2: 'Yêu cầu tạm đình chỉ hoạt động gây tiếng ồn sau 22h.',
        yeuCau3: 'Buộc di dời cơ sở ra khỏi khu dân cư theo quy hoạch.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setAiState('none');
      setReadingProgress(0);
      setOfficerNote('Lượt nhận chuyển từ Một cửa: Tiếp nhận theo ghi chú thủ công, không có file scan (Không chạy OCR - BR-09). Cán bộ nhập liệu và xử lý thủ công.');
    } else if (luotNhan.id.includes('0430') || luotNhan.noiDung?.includes('Đội Cấn') || luotNhan.noiDung?.includes('cấp phép')) {
      const data = {
        ...DEFAULT_TO_CAO_DATA,
        nguoiGui: luotNhan.nguoiNop || 'Nguyễn Hải Phong',
        namSinh: '1982',
        cccd: '001082019482',
        sdt: '0912 889 922',
        diaChi: 'Số 14 ngõ 128 Đội Cấn, Ba Đình, Hà Nội',
        dongNguoiGui: 'Bà Lê Thúy Hằng (Đồng sở hữu)',
        cccdDongNguoiGui: '001184019283',
        luatSu: 'Không có',
        theLuatSu: 'N/A',
        loaiNoiDung: 'Hồ sơ cấp phép xây dựng',
        dauHieu: 'Chồng lấn chỉ giới xây dựng với ngõ đi chung (Độ tin cậy 68%)',
        congTyBiToGiac: 'N/A',
        mstCongTy: 'N/A',
        doiTuong: 'Công trình nhà ở riêng lẻ tại số 14 ngõ 128 Đội Cấn',
        chucVu: 'Chủ đầu tư công trình',
        donVi: 'Cá nhân',
        nguoiLienQuan: 'Các hộ dân sử dụng chung ngõ 128 Đội Cấn',
        cccdNguoiLienQuan: 'N/A',
        thoiGian: 'Tháng 09/2026',
        duAn: 'Nhà ở gia đình (5 tầng + 1 lửng)',
        diaDiem: 'Ngõ 128 Đội Cấn, Ba Đình, Hà Nội',
        noiDungTomTat: luotNhan.noiDung || 'Thẩm định hồ sơ xin cấp phép xây dựng nhà ở riêng lẻ ngõ 128 Đội Cấn. AI phát hiện bản vẽ hiện trạng có dấu hiệu chồng lấn 0.35m với chỉ giới ngõ đi chung của TDP số 3, cần cán bộ kiểm tra thực địa trước khi tiếp nhận.',
        yeuCau1: 'Kiểm tra trích lục bản đồ địa chính và mốc chỉ giới ngõ đi chung.',
        yeuCau2: 'Thẩm định tính hợp lệ của bản vẽ thiết kế thi công.',
        yeuCau3: 'Cán bộ xác nhận kết quả kiểm tra thực địa và quyết định thụ lý/bổ sung hồ sơ.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setAiState('done');
      setReadingProgress(100);
      setOfficerNote('Đề xuất tiếp nhận hồ sơ để tiến hành thẩm tra, đồng thời gửi phiếu yêu cầu công dân làm rõ phần ban công nhô ra ngõ đi chung 0.35m.');
    } else if (luotNhan.id.includes('LN-57') || luotNhan.aiJob === 3) {
      setAiState('reading');
      setReadingProgress(75);
      const data = {
        ...DEFAULT_TO_CAO_DATA,
        nguoiGui: luotNhan.nguoiNop || 'Bà Hoàng Thị Lựu',
        namSinh: '1948',
        cccd: '001048002918',
        sdt: '0903 221 445',
        diaChi: 'Phường Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
        dongNguoiGui: 'Không có',
        cccdDongNguoiGui: 'N/A',
        luatSu: 'Không có',
        theLuatSu: 'N/A',
        loaiNoiDung: 'Thủ tục chính sách xã hội',
        dauHieu: 'Đang đối soát CSDL Dân cư VNeID',
        congTyBiToGiac: 'N/A',
        mstCongTy: 'N/A',
        doiTuong: 'Chế độ trợ cấp xã hội người cao tuổi',
        chucVu: 'Đối tượng bảo trợ',
        donVi: 'UBND Phường',
        nguoiLienQuan: 'N/A',
        cccdNguoiLienQuan: 'N/A',
        thoiGian: '16/09/2026',
        duAn: 'Trợ cấp an sinh xã hội',
        diaDiem: 'Cầu Giấy, Hà Nội',
        noiDungTomTat: luotNhan.noiDung || 'Đề nghị hỗ trợ chính sách an sinh xã hội đối với người cao tuổi có hoàn cảnh neo đơn.',
        yeuCau1: 'Đối soát thông tin công dân trên CSDL Quốc gia về dân cư.',
        yeuCau2: 'Xác minh điều kiện hoàn cảnh bảo trợ xã hội.',
        yeuCau3: 'Hoàn thiện hồ sơ chi trả chế độ theo quy định.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setOfficerNote('Hồ sơ đang chờ kết nối CSDL dân cư VNeID bóc tách tự động.');
    } else if (luotNhan.id.includes('LN-58')) {
      const data = {
        ...DEFAULT_TO_CAO_DATA,
        nguoiGui: luotNhan.nguoiNop || 'Ông Đỗ Viết Thắng',
        namSinh: '1965',
        cccd: '001065009182',
        sdt: '0913 229 118',
        diaChi: 'Quận Cầu Giấy, Hà Nội',
        dongNguoiGui: 'Không có',
        cccdDongNguoiGui: 'N/A',
        luatSu: 'Không có',
        theLuatSu: 'N/A',
        loaiNoiDung: 'Đơn phản ánh kiến nghị',
        dauHieu: 'Tài liệu scan bị nghiêng mờ - Module OCR báo lỗi không bóc tách được',
        congTyBiToGiac: 'N/A',
        mstCongTy: 'N/A',
        doiTuong: 'Hộ liền kề số 16',
        chucVu: 'Cá nhân',
        donVi: 'Tổ dân phố',
        nguoiLienQuan: 'UBND Phường sở tại',
        cccdNguoiLienQuan: 'N/A',
        thoiGian: 'Tháng 9/2026',
        duAn: 'Ranh giới ngõ đi chung',
        diaDiem: 'Quận Cầu Giấy, Hà Nội',
        noiDungTomTat: luotNhan.noiDung || 'Phản ánh tranh chấp ranh giới sử dụng đất ngõ đi chung. Tài liệu scan kèm theo bị nghiêng mờ, module OCR không đọc được, cần cán bộ kiểm tra bản chính tại Một cửa hoặc nhập liệu bổ sung.',
        yeuCau1: 'Đối chiếu bản đồ địa chính gốc.',
        yeuCau2: 'Xác minh thực địa hiện trạng.',
        yeuCau3: 'Hòa giải tranh chấp ranh giới lối đi.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setIsNoPetitionElement(false);
      setAiState('none');
      setOfficerNote('Lỗi OCR: Tài liệu scan kèm theo bị nghiêng mờ, module OCR không đọc được. Cán bộ thụ lý kiểm tra và nhập liệu bổ sung.');
    } else if (
      luotNhan.id.includes('LN-59') ||
      luotNhan.loaiDon?.toLowerCase().includes('không có yếu tố là đơn') ||
      luotNhan.noiDung?.toLowerCase().includes('không có yếu tố là đơn')
    ) {
      const data = {
        ...NO_PETITION_ELEMENT_DATA,
        nguoiGui: luotNhan.nguoiNop || NO_PETITION_ELEMENT_DATA.nguoiGui,
        noiDungTomTat: luotNhan.noiDung || NO_PETITION_ELEMENT_DATA.noiDungTomTat,
      };
      setExtractData(data);
      setSavedExtractData(data);
      setIsNoPetitionElement(true);
      setAiState('done');
      setReadingProgress(100);
      setSelectedGhepDonCode('Đ-2026-00125');
      setHuongXuLy('ghep');
      setGhiChuGhep(
        'Ghép 02 chứng từ thương mại (Hợp đồng cung ứng vật tư số 18/2026/HĐKT-MK & Bảng báo giá VLXD Quý III/2026) vào hồ sơ Đ-2026-00125 (Vụ việc VV-2026-0042) theo 04 dẫn chứng đối soát CSDL của AI.'
      );
      setOfficerNote(
        'Tài liệu lượt nhận không có văn bản đơn thư đi kèm (0/4 yếu tố cấu thành đơn). Tuy nhiên qua tra cứu chéo CSDL GOVEX, AI phát hiện 04 dẫn chứng trùng khớp 95.8% với hồ sơ đang thụ lý Đ-2026-00125 (Vụ việc VV-2026-0042): trùng MST 0105519820 của Công ty CP ĐTPT Đô thị X, trùng địa bàn Lô TT-02 Dự án KĐT mới Y, trùng đại diện Phạm Đức Tùng và khớp Phiếu yêu cầu số 14/PYC-ĐXM. Đề xuất GHÉP vào hồ sơ Đ-2026-00125 làm tài liệu, chứng cứ bổ sung.'
      );
    } else {
      const data = {
        ...DEFAULT_TO_CAO_DATA,
        nguoiGui: luotNhan.nguoiNop || DEFAULT_TO_CAO_DATA.nguoiGui,
        cccd: luotNhan.cccd || DEFAULT_TO_CAO_DATA.cccd,
        sdt: luotNhan.sdt || DEFAULT_TO_CAO_DATA.sdt,
        diaChi: luotNhan.diaChi || DEFAULT_TO_CAO_DATA.diaChi,
        loaiNoiDung: luotNhan.loaiDon || DEFAULT_TO_CAO_DATA.loaiNoiDung,
        noiDungTomTat: luotNhan.noiDung || DEFAULT_TO_CAO_DATA.noiDungTomTat,
      };
      setExtractData(data);
      setSavedExtractData(data);
      setIsNoPetitionElement(false);
      setAiState('done');
      setReadingProgress(100);
      setHuongXuLy('tiep-nhan');
      setOfficerNote('Đề xuất tiếp nhận thụ lý giải quyết đơn tố cáo theo thẩm quyền quy định tại Luật Tố cáo 2018; đồng thời thành lập Tổ xác minh kiểm tra thực địa bồi thường GPMB tại Dự án KĐT Y.');
    }
  }, [luotNhan]);

  // ─── TRẠNG THÁI AI NGẦM CHUẨN BỊ THEO QUY TRÌNH (BACKGROUND PRE-PROCESSING) ─
  const [isPreProcessing, setIsPreProcessing] = useState<boolean>(false);
  const [preProcessNotice, setPreProcessNotice] = useState<string>('');

  // Ngay khi xác định hoặc thay đổi loại đơn, ngầm cho AI chạy xử lý theo quy trình đó
  useEffect(() => {
    setIsPreProcessing(true);
    const targetWf = matchWorkflowByLoaiDon(extractData.loaiNoiDung);
    const timer = setTimeout(() => {
      setIsPreProcessing(false);
      setPreProcessNotice(`AI đã ngầm chuẩn bị sẵn ${targetWf.totalSteps} bước tác nghiệp, ${targetWf.defaultTasks.length} nhiệm vụ và ${targetWf.potentialMissingInfo.length} điểm lưu ý theo "${targetWf.name}"`);
    }, 400);
    return () => clearTimeout(timer);
  }, [extractData.loaiNoiDung]);

  const { workflow: currentWf, actions: suggestedWfActions } = getSuggestedActionsForWorkflow(
    extractData.loaiNoiDung || 'Đơn tố giác về tội phạm'
  );

  // 6 bước tuần tự của AI sau OCR (BR-11)
  const AI_PIPELINE_STEPS_6 = [
    { step: 1, title: 'Trích xuất dữ liệu', desc: 'Bóc tách văn bản OCR & nhận diện bố cục' },
    { step: 2, title: 'Chuẩn hóa chủ thể', desc: 'Định danh đối chiếu CSDL dân cư' },
    { step: 3, title: 'Tra cứu lịch sử', desc: 'Lịch sử nộp đơn & giải quyết trước đây' },
    { step: 4, title: 'Tìm đơn/vụ việc liên quan', desc: 'Quét trùng lặp & liên đới hệ thống' },
    { step: 5, title: 'Đánh giá tính hợp lệ', desc: 'Kiểm tra thẩm quyền & điều kiện thụ lý' },
    { step: 6, title: 'Tổng hợp & gợi ý', desc: 'Đề xuất phân loại & quy trình xử lý' },
  ];

  // BR-12, BR-13, BR-14: Kết quả AI là đề xuất; cán bộ sửa và lưu sẽ trở thành dữ liệu chính thức ưu tiên cao; không tự chạy lại OCR
  const handleSaveExtract = () => {
    setSavedExtractData({ ...extractData });
    setIsOfficialData(true);
    setIsEditingExtract(false);
    onUpdateLuotNhan?.({ ...luotNhan, isOfficialData: true, officerEdits: extractData as any });
    showToast('✓ Đã lưu thay đổi! Giá trị cán bộ chỉnh sửa được xác lập là Dữ liệu chính thức (BR-13).');
  };

  const handleCancelExtract = () => {
    setExtractData({ ...savedExtractData });
    setIsEditingExtract(false);
  };

  const updateExtractField = (key: keyof typeof extractData, val: string) => {
    setExtractData((prev) => ({ ...prev, [key]: val }));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const handleNavigateToDocument = (fileIndex: number, highlightKey?: string) => {
    setSelectedFileIndex(fileIndex);
    if (highlightKey) {
      setActiveHighlightKey(highlightKey);
    }
    const targetFile = currentFiles[fileIndex];
    const targetName = targetFile?.name || `Tệp đính kèm #${fileIndex + 1}`;
    showToast(`Đã chuyển sang tài liệu gốc: ${targetName}`);
  };

  // BR-11: Mô phỏng AI tuần tự 6 bước sau OCR
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setReadingProgress((prev) => {
        const next = prev + 15;
        if (next <= 25) setAiStepIndex(1);
        else if (next <= 45) setAiStepIndex(2);
        else if (next <= 65) setAiStepIndex(3);
        else if (next <= 80) setAiStepIndex(4);
        else if (next <= 95) setAiStepIndex(5);
        else setAiStepIndex(6);

        if (next >= 100) {
          clearInterval(interval);
          setAiState('done');
          setIsSimulating(false);
          setAiStepIndex(6);
          showToast('✓ AI đã hoàn thành 6 bước phân tích và tổng hợp đề xuất xử lý (BR-11)!');
          return 100;
        }
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // BR-10: Chỉ chạy lại khi cán bộ chủ động chọn Phân tích lại
  const handleStartSimulation = () => {
    setAiState('reading');
    setReadingProgress(15);
    setAiStepIndex(1);
    setIsSimulating(true);
    showToast('Bắt đầu phân tích lại: AI quét OCR và chạy tuần tự 6 bước phân tích (BR-10, BR-11)...');
  };

  const handleCopySummary = () => {
    navigator.clipboard?.writeText(
      'Nguyễn Văn A tố giác ông Trần Văn B (Giám đốc Công ty Cổ phần X) có hành vi lừa đảo chiếm đoạt tài sản qua huy động vốn tại Dự án Khu đô thị Y (Hà Nội) giai đoạn 2024 – 2025. Đề xuất hướng xử lý: Phân loại đơn Tố giác tội phạm; chuyển Phòng Cảnh sát kinh tế thụ lý, xác minh theo thẩm quyền; đồng thời rà soát hợp nhất với 01 đơn tương tự (D-2025-00341) và kiểm tra tiền sử 03 đơn đã gửi của người đứng đơn.'
    );
    showToast('Đã sao chép nội dung tóm tắt & đề xuất xử lý vào khay nhớ tạm.');
  };

  // BR-03, BR-04, BR-05: Kiểm tra điều kiện mở modal chuyển tiếp nhận & xử lý
  const handleOpenChuyenModal = () => {
    if (currentLuotNhanStatus !== 'cho_chuyen') {
      showToast(`Lượt nhận đã ở trạng thái "${currentLuotNhanStatus === 'da_chuyen' ? 'Đã chuyển' : currentLuotNhanStatus === 'da_ban_giao' ? 'Đã bàn giao' : 'Đã trả lại'}", không thể chuyển tiếp nhận lại.`);
      return;
    }

    const hasFiles = Boolean(
      (luotNhan?.files && luotNhan.files.length > 0) ||
      luotNhan?.hasFile ||
      (luotNhan?.id && !luotNhan.id.includes('empty'))
    );
    const hasNote = Boolean(
      luotNhan?.ghiChu?.trim() ||
      luotNhan?.noiDung?.trim() ||
      extractData?.noiDungTomTat?.trim()
    );

    if (!hasFiles && !hasNote) {
      setValidationErrorModal(
        'Lượt nhận chưa đủ điều kiện để chuyển tiếp nhận & xử lý (Quy tắc BR-04, BR-05):\n\n• Yêu cầu bắt buộc: Phải có ít nhất 01 nguồn dữ liệu xử lý (file tài liệu đính kèm hoặc ghi chú nội dung tiếp nhận).\n• Thông tin người nộp hồ sơ: Không bắt buộc.\n\nVui lòng tải lên tệp tài liệu hoặc nhập nội dung ghi chú trước khi chuyển.'
      );
      return;
    }

    setShowChuyenModal(true);
  };

  // Chuyển sang màn hình chi tiết đơn (don-tiep-nhan)
  const handleGoToChiTietDon = (targetCode?: string) => {
    const isGhep = luotNhan?.status === 'da_ghep' || currentLuotNhanStatus === 'da_ghep';
    const dynamicCode =
      targetCode ||
      (isGhep ? (luotNhan as any)?.ghepVaoDonCode || selectedGhepDonCode : undefined) ||
      (luotNhan?.id
        ? luotNhan.id.startsWith('LN-')
          ? `Đ-${luotNhan.id.replace('LN-', '')}`
          : luotNhan.id
        : 'Đ-2026-00125');

    const donObj: DonDetail = {
      id: dynamicCode,
      code: dynamicCode,
      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      luotNhanId: luotNhan?.id || dynamicCode,
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Công dân',
      ngayNhan: luotNhan?.ngayNhan || 'Hôm nay',
      loaiDon: extractData.loaiNoiDung || luotNhan?.loaiDon || 'Đơn phản ánh kiến nghị',
      type: (dynamicCode.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN') as 'VỤ VIỆC' | 'ĐƠN TIẾP NHẬN',
      statusBadge: isGhep ? 'Đang thụ lý giải quyết' : 'Đang xác minh thông tin',
      isNew: true,
      currentStep: 2,
      stepName: 'Xác minh thông tin & Đề xuất hướng xử lý',
    };
    onAcceptAndProcess?.(donObj);
    onNav('don-tiep-nhan');
  };

  // Nếu đơn đã được tiếp nhận hay ghép thì không ở màn Bàn phân tích AI này nữa -> Chuyển ngay sang màn chi tiết đơn
  useEffect(() => {
    const isAlreadyProcessed =
      luotNhan?.status === 'da_chuyen' ||
      luotNhan?.status === 'da_ghep' ||
      luotNhan?.status === 'da_tiep_nhan' ||
      currentLuotNhanStatus === 'da_chuyen' ||
      currentLuotNhanStatus === 'da_ghep';

    if (isAlreadyProcessed) {
      handleGoToChiTietDon();
    }
  }, [luotNhan?.id, luotNhan?.status, currentLuotNhanStatus]);

  // BR-06, BR-07, BR-08, BR-09: Xử lý submit chuyển tiếp nhận
  const handleChuyenTiepNhanSubmit = (data: ChuyenTiepNhanSubmitData) => {
    setShowChuyenModal(false);
    setCurrentLuotNhanStatus('da_chuyen');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'da_chuyen' });

    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    const hasFiles = Boolean(
      (luotNhan?.files && luotNhan.files.length > 0) ||
      luotNhan?.hasFile ||
      (luotNhan?.id && !luotNhan.id.includes('empty'))
    );

    const newItem: TiepNhanDonItem = {
      id: `TN-${dynamicCode.replace('Đ-', '')}`,
      code: dynamicCode,
      luotNhanId: luotNhan?.id || 'LN-2025-0819',
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Chưa xác định danh tính',
      loaiDon: extractData.loaiNoiDung || 'Đơn phản ánh kiến nghị',
      ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:15',
      ngayChuyenDen: 'Vừa xong',
      donViHienTai: 'Bộ phận Tiếp nhận đơn (Một cửa)',
      donViTiepNhanId: data.donViTiepNhanId,
      donViTiepNhan: data.donViTiepNhanName,
      hanXuLy: 'Còn 3 ngày',
      hanXuLyFull: '19/09/2026 - 17:00',
      trangThai: data.hinhThuc === 'hang_cho' ? 'cho_phan_cong' : 'dang_xu_ly',
      noiDungTomTat: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      ghiChuChuyen: data.ghiChu,
      nguoiChuyen: 'Cán bộ thụ lý (Nguyễn Minh Anh)',
      canBoXuLy: data.canBoNhan?.name,
      canBoXuLyId: data.canBoNhan?.id,
      chucVuCanBo: data.canBoNhan?.role,
      ngayPhanCong: data.hinhThuc === 'truc_tiep' ? '16/09/2026' : undefined,
      nguoiPhanCong: data.hinhThuc === 'truc_tiep' ? 'Nguyễn Minh Anh (Giao trực tiếp)' : undefined,
      hinhThucChuyen: data.hinhThuc,
      nguonXuLy: hasFiles ? 'file_ocr' : 'ghi_chu_thu_cong',
    };

    if (data.hinhThuc === 'hang_cho') {
      onChuyenTiepNhan?.(newItem, false);
    } else {
      onChuyenTiepNhan?.(newItem, true, data.canBoNhan?.name);
    }

    const donObj = {
      id: dynamicCode,
      code: dynamicCode,
      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      luotNhanId: luotNhan?.id || dynamicCode,
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Chưa xác định danh tính',
      ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:15',
      loaiDon: extractData.loaiNoiDung || luotNhan?.loaiDon || 'Đơn phản ánh kiến nghị',
      type: (dynamicCode.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN') as 'VỤ VIỆC' | 'ĐƠN TIẾP NHẬN',
      statusBadge: 'Chờ tiếp nhận',
      isAwaitingAcceptance: true,
      hasBaoCaoDeXuat: false,
      fromBanPhanTich: true,
      isNew: true,
    };
    onAcceptAndProcess?.(donObj);

    showToast(`✓ Đã tiếp nhận đơn ${dynamicCode} thành công. Chuyển sang màn hình chi tiết đơn...`);
    setTimeout(() => onNav('don-tiep-nhan'), 350);
  };

  // BR-16, BR-17, BR-18: Xác nhận Tiếp nhận (Chuyển trực tiếp sang màn chi tiết đơn, không cần popup)
  const handleConfirmTiepNhan = () => {
    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    setShowSubmitModal(false);

    const donObj: DonDetail = {
      id: dynamicCode,
      code: dynamicCode,
      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      luotNhanId: luotNhan?.id || dynamicCode,
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Người nộp đơn',
      ngayNhan: luotNhan?.ngayNhan || 'Hôm nay',
      loaiDon: extractData.loaiNoiDung || luotNhan?.loaiDon || 'Đơn tiếp nhận hành chính',
      type: (dynamicCode.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN') as 'VỤ VIỆC' | 'ĐƠN TIẾP NHẬN',
      statusBadge: 'Chờ tiếp nhận',
      isAwaitingAcceptance: true,
      hasBaoCaoDeXuat: false,
      fromBanPhanTich: true,
      currentStep: 2,
      stepName: 'Xác minh thông tin & Đề xuất hướng xử lý',
    };

    setCurrentLuotNhanStatus('da_chuyen');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'da_chuyen' });

    const newItem: TiepNhanDonItem = {
      id: `TN-${dynamicCode.replace('Đ-', '')}`,
      code: dynamicCode,
      luotNhanId: luotNhan?.id || dynamicCode,
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Người nộp đơn',
      loaiDon: extractData.loaiNoiDung || 'Đơn tiếp nhận hành chính',
      ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:30',
      ngayChuyenDen: 'Vừa xong',
      donViHienTai: 'Phòng Tiếp công dân & Xử lý đơn',
      donViTiepNhanId: 'tiep-dan',
      donViTiepNhan: 'Phòng Tiếp công dân & Xử lý đơn',
      hanXuLy: 'Còn 3 ngày',
      hanXuLyFull: '19/09/2026 - 17:00',
      trangThai: 'dang_xu_ly',
      noiDungTomTat: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      canBoXuLy: 'Nguyễn Minh Anh',
      chucVuCanBo: 'Cán bộ thụ lý',
      ngayPhanCong: '16/09/2026',
      nguoiPhanCong: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
      ghiChuPhanCong: officerNote || 'Tiếp nhận trực tiếp và chuyển vào quy trình xử lý',
      hinhThucChuyen: 'truc_tiep',
      lichSuPhanCong: [
        {
          time: '16/09/2026 10:45',
          nguoiGiao: 'Nguyễn Minh Anh',
          nguoiNhan: 'Nguyễn Minh Anh',
          ghiChu: officerNote || 'Tiếp nhận trực tiếp và chuyển vào quy trình xử lý',
        },
      ],
    };
    onChuyenTiepNhan?.(newItem, true, 'Nguyễn Minh Anh');

    onAcceptAndProcess?.(donObj);
    showToast(`✓ Đã tiếp nhận đơn ${dynamicCode}. Đang chuyển sang màn hình chi tiết đơn...`);
    onNav('don-tiep-nhan');
  };

  // Xử lý xác nhận Ghép lượt nhận vào hồ sơ Đơn đã có (Không sinh mã đơn mới)
  const handleConfirmGhep = () => {
    setShowGhepModal(false);
    setCurrentLuotNhanStatus('da_ghep');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'da_ghep', ghepVaoDonCode: selectedGhepDonCode });

    const targetGhepDonObj: DonDetail = {
      id: selectedGhepDonCode,
      code: selectedGhepDonCode,
      title: luotNhan?.noiDung || `Hồ sơ ${selectedGhepDonCode} (Đã ghép hồ sơ)`,
      luotNhanId: luotNhan?.id || selectedGhepDonCode,
      nguoiNop: luotNhan?.nguoiNop || 'Người nộp đơn',
      ngayNhan: luotNhan?.ngayNhan || 'Hôm nay',
      loaiDon: luotNhan?.loaiDon || 'Đơn tiếp nhận hành chính',
      type: (selectedGhepDonCode.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN') as 'VỤ VIỆC' | 'ĐƠN TIẾP NHẬN',
      statusBadge: 'Đang thụ lý giải quyết',
      currentStep: 2,
      stepName: 'Xác minh thông tin & Đề xuất hướng xử lý',
    };

    onAcceptAndProcess?.(targetGhepDonObj);
    showToast(
      `✓ Đã ghép thành công lượt nhận ${luotNhan?.id || 'LN-56/2026-GOVEX'} vào hồ sơ đơn ${selectedGhepDonCode}. Đang chuyển sang màn chi tiết đơn...`
    );
    onNav('don-tiep-nhan');
  };

  // BR-19, BR-20, BR-21, BR-22: Xác nhận Bàn giao (Đơn vị khác vs Cán bộ trong phòng)
  // STEP-03C: Xác nhận Bàn giao từ Popup BanGiaoDonModal (Cán bộ chuyên môn)
  const handleBanGiaoModalSubmit = (data: BanGiaoDonSubmitData) => {
    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    setShowBanGiaoModal(false);
    setCurrentLuotNhanStatus('da_ban_giao');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'da_ban_giao' });

    const targetName =
      data.banGiaoType === 'don_vi_khac'
        ? data.donViNhanName || 'Đơn vị tiếp nhận'
        : data.canBoNhan?.name || 'Cán bộ trong phòng';

    showToast(
      `✓ [STEP-03C] Đã hoàn tất bàn giao đơn ${dynamicCode} sang "${targetName}" (${data.danhMucTaiLieu.length} tài liệu, ${data.cauHinhVanBan.taoVanBan ? `Biên bản: ${data.cauHinhVanBan.soKyHieu}` : 'Không xuất văn bản'}).`
    );

    onBanGiao?.(luotNhan?.id, targetName, data.canBoNhan?.name, data.lyDoBanGiao);

    onAcceptAndProcess?.({
      id: dynamicCode,
      code: dynamicCode,
      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      luotNhanId: luotNhan?.id || 'LN-2025-0105',
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Vũ Thị Thanh',
      ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:30',
      loaiDon: extractData.loaiNoiDung || 'Đơn tiếp nhận hành chính',
      type: dynamicCode.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN',
      statusBadge: 'Đã bàn giao',
    });

    setTimeout(() => onNav('don-tiep-nhan'), 800);
  };

  // STEP-03D: Xác nhận Trả lại từ Popup TraLaiDonModal (Cán bộ chuyên môn)
  const handleTraLaiModalSubmit = (data: TraLaiDonSubmitData) => {
    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    setShowTraLaiModal(false);
    setCurrentLuotNhanStatus('da_tra_lai');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'da_tra_lai' });

    showToast(
      `✓ [STEP-03D] Đã lập văn bản trả lại đơn ${dynamicCode} cho công dân ${extractData.nguoiGui || luotNhan?.nguoiNop} (${data.cauHinhVanBan.taoVanBan ? `Văn bản: ${data.cauHinhVanBan.soKyHieu}` : 'Ghi nhận lý do'}) và kết thúc Task xử lý.`
    );

    onTraLai?.(luotNhan?.id, data.lyDoChiTiet);
  };

  // STEP-03A: Xác nhận Thụ lý từ Popup ThuLyDonModal (Lập Tờ trình Mẫu số 01/TT-TTCP và vào Luồng trình ký)
  const handleThuLyModalSubmit = (data: ThuLyDonSubmitData) => {
    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    setShowThuLyModal(false);
    setCurrentLuotNhanStatus('da_thu_ly');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'da_thu_ly' });

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const docId = `VB-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const leader = INITIAL_LEADERS.find((l) => l.id === data.lanhDaoKyId) || {
      id: data.lanhDaoKyId || 'ld-01',
      name: data.lanhDaoKyName || 'Đ/c Trần Văn Hùng',
      chucVu: data.lanhDaoKyChucVu || 'Phó Chánh Thanh tra thành phố',
      coQuan: data.lanhDaoKyCoQuan || 'Thanh tra Thành phố',
    };

    // Tạo văn bản Trình ký chuẩn hệ thống
    const newDoc: SigningDocument = {
      id: docId,
      soKyHieu: data.cauHinhBaoCao.soKyHieu || `${Math.floor(10 + Math.random() * 90)}/TTr-TCD`,
      hoSoCode: dynamicCode,
      luotNhanId: luotNhan?.id || 'LN-2026-0819',
      loaiDon: extractData.loaiNoiDung || luotNhan?.loaiDon || 'Đơn tố cáo cán bộ vi phạm',
      nguoiGuiDon: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
      noiDungDon: extractData.noiDungTomTat || luotNhan?.noiDung || 'Tố cáo vi phạm công vụ',

      tenVanBan: `Tờ trình đề xuất thụ lý giải quyết đơn tố cáo [${dynamicCode}]`,
      loaiVanBan: 'to_trinh_thu_ly',
      loaiVanBanLabel: 'Tờ trình đề xuất thụ lý',
      trichYeu: `V/v Đề xuất thụ lý giải quyết đơn tố cáo đối với ${extractData.doiTuong || 'cán bộ vi phạm'} - Hồ sơ ${dynamicCode}`,
      noiDungChiTiet: `Kính gửi: ${data.cauHinhBaoCao.kinhGui || leader.name}

Căn cứ Luật Tố cáo năm 2018 (Điều 12, Điều 29, Điều 30);
Căn cứ Nghị định số 31/2019/NĐ-CP ngày 10/04/2019 của Chính phủ;
Căn cứ Thông tư số 05/2021/TT-TTCP ngày 01/10/2021 của Thanh tra Chính phủ;

Sau khi kiểm tra ban đầu và xác minh thông tin đối với hồ sơ đơn số ${dynamicCode} của người tố cáo:
1. Tư cách người tố cáo: Đầy đủ năng lực hành vi dân sự, đơn có chữ ký trực tiếp, thông tin nhân thân rõ ràng.
2. Thẩm quyền: Vụ việc thuộc thẩm quyền thụ lý giải quyết theo quy định tại Điều 12 Luật Tố cáo 2018.
3. Nội dung: Đã xác định rõ người bị tố cáo (${extractData.doiTuong || 'cán bộ vi phạm'}), hành vi vi phạm và có tài liệu kèm theo.

Ý kiến đề xuất:
Kính trình Lãnh đạo phê duyệt:
- Thụ lý giải quyết nội dung tố cáo nêu trên.
- Ban hành Quyết định thụ lý và thành lập Tổ xác minh gồm ${data.phuongThucThuLy === 'phan_cong_can_bo' ? data.canBoThuLyName : 'cán bộ'} làm Tổ trưởng. Thời hạn xác minh: ${data.thoiHanXacMinhNgay} ngày làm việc.`,

      nguoiLap: 'Nguyễn Minh Anh',
      donViNguoiLap: 'Phòng Tiếp công dân & Xử lý đơn',
      ngayTao: todayStr,

      nguoiTrinh: 'Nguyễn Minh Anh',
      thoiGianTrinh: `${todayStr} ${timeStr}`,
      yKienCanBo: data.yKienTrinhLanhDao || 'Kính trình Lãnh đạo xem xét, phê duyệt Tờ trình đề xuất thụ lý và ban hành Quyết định thụ lý giải quyết theo quy định.',

      // Luồng ký tuần tự: Lãnh đạo được chọn -> Chánh Thanh tra
      signers: [
        {
          id: leader.id,
          name: leader.name,
          chucVu: leader.chucVu,
          coQuan: leader.coQuan,
          vaiTro: 'ky',
          thuTu: 1,
          status: 'cho_ky',
        },
        {
          id: 'ld-05',
          name: 'Đ/c Đặng Quốc Bảo',
          chucVu: 'Chánh Thanh tra thành phố',
          coQuan: 'Ban Lãnh đạo Thanh tra',
          vaiTro: 'ky',
          thuTu: 2,
          status: 'chua_den_luot',
        },
      ],
      currentSignerIndex: 0,
      lanhDaoId: leader.id,
      lanhDaoName: leader.name,
      lanhDaoChucVu: leader.chucVu,

      status: 'da_trinh',
      hanXuLy: data.hanXuLy || '24 giờ',
      mucDoUuTien: data.mucDoUuTien || 'khan',

      tepDinhKem: [
        { id: 'att-1', tenTep: `To_trinh_thu_ly_${dynamicCode}.docx`, dungLuong: '1.8 MB', loai: 'du_thao' },
        { id: 'att-2', tenTep: `Du_thao_Quyet_dinh_thu_ly_${dynamicCode}.docx`, dungLuong: '1.2 MB', loai: 'du_thao' },
        { id: 'att-3', tenTep: `Don_to_cao_scan_${dynamicCode}.pdf`, dungLuong: '4.6 MB', loai: 'chung_cu' },
      ],

      phienBanHienTai: 'V1',
      versionHistory: [
        {
          version: 'V1',
          thoiGian: `${todayStr} ${timeStr}`,
          nguoiTao: 'Nguyễn Minh Anh',
          trangThaiLucDo: 'Khởi tạo và trình ký',
          ghiChu: 'Tờ trình Mẫu số 01 kèm dự thảo Quyết định',
          noiDungSnapshot: 'Khởi tạo tờ trình',
        },
      ],

      history: [
        {
          id: `h-${Date.now()}`,
          time: `${todayStr} ${timeStr}`,
          actor: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
          action: 'Lập Tờ trình và chuyển vào Luồng trình ký',
          note: data.yKienTrinhLanhDao || 'Kính trình Lãnh đạo xem xét phê duyệt.',
          signatureCert: 'VGCA - Ban Cơ yếu Chính phủ',
        },
      ],

      auditLogs: [
        {
          id: `al-${Date.now()}`,
          time: `${todayStr} ${timeStr}`,
          actor: 'Nguyễn Minh Anh',
          actorRole: 'Cán bộ thụ lý',
          action: 'Trình văn bản',
          statusBefore: 'nhap',
          statusAfter: 'da_trinh',
          version: 'V1',
          note: `Trình Lãnh đạo ${leader.name} phê duyệt Tờ trình`,
          signatureCert: 'VGCA - Ban Cơ yếu Chính phủ',
        },
      ],

      stepId: 'STEP-03A',
    };

    onCreateSigningDocument?.(newDoc);
    setActiveSigningDoc(newDoc);
    setShowSigningDocModal(true);

    showToast(
      `✓ Đã lập Tờ trình (${newDoc.soKyHieu}) đề xuất thụ lý ${dynamicCode} và liên kết trực tiếp vào hồ sơ đơn!`
    );

    onAcceptAndProcess?.({
      id: dynamicCode,
      code: dynamicCode,
      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      luotNhanId: luotNhan?.id || 'LN-2025-0105',
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
      ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:30',
      loaiDon: extractData.loaiNoiDung || 'Đơn tố cáo',
      type: 'ĐƠN THỤ LÝ',
      statusBadge: 'Đang trình ký thụ lý',
      baoCaoThuLy: data,
    });
  };

  const handleConfirmBanGiao = () => {
    setShowBanGiaoModal(true);
  };

  const handleConfirmTraLai = () => {
    setShowTraLaiModal(true);
  };

  const handleXacMinhSelectHuong = (huong: HuongGiaiQuyetType | 'quy_trinh') => {
    setShowXacMinhModal(false);
    if (huong === 'thu_ly') {
      setShowThuLyModal(true);
    } else if (huong === 'yeu_cau_bo_sung') {
      setShowBoSungModal(true);
    } else if (huong === 'khong_thu_ly') {
      setShowKhongThuLyModal(true);
    } else if (huong === 'ban_giao') {
      setShowBanGiaoModal(true);
    } else if (huong === 'tra_lai') {
      setShowTraLaiModal(true);
    } else {
      onNav('quy-trinh-xu-ly');
    }
  };

  const handleKhongThuLySubmit = (data: {
    soKyHieu: string;
    ngayBanHanh: string;
    lyDoChinh: string;
    lyDoChiTiet: string;
    canCuPhapLy: string;
    nguoiNhan: string;
    nguoiKy: string;
  }) => {
    setShowKhongThuLyModal(false);
    setCurrentLuotNhanStatus('khong_thu_ly');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'khong_thu_ly' });
    showToast(`✓ Đã ban hành ${data.soKyHieu} - Thông báo không thụ lý giải quyết đơn (KẾT THÚC ĐƠN).`);
    setTimeout(() => {
      onNav('don-tiep-nhan');
    }, 1200);
  };

  const handleBoSungSubmit = (soHieu: string, danhSachBoSung: string[]) => {
    setShowBoSungModal(false);
    setCurrentLuotNhanStatus('cho_bo_sung');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'cho_bo_sung' });
    showToast(`✓ Đã ban hành ${soHieu} - Yêu cầu bổ sung ${danhSachBoSung.length} tài liệu gửi công dân (Thời hạn 10 ngày).`);
  };

  const handleSwitchToStandardMode = () => {
    setIsNoPetitionElement(false);
    setAiState('done');
    setReadingProgress(100);
    setIsSimulating(false);
    setSelectedFileIndex(0);
    setExtractData(DEFAULT_TO_CAO_DATA);
    setSavedExtractData(DEFAULT_TO_CAO_DATA);
    setHuongXuLy('tiep-nhan');
    setOfficerNote(
      'Đề xuất tiếp nhận thụ lý giải quyết đơn tố cáo theo thẩm quyền quy định tại Luật Tố cáo 2018; đồng thời thành lập Tổ xác minh kiểm tra thực địa bồi thường GPMB tại Dự án KĐT Y.'
    );
    showToast('Chuyển sang: Trạng thái 2 - AI đã đọc xong thông tin (Đơn tố cáo đủ yếu tố).');
  };

  const handleSwitchToNoPetitionMode = () => {
    setIsNoPetitionElement(true);
    setAiState('done');
    setReadingProgress(100);
    setIsSimulating(false);
    setSelectedFileIndex(0);
    setExtractData(NO_PETITION_ELEMENT_DATA);
    setSavedExtractData(NO_PETITION_ELEMENT_DATA);
    setSelectedGhepDonCode('Đ-2026-00125');
    setHuongXuLy('ghep');
    setGhiChuGhep(
      'Ghép 02 chứng từ thương mại (Hợp đồng cung ứng vật tư số 18/2026/HĐKT-MK & Bảng báo giá VLXD Quý III/2026) vào hồ sơ Đ-2026-00125 (Vụ việc VV-2026-0042) theo 04 dẫn chứng đối soát CSDL của AI.'
    );
    setOfficerNote(
      'Tài liệu lượt nhận không có văn bản đơn thư đi kèm (0/4 yếu tố cấu thành đơn). Tuy nhiên qua tra cứu chéo CSDL GOVEX, AI phát hiện 04 dẫn chứng trùng khớp 95.8% với hồ sơ đang thụ lý Đ-2026-00125 (Vụ việc VV-2026-0042): trùng MST 0105519820 của Công ty CP ĐTPT Đô thị X, trùng địa bàn Lô TT-02 Dự án KĐT mới Y, trùng đại diện Phạm Đức Tùng và khớp Phiếu yêu cầu số 14/PYC-ĐXM. Đề xuất GHÉP vào hồ sơ Đ-2026-00125 làm tài liệu, chứng cứ bổ sung.'
    );
    showToast('Chuyển sang: Trạng thái 3 - Tài liệu không phải là đơn (AI đối soát 04 dẫn chứng & gợi ý Ghép hồ sơ).');
  };

  const handleConfirmXepLuu = () => {
    setShowXepLuuModal(false);
    setCurrentLuotNhanStatus('da_xep_luu');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'khong_thu_ly' });
    showToast(
      `✓ Đã xác nhận Không tiếp nhận & Xếp lưu tài liệu lượt nhận ${luotNhan?.id || 'LN-59/2026-GOVEX'} (Do không có yếu tố là đơn).`
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f1f5f9] text-[#1e293b] font-body-md overflow-hidden select-none">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}
      <div className="bg-slate-100/90 backdrop-blur-xs border-b border-slate-200 px-5 py-2 flex items-center justify-between text-xs text-slate-700 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="material-symbols-outlined text-[#004ac6] text-[18px]">tune</span>
          <span className="font-semibold text-slate-700">Chế độ hiển thị:</span>
          <div className="flex items-center p-0.5 bg-slate-200/90 rounded-lg border border-slate-300 flex-wrap gap-0.5">
            <button
              type="button"
              onClick={() => {
                setAiState('reading');
                setReadingProgress(55);
                setIsSimulating(false);
                showToast('Chuyển sang: Trạng thái 1 - AI đang đọc thông tin.');
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${aiState === 'reading'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
            >
              <span className="material-symbols-outlined text-[14px]">sync</span>
              <span>1. AI đang đọc thông tin</span>
            </button>
            <button
              type="button"
              onClick={handleSwitchToStandardMode}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${aiState === 'done' && !isNoPetitionElement
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
            >
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>2. AI đã đọc xong (Ảnh mẫu)</span>
            </button>
            <button
              type="button"
              onClick={handleSwitchToNoPetitionMode}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${aiState === 'done' && isNoPetitionElement
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              title="Trường hợp tài liệu lượt nhận chỉ là chứng từ rời, hợp đồng, thông báo... không có nội dung khiếu nại, tố cáo, kiến nghị, phản ánh"
            >
              <span className="material-symbols-outlined text-[14px]">report_off</span>
              <span>3. Tài liệu không có yếu tố là đơn</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartSimulation}
            disabled={isSimulating}
            className="px-3 py-1 rounded-lg bg-[#004ac6] hover:bg-[#003da6] text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[15px]">play_arrow</span>
            <span>{isSimulating ? `Đang quét OCR (${readingProgress}%)...` : 'Phát lại quá trình AI quét đọc'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUB-HEADER BREADCRUMB & METADATA                                       */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex flex-col gap-1 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => onNav('cong-viec')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
              title="Quay lại Bàn làm việc Công việc của tôi"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Công việc của tôi</span>
            </button>
            <span className="text-slate-300">/</span>
            <button
              type="button"
              onClick={() => onNav('nhan-don-list')}
              className="text-slate-500 hover:text-blue-600 hover:underline cursor-pointer"
            >
              Tiếp nhận đơn
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-bold">
              {isNoPetitionElement
                ? 'Phân tích AI: Tài liệu lượt nhận không có yếu tố là đơn'
                : 'Phân tích OCR đơn tố cáo'}
            </span>
          </div>

          {/* Title & Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[19px] font-bold text-slate-900 font-headline-md tracking-tight">
              {isNoPetitionElement
                ? `Phân tích OCR & Đánh giá điều kiện đơn: Tài liệu không có yếu tố là đơn`
                : `Phân tích OCR & Đề xuất xử lý: Đơn tố cáo (${extractData.nguoiGui || 'Vũ Thị Thanh'})`}
            </h1>

            {aiState === 'reading' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 text-[11.5px] font-semibold font-label-technical animate-pulse">
                <span className="material-symbols-outlined text-[14px] animate-spin text-amber-600">
                  sync
                </span>
                <span>AI phân tích ({readingProgress}%)</span>
              </span>
            ) : isNoPetitionElement ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[11.5px] font-bold">
                <span className="material-symbols-outlined text-[14px] text-amber-700">folder_managed</span>
                <span>
                  AI phân loại: Tài liệu không phải là đơn ({KICH_BAN_TAI_LIEU_MAP[activeDocScenario].doTinCayPhanLoaiKhongPhaiDon})
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11.5px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>OCR trích xuất hoàn tất (98%)</span>
              </span>
            )}
          </div>

          {/* Document Metadata */}
          {isNoPetitionElement ? (
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5 font-normal">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#004ac6] font-bold border border-blue-200 text-[11px]">
                  Loại tài liệu: {KICH_BAN_TAI_LIEU_MAP[activeDocScenario].nhanDien.loaiTaiLieuLabel}
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-bold border border-amber-300 text-[11px] font-mono">
                  Số, ký hiệu: {KICH_BAN_TAI_LIEU_MAP[activeDocScenario].nhanDien.soKyHieu || 'Chưa xác định'}
                </span>
                <span>•</span>
                <span>
                  Ngày lập/ban hành:{' '}
                  <strong className="text-slate-700 font-label-technical">
                    {KICH_BAN_TAI_LIEU_MAP[activeDocScenario].nhanDien.ngayLapBanHanh || 'Chưa xác định'}
                  </strong>
                </span>
              </div>
              <span>•</span>
              <div>
                <span>Cơ quan ban hành / Người gửi:</span>{' '}
                <strong className="text-slate-800 font-semibold">
                  {KICH_BAN_TAI_LIEU_MAP[activeDocScenario].nhanDien.coQuanNguoiGui}
                </strong>
              </div>
              <span>•</span>
              <div className="text-slate-400">
                Mã lượt nhận:{' '}
                <span className="font-mono text-slate-600">
                  {luotNhan?.id?.includes('LN-') ? luotNhan.id : 'LN-59/2026-GOVEX'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5 font-normal">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 font-bold border border-rose-200 text-[11px] font-mono">
                  Số đơn: {extractData.soDon || 'TC-08/2026-ĐTC'}
                </span>
                <span>•</span>
                <span>Ngày làm đơn: <strong className="text-slate-700 font-label-technical">{extractData.ngayLamDon || '12/09/2026'}</strong></span>
              </div>
              <span>•</span>
              <div>
                <span>Loại đơn:</span> <strong className="text-rose-700 font-semibold">{extractData.loaiNoiDung || 'Đơn tố cáo'}</strong>
              </div>
              <span>•</span>
              <div>
                <span>Người đứng đơn:</span> <strong className="text-slate-800 font-semibold">{extractData.nguoiGui || 'Vũ Thị Thanh'}</strong>
                {extractData.dongNguoiGui && extractData.dongNguoiGui !== 'Không có' && (
                  <span className="text-slate-500 ml-1">(&amp; {extractData.dongNguoiGui})</span>
                )}
              </div>
              <span>•</span>
              <div className="text-slate-400">
                Mã hồ sơ: <span className="font-mono text-slate-600">{currentDonCode}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Top-Right */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentLuotNhanStatus === 'da_xep_luu' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-slate-700">inventory_2</span>
                <span>Đã xếp lưu / Kết thúc lượt nhận (Không có yếu tố là đơn)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowXepLuuModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs cursor-pointer"
              >
                <span>Xem phiếu xếp lưu</span>
              </button>
            </div>
          ) : currentLuotNhanStatus === 'da_chuyen' ? (
            <div className="flex items-center gap-2 flex-wrap">
              {/* NÚT VỀ MÀN HÌNH CHI TIẾT ĐƠN */}
              {/* <button
                type="button"
                onClick={handleGoToChiTietDon}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-300 shadow-2xs"
                title="Chuyển sang màn hình chi tiết đơn tiếp nhận"
              >
                <span className="material-symbols-outlined text-[17px] text-[#004ac6]">description</span>
                <span>Màn chi tiết đơn</span>
              </button> */}

              {/* NÚT CHÍNH: BƯỚC TIẾP THEO THEO QUY TRÌNH: XÁC MINH THÔNG TIN & ĐỀ XUẤT HƯỚNG XỬ LÝ */}
              {/* <button
                type="button"
                onClick={handleGoToChiTietDon}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da6] active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all cursor-pointer"
                title="Chuyển đến màn chi tiết đơn để xác minh thông tin & đề xuất hướng xử lý"
              >
                <span className="material-symbols-outlined text-[18px]">fact_check</span>
                <span>Xác minh thông tin &amp; Đề xuất hướng xử lý ➔</span>
              </button> */}
            </div>
          ) : currentLuotNhanStatus === 'da_thu_ly' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                <span>
                  Đã lập Tờ trình {activeSigningDoc?.soKyHieu ? `(${activeSigningDoc.soKyHieu})` : ''} •{' '}
                  {activeSigningDoc?.status === 'da_ky' ? 'Đã ký duyệt' : 'Đang trình ký'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowThuLyModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold shadow-2xs cursor-pointer transition-all"
                title="Xem lại bản in A4 Mẫu 01"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Bản in A4 Mẫu 01</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!activeSigningDoc && linkedSigningDoc) {
                    setActiveSigningDoc(linkedSigningDoc);
                  }
                  setShowSigningDocModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#004ac6] hover:bg-[#003da6] text-white text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                title="Xem văn bản Tờ trình & Luồng trình ký gắn với đơn này"
              >
                <span className="material-symbols-outlined text-[16px]">draw</span>
                <span>Văn bản trình ký của đơn ➔</span>
              </button>
            </div>
          ) : currentLuotNhanStatus === 'da_ban_giao' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-amber-600">swap_horiz</span>
                <span>Đã bàn giao</span>
              </span>
              <button
                type="button"
                onClick={() => setShowBanGiaoModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 text-xs font-bold shadow-2xs cursor-pointer"
              >
                <span>Xem biên bản bàn giao</span>
              </button>
            </div>
          ) : currentLuotNhanStatus === 'da_ghep' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-300 text-xs font-bold shadow-2xs">
              <span className="material-symbols-outlined text-[16px] text-indigo-600">merge_type</span>
              <span>Đã ghép vào {selectedGhepDonCode}</span>
            </span>
          ) : currentLuotNhanStatus === 'da_tra_lai' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-rose-600">assignment_return</span>
                <span>Đã trả lại</span>
              </span>
              <button
                type="button"
                onClick={() => setShowTraLaiModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-800 text-xs font-bold shadow-2xs cursor-pointer"
              >
                <span>Xem văn bản trả lại</span>
              </button>
            </div>
          ) : null}

          {/* <button
            type="button"
            onClick={() => showToast('Đang tải xuống tài liệu đơn...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span>Tải xuống</span>
          </button> */}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE: BỐ CỤC 2 CỘT CHÍNH (TÀI LIỆU & AI PHÂN TÍCH)            */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* BÊN TRÁI: TÀI LIỆU / NỘI DUNG ĐƠN (46% Width)                           */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="w-[46%] flex flex-col h-full bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Header Khu vực Tài liệu được tải lên */}
          <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-[#004ac6]">description</span>
              <h2 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                Tài liệu được tải lên ({currentFiles.length} tệp)
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11.5px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[220px]" title={activeFile?.name}>
                #{selectedFileIndex + 1}: {activeFile?.name}
              </span>
              {aiState === 'reading' && (
                <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 animate-pulse">
                  <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                  Đang quét OCR...
                </span>
              )}
            </div>
          </div>

          {/* Thanh chọn nhanh các tệp tài liệu trong lượt nhận */}
          <div className="px-3 py-1.5 bg-slate-100/80 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
            {currentFiles.map((file, idx) => (
              <button
                key={file.name}
                type="button"
                onClick={() => setSelectedFileIndex(idx)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
                  selectedFileIndex === idx
                    ? isNoPetitionElement
                      ? 'bg-amber-600 text-white font-bold shadow-2xs'
                      : 'bg-[#004ac6] text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {file.name.toLowerCase().endsWith('.pdf') ? 'picture_as_pdf' : 'folder_zip'}
                </span>
                <span className="truncate max-w-[165px]">
                  #{idx + 1}. {file.name}
                </span>
                <span
                  className={`text-[9.5px] px-1 py-0.2 rounded ${
                    selectedFileIndex === idx
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {file.category === 'main' ? 'Tài liệu chính' : 'Đính kèm'}
                </span>
              </button>
            ))}
          </div>

          {/* PDF Viewer Dark Toolbar */}
          <div className="px-3 py-1.5 bg-[#2d3748] text-white flex items-center justify-between text-xs shrink-0 select-none">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Mục lục"
              >
                <span className="material-symbols-outlined text-[16px]">menu</span>
              </button>
              <div className="flex items-center gap-1 text-[11px] font-label-technical">
                <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 font-bold">
                  {currentPage}
                </span>
                <span className="text-slate-400">/ 3</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Thu nhỏ"
              >
                <span className="material-symbols-outlined text-[16px]">zoom_out</span>
              </button>
              <span className="font-label-technical text-[11px] min-w-[34px] text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Phóng to"
              >
                <span className="material-symbols-outlined text-[16px]">zoom_in</span>
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Vừa trang"
              >
                <span className="material-symbols-outlined text-[16px]">aspect_ratio</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Xoay"
              >
                <span className="material-symbols-outlined text-[16px]">rotate_right</span>
              </button>
              <button
                type="button"
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Tải về"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
              </button>
              <button
                type="button"
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="In"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
              </button>
            </div>
          </div>

          {/* PDF Canvas View with Scanner effect */}
          <div className="flex-1 overflow-auto p-4 flex justify-center items-start bg-slate-200/80 relative">
            {/* LASER SCANNER ANIMATION KHI AI ĐANG ĐỌC */}
            {aiState === 'reading' && (
              <div className="laser-scanner" />
            )}

            {/* Banner nổi báo hiệu đang bóc tách */}
            {aiState === 'reading' && (
              <div className="absolute top-2 left-4 right-4 z-30 flex items-center justify-between px-3 py-1.5 bg-blue-600/95 backdrop-blur-xs text-white rounded-xl shadow-lg text-[11px] font-medium border border-blue-400 animate-fade-in">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] animate-spin">sync</span>
                  <span>Tia quét AI đang đọc văn bản &amp; đối soát thực thể...</span>
                </div>
                <span className="font-label-technical font-bold">{readingProgress}%</span>
              </div>
            )}
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
              className="bg-white shadow-xl rounded-sm border border-slate-300 p-8 min-h-[580px] w-[95%] transition-transform text-slate-800 text-[11.5px] leading-relaxed space-y-3.5 relative"
            >
              {isNoPetitionElement ? (
                activeDocScenario === 'van_ban' ? (
                  /* TC01: VĂN BẢN THÔNG BÁO CỦA CƠ QUAN KHÁC (SỞ XÂY DỰNG) */
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-start justify-between gap-2 text-[11px] text-blue-950">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-[#004ac6] mt-0.5 shrink-0">
                          article
                        </span>
                        <div>
                          <p className="font-bold text-blue-950">
                            AI Nhận diện Tài liệu: Văn bản hành chính thông báo phối hợp công tác (TC01)
                          </p>
                          <p className="text-[10.5px] text-blue-800 mt-0.5">
                            Văn bản của cơ quan nhà nước gửi phối hợp nghiệp vụ định kỳ; không chứa nội dung khiếu nại, tố cáo, kiến nghị, phản ánh của công dân.
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-200/80 text-blue-950 font-bold text-[10px] shrink-0">
                        Văn bản đến
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center pb-2 border-b border-slate-200 text-[10.5px]">
                      <div>
                        <p className="uppercase text-slate-700 font-medium">ỦY BAN NHÂN DÂN TP. HÀ NỘI</p>
                        <p className="font-bold uppercase text-slate-900 underline">SỞ XÂY DỰNG</p>
                        <p className="font-mono font-semibold text-slate-800 pt-1">Số: 412/TB-SXD</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                        <p className="underline font-medium text-slate-800">Độc lập - Tự do - Hạnh phúc</p>
                        <p className="italic text-slate-600 pt-1">Hà Nội, ngày 10 tháng 09 năm 2026</p>
                      </div>
                    </div>

                    <div className="text-center py-1">
                      <h3 className="text-[14px] font-bold uppercase text-slate-950">THÔNG BÁO</h3>
                      <p className="text-[11px] font-semibold text-slate-800">
                        V/v phối hợp cung cấp số liệu và kiểm tra định kỳ công tác quản lý trật tự xây dựng Quý III/2026 trên địa bàn quận Hà Đông
                      </p>
                    </div>

                    <div className="space-y-2 text-[11px] text-justify leading-relaxed">
                      <p>
                        <strong>Kính gửi:</strong> Ủy ban nhân dân quận Hà Đông; Đội Quản lý trật tự xây dựng đô thị quận Hà Đông.
                      </p>
                      <p>
                        Thực hiện Kế hoạch số 198/KH-UBND ngày 15/01/2026 của UBND Thành phố về công tác kiểm tra định kỳ hoạt động xây dựng năm 2026, Sở Xây dựng thông báo lịch làm việc và đề nghị Quý đơn vị phối hợp thực hiện các nội dung sau:
                      </p>
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                        <p>
                          <strong>1. Nội dung phối hợp:</strong> Rà soát, tổng hợp danh mục các dự án khu đô thị mới đang thi công hạ tầng kỹ thuật trên địa bàn phường Mộ Lao và phường Yên Nghĩa (bao gồm Dự án Khu đô thị mới Y).
                        </p>
                        <p>
                          <strong>2. Đơn vị chịu trách nhiệm:</strong> Phòng Quản lý đô thị quận Hà Đông chủ trì, phối hợp Đội Quản lý TTXD đô thị lập báo cáo theo Đề cương tại Phụ lục 01 đính kèm.
                        </p>
                        <p>
                          <strong>3. Thời hạn thực hiện:</strong> Văn bản báo cáo và biểu mẫu tổng hợp gửi về Sở Xây dựng (qua Thanh tra Sở){' '}
                          <span className="font-bold text-rose-700 underline">trước ngày 25/09/2026</span> để tổng hợp báo cáo UBND Thành phố.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 grid grid-cols-2 gap-4 text-[10.5px] border-t border-slate-200">
                      <div className="text-slate-600">
                        <p className="font-bold italic text-slate-800">Nơi nhận:</p>
                        <p>- Như trên;</p>
                        <p>- Giám đốc Sở (để b/c);</p>
                        <p>- Lưu: VT, TTr.</p>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="font-bold uppercase text-slate-900">KT. GIÁM ĐỐC • PHÓ GIÁM ĐỐC</p>
                        <div className="h-8 flex items-center justify-center">
                          <span className="px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-[9.5px]">
                            Đã ký số hợp lệ — Sở Xây dựng TP. Hà Nội
                          </span>
                        </div>
                        <p className="font-bold text-slate-900">Nguyễn Hoàng Sơn</p>
                      </div>
                    </div>
                  </div>
                ) : activeDocScenario === 'bieu_mau' ? (
                  /* TC02: BIỂU MẪU CHƯA ĐIỀN ĐẦY ĐỦ */
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 flex items-start justify-between gap-2 text-[11px] text-purple-950">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-purple-700 mt-0.5 shrink-0">
                          assignment
                        </span>
                        <div>
                          <p className="font-bold text-purple-950">
                            AI Nhận diện Tài liệu: Biểu mẫu kê khai hành chính chưa hoàn thiện (TC02)
                          </p>
                          <p className="text-[10.5px] text-purple-800 mt-0.5">
                            Mới điền 05/11 trường thông tin; bỏ trống 06 trường bắt buộc và chưa có chữ ký xác nhận. Tuyệt đối không tự sinh đơn.
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-200/80 text-purple-950 font-bold text-[10px] shrink-0">
                        Mẫu 02/ĐK-HT
                      </span>
                    </div>

                    <div className="text-center pb-2 border-b border-slate-200">
                      <p className="text-[10px] font-mono font-bold text-slate-600">Mẫu số: 02/ĐK-HT (Ban hành kèm theo Quy chế phối hợp)</p>
                      <h3 className="text-[13.5px] font-bold uppercase text-slate-950 pt-1">
                        TỜ KHAI ĐĂNG KÝ CUNG CẤP THÔNG TIN HỒ SƠ ĐỊA CHÍNH &amp; QUY HOẠCH
                      </h3>
                    </div>

                    <div className="space-y-2 text-[11px] bg-slate-50 p-3 rounded border border-slate-200">
                      <p className="font-bold text-slate-900 uppercase text-[10.5px]">I. Phần thông tin đã kê khai (05/11 trường):</p>
                      <div className="grid grid-cols-2 gap-2">
                        <p>• [01] Họ và tên người yêu cầu: <strong>Nguyễn Văn Hòa</strong></p>
                        <p>• [02] Năm sinh: <strong>1985</strong></p>
                        <p className="col-span-2">
                          • [03] Số CCCD/CMND: <strong className="font-mono text-rose-700 bg-rose-50 px-1 rounded border border-rose-200">00109201842</strong>{' '}
                          <span className="text-[10px] text-rose-600 font-semibold">(⚠ Dài 11 số &amp; mã năm sinh 92 mâu thuẫn với 1985)</span>
                        </p>
                        <p>• [04] Số điện thoại: <strong>0912 345 678</strong></p>
                        <p>• [05] Địa chỉ liên hệ: <strong>Phường Mộ Lao, quận Hà Đông, TP. Hà Nội</strong></p>
                      </div>

                      <p className="font-bold text-rose-800 uppercase text-[10.5px] pt-2 border-t border-slate-200">
                        II. Phần thông tin bỏ trống trên biểu mẫu (06/11 trường chưa điền):
                      </p>
                      <div className="space-y-1 text-slate-500 font-mono text-[10.5px]">
                        <p>• [06] Số hiệu tờ bản đồ / Số thửa đất: ....................................................................</p>
                        <p>• [07] Địa chỉ thửa đất cần trích lục: ........................................................................</p>
                        <p>• [08] Danh mục tài liệu đề nghị cung cấp: ...............................................................</p>
                        <p>• [09] Mục đích sử dụng thông tin: .............................................................................</p>
                        <p>• [10] Hình thức nhận kết quả: [ ] Trực tiếp   [ ] Qua bưu chính   [ ] Trực tuyến</p>
                        <p>• [11] Cam đoan và Chữ ký của người kê khai: <em>(Đang để trống hoàn toàn)</em></p>
                      </div>
                    </div>
                  </div>
                ) : activeDocScenario === 'tai_lieu_khac' ? (
                  /* TC04 & TC07: BÁO CÁO NGHIỆP VỤ BỊ THIẾU TRANG 3/4 VÀ MỜ PHỤ LỤC */
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 flex items-start justify-between gap-2 text-[11px] text-rose-950">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-rose-600 mt-0.5 shrink-0">
                          broken_image
                        </span>
                        <div>
                          <p className="font-bold text-rose-900">
                            Cảnh báo Chất lượng Tài liệu: Thiếu Trang 3/4 &amp; Phụ lục 02 bị mờ nhòe (TC04, TC07)
                          </p>
                          <p className="text-[10.5px] text-rose-800 mt-0.5">
                            Tệp scan nhảy từ Trang 2/4 sang Trang 4/4. Bảng thông số Phụ lục 02 độ phân giải thấp (OCR &lt; 32%) — AI giữ nguyên &ldquo;Chưa xác định&rdquo;, không tự suy diễn.
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-950 font-bold text-[10px] shrink-0">
                        Thiếu trang 3/4
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] border-b border-slate-200 pb-2">
                      <div>
                        <p className="font-bold uppercase text-slate-800">TRUNG TÂM QUAN TRẮC TÀI NGUYÊN &amp; MÔI TRƯỜNG</p>
                        <p className="font-mono font-semibold text-slate-700">Số: 88/BC-TTQTMT</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-bold">
                          Trang 1–2/4 &amp; Trang 4/4 (Khuyết Trang 3)
                        </span>
                        <p className="italic text-slate-500 mt-0.5">Hà Nội, ngày 04/09/2026</p>
                      </div>
                    </div>

                    <div className="text-center py-1">
                      <h3 className="text-[13.5px] font-bold uppercase text-slate-950">
                        BÁO CÁO KẾT QUẢ QUAN TRẮC ĐỊNH KỲ MÔI TRƯỜNG KHÔNG KHÍ &amp; TIẾNG ỒN
                      </h3>
                      <p className="text-[10.5px] text-slate-600 italic">
                        (Khu vực tuyến đường vận chuyển vật liệu thuộc Dự án Khu đô thị mới Y — Đợt tháng 08/2026)
                      </p>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <p>
                        <strong>1. Kết quả đo đạc tại Trạm QT-01 &amp; QT-02 (Trang 1–2/4):</strong> Nồng độ bụi tổng TSP trung bình 24h tại cổng công trường Lô TT-02 đạt <strong className="text-rose-700">342 µg/m³</strong> (vượt 1,14 lần QCVN 05:2023/BTNMT); mức ồn cực đại đạt <strong className="text-rose-700">74,5 dBA</strong>.
                      </p>
                      <div className="p-2 rounded bg-amber-50 border border-dashed border-amber-400 text-amber-900 text-[10.5px] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-amber-700">warning</span>
                        <span>
                          <strong>[KHUYẾT TRANG 3/4 TRONG TỆP SCAN]:</strong> Mục 2.2 (Kết quả phân tích mẫu tại điểm QT-03 và Nhận xét nguyên nhân) bị đứt đoạn.
                        </span>
                      </div>
                      <div className="p-2.5 rounded border border-slate-300 bg-slate-100/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-[10.5px]">
                            Phụ lục 02 (Trang 4/4): Bảng thông số vi khí hậu &amp; SO₂, NO₂, CO
                          </span>
                          <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300">
                            Ảnh mờ nhoè • OCR 31.5% (Chưa xác định)
                          </span>
                        </div>
                        <div className="blur-[1.5px] select-none text-[10px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200">
                          QT-01 | SO2: [Mờ không đọc được] | NO2: [Mờ không đọc được] | CO: [Mờ không đọc được] — Yêu cầu cung cấp lại bản gốc
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedFileIndex === 0 ? (
                  /* TRƯỜNG HỢP TÀI LIỆU KHÔNG CÓ YẾU TỐ LÀ ĐƠN — FILE 1: HỢP ĐỒNG KINH TẾ CUNG ỨNG VẬT TƯ */
                  <div className="space-y-3">
                    {/* Nhãn nhận diện bố cục AI trên đầu tài liệu */}
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 flex items-start justify-between gap-2 text-[11px] text-amber-950">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-amber-600 mt-0.5 shrink-0">
                          plagiarism
                        </span>
                        <div>
                          <p className="font-bold text-amber-900">
                            AI Nhận diện Bố cục: Hợp đồng thương mại song phương (Không có cấu trúc Đơn thư)
                          </p>
                          <p className="text-[10.5px] text-amber-800 mt-0.5">
                            Không tìm thấy mục &ldquo;Kính gửi cơ quan nhà nước&rdquo;, không có nội dung khiếu nại/tố cáo/kiến nghị/phản ánh và không có chữ ký công dân đứng đơn.
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 font-bold text-[10px] shrink-0">
                        Chứng từ rời
                      </span>
                    </div>

                    {/* Quốc hiệu & Số hợp đồng */}
                    <div className="text-center space-y-0.5 pb-2 border-b border-slate-200">
                      <p className="font-bold uppercase text-[10.5px] tracking-wide text-slate-900">
                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                      </p>
                      <p className="text-[10px] underline font-medium text-slate-800">
                        Độc lập - Tự do - Hạnh phúc
                      </p>
                      <div className="flex items-center justify-between text-[10.5px] text-slate-600 pt-2">
                        <span className="font-mono font-semibold text-slate-800">
                          Số: 18/2026/HĐKT-MK
                        </span>
                        <span className="italic">Hà Nội, ngày 02 tháng 08 năm 2026</span>
                      </div>
                    </div>

                    {/* Tiêu đề Hợp đồng */}
                    <div className="text-center py-1">
                      <h3 className="text-[14.5px] font-bold uppercase text-slate-950 tracking-wide">
                        HỢP ĐỒNG KINH TẾ CUNG ỨNG VẬT TƯ XÂY DỰNG
                      </h3>
                      <p className="text-[10.5px] italic text-slate-600">
                        (V/v: Cung cấp xi măng, thép xây dựng và cát san lấp phục vụ thi công hạ tầng Giai đoạn 2 - KĐT mới Y)
                      </p>
                    </div>

                    {/* Các bên tham gia hợp đồng */}
                    <div className="space-y-2 text-[11px] bg-slate-50/70 p-3 rounded border border-slate-200">
                      <div
                        className={`space-y-0.5 p-1 rounded transition-colors ${
                          activeHighlightKey === 'nguoiGui' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                        }`}
                      >
                        <p className="font-bold text-slate-900">
                          BÊN BÁN (BÊN A): CÔNG TY TNHH VẬT LIỆU XÂY DỰNG MINH KHÔI
                        </p>
                        <p>
                          • Mã số doanh nghiệp: <span className="font-mono font-semibold">0108923471</span> — Đại diện: Ông <strong>Lê Quốc Khánh</strong> (Chức vụ: Giám đốc)
                        </p>
                        <p>
                          • Địa chỉ trụ sở:{' '}
                          <span
                            className={`px-1 rounded ${
                              activeHighlightKey === 'diaChi' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                            }`}
                          >
                            Lô B4, Cụm công nghiệp Yên Nghĩa, quận Hà Đông, TP. Hà Nội
                          </span>
                        </p>
                        <p>• Điện thoại: 0243 998 1122 | Tài khoản: 19034829102018 tại Techcombank CN Hà Đông</p>
                      </div>

                      <div
                        className={`space-y-0.5 pt-1.5 border-t border-slate-200 p-1 rounded transition-colors ${
                          activeHighlightKey === 'doiTuong' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                        }`}
                      >
                        <p className="font-bold text-slate-900">
                          BÊN MUA (BÊN B): BAN ĐIỀU HÀNH GÓI THẦU HẠ TẦNG SỐ 04 - CÔNG TY CP ĐẦU TƯ PHÁT TRIỂN ĐÔ THỊ X
                        </p>
                        <p>• Mã số doanh nghiệp: <span className="font-mono font-semibold">0105519820</span> — Đại diện theo ủy quyền: Ông <strong>Phạm Đức Tùng</strong> (Chỉ huy trưởng)</p>
                        <p>
                          • Địa điểm giao nhận vật tư:{' '}
                          <span
                            className={`px-1 rounded ${
                              activeHighlightKey === 'diaDiem' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                            }`}
                          >
                            Kho bãi công trường Lô TT-02, Dự án Khu đô thị mới Y, phường Mộ Lao, quận Hà Đông
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Điều khoản chính */}
                    <div
                      className={`space-y-1.5 text-justify text-[11px] p-1 rounded transition-colors ${
                        activeHighlightKey === 'noiDung' ? 'bg-amber-100 ring-2 ring-amber-300' : ''
                      }`}
                    >
                      <p className="font-bold text-slate-900">ĐIỀU 1. KHỐI LƯỢNG VÀ GIÁ TRỊ HỢP ĐỒNG:</p>
                      <p>
                        Bên A đồng ý cung cấp cho Bên B các chủng loại vật tư xây dựng đạt tiêu chuẩn TCVN theo phụ lục đính kèm. Tổng giá trị hợp đồng tạm tính (đã bao gồm thuế GTGT 10% và chi phí vận chuyển đến chân công trình):{' '}
                        <strong className="text-slate-950 font-mono">1.485.000.000 VNĐ</strong> <em>(Bằng chữ: Một tỷ bốn trăm tám mươi lăm triệu đồng chẵn)</em>.
                      </p>
                      <p className="font-bold text-slate-900 pt-1">ĐIỀU 2. THỜI HẠN GIAO HÀNG &amp; PHƯƠNG THỨC THANH TOÁN:</p>
                      <p>
                        2.1. Tiến độ giao hàng: Chia làm 03 đợt từ ngày{' '}
                        <span
                          className={`font-semibold px-1 rounded ${
                            activeHighlightKey === 'thoiGian' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                          }`}
                        >
                          05/08/2026 đến ngày 10/09/2026
                        </span>{' '}
                        theo phiếu yêu cầu cấp vật tư của Ban chỉ huy công trường.
                      </p>
                      <p>
                        2.2. Thanh toán: Bên B tạm ứng 30% giá trị hợp đồng trong vòng 05 ngày làm việc sau khi ký kết; thanh toán 70% còn lại trong vòng 15 ngày kể từ khi hai bên ký Biên bản nghiệm thu khối lượng giao nhận từng đợt.
                      </p>
                      <p className="font-bold text-slate-900 pt-1">ĐIỀU 3. ĐIỀU KHOẢN CHUNG:</p>
                      <p>
                        Hợp đồng này được lập thành 04 bản có giá trị pháp lý như nhau, mỗi bên giữ 02 bản để thực hiện. Mọi tranh chấp phát sinh (nếu có) ưu tiên giải quyết bằng thương lượng giữa hai doanh nghiệp.
                      </p>
                    </div>

                    {/* Chữ ký hai doanh nghiệp */}
                    <div className="pt-3 grid grid-cols-2 gap-4 text-center text-[11px] border-t border-slate-200">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 uppercase">ĐẠI DIỆN BÊN A (BÊN BÁN)</p>
                        <p className="text-[10px] text-slate-500 italic">(Ký, ghi rõ họ tên và đóng dấu pháp nhân)</p>
                        <div className="h-9 flex items-center justify-center gap-2 text-rose-700 font-semibold text-xs">
                          <span className="px-2 py-0.5 rounded border border-rose-300 bg-rose-50 text-[9.5px] uppercase">
                            Đã đóng dấu Công ty TNHH Minh Khôi
                          </span>
                        </div>
                        <p className="font-bold text-slate-900">Giám đốc: Lê Quốc Khánh</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 uppercase">ĐẠI DIỆN BÊN B (BÊN MUA)</p>
                        <p className="text-[10px] text-slate-500 italic">(Ký, ghi rõ họ tên và đóng dấu Ban ĐH)</p>
                        <div className="h-9 flex items-center justify-center gap-2 text-blue-800 font-semibold text-xs">
                          <span className="px-2 py-0.5 rounded border border-blue-300 bg-blue-50 text-[9.5px] uppercase">
                            Đã ký nhận — Ban ĐH Gói thầu 04
                          </span>
                        </div>
                        <p className="font-bold text-slate-900">Chỉ huy trưởng: Phạm Đức Tùng</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* TRƯỜNG HỢP TÀI LIỆU KHÔNG CÓ YẾU TỐ LÀ ĐƠN — FILE 2: BẢNG THÔNG BÁO ĐIỀU CHỈNH BÁO GIÁ VLXD */
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 flex items-center justify-between gap-2 text-[11px] text-amber-950">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-amber-600">
                          request_quote
                        </span>
                        <span className="font-bold">
                          AI Nhận diện: Bảng thông báo điều chỉnh đơn giá thương mại (Không có nội dung khiếu nại/tố cáo)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 font-bold text-[10px]">
                        Phụ lục báo giá
                      </span>
                    </div>

                    <div className="text-center border-b border-slate-200 pb-2">
                      <p className="text-[10.5px] font-bold text-slate-700 uppercase">
                        CÔNG TY TNHH VẬT LIỆU XÂY DỰNG MINH KHÔI
                      </p>
                      <h3 className="text-[13.5px] font-bold text-slate-900 uppercase pt-1">
                        THÔNG BÁO ĐIỀU CHỈNH BẢNG BÁO GIÁ VẬT LIỆU XÂY DỰNG QUÝ III/2026
                      </h3>
                      <p className="text-[10.5px] text-slate-600 italic">
                        (Kèm theo Hợp đồng kinh tế số 18/2026/HĐKT-MK ngày 02/08/2026 — Áp dụng từ ngày 05/09/2026)
                      </p>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <p>
                        <strong>Kính gửi: </strong>Quý Khách hàng / Các Ban điều hành dự án đối tác của Công ty TNHH VLXD Minh Khôi.
                      </p>
                      <table className="w-full border-collapse border border-slate-300 text-[11px] text-left">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 p-1.5">STT</th>
                            <th className="border border-slate-300 p-1.5">Chủng loại vật tư</th>
                            <th className="border border-slate-300 p-1.5">ĐVT</th>
                            <th className="border border-slate-300 p-1.5">Đơn giá cũ (VNĐ)</th>
                            <th className="border border-slate-300 p-1.5">Đơn giá điều chỉnh</th>
                            <th className="border border-slate-300 p-1.5">Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-300 p-1.5 text-center">1</td>
                            <td className="border border-slate-300 p-1.5 font-medium">Thép cuộn CB240-T Hòa Phát Ф6-Ф8</td>
                            <td className="border border-slate-300 p-1.5 text-center">Kg</td>
                            <td className="border border-slate-300 p-1.5 font-mono">14.650</td>
                            <td className="border border-slate-300 p-1.5 font-mono font-bold text-slate-900">14.900</td>
                            <td className="border border-slate-300 p-1.5 text-slate-600">Theo giá nhà máy 01/09</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-1.5 text-center">2</td>
                            <td className="border border-slate-300 p-1.5 font-medium">Xi măng PCB40 Bút Sơn (Bao 50kg)</td>
                            <td className="border border-slate-300 p-1.5 text-center">Tấn</td>
                            <td className="border border-slate-300 p-1.5 font-mono">1.420.000</td>
                            <td className="border border-slate-300 p-1.5 font-mono font-bold text-slate-900">1.450.000</td>
                            <td className="border border-slate-300 p-1.5 text-slate-600">Đã gồm vận chuyển</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-1.5 text-center">3</td>
                            <td className="border border-slate-300 p-1.5 font-medium">Cát vàng đổ bê tông hạt trung (Loại 1)</td>
                            <td className="border border-slate-300 p-1.5 text-center">m³</td>
                            <td className="border border-slate-300 p-1.5 font-mono">410.000</td>
                            <td className="border border-slate-300 p-1.5 font-mono font-bold text-slate-900">425.000</td>
                            <td className="border border-slate-300 p-1.5 text-slate-600">Giao tại bãi tập kết</td>
                          </tr>
                        </tbody>
                      </table>
                      <p className="text-[10.5px] text-slate-500 italic pt-1">
                        Ghi chú: Văn bản này chỉ mang tính chất thông báo điều chỉnh giá vật tư thương mại giữa doanh nghiệp cung ứng và nhà thầu, không phải văn bản hành chính hay đơn thư khiếu nại, tố cáo.
                      </p>
                    </div>
                  </div>
                )
              ) : selectedFileIndex === 0 ? (
                <>
                  {/* Header Quốc hiệu */}
                  <div className="text-center space-y-1 pb-1">
                    <p className="font-bold uppercase text-[10.5px] tracking-wide text-slate-900">
                      CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </p>
                    <p className="text-[10px] underline font-medium text-slate-800">
                      Độc lập - Tự do - Hạnh phúc
                    </p>
                    <p className="text-right text-[10.5px] italic text-slate-600 pt-1">
                      Hà Nội, ngày 12 tháng 09 năm 2026
                    </p>
                  </div>

                  {/* Tiêu đề Đơn */}
                  <div className="text-center py-1">
                    <h3 className="text-[15px] font-bold uppercase text-slate-950 tracking-wide">
                      ĐƠN TỐ CÁO
                    </h3>
                    <p className="text-[10.5px] italic text-slate-600">
                      (V/v: Hành vi cố ý làm trái trong bồi thường GPMB và dấu hiệu tiêu cực tại Dự án KĐT mới Y)
                    </p>
                  </div>

                  {/* Kính gửi */}
                  <div className="space-y-0.5 text-slate-900 text-[11px]">
                    <p className="font-semibold">Kính gửi:</p>
                    <p className="pl-4">- Ủy ban nhân dân thành phố Hà Nội;</p>
                    <p className="pl-4">- Thanh tra thành phố Hà Nội;</p>
                    <p className="pl-4">- Cơ quan Cảnh sát điều tra Công an thành phố Hà Nội.</p>
                  </div>

                  {/* 1. Người tố cáo */}
                  <div className="space-y-1 pt-1 border-t border-slate-200/80">
                    <p className="font-bold text-slate-900">I. THÔNG TIN NGƯỜI TỐ CÁO:</p>
                    <div className="pl-2 space-y-0.5">
                      <p>
                        <strong>1. Họ và tên: </strong>
                        <span
                          className={`font-semibold text-slate-900 px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'nguoiGui' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                            }`}
                        >
                          {extractData.nguoiGui}
                        </span>{' '}
                        (Sinh ngày: {extractData.namSinh} | CCCD:{' '}
                        <span
                          className={`font-label-technical px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'cccd' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                            }`}
                        >
                          {extractData.cccd}
                        </span>
                        , cấp ngày {extractData.ngayCapCCCD || '10/05/2021'} tại {extractData.noiCapCCCD || 'Cục Cảnh sát QLHC về TTXH'})
                      </p>
                      <p>
                        Địa chỉ thường trú &amp; liên hệ:{' '}
                        <span
                          className={`px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'diaChi' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                            }`}
                        >
                          {extractData.diaChi}
                        </span>
                      </p>
                      <p>
                        Số điện thoại: <span className="font-label-technical">{extractData.sdt}</span> | Email: {extractData.email || 'vuthithanh.hd@gmail.com'}
                      </p>
                      <p>
                        Tư cách tham gia: <span className="font-semibold text-blue-900">{extractData.tuCachThamGia || 'Người tố cáo'}</span>
                      </p>
                      {extractData.dongNguoiGui && extractData.dongNguoiGui !== 'Không có' && (
                        <p>
                          <strong>2. Người cùng đứng đơn: </strong>
                          <span
                            className={`font-semibold text-slate-900 px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'dongNguoiGui' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                              }`}
                          >
                            {extractData.dongNguoiGui}
                          </span>{' '}
                          (CCCD: <span className="font-label-technical">{extractData.cccdDongNguoiGui}</span>, trú tại: {extractData.diaChiDongNguoiGui || 'Số 47 ngách 12 ngõ 84 Quang Trung, Hà Đông'})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2. Đối tượng bị tố cáo */}
                  <div className="space-y-1 pt-1 border-t border-slate-200/80">
                    <p className="font-bold text-slate-900">II. THÔNG TIN ĐỐI TƯỢNG BỊ TỐ CÁO:</p>
                    <div className="pl-2 space-y-0.5">
                      <p>
                        • <strong>Cá nhân bị tố cáo: </strong>
                        <span
                          className={`font-semibold text-slate-900 px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'doiTuong' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                            }`}
                        >
                          {extractData.doiTuong}
                        </span>
                      </p>
                      <p>
                        • Chức vụ &amp; Đơn vị công tác: {extractData.chucVu} - {extractData.donVi}
                      </p>
                      <p>
                        • Tổ chức liên đới: {extractData.congTyBiToGiac || 'Công ty Cổ phần Đầu tư Phát triển Đô thị X'}
                      </p>
                      <p>
                        • Địa chỉ nhận diện: {extractData.diaChiDoiTuong || 'Trụ sở UBND quận Hà Đông & Trụ sở Công ty CP X tại Tòa nhà Stellar, Cầu Giấy, Hà Nội'}
                      </p>
                    </div>
                  </div>

                  {/* 3. Nội dung tố cáo */}
                  <div className="space-y-1 pt-1 border-t border-slate-200/80 text-justify">
                    <p className="font-bold text-slate-900">III. NỘI DUNG, HÀNH VI BỊ TỐ CÁO:</p>
                    <div className="pl-2 space-y-1">
                      <p>
                        - <strong>Thời gian xảy ra sự việc: </strong>
                        <span
                          className={`font-semibold px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'thoiGian' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                            }`}
                        >
                          {extractData.thoiGian || '15/04/2025 – 20/06/2026'}
                        </span>
                      </p>
                      <p>
                        - <strong>Địa điểm xảy ra sự việc: </strong>
                        <span
                          className={`font-semibold px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'diaDiem' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                            }`}
                        >
                          {extractData.diaDiem}
                        </span>
                      </p>
                      <p
                        className={`leading-relaxed px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'noiDung' ? 'bg-amber-100 ring-2 ring-amber-300' : ''
                          }`}
                      >
                        {extractData.noiDungTomTat}
                      </p>
                    </div>
                  </div>

                  {/* 4. Yêu cầu của người tố cáo */}
                  <div className="space-y-1 pt-1 border-t border-slate-200/80">
                    <p className="font-bold text-slate-900">IV. YÊU CẦU CỦA NGƯỜI TỐ CÁO:</p>
                    <ol
                      className={`list-decimal list-inside space-y-0.5 pl-2 text-slate-800 rounded transition-colors ${activeHighlightKey === 'yeuCau' ? 'bg-amber-100 ring-2 ring-amber-300 p-1' : ''
                        }`}
                    >
                      <li>{extractData.yeuCau1}</li>
                      <li>{extractData.yeuCau2}</li>
                      <li>{extractData.yeuCau3}</li>
                      <li>{extractData.yeuCau4 || 'Thực hiện việc bồi thường, bố trí tái định cư công khai, minh bạch đúng theo quy định pháp luật.'}</li>
                    </ol>
                  </div>

                  {/* 5. Tài liệu kèm theo */}
                  <div className="space-y-1 pt-1 border-t border-slate-200/80">
                    <p className="font-bold text-slate-900">V. DANH MỤC TÀI LIỆU, CHỨNG CỨ KÈM THEO:</p>
                    <ul
                      className={`list-disc list-inside space-y-0.5 pl-2 text-slate-700 rounded transition-colors ${activeHighlightKey === 'taiLieu' ? 'bg-amber-100 ring-2 ring-amber-300 p-1' : ''
                        }`}
                    >
                      <li>1. Đơn tố cáo scan bản gốc có chữ ký và điểm chỉ của người làm đơn.</li>
                      <li>2. Trích lục quy hoạch 1/500 và bản đồ địa chính thửa đất số 48 tờ bản đồ 03.</li>
                      <li>3. Bản sao Biên bản kiểm đếm áp giá bồi thường có dấu hiệu sai lệch số liệu.</li>
                      <li>4. Thiết bị lưu trữ USB chứa 02 đoạn ghi âm cuộc làm việc &amp; 12 file ảnh hiện trường.</li>
                    </ul>
                  </div>

                  <p className="italic text-slate-600 pt-1 text-[11px]">
                    Tôi/Chúng tôi xin cam đoan toàn bộ nội dung tố cáo trên là hoàn toàn đúng sự thật và chịu mọi trách nhiệm trước pháp luật nếu cố ý tố cáo sai sự thật.
                  </p>

                  {/* Chữ ký & Điểm chỉ */}
                  <div className="pt-3 grid grid-cols-2 gap-4 text-center text-[11px]">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800">
                        {cheDoNguoiDungDon === 'tap_the'
                          ? 'Đại diện các hộ đồng đứng đơn'
                          : cheDoNguoiDungDon === '2_nguoi'
                            ? 'Người cùng đứng đơn'
                            : 'Người xác nhận'}
                      </p>
                      <p className="text-[10px] text-slate-500 italic">(Ký và ghi rõ họ tên)</p>
                      <div className="h-8 flex items-center justify-center italic text-blue-900 font-script text-base">
                        {cheDoNguoiDungDon === '1_nguoi' ? '—' : 'NguyenVanA'}
                      </div>
                      <p className="font-bold text-slate-900">
                        {cheDoNguoiDungDon === 'tap_the'
                          ? 'Nguyễn Văn A (+ 04 hộ dân TDP 4)'
                          : cheDoNguoiDungDon === '2_nguoi'
                            ? 'Nguyễn Văn A'
                            : '(Không có đồng đứng đơn)'}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800">
                        {cheDoNguoiDungDon === 'tap_the'
                          ? 'Người đại diện cử làm đơn tố cáo'
                          : 'Người làm đơn tố cáo'}
                      </p>
                      <p className="text-[10px] text-slate-500 italic">(Ký, ghi rõ họ tên &amp; điểm chỉ ngón trỏ)</p>
                      <div className="h-8 flex items-center justify-center gap-2 italic text-blue-900 font-script text-base">
                        <span>VuThiThanh</span>
                        <span className="w-5 h-6 rounded-full bg-rose-100 border border-rose-300 text-[8px] font-sans font-bold text-rose-700 flex items-center justify-center" title="Điểm chỉ vân tay">
                          Finger
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">Vũ Thị Thanh</p>
                    </div>
                  </div>
                </>
              ) : selectedFileIndex === 1 ? (
                /* File 2: Trích lục quy hoạch 1/500 */
                <div className="space-y-3">
                  <div className="text-center border-b border-slate-200 pb-2">
                    <p className="text-[10px] font-bold text-slate-600 uppercase">SỞ TÀI NGUYÊN VÀ MÔI TRƯỜNG TP. HÀ NỘI</p>
                    <h3 className="text-[13.5px] font-bold text-slate-900 uppercase pt-1">
                      TRÍCH LỤC BẢN ĐỒ QUY HOẠCH CHI TIẾT 1/500 &amp; BẢN ĐỒ ĐỊA CHÍNH
                    </h3>
                    <p className="text-[10.5px] text-slate-600 italic">Thửa đất số 48, tờ bản đồ số 03 – Dự án Khu đô thị mới Y, phường Mộ Lao, quận Hà Đông</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] p-2 bg-slate-50 rounded border border-slate-200">
                    <div>
                      <p><strong>Chủ sử dụng: </strong>Vũ Thị Thanh &amp; Nguyễn Văn A</p>
                      <p><strong>Diện tích thửa đất gốc: </strong><span className="font-bold text-emerald-800">360.0 m²</span></p>
                      <p><strong>Mục đích sử dụng: </strong>Đất nông nghiệp trồng cây lâu năm (CLN)</p>
                    </div>
                    <div>
                      <p><strong>Tọa độ ranh giới: </strong>Mốc 1 (X: 2319201, Y: 582910)</p>
                      <p><strong>Tình trạng quy hoạch: </strong>Nằm trong ranh thu hồi GPMB KĐT Y</p>
                      <p><strong>Cấp trích lục: </strong>Văn phòng Đăng ký Đất đai Hà Nội (Chi nhánh Hà Đông)</p>
                    </div>
                  </div>

                  {/* Sơ đồ mô phỏng thửa đất */}
                  <div className="border border-slate-300 rounded p-4 bg-slate-50/60 flex flex-col items-center justify-center space-y-2 min-h-[220px]">
                    <div className="w-56 h-36 border-2 border-dashed border-blue-600 bg-blue-50/60 rounded flex flex-col items-center justify-center text-blue-900 text-xs font-semibold relative">
                      <span>Thửa số 48 (Tờ BĐ 03)</span>
                      <span className="text-emerald-700 font-bold text-sm">360.0 m²</span>
                      <span className="text-[10px] text-rose-600 mt-1 font-normal border border-rose-300 bg-rose-50 px-1.5 rounded">
                        Phần kiểm đếm thiếu: 150.0 m²
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 italic text-center">
                      (Bản vẽ thể hiện toàn bộ diện tích 360m² thuộc quyền sử dụng hợp pháp của người tố cáo)
                    </p>
                  </div>
                </div>
              ) : selectedFileIndex === 2 ? (
                /* File 3: Biên bản kiểm đếm áp giá sai lệch */
                <div className="space-y-3">
                  <div className="text-center border-b border-slate-200 pb-2">
                    <p className="text-[10px] font-bold text-slate-600 uppercase">HỘI ĐỒNG BỒI THƯỜNG, HỖ TRỢ &amp; TĐC QUẬN HÀ ĐÔNG</p>
                    <h3 className="text-[13.5px] font-bold text-slate-900 uppercase pt-1">
                      BIÊN BẢN KIỂM ĐẾM HIỆN TRẠNG &amp; DỰ THẢO ÁP GIÁ BỒI THƯỜNG
                    </h3>
                    <p className="text-[10.5px] text-rose-700 italic font-semibold">(Bản sao có dấu hiệu sai lệch số liệu diện tích và đơn giá)</p>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <p><strong>Căn cứ: </strong>Biên bản làm việc ngày 18/05/2026 tại hiện trường Dự án KĐT Y.</p>
                    <table className="w-full border-collapse border border-slate-300 text-[11px] text-left">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 p-1.5">Hạng mục</th>
                          <th className="border border-slate-300 p-1.5">Thực tế trích lục</th>
                          <th className="border border-slate-300 p-1.5">Biên bản ghi nhận</th>
                          <th className="border border-slate-300 p-1.5">Chênh lệch / Sai lệch</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 p-1.5 font-medium">Diện tích thu hồi</td>
                          <td className="border border-slate-300 p-1.5 font-bold text-emerald-800">360.0 m²</td>
                          <td className="border border-slate-300 p-1.5 font-bold text-rose-700 bg-rose-50">210.0 m²</td>
                          <td className="border border-slate-300 p-1.5 text-rose-600 font-bold">-150.0 m² (Giảm 41%)</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5 font-medium">Đơn giá bồi thường</td>
                          <td className="border border-slate-300 p-1.5 font-bold text-emerald-800">4.200.000 đ/m²</td>
                          <td className="border border-slate-300 p-1.5 font-bold text-rose-700 bg-rose-50">2.500.000 đ/m²</td>
                          <td className="border border-slate-300 p-1.5 text-rose-600 font-bold">-1.700.000 đ/m²</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-1.5 font-medium">Chữ ký người dân</td>
                          <td className="border border-slate-300 p-1.5">Bà Vũ Thị Thanh</td>
                          <td className="border border-slate-300 p-1.5 italic text-slate-500">Chưa ký (Công dân không đồng ý)</td>
                          <td className="border border-slate-300 p-1.5 text-amber-700 font-semibold">Bị lập BB cưỡng chế</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* File 4: Thiết bị USB chứng cứ số */
                <div className="space-y-3">
                  <div className="text-center border-b border-slate-200 pb-2">
                    <p className="text-[10px] font-bold text-slate-600 uppercase">BỘ PHẬN TIẾP NHẬN ĐƠN &amp; TÀI LIỆU CHỨNG CỨ</p>
                    <h3 className="text-[13.5px] font-bold text-slate-900 uppercase pt-1">
                      BIÊN BẢN GIAO NHẬN THIẾT BỊ LƯU TRỮ USB &amp; DỮ LIỆU ĐIỆN TỬ
                    </h3>
                    <p className="text-[10.5px] text-slate-600 italic">Niêm phong tang vật chứng cứ tiếp nhận kèm theo Đơn tố cáo TC-08/2026-ĐTC</p>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                      <p><strong>Quy cách thiết bị: </strong>USB Kingston DataTraveler 32GB màu trắng - Số sê-ri: DTX-88392-VN.</p>
                      <p><strong>Tình trạng niêm phong: </strong>Túi zip niêm phong có chữ ký xác nhận của cán bộ Một cửa và công dân Vũ Thị Thanh.</p>
                    </div>

                    <p className="font-bold text-slate-900 pt-1">Danh mục dữ liệu trích xuất từ thiết bị:</p>
                    <div className="space-y-1.5">
                      <div className="p-2 rounded border border-blue-200 bg-blue-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-700 text-[18px]">audio_file</span>
                          <div>
                            <p className="font-semibold text-slate-900">Ghi_am_cuoc_gap_15-05-2026.wav (42 MB)</p>
                            <p className="text-[10px] text-slate-500">Ghi âm cuộc trao đổi đề cập đến tiền bồi thường và thỏa thuận rút đơn</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Đã kiểm tra</span>
                      </div>

                      <div className="p-2 rounded border border-blue-200 bg-blue-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-700 text-[18px]">audio_file</span>
                          <div>
                            <p className="font-semibold text-slate-900">Ghi_am_doi_thoai_ubnd_20-06-2026.wav (28 MB)</p>
                            <p className="text-[10px] text-slate-500">Ghi âm đối thoại tại phòng làm việc Ban bồi thường GPMB quận</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Đã kiểm tra</span>
                      </div>

                      <div className="p-2 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-700 text-[18px]">photo_library</span>
                          <div>
                            <p className="font-semibold text-slate-900">12 file ảnh hiện trường cưỡng chế (.JPG)</p>
                            <p className="text-[10px] text-slate-500">Ảnh chụp máy ủi phá dỡ cây trồng và mốc chỉ giới thửa đất số 48</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Đã lưu trữ CSDL</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-[54%] flex flex-col h-full bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Header thanh công cụ phân tích OCR & AI */}
          <div className="flex flex-wrap items-center justify-between p-3 shrink-0 gap-2 border-b border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#004ac6]">fact_check</span>
                <span>
                  {isNoPetitionElement
                    ? 'Kết quả phân tích AI — Tài liệu không phải là đơn'
                    : 'Trích xuất OCR & Phân tích dữ liệu đơn (5W1H)'}
                </span>
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                OCR Hoàn tất
              </span>
              {isNoPetitionElement ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-amber-700">description</span>
                  Phân tích theo hướng Quản lý tài liệu
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#004ac6] border border-blue-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Độ tin cậy AI: 96.8%
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isNoPetitionElement && (
                isEditingExtract ? (
                  <>
                    <span className="text-[10.5px] text-[#004ac6] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium hidden sm:inline">
                      Bấm trực tiếp vào chữ trên bảng để sửa
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveExtract}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white transition-all cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      <span>Lưu thay đổi</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelExtract}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200"
                    >
                      <span>Hủy</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingExtract(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg text-[#004ac6] hover:bg-blue-50 border border-blue-200 transition-all cursor-pointer shadow-2xs"
                    title="Mở chế độ sửa trực tiếp các trường thông tin OCR"
                  >
                    <span className="material-symbols-outlined text-[13px]">edit</span>
                    <span>Chỉnh sửa OCR</span>
                  </button>
                )
              )}
              <button
                type="button"
                onClick={handleStartSimulation}
                disabled={isSimulating}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer"
                title="Chạy lại quy trình quét OCR và phân tích AI"
              >
                <span className="material-symbols-outlined text-[13px] text-amber-600">refresh</span>
                <span>Quét lại AI</span>
              </button>
            </div>
          </div>

          {/* TAB CHUYỂN ĐỔI CHẾ ĐỘ XEM: CHỈ HIỂN THỊ CHO NHÁNH PHÂN TÍCH ĐƠN */}
          {!isNoPetitionElement && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-xs shrink-0">
              <div className="flex items-center gap-1.5 p-0.5 bg-slate-200/70 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAnalysisActiveTab('5w1h')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11.5px] font-bold transition-all cursor-pointer ${analysisActiveTab === '5w1h'
                    ? 'bg-white text-[#004ac6] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <span className="material-symbols-outlined text-[15px] text-[#004ac6]">psychology</span>
                  <span>Phân tích nội dung (5W1H)</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded font-bold bg-blue-50 text-[#004ac6] border border-blue-200">
                    6 thành phần
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnalysisActiveTab('ocr')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11.5px] font-bold transition-all cursor-pointer ${analysisActiveTab === 'ocr'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <span className="material-symbols-outlined text-[15px] text-slate-700">document_scanner</span>
                  <span>Dữ liệu trích xuất OCR</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Bản ghi gốc
                  </span>
                </button>
              </div>

              <div className="text-[10.5px] text-slate-500 hidden sm:flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-slate-400">info</span>
                <span>
                  {analysisActiveTab === '5w1h'
                    ? 'AI phân tích 5W1H • Cán bộ đối chiếu tài liệu gốc'
                    : 'Dữ liệu OCR bóc tách thô • Cho phép sửa trực tiếp'}
                </span>
              </div>
            </div>
          )}

          {/* Nội dung cuộn */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-200/80 p-4 space-y-4 text-xs">
            {/* Banner tiến trình khi đang quét OCR / Phân tích AI */}
            {aiState === 'reading' && (
              <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-md space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-600 animate-spin text-[16px]">hourglass_top</span>
                    {isNoPetitionElement
                      ? 'Tiến trình nhận diện cấu trúc tài liệu & Đối soát kho Tài liệu tiếp nhận'
                      : 'Tiến trình nhận diện OCR & Phân tích thực thể 5W1H'}
                  </span>
                  <span>{readingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-amber-500 to-amber-600 transition-all duration-300 rounded-full"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {isNoPetitionElement ? (
              /* ========================================================================= */
              /* NHÁNH 2: KẾT QUẢ PHÂN TÍCH AI ĐỐI VỚI TÀI LIỆU KHÔNG PHẢI LÀ ĐƠN (MỤC A-F) */
              /* ========================================================================= */
              <div className="space-y-4">
                <PhanTichTaiLieuKhongPhaiDonSection
                  activeScenario={activeDocScenario}
                  onChangeScenario={(sc) => {
                    setActiveDocScenario(sc);
                    setSelectedFileIndex(0);
                    const defaultScenario = KICH_BAN_TAI_LIEU_MAP[sc];
                    if (defaultScenario && defaultScenario.deXuatXuLy.length > 0) {
                      const recommended =
                        defaultScenario.deXuatXuLy.find((d) => d.isRecommended) ||
                        defaultScenario.deXuatXuLy[0];
                      setSelectedDocPhuongAn(recommended.phuongAn);
                      setDocTargetCode(recommended.targetCodeSuggested || '');
                      setOfficerNote(recommended.lyDoDeXuat);
                    }
                  }}
                  selectedPhuongAn={selectedDocPhuongAn}
                  onSelectPhuongAn={(pa, note, targetCode) => {
                    setSelectedDocPhuongAn(pa);
                    if (targetCode !== undefined) setDocTargetCode(targetCode);
                    if (note) setOfficerNote(note);
                  }}
                  onNavigateToDocument={handleNavigateToDocument}
                  onSwitchToPetitionFlow={() => {
                    setIsNoPetitionElement(false);
                    setHuongXuLy('tiep-nhan');
                    setOfficerNote(
                      'Cán bộ xác định tài liệu có nội dung yêu cầu giải quyết thuộc phạm vi đơn thư (TC08) — Chuyển từ nhánh Quản lý tài liệu sang luồng Tiếp nhận và Phân tích đơn.'
                    );
                    showToast(
                      'Đã chuyển sang luồng Tiếp nhận & Phân tích đơn (TC08). Các trường nghiệp vụ đơn đã được kích hoạt.'
                    );
                  }}
                  onOpenConfirmActionModal={(pa, targetItem) => {
                    setSelectedDocPhuongAn(pa);
                    if (targetItem?.maHoSoTaiLieu) {
                      setDocTargetCode(targetItem.maHoSoTaiLieu);
                    }
                    setShowDocActionModal(true);
                  }}
                  showToast={showToast}
                />

                {/* KHỐI XÁC NHẬN CỦA CÁN BỘ & NÚT THỰC HIỆN PHƯƠNG ÁN XỬ LÝ TÀI LIỆU */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#004ac6]">verified_user</span>
                      <h4 className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
                        Xác nhận của cán bộ &amp; Thực hiện xử lý tài liệu
                      </h4>
                    </div>
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#004ac6] border border-blue-200">
                      Phương án đang chọn:{' '}
                      {selectedDocPhuongAn === 'ghep_don'
                        ? `Ghép đơn (${docTargetCode || 'Đ-2026-00125'})`
                        : 'Tiếp nhận thành tài liệu'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Ý kiến xác nhận / Ghi chú xử lý tài liệu của cán bộ (Lưu vào hồ sơ lượt nhận):
                    </label>
                    <textarea
                      rows={3}
                      value={officerNote}
                      onChange={(e) => setOfficerNote(e.target.value)}
                      placeholder="Nhập ý kiến kiểm tra, xác nhận mối liên hệ tài liệu hoặc hướng xử lý..."
                      maxLength={500}
                      className="w-full p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-[11.5px] text-slate-800 focus:outline-none focus:bg-white focus:border-[#004ac6] transition-all resize-none leading-relaxed"
                    />
                    <div className="flex justify-between items-center pt-1 text-[10px] text-slate-500">
                      <span>
                        Quy tắc: Việc tiếp nhận thành tài liệu hoặc ghép tài liệu vào đơn tuyệt đối không tự động sinh đơn mới.
                      </span>
                      <span className="font-mono">{officerNote.length}/500</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          showToast('Đã lưu nháp kết quả phân tích tài liệu và giữ nguyên dữ liệu gốc OCR.')
                        }
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">save</span>
                        <span>Lưu nháp</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocPhuongAn('ghi_nhan_tai_lieu');
                          setShowDocActionModal(true);
                        }}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          selectedDocPhuongAn === 'ghi_nhan_tai_lieu'
                            ? 'bg-[#004ac6] hover:bg-[#003ea8] text-white shadow-xs'
                            : 'border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#004ac6]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">description</span>
                        <span>Tiếp nhận thành tài liệu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocPhuongAn('ghep_don');
                          setShowDocActionModal(true);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          selectedDocPhuongAn === 'ghep_don'
                            ? 'bg-[#a61c1c] hover:bg-[#8b1414] text-white shadow-xs'
                            : 'border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[#a61c1c]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">merge_type</span>
                        <span>Ghép đơn ({docTargetCode || 'Đ-2026-00125'})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* NHÁNH 1: LUỒNG PHÂN TÍCH ĐƠN HIỆN TẠI (GIỮ NGUYÊN 100%)                    */
              /* ========================================================================= */
              <>
                {analysisActiveTab === '5w1h' && (
                  <PhanTich5W1HSection
                    extractData={extractData}
                    onNavigateToDocument={handleNavigateToDocument}
                    onSelectHuongXuLy={(huong, note) => {
                      setHuongXuLy(huong);
                      if (note) setOfficerNote(note);
                    }}
                    showToast={showToast}
                    isAiReading={aiState === 'reading'}
                    isNoPetitionElement={isNoPetitionElement}
                  />
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* KHU VỰC 2: THÔNG TIN OCR TRÍCH XUẤT                         */}
                {/* ────────────────────────────────────────────────────────── */}
                {analysisActiveTab === 'ocr' && (
              <div className="space-y-4">

                <div className="space-y-3.5">
                  {/* Section Header */}
                  <div className="px-3.5 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#004ac6]">description</span>
                      <span className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
                        A. Thông tin đơn
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px]">
                      <span className="px-1.5 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        OCR độ tin cậy 99%
                      </span>
                    </div>
                  </div>

                  {/* Section Body: Unified Flat Property Table */}
                  <div className="divide-y divide-slate-100 text-[11.5px]">
                    {/* Row 1: Số đơn | Ngày làm đơn | Loại đơn */}
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                      <div
                        onMouseEnter={() => setActiveHighlightKey('soDon')}
                        onMouseLeave={() => setActiveHighlightKey(null)}
                        className="p-2.5 hover:bg-blue-50/40 transition-colors"
                      >
                        <span className="text-[10.5px] font-medium text-slate-500 block mb-0.5">Số đơn / Ký hiệu trích lục</span>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('soDon' as any, e.currentTarget.textContent || '')}
                          className={`font-mono font-bold text-slate-900 text-[12px] outline-none block ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 px-1 rounded' : ''}`}
                        >
                          {extractData.soDon || 'TC-08/2026-ĐTC'}
                        </span>
                      </div>

                      <div
                        onMouseEnter={() => setActiveHighlightKey('ngayLamDon')}
                        onMouseLeave={() => setActiveHighlightKey(null)}
                        className="p-2.5 hover:bg-blue-50/40 transition-colors"
                      >
                        <span className="text-[10.5px] font-medium text-slate-500 block mb-0.5">Ngày làm đơn</span>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('ngayLamDon' as any, e.currentTarget.textContent || '')}
                          className={`font-semibold text-slate-900 text-[12px] outline-none block ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 px-1 rounded' : ''}`}
                        >
                          {extractData.ngayLamDon || '12/09/2026'}
                        </span>
                      </div>

                      <div
                        onMouseEnter={() => setActiveHighlightKey('loaiDon')}
                        onMouseLeave={() => setActiveHighlightKey(null)}
                        className="p-2.5 hover:bg-blue-50/40 transition-colors"
                      >
                        <span className="text-[10.5px] font-medium text-slate-500 block mb-0.5">Phân loại &amp; Thẩm quyền</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            contentEditable={isEditingExtract}
                            suppressContentEditableWarning
                            onBlur={(e) => updateExtractField('loaiNoiDung', e.currentTarget.textContent || '')}
                            className={`font-bold text-rose-800 text-[12px] outline-none ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 px-1 rounded' : ''}`}
                          >
                            {extractData.loaiNoiDung || 'Đơn tố cáo'}
                          </span>
                          <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded border border-rose-200 font-semibold">
                            Luật Tố cáo 2018
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Thời gian xảy ra | Địa điểm xảy ra */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                      <div
                        onMouseEnter={() => setActiveHighlightKey('thoiGian')}
                        onMouseLeave={() => setActiveHighlightKey(null)}
                        className="p-2.5 hover:bg-blue-50/40 transition-colors"
                      >
                        <span className="text-[10.5px] font-medium text-slate-500 block mb-0.5">Thời gian xảy ra sự việc</span>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('thoiGian', e.currentTarget.textContent || '')}
                          className={`font-semibold text-slate-800 text-[12px] outline-none block ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 px-1 rounded' : ''}`}
                        >
                          {extractData.thoiGian || '15/04/2025 – 20/06/2026'}
                        </span>
                      </div>

                      <div
                        onMouseEnter={() => setActiveHighlightKey('diaDiem')}
                        onMouseLeave={() => setActiveHighlightKey(null)}
                        className="p-2.5 hover:bg-blue-50/40 transition-colors"
                      >
                        <span className="text-[10.5px] font-medium text-slate-500 block mb-0.5">Địa điểm xảy ra sự việc</span>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('diaDiem', e.currentTarget.textContent || '')}
                          className={`text-slate-800 text-[12px] outline-none block ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 px-1 rounded' : ''}`}
                        >
                          {extractData.diaDiem || 'Dự án Khu đô thị mới Y, phường Mộ Lao, quận Hà Đông, TP. Hà Nội'}
                        </span>
                      </div>
                    </div>

                    {/* Row 3: Nội dung tố cáo trích xuất */}
                    <div
                      onMouseEnter={() => setActiveHighlightKey('noiDung')}
                      onMouseLeave={() => setActiveHighlightKey(null)}
                      className="p-2.5 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10.5px] text-slate-500 mb-1">
                        <span className="font-medium">Nội dung tố cáo trích xuất (Tóm tắt hành vi):</span>
                        <span className="text-[9.5px] text-emerald-700 font-bold">Khớp văn bản scan gốc</span>
                      </div>
                      <p
                        contentEditable={isEditingExtract}
                        suppressContentEditableWarning
                        onBlur={(e) => updateExtractField('noiDungTomTat', e.currentTarget.textContent || '')}
                        className={`text-slate-800 text-[12px] leading-relaxed outline-none text-justify ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 p-1.5 rounded' : ''}`}
                      >
                        {extractData.noiDungTomTat}
                      </p>
                    </div>

                    {/* Row 4: Yêu cầu của người tố cáo & Tài liệu kèm theo (2 cột phân chia tinh gọn) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                      {/* Cột trái: 4 yêu cầu */}
                      <div
                        onMouseEnter={() => setActiveHighlightKey('yeuCau')}
                        onMouseLeave={() => setActiveHighlightKey(null)}
                        className="p-2.5 hover:bg-blue-50/40 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[10.5px] text-slate-500">
                          <span className="font-semibold text-slate-700">Yêu cầu của người tố cáo (04 nội dung):</span>
                          <span className="text-[9.5px] text-emerald-700 font-bold">✓ Đủ 4 yêu cầu</span>
                        </div>
                        <ol className="space-y-1 text-slate-800 text-[11.5px]">
                          <li className="flex items-start gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                            <span
                              contentEditable={isEditingExtract}
                              suppressContentEditableWarning
                              onBlur={(e) => updateExtractField('yeuCau1', e.currentTarget.textContent || '')}
                              className={`flex-1 outline-none ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 px-1 rounded' : ''}`}
                            >
                              {extractData.yeuCau1}
                            </span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                            <span
                              contentEditable={isEditingExtract}
                              suppressContentEditableWarning
                              onBlur={(e) => updateExtractField('yeuCau2', e.currentTarget.textContent || '')}
                              className={`flex-1 outline-none ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 px-1 rounded' : ''}`}
                            >
                              {extractData.yeuCau2}
                            </span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                            <span
                              contentEditable={isEditingExtract}
                              suppressContentEditableWarning
                              onBlur={(e) => updateExtractField('yeuCau3', e.currentTarget.textContent || '')}
                              className={`flex-1 outline-none ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 px-1 rounded' : ''}`}
                            >
                              {extractData.yeuCau3}
                            </span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                            <span
                              contentEditable={isEditingExtract}
                              suppressContentEditableWarning
                              onBlur={(e) => updateExtractField('yeuCau4' as any, e.currentTarget.textContent || '')}
                              className={`flex-1 outline-none ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 px-1 rounded' : ''}`}
                            >
                              {extractData.yeuCau4 || 'Thực hiện bồi thường, bố trí tái định cư công khai, minh bạch đúng quy định.'}
                            </span>
                          </li>
                        </ol>
                      </div>

                      {/* Cột phải: 4 tài liệu */}
                      <div
                        onMouseEnter={() => setActiveHighlightKey('taiLieu')}
                        onMouseLeave={() => setActiveHighlightKey(null)}
                        className="p-2.5 hover:bg-blue-50/40 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[10.5px] text-slate-500">
                          <span className="font-semibold text-slate-700">Tài liệu, chứng cứ kèm theo (04 tài liệu):</span>
                          <span className="text-[9.5px] text-emerald-700 font-bold">✓ Khớp hồ sơ</span>
                        </div>
                        <ul className="space-y-1 text-slate-700 text-[11.5px]">
                          <li className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-rose-600 shrink-0">picture_as_pdf</span>
                            <span className="font-medium">1. Đơn tố cáo scan bản gốc có chữ ký &amp; điểm chỉ</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-blue-600 shrink-0">map</span>
                            <span>2. Trích lục bản đồ 1/500 &amp; địa chính thửa 48 (360m²)</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-amber-600 shrink-0">description</span>
                            <span>3. Biên bản kiểm đếm áp giá sai lệch (giảm 150m²)</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-purple-600 shrink-0">usb</span>
                            <span>4. Thiết bị USB chứa 02 file ghi âm &amp; 12 ảnh hiện trường</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3.5">
                  {/* Section Header with Multi-person Selector */}
                  <div className="px-3.5 py-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#004ac6]">groups</span>
                      <span className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
                        B. Danh sách người đứng đơn ({danhSachNguoiDungDon.length} người)
                      </span>
                      <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100/70 text-blue-800 border border-blue-200">
                        ✓ CSDL VNeID
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Khớp danh tính: 99.8%
                      </span>
                    </div>

                    {/* Segmented Control: Chuyển đổi nhanh 2 người / Tập thể 6 người / 1 người */}
                    <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-[10.5px]">
                      <button
                        type="button"
                        onClick={() => handleChonCheDoNguoiDungDon('2_nguoi')}
                        className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer ${cheDoNguoiDungDon === '2_nguoi'
                          ? 'bg-white text-blue-700 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                          }`}
                        title="Đơn có 02 công dân đồng đứng tên (Bà Thanh & Ông A)"
                      >
                        Đồng đứng đơn (02 người)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChonCheDoNguoiDungDon('tap_the')}
                        className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer ${cheDoNguoiDungDon === 'tap_the'
                          ? 'bg-white text-blue-700 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                          }`}
                        title="Đơn tập thể nhiều người (06 công dân cử người đại diện)"
                      >
                        Đơn tập thể (06 người)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChonCheDoNguoiDungDon('1_nguoi')}
                        className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer ${cheDoNguoiDungDon === '1_nguoi'
                          ? 'bg-white text-blue-700 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                          }`}
                        title="Đơn 01 cá nhân đứng tên"
                      >
                        Cá nhân (01 người)
                      </button>
                    </div>
                  </div>

                  {/* Sub-banner: Căn cứ pháp lý theo số lượng người tố cáo */}


                  {/* BẢNG DANH SÁCH NGƯỜI ĐỨNG ĐƠN PHẲNG (Ultra-compact, High-density Table) */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-[11px]">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                          <th className="py-2 px-3 text-center w-12">STT</th>
                          <th className="py-2 px-3 min-w-[150px]">Họ và tên &amp; Năm sinh</th>
                          <th className="py-2 px-3 min-w-[120px]">Số CCCD &amp; Cấp</th>
                          <th className="py-2 px-3 min-w-[130px]">Điện thoại &amp; Email</th>
                          <th className="py-2 px-3 min-w-[200px]">Địa chỉ thường trú / Liên hệ</th>
                          {/* <th className="py-2 px-3 text-center min-w-[110px]">Chữ ký / Điểm chỉ</th> */}
                          <th className="py-2 px-3 text-center min-w-[100px]">Vai trò</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {danhSachNguoiDungDon.map((nd, idx) => (
                          <tr
                            key={nd.id}
                            onMouseEnter={() => setActiveHighlightKey('nguoiGui')}
                            onMouseLeave={() => setActiveHighlightKey(null)}
                            className="hover:bg-blue-50/40 transition-colors"
                          >
                            {/* STT */}
                            <td className="py-2 px-3 text-center font-bold text-slate-500">
                              #{idx + 1}
                            </td>

                            {/* Họ tên & Năm sinh */}
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  contentEditable={isEditingExtract}
                                  suppressContentEditableWarning
                                  onBlur={(e) => updateNguoiDungDonField(nd.id, 'hoTen', e.currentTarget.textContent || '')}
                                  className={`font-bold text-slate-900 text-[12px] outline-none ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/60 px-1 rounded' : ''}`}
                                >
                                  {nd.hoTen}
                                </span>
                                <span
                                  contentEditable={isEditingExtract}
                                  suppressContentEditableWarning
                                  onBlur={(e) => updateNguoiDungDonField(nd.id, 'namSinh', e.currentTarget.textContent || '')}
                                  className={`text-[10.5px] text-slate-500 font-mono outline-none ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/60 px-0.5 rounded' : ''}`}
                                >
                                  ({nd.namSinh})
                                </span>
                              </div>
                            </td>

                            {/* CCCD & Ngày cấp */}
                            <td className="py-2 px-3">
                              <span
                                contentEditable={isEditingExtract}
                                suppressContentEditableWarning
                                onBlur={(e) => updateNguoiDungDonField(nd.id, 'cccd', e.currentTarget.textContent || '')}
                                className={`font-mono font-bold text-slate-900 text-[11.5px] outline-none block ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/60 px-1 rounded' : ''}`}
                              >
                                {nd.cccd}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate" title={`${nd.ngayCapCCCD} - ${nd.noiCapCCCD}`}>
                                {nd.ngayCapCCCD} • {nd.noiCapCCCD.includes('Cục') ? 'Cục Cảnh sát QLHC' : nd.noiCapCCCD}
                              </span>
                            </td>

                            {/* SĐT & Email */}
                            <td className="py-2 px-3">
                              <span
                                contentEditable={isEditingExtract}
                                suppressContentEditableWarning
                                onBlur={(e) => updateNguoiDungDonField(nd.id, 'sdt', e.currentTarget.textContent || '')}
                                className={`font-mono text-slate-900 font-semibold outline-none block ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/60 px-1 rounded' : ''}`}
                              >
                                {nd.sdt}
                              </span>
                              <span
                                contentEditable={isEditingExtract}
                                suppressContentEditableWarning
                                onBlur={(e) => updateNguoiDungDonField(nd.id, 'email', e.currentTarget.textContent || '')}
                                className={`text-[10px] text-slate-500 outline-none block truncate max-w-[130px] ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/60 px-0.5 rounded' : ''}`}
                                title={nd.email}
                              >
                                {nd.email}
                              </span>
                            </td>

                            {/* Địa chỉ */}
                            <td className="py-2 px-3">
                              <span
                                contentEditable={isEditingExtract}
                                suppressContentEditableWarning
                                onBlur={(e) => updateNguoiDungDonField(nd.id, 'diaChi', e.currentTarget.textContent || '')}
                                className={`text-slate-800 text-[11px] leading-snug outline-none block line-clamp-2 ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/60 px-1 rounded' : ''}`}
                                title={nd.diaChi}
                              >
                                {nd.diaChi}
                              </span>
                            </td>

                            {/* Chữ ký / Điểm chỉ */}
                            {/* <td className="py-2 px-3 text-center">
                              <div className="inline-flex flex-col items-center gap-0.5">
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">check</span>
                                  <span>Chữ ký tay</span>
                                </span>
                                {nd.coDiemChi && (
                                  <span className="text-[9.5px] font-semibold text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                                    Có điểm chỉ
                                  </span>
                                )}
                              </div>
                            </td> */}

                            {/* Vai trò */}
                            <td className="py-2 px-3 text-center">
                              {nd.vaiTro === 'dai_dien' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 inline-block whitespace-nowrap shadow-2xs">
                                  {nd.vaiTroLabel}
                                </span>
                              ) : nd.vaiTro === 'dong_dung_don' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-block whitespace-nowrap">
                                  {nd.vaiTroLabel}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 inline-block whitespace-nowrap">
                                  {nd.vaiTroLabel}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer actions */}
                  {isEditingExtract && (
                    <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          const nextIdx = danhSachNguoiDungDon.length + 1;
                          const newPerson: NguoiDungDonItem = {
                            id: `nd-custom-${Date.now()}`,
                            stt: nextIdx,
                            vaiTro: 'dong_ky_ten',
                            vaiTroLabel: `Đồng ký tên (#${nextIdx})`,
                            hoTen: 'Nguyễn Văn Mới',
                            namSinh: '1980',
                            cccd: '001080000000',
                            ngayCapCCCD: '01/01/2022',
                            noiCapCCCD: 'Cục Cảnh sát QLHC',
                            sdt: '0900 000 000',
                            email: 'congdan@gmail.com',
                            diaChi: 'Hà Đông, Hà Nội',
                            coChuKy: true,
                            coDiemChi: false,
                            trangThaiVNeID: true,
                          };
                          setDanhSachNguoiDungDon([...danhSachNguoiDungDon, newPerson]);
                          showToast(`Đã thêm người đồng đứng đơn #${nextIdx}`);
                        }}
                        className="text-[11px] text-[#004ac6] hover:bg-blue-100 px-2 py-1 rounded border border-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>+ Thêm người đồng đứng đơn</span>
                      </button>

                      <span className="text-[10.5px] text-slate-500 italic">
                        Bấm trực tiếp vào chữ trên bảng để sửa thông tin công dân
                      </span>
                    </div>
                  )}
                </div>

                {/* NHÓM C: THÔNG TIN ĐỐI TƯỢNG BỊ TỐ CÁO (Giao diện phẳng, chia vạch hairline, không bọc mini-cards) */}
                <div className="space-y-3.5">
                  {/* Section Header */}
                  <div className="px-3.5 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-rose-700">warning</span>
                      <span className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
                        C. Thông tin đối tượng bị tố cáo
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px]">
                      <span className="px-1.5 py-0.5 rounded font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                        ⚠ Cần xác minh thẩm quyền
                      </span>
                    </div>
                  </div>

                  {/* Section Body: Unified Flat Property Table */}
                  <div className="divide-y divide-slate-100 text-[11.5px]">
                    {/* Row 1: Họ tên / Tên tổ chức | Chức vụ & Đơn vị */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                      <div
                        onMouseEnter={() => setActiveHighlightKey('doiTuong')}
                        onMouseLeave={() => setActiveHighlightKey(null)}
                        className="p-2.5 hover:bg-rose-50/30 transition-colors"
                      >
                        <span className="text-[10.5px] font-medium text-slate-500 block mb-0.5">
                          Họ và tên / Tổ chức bị tố cáo
                        </span>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('doiTuong', e.currentTarget.textContent || '')}
                          className={`font-bold text-slate-900 text-[12.5px] outline-none block ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 px-1 rounded' : ''}`}
                        >
                          {extractData.doiTuong}
                        </span>
                      </div>

                      <div className="p-2.5 hover:bg-rose-50/30 transition-colors">
                        <span className="text-[10.5px] font-medium text-slate-500 block mb-0.5">
                          Chức vụ &amp; Đơn vị công tác
                        </span>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('chucVu', e.currentTarget.textContent || '')}
                          className={`font-semibold text-slate-800 text-[12px] outline-none block ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 px-1 rounded' : ''}`}
                        >
                          {extractData.chucVu} - {extractData.donVi}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Trụ sở / Địa chỉ | Dấu hiệu vi phạm */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                      <div className="p-2.5 hover:bg-rose-50/30 transition-colors">
                        <span className="text-[10.5px] font-medium text-slate-500 block mb-0.5">
                          Trụ sở / Địa chỉ nhận diện
                        </span>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('diaChiDoiTuong' as any, e.currentTarget.textContent || '')}
                          className={`text-slate-800 text-[11.5px] outline-none block ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 px-1 rounded' : ''}`}
                        >
                          {extractData.diaChiDoiTuong || 'Trụ sở UBND quận Hà Đông & Trụ sở Công ty CP X tại Tòa nhà Stellar, Cầu Giấy, Hà Nội'}
                        </span>
                      </div>

                      <div className="p-2.5 hover:bg-rose-50/30 transition-colors">
                        <span className="text-[10.5px] font-medium text-slate-500 block mb-0.5">
                          Dấu hiệu sai phạm nhận định sơ bộ
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-rose-800 font-bold text-[11.5px]">
                            {extractData.dauHieu || 'Cố ý làm trái trong bồi thường đất đai & Dấu hiệu nhận hối lộ'}
                          </span>
                          <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded border border-rose-200 font-semibold">
                            Độ tin cậy 96%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Hành vi vi phạm bị tố cáo trích xuất */}
                    <div className="p-2.5 hover:bg-rose-50/30 transition-colors">
                      <div className="flex items-center justify-between text-[10.5px] text-slate-500 mb-1">
                        <span className="font-medium">Hành vi vi phạm bị tố cáo (Trích xuất văn bản):</span>
                        <span className="text-[9.5px] text-rose-700 font-bold">Mức độ nghiêm trọng</span>
                      </div>
                      <p
                        contentEditable={isEditingExtract}
                        suppressContentEditableWarning
                        onBlur={(e) => updateExtractField('hanhViBiToCao' as any, e.currentTarget.textContent || '')}
                        className={`text-slate-800 text-[11.5px] leading-relaxed outline-none text-justify ${isEditingExtract ? 'border-b border-dashed border-[#004ac6] bg-blue-50/50 p-1.5 rounded' : ''}`}
                      >
                        {extractData.hanhViBiToCao || 'Lợi dụng chức vụ quyền hạn lập phương án bồi thường sai thực tế, cắt giảm 150m² đất đền bù, ép hạ giá từ 4.2 triệu/m² xuống 2.5 triệu/m², có dấu hiệu thông đồng trục lợi chênh lệch địa tô dự án.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────── */}
            {/* KHU VỰC 3: KẾT QUẢ PHÂN TÍCH AI                            */}
            {/* ────────────────────────────────────────────────────────── */}
            <div className="pt-4 space-y-4">
              {/* <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h4 className="text-[13px] font-bold text-slate-900 uppercase tracking-wide">
                    Khu vực 3: Kết quả phân tích AI &amp; Đề xuất xử lý
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Trợ lý AI hỗ trợ nhận định • Cán bộ giữ quyền quyết định cuối cùng
                </span>
              </div> */}

              {aiState === 'reading' ? (
                <div className="p-6 rounded-md border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="material-symbols-outlined text-[36px] text-amber-500 animate-spin">
                    progress_activity
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">
                      AI đang phân tích thực thể 5W1H &amp; đối soát CSDL...
                    </h5>
                    <p className="text-xs text-slate-500 max-w-md mt-1">
                      Hệ thống đang kiểm tra tính hợp lệ theo Luật Tố cáo 2018, quét tài liệu đính kèm và tìm kiếm đơn tương tự. Kết quả và đề xuất hướng xử lý sẽ xuất hiện sau khi hoàn tất.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">

                  {/* ========================================================================= */}
                  {/* D. TRA CỨU & ĐỐI SOÁT HỒ SƠ VỤ VIỆC, ĐƠN TƯƠNG TỰ (ĐỂ ĐỐI CHIẾU & GHÉP ĐƠN) */}
                  {/* ========================================================================= */}
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="px-3.5 py-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-[#004ac6]">manage_search</span>
                        <span className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
                          D. Tra cứu &amp; Đối soát hồ sơ vụ việc, đơn tương tự
                        </span>
                        {isNoPetitionElement ? (
                          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            00 đơn tương tự • Không phát hiện vụ việc KNTC liên quan
                          </span>
                        ) : (
                          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            04 đơn tương tự • 01 vụ việc liên quan
                          </span>
                        )}
                      </div>
                    </div>
                    {isNoPetitionElement ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-[11px] bg-slate-50/40 border border-slate-200 rounded">
                        <div className="p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Lịch sử pháp nhân gửi</span>
                            <span className="text-[9.5px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              Tra cứu MST
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <strong className="text-slate-700 font-bold">00 đơn KNTC trước đó</strong>
                            <span className="text-[10px] text-slate-500">Lần đầu ghi nhận</span>
                          </div>
                        </div>

                        <div className="p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Đơn tương tự trong CSDL</span>
                            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Đã đối soát
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <strong className="text-slate-700 font-bold">00 đơn trùng khớp</strong>
                            <span className="text-[10px] text-slate-500">Chứng từ thương mại</span>
                          </div>
                        </div>

                        <div
                          onClick={() => openNguonTraCuu('vu-viec')}
                          className="p-2 hover:bg-purple-50/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Trùng tên địa danh dự án</span>
                            <span className="text-[9.5px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              Lưu ý kiểm tra
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <strong className="text-purple-800 font-bold">Dự án KĐT mới Y (Hà Đông)</strong>
                            <span className="text-[10px] text-purple-700 font-semibold hover:underline">Kiểm tra ➔</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-[11px] bg-slate-50/40 border border-slate-200 rounded">
                        <div
                          onClick={() => openNguonTraCuu('nguoi-gui')}
                          className="p-2 hover:bg-amber-50/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Lịch sử người nộp</span>
                            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Độ tin cậy: 99.8%
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <strong className="text-slate-900 font-bold">06 đơn đã gửi</strong>
                            <span className="text-[10px] text-amber-700 font-semibold hover:underline">Chi tiết ➔</span>
                          </div>
                        </div>

                        <div
                          onClick={() => openNguonTraCuu('don-tuong-tu')}
                          className="p-2 hover:bg-rose-50/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Đơn tương tự trong CSDL</span>
                            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Độ tin cậy: 96.5%
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <strong className="text-rose-700 font-bold">04 đơn (Trùng đến 96%)</strong>
                            <span className="text-[10px] text-rose-700 font-semibold hover:underline">Đối chiếu ➔</span>
                          </div>
                        </div>

                        <div
                          onClick={() => openNguonTraCuu('vu-viec')}
                          className="p-2 hover:bg-purple-50/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Hồ sơ vụ việc liên quan</span>
                            <span className="text-[9.5px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                              Độ tin cậy: 97.2%
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <strong className="text-purple-800 font-bold">01 vụ việc (VV-2026-0042)</strong>
                            <span className="text-[10px] text-purple-700 font-semibold hover:underline">Xem vụ việc ➔</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Đề xuất 3 hướng xử lý sơ bộ (Cán bộ xem xét & lựa chọn) */}
                  <div className="space-y-3.5">
                    <div className="px-3.5 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#a61c1c]">alt_route</span>
                        <span className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
                          4. Đề xuất hướng xử lý sơ bộ (Cán bộ lựa chọn)
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 italic">
                        AI gợi ý phương án tối ưu — Cán bộ bấm chọn để áp dụng
                      </span>
                    </div>

                    {isNoPetitionElement ? (
                      <div className="divide-y divide-slate-100">
                        {/* Phương án 1 (Khuyến nghị AI khi không có yếu tố là đơn): Không tiếp nhận / Xếp lưu hồ sơ */}
                        <div
                          onClick={() => {
                            setHuongXuLy('xep-luu');
                            setOfficerNote(
                              'Qua kiểm tra tài liệu lượt nhận và kết quả phân tích AI (độ tin cậy 97.4%), hồ sơ chỉ bao gồm Hợp đồng cung ứng vật tư số 18/2026/HĐKT-MK và Bảng thông báo điều chỉnh báo giá VLXD; không có văn bản đơn thư, không có nội dung khiếu nại, tố cáo, kiến nghị, phản ánh và không có yêu cầu cơ quan nhà nước giải quyết. Căn cứ Thông tư 05/2021/TT-TTCP, đề xuất Không tiếp nhận thụ lý và Xếp lưu theo dõi / Kết thúc lượt nhận.'
                            );
                          }}
                          className={`p-3 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                            huongXuLy === 'xep-luu'
                              ? 'bg-amber-50/90 border-l-4 border-l-amber-600'
                              : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="mt-0.5 shrink-0">
                              {huongXuLy === 'xep-luu' ? (
                                <div className="w-4.5 h-4.5 rounded-full bg-amber-600 text-white flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[13px]">check</span>
                                </div>
                              ) : (
                                <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 bg-white" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-[12.5px]">
                                  Phương án 1: Không tiếp nhận / Xếp lưu hồ sơ (Kết thúc lượt nhận)
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                  Khuyến nghị AI • Độ tin cậy: 97.4%
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-1">
                                Tài liệu không chứa nội dung khiếu nại, tố cáo, kiến nghị, phản ánh (0/4 yếu tố cấu thành đơn). Thực hiện phân loại &ldquo;Tài liệu không có yếu tố là đơn&rdquo;, xếp lưu kho điện tử và kết thúc lượt nhận theo Thông tư 05/2021/TT-TTCP (không sinh mã đơn thụ lý mới).
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Phương án 2: Ghép làm tài liệu bổ sung vào hồ sơ đã có */}
                        <div
                          onClick={() => {
                            setHuongXuLy('ghep');
                            setOfficerNote(
                              'Mặc dù lượt nhận chỉ là chứng từ hợp đồng vật tư và bảng báo giá rời (không có đơn kèm theo), nếu xác định đây là tài liệu do đương sự gửi bổ sung cho vụ việc tại Dự án KĐT mới Y, đề xuất ghép làm tài liệu tham khảo vào hồ sơ đã có mà không tạo mã đơn mới.'
                            );
                          }}
                          className={`p-3 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                            huongXuLy === 'ghep'
                              ? 'bg-[#fffaf9] border-l-4 border-l-[#a61c1c]'
                              : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="mt-0.5 shrink-0">
                              {huongXuLy === 'ghep' ? (
                                <div className="w-4.5 h-4.5 rounded-full bg-[#a61c1c] text-white flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[13px]">check</span>
                                </div>
                              ) : (
                                <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 bg-white" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-[12.5px]">
                                  Phương án 2: Ghép làm tài liệu bổ sung vào (Hồ sơ đã có)
                                </span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  Áp dụng nếu gửi bổ sung chứng cứ
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-1">
                                Trường hợp công dân/tổ chức gửi bổ sung chứng từ cho một đơn đã nộp trước đó nhưng quên ghi phiếu chuyển hoặc tiêu đề đơn.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Phương án 3: Ghi đè nhận định AI — Tiếp nhận & Phân loại thủ công */}
                        <div
                          onClick={() => {
                            setHuongXuLy('tiep-nhan');
                            setOfficerNote(
                              'Cán bộ kiểm tra thủ công và ghi đè nhận định AI: Tiếp nhận hồ sơ để xử lý như đơn phản ánh/kiến nghị theo yêu cầu nghiệp vụ.'
                            );
                          }}
                          className={`p-3 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                            huongXuLy === 'tiep-nhan'
                              ? 'bg-blue-50/80 border-l-4 border-l-[#004ac6]'
                              : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="mt-0.5 shrink-0">
                              {huongXuLy === 'tiep-nhan' ? (
                                <div className="w-4.5 h-4.5 rounded-full bg-[#004ac6] text-white flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[13px]">check</span>
                                </div>
                              ) : (
                                <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 bg-white" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-[12.5px]">
                                  Phương án 3: Ghi đè nhận định AI — Tiếp nhận &amp; Phân loại đơn thủ công
                                </span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-[#004ac6] border border-blue-200">
                                  Cán bộ tự thẩm định
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-1">
                                Chọn phương án này nếu cán bộ phát hiện nội dung kiến nghị/phản ánh ẩn trong tài liệu mà AI chưa nhận diện được.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {/* Phương án 1: Thụ lý giải quyết tố cáo theo thẩm quyền (Khuyến nghị 92%) */}
                        <div
                          onClick={() => {
                            setHuongXuLy('tiep-nhan');
                            setOfficerNote(
                              'Đơn đủ điều kiện thụ lý theo quy định tại Điều 29 Luật Tố cáo 2018. Đề xuất Lãnh đạo ban hành Quyết định thụ lý giải quyết tố cáo và thành lập Tổ xác minh làm rõ sai phạm trong bồi thường GPMB tại thửa đất 48.'
                            );
                          }}
                          className={`p-3 transition-colors cursor-pointer flex items-start justify-between gap-3 ${huongXuLy === 'tiep-nhan'
                            ? 'bg-blue-50/80 border-l-4 border-l-[#004ac6]'
                            : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                            }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="mt-0.5 shrink-0">
                              {huongXuLy === 'tiep-nhan' ? (
                                <div className="w-4.5 h-4.5 rounded-full bg-[#004ac6] text-white flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[13px]">check</span>
                                </div>
                              ) : (
                                <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 bg-white" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-[12.5px]">
                                  Phương án 1: Tiếp nhận đơn (Thụ lý giải quyết)
                                </span>

                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-[#004ac6] border border-blue-200">
                                  Độ tin cậy: 95.5%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Phương án 2: Chuyển thẩm quyền (Cơ quan CSĐT) */}
                        <div
                          onClick={() => {
                            setHuongXuLy('chuyen');
                            setOfficerNote(
                              'Tài liệu kèm theo có thiết bị ghi âm và lời khai phản ánh dấu hiệu nhận hối lộ, nhũng nhiễu. Đề xuất chuyển hồ sơ sang Cơ quan CSĐT Công an quận Hà Đông / PC03 phối hợp xác minh theo Điều 65 Luật Phòng, chống tham nhũng.'
                            );
                          }}
                          className={`p-3 transition-colors cursor-pointer flex items-start justify-between gap-3 ${huongXuLy === 'chuyen'
                            ? 'bg-purple-50/80 border-l-4 border-l-purple-600'
                            : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                            }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="mt-0.5 shrink-0">
                              {huongXuLy === 'chuyen' ? (
                                <div className="w-4.5 h-4.5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[13px]">check</span>
                                </div>
                              ) : (
                                <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 bg-white" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-[12.5px]">
                                  Phương án 2: Chuyển thẩm quyền (Cơ quan CSĐT Công an)
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                  Độ tin cậy: 89.0%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Phương án 3: Ghép vào hồ sơ đã có */}
                        <div
                          onClick={() => {
                            setHuongXuLy('ghep');
                            setOfficerNote(
                              selectedGhepItem
                                ? `Hồ sơ có nội dung trùng khớp ${selectedGhepItem.matchPercent}% với đơn ${selectedGhepItem.code} (${selectedGhepItem.nguoiNop}). Đề xuất ghép lượt nhận vào hồ sơ ${selectedGhepItem.code} để theo dõi tập trung, bổ sung tài liệu chứng cứ mà không phát sinh mã đơn mới.`
                                : 'Hiện tại Dự án KĐT mới Y đang có Đoàn thanh tra theo QĐ số 89/QĐ-UBND đang tiến hành kiểm tra công tác GPMB. Đề xuất chuyển giao đơn để Đoàn thanh tra kiểm tra, kết luận chung.'
                            );
                          }}
                          className={`p-3 transition-colors cursor-pointer flex items-start justify-between gap-3 ${huongXuLy === 'ghep'
                            ? 'bg-[#fffaf9] border-l-4 border-l-[#a61c1c]'
                            : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                            }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="mt-0.5 shrink-0">
                              {huongXuLy === 'ghep' ? (
                                <div className="w-4.5 h-4.5 rounded-full bg-[#a61c1c] text-white flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[13px]">check</span>
                                </div>
                              ) : (
                                <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 bg-white" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-[12.5px]">
                                  Phương án 3: Ghép vào (Hồ sơ đã có)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5. Ý kiến đề xuất của cán bộ & Các nút hành động */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-700">edit_note</span>
                        <h4 className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
                          5. Ý kiến đề xuất xử lý của cán bộ tiếp nhận
                        </h4>
                      </div>
                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded ${
                          huongXuLy === 'xep-luu'
                            ? 'text-amber-900 bg-amber-100 border border-amber-300'
                            : 'text-slate-700 bg-slate-100'
                        }`}
                      >
                        Đang chọn:{' '}
                        {huongXuLy === 'xep-luu'
                          ? 'Phương án 1 (Không tiếp nhận / Xếp lưu hồ sơ)'
                          : huongXuLy === 'tiep-nhan'
                            ? isNoPetitionElement
                              ? 'Phương án 3 (Ghi đè AI — Tiếp nhận thủ công)'
                              : 'Phương án 1 (Tiếp nhận đơn)'
                            : huongXuLy === 'chuyen'
                              ? 'Phương án 2 (Chuyển thẩm quyền)'
                              : isNoPetitionElement
                                ? 'Phương án 2 (Ghép làm tài liệu bổ sung)'
                                : 'Phương án 3 (Ghép vào)'}
                      </span>
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        value={officerNote}
                        onChange={(e) => setOfficerNote(e.target.value)}
                        placeholder="Nhập ý kiến thẩm tra, đề xuất biện pháp xử lý hoặc ghi chú nghiệp vụ của cán bộ..."
                        maxLength={500}
                        className="w-full p-2.5 bg-slate-50/70 border border-slate-200 rounded text-[12px] font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all resize-none leading-relaxed"
                      />
                      <div className="flex justify-between items-center pt-1 text-[10.5px] text-slate-400">
                        <span>Đã xác nhận dữ liệu OCR và đối chiếu tài liệu gốc</span>
                        <span className="font-mono">{officerNote.length}/500</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => showToast('Đã lưu nháp ý kiến và dữ liệu OCR của lượt nhận.')}
                          className="px-3 py-2 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[15px]">save</span>
                          <span>Lưu nháp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowTaoBaoCaoDeXuatModal(true)}
                          className="px-3.5 py-2 rounded border border-blue-200 bg-blue-50/90 hover:bg-blue-100 text-blue-700 hover:text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                          title="Lập Báo cáo đề xuất hướng xử lý và chuẩn bị luồng trình ký"
                        >
                          <span className="material-symbols-outlined text-[16px] text-blue-600">rate_review</span>
                          <span>Tạo báo cáo đề xuất riêng</span>
                          {activeSigningDoc && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Đã lập
                            </span>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {huongXuLy === 'xep-luu' ? (
                          <button
                            type="button"
                            onClick={() => setShowXepLuuModal(true)}
                            className="px-4 py-2 rounded bg-amber-700 hover:bg-amber-800 active:scale-95 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                            <span>Xác nhận không tiếp nhận / Xếp lưu</span>
                          </button>
                        ) : huongXuLy === 'ghep' ? (
                          <button
                            type="button"
                            onClick={() => setShowGhepModal(true)}
                            className="px-4 py-2 rounded bg-[#a61c1c] hover:bg-[#8b1414] active:scale-95 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">merge_type</span>
                            <span>Xác nhận ghép hồ sơ</span>
                          </button>
                        ) : huongXuLy === 'chuyen' ? (
                          <button
                            type="button"
                            onClick={() => setShowChuyenModal(true)}
                            className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 active:scale-95 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                            <span>Chuyển đơn điều tra</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleConfirmTiepNhan}
                            className="px-4 py-2 rounded bg-[#a61c1c] hover:bg-[#8b1414] active:scale-95 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">task_alt</span>
                            <span>Tiếp nhận &amp; Thụ lý đơn</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL XÁC NHẬN THỰC HIỆN HƯỚNG XỬ LÝ TÀI LIỆU KHÔNG PHẢI LÀ ĐƠN           */}
      {/* ========================================================================= */}
      {showDocActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-fade-in">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">task_alt</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-[15px]">
                    Xác nhận thực hiện phương án xử lý tài liệu
                  </h3>
                  <p className="text-[11.5px] text-blue-900">
                    Mã lượt nhận: <strong className="font-mono">{luotNhan?.id || 'LN-59/2026-GOVEX'}</strong> • Nhánh: Quản lý tài liệu (Không sinh đơn mới)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDocActionModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-blue-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-bold text-slate-900 text-[12px] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#004ac6]">alt_route</span>
                  Phương án xử lý được cán bộ xác nhận:
                </p>
                <p className="text-[12.5px] font-bold text-[#004ac6]">
                  {selectedDocPhuongAn === 'ghep_don'
                    ? `1. Ghép đơn — Ghép làm chứng cứ bổ sung vào Đơn đã tồn tại (${docTargetCode || 'Đ-2026-00125'})`
                    : '2. Tiếp nhận thành tài liệu — Ghi nhận vào Kho Tài liệu tiếp nhận'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pt-1">
                  <li>
                    Không làm thay đổi thông tin gốc của lượt nhận <strong className="font-mono">{luotNhan?.id || 'LN-59/2026-GOVEX'}</strong> và giữ nguyên bản ghi gốc OCR để đối chiếu.
                  </li>
                  <li>
                    Tuyệt đối <strong>không tự động tạo đơn mới</strong> và không khởi chạy quy trình thụ lý giải quyết đơn.
                  </li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900 text-[12px]">
                  Ý kiến xác nhận của cán bộ:
                </label>
                <textarea
                  rows={3}
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50/70 text-[12px] text-slate-800 focus:outline-none focus:bg-white focus:border-[#004ac6] resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Thao tác được ghi nhận vào Nhật ký xử lý tài liệu
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocActionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDocActionModal(false);
                    showToast(
                      selectedDocPhuongAn === 'ghep_don'
                        ? `Đã ghép tài liệu vào Đơn ${docTargetCode || 'Đ-2026-00125'} làm minh chứng bổ sung (Không tạo thêm đơn mới).`
                        : 'Đã tiếp nhận thành Tài liệu tiếp nhận (Không tạo đơn).'
                    );
                  }}
                  className="px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Xác nhận thực hiện</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL XÁC NHẬN KHÔNG TIẾP NHẬN / XẾP LƯU HỒ SƠ (TÀI LIỆU KHÔNG PHẢI ĐƠN)  */}
      {/* ========================================================================= */}
      {showXepLuuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-fade-in">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-[15px]">
                    Xác nhận Không tiếp nhận &amp; Xếp lưu lượt nhận
                  </h3>
                  <p className="text-[11.5px] text-amber-900">
                    Mã lượt nhận: <strong className="font-mono">{luotNhan?.id || 'LN-59/2026-GOVEX'}</strong> • Phân loại AI: Không có yếu tố là đơn (97.4%)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowXepLuuModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-amber-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 text-[12px] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-amber-600">gavel</span>
                  Căn cứ pháp lý &amp; Kết quả kiểm tra tự động:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11.5px] text-slate-600 pl-1">
                  <li>
                    Tài liệu gồm <strong>02 tệp chứng từ thương mại</strong> (Hợp đồng cung ứng vật tư số 18/2026/HĐKT-MK &amp; Bảng báo giá VLXD).
                  </li>
                  <li>
                    Không có tiêu đề đơn thư, không có chủ thể công dân ký đơn, không chứa nội dung khiếu nại / tố cáo / kiến nghị / phản ánh.
                  </li>
                  <li>
                    Căn cứ <strong>Thông tư 05/2021/TT-TTCP</strong>: Tài liệu không đủ điều kiện cấu thành đơn thư thì thực hiện phân loại, xếp lưu theo dõi và kết thúc lượt nhận (không sinh mã đơn thụ lý mới).
                  </li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900 text-[12px]">
                  Lý do phân loại &amp; xếp lưu chính thức:
                </label>
                <select
                  value={lyDoXepLuu}
                  onChange={(e) => setLyDoXepLuu(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-[12px] font-medium text-slate-800 focus:outline-none focus:border-amber-600"
                >
                  <option value="Tài liệu gửi nhầm / Chứng từ thương mại rời không kèm theo văn bản đơn thư">
                    1. Tài liệu gửi nhầm / Chứng từ thương mại rời không kèm theo văn bản đơn thư
                  </option>
                  <option value="Văn bản thông báo, báo giá, quảng cáo hoặc tài liệu tham khảo không có nội dung KNTC/KNPA">
                    2. Văn bản thông báo, báo giá, quảng cáo hoặc tài liệu tham khảo không có nội dung KNTC/KNPA
                  </option>
                  <option value="Tài liệu phô tô rời không xác định được người gửi và không có yêu cầu giải quyết">
                    3. Tài liệu phô tô rời không xác định được người gửi và không có yêu cầu giải quyết
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900 text-[12px]">
                  Ghi chú lưu kho / Biên bản kết thúc lượt nhận:
                </label>
                <textarea
                  rows={3}
                  value={ghiChuXepLuu}
                  onChange={(e) => setGhiChuXepLuu(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50/70 text-[12px] text-slate-800 focus:outline-none focus:bg-white focus:border-amber-600 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Trạng thái sau xác nhận: <strong className="text-slate-800">Đã xếp lưu / Kết thúc lượt nhận</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowXepLuuModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmXepLuu}
                  className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Xác nhận Xếp lưu &amp; Kết thúc</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {
        showCanCuModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-xl">menu_book</span>
                  <h3 className="font-bold text-slate-900 text-base">Căn cứ pháp lý gợi ý xử lý</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCanCuModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
              <div className="text-xs text-slate-700 space-y-2.5">
                <p>
                  <strong>1. Điều 145 Bộ luật Tố tụng Hình sự 2015:</strong> Thẩm quyền và trách nhiệm tiếp nhận, giải quyết tố giác, tin báo về tội phạm.
                </p>
                <p>
                  <strong>2. Thông tư liên tịch 01/2017/TTLT-BCA-BQP-BTC-BNN&amp;PTNT-VKSNDTC:</strong> Phối hợp giữa các cơ quan trong việc tiếp nhận, thụ lý nguồn tin tội phạm.
                </p>
                <p>
                  <strong>3. Điều 174 Bộ luật Hình sự 2015 (sửa đổi 2017):</strong> Tội lừa đảo chiếm đoạt tài sản.
                </p>
              </div>
              <div className="flex justify-end pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCanCuModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* ========================================================================= */}
      {/* MODAL TẠO BÁO CÁO ĐỀ XUẤT HƯỚNG XỬ LÝ RIÊNG                               */}
      {/* ========================================================================= */}
      <TaoBaoCaoDeXuatModal
        isOpen={showTaoBaoCaoDeXuatModal}
        onClose={() => setShowTaoBaoCaoDeXuatModal(false)}
        donInfo={{
          code: currentDonCode,
          luotNhanId: luotNhan?.id || 'LN-2026-0819',
          nguoiNop: extractData?.nguoiGui || luotNhan?.nguoiNop || DEFAULT_TO_CAO_DATA.nguoiGui,
          loaiDon: extractData?.loaiNoiDung || luotNhan?.loaiDon || DEFAULT_TO_CAO_DATA.loaiNoiDung,
          ngayNhan: luotNhan?.ngayNhan || DEFAULT_TO_CAO_DATA.ngayLamDon,
          noiDung: extractData?.noiDungTomTat || luotNhan?.noiDung || DEFAULT_TO_CAO_DATA.noiDungTomTat,
          canBoTiepNhan: currentAccount?.name || 'Nguyễn Minh Anh',
          chucVuCanBo: currentAccount?.role || 'Cán bộ thụ lý',
          donViXuLy: currentAccount?.phongBan || 'Phòng Tiếp công dân & Xử lý đơn',
          diaChi: extractData?.diaChi || luotNhan?.diaChi || DEFAULT_TO_CAO_DATA.diaChi,
          cccd: extractData?.cccd || luotNhan?.cccd || DEFAULT_TO_CAO_DATA.cccd,
        }}
        currentOfficer={{
          name: currentAccount?.name || 'Nguyễn Minh Anh',
          chucVu: currentAccount?.role || 'Cán bộ thụ lý',
          phongBan: currentAccount?.phongBan || 'Phòng Tiếp công dân & Xử lý đơn',
          coQuan: 'UBND quận',
        }}
        initialHuongXuLy={huongXuLy === 'tiep-nhan' ? 'tiep_nhan' : huongXuLy === 'chuyen' ? 'chuyen_tham_quyen' : 'ghep_vao'}
        existingSigningDoc={activeSigningDoc}
        onSaveDraft={handleSaveDraftBaoCaoModal}
        onSubmitToLeader={handleSubmitToLeaderBaoCaoModal}
      />

      {/* ========================================================================= */}
      {/* MODAL BÀN GIAO ĐƠN (STEP-03C)                                             */}
      {/* ========================================================================= */}
      <BanGiaoDonModal
        isOpen={showBanGiaoModal}
        onClose={() => setShowBanGiaoModal(false)}
        onSubmit={handleBanGiaoModalSubmit}
        currentOfficerName="Nguyễn Minh Anh"
        currentDepartmentName="Phòng Tiếp công dân & Xử lý đơn"
        donInfo={{
          code: luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125',
          luotNhanId: luotNhan?.id || 'LN-2026-0819',
          nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
          cccd: extractData.cccd || '001088012345',
          sdt: extractData.sdt || '0983 123 456',
          diaChi: extractData.diaChi || 'Cầu Giấy, Hà Nội',
          loaiDon: extractData.loaiNoiDung || 'Đơn tiếp nhận',
          noiDung: extractData.noiDungTomTat || luotNhan?.noiDung || 'Đơn đề xuất giải quyết vụ việc',
          ngayNhan: luotNhan?.ngayNhan || '16/09/2026',
          suggestedDeptId: 'pc03',
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL TRẢ LẠI ĐƠN (STEP-03D)                                              */}
      {/* ========================================================================= */}
      <TraLaiDonModal
        isOpen={showTraLaiModal}
        onClose={() => setShowTraLaiModal(false)}
        onSubmit={handleTraLaiModalSubmit}
        currentOfficerName="Nguyễn Minh Anh"
        currentDepartmentName="Phòng Tiếp công dân & Xử lý đơn"
        donInfo={{
          code: luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125',
          luotNhanId: luotNhan?.id || 'LN-2026-0819',
          nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
          cccd: extractData.cccd || '001088012345',
          sdt: extractData.sdt || '0983 123 456',
          diaChi: extractData.diaChi || luotNhan?.diaChi || 'Cầu Giấy, Hà Nội',
          loaiDon: extractData.loaiNoiDung || 'Đơn tiếp nhận',
          noiDung: extractData.noiDungTomTat || luotNhan?.noiDung || 'Đơn đề xuất giải quyết vụ việc',
          ngayNhan: luotNhan?.ngayNhan || '16/09/2026',
          hinhThucTiepNhan: luotNhan?.hinhThuc || 'Trực tiếp tại cơ quan',
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL BƯỚC 2: XÁC MINH THÔNG TIN & ĐỀ XUẤT HƯỚNG XỬ LÝ (THEO QUY TRÌNH)  */}
      {/* ========================================================================= */}
      <XacMinhVaDeXuatModal
        isOpen={showXacMinhModal}
        onClose={() => setShowXacMinhModal(false)}
        onSelectHuongXuLy={handleXacMinhSelectHuong}
        onNav={onNav}
        donInfo={{
          code: luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125',
          luotNhanId: luotNhan?.id || 'LN-2026-0819',
          nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
          cccd: extractData.cccd || '001088012345',
          sdt: extractData.sdt || '0983 123 456',
          diaChi: extractData.diaChi || luotNhan?.diaChi || 'Cầu Giấy, Hà Nội',
          loaiDon: extractData.loaiNoiDung || 'Đơn tố cáo',
          noiDung: extractData.noiDungTomTat || luotNhan?.noiDung || 'Tố cáo hành vi vi phạm pháp luật',
          ngayNhan: luotNhan?.ngayNhan || '16/09/2026',
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL THỤ LÝ ĐƠN - BÁO CÁO ĐỀ XUẤT THỤ LÝ (MẪU SỐ 01/TT-TTCP)            */}
      {/* ========================================================================= */}
      <ThuLyDonModal
        isOpen={showThuLyModal}
        onClose={() => setShowThuLyModal(false)}
        onSubmit={handleThuLyModalSubmit}
        onNav={onNav}
        currentOfficerName="Nguyễn Minh Anh"
        currentDepartmentName="Phòng Tiếp công dân & Xử lý đơn"
        donInfo={{
          code: luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125',
          luotNhanId: luotNhan?.id || 'LN-2026-0819',
          nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
          cccd: extractData.cccd || '001088012345',
          sdt: extractData.sdt || '0983 123 456',
          diaChi: extractData.diaChi || luotNhan?.diaChi || 'Cầu Giấy, Hà Nội',
          loaiDon: extractData.loaiNoiDung || 'Đơn tố cáo',
          noiDung: extractData.noiDungTomTat || luotNhan?.noiDung || 'Tố cáo hành vi vi phạm pháp luật',
          ngayNhan: luotNhan?.ngayNhan || '16/09/2026',
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL KHÔNG THỤ LÝ ĐƠN (ĐIỀU 29 LUẬT TỐ CÁO)                             */}
      {/* ========================================================================= */}
      <KhongThuLyModal
        isOpen={showKhongThuLyModal}
        onClose={() => setShowKhongThuLyModal(false)}
        onSubmit={handleKhongThuLySubmit}
        donInfo={{
          code: luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125',
          luotNhanId: luotNhan?.id || 'LN-2026-0819',
          nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
          cccd: extractData.cccd || '001088012345',
          sdt: extractData.sdt || '0983 123 456',
          diaChi: extractData.diaChi || luotNhan?.diaChi || 'Cầu Giấy, Hà Nội',
          loaiDon: extractData.loaiNoiDung || 'Đơn tố cáo',
          noiDung: extractData.noiDungTomTat || luotNhan?.noiDung || 'Tố cáo hành vi vi phạm pháp luật',
          ngayNhan: luotNhan?.ngayNhan || '16/09/2026',
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL YÊU CẦU BỔ SUNG TÀI LIỆU / THÔNG TIN (HẠN 10 NGÀY)                  */}
      {/* ========================================================================= */}
      <ThongBaoBoSungModal
        isOpen={showBoSungModal}
        onClose={() => setShowBoSungModal(false)}
        onSuccess={handleBoSungSubmit}
        workflow={currentWf}
        donCode={luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125'}
        donTitle={extractData.noiDungTomTat || luotNhan?.noiDung || 'Đơn tố cáo'}
        nguoiNop={extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A'}
        loaiDon={extractData.loaiNoiDung || 'Đơn tố cáo'}
      />


      {
        validationErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-md w-full p-6 space-y-4 animate-scale-up">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Chưa đủ điều kiện chuyển</h3>
                  <p className="text-xs text-slate-500 font-label-technical">Quy tắc BR-04 &amp; BR-05</p>
                </div>
              </div>

              <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl text-xs text-red-950 space-y-2">
                <p className="font-semibold text-red-900">
                  Để được chuyển tiếp nhận &amp; xử lý, lượt nhận phải có ít nhất 01 nguồn dữ liệu xử lý:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-red-800">
                  <li><strong>Tệp tài liệu:</strong> Có ít nhất 01 file đơn hoặc tài liệu đính kèm hợp lệ.</li>
                  <li><strong>Ghi chú tiếp nhận:</strong> Có nội dung tóm tắt/ghi chú tiếp nhận hợp lệ.</li>
                </ul>
                <p className="text-[11px] text-red-700 italic pt-1 border-t border-red-200">
                  * Lưu ý: Thông tin người nộp hồ sơ không bắt buộc.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setValidationErrorModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-all"
                >
                  Đã hiểu &amp; Bổ sung thêm
                </button>
              </div>
            </div>
          </div>
        )
      }

      <NguonTraCuuModal
        isOpen={showNguonTraCuuModal}
        onClose={() => setShowNguonTraCuuModal(false)}
        initialTab={nguonTraCuuTab}
        currentDonCode="Đ-2026-00125"
        currentNguoiGui={extractData.nguoiGui || 'Nguyễn Văn A'}
        currentCccd={extractData.cccd || '001088012345'}
        onApplyRecommendation={(recText) => {
          setOfficerNote(recText);
          showToast('✓ Đã áp dụng đề xuất từ nguồn tra cứu vào Ý kiến cán bộ!');
        }}
      />

      <ChuyenTiepNhanModal
        isOpen={showChuyenModal}
        onClose={() => setShowChuyenModal(false)}
        onSubmit={handleChuyenTiepNhanSubmit}
        donInfo={{
          code: luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125',
          loaiDon: extractData.loaiNoiDung || 'Đơn tố giác về tội phạm',
          nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
          ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:15',
          donViHienTai: 'Bộ phận Tiếp nhận đơn (Một cửa)',
          noiDungTomTat: extractData.noiDungTomTat || luotNhan?.noiDung,
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL XÁC NHẬN GHÉP ĐƠN VÀO HỒ SƠ ĐÃ CÓ                                   */}
      {/* ========================================================================= */}
      {
        showGhepModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-2xl">merge_type</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Xác nhận ghép vào hồ sơ đơn đã có</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Lượt nhận: {luotNhan?.id || 'LN-56/2026-GOVEX'} ➔ Đơn đích: {selectedGhepDonCode}
                  </p>
                </div>
              </div>

              {/* Chọn hồ sơ đơn tiếp nhận đích (Dạng Combobox) */}
              <div className="space-y-2">
                <label className="block text-[12.5px] font-semibold text-slate-700">
                  Chọn đơn ghép <span className="text-rose-500 font-bold ml-0.5 text-[12px]">*</span>:
                </label>

                {/* Combobox Dropdown Container */}
                <div className="relative">
                  {/* Trigger Combobox Button */}
                  <button
                    type="button"
                    onClick={() => setIsGhepComboboxOpen(!isGhepComboboxOpen)}
                    className={`w-full flex items-center justify-between p-3 bg-white border rounded-xl text-left transition-all cursor-pointer shadow-2xs ${isGhepComboboxOpen
                      ? 'border-indigo-600 ring-2 ring-indigo-100'
                      : 'border-slate-300 hover:border-slate-400'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      <span className="material-symbols-outlined text-[20px] text-indigo-600 shrink-0">
                        folder_open
                      </span>
                      {selectedGhepItem ? (
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-[13px]">
                              {selectedGhepItem.code}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10.5px] font-semibold">
                              {selectedGhepItem.status}
                            </span>
                            <span
                              className={`px-2 py-0.2 rounded-full text-[10.5px] font-bold border ${selectedGhepItem.matchPercent >= 90
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                            >
                              Trùng {selectedGhepItem.matchPercent}%
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-600 truncate mt-0.5">
                            {selectedGhepItem.title}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[13px]">
                          -- Nhấp chọn hồ sơ đơn cần ghép --
                        </span>
                      )}
                    </div>
                    <span
                      className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform ${isGhepComboboxOpen ? 'rotate-180 text-indigo-600' : ''
                        }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* Dropdown Menu của Combobox */}
                  {isGhepComboboxOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-scale-up">
                      {/* Ô tìm kiếm trong Combobox */}
                      <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">search</span>
                        <input
                          type="text"
                          placeholder="Tìm theo mã đơn, tiêu đề, người nộp..."
                          value={ghepSearchQuery}
                          onChange={(e) => setGhepSearchQuery(e.target.value)}
                          className="w-full bg-transparent text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
                          autoFocus
                        />
                        {ghepSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setGhepSearchQuery('')}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        )}
                      </div>

                      {/* Danh sách options */}
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {filteredGhepList.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400">
                            Không tìm thấy đơn phù hợp
                          </div>
                        ) : (
                          filteredGhepList.map((item) => {
                            const isSelected = selectedGhepDonCode === item.code;
                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setSelectedGhepDonCode(item.code);
                                  setOfficerNote(
                                    `Gói này giống hồ sơ ${item.code} đang mở – ghép vào đó không sinh đơn mới, không tốn số`
                                  );
                                  setGhiChuGhep(
                                    `Ghép lượt nhận vào hồ sơ ${item.code} để theo dõi tập trung, không tạo mã đơn mới.`
                                  );
                                  setIsGhepComboboxOpen(false);
                                }}
                                className={`p-2.5 hover:bg-indigo-50/60 cursor-pointer transition-colors flex items-start gap-2.5 ${isSelected ? 'bg-indigo-50/80' : ''
                                  }`}
                              >
                                <div className="pt-0.5">
                                  {isSelected ? (
                                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="w-4 h-4 rounded-full border border-slate-300 block" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-slate-900 text-[12.5px]">
                                        {item.code}
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold">
                                        {item.status}
                                      </span>
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border shrink-0 ${item.matchPercent >= 90
                                        ? 'bg-rose-100/90 text-rose-800 border-rose-200'
                                        : 'bg-amber-100/90 text-amber-800 border-amber-200'
                                        }`}
                                    >
                                      Trùng {item.matchPercent}%
                                    </span>
                                  </div>
                                  <p className="text-[12px] text-slate-800 font-medium leading-snug line-clamp-1 mt-0.5">
                                    {item.title}
                                  </p>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                                    <span>
                                      Người nộp: <strong className="text-slate-700 font-medium">{item.nguoiNop}</strong>
                                    </span>
                                    <span>
                                      Thụ lý: <strong className="text-slate-700 font-medium">{item.canBoThuLy}</strong>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Thẻ xem tóm tắt & chi tiết đơn đã chọn */}
                {/* {selectedGhepItem && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-2.5">
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-[12.5px]">{selectedGhepItem.code}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 truncate font-medium">Người nộp: {selectedGhepItem.nguoiNop}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 truncate font-medium">Cán bộ: {selectedGhepItem.canBoThuLy}</span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 truncate mt-0.5">{selectedGhepItem.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDonTrungForDrawer(selectedGhepItem);
                      setShowDonTrungDrawer(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-[#004ac6] border border-slate-200 text-[12px] font-medium transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
                    title="Xem chi tiết hồ sơ đơn trong Drawer"
                  >
                    <span className="material-symbols-outlined text-[15px]">visibility</span>
                    <span>Xem chi tiết</span>
                  </button>
                </div>
              )} */}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lý do ghép hồ sơ <span className="text-red-500">*</span>:
                  </label>
                  <select
                    value={lyDoGhep}
                    onChange={(e) => setLyDoGhep(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Bổ sung tài liệu, chứng cứ cho hồ sơ đang thụ lý giải quyết">
                      Bổ sung tài liệu, chứng cứ cho hồ sơ đang thụ lý giải quyết
                    </option>
                    <option value="Đơn gửi nhiều lần trùng người nộp và đối tượng bị phản ánh (đơn trùng)">
                      Đơn gửi nhiều lần trùng người nộp và đối tượng bị phản ánh (đơn trùng)
                    </option>
                    <option value="Đơn cùng nội dung của đồng đứng đơn / người liên quan">
                      Đơn cùng nội dung của đồng đứng đơn / người liên quan
                    </option>
                    <option value="Văn bản giải trình, tài liệu phát sinh mới phục vụ xác minh">
                      Văn bản giải trình, tài liệu phát sinh mới phục vụ xác minh
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ghi chú của cán bộ ghép hồ sơ:
                  </label>
                  <textarea
                    rows={2}
                    value={ghiChuGhep}
                    onChange={(e) => setGhiChuGhep(e.target.value)}
                    placeholder="Nhập ghi chú xử lý ghép hồ sơ..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGhepModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmGhep}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">merge_type</span>
                  <span>Xác nhận ghép hồ sơ</span>
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* ========================================================================= */}
      {/* MODAL ĐỐI CHIẾU CHI TIẾT HỒ SƠ ĐƠN GỐC ĐỂ GHÉP                           */}
      {/* ========================================================================= */}
      {
        showDetailTargetDonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">compare_arrows</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Đối chiếu Lượt nhận &amp; Hồ sơ Đơn gốc</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {luotNhan?.id || 'LN-56/2026-GOVEX'} ⟷ {selectedGhepDonCode}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailTargetDonModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">verified</span>
                  <span>Độ tương đồng nội dung &amp; chủ thể do AI đối soát:</span>
                </div>
                <strong className="text-sm font-bold text-emerald-800">94% (Khuyến nghị Ghép đơn)</strong>
              </div>

              {/* Bảng so sánh đối chiếu */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[11px] uppercase tracking-wider font-semibold">
                      <th className="p-2.5 w-1/4">Tiêu chí so sánh</th>
                      <th className="p-2.5 w-3/8 bg-blue-50/50 text-blue-900">Lượt nhận mới ({luotNhan?.id || 'LN-56'})</th>
                      <th className="p-2.5 w-3/8 bg-indigo-50/50 text-indigo-900">Đơn gốc ({selectedGhepDonCode})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-500">Người đứng đơn</td>
                      <td className="p-2.5">{extractData.nguoiGui || 'Đại diện KDC số 4'}</td>
                      <td className="p-2.5 flex items-center justify-between">
                        <span>Đại diện khu dân cư số 4</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Trùng khớp</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-500">Số CCCD / Định danh</td>
                      <td className="p-2.5 font-mono">{extractData.cccd || '001075018392'}</td>
                      <td className="p-2.5 font-mono flex items-center justify-between">
                        <span>001075018392</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">100%</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-500">Đối tượng bị phản ánh</td>
                      <td className="p-2.5">{extractData.doiTuong || 'Cơ sở tái chế Minh Phát'}</td>
                      <td className="p-2.5 flex items-center justify-between">
                        <span>Cơ sở tái chế Minh Phát</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Trùng khớp</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-500">Địa bàn xảy ra vụ việc</td>
                      <td className="p-2.5">{extractData.diaDiem || 'Quận Cầu Giấy, Hà Nội'}</td>
                      <td className="p-2.5 flex items-center justify-between">
                        <span>Khu dân cư số 4, Cầu Giấy, Hà Nội</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Cùng địa bàn</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-500">Tình trạng thụ lý</td>
                      <td className="p-2.5 text-amber-700 font-medium">Lượt nhận mới tiếp nhận</td>
                      <td className="p-2.5 text-blue-700 font-medium">Đang thụ lý giải quyết (Nguyễn Minh Anh)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-500">Điểm mới bổ sung</td>
                      <td className="p-2.5 text-slate-800" colSpan={2}>
                        Lượt nhận mới cung cấp thêm file <strong>Hợp đồng góp vốn.pdf</strong> và biên bản đo đạc hiện trạng tiếng ồn ban đêm để củng cố chứng cứ cho đơn gốc.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDetailTargetDonModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailTargetDonModal(false);
                    setShowGhepModal(true);
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">merge_type</span>
                  <span>Tiến hành ghép vào đơn này</span>
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* DRAWER XEM CHI TIẾT ĐƠN TRÙNG */}
      <DonTrungDetailDrawer
        isOpen={showDonTrungDrawer}
        onClose={() => setShowDonTrungDrawer(false)}
        donTrung={selectedDonTrungForDrawer}
        currentLuotNhanCode={luotNhan?.id || 'LN-56/2026-GOVEX'}
        currentNguoiGui={extractData.nguoiGui || luotNhan?.nguoiNop || 'Đại diện KDC số 4'}
        currentCccd={extractData.cccd || '001075018392'}
        isSelectedForGhep={selectedGhepDonCode === selectedDonTrungForDrawer?.code}
        isDetermined={hasDeterminedHuongXuLy}
        onSelectForGhep={(item) => {
          setSelectedGhepDonCode(item.code);
          setHuongXuLy('ghep');
          setOfficerNote(`Gói này giống hồ sơ ${item.code} đang mở – ghép vào đó không sinh đơn mới, không tốn số`);
          setGhiChuGhep(`Ghép lượt nhận vào hồ sơ ${item.code} để theo dõi tập trung, không tạo mã đơn mới.`);
          showToast(`✓ Đã chọn hồ sơ ${item.code} để ghép vào lượt nhận này`);
        }}
        onOpenSoSanhChiTiet={(item) => {
          setSelectedGhepDonCode(item.code);
          setShowDonTrungDrawer(false);
          setShowDetailTargetDonModal(true);
        }}
      />

      {/* MODAL VĂN BẢN TRÌNH KÝ LIÊN KẾT TRỰC TIẾP CỦA ĐƠN */}
      {
        showSigningDocModal && activeSigningDoc && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-6xl h-[92vh] max-h-[960px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-indigo-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                    <span className="material-symbols-outlined text-[24px]">contract_edit</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-900/60 border border-blue-700/50 px-2 py-0.5 rounded-md">
                        VĂN BẢN LIÊN KẾT ĐƠN: {activeSigningDoc.hoSoCode || currentDonCode}
                      </span>
                      <span className="text-xs text-slate-300">
                        Số: <strong className="text-white font-mono">{activeSigningDoc.soKyHieu || '01/TTr-TCD'}</strong>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5 truncate max-w-2xl">
                      {activeSigningDoc.tenVanBan}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {activeSigningDoc.status === 'da_ky' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>ĐÃ KÝ DUYỆT PHÊ DUYỆT</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                      <span className="material-symbols-outlined text-[16px] animate-spin">autorenew</span>
                      <span>ĐANG TRÌNH KÝ LÃNH ĐẠO</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowSigningDocModal(false)}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-all"
                    title="Đóng (Vẫn ở lại trên Bàn phân tích của đơn này)"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              {/* Quick Context Banner */}
              <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600 shrink-0">
                <div className="flex items-center gap-4 flex-wrap">
                  <span>
                    <strong className="text-slate-800">Người nộp đơn:</strong> {activeSigningDoc.nguoiGuiDon}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span>
                    <strong className="text-slate-800">Đối tượng:</strong> {extractData.doiTuong || 'Cán bộ vi phạm'}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span>
                    <strong className="text-slate-800">Cán bộ lập tờ trình:</strong> {activeSigningDoc.nguoiLap || 'Nguyễn Minh Anh'}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span>
                    <strong className="text-slate-800">Lãnh đạo phụ trách:</strong> {activeSigningDoc.lanhDaoName} ({activeSigningDoc.lanhDaoChucVu})
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSigningModalTab('van_ban')}
                    className={`px-3 py-1 rounded-md text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${signingModalTab === 'van_ban'
                      ? 'bg-white text-indigo-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">description</span>
                    <span>1. Nội dung Tờ trình &amp; Đính kèm</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSigningModalTab('luong_ky')}
                    className={`px-3 py-1 rounded-md text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${signingModalTab === 'luong_ky'
                      ? 'bg-white text-indigo-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">draw</span>
                    <span>2. Tiến trình Trình ký số &amp; Phê duyệt</span>
                    {activeSigningDoc.status !== 'da_ky' && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    )}
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                {signingModalTab === 'van_ban' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Official Administrative A4 Document Sheet */}
                    <div className="lg:col-span-8 bg-white rounded-xl shadow-md border border-slate-200 p-8 text-slate-800 font-serif leading-relaxed text-sm">
                      {/* Header: Quốc hiệu & Tiêu ngữ */}
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 text-center font-sans text-xs">
                        <div>
                          <p className="font-bold uppercase tracking-wider text-slate-700">UBND THÀNH PHỐ HÀ NỘI</p>
                          <p className="font-bold uppercase text-slate-900">BAN TIẾP CÔNG DÂN</p>
                          <p className="text-slate-500 mt-1">Số: <span className="font-mono font-bold text-slate-800">{activeSigningDoc.soKyHieu || '01/TTr-TCD'}</span></p>
                        </div>
                        <div>
                          <p className="font-bold uppercase text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                          <p className="font-bold underline text-slate-900">Độc lập - Tự do - Hạnh phúc</p>
                          <p className="text-slate-500 italic mt-1">Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="text-center my-6">
                        <h2 className="text-lg font-bold font-sans uppercase text-slate-900 tracking-wide">
                          TỜ TRÌNH
                        </h2>
                        <p className="italic text-slate-700 font-sans text-xs mt-1">
                          Về việc đề xuất thụ lý giải quyết {activeSigningDoc.loaiDon.toLowerCase()}
                        </p>
                        <p className="text-xs text-slate-500 font-sans mt-0.5">
                          (Liên kết hồ sơ đơn: <strong className="text-indigo-700 font-mono">{activeSigningDoc.hoSoCode || currentDonCode}</strong>)
                        </p>
                      </div>

                      {/* Kính gửi */}
                      <div className="mb-4 font-sans text-xs">
                        <p className="font-bold">
                          Kính gửi: <span className="text-slate-900">{activeSigningDoc.lanhDaoName} - {activeSigningDoc.lanhDaoChucVu}</span>
                        </p>
                      </div>

                      {/* Nội dung chi tiết */}
                      <div className="space-y-3.5 text-xs text-justify">
                        <p>
                          Căn cứ Luật Tố cáo năm 2018 (Điều 12, Điều 29 và Điều 30); Căn cứ Nghị định số 31/2019/NĐ-CP ngày 10/4/2019 của Chính phủ quy định chi tiết một số điều của Luật Tố cáo; Căn cứ Thông tư số 05/2021/TT-TTCP ngày 01/10/2021 của Thanh tra Chính phủ quy định quy trình xử lý đơn khiếu nại, đơn tố cáo, đơn kiến nghị, phản ánh.
                        </p>
                        <p>
                          Ban Tiếp công dân thành phố đã tiến hành kiểm tra điều kiện thụ lý và phân tích ban đầu đối với hồ sơ đơn mang mã số <strong>{activeSigningDoc.hoSoCode || currentDonCode}</strong> (Lượt tiếp nhận: {activeSigningDoc.luotNhanId || luotNhan?.id}), do công dân <strong>{activeSigningDoc.nguoiGuiDon}</strong> gửi đến.
                        </p>

                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 font-sans">
                          <p className="font-bold text-slate-900 mb-1">Kết quả kiểm tra 3 điều kiện thụ lý:</p>
                          <ul className="list-disc pl-5 space-y-1 text-slate-700">
                            <li>
                              <strong>Tư cách người đứng đơn:</strong> Đơn có họ tên, địa chỉ, số CCCD rõ ràng, có chữ ký trực tiếp của người tố cáo/khiếu nại; có năng lực hành vi dân sự đầy đủ theo luật định.
                            </li>
                            <li>
                              <strong>Thẩm quyền giải quyết:</strong> Nội dung đơn phản ánh, tố giác hành vi vi phạm của <em>{extractData.doiTuong || 'ông/bà vi phạm'} ({extractData.chucVu || 'Cán bộ'} - {extractData.donVi || 'Đơn vị'})</em> thuộc thẩm quyền xem xét, giải quyết của Chủ tịch UBND Thành phố/Thủ trưởng cơ quan.
                            </li>
                            <li>
                              <strong>Căn cứ &amp; Chứng cứ đính kèm:</strong> Người nộp đơn đã cung cấp tài liệu, hình ảnh, trích sao chứng minh hành vi có dấu hiệu sai phạm, không thuộc trường hợp đơn nặc danh hoặc đã được giải quyết dứt điểm đúng pháp luật.
                            </li>
                          </ul>
                        </div>

                        <p className="font-bold font-sans">Ban Tiếp công dân kính trình Lãnh đạo xem xét, quyết định các nội dung sau:</p>
                        <ol className="list-decimal pl-5 space-y-1.5 font-sans">
                          <li>
                            <strong>Ban hành Quyết định thụ lý</strong> giải quyết đơn số <strong>{activeSigningDoc.hoSoCode || currentDonCode}</strong> theo đúng thời hạn 07 ngày làm việc quy định tại Điều 30 Luật Tố cáo.
                          </li>
                          <li>
                            <strong>Thành lập Tổ xác minh</strong> gồm 03 đồng chí thuộc Phòng Nghiệp vụ 1 để tiến hành thẩm tra, xác minh thực tế nội dung đơn.
                          </li>
                          <li>
                            <strong>Giao Cán bộ thụ lý {activeSigningDoc.nguoiLap || 'Nguyễn Minh Anh'}</strong> thông báo bằng văn bản về việc thụ lý đến người tố cáo và các bên liên quan theo Mẫu quy định.
                          </li>
                        </ol>

                        <p className="italic font-sans text-slate-600 mt-2">
                          (Kính gửi kèm theo: Dự thảo Quyết định thụ lý; Toàn văn đơn gốc scan; Bảng tổng hợp tài liệu, chứng cứ đính kèm).
                        </p>
                      </div>

                      {/* Footer ký tá */}
                      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-200 font-sans text-xs">
                        <div>
                          <p className="font-bold uppercase text-slate-600 text-[11px]">Nơi nhận:</p>
                          <p className="text-slate-500 text-[11px]">- Như kính gửi;</p>
                          <p className="text-slate-500 text-[11px]">- Trưởng ban (để b/c);</p>
                          <p className="text-slate-500 text-[11px]">- Lưu: VT, HS {activeSigningDoc.hoSoCode || currentDonCode}.</p>
                        </div>

                        <div className="text-center flex flex-col items-center">
                          <p className="font-bold uppercase text-slate-800">
                            {activeSigningDoc.status === 'da_ky' ? 'LÃNH ĐẠO PHÊ DUYỆT' : 'CÁN BỘ ĐỀ XUẤT'}
                          </p>
                          <p className="text-slate-500 text-[11px] italic">
                            {activeSigningDoc.status === 'da_ky' ? '(Đã ký số điện tử phê duyệt)' : '(Đã ký số xác thực đề xuất)'}
                          </p>

                          {/* Digital Signature Stamp */}
                          <div className="my-3 p-3 rounded-lg border-2 border-emerald-500 bg-emerald-50/60 text-emerald-800 flex flex-col items-center max-w-xs shadow-xs">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                              <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                              <span>KÝ SỐ XÁC THỰC VGCA</span>
                            </div>
                            <p className="text-[11px] font-bold mt-1 text-center">
                              {activeSigningDoc.status === 'da_ky' ? activeSigningDoc.lanhDaoName : (activeSigningDoc.nguoiLap || 'Nguyễn Minh Anh')}
                            </p>
                            <p className="text-[10px] text-emerald-700 text-center font-mono">
                              {activeSigningDoc.status === 'da_ky' ? 'Token: 5402-9912-8812 • Ban Cơ yếu CP' : 'Token: 0019-8812-4411 • Ban Cơ yếu CP'}
                            </p>
                            <p className="text-[10px] text-emerald-600 text-center mt-0.5">
                              Thời gian: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          <p className="font-bold text-slate-900 text-xs">
                            {activeSigningDoc.status === 'da_ky' ? activeSigningDoc.lanhDaoName : (activeSigningDoc.nguoiLap || 'Nguyễn Minh Anh')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Linked Petition Info & Attached Documents */}
                    <div className="lg:col-span-4 space-y-4">
                      {/* Card 1: Thông tin liên kết đơn */}
                      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-indigo-600">link</span>
                            <span>Hồ sơ đơn liên kết</span>
                          </h4>
                          <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                            {activeSigningDoc.hoSoCode || currentDonCode}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2 text-xs">
                          <div>
                            <span className="text-slate-500">Người đứng đơn:</span>
                            <p className="font-bold text-slate-800">{activeSigningDoc.nguoiGuiDon}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Phân loại đơn:</span>
                            <p className="font-semibold text-slate-700">{activeSigningDoc.loaiDon}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Đối tượng phản ánh/tố cáo:</span>
                            <p className="font-semibold text-rose-700">{extractData.doiTuong || 'Cán bộ vi phạm'}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Tóm tắt nội dung:</span>
                            <p className="text-slate-600 text-[11px] line-clamp-3 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                              {extractData.noiDungTomTat || luotNhan?.noiDung || 'Đơn phản ánh sai phạm trong quản lý và thực thi công vụ.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Tài liệu đính kèm của đơn */}
                      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-amber-600">attach_file</span>
                            <span>Tài liệu đính kèm ({activeSigningDoc.tepDinhKem?.length || 3})</span>
                          </h4>
                          <span className="text-[10px] text-slate-400">Tự động liên kết</span>
                        </div>

                        <div className="mt-3 space-y-2">
                          {activeSigningDoc.tepDinhKem && activeSigningDoc.tepDinhKem.length > 0 ? (
                            activeSigningDoc.tepDinhKem.map((file, idx) => (
                              <div
                                key={file.id || idx}
                                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="material-symbols-outlined text-[18px] text-indigo-600 shrink-0">
                                    {file.tenTep.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate" title={file.tenTep}>
                                      {file.tenTep}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {file.dungLuong} • {file.loai === 'du_thao' ? 'Dự thảo văn bản' : 'Chứng cứ đơn gốc'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => showToast(`Đang mở xem tệp: ${file.tenTep}`)}
                                  className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-white cursor-pointer"
                                  title="Xem trước tài liệu"
                                >
                                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                                </button>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[18px] text-indigo-600">description</span>
                                  <div>
                                    <p className="text-xs font-bold text-slate-800">To_trinh_thu_ly_{currentDonCode}.docx</p>
                                    <p className="text-[10px] text-slate-500">1.8 MB • Dự thảo văn bản</p>
                                  </div>
                                </div>
                              </div>
                              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[18px] text-indigo-600">description</span>
                                  <div>
                                    <p className="text-xs font-bold text-slate-800">Du_thao_Quyet_dinh_thu_ly_{currentDonCode}.docx</p>
                                    <p className="text-[10px] text-slate-500">1.2 MB • Dự thảo văn bản</p>
                                  </div>
                                </div>
                              </div>
                              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[18px] text-rose-600">picture_as_pdf</span>
                                  <div>
                                    <p className="text-xs font-bold text-slate-800">Don_goc_cong_dan_scan.pdf</p>
                                    <p className="text-[10px] text-slate-500">4.6 MB • Chứng cứ đính kèm</p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Card 3: Thao tác ký duyệt nhanh nếu đang là Lãnh đạo hoặc cán bộ kiểm tra */}
                      {activeSigningDoc.status !== 'da_ky' ? (
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200 shadow-xs">
                          <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                            <span className="material-symbols-outlined text-[18px] text-indigo-600">draw</span>
                            <span>Ký số phê duyệt Tờ trình</span>
                          </h4>
                          <p className="text-xs text-indigo-800 leading-relaxed mb-3">
                            Lãnh đạo <strong>{activeSigningDoc.lanhDaoName}</strong> có thể phê duyệt và ký số chứng thư điện tử VGCA ngay tại đơn này:
                          </p>

                          <div className="mb-3">
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              Ý kiến chỉ đạo / Ghi chú phê duyệt:
                            </label>
                            <textarea
                              value={signingNoteInput}
                              onChange={(e) => setSigningNoteInput(e.target.value)}
                              rows={2}
                              placeholder="Đồng ý thụ lý giải quyết. Giao Tổ xác minh khẩn trương thực hiện..."
                              className="w-full text-xs p-2 rounded-lg border border-indigo-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <button
                            type="button"
                            disabled={isSigningSubmitting}
                            onClick={() => handleQuickSignDocument(activeSigningDoc, signingNoteInput)}
                            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-200 cursor-pointer flex items-center justify-center gap-2 transition-all"
                          >
                            {isSigningSubmitting ? (
                              <>
                                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                                <span>Đang xác thực chứng thư VGCA...</span>
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-[18px]">verified</span>
                                <span>Ký số phê duyệt Tờ trình ngay</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-xs text-emerald-900">
                          <div className="flex items-center gap-2 font-bold mb-1">
                            <span className="material-symbols-outlined text-[18px] text-emerald-600">task_alt</span>
                            <span>Tờ trình đã được ký duyệt</span>
                          </div>
                          <p className="text-emerald-800 text-[11px]">
                            Văn bản đã có đầy đủ chữ ký số của Cán bộ thụ lý và Lãnh đạo phê duyệt. Đơn đã đủ điều kiện để ban hành Quyết định thụ lý và thành lập Tổ xác minh.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Tab 2: Tiến trình luồng ký số & Lịch sử phê duyệt */
                  <div className="space-y-6">
                    {/* Step Diagram */}
                    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-indigo-600">linear_scale</span>
                        <span>Luồng ký số tuần tự của hồ sơ đơn</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Step 1 */}
                        <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full">
                              Bước 1: Cán bộ lập
                            </span>
                            <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                          </div>
                          <p className="font-bold text-slate-900 text-sm">{activeSigningDoc.nguoiLap || 'Nguyễn Minh Anh'}</p>
                          <p className="text-xs text-slate-500">Cán bộ Ban Tiếp công dân</p>
                          <div className="mt-3 pt-2 border-t border-emerald-200 text-[11px] text-emerald-800">
                            <p className="font-semibold">✓ Đã ký số xác thực đề xuất</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Chứng thư: VGCA - Ban Cơ yếu CP</p>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className={`p-4 rounded-xl border-2 relative ${activeSigningDoc.status === 'da_ky'
                          ? 'border-emerald-500 bg-emerald-50/40'
                          : 'border-amber-400 bg-amber-50/40'
                          }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${activeSigningDoc.status === 'da_ky'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-800'
                              }`}>
                              Bước 2: Lãnh đạo thẩm tra
                            </span>
                            <span className="material-symbols-outlined text-[18px] text-amber-600">
                              {activeSigningDoc.status === 'da_ky' ? 'verified' : 'hourglass_top'}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 text-sm">{activeSigningDoc.lanhDaoName}</p>
                          <p className="text-xs text-slate-500">{activeSigningDoc.lanhDaoChucVu}</p>
                          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px]">
                            {activeSigningDoc.status === 'da_ky' ? (
                              <p className="font-semibold text-emerald-800">✓ Đã ký số phê duyệt</p>
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="text-amber-800 font-semibold">Đang chờ ký số...</span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickSignDocument(activeSigningDoc)}
                                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold cursor-pointer"
                                >
                                  Ký duyệt ngay
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-70">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-200 px-2 py-0.5 rounded-full">
                              Bước 3: Ban hành Quyết định
                            </span>
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">gavel</span>
                          </div>
                          <p className="font-bold text-slate-800 text-sm">Chánh Thanh tra thành phố</p>
                          <p className="text-xs text-slate-500">Thủ trưởng cơ quan có thẩm quyền</p>
                          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                            {activeSigningDoc.status === 'da_ky'
                              ? 'Sẵn sàng ban hành Quyết định thụ lý'
                              : 'Chờ sau khi Lãnh đạo thẩm tra ký duyệt'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Audit Logs */}
                    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-slate-600">history</span>
                        <span>Nhật ký luồng ký &amp; Ý kiến chỉ đạo (Audit Trail)</span>
                      </h4>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                              <th className="py-2.5 px-3 font-semibold">Thời gian</th>
                              <th className="py-2.5 px-3 font-semibold">Người thực hiện</th>
                              <th className="py-2.5 px-3 font-semibold">Vai trò</th>
                              <th className="py-2.5 px-3 font-semibold">Hành động</th>
                              <th className="py-2.5 px-3 font-semibold">Ý kiến / Ghi chú</th>
                              <th className="py-2.5 px-3 font-semibold">Chứng thư số</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {activeSigningDoc.auditLogs && activeSigningDoc.auditLogs.length > 0 ? (
                              activeSigningDoc.auditLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                  <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{log.time}</td>
                                  <td className="py-2.5 px-3 font-bold text-slate-900">{log.actor}</td>
                                  <td className="py-2.5 px-3 text-slate-600">{log.actorRole}</td>
                                  <td className="py-2.5 px-3">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-700 italic">{log.note || '—'}</td>
                                  <td className="py-2.5 px-3 font-mono text-[10px] text-emerald-700">{log.signatureCert || 'VGCA'}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td className="py-2.5 px-3 font-mono text-slate-600">Hôm nay 10:15</td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">Nguyễn Minh Anh</td>
                                <td className="py-2.5 px-3 text-slate-600">Cán bộ thụ lý</td>
                                <td className="py-2.5 px-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    Lập tờ trình &amp; Trình ký
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 italic">Trình Lãnh đạo xem xét phê duyệt</td>
                                <td className="py-2.5 px-3 font-mono text-[10px] text-emerald-700">VGCA - Ban Cơ yếu CP</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Đang kết nối máy in văn phòng...');
                      window.print();
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>In Tờ trình</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast(`✓ Đã tải tệp To_trinh_thu_ly_${activeSigningDoc.hoSoCode || currentDonCode}.pdf`)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Tải PDF đã ký</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {activeSigningDoc.status !== 'da_ky' && (
                    <button
                      type="button"
                      disabled={isSigningSubmitting}
                      onClick={() => handleQuickSignDocument(activeSigningDoc)}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-200 cursor-pointer flex items-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">draw</span>
                      <span>Ký số phê duyệt Tờ trình</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowSigningDocModal(false)}
                    className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer transition-all"
                  >
                    Đóng (Ở lại bàn phân tích)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {
        showDanhSachDongNguoiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#004ac6] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-headline-md">
                      Danh sách người đứng đơn &amp; người cùng ký tên
                    </h3>
                    <p className="text-xs text-slate-500">
                      Hồ sơ {luotNhan?.id || 'LN-2025-0105'} • Trích xuất đối soát từ bản scan chữ ký đính kèm
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDanhSachDongNguoiModal(false)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Modal Body: Bảng danh sách phẳng chuẩn hành chính */}
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Phân loại chủ thể:</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                      Đơn tập thể / Đồng đứng tên
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">Theo Điều 8 Luật Khiếu nại (có cử người đại diện)</span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11.5px]">
                    Cập nhật từ AI OCR lúc 10:24
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-12">STT</th>
                        <th className="py-2.5 px-3">Họ và tên</th>
                        <th className="py-2.5 px-3 text-center w-20">Năm sinh</th>
                        <th className="py-2.5 px-3">Số định danh CCCD</th>
                        <th className="py-2.5 px-3">Số điện thoại</th>
                        <th className="py-2.5 px-3">Địa chỉ thường trú</th>
                        <th className="py-2.5 px-3 text-center">Vai trò</th>
                        <th className="py-2.5 px-3 text-center w-24">Chữ ký</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      <tr className="bg-blue-50/40 hover:bg-blue-50/70 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-blue-700">1</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{extractData.nguoiGui}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-blue-100 text-blue-700">Đại diện</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{extractData.namSinh}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{extractData.cccd}</td>
                        <td className="py-2.5 px-3 font-mono">{extractData.sdt}</td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]" title={extractData.diaChi}>{extractData.diaChi}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-[#004ac6]">Người đại diện chính</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Có chữ ký
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-500">2</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {extractData.dongNguoiGui || 'Trần Thị C'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">1991</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{extractData.cccdDongNguoiGui || '001190028391'}</td>
                        <td className="py-2.5 px-3 font-mono">0912 345 678</td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]" title={extractData.diaChi}>{extractData.diaChi}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">Đồng đứng đơn</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Có chữ ký
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-500">3</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Lê Văn Hùng</td>
                        <td className="py-2.5 px-3 text-center font-mono">1980</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">001080019283</td>
                        <td className="py-2.5 px-3 font-mono">0988 123 456</td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]">Tổ dân phố số 4, Cầu Giấy, Hà Nội</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">Đồng ký tên</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Có chữ ký
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-500">4</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Phạm Thị Mai</td>
                        <td className="py-2.5 px-3 text-center font-mono">1985</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">001085028371</td>
                        <td className="py-2.5 px-3 font-mono">0904 567 890</td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]">Tổ dân phố số 4, Cầu Giấy, Hà Nội</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">Đồng ký tên</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Có chữ ký
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-500">5</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Đỗ Quang Tuấn</td>
                        <td className="py-2.5 px-3 text-center font-mono">1978</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">001078038492</td>
                        <td className="py-2.5 px-3 font-mono">0913 222 333</td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]">Tổ dân phố số 4, Cầu Giấy, Hà Nội</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">Đồng ký tên</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Có chữ ký
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-500">6</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Vũ Minh Hạnh</td>
                        <td className="py-2.5 px-3 text-center font-mono">1989</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">001089018273</td>
                        <td className="py-2.5 px-3 font-mono">0977 444 555</td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]">Tổ dân phố số 4, Cầu Giấy, Hà Nội</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">Đồng ký tên</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Có chữ ký
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-600 font-medium">
                  Tổng cộng: <strong>6 công dân</strong> (1 đại diện liên hệ chính, 5 đồng ký tên)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Đang kết xuất tệp Excel danh sách công dân đồng đứng đơn...');
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">file_download</span>
                    <span>Xuất Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDanhSachDongNguoiModal(false)}
                    className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer transition-all"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}