const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
const dataModel = require("../models/requestDataModel");
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

function sanitizeItem(item) {
    return {
        productName: item.productName ?? '',
        inventoryInitial: item.inventoryInitial ?? 0,
        entrada: item.entrada ?? 0,
        salida: item.salida ?? 0,
        TotalProductos: item.TotalProductos ?? 0,
        inventarioFinal: item.inventarioFinal ?? 0,
        venta: item.venta ?? 0,
        precio: item.precio ?? 0,
        totalIndi: item.totalIndi ?? 0,
        sobrante: item.sobrante ?? 0,
        faltante: item.faltante ?? 0,
    };
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
                widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                body: [
                    [
                        { text: 'ARTICULO', style: 'tableHeader' },
                        { text: 'Inv Inicial', style: 'tableHeader' },
                        { text: 'Entrada', style: 'tableHeader' },
                        { text: 'Salida', style: 'tableHeader' },
                        { text: 'Total Prod', style: 'tableHeader' },
                        { text: 'Inv Final', style: 'tableHeader' },
                        { text: 'VENTA', style: 'tableHeader' },
                        { text: 'PRECIO', style: 'tableHeader' },
                        { text: 'Total', style: 'tableHeader' },
                        { text: 'sobrante', style: 'tableHeader' },
                        { text: 'faltante', style: 'tableHeader' },
                    ],
                    ...dataInforme.map(item => {
                        const sanitizedItem = sanitizeItem(item);
                        return [
                            sanitizedItem.productName,
                            sanitizedItem.inventoryInitial,
                            sanitizedItem.entrada,
                            sanitizedItem.salida,
                            sanitizedItem.TotalProductos,
                            sanitizedItem.inventarioFinal,
                            sanitizedItem.venta,
                            sanitizedItem.precio,
                            sanitizedItem.totalIndi,
                            sanitizedItem.sobrante,
                            sanitizedItem.faltante,
                        ];
                    }),
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
                        '-', 
                        '-', 
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

async function genInveSheet(idEmp, nomEmp) {
    let modelo = new dataModel();
    // Obtener la lista de productos
    let categoria = nomEmp !== "vip" ? "n" : "vip";
    const data = await modelo.getIncialData([categoria]);
    // Obtener el inventario final del día anterior
    const previousInventoryData = await modelo.getFinalInventoryOfPreviousDay(idEmp);
    let cleanedData = [];
    if (!previousInventoryData.rows.length) {
        // Si no hay datos de inventario anterior, establece el inventario inicial en 0 para todos los productos
        cleanedData = data.rows.map(product => ({
            nombre_prod: product.pro.replace(/[\r\n#+-]+/g, ''),
            inventario_inicial: 0,
        }));
    } else {
        const previousInventory = JSON.parse(previousInventoryData.rows[0].invFinal);
        // Limpiar los datos eliminando \r\n y asignar inventario inicial basado en el inventario anterior
        cleanedData = data.rows.map(product => {
            const productName = product.pro.replace(/[\r\n#+-]+/g, '');
            const productInPreviousInventory = previousInventory.flat().find(item => item.productName === productName);
            let inventarioInicial = productInPreviousInventory ? productInPreviousInventory.inventarioFinal : 0;
        
            // Asegurarse de que el inventario inicial no sea menor que 0
            inventarioInicial = Math.max(inventarioInicial, 0);
        
            return {
                nombre_prod: productName,
                inventario_inicial: inventarioInicial,
            };
        });
    }

    // Especificar la ruta del archivo donde se guardará el PDF
    const pdfDir = path.join(__dirname, '../pdf');
    const fechaActual = new Date().toISOString().slice(0, 10); // Obtener la fecha actual
    const fileName = `Reporte_Inventario_${fechaActual}_${nomEmp}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    // Crear la carpeta "pdf" si no existe
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Definir el contenido del documento PDF
    const docDefinition = {
        content: [
            { text: 'REPORTE DE INVENTARIO', style: 'header' },
            { text: `cajero:${nomEmp} \tFecha: ${new Date().toLocaleString()}`, style: 'subheader' },
            { text: '\n\n' }, // Espacio en blanco

            // Tabla con datos de cleanedData
            {
                table: {
                    headerRows: 1,
                    widths: ['*', '*', '*', '*', '*'],
                    body: [
                        [
                            { text: 'ARTICULO', style: 'tableHeader' },
                            { text: 'INVENTARIO INICIAL', style: 'tableHeader' },
                            { text: 'ENTRADA', style: 'tableHeader' },
                            { text: 'SALIDA', style: 'tableHeader' },
                            { text: 'FINAL', style: 'tableHeader' }
                        ],
                        ...cleanedData.map(item => [
                            item.nombre_prod,
                            item.inventario_inicial,
                            '', // Entrada
                            '', // Salida
                            ''  // Final
                        ])
                    ]
                }
            },
            { text: '\n\n' }, // Espacio en blanco
        ],
        styles: {
            header: { fontSize: 20, bold: true, alignment: 'center' },
            subheader: { fontSize: 12, alignment: 'center' },
            tableHeader: { bold: true, alignment: 'center', fontSize: 10 },
            total: { bold: true, alignment: 'right', fontSize: 12 }
        }
    };

    // Crear una función que envuelve pdfDocGenerator.getBuffer en una promesa
    function getPdfBuffer() {
        return new Promise((resolve, reject) => {
            pdfMake.createPdf(docDefinition).getBuffer((buffer) => {
                if (buffer) {
                    resolve(buffer);
                } else {
                    reject(new Error('Error al generar el buffer del PDF'));
                }
            });
        });
    }

    try {
        // Esperar a que el buffer del PDF se genere
        const buffer = await getPdfBuffer();
        // Guardar el PDF en el servidor
        fs.writeFileSync(filePath, buffer);
        console.log('PDF guardado en ' + filePath);
        console.log(cleanedData);
        return filePath;
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        throw error; // Lanzar error para manejarlo en el endpoint
    }
}

    
module.exports = {
    parseTextFile,
    genPdf,
    genInveSheet
};
