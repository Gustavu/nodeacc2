const mongoose = require('mongoose');

// User Schema
const UserSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  token:{
    type: String,
    required: true
  },
  data_criacao:{
    type: String,
    required: true
  },
  data_atualizacao:{
    type: String,
    required: false
  },
  ultimo_login:{
    type: String,
    required: false
  }
});

const User = module.exports = mongoose.model('User', UserSchema);
