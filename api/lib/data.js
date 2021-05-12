/*
*
*Library to read and write data to files
*/

const fs= require('fs')
const path= require('path')

//Will export this 
const lib={};

lib.baseDir= path.join(__dirname, '/../.data/');

//create and add data to a file
lib.create= (dir,file,data)=>{
    const absFilePath=`${lib.baseDir}${dir}/${file}.json`;
    fs.promises.open(absFilePath,'wx').then((filedescriptor)=>{

        //convert data to a string and write data to the file
        const stringData=JSON.stringify(data);

        //Write string data to file
        fs.promises.writeFile(filedescriptor,stringData).then(()=>{

            filedescriptor.close().then(()=>{
                console.log(`File closed: ${absFilePath}`);
            }).catch((err)=>{
                console.log(`Error closing file: ${absFilePath}`)
            })

        }).catch((err)=>{console.log(`Error writing file: ${absFilePath}, the error is: ${err} `)})

    }).catch((err)=>
        {console.log(`Error opening file:${absFilePath}, the error is ${err}`)
    })

}

//Read data from a file
//A promise to return data
lib.read=(dir,file)=>{
    const absFilePath=`${lib.baseDir}${dir}/${file}.json`;

    return new Promise((resolve,reject)=>{
        fs.promises.readFile(absFilePath,'utf8').then((data)=>{
            resolve (data); 
        }).catch((err)=>{
            reject(err)
        })

    })

}

//Update a file
lib.update=(dir,file,data)=>{
    const absFilePath=`${lib.baseDir}${dir}/${file}.json`;
    return new Promise((resolve,reject)=>{
        fs.promises.open(absFilePath,'r+').then((fileHandler)=>{
            const stringData=JSON.stringify(data);
            fs.promises.truncate(absFilePath).then(()=>{
                fs.promises.writeFile(fileHandler,stringData).then(()=>{
                    fileHandler.close().then(()=>{
                        console.log(`File closed: ${absFilePath}`);
                        resolve();
                    }).catch((err)=>{
                        console.log(`Error closing file: ${absFilePath}`)
                        reject()
                    })
                }).catch((err)=>{
                    console.log(`Error writing file: ${absFilePath}, the error is: ${err} `);
                    reject()
                })
            }).catch((err)=>{
                console.log(`Error truncating file:${absFilePath}, the error is: ${err} `)
                reject()
            })
        }).catch((err)=>{
            console.log(`Error opening file:${absFilePath}, the error is: ${err}`);
            reject();
        })
    })
}

//Delete a file 
lib.delete = (dir,file)=>{
    const absFilePath=`${lib.baseDir}${dir}/${file}.json`;

    return new Promise((resolve,reject)=>{
        fs.promises.unlink(absFilePath).then(()=>{
            console.log(`Deleted file: ${absFilePath}`)
            resolve();
        }).catch((err)=>{
            console.log(`Error deleteing file:${absFilePath}, the error is: ${err}`);
            reject();
        })
    })
}

module.exports=lib;
