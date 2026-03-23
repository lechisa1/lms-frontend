"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  PlayCircle,
  CheckCircle,
  Calendar,
  ArrowRight,
  Flame,
  Target,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { StudentDashboard as StudentDashboardType } from "@/types";

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  yellow: "bg-yellow-500",
};

function formatLastAccessed(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] =
    useState<StudentDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await api.getStudentDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar role="STUDENT" />
        <main className="ml-64">
          <Header
            title="Student Dashboard"
            subtitle="Welcome back! Continue your learning journey."
          />
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const stats = dashboardData
    ? [
        {
          title: "Enrolled Courses",
          value: dashboardData.stats.enrolledCourses.toString(),
          icon: BookOpen,
          color: "blue",
        },
        {
          title: "Completed",
          value: dashboardData.stats.completed.toString(),
          icon: CheckCircle,
          color: "green",
        },
        {
          title: "In Progress",
          value: dashboardData.stats.inProgress.toString(),
          icon: PlayCircle,
          color: "purple",
        },
        {
          title: "Certificates",
          value: dashboardData.stats.certificates.toString(),
          icon: Award,
          color: "yellow",
        },
      ]
    : [];

  const myCourses = dashboardData?.myCourses || [];
  const recommendedCourses = dashboardData?.recommendedCourses || [];
  const certificates = dashboardData?.certificates || [];

  // Learning streak from API
  const weeklyActivity = dashboardData?.weeklyActivity;
  const learningStreak = weeklyActivity || {
    current: 0,
    longest: 0,
    thisWeek: [
      { day: "Mon", minutes: 0 },
      { day: "Tue", minutes: 0 },
      { day: "Wed", minutes: 0 },
      { day: "Thu", minutes: 0 },
      { day: "Fri", minutes: 0 },
      { day: "Sat", minutes: 0 },
      { day: "Sun", minutes: 0 },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="STUDENT" />

      <main className="ml-64">
        <Header
          title="Student Dashboard"
          subtitle="Welcome back! Continue your learning journey."
        />

        <div className="p-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Keep up the great work!
                </h2>
                <p className="text-blue-100">You're making great progress</p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
                <span className="font-semibold">
                  {learningStreak.current} day streak
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Courses */}
            <div className="lg:col-span-2 space-y-6">
              {/* Continue Learning */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Continue Learning
                  </h2>
                  <a
                    href="/student/courses"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                {myCourses.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>You haven't enrolled in any courses yet.</p>
                    <a
                      href="/student/courses/browse"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-block mt-2"
                    >
                      Browse courses
                    </a>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {myCourses.map((course) => (
                      <div
                        key={course.id}
                        className="p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-14 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-slate-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900">
                              {course.title}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {course.instructor
                                ? `${course.instructor.firstName} ${course.instructor.lastName}`
                                : "Unknown Instructor"}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-500">
                                {course.progress}%
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500">
                              {course.completedLessons}/{course.totalLessons}{" "}
                              lessons
                            </p>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatLastAccessed(course.lastAccessed)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended Courses */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Recommended For You
                  </h2>
                </div>
                {recommendedCourses.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    <p>No recommended courses available.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recommendedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-14 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900">
                              {course.title}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {course.instructor
                                ? `${course.instructor.firstName} ${course.instructor.lastName}`
                                : "Unknown Instructor"}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                              <span>{course.duration} hours</span>
                              <span className="px-2 py-0.5 bg-slate-100 rounded">
                                {course.level}
                              </span>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                            Enroll
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Learning Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  This Week
                </h2>
                <div className="flex items-end justify-between h-32 gap-1">
                  {learningStreak.thisWeek.map((day, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-full bg-blue-500 rounded-t-md transition-all"
                        style={{
                          height: `${Math.min((day.minutes / 90) * 100, 100)}%`,
                          minHeight: day.minutes > 0 ? "4px" : "0",
                        }}
                      />
                      <span className="text-xs text-slate-400">{day.day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-slate-500">
                      Goal: 30 min/day
                    </span>
                  </div>
                  <span className="text-sm font-medium text-green-500">
                    {
                      learningStreak.thisWeek.filter((d) => d.minutes > 0)
                        .length
                    }
                    /7 days
                  </span>
                </div>
              </div>

              {/* Upcoming Quizzes - Placeholder since not in API */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Upcoming Quizzes
                  </h2>
                </div>
                <div className="p-6 text-center text-slate-500">
                  <Target className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No upcoming quizzes</p>
                </div>
              </div>

              {/* Certificates */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Certificates
                  </h2>
                  <span className="text-sm text-slate-500">
                    {certificates.length} earned
                  </span>
                </div>
                {certificates.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Complete courses to earn certificates!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                      >
                        <p className="font-medium text-slate-900 text-sm">
                          {cert.courseTitle}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(cert.issueDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    ))}
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
