"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Trash2, Check, X, Megaphone, Upload, Loader2, ArrowRight, Grid, Send, Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Advertisement {
  _id: string;
  type: "Advertisement" | "Running" | "Upcoming";
  image: string;
  note?: string;
}



interface PreviewFile {
  file: File;
  preview: string;
  note: string;
}

export default function AdvertisementPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"Advertisement" | "Running" | "Upcoming">("Advertisement");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // New Upload State
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?._id) {
      fetchAds();
    }
  }, [user]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/advertisement/user/${user._id}`);
      if (response.data.status === "Success") {
        setAds(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch advertisements");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      note: ""
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const updatePreviewNote = (index: number, note: string) => {
    setPreviews(prev => prev.map((item, i) => i === index ? { ...item, note } : item));
  };

  const uploadAds = async () => {
    if (previews.length === 0) return;

    try {
      setIsUploading(true);
      
      const uploadPromises = previews.map(async (item) => {
        const formData = new FormData();
        formData.append("type", activeTab);
        formData.append("note", item.note);
        formData.append("images", item.file); // Backend uses upload.array("images")
        return api.post("/advertisement/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      });

      const results = await Promise.all(uploadPromises);
      
      const newAds = results.map(res => res.data.data).flat();
      setAds(prev => [...newAds, ...prev]);
      setPreviews([]);
      toast.success(`${previews.length} advertisements added successfully`);
    } catch (error: any) {
      toast.error("Some advertisements failed to upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/advertisement/delete/${id}`);
      if (response.data.status === "Success") {
        toast.success("Advertisement deleted successfully");
        setAds(ads.filter((a) => a._id !== id));
        setDeleteId(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete advertisement");
    }
  };

  const handleUpdateStatus = async (id: string, newType: string) => {
    try {
      const response = await api.put(`/advertisement/update-type/${id}`, { type: newType });
      if (response.data.status === "Success") {
        toast.success(`Moved to ${newType}`);
        setAds(ads.map(ad => ad._id === id ? { ...ad, type: newType as any } : ad));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const getImageUrl = (imageName: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1/api";
    const baseUrl = apiUrl.split("/v1/api")[0];
    return `${baseUrl}/builder/${imageName}`;
  };

  const filteredAds = ads.filter((a) => a.type === activeTab);

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "Advertisement": return <Megaphone size={14} />;
      case "Running": return <PlayCircle size={14} />;
      case "Upcoming": return <Clock size={14} />;
      default: return null;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case "Advertisement": return "bg-purple-500";
      case "Running": return "bg-blue-500";
      case "Upcoming": return "bg-emerald-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-[#003B46] uppercase tracking-tight">Advertisement Management</h2>
            <p className="text-sm text-gray-400 mt-0.5">{ads.length} total advertisements</p>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
            {(["Advertisement", "Running", "Upcoming"] as const).map((tab) => (
               <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black rounded-lg transition-all uppercase ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
             >
               {getStatusIcon(tab)} {tab}
             </button>
            ))}
          </div>

          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
          >
            <Plus size={16} /> SELECT PHOTOS
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        </div>

        {/* Selected Previews - Before Upload */}
        {previews.length > 0 && (
          <div className="bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-black text-blue-900 uppercase">Upload Preview ({previews.length})</h3>
               <div className="flex gap-2">
                 <button onClick={() => setPreviews([])} className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg">Clear All</button>
                 <button 
                    onClick={uploadAds} 
                    disabled={isUploading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 disabled:opacity-50"
                 >
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    UPLOAD AS {activeTab.toUpperCase()}
                 </button>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {previews.map((item, index) => (
                <div key={index} className="bg-white p-3 rounded-2xl border border-blue-100 flex gap-4 shadow-sm relative group">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={item.preview} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <input 
                      type="text"
                      value={item.note}
                      onChange={(e) => updatePreviewNote(index, e.target.value)}
                      placeholder="Note for this advertisement..."
                      className="w-full text-xs font-bold p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                      <span>Status: {activeTab}</span>
                      <button onClick={() => removePreview(index)} className="text-red-400 hover:text-red-500">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Ads List */}
        {loading ? (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        ) : filteredAds.length === 0 && previews.length === 0 ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="bg-white border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-gray-50 rounded-3xl px-6 py-20 flex flex-col items-center gap-4 cursor-pointer transition-all"
          >
            <div className={`h-20 w-20 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center shadow-inner`}>
              <Megaphone size={40} />
            </div>
            <div className="text-center">
                <p className="text-lg font-bold text-gray-700">No {activeTab.toLowerCase()} advertisements yet</p>
                <p className="text-sm text-gray-400 mt-1">Select photos to show your projects in this category</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAds.map((ad) => (
              <div key={ad._id} className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white flex flex-col">
                <div className="relative aspect-square">
                  <img src={getImageUrl(ad.image)} alt="" className="h-full w-full object-cover" />

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2 z-10">
                     <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase text-white shadow-sm flex items-center gap-1 ${getStatusColor(ad.type)}`}>
                        {getStatusIcon(ad.type)} {ad.type}
                     </div>
                  </div>

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none">
                    <div className="flex gap-2">
                      {ad.type !== "Upcoming" && (
                          <button
                          title={`Move to ${ad.type === "Advertisement" ? "Running" : "Upcoming"}`}
                          onClick={() => handleUpdateStatus(ad._id, ad.type === "Advertisement" ? "Running" : "Upcoming")}
                          className="h-8 w-8 bg-white text-gray-900 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all shadow-lg"
                          >
                          <ArrowRight size={16} />
                          </button>
                      )}
                      
                      <button
                        onClick={() => setDeleteId(ad._id)}
                        className="h-8 w-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {deleteId === ad._id && (
                      <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-2 text-center animate-in fade-in zoom-in duration-200">
                          <p className="text-[10px] font-black text-gray-900 mb-2 uppercase">Delete this ad?</p>
                          <div className="flex gap-2">
                              <button onClick={() => handleDelete(ad._id)} className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md flex items-center gap-1"><Check size={12} /> YES</button>
                              <button onClick={() => setDeleteId(null)} className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md flex items-center gap-1"><X size={12} /> NO</button>
                          </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Note — always visible below image */}
                <div className="px-2 py-1.5 min-h-[28px]">
                  <p className="text-[10px] font-bold text-gray-700 leading-snug line-clamp-2">
                    {ad.note || <span className="text-gray-300 italic">No note</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
