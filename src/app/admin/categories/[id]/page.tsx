"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Category, Course } from "@/types";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FolderOpen,
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const data = await api.getCategory(categoryId);
      setCategory(data);
      const coursesData = await api.getCourses({ categoryId });
      setCourses(coursesData.data || []);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch category";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this category? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(true);
      await api.deleteCategory(categoryId);
      router.push("/admin/categories");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete category";
      alert(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar role="ADMIN" />
        <main className="ml-64">
          <Header
            title="Category Details"
            subtitle="Loading category information..."
          />
          <div className="p-6 flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar role="ADMIN" />
        <main className="ml-64">
          <Header title="Category Details" subtitle="Error loading category" />
          <div className="p-6 flex flex-col items-center justify-center h-64">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-slate-600 mb-4">
              {error || "Category not found"}
            </p>
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Categories
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
        <Header title="Category Details" subtitle={category.name} />
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <Link
                href="/admin/categories"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Categories
              </Link>
              <h1 className="text-2xl font-bold text-slate-900">
                {category.name}
              </h1>
              <p className="text-slate-600">
                {category.coursesCount || courses.length} courses in this
                category
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/categories/${categoryId}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
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
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FolderOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  {category.name}
                </h2>
                <p className="text-slate-600">
                  {category.description || "No description provided"}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {courses.length} courses
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Courses
            </h2>
            {courses.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">
                  No courses in this category yet
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                        Course
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                        Instructor
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                        Price
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                        Students
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/courses/${course.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600"
                          >
                            {course.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {course.instructor
                            ? `${course.instructor.firstName} ${course.instructor.lastName}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          ${course.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              course.isPublished
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {course.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {course.enrollmentsCount || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
