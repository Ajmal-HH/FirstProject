const mongoose = require('mongoose')

const user = mongoose.Schema({
    username:{
        type:"string",
        require:true    
    },
    email:{
        type:"string",
        require:true
    },
    password:{
        type:"string",
        require:true
    },
    mobile:{
    type:"string",
        require:true
    },
    is_block:{
        type:Number,
        require:true
    },
    address : [],
    wallet : {
        type : Number,
        require : true
    },
    date : {
        type : Date,
        require : true
    }
})

const User = mongoose.model('User',user)

module.exports = User