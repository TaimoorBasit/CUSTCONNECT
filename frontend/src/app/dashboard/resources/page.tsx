'use client';

import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import CloudArrowUpIcon from '@heroicons/react/24/outline/CloudArrowUpIcon';

const resources = [
  { title: 'Data Structures Cheatsheet', type: 'PDF', size: '2.1 MB', course: 'CS-201' },
  { title: 'Midterm Sample Questions', type: 'DOCX', size: '850 KB', course: 'BA-110' },
  { title: 'Linear Algebra Notes', type: 'Notion', size: 'Shared Link', course: 'MATH-210' },
];

const recommendations = [
  'Upload summaries after every lecture to build a shared knowledge base.',
  'Use descriptive file names (course + topic) for faster discovery.',
  'Keep solutions separate from question banks to avoid spoilers.',
];

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Academic Resources</h1>
          <p className="text-gray-500">Download curated notes, summaries, and past papers.</p>
        </div>
        <button className="inline-flex items-center rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
          <CloudArrowUpIcon className="mr-2 h-5 w-5" />
          Upload Resource
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50 text-sm font-semibold text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Course</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Size</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {resources.map((resource) => (
              <tr key={resource.title}>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{resource.title}</p>
                </td>
                <td className="px-6 py-4">{resource.course}</td>
                <td className="px-6 py-4">{resource.type}</td>
                <td className="px-6 py-4">{resource.size}</td>
                <td className="px-6 py-4 text-right">
                  <button className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
                    <ArrowDownTrayIcon className="mr-1 h-4 w-4" />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Sharing Guidelines</h3>
        <ul className="mt-4 space-y-3 text-sm text-gray-600">
          {recommendations.map((tip, idx) => (
            <li key={tip} className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                {idx + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


