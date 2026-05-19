import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Registro } from '../../types';

export const generarPDFAsistencia = (registros: Registro[], filtros: { grupo: string, turno: string, tipo: string }) => {
  const doc = new jsPDF();
  const fechaGeneracion = new Date().toLocaleString('es-MX');

  // Configuración de colores
  const azulPrimario = [26, 58, 92]; // #1A3A5C

  // Encabezado
  doc.setFillColor(azulPrimario[0], azulPrimario[1], azulPrimario[2]);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CETIS 24 - SISTEMA SCESA', 105, 18, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte Oficial de Control de Entradas y Salidas', 105, 28, { align: 'center' });

  // Información del Reporte
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Fecha de impresión: ${fechaGeneracion}`, 15, 50);

  // Línea divisoria
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 55, 195, 55);

  // Resumen de Filtros
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Criterios de búsqueda:', 15, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(`Grupo: ${filtros.grupo.toUpperCase()} | Turno: ${filtros.turno.toUpperCase()} | Movimiento: ${filtros.tipo.toUpperCase()}`, 15, 72);
  doc.text(`Total de registros: ${registros.length}`, 15, 79);

  // Tabla de Datos
  const tableRows = registros.map(reg => [
    reg.fecha,
    reg.hora,
    reg.nombre,
    reg.alumno,
    reg.grupo,
    reg.turno,
    reg.tipo
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['Fecha', 'Hora', 'Nombre del Alumno', 'No. Control', 'Grupo', 'Turno', 'Movimiento']],
    body: tableRows,
    headStyles: {
      fillColor: [46, 109, 164], // #2E6DA4
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' }
    }
  });

  // Pie de página (se añade a cada página)
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      '© 2026 CETIS 24 - Este documento es un reporte oficial generado por el sistema SCESA.',
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10
    );
  }

  // Guardar el PDF
  const nombreArchivo = `Reporte_SCESA_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nombreArchivo);
};
