const User = require('../model/userModel')
const Cart = require('../model/cartModel')
const Order = require('../model/orderModel')
const Product = require('../model/productModel')
const Coupon = require('../model/couponModel')
const mongodb = require('mongodb')
const Razorpay = require('razorpay')
const { default: mongoose } = require('mongoose')
const easyinvoice = require('easyinvoice');
const {Readable} = require('stream')



let instance = new Razorpay({
    key_id: process.env.RAZOR_PAY_ID_KEY,
    key_secret: process.env.RAZOR_PAY_SECRET_KEY,
});



const orderDetails = async (req,res) =>{
    try {
        let data = req.body
        let add = data.address
        add = parseInt(add)

        if(add){
        const oid = new mongodb.ObjectId(req.session.user_id)
        const user  = await User.aggregate([
            {
                $match : {_id :oid}
            },
            {
                $unwind : '$address'
            }, 
            {
                $match : {'address.id' : add}
            }
        ])  
       const cart = await Cart.findOne({user_id : req.session.user_id})

            const order = new Order({
            user_id : req.session.user_id,
            user_name : user[0].username,
            order_date : Date.now(),
            order_address : user[0].address,
            delivery_status : 'pending', 
            total_price : req.body.total,
            payment_type : req.body.payment_method,
            product_details : cart.cart_items
        })
        await order.save()

       
        for(let i=0;i<order.product_details.length;i++){
            const product = await Product.findByIdAndUpdate({_id : order.product_details[i].product_id},{
                $inc : {stock : -order.product_details[i].quantity}
            })
        }
      
        if(order.payment_type == 'cod'){
            res.json({cod:true})
        }else if(order.payment_type == 'Razorpay'){
            let options = {
                amount: req.body.total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+order.id
              };
              instance.orders.create(options, function(err, order) {
                if(err){
                    console.log("Error while creating order : ",err)
                }else{
                    res.json({order:order , razorpay:true})
                }
            });
        }else if(order.payment_type == 'Wallet'){
            const user = await User.findOne({_id : req.session.user_id})
            const total = req.body.total

                await User.findByIdAndUpdate({_id : req.session.user_id},{
                    $inc : {wallet : -total}
                })
                res.json({wallet : true})
            

        }
        const id = new mongodb.ObjectId(req.session.user_id)
        const cart_del = await Cart.deleteOne(
            { user_id: id}
          );
     }

    } catch (error) {
        console.log(error.message); 
    }
}



const updateOrder = async (req,res)=>{
    try {
        const id = new mongodb.ObjectId(req.session.user_id)
       const users=await User.findOne({_id:id})
        const order = await Order.updateOne({user_id:id},{$set : {payment_type :'COD'}})
    } catch (error) {
        console.log(error.message);
    }
}

const loadOrderlist = async (req,res)=>{
    try {
        let page = parseInt(req.query.page)
        let limit = 6
        let skip = page*6
        const id = new mongodb.ObjectId(req.session.user_id)

        const data = await User.findOne({_id:req.session.user_id})

        const order = await Order.find({user_id : id}).skip(skip).limit(limit)
        res.render('order-list',{order,data,page})
    } catch (error) {
        
    }
}

const orderListDetails = async (req,res)=>{
    try {
       const id = req.query.id
       const orders = await Order.find({_id : id})

        res.render('orderdetails',{orders})
    } catch (error) {
        console.log(error.message);
    }
}

const cancleOrder = async (req,res)=>{
    try {
        const id = req.body.orderId
        const user_id = req.session.user_id
        
       const order = await Order.findByIdAndUpdate({_id : id},
        {$set : {delivery_status : 'Cancle'}})
        res.json({status:true})


        if(id.payment_type!=='cod'){
            const wallet = await User.findByIdAndUpdate({_id : user_id},{
                $inc : {wallet : +order.total_price}
            })
        }
        
    } catch (error) {  
        console.log(error.message);
    }
}

const orderSuccessfully = async (req,res)=>{
    try {
        res.render('order-placed')
    } catch (error) {
        console.log(error.message);
    }
}

