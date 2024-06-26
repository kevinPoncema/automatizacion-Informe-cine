const path = require('path');
const ComboModel = require("../models/comboModel");
const { json } = require('body-parser');
const fileController = require("../controllers/fileControler");
const productModel = require("../models/productModel");
class Calcular {
    constructor() {
        this.totalGen = 0;
    }
    //funcion principal que se encaega de manejar los datos 
    async hacerCalculos(req, res, informeVentas, pdfCompleto) {
        try {
            const formData = req.body;
            //si no se importo el txt redirje al root
            if (!informeVentas) {
                res.redirect("/");
                return;
            }
            //variables principales
            this.totalGen = 0;
            const combos = [];
            const informeSinCombos = [];
            //obtiene la lista de combos y una lista de los productos que no son combos
            await this.filtrarCombos(informeVentas, combos, informeSinCombos);
            //comienza con los calculos
            const resMat = [];//matris de resultados
            for (const data of formData) {
                const obj = { ...data };//copia los datos al objecto
                const infoVentas = informeSinCombos.find(item => // busca la referencia al producto en el txt
                    item.producto.replace(/#/g, '').toUpperCase() === obj.productName.replace(/#/g, '').toUpperCase()
                );

                if (infoVentas) {//si se encontro 
                    await this.calcularProducto(obj, combos, infoVentas);
                } else {//consuge los datos desde la base de datos
                    await this.calcularProductoSinVentas(obj, combos);
                }

                resMat.push(obj);
            }
            //hace el calculo de loa combos
            combos.forEach((combo) => {
                combo.totalIndi = combo.importe * combo.cantidad;
                this.totalGen += Number(combo.totalIndi);
            });
            //hace una copia de los datos en la base de datos
            const modeloCombos = new ComboModel();
            const jsonData = JSON.stringify([resMat]); 
            const idEmpleado =  pdfCompleto.cajeroId
            await modeloCombos.sendInfoVentaJson([jsonData, idEmpleado]);
            //genera el pdf
            await fileController.genPdf(resMat, pdfCompleto, combos, this.totalGen);
            console.log(resMat);
            //respuesta del usuario
            return res.json({ status: 'Datos recibidos correctamente.', resMat, urlPdf: "http://localhost:3000/getPdf" });
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            return res.status(500).send({ status: 'Error al obtener los datos' });
        }
    }
    //separa los combos de los productos comunes
    async filtrarCombos(informeVentas, combos, informeSinCombos) {
        for (const item of informeVentas) {
            const res = await ComboModel.esCombo([item.producto]);
            if (res.estatus) {
                combos.push(item);
            } else {
                informeSinCombos.push(item);
            }
        }
    }
    //hace los calculos si se encuentra el producto en el txt
    async calcularProducto(obj, combos, infoVentas) {
        obj.TotalProductos = (obj.inventoryInitial + obj.entrada) - obj.salida;
        obj.inventarioFinal = obj.TotalProductos - infoVentas.cantidad;
        const modeloCombos = new ComboModel();
        let balanceCombos = 0;
        for (const combo of combos) {
            const result = await modeloCombos.comboIncludeProduct([obj.productName,combo.producto]);
            if (result.rows[0].length >0) {
                balanceCombos += (combo.cantidad * result.rows[0][0].Cantidad_Producto);
            }
        }
        obj.precio = infoVentas.importe;
        obj.venta = infoVentas.cantidad;
        obj.balanceCombos = balanceCombos;
        obj.venta += balanceCombos;
        obj.balanceInventario = obj.inventarioReal - obj.inventarioFinal;
        obj.totalIndi = obj.venta * obj.precio;
        this.totalGen += obj.totalIndi;
        obj.sobrante = 0;
        obj.faltante = 0;
        if (obj.balanceInventario > 0) {
            obj.sobrante = obj.balanceInventario;
        } else {
            obj.faltante = obj.balanceInventario;
        }
    }
    //si no hay referencia  en el txt solo hace el balance de combos
    async calcularProductoSinVentas(obj, combos) {
        const modeloCombos = new ComboModel();
        let balanceCombos = 0;
        for (const combo of combos) {
            const result = await modeloCombos.comboIncludeProduct([obj.productName,combo.producto]);
            if (result.rows[0].length >0) {
                balanceCombos += (combo.cantidad * result.rows[0][0].Cantidad_Producto);
            }
        }
        obj.venta = balanceCombos;
        proDataDb = await productModel.getProductPrice([obj.productName])
        obj.precio = proDataDb.precio_prod; 
        obj.totalIndi = obj.precio*obj.venta;
        obj.balanceInventario = obj.inventarioReal - obj.inventarioFinal;
        this.totalGen += obj.totalIndi;
        obj.sobrante = 0;
        obj.faltante = 0;
        if (obj.balanceInventario > 0) {
            obj.sobrante = obj.balanceInventario;
        } else {
            obj.faltante = obj.balanceInventario;
        }
    }
}

module.exports = Calcular;