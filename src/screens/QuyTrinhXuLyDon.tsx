import React, { useState } from 'react';
import { Screen } from '../types';
import { ActiveWorkflowState, TaskItem, MissingInfoItem, WorkflowDefinition } from '../types/workflow';
import ChuyenQuyTrinhModal from '../components/workflow/ChuyenQuyTrinhModal';

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
      {/* 2. BODY CHÍNH: KHU VỰC A, B, C, D                                     */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* KHU VỰC A: TIẾN TRÌNH QUY TRÌNH (FLOW PIPELINE)                     */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#004ac6]"></span>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight font-headline-md">
                A. TIẾN TRÌNH QUY TRÌNH XỬ LÝ (WORKFLOW FLOW)
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Hoàn thành
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#004ac6] animate-pulse"></span> Đang thực hiện
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Chờ thực hiện
              </span>
            </div>
          </div>

          {/* Sơ đồ Flow cuộn ngang */}
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-2 min-w-[860px]">
              {workflowState.workflow.steps.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isActive = step.id === workflowState.activeStepId;
                const isSelected = step.id === selectedStepId;

                return (
                  <React.Fragment key={step.id}>
                    <div
                      onClick={() => setSelectedStepId(step.id)}
                      className={`flex-1 p-3.5 rounded-xl border transition-all cursor-pointer select-none relative ${
                        isSelected
                          ? 'ring-2 ring-blue-600 ring-offset-1 shadow-sm'
                          : 'hover:border-slate-400'
                      } ${
                        isActive
                          ? 'bg-blue-50/90 border-[#004ac6]'
                          : isCompleted
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            isActive
                              ? 'bg-[#004ac6] text-white shadow-xs'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isCompleted ? '✓' : step.stepNumber}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-blue-200 text-[#004ac6]'
                              : isCompleted
                              ? 'bg-emerald-200/80 text-emerald-900'
                              : 'bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          {isActive ? 'BƯỚC HIỆN TẠI' : isCompleted ? 'ĐÃ XONG' : 'CHỜ'}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                        {step.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {step.responsibleRole}
                      </p>
                    </div>

                    {idx < workflowState.workflow.steps.length - 1 && (
                      <span className="material-symbols-outlined text-slate-300 text-[18px] shrink-0">
                        arrow_forward
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Chi tiết bước đang chọn */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#004ac6]">info</span>
                Chi tiết Bước {activeStep.stepNumber}: {activeStep.name}
              </span>
              <p className="text-slate-600 text-[11.5px] leading-relaxed">
                {activeStep.description}
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 flex-wrap">
                <span><strong>Đơn vị thực hiện: </strong>{activeStep.responsibleUnit || activeStep.responsibleRole}</span>
                <span>•</span>
                <span><strong>Điều kiện chuyển bước: </strong>{activeStep.transferCondition || 'Hoàn tất các công việc'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAiAssistantMode('du_thao');
                setDraftContent(`PHIẾU ĐỀ XUẤT XỬ LÝ BƯỚC: ${activeStep.name}\nKính gửi: Lãnh đạo Đơn vị\nCán bộ đề xuất: Nguyễn Minh Anh\nNội dung: Đã đối soát hồ sơ...`);
                setShowAiAssistantModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs transition-colors shrink-0 cursor-pointer"
            >
              Soạn thảo văn bản bước này
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TABS CHUYỂN ĐỔI: CÔNG VIỆC CỦA TÔI / TẤT CẢ / THIẾU THÔNG TIN / LỊCH SỬ */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('my-tasks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'my-tasks'
                  ? 'bg-[#004ac6] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
              <span>B. CÔNG VIỆC CỦA TÔI ({myTasks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all-tasks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all-tasks'
                  ? 'bg-[#004ac6] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">group</span>
              <span>C. CÔNG VIỆC VAI TRÒ KHÁC ({otherTasks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('missing-info')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'missing-info'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>THÔNG TIN CẦN BỔ SUNG ({missingInfoList.filter((m) => !m.resolved).length})</span>
            </button>

            {workflowState.historyLogs && workflowState.historyLogs.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">history</span>
                <span>LỊCH SỬ CHUYỂN ĐỔI ({workflowState.historyLogs.length})</span>
              </button>
            )}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Phân công cho: <strong>Nguyễn Minh Anh</strong> (Cán bộ thụ lý)
          </span>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* KHU VỰC B: CÔNG VIỆC CỦA TÔI (MY TASKS)                             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'my-tasks' && (
          <div className="space-y-4">
            {myTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs ${
                  task.status === 'completed'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200/90 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(task.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center cursor-pointer transition-all mt-0.5 ${
                        task.status === 'completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-[#004ac6] bg-white'
                      }`}
                      title={task.status === 'completed' ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
                    >
                      {task.status === 'completed' && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-bold text-slate-900 ${
                            task.status === 'completed' ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-blue-50 text-[#004ac6] border border-blue-200">
                          {task.stepName}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span>Hạn xử lý: <strong className="text-rose-600">{task.deadline}</strong></span>
                        <span>•</span>
                        <span>Người thực hiện: <strong className="text-slate-700">{task.assignedTo}</strong> ({task.assignedRole})</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                      task.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {task.status === 'completed' ? 'Đã hoàn thành' : 'Đang thực hiện'}
                  </span>
                </div>

                {/* TÀI LIỆU LIÊN QUAN */}
                {task.relatedDocuments && task.relatedDocuments.length > 0 && (
                  <div className="mt-3 pl-9 flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                    <span className="font-semibold text-slate-500">Tài liệu đính kèm:</span>
                    {task.relatedDocuments.map((doc, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium"
                      >
                        📄 {doc}
                      </span>
                    ))}
                  </div>
                )}

                {/* KHU VỰC D: GÓI AI HỖ TRỢ TÍCH HỢP TRỰC TIẾP TRONG CÔNG VIỆC */}
                {task.aiAssistance && (
                  <div className="mt-4 ml-9 p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                      <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 uppercase tracking-tight">
                        <span className="material-symbols-outlined text-[16px] text-indigo-600">auto_awesome</span>
                        AI HỖ TRỢ CHO CÔNG VIỆC NÀY
                      </span>
                      <span className="text-[10.5px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        TRỢ LÝ TÁC NGHIỆP
                      </span>
                    </div>

                    {task.aiAssistance.summary && (
                      <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-indigo-100/60">
                        <strong>Tóm tắt trọng tâm: </strong>{task.aiAssistance.summary}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {task.aiAssistance.checkDocuments && (
                        <div className="p-2.5 bg-white rounded-lg border border-indigo-100 space-y-1">
                          <span className="font-bold text-blue-900 block flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">find_in_page</span>
                            Tài liệu cần kiểm tra:
                          </span>
                          <ul className="pl-4 list-disc text-slate-600 space-y-0.5">
                            {task.aiAssistance.checkDocuments.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {task.aiAssistance.verifyInformation && (
                        <div className="p-2.5 bg-white rounded-lg border border-indigo-100 space-y-1">
                          <span className="font-bold text-emerald-900 block flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">verified_user</span>
                            Thông tin cần xác minh:
                          </span>
                          <ul className="pl-4 list-disc text-slate-600 space-y-0.5">
                            {task.aiAssistance.verifyInformation.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Phím tác vụ AI nhanh */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setAiAssistantMode('du_thao');
                          setDraftContent(`DỰ THẢO BIÊN BẢN / BÁO CÁO:\n- Cán bộ thực hiện: ${task.assignedTo}\n- Vụ việc: ${workflowState.donTitle}\n- Kết quả kiểm tra sơ bộ: Đủ điều kiện thụ lý nguồn tin tội phạm...`);
                          setShowAiAssistantModal(true);
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit_document</span>
                        <span>Soạn thảo dự thảo bằng AI</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAiAssistantMode('kiem_tra_thieu');
                          setShowAiAssistantModal(true);
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">search_check</span>
                        <span>Kiểm tra thiếu sót hồ sơ</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer nút hành động */}
                <div className="mt-4 pt-3 border-t border-slate-100 pl-9 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-slate-400">
                    Cập nhật lần cuối: Vừa xong
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => showToast('Đã lưu ghi chú công việc.')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Ghi chú
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(task.id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        task.status === 'completed'
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-[#004ac6] text-white hover:bg-[#003da8]'
                      }`}
                    >
                      {task.status === 'completed' ? 'Mở lại công việc' : 'Hoàn thành công việc'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* KHU VỰC C: CÁC CÔNG VIỆC KHÁC (OTHER ROLES' TASKS)                  */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'all-tasks' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">info</span>
              <span>
                Các công việc dưới đây thuộc trách nhiệm của Lãnh đạo hoặc Đơn vị phối hợp ở các bước tiếp theo trong quy trình.
              </span>
            </div>

            {otherTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {task.stepName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span>Phân công: <strong className="text-slate-800">{task.assignedTo}</strong> ({task.assignedRole})</span>
                      <span>•</span>
                      <span>Hạn xử lý: {task.deadline}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    Chờ thực hiện
                  </span>
                </div>

                {task.aiAssistance?.summary && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                    <strong>Gợi ý AI: </strong>{task.aiAssistance.summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB THÔNG TIN CẦN BỔ SUNG (MISSING INFO)                            */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'missing-info' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
                AI phát hiện danh mục thông tin và chứng cứ cần hoàn thiện để hồ sơ đủ điều kiện pháp lý giải quyết.
              </span>
              <span className="text-[11px] font-bold text-amber-800">
                Không tự động kết luận hồ sơ không hợp lệ
              </span>
            </div>

            {missingInfoList.map((miss) => (
              <div
                key={miss.id}
                className={`p-4 rounded-2xl border transition-all ${
                  miss.resolved
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : 'bg-white border-amber-200/80 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleResolveMissingInfo(miss.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 cursor-pointer ${
                        miss.resolved
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white hover:border-emerald-500'
                      }`}
                    >
                      {miss.resolved && <span className="material-symbols-outlined text-[14px]">check</span>}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-xs font-bold text-slate-900 ${
                            miss.resolved ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {miss.title}
                        </h4>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                          {miss.impactLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {miss.description}
                      </p>
                      <div className="pt-1 text-xs text-slate-500 space-y-0.5">
                        <p><strong>Hướng xử lý đề xuất: </strong>{miss.suggestedAction}</p>
                        <p className="italic text-slate-400 text-[11px]">Nguồn AI phát hiện: {miss.aiSource}</p>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                      miss.resolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {miss.resolved ? 'Đã bổ sung' : 'Chưa bổ sung'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB LỊCH SỬ CHUYỂN ĐỔI QUY TRÌNH (AUDIT TRAIL - RULE 9)             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-600">history_edu</span>
              LỊCH SỬ ĐIỀU CHỈNH LOẠI ĐƠN &amp; QUY TRÌNH (AUDIT TRAIL)
            </h3>

            <div className="space-y-3">
              {workflowState.historyLogs?.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="font-bold text-slate-800">{log.actor}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="font-semibold text-slate-900">{log.action}</div>
                  <div className="grid grid-cols-2 gap-2 p-2 rounded bg-white border border-slate-200/60 text-[11.5px]">
                    <div>
                      <span className="text-slate-400 block">Quy trình trước đó:</span>
                      <span className="font-medium text-slate-700 line-through">{log.previousValue}</span>
                    </div>
                    <div>
                      <span className="text-emerald-600 font-bold block">Quy trình mới áp dụng:</span>
                      <span className="font-bold text-emerald-800">{log.newValue}</span>
                    </div>
                  </div>
                  {log.reason && (
                    <p className="text-slate-600 italic pt-1 border-t border-slate-200/50">
                      Lý do điều chỉnh: "{log.reason}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
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
