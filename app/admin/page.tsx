"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Plus, CreditCard, BarChart3, Users, Clock4, Eye, EyeOff, UserPlus, Pencil, Trash2, X, Check } from "lucide-react";
import { FormEvent, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, createUserAdmin, toggleUserStatus, fetchCurrentUser, clearError } from "@/lib/redux/slices/authSlice";
import { RootState, AppDispatch } from "@/lib/redux/store";
import CommonTable from "@/components/CommonTable";
import { toast } from "sonner";
import api from "@/lib/axios";

const inputCls = "w-full border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-all rounded-md";
const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1";

export default function AdminPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { users, totalRecords, currentPage, loading, error, admin } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [checkedAdmin, setCheckedAdmin] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", number: "" });
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [plainPasswords, setPlainPasswords] = useState<Record<string, string>>({});
  const [lastCreatedPassword, setLastCreatedPassword] = useState("");

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  const generatePasswordString = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");
  const [formData, setFormData] = useState({ name: "", email: "", number: "", password: generatePasswordString(), refer: "", role: "user" });

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  useEffect(() => {
    if (admin) {
      const timer = setTimeout(() => { dispatch(fetchUsers({ page: 1, search: searchQuery })); }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, dispatch, admin]);

  useEffect(() => {
    if (!admin) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('mkgroup_admin_token') : null;

      if (token) {
        dispatch(fetchCurrentUser()).finally(() => setCheckedAdmin(true));
      } else {
        setCheckedAdmin(true);
      }
    } else {
      setCheckedAdmin(true);
    }
  }, [admin, dispatch]);

  useEffect(() => {
    if (checkedAdmin && !admin) {
      router.push('/admin/login');
    }
  }, [checkedAdmin, admin, router]);

  const overview = useMemo(() => [
    { label: "Total Cards", value: totalRecords.toString(), icon: CreditCard },
    { label: "System Users", value: totalRecords.toString(), icon: Users },
    { label: "Total Visits", value: "1,294", icon: BarChart3 },
  ], [totalRecords]);

  const handlePageChange = (page: number) => dispatch(fetchUsers({ page, search: searchQuery }));

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    setIsUpdatingStatus(userId);
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const result = await dispatch(toggleUserStatus({ userId, status: newStatus }));
    if (toggleUserStatus.fulfilled.match(result)) toast.success(`User status updated to ${newStatus}`);
    setIsUpdatingStatus(null);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({ name: user.name || "", email: user.email || "", number: user.number || "" });
  };

  const handleUpdateUser = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put(`/user/update/${editingUser._id}`, editForm);
      if (response.data.status === "Success") {
        toast.success("User updated successfully");
        setEditingUser(null);
        dispatch(fetchUsers({ page: currentPage, search: searchQuery }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await api.delete(`/user/delete/${userId}`);
      if (response.data.status === "Success") {
        toast.success("User deleted successfully");
        dispatch(fetchUsers({ page: currentPage, search: searchQuery }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const generatePassword = () => {
    const digits = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");
    setFormData((prev) => ({ ...prev, password: digits }));
    setShowPassword(true);
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    const plainPwd = formData.password;
    const result = await dispatch(createUserAdmin(formData));
    if (createUserAdmin.fulfilled.match(result)) {
      const newUserId = (result.payload as any)?.data?._id;
      if (newUserId && plainPwd) {
        setPlainPasswords(prev => ({ ...prev, [newUserId]: plainPwd }));
      }
      setLastCreatedPassword(plainPwd);
      setFormData({ name: "", email: "", number: "", password: generatePasswordString(), refer: "", role: "user" });
      toast.success("User and Card created successfully!");
    }
  };

  const columns = [
    {
      header: "Name", accessor: "name",
      render: (row: any) => <p className="font-semibold text-gray-900">{row.name}</p>
    },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "number" },
    {
      header: "Password", accessor: "password",
      render: (row: any) => {
        const plain = row.password || plainPasswords[row._id];
        const isVisible = visiblePasswords.has(row._id);
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-mono text-gray-700 min-w-[80px]">
              {plain ? (isVisible ? plain : "••••••••") : "••••••••"}
            </span>
            {plain && (
              <button
                onClick={() => togglePasswordVisibility(row._id)}
                className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
              >
                {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            )}
          </div>
        );
      }
    },
    {
      header: "Status", accessor: "status",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            disabled={isUpdatingStatus === row._id}
            onClick={() => handleToggleStatus(row._id, row.status)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${row.status === "active" ? "bg-emerald-500" : "bg-gray-300"}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${row.status === "active" ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-xs font-semibold ${row.status === "active" ? "text-emerald-600" : "text-gray-400"}`}>{row.status}</span>
        </div>
      )
    },
    {
      header: "Created", accessor: "createdAt",
      render: (row: any) => {
        const d = new Date(row.createdAt);
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      }
    },
    {
      header: "Actions", accessor: "_id",
      render: (row: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEditUser(row)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => handleDeleteUser(row._id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    },
  ];

  return (
    <DashboardLayout type="admin">
      <div className="space-y-5">

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Edit User</h3>
                <button onClick={() => setEditingUser(null)} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
              </div>
              <form onSubmit={handleUpdateUser} className="space-y-3">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputCls} placeholder="Full Name" />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={inputCls} placeholder="Email" />
                </div>
                <div>
                  <label className={labelCls}>Mobile Number</label>
                  <input required value={editForm.number} onChange={(e) => setEditForm({ ...editForm, number: e.target.value })} className={inputCls} placeholder="Mobile Number" />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm font-semibold text-gray-500 border border-gray-300 hover:bg-gray-50 rounded-lg">Cancel</button>
                  <button type="submit" className="px-5 py-2 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 rounded-lg">Update</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overview.map((item) => (
            <div key={item.label} className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{item.value}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <item.icon size={22} className="text-gray-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Create Card Form */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <UserPlus size={15} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Create New Card</h3>
                <p className="text-xs text-gray-400 mt-0.5">Enter user credentials below</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400">
              <Clock4 size={12} /> System Ready
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} placeholder="John Doe" />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputCls} placeholder="john@example.com" />
              </div>
              <div>
                <label className={labelCls}>Mobile Number</label>
                <input required value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} className={inputCls} placeholder="9876543210" />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputCls + " pr-28"} placeholder="Enter password or generate" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button type="button" onClick={generatePassword} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-gray-100 px-2 py-1 text-[10px] uppercase font-black tracking-[0.16em] text-gray-600 hover:bg-gray-200 transition-all">
                    Generate
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    <span>Generated password is shown below.</span>
                  </div>
                  <div className="mt-1 rounded-md bg-gray-100 px-3 py-2 font-mono text-sm text-gray-900">
                    {formData.password}
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Refer Code</label>
                <input value={formData.refer} onChange={(e) => setFormData({ ...formData, refer: e.target.value })} className={inputCls} placeholder="Optional" />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors disabled:opacity-60">
                  {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={15} /> Create Card</>}
                </button>
              </div>
            </div>
            {lastCreatedPassword && (
              <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-900">
                <div className="font-semibold">Last created password:</div>
                <div className="font-mono mt-1">{lastCreatedPassword}</div>
              </div>
            )}
            {error && <p className="mt-3 text-xs font-semibold text-red-500">{error}</p>}
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">All Cards</h3>
              <p className="text-xs text-gray-400 mt-0.5">Manage users and their card status</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 bg-emerald-500 rounded-full" />
              <span className="text-xs text-gray-400 font-medium">Live</span>
            </div>
          </div>
          <div className="p-6">
            <CommonTable
              columns={columns}
              data={users}
              isLoading={loading}
              totalRecords={totalRecords}
              currentPage={currentPage}
              limit={10}
              onPageChange={handlePageChange}
              onSearch={(q) => setSearchQuery(q)}
              searchPlaceholder="Search by name, email, or number..."
            />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
