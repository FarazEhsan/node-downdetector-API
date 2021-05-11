/*
*
*Enrty file for nodejs API
*
*/

const http=require('http')
const url=require('url')
const StringDecoder= require('string_decoder').StringDecoder; 


//Create a server
server= http.createServer((req,res)=>{

    //Parse the req using node:url API, url needs to be built using base and url from req
    const baseUrl='http://'+req.headers.host+'/';

    //Get URL this was as url.parse is depreciated
    const parsedUrl= new URL(req.url,baseUrl)   

    //Get the method i.e. GET/POST etc
    const method= req.method.toLowerCase();

    //Get headers
    const headers= req.headers;
    //Get the path
    const pathName= parsedUrl.pathname;

    //Get the queryString, cant use the parsedUrl.query since its depreciatedS
    const queryStringObj= parsedUrl.searchParams;

    //Get the payload stream in the buffer variable
    let buffer=''

    //Create a string decoder to decode stream as string utf-8
    let decoder= new StringDecoder('utf-8');

    //bind to the 'data' event of req to get stream events that are being emitted
    req.on('data', (data)=>{

        //read the stream in buffer var using string decoder
        buffer+=decoder.write(data);
    })

        //bind to the 'end' event which will tell us that the stream has ended
    req.on('end', ()=>{
        buffer+=decoder.end();

        //select a chosen handler based on path name
        console.log('Pathname is: ', pathName);
        let chosenHandler= typeof(router[pathName])!=='undefined'?router[pathName]:handlers.notFound;

        //create data to be sent to chosen handler and handle data callback 
        let data ={
            'pathName':pathName,
            'method':method,
            'headers':headers,
            'payload':buffer
        };

        //call the chosen handler and send above data. Receive the data from callback of chosen handler
        chosenHandler(data,(statusCode,payload)=>{
            //get the status code called back by the handler or use default:200
            statusCode=typeof(statusCode)=='number'?statusCode:200;

            //get the payload called back by the handler or set default :{}
            payload=typeof(payload)=='object'?payload:{};

            //stringyfy the payload to return json string
            const payloadString= JSON.stringify(payload);

            //write the statuscode to res
            res.writeHead(statusCode);
            //Send the response since the stream has ended 
            res.end(payloadString);
            console.log('Returning this response: ', statusCode, payloadString);

        });

                    //Log the requst  path 
                    //console.log(//'Request was received on path: ', pathName, 
                    // ', Request method was: ', method, ', Query string parameters: ',queryStringObj,
                    // ', Request headers are: ',headers,
                   // ', Request recevced with this payload: ',buffer);

    })






})


//Server will listen on port 3001
server.listen(3001, ()=>{console.log('Server is running on port:3001')})

//Define hadlers for route requests
let handlers= {};
handlers.sample= (data,callback)=>{
    callback(408, {'name':'sample handler'});
}
handlers.notFound = (data,callback)=>{
    callback(404);
}
//define handlers for all the paths
const router = {
    '/sample':handlers.sample
}