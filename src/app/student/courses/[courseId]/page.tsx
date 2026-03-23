"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Enrollment, Lesson, LessonWithProgress, Certificate } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Helper to get full URL for resources
const getFullResourceUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_URL}${url}`;
};
import {
  BookOpen,
  Play,
  CheckCircle,
  Circle,
  ChevronRight,
  ChevronLeft,
  FileText,
  Download,
  Loader2,
  ArrowLeft,
  Trophy,
  Video,
  Award,
} from "lucide-react";

export default function CourseLearningPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showLessonList, setShowLessonList] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchEnrollment();
  }, [courseId]);

  const fetchEnrollment = async () => {
    try {
      setLoading(true);
      const data = await api.getEnrollmentByCourse(courseId);
      setEnrollment(data);

      // Set the first incomplete lesson as current, or the first lesson
      if (data?.course?.lessons && data.course.lessons.length > 0) {
        const lessonProgress = data.lessonProgresses || [];
        const firstIncomplete = data.course.lessons.find(
          (lesson: Lesson) =>
            !lessonProgress.find(
              (lp: { lessonId: string; completed: boolean }) =>
                lp.lessonId === lesson.id && lp.completed,
            ),
        );
        setCurrentLesson(firstIncomplete || data.course.lessons[0]);
      }

      // Check if there's already a certificate for this course
      if (data?.status === "COMPLETED") {
        try {
          const certificates = await api.getMyCertificates();
          const courseCert = certificates.find(
            (cert) => cert.courseId === courseId,
          );
          if (courseCert) {
            setCertificate(courseCert);
          }
        } catch (err) {
          console.error("Failed to fetch certificates:", err);
        }
      }
    } catch (err) {
      console.error("Failed to fetch enrollment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!enrollment || !currentLesson) return;

    try {
      setCompleting(true);
      await api.completeLesson(enrollment.id, currentLesson.id);
      // Refresh enrollment data
      await fetchEnrollment();

      // Navigate to next lesson
      const nextLesson = getNextLesson();
      if (nextLesson) {
        setCurrentLesson(nextLesson);
      }
    } catch (err) {
      console.error("Failed to complete lesson:", err);
    } finally {
      setCompleting(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!courseId) return;

    try {
      setCertificateLoading(true);
      const cert = await api.generateCertificate(courseId);
      setCertificate(cert);
    } catch (err) {
      console.error("Failed to generate certificate:", err);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setCertificateLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certificate) return;

    try {
      setDownloading(true);
      const blob = await api.downloadCertificate(certificate.id);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${certificate.certificateNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download certificate:", err);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const getNextLesson = (): Lesson | null => {
    if (!enrollment?.course?.lessons || !currentLesson) return null;

    const lessons = enrollment.course.lessons as Lesson[];
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex < lessons.length - 1) {
      return lessons[currentIndex + 1];
    }
    return null;
  };

  const getPreviousLesson = (): Lesson | null => {
    if (!enrollment?.course?.lessons || !currentLesson) return null;

    const lessons = enrollment.course.lessons as Lesson[];
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex > 0) {
      return lessons[currentIndex - 1];
    }
    return null;
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    if (!enrollment?.lessonProgresses) return false;
    const progress = enrollment.lessonProgresses.find(
      (lp: { lessonId: string; completed: boolean }) =>
        lp.lessonId === lessonId,
    );
    return progress?.completed || false;
  };

  const getCompletedCount = (): number => {
    if (!enrollment?.lessonProgresses) return 0;
    return enrollment.lessonProgresses.filter(
      (lp: { lessonId: string; completed: boolean }) => lp.completed,
    ).length;
  };

  const getTotalLessons = (): number => {
    return enrollment?.course?.lessons?.length || 0;
  };

  const getProgressPercent = (): number => {
    const total = getTotalLessons();
    if (total === 0) return 0;
    return Math.round((getCompletedCount() / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar role="STUDENT" />
        <main className="ml-64">
          <Header title="Course Not Found" />
          <div className="p-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                You are not enrolled in this course
              </h3>
              <Link
                href="/student/courses/browse"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isCourseCompleted = getProgressPercent() === 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="STUDENT" />

      <main className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/student/courses"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {enrollment.course?.title}
                </h1>
                <p className="text-sm text-slate-500">
                  Lesson {currentLesson?.order} of {getTotalLessons()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress indicator */}
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${getProgressPercent()}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600">
                  {getCompletedCount()}/{getTotalLessons()}
                </span>
              </div>

              {isCourseCompleted && (
                <>
                  <span className="flex items-center gap-1 text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    <Trophy className="w-4 h-4" />
                    Completed
                  </span>
                  {certificate ? (
                    <button
                      onClick={handleDownloadCertificate}
                      disabled={downloading}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      {downloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Download Certificate
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerateCertificate}
                      disabled={certificateLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      {certificateLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Award className="w-4 h-4" />
                      )}
                      Get Certificate
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar - Lesson List */}
          {showLessonList && (
            <aside className="w-80 bg-white border-r border-slate-200 h-[calc(100vh-81px)] overflow-y-auto">
              <div className="p-4">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">
                  Course Content
                </h2>
                <div className="space-y-2">
                  {enrollment.course?.lessons?.map(
                    (lesson: Lesson, index: number) => {
                      const completed = isLessonCompleted(lesson.id);
                      const isCurrent = currentLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            isCurrent
                              ? "bg-blue-50 border border-blue-200"
                              : "hover:bg-slate-50 border border-transparent"
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {completed ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${
                                isCurrent
                                  ? "text-blue-700"
                                  : completed
                                    ? "text-slate-700"
                                    : "text-slate-600"
                              }`}
                            >
                              {index + 1}. {lesson.title}
                            </p>
                            {lesson.duration && (
                              <p className="text-xs text-slate-500">
                                {lesson.duration} min
                              </p>
                            )}
                          </div>
                          {isCurrent && (
                            <ChevronRight className="w-4 h-4 text-blue-500" />
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentLesson ? (
              <div className="max-w-4xl mx-auto">
                {/* Lesson Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <span>Lesson {currentLesson.order}</span>
                    {currentLesson.duration && (
                      <>
                        <span>•</span>
                        <span>{currentLesson.duration} min</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {currentLesson.title}
                  </h2>
                </div>

                {/* Lesson Content */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                  {currentLesson.content ? (
                    <div
                      className="prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: currentLesson.content,
                      }}
                    />
                  ) : (
                    <p className="text-slate-500 italic">
                      No lesson content available.
                    </p>
                  )}
                </div>

                {/* Resources */}
                {currentLesson.resources &&
                  currentLesson.resources.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Resources
                      </h3>
                      <div className="space-y-4">
                        {currentLesson.resources.map((resource) => {
                          const resourceType =
                            resource.type?.toLowerCase() || "";
                          const isPdf =
                            resourceType === "pdf" ||
                            resource.mimeType?.includes("pdf");
                          const isVideo =
                            resourceType === "video" ||
                            resource.mimeType?.startsWith("video/") ||
                            resource.url.match(/\.(mp4|webm|ogg|mov|avi)$/i);

                          return (
                            <div
                              key={resource.id}
                              className="border border-slate-200 rounded-lg overflow-hidden"
                            >
                              {/* Video Player */}
                              {isVideo && (
                                <div className="bg-slate-900">
                                  <video
                                    controls
                                    className="w-full max-h-[500px]"
                                    src={getFullResourceUrl(resource.url)}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              )}

                              {/* PDF Viewer */}
                              {isPdf && !isVideo && (
                                <div className="bg-slate-100">
                                  <embed
                                    src={getFullResourceUrl(resource.url)}
                                    type="application/pdf"
                                    className="w-full h-[600px]"
                                  />
                                  <iframe
                                    src={getFullResourceUrl(resource.url)}
                                    className="w-full h-[600px] hidden"
                                    title={resource.title}
                                  />
                                </div>
                              )}

                              {/* Resource Info and Download */}
                              <div className="p-4 bg-white">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${isVideo ? "bg-purple-100" : "bg-red-100"}`}
                                    >
                                      {isVideo ? (
                                        <Video className="w-5 h-5 text-purple-600" />
                                      ) : (
                                        <FileText className="w-5 h-5 text-red-600" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-900">
                                        {resource.title}
                                      </p>
                                      <p className="text-sm text-slate-500 capitalize">
                                        {resource.type}
                                        {resource.fileSize &&
                                          ` • ${(resource.fileSize / 1024).toFixed(1)} KB`}
                                      </p>
                                    </div>
                                  </div>
                                  <a
                                    href={getFullResourceUrl(resource.url)}
                                    download
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Navigation and Complete Button */}
                <div className="flex items-center justify-between">
                  <div>
                    {getPreviousLesson() && (
                      <button
                        onClick={() => setCurrentLesson(getPreviousLesson())}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {!isLessonCompleted(currentLesson.id) && (
                      <button
                        onClick={handleCompleteLesson}
                        disabled={completing}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {completing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        Mark as Complete
                      </button>
                    )}
                    {isLessonCompleted(currentLesson.id) && getNextLesson() && (
                      <button
                        onClick={() => setCurrentLesson(getNextLesson())}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Next Lesson
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                    {isLessonCompleted(currentLesson.id) &&
                      !getNextLesson() && (
                        <div className="flex items-center gap-3">
                          <Link
                            href="/student/courses"
                            className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            Back to My Courses
                          </Link>
                          {isCourseCompleted && (
                            certificate ? (
                              <button
                                onClick={handleDownloadCertificate}
                                disabled={downloading}
                                className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                              >
                                {downloading ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Download className="w-5 h-5" />
                                )}
                                Download Certificate
                              </button>
                            ) : (
                              <button
                                onClick={handleGenerateCertificate}
                                disabled={certificateLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                              >
                                {certificateLoading ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Award className="w-5 h-5" />
                                )}
                                Get Certificate
                              </button>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No lessons available
                </h3>
                <p className="text-slate-500">
                  This course does not have any lessons yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
