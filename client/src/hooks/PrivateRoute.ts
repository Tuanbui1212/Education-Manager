import { useEffect, type PropsWithChildren } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDecodedToken } from '../utils/auth';
import { examService } from '../services/exam.service';
import { PATHS } from '../utils/constants';

function PrivateRoute({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getDecodedToken();

  useEffect(() => {
    let isMounted = true;
    if (!token || token.success === false) {
      if (isMounted) {
        navigate('/login', { replace: true });
      }
      return;
    }

    const checkActiveExam = async () => {
      try {
        if (token.role?.name.toLowerCase().includes('student')) {
          const res = await examService.getActiveSubmission();
          if (res.data && res.data.examId && isMounted) {
            const examPath = PATHS.STUDENT_EXAM_TAKING.replace(':examId', res.data.examId);
            if (location.pathname !== examPath) {
              navigate(examPath, { replace: true });
            }
          }
        }
      } catch (error) {
        console.error('Failed to check active exam', error);
      }
    };

    checkActiveExam();

    return () => {
      isMounted = false;
    };
  }, [token, navigate, location.pathname]);

  if (!token || token.success === false) {
    return null;
  }

  return children;
}

export default PrivateRoute;
