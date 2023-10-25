const Product = require('../model/productModel')
const Category = require('../model/categoryModel')

const loadAddProduct = async (req,res)=>{
    try {
        const category = await Category.find({})
        res.render('add-product',{category})
    } catch (error) {
        console.log(error.message);
    }
}


const addProduct = async (req,res)=>{
    try {
        const category = await Category.find({is_listed : false})
        let image=[]
        for(let i=0 ; i<req.files.length;i++){
            image.push(req.files[i].filename)
        }
      
            const product = new Product({
                product_name : req.body.product_name,
                og_price : req.body.og_price,
                offer_price : req.body.offer_price,
                stock : req.body.stock,
                description : req.body.description,
                image : image,
                category : req.body.category,
                is_listed : false
            })
            await product.save()



            res.render('add-product',{msg:"New Product Added!...",category})
        
        
    } catch (error) {
       console.log(error.message); 
    }
}

const loadProductList = async (req,res)=>{
    try {
        let page = parseInt(req.query.page)
        let limit = 10
        let skip = page*10

        const product = await Product.find({}).skip(skip).limit(limit)
        res.render('product-list',{product,page})
    } catch (error) {
        console.log(error.message);
    }
}

const listProduct = async (req,res)=>{
    try {
        const id = req.query.id
        const listproduct= await Product.findByIdAndUpdate({_id:id},{ $set : {is_listed : true}})
        res.redirect('/admin/productlist') 
    } catch (error) {
        console.log(error.message);
    }
}

const unlistProduct = async (req,res)=>{
    try {
        const id = req.query.id
        const listproduct= await Product.findByIdAndUpdate({_id:id},{ $set : {is_listed : false}})
        res.redirect('/admin/productlist') 
    } catch (error) {
        console.log(error.message);
    }
}

const editProduct = async (req,res)=>{
    try {
        
        const id = req.query.id
        req.session.temp = id

        const product = await Product.find({_id:id})
        const category = await Category.find({})
        res.render('edit-product',{product,category})
    } catch (error) {
        console.log(error.message);
    }
}

const updateProduct = async (req,res)=>{
    try {
        const id = req.query.id    
        let image=[]
        const product = await Product.findOne({_id : id})
        for(let i=0;i<req.files.length;i++){
            image.push(req.files[i].filename)
        }   
        
        for(let i=0;i<product.image.length;i++){
            image.push(product.image[i])
        }
                                          
        if(req.files.length>=1){
        const updateproduct = await Product.findByIdAndUpdate({_id : id},{
            $set : {
                product_name : req.body.brand_name,
                og_price : req.body.og_price,
                offer_price : req.body.offer_price,
                stock : req.body.stock,
                description : req.body.description,
                image : image,
                category : req.body.category
            }
        })
        if(updateproduct){
            res.redirect('/admin/productlist')
            }else{
                res.render('product-edit',{msg:"product update failed!..."})
            }
        }else{
            const product = await Product.findByIdAndUpdate({_id : id},{
                $set : {
                    product_name : req.body.brand_name,
                    og_price : req.body.og_price,
                    offer_price : req.body.offer_price,
                    stock : req.body.stock,
                    description : req.body.description,
                    category : req.body.category

                }
            })
            if(product){
                res.redirect('/admin/productlist')
                }else{
                    res.render('product-edit',{msg:"product update failed!..."})
                }
        }
       
    } catch (error) {
        console.log(error.message);
    }
}

const deleteImage = async (req,res)=>{
    try {
        const id = req.query.id
        const image_id = req.query.image_id
      
        const category = await Category.find({})
        const product1 = await Product.findByIdAndUpdate(id,{$pull : {image : image_id}},
            {new : true})
        const product = await Product.find({_id:id})

            res.render('edit-product',{product,category})
    } catch (error) {
      console.log(error.message);  
    }
}




module.exports = {
    loadAddProduct,
    addProduct,
    loadProductList,
    listProduct,
    unlistProduct,
    editProduct,
    updateProduct,
    deleteImage
}



