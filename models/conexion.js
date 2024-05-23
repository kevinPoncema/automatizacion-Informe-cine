require('dotenv').config({ path: '../' });
const mysql = require('mysql2/promise');

class Conexion {
    constructor() {
        // Obtiene los datos de conexión del env
        this.dbConfig = {
            host:"localhost",
            user:"root",
            password: "1234",
            database: "inbentariiocine"
        };

        // Verifica que las variables de entorno estén presentes
        if (!this.dbConfig.host || !this.dbConfig.user || !this.dbConfig.password || !this.dbConfig.database) {
            //console.log(this.dbConfig)
            throw new Error('Faltan variables de entorno necesarias para la conexión a la base de datos');
        }

        // Crea la propiedad connection como null
        this.connection = null;
    }

    // Se conecta a la base de datos
    async conectar() {
        try {
            this.connection = await mysql.createConnection(this.dbConfig);
            //onsole.log('Conexión exitosa a la base de datos');
        } catch (error) {
            console.error('Error al conectar a la base de datos:', error);
            throw error;
        }
    }

    // Se desconecta de la base de datos
    async desconectar() {
        try {
            if (this.connection) {
                await this.connection.end();
                //console.log('Conexión cerrada correctamente');
            }
        } catch (error) {
            console.error('Error al cerrar la conexión:', error);
            throw error;
        }
    }

    // Hace una consulta con parámetros
    async queryParams(sql, params = []) {
        try {
            // Ejecuta la consulta con parámetros
            const [rows, fields] = await this.connection.execute(sql, params);
            const affectedRows = rows.affectedRows;
            return { rows: rows, affectedRows: affectedRows, fields: fields }; // Devuelve los resultados
        } catch (error) {
            console.error('Error al ejecutar la consulta:', error);
            throw error;
        }
    }

    // Hace consultas que solo modifican filas, no obtiene ningún dato
    async queryModifay(sql, params = []) {
        try {
            const [result] = await this.connection.execute(sql, params);
            return result.affectedRows;
        } catch (error) {
            console.error('Error al ejecutar la consulta:', error);
            throw error;
        }
    }
}

module.exports = Conexion;
