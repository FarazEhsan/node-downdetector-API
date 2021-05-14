/*
*
*Handlers for all the routes
*/


//Define hadlers for route requests
const handlers= {};

// handlers.ping =(data,callback)=>{
//     callback(200);
// }
handlers.notFound = (data)=>{
    console.log('Data in handler: ',data )
    return new Promise ((resolve,reject)=>{
        try{
            const responseData= {
                statusCode: 404
            }
            resolve(responseData);
        }

        catch {
            reject();
        }
    })
}

handlers.ping= (data)=>{
    console.log('Data in handler ping: ',data )
    return new Promise((resolve, reject)=>{
        try{
            const responseData= {
                statusCode: 200,
                payload: {message: 'Thanks for visitng!!'}
            }
            resolve(responseData);
        }

        catch {
            reject();
        }
    });
}

//Export the handlers
module.exports=handlers;