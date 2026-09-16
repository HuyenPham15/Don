import React, { useState } from 'react';

const IconZoomIn = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconZoomOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconFit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v6h6M20 10V4h-6M4 10V4h6M20 14v6h-6"></path></svg>;
const IconInfo = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;

export default function TabMoiLienHe() {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  // Coordinates for nodes (center left/right for bezier)
  const rootNode = { x: 100, y: 250, width: 280, height: 80 };
  const n1 = { x: 500, y: 100, width: 260, height: 70 }; // Đơn liên quan
  const n2 = { x: 500, y: 250, width: 220, height: 70 }; // Người tổ chức
  const n3 = { x: 800, y: 250, width: 280, height: 130 }; // Lê Văn Hùng
  const n4 = { x: 500, y: 410, width: 280, height: 110 }; // Tài liệu

  const generateBezier = (x1: number, y1: number, x2: number, y2: number) => {
    const cx1 = x1 + (x2 - x1) / 2;
    const cy1 = y1;
    const cx2 = cx1;
    const cy2 = y2;
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  return (
    <div className="w-full h-[600px] bg-white rounded-xl border shadow-sm relative overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
      
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-col bg-white border rounded-lg shadow-sm" style={{ borderColor: "#E2E8F0" }}>
        <button className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-b transition-colors" onClick={() => setScale(s => Math.min(s + 0.1, 2))}><IconZoomIn /></button>
        <button className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-b transition-colors" onClick={() => setScale(s => Math.max(s - 0.1, 0.5))}><IconZoomOut /></button>
        <button className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors" onClick={() => { setScale(1); setPosition({x:0, y:0}) }}><IconFit /></button>
      </div>

      {/* Workspace Area */}
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          background: "radial-gradient(#E2E8F0 1.5px, transparent 1.5px)", 
          backgroundSize: "24px 24px",
          backgroundPosition: `${position.x}px ${position.y}px`
        }}
      >
        <div 
          className="w-full h-full origin-top-left transition-transform duration-75"
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
        >
          {/* SVGs for connecting lines */}
          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0">
            {/* Root to Đơn liên quan */}
            <path d={generateBezier(rootNode.x + rootNode.width, rootNode.y + rootNode.height/2, n1.x, n1.y + n1.height/2)} fill="none" stroke="#C084FC" strokeWidth="2" strokeDasharray="5,5" />
            
            {/* Root to Người tổ chức */}
            <path d={generateBezier(rootNode.x + rootNode.width, rootNode.y + rootNode.height/2, n2.x, n2.y + n2.height/2)} fill="none" stroke="#94A3B8" strokeWidth="2" />
            
            {/* Người tổ chức to Lê Văn Hùng */}
            <path d={generateBezier(n2.x + n2.width, n2.y + n2.height/2, n3.x, n3.y + n3.height/2)} fill="none" stroke="#10B981" strokeWidth="2" />
            
            {/* Root to Tài liệu */}
            <path d={generateBezier(rootNode.x + rootNode.width, rootNode.y + rootNode.height/2, n4.x, n4.y + n4.height/2)} fill="none" stroke="#60A5FA" strokeWidth="2" strokeDasharray="5,5" />
          </svg>

          {/* Root Node */}
          <div 
            className="absolute bg-white rounded-xl border-2 flex flex-col justify-center items-center p-4 z-10 shadow-sm"
            style={{ left: rootNode.x, top: rootNode.y, width: rootNode.width, height: rootNode.height, borderColor: "#FDA4AF" }}
          >
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            
            <div className="font-bold text-slate-800 text-sm">Đơn lượt nhận LN-45/2026-GOVEX</div>
            <div className="text-xs text-slate-500 mt-1">DS-49/2026-GOVEX (DS-39)</div>
          </div>

          {/* Đơn liên quan */}
          <div 
            className="absolute rounded-xl border p-4 z-10 shadow-sm"
            style={{ left: n1.x, top: n1.y, width: n1.width, height: n1.height, borderColor: "#E9D5FF", backgroundColor: "#FAF5FF" }}
          >
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            
            <div className="flex items-center gap-1.5 font-bold text-purple-700 text-[13px]">
              <div className="w-2 h-2 rounded-full bg-purple-600"></div>
              Đơn liên quan
            </div>
            <div className="text-[12px] text-slate-700 font-medium mt-1">DS-22/2025-GOVEX</div>
            <div className="text-[11px] text-slate-500">Khiếu nại đợt 1 cùng thửa đất</div>
          </div>

          {/* Người, tổ chức */}
          <div 
            className="absolute bg-white rounded-xl border p-3 flex flex-col justify-center items-center z-10 shadow-sm"
            style={{ left: n2.x, top: n2.y, width: n2.width, height: n2.height, borderColor: "#34D399" }}
          >
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            
            <div className="font-bold text-slate-800 text-sm">Người, tổ chức</div>
            <div className="text-[11px] text-slate-500 mt-0.5">1 thành phần</div>
          </div>

          {/* Lê Văn Hùng */}
          <div 
            className="absolute bg-white rounded-xl border-2 z-10 shadow-sm flex flex-col overflow-hidden"
            style={{ left: n3.x, top: n3.y, width: n3.width, height: n3.height, borderColor: "#22C55E" }}
          >
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-700 z-20"></div>
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-700 z-20"></div>
            
            <div className="flex-1 flex flex-col items-center justify-center pt-4 pb-2 px-4">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center mb-2">LVH</div>
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-base">
                Lê Văn Hùng <span className="text-green-600"><IconInfo /></span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Người nộp đơn chính chủ</div>
            </div>
            
            <div className="bg-green-50 border-t border-green-100 py-1.5 text-center cursor-pointer hover:bg-green-100 transition-colors">
              <div className="text-[11px] font-bold text-green-600 flex justify-center items-center gap-1">
                <IconInfo /> Bấm để xem chi tiết
              </div>
            </div>
          </div>

          {/* Tài liệu đã nộp */}
          <div 
            className="absolute rounded-xl border p-4 z-10 shadow-sm"
            style={{ left: n4.x, top: n4.y, width: n4.width, height: n4.height, borderColor: "#BFDBFE", backgroundColor: "#EFF6FF" }}
          >
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            
            <div className="flex items-center gap-1.5 font-bold text-blue-700 text-[13px] mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              Tài liệu đã nộp (3)
            </div>
            <ul className="text-[11px] text-slate-700 space-y-1.5 list-disc pl-4 marker:text-slate-400">
              <li>Bản gốc Đơn khiếu nại</li>
              <li>Giấy chứng nhận QSDĐ (sao y)</li>
              <li>Quyết định bồi thường số 1422</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
