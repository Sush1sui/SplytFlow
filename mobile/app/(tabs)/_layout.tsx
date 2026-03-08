import React from "react";
import AuthProtect from "@/components/protect-routes/auth-protect";
import BottomTabNavigator from "@/components/navigation/bottom-tab-navigator";

export default function TabsLayout() {
  return (
    <AuthProtect>
      {/* the new bottom tab navigator handles all four main tabs */}
      <BottomTabNavigator />
    </AuthProtect>
  );
}
