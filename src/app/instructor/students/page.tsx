"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Course, Enrollment } from "@/types";
import {
  Search,
  Users,
  BookOpen,
  Loader2,
  Filter,
  Eye,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface StudentEnrollment extends Enrollment {
  courseTitle?: string;
}

export default function InstructorStudentsPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch instructor's courses
      const coursesData = await api.getInstructorCourses();
      setCourses(coursesData || []);

      // Fetch all enrollments (which returns instructor's students for INSTRUCTOR role)
      const enrollmentsData = await api.getEnrollments();

      // Add course title to each enrollment
      const enrichedEnrollments = enrollmentsData.map((enrollment) => ({
        ...enrollment,
        courseTitle: enrollment.course?.title,
      }));

      setEnrollments(enrichedEnrollments);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    enrollmentId: string,
    status: "ACTIVE" | "COMPLETED" | "DROPPED",
  ) => {
    try {
      await api.updateEnrollmentStatus(enrollmentId, status);
      setEnrollments(
        enrollments.map((e) => (e.id === enrollmentId ? { ...e, status } : e)),
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update enrollment status");
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
        .includes(searchTerm.toLowerCase());

    const matchesCourse = courseFilter
      ? enrollment.courseId === courseFilter
      : true;

    const matchesStatus = statusFilter
      ? enrollment.status === statusFilter
      : true;

    return matchesSearch && matchesCourse && matchesStatus;
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
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "DROPPED":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Get unique students from enrollments
  const uniqueStudents = Array.from(
    new Map(enrollments.map((e) => [e.student?.id, e.student])).entries(),
  ).map(([id, student]) => ({ id, ...student }));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="INSTRUCTOR" />

      <div className="flex-1 ml-64">
        <Header title="Student Management" />

        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Students</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {uniqueStudents.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Active Enrollments</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {enrollments.filter((e) => e.status === "ACTIVE").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Completed</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {enrollments.filter((e) => e.status === "COMPLETED").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">My Courses</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {courses.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Search Students
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>

              <div className="w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Course
                </label>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DROPPED">Dropped</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enrollments Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <Users className="w-12 h-12 mb-4 text-slate-300" />
                <p className="text-lg font-medium">No students found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">
                        Student
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">
                        Course
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">
                        Enrolled Date
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">
                        Progress
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredEnrollments.map((enrollment) => (
                      <tr
                        key={enrollment.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                              {enrollment.student?.avatar ? (
                                <img
                                  src={enrollment.student.avatar}
                                  alt=""
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-slate-600">
                                  {enrollment.student?.firstName?.[0]}
                                  {enrollment.student?.lastName?.[0]}
                                </span>
                              )}
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
                          <p className="text-slate-900 font-medium">
                            {enrollment.course?.title}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-600">
                            {enrollment.enrolledAt
                              ? new Date(
                                  enrollment.enrolledAt,
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
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
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              enrollment.status || "",
                            )}`}
                          >
                            {getStatusIcon(enrollment.status || "")}
                            {enrollment.status || "UNKNOWN"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={enrollment.status || "ACTIVE"}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  enrollment.id,
                                  e.target.value as
                                    | "ACTIVE"
                                    | "COMPLETED"
                                    | "DROPPED",
                                )
                              }
                              className="text-sm border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 text-black"
                            >
                              <option value="ACTIVE">Active</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="DROPPED">Dropped</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
