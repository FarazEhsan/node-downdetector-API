/*
*
*Handlers for all the routes
*/


//Dependencies
const helpers= require('./helpers')
const _data= require('./data')

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

//Export the handlers
module.exports=handlers;