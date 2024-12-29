var express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
var router = express.Router();
const upload = multer({ dest: 'public/electronics/icons' });  // Ruta de destino donde se guardarán los archivos

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
router.get('/:skillTreeName/add', async (req, res) => {
    try{
        const skillId = req.query.skillId; // Suponiendo que el skill ID se pasa como query string
        const { skillTreeName } = req.params;
        const skill = {
            text: '',
            description: '',
            tasks: [],
            resources: [],
            score: 1,
            icon: ''
        };
        res.render('add-skill', { skill, skillTreeName });
    } catch (e) {
        console.error('Error al cargar el formulario de añadir skill:', e);
        res.status(500).send('Error interno del servidor');
    }
});

// Añadir Skill (POST)
router.post('/:skillTreeName/add', upload.single('icon'), async (req, res) => {
    const Skill = req.Skill;
    const { skillTreeName } = req.params;
    const { text, description, tasks, resources, score, icon } = req.body;
    try {
        // Procesar el campo tasks
        let processedTasks = [];
        if (tasks) {
            processedTasks = tasks.trim().split('\n').filter(Boolean);
        }
        // Procesar el campo resources de manera similar (si es necesario)
        let processedResources = [];
        if (resources) {
            processedResources = resources.trim().split('\n').filter(Boolean);
        }
        const lastSkill = await Skill.findOne().sort({ id: -1 }).exec(); // Obtener el último skill basado en el id

        // Si lastSkill existe, tomar su id y sumarle 1, si no, el id inicial será 1
        const newId = lastSkill ? lastSkill.id + 1 : 1;
        // Manejo del icono (si se sube uno)
        const iconPath = req.file ? req.file.path : null;
        const skill = new Skill({
            id: newId,
            text,
            description,
            set: skillTreeName,
            tasks: processedTasks,
            resources: processedResources,
            score: parseInt(score) || 1,
            icon: iconPath || null
        });
        await skill.save();
        //const newSkill = await Skill.create(skillData);
        console.log('Skill guardado exitosamente con Skill.create:', skill);

        res.redirect('/skills');
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