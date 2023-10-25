const User = require('../model/userModel')
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const Cart = require('../model/cartModel')
const Coupon = require('../model/couponModel')
const { default: mongoose } = require('mongoose')

const LoadCart = async (req,res)=>{
try {
    const user_id = req.session.user_id
    const cart = await Cart.findOne({user_id : user_id})
    if(cart === null || cart.cart_items.length === 0){
    res.render('shopping-cart',{cart : null})
    }else{
        res.render('shopping-cart',{cart})
    }
   
} catch (error) {
    console.log(error.message);
}
}

 
const AddToCart = async (req,res)=>{
    try {
     const user_id = req.session.user_id
     const product_id = req.query.id
     const product = await Product.findOne({_id : product_id})
     const cart_items = {
        product_id : product_id,
        product_name : product.product_name,
        offer_price : product.offer_price,
        quantity : 1,
        image : product.image[0],
        category : product.category
     }

     const findcart = await Cart.findOne({user_id : user_id})
     if(findcart){ 
        const existItem = await findcart.cart_items.find((item)=>{
            return item.product_id.toString()===product_id.toString()
        })
        if(existItem){
            existItem.quantity+=1
            findcart.save()
           // res.json({ output: true });
        }else{
            findcart.cart_items.push(cart_items)
            await findcart.save()
           // res.json({output : true})
        }
     }else{
        const newitem = new Cart({
            user_id : user_id,
            cart_items : []
        }) 
        newitem.cart_items.push(cart_items)
        await newitem.save() 
       //res.json({output : true})
     }
    } catch (error) {
        console.log(error.message);
    }
}

const loadCheckOut = async (req,res)=>{
    try {
        const user_id = req.session.user_id
        const cart = await Cart.findOne({user_id : user_id})
        const user = await User.findOne({_id : user_id})
        const coupons = await Coupon.find({})
        const product = await Product.findOne({_id : cart.cart_items[0].product_id})
        if(cart){
                res.render('checkout',{cart,user,coupons})
          
        }else{
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message);  
    }
}

 const deleteCartItem = async (req,res)=>{
    try {
        const user_id = req.session.user_id
        const id = req.query.id  

        const cart = await Cart.findOneAndUpdate(
            { user_id: user_id },
            { $pull: { cart_items: { product_id: id } } },
            { new: true }
          );
          if(cart){
            return res.json({status : true})
        } else {
          res.send("not found");
          }
    } catch (error) {
       console.log(error.message); 
    }
 }


 const LoadEditAdd = async (req,res) =>{
    try {
        const id = req.query.id

        const user = await User.findOne({_id : req.session.user_id})
        const getaddress = user.address.find(
            (address) => address.id.toString() === id
        );
        res.render('edit-address-checkout',{address : getaddress})
    } catch (error) {
        console.log(error.message);
    }
}



 const EditAddress = async (req,res) =>{
    try {
        const id = parseInt(req.query.id)
        const userid = req.session.user_id
        const edituser =await  User.updateOne({_id : userid,'address.id': id},{
            $set : {
                
                    'address.$.name' : req.body.username,
                    'address.$.mobile' : req.body.mobile,
                    'address.$.address' : req.body.address,
                    'address.$.homeaddress' : req.body.homeaddress,
                    'address.$.city' : req.body.city,
                    'address.$.state' : req.body.state,
                    'address.$.postcode' : req.body.postcode,
                    'address.$.id' : id
                
            }
        },{new:true})
        if(edituser){
            res.redirect('/checkout')
        }
    } catch (error) {
       console.log(error.message); 
    }
}

const 

   
Addaddress = async (req,res) =>{
    try {
        const id = req.session.user_id
          const  address ={
            name : req.body.username,
            mobile : req.body.mobile,
            address : req.body.address,
            homeaddress : req.body.homeaddress,
            city : req.body.city,
            state : req.body.state, 
            postcode : req.body.postcode,
            id : Date.now()
        }

        const user = await User.findOne({_id : id})
        user.address.push(address)
        await user.save()

      res.redirect('/checkout')

    } catch (error) {
        console.log(error.message);
    }
}

const CheckStock=async(req,res)=>{
    const cart = await Cart.findOne({user_id : req.session.user_id}).lean()
    
    const product = await Product.findOne({_id : cart.cart_items[0].product_id})
    if(cart.cart_items[0].quantity>product.stock){
        res.json({status : true})
    }else{
        res.json({status : false})
    }
}


 
module.exports = {
LoadCart,
AddToCart,
loadCheckOut,
deleteCartItem,
LoadEditAdd,
EditAddress,
Addaddress,
CheckStock,
}     
