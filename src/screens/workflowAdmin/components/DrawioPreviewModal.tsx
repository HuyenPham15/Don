// src/screens/workflowAdmin/components/DrawioPreviewModal.tsx
import React, { useMemo } from 'react';
import { ProcessWorkflow, ProcessStep, ProcessTransition } from '../../../types/workflowConfig';

interface DrawioPreviewModalProps {
  workflow: ProcessWorkflow;
  isOpen: boolean;
  onClose: () => void;
  onSelectStep?: (stepId: string) => void;
}

interface ValidationCheckResult {
  id: string;
  type: 'start' | 'end' | 'orphan' | 'condition';
  severity: 'error' | 'warning' | 'success';
  title: string;
  desc: string;
  affectedNodes?: { id: string; name: string }[];
}

export default function DrawioPreviewModal({
  workflow,
  isOpen,
  onClose,
  onSelectStep,
}: DrawioPreviewModalProps) {
  if (!isOpen) return null;

  const { steps, transitions } = workflow;

  // Validation checks logic
  const validationResults: ValidationCheckResult[] = useMemo(() => {
    const results: ValidationCheckResult[] = [];

    // 1. Kiểm tra điểm bắt đầu
    const startNodes = steps.filter((s) => s.nodeType === 'START');
    if (startNodes.length === 0) {
      results.push({
        id: 'no-start',
        type: 'start',
        severity: 'error',
        title: 'Thiếu điểm bắt đầu',
        desc: 'Quy trình chưa có khối "Bắt đầu". Vui lòng kéo khối Bắt đầu từ thư viện vào canvas.',
      });
    } else {
      results.push({
        id: 'has-start',
        type: 'start',
        severity: 'success',
        title: 'Điểm bắt đầu hợp lệ',
        desc: `Đã có khối bắt đầu: "${startNodes[0].name}"`,
      });
    }

    // 2. Kiểm tra điểm kết thúc
    const endNodes = steps.filter((s) => s.nodeType === 'END');
    if (endNodes.length === 0) {
      results.push({
        id: 'no-end',
        type: 'end',
        severity: 'warning',
        title: 'Thiếu điểm kết thúc',
        desc: 'Quy trình chưa có khối "Kết thúc". Nên bổ sung để xác định rõ khi nào hồ sơ hoàn tất.',
      });
    } else {
      results.push({
        id: 'has-end',
        type: 'end',
        severity: 'success',
        title: 'Điểm kết thúc hợp lệ',
        desc: `Đã có ${endNodes.length} khối kết thúc: ${endNodes.map((e) => e.name).join(', ')}`,
      });
    }

    // 3. Kiểm tra các node chưa kết nối (mồ côi)
    const connectedStepIds = new Set<string>();
    transitions.forEach((t) => {
      connectedStepIds.add(t.fromStepId);
      connectedStepIds.add(t.toStepId);
    });

    const orphanSteps = steps.filter(
      (s) => !connectedStepIds.has(s.id) && s.nodeType !== 'INFO_GROUP' && s.nodeType !== 'DATA_FIELD'
    );

    if (orphanSteps.length > 0) {
      results.push({
        id: 'orphan-nodes',
        type: 'orphan',
        severity: 'warning',
        title: `${orphanSteps.length} khối chưa được kết nối`,
        desc: 'Các khối này đứng độc lập, chưa có đường luồng đến hoặc đi.',
        affectedNodes: orphanSteps.map((s) => ({ id: s.id, name: s.name })),
      });
    } else if (steps.length > 1) {
      results.push({
        id: 'all-connected',
        type: 'orphan',
        severity: 'success',
        title: 'Liên kết luồng đầy đủ',
        desc: 'Tất cả các khối xử lý và điều kiện đều đã có đường nối luồng.',
      });
    }

    // 4. Kiểm tra điều kiện thiếu nhánh
    const conditionNodes = steps.filter((s) => s.nodeType === 'CHECK');
    const incompleteConditions: { id: string; name: string; outCount: number }[] = [];

    conditionNodes.forEach((c) => {
      const outTransitions = transitions.filter((t) => t.fromStepId === c.id);
      if (outTransitions.length < 2) {
        incompleteConditions.push({ id: c.id, name: c.name, outCount: outTransitions.length });
      }
    });

    if (incompleteConditions.length > 0) {
      results.push({
        id: 'condition-missing-branches',
        type: 'condition',
        severity: 'warning',
        title: `${incompleteConditions.length} khối điều kiện thiếu nhánh rẽ`,
        desc: 'Khối điều kiện thường cần ít nhất 2 nhánh rẽ (Đúng / Sai) để luồng tiếp tục.',
        affectedNodes: incompleteConditions.map((c) => ({
          id: c.id,
          name: `${c.name} (${c.outCount}/2 nhánh)`,
        })),
      });
    }

    return results;
  }, [steps, transitions]);

  const errorCount = validationResults.filter((r) => r.severity === 'error').length;
  const warningCount = validationResults.filter((r) => r.severity === 'warning').length;

  // Xây dựng chuỗi luồng từ START
  const flowSequence = useMemo(() => {
    const startNode = steps.find((s) => s.nodeType === 'START');
    if (!startNode) return [];

    const seq: ProcessStep[] = [];
    const visited = new Set<string>();

    const traverse = (stepId: string) => {
      if (visited.has(stepId)) return;
      visited.add(stepId);
      const step = steps.find((s) => s.id === stepId);
      if (step) {
        seq.push(step);
        const outs = transitions.filter((t) => t.fromStepId === stepId);
        outs.forEach((t) => traverse(t.toStepId));
      }
    };

    traverse(startNode.id);
    return seq;
  }, [steps, transitions]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">visibility</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{workflow.name}</h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {workflow.code}
                </span>
                <span className="text-xs text-slate-500 font-mono">v{workflow.version}</span>
              </div>
              <p className="text-xs text-slate-500">
                Xem trước cấu trúc luồng và kết quả kiểm tra trước khi phát hành
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 block">Tổng số khối</span>
              <span className="text-xl font-bold text-slate-900 mt-0.5 block">{steps.length}</span>
              <span className="text-[10px] text-slate-400">Trên canvas</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 block">Đường chuyển tiếp</span>
              <span className="text-xl font-bold text-blue-700 mt-0.5 block">{transitions.length}</span>
              <span className="text-[10px] text-slate-400">Kết nối giữa các bước</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 block">Điều kiện rẽ nhánh</span>
              <span className="text-xl font-bold text-amber-600 mt-0.5 block">
                {steps.filter((s) => s.nodeType === 'CHECK').length}
              </span>
              <span className="text-[10px] text-slate-400">Phân luồng xử lý</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 block">Kiểm tra hợp lệ</span>
              <div className="flex items-center gap-1.5 mt-1">
                {errorCount === 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Sẵn sàng
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    {errorCount} lỗi
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">{warningCount} lưu ý</span>
            </div>
          </div>

          {/* Validation Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>
              Kiểm tra tính hợp lệ cơ bản
            </h4>
            <div className="space-y-2">
              {validationResults.map((check) => (
                <div
                  key={check.id}
                  className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                    check.severity === 'error'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : check.severity === 'warning'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                      check.severity === 'error'
                        ? 'text-rose-600'
                        : check.severity === 'warning'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {check.severity === 'error'
                      ? 'error'
                      : check.severity === 'warning'
                      ? 'warning'
                      : 'check_circle'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold">{check.title}</strong>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          check.severity === 'error'
                            ? 'bg-rose-100 text-rose-800'
                            : check.severity === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {check.severity === 'error'
                          ? 'Bắt buộc'
                          : check.severity === 'warning'
                          ? 'Khuyến nghị'
                          : 'Đạt'}
                      </span>
                    </div>
                    <p className="text-[11.5px] mt-0.5 opacity-90">{check.desc}</p>
                    {check.affectedNodes && check.affectedNodes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {check.affectedNodes.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              onSelectStep?.(n.id);
                              onClose();
                            }}
                            className="px-2 py-0.5 bg-white/80 hover:bg-white text-[11px] font-semibold rounded border border-current/20 cursor-pointer transition-colors shadow-2xs"
                            title="Nhấp để tới khối này trên canvas"
                          >
                            {n.name} ↗
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sequential Workflow Steps View */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-600">route</span>
              Danh sách các bước và liên kết luồng
            </h4>

            {steps.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
                Sơ đồ chưa có khối nào. Vui lòng kéo thả từ thư viện bên trái vào canvas.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs">
                {steps.map((step, idx) => {
                  const outTrans = transitions.filter((t) => t.fromStepId === step.id);
                  const inTrans = transitions.filter((t) => t.toStepId === step.id);

                  return (
                    <div
                      key={step.id}
                      className="p-3 bg-white hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-center font-mono font-bold text-slate-400 text-[11px]">
                          {idx + 1}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            step.nodeType === 'START'
                              ? 'bg-emerald-100 text-emerald-700'
                              : step.nodeType === 'END'
                              ? 'bg-rose-100 text-rose-700'
                              : step.nodeType === 'CHECK'
                              ? 'bg-amber-100 text-amber-700'
                              : step.nodeType === 'INFO_GROUP'
                              ? 'bg-purple-100 text-purple-700'
                              : step.nodeType === 'DATA_FIELD'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {step.nodeType === 'START'
                              ? 'play_circle'
                              : step.nodeType === 'END'
                              ? 'stop_circle'
                              : step.nodeType === 'CHECK'
                              ? 'alt_route'
                              : step.nodeType === 'INFO_GROUP'
                              ? 'topic'
                              : step.nodeType === 'DATA_FIELD'
                              ? 'short_text'
                              : 'task_alt'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 truncate">{step.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 rounded bg-slate-100">
                              {step.nodeType || 'TASK'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {step.nodeType === 'CHECK' && step.conditionConfig
                              ? `Nếu ${step.conditionConfig.fieldName || 'Trường'} ${step.conditionConfig.operator || '='} "${step.conditionConfig.compareValue || ''}"`
                              : step.nodeType === 'INFO_GROUP'
                              ? `${step.dataFields?.length || 0} trường dữ liệu`
                              : step.assigneeRole
                              ? `Xử lý: ${step.assigneeRole}`
                              : 'Chưa gán người xử lý'}
                          </div>
                        </div>
                      </div>

                      {/* Transitions out summary */}
                      <div className="flex items-center gap-2 shrink-0">
                        {outTrans.length > 0 ? (
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className="text-[10.5px] text-slate-400">Đi tiếp:</span>
                            {outTrans.map((t) => {
                              const targetStep = steps.find((s) => s.id === t.toStepId);
                              const isTrue = t.name?.includes('Đúng') || t.actionName?.includes('Đúng');
                              const isFalse = t.name?.includes('Sai') || t.actionName?.includes('Sai');

                              return (
                                <span
                                  key={t.id}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
                                    isTrue
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : isFalse
                                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {isTrue ? '✓ Đúng →' : isFalse ? '✕ Sai →' : '→'}
                                  <span className="truncate max-w-[100px]">{targetStep?.name || t.toStepId}</span>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          step.nodeType !== 'END' && (
                            <span className="text-[10.5px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Chưa có nhánh ra
                            </span>
                          )
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            onSelectStep?.(step.id);
                            onClose();
                          }}
                          className="px-2 py-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Chọn
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {errorCount > 0 ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">error</span>
                Cần khắc phục {errorCount} lỗi bắt buộc trước khi phát hành.
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                Quy trình hợp lệ, sẵn sàng đưa vào vận hành.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Quay lại chỉnh sửa
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
