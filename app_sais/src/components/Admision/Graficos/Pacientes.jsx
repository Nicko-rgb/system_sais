import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { formatearFechaConSlash, formatearSoloDia } from '../../../utils/dateUtils';
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

const Pacientes = () => {
    const [data, setData] = useState([]);
    const [periodo, setPeriodo] = useState('mes');
    const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
    const [anioActual, setAnioActual] = useState(new Date().getFullYear());
    const [mensaje, setMensaje] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;

    const cambiarMes = (direccion) => {
        let nuevoMes = mesActual + direccion;
        let nuevoAnio = anioActual;

        if (nuevoMes > 12) {
            nuevoMes = 1;
            nuevoAnio++;
        } else if (nuevoMes < 1) {
            nuevoMes = 12;
            nuevoAnio--;
        }

        setMesActual(nuevoMes);
        setAnioActual(nuevoAnio);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                let url = `${API_URL}/api/stadist/registros-por-tiempo/?periodo=${periodo}`;
                if (periodo === 'mes') {
                    url += `&mes=${mesActual}&anio=${anioActual}`;
                }
                const response = await axios.get(url);

                if (response.data.message) {
                    const mensajePersonalizado = periodo === 'mes' 
                        ? 'No hay registros de pacientes disponibles.' 
                        : 'No hay registros de pacientes disponibles para este año';
                    setMensaje(mensajePersonalizado);
                    setData([]);
                    return;
                }

                const transformedData = (response.data.data || response.data).map(item => ({
                    fecha: periodo === 'mes' ? formatearSoloDia(item.fecha) : item.año.toString(),
                    fechaCompleta: periodo === 'mes' ? formatearFechaConSlash(item.fecha) : item.año.toString(),
                    total: item.total
                }));
                setData(transformedData);
                setMensaje('');
            } catch (error) {
                console.error('Error al obtener datos:', error);
                setMensaje('Error al cargar los datos');
            }
        };
        fetchData();
    }, [periodo, mesActual, anioActual]);

    return (
        <div className="box-grafico">
            <h2 className='title-grafico'>Número de Registro de Pacientes</h2>
            <div className='accions'>
                <div className="acc">
                    <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                        <option value="mes">Por Mes</option>
                        <option value="año">Por Año</option>
                    </select>
                    {periodo === 'mes' && (
                        <div className='navegacion-mes'>
                            <button onClick={() => cambiarMes(-1)}><IoIosArrowBack /> Mes Anterior</button>
                            <span className='mes-actual'>{new Date(anioActual, mesActual - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                            <button onClick={() => cambiarMes(1)}>Mes Siguiente<IoIosArrowForward /> </button>
                        </div>
                    )}
                    <span> Total: {data.reduce((total, item) => total + item.total, 0)} </span>
                </div>
            </div>

            {mensaje ? (
                <div className="mensaje-sin-datos">{mensaje}</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%" >
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 0,  left: -20, bottom: 15  }}
                    >
                        <CartesianGrid strokeDasharray="3 " />
                        <XAxis
                            dataKey="fecha"
                            angle={0}
                            height={30}
                            tick={{ fill: '#666', fontSize: 10 }}
                        />
                        <YAxis
                            tick={{ fill: '#666', fontSize: 10 }}
                            domain={[0, 'auto']}
                        />
                        <Tooltip
                            labelFormatter={(label, item) => {
                                if (!item || !item[0] || !item[0].payload) return 'Fecha: No disponible';
                                return `Fecha: ${item[0].payload.fechaCompleta}`;
                            }}
                            formatter={(value) => [`Total: ${value}`, 'Registros']}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="total"
                            name="Registros"
                            stroke="#8884d8"
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default Pacientes;