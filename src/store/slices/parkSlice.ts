import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Park } from "@/types";

interface ParkState {
  parks: Park[];
  selectedPark: Park | null;
  loading: boolean;
  error: string | null;
}

const initialState: ParkState = {
  parks: [],
  selectedPark: null,
  loading: false,
  error: null,
};

const parkSlice = createSlice({
  name: "parks",
  initialState,
  reducers: {
    setParks(state, action: PayloadAction<Park[]>) {
      state.parks = action.payload;
    },
    setSelectedPark(state, action: PayloadAction<Park | null>) {
      state.selectedPark = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setParks, setSelectedPark, setLoading, setError } = parkSlice.actions;
export default parkSlice.reducer;