import "./globals.css";
export const metadata = {
  title: "NOVA AI – See it. Understand it. Solve it.",
  description: "Upload an image and get its meaning, or solve maths and science problems step by step.",
};
export const viewport = { width: "device-width", initialScale: 1 };
export default function RootLayout({ children }) {
  return (<html lang="en"><body>{children}</body></html>);
}
