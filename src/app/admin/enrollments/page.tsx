"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Enrollment } from "@/types";
import {
  Search,
  Eye,
  Trash2,
  ClipboardList,
  Loader2,
  AlertCircle,
  Filter,
  User,
  BookOpen,
} from "lucide-react";

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await api.getAllEnrollments();
      setEnrollments(data);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch enrollments";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this enrollment? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(id);
      await api.deleteEnrollment(id);
      setEnrollments(enrollments.filter((e) => e.id !== id));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete enrollment";
      alert(message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.student?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enrollment.student?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enrollment.student?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enrollment.course?.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter
      ? enrollment.status === statusFilter
      : true;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700";
      case "DROPPED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar role="ADMIN" />
        <main className="ml-64">
          <Header
            title="Enrollments"
            subtitle="Manage student course enrollments"
          />
          <div className="p-6 flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
          title="Enrollments"
          subtitle="Manage student course enrollments"
        />
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="DROPPED">Dropped</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No enrollments found
              </h3>
              <p className="text-slate-600">
                {searchTerm || statusFilter
                  ? "Try adjusting your filters"
                  : "Enrollments will appear here when students enroll in courses"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                        Student
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                        Course
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                        Enrolled Date
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                        Progress
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {enrollment.student?.firstName}{" "}
                                {enrollment.student?.lastName}
                              </p>
                              <p className="text-sm text-slate-500">
                                {enrollment.student?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-slate-400" />
                            <Link
                              href={`/admin/courses/${enrollment.courseId}`}
                              className="text-slate-900 hover:text-blue-600"
                            >
                              {enrollment.course?.title}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{
                                  width: `${enrollment.progress?.progressPercent || 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-slate-600">
                              {enrollment.progress?.progressPercent || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              enrollment.status,
                            )}`}
                          >
                            {enrollment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/enrollments/${enrollment.id}`}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Link>
                            <button
                              onClick={() => handleDelete(enrollment.id)}
                              disabled={deleteLoading === enrollment.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {deleteLoading === enrollment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {enrollments.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-slate-900">
                  {enrollments.length}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {enrollments.filter((e) => e.status === "ACTIVE").length}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {enrollments.filter((e) => e.status === "COMPLETED").length}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
