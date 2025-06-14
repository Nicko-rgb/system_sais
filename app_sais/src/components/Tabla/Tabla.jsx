import React from 'react';
import './tabla.css';
import { formatearFechaConSlash, calcularEdad, recortarTexto } from '../../utils/dateUtils'
import { Link } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { FaFolderOpen } from "react-icons/fa6";
import { FaDownload } from "react-icons/fa6";
import { useConfig } from '../../context/ConfigContext';

const Tabla = ({
    data = [],
    column = [],
    loading,
    pagina = null,
    accion1 = null,
    accion2 = null,
    accion3 = null,
    txt1 = null,
    txt2 = null,
    txt3 = null,
    onRowClick = null,
}) => {
    
    const { configs } = useConfig();

    return (
        <div className="tbl-container">
            <table className="tabla">
                <thead>
                    <tr>
                        <th>N°</th>
                        {column.map((col, index) => (
                            <th key={index}>{col.label}</th>
                        ))}
                        {(accion1 || accion2 || accion3) && <th>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        !loading ? (
                            data.map((item, idx) => (
                                <tr 
                                    key={idx} 
                                    onClick={() => onRowClick && onRowClick(item)}
                                    style={{ cursor: onRowClick ? 'pointer' : 'default'}}
                                    className={item.estado ? item.estado == 'activo' ? '' : 'row-inactivo' : '' }
                                >
                                    <td>{pagina ? (pagina.page - 1) * pagina.limit + idx + 1 : idx + 1}</td>
                                    {column.map((col, i) => (
                                        <td key={i} className={col.field == 'nombres' ? 'name' : ''} >
                                            {col.render ? col.render(item) :
                                                col.field === 'fecha_nacimiento' ? formatearFechaConSlash(item[col.field]) :
                                                    col.field === 'edad' ? calcularEdad(item.fecha_nacimiento) :
                                                        col.field === 'motivoConsulta'? recortarTexto(item[col.field], 20) :
                                                            col.field === 'hist_clinico' ? <Link to={`/admision/${item.hist_clinico}`}>{item.hist_clinico} </Link> :
                                                                col.field === 'codigo_ficha' ? (item.codigo_ficha ? <Link to={`/ficha/${item.codigo_ficha}`}>{item.codigo_ficha}</Link> : "---") :
                                                                    (item[col.field] ?? '---')
                                            }
                                        </td>
                                    ))}
                                    {(accion1 || accion2 || accion3 ) && (
                                        <td onClick={((e) => e.stopPropagation())} className='btt'>
                                            <div className="acciones">
                                                {accion1 && (
                                                    <button className="btn-1" onClick={() => accion1(item)}> 
                                                        {item.id_ficha && <FaFolderOpen className='ico-folder' />}  
                                                        { item.id_ficha ? 'Ver Ficha' : txt1 } 
                                                    </button>
                                                )}
                                                {accion2 && (
                                                    <button className="btn-2" onClick={() => accion2(item)}>
                                                        {txt2 == '-' && 
                                                            <FaDownload
                                                                title='DESCARGAR DATOS'
                                                             /> 
                                                        }
                                                    </button>
                                                )}
                                                {accion3 && (
                                                    <button className="btn-3" onClick={() => accion3(item)}>{txt3} </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={column.length + (accion1 || accion2 || accion3 ? 2 : 0)} className="no-data">
                                    Cargando...
                                </td>
                            </tr>
                        )
                    ) : (
                        <tr>
                            <td colSpan={column.length + (accion1 || accion2 ? 2 : 0)} className="no-data">
                                No hay datos
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {pagina && (
                <div className="paginacion">
                    <button onClick={pagina.goPrevPage} disabled={pagina.page <= 1}>
                        <IoIosArrowBack /> Anterior
                    </button>
                    <span>Página {pagina.page} de {pagina.totalPages}</span>
                    <button onClick={pagina.goNextPage} disabled={pagina.page >= pagina.totalPages}>
                        Siguiente <IoIosArrowForward />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Tabla;