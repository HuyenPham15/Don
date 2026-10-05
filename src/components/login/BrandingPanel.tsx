import React from "react";
import GovexLogo from "./GovexLogo";
import SecurityIllustration from "./SecurityIllustration";
import { FileText, Sparkles, Workflow, ShieldCheck } from "lucide-react";

interface BrandingPanelProps {
  className?: string;
}

export default function BrandingPanel({ className = "" }: BrandingPanelProps) {
  return (
    <div
      className={`hidden md:flex w-full md:w-[50%] lg:w-[58%] flex-col justify-between pt-8 sm:pt-12 lg:pt-16 xl:pt-20 pb-8 sm:pb-10 px-6 sm:px-10 lg:px-14 xl:px-18 text-white z-10 select-none ${className}`}
    >
      {/* ── TOP SECTION: LOGO + HEADING + SUBTITLE + 4 FEATURE HIGHLIGHTS (SECTION 2 & 3) ── */}
      <div className="flex flex-col items-start text-left max-w-2xl">
        {/* GOVEX Logo ở góc trên bên trái */}
        <div className="flex items-start mb-5 sm:mb-6 lg:mb-7">
          <GovexLogo theme="dark" size="md" className="items-start" />
        </div>

        {/* Tiêu đề chính: HỆ THỐNG QUẢN LÝ ĐƠN (Font Bold, 30–36px, White) */}
        <h1 className="text-[26px] sm:text-[30px] lg:text-[34px] xl:text-[36px] font-bold tracking-tight text-white leading-tight font-sans">
          HỆ THỐNG XÁC THỰC TẬP TRUNG
        </h1>

        {/* Phụ đề bên dưới tiêu đề chính */}
        <p className="text-[14px] sm:text-[15px] lg:text-[16px] text-white/80 font-normal mt-2 leading-relaxed">
          Nền tảng tiếp nhận và xử lý đơn
        </p>

        {/* ── 3. FEATURE HIGHLIGHTS: 4 FEATURE NHỎ THEO HORIZONTAL LAYOUT ── */}
        <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 xl:gap-7 mt-5 sm:mt-6 pt-0.5">
          {/* Feature 1: Tiếp nhận đơn nhanh chóng */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#16C7E8]/10 border border-[#16C7E8]/25 flex items-center justify-center shrink-0 backdrop-blur-xs text-[#16C7E8]">
              <FileText className="w-4 h-4 text-[#16C7E8]" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[12px] lg:text-[12.5px] font-semibold text-white leading-tight">Xác thực</span>
              <span className="text-[11px] lg:text-[11.5px] text-white/80 leading-tight mt-0.5">nhanh chóng</span>
            </div>
          </div>

          {/* Feature 2: Ứng dụng AI thông minh */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#16C7E8]/10 border border-[#16C7E8]/25 flex items-center justify-center shrink-0 backdrop-blur-xs text-[#16C7E8]">
              <Sparkles className="w-4 h-4 text-[#16C7E8]" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[12px] lg:text-[12.5px] font-semibold text-white leading-tight">Ứng dụng AI</span>
              <span className="text-[11px] lg:text-[11.5px] text-white/80 leading-tight mt-0.5">thông minh</span>
            </div>
          </div>

          {/* Feature 3: Tối ưu quy trình hiệu quả */}
          {/* <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#16C7E8]/10 border border-[#16C7E8]/25 flex items-center justify-center shrink-0 backdrop-blur-xs text-[#16C7E8]">
              <Workflow className="w-4 h-4 text-[#16C7E8]" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[12px] lg:text-[12.5px] font-semibold text-white leading-tight">Tối ưu quy trình</span>
              <span className="text-[11px] lg:text-[11.5px] text-white/80 leading-tight mt-0.5">hiệu quả</span>
            </div>
          </div> */}

          {/* Feature 4: An toàn bảo mật */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#16C7E8]/10 border border-[#16C7E8]/25 flex items-center justify-center shrink-0 backdrop-blur-xs text-[#16C7E8]">
              <ShieldCheck className="w-4 h-4 text-[#16C7E8]" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[12px] lg:text-[12.5px] font-semibold text-white leading-tight">An toàn</span>
              <span className="text-[11px] lg:text-[11.5px] text-white/80 leading-tight mt-0.5">bảo mật</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. HERO VISUAL: AI DOCUMENT WORKFLOW ILLUSTRATION (CENTERED IN BLUE CANVAS) ── */}
      <div className="w-full my-auto py-2 flex items-center justify-center">
        <SecurityIllustration />
      </div>

      {/* ── BOTTOM EMPTY SPACE TO PRESERVE ALIGNMENT ── */}
      <div className="hidden lg:block h-4" aria-hidden="true" />
    </div>
  );
}
