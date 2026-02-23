import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon: React.ElementType;
    iconColor?: string;
    iconBg?: string;
    backHref?: string;
    actions?: React.ReactNode;
}

/**
 * Consistent university-style page header used across all dashboard sub-pages.
 * Shows a white top bar with a coloured icon, title, subtitle, and optional action buttons.
 */
export default function PageHeader({
    title,
    subtitle,
    icon: Icon,
    iconColor = '#1a2744',
    iconBg = '#F0F3FA',
    backHref,
    actions,
}: PageHeaderProps) {
    return (
        <div className="bg-white border-b border-gray-200 px-4 py-5 md:px-8 md:py-6 mb-6">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    {backHref && (
                        <Link
                            href={backHref}
                            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1a2744] hover:border-gray-300 transition-colors flex-shrink-0"
                        >
                            <ChevronLeftIcon className="w-4 h-4" strokeWidth={2.5} />
                        </Link>
                    )}
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{ background: iconBg, color: iconColor }}
                    >
                        <Icon className="w-6 h-6" strokeWidth={1.8} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#1a2744] tracking-tight leading-none">{title}</h1>
                        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
            </div>
        </div>
    );
}
