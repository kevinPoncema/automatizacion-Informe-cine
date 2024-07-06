const path = require('path');
const express = require('express');

const productModel = require("../models/productModel");
class productController {
    async getProduct(req, res) {
        try {
            const modelo = new productModel(); // Crear una instancia del modelo
            const data = await modelo.getProducts([]);
            res.render("productos", { productos: data.rows });

        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }

    async createProduct(req, res) {
        try {
            const { nombre_prod, categoria,precio_prod } = req.body;
            const modelo = new productModel(); // Crear una instancia del modelo
            const data = await modelo.createProducts([nombre_prod,categoria,precio_prod]);
            res.redirect("/getProducts")
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }

    async deletedProduct (req, res) {
        try {
            const modelo = new productModel(); // Crear una instancia del modelo
            const data = await modelo.deletedProducts([req.params.idProduct]);
            res.redirect("/getProducts")
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }
}

module.exports = productController;