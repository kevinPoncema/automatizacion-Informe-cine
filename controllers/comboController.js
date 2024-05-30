const path = require('path');
const express = require('express');
const comboModel = require("../models/comboModel");

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
}

module.exports = comboController;