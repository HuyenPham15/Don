import React, { useMemo, useRef, useState, useEffect } from "react";
import './trinhKyFigma.css';
import { CurrentUserAccount, DEMO_ACCOUNTS } from "../../types/signing";
import { Screen } from "../../types";
import ChinhSuaLuotTrinhModal from "../../components/modals/ChinhSuaLuotTrinhModal";

const asset = (name: string) => `/assets/${name}.svg`;

type DocumentStatus = "Đang soạn" | "Chưa trình" | "Đã trình" | "Đang xử lý" | "Đã có hiệu lực" | "Chờ xử lý" | "Đã xem"

const managementStatusOptions: DocumentStatus[] = [
  "Đang soạn",
  "Chưa trình",
  "Đã trình",
  "Đang xử lý",
  "Đã có hiệu lực",
]

function normalizeManagementStatus(status: unknown): DocumentStatus {
  switch (status) {
    case "Đang soạn":
      return "Đang soạn"
    case "Chưa trình":
      return "Chưa trình"
    case "Đã trình":
    case "Chờ xử lý":
      return "Đã trình"
    case "Đang xử lý":
    case "Đã ký một phần":
      return "Đang xử lý"
    case "Đã có hiệu lực":
    case "Đã duyệt":
    case "Đã ký hoàn tất":
    case "Hoàn thành":
    case "Đã xem":
      return "Đã có hiệu lực"
    default:
      return "Đang soạn"
  }
}

type DocumentRow = {
  title: string
  code: string
  request: "Ký" | "Duyệt" | "Xem"
  date: string
  flow: string
  status: DocumentStatus
  progress: string
  progressValue: number
  handler: string
  role?: string
  submitter: string
  department: string
  folder?: string
}

function isDocumentRow(value: unknown): value is DocumentRow {
  return (
    typeof value === "object" &&
    value !== null &&
    "title" in value &&
    "flow" in value &&
    "status" in value
  )
}

const documents: DocumentRow[] = [
  {
    title: "Quyết định về công tác cán bộ",
    code: "125/QĐ-UBND",
    request: "Ký",
    date: "01/10/2026 09:15",
    flow: "LT-125/2026",
    status: "Đang xử lý",
    progress: "1/3 người",
    progressValue: 33,
    handler: "Nguyễn Văn A",
    role: "Giám đốc",
    submitter: "Trần Thị B",
    department: "Chuyên viên",
  },
  {
    title: "Tờ trình phê duyệt chủ trương đầu tư dự án số 4",
    code: "45/TTr-SKHĐT",
    request: "Duyệt",
    date: "01/10/2026 08:00",
    flow: "LT-120/2026",
    status: "Đã có hiệu lực",
    progress: "3/3 người",
    progressValue: 100,
    handler: "—",
    submitter: "Lê Hồng Phong",
    department: "Phó phòng",
  },
  {
    title: "Báo cáo đánh giá tác động môi trường quý III",
    code: "88/BC-STNMT",
    request: "Xem",
    date: "02/10/2026 09:30",
    flow: "LT-133/2026",
    status: "Đã trình",
    progress: "0/3 người",
    progressValue: 0,
    handler: "Phạm Minh Trí",
    role: "Trưởng ban",
    submitter: "Đỗ Mỹ Linh",
    department: "Chuyên viên",
  },
  {
    title: "Hợp đồng cung cấp dịch vụ CNTT chuyển đổi số",
    code: "66/HĐ-GOVEX",
    request: "Ký",
    date: "30/09/2026 09:00",
    flow: "LT-115/2026",
    status: "Đang xử lý",
    progress: "2/3 người",
    progressValue: 66,
    handler: "Vũ Quốc Hùng",
    role: "Chánh văn phòng",
    submitter: "Nguyễn Văn Thiện",
    department: "CV Pháp chế",
  },
  {
    title: "Công văn hướng dẫn triển khai dịch vụ công trực tuyến",
    code: "219/CV-UBND",
    request: "Ký",
    date: "28/09/2026 14:00",
    flow: "LT-108/2026",
    status: "Đã có hiệu lực",
    progress: "3/3 người",
    progressValue: 100,
    handler: "—",
    submitter: "Hoàng Thanh Mai",
    department: "Văn phòng",
  },
  {
    title: "Kế hoạch kiểm tra an toàn thông tin cơ quan năm 2026",
    code: "11/KH-STTTT",
    request: "Duyệt",
    date: "Chưa trình",
    flow: "—",
    status: "Chưa trình",
    progress: "Chưa bắt đầu",
    progressValue: 0,
    handler: "—",
    submitter: "Đặng Thu Hà",
    department: "Chuyên viên CNTT",
  },
  {
    title: "Quy chế tiếp công dân và giải quyết khiếu nại tố cáo",
    code: "69/QC-UBND",
    request: "Ký",
    date: "26/09/2026 08:30",
    flow: "LT-98/2026",
    status: "Đã có hiệu lực",
    progress: "3/3 người",
    progressValue: 100,
    handler: "—",
    submitter: "Nguyễn Hoài Phương",
    department: "Chuyên viên",
  },
  {
    title: "Biên bản nghiệm thu giai đoạn 1 Cổng thông tin",
    code: "33/BB-0001",
    request: "Ký",
    date: "02/10/2026 08:00",
    flow: "LT-128/2026",
    status: "Đang xử lý",
    progress: "1/3 người",
    progressValue: 33,
    handler: "Nguyễn Thị Lan",
    role: "Kế toán trưởng",
    submitter: "Bùi Văn Chung",
    department: "Cán bộ QL",
  },
  {
    title: "Thông báo phân công nhiệm vụ công tác tháng 10",
    code: "102/TB-VP",
    request: "Xem",
    date: "02/10/2026 08:15",
    flow: "LT-126/2026",
    status: "Đã có hiệu lực",
    progress: "3/3 người",
    progressValue: 100,
    handler: "—",
    submitter: "Võ Thị Ánh",
    department: "Văn thư",
  },
  {
    title: "Dự thảo Kế hoạch tổ chức hội nghị chuyển đổi số",
    code: "DT-14/KH-VP",
    request: "Duyệt",
    date: "Chưa trình",
    flow: "—",
    status: "Chưa trình",
    progress: "Chưa bắt đầu",
    progressValue: 0,
    handler: "—",
    submitter: "Nguyễn Minh Anh",
    department: "Văn phòng",
  },
  {
    title: "Dự thảo Quyết định thành lập tổ công tác liên ngành",
    code: "DT-09/QĐ-UBND",
    request: "Ký",
    date: "Chưa trình",
    flow: "—",
    status: "Chưa trình",
    progress: "Chưa bắt đầu",
    progressValue: 0,
    handler: "—",
    submitter: "Trần Thị Mai",
    department: "Phòng Nội vụ",
  },
  {
    title: "Dự thảo Thông báo lịch tiếp công dân tháng 11",
    code: "DT-27/TB-VP",
    request: "Xem",
    date: "Chưa trình",
    flow: "—",
    status: "Chưa trình",
    progress: "Chưa bắt đầu",
    progressValue: 0,
    handler: "—",
    submitter: "Võ Thị Ánh",
    department: "Văn thư",
  },
  {
    title: "Dự thảo Báo cáo tổng kết công tác cải cách hành chính",
    code: "DS-31/BC-VP",
    request: "Duyệt",
    date: "Chưa trình",
    flow: "—",
    status: "Đang soạn",
    progress: "Chưa bắt đầu",
    progressValue: 0,
    handler: "—",
    submitter: "Nguyễn Minh Anh",
    department: "Văn phòng",
  },
  {
    title: "Dự thảo Công văn hướng dẫn rà soát hồ sơ tồn đọng",
    code: "DS-18/CV-UBND",
    request: "Xem",
    date: "Chưa trình",
    flow: "—",
    status: "Đang soạn",
    progress: "Chưa bắt đầu",
    progressValue: 0,
    handler: "—",
    submitter: "Lê Hồng Phong",
    department: "Phòng Hành chính",
  },
  {
    title: "Dự thảo Quyết định ban hành quy chế phối hợp liên ngành",
    code: "DS-07/QĐ-UBND",
    request: "Ký",
    date: "Chưa trình",
    flow: "—",
    status: "Đang soạn",
    progress: "Chưa bắt đầu",
    progressValue: 0,
    handler: "—",
    submitter: "Trần Thị B",
    department: "Phòng Pháp chế",
  },
]

const navItems = [
  ["3789e", "Công việc của tôi"],
  ["be020", "Nhận đơn"],
  ["5359f", "Vụ việc"],
  ["a8529", "Quản trị nghiệp vụ"],
]

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  return (
    <img className="icon" src={asset(name)} width={size} height={size} alt="" />
  )
}

function Button({
  children,
  variant = "secondary",
  onClick,
  className = "",
  ariaLabel,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "ghost"
  onClick?: () => void
  className?: string
  ariaLabel?: string
}) {
  return (
    <button
      className={`button button--${variant} ${className}`}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}

function Sidebar({
  active,
  onWork,
}: {
  active: "work" | "documents"
  onWork: () => void
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand__mark">
          <Icon name="59cf3" size={20} />
        </span>
        <strong>HỆ THỐNG VĂN BẢN</strong>
        <button
          className="icon-button brand__collapse"
          type="button"
          aria-label="Thu gọn"
        >
          <Icon name="d8e72" size={18} />
        </button>
      </div>

      <nav className="nav" aria-label="Điều hướng chính">
        {navItems.map(([icon, label], index) => (
          <button
            className={`nav__item ${label === "Công việc của tôi" && active === "work"
              ? "is-active"
              : ""
              }`}
            type="button"
            key={label}
            onClick={label === "Công việc của tôi" ? onWork : undefined}
          >
            <Icon name={icon} />
            <span>{label}</span>
            {index === 1 && <span className="count">13</span>}
            {label === "Quản trị nghiệp vụ" && (
              <span className="chevron">›</span>
            )}
          </button>
        ))}
        <Button variant="secondary" className="new-chat">
          <span>＋</span> Hội thoại mới
        </Button>
      </nav>

      <div className="activity">
        <div className="activity__heading">
          <span>HÔM NAY (02/10)</span>
          <span>4 TÁC VỤ</span>
        </div>
        {["Thông báo đến trong tháng", "Tạo cho tôi một lượt nhận..."].map(
          (item) => (
            <div className="activity__item" key={item}>
              <span className="activity__bubble" />
              <div>
                <p>{item}</p>
                <small>02/10/2026 11:32</small>
              </div>
            </div>
          ),
        )}
        <div className="activity__heading activity__heading--week">
          <span>TUẦN NÀY</span>
          <span>5 TÁC VỤ</span>
        </div>
        <div className="activity__item">
          <span className="activity__bubble" />
          <div>
            <p>Đã ký 1 lượt nhận bằng...</p>
            <small>30/09/2026 15:44</small>
          </div>
        </div>
      </div>

      <div className="sidebar__footer">
        <Button variant="primary" className="assistant">
          <Icon name="a8605" /> Trợ lý ảo
        </Button>
        <div className="profile">
          <span className="avatar">NA</span>
          <div>
            <strong>Nguyễn Minh Anh</strong>
            <small>Công ty Cổ phần Công nghệ G...</small>
          </div>
        </div>
      </div>
    </aside>
  )
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  const descriptions: Partial<Record<DocumentStatus, string>> = {
    "Đang soạn":
      "Văn bản đã được tạo nhưng chưa mang đi trình. Có thể tiếp tục chỉnh sửa nội dung.",
    "Chưa trình":
      "Văn bản đã được tạo và đủ điều kiện mang đi trình ký nhưng chưa được đưa vào lượt trình.",
    "Đã trình": "Văn bản đã được đưa vào lượt trình và bắt đầu luồng xử lý.",
    "Đang xử lý":
      "Văn bản đang ở một hoặc nhiều bước Ký / Duyệt / Xem trong lượt trình.",
    "Đã có hiệu lực": "Toàn bộ yêu cầu bắt buộc của văn bản đã hoàn thành.",
  }
  const className = status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[Đđ]/g, "d")
    .replace(/\s/g, "-")
    .toLowerCase()
  return (
    <span
      className={`status status--${className}`}
      title={descriptions[status]}
    >
      {status}
    </span>
  )
}

function getDocumentProgress(document: DocumentRow) {
  if (document.status === "Đang soạn" || document.status === "Chưa trình") {
    return { label: "Chưa bắt đầu", value: 0 }
  }

  if (document.status === "Đã có hiệu lực") {
    return { label: "3/3 người", value: 100 }
  }

  if (document.status === "Đã trình") {
    return { label: "0/3 người", value: 0 }
  }

  const processedPeople = document.progressValue >= 60 ? 2 : 1
  return {
    label: `${processedPeople}/3 người`,
    value: (processedPeople / 3) * 100,
  }
}

function SelectBox({ children }: { children: React.ReactNode }) {
  return (
    <button className="select-box" type="button">
      <span>{children}</span>
      <span className="select-box__arrow">⌄</span>
    </button>
  )
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  options: string[]
}) {
  return (
    <label className="filter-select">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{label}: Tất cả</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {label}: {option}
          </option>
        ))}
      </select>
      <span className="filter-select__arrow">⌄</span>
    </label>
  )
}

type WorkRole = "officer" | "leader" | "clerk"

type WorkCard = {
  id: string
  type: string
  title: string
  description: string
  submitter: string
  date: string
  files?: number
  deadline?: string
  progress?: string
  requirement?: "Xem" | "Duyệt" | "Ký"
  relatedDoc?: string
  // For clerk
  sender?: string
  officer?: string
  unit?: string
  method?: string
}

type WorkColumn = {
  id: string
  title: string
  count: number
  tone: "red" | "blue" | "amber" | "green"
  action: string
  cards: WorkCard[]
}

const officerWorkColumns: WorkColumn[] = [
  {
    id: "intake",
    title: "LƯỢT TIẾP NHẬN CẦN XỬ LÝ",
    count: 4,
    tone: "red",
    action: "Xử lý",
    cards: [
      {
        id: "LN-21/2026",
        type: "Lượt nhận",
        title: "LN-21/2026-GOVEX",
        description: "Trực tiếp · Đã phân tích AI",
        submitter: "Nguyễn Văn An",
        date: "28/09/2026",
        progress: "Đã tiếp nhận",
      },
      {
        id: "LN-22/2026",
        type: "Lượt nhận",
        title: "LN-22/2026-GOVEX",
        description: "Dịch vụ công Bộ Công an · Chưa phân tích AI",
        submitter: "Trần Thị Mai",
        date: "29/09/2026",
        progress: "Đã tiếp nhận",
      },
    ],
  },
  {
    id: "processing",
    title: "ĐANG XỬ LÝ",
    count: 15,
    tone: "amber",
    action: "Xem chi tiết đơn",
    cards: [
      {
        id: "TC-020/2026",
        type: "Đơn tố cáo",
        title: "Tố cáo cán bộ vi phạm quy định quản lý đất đai",
        description: "UBND phường X (Ông Trần Đình T)",
        submitter: "Lê Hoàng Nam",
        date: "28/09/2026",
        deadline: "Còn 1 ngày",
        progress: "Đang kiểm tra & xác định hướng xử lý",
      },
      {
        id: "KN-018/2026",
        type: "Đơn khiếu nại",
        title: "Khiếu nại quyết định hành chính về cấp phép xây dựng",
        description: "Chủ tịch UBND quận Ba Đình",
        submitter: "Phạm Thị Lan",
        date: "24/09/2026",
        deadline: "Quá hạn 1 ngày",
        progress: "Đang lập thông báo không thụ lý",
      },
      {
        id: "LN-23/2026",
        type: "Lượt nhận",
        title: "Hồ sơ phản ánh qua cổng dịch vụ công",
        description: "Tiếp nhận trực tuyến · Đã phân tích AI",
        submitter: "Nguyễn Văn An",
        date: "30/09/2026",
        deadline: "Còn 3 ngày",
        progress: "Đã tiếp nhận",
        relatedDoc: "TC-023/2026",
      },
    ],
  },
  {
    id: "approval",
    title: "CHỜ PHÊ DUYỆT",
    count: 6,
    tone: "blue",
    action: "Xem chi tiết đơn",
    cards: [
      {
        id: "TC-021/2026",
        type: "Đơn tố cáo",
        title: "Hồ sơ đề xuất thụ lý đơn tố cáo",
        description: "UBND phường X (Ông Trần Đình T)",
        submitter: "Lê Hoàng Nam",
        date: "28/09/2026",
        deadline: "Hết hạn hôm nay",
        progress: "Chờ lãnh đạo phê duyệt hướng xử lý",
      },
      {
        id: "KN-019/2026",
        type: "Đơn khiếu nại",
        title: "Hồ sơ đề xuất ký thông báo",
        description: "UBND phường X (Ông Trần Đình T)",
        submitter: "Lê Hoàng Nam",
        date: "28/09/2026",
        deadline: "Còn 2 ngày",
        progress: "Chờ ký thông báo không thụ lý",
      },
    ],
  },
  {
    id: "done",
    title: "ĐÃ XỬ LÝ",
    count: 4,
    tone: "green",
    action: "Xem chi tiết đơn",
    cards: [
      {
        id: "TC-017/2026",
        type: "Đơn tố cáo",
        title: "Quyết định thụ lý xác minh",
        description: "UBND phường X (Ông Trần Đình T)",
        submitter: "Lê Hoàng Nam",
        date: "28/09/2026",
        progress: "Đã ban hành quyết định thụ lý xác minh",
      },
      {
        id: "KN-016/2026",
        type: "Đơn khiếu nại",
        title: "Công văn chuyển đơn số 218/CV-CA",
        description: "Hồ sơ đã chuyển đơn vị có thẩm quyền",
        submitter: "Lê Hoàng Nam",
        date: "26/09/2026",
        progress: "Đã hoàn thành",
      },
      {
        id: "LN-20/2026",
        type: "Lượt nhận",
        title: "LN-20/2026-GOVEX",
        description: "Dịch vụ công Bộ Công an",
        submitter: "Trần Thị Mai",
        date: "24/09/2026",
        progress: "Đã tiếp nhận",
      },
    ],
  },
]

