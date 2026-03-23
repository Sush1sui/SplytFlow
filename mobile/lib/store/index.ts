import { configureStore } from "@reduxjs/toolkit";
import saleReducer from "./saleSlice";
import splitReducer from "./splitSlice";

export const store = configureStore({
  reducer: {
    sale: saleReducer,
    split: splitReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
