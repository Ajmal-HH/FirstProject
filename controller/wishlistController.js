const Wishlist = require('../model/wishlistModel')
const Product = require('../model/productModel')





const addToWishList = async (req,res)=>{
    try {
        const user_id = req.session.user_id
        const product_id = req.query.id
        const product = await Product.findById({_id : product_id})
        const wishlist_items = {
           product_id : product_id,
           product_name : product.product_name,
           offer_price : product.offer_price,
           image : product.image[0]
        }
   
        const findwishlist = await Wishlist.findOne({user_id : user_id})
        if(findwishlist){ 
           const existItem = await findwishlist.wishlist_items.find((item)=>{
               return item.product_id.toString()===product_id.toString()
           })
           if(existItem){
            
           }else{
               findwishlist.wishlist_items.push(wishlist_items)
               await findwishlist.save()
           }
        }else{
           const newitem = new Wishlist({
               user_id : user_id,     
               wishlist_items : []
           }) 
           newitem.wishlist_items.push(wishlist_items)
           await newitem.save() 
        }
      
    } catch (error) {
       console.log(error.message);
    }
}


const wishList = async (req,res) =>{
    try {
        const wishlist = await Wishlist.findOne({user_id : req.session.user_id})
        res.render('wishlist',{wishlist})
    } catch (error) {
        console.log(error.message);
    }
}
   

const deleteWishListItem = async (req,res)=>{
    try {
        const user_id = req.session.user_id
        const id = req.query.id  

        const wishList = await Wishlist.findOneAndUpdate(
            { user_id: user_id },
            { $pull: { wishlist_items: { product_id: id } } },
            { new: true }
          );
          if(wishList){    
            return res.json({status : true})
        } else {
          res.send("not found");
          }
    } catch (error) {
       console.log(error.message); 
    }
 }


module.exports = {
    addToWishList,
    wishList,
    deleteWishListItem
}