/*
*
*Handlers for all the routes
*/


//Dependencies
const helpers= require('./helpers')
const _data= require('./data')
const crypto = require('crypto')
const config= require('./config')

//Define hadlers for route requests
const handlers= {};


handlers.validMethods= new Array('post','put','delete','get');

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

//*********User handler */
handlers.users=(data)=>{
    return new Promise((resolve,reject)=>{
        if(handlers.validMethods.includes(data.method)){
            handlers._user[data.method](data).then((response)=>{
                const responseData= {
                    statusCode: 200,
                    payload: response
                }
                resolve(responseData);
            }).catch((err)=>{
                const responseData= {
                    statusCode: 400,
                    payload: {message: err}
                }
                reject(responseData);
            })

        }

        else{
            const responseData= {
                statusCode: 405,
                payload: {message: 'Bad Request'}
            }
            resolve(responseData);
        }

    })
}

//Define a set of users helpers for different methods.

handlers._user= {}

//user handler post function
handlers._user.post= (data)=>{
    return new Promise((resolve, reject)=>{
        //Get items in data data 
        let {firstName, lastName, phone, password, tosAgreement}= data.payload;
        firstName= typeof(firstName)=='string' && firstName.trim().length>0?firstName:false;
        lastName= typeof(lastName)=='string' && lastName.trim().length>0?lastName:false;
        phone= typeof(phone)=='string' && phone.trim().length==10?phone:false;
        password= typeof(password)=='string' && password.trim().length>0?password:false;
        tosAgreement=typeof(tosAgreement)=='boolean' && tosAgreement==true?tosAgreement:false;


        if(firstName && lastName && phone && password && tosAgreement){

            const hashedPwd= helpers.hash(password);
            if(hashedPwd){
                const userObject= {
                    firstName,
                    lastName,
                    phone,
                    password:hashedPwd,
                    tosAgreement
                }
                
                //create a file agaisnt this user if it does not exist already
                _data.create('user',userObject.phone,userObject).then(()=>{
                    const responseData= {
                        statusCode: 200,
                        payload: {message: 'User creation successful'}
                    }
                    resolve(responseData)
                }).catch((err)=>{
                    const responseData= {
                        statusCode: 400,
                        payload: {message: `Error creating user, the error is:${err}`}
                    }
                    reject(responseData);
                })
            }

            else{
                console.log('Error , couldnt hash the user pwd')
            }
        }
        else{
            reject('Invalid fields entered');
        }
       
    })
}

