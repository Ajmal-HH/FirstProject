const Coupon = require('../model/couponModel')
const Cart = require('../model/cartModel')
const User = require('../model/userModel')



const loadAddCoupon = async (req,res)=>{
    try {
        res.render('add-coupons')
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupon = async (req,res)=>{
    try {
        const coupon = new Coupon({
          coupon_name : req.body.coupon_name,
          start : req.body.date,
          validity : req.body.exp_date,
          used_by : req.session.user_id,
          offer : req.body.offer,
          min_amount : req.body.min_amount  
        })
        await coupon.save()
        res.render('add-coupons',{msg:"new coupon addedd!..."})
    } catch (error) {
        console.log(error.message);
    }
} 

 const  couponDiscount = async (req,res)=> {
    try {
        const user_id = req.session.user_id
        const cart = await Cart.findOne({user_id : user_id})
        const user = await User.findOne({_id : user_id})
        const coupons = await Coupon.find({})
        const coupon = req.body.coupon
        let coupondis = await Coupon.findOne({coupon_name : coupon})
        // console.log(coupondis.offer,"?????");
        res.render('checkout',{cart,user,coupons,coupondis})
    } catch (error) {
        console.log(error.message);
    }
 } 

 const couponList = async (req,res)=>{
    try {
        const coupon = await Coupon.find({})
        res.render('coupons-list',{coupon})
    } catch (error) {
        console.log(error.message);
    }
 }

 const deleteCoupon = async (req,res) =>{
    try {
        const id = req.query.coupon
        await Coupon.deleteOne({_id : id })
        const coupon = await Coupon.find({})
        res.render('coupons-list',{coupon})
        
    } catch (error) {
        console.log(error.message);
    }
 }

 const editCoupon = async (req,res) =>{
    try {
        const id = req.query.coupon
        const coupon = await Coupon.findOne({_id : id})
        res.render('edit-coupon',{coupon})
    } catch (error) {
        console.log(error.message);
    }
 }

 const updateCoupon = async (req,res)=>{
    try {
        const id = req.query.coupon
        const coupon = await Coupon.findByIdAndUpdate({_id : id},{
            $set : {
            coupon_name : req.body.coupon_name,
            start : req.body.date,
            validity : req.body.exp_date,
            used_by : req.session.user_id,
            offer : req.body.offer,
            min_amount : req.body.min_amount
            }  
          })

          res.redirect('/admin/couponlist')
        
    } catch (error) {
        console.log(error.message);
    }
 }



module.exports = {
    loadAddCoupon,
    addCoupon,
    couponDiscount,
    couponList,
    deleteCoupon,
    editCoupon,
    updateCoupon
}