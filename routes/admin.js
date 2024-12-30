var express = require('express');
const fs = require('fs');
const path = require('path');
var router = express.Router();

// 7.1.1 GET /admin/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        res.render('admin-dashboard', { username: req.session.user.username });
    } catch (error) {
        res.status(500).send('Error loading dashboard');
    }
});

// 7.1.2 GET /admin/badges
router.get('/badges', async (req, res) => {
    const Badge = req.Badge;
    const success_msg = req.query.success_msg || '';
    const error_msg = req.query.error_msg || '';
    const error = req.query.error || '';
    try {
        const badges = await Badge.find().sort({ bitpoints_min: 1 });
        res.render('admin-badges', { badges, success_msg, error_msg, error});
    } catch (error) {
        res.status(500).send('Error loading badges');
    }
});

router.get('/api/badges', async (req, res) => {
    const Badge = req.Badge;
    try {
        const badges = await Badge.find();
        res.json(badges);
    } catch (error) {
        res.status(500).send('Error loading badges');
    }
});



// 7.1.3 GET /admin/badges/edit/:id Página para editar una medalla
router.get('/badges/edit/:id', async (req, res) => {
    const Badge = req.Badge;
    const success_msg = req.query.success_msg || '';
    try {
        const badgeId = req.params.id;
        console.log(badgeId);
        const badge = await Badge.findById(badgeId);
        if (!badge) {
            return res.status(404).send('Badge not found');
        }
        res.render('edit-badge', { badge, success_msg, error_msg:'', error:'' });
    } catch (error) {
        console.error('Error fetching badge:', error);
        res.status(500).send('Error loading badge');
    }
});

// 7.1.4 POST /admin/badges/edit/:id
router.post('/badges/edit/:id', async (req, res) => {
    const badgeID = req.params.id;
    const { name, range, bitpoints_min, bitpoints_max, image_url } = req.body;
    const Badge = req.Badge;

    try {
        const updatedBadge = await Badge.findByIdAndUpdate(badgeID, {
            name,
            range,
            bitpoints_min,
            bitpoints_max,
            image_url
        }, { new: true });

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

       /* res.render('edit-badge', {
            badge: { name, range, bitpoints_min, bitpoints_max, image_url },
            success_msg: 'Skill updated successfully', // Mensaje de éxito
            error_msg: '',
            error: ''
        });*/

       // await delay(3000);

        //res.redirect(`/admin/badges/edit/${badgeID}?success_msg=Skill updated successfully`);
        res.redirect(`/admin/badges?success_msg=Skill updated successfully`);
    } catch (error) {
        //res.status(500).send('Error updating badge');

        res.render('edit-badge', {
            badge: { name, range, bitpoints_min, bitpoints_max, image_url },
            success_msg: '',
            error_msg: 'Failed to update badge',
            error: error.message
        });
        }
});

// 7.1.5 POST /admin/badges/delete/:id
/*router.post('/badges/delete/:id', async (req, res) => {
    const Badge = req.Badge;
    const { id } = req.params;
    try {
        const deletedBadge = await Badge.findByIdAndDelete(id);
        if (!deletedBadge) {
            return res.status(404).json({ error: 'Badge not found' });
        }
        res.json({ success: true, message: 'Badge deleted successfully' });
        //res.redirect('/admin/badges?success_msg=Badge deleted successfully');
    } catch (error) {
        console.error('Error deleting badge:', error);
        res.status(500).json({ error: 'Error deleting badge' });
    }
});*/

// 7.1.5 POST /admin/badges/delete/:id
router.post('/badges/delete/:id', async (req, res) => {
    const Badge = req.Badge;
    const { id } = req.params;
    try {
        const deletedBadge = await Badge.findByIdAndDelete(id);
        if (!deletedBadge) {
            // Si no se encuentra el badge, se envía un mensaje de error
            return res.redirect('/admin/badges?error_msg=Badge not found');
        }
        // Si se elimina correctamente, se envía un mensaje de éxito
        res.redirect('/admin/badges?success_msg=Badge deleted successfully');
    } catch (error) {
        // Si ocurre un error en el proceso, se envía un mensaje de error
        console.error('Error deleting badge:', error);
        res.redirect('/admin/badges?error_msg=Error deleting badge');
    }
});


router.get('/api/users', async (req, res) => {
    const User = req.User;
    try {
        const users = await User.find(); // Obtén los usuarios desde la base de datos
        res.json(users); // Devuelve los usuarios en formato JSON
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
    }
});
// 7.1.6 GET /admin/users
router.get('/users', async (req, res) => {
    const User = req.User;
    try {
        const users = await User.find();
        res.render('admin-users', { users });
    } catch (error) {
        res.status(500).send('Error loading users');
    }
});

// 7.1.7 POST /admin/change-password
router.post('/change-password', async (req, res) => {
    const { userId, newPassword } = req.body;
    const User = req.User;

    if (!newPassword) {
        return res.status(400).send('Password is required');
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.password = newPassword;  // Se recomienda que uses un hash para la contraseña
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).send('Error changing password');
    }
});

module.exports = router;