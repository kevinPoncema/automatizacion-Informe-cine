const ComboModel = require("../models/comboModel");;
async function test() {
    const modeloCombos = new ComboModel();
    const result = await modeloCombos.comboIncludeProduct(["VASO 22 ONZ", "combo1"]);
    // Acceder a Cantidad_Producto
    const cantidadProducto = result.rows[0][0].Cantidad_Producto;
    console.log(cantidadProducto); // Debería imprimir: 1

}
console.log("hhahshs")
test()