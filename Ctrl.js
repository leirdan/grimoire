/** MÓDULOS */
const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const app = express();
const adminRoutes = require("./routes/admin_routes");
const studentRoutes = require("./routes/student_routes");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash"); // npm install connect-flash; tipo de sessão que ocorre em curto tempo; a cada carregamento, some
const passport = require("passport"); // npm install --save passport && npm install --save passport-local
require("./config/auth")(passport); //passamos de cara a const passport para a função contida em auth

/** CONFIGURAÇÕES */
app.use(
	session({
		secret: process.env.DB_SECRET,
		resave: true,
		saveUninitialized: true,
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// middleware
app.use((req, res, next) => {
	res.locals.success_msg = req.flash("success_msg"); // variável global
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	res.locals.user = req.user || null; // variável global que guarda os dados do usuario autenticado
	next();
});

app.engine("handlebars", handlebars.engine({ defaultLayout: "html" }));
app.set("view engine", "handlebars");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// caminho do diretório de arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

mongoose
	.connect("mongodb://localhost:27017/grimoire", { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log("Conectado com sucesso ao Mongo...");
	})
	.catch((err) => {
		console.log("Algo deu errado: " + err);
	});

/** ROTAS */
app.use("/admin", adminRoutes); // admin é o prefixo, depois vem as rotas
app.use("/student", studentRoutes);

app.listen(8081, () => {
	console.log("Servidor em funcionamento!");
});