const leaderWorkColumns: WorkColumn[] = [
  {
    id: "need-action",
    title: "CHỜ PHÊ DUYỆT",
    count: 2,
    tone: "red",
    action: "Ký số ngay",
    cards: [
      {
        id: "VB-101",
        type: "Đơn tố cáo trong tố tụng hình sự",
        title: "DS-95/2026-CATPHN",
        description:
          "V/v đề xuất thụ lý giải quyết đơn tố cáo đối với hành vi bao che vi phạm",
        submitter: "Nguyễn Hoàng Nam",
        date: "07/10/2026 17:21:03",
        files: 3,
        progress: "2/3 văn bản",
        requirement: "Ký",
      },
      {
        id: "VB-102",
        type: "Đơn tố cáo",
        title:
          "DS-96/2026-CATPHN",
        description: "V/v thụ lý khẩn cấp và kiến nghị phong tỏa tài sản",
        submitter: "Nguyễn Hoàng Nam",
        date: "07/10/2026 18:00:00",
        files: 2,
        progress: "1/3 văn bản",
        requirement: "Ký",
      },
    ],
  },
  {
    id: "signing",
    title: "ĐANG PHÊ DUYỆT",
    count: 2,
    tone: "blue",
    action: "Ký số ngay",
    cards: [
      {
        id: "VB-103",
        type: "Đơn khiếu nại",
        title: "DS-97/2026-CATPHN",
        description:
          "V/v đề xuất phê duyệt kế hoạch xác minh 15 ngày đối với nội dung tố cáo",
        submitter: "Nguyễn Minh Anh",
        date: "01/10/2026 14:20",
        files: 2,
        progress: "1/3 văn bản",
        requirement: "Ký",
      },
      {
        id: "VB-107",
        type: "Đơn khiếu nại",
        title:
          "DS-98/2026-CATPHN",
        description: "Đề xuất phê duyệt phương án giải quyết khiếu nại lần đầu",
        submitter: "Nguyễn Minh Anh",
        date: "02/10/2026 10:05",
        files: 3,
        progress: "0/2 văn bản",
        requirement: "Duyệt",
      },
    ],
  },
  {
    id: "revision",
    title: "ĐANG ĐỀ XUẤT LÃNH ĐẠO KHÁC XỬ LÝ",
    count: 1,
    tone: "amber",
    action: "Xem chi tiết ý kiến chỉ đạo",
    cards: [
      {
        id: "VB-104",
        type: "Đơn khiếu nại",
        title:
          "DS-99/2026-CATPHN",
        description:
          "V/v đề xuất thụ lý khiếu nại lần 1 và thành lập tổ kiểm tra thực địa",
        submitter: "Nguyễn Minh Anh",
        date: "30/09/2026 16:45",
        files: 2,
        progress: "2/3 văn bản",
        requirement: "Xem",
      },
    ],
  },
  {
    id: "issued",
    title: "ĐÃ PHÊ DUYỆT",
    count: 3,
    tone: "green",
    action: "Xem văn bản",
    cards: [
      {
        id: "VB-105",
        type: "Đơn tố cáo",
        title:
          "DS-100/2026-CATPHN",
        description: "Đã ký số VGCA lúc 15:20 02/10",
        submitter: "Nguyễn Minh Anh",
        date: "01/10/2026 10:12",
        files: 1,
        progress: "Hoàn thành",
        requirement: "Xem",
      },
      {
        id: "VB-106",
        type: "Đơn kiến nghị, phản ánh",
        title:
          "DS-101/2026-CATPHN",
        description:
          "Hồ sơ cấp GCNQSDĐ cho thửa đất nằm trong hành lang thoát lũ",
        submitter: "Nguyễn Minh Anh",
        date: "29/09/2026 09:05",
        files: 1,
        progress: "Hoàn thành",
        requirement: "Xem",
      },
    ],
  },
]
const clerkWorkColumns: WorkColumn[] = [
  {
    id: "not_transferred",
    title: "CHƯA CHUYỂN",
    count: 13,
    tone: "red",
    action: "Chuyển xử lý",
    cards: [
      {
        id: "clerk-1",
        type: "Lượt nhận",
        title: "LN-108/2026-CATPHN",
        description: "",
        submitter: "",
        date: "07/10/2026",
        sender: "BKH",
        method: "Trực tiếp",
      },
      {
        id: "clerk-2",
        type: "Lượt nhận",
        title: "LN-100/2026-CATPHN",
        description: "",
        submitter: "",
        date: "07/10/2026",
        sender: "Chưa rõ",
        method: "Trực tiếp",
      },
      {
        id: "clerk-3",
        type: "Lượt nhận",
        title: "LN-99/2026-CATPHN",
        description: "",
        submitter: "",
        date: "07/10/2026",
        sender: "rerewrew",
        method: "Trực tiếp",
      },
      {
        id: "clerk-4",
        type: "Lượt nhận",
        title: "LN-96/2026-CATPHN",
        description: "",
        submitter: "",
        date: "07/10/2026",
        sender: "Chưa rõ",
        method: "Trực tiếp",
      },
    ]
  },
  {
    id: "transferred_officer",
    title: "ĐÃ CHUYỂN CÁN BỘ",
    count: 27,
    tone: "amber",
    action: "Xem chi tiết",
    cards: [
      {
        id: "clerk-5",
        type: "Lượt nhận",
        title: "LN-122/2026-CATPHN",
        description: "",
        submitter: "",
        date: "08/10/2026",
        sender: "Huyền Khánh",
        officer: "Nguyễn Hoàng Nam",
        method: "Trực tiếp",
      },
      {
        id: "clerk-6",
        type: "Lượt nhận",
        title: "LN-121/2026-CATPHN",
        description: "",
        submitter: "",
        date: "08/10/2026",
        sender: "Trần Kim Xuyến",
        officer: "Nguyễn Hoàng Nam",
        method: "Trực tiếp",
      },
      {
        id: "clerk-7",
        type: "Lượt nhận",
        title: "LN-120/2026-CATPHN",
        description: "",
        submitter: "",
        date: "08/10/2026",
        sender: "Trần Minh Ánh",
        officer: "Nguyễn Minh Khôi",
        method: "Trực tiếp",
      },
      {
        id: "clerk-8",
        type: "Lượt nhận",
        title: "LN-118/2026-CATPHN",
        description: "",
        submitter: "",
        date: "08/10/2026",
        sender: "Trần Hữu Hùng",
        officer: "Lê Hoàng Tuấn",
        method: "Trực tiếp",
      }
    ]
  },
  {
    id: "transferred_unit",
    title: "ĐÃ CHUYỂN VỀ ĐƠN VỊ",
    count: 6,
    tone: "blue",
    action: "Xem chi tiết",
    cards: [
      {
        id: "clerk-9",
        type: "Lượt nhận",
        title: "LN-117/2026-CATPHN",
        description: "",
        submitter: "",
        date: "08/10/2026",
        sender: "Chưa rõ",
        unit: "Công an Quận Ba Đình",
        method: "Trực tiếp",
      },
      {
        id: "clerk-10",
        type: "Lượt nhận",
        title: "LN-95/2026-CATPHN",
        description: "",
        submitter: "",
        date: "07/10/2026",
        sender: "Phạm Vinh",
        unit: "Công an Quận Cầu Giấy",
        method: "Trực tiếp",
      },
      {
        id: "clerk-11",
        type: "Lượt nhận",
        title: "LN-83/2026-CATPHN",
        description: "",
        submitter: "",
        date: "07/10/2026",
        sender: "Trần Hươn",
        unit: "Công an Quận Hoàn Kiếm",
        method: "Trực tiếp",
      },
      {
        id: "clerk-12",
        type: "Lượt nhận",
        title: "LN-115/2026-CATPHN",
        description: "",
        submitter: "",
        date: "07/10/2026",
        sender: "Linh Nguyen",
        unit: "Công an Quận Đống Đa",
        method: "Trực tiếp",
      }
    ]
  }
]

function OfficerWorkCard({
  card,
  action,
  tone,
  onAction,
  onOpen,
}: {
  card: WorkCard
  action: string
  tone: WorkColumn["tone"]
  onAction: () => void
  onOpen: () => void
}) {
  const isReceipt = card.type === "Lượt nhận"
  const aiAnalyzed = card.description.includes("Đã phân tích AI")
  const receptionMethod = card.description.split("·")[0].trim()

  return (
    <article
      className={`work-card officer-card ${!isReceipt ? "is-clickable" : ""}`}
      onClick={!isReceipt ? onOpen : undefined}
      onKeyDown={(event) => {
        if (!isReceipt && (event.key === "Enter" || event.key === " ")) {
          onOpen()
        }
      }}
      role={!isReceipt ? "button" : undefined}
      tabIndex={!isReceipt ? 0 : undefined}
    >
      <div className="work-card__meta">
        <span>{card.type}</span>
        <strong className="officer-card__code" style={{ color: 'var(--text)', fontSize: '13px', margin: 0, fontWeight: 'bold' }}>
          {card.id}
        </strong>
      </div>

      <dl className="officer-card__details">
        {card.deadline && (
          <div>
            <dt>Thời hạn:</dt>
            <dd style={{ color: '#e11d48' }}>{card.deadline}</dd>
          </div>
        )}
        <div>
          <dt>{isReceipt ? "Người nộp:" : "Người đứng đơn:"}</dt>
          <dd>{card.submitter}</dd>
        </div>
        <div>
          <dt>{isReceipt ? "Cán bộ nhận:" : "Bị đơn:"}</dt>
          <dd>{isReceipt ? "Nguyễn Minh Anh" : card.description}</dd>
        </div>
        {isReceipt && (
          <div>
            <dt>Hình thức nhận:</dt>
            <dd>{receptionMethod}</dd>
          </div>
        )}
        <div>
          <dt>Ngày nhận:</dt>
          <dd>{card.date}</dd>
        </div>
        {isReceipt && card.relatedDoc && (
          <div>
            <dt>Đơn liên quan:</dt>
            <dd>{card.relatedDoc}</dd>
          </div>
        )}
        <div>
          <dt>{isReceipt ? "Đánh giá AI:" : "Nội dung đơn:"}</dt>
          <dd>
            {isReceipt ? (
              <span className={`officer-ai ${aiAnalyzed ? "is-analyzed" : ""}`}>
                <Icon name="2d741" size={12} />
                {aiAnalyzed ? "Đã phân tích AI" : "Chưa phân tích AI"}
              </span>
            ) : (
              card.title
            )}
          </dd>
        </div>
      </dl>

      <div
        className="officer-card__actions"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          variant={tone === "green" ? "secondary" : "primary"}
          onClick={onAction}
        >
          {action}
        </Button>
        <button type="button" aria-label="Thao tác khác">
          ⋮
        </button>
      </div>
    </article>
  )
}

