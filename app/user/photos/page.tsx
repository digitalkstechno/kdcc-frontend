"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Trash2, Check, X, Image as ImageIcon, Upload, Loader2, Award, Grid, Send } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { toast } from "sonner";
import api from "@/lib/axios";

interface GalleryImage {
  _id: string;
  category: "Impressive" | "Awarded";
  image: string;
  title?: string;
}

interface PreviewFile {
  file: File;
  preview: string;
  note: string;
}

export default function PhotosPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [photos, setPhotos] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"Impressive" | "Awarded">("Impressive");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // New Upload State
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?._id) {
      fetchPhotos();
    }
  }, [user]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/gallery-image/user/${user._id}`);
      if (response.data.status === "Success") {
        setPhotos(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch photos");
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

  const uploadPhotos = async () => {
    if (previews.length === 0) return;

    try {
      setIsUploading(true);
      
      // We upload each photo separately if they have different notes, or use a custom endpoint.
      // But the current backend addImages takes one title for the whole batch. 
      // I'll update the loop here to upload them one by one for individual notes, 
      // or update the backend. Let's do one by one for simplicity without backend changes.
      
      const uploadPromises = previews.map(async (item) => {
        const formData = new FormData();
        formData.append("category", activeTab);
        formData.append("title", item.note);
        formData.append("images", item.file);
        return api.post("/gallery-image/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      });

      const results = await Promise.all(uploadPromises);
      
      const newImages = results.map(res => res.data.data).flat();
      setPhotos(prev => [...newImages, ...prev]);
      setPreviews([]);
      toast.success(`${previews.length} photos uploaded successfully`);
    } catch (error: any) {
      toast.error("Some photos failed to upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/gallery-image/delete/${id}`);
      if (response.data.status === "Success") {
        toast.success("Photo deleted successfully");
        setPhotos(photos.filter((p) => p._id !== id));
        setDeleteId(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete photo");
    }
  };

  const getImageUrl = (imageName: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1/api";
    const baseUrl = apiUrl.split("/v1/api")[0];
    return `${baseUrl}/builder/${imageName}`;
  };

  const filteredPhotos = photos.filter((p) => p.category === activeTab);

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-[#003B46] uppercase tracking-tight">Photo Gallery</h2>
            <p className="text-sm text-gray-400 mt-0.5">{photos.length} total photos uploaded</p>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
            <button 
              onClick={() => setActiveTab("Impressive")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "Impressive" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Grid size={14} /> IMPRESSIVE
            </button>
            <button 
              onClick={() => setActiveTab("Awarded")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "Awarded" ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Award size={14} /> AWARDED
            </button>
          </div>

          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-[#003B46] text-white px-5 py-2.5 text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
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
                    onClick={uploadPhotos} 
                    disabled={isUploading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 disabled:opacity-50"
                 >
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    UPLOAD {previews.length} PHOTOS
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
                      placeholder="Note for this photo..."
                      className="w-full text-xs font-bold p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                      <span>{activeTab} Category</span>
                      <button onClick={() => removePreview(index)} className="text-red-400 hover:text-red-500">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Gallery List */}
        {loading ? (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        ) : filteredPhotos.length === 0 && previews.length === 0 ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="bg-white border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-gray-50 rounded-3xl px-6 py-20 flex flex-col items-center gap-4 cursor-pointer transition-all"
          >
            <div className={`h-20 w-20 ${activeTab === "Awarded" ? "bg-amber-50 text-amber-400" : "bg-blue-50 text-blue-400"} rounded-2xl flex items-center justify-center shadow-inner`}>
              {activeTab === "Awarded" ? <Award size={40} /> : <ImageIcon size={40} />}
            </div>
            <div className="text-center">
                <p className="text-lg font-bold text-gray-700">No {activeTab.toLowerCase()} photos yet</p>
                <p className="text-sm text-gray-400 mt-1">Select photos to start building your gallery</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredPhotos.map((photo) => (
              <div key={photo._id} className="relative aspect-square group rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                <img src={getImageUrl(photo.image)} alt="" className="h-full w-full object-cover" />

                {/* Status Badge */}
                <div className="absolute top-2 left-2 z-10">
                   <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase text-white shadow-sm ${photo.category === 'Awarded' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                      {photo.category}
                   </div>
                </div>

                {/* Note Hover Overlay */}
                {photo.title && (
                   <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-[10px] text-white font-bold truncate">{photo.title}</p>
                   </div>
                )}

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                  {deleteId === photo._id ? (
                    <div className="flex flex-col gap-1 p-2 bg-white rounded-xl scale-90">
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(photo._id)} className="h-8 w-8 bg-red-500 text-white rounded-lg flex items-center justify-center"><Check size={14} /></button>
                        <button onClick={() => setDeleteId(null)} className="h-8 w-8 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center"><X size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteId(photo._id)}
                      className="opacity-0 group-hover:opacity-100 h-10 w-10 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
