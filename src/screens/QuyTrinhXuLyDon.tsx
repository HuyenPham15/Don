import React, { useState } from 'react';
import { Screen } from '../types';
import { ActiveWorkflowState, TaskItem, MissingInfoItem, WorkflowDefinition } from '../types/workflow';
import ChuyenQuyTrinhModal from '../components/workflow/ChuyenQuyTrinhModal';
import SwimlaneWorkflowDiagram from '../components/workflow/SwimlaneWorkflowDiagram';

interface QuyTrinhXuLyDonProps {
  onNav: (s: Screen) => void;
  workflowState: ActiveWorkflowState;
  onUpdateWorkflowState?: (newState: ActiveWorkflowState) => void;
}

export default function QuyTrinhXuLyDon({
  onNav,
  workflowState,
  onUpdateWorkflowState,
}: QuyTrinhXuLyDonProps) {
  const [activeTab, setActiveTab] = useState<'my-tasks' | 'all-tasks' | 'missing-info' | 'history'>('my-tasks');
  const [selectedStepId, setSelectedStepId] = useState<string>(workflowState.activeStepId);
  const [tasks, setTasks] = useState<TaskItem[]>(workflowState.tasks);
  const [missingInfoList, setMissingInfoList] = useState<MissingInfoItem[]>(workflowState.missingInfoList);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showChuyenQuyTrinhModal, setShowChuyenQuyTrinhModal] = useState<boolean>(false);

  // AI Assistant Interactive Drawer / Modal State
  const [showAiAssistantModal, setShowAiAssistantModal] = useState<boolean>(false);
  const [aiAssistantMode, setAiAssistantMode] = useState<'tom_tat' | 'kiem_tra_thieu' | 'du_thao'>('tom_tat');
  const [draftContent, setDraftContent] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'in_progress' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
    showToast('✓ Đã cập nhật trạng thái công việc thành công!');
  };

  const handleResolveMissingInfo = (infoId: string) => {
    setMissingInfoList((prev) =>
      prev.map((m) => (m.id === infoId ? { ...m, resolved: !m.resolved } : m))
    );
    showToast('✓ Đã cập nhật trạng thái thông tin cần bổ sung.');
  };

  // Xử lý chuyển đổi loại đơn và quy trình (Rule 9)
  const handleConfirmChangeWorkflow = (
    newLoaiDon: string,
    newWorkflow: WorkflowDefinition,
    reason: string
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ngày ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      actor: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
      action: 'Chuyển đổi quy trình xử lý theo loại đơn mới',
      previousValue: `${workflowState.loaiDonConfirmed} (${workflowState.workflow.name})`,
      newValue: `${newLoaiDon} (${newWorkflow.name})`,
      reason: reason,
    };

    const updatedState: ActiveWorkflowState = {
      ...workflowState,
      loaiDonConfirmed: newLoaiDon,
      workflow: newWorkflow,
      activeStepId: newWorkflow.steps[1]?.id || newWorkflow.steps[0].id,
      tasks: newWorkflow.defaultTasks,
      missingInfoList: newWorkflow.potentialMissingInfo,
      historyLogs: [newLog, ...(workflowState.historyLogs || [])],
    };

    setTasks(newWorkflow.defaultTasks);
    setMissingInfoList(newWorkflow.potentialMissingInfo);
    setSelectedStepId(updatedState.activeStepId);
    setShowChuyenQuyTrinhModal(false);

    if (onUpdateWorkflowState) {
      onUpdateWorkflowState(updatedState);
    }

    showToast(`✓ Đã chuyển đổi sang quy trình: "${newWorkflow.name}" thành công!`);
  };

  const myTasks = tasks.filter((t) => t.isCurrentUser);
  const otherTasks = tasks.filter((t) => !t.isCurrentUser);

  const activeStep =
    workflowState.workflow.steps.find((s) => s.id === selectedStepId) ||
    workflowState.workflow.steps[0];

  return (
    <div className="flex flex-col h-full bg-[#f4f7fb] text-slate-800 overflow-hidden font-body-md">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. HEADER MÀN HÌNH "QUY TRÌNH XỬ LÝ ĐƠN"                              */}
      {/* ===================================================================== */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-3.5 shrink-0 shadow-2xs">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs mb-2.5">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <button
              type="button"
              onClick={() => onNav('ban-phan-tich')}
              className="flex items-center gap-1 text-[#004ac6] hover:underline font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Bàn phân tích</span>
            </button>
            <span className="text-slate-300">/</span>
            <button
              type="button"
              onClick={() => onNav('cong-viec')}
              className="hover:underline text-slate-600 cursor-pointer"
            >
              Bàn làm việc
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800">Quy trình xử lý đơn</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">tune</span>
              Gợi ý tác nghiệp • Không bắt buộc tuần tự
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#004ac6] border border-blue-200 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6] animate-pulse"></span>
              ĐANG XỬ LÝ
            </span>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              Mã lượt nhận: {workflowState.luotNhanId}
            </span>
          </div>
        </div>

        {/* Title row & Action Controls */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight font-headline-md">
                {workflowState.donCode}: {workflowState.donTitle}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs">
                {workflowState.loaiDonConfirmed}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>Người đứng đơn: <strong className="text-slate-800">{workflowState.nguoiNop}</strong></span>
              <span>•</span>
              <span>Quy trình áp dụng: <strong className="text-[#004ac6]">{workflowState.workflow.name}</strong> ({workflowState.workflow.code})</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Nút thay đổi loại đơn (Rule 9) */}
            <button
              type="button"
              onClick={() => setShowChuyenQuyTrinhModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Thay đổi loại đơn sẽ chuyển đổi quy trình và tạo lại danh mục công việc"
            >
              <span className="material-symbols-outlined text-[15px] text-amber-600">sync_alt</span>
              <span>Đổi loại đơn / Chuyển quy trình</span>
            </button>

            {/* Trợ lý AI tổng thể */}
            <button
              type="button"
              onClick={() => {
                setAiAssistantMode('tom_tat');
                setShowAiAssistantModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px] text-indigo-600">auto_awesome</span>
              <span>Trợ lý AI thụ lý</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. BODY: SƠ ĐỒ QUY TRÌNH PHÂN LÀN BƠI (SWIMLANE WORKFLOW DIAGRAM)    */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <SwimlaneWorkflowDiagram
          initialWorkflowType={
            workflowState.loaiDonConfirmed?.toLowerCase().includes('khiếu nại')
              ? 'khieu-nai'
              : workflowState.loaiDonConfirmed?.toLowerCase().includes('tố giác') ||
                workflowState.loaiDonConfirmed?.toLowerCase().includes('hình sự')
              ? 'to-giac'
              : 'khoi-kien'
          }
          donCode={workflowState.donCode}
          donTitle={workflowState.donTitle}
          nguoiNop={workflowState.nguoiNop}
        />
      </div>

      {/* ===================================================================== */}
      {/* MODAL TRỢ LÝ AI TÁC NGHIỆP                                            */}
      {/* ===================================================================== */}
      {showAiAssistantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Trợ lý AI thụ lý vụ việc ({workflowState.donCode})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiAssistantModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {aiAssistantMode === 'tom_tat' && (
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong>Tóm tắt toàn bộ hồ sơ: </strong>Đơn của ông <strong>{workflowState.nguoiNop}</strong> khiếu kiện/tố giác liên quan đến việc huy động vốn đầu tư số tiền 3.5 tỷ VNĐ. Hiện tại đã vào sổ thụ lý và đang ở bước 2: <em>Kiểm tra đối soát chứng cứ ban đầu</em>.
                </p>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                  <span className="font-bold">Đề xuất hành động tiếp theo:</span>
                  <ul className="pl-4 list-disc space-y-0.5">
                    <li>Ban hành Thông báo yêu cầu bổ sung bản sao kê ngân hàng có mộc.</li>
                    <li>Chuẩn bị hồ sơ chuyển Đội Điều tra kinh tế theo thẩm quyền.</li>
                  </ul>
                </div>
              </div>
            )}

            {aiAssistantMode === 'kiem_tra_thieu' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  AI đã rà soát đối chiếu 02 file PDF đính kèm với danh mục kiểm tra pháp lý:
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-amber-900">
                  <p>• <strong>Thiếu: </strong>Bản gốc sao kê tài khoản ngân hàng của người nộp đơn.</p>
                  <p>• <strong>Thiếu: </strong>Văn bản ủy quyền công chứng hợp lệ cho Luật sư.</p>
                  <p>• <strong>Cần lưu ý: </strong>Tài khoản của Công ty X đang có tranh chấp tại 01 vụ việc khác.</p>
                </div>
              </div>
            )}

            {aiAssistantMode === 'du_thao' && (
              <div className="space-y-2 text-xs">
                <label className="font-bold text-slate-800 block">
                  Nội dung dự thảo văn bản (AI tạo theo mẫu quy định):
                </label>
                <textarea
                  rows={6}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:bg-white focus:border-[#004ac6] leading-relaxed"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAiAssistantModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
              {aiAssistantMode === 'du_thao' && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAiAssistantModal(false);
                    showToast('✓ Đã sao chép nội dung dự thảo vào hồ sơ vụ việc.');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] text-white text-xs font-bold cursor-pointer"
                >
                  Sao chép &amp; Áp dụng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CẢNH BÁO CHUYỂN QUY TRÌNH (RULE 9) */}
      <ChuyenQuyTrinhModal
        isOpen={showChuyenQuyTrinhModal}
        onClose={() => setShowChuyenQuyTrinhModal(false)}
        currentLoaiDon={workflowState.loaiDonConfirmed}
        currentWorkflow={workflowState.workflow}
        onConfirmChange={handleConfirmChangeWorkflow}
      />
    </div>
  );
}