function ClerkWorkCard({
  card,
  action,
  tone,
  onAction,
}: {
  card: WorkCard
  action: string
  tone: WorkColumn["tone"]
  onAction: () => void
}) {
  return (
    <article className="work-card officer-card">
      <div className="work-card__meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: '#9333ea', background: '#f3e8ff', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
          {card.type}
        </span>
        <strong className="officer-card__code" style={{ color: 'var(--text)', fontSize: '13px', margin: 0 }}>
          {card.title}
        </strong>
      </div>

      <dl className="officer-card__details" style={{ marginTop: '12px' }}>
        <div>
          <dt>Người nộp:</dt>
          <dd>{card.sender}</dd>
        </div>
        {card.officer && (
          <div>
            <dt>Cán bộ nhận:</dt>
            <dd>{card.officer}</dd>
          </div>
        )}
        {card.unit && (
          <div>
            <dt>Đơn vị nhận:</dt>
            <dd>{card.unit}</dd>
          </div>
        )}
        <div>
          <dt>Hình thức nhận:</dt>
          <dd>{card.method}</dd>
        </div>
        <div>
          <dt>Ngày nhận:</dt>
          <dd>{card.date}</dd>
        </div>
      </dl>

      <div style={{ marginTop: '16px' }}>
        <Button
          variant="primary"
          onClick={onAction}
        >
          {action}
        </Button>
      </div>
    </article>
  )
}
function LeaderWorkCard({
  card,
  action,
  tone,
  onAction,
}: {
  card: WorkCard
  action: string
  tone: WorkColumn["tone"]
  onAction: () => void
}) {
  return (
    <article
      className="work-card officer-card"
      onClick={onAction}
      style={{ cursor: 'pointer' }}
    >
      <div className="work-card__meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: '#1e3a8a', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
          Lượt trình
        </span>
        <strong className="officer-card__code" style={{ color: 'var(--text)', fontSize: '13px', margin: 0 }}>
          {card.title}
        </strong>
      </div>

      <dl className="officer-card__details leader-card__details" style={{ marginTop: '12px' }}>
        <div>
          <dt>Loại đơn:</dt>
          <dd>{card.type}</dd>
        </div>
        <div>
          <dt>Người trình:</dt>
          <dd>{card.submitter}</dd>
        </div>
        <div>
          <dt>Trình ngày:</dt>
          <dd>{card.date}</dd>
        </div>
        <div>
          <dt>Tiến độ:</dt>
          <dd>{card.progress}</dd>
        </div>
      </dl>

      <div style={{ marginTop: '16px' }} onClick={(e) => e.stopPropagation()}>
        <Button
          variant={tone === "green" ? "secondary" : "primary"}
          className="leader-action-btn"
          onClick={onAction}
        >
          {action}
        </Button>
      </div>
    </article>
  )
}
export function WorkPage({
  onNotify,
  onOpenLeaderDocument,
  onOpenOfficerCase,
  onAddReceipt,
  onAddCase,
  initialRole = "officer",
  onSwitchRole,
}: {
  onNotify: (message: string) => void
  onOpenLeaderDocument: (card: WorkCard) => void
  onOpenOfficerCase: (card: WorkCard) => void
  onAddReceipt: () => void
  onAddCase: () => void
  initialRole?: WorkRole
  onSwitchRole?: (role: WorkRole) => void
}) {
  const [role, setRole] = useState<WorkRole>(initialRole)
  useEffect(() => {
    if (initialRole) setRole(initialRole)
  }, [initialRole])
  const [query, setQuery] = useState("")
  const columns =
    role === "officer"
      ? officerWorkColumns
      : role === "clerk"
        ? clerkWorkColumns
        : leaderWorkColumns
  const normalizedQuery = query.trim().toLowerCase()
  const visibleColumns = columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) =>
      `${card.title} ${card.description} ${card.submitter} ${card.id}`
        .toLowerCase()
        .includes(normalizedQuery),
    ),
  }))
  const summaries =
    role === "officer"
      ? [
        ["Tổng công việc", "31", "Hồ sơ đang mở", "neutral"],
        ["Lượt tiếp nhận cần xử lý", "14", "Hồ sơ cần xử lý", "red"],
        ["Đang xử lý", "3", "Cần theo dõi", "pink"],
        ["Chờ phê duyệt", "4", "Hồ sơ chờ duyệt", "amber"],
        ["Đã xử lý", "6", "Đã hoàn thành", "blue"],
      ]
      : role === "clerk"
        ? [
          ["Tổng công việc", "68", "Toàn bộ hồ sơ đang theo dõi", "neutral"],
          ["Chưa chuyển", "13", "Chưa chuyển cho cán bộ nào", "red"],
          ["Đã chuyển cán bộ", "27", "Đã chuyển cho cán bộ, chờ kết quả", "amber"],
          ["Đã chuyển về đơn vị", "6", "Đơn vị nhận đang xử lý", "blue"],
        ]
        : [
          ["Tổng công việc", "122", "Toàn bộ hồ sơ đang theo dõi", "neutral"],
          ["Lượt nhận cần xử lý", "17", "Hồ sơ cần xử lý", "red"],
          ["Tiếp nhận & xử lý", "57", "Hồ sơ đã tiếp nhận", "amber"],
          ["Đang chờ", "0", "Chờ phối hợp & phê duyệt", "blue"],
          ["Đã bàn giao · Theo dõi", "48", "Đã duyệt hoặc bàn giao", "green"],
        ]

  return (
    <main className="page work-page">
      <header className="work-header">
        <div>
          <div className="work-title-row">
            <h1>Công việc của tôi</h1>
            <div className="role-toggle" aria-label="Chế độ bàn làm việc">
              <button
                className={role === "officer" ? "is-active" : ""}
                type="button"
                onClick={() => {
                  setRole("officer");
                  onSwitchRole?.("officer");
                }}
              >
                Cán bộ
              </button>
              <button
                className={role === "clerk" ? "is-active" : ""}
                type="button"
                onClick={() => {
                  setRole("clerk");
                  onSwitchRole?.("clerk");
                }}
              >
                Văn thư
              </button>
              <button
                className={role === "leader" ? "is-active" : ""}
                type="button"
                onClick={() => {
                  setRole("leader");
                  onSwitchRole?.("leader");
                }}
              >
                Lãnh đạo
              </button>
            </div>
          </div>
          <p>
            {role === "officer"
              ? "Bàn làm việc cá nhân · Tiếp nhận, xử lý và theo dõi tiến độ giải quyết hồ sơ, đơn thư"
              : role === "clerk"
                ? "Bàn làm việc văn thư · Chuyển xử lý, theo dõi lượt nhận, bàn giao hồ sơ đơn thư"
                : "Bàn làm việc lãnh đạo · Giám sát quy trình xử lý, phê duyệt và ký số văn bản"}
          </p>
        </div>
        {role === "officer" ? (
          <div className="header-actions">
            <div className="work-user-status">
              <i />
              Cán bộ: <strong>Nguyễn Minh Anh</strong>
            </div>
            <Button
              variant="primary"
              onClick={onAddCase}
            >
              ＋ Thêm đơn
            </Button>
          </div>
        ) : role === "clerk" ? (
          <div className="header-actions">
            <Button variant="primary" onClick={onAddReceipt}>
              ＋ Thêm lượt nhận
            </Button>
          </div>
        ) : (
          <div className="header-actions">
            <div className="work-user-status" style={{ background: '#eef2ff', borderColor: '#c7d2fe', color: '#3730a3' }}>
              <i style={{ background: '#4f46e5' }} />
              Lãnh đạo: <strong>Trần Trọng Giáp</strong>
            </div>
          </div>
        )}
      </header>

      <section className="work-content">
        <div className="work-toolbar">
          <label className="search-field work-search">
            <Icon name="1c586" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                role === "clerk"
                  ? "Tìm kiếm theo mã lượt nhận, người nộp, người nhận..."
                  : role === "officer"
                    ? "Tìm kiếm theo mã lượt nhận, mã đơn, người đứng đơn, bị đơn..."
                    : "Tìm kiếm theo mã đơn, người trình..."
              }
            />
          </label>
          <Button>
            <Icon name="d7f9c" /> Bộ lọc nâng cao
          </Button>
          <Button>Sắp xếp: Ưu tiên hạn xử lý</Button>
        </div>

        <div className="quick-filters">
          {role === "clerk" ? (
            <>
              <select aria-label="Trạng thái">
                <option value="">Trạng thái: Tất cả</option>
                <option value="Chưa chuyển">Chưa chuyển</option>
                <option value="Đã chuyển cán bộ">Đã chuyển cán bộ</option>
                <option value="Đã chuyển về đơn vị">Đã chuyển về đơn vị</option>
              </select>
              <input type="date" aria-label="Ngày nhận" title="Ngày nhận" />
              <input type="date" aria-label="Ngày chuyển xử lý" title="Ngày chuyển xử lý" />
              <select aria-label="Hình thức nhận">
                <option value="">Hình thức nhận: Tất cả</option>
                <option value="Trực tiếp">Trực tiếp</option>
                <option value="Email">Email</option>
              </select>
              <select aria-label="Khoảng thời gian">
                <option value="">Khoảng thời gian: Tất cả</option>
              </select>
            </>
          ) : role === "officer" ? (
            <>
              <select aria-label="Trạng thái">
                <option value="">Trạng thái: Tất cả</option>
              </select>
              <select aria-label="Loại đơn">
                <option value="">Loại đơn: Tất cả</option>
                <option value="Đơn tố cáo">Đơn tố cáo</option>
                <option value="Đơn khiếu nại">Đơn khiếu nại</option>
              </select>
              <input type="date" aria-label="Ngày tạo đơn" title="Ngày tạo đơn" />
              <select aria-label="Khoảng thời gian">
                <option value="">Khoảng thời gian: Tất cả</option>
              </select>
            </>
          ) : (
            <>
              <select aria-label="Trạng thái">
                <option value="">Trạng thái: Tất cả</option>
                <option value="Chờ phê duyệt">Chờ phê duyệt</option>
                <option value="Đang thực hiện">Đang thực hiện</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
              </select>
              <select aria-label="Loại đơn">
                <option value="">Loại đơn: Tất cả</option>
                <option value="Đơn tố cáo">Đơn tố cáo</option>
                <option value="Đơn khiếu nại">Đơn khiếu nại</option>
              </select>
              <input type="date" aria-label="Ngày trình ký" title="Ngày trình ký" />
              <select aria-label="Khoảng thời gian">
                <option value="">Khoảng thời gian: Tất cả</option>
              </select>
            </>
          )}
          <button className="clear" type="button" onClick={() => setQuery("")}>
            Xóa bộ lọc
          </button>
        </div>

        <div className={`work-summaries ${role === "clerk" ? "work-summaries--clerk" : ""}`}>
          {summaries.map(([label, value, note, tone]) => (
            <button
              className={`work-summary work-summary--${tone}`}
              type="button"
              key={label}
            >
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </button>
          ))}
        </div>

        <div className={`kanban ${role !== "officer" ? "kanban--leader" : ""}`}>
          {visibleColumns.map((column) => (
            <section
              className={`kanban-column kanban-column--${column.tone}`}
              key={column.id}
            >
              <header>
                <div>
                  <i />
                  <strong>{column.title}</strong>
                </div>
                <span>{column.count}</span>
              </header>
              <div className="kanban-column__body">
                {column.cards.length ? (
                  column.cards.map((card) =>
                    role === "officer" ? (
                      <OfficerWorkCard
                        card={card}
                        action={column.action}
                        tone={column.tone}
                        onAction={() => onOpenOfficerCase(card)}
                        onOpen={() => onOpenOfficerCase(card)}
                        key={card.id}
                      />
                    ) : role === "clerk" ? (
                      <ClerkWorkCard
                        card={card}
                        action={column.action}
                        tone={column.tone}
                        onAction={() => onNotify("Đã chuyển xử lý/Xem chi tiết")}
                        key={card.id}
                      />
                    ) : (
                      <LeaderWorkCard
                        card={card}
                        action={card.requirement === "Ký" ? "Vào ký/duyệt" : card.requirement === "Duyệt" ? "Vào ký/duyệt" : "Xem chi tiết"}
                        tone={column.tone}
                        onAction={() => onOpenLeaderDocument(card)}
                        key={card.id}
                      />
                    ),
                  )
                ) : (
                  <div className="kanban-empty">Không có công việc phù hợp</div>
                )}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  )
}

function ReceiptField({
  label,
  required = false,
  placeholder,
  value,
  type = "text",
  options,
  className = "",
}: {
  label: string
  required?: boolean
  placeholder?: string
  value?: string
  type?: "text" | "date" | "tel"
  options?: string[]
  className?: string
}) {
  return (
    <label className={`receipt-field ${className}`}>
      <span>
        {label} {required && <b>*</b>}
      </span>
      {options ? (
        <select defaultValue={value ?? ""}>
          {!value && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} defaultValue={value} placeholder={placeholder} />
      )}
    </label>
  )
}

function ReceiptSectionTitle({
  number,
  children,
  detail,
}: {
  number: string
  children: React.ReactNode
  detail?: string
}) {
  return (
    <div className="receipt-section-title">
      <span>{number}</span>
      <strong>{children}</strong>
      {detail && <small>{detail}</small>}
    </div>
  )
}

function AddReceiptPage({
  onBack,
  onNotify,
}: {
  onBack: () => void
  onNotify: (message: string) => void
}) {
  const [hasRepresentative, setHasRepresentative] = useState(true)
  const [submitterType, setSubmitterType] = useState("Cá nhân")

  return (
    <main className="page receipt-page">
      <div className="receipt-scroll">
        <div className="receipt-content">
          <nav className="receipt-breadcrumbs" aria-label="Điều hướng">
            <button type="button" onClick={onBack}>
              <Icon name="33826" size={14} /> Quay lại
            </button>
            <span>/</span>
            <span>Nhận đơn</span>
            <span>/</span>
            <strong>Thêm mới lượt nhận</strong>
          </nav>
          <h1>Thêm mới lượt nhận</h1>

          <section className="receipt-section">
            <ReceiptSectionTitle number="01">Thông tin tiếp nhận</ReceiptSectionTitle>
            <div className="receipt-grid">
              <ReceiptField
                label="Ngày tiếp nhận"
                required
                type="date"
                value="2026-10-12"
              />
              <ReceiptField
                label="Hình thức nhận"
                required
                value="Trực tiếp"
                options={["Trực tiếp", "Bưu chính", "Trực tuyến"]}
              />
              <ReceiptField
                label="Cán bộ nhận"
                value="Trần Thu Hà – Văn thư"
                options={["Trần Thu Hà – Văn thư", "Nguyễn Minh Anh – Cán bộ"]}
              />
              <ReceiptField
                label="Đơn vị nhận"
                value="Công an thành phố Hà Nội"
                options={[
                  "Công an thành phố Hà Nội",
                  "Ủy ban nhân dân thành phố Hà Nội",
                ]}
              />
            </div>

            <fieldset className="receipt-radio-group">
              <legend>Người nộp</legend>
              {["Không rõ", "Cá nhân", "Cơ quan/tổ chức"].map((type) => (
                <label key={type}>
                  <input
                    type="radio"
                    name="submitter-type"
                    value={type}
                    checked={submitterType === type}
                    onChange={() => setSubmitterType(type)}
                  />
                  {type}
                </label>
              ))}
            </fieldset>

            {submitterType === "Cá nhân" && (
              <div className="receipt-grid">
                <ReceiptField label="Họ và tên" required placeholder="VD: Nguyễn Văn An" />
                <ReceiptField
                  label="Giới tính"
                  placeholder="Chọn giới tính"
                  options={["Nam", "Nữ", "Khác"]}
                />
                <ReceiptField label="Ngày sinh" placeholder="VD: 15/05/1990 hoặc 1990" />
                <div className="receipt-composite-field">
                  <ReceiptField
                    label="CCCD"
                    placeholder="9 hoặc 12 chữ số"
                  />
                  <Button
                    variant="primary"
                    onClick={() => onNotify("Đã tra cứu thông tin người nộp")}
                  >
                    <Icon name="35a4d" size={14} /> Tra cứu
                  </Button>
                </div>
                <ReceiptField
                  label="Địa chỉ chi tiết"
                  placeholder="Số nhà, đường phố, ngõ ngách..."
                />
                <ReceiptField
                  label="Phường / Xã"
                  placeholder="Vui lòng chọn Tỉnh / Thành phố trước"
                  options={["Phường Ba Đình", "Phường Hoàn Kiếm"]}
                />
                <ReceiptField
                  label="Tỉnh / Thành phố"
                  placeholder="Chọn Tỉnh / Thành phố"
                  options={["Hà Nội", "Hải Phòng", "Đà Nẵng"]}
                />
                <ReceiptField
                  label="Số điện thoại"
                  type="tel"
                  placeholder="Ví dụ: 0901 234 567"
                />
              </div>
            )}

            {submitterType === "Cơ quan/tổ chức" && (
              <>
                <div className="receipt-grid receipt-organization">
                  <ReceiptField
                    label="Tên cơ quan/tổ chức"
                    required
                    placeholder="Nhập tên đầy đủ cơ quan / tổ chức"
                  />
                  <ReceiptField label="Tên viết tắt" placeholder="VD: ABC Corp, TNHH..." />
                  <ReceiptField label="Mã số tổ chức" placeholder="Nhập mã số tổ chức" />
                  <div className="receipt-composite-field">
                    <ReceiptField
                      label="Mã số thuế / Mã định danh"
                      placeholder="Nhập MST hoặc mã"
                    />
                    <Button
                      variant="primary"
                      onClick={() => onNotify("Đã tra cứu thông tin tổ chức")}
                    >
                      <Icon name="35a4d" size={14} /> Tra cứu
                    </Button>
                  </div>
                  <ReceiptField
                    label="Loại hình"
                    placeholder="Chọn loại hình"
                    options={["Cơ quan nhà nước", "Doanh nghiệp", "Tổ chức xã hội"]}
                  />
                  <ReceiptField
                    label="Lĩnh vực"
                    placeholder="Chọn lĩnh vực"
                    options={["Hành chính", "Pháp luật", "Thương mại", "Giáo dục"]}
                  />
                  <ReceiptField
                    label="Ngành nghề"
                    placeholder="Nhập ngành nghề kinh doanh / hoạt động"
                  />
                  <ReceiptField label="Ngày thành lập" type="date" />
                  <ReceiptField label="Số điện thoại" type="tel" placeholder="Ví dụ: 024..." />
                  <ReceiptField label="Email" placeholder="contact@domain.vn" />
                  <ReceiptField
                    label="Tỉnh / Thành phố"
                    placeholder="Chọn Tỉnh / Thành phố"
                    options={["Hà Nội", "Hải Phòng", "Đà Nẵng"]}
                  />
                  <ReceiptField
                    label="Phường / Xã"
                    placeholder="Vui lòng chọn Tỉnh / Thành phố trước"
                    options={["Phường Ba Đình", "Phường Hoàn Kiếm"]}
                  />
                  <ReceiptField
                    label="Địa chỉ chi tiết"
                    placeholder="Số nhà, đường phố, ngõ ngách..."
                    className="receipt-field--full"
                  />
                </div>

                <div className="receipt-grid receipt-legal-representative">
                  <ReceiptField
                    label="Họ và tên người đại diện"
                    required
                    placeholder="VD: Nguyễn Văn An"
                  />
                  <ReceiptField
                    label="Chức vụ"
                    placeholder="VD: Giám đốc, Tổng giám đốc, Đại diện pháp luật"
                  />
                  <div className="receipt-composite-field receipt-field--wide">
                    <ReceiptField label="CCCD / Số định danh" placeholder="9 hoặc 12 chữ số" />
                    <Button
                      variant="primary"
                      onClick={() => onNotify("Đã tra cứu người đại diện")}
                    >
                      <Icon name="35a4d" size={14} /> Tra cứu
                    </Button>
                  </div>
                  <ReceiptField label="Số điện thoại" type="tel" placeholder="Ví dụ: 0901 234 567" />
                  <ReceiptField label="Email" placeholder="email@domain.com" />
                </div>
              </>
            )}

            {submitterType !== "Không rõ" && (
              <label className="receipt-checkbox">
                <input
                  type="checkbox"
                  checked={hasRepresentative}
                  onChange={(event) => setHasRepresentative(event.target.checked)}
                />
                {submitterType === "Cơ quan/tổ chức"
                  ? "Có người được ủy quyền"
                  : "Có người ủy quyền"}
              </label>
            )}

            {submitterType !== "Không rõ" && hasRepresentative && (
              <div className="representative-panel">
                <div className="representative-panel__title">
                  <Icon name="ca9bf" size={16} />
                  <strong>Thông tin người ủy quyền &amp; Giấy ủy quyền</strong>
                  <span>(Bắt buộc)</span>
                </div>
                <div className="receipt-grid">
                  <ReceiptField
                    label="Họ và tên người ủy quyền"
                    required
                    placeholder="Họ tên người nhận ủy quyền"
                  />
                  <ReceiptField label="Chức vụ trong tổ chức" placeholder="Chuyên viên pháp lý..." />
                  <ReceiptField label="Số điện thoại" type="tel" placeholder="0xxxxxxxxx" />
                  <div className="receipt-composite-field">
                    <ReceiptField label="CCCD / Số định danh" placeholder="9 hoặc 12 chữ số" />
                    <Button
                      variant="primary"
                      onClick={() => onNotify("Đã tra cứu người ủy quyền")}
                    >
                      <Icon name="35a4d" size={14} /> Tra cứu
                    </Button>
                  </div>
                  <ReceiptField
                    label="Địa chỉ chi tiết"
                    placeholder="Số nhà, đường phố, ngõ ngách..."
                    className="receipt-field--wide"
                  />
                  <ReceiptField
                    label="Phường / Xã"
                    placeholder="Vui lòng chọn Tỉnh / Thành phố trước"
                    options={["Phường Ba Đình", "Phường Hoàn Kiếm"]}
                  />
                  <ReceiptField
                    label="Tỉnh / Thành phố"
                    placeholder="Chọn Tỉnh / Thành phố"
                    options={["Hà Nội", "Hải Phòng", "Đà Nẵng"]}
                  />
                </div>
                <label className="receipt-upload receipt-upload--authorization">
                  <input type="file" accept=".pdf,image/*" />
                  <span>Tải lên Giấy ủy quyền / Công văn ủy quyền <b>*</b></span>
                  <span className="receipt-upload__box">
                    <Icon name="a439f" size={20} />
                    <strong>Chọn tệp Giấy ủy quyền hợp lệ (PDF / Ảnh)</strong>
                    <small>hoặc kéo thả tệp vào đây</small>
                  </span>
                </label>
              </div>
            )}
          </section>

          <section className="receipt-section receipt-documents">
            <div className="receipt-section-heading">
              <ReceiptSectionTitle number="02" detail="0 tài liệu">
                Tài liệu tiếp nhận
              </ReceiptSectionTitle>
              <div className="header-actions">
                <label className="button button--primary receipt-file-button">
                  <input type="file" multiple />
                  <Icon name="66e6a" size={16} /> Tải lên
                </label>
                <Button onClick={() => onNotify("Đã mở chức năng quét tài liệu")}>
                  <Icon name="a8f78" size={16} /> Quét tài liệu
                </Button>
              </div>
            </div>
            <div className="receipt-empty">
              <Icon name="e7105" size={32} />
              <strong>Chưa có tài liệu đính kèm</strong>
              <span>
                Nhấn nút <b>&quot;Tải lên&quot;</b> hoặc <b>&quot;Quét tài liệu&quot;</b> ở
                trên để đính kèm tệp vào lượt nhận.
              </span>
            </div>
          </section>

          <section className="receipt-section receipt-notes">
            <ReceiptSectionTitle number="03">Ghi chú</ReceiptSectionTitle>
            <textarea placeholder="Nhập ghi chú hoặc yêu cầu của người nộp..." />
          </section>
        </div>
      </div>
      <footer className="receipt-footer">
        <Button onClick={onBack}>Hủy</Button>
        <Button
          variant="primary"
          onClick={() => {
            onNotify("Đã thêm mới lượt nhận thành công")
            onBack()
          }}
        >
          <Icon name="3b6aa" size={16} /> Thêm mới
        </Button>
      </footer>
    </main>
  )
}

type CaseRelatedPerson = {
  name: string
  type: string
  id: string
  role: string
  authorized: boolean
  contact: string
  address: string
  filter: string
}

const caseRelatedPeople: CaseRelatedPerson[] = [
  {
    name: "Nguyễn Hoàng Nam",
    type: "Cá nhân",
    id: "Chưa có",
    role: "Người liên quan",
    authorized: false,
    contact: "—",
    address: "—",
    filter: "Người liên quan",
  },
  {
    name: "TRẦN MINH TUẤN",
    type: "Cá nhân",
    id: "CCCD: 031088004827",
    role: "Người làm đơn",
    authorized: true,
    contact: "0912.684.215",
    address: "Số 52 đường Tô Hiệu, phường Lê Chân, thành phố Hải Phòng",
    filter: "Người nộp",
  },
  {
    name: "PHẠM ĐỨC THẮNG",
    type: "Cá nhân",
    id: "Chưa có",
    role: "Cá nhân, cơ quan/tổ chức liên quan",
    authorized: false,
    contact: "—",
    address: "—",
    filter: "Người liên quan",
  },
]

export function CreateCasePage({
  onBack,
  onNotify,
  onSubmit,
}: {
  onBack: () => void
  onNotify: (message: string) => void
  onSubmit?: (data?: any) => void
}) {
  const [relatedPeople, setRelatedPeople] = useState<CaseRelatedPerson[]>([])
  const [relatedQuery, setRelatedQuery] = useState("")
  const [showRelatedPersonModal, setShowRelatedPersonModal] = useState(false)
  const visiblePeople = relatedPeople.filter((person) => {
    return `${person.name} ${person.id} ${person.role} ${person.contact}`
      .toLowerCase()
      .includes(relatedQuery.trim().toLowerCase())
  })

  function addRelatedPerson(person: CaseRelatedPerson) {
    setRelatedPeople((current) => [...current, person])
    setShowRelatedPersonModal(false)
  }

  return (
    <main className="page create-case-page">
      <header className="create-case-header">
        <nav className="receipt-breadcrumbs" aria-label="Điều hướng">
          <button type="button" onClick={onBack}>
            <Icon name="33826" size={14} /> Quay lại
          </button>
          <span>/</span>
          <span>Nhận đơn</span>
          <span>/</span>
          <strong>Tạo đơn mới</strong>
        </nav>
        <h1>Tạo đơn mới</h1>
        <p>Cán bộ điều tra tiếp nhận đơn trực tiếp</p>
      </header>

      <div className="create-case-scroll">
        <div className="create-case-content">
          <section className="create-case-section">
            <ReceiptSectionTitle number="01">Thông tin tiếp nhận</ReceiptSectionTitle>
            <div className="receipt-grid">
              <ReceiptField label="Ngày nhận" required type="date" value="2026-10-12" />
              <ReceiptField
                label="Hình thức nhận"
                value="Trực tiếp"
                options={["Trực tiếp", "Bưu chính", "Trực tuyến"]}
              />
              <ReceiptField
                label="Cán bộ điều tra"
                value="Nguyễn Hoàng Nam"
              />
              <ReceiptField
                label="Đơn vị nhận"
                value="Công an thành phố Hà Nội"
              />
            </div>
          </section>

          <section className="create-case-section">
            <div className="create-case-section-heading">
              <ReceiptSectionTitle number="02">
                Người nộp đơn &amp; người liên quan
              </ReceiptSectionTitle>
              <div className="create-case-related-actions">
                <label>
                  <Icon name="1c586" size={14} />
                  <input
                    value={relatedQuery}
                    onChange={(event) => setRelatedQuery(event.target.value)}
                    placeholder="Tìm theo tên, CCCD, ..."
                  />
                </label>
                <Button
                  variant="primary"
                  onClick={() => setShowRelatedPersonModal(true)}
                >
                  ＋ Thêm người liên quan
                </Button>
              </div>
            </div>
            <div className="create-case-table">
              <div className="create-case-table__head">
                <span>#</span>
                <span>Họ tên / Tổ chức</span>
                <span>Vai trò &amp; tư cách</span>
                <span>Liên hệ &amp; địa chỉ</span>
                <span>Thao tác</span>
              </div>
              {visiblePeople.length ? (
                visiblePeople.map((person, index) => (
                  <div className="create-case-table__row" key={`${person.name}-${index}`}>
                    <span>{index + 1}</span>
                    <span>
                      <strong>{person.name}</strong>
                      <small>{person.type}</small>
                    </span>
                    <span>{person.role}</span>
                    <span>
                      {person.contact}
                      {person.address !== "—" ? ` · ${person.address}` : ""}
                    </span>
                    <Button variant="ghost">Xem chi tiết</Button>
                  </div>
                ))
              ) : (
                <div className="create-case-table__empty">
                  {relatedPeople.length
                    ? "Không tìm thấy người phù hợp."
                    : "Chưa có người nộp đơn hoặc người liên quan."}
                </div>
              )}
            </div>
          </section>

          <section className="create-case-section">
            <ReceiptSectionTitle number="03">Thông tin đơn</ReceiptSectionTitle>
            <div className="create-case-order-grid">
              <ReceiptField
                label="Loại đơn"
                required
                value="Đơn tố cáo trong tố tụng hình sự"
                options={[
                  "Đơn tố cáo trong tố tụng hình sự",
                  "Đơn khiếu nại",
                  "Đơn kiến nghị, phản ánh",
                ]}
                className="create-case-order-grid__half"
              />
              <ReceiptField
                label="Ngày làm đơn"
                type="date"
                value="2026-09-30"
                className="create-case-order-grid__half"
              />
              <ReceiptField
                label="Lĩnh vực"
                required
                value="Hình sự"
                options={["Hình sự", "Dân sự", "Hành chính"]}
              />
              <ReceiptField
                label="Nhóm nội dung chính"
                required
                value="Tố tụng hình sự - Tạm giữ vật chứng"
              />
              <ReceiptField
                label="Địa điểm làm đơn"
                placeholder="Nhập địa điểm làm đơn (quận/huyện, tỉnh/thành)..."
                className="create-case-order-grid__half"
              />
            </div>
            <label className="create-case-textarea">
              <span>Nội dung chính <b>*</b></span>
              <textarea defaultValue="Người tố cáo đề nghị cơ quan có thẩm quyền kiểm tra việc tiếp nhận, lập biên bản, niêm phong và quản lý thiết bị điện thoại tại thời điểm giao nhận ngày 08/09/2026 để xác định quá trình xử lý có đúng quy định hay không." />
            </label>
            <label className="create-case-textarea">
              <span>Yêu cầu trong đơn</span>
              <textarea placeholder="Nhập yêu cầu cụ thể của công dân..." />
            </label>
            <label className="create-case-textarea">
              <span>Tài sản, hiện trạng liên quan</span>
              <textarea defaultValue="Điện thoại di động màu đen" />
            </label>
          </section>

          <section className="create-case-section">
            <div className="create-case-section-heading">
              <ReceiptSectionTitle number="04" detail="0 tài liệu">
                Tài liệu đính kèm
              </ReceiptSectionTitle>
              <label className="button button--secondary receipt-file-button">
                <input type="file" multiple />
                <Icon name="66e6a" size={16} /> Tải file
              </label>
            </div>
            <label className="create-case-upload">
              <input type="file" multiple />
            </label>
          </section>
        </div>
      </div>

      <footer className="receipt-footer">
        <Button onClick={onBack}>Hủy bỏ</Button>
        <Button
          variant="primary"
          onClick={() => {
            onNotify("Đã tạo mới đơn thành công")
            if (onSubmit) {
              onSubmit({
                nguoiNop: visiblePeople[0]?.name || "Nguyễn Văn An",
                content: "Người tố cáo đề nghị cơ quan có thẩm quyền kiểm tra việc tiếp nhận, lập biên bản, niêm phong và quản lý thiết bị điện thoại tại thời điểm giao nhận ngày 08/09/2026 để xác định quá trình xử lý có đúng quy định hay không.",
              })
            }
            onBack()
          }}
        >
          <Icon name="3b6aa" size={16} /> Tạo mới đơn
        </Button>
      </footer>
      {showRelatedPersonModal && (
        <RelatedPersonModal
          onClose={() => setShowRelatedPersonModal(false)}
          onNotify={onNotify}
          onAdd={addRelatedPerson}
        />
      )}
    </main>
  )
}

export function RelatedPersonModal({
  onClose,
  onNotify,
  onAdd,
}: {
  onClose: () => void
  onNotify: (message: string) => void
  onAdd: (person: CaseRelatedPerson) => void
}) {
  const [role, setRole] = useState("Người nộp")
  const [subjectType, setSubjectType] = useState("Cá nhân")
  const [isPrimaryPetitioner, setIsPrimaryPetitioner] = useState(false)
  const personRoles = [
    "Người nộp",
    "Người tố giác",
    "Người bị tố giác",
    "Cơ quan/Tổ chức liên quan",
    "Người có quyền lợi và nghĩa vụ liên quan",
  ]
  const effectiveSubjectType =
    role === "Cơ quan/Tổ chức liên quan"
      ? "Cơ quan/Tổ chức"
      : role === "Người nộp"
        ? subjectType
        : "Cá nhân"

  return (
    <div className="related-modal-backdrop" role="presentation">
      <section
        className="related-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="related-modal-title"
      >
        <header className="related-modal__header">
          <div>
            <h2 id="related-modal-title">Thêm người liên quan</h2>
            <p>Chọn vai trò và nhập thông tin đối tượng liên quan đến đơn.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </header>

        <div className="related-modal__body">
          <div className="related-modal__selectors">
            <label className="receipt-field">
              <span>Vai trò <b>*</b></span>
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                {personRoles.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {role === "Người nộp" && (
              <label className="receipt-field">
                <span>Loại đối tượng <b>*</b></span>
                <select
                  value={subjectType}
                  onChange={(event) => setSubjectType(event.target.value)}
                >
                  <option value="Không rõ">Không rõ</option>
                  <option value="Cá nhân">Cá nhân</option>
                  <option value="Cơ quan/Tổ chức">Cơ quan/Tổ chức</option>
                </select>
              </label>
            )}

            {role === "Người nộp" && (
              <label className="receipt-checkbox related-modal__primary-check">
                <input
                  type="checkbox"
                  checked={isPrimaryPetitioner}
                  onChange={(event) => setIsPrimaryPetitioner(event.target.checked)}
                />
                Là người đứng đơn
              </label>
            )}
          </div>

          {effectiveSubjectType === "Không rõ" ? (
            <div className="related-modal__unknown">
              Không cần nhập thêm thông tin khi loại đối tượng là “Không rõ”.
            </div>
          ) : effectiveSubjectType === "Cá nhân" ? (
            <div className="related-modal__details">
              <h3>Thông tin cá nhân</h3>
              <div className="receipt-grid">
                <ReceiptField label="Họ và tên" required placeholder="VD: Nguyễn Văn An" />
                <ReceiptField
                  label="Giới tính"
                  placeholder="Chọn giới tính"
                  options={["Nam", "Nữ", "Khác"]}
                />
                <ReceiptField label="Ngày sinh" placeholder="VD: 15/05/1990 hoặc 1990" />
                <div className="receipt-composite-field">
                  <ReceiptField label="CCCD" placeholder="9 hoặc 12 chữ số" />
                  <Button
                    variant="primary"
                    onClick={() => onNotify("Đã tra cứu thông tin cá nhân")}
                  >
                    <Icon name="35a4d" size={14} /> Tra cứu
                  </Button>
                </div>
                <ReceiptField
                  label="Địa chỉ chi tiết"
                  placeholder="Số nhà, đường phố, ngõ ngách..."
                />
                <ReceiptField
                  label="Phường / Xã"
                  placeholder="Vui lòng chọn Tỉnh / Thành phố trước"
                  options={["Phường Ba Đình", "Phường Hoàn Kiếm"]}
                />
                <ReceiptField
                  label="Tỉnh / Thành phố"
                  placeholder="Chọn Tỉnh / Thành phố"
                  options={["Hà Nội", "Hải Phòng", "Đà Nẵng"]}
                />
                <ReceiptField
                  label="Số điện thoại"
                  type="tel"
                  placeholder="Ví dụ: 0901 234 567"
                />
              </div>
            </div>
          ) : (
            <div className="related-modal__details">
              <h3>Thông tin cơ quan/Tổ chức</h3>
              <div className="receipt-grid">
                <ReceiptField
                  label="Tên cơ quan/tổ chức"
                  required
                  placeholder="Nhập tên đầy đủ cơ quan / tổ chức"
                />
                <ReceiptField label="Tên viết tắt" placeholder="VD: ABC Corp, TNHH..." />
                <ReceiptField label="Mã số tổ chức" placeholder="Nhập mã số tổ chức" />
                <div className="receipt-composite-field">
                  <ReceiptField
                    label="Mã số thuế / Mã định danh"
                    placeholder="Nhập MST hoặc mã"
                  />
                  <Button
                    variant="primary"
                    onClick={() => onNotify("Đã tra cứu thông tin tổ chức")}
                  >
                    <Icon name="35a4d" size={14} /> Tra cứu
                  </Button>
                </div>
                <ReceiptField
                  label="Loại hình"
                  placeholder="Chọn loại hình"
                  options={["Cơ quan nhà nước", "Doanh nghiệp", "Tổ chức xã hội"]}
                />
                <ReceiptField
                  label="Lĩnh vực"
                  placeholder="Chọn lĩnh vực"
                  options={["Hành chính", "Pháp luật", "Thương mại", "Giáo dục"]}
                />
                <ReceiptField
                  label="Ngành nghề"
                  placeholder="Nhập ngành nghề kinh doanh / hoạt động"
                />
                <ReceiptField label="Ngày thành lập" type="date" />
                <ReceiptField label="Số điện thoại" type="tel" placeholder="Ví dụ: 024..." />
                <ReceiptField label="Email" placeholder="contact@domain.vn" />
                <ReceiptField
                  label="Tỉnh / Thành phố"
                  placeholder="Chọn Tỉnh / Thành phố"
                  options={["Hà Nội", "Hải Phòng", "Đà Nẵng"]}
                />
                <ReceiptField
                  label="Phường / Xã"
                  placeholder="Vui lòng chọn Tỉnh / Thành phố trước"
                  options={["Phường Ba Đình", "Phường Hoàn Kiếm"]}
                />
                <ReceiptField
                  label="Địa chỉ chi tiết"
                  placeholder="Số nhà, đường phố, ngõ ngách..."
                  className="receipt-field--full"
                />
              </div>
            </div>
          )}
        </div>

        <footer className="related-modal__footer">
          <Button onClick={onClose}>Hủy bỏ</Button>
          <Button
            variant="primary"
            onClick={() =>
              onAdd({
                name:
                  effectiveSubjectType === "Không rõ"
                    ? "Chưa xác định"
                    : effectiveSubjectType === "Cá nhân"
                      ? "Nguyễn Văn An"
                      : "Cơ quan/Tổ chức mới",
                type: effectiveSubjectType,
                id:
                  effectiveSubjectType === "Cá nhân"
                    ? "CCCD: 001090012345"
                    : effectiveSubjectType === "Cơ quan/Tổ chức"
                      ? "MST: 0101234567"
                      : "Chưa có",
                role:
                  role === "Người nộp"
                    ? `${isPrimaryPetitioner ? "Người làm đơn · Người đứng đơn" : "Người nộp"}`
                    : role,
                authorized: false,
                contact:
                  effectiveSubjectType === "Không rõ"
                    ? "—"
                    : effectiveSubjectType === "Cá nhân"
                      ? "0901 234 567"
                      : "024 0000 0000",
                address:
                  effectiveSubjectType === "Không rõ"
                    ? "—"
                    : "Ba Đình, Hà Nội",
                filter:
                  role === "Người nộp"
                    ? "Người nộp"
                    : role === "Người tố giác"
                      ? "Người tố cáo"
                      : role === "Người bị tố giác"
                        ? "Người bị tố cáo"
                        : "Người liên quan",
              })
            }
          >
            Thêm người liên quan
          </Button>
        </footer>
      </section>
    </div>
  )
}

function CaseDocumentPaper() {
  return (
    <article className="case-paper">
      <div className="case-paper__code">FORM_ID: OCR_CRIME_REPORT_2026_01</div>
      <div className="case-paper__masthead">
        <span>Mẫu tố tụng hình sự (Bộ Công an)</span>
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong>
        <b>Độc lập - Tự do - Hạnh phúc</b>
      </div>
      <h2>ĐƠN TỐ GIÁC TỘI PHẠM</h2>
      <p className="case-paper__subtitle">
        (Về hành vi có dấu hiệu “Lừa đảo chiếm đoạt tài sản” qua mạng xã hội)
      </p>
      <p>
        <strong>Kính gửi:</strong> Cơ quan Cảnh sát điều tra - Công an Quận Cầu
        Giấy, TP. Hà Nội
        <br />
        Viện kiểm sát nhân dân Quận Cầu Giấy, TP. Hà Nội
      </p>
      <section>
        <h3>I. THÔNG TIN NGƯỜI TỐ GIÁC (DENOUNCER INFORMATION)</h3>
        <p>
          <b>1. Họ và tên:</b> NGUYỄN THỊ MINH PHƯƠNG
        </p>
        <div className="case-paper__two-columns">
          <p>
            <b>2. Ngày sinh:</b> 24/11/1989
          </p>
          <p>
            <b>3. Giới tính:</b> Nữ
          </p>
          <p>
            <b>4. Số CCCD/CMND:</b> 001189012345
          </p>
          <p>
            <b>5. Ngày cấp:</b> 12/03/2021
          </p>
        </div>
        <p>
          <b>6. Thường trú:</b> Số 45, Đường Xuân Thủy, Phường Dịch Vọng Hậu,
          Quận Cầu Giấy, TP. Hà Nội
        </p>
        <p>
          <b>7. Số điện thoại:</b> 0912 888 999
        </p>
      </section>
      <section>
        <h3>II. THÔNG TIN NGƯỜI BỊ TỐ GIÁC (ACCUSED INFORMATION)</h3>
        <p>
          <b>1. Họ và tên đối tượng:</b> TRẦN VĂN HÙNG (Sử dụng tài khoản “Hùng
          Đầu Tư”)
        </p>
        <div className="case-paper__two-columns">
          <p>
            <b>2. Số CCCD:</b> 036095008765
          </p>
          <p>
            <b>3. Số điện thoại:</b> 0983 123 456
          </p>
        </div>
        <p>
          <b>4. Nơi ở hiện tại:</b> Số 12A, Ngõ 102, Đường Nguyễn Trãi, Quận
          Thanh Xuân, TP. Hà Nội
        </p>
      </section>
      <section>
        <h3>III. NỘI DUNG TỐ GIÁC & THIỆT HẠI</h3>
        <p>
          Vào khoảng thời gian từ ngày 10/08/2026 đến ngày 25/08/2026, đối tượng
          đã dùng thủ đoạn gian dối kêu gọi đầu tư tham gia sàn đầu tư tài chính
          ủy thác trực tuyến. Sau khi tôi chuyển tiền, đối tượng đã khóa tài
          khoản và ngắt liên lạc nhằm chiếm đoạt tài sản.
        </p>
        <p>
          <b>Tổng số tiền bị chiếm đoạt: 250.000.000 VNĐ</b>
        </p>
      </section>
    </article>
  )
}

function DocumentUploadModal({
  fileName,
  folders,
  onClose,
  onSave,
}: {
  fileName: string
  folders: string[]
  onClose: () => void
  onSave: (name: string, folder: string) => void
}) {
  const [documentName, setDocumentName] = useState(fileName)
  const [folder, setFolder] = useState("Hồ sơ ban đầu")
  const [customFolder, setCustomFolder] = useState("")

  return (
    <div className="document-upload-backdrop" role="presentation">
      <section
        className="document-upload-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-upload-title"
      >
        <header>
          <div>
            <h2 id="document-upload-title">Đặt tên tài liệu</h2>
            <p>
              Tệp vừa tải: <strong>{fileName}</strong>
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </header>
        <div className="document-upload-modal__body">
          <label className="receipt-field">
            <span>Tên tài liệu <b>*</b></span>
            <input
              value={documentName}
              onChange={(event) => setDocumentName(event.target.value)}
              autoFocus
            />
          </label>
          <fieldset className="document-folder-picker">
            <legend>Vị trí lưu tài liệu <b>*</b></legend>
            <div className="document-folder-tree">
              <label className="document-folder-tree__option document-folder-tree__outside">
                <input
                  type="radio"
                  name="document-folder"
                  checked={folder === "Ngoài thư mục"}
                  onChange={() => setFolder("Ngoài thư mục")}
                />
                <span className="document-folder-picker__icon">▧</span>
                <span>
                  <strong>Ngoài thư mục</strong>
                  <small>Hiển thị tài liệu trực tiếp tại danh sách gốc</small>
                </span>
              </label>

              <div className="document-folder-tree__root">
                <div className="document-folder-tree__root-label">
                  <span>▾</span>
                  <span className="document-folder-picker__icon">□</span>
                  <strong>Thư mục tài liệu của đơn</strong>
                </div>
                <div className="document-folder-tree__children">
                  <label className="document-folder-tree__option">
                    <input
                      type="radio"
                      name="document-folder"
                      checked={folder === "Hồ sơ ban đầu"}
                      onChange={() => setFolder("Hồ sơ ban đầu")}
                    />
                    <span className="document-folder-picker__icon">□</span>
                    <span>
                      <strong>Hồ sơ ban đầu</strong>
                      <small>Đơn, chứng cứ và tài liệu do người nộp cung cấp</small>
                    </span>
                  </label>
                  <label className="document-folder-tree__option">
                    <input
                      type="radio"
                      name="document-folder"
                      checked={folder === "Văn bản và quyết định xử lý"}
                      onChange={() => setFolder("Văn bản và quyết định xử lý")}
                    />
                    <span className="document-folder-picker__icon">□</span>
                    <span>
                      <strong>Văn bản và quyết định xử lý</strong>
                      <small>Văn bản nghiệp vụ, quyết định và kết quả xử lý</small>
                    </span>
                  </label>
                  {folders.map((folderName) => (
                    <label className="document-folder-tree__option" key={folderName}>
                      <input
                        type="radio"
                        name="document-folder"
                        checked={folder === folderName}
                        onChange={() => setFolder(folderName)}
                      />
                      <span className="document-folder-picker__icon">□</span>
                      <span>
                        <strong>{folderName}</strong>
                        <small>Thư mục nghiệp vụ bổ sung</small>
                      </span>
                    </label>
                  ))}
                  <label className="document-folder-tree__option">
                    <input
                      type="radio"
                      name="document-folder"
                      checked={folder === "Thư mục khác"}
                      onChange={() => setFolder("Thư mục khác")}
                    />
                    <span className="document-folder-picker__icon">＋</span>
                    <span>
                      <strong>Thư mục khác</strong>
                      <small>Tạo một nhánh lưu tài liệu mới</small>
                    </span>
                  </label>
                  {folder === "Thư mục khác" && (
                    <input
                      className="document-folder-picker__custom"
                      value={customFolder}
                      onChange={(event) => setCustomFolder(event.target.value)}
                      placeholder="Nhập tên thư mục..."
                    />
                  )}
                </div>
              </div>
            </div>
          </fieldset>
        </div>
        <footer>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            variant="primary"
            onClick={() =>
              onSave(
                documentName.trim() || fileName,
                folder === "Thư mục khác"
                  ? customFolder.trim() || "Thư mục khác"
                  : folder,
              )
            }
          >
            Lưu tài liệu
          </Button>
        </footer>
      </section>
    </div>
  )
}

export function OfficerCaseDetail({
  task,
  onBack,
  onNotify,
  onStartSigning,
  onOpenSigningHistory,
}: {
  task: WorkCard
  onBack: () => void
  onNotify: (message: string) => void
  onStartSigning: (documents: DocumentRow[]) => void
  onOpenSigningHistory: (task: WorkCard) => void
}) {
  const [activeTab, setActiveTab] = useState("Thông tin chung")
  const [relationshipFilter, setRelationshipFilter] = useState("Tất cả")
  const [caseRelationshipQuery, setCaseRelationshipQuery] = useState("")
  const [casePeople, setCasePeople] =
    useState<CaseRelatedPerson[]>(caseRelatedPeople)
  const [showCaseRelatedModal, setShowCaseRelatedModal] = useState(false)
  const [editingCaseInfo, setEditingCaseInfo] = useState(true)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([])
  const [activeCaseDocumentId, setActiveCaseDocumentId] =
    useState("VB-2026-001")
  const [historyQuery, setHistoryQuery] = useState("")
  const [historyStatus, setHistoryStatus] = useState("")
  const [historyLeader, setHistoryLeader] = useState("")
  const [historyType, setHistoryType] = useState("")
  const [documentGroupMode, setDocumentGroupMode] = useState<"folder" | "date">(
    "folder",
  )
  const [customDocumentFolders, setCustomDocumentFolders] = useState<string[]>(
    [],
  )
  const [showFolderCreator, setShowFolderCreator] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [recallTarget, setRecallTarget] = useState<{
    document: string
    handler: string
    date: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingDocument, setPendingDocument] = useState<File | null>(null)
  const [caseDocuments, setCaseDocuments] = useState<DocumentRow[]>([
    {
      title: "Hợp đồng cung cấp dịch vụ xác minh hồ sơ",
      code: "VB-2026-001",
      request: "Ký",
      date: "05/10/2026",
      flow: "—",
      status: "Chưa trình",
      progress: "Chưa bắt đầu",
      progressValue: 0,
      handler: "—",
      submitter: "Nguyễn Minh Anh",
      department: "Phòng Nghiệp vụ",
    },
    {
      title: "Tờ trình đề xuất hướng xử lý đơn",
      code: "VB-2026-002",
      request: "Duyệt",
      date: "05/10/2026",
      flow: "—",
      status: "Chưa trình",
      progress: "Chưa bắt đầu",
      progressValue: 0,
      handler: "—",
      submitter: "Nguyễn Minh Anh",
      department: "Phòng Nghiệp vụ",
    },
    {
      title: "Báo cáo kết quả kiểm tra ban đầu",
      code: "VB-2026-003",
      request: "Xem",
      date: "04/10/2026",
      flow: "LT-118/2026",
      status: "Đã có hiệu lực",
      progress: "3/3 người",
      progressValue: 100,
      handler: "—",
      submitter: "Nguyễn Minh Anh",
      department: "Phòng Nghiệp vụ",
    },
  ])
  const selectedCaseDocuments = caseDocuments.filter((document) =>
    selectedDocumentIds.includes(document.code),
  )
  const eligibleCaseDocuments = caseDocuments.filter(
    (document) => document.status !== "Đã có hiệu lực",
  )
  const activeCaseDocument =
    caseDocuments.find((document) => document.code === activeCaseDocumentId) ??
    caseDocuments[0]
  const allCaseDocumentsSelected =
    eligibleCaseDocuments.length > 0 &&
    eligibleCaseDocuments.every((document) =>
      selectedDocumentIds.includes(document.code),
    )
  const uploadedFolderNames = caseDocuments
    .map((document) => document.folder)
    .filter(
      (folder): folder is string =>
        Boolean(folder) &&
        folder !== "Ngoài thư mục" &&
        folder !== "Hồ sơ nộp ban đầu" &&
        folder !== "Hồ sơ ban đầu" &&
        folder !== "Văn bản và quyết định xử lý",
    )
  const additionalFolderNames = Array.from(
    new Set([...customDocumentFolders, ...uploadedFolderNames]),
  )
  const groupedCaseDocuments = caseDocuments.reduce<Record<string, DocumentRow[]>>(
    (groups, document) => {
      const normalizedFolder =
        !document.folder || document.folder === "Hồ sơ nộp ban đầu"
          ? "Hồ sơ ban đầu"
          : document.folder
      const groupName =
        documentGroupMode === "folder"
          ? normalizedFolder
          : document.date.split(" ")[0]
      groups[groupName] ??= []
      groups[groupName].push(document)
      return groups
    },
    documentGroupMode === "folder"
      ? Object.fromEntries(
        [
          "Hồ sơ ban đầu",
          "Văn bản và quyết định xử lý",
          ...additionalFolderNames,
        ].map((folder) => [folder, [] as DocumentRow[]]),
      )
      : {},
  )
  const signingHistory = [
    {
      date: "05/10/2026",
      attachments: 2,
      document: "Dự thảo văn bản trả lời công dân Hoàng Văn",
      handler: "Đ/c Nguyễn Minh Khôi",
      role: "Cán bộ thụ lý",
      progress: 0,
      total: 2,
      status: "Đang trình",
      type: "Dự thảo",
    },
    {
      date: "05/10/2026",
      attachments: 2,
      document: "Phiếu yêu cầu xác minh tài sản đất đai",
      handler: "Trung tá Lê Hoàng D.",
      role: "Trưởng phòng QLHC",
      progress: 1,
      total: 3,
      status: "Đang trình",
      type: "Phiếu",
    },
    {
      date: "04/10/2026",
      attachments: 4,
      document: "Tờ trình phê duyệt kết quả xác minh đơn thư",
      handler: "Thiếu tướng Nguyễn Văn A",
      role: "Giám đốc CATP",
      progress: 2,
      total: 3,
      status: "Đang trình",
      type: "Tờ trình",
      proposedBy: "Đại tá Trần Văn B.",
    },
    {
      date: "01/10/2026",
      attachments: 3,
      document: "Dự thảo Báo cáo kết luận sơ bộ về xác minh",
      handler: "Đại tá Trần Văn B.",
      role: "Phó Giám đốc CATP",
      progress: 1,
      total: 3,
      status: "Trả lại",
      type: "Báo cáo",
    },
    {
      date: "01/10/2026",
      attachments: 3,
      document: "Phiếu giao nhiệm vụ cán bộ thanh tra xác minh",
      handler: "Đại tá Trần Văn B.",
      role: "Phó Giám đốc CATP",
      progress: 3,
      total: 3,
      status: "Đã duyệt",
      type: "Phiếu",
    },
    {
      date: "28/09/2026",
      attachments: 4,
      document: "Phiếu chuyển đơn số 142/PC-CATP vụ tranh chấp",
      handler: "Trung tá Phạm Quốc H.",
      role: "Trưởng phòng Tham mưu",
      progress: 2,
      total: 2,
      status: "Đã có hiệu lực",
      type: "Phiếu",
    },
    {
      date: "26/09/2026",
      attachments: 2,
      document: "Tờ trình đề xuất gia hạn thời hiệu xác minh",
      handler: "Thiếu tướng Nguyễn Văn A",
      role: "Giám đốc CATP",
      progress: 3,
      total: 3,
      status: "Đã có hiệu lực",
      type: "Tờ trình",
    },
  ]
  const signingFlowStateByDate = signingHistory.reduce<
    Record<string, (typeof signingHistory)[number]>
  >((flows, item) => {
    flows[item.date] ??= item
    return flows
  }, {})
  const getSigningFlowStatus = (date: string) => {
    const flowState = signingFlowStateByDate[date]
    if (flowState.status === "Trả lại") return "Trả lại"
    if (flowState.progress >= flowState.total) return "Đã hoàn thành"
    return flowState.status
  }
  const filteredSigningHistory = signingHistory.filter((item) => {
    const matchesQuery = `${item.document} ${item.handler} ${item.role}`
      .toLowerCase()
      .includes(historyQuery.toLowerCase())
    const matchesStatus =
      !historyStatus || getSigningFlowStatus(item.date) === historyStatus
    const matchesLeader = !historyLeader || item.handler === historyLeader.split(" - ")[0]
    return matchesQuery && matchesStatus && matchesLeader
  })
  const groupedSigningHistory =
    filteredSigningHistory.reduce<Record<string, typeof filteredSigningHistory>>(
      (groups, item) => {
        groups[item.date] ??= []
        groups[item.date].push(item)
        return groups
      },
      {},
    )
  const tabs = [
    "Thông tin chung",
    "Mối liên hệ",
    "Đơn ghép",
    "Hồ sơ & Văn bản",
    "Lịch sử trình ký",
    "Quy trình",
  ]

  function chooseDocument() {
    fileInputRef.current?.click()
  }

  function addDocumentFolder() {
    const folderName = newFolderName.trim()
    if (!folderName || additionalFolderNames.includes(folderName)) return
    setCustomDocumentFolders((current) => [...current, folderName])
    setNewFolderName("")
    setShowFolderCreator(false)
    setDocumentGroupMode("folder")
  }

  function saveUploadedDocument(name: string, folder: string) {
    const code = `TL-${String(caseDocuments.length + 1).padStart(3, "0")}`
    const uploadedDocument: DocumentRow = {
      title: name,
      code,
      request: "Xem",
      date: "12/10/2026",
      flow: "—",
      status: "Chưa trình",
      progress: "Chưa bắt đầu",
      progressValue: 0,
      handler: "—",
      submitter: "Nguyễn Minh Anh",
      department: "Phòng Nghiệp vụ",
      folder,
    }
    setCaseDocuments((current) => [...current, uploadedDocument])
    setActiveCaseDocumentId(code)
    setPendingDocument(null)
    setActiveTab("Hồ sơ & Văn bản")
    onNotify(`Đã thêm tài liệu vào ${folder}`)
  }

  return (
    <main className="page officer-case-page">
      <input
        ref={fileInputRef}
        className="case-document-file-input"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) setPendingDocument(file)
          event.target.value = ""
        }}
      />
      <header className="case-header">
        <div className="case-breadcrumbs">
          <button type="button" onClick={onBack}>
            ← Quay lại
          </button>
          <span>/</span>
          <button type="button" onClick={onBack}>
            Công việc của tôi
          </button>
          <span>/</span>
          <strong>Hồ sơ đơn</strong>
        </div>
        <div className="case-header__main">
          <div>
            <div className="case-title">
              <h1>Đơn {task.id}-GOVEX</h1>
              <span>Đang xử lý</span>
            </div>
            <p>
              Người nộp: <strong>{task.submitter}</strong>
              <i>·</i>
              Nộp ngày: <strong>02/10/2026 14:54:30</strong>
            </p>
          </div>
          <Button variant="primary" onClick={chooseDocument}>
            ＋ Thêm tài liệu
          </Button>
        </div>
      </header>

      <nav className="case-tabs" aria-label="Điều hướng hồ sơ">
        {tabs.map((tab) => (
          <button
            className={tab === activeTab ? "is-active" : ""}
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === "Hồ sơ & Văn bản" && <span>{caseDocuments.length}</span>}
          </button>
        ))}
      </nav>

      {activeTab === "Thông tin chung" ? (
        <div className="case-general-page">
          <section className="case-general-card case-document-actions">
            <strong>Cần ban hành văn bản</strong>
            <p>
              Bước <b>Kiểm tra ban đầu &amp; xác định hướng xử lý</b> cần ban hành:
              Phiếu đề xuất hướng xử lý, Phiếu thông báo chuyển thẩm quyền,
              Thông báo không thụ lý, Thông báo trả lại đơn.
            </p>
            <div>
              {[
                "Soạn Phiếu đề xuất hướng xử lý",
                "Soạn Phiếu thông báo chuyển thẩm quyền",
                "Soạn Thông báo không thụ lý",
                "Soạn Thông báo trả lại đơn",
              ].map((label) => (
                <Button
                  variant="primary"
                  onClick={() => onNotify(`Đã mở ${label.toLowerCase()}`)}
                  key={label}
                >
                  <Icon name="98e38" size={16} /> {label}
                </Button>
              ))}
            </div>
            <Button onClick={() => onNotify("Đã mở thư viện biểu mẫu")}>
              <Icon name="b0f54" size={14} /> Chọn biểu mẫu khác
            </Button>
          </section>

          <section className="case-general-card case-related-section">
            <header>
              <div>
                <strong>1. Người nộp &amp; người liên quan</strong>
                <small>{casePeople.length} người, cơ quan, tổ chức</small>
              </div>
              <div className="case-related-header-actions">
                <Button variant="ghost">Sơ đồ mối liên hệ</Button>
                <Button
                  variant="primary"
                  onClick={() => setShowCaseRelatedModal(true)}
                >
                  <Icon name="b0f54" size={14} /> Thêm người liên quan
                </Button>
              </div>
            </header>
            <div className="case-create-related-toolbar">
              <label>
                <Icon name="2a3f5" size={16} />
                <input
                  value={caseRelationshipQuery}
                  onChange={(event) => setCaseRelationshipQuery(event.target.value)}
                  placeholder="Tìm tên, CCCD, SĐT..."
                />
              </label>
              <div className="case-related-filters">
                {["Tất cả", "Người nộp", "Người tố cáo", "Người bị tố cáo", "Cá nhân, Cơ quan/tổ chức liên quan"].map(
                  (filter) => (
                    <button
                      className={relationshipFilter === filter ? "is-active" : ""}
                      type="button"
                      onClick={() => setRelationshipFilter(filter)}
                      key={filter}
                    >
                      {filter}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="case-related-table">
              <div className="case-related-table__head">
                <span>#</span>
                <span>Họ tên / Tổ chức</span>
                <span>CCCD / Mã số thuế</span>
                <span>Vai trò</span>
                <span>Người ủy quyền</span>
                <span>Liên hệ</span>
                <span>Địa chỉ</span>
                <span>Thao tác</span>
              </div>
              {casePeople
                .filter(
                  (person) =>
                    (relationshipFilter === "Tất cả" ||
                      person.filter === relationshipFilter ||
                      (relationshipFilter === "Cá nhân, Cơ quan/tổ chức liên quan" &&
                        person.filter === "Người liên quan")) &&
                    `${person.name} ${person.id} ${person.contact}`
                      .toLowerCase()
                      .includes(caseRelationshipQuery.toLowerCase()),
                )
                .map((person, index) => (
                  <div className="case-related-table__row" key={person.name}>
                    <span>{index + 1}</span>
                    <span>
                      <strong>{person.name}</strong>
                      <small>{person.type}</small>
                    </span>
                    <span>{person.id}</span>
                    <span>{person.role}</span>
                    <span>{person.authorized ? "✓" : "□"}</span>
                    <span>{person.contact}</span>
                    <span>{person.address}</span>
                    <Button variant="ghost">Xem chi tiết</Button>
                  </div>
                ))}
            </div>
          </section>

          <section className="case-general-card case-information-form">
            <header>
              <strong>2. Thông tin đơn</strong>
              <div>
                {editingCaseInfo && (
                  <Button onClick={() => setEditingCaseInfo(false)}>Hủy</Button>
                )}
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingCaseInfo((current) => !current)
                    if (editingCaseInfo) onNotify("Đã lưu thay đổi thông tin đơn")
                  }}
                >
                  {editingCaseInfo ? "✓ Lưu thay đổi" : "Chỉnh sửa"}
                </Button>
              </div>
            </header>
            <div className="case-information-grid">
              <ReceiptField
                label="Loại đơn"
                required
                value="Đơn tố cáo trong tố tụng hình sự"
                options={["Đơn tố cáo trong tố tụng hình sự", "Đơn khiếu nại"]}
              />
              <ReceiptField label="Ngày nhận đơn" type="date" value="2026-10-09" />
              <ReceiptField
                label="Hình thức nhận"
                value="Trực tiếp"
                options={["Trực tiếp", "Bưu chính", "Trực tuyến"]}
              />
              <ReceiptField label="Ngày làm đơn" type="date" value="2026-09-30" />
              <ReceiptField
                label="Lĩnh vực"
                required
                value="Hình sự"
                options={["Hình sự", "Dân sự", "Hành chính"]}
              />
              <ReceiptField label="Nhóm nội dung chính" value="Tố tụng hình sự - Tạm giữ vật chứng" />
              <ReceiptField
                label="Địa điểm làm đơn"
                placeholder="Nhập địa điểm làm đơn (quận/huyện, tỉnh/thành)..."
                className="case-information-grid__wide"
              />
            </div>
            <label>
              <span>Nội dung chính <b>*</b></span>
              <textarea
                defaultValue="Người tố cáo đề nghị cơ quan có thẩm quyền kiểm tra việc tiếp nhận, lập biên bản, niêm phong và quản lý thiết bị điện thoại tại thời điểm giao nhận ngày 08/09/2026 để xác định quá trình xử lý có đúng quy định hay không."
                readOnly={!editingCaseInfo}
              />
            </label>
            <label>
              <span>Yêu cầu trong đơn</span>
              <textarea
                placeholder="Nhập yêu cầu cụ thể của công dân..."
                readOnly={!editingCaseInfo}
              />
            </label>
            <label>
              <span>Tài sản, hiện trạng liên quan</span>
              <textarea
                defaultValue="Điện thoại di động màu đen"
                readOnly={!editingCaseInfo}
              />
            </label>
          </section>
        </div>
      ) : activeTab === "Hồ sơ & Văn bản" ? (
        <div className="case-documents-split">
          <section className="case-document-preview">
            <header>{activeCaseDocument.title}</header>
            <div className="case-editor-toolbar">
              <strong>ONLYOFFICE</strong>
              <span>Tệp</span>
              <span>Xem</span>
              <span>Plugin</span>
              <span>AI</span>
              <div>
                <button type="button" aria-label="In tài liệu">
                  ▣
                </button>
                <button type="button" aria-label="Tải xuống">
                  ↓
                </button>
                <button type="button" aria-label="Tìm kiếm">
                  ⌕
                </button>
                <b>NA</b>
              </div>
            </div>
            <div className="case-document-preview__body">
              <aside className="case-editor-rail">
                <span>⌕</span>
                <span>▤</span>
                <span>▥</span>
                <span>☷</span>
                <span>ⓘ</span>
              </aside>
              <div className="case-document-preview__canvas">
                <CaseDocumentPaper />
              </div>
            </div>
            <footer>
              <span>Trang 1 trên 2</span>
              <span>Word count</span>
              <span>Thu phóng 70% ＋</span>
            </footer>
          </section>

          <aside className="case-document-list">
            <div className="case-document-viewbar">
              <span>Nhóm danh sách:</span>
              <div>
                <button
                  className={documentGroupMode === "folder" ? "is-active" : ""}
                  type="button"
                  onClick={() => setDocumentGroupMode("folder")}
                >
                  Theo thư mục
                </button>
                <button
                  className={documentGroupMode === "date" ? "is-active" : ""}
                  type="button"
                  onClick={() => setDocumentGroupMode("date")}
                >
                  Theo ngày tải
                </button>
                <button
                  className="case-document-add-folder"
                  type="button"
                  onClick={() => {
                    setShowFolderCreator(true)
                    setDocumentGroupMode("folder")
                  }}
                >
                  ＋ Thêm thư mục
                </button>
              </div>
            </div>

            {selectedCaseDocuments.length > 0 && (
              <div className="case-documents-selection">
                <strong>Đã chọn {selectedCaseDocuments.length} văn bản</strong>
                <button
                  type="button"
                  onClick={() => setSelectedDocumentIds([])}
                >
                  Bỏ chọn
                </button>
                <Button
                  variant="primary"
                  className="case-sign-button"
                  onClick={() => onStartSigning(selectedCaseDocuments)}
                >
                  Trình ký
                </Button>
              </div>
            )}

            <div className="case-document-cards">
              {showFolderCreator && (
                <div className="case-document-folder-creator">
                  <input
                    value={newFolderName}
                    onChange={(event) => setNewFolderName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addDocumentFolder()
                    }}
                    placeholder="Tên thư mục mới..."
                    autoFocus
                  />
                  <Button variant="primary" onClick={addDocumentFolder}>
                    Thêm
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowFolderCreator(false)
                      setNewFolderName("")
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              )}
              <div className="case-document-tree-root">
                <div className="case-document-tree-root__label">
                  <span>▾</span>
                  <strong>
                    {documentGroupMode === "folder"
                      ? "Thư mục tài liệu"
                      : "Tài liệu theo ngày tải"}
                  </strong>
                  <small>{caseDocuments.length} tài liệu</small>
                </div>
                {Object.entries(groupedCaseDocuments).map(([groupName, group]) => (
                  <section className="case-document-group" key={groupName}>
                    <header>
                      <span>{documentGroupMode === "folder" ? "□" : "▦"}</span>
                      <strong>
                        {documentGroupMode === "date"
                          ? groupName === "05/10/2026"
                            ? <>Ngày&nbsp;&nbsp;{groupName}</>
                            : groupName === "04/10/2026"
                              ? `Ngày ${groupName}`
                              : `Ngày tải ${groupName}`
                          : groupName}
                      </strong>
                      <small>{group.length} tài liệu</small>
                    </header>
                    <div>
                      {group.map((document) => {
                        const isEffective = document.status === "Đã có hiệu lực"
                        return (
                          <div
                            className={`case-document-card ${activeCaseDocument.code === document.code
                              ? "is-active"
                              : ""
                              }`}
                            key={document.code}
                            onClick={() => setActiveCaseDocumentId(document.code)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedDocumentIds.includes(document.code)}
                              disabled={isEffective}
                              onClick={(event) => event.stopPropagation()}
                              onChange={() =>
                                setSelectedDocumentIds((current) =>
                                  current.includes(document.code)
                                    ? current.filter((id) => id !== document.code)
                                    : [...current, document.code],
                                )
                              }
                              aria-label={`Chọn ${document.title}`}
                            />
                            <span className="case-document-card__icon">PDF</span>
                            <div>
                              <strong>{document.title}</strong>
                              <small>
                                {document.code} · {document.date}
                                {documentGroupMode === "date" && document.folder
                                  ? ` · ${document.folder}`
                                  : ""}
                              </small>
                              <div>
                                <span>Yêu cầu: {document.request}</span>
                                <StatusBadge status={document.status} />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
            <footer>
              <span>
                Văn bản đã ký số được khóa chọn và hiển thị trạng thái Đã có
                hiệu lực.
              </span>
            </footer>
          </aside>
        </div>
      ) : activeTab === "Lịch sử trình ký" ? (
        <section className="case-signing-history">
          <header>
            <h2>Trình ký văn bản</h2>
            <Button onClick={() => onNotify("Đã tải lại lịch sử trình ký")}>
              Tải lại
            </Button>
          </header>

          <div className="signing-history-filters">
            <div className="signing-history-filter-row" style={{ marginTop: 0 }}>
              <label className="signing-history-searchbox" style={{ width: '320px', flex: 'none', margin: 0 }}>
                <Icon name="1c586" />
                <input
                  value={historyQuery}
                  onChange={(event) => setHistoryQuery(event.target.value)}
                  placeholder="Tìm tên văn bản, người thụ lý..."
                />
                <kbd>Ctrl + K</kbd>
              </label>
              <input
                type="date"
                aria-label="Ngày trình"
                className="signing-history-datepicker"
                defaultValue="2026-10-01"
                title="Ngày trình"
              />
              <select
                value={historyStatus}
                onChange={(event) => setHistoryStatus(event.target.value)}
                aria-label="Trạng thái"
              >
                <option value="">Trạng thái: Tất cả</option>
                <option value="Đang trình">Đang trình</option>
                <option value="Trả lại">Trả lại</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
              </select>
              <select
                value={historyLeader}
                onChange={(event) => setHistoryLeader(event.target.value)}
                aria-label="Lãnh đạo"
              >
                <option value="">Lãnh đạo: Tất cả chỉ huy</option>
                <option value="Trung tá Lê Hoàng D.">
                  Trung tá Lê Hoàng D. - Trưởng phòng QLHC
                </option>
                <option value="Thiếu tướng Nguyễn Văn A">
                  Thiếu tướng Nguyễn Văn A - Giám đốc CATP
                </option>
                <option value="Đại tá Trần Văn B.">
                  Đại tá Trần Văn B. - Phó Giám đốc CATP
                </option>
                <option value="Trung tá Phạm Quốc H.">
                  Trung tá Phạm Quốc H. - Trưởng phòng Tham mưu
                </option>
              </select>
              <Button
                variant="ghost"
                onClick={() => {
                  setHistoryQuery("")
                  setHistoryStatus("")
                  setHistoryLeader("")
                }}
              >
                Xóa bộ lọc
              </Button>
              <span className="signing-history-total">
                Tổng cộng: <strong>18 văn bản</strong> / 5 ngày trình
              </span>
            </div>
          </div>

          <div className="signing-history-table-wrap">
            <table className="signing-history-table">
              <thead>
                <tr>
                  <th>NGÀY</th>
                  <th>VĂN BẢN</th>
                  <th>ĐANG TRÌNH ĐẾN</th>
                  <th>TIẾN ĐỘ</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedSigningHistory).flatMap(
                  ([date, items]) =>
                    items.map((item, index) => {
                      const flowState = signingFlowStateByDate[date]
                      const flowStatus = getSigningFlowStatus(date)
                      return (
                        <tr key={`${date}-${item.document}`}>
                          {index === 0 && (
                            <td
                              rowSpan={items.length}
                              className="signing-date-cell"
                            >
                              <strong>{date}</strong>
                              <small>{item.attachments} đính kèm</small>
                            </td>
                          )}
                          <td>
                            <strong className="signing-history-document">
                              {item.document}
                            </strong>
                            {item.proposedBy && (
                              <div className="signing-proposed-hint">
                                <Icon name="a8605" size={12} />
                                <span>Gợi ý xử lý trước từ <strong>{item.proposedBy}</strong></span>
                              </div>
                            )}
                          </td>
                          <td>
                            <strong className="signing-handler">
                              {item.handler}
                            </strong>
                            <small>{item.role}</small>
                          </td>
                          <td>
                            <div
                              className={`signing-progress-copy ${flowState.status === "Trả lại"
                                ? "is-returned"
                                : ""
                                }`}
                            >
                              {flowState.progress}/{flowState.total} người
                              {flowState.status === "Trả lại"
                                ? " - Trả lại"
                                : ""}
                            </div>
                            <div className="signing-progress-bars">
                              {Array.from(
                                { length: flowState.total },
                                (_, progressIndex) => (
                                  <span
                                    className={
                                      progressIndex < flowState.progress
                                        ? flowState.status === "Trả lại"
                                          ? "is-returned"
                                          : "is-done"
                                        : ""
                                    }
                                    key={progressIndex}
                                  />
                                ),
                              )}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`signing-result ${flowStatus === "Trả lại"
                                ? "is-returned"
                                : flowStatus === "Đang trình"
                                  ? "is-processing"
                                  : ""
                                }`}
                            >
                              {flowStatus}
                            </span>
                          </td>
                          <td>
                            <div className="signing-history-actions">
                              <Button
                                variant="ghost"
                                className="signing-history-view"
                                onClick={() =>
                                  onOpenSigningHistory({
                                    id: `LS-${item.date.replace(/\//g, "")}`,
                                    type: item.type,
                                    title: item.document,
                                    description: `${item.handler} · ${item.role}`,
                                    submitter: "Nguyễn Minh Anh",
                                    date: item.date,
                                    files: item.attachments,
                                    requirement: "Duyệt",
                                  })
                                }
                                ariaLabel={`Xem ${item.document}`}
                              >
                                <Icon name="8d024" size={14} />
                              </Button>
                              {flowState.status === "Đang trình" &&
                                flowState.progress === 0 && (
                                  <Button
                                    variant="ghost"
                                    className="signing-history-recall"
                                    onClick={() =>
                                      setRecallTarget({
                                        document: item.document,
                                        handler: item.handler,
                                        date: item.date,
                                      })
                                    }
                                  >
                                    Thu hồi
                                  </Button>
                                )}
                            </div>
                          </td>
                        </tr>
                      )
                    }),
                )}
              </tbody>
            </table>
            {!filteredSigningHistory.length && (
              <div className="signing-history-empty">
                Không tìm thấy văn bản phù hợp.
              </div>
            )}
          </div>

          <footer className="signing-history-pagination">
            <span>Hiển thị 1 - 7 trong tổng số 18 văn bản trình ký</span>
            <div>
              <span>Hiển thị:</span>
              <select aria-label="Số văn bản mỗi trang">
                <option>20 văn bản / trang</option>
              </select>
              <button type="button">‹</button>
              <button className="is-current" type="button">
                1
              </button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">›</button>
            </div>
          </footer>
        </section>
      ) : (
        <div className="case-tab-placeholder">
          <strong>{activeTab}</strong>
          <p>Chưa có dữ liệu trong mục này.</p>
        </div>
      )}
      {recallTarget && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal return-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recall-modal-title"
          >
            <header className="modal__header">
              <span className="modal__icon">↩</span>
              <div>
                <strong id="recall-modal-title">
                  Xác nhận thu hồi lượt trình
                </strong>
                <p>Ngày trình: {recallTarget.date}</p>
              </div>
              <Button
                variant="ghost"
                className="modal__close"
                onClick={() => setRecallTarget(null)}
                ariaLabel="Đóng"
              >
                ×
              </Button>
            </header>
            <div className="confirmation-modal__body">
              <p>
                Bạn có chắc chắn muốn thu hồi lượt trình của văn bản này không?
              </p>
              <strong>{recallTarget.document}</strong>
              <span>Đang trình đến: {recallTarget.handler}</span>
            </div>
            <footer className="modal__footer">
              <Button onClick={() => setRecallTarget(null)}>Hủy</Button>
              <Button
                variant="primary"
                onClick={() => {
                  onNotify(`Đã thu hồi lượt trình: ${recallTarget.document}`)
                  setRecallTarget(null)
                }}
              >
                Xác nhận thu hồi
              </Button>
            </footer>
          </section>
        </div>
      )}
      {showCaseRelatedModal && (
        <RelatedPersonModal
          onClose={() => setShowCaseRelatedModal(false)}
          onNotify={onNotify}
          onAdd={(person) => {
            setCasePeople((current) => [...current, person])
            setShowCaseRelatedModal(false)
            onNotify("Đã thêm người liên quan")
          }}
        />
      )}
      {pendingDocument && (
        <DocumentUploadModal
          fileName={pendingDocument.name}
          folders={additionalFolderNames}
          onClose={() => setPendingDocument(null)}
          onSave={saveUploadedDocument}
        />
      )}
    </main>
  )
}

export function ListView({
  data,
  onOpenDetail,
  onAddDocument,
  onStartFlow,
  onNotify,
}: {
  data: DocumentRow[]
  onOpenDetail: (doc: DocumentRow) => void
  onAddDocument: () => void
  onStartFlow: (documents: DocumentRow[]) => void
  onNotify: (message: string) => void
}) {
  const [draftQuery, setDraftQuery] = useState("")
  const [query, setQuery] = useState("")
  const [request, setRequest] = useState("")
  const [status, setStatus] = useState("")
  const [handler, setHandler] = useState("")
  const [submitter, setSubmitter] = useState("")
  const [time, setTime] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const filtered = useMemo(
    () =>
      data
        .filter((doc) => {
          const matchesQuery = `${doc.title} ${doc.code}`
            .toLowerCase()
            .includes(query.toLowerCase())
          const matchesRequest = !request || doc.request === request
          const matchesStatus = !status || doc.status === status
          const matchesHandler = !handler || doc.handler === handler
          const matchesSubmitter = !submitter || doc.submitter === submitter
          const matchesTime =
            !time ||
            (time === "Hôm nay"
              ? doc.date.includes("02/10/2026")
              : !doc.date.includes("02/10/2026"))
          return (
            matchesQuery &&
            matchesRequest &&
            matchesStatus &&
            matchesHandler &&
            matchesSubmitter &&
            matchesTime
          )
        })
        .sort((first, second) => {
          const priority: Record<string, number> = {
            "Đang soạn": 0,
            "Chưa trình": 1,
          }
          return (priority[first.status] ?? 2) - (priority[second.status] ?? 2)
        }),
    [data, handler, query, request, status, submitter, time],
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  const selectedDocuments = data.filter(
    (document) =>
      document.status === "Chưa trình" && selectedIds.includes(document.code),
  )
  const visibleEligible = visible.filter(
    (document) => document.status === "Chưa trình",
  )
  const allVisibleEligibleSelected =
    visibleEligible.length > 0 &&
    visibleEligible.every((document) => selectedIds.includes(document.code))

  function toggleDocument(document: DocumentRow) {
    if (document.status !== "Chưa trình") return
    setSelectedIds((current) =>
      current.includes(document.code)
        ? current.filter((id) => id !== document.code)
        : [...current, document.code],
    )
  }

  function toggleVisibleEligible() {
    setSelectedIds((current) => {
      const visibleIds = visibleEligible.map((document) => document.code)
      if (allVisibleEligibleSelected) {
        return current.filter((id) => !visibleIds.includes(id))
      }
      return Array.from(new Set([...current, ...visibleIds]))
    })
  }

  function clearFilters() {
    setDraftQuery("")
    setQuery("")
    setRequest("")
    setStatus("")
    setHandler("")
    setSubmitter("")
    setTime("")
    setPage(1)
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Quản lý văn bản</h1>
          <p>
            Quản lý và theo dõi các văn bản được tạo, mang đi trình ký và xử lý
            trong toàn đơn vị
          </p>
        </div>
        <div className="header-actions">
          <Button onClick={() => onNotify("Đã xuất danh sách văn bản mẫu")}>
            <Icon name="62e6c" /> Xuất Excel
          </Button>
          <Button variant="primary" onClick={onAddDocument}>
            <span className="plus">＋</span> Thêm văn bản
          </Button>
        </div>
      </header>

      <section className="content">
        <div className="filters">
          <label className="search-field">
            <Icon name="20062" />
            <input
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setQuery(draftQuery)
                  setPage(1)
                }
              }}
              placeholder="Tìm theo tên văn bản, số/ký hiệu..."
            />
          </label>
          <FilterSelect
            label="Yêu cầu xử lý"
            value={request}
            onChange={(value) => {
              setRequest(value)
              setPage(1)
            }}
            options={["Ký", "Duyệt", "Xem"]}
          />
          <FilterSelect
            label="Trạng thái"
            value={status}
            onChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
            options={managementStatusOptions}
          />
          <FilterSelect
            label="Người đang xử lý"
            value={handler}
            onChange={(value) => {
              setHandler(value)
              setPage(1)
            }}
            options={Array.from(
              new Set(
                data.map((doc) => doc.handler).filter((name) => name !== "—"),
              ),
            )}
          />
          <FilterSelect
            label="Người trình"
            value={submitter}
            onChange={(value) => {
              setSubmitter(value)
              setPage(1)
            }}
            options={Array.from(new Set(data.map((doc) => doc.submitter)))}
          />
          <FilterSelect
            label="Thời gian"
            value={time}
            onChange={(value) => {
              setTime(value)
              setPage(1)
            }}
            options={["Hôm nay", "Trước hôm nay"]}
          />
          <Button
            variant="primary"
            className="search-button"
            onClick={() => {
              setQuery(draftQuery)
              setPage(1)
            }}
          >
            <Icon name="35a4d" /> Tìm kiếm
          </Button>
          <Button variant="ghost" onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
        </div>

        <div className="table-shell">
          {selectedDocuments.length > 0 && (
            <div className="bulk-action-bar">
              <div>
                <strong>Đã chọn {selectedDocuments.length} văn bản</strong>
                <span>Chỉ các văn bản Chưa trình được đưa vào lượt trình.</span>
              </div>
              <div>
                <Button variant="ghost" onClick={() => setSelectedIds([])}>
                  Bỏ chọn
                </Button>
                <Button
                  variant="primary"
                  onClick={() => onStartFlow(selectedDocuments)}
                >
                  Mang đi trình ký
                </Button>
              </div>
            </div>
          )}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th className="selection-column">
                    <input
                      type="checkbox"
                      checked={allVisibleEligibleSelected}
                      onChange={toggleVisibleEligible}
                      aria-label="Chọn tất cả văn bản đủ điều kiện trên trang"
                    />
                  </th>
                  <th className="doc-column">VĂN BẢN</th>
                  <th>YÊU CẦU</th>
                  <th>NGÀY TRÌNH</th>
                  <th>TRẠNG THÁI</th>
                  <th>TIẾN ĐỘ</th>
                  <th>ĐANG XỬ LÝ BỞI</th>
                  <th>NGƯỜI TRÌNH</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((doc) => (
                  <tr key={doc.title}>
                    <td className="selection-cell">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(doc.code)}
                        disabled={doc.status !== "Chưa trình"}
                        onChange={() => toggleDocument(doc)}
                        aria-label={`Chọn ${doc.title}`}
                        title={
                          doc.status === "Chưa trình"
                            ? "Chọn văn bản để mang đi trình ký"
                            : "Văn bản đã được đưa vào quy trình"
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="document-link"
                        type="button"
                        onClick={() => onOpenDetail(doc)}
                      >
                        {doc.title}
                      </button>
                      <small>{doc.code} · Tạo lúc: 02/10/2026 08:36</small>
                    </td>
                    <td>
                      <span
                        className={`request request--${doc.request.toLowerCase()}`}
                      >
                        {doc.request}
                      </span>
                    </td>
                    <td
                      className={
                        doc.date === "Chưa trình" ? "muted italic" : ""
                      }
                    >
                      {doc.date}
                    </td>
                    <td>
                      <StatusBadge status={doc.status} />
                    </td>
                    <td>
                      <div className="progress-copy">
                        {getDocumentProgress(doc).label}
                      </div>
                      {doc.status !== "Chưa trình" &&
                        doc.status !== "Đang soạn" && (
                          <span className="progress">
                            <span
                              style={{
                                width: `${getDocumentProgress(doc).value}%`,
                              }}
                            />
                          </span>
                        )}
                    </td>
                    <td>
                      <div className="person">{doc.handler}</div>
                      {doc.role && <small>{doc.role}</small>}
                    </td>
                    <td>
                      <div className="person">{doc.submitter}</div>
                      <small>{doc.department}</small>
                    </td>
                    <td>
                      <button
                        className="row-action"
                        type="button"
                        aria-label={`Xem ${doc.title}`}
                        onClick={() => onOpenDetail(doc)}
                      >
                        <Icon name="8d024" />
                        <span>•••</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="table-footer">
            <span>
              Hiển thị {filtered.length ? (safePage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(safePage * pageSize, filtered.length)} của{" "}
              {filtered.length} văn bản
            </span>
            <div className="pagination">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, safePage - 1))}
              >
                ‹
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    className={pageNumber === safePage ? "is-current" : ""}
                    type="button"
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => setPage(Math.min(pageCount, safePage + 1))}
              >
                ›
              </button>
              <select
                className="page-size"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
                  setPage(1)
                }}
                aria-label="Số văn bản mỗi trang"
              >
                <option value={5}>5 / trang</option>
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
              </select>
            </div>
          </footer>
        </div>
      </section>
    </main>
  )
}

