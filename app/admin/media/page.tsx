import DashboardLayout from "@/components/DashboardLayout";

export default function AdminMediaPage() {
  return (
    <DashboardLayout type="admin" title="Media Management">
      <div className="bg-white rounded-2xl border p-8 text-center">
        <h2 className="text-xl font-bold">Media Management</h2>
        <p className="text-gray-500 mt-2">Manage photos, videos, and brochures here.</p>
      </div>
    </DashboardLayout>
  );
}
