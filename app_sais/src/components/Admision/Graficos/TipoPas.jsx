import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const TipoPas = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/stadist/distribucion-tipo`);
                const total = response.data.reduce((acc, curr) => acc + curr.total, 0);
                const transformedData = response.data.map(item => ({
                    ...item,
                    porcentaje: ((item.total / total) * 100).toFixed(2)
                }));
                setData(transformedData);
                setTotal(total);
            } catch (error) {
                console.error('Error al obtener datos:', error);
            }
        };
        fetchData();
    }, []);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: '#fff',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px',
                }}>
                    <p style={{ margin: '0' }}><strong>Tipo:</strong> {data.tipo_paciente}</p>
                    <p style={{ margin: '0' }}><strong>Total:</strong> {data.total}</p>
                    <p style={{ margin: '0' }}><strong>Porcentaje:</strong> {data.porcentaje}%</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="box-grafico">
            <h2 className='title-grafico'>
                Distribución de Pacientes por Tipo
                <div className='num-total'>
                    Total: {total}
                </div>
            </h2>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="tipo_paciente" 
                        angle={0}
                        height={30}
                        tick={{ fill: '#666', fontSize: 10, }}
                        interval={0}
                    />
                    <YAxis
                        tick={{ fill: '#666', fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                        dataKey="total" 
                        name="Pacientes" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TipoPas;