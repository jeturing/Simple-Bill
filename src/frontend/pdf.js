import { getCompany } from './config.js';

const { jsPDF } = window.jspdf;

export function generatePDF(factura, preview = false) {
    const doc = new jsPDF();
    const empresa = getCompany();

    // Header
    doc.setFontSize(18);
    doc.text(empresa.nombre || 'Factura', 105, 15, null, null, 'center');

    if (empresa.logo) {
        try {
            doc.addImage(empresa.logo, 'PNG', 14, 20, 30, 30);
        } catch(e) {
            console.error("Error adding image to PDF: ", e);
        }
    }

    doc.setFontSize(11);
    doc.text(`Código: ${factura.codigo}`, 14, 60);
    doc.text(`Fecha: ${factura.fecha}`, 14, 68);

    doc.text(`Cliente: ${factura.cliente.nombre}`, 14, 78);
    if (factura.cliente.email) doc.text(`Email: ${factura.cliente.email}`, 14, 86);

    // Tabla productos
    const headers = [['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']];
    const rows = factura.productos.map(p => [
        p.nombre,
        p.cantidad.toString(),
        '$' + p.precio.toFixed(2),
        '$' + (p.cantidad * p.precio).toFixed(2)
    ]);

    doc.autoTable({
        startY: 95,
        head: headers,
        body: rows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [220, 220, 220] },
        margin: { left: 14, right: 14 }
    });

    // Total
    const finalY = doc.lastAutoTable.finalY || 95 + rows.length * 10 + 20;
    doc.setFontSize(12);
    doc.text(`Total: $${factura.total.toFixed(2)}`, 14, finalY + 10);

    if (preview) {
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        document.getElementById('visorPDF').src = pdfUrl;
        // Show the PDF viewer section
        document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
        document.getElementById('pdf-viewer-section').classList.remove('hidden');
    } else {
        doc.save(`${factura.codigo}.pdf`);
    }
}