const rozorpay = async (req,res)=>{
    try {
        console.log("I am heree" , req.session.OrderId)
        let options = {
            amount: req.body.total*100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: ""+order._id
          };
          instance.orders.create(options, function(err, order) {
            if(err){
                console.log("Error while creating order : ",err)
            }else{
                res.json({order:order , razorpay:true})
            }
        });
    } catch (error) {
        console.log(error)
    }
}
const VerifyPayment = async(req,res)=>{
    try{
        details = req.body;
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256' , 'Y0UJeyTaRLN1dWjpxoPVn4tP')
        hmac.update(details['response[razorpay_order_id]']+'|'+details['response[razorpay_payment_id]'])
        hmac = hmac.digest('hex');
        res.json({status:true});

    }catch{
        console.log("Catch error")
    }
}


const returnOrder = async (req,res)=>{
    try {
        const user_id = req.session.user_id
        const text = req.body.text
        const order_id = req.body.order_id
        const payment = req.body.payment
        const total = req.body.total

        const order = await Order.findByIdAndUpdate({_id : order_id},
            {$set : {return_reason : text,delivery_status : 'Requested For Return'}})

            res.json({status : true})

    } catch (error) {
        
    }
}      

const wallet = async (req,res) =>{
    try {
        const user=  await User.findOne({_id : req.session.user_id })
        res.render('wallet',{user})
    } catch (error) {
        console.log(error.message);
    }
}


const downloadInvoice = async (req, res) => {
        try {
                const id = req.query.id;
                const userId = req.session.user_id;
                const result = await Order.findById({ _id: id }); 
                const user = await User.findById({ _id: userId });      
                const address = result.address
                const order = {
                  id: id,
                  total: result.total_Price,
                  date: result.order_date, // Use the formatted date
                  paymentMethod: result.payment_type,
                  orderStatus: result.delivery_status,
                  name: result.order_address.name,
                  number: result.order_address.mobile,
                  house:result.order_address.homeaddress,
                  pincode: result.order_address.postcode,
                  town: result.order_address.city,
                  state: result.order_address.state,
                  product: result.product_details,
                };
                //set up the product
                let oid = new mongodb.ObjectId(id)
                let Pname =  result.product_details.product_name
                    
                const products = order.product.map((product,i) => ({
                        quantity: parseInt(product.quantity),
                        description: product.product_name,
                        price: parseInt(product.offer_price),
                        total: parseInt(result.total_price),
                        "tax-rate": 0,

                      }));
                 
                
               
                      
                const isoDateString = order.order_date;
                const isoDate = new Date(isoDateString);
            
                const options = { year: "numeric", month: "long", day: "numeric" };
                const formattedDate = isoDate.toLocaleDateString("en-US", options);
                const data = {
                  customize: {
                    //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
                  },
                  images: {
                    // The invoice background
                    background: "",
                  },
                  // Your own data
                  sender: {
                    company: "TWO SECONDZ",
                    address: "Feel your Style",
                    city: "Bangalore",
                    country: "India"
                  },
                  client: {
                    company: "Customer Address",
                    "zip": order.name,
                    "city": order.town,
                    "address": order.house,
                    // "custom1": "custom value 1",
                    // "custom2": "custom value 2",
                    // "custom3": "custom value 3"
                  },
                  information: {
                    number: "order" + order.id,
                    date: result.order_date.toLocaleDateString(),
                  },
                  products: products,
                  "bottom-notice": "Happy shoping and visit Two Secondz again",
                };
            let pdfResult = await easyinvoice.createInvoice(data);
                const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");
            
                // Set HTTP headers for the PDF response
                res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
                res.setHeader("Content-Type", "application/pdf");
            
                // Create a readable stream from the PDF buffer and pipe it to the response
                const pdfStream = new Readable();
                pdfStream.push(pdfBuffer);
                pdfStream.push(null);
            
                pdfStream.pipe(res);
              } catch (error) {
                console.log(error);
                res.status(500).json({ error: error.message });
              }
      
    };
   



module.exports = {
    orderDetails,
    updateOrder,
    loadOrderlist,
    orderListDetails,
    cancleOrder ,
    orderSuccessfully,
    rozorpay,
    VerifyPayment,
    returnOrder,
    wallet,
    downloadInvoice
}