var express = require('express');
const fs = require('fs');
const path = require('path');
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

// POST /skills/:skillTreeName/:skillID/verify
router.post('/:skillTreeName/:skillID/verify', async (req, res) => {
    const { skillTreeName, skillID } = req.params;
    const { userSkillId, approved } = req.body;
    const UserSkill = req.UserSkill;
    const User = req.User;

    try {
        const userSkill = await UserSkill.findById(userSkillId);
        if (!userSkill) {
            return res.status(404).json({ success: false, message: 'UserSkill no encontrado' });
        }

        const verifier = await User.findById(req.session.userId);
        if (!verifier) {
            return res.status(403).json({ success: false, message: 'Usuario no autorizado' });
        }

        const verification = {
            user: verifier._id,
            approved: approved === 'true',
            verifiedAt: new Date()
        };

        userSkill.verifications.push(verification);

        // Check if skill should be marked as verified
        if (verifier.admin || userSkill.verifications.filter(v => v.approved).length >= 3) {
            userSkill.verified = true;

            // Update user's score if skill is verified
            const user = await User.findById(userSkill.user);
            if (user) {
                const skill = await req.Skill.findById(userSkill.skill);
                user.score += skill ? skill.score : 1;
                await user.save();
            }
        }

        await userSkill.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error al verificar evidencia:', error);
        res.status(500).json({ success: false, message: 'Error al verificar la evidencia' });
    }
});

// POST /skills/:skillTreeName/submit-evidence
router.post('/:skillTreeName/submit-evidence', async (req, res) => {
    const { skillTreeName } = req.params;
    const { skillId, evidence, userSkillId } = req.body;
    const UserSkill = req.UserSkill;
    const Skill = req.Skill;

    try {
        const skill = await Skill.findById(skillId);
        if (!skill) {
            return res.status(404).json({ success: false, message: 'Skill no encontrado' });
        }

        if (userSkillId) {
            // Update existing evidence
            const userSkill = await UserSkill.findById(userSkillId);
            if (!userSkill) {
                return res.status(404).json({ success: false, message: 'UserSkill no encontrado' });
            }
            userSkill.evidence = evidence;
            await userSkill.save();
        } else {
            // Create new evidence
            const userSkill = new UserSkill({
                user: req.session.userId,
                skill: skillId,
                evidence,
                completed: true,
                completedAt: new Date()
            });
            await userSkill.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error al enviar evidencia:', error);
        res.status(500).json({ success: false, message: 'Error al enviar la evidencia' });
    }
});

module.exports = router;