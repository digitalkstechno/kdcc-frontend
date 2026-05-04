"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Pencil, Trash2, Camera, Loader2, Save, X } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { toast } from "sonner";
import api from "@/lib/axios";

// Import Quill CSS
import "react-quill-new/dist/quill.snow.css";

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-gray-50 animate-pulse border border-gray-200 rounded-md" />
});

interface AboutSection {
  _id: string;
  title: string;
  content: string;
  image: string;
}

export default function AboutPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // States for new section
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedNewFile, setSelectedNewFile] = useState<File | null>(null);
  const [newPreview, setNewPreview] = useState("");
  
  // States for editing section
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [selectedEditFile, setSelectedEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState("");
  const [imageRemoved, setImageRemoved] = useState(false);

  const newFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  // Quill Formats - excluding background and color to prevent saving unwanted styles from paste
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image'
  ];

  // Quill Modules Configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  }), []);

  useEffect(() => {
    if (user?._id) {
      fetchSections();
    }
  }, [user]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/about-section/user/${user._id}`);
      if (response.data.status === "Success") {
        setSections(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch sections");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!newContent.trim() || newContent === "<p><br></p>") {
      toast.error("Content is required");
      return;
    }

    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("content", newContent);
    if (selectedNewFile) {
      formData.append("image", selectedNewFile);
    }

    try {
      setIsSaving(true);
      const response = await api.post("/about-section/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.status === "Success") {
        toast.success("Section added successfully");
        setSections([...sections, response.data.data]);
        setShowAddForm(false);
        setNewTitle("");
        setNewContent("");
        setNewPreview("");
        setSelectedNewFile(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add section");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (section: AboutSection) => {
    setEditingId(section._id);
    setEditTitle(section.title);
    setEditContent(section.content);
    setEditPreview(getSectionImage(section.image));
    setSelectedEditFile(null);
    setImageRemoved(false);
  };

  const saveEdit = async () => {
    if (!editTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!editContent.trim() || editContent === "<p><br></p>") {
        toast.error("Content is required");
        return;
    }

    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("content", editContent);
    if (selectedEditFile) {
      formData.append("image", selectedEditFile);
    } else if (imageRemoved) {
      formData.append("removeImage", "true");
    }

    try {
      setIsSaving(true);
      const response = await api.put(`/about-section/update/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.status === "Success") {
        toast.success("Section updated successfully");
        setSections(sections.map((s) => s._id === editingId ? response.data.data : s));
        setEditingId(null);
        setEditTitle("");
        setEditContent("");
        setEditPreview("");
        setSelectedEditFile(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update section");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    try {
      const response = await api.delete(`/about-section/delete/${id}`);
      if (response.data.status === "Success") {
        toast.success("Section deleted successfully");
        setSections(sections.filter((s) => s._id !== id));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete section");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isEdit) {
        setSelectedEditFile(file);
        setEditPreview(URL.createObjectURL(file));
        setImageRemoved(false);
      } else {
        setSelectedNewFile(file);
        setNewPreview(URL.createObjectURL(file));
      }
    }
  };

  const removeSelectedImage = (isEdit: boolean) => {
    if (isEdit) {
      setSelectedEditFile(null);
      setEditPreview("");
      setImageRemoved(true);
      if (editFileRef.current) editFileRef.current.value = "";
    } else {
      setSelectedNewFile(null);
      setNewPreview("");
      if (newFileRef.current) newFileRef.current.value = "";
    }
  };

  const getSectionImage = (imageName: string) => {
    if (!imageName) return "";
    if (imageName.startsWith("blob:")) return imageName;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1/api";
    const baseUrl = apiUrl.split("/v1/api")[0];
    return `${baseUrl}/builder/${imageName}`;
  };

  return (
    <DashboardLayout type="user">
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white border border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">About Sections</h2>
            <p className="text-sm text-gray-400 mt-0.5">{sections.length} section{sections.length !== 1 ? "s" : ""} added</p>
          </div>
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={15} /> Add Section
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white border border-blue-200 p-6 space-y-4 shadow-md rounded-xl">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">New About Section</p>
            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="relative shrink-0">
                  <div className="h-28 w-28 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
                    {newPreview ? <img src={newPreview} className="h-full w-full object-cover" alt="" /> : <Camera size={32} className="text-gray-300" />}
                  </div>
                  {newPreview && (
                    <button onClick={() => removeSelectedImage(false)} className="absolute -top-2 -right-2 h-7 w-7 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 rounded-full shadow-lg border-2 border-white z-10"><X size={16} /></button>
                  )}
                  <button onClick={() => newFileRef.current?.click()} className="absolute -bottom-2 -right-2 h-9 w-9 bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 rounded-full shadow-lg border-2 border-white"><Plus size={20} /></button>
                  <input ref={newFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, false)} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Section Title*</label>
                    <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Our Vision"
                      className="w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Content Description*</label>
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                  <ReactQuill 
                    theme="snow" 
                    value={newContent} 
                    onChange={setNewContent} 
                    modules={modules}
                    formats={formats}
                    placeholder="Write detailed information here..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button 
                onClick={() => { setShowAddForm(false); setNewTitle(""); setNewContent(""); setNewPreview(""); setSelectedNewFile(null); }} 
                className="px-6 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button onClick={handleAdd} disabled={isSaving} className="px-8 py-2.5 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Add Section
              </button>
            </div>
          </div>
        )}

        {/* Sections List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : sections.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-20 text-center">
              <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="text-gray-300" size={32} />
              </div>
              <p className="text-gray-400 font-medium text-lg">No about sections added yet.</p>
              <p className="text-gray-400 text-sm mt-1">Start by adding your first section like "Mission" or "Experience"</p>
            </div>
          ) : (
            sections.map((section) => (
              <div key={section._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                {editingId === section._id ? (
                  <div className="p-6 space-y-6">
                    <div className="flex gap-6">
                      <div className="relative shrink-0">
                        <div className="h-24 w-24 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                          {editPreview ? <img src={editPreview} className="h-full w-full object-cover" alt="" /> : <Camera size={28} className="text-gray-300" />}
                        </div>
                        {editPreview && (
                          <button onClick={() => removeSelectedImage(true)} className="absolute -top-2 -right-2 h-7 w-7 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 rounded-full shadow-lg border-2 border-white z-10"><X size={16} /></button>
                        )}
                        <button onClick={() => editFileRef.current?.click()} className="absolute -bottom-2 -right-2 h-8 w-8 bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 rounded-full border-2 border-white shadow-lg"><Camera size={14} /></button>
                        <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, true)} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Section Title</label>
                        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full border border-blue-200 bg-blue-50/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-xl" placeholder="Section Title" />
                      </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Content Description</label>
                        <div className="bg-white rounded-xl overflow-hidden border border-blue-200">
                          <ReactQuill theme="snow" value={editContent} onChange={setEditContent} modules={modules} formats={formats} />

                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => { setEditingId(null); setEditPreview(""); setSelectedEditFile(null); setEditContent(""); }} className="px-5 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-xl">Cancel</button>
                        <button onClick={saveEdit} disabled={isSaving} className="px-8 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20">
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Update Section
                        </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex flex-col md:flex-row gap-6">
                    {section.image && (
                      <div className="h-40 md:w-60 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                        <img src={getSectionImage(section.image)} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-black text-[#333333] truncate">{section.title}</h3>
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(section)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Pencil size={18} /></button>
                          <button onClick={() => deleteSection(section._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed rich-content">
                         <div dangerouslySetInnerHTML={{ __html: section.content }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}



