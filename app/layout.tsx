import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TONOJOGO - Dominó em Duplas',
  description: 'Jogo de dominó online para 4 jogadores em duplas',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}