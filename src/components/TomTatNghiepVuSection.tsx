import React from 'react';
import PanelSection from "./PanelSection";
import { SparkleIcon } from "./icons";

function TomTatNghiepVuSection({ checked, onToggle }: { checked: boolean; onToggle: (v: boolean) => void }) {
  return (
    <PanelSection index={3} title="Tóm tắt nghiệp vụ (AI tổng hợp)">
      <div className="rounded-xl border p-4 bg-white" style={{ borderColor: "#E5E7EB" }}>
        <p className="text-sm text-slate-800 leading-relaxed mb-4">
          Dựa trên nội dung đơn và quy định hiện hành, sự việc này có thể được xem xét theo thủ tục <strong>Khiếu nại hành chính</strong>. Tuy nhiên, qua đối chiếu cơ sở dữ liệu, phát hiện các vấn đề cần lưu ý sau:
        </p>
        
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-slate-700">Đủ điều kiện về thẩm quyền:</span>
              <p className="text-xs text-slate-600 mt-0.5">Nội dung khiếu nại thuộc thẩm quyền giải quyết của UBND tỉnh XYZ.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-slate-700">Dấu hiệu trùng lặp cao (89%):</span>
              <p className="text-xs text-slate-600 mt-0.5">Có 1 đơn khiếu nại đang được thụ lý với cùng người gửi, đối tượng bị khiếu nại và dự án Khu dân cư X.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-slate-700">Hồ sơ có thể thiếu thành phần:</span>
              <p className="text-xs text-slate-600 mt-0.5">Chưa thấy tài liệu chứng minh quyền sử dụng đất hợp pháp hoặc Quyết định thu hồi đất.</p>
            </div>
          </li>
        </ul>
      </div>
    </PanelSection>
  );
}
export default TomTatNghiepVuSection;
