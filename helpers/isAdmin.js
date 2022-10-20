module.exports = {
	isAdmin: (req, res, next) => {
		if (req.isAuthenticated() && req.user.isAdmin == 1) {
			//esse campo isAdmin referencia o campo do model Students
			return next();
		}
		req.flash("error_msg", "Você deve ser um mago para entrar aqui.");
		res.redirect("/admin");
	},
};
