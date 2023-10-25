const Category = require('../model/categoryModel')


const loadCategory = async (req,res)=>{
    try {
        res.render('page-categories')
    } catch (error) { 
        console.log(error.message);
    }
}

const addCategory = async (req,res)=>{
    try {
        const existed = await Category.findOne({
            category_name: { $regex: req.body.category_name, $options: "i"}
        })
        if(existed){
            res.render('page-categories',{msg:"category already exist!.."})
        }else{
            const category = new Category ({
                category_name: req.body.category_name,
                category_logo: req.file.filename,
                is_listed: false
            })
            const newCategory = await category.save()
    
            if(newCategory){
                res.render("page-categories",{msg:"new category added"})
            }else{
                res.render("page-categories",{msg:"failed to add category"})
    
            }
    }
 
    }catch (error) {
        console.log(error.message);
    }
}

const categoryList = async(req,res)=>{
    try {
      
        const category = await Category.find({})
        res.render('category-list',{category})
    } catch (error) {
        console.log(error.message);
    }
}

const listCategory = async (req,res)=>{
    try {
        const id = req.query.id
        const categorylist = await Category.findByIdAndUpdate({_id : id },{$set : {is_listed : true }})
        res.redirect('/admin/categorylist')
    } catch (error) {
        console.log(error.message);
    }
}

const unlistCategory = async (req,res) =>{
    try {
        const id = req.query.id
        const categorylist = await Category.findByIdAndUpdate({_id : id},{ $set : { is_listed : false}})
        res.redirect('/admin/categorylist')

    } catch (error) {
        console.log(error.message);
    }
}

const editCategory = async (req,res)=>{
    try {
        const id = req.query.id
        const category = await Category.find({_id:id})
        res.render('edit-category',{category})
    } catch (error) {
        console.log(error.message);
    }
}

const updateCategory = async (req,res)=>{
    try {
        let check = await Category.findOne({category_name: {$regex:req.body.category_name , $options : "i" }})
        if(check){
            const category = await Category.find({_id:req.body.id})
          return  res.render('edit-category',{msg:"category already exist!...",category})
        }else{
        if(req.file){
        const category = await Category.findByIdAndUpdate({_id : req.query.id},{
            $set : {
                category_name:req.body.category_name,
                category_logo:req.file.filename
    }})
    if(category){
        res.redirect('/admin/categorylist')
    }else{
        res.render('edit-category',{msg:"category update failed"})
    }
}else{
    const category = await Category.findByIdAndUpdate({_id : req.query.id},{
        $set : {
            category_name:req.body.category_name
           
}})
if(category){
    res.redirect('/admin/categorylist')
}else{
    res.render('edit-category',{msg:"category update failed"})
}

}
}
    
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadCategory,
    addCategory,
    categoryList,
    listCategory,
    unlistCategory,
    editCategory,
    updateCategory
}