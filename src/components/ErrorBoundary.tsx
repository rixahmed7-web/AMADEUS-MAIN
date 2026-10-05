import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  isModal?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught unhandled component error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleCopyError = () => {
    const text = `Error: ${this.state.error?.toString()}\n\nStack:\n${this.state.errorInfo?.componentStack || ''}`;
    navigator.clipboard?.writeText(text);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2500);
  };

  public render() {
    if (this.state.hasError) {
      const content = (
        <div className="min-h-[260px] p-6 m-4 bg-white rounded-lg border-2 border-amber-400 shadow-2xl text-slate-800 flex flex-col justify-center items-center text-center max-w-2xl w-full mx-auto animate-in fade-in duration-200 select-text">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mb-3 shadow-inner">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">
            {this.props.fallbackTitle || 'অপ্রত্যাশিত ডিসপ্লে ত্রুটি (Display Error Caught)'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mb-4 max-w-lg leading-relaxed">
            একটি ইন্টারফেস রেন্ডারিং ত্রুটির কারণে স্ক্রিন প্রদর্শনে সমস্যা হয়েছে। সিস্টেম নিরাপদ রয়েছে এবং টার্মিনাল সেশন সুরক্ষিত আছে। নিচের বাটনে ক্লিক করে ভিউ রিসেট করুন অথবা পেজ রিলোড করুন।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 bg-[#005eb8] hover:bg-[#00478c] text-white font-bold text-xs sm:text-sm rounded shadow flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ভিউ রিসেট করুন (Reset &amp; Try Again)</span>
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded transition-colors cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>পেজ রিলোড (Reload Page)</span>
            </button>
          </div>

          {this.state.error && (
            <div className="w-full text-left bg-slate-50 border border-slate-200 rounded p-3 text-xs font-mono text-slate-700 mt-3">
              <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-200">
                <span className="font-bold text-amber-800">
                  ডিবাগ ও এরর বিবরণ (Error Details for Debugging):
                </span>
                <button
                  type="button"
                  onClick={this.handleCopyError}
                  className="text-[11px] px-2 py-0.5 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer font-sans"
                >
                  {this.state.copied ? '✓ Copied' : 'Copy Error Details'}
                </button>
              </div>
              <div className="mt-1 text-red-600 font-semibold whitespace-pre-wrap text-[11px]">
                {this.state.error.toString()}
              </div>
              {this.state.errorInfo?.componentStack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-slate-500 text-[10px] font-sans hover:underline">
                    View Component Stack
                  </summary>
                  <div className="mt-1 text-slate-500 text-[10px] whitespace-pre-wrap max-h-36 overflow-y-auto bg-slate-100 p-2 rounded">
                    {this.state.errorInfo.componentStack}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      );

      if (this.props.isModal) {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
            {content}
          </div>
        );
      }

      return content;
    }

    return this.props.children;
  }
}
