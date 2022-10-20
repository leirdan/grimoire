const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentsSchema = new Schema({
	name: { type: String, required: true, unique: true },
	age: { type: Number },
	personality: { type: String },
	gender: { type: String },
	especiality: { type: String },
	email: { type: String, required: true },
	passwd: { type: String, required: true },
	progress: { type: String },
	isAdmin: { type: Number, default: 0 },
});

mongoose.model("students", StudentsSchema);
