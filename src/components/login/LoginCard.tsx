import React, { useState, useRef, useEffect } from "react";
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import GovexLogo from "./GovexLogo";

export interface LoginFormSubmitData {
  username: string;
  password: string;
  autoLogin?: boolean;
}

interface LoginCardProps {
  onSubmit: (data: LoginFormSubmitData) => Promise<void> | void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onForgotPasswordClick?: () => void;
  initialUsername?: string;
}

export default function LoginCard({
  onSubmit,
  isLoading = false,
  errorMessage = null,
  onForgotPasswordClick,
  initialUsername = "",
}: LoginCardProps) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);

  // Field validation touched states
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus ô Tên đăng nhập khi mở trang nếu trống
  useEffect(() => {
    if (!initialUsername) {
      usernameInputRef.current?.focus();
    }
  }, [initialUsername]);

  // Đồng bộ khi initialUsername đổi từ ngoài
  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
    }
  }, [initialUsername]);

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser) {
      setUsernameError("Vui lòng nhập tên đăng nhập.");
      isValid = false;
    } else {
      setUsernameError(null);
    }

    if (!trimmedPass) {
      setPasswordError("Vui lòng nhập mật khẩu.");
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!validateForm() || isLoading) {
      return;
    }

    await onSubmit({
      username: username.trim(),
      password: password.trim(),
      autoLogin,
    });
  };

  return (
    <div className="w-full max-w-[410px] bg-white rounded-[18px] border border-[#E6EDF7] px-7 sm:px-9 py-8 sm:py-9 shadow-[0_12px_40px_-8px_rgba(15,59,120,0.07),0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center z-10 transition-all">
      {/* ── 8. LOGIN HEADER: LOGO GOVEX + ĐĂNG NHẬP + SUBTITLE ── */}
      <div className="mb-3.5">
        <GovexLogo theme="light" size="sm" />
      </div>

      <h2 className="text-[25px] sm:text-[26px] font-bold text-[#102A43] tracking-tight text-center leading-tight">
        Đăng nhập
      </h2>
      <p className="text-[13.5px] text-[#64748B] font-normal mt-1 mb-6 text-center">
        Vui lòng đăng nhập để tiếp tục
      </p>

      {/* Banner thông báo lỗi nếu có */}
      {errorMessage && (
        <div
          role="alert"
          className="w-full mb-4 p-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── 9. LOGIN FORM ── */}
      <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
        {/* INPUT 1: TÊN ĐĂNG NHẬP */}
        <div className="w-full text-left">
          <label htmlFor="login-username" className="block text-[13px] font-semibold text-[#102A43] mb-1.5 pl-0.5">
            Tên đăng nhập
          </label>
          <div
            className={`w-full h-[48px] flex items-center px-3.5 rounded-[8px] border bg-white transition-all duration-200 ${
              usernameError
                ? "border-rose-400 ring-2 ring-rose-100"
                : "border-[#DCE6F2] hover:border-slate-300 focus-within:border-[#1557A6] focus-within:ring-2 focus-within:ring-[#1557A6]/15"
            }`}
          >
            {/* Icon User bên trái */}
            <User className="w-4.5 h-4.5 text-[#64748B] shrink-0 mr-3" strokeWidth={1.8} aria-hidden="true" />
            <input
              ref={usernameInputRef}
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (hasSubmitted) {
                  if (e.target.value.trim()) setUsernameError(null);
                  else setUsernameError("Vui lòng nhập tên đăng nhập.");
                }
              }}
              onBlur={() => {
                if (hasSubmitted && !username.trim()) {
                  setUsernameError("Vui lòng nhập tên đăng nhập.");
                }
              }}
              placeholder="Nhập tên đăng nhập"
              disabled={isLoading}
              className="w-full h-full bg-transparent text-[14px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none"
            />
          </div>

          {/* Thông báo lỗi dưới input */}
          {usernameError && (
            <p className="text-[11.5px] text-rose-600 mt-1 pl-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{usernameError}</span>
            </p>
          )}
        </div>

        {/* INPUT 2: MẬT KHẨU */}
        <div className="w-full text-left">
          <label htmlFor="login-password" className="block text-[13px] font-semibold text-[#102A43] mb-1.5 pl-0.5">
            Mật khẩu
          </label>
          <div
            className={`w-full h-[48px] flex items-center px-3.5 rounded-[8px] border bg-white transition-all duration-200 ${
              passwordError
                ? "border-rose-400 ring-2 ring-rose-100"
                : "border-[#DCE6F2] hover:border-slate-300 focus-within:border-[#1557A6] focus-within:ring-2 focus-within:ring-[#1557A6]/15"
            }`}
          >
            {/* Icon Lock bên trái */}
            <Lock className="w-4.5 h-4.5 text-[#64748B] shrink-0 mr-3" strokeWidth={1.8} aria-hidden="true" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (hasSubmitted) {
                  if (e.target.value.trim()) setPasswordError(null);
                  else setPasswordError("Vui lòng nhập mật khẩu.");
                }
              }}
              onBlur={() => {
                if (hasSubmitted && !password.trim()) {
                  setPasswordError("Vui lòng nhập mật khẩu.");
                }
              }}
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
              className="w-full h-full bg-transparent text-[14px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none"
            />
            {/* Nút Toggle Show/Hide Password bên phải */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              disabled={isLoading}
              className="p-1 text-[#64748B] hover:text-[#102A43] focus:outline-none focus:text-[#1557A6] transition-colors cursor-pointer shrink-0 ml-1"
            >
              {showPassword ? (
                <Eye className="w-4.5 h-4.5" strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <EyeOff className="w-4.5 h-4.5" strokeWidth={1.8} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Thông báo lỗi dưới input */}
          {passwordError && (
            <p className="text-[11.5px] text-rose-600 mt-1 pl-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{passwordError}</span>
            </p>
          )}
        </div>

        {/* ── 10. OPTIONS: ĐĂNG NHẬP TỰ ĐỘNG & QUÊN MẬT KHẨU ── */}
        <div className="flex items-center justify-between pt-0.5 pb-1 select-none">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              id="auto-login"
              name="autoLogin"
              checked={autoLogin}
              onChange={(e) => setAutoLogin(e.target.checked)}
              disabled={isLoading}
              className="w-3.5 h-3.5 rounded border-[#DCE6F2] text-[#1557A6] focus:ring-0 cursor-pointer accent-[#1557A6] transition-all"
            />
            <span className="text-[12.5px] text-[#1E293B] group-hover:text-black transition-colors">
              Đăng nhập tự động
            </span>
          </label>

          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-[12.5px] font-semibold text-[#1557A6] hover:text-[#0F3B78] hover:underline transition-colors cursor-pointer"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* ── 11. LOGIN BUTTON (GOVEX BLUE #1557A6, HEIGHT 48PX, ARROW RIGHT) ── */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full h-[48px] rounded-[8px] text-white font-semibold text-[14.5px] flex items-center justify-center relative transition-all duration-150 cursor-pointer ${
            isLoading
              ? "bg-[#1557A6]/80 cursor-wait"
              : "bg-[#1557A6] hover:bg-[#0F3B78] active:bg-[#0C3063] shadow-xs hover:shadow-md"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4.5 h-4.5 animate-spin text-white" aria-hidden="true" />
              <span>Đang đăng nhập...</span>
            </div>
          ) : (
            <>
              <span>Đăng nhập</span>
              <ArrowRight className="w-4.5 h-4.5 absolute right-4 text-white" strokeWidth={2} aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
