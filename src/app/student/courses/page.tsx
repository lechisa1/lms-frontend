"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Enrollment, ProgressSummary } from "@/types";
import {
  BookOpen,
  Clock,
  Users,
  Play,
  CheckCircle,
  Loader2,
  ArrowRight,
  Trophy,
  TrendingUp,
} from "lucide-react";

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">(
    "ALL",
  );

  useEffect(() => {
    fetchMyEnrollments();
  }, []);

  const fetchMyEnrollments = async () => {
    try {
      setLoading(true);
      const data = await api.getMyEnrollments();
      setEnrollments(data || []);
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (filter === "ALL") return true;
    if (filter === "IN_PROGRESS") {
      return (
        enrollment.status === "ACTIVE" &&
        enrollment.progress &&
        enrollment.progress.progressPercent < 100
      );
    }
    if (filter === "COMPLETED") {
      return (
        enrollment.status === "COMPLETED" ||
        (enrollment.progress && enrollment.progress.progressPercent === 100)
      );
    }
    return true;
  });

  const getStatusBadge = (enrollment: Enrollment) => {
    if (
      enrollment.status === "COMPLETED" ||
      (enrollment.progress && enrollment.progress.progressPercent === 100)
    ) {
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      );
    }
    if (enrollment.status === "DROPPED") {
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
          Dropped
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
        <TrendingUp className="w-3 h-3" />
        In Progress
      </span>
    );
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "bg-green-500";
    if (percent >= 50) return "bg-blue-500";
    if (percent >= 25) return "bg-yellow-500";
    return "bg-slate-400";
  };

  const stats = {
    total: enrollments.length,
    inProgress: enrollments.filter(
      (e) =>
        e.status === "ACTIVE" &&
        (!e.progress || e.progress.progressPercent < 100),
    ).length,
    completed: enrollments.filter(
      (e) =>
        e.status === "COMPLETED" ||
        (e.progress && e.progress.progressPercent === 100),
    ).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="STUDENT" />

      <main className="ml-64">
        <Header
          title="My Courses"
          subtitle="Continue learning and track your progress"
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Enrolled</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">In Progress</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.inProgress}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Completed</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "ALL"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Courses ({stats.total})
              </button>
              <button
                onClick={() => setFilter("IN_PROGRESS")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "IN_PROGRESS"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                In Progress ({stats.inProgress})
              </button>
              <button
                onClick={() => setFilter("COMPLETED")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "COMPLETED"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Completed ({stats.completed})
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {filter === "ALL"
                  ? "No courses yet"
                  : filter === "IN_PROGRESS"
                    ? "No courses in progress"
                    : "No completed courses"}
              </h3>
              <p className="text-slate-500 mb-6">
                {filter === "ALL"
                  ? "Start exploring courses and enroll to begin learning"
                  : "Keep learning to complete more courses"}
              </p>
              <Link
                href="/student/courses/browse"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Course Thumbnail */}
                  <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    {enrollment.course?.thumbnail ? (
                      <img
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(enrollment)}
                    </div>
                    {enrollment.course?.category && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium px-2 py-1 rounded">
                        {enrollment.course.category.name}
                      </span>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      {enrollment.course?.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                      {enrollment.course?.description}
                    </p>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
                        {enrollment.course?.instructor?.firstName?.[0]}
                        {enrollment.course?.instructor?.lastName?.[0]}
                      </div>
                      <span className="text-sm text-slate-600">
                        {enrollment.course?.instructor?.firstName}{" "}
                        {enrollment.course?.instructor?.lastName}
                      </span>
                    </div>

                    {/* Progress */}
                    {enrollment.progress && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-500">Progress</span>
                          <span className="font-medium text-slate-900">
                            {enrollment.progress.completedLessons}/
                            {enrollment.progress.totalLessons} lessons
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(enrollment.progress.progressPercent)} transition-all duration-300`}
                            style={{
                              width: `${enrollment.progress.progressPercent}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {enrollment.progress.progressPercent}% complete
                        </p>
                      </div>
                    )}

                    {/* Course Stats */}
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{enrollment.course?.duration || 0} hours</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{enrollment.course?.enrollmentsCount || 0}</span>
                      </div>
                    </div>

                    {/* Enrolled Date */}
                    <div className="text-xs text-slate-500 mb-4">
                      Enrolled on{" "}
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/student/courses/${enrollment.course?.id}`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {enrollment.progress &&
                      enrollment.progress.progressPercent > 0 ? (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Continue Learning</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Start Learning</span>
                        </>
                      )}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
