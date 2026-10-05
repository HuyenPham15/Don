import React, { useState, useEffect } from 'react';
import { Screen, DonDetail } from "../types";
import TabThongTinChung from '../components/tabs/TabThongTinChung';
import TabMoiLienHe from '../components/tabs/TabMoiLienHe';
import TabDonKhac from '../components/tabs/TabDonKhac';
import TabTaiLieu from '../components/tabs/TabTaiLieu';
import { matchWorkflowByLoaiDon } from '../constants/workflows';
import ThongBaoBoSungModal from '../components/workflow/ThongBaoBoSungModal';
import ThucHienBuocTiepTheoModal from '../components/workflow/ThucHienBuocTiepTheoModal';
import XacMinhVaDeXuatModal, { HuongGiaiQuyetType, VanBanXacMinhItem } from '../components/modals/XacMinhVaDeXuatModal';
import KhongThuLyModal from '../components/modals/KhongThuLyModal';
import TraLaiDonModal, { TraLaiDonSubmitData } from '../components/modals/TraLaiDonModal';
import BanGiaoDonModal, { BanGiaoDonSubmitData } from '../components/modals/BanGiaoDonModal';

interface DonTiepNhanProps {
  onNav: (s: Screen) => void;
  donDetail?: DonDetail | null;
  /** Khi true: tự động mở XacMinhVaDeXuatModal ngay khi vào màn */
  openXacMinhOnEnter?: boolean;
  /** Callback báo App đã xử lý flag, để reset về false */
  onXacMinhOpened?: () => void;
}

export const HUONG_XU_LY_CONFIG: Record<
  HuongGiaiQuyetType,
  {
    label: string;
    subLabel: string;
    badgeColor: string;
    buttonText: string;
    icon: string;
  }
> = {
  thu_ly: {
    label: 'Thụ lý giải quyết',
    subLabel: 'Đủ điều kiện thụ lý theo Điều 29 Luật Tố cáo 2018',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    buttonText: 'Lập Tờ trình & Thụ lý đơn',
    icon: 'gavel',
  },
  khong_thu_ly: {
    label: 'Không thụ lý giải quyết',
    subLabel: 'Theo Điều 29 Luật Tố cáo / Điều 28 Luật Khiếu nại',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-300',
    buttonText: 'Lập Thông báo không thụ lý (Điều 29)',
    icon: 'cancel',
  },
  tra_lai: {
    label: 'Trả lại đơn & Hướng dẫn',
    subLabel: 'Không thuộc thẩm quyền hoặc rút đơn',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    buttonText: 'Lập Phiếu trả lại đơn & Hướng dẫn',
    icon: 'assignment_return',
  },
  yeu_cau_bo_sung: {
    label: 'Yêu cầu bổ sung tài liệu',
    subLabel: 'Chưa đủ chứng cứ hoặc thông tin theo luật định',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-300',
    buttonText: 'Tạo Thông báo yêu cầu bổ sung',
    icon: 'note_add',
  },
  ban_giao: {
    label: 'Chuyển cơ quan có thẩm quyền',
    subLabel: 'Chuyển vụ việc theo đúng thẩm quyền nghiệp vụ',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-300',
    buttonText: 'Lập Phiếu chuyển cơ quan khác',
    icon: 'drive_file_move',
  },
};

