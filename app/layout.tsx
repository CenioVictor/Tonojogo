import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TONOJOGO - Dominó em Duplas',
  description: 'Jogo de dominó online para 4 jogadores em duplas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
