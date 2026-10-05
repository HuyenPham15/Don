import React from "react";

export default function BackgroundDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
      {/* ── 1. NỀN TOÀN CẢNH PHẢI (RIGHT PANEL BACKGROUND): #FFFFFF -> #F8FAFC ── */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 60%, #F1F5F9 100%)",
        }}
      />

      {/* Ánh sáng mềm mại phía sau thẻ Login bên phải */}
      <div className="hidden lg:block absolute top-[25%] right-[12%] w-[480px] h-[480px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />

      {/* ── 2. NỀN GRADIENT XANH GOVEX NỬA TRÁI (LEFT PANEL BLUE S-CURVE 58% DESKTOP) ── */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="hidden lg:block absolute inset-y-0 left-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient màu xanh GOVEX chuẩn:
              - Dark navy blue ở trên: #0F3B78
              - GOVEX blue ở giữa: #1557A6
              - Bright blue ở dưới: #1769E0
              - Subtle cyan glow: #16C7E8 / #25D6F2
          */}
          <linearGradient id="govexMainGrad" x1="100" y1="50" x2="620" y2="950" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F3B78" />
            <stop offset="35%" stopColor="#1557A6" />
            <stop offset="70%" stopColor="#1769E0" />
            <stop offset="100%" stopColor="#1D89F8" />
          </linearGradient>

          {/* Lớp bóng đổ mềm cho đường cong phân cách */}
          <filter id="waveShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="12" dy="0" stdDeviation="20" floodColor="#0F3B78" floodOpacity="0.14" />
          </filter>

          {/* Gradient viền phát sáng cyan dọc theo đường cong: #16C7E8, #25D6F2 */}
          <linearGradient id="edgeGlowGrad" x1="580" y1="0" x2="380" y2="1000" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#16C7E8" stopOpacity="0.5" />
            <stop offset="45%" stopColor="#25D6F2" stopOpacity="0.3" />
            <stop offset="80%" stopColor="#1769E0" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#16C7E8" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Khối nền xanh GOVEX chính chiếm 58% ở đỉnh, lượn mềm sang trái */}
        <path
          d="M 0 0 L 580 0 C 555 300, 465 650, 360 1000 L 0 1000 Z"
          fill="url(#govexMainGrad)"
          filter="url(#waveShadow)"
        />

        {/* Đường viền ánh sáng cyan chạy dọc mép cong */}
        <path
          d="M 580 0 C 555 300, 465 650, 360 1000"
          stroke="url(#edgeGlowGrad)"
          strokeWidth="2.5"
          fill="none"
        />
      </svg>

      {/* Fallback nền xanh mượt cho màn hình nhỏ / Mobile */}
      <div
        className="block lg:hidden absolute top-0 left-0 right-0 h-[340px]"
        style={{
          background: "linear-gradient(145deg, #0F3B78 0%, #1557A6 45%, #1769E0 100%)",
          borderBottomLeftRadius: "32px",
          borderBottomRightRadius: "32px",
        }}
      />

      {/* ── 3. HÌNH TÒA NHÀ HÀNH CHÍNH CỔ ĐIỂN MỜ (OPACITY 8-12% CHUẨN SECTION 5) ── */}
      <div
        className="absolute bottom-4 left-2 sm:left-6 lg:left-10 w-[380px] sm:w-[460px] lg:w-[480px] h-[250px] sm:h-[300px] pointer-events-none opacity-[0.09] mix-blend-screen"
        style={{
          maskImage: "radial-gradient(circle at 45% 65%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)",
          WebkitMaskImage: "radial-gradient(circle at 45% 65%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)",
        }}
      >
        <svg
          viewBox="0 0 700 440"
          className="w-full h-full text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Mái vòm trung tâm (Dome) */}
          <path d="M 310 90 C 310 40, 390 40, 390 90 Z" strokeWidth="1.6" fill="rgba(255,255,255,0.05)" />
          <line x1="350" y1="15" x2="350" y2="45" strokeWidth="2" />
          <polygon points="350,18 375,25 350,32" fill="rgba(255,255,255,0.4)" stroke="none" />
          <rect x="325" y="90" width="50" height="22" strokeWidth="1.4" />
          <line x1="337" y1="90" x2="337" y2="112" strokeWidth="1" />
          <line x1="363" y1="90" x2="363" y2="112" strokeWidth="1" />

          {/* Tam giác đầu hồi cổ điển (Neoclassical Pediment) */}
          <polygon points="350,115 220,165 480,165" strokeWidth="2.2" fill="rgba(255,255,255,0.06)" />
          <circle cx="350" cy="145" r="13" strokeWidth="1.4" />
          <line x1="220" y1="165" x2="480" y2="165" strokeWidth="2.5" />

          {/* Cột trụ Corinthian */}
          {[235, 268, 301, 334, 366, 399, 432, 465].map((x, idx) => (
            <g key={idx}>
              <line x1={x} y1="165" x2={x} y2="315" strokeWidth="3" />
              <line x1={x + 4} y1="168" x2={x + 4} y2="312" strokeWidth="0.8" strokeDasharray="3 3" />
              <rect x={x - 4} y="165" width="12" height="6" fill="rgba(255,255,255,0.3)" stroke="none" />
              <rect x={x - 4} y="310" width="12" height="6" fill="rgba(255,255,255,0.3)" stroke="none" />
            </g>
          ))}

          {/* Cửa vòm trung tâm */}
          <path d="M 325 315 L 325 240 C 325 215, 375 215, 375 240 L 375 315 Z" strokeWidth="2" fill="rgba(255,255,255,0.08)" />
          <path d="M 335 315 L 335 245 C 335 230, 365 230, 365 245 L 365 315 Z" strokeWidth="1" />

          {/* Cánh trái */}
          <rect x="70" y="185" width="150" height="130" strokeWidth="1.6" />
          <line x1="70" y1="245" x2="220" y2="245" strokeWidth="1" />
          {[95, 135, 175].map((x, i) => (
            <React.Fragment key={`left-${i}`}>
              <rect x={x} y="200" width="22" height="34" rx="2" strokeWidth="1.2" />
              <rect x={x} y="260" width="22" height="38" rx="2" strokeWidth="1.2" />
            </React.Fragment>
          ))}

          {/* Cánh phải */}
          <rect x="480" y="185" width="150" height="130" strokeWidth="1.6" />
          <line x1="480" y1="245" x2="630" y2="245" strokeWidth="1" />
          {[505, 545, 585].map((x, i) => (
            <React.Fragment key={`right-${i}`}>
              <rect x={x} y="200" width="22" height="34" rx="2" strokeWidth="1.2" />
              <rect x={x} y="260" width="22" height="38" rx="2" strokeWidth="1.2" />
            </React.Fragment>
          ))}

          {/* Bậc thang tam cấp */}
          {[315, 330, 345, 360, 375, 390, 405, 420].map((y, idx) => (
            <line
              key={`stair-${idx}`}
              x1={180 - idx * 16}
              y1={y}
              x2={520 + idx * 16}
              y2={y}
              strokeWidth="1.4"
              opacity={0.7 - idx * 0.07}
            />
          ))}
        </svg>
      </div>

      {/* ── 4. CÁC LỚP SÓNG LƯỢN MỀM CYAN PHÍA DƯỚI BÊN TRÁI ── */}
      <svg
        viewBox="0 0 1000 500"
        className="absolute bottom-0 left-0 w-[560px] sm:w-[650px] lg:w-[720px] h-[240px] sm:h-[280px] lg:h-[310px] pointer-events-none select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="softCyanWave1" x1="0" y1="200" x2="900" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#16C7E8" stopOpacity="0.75" />
            <stop offset="40%" stopColor="#25D6F2" stopOpacity="0.4" />
            <stop offset="75%" stopColor="#1769E0" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0F3B78" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="softCyanWave2" x1="0" y1="300" x2="950" y2="500" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#25D6F2" stopOpacity="0.65" />
            <stop offset="45%" stopColor="#16C7E8" stopOpacity="0.3" />
            <stop offset="85%" stopColor="#1557A6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0F3B78" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="waveGlow" cx="20%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#16C7E8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#16C7E8" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="400" r="300" fill="url(#waveGlow)" />
        <path
          d="M 0 340 C 180 260, 340 380, 580 320 C 740 280, 860 210, 1000 270 L 1000 500 L 0 500 Z"
          fill="url(#softCyanWave1)"
        />
        <path
          d="M 0 390 C 200 310, 400 410, 640 350 C 780 310, 880 330, 1000 380 L 1000 500 L 0 500 Z"
          fill="url(#softCyanWave2)"
        />
      </svg>
    </div>
  );
}
