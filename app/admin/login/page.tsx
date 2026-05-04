"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { loginAdmin, clearError } from "@/lib/redux/slices/authSlice";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";

const C = '#C56B36';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading: isLoading, error, admin } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  useEffect(() => {
    if (admin) { toast.success("Administrator access granted."); router.push("/admin"); }
  }, [admin, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginAdmin(formData));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl text-white mb-6 shadow-xl" style={{ backgroundColor: C }}>
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Login</h1>
          <p className="text-gray-500 mt-3 font-medium">Please enter your admin credentials below.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-1">Email or Phone Number</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder="admin@mkgroup.com or 9999999999"
                className="w-full bg-white border border-gray-100 rounded-[20px] px-14 py-4 text-sm font-bold shadow-sm outline-none transition-all"
                onFocus={e => e.target.style.borderColor = C}
                onBlur={e => e.target.style.borderColor = ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white border border-gray-100 rounded-[20px] px-14 py-4 text-sm font-bold shadow-sm outline-none transition-all"
                onFocus={e => e.target.style.borderColor = C}
                onBlur={e => e.target.style.borderColor = ''}
              />
            </div>
          </div>

          <button
            disabled={isLoading}
            className="w-full text-white rounded-[20px] py-5 font-black text-sm hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
            style={{ backgroundColor: C }}
          >
            {isLoading ? (
              <div className="h-6 w-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>SIGN IN TO ADMIN <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-6">
          <Link href="/user/login" className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] transition-colors flex items-center gap-2 hover:text-[#C56B36]">
            <User size={14} /> User Access
          </Link>
          <div className="h-1 w-1 bg-gray-300 rounded-full" />
          <Link href="/" className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] transition-colors hover:text-[#C56B36]">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
