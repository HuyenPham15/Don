import React from "react";
import LoginCard, { LoginFormSubmitData } from "./LoginCard";

interface LoginPanelProps {
  onSubmit: (data: LoginFormSubmitData) => Promise<void> | void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onForgotPasswordClick?: () => void;
  initialUsername?: string;
  className?: string;
}

export default function LoginPanel({
  onSubmit,
  isLoading = false,
  errorMessage = null,
  onForgotPasswordClick,
  initialUsername = "",
  className = "",
}: LoginPanelProps) {
  return (
    <div
      className={`w-full md:w-[50%] lg:w-[42%] flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-10 z-10 ${className}`}
    >
      {/* Login Card - Vertically Centered */}
      <div className="w-full flex items-center justify-center my-auto pt-6 pb-12">
        <LoginCard
          onSubmit={onSubmit}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onForgotPasswordClick={onForgotPasswordClick}
          initialUsername={initialUsername}
        />
      </div>
    </div>
  );
}
