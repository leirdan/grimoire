const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Spell"); // carrega o model
const SpellSchema = mongoose.model("spell"); // passa o model pra constante
require("../models/Apprentice");
const ApprenticeSchema = mongoose.model("apprentice");
require("../models/Students");
const StudentSchema = mongoose.model("students");
const { isAdmin } = require("../helpers/isAdmin"); // indica que dentro desse arquivo, quero pegar só a funcao "isAdmin"
// para proteger uma rota, é só colocar "isAdmin" antes da funcao anonima

router.get("/", (req, res) => {
	res.render("admin/index");
});

// rota que renderiza a página de exibição de feitiços
router.get("/spells", isAdmin, (req, res) => {
	SpellSchema.find()
		.lean()
		.sort({ level: "asc" })
		.then((spells) => {
			res.render("admin/catalogue_spells", { spells: spells });
		})
		.catch((err) => {
			req.flash("error_msg", "Houve um erro ao listar seus feitiços...");
			res.redirect("/admin");
		});
});

// rota que renderiza a página de criação de feitiços
router.get("/spells/create", isAdmin, (req, res) => {
	res.render("admin/create_spells");
});

// rota de criação de feitiços com esquema de validação
router.post("/spells/success", isAdmin, (req, res) => {
	let errors = [];
	if (req.body.name == undefined || req.body.name.length <= 0 || req.body.name == "") {
		errors.push({ text: "Nome inválido!" });
	}
	if (!req.body.description || typeof req.body.description == undefined || req.body.description == null) {
		errors.push({ text: "Descrição inválida!" });
	}
	if (errors.length > 0) {
		res.render("admin/create_spells", { errs: errors }); // a cada erro, renderiza a página de criação e passa o erro por meio da chave 'errors'
	} else {
		// recebe dados do formulário e registra no model SpellSchema do mongo
		const spell = {
			name: req.body.name,
			description: req.body.description,
			category: req.body.categories,
			level: req.body.level,
			author: req.body.author,
		};
		new SpellSchema(spell)
			.save()
			.then(() => {
				req.flash("success_msg", "Feitiço adicionado com sucesso!"); // aspas simples; referencia a variavel global de Ctrl.js
				res.redirect("/admin/spells");
			})
			.catch((err) => {
				req.flash("error_msg", "Não foi possível adicionar o feitiço. Estude mais.");
				res.redirect("/admin");
			});
	}
});

// rota que renderiza a página de edição de feitiços
router.get("/spells/edit/:name", isAdmin, (req, res) => {
	SpellSchema.findOne({ name: req.params.name })
		.lean()
		.then((data) => {
			res.render("admin/alter_spells", { spell: data });
		})
		.catch((err) => {
			req.flash("error_msg", "Não foi possível encontrar a magia...");
			res.redirect("/admin/spells");
		});
});

// rota de edição de feitiços com um esquema de validação
router.post("/spells/edit", isAdmin, (req, res) => {
	let errors = [];
	if (req.body.name == undefined || req.body.name.length <= 0 || req.body.name == "") {
		errors.push({ text: "Nome inválido!" });
	}
	if (!req.body.description || typeof req.body.description == undefined || req.body.description == null) {
		errors.push({ text: "Descrição inválida!" });
	}
	if (errors.length > 0) {
		res.render("admin/create_spells", { errs: errors });
	} else {
		SpellSchema.findOne({ name: req.body.name })
			.then((alteredSpell) => {
				alteredSpell.name = req.body.name;
				alteredSpell.description = req.body.description;
				alteredSpell.level = req.body.level;
				alteredSpell.author = req.body.author;
				alteredSpell.category = req.body.categories;
				alteredSpell
					.save()
					.then(() => {
						req.flash("success_msg", "Feitiço modificado...");
						res.redirect("/admin/spells");
					})
					.catch((err) => {
						req.flash("error_msg", `Não foi possível alterar o feitiço..: ${err}`);
						res.redirect("/admin/spells");
					});
			})
			.catch((err) => {
				req.flash("error_msg", "Não foi possível encontrar o feitiço..." + err);
				res.redirect("/admin/spells");
			});
	}
});

// rota para deletar um feitiço
router.get("/spells/:id", isAdmin, (req, res) => {
	SpellSchema.findOneAndRemove({ id: req.params.id })
		.then(() => {
			req.flash("success_msg", "Feitiço eliminado...");
			res.redirect("/admin/spells");
		})
		.catch((err) => {
			req.flash("error_msg", "Alguma força o impediu de fazer isso.");
			res.redirect("/admin");
		});
});

// exibe a página de aprendizes com todos eles cadastrados
router.get("/apprentices", isAdmin, (req, res) => {
	ApprenticeSchema.find()
		.lean()
		.populate("talent") // referencia o campo talent em Apprentice.js
		.sort({ name: "asc" })
		.then((std) => {
			res.render("admin/catalogue_apprentices", { apprentice: std });
		})
		.catch((err) => {
			req.flash("error_msg", "Não foi possível listar os aprendizes: " + err);
			res.redirect("/admin");
		});
});

// renderiza formulario de criação de aprendiz e passa as magias existentes para serem selecionadas
router.get("/apprentices/create", isAdmin, (req, res) => {
	SpellSchema.find()
		.lean()
		.then((spells) => {
			res.render("admin/create_apprentices", { spell: spells });
		})
		.catch((err) => {
			req.flash("error_msg", "Não foi possível exibir o formulário:" + err);
			res.redirect("/admin/apprentices");
		});
});

