import React, { useState, useEffect, useMemo } from 'react';
import { LuotNhan, Screen, UploadedFile, TruongHopTrinhDien, AIAnalysisState, AIDataSourceType, AIAnalysisVersion } from '../types';
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
import { getSuggestedActionsForWorkflow } from '../components/workflow/QuyTrinhSuggestedActions';
import { SigningDocument, CurrentUserAccount } from '../types/signing';
import { INITIAL_LEADERS } from '../constants/signingData';
import DonTrungDetailDrawer, { DonTrungItem } from '../components/modals/DonTrungDetailDrawer';
import { TuDonAnalysisBlocks } from '../components/analysis/TuDonAnalysisBlocks';

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
  // ─── 1. TRẠNG THÁI AI ĐA NGUỒN DỮ LIỆU (Multi-Source AI Model) ──────────────────
  const [aiState, setAiState] = useState<'none' | 'reading' | 'done'>('done');
  const [readingProgress, setReadingProgress] = useState<number>(100);
  const [isSimulating, setIsSimulating] = useState(false);
  const [aiStepIndex, setAiStepIndex] = useState<number>(6); // 1..6 (BR-11)

  // 6 TRẠNG THÁI AI THEO YÊU CẦU GOVEX MỤC E
  const [aiAnalysisState, setAiAnalysisState] = useState<AIAnalysisState>(() => {
    if (luotNhan?.aiAnalysisState) return luotNhan.aiAnalysisState;
    if (luotNhan?.files && luotNhan.files.length > 0) return 'da_cap_nhat';
    if (luotNhan?.noiDung && luotNhan.noiDung.trim().length > 10) return 'phan_tich_so_bo';
    return 'chua_du_du_lieu';
  });
  const [aiVersion, setAiVersion] = useState<number>(() => {
    return (luotNhan?.files && luotNhan.files.length > 0) ? 2 : 1;
  });
  const [officerConfirmedAI, setOfficerConfirmedAI] = useState<boolean>(false);
  const [officerConfirmedAt, setOfficerConfirmedAt] = useState<string>('');
  const [officerReviewNote, setOfficerReviewNote] = useState<string>('');

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

  // Phân định nghiệp vụ Tiếp nhận Bắt người phạm tội quả tang (Điều 111 BLTTHS 2015)
  const isBatQuaTang = useMemo(() => {
    return Boolean(
      luotNhan?.loaiNghiepVu === 'bat_qua_tang' ||
      luotNhan?.id?.startsWith('QT-') ||
      luotNhan?.noiDung?.toLowerCase().includes('bắt quả tang') ||
      luotNhan?.noiDung?.toLowerCase().includes('bắt người phạm tội quả tang')
    );
  }, [luotNhan]);

  // Phân định nghiệp vụ Cán bộ / Cơ quan trực tiếp phát hiện (Khoản 3 Điều 143 BLTTHS 2015)
  const isCanBoPhatHien = useMemo(() => {
    return Boolean(
      luotNhan?.loaiNghiepVu === 'can_bo_phat_hien' ||
      luotNhan?.id?.startsWith('PH-') ||
      luotNhan?.noiDung?.toLowerCase().includes('cán bộ trực tiếp phát hiện') ||
      luotNhan?.noiDung?.toLowerCase().includes('tuần tra kiểm soát')
    );
  }, [luotNhan]);

  // Phân định nghiệp vụ Tiếp nhận Người tự thú / Đầu thú (Mục 12)
  const isTuThuDauThu = useMemo(() => {
    if (isBatQuaTang || isCanBoPhatHien) return false;
    return Boolean(
      luotNhan?.loaiNghiepVu === 'nguoi_tu_thu' ||
      luotNhan?.loaiNghiepVu === 'nguoi_dau_thu' ||
      luotNhan?.id?.startsWith('TT-') ||
      luotNhan?.id?.startsWith('DT-') ||
      luotNhan?.truongHopTrinhDien ||
      luotNhan?.loaiDon?.toLowerCase().includes('tự thú') ||
      luotNhan?.loaiDon?.toLowerCase().includes('đầu thú')
    );
  }, [luotNhan, isBatQuaTang, isCanBoPhatHien]);

  const isDauThuItem = useMemo(() => {
    return Boolean(
      luotNhan?.loaiNghiepVu === 'nguoi_dau_thu' ||
      luotNhan?.truongHopTrinhDien === 'dau_thu' ||
      luotNhan?.id?.startsWith('DT-')
    );
  }, [luotNhan]);

  // ─── 2 TRƯỜNG HỢP TIẾP NHẬN & PHÂN TÍCH AI (GOVEX CORE WORKFLOW) ───────────────
  // Trường hợp 1: 'tu_don' -> Người nộp/Cán bộ nhập thông tin và TẢI FILE (đơn scan, tài liệu đính kèm, OCR bóc tách văn bản)
  // Trường hợp 2: 'tin_bao_to_giac' -> Tiếp nhận tin báo, tố giác tội phạm: CÓ THỂ KHÔNG ĐỦ THÔNG TIN, TÀI LIỆU ban đầu (NLP ghi nhận trực tiếp, không ép buộc có file)
  const defaultTruongHopPhanTich = useMemo<'tu_don' | 'tin_bao_to_giac'>(() => {
    if (
      isTuThuDauThu ||
      isBatQuaTang ||
      isCanBoPhatHien ||
      luotNhan?.loaiNghiepVu === 'tin_bao_to_giac' ||
      luotNhan?.loaiNghiepVu === 'tin_bao_toi_pham' ||
      luotNhan?.loaiNghiepVu === 'to_giac_toi_pham' ||
      luotNhan?.id?.startsWith('TB-') ||
      luotNhan?.loaiDon?.toLowerCase().includes('tố giác') ||
      luotNhan?.loaiDon?.toLowerCase().includes('tin báo') ||
      luotNhan?.noiDung?.toLowerCase().includes('tố giác') ||
      luotNhan?.noiDung?.toLowerCase().includes('lừa đảo')
    ) {
      return 'tin_bao_to_giac';
    }
    return 'tu_don';
  }, [isTuThuDauThu, isBatQuaTang, isCanBoPhatHien, luotNhan]);

  const [truongHopPhanTich, setTruongHopPhanTich] = useState<'tu_don' | 'tin_bao_to_giac'>(defaultTruongHopPhanTich);

  useEffect(() => {
    setTruongHopPhanTich(defaultTruongHopPhanTich);
  }, [defaultTruongHopPhanTich]);

  // Phân định nghiệp vụ Tiếp nhận Tin báo / Tố giác tội phạm
  const isTinBaoToGiac = useMemo(() => {
    if (truongHopPhanTich === 'tu_don') return false;
    if (isTuThuDauThu || isBatQuaTang || isCanBoPhatHien) return false;
    return true;
  }, [truongHopPhanTich, isTuThuDauThu, isBatQuaTang, isCanBoPhatHien]);

  // Cán bộ xác nhận phân loại Tự thú vs Đầu thú (Mục 12.6.3)
  const [truongHopConfirmed, setTruongHopConfirmed] = useState<TruongHopTrinhDien>(
    (luotNhan?.truongHopTrinhDien as TruongHopTrinhDien) || (isDauThuItem ? 'dau_thu' : 'tu_thu')
  );
  const [lyDoXacNhanPhanLoai, setLyDoXacNhanPhanLoai] = useState<string>(
    luotNhan?.lyDoPhanLoai ||
    (isDauThuItem
      ? 'Đối tượng đã có Quyết định truy nã số 14/QĐ-CQĐT ngày 02/08/2026, ra trình diện sau khi hành vi và danh tính đã bị cơ quan điều tra phát hiện -> Phân loại chính thức: Người đầu thú.'
      : 'Hành vi trộm cắp kho bãi tại CCN Thanh Oai chưa bị cơ quan điều tra phát hiện, người phạm tội tự nguyện đến trình diện trước khi có đơn tố giác -> Phân loại chính thức: Người tự thú.')
  );

  // Checklist các bước nghiệp vụ tố tụng người tự thú / đầu thú (Mục 12.6.6)
  const [tuThuChecklist, setTuThuChecklist] = useState<Record<string, boolean>>({
    bbNhan: true,
    bbNiemPhong: true,
    tbVksnd: false,
    khamYTe: Boolean(luotNhan?.canhBaoAnToan?.canHoTroYTe),
    phanCongDTV: true,
  });

  const [showVksndModal, setShowVksndModal] = useState<boolean>(false);

  // Bộ lọc 4 trạng thái bóc tách thông tin AI (Mục 5.2)
  const [activeExtractTab, setActiveExtractTab] = useState<'all' | 'high' | 'low' | 'unknown' | 'conflict'>('all');

  // Checklist xác minh nghiệp vụ theo Điều 147 BLTTHS (Mục 5.4)
  const [xacMinhChecklist, setXacMinhChecklist] = useState<Record<string, boolean>>({
    xm1: true,
    xm2: false,
    xm3: false,
    xm4: true,
  });

  // Trạng thái cán bộ xác nhận đối soát hồ sơ liên quan (Mục 5.3)
  const [confirmedRelatedCases, setConfirmedRelatedCases] = useState<Record<string, boolean>>({
    'dt-1': false,
    'dt-2': false,
    'dt-3': false,
  });

  // Quản lý tệp bổ sung tại chỗ
  const [extraUploadedFiles, setExtraUploadedFiles] = useState<UploadedFile[]>([]);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState<boolean>(false);
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);

  // Tab điều hướng cột trái: "noi_dung" (Ghi nhận trực tiếp / Lời khai) vs "tai_lieu" (Tệp số hóa / OCR)
  const hasRealUploadedFiles = Boolean(
    (luotNhan?.files && luotNhan.files.length > 0) || extraUploadedFiles.length > 0 || truongHopPhanTich === 'tu_don'
  );
  const [leftPaneTab, setLeftPaneTab] = useState<'noi_dung' | 'tai_lieu'>(() => {
    return defaultTruongHopPhanTich === 'tu_don' ? 'tai_lieu' : 'noi_dung';
  });

  // ─── ĐIỀU KIỆN THỤ LÝ & HƯỚNG XỬ LÝ ĐƠN THƯ (TRƯỜNG HỢP 1: TỪ ĐƠN) ───────────
  const [checklistDieuKienThuLy, setChecklistDieuKienThuLy] = useState<Record<string, boolean>>({
    coChuKy: true,
    dungThamQuyen: true,
    conThoiHieu: true,
    duTaiLieuChungCu: true,
  });
  const [huongXuLyDonThu, setHuongXuLyDonThu] = useState<'thu_ly' | 'chuyen_don' | 'huong_dan' | 'luu_don'>('thu_ly');
  const [officerNoteDonThu, setOfficerNoteDonThu] = useState<string>(
    'Đơn phản ánh tranh chấp ranh giới ngõ đi chung đủ điều kiện tiếp nhận ban đầu. Đề xuất: Tiếp nhận và chuyển UBND phường Nghĩa Đô tổ chức hòa giải cơ sở theo quy định tại Điều 202 Luật Đất đai.'
  );
  const [checklistXacMinhDonThu, setChecklistXacMinhDonThu] = useState<Record<string, boolean>>({
    xm1: true,
    xm2: false,
    xm3: false,
    xm4: false,
  });

  const handleChangeTruongHop = (mode: 'tu_don' | 'tin_bao_to_giac') => {
    setTruongHopPhanTich(mode);
    if (mode === 'tu_don') {
      setLeftPaneTab('tai_lieu');
      setAiAnalysisState('da_cap_nhat');
      setAiVersion(2);
      setSelectedFileIndex(0);
      showToast('Đã chuyển sang Trường hợp 1: Từ đơn (Đã có tệp scan & bóc tách OCR)');
    } else {
      setLeftPaneTab('noi_dung');
      setAiAnalysisState('phan_tich_so_bo');
      setAiVersion(1);
      setSelectedFileIndex(0);
      showToast('Đã chuyển sang Trường hợp 2: Tiếp nhận tin báo, tố giác (Có thể thiếu tài liệu)');
    }
  };

  // Nội dung ghi nhận ban đầu do cán bộ nhập trực tiếp
  const [directDescriptionInput, setDirectDescriptionInput] = useState<string>(
    luotNhan?.dienBienSuViec || luotNhan?.noiDung || ''
  );
  const [tangVatDirectInput, setTangVatDirectInput] = useState<string>(
    luotNhan?.tangVatThuGiu || luotNhan?.doVatGiaoNop || ''
  );
  const [diaDiemDirectInput, setDiaDiemDirectInput] = useState<string>(
    luotNhan?.diaDiemSuViec || luotNhan?.diaChi || ''
  );
  const [thoiGianDirectInput, setThoiGianDirectInput] = useState<string>(
    luotNhan?.thoiGianSuViec || luotNhan?.ngayNhan || ''
  );

  // PDF Viewer Controls & Danh sách tài liệu tải lên thực tế
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Danh sách tệp thực tế: Phân định theo 2 trường hợp tiếp nhận
  const currentFiles: UploadedFile[] = useMemo(() => {
    const combined = [...(luotNhan?.files || []), ...extraUploadedFiles];
    if (combined.length > 0) return combined;
    if (truongHopPhanTich === 'tu_don') {
      // Trường hợp 1: Từ đơn -> user nhập thông tin và tải file tài liệu đính kèm
      if (luotNhan?.id?.includes('LN-58')) {
        return [
          { name: 'Don_phan_anh_tranh_chap_dat_dai_DoVietThang.pdf', size: '2.4 MB', category: 'main' },
          { name: 'Trich_luc_so_do_dia_chinh_thua_dat_ngo_di_chung.pdf', size: '1.8 MB', category: 'attach' },
          { name: 'Bien_ban_hoa_giai_co_so_To_dan_pho.pdf', size: '1.1 MB', category: 'attach' },
        ];
      }
      return [
        { name: 'Don_khieu_nai_phan_anh_ban_scan_chinh.pdf', size: '2.1 MB', category: 'main' },
        { name: 'Tai_lieu_giay_to_phap_ly_kem_theo.pdf', size: '1.5 MB', category: 'attach' },
      ];
    }
    if (isTuThuDauThu) {
      // Với tự thú / đầu thú, có biên bản Mẫu 02-BCA lập tại cơ quan
      return isDauThuItem
        ? [
          { name: 'Bien_ban_tiep_nhan_nguoi_dau_thu_02_BCA.pdf', size: '1.4 MB', category: 'main' },
          { name: 'Quyet_dinh_truy_na_so_14.pdf', size: '0.9 MB', category: 'attach' },
        ]
        : [
          { name: 'Bien_ban_tiep_nhan_nguoi_tu_thu_02_BCA.pdf', size: '1.6 MB', category: 'main' },
          { name: 'Ban_tu_khai_loi_nhan_toi.pdf', size: '1.2 MB', category: 'attach' },
        ];
    }
    // Trường hợp 2: Với tiếp nhận tin báo tố giác -> có thể KHÔNG ĐỦ tài liệu ban đầu -> Danh sách tệp rỗng hợp lệ
    return [];
  }, [luotNhan?.files, extraUploadedFiles, truongHopPhanTich, luotNhan?.id, isTuThuDauThu, isDauThuItem]);

  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const activeFile = currentFiles[selectedFileIndex] || currentFiles[0];
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);

  useEffect(() => {
    setSelectedFileIndex(0);
  }, [luotNhan?.id]);

  // Dữ liệu đơn trùng phục vụ đối soát CSDL và chọn đơn ghép
  const DON_TRUNG_LIST: DonTrungItem[] = [
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
      tieuChiDoiChieu: 'Trùng CCCD & Cùng đối tượng bị phản ánh',
      nguonDuLieu: 'CSDL Đơn thư GOVEX (Phân hệ Tiếp nhận)',
      truongDoiChieu: ['CCCD: 001075018392', 'Đối tượng: Cơ sở tái chế Minh Phát', 'Địa bàn: TDP số 4, Cầu Giấy'],
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
      tags: ['Cùng đối tượng', 'Cùng địa bàn'],
      tieuChiDoiChieu: 'Cùng đối tượng bị phản ánh & Cùng địa bàn lấn chiếm',
      nguonDuLieu: 'CSDL An ninh trật tự CATP Hà Nội',
      truongDoiChieu: ['Đối tượng: Minh Phát & Chủ cơ sở', 'Địa bàn: Số 12 ngõ 45 Cầu Giấy', 'Hành vi: Xả khói bụi'],
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
      tags: ['Cùng đối tượng', 'Cùng khu dân cư'],
      tieuChiDoiChieu: 'Đồng đứng đơn KDC số 4 & Cùng đối tượng',
      nguonDuLieu: 'CSDL Quản lý Đơn thư GOVEX',
      truongDoiChieu: ['Người đứng đơn: Trần Thị C (Đồng đứng đơn)', 'Đối tượng: Cơ sở tái chế Minh Phát'],
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
      tags: ['Cùng người đứng đơn', 'Lịch sử đơn thư'],
      tieuChiDoiChieu: 'Trùng người đứng đơn (Lịch sử giải quyết đơn trước đây)',
      nguonDuLieu: 'CSDL Thanh tra Thành phố',
      truongDoiChieu: ['CCCD: 001075018392', 'Họ tên: Đại diện KDC số 4'],
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
  const [showAllDonTrung, setShowAllDonTrung] = useState<boolean>(false);
  const [selectedDonTrungForDrawer, setSelectedDonTrungForDrawer] = useState<DonTrungItem | null>(null);
  const [showDonTrungDrawer, setShowDonTrungDrawer] = useState<boolean>(false);
  const [isGhepComboboxOpen, setIsGhepComboboxOpen] = useState<boolean>(false);
  const [ghepSearchQuery, setGhepSearchQuery] = useState<string>('');

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
    'Gói này giống hồ sơ DS-29/2026-GOVEX đang mở – ghép vào đó không sinh đơn mới, không tốn số'
  );
  const [huongXuLy, setHuongXuLy] = useState<
    'tiep-nhan' | 'ghep' | 'ban-giao' | 'tra-lai' | 'yeu-cau-bo-sung' | 'khong-thu-ly'
  >('ghep');
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

  // Chỉnh sửa trực tiếp dạng text cho Khối 2: Thông tin trích xuất từ đơn
  const [isEditingExtract, setIsEditingExtract] = useState<boolean>(false);
  const [extractData, setExtractData] = useState({
    nguoiGui: 'Nguyễn Văn A',
    namSinh: '1988',
    cccd: '001088012345',
    sdt: '0983 123 456',
    diaChi: 'Số 12, ngõ 45, Cầu Giấy, Hà Nội',
    dongNguoiGui: 'Trần Thị C (Đồng đứng đơn)',
    cccdDongNguoiGui: '001190028391',
    luatSu: 'LS. Lê Quang Đ (Đại diện theo ủy quyền)',
    theLuatSu: 'LS-0928/ĐLS-HN',
    loaiNoiDung: 'Tố giác tội phạm',
    dauHieu: 'Lừa đảo chiếm đoạt tài sản',
    congTyBiToGiac: 'Công ty Cổ phần X',
    mstCongTy: '0108293847',
    doiTuong: 'Trần Văn B',
    chucVu: 'Giám đốc',
    donVi: 'Công ty Cổ phần X',
    nguoiLienQuan: 'Bà Vũ Mai H (Kế toán trưởng kiêm Thủ quỹ)',
    cccdNguoiLienQuan: '001183002910',
    thoiGian: 'Khoảng năm 2024 – 2025',
    duAn: 'Dự án Khu đô thị Y',
    diaDiem: 'Quận Hà Đông, Hà Nội',
    noiDungTomTat: 'Phản ánh ông Trần Văn B và Công ty Cổ phần X có hành vi lừa đảo chiếm đoạt tài sản thông qua việc huy động vốn tại Dự án Khu đô thị Y... không thực hiện cam kết và không hoàn trả tiền cho các nhà đầu tư.',
    yeuCau1: 'Xác minh, điều tra làm rõ hành vi.',
    yeuCau2: 'Bảo vệ quyền và lợi ích hợp pháp.',
    yeuCau3: 'Thông báo kết quả giải quyết.',
  });
  const [savedExtractData, setSavedExtractData] = useState(extractData);

  // ─── ĐỒNG BỘ THÔNG TIN BÓC TÁCH KHI MỞ TỪ MÀN HÌNH "CÔNG VIỆC CỦA TÔI" ─────
  useEffect(() => {
    if (!luotNhan) return;

    if (isBatQuaTang) {
      const data = {
        nguoiGui: luotNhan.nguoiNop || 'Tổ công tác Trực ban Hình sự - Đội CSHS',
        namSinh: 'N/A',
        cccd: 'N/A',
        sdt: '024 3939 6113',
        diaChi: 'Bến xe Giáp Bát, Hoàng Mai, Hà Nội',
        dongNguoiGui: luotNhan.nguoiLamChung || 'Trần Văn Cường (Phụ xe khách 29B-123.45)',
        cccdDongNguoiGui: '001089012399',
        luatSu: 'Chưa có',
        theLuatSu: 'N/A',
        loaiNoiDung: 'Biên bản bắt người phạm tội quả tang (Điều 111 BLTTHS)',
        dauHieu: 'Bắt quả tang hành vi Vận chuyển, mua bán trái phép chất ma túy (Điều 251 BLHS)',
        congTyBiToGiac: 'N/A',
        mstCongTy: 'N/A',
        doiTuong: luotNhan.doiTuongLienQuan || 'Vũ Đình Toàn (Sinh năm 1991, CCCD: 001091004812)',
        chucVu: 'Người bị bắt quả tang',
        donVi: 'Cá nhân',
        nguoiLienQuan: `Người làm chứng: ${luotNhan.nguoiLamChung || 'Trần Văn Cường (Phụ xe khách)'}`,
        cccdNguoiLienQuan: '001089012399',
        thoiGian: luotNhan.thoiGianSuViec || '08:30 ngày 16/09/2026',
        duAn: 'N/A',
        diaDiem: luotNhan.diaDiemSuViec || 'Khu vực bãi đỗ xe trả khách - Bến xe Giáp Bát, quận Hoàng Mai, Hà Nội',
        noiDungTomTat: luotNhan.dienBienSuViec || luotNhan.noiDung || 'Tổ công tác Đội CSHS phối hợp Công an phường Giáp Bát bắt quả tang Vũ Đình Toàn đang nhận ba lô chứa chất bột màu trắng nghi ma túy đá từ cốp xe khách tuyến Nam Định - Hà Nội.',
        yeuCau1: 'Lập Biên bản bắt người phạm tội quả tang theo Điều 111, 112 BLTTHS và lấy lời khai ban đầu.',
        yeuCau2: 'Lập biên bản niêm phong tang vật: 02 túi nilon tinh thể màu trắng và 01 điện thoại iPhone (Điều 106 BLTTHS) gửi Viện Khoa học Hình sự giám định.',
        yeuCau3: 'Thông báo ngay cho Viện kiểm sát nhân dân cùng cấp trong thời hạn 12 giờ theo Điều 110 BLTTHS.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setAiAnalysisState('phan_tich_so_bo');
      setAiVersion(1);
      setOfficerNote('Bắt người phạm tội quả tang (Điều 111 BLTTHS): Tiếp nhận trực tiếp không qua đơn. Đề xuất: Hoàn tất biên bản bắt người, niêm phong tang vật chuyển giám định và thông báo VKSND trong 12h.');
    } else if (isCanBoPhatHien) {
      const data = {
        nguoiGui: luotNhan.lucLuongPhatHien || 'Tổ tuần tra Đội CSĐTTP về Kinh tế & Ma túy',
        namSinh: 'N/A',
        cccd: 'N/A',
        sdt: '024 3939 6115',
        diaChi: 'Công an quận Hoàng Mai, TP. Hà Nội',
        dongNguoiGui: 'Cán bộ phát hiện: Đại úy Hoàng Văn Nam & Trung úy Đỗ Đức Thịnh',
        cccdDongNguoiGui: 'N/A',
        luatSu: 'Không có',
        theLuatSu: 'N/A',
        loaiNoiDung: 'Báo cáo trực tiếp phát hiện dấu hiệu tội phạm (Khoản 3 Điều 143 BLTTHS)',
        dauHieu: 'Dấu hiệu Sản xuất, buôn bán hàng giả / Kinh doanh thực phẩm không rõ nguồn gốc (Điều 192 BLHS)',
        congTyBiToGiac: 'Kho hàng hóa tư nhân tại số 45 ngõ 182 Lĩnh Nam',
        mstCongTy: 'N/A',
        doiTuong: luotNhan.doiTuongLienQuan || 'Ngô Doãn Thành (Chủ kho hàng)',
        chucVu: 'Chủ cơ sở tập kết hàng hóa',
        donVi: 'Kho hàng tư nhân',
        nguoiLienQuan: 'Công nhân bốc vác: Nguyễn Văn T & Lê Văn Đ',
        cccdNguoiLienQuan: 'N/A',
        thoiGian: luotNhan.thoiGianSuViec || 'Khoảng 21h15 ngày 15/09/2026',
        duAn: 'Kế hoạch tuần tra kiểm soát địa bàn số 42/KH-CAQ',
        diaDiem: luotNhan.diaDiemSuViec || 'Số 45 ngõ 182 phố Lĩnh Nam, quận Hoàng Mai, Hà Nội',
        noiDungTomTat: luotNhan.dienBienSuViec || luotNhan.noiDung || 'Qua công tác tuần tra nghiệp vụ theo Kế hoạch số 42/KH-CAQ, tổ công tác phát hiện xe tải BKS 29H-882.11 đang bốc dỡ 150 thùng sữa bột mang nhãn hiệu nước ngoài không có hóa đơn chứng từ hợp pháp.',
        yeuCau1: 'Lập Biên bản kiểm tra hành chính, tạm giữ toàn bộ 150 thùng hàng hóa và phương tiện vận tải.',
        yeuCau2: 'Đề xuất Thủ trưởng Cơ quan CSĐT ra Quyết định phân công thụ lý nguồn tin tội phạm theo Khoản 3 Điều 143 BLTTHS.',
        yeuCau3: 'Phối hợp Đội QLTT số 15 tiến hành kiểm đếm chi tiết và trưng cầu giám định chất lượng hàng hóa.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setAiAnalysisState('phan_tich_so_bo');
      setAiVersion(1);
      setOfficerNote('Cán bộ trực tiếp phát hiện (Khoản 3 Điều 143 BLTTHS): Không có đơn hoặc người nộp đơn. Đề xuất: Lập hồ sơ thụ lý nguồn tin do cơ quan phát hiện, niêm phong kho hàng và phối hợp cơ quan chuyên môn xác minh.');
    } else if (luotNhan.id === 'TB-2026-CATPHN_099' || luotNhan.aiAnalysisState === 'chua_du_du_lieu') {
      const data = {
        nguoiGui: luotNhan.nguoiNop || 'Người dân báo tin qua điện thoại (Chưa rõ danh tính)',
        namSinh: 'N/A',
        cccd: 'Chưa có thông tin',
        sdt: luotNhan.sdt || '0904 *** 112',
        diaChi: 'Chưa rõ địa chỉ nơi cư trú',
        dongNguoiGui: 'Không có',
        cccdDongNguoiGui: 'N/A',
        luatSu: 'Không có',
        theLuatSu: 'N/A',
        loaiNoiDung: 'Tin báo qua điện thoại (Chưa đủ thông tin để kết luận)',
        dauHieu: 'Chưa đủ căn cứ xác định dấu hiệu vi phạm',
        congTyBiToGiac: 'N/A',
        mstCongTy: 'N/A',
        doiTuong: 'Chưa xác định chủ thể cụ thể',
        chucVu: 'N/A',
        donVi: 'N/A',
        nguoiLienQuan: 'N/A',
        cccdNguoiLienQuan: 'N/A',
        thoiGian: 'Khoảng 2 ngày trước',
        duAn: 'N/A',
        diaDiem: 'Chưa rõ địa chỉ cụ thể trên địa bàn quận',
        noiDungTomTat: luotNhan.noiDung || 'Người dân gọi điện báo có nhóm người tụ tập đánh bạc, nhưng cúp máy trước khi cung cấp địa chỉ cụ thể và danh tính người liên quan. Chưa đủ dữ liệu để phân tích và kết luận.',
        yeuCau1: 'Cán bộ trực ban liên hệ lại số điện thoại người báo tin để xác minh địa điểm cụ thể.',
        yeuCau2: 'Hướng dẫn công dân cung cấp bổ sung thông tin theo quy trình tiếp nhận tin báo.',
        yeuCau3: 'Chưa đủ điều kiện khởi chạy thụ lý chính thức theo Thông tư liên tịch 01/2021.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setAiAnalysisState('chua_du_du_lieu');
      setOfficerNote('Tin báo chưa đủ dữ liệu: Chưa rõ địa điểm, danh tính người báo và người liên quan. AI không tự sinh kết luận; cần cán bộ liên hệ bổ sung thông tin tối thiểu.');
    } else if (isTuThuDauThu) {
      const isDauThu = luotNhan.loaiNghiepVu === 'nguoi_dau_thu' || luotNhan.truongHopTrinhDien === 'dau_thu' || luotNhan.id?.startsWith('DT-');
      const data = {
        nguoiGui: luotNhan.nguoiNop || (isDauThu ? 'Lê Quốc Tuấn' : 'Phạm Văn Hùng'),
        namSinh: luotNhan.ngaySinh ? luotNhan.ngaySinh.split('-')[0] : (isDauThu ? '1992' : '1995'),
        cccd: luotNhan.cccd || (isDauThu ? '001092019482' : '001095018392'),
        sdt: luotNhan.sdt || (isDauThu ? '0913 889 900' : '0988 223 344'),
        diaChi: luotNhan.diaChi || (isDauThu ? 'Số 88 đường Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội' : 'Xã Tân Triều, Thanh Trì, TP. Hà Nội'),
        dongNguoiGui: typeof luotNhan.nguoiDiCung === 'string'
          ? luotNhan.nguoiDiCung
          : (luotNhan.nguoiDiCung?.hoTen
            ? `${luotNhan.nguoiDiCung.hoTen} (${luotNhan.nguoiDiCung.quanHe || 'Người đi cùng'})`
            : (isDauThu ? 'Ông Lê Văn Toàn (Bố đẻ) & LS. Hoàng Minh Tú' : 'Không có (Tự đến một mình)')),
        cccdDongNguoiGui: isDauThu ? '001062001928' : 'N/A',
        luatSu: isDauThu ? 'LS. Hoàng Minh Tú (Đoàn Luật sư TP. Hà Nội)' : 'Không có',
        theLuatSu: isDauThu ? 'LS-0412/ĐLS-HN' : 'N/A',
        loaiNoiDung: isDauThu ? 'Biên bản tiếp nhận người đầu thú (Mẫu 02-BCA)' : 'Biên bản tiếp nhận người tự thú (Mẫu 02-BCA)',
        dauHieu: isDauThu ? 'Đầu thú theo Quyết định truy nã số 14/QĐ-CQĐT (Điều 134 BLHS)' : 'Tự thú về hành vi trộm cắp kho bãi (Điều 173 BLHS)',
        congTyBiToGiac: 'N/A',
        mstCongTy: 'N/A',
        doiTuong: luotNhan.nguoiNop || (isDauThu ? 'Lê Quốc Tuấn' : 'Phạm Văn Hùng'),
        chucVu: 'Người trình diện',
        donVi: 'Cá nhân',
        nguoiLienQuan: isDauThu ? 'Bị hại: Anh Trần Hoàng M (Thương tích 18%)' : 'Chủ kho bãi: Công ty Thiết bị Tân Phát (Thanh Oai)',
        cccdNguoiLienQuan: isDauThu ? '001090018392' : '0109283746',
        thoiGian: luotNhan.thoiGianSuViec || (isDauThu ? 'Ngày 28/07/2026' : 'Khoảng 23h30 ngày 12/09/2026'),
        duAn: 'N/A',
        diaDiem: luotNhan.diaDiemSuViec || (isDauThu ? 'Quán cà phê phố Trần Thái Tông, Cầu Giấy, Hà Nội' : 'Kho chứa thiết bị CCN Thanh Oai, Hà Nội'),
        noiDungTomTat: luotNhan.dienBienSuViec || luotNhan.noiDung || (isDauThu ? 'Đối tượng có QĐ truy nã số 14, ra đầu thú và khai nhận hành vi gây thương tích do va chạm giao thông.' : 'Tự nguyện đến trình diện trước khi bị phát hiện, khai nhận lén lút trộm cắp xe máy và tiền mặt tại kho bãi Tân Triều.'),
        yeuCau1: 'Lập biên bản tiếp nhận người tự thú/đầu thú theo Mẫu số 02-BCA.',
        yeuCau2: 'Lập biên bản niêm phong tang vật giao nộp và kiểm tra tình trạng sức khỏe/vết thương.',
        yeuCau3: 'Gửi văn bản thông báo ngay cho Viện kiểm sát nhân dân cùng cấp trong thời hạn 24 giờ.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setAiState('done');
      setReadingProgress(100);
      setOfficerNote(isDauThu
        ? 'Căn cứ Khoản 1 Điều 4 & Điều 146 BLTTHS: Đối tượng ra đầu thú theo QĐ truy nã số 14. Đề xuất: Lập biên bản tiếp nhận Mẫu 02-BCA, cho cán bộ y tế kiểm tra vết thương ở cẳng tay trái, gửi thông báo VKSND trong 24h và bàn giao Đội CSHS thụ lý theo hồ sơ truy nã TN-2026-CSĐT_014.'
        : 'Căn cứ Khoản 1 Điều 4 & Điều 146 BLTTHS: Người phạm tội tự nguyện khai báo trước khi bị phát hiện (Tự thú). Đề xuất: Lập biên bản tiếp nhận Mẫu 02-BCA, lập biên bản niêm phong 01 xe máy + 15 triệu đồng theo Điều 106 BLTTHS, thông báo VKSND trong 24h và phân công ĐTV thụ lý.');
    } else if (
      luotNhan.loaiNghiepVu === 'tin_bao_to_giac' ||
      luotNhan.id?.startsWith('TB-') ||
      luotNhan.loaiDon?.toLowerCase().includes('tố giác') ||
      luotNhan.noiDung?.toLowerCase().includes('tố giác') ||
      luotNhan.noiDung?.toLowerCase().includes('lừa đảo')
    ) {
      const data = {
        nguoiGui: luotNhan.nguoiNop || 'Nguyễn Văn A',
        namSinh: '1985',
        cccd: luotNhan.cccd || '001085019284',
        sdt: luotNhan.sdt || '0983 123 456',
        diaChi: luotNhan.diaChi || 'Số 18 Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
        dongNguoiGui: 'Trần Thị C (Cùng bị hại góp vốn)',
        cccdDongNguoiGui: '001189012399',
        luatSu: 'LS. Lê Quang Đ (Đoàn Luật sư TP. Hà Nội)',
        theLuatSu: 'LS-0928/ĐLS-HN',
        loaiNoiDung: 'Đơn tố giác về tội phạm',
        dauHieu: 'Dấu hiệu tội Lừa đảo chiếm đoạt tài sản (Điều 174 BLHS)',
        congTyBiToGiac: 'Công ty Cổ phần Bất động sản Địa Ốc X',
        mstCongTy: '0108293847',
        doiTuong: luotNhan.doiTuongLienQuan || 'Trần Văn B (Chủ tịch kiêm Tổng Giám đốc)',
        chucVu: 'Chủ tịch HĐQT kiêm Tổng Giám đốc Công ty BĐS Địa Ốc X',
        donVi: 'Công ty Cổ phần Bất động sản Địa Ốc X',
        nguoiLienQuan: 'Bà Vũ Mai H (Kế toán trưởng) & Nguyễn Văn T (Trưởng phòng Kinh doanh)',
        cccdNguoiLienQuan: '001183002910',
        thoiGian: luotNhan.thoiGianSuViec || 'Từ tháng 01/2025 đến tháng 08/2026',
        duAn: 'Dự án Khu đô thị Nam An Khánh (Hoài Đức, Hà Nội)',
        diaDiem: luotNhan.diaDiemSuViec || 'Huyện Hoài Đức & Văn phòng giao dịch tại Cầu Giấy, Hà Nội',
        noiDungTomTat: luotNhan.dienBienSuViec || luotNhan.noiDung || 'Tố giác ông Trần Văn B cùng đồng phạm thành lập dự án ma, ký hợp đồng góp vốn nhận tiền cọc của nhiều cá nhân, sau đó chiếm đoạt trên 2.8 tỷ đồng và có dấu hiệu tẩu tán tài sản, bỏ trốn.',
        yeuCau1: 'Tiếp nhận, thụ lý nguồn tin tội phạm và phân công Điều tra viên xác minh làm rõ.',
        yeuCau2: 'Áp dụng biện pháp ngăn chặn tạm hoãn xuất cảnh và phong tỏa tài khoản ngân hàng thụ hưởng.',
        yeuCau3: 'Khởi tố vụ án hình sự và thu hồi tài sản bị chiếm đoạt trả lại cho người bị hại.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setAiState('done');
      setReadingProgress(100);
      setOfficerNote('AI phân tích hồ sơ tin báo tố giác: Đầy đủ căn cứ ban đầu theo Điều 145 BLTTHS 2015. Đề xuất thụ lý và phân công Điều tra viên thụ lý giải quyết.');
    } else if (luotNhan.id.includes('LN-56') || luotNhan.noiDung?.includes('môi trường')) {
      const data = {
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
        dauHieu: 'Chồng lấn chỉ giới xây dựng với ngõ đi chung (Cần cán bộ xác minh thực địa)',
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
      setAiState('none');
      setOfficerNote('Lỗi OCR: Tài liệu scan kèm theo bị nghiêng mờ, module OCR không đọc được. Cán bộ thụ lý kiểm tra và nhập liệu bổ sung.');
    } else {
      const data = {
        nguoiGui: luotNhan.nguoiNop || 'Người nộp đơn',
        namSinh: '1988',
        cccd: luotNhan.cccd || '001088012345',
        sdt: luotNhan.sdt || '0983 123 456',
        diaChi: luotNhan.diaChi || 'Hà Nội',
        dongNguoiGui: 'Không có',
        cccdDongNguoiGui: 'N/A',
        luatSu: 'Không có',
        theLuatSu: 'N/A',
        loaiNoiDung: luotNhan.loaiDon || 'Đơn phản ánh kiến nghị',
        dauHieu: 'Thông tin tiếp nhận mới từ bộ phận một cửa',
        congTyBiToGiac: 'N/A',
        mstCongTy: 'N/A',
        doiTuong: 'Cơ quan / Đơn vị có thẩm quyền giải quyết',
        chucVu: 'N/A',
        donVi: luotNhan.donVi || 'Phòng Hành chính - Tổng hợp',
        nguoiLienQuan: 'N/A',
        cccdNguoiLienQuan: 'N/A',
        thoiGian: luotNhan.ngayNhan || 'Hôm nay',
        duAn: 'Tiếp nhận đơn',
        diaDiem: luotNhan.diaChi || 'Hà Nội',
        noiDungTomTat: luotNhan.noiDung || 'Đơn mới tiếp nhận, chờ kiểm tra và chuyển tiếp nhận xử lý.',
        yeuCau1: 'Kiểm tra tính hợp lệ của hồ sơ đơn tiếp nhận.',
        yeuCau2: 'Xem xét thẩm quyền tiếp nhận và căn cứ pháp luật.',
        yeuCau3: 'Chuyển tiếp nhận và phân công cán bộ xử lý theo thẩm quyền.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setAiState('done');
      setReadingProgress(100);
      setOfficerNote('Lượt nhận vừa được thêm mới. Hồ sơ đã sẵn sàng để chuyển tiếp nhận và xử lý.');
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

  // 6 bước tuần tự của AI sau OCR (BR-11) chuẩn hóa theo Mục 5
  const AI_PIPELINE_STEPS_6 = [
    { step: 1, title: 'Đọc & nhận diện cấu trúc', desc: 'Bóc tách văn bản OCR, nhận diện diễn biến' },
    { step: 2, title: 'Tìm kiếm ngữ cảnh CSDL', desc: 'Đối soát nhân thân, tiền sự, lịch sử đơn thư' },
    { step: 3, title: 'Nhận diện tình huống nghiệp vụ', desc: 'Phân loại dấu hiệu tội phạm & thẩm quyền' },
    { step: 4, title: 'Đánh giá độ đủ thông tin', desc: 'Phân định thông tin đủ / thiếu / mâu thuẫn' },
    { step: 5, title: 'Đề xuất bước xử lý tiếp theo', desc: 'Căn cứ pháp lý theo Điều 145, 146, 147 BLTTHS' },
    { step: 6, title: 'Cán bộ kiểm tra & xác nhận', desc: 'Cán bộ thụ lý phê chuẩn kết quả chính thức' },
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
  const handleGoToChiTietDon = () => {
    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    const donObj = {
      id: dynamicCode,
      code: dynamicCode,
      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      luotNhanId: luotNhan?.id || dynamicCode,
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Công dân',
      ngayNhan: luotNhan?.ngayNhan || 'Hôm nay',
      loaiDon: extractData.loaiNoiDung || luotNhan?.loaiDon || 'Đơn phản ánh kiến nghị',
      type: (dynamicCode.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN') as 'VỤ VIỆC' | 'ĐƠN TIẾP NHẬN',
      statusBadge: 'Đang xác minh thông tin',
      isNew: true,
    };
    onAcceptAndProcess?.(donObj);
    onNav('don-tiep-nhan');
  };

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
      statusBadge: 'Đang xác minh thông tin',
      isNew: true,
    };
    onAcceptAndProcess?.(donObj);

    showToast(`✓ Đã tiếp nhận đơn ${dynamicCode} thành công. Chuyển sang màn hình chi tiết đơn...`);
    setTimeout(() => onNav('don-tiep-nhan'), 350);
  };

  // BR-16, BR-17, BR-18: Xác nhận Tiếp nhận (Tự xử lý vs Phân công)
  const handleConfirmTiepNhan = () => {
    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    if (tiepNhanHuong === 'phan_cong' && !selectedOfficerForPhanCong) {
      showToast('Vui lòng chọn cán bộ nhận phân công xử lý (BR-18).');
      return;
    }

    setShowSubmitModal(false);

    const donObj = {
      id: dynamicCode,
      code: dynamicCode,
      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      luotNhanId: luotNhan?.id || dynamicCode,
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Người nộp đơn',
      ngayNhan: luotNhan?.ngayNhan || 'Hôm nay',
      loaiDon: extractData.loaiNoiDung || luotNhan?.loaiDon || 'Đơn tiếp nhận hành chính',
      type: (dynamicCode.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN') as 'VỤ VIỆC' | 'ĐƠN TIẾP NHẬN',
      statusBadge: 'Đang xác minh thông tin',
      isNew: true,
    };

    if (tiepNhanHuong === 'tu_xu_ly') {
      setCurrentLuotNhanStatus('da_chuyen');
      onUpdateLuotNhan?.({ ...luotNhan, status: 'da_chuyen' });
      showToast(`✓ Đã tiếp nhận đơn ${dynamicCode}. Đang chuyển sang màn hình chi tiết đơn...`);
      onAcceptAndProcess?.(donObj);
      setTimeout(() => onNav('don-tiep-nhan'), 350);
    } else {
      const assignedOfficer = OFFICERS.find((o) => o.id === selectedOfficerForPhanCong);
      showToast(`✓ Đã tiếp nhận và phân công cho cán bộ ${assignedOfficer?.name || 'được chọn'} xử lý (BR-18). Đang chuyển sang màn hình chi tiết đơn...`);
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
        canBoXuLy: assignedOfficer?.name,
        canBoXuLyId: assignedOfficer?.id,
        chucVuCanBo: assignedOfficer?.role,
        ngayPhanCong: '16/09/2026',
        nguoiPhanCong: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
        ghiChuPhanCong: ghiChuPhanCong,
        hinhThucChuyen: 'truc_tiep',
        lichSuPhanCong: [
          {
            time: '16/09/2026 10:45',
            nguoiGiao: 'Nguyễn Minh Anh',
            nguoiNhan: assignedOfficer?.name || 'Cán bộ',
            ghiChu: ghiChuPhanCong || 'Phân công thụ lý giải quyết đơn',
          },
        ],
      };
      onChuyenTiepNhan?.(newItem, true, assignedOfficer?.name);
      onAcceptAndProcess?.(donObj);
      setTimeout(() => onNav('don-tiep-nhan'), 350);
    }
  };

  // Xử lý xác nhận Ghép lượt nhận vào hồ sơ Đơn đã có (Không sinh mã đơn mới)
  const handleConfirmGhep = () => {
    setShowGhepModal(false);
    setCurrentLuotNhanStatus('da_ghep');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'da_ghep' });
    showToast(
      `✓ Đã ghép thành công lượt nhận ${luotNhan?.id || 'LN-56/2026-GOVEX'} vào hồ sơ đơn ${selectedGhepDonCode}!`
    );
    setTimeout(() => {
      onNav('don-tiep-nhan');
    }, 1000);
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

  // Kịch bản B: Khởi chạy AI phân tích ngôn ngữ tự nhiên trên nội dung cán bộ nhập trực tiếp
  const handleRunAiAnalysisOnDirectInput = () => {
    if (!directDescriptionInput.trim()) {
      showToast('⚠️ Vui lòng nhập mô tả sự việc ban đầu trước khi khởi chạy AI phân tích.');
      return;
    }
    setAiAnalysisState('dang_phan_tich');
    setIsSimulating(true);
    setReadingProgress(20);
    showToast('AI đang phân tích ngôn ngữ tự nhiên (NLP) trên nội dung cán bộ ghi nhận...');
    setTimeout(() => {
      setReadingProgress(60);
      setAiStepIndex(3);
    }, 600);
    setTimeout(() => {
      setReadingProgress(100);
      setIsSimulating(false);
      setAiAnalysisState('phan_tich_so_bo');
      setAiVersion(1);
      setExtractData((prev) => ({
        ...prev,
        noiDungTomTat: directDescriptionInput,
        diaDiem: diaDiemDirectInput || prev.diaDiem,
        thoiGian: thoiGianDirectInput || prev.thoiGian,
      }));
      showToast('✓ AI đã phân tích xong mô tả ban đầu - Tạo kết quả Phiên bản 1 (Sơ bộ)!');
    }, 1200);
  };

  // Kịch bản D: Cán bộ bổ sung tài liệu / biên bản mới -> Kích hoạt OCR & Nâng cấp lên Phiên bản 2
  const handleAddExtraDocument = (fileName: string, fileSize: string, docType: string) => {
    const newDoc: UploadedFile = {
      name: fileName,
      size: fileSize,
      category: 'attach',
    };
    setExtraUploadedFiles((prev) => [...prev, newDoc]);
    setShowAddDocumentModal(false);
    setAiAnalysisState('dang_phan_tich');
    setIsSimulating(true);
    setReadingProgress(35);
    showToast(`Đã tiếp nhận tệp "${fileName}". AI đang chạy quét OCR và đối soát dữ liệu bổ sung...`);
    setTimeout(() => {
      setReadingProgress(75);
      setAiStepIndex(5);
    }, 700);
    setTimeout(() => {
      setReadingProgress(100);
      setIsSimulating(false);
      setAiAnalysisState('da_cap_nhat');
      setAiVersion(2);
      setLeftPaneTab('tai_lieu');
      showToast(`✓ Đã cập nhật kết quả phân tích AI sang Phiên bản 2 (Đã có tài liệu & OCR)!`);
    }, 1400);
  };

  // Cán bộ xác nhận kết quả phân tích AI
  const handleOfficerConfirmAI = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    setOfficerConfirmedAI(true);
    setOfficerConfirmedAt(timeStr);
    setIsOfficialData(true);
    showToast(`✓ Cán bộ thụ lý đã xác nhận kết quả phân tích AI lúc ${timeStr}!`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f1f5f9] text-[#1e293b] font-body-md overflow-hidden select-none">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}
      <div className="bg-[#1e293b] text-white px-5 py-2 border-b border-slate-700 flex items-center justify-between text-xs shrink-0 shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="material-symbols-outlined text-amber-400 text-[18px]">psychology</span>
          <span className="font-semibold text-slate-300">Trạng thái AI phân tích:</span>
          <div className="flex items-center p-0.5 bg-slate-800 rounded-lg border border-slate-600 flex-wrap gap-0.5">
            <button
              type="button"
              onClick={() => {
                setAiAnalysisState('chua_du_du_lieu');
                setAiVersion(1);
                showToast('Chuyển sang: Chưa đủ dữ liệu để phân tích (Kịch bản A).');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${aiAnalysisState === 'chua_du_du_lieu'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[13px]">hourglass_empty</span>
              <span>1. Chưa đủ dữ liệu</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAiAnalysisState('dang_phan_tich');
                setReadingProgress(60);
                showToast('Chuyển sang: Đang phân tích đa nguồn...');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${aiAnalysisState === 'dang_phan_tich'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[13px] animate-spin">sync</span>
              <span>2. Đang phân tích</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAiAnalysisState('phan_tich_so_bo');
                setAiVersion(1);
                showToast('Chuyển sang: Đã có phân tích sơ bộ - Phiên bản 1 (Kịch bản B).');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${aiAnalysisState === 'phan_tich_so_bo'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[13px]">psychology</span>
              <span>3. Phân tích sơ bộ (v1)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAiAnalysisState('can_bo_sung');
                showToast('Chuyển sang: Cần bổ sung thông tin nghiệp vụ.');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${aiAnalysisState === 'can_bo_sung'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[13px]">pending_actions</span>
              <span>4. Cần bổ sung</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAiAnalysisState('da_cap_nhat');
                setAiVersion(2);
                showToast('Chuyển sang: Đã cập nhật phân tích - Phiên bản 2 (Kịch bản D).');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${aiAnalysisState === 'da_cap_nhat'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              <span>5. Đã cập nhật (v2)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAiAnalysisState('loi_phan_tich');
                showToast('Chuyển sang: Lỗi phân tích.');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${aiAnalysisState === 'loi_phan_tich'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[13px]">error</span>
              <span>6. Lỗi phân tích</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-600">
            <span className="font-semibold text-slate-300">Phiên bản:</span>
            <span className="px-2 py-0.5 rounded bg-blue-900 text-blue-200 font-mono font-bold text-[11px] border border-blue-700">
              v{aiVersion}.0
            </span>
            <button
              type="button"
              onClick={() => setShowDiffModal(true)}
              className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
              title="Đối chiếu lịch sử phân tích giữa các phiên bản trước và sau khi bổ sung thông tin"
            >
              <span className="material-symbols-outlined text-[13px]">compare</span>
              <span>Lịch sử Diff (v1 vs v2)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddDocumentModal(true)}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            title="Bổ sung biên bản, tài liệu mới để AI quét OCR và cập nhật phân tích"
          >
            <span className="material-symbols-outlined text-[15px]">post_add</span>
            <span>+ Bổ sung tài liệu</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUB-HEADER BREADCRUMB & METADATA                                       */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xs">
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
            <span className="text-slate-800 font-bold">Chi tiết lượt nhận</span>
          </div>

          {/* Title & Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[20px] font-bold text-slate-900 font-headline-md tracking-tight">
              Chi tiết lượt nhận: {luotNhan?.id ? luotNhan.id : 'LN-2025-0105'}
            </h1>

            {/* HIỂN THỊ TRẠNG THÁI AI THEO 6 TRẠNG THÁI CHUẨN */}
            {/* {aiAnalysisState === 'chua_du_du_lieu' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[11.5px] font-semibold font-label-technical">
                <span className="material-symbols-outlined text-[14px] text-amber-600">hourglass_empty</span>
                <span>Chưa đủ dữ liệu để phân tích (Không tự sinh kết luận)</span>
              </span>
            ) : aiAnalysisState === 'dang_phan_tich' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-300 text-[11.5px] font-semibold font-label-technical animate-pulse">
                <span className="material-symbols-outlined text-[14px] animate-spin text-blue-600">sync</span>
                <span>AI đang phân tích đa nguồn dữ liệu ({readingProgress}%)</span>
              </span>
            ) : aiAnalysisState === 'can_bo_sung' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-300 text-[11.5px] font-semibold font-label-technical">
                <span className="material-symbols-outlined text-[14px] text-orange-600">pending_actions</span>
                <span>Cần bổ sung thông tin (Có tình tiết chưa rõ)</span>
              </span>
            ) : aiAnalysisState === 'da_cap_nhat' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11.5px] font-semibold font-label-technical">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                <span>Đã cập nhật phân tích đa nguồn (Phiên bản v{aiVersion}.0)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-[11.5px] font-semibold font-label-technical">
                <span className="material-symbols-outlined text-[14px] text-rose-600">error</span>
                <span>Lỗi phân tích đa nguồn</span>
              </span>
            )} */}
          </div>

          {/* Meta Attributes */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5 font-normal">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
              <span>Ngày nhận:</span>
              <strong className="text-slate-700 font-label-technical">{luotNhan?.ngayNhan || '15/09/2026 10:24'}</strong>
            </div>
            <span>•</span>
            <div>
              <span>Hình thức:</span> <strong className="text-slate-700">{luotNhan?.hinhThuc || 'Trực tiếp'}</strong>
            </div>
            {/* <div>
              <span>Người gửi/nộp:</span> <strong className="text-slate-800 font-semibold">{extractData.nguoiGui || luotNhan?.nguoiNop}</strong>
            </div> */}

          </div>
        </div>

        {/* Action Controls Top-Right */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* BR-03: Thao tác theo tiến trình quy trình nghiệp vụ đã cấu hình */}
          {currentLuotNhanStatus === 'da_chuyen' ? (
            <div className="flex items-center gap-2 flex-wrap">
              {/* NÚT VỀ MÀN HÌNH CHI TIẾT ĐƠN */}
              <button
                type="button"
                onClick={handleGoToChiTietDon}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-300 shadow-2xs"
                title="Chuyển sang màn hình chi tiết đơn tiếp nhận"
              >
                <span className="material-symbols-outlined text-[17px] text-[#004ac6]">description</span>
                <span>Màn chi tiết đơn</span>
              </button>

              {/* NÚT CHÍNH: BƯỚC TIẾP THEO THEO QUY TRÌNH: XÁC MINH THÔNG TIN & ĐỀ XUẤT HƯỚNG XỬ LÝ */}
              <button
                type="button"
                onClick={handleGoToChiTietDon}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da6] active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all cursor-pointer"
                title="Chuyển đến màn chi tiết đơn để xác minh thông tin & đề xuất hướng xử lý"
              >
                <span className="material-symbols-outlined text-[18px]">fact_check</span>
                <span>Xác minh thông tin &amp; Đề xuất hướng xử lý ➔</span>
              </button>
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
          ) : (
            <button
              type="button"
              onClick={handleOpenChuyenModal}
              disabled={aiState === 'reading'}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C62828] hover:bg-[#b71c1c] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Chuyển tiếp nhận và xử lý (BR-03, BR-04, BR-05)"
            >
              <span className="material-symbols-outlined text-[17px]">forward_to_inbox</span>
              <span>Chuyển tiếp nhận và xử lý</span>
            </button>
          )}

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
      {/* THANH ĐIỀU HƯỚNG 2 TRƯỜNG HỢP TIẾP NHẬN & PHÂN TÍCH AI                   */}
      {/* Trường hợp 1: Từ đơn (User nhập thông tin & Tải file scan OCR)            */}
      {/* Trường hợp 2: Tiếp nhận tin báo, tố giác (Có thể không đủ thông tin/tài liệu) */}
      {/* ========================================================================= */}
      <div className="mx-4 mt-3 mb-1 p-2.5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/80 border border-blue-200/90 shadow-2xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[19px]">account_tree</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                2 Trường hợp Phân tích AI Tiếp nhận:
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                truongHopPhanTich === 'tu_don'
                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                  : 'bg-rose-100 text-rose-900 border-rose-300'
              }`}>
                {truongHopPhanTich === 'tu_don' ? '1. Từ đơn (Đã có tệp scan & OCR)' : '2. Tin báo, tố giác (Có thể thiếu tệp/thông tin)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {truongHopPhanTich === 'tu_don'
                ? 'Công dân/Cán bộ đã nhập thông tin & tải file tài liệu số hóa • AI OCR bóc tách và thẩm định tính hợp lệ'
                : 'Tiếp nhận nguồn tin tội phạm: Có thể không đủ thông tin, tài liệu • AI NLP phân tích trực tiếp trên lời khai & gợi ý xác minh'}
            </p>
          </div>
        </div>

        {/* Nút chuyển đổi 2 trường hợp */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => handleChangeTruongHop('tu_don')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              truongHopPhanTich === 'tu_don'
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">description</span>
            <span>1. Từ đơn (Nhập thông tin &amp; Tải file)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              truongHopPhanTich === 'tu_don' ? 'bg-blue-200/90 text-blue-950 font-bold' : 'bg-slate-100 text-slate-500'
            }`}>
              Đủ tệp scan
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleChangeTruongHop('tin_bao_to_giac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              truongHopPhanTich === 'tin_bao_to_giac'
                ? 'bg-[#C62828] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">local_police</span>
            <span>2. Tiếp nhận tin báo, tố giác</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              truongHopPhanTich === 'tin_bao_to_giac' ? 'bg-rose-200/90 text-rose-950 font-bold' : 'bg-slate-100 text-slate-500'
            }`}>
              Có thể thiếu tài liệu
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE: BỐ CỤC 2 CỘT CHÍNH (TÀI LIỆU & AI PHÂN TÍCH)            */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* BÊN TRÁI: TÀI LIỆU / NỘI DUNG ĐƠN (46% Width)                           */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="w-[46%] flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header Chuyển đổi Tab Cột Trái: Ghi nhận trực tiếp vs Tài liệu đính kèm */}
          <div className="px-3.5 py-2.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 p-0.5 bg-slate-200/80 rounded-xl">
              {truongHopPhanTich === 'tu_don' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setLeftPaneTab('tai_lieu')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${leftPaneTab === 'tai_lieu'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">description</span>
                    <span>Tài liệu số hóa &amp; Đơn scan {currentFiles.length > 0 ? `(${currentFiles.length})` : '(Chưa có)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeftPaneTab('noi_dung')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${leftPaneTab === 'noi_dung'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">edit_note</span>
                    <span>Thông tin người nộp &amp; Đơn đã nhập</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setLeftPaneTab('noi_dung')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${leftPaneTab === 'noi_dung'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">edit_note</span>
                    <span>Ghi nhận trực tiếp &amp; Diễn biến</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeftPaneTab('tai_lieu')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${leftPaneTab === 'tai_lieu'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">description</span>
                    <span>Tài liệu số hóa {currentFiles.length > 0 ? `(${currentFiles.length})` : '(Không tệp)'}</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAddDocumentModal(true)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                title="Bổ sung tài liệu / biên bản để nâng cấp phân tích AI lên Phiên bản 2"
              >
                <span className="material-symbols-outlined text-[15px]">post_add</span>
                <span>+ Thêm tài liệu</span>
              </button>
            </div>
          </div>

          {leftPaneTab === 'noi_dung' ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
              {truongHopPhanTich === 'tu_don' ? (
                <>
                  {/* Banner nguyên tắc: Từ đơn có thông tin và tệp scan */}
                  <div className="p-3 rounded-xl bg-blue-50/90 border border-blue-200 text-blue-950 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="flex items-center gap-1.5 text-blue-900 font-semibold text-[12.5px]">
                        <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>
                        Nguồn: Thông tin người nộp đơn kê khai &amp; Hồ sơ Một cửa
                      </strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                        Form điện tử + OCR bóc tách
                      </span>
                    </div>
                    <p className="text-[11.5px] text-blue-900/90 leading-relaxed">
                      Thông tin trích xuất từ dữ liệu người làm đơn nộp trực tuyến qua Cổng DVC / Bộ phận Một cửa, kết hợp công nghệ OCR bóc tách văn bản scan đối chiếu chéo.
                    </p>
                  </div>

                  {/* Form thông tin đơn đã nhập */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-blue-600">badge</span>
                        Thông tin người làm đơn &amp; Lượt tiếp nhận
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Đã đối soát CCCD C06
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Họ và tên người làm đơn / Người đại diện
                        </label>
                        <input
                          type="text"
                          disabled
                          value={extractData.nguoiGui || luotNhan?.nguoiNop || 'Ông Đỗ Viết Thắng'}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Số CCCD / Mã định danh cá nhân
                        </label>
                        <input
                          type="text"
                          disabled
                          value={extractData.cccd || luotNhan?.cccd || '001065009182'}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Số điện thoại liên hệ
                        </label>
                        <input
                          type="text"
                          disabled
                          value={extractData.sdt || luotNhan?.sdt || '0913 229 118'}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Thời điểm tiếp nhận đơn
                        </label>
                        <input
                          type="text"
                          disabled
                          value={thoiGianDirectInput || luotNhan?.ngayNhan || '16/09/2026 08:45'}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Địa chỉ thường trú / Nơi phát sinh tranh chấp
                        </label>
                        <input
                          type="text"
                          disabled
                          value={diaDiemDirectInput || extractData.diaChi || 'Số 14 ngõ 35 phố Nghĩa Đô, Cầu Giấy, Hà Nội'}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nội dung tóm tắt trong đơn người dân đã nộp:
                        </label>
                        <textarea
                          rows={4}
                          value={directDescriptionInput}
                          onChange={(e) => setDirectDescriptionInput(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    {/* Danh sách các tài liệu người dân đã tải lên kèm theo đơn */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11.5px] font-bold text-slate-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-blue-600">attach_file</span>
                          Danh sách hồ sơ / tài liệu đính kèm ({currentFiles.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setLeftPaneTab('tai_lieu')}
                          className="text-[11px] text-blue-700 hover:underline font-semibold cursor-pointer"
                        >
                          Mở trình xem tài liệu scan →
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {currentFiles.map((file, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedFileIndex(idx);
                              setLeftPaneTab('tai_lieu');
                            }}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-blue-50/60 hover:border-blue-300 cursor-pointer transition-all flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="material-symbols-outlined text-[17px] text-rose-600 shrink-0">
                                picture_as_pdf
                              </span>
                              <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                            </div>
                            <span className="text-[10.5px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0 ml-2">
                              {file.size}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        Cán bộ có thể chỉnh sửa nội dung tóm tắt để AI cập nhật phân tích.
                      </span>
                      <button
                        type="button"
                        onClick={handleRunAiAnalysisOnDirectInput}
                        disabled={isSimulating}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">psychology</span>
                        <span>Cập nhật phân tích đơn</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Banner nguyên tắc dữ liệu trực tiếp: Tin báo tố giác */}
                  <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-950 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="flex items-center gap-1.5 text-rose-900 font-bold text-[12.5px]">
                        <span className="material-symbols-outlined text-[16px] text-rose-600">priority_high</span>
                        Đặc thù tiếp nhận Tin báo, Tố giác tội phạm
                      </strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                        Có thể không đủ tài liệu ban đầu
                      </span>
                    </div>
                    <p className="text-[11.5px] text-rose-900/90 leading-relaxed">
                      <strong>Quy định nghiệp vụ:</strong> Nguồn tin tội phạm tiếp nhận qua điện thoại nóng, trực ban hình sự, người báo tin ẩn danh hoặc hiện trường ban đầu thường <strong>chưa có đầy đủ hồ sơ, tài liệu chứng minh</strong>. Hệ thống AI GOVEX phân tích trực tiếp trên mô tả do cán bộ nhập, tuyệt đối không bắt buộc phải có tệp scan mới cho phép thụ lý.
                    </p>
                  </div>

                  {/* Form ghi nhận và chỉnh sửa trực tiếp */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-blue-600">edit_square</span>
                        Thông tin sự việc ghi nhận ban đầu
                      </span>
                      <span className="text-[11px] text-slate-500 italic">Cán bộ có thể sửa &amp; chạy phân tích lại</span>
                    </div>

                    {/* Các trường thông tin nhanh */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          {isBatQuaTang
                            ? 'Người bị bắt quả tang'
                            : isCanBoPhatHien
                              ? 'Chủ thể nghi vấn vi phạm'
                              : isTuThuDauThu
                                ? 'Người trình diện (Tự thú/Đầu thú)'
                                : 'Người cung cấp thông tin / Người gửi'}
                        </label>
                        <input
                          type="text"
                          disabled
                          value={extractData.nguoiGui || luotNhan?.nguoiNop || ''}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Thời điểm phát sinh / Tiếp nhận
                        </label>
                        <input
                          type="text"
                          value={thoiGianDirectInput}
                          onChange={(e) => setThoiGianDirectInput(e.target.value)}
                          placeholder="VD: 08:30 ngày 16/09/2026..."
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Địa điểm xảy ra sự việc / Khu vực phát hiện
                        </label>
                        <input
                          type="text"
                          value={diaDiemDirectInput}
                          onChange={(e) => setDiaDiemDirectInput(e.target.value)}
                          placeholder="VD: Bến xe Giáp Bát, Hoàng Mai, Hà Nội..."
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {(isBatQuaTang || isCanBoPhatHien || luotNhan?.tangVatThuGiu || luotNhan?.doVatGiaoNop) && (
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                            Tang vật thu giữ tại chỗ / Đồ vật giao nộp (Điều 106, 111 BLTTHS)
                          </label>
                          <input
                            type="text"
                            value={tangVatDirectInput}
                            onChange={(e) => setTangVatDirectInput(e.target.value)}
                            placeholder="VD: 02 túi nilon tinh thể màu trắng nghi ma túy đá, 01 điện thoại iPhone..."
                            className="w-full p-2 bg-amber-50/60 border border-amber-300 rounded-lg text-xs text-amber-950 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      )}

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Mô tả ban đầu sự việc / Lời trình bày chi tiết của đương sự:
                        </label>
                        <textarea
                          rows={5}
                          value={directDescriptionInput}
                          onChange={(e) => setDirectDescriptionInput(e.target.value)}
                          placeholder="Nhập chi tiết lời khai, diễn biến sự việc, phương thức thủ đoạn..."
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    {/* Nút kích hoạt phân tích NLP trên nội dung trực tiếp */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 flex-wrap gap-2">
                      <span className="text-[11px] text-slate-500">
                        Cập nhật lại mô tả sẽ kích hoạt phân tích sơ bộ tương ứng.
                      </span>
                      <button
                        type="button"
                        onClick={handleRunAiAnalysisOnDirectInput}
                        disabled={isSimulating}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">psychology</span>
                        <span>Phân tích lại AI NLP trên mô tả này</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Chi tiết theo mẫu nghiệp vụ */}
              {isBatQuaTang && (
                <div className="bg-white p-3.5 rounded-xl border border-rose-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-rose-100">
                    <strong className="text-rose-950 font-bold flex items-center gap-1.5 text-[12.5px]">
                      <span className="material-symbols-outlined text-[16px] text-rose-600">security</span>
                      Biên bản bắt người phạm tội quả tang (Mẫu tố tụng Điều 111 BLTTHS)
                    </strong>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10.5px] font-mono font-bold">
                      Điều 111, 112 BLTTHS
                    </span>
                  </div>
                  <div className="space-y-1.5 text-slate-700 text-[11.5px] leading-relaxed">
                    <p>• <strong>Lực lượng bắt giữ:</strong> Tổ công tác Đội CSHS Công an quận phối hợp Công an phường</p>
                    <p>• <strong>Người làm chứng:</strong> {luotNhan?.nguoiLamChung || 'Trần Văn Cường (Phụ xe khách 29B-123.45)'}</p>
                    <p>• <strong>Hành vi phát hiện:</strong> Đang nhận ba lô chứa chất tinh thể màu trắng nghi ma túy từ cốp xe khách.</p>
                    <p>• <strong>Thời hạn thông báo VKSND:</strong> Bắt buộc trong vòng <strong>12 giờ</strong> kể từ khi lập biên bản bắt người (Điều 110 BLTTHS).</p>
                  </div>
                </div>
              )}

              {isCanBoPhatHien && (
                <div className="bg-white p-3.5 rounded-xl border border-indigo-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-indigo-100">
                    <strong className="text-indigo-950 font-bold flex items-center gap-1.5 text-[12.5px]">
                      <span className="material-symbols-outlined text-[16px] text-indigo-700">policy</span>
                      Báo cáo cán bộ trực tiếp phát hiện tội phạm (Khoản 3 Điều 143 BLTTHS)
                    </strong>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10.5px] font-mono font-bold">
                      Khoản 3 Điều 143 BLTTHS
                    </span>
                  </div>
                  <div className="space-y-1.5 text-slate-700 text-[11.5px] leading-relaxed">
                    <p>• <strong>Lực lượng phát hiện:</strong> {luotNhan?.lucLuongPhatHien || 'Tổ tuần tra Đội CSĐTTP về Kinh tế & Ma túy'}</p>
                    <p>• <strong>Biện pháp nghiệp vụ:</strong> {luotNhan?.bienPhapPhatHien || 'Tuần tra kiểm soát theo Kế hoạch 42/KH-CAQ'}</p>
                    <p>• <strong>Hiện trường:</strong> Kho tập kết hàng hóa số 45 ngõ 182 Lĩnh Nam</p>
                    <p>• <strong>Tang vật tạm giữ:</strong> 150 thùng sữa ngoại không hóa đơn chứng từ, 01 xe tải 29H-882.11</p>
                  </div>
                </div>
              )}
            </div>
          ) : currentFiles.length === 0 ? (
            /* EMPTY STATE KHI KHÔNG CÓ TỆP ĐÍNH KÈM */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/80 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center shadow-2xs">
                <span className="material-symbols-outlined text-[36px]">folder_off</span>
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-[15px] font-bold text-slate-800">
                  Chưa có tài liệu hoặc văn bản scan đính kèm
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hồ sơ tiếp nhận trực tiếp từ cán bộ hoặc đương sự trình diện. <strong>Quy trình tiếp nhận GOVEX không bắt buộc tải file mới cho phép tiếp tục</strong> nếu nghiệp vụ không yêu cầu.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setLeftPaneTab('noi_dung')}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                >
                  Xem nội dung ghi nhận trực tiếp
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDocumentModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>+ Bổ sung tài liệu / Biên bản xác minh</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Thanh chuyển đổi nhanh các tệp số hóa đã tải lên */}
              {currentFiles.length > 1 && (
                <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight shrink-0 mr-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-blue-600">folder_open</span>
                      Tệp ({currentFiles.length}):
                    </span>
                    {currentFiles.map((f, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedFileIndex(idx);
                          setCurrentPage(1);
                          showToast(`Đang hiển thị tệp: ${f.name}`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${selectedFileIndex === idx
                          ? 'bg-[#004ac6] text-white shadow-2xs font-bold'
                          : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                          }`}
                        title={f.name}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {f.category === 'main' ? 'picture_as_pdf' : 'description'}
                        </span>
                        <span className="truncate max-w-[170px]">{f.name}</span>
                        <span className={`text-[9.5px] px-1 py-0.2 rounded font-mono ${selectedFileIndex === idx ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-500'
                          }`}>
                          {f.size}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddDocumentModal(true)}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[13px]">upload_file</span>
                    <span>+ Tải thêm</span>
                  </button>
                </div>
              )}

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

                {/* Trang giấy mô phỏng đơn tố giác */}
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                  }}
                  className="bg-white shadow-xl rounded-sm border border-slate-300 p-8 min-h-[580px] w-[95%] transition-transform text-slate-800 text-[11.5px] leading-relaxed space-y-3.5 relative"
                >
                  {isTuThuDauThu ? (
                    <>
                      {/* Header Quốc hiệu & Đơn vị theo Mẫu 02-BCA */}
                      <div className="flex items-start justify-between border-b border-slate-200/80 pb-2">
                        <div className="text-left text-[10px] space-y-0.5">
                          <p className="font-bold uppercase text-slate-900">CÔNG AN TP. HÀ NỘI</p>
                          <p className="font-semibold text-slate-700">CƠ QUAN CSĐT</p>
                          <p className="text-slate-500 italic">Số: {luotNhan?.id || 'TT-2026-CATPHN_002'}/BB-TN</p>
                        </div>
                        <div className="text-center space-y-0.5">
                          <p className="font-bold uppercase text-[10.5px] tracking-wide text-slate-900">
                            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                          </p>
                          <p className="text-[10px] underline font-medium text-slate-800">
                            Độc lập - Tự do - Hạnh phúc
                          </p>
                          <p className="text-[9.5px] text-purple-700 font-semibold font-mono">
                            (Mẫu số 02-BCA theo Thông tư 119/2021/TT-BCA)
                          </p>
                        </div>
                      </div>

                      {/* Tiêu đề Biên bản */}
                      <div className="text-center py-1">
                        <h3 className="text-[15px] font-bold uppercase text-purple-950 tracking-wide">
                          BIÊN BẢN TIẾP NHẬN NGƯỜI {isDauThuItem ? 'ĐẦU THÚ' : 'TỰ THÚ'}
                        </h3>
                        <p className="text-[10.5px] italic text-slate-600">
                          (Căn cứ Khoản 1 Điều 146 Bộ luật Tố tụng hình sự năm 2015)
                        </p>
                      </div>

                      {/* Thời gian & Địa điểm */}
                      <div className="space-y-1 text-slate-800 leading-relaxed">
                        <p>
                          Hồi <strong>{luotNhan?.gioNhan || '11:45'}</strong> giờ ngày <strong>{luotNhan?.ngayNhan || '16/09/2026'}</strong>, tại: Trụ sở Cơ quan CSĐT Công an thành phố Hà Nội (Số 87 Trần Hưng Đạo, quận Hoàn Kiếm, TP. Hà Nội).
                        </p>
                        <p>
                          <strong>Chúng tôi gồm:</strong>
                        </p>
                        <p className="pl-3">
                          1. Cán bộ tiếp nhận: <strong className="text-slate-900">{luotNhan?.canBoNhan || 'Lê Ngọc Mai'}</strong> - Chức vụ: Cán bộ trực ban hình sự.
                        </p>
                        <p className="pl-3">
                          2. Người đưa đến / đi cùng: <span className="font-semibold text-slate-800">{extractData.dongNguoiGui || 'Không có'}</span>
                        </p>
                      </div>

                      {/* Thông tin nhân thân người tự thú / đầu thú */}
                      <div className="space-y-1 pt-1 border-t border-slate-200/80">
                        <p className="font-bold text-slate-900">
                          Tiến hành lập biên bản tiếp nhận người {isDauThuItem ? 'đầu thú' : 'tự thú'} có lý lịch sau:
                        </p>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                          <p>
                            • Họ và tên: <strong className="text-slate-950 text-[12.5px]">{extractData.nguoiGui}</strong> | Giới tính: {luotNhan?.gioiTinh || 'Nam'} | Quốc tịch: {luotNhan?.quocTich || 'Việt Nam'}
                          </p>
                          <p>
                            • Ngày, tháng, năm sinh: <strong>{luotNhan?.ngaySinh || extractData.namSinh}</strong> | Số CCCD/Định danh: <span className="font-mono font-bold text-slate-900">{extractData.cccd}</span>
                          </p>
                          <p>
                            • Nơi đăng ký thường trú: {extractData.diaChi}
                          </p>
                          <p>
                            • Nơi ở hiện tại / Lẩn trốn: {luotNhan?.noiOChinh || extractData.diaChi}
                          </p>
                          <p>
                            • Đặc điểm nhận dạng: <span className="font-medium text-slate-900">{luotNhan?.nhanDangDacBiet || (isDauThuItem ? 'Vết sẹo dài 2cm đuôi mắt phải; vết trầy xước rách da ở cẳng tay trái' : 'Nốt ruồi 0.5cm cách cánh mũi phải 1cm')}</span>
                          </p>
                          <p>
                            • Tình trạng xác minh C06: <span className="text-emerald-700 font-semibold">{luotNhan?.tinhTrangXacMinhDanhTinh === 'da_xac_minh' ? '✓ Đã xác minh trùng khớp sinh trắc học C06' : 'Đang tra cứu cơ sở dữ liệu quốc gia về dân cư'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Nội dung lời khai ban đầu */}
                      <div className="space-y-1 pt-1">
                        <p className="font-bold text-slate-900">
                          Nội dung lời khai ban đầu của người {isDauThuItem ? 'đầu thú' : 'tự thú'}:
                        </p>
                        <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-200 text-slate-800 leading-relaxed text-justify space-y-1.5">
                          <p className="italic">
                            "{extractData.noiDungTomTat}"
                          </p>
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-200/80 text-[11px]">
                            <p>• <strong>Thời gian:</strong> {extractData.thoiGian}</p>
                            <p>• <strong>Địa điểm:</strong> {extractData.diaDiem}</p>
                            <p className="col-span-2">• <strong>Người liên quan / Bị hại:</strong> {extractData.nguoiLienQuan}</p>
                          </div>
                        </div>
                      </div>

                      {/* Đồ vật tang vật giao nộp */}
                      <div className="space-y-1 pt-1">
                        <p className="font-bold text-slate-900">
                          Đồ vật, tài liệu, phương tiện tự nguyện giao nộp:
                        </p>
                        <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-300 text-amber-950">
                          <p className="font-semibold text-amber-900">
                            {luotNhan?.doVatGiaoNop || (isDauThuItem ? '01 điện thoại di động iPhone 13 Pro màu đen (đã niêm phong)' : '01 xe mô tô Honda Wave RSX BKS 29X1-567.89 và 15.000.000 VNĐ tiền mặt')}
                          </p>
                          <p className="text-[10.5px] text-amber-800 italic mt-0.5">
                            $\rightarrow$ Cán bộ đã tiến hành lập biên bản niêm phong tang vật theo quy định tại Điều 106 BLTTHS.
                          </p>
                        </div>
                      </div>

                      {/* Tình trạng sức khỏe & thương tích y tế */}
                      <div className="space-y-1 pt-1">
                        <p className="font-bold text-slate-900">
                          Tình trạng sức khỏe &amp; vết thương khi tiếp nhận:
                        </p>
                        <div className={`p-2.5 rounded-lg border text-[11px] ${luotNhan?.canhBaoAnToan?.canHoTroYTe
                          ? 'bg-rose-50 border-rose-300 text-rose-950'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          }`}>
                          {luotNhan?.canhBaoAnToan?.canHoTroYTe ? (
                            <div>
                              <strong>⚠️ Có dấu hiệu cần hỗ trợ y tế: </strong>
                              <span>{luotNhan.canhBaoAnToan.ghiChu || 'Đương sự có vết thương ở tay, đã gọi cán bộ y tế cơ quan sơ cứu khử trùng.'}</span>
                            </div>
                          ) : (
                            <div>
                              <strong>✓ Sức khỏe bình thường: </strong>
                              <span>Đương sự tỉnh táo, tiếp xúc tốt, không phát hiện vết thương tích nguy hiểm, không có biểu hiện sử dụng rượu bia hay chất kích thích.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lời cam đoan */}
                      <p className="italic text-slate-600 pt-1 text-[10.5px]">
                        Biên bản lập xong hồi {(isDauThuItem ? '16:00' : '12:30')} cùng ngày, đã đọc lại cho người {isDauThuItem ? 'đầu thú' : 'tự thú'} và người liên quan cùng nghe, công nhận đúng sự thật và ký tên, điểm chỉ dưới đây.
                      </p>

                      {/* Chữ ký & Điểm chỉ */}
                      <div className="pt-3 grid grid-cols-3 gap-2 text-center text-[10.5px]">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800">Người chứng kiến / Đi cùng</p>
                          <div className="h-7 flex items-center justify-center italic text-slate-500 font-script text-xs">
                            {isDauThuItem ? 'LeVanToan' : ''}
                          </div>
                          <p className="font-semibold text-slate-700">{isDauThuItem ? 'Lê Văn Toàn' : '(Không có)'}</p>
                        </div>

                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800">Cán bộ lập biên bản</p>
                          <div className="h-7 flex items-center justify-center italic text-blue-900 font-script text-xs">
                            LeNgocMai
                          </div>
                          <p className="font-semibold text-slate-700">{luotNhan?.canBoNhan || 'Lê Ngọc Mai'}</p>
                        </div>

                        <div className="space-y-0.5">
                          <p className="font-semibold text-purple-900">Người {isDauThuItem ? 'đầu thú' : 'tự thú'}</p>
                          <div className="h-7 flex items-center justify-center italic text-purple-900 font-script text-xs">
                            {extractData.nguoiGui.replace(/\s+/g, '')}
                          </div>
                          <p className="font-semibold text-purple-950">{extractData.nguoiGui} (Ký &amp; Điểm chỉ)</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {truongHopPhanTich === 'tu_don' && selectedFileIndex === 1 ? (
                        /* ========================================================= */
                        /* FILE #2: TRÍCH LỤC SƠ ĐỒ ĐỊA CHÍNH & HIỆN TRẠNG NGÕ ĐI   */
                        /* ========================================================= */
                        <div className="space-y-3">
                          <div className="flex items-start justify-between border-b border-slate-200 pb-2">
                            <div className="text-left text-[10px] space-y-0.5">
                              <p className="font-bold uppercase text-slate-900">SỞ TÀI NGUYÊN VÀ MÔI TRƯỜNG TP. HÀ NỘI</p>
                              <p className="font-semibold text-slate-700">VĂN PHÒNG ĐĂNG KÝ ĐẤT ĐAI HÀ NỘI</p>
                              <p className="text-slate-500 italic">Chi nhánh: Quận Cầu Giấy • Số TL: 82/TL-VPĐKĐĐ</p>
                            </div>
                            <div className="text-center space-y-0.5">
                              <p className="font-bold uppercase text-[10px] tracking-wide text-slate-900">
                                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                              </p>
                              <p className="text-[9.5px] underline font-medium text-slate-800">
                                Độc lập - Tự do - Hạnh phúc
                              </p>
                              <p className="text-[9px] text-slate-500 italic">Hà Nội, ngày 12 tháng 09 năm 2026</p>
                            </div>
                          </div>

                          <div className="text-center py-1">
                            <h3 className="text-[14.5px] font-bold uppercase text-blue-950 tracking-wide">
                              BẢN TRÍCH LỤC BẢN ĐỒ ĐỊA CHÍNH VÀ HIỆN TRẠNG SỬ DỤNG ĐẤT
                            </h3>
                            <p className="text-[10px] italic text-slate-600">
                              (Phục vụ đối soát giải quyết phản ánh ranh giới lối đi chung tại TDP số 4, phường Nghĩa Đô)
                            </p>
                          </div>

                          {/* Bảng thông số kỹ thuật thửa đất */}
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] grid grid-cols-2 gap-2">
                            <div>• <strong>Thửa đất số:</strong> 42 (Hộ ông Đỗ Viết Thắng) | Tờ bản đồ: 08</div>
                            <div>• <strong>Diện tích:</strong> 78.5 m² (Đã cấp GCN QSDĐ số CH-02918)</div>
                            <div>• <strong>Thửa liền kề:</strong> Thửa 43 (Hộ bà Nguyễn Thị H) | Tờ bản đồ: 08</div>
                            <div>• <strong>Ngõ đi chung:</strong> Ngõ 35 phố Nghĩa Đô (Lối đi dân sinh)</div>
                          </div>

                          {/* Sơ đồ trực quan mô phỏng ranh giới và phần lấn chiếm */}
                          <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 space-y-2 text-center">
                            <span className="text-[10.5px] font-bold text-slate-700 uppercase tracking-tight block">
                              SƠ ĐỒ HIỆN TRẠNG TRANH CHẤP RANH GIỚI NGÕ ĐI (TỶ LỆ 1/500)
                            </span>
                            <div className="h-44 bg-white rounded-lg border border-slate-300 relative overflow-hidden flex items-center justify-center p-3">
                              {/* Thửa 42 */}
                              <div className="absolute top-3 left-4 w-28 h-36 bg-blue-50 border-2 border-blue-500 rounded p-1 text-[10px] text-blue-950 font-bold flex flex-col justify-between text-left">
                                <span>Thửa số 42 (Hộ Đỗ Viết Thắng)</span>
                                <span className="text-[9px] text-blue-700 font-normal">DT: 78.5m²</span>
                              </div>

                              {/* Ngõ đi chung quy hoạch 2.8m */}
                              <div className="absolute top-3 left-36 w-24 h-36 bg-slate-100 border-x-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-[10px] text-slate-600 font-semibold">
                                <span className="rotate-90 block whitespace-nowrap">NGÕ ĐI CHUNG (Quy hoạch 2.8m)</span>
                                {/* Phần lấn chiếm màu đỏ nhấp nháy */}
                                <div className="absolute bottom-2 right-0 w-10 h-24 bg-rose-200/90 border-2 border-rose-600 rounded text-[9px] text-rose-950 font-bold flex items-center justify-center p-0.5 text-center leading-tight">
                                  <span>Phần lấn chiếm<br/>(1.2m x 6m)</span>
                                </div>
                              </div>

                              {/* Thửa 43 */}
                              <div className="absolute top-3 right-4 w-28 h-36 bg-amber-50 border-2 border-amber-500 rounded p-1 text-[10px] text-amber-950 font-bold flex flex-col justify-between text-left">
                                <span>Thửa số 43 (Hộ Nguyễn Thị H)</span>
                                <span className="text-[9px] text-amber-700 font-normal">DT: 82.1m²</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-around text-[10px] text-slate-600">
                              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-400 rounded-xs"></span> Thửa số 42</span>
                              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded-xs"></span> Phần xây lấn lối đi (1.2m)</span>
                              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-400 rounded-xs"></span> Thửa số 43</span>
                            </div>
                          </div>

                          {/* Nhận xét của cơ quan trích lục */}
                          <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-[11px] text-blue-950 space-y-1">
                            <strong>Kết quả kiểm tra hồ sơ địa chính gốc:</strong>
                            <p className="leading-relaxed">
                              Theo bản đồ địa chính đo vẽ năm 2005 (hệ tọa độ VN-2000), lối đi ngõ 35 tại đoạn tiếp giáp thửa 42 và 43 có chiều rộng là <strong>2.80 mét</strong>. Hiện trạng thực tế đo đạc ngày 10/09/2026 ghi nhận công trình tường bao và mái che của hộ thửa 43 làm thu hẹp ngõ chỉ còn <strong>1.60 mét</strong>, lấn vào lối đi chung <strong>1.20 mét</strong>.
                            </p>
                          </div>

                          {/* Chữ ký cán bộ đo đạc & Giám đốc VPĐKĐĐ */}
                          <div className="pt-2 grid grid-cols-2 gap-4 text-center text-[10.5px]">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-800">Cán bộ đo đạc địa chính</p>
                              <div className="h-6 flex items-center justify-center italic text-blue-900 font-script text-xs">TranThanhTung</div>
                              <p className="font-semibold text-slate-700">Trần Thanh Tùng</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-800">GIÁM ĐỐC CHI NHÁNH VPĐKĐĐ</p>
                              <div className="h-6 flex items-center justify-center italic text-blue-900 font-script text-xs">NguyenVanHoang</div>
                              <p className="font-semibold text-slate-700">Nguyễn Văn Hoàng (Đã ký đóng dấu)</p>
                            </div>
                          </div>
                        </div>
                      ) : truongHopPhanTich === 'tu_don' && selectedFileIndex === 2 ? (
                        /* ========================================================= */
                        /* FILE #3: BIÊN BẢN HÒA GIẢI CƠ SỞ TỔ DÂN PHỐ SỐ 4           */
                        /* ========================================================= */
                        <div className="space-y-3">
                          <div className="flex items-start justify-between border-b border-slate-200 pb-2">
                            <div className="text-left text-[10px] space-y-0.5">
                              <p className="font-bold uppercase text-slate-900">UBND PHƯỜNG NGHĨA ĐÔ</p>
                              <p className="font-semibold text-slate-700">TỔ DÂN PHỐ SỐ 4</p>
                              <p className="text-slate-500 italic">Số: 09/BB-HGCS</p>
                            </div>
                            <div className="text-center space-y-0.5">
                              <p className="font-bold uppercase text-[10px] tracking-wide text-slate-900">
                                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                              </p>
                              <p className="text-[9.5px] underline font-medium text-slate-800">
                                Độc lập - Tự do - Hạnh phúc
                              </p>
                              <p className="text-[9px] text-slate-500 italic">Nghĩa Đô, ngày 05 tháng 09 năm 2026</p>
                            </div>
                          </div>

                          <div className="text-center py-1">
                            <h3 className="text-[14.5px] font-bold uppercase text-purple-950 tracking-wide">
                              BIÊN BẢN HÒA GIẢI CƠ SỞ TRANH CHẤP RANH GIỚI LỐI ĐI CHUNG
                            </h3>
                            <p className="text-[10px] italic text-slate-600">
                              (Căn cứ Luật Hòa giải ở cơ sở năm 2013 &amp; Điều 202 Luật Đất đai)
                            </p>
                          </div>

                          <div className="space-y-1 text-slate-800 leading-relaxed text-[11px]">
                            <p>
                              Hôm nay, vào hồi 09 giờ 00 phút ngày 05/09/2026, tại Nhà sinh hoạt văn hóa Tổ dân phố số 4, phường Nghĩa Đô, quận Cầu Giấy, Hà Nội.
                            </p>
                            <p><strong>I. Thành phần tham gia buổi hòa giải:</strong></p>
                            <p className="pl-2">• 1. Ông Nguyễn Văn Bình - Tổ trưởng TDP số 4 (Chủ trì buổi hòa giải)</p>
                            <p className="pl-2">• 2. Bà Lê Thị Mai - Trưởng ban Công tác Mặt trận TDP số 4</p>
                            <p className="pl-2">• 3. Ông Đỗ Viết Thắng - Đại diện hộ gia đình thửa số 42 (Bên yêu cầu)</p>
                            <p className="pl-2">• 4. Bà Nguyễn Thị H - Đại diện hộ gia đình thửa số 43 (Bên bị yêu cầu)</p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1.5 leading-relaxed">
                            <p><strong>II. Diễn biến và ý kiến của các bên:</strong></p>
                            <p>• <strong>Ý kiến ông Đỗ Viết Thắng:</strong> Ngõ đi chung số 35 hình thành từ trước năm 1995, các hộ đi lại ổn định. Hộ bà H xây dựng tường bao và gác mái tôn lấn chiếm 1.2m làm các phương tiện và xe cấp cứu, PCCC không vào được. Đề nghị tự giác tháo dỡ.</p>
                            <p>• <strong>Ý kiến bà Nguyễn Thị H:</strong> Cho rằng diện tích tường bao xây dựng trên phần đất lưu không phía trước nhà do gia đình sử dụng lâu năm, không đồng ý tháo dỡ nếu chưa có quyết định giải quyết của UBND quận.</p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-[11px] text-rose-950 space-y-1">
                            <strong className="text-rose-900 font-bold">III. Kết luận của Tổ hòa giải:</strong>
                            <p className="leading-relaxed">
                              Tổ hòa giải đã vận động, giải thích quy định pháp luật về lối đi chung nhưng hai gia đình không thống nhất được phương án thỏa thuận. <strong>KẾT QUẢ: HÒA GIẢI KHÔNG THÀNH</strong>. Tổ dân phố lập biên bản hướng dẫn các bên gửi đơn lên UBND phường Nghĩa Đô để tiến hành hòa giải tranh chấp đất đai theo quy định tại Điều 202 Luật Đất đai.
                            </p>
                          </div>

                          {/* Chữ ký các bên */}
                          <div className="pt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
                            <div>
                              <p className="font-semibold text-slate-800">Bên yêu cầu</p>
                              <div className="h-6 flex items-center justify-center italic text-blue-900 font-script">DoVietThang</div>
                              <p className="font-semibold text-slate-700">Đỗ Viết Thắng</p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">Bên bị yêu cầu</p>
                              <div className="h-6 flex items-center justify-center italic text-slate-600 font-script">NguyenThiH</div>
                              <p className="font-semibold text-slate-700">Nguyễn Thị H</p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">Tổ trưởng TDP 4</p>
                              <div className="h-6 flex items-center justify-center italic text-purple-900 font-script">NguyenVanBinh</div>
                              <p className="font-semibold text-slate-700">Nguyễn Văn Bình</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* ========================================================= */
                        /* FILE #1: ĐƠN GỐC SCAN CHÍNH (ĐƠN PHẢN ÁNH KIẾN NGHỊ)     */
                        /* ========================================================= */
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
                              Hà Nội, ngày 10 tháng 9 năm 2026
                            </p>
                          </div>

                          {/* Tiêu đề Đơn */}
                          <div className="text-center py-1">
                            <h3 className="text-[15px] font-bold uppercase text-slate-950 tracking-wide">
                              {truongHopPhanTich === 'tu_don'
                                ? 'ĐƠN PHẢN ÁNH KIẾN NGHỊ'
                                : extractData.loaiNoiDung === 'Hồ sơ cấp phép xây dựng'
                                  ? 'ĐƠN ĐỀ NGHỊ CẤP GIẤY PHÉP XÂY DỰNG'
                                  : extractData.loaiNoiDung === 'Đơn phản ánh kiến nghị'
                                    ? 'ĐƠN PHẢN ÁNH KIẾN NGHỊ'
                                    : 'ĐƠN TỐ GIÁC'}
                            </h3>
                            <p className="text-[10.5px] italic text-slate-600">
                              {truongHopPhanTich === 'tu_don'
                                ? '(V/v: Tranh chấp ranh giới sử dụng đất ngõ đi chung tại ngõ 35 phố Nghĩa Đô)'
                                : extractData.loaiNoiDung === 'Hồ sơ cấp phép xây dựng'
                                  ? '(Công trình: Nhà ở riêng lẻ đô thị - 5 tầng + 1 lửng)'
                                  : extractData.loaiNoiDung === 'Đơn phản ánh kiến nghị'
                                    ? '(V/v: Cơ sở tái chế phế liệu xả khói bụi và tiếng ồn ban đêm)'
                                    : '(V/v: Tố giác hành vi lừa đảo chiếm đoạt tài sản)'}
                            </p>
                          </div>

                          {/* Kính gửi */}
                          <p className="font-semibold text-slate-900">
                            Kính gửi:{' '}
                            <span className="font-normal text-slate-800">
                              {truongHopPhanTich === 'tu_don'
                                ? 'Ủy ban nhân dân Quận Cầu Giấy - Phòng Tài nguyên và Môi trường; UBND Phường Nghĩa Đô'
                                : extractData.loaiNoiDung === 'Hồ sơ cấp phép xây dựng'
                                  ? 'Ủy ban nhân dân Quận Ba Đình - Phòng Quản lý Đô thị'
                                  : extractData.loaiNoiDung === 'Đơn phản ánh kiến nghị'
                                    ? 'Ủy ban nhân dân Quận Cầu Giấy - Phòng Tài nguyên và Môi trường'
                                    : 'Cơ quan Cảnh sát điều tra Công an thành phố Hà Nội'}
                            </span>
                          </p>

                          {/* Thông tin người làm đơn */}
                          <div className="space-y-1 pt-0.5 border-b border-slate-200/60 pb-2">
                            <p>
                              <strong>1. Người làm đơn: </strong>
                              <span
                                className={`font-semibold text-slate-900 px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'nguoiGui' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                                  }`}
                              >
                                {extractData.nguoiGui}
                              </span>{' '}
                              (Sinh năm: {extractData.namSinh} | CCCD:{' '}
                              <span
                                className={`font-label-technical px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'cccd' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                                  }`}
                              >
                                {extractData.cccd}
                              </span>
                              )
                            </p>
                            <p>
                              Địa chỉ thường trú:{' '}
                              <span
                                className={`px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'diaChi' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                                  }`}
                              >
                                {extractData.diaChi}
                              </span>{' '}
                              | SĐT: <span className="font-label-technical">{extractData.sdt}</span>
                            </p>
                            {extractData.dongNguoiGui && extractData.dongNguoiGui !== 'Không có' && (
                              <p>
                                <strong>2. Người cùng đứng đơn / Đồng sở hữu: </strong>
                                <span className="font-semibold text-slate-900">{extractData.dongNguoiGui}</span> (CCCD:{' '}
                                <span className="font-label-technical">{extractData.cccdDongNguoiGui}</span>)
                              </p>
                            )}
                            {extractData.luatSu && extractData.luatSu !== 'Không có' && (
                              <p>
                                <strong>3. Người đại diện theo ủy quyền: </strong>
                                <span className="font-semibold text-purple-900">{extractData.luatSu}</span> (Thẻ LS:{' '}
                                <span className="font-label-technical">{extractData.theLuatSu}</span>)
                              </p>
                            )}
                          </div>

                          {/* HỘP CẢNH BÁO / KẾT QUẢ AI PHÂN TÍCH */}
                          {truongHopPhanTich === 'tu_don' ? (
                            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-950 space-y-1">
                              <div className="flex items-center gap-1 font-bold text-emerald-900">
                                <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                                <span>AI ĐÃ ĐỐI SOÁT OCR &amp; DỮ LIỆU ĐỊA CHÍNH:</span>
                              </div>
                              <p className="leading-relaxed">
                                Đã bóc tách tự động thông tin chủ thể Ông Đỗ Viết Thắng, đối tượng liên quan (Hộ thửa 43) và 3 yêu cầu giải quyết tranh chấp ngõ đi. Kèm theo đủ 02 văn bản chứng minh: Trích lục địa chính 1/500 và Biên bản hòa giải cơ sở TDP 4.
                              </p>
                            </div>
                          ) : extractData.loaiNoiDung === 'Hồ sơ cấp phép xây dựng' ? (
                            <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-300 text-[11px] text-orange-950 space-y-1">
                              <div className="flex items-center gap-1 font-bold text-orange-900">
                                <span className="material-symbols-outlined text-[15px] text-orange-600">warning</span>
                                <span>AI PHÂN TÍCH &amp; CẢNH BÁO (Cần cán bộ xác minh thực địa):</span>
                              </div>
                              <p className="leading-relaxed">
                                Đối soát với CSDL Quy hoạch &amp; bản đồ chỉ giới: Bản vẽ hiện trạng có dấu hiệu chồng lấn <strong>0.35m</strong> với chỉ giới ngõ đi chung. Cần cán bộ kiểm tra thực địa trước khi tiếp nhận.
                              </p>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-950 space-y-1">
                              <div className="flex items-center gap-1 font-bold text-blue-900">
                                <span className="material-symbols-outlined text-[15px] text-blue-600">smart_toy</span>
                                <span>AI ĐÃ PHÂN TÍCH VĂN BẢN (Đã phân tích văn bản):</span>
                              </div>
                              <p className="leading-relaxed">
                                Đã trích xuất tự động thông tin người gửi, đối tượng liên quan và các yêu cầu cụ thể của người gửi đơn.
                              </p>
                            </div>
                          )}

                          {/* Nội dung chi tiết */}
                          <div className="space-y-1 pt-1 text-justify leading-relaxed">
                            <p>
                              <strong>Nội dung trình bày: </strong>
                              {extractData.noiDungTomTat}
                            </p>
                            <div className="p-2 rounded bg-slate-100/70 border border-slate-200/80 space-y-1">
                              <p>
                                • <strong>Đối tượng liên quan: </strong>
                                <span
                                  className={`font-semibold text-slate-900 px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'doiTuong' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                                    }`}
                                >
                                  {extractData.doiTuong}
                                </span>
                              </p>
                              <p>
                                • <strong>Địa điểm phát sinh: </strong>
                                <span
                                  className={`font-semibold text-slate-900 px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'dia地点' || activeHighlightKey === 'diaDiem' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                                    }`}
                                >
                                  {extractData.diaDiem}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Yêu cầu */}
                          <div className="space-y-1 pt-1">
                            <p className="font-semibold text-slate-900">Kính đề nghị Quý Cơ quan xem xét, giải quyết:</p>
                            <ol className="list-decimal list-inside space-y-0.5 pl-1 text-slate-700">
                              <li>{extractData.yeuCau1}</li>
                              <li>{extractData.yeuCau2}</li>
                              <li>{extractData.yeuCau3}</li>
                            </ol>
                          </div>

                          <p className="italic text-slate-600 pt-1 text-[11px]">
                            Tôi/Chúng tôi xin cam đoan những nội dung trên là đúng sự thật và chịu trách nhiệm trước pháp luật về nội dung đơn thư của mình.
                          </p>

                          {/* Chữ ký */}
                          <div className="pt-4 grid grid-cols-2 gap-4 text-center text-[11px]">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-800">Cán bộ một cửa tiếp nhận sơ bộ</p>
                              <div className="h-7 flex items-center justify-center italic text-slate-600 font-script text-sm">
                                NguyenMinhAnh
                              </div>
                              <p className="font-semibold text-slate-700">Nguyễn Minh Anh</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-800">Người làm đơn</p>
                              <div className="h-7 flex items-center justify-center italic text-blue-900 font-script text-sm">
                                {extractData.nguoiGui.replace(/\s+/g, '')}
                              </div>
                              <p className="font-semibold text-slate-900">{extractData.nguoiGui}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Danh sách tệp tài liệu đã tải lên với số thứ tự #1, #2... */}
              <div className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-slate-800 uppercase tracking-tight">
                      Danh sách tài liệu đã tải lên ({currentFiles.length})
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      (Bấm tệp để xem trước)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Mở hộp thoại tải lên thêm tài liệu chứng cứ kèm theo...')}
                    className="text-[11.5px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>+ Thêm tài liệu</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {currentFiles.map((f, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedFileIndex(idx);
                        showToast(`Đang mở: ${f.name}`);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left cursor-pointer transition-all ${selectedFileIndex === idx
                        ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="material-symbols-outlined text-[20px] text-rose-600 shrink-0">
                          picture_as_pdf
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold text-slate-800 truncate" title={f.name}>
                            {f.name}
                          </p>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {f.size} • {f.category === 'main' ? 'Tài liệu chính' : 'Tài liệu kèm theo'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded shrink-0 ml-1">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* BÊN PHẢI: THÔNG TIN LƯỢT NHẬN & CÁC KHỐI PHÂN TÍCH (54% Width)           */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="w-[54%] flex flex-col h-full overflow-y-auto space-y-3.5 pr-1">
          {/* =================================================================== */}
          {/* KHỐI TRUNG TÂM: MÔ HÌNH PHÂN TÍCH ĐA NGUỒN DỮ LIỆU & XÁC NHẬN CÁN BỘ */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[19px]">psychology</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                      Khu vực Phân tích AI Đa Nguồn Dữ liệu (GOVEX AI Assistant)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-100 text-blue-800 border border-blue-300 font-mono">
                      Phiên bản v{aiVersion}.0
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Phân tích kết hợp đa nguồn, không phụ thuộc bắt buộc vào OCR • Tuyệt đối không tự sinh kết luận
                  </p>
                </div>
              </div>

              {/* Trạng thái xác nhận của cán bộ */}
              <div className="flex items-center gap-2">
                {officerConfirmedAI ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs">
                    <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                    <span>Đã duyệt kết quả ({officerConfirmedAt})</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleOfficerConfirmAI}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#004ac6] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    title="Cán bộ thụ lý xác nhận kết quả phân tích AI làm cơ sở xử lý tiếp theo"
                  >
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    <span>Xác nhận kết quả AI</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dải 5 Badges nguồn dữ liệu hợp lệ được phép sử dụng */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight block mb-1.5">
                Các nguồn dữ liệu AI đang sử dụng:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {truongHopPhanTich === 'tu_don' ? (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-medium">
                      <span className="material-symbols-outlined text-[13px] text-blue-600">picture_as_pdf</span>
                      <span>1. Đơn scan &amp; Tệp đính kèm (OCR bóc tách)</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 font-medium">
                      <span className="material-symbols-outlined text-[13px] text-purple-600">person</span>
                      <span>2. Người nộp kê khai trực tuyến / Một cửa</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium">
                      <span className="material-symbols-outlined text-[13px] text-emerald-600">map</span>
                      <span>3. CSDL Địa chính &amp; Bản đồ quy hoạch</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 font-medium">
                      <span className="material-symbols-outlined text-[13px] text-indigo-600">gavel</span>
                      <span>4. Luật Khiếu nại, Tố cáo, Đất đai</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 font-medium">
                      <span className="material-symbols-outlined text-[13px] text-amber-600">inventory_2</span>
                      <span>5. CSDL Đơn thư GOVEX (Tra cứu trùng)</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-medium">
                      <span className="material-symbols-outlined text-[13px] text-blue-600">edit_note</span>
                      <span>1. Cán bộ ghi nhận trực tiếp (Không phụ thuộc OCR)</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 font-medium">
                      <span className="material-symbols-outlined text-[13px] text-purple-600">record_voice_over</span>
                      <span>2. Lời trình bày người liên quan / tố giác</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 font-medium">
                      <span className="material-symbols-outlined text-[13px] text-indigo-600">database</span>
                      <span>3. Dữ liệu đối tượng &amp; tiền sự GOVEX</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium">
                      <span className="material-symbols-outlined text-[13px] text-emerald-600">gavel</span>
                      <span>4. BLHS &amp; BLTTHS 2015 (Điều 145-147)</span>
                    </span>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium ${
                      currentFiles.length > 0 || aiVersion === 2
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      <span className="material-symbols-outlined text-[13px] text-amber-600">attach_file</span>
                      <span>5. Biên bản &amp; Tài liệu {currentFiles.length > 0 ? `(${currentFiles.length})` : '(Chưa có / Bổ sung sau)'}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Thông báo nguyên tắc pháp lý cốt lõi */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-500 shrink-0 mt-0.5">info</span>
              <p className="leading-relaxed">
                <strong>Nguyên tắc kiểm soát:</strong> AI chỉ hỗ trợ phân tích ngôn ngữ tự nhiên, tra cứu và đề xuất. Mọi kết luận, phân loại pháp lý và quyết định xử lý phải tuân theo thẩm quyền, quy định áp dụng và cơ chế xác nhận của cán bộ thụ lý.
              </p>
            </div>
          </div>

          {/* KỊCH BẢN A: KHI CHƯA ĐỦ DỮ LIỆU ĐỂ PHÂN TÍCH */}
          {aiAnalysisState === 'chua_du_du_lieu' && (
            <div className="bg-white rounded-2xl border border-amber-300 p-4 shadow-sm space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[22px]">warning</span>
                  <div>
                    <h4 className="text-[14px] font-bold text-amber-950 font-headline-md">
                      Trạng thái: Chưa đủ dữ liệu để phân tích (Kịch bản A)
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      Hệ thống AI tuân thủ nguyên tắc không tự sinh kết luận nghiệp vụ khi chưa đủ thông tin tối thiểu
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                  Không ép buộc tải tệp
                </span>
              </div>

              {/* Bảng Hướng dẫn thông tin tối thiểu cần bổ sung */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">
                  Hướng dẫn thông tin tối thiểu cần bổ sung theo từng trường hợp tiếp nhận:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <strong className="text-blue-900 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">description</span>
                      1. Đơn tiếp nhận thông thường
                    </strong>
                    <p className="text-slate-600">Họ tên người gửi, địa chỉ liên lạc, nội dung sự việc, yêu cầu giải quyết cụ thể.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <strong className="text-rose-900 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">local_police</span>
                      2. Tin báo, tố giác tội phạm
                    </strong>
                    <p className="text-slate-600">Nguồn tin tiếp nhận, thời gian, địa điểm xảy ra, đối tượng nghi vấn, dấu hiệu vi phạm ban đầu.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <strong className="text-purple-900 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">front_hand</span>
                      3. Người tự thú, đầu thú
                    </strong>
                    <p className="text-slate-600">Nhân thân người trình diện, số CCCD, thời điểm đến, nội dung tự khai, đồ vật/tang vật tự nguyện giao nộp.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <strong className="text-amber-900 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">security</span>
                      4. Bắt quả tang (Điều 111)
                    </strong>
                    <p className="text-slate-600">Hành vi đang thực hiện, địa điểm bắt giữ, tang vật thu giữ tại chỗ, người làm chứng.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
                    <strong className="text-indigo-900 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">policy</span>
                      5. Cán bộ trực tiếp phát hiện (Khoản 3 Điều 143)
                    </strong>
                    <p className="text-slate-600">Lực lượng phát hiện, kế hoạch/biện pháp nghiệp vụ (tuần tra, kiểm soát), hiện trường và tang vật tạm giữ.</p>
                  </div>
                </div>
              </div>

              {/* Form nhập mô tả ban đầu nhanh */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                <label className="block text-[11.5px] font-bold text-amber-950">
                  Cán bộ ghi nhận mô tả ban đầu để khởi chạy AI phân tích sơ bộ:
                </label>
                <textarea
                  rows={3}
                  value={directDescriptionInput}
                  onChange={(e) => setDirectDescriptionInput(e.target.value)}
                  placeholder="Nhập tóm tắt sự việc, thông tin do người liên quan cung cấp..."
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleRunAiAnalysisOnDirectInput}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    <span>Bắt đầu phân tích sơ bộ AI NLP (Không cần tải file)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Banner Bắt quả tang */}
          {isBatQuaTang && (
            <div className="bg-gradient-to-r from-rose-50 via-rose-50/70 to-amber-50/50 border border-rose-300 rounded-2xl p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-700 text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[17px]">security</span>
                  </div>
                  <div>
                    <h3 className="text-[13.5px] font-bold text-rose-950 font-headline-md tracking-tight flex items-center gap-2">
                      <span>Tiếp nhận Bắt người phạm tội quả tang</span>
                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-800 border border-rose-300 font-mono">
                        Điều 111, 112 BLTTHS 2015
                      </span>
                    </h3>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-300 shadow-2xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-rose-600">timer</span>
                  Thông báo VKSND: Trong vòng 12 giờ (Điều 110)
                </span>
              </div>
              <p className="text-[11.5px] text-rose-950 leading-relaxed pl-9">
                <strong>Nguyên tắc tiếp nhận:</strong> Lập ngay Biên bản bắt người phạm tội quả tang; niêm phong tang vật thu giữ tại chỗ (Điều 106); lấy lời khai ban đầu người bị bắt và người làm chứng. Không yêu cầu có đơn hoặc tài liệu scan từ trước.
              </p>
            </div>
          )}

          {/* Banner Cán bộ phát hiện */}
          {isCanBoPhatHien && (
            <div className="bg-gradient-to-r from-indigo-50 via-indigo-50/70 to-blue-50/50 border border-indigo-300 rounded-2xl p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-700 text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[17px]">policy</span>
                  </div>
                  <div>
                    <h3 className="text-[13.5px] font-bold text-indigo-950 font-headline-md tracking-tight flex items-center gap-2">
                      <span>Cơ quan có thẩm quyền trực tiếp phát hiện dấu hiệu tội phạm</span>
                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 font-mono">
                        Khoản 3 Điều 143 BLTTHS 2015
                      </span>
                    </h3>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-indigo-800 bg-white/80 px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs">
                  Nguồn tin do cơ quan điều tra tự phát hiện
                </span>
              </div>
              <p className="text-[11.5px] text-indigo-950 leading-relaxed pl-9">
                <strong>Nguyên tắc tiếp nhận:</strong> Phát hiện qua công tác tuần tra, kiểm soát hành chính hoặc trinh sát. Không có người nộp đơn. Cán bộ trực tiếp phát hiện lập báo cáo và đề xuất Thủ trưởng Cơ quan điều tra ra quyết định thụ lý xác minh nguồn tin.
              </p>
            </div>
          )}

          {/* =================================================================== */}
          {/* =================================================================== */}
          {/* BANNER NGUYÊN TẮC PHÁP LÝ NGHIỆP VỤ (TỰ THÚ ĐẦU THÚ / TIN BÁO TỐ GIÁC) */}
          {/* =================================================================== */}
          {isTuThuDauThu && (
            <div className="bg-gradient-to-r from-purple-50 via-purple-50/70 to-indigo-50/50 border border-purple-300 rounded-2xl p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[17px]">policy</span>
                  </div>
                  <div>
                    <h3 className="text-[13.5px] font-bold text-purple-950 font-headline-md tracking-tight flex items-center gap-2">
                      <span>Tiếp nhận &amp; Phân định Người tự thú, Đầu thú</span>
                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-100 text-purple-800 border border-purple-300 font-mono">
                        Khoản 1 Điều 4 &amp; Điều 146 BLTTHS 2015
                      </span>
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-300 shadow-2xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-rose-600">timer</span>
                    Thông báo VKSND: Trong vòng 24 giờ
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowVksndModal(true)}
                    className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-white px-2 py-1 rounded-lg border border-purple-300 hover:bg-purple-50 cursor-pointer shadow-2xs"
                  >
                    Xem mẫu thông báo VKS
                  </button>
                </div>
              </div>
              <p className="text-[11.5px] text-purple-950 leading-relaxed pl-9">
                <strong>Nguyên tắc kiểm soát:</strong> Phân định rõ: <em>Tự thú</em> là người phạm tội tự giác khai báo trước khi hành vi bị phát hiện; <em>Đầu thú</em> là người phạm tội đến trình diện sau khi hành vi bị phát hiện hoặc đang bị truy nã. AI hỗ trợ đối soát lệnh truy nã và vụ án đã có; <strong>Cán bộ thụ lý/Điều tra viên là người duy nhất xác nhận và chịu trách nhiệm pháp lý</strong>. AI tuyệt đối không tự ra kết luận điều tra hay phán quyết tội danh.
              </p>
            </div>
          )}

          {isTinBaoToGiac && !isTuThuDauThu && (
            <div className="bg-gradient-to-r from-rose-50 via-rose-50/70 to-amber-50/50 border border-rose-200/90 rounded-2xl p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[17px]">local_police</span>
                  </div>
                  <div>
                    <h3 className="text-[13.5px] font-bold text-rose-950 font-headline-md tracking-tight flex items-center gap-2">
                      <span>Tiếp nhận &amp; Xử lý Tin báo, Tố giác về tội phạm</span>
                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-800 border border-rose-300 font-mono">
                        Điều 145-147 BLTTHS 2015
                      </span>
                    </h3>
                  </div>
                </div>
                <span className="text-[11.5px] font-semibold text-rose-800 bg-white/80 px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
                  Thời hạn ban đầu: 20 ngày
                </span>
              </div>
              <p className="text-[11.5px] text-rose-900/90 leading-relaxed pl-9">
                <strong>Nguyên tắc kiểm soát:</strong> Kết quả AI mang tính chất phân tích hồ sơ và đề xuất tham khảo. Cán bộ thụ lý chịu trách nhiệm thẩm tra, xác minh tính xác thực và thực hiện quy trình theo thẩm quyền quy định tại Thông tư liên tịch 01/2021. AI không tự quyết định thụ lý hay chuyển thẩm quyền.
              </p>
            </div>
          )}

          {/* =================================================================== */}
          {/* KHỐI ①: THÔNG TIN LƯỢT NHẬN TIẾP NHẬN                               */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[19px] text-[#004ac6]">assignment</span>
                <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                  {isTuThuDauThu
                    ? 'Thông tin tiếp nhận Người tự thú, đầu thú'
                    : isTinBaoToGiac
                      ? 'Thông tin tiếp nhận nguồn tin & Người báo tin'
                      : 'Thông tin lượt nhận & Người nộp đơn'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {isTuThuDauThu && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${truongHopConfirmed === 'dau_thu'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-purple-50 text-purple-800 border-purple-300'
                    }`}>
                    <span className="material-symbols-outlined text-[13px]">
                      {truongHopConfirmed === 'dau_thu' ? 'directions_walk' : 'front_hand'}
                    </span>
                    {truongHopConfirmed === 'dau_thu' ? 'Người đầu thú' : 'Người tự thú'}
                  </span>
                )}
                {luotNhan?.yeuCauBaoMat && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                    Bảo mật danh tính
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {currentLuotNhanStatus === 'da_chuyen' ? 'Đã chuyển thụ lý' : 'Chờ xác minh ban đầu'}
                </span>
              </div>
            </div>

            {/* Grid thông tin chi tiết */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Mã lượt nhận</span>
                <span className="font-bold text-[#004ac6] text-[13px] font-mono">{luotNhan?.id || 'TB-2026-CATPHN_089'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Thời điểm tiếp nhận</span>
                <span className="font-semibold text-slate-800 text-[12.5px] font-mono">
                  {luotNhan?.ngayNhan || '16/09/2026'} {luotNhan?.gioNhan || '09:30'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">
                  {isTuThuDauThu ? 'Hình thức đến trình diện' : isTinBaoToGiac ? 'Nguồn tin / Hình thức' : 'Hình thức nhận'}
                </span>
                <span className="font-semibold text-slate-800 text-[12.5px] truncate" title={luotNhan?.hinhThucTrinhDien || luotNhan?.nguonTin || luotNhan?.hinhThuc || 'Trực tiếp'}>
                  {luotNhan?.hinhThucTrinhDien || luotNhan?.nguonTin || luotNhan?.hinhThuc || 'Trực tiếp đến trình diện'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">
                  {isTuThuDauThu ? 'Người đến trình diện' : isTinBaoToGiac ? 'Người cung cấp tin / Báo tin' : 'Người đứng đơn'}
                </span>
                <span className="font-bold text-slate-900 text-[13px] flex items-center gap-1.5">
                  <span>{luotNhan?.nguoiNop || extractData.nguoiGui || 'Nguyễn Văn A'}</span>
                  {luotNhan?.gioiTinh && (
                    <span className="text-[10.5px] font-normal text-slate-500">
                      ({luotNhan.gioiTinh} - {luotNhan.quocTich || 'Việt Nam'})
                    </span>
                  )}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Số CCCD / Định danh</span>
                <span className="font-semibold text-slate-800 text-[12.5px] font-mono flex items-center gap-1">
                  <span>{luotNhan?.cccd || extractData.cccd || '001085019284'}</span>
                  {isTuThuDauThu && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      {luotNhan?.tinhTrangXacMinhDanhTinh === 'da_xac_minh' ? 'C06 ✓' : 'C06 ?'}
                    </span>
                  )}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">
                  {isTuThuDauThu ? 'Người đi cùng / Đưa đến' : 'Số điện thoại liên hệ'}
                </span>
                <span className="font-semibold text-slate-800 text-[12.5px] truncate" title={extractData.dongNguoiGui || extractData.sdt}>
                  {isTuThuDauThu
                    ? (extractData.dongNguoiGui || 'Tự đến một mình')
                    : (luotNhan?.sdt || extractData.sdt || '0983 123 456')}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">
                  {isTuThuDauThu ? 'Nơi thường trú & Nơi ở hiện tại / Lẩn trốn' : 'Địa chỉ cư trú / Nơi ở hiện tại'}
                </span>
                <span className="font-semibold text-slate-800 text-[12.5px]">
                  {luotNhan?.diaChi || extractData.diaChi || 'Số 18 Duy Tân, Dịch Vọng Hậu, Cầu Giấy, TP. Hà Nội'}
                  {isTuThuDauThu && luotNhan?.noiOChinh && luotNhan.noiOChinh !== luotNhan.diaChi && (
                    <span className="text-purple-700 font-medium block mt-0.5 text-[11.5px]">
                      Nơi ở thực tế: {luotNhan.noiOChinh}
                    </span>
                  )}
                </span>
              </div>

              {isTuThuDauThu && (
                <div className="col-span-2 sm:col-span-3 p-2.5 rounded-xl bg-purple-50/40 border border-purple-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-purple-700 font-medium block mb-0.5">Đặc điểm nhận dạng đặc biệt</span>
                    <span className="font-semibold text-slate-800 text-[12px]">
                      {luotNhan?.nhanDangDacBiet || (isDauThuItem ? 'Vết sẹo dài 2cm đuôi mắt phải; vết trầy xước rách da ở cẳng tay trái' : 'Nốt ruồi 0.5cm cách cánh mũi phải 1cm')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-purple-700 font-medium block mb-0.5">Đồ vật, tang vật tự nguyện giao nộp</span>
                    <span className="font-semibold text-amber-800 text-[12px]">
                      {luotNhan?.doVatGiaoNop || 'Không có đồ vật giao nộp'}
                    </span>
                  </div>
                </div>
              )}

              <div className="col-span-2 sm:col-span-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Cơ quan &amp; Cán bộ tiếp nhận</span>
                  <span className="font-semibold text-slate-800 text-[12.5px]">
                    {luotNhan?.donVi || 'Công an thành phố Hà Nội'} • Cán bộ: {luotNhan?.canBoNhan || 'Lê Ngọc Mai'}
                  </span>
                </div>
                {luotNhan?.hoSoLienKetId && (
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                    Liên kết vụ việc: {luotNhan.hoSoLienKetId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* PHÂN NHÁNH HIỂN THỊ CÁC KHỐI PHÂN TÍCH AI (TỰ THÚ/ĐẦU THÚ vs ĐƠN THƯ) */}
          {/* =================================================================== */}
          {isTuThuDauThu ? (
            /* ─────────────────────────────────────────────────────────────── */
            /* CÁC KHỐI PHÂN TÍCH AI CHUYÊN BIỆT TIẾP NHẬN TỰ THÚ / ĐẦU THÚ (MỤC 12.6) */
            /* ─────────────────────────────────────────────────────────────── */
            <>
              {/* =================================================================== */}
              {/* MỤC 12.6.1: TÓM TẮT LỜI TRÌNH BÀY BAN ĐẦU                           */}
              {/* =================================================================== */}
              <div className="bg-white rounded-2xl border border-purple-200/90 shadow-2xs p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[19px] text-purple-700">summarize</span>
                    <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                      12.6.1. Tóm tắt lời trình bày ban đầu (AI bóc tách diễn biến hành vi)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    <span>Sao chép tóm tắt</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 text-xs text-slate-800 leading-relaxed space-y-2.5">
                  <p className="font-medium text-[13px] text-slate-900 leading-relaxed">
                    {extractData.noiDungTomTat}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-purple-200/70 text-[11.5px]">
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-purple-600 text-[16px] shrink-0">schedule</span>
                      <div>
                        <span className="text-slate-500 font-medium">Thời gian xảy ra: </span>
                        <strong className="text-slate-900">{extractData.thoiGian}</strong>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-purple-600 text-[16px] shrink-0">location_on</span>
                      <div>
                        <span className="text-slate-500 font-medium">Địa điểm xảy ra: </span>
                        <strong className="text-slate-900">{extractData.diaDiem}</strong>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-purple-600 text-[16px] shrink-0">person_alert</span>
                      <div>
                        <span className="text-slate-500 font-medium">Bị hại / Người liên quan: </span>
                        <strong className="text-slate-900">{extractData.nguoiLienQuan}</strong>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-purple-600 text-[16px] shrink-0">warning</span>
                      <div>
                        <span className="text-slate-500 font-medium">Hậu quả phản ánh: </span>
                        <strong className="text-rose-700">{luotNhan?.hauQuaThietHai || (isDauThuItem ? 'Bị hại tổn thương 18% sức khỏe' : '01 xe máy và 15 triệu đồng')}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* MỤC 12.6.2: TRÍCH XUẤT THỰC THỂ & ĐỒ VẬT GIAO NỘP                   */}
              {/* =================================================================== */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[19px] text-[#004ac6]">fact_check</span>
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                        12.6.2. Trích xuất thực thể &amp; Đồ vật tự nguyện giao nộp
                      </h3>
                      <p className="text-[11px] text-slate-500">Phân định rõ người, địa điểm, sự kiện và tang vật chứng cứ giao nộp</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Trích xuất OCR &amp; Đối soát C06
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Cột 1: Thực thể Người & Địa điểm */}
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-800 flex items-center gap-1 text-[12px]">
                        <span className="material-symbols-outlined text-[16px] text-blue-600">person</span>
                        Thực thể Con người
                      </span>
                      <p className="text-slate-700">• <strong>Người trình diện:</strong> {extractData.nguoiGui} (CCCD: {extractData.cccd})</p>
                      <p className="text-slate-700">• <strong>Người đi cùng:</strong> {extractData.dongNguoiGui || 'Không có'}</p>
                      <p className="text-slate-700">• <strong>Bị hại:</strong> {isDauThuItem ? 'Anh Trần Hoàng M (Thương tích 18%)' : 'Công ty Thiết bị Tân Phát'}</p>
                      <p className="text-slate-700">• <strong>Đồng phạm:</strong> {isDauThuItem ? 'Chưa phát hiện đồng phạm' : 'Khai nhận thực hiện một mình'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-800 flex items-center gap-1 text-[12px]">
                        <span className="material-symbols-outlined text-[16px] text-indigo-600">pin_drop</span>
                        Thực thể Địa điểm &amp; Thời gian
                      </span>
                      <p className="text-slate-700">• <strong>Hiện trường xảy ra:</strong> {extractData.diaDiem}</p>
                      <p className="text-slate-700">• <strong>Nơi cất giấu tang vật:</strong> {isDauThuItem ? 'Bãi đất trống phố Trần Thái Tông (đang xác minh)' : 'Nhà riêng tại Xã Tân Triều, Thanh Trì, Hà Nội'}</p>
                      <p className="text-slate-700">• <strong>Thời điểm trình diện:</strong> {luotNhan?.gioNhan || '11:45'} {luotNhan?.ngayNhan || '16/09/2026'}</p>
                    </div>
                  </div>

                  {/* Cột 2: Đồ vật tang vật tự nguyện nộp */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-300 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1 border-b border-amber-200">
                        <span className="font-bold text-amber-950 flex items-center gap-1 text-[12px]">
                          <span className="material-symbols-outlined text-[16px] text-amber-600">inventory_2</span>
                          Đồ vật / Tang vật tự nguyện giao nộp
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                          Điều 106 BLTTHS
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-2 text-slate-800">
                        <p className="font-semibold text-slate-900 text-[12.5px]">
                          {luotNhan?.doVatGiaoNop || (isDauThuItem ? '01 điện thoại di động iPhone 13 Pro màu đen' : '01 xe mô tô Honda Wave RSX BKS 29X1-567.89 và 15.000.000 VNĐ tiền mặt')}
                        </p>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                          <li>Tình trạng niêm phong: <strong>{tuThuChecklist.bbNiemPhong ? '✓ Đã lập biên bản niêm phong' : 'Chưa niêm phong'}</strong></li>
                          <li>Nơi bảo quản hiện tại: Phòng Trực ban hình sự</li>
                          <li>Biện pháp: Chuyển kho vật chứng sau khi phân công Điều tra viên thụ lý.</li>
                        </ul>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTuThuChecklist(prev => ({ ...prev, bbNiemPhong: !prev.bbNiemPhong }));
                        showToast(tuThuChecklist.bbNiemPhong ? 'Đã hủy đánh dấu niêm phong tang vật' : '✓ Đã xác nhận lập Biên bản niêm phong tang vật (Điều 106 BLTTHS)!');
                      }}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer ${tuThuChecklist.bbNiemPhong
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {tuThuChecklist.bbNiemPhong ? 'verified' : 'lock'}
                      </span>
                      <span>{tuThuChecklist.bbNiemPhong ? '✓ Đã lập Biên bản niêm phong' : 'Lập Biên bản niêm phong tang vật (Điều 106)'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* MỤC 12.6.3: ĐỐI SOÁT CSDL LỆNH TRUY NÃ & VỤ ÁN HÌNH SỰ (PHÂN ĐỊNH)    */}
              {/* =================================================================== */}
              <div className="bg-white rounded-2xl border border-indigo-200/90 shadow-2xs p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[19px] text-indigo-700">travel_explore</span>
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                        12.6.3. Đối soát CSDL Lệnh truy nã &amp; Vụ án hình sự
                      </h3>
                      <p className="text-[11px] text-slate-500">Hỗ trợ phân định Tự thú vs Đầu thú — Không tự động quyết định pháp lý</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Cán bộ tự quyết định phân loại (Điều 4 BLTTHS)
                  </span>
                </div>

                {/* Kết quả đối soát CSDL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Hộp 1: Tra cứu CSDL Lệnh truy nã C02 */}
                  <div className={`p-3 rounded-xl border space-y-2 ${isDauThuItem
                    ? 'bg-rose-50/70 border-rose-300'
                    : 'bg-emerald-50/60 border-emerald-300'
                    }`}>
                    <div className="flex items-center justify-between">
                      <strong className={`flex items-center gap-1 ${isDauThuItem ? 'text-rose-900' : 'text-emerald-900'}`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {isDauThuItem ? 'crisis_alert' : 'verified_user'}
                        </span>
                        CSDL Lệnh truy nã toàn quốc (C02)
                      </strong>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isDauThuItem ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
                        }`}>
                        {isDauThuItem ? 'CÓ LỆNH TRUY NÃ' : 'KHÔNG CÓ LỆNH TRUY NÃ'}
                      </span>
                    </div>

                    {isDauThuItem ? (
                      <div className="space-y-1 text-slate-800">
                        <p className="font-semibold text-rose-900">
                          Phát hiện Quyết định truy nã số 14/QĐ-CQĐT ngày 02/08/2026
                        </p>
                        <p className="text-[11px] text-slate-600">
                          - Cơ quan ban hành: Cơ quan CSĐT Công an TP. Hà Nội<br />
                          - Tội danh: Cố ý gây thương tích (Khoản 2 Điều 134 BLHS)<br />
                          - Đối tượng: Lê Quốc Tuấn (Trùng khớp 100% CCCD và đặc điểm nhận dạng)
                        </p>
                        <p className="text-[10.5px] text-rose-800 font-semibold pt-0.5">
                          $\rightarrow$ Hành vi đã bị phát hiện &amp; có lệnh truy nã: Thể hiện đây là trường hợp ĐẦU THÚ.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-slate-800">
                        <p className="font-semibold text-emerald-900">
                          Không phát hiện Quyết định truy nã nào đối với công dân
                        </p>
                        <p className="text-[11px] text-slate-600">
                          - Họ tên: Phạm Văn Hùng | CCCD: 001095018392<br />
                          - Đối soát hệ thống C02 toàn quốc: Âm tính (Chưa có tiền án, tiền sự).
                        </p>
                        <p className="text-[10.5px] text-emerald-800 font-semibold pt-0.5">
                          $\rightarrow$ Không có tiền sự, chưa bị truy nã: Hỗ trợ cán bộ xác định TỰ THÚ.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hộp 2: Tra cứu CSDL Vụ án đã khởi tố */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-blue-600">folder_open</span>
                        CSDL Vụ án &amp; Tin báo đã khởi tố
                      </strong>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        Địa bàn CATP Hà Nội
                      </span>
                    </div>

                    {isDauThuItem ? (
                      <div className="space-y-1 text-slate-800">
                        <p className="font-semibold text-blue-900">
                          Đã khởi tố Vụ án hình sự số 42/QĐ-KTVA (20/07/2026)
                        </p>
                        <p className="text-[11px] text-slate-600">
                          - Đơn vị thụ lý: Đội CSHS Công an quận Cầu Giấy<br />
                          - Khởi tố bị can vắng mặt ngày 01/08/2026, sau đó ra QĐ truy nã số 14.
                        </p>
                        <p className="text-[10.5px] text-blue-800 font-semibold pt-0.5">
                          $\rightarrow$ Gợi ý: Ghép đối tượng vào hồ sơ vụ án số 42 đang điều tra.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-slate-800">
                        <p className="font-semibold text-slate-900">
                          Chưa ghi nhận Vụ án hay Đơn tố giác nào tại CCN Thanh Oai
                        </p>
                        <p className="text-[11px] text-slate-600">
                          - Tra cứu CSDL tin báo 30 ngày qua tại Công an huyện Thanh Oai: Không có báo án trộm kho bãi ngày 12/09/2026.<br />
                          - Hành vi phạm tội hoàn toàn chưa bị phát hiện trước thời điểm trình diện.
                        </p>
                        <p className="text-[10.5px] text-purple-800 font-semibold pt-0.5">
                          $\rightarrow$ Căn cứ Khoản 1 Điều 4 BLTTHS: Đủ điều kiện xác nhận là TỰ THÚ.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Khung tương tác cho Cán bộ xác nhận phân loại */}
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 text-xs">
                      Cán bộ thụ lý xác nhận kết luận phân loại trường hợp trình diện:
                    </span>
                    <span className="text-[10.5px] text-indigo-700 font-medium">Lưu vào Lịch sử điều chỉnh phân loại</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <label className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${truongHopConfirmed === 'tu_thu'
                      ? 'bg-purple-100 border-purple-400 text-purple-950 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}>
                      <input
                        type="radio"
                        name="truongHopRadio"
                        checked={truongHopConfirmed === 'tu_thu'}
                        onChange={() => {
                          setTruongHopConfirmed('tu_thu');
                          setLyDoXacNhanPhanLoai('Hành vi chưa bị cơ quan điều tra phát hiện, người phạm tội tự nguyện đến trình diện trước khi có đơn tố giác -> Phân loại chính thức: Người tự thú.');
                        }}
                        className="text-purple-600"
                      />
                      <span>1. Người tự thú (Điều 4 BLTTHS)</span>
                    </label>

                    <label className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${truongHopConfirmed === 'dau_thu'
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}>
                      <input
                        type="radio"
                        name="truongHopRadio"
                        checked={truongHopConfirmed === 'dau_thu'}
                        onChange={() => {
                          setTruongHopConfirmed('dau_thu');
                          setLyDoXacNhanPhanLoai('Đối tượng đã có Quyết định truy nã số 14/QĐ-CQĐT ngày 02/08/2026, ra trình diện sau khi hành vi và danh tính đã bị cơ quan điều tra phát hiện -> Phân loại chính thức: Người đầu thú.');
                        }}
                        className="text-amber-600"
                      />
                      <span>2. Người đầu thú (Điều 4 BLTTHS)</span>
                    </label>

                    <label className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${truongHopConfirmed === 'can_can_bo_xac_nhan'
                      ? 'bg-blue-100 border-blue-400 text-blue-950 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}>
                      <input
                        type="radio"
                        name="truongHopRadio"
                        checked={truongHopConfirmed === 'can_can_bo_xac_nhan'}
                        onChange={() => {
                          setTruongHopConfirmed('can_can_bo_xac_nhan');
                          setLyDoXacNhanPhanLoai('Chờ Đội CSHS và Viện kiểm sát đối soát thêm hồ sơ hiện trường trước khi kết luận chính thức.');
                        }}
                        className="text-blue-600"
                      />
                      <span>3. Cần xác minh thêm</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-900 mb-1">
                      Căn cứ / Lý do cán bộ xác nhận phân loại:
                    </label>
                    <input
                      type="text"
                      value={lyDoXacNhanPhanLoai}
                      onChange={(e) => setLyDoXacNhanPhanLoai(e.target.value)}
                      className="w-full p-2 bg-white border border-indigo-300 rounded-lg text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* MỤC 12.6.4: CẢNH BÁO AN TOÀN, Y TẾ & THÔNG TIN CẦN XÁC MINH THÊM    */}
              {/* =================================================================== */}
              <div className="bg-white rounded-2xl border border-rose-200/90 shadow-2xs p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-rose-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[19px] text-rose-600">emergency</span>
                    <h3 className="text-[14px] font-bold text-rose-950 font-headline-md tracking-tight">
                      12.6.4. Cảnh báo an toàn, y tế &amp; Tình huống cần ưu tiên xử lý ngay
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Ưu tiên giải quyết tại chỗ
                  </span>
                </div>

                {/* 4 Cảnh báo tình huống an toàn */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className={`p-2.5 rounded-xl border flex items-start gap-2 ${luotNhan?.canhBaoAnToan?.canHoTroYTe
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                    <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">medical_services</span>
                    <div>
                      <strong>1. Hỗ trợ y tế khẩn cấp: </strong>
                      <span>{luotNhan?.canhBaoAnToan?.canHoTroYTe ? (luotNhan.canhBaoAnToan.ghiChu || 'Có vết thương ở cẳng tay trái cần sơ cứu') : 'Không phát hiện thương tích'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border bg-slate-50 border-slate-200 flex items-start gap-2 text-slate-700">
                    <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">shield</span>
                    <div>
                      <strong>2. Nguy cơ bị trả thù: </strong>
                      <span>Chưa ghi nhận đe dọa vũ lực đối với người trình diện hoặc thân nhân</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border bg-slate-50 border-slate-200 flex items-start gap-2 text-slate-700">
                    <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0">family_restroom</span>
                    <div>
                      <strong>3. Bảo vệ người / tài sản: </strong>
                      <span>Đã hướng dẫn gia đình các biện pháp an ninh trật tự tại nơi cư trú</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border bg-purple-50 border-purple-200 flex items-start gap-2 text-purple-950">
                    <span className="material-symbols-outlined text-[18px] text-purple-600 shrink-0">lock</span>
                    <div>
                      <strong>4. Bảo quản đồ vật / niêm phong: </strong>
                      <span>{luotNhan?.doVatGiaoNop ? 'Có đồ vật tự nguyện giao nộp cần bảo quản nghiêm ngặt' : 'Không có đồ vật giao nộp'}</span>
                    </div>
                  </div>
                </div>

                {/* Nội dung cần xác minh thêm */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 block">Nội dung Điều tra viên cần tập trung xác minh:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11.5px]">
                    <li>Xác minh nhân chứng tại địa điểm xảy ra sự việc ({extractData.diaDiem}).</li>
                    <li>Trích xuất dữ liệu camera an ninh khu vực xung quanh để đối soát lời khai mốc thời gian {extractData.thoiGian}.</li>
                    <li>{isDauThuItem ? 'Tìm kiếm hung khí gây án tại khu vực bãi đất trống theo lời khai ban đầu.' : 'Kiểm tra kho bãi tại CCN Thanh Oai để làm rõ phương thức, thủ đoạn cắt khóa két.'}</li>
                  </ul>
                </div>
              </div>

              {/* =================================================================== */}
              {/* MỤC 12.6.5 & 12.6.6: ĐỀ XUẤT BƯỚC NGHIỆP VỤ & THỦ TỤC TỐ TỤNG       */}
              {/* =================================================================== */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[19px] text-purple-700">alt_route</span>
                    <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                      12.6.6. Đề xuất bước nghiệp vụ tiếp theo &amp; Thủ tục tố tụng
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Cán bộ lựa chọn quyết định</span>
                </div>

                {/* Checklist 5 thủ tục tố tụng */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">Checklist thủ tục tố tụng theo Điều 146 BLTTHS:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tuThuChecklist.bbNhan}
                        onChange={(e) => setTuThuChecklist(prev => ({ ...prev, bbNhan: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 text-purple-600 rounded"
                      />
                      <div>
                        <strong className="text-slate-800">1. Biên bản tiếp nhận (Mẫu 02-BCA)</strong>
                        <p className="text-slate-500 text-[11px]">Đã lập và ký xác nhận cùng người trình diện</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tuThuChecklist.bbNiemPhong}
                        onChange={(e) => setTuThuChecklist(prev => ({ ...prev, bbNiemPhong: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 text-purple-600 rounded"
                      />
                      <div>
                        <strong className="text-slate-800">2. Niêm phong tang vật (Điều 106)</strong>
                        <p className="text-slate-500 text-[11px]">Đã niêm phong đồ vật giao nộp vào kho</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 p-2 rounded-lg bg-rose-50/70 border border-rose-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tuThuChecklist.tbVksnd}
                        onChange={(e) => setTuThuChecklist(prev => ({ ...prev, tbVksnd: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 text-rose-600 rounded"
                      />
                      <div>
                        <strong className="text-rose-950">3. Thông báo VKSND trong 24h</strong>
                        <p className="text-rose-700 text-[11px]">Bắt buộc theo Khoản 1 Điều 146 BLTTHS</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tuThuChecklist.phanCongDTV}
                        onChange={(e) => setTuThuChecklist(prev => ({ ...prev, phanCongDTV: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 text-purple-600 rounded"
                      />
                      <div>
                        <strong className="text-slate-800">4. Phân công Điều tra viên</strong>
                        <p className="text-slate-500 text-[11px]">Giao Đội nghiệp vụ thụ lý chính thức</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 3 Hướng xử lý đề xuất */}
                <div className="space-y-2.5 text-xs pt-1">
                  <span className="font-bold text-slate-800 block">Lựa chọn hướng xử lý tiếp theo:</span>

                  <div
                    onClick={() => {
                      setHuongXuLy('tiep-nhan');
                      setOfficerNote(`Căn cứ Khoản 1 Điều 146 BLTTHS: Tiếp nhận và thụ lý giải quyết trường hợp người ${truongHopConfirmed === 'dau_thu' ? 'đầu thú' : 'tự thú'}. Phân công Điều tra viên lấy lời khai chi tiết và gửi thông báo cho VKSND trong 24 giờ.`);
                    }}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${huongXuLy === 'tiep-nhan'
                      ? 'border-purple-600 bg-purple-50/40 shadow-xs ring-1 ring-purple-200'
                      : 'border-slate-200 hover:border-purple-300 bg-slate-50/50'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-[13px] text-slate-900">Hướng 1: Thụ lý giải quyết người {truongHopConfirmed === 'dau_thu' ? 'đầu thú' : 'tự thú'} theo thẩm quyền</strong>
                          <span className="text-[10.5px] font-bold px-2 py-0.2 rounded-full bg-purple-100 text-purple-800">Đề xuất</span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">
                          <strong>Căn cứ: </strong>Điều 146 BLTTHS 2015. Lập hồ sơ nguồn tin tội phạm chính thức, phân công Điều tra viên thụ lý và thông báo ngay cho VKSND cùng cấp.
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-purple-600 text-xl shrink-0">
                        {huongXuLy === 'tiep-nhan' ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  </div>

                  {isDauThuItem && (
                    <div
                      onClick={() => {
                        setHuongXuLy('ghep');
                        setOfficerNote(`Căn cứ Quyết định truy nã số 14/QĐ-CQĐT: Đối tượng ra đầu thú theo hồ sơ vụ án đang thụ lý TN-2026-CSĐT_014. Đề xuất ghép lượt nhận vào hồ sơ vụ việc hiện tại.`);
                      }}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${huongXuLy === 'ghep'
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-200'
                        : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-[13px] text-slate-900">Hướng 2: Ghép vào Hồ sơ vụ án đang thụ lý ({luotNhan?.hoSoLienKetId || 'TN-2026-CSĐT_014'})</strong>
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed">
                            <strong>Căn cứ: </strong>Đã có quyết định truy nã và vụ án khởi tố trước đó. Ghép người đầu thú vào vụ án hiện có, đình nã đối tượng theo quy định.
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-indigo-600 text-xl shrink-0">
                          {huongXuLy === 'ghep' ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div
                    onClick={() => {
                      setHuongXuLy('ban-giao');
                      setOfficerNote('Căn cứ thẩm quyền điều tra theo lãnh thổ: Vụ việc xảy ra tại địa bàn ngoài quận/huyện tiếp nhận ban đầu. Đề xuất bàn giao người và tang vật cho Cơ quan CSĐT có thẩm quyền.');
                    }}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${huongXuLy === 'ban-giao'
                      ? 'border-amber-600 bg-amber-50/40 shadow-xs ring-1 ring-amber-200'
                      : 'border-slate-200 hover:border-amber-300 bg-slate-50/50'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-[13px] text-slate-900">Hướng 3: Bàn giao chuyển Cơ quan điều tra có thẩm quyền</strong>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">
                          <strong>Căn cứ: </strong>Khoản 2 Điều 146 BLTTHS. Chuyển giao người tự thú/đầu thú cùng tang vật cho cơ quan thụ lý vụ việc theo địa bàn.
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-amber-600 text-xl shrink-0">
                        {huongXuLy === 'ban-giao' ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ý kiến cán bộ & Nút hành động */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Ý kiến đề xuất của cán bộ tiếp nhận:
                    </label>
                    <textarea
                      rows={2}
                      value={officerNote}
                      onChange={(e) => setOfficerNote(e.target.value)}
                      placeholder="Nhập ý kiến chuyên môn của cán bộ..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowVksndModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px] text-purple-700">timer</span>
                      <span>In Thông báo VKSND (24h)</span>
                    </button>

                    <div className="flex items-center gap-2 flex-wrap">
                      {huongXuLy === 'ghep' ? (
                        <button
                          type="button"
                          onClick={() => setShowGhepModal(true)}
                          className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">merge_type</span>
                          <span>Xác nhận ghép vụ việc</span>
                        </button>
                      ) : huongXuLy === 'ban-giao' ? (
                        <button
                          type="button"
                          onClick={() => setShowBanGiaoModal(true)}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                          <span>Bàn giao cơ quan khác</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowSubmitModal(true)}
                          className="px-4.5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          <span>Thụ lý Tự thú / Đầu thú &amp; Phân công</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : truongHopPhanTich === 'tu_don' ? (
            /* =================================================================== */
            /* TRƯỜNG HỢP 1: TỪ ĐƠN (USER NHẬP THÔNG TIN VÀ TẢI FILE TÀI LIỆU SỐ HÓA) */
            /* =================================================================== */
            <TuDonAnalysisBlocks
              checklistDieuKienThuLy={checklistDieuKienThuLy}
              setChecklistDieuKienThuLy={setChecklistDieuKienThuLy}
              checklistXacMinhDonThu={checklistXacMinhDonThu}
              setChecklistXacMinhDonThu={setChecklistXacMinhDonThu}
              huongXuLyDonThu={huongXuLyDonThu}
              setHuongXuLyDonThu={setHuongXuLyDonThu}
              officerNoteDonThu={officerNoteDonThu}
              setOfficerNoteDonThu={setOfficerNoteDonThu}
              showToast={showToast}
              onOpenSubmitModal={() => setShowSubmitModal(true)}
            />
          ) : (
            /* =================================================================== */
            /* TRƯỜNG HỢP 2: TIẾP NHẬN TIN BÁO TỐ GIÁC (CÓ THỂ THIẾU TÀI LIỆU/THÔNG TIN) */
            /* =================================================================== */
            <>
              {/* BANNER NGHIỆP VỤ: ĐẶC THÙ TIN BÁO TỐ GIÁC CÓ THỂ THIẾU TÀI LIỆU */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-slate-50 border border-amber-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[19px]">notification_important</span>
                    </span>
                    <div>
                      <h4 className="text-[13.5px] font-bold text-amber-950 font-headline-md tracking-tight flex items-center gap-2">
                        <span>Trường hợp 2: Tiếp nhận Tin báo, Tố giác tội phạm (Điều 145, 146, 147 BLTTHS 2015)</span>
                      </h4>
                      <p className="text-[11px] text-amber-900/80">
                        Nguồn tin tiếp nhận từ quần chúng nhân dân / Lời trình bày trực tiếp / Đường dây nóng — <strong>Có thể chưa có đơn chính thức hoặc thiếu tài liệu chứng cứ ban đầu</strong>
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">timer</span>
                    <span>Hạn thụ lý xác minh: 20 ngày</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200/60 text-[11px] text-amber-950 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[15px] text-amber-700 shrink-0 mt-0.5">info</span>
                  <p className="leading-relaxed">
                    <strong>Nguyên tắc tiếp nhận bắt buộc:</strong> Cơ quan có thẩm quyền không được từ chối tiếp nhận tố giác, tin báo tội phạm chỉ vì lý do &quot;chưa đủ tài liệu, chứng cứ&quot;. Hệ thống AI GOVEX ứng dụng NLP bóc tách từ thông tin cán bộ nhập trực tiếp, phân tách thông tin thành <strong>3 Tầng</strong>, trong đó <strong>Tầng 2 làm nổi bật các nội dung còn thiếu cần khẩn trương xác minh</strong>.
                  </p>
                </div>
              </div>
              {/* =================================================================== */}
              {/* MỤC 5.1: TÓM TẮT SỰ VIỆC (AI SYNTHESIS)                            */}
              {/* =================================================================== */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[19px] text-indigo-600">summarize</span>
                    <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                      5.1. Tóm tắt sự việc (AI tổng hợp bóc tách)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    <span>Sao chép tóm tắt</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-800 leading-relaxed space-y-2">
                  <p className="font-medium text-[13px] text-slate-900">
                    {extractData.noiDungTomTat}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-indigo-100/80">
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-indigo-500 text-[16px] shrink-0">schedule</span>
                      <div>
                        <span className="text-slate-500 font-medium">Thời gian xảy ra: </span>
                        <strong className="text-slate-800">{extractData.thoiGian}</strong>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-indigo-500 text-[16px] shrink-0">location_on</span>
                      <div>
                        <span className="text-slate-500 font-medium">Địa điểm xảy ra: </span>
                        <strong className="text-slate-800">{extractData.diaDiem}</strong>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-indigo-500 text-[16px] shrink-0">person_alert</span>
                      <div>
                        <span className="text-slate-500 font-medium">Chủ thể bị tố giác: </span>
                        <strong className="text-rose-700">{extractData.doiTuong}</strong>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-indigo-500 text-[16px] shrink-0">warning</span>
                      <div>
                        <span className="text-slate-500 font-medium">Hậu quả phản ánh: </span>
                        <strong className="text-rose-700">{luotNhan?.hauQuaThietHai || 'Thiệt hại ước tính trên 2.8 tỷ đồng'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* =================================================================== */}
              {/* MỤC 5.2: MÔ HÌNH PHÂN TÍCH 3 TẦNG THÔNG TIN (MULTI-SOURCE MODEL)   */}
              {/* =================================================================== */}
              <div className={`bg-white rounded-2xl border ${isEditingExtract ? 'border-blue-400 shadow-md ring-2 ring-blue-100' : 'border-slate-200/90 shadow-2xs'} p-4 space-y-3.5 transition-all`}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[19px] text-[#004ac6]">layers</span>
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight flex items-center gap-2">
                        <span>5.2. Mô hình Phân tích 3 Tầng Thông tin (Multi-Source AI Model)</span>
                        {isOfficialData && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Dữ liệu chính thức cán bộ đã xác nhận
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-500">Phân định rõ: Tầng 1 (Dữ kiện Fact) — Tầng 2 (Chưa xác minh) — Tầng 3 (Nhận định &amp; Đề xuất AI)</p>
                    </div>
                  </div>

                  {isEditingExtract ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveExtract}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-[#004ac6] text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">save</span>
                        <span>Xác nhận &amp; Lưu</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelExtract}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                      >
                        <span>Hủy</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingExtract(true)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg text-[#004ac6] hover:bg-blue-50 border border-blue-200 cursor-pointer shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      <span>Chỉnh sửa thông tin</span>
                    </button>
                  )}
                </div>

                {/* HIỂN THỊ 3 TẦNG THÔNG TIN THEO YÊU CẦU GOVEX MỤC B */}
                <div className="space-y-3 text-xs">
                  {/* TẦNG 1: DỮ KIỆN CUNG CẤP (FACT) */}
                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                        <span>TẦNG 1: DỮ KIỆN ĐÃ CUNG CẤP (FACT)</span>
                      </span>
                      <span className="text-[10.5px] font-semibold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200">
                        Nguồn: Cán bộ ghi nhận &amp; Lời khai trực tiếp
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                      <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                        <span className="text-slate-400 block text-[10.5px]">Người cung cấp tin / Báo tin:</span>
                        <p className="font-semibold text-slate-900">{extractData.nguoiGui}</p>
                        <p className="text-[11px] text-slate-600">CCCD: <span className="font-mono">{extractData.cccd}</span> | SĐT: <span className="font-mono">{extractData.sdt}</span></p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                        <span className="text-slate-400 block text-[10.5px]">Đối tượng bị tố giác / Nghi vấn:</span>
                        <p className="font-semibold text-rose-800">{extractData.doiTuong}</p>
                        <p className="text-[11px] text-slate-600">{extractData.chucVu} - {extractData.congTyBiToGiac} (MST: {extractData.mstCongTy})</p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                        <span className="text-slate-400 block text-[10.5px]">Thời gian &amp; Địa bàn xảy ra:</span>
                        <p className="font-medium text-slate-800"><strong>Thời gian:</strong> {extractData.thoiGian}</p>
                        <p className="text-[11px] text-slate-700"><strong>Địa điểm:</strong> {extractData.diaDiem}</p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                        <span className="text-slate-400 block text-[10.5px]">Đồ vật / Tang vật / Thiệt hại bước đầu:</span>
                        <p className="font-semibold text-rose-800">
                          {tangVatDirectInput || luotNhan?.tangVatThuGiu || luotNhan?.hauQuaThietHai || 'Thiệt hại ước tính trên 2.8 tỷ đồng'}
                        </p>
                        <p className="text-[11px] text-slate-500 italic">Đã lập danh mục vào sổ tiếp nhận</p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-blue-100 sm:col-span-2 space-y-1">
                        <span className="text-slate-400 block text-[10.5px]">Diễn biến vụ việc ghi nhận:</span>
                        <p className="text-slate-800 text-[12px] leading-relaxed">
                          {extractData.noiDungTomTat}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10.5px] text-blue-900 font-medium pt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-blue-600">verified</span>
                      <span>Hệ thống chỉ trích xuất từ dữ liệu cán bộ nhập và lời khai — Tuyệt đối không tự ý bổ sung tình tiết.</span>
                    </div>
                  </div>

                  {/* TẦNG 2: THÔNG TIN CHƯA XÁC MINH (UNVERIFIED) */}
                  <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                        <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                        <span>TẦNG 2: THÔNG TIN CHƯA XÁC MINH (UNVERIFIED)</span>
                      </span>
                      <span className="text-[10.5px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                        Cần cán bộ kiểm tra thực địa &amp; Thu thập thêm
                      </span>
                    </div>

                    <div className="space-y-2 text-slate-800">
                      <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 space-y-1">
                        <strong className="text-amber-900 block text-[11px]">1. Làm rõ vai trò đồng phạm của người liên quan:</strong>
                        <p className="text-slate-700 text-[11.5px]">
                          {extractData.nguoiLienQuan || 'Bà Vũ Mai H (Kế toán trưởng kiêm Thủ quỹ)'}: Chưa có lời khai đối chất, chưa xác định rõ có tham gia bàn bạc từ trước hay chỉ thực hiện ký duyệt theo phân công của người đứng đầu.
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-rose-900 text-[11px]">2. Cảnh báo mâu thuẫn lệch số liệu chứng từ:</strong>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Lệch 300 triệu VNĐ</span>
                        </div>
                        <p className="text-slate-700 text-[11.5px]">
                          Hợp đồng góp vốn ghi 2.800.000.000 VNĐ nhưng tổng phiếu thu và ủy nhiệm chi chỉ thể hiện 2.500.000.000 VNĐ. Cần yêu cầu người báo tin cung cấp biên lai đối ứng cho 300 triệu còn lại hoặc đối chiếu sao kê tài khoản ngân hàng thụ hưởng.
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 space-y-1">
                        <strong className="text-amber-900 block text-[11px]">3. Kiểm tra tính pháp lý quy hoạch thực tế:</strong>
                        <p className="text-slate-700 text-[11.5px]">
                          Hồ sơ chưa có văn bản phê duyệt quy hoạch 1/500 và giấy phép xây dựng tại khu vực {extractData.diaDiem}. Cần gửi phiếu xác minh sang Phòng Quản lý Đô thị / Sở Xây dựng.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10.5px] text-amber-900 font-medium pt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-amber-600">notification_important</span>
                      <span>Cán bộ thụ lý cần xác minh thực địa và đối chiếu chứng cứ trước khi kết luận theo Điều 147 BLTTHS.</span>
                    </div>
                  </div>

                  {/* TẦNG 3: NHẬN ĐỊNH & ĐỀ XUẤT AI (SUGGESTION) */}
                  <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 flex items-center gap-1.5 text-xs">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-bold">3</span>
                        <span>TẦNG 3: NHẬN ĐỊNH &amp; ĐỀ XUẤT AI (SUGGESTION)</span>
                      </span>
                      <span className="text-[10.5px] font-semibold text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded-md border border-purple-200">
                        Chỉ mang tính chất tham khảo — Cán bộ quyết định
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-purple-200/80 space-y-2 text-slate-800">
                      <div>
                        <span className="text-purple-900 font-bold block text-[11px]">Căn cứ pháp lý nghiệp vụ gợi ý:</span>
                        <p className="text-[11.5px] text-slate-700 mt-0.5">
                          {isBatQuaTang
                            ? 'Điều 111, 112 BLTTHS 2015 (Bắt người phạm tội quả tang); Điều 106 BLTTHS (Bảo quản, niêm phong vật chứng); Điều 110 BLTTHS (Thông báo VKSND trong 12h).'
                            : isCanBoPhatHien
                              ? 'Khoản 3 Điều 143 BLTTHS 2015 (Cơ quan có thẩm quyền trực tiếp phát hiện); Thông tư liên tịch 01/2021 về phối hợp tiếp nhận giải quyết nguồn tin tội phạm.'
                              : isTuThuDauThu
                                ? 'Khoản 1 Điều 4 & Điều 146 BLTTHS 2015 (Tiếp nhận người tự thú, đầu thú); Mẫu số 02-BCA; Điều 106 BLTTHS (Niêm phong tang vật giao nộp).'
                                : 'Điều 145, 146, 147 BLTTHS 2015; Dấu hiệu hành vi quy định tại Điều 174 Bộ luật Hình sự 2015 (Tội lừa đảo chiếm đoạt tài sản).'}
                        </p>
                      </div>

                      <div className="pt-1 border-t border-purple-100">
                        <span className="text-purple-900 font-bold block text-[11px]">Đề xuất hướng giải quyết nghiệp vụ:</span>
                        <p className="text-[11.5px] text-slate-700 mt-0.5">
                          Tiếp nhận nguồn tin, vào Sổ theo dõi tiếp nhận tin báo, tố giác tội phạm; đề xuất Thủ trưởng Cơ quan CSĐT phân công Điều tra viên thụ lý giải quyết và gửi văn bản thông báo cho Viện kiểm sát nhân dân cùng cấp.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10.5px] text-purple-900 font-medium pt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-purple-600">gavel</span>
                      <span>AI không tự quyết định thụ lý hay phân loại pháp lý; toàn bộ thẩm quyền thuộc về Cán bộ thụ lý.</span>
                    </div>
                  </div>

                  {/* KHỐI ĐỀ XUẤT CÁC CÂU HỎI LÀM RÕ NGHIỆP VỤ (AI GUIDANCE QUESTIONS) */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-indigo-600">help_center</span>
                        <strong className="text-slate-900 text-xs">Đề xuất các câu hỏi nghiệp vụ cần làm rõ thêm:</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const qs = `1. Đề nghị người báo tin làm rõ phương thức bàn giao số tiền 300 triệu đồng chênh lệch và cung cấp biên nhận/sao kê tương ứng?\n2. Xác định rõ thời điểm đối tượng bắt đầu có dấu hiệu né tránh, đóng cửa văn phòng hoặc cắt liên lạc?\n3. Có người làm chứng nào khác chứng kiến quá trình thỏa thuận và giao dịch không?\n4. Vụ việc đã được gửi đơn đến cơ quan chức năng nào khác giải quyết trước đây chưa?`;
                          navigator.clipboard?.writeText(qs);
                          showToast('✓ Đã sao chép 4 câu hỏi nghiệp vụ vào khay nhớ tạm để đưa vào Biên bản làm việc!');
                        }}
                        className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-white px-2 py-1 rounded-md border border-slate-200 hover:bg-indigo-50 cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">content_copy</span>
                        <span>Sao chép câu hỏi</span>
                      </button>
                    </div>

                    <ol className="list-decimal pl-5 space-y-1 text-slate-700 text-[11.5px] leading-relaxed">
                      <li>Đề nghị người báo tin làm rõ phương thức bàn giao số tiền 300 triệu đồng chênh lệch (nộp tiền mặt hay chuyển khoản) và cung cấp tài liệu chứng minh đối ứng?</li>
                      <li>Thời điểm chính xác đối tượng Trần Văn B có hành vi tẩu tán tài sản, cắt liên lạc hoặc đóng cửa văn phòng giao dịch tại dự án?</li>
                      <li>Có người làm chứng nào khác cùng có mặt tại thời điểm ký kết hợp đồng góp vốn hoặc chứng kiến việc chuyển giao tài sản không?</li>
                      <li>Vụ việc này đã từng được phản ánh, gửi đơn hoặc thụ lý tại Cơ quan Công an hay Tòa án nào khác trước đây chưa?</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* MỤC 5.3: TRA CỨU TIN BÁO VÀ HỒ SƠ LIÊN QUAN (CSDL GOVEX)           */}
              {/* =================================================================== */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[19px] text-[#004ac6]">travel_explore</span>
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                        5.3. Tra cứu tin báo &amp; Hồ sơ có liên quan (CSDL GOVEX)
                      </h3>
                      <p className="text-[11px] text-slate-500">Đối chiếu trường thông tin xác thực: CCCD, Chủ thể, Địa bàn — Không dùng điểm % ảo</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 font-semibold">
                    Không tự động gộp — Cán bộ phải xác nhận
                  </span>
                </div>

                {/* Danh sách hồ sơ liên quan với trường đối chiếu rõ ràng */}
                <div className="space-y-2.5 text-xs">
                  {DON_TRUNG_LIST.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all ${confirmedRelatedCases[item.id]
                        ? 'bg-blue-50/50 border-[#004ac6] ring-1 ring-blue-200'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/60'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-blue-700 font-mono text-[13px]">{item.code}</strong>
                            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                              Tiêu chí: {item.tieuChiDoiChieu || 'Trùng CCCD & Đối tượng'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Nguồn: {item.nguonDuLieu || 'CSDL Đơn thư GOVEX'}
                            </span>
                          </div>

                          <h4 className="font-semibold text-slate-800 text-[12.5px] mt-1">{item.title}</h4>

                          <p className="text-slate-600 text-[11.5px] mt-0.5">
                            <strong>Lý do đối chiếu liên quan: </strong>
                            {item.id === 'dt-1'
                              ? 'Cùng đối tượng tố giác Trần Văn B & Công ty BĐS X; cùng hành vi nhận cọc bán dự án ma tại Hoài Đức'
                              : item.id === 'dt-2'
                                ? 'Cùng địa bàn Khu đô thị Nam An Khánh, huyện Hoài Đức'
                                : 'Cùng người đứng đơn Nguyễn Văn A (Lịch sử gửi đơn trước đây)'}
                          </p>

                          {/* Bảng các trường thông tin đối chiếu cụ thể */}
                          {item.truongDoiChieu && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">Trường đối chiếu:</span>
                              {item.truongDoiChieu.map((fld, fIdx) => (
                                <span key={fIdx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10.5px]">
                                  {fld}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDonTrungForDrawer(item);
                              setShowDonTrungDrawer(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
                          >
                            Chi tiết
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmedRelatedCases((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id],
                              }));
                              showToast(
                                confirmedRelatedCases[item.id]
                                  ? `Đã hủy xác nhận liên kết hồ sơ ${item.code}`
                                  : `Cán bộ đã xác nhận liên kết hồ sơ ${item.code}!`
                              );
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-all ${confirmedRelatedCases[item.id]
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-[#004ac6] text-white hover:bg-blue-700'
                              }`}
                          >
                            {confirmedRelatedCases[item.id] ? '✓ Đã xác nhận' : 'Xác nhận liên quan'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[15px] text-slate-500 shrink-0 mt-0.5">info</span>
                  <p className="leading-relaxed">
                    <strong>Nguyên tắc kiểm soát đối soát:</strong> GOVEX không tự động gộp đơn dựa trên điểm phần trăm giả định. Cán bộ thụ lý kiểm tra trực tiếp các trường thông tin đối chiếu và bấm <em>Xác nhận liên quan</em> để liên kết dữ liệu nghiệp vụ.
                  </p>
                </div>
              </div>

              {/* =================================================================== */}
              {/* MỤC 5.4: CẢNH BÁO KHẨN CẤP & NỘI DUNG CẦN XÁC MINH                   */}
              {/* =================================================================== */}
              <div className="bg-white rounded-2xl border border-rose-200/90 shadow-2xs p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-rose-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[19px] text-rose-600">emergency</span>
                    <h3 className="text-[14px] font-bold text-rose-950 font-headline-md tracking-tight">
                      5.4. Cảnh báo khẩn cấp &amp; Nội dung cần xác minh
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Ưu tiên xử lý ngay
                  </span>
                </div>

                {/* Khung cảnh báo khẩn cấp */}
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-950 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900">
                    <span className="material-symbols-outlined text-[17px] text-rose-600">notification_important</span>
                    <span>DẤU HIỆU CẦN ƯU TIÊN XEM XÉT KHẨN CẤP:</span>
                  </div>
                  <ul className="space-y-1 pl-5 list-disc text-[12px] leading-relaxed">
                    <li>
                      <strong>Nguy cơ tẩu tán tài sản &amp; bỏ trốn:</strong> Có dấu hiệu đối tượng Trần Văn B đang làm thủ tục chuyển nhượng các tài sản khác và đóng tài khoản công ty.
                    </li>
                    <li>
                      <strong>Thời hạn tố tụng:</strong> Hạn thụ lý giải quyết ban đầu là <strong>20 ngày</strong> kể từ khi tiếp nhận (Khoản 1 Điều 147 BLTTHS 2015). Cần khẩn trương phân công Điều tra viên.
                    </li>
                  </ul>
                </div>

                {/* Checklist nội dung cần xác minh */}
                <div className="space-y-2 pt-1 text-xs">
                  <span className="font-bold text-slate-800 block">Checklist nội dung cần xác minh theo quy định:</span>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
                      <input
                        type="checkbox"
                        checked={xacMinhChecklist.xm1}
                        onChange={(e) => setXacMinhChecklist((prev) => ({ ...prev, xm1: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300"
                      />
                      <div className="flex-1">
                        <strong className="text-slate-800">1. Xác minh nhân thân &amp; tình trạng pháp lý công ty:</strong>
                        <p className="text-slate-500 text-[11px]">Đối soát ĐKKD, trụ sở hoạt động thực tế và người đại diện theo pháp luật.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
                      <input
                        type="checkbox"
                        checked={xacMinhChecklist.xm2}
                        onChange={(e) => setXacMinhChecklist((prev) => ({ ...prev, xm2: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300"
                      />
                      <div className="flex-1">
                        <strong className="text-slate-800">2. Thu thập sao kê tài khoản &amp; dòng tiền nộp cọc:</strong>
                        <p className="text-slate-500 text-[11px]">Yêu cầu các Ngân hàng liên quan cung cấp sao kê đối ứng làm rõ chênh lệch 300 triệu đồng.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
                      <input
                        type="checkbox"
                        checked={xacMinhChecklist.xm3}
                        onChange={(e) => setXacMinhChecklist((prev) => ({ ...prev, xm3: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300"
                      />
                      <div className="flex-1">
                        <strong className="text-slate-800">3. Làm việc với chính quyền địa phương về quy hoạch đất:</strong>
                        <p className="text-slate-500 text-[11px]">Xác nhận với UBND huyện Hoài Đức về việc dự án có được cấp phép đầu tư hay không.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
                      <input
                        type="checkbox"
                        checked={xacMinhChecklist.xm4}
                        onChange={(e) => setXacMinhChecklist((prev) => ({ ...prev, xm4: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300"
                      />
                      <div className="flex-1">
                        <strong className="text-slate-800">4. Lấy lời khai người tố giác &amp; tiếp nhận vật chứng:</strong>
                        <p className="text-slate-500 text-[11px]">Lập biên bản giao nhận tài liệu gốc và ghi nhận yêu cầu bảo mật danh tính.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* MỤC 5.5: ĐỀ XUẤT BƯỚC XỬ LÝ TIẾP THEO & HÀNH ĐỘNG                   */}
              {/* =================================================================== */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[19px] text-emerald-600">alt_route</span>
                    <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                      5.5. Đề xuất bước xử lý tiếp theo (AI gợi ý theo luật định)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Cán bộ lựa chọn quyết định</span>
                </div>

                {/* 3 Hướng xử lý theo quy định */}
                <div className="space-y-2.5 text-xs">
                  {/* Hướng 1: Thụ lý */}
                  <div
                    onClick={() => {
                      setHuongXuLy('tiep-nhan');
                      setOfficerNote('Căn cứ Điều 145, 146 BLTTHS: Nguồn tin có dấu hiệu tội phạm rõ ràng và thuộc thẩm quyền giải quyết. Đề xuất Thụ lý giải quyết tin báo và phân công Điều tra viên tiến hành xác minh.');
                    }}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${huongXuLy === 'tiep-nhan'
                      ? 'border-[#004ac6] bg-blue-50/40 shadow-xs ring-1 ring-blue-200'
                      : 'border-slate-200 hover:border-blue-300 bg-slate-50/50'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-[13px] text-slate-900">Hướng 1: Thụ lý giải quyết tin báo theo thẩm quyền</strong>
                          <span className="text-[10.5px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-[#004ac6]">Gợi ý ưu tiên</span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">
                          <strong>Căn cứ: </strong>Khoản 1 Điều 146 BLTTHS 2015. Đủ dấu hiệu ban đầu của tội Lừa đảo chiếm đoạt tài sản (Điều 174 BLHS). Đề xuất khởi tạo vụ việc chính thức và phân công Điều tra viên thụ lý.
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-[#004ac6] text-xl shrink-0">
                        {huongXuLy === 'tiep-nhan' ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  </div>

                  {/* Hướng 2: Ghép vào hồ sơ đã có */}
                  <div
                    onClick={() => {
                      setHuongXuLy('ghep');
                      setOfficerNote(`Căn cứ đối soát CSDL: Hồ sơ có nội dung và đối tượng trùng khớp với vụ việc ${selectedGhepDonCode} đang thụ lý. Đề xuất ghép lượt nhận vào hồ sơ hiện có để giải quyết tập trung.`);
                    }}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${huongXuLy === 'ghep'
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-200'
                      : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-[13px] text-slate-900">Hướng 2: Ghép vào hồ sơ/vụ việc đang giải quyết ({selectedGhepDonCode})</strong>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">
                          <strong>Căn cứ: </strong>Hồ sơ bổ sung chứng cứ cho vụ án đang thụ lý. Ghép tài liệu vào cây văn bản vụ việc hiện có, không tạo mã hồ sơ mới.
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-indigo-600 text-xl shrink-0">
                        {huongXuLy === 'ghep' ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  </div>

                  {/* Hướng 3: Chuyển cơ quan điều tra khác */}
                  <div
                    onClick={() => {
                      setHuongXuLy('ban-giao');
                      setOfficerNote('Căn cứ Khoản 2 Điều 146 BLTTHS: Vụ việc có tính chất phức tạp, liên quan nhiều địa bàn tỉnh/thành phố, vượt quá thẩm quyền cấp huyện/xã. Đề xuất bàn giao chuyển Phòng Cảnh sát kinh tế (PC03) thụ lý theo thẩm quyền.');
                    }}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${huongXuLy === 'ban-giao'
                      ? 'border-amber-600 bg-amber-50/40 shadow-xs ring-1 ring-amber-200'
                      : 'border-slate-200 hover:border-amber-300 bg-slate-50/50'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-[13px] text-slate-900">Hướng 3: Chuyển cơ quan điều tra có thẩm quyền</strong>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">
                          <strong>Căn cứ: </strong>Khoản 2 Điều 146 BLTTHS. Vụ việc vượt thẩm quyền đơn vị tiếp nhận ban đầu. Chuyển hồ sơ kèm biên bản giao nhận cho cơ quan điều tra cấp trên trong thời hạn quy định.
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-amber-600 text-xl shrink-0">
                        {huongXuLy === 'ban-giao' ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ý kiến cán bộ & Nút hành động */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Ý kiến đề xuất của cán bộ thụ lý:
                    </label>
                    <textarea
                      rows={2}
                      value={officerNote}
                      onChange={(e) => setOfficerNote(e.target.value)}
                      placeholder="Nhập ý kiến chuyên môn của cán bộ..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => showToast('Đã lưu nháp ý kiến cán bộ.')}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Lưu nháp
                    </button>

                    <div className="flex items-center gap-2 flex-wrap">
                      {huongXuLy === 'ghep' ? (
                        <button
                          type="button"
                          onClick={() => setShowGhepModal(true)}
                          className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">merge_type</span>
                          <span>Xác nhận ghép vào {selectedGhepDonCode}</span>
                        </button>
                      ) : huongXuLy === 'ban-giao' ? (
                        <button
                          type="button"
                          onClick={() => setShowBanGiaoModal(true)}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                          <span>Chuyển hồ sơ cơ quan khác</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowSubmitModal(true)}
                          className="px-4.5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          <span>{isTinBaoToGiac ? 'Thụ lý nguồn tin & Phân công' : 'Tiếp nhận tạo Đơn mới'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL CĂN CỨ GỢI Ý                                                        */}
      {/* ========================================================================= */}
      {showCanCuModal && (
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
      )}

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

      {/* ========================================================================= */}
      {/* MODAL TIẾP NHẬN ĐƠN (BR-16, BR-17, BR-18)                                 */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-[#004ac6] flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-2xl">task_alt</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác nhận tiếp nhận đơn</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Mã đơn: {luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125'} • Lượt nhận: {luotNhan?.id || 'LN-2025-0819'}
                </p>
              </div>
            </div>

            {/* BR-16: Lựa chọn phương thức xử lý */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Phương thức xử lý (BR-16):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setTiepNhanHuong('tu_xu_ly')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${tiepNhanHuong === 'tu_xu_ly'
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-200 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tiepNhanHuong"
                      checked={tiepNhanHuong === 'tu_xu_ly'}
                      onChange={() => setTiepNhanHuong('tu_xu_ly')}
                      className="text-blue-600"
                    />
                    <span className="font-bold text-xs text-slate-900">Tự xử lý (BR-17)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 pl-5">
                    Thụ lý trực tiếp và chuyển vào workflow nghiệp vụ loại đơn
                  </p>
                </div>

                <div
                  onClick={() => setTiepNhanHuong('phan_cong')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${tiepNhanHuong === 'phan_cong'
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-200 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tiepNhanHuong"
                      checked={tiepNhanHuong === 'phan_cong'}
                      onChange={() => setTiepNhanHuong('phan_cong')}
                      className="text-blue-600"
                    />
                    <span className="font-bold text-xs text-slate-900">Phân công (BR-18)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 pl-5">
                    Giao Task cho cán bộ chuyên môn khác thụ lý
                  </p>
                </div>
              </div>
            </div>

            {tiepNhanHuong === 'phan_cong' && (
              <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cán bộ nhận xử lý <span className="text-red-500">*</span> (BR-18):
                  </label>
                  <select
                    value={selectedOfficerForPhanCong}
                    onChange={(e) => setSelectedOfficerForPhanCong(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="">-- Chọn cán bộ thụ lý --</option>
                    {OFFICERS.filter((o) => o.departmentId === 'tiep-dan').map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} - {o.role} (Đang xử lý: {o.workloadCount} đơn)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chỉ đạo / Ghi chú phân công:
                  </label>
                  <textarea
                    rows={2}
                    value={ghiChuPhanCong}
                    onChange={(e) => setGhiChuPhanCong(e.target.value)}
                    placeholder="Chỉ đạo tiến độ hoặc định hướng thụ lý..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>
              </div>
            )}

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 shrink-0">Người gửi:</span>
                <strong className="text-slate-900 text-right">{extractData.nguoiGui || luotNhan?.nguoiNop || 'Công dân'}</strong>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 shrink-0">Phân loại đơn:</span>
                <strong className="text-slate-900 text-right">{extractData.loaiNoiDung || 'Đơn tiếp nhận hành chính'}</strong>
              </div>
              {officerNote && (
                <div className="pt-2 border-t border-slate-200/80 text-slate-600">
                  <span className="text-slate-500 block mb-0.5 font-medium">Ý kiến cán bộ tiếp nhận:</span>
                  <p className="italic text-slate-700 leading-relaxed bg-white p-2 rounded-lg border border-slate-200/60">
                    "{officerNote}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleConfirmTiepNhan}
                className="px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                <span>
                  {tiepNhanHuong === 'tu_xu_ly'
                    ? 'Xác nhận tiếp nhận & Vào Workflow ➔'
                    : 'Xác nhận phân công cán bộ ➔'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CẢNH BÁO THIẾU ĐIỀU KIỆN CHUYỂN TIẾP NHẬN (BR-04, BR-05)            */}
      {/* ========================================================================= */}
      {validationErrorModal && (
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
      )}

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
      {showGhepModal && (
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
                          <span className="px-2 py-0.2 rounded-full text-[10.5px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-200">
                            Tiêu chí: {selectedGhepItem.tieuChiDoiChieu ? selectedGhepItem.tieuChiDoiChieu.split('&')[0] : 'Trùng CCCD'}
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
                                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold border shrink-0 bg-indigo-50 text-indigo-800 border-indigo-200">
                                    Khớp tiêu chí
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
              {selectedGhepItem && (
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
              )}
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
      )}

      {/* ========================================================================= */}
      {/* MODAL ĐỐI CHIẾU CHI TIẾT HỒ SƠ ĐƠN GỐC ĐỂ GHÉP                           */}
      {/* ========================================================================= */}
      {showDetailTargetDonModal && (
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
                <span>Kết quả đối chiếu CSDL hồ sơ (Trùng CCCD & Đối tượng):</span>
              </div>
              <strong className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                Đủ điều kiện ghép hồ sơ (Đã đối soát)
              </strong>
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
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Trùng khớp hoàn toàn</span>
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
      )}

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
      {showSigningDocModal && activeSigningDoc && (
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
      )}

      {/* =================================================================== */}
      {/* MODAL THÔNG BÁO TIẾP NHẬN NGƯỜI TỰ THÚ / ĐẦU THÚ GỬI VKSND (24H)   */}
      {/* KHOẢN 1 ĐIỀU 146 BLTTHS 2015 & TTLT SỐ 01/2017                   */}
      {/* =================================================================== */}
      {showVksndModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <span className="material-symbols-outlined text-2xl">local_police</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      VĂN BẢN THÔNG BÁO TIẾP NHẬN NGƯỜI {truongHopConfirmed === 'dau_thu' ? 'ĐẦU THÚ' : 'TỰ THÚ'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                      Thời hạn 24 giờ (Điều 146 BLTTHS)
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 mt-0.5">
                    Gửi Viện kiểm sát nhân dân cùng cấp theo quy định tại Khoản 1 Điều 146 Bộ luật Tố tụng hình sự 2015
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVksndModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body - Paper Document */}
            <div className="p-6 overflow-y-auto space-y-6 bg-slate-100/70 text-slate-800">
              {/* Thanh trạng thái thời hạn */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-700 text-[20px]">alarm</span>
                  <div>
                    <strong className="text-amber-950 font-bold">Thời hạn thông báo theo luật định: 24 giờ kể từ thời điểm tiếp nhận</strong>
                    <p className="text-amber-800 text-[11px]">
                      Thời điểm tiếp nhận: {luotNhan?.gioNhan || '11:45'}, {luotNhan?.ngayNhan || '16/09/2026'} • Trạng thái: <span className="font-bold text-emerald-700">Trong thời hạn hợp lệ</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 shadow-2xs">
                    Mã văn bản dự thảo: TB-146/2026/CSĐT-HS
                  </span>
                </div>
              </div>

              {/* Khung tờ giấy A4 mô phỏng chuẩn văn bản Bộ Công an */}
              <div className="bg-white rounded-xl shadow-md border border-slate-300 p-8 sm:p-10 text-slate-900 font-serif leading-relaxed max-w-3xl mx-auto space-y-6">
                {/* Header Công văn */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 border-b border-slate-200 font-sans">
                  <div className="text-center sm:text-left space-y-0.5">
                    <p className="text-[11.5px] font-semibold text-slate-700 uppercase">CÔNG AN THÀNH PHỐ HÀ NỘI</p>
                    <p className="text-[12px] font-bold text-slate-900 uppercase">CƠ QUAN CẢNH SÁT ĐIỀU TRA</p>
                    <p className="text-[11px] text-slate-500 font-mono">Số: 146/TB-CQĐT-HS</p>
                  </div>
                  <div className="text-center sm:text-right space-y-0.5">
                    <p className="text-[12px] font-bold text-slate-900 uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="text-[11.5px] font-semibold text-slate-800">Độc lập - Tự do - Hạnh phúc</p>
                    <div className="w-28 h-[1px] bg-slate-400 mx-auto sm:ml-auto sm:mr-0 my-1"></div>
                    <p className="text-[11px] text-slate-600 italic">Hà Nội, ngày 16 tháng 09 năm 2026</p>
                  </div>
                </div>

                {/* Tiêu đề */}
                <div className="text-center space-y-1.5 pt-2 font-sans">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase">
                    THÔNG BÁO
                  </h2>
                  <p className="text-sm font-semibold text-slate-800">
                    Về việc tiếp nhận người {truongHopConfirmed === 'dau_thu' ? 'đầu thú' : 'tự thú'}
                  </p>
                  <p className="text-xs font-bold text-slate-700 italic pt-1">
                    Kính gửi: <span className="underline decoration-slate-400">Viện kiểm sát nhân dân thành phố Hà Nội</span>
                  </p>
                </div>

                {/* Căn cứ pháp lý */}
                <div className="text-xs space-y-1 text-slate-700 italic">
                  <p>- Căn cứ Khoản 1 Điều 146 Bộ luật Tố tụng hình sự nước Cộng hòa xã hội chủ nghĩa Việt Nam năm 2015;</p>
                  <p>- Căn cứ Thông tư liên tịch số 01/2017/TTLT-BCA-BQP-BTC-BNN&amp;PTNT-VKSNDTC ngày 29 tháng 12 năm 2017;</p>
                  <p>- Căn cứ Biên bản tiếp nhận người {truongHopConfirmed === 'dau_thu' ? 'đầu thú' : 'tự thú'} Mẫu số 02-BCA lập hồi {luotNhan?.gioNhan || '11:45'} ngày {luotNhan?.ngayNhan || '16/09/2026'},</p>
                </div>

                {/* Nội dung thông báo */}
                <div className="text-xs space-y-3.5 text-slate-800 pt-1 font-sans">
                  <p className="leading-relaxed">
                    Cơ quan Cảnh sát điều tra Công an thành phố Hà Nội thông báo về việc tiếp nhận người {truongHopConfirmed === 'dau_thu' ? 'đầu thú' : 'tự thú'} với các thông tin nội dung cụ thể sau:
                  </p>

                  <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 uppercase text-[12px] text-purple-900">
                      1. Thông tin người đến trình diện:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 pl-2">
                      <p>• Họ và tên: <strong className="text-slate-900">{extractData.nguoiGui || luotNhan?.nguoiNop || 'Phạm Văn Hùng'}</strong></p>
                      <p>• Sinh ngày: <strong>{extractData.namSinh ? `15/08/${extractData.namSinh}` : '15/08/1992'}</strong> | Giới tính: <strong>Nam</strong></p>
                      <p>• Số CCCD/ĐDCN: <strong className="font-mono text-slate-900">{extractData.cccd || '001095018392'}</strong></p>
                      <p>• Quốc tịch: <strong>Việt Nam</strong> | Dân tộc: <strong>Kinh</strong></p>
                      <p className="sm:col-span-2">• Nơi thường trú: <strong>{extractData.diaChi || luotNhan?.diaChi || 'Xã Tân Triều, huyện Thanh Trì, Hà Nội'}</strong></p>
                      <p className="sm:col-span-2">• Nơi ở hiện tại: <strong>{luotNhan?.noiOChinh || extractData.diaChi || 'Xã Tân Triều, huyện Thanh Trì, Hà Nội'}</strong></p>
                      <p>• Nghề nghiệp: <strong>{(luotNhan as any)?.ngheNghiep || 'Lao động tự do'}</strong></p>
                      <p>• Tiền án, tiền sự: <strong>{isDauThuItem ? 'Đang có Quyết định truy nã số 14/QĐ-CQĐT' : 'Chưa có'}</strong></p>
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 uppercase text-[12px] text-purple-900">
                      2. Phân loại trường hợp trình diện &amp; Căn cứ xác định (Điều 4 BLTTHS):
                    </p>
                    <p className="text-xs text-slate-800 pl-2">
                      • Phân loại tiếp nhận: <strong className={truongHopConfirmed === 'dau_thu' ? 'text-amber-800' : 'text-purple-800'}>
                        {truongHopConfirmed === 'dau_thu' ? 'NGƯỜI ĐẦU THÚ (Đã bị phát hiện / có quyết định truy nã)' : 'NGƯỜI TỰ THÚ (Tự giác đến khai báo trước khi hành vi bị phát hiện)'}
                      </strong>
                    </p>
                    <p className="text-xs text-slate-700 pl-2">
                      • Căn cứ phân định: {lyDoXacNhanPhanLoai}
                    </p>
                    <p className="text-xs text-slate-700 pl-2">
                      • Hình thức đến trình diện: {luotNhan?.hinhThuc || 'Đến trực tiếp trụ sở cơ quan công an'} {luotNhan?.nguoiDiCung ? `(Người đi cùng: ${luotNhan.nguoiDiCung})` : '(Đi một mình)'}
                    </p>
                  </div>

                  <div className="space-y-1.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 uppercase text-[12px] text-purple-900">
                      3. Tóm tắt nội dung tự nguyện khai báo ban đầu:
                    </p>
                    <p className="text-xs text-slate-800 pl-2 leading-relaxed">
                      {extractData.noiDungTomTat || luotNhan?.noiDung}
                    </p>
                    <div className="text-[11.5px] text-slate-700 pl-2 grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                      <p>• Thời gian xảy ra: <strong>{extractData.thoiGian}</strong></p>
                      <p>• Địa điểm xảy ra: <strong>{extractData.diaDiem}</strong></p>
                      <p className="sm:col-span-2">• Hậu quả/Thiệt hại: <strong className="text-rose-700">{luotNhan?.hauQuaThietHai || (isDauThuItem ? 'Bị hại tổn thương sức khỏe 18%' : '01 xe máy và 15.000.000 VNĐ tiền mặt')}</strong></p>
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 uppercase text-[12px] text-purple-900">
                      4. Đồ vật, tài liệu tự nguyện giao nộp (Điều 106 BLTTHS):
                    </p>
                    <p className="text-xs text-slate-800 pl-2">
                      • Đồ vật giao nộp: <strong>{luotNhan?.doVatGiaoNop || (isDauThuItem ? '01 điện thoại iPhone 13 Pro' : '01 xe mô tô Honda Wave RSX BKS 29X1-567.89 và 15.000.000 VNĐ')}</strong>
                    </p>
                    <p className="text-xs text-slate-700 pl-2">
                      • Biện pháp bảo quản: {tuThuChecklist.bbNiemPhong ? 'Đã lập Biên bản niêm phong đồ vật, tài liệu và chuyển lưu giữ tại phòng quản lý vật chứng theo quy định.' : 'Đang thực hiện quy trình niêm phong và nhập kho vật chứng.'}
                    </p>
                  </div>

                  <div className="space-y-1.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 uppercase text-[12px] text-purple-900">
                      5. Tình trạng sức khỏe, y tế khi tiếp nhận:
                    </p>
                    <p className="text-xs text-slate-800 pl-2">
                      {luotNhan?.canhBaoAnToan?.canHoTroYTe ? (
                        <span className="text-rose-800 font-semibold">
                          ⚠️ Cần hỗ trợ y tế: {luotNhan.canhBaoAnToan.ghiChu || 'Có thương tích sơ cứu ban đầu'}. Đã lập biên bản kiểm tra dấu vết thương tích cơ thể.
                        </span>
                      ) : (
                        <span>✓ Tinh thần tỉnh táo, sức khỏe bình thường, không có dấu vết thương tích hoặc bệnh lý cấp tính.</span>
                      )}
                    </p>
                  </div>

                  <div className="space-y-1.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 uppercase text-[12px] text-purple-900">
                      6. Biện pháp tố tụng Cơ quan điều tra đang thực hiện:
                    </p>
                    <ul className="list-disc pl-6 text-xs text-slate-700 space-y-1">
                      <li>Phân công Điều tra viên thụ lý, lấy lời khai chi tiết làm rõ toàn bộ diễn biến hành vi phạm tội.</li>
                      <li>Phối hợp cùng Viện kiểm sát nhân dân thành phố Hà Nội để kiểm sát chặt chẽ ngay từ giai đoạn tiếp nhận nguồn tin theo Khoản 1 Điều 146 BLTTHS.</li>
                      <li>Áp dụng các biện pháp ngăn chặn cần thiết theo quy định của Bộ luật Tố tụng hình sự.</li>
                    </ul>
                  </div>
                </div>

                {/* Chữ ký văn bản */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 font-sans text-xs">
                  <div className="space-y-1 text-slate-600">
                    <p className="font-bold text-slate-800">Nơi nhận:</p>
                    <p>- Viện KSND TP. Hà Nội (để b/c &amp; kiểm sát);</p>
                    <p>- Ban Giám đốc CATP (để b/c);</p>
                    <p>- Đội CSHS thụ lý;</p>
                    <p>- Lưu: Hồ sơ tiếp nhận, VT.</p>
                  </div>
                  <div className="text-center space-y-1.5">
                    <p className="font-bold text-slate-900 uppercase">THỦ TRƯỞNG CƠ QUAN CSĐT</p>
                    <p className="text-slate-500 text-[11px] italic">(Ký, ghi rõ họ tên và đóng dấu)</p>
                    <div className="py-6 flex flex-col items-center">
                      <div className="border border-red-500/80 rounded-lg p-2 bg-red-50/60 inline-flex flex-col items-center shadow-2xs">
                        <span className="material-symbols-outlined text-red-600 text-2xl">verified</span>
                        <span className="text-[10px] font-bold text-red-700 uppercase">CƠ QUAN CSĐT CATP HÀ NỘI</span>
                        <span className="text-[9px] text-red-600">Ký số VGCA: 16/09/2026 14:20</span>
                      </div>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">Đại tá Trần Quốc Dũng</p>
                    <p className="text-[11px] text-slate-600">Phó Giám đốc - Thủ trưởng CQ CSĐT</p>
                  </div>
                </div>
              </div>

              {/* Tích hợp Trục liên thông điện tử VKSND */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-700 text-[20px]">hub</span>
                    <strong className="text-indigo-950 font-bold text-[13px]">
                      Trục liên thông số hóa VKSND Tối cao — Bộ Công an
                    </strong>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${tuThuChecklist.tbVksnd
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    }`}>
                    {tuThuChecklist.tbVksnd ? '✓ Đã đồng bộ thành công' : 'Sẵn sàng gửi điện tử'}
                  </span>
                </div>
                <p className="text-indigo-800 text-[11.5px] leading-relaxed">
                  Hệ thống kết nối trực tiếp Cổng thông tin tố tụng điện tử của Viện kiểm sát nhân dân, hỗ trợ truyền gói tin số hóa đính kèm chữ ký điện tử VGCA (Ban Cơ yếu Chính phủ) nhằm rút ngắn thời gian và bảo đảm tuân thủ nghiêm ngặt thời hạn 24 giờ của Khoản 1 Điều 146 BLTTHS.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-indigo-900">
                  <div className="p-2 rounded-lg bg-white border border-indigo-200">
                    <span className="text-slate-500 block text-[10px]">Mã định danh gói tin:</span>
                    <strong>VKS-BCA-2026-14692</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-indigo-200">
                    <span className="text-slate-500 block text-[10px]">Cơ quan kiểm sát thụ lý:</span>
                    <strong>VKSND TP. Hà Nội</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-indigo-200">
                    <span className="text-slate-500 block text-[10px]">Chữ ký số cán bộ:</span>
                    <strong>{currentAccount?.name || 'Nguyễn Minh Anh'} (VGCA)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Đang kết nối máy in văn phòng...');
                    window.print();
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>In văn bản Thông báo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`✓ Đã tải tệp Thong_bao_VKSND_24h_${luotNhan?.id || 'TT-2026'}.pdf`);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Tải tệp PDF</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setTuThuChecklist(prev => ({ ...prev, tbVksnd: true }));
                    showToast('✓ Đã truyền số hóa Thông báo tiếp nhận người tự thú/đầu thú tới VKSND TP. Hà Nội qua Trục liên thông (Gói tin VKS-BCA-2026-14692)!');
                  }}
                  className={`px-4.5 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all ${tuThuChecklist.tbVksnd
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {tuThuChecklist.tbVksnd ? 'task_alt' : 'send'}
                  </span>
                  <span>
                    {tuThuChecklist.tbVksnd ? '✓ Đã hoàn thành gửi VKSND' : 'Gửi số hóa sang VKSND (Trục 24h)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowVksndModal(false)}
                  className="px-4.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ĐỐI CHIẾU LỊCH SỬ PHÂN TÍCH (DIFF v1 vs v2)                         */}
      {/* ========================================================================= */}
      {showDiffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 space-y-4 animate-scale-up max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-2xl">compare</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-headline-md">
                    Đối chiếu Lịch sử Phân tích AI (Phiên bản v1.0 vs v2.0)
                  </h3>
                  <p className="text-xs text-slate-500">
                    So sánh sự thay đổi giữa Phân tích ban đầu (Mô tả trực tiếp) và Phân tích cập nhật (Sau khi bổ sung tài liệu &amp; OCR)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDiffModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Banner nguyên tắc */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">history_edu</span>
                <span>Lịch sử phiên bản bảo đảm tính toàn vẹn: Không ghi đè vết phân tích ban đầu</span>
              </div>
              <span className="font-mono text-blue-800 font-bold">2 Phiên bản được lưu trữ</span>
            </div>

            {/* Bảng so sánh 2 cột Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Cột v1.0 */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-200 text-slate-800 text-[11px]">
                      v1.0 (Sơ bộ)
                    </span>
                    <strong className="text-slate-900 text-[13px]">Ghi nhận trực tiếp</strong>
                  </div>
                  <span className="text-[10.5px] text-slate-500">Trước khi có file</span>
                </div>

                <div className="space-y-2 text-slate-700">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[10.5px] font-medium">Nguồn dữ liệu:</span>
                    <strong className="text-slate-800">100% Cán bộ ghi nhận trực tiếp</strong>
                    <p className="text-[11px] text-slate-500">Chưa có tệp đính kèm; phân tích NLP dựa trên mô tả sự việc ban đầu.</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[10.5px] font-medium">Trạng thái bóc tách:</span>
                    <p className="text-slate-800">Trích xuất cơ bản: thời gian, địa bàn, chủ thể sơ bộ.</p>
                    <p className="text-amber-800 font-semibold text-[11px]">⚠️ Chưa kiểm chứng đối soát văn bản gốc.</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[10.5px] font-medium">Số liệu chứng cứ:</span>
                    <p className="text-slate-800">Theo lời khai ban đầu.</p>
                  </div>
                </div>
              </div>

              {/* Cột v2.0 */}
              <div className="rounded-xl border border-indigo-300 bg-indigo-50/30 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-600 text-white text-[11px]">
                      v2.0 (Cập nhật)
                    </span>
                    <strong className="text-indigo-950 text-[13px]">Sau khi có tài liệu scan &amp; OCR</strong>
                  </div>
                  <span className="text-[10.5px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                    Mới nhất
                  </span>
                </div>

                <div className="space-y-2 text-slate-700">
                  <div className="p-2.5 rounded-lg bg-white border border-indigo-100">
                    <span className="text-indigo-600 block text-[10.5px] font-medium">Nguồn dữ liệu bổ sung:</span>
                    <strong className="text-indigo-950">Đa nguồn: Ghi nhận trực tiếp + OCR số hóa tài liệu</strong>
                    <p className="text-[11px] text-slate-600">Đã quét OCR bóc tách nội dung từ biên bản và chứng từ bổ sung.</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-indigo-100">
                    <span className="text-indigo-600 block text-[10.5px] font-medium">Trạng thái bóc tách:</span>
                    <p className="text-slate-800">Bổ sung định danh chuẩn CCCD, chức vụ, MST pháp nhân liên quan.</p>
                    <p className="text-emerald-800 font-semibold text-[11px]">✓ Đã đối soát với CSDL Quốc gia.</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-indigo-100">
                    <span className="text-indigo-600 block text-[10.5px] font-medium">Phát hiện mâu thuẫn mới:</span>
                    <p className="text-rose-800 font-semibold">Phát hiện chênh lệch 300 triệu đồng giữa hợp đồng và phiếu thu.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bảng Diff chi tiết các trường */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="p-2.5 w-1/4">Trường dữ liệu</th>
                    <th className="p-2.5 w-3/8 text-slate-700">Phiên bản 1 (v1.0)</th>
                    <th className="p-2.5 w-3/8 bg-indigo-50/50 text-indigo-900">Phiên bản 2 (v2.0)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-500">Tài liệu số hóa kèm theo</td>
                    <td className="p-2.5 text-slate-400 italic">0 tệp (Chưa có tài liệu)</td>
                    <td className="p-2.5 text-indigo-900 font-semibold">{currentFiles.length > 0 ? `${currentFiles.length} tệp tài liệu số hóa` : 'Đã bổ sung tài liệu chứng cứ'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-500">Chứng cứ tài chính</td>
                    <td className="p-2.5">Thiệt hại 2.8 tỷ đồng (Ghi nhận sơ bộ)</td>
                    <td className="p-2.5 text-rose-800 font-semibold">Chênh lệch: Hợp đồng 2.8 tỷ ⟷ Phiếu thu 2.5 tỷ</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-500">Đối tượng liên quan</td>
                    <td className="p-2.5">Trần Văn B (Giám đốc)</td>
                    <td className="p-2.5 text-indigo-900">Trần Văn B + Kế toán trưởng Vũ Mai H (Cần xác minh vai trò)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-500">Trạng thái cán bộ</td>
                    <td className="p-2.5 text-slate-500">Chờ bổ sung tài liệu</td>
                    <td className="p-2.5 text-emerald-700 font-semibold">{officerConfirmedAI ? `Cán bộ đã duyệt (${officerConfirmedAt})` : 'Sẵn sàng thẩm tra & thụ lý'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDiffModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL BỔ SUNG TÀI LIỆU / BIÊN BẢN MỚI                                     */}
      {/* ========================================================================= */}
      {showAddDocumentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-2xl">post_add</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-headline-md">
                    Bổ sung Biên bản &amp; Tài liệu mới
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nâng cấp kết quả phân tích AI lên Phiên bản 2 (Kịch bản D)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDocumentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loại tài liệu bổ sung <span className="text-rose-500">*</span>:
                </label>
                <select
                  id="addDocTypeSelect"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Biên bản bắt người phạm tội quả tang (Mẫu 01-BCA)">
                    Biên bản bắt người phạm tội quả tang (Mẫu 01-BCA)
                  </option>
                  <option value="Biên bản niêm phong tang vật, đồ vật (Điều 106 BLTTHS)">
                    Biên bản niêm phong tang vật, đồ vật (Điều 106 BLTTHS)
                  </option>
                  <option value="Biên bản ghi lời khai người làm chứng">
                    Biên bản ghi lời khai người làm chứng
                  </option>
                  <option value="Báo cáo phát hiện dấu hiệu tội phạm của tổ tuần tra">
                    Báo cáo phát hiện dấu hiệu tội phạm của tổ tuần tra
                  </option>
                  <option value="Hợp đồng góp vốn & Biên lai chuyển tiền bổ sung">
                    Hợp đồng góp vốn &amp; Biên lai chuyển tiền bổ sung
                  </option>
                  <option value="Hình ảnh hiện trường / Tang vật tạm giữ">
                    Hình ảnh hiện trường / Tang vật tạm giữ
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên tệp số hóa đính kèm <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  id="addDocNameInput"
                  defaultValue={`Bien_ban_bo_sung_${luotNhan?.id || '2026'}.pdf`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dung lượng ước tính:
                </label>
                <input
                  type="text"
                  id="addDocSizeInput"
                  defaultValue="2.4 MB"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-[11.5px] leading-relaxed">
                <strong className="block text-amber-900 mb-0.5">Quy trình tự động hóa:</strong>
                Sau khi bấm bổ sung, hệ thống sẽ tự động khởi chạy OCR trên tệp mới, phân biệt nội dung trích xuất từ tài liệu vs nội dung cán bộ nhập trực tiếp, và nâng cấp kết quả phân tích sang <strong>Phiên bản 2 (v2.0)</strong>.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddDocumentModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const docName = (document.getElementById('addDocNameInput') as HTMLInputElement)?.value || 'Tai_lieu_bo_sung.pdf';
                  const docSize = (document.getElementById('addDocSizeInput') as HTMLInputElement)?.value || '2.0 MB';
                  const docType = (document.getElementById('addDocTypeSelect') as HTMLSelectElement)?.value || 'Biên bản bổ sung';
                  handleAddExtraDocument(docName, docSize, docType);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                <span>Bổ sung &amp; Khởi chạy OCR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}