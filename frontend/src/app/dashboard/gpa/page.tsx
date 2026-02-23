'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  AcademicCapIcon,
  TrashIcon,
  PlusIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/dashboard/PageHeader';
import { gpaService, GPASubject, GPARecord } from '@/services/gpaService';
import { toast } from 'react-hot-toast';

const grades = [
  { grade: 'A+', points: 4.0 },
  { grade: 'A', points: 4.0 },
  { grade: 'A-', points: 3.7 },
  { grade: 'B+', points: 3.3 },
  { grade: 'B', points: 3.0 },
  { grade: 'B-', points: 2.7 },
  { grade: 'C+', points: 2.3 },
  { grade: 'C', points: 2.0 },
  { grade: 'C-', points: 1.7 },
  { grade: 'D+', points: 1.3 },
  { grade: 'D', points: 1.0 },
  { grade: 'F', points: 0.0 },
];

export default function GPACalculatorPage() {
  const [subjects, setSubjects] = useState<GPASubject[]>([
    { name: '', code: '', credits: 3, grade: 'A' },
  ]);
  const [semester, setSemester] = useState('Fall 2024');
  const [year, setYear] = useState('2024');
  const [history, setHistory] = useState<GPARecord[]>([]);
  const [currentCGPA, setCurrentCGPA] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [tips, setTips] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
    fetchTips();
  }, []);

  const fetchHistory = async () => {
    try {
      setFetchingHistory(true);
      const [historyData, statusData] = await Promise.all([
        gpaService.getHistory(),
        gpaService.getCurrentStatus(),
      ]);
      setHistory(historyData.records || []);
      setCurrentCGPA(statusData.cgpa || 0);
    } catch (error) {
      console.error('Failed to load GPA history');
    } finally {
      setFetchingHistory(false);
    }
  };

  const fetchTips = async () => {
    try {
      const data = await gpaService.getTips();
      setTips(data.tips || []);
    } catch (error) { }
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: '', code: '', credits: 3, grade: 'A' }]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length === 1) return;
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = (index: number, field: keyof GPASubject, value: any) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSubjects(newSubjects);
  };

  const currentGPA = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    subjects.forEach((s) => {
      const gradeObj = grades.find((g) => g.grade === s.grade);
      const points = gradeObj ? gradeObj.points : 0;
      totalPoints += points * s.credits;
      totalCredits += s.credits;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  }, [subjects]);

  const handleCalculate = async () => {
    if (subjects.some(s => !s.name || !s.code)) {
      toast.error('Please provide name and code for all subjects');
      return;
    }

    try {
      setLoading(true);
      await gpaService.calculateGPA({
        subjects,
        semester,
        year,
      });
      toast.success('GPA Calculated and Saved!');
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    try {
      await gpaService.deleteRecord(id);
      toast.success('Record deleted');
      fetchHistory();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const getVerdict = (gpa: number) => {
    if (gpa >= 3.7) return { text: 'Outstanding!', color: '#059669', bg: '#ECFDF5' };
    if (gpa >= 3.0) return { text: 'Great Job!', color: '#0369A1', bg: '#F0F9FF' };
    if (gpa >= 2.0) return { text: 'Good effort', color: '#D97706', bg: '#FFFBEB' };
    return { text: 'Needs improvement', color: '#A51C30', bg: '#FFF5F5' };
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <PageHeader
        title="Academic Performance"
        subtitle="Calculate your semester GPA and track your CGPA progress"
        icon={AcademicCapIcon}
        iconColor="#A51C30"
        iconBg="#FFF5F5"
      />

      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-lg font-bold text-[#1a2744]">GPA Calculator</h2>
                  <p className="text-xs text-gray-400 font-medium">Add your courses for this semester</p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#1a2744] focus:outline-none focus:ring-2 focus:ring-[#A51C30]/20"
                  >
                    <option>Fall 2024</option>
                    <option>Spring 2024</option>
                    <option>Summer 2024</option>
                  </select>
                </div>
              </div>

              <div className="p-8 space-y-4">
                {subjects.map((subject, index) => (
                  <div key={index} className="group flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Course Name (e.g. Algorithms)"
                        value={subject.name}
                        onChange={(e) => updateSubject(index, 'name', e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#A51C30]/10 rounded-2xl px-4 py-3 text-sm font-bold text-[#1a2744] outline-none transition-all placeholder:font-medium placeholder:text-gray-300"
                      />
                    </div>
                    <div className="w-full md:w-32">
                      <input
                        type="text"
                        placeholder="Code"
                        value={subject.code}
                        onChange={(e) => updateSubject(index, 'code', e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#A51C30]/10 rounded-2xl px-4 py-3 text-sm font-bold text-[#1a2744] outline-none transition-all text-center uppercase"
                      />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <select
                        value={subject.credits}
                        onChange={(e) => updateSubject(index, 'credits', parseInt(e.target.value))}
                        className="flex-1 md:w-24 bg-gray-50 border-2 border-transparent focus:border-[#A51C30]/10 rounded-2xl px-4 py-3 text-sm font-bold text-[#1a2744] cursor-pointer outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map(c => <option key={c} value={c}>{c} Cr</option>)}
                      </select>
                      <select
                        value={subject.grade}
                        onChange={(e) => updateSubject(index, 'grade', e.target.value)}
                        className="flex-1 md:w-24 bg-gray-50 border-2 border-transparent focus:border-[#A51C30]/10 rounded-2xl px-4 py-3 text-sm font-bold text-[#1a2744] cursor-pointer outline-none"
                      >
                        {grades.map(g => <option key={g.grade} value={g.grade}>{g.grade}</option>)}
                      </select>
                      {subjects.length > 1 && (
                        <button
                          onClick={() => removeSubject(index)}
                          className="p-3 text-gray-300 hover:text-[#A51C30] hover:bg-[#FFF5F5] rounded-2xl transition-all"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="pt-6 flex flex-col md:flex-row gap-4 items-center justify-between border-t border-gray-100 mt-6">
                  <button
                    onClick={addSubject}
                    className="flex items-center gap-2 text-sm font-black text-[#A51C30] hover:bg-[#FFF5F5] px-6 py-3 rounded-2xl transition-all"
                  >
                    <PlusIcon className="w-5 h-5" strokeWidth={3} />
                    Add Course
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Semester GPA</p>
                      <p className="text-3xl font-black text-[#1a2744]">{currentGPA}</p>
                    </div>
                    <button
                      onClick={handleCalculate}
                      disabled={loading}
                      className="bg-[#1a2744] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#1a2744]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Calculating…' : 'Save Record'}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1a2744] flex items-center gap-2">
                  <ArrowPathIcon className="w-5 h-5 text-gray-400" />
                  GPA History
                </h2>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Progress</span>
              </div>
              <div className="p-4">
                {fetchingHistory ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#A51C30] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Loading records…</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="py-16 text-center">
                    <ChartBarIcon className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-400">No records yet. Save your first semester!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((record) => {
                      const v = getVerdict(record.gpa);
                      return (
                        <div key={record.id} className="group bg-gray-50 rounded-2xl p-4 flex items-center gap-4 hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                          <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-inner" style={{ background: v.bg, color: v.color }}>
                            <span className="text-base font-black">{record.gpa.toFixed(2)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-[#1a2744] truncate">{record.semester} {record.year}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{record.credits} Credits</span>
                              <span className="text-gray-200">·</span>
                              <span className="text-[10px] font-bold" style={{ color: v.color }}>{v.text}</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div className="hidden sm:block">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CGPA</p>
                              <p className="text-sm font-black text-[#1a2744]">{record.cgpa.toFixed(2)}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-[#1a2744] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-[#1a2744]/20">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Cumulative GPA</p>
              <h3 className="text-5xl font-black mb-6">{currentCGPA.toFixed(2)}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <div className="w-10 h-10 rounded-xl bg-[#A51C30] flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase">Academic Standing</p>
                    <p className="text-sm font-bold">Good Standing</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
              <h3 className="text-sm font-black text-[#1a2744] uppercase tracking-widest mb-6 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5 text-[#A51C30]" />
                Academic Tips
              </h3>
              <div className="space-y-6">
                {tips.slice(0, 3).map((tip, i) => (
                  <div key={i} className="group relative">
                    <div className="absolute -left-4 top-1 w-1 h-0 group-hover:h-full bg-[#A51C30] transition-all rounded-full" />
                    <h4 className="text-sm font-bold text-[#1a2744] mb-1">{tip.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">{tip.description}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 rounded-2xl text-[11px] font-black text-[#1a2744] bg-gray-50 hover:bg-gray-100 transition-all uppercase tracking-widest">
                View all tips
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
