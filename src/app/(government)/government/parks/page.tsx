import ProtectedRoute from "@/lib/ProtectedRoute";

export default function page() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Parks</h1>
      </div>
    </ProtectedRoute>
  )
}