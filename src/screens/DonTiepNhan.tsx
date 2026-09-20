import React, { useState } from 'react';
import { Screen, DonDetail } from "../types";
import TabThongTinChung from '../components/tabs/TabThongTinChung';
import TabMoiLienHe from '../components/tabs/TabMoiLienHe';
import TabDonKhac from '../components/tabs/TabDonKhac';
import TabTaiLieu from '../components/tabs/TabTaiLieu';
import { matchWorkflowByLoaiDon } from '../constants/workflows';
import ThongBaoBoSungModal from '../components/workflow/ThongBaoBoSungModal';
import ThucHienBuocTiepTheoModal from '../components/workflow/ThucHienBuocTiepTheoModal';

interface DonTiepNhanProps {
  onNav: (s: Screen) => void;
  donDetail?: DonDetail | null;
}

export default function DonTiepNhan({ onNav, donDetail }: DonTiepNhanProps) {
  const [activeTab, setActiveTab] = useState<'thong-tin' | 'lien-he' | 'don-khac' | 'tai-lieu'>('thong-tin');
  const [docCount, setDocCount] = useState<number>(6);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
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

  // Xác định bước tiếp theo theo quy trình
  const nextStep = workflow.steps.find((s) => s.stepNumber === 2) || workflow.steps[1] || {
    stepNumber: 2,
    name: 'Thụ lý giải quyết',
  };

  const nextStepAction = {
    stepNumber: nextStep.stepNumber,
    name: nextStep.name,
    title:
      workflow.id === 'to-giac'
        ? 'Phân công Điều tra viên'
        : workflow.id === 'to-cao'
          ? 'Kích hoạt bảo mật & Thụ lý'
          : workflow.id === 'kien-nghi'
            ? 'Chuyển đơn vị xử lý'
            : 'Ban hành Thông báo thụ lý',
    icon:
      workflow.id === 'to-giac'
        ? 'assignment_ind'
        : workflow.id === 'to-cao'
          ? 'lock'
          : workflow.id === 'kien-nghi'
            ? 'forward_to_inbox'
            : 'mark_email_read',
  };

  const [showModalBoSung, setShowModalBoSung] = useState(false);
  const [showModalBuocTiepTheo, setShowModalBuocTiepTheo] = useState(false);
  const [daHoanThanhBuoc, setDaHoanThanhBuoc] = useState(false);
  const [daGuiThongBaoBoSung, setDaGuiThongBaoBoSung] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-800 overflow-hidden font-body-md select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[19px] font-bold text-slate-900 tracking-tight font-headline-md leading-tight">
              {currentDon.code}: {currentDon.title.startsWith(currentDon.code) ? currentDon.title.replace(`${currentDon.code}: `, '') : currentDon.title}
            </h1>
            <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium mt-1">
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

          <div className="flex items-center gap-2 shrink-0">

            <button
              type="button"
              onClick={() => setShowModalBoSung(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold shadow-2xs transition-colors cursor-pointer ${daGuiThongBaoBoSung
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900'
                }`}
              title="Chưa đủ thông tin: Tạo thông báo yêu cầu bổ sung hồ sơ"
            >
              <span className="material-symbols-outlined text-[16px]">
                {daGuiThongBaoBoSung ? 'check_circle' : 'note_add'}
              </span>
              <span>{daGuiThongBaoBoSung ? 'Đã tạo thông báo bổ sung' : 'Tạo thông báo bổ sung'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowModalBuocTiepTheo(true)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer ${daHoanThanhBuoc
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[#004ac6] hover:bg-[#003ea8]'
                }`}
              title="Đủ thông tin: Chuyển sang bước tiếp theo theo quy trình"
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

          {/* Tab 3: Đơn khác */}
          <button
            type="button"
            onClick={() => setActiveTab('don-khac')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'don-khac'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">move_to_inbox</span>
            <span>Đơn khác</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
              2 đơn ghép
            </span>
          </button>

          {/* Tab 4: Hồ sơ & Tài liệu */}
          <button
            type="button"
            onClick={() => setActiveTab('tai-lieu')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'tai-lieu'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">folder</span>
            <span>Hồ sơ &amp; Tài liệu</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
              {docCount} file
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
            <TabTaiLieu currentDon={currentDon} onDocCountChange={setDocCount} />
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
        onSuccess={(stepName, docTitle) => {
          showToast(`✓ Đã hoàn tất bước "${stepName}" và ban hành "${docTitle}" thành công!`);
          setDocCount((c) => c + 1);
          setDaHoanThanhBuoc(true);
        }}
        workflow={workflow}
        donCode={currentDon.code}
        donTitle={currentDon.title}
        nguoiNop={currentDon.nguoiNop}
        loaiDon={currentDon.loaiDon || 'Đơn khiếu nại đất đai'}
      />
    </div>
  );
}