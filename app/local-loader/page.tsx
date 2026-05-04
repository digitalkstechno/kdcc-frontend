export default function LocalLoaderPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs font-black tracking-[0.2em] text-gray-600 uppercase">Loading demo</p>
      </div>
    </div>
  );
}
