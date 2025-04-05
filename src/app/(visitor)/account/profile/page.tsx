import ProtectedRoute from "@/lib/ProtectedRoute";
import UserAccountLayout from "@/lib/UserAccountLayout";

export default function page() {
    return (
        <ProtectedRoute>
            <UserAccountLayout title="Profile" subTitle="Profile Information">
                <h1></h1>
            </UserAccountLayout>
        </ProtectedRoute>
    )
}