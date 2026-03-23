'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock,
  PlayCircle,
  FileText,
  Star,
  ArrowUpRight,
  Calendar
} from 'lucide-react';

// Mock data for instructor dashboard
const stats = [
  { 
    title: 'My Courses', 
    value: '12', 
    subtitle: '8 published',
    icon: BookOpen,
    color: 'blue'
  },
  { 
    title: 'Total Students', 
    value: '1,456', 
    subtitle: '+234 this month',
    icon: Users,
    color: 'green'
  },
  { 
    title: 'Avg. Rating', 
    value: '4.7', 
    subtitle: 'From 289 reviews',
    icon: Star,
    color: 'yellow'
  },
  { 
    title: 'Total Revenue', 
    value: '$8,450', 
    subtitle: '+12% this month',
    icon: TrendingUp,
    color: 'purple'
  },
];

const myCourses = [
  { 
    id: 1, 
    title: 'React Fundamentals', 
    students: 234, 
    rating: 4.8, 
    lessons: 24,
    status: 'published',
    thumbnail: '/course-1.jpg'
  },
  { 
    id: 2, 
    title: 'Advanced TypeScript', 
    students: 189, 
    rating: 4.9, 
    lessons: 18,
    status: 'published',
    thumbnail: '/course-2.jpg'
  },
  { 
    id: 3, 
    title: 'Node.js Mastery', 
    students: 156, 
    rating: 4.7, 
    lessons: 32,
    status: 'draft',
    thumbnail: '/course-3.jpg'
  },
];

const recentStudents = [
  { id: 1, name: 'Alice Johnson', course: 'React Fundamentals', enrolledAt: '2 hours ago', progress: 45 },
  { id: 2, name: 'Bob Smith', course: 'Advanced TypeScript', enrolledAt: '5 hours ago', progress: 20 },
  { id: 3, name: 'Carol Williams', course: 'React Fundamentals', enrolledAt: '1 day ago', progress: 78 },
  { id: 4, name: 'David Brown', course: 'Node.js Mastery', enrolledAt: '2 days ago', progress: 10 },
];

const upcomingLessons = [
  { id: 1, title: 'React Hooks Deep Dive', course: 'React Fundamentals', scheduledAt: 'Tomorrow, 10:00 AM' },
  { id: 2, title: 'TypeScript Generics', course: 'Advanced TypeScript', scheduledAt: 'Feb 20, 2:00 PM' },
  { id: 3, title: 'Express.js REST APIs', course: 'Node.js Mastery', scheduledAt: 'Feb 22, 11:00 AM' },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
};

export default function InstructorDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="INSTRUCTOR" />
      
      <main className="ml-64">
        <Header 
          title="Instructor Dashboard" 
          subtitle="Welcome back! Here's your teaching overview."
        />
        
        <div className="p-6">
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
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                </div>
                <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Courses */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">My Courses</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {myCourses.map((course) => (
                  <div key={course.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-14 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900">{course.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            course.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {course.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.students}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {course.lessons} lessons
                          </span>
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Star className="w-4 h-4" />
                            {course.rating}
                          </span>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Students */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">Recent Students</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentStudents.map((student) => (
                    <div key={student.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900">{student.name}</span>
                        <span className="text-xs text-slate-400">{student.enrolledAt}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{student.course}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{student.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Lessons */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">Upcoming Lessons</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {upcomingLessons.map((lesson) => (
                    <div key={lesson.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <PlayCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{lesson.title}</h3>
                          <p className="text-sm text-slate-500">{lesson.course}</p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {lesson.scheduledAt}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
