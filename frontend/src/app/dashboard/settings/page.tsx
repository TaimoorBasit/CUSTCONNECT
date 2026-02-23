'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import KeyIcon from '@heroicons/react/24/outline/KeyIcon';
import UserCircleIcon from '@heroicons/react/24/outline/UserCircleIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { getImageUrl, getUiAvatarUrl } from '@/utils/url';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null | undefined>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    studentId: user?.studentId || '',
    year: user?.year?.toString() || '',
    departmentId: user?.departmentId || '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        studentId: user.studentId || '',
        year: user.year?.toString() || '',
        departmentId: user.departmentId || '',
      });
      if (user.profileImage) {
        setImagePreview(getImageUrl(user.profileImage));
      } else {
        setImagePreview(getUiAvatarUrl(user.firstName, user.lastName));
      }
    }
  }, [user]);

  useEffect(() => {
    if (user?.universityId) fetchDepartments();
  }, [user?.universityId]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/departments`, {
        headers: { Authorization: `Bearer ${token?.trim()}` },
      });
      if (response.data.success) setDepartments(response.data.departments || []);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
      if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) { toast.error('Please select an image'); return; }
    try {
      setUploadingImage(true);
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post(`${API_URL}/users/profile/picture`, formData, {
        headers: { Authorization: `Bearer ${token?.trim()}` },
        timeout: 30000,
      });
      if (response.data.success) {
        toast.success('Profile picture updated!');
        await updateProfile(response.data.user);
        setImagePreview(getImageUrl(response.data.user.profileImage));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordData.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    try {
      setLoading(true);
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        studentId: profileData.studentId || undefined,
        year: profileData.year ? parseInt(profileData.year) : undefined,
        departmentId: profileData.departmentId || undefined,
      });
      toast.success('Profile updated!');
      setShowProfileForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]/30 transition';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#F0F3FA] flex items-center justify-center">
          <UserCircleIcon className="h-5 w-5 text-[#1a2744]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1a2744]">Settings</h1>
          <p className="text-sm text-gray-400">Manage your account preferences</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-[#1a2744] flex items-center gap-2">
              <UserCircleIcon className="h-4 w-4 text-[#1a2744]" />
              Profile Information
            </h2>
            <button
              onClick={() => {
                setProfileData({
                  firstName: user?.firstName || '',
                  lastName: user?.lastName || '',
                  studentId: user?.studentId || '',
                  year: user?.year?.toString() || '',
                  departmentId: user?.departmentId || '',
                });
                setShowProfileForm(!showProfileForm);
              }}
              className="text-xs font-semibold text-[#A51C30] hover:text-[#8b1526] transition-colors"
            >
              {showProfileForm ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Profile Picture */}
          <div className="mb-5 pb-5 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">Profile Photo</p>
            <div className="flex items-center gap-4">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=1a2744&color=fff`;
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#F0F3FA] flex items-center justify-center">
                    <UserCircleIcon className="w-8 h-8 text-[#1a2744]/30" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <PhotoIcon className="w-3.5 h-3.5" />
                    Choose
                  </button>
                  {imagePreview && imagePreview !== getImageUrl(user?.profileImage) && (
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1a2744] rounded-lg hover:bg-[#14203a] disabled:opacity-50 transition-colors"
                    >
                      {uploadingImage ? 'Uploading…' : 'Upload'}
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-[10px] text-gray-400">JPG, PNG or GIF · max 5MB</p>
              </div>
            </div>
          </div>

          {!showProfileForm ? (
            <dl className="space-y-3">
              {[
                { label: 'Full Name', value: `${user?.firstName} ${user?.lastName}` },
                { label: 'Email', value: user?.email },
                ...(user?.studentId ? [{ label: 'Student ID', value: user.studentId }] : []),
                { label: 'University', value: user?.university?.name ?? 'Not linked yet' },
                ...(user?.department ? [{ label: 'Department', value: user.department.name }] : []),
                ...(user?.year ? [{ label: 'Year', value: `Year ${user.year}` }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                  <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wide w-28 flex-shrink-0">{label}</dt>
                  <dd className="text-sm text-gray-900 font-medium text-right">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">First Name *</label>
                <input type="text" value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} required className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Last Name *</label>
                <input type="text" value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} required className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Student ID</label>
                <input type="text" value={profileData.studentId} onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value })} className={inputCls} />
              </div>
              {user?.universityId && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Department</label>
                  <select
                    value={profileData.departmentId}
                    onChange={(e) => setProfileData({ ...profileData, departmentId: e.target.value })}
                    disabled={loadingDepartments}
                    className={inputCls}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Year</label>
                <select value={profileData.year} onChange={(e) => setProfileData({ ...profileData, year: e.target.value })} className={inputCls}>
                  <option value="">Select Year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1a2744] hover:bg-[#14203a] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>

        {/* Change Password */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-[#1a2744] flex items-center gap-2">
              <KeyIcon className="h-4 w-4 text-[#1a2744]" />
              Change Password
            </h2>
            <button
              onClick={() => {
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setShowPasswordForm(!showPasswordForm);
              }}
              className="text-xs font-semibold text-[#A51C30] hover:text-[#8b1526] transition-colors"
            >
              {showPasswordForm ? 'Cancel' : 'Change'}
            </button>
          </div>

          {!showPasswordForm ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F0F3FA] flex items-center justify-center">
                <KeyIcon className="w-6 h-6 text-[#1a2744]/40" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Click <span className="font-semibold text-[#A51C30]">Change</span> above to update your password.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Current Password *</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">New Password *</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={8}
                  className={inputCls}
                />
                <p className="mt-1 text-[10px] text-gray-400">Minimum 8 characters</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Confirm New Password *</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  className={inputCls}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Changing…' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
