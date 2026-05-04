"use client";

import { Bell, Menu, X, ShieldCheck, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchProfile, logout } from "@/lib/redux/slices/authSlice";

interface DashboardLayoutProps {
  children: React.ReactNode;
  type: "user" | "admin";
  title?: string;
}

export default function DashboardLayout({ children, type, title }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { user, admin } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const authKey = type === 'admin' ? 'mkgroup_admin_auth' : 'mkgroup_user_auth';
    const tokenKey = type === 'admin' ? 'mkgroup_admin_token' : 'mkgroup_user_token';
    const loginPath = type === 'admin' ? '/admin/login' : '/user/login';
    
    const token = localStorage.getItem(tokenKey);
    const hasCookieAuth = document.cookie.split('; ').some((item) => item.trim().startsWith(`${authKey}=true`));
    
    // Check if we are authorized for THIS specific type of dashboard
    const isAuth = !!(token && hasCookieAuth);

    if (!isAuth && !pathname.includes('/login')) {
      // Clear any partial auth state if we're not fully authorized
      dispatch(logout());
      router.push(loginPath);
    } else if (isAuth) {
      setIsAuthorized(true);
      // Fetch user data if missing
      if (type === 'user' && !user) {
        dispatch(fetchProfile());
      } else if (type === 'admin' && !admin) {
        // You might want to fetch admin data here too
        dispatch(fetchProfile()); 
      }
    }
  }, [type, pathname, router, dispatch, user, admin]);

  const handleLogout = () => {
    dispatch(logout());
    // Use window.location.href to fully reload and clear all states
    window.location.href = type === 'admin' ? '/admin/login' : '/user/login';
  };

  if (pathname.includes('/login')) return <>{children}</>;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:block">
        <Sidebar type={type} />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="relative h-full bg-white shadow-2xl">
          <Sidebar type={type} />
          <button
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              className="p-2 text-gray-500 hover:text-gray-900 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs",
              type === 'admin' ? "bg-black" : "bg-blue-600 shadow-md shadow-blue-100"
            )}>
              <UserIcon size={16} />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight hidden sm:block uppercase">
              {type === 'admin' ? 'Admin' : 'User'} <span className={type === 'admin' ? "text-gray-400" : "text-blue-600"}>Panel</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-gray-500 hover:text-gray-900 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
