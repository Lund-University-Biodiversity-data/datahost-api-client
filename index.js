
import configImp  from './config/config.js';
const config = configImp;

import templateHeadersImp  from './lib/functions/templateHeaders.js';
var templateHeaders = templateHeadersImp;

import utilsImp  from './lib/functions/utils.js';
var utils = utilsImp;

import pkgVD from 'var_dump';
const var_dump = pkgVD;

import pkgHttp from 'http';
const http = pkgHttp;

//var LuApiDocumentationTemplate = require('lu_api_documentation_template');
import pkgLU from 'lu_api_documentation_template';
const LuApiDocumentationTemplate = pkgLU;

import pkgFs from 'fs';
const fs = pkgFs;

import pkgExpress from 'express';
const express = pkgExpress;

import pkgBP from 'body-parser';
const parseUrl = pkgBP;

import pkgOCSV from 'objects-to-csv';
const ObjectsToCsv = pkgOCSV;

import pkgJson2csv from 'json2csv';
const { Parser } = pkgJson2csv;

import pkgFlat from 'flat';
var flatten = pkgFlat;

import pkgScanf from 'sscanf';
var scanf = pkgScanf;

import pkgCsvToXlsx from '@aternus/csv-to-xlsx';
const { convertCsvToXlsx } = pkgCsvToXlsx;

import pkgStats from './lib/statistics.js';
var stats = pkgStats;

//const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server

const speciesListUrl= config.speciesListUrl;

app.set('view engine', 'ejs');

// variable for the whole app
var maxResults = 1000;

// just put organisations details, the sub-fields are obtained later
const datasetColumnsTable = ["datasetName", "assignerDetails", "creatorDetails", "purpose", "description", "startDate", "accessRights", "descriptionAccessRights", "license"];
// just put siteDetails, the sub-fields are obtained later
const eventColumnsTable = ["datasetName", "eventStartDate", "locationProtected", "siteDetails", "samplingProtocol", "noObservations"];
// just put taxonDetails, the sub-fields are obtained later
const occurrenceColumnsTable = ["datasetName", "taxonDetails", "occurrenceStatus", "quantity", "occurrenceRemarks", "observationCertainty"];

var fieldsTranslations=templateHeaders.getHeadersHtmlView();


const availableDatasets = config.availableDatasets;

const tableTaxon=[];

// for xslx mapping fields

var totalResults;

const tableCounty = [/*'None selected', */'Stockholms län', 'Västerbottens län', 'Norrbottens län', 'Uppsala län', 'Södermanlands län', 'Östergötlands län', 'Jönköpings län', 'Kronobergs län', 'Kalmar län', 'Gotlands län', 'Blekinge län', 'Skåne län', 'Hallands län', 'Västra Götalands län', 'Värmlands län', 'Örebro län', 'Västmanlands län', 'Dalarnas län', 'Gävleborgs län', 'Västernorrlands län', 'Jämtlands län'];
tableCounty.sort(); // alphaebetical sort

var downloadFile = "";


function throwErrorToClient(res, errorCode, inputObject, inputDatasetList, inputSourceSubmit, inputTaxon, inputCounty, inputArea, inputStartDate, inputEndDate, inputDateType) {

  var errorMsg="";

  console.error(errorCode);

  if (errorCode=="ETOOLARGE" || errorCode=="ETOOLARGE_maxlimit") {
    // Maximum response size reached 
    errorMsg="[Maximum response size reached] Förfina din sökning för att minska urvalet. För hjälp med stora datauttag kontakta datavärden på naturdatavardskap@biol.lu.se.";
  }
  else if (errorCode=="ECONNABORTED") {
    // Timeout as specified in luApiDocumentationTemplate, src/ApiClient.js
    errorMsg="[Timeout] Förfina din sökning för att minska urvalet. För hjälp med stora datauttag kontakta datavärden på naturdatavardskap@biol.lu.se.";
  }
  else {
    errorMsg="Error received from the server";
  }

  stats.addStat("error-"+errorCode, inputObject);

  //renderIndex(res, false, "error apiInstance");
  console.log("renderIndex from error apiInstance");
  res.render('pages/index', {
    maxResults: maxResults,                 // GLOBAL
    availableDatasets: availableDatasets,   // GLOBAL
    tableCounty: tableCounty,               // GLOBAL
    tableTaxon: tableTaxon,                 // GLOBAL
    errorMsg: errorMsg,                     // session
    inputObject: inputObject,               // session, default
    inputDatasetList: inputDatasetList,     // session, default
    inputSourceSubmit: inputSourceSubmit,   // session, default
    inputTaxon: inputTaxon,                 // session, default
    inputCounty: inputCounty,               // session, default
    inputArea: inputArea,                   // session, default
    inputStartDate: inputStartDate,         // session, default
    inputEndDate: inputEndDate,             // session, default
    inputDateType: inputDateType,           // session, default
    isDataTable: false,               // session, false
    downloadFile: ""               // optional
  });

}


