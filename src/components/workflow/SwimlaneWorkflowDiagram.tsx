import React, { useState, useEffect } from 'react';

export type WorkflowType = 'khoi-kien' | 'khieu-nai' | 'to-giac';

export interface SwimlaneStepNode {
  id: string;
  stepNumber: number;
  name: string;
  subTitle?: string;
  roleId: 'can-bo' | 'lanh-dao' | 'van-thu';
  stageIndex: number; // 0: Tiếp nhận, 1: Lệ phí/Điều kiện, 2: Thụ lý, 3: Xét xử/Xác minh, 4: Trả kết quả
  status: 'completed' | 'active' | 'pending' | 'skipped';
  tag?: string;
  tagColor?: 'blue' | 'emerald' | 'amber' | 'rose';
  checkboxes: { id: string; label: string; checked: boolean }[];
  legalBasis: string;
  timeLimit: string;
  aiAction: string;
  userConfirmationNeeded: {
    title: string;
    items: string[];
    actionLabel: string;
    draftDocName?: string;
  };
}

export interface SwimlaneConnection {
  id: string;
  from: string;
  to: string;
  label: string;
  style?: 'solid' | 'dashed';
  color?: string;
  labelPosition?: 'middle' | 'early' | 'late';
}

export interface SwimlaneWorkflowConfig {
  id: WorkflowType;
  title: string;
  lawBasisTitle: string;
  stages: string[];
  roles: { id: 'can-bo' | 'lanh-dao' | 'van-thu'; title: string }[];
  nodes: SwimlaneStepNode[];
  connections: SwimlaneConnection[];
}

// Fixed canvas geometry constants for pixel-perfect connector lines
const LANE_HEADER_WIDTH = 180;
const STAGE_COL_WIDTH = 230;
const LANE_ROW_HEIGHT = 185;
const CARD_WIDTH = 200;
const CARD_HEIGHT = 142;

// 1. CẤU HÌNH QUY TRÌNH KHỞI KIỆN / TRANH CHẤP DÂN SỰ (CHUẨN THEO ẢNH MẪU CỦA USER)
export const KHOI_KIEN_WORKFLOW: SwimlaneWorkflowConfig = {
  id: 'khoi-kien',
  title: 'Quy trình giải quyết đơn khởi kiện vụ án dân sự',
  lawBasisTitle: 'Căn cứ Bộ luật Tố tụng dân sự 2015 & Nghị quyết 326/2016/UBTVQH14',
  stages: ['Tiếp nhận', 'Lệ phí', 'Thụ lý', 'Xét xử', 'Trả kết quả'],
  roles: [
    { id: 'can-bo', title: 'Cán bộ chuyên môn' },
    { id: 'lanh-dao', title: 'Lãnh đạo, người có thẩm quyền' },
    { id: 'van-thu', title: 'Văn thư' },
  ],
  nodes: [
    {
      id: 'step-1',
      stepNumber: 1,
      name: 'Tiếp nhận và vào sổ đơn khởi kiện',
      roleId: 'van-thu',
      stageIndex: 0,
      status: 'completed',
      tag: 'Bắt đầu',
      tagColor: 'blue',
      checkboxes: [
        { id: 'c1', label: 'Đơn khởi kiện', checked: true },
        { id: 'c2', label: 'Tài liệu kèm theo', checked: true },
      ],
      legalBasis: 'Điều 191 Bộ luật Tố tụng dân sự 2015: Vào sổ nhận đơn, cấp giấy xác nhận đã nhận đơn cho người khởi kiện.',
      timeLimit: '03 ngày',
      aiAction: 'AI đã tự động bóc tách định danh công dân qua CCCD/VNeID, quét file PDF đơn gốc và lập mã vào sổ điện tử.',
      userConfirmationNeeded: {
        title: 'Xác nhận kiểm tra tính đầy đủ của hồ sơ đơn khởi kiện',
        items: [
          'Đơn có đủ chữ ký/điểm chỉ của người khởi kiện',
          'Tài liệu kèm theo có bản sao công chứng/chứng thực',
          'Thuộc thẩm quyền giải quyết theo lãnh thổ và loại việc'
        ],
        actionLabel: 'Xác nhận hồ sơ hợp lệ & Chuyển thông báo lệ phí',
        draftDocName: 'Giấy xác nhận đã nhận đơn khởi kiện.pdf',
      },
    },
    {
      id: 'step-2',
      stepNumber: 2,
      name: 'Thông báo và nhận biên lai lệ phí',
      roleId: 'can-bo',
      stageIndex: 1,
      status: 'active',
      tag: 'Đang làm',
      tagColor: 'amber',
      checkboxes: [
        { id: 'c3', label: 'Thông báo nộp tạm ứng án phí', checked: true },
        { id: 'c4', label: 'Đối soát biên lai thu tiền', checked: false },
      ],
      legalBasis: 'Điều 195 Bộ luật Tố tụng dân sự 2015: Thông báo nộp tiền tạm ứng án phí trong thời hạn 07 ngày làm việc.',
      timeLimit: '07 ngày làm việc',
      aiAction: 'AI tự động tính toán mức tạm ứng án phí (15.000.000 VNĐ) dựa trên giá trị tranh chấp và tạo thông báo kèm mã QR Kho bạc.',
      userConfirmationNeeded: {
        title: 'Cần Cán bộ xác nhận biên lai nộp tiền tạm ứng án phí',
        items: [
          'Kiểm tra biên lai chuyển khoản ngân hàng / Kho bạc Nhà nước đã khớp mã hồ sơ',
          'Xác nhận người nộp không thuộc diện miễn, giảm tạm ứng án phí',
          'Duyệt thông báo xác nhận đã nộp tạm ứng án phí để chuyển Lãnh đạo'
        ],
        actionLabel: '✓ Xác nhận đã nộp biên lai lệ phí & Trình Lãnh đạo thụ lý',
        draftDocName: 'Thông báo nộp tiền tạm ứng án phí.pdf',
      },
    },
    {
      id: 'step-3',
      stepNumber: 3,
      name: 'Xác nhận thụ lý',
      subTitle: 'Quyết định thụ lý → Đã thụ lý',
      roleId: 'lanh-dao',
      stageIndex: 2,
      status: 'pending',
      tag: 'Phê duyệt',
      tagColor: 'rose',
      checkboxes: [
        { id: 'c5', label: 'Ký duyệt Quyết định thụ lý vụ án', checked: false },
        { id: 'c6', label: 'Phân công Thẩm phán giải quyết', checked: false },
      ],
      legalBasis: 'Điều 196 Bộ luật Tố tụng dân sự 2015: Thụ lý vụ án và ban hành thông báo thụ lý trong 03 ngày làm việc kể từ ngày nhận biên lai.',
      timeLimit: '03 ngày',
      aiAction: 'AI dự thảo Thông báo thụ lý vụ án và đề xuất Thẩm phán có chuyên môn phù hợp với loại hình tranh chấp hợp đồng.',
      userConfirmationNeeded: {
        title: 'Lãnh đạo ký số phê duyệt Quyết định thụ lý vụ án',
        items: [
          'Kiểm tra điều kiện khởi kiện theo luật định',
          'Ký số Thông báo thụ lý vụ án gửi đương sự và Viện kiểm sát',
          'Ban hành Quyết định phân công Thẩm phán chủ tọa'
        ],
        actionLabel: '✓ Lãnh đạo Ký số thụ lý & Chuyển sang chuẩn bị xét xử',
        draftDocName: 'Thông báo thụ lý vụ án dân sự số 18/2026/TB-TLVA.pdf',
      },
    },
    {
      id: 'step-4',
      stepNumber: 4,
      name: 'Chuẩn bị xét xử và mở phiên tòa',
      roleId: 'can-bo',
      stageIndex: 3,
      status: 'pending',
      tag: 'Nghiệp vụ',
      tagColor: 'blue',
      checkboxes: [
        { id: 'c7', label: 'Thu thập chứng cứ & Lấy lời khai', checked: false },
        { id: 'c8', label: 'Hòa giải & Quyết định đưa ra xét xử', checked: false },
      ],
      legalBasis: 'Điều 203, 208, 220 Bộ luật Tố tụng dân sự 2015: Thời hạn chuẩn bị xét xử 04 tháng; tổ chức phiên họp kiểm tra chứng cứ và hòa giải.',
      timeLimit: '04 tháng',
      aiAction: 'AI tổng hợp toàn bộ mâu thuẫn lời khai hai bên, bóc tách hợp đồng, hỗ trợ lập bảng so sánh chứng cứ phục vụ phiên hòa giải.',
      userConfirmationNeeded: {
        title: 'Thẩm phán xác nhận kết quả hòa giải / Quyết định đưa vụ án ra xét xử',
        items: [
          'Lập Biên bản kiểm tra việc giao nộp, tiếp cận, công khai chứng cứ',
          'Lập Biên bản hòa giải (thành hoặc không thành)',
          'Ban hành Quyết định đưa vụ án ra xét xử và tống đạt lịch mở phiên tòa'
        ],
        actionLabel: '✓ Xác nhận kết thúc chuẩn bị xét xử & Chuyển trả kết quả',
        draftDocName: 'Quyết định đưa vụ án ra xét xử số 42/2026/QĐXX-DS.pdf',
      },
    },
    {
      id: 'step-5',
      stepNumber: 5,
      name: 'Trả kết quả và lưu hồ sơ',
      roleId: 'van-thu',
      stageIndex: 4,
      status: 'pending',
      tag: 'Kết thúc',
      tagColor: 'rose',
      checkboxes: [
        { id: 'c9', label: 'Bản án → Kết thúc', checked: false },
        { id: 'c10', label: 'Lời dặn dò', checked: false },
      ],
      legalBasis: 'Điều 269 Bộ luật Tố tụng dân sự 2015: Giao bản án/quyết định cho các đương sự trong thời hạn 10 ngày kể từ ngày tuyên án.',
      timeLimit: '10 ngày',
      aiAction: 'AI tự động đồng bộ bản án lên Cổng thông tin Tòa án điện tử, tạo mã số lưu trữ hồ sơ vĩnh viễn và gửi thông báo SMS/Zalo cho công dân.',
      userConfirmationNeeded: {
        title: 'Văn thư xác nhận giao nhận văn bản và đóng sổ hồ sơ',
        items: [
          'Tống đạt bản án cho Viện kiểm sát và các bên đương sự có ký nhận',
          'Kiểm tra đủ thành phần tài liệu theo mục lục hồ sơ lưu trữ',
          'Khóa sổ theo dõi thụ lý và lưu kho điện tử'
        ],
        actionLabel: '✓ Xác nhận đã trả kết quả & Đóng hồ sơ vụ việc',
        draftDocName: 'Biên bản tống đạt Bản án / Quyết định giải quyết.pdf',
      },
    },
  ],
  connections: [
    // 1. Tuyến chính từ Bước 1 lên Bước 2
    { id: 'conn-1-2', from: 'step-1', to: 'step-2', label: 'thông báo nộp lệ phí', style: 'solid', color: '#2563eb' },
    // 2. Tuyến phụ (nhánh rẽ nét đứt) từ Bước 1 trực tiếp sang Bước 3 (trường hợp được miễn lệ phí)
    { id: 'conn-1-3', from: 'step-1', to: 'step-3', label: 'nộp thông báo lệ phí', style: 'dashed', color: '#ef4444' },
    // 3. Tuyến từ Bước 2 xuống Bước 3 khi có biên lai lệ phí
    { id: 'conn-2-3', from: 'step-2', to: 'step-3', label: 'có biên lai lệ phí', style: 'solid', color: '#2563eb' },
    // 4. Tuyến từ Bước 3 lên Bước 4 khi có quyết định thụ lý ban hành
    { id: 'conn-3-4', from: 'step-3', to: 'step-4', label: 'quyết định thụ lý ban hành', style: 'solid', color: '#2563eb' },
    // 5. Tuyến từ Bước 4 xuống Bước 5 khi có bản án / quyết định
    { id: 'conn-4-5', from: 'step-4', to: 'step-5', label: 'có bản án / quyết định', style: 'solid', color: '#2563eb' },
    // 6. Nhánh nét đứt chuyển văn bản từ thụ lý sang trả kết quả nếu đình chỉ/trả lại đơn
    { id: 'conn-3-5', from: 'step-3', to: 'step-5', label: 'trả hồ sơ yêu cầu bổ sung', style: 'dashed', color: '#ef4444' },
  ],
};

