"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "@/lib/redux/slices/authSlice";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";

export default function UserLoginPage() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading: isLoading, error, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (user) {
      toast.success("Welcome back!");
      router.push("/user");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* ... (left side remains same) */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <User size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">USER PANEL</span>
          </div>
          
          <div className="space-y-6 max-w-md">
            <h2 className="text-5xl font-black leading-tight tracking-tight">
              Access Your <br />
              <span className="text-blue-200">Luxury Living</span> <br />
              Portal Today.
            </h2>
            <p className="text-blue-100/70 text-lg font-medium leading-relaxed">
              Sign in to manage your property, track construction progress, and connect with your account manager.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 max-w-sm">
            <div className="h-12 w-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-blue-900 shadow-lg shadow-yellow-400/20">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest">Construction Update</p>
              <p className="text-xs text-blue-100/60 font-bold">Phase 2 structural work completed</p>
            </div>
          </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 bg-gray-50/50">
        <div className="w-full max-w-md">
          <div className="text-center md:text-left mb-10">
            <div className="md:hidden inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 text-white mb-6 shadow-xl shadow-blue-100">
              <User size={32} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 mt-3 font-medium">Please enter your account details below.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold animate-shake">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-1">Email or Phone Number</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  placeholder="name@example.com or 9999999999"
                  className="w-full bg-white border border-gray-100 rounded-[20px] px-14 py-4 text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-100 rounded-[20px] px-14 py-4 text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer w-5 h-5 rounded-lg border-gray-200 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer" />
                </div>
                <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Keep me signed in</span>
              </label>
            
            </div>

            <button 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white rounded-[20px] py-5 font-black text-sm shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
            >
              {isLoading ? (
                <div className="h-6 w-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  SIGN IN TO DASHBOARD <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
         
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-6">
              <Link href="/admin/login" className="text-[10px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-[2px] transition-colors flex items-center gap-2">
                <ShieldCheck size={14} /> Admin Access
              </Link>
              <div className="h-1 w-1 bg-gray-300 rounded-full" />
              <Link href="/" className="text-[10px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-[2px] transition-colors">Return Home</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
