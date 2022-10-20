const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bCrypt = require("bcryptjs");
require("../models/Students");
const StudentSchema = mongoose.model("students");

module.exports = function (passport) {
	// o email vai ser o campo a ser analisado
	passport.use(
		new localStrategy({ usernameField: "email", passwordField: "passwd" }, (email, passwd, done) => {
			StudentSchema.findOne({ email: email }) // pesquisa no db um email igual ao passado como parametro
				.lean()
				.then((student) => {
					if (!student) {
						// 1º param: dados da conta autenticada; 2º: se a autenticacao foi sucedida; 3º: resultado
						return done(null, false, { message: "Esse estudante não existe" });
					}
					bCrypt.compare(passwd, student.passwd, (err, areTheSame) => {
						if (areTheSame) {
							return done(null, student);
						} else {
							return done(null, false, { message: "Senha incorreta" });
						}
					});
				});
		})
	);
	//salvar dados do usuário numa sessão
	passport.serializeUser((student, done) => {
		done(null, student._id);
	});
	passport.deserializeUser((id, done) => {
		StudentSchema.findById(id, (err, student) => {
			done(err, student);
		});
	});
};