// 2. CẤU HÌNH QUY TRÌNH GIẢI QUYẾT KHIẾU NẠI HÀNH CHÍNH (ĐẤT ĐAI & BỒI THƯỜNG)
export const KHIEU_NAI_WORKFLOW: SwimlaneWorkflowConfig = {
  id: 'khieu-nai',
  title: 'Quy trình giải quyết đơn khiếu nại hành chính (Đất đai, bồi thường)',
  lawBasisTitle: 'Căn cứ Luật Khiếu nại 2011 & Luật Đất đai 2024 & Thông tư 05/2021/TT-TTCP',
  stages: ['Tiếp nhận', 'Điều kiện', 'Thụ lý', 'Xác minh & Đối thoại', 'Trả kết quả'],
  roles: [
    { id: 'can-bo', title: 'Cán bộ thụ lý / Phòng TN&MT' },
    { id: 'lanh-dao', title: 'Chủ tịch UBND / Người có thẩm quyền' },
    { id: 'van-thu', title: 'Văn thư / Ban Tiếp công dân' },
  ],
  nodes: [
    {
      id: 'kn-1',
      stepNumber: 1,
      name: 'Tiếp nhận & Vào sổ đơn khiếu nại',
      roleId: 'van-thu',
      stageIndex: 0,
      status: 'completed',
      tag: 'Bắt đầu',
      tagColor: 'blue',
      checkboxes: [
        { id: 'kn_c1', label: 'Đơn khiếu nại ký tên', checked: true },
        { id: 'kn_c2', label: 'Quyết định bị khiếu nại', checked: true },
      ],
      legalBasis: 'Điều 12 Luật Khiếu nại 2011: Tiếp nhận và lập biên bản giao nhận hồ sơ khiếu nại.',
      timeLimit: '01 ngày',
      aiAction: 'AI bóc tách Quyết định thu hồi đất số 45/TB-UBND và bản scan đơn khiếu nại của công dân.',
      userConfirmationNeeded: {
        title: 'Xác nhận tiếp nhận hồ sơ khiếu nại của công dân',
        items: [
          'Kiểm tra đúng thẩm quyền địa bàn quận/huyện',
          'Đơn khiếu nại có chữ ký hoặc điểm chỉ trực tiếp',
          'Đã cấp Giấy biên nhận hồ sơ cho người khiếu nại'
        ],
        actionLabel: 'Xác nhận hồ sơ tiếp nhận hợp lệ & Chuyển kiểm tra điều kiện',
        draftDocName: 'Giấy biên nhận hồ sơ khiếu nại.pdf',
      },
    },
    {
      id: 'kn-2',
      stepNumber: 2,
      name: 'Kiểm tra thời hiệu & Lập Tờ trình thụ lý',
      roleId: 'can-bo',
      stageIndex: 1,
      status: 'active',
      tag: 'Đang làm',
      tagColor: 'amber',
      checkboxes: [
        { id: 'kn_c3', label: 'Thời hiệu khiếu nại trong hạn 90 ngày', checked: true },
        { id: 'kn_c4', label: 'Đơn thuộc thẩm quyền thụ lý', checked: true },
      ],
      legalBasis: 'Điều 9, Điều 11 Luật Khiếu nại 2011: Kiểm tra thời hiệu và điều kiện thụ lý khiếu nại trong 10 ngày.',
      timeLimit: '05 ngày',
      aiAction: 'AI đối chiếu mốc ngày ban hành QĐ thu hồi đất với ngày nộp đơn: Đơn nộp sau 22 ngày (còn trong thời hiệu 90 ngày). Tự động soạn Tờ trình thụ lý.',
      userConfirmationNeeded: {
        title: 'Cần Cán bộ thụ lý duyệt Tờ trình đủ điều kiện thụ lý khiếu nại',
        items: [
          'Xác nhận công dân đứng đơn là đối tượng bị tác động trực tiếp bởi QĐ thu hồi đất',
          'Đơn chưa được Tòa án thụ lý giải quyết',
          'Duyệt dự thảo Thông báo thụ lý giải quyết khiếu nại lần 1'
        ],
        actionLabel: '✓ Cán bộ duyệt Tờ trình & Trình Lãnh đạo ký Thông báo thụ lý',
        draftDocName: 'Tờ trình đề xuất thụ lý giải quyết khiếu nại lần 1.pdf',
      },
    },
    {
      id: 'kn-3',
      stepNumber: 3,
      name: 'Ký ban hành Thông báo thụ lý & Thành lập Tổ xác minh',
      subTitle: 'Quyết định thụ lý → Đã thụ lý',
      roleId: 'lanh-dao',
      stageIndex: 2,
      status: 'pending',
      tag: 'Phê duyệt',
      tagColor: 'rose',
      checkboxes: [
        { id: 'kn_c5', label: 'Ký Thông báo thụ lý gửi công dân', checked: false },
        { id: 'kn_c6', label: 'Thành lập Tổ xác minh thực địa', checked: false },
      ],
      legalBasis: 'Điều 27 Luật Khiếu nại 2011: Ban hành thông báo thụ lý và thành lập Tổ xác minh.',
      timeLimit: '03 ngày',
      aiAction: 'AI gợi ý danh sách cán bộ Tổ xác minh gồm đại diện Phòng TN&MT, Thanh tra quận và UBND phường sở tại.',
      userConfirmationNeeded: {
        title: 'Lãnh đạo UBND ký số ban hành Quyết định thụ lý & Tổ xác minh',
        items: [
          'Ký số Thông báo thụ lý gửi người khiếu nại trong thời hạn 10 ngày',
          'Ký Quyết định thành lập Tổ xác minh nội dung khiếu nại bồi thường đất',
          'Giao Phòng TN&MT làm Tổ trưởng tổ xác minh'
        ],
        actionLabel: '✓ Lãnh đạo Ký số thụ lý & Chuyển giao Tổ xác minh thực địa',
        draftDocName: 'Thông báo thụ lý giải quyết khiếu nại số 89/TB-UBND.pdf',
      },
    },
    {
      id: 'kn-4',
      stepNumber: 4,
      name: 'Kiểm tra thực địa & Tổ chức đối thoại trực tiếp',
      roleId: 'can-bo',
      stageIndex: 3,
      status: 'pending',
      tag: 'Nghiệp vụ',
      tagColor: 'blue',
      checkboxes: [
        { id: 'kn_c7', label: 'Đo đạc hiện trạng thửa đất', checked: false },
        { id: 'kn_c8', label: 'Đối thoại công khai với công dân', checked: false },
      ],
      legalBasis: 'Điều 29, Điều 30 Luật Khiếu nại 2011: Tổ chức đối thoại trực tiếp trước khi ban hành quyết định giải quyết.',
      timeLimit: '20 ngày',
      aiAction: 'AI bóc tách dữ liệu bản đồ địa chính thửa đất số 45, đối chiếu đơn giá 18.5 tr/m² với bảng giá đất hiện hành để chuẩn bị tài liệu đối thoại.',
      userConfirmationNeeded: {
        title: 'Cán bộ xác nhận kết quả đối thoại và lập Báo cáo xác minh',
        items: [
          'Lập Biên bản kiểm tra hiện trạng sử dụng đất có chữ ký đại diện tổ chức, hộ gia đình',
          'Lập Biên bản đối thoại có chữ ký người khiếu nại và người giải quyết',
          'Hoàn thành Báo cáo kết quả xác minh nội dung khiếu nại'
        ],
        actionLabel: '✓ Xác nhận kết quả đối thoại & Trình Lãnh đạo ban hành Quyết định',
        draftDocName: 'Biên bản đối thoại giải quyết khiếu nại đất đai.pdf',
      },
    },
    {
      id: 'kn-5',
      stepNumber: 5,
      name: 'Ký Quyết định giải quyết khiếu nại & Trả kết quả',
      roleId: 'van-thu',
      stageIndex: 4,
      status: 'pending',
      tag: 'Kết thúc',
      tagColor: 'rose',
      checkboxes: [
        { id: 'kn_c9', label: 'QĐ giải quyết khiếu nại', checked: false },
        { id: 'kn_c10', label: 'Bàn giao & Lưu trữ hồ sơ', checked: false },
      ],
      legalBasis: 'Điều 31, Điều 32 Luật Khiếu nại 2011: Ban hành quyết định giải quyết khiếu nại và gửi các bên liên quan.',
      timeLimit: '03 ngày',
      aiAction: 'AI soạn thảo dự thảo Quyết định giải quyết khiếu nại lần 1 và tự động đồng bộ kết quả lên Hệ thống Cơ sở dữ liệu Quốc gia về Khiếu nại tố cáo.',
      userConfirmationNeeded: {
        title: 'Văn thư xác nhận phát hành Quyết định giải quyết khiếu nại',
        items: [
          'Lấy số văn thư và đóng dấu / ký số Quyết định giải quyết khiếu nại',
          'Gửi bảo đảm hoặc trao trực tiếp cho người khiếu nại có ký nhận',
          'Đóng gói hồ sơ và chuyển lưu trữ điện tử'
        ],
        actionLabel: '✓ Xác nhận đã gửi văn bản & Kết thúc vụ việc khiếu nại',
        draftDocName: 'Quyết định giải quyết khiếu nại lần 1 số 142/QĐ-UBND.pdf',
      },
    },
  ],
  connections: [
    { id: 'conn-kn-1-2', from: 'kn-1', to: 'kn-2', label: 'chuyển xác minh điều kiện', style: 'solid', color: '#2563eb' },
    { id: 'conn-kn-2-3', from: 'kn-2', to: 'kn-3', label: 'đủ điều kiện thụ lý', style: 'solid', color: '#2563eb' },
    { id: 'conn-kn-3-4', from: 'kn-3', to: 'kn-4', label: 'quyết định thụ lý ban hành', style: 'solid', color: '#2563eb' },
    { id: 'conn-kn-4-5', from: 'kn-4', to: 'kn-5', label: 'kết luận xác minh & đối thoại', style: 'solid', color: '#2563eb' },
    { id: 'conn-kn-2-5', from: 'kn-2', to: 'kn-5', label: 'không đủ điều kiện / trả đơn', style: 'dashed', color: '#ef4444' },
  ],
};

