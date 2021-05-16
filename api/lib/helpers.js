/*
*
*Helper methods to be used throughout the application 
*
*/

//Dependenies

const crypto= require('crypto')
const config=require('./config')

const helpers={}

//sha256 hashing for password
helpers.hash= (hashString)=>{
    if(typeof(hashString)=='string' && hashString.length>0){
        const hash=crypto.createHmac('sha256',config.hashingSecret).update(hashString).digest('hex');
        return hash;
    }

    else{
        return false;
    }
}

helpers.parseJsonToObject= (str)=>{
    try{
        return  JSON.parse(str)
    }

    catch(errr){
        console.log('Error parsing json: ', errr)
        return {}
    }
}

module.exports=helpers;