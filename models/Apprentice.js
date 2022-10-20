const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ApprenticeSchema = new Schema({
	name: { type: String, required: true, unique: true },
	age: { type: Number, required: true },
	personality: { type: String },
	gender: { type: String },
	registeredAt: { type: Date, default: Date.now },
	talent: { type: Schema.Types.ObjectId, ref: "spell" }, // referencia o schema "Spell.js"
});

mongoose.model("apprentice", ApprenticeSchema);