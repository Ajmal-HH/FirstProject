const pathArg = require('mkdirp/lib/path-arg');
const User = require('../model/userModel')
const bcrypt = require('bcrypt');
const { rawListeners } = require('../router/adminRouter');
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const PendingUser = require('../model/pendingUserModel')
const Banner = require('../model/bannerModel')



const accountSid = "AC5523bdf0744cb6957bbeb41640bc9d10";
const authToken = "a55ab704b1208cc7fe510a9ae5475c33";
const verifySid = "VA1201188a5b9cbda2e261883ca8efd120";
const client = require("twilio")(accountSid, authToken);



const securePassword = async (password)=>{    
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

//signupLoading

const signupLoad = async (req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const pendinUser = async (req,res) =>{
    try {
        const check = await User.findOne({email : req.body.email})
        if(check){
            return
        }else{
           const Puser = new PendingUser({
            username : req.body.username,
            email : req.body.email,
            mobile : req.body.mobile
           })
           Puser.save()
        }
    } catch (error) {
        console.log(error.message);
    }
}

const verifyValidation = async(req,res)=>{
    
    
        const email =req.body.email
        const mobile = req.body.mobile
        req.session.mobile = mobile

        const check = await User.findOne({email:req.body.email})
        if(check){
            return res.render('login',{msg:"user already exist!.. please login"})
        }

        client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${mobile}`, channel: "sms", })
        .then((verification) => {
            console.log(verification.status)
            req.session.userData = req.body;

            //save user data before validation
            const Puser = new PendingUser({
                username : req.body.username,
                email : req.body.email,
                mobile : req.body.mobile
               })
               Puser.save()

            res.render('verifyOTP')
        })
        .catch((error) => {
            console.log(error.message)
        })
}

const resendOTP = async (req, res) => {
    const mobile = req.session.mobile



    client.verify.v2
    .services(verifySid)
    .verifications.create({ to: `+91${mobile}`, channel: "sms", })
    .then((verification) => {
        console.log(verification.status)
        res.render('verifyOTP')
    }).catch((error) => {
            console.log(error.message);
            // Handle the error and send an appropriate response
            res.status(500).send("Failed to resend OTP");
        });
};

const verifyOtp = async (req, res) => {
    let {otp}  = req.body;
    otp=otp.join('')
   
    try {
        const userData = req.session.userData;

        if (!userData) {
            res.render('verifyOTP', { msg: 'Invalid Session' });
        } else {
            client.verify.v2
                .services(verifySid)
                .verificationChecks.create({ to: `+91${userData.mobile}`, code: otp })
                .then(async (verification_check) => { // Mark the callback function as async
                    console.log(verification_check.status);
                    if(verification_check.status==='approved'){
                    const spassword = await securePassword(userData.password);
                    const user = new User({
                        username : userData.username,
                        email : userData.email,
                        mobile : userData.mobile,
                        password : spassword,
                        is_block : 0,
                        wallet : 0 , 
                        date : Date.now()
                    })

                    //deleting pending user data because user is registered
                    const Puser = await PendingUser.findOne({email : userData.email})
                    if(Puser){
                       await PendingUser.deleteOne({email : Puser.email})
                    }

                    try {
                        const userDataSave = await user.save();
                        if (userDataSave) {
                            res.redirect('/');
                        } else {
                            res.render('login', { msg: "Registration Failed" });
                        }
                    } catch (error) {
                        console.log(error.message);
                        res.render('login', { msg: "Registration Failed" });
                    }
                  }else{
                    res.render('verifyOTP',{msg:"invalid otp"})
                  }
                }).catch((error) => {
                    console.log(error.message);
                });
        }
    } catch (error) {
        console.log(error.message);
    }
};


//load login...
const loadLogin = async (req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

//Verify Login.....

const verifyLogin = async (req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        const userData = await User.findOne({email:email})

        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                if(userData.is_block===0){
                req.session.user_id = userData._id
                
                res.redirect('/homepage')
                }else{
                    res.render('login',{msg:"you are blocked by admin"})
                }
                
            }else{
                res.render('login',{msg:"username and password is incorrect"})
            }
        }else{
            res.render('login',{msg:"Invalid User"})
        }
        
    } catch (error) {
        console.log(error.message);
    }

}

//homepage...

const homepage = async (req,res)=>{
    try {
        const product = await Product.find({is_listed : false})
        const banner = await Banner.find()
        res.render('homepage',{product,banner}) 
    } catch (error) {
        console.log(error.message);
    }
}

//Logout

const logout = async (req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}

//load shop


const loadShop = async (req,res)=>{
    try {
        
        let page = parseInt(req.query.page)
        let limit = 6
        let skip = page*6
        const product = await Product.find({is_listed : false}).skip(skip).limit(limit)
        const category = await Category.find()

        res.render('shop',{product,category,page})
    } catch (error) {
        console.log(error.message);
    }
}

const viewProductDetails = async (req,res)=>{
    try {
        const id = req.query.id
        const product = await Product.findById(id)
        res.render('shop-details',{product})
    } catch (error) {
        console.log(error.message);
    }   

    
} 

const forgotPassword = async (req,res)=>{
    try {
        res.render('forgotPassword')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyForgPas = async (req,res) =>{
    try {
          req.session.otpmobile = req.body.mobile
      const check = await User.findOne({mobile : req.body.mobile})
      const mobile = check.mobile
        if(check){     
            client.verify.v2
            .services(verifySid)
            .verifications.create({ to: `+91${mobile}`, channel: "sms", })
            .then((verification) => {
                console.log(verification.status)
                req.session.userData = req.body;
                res.render('forgot-verify')
            })
        }else{
            res.render('login',{msg:"Mobile Number is not registered"})
        }
    } catch (error) {
       console.log(error.message); 
    }
} 

const forgverifyOtp = async (req, res) => {
    
    try {
        let {otp}  = req.body;
        otp=otp.join('')
        const userData = req.session.userData;

        if (!userData) {
            res.render('verifyOTP', { msg: 'Invalid Session' });
        } else {
            client.verify.v2
                .services(verifySid)
                .verificationChecks.create({ to: `+91${userData.mobile}`, code: otp })
                .then(async (verification_check) => { // Mark the callback function as async
                    console.log(verification_check.status);

                    if(verification_check.status =='approved'){
                       res.redirect('/changepas')
                  }else{
                    res.render('verifyOTP',{msg:"invalid otp"})
                  }
                }).catch((error) => {
                    console.log(error.message);
                });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const setNewPassword = async (req,res) => {
    try {
        res.render('changePassword')
    } catch (error) {
        console.log(error.message);
    }
}

const UpdateNewPassword = async (req,res) =>{
    try {
        const mobile = req.session.otpmobile
        const spassword = await securePassword(req.body.password);

        if(req.password === req.repassword){
            const user = await User.updateOne({mobile : mobile},
               { $set : { password : spassword}})

               res.render('login',{msg:"Password changed successfully plzz login"})
        }
    } catch (error) {
        console.log(error.message);
    }
}



const FilterProduct = async (req,res) =>{
    try {
        let page = parseInt(req.query.page)
        let limit = 6
        let skip = page*6
        const id = req.query.id
        const category = await Category.find({})
        const product = await Product.find({category : id})
        if(product){
        res.render('shop',{product,category,page})
        }else{
            console.log('category not found');
        }
    } catch (error) {
        console.log(error.message);
    }
} 


const searchProducts = async (req,res)=>{
    try {
        const search = req.body.search
        let page = parseInt(req.query.page)
        let limit = 6
        let skip = page*6
        const category = await Category.find({})
        const product1 = await Product.find().skip(skip).limit(limit)
        const product = await Product.find({"product_name":{ $regex:".*"+search+"*.",$options:'i' } }).skip(skip).limit(limit)
        if(product.length>0){
           res.render('shop',{product,category,page})
        }

    } catch (error) {
        console.log(error.message);
    }
 }

 const sortLowToHigh = async (req,res) =>{
    try {

        console.log('lowto high');
        const category = await Category.find({})
        let page = parseInt(req.query.page)
        let limit = 6
        let skip = page*6
        const lowtohigh = {price : 1}

        const product = await Product.find({is_listed : false}).sort(lowtohigh).skip(skip).limit(limit)

        res.render('shop',{product,category,page})
    } catch (error) {
        console.log(error.message);
    }
 }


 const sortHighToLow = async (req, res) => {
    try {
        console.log('hightolow');
        const category = await Category.find({});
        let page = parseInt(req.query.page);
        let limit = 6;
        let skip = page * 6;
        const highToLow = { price: -1 }; 

        const product = await Product.find({ is_listed: false }).sort(highToLow).skip(skip).limit(limit);
        res.render('shop', { product, category, page });
    } catch (error) {
        console.log(error.message);
    }
}

const aboutPage = (req,res)=>{
    try {
        res.render('about')
    } catch (error) {
        console.log(error.message);
    }
}

const Contact = async (req,res) =>{
    try {
        res.render('contact')
    } catch (error) {
        console.log(error.message);
    }
}







module.exports = {
    signupLoad,
    loadLogin,
    pendinUser,
    resendOTP ,
    verifyLogin,
    homepage,
    logout,
    loadShop,
    viewProductDetails,
    verifyValidation,
    verifyOtp,
    forgotPassword,
    verifyForgPas,
    forgverifyOtp,
    setNewPassword,
    UpdateNewPassword,
    FilterProduct,
    searchProducts,
    sortLowToHigh,
    sortHighToLow,
    aboutPage,
    Contact
    
    
}