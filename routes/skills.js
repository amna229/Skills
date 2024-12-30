var express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require("mongoose");
var router = express.Router();
const Skill = require('../models/skill');
const UserSkill = require('../models/userSkill');

// Ruta al archivo skills.json
const skillsJsonPath = path.join(__dirname, '../scripts/skills.json');

// Configuración de Multer para guardar los archivos en 'public/electronics/icons/'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/electronics/icons')); // Carpeta de destino donde se guardará el archivo
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Genera un nombre único
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Usa la extensión original del archivo
    }
});

const upload = multer({ storage: storage });

// Función para actualizar el archivo skills.json
function updateSkillsJson(newSkill) {
    // Leer el archivo skills.json
    fs.readFile(skillsJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo skills.json:', err);
            return;
        }

        // Parsear el JSON existente
        let skills = JSON.parse(data);

        // Agregar el nuevo skill a la lista de skills
        skills.push(newSkill);

        // Escribir el archivo skills.json actualizado
        fs.writeFile(skillsJsonPath, JSON.stringify(skills, null, 2), (err) => {
            if (err) {
                console.error('Error al escribir el archivo skills.json:', err);
            } else {
                console.log('skills.json actualizado correctamente');
            }
        });
    });
}

router.get('/', function(req, res, next) {
  
    // const isAdmin = req.session.user && req.session.user.admin ? req.session.user.admin : false;

    const {id=null, username=null, isAdmin=req.session.user && req.session.user.admin ? req.session.user.admin : false} = req.session.user || {};

    const success_msg = req.query.success_msg || '';
    const error_msg = req.query.error_msg || '';
    const error = req.query.error || '';

    res.render('index', { id, username, isAdmin, success_msg, error_msg, error });
});

// Ruta para mostrar el formulario de edición de un Skill
router.get('/:skillTreeName/edit/:skillID', async (req, res) => {
    const { skillTreeName, skillID } = req.params;
    const Skill = req.Skill;
    const success_msg = req.query.success_msg || '';
    const error_msg = req.query.error_msg || '';
    const error = req.query.error || '';

    try {
        // Buscamos el skill en la base de datos usando el ID
        const skill = await Skill.findOne({ id: skillID, set:skillTreeName });
        if (!skill) {
            return res.status(404).send('Skill no encontrado');
            //return res.status(404).render('error', { message: 'Skill no encontrado' });
        }
        res.render('edit-skill', { skill, skillTreeName, success_msg, error_msg, error });
    } catch (err) {
        console.error('Error al buscar el skill:', err);
        return res.status(500).send('Error en la base de datos');
    }
});

// Ruta para procesar la edición del Skill
router.post('/:skillTreeName/edit/:skillID', upload.single('icon'), async (req, res) => {
    const Skill = req.Skill;
    const { skillTreeName, skillID } = req.params;
    const { text, description, tasks, resources, score, icon } = req.body;
    const skillsPath = path.join(__dirname, '../scripts/skills.json');

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
        const iconPath = req.file ? `/electronics/icons/${req.file.filename}` : icon;
        // 1. Actualizamos el Skill en la base de datos
        const updatedSkill = await Skill.findOneAndUpdate(
            { id: skillID, set: skillTreeName },
            {
                text,
                description,
                tasks: processedTasks,
                resources: processedResources,
                score: parseInt(score) || 1,
                icon: iconPath
            },{ new: true });

        // 2. Actualizamos el Skill en el archivo skills.json
        const skills = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));

        // Encuentra el índice del skill en el archivo JSON usando el skillID y skillTreeName
        const skillIndex = skills.findIndex(skill => {
            return String(skill.id) === String(skillID) && skill.set === skillTreeName;
        });
        console.log("skillIndex:", skillIndex);

        if (skillIndex === -1) {
            return res.status(404).render('error', {
                message: 'Skill no encontrado en el archivo JSON',
                error: { status: 404 }
            });
        }
        // Actualizamos los campos correctos en el archivo JSON
        const updatedSkillData = {
            id: updatedSkill.id,
            text: updatedSkill.text,  // Campo text
            icon: updatedSkill.icon,  // Campo icon
            description: updatedSkill.description,  // Campo description
            set: updatedSkill.set,  // Campo set
            tasks: updatedSkill.tasks,  // Campo tasks
            resources: processedResources,  // Campo resources
            score: updatedSkill.score  // Campo score
        };
        // Actualizamos el skill en el archivo JSON con la nueva información
        skills[skillIndex] = updatedSkillData;

        // Guardamos el archivo JSON actualizado
        fs.writeFileSync(skillsPath, JSON.stringify(skills, null, 2));

        res.redirect('/skills?success_msg=Skill updated successfully');
    } catch (err) {
        res.status(500).render('error', {
            //message: 'Error al guardar los cambios del Skill',
            success_msg: '',
            error_msg: 'Failed to update skill',
            error: err
        });
    }
});

