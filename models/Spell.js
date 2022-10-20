const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// cria um "modelo"/schema no mongo
const SpellSchema = new Schema({
	name: { type: String, required: true, unique: true },
	category: { type: String, required: true },
	level: { type: String, required: true },
	description: { type: String },
	author: { type: String, default: "Desconhecido" },
});
// upa tal modelo no banco com o nome 'spell'
mongoose.model("spell", SpellSchema);