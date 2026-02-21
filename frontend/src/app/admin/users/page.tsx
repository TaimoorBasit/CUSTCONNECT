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
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
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
    fetchUsers();
    fetchRoles();
    fetchUniversities();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleRefresh = () => {
    fetchUsers();
  };

  const fetchUniversities = async () => {
    try {
      const data = await adminService.getUniversities();
      if (Array.isArray(data)) {
        setUniversities(data);
      } else {
        setUniversities([]);
      }
    } catch (error: any) {
      setUniversities([]);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers({ role: roleFilter !== 'all' ? roleFilter : undefined });
      setUsers(data.users.map((u: any) => ({
        ...u,
        roles: u.roles?.map((ur: any) => ({
          id: ur.role?.id || ur.id,
          name: ur.role?.name || ur.name
        })) || []
      })));
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load users');
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

  const handleAssignRole = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
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
    const displayId = identifier || 'this user';
    if (!confirm(`Reset password for ${displayId}?`)) return;
    try {
      const newPassword = await adminService.resetUserPassword(userId);
      toast.success(`Temporary Password: ${newPassword}`, { duration: 10000 });
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const handleDeleteUser = async (userId: string, identifier?: string | null) => {
    const displayId = identifier || 'this user';
    if (!confirm(`Permanently delete ${displayId}?`)) return;
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Syncing user directory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-0">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1a1b3b] to-indigo-900 p-8 shadow-2xl transition-all duration-700">
        <div className="absolute top-0 right-0 -m-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -m-12 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Identity <span className="text-indigo-400">Labs</span>
            </h1>
            <p className="text-indigo-100/60 font-medium max-w-xl leading-relaxed">
              Orchestrate user permissions, access levels, and organizational structures across the entire ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all hover:rotate-180 duration-500"
              title="Refresh Directory"
            >
              <ArrowPathIcon className="h-6 w-6 text-indigo-300" />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-3 px-8 py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[24px] font-black shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
            >
              <PlusIcon className="h-6 w-6" />
              Onboard User
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filtering */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white rounded-[24px] border border-gray-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm font-medium outline-none"
          />
        </div>
        <div className="relative md:w-72">
          <FunnelIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white rounded-[24px] border border-gray-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm font-black text-gray-900 outline-none appearance-none cursor-pointer"
          >
            <option value="all">ALL DEPARTMENTS</option>
            <option value="STUDENT">STUDENTS</option>
            <option value="CAFE_OWNER">CAFE OWNERS</option>
            <option value="BUS_OPERATOR">BUS OPERATORS</option>
            <option value="PRINTER_SHOP_OWNER">PRINTER SHOPS</option>
            <option value="SUPER_ADMIN">ADMINISTRATORS</option>
          </select>
        </div>
      </div>

      {/* Modern User Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center space-y-4">
            <div className="p-6 bg-gray-50 rounded-full">
              <UserCircleIcon className="h-12 w-12 text-gray-200" />
            </div>
            <p className="text-gray-400 font-black text-xl tracking-tight">No identities found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`group relative bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-indigo-500/10 ${!user.isActive && 'grayscale opacity-70'}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-[#1a1b3b] to-indigo-600 flex items-center justify-center shadow-indigo-500/20 shadow-xl ring-4 ring-white">
                      <span className="text-2xl font-black text-white">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                    {user.isVerified && (
                      <div className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-500 rounded-full border-2 border-white shadow-sm">
                        <CheckIcon className="h-3 w-3 text-white stroke-[4]" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 font-bold uppercase tracking-tight">
                      <span className="truncate max-w-[200px]">{user.email || user.username}</span>
                      {user.university && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg">
                          <AcademicCapIcon className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="text-[10px] text-gray-600 truncate max-w-[150px]">{user.university.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <span
                        key={role.id}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300"
                      >
                        {role.name === 'SUPER_ADMIN' ? 'PRO ADMIN' : role.name.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-[1px] bg-gray-100 hidden lg:block mx-2" />

                    <button
                      onClick={() => handleAssignRole(user)}
                      className="p-3.5 rounded-2xl bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95"
                      title="Adjust Permissions"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => handleResetPassword(user.id, user.email || user.username)}
                      className="p-3.5 rounded-2xl bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-all active:scale-95"
                      title="Reset Access Key"
                    >
                      <KeyIcon className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className={`p-3.5 rounded-2xl transition-all active:scale-95 ${user.isActive
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                        : 'bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white'
                        }`}
                      title={user.isActive ? 'Deactivate Account' : 'Reactivate Account'}
                    >
                      {user.isActive ? <CheckIcon className="h-5 w-5 stroke-[3]" /> : <XMarkIcon className="h-5 w-5 stroke-[3]" />}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(user.id, user.email || user.username)}
                      className="p-3.5 rounded-2xl bg-gray-50 text-gray-400 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                      title="Remove Identity"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {!user.isActive && (
                <div className="absolute top-0 right-10 flex">
                  <div className="px-4 py-1.5 bg-rose-500 rounded-b-2xl shadow-lg border border-rose-600 border-t-0">
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Access Restricted</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <RoleAssignmentModal
          user={selectedUser}
          availableRoles={availableRoles.filter(r => r.name !== 'SUPER_ADMIN')}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
          onSave={fetchUsers}
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          universities={universities}
          availableRoles={availableRoles.filter(r => r.name !== 'UNIVERSITY_ADMIN')}
          onClose={() => setShowCreateModal(false)}
          onSave={fetchUsers}
        />
      )}
    </div>
  );
}

function RoleAssignmentModal({
  user,
  availableRoles,
  onClose,
  onSave,
}: {
  user: User;
  availableRoles: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: () => void;
}) {
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const handleAssign = async () => {
    if (!selectedRoleId) {
      toast.error('Identity tier required');
      return;
    }
    try {
      await adminService.assignRole(user.id, selectedRoleId);
      toast.success('Permissions updated');
      onSave();
      setSelectedRoleId('');
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleRemoveRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Revoke ${roleName} from ${user.firstName}?`)) return;
    try {
      await adminService.removeRole(user.id, roleId);
      toast.success('Permission revoked');
      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-[#1a1b3b]/80 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-white rounded-[40px] shadow-2xl max-w-md w-full p-8 border border-white/20 overflow-hidden">
          <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 space-y-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                <KeyIcon className="h-8 w-8 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                Manage Access: <br /><span className="text-indigo-600">{user.firstName} {user.lastName}</span>
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Assign New Tier</label>
                <div className="flex gap-2">
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 appearance-none outline-none"
                  >
                    <option value="">CHOOSE PERMISSION...</option>
                    {availableRoles
                      .filter(role => !user.roles.some(r => r.id === role.id))
                      .map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name.replace('_', ' ')}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedRoleId}
                    className="p-4 bg-indigo-500 text-white rounded-2xl disabled:opacity-20 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    <PlusIcon className="h-6 w-6 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4 text-gray-900">Active Permissions</label>
                <div className="space-y-2">
                  {user.roles.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-2xl text-center italic text-gray-400 text-sm font-medium">No tiers assigned</div>
                  ) : (
                    user.roles.map((role) => (
                      <div key={role.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-rose-200 transition-colors group/row">
                        <span className="text-sm font-black text-gray-700 tracking-tight uppercase">
                          {role.name.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => handleRemoveRole(role.id, role.name)}
                          className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          title="Revoke Permission"
                        >
                          <XMarkIcon className="h-5 w-5 stroke-[3]" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black transition-all hover:bg-black"
            >
              Update Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateUserModal({
  universities,
  availableRoles,
  onClose,
  onSave,
}: {
  universities: Array<{ id: string; name: string }>;
  availableRoles: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    universityId: '',
    year: '',
    roleId: '',
    studentId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roleId) return toast.error('Role selection is mandatory');
    try {
      await adminService.createUser(formData);
      toast.success('Identity established');
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Creation failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-[#1a1b3b]/80 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-8 border border-white/20 overflow-hidden">
          <div className="absolute top-0 right-0 -m-12 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 space-y-8 text-gray-900">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Onboard Member</h2>
                <p className="text-gray-400 font-medium italic">Create a new platform identity</p>
              </div>
              <button onClick={onClose} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Full Identity</label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      required
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Credential Access</label>
                  <input
                    type="email"
                    required
                    placeholder="official@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4 text-gray-900">Temporary Password</label>
                  <input
                    type="text"
                    required
                    placeholder="Secret Key"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Department Tier</label>
                  <select
                    required
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none"
                  >
                    <option value="">SELECT ROLE...</option>
                    {availableRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Academic Origin</label>
                  <select
                    value={formData.universityId}
                    onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none"
                  >
                    <option value="">GLOBAL (NO ORG)</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">System ID / Semester</label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Student ID"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    />
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-1/3 px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 outline-none appearance-none"
                    >
                      <option value="">SEM</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full py-5 bg-gradient-to-r from-[#1a1b3b] to-indigo-700 text-white rounded-[24px] font-black shadow-2xl shadow-indigo-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Finalize Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

