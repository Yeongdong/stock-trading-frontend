import { AuthCheck } from '@/components/auth/auth-check';
import TradingDashboard from '@/components/trading-dashboard';

export default function DashboardPage() {
  return (
    <AuthCheck>
      <main className="min-h-screen bg-gray-50">
        <TradingDashboard />
      </main>
    </AuthCheck>
  );
}