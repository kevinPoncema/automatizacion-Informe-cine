const path = require('path');
const express = require('express');
const empleadoModel = require("../models/empleadoModel");

class empleadoController {
    async getEmpleado(req, res) {
        try {
            const modelo = new empleadoModel(); // Crear una instancia del modelo
            const data = await modelo.getEmpleado([]);
            res.render("empleado", { empleados: data.rows });

        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }

    async createEmpleado(req, res) {
        try {
            const {nombre_empleado} = req.body;
            const modelo = new empleadoModel(); // Crear una instancia del modelo
            const data = await modelo.createEmpleado([nombre_empleado]);
            res.redirect("/getEmpleado")
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }

    async deletedEmpleado (req, res) {
        try {
            const modelo = new empleadoModel(); // Crear una instancia del modelo
            const data = await modelo.deletedEmpleado([req.params.idProduct]);
            res.redirect("/getEmpleado")
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }
    static async getEmpleadoForMainSelect(req, res) {
        try {
            const modelo = new empleadoModel(); // Crear una instancia del modelo
            const data = await modelo.getEmpleado([]);
            res.render("index", { empleados: data.rows });

        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error al obtener los datos');
        }
    }
}



module.exports = empleadoController;