"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Trash2, Check, X, ImageIcon, Upload, Loader2, Send, MessageSquare, Power } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Popup {
  _id: string;
  type: "text" | "image" | "both";
  content?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

export default function PopupManagementPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchPopups();
    }
  }, [user]);

  const fetchPopups = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/popup/user/${user._id}`);
      if (response.data.status === "Success") {
        setPopups(response.data.data);
      }
    } catch (error: any) {
      toast.error("Failed to fetch popups");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddPopup = async () => {
    if (!content && !selectedFile) return toast.error("Please enter a message or select an image");

    try {
      setIsUploading(true);
      const formData = new FormData();
      const popupType = content && selectedFile ? "both" : selectedFile ? "image" : "text";
      formData.append("type", popupType);
      if (content) formData.append("content", content);
      if (selectedFile) formData.append("image", selectedFile);
      formData.append("isActive", "true"); 

      const response = await api.post("/popup/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "Success") {
        toast.success("Popup created and activated");
        setContent("");
        setSelectedFile(null);
        setPreview(null);
        setIsModalOpen(false);
        fetchPopups();
      }
    } catch (error) {
      toast.error("Failed to create popup");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await api.put(`/popup/toggle/${id}`, { isActive: !currentStatus });
      if (response.data.status === "Success") {
        toast.success(currentStatus ? "Deactivated" : "Activated");
        fetchPopups();
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const deletePopup = async (id: string) => {
    try {
      const response = await api.delete(`/popup/delete/${id}`);
      if (response.data.status === "Success") {
        toast.success("Deleted");
        fetchPopups();
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const getImageUrl = (imageName: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1/api";
    const baseUrl = apiUrl.split("/v1/api")[0];
    return `${baseUrl}/builder/${imageName}`;
  };

  return (
    <DashboardLayout type="user">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Popup Alerts</h2>
            <p className="text-sm text-gray-400 mt-1 font-bold">Show important banners or messages when your card is active.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#003B46] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-900/10 hover:scale-105 transition-all flex items-center gap-3 text-sm"
          >
            <Plus size={20} /> CREATE NEW POPUP
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="bg-white rounded-[40px] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-gray-900 uppercase">New Alert Popup</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div 
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden relative group"
                  >
                    {preview ? (
                      <div className="relative w-full h-full">
                        <img src={preview} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                           <span className="text-white text-xs font-black">CHANGE IMAGE</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300 mb-2">
                           <Upload size={24} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center px-4">Upload Banner Image (Optional)</span>
                      </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                  </div>

                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your alert message here... (Optional)"
                    className="w-full h-32 p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 transition-all resize-none text-sm"
                  />
                </div>

                <button 
                  onClick={handleAddPopup}
                  disabled={isUploading}
                  className="w-full bg-[#32CD32] text-white py-5 rounded-[24px] font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-sm uppercase tracking-wider"
                >
                  {isUploading ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                  ACTIVATE THIS POPUP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest pl-2">Saved Popups</h3>
          {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : popups.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed rounded-3xl text-gray-400 font-bold">No popups saved yet</div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popups.map((popup) => (
                  <div key={popup._id} className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${popup.isActive ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${popup.isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {popup.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => toggleStatus(popup._id, popup.isActive)} className={`p-2 rounded-lg transition-all ${popup.isActive ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`} title={popup.isActive ? "Deactivate" : "Activate"}>
                            <Power size={18} />
                        </button>
                        <button onClick={() => deletePopup(popup._id)} className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 rounded-lg transition-all">
                            <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex flex-col">
                      {popup.image && (
                        <div className="relative aspect-video w-full bg-gray-100">
                          <img src={getImageUrl(popup.image)} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {popup.content && (
                        <div className="p-4 text-sm font-bold text-gray-700 flex-1 whitespace-pre-wrap">
                          {popup.content}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                      {popup.type === 'text' ? <MessageSquare size={12} /> : popup.type === 'image' ? <ImageIcon size={12} /> : <div className="flex gap-1"><ImageIcon size={12}/><MessageSquare size={12}/></div>}
                      {popup.type} popup • Created {new Date(popup.createdAt as any).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
