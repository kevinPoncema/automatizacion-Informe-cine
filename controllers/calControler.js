const path = require('path');
const ComboModel = require("../models/comboModel");
const { json } = require('body-parser');
const fileController = require("../controllers/fileControler");

class Calcular {
    async hacerCalculos(req, res, informeVentas,pdfCompleto) {
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
                    obj.precio = infoVentas.importe
                    obj.venta = infoVentas.cantidad;
                    totalGen+= obj.totalIndi;
                    obj.balanceCombos = balanceCombos
                    obj.balanceInventario = data.inventarioReal-(obj.inventarioFinal+obj.balanceCombos)
                    resMat.push(obj);
                }
            }//fin for productos
            //agrega los datos de los combos a la matris
            combos.forEach((combo) => {
                combo.totalIndi = combo.importe * combo.cantidad;
                totalGen += Number(combo.totalIndi);
            });


            //guarda los resultados en la db
            const modeloCombos = new ComboModel();
            const jsonData = JSON.stringify([resMat]); 
            const idEmpleado = 1;
            modeloCombos.sendInfoVentaJson([jsonData, idEmpleado])
            
            //genera el pdf
            await fileController.genPdf(resMat,pdfCompleto,combos,totalGen)
            // Responder al cliente con un mensaje de confirmación
            return res.json({ status: 'Datos recibidos correctamente.', resMat,urlPdf:"http://localhost:3000/getPdf" });
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            return  res.status(500).send({ status: 'Error al obtener los datos'});
        }
    }
}

module.exports = Calcular;