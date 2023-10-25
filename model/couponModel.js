const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({
    coupon_name : {
    type : String,
    require : true
    },
    start : {
        type : Date,
        default : Date.now(),
        require : true
    },
    validity : {
        type : Date,
        require : true
    },
    
    used_by : {
        type : String,
        require : true
    },
    offer : {
        type : Number,
        require : true
    },
    min_amount : {
        type : Number,
        require : true
    }
})

module.exports = mongoose.model('Coupon',couponSchema)