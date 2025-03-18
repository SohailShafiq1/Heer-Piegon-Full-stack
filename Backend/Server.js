const express = require("express")
const app = express()
app.listen(2001,(req,res)=>{
    console.log("Sela g good")
})
app.get("/home",(req,res)=>
{
    res.json("Ok")
})