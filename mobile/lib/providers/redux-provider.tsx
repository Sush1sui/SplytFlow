import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { hydrateActiveSplitGroup } from "@/lib/store/splitSlice";

function StoreHydrator() {
  useEffect(() => {
    void store.dispatch(hydrateActiveSplitGroup());
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
