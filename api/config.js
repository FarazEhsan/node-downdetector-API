/*
*
*Create and export configuration variables
* Use command  SET NODE_ENV=production & node index.js OR  SET NODE_ENV=staging & node index.js 
*/

//Container for all envs
const environments ={};

environments.staging={
    'port': 3001,
    'envName': 'staging'
};

environments.production={
    'port':3000,
    'envName':'production'
};

//Determine which env was passed as a command-line argument 
let currentEnvironment =typeof(process.env.NODE_ENV) == 'string'?process.env.NODE_ENV.toLowerCase():'';

//determine whih env to execute based on current env
const envToExport= typeof(environments[currentEnvironment.trim()])=='object'?environments[currentEnvironment.trim()]:environments.staging;

//Export the module 
module.exports=envToExport;

