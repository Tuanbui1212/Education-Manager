import Header from './Header';
import Footer from './Footer';

import type { PropsWithChildren } from 'react';

export default function ProfileLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">{children}</main>
            <Footer />
        </div>
    );
}