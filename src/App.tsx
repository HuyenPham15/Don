import { useState, useCallback } from "react";
import Placeholder from "./components/Placeholder";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import BanPhanTich from "./screens/BanPhanTich";
import CongViecCuaToi from "./screens/CongViecCuaToi";
import DonTiepNhan from "./screens/DonTiepNhan";
import NhanDonList from "./screens/NhanDonList";
import NhanDonThem from "./screens/NhanDonThem";
import TroChuyenScreen from "./screens/TroChuyenScreen";
import AITiepNhanChatScreen from "./screens/AITiepNhanChatScreen";
import TiepNhanVaXuLyScreen from "./screens/TiepNhanVaXuLyScreen";
import { LN19, ALL_LUOT_NHAN } from "./constants";
import { LuotNhan, Screen, DonDetail } from "./types";
import QuyTrinhXuLyDon from "./screens/QuyTrinhXuLyDon";
import { ActiveWorkflowState } from "./types/workflow";
import { WORKFLOW_DEFINITIONS, matchWorkflowByLoaiDon } from "./constants/workflows";
import { INITIAL_TIEP_NHAN_ITEMS, TiepNhanDonItem } from "./constants/departments";
import { PhanCongSubmitData } from "./components/modals/PhanCongModal";
import ProcessWorkflowModule from "./screens/workflowAdmin/ProcessWorkflowModule";
import QuanTriNghiepVuScreen from "./screens/workflowAdmin/QuanTriNghiepVuScreen";