//Required Data: phone 
//TODO: Only let authenticated user acces their object 
handlers._user.get= (data)=>{
    return new Promise((resolve, reject)=>{

        console.log('Data reveived is: ', data.queryStringObj.get('phone'))

        const userPhone=data.queryStringObj.get('phone');
        const phone= typeof(userPhone)=='string' && userPhone.length==10?userPhone:false;

        //get the token from the header
        const token= typeof(data.headers.token)==='string'?data.headers.token:false;
        //verify the tiken if valid user

        if(token){
            handlers._token.verifyToken(token,phone).then((response)=>{
                if(response){
                    if(phone){
                        _data.read('user',phone).then((userData)=>{
                            delete userData.password;
                            const responseData= {
                                statusCode: 200,
                                payload: userData
                            }
                            resolve(responseData)
                        }).catch((err)=>{
                            const responseData= {
                                statusCode: 400,
                                payload: err
                            }
                            reject(responseData)
                        })
                       
                    }
                    else{
                        const responseData= {
                            statusCode: 400,
                            payload: {message: `Invalid phone number`}
                        }
                        reject(responseData)
                    }
                }
                else{
                    const responseData= {
                        statusCode: 400,
                        payload: {message: `Invalid Token`}
                    }
                    reject(responseData)
    
                }
            })
        }
        else{
            const responseData= {
                statusCode: 400,
                payload: {message: `Invalid Token`}
            }
            reject(responseData)

        }

        
     
    })
}
//Required: phone
handlers._user.put= (data)=>{
    return new Promise((resolve, reject)=>{

        let {firstName, lastName, phone, password, tosAgreement}= data.payload;
        firstName= typeof(firstName)=='string' && firstName.trim().length>0?firstName:false;
        lastName= typeof(lastName)=='string' && lastName.trim().length>0?lastName:false;
        phone= typeof(phone)=='string' && phone.trim().length==10?phone:false;
        password= typeof(password)=='string' && password.trim().length>0?password:false;
        tosAgreement=typeof(tosAgreement)=='boolean' && tosAgreement==true?tosAgreement:false;

        if(phone){
            console.log('Insie the put and phone is: ', phone);
            if(firstName || lastName || password){
               _data.read('user',phone).then((userData)=>{
                   //data is present
                    if(firstName){
                        userData.firstName=firstName
                    }
                    if(lastName){
                        userData.lastName=lastName
                    }
                    if(password){
                        userData.password=helpers.hash(password)
                    }
                    //persist the updated user 
                    _data.update('user',phone,userData).then((response)=>{

                        const responseData= {
                            statusCode: 200,
                            response
                        }
                        resolve(responseData);
                    })
               }).catch((err)=>{
                   //data is not present
                   const responseData= {
                    statusCode: 400,
                    payload: {message: `User does not exist or the error is ${err}`}
                    }
                reject(responseData)
               })

            }
            else{
                const responseData= {
                    statusCode: 400,
                    payload: {message: `Invalid phone number`}
                }
                reject(responseData)
            }
            
        }

        else{
            const responseData= {
                statusCode: 400,
                payload: {message: `Invalid phone number`}
            }
            reject(responseData)
        }

       
    })
}

handlers._user.delete= (data)=>{
    return new Promise((resolve, reject)=>{
        console.log('Data reveived is: ', data.queryStringObj.get('phone'))

        const userPhone=data.queryStringObj.get('phone');
        const phone= typeof(userPhone)=='string' && userPhone.length==10?userPhone:false;
        if(phone){
            _data.read('user',phone).then((responseUser)=>{
                //user exists delete now
                _data.delete('user',phone).then(()=>{
                    const responseData= {
                        statusCode: 200,
                        message:'deleted the user'
                    }
                    resolve(responseData);
                }).catch((err)=>{
                    const responseData= {
                        statusCode: 400,
                        message: 'Couldnt delete user'
                    }
                    reject(responseData)
                })
            }).catch((err)=>{
                const responseData= {
                    statusCode: 400,
                    payload: {message: `Couldnt get user`}
                }
                reject(responseData)
            })
     
        }
        else{
            const responseData= {
                statusCode: 400,
                payload: {message: `Invalid phone number`}
            }
            reject(responseData)
        }
        
    })
}

//*********User handler END */


//*********token handler*/
handlers.tokens=(data)=>{
    return new Promise((resolve,reject)=>{
        if(handlers.validMethods.includes(data.method)){
            handlers._token[data.method](data).then((response)=>{
                const responseData= {
                    statusCode: 200,
                    payload: response
                }
                resolve(responseData);
            }).catch((err)=>{
                const responseData= {
                    statusCode: 400,
                    payload: {message: err}
                }
                reject(responseData);
            })

        }

        else{
            const responseData= {
                statusCode: 405,
                payload: {message: 'Bad Request'}
            }
            resolve(responseData);
        }

    })
}

//token handler helper functions

handlers._token= {}

