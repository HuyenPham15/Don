import React from "react";

interface LoginFooterProps {
  className?: string;
}

export default function LoginFooter({ className = "" }: LoginFooterProps) {
  return (
    <footer
      className={`w-full py-3.5 px-4 text-center text-[11.5px] sm:text-[12px] text-[#64748B] flex flex-wrap items-center justify-center gap-3 sm:gap-3.5 z-20 select-none ${className}`}
    >
      <span>© 2026 Hệ thống Quản lý Đơn. Tất cả quyền được bảo lưu.</span>
      <span className="text-slate-300 font-light hidden sm:inline" aria-hidden="true">
        |
      </span>
      <span>Phiên bản 1.0.0</span>
    </footer>
  );
}
