const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    skill: {
        type: Number, // Refer to the `id` field in the Skill model
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    evidence: {
        type: String,
        default: null,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verifications: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            approved: {
                type: Boolean,
                required: true,
            },
            verifiedAt: {
                type: Date,
                default: null,
            },
        },
    ],
});

const UserSkill = mongoose.model('UserSkill', userSkillSchema);
module.exports = UserSkill;