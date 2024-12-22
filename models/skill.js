const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: null // Icon is optional
    },
    set: {
        type: String,
        default: ""
        //required: true
    },
    tasks: {
        type: [String], // Array of strings
        default: []
        //required: true
    },
    resources: {
        type: [String], // Array of strings
        default: []
       // required: true
    },
    description: {
        type: String,
        default: ''
        //required: true
    },
    score: {
        type: Number,
        default: 1, // Default score
        required: true
    }
});

// Crear y exportar el modelo de Skill
const Skill = mongoose.model('Skill', skillSchema);
module.exports = Skill;