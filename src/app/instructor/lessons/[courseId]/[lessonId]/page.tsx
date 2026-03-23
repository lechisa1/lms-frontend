"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Course, Lesson, Quiz } from "@/types";
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Clock,
  FileText,
  Upload,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Plus,
  ClipboardList,
  Edit,
} from "lucide-react";

export default function EditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
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

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    timeLimit: 15,
    passingScore: 70,
    maxAttempts: 3,
  });

  useEffect(() => {
    if (courseId && lessonId) {
      fetchData();
      fetchQuizzes();
    }
  }, [courseId, lessonId]);

  const fetchQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      const data = await api.getQuizzes(lessonId);
      setQuizzes(data);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizForm.title.trim()) {
      setError("Quiz title is required");
      return;
    }
    try {
      const newQuiz = await api.createQuiz(lessonId, quizForm);
      setQuizzes([...quizzes, newQuiz]);
      setShowQuizModal(false);
      setQuizForm({
        title: "",
        description: "",
        timeLimit: 15,
        passingScore: 70,
        maxAttempts: 3,
      });
    } catch (err: any) {
      console.error("Failed to create quiz:", err);
      setError(err.message || "Failed to create quiz");
    }
  };

  const handleUpdateQuiz = async () => {
    if (!quizForm.title.trim() || !editingQuiz) {
      setError("Quiz title is required");
      return;
    }
    try {
      const updated = await api.updateQuiz(editingQuiz.id, quizForm);
      setQuizzes(quizzes.map((q) => (q.id === editingQuiz.id ? updated : q)));
      setShowQuizModal(false);
      setEditingQuiz(null);
      setQuizForm({
        title: "",
        description: "",
        timeLimit: 15,
        passingScore: 70,
        maxAttempts: 3,
      });
    } catch (err: any) {
      console.error("Failed to update quiz:", err);
      setError(err.message || "Failed to update quiz");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await api.deleteQuiz(quizId);
      setQuizzes(quizzes.filter((q) => q.id !== quizId));
    } catch (err: any) {
      console.error("Failed to delete quiz:", err);
      setError(err.message || "Failed to delete quiz");
    }
  };

  const openEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description || "",
      timeLimit: quiz.timeLimit || 15,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
    });
    setShowQuizModal(true);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseData, lessonData] = await Promise.all([
        api.getCourse(courseId),
        api.getLesson(courseId, lessonId),
      ]);

      setCourse(courseData);
      setLesson(lessonData);

      setFormData({
        title: lessonData.title || "",
        description: lessonData.description || "",
        content: lessonData.content || "",
        order: lessonData.order || 1,
        duration: lessonData.duration || 15,
        isPublished: lessonData.isPublished || false,
      });
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load lesson data");
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

      await api.updateLesson(courseId, lessonId, formData);
      router.push("/instructor/lessons");
    } catch (err: any) {
      console.error("Failed to update lesson:", err);
      setError(err.message || "Failed to update lesson. Please try again.");
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

  const handleTogglePublish = async () => {
    try {
      setSaving(true);
      const newStatus = !formData.isPublished;
      await api.updateLesson(courseId, lessonId, { isPublished: newStatus });
      setFormData((prev) => ({ ...prev, isPublished: newStatus }));
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
      alert("Failed to update publish status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Sidebar role="INSTRUCTOR" />
        <div className="ml-64">
          <Header title="Edit Lesson" />
          <main className="p-6">
            <div className="bg-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-400">Lesson not found</p>
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
        <Header title="Edit Lesson" />

        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/instructor/lessons"
                className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Edit: {lesson.title}
                </h1>
                <p className="text-slate-400 mt-1">
                  Course: <span className="text-blue-400">{course.title}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  formData.isPublished
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {formData.isPublished ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Published
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Draft
                  </>
                )}
              </span>
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
                    Resources
                  </h2>
                  {lesson.resources && lesson.resources.length > 0 ? (
                    <div className="space-y-2">
                      {lesson.resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-slate-400" />
                            <span className="text-white">{resource.title}</span>
                          </div>
                          <button
                            type="button"
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm mb-4">
                      No resources added yet.
                    </p>
                  )}
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Add Resource
                  </button>
                </div>

                {/* Quiz Section */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">
                      Quizzes
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuiz(null);
                        setQuizForm({
                          title: "",
                          description: "",
                          timeLimit: 15,
                          passingScore: 70,
                          maxAttempts: 3,
                        });
                        setShowQuizModal(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Quiz
                    </button>
                  </div>

                  {loadingQuizzes ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    </div>
                  ) : quizzes.length > 0 ? (
                    <div className="space-y-2">
                      {quizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <ClipboardList className="w-5 h-5 text-purple-400" />
                            <div>
                              <p className="text-white font-medium">
                                {quiz.title}
                              </p>
                              <p className="text-xs text-slate-400">
                                {quiz.questionsCount || 0} questions •{" "}
                                {quiz.timeLimit
                                  ? `${quiz.timeLimit} min`
                                  : "No time limit"}{" "}
                                • {quiz.passingScore}% to pass
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/instructor/quizzes/${quiz.id}`}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                              title="Edit Quiz"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Delete Quiz"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">
                      No quizzes added yet. Add a quiz to test student
                      knowledge.
                    </p>
                  )}
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
                        Published
                      </label>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleTogglePublish}
                      disabled={saving}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 ${
                        formData.isPublished
                          ? "bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30"
                          : "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                      }`}
                    >
                      {formData.isPublished ? (
                        <>
                          <XCircle className="w-5 h-5" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5" />
                          Publish
                        </>
                      )}
                    </button>
                    <Link
                      href={`/instructor/lessons`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      View in Lessons
                    </Link>
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
                      {saving ? "Saving..." : "Save Changes"}
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

          {/* Quiz Modal */}
          {showQuizModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-xl max-w-md w-full p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Quiz Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={quizForm.title}
                      onChange={(e) =>
                        setQuizForm({ ...quizForm, title: e.target.value })
                      }
                      placeholder="Enter quiz title"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Description
                    </label>
                    <textarea
                      value={quizForm.description}
                      onChange={(e) =>
                        setQuizForm({
                          ...quizForm,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="Optional description"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        value={quizForm.timeLimit}
                        onChange={(e) =>
                          setQuizForm({
                            ...quizForm,
                            timeLimit: parseInt(e.target.value) || 0,
                          })
                        }
                        min={0}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Passing Score (%)
                      </label>
                      <input
                        type="number"
                        value={quizForm.passingScore}
                        onChange={(e) =>
                          setQuizForm({
                            ...quizForm,
                            passingScore: parseInt(e.target.value) || 70,
                          })
                        }
                        min={0}
                        max={100}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Max Attempts
                    </label>
                    <input
                      type="number"
                      value={quizForm.maxAttempts}
                      onChange={(e) =>
                        setQuizForm({
                          ...quizForm,
                          maxAttempts: parseInt(e.target.value) || 1,
                        })
                      }
                      min={1}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuizModal(false);
                      setEditingQuiz(null);
                    }}
                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={editingQuiz ? handleUpdateQuiz : handleCreateQuiz}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingQuiz ? "Update Quiz" : "Create Quiz"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
