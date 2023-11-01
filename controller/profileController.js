const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../model/userModel')


const securePassword = async (password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

const userProfile = async (req,res) =>{
    try {
        const user = await User.findOne({_id : req.session.user_id})
        if(user){
        res.render('userProfile',{user})
        }else{
            res.status(404)
        }
    } catch (error) {
        console.log(error.message);
    }
}

const editUserdetails = async (req,res) =>{
    try {
        const user = await User.findOne({_id : req.session.user_id})
        res.render('edit-userdetails',{user})
    } catch (error) {
        console.log(error.message);
    }
}

const updatUserdetails = async (req,res) =>{
try {
   
    const user = await User.findOne({_id : req.session.user_id}) 
     const check = await User.findOne({email : req.body.email})
     const check1 = await User.findOne({mobile : req.body.mobile})
    
    if(check){
        if(check.email===user.email ){
            await User.findByIdAndUpdate(req.session.user_id,{
                $set : {
                    username : req.body.username,
                    email : req.body.email,
                    mobile : req.body.mobile
                }
            })
            res.redirect('/userprofile')
        }else{
            const user = await User.findOne({_id : req.session.user_id})
          return  res.render('edit-userdetails',{msg : 'email is already exist!..',user})
        }
    } else if(check1){
         if(check1.mobile===user.mobile){
            await User.findByIdAndUpdate(req.session.user_id,{
                $set : {
                    username : req.body.username,
                    email : req.body.email,
                    mobile : req.body.mobile
                }
            })
            res.redirect('/userprofile')
        }else{
            const user = await User.findOne({_id : req.session.user_id})
            return res.render('edit-userdetails',{msg : 'Mobile No already exist!!..',user})
        }
    }
    

} catch (error) {
    console.log(error.message);
}
}


const loadChangePass = async(req,res)=> {
    try {
        res.render('user-changePass')
    } catch (error) {
        console.log(error.message);
    }
}

const changePassword = async (req,res)=> {
    try {
        const user = await User.findOne({_id : req.session.user_id})
        const password = req.body.oldpassword
        const spassword = await securePassword(req.body.newpassword);
        

        const matchPassword = await bcrypt.compare(password,user.password) 
       
        if(matchPassword){
             const userdata = await User.updateOne({email : user.email},
                { $set : {password : spassword}})
                if(userdata){
                res.redirect('/userprofile')
                }
              
        }  else{
            res.render('user-changePass',{msg : "current password is incorrect"})
        }                  
    } catch (error) {                       
        console.log(error.message);
    }
}

const Loadmanageadd = async (req,res) =>{
    try {
        const user = await User.findOne({_id : req.session.user_id})
        res.render('manage-address',{user})
    } catch (error) {
        console.log(error.message);
    }
}

const LoadAddaddress = async (req,res) =>{
    try {
        res.render('add-address')
    } catch (error) {
        console.log(error.message);
    }
}

const Addaddress = async (req,res) =>{
    try {
        const id = req.session.user_id
        
        const address ={
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

      res.redirect('/manageaddress')

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
        
        res.render('edit-address',{address : getaddress})
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
            res.redirect('/manageaddress')
        }
    } catch (error) {
       console.log(error.message); 
    }
}

const DeleteAddress = async (req,res)=>{
    try {
       
           const id = parseInt(req.query.id);
           const updateduser = await User.findByIdAndUpdate(req.session.user_id,
            {$pull:{
                address : {id:id}
            }},
            {new:true})


            const user = await User.findOne({_id : req.session.user_id})
            res.render('manage-address',{user})

    } catch (error) {
       console.log(error.message); 
    }
}



 module.exports = {
    userProfile,
    editUserdetails,
    loadChangePass,
    changePassword,
    updatUserdetails,
    Loadmanageadd,
    LoadAddaddress,
    Addaddress,
    LoadEditAdd,
    EditAddress,
    DeleteAddress


}