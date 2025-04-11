// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import parkReducer from "./slices/parkSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    parks: parkReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;