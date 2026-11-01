export const metadata = {
  title: 'Crypto Watch',
  description: 'Track cryptocurrency prices',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