// 3. CẤU HÌNH QUY TRÌNH GIẢI QUYẾT NGUỒN TIN TỐ GIÁC TỘI PHẠM (BLTTHS 2015)
export const TO_GIAC_WORKFLOW: SwimlaneWorkflowConfig = {
  id: 'to-giac',
  title: 'Quy trình giải quyết nguồn tin tố giác, tin báo về tội phạm',
  lawBasisTitle: 'Căn cứ Bộ luật Tố tụng hình sự 2015 & Thông tư liên tịch 01/2017/TTLT',
  stages: ['Tiếp nhận', 'Phân loại sơ bộ', 'Phân công', 'Xác minh & Triệu tập', 'Kết luận & Quyết định'],
  roles: [
    { id: 'can-bo', title: 'Điều tra viên / Cán bộ thụ lý' },
    { id: 'lanh-dao', title: 'Thủ trưởng / Phó Thủ trưởng Cơ quan CSĐT' },
    { id: 'van-thu', title: 'Văn thư / Trực ban hình sự' },
  ],
  nodes: [
    {
      id: 'tg-1',
      stepNumber: 1,
      name: 'Tiếp nhận & Vào sổ tiếp nhận nguồn tin',
      roleId: 'van-thu',
      stageIndex: 0,
      status: 'completed',
      tag: 'Bắt đầu',
      tagColor: 'blue',
      checkboxes: [
        { id: 'tg_c1', label: 'Đơn tố giác bản gốc', checked: true },
        { id: 'tg_c2', label: 'Tài liệu chứng cứ giao nộp', checked: true },
      ],
      legalBasis: 'Điều 145, 146 BLTTHS 2015: Tiếp nhận, vào sổ tiếp nhận nguồn tin tội phạm và giao giấy xác nhận.',
      timeLimit: '24 giờ',
      aiAction: 'AI bóc tách tài liệu hợp đồng đầu tư, biên lai ủy nhiệm chi 3.5 tỷ VNĐ và lập mã thụ lý điện tử.',
      userConfirmationNeeded: {
        title: 'Xác nhận lập biên bản giao nhận nguồn tin tội phạm',
        items: [
          'Đối chiếu danh tính người tố giác qua VNeID',
          'Lập biên bản kiểm đếm toàn bộ tài liệu đính kèm',
          'Vào sổ đăng ký nguồn tin tội phạm điện tử'
        ],
        actionLabel: 'Xác nhận vào sổ nguồn tin & Chuyển phân loại sơ bộ',
        draftDocName: 'Biên bản tiếp nhận nguồn tin tố giác tội phạm.pdf',
      },
    },
    {
      id: 'tg-2',
      stepNumber: 2,
      name: 'Kiểm tra hồ sơ & Đối soát chứng cứ ban đầu',
      roleId: 'can-bo',
      stageIndex: 1,
      status: 'active',
      tag: 'Đang làm',
      tagColor: 'amber',
      checkboxes: [
        { id: 'tg_c3', label: 'Đối soát file hợp đồng, phiếu nộp tiền', checked: true },
        { id: 'tg_c4', label: 'Phát hiện chứng từ còn thiếu', checked: false },
      ],
      legalBasis: 'Điều 147 BLTTHS 2015: Kiểm tra xác minh sơ bộ điều kiện cấu thành tội phạm và dấu hiệu hình sự.',
      timeLimit: '03 ngày',
      aiAction: 'AI phát hiện hợp đồng thiếu bản gốc sao kê ngân hàng và văn bản ủy quyền luật sư chưa công chứng.',
      userConfirmationNeeded: {
        title: 'Cán bộ xác nhận dấu hiệu tội phạm & Báo cáo đề xuất thụ lý',
        items: [
          'Hành vi có dấu hiệu tội Lừa đảo chiếm đoạt tài sản (Điều 174 BLHS)',
          'Thuộc thẩm quyền giải quyết của Cơ quan CSĐT Công an TP',
          'Lập Phiếu yêu cầu bổ sung sao kê tài khoản ngân hàng'
        ],
        actionLabel: '✓ Cán bộ duyệt Báo cáo sơ bộ & Trình Lãnh đạo phân công ĐTV',
        draftDocName: 'Báo cáo đề xuất kiểm tra xác minh nguồn tin tội phạm.pdf',
      },
    },
    {
      id: 'tg-3',
      stepNumber: 3,
      name: 'Ban hành QĐ phân công Điều tra viên thụ lý',
      subTitle: 'Quyết định phân công → Đã phân công',
      roleId: 'lanh-dao',
      stageIndex: 2,
      status: 'pending',
      tag: 'Phê duyệt',
      tagColor: 'rose',
      checkboxes: [
        { id: 'tg_c5', label: 'Ký Quyết định phân công ĐTV', checked: false },
        { id: 'tg_c6', label: 'Gửi thông báo đến VKS cùng cấp', checked: false },
      ],
      legalBasis: 'Điều 145 BLTTHS 2015: Thủ trưởng Cơ quan CSĐT ra Quyết định phân công Phó Thủ trưởng và Điều tra viên giải quyết.',
      timeLimit: '03 ngày',
      aiAction: 'AI dự thảo Quyết định phân công Điều tra viên và văn bản thông báo gửi Viện kiểm sát nhân dân cùng cấp.',
      userConfirmationNeeded: {
        title: 'Thủ trưởng Cơ quan CSĐT ký Quyết định phân công Điều tra viên',
        items: [
          'Ký số Quyết định phân công Điều tra viên thụ lý chính',
          'Gửi văn bản thông báo phân công cho Viện kiểm sát trong thời hạn 03 ngày',
          'Giao nhiệm vụ áp dụng các biện pháp ngăn chặn nếu cần'
        ],
        actionLabel: '✓ Thủ trưởng ký Quyết định phân công & Chuyển xác minh thực tế',
        draftDocName: 'Quyết định phân công Điều tra viên giải quyết nguồn tin số 112/QĐ-CQĐT.pdf',
      },
    },
    {
      id: 'tg-4',
      stepNumber: 4,
      name: 'Xác minh thực tế, dòng tiền & Triệu tập đương sự',
      roleId: 'can-bo',
      stageIndex: 3,
      status: 'pending',
      tag: 'Nghiệp vụ',
      tagColor: 'blue',
      checkboxes: [
        { id: 'tg_c7', label: 'Triệu tập đối tượng bị tố giác', checked: false },
        { id: 'tg_c8', label: 'Tra soát dòng tiền ngân hàng', checked: false },
      ],
      legalBasis: 'Điều 147, Điều 168 BLTTHS 2015: Triệu tập, ghi lời khai và yêu cầu cơ quan tổ chức cung cấp thông tin tài liệu.',
      timeLimit: '20 ngày',
      aiAction: 'AI lập sơ đồ dòng tiền luân chuyển giữa các tài khoản ngân hàng và tự động tạo giấy triệu tập đối tượng Trần Văn B.',
      userConfirmationNeeded: {
        title: 'Điều tra viên xác nhận kết quả điều tra và lập Bản kết luận xác minh',
        items: [
          'Hoàn thành biên bản ghi lời khai người tố giác và bên bị tố giác',
          'Có kết quả sao kê tài khoản ngân hàng chứng minh dòng tiền 3.5 tỷ VNĐ',
          'Lập Báo cáo kết luận xác minh đề xuất Khởi tố vụ án hình sự'
        ],
        actionLabel: '✓ Điều tra viên lập Kết luận & Trình Thủ trưởng phê duyệt quyết định',
        draftDocName: 'Bản kết luận xác minh nguồn tin tội phạm số 45/KL-PC03.pdf',
      },
    },
    {
      id: 'tg-5',
      stepNumber: 5,
      name: 'Quyết định Khởi tố vụ án & Thông báo kết quả',
      roleId: 'van-thu',
      stageIndex: 4,
      status: 'pending',
      tag: 'Kết thúc',
      tagColor: 'rose',
      checkboxes: [
        { id: 'tg_c9', label: 'Khởi tố vụ án hình sự', checked: false },
        { id: 'tg_c10', label: 'Thông báo kết quả giải quyết', checked: false },
      ],
      legalBasis: 'Điều 153, 154 BLTTHS 2015: Quyết định khởi tố hoặc không khởi tố vụ án hình sự và gửi VKS phê chuẩn.',
      timeLimit: '24 giờ',
      aiAction: 'AI dự thảo Quyết định khởi tố vụ án hình sự về tội Lừa đảo chiếm đoạt tài sản và văn bản thông báo gửi người tố giác.',
      userConfirmationNeeded: {
        title: 'Thủ trưởng CQĐT duyệt Quyết định khởi tố & Chuyển VKS phê chuẩn',
        items: [
          'Ký Quyết định khởi tố vụ án hình sự số 28/QĐ-CSĐT',
          'Chuyển hồ sơ sang Viện kiểm sát nhân dân cùng cấp phê chuẩn',
          'Văn thư tống đạt thông báo kết quả giải quyết cho người tố giác'
        ],
        actionLabel: '✓ Ký Quyết định Khởi tố & Hoàn tất giai đoạn thụ lý nguồn tin',
        draftDocName: 'Quyết định khởi tố vụ án hình sự số 28/QĐ-CSĐT.pdf',
      },
    },
  ],
  connections: [
    { id: 'conn-tg-1-2', from: 'tg-1', to: 'tg-2', label: 'chuyển kiểm tra sơ bộ', style: 'solid', color: '#2563eb' },
    { id: 'conn-tg-2-3', from: 'tg-2', to: 'tg-3', label: 'báo cáo dấu hiệu tội phạm', style: 'solid', color: '#2563eb' },
    { id: 'conn-tg-3-4', from: 'tg-3', to: 'tg-4', label: 'phân công điều tra viên', style: 'solid', color: '#2563eb' },
    { id: 'conn-tg-4-5', from: 'tg-4', to: 'tg-5', label: 'kết luận xác minh nguồn tin', style: 'solid', color: '#2563eb' },
    { id: 'conn-tg-2-5', from: 'tg-2', to: 'tg-5', label: 'không có dấu hiệu tội phạm', style: 'dashed', color: '#ef4444' },
  ],
};

