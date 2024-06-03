const ConexionClass = require("./conexion");
class requestDataModel{
    async  getIncialData (params){
        const conexion = new ConexionClass();
        await conexion.conectar(params);
        const data = await conexion.queryParams("SELECT productos.nombre_prod AS `pro` FROM productos LIMIT 5", params);

        await conexion.desconectar(); // Cerrar la conexión después de usarla
        return  data;
    }
}

module.exports = requestDataModel;