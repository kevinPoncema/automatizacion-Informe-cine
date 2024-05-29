const ConexionClass = require("./conexion");
class empleadoModel {
    async getEmpleado(params) {
        const conexion = new ConexionClass();
        await conexion.conectar(params);
        const data = await conexion.queryParams("SELECT * FROM empleados",params);
        await conexion.desconectar();
        return data;
    }

    async createEmpleado(params) {
        const conexion = new ConexionClass();
        await conexion.conectar(params);
        const data = await conexion.queryModifay("INSERT INTO empleados(nombre_empleado) VALUES (?)",params);
        await conexion.desconectar();
        return data;
    }

    async deletedEmpleado(params) {
        const conexion = new ConexionClass();
        await conexion.conectar(params);
        const data = await conexion.queryModifay("DELETE FROM empleados WHERE id_empleado = ?",params);
        await conexion.desconectar();
        return data;
    }
}

module.exports = empleadoModel;