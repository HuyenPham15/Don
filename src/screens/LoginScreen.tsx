import React, { useState } from "react";
import BrandingPanel from "../components/login/BrandingPanel";
import LoginPanel from "../components/login/LoginPanel";
import LoginFooter from "../components/login/LoginFooter";
import BackgroundDecorations from "../components/login/BackgroundDecorations";
import { LoginFormSubmitData } from "../components/login/LoginCard";
import { CurrentUserAccount, DEMO_ACCOUNTS } from "../types/signing";
import { ArrowLeft, Shield, X, Phone, Mail, Building } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (account: CurrentUserAccount) => void;
  onBackToApp?: () => void;
  initialAccount?: CurrentUserAccount;
}

export default function LoginScreen({
  onLoginSuccess,
  onBackToApp,
  initialAccount,
}: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");

  // Xử lý gửi thông tin đăng nhập
  const handleLoginSubmit = async (data: LoginFormSubmitData) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Giả lập độ trễ xác thực an toàn
    setTimeout(() => {
      setIsLoading(false);

      // Kiểm tra tài khoản test bị khóa
      if (data.username.toLowerCase().includes("khoa") || data.username.toLowerCase() === "locked") {
        setErrorMessage("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị hệ thống.");
        return;
      }

      // Giả lập sai mật khẩu
      if (data.password === "123" || data.password === "sai" || data.password === "wrong") {
        setErrorMessage("Tên đăng nhập hoặc mật khẩu không chính xác.");
        return;
      }

      // Tìm tài khoản phù hợp trong hệ thống hoặc dùng tài khoản cán bộ mặc định
      const matchedAccount =
        DEMO_ACCOUNTS.find(
          (a) =>
            data.username.toLowerCase().includes("cuong") ||
            data.username.toLowerCase().includes("lanhdao") ||
            a.id.toLowerCase().includes(data.username.toLowerCase()) ||
            a.name.toLowerCase().includes(data.username.toLowerCase())
        ) || DEMO_ACCOUNTS[0];

      // Đăng nhập thành công -> chuyển vào hệ thống
      onLoginSuccess(matchedAccount);
    }, 850);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row items-stretch justify-between overflow-x-hidden font-sans selection:bg-[#1557A6] selection:text-white">
      {/* ── 1. BACKGROUND DECORATIONS (SVG GRADIENTS, S-CURVE DIVIDER, BUILDING LINE-ART) ── */}
      <BackgroundDecorations />

      {/* ── 6. RIGHT PANEL TOP: NÚT "← Vào ứng dụng" (SECTION 6) ── */}
      {onBackToApp && (
        <div className="absolute top-4 right-5 sm:right-7 z-40">
          <button
            type="button"
            onClick={onBackToApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white hover:bg-slate-50 text-[#1557A6] border border-[#DCE7F5] text-[12px] font-medium transition-all cursor-pointer shadow-2xs hover:border-[#1557A6]/50 hover:shadow-xs"
            title="Quay lại không gian làm việc"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#1557A6]" strokeWidth={1.8} />
            <span>Vào ứng dụng</span>
          </button>
        </div>
      )}

      {/* ── 2. LEFT PANEL – BRANDING (58% DESKTOP) ── */}
      <BrandingPanel />

      {/* ── 3. RIGHT PANEL – LOGIN (42% DESKTOP) ── */}
      <LoginPanel
        onSubmit={handleLoginSubmit}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onForgotPasswordClick={() => setIsForgotModalOpen(true)}
        initialUsername={currentUsername}
      />

      {/* ── 12. FOOTER CĂN GIỮA TOÀN MÀN HÌNH ── */}
      <div className="absolute bottom-1 sm:bottom-2 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <LoginFooter className="pointer-events-auto" />
      </div>

      {/* ── MODAL QUÊN MẬT KHẨU CÔNG VỤ ── */}
      {isForgotModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-[18px] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-slide-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1557A6] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#1557A6]" />
                </div>
                <div>
                  <h3 id="forgot-password-title" className="text-base font-bold text-[#102A43]">
                    Khôi phục mật khẩu công vụ
                  </h3>
                  <p className="text-[11.5px] text-[#64748B]">Hệ thống Quản lý Đơn – GOVEX</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                aria-label="Đóng cửa sổ"
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 text-[13px] text-slate-600 space-y-3 leading-relaxed">
              <p>
                Để bảo đảm an toàn thông tin theo tiêu chuẩn cơ quan Nhà nước, tài khoản cán bộ công chức không cấp lại mật khẩu tự động qua SMS công khai.
              </p>

              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-blue-100/80 space-y-2 text-slate-700">
                <div className="font-semibold text-[#0F3B78] text-[13px]">
                  Kênh tiếp nhận hỗ trợ kỹ thuật:
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-4 h-4 text-[#1557A6] shrink-0" />
                  <span>Đường dây nóng: <strong className="font-mono text-[#1557A6]">1900 8198 (Nhánh 2)</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-4 h-4 text-[#1557A6] shrink-0" />
                  <span>Hòm thư công vụ: <strong className="font-mono text-[#1557A6]">quantri@don.gov.vn</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Building className="w-4 h-4 text-[#1557A6] shrink-0" />
                  <span>Trực tiếp: Phòng 402, Trung tâm Chuyển đổi số</span>
                </div>
              </div>

              <p className="text-[11.5px] text-[#64748B] italic">
                Thời gian hỗ trợ: 07:30 – 17:30 các ngày làm việc trong tuần.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#1557A6] hover:bg-[#0F3B78] text-white transition-colors cursor-pointer shadow-xs"
              >
                Đã hiểu và đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
