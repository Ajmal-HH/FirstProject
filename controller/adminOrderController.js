const User = require('../model/userModel')
const Cart = require('../model/cartModel')
const Order = require('../model/orderModel')

const loadOrderList = async (req,res)=>{
    try {
        let page = req.query.page
        let limit = 10
        let skip = page*10
        const order = await Order.find({}).skip(skip).limit(limit)

        res.render('orderlist',{order,page})
    } catch (error) {
        console.log(error.message);
    }
}

const orderDetails = async (req,res)=>{
    try {
        const id = req.query.id
        const orders = await Order.find({_id : id})
        res.render('order-details',{orders})
    } catch (error) {
       console.log(error.message); 
    }
}

const orderStatus = async (req,res)=>{
    try {
        let data = req.body.data
        let id = req.body.orderid
        const order = await Order.findByIdAndUpdate({_id : id},
            {$set : {delivery_status : data}})

            if(data=='Return'){   
                const wallet = await User.findByIdAndUpdate({_id : order.user_id},{
                    $inc : {wallet : +order.total_price}
                })
            }
            res.json({status:true})

    } catch (error) {    
       console.log(error.message);    
    } 
}    

module.exports = {
    loadOrderList,
    orderDetails,
    orderStatus
}