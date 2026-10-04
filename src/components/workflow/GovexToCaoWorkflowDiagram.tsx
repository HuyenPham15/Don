import React, { useState } from 'react';

export interface GovexNodeDetail {
  id: string;
  name: string;
  role: 'can_bo' | 'lanh_dao' | 'he_thong';
  roleName: string;
  stageName: string;
  macroPhase: 'don_to_cao' | 'rut_don';
  status: 'completed' | 'active' | 'pending';
  legalBasis?: string;
  description?: string;
  draftDocument?: string;
  suggestedAction?: string;
}

const NODES_DATA: Record<string, GovexNodeDetail> = {
  'tn-1': {
    id: 'tn-1',
    name: 'Tiếp nhận đơn',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'completed',
    legalBasis: 'Điều 23 Luật Tố cáo 2018; Thông tư 05/2021/TT-TTCP',
    description: 'Tiếp nhận đơn tố cáo từ các nguồn (trực tiếp, dịch vụ bưu chính, Cổng DVC, chuyển từ cơ quan khác). Vào sổ tiếp nhận và lập phiếu biên nhận.',
    draftDocument: 'Phiếu tiếp nhận đơn tố cáo.pdf',
    suggestedAction: 'Kiểm tra thông tin người nộp, đối tượng bị tố cáo và tài liệu đính kèm.',
  },
  'tn-2': {
    id: 'tn-2',
    name: 'Kiểm tra thông tin & xác định hướng xử lý',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'active',
    legalBasis: 'Điều 24 Luật Tố cáo 2018; Điều 8 Thông tư 05/2021/TT-TTCP',
    description: 'Rà soát thẩm quyền, xác minh thông tin ban đầu, điều kiện thụ lý (rõ họ tên, địa chỉ người tố cáo, nội dung có cơ sở hay nặc danh, trùng lặp). Đưa ra 1 trong 4 kết quả xử lý.',
    draftDocument: 'Phiếu phân loại & đề xuất hướng xử lý đơn.pdf',
    suggestedAction: 'Cán bộ xác nhận kết quả kiểm tra điều kiện thụ lý.',
  },
  'tn-kt-khong-thu-ly': {
    id: 'tn-kt-khong-thu-ly',
    name: 'Không thụ lý giải quyết',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    legalBasis: 'Khoản 2 Điều 29 Luật Tố cáo 2018',
    description: 'Đơn không đủ điều kiện thụ lý (không rõ họ tên, vụ việc đã giải quyết đúng thẩm quyền không có tình tiết mới). Ban hành thông báo không thụ lý.',
    draftDocument: 'Thông báo không thụ lý tố cáo.pdf',
    suggestedAction: 'Ban hành thông báo không thụ lý gửi người tố cáo và kết thúc xử lý đơn.',
  },
  'tn-kt-yeu-cau-bo-sung': {
    id: 'tn-kt-yeu-cau-bo-sung',
    name: 'Yêu cầu bổ sung tài liệu / thông tin',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    legalBasis: 'Điều 24 Luật Tố cáo 2018; Thông tư 05/2021/TT-TTCP',
    description: 'Hồ sơ thiếu chứng cứ hoặc nội dung chưa đủ rõ. Ban hành Thông báo yêu cầu công dân bổ sung thông tin, tài liệu trong thời hạn luật định (10 ngày làm việc).',
    draftDocument: 'Thông báo yêu cầu bổ sung hồ sơ đơn.pdf',
    suggestedAction: 'Lập danh mục tài liệu còn thiếu và ban hành văn bản yêu cầu bổ sung.',
  },
  'tn-kt-ban-giao': {
    id: 'tn-kt-ban-giao',
    name: 'Bàn giao / Chuyển đơn',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    legalBasis: 'Điều 26 Luật Tố cáo 2018',
    description: 'Đơn thuộc thẩm quyền cơ quan, tổ chức khác. Lập Phiếu chuyển đơn tố cáo và bàn giao sang đơn vị có thẩm quyền giải quyết.',
    draftDocument: 'Phiếu chuyển đơn tố cáo số 15/PC-ĐTC.pdf',
    suggestedAction: 'Chuyển giao hồ sơ đơn và kết thúc xử lý tại đơn vị.',
  },
  'tn-kt-tra-lai': {
    id: 'tn-kt-tra-lai',
    name: 'Trả lại đơn & Hướng dẫn',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    legalBasis: 'Điều 25 Luật Tố cáo 2018',
    description: 'Trả lại đơn và hướng dẫn người tố cáo gửi đơn đến đúng cơ quan có thẩm quyền hoặc bổ sung thông tin cần thiết.',
    draftDocument: 'Văn bản hướng dẫn & trả lại đơn.pdf',
    suggestedAction: 'Gửi văn bản trả lời cho người tố cáo và kết thúc xử lý đơn.',
  },
  'tl-1': {
    id: 'tl-1',
    name: 'Đề xuất thụ lý',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    legalBasis: 'Điều 29 Luật Tố cáo 2018',
    description: 'Lập Báo cáo / Tờ trình đề xuất thụ lý giải quyết tố cáo gửi Lãnh đạo có thẩm quyền phê duyệt.',
    draftDocument: 'Tờ trình đề xuất thụ lý giải quyết tố cáo.pdf',
    suggestedAction: 'Dự thảo Quyết định thụ lý theo Mẫu số 01 và dự thảo Thông báo thụ lý.',
  },
  'tl-2': {
    id: 'tl-2',
    name: 'Trình lãnh đạo phê duyệt',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    legalBasis: 'Quy chế làm việc & phân cấp thẩm quyền ký duyệt',
    description: 'Chuyển hồ sơ và tờ trình thụ lý vào danh sách Trình ký của Lãnh đạo qua hệ thống Quản lý công việc.',
    draftDocument: 'Hồ sơ trình ký thụ lý đơn tố cáo.pdf',
    suggestedAction: 'Theo dõi ý kiến phản hồi hoặc yêu cầu chỉnh sửa từ Lãnh đạo.',
  },
  'tl-3': {
    id: 'tl-3',
    name: 'Lãnh đạo xem xét / phê duyệt đề xuất thụ lý',
    role: 'lanh_dao',
    roleName: 'Lãnh đạo',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    legalBasis: 'Điều 29, Điều 30 Luật Tố cáo 2018',
    description: 'Lãnh đạo xem xét hồ sơ: Phê duyệt thụ lý hoặc yêu cầu cán bộ chuyên môn chỉnh sửa, làm rõ thêm.',
    draftDocument: 'Ý kiến phê duyệt của Lãnh đạo.pdf',
    suggestedAction: 'Lãnh đạo ký số phê duyệt hoặc phản hồi yêu cầu chỉnh sửa.',
  },
  'tl-4': {
    id: 'tl-4',
    name: 'Tự động cấp số thụ lý',
    role: 'he_thong',
    roleName: 'Hệ thống',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    legalBasis: 'Quy chuẩn số hóa & CSDL đơn thư điện tử',
    description: 'Sau khi Lãnh đạo phê duyệt, Hệ thống tự động cấp số thụ lý chính thức (TLTC-2026/...) vào sổ thụ lý điện tử.',
    draftDocument: 'Sổ theo dõi thụ lý điện tử.pdf',
    suggestedAction: 'Tự động cập nhật trạng thái hồ sơ trên toàn hệ thống.',
  },
  'tl-5': {
    id: 'tl-5',
    name: 'Cán bộ chuyên môn thụ lý tố cáo',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    legalBasis: 'Điều 30 Luật Tố cáo 2018',
    description: 'Ban hành Quyết định thụ lý và Thông báo thụ lý tố cáo gửi người tố cáo và người bị tố cáo. Hoàn tất quy trình xử lý đơn tố cáo.',
    draftDocument: 'Thông báo thụ lý giải quyết tố cáo số 12/TB-TLTC.pdf',
    suggestedAction: 'Hoàn tất đóng Task xử lý đơn tố cáo trên hệ thống.',
  },
  'tl-6': {
    id: 'tl-6',
    name: 'Hệ thống hoàn tất đóng hồ sơ xử lý đơn',
    role: 'he_thong',
    roleName: 'Hệ thống',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    legalBasis: 'Điều 30 Luật Tố cáo 2018 & Quy chế văn thư điện tử',
    description: 'Hệ thống đồng bộ văn bản thụ lý vào CSDL đơn thư, khóa hồ sơ xử lý đơn và lưu trữ kết quả tiếp nhận, thụ lý.',
    draftDocument: 'Hồ sơ lưu trữ điện tử xử lý đơn tố cáo.pdf',
    suggestedAction: 'Đóng quy trình xử lý đơn tố cáo.',
  },
  'rut-don-1': {
    id: 'rut-don-1',
    name: 'Rút đơn trong quá trình xử lý đơn',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'Luồng phát sinh – Rút đơn',
    macroPhase: 'rut_don',
    status: 'pending',
    legalBasis: 'Điều 33 Luật Tố cáo 2018: Rút tố cáo',
    description: 'Người tố cáo có văn bản xin rút toàn bộ hoặc một phần đơn tố cáo trước thời điểm ban hành quyết định giải quyết.',
    draftDocument: 'Đơn xin rút nội dung tố cáo / Quyết định đình chỉ.pdf',
    suggestedAction: 'Cán bộ kiểm tra xem việc rút đơn có bị ép buộc hay có dấu hiệu vi phạm để quyết định đình chỉ hoặc tiếp tục xử lý.',
  },
};

