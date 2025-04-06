import UserProfileForm from "@/components/forms/UserProfileForm";
import ProtectedRoute from "@/lib/ProtectedRoute";
import UserAccountLayout from "@/lib/UserAccountLayout";

export default function page() {
    return (
        <ProtectedRoute>
            <UserAccountLayout title="Profile" subTitle="Profile Information" bannerPicture="/TVR7E3Kuzg2iRhKkjZPeWk-1200-80.jpg.webp" >
                <UserProfileForm />
            </UserAccountLayout>
        </ProtectedRoute>
    )
}