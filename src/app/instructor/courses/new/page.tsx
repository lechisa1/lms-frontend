"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Category, Lesson, Resource } from "@/types";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Save,
  Trash2,
  FileText,
  Link as LinkIcon,
  Video,
  File,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface LessonFormData {
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  isPublished: boolean;
  resources: ResourceFormData[];
}

interface ResourceFormData {
  id: string;
  title: string;
  type: string;
  url: string;
}

export default function NewCoursePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Course form
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    price: 0,
    duration: 0,
    isPublished: false,
  });

  // Lessons
  const [lessons, setLessons] = useState<LessonFormData[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create course
      const course = await api.createCourse(courseForm);

      // Create lessons
      for (const lesson of lessons) {
        await api.createLesson(course.id, {
          title: lesson.title,
          description: lesson.description,
          content: lesson.content,
          order: lesson.order,
          duration: lesson.duration,
          isPublished: lesson.isPublished,
        });
      }

      router.push(`/instructor/courses`);
    } catch (err: any) {
      setError(err.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: "",
        description: "",
        content: "",
        order: lessons.length + 1,
        duration: 0,
        isPublished: false,
        resources: [],
      },
    ]);
  };

  const updateLesson = (index: number, field: string, value: any) => {
    const updatedLessons = [...lessons];
    (updatedLessons[index] as any)[field] = value;
    setLessons(updatedLessons);
  };

  const removeLesson = (index: number) => {
    const reordered = lessons
      .filter((_, i) => i !== index)
      .map((lesson, i) => ({ ...lesson, order: i + 1 }));
    setLessons(reordered);
  };

  const canProceedToStep2 =
    courseForm.title && courseForm.description && courseForm.categoryId;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="INSTRUCTOR" />
      <main className="ml-64 flex-1">
        <Header
          title="Create Course"
          subtitle="Create a new course and add lessons"
        />
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
              href="/instructor/courses"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Courses
            </Link>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  currentStep >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">
                  1
                </span>
                Course Details
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300" />
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  currentStep >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">
                  2
                </span>
                Lessons
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300" />
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  currentStep >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">
                  3
                </span>
                Review
              </div>
            </div>
          </div>

          {/* Step 1: Course Details */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Course Details
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (canProceedToStep2) {
                    setCurrentStep(2);
                  }
                }}
              >
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
                      placeholder="e.g., Introduction to Web Development"
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
                      placeholder="Describe what students will learn..."
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
                        Publish immediately
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    disabled={!canProceedToStep2}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Add Lessons
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Lessons */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Lessons
                </h2>
                <button
                  onClick={addLesson}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Lesson
                </button>
              </div>

              {lessons.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 mb-4">
                    No lessons added yet. Add lessons to your course.
                  </p>
                  <button
                    onClick={addLesson}
                    className="text-blue-600 hover:underline"
                  >
                    Add your first lesson
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lessonIndex}
                      className="border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                            {lessonIndex + 1}
                          </div>
                          <h3 className="font-medium text-slate-900">
                            Lesson {lessonIndex + 1}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeLesson(lessonIndex)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(lessonIndex, "title", e.target.value)
                            }
                            placeholder="Lesson title"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Order
                          </label>
                          <input
                            type="number"
                            value={lesson.order}
                            onChange={(e) =>
                              updateLesson(
                                lessonIndex,
                                "order",
                                parseInt(e.target.value) || 1,
                              )
                            }
                            min={1}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={lesson.description}
                          onChange={(e) =>
                            updateLesson(
                              lessonIndex,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Brief description"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Content
                        </label>
                        <textarea
                          value={lesson.content}
                          onChange={(e) =>
                            updateLesson(lessonIndex, "content", e.target.value)
                          }
                          rows={4}
                          placeholder="Lesson content..."
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={lesson.duration}
                            onChange={(e) =>
                              updateLesson(
                                lessonIndex,
                                "duration",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            min={0}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id={`lesson-published-${lessonIndex}`}
                            checked={lesson.isPublished}
                            onChange={(e) =>
                              updateLesson(
                                lessonIndex,
                                "isPublished",
                                e.target.checked,
                              )
                            }
                            className="w-4 h-4 rounded border-slate-300"
                          />
                          <label
                            htmlFor={`lesson-published-${lessonIndex}`}
                            className="text-sm text-slate-700"
                          >
                            Publish immediately
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={lessons.length === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Review
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Review & Create Course
              </h2>

              {/* Course Summary */}
              <div className="border border-slate-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-slate-900 mb-3">
                  Course Details
                </h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-slate-500">Title</dt>
                    <dd className="text-slate-900 font-medium">
                      {courseForm.title}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Category</dt>
                    <dd className="text-slate-900 font-medium">
                      {
                        categories.find((c) => c.id === courseForm.categoryId)
                          ?.name
                      }
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Price</dt>
                    <dd className="text-slate-900 font-medium">
                      ${courseForm.price.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Duration</dt>
                    <dd className="text-slate-900 font-medium">
                      {courseForm.duration} hours
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-slate-500">Description</dt>
                    <dd className="text-slate-900">{courseForm.description}</dd>
                  </div>
                </dl>
              </div>

              {/* Lessons Summary */}
              <div className="border border-slate-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-slate-900 mb-3">
                  Lessons ({lessons.length})
                </h3>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-600">
                          {index + 1}
                        </span>
                        <span className="text-slate-900">{lesson.title}</span>
                      </div>
                      <span className="text-slate-500 text-sm">
                        {lesson.duration} min
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={handleCourseSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Course
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
