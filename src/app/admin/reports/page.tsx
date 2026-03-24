"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import {
  FileText,
  Users,
  BookOpen,
  Award,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";

type ReportType =
  | "enrollments"
  | "courses"
  | "users"
  | "certificates"
  | "revenue";

export default function AdminReports() {
  const [activeReport, setActiveReport] = useState<ReportType>("enrollments");
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Report data states
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);

  const reportTypes = [
    { id: "enrollments" as ReportType, label: "Enrollments", icon: FileText },
    { id: "courses" as ReportType, label: "Courses", icon: BookOpen },
    { id: "users" as ReportType, label: "Users", icon: Users },
    { id: "certificates" as ReportType, label: "Certificates", icon: Award },
    { id: "revenue" as ReportType, label: "Revenue", icon: DollarSign },
  ];

  useEffect(() => {
    async function fetchAllReports() {
      try {
        setLoading(true);
        setError(null);

        const [enrollmentRes, courseRes, userRes, certificateRes, revenueRes] =
          await Promise.all([
            api.getEnrollmentReport(days),
            api.getCourseReport(),
            api.getUserReport(days),
            api.getCertificateReport(days),
            api.getRevenueReport(days),
          ]);

        setEnrollmentData(enrollmentRes);
        setCourseData(courseRes);
        setUserData(userRes);
        setCertificateData(certificateRes);
        setRevenueData(revenueRes);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Failed to load reports data");
      } finally {
        setLoading(false);
      }
    }

    fetchAllReports();
  }, [days]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderEnrollmentReport = () => {
    if (!enrollmentData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Total Enrollments</p>
            <p className="text-2xl font-bold text-slate-800">
              {enrollmentData.summary.totalEnrollments}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Active Enrollments</p>
            <p className="text-2xl font-bold text-blue-600">
              {enrollmentData.summary.activeEnrollments}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {enrollmentData.summary.completedEnrollments}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Completion Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {enrollmentData.summary.completionRate}%
            </p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-black">
            Enrollment Trend (Last {days} Days)
          </h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-1">
              {enrollmentData.trend
                .filter((_: any, i: number) => i % Math.ceil(days / 14) === 0)
                .map((item: any, index: number) => {
                  const maxVal = Math.max(
                    ...enrollmentData.trend.map((t: any) => t.total),
                  );
                  const height = maxVal > 0 ? (item.total / maxVal) * 100 : 0;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${item.date}: ${item.total} enrollments`}
                      />
                      <span className="text-xs text-slate-500 mt-2 transform -rotate-45 origin-top-left">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCourseReport = () => {
    if (!courseData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Total Courses</p>
            <p className="text-2xl font-bold text-slate-800">
              {courseData.summary.totalCourses}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Total Students</p>
            <p className="text-2xl font-bold text-blue-600">
              {courseData.summary.totalStudents}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Completions</p>
            <p className="text-2xl font-bold text-green-600">
              {courseData.summary.totalCompletions}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Avg. Completion</p>
            <p className="text-2xl font-bold text-purple-600">
              {courseData.summary.avgCompletionRate}%
            </p>
          </div>
        </div>

        {/* Course Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                    Instructor
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                    Category
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">
                    Students
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {courseData.courses.map((course: any) => (
                  <tr
                    key={course.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">
                        {course.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {course.instructor}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-800">
                      {course.totalStudents}
                    </td>
                    <td className="px-4 py-3 text-center text-green-600">
                      {course.completedStudents}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          course.completionRate >= 70
                            ? "bg-green-100 text-green-700"
                            : course.completionRate >= 40
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {course.completionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-800">
                      {course.rating > 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <span>★</span>
                          {course.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderUserReport = () => {
    if (!userData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="text-2xl font-bold text-slate-800">
              {userData.summary.totalUsers}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Students</p>
            <p className="text-2xl font-bold text-blue-600">
              {userData.summary.totalStudents}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Instructors</p>
            <p className="text-2xl font-bold text-green-600">
              {userData.summary.totalInstructors}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Active Users</p>
            <p className="text-2xl font-bold text-purple-600">
              {userData.summary.activeUsers}
            </p>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-black">
              User Distribution
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Students</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full "
                      style={{
                        width: `${
                          (userData.summary.totalStudents /
                            userData.summary.totalUsers) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="font-medium">
                    {userData.summary.totalStudents}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Instructors</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-200 rounded-full h-2 ">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (userData.summary.totalInstructors /
                            userData.summary.totalUsers) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="font-medium">
                    {userData.summary.totalInstructors}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Admins</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (userData.summary.totalAdmins /
                            userData.summary.totalUsers) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="font-medium">
                    {userData.summary.totalAdmins}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-black">
              New Users (Last {days} Days)
            </h3>
            <p className="text-3xl font-bold text-slate-800">
              {userData.summary.newUsers}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              New registrations in the selected period
            </p>
          </div>
        </div>

        {/* Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-black">
            User Registration Trend (Last {days} Days)
          </h3>
          <div className="h-48">
            <div className="flex items-end justify-between h-full gap-1">
              {userData.trend
                .filter((_: any, i: number) => i % Math.ceil(days / 14) === 0)
                .map((item: any, index: number) => {
                  const maxVal = Math.max(
                    ...userData.trend.map((t: any) => t.total),
                  );
                  const height = maxVal > 0 ? (item.total / maxVal) * 100 : 0;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-purple-500 rounded-t"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${item.date}: ${item.total} new users`}
                      />
                      <span className="text-xs text-slate-500 mt-2 transform -rotate-45 origin-top-left">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCertificateReport = () => {
    if (!certificateData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Total Certificates</p>
            <p className="text-2xl font-bold text-slate-800">
              {certificateData.summary.totalCertificates}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Issued (Last {days} Days)</p>
            <p className="text-2xl font-bold text-blue-600">
              {certificateData.summary.certificatesIssued}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">This Month</p>
            <p className="text-2xl font-bold text-green-600">
              {certificateData.summary.certificatesThisMonth}
            </p>
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-black">
            Top Courses by Certificates
          </h3>
          <div className="space-y-3">
            {certificateData.topCourses.map((item: any, index: number) => (
              <div
                key={item.courseId}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium text-slate-800">
                    {item.courseTitle}
                  </span>
                </div>
                <span className="text-green-600 font-medium">
                  {item.certificateCount} certificates
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-black">
            Certificate Issuance Trend (Last {days} Days)
          </h3>
          <div className="h-48">
            <div className="flex items-end justify-between h-full gap-1">
              {certificateData.trend
                .filter((_: any, i: number) => i % Math.ceil(days / 14) === 0)
                .map((item: any, index: number) => {
                  const maxVal = Math.max(
                    ...certificateData.trend.map((t: any) => t.count),
                    1,
                  );
                  const height = (item.count / maxVal) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-yellow-500 rounded-t"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${item.date}: ${item.count} certificates`}
                      />
                      <span className="text-xs text-slate-500 mt-2 transform -rotate-45 origin-top-left">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRevenueReport = () => {
    if (!revenueData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(revenueData.summary.totalRevenue)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">All-Time Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(revenueData.summary.allTimeRevenue)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Total Enrollments</p>
            <p className="text-2xl font-bold text-blue-600">
              {revenueData.summary.totalEnrollments}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-500">Avg. per Enrollment</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(revenueData.summary.avgRevenuePerEnrollment)}
            </p>
          </div>
        </div>

        {/* Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-black">
            Revenue Trend (Last {days} Days)
          </h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-1">
              {revenueData.trend
                .filter((_: any, i: number) => i % Math.ceil(days / 14) === 0)
                .map((item: any, index: number) => {
                  const maxVal = Math.max(
                    ...revenueData.trend.map((t: any) => t.revenue),
                    1,
                  );
                  const height = (item.revenue / maxVal) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${item.date}: ${formatCurrency(item.revenue)}`}
                      />
                      <span className="text-xs text-slate-500 mt-2 transform -rotate-45 origin-top-left">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeReport) {
      case "enrollments":
        return renderEnrollmentReport();
      case "courses":
        return renderCourseReport();
      case "users":
        return renderUserReport();
      case "certificates":
        return renderCertificateReport();
      case "revenue":
        return renderRevenueReport();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading reports...</div>
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="ADMIN" />
      <div className="ml-64">
        <Header title="Reports" />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
            <p className="text-slate-500">
              View analytics and statistics for LMS
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">Date Range:</span>
            </div>
            <select
              title="Select date range"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>

          {/* Report Tabs */}
          <div className="mb-6 border-b border-slate-200">
            <nav className="flex gap-4">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveReport(type.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeReport === type.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Report Content */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
