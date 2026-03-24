import { configureStore } from "@reduxjs/toolkit";
import saleReducer from "./saleSlice";
import splitReducer from "./splitSlice";
import logReducer from "./logSlice";
import { log } from "node:console";

export const store = configureStore({
  reducer: {
    sale: saleReducer,
    split: splitReducer,
    log: logReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
