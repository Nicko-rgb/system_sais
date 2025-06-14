import React, {useState} from 'react'
import Store from '../../utils/storeCitaTurno'
import Tabla from '../Tabla/Tabla';
import './tablaSec.css'

const TablaSectorPer = () => {
    const { sectorPer } = Store();
    const [search, setSearch] = useState('');

    const column = [
       {label: 'Nombres', field: 'nombres', 
        render: (item) => `${item.nombres} ${item.paterno} ${item.materno}`},
       { label: 'Dni', field: 'dni' },
       { label: 'Codigo', field: 'codigo' },
    ]

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value); 
    }
    const filteredData = sectorPer.filter((item) => {
        return Object.keys(item).some((key) =>
            item[key].toString().toLowerCase().includes(search.toLowerCase())
        ); 
    })

    return (
        <div className='tbl-sector-map'>
            <h3 className='h3'>Personales con Sector</h3>
            <div className="search">
                <input value={search} onChange={handleSearch} type="text" placeholder="Buscar" />
            </div>
            <Tabla
                data={filteredData}
                column={column}
            />
        </div>
    )
}

export default TablaSectorPer