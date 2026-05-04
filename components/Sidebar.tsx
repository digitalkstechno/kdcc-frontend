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
  Phone
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
    { label: "NFC Inquiry", href: "/admin/nfc-inquiry", icon: Phone },
    { label: "Dropbox", href: "/admin/dropbox", icon: Database },
    { 
      label: "SEBA Directory", 
      icon: Users,
      isOpen: sebaOpen,
      toggle: () => setSebaOpen(!sebaOpen),
      subLinks: [
        { label: "Seba Associated", href: "/admin/seba-associated" },
        { label: "Seba Members", href: "/admin/seba-members" },
      ]
    },
    { label: "Logout", action: handleLogout, icon: LogOut, color: "text-red-500 hover:bg-red-50" },
  ];

  const userLinks = [
    { label: "Dashboard", href: "/user", icon: LayoutDashboard },
    { label: "Profile Card", href: "/user/profile", icon: User },
    { label: "Screen", href: "/user/screen", icon: Monitor },
    { label: "About", href: "/user/about", icon: Info },
    { label: "Contact", href: "/user/contact", icon: Mail },
    { label: "Location", href: "/user/location", icon: MapPin },
    { label: "Appointment", href: "/user/appointment", icon: Calendar },
    { label: "Inquiry", href: "/user/inquiry", icon: MessageSquare },
    { label: "Advertisement", href: "/user/advertisement", icon: Megaphone },
    { label: "Photo Gallery", href: "/user/photos", icon: ImageIcon },
    { label: "Video Gallery", href: "/user/videos", icon: Video },
    { label: "Brochure", href: "/user/brochure", icon: FileText },
    { label: "QR Card", href: "/user/qr", icon: QrCode },
    { label: "Popup", href: "/user/popup", icon: MessageSquare },
    { label: "Logout", action: handleLogout, icon: LogOut, color: "text-red-500 hover:bg-red-50" },
  ];

  const links = type === "admin" ? adminLinks : userLinks;

  return (
    <div className={cn(
      "flex h-screen flex-col border-r w-64 fixed left-0 top-0 z-40",
      type === "admin" ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"
    )}>
      <div className={cn(
        "flex h-16 items-center px-5 border-b",
        type === "admin" ? "border-gray-800" : "border-gray-200"
      )}>
        <div className={cn(
          "h-8 w-8 flex items-center justify-center text-white mr-3",
          type === 'admin' ? "bg-white/10" : "bg-blue-600"
        )}>
          {type === 'admin' ? <ShieldCheck size={16} className="text-white" /> : <User size={16} />}
        </div>
        <span className={cn("text-base font-bold uppercase tracking-tight",
          type === 'admin' ? "text-white" : "text-gray-900"
        )}>
          {type === 'admin' ? 'Admin' : 'User'}{" "}
          <span className={type === 'admin' ? "text-gray-400" : "text-blue-600"}>Panel</span>
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
                      type === 'admin' ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-gray-50"
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
                              type === 'admin'
                                ? isSubActive ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                                : isSubActive ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
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
                  type === 'admin'
                    ? isActive ? "text-white" : "text-gray-400"
                    : isActive ? "text-blue-600" : "text-gray-400"
                )} />
                <span className="flex-1 text-left">{link.label}</span>
                {isActive && <div className={cn("h-1.5 w-1.5 rounded-full", type === 'admin' ? "bg-white" : "bg-blue-600")} />}
              </>
            );

            if (link.action) {
              return (
                <button
                  key={link.label}
                  onClick={link.action}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                    type === 'admin'
                      ? "text-red-400 hover:bg-white/5 hover:text-red-300"
                      : "text-red-500 hover:bg-red-50"
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
                  type === 'admin'
                    ? isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                    : isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      <div className={cn("p-4 border-t", type === 'admin' ? "border-gray-800" : "border-gray-200")}>
        <div className={cn(
          "p-3 flex items-center gap-3",
          type === 'admin' ? "bg-white/5" : "bg-gray-50 border border-gray-200 rounded-lg"
        )}>
          <div className={cn(
            "h-8 w-8 flex items-center justify-center font-bold text-xs",
            type === 'admin' ? "bg-white/10 text-white" : "bg-gray-900 text-white rounded-md"
          )}>
            {type === 'admin' ? 'A' : 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className={cn("text-xs font-semibold truncate", type === 'admin' ? "text-white" : "text-gray-900")}>
              {type === 'admin' ? 'Admin Access' : 'User Account'}
            </span>
            <span className={cn("text-[10px] font-medium", type === 'admin' ? "text-gray-500" : "text-gray-400")}>
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
