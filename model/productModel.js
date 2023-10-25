const mongoose = require ('mongoose')

const productSchema = mongoose.Schema({
   
    product_name : {
        type : String,
        require : true
    },
    og_price : {
        type : Number,
        require : true
    },
    offer_price : {
        type : Number,
        require : true
    },
    model_name : {
        type : String,
        require :true
    },
    stock : {
        type : Number,
        require : true
    },
    description : {
        type : String,
        require : true
    },
    image : {
        type : Array,
        require : true
    },
    category : {
        type : String,
        require : true
    },
    is_listed : {
        type : Boolean, 
        require : true
    }
})

module.exports = mongoose.model('Product',productSchema)