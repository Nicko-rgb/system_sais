import React, { useState } from 'react';
import Store from '../../utils/storeCitaTurno';
import './tablaSec.css';

const TablaSectorPer = () => {
    const { sectorPer } = Store();
    const [search, setSearch] = useState('');

    // Agrupar por DNI y juntar los códigos
    const agrupados = {};
    sectorPer.forEach(item => {
        const key = item.dni; // Puedes cambiar por otro identificador único si lo prefieres
        if (!agrupados[key]) {
            agrupados[key] = { ...item, codigos: [item.codigo] };
        } else {
            // Si ya existe, solo agregamos el código si no está repetido
            if (!agrupados[key].codigos.includes(item.codigo)) {
                agrupados[key].codigos.push(item.codigo);
            }
        }
    });

    // Convertir el objeto de agrupados en un array para mapearlo
    const dataAgrupada = Object.values(agrupados).map(item => ({
        ...item,
        codigo: item.codigos.join(' '),
    }));

    // Filtrado por búsqueda
    const filteredData = dataAgrupada.filter(item =>
        Object.keys(item).some(key =>
            item[key]?.toString().toLowerCase().includes(search.toLowerCase())
        )
    );

    return (
        <div className='tbl-sector-map'>
            <h3 className='h3'>Personales con Sector</h3>
            <div className="search">
                <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Buscar" />
            </div>
            <table>
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Nombres</th>
                        <th>Dni</th>
                        <th>Codigo</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, index) => (
                        <tr key={item.dni}>
                            <td>{index + 1}</td>
                            <td>{item.nombres} {item.paterno} {item.materno}</td>
                            <td>{item.dni}</td>
                            <td style={{textWrap: 'wrap'}} >{item.codigo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TablaSectorPer;
