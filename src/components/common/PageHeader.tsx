import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbCrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  section?: string;
  breadcrumbs?: BreadcrumbCrumb[];
  title: string;
  subtitle?: string | React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  section,
  breadcrumbs,
  title,
  subtitle,
  badge,
  action,
  secondaryActions,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 pt-2",
        className
      )}
    >
      <div className="space-y-1.5 min-w-0 flex-1">
        {/* Breadcrumb / Section indicator */}
        {(breadcrumbs && breadcrumbs.length > 0) || section ? (
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-sans flex-wrap">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.label + idx}>
                  {idx > 0 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                  {crumb.href ? (
                    <Link
                      to={crumb.href}
                      className="hover:text-white transition-colors truncate max-w-[160px]"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-300 font-medium truncate max-w-[180px]">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))
            ) : (
              <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider font-mono">
                {section}
              </span>
            )}
          </nav>
        ) : null}

        {/* Title + Badge Row */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white leading-tight">
            {title}
          </h1>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
            {subtitle}
          </div>
        )}
      </div>

      {/* Action Slot */}
      {(action || secondaryActions) && (
        <div className="flex items-center gap-3 shrink-0 self-start md:self-center flex-wrap">
          {secondaryActions}
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
