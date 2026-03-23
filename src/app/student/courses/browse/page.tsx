"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Course, Category, Enrollment, PaginatedResponse } from "@/types";
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Loader2,
  ArrowRight,
  CheckCircle,
  BookMarked,
} from "lucide-react";

export default function BrowseCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchEnrollments();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [page, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const data = await api.getMyEnrollments();
      setEnrollments(data || []);
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
      setEnrollments([]);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: { page?: number; categoryId?: string } = { page };
      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }
      const data = await api.getCourses(params);
      // Handle both paginated response and direct array response
      if (Array.isArray(data)) {
        setCourses(data || []);
        setTotalPages(1);
      } else {
        setCourses(data?.data || []);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId);
      await api.enrollInCourse(courseId);
      // Refresh enrollments to update UI
      fetchEnrollments();
    } catch (err) {
      console.error("Failed to enroll:", err);
      const error = err as Error;
      if (error.message?.includes("Already enrolled")) {
        alert("You are already enrolled in this course");
      } else {
        alert("Failed to enroll in course. Please try again.");
      }
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some((e) => e.courseId === courseId);
  };

  const getEnrollment = (courseId: string) => {
    return enrollments.find((e) => e.courseId === courseId);
  };

  const filteredCourses = (courses || []).filter((course) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.instructor?.firstName?.toLowerCase().includes(query) ||
      course.instructor?.lastName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="STUDENT" />

      <main className="ml-64">
        <Header
          title="Browse Courses"
          subtitle="Discover new courses and expand your knowledge"
        />

        <div className="p-6">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses by title, description, or instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter by category"
                  className="w-full md:w-48 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-black"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-4">
            <p className="text-slate-600">
              {loading
                ? "Loading courses..."
                : `${filteredCourses.length} courses available`}
            </p>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No courses found
              </h3>
              <p className="text-slate-500">
                {searchQuery || selectedCategory
                  ? "Try adjusting your search or filter criteria"
                  : "No courses are available at the moment"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const enrolled = isEnrolled(course.id);
                  const enrollment = getEnrollment(course.id);

                  return (
                    <div
                      key={course.id}
                      className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                        enrolled
                          ? "border-green-200 ring-1 ring-green-100"
                          : "border-slate-100"
                      }`}
                    >
                      {/* Course Thumbnail */}
                      <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-white opacity-50" />
                          </div>
                        )}
                        {course.category && (
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium px-2 py-1 rounded">
                            {course.category.name}
                          </span>
                        )}
                        {enrolled && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Enrolled
                          </div>
                        )}
                      </div>

                      {/* Course Content */}
                      <div className="p-5">
                        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                          {course.description}
                        </p>

                        {/* Instructor */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
                            {course.instructor?.firstName?.[0]}
                            {course.instructor?.lastName?.[0]}
                          </div>
                          <span className="text-sm text-slate-600">
                            {course.instructor?.firstName}{" "}
                            {course.instructor?.lastName}
                          </span>
                        </div>

                        {/* Course Stats */}
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration || 0} hours</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{course.enrollmentsCount || 0}</span>
                          </div>
                        </div>

                        {/* Price and Action */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div>
                            {course.price === 0 ? (
                              <span className="text-lg font-bold text-green-600">
                                Free
                              </span>
                            ) : (
                              <span className="text-lg font-bold text-slate-900">
                                ${course.price}
                              </span>
                            )}
                          </div>

                          {enrolled ? (
                            <Link
                              href={`/student/courses/${course.id}`}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <BookMarked className="w-4 h-4" />
                              <span>Continue</span>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleEnroll(course.id)}
                              disabled={enrolling === course.id}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              {enrolling === course.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Enrolling...</span>
                                </>
                              ) : (
                                <>
                                  <span>Enroll Now</span>
                                  <ArrowRight className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Show progress if enrolled */}
                        {enrolled && enrollment?.progress && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-500">
                                Your Progress
                              </span>
                              <span className="font-medium text-slate-900">
                                {enrollment.progress.progressPercent}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{
                                  width: `${enrollment.progress.progressPercent}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-slate-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
