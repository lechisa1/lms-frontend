"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  LogOut,
  FileText,
  Award,
  BarChart3,
  ClipboardList,
  FolderOpen,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
}

const adminLinks = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/courses", icon: BookOpen, label: "Courses" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/categories", icon: FolderOpen, label: "Categories" },
  { href: "/admin/enrollments", icon: ClipboardList, label: "Enrollments" },
  { href: "/admin/certificates", icon: Award, label: "Certificates" },
  { href: "/admin/reports", icon: BarChart3, label: "Reports" },
];

const instructorLinks = [
  { href: "/instructor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/instructor/courses", icon: BookOpen, label: "My Courses" },
  { href: "/instructor/students", icon: Users, label: "Students" },
  { href: "/instructor/lessons", icon: FileText, label: "Lessons" },
  { href: "/instructor/quizzes", icon: ClipboardList, label: "Quizzes" },
];

const studentLinks = [
  { href: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/student/courses", icon: BookOpen, label: "My Courses" },
  {
    href: "/student/courses/browse",
    icon: FolderOpen,
    label: "Browse Courses",
  },
  { href: "/student/certificates", icon: Award, label: "Certificates" },
  { href: "/student/profile", icon: Users, label: "Profile" },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const links =
    role === "ADMIN"
      ? adminLinks
      : role === "INSTRUCTOR"
        ? instructorLinks
        : studentLinks;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">LMS Portal</h1>
            <p className="text-slate-400 text-xs capitalize">
              {role.toLowerCase()}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-4">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-medium">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