function getDatasetDataForXlsx(res, host, inputObject, dataEvent, dataOccurrence, inputDatasetList, inputSourceSubmit, inputTaxon, inputCounty, inputArea, inputStartDate, inputEndDate, inputDateType){

  //console.log("function getDatasetDataForXlsx "+inputObject);

  let apiInstance, opts, getResultsBySearch;

  var datasetIDsExtra=[];

  Object.entries(dataEvent).forEach(elt => {
    if (elt[1].hasOwnProperty("datasetID")) {
      if (!datasetIDsExtra.includes(elt[1].datasetID))
        datasetIDsExtra.push(elt[1].datasetID);
    }
  });

  if (datasetIDsExtra.length>0) {
    var dataInputExtraDataset = {};
    dataInputExtraDataset.datasetIds=datasetIDsExtra;

    apiInstance = new LuApiDocumentationTemplate.DatasetApi();

    opts = { 
      'body': LuApiDocumentationTemplate.DatasetFilter.constructFromObject(dataInputExtraDataset),
      'skip': 0, // Number | Start index
      'take': config.maximumNumberRowsTake, // Number | Number of items to return. 1000 items is the max to return in one call.
      'exportMode': 'json'
    };

    getResultsBySearch="getDatasetsBySearch";

    apiInstance[getResultsBySearch](opts, (error, data, response) => {
      if (error) {
        throwErrorToClient(res, error.code, inputObject, inputDatasetList, inputSourceSubmit, inputTaxon, inputCounty, inputArea, inputStartDate, inputEndDate, inputDateType);
        //console.error(error);

      } else {

        if (config.maximumNumberRowsTake == data.totalCount) {
          throwErrorToClient(res, "ETOOLARGE_maxlimit", inputObject, inputDatasetList, inputSourceSubmit, inputTaxon, inputCounty, inputArea, inputStartDate, inputEndDate, inputDateType); 
        }

        else {
          //console.log('API POST called successfully. Returned data: ' + data);
          console.log('API POST called again (datasets) successfully');
          console.log(data.totalCount+" result(s)");

          var dataDataset=transformDatasetData(data.results);

          downloadFile = writeXlsxFlattened(host, inputObject, dataDataset, dataEvent, dataOccurrence);

          // stats
          stats.addStat("xlsx", inputObject);
              
          //renderIndex(res, false, "getDatasetDataForXlsx"+inputObject);
          console.log("renderIndex from getDatasetDataForXlsx"+inputObject);

          res.render('pages/index', {
            maxResults: maxResults,                 // GLOBAL
            availableDatasets: availableDatasets,   // GLOBAL
            tableCounty: tableCounty,               // GLOBAL
            tableTaxon: tableTaxon,                 // GLOBAL
            errorMsg: "",                     // session
            inputObject: inputObject,               // session, default
            inputDatasetList: inputDatasetList,     // session, default
            inputSourceSubmit: inputSourceSubmit,   // session, default
            inputTaxon: inputTaxon,                 // session, default
            inputCounty: inputCounty,               // session, default
            inputArea: inputArea,                   // session, default
            inputStartDate: inputStartDate,         // session, default
            inputEndDate: inputEndDate,             // session, default
            inputDateType: inputDateType,           // session, default
            isDataTable: false,               // session, false
            downloadFile: downloadFile               // optional
          });
        }


      }
    });

  }
  else {
  }

}

// remove the last column with all the eventsIds, put the number of events instead
function transformDatasetData (data) {
  
  //console.log("transformDatasetData function");

  var dataDataset = [];

  Object.entries(data).forEach(elt => {
    const row = [];

    Object.entries(elt[1]).forEach(entry => {
      const [key, value] = entry;

      if (key=="eventIds") {
        row["eventIds"]=value.length;
      }
      else {
        row[key]=value;
      }
    });
    dataDataset.push(row);

  });
  
  //console.log("dataDataset length : " + dataDataset.length);
  
  return dataDataset;
}


function transformEventData (data) {
  
  //console.log("transformEventData function");

  var dataDataset = [];

  Object.entries(data).forEach(elt => {
    const row = [];
    Object.entries(elt[1]).forEach(entry => {
      const [key, value] = entry;

      if (key=="occurrenceIds") {
        row["occurrenceIds"]=value.length;
      }
      else {
        row[key]=value;
      }
    });
    dataDataset.push(row);

  });
  
  //console.log("dataEvent length : " + dataDataset.length);
  
  return dataDataset;
}




