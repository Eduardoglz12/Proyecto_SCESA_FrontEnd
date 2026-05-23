import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Registro } from '../../types';

export const generarPDFAsistencia = (registros: Registro[], filtros: { grupo: string, turno: string, tipo: string }) => {
  const doc = new jsPDF();
  const fechaGeneracion = new Date().toLocaleString('es-MX');

  // Configuración de colores
  const azulPrimario = [21, 101, 192]; // #1565C0 (Nuevo azul)

  // Encabezado con Fondo Azul
  doc.setFillColor(azulPrimario[0], azulPrimario[1], azulPrimario[2]);
  doc.rect(0, 0, 210, 45, 'F');

  // Título Blanco
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SCESA - CETIS 24', 105, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Control Escolar de Entradas y Salidas', 105, 30, { align: 'center' });

  // Información del Reporte (Debajo del encabezado azul)
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.text(`Reporte generado el: ${fechaGeneracion}`, 15, 55);

  // Línea divisoria decorativa
  doc.setDrawColor(azulPrimario[0], azulPrimario[1], azulPrimario[2]);
  doc.setLineWidth(0.5);
  doc.line(15, 60, 195, 60);

  // Resumen de Filtros
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Criterios del Reporte:', 15, 70);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Filtro de Grupo: ${filtros.grupo.toUpperCase()}`, 15, 77);
  doc.text(`Periodo: ${filtros.turno.toUpperCase()}`, 15, 83);
  doc.text(`Total de registros: ${registros.length}`, 15, 89);

  // Tabla de Datos
  const tableRows = registros.map(reg => [
    reg.fecha,
    reg.hora,
    reg.nombre,
    reg.alumno,
    `${reg.grado}°${reg.grupo}`,
    reg.turno,
    reg.tipo
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['Fecha', 'Hora', 'Nombre del Alumno', 'No. Control', 'Grado/Grup', 'Turno', 'Movimiento']],
    body: tableRows,
    headStyles: {
      fillColor: [21, 101, 192],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 25 },
      1: { halign: 'center', cellWidth: 20 },
      3: { fontStyle: 'bold' },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'center', cellWidth: 25 },
      6: { halign: 'center', cellWidth: 25 }
    }
  });

  // Pie de página
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const footerY = doc.internal.pageSize.height - 10;

    doc.text('© 2026 CETIS 24 - Sistema SCESA | Reporte de Asistencia Automatizado', 105, footerY, { align: 'center' });
    doc.text(`Página ${i} de ${pageCount}`, 195, footerY, { align: 'right' });
  }

  // Guardar el PDF
  const nombreArchivo = `Reporte_Asistencia_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nombreArchivo);
};
