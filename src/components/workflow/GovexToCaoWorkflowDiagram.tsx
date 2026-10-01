import React, { useState } from 'react';

export interface GovexNodeDetail {
  id: string;
  name: string;
  role: 'can_bo' | 'lanh_dao' | 'he_thong' | 'can_bo_phan_cong';
  roleName: string;
  stageName: string;
  macroPhase: 'don_to_cao' | 'vu_viec' | 'rut_don';
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
    name: 'Kiểm tra ban đầu & xác định hướng xử lý',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'active',
    legalBasis: 'Điều 24 Luật Tố cáo 2018; Điều 8 Thông tư 05/2021/TT-TTCP',
    description: 'Rà soát thẩm quyền, điều kiện thụ lý (rõ họ tên, địa chỉ người tố cáo, nội dung có cơ sở hay nặc danh, trùng lặp). Đưa ra 1 trong 4 kết quả xử lý.',
    draftDocument: 'Phiếu phân loại & đề xuất hướng xử lý đơn.pdf',
    suggestedAction: 'Cán bộ xác nhận kết quả kiểm tra điều kiện thụ lý.',
  },
  'tn-kt-khong-thu-ly': {
    id: 'tn-kt-khong-thu-ly',
    name: 'Không thụ lý',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    legalBasis: 'Khoản 2 Điều 29 Luật Tố cáo 2018',
    description: 'Đơn không đủ điều kiện thụ lý (không rõ họ tên, vụ việc đã giải quyết đúng thẩm quyền không có tình tiết mới). Ban hành thông báo không thụ lý.',
    draftDocument: 'Thông báo không thụ lý tố cáo.pdf',
    suggestedAction: 'Ban hành thông báo không thụ lý gửi người tố cáo và kết thúc đơn.',
  },
  'tn-kt-ban-giao': {
    id: 'tn-kt-ban-giao',
    name: 'Bàn giao đơn',
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
    name: 'Trả lại đơn',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    legalBasis: 'Điều 25 Luật Tố cáo 2018',
    description: 'Trả lại đơn và hướng dẫn người tố cáo gửi đơn đến cơ quan có thẩm quyền hoặc bổ sung thông tin cần thiết.',
    draftDocument: 'Văn bản hướng dẫn & trả lại đơn.pdf',
    suggestedAction: 'Gửi văn bản trả lời cho người tố cáo và kết thúc đơn.',
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
    suggestedAction: 'Dự thảo Quyết định thụ lý và kế hoạch xác minh ban đầu.',
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
    description: 'Ban hành Thông báo thụ lý tố cáo gửi người tố cáo và người bị tố cáo. Kết thúc giai đoạn xử lý Đơn tố cáo.',
    draftDocument: 'Thông báo thụ lý giải quyết tố cáo số 12/TB-TLTC.pdf',
    suggestedAction: 'Hoàn tất đóng Task xử lý đơn tố cáo, chuyển sang theo dõi Vụ việc.',
  },
  'tl-6': {
    id: 'tl-6',
    name: 'Hệ thống tạo Vụ việc sau khi thụ lý thành công',
    role: 'he_thong',
    roleName: 'Hệ thống',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    legalBasis: 'Kiến trúc nghiệp vụ GOVEX: Đơn kết thúc → Khởi tạo Vụ việc thụ lý',
    description: 'Hệ thống tự động liên kết mã Đơn vào mã Vụ việc mới (VV-2026-...) để bước sang quá trình xử lý vụ việc.',
    draftDocument: 'Hồ sơ vụ việc thụ lý giải quyết tố cáo (VV-2026-0042).pdf',
    suggestedAction: 'Kích hoạt không gian làm việc của Vụ việc thụ lý.',
  },
  'vv-pc-1': {
    id: 'vv-pc-1',
    name: 'Lãnh đạo xem Vụ việc & phân công cán bộ xác minh',
    role: 'lanh_dao',
    roleName: 'Lãnh đạo',
    stageName: 'GĐ 3 – Tạo Vụ việc & Phân công',
    macroPhase: 'vu_viec',
    status: 'pending',
    legalBasis: 'Điều 31 Luật Tố cáo 2018: Thành lập Tổ xác minh hoặc phân công cán bộ xác minh',
    description: 'Lãnh đạo ban hành Quyết định thành lập Tổ xác minh nội dung tố cáo, phân công Tổ trưởng và các thành viên.',
    draftDocument: 'Quyết định thành lập Tổ xác minh tố cáo số 45/QĐ-UBND.pdf',
    suggestedAction: 'Chỉ định cán bộ thụ lý chính và thời hạn xác minh.',
  },
  'vv-pc-2': {
    id: 'vv-pc-2',
    name: 'Cán bộ được phân công nhận Vụ việc',
    role: 'can_bo_phan_cong',
    roleName: 'Cán bộ được phân công',
    stageName: 'GĐ 3 – Tạo Vụ việc & Phân công',
    macroPhase: 'vu_viec',
    status: 'pending',
    legalBasis: 'Điều 31 Luật Tố cáo 2018',
    description: 'Cán bộ / Tổ trưởng nhận bàn giao hồ sơ vụ việc, lập kế hoạch xác minh nội dung tố cáo.',
    draftDocument: 'Kế hoạch xác minh nội dung tố cáo.pdf',
    suggestedAction: 'Xây dựng đề cương xác minh chi tiết.',
  },
  'vv-xm-1': {
    id: 'vv-xm-1',
    name: 'Xác minh nội dung tố cáo',
    role: 'can_bo_phan_cong',
    roleName: 'Cán bộ được phân công',
    stageName: 'GĐ 4 – Xác minh vụ việc',
    macroPhase: 'vu_viec',
    status: 'pending',
    legalBasis: 'Điều 31, Điều 32 Luật Tố cáo 2018',
    description: 'Làm việc trực tiếp với người tố cáo, người bị tố cáo, cơ quan, tổ chức, cá nhân có liên quan. Lập biên bản làm việc.',
    draftDocument: 'Biên bản làm việc với người bị tố cáo.pdf',
    suggestedAction: 'Đối soát các giải trình với nội dung đơn tố cáo.',
  },
  'vv-xm-2': {
    id: 'vv-xm-2',
    name: 'Thu thập tài liệu / chứng cứ',
    role: 'can_bo_phan_cong',
    roleName: 'Cán bộ được phân công',
    stageName: 'GĐ 4 – Xác minh vụ việc',
    macroPhase: 'vu_viec',
    status: 'pending',
    legalBasis: 'Điều 31 Luật Tố cáo 2018',
    description: 'Yêu cầu cơ quan chuyên môn cung cấp hồ sơ địa chính, chứng từ tài chính, hồ sơ quy hoạch, kết quả kiểm tra thực địa.',
    draftDocument: 'Phiếu yêu cầu cung cấp thông tin tài liệu.pdf',
    suggestedAction: 'Kiểm đếm và bảo quản chứng cứ theo quy chế bảo mật.',
  },
  'vv-xm-3': {
    id: 'vv-xm-3',
    name: 'Báo cáo kết quả xác minh',
    role: 'can_bo_phan_cong',
    roleName: 'Cán bộ được phân công',
    stageName: 'GĐ 4 – Xác minh vụ việc',
    macroPhase: 'vu_viec',
    status: 'pending',
    legalBasis: 'Điều 34 Luật Tố cáo 2018: Báo cáo kết quả xác minh nội dung tố cáo',
    description: 'Tổng hợp tài liệu, đánh giá chứng cứ, kết luận từng nội dung tố cáo đúng, đúng một phần hay sai sự thật.',
    draftDocument: 'Báo cáo kết quả xác minh nội dung tố cáo số 18/BC-TXM.pdf',
    suggestedAction: 'Báo cáo thông qua Tổ xác minh trước khi lập dự thảo kết luận.',
  },
  'vv-kl-1': {
    id: 'vv-kl-1',
    name: 'Dự thảo kết luận / hướng xử lý',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 5 – Kết luận & Phê duyệt',
    macroPhase: 'vu_viec',
    status: 'pending',
    legalBasis: 'Điều 35 Luật Tố cáo 2018: Kết luận nội dung tố cáo',
    description: 'Dự thảo Kết luận nội dung tố cáo, xác định rõ trách nhiệm cá nhân/tập thể vi phạm, kiến nghị biện pháp xử lý.',
    draftDocument: 'Dự thảo Kết luận nội dung tố cáo.pdf',
    suggestedAction: 'Lấy ý kiến pháp chế và hoàn thiện dự thảo kết luận.',
  },
  'vv-kl-2': {
    id: 'vv-kl-2',
    name: 'Trình lãnh đạo phê duyệt',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 5 – Kết luận & Phê duyệt',
    macroPhase: 'vu_viec',
    status: 'pending',
    legalBasis: 'Quy trình trình duyệt văn bản kết luận',
    description: 'Trình bộ hồ sơ xác minh cùng dự thảo Kết luận lên Lãnh đạo có thẩm quyền giải quyết tố cáo.',
    draftDocument: 'Tờ trình ban hành Kết luận nội dung tố cáo.pdf',
    suggestedAction: 'Báo cáo tóm tắt các điểm mấu chốt và kiến nghị xử lý.',
  },
  'vv-kl-3': {
    id: 'vv-kl-3',
    name: 'Lãnh đạo xem xét / phê duyệt kết luận',
    role: 'lanh_dao',
    roleName: 'Lãnh đạo',
    stageName: 'GĐ 5 – Kết luận & Phê duyệt',
    macroPhase: 'vu_viec',
    status: 'pending',
    legalBasis: 'Điều 35 Luật Tố cáo 2018',
    description: 'Lãnh đạo xem xét, kết luận: Phê duyệt ký ban hành hoặc yêu cầu xác minh bổ sung / sửa đổi dự thảo kết luận.',
    draftDocument: 'Phiếu ý kiến duyệt Kết luận của Lãnh đạo.pdf',
    suggestedAction: 'Ký số phê duyệt văn bản kết luận nội dung tố cáo.',
  },
  'vv-bh-1': {
    id: 'vv-bh-1',
    name: 'Ban hành kết luận',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 6 – Ban hành & Kết thúc vụ việc',
    macroPhase: 'vu_viec',
    status: 'pending',
    legalBasis: 'Điều 35 Luật Tố cáo 2018',
    description: 'Lấy số văn thư, phát hành Kết luận nội dung tố cáo chính thức gửi các cơ quan liên quan và đương sự.',
    draftDocument: 'Kết luận nội dung tố cáo số 88/KL-UBND.pdf',
    suggestedAction: 'Phát hành văn bản điện tử và gửi thông báo hệ thống.',
  },
  'vv-bh-2': {
    id: 'vv-bh-2',
    name: 'Thực hiện / xử lý theo kết luận',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 6 – Ban hành & Kết thúc vụ việc',
    macroPhase: 'vu_viec',
    status: 'pending',
    legalBasis: 'Điều 40, Điều 41 Luật Tố cáo 2018',
    description: 'Chuyển cơ quan có thẩm quyền xử lý kỷ luật, xử phạt hành chính hoặc chuyển cơ quan điều tra nếu có dấu hiệu tội phạm.',
    draftDocument: 'Văn bản chỉ đạo thực hiện kết luận nội dung tố cáo.pdf',
    suggestedAction: 'Đôn đốc các đơn vị thực hiện kiến nghị xử lý.',
  },
  'vv-bh-3': {
    id: 'vv-bh-3',
    name: 'Thông báo / trả kết quả',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 6 – Ban hành & Kết thúc vụ việc',
    macroPhase: 'vu_viec',
    status: 'pending',
    legalBasis: 'Điều 36 Luật Tố cáo 2018',
    description: 'Gửi Thông báo kết luận nội dung tố cáo cho người tố cáo (đảm bảo bảo mật bí mật thông tin người tố cáo).',
    draftDocument: 'Thông báo kết quả giải quyết tố cáo gửi người tố cáo.pdf',
    suggestedAction: 'Gửi kết quả qua bưu chính bảo đảm hoặc cổng DVC trực tuyến.',
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
  const [activeStepId, setActiveStepId] = useState<string>('tn-2');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((curr) => (curr === msg ? null : curr)), 3500);
  };

  const selectedNode = NODES_DATA[selectedNodeId] || NODES_DATA['tn-2'];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-800 overflow-hidden font-body-md select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl text-xs font-semibold animate-fade-in border border-slate-700">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner Tiêu đề chuẩn theo ảnh BRD */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0047AB] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            GOV
          </div>
          <div>
            <h2 className="text-sm font-black text-[#0047AB] tracking-tight uppercase font-headline-md">
              QUY TRÌNH XỬ LÝ ĐƠN TỐ CÁO VÀ VỤ VIỆC - GOVEX
            </h2>
            <p className="text-[11px] text-slate-500">
              Hồ sơ: <strong className="text-slate-800">{donCode}</strong> • {donTitle} • Người đứng đơn: <strong>{nguoiNop}</strong>
            </p>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.7))}
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

      {/* Main Diagram Area with Zoom */}
      <div className="flex-1 overflow-auto p-4 bg-slate-50">
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', minWidth: '1360px' }}
          className="transition-transform duration-150 space-y-3"
        >
          {/* ========================================================================= */}
          {/* PHẦN 1: BẢNG LÀN BƠI CHÍNH (QUÁ TRÌNH XỬ LÝ ĐƠN + XỬ LÝ VỤ VIỆC)          */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            {/* 1. Header các giai đoạn (6 Cột Giai đoạn) */}
            <div className="grid grid-cols-12 bg-sky-100/70 border-b border-slate-300 text-center font-bold text-xs text-slate-800">
              <div className="col-span-2 p-2 border-r border-slate-300 flex items-center justify-center bg-slate-100 text-slate-700 uppercase tracking-tight text-[11px]">
                TÁC NHÂN
              </div>
              <div className="col-span-2 p-2 border-r border-slate-300 text-[11px] uppercase bg-sky-50 text-blue-900">
                GĐ 1 – TIẾP NHẬN &amp; XÁC ĐỊNH HƯỚNG XỬ LÝ ĐƠN
              </div>
              <div className="col-span-2 p-2 border-r-2 border-dashed border-slate-400 text-[11px] uppercase bg-sky-50 text-blue-900">
                GĐ 2 – PHÊ DUYỆT &amp; THỤ LÝ ĐƠN
              </div>
              <div className="col-span-2 p-2 border-r border-slate-300 text-[11px] uppercase bg-emerald-50 text-emerald-950">
                GĐ 3 – TẠO VỤ VIỆC &amp; PHÂN CÔNG
              </div>
              <div className="col-span-1 p-2 border-r border-slate-300 text-[11px] uppercase bg-emerald-50 text-emerald-950">
                GĐ 4 – XÁC MINH VỤ VIỆC
              </div>
              <div className="col-span-1 p-2 border-r border-slate-300 text-[11px] uppercase bg-emerald-50 text-emerald-950">
                GĐ 5 – KẾT LUẬN &amp; PHÊ DUYỆT
              </div>
              <div className="col-span-2 p-2 text-[11px] uppercase bg-emerald-50 text-emerald-950">
                GĐ 6 – BAN HÀNH &amp; KẾT THÚC VỤ VIỆC
              </div>
            </div>

            {/* 2. LÀN BƠI 1: CÁN BỘ CHUYÊN MÔN */}
            <div className="grid grid-cols-12 border-b border-slate-300 bg-sky-50/20 min-h-[175px]">
              <div className="col-span-2 p-3 border-r border-slate-300 flex flex-col justify-center items-center text-center bg-sky-100/40">
                <span className="material-symbols-outlined text-blue-700 text-xl">person</span>
                <span className="text-xs font-bold text-blue-950 mt-1 uppercase tracking-tight">
                  CÁN BỘ CHUYÊN MÔN
                </span>
                <span className="text-[10px] text-slate-500">Nguyễn Minh Anh</span>
              </div>

              {/* GĐ 1: Tiếp nhận -> Kiểm tra -> Kết quả xử lý? (4 nhánh) */}
              <div className="col-span-2 p-2 border-r border-slate-300 flex flex-col justify-center gap-1.5 relative">
                <div className="flex items-center gap-1.5">
                  {/* Node Tiếp nhận đơn */}
                  <div
                    onClick={() => setSelectedNodeId('tn-1')}
                    className={`flex-1 p-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                      selectedNodeId === 'tn-1' ? 'ring-2 ring-blue-600 bg-blue-50 border-blue-500 font-bold' : 'bg-white border-blue-300 hover:border-blue-500'
                    }`}
                  >
                    <span className="text-[10.5px] text-blue-900 font-medium block leading-tight">Tiếp nhận đơn</span>
                  </div>
                  <span className="material-symbols-outlined text-blue-600 text-xs">arrow_forward</span>

                  {/* Node Kiểm tra ban đầu */}
                  <div
                    onClick={() => setSelectedNodeId('tn-2')}
                    className={`flex-1 p-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                      selectedNodeId === 'tn-2' ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-600 font-bold' : 'bg-white border-blue-300 hover:border-blue-500'
                    }`}
                  >
                    <span className="text-[10px] text-blue-900 font-semibold block leading-tight">Kiểm tra ban đầu &amp; xác định hướng</span>
                  </div>
                </div>

                {/* Khối quyết định Kết quả xử lý? & 4 nhánh */}
                <div className="mt-1 pt-1 border-t border-slate-200/80 grid grid-cols-1 gap-1 text-[9.5px]">
                  {/* Nhánh 1: Không thụ lý */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-semibold text-slate-500 w-16 truncate">Không thụ lý →</span>
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId('tn-kt-khong-thu-ly')}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[9.5px] cursor-pointer"
                    >
                      Không thụ lý
                    </button>
                    <span className="px-1 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[9px]">
                      KẾT THÚC ĐƠN
                    </span>
                  </div>

                  {/* Nhánh 2: Bàn giao */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-semibold text-slate-500 w-16 truncate">Bàn giao →</span>
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId('tn-kt-ban-giao')}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[9.5px] cursor-pointer"
                    >
                      Bàn giao đơn
                    </button>
                    <span className="px-1 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[9px]">
                      KẾT THÚC ĐƠN
                    </span>
                  </div>

                  {/* Nhánh 3: Trả lại đơn */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-semibold text-slate-500 w-16 truncate">Trả lại đơn →</span>
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId('tn-kt-tra-lai')}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[9.5px] cursor-pointer"
                    >
                      Trả lại đơn
                    </button>
                    <span className="px-1 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[9px]">
                      KẾT THÚC ĐƠN
                    </span>
                  </div>

                  {/* Nhánh 4: Thụ lý */}
                  <div className="flex items-center gap-1 text-blue-700 font-bold bg-blue-50/70 p-0.5 rounded">
                    <span>Thụ lý</span>
                    <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                    <span className="text-[9px] text-slate-500 font-normal">Chuyển sang GĐ 2 (Đề xuất thụ lý)</span>
                  </div>
                </div>
              </div>

              {/* GĐ 2: Đề xuất thụ lý -> Trình lãnh đạo + Cán bộ thụ lý tố cáo (sau khi được duyệt) */}
              <div className="col-span-2 p-2 border-r-2 border-dashed border-slate-400 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      onClick={() => setSelectedNodeId('tl-1')}
                      className={`flex-1 p-2 rounded-lg border text-center cursor-pointer transition-all ${
                        selectedNodeId === 'tl-1' ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold' : 'bg-white border-blue-300 hover:border-blue-500'
                      }`}
                    >
                      <span className="text-[10.5px] text-blue-900 font-bold block">Đề xuất thụ lý</span>
                    </div>
                    <span className="material-symbols-outlined text-blue-600 text-xs">arrow_forward</span>
                    <div
                      onClick={() => setSelectedNodeId('tl-2')}
                      className={`flex-1 p-2 rounded-lg border text-center cursor-pointer transition-all ${
                        selectedNodeId === 'tl-2' ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold' : 'bg-white border-blue-300 hover:border-blue-500'
                      }`}
                    >
                      <span className="text-[10px] text-blue-900 font-semibold block leading-tight">Trình lãnh đạo phê duyệt</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-rose-600 font-medium bg-rose-50 p-1 rounded border border-rose-200 text-center">
                    ↵ Yêu cầu chỉnh sửa (từ Lãnh đạo)
                  </div>
                </div>

                {/* Kết quả sau duyệt: Cán bộ chuyên môn thụ lý tố cáo -> KẾT THÚC ĐƠN */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1">
                  <div
                    onClick={() => setSelectedNodeId('tl-5')}
                    className={`flex-1 p-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                      selectedNodeId === 'tl-5' ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold' : 'bg-white border-blue-300'
                    }`}
                  >
                    <span className="text-[10px] text-blue-950 font-bold block leading-tight">
                      Cán bộ chuyên môn thụ lý tố cáo
                    </span>
                  </div>
                  <span className="px-1.5 py-1 rounded bg-emerald-100 border border-emerald-400 text-emerald-800 font-bold text-[9px] shrink-0">
                    KẾT THÚC ĐƠN
                  </span>
                </div>
              </div>

              {/* GĐ 3: Để trống ở làn Cán bộ chuyên môn (Lãnh đạo & Cán bộ được phân công làm) */}
              <div className="col-span-2 p-2 border-r border-slate-300 flex items-center justify-center text-slate-300 text-xs italic">
                (Lãnh đạo phân công)
              </div>

              {/* GĐ 4: Để trống ở làn Cán bộ chuyên môn (Cán bộ được phân công xác minh) */}
              <div className="col-span-1 p-2 border-r border-slate-300 flex items-center justify-center text-slate-300 text-xs italic">
                —
              </div>

              {/* GĐ 5: Dự thảo kết luận / hướng xử lý -> Trình lãnh đạo */}
              <div className="col-span-1 p-1.5 border-r border-slate-300 flex flex-col justify-center gap-1">
                <div
                  onClick={() => setSelectedNodeId('vv-kl-1')}
                  className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                    selectedNodeId === 'vv-kl-1' ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold' : 'bg-white border-blue-300'
                  }`}
                >
                  <span className="text-[9.5px] text-blue-900 font-bold block leading-tight">Dự thảo kết luận / hướng xử lý</span>
                </div>
                <div className="text-center">
                  <span className="material-symbols-outlined text-blue-600 text-xs">arrow_downward</span>
                </div>
                <div
                  onClick={() => setSelectedNodeId('vv-kl-2')}
                  className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                    selectedNodeId === 'vv-kl-2' ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold' : 'bg-white border-blue-300'
                  }`}
                >
                  <span className="text-[9px] text-blue-900 font-semibold block leading-tight">Trình lãnh đạo phê duyệt</span>
                </div>
              </div>

              {/* GĐ 6: Ban hành kết luận -> Thực hiện xử lý -> Thông báo trả kết quả -> KẾT THÚC VỤ VIỆC */}
              <div className="col-span-2 p-2 flex items-center justify-between gap-1 text-[9.5px]">
                <div
                  onClick={() => setSelectedNodeId('vv-bh-1')}
                  className="flex-1 p-1 rounded bg-white border border-blue-300 text-center cursor-pointer hover:border-blue-500"
                >
                  <span className="font-bold text-blue-900 block">Ban hành kết luận</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-xs">arrow_forward</span>
                <div
                  onClick={() => setSelectedNodeId('vv-bh-2')}
                  className="flex-1 p-1 rounded bg-white border border-blue-300 text-center cursor-pointer hover:border-blue-500"
                >
                  <span className="font-semibold text-slate-800 block">Thực hiện xử lý theo KL</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-xs">arrow_forward</span>
                <div
                  onClick={() => setSelectedNodeId('vv-bh-3')}
                  className="flex-1 p-1 rounded bg-white border border-blue-300 text-center cursor-pointer hover:border-blue-500"
                >
                  <span className="font-semibold text-slate-800 block">Thông báo trả kết quả</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-xs">arrow_forward</span>
                <span className="px-1.5 py-1 rounded bg-emerald-100 border border-emerald-500 text-emerald-900 font-black text-[9px] shrink-0">
                  KẾT THÚC VỤ VIỆC
                </span>
              </div>
            </div>

            {/* 3. LÀN BƠI 2: LÃNH ĐẠO */}
            <div className="grid grid-cols-12 border-b border-slate-300 bg-amber-50/25 min-h-[110px]">
              <div className="col-span-2 p-3 border-r border-slate-300 flex flex-col justify-center items-center text-center bg-amber-100/50">
                <span className="material-symbols-outlined text-amber-700 text-xl">shield_person</span>
                <span className="text-xs font-bold text-amber-950 mt-1 uppercase tracking-tight">
                  LÃNH ĐẠO
                </span>
                <span className="text-[10px] text-slate-500">Trần Văn Cường (Phó Thủ trưởng)</span>
              </div>

              {/* GĐ 1: Trống */}
              <div className="col-span-2 p-2 border-r border-slate-300 flex items-center justify-center text-slate-300 text-xs italic">
                —
              </div>

              {/* GĐ 2: Lãnh đạo xem xét / phê duyệt đề xuất thụ lý -> Phê duyệt? */}
              <div className="col-span-2 p-2 border-r-2 border-dashed border-slate-400 flex items-center gap-2">
                <div
                  onClick={() => setSelectedNodeId('tl-3')}
                  className={`flex-1 p-2 rounded-lg border text-center cursor-pointer transition-all ${
                    selectedNodeId === 'tl-3' ? 'ring-2 ring-amber-600 bg-amber-100 border-amber-500 font-bold' : 'bg-white border-amber-300'
                  }`}
                >
                  <span className="text-[10px] text-amber-950 font-bold block leading-tight">
                    Lãnh đạo xem xét / phê duyệt đề xuất thụ lý
                  </span>
                </div>
                <div className="w-16 h-14 bg-purple-50 border border-purple-300 rotate-45 flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="-rotate-45 text-[9px] font-bold text-purple-900 text-center leading-none">
                    Phê duyệt?
                  </span>
                </div>
              </div>

              {/* GĐ 3: Lãnh đạo xem Vụ việc & phân công cán bộ xác minh */}
              <div className="col-span-2 p-2 border-r border-slate-300 flex items-center justify-center">
                <div
                  onClick={() => setSelectedNodeId('vv-pc-1')}
                  className={`w-full p-2.5 rounded-lg border text-center cursor-pointer transition-all ${
                    selectedNodeId === 'vv-pc-1' ? 'ring-2 ring-amber-600 bg-amber-100 border-amber-500 font-bold' : 'bg-white border-amber-300'
                  }`}
                >
                  <span className="text-[10.5px] text-amber-950 font-bold block leading-tight">
                    Lãnh đạo xem Vụ việc &amp; phân công cán bộ xác minh
                  </span>
                </div>
              </div>

              {/* GĐ 4: Trống */}
              <div className="col-span-1 p-2 border-r border-slate-300 flex items-center justify-center text-slate-300 text-xs italic">
                —
              </div>

              {/* GĐ 5: Lãnh đạo xem xét / phê duyệt kết luận -> Kết quả phê duyệt? */}
              <div className="col-span-1 p-1.5 border-r border-slate-300 flex flex-col items-center justify-center gap-1">
                <div
                  onClick={() => setSelectedNodeId('vv-kl-3')}
                  className={`w-full p-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                    selectedNodeId === 'vv-kl-3' ? 'ring-2 ring-amber-600 bg-amber-100 border-amber-500 font-bold' : 'bg-white border-amber-300'
                  }`}
                >
                  <span className="text-[9px] text-amber-950 font-bold block leading-tight">
                    Lãnh đạo xem xét / duyệt KL
                  </span>
                </div>
                <span className="text-[8.5px] px-1 py-0.2 rounded bg-purple-100 text-purple-900 font-bold">
                  Phê duyệt?
                </span>
              </div>

              {/* GĐ 6: Trống */}
              <div className="col-span-2 p-2 flex items-center justify-center text-slate-300 text-xs italic">
                —
              </div>
            </div>

            {/* 4. LÀN BƠI 3: HỆ THỐNG */}
            <div className="grid grid-cols-12 border-b border-slate-300 bg-slate-50 min-h-[90px]">
              <div className="col-span-2 p-3 border-r border-slate-300 flex flex-col justify-center items-center text-center bg-slate-200/60">
                <span className="material-symbols-outlined text-slate-700 text-xl">database</span>
                <span className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-tight">
                  HỆ THỐNG
                </span>
                <span className="text-[10px] text-slate-500">GOVEX Core Engine</span>
              </div>

              {/* GĐ 1: Trống */}
              <div className="col-span-2 p-2 border-r border-slate-300 flex items-center justify-center text-slate-300 text-xs italic">
                —
              </div>

              {/* GĐ 2: Tự động cấp số thụ lý -> Hệ thống tạo Vụ việc sau khi thụ lý thành công */}
              <div className="col-span-2 p-2 border-r-2 border-dashed border-slate-400 flex items-center gap-1.5">
                <div
                  onClick={() => setSelectedNodeId('tl-4')}
                  className={`flex-1 p-2 rounded-lg border-2 border-dashed border-slate-400 text-center cursor-pointer transition-all ${
                    selectedNodeId === 'tl-4' ? 'bg-slate-200 font-bold' : 'bg-white'
                  }`}
                >
                  <span className="text-[10px] text-slate-800 font-bold block leading-tight">
                    Tự động cấp số thụ lý
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-500 text-xs">arrow_forward</span>
                <div
                  onClick={() => setSelectedNodeId('tl-6')}
                  className={`flex-1 p-2 rounded-lg border-2 border-dashed border-slate-400 text-center cursor-pointer transition-all ${
                    selectedNodeId === 'tl-6' ? 'bg-slate-200 font-bold' : 'bg-white'
                  }`}
                >
                  <span className="text-[9.5px] text-slate-800 font-bold block leading-tight">
                    Hệ thống tạo Vụ việc sau khi thụ lý
                  </span>
                </div>
              </div>

              {/* GĐ 3, 4, 5, 6: Trống */}
              <div className="col-span-2 p-2 border-r border-slate-300 flex items-center justify-center text-slate-300 text-xs italic">
                (Đồng bộ CSDL Vụ việc)
              </div>
              <div className="col-span-1 p-2 border-r border-slate-300 flex items-center justify-center text-slate-300 text-xs italic">—</div>
              <div className="col-span-1 p-2 border-r border-slate-300 flex items-center justify-center text-slate-300 text-xs italic">—</div>
              <div className="col-span-2 p-2 flex items-center justify-center text-slate-300 text-xs italic">
                (Lưu trữ CSDL Quốc gia)
              </div>
            </div>

            {/* 5. LÀN BƠI 4: CÁN BỘ ĐƯỢC PHÂN CÔNG */}
            <div className="grid grid-cols-12 bg-emerald-50/15 min-h-[110px]">
              <div className="col-span-2 p-3 border-r border-slate-300 flex flex-col justify-center items-center text-center bg-emerald-100/50">
                <span className="material-symbols-outlined text-emerald-700 text-xl">badge</span>
                <span className="text-xs font-bold text-emerald-950 mt-1 uppercase tracking-tight">
                  CÁN BỘ ĐƯỢC PHÂN CÔNG
                </span>
                <span className="text-[10px] text-slate-500">Tổ xác minh vụ việc</span>
              </div>

              {/* GĐ 1, 2: Trống */}
              <div className="col-span-2 p-2 border-r border-slate-300 flex items-center justify-center text-slate-300 text-xs italic">
                —
              </div>
              <div className="col-span-2 p-2 border-r-2 border-dashed border-slate-400 flex items-center justify-center text-slate-300 text-xs italic">
                —
              </div>

              {/* GĐ 3: Cán bộ được phân công nhận Vụ việc */}
              <div className="col-span-2 p-2 border-r border-slate-300 flex items-center justify-center">
                <div
                  onClick={() => setSelectedNodeId('vv-pc-2')}
                  className={`w-full p-2.5 rounded-lg border text-center cursor-pointer transition-all ${
                    selectedNodeId === 'vv-pc-2' ? 'ring-2 ring-emerald-600 bg-emerald-100 border-emerald-500 font-bold' : 'bg-white border-emerald-300'
                  }`}
                >
                  <span className="text-[10.5px] text-emerald-950 font-bold block leading-tight">
                    Cán bộ được phân công nhận Vụ việc
                  </span>
                </div>
              </div>

              {/* GĐ 4: Xác minh nội dung tố cáo -> Thu thập tài liệu / chứng cứ -> Báo cáo kết quả xác minh */}
              <div className="col-span-1 p-1.5 border-r border-slate-300 flex flex-col justify-center gap-1">
                <div
                  onClick={() => setSelectedNodeId('vv-xm-1')}
                  className="p-1 rounded bg-white border border-emerald-300 text-center cursor-pointer hover:border-emerald-500"
                >
                  <span className="text-[8.5px] font-bold text-emerald-950 block leading-tight">Xác minh nội dung</span>
                </div>
                <div
                  onClick={() => setSelectedNodeId('vv-xm-2')}
                  className="p-1 rounded bg-white border border-emerald-300 text-center cursor-pointer hover:border-emerald-500"
                >
                  <span className="text-[8.5px] font-bold text-emerald-950 block leading-tight">Thu thập tài liệu / chứng cứ</span>
                </div>
                <div
                  onClick={() => setSelectedNodeId('vv-xm-3')}
                  className="p-1 rounded bg-white border border-emerald-300 text-center cursor-pointer hover:border-emerald-500"
                >
                  <span className="text-[8.5px] font-bold text-emerald-950 block leading-tight">Báo cáo kết quả xác minh</span>
                </div>
              </div>

              {/* GĐ 5, 6: Trống */}
              <div className="col-span-1 p-2 border-r border-slate-300 flex items-center justify-center text-slate-300 text-xs italic">
                —
              </div>
              <div className="col-span-2 p-2 flex items-center justify-center text-slate-300 text-xs italic">
                —
              </div>
            </div>

            {/* DẢI PHÂN CÁCH MACRO: QUÁ TRÌNH XỬ LÝ ĐƠN TỐ CÁO vs QUÁ TRÌNH XỬ LÝ VỤ VIỆC */}
            <div className="grid grid-cols-12 text-white font-bold text-xs uppercase tracking-tight text-center">
              <div className="col-span-4 p-2.5 bg-[#0047AB] flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">description</span>
                <span>QUÁ TRÌNH XỬ LÝ ĐƠN TỐ CÁO</span>
              </div>
              <div className="col-span-2 p-2.5 bg-[#b71c1c] border-x-2 border-white flex items-center justify-center gap-1.5 text-[11px]">
                <span className="material-symbols-outlined text-sm">swap_horiz</span>
                <span>KẾT THÚC XỬ LÝ ĐƠN → BẮT ĐẦU XỬ LÝ VỤ VIỆC</span>
              </div>
              <div className="col-span-6 p-2.5 bg-[#1b5e20] flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">work_history</span>
                <span>QUÁ TRÌNH XỬ LÝ VỤ VIỆC</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PHẦN 2: KHUNG DƯỚI - LUỒNG PHÁT SINH – RÚT ĐƠN                             */}
          {/* ========================================================================= */}
          <div className="bg-purple-50/40 rounded-2xl border-2 border-dashed border-purple-300 p-3.5 shadow-2xs">
            <div className="grid grid-cols-12 gap-3 items-stretch">
              {/* Tiêu đề bên trái */}
              <div className="col-span-2 bg-[#6b21a8] text-white p-3 rounded-xl flex flex-col justify-center items-center text-center shadow-2xs">
                <span className="material-symbols-outlined text-2xl text-purple-200">assignment_return</span>
                <span className="text-xs font-black tracking-tight mt-1 uppercase">
                  LUỒNG PHÁT SINH – RÚT ĐƠN
                </span>
                <span className="text-[10px] text-purple-200 mt-0.5">Xử lý yêu cầu rút đơn của công dân</span>
              </div>

              {/* 1. RÚT ĐƠN TRONG QUÁ TRÌNH XỬ LÝ ĐƠN */}
              <div className="col-span-5 bg-white p-3 rounded-xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between border-b border-purple-100 pb-1.5">
                  <h4 className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>RÚT ĐƠN TRONG QUÁ TRÌNH XỬ LÝ ĐƠN</span>
                  </h4>
                  <span className="text-[10px] text-purple-700 font-medium">Từ GĐ 1 hoặc GĐ 2</span>
                </div>

                <div className="flex items-center gap-2 text-[10.5px]">
                  <div className="space-y-1 text-[9.5px] text-slate-500 w-36 shrink-0 border-r border-purple-100 pr-1">
                    <p>• Từ bước Tiếp nhận đơn</p>
                    <p>• Từ bước Kiểm tra ban đầu</p>
                    <p>• Từ bước Thụ lý tố cáo</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-1">
                    <div className="p-1 rounded bg-purple-100 border border-purple-300 text-purple-900 font-bold text-[9px] text-center">
                      Phát sinh rút đơn?
                    </div>
                    <span className="text-xs text-blue-600 font-bold">→ Có →</span>
                    <div className="p-1.5 rounded bg-blue-50 border border-blue-300 text-blue-900 font-semibold text-[9.5px] text-center leading-tight">
                      Tiếp nhận yêu cầu rút đơn
                    </div>
                    <span className="text-xs text-blue-600 font-bold">→</span>
                    <div className="p-1 rounded bg-purple-100 border border-purple-300 text-purple-900 font-bold text-[9px] text-center">
                      Tiếp tục xử lý?
                    </div>
                  </div>

                  <div className="space-y-1 shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-[9px] text-rose-600 font-bold">Không →</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-400 text-emerald-800 font-bold text-[9px]">
                        KẾT THÚC ĐƠN
                      </span>
                    </div>
                    <div className="text-[9px] text-blue-600">
                      Có ↪ Quay lại quy trình xử lý đơn
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. RÚT ĐƠN TRONG QUÁ TRÌNH XỬ LÝ VỤ VIỆC */}
              <div className="col-span-5 bg-white p-3 rounded-xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between border-b border-purple-100 pb-1.5">
                  <h4 className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>RÚT ĐƠN TRONG QUÁ TRÌNH XỬ LÝ VỤ VIỆC</span>
                  </h4>
                  <span className="text-[10px] text-purple-700 font-medium">Từ GĐ 4 (Xác minh)</span>
                </div>

                <div className="flex items-center gap-2 text-[10.5px]">
                  <div className="space-y-1 text-[9.5px] text-slate-500 w-36 shrink-0 border-r border-purple-100 pr-1">
                    <p>• Từ bước Xác minh nội dung</p>
                    <p>• Từ bước Báo cáo kết quả</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-1">
                    <div className="p-1 rounded bg-purple-100 border border-purple-300 text-purple-900 font-bold text-[9px] text-center">
                      Phát sinh rút đơn?
                    </div>
                    <span className="text-xs text-blue-600 font-bold">→ Có →</span>
                    <div className="p-1.5 rounded bg-blue-50 border border-blue-300 text-blue-900 font-semibold text-[9.5px] text-center leading-tight">
                      Đánh giá có tiếp tục giải quyết vụ việc không?
                    </div>
                  </div>

                  <div className="space-y-1 shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-[9px] text-rose-600 font-bold">Không →</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-400 text-emerald-800 font-bold text-[9px]">
                        KẾT THÚC VỤ VIỆC
                      </span>
                    </div>
                    <div className="text-[9px] text-blue-600">
                      Có ↪ Quay lại quy trình xử lý vụ việc
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM DRAWER / PANEL: CHI TIẾT BƯỚC ĐANG CHỌN                            */}
      {/* ========================================================================= */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0047AB] border border-blue-200 text-xs font-bold">
              {selectedNode.stageName}
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{selectedNode.name}</span>
              <span className="text-[11px] font-normal text-slate-500">
                (Tác nhân: <strong className="text-slate-700">{selectedNode.roleName}</strong>)
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast(`✓ Đã xác nhận hoàn thành thao tác tại bước: "${selectedNode.name}"!`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
              <span>Xác nhận thực hiện bước này</span>
            </button>
            <button
              type="button"
              onClick={() => showToast(`✓ Đã mở biểu mẫu: "${selectedNode.draftDocument || 'Hồ sơ văn bản'}"`)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-blue-600">visibility</span>
              <span>Xem dự thảo biểu mẫu</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10.5px] font-bold text-slate-500 block uppercase">Căn cứ pháp lý:</span>
            <span className="text-slate-800 font-medium">{selectedNode.legalBasis}</span>
          </div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-500 block uppercase">Nội dung nghiệp vụ:</span>
            <span className="text-slate-800">{selectedNode.description}</span>
          </div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-500 block uppercase">Gợi ý tác nghiệp AI:</span>
            <span className="text-blue-900 font-semibold">{selectedNode.suggestedAction}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
