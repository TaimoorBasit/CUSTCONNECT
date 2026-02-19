'use client';

import { useState, useEffect } from 'react';
import UserCircleIcon from '@heroicons/react/24/outline/UserCircleIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
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

  // Refresh users list
  const handleRefresh = () => {
    fetchUsers();
  };

  const fetchUniversities = async () => {
    try {
      const data = await adminService.getUniversities();
      if (Array.isArray(data)) {
        setUniversities(data);
      } else {
        console.error('Universities data is not an array:', data);
        setUniversities([]);
      }
    } catch (error: any) {
      console.error('Failed to load universities:', error);
      setUniversities([]);
    }
  };

  const fetchUsers = async () => {
    try {
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
      console.error('Fetch users error:', error);
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
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const handleResetPassword = async (userId: string, identifier?: string | null) => {
    const displayId = identifier || 'this user';
    if (!confirm(`Reset password for ${displayId}? A temporary password will be generated.`)) return;
    try {
      const newPassword = await adminService.resetUserPassword(userId);
      toast.success(`Password reset! New temporary password: ${newPassword}. User should change it on first login.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const handleDeleteUser = async (userId: string, identifier?: string | null) => {
    const displayId = identifier || 'this user';
    if (!confirm(`Are you sure you want to permanently delete user ${displayId}? This action cannot be undone.`)) return;
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    // Role filtering is now done on the server side
    return matchesSearch;
  });

  if (loading) {
    return <div className="text-center py-12 text-gray-900">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage users, assign roles, and control access.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            title="Refresh users list"
          >
            <ArrowPathIcon className="mr-2 h-5 w-5" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Create User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="CAFE_OWNER">Cafe Owner</option>
            <option value="BUS_OPERATOR">Bus Operator</option>
            <option value="PRINTER_SHOP_OWNER">Printer Shop Owner</option>
            <option value="SUPER_ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email || user.username || 'No contact info'}
                      </div>
                      {user.university && (
                        <div className="text-xs text-gray-400">{user.university.name}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {user.roles.map((role) => (
                        <span
                          key={role.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {role.name === 'SUPER_ADMIN' ? 'Admin' : role.name.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAssignRole(user)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Assign Role"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id, user.email || user.username)}
                        className="text-purple-600 hover:text-purple-800"
                        title="Reset Password"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        className={user.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          <XMarkIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email || user.username)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete User"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
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
      toast.error('Please select a role');
      return;
    }
    try {
      await adminService.assignRole(user.id, selectedRoleId);
      toast.success('Role assigned successfully');
      onSave();
      setSelectedRoleId('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign role');
    }
  };

  const handleRemoveRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Remove ${roleName.replace('_', ' ')} role from ${user.firstName} ${user.lastName}?`)) return;
    try {
      await adminService.removeRole(user.id, roleId);
      toast.success('Role removed successfully');
      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove role');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Assign Role to {user.firstName} {user.lastName}</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose a role...</option>
              {availableRoles
                .filter(role =>
                  !user.roles.some(r => r.id === role.id) &&
                  role.name !== 'SUPER_ADMIN' // Don't allow assigning SUPER_ADMIN role
                )
                .map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name === 'SUPER_ADMIN' ? 'Admin' : role.name.replace('_', ' ')}
                  </option>
                ))}
            </select>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Current Roles:</p>
            <div className="space-y-2">
              {user.roles.length === 0 ? (
                <p className="text-sm text-gray-500">No roles assigned</p>
              ) : (
                user.roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {role.name === 'SUPER_ADMIN' ? 'Admin' : role.name.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => handleRemoveRole(role.id, role.name)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      title="Remove role"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
            >
              Done
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedRoleId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Role
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
    try {
      await adminService.createUser(formData);
      toast.success('User created successfully');
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Create New User</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Temporary password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <select
                  value={formData.universityId}
                  onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select university (optional)...</option>
                  {universities.length > 0 ? (
                    universities.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))
                  ) : (
                    <option value="" disabled>Loading universities...</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  required
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select role...</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name === 'SUPER_ADMIN' ? 'Admin' : role.name.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-500">Select Semester</option>
                  <option value="1" className="text-gray-900">Semester 1</option>
                  <option value="2" className="text-gray-900">Semester 2</option>
                  <option value="3" className="text-gray-900">Semester 3</option>
                  <option value="4" className="text-gray-900">Semester 4</option>
                  <option value="5" className="text-gray-900">Semester 5</option>
                  <option value="6" className="text-gray-900">Semester 6</option>
                  <option value="7" className="text-gray-900">Semester 7</option>
                  <option value="8" className="text-gray-900">Semester 8</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

