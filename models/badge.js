const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    bitpoints_min: {
        type: Number,
        required: true
    },
    bitpoints_max: {
        type: Number,
        required: true
    },
    image_url: {
        type: String,
        required: true
    }
});

// Crear y exportar el modelo de Badge
const Badge = mongoose.model('Badge', badgeSchema);
module.exports = Badge;
