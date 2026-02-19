'use client';

import { useMemo, useState } from 'react';
import CalculatorIcon from '@heroicons/react/24/outline/CalculatorIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';

const gradeOptions = [
  { label: 'A+ (4.0)', value: 4.0 },
  { label: 'A (4.0)', value: 4.0 },
  { label: 'A- (3.7)', value: 3.7 },
  { label: 'B+ (3.3)', value: 3.3 },
  { label: 'B (3.0)', value: 3.0 },
  { label: 'B- (2.7)', value: 2.7 },
  { label: 'C+ (2.3)', value: 2.3 },
  { label: 'C (2.0)', value: 2.0 },
  { label: 'C- (1.7)', value: 1.7 },
  { label: 'D+ (1.3)', value: 1.3 },
  { label: 'D (1.0)', value: 1.0 },
  { label: 'F (0)', value: 0 },
];

type CourseInput = {
  id: string;
  name: string;
  credits: number;
  grade?: number;
};

const emptyCourse = (): CourseInput => ({
  id: crypto.randomUUID(),
  name: '',
  credits: 3,
  grade: undefined,
});

export default function GPACalculatorPage() {
  const [courses, setCourses] = useState<CourseInput[]>([emptyCourse()]);

  const summary = useMemo(() => {
    const validCourses = courses.filter((course) => course.grade !== undefined && course.name.trim());
    const totalCredits = validCourses.reduce((sum, course) => sum + course.credits, 0);
    const totalPoints = validCourses.reduce(
      (sum, course) => sum + course.credits * (course.grade ?? 0),
      0
    );
    const gpa = totalCredits ? totalPoints / totalCredits : null;
    let verdict: string | null = null;
    if (gpa !== null) {
      verdict =
        gpa >= 3.5 ? 'Excellent' : gpa >= 3 ? 'Great Progress' : gpa >= 2.5 ? 'Keep Building' : 'Needs Attention';
    }

    return { totalCredits, gpa, verdict, courses: validCourses.length };
  }, [courses]);

  const updateCourse = (id: string, changes: Partial<CourseInput>) => {
    setCourses((prev) => prev.map((course) => (course.id === id ? { ...course, ...changes } : course)));
  };

  const addCourse = () => setCourses((prev) => [...prev, emptyCourse()]);
  const removeCourse = (id: string) => {
    setCourses((prev) => (prev.length === 1 ? prev : prev.filter((course) => course.id !== id)));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">GPA Calculator</h1>
        <p className="text-gray-500">Enter your courses to calculate your semester GPA.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-blue-700">
          <CalculatorIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold text-gray-900">Enter Your Courses</h2>
        </div>

        <div className="mt-6 space-y-4">
          {courses.map((course, index) => (
            <div key={course.id} className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <label className="text-sm font-medium text-gray-700">Course Name</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Data Structures"
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Credits</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={course.credits}
                  onChange={(e) => updateCourse(course.id, { credits: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Grade</label>
                  <select
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={course.grade ?? ''}
                    onChange={(e) =>
                      updateCourse(course.id, { grade: e.target.value ? Number(e.target.value) : undefined })
                    }
                  >
                    <option value="">Select</option>
                    {gradeOptions.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeCourse(course.id)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-red-500"
                >
                  <TrashIcon className="h-5 w-5" />
                  <span className="sr-only">Remove course {index + 1}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row">
          <button
            type="button"
            onClick={addCourse}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            + Add Course
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-500">Your GPA</p>
          <div className="mt-4 text-5xl font-bold text-blue-600">
            {summary.gpa !== null ? summary.gpa.toFixed(2) : '--'}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Total Credits: {summary.totalCredits} • Courses: {summary.courses}
          </p>
          {summary.verdict && (
            <span className="mt-4 inline-flex items-center rounded-full bg-green-50 px-4 py-1 text-sm font-semibold text-green-700">
              {summary.verdict}
            </span>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-blue-700">
            <InformationCircleIcon className="h-5 w-5" />
            <h3 className="text-sm font-semibold text-gray-900">Tips to Improve Your GPA</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            <li>Attend classes regularly and participate actively.</li>
            <li>Break assignments into milestones and start early.</li>
            <li>Leverage tutoring centers and study groups.</li>
            <li>Meet professors during office hours for feedback.</li>
            <li>Balance academics with rest, exercise, and sleep.</li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm">
        This calculator provides an indicative GPA based on a 4.0 scale. Your institution might use a different
        grading policy—confirm with your academic advisor.
      </div>
    </div>
  );
}


