// src/screens/workflowAdmin/components/TransitionPropertiesPanel.tsx
import React from 'react';
import {
  ProcessTransition,
  ProcessStep,
  ProcessLane,
  TransitionCondition,
  ConditionFieldSource,
  ConditionOperator,
} from '../../../types/workflowConfig';
import { CONDITION_SOURCES, CONDITION_OPERATORS } from '../../../constants/processWorkflows';

interface TransitionPropertiesPanelProps {
  transition: ProcessTransition;
  steps: ProcessStep[];
  lanes: ProcessLane[];
  onUpdateTransition: (updated: ProcessTransition) => void;
  onDeleteTransition: (transId: string) => void;
  onClose: () => void;
}

export default function TransitionPropertiesPanel({
  transition,
  steps,
  lanes,
  onUpdateTransition,
  onDeleteTransition,
  onClose,
}: TransitionPropertiesPanelProps) {
  const fromStep = steps.find((s) => s.id === transition.fromStepId);
  const toStep = steps.find((s) => s.id === transition.toStepId);

  // Thêm điều kiện mới
  const handleAddCondition = () => {
    const newCond: TransitionCondition = {
      id: `cond-${Date.now()}`,
      logicOp: 'AND',
      fieldSource: 'ho_so',
      fieldName: '',
      operator: '=',
      value: '',
    };
    onUpdateTransition({
      ...transition,
      conditions: [...transition.conditions, newCond],
    });
  };

  // Cập nhật điều kiện
  const handleUpdateCondition = (condId: string, patch: Partial<TransitionCondition>) => {
    onUpdateTransition({
      ...transition,
      conditions: transition.conditions.map((c) => (c.id === condId ? { ...c, ...patch } : c)),
    });
  };

  // Xóa điều kiện
  const handleRemoveCondition = (condId: string) => {
    onUpdateTransition({
      ...transition,
      conditions: transition.conditions.filter((c) => c.id !== condId),
    });
  };



  return (
    <aside className="w-96 bg-white border-l border-slate-200/90 flex flex-col h-full shrink-0 shadow-lg select-none z-20 animate-in slide-in-from-right duration-150">
      {/* 1. Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`material-symbols-outlined text-[20px] ${transition.type === 'return' ? 'text-amber-600' : 'text-blue-600'
              }`}
          >
            {transition.type === 'return' ? 'undo' : 'trending_flat'}
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
            Thuộc tính đường chuyển bước
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDeleteTransition(transition.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Xóa đường chuyển này"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Đóng panel"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* Tên hành động */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Tên hành động / Nhãn đường chuyển <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={transition.actionName}
            onChange={(e) => onUpdateTransition({ ...transition, actionName: e.target.value })}
            placeholder="Vd: Chuyển xác minh, Trình lãnh đạo, Trả lại..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Bước nguồn & Bước đích */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Bước nguồn</label>
            <select
              value={transition.fromStepId}
              onChange={(e) => onUpdateTransition({ ...transition, fromStepId: e.target.value })}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {steps.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Bước đích</label>
            <select
              value={transition.toStepId}
              onChange={(e) => onUpdateTransition({ ...transition, toStepId: e.target.value })}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {steps.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tóm tắt trực quan hướng đi */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <span className="font-semibold text-slate-800 truncate max-w-[130px]">
            {fromStep?.name || transition.fromStepId}
          </span>
          <div className="flex items-center gap-1 text-slate-400 shrink-0 px-2">
            <span className="material-symbols-outlined text-[15px] text-blue-600">arrow_forward</span>
          </div>
          <span className="font-semibold text-slate-800 truncate max-w-[130px] text-right">
            {toStep?.name || transition.toStepId}
          </span>
        </div>

        {/* Loại đường chuyển: Bình thường / Trả lại */}
        <div>
          <label className="block font-bold text-slate-800 mb-1.5">Loại đường chuyển</label>
          <div className="grid grid-cols-2 gap-2">
            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${transition.type === 'normal'
                  ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
            >
              <input
                type="radio"
                name="transType"
                value="normal"
                checked={transition.type === 'normal'}
                onChange={() => onUpdateTransition({ ...transition, type: 'normal' })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs">Bình thường</span>
            </label>

            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${transition.type === 'return'
                  ? 'bg-amber-50/70 border-amber-300 text-amber-900 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
            >
              <input
                type="radio"
                name="transType"
                value="return"
                checked={transition.type === 'return'}
                onChange={() => onUpdateTransition({ ...transition, type: 'return' })}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs">Trả lại / Quay về</span>
            </label>
          </div>
        </div>

        {/* Nhóm/vai trò được phép thực hiện */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Nhóm / vai trò được phép thực hiện
          </label>
          <input
            type="text"
            value={transition.allowedRoles.join(', ')}
            onChange={(e) =>
              onUpdateTransition({
                ...transition,
                allowedRoles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="Cán bộ thụ lý, Lãnh đạo đơn vị, Văn thư..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Có tạo Task bước tiếp theo hay không & Nhóm nhận Task */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block text-xs">Tạo Task cho bước tiếp</span>
              <span className="text-[11px] text-slate-500">Tự động sinh tác vụ vào danh sách việc cần làm</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={transition.createNextTask}
                onChange={(e) => onUpdateTransition({ ...transition, createNextTask: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {transition.createNextTask && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nhóm nhận Task
              </label>
              <select
                value={transition.taskAssigneeRole}
                onChange={(e) => onUpdateTransition({ ...transition, taskAssigneeRole: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              >
                {lanes.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Nội dung cảnh báo khi không đủ điều kiện */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Nội dung cảnh báo khi không đủ điều kiện
          </label>
          <textarea
            rows={2}
            value={transition.warningMessage || ''}
            onChange={(e) => onUpdateTransition({ ...transition, warningMessage: e.target.value })}
            placeholder="Ví dụ: Hồ sơ chưa đủ căn cứ xác minh hoặc thẩm quyền không phù hợp..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* KHU VỰC: ĐIỀU KIỆN CHUYỂN BƯỚC */}
        <div className="pt-2 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                Điều kiện chuyển bước ({transition.conditions.length})
              </h4>
              <span className="text-[10.5px] text-slate-500">
                Chỉ cho phép chuyển bước khi thỏa mãn biểu thức logic
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddCondition}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              Thêm điều kiện
            </button>
          </div>

          {/* Biểu thức logic preview */}
          {renderConditionFormula()}

          {/* Danh sách điều kiện */}
          <div className="space-y-3">
            {transition.conditions.map((cond, idx) => (
              <div
                key={cond.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 relative group"
              >
                {/* Header dòng điều kiện + Phép toán AND/OR */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {idx > 0 ? (
                      <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateCondition(cond.id, { logicOp: 'AND' })}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${cond.logicOp === 'AND' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                          AND
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateCondition(cond.id, { logicOp: 'OR' })}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${cond.logicOp === 'OR' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                          OR
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                        Điều kiện #{idx + 1}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(cond.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Xóa điều kiện này"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                  </button>
                </div>

                {/* 1. Nguồn điều kiện */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                      Nguồn điều kiện
                    </label>
                    <select
                      value={cond.fieldSource}
                      onChange={(e) =>
                        handleUpdateCondition(cond.id, { fieldSource: e.target.value as ConditionFieldSource })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                    >
                      {CONDITION_SOURCES.map((src) => (
                        <option key={src.id} value={src.id}>
                          {src.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tên trường dữ liệu */}
                  <div>
                    <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                      Trường dữ liệu
                    </label>
                    <input
                      type="text"
                      value={cond.fieldName}
                      onChange={(e) => handleUpdateCondition(cond.id, { fieldName: e.target.value })}
                      placeholder="Vd: Loại đơn, Thẩm quyền..."
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* 2. Toán tử & Giá trị */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                      Toán tử
                    </label>
                    <select
                      value={cond.operator}
                      onChange={(e) =>
                        handleUpdateCondition(cond.id, { operator: e.target.value as ConditionOperator })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                    >
                      {CONDITION_OPERATORS.map((op) => (
                        <option key={op.id} value={op.id}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                      Giá trị so sánh
                    </label>
                    <input
                      type="text"
                      disabled={cond.operator === 'co_gia_tri' || cond.operator === 'khong_co_gia_tri'}
                      value={
                        cond.operator === 'co_gia_tri' || cond.operator === 'khong_co_gia_tri'
                          ? '(Không cần giá trị)'
                          : cond.value
                      }
                      onChange={(e) => handleUpdateCondition(cond.id, { value: e.target.value })}
                      placeholder="Nhập giá trị..."
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            ))}

            {transition.conditions.length === 0 && (
              <div className="p-3 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400">
                <span className="material-symbols-outlined text-[20px] text-slate-300 block mb-0.5">
                  rule
                </span>
                <p className="text-xs">Chưa thiết lập điều kiện nào</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Đường chuyển sẽ luôn hợp lệ nếu không có điều kiện ràng buộc</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
