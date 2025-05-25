import { AuthProvider } from "@/contexts/AuthContext";
import { StockSubscriptionProvider } from "@/contexts/StockSubscriptionContext";
import AuthGuard from "@/components/common/AuthGuard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <StockSubscriptionProvider>{children}</StockSubscriptionProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
