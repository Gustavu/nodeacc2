const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

// Bring in User Model
let User = require('../models/user');

// Register Form
router.get('/register', function(req, res){
  res.render('register');
});

// Register Proccess
router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let query = {email:email};
  User.findOne(query, function(err, userdb){
    if(err) throw err;
    if(userdb !== null){
      req.check(userdb.email, 'E-mail já existente').notEmpty();
    }

    let errors = req.validationErrors();

    if(errors){
      res.render('register', {
        errors:errors
      });
    } else {
      let user ={
        name:name,
        email:email,
        username:username,
        password:password,
        data_criacao: new Date(),
        data_atualizacao: new Date()
      };

      var token = jwt.sign(user, config.secret);
      user.token = token;

      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(user.password, salt, function(err, hash){
          if(err){
            console.log(err);
          }
          user.password = hash;

          var newUser = new User(user);

          newUser.save(function(err,userdb){
            if(err){
              console.log(err);
              return;
            } else {
              //req.flash('success','You are now registered and can log in');
              //res.redirect('/users/login');
              res.status(201).send(userdb);
            }
          });
        });
      });
    }
  });
});

// Login Form
router.get('/login', function(req, res){
  res.render('login');
});

router.post('/login',
  passport.authenticate('local', { failWithError: true }),
  function(req, res, next) {
    // handle success
    //if (req.xhr) { return res.json({ id: req.user.id }); }
    return res.redirect('/');

  },
  function(err, req, res, next) {
    // handle error
    //if (req.xhr) { return res.json(err); }
    //return res.redirect('/login');
    res.status(401).send("Usuário e/ou senha inválidos");
  }
);

// Login Process
/**router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next);
});*/

// logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

// Get Single User
router.get('/:id', ensureAuthenticated, function(req, res){
  User.findById(req.params.id, function(err, user){
      res.render('user', {        
        user: user
      });    
  });
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
} 

module.exports = router;
