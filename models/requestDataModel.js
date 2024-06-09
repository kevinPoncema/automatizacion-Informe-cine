const ConexionClass = require("./conexion");

class requestDataModel {
    async getIncialData(params) {
        const conexion = new ConexionClass();
        await conexion.conectar(params);
        const data = await conexion.queryParams('SELECT productos.nombre_prod AS `pro` FROM productos WHERE productos.categoria = "n" OR productos.categoria =  ?', params);
        await conexion.desconectar(); // Cerrar la conexión después de usarla
        return data;
    }

    async getFinalInventoryOfPreviousDay(employeeId) {
        const conexion = new ConexionClass();
        await conexion.conectar();
        
        const query = `
        SELECT 
        JSON_UNQUOTE(json_body_historial) AS invFinal
    FROM 
        historia_informes
    WHERE 
        id_empleados = ?
        AND DATE(fecha_reg) = CURDATE() - INTERVAL 1 DAY;    
        `;

        const data = await conexion.queryParams(query, [employeeId]);
        await conexion.desconectar();
        return data;
    }
}

module.exports = requestDataModel;