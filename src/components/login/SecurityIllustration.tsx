import React from "react";

interface SecurityIllustrationProps {
  className?: string;
}

export default function SecurityIllustration({ className = "" }: SecurityIllustrationProps) {
  return (
    <div
      className={`relative w-full max-w-[500px] h-[310px] sm:h-[340px] lg:h-[360px] flex items-center justify-center select-none ${className}`}
      aria-hidden="true"
    >
      {/* ── 1. VÙNG PHÁT SÁNG NỀN CYAN & XANH GOVEX LAN TỎA MỀM MẠI ── */}
      <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[190px] bg-[#16C7E8]/16 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[270px] h-[150px] bg-[#1769E0]/22 rounded-full blur-2xl pointer-events-none" />

      {/* ── 2. SVG VECTOR ART: AI DOCUMENT WORKFLOW ILLUSTRATION (SECTION 4) ── */}
      <svg
        viewBox="0 0 500 370"
        className="w-full h-full drop-shadow-[0_10px_32px_rgba(22,199,232,0.28)] relative z-10 overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient phát sáng bệ sàn */}
          <radialGradient id="pedestalGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#16C7E8" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#1557A6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0F3B78" stopOpacity="0" />
          </radialGradient>

          {/* Gradient bề mặt đĩa bệ phóng (Top surface) */}
          <linearGradient id="pedestalTopGrad" x1="160" y1="260" x2="340" y2="310" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#104285" />
            <stop offset="50%" stopColor="#0D356D" />
            <stop offset="100%" stopColor="#082249" />
          </linearGradient>

          {/* Gradient viền phát sáng đĩa bệ */}
          <linearGradient id="pedestalRimGrad" x1="140" y1="275" x2="360" y2="275" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#16C7E8" stopOpacity="0.3" />
            <stop offset="25%" stopColor="#25D6F2" />
            <stop offset="50%" stopColor="#E0F7FA" />
            <stop offset="75%" stopColor="#25D6F2" />
            <stop offset="100%" stopColor="#16C7E8" stopOpacity="0.3" />
          </linearGradient>

          {/* Gradient mặt đĩa trong cùng */}
          <linearGradient id="innerDiscGrad" x1="180" y1="275" x2="320" y2="275" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1769E0" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#16C7E8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1769E0" stopOpacity="0.35" />
          </linearGradient>

          {/* Gradient thẻ kính mờ (Glassmorphism card) */}
          <linearGradient id="glassCardGrad" x1="0" y1="0" x2="100" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1557A6" stopOpacity="0.48" />
            <stop offset="50%" stopColor="#0F3B78" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#0A254D" stopOpacity="0.6" />
          </linearGradient>

          {/* Gradient viền thẻ kính mờ */}
          <linearGradient id="glassCardStroke" x1="0" y1="0" x2="100" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#25D6F2" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#16C7E8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1769E0" stopOpacity="0.6" />
          </linearGradient>

          {/* Gradient tờ đơn chính màu trắng tinh khôi */}
          <linearGradient id="mainDocGrad" x1="200" y1="130" x2="310" y2="295" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="75%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#F0F7FF" />
          </linearGradient>

          {/* Gradient nếp gấp góc tờ đơn chính */}
          <linearGradient id="mainFoldGrad" x1="275" y1="132" x2="305" y2="162" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="60%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Gradient nút huy hiệu kiểm tra (Checkmark badge) */}
          <linearGradient id="checkBadgeGrad" x1="270" y1="245" x2="300" y2="275" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1769E0" />
            <stop offset="100%" stopColor="#1557A6" />
          </linearGradient>

          {/* Gradient huy hiệu AI */}
          <linearGradient id="aiBadgeGrad" x1="335" y1="110" x2="375" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#16C7E8" />
            <stop offset="50%" stopColor="#1769E0" />
            <stop offset="100%" stopColor="#0F3B78" />
          </linearGradient>

          {/* Bộ lọc phát sáng cyan nhẹ */}
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Bộ lọc bóng đổ tờ đơn chính */}
          <filter id="docDropShadow" x="-15%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="-6" dy="12" stdDeviation="14" floodColor="#061B39" floodOpacity="0.45" />
          </filter>

          {/* Bộ lọc phát sáng hạt particle */}
          <filter id="particleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── A. BỆ NỀN CÔNG NGHỆ (CYBER PEDESTAL & GROUND RINGS) ── */}
        <ellipse cx="250" cy="285" rx="195" ry="62" fill="url(#pedestalGlowGrad)" />

        {/* Vòng nét đứt ngoài cùng */}
        <ellipse
          cx="250"
          cy="285"
          rx="175"
          ry="54"
          stroke="#16C7E8"
          strokeWidth="1.2"
          strokeDasharray="5 7"
          opacity="0.32"
          fill="none"
        />

        {/* Vòng nét mảnh số 2 */}
        <ellipse
          cx="250"
          cy="285"
          rx="145"
          ry="44"
          stroke="#25D6F2"
          strokeWidth="1"
          opacity="0.4"
          fill="none"
        />

        {/* Khối trụ 3D đĩa bệ phóng (Cylinder Side Extrusion) */}
        <path
          d="M 142 282 C 142 304, 358 304, 358 282 L 358 296 C 358 318, 142 318, 142 296 Z"
          fill="#082249"
          stroke="#16C7E8"
          strokeWidth="1.2"
          strokeOpacity="0.45"
        />

        {/* Mặt trên đĩa bệ phóng (Top Elliptical Surface) */}
        <ellipse
          cx="250"
          cy="282"
          rx="108"
          ry="32"
          fill="url(#pedestalTopGrad)"
          stroke="url(#pedestalRimGrad)"
          strokeWidth="2.2"
          filter="url(#cyanGlow)"
        />

        {/* Vòng ánh sáng bên trong mặt đĩa */}
        <ellipse
          cx="250"
          cy="282"
          rx="82"
          ry="23"
          fill="none"
          stroke="url(#innerDiscGrad)"
          strokeWidth="1.4"
          strokeDasharray="4 6"
          opacity="0.85"
        />

        {/* Lõi sáng tâm đĩa */}
        <ellipse cx="250" cy="282" rx="46" ry="13" fill="#16C7E8" fillOpacity="0.12" />

        {/* ── B. CÁC ĐƯỜNG QUỸ ĐẠO & ĐƯỜNG TRUYỀN DỮ LIỆU (ORBITAL DATA ARCS) ── */}
        {/* Đường quỹ đạo uốn lượn xung quanh hồ sơ */}
        <path
          d="M 85 240 C 110 150, 240 90, 385 130 C 445 150, 440 235, 380 275"
          stroke="#16C7E8"
          strokeWidth="1.4"
          strokeDasharray="4 6"
          opacity="0.7"
          fill="none"
        />

        {/* Vòng quỹ đạo thứ 2 phía dưới */}
        <path
          d="M 145 305 C 245 340, 405 305, 425 220"
          stroke="#25D6F2"
          strokeWidth="1.1"
          strokeDasharray="3 5"
          opacity="0.55"
          fill="none"
        />

        {/* ── C. CÁC THẺ KÍNH MỜ XUNG QUANH (WORKFLOW + SENDER + STATUS) ── */}
        {/* 1. THẺ PHÍA SAU TRUNG TÂM (TALL WORKFLOW / PROCESS CARD) */}
        <g transform="translate(205, 95)">
          <rect
            width="105"
            height="150"
            rx="10"
            fill="url(#glassCardGrad)"
            stroke="url(#glassCardStroke)"
            strokeWidth="1.2"
          />
          {/* Header 3 chấm cửa sổ */}
          <circle cx="14" cy="14" r="2" fill="#25D6F2" opacity="0.8" />
          <circle cx="21" cy="14" r="2" fill="#38BDF8" opacity="0.6" />
          <circle cx="28" cy="14" r="2" fill="#93C5FD" opacity="0.5" />

          {/* Tag quy trình nhỏ */}
          <rect x="42" y="10" width="48" height="8" rx="4" fill="#16C7E8" fillOpacity="0.15" stroke="#16C7E8" strokeWidth="0.8" strokeOpacity="0.5" />
          <rect x="48" y="13" width="36" height="2" rx="1" fill="#E0F2FE" opacity="0.8" />

          {/* Các vạch dữ liệu */}
          <rect x="14" y="28" width="55" height="4" rx="2" fill="#E0F2FE" opacity="0.4" />
          <rect x="14" y="38" width="75" height="3" rx="1.5" fill="#BAE6FD" opacity="0.3" />
          <rect x="14" y="47" width="65" height="3" rx="1.5" fill="#BAE6FD" opacity="0.25" />
          <rect x="14" y="56" width="70" height="3" rx="1.5" fill="#7DD3FC" opacity="0.2" />
        </g>

        {/* 2. THẺ BÊN TRÁI - HỒ SƠ NGƯỜI GỬI (SENDER PROFILE CARD) */}
        <g transform="translate(132, 138) rotate(-4 50 60)">
          <rect
            width="96"
            height="120"
            rx="10"
            fill="url(#glassCardGrad)"
            stroke="url(#glassCardStroke)"
            strokeWidth="1.4"
            filter="url(#cyanGlow)"
          />
          {/* 3 chấm header */}
          <circle cx="14" cy="14" r="2.2" fill="#16C7E8" />
          <circle cx="21" cy="14" r="2" fill="#25D6F2" opacity="0.75" />
          <circle cx="28" cy="14" r="2" fill="#93C5FD" opacity="0.6" />

          {/* Vòng tròn Avatar người gửi */}
          <circle cx="34" cy="46" r="16" fill="#1557A6" fillOpacity="0.45" stroke="#16C7E8" strokeWidth="1.2" />
          {/* Hình đầu silhouette tối giản */}
          <circle cx="34" cy="41" r="5" fill="#FFFFFF" opacity="0.9" />
          {/* Vai silhouette tối giản */}
          <path
            d="M 24 56 C 24 50, 44 50, 44 56 Z"
            fill="#FFFFFF"
            opacity="0.85"
          />

          {/* Các vạch thông tin bên cạnh Avatar */}
          <rect x="58" y="36" width="28" height="3" rx="1.5" fill="#E0F2FE" opacity="0.8" />
          <rect x="58" y="44" width="22" height="2.5" rx="1.25" fill="#BAE6FD" opacity="0.6" />
          <rect x="58" y="51" width="26" height="2.5" rx="1.25" fill="#7DD3FC" opacity="0.5" />

          {/* Dòng dữ liệu bên dưới */}
          <rect x="14" y="74" width="68" height="3" rx="1.5" fill="#E0F2FE" opacity="0.5" />
          <rect x="14" y="83" width="56" height="2.5" rx="1.25" fill="#BAE6FD" opacity="0.4" />
          <rect x="14" y="92" width="62" height="2.5" rx="1.25" fill="#7DD3FC" opacity="0.3" />
        </g>

        {/* 3. THẺ GÓC DƯỚI BÊN TRÁI - TRẠNG THÁI / CHECKLIST (STATUS & AUDIT CARD) */}
        <g transform="translate(108, 218) rotate(-7 45 35)">
          <rect
            width="82"
            height="65"
            rx="8"
            fill="url(#glassCardGrad)"
            stroke="url(#glassCardStroke)"
            strokeWidth="1.2"
          />
          {/* 3 dòng checklist có icon chấm tròn */}
          <circle cx="16" cy="18" r="3" fill="#16C7E8" />
          <rect x="25" y="16.5" width="44" height="3" rx="1.5" fill="#FFFFFF" opacity="0.75" />

          <circle cx="16" cy="32" r="3" fill="#25D6F2" />
          <rect x="25" y="30.5" width="38" height="3" rx="1.5" fill="#BAE6FD" opacity="0.65" />

          <circle cx="16" cy="46" r="3" fill="#93C5FD" opacity="0.6" />
          <rect x="25" y="44.5" width="48" height="3" rx="1.5" fill="#7DD3FC" opacity="0.5" />
        </g>

        {/* 4. THẺ BÊN PHẢI - VĂN BẢN / THÔNG ĐIỆP ĐƠN (MESSAGE ENVELOPE CARD) */}
        <g transform="translate(305, 170) rotate(5 50 60)">
          <rect
            width="98"
            height="118"
            rx="10"
            fill="url(#glassCardGrad)"
            stroke="url(#glassCardStroke)"
            strokeWidth="1.3"
            filter="url(#cyanGlow)"
          />
          {/* 3 chấm header */}
          <circle cx="14" cy="14" r="2.2" fill="#16C7E8" />
          <circle cx="21" cy="14" r="2" fill="#25D6F2" opacity="0.75" />
          <circle cx="28" cy="14" r="2" fill="#93C5FD" opacity="0.6" />

          {/* Biểu tượng phong bì thư / văn bản số (Envelope Icon) */}
          <g transform="translate(32, 36)">
            <rect
              width="34"
              height="24"
              rx="4"
              fill="#1557A6"
              fillOpacity="0.35"
              stroke="#16C7E8"
              strokeWidth="1.4"
            />
            {/* Nắp phong bì gấp */}
            <path
              d="M 1 2 L 17 14 L 33 2"
              fill="none"
              stroke="#25D6F2"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Các vạch thông tin dưới phong bì */}
          <rect x="16" y="74" width="66" height="3" rx="1.5" fill="#E0F2FE" opacity="0.75" />
          <rect x="16" y="83" width="52" height="2.5" rx="1.25" fill="#BAE6FD" opacity="0.55" />
          <rect x="16" y="92" width="58" height="2.5" rx="1.25" fill="#7DD3FC" opacity="0.4" />
        </g>

        {/* ── D. TỜ ĐƠN / HỒ SƠ CHÍNH Ở TRUNG TÂM (MAIN "ĐƠN / HỒ SƠ" DOCUMENT) ── */}
        <g filter="url(#docDropShadow)">
          {/* Thân tờ đơn chính màu trắng với nếp gấp góc trên bên phải */}
          <path
            d="M 202 132 H 278 L 306 160 V 284 C 306 290.6 300.6 296 294 296 H 202 C 195.4 296 190 290.6 190 284 V 144 C 190 137.4 195.4 132 202 132 Z"
            fill="url(#mainDocGrad)"
            stroke="#BAE6FD"
            strokeWidth="1.5"
          />

          {/* Nếp gấp 3D tinh tế góc trên phải (Folded Flap) */}
          <path
            d="M 278 132 V 150 C 278 155.5 282.5 160 288 160 H 306 Z"
            fill="url(#mainFoldGrad)"
            stroke="#38BDF8"
            strokeWidth="1.2"
          />

          {/* ── NỘI DUNG VĂN BẢN TRÊN TỜ ĐƠN CHÍNH ("ĐƠN / HỒ SƠ") ── */}
          {/* Tag nhận diện nhỏ gọn: XÁC THỰC TẬP TRUNG */}
          <g transform="translate(204, 144)">
            <rect width="68" height="11" rx="5.5" fill="#1557A6" fillOpacity="0.12" stroke="#1557A6" strokeWidth="0.8" strokeOpacity="0.4" />
            <text x="34" y="7.8" textAnchor="middle" fill="#0F3B78" fontSize="5.2" fontWeight="700" letterSpacing="0.2px" fontFamily="sans-serif">
              XÁC THỰC TẬP TRUNG
            </text>
          </g>

          {/* Thanh tiêu đề đậm màu xanh GOVEX */}
          <rect x="206" y="160" width="50" height="4.5" rx="2.25" fill="#1557A6" />

          {/* Các dòng nội dung văn bản (Horizontal simulated data bars) */}
          <rect x="206" y="172" width="76" height="3.5" rx="1.75" fill="#1769E0" fillOpacity="0.85" />
          <rect x="206" y="181" width="86" height="3" rx="1.5" fill="#38BDF8" fillOpacity="0.8" />
          <rect x="206" y="190" width="80" height="3" rx="1.5" fill="#38BDF8" fillOpacity="0.7" />
          <rect x="206" y="199" width="74" height="3" rx="1.5" fill="#7DD3FC" fillOpacity="0.65" />
          <rect x="206" y="208" width="54" height="3" rx="1.5" fill="#BAE6FD" fillOpacity="0.8" />
          <rect x="206" y="220" width="40" height="2.5" rx="1.25" fill="#1557A6" fillOpacity="0.35" />

          {/* ── NÚT TRÒN XANH CÓ DẤU KIỂM XÁC THỰC (CHECKMARK BADGE) ── */}
          <g transform="translate(280, 264)">
            {/* Vòng hào quang phát sáng */}
            <circle cx="0" cy="0" r="16" fill="url(#checkBadgeGrad)" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Dấu kiểm trắng (White Checkmark) */}
            <path
              d="M -5.5 0.5 L -1.5 4.5 L 6.5 -3.5"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* ── E. HUY HIỆU AI PHÁT SÁNG NỔI BẬT (FLOATING "AI" BADGE) ── */}
        <g transform="translate(348, 122)" filter="url(#cyanGlow)">
          {/* Thẻ bo tròn AI với viền phát sáng rực rỡ */}
          <rect
            width="42"
            height="38"
            rx="11"
            fill="url(#aiBadgeGrad)"
            stroke="#25D6F2"
            strokeWidth="1.8"
          />
          {/* Chữ "AI" in đậm màu trắng */}
          <text
            x="21"
            y="25"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="15"
            fontWeight="800"
            fontFamily="Inter, system-ui, sans-serif"
            letterSpacing="0.5px"
          >
            AI
          </text>
        </g>

        {/* ── F. KHỐI LẬP PHƯƠNG ISOMETRIC LƠ LỬNG (FLOATING TECH CUBE) ── */}
        <g transform="translate(108, 168)" opacity="0.85">
          <polygon
            points="12,0 24,6 12,12 0,6"
            fill="#38BDF8"
            fillOpacity="0.75"
            stroke="#25D6F2"
            strokeWidth="0.8"
          />
          <polygon
            points="0,6 12,12 12,24 0,18"
            fill="#0284C7"
            fillOpacity="0.65"
            stroke="#38BDF8"
            strokeWidth="0.8"
          />
          <polygon
            points="12,12 24,6 24,18 12,24"
            fill="#1557A6"
            fillOpacity="0.7"
            stroke="#16C7E8"
            strokeWidth="0.8"
          />
        </g>

        {/* ── G. CÁC HẠT DATA PARTICLES PHÁT SÁNG TRÊN ĐƯỜNG QUỸ ĐẠO ── */}
        <circle cx="186" cy="128" r="3.2" fill="#FFFFFF" filter="url(#particleGlow)" />
        <circle cx="376" cy="138" r="3" fill="#25D6F2" filter="url(#particleGlow)" />
        <circle cx="426" cy="216" r="2.8" fill="#16C7E8" filter="url(#particleGlow)" />
        <circle cx="102" cy="226" r="2.8" fill="#25D6F2" filter="url(#particleGlow)" />
        <circle cx="282" cy="324" r="2.2" fill="#16C7E8" />
        <circle cx="340" cy="290" r="1.8" fill="#FFFFFF" opacity="0.85" />
        <circle cx="160" cy="275" r="1.8" fill="#25D6F2" opacity="0.8" />
      </svg>
    </div>
  );
}