// rota que cadastra o aprendiz no banco de dados
router.post("/apprentices/success", isAdmin, (req, res) => {
	let errors = [];
	if (req.body.name == undefined || req.body.name.length <= 0 || req.body.name == "") {
		errors.push({ text: "Nome inválido!" });
	}
	if (req.body.age == undefined || req.body.name.age <= 0) {
		errors.push({ text: "Idade inválida!" });
	}
	if (errors.length > 0) {
		res.render("admin/create_apprentices", { errs: errors });
	} else {
		const apprentice = {
			name: req.body.name,
			age: req.body.age,
			personality: req.body.personalities,
			gender: req.body.gender,
			talent: req.body.talent,
		};
		new ApprenticeSchema(apprentice)
			.save()
			.then(() => {
				req.flash("success_msg", "Aprendiz cadastrado com sucesso!");
				res.redirect("/admin/apprentices");
			})
			.catch((err) => {
				req.flash("error_msg", "Houve um erro no cadastro: " + err);
				res.redirect("/admin/apprentices");
			});
	}
});

// rota de edição de aprendiz
router.get("/apprentices/edit/:name", isAdmin, (req, res) => {
	ApprenticeSchema.findOne({ name: req.params.name })
		.lean()
		.then((data) => {
			SpellSchema.find()
				.lean()
				.then((spell) => {
					res.render("admin/alter_apprentices", { apprentice: data, spell: spell });
				})
				.catch((err) => {
					req.flash("error_msg", `Não foi possível exibir a página: ${err}`);
					res.redirect("/admin/apprentices");
				});
		})
		.catch((err) => {
			req.flash("error_msg", "Este aprendiz não existe.");
			res.redirect("/admin/apprentices");
		});
});
// rota que edita o aprendiz
router.post("/apprentices/edit/success", isAdmin, (req, res) => {
	ApprenticeSchema.findOne({ name: req.body.name })
		.then((alteredApprentice) => {
			alteredApprentice.name = req.body.name;
			alteredApprentice.age = req.body.age;
			alteredApprentice.personality = req.body.personality;
			alteredApprentice.gender = req.body.gender;
			alteredApprentice.talent = req.body.talent;
			alteredApprentice
				.save()
				.then(() => {
					req.flash("success_msg", "Informações do aprendiz editadas com sucesso.");
					res.redirect("/admin/apprentices");
				})
				.catch((err) => {
					req.flash("error_msg", `Não foi possível salvar as novas informações: ${err}`);
					res.redirect("/admin/apprentices");
				});
		})
		.catch((err) => {
			req.flash("error_msg", `Este aprendiz não existe.`);
			res.redirect("/admin/apprentices");
		});
});
// rota de deletar aprendiz
router.get("/apprentices/delete/:name", isAdmin, (req, res) => {
	ApprenticeSchema.findOneAndDelete({ name: req.params.name })
		.then(() => {
			req.flash("success_msg", "Aprendiz removido com sucesso..");
			res.redirect("/admin/apprentices");
		})
		.catch((err) => {
			req.flash("error_msg", `Não foi possível eliminar o aprendiz: ${err}`);
			res.redirect("/admin/apprentices");
		});
});
// rota de aprimorar aprendiz para estudante fixo
router.get("/apprentices/upgrade/:name", isAdmin, (req, res) => {
	ApprenticeSchema.findOne({ name: req.params.name })
		.lean()
		.then((data) => {
			res.render("admin/upgrade_apprentice", { apprentice: data });
		})
		.catch((err) => {
			req.flash("error_msg", "Este aprendiz não existe.");
			res.redirect("/admin/apprentices");
		});
});

router.post("/apprentices/upgrade/success", isAdmin, (req, res) => {
	ApprenticeSchema.findOne({ name: req.body.name }).then((apprentice) => {
		const std = StudentSchema.create({
			name: apprentice.name,
			age: apprentice.age,
			personality: apprentice.personality,
			gender: apprentice.gender,
			especiality: req.body.especiality,
			progress: req.body.progress,
			email: req.body.email,
			passwd: req.body.passwd,
		});
		new StudentSchema(std)
			.save()
			.then(() => {
				ApprenticeSchema.findOneAndDelete({ name: req.body.name })
					.then(() => {
						req.flash("success_msg", "Este aprendiz agora é um aluno!");
						res.redirect("/admin/apprentices");
					})
					.catch((err) => {
						req.flash("error_msg", "Não foi possível realizar a operação: " + err);
						res.redirect("/admin/apprentices");
					});
			})
			.catch((err) => {
				req.flash("error_msg", "Não foi possível passá-lo de nível.." + err);
				res.redirect("/admin/apprentices");
			});
	});
});

router.get("/students", isAdmin, (req, res) => {
	StudentSchema.find()
		.lean()
		.populate("especiality")
		.sort({ name: "asc" })
		.then((data) => {
			res.render("admin/catalogue_students", { students: data });
		})
		.catch((err) => {
			req.flash("error_msg", `Não foi possível listar os estudantes... ${err}`);
			res.redirect("/admin");
		});
});

module.exports = router; // exportando
