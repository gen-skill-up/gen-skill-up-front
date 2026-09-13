'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import OwlLogo from '../../components/Logo';

export default function PlacementTestLoadingPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center stars-bg">
      <div className="mb-6 animate-bounce-slow">
        <OwlLogo size={70} />
      </div>
      <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mb-4" />
      <p className="text-[var(--color-muted)] font-black text-sm">جاري التحميل... / Loading...</p>
    </div>
  );
}
