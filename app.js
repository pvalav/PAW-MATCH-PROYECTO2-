const express = require("express");
const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("inicio", { titulo: "inicio" });
});
app.get("/registro1",(req,res)=>{
    res.render("registro1",{titulo:"registro"});
})

app.listen(9999, () => {
  console.log("Servidor corriendo en http://localhost:9999");
});