"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Trash2, X, Check } from "lucide-react";

interface Appointment {
  _id: string;
  name: string;
  mobile: string;
  person?: string;
  category?: string;
  date: string;
  time?: string;
  message?: string;
  createdAt: string;
}

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("mkgroup_user_token");

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointment/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.status === "Success") {
          setAppointments(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("mkgroup_user_token");

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointment/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Failed to delete appointment:", error);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout type="user">
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Appointments</h2>
          <p className="text-sm text-gray-400 mt-0.5">{appointments.length} total appointment{appointments.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="bg-white border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent animate-spin rounded-full" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="px-6 py-12 text-center text-base text-gray-400">No appointments yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    {["Name", "Mobile", "Person", "Category", "Date", "Time", "Message", "Delete"].map((h, i) => (
                      <th key={h} className={`px-4 py-3.5 text-sm font-semibold uppercase tracking-wide text-left ${i < 7 ? "border-r border-blue-600" : "text-center"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt, idx) => (
                    <tr key={apt._id} className={idx % 2 === 0 ? "bg-white hover:bg-blue-50 transition-colors" : "bg-gray-50 hover:bg-blue-50 transition-colors"}>
                      <td className="px-4 py-3.5 border-r border-gray-100 font-semibold text-gray-900 whitespace-nowrap">{apt.name}</td>
                      <td className="px-4 py-3.5 border-r border-gray-100 text-gray-600 whitespace-nowrap">{apt.mobile}</td>
                      <td className="px-4 py-3.5 border-r border-gray-100 text-gray-600 whitespace-nowrap">{apt.person || "—"}</td>
                      <td className="px-4 py-3.5 border-r border-gray-100">
                        {apt.category ? <span className="bg-blue-100 text-blue-700 px-2.5 py-1 text-xs font-semibold">{apt.category}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5 border-r border-gray-100 text-gray-600 whitespace-nowrap">{apt.date}</td>
                      <td className="px-4 py-3.5 border-r border-gray-100 text-gray-600 whitespace-nowrap">{apt.time || "—"}</td>
                      <td className="px-4 py-3.5 border-r border-gray-100 text-gray-500 max-w-[160px] truncate">{apt.message || "—"}</td>
                      <td className="px-4 py-3.5 text-center">
                        {deleteId === apt._id ? (
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleDelete(apt._id)} className="p-1 text-red-600 hover:bg-red-50"><Check size={14} /></button>
                            <button onClick={() => setDeleteId(null)} className="p-1 text-gray-400 hover:bg-gray-100"><X size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteId(apt._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                        )}
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
