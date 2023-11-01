const express = require('express')
const admin_router = express()
const session = require('express-session')
const bodyParser = require('body-parser')
const nocache = require('nocache')
const multer = require('multer')


admin_router.set('view engine','ejs')
admin_router.set('views','./views/admin')


const config = require('../config/config')
const adminController = require('../controller/adminController')
const categoryController = require('../controller/categoryController')
const productController = require('../controller/productController')
const adminOrderController = require('../controller/adminOrderController')
const couponController = require('../controller/couponController')
const adminauth = require('../middleware/adminauth')
const { isLogin } = require('../middleware/userauth')

admin_router.use(express.static('public'))
admin_router.use(bodyParser.json())
admin_router.use(bodyParser.urlencoded({extended:true}))
admin_router.use(nocache())
admin_router.use(session({
    secret:config.sessionSecret,
    saveUninitialized:true,
    resave:false
}))


//multer......

const productStorage = multer.diskStorage({ 
    destination: (req,file,callback)=>{
        callback(null,'./public/admin-assets/uploads')
    },

    //extention
    filename: (req,file,callback)=>{
        callback(null,Date.now()+file.originalname)
    }
})

//upload parameters for multer
const uploadprdt = multer({
    storage : productStorage,
    limits : {
        fileSize : 1024*1024*5
    }
})




//admin login & logout
admin_router.get('/',adminauth.isLogout,adminController.loadAdminLogin)
admin_router.post('/admin',adminController.verifyLogin)
admin_router.get('/dashboard',adminauth.isLogin,adminController.loadDashboard)
admin_router.get('/adminlogout',adminauth.isLogin,adminController.adminLogout)

//user management
admin_router.get('/userlist',adminauth.isLogin,adminController.loadUserList)
admin_router.get('/blockuser',adminauth.isLogin,adminController.blockUser)
admin_router.get('/unblockuser',adminauth.isLogin,adminController.unblockUser)

//category
admin_router.get('/category',adminauth.isLogin,categoryController.loadCategory)
admin_router.post('/category',adminauth.isLogin,uploadprdt.single("category_logo"),categoryController.addCategory)
admin_router.get('/categorylist',adminauth.isLogin,categoryController.categoryList)
admin_router.get('/listcategory',adminauth.isLogin,categoryController.listCategory)
admin_router.get('/unlistcategory',adminauth.isLogin,categoryController.unlistCategory) 
admin_router.get('/editcategory',adminauth.isLogin,categoryController.editCategory)
admin_router.post('/editcategory',adminauth.isLogin,uploadprdt.single("category_logo"),categoryController.updateCategory)

//product
admin_router.get('/product',adminauth.isLogin,productController.loadAddProduct)
admin_router.post('/product',uploadprdt.array("image"),productController.addProduct)
admin_router.get('/productlist',productController.loadProductList) 
admin_router.get('/listproduct',productController.listProduct)
admin_router.get('/unlistproduct',productController.unlistProduct)
admin_router.get('/editproduct',productController.editProduct)
admin_router.post('/editproduct',uploadprdt.array('image'),productController.updateProduct)
admin_router.get('/imagedelete',adminauth.isLogin,productController.deleteImage)


admin_router.get('/addcoupon',adminauth.isLogin,couponController.loadAddCoupon)
admin_router.post('/addcoupon',adminauth.isLogin,couponController.addCoupon)
admin_router.get('/couponlist',adminauth.isLogin,couponController.couponList)
admin_router.get('/deletecoupon',couponController.deleteCoupon)
admin_router.get('/editcoupon',couponController.editCoupon)
admin_router.post('/editcoupon',couponController.updateCoupon)

admin_router.get('/orderlist',adminOrderController.loadOrderList)
admin_router.get('/order-details',adminauth.isLogin,adminOrderController.orderDetails)
admin_router.post('/statusupdate',adminauth.isLogin,adminOrderController.orderStatus)


admin_router.get('/addbanner',adminauth.isLogin,adminController.loadAddBanner)
admin_router.post('/addbanner',uploadprdt.single("banner"),adminController.addBanner)
admin_router.get('/bannerlist',adminauth.isLogin,adminController.bannerList)


admin_router.get('/loadsales-report',adminauth.isLogin,adminController.loadSalesReport)
admin_router.get('/sales-report',adminauth.isLogin,adminController.salesReport)

        
module.exports = admin_router