import "./globals.css";
import Navbar from "./components/Navbar";
import { StoreProvider } from "./context/StoreContext";

export const metadata = {
  title: "SmartCart",
  description: "Smart shopping with budget control",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <StoreProvider>
          <div className="container">
            <Navbar />
            {children}
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
