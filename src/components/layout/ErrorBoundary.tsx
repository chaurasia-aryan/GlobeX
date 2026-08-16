import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import SpecularButton from "@/components/ui/SpecularButton";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#070B12] text-slate-100 flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0C121D] border border-red-500/30 shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-400 mx-auto flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-red-400 font-bold">
                APPLICATION STATE RECOVERED
              </span>
              <h2 className="text-2xl font-display font-bold text-white">Something went wrong</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The application encountered an unexpected runtime state. Your active credentials and contract data remain secure.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-left">
                <p className="text-[11px] font-mono text-red-300 truncate">
                  {this.state.error.message || "Unknown runtime exception"}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <SpecularButton
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                radius={12}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                iconPosition="left"
                className="flex-1"
              >
                Retry Action
              </SpecularButton>

              <SpecularButton
                onClick={this.handleReset}
                variant="emerald"
                size="sm"
                radius={12}
                icon={<Home className="w-3.5 h-3.5" />}
                iconPosition="left"
                className="flex-1"
              >
                Command Center
              </SpecularButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
