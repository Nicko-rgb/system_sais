import React, { useEffect, useState } from 'react'
import StoreMap from '../MapsSector/StoreMap';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const Export = ({ tableRef, page }) => {
    const { sectorPer } = StoreMap();
    const [fichas, setFichas] = useState([]);
    const limit = 1000000;

    const fetchFichas = async (search = '', pageNumber = 1) => {
        try {
            const res = await axios.get(`${API_URL}/api/ficha/get-fichas-familiares`, {
                params: { searchTerm: search, page: pageNumber, limit }
            });
            setFichas(res.data.data);
        } catch (error) {
            console.error('Error al obtener fichas familiares', error);
        } 
    };

    useEffect(() => {
        fetchFichas(); 
    }, [])

    return (
        <table ref={tableRef} style={{display: 'none'}} >
            <thead>
                <tr>
                    <th style={{ padding: '2px 5px', fontWeight: 600, fontSize: 14, color: 'rgb(23, 20, 70)', backgroundColor: 'dodgerblue' }} >N°</th>
                    <th style={{ padding: '2px 5px', fontWeight: 600, fontSize: 14, color: 'rgb(23, 20, 70)', backgroundColor: 'dodgerblue' }} >Cod Ficha</th>
                    <th style={{ padding: '2px 5px', fontWeight: 600, fontSize: 14, color: 'rgb(23, 20, 70)', backgroundColor: 'dodgerblue' }} >Manzana</th>
                    <th style={{ padding: '2px 5px', fontWeight: 600, fontSize: 14, color: 'rgb(23, 20, 70)', backgroundColor: 'dodgerblue' }} >Vivienda</th>
                    <th style={{ padding: '2px 5px', fontWeight: 600, fontSize: 14, color: 'rgb(23, 20, 70)', backgroundColor: 'dodgerblue' }} >Familia</th>
                    <th style={{ padding: '2px 5px', fontWeight: 600, fontSize: 14, color: 'rgb(23, 20, 70)', backgroundColor: 'dodgerblue' }} >Jefe de Familia</th>
                    <th style={{ padding: '2px 5px', fontWeight: 600, fontSize: 14, color: 'rgb(23, 20, 70)', backgroundColor: 'dodgerblue' }} >Telefono</th>
                    <th style={{ padding: '2px 5px', fontWeight: 600, fontSize: 14, color: 'rgb(23, 20, 70)', backgroundColor: 'dodgerblue' }} >#</th>
                    <th style={{ padding: '2px 5px', fontWeight: 600, fontSize: 14, color: 'rgb(23, 20, 70)', backgroundColor: 'dodgerblue' }} >Sector</th>
                    <th style={{ padding: '2px 5px', fontWeight: 600, fontSize: 14, color: 'rgb(23, 20, 70)', backgroundColor: 'dodgerblue' }} >Responsable de Manzana</th>
                </tr>
            </thead>
            <tbody>
                {fichas.map((ficha, index) => {
                    const jefe = ficha.pacientes.find(p => p.is_jefe === 1);
                    const telefonoJefe = jefe?.celular1 || jefe?.celular2 || '---';

                    const asignedSectorPer = sectorPer.find(
                        (per) =>
                            per.codigo === ficha.manzana
                    );

                    const nameComplete = asignedSectorPer
                        ? `${asignedSectorPer.nombres || ''} ${asignedSectorPer.paterno || ''} ${asignedSectorPer.materno || ''}`.trim()
                        : '---';

                    return (
                        <tr key={ficha.id_ficha}>
                            <td style={{ fontSize: 14, fontWeight: 800, padding: '2px 6px', textTransform: 'capitalize' }} >{(page - 1) * limit + index + 1}</td>
                            <td style={{ fontSize: 14, fontWeight: 800, padding: '2px 6px', textTransform: 'capitalize' }} onClick={() => handleNavigateFicha(ficha)} className='cod_ficha'>{ficha.codigo_ficha}</td>
                            <td style={{ fontSize: 14, fontWeight: 800, padding: '2px 6px', textTransform: 'capitalize' }} >{ficha.manzana}</td>
                            <td style={{ fontSize: 14, fontWeight: 800, padding: '2px 6px', textTransform: 'capitalize' }} >{ficha.vivienda_numero}</td>
                            <td style={{ fontSize: 14, fontWeight: 800, padding: '2px 6px', textTransform: 'capitalize' }} >{ficha.grupo_familiar}</td>
                            <td style={{ fontSize: 14, fontWeight: 800, padding: '2px 6px', textTransform: 'capitalize' }} className='no-center name'>{ficha.jefe_familia || '---'}</td>
                            <td style={{ fontSize: 14, fontWeight: 800, padding: '2px 6px', textTransform: 'capitalize' }} >{telefonoJefe}</td>
                            <td style={{ fontSize: 14, fontWeight: 800, padding: '2px 6px', textTransform: 'capitalize' }} >{ficha.pacientes.length || '---'}</td>
                            <td style={{ fontSize: 14, fontWeight: 800, padding: '2px 6px', textTransform: 'capitalize' }} className='no-center'>{ficha.sector || '---'}</td>
                            <td style={{ fontSize: 14, fontWeight: 800, padding: '2px 6px', textTransform: 'capitalize' }} >{nameComplete} </td>
                        </tr>
                    )
                })
                }
            </tbody>
        </table>
    )
}

export default Export