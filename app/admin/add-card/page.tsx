"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Camera, Phone, MapPin, Clock, Globe, User, Loader2, Heart, CreditCard, Mail, Lock, UserPlus, Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { adminCreateUserAction } from "@/lib/redux/slices/authSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddCardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [localProfile, setLocalProfile] = useState({
    name: "",
    email: "",
    password: "",
    refer: "",
    number: "",
    whatsappNumber: "",
    location: "",
    homeAddress: "",
    timing: "",
    website: "",
    designation: "",
    bloodGroup: "",
    aadharNumber: "",
    edpNumber: "",
    instagramLink: "",
    facebookLink: "",
    youtubeLink: "",
    linkedinLink: "",
    twitterLink: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const generatePasswordString = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");

  useEffect(() => {
    setLocalProfile(prev => ({ ...prev, password: generatePasswordString() }));
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setLocalProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateUser = async () => {
    const formData = new FormData();

    Object.entries(localProfile).forEach(([key, val]) => {
      formData.append(key, val);
    });
    formData.append("role", "user");
    if (selectedFile) formData.append("profileImage", selectedFile);

    try {
      await dispatch(adminCreateUserAction(formData)).unwrap();
      toast.success("User and Card created successfully!");
      router.push("/admin");
    } catch (err: any) {
      toast.error(err || "Failed to create user");
    }
  };

  const authFields = [
    { key: "email", label: "Email Address", icon: Mail, placeholder: "john@example.com" },
    { key: "password", label: "Password", icon: Lock, placeholder: "Enter password", isPassword: true },
    { key: "refer", label: "Refer Code", icon: UserPlus, placeholder: "Optional" },
  ];

  const profileFields = [
    { key: "name", label: "Full Name", icon: User, placeholder: "Enter full name" },
    { key: "edpNumber", label: "EDP Number", icon: CreditCard, placeholder: "Enter EDP number" },
    { key: "designation", label: "Designation", icon: User, placeholder: "e.g. Senior Officer, Manager" },
    { key: "number", label: "Phone Number", icon: Phone, placeholder: "Enter phone number", numeric: true },
    { key: "whatsappNumber", label: "WhatsApp Number", icon: Phone, placeholder: "Enter WhatsApp number", numeric: true },
    { key: "location", label: "Address", icon: MapPin, placeholder: "Enter address" },
    { key: "homeAddress", label: "Home Address", icon: MapPin, placeholder: "Enter home address" },
    { key: "timing", label: "Timing", icon: Clock, placeholder: "e.g. Mon-Sat: 9AM - 6PM" },
    { key: "website", label: "Website", icon: Globe, placeholder: "Enter website URL" },
    { key: "bloodGroup", label: "Blood Group", icon: Heart, placeholder: "e.g. A+, B+, O+" },
    { key: "aadharNumber", label: "Aadhar Number", icon: CreditCard, placeholder: "Enter Aadhar number", numeric: true },
    { key: "instagramLink", label: "Instagram", icon: Globe, placeholder: "https://instagram.com/username" },
    { key: "facebookLink", label: "Facebook", icon: Globe, placeholder: "https://facebook.com/username" },
    { key: "youtubeLink", label: "YouTube", icon: Globe, placeholder: "https://youtube.com/@channel" },
    { key: "linkedinLink", label: "LinkedIn", icon: Globe, placeholder: "https://linkedin.com/in/username" },
    { key: "twitterLink", label: "X (Twitter)", icon: Globe, placeholder: "https://x.com/username" },
  ];

  return (
    <DashboardLayout type="admin">
      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Create New Card</h1>
            <p className="text-sm text-gray-500">Fill in all details to create a new user and digital card.</p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Profile Image</p>
            <div className="relative">
              <div className="h-32 w-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] overflow-hidden flex items-center justify-center transition-all hover:border-brand/50">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <User size={40} className="text-gray-300 mx-auto mb-1" />
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Upload</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 h-10 w-10 text-white flex items-center justify-center transition-all rounded-2xl border-4 border-white shadow-xl btn-brand hover:scale-110 active:scale-95"
              >
                <Camera size={18} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {/* Auth Section */}
            <div className="md:col-span-2">
              <h3 className="text-xs font-black text-brand uppercase tracking-[0.2em] border-b border-brand/10 pb-2 mb-2">Account Credentials</h3>
            </div>
            {authFields.map(({ key, label, icon: Icon, placeholder, isPassword }: any) => (
              <div key={key} className="space-y-1.5 group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-7 w-7 bg-gray-50 rounded-lg flex items-center justify-center transition-colors group-focus-within:bg-brand/10">
                    <Icon size={14} className="text-gray-400 group-focus-within:text-brand" />
                  </div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</label>
                </div>
                <div className="relative">
                  <input
                    type={isPassword && !showPassword ? "password" : "text"}
                    value={(localProfile as any)[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                  {isPassword && (
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Profile Section */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-xs font-black text-brand uppercase tracking-[0.2em] border-b border-brand/10 pb-2 mb-2">Profile Details</h3>
            </div>
            {profileFields.map(({ key, label, icon: Icon, placeholder, maxLen, numeric }: any) => (
              <div key={key} className="space-y-1.5 group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-7 w-7 bg-gray-50 rounded-lg flex items-center justify-center transition-colors group-focus-within:bg-brand/10">
                    <Icon size={14} className="text-gray-400 group-focus-within:text-brand" />
                  </div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</label>
                </div>
                <input
                  value={(localProfile as any)[key]}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (numeric) val = val.replace(/\D/g, '');
                    if (maxLen) val = val.slice(0, maxLen);
                    handleInputChange(key, val);
                  }}
                  placeholder={placeholder}
                  maxLength={maxLen}
                  inputMode={numeric ? 'numeric' : 'text'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleCreateUser}
            disabled={loading}
            className="w-full mt-12 text-white py-5 text-sm font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-all flex items-center justify-center gap-3 rounded-[2rem] disabled:opacity-50 btn-brand shadow-xl shadow-brand/20"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
            {loading ? "Creating Card..." : "Create User & Digital Card"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
