import React, { useState } from 'react';
import './turno.css';
import Store from '../../utils/storeCitaTurno';
import useStoreTurno from './StoreTurno';

export const LeyendaTabla = ({ tiposDeTurno }) => {
    const { obtenerDescripcionTurno } = Store()
    return (
        <table className="leyenda-tabla">
            <thead>
                <tr>
                    <th colSpan={2} style={{ textAlign: 'center', color: 'green', border: 'black solid 1px', backgroundColor: 'lightyellow', fontSize: '14px' }}>
                        LEYENDA DE TURNOS
                    </th>
                </tr>
                <tr>
                    <th style={{ border: 'black solid 1px', fontSize: '14px' }}>Clave</th>
                    <th style={{ border: 'black solid 1px', fontSize: '14px' }}>Valor</th>
                </tr>
            </thead>
            <tbody>
                {tiposDeTurno.map((tipo, index) => (
                    <tr key={index}>
                        <td key={tipo.clave_turno} style={{ border: 'black solid 1px', padding: '3px 5px', fontSize: '12px', textAlign: 'center', fontWeight: 500  }}>
                            {tipo.clave_turno}
                        </td>
                        <td style={{ border: 'black solid 1px', fontSize: '12px', paddingLeft: '10px', fontWeight: 500 }}>{obtenerDescripcionTurno(tipo.clave_turno)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export const LeyendasTurno = ({ tiposDeTurno }) => {
    const { obtenerDescripcionTurno } = Store();
    const { coloresTurno } = useStoreTurno();
    
    return (
        <div className="leyenda-turno">
            {tiposDeTurno.map(tipo => (
                <p key={tipo.clave_turno}>
                    <span
                        style={{
                            display: "inline-block",
                            width: "15px",
                            height: "15px",
                            backgroundColor: coloresTurno[tipo.clave_turno] || '#FFFFFF',
                            marginRight: "8px",
                            borderRadius: "3px"
                        }}
                    ></span>
                    {tipo.clave_turno}: {obtenerDescripcionTurno(tipo.clave_turno)}
                </p>
            ))}
        </div>
    );
};
