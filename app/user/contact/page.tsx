"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Pencil, Trash2, Check, X, User, Camera, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Person {
  _id: string;
  name: string;
  designation: string;
  role: string;
  image: string;
}

export default function ContactPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPerson, setTempPerson] = useState<Partial<Person>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: "", designation: "", role: "" });
  const [selectedNewFile, setSelectedNewFile] = useState<File | null>(null);
  const [selectedEditFile, setSelectedEditFile] = useState<File | null>(null);
  const [newPreview, setNewPreview] = useState("");
  const [editPreview, setEditPreview] = useState("");
  
  const editFileRef = useRef<HTMLInputElement>(null);
  const newFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?._id) {
      fetchPersons();
    }
  }, [user]);

  const fetchPersons = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contact-person/user/${user._id}`);
      if (response.data.status === "Success") {
        setPersons(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch persons");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (person: Person) => {
    setEditingId(person._id);
    setTempPerson({ ...person });
    setEditPreview(getPersonImage(person.image));
    setSelectedEditFile(null);
  };

  const saveEdit = async () => {
    if (!tempPerson.name?.trim()) {
      toast.error("Name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", tempPerson.name || "");
    formData.append("designation", tempPerson.designation || "");
    formData.append("role", tempPerson.role || "");
    if (selectedEditFile) {
      formData.append("image", selectedEditFile);
    }

    try {
      const response = await api.put(`/contact-person/update/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.status === "Success") {
        toast.success("Person updated successfully");
        setPersons(persons.map((p) => p._id === editingId ? response.data.data : p));
        setEditingId(null);
        setTempPerson({});
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update person");
    }
  };

  const deletePerson = async (id: string) => {
    if (!confirm("Are you sure you want to delete this person?")) return;

    try {
      const response = await api.delete(`/contact-person/delete/${id}`);
      if (response.data.status === "Success") {
        toast.success("Person deleted successfully");
        setPersons(persons.filter((p) => p._id !== id));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete person");
    }
  };

  const handleEditImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedEditFile(file);
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const handleNewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedNewFile(file);
      setNewPreview(URL.createObjectURL(file));
    }
  };

  const addPerson = async () => {
    if (!newPerson.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", newPerson.name);
    formData.append("designation", newPerson.designation);
    formData.append("role", newPerson.role);
    if (selectedNewFile) {
      formData.append("image", selectedNewFile);
    }

    try {
      const response = await api.post("/contact-person/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.status === "Success") {
        toast.success("Person added successfully");
        setPersons([...persons, response.data.data]);
        setNewPerson({ name: "", designation: "", role: "" });
        setSelectedNewFile(null);
        setNewPreview("");
        setShowAddForm(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add person");
    }
  };

  const getPersonImage = (imageName: string) => {
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
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Contact Persons</h2>
            <p className="text-sm text-gray-400 mt-0.5">{persons.length} person{persons.length !== 1 ? "s" : ""} added</p>
          </div>
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={15} /> Add Person
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white border border-blue-200 p-6 space-y-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">New Person</p>
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <div className="h-20 w-20 bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                  {newPreview ? <img src={newPreview} className="h-full w-full object-cover" alt="" /> : <User size={28} className="text-gray-300" />}
                </div>
                <button onClick={() => newFileRef.current?.click()} className="absolute -bottom-2 -right-2 h-7 w-7 bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-shadow rounded-full"><Camera size={13} /></button>
                <input ref={newFileRef} type="file" accept="image/*" className="hidden" onChange={handleNewImage} />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={newPerson.name} onChange={(e) => setNewPerson((p) => ({ ...p, name: e.target.value }))} placeholder="Full Name *"
                  className="w-full border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md" />
                <input value={newPerson.designation} onChange={(e) => setNewPerson((p) => ({ ...p, designation: e.target.value }))} placeholder="Designation (e.g. Director)"
                  className="w-full border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md" />
                <input value={newPerson.role} onChange={(e) => setNewPerson((p) => ({ ...p, role: e.target.value }))} placeholder="Role (e.g. Sales Expert)"
                  className="w-full border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md col-span-full" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => { setShowAddForm(false); setNewPerson({ name: "", designation: "", role: "" }); setNewPreview(""); setSelectedNewFile(null); }} 
                className="px-4 py-2 text-sm font-semibold text-gray-500 border border-gray-300 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button onClick={addPerson} className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
                Add Person
              </button>
            </div>
          </div>
        )}

        {/* Persons List */}
        <div className="bg-white border border-gray-200 divide-y divide-gray-100 min-h-[200px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : persons.length === 0 ? (
            <div className="px-6 py-12 text-center text-base text-gray-400">No persons added yet.</div>
          ) : (
            persons.map((person) => (
              <div key={person._id} className="flex items-center gap-4 px-6 py-5 hover:bg-gray-50 transition-colors">
                <div className="relative shrink-0">
                  <div className="h-14 w-14 bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                    {editingId === person._id ? (
                      editPreview ? <img src={editPreview} className="h-full w-full object-cover" alt="" /> : <User size={24} className="text-gray-300" />
                    ) : (
                      person.image ? <img src={getPersonImage(person.image)} className="h-full w-full object-cover" alt="" /> : <User size={24} className="text-gray-300" />
                    )}
                  </div>
                  {editingId === person._id && (
                    <>
                      <button onClick={() => editFileRef.current?.click()} className="absolute -bottom-2 -right-2 h-6 w-6 bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 rounded-full"><Camera size={11} /></button>
                      <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditImage} />
                    </>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === person._id ? (
                    <div className="space-y-2">
                      <input autoFocus value={tempPerson.name ?? ""} onChange={(e) => setTempPerson((p) => ({ ...p, name: e.target.value }))}
                        className="w-full border border-blue-500 bg-blue-50 px-3 py-1.5 text-sm focus:outline-none rounded" placeholder="Full Name" />
                      <input value={tempPerson.designation ?? ""} onChange={(e) => setTempPerson((p) => ({ ...p, designation: e.target.value }))}
                        className="w-full border border-blue-500 bg-blue-50 px-3 py-1.5 text-sm focus:outline-none rounded" placeholder="Designation" />
                      <input value={tempPerson.role ?? ""} onChange={(e) => setTempPerson((p) => ({ ...p, role: e.target.value }))}
                        className="w-full border border-blue-500 bg-blue-50 px-3 py-1.5 text-sm focus:outline-none rounded" placeholder="Role" />
                    </div>
                  ) : (
                    <>
                      <p className="text-base font-semibold text-gray-900 truncate">{person.name}</p>
                      <p className="text-sm text-gray-500 truncate mt-0.5">{person.designation} {person.role && `• ${person.role}`}</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {editingId === person._id ? (
                    <>
                      <button onClick={saveEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full"><Check size={18} /></button>
                      <button onClick={() => { setEditingId(null); setTempPerson({}); setEditPreview(""); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"><X size={18} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(person)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"><Pencil size={18} /></button>
                      <button onClick={() => deletePerson(person._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={18} /></button>
                    </>
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

