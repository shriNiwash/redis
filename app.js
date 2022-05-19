// const express  = require('express');
import express from 'express';
// const fetch = require('node-fetch');
import fetch from 'node-fetch';
import redis from 'redis';
const app = express();


const REDIS_PORT = process.env.PORT || 6379;
const port = 4000;

//creating client as redis
const client = redis.createClient(REDIS_PORT);
(async () => {
    await client.connect();
})();




//redis middleware
// const redis_data = (req,res,next)=>{
//     const username = req.params.id;
//     client.get(username,(err,data)=>{
//         if(err){
//             throw err;
//         }
//         else if(data){
//             console.log('fetching from redis..');
//             res.send(JSON.parse(data));
//         }
//         else{
//             next();
//         }
//     })
// }

const redis_form = async(req,res,next)=>{
    const username = req.params.id;
    const value = await client.get(username);
    if(value){
        console.log('fetching data from redis...');
        res.send(value);
    }
    else{
        next();
    }

}
app.get('/',(req,res)=>{
    res.send("hello there in the home page");
})



app.get('/data/:id',redis_form,async(req,res)=>{
    try{
        console.log('fetching data from database ...');
        const response =  await fetch(`http://localhost:3000/books/list/${req.params.id}`);
        const data  = await response.json();
        const name = data.name;
        const username = req.params.id;
        console.log(data);
        res.send(name);
        client.setEx(username,3600,JSON.stringify(name));
    }
    catch(err){
        console.log(err);
    }
        
})




app.listen(port,()=>console.log(`the app is running on the port ${port}`));