import React, {useState, useEffect} from 'react'
import { useAuth } from '../../context/AuthContext';
import Store from '../../utils/storeCitaTurno';
import StoreMap from '../MapsSector/StoreMap';

const headerStore = () => {
    const { user } = useAuth();
    const { citas, sectorPer, turnosPersonal } = Store();
    const { notas } = StoreMap();
    const [notificaciones, setNotificaciones] = useState([]);
    const [noti, setNoti] = useState(false)

    const nameCompleto = user.user.apellidos + ' ' + user.user.nombres;
    const idUser = user.user.id;

    const obtenerNotificaciones = () => {
        const notificacionesTemp = [];
        const hoy = new Date();
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        // Notificaciones de notas de sector
        const sectoresAsignados = sectorPer.filter(sector => sector.id_personal === idUser);
        sectoresAsignados.forEach(sector => {
            const notasSector = notas.filter(nota => 
                nota.manzana === sector.manzana && 
                nota.fecha_recordatorio
            );

            notasSector.forEach(nota => {
                const fechaNota = new Date(nota.fecha_recordatorio);
                // Establecer las horas a 0 para comparar solo fechas
                const fechaNotaSinHora = new Date(fechaNota.setHours(0,0,0,0));
                const hoySinHora = new Date(hoy.setHours(0,0,0,0));
                const diffDias = Math.floor((fechaNotaSinHora - hoySinHora) / (1000 * 60 * 60 * 24));
                
                if (diffDias <= 1 && diffDias >= 0) {
                    notificacionesTemp.push({
                        tipo: 'Nota de Sector',
                        titulo: `Recordatorio de Nota  de manzana- Mz ${nota.codigo}`,
                        descripcion: nota.nota,
                        fecha: nota.fecha_recordatorio,
                        leido: false
                    });
                }
            });
        });

        // Notificaciones de citas
        citas.forEach(cita => {
            if (cita.profesional_cita === nameCompleto) {
                const fechaCita = new Date(cita.fecha);
                // Establecer las horas a 0 para comparar solo fechas
                const fechaCitaSinHora = new Date(fechaCita.setHours(0,0,0,0));
                const hoySinHora = new Date(hoy.setHours(0,0,0,0));
                const diffDias = Math.floor((fechaCitaSinHora - hoySinHora) / (1000 * 60 * 60 * 24));
                
                if (diffDias <= 1 && diffDias >= -0) {
                    notificacionesTemp.push({
                        tipo: 'Cita',
                        titulo: `Cita Programada - ${cita.especialidad} (${cita.consultorio})`,
                        descripcion: `Paciente: ${cita.nombres.toUpperCase()} ${cita.ape_paterno.toUpperCase()} ${cita.ape_materno.toUpperCase()} \n\n Hora: ${cita.hora}`,
                        fecha: cita.fecha,
                        leido: false
                    });
                }
            }
        });

        // Notificaciones de turnos
        turnosPersonal.forEach(turno => {
            if (turno.id_personal === idUser) {
                const fechaTurno = new Date(turno.fecha);
                // Establecer las horas a 0 para comparar solo fechas
                const fechaTurnoSinHora = new Date(fechaTurno.setHours(0,0,0,0));
                const hoySinHora = new Date(hoy.setHours(0,0,0,0));
                const diffDias = Math.floor((fechaTurnoSinHora - hoySinHora) / (1000 * 60 * 60 * 24));

                if (diffDias <= 1 && diffDias >= -0) {
                    notificacionesTemp.push({
                        tipo: 'Turno',
                        titulo: `Turno Programado`,
                        descripcion: `Turno: ${turno.turno}`,
                        fecha: turno.fecha,
                        leido: false
                    });
                }
            }
        });

        // Ordenar notificaciones por fecha y hora
        notificacionesTemp.sort((a, b) => {
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);
            
            // Si las fechas son iguales y son citas, ordenar por hora
            if (fechaA.toDateString() === fechaB.toDateString() && 
                a.tipo === 'Cita' && b.tipo === 'Cita') {
                const horaA = a.descripcion.split('Hora: ')[1];
                const horaB = b.descripcion.split('Hora: ')[1];
                return horaA.localeCompare(horaB);
            }
            
            // Si las fechas son diferentes, ordenar por fecha
            return fechaA - fechaB;
        });

        setNoti(notificacionesTemp.length > 0);
        setNotificaciones(notificacionesTemp);
    };

    useEffect(() => {
        obtenerNotificaciones();
    }, [citas, sectorPer, turnosPersonal, notas, idUser, nameCompleto]);

    const marcarComoLeido = (index) => {
        setNotificaciones(prev => {
            const nuevasNotificaciones = [...prev];
            nuevasNotificaciones[index] = {
                ...nuevasNotificaciones[index],
                leido: true
            };
            return nuevasNotificaciones;
        });
    };

    return {
        notificaciones,
        marcarComoLeido,
        noti,
        setNoti
    }
}

export default headerStore