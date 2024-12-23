var express = require('express');
const fs = require('fs');
const path = require('path');
var router = express.Router();

router.get('/', function(req, res, next) {
    const isAdmin = req.session.admin || false;
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
module.exports = router;