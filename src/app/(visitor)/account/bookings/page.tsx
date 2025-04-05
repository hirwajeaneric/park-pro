import ProtectedRoute from "@/lib/ProtectedRoute";
import UserAccountLayout from "@/lib/UserAccountLayout";

export default function page() {
    return (
        <ProtectedRoute>
            <UserAccountLayout title="Booking History" subTitle="Your Bookings">
                <h1></h1>
            </UserAccountLayout>
        </ProtectedRoute>
    )
}