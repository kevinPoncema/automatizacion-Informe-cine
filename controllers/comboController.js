const path = require('path');
const express = require('express');
const comboModel = require("../models/comboModel");
const productModel = require("../models/productModel");
class comboController {
    async getcombo(req, res) {
        try {
            const modelo = new comboModel(); // Crear una instancia del modelo
            const data = await modelo.getCombos([]);
            res.render("comboMain", { combos: data.rows });
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }

    async createCombo(req, res) {
        try {
            const { nombre_combo, categoria_combo } = req.body;
            console.log(nombre_combo, categoria_combo)
            const modelo = new comboModel(); // Crear una instancia del modelo
            await modelo.createCombo([nombre_combo,categoria_combo]);
            res.redirect("/getCombo")
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }

    async deletedCombo (req, res) {
        try {
            const modelo = new comboModel(); // Crear una instancia del modelo
            const data = await modelo.deletedCombo([req.params.idCombo]);
            res.redirect("/getCombo")
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }

    async getEditcomboView(req, res) {
        try {
            const modelo = new comboModel(); // Crear una instancia del modelo
            const modeloProductos = new productModel();
            const dataMax = await modelo.getAllProductForCombo([req.params.idCombo]);
            const allProduct = await modeloProductos.getProducts([]);
            const data = dataMax.data;
            const name = dataMax.combo;
    
            res.render("editUi", { 
                productos: data.rows, 
                productosSelector: allProduct.rows, 
                comboId: req.params.idCombo,
                comboName: name // Pasar el nombre del combo
            });
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }
    
    

    async updateCombo(req, res) {
        try {
            const { productos } = req.body;
            const idCombo = req.params.idCombo;
            const modelo = new comboModel(); // Crear una instancia del modelo
            //elimina los dettales del combo 
            await  modelo.limpiarDetalleCombo([idCombo])
            // Lógica para actualizar los combos en la base de datos
            for (const producto of productos) {
                await modelo.updateCombo([idCombo, producto.id_prod, producto.can_pro]);
            }
            res.json({ success: true });
        } catch (error) {
            console.error('Error al actualizar los datos:', error);
            res.status(500).json({ success: false });
        }
    }
    
    
}

module.exports = comboController;