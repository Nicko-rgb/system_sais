import React, { useState, useEffect } from 'react';
import Store from '../../utils/storeCitaTurno'
import axios from 'axios';
import './datamz.css'
import { GoInfo } from "react-icons/go";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaUserPlus } from "react-icons/fa6";
import StoreMap from './StoreMap';
import Notas from './Notas';
import FichaFami from './FichaFami';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext'

const DataMz = ({ manzana }) => {
    const { confirDeletePerson, sectorPer, fetchSectorPer, cargando } = StoreMap();
    const { personalSalud } = Store();
    const [dni, setDni] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [formVisible, setFormVisible] = useState(false);
    const { user } = useAuth()
    const apiUrl = import.meta.env.VITE_API_URL;

    // Handle input change and fetch professional by DNI
    const handleInputChange = (e) => {
        const value = e.target.value;
        setDni(value);

        if (value.length === 8) {
            setLoading(true);
            const found = personalSalud.find((persona) => persona.dni === value);
            setTimeout(() => {
                setResult(found || null);
                setLoading(false);
            }, 1000);
        } else {
            setResult(null);
        }
    };

    const handleKeyPress = (e) => {
        if (!/[0-9]/.test(e.key)) e.preventDefault();
    };

    // Submit assigned professional
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Asignando...', type: 'succes' })
        if (!result) {
            setMessage({ text: 'Por favor, selecciona un profesional válido.', type: 'error' });
            return;
        }

        const data = {
            id_sector: manzana.id,
            manzana: manzana.mz,
            codigo: manzana.text.split('\n')[0],
            numero: manzana.text.split('\n')[1],
            descripcion: manzana.text.split('\n').slice(2).join(' '),
            id_personal: result?.id_personal,
        };

        try {
            const response = await axios.post(`${apiUrl}/api/personal/asignar-sector`, data);
            setMessage({ text: response.data.message, type: 'success' });
            toast.success(response.data.message);
            fetchSectorPer()
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Error al asignar.', type: 'error' });
            toast.error('Error al registrar asignación.');
        }
    };

    const cancelTodo = () => {
        setFormVisible(false)
        setMessage({ text: '', type: '' });
        setDni('')
        setResult(null)
    };

    const assignedPersonnel = sectorPer.filter(
        (data) =>
            data.id_sector === manzana.id &&
            data.manzana === manzana.mz
    );

    useEffect(() => {
        setMessage({ text: '', type: '' });
    }, [manzana]);

    return (
        <div className="data-mz">
            <h3>Iformación de manzana</h3>
            <div className="datos-mz">
                <p>Código <span>{manzana.text.split('\n')[0]}</span></p>
                <p style={{ borderLeft: 'none' }}>Viviendas <span>{manzana.text.split('\n')[1]}</span></p>
                <p style={{ borderLeft: 'none' }}>Manzana <span>{manzana.mz}</span></p>
            </div>
            <hr />
            <h5 style={{ fontWeight: '600' }}>Personales Asignados</h5>
            {cargando ? (
                <p className='no-p'><GoInfo /> Cargando...</p>
            ) : (
                assignedPersonnel.length > 0 ? (
                    <table className="person-table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Apellidos y Nombres</th>
                                <th>DNI</th>
                                {user.user.tipo_user.toLowerCase() == 'admin' && (
                                    <th></th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {assignedPersonnel.map((person, index) => (
                                <tr key={index}>
                                    <td className='tbl-num'>{index + 1}</td>
                                    <td>{person.paterno} {person.materno} {person.nombres}</td>
                                    <td>{person.dni}</td>
                                    <td className='accion'>
                                        {user.user.tipo_user.toLowerCase() == 'admin' && (
                                            <RiDeleteBin6Line className='delete' title='Eliminar' onClick={() => confirDeletePerson(person)} />
                                        )}
                                        
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className='no-p'><GoInfo /> No hay ningún asignado para esta manzana.</p>
                )
            )}

            {!formVisible && user.user.tipo_user.toLowerCase() !=='responsable' &&
                <button className='btn-new' type='button' onClick={() => setFormVisible(true)}><FaUserPlus className='ico' />Añadir Nuevo</button>
            }
            <form className={`${formVisible ? result ? 'result' : 'open' : ''}`} onSubmit={handleSubmit}>
                <label>
                    Ingrese DNI para asignar:
                    <input
                        type="text"
                        placeholder="DNI"
                        value={dni}
                        onChange={handleInputChange}
                        maxLength={8}
                        onKeyPress={handleKeyPress}
                    />
                </label>
                {loading ? (
                    <p className='loadingg'>Buscando...</p>
                ) : result?.estado === 'activo' && result ? (
                    <div className="result">
                        <p style={{ borderTop: 'none' }}>Nom:  <span>{result.paterno} {result.materno} {result.nombres}</span></p>
                        <p>Profesión: <span> {result.profesion}</span></p>
                        <p>Servicio: <span>{result.servicio} </span> </p>
                        <p style={{ borderBottom: 'solid #b0b0b0 1px' }}>DNI: <span> {result.dni} </span></p>
                    </div>
                ) : (
                    dni.length === 8 && !loading && (
                        <p className='loadingg' style={{ color: 'rgb(253, 104, 104)', fontSize: '12px' }}>No se encontró ningún profesional con este DNI.</p>
                    )
                )}

                {message.text && (
                    <div className="b-msg">
                        <p className={`msg ${message.type === 'success' ? 'msg-success' : 'msg-error'}`}>
                            {message.text}
                        </p>
                    </div>
                )}

                <div className="btns">
                    {message.type === 'success' ?
                        <button className="btn-submit" style={{ margin: 'auto' }} type="button" onClick={cancelTodo}>Aceptar</button>
                        :
                        <>
                            <button className="btn-cancel" type="button" onClick={cancelTodo}>Cancelar</button>
                            <button className={`btn-submit ${!result ? 'btn-disable' : ''} `} disabled={!result} type="submit">Asignar</button>
                        </>
                    }
                </div>
            </form>
            <hr />
            <Notas manzana={manzana} />
            <hr />
            <FichaFami manzana={manzana} />
        </div>
    );
};

export default DataMz;
