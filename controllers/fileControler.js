const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake.vfs;
const fs = require('fs');
const path = require('path');
//convierte el informe de ventas de txt a un array de objectos
async function parseTextFile(txt) {
    try {
        const lines = txt.split('\n'); // Dividir el contenido del archivo en líneas
        const products = [];
        const productLineRegex = /\s*([A-Z0-9\sa-záéíóúÁÉÍÓÚÑñ+#]+)\s+(\d+,\d+)\s+(\d+)/;

        for (let line of lines) {
            const match = line.match(productLineRegex); // Intentar hacer coincidir la línea con la expresión regular
            if (match) {
                const product = {
                    producto: match[1].trim(),
                    importe: parseFloat(match[2].replace(',', '.')), // Convertir el importe a número flotante
                    cantidad: parseInt(match[3], 10) // Convertir la cantidad a entero
                };
                products.push(product); // Añadir el producto al array
            }
        }
        return products; // Devolver la lista de productos
    } catch (err) {
        console.error('Error al analizar el texto:', err); // Mostrar el error en la consola
        throw err; // Lanzar el error para que pueda ser manejado por el llamador
    }
}
async function genPdf(dataInforme, pdfCompleto, combos, totalGen) {
    // Especificar la ruta del archivo donde se guardará el PDF
    const pdfDir = path.join(__dirname, '../pdf');
    const fechaActual = new Date().toISOString().slice(0, 10); // Obtener la fecha actual
    const fileName = `Informe_Ventas_Final_${fechaActual}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    // Crear la carpeta "pdf" si no existe
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Definir el contenido del documento PDF
    const cajero = pdfCompleto.cajero;
    pdfCompleto.content = [
        { text: 'ENTRADAS Y SALIDAS DE REFRESQUERIA', style: 'header' },
        { text: `Cajero: ${cajero}  Fecha: ${new Date().toLocaleString()}`, style: 'subheader' },
        { text: '\n\n' }, // Espacio en blanco

        // Tabla con datos de dataInforme
        {
            table: {
                headerRows: 1,
                widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                body: [
                    [
                        { text: 'ARTICULO', style: 'tableHeader' },
                        { text: 'Inventario Inicial', style: 'tableHeader' },
                        { text: 'Entrada', style: 'tableHeader' },
                        { text: 'Salida', style: 'tableHeader' },
                        { text: 'Total Productos', style: 'tableHeader' },
                        { text: 'Inventario Final', style: 'tableHeader' },
                        { text: 'VENTA', style: 'tableHeader' },
                        { text: 'PRECIO', style: 'tableHeader' },
                        { text: 'Total', style: 'tableHeader' },
                        { text: 'Balance Inv', style: 'tableHeader' },
                        { text: 'Faltante', style: 'tableHeader' },
                        { text: 'Sobrante', style: 'tableHeader' }
                    ],
                    ...dataInforme.map(item => [
                        item.productName,
                        item.inventoryInitial,
                        item.entrada,
                        item.salida,
                        item.TotalProductos,
                        item.inventarioFinal,
                        item.venta,
                        item.precio,
                        item.totalIndi,
                        item.balanceInventario,
                        item.faltante, // Faltante
                        item.sobrante // Sobrante
                    ]),
                    ...combos.map(combo => [
                        combo.producto,
                        '-', // No hay inventario inicial para combos
                        '-', // No hay entrada para combos
                        '-', // No hay salida para combos
                        '-', // No hay total productos para combos
                        '-', // No hay inventario final para combos
                        combo.cantidad,
                        combo.importe,
                        combo.totalIndi,
                        '-', // No hay balance inventario para combos
                        '_', // Faltante
                        '_', // Sobrante
                    ])
                ]
            }
        },
        { text: '\n\n' }, // Espacio en blanco

        // Total general
        { text: `Total general: ${totalGen}`, style: 'total' }
    ];

    // Estilos para el PDF
    pdfCompleto.styles = {
        header: { fontSize: 20, bold: true, alignment: 'center' },
        subheader: { fontSize: 12, alignment: 'center' },
        tableHeader: { bold: true, alignment: 'center', fontSize: 10 },
        total: { bold: true, alignment: 'right', fontSize: 12 }
    };

    // Generar el PDF
    const pdfDocGenerator = pdfMake.createPdf(pdfCompleto);

    // Guardar el PDF en el servidor
    pdfDocGenerator.getBuffer((buffer) => {
        fs.writeFileSync(filePath, buffer);
        console.log('PDF guardado en ' + filePath);
        pdfCompleto.status = true;
        pdfCompleto.filePath = filePath;
    });
}

module.exports = {
    parseTextFile,
    genPdf
};
