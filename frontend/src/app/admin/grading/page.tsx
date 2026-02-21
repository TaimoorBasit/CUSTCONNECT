'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';
import {
  AcademicCapIcon,
  PlusIcon,
  TrashIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface GradingScale {
  id?: string;
  universityId: string;
  grade: string; // A+, A, A-, B+, etc.
  minPercentage: number;
  maxPercentage: number;
  gpaPoints: number;
}

export default function GradingSystemPage() {
  const [universities, setUniversities] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [gradingScales, setGradingScales] = useState<GradingScale[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (selectedUniversity) {
      fetchGradingScales();
    }
  }, [selectedUniversity]);

  const fetchUniversities = async () => {
    try {
      const data = await adminService.getUniversities();
      setUniversities(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to authenticate institutions');
    }
  };

  const fetchGradingScales = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/grading/${selectedUniversity}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setGradingScales(data.data.scales || []);
      }
    } catch (error: any) {
      console.error('Fetch grading scales error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrade = () => {
    setGradingScales([
      ...gradingScales,
      {
        universityId: selectedUniversity,
        grade: '',
        minPercentage: 0,
        maxPercentage: 100,
        gpaPoints: 0,
      },
    ]);
  };

  const handleUpdateGrade = (index: number, field: keyof GradingScale, value: any) => {
    const updated = [...gradingScales];
    updated[index] = { ...updated[index], [field]: value };
    setGradingScales(updated);
  };

  const handleRemoveGrade = (index: number) => {
    setGradingScales(gradingScales.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedUniversity) {
      toast.error('Identity of institution required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/grading/${selectedUniversity}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ scales: gradingScales }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Academic parameters synchronized');
      } else {
        throw new Error(data.message || 'Failed to sync parameters');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update governance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-0 font-sans">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#1e1b4b] to-[#312e81] p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -m-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -m-8 w-64 h-64 bg-violet-400/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
            <AcademicCapIcon className="w-3.5 h-3.5" />
            Institutional Governance
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            GPA <span className="text-indigo-400">Architecture</span>
          </h1>
          <p className="text-indigo-100/60 font-medium max-w-2xl leading-relaxed">
            Configure grading schemas and gpa point values to standardize academic performance metrics across authorized universities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Active Institution</h3>
            <div className="relative group">
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full appearance-none px-6 py-4.5 bg-gray-50 border border-transparent rounded-[20px] font-bold text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all cursor-pointer shadow-inner pr-12"
              >
                <option value="">Select University...</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-indigo-500 transition-colors">
                <ChevronDownIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="p-6 bg-indigo-50/50 rounded-[24px] border border-indigo-50 space-y-3">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Protocol Tip</p>
              <p className="text-xs font-bold text-indigo-900 leading-relaxed italic">
                Ensure grading points align with the official institutional policy of the selected university.
              </p>
            </div>
          </div>
        </div>

        {/* Main Configuration Matrix */}
        <div className="lg:col-span-3">
          {selectedUniversity ? (
            <div className="bg-white rounded-[40px] p-8 lg:p-10 border border-gray-100 shadow-sm space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-50 pb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-900 rounded-2xl text-white">
                    <ChartBarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Grading Schema</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Institution ID: {selectedUniversity.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={handleAddGrade}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-50 text-indigo-600 rounded-[20px] font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm border border-indigo-100"
                >
                  <PlusIcon className="w-4 h-4" />
                  Insert Tier
                </button>
              </div>

              <div className="space-y-4">
                {gradingScales.length === 0 ? (
                  <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[40px] bg-gray-50/50">
                    <AcademicCapIcon className="w-16 h-16 text-gray-200 mx-auto mb-6 stroke-[1.5]" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No assessment tiers defined for this institution.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {gradingScales.map((scale, index) => (
                      <div key={index} className="group grid grid-cols-1 md:grid-cols-12 items-center gap-4 p-6 bg-white border border-gray-100 rounded-[28px] hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 animate-in slide-in-from-bottom-2">
                        <div className="md:col-span-3 space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 block">Grade Token</label>
                          <input
                            type="text"
                            value={scale.grade}
                            onChange={(e) => handleUpdateGrade(index, 'grade', e.target.value)}
                            placeholder="A+, A, B..."
                            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-[18px] font-black text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-gray-300"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 block">Min %</label>
                          <input
                            type="number"
                            value={scale.minPercentage}
                            onChange={(e) => handleUpdateGrade(index, 'minPercentage', parseFloat(e.target.value))}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-[18px] font-bold text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 block">Max %</label>
                          <input
                            type="number"
                            value={scale.maxPercentage}
                            onChange={(e) => handleUpdateGrade(index, 'maxPercentage', parseFloat(e.target.value))}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-[18px] font-bold text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 block">GPA Value</label>
                          <input
                            type="number"
                            value={scale.gpaPoints}
                            onChange={(e) => handleUpdateGrade(index, 'gpaPoints', parseFloat(e.target.value))}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-[18px] font-black text-indigo-600 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                            min="0"
                            max="4"
                            step="0.1"
                          />
                        </div>
                        <div className="md:col-span-2 flex items-end justify-end h-full pb-0.5">
                          <button
                            onClick={() => handleRemoveGrade(index)}
                            className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm border border-rose-100"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-8 border-t border-gray-50">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  <ShieldCheckIcon className="w-5 h-5 text-indigo-400" />
                  Synchronize Matrix
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-gray-100 shadow-sm">
              <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-8 text-slate-300">
                <ShieldCheckIcon className="h-12 w-12 stroke-[1.5]" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-3">Institution Pending</h3>
              <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed uppercase text-[10px] tracking-widest">Select an authorized university from the directory to begin architectural configuration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

