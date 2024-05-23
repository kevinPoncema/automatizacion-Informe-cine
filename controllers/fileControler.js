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

module.exports = {
    parseTextFile
};
