import "@/styles/globals.css";
import "@/styles/error.css";
import Providers from "./providers";

export const metadata = {
  title: "Stock Trading Application",
  description: "Stock trading application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
