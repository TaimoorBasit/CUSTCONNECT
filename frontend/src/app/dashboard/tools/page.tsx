'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import WrenchScrewdriverIcon from '@heroicons/react/24/outline/WrenchScrewdriverIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import PageHeader from '@/components/dashboard/PageHeader';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function ToolsPage() {
    const [activeTab, setActiveTab] = useState<'editor' | 'converter'>('editor');
    const [editorContent, setEditorContent] = useState('');
    const [fileName, setFileName] = useState('Assignment_1');
    const [isProcessing, setIsProcessing] = useState(false);

    const modules = {
        toolbar: [
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }, { 'align': [] }],
            ['link', 'image', 'video', 'formula'],
            ['clean']
        ],
        clipboard: { matchVisual: false },
    };

    const formats = [
        'font', 'size', 'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
        'color', 'background', 'script',
        'list', 'indent', 'direction', 'align',
        'link', 'image', 'video', 'formula'
    ];

    const exportToPDF = async () => {
        setIsProcessing(true);
        try {
            const doc = new jsPDF();
            const element = document.createElement('div');
            element.innerHTML = editorContent;
            element.style.width = '190mm';
            element.style.padding = '10mm';
            element.style.fontFamily = 'Arial, sans-serif';
            document.body.appendChild(element);
            await doc.html(element, {
                callback: function (doc) {
                    doc.save(`${fileName}.pdf`);
                    document.body.removeChild(element);
                    toast.success('Generated PDF successfully');
                },
                x: 10, y: 10, width: 190, windowWidth: 800
            });
        } catch (error) {
            console.error(error);
            toast.error('PDF export failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const exportToWord = async () => {
        setIsProcessing(true);
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = editorContent;
            const paragraphs = Array.from(tempDiv.querySelectorAll('p, h1, h2, h3, li')).map(p => {
                const text = p.textContent || '';
                let size = 24;
                let bold = false;
                if (p.tagName === 'H1') { size = 32; bold = true; }
                if (p.tagName === 'H2') { size = 28; bold = true; }
                return new Paragraph({ children: [new TextRun({ text, size, bold })], spacing: { after: 200 } });
            });
            if (paragraphs.length === 0 && editorContent) {
                paragraphs.push(new Paragraph({ children: [new TextRun(tempDiv.textContent || '')] }));
            }
            const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${fileName}.docx`);
            toast.success('Word document exported');
        } catch (error) {
            console.error(error);
            toast.error('Word export failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${fileName}</title>
                        <style>
                            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a2744; line-height: 1.6; } 
                            img { max-width: 100%; }
                            h1 { color: #A51C30; }
                        </style>
                    </head>
                    <body>
                        ${editorContent}
                        <script>window.onload = function() { window.print(); window.close(); }<\/script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F7F4]">
            <PageHeader
                title="Academic Workspace"
                subtitle="A distraction-free zone to draft, format, and export your academic papers"
                icon={WrenchScrewdriverIcon}
                iconColor="#1a2744"
                iconBg="#F0F3FA"
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('editor')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'editor'
                                ? 'bg-[#1a2744] text-white shadow-lg shadow-[#1a2744]/20'
                                : 'bg-white text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <DocumentTextIcon className="w-4 h-4" />
                            Editor
                        </button>
                        <button
                            onClick={() => setActiveTab('converter')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'converter'
                                ? 'bg-[#1a2744] text-white shadow-lg shadow-[#1a2744]/20'
                                : 'bg-white text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            Converter
                        </button>
                    </div>
                }
            />

            <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
                {activeTab === 'editor' ? (
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-[#1a2744]/5 overflow-hidden flex flex-col h-[750px]">
                        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <input
                                    type="text"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    className="bg-transparent border-none text-sm font-black text-[#1a2744] focus:ring-0 w-48 placeholder:text-gray-300"
                                    placeholder="Enter file name…"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    <PrinterIcon className="w-4 h-4" /> Print
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    disabled={isProcessing}
                                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#A51C30] bg-[#FFF5F5] border border-[#A51C30]/10 rounded-xl hover:bg-[#A51C30] hover:text-white transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" /> PDF
                                </button>
                                <button
                                    onClick={exportToWord}
                                    disabled={isProcessing}
                                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" /> Word
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-white relative">
                            <ReactQuill
                                theme="snow"
                                value={editorContent}
                                onChange={setEditorContent}
                                modules={modules}
                                formats={formats}
                                className="h-full"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* PDF to Word Card */}
                        <div className="group bg-white rounded-[32px] border border-gray-100 p-10 flex flex-col items-center text-center transition-all hover:shadow-2xl hover:shadow-[#1a2744]/10 hover:-translate-y-1">
                            <div className="w-20 h-20 rounded-[28px] bg-[#FFF5F5] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <DocumentTextIcon className="w-10 h-10 text-[#A51C30]" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-black text-[#1a2744] mb-2">PDF to Word</h3>
                            <p className="text-sm text-gray-400 font-medium mb-8 max-w-[240px]">
                                Convert any PDF document back into an editable Word file format.
                            </p>
                            <label className="w-full cursor-pointer">
                                <span className="block w-full py-4 rounded-[20px] text-sm font-black text-white bg-[#1a2744] hover:bg-[#0f172a] transition-all shadow-lg shadow-[#1a2744]/20 active:scale-95">
                                    {isProcessing ? 'Converting…' : 'Select PDF File'}
                                </span>
                                <input type="file" className="sr-only" accept=".pdf" disabled={isProcessing} />
                            </label>
                        </div>

                        {/* Word to PDF Card */}
                        <div className="group bg-white rounded-[32px] border border-gray-100 p-10 flex flex-col items-center text-center transition-all hover:shadow-2xl hover:shadow-[#1a2744]/10 hover:-translate-y-1">
                            <div className="w-20 h-20 rounded-[28px] bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <DocumentTextIcon className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-black text-[#1a2744] mb-2">Word to PDF</h3>
                            <p className="text-sm text-gray-400 font-medium mb-8 max-w-[240px]">
                                Professional-grade conversion from Word documents to high-quality PDF.
                            </p>
                            <label className="w-full cursor-pointer">
                                <span className="block w-full py-4 rounded-[20px] text-sm font-black text-white bg-[#A51C30] hover:bg-[#8b1526] transition-all shadow-lg shadow-[#A51C30]/20 active:scale-95">
                                    {isProcessing ? 'Converting…' : 'Select Word File'}
                                </span>
                                <input type="file" className="sr-only" accept=".docx" disabled={isProcessing} />
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .quill { display: flex; flex-direction: column; height: 100%; border: none !important; }
                .ql-toolbar { border: none !important; border-bottom: 1px solid #f3f4f6 !important; padding: 12px 24px !important; }
                .ql-container { border: none !important; flex: 1; overflow-y: auto; font-size: 16px; font-family: 'Inter', sans-serif; }
                .ql-editor { padding: 40px 60px !important; line-height: 1.8; color: #1a2744; }
                .ql-editor.ql-blank::before { left: 60px !important; font-style: normal !important; color: #d1d5db !important; }
            `}</style>
        </div>
    );
}