function updateToTemplateXlsx (dataInput, inputObject) {

  var dataInTemplate=[];
  var dataInTemplateCleaned=[];

  var templateXlsxHeader=templateHeaders.getTemplateXlsxHeader(inputObject);

  // check which columns are empty
  // set everything to true
  var emptyColumns=[];
  Object.entries(templateXlsxHeader).forEach(([key, val]) => {
    emptyColumns[val]=true;
  });

  // for each dataset of the data
  Object.entries(dataInput).forEach(datasetI => {

    var oneDataset=[];
    // check the template header
    Object.entries(templateXlsxHeader).forEach(([key, val]) => {
      // key is 1.nameofthekeyfromtheserver
      // val is the column name in the excel file in swedish

      if (key in datasetI[1]) {
        oneDataset[val]=datasetI[1][key];
        if (oneDataset[val]!="") emptyColumns[val]=false;
      }
      else if (("1.datasetData." + key) in datasetI[1]) {
        oneDataset[val]=datasetI[1][("1.datasetData." + key)];
        if (oneDataset[val]!="") emptyColumns[val]=false;
      }
      else if (("1.eventData." + key) in datasetI[1]) {
        oneDataset[val]=datasetI[1][("1.eventData." + key)];
        if (oneDataset[val]!="") emptyColumns[val]=false;
      }
      else if (!(val in oneDataset)) { // check if the field has not already been filled (like the detailed start/end date-time)
        //console.log("key notfound "+key);
        oneDataset[val]="";
      }

      // split the startDate/time in colums
      if (key=="1.eventStartDate" && oneDataset[val]!="") {

        var splitDate=utils.splitDateInArray(oneDataset[val]);

        if (splitDate.length>=3) {
          oneDataset["inventeringsstartår"]=splitDate[0];
          oneDataset["inventeringsstartmånad"]=splitDate[1];
          oneDataset["inventeringsstartdag"]=splitDate[2];

          emptyColumns["inventeringsstartår"]=false;
          emptyColumns["inventeringsstartmånad"]=false;
          emptyColumns["inventeringsstartdag"]=false;


          /*
          OLD WHEN time was included in date field
          if (splitDate.length==6) {
            oneDataset["inventeringsstarttid"]=splitDate[3]+":"+splitDate[4]+":"+splitDate[5];
            emptyColumns["inventeringsstarttid"]=false;
          }*/

        }
      }

      // split the endDate/time in colums
      if (key=="1.eventEndDate" && oneDataset[val]!="") {

        var splitDate=utils.splitDateInArray(oneDataset[val]);

        if (splitDate.length>=3) {

          oneDataset["inventeringsslutår"]=splitDate[0];
          oneDataset["inventeringsslutmånad"]=splitDate[1];
          oneDataset["inventeringsslutdag"]=splitDate[2];

          emptyColumns["inventeringsslutår"]=false;
          emptyColumns["inventeringsslutmånad"]=false;
          emptyColumns["inventeringsslutdag"]=false;

          /*
          OLD WHEN time was included in date field
          if (splitDate.length==6) {
            oneDataset["inventeringssluttid"]=splitDate[3]+":"+splitDate[4]+":"+splitDate[5];
            emptyColumns["inventeringssluttid"]=false;
          }*/

        }
      }

      // gather the coordinates - POINT 1
      if (key=="1.site.emplacement.geometry.point1" || key=="1.eventData.1.site.emplacement.geometry.point1") {

        var coordX="";
        var coordY="";
        if ("1.site.emplacement.geometry.coordinates.0" in datasetI[1] && datasetI[1]["1.site.emplacement.geometry.coordinates.0"]!="")
          coordX=datasetI[1]["1.site.emplacement.geometry.coordinates.0"];
        if ("1.eventData.1.site.emplacement.geometry.coordinates.0" in datasetI[1] && datasetI[1]["1.eventData.1.site.emplacement.geometry.coordinates.0"]!="")
          coordX=datasetI[1]["1.eventData.1.site.emplacement.geometry.coordinates.0"];
        if ("1.site.emplacement.geometry.coordinates.1" in datasetI[1] && datasetI[1]["1.site.emplacement.geometry.coordinates.1"]!="")
          coordY=datasetI[1]["1.site.emplacement.geometry.coordinates.1"];
        if ("1.eventData.1.site.emplacement.geometry.coordinates.1" in datasetI[1] && datasetI[1]["1.eventData.1.site.emplacement.geometry.coordinates.01"]!="")
          coordY=datasetI[1]["1.eventData.1.site.emplacement.geometry.coordinates.1"];

        if (coordX!="" && coordY!="") {
          oneDataset["lokal:position:punkt 1"]=coordX + ", " + coordY;
          emptyColumns["lokal:position:punkt 1"]=false;
        }
      }

      // gather the coordinates - POINT 2
      if (key=="1.site.emplacement2.geometry.point2" || key=="1.eventData.1.site.emplacement2.geometry.point2") {

        var coordX="";
        var coordY="";
        if ("1.site.emplacement2.geometry.coordinates.0" in datasetI[1] && datasetI[1]["1.site.emplacement2.geometry.coordinates.0"]!="")
          coordX=datasetI[1]["1.site.emplacement2.geometry.coordinates.0"];
        if ("1.eventData.1.site.emplacement2.geometry.coordinates.0" in datasetI[1] && datasetI[1]["1.eventData.1.site.emplacement2.geometry.coordinates.0"]!="")
          coordX=datasetI[1]["1.eventData.1.site.emplacement2.geometry.coordinates.0"];
        if ("1.site.emplacement2.geometry.coordinates.1" in datasetI[1] && datasetI[1]["1.site.emplacement2.geometry.coordinates.1"]!="")
          coordY=datasetI[1]["1.site.emplacement2.geometry.coordinates.1"];
        if ("1.eventData.1.site.emplacement2.geometry.coordinates.1" in datasetI[1] && datasetI[1]["1.eventData.1.site.emplacement2.geometry.coordinates.01"]!="")
          coordY=datasetI[1]["1.eventData.1.site.emplacement2.geometry.coordinates.1"];

        if (coordX!="" && coordY!="") {
          oneDataset["lokal:position:punkt 2"]=coordX + ", " + coordY;
          emptyColumns["lokal:position:punkt 2"]=false;
        }
      }

      // gather the coordinates - POINT 3
      if (key=="1.site.emplacement3.geometry.point3" || key=="1.eventData.1.site.emplacement3.geometry.point3") {

        var coordX="";
        var coordY="";
        if ("1.site.emplacement3.geometry.coordinates.0" in datasetI[1] && datasetI[1]["1.site.emplacement3.geometry.coordinates.0"]!="")
          coordX=datasetI[1]["1.site.emplacement3.geometry.coordinates.0"];
        if ("1.eventData.1.site.emplacement3.geometry.coordinates.0" in datasetI[1] && datasetI[1]["1.eventData.1.site.emplacement3.geometry.coordinates.0"]!="")
          coordX=datasetI[1]["1.eventData.1.site.emplacement3.geometry.coordinates.0"];
        if ("1.site.emplacement3.geometry.coordinates.1" in datasetI[1] && datasetI[1]["1.site.emplacement3.geometry.coordinates.1"]!="")
          coordY=datasetI[1]["1.site.emplacement3.geometry.coordinates.1"];
        if ("1.eventData.1.site.emplacement3.geometry.coordinates.1" in datasetI[1] && datasetI[1]["1.eventData.1.site.emplacement3.geometry.coordinates.01"]!="")
          coordY=datasetI[1]["1.eventData.1.site.emplacement3.geometry.coordinates.1"];

        if (coordX!="" && coordY!="") {
          oneDataset["lokal:position:punkt 3"]=coordX + ", " + coordY;
          emptyColumns["lokal:position:punkt 3"]=false;
        }
      }

      if (key=="1.taxon.scientificName") {

        // specific check for the scientificName
        var splitSN = scanf(oneDataset["vetenskapligt namn"], "%s %s %s");
        oneDataset["släkte"]=splitSN[0];
        emptyColumns["släkte"]=false;
        if (1 in splitSN) {
          oneDataset["art"]=splitSN[1];
          if (oneDataset["art"]!="") emptyColumns["art"]=false;
        }
        if (2 in splitSN) {
          oneDataset["underart"]=splitSN[2];
          if (oneDataset["underart"]!="") emptyColumns["underart"]=false;
        }
      }
    });
    dataInTemplate.push(oneDataset);
  });

  //console.log(emptyColumns);

  // remove the empty columns
  Object.entries(dataInTemplate).forEach((datasetline, indD) => {

    Object.entries(emptyColumns).forEach((emptyline, indE) => {
      const [key, value] = emptyline;

      if (value) {
        delete datasetline[1][key];
        //console.log("key ca degage" + key);
      }
    });

    dataInTemplateCleaned.push(datasetline[1]);

  });

  return dataInTemplateCleaned;
}