export default function App() {
  const [screen, setScreen] = useState<Screen>("don-tiep-nhan");
  const [selected, setSelected] = useState<LuotNhan>(LN19);
  const [luotNhanList, setLuotNhanList] = useState<LuotNhan[]>(ALL_LUOT_NHAN);
  const [selectedDon, setSelectedDon] = useState<DonDetail | null>({
    id: "Đ-2025-0105",
    code: "Đ-2025-0105",
    title: "Thẩm tra thay đổi ngành nghề HKD cá thể",
    luotNhanId: "LN-2025-0105",
    nguoiNop: "Vũ Thị Thanh",
    ngayNhan: "16/09/2026 09:30",
    loaiDon: "Đơn khiếu nại đất đai",
    type: "ĐƠN TIẾP NHẬN",
    statusBadge: "Đang xử lý",
  });
  const [acceptedDons, setAcceptedDons] = useState<DonDetail[]>([]);
  const [extraCard, setExtraCard] = useState<LuotNhan | null>(null);
  const [tiepNhanItems, setTiepNhanItems] = useState<TiepNhanDonItem[]>(INITIAL_TIEP_NHAN_ITEMS);

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
    const record: LuotNhan =
      newRecord || {
        id: `LN-${Date.now().toString().slice(-4)}/2026-GOVEX_HC`,
        ngayNhan: "16/09/2026",
        nguoiNop: "Người vừa nộp",
        hinhThuc: "Trực tiếp",
        noiDung: "Nội dung tiếp nhận mới",
        donVi: "Phòng Tiếp công dân & Xử lý đơn",
        aiJob: 0,
        status: 'cho_chuyen',
        hasFile: true,
        sourceType: 'file',
      };
    // BR-01, BR-02: Lưu lượt nhận vào danh sách, không tạo Task ngay
    setLuotNhanList((prev) => [record, ...prev.filter((d) => d.id !== record.id)]);
    // Không đưa vào extraCard vì lượt nhận chưa chuyển tiếp (status === 'cho_chuyen')
    setExtraCard(null);
    setSelected(record);
    setScreen("ban-phan-tich");
  }, []);

  const handleUpdateLuotNhan = useCallback((updated: LuotNhan) => {
    setLuotNhanList((prev) =>
      prev.map((ln) => (ln.id === updated.id ? { ...ln, ...updated } : ln))
    );
    setSelected((prev) => (prev.id === updated.id ? { ...prev, ...updated } : prev));
  }, []);

  const handleSelectDon = useCallback((don: DonDetail) => {
    setSelectedDon(don);
    const loaiDon = don.loaiDon || 'Đơn tố giác về tội phạm';
    const wfDef = matchWorkflowByLoaiDon(loaiDon);
    setActiveWorkflow({
      donCode: don.code,
      donTitle: don.title,
      luotNhanId: don.luotNhanId || 'LN-2025-0819',
      nguoiNop: don.nguoiNop,
      loaiDonConfirmed: loaiDon,
      workflow: wfDef,
      activeStepId: wfDef.steps[1]?.id || wfDef.steps[0].id,
      tasks: wfDef.defaultTasks,
      missingInfoList: wfDef.potentialMissingInfo,
      status: 'dang_xu_ly',
      startedAt: '16/09/2026 09:30',
      assignedOfficer: 'Nguyễn Minh Anh',
      historyLogs: [],
    });
  }, []);

  const handleAcceptFromBanPhanTich = useCallback((don: DonDetail, wfState?: ActiveWorkflowState) => {
    setAcceptedDons((prev) => [don, ...prev.filter((d) => d.code !== don.code)]);
    setSelectedDon(don);
    if (wfState) {
      setActiveWorkflow(wfState);
    } else {
      const loaiDon = don.loaiDon || 'Đơn tố giác về tội phạm';
      const wfDef = matchWorkflowByLoaiDon(loaiDon);
      setActiveWorkflow({
        donCode: don.code,
        donTitle: don.title,
        luotNhanId: don.luotNhanId || 'LN-2025-0819',
        nguoiNop: don.nguoiNop,
        loaiDonConfirmed: loaiDon,
        workflow: wfDef,
        activeStepId: wfDef.steps[1]?.id || wfDef.steps[0].id,
        tasks: wfDef.defaultTasks,
        missingInfoList: wfDef.potentialMissingInfo,
        status: 'dang_xu_ly',
        startedAt: '16/09/2026 10:30',
        assignedOfficer: 'Nguyễn Minh Anh',
        historyLogs: [],
      });
    }
    setScreen("quy-trinh-xu-ly");
  }, []);

  // BR-06, BR-07: Xử lý khi cán bộ nhấn "Chuyển tiếp nhận và xử lý" từ Bàn phân tích
  const handleChuyenTiepNhan = useCallback((item: TiepNhanDonItem, isDirect: boolean, assignedOfficerName?: string) => {
    // BR-06: Cập nhật trạng thái lượt nhận thành 'da_chuyen'
    setLuotNhanList((prev) =>
      prev.map((ln) =>
        ln.id === item.luotNhanId
          ? {
            ...ln,
            status: 'da_chuyen',
            historyLogs: [
              ...(ln.historyLogs || []),
              {
                action: isDirect
                  ? `Chuyển tiếp nhận trực tiếp cho cán bộ ${assignedOfficerName || 'Nguyễn Minh Anh'}`
                  : `Chuyển tiếp nhận vào hàng chờ đơn vị ${item.donViTiepNhan}`,
                actor: 'Nguyễn Minh Anh (Cán bộ một cửa)',
                time: 'Hôm nay, vừa xong',
                note: item.ghiChuChuyen || 'Chuyển tiếp nhận xử lý hồ sơ',
              },
            ],
          }
          : ln
      )
    );
    setSelected((prev) =>
      prev.id === item.luotNhanId ? { ...prev, status: 'da_chuyen' } : prev
    );

    setTiepNhanItems((prev) => [item, ...prev.filter((d) => d.id !== item.id && d.code !== item.code)]);

    // BR-06 & BR-07 (Tính Idempotent):
    // Lượt nhận được chuyển đến cán bộ Nguyễn Minh Anh hoặc hàng chờ đơn vị tiếp nhận (Phòng Tiếp dân)
    if (
      (isDirect && (assignedOfficerName?.includes('Minh Anh') || !assignedOfficerName)) ||
      (!isDirect && (item.donViTiepNhanId === 'tiep-dan' || item.donViTiepNhan?.includes('Tiếp')))
    ) {
      setAcceptedDons((prev) => {
        const existingIndex = prev.findIndex((d) => d.luotNhanId === item.luotNhanId || d.code === item.code);
        const updatedTask: DonDetail = {
          id: item.code,
          code: item.code,
          title: item.noiDungTomTat,
          luotNhanId: item.luotNhanId,
          nguoiNop: item.nguoiNop,
          ngayNhan: item.ngayNhan,
          loaiDon: item.loaiDon,
          type: 'ĐƠN TIẾP NHẬN',
          statusBadge: isDirect ? 'Đang xử lý' : 'Chờ tiếp nhận',
        };
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = updatedTask;
          return updated;
        }
        return [updatedTask, ...prev];
      });
    }
  }, []);

  // BR-19, BR-20, BR-21, BR-22: Xử lý Bàn giao hồ sơ
  const handleBanGiao = useCallback((luotNhanId?: string, donViName?: string, canBoName?: string, lyDo?: string) => {
    if (!luotNhanId) return;
    setLuotNhanList((prev) =>
      prev.map((ln) =>
        ln.id === luotNhanId
          ? {
            ...ln,
            status: 'da_ban_giao',
            historyLogs: [
              ...(ln.historyLogs || []),
              {
                action: `Bàn giao hồ sơ cho ${donViName || 'đơn vị khác'}${canBoName ? ` (Cán bộ: ${canBoName})` : ''}`,
                actor: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
                time: 'Hôm nay, vừa xong',
                note: lyDo || 'Bàn giao theo thẩm quyền nghiệp vụ',
              },
            ],
          }
          : ln
      )
    );
    setSelected((prev) =>
      prev.id === luotNhanId ? { ...prev, status: 'da_ban_giao' } : prev
    );

    // Cập nhật trạng thái trong Tiếp nhận và Công việc của tôi
    setTiepNhanItems((prev) =>
      prev.map((it) =>
        it.luotNhanId === luotNhanId
          ? {
            ...it,
            trangThai: 'da_ban_giao',
            lyDoBanGiao: lyDo,
            donViTiepNhan: donViName || it.donViTiepNhan,
            canBoXuLy: canBoName || it.canBoXuLy,
          }
          : it
      )
    );

    setAcceptedDons((prev) =>
      prev.map((d) =>
        d.luotNhanId === luotNhanId
          ? { ...d, statusBadge: 'Đã bàn giao' }
          : d
      )
    );
  }, []);

  // BR-23, BR-24: Xử lý Trả lại hồ sơ cho công dân / người nộp đơn (kết thúc Task)
  const handleTraLai = useCallback((luotNhanId?: string, lyDo?: string) => {
    if (!luotNhanId) return;
    setLuotNhanList((prev) =>
      prev.map((ln) =>
        ln.id === luotNhanId
          ? {
            ...ln,
            status: 'da_tra_lai',
            historyLogs: [
              ...(ln.historyLogs || []),
              {
                action: 'Trả lại hồ sơ cho công dân / người nộp đơn',
                actor: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
                time: 'Hôm nay, vừa xong',
                note: lyDo || 'Trả lại đơn theo quy định',
              },
            ],
          }
          : ln
      )
    );
    setSelected((prev) =>
      prev.id === luotNhanId ? { ...prev, status: 'da_tra_lai' } : prev
    );

    // Đóng / kết thúc Task trong danh sách thụ lý
    setTiepNhanItems((prev) =>
      prev.map((it) =>
        it.luotNhanId === luotNhanId
          ? { ...it, trangThai: 'da_tra_lai', lyDoTraLai: lyDo }
          : it
      )
    );

    setAcceptedDons((prev) =>
      prev.map((d) =>
        d.luotNhanId === luotNhanId
          ? { ...d, statusBadge: 'Đã trả lại' }
          : d
      )
    );
  }, []);

  // Xử lý sau khi Trưởng phòng hoặc người có quyền phân công cán bộ (BR-03, BR-04, BR-07)
  const handlePhanCongDone = useCallback((data: PhanCongSubmitData) => {
    setTiepNhanItems((prev) =>
      prev.map((it) => {
        if (data.itemIds.includes(it.id)) {
          return {
            ...it,
            trangThai: 'dang_xu_ly',
            canBoXuLy: data.canBo.name,
            canBoXuLyId: data.canBo.id,
            chucVuCanBo: data.canBo.role,
            ngayPhanCong: '16/09/2026',
            nguoiPhanCong: 'Trần Trọng Giáp (Trưởng phòng)',
            ghiChuPhanCong: data.ghiChu,
          };
        }
        return it;
      })
    );

    // BR-04 & BR-07: Nếu cán bộ được giao là user hiện tại (Nguyễn Minh Anh) hoặc tự phân công cho mình
    if (data.canBo.name.includes('Minh Anh') || data.canBo.isCurrentUser) {
      setTiepNhanItems((currItems) => {
        const assignedItems = currItems.filter((it) => data.itemIds.includes(it.id));
        const newDons: DonDetail[] = assignedItems.map((item) => ({
          id: item.code,
          code: item.code,
          title: item.noiDungTomTat,
          luotNhanId: item.luotNhanId,
          nguoiNop: item.nguoiNop,
          ngayNhan: item.ngayNhan,
          loaiDon: item.loaiDon,
          type: 'ĐƠN TIẾP NHẬN',
          statusBadge: 'Đang xử lý',
        }));
        setAcceptedDons((prev) => [
          ...newDons,
          ...prev.filter((d) => !data.itemIds.some((id) => id.includes(d.code))),
        ]);
        return currItems;
      });
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium text-[12.5px] transition-all cursor-pointer ${screen === "thu-vien"
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium text-[12.5px] transition-all cursor-pointer ${screen === "cong-viec" || screen === "don-tiep-nhan"
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
          <ErrorBoundary fallbackScreen={() => setScreen("don-tiep-nhan")}>
            {(screen === "cong-viec" || screen === "tiep-nhan-xu-ly") && (
              <CongViecCuaToi
                onSelect={setSelected}
                onNav={setScreen}
                extraCard={extraCard}
                onSelectDon={handleSelectDon}
                acceptedDons={acceptedDons}
                luotNhanList={luotNhanList}
                tiepNhanItems={tiepNhanItems}
                onBanGiaoDone={handleBanGiao}
              />
            )}
            {screen === "nhan-don-list" && (
              <NhanDonList
                onNav={setScreen}
                onSelect={setSelected}
                luotNhanList={luotNhanList}
              />
            )}
            {screen === "nhan-don-them" && <NhanDonThem onNav={setScreen} onSubmit={handleSubmit} />}
            {screen === "ban-phan-tich" && (
              <BanPhanTich
                luotNhan={selected}
                onNav={setScreen}
                onAcceptAndProcess={handleAcceptFromBanPhanTich}
                onChuyenTiepNhan={handleChuyenTiepNhan}
                onBanGiao={handleBanGiao}
                onTraLai={handleTraLai}
                onUpdateLuotNhan={handleUpdateLuotNhan}
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
            {screen === "quan-tri-quy-trinh" && (
              <QuanTriNghiepVuScreen onNav={setScreen} initialTab="quy-trinh" />
            )}
            {screen === "quan-tri-loai-don" && (
              <QuanTriNghiepVuScreen onNav={setScreen} initialTab="loai-don" />
            )}
            {screen === "quan-tri-lich-lam-viec" && (
              <QuanTriNghiepVuScreen onNav={setScreen} initialTab="lich-lam-viec" />
            )}
            {screen === "quan-tri-bieu-mau" && (
              <QuanTriNghiepVuScreen onNav={setScreen} initialTab="bieu-mau" />
            )}
            {screen === "thu-vien" && <TroChuyenScreen onNav={setScreen} />}
            {screen === "ai-tiep-nhan-chat" && (
              <AITiepNhanChatScreen
                onNav={setScreen}
                onReceptionCreated={(newLn, newDon) => {
                  setLuotNhanList((prev) => [newLn, ...prev.filter((l) => l.id !== newLn.id)]);
                  setAcceptedDons((prev) => [newDon, ...prev.filter((d) => d.id !== newDon.id)]);
                  setSelected(newLn);
                  setSelectedDon(newDon);
                }}
                onSaveDraftToWorkItems={(draftLn, draftDon) => {
                  setLuotNhanList((prev) => [draftLn, ...prev.filter((l) => l.id !== draftLn.id)]);
                  setAcceptedDons((prev) => [draftDon, ...prev.filter((d) => d.id !== draftDon.id)]);
                }}
              />
            )}
            {screen === "bao-cao" && <Placeholder title="Báo cáo thông minh" />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