function DocumentPaper({ document }: { document: DocumentRow }) {
  return (
    <article className="paper">
      <div className="paper__masthead">
        <div>
          <strong>ỦY BAN NHÂN DÂN QUẬN 1</strong>
          <strong>PHÒNG TÀI NGUYÊN VÀ MÔI TRƯỜNG</strong>
          <span>Số: {document.code}</span>
        </div>
        <div>
          <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong>
          <strong>Độc lập - Tự do - Hạnh phúc</strong>
          <em>Hà Nội, ngày 02 tháng 10 năm 2026</em>
        </div>
      </div>
      <h2>{document.title.toUpperCase()}</h2>
      <p className="paper__subtitle">
        (V/v: Giải quyết đơn tố cáo vi phạm quản lý và sử dụng đất đai)
      </p>
      <p>
        <strong>Kính gửi:</strong>
      </p>
      <p className="paper__indent">
        Trưởng phòng Tài nguyên và Môi trường;
        <br />
        Phó Giám đốc phụ trách khối Đô thị - Xây dựng;
        <br />
        Giám đốc Ban Quản lý tiếp công dân & giải quyết khiếu nại.
      </p>
      <p>
        Căn cứ Luật Khiếu nại số 02/2011/QH13 và Luật Tố cáo số 25/2018/QH14
        được Quốc hội ban hành; Căn cứ Quy chế tiếp nhận, phân loại và giải
        quyết đơn thư khiếu nại, tố cáo ban hành kèm Quyết định số 1428/QĐ-UBND
        ngày 12/07/2026.
      </p>
      <p>
        Phòng Tài nguyên và Môi trường đã tiếp nhận Đơn tố cáo của công dân{" "}
        <strong>NGUYỄN HOÀNG LONG</strong>. Sau khi rà soát hồ sơ, tài liệu,
        nhận thấy nội dung thuộc thẩm quyền xử lý của đơn vị.
      </p>
      <h3>I. KẾT QUẢ XÁC MINH BAN ĐẦU</h3>
      <p>
        Qua đối chiếu hồ sơ địa chính lưu trữ tại cơ quan và các tài liệu kèm
        theo, nội dung phản ánh cần được tiếp tục xác minh để bảo đảm khách
        quan, đúng trình tự pháp luật.
      </p>
      <h3>II. ĐỀ XUẤT PHƯƠNG ÁN XỬ LÝ</h3>
      <p>
        Đề nghị giao cho tổ nghiệp vụ chuyên môn chủ trì, phối hợp các đơn vị
        liên quan kiểm tra, xác minh và báo cáo kết quả trong thời hạn quy định.
      </p>
      <p>Kính trình Ban Lãnh đạo xem xét, ký duyệt.</p>
      <div className="paper__signatures">
        <div>
          <strong>NGƯỜI ĐỀ XUẤT</strong>
          <span>(Ký và ghi rõ họ tên)</span>
          <b>Trần Thị B</b>
          <small>Chuyên viên thụ lý hồ sơ</small>
        </div>
        <div>
          <strong>PHÊ DUYỆT CỦA LÃNH ĐẠO</strong>
          <span>(Ký số / Chữ ký điện tử)</span>
          <div className="digital-sign">
            <b>✓ KÝ DUYỆT ĐIỆN TỬ</b>
            <small>Người ký: Nguyễn Văn B</small>
            <small>Chức vụ: Phó Giám đốc Sở</small>
            <small>Thời gian: Đang chờ xử lý</small>
          </div>
        </div>
      </div>
    </article>
  )
}

