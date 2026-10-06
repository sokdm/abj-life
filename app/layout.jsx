import "./globals.css";

export const metadata = {
  title: "ABJ Life Style",
  description: "A Nigerian city life simulation game inspired by Abuja."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
