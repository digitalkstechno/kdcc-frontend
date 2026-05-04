import DashboardLayout from "@/components/DashboardLayout";

export default function AdminUsersPage() {
  return (
    <DashboardLayout type="admin" title="User Management">
      <div className="bg-white rounded-2xl border p-8 text-center">
        <h2 className="text-xl font-bold">User Management</h2>
        <p className="text-gray-500 mt-2">Manage all registered users here.</p>
      </div>
    </DashboardLayout>
  );
}
