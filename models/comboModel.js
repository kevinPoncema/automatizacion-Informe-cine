const ConexionClass = require("./conexion");

class ComboModel {
    async comboIncludeProduct(params) {
        const conexion = new ConexionClass();
        await conexion.conectar(params);
        const [comboName, productName] = params;
        const data = await conexion.queryParams("CALL validarProductoYCombo(?,?)", [comboName, productName]);
        await conexion.desconectar();
        return data;
    }

    //sube a la base de datos el informe de venta 
    async sendInfoVentaJson(params) {
        const conexion = new ConexionClass();
        try {
            await conexion.conectar();
            const query = "INSERT INTO historia_informes (json_body_historial, id_empleados) VALUES (?, ?)";
            const data = await conexion.queryParams(query, params);
            return data;
        } catch (error) {
            console.error("Error al ejecutar la consulta:", error);
            throw error;
        } finally {
            await conexion.desconectar();
        }
    }

    async getCombos(params) {
        const conexion = new ConexionClass();
        await conexion.conectar(params);
        const data = await conexion.queryParams("SELECT * FROM combo ", []);
        await conexion.desconectar();
        return data;
    }

    async deletedCombo(params) {
        const conexion = new ConexionClass();
        await conexion.conectar(params);
        const data = await conexion.queryModifay("DELETE FROM combo WHERE combo_id = ?",params);
        await conexion.desconectar();
        return data;
    }

    async createCombo(params) {
        const conexion = new ConexionClass();
        await conexion.conectar();
        const { nombre_combo, categoria_combo }  = params
        const data = await conexion.queryModifay("INSERT INTO combo (nombre_combo,categoria_combo) VALUES (?,?)",params);
        await conexion.desconectar();
        return data;
    }

}

module.exports = ComboModel;
