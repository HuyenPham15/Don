import React, { useState } from 'react';
import { DonDetail } from '../../types';

interface TabMoiLienHeProps {
  currentDon?: DonDetail | null;
}

const IconZoomIn = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconZoomOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconFit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v6h6M20 10V4h-6M4 10V4h6M20 14v6h-6"></path></svg>;
const IconInfo = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;

export default function TabMoiLienHe({ currentDon }: TabMoiLienHeProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const isToGiac =
    currentDon?.code?.startsWith('Đ-2026') ||
    currentDon?.nguoiNop === 'Nguyễn Văn A' ||
    currentDon?.title?.includes('tố giác');

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Node coordinates
  const rootNode = { x: 80, y: 240, width: 300, height: 90 };
  const n1 = { x: 520, y: 80, width: 290, height: 90 }; // Đơn liên quan
  const n2 = { x: 520, y: 240, width: 230, height: 75 }; // Tổ chức / Đối tượng
  const n3 = { x: 840, y: 220, width: 310, height: 140 }; // Người nộp đơn
  const n4 = { x: 520, y: 400, width: 310, height: 130 }; // Tài liệu chứng cứ
  const n5 = { x: 840, y: 80, width: 310, height: 90 }; // Cơ quan thụ lý

  const generateBezier = (x1: number, y1: number, x2: number, y2: number) => {
    const cx1 = x1 + (x2 - x1) / 2;
    const cy1 = y1;
    const cx2 = cx1;
    const cy2 = y2;
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  return (
    <div className="w-full h-[620px] bg-white rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden select-none">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-col bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <button
          className="p-2.5 text-slate-600 hover:text-[#004ac6] hover:bg-slate-50 border-b border-slate-100 transition-colors cursor-pointer"
          onClick={() => setScale((s) => Math.min(s + 0.15, 2))}
          title="Phóng to"
        >
          <IconZoomIn />
        </button>
        <button
          className="p-2.5 text-slate-600 hover:text-[#004ac6] hover:bg-slate-50 border-b border-slate-100 transition-colors cursor-pointer"
          onClick={() => setScale((s) => Math.max(s - 0.15, 0.5))}
          title="Thu nhỏ"
        >
          <IconZoomOut />
        </button>
        <button
          className="p-2.5 text-slate-600 hover:text-[#004ac6] hover:bg-slate-50 transition-colors cursor-pointer"
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          title="Căn vừa màn hình"
        >
          <IconFit />
        </button>
      </div>

      {/* Legend Top Right */}
      <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-xs text-xs space-y-1.5 font-medium">
        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
          Chú thích phân loại thực thể:
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-blue-500"></span>
          <span className="text-slate-600">Hồ sơ đơn thư gốc</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
          <span className="text-slate-600">Đương sự / Người nộp</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-purple-500"></span>
          <span className="text-slate-600">Hồ sơ liên quan / Ghép đơn</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-amber-500"></span>
          <span className="text-slate-600">Đối tượng bị tố giác / khiếu nại</span>
        </div>
      </div>

      {/* Workspace Area */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          background: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          backgroundPosition: `${position.x}px ${position.y}px`,
        }}
      >
        <div
          className="w-full h-full origin-top-left transition-transform duration-75"
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
        >
          {/* SVGs for connecting lines */}
          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0">
            {/* Root to Đơn liên quan */}
            <path
              d={generateBezier(
                rootNode.x + rootNode.width,
                rootNode.y + rootNode.height / 2,
                n1.x,
                n1.y + n1.height / 2
              )}
              fill="none"
              stroke="#A855F7"
              strokeWidth="2.5"
              strokeDasharray="6,4"
            />

            {/* Đơn liên quan to Cơ quan thụ lý */}
            <path
              d={generateBezier(n1.x + n1.width, n1.y + n1.height / 2, n5.x, n5.y + n5.height / 2)}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
            />

            {/* Root to Người tổ chức / Bên bị tố giác */}
            <path
              d={generateBezier(
                rootNode.x + rootNode.width,
                rootNode.y + rootNode.height / 2,
                n2.x,
                n2.y + n2.height / 2
              )}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
            />

            {/* Người tổ chức to Người nộp đơn */}
            <path
              d={generateBezier(n2.x + n2.width, n2.y + n2.height / 2, n3.x, n3.y + n3.height / 2)}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
            />

            {/* Root to Tài liệu */}
            <path
              d={generateBezier(
                rootNode.x + rootNode.width,
                rootNode.y + rootNode.height / 2,
                n4.x,
                n4.y + n4.height / 2
              )}
              fill="none"
              stroke="#0284C7"
              strokeWidth="2.5"
              strokeDasharray="6,4"
            />
          </svg>

          {/* Root Node: Hồ sơ đơn gốc */}
          <div
            className="absolute bg-white rounded-xl border-2 flex flex-col justify-center items-center p-4 z-10 shadow-md"
            style={{
              left: rootNode.x,
              top: rootNode.y,
              width: rootNode.width,
              height: rootNode.height,
              borderColor: '#004ac6',
            }}
          >
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#004ac6]"></div>
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#004ac6]"></div>

            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#004ac6] text-[10px] font-bold uppercase mb-1">
              HỒ SƠ TIẾP NHẬN GỐC
            </span>
            <div className="font-bold text-slate-900 text-[13px] text-center">
              {currentDon?.code || (isToGiac ? 'Đ-2026-00125' : 'DS-39/2026-GOVEX')}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Lượt nhận: {currentDon?.luotNhanId || (isToGiac ? 'LN-2025-0819' : 'LN-45/2026-GOVEX')}
            </div>
          </div>

          {/* Node 1: Đơn liên quan / Đơn ghép */}
          <div
            className="absolute rounded-xl border p-4 z-10 shadow-sm bg-purple-50/70 border-purple-200 flex flex-col justify-center"
            style={{ left: n1.x, top: n1.y, width: n1.width, height: n1.height }}
          >
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-600"></div>
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-600"></div>

            <div className="flex items-center gap-1.5 font-bold text-purple-800 text-[12.5px]">
              <span className="material-symbols-outlined text-[16px]">hub</span>
              <span>Đơn liên quan / Ghép (2 đơn)</span>
            </div>
            <div className="text-[11.5px] text-slate-800 font-semibold mt-1">
              {isToGiac ? 'Đ-2026-00098 (88%) • Đ-2026-00104 (76%)' : 'Đ-2026-00042 (92%) • Đ-2026-00055 (81%)'}
            </div>
            <div className="text-[10.5px] text-slate-500">
              {isToGiac ? 'Cùng tố giác hành vi chiếm giữ tiền CTCP X' : 'Cùng khiếu nại đền bù đất dự án QL1A'}
            </div>
          </div>

          {/* Node 5: Cơ quan giải quyết / Thụ lý */}
          <div
            className="absolute bg-white rounded-xl border border-blue-300 p-3.5 z-10 shadow-sm flex flex-col justify-center"
            style={{ left: n5.x, top: n5.y, width: n5.width, height: n5.height }}
          >
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <div className="flex items-center gap-1.5 font-bold text-blue-800 text-[12.5px]">
              <span className="material-symbols-outlined text-[16px]">account_balance</span>
              <span>Cơ quan thụ lý chính</span>
            </div>
            <div className="text-[12px] font-semibold text-slate-900 mt-1">
              {isToGiac ? 'Phòng Cảnh sát kinh tế (PC03) - CATP Hà Nội' : 'Sở Tài nguyên & Môi trường TP. Cần Thơ'}
            </div>
            <div className="text-[10.5px] text-slate-500">Đầu mối giải quyết tập trung</div>
          </div>

          {/* Node 2: Bên bị tố giác / Cơ quan ban hành */}
          <div
            className="absolute bg-white rounded-xl border border-amber-300 p-3.5 flex flex-col justify-center items-start z-10 shadow-sm"
            style={{ left: n2.x, top: n2.y, width: n2.width, height: n2.height }}
          >
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-600"></div>
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-600"></div>

            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[10px] font-bold mb-0.5">
              {isToGiac ? 'ĐỐI TƯỢNG BỊ TỐ GIÁC' : 'BÊN BỊ KHIẾU NẠI'}
            </span>
            <div className="font-bold text-slate-900 text-xs truncate w-full">
              {isToGiac ? 'Công ty CP Đầu tư X' : 'HĐ Bồi thường QL1A'}
            </div>
            <div className="text-[10.5px] text-slate-500">
              {isToGiac ? 'Ông Trần Văn B (Tổng Giám đốc)' : 'Đại diện: Ban QLDA Giao thông'}
            </div>
          </div>

          {/* Node 3: Người nộp đơn / Đương sự chính */}
          <div
            className="absolute bg-white rounded-xl border-2 z-10 shadow-md flex flex-col overflow-hidden"
            style={{ left: n3.x, top: n3.y, width: n3.width, height: n3.height, borderColor: '#10B981' }}
          >
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-600 z-20"></div>

            <div className="flex-1 flex flex-col justify-center pt-3 pb-2 px-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  {isToGiac ? 'NVA' : 'LVH'}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {isToGiac ? 'Nguyễn Văn A' : 'Lê Văn Hùng'}
                  </div>
                  <span className="text-[10.5px] text-emerald-700 font-semibold">Đã xác thực </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                <div>CCCD: <span className="font-mono">{isToGiac ? '001088019482' : '081089002891'}</span></div>
                <div>SĐT: <span className="font-mono">{isToGiac ? '0912 345 678' : '0983 847 291'}</span></div>
              </div>
            </div>

            <div className="bg-emerald-50 border-t border-emerald-100 py-1.5 px-4 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
              <span>Đương sự chính đứng đơn</span>
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
            </div>
          </div>

          {/* Node 4: Tài liệu chứng cứ đã nộp */}
          <div
            className="absolute rounded-xl border p-4 z-10 shadow-sm bg-sky-50/70 border-sky-200"
            style={{ left: n4.x, top: n4.y, width: n4.width, height: n4.height }}
          >
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-sky-600"></div>

            <div className="flex items-center gap-1.5 font-bold text-sky-800 text-[12.5px] mb-2">
              <span className="material-symbols-outlined text-[16px]">folder_shared</span>
              <span>Tài liệu &amp; Chứng cứ đính kèm (5 tệp)</span>
            </div>
            <ul className="text-[11.5px] text-slate-700 space-y-1 list-disc pl-4 marker:text-sky-500">
              {isToGiac ? (
                <>
                  <li>Đơn tố giác tội phạm gốc (Có chữ ký tươi)</li>
                  <li>Hợp đồng góp vốn đầu tư số 88/2024</li>
                  <li>Sao kê ngân hàng VCB nộp tiền 3.5 tỷ VNĐ</li>
                  <li>CCCD bản công chứng điện tử VNeID</li>
                </>
              ) : (
                <>
                  <li>Bản gốc Đơn khiếu nại đền bù đất</li>
                  <li>Giấy chứng nhận QSDĐ Thửa 45 Tờ 12</li>
                  <li>Quyết định thu hồi đất số 1422/QĐ-UBND</li>
                  <li>Biên bản hiệp thương giá bồi thường</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
