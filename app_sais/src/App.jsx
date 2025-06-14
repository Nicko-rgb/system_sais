import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConfigProvider } from './context/ConfigContext'
import { ThemeProvider, createTheme } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sectores from './pages/Sectores';
import Cita1 from './pages/Cita1';
import Turnos from './pages/Turnos';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './context/PrivateRoute';
import ExportTurno from './components/Turnos/ExportTurno';
import FichaFamiliar from './pages/FichaFamiliar';
import DataPaciente from './pages/DataPaciente';
import EditPaciente from './components/Paciente/EditPaciente';

const theme = createTheme({
    palette: {
        primary: {
            main: '#289588FF',
        },
        secondary: {
            main: '#10B19EFF',
        },
    },
});


function App() {
    return (
        <ThemeProvider theme={theme}>
            <ConfigProvider>
                <AuthProvider>
                    <div className="fondo-puntos"></div>
                    <Toaster position="top-right" reverseOrder={false} />
                    <HashRouter>
                        <Routes>
                            <Route path="/" element={<Login />} />
                            <Route
                                path="/dashboard"
                                element={<PrivateRoute><Dashboard /></PrivateRoute>}
                            />
                            <Route
                                path="/maps-sais"
                                element={<PrivateRoute><Sectores /></PrivateRoute>}
                            />
                            <Route
                                path="/cita-niño/:espacialidad"
                                element={<PrivateRoute><Cita1 /></PrivateRoute>}
                            />
                            <Route
                                path="/turnos-sais"
                                element={<PrivateRoute><Turnos /></PrivateRoute>}
                            />
                            <Route
                                path="/exportar-turnos"
                                element={<PrivateRoute><ExportTurno /></PrivateRoute>}
                            />
                            <Route
                                path="/ficha/:codigo"
                                element={<PrivateRoute><FichaFamiliar /></PrivateRoute>}
                            />
                            <Route
                                path="/admision/:historia"
                                element={<PrivateRoute><DataPaciente /></PrivateRoute>}
                            />
                            <Route
                                path="/edit-pas/:historia"
                                element={<PrivateRoute><EditPaciente /></PrivateRoute>}
                            />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                        <ToastContainer position="top-right" autoClose={3000} />
                    </HashRouter>
                </AuthProvider>
            </ConfigProvider>
        </ThemeProvider>
    )
}

export default App
