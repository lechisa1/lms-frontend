'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  PlayCircle,
  CheckCircle,
  Calendar,
  ArrowRight,
  Flame,
  Target
} from 'lucide-react';

// Mock data for student dashboard
const stats = [
  { 
    title: 'Enrolled Courses', 
    value: '5', 
    icon: BookOpen,
    color: 'blue'
  },
  { 
    title: 'Completed', 
    value: '2', 
    icon: CheckCircle,
    color: 'green'
  },
  { 
    title: 'In Progress', 
    value: '3', 
    icon: PlayCircle,
    color: 'purple'
  },
  { 
    title: 'Certificates', 
    value: '2', 
    icon: Award,
    color: 'yellow'
  },
];

const myCourses = [
  { 
    id: 1, 
    title: 'React Fundamentals', 
    instructor: 'John Smith',
    progress: 75,
    totalLessons: 24,
    completedLessons: 18,
    lastAccessed: '2 hours ago',
    thumbnail: '/course-1.jpg'
  },
  { 
    id: 2, 
    title: 'Advanced TypeScript', 
    instructor: 'Sarah Johnson',
    progress: 45,
    totalLessons: 18,
    completedLessons: 8,
    lastAccessed: '1 day ago',
    thumbnail: '/course-2.jpg'
  },
  { 
    id: 3, 
    title: 'Node.js Mastery', 
    instructor: 'Mike Wilson',
    progress: 20,
    totalLessons: 32,
    completedLessons: 6,
    lastAccessed: '3 days ago',
    thumbnail: '/course-3.jpg'
  },
];

const recommendedCourses = [
  { 
    id: 4, 
    title: 'Python for Data Science', 
    instructor: 'Emily Brown',
    rating: 4.9,
    students: 1234,
    duration: '24 hours',
    level: 'Intermediate'
  },
  { 
    id: 5, 
    title: 'AWS Solutions Architect', 
    instructor: 'David Lee',
    rating: 4.8,
    students: 987,
    duration: '32 hours',
    level: 'Advanced'
  },
];

const learningStreak = {
  current: 7,
  longest: 14,
  thisWeek: [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 60 },
    { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 90 },
    { day: 'Fri', minutes: 45 },
    { day: 'Sat', minutes: 0 },
    { day: 'Sun', minutes: 0 },
  ]
};

const upcomingQuizzes = [
  { id: 1, title: 'React Hooks Quiz', course: 'React Fundamentals', dueDate: 'Tomorrow' },
  { id: 2, title: 'TypeScript Basics', course: 'Advanced TypeScript', dueDate: 'Feb 20' },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  yellow: 'bg-yellow-500',
};

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="STUDENT" />
      
      <main className="ml-64">
        <Header 
          title="Student Dashboard" 
          subtitle="Welcome back! Continue your learning journey."
        />
        
        <div className="p-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Keep up the great work!</h2>
                <p className="text-blue-100">You're on a {learningStreak.current}-day learning streak</p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="font-semibold">{learningStreak.current} days</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorMap[stat.color]} bg-opacity-10`}>
                    <stat.icon className={`w-6 h-6 ${colorMap[stat.color].replace('bg-', 'text-')}`} />
                  </div>
                </div>
                <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Courses */}
            <div className="lg:col-span-2 space-y-6">
              {/* Continue Learning */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Continue Learning</h2>
                  <a href="/student/enrollments" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="divide-y divide-slate-100">
                  {myCourses.map((course) => (
                    <div key={course.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-14 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-slate-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">{course.title}</h3>
                          <p className="text-sm text-slate-500">{course.instructor}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-500">{course.progress}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">{course.completedLessons}/{course.totalLessons} lessons</p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.lastAccessed}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Courses */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">Recommended For You</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {recommendedCourses.map((course) => (
                    <div key={course.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-14 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">{course.title}</h3>
                          <p className="text-sm text-slate-500">{course.instructor}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                            <span>★ {course.rating}</span>
                            <span>{course.students} students</span>
                            <span>{course.duration}</span>
                            <span className="px-2 py-0.5 bg-slate-100 rounded">{course.level}</span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                          Enroll
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Learning Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">This Week</h2>
                <div className="flex items-end justify-between h-32 gap-1">
                  {learningStreak.thisWeek.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-blue-500 rounded-t-md transition-all"
                        style={{ 
                          height: `${Math.min((day.minutes / 90) * 100, 100)}%`,
                          minHeight: day.minutes > 0 ? '4px' : '0'
                        }}
                      />
                      <span className="text-xs text-slate-400">{day.day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-slate-500">Goal: 30 min/day</span>
                  </div>
                  <span className="text-sm font-medium text-green-500">3/7 days</span>
                </div>
              </div>

              {/* Upcoming Quizzes */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">Upcoming Quizzes</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {upcomingQuizzes.map((quiz) => (
                    <div key={quiz.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Target className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{quiz.title}</h3>
                          <p className="text-sm text-slate-500">{quiz.course}</p>
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {quiz.dueDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificates */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Certificates</h2>
                  <span className="text-sm text-slate-500">2 earned</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <p className="font-medium text-slate-900 text-sm">HTML & CSS Fundamentals</p>
                    <p className="text-xs text-slate-500">Completed Jan 15, 2024</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
                    <p className="font-medium text-slate-900 text-sm">JavaScript Basics</p>
                    <p className="text-xs text-slate-500">Completed Dec 20, 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
