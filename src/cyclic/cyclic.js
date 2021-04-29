const shared = require('../modules/shared')
const modbus = require('../modules/modbus')
const errorhandler = require('../modules/errorlog')
const database = require('../modules/database')
const data = require('../modules/shared')
const config = require('../../config/config.json')
const e = require('express')

// const ModbusRTU = require("modbus-serial");
// // create an empty modbus client
// const client = new ModbusRTU();
// // open connection to a serial port
// client.connectRTUBuffered("COM6", { baudRate: 9600, parity : 'none' });
// // set timeout, if slave did not reply back
// client.setTimeout(100);

/* For testing purpose enabling only required components */
let key = 0;
if(config.controllertest === "temp"){
    key = 1;
}
else if(config.controllertest === "inv"){
    key = 2;
}
else if(config.controllertest === "both"){
    key = 0;
}
else{
    key = -1;
}

//loading database connection
database.connectDB()
.then((successEvent) => errorhandler.info(successEvent))
.catch((error) => errorhandler.error(error))

const cyclicIntervalTime = 3000

const keyFn = async (key) => {
    switch (key) {
        case 0:
            try {
                let finaltempdata = []
                let finalinvdata = []
                let rawTemp = await modbus.getTemperatureData()
                let rawIn = await modbus.getINVData()
                shared.temp_array = rawTemp;
                shared.inv_array = rawIn;
                // console.log(shared.temp_array)
                rawTemp.forEach(element => {
                    finaltempdata.push(element[1]);
                });
                rawIn.forEach((element => {
                    finalinvdata.push(element[1]);
                }))
                await database.updateTemperatureData(finaltempdata)
                let timevalue = (await database.getTimeValue())[0].timevalue
                await database.updateVFDSpeedData(finalinvdata, timevalue)
            } catch (error) {
                errorhandler.error(error)
            }
            break;
    
        case 1:
            try {
       
                let finaltempdata = []
                let rawTemp = await modbus.getTemperatureData()
                shared.temp_array = rawTemp;
                rawTemp.forEach(element => {
                    finaltempdata.push(element[1]);
                });
                await database.updateTemperatureData(finaltempdata)
            } catch (error) {
                errorhandler.error(error)
            }
        
            break;
    
        case 2:
            try {
                let finalinvdata = []
                let rawIn = await modbus.getINVData()
                shared.inv_array = rawIn;
                rawIn.forEach((element => {
                    finalinvdata.push(element[1]);
                }))
                let timevalue = (await database.getTimeValue())[0].timevalue
                await database.updateVFDSpeedData(finalinvdata, timevalue)
            } catch (error) {
                errorhandler.error(error)
            }
            break;
    
        default:
            break;
    }
}

setInterval(async () => {
    try {
        await keyFn(key)
    } catch (error) {
        
    }
}, cyclicIntervalTime)

