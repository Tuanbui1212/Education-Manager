import { useEffect, type PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDecodedToken } from '../utils/auth';

function PrivateRoute({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const token = getDecodedToken();

  useEffect(() => {
    if (!token || token.success === false) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  if (!token || token.success === false) {
    return null;
  }

  return children;
}

export default PrivateRoute;