export function DetailView({
  document,
  onBack,
  onEditFlow,
  onNotify,
}: {
  document: DocumentRow
  onBack: () => void
  onEditFlow: () => void
  onNotify: (message: string) => void
}) {
  return (
    <main className="page detail-page">
      <header className="detail-header">
        <div className="breadcrumbs">
          <button type="button" onClick={onBack}>
            Quản lý văn bản
          </button>
          <span>/</span>
          <span>{document.flow}</span>
          <span>/</span>
          <strong>{document.title}</strong>
        </div>
        <div className="detail-title">
          <div>
            <h1>Chi tiết văn bản</h1>
            <span className="id-badge">Mã hồ sơ: {document.flow}</span>
          </div>
          <div className="header-actions">
            <span className="role-badge">
              <i /> Role: Cán bộ (Staff View)
            </span>
            <Button onClick={onEditFlow}>Xem lượt trình</Button>
            <Button variant="ghost">⋮</Button>
          </div>
        </div>
      </header>

      <div className="workspace">
        <section className="document-list">
          <div className="panel-title">
            <strong>VĂN BẢN TRONG LƯỢT TRÌNH</strong>
            <span>3</span>
          </div>
          <label className="search-field compact">
            <Icon name="4d108" />
            <input placeholder="Tìm theo tên văn bản..." />
          </label>
          <button className="file-card is-active" type="button">
            <strong>{document.title}</strong>
            <span>
              <b>Yêu cầu: {document.request}</b>
              <em>{document.status}</em>
            </span>
          </button>
          <button className="file-card" type="button">
            <strong>Tờ trình lãnh đạo</strong>
            <span>
              <b>Yêu cầu: Duyệt</b>
              <em className="approved">Đã duyệt</em>
            </span>
          </button>
          <button className="file-card" type="button">
            <strong>Báo cáo xác minh</strong>
            <span>
              <b>Yêu cầu: Xem</b>
              <em className="neutral">Chờ xem</em>
            </span>
          </button>
          <Button
            className="add-file"
            onClick={() => onNotify("Đã bổ sung một tệp giả lập vào hồ sơ")}
          >
            ＋ Bổ sung văn bản
          </Button>
        </section>

        <section className="viewer">
          <div className="viewer__toolbar">
            <strong>{document.title}.docx</strong>
            <div>
              <Button variant="ghost">−&nbsp;&nbsp; 100% &nbsp;&nbsp;+</Button>
              <Button
                variant="ghost"
                onClick={() => onNotify("Đã tải xuống văn bản mẫu")}
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNotify("Đã chuyển chế độ xem toàn màn hình")}
              >
                ⛶
              </Button>
            </div>
          </div>
          <div className="paper-canvas">
            <DocumentPaper document={document} />
          </div>
          <div className="sync-bar">
            <span>
              <i /> Đã đồng bộ dữ liệu thời gian thực
            </span>
            <span>
              Mã số lưu trữ văn thư: <strong>VT-2026/0042</strong>
            </span>
          </div>
        </section>

        <aside className="timeline">
          <div className="panel-title">
            <strong>LỊCH SỬ TRÌNH KÝ</strong>
            <span>3 cấp duyệt</span>
          </div>
          <div className="timeline-step is-done">
            <span className="timeline-step__dot">✓</span>
            <div>
              <strong>Lê Văn A</strong>
              <small>Trưởng phòng TN&MT</small>
              <span className="status status--da-duyet">✓ Đã duyệt</span>
              <details className="timeline-opinion">
                <summary>
                  <Icon name="8d024" size={13} />
                  Xem ý kiến
                </summary>
                <div className="timeline-opinion__content">
                  <div>
                    <strong>Ý kiến lãnh đạo</strong>
                    <time>02/10/2026 · 09:20</time>
                  </div>
                  <p>
                    Đồng ý với nội dung đề xuất. Chuyển lãnh đạo tiếp theo xem
                    xét và ký số theo quy định.
                  </p>
                  <span>Đã duyệt và chuyển tiếp</span>
                </div>
              </details>
            </div>
            <time>02/10&nbsp; 09:20</time>
          </div>
          <div className="timeline-step is-current">
            <span className="timeline-step__dot">2</span>
            <div>
              <strong>Nguyễn Văn B</strong>
              <small>Phó Giám đốc Sở</small>
              <p>
                <b>Yêu cầu: Ký số</b>
                <em>Đang chờ duyệt</em>
              </p>
              <div className="handover">
                <strong>NHẬN CHUYỂN GIAO</strong>
                <span>Trần Hoàng D (Phó phòng phụ trách)</span>
                <b>Tham mưu hoàn tất 02/10 10:15</b>
              </div>
            </div>
          </div>
          <div className="timeline-step is-pending">
            <span className="timeline-step__dot">3</span>
            <div>
              <strong>Nguyễn Văn C</strong>
              <small>Giám đốc Sở</small>
              <span>Yêu cầu: Ký phê duyệt</span>
            </div>
          </div>
          <Button className="edit-flow" onClick={onEditFlow}>
            Chỉnh sửa lượt trình
          </Button>
        </aside>
      </div>
    </main>
  )
}

