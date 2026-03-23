"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { User, UserRole } from "@/types";
import {
  ArrowLeft,
  Save,
  User as UserIcon,
  Mail,
  Shield,
  AlertCircle,
} from "lucide-react";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "" as UserRole | "",
    isActive: true,
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await api.getUser(id);
      setUser(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      });
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch user";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) return;

    try {
      setSaving(true);
      setError(null);
      await api.updateUser(id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role as UserRole,
        isActive: formData.isActive,
      });
      setSuccess("User updated successfully");
      setTimeout(() => {
        router.push(`/admin/users/${id}`);
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update user";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar role="ADMIN" />
        <main className="ml-64">
          <Header title="Edit User" subtitle="Loading user information..." />
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-500">Loading...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar role="ADMIN" />
        <main className="ml-64">
          <Header title="Edit User" subtitle="Error loading user" />
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Users
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="ADMIN" />

      <main className="ml-64">
        <Header
          title="Edit User"
          subtitle={`Editing ${user?.firstName} ${user?.lastName}`}
        />

        <div className="p-6">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href={`/admin/users/${id}`}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to User Details
            </Link>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Edit Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">
                    User Information
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Update the user's account information below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Avatar Preview */}
                  <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-2xl">
                      {formData.firstName ? formData.firstName[0] : ""}
                      {formData.lastName ? formData.lastName[0] : ""}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {formData.firstName} {formData.lastName}
                      </p>
                      <p className="text-sm text-slate-500">{formData.email}</p>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          id="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleChange("firstName", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          id="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleChange("lastName", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => handleChange("role", e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        required
                      >
                        <option value="">Select a role</option>
                        <option value="ADMIN">Admin</option>
                        <option value="INSTRUCTOR">Instructor</option>
                        <option value="STUDENT">Student</option>
                      </select>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Admin: Full system access | Instructor: Can create courses
                      | Student: Can enroll in courses
                    </p>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        handleChange("isActive", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-slate-200 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm text-slate-700"
                    >
                      <span className="font-medium">Active Account</span>
                      <span className="text-slate-500 ml-1">
                        - User can log in and access the system
                      </span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Link
                      href={`/admin/users/${id}`}
                      className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Help Card */}
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Editing User
                </h3>
                <p className="text-sm text-blue-700">
                  Update the user's information here. Changes will be saved
                  immediately when you click "Save Changes".
                </p>
              </div>

              {/* User Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Current Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500">User ID</p>
                    <p className="font-mono text-xs text-slate-700 bg-slate-50 p-2 rounded mt-1">
                      {user?.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Current Role</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        user?.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : user?.role === "INSTRUCTOR"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user?.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Current Status</p>
                    <p
                      className={`font-medium mt-1 ${user?.isActive ? "text-green-600" : "text-red-600"}`}
                    >
                      {user?.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
