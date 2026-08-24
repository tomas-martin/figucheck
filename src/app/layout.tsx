import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AlbumProvider } from '../context/AlbumContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FiguCheck - Album Contador Futsal Mendoza',
  description: 'App web contador de figuritas para controlar tus faltantes y repetidas del Futsal Mendoza. 252 figuritas en 16 equipos + Leyendas.',
  keywords: ['figuritas', 'futsal', 'mendoza', 'album', 'contador', 'repetidas', 'scorefy'],
  openGraph: {
    title: 'FiguCheck - Contador de Figuritas Futsal Mendoza',
    description: 'Controlá tus figuritas obtenidas, faltantes y repetidas desde tu celular o PC.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen antialiased`}>
        <AlbumProvider>
          {children}
        </AlbumProvider>
      </body>
    </html>
  );
}
