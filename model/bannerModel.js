const mongoose = require('mongoose')

const bannerSchema = mongoose.Schema({
    banner : {
        type : String,
        require : true
    },
    is_listed : {
        type : Boolean,
        require : true
    }
})

module.exports = mongoose.model('Banner',bannerSchema)