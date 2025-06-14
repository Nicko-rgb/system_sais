import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
const API_URL = import.meta.env.VITE_API_URL;

export const ConfigContext = createContext();

export const useConfig = () => {
    return useContext(ConfigContext);
}

export const ConfigProvider = ({ children }) => {
    const [configs, setConfigs] = useState([]);
    const [loadingConfig, setLoading] = useState(true);

    const fetchConfigs = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/system/get-config`);
            setConfigs(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al obtener las configuraciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, [])
    
    // econtrar una configuracion con el nombre "dni_historia" y obtener el valor de la configuracion de tipo booleano
    const dniHistoria = configs.find(config => config.nombre_config === 'dni_historia');
    const dniHistoriaValue = dniHistoria ? dniHistoria.valorBln : '';

    return (
        <ConfigContext.Provider value={{ configs, loadingConfig, dniHistoriaValue, fetchConfigs }}>
            {children}
        </ConfigContext.Provider>
    );

}