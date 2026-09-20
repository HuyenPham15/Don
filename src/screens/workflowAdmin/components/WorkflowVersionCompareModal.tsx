// src/screens/workflowAdmin/components/WorkflowVersionCompareModal.tsx
import React, { useState, useMemo } from 'react';
import { ProcessWorkflow, ProcessStep, ProcessTransition } from '../../../types/workflowConfig';

interface WorkflowVersionCompareModalProps {
  workflow: ProcessWorkflow;
  onClose: () => void;
  availableVersions?: string[];
  initialBaseVersion?: string;
  initialTargetVersion?: string;
}

export default function WorkflowVersionCompareModal({
  workflow,
  onClose,
  availableVersions,
  initialBaseVersion,
  initialTargetVersion,
}: WorkflowVersionCompareModalProps) {
  const versions = useMemo(() => {
    if (availableVersions && availableVersions.length > 0) return availableVersions;
    if (workflow.versionHistory && workflow.versionHistory.length > 0) {
      return workflow.versionHistory.map((v) => v.version);
    }
    return ['v1.0', 'v2.0', 'v2.1'];
  }, [availableVersions, workflow]);

  const [baseVer, setBaseVer] = useState<string>(initialBaseVersion || versions[versions.length - 1] || 'v1.0');
  const [targetVer, setTargetVer] = useState<string>(initialTargetVersion || versions[0] || 'v2.1');
  const [displayMode, setDisplayMode] = useState<'list' | 'canvas'>('list');

  // Tính toán giả lập diff giữa 2 phiên bản
  // Phiên bản targetVer có thêm bước STEP-KN-03 đối thoại, sửa SLA, thêm điều kiện
  const diffResult = useMemo(() => {
    const isComparingOldToNew = targetVer > baseVer;
    return {
      addedSteps: isComparingOldToNew
        ? [
            {
              id: 'st-kn-3',
              code: 'STEP-KN-03',
              name: 'Tổ chức đối thoại trực tiếp/trực tuyến',
              lane: 'Lãnh đạo (LD)',
              stage: 'Tổ chức đối thoại',
              sla: '3 ngày làm việc',
              form: 'BM-KN-03 (Biên bản đối thoại)',
            },
          ]
        : [],
      removedSteps: !isComparingOldToNew
        ? [
            {
              id: 'st-kn-legacy',
              code: 'STEP-KN-OLD',
              name: 'Thủ tục gửi giấy báo bản cứng truyền thống',
              lane: 'Văn thư (VT)',
              stage: 'Tiếp nhận đơn',
              reason: 'Bãi bỏ theo chỉ đạo số hóa',
            },
          ]
        : [],
      modifiedSteps: [
        {
          code: 'STEP-KN-02',
          name: 'Xác minh nội dung khiếu nại',
          changes: [
            { field: 'Thời hạn giải quyết (SLA)', before: '30 ngày làm việc', after: '20 ngày làm việc (Rút ngắn 10 ngày)' },
            { field: 'Nhóm chịu trách nhiệm', before: 'Văn thư (VT)', after: 'Chuyên môn (CM)' },
          ],
        },
        {
          code: 'STEP-KN-01',
          name: 'Tiếp nhận đơn khiếu nại',
          changes: [
            { field: 'Tích hợp liên thông', before: 'Chỉ nhận đơn giấy tại Một cửa', after: 'Tự động đồng bộ Cổng Dịch vụ công Quốc gia' },
          ],
        },
      ],
      modifiedTransitions: [
        {
          name: 'Chuyển thụ lý → Xác minh (TRANS-KN-01)',
          changes: [
            { field: 'Điều kiện chuyển bước', before: 'Không có ràng buộc', after: 'Bắt buộc có Quyết định thụ lý (BM-KN-02)' },
          ],
        },
        {
          name: 'Đối thoại → Ban hành quyết định (TRANS-KN-03)',
          changes: [
            { field: 'Điều kiện chuyển bước', before: 'Chưa có', after: 'Bắt buộc có Biên bản đối thoại đã ký số' },
          ],
        },
      ],
      slaDifference: isComparingOldToNew ? -12 : 12, // Giảm 12 ngày làm việc
    };
  }, [baseVer, targetVer]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">compare_arrows</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  So sánh phiên bản quy trình (Version Comparison)
                </h3>
                <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {workflow.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quy trình: <strong>{workflow.name}</strong> • Loại đơn: <strong>{workflow.loaiDonName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[21px]">close</span>
          </button>
        </div>

        {/* Comparison Picker & Display Mode Switcher (Section 13) */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="font-semibold text-slate-600">Phiên bản gốc (Base):</span>
            <select
              value={baseVer}
              onChange={(e) => setBaseVer(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500"
            >
              {versions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <span className="material-symbols-outlined text-slate-400 text-[18px]">arrow_forward</span>

            <span className="font-semibold text-slate-600">Phiên bản so sánh (Target):</span>
            <select
              value={targetVer}
              onChange={(e) => setTargetVer(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-blue-800 shadow-2xs focus:outline-none focus:border-blue-500"
            >
              {versions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Cách 1 vs Cách 2 (Section 13) */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setDisplayMode('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                displayMode === 'list'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
              <span>Cách 1 – Danh sách thay đổi</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('canvas')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                displayMode === 'canvas'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">palette</span>
              <span>Cách 2 – Canvas comparison</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {displayMode === 'list' ? (
            /* CÁCH 1: DANH SÁCH THAY ĐỔI (SECTION 13) */
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Stat summary card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <span className="text-[11px] font-bold block mb-0.5 text-emerald-700">Bước được thêm</span>
                  <strong className="text-base font-extrabold">+{diffResult.addedSteps.length} bước</strong>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                  <span className="text-[11px] font-bold block mb-0.5 text-rose-700">Bước bị xóa</span>
                  <strong className="text-base font-extrabold">-{diffResult.removedSteps.length} bước</strong>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="text-[11px] font-bold block mb-0.5 text-amber-700">Bước thay đổi thuộc tính</span>
                  <strong className="text-base font-extrabold">{diffResult.modifiedSteps.length} bước</strong>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                  <span className="text-[11px] font-bold block mb-0.5 text-blue-700">Chênh lệch thời hạn SLA</span>
                  <strong className="text-base font-extrabold">
                    {diffResult.slaDifference <= 0 ? `${diffResult.slaDifference} ngày` : `+${diffResult.slaDifference} ngày`}
                  </strong>
                </div>
              </div>

              {/* 1. Added Steps */}
              {diffResult.addedSteps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Bước được thêm mới (Added Steps)
                  </h4>
                  <div className="space-y-2">
                    {diffResult.addedSteps.map((st) => (
                      <div key={st.id} className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                              {st.code}
                            </span>
                            <span className="font-extrabold text-slate-900">{st.name}</span>
                          </div>
                          <div className="text-[11.5px] text-slate-500 mt-1 flex items-center gap-3">
                            <span>Nhóm: <strong>{st.lane}</strong></span>
                            <span>•</span>
                            <span>Giai đoạn: <strong>{st.stage}</strong></span>
                            <span>•</span>
                            <span>SLA: <strong>{st.sla}</strong></span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                          + Mới trong {targetVer}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Modified Steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Bước thay đổi cấu hình &amp; SLA (Modified Steps)
                </h4>
                <div className="space-y-2.5">
                  {diffResult.modifiedSteps.map((st, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                          {st.code}
                        </span>
                        <span className="font-extrabold text-slate-900">{st.name}</span>
                      </div>
                      <div className="space-y-1.5 pt-1 border-t border-amber-200/60">
                        {st.changes.map((ch, cIdx) => (
                          <div key={cIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 rounded-lg bg-white border border-amber-100 text-[11.5px]">
                            <span className="font-bold text-slate-700">{ch.field}</span>
                            <span className="text-slate-500 font-mono line-through">Bản {baseVer}: {ch.before}</span>
                            <span className="text-blue-700 font-bold font-mono">Bản {targetVer}: {ch.after}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Modified Transitions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Đường chuyển luồng &amp; Điều kiện thay đổi (Connector &amp; Condition Diff)
                </h4>
                <div className="space-y-2">
                  {diffResult.modifiedTransitions.map((tr, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 text-xs space-y-2">
                      <span className="font-extrabold text-slate-900 block">{tr.name}</span>
                      <div className="space-y-1 pt-1 border-t border-blue-200/60">
                        {tr.changes.map((ch, cIdx) => (
                          <div key={cIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 rounded-lg bg-white border border-blue-100 text-[11.5px]">
                            <span className="font-bold text-slate-700">{ch.field}</span>
                            <span className="text-slate-500 font-mono">{ch.before}</span>
                            <span className="text-blue-800 font-bold font-mono">{ch.after}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* CÁCH 2: CANVAS COMPARISON VỚI 4 MÃ MÀU (SECTION 13) */
            <div className="space-y-4">
              {/* Color legend */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-6 text-xs font-semibold flex-wrap">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600"></span>
                  Xanh lá: Mới thêm (Added)
                </span>
                <span className="flex items-center gap-1.5 text-rose-800">
                  <span className="w-3 h-3 rounded bg-rose-500 border border-rose-600"></span>
                  Đỏ: Bị xóa (Removed)
                </span>
                <span className="flex items-center gap-1.5 text-amber-800">
                  <span className="w-3 h-3 rounded bg-amber-400 border border-amber-500"></span>
                  Vàng: Đã thay đổi (Modified)
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300"></span>
                  Xám: Không thay đổi (Unchanged)
                </span>
              </div>

              {/* Simulated matrix comparison */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="grid grid-cols-5 bg-slate-100 border-b border-slate-300 text-center font-bold text-xs py-2.5 text-slate-700">
                  <span>GĐ 1: Tiếp nhận</span>
                  <span>GĐ 2: Xác minh</span>
                  <span>GĐ 3: Đối thoại</span>
                  <span>GĐ 4: Quyết định</span>
                  <span>GĐ 5: Lưu trữ</span>
                </div>

                <div className="p-6 space-y-4 min-h-[360px] bg-grid-pattern flex flex-col justify-around">
                  {/* Lane 1: Văn thư */}
                  <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50/70 border border-dashed border-slate-300">
                    <span className="w-24 text-xs font-bold text-slate-600 shrink-0">Làn Văn thư</span>
                    <div className="p-3 rounded-xl bg-slate-100 border-2 border-slate-300 text-slate-700 text-xs text-center w-52 shadow-2xs">
                      <span className="font-mono text-[10px] block font-bold text-slate-500">STEP-KN-01</span>
                      <strong className="text-xs">Tiếp nhận đơn khiếu nại</strong>
                      <span className="text-[10px] block text-slate-400 mt-1">⚪ Không thay đổi</span>
                    </div>
                    <div className="flex-1 text-center text-slate-400 text-xs font-mono">─────────►</div>
                    <div className="w-52"></div>
                  </div>

                  {/* Lane 2: Chuyên môn */}
                  <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50/70 border border-dashed border-slate-300">
                    <span className="w-24 text-xs font-bold text-slate-600 shrink-0">Làn Chuyên môn</span>
                    <div className="w-52"></div>
                    <div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-900 text-xs text-center w-56 shadow-2xs ring-2 ring-amber-100">
                      <span className="font-mono text-[10px] block font-bold text-amber-700">STEP-KN-02</span>
                      <strong className="text-xs">Xác minh nội dung khiếu nại</strong>
                      <span className="text-[10.5px] block font-bold text-amber-800 mt-1">🟡 Đổi SLA: 30d → 20d</span>
                    </div>
                    <div className="flex-1 text-center text-slate-400 text-xs font-mono">─────────►</div>
                    <div className="w-52"></div>
                  </div>

                  {/* Lane 3: Lãnh đạo */}
                  <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50/70 border border-dashed border-slate-300">
                    <span className="w-24 text-xs font-bold text-slate-600 shrink-0">Làn Lãnh đạo</span>
                    <div className="w-52"></div>
                    <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900 text-xs text-center w-56 shadow-2xs ring-2 ring-emerald-100">
                      <span className="font-mono text-[10px] block font-bold text-emerald-700">STEP-KN-03</span>
                      <strong className="text-xs">Tổ chức đối thoại trực tiếp</strong>
                      <span className="text-[10.5px] block font-bold text-emerald-800 mt-1">🟢 Mới thêm (+3d SLA)</span>
                    </div>
                    <div className="flex-1 text-center text-slate-400 text-xs font-mono">─────────►</div>
                    <div className="p-3 rounded-xl bg-slate-100 border-2 border-slate-300 text-slate-700 text-xs text-center w-52 shadow-2xs">
                      <span className="font-mono text-[10px] block font-bold text-slate-500">STEP-KN-04</span>
                      <strong className="text-xs">Ban hành quyết định giải quyết</strong>
                      <span className="text-[10px] block text-slate-400 mt-1">⚪ Không thay đổi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Quy tắc: Hồ sơ cũ tiếp tục thụ lý theo {baseVer}; hồ sơ mới sẽ thụ lý theo {targetVer} sau ngày hiệu lực (BR-15).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}
