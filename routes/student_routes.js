const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Students");
const StudentSchema = mongoose.model("students");
require("../models/Spell");
const SpellSchema = mongoose.model("spell");
const bCrypt = require("bcryptjs"); // npm install --save bcryptjs
const passport = require("passport");

router.get("/login", (req, res) => {
	res.render("student/login");
});
// rota de formulário de registro de estudante
router.get("/register", (req, res) => {
	SpellSchema.find()
		.lean()
		.then((spells) => {
			res.render("student/register", { spell: spells });
		})
		.catch((err) => {
			req.flash("error_msg", `Houve um erro..: ${err}`);
		});
});
// rota de cadastrar um novo estudante
router.post("/register/success", (req, res) => {
	let errors = [];
	if (req.body.name == undefined || req.body.name.length <= 0 || req.body.name == "") {
		errors.push({ text: "Nome inválido!" });
	}
	if (req.body.email == undefined || req.body.email.length <= 0 || req.body.email == "") {
		errors.push({ text: "E-mail inválido!" });
	}
	if (req.body.passwd == undefined || req.body.passwd.length <= 6 || req.body.passwd == "") {
		errors.push({ text: "Senha inválida!" });
	}
	if (req.body.passwd != req.body.passwd2) {
		errors.push({ text: "As senhas não batem!" });
	}

	if (errors.length > 0) {
		res.render("student/register", { errs: errors });
	} else {
		// procurando estudante pelo email
		StudentSchema.findOne({ email: req.body.email })
			.then((student) => {
				if (student) {
					req.flash("error_msg", "Já existe um estudante com este e-mail.");
					res.redirect("/student/register");
				} else {
					const newStudent = new StudentSchema({
						name: req.body.name,
						age: req.body.age,
						personality: req.body.personalities,
						gender: req.body.gender,
						email: req.body.email,
						passwd: req.body.passwd,
					});
					bCrypt.genSalt(10, (err, salt) => {
						// 3 parametros: o valor a ser hasheado, o salt e a funçao de callback
						bCrypt.hash(newStudent.passwd, salt, (err, hash) => {
							if (err) {
								req.flash("error_msg", `Houve um erro no cadastro..: ${err}`);
								res.redirect("/student/register");
							} else {
								newStudent.passwd = hash; // hash é o valor passado na funcao de callback
								newStudent
									.save()
									.then(() => {
										req.flash("success_msg", "Estudante cadastrado.");
										res.redirect("/student/register");
									})
									.catch((err) => {
										req.flash("error_msg", `Não foi possível realizar a operação..: ${err}`);
										res.redirect("/student/register");
									});
							}
						});
					});
				}
			})
			.catch((err) => {
				req.flash("error_msg", `Aconteceu algo...: ${err}`);
				res.redirect("/student/register");
			});
	}
});
router.post("/login", (req, res, next) => {
	passport.authenticate("local", {
		successRedirect: "/admin/",
		failureRedirect: "/student/login",
		failureFlash: true,
	})(req, res, next);
});
router.get("/logout", (req, res, next) => {
	req.logout();
	res.redirect("/admin");
});

module.exports = router;
