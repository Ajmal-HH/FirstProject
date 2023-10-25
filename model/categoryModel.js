const mongoose = require ('mongoose')

categorySchema = mongoose.Schema({
    category_name : {
    type : String,
    require : true
    },
    category_logo : {
        type : String,
        require : true
    },
    is_listed : {
        type : Boolean,
        require : true
    }
    
})

module.exports = mongoose.model('Category',categorySchema)