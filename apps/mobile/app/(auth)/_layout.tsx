import { Slot } from "expo-router";
import NoAuthProtect from "../../components/protected_routes/no_auth_protect";

export default function AuthLayout() {
  return (
    <NoAuthProtect>
      <Slot />
    </NoAuthProtect>
  );
}
