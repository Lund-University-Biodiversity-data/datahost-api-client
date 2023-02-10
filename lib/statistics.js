
import configImp  from '../config/config.js';
const config = configImp;

import pkgMongo from 'mongodb';
const MongoClient = pkgMongo.MongoClient;

const statDBUrl = config.databaseStatisticsUrl;
const statDBName = config.databaseStatisticsName;
const statDBTable = config.databaseStatisticsTable;


// output : html, csv, xlsx
// objectType : Occurrence/Event/Dataset
function addStat (output, objectType) {

  MongoClient.connect(statDBUrl, function(err, db) {
    if (err) throw err;
    var dbo = db.db(statDBName);

    var todaynow = new Date().toISOString()

    var myobj = { date: todaynow, output: output, objectType: objectType };
    dbo.collection(statDBTable).insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 stat inserted");
      db.close();
    });
  });


}

export default { addStat };