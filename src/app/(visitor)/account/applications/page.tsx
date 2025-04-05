import ProtectedRoute from "@/lib/ProtectedRoute";
import UserAccountLayout from "@/lib/UserAccountLayout";

export default function page() {
    return (
        <ProtectedRoute>
            <UserAccountLayout title="Applications" subTitle="Your Applications">
                <h1></h1>
            </UserAccountLayout>
        </ProtectedRoute>
    )
}