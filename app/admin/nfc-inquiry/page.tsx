"use client";

import DashboardLayout from "@/components/DashboardLayout";
import CommonTable from "@/components/CommonTable";
import { Trash2, Phone, Building2, User, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function NfcInquiryPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await api.get("/nfc/all");
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
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const response = await api.delete(`/nfc/delete/${id}`);
      if (response.data.status === "Success") {
        toast.success("Inquiry deleted successfully");
        setInquiries(inquiries.filter((inq: any) => inq._id !== id));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete inquiry");
    }
  };

  const filteredInquiries = inquiries.filter((inq: any) => 
    inq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.mobile?.includes(searchTerm) ||
    inq.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: "Date",
      accessor: "createdAt",
      render: (row: any) => (
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <Calendar size={14} />
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      header: "User Details",
      accessor: "name",
      render: (row: any) => (
        <div className="space-y-1">
          <p className="text-sm font-black text-gray-900 flex items-center gap-2">
            <User size={14} className="text-gray-400" /> {row.name}
          </p>
          <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
            <Phone size={14} className="text-gray-400" /> {row.mobile}
          </p>
        </div>
      )
    },
    {
      header: "Company",
      accessor: "companyName",
      render: (row: any) => (
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Building2 size={16} className="text-gray-400" />
          {row.companyName || "N/A"}
        </div>
      )
    },
    {
      header: "Card Info",
      accessor: "userId",
      render: (row: any) => (
        <div className="space-y-1">
          <p className="text-xs font-black text-indigo-600 uppercase tracking-tight">
            {row.userId?.companyName || "N/A"}
          </p>
          <p className="text-[10px] font-bold text-gray-400">
            Owner: {row.userId?.name || "N/A"}
          </p>
        </div>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: any) => (
        <button
          onClick={() => handleDelete(row._id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      )
    }
  ];

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">NFC Inquiries</h1>
            <p className="text-sm text-gray-400 mt-1">Manage all NFC system requests from users</p>
          </div>
          <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Phone size={24} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <CommonTable
            columns={columns}
            data={filteredInquiries.slice((currentPage - 1) * 10, currentPage * 10)}
            isLoading={loading}
            totalRecords={filteredInquiries.length}
            currentPage={currentPage}
            limit={10}
            onPageChange={setCurrentPage}
            onSearch={setSearchTerm}
            searchPlaceholder="Search by name, mobile or company..."
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
