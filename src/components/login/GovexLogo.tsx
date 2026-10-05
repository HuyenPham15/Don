import React from "react";

interface GovexLogoProps {
  theme?: "light" | "dark";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function GovexLogo({
  theme = "light",
  className = "",
  size = "md",
}: GovexLogoProps) {
  const isDark = theme === "dark";
  const primaryColor = isDark ? "#FFFFFF" : "#0A2540";
  const cyanColor = "#00D2EE";
  const cyanLight = "#46E5F8";

  const sizeClasses = {
    sm: "w-[72px] h-[38px]",
    md: "w-[84px] h-[44px]",
    lg: "w-[100px] h-[52px]",
  }[size];

  const textClasses = {
    sm: "text-[11px] tracking-[0.28em]",
    md: "text-[12.5px] tracking-[0.3em]",
    lg: "text-[15px] tracking-[0.32em]",
  }[size];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 120 64"
        className={`${sizeClasses} transition-transform duration-200`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Nét vòng chữ G bên trái (bo tròn phong cách hiện đại) */}
        <path
          d="M 44 14 C 26 14 14 24 14 38 C 14 52 26 60 44 60 C 54 60 62 55 67 47 L 56 47 C 53 50 49 52 44 52 C 32 52 24 44 24 38 C 24 31 32 22 44 22 C 51 22 56 25 60 30 L 69 24 C 63 17 55 14 44 14 Z"
          fill={primaryColor}
        />

        {/* Nét chéo liên kết của chữ X */}
        <path
          d="M 49 32 L 67 60 L 58 60 L 42 35 Z"
          fill={primaryColor}
        />

        {/* 3 sọc tốc độ Cyan đặc trưng bên phải của GOVEX */}
        {/* Sọc trên */}
        <path
          d="M 64 16 L 87 16 C 89 16 90.5 17.5 90 19.5 L 88.5 23 L 67 23 Z"
          fill={cyanLight}
        />
        {/* Sọc giữa (dài nhất) */}
        <path
          d="M 70 27 L 94 27 C 96 27 97.5 28.5 97 30.5 L 95.5 34 L 73 34 Z"
          fill={cyanColor}
        />
        {/* Sọc dưới */}
        <path
          d="M 66 38 L 86 38 C 88 38 89.2 39.5 88.7 41.5 L 87.5 45 L 68 45 Z"
          fill={cyanLight}
        />
      </svg>

      {/* Tên thương hiệu GOVEX */}
      <span
        className={`font-black uppercase mt-1 leading-none font-sans text-center ${textClasses}`}
        style={{ color: primaryColor }}
      >
        GOVEX
      </span>
    </div>
  );
}

