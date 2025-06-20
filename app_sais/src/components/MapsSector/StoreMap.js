import jsPDF from 'jspdf';
import 'jspdf-autotable';
// import Store from '../../utils/storeCitaTurno';
import Swal from 'sweetalert2';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

const useStoreMap = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    // const { sectorPer } = Store();
    const [selectManzana, setSelectManzana] = useState(null);
    const [cargando, setCargando] = useState(false);

    const defaultColors = {
        deporte: '#38a700',
        educacion: '#ff7f7f',
        espacimiento: '#ffff00',
        estado: '#ff2d7f',
        iglesia: '#ff72df',
        industria: '#ffaa00',
        mercado: '#d7d79e',
        salud: '#00c5ff',
        viviendas: '#90ee90',
        hidrografia: '#1e90ff',
        calles: '#808080',
        mz2021: '#ffffff',
    };

    const getColors = () => {
        const savedColors = localStorage.getItem('colors');
        return savedColors ? JSON.parse(savedColors) : defaultColors;
    };

    // Obtener personales de sector
    const [sectorPer, setSectorPer] = useState([]);
    const fetchSectorPer = async () => {
        setCargando(true)
        try {
            const response = await axios.get(`${apiUrl}/api/personal/obtener-sector-asignado`);
            setSectorPer(response.data);    
            if (response.data) {
                setCargando(false)
            }
        } catch (error) {
            console.error('Error al obtener los datos del sector:', error);
            // setCargando(false)
        }
    }

    // Obtener las notas desde la base de datos
    const [notas, setNotas] = useState([]);
    const getNotas = async () => {
        setCargando(true)
        try {
            const response = await axios.get(`${apiUrl}/api/map/notas-manzana`);
            setNotas(response.data);
            if (response.data) {
                setCargando(false) 
            }
        } catch (error) {
            console.error('Error al obtener notas:', error);
        }
    };

    const idMz = selectManzana?.id;

    useEffect(() => {
        fetchSectorPer();
        getNotas();
    }, [idMz, selectManzana]);

    const handleExporNota = async () => {
        try {
            // const response = await fetch(`${apiUrl}/api/map/notas-manzana`);
            // const data = await response.json();
            if (notas.length === 0) {
                toast.error('No hay notas para exportar');
                return; 
            }

            const doc = new jsPDF();
            const tableColumn = ['N°', 'Código', 'Manzana', 'Nota', 'Fecha_Recordatorio'];
            const tableRows = notas.map((item, index) => [
                index + 1,
                item.codigo,
                item.manzana,
                item.nota,
                item.fecha_recordatorio,
            ]);

            doc.text('Notas de Manzanas', 14, 15);
            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 20,
            });
            toast.success('Notas exportadas correctamente');
            doc.save('notas_manzana.pdf');
        } catch (error) {
            toast.error('Error al exportar los datos');
            console.error('Error al exportar los datos:', error);
        }
    };

    const handleExportAsignado = async () => {
        try {
            if (sectorPer.length === 0) {
                toast.error('No hay asignaciones para exportar');
                return; 
            }
    
            // Agrupar por DNI y juntar pares código-manzana
            const agrupados = {};
            sectorPer.forEach(item => {
                const key = item.dni;
                if (!agrupados[key]) {
                    agrupados[key] = { ...item, codigosManzanas: [{ codigo: item.codigo, manzana: item.manzana || '--' }] };
                } else {
                    // Verificar si ya existe ese código con manzana para evitar duplicados
                    const existe = agrupados[key].codigosManzanas.some(
                        cm => cm.codigo === item.codigo && cm.manzana === (item.manzana || '--')
                    );
                    if (!existe) {
                        agrupados[key].codigosManzanas.push({ codigo: item.codigo, manzana: item.manzana || '--' });
                    }
                }
            });
    
            // Convertir a array y unir código y manzana por guion, cada par en línea nueva
            const dataAgrupada = Object.values(agrupados).map(item => ({
                ...item,
                codigo: item.codigosManzanas
                    .map(cm => `${cm.codigo} - ${cm.manzana}`)
                    .join('\n'),
            }));
    
            const doc = new jsPDF();
            const tableColumn = ['N°', 'Código - Manzana', 'Nombre Profesional', 'DNI'];
            const tableRows = dataAgrupada.map((item, index) => [
                index + 1,
                item.codigo,
                (item.nombres + ' ' + item.paterno + ' ' + item.materno).toUpperCase(),
                item.dni
            ]);
    
            doc.text('Profesionales con Manzanas', 14, 15);
            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 20,
                styles: { cellPadding: 2 },
                columnStyles: {
                    1: { cellWidth: 60 } // Ajusta ancho para que se vea bien el salto de línea
                },
                didDrawCell: (data) => {
                    // Para que el salto de línea funcione bien en jsPDF autoTable, se puede usar cell.styles.minCellHeight o cell.styles.cellPadding si fuera necesario
                }
            });
            doc.save('asignado_manzana.pdf');
        } catch (error) {
            console.error('Error al exportar los datos:', error);
        }
    };
    

    // logica para vaciado de datos de configuracion
    const vaciarAsignacion = async () => {
        try {
            await axios.delete(`${apiUrl}/api/map/eliminar-todos-asignados`);
            sectorPer.splice(0, sectorPer.length);
        } catch (error) {
            console.error('Error al eliminar los datos:', error); 
        }
    }

    const vaciarNotas = async () => {
        try {
            await axios.delete(`${apiUrl}/api/map/eliminar-todas-notas`); 
            getNotas()
        } catch (error) {
            console.error('Error al eliminar los datos:', error); 
        }
    }

    const confirmarAccion = (tipo) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: tipo === 'asignacion' ? 'Esto eliminará todas las asignaciones.' : 'Esto eliminará todas las notas.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                // Aquí va la lógica para vaciar asignación o notas
                if (tipo === 'asignacion') {
                    vaciarAsignacion();
                    console.log('Asignación vaciado');
                } else {
                    vaciarNotas();
                    console.log('Notas vaciado');
                }
                Swal.fire('Completado', 'La acción se realizó con éxito.', 'success');
            }
        });
    };


    // logica para elemina persona de sector asignado     // Para borrar un profesional asignado
    const deletePerson = async (id) => {
        try {
            await axios.delete(`${apiUrl}/api/personal/eliminar-sector/${id}`);
            fetchSectorPer();
        } catch (error) {
            console.error('Error al eliminar el personal:', error);
        }
    };

    const confirDeletePerson = (person) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Eleminar a ${person.nombres} ${person.paterno} ${person.materno}? `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                deletePerson(person.id_sector_personal);
                Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
            }
        });
    };


    return {
        defaultColors,
        handleExporNota,
        handleExportAsignado,
        confirmarAccion,
        confirDeletePerson,
        notas,
        getNotas,
        cargando,
        selectManzana,
        setSelectManzana,
        sectorPer,
        fetchSectorPer,
        getColors
    }
}

export default useStoreMap;