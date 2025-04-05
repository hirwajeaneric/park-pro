import UserProfileForm from "@/components/forms/UserProfileForm";
import ProtectedRoute from "@/lib/ProtectedRoute";
import UserAccountLayout from "@/lib/UserAccountLayout";

export default function page() {
    return (
        <ProtectedRoute>
            <UserAccountLayout title="Profile" subTitle="Profile Information">
                <UserProfileForm />
            </UserAccountLayout>
        </ProtectedRoute>
    )
}