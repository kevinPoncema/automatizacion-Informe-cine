const path = require('path');
const ComboModel = require("../models/comboModel");
const { json } = require('body-parser');
const fileController = require("../controllers/fileControler");
class Calcular {
    async hacerCalculos(req, res, informeVentas,pdfCompleto) {
        try {
            const formData = req.body; // Obtener los datos enviados en el cuerpo de la solicitud
            //si no hay informe de ventas
            if (!informeVentas) {
                res.redirect("/");
                return;
            }
            
            let totalGen = 0;
        // Filtrar los combos
            const combos = [];
            const informeSinCombos = [];
        // Obtener los combos del informe de ventas
        for (const item of informeVentas) {
            const res = await ComboModel.esCombo([item.producto]);
            if (res.estatus) {
                combos.push(item);
            } else {
                informeSinCombos.push(item);
            }
        }
            const resMat = [];//matris para guardar los resultados          
            //for para hacer los calculos de cada producto
            for (const data of formData) {
                const obj = { ...data };//copia los datos a un objecto
                    // Obtén el resultado más similar (si existe)
                    const infoVentas = informeSinCombos.find(item => 
                        item.producto.replace(/#/g, '').toUpperCase() === obj.productName.replace(/#/g, '').toUpperCase()
                    );
                if (infoVentas) {//si se optienen los datos
                    obj.TotalProductos = (obj.inventoryInitial + obj.entrada) - obj.salida;
                    obj.inventarioFinal = obj.TotalProductos - infoVentas.cantidad;
                    const modeloCombos = new ComboModel();
                    let balanceCombos = 0
                    for (const combo of combos) {
                        const result = await modeloCombos.comboIncludeProduct([obj.productName,combo.producto]);
                        //si el combo si contiene ese producto
                        if (result.rows[0].length >0) {
                            balanceCombos+= (combo.cantidad*result.rows[0][0].Cantidad_Producto)
                        }
                    }
                     //calcula el total del producto 
                    obj.precio = infoVentas.importe
                    obj.venta = infoVentas.cantidad;
                    obj.balanceCombos = balanceCombos
                    obj.venta+= balanceCombos
                    obj.balanceInventario = obj.inventarioReal-(obj.inventarioFinal)
                    obj.totalIndi = obj.venta * obj.precio;
                    totalGen+= obj.totalIndi;
                    obj.sobrante =0;
                    obj.faltante = 0;
                    //logica del sobrante y faltante
                    if (obj.balanceInventario >0) {
                        obj.sobrante = obj.balanceInventario
                    }else{
                        obj.faltante = obj.balanceInventario
                    }
                }//fin del el if informeVentas
                resMat.push(obj);
            }//fin for productos
            //agrega los datos de los combos a la matris
            combos.forEach((combo) => {
                combo.totalIndi = combo.importe * combo.cantidad;
                totalGen += Number(combo.totalIndi);
            });


            //guarda los resultados en la db
            const modeloCombos = new ComboModel();
            const jsonData = JSON.stringify([resMat]); 
            const idEmpleado =  pdfCompleto.cajeroId
            modeloCombos.sendInfoVentaJson([jsonData, idEmpleado])
            
            //genera el pdf
            await fileController.genPdf(resMat,pdfCompleto,combos,totalGen)
            console.log(resMat)
            // Responder al cliente con un mensaje de confirmación
            
            return res.json({ status: 'Datos recibidos correctamente.', resMat,urlPdf:"http://localhost:3000/getPdf" });
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            return  res.status(500).send({ status: 'Error al obtener los datos'});
        }
    }
}

module.exports = Calcular;