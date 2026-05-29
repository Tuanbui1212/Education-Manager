import Header from './Header';
import Footer from './Footer';
import { getDecodedToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

import { useEffect, type PropsWithChildren } from 'react';

export default function PortalLayout({ children }: PropsWithChildren) {
    const currentUser = getDecodedToken();
    const navigate = useNavigate();
    if (!currentUser || (currentUser.role.name.toUpperCase() !== 'STUDENT' && currentUser.role.name.toUpperCase() !== 'TEACHER')) {
        if (window.history.length > 1) {
            useEffect(() => {
                navigate(-1);
            }, []);
        } else {
            useEffect(() => {
                navigate('/login');
            }, [])
        }
        return null;
    }

    if (currentUser.role.name.toUpperCase() === 'STUDENT') {
        useEffect(() => {
            navigate('/student-portal');
        }, []);
        return <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">{children}</main>
            <Footer />
        </div>
    } else if (currentUser.role.name.toUpperCase() === 'TEACHER') {
        useEffect(() => {
            navigate('/teacher-portal');
        }, []);
        return <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">{children}</main>
            <Footer />
        </div>;
    }
}