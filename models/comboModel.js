const ConexionClass = require("./conexion");

class ComboModel {
    async comboIncludeProduct(params) {
        const conexion = new ConexionClass();
        await conexion.conectar(params);
        const [comboName, productName] = params;
        const data = await conexion.queryParams("CALL validarProductoYCombo(?,?)", [comboName, productName]);
        await conexion.desconectar();
        //console.log("test",data.rows)
        return data;
    }
}

module.exports = ComboModel;
