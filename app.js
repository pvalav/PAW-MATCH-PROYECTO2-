const express = require("express");
const mysql=require("mysql2");
const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'pawmatch'
});
db.connect(err => {
  if (err) {
    console.error('Error de conexión:', err);
    return;
  }
  console.log('Conectado a MySQL');
});

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("inicio", { titulo: "inicio" });
});
app.get("/ayuda",(req,res)=>{
  res.render("ayuda",{titulo:"ayuda"});
});
app.get("/registro1",(req,res)=>{
  res.render("registro1",{titulo:"registro"});
});


app.listen(9999, () => {
  console.log("Servidor corriendo en http://localhost:9999");
});