"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Camera, Phone, Globe, Mail, Pencil, Check, X, Loader2, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchProfile, updateProfile } from "@/lib/redux/slices/authSlice";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function ScreenPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [localProfile, setLocalProfile] = useState({
    secondaryNumber: "",
    whatsappNumber: "",
    facebookLink: "",
    instagramLink: "",
    email: "",
    companyName: "",
    adImage: "",
  });

  const [selectedAdImage, setSelectedAdImage] = useState<File | null>(null);
  const [adPreviewUrl, setAdPreviewUrl] = useState<string>("");
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  
  const adRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setLocalProfile({
        secondaryNumber: user.secondaryNumber || "",
        whatsappNumber: user.whatsappNumber || "",
        facebookLink: user.facebookLink || "",
        instagramLink: user.instagramLink || "",
        email: user.email || "",
        companyName: user.companyName || "",
        adImage: user.adImage || "",
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

  const handleAdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAdImage(file);
      setAdPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveScreen = async () => {
    const formData = new FormData();
    // We only need to send the fields managed on this page
    formData.append("secondaryNumber", localProfile.secondaryNumber);
    formData.append("whatsappNumber", localProfile.whatsappNumber);
    formData.append("facebookLink", localProfile.facebookLink);
    formData.append("instagramLink", localProfile.instagramLink);
    formData.append("email", localProfile.email);
    formData.append("companyName", localProfile.companyName);

    if (selectedAdImage) formData.append("adImage", selectedAdImage);

    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success("Screen settings updated successfully");
      setSelectedAdImage(null);
      setAdPreviewUrl("");
    } catch (err: any) {
      toast.error(err || "Failed to update screen settings");
    }
  };

  const handleRemoveAdImage = async () => {
    try {
      if (selectedAdImage) {
        setSelectedAdImage(null);
        setAdPreviewUrl("");
        return;
      }
      if (localProfile.adImage) {
        const response = await api.delete("/builder/me/ad-image");
        if (response.data.status === "Success") {
          toast.success("Advertisement image removed successfully");
          dispatch(fetchProfile());
        }
      }
    } catch (err: any) {
      toast.error("Failed to remove advertisement image");
    }
  };

  const screenFields = [
    { key: "companyName", label: "Company Name", icon: Globe, placeholder: "Enter company name" },
    { key: "secondaryNumber", label: "Secondary Number", icon: Phone, placeholder: "Enter secondary number" },
    { key: "whatsappNumber", label: "WhatsApp Number", icon: Phone, placeholder: "Enter WhatsApp number" },
    { key: "email", label: "Email Address", icon: Mail, placeholder: "Enter email address" },
    { key: "facebookLink", label: "Facebook Link", icon: Globe, placeholder: "Enter Facebook URL" },
    { key: "instagramLink", label: "Instagram Link", icon: Globe, placeholder: "Enter Instagram URL" },
  ];

  const getAdImageUrl = () => {
    if (adPreviewUrl) return adPreviewUrl;
    if (localProfile.adImage) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1/api";
      const baseUrl = apiUrl.split("/v1/api")[0];
      return `${baseUrl}/builder/${localProfile.adImage}`;
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
           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">Screen Settings</p>
           
           <div className="flex flex-col items-center mb-8">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Advertisement Image</p>
              <div className="relative w-full max-w-sm">
                <div className="h-40 w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl overflow-hidden flex items-center justify-center shadow-inner group transition-all">
                  {getAdImageUrl() ? (
                    <img src={getAdImageUrl()} alt="Ad" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center">
                       <Camera size={32} className="text-gray-300 mx-auto mb-2" />
                       <p className="text-[10px] text-gray-400 font-bold uppercase">Upload Ad Image</p>
                    </div>
                  )}
                </div>
                <button onClick={() => adRef.current?.click()} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 bg-white/90 text-blue-600 flex items-center justify-center hover:bg-white transition-all rounded-full shadow-xl grayscale-0 opacity-0 group-hover:opacity-100 z-10"><Camera size={20} /></button>
                <button onClick={() => adRef.current?.click()} className="absolute -bottom-2 -right-2 h-10 w-10 bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors rounded-full border-2 border-white shadow-lg z-10"><Camera size={18} /></button>
                {getAdImageUrl() && (
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveAdImage(); }} className="absolute -top-2 -right-2 h-8 w-8 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors rounded-full border-2 border-white shadow-md z-10"><Trash2 size={14} /></button>
                )}
                <input ref={adRef} type="file" accept="image/*" className="hidden" onChange={handleAdImageChange} />
              </div>
           </div>

          {/* Fields */}
          <div className="divide-y divide-gray-50">
            {screenFields.map(({ key, label, icon: Icon, placeholder }) => (
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
            onClick={handleSaveScreen}
            disabled={loading}
            className="w-full mt-8 bg-blue-600 text-white py-4 text-sm font-black uppercase tracking-widest hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 rounded-2xl shadow-xl shadow-blue-500/25 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {loading ? "Saving Changes..." : "Save Screen Changes"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