handlers._token.post =(data)=>{
    return new Promise((resolve, reject)=>{
        let {phone, password}= data.payload;
        phone= typeof(phone)=='string' && phone.trim().length==10?phone:false;
        password= typeof(password)=='string' && password.trim().length>0?password:false;

        if(phone && password){
            //check if user exists 
            _data.read('user',phone).then((userData)=>{
                //check if user password is correct
                const hashedInputPassword= helpers.hash(password);
                if(hashedInputPassword===userData.password){
                    //user is valid, create a token object 
                    const tokenObject = {
                        tokenID:crypto.randomUUID(),
                        phone,
                        expires:Date.now()+1000*60*60
                    }
                    //store the token in our 'database'
                    _data.create('token',tokenObject.tokenID,tokenObject).then((userToken)=>{
                        //token created, return the token to user
                        resolve(userToken);

                    }).catch((err)=>{
                        const responseData= {
                            statusCode: 400,
                            payload: {message: 'Error creating user token'}
                        }
                        reject(responseData); 
                    })
                }
                else{
                    const responseData= {
                        statusCode: 400,
                        payload: {message: 'Incorrect password!'}
                    }
                    reject(responseData); 
                }
            }).catch((err)=>{
                const responseData= {
                    statusCode: 400,
                    payload: {message: `User does not exist! or the erros is ${err}`}
                }
                reject(responseData);    
            })
        }
        else{
            const responseData= {
                statusCode: 400,
                payload: {message: 'Invalid phone or password'}
            }
            reject(responseData);   
        }
    })
}

//Required Data: tokenId 

handlers._token.get= (data)=>{
    return new Promise((resolve, reject)=>{

       

        const id=data.queryStringObj.get('id');
        const tokenId= typeof(id)=='string' && id.trim().length===36?id:false;

        console.log('Data reveived is: ', tokenId)
        if(tokenId){
            _data.read('token',tokenId).then((tokenData)=>{
                const responseData= {
                    statusCode: 200,
                    payload: tokenData
                }
                resolve(responseData)
            }).catch((err)=>{
                const responseData= {
                    statusCode: 400,
                    payload: err
                }
                reject(responseData)
            })
           
        }
        else{
            const responseData= {
                statusCode: 400,
                payload: {message: `Invalid phone number`}
            }
            reject(responseData)
        }
     
    })
}


//Required: tokemID & extend boolean
handlers._token.put= (data)=>{
    return new Promise((resolve, reject)=>{

        let {tokenID, extend}= data.payload;

        tokenID= typeof(tokenID)=='string' && tokenID.trim().length==36?tokenID:false;
        extend=typeof(extend)=='boolean' && extend==true?extend:false;

        console.log('Token and extend is: ',tokenID,extend )
        if(tokenID && extend){
            console.log('Insie the put and phone is: ', tokenID);
            _data.read('token',tokenID).then((tokenData)=>{
                //token exists
                if(tokenData.expires > Date.now()){
                
                tokenData.expires= tokenData.expires + 1000*60*60;
                
                 //persist the updated token
                _data.update('token',tokenID,tokenData).then((response)=>{

                    const responseData= {
                        statusCode: 200,
                        response,
                        messagae:'Token extended by 1 hour'
                    }
                    resolve(responseData);
                })
                }
                else{
                    const responseData= {
                        statusCode: 400,
                        message: 'Cant extend, token already expired!'
                    }
                    reject(responseData);
                }


            }).catch((err)=>{
                //data is not present
                const responseData= {
                statusCode: 400,
                payload: {message: `Cant extend token ${err}`}
                }
            reject(responseData)
            })

            
        }

        else{
            const responseData= {
                statusCode: 400,
                payload: {message: `Invalid phone number`}
            }
            reject(responseData)
        }

       
    })
}

//Required: tokenID
handlers._token.delete= (data)=>{
    return new Promise((resolve, reject)=>{
    

        let tokenID=data.queryStringObj.get('tokenID');
        console.log('Data reveived is11: ',tokenID)
        tokenID= typeof(tokenID)=='string' && tokenID.trim().length===36?tokenID:false;

        console.log('Data reveived is: ',tokenID)
        if(tokenID){
            _data.read('token',tokenID).then((responseToken)=>{
                //user exists delete now
                _data.delete('token',tokenID).then(()=>{
                    const responseData= {
                        statusCode: 200,
                        message:'deleted the tokem'
                    }
                    resolve(responseData);
                }).catch((err)=>{
                    const responseData= {
                        statusCode: 400,
                        message: 'Couldnt delete token'
                    }
                    reject(responseData)
                })
            }).catch((err)=>{
                const responseData= {
                    statusCode: 400,
                    payload: {message: `Couldnt get token`}
                }
                reject(responseData)
            })
     
        }
        else{
            const responseData= {
                statusCode: 400,
                payload: {message: `Invalid phone number`}
            }
            reject(responseData)
        }
        
    })
}


