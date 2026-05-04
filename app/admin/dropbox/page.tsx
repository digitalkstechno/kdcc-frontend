"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Trash2, Search, Download, Filter, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function DropboxPage() {
  const [dropboxData, setDropboxData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDropbox = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dropbox");
       if (response.data.status === "Success") {
         setDropboxData(response.data.data);
       }
    } catch (error) {
      toast.error("Failed to fetch dropbox data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropbox();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const response = await api.delete(`/dropbox/${id}`);
      if (response.data.status === "Success") {
        toast.success("Record deleted successfully");
        setDropboxData(prev => prev.filter(item => item._id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const getImageUrl = (imageName: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1/api";
    const baseUrl = apiUrl.split("/v1/api")[0];
    return `${baseUrl}/builder/${imageName}`;
  };

  const filteredData = dropboxData.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.number?.includes(searchTerm) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cardType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        <div className="bg-white border border-gray-200">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Dropbox Records</span>
              <span className="text-xs text-gray-400 font-medium">({filteredData.length} entries)</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 bg-gray-50 text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
              </div>
              <button className="p-2 border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors">
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-gray-400" size={32} />
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-r border-gray-700 w-16">No</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-r border-gray-700">Card Type</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-r border-gray-700">Patient/User</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-r border-gray-700">Number</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-r border-gray-700">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-r border-gray-700">Message</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-r border-gray-700">Images</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-r border-gray-700">Timestamp</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-20 text-center text-gray-400 font-medium">No records found</td>
                    </tr>
                  ) : (
                    filteredData.map((row, index) => (
                      <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 border-r border-gray-100 text-gray-400 font-medium text-xs">{index + 1}</td>
                        <td className="px-4 py-4 border-r border-gray-100">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">{row.cardType || "-"}</span>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-100 font-semibold text-gray-900">{row.name}</td>
                        <td className="px-4 py-4 border-r border-gray-100 text-gray-500 text-xs">{row.number}</td>
                        <td className="px-4 py-4 border-r border-gray-100 text-gray-400 text-xs">{row.email || "-"}</td>
                        <td className="px-4 py-4 border-r border-gray-100 text-gray-600 text-xs leading-relaxed max-w-xs">{row.message}</td>
                        <td className="px-4 py-4 border-r border-gray-100">
                          <div className="flex flex-wrap gap-1 max-w-[120px]">
                            {row.images && row.images.length > 0 ? row.images.map((img: string, i: number) => (
                              <a 
                                key={i} 
                                href={getImageUrl(img)} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-8 h-8 rounded border border-gray-200 overflow-hidden hover:scale-110 transition-transform flex-shrink-0 bg-gray-50"
                              >
                                <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="" />
                              </a>
                            )) : (
                              <span className="text-gray-300 italic text-[10px]">No images</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-100 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(row.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button onClick={() => handleDelete(row._id)} className="p-1.5 text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
