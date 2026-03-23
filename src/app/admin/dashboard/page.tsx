"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { DashboardStats, RecentEnrollment, TopCourse } from "@/types";

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEnrollments, setRecentEnrollments] = useState<
    RecentEnrollment[]
  >([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsData, enrollmentsData, coursesData] = await Promise.all([
          api.getDashboardStats(),
          api.getRecentEnrollments(5),
          api.getTopCourses(4),
        ]);
        setStats(statsData);
        setRecentEnrollments(enrollmentsData);
        setTopCourses(coursesData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Students",
      value: stats?.totalStudents?.toLocaleString() || "0",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "blue",
    },
    {
      title: "Total Courses",
      value: stats?.totalCourses?.toString() || "0",
      change: "+5.2%",
      trend: "up",
      icon: BookOpen,
      color: "purple",
    },
    {
      title: "Active Enrollments",
      value: stats?.activeEnrollments?.toLocaleString() || "0",
      change: "+8.1%",
      trend: "up",
      icon: GraduationCap,
      color: "green",
    },
    {
      title: "Completion Rate",
      value: `${stats?.completionRate || 0}%`,
      change: "-2.3%",
      trend: "down",
      icon: TrendingUp,
      color: "orange",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="ADMIN" />

      <main className="ml-64">
        <Header
          title="Dashboard"
          subtitle="Welcome back, Admin! Here's what's happening today."
        />

        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${colorMap[stat.color]} bg-opacity-10`}
                  >
                    <stat.icon
                      className={`w-6 h-6 ${colorMap[stat.color].replace("bg-", "text-")}`}
                    />
                  </div>
                  <span
                    className={`flex items-center text-sm font-medium ${
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-slate-500 text-sm font-medium">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Enrollments */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Enrollments
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {recentEnrollments.length > 0 ? (
                  recentEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-medium">
                          {enrollment.student.firstName[0]}
                          {enrollment.student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {enrollment.student.firstName}{" "}
                            {enrollment.student.lastName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {enrollment.course.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            enrollment.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : enrollment.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {enrollment.status === "ACTIVE" && (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {enrollment.status === "COMPLETED" && (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {enrollment.status === "DROPPED" && (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {enrollment.status}
                        </span>
                        <p className="text-xs text-slate-400 mt-1 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(enrollment.enrolledAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500">
                    No recent enrollments
                  </div>
                )}
              </div>
            </div>

            {/* Top Courses */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">
                  Top Performing Courses
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {topCourses.length > 0 ? (
                  topCourses.map((course, index) => (
                    <div
                      key={course.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold text-sm">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-slate-900">
                            {course.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            {course._count.enrollments} students
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {course.instructor.firstName}{" "}
                          {course.instructor.lastName}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500">
                    No courses available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
