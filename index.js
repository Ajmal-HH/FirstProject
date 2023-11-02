const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODBURL)

const express = require('express')
const app = express()

const user = require('./controller/userController')

const PORT = process.env.PORT||3000

app.set('view engine','ejs')
app.set('views','./viwes')

app.use(express.static('public'))

//for user
const userRouter = require('./router/userRouter') 
app.use('/',userRouter)
 
//for admin..
const adminRouter = require('./router/adminRouter') 
app.use('/admin',adminRouter) 
  



app.listen(PORT,()=>console.log('server running on http://localhost:3000')) 
