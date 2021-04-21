const mysql = require('mysql')
const config = require('../../config/config.json')

const con = mysql.createConnection(config.database);

//connect to database
const connectDB = () => {
    return new Promise((resolve, reject) => {
        con.connect((error) => {
            if(error){
                return reject(new Error("DB Connection Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve("DB Connection Success")
        });
    });
}

/* Update Data */

//update raw-temperature data table with temperature data
const updateTemperatureData = (tempdata) => {
    return new Promise((resolve, reject) => {
        const query = "insert into temp_rawdata(temp_t1, temp_t2, temp_t3, temp_t4, temp_t5, temp_t6, temp_t7, temp_t8, temp_t9, temp_t10) values(" + tempdata[0] + ", " + tempdata[1] + " , " + tempdata[2] + "," + tempdata[3] + ", " + tempdata[4] + ", " + tempdata[5] + ", " + tempdata[6] + ", " + tempdata[7] + ", " + tempdata[8] + ", " + tempdata[9] + ");"
        con.query(query, (error, results, fields) => {
            if(error){
                return reject(new Error("Temperature Raw Data update Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve("Success")
        })
    })
}

//update raw-motor vfd data table with vfd data
const updateVFDSpeedData = (invdata, timevalue) => {
    return new Promise((resolve, reject) => {
        const query = "insert into inv_rawdata(inv1, inv2, inv3, timevalue) values(" + invdata[0] + ", " + invdata[1] + " , " + invdata[2] + "," + timevalue + ");" 
        con.query(query, (error,results,fields) => {
            if(error){
                return reject(new Error("INVSpeed Raw Data update Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve("Success")
        })
    })
}

/* Retreive Data */
//bulk - initial retreival of temperature data
const getTempDataBulk = (start, end) => {
    return new Promise((resolve, reject) => {
        const query = "select * from temp_rawdata where logtime between '"+ start +"' and '"+ end +"'";
        con.query(query, (error, results, fields) => {
            if(error){
                return reject(new Error("Temperature History data BULK retrieve Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

//single retreival of temperature data
const getTempDataSingle = (start, end) => {
    return new Promise((resolve, reject) => {
        const query = "set @maxid = (select max(id) from temp_rawdata where id in (select id from temp_rawdata where logtime between '" + start + "' and '" + end + "'));" + 
                        "select * from temp_rawdata where id =  @maxid;";
        con.query(query, (error, results, fields) => {
            if(error){
                return reject(new Error("Temperature History data SINGLE retrieve Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

//get inv data bulk
const getInvDataBulk = (start, end) => {
    return new Promise((resolve, reject) => {
        const query = "select * from inv_rawdata where logtime between '"+ start +"' and '"+ end +"'";
        con.query(query, (error, results, fields) => {
            if(error) {
                return reject(new Error("Invertert Speed History data BULK retrieve Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

//get inv data single
const getInvDataSingle = (start, end) => {
    return new Promise((resolve, reject) => {
        const query = "set @maxid = (select max(id) from inv_rawdata where id in (select id from inv_rawdata where logtime between '" + start + "' and '" + end + "'));" + 
                        "select * from inv_rawdata where id =  @maxid;";
        con.query(query, (error, results, fields) => {
            if(error) {
                return reject(new Error("Invertert Speed History data BULK retrieve Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

/*Saving Data*/
//valus : int array [['temp_t1, 1],...]
const setSVTempData = (values) => {
    return new Promise((resolve, reject) => {
        let query = ""
        let sub_query = ""
        const ids = Object.keys(values)
        const vals = Object.values(values)
        for (let index = 0; index < vals.length - 1; index++) {
            const value = vals[index];
            const id = ids[index];
            sub_query += id + "=" + value + ","
        }
        sub_query += (ids[vals.length - 1]) + "=" + (vals[vals.length - 1])
        query = "update temp_savedata set " + sub_query + " where id = 1;";
        con.query(query, (error,results,fields) => {
            if(error){
                return reject(new Error ("Saving Temperature Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })   
}

const getSVTempData = () => {
    return new Promise((resolve, reject) => {
        const query = "select temp_t1, temp_t2, temp_t3, temp_t4, temp_t5, temp_t6, temp_t7, temp_t8, temp_t9, temp_t10 from temp_savedata where id = 1;"
        con.query(query, (error, results, fields) => {
            if(error){
                return reject(new Error ("Getting set value Temperature Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

const setSVInvData = (values) => {
    return new Promise((resolve, reject) => {
        let query = ""
        let sub_query = ""
        const ids = Object.keys(values)
        const vals = Object.values(values)
        for (let index = 0; index < vals.length - 1; index++) {
            const value = vals[index];
            const id = ids[index];
            sub_query += id + "=" + value + ","
        }
        sub_query += (ids[vals.length - 1]) + "=" + (vals[vals.length - 1])
        query = "update inv_savedata set " + sub_query + " where id = 1;";
        con.query(query, (error,results,fields) => {
            if(error){
                return reject(new Error ("Saving Inverter Data Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })   
}

const getSVInvData = () => {
    return new Promise((resolve, reject) => {
        const query = "select inv1, inv2, inv3, timevalue from inv_savedata where id = 1;"
        con.query(query, (error, results, fields) => {
            if(error){
                return reject(new Error ("Getting Set Value Inverter Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}

const getTimeValue = () => {
    return new Promise((resolve, reject) => {
        const query = "select timevalue from inv_savedata;"
        con.query(query, (error, results, fields) => {
            if(error){
                return reject(new Error("Getting Time Value Failed : ==> " + error.message + " @ " + __filename + " @ ErrorType : " + error.name))
            }
            resolve(results)
        })
    })
}


module.exports = {
    connectDB,
    updateTemperatureData,
    updateVFDSpeedData,
    getTempDataBulk,
    getTempDataSingle,
    getInvDataBulk,
    getInvDataSingle,
    setSVTempData,
    getSVTempData,
    setSVInvData,
    getSVInvData,
    getTimeValue
}


