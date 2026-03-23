"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Certificate } from "@/types";
import {
  Award,
  Download,
  Loader2,
  Calendar,
  BookOpen,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await api.getMyCertificates();
      setCertificates(data || []);
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificateId: string) => {
    try {
      setDownloading(certificateId);
      const blob = await api.downloadCertificate(certificateId);

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download certificate:", err);
      // alert("Failed to download certificate. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="STUDENT" />

      <main className="ml-64">
        <Header
          title="My Certificates"
          subtitle="Download your course completion certificates"
        />

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
              <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No certificates yet
              </h3>
              <p className="text-slate-500 mb-6">
                Complete a course to earn your first certificate
              </p>
              <Link
                href="/student/courses/browse"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Certificate Header */}
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/lms.png"
                          alt="LMS Logo"
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                        <span className="text-sm font-semibold">LMS</span>
                      </div>

                      {certificate.isValid ? (
                        <span className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Valid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium bg-red-500/20 px-2 py-1 rounded-full">
                          Invalid
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold">
                      Certificate of Completion
                    </h3>
                  </div>

                  {/* Certificate Content */}
                  <div className="p-5">
                    <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      {certificate.course?.title}
                    </h4>

                    <div className="space-y-2 text-sm text-slate-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Issued:{" "}
                          {new Date(certificate.issueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span className="font-mono text-xs">
                          {certificate.certificateNo}
                        </span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={() => handleDownload(certificate.id)}
                      disabled={
                        downloading === certificate.id || !certificate.isValid
                      }
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading === certificate.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {certificate.isValid
                        ? "Download PDF"
                        : "Certificate Invalid"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certificate Stats */}
          {certificates.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Certificate Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Certificates</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {certificates.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Valid Certificates</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {certificates.filter((c) => c.isValid).length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Downloads</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {certificates.reduce(
                        (sum, c) => sum + c.downloadCount,
                        0,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
