const router = require('express').Router()
const bodyparser = require('body-parser')
const modbusDev = require('../modules/modbus')
const errorhandler = require('../modules/errorlog')
const shared = require('../modules/shared')
const database = require('../modules/database')
const moment = require('moment')
const data = require('../modules/shared')
const middleware = require('../middleware/middleware')

//handle json body
router.use(bodyparser.json());

//api -> ep retrieve temperature sv
router.get('/tempretrieve', async(req, res) => {
    try {
        let values = await database.getSVTempData()
        res.send(values[0])
    } catch (error) {
        errorhandler.error(error)  
        res.status(501).send(error)
    }
})

//api -> ep retrieve inverter SV
router.get('/invretrieve', async(req,res) => {
    try {
        let values = await database.getSVInvData()
        res.send(values[0])
    } catch (error) {
        errorhandler.error(error)  
        res.status(501).send(error)
    }
})

//api ep -> update temperature controllers
router.get('/temp', async (req,res) => {
    try {
        let data = shared.temp_array
        res.send({data})
    } catch (error) {
        errorhandler.error(error)   
        res.status(501).send({Error : error});
    }
});

//api ep -> write temperature data
router.use('/tempwr', middleware.saveTempSV)
router.post('/tempwr', async (req,res) => {
    try {
        let temperatureValues = Object.values(req.body)
        await modbusDev.updateTempData(temperatureValues)
        res.send({status : "success"})
    } catch (error) {
        res.send({status : "fail"})
        errorhandler.error(error)
    }
})

//api ep -> update vfd data 
router.get('/inv', async (req,res) => {
    try {
        let data = shared.inv_array;
        let timevalue = await database.getTimeValue()
        let obj = {
            data,
            timevalue : timevalue[0].timevalue
        }
        res.send(obj)
    } catch (error) {
        errorhandler.error(error)   
        res.status(501).send({Error : error});
    }
});

//api -> ep write inverter data
router.use('/invwr', middleware.getSecondaryInvID)
router.use('/invwr', middleware.saveInvSV)
router.post('/invwr', async(req,res) => {
    let updateSuccessFlag = true;
    const keys = req.keys;
    const values = req.values;
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const value = values[index];
        try {
            await modbusDev.updateINVData(key, value)
        } catch (error) {
            updateSuccessFlag = false
        }
    }
    let response = (updateSuccessFlag === false) ? "fail" : "success";
    res.send({status : response});
})

//api -> ep write timevalue data
router.use('/timevaluewr', middleware.timevalueCalibration)
router.use('/timevaluewr', middleware.saveInvSV)
router.post('/timevaluewr', async (req,res) => {
    let updateSuccessFlag = true;
    let invid = req.invid;
    let svFreq = req.svfreq;
    try {
        await modbusDev.updateINVData(invid,svFreq)
    } catch (error) {
        updateSuccessFlag = false
    }
    let response = (updateSuccessFlag === false) ? "fail" : "success";
    res.send({status : response})
})

//api ep -> history
router.get('/temphistory', async (req,res) => {
    const history_init_flag = parseInt(req.query.init);
    const device = req.query.device;    

    const today = moment().format();
    const tomorrow = moment().add(1, 'days').format();
    const todayDate = today.split('T')[0] + " 00:00:00" ;
    const tomorrowDate = tomorrow.split('T')[0] + " 00:00:00";

    if(history_init_flag === 0){
        let finalData = []
        try {
            let historyData = (device === "trcx") ? await database.getTempDataBulk(todayDate, tomorrowDate) : {}
            // console.log(historyData)
            historyData.forEach(data => {
                let logtime = moment(data.logtime).format();
                let logtimeDisplay = logtime.split('T')[0] + " " + (logtime.split('T')[1]).split('+')[0];
                let Object = {
                    logtime : logtimeDisplay,
                    t1 : data.temp_t1,
                    t2 : data.temp_t2,
                    t3 : data.temp_t3,
                    t4 : data.temp_t4,
                    t5 : data.temp_t5,
                    t6 : data.temp_t6,
                    t7 : data.temp_t7,
                    t8 : data.temp_t8,
                    t9 : data.temp_t9,
                    t10 : data.temp_t10
                }
                finalData.push(Object);
            });
            res.send(finalData);
        } catch (error) {
            errorhandler.error(error);
            res.status(501).send({Error : error});
        }
    }
    else if(history_init_flag === 1){
        try {
            let historyDataSingle = (device === "trcx") ? await database.getTempDataSingle(todayDate, tomorrowDate) : {}
            let data = historyDataSingle[1][0]
            let logtime = moment(data.logtime).format();
            let logtimeDisplay = logtime.split('T')[0] + " " + (logtime.split('T')[1]).split('+')[0];
            let Object = {
                logtime : logtimeDisplay,
                t1 : data.temp_t1,
                t2 : data.temp_t2,
                t3 : data.temp_t3,
                t4 : data.temp_t4,
                t5 : data.temp_t5,
                t6 : data.temp_t6,
                t7 : data.temp_t7,
                t8 : data.temp_t8,
                t9 : data.temp_t9,
                t10 : data.temp_t10
            }
            res.send(Object);
        } catch (error) {
            errorhandler.error(error);
            res.status(501).send({Error : error});
        }
    }
});

//inverter history 
router.get('/invhistory', async (req,res) => {
    const history_init_flag = parseInt(req.query.init);
    const device = req.query.device;    

    const today = moment().format();
    const tomorrow = moment().add(1, 'days').format();
    const todayDate = today.split('T')[0] + " 00:00:00" ;
    const tomorrowDate = tomorrow.split('T')[0] + " 00:00:00";

    if(history_init_flag === 0){
        let finalData = []
        try {
            let historyDataBulk = (device === "inv") ? await database.getInvDataBulk(todayDate, tomorrowDate) : {};
            historyDataBulk.forEach(data =>{
                let logtime = moment(data.logtime).format();
                let logtimeDisplay = logtime.split('T')[0] + " " + (logtime.split('T')[1]).split('+')[0];
                let Object = {
                    logtime : logtimeDisplay,
                    inv1 : data.inv1,
                    inv2 : data.inv2,
                    inv3 : data.inv3,
                    timevalue : data.timevalue
                }
                finalData.push(Object)
            });
            res.send(finalData);
        } catch (error) {
            errorhandler.error(error);
            res.status(501).send({Error : error});
        }
    }
    else if(history_init_flag === 1){
        try {
            let historyDataSingle = (device === "inv") ? await database.getInvDataSingle(todayDate, tomorrowDate) : {};
            let data = historyDataSingle[1][0]
            let logtime = moment(data.logtime).format();
            let logtimeDisplay = logtime.split('T')[0] + " " + (logtime.split('T')[1]).split('+')[0];
            let Object = {
                logtime : logtimeDisplay,
                inv1 : data.inv1,
                inv2 : data.inv2,
                inv3 : data.inv3,
                timevalue : data.timevalue
            }
            res.send(Object);
        } catch (error) {
            errorhandler.error(error);
            res.status(501).send({Error : error});
        }
    }
})


module.exports = router