// Formulario para añadir Skill (GET)
router.get('/:skillTreeName/add', (req, res) => {
    const { skillTreeName } = req.params;
    const success_msg = req.query.success_msg || '';
    const error_msg = req.query.error_msg || '';
    const error = req.query.error || '';

    const skill = {
        text: '',
        description: '',
        tasks: [],
        resources: [],
        score: 1,
        icon: ''
    };
    res.render('add-skill', { skillTreeName, skill, success_msg, error_msg, error });
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
        const iconPath = req.file ? `/electronics/icons/${req.file.filename}` : null;
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
        /*await skill.save();
        res.redirect(`/skills/${skillTreeName}?success_msg=Skill added successfully`);

        await skill.save();
        console.log('Skill guardado exitosamente con Skill.create:', skill);
        updateSkillsJson({
            id: String(skill.id),
            text: skill.text,
            icon: skill.icon,
            description: skill.description,
            set: skill.set
        });
        res.redirect('/skills');*/

        await skill.save();
        console.log('Skill guardado exitosamente con Skill.create:', skill);
        updateSkillsJson({
            id: String(skill.id),
            text: skill.text,
            icon: skill.icon,
            description: skill.description,
            set: skill.set
        });
        res.redirect(`/skills?success_msg=Skill added successfully`);

    } catch (error) {
        console.error(error);
        // res.status(500).send('Error al crear el Skill.');

        res.render('add-skill', {
            skillTreeName,
            skill: { text, description, tasks, resources, score, icon },
            success_msg: '',
            error_msg: 'Failed to add skill',
            error: error.message
        });

    }
});

// POST /skills/:skillTreeName/delete/:skillID
router.post('/:skillTreeName/delete/:skillID', async (req, res) => {
    const Skill = req.Skill;
    const { skillTreeName, skillID } = req.params;
    const skillsPath = path.join(__dirname, '../scripts/skills.json');

    try {
        // 1. Eliminar la competencia de la base de datos
        const deletedSkill = await Skill.findOneAndDelete({ id: String(skillID), set: skillTreeName },{ new:true });

        if (!deletedSkill) {
            return res.status(404).render('error', {
                message: 'Skill no encontrado en la base de datos',
                error: { status: 404 }
            });
        }
        console.log('deletedSkill:', deletedSkill);

        // 2. Eliminar la competencia del archivo JSON
        const skills = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));
        const updatedSkills = skills.filter(skill => !(String(skill.id) === String(skillID) && skill.set === skillTreeName));

        console.log('updatedSkills:', updatedSkills);

        fs.writeFileSync(skillsPath, JSON.stringify(updatedSkills, null, 2));

        // Redireccionar al listado de competencias
        res.redirect('/skills?success_msg=Skill deleted successfully');
    } catch (err) {
        res.status(500).render('error', {
            //message: 'Error al eliminar la competencia',
            success_msg: '',
            error_msg: 'Failed to delete skill',
            error: err
        });
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

// GET /skills/:skillSet/:skillId/evidence-counts
router.get('/:skillSet/:skillId/evidence-counts', async (req, res) => {
    const { skillSet, skillId } = req.params;
    const UserSkill = require('../models/userSkill');

    if (!req.session || !req.session.user) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }

    try {
        // Fetch evidence data for the current user and the specified skill
        const userId = req.session.user.id;

        const userSkills = await UserSkill.find({
            user: userId,
            skill: Number(skillId),
        });

        const unverifiedCount = userSkills.filter(e => !e.verified).length;
        const verifiedCount = userSkills.filter(e => e.verified).length;

        res.json({
            unverifiedCount,
            verifiedCount,
        });
    } catch (error) {
        console.error('Error fetching evidence counts:', error);
        res.status(500).json({ error: 'Failed to fetch evidence counts' });
    }
});

// GET /api/skills
router.get('/api/skills', async (req, res) => {
    const Skill = require('../models/skill');

    try {
        // Fetch all skills from the database
        const skills = await Skill.find().sort({ id: 1 }); // Sort by skill ID
        res.json(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

// POST /skills/:skillTreeName/delete/:skillID
/*router.post('/:skillTreeName/delete/:skillID', async(req, res) =>{

    const { skillTreeName, skillID } = req.params;
    const Skill = req.Skill;

    try {
        const skill = await Skill.findOne({ id: skillID, set: skillTreeName });
        if (!skill) {
            return res.status(404).send('Skill no encontrado');
        }

        await skill.remove();
        res.redirect(`/skills/${skillTreeName}`);

    } catch (error) {
        console.error('Error al eliminar el skill:', error);
        res.status(500).send('Error al eliminar el skill');
    }

});*/

module.exports = router;