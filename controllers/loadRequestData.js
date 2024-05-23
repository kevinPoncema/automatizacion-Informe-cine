const path = require('path');
const express = require('express');
const requestDataModel = require("../models/requestDataModel");

class LoadRequestData {
    async getIntData(req, res) {
        try {
            const modelo = new requestDataModel(); // Crear una instancia del modelo
            const data = await modelo.getIncialData([]);
            // Limpiar los datos eliminando \r\n
            const cleanedData = data.rows.map(product => ({
                nombre_prod: product.pro.replace(/[\r\n]+/g, '')
            }));
            res.render("solicitud", { pro: cleanedData }); // Renderizar la vista 'solicitud' con los datos limpios

        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }
}

module.exports = LoadRequestData;
