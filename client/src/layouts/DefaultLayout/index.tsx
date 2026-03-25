import Header from '../components/Header';
import Footer from '../components/Footer';

import type { PropsWithChildren } from 'react';

export default function DefaultLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">{children}</div>
      <Footer />
    </div>
  );
}