type LeaderFlowDocument = {
  id: string
  title: string
  code: string
  requirement: "Xem" | "Duyệt" | "Ký"
}

export function LeaderDocumentDetail({
  task,
  onBack,
  onNotify,
  readOnly = false,
  onEditFlow,
}: {
  task: WorkCard
  onBack: () => void
  onNotify: (message: string) => void
  readOnly?: boolean
  onEditFlow?: (documents: LeaderFlowDocument[]) => void
}) {
  const flowDocuments = useMemo<LeaderFlowDocument[]>(
    () => [
      {
        id: task.id,
        title: task.title,
        code: task.id,
        requirement: task.requirement ?? "Xem",
      },
      {
        id: `${task.id}-attachment-1`,
        title: "Tờ trình lãnh đạo",
        code: "TTr-02/2026",
        requirement: "Duyệt",
      },
      {
        id: `${task.id}-attachment-2`,
        title: "Báo cáo xác minh và tài liệu kèm theo",
        code: "BCXM-03/2026",
        requirement: "Xem",
      },
    ],
    [task],
  )
  const [activeId, setActiveId] = useState(flowDocuments[0].id)
  const [viewedIds, setViewedIds] = useState<string[]>([])
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [opinion, setOpinion] = useState("")
  const [savedOpinions, setSavedOpinions] = useState([
    {
      documentId: task.id,
      author: "Trần Thị B",
      title: "Phó Trưởng phòng",
      time: "02/10/2026 · 08:15",
      content:
        "Đề nghị lãnh đạo xem xét nội dung hồ sơ và cho ý kiến xử lý theo quy định.",
    },
  ])
  const [viewingOpinion, setViewingOpinion] =
    useState<typeof savedOpinions[number] | null>(null)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showCompleteApprovalModal, setShowCompleteApprovalModal] =
    useState(false)
  const [showProposeLeaderModal, setShowProposeLeaderModal] = useState(false)
  const [showEditFlowModal, setShowEditFlowModal] = useState(false)
  const [proposedLeaderId, setProposedLeaderId] = useState("")
  const [selectedProposedDocumentIds, setSelectedProposedDocumentIds] =
    useState<string[]>([])
  const [proposedPermissions, setProposedPermissions] = useState<
    Record<string, Permission>
  >(
    Object.fromEntries(
      flowDocuments.map((document) => [document.id, "Bỏ qua"]),
    ),
  )
  const [returnedReason, setReturnedReason] = useState("")
  const activeFlowDocument =
    flowDocuments.find((document) => document.id === activeId) ??
    flowDocuments[0]
  const documentOpinions = savedOpinions.filter(
    (savedOpinion) => savedOpinion.documentId === activeFlowDocument.id,
  )
  const paperDocument: DocumentRow = {
    title: activeFlowDocument.title,
    code: activeFlowDocument.code,
    request:
      activeFlowDocument.requirement === "Ký"
        ? "Ký"
        : activeFlowDocument.requirement,
    date: task.date,
    flow: `LT-${task.id}`,
    status:
      activeFlowDocument.requirement === "Xem" &&
        viewedIds.includes(activeFlowDocument.id)
        ? "Đã xem"
        : "Chờ xử lý",
    progress: "1/3 bước",
    progressValue: 33,
    handler: "Nguyễn Minh Anh",
    role: "Lãnh đạo",
    submitter: task.submitter,
    department: "Phòng chuyên môn",
  }
  const hasViewed = viewedIds.includes(activeFlowDocument.id)
  const activeDocumentCompleted = completedIds.includes(activeFlowDocument.id)
  const incompleteDocumentCount = flowDocuments.length - completedIds.length
  const proposedLeader = fakeLeaders.find(
    (leader) => leader.id === proposedLeaderId,
  )
  const proposedDocumentCount = selectedProposedDocumentIds.length
  const allProposedDocumentsSelected =
    flowDocuments.length > 0 &&
    flowDocuments.every((document) =>
      selectedProposedDocumentIds.includes(document.id),
    )

  function completeAction(action: string) {
    setCompletedIds((current) =>
      current.includes(activeFlowDocument.id)
        ? current
        : [...current, activeFlowDocument.id],
    )
    onNotify(`${action}: ${activeFlowDocument.title}`)
  }

  function completeApproval() {
    setShowCompleteApprovalModal(false)
    onNotify("Đã hoàn thành phê duyệt lượt trình")
    onBack()
  }

  function toggleProposedDocument(
    document: LeaderFlowDocument,
    checked: boolean,
  ) {
    setSelectedProposedDocumentIds((current) =>
      checked
        ? [...new Set([...current, document.id])]
        : current.filter((id) => id !== document.id),
    )
    setProposedPermissions((current) => ({
      ...current,
      [document.id]: checked
        ? document.requirement === "Ký"
          ? "Ký số"
          : document.requirement
        : "Bỏ qua",
    }))
  }

  return (
    <main
      className="page detail-page leader-detail bg-[#f8fafc] w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: '#f8fafc' }}
    >
      <header className="detail-header bg-white border-b border-slate-200 px-6 py-3 shrink-0">
        <div className="breadcrumbs text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 font-normal">
          <button type="button" onClick={onBack} className="hover:text-blue-600 transition cursor-pointer bg-transparent border-none p-0 text-slate-400">
            Công việc của tôi
          </button>
          <span>/</span>
          <button type="button" onClick={onBack} className="hover:text-blue-600 transition cursor-pointer bg-transparent border-none p-0 text-slate-400">
            Lãnh đạo
          </button>
          <span>/</span>
          <strong className="text-slate-600 font-medium">{activeFlowDocument.title}</strong>
        </div>
        <div className="detail-title flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="back-arrow-btn flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer border-none bg-transparent"
              aria-label="Quay lại"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="leader-detail-heading">
              <div className="leader-title-line">
                <h1 className="text-base font-bold text-slate-900 m-0">Nguyễn Văn An - Trần Hà - Tranh chấp đất đai</h1>
              </div>
              <div className="leader-submitter text-xs text-slate-500 mt-0.5">
                Loại đơn: <strong className="text-slate-800 font-semibold">Đơn tố cáo</strong> ; Người trình: <strong className="text-slate-800 font-semibold">{task.submitter}</strong> ; Ngày trình: <strong className="text-slate-800 font-semibold">{task.date}</strong>
              </div>
            </div>
          </div>
          <div className="header-actions flex items-center gap-2">
            {readOnly ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white text-xs text-slate-700 font-medium shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                <span>Chế độ: Xem lượt trình</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-xs text-indigo-700 font-medium shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>Vai trò: Lãnh đạo</span>
              </div>
            )}
            {!readOnly && (
              <>
                <Button onClick={() => setShowProposeLeaderModal(true)}>
                  Đề xuất lãnh đạo xử lý trước
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (incompleteDocumentCount > 0) {
                      setShowCompleteApprovalModal(true)
                      return
                    }
                    completeApproval()
                  }}
                >
                  Hoàn thành phê duyệt
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div
        className="workspace flex-1 overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: readOnly ? '260px minmax(460px, 1fr) 280px' : '260px 1fr',
          height: 'calc(100% - 68px)',
        }}
      >
        <section className="document-list bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
          <div className="panel-title flex items-center justify-between px-3.5 py-3 border-b border-slate-100 shrink-0">
            <strong className="text-xs font-bold text-slate-800 tracking-wider uppercase">VĂN BẢN TRONG LƯỢT TRÌNH</strong>
            <span className="text-xs font-medium text-slate-400">{flowDocuments.length}</span>
          </div>
          <div className="p-2.5 pb-2 shrink-0">
            <label className="relative flex items-center w-full">
              <span className="absolute left-2.5 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                placeholder="Tìm theo tên văn bản..."
              />
            </label>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {flowDocuments.map((document) => {
              const isActive = document.id === activeId;
              const isWord = document.title.endsWith('.docx') || document.id === flowDocuments[0].id;
              return (
                <button
                  key={document.id}
                  type="button"
                  onClick={() => setActiveId(document.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer relative bg-white block ${
                    isActive
                      ? 'border-2 border-red-500 shadow-2xs'
                      : 'border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {isWord ? (
                        <span className="w-5 h-5 rounded flex items-center justify-center bg-blue-600 text-white font-bold text-[10px] shadow-2xs">
                          W
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 text-slate-500 text-[12px]">
                          📄
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <strong className="block text-xs font-bold text-slate-800 leading-snug">
                        {document.title}
                      </strong>
                      <div className="mt-2">
                        <span
                          className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                            document.requirement === 'Xem'
                              ? 'bg-slate-50 text-slate-600 border-slate-200'
                              : 'bg-blue-50 text-blue-600 border-blue-200'
                          }`}
                        >
                          Yêu cầu: {document.requirement}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="viewer flex flex-col h-full bg-[#f1f5f9] overflow-hidden">
          <div className="viewer__toolbar flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white text-xs shrink-0">
            <strong className="font-medium text-slate-700">{activeFlowDocument.title}.docx</strong>
            <div className="flex items-center gap-2 text-slate-500">
              <div className="flex items-center gap-1.5">
                <button type="button" className="hover:text-slate-800 px-1 font-bold cursor-pointer">−</button>
                <span className="text-slate-600">100%</span>
                <button type="button" className="hover:text-slate-800 px-1 font-bold cursor-pointer">＋</button>
              </div>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => onNotify("Đã tải xuống văn bản mẫu")}
                className="hover:text-slate-800 p-1 cursor-pointer"
                title="Tải xuống"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button
                type="button"
                className="hover:text-slate-800 p-1 cursor-pointer"
                title="Toàn màn hình"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </button>
            </div>
          </div>
          <div className="paper-canvas flex-1 overflow-y-auto p-6 flex justify-center">
            <DocumentPaper document={paperDocument} />
          </div>
          <div className="sync-bar flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-white text-xs text-slate-500 shrink-0">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Đã đồng bộ dữ liệu thời gian thực</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span>Yêu cầu được cán bộ xác định: <strong className="text-slate-800 font-semibold">{activeFlowDocument.requirement}</strong></span>
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-slate-400 text-[10px] text-slate-500 font-bold ml-1">?</span>
            </span>
          </div>
        </section>

        {readOnly && (
          <aside className="leader-action-panel bg-white border-l border-slate-200 p-4 flex flex-col justify-between h-full overflow-hidden shrink-0">
            <div className="leader-timeline flex-1 overflow-y-auto">
              <div className="panel-title flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                <strong className="text-xs font-bold text-slate-800 tracking-wider">QUÁ TRÌNH TRÌNH KÝ</strong>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-normal">4 cấp xử lý</span>
                  <div className="w-5 h-5 rounded-full bg-[#f59e0b] text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                    T
                  </div>
                </div>
              </div>

              <div className="space-y-0 text-xs mt-3">
                <div className="flex gap-3 relative pb-5">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-6 h-6 rounded-full bg-[#059669] text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-2xs">
                      1
                    </div>
                    <div className="w-0.5 grow bg-[#059669] mt-1" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-xs font-bold text-slate-900 truncate">
                        Trần Thị B - Lãnh đạo
                      </strong>
                      <span className="shrink-0 px-2 py-0.5 text-[11px] font-medium rounded bg-[#e6f4ea] text-[#137333] border border-[#ceead6] inline-flex items-center gap-1 shadow-2xs">
                        ✓ Đã duyệt
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <time className="text-slate-400 font-normal">02/10/2026 08:15</time>
                      {documentOpinions[0] && (
                        <button
                          type="button"
                          onClick={() => setViewingOpinion(documentOpinions[0])}
                          className="text-slate-500 hover:text-blue-600 inline-flex items-center gap-1 font-normal cursor-pointer bg-transparent border-none p-0 transition"
                          title="Xem ý kiến của Trần Thị B"
                          aria-label="Xem ý kiến của Trần Thị B"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Ý kiến</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 relative pb-5">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-6 h-6 rounded-full bg-[#059669] text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-2xs">
                      2
                    </div>
                    <div className="w-0.5 grow bg-[#059669] mt-1" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-xs font-bold text-slate-900 truncate">
                        Nguyễn Văn B - Phó Giám
                      </strong>
                      <span className="shrink-0 px-2 py-0.5 text-[11px] font-medium rounded bg-[#e6f4ea] text-[#137333] border border-[#ceead6] inline-flex items-center gap-1 shadow-2xs">
                        ✓ Đã ký
                      </span>
                    </div>
                    <time className="block text-[11px] text-slate-400 font-normal mt-1">
                      02/10 09:30
                    </time>
                    <p className="text-[11px] text-slate-400 font-normal leading-relaxed mt-1">
                      Được đề xuất bởi - Trần Thị B - 02/10/2026 - 10:30:00
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 relative pb-5">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-6 h-6 rounded-full bg-[#991b1b] text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-2xs ring-4 ring-rose-50">
                      3
                    </div>
                    <div className="w-0.5 grow bg-slate-200 mt-1" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-xs font-bold text-slate-900 truncate">
                        Nguyễn Minh Anh - Lãnh đạ
                      </strong>
                      <span className="shrink-0 px-2.5 py-0.5 text-[11px] font-medium rounded bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] inline-flex items-center gap-1 shadow-2xs">
                        Trả lại
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <time className="text-slate-400 font-normal">
                        03/10/2026
                      </time>
                      {documentOpinions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setViewingOpinion(
                              documentOpinions[documentOpinions.length - 1]
                            )
                          }
                          className="text-slate-500 hover:text-blue-600 inline-flex items-center gap-1 font-normal cursor-pointer bg-transparent border-none p-0 transition"
                          title="Xem ý kiến"
                          aria-label="Xem ý kiến"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Ý kiến</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 relative">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-2xs">
                      4
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-xs font-semibold text-slate-700 truncate">
                        Đào Minh Anh - Lãnh đạo
                      </strong>
                      <span className="shrink-0 px-2.5 py-0.5 text-[11px] font-medium rounded bg-[#f1f3f4] text-[#5f6368] border border-[#dadce0] inline-flex items-center shadow-2xs">
                        Chờ ký
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-normal mt-1">
                      Phát hành văn bản
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 shrink-0">
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-lg bg-[#fef2f2] text-[#c5221f] border border-[#fad2cf] hover:bg-[#fee2e2] text-xs font-semibold text-center transition cursor-pointer shadow-2xs"
                onClick={() => {
                  setShowEditFlowModal(true);
                }}
              >
                Chỉnh sửa lượt trình
              </button>
            </div>
          </aside>
        )}

        {!readOnly && (
          <aside className="leader-action-panel bg-white border-l border-slate-200 p-4 flex flex-col justify-between h-full overflow-y-auto shrink-0 w-[280px]">
            {!returnedReason && (
              <>
                <div className="leader-opinion-box space-y-2">
                  <strong className="block text-xs font-bold text-slate-800">Cho ý kiến</strong>
                  <textarea
                    value={opinion}
                    onChange={(event) => setOpinion(event.target.value)}
                    placeholder="Nhập ý kiến của bạn..."
                    rows={4}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500 transition"
                  />
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!opinion.trim()) return
                      setSavedOpinions((current) => [
                        ...current,
                        {
                          documentId: activeFlowDocument.id,
                          author: "Nguyễn Minh Anh",
                          title: "Lãnh đạo đơn vị",
                          time: "02/10/2026 · 10:15",
                          content: opinion.trim(),
                        },
                      ])
                      setOpinion("")
                      onNotify("Đã lưu ý kiến vào lịch sử trình ký")
                    }}
                  >
                    Gửi ý kiến
                  </Button>
                </div>

                <div className="leader-actions space-y-2 mt-4 pt-4 border-t border-slate-100">
                  {activeFlowDocument.requirement === "Xem" && (
                    <Button
                      variant={hasViewed ? "secondary" : "primary"}
                      onClick={() => {
                        if (!hasViewed) {
                          setViewedIds((current) => [
                            ...current,
                            activeFlowDocument.id,
                          ])
                          completeAction("Đã ghi nhận xem văn bản")
                        }
                      }}
                    >
                      {hasViewed ? "✓ Đã xem" : "Đã xem"}
                    </Button>
                  )}
                  {activeFlowDocument.requirement === "Duyệt" && (
                    <>
                      <Button
                        variant={
                          activeDocumentCompleted ? "secondary" : "primary"
                        }
                        onClick={() => {
                          if (!activeDocumentCompleted) {
                            completeAction("Đã duyệt văn bản")
                          }
                        }}
                      >
                        {activeDocumentCompleted ? "✓ Đã duyệt" : "Duyệt"}
                      </Button>
                      <Button onClick={() => setShowReturnModal(true)}>
                        Trả lại
                      </Button>
                      <Button className="is-disabled">Ký số không áp dụng</Button>
                    </>
                  )}
                  {activeFlowDocument.requirement === "Ký" && (
                    <>
                      <Button
                        variant={
                          activeDocumentCompleted ? "secondary" : "primary"
                        }
                        onClick={() => {
                          if (!activeDocumentCompleted) {
                            completeAction("Đã ký số văn bản")
                          }
                        }}
                      >
                        {activeDocumentCompleted ? "✓ Đã ký số" : "Ký số"}
                      </Button>
                      <Button onClick={() => setShowReturnModal(true)}>
                        Trả lại
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </aside>
        )}
      </div>
      {viewingOpinion && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="opinion-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leader-opinion-title"
          >
            <header className="opinion-dialog__header">
              <span className="opinion-dialog__icon">✓</span>
              <div>
                <h3 id="leader-opinion-title">Ý kiến của lãnh đạo</h3>
                <p>
                  {viewingOpinion.author} · {viewingOpinion.title}
                </p>
              </div>
              <button
                className="modal__close"
                type="button"
                onClick={() => setViewingOpinion(null)}
                aria-label="Đóng"
              >
                ×
              </button>
            </header>
            <div className="leader-opinion-detail">
              <time>{viewingOpinion.time}</time>
              <p>{viewingOpinion.content}</p>
            </div>
            <footer className="opinion-dialog__footer">
              <Button onClick={() => setViewingOpinion(null)}>Đóng</Button>
            </footer>
          </section>
        </div>
      )}
      {showCompleteApprovalModal && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal return-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="complete-approval-modal-title"
          >
            <header className="modal__header">
              <span className="modal__icon">!</span>
              <div>
                <strong id="complete-approval-modal-title">
                  Hoàn thành phê duyệt
                </strong>
                <p>Lượt trình còn văn bản chưa hoàn tất</p>
              </div>
              <Button
                variant="ghost"
                className="modal__close"
                onClick={() => setShowCompleteApprovalModal(false)}
                ariaLabel="Đóng"
              >
                ×
              </Button>
            </header>
            <div className="confirmation-modal__body">
              <p>
                Bạn còn {incompleteDocumentCount}/{flowDocuments.length} văn bản
                chưa ký/duyệt. Bạn có chắc chắn muốn hoàn thành phê duyệt?
              </p>
            </div>
            <footer className="modal__footer">
              <Button onClick={() => setShowCompleteApprovalModal(false)}>
                Hủy
              </Button>
              <Button variant="primary" onClick={completeApproval}>
                Xác nhận hoàn thành
              </Button>
            </footer>
          </section>
        </div>
      )}
      {showProposeLeaderModal && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal matrix-flow-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="propose-leader-modal-title"
          >
            <header className="modal__header">
              <span className="modal__icon">⌘</span>
              <div>
                <strong id="propose-leader-modal-title">
                  Đề xuất lãnh đạo xử lý trước
                </strong>
                <p>
                  Chọn lãnh đạo và quyền xử lý cho các văn bản cần hoàn tất trước
                  khi bạn phê duyệt
                </p>
              </div>
              <Button
                variant="ghost"
                className="modal__close"
                onClick={() => setShowProposeLeaderModal(false)}
                ariaLabel="Đóng"
              >
                ×
              </Button>
            </header>

            <div className="modal__body matrix-flow-modal__body">
              <div className="matrix-toolbar">
                <select
                  className="select-box leader-select"
                  value={proposedLeaderId}
                  onChange={(event) => setProposedLeaderId(event.target.value)}
                  aria-label="Chọn lãnh đạo xử lý trước"
                >
                  <option value="">-- Chọn lãnh đạo xử lý trước --</option>
                  {fakeLeaders.map((leader) => (
                    <option value={leader.id} key={leader.id}>
                      {leader.name} - {leader.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="matrix-scroll">
                <table className="matrix create-flow-matrix proposal-matrix">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={allProposedDocumentsSelected}
                          onChange={(event) => {
                            const checked = event.target.checked
                            setSelectedProposedDocumentIds(
                              checked
                                ? flowDocuments.map((document) => document.id)
                                : [],
                            )
                            setProposedPermissions(
                              Object.fromEntries(
                                flowDocuments.map((document) => [
                                  document.id,
                                  checked
                                    ? document.requirement === "Ký"
                                      ? "Ký số"
                                      : document.requirement
                                    : "Bỏ qua",
                                ]),
                              ),
                            )
                          }}
                          aria-label="Chọn tất cả văn bản"
                        />
                      </th>
                      <th>VĂN BẢN</th>
                      <th>
                        {proposedLeader ? (
                          <div className="approver">
                            <i className="green">1</i>
                            <span>
                              <strong>{proposedLeader.name}</strong>
                              <small>{proposedLeader.title}</small>
                            </span>
                          </div>
                        ) : (
                          "QUYỀN XỬ LÝ"
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {flowDocuments.map((document, index) => (
                      <tr key={document.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedProposedDocumentIds.includes(
                              document.id,
                            )}
                            onChange={(event) =>
                              toggleProposedDocument(
                                document,
                                event.target.checked,
                              )
                            }
                            aria-label={`Chọn ${document.title}`}
                          />
                        </td>
                        <td>
                          ▧ &nbsp; {index + 1}. {document.title}
                          <small>{document.code}</small>
                        </td>
                        <td>
                          <MatrixSelect
                            value={
                              proposedPermissions[document.id] ?? "Bỏ qua"
                            }
                            disabled={
                              !proposedLeader ||
                              !selectedProposedDocumentIds.includes(document.id)
                            }
                            onChange={(permission) => {
                              setProposedPermissions((current) => ({
                                ...current,
                                [document.id]: permission,
                              }))
                              setSelectedProposedDocumentIds((current) =>
                                permission === "Bỏ qua"
                                  ? current.filter((id) => id !== document.id)
                                  : [...new Set([...current, document.id])],
                              )
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}>
                        {proposedDocumentCount} văn bản được đề xuất xử lý trước
                        <span>
                          Chọn văn bản và thiết lập quyền xử lý tương ứng
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <footer className="modal__footer">
              <Button onClick={() => setShowProposeLeaderModal(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                className={
                  proposedLeader && proposedDocumentCount > 0
                    ? ""
                    : "is-disabled"
                }
                onClick={() => {
                  if (!proposedLeader || proposedDocumentCount === 0) return
                  setShowProposeLeaderModal(false)
                  onNotify(
                    `Đã gửi đề xuất ${proposedLeader.name} xử lý trước ${proposedDocumentCount} văn bản`,
                  )
                }}
              >
                Gửi đề xuất
              </Button>
            </footer>
          </section>
        </div>
      )}
      {showReturnModal && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal return-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-modal-title"
          >
            <header className="modal__header">
              <span className="modal__icon">↩</span>
              <div>
                <h2 id="return-modal-title">Xác nhận trả lại văn bản</h2>
                <p>{activeFlowDocument.title}</p>
              </div>
              <button
                className="modal__close"
                type="button"
                onClick={() => setShowReturnModal(false)}
                aria-label="Đóng"
              >
                ×
              </button>
            </header>
            <div className="confirmation-modal__body">
              <p>Bạn có chắc chắn muốn trả lại văn bản này không?</p>
              <strong>{activeFlowDocument.title}</strong>
              <span>Thao tác này sẽ kết thúc bước xử lý hiện tại.</span>
            </div>
            <footer className="modal__footer">
              <Button onClick={() => setShowReturnModal(false)}>Không</Button>
              <Button
                variant="primary"
                onClick={() => {
                  setReturnedReason("Đã trả lại")
                  setShowReturnModal(false)
                  onNotify("Đã trả lại văn bản")
                }}
              >
                Có, trả lại
              </Button>
            </footer>
          </section>
        </div>
      )}
      {showEditFlowModal && (
        <ChinhSuaLuotTrinhModal
          isOpen={showEditFlowModal}
          onClose={() => setShowEditFlowModal(false)}
          onSave={() => {
            setShowEditFlowModal(false);
            onNotify("Đã cập nhật lượt trình ký thành công");
            onEditFlow?.(flowDocuments);
          }}
        />
      )}
    </main>
  )
}

type Permission = "Ký số" | "Xem" | "Duyệt" | "Bỏ qua"

const permissionOptions: Permission[] = [
  "Ký số",
  "Xem",
  "Duyệt",
  "Bỏ qua",
]

const fakeLeaders = [
  { id: "lanh-dao-1", name: "Lê Văn A", title: "Trưởng phòng TN&MT" },
  { id: "lanh-dao-2", name: "Nguyễn Văn B", title: "Phó Giám đốc Sở" },
  { id: "lanh-dao-3", name: "Nguyễn Văn C", title: "Giám đốc Sở" },
  { id: "lanh-dao-4", name: "Trần Hoàng D", title: "Phó phòng phụ trách" },
  { id: "lanh-dao-5", name: "Phạm Minh Trí", title: "Trưởng ban Pháp chế" },
  { id: "lanh-dao-6", name: "Vũ Quốc Hùng", title: "Chánh Văn phòng" },
]

const matrixDocuments = [
  { id: "document-1", name: "Phiếu đề xuất hướng xử lý.docx" },
  { id: "document-2", name: "Tờ trình lãnh đạo.doc" },
  { id: "document-3", name: "Báo cáo xác minh.pdf" },
]

function MatrixSelect({
  value,
  onChange,
  danger = false,
  disabled = false,
}: {
  value: Permission
  onChange: (value: Permission) => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <select
      className={`matrix-select ${danger ? "is-danger" : ""}`}
      value={value}
      onChange={(event) => onChange(event.target.value as Permission)}
      aria-label="Quyền xử lý văn bản"
      disabled={disabled}
    >
      {permissionOptions.map((option) => (
        <option value={option} key={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export function FlowModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: () => void
}) {
  return (
    <ChinhSuaLuotTrinhModal
      isOpen={true}
      onClose={onClose}
      onSave={() => {
        onSave();
      }}
    />
  );
}

function CreateDocumentModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (document: DocumentRow) => void
}) {
  const [title, setTitle] = useState("Tờ trình phê duyệt kế hoạch công tác")
  const [code, setCode] = useState("127/TTr-UBND")
  const [request, setRequest] = useState<DocumentRow["request"]>("Duyệt")

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onCreate({
      title: title.trim() || "Văn bản chưa đặt tên",
      code: code.trim() || "VB-MỚI",
      request,
      date: "Chưa trình",
      flow: "—",
      status: "Chưa trình",
      progress: "Chưa bắt đầu",
      progressValue: 0,
      handler: "—",
      role: "Chuyên viên",
      submitter: "Nguyễn Minh Anh",
      department: "Phòng Hành chính",
    })
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal create-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-modal-title"
      >
        <header className="modal__header">
          <span className="modal__icon">＋</span>
          <div>
            <h2 id="create-modal-title">Thêm văn bản mới</h2>
            <p>Tạo dữ liệu giả lập để kiểm thử quy trình quản lý văn bản</p>
          </div>
          <button
            className="modal__close"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </header>
        <form onSubmit={submit}>
          <div className="create-form">
            <label>
              <span>Tên văn bản</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>
            <div className="create-form__row">
              <label>
                <span>Số / Ký hiệu</span>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  required
                />
              </label>
              <label>
                <span>Yêu cầu xử lý</span>
                <select
                  value={request}
                  onChange={(event) =>
                    setRequest(event.target.value as DocumentRow["request"])
                  }
                >
                  <option value="Ký">Ký</option>
                  <option value="Duyệt">Duyệt</option>
                  <option value="Xem">Xem</option>
                </select>
              </label>
            </div>
          </div>
          <footer className="modal__footer">
            <Button onClick={onClose}>Đóng</Button>
            <button className="button button--primary" type="submit">
              ＋ Tạo văn bản
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

function TransferModal({
  documents,
  initialDocumentId,
  onClose,
  onSubmit,
}: {
  documents: LeaderFlowDocument[]
  initialDocumentId: string
  onClose: () => void
  onSubmit: () => void
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([initialDocumentId])
  const [leaderId, setLeaderId] = useState(fakeLeaders[1].id)
  const [requirements, setRequirements] =
    useState<Record<string, LeaderFlowDocument["requirement"]>>(
      Object.fromEntries(
        documents.map((document) => [document.id, document.requirement]),
      ),
    )
  const [note, setNote] = useState("")
  const [returnToMe, setReturnToMe] = useState(true)
  const selectedLeader = fakeLeaders.find((leader) => leader.id === leaderId)

  function toggleDocument(documentId: string) {
    setSelectedIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId],
    )
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal transfer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-modal-title"
      >
        <header className="modal__header">
          <span className="modal__icon">⇄</span>
          <div>
            <h2 id="transfer-modal-title">Chuyển giao xử lý văn bản</h2>
            <p>
              Chọn văn bản, lãnh đạo nhận và yêu cầu xử lý tương ứng cho từng
              văn bản
            </p>
          </div>
          <button
            className="modal__close"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </header>

        <div className="transfer-modal__body">
          <section className="transfer-section">
            <div className="transfer-section__title">
              <strong>1. Văn bản cần chuyển giao</strong>
              <span>
                Đã chọn {selectedIds.length}/{documents.length}
              </span>
            </div>
            <div className="transfer-documents">
              {documents.map((document) => {
                const checked = selectedIds.includes(document.id)
                return (
                  <div
                    className={`transfer-document ${checked ? "is-selected" : ""
                      }`}
                    key={document.id}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDocument(document.id)}
                      />
                      <span>
                        <strong>{document.title}</strong>
                        <small>{document.code}</small>
                      </span>
                    </label>
                    {checked && (
                      <label className="transfer-requirement">
                        <span>Quyền người nhận</span>
                        <select
                          value={requirements[document.id]}
                          onChange={(event) =>
                            setRequirements((current) => ({
                              ...current,
                              [document.id]: event.target
                                .value as LeaderFlowDocument["requirement"],
                            }))
                          }
                        >
                          <option value="Xem">Xem</option>
                          <option value="Duyệt">Duyệt</option>
                          <option value="Ký">Ký</option>
                        </select>
                      </label>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="transfer-section">
            <div className="transfer-section__title">
              <strong>2. Lãnh đạo nhận chuyển giao</strong>
            </div>
            <label className="transfer-field">
              <span>Người nhận</span>
              <select
                value={leaderId}
                onChange={(event) => setLeaderId(event.target.value)}
              >
                {fakeLeaders.slice(1).map((leader) => (
                  <option value={leader.id} key={leader.id}>
                    {leader.name} - {leader.title}
                  </option>
                ))}
              </select>
            </label>
            {selectedLeader && (
              <div className="transfer-recipient">
                <span className="avatar">
                  {selectedLeader.name
                    .split(" ")
                    .slice(-2)
                    .map((word) => word[0])
                    .join("")}
                </span>
                <div>
                  <strong>{selectedLeader.name}</strong>
                  <small>{selectedLeader.title}</small>
                </div>
              </div>
            )}
          </section>

          <section className="transfer-section">
            <div className="transfer-section__title">
              <strong>3. Ghi chú chuyển giao</strong>
              <span>Không bắt buộc</span>
            </div>
            <label className="transfer-field">
              <span className="sr-only">Ghi chú chuyển giao</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Nhập nội dung cần lưu ý cho lãnh đạo nhận chuyển giao..."
                rows={3}
              />
            </label>
            <label className="return-option">
              <input
                type="checkbox"
                checked={returnToMe}
                onChange={(event) => setReturnToMe(event.target.checked)}
              />
              <span>
                <strong>Quay lại tôi sau khi hoàn tất</strong>
                <small>
                  Lượt trình sẽ tự động chuyển lại cho bạn sau khi người nhận xử
                  lý xong.
                </small>
              </span>
            </label>
          </section>
        </div>

        <footer className="modal__footer transfer-modal__footer">
          <span>
            {selectedIds.length} văn bản · Người nhận:{" "}
            <strong>{selectedLeader?.name}</strong>
          </span>
          <div>
            <Button onClick={onClose}>Hủy</Button>
            <Button
              variant="primary"
              className={selectedIds.length ? "" : "is-disabled"}
              onClick={() => {
                if (selectedIds.length) onSubmit()
              }}
            >
              Xác nhận chuyển giao
            </Button>
          </div>
        </footer>
      </section>
    </div>
  )
}

export function CreateFlowModal({
  documents,
  onClose,
  onSubmit,
}: {
  documents: DocumentRow[]
  onClose: () => void
  onSubmit: () => void
}) {
  const initialLeaders = fakeLeaders.slice(0, 3)
  const [leaders, setLeaders] = useState(initialLeaders)
  const [selectedLeaderId, setSelectedLeaderId] = useState("")
  const [permissions, setPermissions] = useState<Record<string, Permission>>(
    Object.fromEntries(
      documents.flatMap((document) =>
        initialLeaders.map((leader, leaderIndex) => {
          const requirement: Permission =
            leaderIndex === 0
              ? "Xem"
              : leaderIndex === 1
                ? document.request === "Ký"
                  ? "Ký số"
                  : document.request
                : "Xem"
          return [`${document.code}:${leader.id}`, requirement]
        }),
      ),
    ),
  )
  const availableLeaders = fakeLeaders.filter(
    (leader) => !leaders.some((selected) => selected.id === leader.id),
  )

  function addLeader() {
    const leader = fakeLeaders.find((item) => item.id === selectedLeaderId)
    if (!leader) return
    setLeaders((current) => [...current, leader])
    setPermissions((current) => ({
      ...current,
      ...Object.fromEntries(
        documents.map((document) => [
          `${document.code}:${leader.id}`,
          "Xem" as Permission,
        ]),
      ),
    }))
    setSelectedLeaderId("")
  }

  function updatePermission(
    documentCode: string,
    leaderId: string,
    permission: Permission,
  ) {
    setPermissions((current) => ({
      ...current,
      [`${documentCode}:${leaderId}`]: permission,
    }))
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal create-flow-modal matrix-flow-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-flow-title"
      >
        <header className="modal__header">
          <span className="modal__icon">⌘</span>
          <div>
            <h2 id="create-flow-title">
              Tạo lượt trình & Ma trận phân quyền văn bản
            </h2>
            <p>
              {documents.length} văn bản đã chọn · Cấu hình thứ tự trình ký và
              quyền hạn từng văn bản
            </p>
          </div>
          <button
            className="modal__close"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </header>

        <div className="modal__body matrix-flow-modal__body">
          <div className="matrix-toolbar">
            <select
              className="select-box leader-select"
              value={selectedLeaderId}
              onChange={(event) => setSelectedLeaderId(event.target.value)}
              aria-label="Chọn lãnh đạo phê duyệt"
            >
              <option value="">-- Chọn lãnh đạo phê duyệt --</option>
              {availableLeaders.map((leader) => (
                <option value={leader.id} key={leader.id}>
                  {leader.name} - {leader.title}
                </option>
              ))}
            </select>
            <Button
              variant="primary"
              className={selectedLeaderId ? "" : "is-disabled"}
              onClick={addLeader}
            >
              ＋ Thêm lãnh đạo
            </Button>
          </div>

          <div className="matrix-scroll">
            <table className="matrix create-flow-matrix">
              <thead>
                <tr>
                  <th>DANH SÁCH VĂN BẢN TRONG LƯỢT</th>
                  {leaders.map((leader, index) => (
                    <th key={leader.id}>
                      <div className="approver">
                        <i
                          className={
                            index === 0 ? "green" : index > 1 ? "gray" : ""
                          }
                        >
                          {index + 1}
                        </i>
                        <span>
                          <strong>
                            {index + 1}. {leader.name}
                          </strong>
                          <small>{leader.title}</small>
                        </span>
                        <div className="approver__actions">
                          <button
                            className="approver__remove"
                            type="button"
                            onClick={() =>
                              setLeaders((current) =>
                                current.filter((item) => item.id !== leader.id),
                              )
                            }
                            aria-label={`Xóa ${leader.name} khỏi lượt trình`}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {documents.map((document, documentIndex) => (
                  <tr key={document.code}>
                    <td>
                      ▧ &nbsp; {documentIndex + 1}. {document.title}
                      <small>{document.code}</small>
                    </td>
                    {leaders.map((leader, leaderIndex) => {
                      const key = `${document.code}:${leader.id}`
                      return (
                        <td key={key}>
                          <MatrixSelect
                            value={permissions[key] ?? "Xem"}
                            danger={documentIndex === 0 && leaderIndex === 1}
                            onChange={(value) =>
                              updatePermission(document.code, leader.id, value)
                            }
                          />
                          {documentIndex === 0 && leaderIndex === 1 && (
                            <small className="matrix-note">
                              Thẩm quyền chính <b>• Bước xử lý chính</b>
                            </small>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={leaders.length + 1}>
                    {documents.length} văn bản trong lượt
                    <span>
                      Nhấp vào từng ô để thay đổi quyền xử lý tương ứng
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <footer className="modal__footer">
          <Button onClick={onClose}>Đóng</Button>
          <Button
            variant="primary"
            className={leaders.length ? "" : "is-disabled"}
            onClick={() => {
              if (leaders.length) onSubmit()
            }}
          >
            ✓ &nbsp; Trình ký
          </Button>
        </footer>
      </section>
    </div>
  )
}

export interface TrinhKyFigmaAppProps {
  currentAccount?: CurrentUserAccount;
  onNav?: (s: Screen) => void;
  initialRole?: "officer" | "leader" | "clerk";
  initialView?:
  | "work"
  | "list"
  | "detail"
  | "leader-detail"
  | "officer-case"
  | "signing-detail"
  | "add-receipt"
  | "add-case";
  initialDocId?: string;
  onBackToKanban?: () => void;
  hideSidebar?: boolean;
  hideTopNav?: boolean;
  onSwitchAccount?: (account: CurrentUserAccount) => void;
}

export default function TrinhKyFigmaApp({
  currentAccount,
  onNav,
  initialRole,
  initialView,
  initialDocId,
  onBackToKanban,
  hideSidebar = true,
  hideTopNav = false,
  onSwitchAccount,
}: TrinhKyFigmaAppProps) {
  const isLeaderRole = currentAccount?.role === "lanh_dao" || initialRole === "leader";
  const defaultRole: WorkRole = isLeaderRole ? "leader" : (initialRole || "officer");

  const defaultLeaderTask: WorkCard = useMemo(() => {
    const all = leaderWorkColumns.flatMap((c) => c.cards);
    if (initialDocId) {
      const match = all.find(
        (c) => c.id === initialDocId || c.title.includes(initialDocId) || c.description.includes(initialDocId)
      );
      if (match) return match;
    }
    return all[0];
  }, [initialDocId]);

  const defaultOfficerTask: WorkCard = useMemo(() => {
    const all = officerWorkColumns.flatMap((c) => c.cards);
    if (initialDocId) {
      const match = all.find(
        (c) => c.id === initialDocId || c.title.includes(initialDocId) || c.description.includes(initialDocId)
      );
      if (match) return match;
    }
    return all[1] || all[0];
  }, [initialDocId]);

  const computedInitialView = useMemo(() => {
    if (initialView) return initialView;
    if (currentAccount?.role === "lanh_dao") return "leader-detail";
    return "work";
  }, [initialView, currentAccount?.role]);

  const [view, setView] = useState<
    | "work"
    | "list"
    | "detail"
    | "leader-detail"
    | "officer-case"
    | "signing-detail"
    | "add-receipt"
    | "add-case"
  >(computedInitialView);

  useEffect(() => {
    if (initialView) {
      setView(initialView);
    }
  }, [initialView]);

  const [documentData, setDocumentData] = useState(documents);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRow | null>(
    documents[0] ?? null
  );
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [flowSetupDocuments, setFlowSetupDocuments] = useState<DocumentRow[]>([]);
  const [leaderTask, setLeaderTask] = useState<WorkCard | null>(defaultLeaderTask);
  const [officerTask, setOfficerTask] = useState<WorkCard | null>(defaultOfficerTask);
  const [signingHistoryTask, setSigningHistoryTask] = useState<WorkCard | null>(defaultLeaderTask);
  const [toast, setToast] = useState("");

  const managementDocuments = Array.from(
    new Map(
      [...documents, ...documentData].map((document) => [
        document.code,
        document,
      ])
    ).values()
  );
  const activeDocument = isDocumentRow(selectedDocument)
    ? selectedDocument
    : (managementDocuments.find(isDocumentRow) ?? documents[0]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function openDetail(document: DocumentRow) {
    if (!isDocumentRow(document)) return;
    setSelectedDocument(document);
    setView("detail");
  }

  const handleBackNavigation = () => {
    if (
      view === "leader-detail" ||
      view === "officer-case" ||
      view === "signing-detail" ||
      view === "add-receipt" ||
      view === "add-case"
    ) {
      setView("work");
      return;
    }
    if (onBackToKanban) {
      onBackToKanban();
    } else if (onNav) {
      onNav("cong-viec");
    } else {
      setView("work");
    }
  };

  return (
    <div className="app-shell trinh-ky-figma-scope" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>
      {hideSidebar && !hideTopNav && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '13px',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#004ac6', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>approval</span>
              Quản lý Trình ký &amp; Ký số
            </span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <button
              type="button"
              onClick={() => setView('work')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: view === 'work' ? '1px solid #bfdbfe' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12.5px',
                background: view === 'work' ? '#eff6ff' : 'transparent',
                color: view === 'work' ? '#004ac6' : '#64748b',
              }}
            >
              Bàn làm việc
            </button>
            <button
              type="button"
              onClick={() => {
                if (!officerTask) setOfficerTask(defaultOfficerTask);
                setView('officer-case');
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: view === 'officer-case' ? '1px solid #bfdbfe' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12.5px',
                background: view === 'officer-case' ? '#eff6ff' : 'transparent',
                color: view === 'officer-case' ? '#004ac6' : '#64748b',
              }}
            >
              Hồ sơ cán bộ trình
            </button>
            <button
              type="button"
              onClick={() => {
                if (!leaderTask) setLeaderTask(defaultLeaderTask);
                setView('leader-detail');
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: view === 'leader-detail' ? '1px solid #bfdbfe' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12.5px',
                background: view === 'leader-detail' ? '#eff6ff' : 'transparent',
                color: view === 'leader-detail' ? '#004ac6' : '#64748b',
              }}
            >
              Phê duyệt lãnh đạo
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(onBackToKanban || onNav) && (
              <button
                type="button"
                onClick={handleBackNavigation}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                ← Công việc của tôi
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {!hideSidebar && (
          <Sidebar
            active={
              view === "work" ||
                view === "leader-detail" ||
                view === "officer-case" ||
                view === "signing-detail" ||
                view === "add-receipt" ||
                view === "add-case"
                ? "work"
                : "documents"
            }
            onWork={() => setView("work")}
          />
        )}
        {view === "work" ? (
          <WorkPage
            initialRole={defaultRole}
            onNotify={notify}
            onOpenLeaderDocument={(task) => {
              setLeaderTask(task);
              setView("leader-detail");
            }}
            onOpenOfficerCase={(task) => {
              setOfficerTask(task);
              setView("officer-case");
            }}
            onAddReceipt={() => setView("add-receipt")}
            onAddCase={() => setView("add-case")}
            onSwitchRole={(newRole) => {
              if (onSwitchAccount) {
                if (newRole === 'officer') {
                  const canBo = DEMO_ACCOUNTS.find((a) => a.role === 'can_bo');
                  if (canBo) onSwitchAccount(canBo);
                } else if (newRole === 'clerk') {
                  const vanThu = DEMO_ACCOUNTS.find((a) => a.role === 'van_thu');
                  if (vanThu) onSwitchAccount(vanThu);
                } else if (newRole === 'leader') {
                  const lanhDao = DEMO_ACCOUNTS.find((a) => a.role === 'lanh_dao');
                  if (lanhDao) onSwitchAccount(lanhDao);
                }
              }
            }}
          />
        ) : view === "add-receipt" ? (
          <AddReceiptPage onBack={() => setView("work")} onNotify={notify} />
        ) : view === "add-case" ? (
          <CreateCasePage onBack={() => setView("work")} onNotify={notify} />
        ) : view === "officer-case" && officerTask ? (
          <OfficerCaseDetail
            task={officerTask}
            onBack={handleBackNavigation}
            onNotify={notify}
            onStartSigning={setFlowSetupDocuments}
            onOpenSigningHistory={(task) => {
              setSigningHistoryTask(task);
              setView("signing-detail");
            }}
          />
        ) : view === "signing-detail" && signingHistoryTask ? (
          <LeaderDocumentDetail
            task={signingHistoryTask}
            readOnly
            onBack={() => setView("officer-case")}
            onNotify={notify}
            onEditFlow={(flowDocuments) =>
              setFlowSetupDocuments(
                flowDocuments.map((document) => ({
                  title: document.title,
                  code: document.code,
                  request:
                    document.requirement === "Ký"
                      ? "Ký"
                      : document.requirement,
                  date: signingHistoryTask.date,
                  flow: `LT-${signingHistoryTask.id}`,
                  status: "Đã trình",
                  progress: "1/3 người",
                  progressValue: 33,
                  handler: "Nguyễn Minh Anh",
                  role: "Cán bộ thụ lý",
                  submitter: signingHistoryTask.submitter,
                  department: "Phòng Nghiệp vụ",
                }))
              )
            }
          />
        ) : view === "leader-detail" && leaderTask ? (
          <LeaderDocumentDetail
            task={leaderTask}
            onBack={handleBackNavigation}
            onNotify={notify}
          />
        ) : view === "list" ? (
          <ListView
            data={managementDocuments.map((document) => ({
              ...document,
              status: normalizeManagementStatus(document.status),
            }))}
            onOpenDetail={openDetail}
            onAddDocument={() => setShowCreateModal(true)}
            onStartFlow={setFlowSetupDocuments}
            onNotify={notify}
          />
        ) : (
          <DetailView
            document={activeDocument}
            onBack={() => setView("list")}
            onEditFlow={() => setShowModal(true)}
            onNotify={notify}
          />
        )}
      </div>
      {showModal && (
        <FlowModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false)
            notify("Đã lưu thay đổi ma trận phân quyền")
          }}
        />
      )}
      {showCreateModal && (
        <CreateDocumentModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(document) => {
            setDocumentData((current) => [document, ...current])
            setShowCreateModal(false)
            notify("Đã tạo văn bản giả lập mới")
          }}
        />
      )}
      {flowSetupDocuments.length > 0 && (
        <CreateFlowModal
          documents={flowSetupDocuments}
          onClose={() => setFlowSetupDocuments([])}
          onSubmit={() => {
            const submittedCodes = new Set(
              flowSetupDocuments.map((document) => document.code),
            )
            setDocumentData(
              managementDocuments.map((document) =>
                submittedCodes.has(document.code)
                  ? {
                    ...document,
                    date: "02/10/2026 15:20",
                    flow: "LT-MỚI/2026",
                    status: "Đã trình",
                    progress: "0/3 người",
                    handler: "Lê Văn A",
                    role: "Trưởng phòng",
                  }
                  : document,
              ),
            )
            setFlowSetupDocuments([])
            notify(
              `Đã trình ký ${flowSetupDocuments.length} văn bản thành công`,
            )
          }}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
