const path = require('path');
const express = require('express');
const requestDataModel = require("../models/requestDataModel");
const ComboModel = require("../models/comboModel");

class Calcular {
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
            for (const data of formData) {
                const obj = { ...data };
                const infoVentas = informeSinCombos.find(item => item.producto.toUpperCase() === obj.productName.toUpperCase());
                if (infoVentas) {
                    obj.TotalProductos = obj.inventoryInitial + obj.entrada - obj.salida;
                    obj.inventoryFinal = obj.TotalProductos - infoVentas.cantidad;
                    const modeloCombos = new ComboModel();
                    let balanceCombos = 0
                    for (const combo of combos) {
                        const result = await modeloCombos.comboIncludeProduct([obj.productName,combo.producto]);
                        //console.log(result.rows[0][0].Cantidad_Producto)
                        
                        if (result.rows[0].length >0) {
                            //combo.cantidad = la cantidad de ese combo que se vendio
                            //y rows.cantidad_producto = la cantidad de ese producto que incluye el combo
                            balanceCombos+= (combo.cantidad*result.rows[0][0].Cantidad_Producto)
                        }
                    }
                    obj.balanceCombos = balanceCombos
                }
                resMat.push(obj);
            }

            // Responder al cliente con un mensaje de confirmación
            console.log(resMat)
            return res.json({ status: 'Datos recibidos correctamente.', resMat });
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            return  res.status(500).send({ status: 'Error al obtener los datos' });
        }
    }
}

module.exports = Calcular;

