"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Course, Lesson, Resource, Category } from "@/types";
import {
  ArrowLeft,
  BookOpen,
  Edit,
  Trash2,
  Plus,
  FileText,
  Link as LinkIcon,
  Video,
  File,
  Globe,
  GlobeOff,
  Users,
  Clock,
  DollarSign,
  FolderOpen,
  X,
  Upload,
} from "lucide-react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lesson form state
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    content: "",
    order: 1,
    duration: 0,
    isPublished: false,
  });

  // Resource form state
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [resourceForm, setResourceForm] = useState({
    title: "",
    type: "PDF",
    file: null as File | null,
  });

  useEffect(() => {
    fetchCourse();
    fetchCategories();
  }, [courseId]);

  useEffect(() => {
    if (course) {
      fetchLessons();
    }
  }, [course]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await api.getCourse(courseId);
      setCourse(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch course");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const data = await api.getLessons(courseId);
      setLessons(data);
    } catch (err: any) {
      console.error("Failed to fetch lessons:", err);
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

  const handlePublishToggle = async () => {
    if (!course) return;
    try {
      if (course.isPublished) {
        await api.unpublishCourse(course.id);
      } else {
        await api.publishCourse(course.id);
      }
      fetchCourse();
    } catch (err: any) {
      setError(err.message || "Failed to update course status");
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    if (
      !confirm(
        "Are you sure you want to delete this course? This action cannot be undone.",
      )
    ) {
      return;
    }
    try {
      await api.deleteCourse(course.id);
      router.push("/admin/courses");
    } catch (err: any) {
      setError(err.message || "Failed to delete course");
    }
  };

  // Lesson handlers
  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await api.updateLesson(courseId, editingLesson.id, lessonForm);
      } else {
        await api.createLesson(courseId, lessonForm);
      }
      setShowLessonModal(false);
      setEditingLesson(null);
      setLessonForm({
        title: "",
        description: "",
        content: "",
        order: 1,
        duration: 0,
        isPublished: false,
      });
      fetchLessons();
    } catch (err: any) {
      setError(err.message || "Failed to save lesson");
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      content: lesson.content || "",
      order: lesson.order,
      duration: lesson.duration || 0,
      isPublished: lesson.isPublished,
    });
    setShowLessonModal(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api.deleteLesson(courseId, lessonId);
      fetchLessons();
    } catch (err: any) {
      setError(err.message || "Failed to delete lesson");
    }
  };

  // Resource handlers
  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLessonId) return;

    console.log("Resource form state before submit:", resourceForm);
    console.log("Selected lesson ID:", selectedLessonId);

    if (!resourceForm.file) {
      setError("Please select a file");
      return;
    }
    console.log("Submitting resource:", {
      lessonId: selectedLessonId,
      title: resourceForm.title,
      type: resourceForm.type,
      file: resourceForm.file,
      fileName: resourceForm.file.name,
      fileSize: resourceForm.file.size,
      fileType: resourceForm.file.type,
    });
    try {
      await api.createResource(selectedLessonId, {
        title: resourceForm.title,
        type: resourceForm.type,
        file: resourceForm.file,
      });
      setShowResourceModal(false);
      setResourceForm({
        title: "",
        type: "PDF",
        file: null,
      });
      setSelectedLessonId(null);
      fetchLessons();
    } catch (err: any) {
      setError(err.message || "Failed to add resource");
    }
  };

  const handleDeleteResource = async (lessonId: string, resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await api.deleteResource(resourceId);
      fetchLessons();
    } catch (err: any) {
      setError(err.message || "Failed to delete resource");
    }
  };

  const openResourceModal = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setShowResourceModal(true);
  };

  const getResourceIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "PDF":
        return <File className="w-4 h-4 text-red-500" />;
      case "VIDEO":
        return <Video className="w-4 h-4 text-blue-500" />;
      case "AUDIO":
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <File className="w-4 h-4 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="ADMIN" />
        <main className="ml-64">
          <Header
            title="Course Details"
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
          <Header title="Course Details" subtitle="Error loading course" />
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
        <Header title="Course Details" subtitle={course.title} />
        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Back Button and Actions */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/courses"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Courses
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePublishToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  course.isPublished
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {course.isPublished ? (
                  <>
                    <GlobeOff className="w-4 h-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    Publish
                  </>
                )}
              </button>
              <Link
                href={`/admin/courses/${course.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit Course
              </Link>
              <button
                onClick={handleDeleteCourse}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Course Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <BookOpen className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    {course.title}
                  </h1>
                  <p className="text-slate-600 mb-4">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <FolderOpen className="w-4 h-4" />
                      {course.category?.name || "Uncategorized"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration || 0} hours
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />$
                      {course.price?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.isPublished
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {course.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Instructor</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                  {course.instructor?.firstName?.[0]}
                  {course.instructor?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {course.instructor?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lessons Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Lessons ({lessons.length})
              </h2>
              <button
                onClick={() => {
                  setEditingLesson(null);
                  setLessonForm({
                    title: "",
                    description: "",
                    content: "",
                    order: lessons.length + 1,
                    duration: 0,
                    isPublished: false,
                  });
                  setShowLessonModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Lesson
              </button>
            </div>

            {lessons.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 mb-4">No lessons yet</p>
                <button
                  onClick={() => setShowLessonModal(true)}
                  className="text-blue-600 hover:underline"
                >
                  Add your first lesson
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900">
                              {lesson.title}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                lesson.isPublished
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {lesson.isPublished ? "Published" : "Draft"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {lesson.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                            <span>{lesson.duration || 0} min</span>
                            <span>
                              {lesson.resources?.length || 0} resources
                            </span>
                            <span>{lesson.quizzes?.length || 0} quizzes</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openResourceModal(lesson.id)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Add Resource"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditLesson(lesson)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Resources */}
                    {lesson.resources && lesson.resources.length > 0 && (
                      <div className="mt-4 ml-12">
                        <p className="text-sm font-medium text-slate-700 mb-2">
                          Resources:
                        </p>
                        <div className="space-y-2">
                          {lesson.resources.map((resource) => (
                            <div
                              key={resource.id}
                              className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                {getResourceIcon(resource.type)}
                                <span className="text-sm text-slate-700">
                                  {resource.title}
                                </span>
                                <span className="text-xs text-slate-400">
                                  ({resource.type})
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleDeleteResource(lesson.id, resource.id)
                                }
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </h3>
            <form onSubmit={handleLessonSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={lessonForm.content}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, content: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      value={lessonForm.order}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          order: parseInt(e.target.value) || 1,
                        })
                      }
                      min={1}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={lessonForm.duration}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          duration: parseInt(e.target.value) || 0,
                        })
                      }
                      min={0}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={lessonForm.isPublished}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
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
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowLessonModal(false);
                    setEditingLesson(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingLesson ? "Update" : "Add"} Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Add Resource
            </h3>
            <form onSubmit={handleResourceSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={resourceForm.title}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    value={resourceForm.type}
                    onChange={(e) =>
                      setResourceForm({ ...resourceForm, type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PDF">PDF</option>
                    <option value="VIDEO">Video</option>
                    <option value="AUDIO">Audio</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="LINK">Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    File
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        file: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {resourceForm.file && (
                    <p className="mt-1 text-sm text-slate-500">
                      Selected: {resourceForm.file.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowResourceModal(false);
                    setSelectedLessonId(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
