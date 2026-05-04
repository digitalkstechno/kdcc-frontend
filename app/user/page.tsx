"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import Link from "next/link";
import {
  User, Phone, MapPin, Clock, Globe, Image as ImageIcon,
  Video, FileText, MessageSquare, Calendar, Users, QrCode
} from "lucide-react";

const navItems = [
  { label: "Profile",      href: "/user/profile",      icon: User,         color: "bg-blue-50 text-blue-600" },
  { label: "Contact",      href: "/user/contact",       icon: Users,        color: "bg-purple-50 text-purple-600" },
  { label: "About Us",     href: "/user/about",         icon: MessageSquare,color: "bg-emerald-50 text-emerald-600" },
  { label: "Appointment",  href: "/user/appointment",   icon: Calendar,     color: "bg-orange-50 text-orange-600" },
  { label: "Location",     href: "/user/location",      icon: MapPin,       color: "bg-rose-50 text-rose-600" },
  { label: "Photos",       href: "/user/photos",        icon: ImageIcon,    color: "bg-yellow-50 text-yellow-600" },
  { label: "Videos",       href: "/user/videos",        icon: Video,        color: "bg-sky-50 text-sky-600" },
  { label: "Brochure",     href: "/user/brochure",      icon: FileText,     color: "bg-indigo-50 text-indigo-600" },
  { label: "Inquiry",      href: "/user/inquiry",       icon: Phone,        color: "bg-teal-50 text-teal-600" },
  { label: "Advertisement",href: "/user/advertisement", icon: Globe,        color: "bg-pink-50 text-pink-600" },
  { label: "Popup",        href: "/user/popup",         icon: QrCode,       color: "bg-amber-50 text-amber-600" },
  { label: "QR Code",      href: "/user/qr",            icon: QrCode,       color: "bg-gray-100 text-gray-600" },
];

export default function UserPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <DashboardLayout type="user">
      <div className="space-y-4">
        {/* Welcome */}
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Welcome back</p>
          <p className="text-lg font-black text-gray-900 mt-0.5">{user?.name || "User"}</p>
          <p className="text-xs text-gray-400 mt-0.5">{user?.email || ""}</p>
        </div>

        {/* Nav Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {navItems.map(({ label, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-4 px-2 hover:border-gray-300 hover:shadow-sm transition-all active:scale-95"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
