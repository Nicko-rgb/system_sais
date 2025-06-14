import './asing.css'
import { useFichaStore } from './StoreFicha'

const AsingJefe = ({ data }) => {
    
    const {  loading, handleAsignarJefe } = useFichaStore()

    // filtrar a jefe
    const jefe = data?.pacientes.find(item => item.is_jefe);
    
    return (
        <div className='asing-jefe' >
            {jefe && (
                <aside>
                    <label>DNI:
                        <span>{jefe.dni} </span>
                    </label>
                    <label>Hist Clínica:
                        <span>{jefe.hist_clinica} </span>
                    </label>
                    <label>Apellidos y Nombres:
                        <span>{jefe.ape_paterno} {jefe.ape_materno} {jefe.nombres}</span>
                    </label>
                    <label>Edad:
                        <span>{jefe.edad} </span>
                    </label>
                    <label>Teléfono:
                        <span>{jefe.celular1} </span>
                    </label>
                </aside>
            )}
            <hr />

            {data?.pacientes.map((p, index) => (
                !p.is_jefe &&(
                    <div key={p.id_paciente} >
                        <p>Nombres: {p.nombres} - DNI: {p.dni} </p>
                        <button onClick={() => handleAsignarJefe(p.id_paciente, data.id_ficha)} >{loading ? 'Asigando..' : 'Asignar Jefe'} </button>
                    </div>
                )
            ))}
        </div>
    )
}

export default AsingJefe