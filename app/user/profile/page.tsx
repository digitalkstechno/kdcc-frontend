"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Camera, Phone, MapPin, Clock, Globe, User, Pencil, Check, X, Loader2, Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchProfile, updateProfile } from "@/lib/redux/slices/authSlice";
import { toast } from "sonner";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [localProfile, setLocalProfile] = useState({
    name: "",
    number: "",
    location: "",
    timing: "",
    website: "",
    profileImage: "",
    logo: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>("");
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setLocalProfile({
        name: user.name || "",
        number: user.number || "",
        location: user.location || "",
        timing: user.timing || "",
        website: user.website || "",
        profileImage: user.profileImage || "",
        logo: user.logo || "",
      });
    }
  }, [user]);

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const saveField = () => {
    if (editingField) {
      setLocalProfile((prev) => ({ ...prev, [editingField]: tempValue }));
      setEditingField(null);
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append("name", localProfile.name);
    formData.append("number", localProfile.number);
    formData.append("location", localProfile.location);
    formData.append("timing", localProfile.timing);
    formData.append("website", localProfile.website);

    if (selectedFile) formData.append("profileImage", selectedFile);
    if (selectedLogo) formData.append("logo", selectedLogo);

    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success("Profile updated successfully");
      setSelectedFile(null);
      setSelectedLogo(null);
      setPreviewUrl("");
      setLogoPreviewUrl("");
    } catch (err: any) {
      toast.error(err || "Failed to update profile");
    }
  };

  const fields = [
    { key: "name", label: "Full Name", icon: User, placeholder: "Enter full name" },
    { key: "number", label: "Phone Number", icon: Phone, placeholder: "Enter phone number" },
    { key: "location", label: "Address", icon: MapPin, placeholder: "Enter address" },
    { key: "timing", label: "Timing", icon: Clock, placeholder: "e.g. Mon-Sat: 9AM - 6PM" },
    { key: "website", label: "Website", icon: Globe, placeholder: "Enter website URL" },
  ];

  const getImageUrl = () => {
    if (previewUrl) return previewUrl;
    if (localProfile.profileImage) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1/api";
      const baseUrl = apiUrl.split("/v1/api")[0];
      return `${baseUrl}/builder/${localProfile.profileImage}`;
    }
    return "";
  };

  const getLogoUrl = () => {
    if (logoPreviewUrl) return logoPreviewUrl;
    if (localProfile.logo) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1/api";
      const baseUrl = apiUrl.split("/v1/api")[0];
      return `${baseUrl}/builder/${localProfile.logo}`;
    }
    return "";
  };

  if (loading && !user) {
    return (
      <DashboardLayout type="user">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout type="user">
      <div className="mx-auto space-y-6">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">Profile Settings</p>
           <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Profile Image</p>
              <div className="relative">
                <div className="h-28 w-28 bg-gray-50 border border-gray-200 rounded-3xl overflow-hidden flex items-center justify-center shadow-inner">
                  {getImageUrl() ? (
                    <img src={getImageUrl()} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User size={36} className="text-gray-300" />
                  )}
                </div>
                <button onClick={() => fileRef.current?.click()} className="absolute -bottom-2 -right-2 h-9 w-9 bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors rounded-full border-2 border-white shadow-lg"><Camera size={16} /></button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Company Logo</p>
              <div className="relative">
                <div className="h-28 w-28 bg-gray-50 border border-gray-200 rounded-3xl overflow-hidden flex items-center justify-center shadow-inner">
                  {getLogoUrl() ? (
                    <img src={getLogoUrl()} alt="Logo" className="h-full w-full object-contain p-2" />
                  ) : (
                    <Globe size={36} className="text-gray-300" />
                  )}
                </div>
                <button onClick={() => logoRef.current?.click()} className="absolute -bottom-2 -right-2 h-9 w-9 bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors rounded-full border-2 border-white shadow-lg"><Camera size={16} /></button>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="divide-y divide-gray-50">
            {fields.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key} className="flex items-start justify-between py-4 gap-4 group">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="h-9 w-9 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                    <Icon size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
                    {editingField === key ? (
                      <input
                        autoFocus
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveField()}
                        placeholder={placeholder}
                        className="w-full border-b-2 border-blue-600 bg-blue-50/50 px-2 py-1 text-sm font-semibold focus:outline-none transition-all"
                      />
                    ) : (
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {(localProfile as any)[key] || <span className="text-gray-300 italic font-normal">Not set</span>}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 pt-1">
                  {editingField === key ? (
                    <>
                      <button onClick={saveField} className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 transition-all rounded-lg flex items-center justify-center">
                        <Check size={18} />
                      </button>
                      <button onClick={cancelEdit} className="h-8 w-8 text-red-500 hover:bg-red-50 transition-all rounded-lg flex items-center justify-center">
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(key, (localProfile as any)[key])}
                      className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg flex items-center justify-center"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full mt-8 bg-blue-600 text-white py-4 text-sm font-black uppercase tracking-widest hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 rounded-2xl shadow-xl shadow-blue-500/25 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {loading ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

