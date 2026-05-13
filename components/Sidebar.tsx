"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Image as ImageIcon,
  FileText,
  Mail,
  LogOut,
  Info,
  Video,
  CreditCard,
  User,
  Users,
  ShieldCheck,
  Database,
  QrCode,
  Calendar,
  MapPin,
  MessageSquare,
  Megaphone,
  Monitor,
  ChevronDown,
  Phone,
  PlusCircle,
  UserPlus
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/lib/redux/slices/authSlice";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  type: "user" | "admin";
}

export default function Sidebar({ type }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [sebaOpen, setSebaOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = type === 'admin' ? '/admin/login' : '/user/login';
  };

  const adminLinks = [
    { label: "Card Maker", href: "/admin", icon: CreditCard },
    { label: "Add Card", href: "/admin/add-card", icon: UserPlus },
    // { label: "NFC Inquiry", href: "/admin/nfc-inquiry", icon: Phone },
    // { label: "Dropbox", href: "/admin/dropbox", icon: Database },
    // { 
    //   label: "SEBA Directory", 
    //   icon: Users,
    //   isOpen: sebaOpen,
    //   toggle: () => setSebaOpen(!sebaOpen),
    //   subLinks: [
    //     { label: "Seba Associated", href: "/admin/seba-associated" },
    //     { label: "Seba Members", href: "/admin/seba-members" },
    //   ]
    // },
    { label: "Logout", action: handleLogout, icon: LogOut, color: "text-red-500 hover:bg-red-50" },
  ];

  const userLinks = [
    { label: "Profile Card", href: "/user/profile", icon: User },
    { label: "QR Card", href: "/user/qr", icon: QrCode },
    { label: "Logout", action: handleLogout, icon: LogOut, color: "text-red-500 hover:bg-red-50" },
  ];

  const links = type === "admin" ? adminLinks : userLinks;

  return (
    <div className="flex h-screen flex-col border-r w-64 fixed left-0 top-0 z-40 bg-white border-gray-200">
      <div className="flex h-16 items-center px-5 border-b border-gray-200">
        <div className="h-8 w-8 flex items-center justify-center text-white mr-3 bg-brand">
          {type === 'admin' ? <ShieldCheck size={16} className="text-white" /> : <User size={16} />}
        </div>
        <span className="text-base font-bold uppercase tracking-tight text-gray-900">
          {type === 'admin' ? 'Admin' : 'User'}{" "}
          <span className="text-brand">Panel</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-0.5">
          {links.map((link: any) => {
            const isActive = pathname === link.href && link.label !== "Logout";

            // If link has sublinks, render as dropdown
            if (link.subLinks) {
              return (
                <div key={link.label} className="space-y-0.5">
                  <button
                    onClick={link.toggle}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                      "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <link.icon className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="flex-1 text-left">{link.label}</span>
                    <ChevronDown size={14} className={cn("transition-transform", link.isOpen ? "rotate-180" : "")} />
                  </button>
                  
                  {link.isOpen && (
                    <div className="pl-8 space-y-0.5">
                      {link.subLinks.map((sub: any) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors rounded-md",
                              isSubActive ? "bg-orange-50 text-[#F27733]" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                          >
                            {sub.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            const content = (
              <>
                <link.icon className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-[#F27733]" : "text-gray-400"
                )} />
                <span className="flex-1 text-left">{link.label}</span>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-brand" />}
              </>
            );

            if (link.action) {
              return (
                <button
                  key={link.label}
                  onClick={link.action}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                    "text-red-500 hover:bg-red-50"
                  )}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={link.label}
                href={link.href!}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-50 text-[#F27733] border-r-2 border-[#F27733]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="p-3 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="h-8 w-8 flex items-center justify-center font-bold text-xs bg-gray-900 text-white rounded-md">
            {type === 'admin' ? 'A' : 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate text-gray-900">
              {type === 'admin' ? 'Admin Access' : 'User Account'}
            </span>
            <span className="text-[10px] font-medium text-gray-400">Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
