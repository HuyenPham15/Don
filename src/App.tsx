import { useState, useCallback } from "react";
import Placeholder from "./components/Placeholder";
import Sidebar from "./components/Sidebar";
import BanPhanTich from "./screens/BanPhanTich";
import CongViecCuaToi from "./screens/CongViecCuaToi";
import DonTiepNhan from "./screens/DonTiepNhan";
import NhanDonList from "./screens/NhanDonList";
import NhanDonThem from "./screens/NhanDonThem";
import { LN19 } from "./constants";
import { LuotNhan, Screen, DonDetail } from "./types";
import QuyTrinhXuLyDon from "./screens/QuyTrinhXuLyDon";
import { ActiveWorkflowState } from "./types/workflow";
import { WORKFLOW_DEFINITIONS } from "./constants/workflows";

export default function App() {
  const [screen, setScreen] = useState<Screen>("cong-viec");
  const [selected, setSelected] = useState<LuotNhan>(LN19);
  const [selectedDon, setSelectedDon] = useState<DonDetail | null>(null);
  const [acceptedDons, setAcceptedDons] = useState<DonDetail[]>([]);
  const [extraCard, setExtraCard] = useState<LuotNhan | null>(null);

  // Trạng thái Quy trình xử lý đơn đang chạy
  const [activeWorkflow, setActiveWorkflow] = useState<ActiveWorkflowState>(() => {
    const defaultWf = WORKFLOW_DEFINITIONS['to-giac'];
    return {
      donCode: 'Đ-2026-00125',
      donTitle: 'Tố giác vi phạm lừa đảo chiếm đoạt tài sản (Dự án Khu đô thị Y)',
      luotNhanId: 'LN-2025-0819',
      nguoiNop: 'Nguyễn Văn A',
      loaiDonConfirmed: 'Đơn tố giác về tội phạm',
      workflow: defaultWf,
      activeStepId: 'step-2',
      tasks: defaultWf.defaultTasks,
      missingInfoList: defaultWf.potentialMissingInfo,
      status: 'dang_xu_ly',
      startedAt: '16/09/2026 10:30',
      assignedOfficer: 'Nguyễn Minh Anh',
      historyLogs: [],
    };
  });

  const handleSubmit = useCallback((newRecord?: LuotNhan) => {
    setExtraCard(
      newRecord || {
        id: "LN-20/2026-GOVEX_HC",
        ngayNhan: "16/09/2026",
        nguoiNop: "Người vừa nộp",
        hinhThuc: "Trực tiếp",
        noiDung: "Đơn vừa được tiếp nhận (Chờ tiếp nhận)",
        donVi: "Phòng Hành chính - Tổng hợp",
        aiJob: 0,
      }
    );
    setScreen("cong-viec");
  }, []);

  const handleAcceptFromBanPhanTich = useCallback((don: DonDetail, wfState?: ActiveWorkflowState) => {
    setAcceptedDons((prev) => [don, ...prev.filter((d) => d.code !== don.code)]);
    setSelectedDon(don);
    if (wfState) {
      setActiveWorkflow(wfState);
      setScreen("quy-trinh-xu-ly");
    }
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f4f7fb] text-[#0b1c30] font-body-md antialiased selection:bg-[#004ac6] selection:text-white">
      {/* 1. ADMINISTRATIVE HEADER */}
      <header className="h-16 shrink-0 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between z-30 shadow-2xs">
          {/* Brand & Authority Level */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#004ac6] text-white font-extrabold text-sm flex items-center justify-center shadow-xs tracking-tight shrink-0">
              GV
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-[14px] tracking-tight font-headline-md uppercase">
                  GOVEX TECH
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono text-[10.5px] border border-slate-200 font-semibold">
                  v2.6.4
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-label-technical">
                HỆ THỐNG TIẾP NHẬN &amp; QUẢN LÝ ĐƠN THƯ
              </span>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex w-96 relative">
            <span className="material-symbols-outlined absolute left-3 top-2 text-[17px] text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm đơn, mã hồ sơ, người liên quan... (Ctrl + K)"
              className="w-full pl-9 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
            />
            <span className="absolute right-2.5 top-2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              ⌘K
            </span>
          </div>

          {/* Operational & Officer Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 bg-slate-100 border border-slate-200/80 rounded-xl shadow-2xs">
              <button
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium text-[12.5px] transition-all cursor-pointer ${
                  screen === "thu-vien"
                    ? "bg-white text-blue-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                onClick={() => setScreen("thu-vien")}
                type="button"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-500">chat</span>
                <span>Trò chuyện</span>
              </button>
              <button
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium text-[12.5px] transition-all cursor-pointer ${
                  screen === "cong-viec" || screen === "don-tiep-nhan"
                    ? "bg-white text-blue-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                onClick={() => setScreen("cong-viec")}
                type="button"
              >
                <span className="material-symbols-outlined text-[17px] text-blue-700">task_alt</span>
                <span>Công việc</span>
              </button>
            </div>

            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="Lịch công tác"
            >
              <span className="material-symbols-outlined text-[19px]">calendar_today</span>
            </button>

            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative cursor-pointer"
              title="Thông báo"
            >
              <span className="material-symbols-outlined text-[19px]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#004ac6] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                MA
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">Nguyễn Minh Anh</span>
                <span className="text-[10px] text-slate-400 leading-tight">Cán bộ thụ lý hồ sơ</span>
              </div>
            </div>
          </div>
        </header>

      {/* 2. BODY: SIDEBAR + MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar screen={screen} onNav={setScreen} />
        <main className="flex-1 overflow-y-auto flex flex-col bg-[#f4f7fb]">
          {screen === "cong-viec" && (
            <CongViecCuaToi
              onSelect={setSelected}
              onNav={setScreen}
              extraCard={extraCard}
              onSelectDon={setSelectedDon}
              acceptedDons={acceptedDons}
            />
          )}
          {screen === "nhan-don-list" && <NhanDonList onNav={setScreen} onSelect={setSelected} />}
          {screen === "nhan-don-them" && <NhanDonThem onNav={setScreen} onSubmit={handleSubmit} />}
          {screen === "ban-phan-tich" && (
            <BanPhanTich
              luotNhan={selected}
              onNav={setScreen}
              onAcceptAndProcess={handleAcceptFromBanPhanTich}
            />
          )}
          {screen === "don-tiep-nhan" && (
            <DonTiepNhan onNav={setScreen} donDetail={selectedDon} />
          )}
          {screen === "quy-trinh-xu-ly" && (
            <QuyTrinhXuLyDon
              onNav={setScreen}
              workflowState={activeWorkflow}
              onUpdateWorkflowState={setActiveWorkflow}
            />
          )}
          {screen === "thu-vien" && <Placeholder title="Thư viện pháp luật" />}
          {screen === "bao-cao" && <Placeholder title="Báo cáo thông minh" />}
        </main>
      </div>
    </div>
  );
}
