"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import {
  BookOpen,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Star,
  FileText,
  Loader2,
  Calendar,
} from "lucide-react";

interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  isPublished: boolean;
  createdAt: string;
  studentCount: number;
  rating: number;
  lessonCount: number;
}

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getInstructorCourses();
      setCourses(data || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeleting(courseId);
      await api.deleteCourse(courseId);
      setCourses(courses.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("Failed to delete course:", err);
      alert("Failed to delete course. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const handlePublishToggle = async (course: InstructorCourse) => {
    try {
      if (course.isPublished) {
        await api.unpublishCourse(course.id);
      } else {
        await api.publishCourse(course.id);
      }
      setCourses(
        courses.map((c) =>
          c.id === course.id ? { ...c, isPublished: !course.isPublished } : c,
        ),
      );
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
      alert("Failed to update course status. Please try again.");
    }
  };

  const filteredCourses = courses.filter((course) => {
    // Filter by status
    if (filter === "PUBLISHED" && !course.isPublished) return false;
    if (filter === "DRAFT" && course.isPublished) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.isPublished).length,
    draft: courses.filter((c) => !c.isPublished).length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="INSTRUCTOR" />

      <main className="ml-64">
        <Header
          title="My Courses"
          subtitle="Manage your courses and track student enrollment"
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
                  <p className="text-sm text-slate-500">Total Courses</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Published</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.published}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Drafts</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.draft}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("ALL")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "ALL"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setFilter("PUBLISHED")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "PUBLISHED"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Published ({stats.published})
                </button>
                <button
                  onClick={() => setFilter("DRAFT")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "DRAFT"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Drafts ({stats.draft})
                </button>
              </div>

              {/* Create Button */}
              <Link
                href="/instructor/courses/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Course
              </Link>
            </div>
          </div>

          {/* Courses List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchQuery || filter !== "ALL"
                  ? "No courses found"
                  : "No courses yet"}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchQuery || filter !== "ALL"
                  ? "Try adjusting your search or filter criteria"
                  : "Start creating your first course to share with students"}
              </p>
              {!searchQuery && filter === "ALL" && (
                <Link
                  href="/instructor/courses/new"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Course
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                        Course
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                        Students
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                        Lessons
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                        Rating
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                        Created
                      </th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCourses.map((course) => (
                      <tr
                        key={course.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center flex-shrink-0">
                              {course.thumbnail ? (
                                <img
                                  src={course.thumbnail}
                                  alt={course.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <BookOpen className="w-6 h-6 text-slate-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-medium text-slate-900 truncate max-w-xs">
                                {course.title}
                              </h3>
                              {course.description && (
                                <p className="text-sm text-slate-500 truncate max-w-xs">
                                  {course.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              course.isPublished
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                course.isPublished
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              }`}
                            />
                            {course.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {course.studentCount}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {course.lessonCount}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {course.rating > 0 ? (
                            <div className="flex items-center gap-1.5 text-yellow-600">
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <span className="text-sm font-medium">
                                {course.rating.toFixed(1)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {formatDate(course.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handlePublishToggle(course)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                course.isPublished
                                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {course.isPublished ? "Unpublish" : "Publish"}
                            </button>
                            <Link
                              href={`/instructor/courses/${course.id}`}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Manage Course"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              disabled={deleting === course.id}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete Course"
                            >
                              {deleting === course.id ? (
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
        </div>
      </main>
    </div>
  );
}
