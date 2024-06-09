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

    async getAllProductForCombo(params) {
        const conexion = new ConexionClass();
        await conexion.conectar();
        
        const sql = `SELECT can_pro, productos.nombre_prod, productos.id_prod FROM detallet_combo 
        INNER JOIN productos ON productos.id_prod = detallet_combo.id_pro
        WHERE detallet_combo.id_combo = ?`;
        const data = await conexion.queryParams(sql, params);
        
        const comboSql = "SELECT combo.nombre_combo FROM combo WHERE combo.combo_id = ?";
        const data2 = await conexion.queryParams(comboSql, params);
        
        // Asumiendo que data2.rows siempre tiene al menos un elemento
        const comboName = data2.rows.length > 0 ? data2.rows[0].nombre_combo : null;
        
        await conexion.desconectar();
        
        return { data: data, combo: comboName };
    }
    

    async updateCombo(params) {
        const conexion = new ConexionClass();
        try {
            await conexion.conectar();
            const data = await conexion.queryModifay("INSERT INTO detallet_combo (id_combo,id_pro,can_pro) VALUES(?,?,?)", params);
            await conexion.desconectar();
            return data;
        } catch (error) {
            console.error('Error en la actualización del combo:', error);
            throw error; // Re-lanzar el error para que el controlador lo maneje
        }
    }

    async limpiarDetalleCombo(params) {
        const conexion = new ConexionClass();
        try {
            await conexion.conectar();
            const data = await conexion.queryModifay("DELETE FROM detallet_combo WHERE detallet_combo.id_combo = ?", params);
            await conexion.desconectar();
            return data;
        } catch (error) {
            console.error('Error en la actualización del combo:', error);
            throw error; // Re-lanzar el error para que el controlador lo maneje
        }
    } 
    

    static async esCombo (params) {
        const conexion = new ConexionClass();
        await conexion.conectar();
        const sql = `CALL esCombo(?)`;
        const data = await conexion.queryParams(sql,params);
        if(data.rows[0].length >0 ) {return  {estatus:true,data:data.rows}}
        await conexion.desconectar();
        return {estatus:false,data:data.rows};
    }


}

module.exports = ComboModel;
