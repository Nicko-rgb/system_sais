import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        
        setLoading(false);
    }, []);

    const login = async (dni, password) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/login`, {
                dni,
                password
            });

            const userData = response.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            toast.success('Inicio de sesión exitoso', {autoClose: 1500});
            return true;
            
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al iniciar sesión');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        window.location.href = '/';
        setUser(null);
        localStorage.removeItem('user');
        toast.info('Sesión cerrada');
        localStorage.removeItem('activeSection');
    };

    const value = {
        user,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};