// LMS Frontend - Global Types

export type UserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  duration?: number;
  isPublished: boolean;
  instructorId: string;
  instructor?: User;
  categoryId?: string;
  category?: Category;
  lessons?: Lesson[];
  lessonsCount?: number;
  enrollmentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content?: string;
  order: number;
  duration?: number;
  isPublished: boolean;
  courseId: string;
  instructorId?: string;
  resources?: Resource[];
  quizzes?: Quiz[];
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  fileSize?: number;
  mimeType?: string;
  lessonId: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore: number;
  maxAttempts: number;
  lessonId: string;
  questionsCount?: number;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: string;
  points: number;
  order: number;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  student?: User;
  courseId: string;
  course?: Course;
  enrolledAt: string;
  completedAt?: string;
  status: "ACTIVE" | "COMPLETED" | "DROPPED";
  progress?: ProgressSummary;
  lessonProgresses?: {
    lessonId: string;
    completed: boolean;
    completedAt?: string;
  }[];
}

export interface ProgressSummary {
  id: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lastAccessedAt?: string;
  completedAt?: string;
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

export interface LessonWithProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

export interface CourseLearning {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructorId: string;
  instructor?: User;
  lessons?: Lesson[];
  enrollmentId: string;
  lessonProgress: LessonWithProgress[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  coursesCount?: number;
}

export interface Certificate {
  id: string;
  certificateNo: string;
  studentId: string;
  student?: User;
  courseId: string;
  course?: Course;
  issueDate: string;
  expiryDate?: string;
  isValid: boolean;
  downloadCount: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score?: number;
  passed?: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  activeEnrollments: number;
  completionRate: number;
}

export interface RecentEnrollment {
  id: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  course: {
    id: string;
    title: string;
  };
  enrolledAt: string;
  status: "ACTIVE" | "COMPLETED" | "DROPPED";
}

export interface TopCourse {
  id: string;
  title: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    enrollments: number;
  };
}
