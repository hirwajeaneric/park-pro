/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UserProfile } from "@/types";

interface UserState {
    user: UserProfile | null;
    users: UserProfile[];
    selectedUser: UserProfile | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    users: [],
    selectedUser: null,
    loading: false,
    error: null,
};

// Fetch all users
export const fetchUsers = createAsyncThunk(
    "user/fetchUsers",
    async (token: string, { rejectWithValue }) => {
        try {
            const response = await fetch("http://localhost:8080/api/users", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to fetch users");
            return await response.json();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Fetch user by ID
export const fetchUserById = createAsyncThunk(
    "user/fetchUserById",
    async ({ id }: { id: string; token?: string }, { rejectWithValue }) => {
        try {
            
            const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access-token") as string}` },
            });
            if (!response.ok) throw new Error("Failed to fetch user");
            return await response.json();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Update user
export const updateUser = createAsyncThunk(
    "user/updateUser",
    async (
        { id, data, token }: { id: string; data: Partial<UserProfile>; token: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Failed to update user");
            return await response.json();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete user
export const deleteUser = createAsyncThunk(
    "user/deleteUser",
    async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to delete user");
            return id; // Return ID for removal from state
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Assign park to user
export const assignParkToUser = createAsyncThunk(
    "user/assignParkToUser",
    async (
        { userId, parkId, token }: { userId: string; parkId: string; token: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/users/${userId}/parks/${parkId}`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!response.ok) throw new Error("Failed to assign park");
            return { userId, parkId };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserProfile | null>) {
            state.user = action.payload;
        },
        setSelectedUser(state, action: PayloadAction<UserProfile | null>) {
            state.selectedUser = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch User by ID
            .addCase(fetchUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update User
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedUser = action.payload;
                state.users = state.users.map((user) =>
                    user.id === action.payload.id ? action.payload : user
                );
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete User
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter((user) => user.id !== action.payload);
                state.selectedUser = null;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Assign Park
            .addCase(assignParkToUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assignParkToUser.fulfilled, (state, action) => {
                state.loading = false;
                if (state.selectedUser) {
                    state.selectedUser.parkId = action.payload.parkId;
                }
                state.users = state.users.map((user) =>
                    user.id === action.payload.userId
                        ? { ...user, parkId: action.payload.parkId }
                        : user
                );
            })
            .addCase(assignParkToUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setUser, setSelectedUser } = userSlice.actions;
export default userSlice.reducer;