import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { calcularEdad } from './dateUtils';
import logo from '../assets/img/logoSalud.png'

export const generatePatientPDF = (paciente) => {
    const doc = new jsPDF();
    
    // Configuración de fuentes y colores
    const primaryColor = [41, 128, 185]; // Azul
    const secondaryColor = [52, 73, 94]; // Gris oscuro
    const lightGray = [236, 240, 241]; // Gris claro
    
    // Encabezado del documento
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 30, 'F');
    
    // Logo y título del centro de salud
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SAIS - CENTRO DE SALUD CLASS MICAELA BASTIDAS', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Ficha de Datos del Paciente', 105, 22, { align: 'center' });
    
    // Fecha de emisión
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-PE')}`, 15, 37);
    
    let yPosition = 44;
    
    // Función para agregar sección
    const addSection = (title, data, startY) => {
        let currentY = startY;
        
        // Título de sección
        doc.setFillColor(...lightGray);
        doc.rect(15, currentY - 5, 180, 7, 'F');
        doc.setTextColor(...primaryColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 20, currentY);
        currentY +=10;
        
        // Datos de la sección
        doc.setTextColor(...secondaryColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        data.forEach((item, index) => {
            if (currentY > 270) { // Nueva página si es necesario
                doc.addPage();
                currentY = 10;
            }
            
            const xPos = 20 + (index % 2) * 90;
            if (index % 2 === 0 && index > 0) currentY += 3;
            
            doc.setFont('helvetica', 'bold');
            doc.text(`${item.label}:`, xPos, currentY);
            doc.setFont('helvetica', 'normal');
            doc.text(item.value || '---', xPos + 30, currentY);
            
            if (index % 2 === 1) currentY += 3;
        });
        
        return currentY + 10;
    };
    
    // Información Personal
    const personalData = [
        { label: 'DNI', value: paciente.dni },
        { label: 'Apellidos', value:  `${paciente.ape_paterno} ${paciente.ape_materno}`},
        { label: 'Nombres', value: paciente.nombres },
        { label: 'Sexo', value: paciente.sexo },
        { label: 'Fecha Nac.', value: new Date(paciente.fecha_nacimiento).toLocaleDateString('es-PE') },
        { label: 'Edad', value: `${calcularEdad(paciente.fecha_nacimiento)} años` },
    ];
    
    yPosition = addSection('INFORMACIÓN PERSONAL', personalData, yPosition);
    
    // Contacto y Dirección
    const contactData = [
        { label: 'Celular 1', value: paciente.celular1 },
        { label: 'Celular 2', value: paciente.celular2 },
        { label: 'Dirección', value: paciente.direccion },
        { label: 'Sector', value: paciente.sector },
        { label: 'Localidad', value: paciente.localidad },
        { label: 'Departamento', value: paciente.departamento },
        { label: 'Provincia', value: paciente.provincia },
        { label: 'Distrito', value: paciente.distrito }
    ];
    
    yPosition = addSection('CONTACTO Y DIRECCIÓN', contactData, yPosition);
    
    // Historia Clínica
    const clinicalData = [
        { label: 'Hist. Clínica', value: paciente.hist_clinico },
        { label: 'CNV Línea', value: paciente.cnv_linea },
        { label: 'Discapacidad', value: paciente.discapacidad },
        { label: 'Jefe Familia', value: paciente.is_jefe ? 'Sí' : 'No' },
        { label: 'Tiene Resp.', value: paciente.id_responsable ? 'Sí' : 'No' },
        { label: 'Fecha Registro', value: new Date(paciente.fechaRegistro).toLocaleDateString('es-PE') }
    ];
    
    yPosition = addSection('HISTORIA CLÍNICA', clinicalData, yPosition);
    
    // Responsable del Paciente (si existe)
    if (paciente.responsable_paciente) {
        const responsableData = [
            { label: 'DNI', value: paciente.responsable_paciente.dni_res },
            { label: 'Apellidos', value: `${paciente.responsable_paciente.ape_paterno_res} ${paciente.responsable_paciente.ape_materno_res}`},
            { label: 'Nombres', value: paciente.responsable_paciente.nombres_res },
            { label: 'Parentesco', value: paciente.responsable_paciente.tipo_res },
            { label: 'Celular', value: paciente.responsable_paciente.celular1_res || paciente.responsable_paciente.celular2_res },
            { label: 'Dirección', value: paciente.responsable_paciente.direccion_res },
        ];
        
        yPosition = addSection('RESPONSABLE DEL PACIENTE', responsableData, yPosition);
    }
    
    // Ficha Familiar (si existe)
    if (paciente.ficha_familiar) {
        const fichaData = [
            { label: 'Código Ficha', value: paciente.ficha_familiar.codigo_ficha },
            { label: 'Manzana', value: paciente.ficha_familiar.manzana },
            { label: 'N° Vivienda', value: paciente.ficha_familiar.vivienda_numero },
            { label: 'Grupo Familiar', value: paciente.ficha_familiar.grupo_familiar },
            { label: 'Jefe Familia', value: paciente.ficha_familiar.jefe_familia }
        ];
        
        yPosition = addSection('FICHA FAMILIAR', fichaData, yPosition);
    }

    // Familias asociadas a la ficha familiar "familias_asociadas" es un arreglo de familias.
    // if (paciente.familiares_asociados && paciente.familiares_asociados.length > 0) {
    //     const familiasData = paciente.familiares_asociados.map(familia => ({
    //         label: `DNI`, value: familia.dni,
    //         label: `Nombres y Apellidos`, value: `${familia.nombres} ${familia.ape_paterno} ${familia.ape_materno}`,
    //         label: `Celular`, value: familia.celular1
    //     })
    //     );
    //     yPosition = addSection('FAMILIAS ASOCIADAS', familiasData, yPosition);
    // }

    if (paciente.familiares_asociados && paciente.familiares_asociados.length > 0) {
        // Título de la sección
        doc.setFillColor(...lightGray);
        doc.rect(15, yPosition - 5, 180, 7, 'F');
        doc.setTextColor(...primaryColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('FAMILIAS ASOCIADAS', 20, yPosition);
        yPosition += 1;
    
        // Tabla de familiares
        autoTable(doc, {
            startY: yPosition + 5,
            head: [['DNI', 'Apellidos y Nombres', 'Celular']],
            body: paciente.familiares_asociados.map(fam => [
                fam.dni,
                `${fam.ape_paterno} ${fam.ape_materno}, ${fam.nombres}`,
                fam.celular1 || '---'
            ]),
            styles: {
                fontSize: 9,
                cellPadding: 2
            },
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                cellPadding: 2
            },
            // bodyStyles: {},
            margin: { left: 15, right: 15 },
            theme: 'grid',
            didDrawPage: (data) => {
                yPosition = data.cursor.y + 10;
            }
        });
    }
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(...primaryColor);
        doc.rect(0, 287, 210, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('Centro de Salud SAIS - Documento Oficial', 105, 292, { align: 'center' });
        doc.text(`Página ${i} de ${pageCount}`, 190, 292, { align: 'right' });
    }
    
    // Descargar el PDF
    const fileName = `Ficha_Paciente_${paciente.hist_clinico}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};