//to verify the token

handlers._token.verifyToken = (tokenID,phone)=>{
    return new Promise ((resolve, reject)=>{
        _data.read('token',tokenID).then((tokenData)=>{
            if(tokenData.phone===phone && tokenData.expires>Date.now() ){
                //the user has a valid token
                resolve(true)
            }
            else{
                resolve(false)
            }
        }).catch((err)=>{
            console.log('Some other error: ', err)
            resolve(false)
        })
    })
}

//*********token handler END*/

//***** checks handler begins */


/*
*
*Check API handlers
*Authenticated users will create checks. Each check will be stored in a file with user ID and User will have an array of
*checks sotred in its object
*/


handlers.checks=(data)=>{
    return new Promise((resolve,reject)=>{
        if(handlers.validMethods.includes(data.method)){
            handlers._checks[data.method](data).then((response)=>{
                const responseData= {
                    statusCode: 200,
                    payload: response
                }
                resolve(responseData);
            }).catch((err)=>{
                console.log('Error calling provate methof', err)
                const responseData= {
                    statusCode: 400,
                    payload: 'invlaid method'
                }
                reject(responseData);
            })

        }

        else{
            const responseData= {
                statusCode: 405,
                payload: {message: 'Bad Request'}
            }
            resolve(responseData);
        }

    })
}

//***checks GET,POST,PUT& DELETE methods */

/*
*Check Post: Create a check if user is authenticated (has a toke in header), 
*REQUIRED: tokenID, 
*/

handlers._checks ={}

handlers._checks.post= async (data)=>{
    let {url, method, protocol, timeOut, successCode}= data.payload;
    let token= data.headers.token;
    url= typeof(url)=='string' && url.trim().length>0?url:false;
    method= typeof(method)=='string' && handlers.validMethods.includes(method)?method:false;
    protocol= typeof(protocol)=='string' && ['http','https'].includes(protocol)?protocol:false;
    timeOut= typeof(timeOut)=='number' && timeOut>0?timeOut:false;
    successCode=typeof(successCode)=='object' && successCode instanceof Array?successCode:false;

    if(url && method && protocol && timeOut && successCode){
        let userPhone=''
        try{
            try{
                const tokenCheck=await _data.read('token',token);   
                userPhone=tokenCheck.phone;
            }
            catch(err){
                return 403; 
            }
    
            //get user checks from user data 
            const userData=await _data.read('user',userPhone);
            let userChecks= typeof(userData.checks)=='object' && userData.checks instanceof Array? userData.checks:[];
    
            if(userChecks.length < config.maxChecks){
                //user can create a new check
    
                const id= crypto.randomUUID();
                const checkData={
                    id,
                    url,
                    method,
                    protocol,
                    timeOut,
                    successCode,
                    userPhone,
                }
                console.log('Check data is: ', checkData);
                try{
                    userData.checks=userChecks;
                    userData.checks.push(checkData.id);
                    const updateUserChecks= await _data.update('user',userPhone,userData);
                    const createCheck= await _data.create('checks',checkData.id,checkData);
                    return createCheck;
                }
                catch(err){
                    console.log('Error adding cehcks to user: ',err);
                    const responseData= {
                        status: 400,
                         err
                    }
                    return responseData;
        
                }
     
    
            }
            else{
                const responseData= {
                    status: 400,
                    message: `User us allowed only ${config.maxChecks} checks at a time`
                }
    
                return responseData;
            }
    
        }
        catch(err){
            console.log('Error in checks post: ',err)
            const responseData= {
                status: 500,
                message: 'Internal Server Error'
            }

            return responseData;
        }
    }
    else{
        const responseData= {
            status: 400,
            message: `Invalid parameters`
        }

        return responseData;
    }
}
//***** checks handler END */

//Export the handlers
module.exports=handlers;