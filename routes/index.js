var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/leaderboard', function(req, res, next) {
  res.render('leaderboard', { title: 'Range Explanation' });
});
module.exports = router;
