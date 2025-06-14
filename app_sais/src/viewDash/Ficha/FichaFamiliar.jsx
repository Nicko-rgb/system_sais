import React, { useEffect, useRef } from 'react'
import './ficha.css'
import { HiOutlineViewGridAdd } from "react-icons/hi";
import { TbPencilPlus } from "react-icons/tb";
import { LuTextSearch } from "react-icons/lu";
import CrearFicha from '../../components/FichaFamiliar/CrearFicha';
import AnadirAFicha from '../../components/FichaFamiliar/AnadirAFicha';
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useFichaStore } from '../../components/FichaFamiliar/StoreFicha';
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaUsersViewfinder } from "react-icons/fa6";
import { FaFolderOpen } from "react-icons/fa6";
import { TbPackageExport } from "react-icons/tb";
import { DownloadTableExcel } from 'react-export-table-to-excel';
import Export from '../../components/FichaFamiliar/Export';
import StoreMap from '../../components/MapsSector/StoreMap';
import { useAuth } from '../../context/AuthContext';

const FichaFamiliar = ({ data, setViewOpcion, setData }) => {
    const { user } = useAuth();
    const { sectorPer } = StoreMap();
    const {
        fichas,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        loading,
        activeCreate,
        setActiveCreate,
        activeAdd,
        setActiveAdd,
        fetchFichas,
        totalPages,
        deleteFichaFamiliar
    } = useFichaStore();

    const tableRef = useRef(null);
    const limit = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchFichas(searchTerm, page);
    }, [searchTerm, page, activeCreate]);

    const handleCloseViews = () => {
        setData(null)
        setViewOpcion(false)
        setActiveCreate(false)
        setActiveAdd(false)
    }

    const activeAaa = () => {
        setActiveAdd(true)
    }

    const handleNavigateFicha = (item) => {
        navigate(`/ficha/${item.codigo_ficha}`);
        toast.success(`Ver ficha familiar: ${item.codigo_ficha}`);
    }

    const handleExportExcel = () => {
        toast.success('Exportando datos a Excel...');
    }

    return (
        <div className='fich-fami'>
            {activeCreate ? (
                <CrearFicha onClose={handleCloseViews} />
            ) : (data || activeAdd) ? (
                <AnadirAFicha data={data} onClose={handleCloseViews} fichas={fichas} />
            ) : (
                <section>
                    <h3 className='title-view'>Carpetas Familiares</h3>
                    <div className="acciones">
                        <input
                            type="text"
                            placeholder='Buscar por código, dni, hist clínica...'
                            value={searchTerm}
                            onChange={(e) => {
                                setPage(1);
                                setSearchTerm(e.target.value);
                            }}
                        />
                        <LuTextSearch className='search-ico' />
                        <button onClick={() => setActiveCreate(true)} ><TbPencilPlus /> Crear Ficha</button>
                        <button onClick={activeAaa} ><HiOutlineViewGridAdd /> Agregar a Ficha</button>
                        {user.user.tipo_user === 'Admin' && (
                            <DownloadTableExcel
                                filename={"fichas_familiares"}
                                sheet={"fichas"}
                                currentTableRef={tableRef.current}
                            >
                                <button onClick={handleExportExcel}><TbPackageExport /> Exportar Fichas</button>
                            </DownloadTableExcel>
                        )}
                    </div>
                    <Export tableRef={tableRef} fichas={fichas} page={page} limit={limit} />
                    <div className="tbl">
                        <div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>N°</th>
                                        <th>Cod Ficha</th>
                                        <th>Manzana</th>
                                        <th>Vivienda</th>
                                        <th>Familia</th>
                                        <th>Jefe de Familia</th>
                                        <th>Telefono</th>
                                        <th>#</th>
                                        <th>Sector</th>
                                        <th>Responsable de Manzana</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fichas.length > 0 ? (
                                        fichas.map((ficha, index) => {
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
                                                    <td>{(page - 1) * limit + index + 1}</td>
                                                    <td onClick={() => handleNavigateFicha(ficha)} className='cod_ficha'><FaFolderOpen className='ico-folder' /> {ficha.codigo_ficha}</td>
                                                    <td>{ficha.manzana}</td>
                                                    <td>{ficha.vivienda_numero}</td>
                                                    <td>{ficha.grupo_familiar}</td>
                                                    <td className='no-center name'>{ficha.jefe_familia || '---'}</td>
                                                    <td>{telefonoJefe}</td>
                                                    <td>{ficha.pacientes.length || '---'}</td>
                                                    <td className='no-center'>{ficha.sector || '---'}</td>
                                                    <td style={{ textAlign: 'left', textTransform: 'uppercase' }}>{nameComplete} </td>
                                                    <td className='acc-ficha'>
                                                        {ficha.pacientes.length > 0 && (
                                                            <div>
                                                                <FaUsersViewfinder className='ico-view' onClick={() => handleNavigateFicha(ficha)} />
                                                                <p>Ver Ficha</p>
                                                            </div>
                                                        )}
                                                        {user.user.tipo_user === 'Admin' && (
                                                            <div>
                                                                <RiDeleteBin6Line className='ico-del' onClick={() => deleteFichaFamiliar(ficha.id_ficha)} />
                                                                <p>Eliminar Ficha</p>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={10}>
                                                {loading ? (
                                                    <p id="loading-text">Cargando...</p>
                                                ) : (
                                                    'No hay datos...'
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="paginacion">
                                <button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button>
                                <span>Página {page} de {totalPages}</span>
                                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Siguiente</button>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}

export default FichaFamiliar
