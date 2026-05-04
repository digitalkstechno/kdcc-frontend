"use client";

import DashboardLayout from "@/components/DashboardLayout";
import CommonTable from "@/components/CommonTable";
import { Plus, Users, Trash2, Check, X, FileText, Phone, MapPin, Building2, Briefcase, Globe, Download } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";

import Cropper, { Area } from 'react-easy-crop';

const getCroppedImg = (
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(null);

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    };
    image.onerror = (error) => reject(error);
  });
};

const inputCls = "w-full border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all rounded-lg shadow-sm";
const labelCls = "text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5";

export default function SebaMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "", category: "", area: "", company: "",
    mobile: "", address: "", emailWebsite: "", position: "",
    officeNo: "", 
    image: null as File | null,
    pdf: null as File | null
  });

  // Cropper states
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setShowCropper(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCrop = async () => {
    if (!originalImage || !croppedAreaPixels) return;
    try {
      const blob = await getCroppedImg(originalImage, croppedAreaPixels);
      if (blob) {
        const file = new File([blob], "passport_photo.jpg", { type: "image/jpeg" });
        setFormData({ ...formData, image: file });
        setShowCropper(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/seba/member${filterStatus ? `?status=${filterStatus}` : ''}`);
      if (data.status === "Success") {
        setMembers(data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch Members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [filterStatus]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key as keyof typeof formData]) {
          form.append(key, formData[key as keyof typeof formData] as any);
        }
      });
      form.append("status", "active"); // Admin creates as active directly

      const response = await api.post('/seba/member', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.status === "Success") {
        toast.success("Created successfully!");
        setFormData({
          name: "", category: "", area: "", company: "",
          mobile: "", address: "", emailWebsite: "", position: "",
          officeNo: "", image: null, pdf: null
        });
        setIsDrawerOpen(false);
        fetchMembers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await api.put(`/seba/member/${id}/status`, { status });
      if (response.data.status === "Success") {
        toast.success(`Marked as ${status}`);
        fetchMembers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      const response = await api.delete(`/seba/member/${id}`);
      if (response.data.status === "Success") {
        toast.success("Deleted successfully");
        fetchMembers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const stats = {
    total: members.length,
    active: members.filter((m: any) => m.status === "active").length,
    pending: members.filter((m: any) => m.status === "pending").length,
    inactive: members.filter((m: any) => m.status === "inactive" || m.status === "rejected").length,
  };

  const columns = [
    {
      header: "Member Profile", accessor: "name",
      render: (row: any) => (
        <div className="flex items-center gap-4 py-1">
          <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shadow-sm flex-shrink-0">
            {row.image ? (
              <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/builder/${row.image}`} className="h-full w-full object-cover" alt={row.name} />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold text-lg">
                {row.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{row.name}</p>
            <p className="text-xs font-semibold text-indigo-600 mt-0.5">{row.position || "Member"}</p>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{row.memberId}</p>
          </div>
        </div>
      )
    },
    {
      header: "Contact Details", accessor: "mobile",
      render: (row: any) => (
        <div className="space-y-1 text-xs">
          <p className="flex items-center gap-1.5 text-gray-700 font-medium"><Phone size={13} className="text-gray-400" /> {row.mobile}</p>
          {row.officeNo && <p className="flex items-center gap-1.5 text-gray-500"><Phone size={13} className="text-gray-400" /> {row.officeNo}</p>}
          {row.emailWebsite && <p className="flex items-center gap-1.5 text-blue-600 hover:underline"><Globe size={13} className="text-gray-400" /> {row.emailWebsite}</p>}
        </div>
      )
    },
    {
      header: "Organization", accessor: "company",
      render: (row: any) => (
        <div className="space-y-1 text-xs">
          <p className="flex items-center gap-1.5 text-gray-800 font-bold"><Building2 size={13} className="text-gray-400" /> {row.company || "N/A"}</p>
          <p className="flex items-center gap-1.5 text-gray-500"><Briefcase size={13} className="text-gray-400" /> {row.category}</p>
          <p className="flex items-center gap-1.5 text-gray-500"><MapPin size={13} className="text-gray-400" /> {row.area}</p>
        </div>
      )
    },
    {
      header: "Application Form", accessor: "pdf",
      render: (row: any) => (
        <div>
          {row.pdf ? (
            <a 
              href={`${process.env.NEXT_PUBLIC_IMAGE_URL}/builder/${row.pdf}`} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-indigo-100 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all cursor-pointer shadow-sm"
            >
              <Download size={13} /> View PDF
            </a>
          ) : (
            <span className="text-xs text-gray-400">No PDF</span>
          )}
        </div>
      )
    },
    {
      header: "Status", accessor: "status",
      render: (row: any) => {
        const statusColors: any = {
          active: "bg-emerald-50 text-emerald-700 border-emerald-200",
          pending: "bg-amber-50 text-amber-700 border-amber-200",
          inactive: "bg-gray-50 text-gray-600 border-gray-200",
          rejected: "bg-red-50 text-red-700 border-red-200"
        };
        const color = statusColors[row.status] || "bg-gray-50 text-gray-600 border-gray-200";
        return (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${color}`}>
            {row.status.toUpperCase()}
          </span>
        );
      }
    },
    {
      header: "Actions", accessor: "_id",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          {row.status !== "active" && (
            <button 
              onClick={() => handleUpdateStatus(row._id, 'active')} 
              title="Activate" 
              className="p-2 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-xl transition-all shadow-sm"
            >
              <Check size={16} className="stroke-[2.5]" />
            </button>
          )}
          
          {(row.status === "active" || row.status === "pending") && (
            <button 
              onClick={() => handleUpdateStatus(row._id, 'inactive')} 
              title="Deactivate / Reject" 
              className="p-2 text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-xl transition-all shadow-sm"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>
          )}

          <button 
            onClick={() => handleDelete(row._id)} 
            title="Delete Permanently"
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-xl transition-all shadow-sm"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    },
  ];

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Members</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.total}</h3>
            </div>
            <div className="h-12 w-12 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-md">
              <Users size={22} />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active</p>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.active}</h3>
            </div>
            <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Check size={22} className="stroke-[3]" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</p>
              <h3 className="text-3xl font-extrabold text-amber-500 mt-1">{stats.pending}</h3>
            </div>
            <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <Plus size={22} className="stroke-[3]" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Inactive</p>
              <h3 className="text-3xl font-extrabold text-gray-500 mt-1">{stats.inactive}</h3>
            </div>
            <div className="h-12 w-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
              <X size={22} className="stroke-[3]" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gray-900 rounded-xl flex items-center justify-center shadow">
              <Users size={16} className="text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">SEBA Members Directory</h3>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-md transition-all"
          >
            <Plus size={16} className="stroke-[2.5]" /> Add Member
          </button>
        </div>

        {/* Slide-over Drawer with Blur Overlay */}
        {isDrawerOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end transition-all">
            <div className="w-[500px] bg-white h-screen max-h-screen shadow-2xl p-6 flex flex-col border-l border-gray-100 animate-slide-in overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-gray-900 rounded-xl flex items-center justify-center shadow">
                    <Users size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Add SEBA Member</h3>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)} 
                  className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} placeholder="First & Last Name" />
                    </div>
                    <div>
                      <label className={labelCls}>Position</label>
                      <input value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className={inputCls} placeholder="e.g. Director / Media Head" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Category *</label>
                      <input required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputCls} placeholder="e.g. Builder" />
                    </div>
                    <div>
                      <label className={labelCls}>Area *</label>
                      <input required value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className={inputCls} placeholder="e.g. Adajan / Surat" />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Company Name</label>
                    <input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className={inputCls} placeholder="M K Group" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Mobile No. *</label>
                      <input required value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className={inputCls} placeholder="Primary Contact" />
                    </div>
                    <div>
                      <label className={labelCls}>Office No.</label>
                      <input value={formData.officeNo} onChange={(e) => setFormData({ ...formData, officeNo: e.target.value })} className={inputCls} placeholder="Secondary Contact" />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Email / Website</label>
                    <input value={formData.emailWebsite} onChange={(e) => setFormData({ ...formData, emailWebsite: e.target.value })} className={inputCls} placeholder="www.domain.com" />
                  </div>

                  <div>
                    <label className={labelCls}>Office Address</label>
                    <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`${inputCls} h-[80px] py-2 resize-none`} placeholder="Full physical address" />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={labelCls}>Passport Photo</label>
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-gray-200 px-3 py-2.5 rounded-lg bg-white shadow-sm" />
                    </div>
                    <div>
                      <label className={labelCls}>Application (PDF)</label>
                      <input type="file" accept="application/pdf" onChange={(e) => setFormData({ ...formData, pdf: e.target.files?.[0] || null })} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-gray-200 px-3 py-2.5 rounded-lg bg-white shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 flex gap-3 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setIsDrawerOpen(false)} 
                    className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-60"
                  >
                    {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={16} className="stroke-[2.5]" /> Create Member</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-gray-500" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">SEBA Members Directory</h3>
            </div>
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)} 
              className="border border-gray-300 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer transition-all"
            >
              <option value="">Status: ALL RECORDS</option>
              <option value="active">Status: ACTIVE</option>
              <option value="pending">Status: PENDING</option>
              <option value="inactive">Status: INACTIVE</option>
            </select>
          </div>
          <div className="p-6">
            <CommonTable
              columns={columns}
              data={members}
              isLoading={loading}
              totalRecords={members.length}
              currentPage={1}
              limit={100}
              onPageChange={() => {}}
              onSearch={() => {}}
            />
          </div>
        </div>

        {showCropper && originalImage && (
          <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full flex flex-col items-center shadow-2xl">
              <h3 className="text-gray-900 text-sm font-extrabold uppercase tracking-wider mb-4">Adjust Passport Photo</h3>
              
              {/* Crop Frame */}
              <div className="relative w-full h-[300px] bg-gray-900 rounded-lg overflow-hidden shadow-inner">
                <Cropper
                  image={originalImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={3 / 4}
                  restrictPosition={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <p className="text-[10px] text-gray-500 font-bold mt-3">Pinch or drag to crop like mobile apps</p>

              {/* Slider */}
              <div className="w-full mt-4 flex items-center gap-3">
                <span className="text-xs text-gray-400 font-bold">Zoom</span>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  step="0.1" 
                  value={zoom} 
                  onChange={(e) => setZoom(parseFloat(e.target.value))} 
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-xs text-gray-700 font-bold w-8">{zoom.toFixed(1)}x</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 w-full">
                <button 
                  type="button" 
                  onClick={() => setShowCropper(false)} 
                  className="flex-1 bg-gray-100 text-gray-500 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleCrop} 
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md cursor-pointer"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
