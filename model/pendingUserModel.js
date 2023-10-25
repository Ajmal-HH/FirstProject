const mongoose = require ('mongoose')

const pendingUser = mongoose.Schema({
    username:{
        type : String,
        require : true
    },
    email : {
        type : String,
        require :true
    },
    mobile : {
        type : String,
        require : true
    }
})

module.exports = mongoose.model("PendingUser",pendingUser)