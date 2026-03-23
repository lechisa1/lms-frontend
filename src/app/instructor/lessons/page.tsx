"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Course, Lesson } from "@/types";
import {
  BookOpen,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Loader2,
  Clock,
  FileText,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

interface CourseWithLessons extends Course {
  lessons?: Lesson[];
}

interface InstructorLesson extends Lesson {
  courseTitle?: string;
}

export default function InstructorLessonsPage() {
  const [courses, setCourses] = useState<CourseWithLessons[]>([]);
  const [allLessons, setAllLessons] = useState<InstructorLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "by-course">("list");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const coursesData = await api.getInstructorCourses();
      setCourses(coursesData || []);

      // Fetch lessons for each course
      const lessonsPromises = (coursesData || []).map((course: Course) =>
        api.getLessons(course.id).catch(() => []),
      );
      const lessonsResults = await Promise.all(lessonsPromises);

      // Flatten lessons with course info
      const flattenedLessons: InstructorLesson[] = [];
      (coursesData || []).forEach((course: Course, index: number) => {
        const courseLessons = lessonsResults[index] || [];
        courseLessons.forEach((lesson) => {
          flattenedLessons.push({
            ...lesson,
            courseTitle: course.title,
          });
        });
      });

      setAllLessons(flattenedLessons);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string, courseId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this lesson? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeleting(lessonId);
      await api.deleteLesson(courseId, lessonId);
      // Refresh data
      await fetchData();
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      alert("Failed to delete lesson. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const filteredLessons = allLessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = courseFilter
      ? lesson.courseId === courseFilter
      : true;

    return matchesSearch && matchesCourse;
  });

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getLessonCount = (courseId: string) => {
    return allLessons.filter((l) => l.courseId === courseId).length;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar role="INSTRUCTOR" />
      <div className="ml-64">
        <Header title="Lessons" />

        <main className="p-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Manage Lessons</h1>
              <p className="text-slate-400 mt-1">
                Create and manage lessons for your courses
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode("by-course")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "by-course"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                By Course
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-800 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Empty State */}
          {courses.length === 0 && (
            <div className="bg-slate-800 rounded-xl p-12 text-center">
              <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Courses Yet
              </h3>
              <p className="text-slate-400 mb-6">
                Create your first course to start adding lessons.
              </p>
              <Link
                href="/instructor/courses/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Course
              </Link>
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && courses.length > 0 && (
            <div className="bg-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Lesson
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredLessons.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-slate-400"
                        >
                          No lessons found. Create your first lesson by
                          selecting a course below.
                        </td>
                      </tr>
                    ) : (
                      filteredLessons.map((lesson) => (
                        <tr
                          key={lesson.id}
                          className="hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-500" />
                              </div>
                              <div>
                                <p className="font-medium text-white">
                                  {lesson.title}
                                </p>
                                <p className="text-sm text-slate-400 truncate max-w-xs">
                                  {lesson.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-300">
                              {lesson.courseTitle}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-300">
                              #{lesson.order}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-slate-300">
                              <Clock className="w-4 h-4" />
                              {formatDuration(lesson.duration)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                lesson.isPublished
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {lesson.isPublished ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/instructor/lessons/${lesson.courseId}/${lesson.id}`}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                title="Edit Lesson"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() =>
                                  handleDeleteLesson(lesson.id, lesson.courseId)
                                }
                                disabled={deleting === lesson.id}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete Lesson"
                              >
                                {deleting === lesson.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* By Course View */}
          {viewMode === "by-course" && courses.length > 0 && (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-800 rounded-xl overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                    onClick={() => toggleCourseExpansion(course.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {getLessonCount(course.id)} lessons •{" "}
                          {course.isPublished ? "Published" : "Draft"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/instructor/lessons/${course.id}/new`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Lesson
                      </Link>
                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedCourse === course.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Lessons */}
                  {expandedCourse === course.id && (
                    <div className="border-t border-slate-700">
                      {(() => {
                        const courseLessons = allLessons
                          .filter((l) => l.courseId === course.id)
                          .sort((a, b) => a.order - b.order);

                        if (courseLessons.length === 0) {
                          return (
                            <div className="p-8 text-center text-slate-400">
                              No lessons yet. Click "Add Lesson" to create your
                              first lesson.
                            </div>
                          );
                        }

                        return (
                          <table className="w-full">
                            <thead className="bg-slate-700/30">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                  Lesson
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                  Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                  Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                              {courseLessons.map((lesson) => (
                                <tr
                                  key={lesson.id}
                                  className="hover:bg-slate-700/30 transition-colors"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 font-medium">
                                        {lesson.order}
                                      </div>
                                      <div>
                                        <p className="font-medium text-white">
                                          {lesson.title}
                                        </p>
                                        <p className="text-sm text-slate-400 truncate max-w-xs">
                                          {lesson.description}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-slate-300">
                                    #{lesson.order}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-slate-300">
                                      <Clock className="w-4 h-4" />
                                      {formatDuration(lesson.duration)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        lesson.isPublished
                                          ? "bg-green-500/20 text-green-400"
                                          : "bg-yellow-500/20 text-yellow-400"
                                      }`}
                                    >
                                      {lesson.isPublished
                                        ? "Published"
                                        : "Draft"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Link
                                        href={`/instructor/lessons/${course.id}/${lesson.id}`}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                        title="Edit Lesson"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Link>
                                      <button
                                        onClick={() =>
                                          handleDeleteLesson(
                                            lesson.id,
                                            lesson.courseId,
                                          )
                                        }
                                        disabled={deleting === lesson.id}
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                                        title="Delete Lesson"
                                      >
                                        {deleting === lesson.id ? (
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
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
