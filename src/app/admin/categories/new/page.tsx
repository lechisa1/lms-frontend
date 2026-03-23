"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { api } from "@/lib/api";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.createCategory(formData);
      router.push("/admin/categories");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create category";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="ADMIN" />
      <main className="ml-64">
        <Header
          title="Create Category"
          subtitle="Add a new category for organizing courses"
        />
        <div className="p-6">
          <div className="max-w-2xl">
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Categories
            </Link>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg border border-slate-200 p-6"
            >
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-black"
                    placeholder="e.g., Web Development"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-black"
                    placeholder="Describe this category..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
                <Link
                  href="/admin/categories"
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
