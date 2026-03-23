"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Course } from "@/types";
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Clock,
  FileText,
  Upload,
  X,
} from "lucide-react";

export default function NewLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    order: 1,
    duration: 15,
    isPublished: false,
  });

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await api.getCourse(courseId);
      setCourse(data);

      // Get next order number
      const lessons = await api.getLessons(courseId);
      const maxOrder = lessons.reduce(
        (max: number, lesson: any) => Math.max(max, lesson.order),
        0,
      );
      setFormData((prev) => ({ ...prev, order: maxOrder + 1 }));
    } catch (err) {
      console.error("Failed to fetch course:", err);
      setError("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Lesson title is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Lesson description is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.createLesson(courseId, formData);
      router.push("/instructor/lessons");
    } catch (err: any) {
      console.error("Failed to create lesson:", err);
      setError(err.message || "Failed to create lesson. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Sidebar role="INSTRUCTOR" />
        <div className="ml-64">
          <Header title="New Lesson" />
          <main className="p-6">
            <div className="bg-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-400">Course not found</p>
              <Link
                href="/instructor/lessons"
                className="mt-4 inline-block text-blue-500 hover:text-blue-400"
              >
                Back to Lessons
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar role="INSTRUCTOR" />
      <div className="ml-64">
        <Header title="New Lesson" />

        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/instructor/lessons"
              className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Create New Lesson
              </h1>
              <p className="text-slate-400 mt-1">
                Course: <span className="text-blue-400">{course.title}</span>
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Lesson Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-slate-400 mb-2"
                      >
                        Lesson Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter lesson title"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-slate-400 mb-2"
                      >
                        Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Enter lesson description"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="content"
                        className="block text-sm font-medium text-slate-400 mb-2"
                      >
                        Content
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows={12}
                        placeholder="Enter lesson content (supports markdown)"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        You can use Markdown for formatting
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Resources (Optional)
                  </h2>
                  <p className="text-slate-400 text-sm mb-4">
                    Add resources for students to download or view alongside
                    this lesson.
                  </p>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Add Resource
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Settings
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="order"
                        className="block text-sm font-medium text-slate-400 mb-2"
                      >
                        Lesson Order <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        id="order"
                        name="order"
                        value={formData.order}
                        onChange={handleChange}
                        min={1}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Order in which this lesson appears
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-slate-400 mb-2"
                      >
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min={0}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isPublished"
                        name="isPublished"
                        checked={formData.isPublished}
                        onChange={handleChange}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="isPublished"
                        className="text-sm text-slate-300"
                      >
                        Publish immediately
                      </label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {saving ? "Creating..." : "Create Lesson"}
                    </button>
                    <Link
                      href="/instructor/lessons"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
