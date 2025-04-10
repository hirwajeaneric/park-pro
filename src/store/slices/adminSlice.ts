/* eslint-disable @typescript-eslint/no-explicit-any */
import { assignUserToPark, createPark, createUser, deletePark, deleteUser, getParkById, getParks, getUserById, getUsers, updatePark } from "@/lib/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface AdminState {
    users: any[];
    parks: any[];
    selectedUser: any | null;
    selectedPark: any | null;
    totalElements?: number;
    totalPages?: number;
    currentPage?: number;
    loading: boolean;
    error: string | null;

}

const initialState: AdminState = {
    users: [],
    parks: [],
    selectedUser: null,
    selectedPark: null,
    loading: false,
    error: null,
};

export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (token: string) => {
    return await getUsers(token);
});

export const fetchParks = createAsyncThunk(
    "admin/fetchParks",
    async ({ token, page = 0, size = 10 }: { token: string; page?: number; size?: number }) => {
        return await getParks(token, page, size);
    }
);

export const fetchUserById = createAsyncThunk("admin/fetchUserById", async ({ userId, token }: { userId: string; token: string }) => {
    return await getUserById(userId, token);
});

export const addUser = createAsyncThunk("admin/addUser", async ({ data, token }: { data: any; token: string }) => {
    return await createUser(data, token);
});

export const assignParkToUser = createAsyncThunk("admin/assignParkToUser", async ({ userId, parkId, token }: { userId: string; parkId: string; token: string }) => {
    return await assignUserToPark(userId, parkId, token);
});

export const removeUser = createAsyncThunk("admin/removeUser", async ({ userId, token }: { userId: string; token: string }) => {
    return await deleteUser(userId, token);
});

export const fetchParkById = createAsyncThunk("admin/fetchParkById", async ({ parkId, token }: { parkId: string; token: string }) => {
    return await getParkById(parkId, token);
});

export const addPark = createAsyncThunk("admin/addPark", async ({ data, token }: { data: any; token: string }) => {
    return await createPark(data, token);
});

export const updateParkData = createAsyncThunk("admin/updatePark", async ({ parkId, data, token }: { parkId: string; data: any; token: string }) => {
    return await updatePark(parkId, data, token);
});

export const removePark = createAsyncThunk("admin/removePark", async ({ parkId, token }: { parkId: string; token: string }) => {
    return await deletePark(parkId, token);
});

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => { state.loading = true; })
            .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
            .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to fetch users"; })

            .addCase(fetchUserById.pending, (state) => { state.loading = true; })
            .addCase(fetchUserById.fulfilled, (state, action) => { state.loading = false; state.selectedUser = action.payload; })
            .addCase(fetchUserById.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to fetch user"; })

            .addCase(fetchParks.pending, (state) => { state.loading = true; })
            .addCase(fetchParks.fulfilled, (state, action) => {
                console.log(action.payload.content);
                state.loading = false;
                state.parks = action.payload.content;
                state.totalElements = action.payload.totalElements;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchParks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch parks";
            })

            .addCase(addUser.fulfilled, (state, action) => { state.users.push(action.payload); })
            .addCase(assignParkToUser.fulfilled, (state, action) => {
                if (state.selectedUser) state.selectedUser.parkId = action.meta.arg.parkId;
            })
            .addCase(removeUser.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user.id !== action.meta.arg.userId);
                state.selectedUser = null;
            })

            // .addCase(fetchParks.pending, (state) => { state.loading = true; })
            // .addCase(fetchParks.fulfilled, (state, action) => { state.loading = false; state.parks = action.payload.content; })
            // .addCase(fetchParks.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to fetch parks"; })

            .addCase(fetchParkById.pending, (state) => { state.loading = true; })
            .addCase(fetchParkById.fulfilled, (state, action) => { state.loading = false; state.selectedPark = action.payload; })
            .addCase(fetchParkById.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to fetch park"; })

            .addCase(addPark.fulfilled, (state, action) => { state.parks.push(action.payload); })
            .addCase(updateParkData.fulfilled, (state, action) => { state.selectedPark = action.payload; })
            .addCase(removePark.fulfilled, (state, action) => {
                state.parks = state.parks.filter(park => park.id !== action.meta.arg.parkId);
                state.selectedPark = null;
            });
    },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;