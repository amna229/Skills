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
const skillsData = require('./scripts/skills.json');

var skillsRouter = require('./routes/skills');
var usersRouter = require('./routes/users');
//var adminRouter = require('./routes/admin');

var app = express();

const resetSkillsCollection = async () => {
  try {
    // Eliminar todos los documentos de la colección
    await Skill.deleteMany({});
    console.log('Colección limpia');

    // Insertar los nuevos datos de skills desde el archivo JSON
    const docs = await Skill.insertMany(skillsData);
    console.log(`Se han insertado ${docs.length} skills.`);

    // Desconectar de MongoDB después de la operación
    mongoose.disconnect();
  } catch (err) {
    console.log('Error al limpiar o insertar los skills:', err);
  }
};

// Conectar con la base de datos de MongoDB
mongoose.connect('mongodb://localhost:27017/skills', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
    .then(() => {
      console.log('Conectado a MongoDB');
      resetSkillsCollection();
    })
    .catch((err) => console.error('Error de conexión a MongoDB:', err));

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

// Función ensureAdmin
function ensureadmin(req, res, next) {
  req.user = { admin: true }; // simulación para pruebas
  /*if (req.user && req.user.admin) {
    return next();
  }
  res.status(403).render('error', { message: 'acceso denegado: se necesita ser administrador' });*/
}

// Configuración del motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configuración de directorios estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'scripts')));
app.use(express.static(path.join(__dirname,'badges')));

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

app.get('/skills/:skillTreeName/edit/:skillID', async (req, res) => {
  const { skillTreeName, skillID } = req.params;

  try{
    // Si estás utilizando un archivo JSON, lee desde el archivo
    const skills = JSON.parse(fs.readFileSync(path.join(__dirname, 'scripts/skills.json')));
    const skill = skills.find(s => s.id === skillID);

    if (!skill) {
      return res.status(404).send("Habilidad no encontrada");
    }
    // Pass the skill object to the view
    res.render('editSkill', {skill, skillTreeName});

  }catch (err){
    return res.status(500).send("Error al obtener la habilidad");
  }
});

// Uso de routers
app.use('/users', usersRouter);
app.use('/skills', skillsRouter);
//app.use('/admin', adminRouter);

// Manejo de errores 404
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;