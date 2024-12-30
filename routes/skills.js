var express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require("mongoose");
var router = express.Router();

router.get('/', function(req, res, next) {
    const isAdmin = req.session.user.admin;
    res.render('index', { isAdmin });
});

// Ruta para mostrar el formulario de edición de un Skill
router.get('/:skillTreeName/edit/:skillID', async (req, res) => {
    const { skillTreeName, skillID } = req.params;
    const Skill = req.Skill; // Obtén el modelo desde req

    try {
        // Buscamos el skill en la base de datos usando el ID
        const skill = await Skill.findOne({ id: skillID, set:skillTreeName });
        if (!skill) {
            return res.status(404).send('Skill no encontrado');
            //return res.status(404).render('error', { message: 'Skill no encontrado' });
        }
        res.render('edit-skill', { skill, skillTreeName });
    } catch (err) {
        console.error('Error al buscar el skill:', err);
        return res.status(500).send('Error en la base de datos');
    }
});

// Ruta para procesar la edición del Skill
router.post('/:skillTreeName/edit/:skillID', async (req, res) => {
    const { skillTreeName, skillID } = req.params;
    const { text, description, icon } = req.body;
    const skillsPath = path.join(__dirname, '../scripts/skills.json');

    try {
        const skills = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));
        const skillIndex = skills.findIndex(skill => {
            const extractedSkillTree = skill.icon.split('/')[1]; // Obtener skillTreeName del icon
            return extractedSkillTree === skillTreeName && skill.id === skillID;
        });

        if (skillIndex === -1) {
            return res.status(404).render('error', { message: 'Skill no encontrado para actualizar' });
        }

        // Reemplazar espacios por \n para mantener el formato original
        skills[skillIndex].text = text.replace(/ /g, '\n');
        skills[skillIndex].description = description;
        skills[skillIndex].icon = icon;

        // Guardamos en el archivo
        fs.writeFileSync(skillsPath, JSON.stringify(skills, null, 2));
        res.redirect(`/skills/${skillTreeName}`);
    } catch (err) {
        res.status(500).render('error', { message: 'Error al guardar los cambios del Skill' });
    }
});

// Formulario para añadir Skill (GET)
router.get('/:skillTreeName/add', (req, res) => {
    const { skillTreeName } = req.params;
    const skill = {
        text: '',
        description: '',
        tasks: [],
        resources: [],
        score: 1,
        icon: ''
    };
    res.render('add-skill', { skillTreeName, skill });
});

// Añadir Skill (POST)
router.post('/:skillTreeName/add', async (req, res) => {
    const { skillTreeName } = req.params;
    const { text, description, tasks, resources, score, icon } = req.body;

    try {
        const newSkill = new Skill({
            text,
            description,
            set: skillTreeName,
            tasks: tasks.split('\n'),
            resources: resources.split('\n'),
            score: parseInt(score) || 1,
            icon,
        });
        await newSkill.save();
        res.redirect(`/skills/${skillTreeName}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el Skill.');
    }
});

// GET /skills/:skillTreeName/view/:skillID
router.get('/:skillTreeName/view/:skillID', async (req, res) => {
    const { skillTreeName, skillID } = req.params;
    const Skill = req.Skill;
    const UserSkill = req.UserSkill;

    try {
        const skill = await Skill.findOne({ id: skillID, set: skillTreeName });
        if (!skill) {
            return res.status(404).send('Skill no encontrado');
        }

        const pendingEvidences = await UserSkill.find({
            skill: skill._id,
            verified: false
        }).populate('user');

        res.render('view-skill', { skill, pendingEvidences });
    } catch (error) {
        console.error('Error al obtener el skill:', error);
        res.status(500).send('Error al obtener los datos del skill');
    }
});

router.post('/:skillTreeName/:skillID/verify', async (req, res) => {
    const { skillTreeName, skillID } = req.params;
    const { userSkillId, approved } = req.body;
    const UserSkill = require('../models/userSkill');
    const User = require('../models/user');
    const Skill = require('../models/skill');

    try {
        // Validate UserSkill model
        if (!UserSkill || typeof UserSkill.findById !== 'function') {
            throw new Error('UserSkill is not a valid model');
        }

        console.log('Attached userSkillId in request:', userSkillId);

        // Find UserSkill by ID
        const userSkill = await UserSkill.findById(new mongoose.Types.ObjectId(userSkillId));
        if (!userSkill) {
            return res.status(404).json({ success: false, message: 'UserSkill not found' });
        }

        // Find the verifier (current user)
        const verifier = await User.findById(new mongoose.Types.ObjectId(req.session.user.id));
        if (!verifier) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Add verification to the UserSkill
        const verification = {
            user: verifier._id,
            approved: approved === 'true',
            verifiedAt: new Date(),
        };
        userSkill.verifications.push(verification);

        // Mark the UserSkill as verified if conditions are met
        if (verifier.admin || userSkill.verifications.filter((v) => v.approved).length >= 3) {
            userSkill.verified = true;

            // Add the skill's score to the user's total score
            const skill = await Skill.findOne({ id: skillID }); // Use your custom `id` field
            if (skill) {
                const owner = await User.findById(userSkill.user);
                if (owner) {
                    owner.score += skill.score; // Add skill score to user's total score
                    await owner.save();
                    console.log(`Added ${skill.score} point(s) to user ${owner.username}`);
                }
            }
        }

        await userSkill.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error verifying evidence:', error);
        res.status(500).json({ success: false, message: 'Error verifying evidence' });
    }
});

// POST /skills/:skillTreeName/submit-evidence
router.post('/:skillTreeName/submit-evidence', async (req, res) => {
    const { skillId, evidence, userSkillId } = req.body;
    const UserSkill = req.UserSkill;

    try {
        if (!skillId || isNaN(skillId)) {
            return res.status(400).json({ success: false, message: 'Invalid skill ID' });
        }

        if (userSkillId) {
            // Update existing evidence
            const userSkill = await UserSkill.findById(userSkillId);
            if (!userSkill) {
                return res.status(404).json({ success: false, message: 'UserSkill not found' });
            }
            userSkill.evidence = evidence;
            await userSkill.save();
        } else {
            // Create new evidence
            const userSkill = new UserSkill({
                user: req.session.user.id,
                skill: Number(skillId), // Use the custom `id` field
                evidence,
                completed: true,
                completedAt: new Date(),
            });
            await userSkill.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error submitting evidence:', error);
        res.status(500).json({ success: false, message: 'Error submitting evidence' });
    }
});

router.get('/:skillTreeName/:skillId/evidence', async (req, res) => {
    const { skillId } = req.params; // `skillId` is a simple number
    const UserSkill = req.UserSkill;

    try {
        const evidences = await UserSkill.find({ skill: Number(skillId), verified: false })
            .populate('user', 'username'); // Populate with the user's username

        res.json(evidences);
    } catch (error) {
        console.error('Error fetching evidence:', error);
        res.status(500).json({ success: false, message: 'Error fetching evidence' });
    }
});

module.exports = router;