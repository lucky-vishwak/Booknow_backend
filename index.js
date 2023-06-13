//import express
const express = require("express")
//import session
const session = require("express-session")
//import mongoose
const mongoose = require('mongoose')
//import bcryptjs
const bcryptjs = require('bcryptjs')
const { v4: uuidv4 } = require("uuid")
const app = express()
const path = require("path")
// app.use(express.static(path.join(__dirname,'./dist/dbbook')))

//import json web token
const jwt = require("jsonwebtoken")

const http = require("http").createServer(app)

require("dotenv").config()

//importing modules
const employeeModel = require("./models/employeeModel").employeeModel
const adminModel = require('./models/adminModel').adminModel


//import express async-handler
const errorHandler = require('express-async-handler')

const cors = require("cors")
const { eventModel } = require("./models/EventsModel")
const { roomModel } = require("./models/roomModel")
app.use(cors())
app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
}))


//connected to database
mongoose.connect(process.env.MONGOURL).then(
    console.log('connected to database')
)

//Middleware
app.use(express.json())

//importing routes
const employeeRoute = require('./routes/employeeRoute').employeeRoute
const roomRoute = require('./routes/roomRoute').roomRoute
const eventRoute = require('./routes/eventRoute').eventRoute
const adminroute=require('./routes/adminRoute').adminroute

app.use('/admin',adminroute)
app.use('/employee', employeeRoute);
app.use('/room', roomRoute);
app.use('/event', eventRoute);
app.post('/login', async (req, res) => {
    let userobj = req.body
    let user = await employeeModel.findOne({ email: userobj.email })
    let admin = await adminModel.findOne({ email: userobj.email })
    if (admin) {
        if (admin.password == userobj.password) {
            let token = jwt.sign({ email: userobj.email, type: "admin" },
                process.env.SECRETKEYADMIN, { expiresIn: "1d" })
            res.send({ message: "admin logged success", adminobj: admin, token: token })
        }
        else {
            res.send({ message: "invalid password" })
        }
    }
    else {
        if (user) {
            let token=jwt.sign({email:userobj.email,type:"user"},
            process.env.SECRETKEYUSER,{expiresIn:"1d"})
            if (user.password == userobj.password) {
                res.send({ message: "user logged success", userobj: user,token:token })
            }
            else {
                res.send({ message: "invalid password" })
            }
        }
        else {
            res.send({ message: "invalid credantials" })
        }
    }
})
app.post('/', async (req, res) => {
    let adminObj = req.body;
    await adminModel.create(adminObj);
    res.send({ message: "sent" })
})


//error handling for invalid path
app.use((req, res, next) => {
    res.send({ message: `path ${req.url} is invalid` })
})

port = process.env.PORT || 3005
var server = app.listen(port, () => {
    console.log(`listening on port http://localhost:${port}`)
})
