import { createContext, useContext } from "react";

export type TabSegment = "(home)" | "(sales)" | "(splits)" | "(settings)";

interface TabContextValue {
  activeTab: TabSegment;
  setActiveTab: (tab: TabSegment) => void;
}

export const TabContext = createContext<TabContextValue>({
  activeTab: "(home)",
  setActiveTab: () => {},
});

export function useTabContext() {
  return useContext(TabContext);
}
