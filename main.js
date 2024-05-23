const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Importa el módulo 'path' para trabajar con rutas de archivos
const app = express();
// Controladores
const fileController = require("./controllers/fileControler");
const LoadRequestData = require('./controllers/loadRequestData');
const CalculatorController = require("./controllers/calControler"); // Corrección del nombre de la clase y la importación
// Configuraciones
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());

// Ruta para mostrar el formulario
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

var informeVentas  = null;
// Ruta para manejar el envío de datos al servidor
app.post('/readFiles', async (req, res) => {
    const txt = req.body.txt;
    try {
        informeVentas = await fileController.parseTextFile(txt); // Llamar al controlador para parsear el texto
        res.send({msg:"ok",url:"http://localhost:3000/llenarDatos"})
        // Enviar una respuesta al cliente
    } catch (error) {
        console.error('Error al parsear el texto:', error);
        res.status(500).json({ error: 'Error al parsear el texto.' });
    }
});

app.get("/llenarDatos",(req,res)=>{
    if (informeVentas== null) {
        res.redirect("/")
    }
    const dataControl = new LoadRequestData(); // Corrección: se añade el new para crear una instancia de LoadRequestData
    dataControl.getIntData(req,res);
});

const calControl = new CalculatorController(); // Corrección: se añade el new para crear una instancia de CalculatorController
app.post("/datosXCalculo", (req, res) => { calControl.hacerCalculos(req,res,informeVentas); });

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}
    http://localhost:${PORT}/`);
});
