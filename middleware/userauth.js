const { default: mongoose, Types } = require('mongoose');
const User = require('../model/userModel')
const isLogin = async (req,res,next)=>{
    try {
        if(req.session.user_id){
            next()
        }
        else{
            res.redirect('/')
        }
       
    
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/homepage')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

const is_blocked = async (req,res,next)=>{
    try {
        const id = new mongoose.Types.ObjectId(req.session.user_id)
        const finduser = await User.findById(id)

        if(finduser.is_block===0){
            // req.session.block=0
            next()
        }else{
            // req.session.block=1
            // req.session.user_id=null
            req.session.destroy()
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout,
    is_blocked
}