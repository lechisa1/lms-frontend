// LMS Frontend - API Service
import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  User,
  Course,
  Lesson,
  Enrollment,
  Category,
  Certificate,
  Quiz,
  QuizAttempt,
  Question,
  DashboardStats,
  PaginatedResponse,
  Resource,
  RecentEnrollment,
  TopCourse,
  StudentDashboard,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Event emitter for auth errors to allow components to handle them
type AuthErrorCallback = () => void;
const authErrorListeners: AuthErrorCallback[] = [];

export const onAuthError = (callback: AuthErrorCallback) => {
  authErrorListeners.push(callback);
  return () => {
    const index = authErrorListeners.indexOf(callback);
    if (index > -1) authErrorListeners.splice(index, 1);
  };
};

const triggerAuthError = () => {
  authErrorListeners.forEach((callback) => callback());
};

class ApiService {
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("accessToken", token);
      } else {
        localStorage.removeItem("accessToken");
      }
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return this.refreshPromise || Promise.resolve(false);
    }

    this.isRefreshing = true;

    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refreshToken")
        : null;

    if (!refreshToken) {
      this.isRefreshing = false;
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // Refresh token failed - user needs to login again
        this.setAccessToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
        triggerAuthError();
        this.isRefreshing = false;
        return false;
      }

      const data = await response.json();
      this.setAccessToken(data.accessToken);
      this.isRefreshing = false;
      return true;
    } catch (error) {
      this.isRefreshing = false;
      return false;
    }
  }

  private async handleResponse<T>(
    response: Response,
    retry = true,
  ): Promise<T> {
    if (response.status === 401 && retry) {
      // Try to refresh the token
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token - default to GET for protected endpoints
        const retryResponse = await fetch(response.url, {
          method: "GET",
          headers: this.getHeaders(),
        });
        return this.handleResponse<T>(retryResponse, false);
      }
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "An error occurred" }));
      const errorObj = new Error(
        error.message || `HTTP error! status: ${response.status}`,
      );
      (errorObj as any).status = response.status;
      throw errorObj;
    }
    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await this.handleResponse<AuthResponse>(response);
    this.setAccessToken(data.accessToken);
    return data;
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await this.handleResponse<AuthResponse>(response);
    this.setAccessToken(result.accessToken);
    return result;
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<User>(response);
  }

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(response);
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/users/profile/change-password`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to change password" }));
      throw new Error(error.message || "Failed to change password");
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await this.handleResponse<{ accessToken: string }>(response);
    this.setAccessToken(data.accessToken);
    return data;
  }

  logout() {
    this.setAccessToken(null);
  }

  // Courses endpoints
  async getCourses(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    instructorId?: string;
  }): Promise<PaginatedResponse<Course>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params?.instructorId)
      searchParams.set("instructorId", params.instructorId);

    const response = await fetch(`${API_BASE_URL}/courses?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<PaginatedResponse<Course>>(response);
  }

  async getCourse(id: string): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Course>(response);
  }

  async createCourse(data: Partial<Course>): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Course>(response);
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Course>(response);
  }

  async deleteCourse(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to delete course");
    }
  }

  async publishCourse(id: string): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/publish`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    return this.handleResponse<Course>(response);
  }

  async unpublishCourse(id: string): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/unpublish`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    return this.handleResponse<Course>(response);
  }

  // Lessons endpoints
  async getLessons(courseId: string): Promise<Lesson[]> {
    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/lessons`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<Lesson[]>(response);
  }

  async getLesson(courseId: string, id: string): Promise<Lesson> {
    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/lessons/${id}`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<Lesson>(response);
  }

  async createLesson(courseId: string, data: Partial<Lesson>): Promise<Lesson> {
    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/lessons`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      },
    );
    return this.handleResponse<Lesson>(response);
  }

  async updateLesson(
    courseId: string,
    id: string,
    data: Partial<Lesson>,
  ): Promise<Lesson> {
    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/lessons/${id}`,
      {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      },
    );
    return this.handleResponse<Lesson>(response);
  }

  async deleteLesson(courseId: string, id: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/lessons/${id}`,
      {
        method: "DELETE",
        headers: this.getHeaders(),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to delete lesson");
    }
  }

  // Resources endpoints
  async getResources(lessonId: string): Promise<Resource[]> {
    const response = await fetch(
      `${API_BASE_URL}/lessons/${lessonId}/resources`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<Resource[]>(response);
  }

  async createResource(
    lessonId: string,
    data: { title: string; type: string; file: File },
  ): Promise<Resource> {
    console.log("API createResource called:", {
      lessonId,
      title: data.title,
      type: data.type,
      file: data.file,
      fileName: data.file?.name,
      fileSize: data.file?.size,
      accessToken: this.accessToken ? "present" : "missing",
    });

    const formData = new FormData();
    console.log("Appending file to FormData:", data.file);
    console.log("File is File?:", data.file instanceof File);
    console.log("File name:", data.file?.name);
    console.log("File size:", data.file?.size);
    console.log("File type:", data.file?.type);

    formData.append("file", data.file);
    formData.append("title", data.title);
    formData.append("type", data.type);

    // Don't set Content-Type for FormData - browser does it automatically with boundary
    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    console.log(
      "Sending fetch request to:",
      `${API_BASE_URL}/lessons/${lessonId}/resources`,
    );
    console.log("Headers being sent:", JSON.stringify(headers));

    const response = await fetch(
      `${API_BASE_URL}/lessons/${lessonId}/resources`,
      {
        method: "POST",
        headers,
        body: formData,
      },
    );
    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText);
    }
    return this.handleResponse<Resource>(response);
  }

  async deleteResource(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to delete resource");
    }
  }

  async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await fetch(`${API_BASE_URL}/enrollments/my-enrollments`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Enrollment[]>(response);
  }

  // Enrollments endpoints
  async getEnrollments(params?: {
    studentId?: string;
    courseId?: string;
    status?: string;
  }): Promise<Enrollment[]> {
    const searchParams = new URLSearchParams();
    if (params?.studentId) searchParams.set("studentId", params.studentId);
    if (params?.courseId) searchParams.set("courseId", params.courseId);
    if (params?.status) searchParams.set("status", params.status);

    const response = await fetch(
      `${API_BASE_URL}/enrollments?${searchParams}`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<Enrollment[]>(response);
  }

  async enrollInCourse(courseId: string): Promise<Enrollment> {
    const response = await fetch(`${API_BASE_URL}/enrollments`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ courseId }),
    });
    return this.handleResponse<Enrollment>(response);
  }

  async updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    completed: boolean,
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/enrollments/${enrollmentId}/progress`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ lessonId, completed }),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to update progress");
    }
  }

  // Get enrollment by course ID (for student learning page)
  async getEnrollmentByCourse(courseId: string): Promise<Enrollment> {
    const response = await fetch(
      `${API_BASE_URL}/enrollments/course/${courseId}/my-enrollment`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<Enrollment>(response);
  }

  // Get lesson with resources
  async getLessonWithResources(lessonId: string): Promise<Lesson> {
    const response = await fetch(
      `${API_BASE_URL}/lessons/${lessonId}?includeResources=true`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<Lesson>(response);
  }

  // Complete a lesson
  async completeLesson(enrollmentId: string, lessonId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/enrollments/${enrollmentId}/lessons/${lessonId}/complete`,
      {
        method: "POST",
        headers: this.getHeaders(),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to complete lesson");
    }
  }

  // Roles endpoints
  async getRoles(): Promise<{ id: number; name: string }[]> {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ id: number; name: string }[]>(response);
  }

  // Categories endpoints
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Category[]>(response);
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Category>(response);
  }

  async getCategory(id: string): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Category>(response);
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Category>(response);
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to delete category");
    }
  }

  // Enrollments Admin endpoints
  async getAllEnrollments(): Promise<Enrollment[]> {
    const response = await fetch(`${API_BASE_URL}/enrollments`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Enrollment[]>(response);
  }

  async getEnrollment(id: string): Promise<Enrollment> {
    const response = await fetch(`${API_BASE_URL}/enrollments/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Enrollment>(response);
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    const response = await fetch(
      `${API_BASE_URL}/enrollments/course/${courseId}`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<Enrollment[]>(response);
  }

  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    const response = await fetch(
      `${API_BASE_URL}/enrollments/student/${studentId}`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<Enrollment[]>(response);
  }

  async updateEnrollmentStatus(
    id: string,
    status: "ACTIVE" | "COMPLETED" | "DROPPED",
  ): Promise<Enrollment> {
    const response = await fetch(`${API_BASE_URL}/enrollments/${id}/status`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    return this.handleResponse<Enrollment>(response);
  }

  async deleteEnrollment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/enrollments/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to delete enrollment");
    }
  }

  // Quizzes endpoints
  async getQuizzes(lessonId: string): Promise<Quiz[]> {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/lessons/${lessonId}`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<Quiz[]>(response);
  }

  async getQuiz(id: string): Promise<Quiz> {
    const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Quiz>(response);
  }

  async startQuizAttempt(quizId: string): Promise<QuizAttempt> {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/${quizId}/attempts/start`,
      {
        method: "POST",
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<QuizAttempt>(response);
  }

  async submitQuizAttempt(
    attemptId: string,
    answers: { questionId: string; answer: string }[],
  ): Promise<QuizAttempt> {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/attempts/${attemptId}/submit`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ answers }),
      },
    );
    return this.handleResponse<QuizAttempt>(response);
  }

  async getQuizAttemptResult(attemptId: string): Promise<QuizAttempt> {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/attempts/${attemptId}/result`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<QuizAttempt>(response);
  }

  // Quiz Management (Instructor)
  async createQuiz(
    lessonId: string,
    quizData: {
      title: string;
      description?: string;
      timeLimit?: number;
      passingScore?: number;
      maxAttempts?: number;
    },
  ): Promise<Quiz> {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/lessons/${lessonId}`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(quizData),
      },
    );
    return this.handleResponse<Quiz>(response);
  }

  async updateQuiz(
    quizId: string,
    quizData: {
      title?: string;
      description?: string;
      timeLimit?: number;
      passingScore?: number;
      maxAttempts?: number;
    },
  ): Promise<Quiz> {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(quizData),
    });
    return this.handleResponse<Quiz>(response);
  }

  async deleteQuiz(quizId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to delete quiz");
    }
  }

  async addQuestion(
    quizId: string,
    questionData: {
      text: string;
      type: string;
      points?: number;
      order: number;
      options?: { text: string; isCorrect: boolean; order: number }[];
      explanation?: string;
    },
  ): Promise<Question> {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/${quizId}/questions`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(questionData),
      },
    );
    return this.handleResponse<Question>(response);
  }

  async addQuestionsBulk(
    quizId: string,
    questions: {
      text: string;
      type: string;
      points?: number;
      order: number;
      options?: { text: string; isCorrect: boolean; order: number }[];
    }[],
  ): Promise<Question[]> {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/${quizId}/questions/bulk`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ questions }),
      },
    );
    return this.handleResponse<Question[]>(response);
  }

  async updateQuestion(
    questionId: string,
    questionData: {
      text?: string;
      type?: string;
      points?: number;
      order?: number;
      options?: { text: string; isCorrect: boolean; order: number }[];
      explanation?: string;
    },
  ): Promise<Question> {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/questions/${questionId}`,
      {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(questionData),
      },
    );
    return this.handleResponse<Question>(response);
  }

  async deleteQuestion(questionId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/questions/${questionId}`,
      {
        method: "DELETE",
        headers: this.getHeaders(),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to delete question");
    }
  }

  // Certificates endpoints
  async getCertificates(studentId?: string): Promise<Certificate[]> {
    const searchParams = studentId ? `?studentId=${studentId}` : "";
    const response = await fetch(
      `${API_BASE_URL}/certificates${searchParams}`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<Certificate[]>(response);
  }

  async getCertificate(id: string): Promise<Certificate> {
    const response = await fetch(`${API_BASE_URL}/certificates/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Certificate>(response);
  }

  async getMyCertificates(): Promise<Certificate[]> {
    const response = await fetch(
      `${API_BASE_URL}/certificates/my-certificates`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<Certificate[]>(response);
  }

  async generateCertificate(courseId: string): Promise<Certificate> {
    const response = await fetch(`${API_BASE_URL}/certificates/generate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ courseId }),
    });
    return this.handleResponse<Certificate>(response);
  }

  async downloadCertificate(id: string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/certificates/${id}/download`,
      {
        headers: this.getHeaders(),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to download certificate");
    }
    return response.blob();
  }

  async verifyCertificate(certificateNo: string): Promise<{
    isValid: boolean;
    message: string;
    certificate: {
      id: string;
      certificateNo: string;
      studentName: string;
      courseName: string;
      issueDate: string;
    } | null;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/certificates/verify/${certificateNo}`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<{
      isValid: boolean;
      message: string;
      certificate: {
        id: string;
        certificateNo: string;
        studentName: string;
        courseName: string;
        issueDate: string;
      } | null;
    }>(response);
  }

  // Users endpoints (Admin/Instructor)
  async getUsers(params?: {
    role?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set("role", params.role);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/users?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<PaginatedResponse<User>>(response);
  }

  async getInstructors(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users/role/INSTRUCTOR`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<User[]>(response);
  }

  async getUser(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<User>(response);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(response);
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleId: number;
    bio?: string;
    isActive?: boolean;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(response);
  }

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
  }

  // Dashboard stats (Admin)
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<DashboardStats>(response);
  }

  // Instructor Dashboard
  async getInstructorStats(): Promise<{
    totalCourses: number;
    publishedCourses: number;
    totalStudents: number;
    avgRating: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/dashboard/instructor/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getInstructorCourses(): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/instructor/courses`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse(response);
  }

  async getInstructorRecentStudents(): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/instructor/recent-students`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse(response);
  }

  // Search
  async search(
    query: string,
  ): Promise<{ courses: Course[]; lessons: Lesson[] }> {
    const response = await fetch(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<{ courses: Course[]; lessons: Lesson[] }>(
      response,
    );
  }

  // Dashboard endpoints
  async getRecentEnrollments(limit: number = 5): Promise<RecentEnrollment[]> {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/recent-enrollments?limit=${limit}`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<RecentEnrollment[]>(response);
  }

  async getTopCourses(limit: number = 4): Promise<TopCourse[]> {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/top-courses?limit=${limit}`,
      {
        headers: this.getHeaders(),
      },
    );
    return this.handleResponse<TopCourse[]>(response);
  }

  // Student dashboard
  async getStudentDashboard(): Promise<StudentDashboard> {
    const response = await fetch(`${API_BASE_URL}/dashboard/student`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<StudentDashboard>(response);
  }
}

export const api = new ApiService();
export default api;
