const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definir el esquema de User
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,  // Asegura que el nombre de usuario sea único
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        default: 0,
    },
    admin: {
        type: Boolean,
        default: false,
    },
    completedSkills: {
        type: [String],
        default: [],
    }
});

// Middleware para encriptar la contraseña antes de guardar el usuario
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password); //Comparar contraseñas
};

// Crear y exportar el modelo de User
const User = mongoose.model('User', userSchema);
module.exports = User;