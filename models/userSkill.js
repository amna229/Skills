const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: true
    },
    skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill', // Reference to Skill model
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    evidence: {
        type: String,
        default: null
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifications: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Reference to User model
                required: true
            },
            approved: {
                type: Boolean,
                required: true
            },
            verifiedAt: {
                type: Date,
                default: null
            }
        }
    ]
});

// Crear y exportar el modelo de UserSkill
const UserSkill = mongoose.model('UserSkill', userSkillSchema);
module.exports = UserSkill;