function writeXlsxFlattened (host, inputObject, dataDataset, dataEvent, dataOccurrence) {
  
  //console.log("writeXlsxFlattened function "+inputObject);

  var dataFinal = [];
  var okCreate=true;

  if (inputObject == "Event") {

    if (dataEvent != null && dataDataset != null) {
      var datasetFinalAsIndexedArray = [];

      // create array of datasets
      Object.entries(dataDataset).forEach(elt => {
        datasetFinalAsIndexedArray[elt[1].identifier]=elt;
      });

      // remove occurrences details from events
      dataEvent=transformEventData(dataEvent);

      Object.entries(dataEvent).forEach(elt => {

        if (datasetFinalAsIndexedArray[elt[1].datasetID]) {
          elt[1].datasetData=datasetFinalAsIndexedArray[elt[1].datasetID];
        }
        else {
          console.log("No dataset data in datasetFinalAsIndexedArray for datasetID : "+elt[1].datasetID);
        }

        dataFinal.push(flatten(elt));

      });
    }
    else {
      okCreate=false;
      console.log("ERROR : missing data dataEvent/dataDataset");
    }

  }
  else if (inputObject == "Occurrence") {

    if (dataEvent != null && dataOccurrence != null && dataDataset != null) {

      var datasetFinalAsIndexedArray = [];

      // create array of datasets
      Object.entries(dataDataset).forEach(elt => {
        datasetFinalAsIndexedArray[elt[1].identifier]=elt;
      });

      var eventFinalAsIndexedArray = [];

      // create array of datasets
      Object.entries(dataEvent).forEach(elt => {
        eventFinalAsIndexedArray[elt[1].eventID]=elt;
      });

      Object.entries(dataOccurrence).forEach(elt => {

        if (eventFinalAsIndexedArray[elt[1].eventID]) {
          elt[1].eventData=eventFinalAsIndexedArray[elt[1].eventID];
        }
        else {
          console.log("No event data in eventFinalAsIndexedArray for event : "+elt[1].event);
        }

        if (datasetFinalAsIndexedArray[elt[1].datasetID]) {
          elt[1].datasetData=datasetFinalAsIndexedArray[elt[1].datasetID];
        }
        else {
          console.log("No dataset data in datasetFinalAsIndexedArray for datasetID : "+elt[1].datasetID);
        }

        dataFinal.push(flatten(elt));

      });
    }
    else {
      okCreate=false;
      console.log("ERROR : missing data dataEvent/dataOccurrence");
    }

  }
  else if (inputObject == "Dataset") {

    Object.entries(dataDataset).forEach(elt => {
      dataFinal.push(flatten(elt));

    });

  }
  else {
    okCreate=false;
    console.log("ERROR : wrong inputObject "+inputObject);
  }


  dataFinal = updateToTemplateXlsx(dataFinal, inputObject);


  if (okCreate) {

    const json2csv = new Parser();

    const csv = json2csv.parse(dataFinal);
    
    let ts = Date.now();
    let date_ob = new Date(ts);
    var filenameBase = "data_"+inputObject+"_"+date_ob.getFullYear()+(("0" + (date_ob.getMonth() + 1)).slice(-2))+(("0" + date_ob.getDate()).slice(-2))+"_"+(("0" + date_ob.getHours()).slice(-2))+date_ob.getMinutes()+date_ob.getSeconds();
    var filenameCsv=filenameBase+".csv";
    var csvPath=config.downloadFolderUrl+filenameCsv;

    try {

      fs.writeFileSync(csvPath, csv);

      var filenameXlsx=filenameBase+".xlsx";
      var xlsxPath = config.downloadFolderUrl+filenameXlsx;

      convertCsvToXlsx(csvPath, xlsxPath);

      // delete the csv file once the xlsx is created
      fs.unlinkSync(csvPath);

      downloadFile = "http://" + host + "/" + filenameXlsx;      

      console.log("Data saved in "+xlsxPath+" ("+dataFinal.length+" row(s))");

      return downloadFile;

    } 
    catch (e) {
      console.log("ERROR write csv/xlsx "+e.toString());
    }

  }
  else {
    return 0;
  }


}


// get /
app.get('/', (req, res) => {        //get requests to the root ("/") will route here

  var inputObject = config.defaultObject;
  var inputDatasetList = config.defaultDatasetList;
  var inputSourceSubmit = config.defaultSourceSubmit;
  var inputTaxon = config.defaultTaxon;
  var inputCounty = config.defaultCounty;
  var inputArea = config.defaultArea;
  var inputStartDate = config.defaultStartDate;
  var inputEndDate = config.defaultEndDate;
  var inputDateType = config.defaultDateType;


  //renderIndex(res, false, "app.get");
  console.log("renderIndex from app.get");

  res.render('pages/index', {
    maxResults: maxResults,                 // GLOBAL
    availableDatasets: availableDatasets,   // GLOBAL
    tableCounty: tableCounty,               // GLOBAL
    tableTaxon: tableTaxon,                 // GLOBAL
    errorMsg: "",                     // session
    inputObject: inputObject,               // session, default
    inputDatasetList: inputDatasetList,     // session, default
    inputSourceSubmit: inputSourceSubmit,   // session, default
    inputTaxon: inputTaxon,                 // session, default
    inputCounty: inputCounty,               // session, default
    inputArea: inputArea,                   // session, default
    inputStartDate: inputStartDate,         // session, default
    inputEndDate: inputEndDate,             // session, default
    inputDateType: inputDateType,           // session, default
    isDataTable: false,               // session, false
    downloadFile: ""               // optional
  });
});


/*
// get /about
app.get('/about', function(req, res) {
  res.render('pages/about');
});
*/

let encodeUrl = parseUrl.urlencoded({ extended: false });

