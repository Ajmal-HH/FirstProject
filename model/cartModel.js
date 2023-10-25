const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({
    user_id : {
        type: mongoose.Types.ObjectId,
        required : true
    },
    cart_items : [{
        product_id : {
            type : mongoose.Types.ObjectId,
            required : true
        },
        product_name : {
            type : String,
            required : true
        },
        offer_price : {
            type : Number,
            required : true
        },
        quantity : {
            type : Number,
            required : true,
        },
        image : {
            type : String,
            required : true
        },
        category : {
            type : String,
            require : true
        }
    }]
})

module.exports = mongoose.model('Cart',cartSchema)