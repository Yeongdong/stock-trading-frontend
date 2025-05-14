import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";
import { ErrorProvider } from "@/contexts/ErrorContext";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { StockDataProvider } from "@/contexts/StockDataContext";
import "@/styles/error.css";

export const metadata = {
  title: "Stock-Trading",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useNetworkStatus();

  return (
    <html lang="en">
      <ErrorProvider>
        <StockDataProvider>
          <body>
            {children}
            <ErrorDisplay />
          </body>
        </StockDataProvider>
      </ErrorProvider>
    </html>
  );
}
