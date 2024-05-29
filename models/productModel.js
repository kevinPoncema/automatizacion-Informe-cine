const ConexionClass = require("./conexion");
class productModel {
    async getProducts(params) {
        const conexion = new ConexionClass();
        await conexion.conectar(params);
        const data = await conexion.queryParams("SELECT * FROM productos",params);
        await conexion.desconectar();
        return data;
    }

    async createProducts(params) {
        const conexion = new ConexionClass();
        await conexion.conectar(params);
        const data = await conexion.queryModifay("INSERT INTO productos(nombre_prod,categoria) VALUES (?,?)",params);
        await conexion.desconectar();
        return data;
    }

    async deletedProducts(params) {
        const conexion = new ConexionClass();
        await conexion.conectar(params);
        const data = await conexion.queryModifay("DELETE FROM productos WHERE id_prod = ?",params);
        await conexion.desconectar();
        return data;
    }
}

module.exports = productModel;