'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

// Set worker for PDF.js (CDN fallback to ensure it works without complex build config)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ToolsPage() {
    const [activeTab, setActiveTab] = useState<'editor' | 'converter'>('editor');
    const [editorContent, setEditorContent] = useState('');
    const [fileName, setFileName] = useState('Assignment');
    const [isProcessing, setIsProcessing] = useState(false);

    // Editor Modules
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
        clipboard: {
            matchVisual: false,
        },
    };

    const formats = [
        'font', 'size', 'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
        'color', 'background',
        'script',
        'list', 'indent', // 'bullet' is part of 'list'
        'direction', 'align',
        'link', 'image', 'video', 'formula'
    ];

    // --- EDITOR FUNCTIONS ---

    const exportToPDF = async () => {
        setIsProcessing(true);
        try {
            // Create a new jsPDF instance
            const doc = new jsPDF();

            // Get text content stripped of HTML tags for simple PDF generation
            // For better HTML->PDF, html2canvas is better but tricky with Quill styles. 
            // We will use a simple HTML strip for V1 or doc.html if possible.

            // Let's use the HTML method of jsPDF
            const element = document.createElement('div');
            element.innerHTML = editorContent;
            element.style.width = '190mm'; // A4 width approx
            element.style.padding = '10mm';
            element.style.fontFamily = 'Arial, sans-serif';
            document.body.appendChild(element);

            await doc.html(element, {
                callback: function (doc) {
                    doc.save(`${fileName}.pdf`);
                    document.body.removeChild(element);
                    toast.success('Downloaded as PDF');
                },
                x: 10,
                y: 10,
                width: 190,
                windowWidth: 800
            });

        } catch (error) {
            console.error(error);
            toast.error('Failed to export PDF');
        } finally {
            setIsProcessing(false);
        }
    };

    const exportToWord = async () => {
        setIsProcessing(true);
        try {
            // Extract text lines (Very basic HTML to Docx mapping)
            // For robust conversion, we'd need a parser. Here we strip tags and handle paragraphs.

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = editorContent;
            const paragraphs = Array.from(tempDiv.querySelectorAll('p, h1, h2, h3, li')).map(p => {
                const text = p.textContent || '';
                // Determine style based on tag
                let size = 24; // 12pt
                let bold = false;

                if (p.tagName === 'H1') { size = 32; bold = true; }
                if (p.tagName === 'H2') { size = 28; bold = true; }

                return new Paragraph({
                    children: [
                        new TextRun({
                            text: text,
                            size: size,
                            bold: bold
                        }),
                    ],
                    spacing: { after: 200 }
                });
            });

            // Fallback if no tags found (plain text)
            if (paragraphs.length === 0 && editorContent) {
                paragraphs.push(new Paragraph({
                    children: [new TextRun(tempDiv.textContent || '')]
                }));
            }

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: paragraphs,
                }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${fileName}.docx`);
            toast.success('Downloaded as Word');
        } catch (error) {
            console.error(error);
            toast.error('Failed to export Word');
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
                            body { font-family: Arial, sans-serif; padding: 40px; }
                            img { max-width: 100%; }
                        </style>
                    </head>
                    <body>
                        ${editorContent}
                        <script>
                            window.onload = function() { window.print(); window.close(); }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };


    // --- CONVERTER FUNCTIONS ---
    const handlePdfToWord = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n\n';
            }

            // Create Docx
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: fullText.split('\n').map(line => new Paragraph({
                        children: [new TextRun(line)]
                    }))
                }]
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${file.name.replace('.pdf', '')}.docx`);
            toast.success('Converted to Word!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to convert PDF. Ensure file is not encrypted.');
        } finally {
            setIsProcessing(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleWordToPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = result.value;

            // Use jsPDF to print this HTML
            const doc = new jsPDF();
            const element = document.createElement('div');
            element.innerHTML = html;
            element.style.width = '190mm';
            element.style.padding = '10mm';

            document.body.appendChild(element);

            await doc.html(element, {
                callback: function (doc) {
                    doc.save(`${file.name.replace('.docx', '')}.pdf`);
                    document.body.removeChild(element);
                    toast.success('Converted to PDF!');
                },
                x: 10,
                y: 10,
                width: 190,
                windowWidth: 800
            });

        } catch (error) {
            console.error(error);
            toast.error('Failed to convert Word file.');
        } finally {
            setIsProcessing(false);
            e.target.value = '';
        }
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Assignment Tools</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Write, format, and convert your assignments easily.
                        </p>
                    </div>
                    <div className="mt-5 md:col-span-2 md:mt-0 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => setActiveTab('editor')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'editor' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
                        >
                            <DocumentTextIcon className="inline-block w-5 h-5 mr-2" />
                            Assignment Editor
                        </button>
                        <button
                            onClick={() => setActiveTab('converter')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'converter' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
                        >
                            <ArrowPathIcon className="inline-block w-5 h-5 mr-2" />
                            File Converter
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'editor' && (
                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            placeholder="Assignment Name"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                <PrinterIcon className="w-4 h-4 mr-2" /> Print
                            </button>
                            <button
                                onClick={exportToPDF}
                                disabled={isProcessing}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                {isProcessing ? 'Processing...' : <><ArrowDownTrayIcon className="w-4 h-4 mr-2" /> Save as PDF</>}
                            </button>
                            <button
                                onClick={exportToWord}
                                disabled={isProcessing}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                {isProcessing ? 'Processing...' : <><ArrowDownTrayIcon className="w-4 h-4 mr-2" /> Save as Word</>}
                            </button>
                        </div>
                    </div>

                    <div className="p-4 h-[600px] bg-gray-50">
                        <div className="bg-white h-full shadow-inner rounded-md overflow-hidden flex flex-col">
                            <ReactQuill
                                theme="snow"
                                value={editorContent}
                                onChange={setEditorContent}
                                modules={modules}
                                formats={formats}
                                className="h-full flex flex-col"
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'converter' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PDF to Word */}
                    <div className="bg-white shadow sm:rounded-lg p-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors">
                        <DocumentTextIcon className="w-16 h-16 text-red-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">PDF to Word</h3>
                        <p className="text-sm text-gray-500 mb-4 text-center">Convert PDF documents to editable Word files (Text only)</p>

                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                {isProcessing ? 'Converting...' : 'Select PDF File'}
                            </span>
                            <input
                                type="file"
                                className="sr-only"
                                accept=".pdf"
                                onChange={handlePdfToWord}
                                disabled={isProcessing}
                            />
                        </label>
                    </div>

                    {/* Word to PDF */}
                    <div className="bg-white shadow sm:rounded-lg p-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors">
                        <DocumentTextIcon className="w-16 h-16 text-blue-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Word to PDF</h3>
                        <p className="text-sm text-gray-500 mb-4 text-center">Convert Word documents to PDF format</p>

                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                {isProcessing ? 'Converting...' : 'Select Word File'}
                            </span>
                            <input
                                type="file"
                                className="sr-only"
                                accept=".docx"
                                onChange={handleWordToPdf}
                                disabled={isProcessing}
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* Styles adjustment for Quill to make it full height */}
            <style jsx global>{`
        .quill {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .ql-container {
            flex: 1;
            overflow-y: auto;
            font-size: 16px;
            color: #1c1917; /* Ensure text is dark */
            font-family: Arial, Helvetica, sans-serif; /* Word-like default */
            line-height: 1.6;
            padding-bottom: 2rem;
        }
        .ql-editor {
            color: #1c1917;
            min-height: 100%;
        }
      `}</style>
        </div>
    );
}
