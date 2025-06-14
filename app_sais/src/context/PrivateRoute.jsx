import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Loading from '../components/Loading/Loading';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <Loading message={'Cargando datos de sesión...'} />;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;
