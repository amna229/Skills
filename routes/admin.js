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
    try {
        const badges = await Badge.find().sort({ bitpoints_min: 1 });
        res.render('admin-badges', { badges });
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
    try {
        const badgeId = req.params.id;
        console.log(badgeId);
        const badge = await Badge.findById(badgeId);
        if (!badge) {
            return res.status(404).send('Badge not found');
        }
        res.render('edit-badge', { badge });
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

        res.redirect('/admin/badges');
    } catch (error) {
        res.status(500).send('Error updating badge');
    }
});

// 7.1.5 POST /admin/badges/delete/:id
router.post('/badges/delete/:id', async (req, res) => {
    const Badge = req.Badge;
    const { id } = req.params;
    try {
        await Badge.findByIdAndDelete(id);
        res.redirect('/admin/badges');
    } catch (error) {
        res.status(500).send('Error deleting badge');
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