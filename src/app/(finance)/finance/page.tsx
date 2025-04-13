import ProtectedRoute from "@/lib/ProtectedRoute";

export default function page() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        Home
      </div>
    </ProtectedRoute>
  )
}