interface SwimlaneWorkflowDiagramProps {
  initialWorkflowType?: WorkflowType;
  donCode?: string;
  donTitle?: string;
  nguoiNop?: string;
  onConfirmStep?: (step: SwimlaneStepNode) => void;
}

export default function SwimlaneWorkflowDiagram({
  initialWorkflowType = 'khoi-kien',
  donCode = 'Đ-2026-00125',
  donTitle = 'Tố giác vi phạm lừa đảo chiếm đoạt tài sản (Dự án Khu đô thị Y)',
  nguoiNop = 'Nguyễn Văn A',
  onConfirmStep,
}: SwimlaneWorkflowDiagramProps) {
  // Lựa chọn loại quy trình
  const [currentWorkflowType, setCurrentWorkflowType] = useState<WorkflowType>(initialWorkflowType);

  const getWorkflowConfig = (type: WorkflowType): SwimlaneWorkflowConfig => {
    switch (type) {
      case 'khieu-nai':
        return KHIEU_NAI_WORKFLOW;
      case 'to-giac':
        return TO_GIAC_WORKFLOW;
      case 'khoi-kien':
      default:
        return KHOI_KIEN_WORKFLOW;
    }
  };

  const [workflow, setWorkflow] = useState<SwimlaneWorkflowConfig>(getWorkflowConfig(currentWorkflowType));
  const [nodes, setNodes] = useState<SwimlaneStepNode[]>(workflow.nodes);
  const [activeStepId, setActiveStepId] = useState<string>(
    workflow.nodes.find((n) => n.status === 'active')?.id || workflow.nodes[0].id
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>(activeStepId);

  // Zoom và View Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Đồng bộ khi đổi loại đơn / quy trình
  useEffect(() => {
    const nextWf = getWorkflowConfig(currentWorkflowType);
    setWorkflow(nextWf);
    setNodes(nextWf.nodes);
    const firstActive = nextWf.nodes.find((n) => n.status === 'active')?.id || nextWf.nodes[0].id;
    setActiveStepId(firstActive);
    setSelectedNodeId(firstActive);
  }, [currentWorkflowType]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3800);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const activeNode = nodes.find((n) => n.id === activeStepId) || nodes[0];

  // Hàm tính toán đường nối gấp khúc vuông góc mượt mà (Orthogonal Stepped Path with Rounded Corners)
  const getOrthogonalPath = (x1: number, y1: number, x2: number, y2: number, r: number = 8): string => {
    if (Math.abs(y1 - y2) < 4) {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    const xMid = Math.round((x1 + x2) / 2);
    const dirY = y2 > y1 ? 1 : -1;
    const dirX = x2 > xMid ? 1 : -1;

    const maxR = Math.min(r, Math.abs(xMid - x1) / 2, Math.abs(y2 - y1) / 2, Math.abs(x2 - xMid) / 2);
    const safeR = Math.max(2, Math.floor(maxR));

    return [
      `M ${x1} ${y1}`,
      `L ${xMid - safeR} ${y1}`,
      `Q ${xMid} ${y1} ${xMid} ${y1 + dirY * safeR}`,
      `L ${xMid} ${y2 - dirY * safeR}`,
      `Q ${xMid} ${y2} ${xMid + dirX * safeR} ${y2}`,
      `L ${x2} ${y2}`,
    ].join(' ');
  };

  // Hàm tính tọa độ chính xác của các cổng kết nối (Port coordinates)
  const getNodeCoordinates = (node: SwimlaneStepNode | undefined) => {
    if (!node) {
      return { cx: 0, cy: 0, left: 0, right: 0, top: 0, bottom: 0 };
    }
    const roleIdx = Math.max(0, workflow.roles.findIndex((r) => r.id === node.roleId));
    const cx = LANE_HEADER_WIDTH + node.stageIndex * STAGE_COL_WIDTH + STAGE_COL_WIDTH / 2;
    const cy = roleIdx * LANE_ROW_HEIGHT + LANE_ROW_HEIGHT / 2;
    return {
      cx,
      cy,
      left: cx - CARD_WIDTH / 2,
      right: cx + CARD_WIDTH / 2,
      top: cy - CARD_HEIGHT / 2,
      bottom: cy + CARD_HEIGHT / 2,
    };
  };

  // 1. Xác nhận hoàn thành bước này (Cán bộ có thể hoàn thành bất kỳ bước nào, không ép buộc tuần tự)
  const handleMarkStepCompleted = (stepId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === stepId) {
          return {
            ...n,
            status: 'completed' as const,
            checkboxes: n.checkboxes.map((c) => ({ ...c, checked: true })),
          };
        }
        return n;
      })
    );
    const step = nodes.find((n) => n.id === stepId);
    showToast(`✓ Đã xác nhận hoàn thành thao tác: Bước ${step?.stepNumber} - "${step?.name}"`);
    if (onConfirmStep && step) {
      onConfirmStep(step);
    }
  };

  // 2. Chuyển tiêu điểm: Đặt bước này làm bước đang thao tác
  const handleSetStepActive = (stepId: string) => {
    setActiveStepId(stepId);
    setSelectedNodeId(stepId);
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === stepId) return { ...n, status: 'active' as const };
        if (n.status === 'active') return { ...n, status: 'pending' as const };
        return n;
      })
    );
    const step = nodes.find((n) => n.id === stepId);
    showToast(`● Đã chuyển sang tập trung thao tác: Bước ${step?.stepNumber} - "${step?.name}"`);
  };

  // 3. Bỏ qua bước (Không áp dụng cho hồ sơ vụ việc này - ví dụ miễn án phí, không qua hòa giải,...)
  const handleSkipStep = (stepId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === stepId) {
          return { ...n, status: 'skipped' as const };
        }
        return n;
      })
    );
    const step = nodes.find((n) => n.id === stepId);
    showToast(`⏭ Đã đánh dấu bỏ qua: Bước ${step?.stepNumber} (Không áp dụng cho hồ sơ này).`);
  };

  // 4. Mở lại bước đã hoàn thành hoặc đã bỏ qua để tiếp tục chỉnh sửa
  const handleReopenStep = (stepId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === stepId) {
          return { ...n, status: 'active' as const };
        }
        return n;
      })
    );
    setActiveStepId(stepId);
    setSelectedNodeId(stepId);
    const step = nodes.find((n) => n.id === stepId);
    showToast(`↺ Đã mở lại Bước ${step?.stepNumber} để cán bộ tiếp tục thực hiện.`);
  };

  // 5. Tùy chọn: Hoàn thành và chuyển tiếp sang bước liền kề
  const handleConfirmAndAdvance = (stepId: string) => {
    const currentIndex = nodes.findIndex((n) => n.id === stepId);
    if (currentIndex === -1) return;

    const currentStep = nodes[currentIndex];
    const nextStep = nodes[currentIndex + 1];

    const updatedNodes = nodes.map((n, idx) => {
      if (idx === currentIndex) {
        return {
          ...n,
          status: 'completed' as const,
          checkboxes: n.checkboxes.map((c) => ({ ...c, checked: true })),
        };
      }
      if (nextStep && idx === currentIndex + 1 && n.status !== 'completed' && n.status !== 'skipped') {
        return { ...n, status: 'active' as const };
      }
      return n;
    });

    setNodes(updatedNodes);

    if (nextStep) {
      setActiveStepId(nextStep.id);
      setSelectedNodeId(nextStep.id);
      showToast(
        `✓ Đã xong Bước ${currentStep.stepNumber}. Chuyển sang gợi ý Bước ${nextStep.stepNumber}: "${nextStep.name}"!`
      );
    } else {
      showToast(`✓ Đã hoàn thành tất cả các bước trong quy trình!`);
    }

    if (onConfirmStep) {
      onConfirmStep(currentStep);
    }
  };

  // Tự động mô phỏng AI chạy từng bước (AI Simulation mode)
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setNodes((prevNodes) => {
        const activeIdx = prevNodes.findIndex((n) => n.status === 'active');
        if (activeIdx === -1 || activeIdx >= prevNodes.length - 1) {
          setIsSimulating(false);
          showToast('✓ AI đã hoàn thành mô phỏng toàn bộ tiến trình quy trình.');
          return prevNodes;
        }

        const nextNodes = prevNodes.map((n, idx) => {
          if (idx === activeIdx) return { ...n, status: 'completed' as const };
          if (idx === activeIdx + 1) return { ...n, status: 'active' as const };
          return n;
        });

        const nextNode = nextNodes[activeIdx + 1];
        setActiveStepId(nextNode.id);
        setSelectedNodeId(nextNode.id);
        showToast(`🤖 AI đã chạy đến Bước ${nextNode.stepNumber}: "${nextNode.name}". Đang highlight và chờ cán bộ xác nhận.`);
        return nextNodes;
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [isSimulating]);

  // Toggle checkbox trong bước
  const handleToggleCheckbox = (nodeId: string, checkboxId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            checkboxes: n.checkboxes.map((c) => (c.id === checkboxId ? { ...c, checked: !c.checked } : c)),
          };
        }
        return n;
      })
    );
  };

  // Kích thước cố định của canvas SVG
  const CANVAS_EXTRA_RIGHT = 90;
  const canvasWidth = LANE_HEADER_WIDTH + workflow.stages.length * STAGE_COL_WIDTH + CANVAS_EXTRA_RIGHT;
  const canvasHeight = workflow.roles.length * LANE_ROW_HEIGHT;

  // Node đầu tiên và Node cuối cùng
  const firstNode = nodes[0];
  const lastNode = nodes[nodes.length - 1];
  const firstCoords = getNodeCoordinates(firstNode);
  const lastCoords = getNodeCoordinates(lastNode);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-800 select-none overflow-hidden font-body-md">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP TOOLBAR: CHỌN LOẠI ĐƠN & MÔ PHỎNG AI                                */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 flex-wrap shrink-0 shadow-2xs">
        {/* Left: Workflow Name & Law Basis */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">account_tree</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {workflow.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#004ac6] border border-blue-200">
                {workflow.nodes.length} bước tác nghiệp
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI tự động điều phối
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ⚖️ <strong className="text-slate-700">{workflow.lawBasisTitle}</strong>
            </p>
          </div>
        </div>

        {/* Right Controls: Switch Workflow & AI Simulate */}
        <div className="flex items-center gap-2.5">
          {/* Quick Workflow Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {[
              { id: 'khoi-kien', label: 'Khởi kiện dân sự (BLTTDS)' },
              { id: 'khieu-nai', label: 'Khiếu nại đất đai (Luật KN)' },
              { id: 'to-giac', label: 'Tố giác tội phạm (BLTTHS)' },
            ].map((wf) => (
              <button
                key={wf.id}
                type="button"
                onClick={() => setCurrentWorkflowType(wf.id as WorkflowType)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                  currentWorkflowType === wf.id
                    ? 'bg-[#004ac6] text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {wf.label}
              </button>
            ))}
          </div>

          {/* AI Simulation Auto-run button */}
          <button
            type="button"
            onClick={() => {
              if (!isSimulating) {
                if (nodes.every((n) => n.status === 'completed')) {
                  const resetNodes = workflow.nodes.map((n, idx) => ({
                    ...n,
                    status: (idx === 0 ? 'active' : 'pending') as 'active' | 'pending',
                  }));
                  setNodes(resetNodes);
                  setActiveStepId(resetNodes[0].id);
                  setSelectedNodeId(resetNodes[0].id);
                }
                setIsSimulating(true);
                showToast('▶ Bắt đầu mô phỏng AI tự động chạy quy trình theo từng bước...');
              } else {
                setIsSimulating(false);
                showToast('⏸ Đã tạm dừng mô phỏng AI.');
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isSimulating ? 'pause' : 'play_arrow'}
            </span>
            <span>{isSimulating ? 'Tạm dừng AI' : 'Mô phỏng AI chạy'}</span>
          </button>
        </div>
      </div>

      {/* Banner giải thích: Định hướng tác nghiệp - Không bắt buộc tuần tự */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-slate-50 border-b border-blue-200/80 px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap text-xs shrink-0">
        <div className="flex items-center gap-2.5 text-slate-700">
          <span className="material-symbols-outlined text-[18px] text-[#004ac6]">tips_and_updates</span>
          <span className="text-xs leading-relaxed">
            <strong className="text-[#004ac6]">Gợi ý thao tác nghiệp vụ:</strong> Sơ đồ trực quan hóa các hành động cán bộ cần thực hiện theo quy định pháp luật. 
            <span className="text-slate-600 font-normal"> Cán bộ chủ động xử lý linh hoạt — <strong>không bắt buộc phải làm tuần tự từng bước</strong>. Có thể chọn thao tác, hoàn thành hoặc bỏ qua bước không áp dụng (miễn lệ phí, hòa giải không thành,...) tùy theo thực tế hồ sơ.</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-[#004ac6] text-[11px] font-bold shadow-2xs">
            <span className="material-symbols-outlined text-[14px]">tune</span>
            <span>Chế độ: Thao tác linh hoạt</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SWIMLANE CANVAS (DIAGRAM CONTAINER + SVG CONNECTORS)              */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-auto relative p-6 bg-[#f8fafc]">
        {/* Floating Zoom Controls (Right Toolbar như Screenshot 2) */}
        <div className="absolute top-8 right-8 z-40 flex flex-col items-center bg-white border border-slate-200 rounded-xl shadow-md p-1 gap-1 text-slate-600">
          <button
            type="button"
            title="Phóng to"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 1.4))}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          <button
            type="button"
            title="Thu nhỏ"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.7))}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <button
            type="button"
            title="Mặc định 100%"
            onClick={() => setZoomLevel(1)}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer font-label-technical"
          >
            100%
          </button>
          <button
            type="button"
            title="Bật/Tắt đường lưới"
            onClick={() => setShowGrid(!showGrid)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              showGrid ? 'bg-blue-50 text-[#004ac6]' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">grid_4x4</span>
          </button>
        </div>

        {/* Diagram Canvas with Zoom Transform */}
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `${canvasWidth}px` }}
          className="transition-transform duration-150 relative pb-4"
        >
          {/* A. STAGES HEADER (CÁC CỘT GIAI ĐOẠN - ROW TOP) */}
          <div
            style={{
              gridTemplateColumns: `${LANE_HEADER_WIDTH}px repeat(${workflow.stages.length}, ${STAGE_COL_WIDTH}px) ${CANVAS_EXTRA_RIGHT}px`,
              width: `${canvasWidth}px`,
            }}
            className="grid gap-0 mb-2"
          >
            <div className="h-10"></div>
            {workflow.stages.map((stageName) => (
              <div
                key={stageName}
                className="h-10 rounded-t-xl bg-slate-100/95 border-t border-x border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase tracking-tight shadow-2xs mx-1"
              >
                <span>{stageName}</span>
              </div>
            ))}
            <div className="h-10"></div>
          </div>

          {/* B. SWIMLANES BODY (CÁC LÀN VAI TRÒ, KHỐI TÁC NGHIỆP & ĐƯỜNG NỐI SVG) */}
          <div
            style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
            className={`rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden relative ${
              showGrid ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]' : ''
            }`}
          >
            {/* C. CÁC LÀN BƠI VÀ CÁC THẺ BƯỚC TÁC NGHIỆP */}
            {workflow.roles.map((role, roleIdx) => (
              <div
                key={role.id}
                style={{
                  height: `${LANE_ROW_HEIGHT}px`,
                  gridTemplateColumns: `${LANE_HEADER_WIDTH}px repeat(${workflow.stages.length}, ${STAGE_COL_WIDTH}px) ${CANVAS_EXTRA_RIGHT}px`,
                }}
                className={`grid relative z-10 ${
                  roleIdx < workflow.roles.length - 1 ? 'border-b border-dashed border-slate-200' : ''
                }`}
              >
                {/* Lane Label Header (Trái) */}
                <div className="p-4 bg-slate-50/70 border-r border-slate-200 flex flex-col justify-center select-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-label-technical">
                    LÀN VAI TRÒ #{roleIdx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 mt-1 leading-snug">
                    {role.title}
                  </h4>
                </div>

                {/* 5 Stage Cells inside this Lane */}
                {workflow.stages.map((stageName, stageIdx) => {
                  const nodeInCell = nodes.find(
                    (n) => n.roleId === role.id && n.stageIndex === stageIdx
                  );

                  return (
                    <div
                      key={stageIdx}
                      className={`relative flex items-center justify-center p-2 ${
                        stageIdx < workflow.stages.length - 1 ? 'border-r border-dashed border-slate-100' : ''
                      }`}
                    >
                      {/* Khối thẻ bước tác nghiệp */}
                      {nodeInCell && (
                        <div
                          onClick={() => setSelectedNodeId(nodeInCell.id)}
                          style={{ width: `${CARD_WIDTH}px`, minHeight: `${CARD_HEIGHT}px` }}
                          className={`rounded-2xl p-3 transition-all cursor-pointer relative z-20 ${
                            nodeInCell.status === 'active'
                              ? 'bg-blue-50/95 border-2 border-blue-600 shadow-xl ring-4 ring-blue-400/30 -translate-y-0.5'
                              : nodeInCell.status === 'completed'
                              ? 'bg-emerald-50/80 border border-emerald-300 shadow-2xs hover:border-emerald-400'
                              : nodeInCell.status === 'skipped'
                              ? 'bg-slate-50/85 border border-dashed border-slate-300 opacity-75 hover:opacity-100 shadow-2xs'
                              : 'bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs'
                          }`}
                        >
                          {/* Pulsing AI Badge nếu đang chạy ở bước này */}
                          {nodeInCell.status === 'active' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1 animate-bounce">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                              <span>AI gợi ý tác nghiệp • Cần thực hiện</span>
                            </div>
                          )}

                          {/* Header card: Step Number + Tag */}
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <span
                              className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                                nodeInCell.status === 'completed'
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : nodeInCell.status === 'active'
                                  ? 'bg-blue-200 text-blue-900'
                                  : nodeInCell.status === 'skipped'
                                  ? 'bg-slate-200 text-slate-500 line-through'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              Bước {nodeInCell.stepNumber}
                            </span>

                            {nodeInCell.tag && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  nodeInCell.tag === 'Bắt đầu'
                                    ? 'bg-blue-100 text-blue-800'
                                    : nodeInCell.tag === 'Kết thúc'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {nodeInCell.tag}
                              </span>
                            )}
                          </div>

                          <h5 className="text-[11.5px] font-bold text-slate-900 leading-tight mb-1">
                            {nodeInCell.name}
                          </h5>

                          {nodeInCell.subTitle && (
                            <div className="text-[10px] text-blue-700 font-semibold mb-1 bg-blue-50 p-1 rounded border border-blue-100">
                              {nodeInCell.subTitle}
                            </div>
                          )}

                          {/* Checkbox items */}
                          <div className="space-y-0.5 text-[10.5px] text-slate-700 border-t border-slate-100 pt-1">
                            {nodeInCell.checkboxes.map((cb) => (
                              <label
                                key={cb.id}
                                className="flex items-center gap-1.5 cursor-pointer select-none"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={cb.checked}
                                  onChange={() => handleToggleCheckbox(nodeInCell.id, cb.id)}
                                  className="w-3 h-3 rounded text-[#004ac6] focus:ring-0 cursor-pointer"
                                />
                                <span className={cb.checked ? 'text-slate-400 line-through' : 'text-slate-800'}>
                                  {cb.label}
                                </span>
                              </label>
                            ))}
                          </div>

                          {/* Bottom Status & Time */}
                          <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100 text-[9.5px] text-slate-500 font-label-technical">
                            <span
                              className={`font-semibold flex items-center gap-0.5 ${
                                nodeInCell.status === 'completed'
                                  ? 'text-emerald-700'
                                  : nodeInCell.status === 'active'
                                  ? 'text-blue-700'
                                  : nodeInCell.status === 'skipped'
                                  ? 'text-slate-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[12px]">
                                {nodeInCell.status === 'completed'
                                  ? 'check_circle'
                                  : nodeInCell.status === 'active'
                                  ? 'autorenew'
                                  : nodeInCell.status === 'skipped'
                                  ? 'block'
                                  : 'radio_button_unchecked'}
                              </span>
                              <span>
                                {nodeInCell.status === 'completed'
                                  ? 'Đã xong'
                                  : nodeInCell.status === 'active'
                                  ? 'Đang làm'
                                  : nodeInCell.status === 'skipped'
                                  ? 'Bỏ qua'
                                  : 'Chờ'}
                              </span>
                            </span>
                            <span>{nodeInCell.timeLimit}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Cột đệm bên phải cho nút Kết thúc */}
                <div className="relative flex items-center justify-center p-2"></div>
              </div>
            ))}

            {/* ========================================================================= */}
            {/* SVG OVERLAY: ĐƯỜNG NỐI MŨI TÊN GIỮA CÁC BƯỚC (CONNECTORS LAYER - ON TOP) */}
            {/* ========================================================================= */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                pointerEvents: 'none',
                zIndex: 35,
                overflow: 'visible',
              }}
              viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            >
              <defs>
                <marker
                  id="arrow-solid-blue"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
                </marker>
                <marker
                  id="arrow-solid-emerald"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669" />
                </marker>
                <marker
                  id="arrow-solid-slate"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
                </marker>
                <marker
                  id="arrow-dashed-rose"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                </marker>
                <filter id="shadow-pill" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.12" />
                </filter>
              </defs>

              {/* 1. NÚT BẮT ĐẦU (START NODE) & ĐƯỜNG NỐI VÀO BƯỚC 1 */}
              <g transform={`translate(${firstCoords.left - 48}, ${firstCoords.cy})`}>
                <circle cx="0" cy="0" r="14" fill="#ecfdf5" stroke="#059669" strokeWidth="2.5" />
                <polygon points="-3,-5 6,0 -3,5" fill="#059669" />
                <rect x="-24" y="18" width="48" height="18" rx="4" fill="#ffffff" stroke="#10b981" strokeWidth="1" />
                <text x="0" y="30.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#047857" fontFamily="sans-serif">
                  Bắt đầu
                </text>
              </g>
              <path
                d={`M ${firstCoords.left - 34} ${firstCoords.cy} L ${firstCoords.left} ${firstCoords.cy}`}
                stroke="#059669"
                strokeWidth="2.2"
                fill="none"
                markerEnd="url(#arrow-solid-emerald)"
              />

              {/* 2. CÁC ĐƯỜNG NỐI (CONNECTIONS) GIỮA CÁC BƯỚC */}
              {workflow.connections.map((conn) => {
                const fromNode = nodes.find((n) => n.id === conn.from);
                const toNode = nodes.find((n) => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const fromCoords = getNodeCoordinates(fromNode);
                const toCoords = getNodeCoordinates(toNode);

                const x1 = fromCoords.right;
                const y1 = fromCoords.cy;
                const x2 = toCoords.left;
                const y2 = toCoords.cy;

                const isConnectedToActive = toNode.status === 'active';
                const isBothCompleted = fromNode.status === 'completed' && toNode.status === 'completed';
                const isEitherSkipped = fromNode.status === 'skipped' || toNode.status === 'skipped';

                const strokeColor =
                  conn.color ||
                  (conn.style === 'dashed'
                    ? '#ef4444'
                    : isEitherSkipped
                    ? '#94a3b8'
                    : isConnectedToActive
                    ? '#2563eb'
                    : isBothCompleted
                    ? '#059669'
                    : '#64748b');

                const markerId =
                  conn.style === 'dashed'
                    ? 'arrow-dashed-rose'
                    : isEitherSkipped
                    ? 'arrow-solid-slate'
                    : isConnectedToActive
                    ? 'arrow-solid-blue'
                    : isBothCompleted
                    ? 'arrow-solid-emerald'
                    : 'arrow-solid-slate';

                const pathD = getOrthogonalPath(x1, y1, x2, y2, 8);

                const xMid = Math.round((x1 + x2) / 2);
                let labelX = xMid;
                let labelY = Math.round((y1 + y2) / 2);

                if (conn.labelPosition === 'early') {
                  labelX = Math.round(x1 + (xMid - x1) * 0.5);
                  labelY = y1;
                } else if (conn.labelPosition === 'late') {
                  labelX = Math.round(xMid + (x2 - xMid) * 0.5);
                  labelY = y2;
                } else if (Math.abs(y1 - y2) < 4) {
                  labelX = Math.round((x1 + x2) / 2);
                  labelY = y1;
                }

                const labelText = conn.label;
                const textWidth = Math.max(labelText.length * 6.5, 75);

                return (
                  <g key={conn.id}>
                    {/* Glow outline cho đường active */}
                    {isConnectedToActive && (
                      <path
                        d={pathD}
                        stroke="#93c5fd"
                        strokeWidth={7}
                        strokeOpacity={0.6}
                        fill="none"
                        strokeLinecap="round"
                        className="animate-pulse"
                      />
                    )}

                    {/* Đường nét vẽ chính */}
                    <path
                      d={pathD}
                      stroke={strokeColor}
                      strokeWidth={conn.style === 'dashed' ? 2 : isConnectedToActive ? 2.8 : 2.2}
                      strokeDasharray={conn.style === 'dashed' || isEitherSkipped ? '5,4' : undefined}
                      fill="none"
                      markerEnd={`url(#${markerId})`}
                    />

                    {/* Port start dot tại đầu ra của thẻ bước */}
                    <circle
                      cx={x1}
                      cy={y1}
                      r={3.5}
                      fill={strokeColor}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />

                    {/* Nhãn điều kiện nằm giữa đường nối */}
                    {labelText && (
                      <g transform={`translate(${labelX}, ${labelY})`}>
                        <rect
                          x={-textWidth / 2 - 4}
                          y={-10}
                          width={textWidth + 8}
                          height={20}
                          rx={10}
                          fill="#ffffff"
                          stroke={isConnectedToActive ? '#2563eb' : conn.style === 'dashed' ? '#f87171' : '#94a3b8'}
                          strokeWidth={1.4}
                          filter="url(#shadow-pill)"
                        />
                        <text
                          x={0}
                          y={3.8}
                          textAnchor="middle"
                          fontSize="9.5"
                          fontWeight="600"
                          fill={isConnectedToActive ? '#1d4ed8' : conn.style === 'dashed' ? '#b91c1c' : '#334155'}
                          fontFamily="sans-serif"
                        >
                          {labelText}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* 3. ĐƯỜNG NỐI TỪ BƯỚC CUỐI VÀ NÚT KẾT THÚC (END NODE) */}
              <path
                d={`M ${lastCoords.right} ${lastCoords.cy} L ${lastCoords.right + 34} ${lastCoords.cy}`}
                stroke="#e11d48"
                strokeWidth="2.2"
                fill="none"
                markerEnd="url(#arrow-dashed-rose)"
              />
              <g transform={`translate(${lastCoords.right + 48}, ${lastCoords.cy})`}>
                <circle cx="0" cy="0" r="14" fill="#fff1f2" stroke="#e11d48" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="8" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
                <rect x="-25" y="18" width="50" height="18" rx="4" fill="#ffffff" stroke="#f43f5e" strokeWidth="1" />
                <text x="0" y="30.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#be123c" fontFamily="sans-serif">
                  Kết thúc
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM PANEL: CHI TIẾT BƯỚC VÀ THAO TÁC CÁN BỘ CẦN THỰC HIỆN            */}
      {/* ========================================================================= */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Step Info & Status */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                selectedNode.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : selectedNode.status === 'active'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : selectedNode.status === 'skipped'
                  ? 'bg-slate-200 text-slate-600'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {selectedNode.status === 'completed' ? '✓' : selectedNode.status === 'skipped' ? '⊘' : selectedNode.stepNumber}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                  Bước {selectedNode.stepNumber}: {selectedNode.name}
                </h3>
                <span
                  className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                    selectedNode.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : selectedNode.status === 'active'
                      ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                      : selectedNode.status === 'skipped'
                      ? 'bg-slate-100 text-slate-600 border-slate-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {selectedNode.status === 'completed'
                    ? '✓ Đã hoàn thành'
                    : selectedNode.status === 'active'
                    ? '● Đang tập trung xử lý'
                    : selectedNode.status === 'skipped'
                    ? '⊘ Đã bỏ qua (Không áp dụng)'
                    : '○ Chưa thực hiện'}
                </span>
                <span className="text-[10.5px] text-slate-500 font-label-technical">
                  Thời hạn quy định: <strong>{selectedNode.timeLimit}</strong>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ⚖️ <strong>Căn cứ pháp luật: </strong>{selectedNode.legalBasis}
              </p>
            </div>
          </div>

          {/* Right: Flexible Action Buttons for Officer (Không ép buộc tuần tự) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. Trạng thái Đang thực hiện (Active) */}
            {selectedNode.status === 'active' && (
              <>
                <button
                  type="button"
                  onClick={() => handleMarkStepCompleted(selectedNode.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  title="Xác nhận đã làm xong toàn bộ thao tác tại bước này"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{selectedNode.userConfirmationNeeded.actionLabel || 'Xác nhận hoàn thành'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmAndAdvance(selectedNode.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  title="Xong bước này và chuyển tiếp điểm sang bước tiếp theo"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  <span>Hoàn thành &amp; Tiếp theo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSkipStep(selectedNode.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                  title="Bỏ qua bước này nếu không áp dụng (ví dụ miễn tạm ứng án phí, không qua hòa giải,...)"
                >
                  <span className="material-symbols-outlined text-[15px] text-slate-400">redo</span>
                  <span>Bỏ qua (Không áp dụng)</span>
                </button>
              </>
            )}

            {/* 2. Trạng thái Chưa thực hiện (Pending) - Cán bộ có thể làm ngay hoặc bỏ qua */}
            {selectedNode.status === 'pending' && (
              <>
                <button
                  type="button"
                  onClick={() => handleSetStepActive(selectedNode.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  title="Chuyển tiêu điểm đang thao tác sang bước này"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>Chọn thao tác bước này</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkStepCompleted(selectedNode.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all cursor-pointer"
                  title="Đánh dấu đã hoàn thành bước này mà không cần theo thứ tự"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                  <span>Đã làm xong bước này</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSkipStep(selectedNode.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                  title="Bỏ qua bước này nếu vụ việc cụ thể không áp dụng"
                >
                  <span className="material-symbols-outlined text-[15px] text-slate-400">redo</span>
                  <span>Bỏ qua (Không áp dụng)</span>
                </button>
              </>
            )}

            {/* 3. Trạng thái Đã hoàn thành (Completed) */}
            {selectedNode.status === 'completed' && (
              <>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  <span>Cán bộ đã hoàn thành thao tác</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleReopenStep(selectedNode.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  title="Mở lại bước này nếu cần chỉnh sửa bổ sung"
                >
                  <span className="material-symbols-outlined text-[15px] text-slate-500">replay</span>
                  <span>Thao tác lại</span>
                </button>
              </>
            )}

            {/* 4. Trạng thái Đã bỏ qua (Skipped) */}
            {selectedNode.status === 'skipped' && (
              <>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-300 text-xs font-medium">
                  <span className="material-symbols-outlined text-[15px]">block</span>
                  <span>Đã đánh dấu không áp dụng</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleReopenStep(selectedNode.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#004ac6] bg-blue-50 hover:bg-blue-100 text-[#004ac6] text-xs font-semibold transition-colors cursor-pointer"
                  title="Kích hoạt lại bước này nếu tình tiết vụ việc thay đổi"
                >
                  <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                  <span>Kích hoạt lại bước này</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 2-Columns Detail Box: AI Hỗ trợ (Trái) + Thao tác cán bộ cần làm (Phải) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
          {/* Col Left (6 cols): AI tác nghiệp & Văn bản dự thảo */}
          <div className="lg:col-span-6 p-3 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 uppercase tracking-tight">
                <span className="material-symbols-outlined text-[16px] text-indigo-600">smart_toy</span>
                <span>AI hỗ trợ tác nghiệp tại bước này:</span>
              </span>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                Tự động rà soát
              </span>
            </div>
            <p className="text-xs text-indigo-900 leading-relaxed bg-white/95 p-2.5 rounded-lg border border-indigo-100">
              {selectedNode.aiAction}
            </p>
            {selectedNode.userConfirmationNeeded.draftDocName && (
              <div className="flex items-center justify-between text-[11px] text-slate-600 bg-white/95 px-2.5 py-2 rounded-lg border border-indigo-100 flex-wrap gap-2">
                <span className="flex items-center gap-1.5 font-medium text-indigo-900">
                  <span className="material-symbols-outlined text-[16px] text-indigo-600">description</span>
                  <span>Dự thảo đề xuất: <strong>{selectedNode.userConfirmationNeeded.draftDocName}</strong></span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => showToast(`✓ Đang mở xem trước văn bản: "${selectedNode.userConfirmationNeeded.draftDocName}"`)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#004ac6] text-xs font-bold cursor-pointer transition-colors border border-indigo-200"
                  >
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    <span>Xem dự thảo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast(`✓ Đang mở trình soạn thảo văn bản: "${selectedNode.userConfirmationNeeded.draftDocName}"`)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer transition-colors border border-slate-200"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit_note</span>
                    <span>Chỉnh sửa</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Col Right (6 cols): THAO TÁC CÁN BỘ CẦN THỰC HIỆN TẠI BƯỚC NÀY (GỢI Ý NGHIỆP VỤ) */}
          <div className="lg:col-span-6 p-3 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-tight">
                <span className="material-symbols-outlined text-[16px] text-[#004ac6]">checklist</span>
                <span>Thao tác cán bộ cần thực hiện (Gợi ý nghiệp vụ):</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Không bắt buộc tuần tự</span>
              </span>
            </div>

            {/* Checklist các thao tác cụ thể */}
            <div className="space-y-1.5 bg-white/95 p-2.5 rounded-lg border border-blue-100">
              <div className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span>Danh mục công việc cần làm tại bước này:</span>
                <span className="text-[10px] text-slate-400">Tích chọn để ghi nhận tiến độ</span>
              </div>
              {selectedNode.checkboxes.map((cb) => (
                <label
                  key={cb.id}
                  className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer select-none hover:bg-slate-50 p-1 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={cb.checked}
                    onChange={() => handleToggleCheckbox(selectedNode.id, cb.id)}
                    className="w-3.5 h-3.5 mt-0.5 rounded text-[#004ac6] focus:ring-0 cursor-pointer"
                  />
                  <span className={`leading-snug ${cb.checked ? 'text-slate-400 line-through' : 'text-slate-800 font-medium'}`}>
                    {cb.label}
                  </span>
                </label>
              ))}

              {/* Tiêu chí đối chiếu theo luật */}
              {selectedNode.userConfirmationNeeded.items.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-700 block">Tiêu chí đối chiếu quy định pháp luật:</span>
                  {selectedNode.userConfirmationNeeded.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11.5px] text-slate-600">
                      <span className="text-[#004ac6] font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
