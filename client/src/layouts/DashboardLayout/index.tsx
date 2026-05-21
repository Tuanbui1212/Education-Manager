import { useEffect, type PropsWithChildren } from 'react';
import { getDecodedToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function DashboardLayout({ children }: PropsWithChildren) {
  const currentUser = getDecodedToken();
  const navigate = useNavigate();

  if (!currentUser) {
    useEffect(() => {
      navigate('/login');
    }, []);
    return null;
  }

  if (currentUser.role.name.toUpperCase() === 'STUDENT') {
    useEffect(() => {
      navigate('/student-portal');
    }, []);
    return null;
  }

  if (currentUser.role.name.toUpperCase() === 'TEACHER') {
    useEffect(() => {
      navigate('/teacher-portal');
    }, []);
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto bg-gray-50">{children}</div>
    </div>
  );
}

export default DashboardLayout;
