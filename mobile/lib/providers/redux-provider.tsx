import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import {
  ACTIVE_SPLIT_GROUP_KEY,
  hydrateActiveSplitGroup,
} from "@/lib/store/splitSlice";

function StoreHydrator() {
  useEffect(() => {
    void store.dispatch(hydrateActiveSplitGroup());
  }, []);

  useEffect(() => {
    let previousActiveSplitGroupId = store.getState().split.activeSplitGroupId;

    const unsubscribe = store.subscribe(() => {
      const nextActiveSplitGroupId = store.getState().split.activeSplitGroupId;

      if (nextActiveSplitGroupId === previousActiveSplitGroupId) {
        return;
      }

      previousActiveSplitGroupId = nextActiveSplitGroupId;

      if (nextActiveSplitGroupId) {
        void SecureStore.setItemAsync(
          ACTIVE_SPLIT_GROUP_KEY,
          nextActiveSplitGroupId,
        );
      } else {
        void SecureStore.deleteItemAsync(ACTIVE_SPLIT_GROUP_KEY);
      }
    });

    return unsubscribe;
  }, []);

  return null;
}

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <StoreHydrator />
      {children}
    </Provider>
  );
}
