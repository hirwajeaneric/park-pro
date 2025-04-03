import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        parkId: string | null
    } | null;
}

const initialState: UserState = { user: null };

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState['user']>) {
            state.user = action.payload;
        },
    } 
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;