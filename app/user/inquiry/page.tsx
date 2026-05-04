"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Trash2, 
  Check, 
  X, 
  Loader2,
  Search,
  Phone,
  Mail,
  Calendar
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Inquiry {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  message: string;
  createdAt: string;
}

export default function InquiryPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?._id) {
      fetchInquiries();
    }
  }, [user]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/inquiry/user`);
      if (response.data.status === "Success") {
        setInquiries(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/inquiry/delete/${id}`);
      if (response.data.status === "Success") {
        toast.success("Inquiry deleted successfully");
        setInquiries(inquiries.filter((inq) => inq._id !== id));
        setDeleteId(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete inquiry");
    }
  };

  const filteredInquiries = inquiries.filter(inq => 
    inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inq.mobile.includes(searchQuery) ||
    inq.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Leads & Inquiries</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track your project inquiries</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search enquiries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
             <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-blue-600" size={32} />
             </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="py-20 text-center">
               <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
               <p className="text-gray-500 font-bold">No Inquiries Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Message</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredInquiries.map((inq) => (
                    <tr key={inq._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400">
                        {formatDate(inq.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">{inq.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <a href={`tel:${inq.mobile}`} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                            <Phone size={12} /> {inq.mobile}
                          </a>
                          {inq.email && (
                            <a href={`mailto:${inq.email}`} className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
                              <Mail size={12} /> {inq.email}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-600 font-medium leading-relaxed italic line-clamp-2" title={inq.message}>
                          "{inq.message}"
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end items-center gap-2">
                            {deleteId === inq._id ? (
                               <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg animate-in zoom-in duration-200">
                                  <button onClick={() => handleDelete(inq._id)} className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"><Check size={14} /></button>
                                  <button onClick={() => setDeleteId(null)} className="p-1.5 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300"><X size={14} /></button>
                               </div>
                            ) : (
                               <button 
                                 onClick={() => setDeleteId(inq._id)}
                                 className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                               >
                                 <Trash2 size={18} />
                               </button>
                            )}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
