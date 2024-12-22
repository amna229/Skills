var express = require('express');
const fs = require('fs');
const path = require('path');
var router = express.Router();

router.get('/', function(req, res, next) {
    const isAdmin = req.session.admin || false;
    res.render('index', { isAdmin });
});

// Ruta para mostrar el formulario de edición de un Skill
router.get('/:skillTreeName/edit/:skillID', (req, res, next) => req.ensureAdmin(req, res, next), (req, res) => {
    const { skillTreeName, skillID } = req.params;
    const skillsPath = path.join(__dirname, '../scripts/skills.json');

    try {
        const skills = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));
        const skill = skills.find(skill => {
            const extractedSkillTree = skill.icon.split('/')[1]; // Obtener skillTreeName del icon
            return extractedSkillTree === skillTreeName && skill.id === skillID;
        });

        if (!skill) {
            return res.status(404).render('error', { message: 'Skill no encontrado' });
        }

        // Reemplazar \n por espacios para mostrarlo correctamente
        skill.text = skill.text.replace(/\n/g, ' ');

        res.render('editSkill', { skill });
    } catch (err) {
        res.status(500).render('error', { message: 'Error al cargar los datos del Skill' });
    }
});

// Ruta para procesar la edición del Skill
router.post('/:skillTreeName/edit/:skillID', (req, res, next) => req.ensureAdmin(req, res, next), (req, res) => {
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

/*
// Ruta para el formulario de edición
router.get('/:skillTreeName/edit/:skillID', async (req, res) => {
    const { skillTreeName, skillID } = req.params;
    try {
        // Obtén los datos de la competencia desde la base de datos
        const skill = await getSkillById(skillID);

        if (!skill) {
            return res.status(404).send('Skill not found.');
        }
        // Renderiza la vista del formulario de edición
        res.render('editSkill', {
            title: `Edit Skill: ${skill.name}`,
            skillTreeName,
            skill
        });
    } catch (err) {
        console.error('Error fetching skill:', err);
        res.status(500).send('Server error.');
    }
});

router.post('/:skillTreeName/edit/:skillID', async (req, res) => {
    const { skillTreeName, skillID } = req.params;
    const { skillName, description, tasks, resources, score } = req.body;

    try {
        // Actualiza la competencia
        const updatedSkill = await Skill.findByIdAndUpdate(
            skillID,
            {
                name: skillName,
                description,
                tasks: tasks.split('\n').map(t => t.trim()),
                resources: resources.split('\n').map(r => r.trim()),
                score: parseInt(score),
                ...(req.file && { icon: req.file.path }) // Si se subió un archivo, actualiza el icono
            },
            { new: true }
        );

        res.redirect(`/skills/${skillTreeName}`);
    } catch (err) {
        console.error('Error updating skill:', err);
        res.status(500).send('Server error.');
    }
});
*/
module.exports = router;