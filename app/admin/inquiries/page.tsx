import DashboardLayout from "@/components/DashboardLayout";

export default function AdminInquiriesPage() {
  return (
    <DashboardLayout type="admin" title="Inquiry Management">
      <div className="bg-white rounded-2xl border p-8 text-center">
        <h2 className="text-xl font-bold">Inquiry Management</h2>
        <p className="text-gray-500 mt-2">View and manage all customer inquiries here.</p>
      </div>
    </DashboardLayout>
  );
}
