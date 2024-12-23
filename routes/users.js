var express = require('express');
const bcrypt = require('bcryptjs');
var router = express.Router();
const User = require('../models/user');  // Importa el modelo User

// Función para verificar si el nombre de usuario es único
async function isUsernameUnique(username) {
  const user = await User.findOne({ username });
  return !user;
}

// Función para obtener el número de usuarios en la base de datos
async function getUserCount() {
  const count = await User.countDocuments();
  return count;
}


// POST /users/register
router.post('/register', async (req, res) => {
  const { username, password, password2 } = req.body;

  // Validaciones
  if (!username || !password || !password2) {
    return res.render('register', { error: 'Todos los campos son obligatorios.' });
  }
  if (password !== password2) {
    return res.render('register', { error: 'Las contraseñas no coinciden.' });
  }
  if (password.length < 6) {
    return res.render('register', { error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  // Verificar si el nombre de usuario ya existe
  const isUnique = await isUsernameUnique(username);
  if (!isUnique) {
    return res.render('register', { error: 'El nombre de usuario ya está en uso.' });
  }

  try {
    // Verificar si es el primer usuario
    const userCount = await getUserCount();
    const admin = userCount === 0;  // El primer usuario registrado será un administrador
    // Registrar usuario
    const newUser = new User({ username, password, admin });
    await newUser.save();

    res.redirect('/users/login');  // Redirigir al login después del registro exitoso
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Hubo un error al registrar al usuario.' });
  }
});


// POST /users/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Verificar que ambos campos estén presentes
  if (!username || !password) {
    return res.render('login', { error: 'Por favor, ingresa tu nombre de usuario y contraseña.' });
  }

  try {
    // Buscar el usuario en la base de datos
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { error: 'Usuario no encontrado.' });
    }

    // Comparar las contraseñas utilizando bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: 'Contraseña incorrecta.' });
    }

    // Iniciar la sesión del usuario
    // Almacenar el usuario en la sesión
    req.session.user = {
      id: user._id,
      username: user.username,
      admin: user.admin // Guardar la propiedad 'admin' en la sesión
    };

    res.redirect('/skills');

  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor.');
  }
});

// Endpoint para cerrar sesión
router.get('/logout', (req, res) => {
  if (req.session) {
    // Destruye la sesión
    req.session.mensajeLogout = 'You have logged out successfully.';
    req.session.destroy(err => {
      if (err) {
        console.error("Error al cerrar sesión: ", err);
        res.redirect('/skills'); // Redirigir a la página principal en caso de error
      }else{
        res.redirect('/users/login?mensajeLogout=You+have+logged+out+successfully.');
      }
    });
  } else {
    res.redirect('users/login');
  }
});

//GET /users/leaderboard
router.get('/leaderboard', async (req, res)=>{
  const Badge = req.Badge;
  try {
    const badges = await Badge.find();
    // Obtén todos los usuarios desde la base de datos
    const users = await User.find();
    // Renderiza la vista leaderboard.ejs y pasa los usuarios como datos , { users: users }
    res.render('leaderboard', {badges});
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).send('Error fetching badges!');
  }
});

module.exports = router;
