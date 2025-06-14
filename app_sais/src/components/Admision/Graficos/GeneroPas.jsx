import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from 'axios';

const GeneroPas = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const API_URL = import.meta.env.VITE_API_URL;
    const COLORS = ['#8884d8', '#82ca9d'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/stadist/distribucion-genero`);
                setData(response.data.data);
                setTotal(response.data.total);
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
                    <p style={{ margin: '0' }}><strong>Género:</strong> {data.sexo}</p>
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
                Distribución de Pacientes por Género
                <div className='num-total'>
                    Total: {total}
                </div>
            </h2>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="sexo"
                        label={({ sexo, porcentaje }) => `${sexo}: ${porcentaje}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GeneroPas;