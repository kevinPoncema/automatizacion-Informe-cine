//dependecias nsesarias
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Importa el módulo 'path' para trabajar con rutas de archivos
const app = express();
const { exec } = require('child_process');
// Controladores
const fileController = require("./controllers/fileControler");
const LoadRequestData = require('./controllers/loadRequestData');
const CalculatorController = require("./controllers/calControler"); 
const productController = require("./controllers/productController")
const empleadoController = require("./controllers/empleadoController")
const comboController = require("./controllers/comboController")
// Configuraciones de ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//configura body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ruta para mostrar el formulario
app.get('/', empleadoController.getEmpleadoForMainSelect)

var informeVentas  = null;
let pdfCompleto = {}
// Ruta para leer el txt
app.post('/readFiles', async (req, res) => {
    const txt = req.body.txt;
    try {
        informeVentas = await fileController.parseTextFile(txt); // Llamar al controlador para parsear el texto
        const [nombre, id] = req.body.empleado.split(',');
        pdfCompleto.cajero =   nombre ;
        pdfCompleto.cajeroId = id;

        return res.send({msg:"ok",url:"http://localhost:3000/llenarDatos"})
        
        // Enviar una respuesta al cliente
    } catch (error) {
        console.error('Error al parsear el texto:', error);
        return res.status(500).json({ error: 'Error al parsear el texto.' });
    }
});
//ruta para pedir los datos nsesarios para el informe final
app.get("/llenarDatos",(req,res)=>{
    if (informeVentas== null) {
        res.redirect("/")
    }
    const dataControl = new LoadRequestData();
    dataControl.getIntData(req,res,pdfCompleto);
});
//ruta para hacer los calculos matematicos
const calControl = new CalculatorController(); // Corrección: se añade el new para crear una instancia de CalculatorController
app.post("/datosXCalculo", (req, res) => { calControl.hacerCalculos(req,res,informeVentas,pdfCompleto); });
//ruta del pdf 
app.get("/getPdf",(req,res)=>{
    console.log(pdfCompleto.filePath)
    res.sendFile(pdfCompleto.filePath, (err) => {
        if (err) {
            console.error('Error al enviar el archivo PDF:', err);
            res.status(err.status).end();
        } else {
            console.log('Archivo PDF enviado correctamente');
        }
    });
})

//ruta para gestionar productos
const productControl = new productController()
app.get("/getProducts", productControl.getProduct);
app.post("/createProduct",productControl.createProduct)
app.post("/deleteProduct/:idProduct", (req, res) => {
    productControl.deletedProduct(req, res);
});
const empleadoControl = new empleadoController()
app.get("/getEmpleado", empleadoControl.getEmpleado);
app.post("/deleteEmployee/:idProduct", empleadoControl.deletedEmpleado);
app.post("/createEmployee",empleadoControl.createEmpleado)
//entpoints de los combos
const comboControl = new comboController()
app.get("/getCombo", comboControl.getcombo);
app.post("/deleteCombo/:idCombo", comboControl.deletedCombo);
app.post("/createCombo",comboControl.createCombo)
app.get("/editCombo/:idCombo", comboControl.getEditcomboView);
app.post('/updateCombo/:idCombo', comboControl.updateCombo);

//entpoint para hoja inventario 

app.get("/invesheet/:idEmp/:nomEmp", async(req, res) => {
    const idEmp = req.params.idEmp;
    const nomEmp = req.params.nomEmp;
    let invesheet  = await fileController.genInveSheet(idEmp,nomEmp); 
    if (invesheet != null) {
        res.sendFile(invesheet, (err) => {
            if (err) {
                console.error('Error al enviar el archivo PDF:', err);
                res.status(err.status).end();
            } else {
                console.log('Archivo PDF enviado correctamente');
            }
        });
    }
 
    
});
// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}
    http://localhost:${PORT}/`);

     // Ejecutar comando para abrir el navegador predeterminado
     exec(`start http://localhost:${PORT}`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout);
    });
});
