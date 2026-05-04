"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Pencil, Trash2, Check, X, MapPin, Phone, Mail, Globe, Map, Loader2, MessageSquare } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Location {
  _id: string;
  title: string;
  address: string;
  whatsappNumber: string;
  email: string;
  website: string;
  googleMapLink: string;
}

const emptyLocation = { title: "", address: "", whatsappNumber: "", email: "", website: "", googleMapLink: "" };
const inputCls = "w-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all";
const labelCls = "text-xs font-bold text-gray-500 uppercase ml-1 block mb-1";

export default function LocationPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyLocation);

  useEffect(() => {
    if (user?._id) {
      fetchLocations();
    }
  }, [user]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/location/user/${user._id}`);
      if (response.data.status === "Success") {
        setLocations(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.title.trim()) {
      toast.error("Location title is required");
      return;
    }
    try {
      setIsSaving(true);
      const response = await api.post("/location/add", formData);
      if (response.data.status === "Success") {
        toast.success("Location added successfully");
        setLocations([...locations, response.data.data]);
        setFormData(emptyLocation);
        setShowForm(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add location");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (loc: Location) => {
    setEditingId(loc._id);
    setFormData({
      title: loc.title,
      address: loc.address,
      whatsappNumber: loc.whatsappNumber || "",
      email: loc.email || "",
      website: loc.website || "",
      googleMapLink: loc.googleMapLink || "",
    });
  };

  const saveEdit = async () => {
    if (!formData.title.trim()) {
      toast.error("Location title is required");
      return;
    }
    try {
      setIsSaving(true);
      const response = await api.put(`/location/update/${editingId}`, formData);
      if (response.data.status === "Success") {
        toast.success("Location updated successfully");
        setLocations(locations.map((l) => l._id === editingId ? response.data.data : l));
        setEditingId(null);
        setFormData(emptyLocation);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update location");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLocation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      const response = await api.delete(`/location/delete/${id}`);
      if (response.data.status === "Success") {
        toast.success("Location deleted successfully");
        setLocations(locations.filter((l) => l._id !== id));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete location");
    }
  };

  const fields: { key: keyof typeof emptyLocation; label: string; icon: any; placeholder: string; full?: boolean }[] = [
    { key: "title", label: "Office / Branch Name*", icon: MapPin, placeholder: "e.g. Sales Office, Head Office, Branch 1" },
    { key: "whatsappNumber", label: "WhatsApp Number", icon: MessageSquare, placeholder: "e.g. +91 98XXX XXXXX" },
    { key: "address", label: "Full Physical Address*", icon: MapPin, placeholder: "Shop No, Building Name, Area, City, State - Pincode", full: true },
    { key: "email", label: "Email Address", icon: Mail, placeholder: "e.g. office@company.com" },
    { key: "website", label: "Website URL", icon: Globe, placeholder: "e.g. https://www.yourcompany.com" },
    { key: "googleMapLink", label: "Google Maps Share Link", icon: Map, placeholder: "Paste Google Maps 'Share' link here...", full: true },
  ];

  const renderForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {fields.map(({ key, label, icon: Icon, placeholder, full }) => (
        <div key={key} className={full ? "md:col-span-2" : ""}>
          <label className={labelCls}>{label}</label>
          <div className="relative">
            <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={formData[key]} 
              onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))} 
              placeholder={placeholder} 
              className={inputCls} 
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <DashboardLayout type="user">
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white border border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm rounded-xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Manage Locations</h2>
            <p className="text-sm text-gray-400 mt-0.5">{locations.length} location{locations.length !== 1 ? "s" : ""} added</p>
          </div>
          <button onClick={() => { setShowForm(true); setFormData(emptyLocation); }} className="flex items-center gap-1.5 bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md">
            <Plus size={16} /> Add Location
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white border border-blue-200 p-6 space-y-6 shadow-lg rounded-2xl">
            <p className="text-sm font-black text-[#003B46] uppercase tracking-widest">New Location Details</p>
            {renderForm()}
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => { setShowForm(false); setFormData(emptyLocation); }} className="px-6 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl">Cancel</button>
              <button onClick={handleAdd} disabled={isSaving} className="px-8 py-2.5 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add Location
              </button>
            </div>
          </div>
        )}

        {/* Locations List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : locations.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 px-6 py-16 text-center rounded-2xl">
              <p className="text-gray-400 font-medium">No locations added yet. Add your office or branch address.</p>
            </div>
          ) : (
            locations.map((loc) => (
              <div key={loc._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-blue-100 p-1.5 rounded-lg">
                      <MapPin size={18} className="text-blue-600" />
                    </div>
                    <span className="text-base font-black text-[#003B46] uppercase">{loc.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === loc._id ? (
                      <>
                        <button onClick={saveEdit} disabled={isSaving} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check size={20} /></button>
                        <button onClick={() => { setEditingId(null); setFormData(emptyLocation); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={20} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(loc)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Pencil size={18} /></button>
                        <button onClick={() => deleteLocation(loc._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {editingId === loc._id ? renderForm() : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 bg-blue-50/30 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
                        <MapPin size={18} className="text-blue-600 mt-1 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-0.5">Physical Address</p>
                          <p className="text-sm text-gray-800 font-medium leading-relaxed">{loc.address}</p>
                        </div>
                      </div>
                      
                      {[
                        { icon: MessageSquare, label: "WhatsApp", value: loc.whatsappNumber },
                        { icon: Mail, label: "Email", value: loc.email },
                        { icon: Globe, label: "Website", value: loc.website },
                      ].map(({ icon: Icon, label, value }) => value ? (
                        <div key={label} className="flex items-start gap-3">
                          <div className="bg-gray-100 p-2 rounded-lg shrink-0">
                            <Icon size={16} className="text-gray-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{label}</p>
                            <p className="text-sm text-gray-800 font-bold truncate">{value}</p>
                          </div>
                        </div>
                      ) : null)}

                      {loc.googleMapLink && (
                        <div className="md:col-span-2 pt-2">
                          <a 
                            href={loc.googleMapLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-2.5 bg-[#003B46] text-white px-6 py-3 text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                          >
                            <Map size={18} /> OPEN IN GOOGLE MAPS
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
