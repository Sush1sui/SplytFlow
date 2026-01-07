import { ReactNode } from "react";
import NoAuthProtect from "../../components/protected_routes/no_auth_protect";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <NoAuthProtect>{children}</NoAuthProtect>;
}
