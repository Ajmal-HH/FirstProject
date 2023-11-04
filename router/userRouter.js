const express = require('express')
const user_router = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const nocache = require('nocache')

user_router.set('view engine','ejs')
user_router.set('views','./views/user')

user_router.use(bodyParser.json())
user_router.use(bodyParser.urlencoded({extended:true}))
user_router.use(nocache())

const userController = require('../controller/userController')
const config = require('../config/config')
const auth = require('../middleware/userauth')
const { adminLogout } = require('../controller/adminController')
const profileController = require('../controller/profileController')
const cartController = require('../controller/cartController')
const quantityUpdateController = require('../controller/quantityUpdateController')
const orderController = require ('../controller/orderController')
const couponController = require('../controller/couponController')
const wishListController = require('../controller/wishlistController')
const { isLogin } = require('../middleware/adminauth')

user_router.use(session({
    secret:config.sessionSecret,
    saveUninitialized:true,
    resave:false
}))

user_router.get('/signup',auth.isLogout,userController.signupLoad) 
user_router.post('/verifyvalidation',userController.verifyValidation)
user_router.post('/verifyOtp',userController.verifyOtp)
user_router.get('/resendotp', userController.resendOTP);



// user_router.get('/',auth.isLogout,userController.loadLogin)
user_router.get('/login',auth.isLogout,userController.loadLogin)
user_router.post('/login',userController.verifyLogin)
user_router.get('/',userController.homepage)
user_router.get('/homepage',userController.homepage)
user_router.get('/about',userController.aboutPage)
user_router.get('/contact',userController.Contact)


user_router.get('/forgotpassword',userController.forgotPassword)
user_router.post('/forgotpassword',userController.verifyForgPas)
user_router.post('/forgot-verifyOtp',userController.forgverifyOtp)
user_router.get('/changepas',userController.setNewPassword)
user_router.post('/forgnewpas',userController.UpdateNewPassword)


user_router.get('/userprofile',auth.isLogin,auth.is_blocked,profileController.userProfile)
user_router.get('/changepassword',auth.isLogin,auth.is_blocked,profileController.loadChangePass)
user_router.post('/changepassword',profileController.changePassword)
user_router.get('/editprofile',auth.isLogin,profileController.editUserdetails)
user_router.post('/updateuser',auth.isLogin,profileController.updatUserdetails)

user_router.get('/manageaddress',auth.isLogin,auth.is_blocked,profileController.Loadmanageadd)
user_router.get('/addaddress',auth.isLogin,profileController.LoadAddaddress)
user_router.post('/addaddress',profileController.Addaddress)
user_router.get('/editaddress',auth.isLogin,profileController.LoadEditAdd)
user_router.post('/editaddress',profileController.EditAddress)
user_router.get('/deleteaddress',profileController.DeleteAddress)


user_router.get('/shop',userController.loadShop)
user_router.get('/shopdetails',userController.viewProductDetails)
user_router.get('/category-filter',auth.isLogin,userController.FilterProduct)
user_router.post('/searchproduct',userController.searchProducts)
user_router.get('/lowtohigh',userController.sortLowToHigh)
user_router.get('/hightolow',userController.sortHighToLow)

user_router.get('/loadcat',auth.isLogin,auth.is_blocked,cartController.LoadCart)
user_router.get('/addtocart',auth.isLogin,auth.is_blocked,cartController.AddToCart)
user_router.post('/changeqnty/:id',quantityUpdateController.updatecart)
user_router.delete('/delete-cart-item',auth.isLogin,cartController.deleteCartItem)
user_router.get('/checkout',auth.isLogin,auth.is_blocked,cartController.loadCheckOut)
user_router.get('/edit-address-check',auth.isLogin,cartController.LoadEditAdd)
user_router.post('/checkout',cartController.EditAddress)
user_router.post('/addaddress-checkout',cartController.Addaddress)
user_router.post('/stock-check' , cartController.CheckStock)


user_router.post('/placeorder',orderController.orderDetails)
user_router.post('/updateorder',auth.isLogin,orderController.updateOrder)
user_router.get('/loadorderlist',auth.isLogin,auth.is_blocked,orderController.loadOrderlist)
user_router.get('/orderdetails',auth.isLogin,auth.is_blocked,orderController.orderListDetails)
user_router.post('/cancelorder',orderController.cancleOrder)
user_router.get('/orderplaced',auth.isLogin,orderController.orderSuccessfully)
user_router.post('/razorpay',orderController.rozorpay)
user_router.post('/verify-razorpay',orderController.VerifyPayment)
user_router.post('/returnorder',orderController.returnOrder)
user_router.get('/wallet',auth.isLogin,auth.is_blocked,orderController.wallet)
user_router.get('/invoice',auth.isLogin,orderController.downloadInvoice)

user_router.post('/coupon',auth.is_blocked,couponController.couponDiscount)

user_router.get('/addtowishlist',wishListController.addToWishList)
user_router.get('/wishlist',auth.isLogin,wishListController.wishList)
user_router.delete('/delete-wishlist-item',auth.isLogin,wishListController.deleteWishListItem)




user_router.get('/logout',auth.isLogin,userController.logout)   

 

module.exports = user_router

