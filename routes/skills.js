var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    const isAdmin = req.session.admin || false;
    res.render('index', { isAdmin });
});

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

module.exports = router;