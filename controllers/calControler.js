const path = require('path');
const express = require('express');
const requestDataModel = require("../models/requestDataModel");
const ComboModel = require("../models/comboModel");
const { json } = require('body-parser');

class Calcular {
    async hacerCalculos(req, res, informeVentas) {
        try {
            const formData = req.body; // Obtener los datos enviados en el cuerpo de la solicitud
            if (!informeVentas) {
                res.redirect("/");
                return;
            }
            let totalGen = 0;
            // Filtrar los combos
            const combos = informeVentas.filter(item => item.producto.toUpperCase().includes('COMBO'));
            // Eliminar los combos del informe original
            const informeSinCombos = informeVentas.filter(item => !item.producto.toUpperCase().includes('COMBO'));
            const resMat = [];//matris para guardar los resultados
            //for para hacer los calculos de cada producto
            for (const data of formData) {
                const obj = { ...data };//copia los datos a un objecto
                //obtiene los datos referentes al producto en informe de ventas
                const infoVentas = informeSinCombos.find(item => item.producto.toUpperCase() === obj.productName.toUpperCase());
                if (infoVentas) {//si se optienen los datos
                    obj.TotalProductos = obj.inventoryInitial + obj.entrada - obj.salida;
                    obj.inventarioFinal = obj.TotalProductos - infoVentas.cantidad;
                    const modeloCombos = new ComboModel();
                    let balanceCombos = 0
                    for (const combo of combos) {
                        const result = await modeloCombos.comboIncludeProduct([obj.productName,combo.producto]);
                        //console.log(result.rows[0][0].Cantidad_Producto)
                        //si el combo si contiene ese producto
                        if (result.rows[0].length >0) {
                            //combo.cantidad = la cantidad de ese combo que se vendio
                            //y rows.cantidad_producto = la cantidad de ese producto que incluye el combo
                            balanceCombos+= (combo.cantidad*result.rows[0][0].Cantidad_Producto)
                        }
                    }
                     //calcula el total del producto 
                     obj.totalIndi = infoVentas.importe * infoVentas.cantidad;
                    totalGen+= obj.totalGen;
                    obj.balanceInventario = data.inventarioReal-obj.inventarioFinal
                    obj.balanceCombos = balanceCombos
                }
                resMat.push(obj);
            }
            
            const modeloCombos = new ComboModel();
            const jsonData = JSON.stringify([resMat]); // Asumiendo que resMat es un objeto o array que quieres convertir a JSON
            const idEmpleado = 1;
            console.log(jsonData)
            modeloCombos.sendInfoVentaJson([jsonData, idEmpleado])
            console.log(resMat)
            // Responder al cliente con un mensaje de confirmación
            return res.json({ status: 'Datos recibidos correctamente.', resMat });
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            return  res.status(500).send({ status: 'Error al obtener los datos' });
        }
    }
}

module.exports = Calcular;