export default function DonTiepNhan({ onNav, donDetail, openXacMinhOnEnter, onXacMinhOpened }: DonTiepNhanProps) {
  const [activeTab, setActiveTab] = useState<'thong-tin' | 'lien-he' | 'don-khac' | 'tai-lieu'>('thong-tin');
  const [docCount, setDocCount] = useState<number>(6);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Trạng thái xác minh thông tin đơn: 'dang_xac_minh' -> 'da_xac_minh'
  const isInitiallyVerified = Boolean(
    donDetail?.statusBadge?.includes('Đã xác minh') ||
    donDetail?.statusBadge?.includes('Đã thụ lý') ||
    donDetail?.statusBadge?.includes('Đã hoàn thành')
  );

  const [trangThaiXacMinh, setTrangThaiXacMinh] = useState<'dang_xac_minh' | 'da_xac_minh'>(
    isInitiallyVerified ? 'da_xac_minh' : 'dang_xac_minh'
  );
  const [huongXuLyDaChon, setHuongXuLyDaChon] = useState<HuongGiaiQuyetType | null>(null);

  // State các Modal
  const [showXacMinhModal, setShowXacMinhModal] = useState<boolean>(false);
  const [showModalBoSung, setShowModalBoSung] = useState(false);
  const [showModalBuocTiepTheo, setShowModalBuocTiepTheo] = useState(false);
  const [showKhongThuLyModal, setShowKhongThuLyModal] = useState(false);
  const [showTraLaiModal, setShowTraLaiModal] = useState(false);
  const [showBanGiaoModal, setShowBanGiaoModal] = useState(false);
  const [daHoanThanhBuoc, setDaHoanThanhBuoc] = useState(false);
  const [daGuiThongBaoBoSung, setDaGuiThongBaoBoSung] = useState(false);

  // Danh sách văn bản xác minh dùng chung giữa Modal Xác minh và Tab Hồ sơ & Văn bản
  const [vanBanXacMinhList, setVanBanXacMinhList] = useState<VanBanXacMinhItem[]>([
    {
      id: 'DOC-XM-01',
      loai: 'giay_moi',
      tenVanBan: 'Giấy mời làm việc với người gửi đơn',
      soKyHieu: '18/GM-TCD',
      ngayLap: '16/09/2026',
      nguoiNhan: 'Nguyễn Văn A',
      trichYeu: 'V/v Làm việc, cung cấp thông tin, tài liệu liên quan đến nội dung đơn',
      thoiGianHen: '08:30 ngày 18/09/2026',
      diaDiem: 'Phòng Tiếp công dân & Xử lý đơn (Phòng 102, Trụ sở UBND quận)',
      noiDungChiTiet: 'Kính mời Ông/Bà Nguyễn Văn A có mặt tại Phòng Tiếp công dân để làm việc về nội dung đơn đề ngày 16/09/2026.\nKhi đi mang theo Căn cước công dân và toàn bộ bản chính tài liệu, chứng cứ có liên quan đến việc phản ánh/tố cáo để đối chiếu, xác minh làm rõ theo quy định pháp luật.',
      trangThai: 'da_ban_hanh',
    },
    {
      id: 'DOC-XM-02',
      loai: 'bien_ban',
      tenVanBan: 'Biên bản làm việc xác minh thông tin ban đầu',
      soKyHieu: '02/BB-XM',
      ngayLap: '17/09/2026',
      nguoiNhan: 'Nguyễn Văn A (Người đứng đơn)',
      trichYeu: 'Ghi nhận ý kiến trình bày và tiếp nhận tài liệu gốc của công dân',
      thoiGianHen: '14:30 ngày 17/09/2026',
      diaDiem: 'Phòng Tiếp công dân & Xử lý đơn',
      noiDungChiTiet: 'Tại buổi làm việc, công dân Nguyễn Văn A khẳng định nội dung đơn gửi là hoàn toàn chính xác, cam kết chịu trách nhiệm trước pháp luật.\nCông dân đã giao nộp bản sao chứng thực Hợp đồng góp vốn, phiếu thu tiền và biên bản làm việc với Chi nhánh Văn phòng Đăng ký đất đai.\nCán bộ thụ lý đã tiếp nhận, kiểm tra tính pháp lý ban đầu và lập biên nhận bàn giao tài liệu phục vụ xác minh.',
      trangThai: 'du_thao',
    },
  ]);

  // Văn bản đang được mở chỉnh sửa trực tiếp tại tab Hồ sơ & Văn bản
  const [editingDocInTab, setEditingDocInTab] = useState<any | null>(null);

  // Chuyển sang Tab Hồ sơ & Văn bản để chỉnh sửa trực tiếp văn bản
  const handleOpenDocInTab = (docData: any, allDocs?: VanBanXacMinhItem[]) => {
    setShowXacMinhModal(false);
    if (allDocs && allDocs.length > 0) {
      setVanBanXacMinhList(allDocs);
    }
    setEditingDocInTab(docData);
    setActiveTab('tai-lieu');
    showToast(`✓ Đã chuyển sang tab "Hồ sơ & Văn bản" để chỉnh sửa trực tiếp: ${docData.soHieu || docData.tenVanBan}`);
  };

  // Tự động mở modal nếu được yêu cầu từ props (nếu có)
  useEffect(() => {
    if (openXacMinhOnEnter) {
      setShowXacMinhModal(true);
      onXacMinhOpened?.();
    }
  }, [openXacMinhOnEnter, onXacMinhOpened]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const currentDon = donDetail || {
    id: "Đ-2025-0105",
    code: "Đ-2025-0105",
    title: "Thẩm tra thay đổi ngành nghề HKD cá thể",
    luotNhanId: "LN-2025-0105",
    nguoiNop: "Vũ Thị Thanh",
    ngayNhan: "16/09/2026 09:30",
    loaiDon: "Đơn khiếu nại đất đai",
  };

  const workflow = matchWorkflowByLoaiDon(currentDon.loaiDon || 'Đơn khiếu nại đất đai');

  // Xác định bước hiện tại của quy trình (từ currentDon hoặc mặc định)
  const initialStepNumber = currentDon.currentStep || (trangThaiXacMinh === 'da_xac_minh' ? 2 : 1);
  const [activeStepNumber, setActiveStepNumber] = useState<number>(initialStepNumber);

  useEffect(() => {
    if (currentDon.currentStep) {
      setActiveStepNumber(currentDon.currentStep);
      if (currentDon.currentStep >= 2) {
        setTrangThaiXacMinh('da_xac_minh');
      }
    }
  }, [currentDon.currentStep]);

  // Bước hiện tại trong danh sách bước của quy trình
  const currentStepObj =
    workflow.steps.find((s) => s.stepNumber === activeStepNumber) ||
    workflow.steps.find((s) => s.stepNumber === 2) ||
    workflow.steps[0];

  const nextStepAction = {
    stepNumber: currentStepObj.stepNumber,
    name: currentStepObj.name,
    title:
      activeStepNumber === 1
        ? 'Tiếp nhận & Vào sổ'
        : activeStepNumber === 2
          ? (workflow.id === 'to-giac'
            ? 'Phân công Điều tra viên'
            : workflow.id === 'to-cao'
              ? 'Kích hoạt bảo mật & Thụ lý'
              : workflow.id === 'kien-nghi'
                ? 'Chuyển đơn vị xử lý'
                : 'Ban hành Thông báo thụ lý')
          : `Thực hiện: ${currentStepObj.name}`,
    icon:
      activeStepNumber === 1
        ? 'assignment'
        : activeStepNumber === 2
          ? (workflow.id === 'to-giac' ? 'assignment_ind' : workflow.id === 'to-cao' ? 'lock' : 'mark_email_read')
          : activeStepNumber === 3
            ? 'policy'
            : activeStepNumber === 4
              ? 'find_in_page'
              : 'task_alt',
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-800 overflow-hidden font-body-md select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in max-w-lg">
          <span className="material-symbols-outlined text-blue-400 text-lg shrink-0">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 px-6 pt-3.5 shrink-0 shadow-2xs">
        {/* Breadcrumb row */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <button
              type="button"
              onClick={() => onNav("cong-viec")}
              className="flex items-center gap-1 text-[#004ac6] hover:text-[#003ea8] hover:underline font-semibold cursor-pointer mr-1"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Quay lại</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="hover:underline cursor-pointer" onClick={() => onNav("cong-viec")}>
              Bàn làm việc
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">
              Tiếp nhận &amp; Xử lý đơn
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800">{currentDon.code}</span>
          </div>
        </div>

        {/* Title Row & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3.5 gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[19px] font-bold text-slate-900 tracking-tight font-headline-md leading-tight">
                {currentDon.code}: {currentDon.title.startsWith(currentDon.code) ? currentDon.title.replace(`${currentDon.code}: `, '') : currentDon.title}
              </h1>

              {/* Status Badge: Đang xác minh thông tin VS Đã xác minh */}
              {trangThaiXacMinh === 'dang_xac_minh' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>Đang xác minh thông tin</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span>
                    Đã xác minh {huongXuLyDaChon ? `• ${HUONG_XU_LY_CONFIG[huongXuLyDaChon]?.label || huongXuLyDaChon}` : ''}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium mt-1.5 flex-wrap">
              <span>
                Lượt tiếp nhận số{' '}
                <span className="font-semibold text-slate-700">
                  {currentDon.luotNhanId || 'LN-45/2026-GOVEX'}
                </span>
              </span>
              <span>•</span>
              <span>
                Người đứng đơn:{' '}
                <strong className="text-slate-800 font-semibold">{currentDon.nguoiNop}</strong>
              </span>
              <span>•</span>
              <span>
                Nộp ngày:{' '}
                <span className="font-semibold text-slate-700">
                  {currentDon.ngayNhan || '15/09/2026 09:15'}
                </span>
              </span>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {trangThaiXacMinh === 'dang_xac_minh' ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowModalBoSung(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold shadow-2xs transition-colors cursor-pointer ${daGuiThongBaoBoSung
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  title="Tạo thông báo yêu cầu bổ sung hồ sơ"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {daGuiThongBaoBoSung ? 'check_circle' : 'note_add'}
                  </span>
                  <span>{daGuiThongBaoBoSung ? 'Đã tạo thông báo bổ sung' : 'Tạo thông báo bổ sung'}</span>
                </button>

                {/* NÚT CHÍNH: Xác minh và xác nhận hướng xử lý thông tin */}
                <button
                  type="button"
                  onClick={() => setShowXacMinhModal(true)}
                  className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 active:scale-95 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-blue-400/40"
                  title="Nhấn để xác minh thông tin theo 4 tiêu chí luật định và chọn hướng giải quyết"
                >
                  <span className="material-symbols-outlined text-[18px]">fact_check</span>
                  <span>Xác minh &amp; Xác nhận hướng xử lý</span>
                  <span className="material-symbols-outlined text-[15px] opacity-80">arrow_forward</span>
                </button>
              </>
            ) : (
              <>
                {/* Nút hành động tương ứng với hướng xử lý đã chọn */}
                {(!huongXuLyDaChon || huongXuLyDaChon === 'thu_ly') && (
                  <button
                    type="button"
                    onClick={() => setShowModalBuocTiepTheo(true)}
                    className={`inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer ${daHoanThanhBuoc ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#004ac6] hover:bg-[#003ea8]'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {daHoanThanhBuoc ? 'check_circle' : nextStepAction.icon}
                    </span>
                    <span>
                      {daHoanThanhBuoc ? `Đã hoàn tất ${nextStepAction.title.toLowerCase()}` : nextStepAction.title}
                    </span>
                    {!daHoanThanhBuoc && (
                      <span className="material-symbols-outlined text-[14px] opacity-80">arrow_forward</span>
                    )}
                  </button>
                )}

                {huongXuLyDaChon === 'khong_thu_ly' && (
                  <button
                    type="button"
                    onClick={() => setShowKhongThuLyModal(true)}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    <span>Lập Thông báo không thụ lý (Điều 29)</span>
                    <span className="material-symbols-outlined text-[14px] opacity-80">arrow_forward</span>
                  </button>
                )}

                {huongXuLyDaChon === 'tra_lai' && (
                  <button
                    type="button"
                    onClick={() => setShowTraLaiModal(true)}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">assignment_return</span>
                    <span>Lập Phiếu trả lại đơn &amp; Hướng dẫn</span>
                    <span className="material-symbols-outlined text-[14px] opacity-80">arrow_forward</span>
                  </button>
                )}

                {huongXuLyDaChon === 'yeu_cau_bo_sung' && (
                  <button
                    type="button"
                    onClick={() => setShowModalBoSung(true)}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">note_add</span>
                    <span>Tạo thông báo bổ sung tài liệu</span>
                    <span className="material-symbols-outlined text-[14px] opacity-80">arrow_forward</span>
                  </button>
                )}

                {huongXuLyDaChon === 'ban_giao' && (
                  <button
                    type="button"
                    onClick={() => setShowBanGiaoModal(true)}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">drive_file_move</span>
                    <span>Lập Phiếu chuyển cơ quan có thẩm quyền</span>
                    <span className="material-symbols-outlined text-[14px] opacity-80">arrow_forward</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>


        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-8 text-xs font-bold border-b border-slate-200 -mb-px">
          {/* Tab 1: Thông tin chung */}
          <button
            type="button"
            onClick={() => setActiveTab('thong-tin')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'thong-tin'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>Thông tin chung</span>
          </button>

          {/* Tab 2: Mối liên hệ */}
          <button
            type="button"
            onClick={() => setActiveTab('lien-he')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'lien-he'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">hub</span>
            <span>Mối liên hệ</span>
            <span className="px-1.5 py-0.2 rounded bg-blue-50 text-[#004ac6] font-semibold text-[10px] border border-blue-200">
              Sơ đồ
            </span>
          </button>

          {/* Tab 3: Đơn khác (Đơn & lượt nhận đã ghép) */}
          <button
            type="button"
            onClick={() => setActiveTab('don-khac')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'don-khac'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">folder_shared</span>
            <span>Đơn khác</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
              2 đã ghép
            </span>
          </button>

          {/* Tab 4: Hồ sơ & Văn bản */}
          <button
            type="button"
            onClick={() => setActiveTab('tai-lieu')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'tai-lieu'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">folder</span>
            <span>Hồ sơ &amp; Văn bản</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
              {docCount} văn bản
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE CONTENT                                                 */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
        <div className="w-full max-w-[1720px] mx-auto space-y-6">
          {activeTab === 'thong-tin' && (
            <TabThongTinChung
              currentDon={currentDon}
              onOpenLuotNhan={() => onNav('ban-phan-tich')}
              onOpenSoDo={() => setActiveTab('lien-he')}
            />
          )}
          {activeTab === 'lien-he' && <TabMoiLienHe currentDon={currentDon} />}
          {activeTab === 'don-khac' && <TabDonKhac currentDon={currentDon} />}
          {activeTab === 'tai-lieu' && (
            <TabTaiLieu
              currentDon={currentDon}
              onDocCountChange={setDocCount}
              initialEditingDoc={editingDocInTab}
              onClearInitialEditingDoc={() => setEditingDocInTab(null)}
              onReturnToXacMinh={() => setShowXacMinhModal(true)}
              sharedVanBanList={vanBanXacMinhList}
              onUpdateSharedVanBanList={setVanBanXacMinhList}
            />
          )}
        </div>
      </div>

      {/* Modal tạo Thông báo bổ sung thông tin, tài liệu khi chưa đủ thông tin */}
      <ThongBaoBoSungModal
        isOpen={showModalBoSung}
        onClose={() => setShowModalBoSung(false)}
        onSuccess={(soHieu, danhSachBoSung) => {
          showToast(`✓ Đã ban hành Thông báo bổ sung ${soHieu} (${danhSachBoSung.length} mục) gửi cho công dân ${currentDon.nguoiNop}!`);
          setDocCount((c) => c + 1);
          setDaGuiThongBaoBoSung(true);
        }}
        workflow={workflow}
        donCode={currentDon.code}
        donTitle={currentDon.title}
        nguoiNop={currentDon.nguoiNop}
        loaiDon={currentDon.loaiDon || 'Đơn khiếu nại đất đai'}
      />

      {/* Modal thực hiện bước tiếp theo theo quy trình khi có đủ thông tin */}
      <ThucHienBuocTiepTheoModal
        isOpen={showModalBuocTiepTheo}
        onClose={() => setShowModalBuocTiepTheo(false)}
        stepNumber={activeStepNumber}
        onSuccess={(stepName, docTitle) => {
          showToast(`✓ Đã hoàn tất bước "${stepName}" và ban hành "${docTitle}" thành công!`);
          setDocCount((c) => c + 1);
          setDaHoanThanhBuoc(true);
          if (activeStepNumber < workflow.steps.length) {
            setActiveStepNumber((prev) => prev + 1);
          }
        }}
        workflow={workflow}
        donCode={currentDon.code}
        donTitle={currentDon.title}
        nguoiNop={currentDon.nguoiNop}
        loaiDon={currentDon.loaiDon || 'Đơn khiếu nại đất đai'}
      />
      {/* Modal Xác minh & Đề xuất hướng giải quyết */}
      <XacMinhVaDeXuatModal
        isOpen={showXacMinhModal}
        onClose={() => setShowXacMinhModal(false)}
        onNav={onNav}
        onOpenDocInTab={handleOpenDocInTab}
        sharedVanBanList={vanBanXacMinhList}
        onUpdateSharedVanBanList={setVanBanXacMinhList}
        donInfo={{
          code: currentDon.code,
          luotNhanId: currentDon.luotNhanId,
          nguoiNop: currentDon.nguoiNop,
          loaiDon: currentDon.loaiDon,
          ngayNhan: currentDon.ngayNhan,
        }}
        onSelectHuongXuLy={(huong: HuongGiaiQuyetType | 'quy_trinh') => {
          setShowXacMinhModal(false);
          if (huong === 'quy_trinh') {
            onNav('quy-trinh-xu-ly');
            return;
          }
          // Chuyển trạng thái đơn sang "Đã xác minh" và lưu hướng đã chọn
          setTrangThaiXacMinh('da_xac_minh');
          setHuongXuLyDaChon(huong);

          if (huong === 'thu_ly') {
            showToast(`✓ Đã xác minh hoàn tất: Đơn chuyển trạng thái "ĐÃ XÁC MINH" • Hướng xử lý: Thụ lý giải quyết`);
            setTimeout(() => setShowModalBuocTiepTheo(true), 300);
          } else if (huong === 'yeu_cau_bo_sung') {
            showToast(`✓ Đã xác minh hoàn tất: Đơn chuyển trạng thái "ĐÃ XÁC MINH" • Hướng xử lý: Yêu cầu bổ sung tài liệu`);
            setTimeout(() => setShowModalBoSung(true), 300);
          } else if (huong === 'khong_thu_ly') {
            showToast(`✓ Đã xác minh hoàn tất: Đơn chuyển trạng thái "ĐÃ XÁC MINH" • Hướng xử lý: Không thụ lý giải quyết`);
            setTimeout(() => setShowKhongThuLyModal(true), 300);
          } else if (huong === 'tra_lai') {
            showToast(`✓ Đã xác minh hoàn tất: Đơn chuyển trạng thái "ĐÃ XÁC MINH" • Hướng xử lý: Trả lại đơn & Hướng dẫn`);
            setTimeout(() => setShowTraLaiModal(true), 300);
          } else if (huong === 'ban_giao') {
            showToast(`✓ Đã xác minh hoàn tất: Đơn chuyển trạng thái "ĐÃ XÁC MINH" • Hướng xử lý: Chuyển cơ quan có thẩm quyền`);
            setTimeout(() => setShowBanGiaoModal(true), 300);
          }
        }}
      />

      {/* Modal Không thụ lý giải quyết */}
      <KhongThuLyModal
        isOpen={showKhongThuLyModal}
        onClose={() => setShowKhongThuLyModal(false)}
        onSubmit={(data) => {
          setShowKhongThuLyModal(false);
          showToast(`✓ Đã lập Thông báo không thụ lý số ${data.soKyHieu} theo quy định.`);
          setDocCount((c) => c + 1);
        }}
        donInfo={{
          code: currentDon.code,
          luotNhanId: currentDon.luotNhanId,
          nguoiNop: currentDon.nguoiNop,
          loaiDon: currentDon.loaiDon,
          ngayNhan: currentDon.ngayNhan,
        }}
      />

      {/* Modal Trả lại đơn & Hướng dẫn công dân */}
      <TraLaiDonModal
        isOpen={showTraLaiModal}
        onClose={() => setShowTraLaiModal(false)}
        onSubmit={(data: TraLaiDonSubmitData) => {
          setShowTraLaiModal(false);
          showToast(`✓ Đã ban hành Phiếu hướng dẫn trả đơn (${data.cauHinhVanBan.soKyHieu}) cho công dân ${data.nguoiNhan}.`);
          setDocCount((c) => c + 1);
        }}
        donInfo={{
          code: currentDon.code,
          luotNhanId: currentDon.luotNhanId,
          nguoiNop: currentDon.nguoiNop,
          loaiDon: currentDon.loaiDon,
          ngayNhan: currentDon.ngayNhan,
        }}
      />

      {/* Modal Chuyển thẩm quyền / Bàn giao */}
      <BanGiaoDonModal
        isOpen={showBanGiaoModal}
        onClose={() => setShowBanGiaoModal(false)}
        onSubmit={(data: BanGiaoDonSubmitData) => {
          setShowBanGiaoModal(false);
          showToast(`✓ Đã lập văn bản chuyển thẩm quyền (${data.cauHinhVanBan.soKyHieu}) sang "${data.donViNhanName || 'đơn vị có thẩm quyền'}".`);
          setDocCount((c) => c + 1);
        }}
        donInfo={{
          code: currentDon.code,
          luotNhanId: currentDon.luotNhanId,
          nguoiNop: currentDon.nguoiNop,
          loaiDon: currentDon.loaiDon,
          ngayNhan: currentDon.ngayNhan,
        }}
      />
    </div>
  );
}