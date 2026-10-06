import "./globals.css";

export const metadata = {
  title: "ABJ Life Style",
  description: "A Nigerian city life simulation game inspired by Abuja.",
  manifest: "/manifest.json"
};

export const viewport = {
  themeColor: "#27d17f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
