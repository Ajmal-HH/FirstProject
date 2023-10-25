const Admin = require('../model/adminModel')
const User = require('../model/userModel')
const Banner = require('../model/bannerModel')
const Product = require('../model/productModel')
const bcrypt =require('bcrypt')
const Order = require('../model/orderModel')
const easyinvoice = require('easyinvoice')
const {Readable} = require('stream')



const loadAdminLogin = async (req,res)=>{
    try {
        res.render('adminlogin') 
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req,res)=>{
    try {
        const adminname = req.body.adminname
        const password = req.body.password
        const adminData = await Admin.findOne({adminname:adminname})

        if(adminData){
            const passwordMatch = await bcrypt.compare(password,adminData.password)
            
            if(passwordMatch){
                req.session.admin_id = adminData.adminname
                res.redirect('/admin/dashboard')
            }else{
                res.render('adminlogin',{msg:"admin name and password incorrect"})
            }
        }else{
            res.render('adminlogin',{msg:"admin name and password incorrect"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async (req,res)=>{
    try {
        const orderlength = await Order.find({delivery_status : "Delivered"})
        const product = await Product.find()
        const order = await Order.find({
            $or: [
              { payment_type: 'Wallet' },
              { payment_type: 'Razorpay' },
              {delivery_status: 'Delivered'}
            ]
          });

          //chart report

        const today1 = new Date();
        const currentMonth = today1.getMonth() + 1; // +1 because months are 0-based

       const monthlySales = await Order.aggregate([
        {
         $match: {
         delivery_status: "Delivered",
         order_date: {
         $lte: today1 // Only include orders up to the current date
           }
        }
      },
     {
       $group: {
        _id: {
         $month: '$order_date'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        '_id': 1
      }
    }   
   ]);
     
     const monthlySalesArray = Array.from({ length: currentMonth }, (_, index) => {
       const monthData = monthlySales.find((item) => item._id === index + 1);
       return monthData ? monthData.count : 0;
     });




        const today = new Date();
        const lastYear = new Date(today);
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        
        const monthlySalesPreviousYear = await Order.aggregate([
          {
            $match: {
              delivery_status: "Delivered",
              order_date: {
                $gte: new Date(lastYear.getFullYear() - 1, 0, 1),
                $lt: new Date(lastYear.getFullYear(), 0, 1)
              }
            }
          },
          {
            $group: {
              _id: {
                $month: '$order_date'
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: {
              '_id': 1
            }
          }
        ]);
        
        const monthlySalesArrayPreviousYear = Array.from({ length: 12 }, (_, index) => {
          const monthData = monthlySalesPreviousYear.find((item) => item._id === index + 1);
          return monthData ? monthData.count : 0;
        });


        //pie chart......

        const usersGrowth = await User.aggregate([
            {
                $match: {
                    is_block: 0, //filtered by checking blocked users
                    
                },
            },
            {
                $project: {
                    month: { $month: { $toDate: '$date' } },
                },
            },
            {
                $group: {
                    _id: '$month',
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id': 1,
                },
            },
        ]);
        
        const usersGrowthArray = Array.from({ length: 12 }, (_, index) => {
            const monthData = usersGrowth.find((item) => item._id === index + 1);
            return monthData ? monthData.count : 0;
        });


        //Category Sales report.....

        const IwatchSales = await Order.aggregate([
            {
                $match: {
                    delivery_status: "Delivered", // Filter by status
                    'product_details.category': "I watch" // Match documents where the "category" is "I watch"
                }
            },
            {
                $group: {
                    _id: {
                        $month: '$order_date',
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id': 1,
                },
            },
        ]);
        
        
        let IwatchSalesArray= Array.from({ length: 12 }, (_, index) => {
            const monthData = IwatchSales.find((item) => item._id === index + 1);
            return monthData ? monthData.count : 0;
        });

        IwatchSalesArray = IwatchSalesArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);



        const APSales = await Order.aggregate([
            {
                $match: {
                    delivery_status: "Delivered", // Filter by status
                    'product_details.category': "Audemars Piguet" // Match documents where the "category" is "I watch"
                }
            },
            {
                $group: {
                    _id: {
                        $month: '$order_date',
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id': 1,
                },
            },
        ]);
        
        let APSalesArray= Array.from({ length: 12 }, (_, index) => {
            const monthData = APSales.find((item) => item._id === index + 1);
            return monthData ? monthData.count : 0;
        });
        APSalesArray = APSalesArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);


        const PPSales = await Order.aggregate([
            {
                $match: {
                    delivery_status: "Delivered", // Filter by status
                    'product_details.category': "Patek Philippe" // Match documents where the "category" is "I watch"
                }
            },
            {
                $group: {
                    _id: {
                        $month: '$order_date',
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id': 1,
                },
            },
        ]);
        
        let PPSalesArray= Array.from({ length: 12 }, (_, index) => {
            const monthData = PPSales.find((item) => item._id === index + 1);
            return monthData ? monthData.count : 0;
        });
        PPSalesArray = PPSalesArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);



        const RolexSales = await Order.aggregate([
            {
                $match: {
                    delivery_status: "Delivered", // Filter by status
                    'product_details.category': "Rolex" // Match documents where the "category" is "I watch"
                }
            },
            {
                $group: {
                    _id: {
                        $month: '$order_date',
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id': 1,
                },
            },
        ]);
        
        let RolexSalesArray = Array.from({ length: 12 }, (_, index) => {
            const monthData = RolexSales.find((item) => item._id === index + 1);
            return monthData ? monthData.count : 0;
        });
        RolexSalesArray = RolexSalesArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  
        res.render('index',{order,monthlySalesArray,monthlySalesArrayPreviousYear,product, orderlength,usersGrowthArray,IwatchSalesArray,APSalesArray,PPSalesArray,RolexSalesArray})
    } catch (error) {
        console.log(error.message);
    }
}

const adminLogout = async (req,res)=>{
    try {
        req.session.destroy()   
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}
const loadUserList = async (req,res)=>{
    try {

        let page = parseInt(req.query.page)
        let limit = 10
        let skip = page*10

        let search = ''
        if(req.query.search){
            search = req.query.search
        }

        const user = await User.find({
            $or:[
                {username : {$regex : '.*' + search + '.*'}},
                {email : {$regex : '.*' + search + '.*'}},
            ]
        }).skip(skip).limit(limit)
       

        res.render('page-users-list',{users:user,page})
    } catch (error) {
        console.log(error.message);
    }
}




const blockUser = async (req,res)=>{
    try {
        const id = req.query.id
        const userData = await User.findByIdAndUpdate({_id:id},{$set:{is_block:1}})
        res.redirect('/admin/userlist')
    } catch (error) {
        console.log(error.message);
    }
}

const unblockUser = async (req,res)=>{
    try {
        const id = req.query.id
        const userData = await User.findByIdAndUpdate({_id:id},{$set:{is_block:0}})
        res.redirect('/admin/userlist')

    } catch (error) {
        console.log(error.message);
    }
}

const loadAddBanner = async (req,res)=>{
    try {
        res.render('add-banner')
    } catch (error) {
        console.log(error.message);
    }
}


const addBanner = async (req,res)=>{
    try {
        const banner =  Banner({
            banner : req.file.filename,
            is_listed : 0
        })

        await banner.save()
        res.render('add-banner',{msg: "New Banner Added....!!"})
    } catch (error) {
        console.log(error.message);
    }
}

const bannerList = async (req,res)=>{
    try {
        const banner = await Banner.find()
        res.render('banner-list',{banner})
    } catch (error) {
        console.log(error.message);
    }
}

const loadSalesReport = async (req,res) =>{   
    try {
        const page = parseInt(req.query.page)
        let limit = 10
        let skip = page*10
        const order = await Order.find({delivery_status : "Delivered"}).skip(skip).limit(limit)
        res.render('sales-report',{order,page})
    } catch (error) {
        console.log(error.message);
    }
}


const salesReport = async (req, res) => {
    try {
        const date = req.query.date;
        let orders;

        const currentDate = new Date();

        // Helper function to get the first day of the current month
        function getFirstDayOfMonth(date) {
            return new Date(date.getFullYear(), date.getMonth(), 1);
        }

        // Helper function to get the first day of the current year
        function getFirstDayOfYear(date) {
            return new Date(date.getFullYear(), 0, 1);
        }

        switch (date) {
            case 'today':
                orders = await Order.find({
                    delivery_status: 'Delivered',
                    order_date : {
                        $gte: new Date().setHours(0, 0, 0, 0), // Start of today
                        $lt: new Date().setHours(23, 59, 59, 999), // End of today
                    },
                });
                break;
             case 'week':
                const startOfWeek = new Date(currentDate);
                startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Set to the first day of the week (Sunday)
                startOfWeek.setHours(0, 0, 0, 0);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to the last day of the week (Saturday)
                endOfWeek.setHours(23, 59, 59, 999);

                orders = await Order.find({
                    delivery_status: 'Delivered',
                    order_date: {
                        $gte: startOfWeek,
                        $lt: endOfWeek,
                    },
                });
                break;
            case 'month':
                const startOfMonth = getFirstDayOfMonth(currentDate);
                const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

                orders = await Order.find({
                    delivery_status: 'Delivered',
                    order_date : {
                        $gte: startOfMonth,
                        $lt: endOfMonth,
                    },
                });
                break;
            case 'year':
                const startOfYear = getFirstDayOfYear(currentDate);
                const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);

                orders = await Order.find({
                    delivery_status: 'Delivered',
                    order_date: {
                        $gte: startOfYear,
                        $lt: endOfYear,
                    },
                });
               
                break;
            default:
                // Fetch all orders
                orders = await Order.find({ delivery_status : 'Delivered' });
        }

        const itemsperpage = 10;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(orders.length / 3);
        const currentproduct = orders.slice(startindex,endindex);    

   res.render('sales-report',{order:currentproduct,totalpages,currentpage})
      
    } catch (error) {
        console.log('Error occurred in salesReport route:', error);
        // Handle errors and send an appropriate response
        res.status(500).json({ error: 'An error occurred' });
    }
};



const downloadSalesReport = async (req, res) => {
    try {
            const userId = req.session.user_id;
            const result = await Order.find({delivery_status : "Delivered"})
          
            const salesdata=[]
       for(let i=0;i<result.length;i++){
           const sales = {
            order_id : result[i]._id,
            username : result[i].user_id,
            product_name : result[i].total_price,
            date : result[i].order_date
           }
           salesdata.push(sales)
        }
        console.log(salesdata,"+++++++++++");
                
          
            
      
        
            const options = { year: "numeric", month: "long", day: "numeric" };
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
                // company: "Customer Address",
                // "zip": order.name,
                // "city": order.town,
                // "address": order.house,
                // "custom1": "custom value 1",
                // "custom2": "custom value 2",
                // "custom3": "custom value 3"
              },
              information: {
                 //number: "order" + order.id,
                // date: result.order_date.toLocaleDateString(),
              },
              order : salesdata,
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
    loadAdminLogin,
    verifyLogin,
    loadDashboard,
    loadUserList,
    blockUser,
    unblockUser,
    adminLogout,
    loadAddBanner,
    addBanner ,
    bannerList,
    loadSalesReport,
    salesReport,
    downloadSalesReport

    
}