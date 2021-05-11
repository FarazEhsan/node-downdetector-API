/*
*
*Enrty file for nodejs API
*
*/

const http=require('http')
const url=require('url')


//Create a server
server= http.createServer((req,res)=>{

    //Parse the req using node:url API, url needs to be built using base and url from req
    const baseUrl='http://'+req.headers.host+'/';

    //Get URL this was as url.parse is depreciated
    const parsedUrl= new URL(req.url,baseUrl)   

    //Get the method i.e. GET/POST etc
    const method= req.method.toLowerCase();
    //Get the path
    const pathName= parsedUrl.pathname;

    //Get the queryString, cant use the parsedUrl.query since its depreciatedS
    const queryStringObj= parsedUrl.searchParams;

    //Send the response 
    res.end('Hello World')

    //Log the requst  path 
    console.log('Request was received on path: ', pathName, 
                ', Request method was: ', method, ', Query string parameters: ',queryStringObj);
})


//Server will listen on port 3001
server.listen(3001, ()=>{console.log('Server is running on port:3001')})