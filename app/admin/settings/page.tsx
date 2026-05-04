import DashboardLayout from "@/components/DashboardLayout";

export default function AdminSettingsPage() {
  return (
    <DashboardLayout type="admin" title="System Settings">
      <div className="bg-white rounded-2xl border p-8 text-center">
        <h2 className="text-xl font-bold">System Settings</h2>
        <p className="text-gray-500 mt-2">Configure platform settings and preferences here.</p>
      </div>
    </DashboardLayout>
  );
}
