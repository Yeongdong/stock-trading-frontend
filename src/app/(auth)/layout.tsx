import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/common/AuthGuard";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="app-layout">
          <Header />
          <div className="layout-body">
            <Navigation />
            <main className="main-content">{children}</main>
          </div>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
