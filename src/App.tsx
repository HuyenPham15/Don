import { useState, useCallback, useMemo, useEffect } from "react";
import Placeholder from "./components/Placeholder";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import BanPhanTich from "./screens/BanPhanTich";
import CongViecCuaToi from "./screens/CongViecCuaToi";
import DonTiepNhan from "./screens/DonTiepNhan";
import NhanDonList from "./screens/NhanDonList";
import NhanDonThem from "./screens/NhanDonThem";
import ChiTietLuotNhan from "./screens/ChiTietLuotNhan";
import TroChuyenScreen from "./screens/TroChuyenScreen";
import AITiepNhanChatScreen from "./screens/AITiepNhanChatScreen";
import TiepNhanVaXuLyScreen from "./screens/TiepNhanVaXuLyScreen";
import TrinhKyScreen from "./screens/TrinhKyScreen";
import VanBanChoKyScreen from "./screens/VanBanChoKyScreen";
import QuanLyTrinhKyScreen from "./screens/quanLyTrinhKy/QuanLyTrinhKyScreen";
import { LN19, ALL_LUOT_NHAN } from "./constants";
import { LuotNhan, Screen, DonDetail } from "./types";
import { SigningDocument, CurrentUserAccount, DEMO_ACCOUNTS } from "./types/signing";
import { INITIAL_SIGNING_DOCUMENTS } from "./constants/signingData";
import QuyTrinhXuLyDon from "./screens/QuyTrinhXuLyDon";
import { ActiveWorkflowState } from "./types/workflow";
import { WORKFLOW_DEFINITIONS, matchWorkflowByLoaiDon } from "./constants/workflows";
import { INITIAL_TIEP_NHAN_ITEMS, TiepNhanDonItem } from "./constants/departments";
import { PhanCongSubmitData } from "./components/modals/PhanCongModal";
import ProcessWorkflowModule from "./screens/workflowAdmin/ProcessWorkflowModule";
import QuanTriNghiepVuScreen from "./screens/workflowAdmin/QuanTriNghiepVuScreen";
import LoginScreen from "./screens/LoginScreen";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [selected, setSelected] = useState<LuotNhan>(LN19);
  const [luotNhanList, setLuotNhanList] = useState<LuotNhan[]>(ALL_LUOT_NHAN);
  const [selectedDon, setSelectedDon] = useState<DonDetail | null>({
    id: "Đ-2025-0105",
    code: "Đ-2025-0105",
    title: "Tố cáo hành vi vi phạm trật tự xây dựng và quản lý đất đai",
    luotNhanId: "LN-2025-0105",
    nguoiNop: "Vũ Thị Thanh",
    ngayNhan: "16/09/2026 09:30",
    loaiDon: "Đơn tố cáo",
    type: "ĐƠN TIẾP NHẬN",
    statusBadge: "Đang xử lý",
    canBoTiepNhan: "Nguyễn Minh Anh",
    chucVuCanBo: "Chuyên viên Tiếp nhận",
    donViXuLy: "Phòng Tiếp công dân & Xử lý đơn",
    cccd: "001088012345",
    sdt: "0983 123 456",
    diaChi: "Số 15 đường Cầu Giấy, phường Quan Hoa, quận Cầu Giấy, Hà Nội",
    noiDung: "Tố cáo hành vi vi phạm quy định pháp luật trong quản lý đất đai và trật tự xây dựng",
  });
  const [acceptedDons, setAcceptedDons] = useState<DonDetail[]>([]);
  const [extraCard, setExtraCard] = useState<LuotNhan | null>(null);
  const [tiepNhanItems, setTiepNhanItems] = useState<TiepNhanDonItem[]>(INITIAL_TIEP_NHAN_ITEMS);
  // Tự động mở XacMinhModal khi vào màn don-tiep-nhan sau tiếp nhận
  const [openXacMinhOnDonTiepNhan, setOpenXacMinhOnDonTiepNhan] = useState<boolean>(false);

  // Danh sách văn bản Trình ký & Ký số (Dành cho Cán bộ và Lãnh đạo)
  const [signingDocuments, setSigningDocuments] = useState<SigningDocument[]>(() => {
    try {
      const saved = localStorage.getItem('app_signing_documents');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi khi đọc signingDocuments từ localStorage:', e);
    }
    return INITIAL_SIGNING_DOCUMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('app_signing_documents', JSON.stringify(signingDocuments));
    } catch (e) {
      console.error('Lỗi khi lưu signingDocuments vào localStorage:', e);
    }
  }, [signingDocuments]);

  const [selectedSigningDocId, setSelectedSigningDocId] = useState<string | undefined>();
  const [selectedQuanLyTrinhKyId, setSelectedQuanLyTrinhKyId] = useState<string | undefined>();

  // Tài khoản người dùng đang đăng nhập (Cán bộ thụ lý hoặc Lãnh đạo ký duyệt)
  const [currentAccount, setCurrentAccount] = useState<CurrentUserAccount>(DEMO_ACCOUNTS[0]);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const signingCounts = useMemo(() => {
    const choTrinh = signingDocuments.filter((d) => d.status === 'cho_trinh' || d.status === 'nhap').length;
    const daTrinh = signingDocuments.filter((d) => d.status === 'da_trinh').length;
    const yeuCauSua = signingDocuments.filter((d) => d.status === 'yeu_cau_chinh_sua').length;
    return { choTrinh, daTrinh, yeuCauSua };
  }, [signingDocuments]);

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
    const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const todayFormatted = new Date().toLocaleDateString('vi-VN');
    const record: LuotNhan =
      newRecord || {
        id: `LN-141/2026-CATPHN`,
        ngayNhan: todayFormatted,
        gioNhan: timeNow,
        nguoiNop: "Chưa rõ",
        hinhThuc: "Trực tiếp",
        noiDung: "Đơn tiếp nhận mới vào hệ thống (Chờ xử lý)",
        donVi: "Công an thành phố Hà Nội",
        aiJob: 0,
        status: 'cho_chuyen',
        ngayChuyenXuLy: 'Chưa chuyển xử lý',
        nguoiThaoTacGanNhat: `Lê Ngọc Mai – ${todayFormatted} ${timeNow}`,
        hasFile: false,
        sourceType: undefined,
      };
    // Lưu lượt nhận vào danh sách, không tạo Task ngay
    setLuotNhanList((prev) => [record, ...prev.filter((d) => d.id !== record.id)]);
    setExtraCard(null);
    setSelected(record);
    setScreen("chi-tiet-luot-nhan");
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
    const targetStepNumber = don.currentStep || 2;
    const targetStep =
      wfDef.steps.find((s) => s.stepNumber === targetStepNumber) ||
      wfDef.steps[1] ||
      wfDef.steps[0];

    setActiveWorkflow({
      donCode: don.code,
      donTitle: don.title,
      luotNhanId: don.luotNhanId || 'LN-2025-0819',
      nguoiNop: don.nguoiNop,
      loaiDonConfirmed: loaiDon,
      workflow: wfDef,
      activeStepId: targetStep.id,
      tasks: wfDef.defaultTasks,
      missingInfoList: wfDef.potentialMissingInfo,
      status: 'dang_xu_ly',
      startedAt: '16/09/2026 09:30',
      assignedOfficer: 'Nguyễn Minh Anh',
      historyLogs: [],
    });
  }, []);

  const handleAcceptFromBanPhanTich = useCallback((don: DonDetail, wfState?: ActiveWorkflowState) => {
    const donWithStatus: DonDetail = {
      ...don,
      statusBadge: don.statusBadge || 'Đang xác minh thông tin',
    };
    setAcceptedDons((prev) => [donWithStatus, ...prev.filter((d) => d.code !== donWithStatus.code)]);
    setSelectedDon(donWithStatus);
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
    setOpenXacMinhOnDonTiepNhan(false);
  }, []);

  const handleCreateSigningDocument = useCallback((doc: SigningDocument) => {
    setSigningDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
    setSelectedSigningDocId(doc.id);
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
        setSelectedDon(updatedTask);
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

  if (screen === "login") {
    return (
      <LoginScreen
        initialAccount={currentAccount}
        onLoginSuccess={(acc) => {
          setCurrentAccount(acc);
          setScreen("cong-viec");
        }}
        onBackToApp={() => setScreen("cong-viec")}
      />
    );
  }

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

          {/* Nút xem Màn hình Đăng nhập (UI/UX) */}
          {/* <button
            type="button"
            onClick={() => setScreen("login")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Xem thiết kế Màn hình Đăng nhập (UI/UX)"
          >
            <span className="material-symbols-outlined text-[17px]">lock_open</span>
            <span className="hidden sm:inline">Màn hình Đăng nhập</span>
          </button> */}

          {/* Profile & Account Switcher */}
          <div className="relative pl-2 border-l border-slate-200">
            <button
              type="button"
              onClick={() => setIsAccountDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer group"
              title="Nhấn để chuyển đổi tài khoản (Cán bộ thụ lý ⟷ Lãnh đạo ký duyệt)"
            >
              <div className={`w-8 h-8 rounded-full ${currentAccount.avatarBg} text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0 ring-2 ring-white`}>
                {currentAccount.shortName}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                    {currentAccount.name}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${currentAccount.role === 'lanh_dao'
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-blue-100 text-[#004ac6] border border-blue-200'
                    }`}>
                    {currentAccount.role === 'lanh_dao' ? 'LÃNH ĐẠO' : 'CÁN BỘ'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {currentAccount.roleLabel}
                </span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-600 transition-transform duration-200">
                unfold_more
              </span>
            </button>

            {/* Dropdown Menu chuyển tài khoản */}
            {isAccountDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsAccountDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-fade-in flex flex-col gap-1">
                  {/* <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-label-technical">
                      CHUYỂN ĐỔI TÀI KHOẢN NGƯỜI DÙNG
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Giao diện "Công việc của tôi" tự động đổi theo tài khoản đang chọn
                    </p>
                  </div> */}

                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = acc.id === currentAccount.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setCurrentAccount(acc);
                          setIsAccountDropdownOpen(false);
                          if (screen !== 'cong-viec') {
                            setScreen('cong-viec');
                          }
                        }}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${isSelected
                          ? 'bg-blue-50 border border-blue-200/80 shadow-2xs'
                          : 'hover:bg-slate-50 border border-transparent'
                          }`}
                      >
                        <div className={`w-9 h-9 rounded-full ${acc.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs mt-0.5`}>
                          {acc.shortName}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {acc.name}
                            </span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0">
                                check_circle
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-semibold text-blue-700 leading-tight mt-0.5">
                            {acc.chucVu}
                          </div>
                          <div className="text-[10.5px] text-slate-400 truncate mt-0.5">
                            {acc.phongBan}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {/* Tùy chọn Màn hình đăng nhập & Đăng xuất */}
                  <div className="pt-2 mt-1 border-t border-slate-100 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountDropdownOpen(false);
                        setScreen("login");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <span className="material-symbols-outlined text-[18px] text-blue-600">
                        lock_open
                      </span>
                      <span>Xem Màn hình Đăng nhập</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountDropdownOpen(false);
                        setScreen("login");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        logout
                      </span>
                      <span>Đăng xuất khỏi hệ thống</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY: SIDEBAR + MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar screen={screen} onNav={setScreen} currentAccount={currentAccount} signingCounts={signingCounts} />
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
                currentAccount={currentAccount}
                onSwitchAccount={setCurrentAccount}
                signingDocuments={signingDocuments}
                onUpdateSigningDocuments={setSigningDocuments}
                onSelectSigningDoc={setSelectedSigningDocId}
              />
            )}
            {screen === "nhan-don-list" && (
              <NhanDonList
                onNav={setScreen}
                onSelect={setSelected}
                onSelectDon={handleSelectDon}
                luotNhanList={luotNhanList}
              />
            )}
            {screen === "nhan-don-them" && <NhanDonThem onNav={setScreen} onSubmit={handleSubmit} />}
            {screen === "chi-tiet-luot-nhan" && (
              <ChiTietLuotNhan
                luotNhan={selected}
                onNav={setScreen}
                onUpdateLuotNhan={handleUpdateLuotNhan}
                onChuyenTiepNhan={handleChuyenTiepNhan}
                onSelectDon={handleSelectDon}
                isJustCreated={true}
              />
            )}
            {screen === "ban-phan-tich" && (
              <BanPhanTich
                luotNhan={selected}
                onNav={setScreen}
                onAcceptAndProcess={handleAcceptFromBanPhanTich}
                onChuyenTiepNhan={handleChuyenTiepNhan}
                onBanGiao={handleBanGiao}
                onTraLai={handleTraLai}
                onUpdateLuotNhan={handleUpdateLuotNhan}
                onCreateSigningDocument={handleCreateSigningDocument}
                signingDocuments={signingDocuments}
                onUpdateSigningDocuments={setSigningDocuments}
                currentAccount={currentAccount}
              />
            )}
            {screen === "don-tiep-nhan" && (
              <DonTiepNhan
                onNav={setScreen}
                donDetail={selectedDon}
                openXacMinhOnEnter={openXacMinhOnDonTiepNhan}
                onXacMinhOpened={() => setOpenXacMinhOnDonTiepNhan(false)}
                onCreateSigningDocument={handleCreateSigningDocument}
                signingDocuments={signingDocuments}
                onUpdateSigningDocuments={setSigningDocuments}
                onSelectSigningDoc={setSelectedSigningDocId}
                currentAccount={currentAccount}
              />
            )}
            {screen === "quy-trinh-xu-ly" && (
              <QuyTrinhXuLyDon
                onNav={setScreen}
                workflowState={activeWorkflow}
                onUpdateWorkflowState={setActiveWorkflow}
              />
            )}
            {screen === "trinh-ky" && (
              <TrinhKyScreen
                onNav={setScreen}
                documents={signingDocuments}
                onUpdateDocuments={setSigningDocuments}
                initialDocId={selectedSigningDocId}
                onBackToKanban={() => setScreen("cong-viec")}
                onSelectHoSo={(hoSoCode) => {
                  const matched = acceptedDons.find((d) => d.code === hoSoCode || d.id === hoSoCode);
                  if (matched) setSelectedDon(matched);
                }}
                onSwitchAccount={(role) => {
                  const target = DEMO_ACCOUNTS.find((a) => a.role === role);
                  if (target) {
                    setCurrentAccount(target);
                    setScreen("cong-viec");
                  }
                }}
              />
            )}
            {screen === "van-ban-cho-ky" && (
              <VanBanChoKyScreen
                onNav={setScreen}
                documents={signingDocuments}
                onUpdateDocuments={setSigningDocuments}
                initialDocId={selectedSigningDocId}
                currentAccount={currentAccount}
                onSelectHoSo={(hoSoCode) => {
                  const matched = acceptedDons.find((d) => d.code === hoSoCode || d.id === hoSoCode);
                  if (matched) setSelectedDon(matched);
                }}
                onBackToKanban={() => setScreen("cong-viec")}
                onSwitchAccount={(role) => {
                  const target = DEMO_ACCOUNTS.find((a) => a.role === role);
                  if (target) {
                    setCurrentAccount(target);
                    setScreen("cong-viec");
                  }
                }}
              />
            )}
            {screen === "quan-ly-trinh-ky" && (
              <QuanLyTrinhKyScreen
                onNav={setScreen}
                currentAccount={currentAccount}
                onSwitchAccount={(role) => {
                  const target = DEMO_ACCOUNTS.find((a) => a.role === role);
                  if (target) {
                    setCurrentAccount(target);
                  }
                }}
                onSelectHoSo={(hoSoCode) => {
                  const matched = acceptedDons.find((d) => d.code === hoSoCode || d.id === hoSoCode);
                  if (matched) setSelectedDon(matched);
                }}
                initialLuotTrinhId={selectedQuanLyTrinhKyId}
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
