"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Enrollment } from "@/types";
import {
  ArrowLeft,
  Trash2,
  User,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";

export default function EnrollmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const enrollmentId = params.id as string;

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollment();
    }
  }, [enrollmentId]);

  const fetchEnrollment = async () => {
    try {
      setLoading(true);
      const data = await api.getEnrollment(enrollmentId);
      setEnrollment(data);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch enrollment";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this enrollment? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(true);
      await api.deleteEnrollment(enrollmentId);
      router.push("/admin/enrollments");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete enrollment";
      alert(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (
    newStatus: "ACTIVE" | "COMPLETED" | "DROPPED",
  ) => {
    if (
      !confirm(`Are you sure you want to change the status to ${newStatus}?`)
    ) {
      return;
    }

    try {
      setStatusLoading(true);
      const updated = await api.updateEnrollmentStatus(enrollmentId, newStatus);
      setEnrollment({ ...enrollment!, status: updated.status });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update status";
      alert(message);
    } finally {
      setStatusLoading(false);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Clock className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "DROPPED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar role="ADMIN" />
        <main className="ml-64">
          <Header
            title="Enrollment Details"
            subtitle="Loading enrollment information..."
          />
          <div className="p-6 flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar role="ADMIN" />
        <main className="ml-64">
          <Header
            title="Enrollment Details"
            subtitle="Error loading enrollment"
          />
          <div className="p-6 flex flex-col items-center justify-center h-64">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-slate-600 mb-4">
              {error || "Enrollment not found"}
            </p>
            <Link
              href="/admin/enrollments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Enrollments
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
          title="Enrollment Details"
          subtitle="View and manage this enrollment"
        />
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <Link
                href="/admin/enrollments"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Enrollments
              </Link>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Student Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-medium text-slate-900">
                    {enrollment.student?.firstName}{" "}
                    {enrollment.student?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium text-slate-900">
                    {enrollment.student?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Role</p>
                  <p className="font-medium text-slate-900">
                    {enrollment.student?.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Course Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Course Title</p>
                  <Link
                    href={`/admin/courses/${enrollment.courseId}`}
                    className="font-medium text-slate-900 hover:text-blue-600"
                  >
                    {enrollment.course?.title}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Price</p>
                  <p className="font-medium text-slate-900">
                    ${enrollment.course?.price?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Instructor</p>
                  <p className="font-medium text-slate-900">
                    {enrollment.course?.instructor?.firstName}{" "}
                    {enrollment.course?.instructor?.lastName}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Enrollment Status
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Current Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                        enrollment.status,
                      )}`}
                    >
                      {getStatusIcon(enrollment.status)}
                      {enrollment.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Enrolled Date</p>
                  <p className="font-medium text-slate-900">
                    {new Date(enrollment.enrolledAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
                {enrollment.completedAt && (
                  <div>
                    <p className="text-sm text-slate-500">Completed Date</p>
                    <p className="font-medium text-slate-900">
                      {new Date(enrollment.completedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Progress
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-500">Overall Progress</p>
                    <p className="text-sm font-medium text-slate-900">
                      {enrollment.progress?.progressPercent || 0}%
                    </p>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{
                        width: `${enrollment.progress?.progressPercent || 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Completed Lessons</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {enrollment.progress?.completedLessons || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Lessons</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {enrollment.progress?.totalLessons || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Change Status
            </h2>
            <p className="text-slate-600 mb-4">
              Manually update the enrollment status. Use this to mark courses as
              completed or handle dropped enrollments.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={statusLoading || enrollment.status === "ACTIVE"}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark Active
              </button>
              <button
                onClick={() => handleStatusChange("COMPLETED")}
                disabled={statusLoading || enrollment.status === "COMPLETED"}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark Completed
              </button>
              <button
                onClick={() => handleStatusChange("DROPPED")}
                disabled={statusLoading || enrollment.status === "DROPPED"}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark Dropped
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