app.post('/', encodeUrl, (req, res) => {
  console.log('Form request:', req.body);


  var exportMode = "";
  var responseCoordinateSystem = "EPSG:4326";
  var errorMsg = "";

  const dataInput = {};

  // CREATE THE dataInput based on the form

  // get the export Mode based on the clicked button
  var inputSourceSubmit = req.body.inputSourceSubmit;
        

  if (inputSourceSubmit=="exportCsv") {
    exportMode="csv";
  }
  /*
  else if (inputSourceSubmit=="exportXlsx") {
    dataInput.exportMode="xlsx";
  }
  // json even for xlsx
  */
  else exportMode="json";



  // reinit
  var inputTaxon=[];
  if (typeof req.body.inputTaxon !== 'undefined' && req.body.inputTaxon!="") {

    let taxonIds= [];

    // several items selected
    if (req.body.inputTaxon instanceof Array) {

      req.body.inputTaxon.forEach((element) => {
        taxonIds.push(parseInt(element));
      });
//      taxonIds = req.body.inputTaxon;
    }
    // only one item
    else {
      if (req.body.inputTaxon != "None selected")
        taxonIds.push(parseInt(req.body.inputTaxon));
    }

    if (taxonIds.length>=1) {
      dataInput.taxon = {
        ids : []
      };

      taxonIds.forEach((element) => {
        if (element!="None selected") {

          // the taxon hierarchy is managed from the server side 
          dataInput.taxon.ids.push(parseInt(element));
        }
      });
    }

    //inputTaxon = req.body.inputTaxon;
    inputTaxon = taxonIds;
//console.log("new inputTaon is ");
  }

  //console.log("radioGeography:"+req.body.radioGeography);

  var inputCounty=["None selected"];
  if (req.body.radioGeography=="lanmun") {
    // reinit
    if (typeof req.body.inputCounty !== 'undefined' && req.body.inputCounty!="") {

      let countyNames= [];

      // several items selected
      if (req.body.inputCounty instanceof Array) {
        countyNames = req.body.inputCounty;
      }
      // only one item
      else {
        if (req.body.inputCounty != "None selected")
          countyNames.push(req.body.inputCounty);
      }

      if (countyNames.length>=1) {

        dataInput.area = {
          county : []
        };
        countyNames.forEach((element) => {
          if (element!="None selected")
            dataInput.area.county.push(element.trim());
        });

      }

      inputCounty = req.body.inputCounty;
    } 
  }

  var inputArea="";
  if (req.body.radioGeography=="karta") {

    // reinit
    if (typeof req.body.inputArea !== 'undefined' && req.body.inputArea!="") {

      var coordinates = req.body.inputArea;
      console.log("coordinates avant "+coordinates);

      coordinates = coordinates.replace(new RegExp('LatLng\\(', 'g'), "");
      coordinates = coordinates.replace(new RegExp('\\),', 'g'), "#");
      coordinates = coordinates.replace(new RegExp('\\)', 'g'), "");
      coordinates = coordinates.replace(new RegExp('\\, ', 'g'), ",");


      console.log("coordinates apres "+coordinates);

      const coordArrSplit = coordinates.split("#");

      if (coordArrSplit.length>1 ) {
        const coordArr=[];
        coordArrSplit.forEach(elt => {

         var point=elt.split(",");

         coordArr.push([
            parseFloat(point[0]), parseFloat(point[1])
          ]);
        });

        if (typeof dataInput.area !== 'undefined' ){
          dataInput.area.area ={
            geographicArea: {
              featureLP: {
                geometry: {
                  type:"Polygon",
                  coordinates: coordArr
                }
              }
            }
          };
        }
        else {
          dataInput.area = {
            area: {
              geographicArea: {
                featureLP: {
                  geometry: {
                    type:"Polygon",
                    coordinates: coordArr
                  }
                }
              }
            } 
          };
        }

        console.log(dataInput.area);

        //inputArea = coordArr;
        inputArea = coordinates;
        //inputArea = req.body.inputArea;
      }
      else {
        console.log("Error, only "+coordArrSplit.length+" points in the bounding box");
        inputArea="";
      }

    }
  }

  // reinit
  var inputStartDate="";
  var inputEndDate="";  
  var inputDateType= config.defaultDateType;
 
  if ( (typeof req.body.inputStartDate !== 'undefined' && req.body.inputStartDate !="")
   || (typeof req.body.inputEndDate !== 'undefined' && req.body.inputEndDate !="")) {

    dataInput.datum={};

    if (typeof req.body.inputStartDate !== 'undefined' && req.body.inputStartDate !="") {
      inputStartDate=req.body.inputStartDate;
      dataInput.datum["startDate"] = inputStartDate;
    }
    if (typeof req.body.inputEndDate !== 'undefined' && req.body.inputEndDate !="") {
      inputEndDate=req.body.inputEndDate;
      dataInput.datum["endDate"] = inputEndDate;
    }

    dataInput.datum["dateFilterType"] = inputDateType;

    //console.log("date filter : ");
    //console.log(dataInput.datum);

  }

  var inputDatasetList = []; // reinit
  if (typeof req.body.datasetCheckB !== 'undefined' && req.body.datasetCheckB.length>=1) {

    if (typeof req.body.datasetCheckB == "string") {
      inputDatasetList.push(req.body.datasetCheckB);
    }
    else { // object => several elements
      inputDatasetList=req.body.datasetCheckB;
    }

    dataInput.datasetIds=inputDatasetList;
  }

  const dataInputLength = Object.getOwnPropertyNames(dataInput);

  console.log("dataInput array :");
  var_dump(dataInput);

  var inputObject = req.body.inputObject;
  //console.log("INPUT OBJECT : ");


  // CALL THE API

  if (dataInputLength.length>=1) {

    let apiInstance, opts, getResultsBySearch;

    switch(inputObject) {
      case "Dataset":
        apiInstance = new LuApiDocumentationTemplate.DatasetApi();

        opts = { 
          'body': LuApiDocumentationTemplate.DatasetFilter.constructFromObject(dataInput),
          'skip': 0, // Number | Start index
          'take': config.maximumNumberRowsTake, // Number | Number of items to return. 1000 items is the max to return in one call.
          'exportMode': exportMode
        };

        getResultsBySearch="getDatasetsBySearch";
        break;

      case "Occurrence":
        apiInstance = new LuApiDocumentationTemplate.OccurrenceApi();

        opts = { 
          'body': LuApiDocumentationTemplate.OccurrenceFilter.constructFromObject(dataInput),
          'skip': 0, // Number | Start index
          'take': config.maximumNumberRowsTake, // Number | Number of items to return. 1000 items is the max to return in one call.
          'exportMode': exportMode
        };

        getResultsBySearch="getOccurrencesBySearch";

        break;

      case "Event":
      default:
        apiInstance = new LuApiDocumentationTemplate.EventApi();

        opts = { 
          'body': LuApiDocumentationTemplate.EventsFilter.constructFromObject(dataInput), // EventsFilter | Filter used to limit the search.
          'skip': 0, // Number | Start index
          'take': config.maximumNumberRowsTake, // Number | Number of items to return. 1000 items is the max to return in one call.
          'exportMode': exportMode
        };

        getResultsBySearch="getEventsBySearch";

        break;
    }

    //apiInstance.getEventsBySearch(opts, (error, data, response) => {
    // dynamic method name called
    apiInstance[getResultsBySearch](opts, (error, data, response) => {
      if (error) {

        throwErrorToClient(res, error.code, inputObject, inputDatasetList, inputSourceSubmit, inputTaxon, inputCounty, inputArea, inputStartDate, inputEndDate, inputDateType);


      } else {

        if (config.maximumNumberRowsTake == data.totalCount) {
          throwErrorToClient(res, "ETOOLARGE_maxlimit", inputObject, inputDatasetList, inputSourceSubmit, inputTaxon, inputCounty, inputArea, inputStartDate, inputEndDate, inputDateType); 
        }

        else {

          errorMsg="";
          
          //console.log('API POST called successfully. Returned data: ' + data);
          console.log('API POST called successfully');
          //console.log(opts);

          //var_dump(data);

          var tableColumns =[];
          var tableData =[];

          if (inputSourceSubmit=="exportCsv") {

            totalResults = data.length;
            console.log(totalResults+" result(s)");

            let ts = Date.now();
            let date_ob = new Date(ts);

            var filenameCsv="data_"+inputObject+"_"+date_ob.getFullYear()+(("0" + (date_ob.getMonth() + 1)).slice(-2))+(("0" + date_ob.getDate()).slice(-2))+"_"+date_ob.getHours()+date_ob.getMinutes()+date_ob.getSeconds()+".csv";
            var csvPath=config.downloadFolderUrl+filenameCsv;

            // async create csv file
            (async () => {

              // split the csv data in an array
              var allCsvAsRows = data.split(/\r\n|\n/);
              // get only the headers
              var headersCsv = allCsvAsRows[0].split(',');
              var headersCsvTranslated=[];
              Object.entries(headersCsv).forEach(([key, fieldname]) => {
                // removes the quotes
                fieldname=fieldname.replace(/['"]+/g, '');
                //console.log(  fieldname);
                if (fieldname in fieldsTranslations) headersCsvTranslated.push(fieldsTranslations[fieldname]);
                else headersCsvTranslated.push(fieldname);
              });
              //console.log(headersCsvTranslated);
              //replace the first line by the translated headers
              allCsvAsRows[0]=headersCsvTranslated;
              // recreate a csv file
              var dataCsv=allCsvAsRows.join("\n");

              fs.writeFileSync(csvPath, dataCsv);

              downloadFile = "http://" + req.get('host') + "/" + filenameCsv;

              // Return the CSV file as string:
              //console.log(await csv.toString());
              console.log("Data saved in "+csvPath+" ("+totalResults+" row(s))");

              // stats
              stats.addStat("csv", inputObject);
              
              //renderIndex(res, false, "exportCsv");
              console.log("renderIndex from exportCsv");
              res.render('pages/index', {
                maxResults: maxResults,                 // GLOBAL
                availableDatasets: availableDatasets,   // GLOBAL
                tableCounty: tableCounty,               // GLOBAL
                tableTaxon: tableTaxon,                 // GLOBAL
                errorMsg: "",                     // session
                inputObject: inputObject,               // session, default
                inputDatasetList: inputDatasetList,     // session, default
                inputSourceSubmit: inputSourceSubmit,   // session, default
                inputTaxon: inputTaxon,                 // session, default
                inputCounty: inputCounty,               // session, default
                inputArea: inputArea,                   // session, default
                inputStartDate: inputStartDate,         // session, default
                inputEndDate: inputEndDate,             // session, default
                inputDateType: inputDateType,           // session, default
                isDataTable: false,               // session, false
                downloadFile: downloadFile               // optional
              });


            })();
            // end async create csv file

          }

          else if (inputSourceSubmit=="exportXlsx") {

            totalResults = data.totalCount;
            console.log(totalResults+" result(s)");

            // SPECIFIC LU formating for the xlsx
            // needs to be flattened 
            // and extended to the extensive information (dataset+events+sites+occurrences)

            var dataDataset=[];

            switch(inputObject) {
              case "Dataset":

                dataDataset=transformDatasetData(data.results);

                downloadFile = writeXlsxFlattened(req.get('host'), inputObject, dataDataset, null, null);

                // stats
                stats.addStat("xlsx", inputObject);
              
                //renderIndex(res, false, "xlsxdataset");
                console.log("renderIndex from xlsx dataset");
                res.render('pages/index', {
                  maxResults: maxResults,                 // GLOBAL
                  availableDatasets: availableDatasets,   // GLOBAL
                  tableCounty: tableCounty,               // GLOBAL
                  tableTaxon: tableTaxon,                 // GLOBAL
                  errorMsg: "",                     // session
                  inputObject: inputObject,               // session, default
                  inputDatasetList: inputDatasetList,     // session, default
                  inputSourceSubmit: inputSourceSubmit,   // session, default
                  inputTaxon: inputTaxon,                 // session, default
                  inputCounty: inputCounty,               // session, default
                  inputArea: inputArea,                   // session, default
                  inputStartDate: inputStartDate,         // session, default
                  inputEndDate: inputEndDate,             // session, default
                  inputDateType: inputDateType,           // session, default
                  isDataTable: false,               // session, false
                  downloadFile: downloadFile               // optional
                });

                break;

              case "Event":
                var dataEvent=data.results;

                downloadFile = getDatasetDataForXlsx(res, req.get('host'), inputObject, dataEvent, null, inputDatasetList, inputSourceSubmit, inputTaxon, inputCounty, inputArea, inputStartDate, inputEndDate, inputDateType);

                break;
              case "Occurrence":
                var dataOccurrence=data.results;

                // new request to the server with the same input parameters, but for events

                apiInstance = new LuApiDocumentationTemplate.EventApi();

                opts = { 
                  'body': LuApiDocumentationTemplate.EventsFilter.constructFromObject(dataInput),
                  'skip': 0, // Number | Start index
                  'take': config.maximumNumberRowsTake, // Number | Number of items to return. 1000 items is the max to return in one call.
                  'exportMode': exportMode
                };

                getResultsBySearch="getEventsBySearch";

                apiInstance[getResultsBySearch](opts, (error, data, response) => {
                  if (error) {
                    //console.error(error);
                    throwErrorToClient(res, error.code, inputObject, inputSourceSubmit, inputTaxon, inputCounty, inputArea, inputStartDate, inputEndDate, inputDateType);

                  } else {

                    if (config.maximumNumberRowsTake == data.totalCount) {
                      throwErrorToClient(res, "ETOOLARGE_maxlimit", inputObject, inputDatasetList, inputSourceSubmit, inputTaxon, inputCounty, inputArea, inputStartDate, inputEndDate, inputDateType); 
                    }
            
                    else {
                      //console.log('API POST called successfully. Returned data: ' + data);
                      console.log('API POST called again (events) successfully');
                      console.log(data.totalCount+" result(s)");

                      dataEvent=transformEventData(data.results);

                      //console.log("data event obtained !");

                      getDatasetDataForXlsx(res, req.get('host'), inputObject, dataEvent, dataOccurrence, inputDatasetList, inputSourceSubmit, inputTaxon, inputCounty, inputArea, inputStartDate, inputEndDate, inputDateType);
                    }
                  }
                });

                break;
            }

          } // end if EXPORTXLSX
          else { // view table

            totalResults = data.totalCount;
            console.log(totalResults+" result(s) in json");

            // IF NOT EXPORTCSV/EXPORTXLSX
            downloadFile="";

            if(data.totalCount>0) {

              let dataCut;

              // get maximum XXX elements
              if(data.totalCount>maxResults) {
                console.log("Cut data results to "+maxResults);
                dataCut = data.results.slice(0, maxResults);
              }
              else {
                dataCut = data.results;
              }

              var templateColumnTable;
              if (inputObject=="Event") templateColumnTable=eventColumnsTable;
              else if (inputObject=="Dataset") templateColumnTable=datasetColumnsTable;
              else if (inputObject=="Occurrence") templateColumnTable=occurrenceColumnsTable;

              // 1- create the tabl header with column names
              Object.entries(templateColumnTable).forEach(([key, fieldname]) => {
                //console.log(fieldname);

                if (fieldname=="taxonDetails") {
                  //tableColumns.push("taxon");
                  tableColumns.push("dyntaxaId");
                  tableColumns.push("scientificName");
                  tableColumns.push("vernacularName");
                }
                else if (fieldname=="siteDetails") {
                  tableColumns.push("locationID");
                  tableColumns.push("locationType");
                  tableColumns.push("coordinates1Point");
                  tableColumns.push("county");
                }
                else if (fieldname=="assignerDetails") {
                  tableColumns.push("assignerOrganisationCode");
                }
                else if (fieldname=="creatorDetails") {
                  tableColumns.push("creatorOrganisationCode");
                }
                else {
                  tableColumns.push(fieldname);
                }
  //<%= (tableColumns[i] in fieldsTranslations ? fieldsTranslations[tableColumns[i]] : tableColumns[i]) %>

              });

              // 2- create the data table based on the column names
              Object.entries(dataCut).forEach(elt => {
                const row = [];

                Object.entries(tableColumns).forEach(([key,fieldname]) => {
                  if (fieldname=="eventIds") {
                    row["eventIds"]=elt[1][fieldname].length;
                  }
                  else if (fieldname=="coordinates1Point") {

                    if ("site" in elt[1] 
                      && "emplacement" in elt[1]["site"] 
                      && "geometry" in elt[1]["site"]["emplacement"] 
                      && "coordinates" in elt[1]["site"]["emplacement"]["geometry"] 
                      && 0 in elt[1]["site"]["emplacement"]["geometry"]["coordinates"]
                      && 1 in elt[1]["site"]["emplacement"]["geometry"]["coordinates"]
                      ) {
                      var coordX=elt[1]["site"]["emplacement"]["geometry"]["coordinates"][0];
                      var coordY=elt[1]["site"]["emplacement"]["geometry"]["coordinates"][1];
                      row["coordinates1Point"]=coordX + ", " + coordY;
                    }
                    else {
                      console.log("no coordinates for site")
                    }

                  }
                  else if (fieldname=="occurrenceIds") {
                    row["occurrenceIds"]=elt[1][fieldname].length;
                  }
                  else if (fieldname=="datasetName") {
                    if ("datasetID" in elt[1])
                      row["datasetName"]=availableDatasets[elt[1]["datasetID"]]["displayName"];
                    else if ("identifier" in elt[1])
                      row["datasetName"]=availableDatasets[elt[1]["identifier"]]["displayName"];
                  }                
                  else {
                    if (fieldname in elt[1]) {
                      // check if field needs to be truncated
                      if (elt[1][fieldname].length > config.maximumSizeForLongFields) {
                        row[fieldname]=[];
                        // fill in 2 fields, one with the whole data (title/tooltip), one with the sliced data (to be displayed)
                        row[fieldname]["fulldata"]=elt[1][fieldname];
                        row[fieldname]["sliceddata"]=elt[1][fieldname].slice(0, config.maximumSizeForLongFields) + '...';
                      }
                      else row[fieldname]=elt[1][fieldname];
                    }
                    else if ("taxon" in elt[1] && fieldname in elt[1]["taxon"]) {
                      row[fieldname]=elt[1]["taxon"][fieldname];
                    }
                    else if ("site" in elt[1] && fieldname in elt[1]["site"])
                      row[fieldname]=elt[1]["site"][fieldname];
                    else if ("assigner" in elt[1] && "organisationCode" in elt[1]["assigner"] && fieldname=="assignerOrganisationCode")
                      row["assignerOrganisationCode"]=elt[1]["assigner"]["organisationCode"];
                    else if ("creator" in elt[1] && "organisationCode" in elt[1]["creator"] && fieldname=="creatorOrganisationCode")
                      row["creatorOrganisationCode"]=elt[1]["creator"]["organisationCode"];
                    else console.log("No data in "+fieldname);
                  }

                });

                tableData.push(row);

              });

              // 3- translate the column names
              Object.entries(tableColumns).forEach(([key,fieldname]) => {
                //console.log(fieldname);
                if (fieldname in fieldsTranslations) tableColumns[key]=fieldsTranslations[fieldname];
              });

              // stats
              stats.addStat("html", inputObject);

              //renderIndex(res, true, "tableviewOK");
              console.log("renderIndex from tableviewOK");
  //console.log(tableData);
              res.render('pages/index', {
                maxResults: maxResults,                 // GLOBAL
                availableDatasets: availableDatasets,   // GLOBAL
                tableCounty: tableCounty,               // GLOBAL
                tableTaxon: tableTaxon,                 // GLOBAL
                errorMsg: errorMsg,                     // session
                inputObject: inputObject,               // session, default
                inputDatasetList: inputDatasetList,     // session, default
                inputSourceSubmit: inputSourceSubmit,   // session, default
                inputTaxon: inputTaxon,                 // session, default
                inputCounty: inputCounty,               // session, default
                inputArea: inputArea,                   // session, default
                inputStartDate: inputStartDate,         // session, default
                inputEndDate: inputEndDate,             // session, default
                inputDateType: inputDateType,           // session, default
                isDataTable: true,               // session, false
                tableColumns: tableColumns,             // optional
                tableData: tableData,                   // optional
                totalResults: totalResults,             // optional
                downloadFile: ""               // optional
              });
            }     
            else {

              stats.addStat("html-nodata", inputObject);

              //renderIndex(res, true, "tableviewERROR");
              console.log("renderIndex from tableviewERROR-nodata");

              res.render('pages/index', {
                maxResults: maxResults,                 // GLOBAL
                availableDatasets: availableDatasets,   // GLOBAL
                tableCounty: tableCounty,               // GLOBAL
                tableTaxon: tableTaxon,                 // GLOBAL
                errorMsg: "",                     // session
                inputObject: inputObject,               // session, default
                inputDatasetList: inputDatasetList,     // session, default
                inputSourceSubmit: inputSourceSubmit,   // session, default
                inputTaxon: inputTaxon,                 // session, default
                inputCounty: inputCounty,               // session, default
                inputArea: inputArea,                   // session, default
                inputStartDate: inputStartDate,         // session, default
                inputEndDate: inputEndDate,             // session, default
                inputDateType: inputDateType,           // session, default
                isDataTable: true,               // session, false
                tableColumns: {},             // optional
                tableData: {},                   // optional
                totalResults: 0,             // optional
                downloadFile: ""               // optional
              });
            }

            // END IF NOT DOWNLOAD

          }
        }
      }
    });

  }

  else { // empty request, dataInput.length = 0

    stats.addStat("html-length0", inputObject);

    //renderIndex(res, true, "tableviewERROR");
    console.log("renderIndex from tableviewERROR-dataInput.length 0");

    res.render('pages/index', {
      maxResults: maxResults,                 // GLOBAL
      availableDatasets: availableDatasets,   // GLOBAL
      tableCounty: tableCounty,               // GLOBAL
      tableTaxon: tableTaxon,                 // GLOBAL
      errorMsg: "Inget filter",                     // session
      inputObject: inputObject,               // session, default
      inputDatasetList: inputDatasetList,     // session, default
      inputSourceSubmit: inputSourceSubmit,   // session, default
      inputTaxon: inputTaxon,                 // session, default
      inputCounty: inputCounty,               // session, default
      inputArea: inputArea,                   // session, default
      inputStartDate: inputStartDate,         // session, default
      inputEndDate: inputEndDate,             // session, default
      inputDateType: inputDateType,           // session, default
      isDataTable: false,               // session, false
      downloadFile: ""               // optional
    });

  }
  //res.sendStatus(200)
})



import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// start only when species List is ready
function startApp () {

  app.listen(config.clientPort, () => {            //server starts listening for any attempts from a client to connect at port: {config.clientPort}
      console.log(`Now listening on port ${config.clientPort} => ${config.clientUrl}`); 
  });

  app.use(express.static(__dirname + '/downloads'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.static(__dirname + '/node_modules'));
  app.use(express.static(__dirname + '/node_modules/tablefilter/dist'));

  app.use('/fa', express.static(__dirname + '/node_modules/font-awesome/css'));
  app.use('/fonts', express.static(__dirname + '/node_modules/font-awesome/fonts'));


}

console.log("species list URL : "+speciesListUrl);


http.get(speciesListUrl,(res) => {
  let body = "";

  res.on("data", (chunk) => {
      body += chunk;
  });

  res.on("end", () => {
    try {
      
      let speciesList = JSON.parse(body);

      Object.entries(speciesList).forEach(([key, val]) => {

        if (!isNaN(parseInt(val.dyntaxaId))) {

          var dataChain="";

          if (val.swedishName!= null) {
            dataChain=dataChain + utils.capitalizeFirstLetter(val.swedishName) + " - ";
          }
          if (val.scientificName!= null) {
            dataChain=dataChain + utils.capitalizeFirstLetter(val.scientificName) + " - ";
          }

          dataChain = dataChain + val.dyntaxaId + " " ;

          var obj={
            id: parseInt(val.dyntaxaId),
            data: dataChain
          };
          //console.log(obj);

          tableTaxon.push(obj);
        }
        else {
          //console.log("error with taxon "+val.dyntaxaId+", not a number");
        }


      });

      // sort the tableTaxon array by dataChain, i.e. swedish name (first element)
      tableTaxon.sort((a, b) => {
          let fa = a.data.toLowerCase(),
              fb = b.data.toLowerCase();

          if (fa < fb) {
              return -1;
          }
          if (fa > fb) {
              return 1;
          }
          return 0;
      });

      console.log(tableTaxon.length+ " element(s) in tableTaxon");

      startApp();

    } catch (error) {
        console.error("ERROR : "+error.message);
        return null;
    };
  });
}).on("error", (error) => {
    console.error("ERROR : "+error.message);
    return null;
});
