import { type ReactNode } from 'react';

interface AdminPageHeaderProps {
    icon: ReactNode;
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    iconColor?: string; // hex e.g. '#1a2744'
}

/**
 * Shared clean university-style page header for all admin/management pages.
 * Replaces the old dark gradient banners.
 */
export default function AdminPageHeader({
    icon,
    title,
    subtitle,
    actions,
    iconColor = '#1a2744',
}: AdminPageHeaderProps) {
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-6 md:px-10 mb-6">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm text-white"
                        style={{ background: iconColor }}
                    >
                        {icon}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1a2744] tracking-tight">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>
                {actions && (
                    <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>
                )}
            </div>
        </div>
    );
}
