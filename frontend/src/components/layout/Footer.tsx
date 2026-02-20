'use client';

import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-6 px-4 bg-transparent mt-auto border-t border-zinc-500/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
                <p>
                    &copy; {currentYear} CustConnect. All rights reserved.
                </p>
                <p className="flex items-center gap-1">
                    Designed & Developed by{' '}
                    <Link
                        href="https://taimoorawan.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                        Taimoor Awan
                    </Link>
                </p>
            </div>
        </footer>
    );
}
