const express = require('express');
const requestDataModel = require("../models/requestDataModel");

class LoadRequestData {
    async getIntData(req, res, pdfCompleto) {
        try {
            const cajero = pdfCompleto.cajeroId;
            const modelo = new requestDataModel();
            const categoria = pdfCompleto.cajero === "vip" ? "v" : "n";
            // Obtener la lista de productos
            const data = await modelo.getIncialData([categoria]);

            // Obtener el inventario final del día anterior
            const previousInventoryData = await modelo.getFinalInventoryOfPreviousDay(cajero);
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
                    const inventarioInicial = productInPreviousInventory ? productInPreviousInventory.inventarioFinal : 0;
                    return {
                        nombre_prod: productName,
                        inventario_inicial: inventarioInicial,
                    };
                });
            }

            res.render("solicitud", { pro: cleanedData });
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            if (!res.headersSent) {
                res.status(500).send('Error al obtener los datos');
            }
        }
    }
}

module.exports = LoadRequestData;
