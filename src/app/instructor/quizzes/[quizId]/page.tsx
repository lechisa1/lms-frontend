"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Quiz, Question } from "@/types";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  CheckCircle,
  Circle,
  Clock,
  Target,
  RefreshCw,
} from "lucide-react";

interface QuestionWithOptions extends Question {
  tempId?: string;
}

export default function QuizEditorPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Quiz settings state
  const [quizSettings, setQuizSettings] = useState({
    title: "",
    description: "",
    timeLimit: 15,
    passingScore: 70,
    maxAttempts: 3,
  });

  // Questions state
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<QuestionWithOptions | null>(null);

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    text: "",
    type: "MULTIPLE_CHOICE",
    points: 1,
    order: 1,
    explanation: "",
    options: [] as { text: string; isCorrect: boolean; order: number }[],
  });

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const data = await api.getQuiz(quizId);
      setQuiz(data);
      setQuizSettings({
        title: data.title || "",
        description: data.description || "",
        timeLimit: data.timeLimit || 15,
        passingScore: data.passingScore,
        maxAttempts: data.maxAttempts,
      });
      // Fetch questions separately if needed - the quiz might already include questions
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error("Failed to fetch quiz:", err);
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuiz = async () => {
    if (!quizSettings.title.trim()) {
      setError("Quiz title is required");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const updated = await api.updateQuiz(quizId, quizSettings);
      setQuiz(updated);
      alert("Quiz updated successfully!");
    } catch (err: any) {
      console.error("Failed to update quiz:", err);
      setError(err.message || "Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleAddOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [
        ...questionForm.options,
        { text: "", isCorrect: false, order: questionForm.options.length + 1 },
      ],
    });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...questionForm.options];
    newOptions.splice(index, 1);
    // Reorder
    newOptions.forEach((opt, i) => (opt.order = i + 1));
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const handleOptionChange = (
    index: number,
    field: "text" | "isCorrect",
    value: string | boolean,
  ) => {
    const newOptions = [...questionForm.options];
    if (field === "isCorrect" && value === true) {
      // For single choice questions, uncheck others
      newOptions.forEach((opt) => (opt.isCorrect = false));
    }
    (newOptions[index] as any)[field] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const handleCreateQuestion = async () => {
    if (!questionForm.text.trim()) {
      setError("Question text is required");
      return;
    }
    if (
      questionForm.type === "MULTIPLE_CHOICE" ||
      questionForm.type === "SINGLE_CHOICE"
    ) {
      if (questionForm.options.length < 2) {
        setError("At least 2 options are required");
        return;
      }
      const hasCorrect = questionForm.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        setError("At least one option must be marked as correct");
        return;
      }
    }
    try {
      const newQuestion = await api.addQuestion(quizId, {
        text: questionForm.text,
        type: questionForm.type,
        points: questionForm.points,
        order: questions.length + 1,
        options: questionForm.options,
        explanation: questionForm.explanation || undefined,
      });
      setQuestions([...questions, newQuestion]);
      setShowQuestionModal(false);
      resetQuestionForm();
    } catch (err: any) {
      console.error("Failed to create question:", err);
      setError(err.message || "Failed to create question");
    }
  };

  const handleUpdateQuestion = async () => {
    if (!questionForm.text.trim() || !editingQuestion) {
      setError("Question text is required");
      return;
    }
    try {
      const updated = await api.updateQuestion(editingQuestion.id, {
        text: questionForm.text,
        type: questionForm.type,
        points: questionForm.points,
        order: questionForm.order,
        options: questionForm.options,
        explanation: questionForm.explanation || undefined,
      });
      setQuestions(
        questions.map((q) => (q.id === editingQuestion.id ? updated : q)),
      );
      setShowQuestionModal(false);
      setEditingQuestion(null);
      resetQuestionForm();
    } catch (err: any) {
      console.error("Failed to update question:", err);
      setError(err.message || "Failed to update question");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.deleteQuestion(questionId);
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (err: any) {
      console.error("Failed to delete question:", err);
      setError(err.message || "Failed to delete question");
    }
  };

  const openEditQuestion = (question: QuestionWithOptions) => {
    setEditingQuestion(question);
    setQuestionForm({
      text: question.text,
      type: question.type,
      points: question.points,
      order: question.order,
      explanation: question.explanation || "",
      options:
        question.options?.map((opt) => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order,
        })) || [],
    });
    setShowQuestionModal(true);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      text: "",
      type: "MULTIPLE_CHOICE",
      points: 1,
      order: questions.length + 1,
      explanation: "",
      options: [],
    });
  };

  const openAddQuestion = () => {
    setEditingQuestion(null);
    resetQuestionForm();
    setShowQuestionModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Sidebar role="INSTRUCTOR" />
        <div className="ml-64">
          <Header title="Quiz Editor" />
          <main className="p-6">
            <div className="bg-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-400">Quiz not found</p>
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
        <Header title="Quiz Editor" />

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
                  Edit Quiz: {quiz.title}
                </h1>
                <p className="text-slate-400 mt-1">
                  {questions.length} questions
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quiz Settings */}
              <div className="bg-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Quiz Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Quiz Title
                    </label>
                    <input
                      type="text"
                      value={quizSettings.title}
                      onChange={(e) =>
                        setQuizSettings({
                          ...quizSettings,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Description
                    </label>
                    <textarea
                      value={quizSettings.description}
                      onChange={(e) =>
                        setQuizSettings({
                          ...quizSettings,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Time Limit (min)
                      </label>
                      <input
                        type="number"
                        value={quizSettings.timeLimit}
                        onChange={(e) =>
                          setQuizSettings({
                            ...quizSettings,
                            timeLimit: parseInt(e.target.value) || 0,
                          })
                        }
                        min={0}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        <Target className="w-4 h-4 inline mr-1" />
                        Passing Score (%)
                      </label>
                      <input
                        type="number"
                        value={quizSettings.passingScore}
                        onChange={(e) =>
                          setQuizSettings({
                            ...quizSettings,
                            passingScore: parseInt(e.target.value) || 70,
                          })
                        }
                        min={0}
                        max={100}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        <RefreshCw className="w-4 h-4 inline mr-1" />
                        Max Attempts
                      </label>
                      <input
                        type="number"
                        value={quizSettings.maxAttempts}
                        onChange={(e) =>
                          setQuizSettings({
                            ...quizSettings,
                            maxAttempts: parseInt(e.target.value) || 1,
                          })
                        }
                        min={1}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateQuiz}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Settings
                  </button>
                </div>
              </div>

              {/* Questions Section */}
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    Questions
                  </h2>
                  <button
                    onClick={openAddQuestion}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>

                {questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="p-4 bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-blue-400 bg-blue-400/20 px-2 py-0.5 rounded">
                                Q{index + 1}
                              </span>
                              <span className="text-xs text-slate-400">
                                {question.type} • {question.points} point
                                {question.points !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <p className="text-white">{question.text}</p>
                            {question.options &&
                              question.options.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {question.options.map((option, optIndex) => (
                                    <div
                                      key={option.id || optIndex}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      {option.isCorrect ? (
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-slate-500" />
                                      )}
                                      <span
                                        className={
                                          option.isCorrect
                                            ? "text-green-400"
                                            : "text-slate-400"
                                        }
                                      >
                                        {option.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => openEditQuestion(question)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                              title="Edit Question"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">
                      No questions yet. Add questions to your quiz.
                    </p>
                    <button
                      onClick={openAddQuestion}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Question
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Quiz Info */}
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Quiz Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Questions</span>
                    <span className="text-white font-medium">
                      {questions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Points</span>
                    <span className="text-white font-medium">
                      {questions.reduce((sum, q) => sum + q.points, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time Limit</span>
                    <span className="text-white font-medium">
                      {quizSettings.timeLimit > 0
                        ? `${quizSettings.timeLimit} min`
                        : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Passing Score</span>
                    <span className="text-white font-medium">
                      {quizSettings.passingScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Attempts</span>
                    <span className="text-white font-medium">
                      {quizSettings.maxAttempts}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Modal */}
          {showQuestionModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {editingQuestion ? "Edit Question" : "Add Question"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowQuestionModal(false);
                      setEditingQuestion(null);
                    }}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Question Text <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={questionForm.text}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          text: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="Enter your question"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Question Type
                      </label>
                      <select
                        value={questionForm.type}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            type: e.target.value,
                            options:
                              e.target.value === "TRUE_FALSE"
                                ? [
                                    {
                                      text: "True",
                                      isCorrect: false,
                                      order: 1,
                                    },
                                    {
                                      text: "False",
                                      isCorrect: false,
                                      order: 2,
                                    },
                                  ]
                                : e.target.value === "SHORT_ANSWER"
                                  ? []
                                  : questionForm.options,
                          })
                        }
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="SINGLE_CHOICE">Single Choice</option>
                        <option value="TRUE_FALSE">True/False</option>
                        <option value="SHORT_ANSWER">Short Answer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Points
                      </label>
                      <input
                        type="number"
                        value={questionForm.points}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            points: parseInt(e.target.value) || 1,
                          })
                        }
                        min={1}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Options for choice questions */}
                  {(questionForm.type === "MULTIPLE_CHOICE" ||
                    questionForm.type === "SINGLE_CHOICE") && (
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Options <span className="text-red-400">*</span>
                      </label>
                      <p className="text-xs text-slate-500 mb-2">
                        Select the checkbox to mark the correct answer(s)
                      </p>
                      <div className="space-y-2">
                        {questionForm.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={(e) =>
                                handleOptionChange(
                                  index,
                                  "isCorrect",
                                  e.target.checked,
                                )
                              }
                              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-green-600 focus:ring-green-500"
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) =>
                                handleOptionChange(
                                  index,
                                  "text",
                                  e.target.value,
                                )
                              }
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index)}
                              className="p-2 text-slate-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="mt-2 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                      >
                        <Plus className="w-4 h-4" />
                        Add Option
                      </button>
                    </div>
                  )}

                  {questionForm.type === "TRUE_FALSE" && (
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-sm text-slate-400">
                        True/False questions have fixed options. Select the
                        correct answer below.
                      </p>
                      <div className="flex gap-4 mt-2">
                        {questionForm.options.map((option, index) => (
                          <label
                            key={index}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="trueFalse"
                              checked={option.isCorrect}
                              onChange={(e) => {
                                const newOptions = [...questionForm.options];
                                newOptions.forEach(
                                  (opt) => (opt.isCorrect = false),
                                );
                                newOptions[index].isCorrect = true;
                                setQuestionForm({
                                  ...questionForm,
                                  options: newOptions,
                                });
                              }}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-white">{option.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {questionForm.type === "SHORT_ANSWER" && (
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-sm text-slate-400">
                        Short answer questions will be manually graded by the
                        instructor.
                      </p>
                    </div>
                  )}

                  {/* Explanation field for all question types */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Explanation (Optional)
                    </label>
                    <p className="text-xs text-slate-500 mb-2">
                      Provide an explanation that will be shown after the
                      student answers
                    </p>
                    <textarea
                      value={questionForm.explanation}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          explanation: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Enter explanation for the correct answer..."
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionModal(false);
                      setEditingQuestion(null);
                    }}
                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={
                      editingQuestion
                        ? handleUpdateQuestion
                        : handleCreateQuestion
                    }
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingQuestion ? "Update Question" : "Add Question"}
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
