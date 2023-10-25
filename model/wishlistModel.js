const mongoose = require ('mongoose')

const wishlist = mongoose.Schema({
    user_id : {
        type: mongoose.Types.ObjectId,
        required : true
    },
    wishlist_items : [{
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
        image : {
            type : String,
            required : true
        }
    }]
})

module.exports = mongoose.model('Wishlist',wishlist)