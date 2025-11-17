import '../globals.css';
import Navigation from '@/components/Navigation';
import { Logo } from '@/components/Logo';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="container mx-auto flex items-center gap-3 py-8">
        <div>
          <Logo />
        </div>
      </header>
      {children}
    </>
  );
}