export default function GovexToCaoWorkflowDiagram({
  donCode = 'Đ-2026-00125',
  donTitle = 'Tố giác sai phạm trật tự xây dựng & lấn chiếm lối đi chung tại ngõ 128 Đội Cấn',
  nguoiNop = 'Đại diện cư dân TDP số 3',
}: {
  donCode?: string;
  donTitle?: string;
  nguoiNop?: string;
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('tn-2');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((curr) => (curr === msg ? null : curr)), 3500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-800 overflow-hidden font-body-md select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl text-xs font-semibold animate-fade-in border border-slate-700">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner Tiêu đề - Chuẩn hóa Quy trình xử lý đơn */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0047AB] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            GOV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-[#0047AB] tracking-tight uppercase font-headline-md">
                QUY TRÌNH XỬ LÝ ĐƠN - GOVEX (TIẾP NHẬN, XÁC MINH &amp; THỤ LÝ)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                2 Giai đoạn • 3 Làn bơi
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Hồ sơ: <strong className="text-slate-800">{donCode}</strong> • {donTitle} • Người đứng đơn: <strong>{nguoiNop}</strong>
            </p>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.75))}
            className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Thu nhỏ"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <span className="text-[11px] font-bold text-slate-700 px-2 font-mono">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 1.4))}
            className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Phóng to"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="px-2 py-1 rounded-lg hover:bg-white text-[10.5px] font-semibold text-slate-600 transition-colors cursor-pointer"
          >
            Đặt lại
          </button>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="flex-1 overflow-auto p-4 bg-slate-50">
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', minWidth: '920px' }}
          className="transition-transform duration-150 space-y-3"
        >
          {/* ========================================================================= */}
          {/* PHẦN 1: BẢNG LÀN BƠI CHÍNH – QUY TRÌNH XỬ LÝ ĐƠN                          */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            {/* Header 2 Giai đoạn chuẩn của Xử lý đơn */}
            <div className="grid grid-cols-12 bg-sky-100/70 border-b border-slate-300 text-center font-bold text-xs text-slate-800">
              <div className="col-span-2 p-2.5 border-r border-slate-300 flex items-center justify-center bg-slate-100 text-slate-700 uppercase tracking-tight text-[11px]">
                TÁC NHÂN
              </div>
              <div className="col-span-5 p-2.5 border-r border-slate-300 text-[11px] uppercase bg-sky-50 text-blue-900 flex items-center justify-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white inline-flex items-center justify-center text-[10px]">1</span>
                <span>GĐ 1 – TIẾP NHẬN &amp; XÁC ĐỊNH HƯỚNG XỬ LÝ ĐƠN</span>
              </div>
              <div className="col-span-5 p-2.5 text-[11px] uppercase bg-sky-50 text-blue-900 flex items-center justify-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white inline-flex items-center justify-center text-[10px]">2</span>
                <span>GĐ 2 – PHÊ DUYỆT &amp; THỤ LÝ ĐƠN (HOÀN TẤT XỬ LÝ ĐƠN)</span>
              </div>
            </div>

            {/* 1. LÀN BƠI 1: CÁN BỘ CHUYÊN MÔN */}
            <div className="grid grid-cols-12 border-b border-slate-300 bg-sky-50/20 min-h-[220px]">
              <div className="col-span-2 p-3 border-r border-slate-300 flex flex-col justify-center items-center text-center bg-sky-100/40">
                <span className="material-symbols-outlined text-blue-700 text-2xl">person</span>
                <span className="text-xs font-bold text-blue-950 mt-1 uppercase tracking-tight">
                  CÁN BỘ CHUYÊN MÔN
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Tiếp nhận &amp; Đề xuất xử lý</span>
              </div>

              {/* GĐ 1: Tiếp nhận -> Kiểm tra/Xác minh -> 4 nhánh kết quả */}
              <div className="col-span-5 p-3 border-r border-slate-300 flex flex-col justify-between gap-2.5">
                {/* 2 Bước đầu: Tiếp nhận -> Kiểm tra ban đầu */}
                <div className="flex items-center gap-2">
                  {/* Node Tiếp nhận đơn */}
                  <div
                    onClick={() => setSelectedNodeId('tn-1')}
                    className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${
                      selectedNodeId === 'tn-1' ? 'ring-2 ring-blue-600 bg-blue-50 border-blue-500 font-bold shadow-xs' : 'bg-white border-blue-200 hover:border-blue-400'
                    }`}
                  >
                    <span className="text-[11px] text-blue-900 font-bold block leading-tight">1. Tiếp nhận đơn</span>
                    <span className="text-[9.5px] text-slate-500 block mt-0.5">Vào sổ điện tử &amp; Phiếu nhận</span>
                  </div>

                  <span className="material-symbols-outlined text-blue-600 text-base shrink-0">arrow_forward</span>

                  {/* Node Kiểm tra ban đầu & Xác minh */}
                  <div
                    onClick={() => setSelectedNodeId('tn-2')}
                    className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${
                      selectedNodeId === 'tn-2' ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-600 font-bold shadow-xs' : 'bg-white border-blue-200 hover:border-blue-400'
                    }`}
                  >
                    <span className="text-[11px] text-blue-900 font-bold block leading-tight">2. Kiểm tra &amp; Xác minh</span>
                    <span className="text-[9.5px] text-slate-500 block mt-0.5">Điều kiện thụ lý / Thẩm quyền</span>
                  </div>
                </div>

                {/* Khối quyết định Kết quả xử lý? & 4 nhánh kết quả */}
                <div className="p-2 rounded-xl bg-slate-50/90 border border-slate-200/90 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 px-1">
                    <span className="uppercase tracking-tight text-slate-500">Kết quả kiểm tra &amp; xác minh:</span>
                    <span className="text-blue-700">4 Hướng xử lý</span>
                  </div>

                  {/* 4 Nhánh kết quả: Không thụ lý, Yêu cầu bổ sung, Bàn giao, Trả lại */}
                  <div className="grid grid-cols-4 gap-1.5 text-[9px]">
                    {/* Nhánh 1: Không thụ lý */}
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId('tn-kt-khong-thu-ly')}
                      className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col justify-between ${
                        selectedNodeId === 'tn-kt-khong-thu-ly'
                          ? 'ring-2 ring-rose-600 bg-rose-50 border-rose-500'
                          : 'bg-white border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-slate-800 leading-tight">Không thụ lý</span>
                      <span className="mt-1 px-1 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[8px]">
                        KẾT THÚC ĐƠN
                      </span>
                    </button>

                    {/* Nhánh 2: Yêu cầu bổ sung */}
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId('tn-kt-yeu-cau-bo-sung')}
                      className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col justify-between ${
                        selectedNodeId === 'tn-kt-yeu-cau-bo-sung'
                          ? 'ring-2 ring-blue-600 bg-blue-50 border-blue-500'
                          : 'bg-white border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-blue-900 leading-tight">Y/C Bổ sung</span>
                      <span className="mt-1 px-1 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-800 font-bold text-[8px]">
                        HẠN 10 NGÀY
                      </span>
                    </button>

                    {/* Nhánh 3: Bàn giao */}
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId('tn-kt-ban-giao')}
                      className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col justify-between ${
                        selectedNodeId === 'tn-kt-ban-giao'
                          ? 'ring-2 ring-amber-600 bg-amber-50 border-amber-500'
                          : 'bg-white border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-slate-800 leading-tight">Bàn giao</span>
                      <span className="mt-1 px-1 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[8px]">
                        KẾT THÚC ĐƠN
                      </span>
                    </button>

                    {/* Nhánh 4: Trả lại đơn */}
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId('tn-kt-tra-lai')}
                      className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col justify-between ${
                        selectedNodeId === 'tn-kt-tra-lai'
                          ? 'ring-2 ring-rose-600 bg-rose-50 border-rose-500'
                          : 'bg-white border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-slate-800 leading-tight">Trả lại đơn</span>
                      <span className="mt-1 px-1 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[8px]">
                        KẾT THÚC ĐƠN
                      </span>
                    </button>
                  </div>

                  {/* Nhánh 5: Đủ điều kiện thụ lý -> Chuyển sang GĐ 2 */}
                  <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-blue-100/70 border border-blue-200 text-blue-900 font-bold text-[10px]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-blue-700">check_circle</span>
                      <span>Đủ điều kiện thụ lý:</span>
                    </span>
                    <span className="flex items-center gap-1 text-[9.5px] text-blue-800">
                      Chuyển GĐ 2 (Đề xuất thụ lý)
                      <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* GĐ 2: Đề xuất thụ lý -> Trình lãnh đạo + Cán bộ thụ lý tố cáo -> KẾT THÚC ĐƠN */}
              <div className="col-span-5 p-3 flex flex-col justify-between gap-2.5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      onClick={() => setSelectedNodeId('tl-1')}
                      className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${
                        selectedNodeId === 'tl-1' ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold shadow-xs' : 'bg-white border-blue-300 hover:border-blue-500'
                      }`}
                    >
                      <span className="text-[11px] text-blue-900 font-bold block leading-tight">Đề xuất thụ lý</span>
                      <span className="text-[9.5px] text-slate-500 block mt-0.5">Lập Báo cáo / Tờ trình Mẫu 01</span>
                    </div>

                    <span className="material-symbols-outlined text-blue-600 text-base shrink-0">arrow_forward</span>

                    <div
                      onClick={() => setSelectedNodeId('tl-2')}
                      className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${
                        selectedNodeId === 'tl-2' ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold shadow-xs' : 'bg-white border-blue-300 hover:border-blue-500'
                      }`}
                    >
                      <span className="text-[11px] text-blue-900 font-bold block leading-tight">Trình Lãnh đạo</span>
                      <span className="text-[9.5px] text-slate-500 block mt-0.5">Gửi hồ sơ vào mục Trình ký</span>
                    </div>
                  </div>

                  <div className="text-[9.5px] text-rose-600 font-semibold bg-rose-50/90 p-1.5 rounded-lg border border-rose-200 flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px]">undo</span>
                    <span>Nhận lại nếu có yêu cầu chỉnh sửa, hoàn thiện từ Lãnh đạo</span>
                  </div>
                </div>

                {/* Kết quả sau duyệt: Cán bộ chuyên môn ban hành thông báo thụ lý tố cáo -> KẾT THÚC QUY TRÌNH XỬ LÝ ĐƠN */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div
                    onClick={() => setSelectedNodeId('tl-5')}
                    className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${
                      selectedNodeId === 'tl-5' ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold shadow-xs' : 'bg-white border-blue-300 hover:border-blue-500'
                    }`}
                  >
                    <span className="text-[10.5px] text-blue-950 font-bold block leading-tight">
                      Ban hành Quyết định &amp; Thông báo thụ lý tố cáo
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Mẫu số 01 / Gửi người tố cáo</span>
                  </div>

                  <div className="px-2.5 py-2 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-800 font-black text-[10px] shrink-0 text-center leading-tight">
                    <div>✓ HOÀN TẤT</div>
                    <div className="text-[8.5px] font-bold text-emerald-700">XỬ LÝ ĐƠN</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. LÀN BƠI 2: LÃNH ĐẠO */}
            <div className="grid grid-cols-12 border-b border-slate-300 bg-amber-50/25 min-h-[110px]">
              <div className="col-span-2 p-3 border-r border-slate-300 flex flex-col justify-center items-center text-center bg-amber-100/50">
                <span className="material-symbols-outlined text-amber-700 text-2xl">shield_person</span>
                <span className="text-xs font-bold text-amber-950 mt-1 uppercase tracking-tight">
                  LÃNH ĐẠO
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Người có thẩm quyền</span>
              </div>

              {/* GĐ 1: Theo dõi chỉ đạo chung */}
              <div className="col-span-5 p-3 border-r border-slate-300 flex items-center justify-center text-slate-400 text-xs italic bg-slate-50/30">
                (Theo dõi tiến độ tiếp nhận &amp; phân loại đơn)
              </div>

              {/* GĐ 2: Lãnh đạo xem xét / phê duyệt đề xuất thụ lý */}
              <div className="col-span-5 p-3 flex items-center justify-between gap-3">
                <div
                  onClick={() => setSelectedNodeId('tl-3')}
                  className={`flex-1 p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    selectedNodeId === 'tl-3' ? 'ring-2 ring-amber-600 bg-amber-100 border-amber-500 font-bold shadow-xs' : 'bg-white border-amber-300 hover:border-amber-400'
                  }`}
                >
                  <span className="text-[11px] text-amber-950 font-bold block leading-tight">
                    Lãnh đạo xem xét &amp; phê duyệt đề xuất thụ lý
                  </span>
                  <span className="text-[9.5px] text-slate-500 block mt-0.5">
                    Ký số phê duyệt Tờ trình &amp; Dự thảo Quyết định thụ lý
                  </span>
                </div>

                <div className="w-20 h-16 bg-purple-50 border border-purple-300 rotate-45 flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="-rotate-45 text-[9.5px] font-bold text-purple-900 text-center leading-tight">
                    Ký duyệt<br />thụ lý?
                  </span>
                </div>
              </div>
            </div>

            {/* 3. LÀN BƠI 3: HỆ THỐNG / VĂN THƯ */}
            <div className="grid grid-cols-12 border-b border-slate-300 bg-slate-50 min-h-[95px]">
              <div className="col-span-2 p-3 border-r border-slate-300 flex flex-col justify-center items-center text-center bg-slate-200/60">
                <span className="material-symbols-outlined text-slate-700 text-2xl">database</span>
                <span className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-tight">
                  HỆ THỐNG / VĂN THƯ
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Tự động hóa tác vụ</span>
              </div>

              {/* GĐ 1: Tự động cấp mã đơn & vào sổ điện tử */}
              <div className="col-span-5 p-3 border-r border-slate-300 flex items-center justify-center text-slate-500 text-xs font-medium">
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-300 text-[10.5px]">
                  <span className="material-symbols-outlined text-blue-600 text-base">pin</span>
                  <span>Tự động cấp mã đơn điện tử &amp; đồng bộ CSDL tiếp nhận</span>
                </div>
              </div>

              {/* GĐ 2: Tự động cấp số thụ lý -> Hoàn tất đóng hồ sơ xử lý đơn */}
              <div className="col-span-5 p-3 flex items-center gap-2">
                <div
                  onClick={() => setSelectedNodeId('tl-4')}
                  className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${
                    selectedNodeId === 'tl-4' ? 'bg-slate-200 border-slate-400 font-bold' : 'bg-white border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span className="text-[10.5px] text-slate-800 font-bold block leading-tight">
                    Tự động cấp số thụ lý
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Số TLTC-2026/... vào sổ điện tử</span>
                </div>

                <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward</span>

                <div
                  onClick={() => setSelectedNodeId('tl-6')}
                  className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${
                    selectedNodeId === 'tl-6' ? 'bg-slate-200 border-slate-400 font-bold' : 'bg-white border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span className="text-[10.5px] text-slate-800 font-bold block leading-tight">
                    Hoàn tất đóng hồ sơ xử lý đơn
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Lưu trữ kết quả xử lý đơn</span>
                </div>
              </div>
            </div>

            {/* DẢI TỔNG KẾT: QUY TRÌNH XỬ LÝ ĐƠN */}
            <div className="p-2.5 bg-[#0047AB] text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">verified</span>
                <span>QUY TRÌNH XỬ LÝ ĐƠN (CĂN CỨ LUẬT TỐ CÁO 2018 &amp; THÔNG TƯ 05/2021/TT-TTCP)</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-xs">
                KẾT THÚC KHI BAN HÀNH QUYẾT ĐỊNH THỤ LÝ HOẶC CHUYỂN / TRẢ / LƯU ĐƠN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
