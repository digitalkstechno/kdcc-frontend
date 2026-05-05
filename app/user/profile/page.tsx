"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Camera, Phone, MapPin, Clock, Globe, User, Pencil, Check, X, Loader2, Heart, CreditCard } from "lucide-react";
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
    whatsappNumber: "",
    location: "",
    homeAddress: "",
    timing: "",
    website: "",
    designation: "",
    bloodGroup: "",
    aadharNumber: "",
    edpNumber: "",
    profileImage: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setLocalProfile({
        name: user.name || "",
        number: user.number || "",
        whatsappNumber: user.whatsappNumber || "",
        location: user.location || "",
        homeAddress: user.homeAddress || "",
        timing: user.timing || "",
        website: user.website || "",
        designation: user.designation || "",
        bloodGroup: user.bloodGroup || "",
        aadharNumber: user.aadharNumber || "",
        edpNumber: user.edpNumber || "",
        profileImage: user.profileImage || "",
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

  const cancelEdit = () => setEditingField(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (localProfile.number && !/^[0-9]{10}$/.test(localProfile.number)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    if (localProfile.whatsappNumber && !/^[0-9]{10}$/.test(localProfile.whatsappNumber)) {
      toast.error('WhatsApp number must be exactly 10 digits');
      return;
    }
    if (localProfile.aadharNumber && !/^[0-9]{12}$/.test(localProfile.aadharNumber)) {
      toast.error('Aadhar number must be exactly 12 digits');
      return;
    }
    const formData = new FormData();
    const textFields: Record<string, string> = {
      name: localProfile.name,
      number: localProfile.number,
      whatsappNumber: localProfile.whatsappNumber,
      location: localProfile.location,
      designation: localProfile.designation,
      homeAddress: localProfile.homeAddress,
      timing: localProfile.timing,
      website: localProfile.website,
      edpNumber: localProfile.edpNumber,
      bloodGroup: localProfile.bloodGroup,
      aadharNumber: localProfile.aadharNumber,
    };
    Object.entries(textFields).forEach(([key, val]) => {
      formData.append(key, val);
    });
    if (selectedFile) formData.append("profileImage", selectedFile);

    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success("Profile updated successfully");
      setSelectedFile(null);
      setPreviewUrl("");
    } catch (err: any) {
      toast.error(err || "Failed to update profile");
    }
  };

  const fields = [
    { key: "name", label: "Full Name", icon: User, placeholder: "Enter full name" },
    { key: "edpNumber", label: "EDP Number", icon: CreditCard, placeholder: "Enter EDP number" },
    { key: "designation", label: "Designation", icon: User, placeholder: "e.g. Senior Officer, Manager" },
    { key: "number", label: "Phone Number", icon: Phone, placeholder: "Enter phone number", maxLen: 10, numeric: true },
    { key: "whatsappNumber", label: "WhatsApp Number", icon: Phone, placeholder: "Enter WhatsApp number", maxLen: 10, numeric: true },
    { key: "location", label: "Address", icon: MapPin, placeholder: "Enter address" },
    { key: "homeAddress", label: "Home Address", icon: MapPin, placeholder: "Enter home address" },
    { key: "timing", label: "Timing", icon: Clock, placeholder: "e.g. Mon-Sat: 9AM - 6PM" },
    { key: "website", label: "Website", icon: Globe, placeholder: "Enter website URL" },
    { key: "bloodGroup", label: "Blood Group", icon: Heart, placeholder: "e.g. A+, B+, O+" },
    { key: "aadharNumber", label: "Aadhar Number", icon: CreditCard, placeholder: "Enter 12-digit Aadhar number", maxLen: 12, numeric: true },
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

  if (loading && !user) {
    return (
      <DashboardLayout type="user">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin" size={32} style={{ color: '#C56B36' }} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout type="user">
      <div className="mx-auto space-y-6">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">Profile Settings</p>

          {/* Profile Image */}
          <div className="flex flex-col items-center mb-8">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Profile Image</p>
            <div className="relative">
              <div className="h-28 w-28 bg-gray-50 border border-gray-200 rounded-3xl overflow-hidden flex items-center justify-center shadow-inner">
                {getImageUrl() ? (
                  <img src={getImageUrl()} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User size={36} className="text-gray-300" />
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 h-9 w-9 text-white flex items-center justify-center transition-colors rounded-full border-2 border-white shadow-lg btn-brand"
              >
                <Camera size={16} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {/* Fields */}
          <div className="divide-y divide-gray-50">
            {fields.map(({ key, label, icon: Icon, placeholder, maxLen, numeric }: any) => (
              <div key={key} className="flex items-start justify-between py-4 gap-4 group">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="h-9 w-9 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 transition-colors" style={{ '--hover-bg': '#C56B3610' } as any}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#C56B3615')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                    <Icon size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
                    {editingField === key ? (
                      <input
                        autoFocus
                        value={tempValue}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (numeric) val = val.replace(/\D/g, '');
                          if (maxLen) val = val.slice(0, maxLen);
                          setTempValue(val);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && saveField()}
                        placeholder={placeholder}
                        maxLength={maxLen}
                        inputMode={numeric ? 'numeric' : 'text'}
                        className="w-full border-b-2 bg-brand-light px-2 py-1 text-sm font-semibold focus:outline-none transition-all border-brand"
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
                      className="h-8 w-8 text-gray-400 hover:bg-orange-50 transition-all rounded-lg flex items-center justify-center"
                      style={{ '--hover-color': '#C56B36' } as any}
                      onMouseEnter={e => { e.currentTarget.style.color = '#C56B36'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = ''; }}
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
            className="w-full mt-8 text-white py-4 text-sm font-black uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-3 rounded-2xl disabled:opacity-50 btn-brand"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {loading ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
