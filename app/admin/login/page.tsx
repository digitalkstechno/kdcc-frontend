"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { loginAdmin, clearError } from "@/lib/redux/slices/authSlice";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading: isLoading, error, admin } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (admin) {
      toast.success("Administrator access granted.");
      router.push("/admin");
    }
  }, [admin, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginAdmin(formData));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[450px]">
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-black text-white mb-4 shadow-xl">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Admin Panel</h1>
          <p className="text-gray-500 mt-2">Sign in to manage cards and records</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold animate-shake">
                {error}
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Admin Email or Phone</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  placeholder="admin@mkgroup.com or 9999999999"
                  className="w-full bg-gray-50 border-none rounded-2xl px-12 py-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-none rounded-2xl px-12 py-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                />
              </div>
            </div>

            

            <button 
              disabled={isLoading}
              className="w-full bg-black text-white rounded-2xl py-4 font-bold text-sm shadow-xl shadow-gray-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Admin <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-4 space-y-4">
          
          <div className="flex items-center justify-center gap-6">
            <Link href="/" className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors">Return to Home</Link>
            <span className="h-1 w-1 bg-gray-300 rounded-full" />
            <a href="#" className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors">Help Center</a>
          </div>
        </div>
      </div>
    </div>
  );
}
