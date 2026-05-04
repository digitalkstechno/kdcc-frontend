"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Trash2, Check, X, FileText, Upload, Loader2, Download, FilePlus, FileUp } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Brochure {
  _id: string;
  title: string;
  file: string;
  fileSize?: string;
}

export default function BrochurePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?._id) {
      fetchBrochures();
    }
  }, [user]);

  const fetchBrochures = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/brochure/user/${user._id}`);
      if (response.data.status === "Success") {
        setBrochures(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch brochures");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title.trim()) {
      toast.error("Please enter a brochure title first");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("brochure", file);

    try {
      setIsUploading(true);
      const response = await api.post("/brochure/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "Success") {
        setBrochures(prev => [response.data.data, ...prev]);
        setTitle("");
        setIsModalOpen(false);
        toast.success("Brochure uploaded successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload brochure");
    } finally {
      setIsUploading(false);
      if(fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/brochure/delete/${id}`);
      if (response.data.status === "Success") {
        toast.success("Brochure deleted successfully");
        setBrochures(brochures.filter((b) => b._id !== id));
        setDeleteId(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete brochure");
    }
  };

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Brochures</h2>
            <p className="text-sm text-gray-400 mt-0.5">{brochures.length} files uploaded</p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#003B46] text-white px-6 py-2.5 text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
          >
            <Plus size={18} /> ADD NEW BROCHURE
          </button>
        </div>

        {/* Modal Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-black text-[#003B46] uppercase">New Brochure</h3>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full transition-colors">
                      <X size={24} />
                   </button>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Brochure Name</label>
                      <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Project Master Plan"
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-700"
                        autoFocus
                      />
                   </div>

                   <div className="pt-2">
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={!title.trim() || isUploading}
                        className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale"
                      >
                         {isUploading ? (
                           <Loader2 className="animate-spin" size={20} />
                         ) : (
                           <>
                             <FileUp size={20} />
                             Select PDF & Upload
                           </>
                         )}
                      </button>
                      <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
                   </div>

                   <p className="text-[10px] text-gray-400 text-center font-bold">ONLY PDF FILES SUPPORTED</p>
                </div>
             </div>
          </div>
        )}

        {/* Brochures List */}
        {loading ? (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        ) : brochures.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl px-6 py-20 flex flex-col items-center gap-4">
            <div className="h-16 w-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
              <FileText size={32} />
            </div>
            <div className="text-center">
                <p className="text-lg font-bold text-gray-700">No Brochures Found</p>
                <p className="text-sm text-gray-400 mt-1">Upload PDF brochures for your projects</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {brochures.map((item) => (
              <div key={item._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 relative group">
                <div className="h-14 w-14 bg-red-50 text-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={28} />
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-gray-800 truncate">{item.title}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">PDF</span>
                      <span className="text-[10px] text-gray-400 font-bold">{item.fileSize}</span>
                   </div>
                </div>
                
                <div className="flex items-center gap-1">
                   {deleteId === item._id ? (
                      <div className="flex gap-1 animate-in fade-in zoom-in duration-200">
                         <button onClick={() => handleDelete(item._id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check size={18} /></button>
                         <button onClick={() => setDeleteId(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={18} /></button>
                      </div>
                   ) : (
                      <button onClick={() => setDeleteId(item._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
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
