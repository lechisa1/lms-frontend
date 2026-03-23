"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Course, Category } from "@/types";
import { ArrowLeft, Save, ArrowRight } from "lucide-react";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    price: 0,
    duration: 0,
    isPublished: false,
  });

  useEffect(() => {
    fetchCourse();
    fetchCategories();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await api.getCourse(courseId);
      setCourse(data);
      setCourseForm({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId || "",
        price: data.price || 0,
        duration: data.duration || 0,
        isPublished: data.isPublished,
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch course");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.updateCourse(courseId, courseForm);
      router.push(`/admin/courses/${courseId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="ADMIN" />
        <main className="ml-64">
          <Header
            title="Edit Course"
            subtitle="Loading course information..."
          />
          <div className="p-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-500">Loading course...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="ADMIN" />
        <main className="ml-64">
          <Header title="Edit Course" subtitle="Error loading course" />
          <div className="p-8">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="ADMIN" />
      <main className="ml-64 flex-1">
        <Header title="Edit Course" subtitle={course.title} />
        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Back Button */}
          <div className="mb-8">
            <Link
              href={`/admin/courses/${courseId}`}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Course Details
            </Link>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Course Details
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={courseForm.categoryId}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          categoryId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      value={courseForm.price}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      min={0}
                      step={0.01}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      value={courseForm.duration}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          duration: parseInt(e.target.value) || 0,
                        })
                      }
                      min={0}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={courseForm.isPublished}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          isPublished: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <label
                      htmlFor="isPublished"
                      className="text-sm text-slate-700"
                    >
                      Published
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <Link
                  href={`/admin/courses/${courseId}`}
                  className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
