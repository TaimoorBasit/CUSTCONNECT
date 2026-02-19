'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';

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
      toast.error(error.message || 'Failed to load universities');
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
      toast.error('Please select a university');
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
        toast.success('Grading system saved successfully');
      } else {
        throw new Error(data.message || 'Failed to save grading system');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save grading system');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">GPA Grading System</h1>
        <p className="text-gray-500">Configure grading scales and GPA calculation for universities.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select University</label>
          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Choose a university...</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {selectedUniversity && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Grading Scale</h3>
              <button
                onClick={handleAddGrade}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add Grade
              </button>
            </div>

            <div className="space-y-4">
              {gradingScales.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No grading scales configured. Click "Add Grade" to create one.
                </p>
              ) : (
                gradingScales.map((scale, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                        <input
                          type="text"
                          value={scale.grade}
                          onChange={(e) => handleUpdateGrade(index, 'grade', e.target.value)}
                          placeholder="A+, A, B+, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min %</label>
                        <input
                          type="number"
                          value={scale.minPercentage}
                          onChange={(e) => handleUpdateGrade(index, 'minPercentage', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max %</label>
                        <input
                          type="number"
                          value={scale.maxPercentage}
                          onChange={(e) => handleUpdateGrade(index, 'maxPercentage', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GPA Points</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={scale.gpaPoints}
                            onChange={(e) => handleUpdateGrade(index, 'gpaPoints', parseFloat(e.target.value))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            min="0"
                            max="4"
                            step="0.1"
                          />
                          <button
                            onClick={() => handleRemoveGrade(index)}
                            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Grading System'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

