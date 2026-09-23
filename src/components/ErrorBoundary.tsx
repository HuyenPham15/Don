import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackScreen?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.fallbackScreen) {
      this.props.fallbackScreen();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-8 bg-[#f4f7fb]">
          <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-xl p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">error</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Đã xảy ra lỗi hiển thị</h2>
              <p className="text-xs text-slate-500 mt-1">
                Giao diện gặp sự cố khi tải dữ liệu màn hình này.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-red-50/60 rounded-xl text-left border border-red-100">
                <p className="text-[11px] font-mono text-red-700 break-all">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Tải lại trang
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                Quay lại Công việc
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
