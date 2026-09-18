import React, { useState, useEffect } from 'react';
import { LuotNhan, Screen } from '../types';
import { matchWorkflowByLoaiDon } from '../constants/workflows';
import { ActiveWorkflowState } from '../types/workflow';
import { DON_VI_OPTIONS } from '../constants';
import { TiepNhanDonItem } from '../constants/departments';
import ChuyenTiepNhanModal, { ChuyenTiepNhanSubmitData } from '../components/modals/ChuyenTiepNhanModal';
import NguonTraCuuModal, { NguonTraCuuTabType } from '../components/modals/NguonTraCuuModal';
import { getSuggestedActionsForWorkflow } from '../components/workflow/QuyTrinhSuggestedActions';

interface BanPhanTichProps {
  luotNhan: LuotNhan;
  onNav: (s: Screen) => void;
  onAcceptAndProcess?: (don: any, wfState?: ActiveWorkflowState) => void;
  onChuyenTiepNhan?: (item: TiepNhanDonItem, isDirect: boolean, assignedOfficerName?: string) => void;
}

export default function BanPhanTich({ luotNhan, onNav, onAcceptAndProcess, onChuyenTiepNhan }: BanPhanTichProps) {
  // ─── 1. TRẠNG THÁI AI: "reading" (Đang đọc) vs "done" (Đã đọc xong) ───────
  const [aiState, setAiState] = useState<'reading' | 'done'>('done');
  const [readingProgress, setReadingProgress] = useState<number>(100);
  const [isSimulating, setIsSimulating] = useState(false);


  // PDF Viewer Controls
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedFileId, setSelectedFileId] = useState<'f1' | 'f2'>('f1');
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);

  // Officer inputs
  const [officerNote, setOfficerNote] = useState<string>(
    'Qua phân tích, đề xuất tiếp nhận đơn và chuyển Phòng Cảnh sát kinh tế để xem xét, giải quyết theo thẩm quyền.'
  );
  const [huongXuLy, setHuongXuLy] = useState<'tiep-nhan' | 'xac-minh' | 'chuyen'>('tiep-nhan');
  const [expandedCanCu, setExpandedCanCu] = useState<string | null>(null);
  const [donViChuyen, setDonViChuyen] = useState<string>('');
  const [banGiaoUnit, setBanGiaoUnit] = useState<string>('Phòng Cảnh sát kinh tế (PC03) - Công an TP. Hà Nội');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
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

    if (luotNhan.id.includes('LN-56') || luotNhan.noiDung?.includes('môi trường')) {
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
        dauHieu: 'Ô nhiễm môi trường tiếng ồn và khí thải công nghiệp',
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
      setAiState('done');
      setReadingProgress(100);
      setOfficerNote('Đề xuất tiếp nhận đơn phản ánh kiến nghị, chuyển Phòng TN&MT phối hợp UBND Phường kiểm tra hiện trường.');
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
        dauHieu: 'Tranh chấp ranh giới ngõ đi chung',
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
        noiDungTomTat: luotNhan.noiDung || 'Phản ánh tranh chấp ranh giới sử dụng đất ngõ đi chung. Tài liệu scan kèm theo bị nghiêng mờ, cần cán bộ kiểm tra bản chính tại Một cửa.',
        yeuCau1: 'Đối chiếu bản đồ địa chính gốc.',
        yeuCau2: 'Xác minh thực địa hiện trạng.',
        yeuCau3: 'Hòa giải tranh chấp ranh giới lối đi.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setAiState('done');
      setOfficerNote('Tài liệu scan kèm theo mờ, cán bộ đã liên hệ yêu cầu công dân xuất trình bản chính để kiểm tra.');
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

  const handleSaveExtract = () => {
    setSavedExtractData({ ...extractData });
    setIsEditingExtract(false);
    showToast('✓ Đã lưu thay đổi thông tin trích xuất của AI thành công!');
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

  // Mô phỏng AI đang quét đọc tài liệu
  useEffect(() => {
    if (!isSimulating || aiState === 'done') return;

    const interval = setInterval(() => {
      setReadingProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setAiState('done');
          setIsSimulating(false);
          showToast('✓ AI đã đọc xong toàn bộ văn bản và bóc tách thông tin hoàn tất!');
          return 100;
        }
        return prev + 15;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating, aiState]);

  const handleStartSimulation = () => {
    setAiState('reading');
    setReadingProgress(20);
    setIsSimulating(true);
    showToast('Bắt đầu mô phỏng: AI đang quét OCR và đọc bóc tách văn bản đơn tố giác...');
  };

  const handleCopySummary = () => {
    navigator.clipboard?.writeText(
      'Nguyễn Văn A tố giác ông Trần Văn B (Giám đốc Công ty Cổ phần X) có hành vi lừa đảo chiếm đoạt tài sản qua huy động vốn tại Dự án Khu đô thị Y (Hà Nội) giai đoạn 2024 – 2025. Đề xuất hướng xử lý: Phân loại đơn Tố giác tội phạm; chuyển Phòng Cảnh sát kinh tế thụ lý, xác minh theo thẩm quyền; đồng thời rà soát hợp nhất với 01 đơn tương tự (D-2025-00341) và kiểm tra tiền sử 03 đơn đã gửi của người đứng đơn.'
    );
    showToast('Đã sao chép nội dung tóm tắt & đề xuất xử lý vào khay nhớ tạm.');
  };

  const handleChuyenTiepNhanSubmit = (data: ChuyenTiepNhanSubmitData) => {
    setShowChuyenModal(false);
    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    const newItem: TiepNhanDonItem = {
      id: `TN-${dynamicCode.replace('Đ-', '')}`,
      code: dynamicCode,
      luotNhanId: luotNhan?.id || 'LN-2025-0819',
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
      loaiDon: extractData.loaiNoiDung || 'Đơn tố giác về tội phạm',
      ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:15',
      ngayChuyenDen: 'Vừa xong (16/09/2026)',
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
    };

    if (data.hinhThuc === 'hang_cho') {
      showToast(`Chuyển tiếp nhận thành công. Đơn đang chờ phân công tại ${data.donViTiepNhanName}.`);
      onChuyenTiepNhan?.(newItem, false);
      setTimeout(() => {
        onNav('tiep-nhan-xu-ly');
      }, 600);
    } else {
      showToast(`Đã chuyển và giao đơn cho cán bộ ${data.canBoNhan?.name}.`);
      onChuyenTiepNhan?.(newItem, true, data.canBoNhan?.name);
      setTimeout(() => {
        onNav('cong-viec');
      }, 600);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f1f5f9] text-[#1e293b] font-body-md overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 0. BỘ CHUYỂN ĐỔI DEMO 2 TRẠNG THÁI (STATE SWITCHER BAR)                   */}
      {/* ========================================================================= */}
      <div className="bg-[#1e293b] text-white px-5 py-2 border-b border-slate-700 flex items-center justify-between text-xs shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-[18px]">tune</span>
          <span className="font-semibold text-slate-300">Chế độ hiển thị:</span>
          <div className="flex items-center p-0.5 bg-slate-800 rounded-lg border border-slate-600">
            <button
              type="button"
              onClick={() => {
                setAiState('reading');
                setReadingProgress(55);
                setIsSimulating(false);
                showToast('Chuyển sang: Trạng thái 1 - AI đang đọc thông tin.');
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${aiState === 'reading'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[14px]">sync</span>
              <span>1. AI đang đọc thông tin</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAiState('done');
                setReadingProgress(100);
                setIsSimulating(false);
                showToast('Chuyển sang: Trạng thái 2 - AI đã đọc xong thông tin (Khớp 100% ảnh mẫu).');
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${aiState === 'done'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>2. AI đã đọc xong (Ảnh mẫu)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartSimulation}
            disabled={isSimulating}
            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[15px]">play_arrow</span>
            <span>{isSimulating ? `Đang quét OCR (${readingProgress}%)...` : 'Phát lại quá trình AI quét đọc'}</span>
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
            <span className="text-slate-800 font-bold">Màn hình AI đã phân tích</span>
          </div>

          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold text-slate-900 font-headline-md tracking-tight">
              {luotNhan?.id ? (luotNhan.id.startsWith('LN') ? `Lượt nhận: ${luotNhan.id}` : `Hồ sơ: ${luotNhan.id}`) : 'Đơn số: D-2026-00125'}
            </h1>

            {aiState === 'reading' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 text-[11.5px] font-semibold font-label-technical animate-pulse">
                <span className="material-symbols-outlined text-[14px] animate-spin text-amber-600">
                  sync
                </span>
                <span>AI đang phân tích ({readingProgress}%)</span>
              </span>
            ) : (luotNhan?.id?.includes('0430') || extractData.dauHieu.includes('68%')) ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-300 text-[11.5px] font-semibold font-label-technical">
                <span className="material-symbols-outlined text-[14px] text-orange-600">warning</span>
                <span>AI cần kiểm tra (Độ tin cậy 68%)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11.5px] font-semibold font-label-technical">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>🟢 AI đã phân tích xong</span>
              </span>
            )}
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
            <span>•</span>
            <div>
              <span>Người gửi/nộp:</span> <strong className="text-slate-800 font-semibold">{extractData.nguoiGui || luotNhan?.nguoiNop}</strong>
            </div>
            <span>•</span>
            <div>
              <span>Trạng thái:</span> <strong className="text-[#C62828] font-bold">Chờ kiểm tra &amp; tiếp nhận</strong>
            </div>
          </div>
        </div>

        {/* Action Controls Top-Right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => showToast('Đang tải xuống tài liệu đơn tố giác...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span>Tải xuống</span>
          </button>
          {/* <button
            type="button"
            onClick={() => showToast('Đã tạo liên kết chia sẻ hồ sơ đơn.')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">share</span>
            <span>Chia sẻ</span>
          </button> */}
          {/* <button
            type="button"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 text-xs shadow-2xs cursor-pointer"
            title="Thêm tùy chọn"
          >
            <span className="material-symbols-outlined text-[16px]">more_horiz</span>
          </button> */}
          <button
            type="button"
            onClick={() => setShowChuyenModal(true)}
            disabled={aiState === 'reading'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C62828] hover:bg-[#b71c1c] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[17px]">forward_to_inbox</span>
            <span>Chuyển tiếp nhận và xử lý</span>
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
          {/* Header Khu vực Tài liệu */}
          <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-slate-600">description</span>
              <h2 className="text-xs font-bold text-slate-900 uppercase font-headline-md tracking-tight">
                Tài liệu / Nội dung đơn
              </h2>
            </div>
            {aiState === 'reading' && (
              <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 animate-pulse">
                <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                Đang quét OCR trang 1/3...
              </span>
            )}
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

            {/* Trang giấy mô phỏng đơn tố giác */}
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
              className="bg-white shadow-xl rounded-sm border border-slate-300 p-8 min-h-[580px] w-[95%] transition-transform text-slate-800 text-[11.5px] leading-relaxed space-y-3.5 relative"
            >
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
                  {extractData.loaiNoiDung === 'Hồ sơ cấp phép xây dựng'
                    ? 'ĐƠN ĐỀ NGHỊ CẤP GIẤY PHÉP XÂY DỰNG'
                    : extractData.loaiNoiDung === 'Đơn phản ánh kiến nghị'
                      ? 'ĐƠN PHẢN ÁNH KIẾN NGHỊ'
                      : 'ĐƠN TỐ GIÁC'}
                </h3>
                {extractData.loaiNoiDung === 'Hồ sơ cấp phép xây dựng' && (
                  <p className="text-[10.5px] italic text-slate-600">(Công trình: Nhà ở riêng lẻ đô thị - 5 tầng + 1 lửng)</p>
                )}
                {extractData.loaiNoiDung === 'Đơn phản ánh kiến nghị' && (
                  <p className="text-[10.5px] italic text-slate-600">(V/v: Cơ sở tái chế phế liệu xả khói bụi và tiếng ồn ban đêm)</p>
                )}
              </div>

              {/* Kính gửi */}
              <p className="font-semibold text-slate-900">
                Kính gửi:{' '}
                <span className="font-normal text-slate-800">
                  {extractData.loaiNoiDung === 'Hồ sơ cấp phép xây dựng'
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
              {extractData.loaiNoiDung === 'Hồ sơ cấp phép xây dựng' && (
                <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-300 text-[11px] text-orange-950 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-orange-900">
                    <span className="material-symbols-outlined text-[15px] text-orange-600">warning</span>
                    <span>AI PHÂN TÍCH &amp; CẢNH BÁO (Độ tin cậy 68%):</span>
                  </div>
                  <p className="leading-relaxed">
                    Đối soát với CSDL Quy hoạch &amp; bản đồ chỉ giới: Bản vẽ hiện trạng có dấu hiệu chồng lấn <strong>0.35m</strong> với chỉ giới ngõ đi chung. Cần cán bộ kiểm tra thực địa trước khi tiếp nhận.
                  </p>
                </div>
              )}

              {extractData.loaiNoiDung === 'Đơn phản ánh kiến nghị' && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-950 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-emerald-900">
                    <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                    <span>AI ĐÃ PHÂN TÍCH &amp; BÓC TÁCH (Độ tin cậy 94%):</span>
                  </div>
                  <p className="leading-relaxed">
                    Đã bóc tách tự động hành vi phản ánh về môi trường tiếng ồn và khí thải. Đối tượng liên quan: {extractData.doiTuong}.
                  </p>
                </div>
              )}

              {extractData.loaiNoiDung !== 'Hồ sơ cấp phép xây dựng' && extractData.loaiNoiDung !== 'Đơn phản ánh kiến nghị' && (
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-950 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-blue-900">
                    <span className="material-symbols-outlined text-[15px] text-blue-600">smart_toy</span>
                    <span>AI ĐÃ PHÂN TÍCH VĂN BẢN (Độ tin cậy 92%):</span>
                  </div>
                  <p className="leading-relaxed">
                    Đã trích xuất tự động thông tin người gửi, đối tượng liên quan và các yêu cầu cụ thể của đương sự.
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
                      className={`font-semibold text-slate-900 px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'diaDiem' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
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
            </div>
          </div>

          {/* Tài liệu kèm theo (2) */}
          <div className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold text-slate-800">
                Tài liệu kèm theo (2)
              </span>
              <button
                type="button"
                onClick={() => showToast('Mở hộp thoại tải lên tài liệu chứng cứ kèm theo...')}
                className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>+ Thêm tài liệu</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => {
                  setSelectedFileId('f1');
                  showToast('Đang mở: Đơn tố giác.pdf');
                }}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left cursor-pointer transition-all ${selectedFileId === 'f1'
                  ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-300'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px] text-rose-600 shrink-0">
                  picture_as_pdf
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-semibold text-slate-800 truncate">
                    Đơn tố giác.pdf
                  </p>
                  <span className="text-[10px] text-slate-400 font-label-technical">
                    1.2 MB • 15/09/2026 10:24
                  </span>
                </div>
              </div>

              <div
                onClick={() => {
                  setSelectedFileId('f2');
                  showToast('Đang mở: Hợp đồng góp vốn.pdf');
                }}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left cursor-pointer transition-all ${selectedFileId === 'f2'
                  ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-300'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px] text-rose-600 shrink-0">
                  picture_as_pdf
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-semibold text-slate-800 truncate">
                    Hợp đồng góp vốn.pdf
                  </p>
                  <span className="text-[10px] text-slate-400 font-label-technical">
                    2.8 MB • 15/09/2026 10:24
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* BÊN PHẢI: CÁC KHỐI ②, ③, ④, ⑤, ⑥ (54% Width)                            */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="w-[54%] flex flex-col h-full overflow-y-auto space-y-3.5 pr-1">
          {/* =================================================================== */}
          {/* KHỐI ②: THÔNG TIN TRÍCH XUẤT TỪ ĐƠN (AI)                           */}
          {/* =================================================================== */}
          <div className={`bg-white rounded-2xl border ${isEditingExtract ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-slate-200/90 shadow-2xs'} p-4 space-y-3 transition-all`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 font-headline-md tracking-tight">
                  Thông tin trích xuất từ đơn (AI)
                </h3>
              </div>

              {aiState === 'reading' ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold font-label-technical border border-amber-200 animate-pulse">
                  <span className="material-symbols-outlined text-[13px] animate-spin text-amber-600">
                    sync
                  </span>
                  Đang bóc tách ({readingProgress}%)
                </span>
              ) : isEditingExtract ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-[11px] text-[#004ac6] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                    Nhấp trực tiếp vào chữ để sửa
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveExtract}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-[#004ac6] hover:bg-[#003ea8] text-white transition-all cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    <span>Lưu</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelExtract}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200"
                  >
                    <span>Hủy</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Đã hoàn thành
                  </span>
                  <span className="text-slate-400 font-label-technical">Cập nhật lúc 10:24</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingExtract(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md text-[#004ac6] hover:text-[#003ea8] hover:bg-blue-50 border border-blue-200 transition-all cursor-pointer shadow-2xs ml-1"
                    title="Chỉnh sửa trực tiếp nội dung văn bản"
                  >
                    <span className="material-symbols-outlined text-[13px]">edit</span>
                    <span>Chỉnh sửa</span>
                  </button>
                </div>
              )}
            </div>

            {/* Grid 6 ô thông tin chi tiết */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* 1. Người gửi */}
              <div
                onMouseEnter={() => setActiveHighlightKey('nguoiGui')}
                onMouseLeave={() => setActiveHighlightKey(null)}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <div className="min-w-0 flex-1 leading-snug space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-medium block">Người gửi</span>
                  <div>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('nguoiGui', e.currentTarget.textContent || '')}
                      className={`font-bold text-slate-900 text-[12.5px] outline-none transition-all inline-block ${isEditingExtract
                        ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 py-0.5 rounded cursor-text focus:bg-white focus:border-solid focus:border-[#004ac6] focus:ring-1 focus:ring-blue-300'
                        : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.nguoiGui}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 flex items-center flex-wrap gap-1">
                    <span>Sinh năm:</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('namSinh', e.currentTarget.textContent || '')}
                      className={`outline-none transition-all ${isEditingExtract
                        ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                        : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.namSinh}
                    </span>
                    <span>| CCCD:</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('cccd', e.currentTarget.textContent || '')}
                      className={`font-label-technical font-semibold text-slate-800 outline-none transition-all ${isEditingExtract
                        ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                        : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.cccd}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-600 flex items-center gap-1">
                    <span>SĐT:</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('sdt', e.currentTarget.textContent || '')}
                      className={`font-label-technical outline-none transition-all ${isEditingExtract
                        ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                        : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.sdt}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-600 flex items-start gap-1">
                    <span className="shrink-0">Địa chỉ:</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('diaChi', e.currentTarget.textContent || '')}
                      className={`outline-none transition-all ${isEditingExtract
                        ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                        : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.diaChi}
                    </span>
                  </p>
                </div>
              </div>

              {/* 2. Loại nội dung */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">gavel</span>
                </div>
                <div className="min-w-0 flex-1 leading-snug space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-medium block">Loại nội dung</span>
                  {aiState === 'reading' && readingProgress < 70 ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="h-3 w-28 bg-slate-200 rounded skel" />
                      <div className="h-2.5 w-40 bg-slate-200 rounded skel" />
                    </div>
                  ) : (
                    <>
                      <div className="font-bold text-blue-900 text-[12.5px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-blue-700 shrink-0">shield</span>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('loaiNoiDung', e.currentTarget.textContent || '')}
                          className={`outline-none transition-all ${isEditingExtract
                            ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 py-0.5 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                            : ''
                            }`}
                          title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                        >
                          {extractData.loaiNoiDung}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 pt-0.5 flex items-center flex-wrap gap-1">
                        <span>Có dấu hiệu:</span>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('dauHieu', e.currentTarget.textContent || '')}
                          className={`text-slate-800 font-medium outline-none transition-all ${isEditingExtract
                            ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                            : ''
                            }`}
                          title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                        >
                          {extractData.dauHieu}
                        </span>
                      </p>

                      {/* Quick select pills for testing rule 8 */}
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-medium">Chọn nhanh:</span>
                        {[
                          'Tố giác tội phạm',
                          'Đơn khiếu nại (Lần 1)',
                          'Đơn tố cáo',
                          'Đơn phản ánh, kiến nghị',
                        ].map((ld) => (
                          <button
                            key={ld}
                            type="button"
                            onClick={() => {
                              updateExtractField('loaiNoiDung', ld);
                              showToast(`Đã chuyển loại đơn sang: "${ld}"`);
                            }}
                            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${extractData.loaiNoiDung === ld
                              ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                          >
                            {ld}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 3. Đối tượng bị tố giác / liên quan */}
              <div
                onMouseEnter={() => setActiveHighlightKey('doiTuong')}
                onMouseLeave={() => setActiveHighlightKey(null)}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-purple-50/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                </div>
                <div className="min-w-0 flex-1 leading-snug space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-medium block">
                    Đối tượng bị tố giác / liên quan
                  </span>
                  <div>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('doiTuong', e.currentTarget.textContent || '')}
                      className={`font-bold text-slate-900 text-[12.5px] outline-none transition-all inline-block ${isEditingExtract
                        ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 py-0.5 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                        : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.doiTuong}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 flex items-center gap-1">
                    <span>Chức vụ:</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('chucVu', e.currentTarget.textContent || '')}
                      className={`outline-none transition-all ${isEditingExtract
                        ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                        : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.chucVu}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-600 flex items-center gap-1">
                    <span>Đơn vị:</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('donVi', e.currentTarget.textContent || '')}
                      className={`outline-none transition-all ${isEditingExtract
                        ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                        : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.donVi}
                    </span>
                  </p>
                </div>
              </div>

              {/* 4. Thời gian sự việc */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                </div>
                <div className="min-w-0 flex-1 leading-snug space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-medium block">
                    Thời gian sự việc
                  </span>
                  {aiState === 'reading' && readingProgress < 60 ? (
                    <div className="h-3.5 w-32 bg-slate-200 rounded skel mt-1" />
                  ) : (
                    <p className="font-bold text-slate-800 text-[12px] pt-0.5">
                      <span
                        contentEditable={isEditingExtract}
                        suppressContentEditableWarning
                        onBlur={(e) => updateExtractField('thoiGian', e.currentTarget.textContent || '')}
                        className={`outline-none transition-all ${isEditingExtract
                          ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 py-0.5 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                          : ''
                          }`}
                        title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                      >
                        {extractData.thoiGian}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* 5. Địa điểm, dự án, sự việc */}
              <div
                onMouseEnter={() => setActiveHighlightKey('diaDiem')}
                onMouseLeave={() => setActiveHighlightKey(null)}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-rose-50/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                </div>
                <div className="min-w-0 flex-1 leading-snug space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-medium block">
                    Địa điểm, dự án, sự việc
                  </span>
                  <div className="font-bold text-slate-900 text-[12px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-rose-600 shrink-0">place</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('duAn', e.currentTarget.textContent || '')}
                      className={`outline-none transition-all ${isEditingExtract
                        ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 py-0.5 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                        : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.duAn}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-4">
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('diaDiem', e.currentTarget.textContent || '')}
                      className={`outline-none transition-all ${isEditingExtract
                        ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                        : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.diaDiem}
                    </span>
                  </p>
                </div>
              </div>

              {/* 6. Yêu cầu của người gửi */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-emerald-50/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                </div>
                <div className="min-w-0 flex-1 leading-snug space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-medium block">
                    Yêu cầu của người gửi
                  </span>
                  {aiState === 'reading' && readingProgress < 75 ? (
                    <div className="space-y-1 pt-1">
                      <div className="h-2.5 w-full bg-slate-200 rounded skel" />
                      <div className="h-2.5 w-4/5 bg-slate-200 rounded skel" />
                    </div>
                  ) : (
                    <ul className="text-[11px] text-slate-700 space-y-1 list-disc list-inside">
                      <li>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('yeuCau1', e.currentTarget.textContent || '')}
                          className={`outline-none transition-all ${isEditingExtract
                            ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                            : ''
                            }`}
                          title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                        >
                          {extractData.yeuCau1}
                        </span>
                      </li>
                      <li>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('yeuCau2', e.currentTarget.textContent || '')}
                          className={`outline-none transition-all ${isEditingExtract
                            ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                            : ''
                            }`}
                          title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                        >
                          {extractData.yeuCau2}
                        </span>
                      </li>
                      <li>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('yeuCau3', e.currentTarget.textContent || '')}
                          className={`outline-none transition-all ${isEditingExtract
                            ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                            : ''
                            }`}
                          title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                        >
                          {extractData.yeuCau3}
                        </span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* KHỐI ③: KẾT QUẢ TRA CỨU TRONG HỆ THỐNG                              */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 font-headline-md tracking-tight">
                  Kết quả tra cứu trong hệ thống
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  AI đã đối soát 3 nguồn CSDL
                </span>
              </div>
              <button
                type="button"
                onClick={() => openNguonTraCuu('nguoi-gui')}
                className="text-[11px] text-[#004ac6] hover:underline font-bold flex items-center gap-1 cursor-pointer bg-blue-50/70 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">database</span>
                <span>Xem nguồn thông tin gốc</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>
            </div>

            {/* 3 Thẻ kết quả */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Thẻ 1: Lịch sử người gửi */}
              <div
                onClick={() => openNguonTraCuu('nguoi-gui')}
                className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-start gap-2.5 relative cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[17px]">badge</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 block leading-tight">
                      Lịch sử người gửi
                    </span>
                    <span className="text-[9.5px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded font-mono">
                      CSDL Tiếp dân
                    </span>
                  </div>
                  {aiState === 'reading' && readingProgress < 60 ? (
                    <div className="h-5 w-8 bg-blue-200 rounded skel my-1" />
                  ) : (
                    <div className="text-[20px] font-bold text-slate-900 font-headline-md leading-none my-0.5">
                      3
                    </div>
                  )}
                  <p className="text-[10.5px] text-slate-500">đơn đã gửi trước đây</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNguonTraCuu('nguoi-gui');
                    }}
                    className="text-[10.5px] text-[#004ac6] hover:underline font-bold flex items-center gap-1 mt-1.5 cursor-pointer bg-white/90 hover:bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs transition-all"
                  >
                    <span className="material-symbols-outlined text-[13px]">visibility</span>
                    <span>Xem 03 đơn gốc</span>
                    <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Thẻ 2: Đơn tương tự */}
              <div
                onClick={() => openNguonTraCuu('don-tuong-tu')}
                className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 hover:border-amber-400 hover:bg-amber-50 transition-all flex items-start gap-2.5 relative cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[17px]">description</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 block leading-tight">
                      Đơn tương tự
                    </span>
                    <span className="text-[9.5px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded font-mono">
                      Đ-2025-00341
                    </span>
                  </div>
                  {aiState === 'reading' && readingProgress < 75 ? (
                    <div className="h-5 w-8 bg-amber-200 rounded skel my-1" />
                  ) : (
                    <div className="text-[20px] font-bold text-slate-900 font-headline-md leading-none my-0.5">
                      1
                    </div>
                  )}
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    đơn có nội dung tương tự
                  </p>
                  <p className="text-[10px] text-amber-800 font-bold">Độ tương đồng cao (86%)</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNguonTraCuu('don-tuong-tu');
                    }}
                    className="text-[10.5px] text-amber-900 hover:underline font-bold flex items-center gap-1 mt-1.5 cursor-pointer bg-white/90 hover:bg-white px-2 py-0.5 rounded-md border border-amber-300 shadow-2xs transition-all"
                  >
                    <span className="material-symbols-outlined text-[13px]">visibility</span>
                    <span>Đối chiếu đơn gốc (86%)</span>
                    <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Thẻ 3: Vụ việc liên quan */}
              <div
                onClick={() => openNguonTraCuu('vu-viec')}
                className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/80 hover:border-purple-400 hover:bg-purple-50 transition-all flex items-start gap-2.5 relative cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[17px]">folder</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 block leading-tight">
                      Vụ việc liên quan
                    </span>
                    <span className="text-[9.5px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.2 rounded font-mono">
                      VV-2026-0042
                    </span>
                  </div>
                  {aiState === 'reading' && readingProgress < 85 ? (
                    <div className="h-5 w-8 bg-purple-200 rounded skel my-1" />
                  ) : (
                    <div className="text-[20px] font-bold text-slate-900 font-headline-md leading-none my-0.5">
                      1
                    </div>
                  )}
                  <p className="text-[10.5px] text-slate-500 leading-tight">vụ việc đang xử lý (PC03)</p>
                  <p className="text-[10px] text-purple-800 font-medium">Cùng dự án Khu đô thị Y</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNguonTraCuu('vu-viec');
                    }}
                    className="text-[10.5px] text-purple-900 hover:underline font-bold flex items-center gap-1 mt-1.5 cursor-pointer bg-white/90 hover:bg-white px-2 py-0.5 rounded-md border border-purple-200 shadow-2xs transition-all"
                  >
                    <span className="material-symbols-outlined text-[13px]">visibility</span>
                    <span>Xem hồ sơ vụ việc gốc</span>
                    <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* 4. PHÂN LOẠI GỢI Ý (AI + RULES)                                     */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5 font-headline-md">
                <span>4. Phân loại gợi ý</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCanCuModal(true)}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">menu_book</span>
                <span>Căn cứ gợi ý</span>
              </button>
            </div>

            {aiState === 'reading' && readingProgress < 85 ? (
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <div className="h-10 bg-slate-200 rounded-lg skel" />
                <div className="h-10 bg-slate-200 rounded-lg skel" />
                <div className="h-10 bg-slate-200 rounded-lg skel" />
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {/* Hàng 1: Đề xuất loại đơn */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/90">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                      <span className="material-symbols-outlined text-[18px]">description</span>
                    </div>
                    <div>
                      <span className="text-[10.5px] text-slate-500 font-medium block">Đề xuất loại đơn</span>
                      <span className="text-sm font-bold text-slate-900">{extractData.loaiNoiDung || 'Tố giác tội phạm'}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 shrink-0">
                    Độ tin cậy: 92%
                  </span>
                </div>

                {/* Hàng 2: Nhóm nội dung */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-slate-500 font-medium block">Nhóm nội dung</span>
                    <span className="text-xs sm:text-sm font-medium text-slate-800">{extractData.dauHieu || 'Lừa đảo chiếm đoạt tài sản'}</span>
                  </div>
                </div>

                {/* Hàng 3: Lĩnh vực */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="material-symbols-outlined text-[18px]">category</span>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-slate-500 font-medium block">Lĩnh vực</span>
                    <span className="text-xs sm:text-sm font-medium text-slate-800">Kinh tế</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =================================================================== */}
          {/* 5. GỢI Ý HƯỚNG XỬ LÝ                                                */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-2 font-headline-md">
              5. Gợi ý hướng xử lý
            </h3>

            {aiState === 'reading' && readingProgress < 85 ? (
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <div className="h-16 bg-slate-200 rounded-lg skel" />
                <div className="h-16 bg-slate-200 rounded-lg skel" />
                <div className="h-16 bg-slate-200 rounded-lg skel" />
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {/* Tùy chọn 1: Tiếp nhận, chuyển đơn vị điều tra theo thẩm quyền (92%) */}
                <div
                  onClick={() => {
                    setHuongXuLy('tiep-nhan');
                    setOfficerNote('Qua phân tích, đề xuất tiếp nhận đơn và chuyển Phòng Cảnh sát kinh tế để xem xét, giải quyết theo thẩm quyền.');
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${huongXuLy === 'tiep-nhan'
                    ? 'bg-emerald-50/40 border-emerald-400 ring-1 ring-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5 shrink-0">
                      {huongXuLy === 'tiep-nhan' ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                          ✓
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-slate-300 block" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          Tiếp nhận, chuyển đơn vị điều tra theo thẩm quyền
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                          92%
                        </span>
                      </div>
                      <ul className="text-slate-600 space-y-0.5 mt-1.5 pl-0.5 leading-relaxed">
                        <li>• Có dấu hiệu tội phạm theo quy định.</li>
                        <li>• Thuộc thẩm quyền của Cơ quan CSĐT Công an TP Hà Nội.</li>
                        <li className="text-slate-500">Có đơn tương tự đã tiếp nhận trước đây, cần xem xét, tổng hợp.</li>
                      </ul>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCanCu(expandedCanCu === 'op1' ? null : 'op1');
                        }}
                        className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5 mt-2 cursor-pointer"
                      >
                        <span>Xem căn cứ</span>
                        <span className="material-symbols-outlined text-[13px]">
                          {expandedCanCu === 'op1' ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedCanCu === 'op1' && (
                        <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1 animate-fade-in">
                          <p>• <strong>Điều 145 Bộ luật Tố tụng Hình sự 2015:</strong> Thẩm quyền và trách nhiệm tiếp nhận, giải quyết tố giác tội phạm.</p>
                          <p>• <strong>Thông tư liên tịch 01/2017:</strong> Quy định phối hợp tiếp nhận, thụ lý nguồn tin tội phạm.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tùy chọn 2: Kiểm tra, xác minh thông tin bổ sung (68%) */}
                <div
                  onClick={() => {
                    setHuongXuLy('xac-minh');
                    setOfficerNote('Cần tiến hành kiểm tra, xác minh làm rõ thêm tài liệu kèm theo trước khi quyết định thụ lý chính thức.');
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${huongXuLy === 'xac-minh'
                    ? 'bg-blue-50/40 border-blue-400 ring-1 ring-blue-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5 shrink-0">
                      {huongXuLy === 'xac-minh' ? (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                          ✓
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-slate-300 block" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          Kiểm tra, xác minh thông tin bổ sung
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold shrink-0">
                          68%
                        </span>
                      </div>
                      <ul className="text-slate-600 space-y-0.5 mt-1.5 pl-0.5 leading-relaxed">
                        <li>• Cần làm rõ một số nội dung, tài liệu kèm theo.</li>
                        <li>• Có liên quan đến vụ việc đang điều tra.</li>
                        <li>• Đề nghị liên hệ người gửi để bổ sung tài liệu liên quan.</li>
                      </ul>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCanCu(expandedCanCu === 'op2' ? null : 'op2');
                        }}
                        className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5 mt-2 cursor-pointer"
                      >
                        <span>Xem căn cứ</span>
                        <span className="material-symbols-outlined text-[13px]">
                          {expandedCanCu === 'op2' ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedCanCu === 'op2' && (
                        <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1 animate-fade-in">
                          <p>• <strong>Khoản 2 Điều 147 Bộ luật Tố tụng Hình sự 2015:</strong> Thời hạn và thủ tục xác minh nguồn tin về tội phạm.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tùy chọn 3: Chuyển đơn đến đơn vị khác (35%) */}
                <div
                  onClick={() => {
                    setHuongXuLy('chuyen');
                    setOfficerNote('Vụ việc không thuộc thẩm quyền giải quyết của đơn vị, đề xuất lập phiếu chuyển đơn đến cơ quan có thẩm quyền.');
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${huongXuLy === 'chuyen'
                    ? 'bg-amber-50/40 border-amber-400 ring-1 ring-amber-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5 shrink-0">
                      {huongXuLy === 'chuyen' ? (
                        <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                          ✓
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-slate-300 block" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          Chuyển đơn đến đơn vị khác
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold shrink-0">
                          35%
                        </span>
                      </div>
                      <ul className="text-slate-600 space-y-0.5 mt-1.5 pl-0.5 leading-relaxed">
                        <li>• Không thuộc thẩm quyền giải quyết.</li>
                        <li>• Đề nghị chuyển đến cơ quan có thẩm quyền.</li>
                      </ul>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCanCu(expandedCanCu === 'op3' ? null : 'op3');
                        }}
                        className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5 mt-2 cursor-pointer"
                      >
                        <span>Xem căn cứ</span>
                        <span className="material-symbols-outlined text-[13px]">
                          {expandedCanCu === 'op3' ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedCanCu === 'op3' && (
                        <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1 animate-fade-in">
                          <p>• <strong>Điều 146 Bộ luật Tố tụng Hình sự:</strong> Chuyển tố giác, tin báo theo đúng thẩm quyền thụ lý.</p>
                        </div>
                      )}
                      {huongXuLy === 'chuyen' && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Đơn vị nhận chuyển đơn:
                          </label>
                          <select
                            value={donViChuyen}
                            onChange={(e) => setDonViChuyen(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                          >
                            <option value="">— Chọn đơn vị tiếp nhận —</option>
                            {DON_VI_OPTIONS.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =================================================================== */}
          {/* 6. Ý KIẾN CỦA CÁN BỘ TIẾP NHẬN                                       */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight font-headline-md">
                6. Ý kiến của cán bộ tiếp nhận
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Quyết định xử lý hồ sơ</span>
            </div>

            <div>
              <textarea
                rows={3}
                value={officerNote}
                onChange={(e) => setOfficerNote(e.target.value)}
                placeholder="Nhập ý kiến đề xuất xử lý của cán bộ..."
                maxLength={500}
                className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all resize-none leading-relaxed"
              />
              <div className="flex justify-end pt-1">
                <span className="text-[11px] text-slate-400 font-mono">
                  {officerNote.length}/500
                </span>
              </div>
            </div>



            {/* Nhóm các nút hành động: Trả lại, Bàn giao, Tiếp nhận và xử lý */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => showToast('Đã lưu tạm ý kiến cán bộ tiếp nhận.')}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">save</span>
                <span>Lưu nháp</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Nút 1: Trả lại */}
                <button
                  type="button"
                  onClick={() => setShowTraLaiModal(true)}
                  disabled={aiState === 'reading'}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">assignment_return</span>
                  <span>Trả lại</span>
                </button>

                {/* Nút 2: Bàn giao */}
                <button
                  type="button"
                  onClick={() => setShowBanGiaoModal(true)}
                  disabled={aiState === 'reading'}
                  className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                  <span>Bàn giao</span>
                </button>

                {/* Nút 3: Tiếp nhận */}
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  disabled={aiState === 'reading'}
                  className="px-5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003da8] active:scale-95 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  <span>Tiếp nhận</span>
                </button>
              </div>
            </div>
          </div>
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
      {/* MODAL TRẢ LẠI ĐƠN                                                         */}
      {/* ========================================================================= */}
      {showTraLaiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">assignment_return</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác nhận trả lại đơn</h3>
                <p className="text-xs text-slate-500">Đơn số: D-2026-00125 - Người gửi: Nguyễn Văn A</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do trả lại đơn:
                </label>
                <select
                  value={traLaiReason}
                  onChange={(e) => setTraLaiReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                >
                  <option value="Không thuộc thẩm quyền giải quyết">Không thuộc thẩm quyền giải quyết</option>
                  <option value="Thiếu hồ sơ tài liệu chứng minh theo quy định">Thiếu hồ sơ tài liệu chứng minh theo quy định</option>
                  <option value="Đơn trùng lặp nội dung đã có thông báo trả lời">Đơn trùng lặp nội dung đã có thông báo trả lời</option>
                  <option value="Người gửi có đơn xin rút yêu cầu xử lý">Người gửi có đơn xin rút yêu cầu xử lý</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung thông báo hướng dẫn người gửi:
                </label>
                <textarea
                  rows={2}
                  defaultValue="Đề nghị công dân gửi đơn đến đúng cơ quan có thẩm quyền hoặc bổ sung đầy đủ tài liệu, chứng cứ kèm theo."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTraLaiModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTraLaiModal(false);
                  showToast('Đã trả lại đơn D-2026-00125 và gửi thông báo cho công dân thành công.');
                  setTimeout(() => onNav('cong-viec'), 1500);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Xác nhận trả lại</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL BÀN GIAO ĐƠN                                                        */}
      {/* ========================================================================= */}
      {showBanGiaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">swap_horiz</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Bàn giao / Chuyển đơn</h3>
                <p className="text-xs text-slate-500">Đơn số: D-2026-00125 - Người gửi: Nguyễn Văn A</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đơn vị tiếp nhận bàn giao:
                </label>
                <select
                  value={banGiaoUnit}
                  onChange={(e) => setBanGiaoUnit(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="Phòng Cảnh sát kinh tế (PC03) - Công an TP. Hà Nội">Phòng Cảnh sát kinh tế (PC03) - Công an TP. Hà Nội</option>
                  <option value="Phòng Cảnh sát hình sự (PC02) - Công an TP. Hà Nội">Phòng Cảnh sát hình sự (PC02) - Công an TP. Hà Nội</option>
                  <option value="Công an Quận Cầu Giấy - Đội Điều tra tổng hợp">Công an Quận Cầu Giấy - Đội Điều tra tổng hợp</option>
                  <option value="Viện Kiểm sát Nhân dân TP. Hà Nội">Viện Kiểm sát Nhân dân TP. Hà Nội</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900 space-y-1">
                <p className="font-semibold">Hồ sơ bàn giao đính kèm:</p>
                <p className="text-[11px] text-amber-800">• 01 Đơn tố giác bản gốc (3 trang scan)</p>
                <p className="text-[11px] text-amber-800">• 02 Hợp đồng góp vốn photo có đối chiếu</p>
                <p className="text-[11px] text-amber-800">• Phiếu phân tích sơ bộ &amp; kết quả tra cứu hệ thống do AI trích xuất</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBanGiaoModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBanGiaoModal(false);
                  showToast(`Đã tạo phiếu bàn giao đơn D-2026-00125 sang ${banGiaoUnit} thành công.`);
                  setTimeout(() => onNav('cong-viec'), 1500);
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">forward</span>
                <span>Xác nhận bàn giao</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-up">
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

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 shrink-0">Người gửi:</span>
                <strong className="text-slate-900 text-right">{extractData.nguoiGui || 'Nguyễn Văn A'}</strong>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 shrink-0">Phân loại đơn:</span>
                <strong className="text-slate-900 text-right">{extractData.loaiNoiDung || 'Đơn tố giác về tội phạm'}</strong>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 shrink-0">Hướng xử lý:</span>
                <span className="font-semibold text-blue-700 text-right">Thụ lý đơn &amp; phân công xác minh</span>
              </div>
              {/* Gợi ý bước tiếp theo theo quy trình */}
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-950 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#004ac6]">
                  <span className="material-symbols-outlined text-[15px]">bolt</span>
                  <span>Sau khi tiếp nhận, quy trình gợi ý các nút xử lý tiếp theo:</span>
                </div>
                <div className="space-y-1 text-[11px] text-blue-900">
                  {suggestedWfActions.slice(0, 3).map((act, i) => (
                    <div key={act.id} className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 2}
                      </span>
                      <span className="font-semibold text-slate-800">{act.title}</span>
                    </div>
                  ))}
                </div>
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const dynamicCode = luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125';
                    setShowSubmitModal(false);
                    showToast(`✓ Đã tiếp nhận đơn ${dynamicCode} thành công! Đang chuyển về Bàn việc...`);
                    onAcceptAndProcess?.({
                      id: dynamicCode,
                      code: dynamicCode,
                      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
                      luotNhanId: luotNhan?.id || 'LN-2025-0819',
                      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Công dân',
                      ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:15',
                      loaiDon: extractData.loaiNoiDung || 'Đơn tiếp nhận hành chính',
                      type: dynamicCode.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN',
                      statusBadge: 'Đã tiếp nhận',
                      isNew: true,
                    });
                    setTimeout(() => onNav('cong-viec'), 600);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-all"
                >
                  Tiếp nhận &amp; Về Bàn việc
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const dynamicCode = luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125';
                    setShowSubmitModal(false);
                    showToast(`✓ Đã tiếp nhận đơn ${dynamicCode}. Mở màn hình gợi ý xử lý tiếp theo...`);
                    onAcceptAndProcess?.({
                      id: dynamicCode,
                      code: dynamicCode,
                      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
                      luotNhanId: luotNhan?.id || 'LN-2025-0819',
                      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Công dân',
                      ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:15',
                      loaiDon: extractData.loaiNoiDung || 'Đơn tiếp nhận hành chính',
                      type: dynamicCode.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN',
                      statusBadge: 'Đã tiếp nhận',
                      isNew: true,
                    });
                    setTimeout(() => onNav('don-tiep-nhan'), 600);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  <span>Tiếp nhận &amp; Xử lý bước tiếp theo ➔</span>
                </button>
              </div>
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
    </div>
  );
}