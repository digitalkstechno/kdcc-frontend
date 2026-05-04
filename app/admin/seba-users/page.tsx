"use client";

import DashboardLayout from "@/components/DashboardLayout";
import CommonTable from "@/components/CommonTable";
import { Plus, Users, Trash2, X, Phone } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";

const inputCls = "w-full border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg shadow-sm";
const labelCls = "text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5";

export default function SebaUsersPage() {
  const [users, setUsers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [formData, setFormData] = useState({ name: "", mobile: "" });
  
  const fetchUsers = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const { data } = await api.get(`/seba/user?page=${page}&limit=10&search=${search}`);
      if (data.status === "Success") {
        setUsers(data.data);
        setTotalRecords(data.total);
        setCurrentPage(page);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch SEBA users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1, searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/seba/user', formData);
      if (response.data.status === "Success") {
        toast.success("SEBA User created successfully!");
        setFormData({ name: "", mobile: "" });
        setIsDrawerOpen(false);
        fetchUsers(1, searchQuery);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create SEBA user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this SEBA user?")) return;
    try {
      const response = await api.delete(`/seba/user/${userId}`);
      if (response.data.status === "Success") {
        toast.success("User deleted successfully");
        fetchUsers(currentPage, searchQuery);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const columns = [
    {
      header: "Name", accessor: "name",
      render: (row: any) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 font-bold rounded-xl flex items-center justify-center border border-indigo-100">
            {row.name.charAt(0)}
          </div>
          <p className="font-bold text-gray-900 text-sm">{row.name}</p>
        </div>
      )
    },
    { 
      header: "Mobile No.", accessor: "mobile",
      render: (row: any) => (
        <p className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
          <Phone size={13} className="text-gray-400" />
          {row.mobile}
        </p>
      )
    },
    {
      header: "Status", accessor: "status",
      render: (row: any) => (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${row.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
          {row.status.toUpperCase()}
        </span>
      )
    },
    {
      header: "Created Date", accessor: "createdAt",
      render: (row: any) => {
        const d = new Date(row.createdAt);
        return <span className="text-xs text-gray-500 font-medium">{`${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`}</span>;
      }
    },
    {
      header: "Actions", accessor: "_id",
      render: (row: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleDeleteUser(row._id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gray-900 rounded-xl flex items-center justify-center shadow">
              <Users size={16} className="text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">SEBA Users Directory</h3>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-md transition-all"
          >
            <Plus size={16} className="stroke-[2.5]" /> Register User
          </button>
        </div>

        {/* Slide-over Drawer with Blur Overlay */}
        {isDrawerOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end transition-all">
            <div className="w-[450px] bg-white h-full shadow-2xl p-6 flex flex-col border-l border-gray-100 animate-slide-in">
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-gray-900 rounded-xl flex items-center justify-center">
                    <Users size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Register SEBA User</h3>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)} 
                  className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} placeholder="User Name" />
                  </div>
                  <div>
                    <label className={labelCls}>Mobile Number *</label>
                    <input required value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className={inputCls} placeholder="10-digit number" />
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
                    {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={16} className="stroke-[2.5]" /> Register</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Registered Users</h3>
          </div>
          <div className="p-6">
            <CommonTable
              columns={columns}
              data={users}
              isLoading={loading}
              totalRecords={totalRecords}
              currentPage={currentPage}
              limit={10}
              onPageChange={(page) => fetchUsers(page, searchQuery)}
              onSearch={(q) => setSearchQuery(q)}
              searchPlaceholder="Search by name or mobile..."
            />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
