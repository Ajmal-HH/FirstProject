const mongoose = require('mongoose')
const User = require('../model/userModel')
const Product = require('../model/productModel')
const Cart = require('../model/cartModel')

const updatecart = async (req,res) =>{
    try {
        const userid = req.session.user_id

        const productId = req.params.id

        const newquantity = req.body.quantity
        parseInt(newquantity)

        const product = await Product.findOne({_id : productId})

        const cart = await Cart.findOne({user_id : userid})

        let sum = 0


        const existingcartitem = await cart.cart_items.find((items) => {
            return items.product_id.toString() === product._id.toString();
          });  

    
        let price = existingcartitem.quantity * existingcartitem.offer_price
        let cartT = 0
        cart.cart_items.forEach((item) => {
            cartT += item.quantity * item.offer_price
        })
        if(newquantity>product.stock){
            return res.send({ status : false,totalPrice :  price,cartTotal : cartT})
        }

        if(existingcartitem){   
            existingcartitem.quantity = newquantity
            await cart.save() 
        }else{
            console.log('no items');
        }
        var stock = true
        if(product.stock < existingcartitem.quantity){
            stock = false
        }else{
            stock = true
        }
        await product.save()

        const totalPrice = existingcartitem.quantity * existingcartitem.offer_price
        let cartTotal = 0

        cart.cart_items.forEach((item)=>{
            cartTotal+=item.quantity * item.offer_price
        })

        res.send({status : true, totalPrice : totalPrice, cartTotal : cartTotal , stock : stock})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    updatecart
  };