// src/screens/workflowAdmin/components/WorkflowDataConditionsTab.tsx
import React, { useState } from 'react';
import { ProcessWorkflow, ProcessTransition, ConditionOperator } from '../../../types/workflowConfig';
import { CONDITION_OPERATORS } from '../../../constants/processWorkflows';

interface WorkflowDataConditionsTabProps {
  workflow: ProcessWorkflow;
  onSelectTransition?: (transId: string) => void;
}

export default function WorkflowDataConditionsTab({
  workflow,
  onSelectTransition,
}: WorkflowDataConditionsTabProps) {
  const [filterType, setFilterType] = useState<'all' | 'normal' | 'return'>('all');
  const [hasCondOnly, setHasCondOnly] = useState(false);
  const [searchKw, setSearchKw] = useState('');

  const transitions = workflow.transitions || [];

  const filteredTransitions = transitions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (hasCondOnly && (!t.conditions || t.conditions.length === 0)) return false;
    if (searchKw.trim()) {
      const kw = searchKw.toLowerCase();
      const matchName = t.name.toLowerCase().includes(kw);
      const matchSource = (t.fromStepName || '').toLowerCase().includes(kw);
      const matchTarget = (t.toStepName || '').toLowerCase().includes(kw);
      if (!matchName && !matchSource && !matchTarget) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f7fb]">
      {/* Top Controls */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-200/90 shadow-2xs space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-700 text-lg">alt_route</span>
              <span>Ma trận điều kiện chuyển bước &amp; Dữ liệu nghiệp vụ</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cấu hình các quy tắc logic (AND/OR), ràng buộc dữ liệu hồ sơ, văn bản lưu trữ và quyền hạn chuyển giao giữa các bước
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200">
              {transitions.length} đường chuyển luồng
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="relative min-w-[220px]">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[17px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              placeholder="Tìm hành động, bước nguồn, bước đích..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilterType('normal')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'normal'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Chuyển tiếp (Bình thường)
            </button>
            <button
              type="button"
              onClick={() => setFilterType('return')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'return'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đường trả lại hồ sơ
            </button>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={hasCondOnly}
              onChange={(e) => setHasCondOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Chỉ hiện đường có điều kiện ràng buộc</span>
          </label>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredTransitions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto shadow-2xs">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">alt_route</span>
            <h4 className="text-sm font-bold text-slate-700">Không tìm thấy đường chuyển phù hợp</h4>
            <p className="text-xs text-slate-400 mt-1">
              Thử thay đổi bộ lọc tìm kiếm hoặc kết nối thêm connector trên màn hình Thiết kế canvas.
            </p>
          </div>
        ) : (
          filteredTransitions.map((t) => {
            const hasConditions = t.conditions && t.conditions.length > 0;
            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border transition-all bg-white text-left ${
                  t.type === 'return'
                    ? 'border-amber-200 hover:border-amber-300'
                    : 'border-slate-200/90 hover:border-blue-300'
                } shadow-2xs hover:shadow-xs`}
              >
                {/* Header of Transition */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`material-symbols-outlined text-[19px] ${
                        t.type === 'return' ? 'text-amber-600' : 'text-blue-600'
                      }`}
                    >
                      {t.type === 'return' ? 'undo' : 'trending_flat'}
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">{t.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider ${
                        t.type === 'return'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {t.type === 'return' ? 'Đường trả lại' : 'Chuyển bình thường'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono">
                      Mã connector: <strong>{t.id}</strong>
                    </span>
                    {onSelectTransition && (
                      <button
                        type="button"
                        onClick={() => onSelectTransition(t.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                        <span>Cấu hình trên canvas</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Flow info: Source -> Target */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Bước xuất phát (Nguồn)
                    </span>
                    <strong className="text-slate-800 font-semibold">{t.fromStepName || t.fromStepId}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Bước tiếp theo (Đích)
                    </span>
                    <strong className="text-slate-800 font-semibold">{t.toStepName || t.toStepId}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Tạo Task &amp; Nhóm nhận
                    </span>
                    <strong className="text-blue-800">
                      {t.createNextTask ? `Có sinh Task → ${t.taskAssigneeRole || 'Bộ phận tiếp nhận'}` : 'Không sinh Task'}
                    </strong>
                  </div>
                </div>

                {/* Roles allowed */}
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                  <span className="font-semibold text-slate-500">Vai trò được phép thao tác:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {t.allowedRoles && t.allowedRoles.length > 0 ? (
                      t.allowedRoles.map((role, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200"
                        >
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">Mặc định theo nhóm chịu trách nhiệm của bước</span>
                    )}
                  </div>
                </div>

                {/* Conditions Block */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Điều kiện dữ liệu ràng buộc:
                  </span>

                  {hasConditions ? (
                    <div className="space-y-1.5">
                      {t.conditions.map((cond, cIdx) => {
                        const opLabel = CONDITION_OPERATORS.find((o) => o.id === cond.operator)?.label || cond.operator;
                        return (
                          <div
                            key={cond.id || cIdx}
                            className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/50 border border-blue-100 text-xs font-mono"
                          >
                            {cIdx > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-extrabold text-[10px]">
                                {cond.logicOp}
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200 font-bold">
                              {cond.fieldSource}
                            </span>
                            <span className="text-blue-900 font-bold">{cond.fieldName}</span>
                            <span className="text-slate-500">{opLabel}</span>
                            {cond.operator !== 'co_gia_tri' && cond.operator !== 'khong_co_gia_tri' && (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
                                "{cond.value || '...'}"
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic p-2 rounded-xl bg-slate-50 border border-slate-100">
                      Không có điều kiện ràng buộc. Cán bộ có quyền có thể chuyển bước trực tiếp khi hoàn thành.
                    </div>
                  )}

                  {t.warningMessage && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                      <span className="material-symbols-outlined text-[15px] text-amber-600">warning</span>
                      <span>Thông báo cảnh báo khi thiếu điều kiện: <strong>"{t.warningMessage}"</strong></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
