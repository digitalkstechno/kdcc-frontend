"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Plus, CreditCard, BarChart3, Users, Clock4, Eye, EyeOff, UserPlus, Pencil, Trash2, X, Check, Download, QrCode, ExternalLink, Search } from "lucide-react";
import { FormEvent, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, createUserAdmin, toggleUserStatus, fetchCurrentUser, clearError } from "@/lib/redux/slices/authSlice";
import { RootState, AppDispatch } from "@/lib/redux/store";
import CommonTable from "@/components/CommonTable";
import { toast } from "sonner";
import api from "@/lib/axios";
import ConfirmDialog from "@/components/ConfirmDialog";

const inputCls = "w-full border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-all rounded-md";
const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1";

export default function AdminPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { users, totalRecords, currentPage, loading, error, admin } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [edpSearchQuery, setEdpSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [checkedAdmin, setCheckedAdmin] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", number: "" });
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [plainPasswords, setPlainPasswords] = useState<Record<string, string>>({});
  const [lastCreatedPassword, setLastCreatedPassword] = useState("");
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [qrUser, setQrUser] = useState<any>(null);

  const handleDownloadExcel = async () => {
    try {
      const token = localStorage.getItem('mkgroup_admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/download-excel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download Excel');
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/user/bulk-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { created, skipped, errors } = response.data.data;
      toast.success(`✅ Created: ${created}, Skipped: ${skipped}`);
      if (errors && errors.length > 0) {
        setBulkErrors(errors);
      }
      dispatch(fetchUsers({ page: 1, search: searchQuery }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bulk upload failed');
    } finally {
      setBulkUploading(false);
      e.target.value = '';
    }
  };

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
      const timer = setTimeout(() => { 
        dispatch(fetchUsers({ page: 1, search: searchQuery, edpSearch: edpSearchQuery })); 
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, edpSearchQuery, dispatch, admin]);

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

  const handlePageChange = (page: number) => dispatch(fetchUsers({ page, search: searchQuery, edpSearch: edpSearchQuery }));

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
    // Logic moved to /admin/edit-card/[id]
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await api.delete(`/user/delete/${userId}`);
      if (response.data.status === "Success") {
        toast.success("User deleted successfully");
        setDeleteConfirm(null);
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
    if (!/^[0-9]{10}$/.test(formData.number)) {
      toast.error('Mobile number must be exactly 10 digits');
      return;
    }
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
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
    { header: "EDP No.", accessor: "edpNumber" },
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
            onClick={() => router.push(`/${row.serialNumber}/${row.name?.toLowerCase().replace(/\s+/g, '-')}`)}
            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
            title="View Card"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => setQrUser(row)}
            className="p-1.5 text-gray-400 hover:text-brand hover:bg-brand/5 rounded transition-colors"
            title="View QR Code"
          >
            <QrCode size={15} />
          </button>
          <button
            onClick={() => router.push(`/admin/edit-card/${row._id}`)}
            className="p-1.5 text-gray-400 hover:bg-orange-50 rounded transition-colors"
            style={{ '--hover-color': '#F27733' } as any}
            onMouseEnter={e => (e.currentTarget.style.color = '#F27733')}
            onMouseLeave={e => (e.currentTarget.style.color = '')}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleteConfirm(row._id)}
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

        <ConfirmDialog
          open={!!deleteConfirm}
          title="Delete User"
          message="This will permanently delete the user and their card. This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => deleteConfirm && handleDeleteUser(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          variant="danger"
        />

        {/* Bulk Upload Errors Modal */}
        {bulkErrors.length > 0 && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Upload Errors ({bulkErrors.length})</h3>
                <button onClick={() => setBulkErrors([])} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"><X size={16} /></button>
              </div>
              <p className="text-xs text-gray-500 mb-3">The following rows had validation errors and were skipped. Fix them and re-upload.</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bulkErrors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <span className="text-red-500 text-xs mt-0.5">✕</span>
                    <span className="text-xs text-red-700 font-medium">{err}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setBulkErrors([])}
                className="w-full mt-4 py-2.5 text-sm font-semibold text-white rounded-xl btn-brand"
              >
                OK, Got it
              </button>
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
          <div className="px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-900/20">
                <UserPlus size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Create New Card</h3>
                <p className="text-xs text-gray-400 mt-0.5">Initialize a new user profile and digital business card</p>
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/admin/add-card')}
              className="w-full md:w-auto flex items-center justify-center gap-2 btn-brand text-white px-8 py-3.5 text-sm font-bold rounded-xl shadow-xl shadow-brand/20 transition-all active:scale-95"
            >
              <Plus size={18} />
              Add New User & Card
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">All Cards</h3>
              <p className="text-xs text-gray-400 mt-0.5">Manage users and their card status</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer btn-brand">
                {bulkUploading ? <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={13} />}
                {bulkUploading ? 'Uploading...' : 'Bulk Upload'}
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleBulkUpload} disabled={bulkUploading} />
              </label>
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#5B3F86' }}
              >
                <Download size={13} /> Download Excel
              </button>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                <span className="text-xs text-gray-400 font-medium">Live</span>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
               <div className="relative group flex-1 w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-brand transition-colors" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="General search (name, email, number...)"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-12 py-3.5 text-sm font-semibold focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                />
              </div>
              <div className="relative group flex-1 w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text"
                  value={edpSearchQuery}
                  onChange={(e) => setEdpSearchQuery(e.target.value)}
                  placeholder="Search by EDP Number specifically"
                  className="w-full bg-blue-50/30 border border-blue-100 rounded-2xl px-12 py-3.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>
            
            <CommonTable
              columns={columns}
              data={users}
              isLoading={loading}
              totalRecords={totalRecords}
              currentPage={currentPage}
              limit={10}
              onPageChange={handlePageChange}
              onSearch={() => {}} // Controlled externally now
              hideSearch={true} // New prop needed
            />
          </div>
        </div>

        {/* QR Code Modal */}
        {qrUser && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200">
              <button 
                onClick={() => setQrUser(null)} 
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="text-center space-y-1 mb-8">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Profile QR Code</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{qrUser.name}</p>
              </div>

              <div className="relative flex flex-col items-center">
                 <div className="relative bg-white p-6 rounded-[45px] border border-gray-100 shadow-2xl flex items-center justify-center overflow-hidden mb-8">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin}/${qrUser.serialNumber}/${qrUser.name.toLowerCase().replace(/\s+/g, '-')}`)}&bgcolor=FFFFFF&color=000000&margin=20`} 
                      alt="QR Code" 
                      className="w-64 h-64 object-contain"
                    />
                    {/* Decorative corners */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 rounded-tl-[40px] m-4 border-brand" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 rounded-tr-[40px] m-4 border-brand" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 rounded-bl-[40px] m-4 border-brand" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 rounded-br-[40px] m-4 border-brand" />
                 </div>

                 <div className="grid grid-cols-2 gap-3 w-full">
                   <button
                      onClick={() => {
                        const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin}/${qrUser.serialNumber}/${qrUser.name.toLowerCase().replace(/\s+/g, '-')}`)}&bgcolor=FFFFFF&color=000000&margin=20`;
                        fetch(url).then(res => res.blob()).then(blob => {
                          const a = document.createElement('a');
                          a.href = URL.createObjectURL(blob);
                          a.download = `qr_${qrUser.name.toLowerCase().replace(/\s+/g, '_')}.png`;
                          a.click();
                        });
                      }}
                      className="flex items-center justify-center gap-2 bg-brand-light text-brand border border-brand py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                   >
                      <Download size={16} />
                      Download
                   </button>
                   <a
                      href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin}/${qrUser.serialNumber}/${qrUser.name.toLowerCase().replace(/\s+/g, '-')}`}
                      target="_blank"
                      className="flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-900/20 transition-all active:scale-95"
                   >
                      <ExternalLink size={16} />
                      Visit
                   </a>
                 </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
