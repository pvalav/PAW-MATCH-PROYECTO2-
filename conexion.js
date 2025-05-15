const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();

// Configuración EJS y archivos estáticos
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// Conexión a MySQL (XAMPP)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // tu contraseña de XAMPP, normalmente vacía
  database: 'pawmatch'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Conectado a la base de datos MySQL');
});

// Ruta GET para mostrar el formulario
app.get('/registro', (req, res) => {
  res.render('registro');
});

// Ruta POST para guardar los datos
app.post('/registro', async (req, res) => {
  const { telefono, nombre, correo, localidad, contrasena } = req.body;

  try {
    const hash = await bcrypt.hash(contrasena, 10);

    const sql = 'INSERT INTO usuarios (telefono, nombre, correo, localidad, contrasena) VALUES (?, ?, ?, ?, ?)';
    const valores = [telefono, nombre, correo, localidad, hash];

    db.query(sql, valores, (err, resultado) => {
      if (err) {
        console.error(err);
        return res.send('Error al registrar');
      }
      res.send('Usuario registrado con éxito');
    });

  } catch (error) {
    console.error(error);
    res.send('Error en la contraseña');
  }
});

// Puerto del servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});