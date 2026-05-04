"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Trash2, Check, X, Video, Upload, Loader2, Award, Grid, Send } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { toast } from "sonner";
import api from "@/lib/axios";

interface GalleryVideo {
  _id: string;
  category: "General" | "Awarded";
  video: string;
}

interface PreviewFile {
  file: File;
  preview: string;
}

export default function VideosPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?._id) {
      fetchVideos();
    }
  }, [user]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/gallery-video/user/${user._id}`);
      if (response.data.status === "Success") {
        setVideos(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch videos");
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
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const uploadVideos = async () => {
    if (previews.length === 0) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      previews.forEach((item) => {
        formData.append("videos", item.file);
      });

      const response = await api.post("/gallery-video/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "Success") {
        setVideos(prev => [...response.data.data, ...prev]);
        setPreviews([]);
        toast.success(`${previews.length} videos uploaded successfully`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload videos");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/gallery-video/delete/${id}`);
      if (response.data.status === "Success") {
        toast.success("Video deleted successfully");
        setVideos(videos.filter((v) => v._id !== id));
        setDeleteId(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete video");
    }
  };

  const getVideoUrl = (videoName: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1/api";
    const baseUrl = apiUrl.split("/v1/api")[0];
    return `${baseUrl}/builder/${videoName}`;
  };

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-[#003B46] uppercase tracking-tight">Video Gallery</h2>
            <p className="text-sm text-gray-400 mt-0.5">{videos.length} total videos uploaded</p>
          </div>
          
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-[#003B46] text-white px-5 py-2.5 text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
          >
            <Plus size={16} /> SELECT VIDEOS
          </button>
          <input ref={fileRef} type="file" accept="video/*" multiple className="hidden" onChange={handleFileSelect} />
        </div>

        {/* Upload Previews */}
        {previews.length > 0 && (
          <div className="bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-black text-blue-900 uppercase">Video Upload Preview ({previews.length})</h3>
               <div className="flex gap-2">
                 <button onClick={() => setPreviews([])} className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg">Clear All</button>
                 <button 
                    onClick={uploadVideos} 
                    disabled={isUploading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 disabled:opacity-50"
                 >
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    UPLOAD {previews.length} VIDEOS
                 </button>
               </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {previews.map((item, index) => (
                <div key={index} className="relative aspect-video rounded-2xl overflow-hidden border-2 border-white shadow-md">
                  <video src={item.preview} className="w-full h-full object-cover" muted />
                  <button onClick={() => setPreviews(prev => prev.filter((_, i) => i !== index))} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Videos Grid */}
        {loading ? (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        ) : videos.length === 0 && previews.length === 0 ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="bg-white border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-gray-50 rounded-3xl px-6 py-20 flex flex-col items-center gap-4 cursor-pointer transition-all"
          >
            <div className="h-20 w-20 bg-blue-50 text-blue-400 rounded-2xl flex items-center justify-center shadow-inner">
              <Video size={40} />
            </div>
            <div className="text-center">
                <p className="text-lg font-bold text-gray-700">No videos yet</p>
                <p className="text-sm text-gray-400 mt-1">Upload project videos or achievements</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((item) => (
              <div key={item._id} className="relative aspect-video group rounded-2xl overflow-hidden border border-gray-100 bg-black shadow-sm h-48">
                <video src={getVideoUrl(item.video)} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" controls />

                {/* Status Badge - Removed */}

                {/* Delete Control */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {deleteId === item._id ? (
                    <div className="flex gap-1 bg-white p-1 rounded-lg">
                      <button onClick={() => handleDelete(item._id)} className="h-7 w-7 bg-red-500 text-white rounded-md flex items-center justify-center"><Check size={14} /></button>
                      <button onClick={() => setDeleteId(null)} className="h-7 w-7 bg-gray-100 text-gray-700 rounded-md flex items-center justify-center"><X size={14} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteId(item._id)}
                      className="h-8 w-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 shadow-lg shadow-red-500/30"
                    >
                      <Trash2 size={16} />
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
