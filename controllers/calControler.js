const path = require('path');
const express = require('express');
const requestDataModel = require("../models/requestDataModel");

class calcular {
    async hacerCalculos(req, res, informeVentas) {
        try {
            const formData = req.body; // Obtener los datos enviados en el cuerpo de la solicitud
            if (!informeVentas) {
                res.redirect("/");
                return;
            }
            
            // Filtrar los combos
            const combos = informeVentas.filter(item => item.producto.toUpperCase().includes('COMBO'));
            
            // Eliminar los combos del informe original
            const informeSinCombos = informeVentas.filter(item => !item.producto.toUpperCase().includes('COMBO'));
            
            const resMat = [];
            formData.forEach(function(data) {
                const obj = { ...data };
                const infoVentas = informeSinCombos.find(item => item.producto.toUpperCase() === obj.productName.toUpperCase());
                if (infoVentas) {
                    obj.TotalProductos = obj.inventoryInitial + obj.entrada - obj.salida;
                    obj.inventoryFinal = obj.TotalProductos - infoVentas.cantidad;
                }
                resMat.push(obj);
            });

            // Responder al cliente con un mensaje de confirmación
            console.log(resMat)
            res.json({ status: 'Datos recibidos correctamente.', combos, informeSinCombos, resMat });
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }
}

module.exports = calcular;
