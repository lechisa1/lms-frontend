"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import {
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  PlayCircle,
  FileText,
  Star,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
};

interface InstructorStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  avgRating: number;
}

interface InstructorCourse {
  id: string;
  title: string;
  isPublished: boolean;
  studentCount: number;
  rating: number;
  lessonCount: number;
  thumbnail?: string;
}

interface RecentStudent {
  id: string;
  studentName: string;
  courseTitle: string;
  enrolledAt: string;
  progress: number;
}

export default function InstructorDashboard() {
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [myCourses, setMyCourses] = useState<InstructorCourse[]>([]);
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsData, coursesData, studentsData] = await Promise.all([
          api.getInstructorStats(),
          api.getInstructorCourses(),
          api.getInstructorRecentStudents(),
        ]);
        setStats(statsData);
        setMyCourses(coursesData);
        setRecentStudents(studentsData);
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
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar role="INSTRUCTOR" />
        <main className="ml-64">
          <Header
            title="Instructor Dashboard"
            subtitle="Welcome back! Here's your teaching overview."
          />
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-500">Loading dashboard data...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar role="INSTRUCTOR" />
        <main className="ml-64">
          <Header
            title="Instructor Dashboard"
            subtitle="Welcome back! Here's your teaching overview."
          />
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-red-500">{error}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const statsData = [
    {
      title: "My Courses",
      value: stats?.totalCourses?.toString() || "0",
      subtitle: `${stats?.publishedCourses || 0} published`,
      icon: BookOpen,
      color: "blue",
    },
    {
      title: "Total Students",
      value: stats?.totalStudents?.toLocaleString() || "0",
      subtitle: "Enrolled in your courses",
      icon: Users,
      color: "green",
    },
    {
      title: "Avg. Rating",
      value: stats?.avgRating?.toString() || "0",
      subtitle: "Based on reviews",
      icon: Star,
      color: "yellow",
    },
    {
      title: "Total Revenue",
      value: "$0",
      subtitle: "Coming soon",
      icon: TrendingUp,
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="INSTRUCTOR" />

      <main className="ml-64">
        <Header
          title="Instructor Dashboard"
          subtitle="Welcome back! Here's your teaching overview."
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
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                </div>
                <h3 className="text-slate-500 text-sm font-medium">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Courses */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  My Courses
                </h2>
                <Link
                  href="/instructor/courses"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              {myCourses.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  No courses yet. Create your first course!
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
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900">
                              {course.title}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                course.isPublished
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {course.isPublished ? "published" : "draft"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {course.studentCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {course.lessonCount} lessons
                            </span>
                            {course.rating > 0 && (
                              <span className="flex items-center gap-1 text-yellow-600">
                                <Star className="w-4 h-4" />
                                {course.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Students */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Recent Students
                  </h2>
                </div>
                {recentStudents.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    No students yet
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentStudents.slice(0, 4).map((student) => (
                      <div key={student.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">
                            {student.studentName}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDate(student.enrolledAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">
                          {student.courseTitle}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {student.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Lessons (placeholder) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Quick Actions
                  </h2>
                </div>
                <div className="p-4 space-y-2">
                  <Link
                    href="/instructor/courses/new"
                    className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    + Create New Course
                  </Link>
                  <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors text-sm font-medium">
                    View Analytics
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors text-sm font-medium">
                    Manage Quizzes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
