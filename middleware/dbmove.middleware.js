const DHouporCall = require("../modules/hopper/hopperSchema");
const DbackupHoupor = require("../modules/hopper/backuphopperSchema");
const Dcdr = require("../modules/cdr/cdrSchema");
const Dcdrbackup = require("../modules/cdr/cdrbackupSchema");
const DSetting =  require("../modules/dsetting/dsettingSchema")

// async function createBackupHopper() {
//   try {
//     const hopperData = await DHouporCall.find();
//     await DbackupHoupor.insertMany(hopperData);
//     console.log('Data coming in backup');
//     await DHouporCall.deleteMany({});
//     console.log('Data deleted');
//   } catch (error) {
//     console.error('Error backuphopper:', error);
//   } finally {
//     console.log(' Mission completed!');
//   }
// }
async function createBackupHopper() {
  try {
    const setting = await DSetting.findOne({ key: "hopperbackup" });
    const hopperBackupDays = setting ? parseInt(setting.value) : 7;

    const hopperDataToMove = await DHouporCall.find();
    const cutoffDate = new Date(); 

    const filteredData = hopperDataToMove.filter(item => {
      const callStartTime = new Date(item.call_start_time);
      const differenceInDays = Math.floor((cutoffDate - callStartTime) / (1000 * 60 * 60 * 24));
      return differenceInDays > hopperBackupDays;
    });
    const allCallStartTimesBeforeDeletion = hopperDataToMove.map(item => item.call_start_time);
    const callStartTimesToDelete = filteredData.map(item => item.call_start_time);
    const insertdata = await DbackupHoupor.insertMany(filteredData);
    const deletedate = await DHouporCall.deleteMany({ call_start_time: { $in: callStartTimesToDelete } });
    const allCallStartTimesAfterDeletion = await DHouporCall.find().distinct("call_start_time");

    console.log(`Data older than ${hopperBackupDays} days moved to backuphopper and deleted from DHouporCall successfully!`);
  } catch (error) {
    console.error('Error backuphopper:', error);
  } finally {
    console.log('Mission completed!');
  }
}

async function createBackupCDR() {
    try {
      const cdrData = await Dcdr.find();
      await Dcdrbackup.insertMany(cdrData);
      console.log('Data coming in backup');
      await Dcdr.deleteMany({});
      console.log('Data deleted');
    } catch (error) {
      console.error('Error backupcdr:', error);
    } finally {
      console.log('Mission completed!');
    }
  }

module.exports = {
  createBackupHopper, 
  createBackupCDR
};


async function getleft7daydata(){ 
const getdayvalue = await DSetting.find({
  $or: [
    { key: "hopperbackup" },
  ]
})
hopperbackup = getdayvalue.value;
console.log("checkdata--------------",getdayvalue)
}