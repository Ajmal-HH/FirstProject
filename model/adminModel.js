const mongoose = require('mongoose')

const admin = mongoose.Schema({
    adminname:{
        type:"string",
        require:true
    },
    password:{ 
        type:"string",
        require:true
    } 
}) 

module.exports = mongoose.model('Admin',admin)
