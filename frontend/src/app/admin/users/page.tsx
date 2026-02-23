'use client';

import { useState, useEffect } from 'react';
import UserCircleIcon from '@heroicons/react/24/outline/UserCircleIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import AcademicCapIcon from '@heroicons/react/24/outline/AcademicCapIcon';
import KeyIcon from '@heroicons/react/24/outline/KeyIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';

interface User {
  id: string;
  email?: string | null;
  username?: string | null;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isVerified: boolean;
  roles: Array<{ id: string; name: string }>;
  university?: { name: string };
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  STUDENT: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Student' },
  SUPER_ADMIN: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', label: 'Administrator' },
  CAFE_OWNER: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'Cafe Owner' },
  BUS_OPERATOR: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', label: 'Bus Operator' },
  PRINTER_SHOP_OWNER: { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE', label: 'Print Shop' },
};

function getRoleStyle(name: string) {
  return ROLE_COLORS[name] ?? { bg: '#F9FAFB', text: '#374151', border: '#E5E7EB', label: name.replace(/_/g, ' ') };
}

function UserAvatar({ user }: { user: User }) {
  const primaryRole = user.roles[0]?.name ?? 'STUDENT';
  const colors: Record<string, string> = {
    SUPER_ADMIN: '#A51C30',
    STUDENT: '#1a2744',
    CAFE_OWNER: '#D97706',
    BUS_OPERATOR: '#059669',
    PRINTER_SHOP_OWNER: '#7C3AED',
  };
  const bg = colors[primaryRole] ?? '#1a2744';
  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm relative"
      style={{ background: bg }}
    >
      {user.firstName[0]}{user.lastName[0]}
      {user.isVerified && (
        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border-2 border-white rounded-full flex items-center justify-center shadow-sm">
          <CheckIcon className="w-2.5 h-2.5 text-emerald-500" strokeWidth={3} />
        </span>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [universities, setUniversities] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchRoles();
    fetchUniversities();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(searchTerm, roleFilter !== 'all' ? roleFilter : undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter]);

  const fetchUniversities = async () => {
    try {
      const data = await adminService.getUniversities();
      setUniversities(Array.isArray(data) ? data : []);
    } catch {
      setUniversities([]);
    }
  };

  const fetchUsers = async (search?: string, role?: string) => {
    try {
      setLoading(true);
      const data = await adminService.getUsers({ search, role, limit: 50 });
      setUsers(data.users.map((u: any) => ({
        ...u,
        roles: u.roles?.map((ur: any) => ({
          id: ur.role?.id || ur.id,
          name: ur.role?.name || ur.name,
        })) || [],
      })));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const roles = await adminService.getRoles();
      setAvailableRoles(roles);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load roles');
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await adminService.toggleUserActive(userId, isActive);
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleResetPassword = async (userId: string, identifier?: string | null) => {
    if (!confirm(`Reset password for ${identifier || 'this user'}?`)) return;
    try {
      const newPassword = await adminService.resetUserPassword(userId);
      toast.success(`Temporary Password: ${newPassword}`, { duration: 10000 });
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const handleDeleteUser = async (userId: string, identifier?: string | null) => {
    if (!confirm(`Permanently delete ${identifier || 'this user'}?`)) return;
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4]">

      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1a2744] flex items-center justify-center flex-shrink-0 shadow-sm">
              <UsersIcon className="w-6 h-6 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1a2744] tracking-tight">User Management</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {loading ? 'Loading…' : `${users.length} user${users.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchUsers(searchTerm, roleFilter !== 'all' ? roleFilter : undefined)}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#1a2744] transition-colors"
              title="Refresh"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" strokeWidth={2.5} />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* ── FILTERS ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or username…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/10 focus:border-[#1a2744]/30 bg-white"
            />
          </div>
          {/* Role filter */}
          <div className="relative sm:w-56">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/10 focus:border-[#1a2744]/30 bg-white appearance-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="CAFE_OWNER">Cafe Owners</option>
              <option value="BUS_OPERATOR">Bus Operators</option>
              <option value="PRINTER_SHOP_OWNER">Print Shop Owners</option>
              <option value="SUPER_ADMIN">Administrators</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── USER TABLE ──────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-10 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-[#A51C30] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading users…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
              <UserCircleIcon className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">No users found</p>
            <p className="text-xs text-gray-300">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_auto] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Name</span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email / Username</span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Role</span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex flex-col md:grid md:grid-cols-[2fr_2fr_1fr_auto] gap-4 items-start md:items-center px-6 py-4 hover:bg-gray-50/60 transition-colors group ${!user.isActive ? 'opacity-50' : ''}`}
                >
                  {/* Name + avatar */}
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar user={user} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#1a2744] transition-colors">
                        {user.firstName} {user.lastName}
                      </p>
                      {user.university && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <AcademicCapIcon className="w-3 h-3 text-gray-300 flex-shrink-0" />
                          <span className="text-[11px] text-gray-400 truncate">{user.university.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="min-w-0 md:block pl-14 md:pl-0">
                    <p className="text-sm text-gray-500 truncate">{user.email || user.username || '—'}</p>
                    {!user.isActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-500 mt-0.5">
                        <XMarkIcon className="w-3 h-3" /> Disabled
                      </span>
                    )}
                  </div>

                  {/* Roles */}
                  <div className="flex flex-wrap gap-1.5 pl-14 md:pl-0">
                    {user.roles.length === 0 ? (
                      <span className="text-xs text-gray-300 italic">No role</span>
                    ) : user.roles.map((role) => {
                      const s = getRoleStyle(role.name);
                      return (
                        <span
                          key={role.id}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
                          style={{ background: s.bg, color: s.text, borderColor: s.border }}
                        >
                          {s.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 pl-14 md:pl-0 flex-shrink-0">
                    {/* Edit role */}
                    <button
                      onClick={() => { setSelectedUser(user); setShowRoleModal(true); }}
                      className="p-2 rounded-lg text-gray-400 hover:bg-[#1a2744]/5 hover:text-[#1a2744] transition-colors"
                      title="Edit roles"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>

                    {/* Reset password */}
                    <button
                      onClick={() => handleResetPassword(user.id, user.email || user.username)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                      title="Reset password"
                    >
                      <KeyIcon className="w-4 h-4" />
                    </button>

                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className={`p-2 rounded-lg transition-colors ${user.isActive
                        ? 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600'
                        : 'text-rose-400 hover:bg-rose-50 hover:text-rose-600'}`}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive
                        ? <CheckIcon className="w-4 h-4" strokeWidth={2.5} />
                        : <XMarkIcon className="w-4 h-4" strokeWidth={2.5} />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email || user.username)}
                      className="p-2 rounded-lg text-gray-300 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                      title="Delete user"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────── */}
      {showRoleModal && selectedUser && (
        <RoleAssignmentModal
          user={selectedUser}
          availableRoles={availableRoles.filter((r) => r.name !== 'SUPER_ADMIN')}
          onClose={() => { setShowRoleModal(false); setSelectedUser(null); }}
          onSave={fetchUsers}
        />
      )}

      {showCreateModal && (
        <CreateUserModal
          universities={universities}
          availableRoles={availableRoles.filter((r) => r.name !== 'UNIVERSITY_ADMIN')}
          onClose={() => setShowCreateModal(false)}
          onSave={fetchUsers}
        />
      )}
    </div>
  );
}

/* ─── Role Assignment Modal ───────────────────────────────────────────── */
function RoleAssignmentModal({
  user, availableRoles, onClose, onSave,
}: {
  user: User;
  availableRoles: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: () => void;
}) {
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const handleAssign = async () => {
    if (!selectedRoleId) return toast.error('Please select a role');
    try {
      await adminService.assignRole(user.id, selectedRoleId);
      toast.success('Role assigned');
      onSave();
      setSelectedRoleId('');
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleRemoveRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Remove ${roleName.replace(/_/g, ' ')} from ${user.firstName}?`)) return;
    try {
      await adminService.removeRole(user.id, roleId);
      toast.success('Role removed');
      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1a2744] flex items-center justify-center">
              <KeyIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Manage Roles</p>
              <p className="text-xs text-gray-400">{user.firstName} {user.lastName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Current roles */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Roles</p>
            {user.roles.length === 0 ? (
              <p className="text-sm text-gray-300 italic">No roles assigned</p>
            ) : (
              <div className="space-y-2">
                {user.roles.map((role) => {
                  const s = getRoleStyle(role.name);
                  return (
                    <div key={role.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl border" style={{ borderColor: s.border, background: s.bg }}>
                      <span className="text-sm font-semibold" style={{ color: s.text }}>{s.label}</span>
                      <button
                        onClick={() => handleRemoveRole(role.id, role.name)}
                        className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add role */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Add Role</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/10 bg-white appearance-none cursor-pointer"
                >
                  <option value="">Select role…</option>
                  {availableRoles
                    .filter((role) => !user.roles.some((r) => r.id === role.id))
                    .map((role) => (
                      <option key={role.id} value={role.id}>{role.name.replace(/_/g, ' ')}</option>
                    ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={handleAssign}
                disabled={!selectedRoleId}
                className="px-4 py-2.5 rounded-xl bg-[#1a2744] text-white text-sm font-semibold disabled:opacity-30 hover:bg-[#243456] transition-colors"
              >
                Assign
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Create User Modal ───────────────────────────────────────────────── */
function CreateUserModal({
  universities, availableRoles, onClose, onSave,
}: {
  universities: Array<{ id: string; name: string }>;
  availableRoles: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
    universityId: '', year: '', roleId: '', studentId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roleId) return toast.error('Role is required');
    try {
      await adminService.createUser(formData);
      toast.success('User created successfully');
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Creation failed');
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/10 focus:border-[#1a2744]/30 bg-white";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden my-4">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#A51C30] flex items-center justify-center">
              <PlusIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Add New User</p>
              <p className="text-xs text-gray-400">Create a new account on the portal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text" required placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text" required placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email" required placeholder="student@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div>
            <label className={labelClass}>Temporary Password</label>
            <input
              type="text" required placeholder="Set an initial password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Role + University */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Role</label>
              <div className="relative">
                <select
                  required value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className={inputClass + ' appearance-none cursor-pointer'}
                >
                  <option value="">Select role…</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelClass}>University</label>
              <div className="relative">
                <select
                  value={formData.universityId}
                  onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                  className={inputClass + ' appearance-none cursor-pointer'}
                >
                  <option value="">None</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Student ID + Semester */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Student ID (optional)</label>
              <input
                type="text" placeholder="e.g. 2023-CS-001"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Semester (optional)</label>
              <div className="relative">
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className={inputClass + ' appearance-none cursor-pointer'}
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#A51C30] text-white text-sm font-semibold hover:bg-[#8b1526] transition-colors shadow-sm"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
