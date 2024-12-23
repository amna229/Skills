var createError = require('http-errors');
var express = require('express');
const fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');

// Models
const Skill = require('./models/skill');
const User = require('./models/user');
const Badge = require('./models/badge');
const skillsData = require('./scripts/skills.json');
const badgesData = require('./scripts/badges.json');


// Función isAdmin
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.admin === true) {
    return next();  // Si es admin, permite continuar
  }
  res.redirect('/users/login');  // Si no es admin, redirige al login
}

var skillsRouter = require('./routes/skills');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

const resetSkillsCollection = async () => {
  try {
    // Eliminar todos los documentos de la colección
    await Skill.deleteMany({});
    await Badge.deleteMany({});
    console.log('Colección limpia');

    // Insertar los nuevos datos de skills desde el archivo JSON
    const docs = await Skill.insertMany(skillsData);
    const bdgs = await Badge.insertMany(badgesData);
    console.log(`Se han insertado ${docs.length} skills.`);
    console.log(`Se han insertado ${bdgs.length} badges.`);

  } catch (err) {
    console.log('Error al limpiar o insertar los skills:', err);
  }
};

// Conectar con la base de datos de MongoDB
// Conectar a MongoDB y luego iniciar el servidor
async function connectToDatabaseAndStartServer() {
  try {
    await mongoose.connect('mongodb://localhost:27017/skills');
    console.log('Conectado a MongoDB');

    // Inicializa la colección de skills
    await resetSkillsCollection();

  } catch (err) {
    console.error('Error de conexión a MongoDB:', err);
    process.exit(1); // Finaliza la aplicación si no hay conexión
  }
}

connectToDatabaseAndStartServer();

// Guardar los modelos en app.locals
app.locals.User = User;
app.locals.Badge = Badge;

// Middlewares generales
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

// Middleware para manejar sesiones
app.use(session({
  secret: 'mysecretkey',  // Una clave secreta para firmar la sesión
  resave: false,          // No resguardar la sesión si no ha cambiado
  saveUninitialized: true // No guardar sesiones no inicializadas
}));

// Configuración del motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configuración de directorios estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'scripts')));
app.use(express.static(path.join(__dirname,'badges')));
app.use('/badges', express.static(path.join(__dirname,'badges')));

// Rutas personalizadas
// Ruta para cargar las medallas y los puntos
app.get('/leaderboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'leaderboard.html'));
});

// Ruta para cargar especificacionesComp
app.get('/especificacionesComp', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'especificacionesComp.html'));
});

// Ruta para cargar login
app.get('/users/login', (req, res) => {
  const mensajeLogout = req.query.mensajeLogout;
  res.render('login', { mensajeLogout });
});

// Ruta para cargar register
app.get('/users/register', (req, res) => {
  res.render('register');
});

// Uso de routers
app.use('/users', usersRouter);
app.use('/skills', (req, res, next) => {
  req.Skill = Skill;  // Pasa el modelo a las rutas
  next();
}, skillsRouter);
app.use('/admin', isAdmin, (req, res, next) => {
  req.Badge = Badge;
  req.User = User;
  next();
}, adminRouter);

// Manejo de errores 404
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;
  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    message: res.locals.message,
    error: res.locals.error  // Pasamos el objeto error a la vista
  });
});

module.exports = app;