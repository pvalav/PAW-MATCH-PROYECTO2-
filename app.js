const express = require("express");
const mysql = require("mysql2");
const path=require("path");
const bodyParser = require("body-parser");
const app = express();

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "pawmatch",
  port: 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log("Pool de conexión MySQL configurado");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

// --- Páginas básicas ---
app.get("/", (req, res) => {
  res.render("inicio", { titulo: "Inicio" });
});

app.get("/ayuda", (req, res) => {
  res.render("ayuda", { titulo: "Ayuda" });
});

app.get("/registro1", (req, res) => {
  res.render("registro1", { titulo: "Registro Usuario" });
});

app.get("/registro2", (req, res) => {
  res.render("registro2", { titulo: "Registro Mascota" });
});

app.get("/iniciar", (req, res) => {
  res.render("iniciar", { titulo: "Iniciar Sesión" });
});

// --- CRUD USUARIOS ---

// Guardar usuario (Create)
app.post("/registro1", (req, res) => {
  console.log(req.body);
  const { numerotel, nombre, correo, localidad, contra } = req.body;

  // Verificar si el correo o el número ya existen
  const verificarSql = "SELECT * FROM usuarios WHERE correo = ? OR numerotel = ?";
  db.query(verificarSql, [correo, numerotel], (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Error al verificar usuario");
    }

    if (results.length > 0) {
      return res.send("El correo o número de teléfono ya están registrados");
    }

    // Si no existe, insertar nuevo usuario
    const sql = "INSERT INTO usuarios (numerotel, nombre, correo, localidad, contra) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [numerotel, nombre, correo, localidad, contra], (err, result) => {
      if (err) {
        console.error(err);
        return res.send("Error al registrar usuario");
      }

      res.redirect("/registro2"); // redirige a la página de registro de mascotas
    });
  });
});

// Listar usuarios (Read)
app.get("/usuarios", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Error al obtener usuarios");
    }
    res.render("usuarios", { usuarios: results, titulo: "Lista de Usuarios" });
  });
});

// Formulario editar usuario (Read one)
app.get("/usuarios/editar/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM usuarios WHERE id = ?", [id], (err, results) => {
    if (err) return res.send("Error al obtener usuario");
    if (results.length === 0) return res.send("Usuario no encontrado");
    res.render("editarUsuario", { usuario: results[0], titulo: "Editar Usuario" });
  });
});

// Actualizar usuario (Update)
app.post("/usuarios/editar/:id", (req, res) => {
  const { id } = req.params;
  const { numerotel, nombre, correo, localidad, contra } = req.body;

  const sql = "UPDATE usuarios SET numerotel = ?, nombre = ?, correo = ?, localidad = ?, contra = ? WHERE id = ?";
  db.query(sql, [numerotel, nombre, correo, localidad, contra, id], (err, result) => {
    if (err) return res.send("Error al actualizar usuario");
    res.redirect("/usuarios");
  });
});

// Eliminar usuario (Delete)
app.get("/usuarios/eliminar/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM usuarios WHERE id = ?", [id], (err, result) => {
    if (err) return res.send("Error al eliminar usuario");
    res.redirect("/usuarios");
  });
});

// --- CRUD MASCOTAS ---

// Guardar mascota (Create)
app.post("/registro2", (req, res) => {
  console.log(req.body);
  const { nombre, edad, tiempoEdad, sexo, caracteristicas, fecha } = req.body;

  const sql = "INSERT INTO mascotas (nombre, edad, tiempoEdad, sexo, caracteristicas, fecha) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [nombre, edad, tiempoEdad, sexo, caracteristicas, fecha], (err, result) => {
    if (err) return res.send("Error al registrar mascota");

    

    res.redirect("/extraviados");
  });
});

// Listar mascotas (Read)
app.get("/mascotas", (req, res) => {
  db.query("SELECT * FROM mascotas", (err, results) => {
    if (err) return res.send("Error al obtener mascotas");
    res.render("mascotas", { mascotas: results, titulo: "Lista de Mascotas" });
  });
});

// Formulario editar mascota (Read one)
app.get("/mascotas/editar/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM mascotas WHERE id = ?", [id], (err, results) => {
    if (err) return res.send("Error al obtener mascota");
    if (results.length === 0) return res.send("Mascota no encontrada");
    res.render("editarMascota", { mascota: results[0], titulo: "Editar Mascota" });
  });
});

// Actualizar mascota (Update)
app.post("/mascotas/editar/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, edad, tiempoEdad, sexo, caracteristicas, fecha } = req.body;

  const sql = "UPDATE mascotas SET nombre = ?, edad = ?, tiempoEdad = ?, sexo = ?, caracteristicas = ?, fecha = ? WHERE id = ?";
  db.query(sql, [nombre, edad, tiempoEdad, sexo, caracteristicas, fecha, id], (err, result) => {
    if (err) return res.send("Error al actualizar mascota");
    res.redirect("/mascotas");
  });
});

// Eliminar mascota (Delete)
app.get("/mascotas/eliminar/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM mascotas WHERE id = ?", [id], (err, result) => {
    if (err) return res.send("Error al eliminar mascota");
    res.redirect("/mascotas");
  });
});

// --- Iniciar sesión (simplificado, solo mostrar formulario por ahora) ---
app.post("/iniciar", (req, res) => {
  const { correo, contra } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE correo = ? AND contra = ?",
    [correo, contra],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.render("iniciar", { titulo: "Iniciar Sesión", error: "Error en el servidor." });
      }

      if (results.length === 0) {
        return res.render("iniciar", { titulo: "Iniciar Sesión", error: "Correo o contraseña incorrectos." });
      }

      // Si todo va bien, redirige al registro de mascotas
      res.redirect("/registro2");
    }
  );
});
app.get("/extraviados", (req, res) => {
  db.query("SELECT * FROM mascotas", (err, results) => {
    if (err) return res.send("Error al obtener mascotas perdidas");
    res.render("extraviados", { mascotas: results, titulo: "Mascotas Perdidas" });
  });
});

app.listen(9999, () => {
  console.log("Servidor corriendo en http://localhost:9999");
});