
import configImp  from './config/config.js';
const config = configImp;

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


//import TableFilter from 'tablefilter';

//const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 8080;                  //Save the port number where your server will be listening

const speciesListUrl= config.speciesListUrl;

app.set('view engine', 'ejs');

// variable for the whole app
var maxResults = 1000;


const eventColumnsTable = ["datasetID", "eventID", "eventStartDate", "eventEndDate", "occurrenceIds"];
const datasetColumnsTable = ["identifier", "title", "startDate", "endDate", "eventIds"];
const occurrenceColumnsTable = ["occurrenceID", "observationTime", "taxon", "quantity", "unit", "event"];

const availableDatasets = config.availableDatasets;

const tableTaxon=[];

// for html table
var tableColumns =[];
var tableData =[];

// for xslx mapping fields

var totalResults;

const tableCounty = [/*'None selected', */'Stockholms län', 'Västerbottens län', 'Norrbottens län', 'Uppsala län', 'Södermanlands län', 'Östergötlands län', 'Jönköpings län', 'Kronobergs län', 'Kalmar län', 'Gotlands län', 'Blekinge län', 'Skåne län', 'Hallands län', 'Västra Götalands län', 'Värmlands län', 'Örebro län', 'Västmanlands län', 'Dalarnas län', 'Gävleborgs län', 'Västernorrlands län', 'Jämtlands län'];
tableCounty.sort(); // alphaebetical sort

var downloadFile = "";


/*
// render the index page with all the global variable
function renderIndex(res, isDataTable, source) {

  console.log("renderIndex from "+source);

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
    isDataTable: isDataTable,               // session, false
    tableColumns: tableColumns,             // optional
    tableData: tableData,                   // optional
    totalResults: totalResults,             // optional
    downloadFile: downloadFile               // optional
  });


}
*/



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
      'take': 100, // Number | Number of items to return. 1000 items is the max to return in one call.
      'exportMode': 'json'
    };

    getResultsBySearch="getDatasetsBySearch";

    apiInstance[getResultsBySearch](opts, (error, data, response) => {
      if (error) {
        console.error(error);

      } else {
        //console.log('API POST called successfully. Returned data: ' + data);
        console.log('API POST called again (datasets) successfully');
        console.log(data.totalCount+" result(s)");

        var dataDataset=transformDatasetData(data.results);

        downloadFile = writeXlsxFlattened(host, inputObject, dataDataset, dataEvent, dataOccurrence);

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

// input : date as yyyy-mm-ddThh:ii:ssZ
// returns an array with 3 (if no time) or 6 elements
function splitDateInArray (dateToSplit) {

  var datetimeTemp = dateToSplit.replace("T", " T");
  var datetimeTemp = datetimeTemp.replace("Z", " Z");
  var splitDate=scanf(datetimeTemp, "%d-%d-%d T%s:%s:%s");

  return splitDate;
}


function updateToTemplateXlsx (dataInput, inputObject) {

  var dataTemplateOk=[];

  var templateXlsxHeader=[];

  //DATASET
  templateXlsxHeader["1.title"] = "datamängdnamn";
  templateXlsxHeader["1.projectID"] = "Projekt-id";
  templateXlsxHeader["1.projetCode"] = "projektnamn";
  templateXlsxHeader["1.assigner.organisationCode"] = "beställare:organisationsnamn";
  templateXlsxHeader["1.assigner.organisationID"] = "beställare:organisationsnummer";
  templateXlsxHeader["1.creator.organisationCode"] = "utförare:organisationsnamn";
  templateXlsxHeader["1.creator.organisationID"] = "utförare:organisationsnummer";
  templateXlsxHeader["1.ownerinstitutionCode.organisationCode"] = "Informationsansvarig myndighet:organisationsnamn";
  templateXlsxHeader["1.ownerinstitutionCode.organisationID"] = "Informationsansvarig myndighet:organisationsnummer";
  templateXlsxHeader["1.publisher.organisationCode"] = "datavärd:organisationsnamn";
  templateXlsxHeader["1.publisher.organisationID"] = "datavärd:organisationsnummer";
  templateXlsxHeader["1.dateStewardship"] = "datavärdskap";
  templateXlsxHeader["1.purpose"] = "syfte";
  templateXlsxHeader["1.description"] = "datamängdbeskrivning";
  templateXlsxHeader["1.methodology.methodologyName"] = "";
  templateXlsxHeader["1.methodology.methodologyDescription"] = "metodikbeskrivning";
  templateXlsxHeader["1.methodology.methodologyLink"] = "metodiklänk";
  templateXlsxHeader["1.methodology.speciesList"] = "artlista";
  templateXlsxHeader["1.startDate"] = "startdatum";
  templateXlsxHeader["1.endDate"] = "slutdatum";
  templateXlsxHeader["1.latestDate"] = "senaste datum";
  templateXlsxHeader["1.spatial"] = "land";
  templateXlsxHeader["1.accessRights"] = "åtkomsträttigheter";
  templateXlsxHeader["1.accessRightsDescription"] = "beskrivning-åtkomsträttigheter";
  templateXlsxHeader["1.metadatalanguage"] = "metadataspråk";
  templateXlsxHeader["1.language"] = "datamängdspråk";

  if (inputObject!="Dataset") {

    //EVENT
    templateXlsxHeader["1.eventID"] = "besöks-id_1";
    templateXlsxHeader["1.eventType"] = "besökstyp";
    templateXlsxHeader["1.parentEventID"] = "grupperingsbesöks-id";
    templateXlsxHeader["1.hierarchy1"] = "besökshierarki_1";
    templateXlsxHeader["1.hierarchy2"] = "besökshierarki_2";
    templateXlsxHeader["1.eventStartDate"] = "inventeringsstartdatum";
    templateXlsxHeader["1.eventStartDate_y"] = "inventeringsstartår"; // don't exist in the csv export, added below
    templateXlsxHeader["1.eventStartDate_m"] = "inventeringsstartmånad"; // don't exist in the csv export, added below
    templateXlsxHeader["1.eventStartDate_d"] = "inventeringsstartdag"; // don't exist in the csv export, added below
    templateXlsxHeader["1.eventStartDate_t"] = "inventeringsstarttid"; // don't exist in the csv export, added below
    templateXlsxHeader["1.eventEndDate"] = "inventeringsslutdatum";
    templateXlsxHeader["1.eventEndDate_y"] = "inventeringsslutår"; // don't exist in the csv export, added below
    templateXlsxHeader["1.eventEndDate_m"] = "inventeringsslutmånad"; // don't exist in the csv export, added below
    templateXlsxHeader["1.eventEndDate_d"] = "inventeringsslutdag"; // don't exist in the csv export, added below
    templateXlsxHeader["1.eventEndDate_t"] = "inventeringssluttid"; // don't exist in the csv export, added below
    templateXlsxHeader["1.locationProtected"] = "lokalskyddad";
    //SITE
    templateXlsxHeader["1.site.locationID"]="lokal-id_1";
    templateXlsxHeader["1.site.anonymizedId"]="lokal-id_internt_1";
    templateXlsxHeader["1.site.locationType"]="Lokaltyp_1";
    templateXlsxHeader["1.site.locationID"]="lokal-id_1";
    templateXlsxHeader["1.site.emplacement.properties.dimension"]="lokal:dimension";
    templateXlsxHeader["1.site.emplacement.geometry.point1"]="lokal:position:punkt_1"; // don't exist in the csv export, added below
    templateXlsxHeader["1.site.emplacement.geometry.coordinates.0"]="lokal:position:punkt:koordinatNS_1";
    templateXlsxHeader["1.site.emplacement.geometry.coordinates.1"]="lokal:position:punkt:koordinatEW_1";
    templateXlsxHeader["1.site.emplacement.properties.horizontalCoordinateSystem"]="lokal:koordinatsystem_plan";

    // RE-EVENT
    templateXlsxHeader["1.samplingProtocol"] = "datainsamlingsmetod";
    templateXlsxHeader["1.recorderCode"] = "inventerare_1";
    templateXlsxHeader["1.recorderCode_2"] = "inventerare_2";
    templateXlsxHeader["1.recorderCode_3"] = "inventerare_3";
    templateXlsxHeader["1.recorderCode_4"] = "inventerare_4";
    templateXlsxHeader["1.samplingProtocol"] = "datainsamlingsmetod";
    templateXlsxHeader["1.samplingProtocol"] = "datainsamlingsmetod";
    templateXlsxHeader["1.noObservations"] = "ingaObservationerUnderBesöket";


  }

  if (inputObject=="Occurrence") {
    
    // OCCURRENCE
    templateXlsxHeader["1.occurrenceID"] = "Observations-id";
    templateXlsxHeader["1.basisOfRecord"] = "observationsunderlag";
    //templateXlsxHeader["1.observationTime"] = "";
    //templateXlsxHeader["1.observationPoint"] = "[]";
    templateXlsxHeader["1.taxon.taxonID"] = "Taxon-id";
    templateXlsxHeader["1.taxon.dyntaxaId"] = "EU-artkod";
    templateXlsxHeader["1.taxon.vernacularName"] = "svensktNamn";
    templateXlsxHeader["1.taxon.scientificName"] = "vetenskapligtNamn";
    templateXlsxHeader["1.taxon.family"] = "släkte";
    templateXlsxHeader["1.taxon.species"] = "art";
    templateXlsxHeader["1.taxon.subspecies"] = "underart";
    templateXlsxHeader["1.taxon.taxonRank"] = "taxonomiskNivå";
    //templateXlsxHeader["1.taxon.verbatimName"] = "";
    //templateXlsxHeader["1.taxon.verbatimTaxonID"] = "";
    templateXlsxHeader["1.occurrenceStatus"] = "förekomst";
    templateXlsxHeader["1.quantityVariable"] = "kvantitetsvariabel";
    templateXlsxHeader["1.quantity"] = "kvantitet";
    templateXlsxHeader["1.unit"] = "enhet";
    templateXlsxHeader["1.sex"] = "kön";
    templateXlsxHeader["1.age"] = "ålder-stadium";
    templateXlsxHeader["1.activity"] = "aktivitet";
    templateXlsxHeader["1.size"] = "storlek";
    //templateXlsxHeader["1.organism"] = "[]";
    templateXlsxHeader["1.occurrenceRemarks"] = "observationskommentar";
    templateXlsxHeader["1.observationCertainty"] = "observationsnoggrannhet";
    templateXlsxHeader["1.identificationVerificationStatus"] = "kvalitetskontroll";

  }




  // foor each dataset of the data
  Object.entries(dataInput).forEach(datasetI => {

    var oneDataset=[];
    // check the template header
    Object.entries(templateXlsxHeader).forEach(([key, val]) => {

      if (key in datasetI[1]) {
        oneDataset[val]=datasetI[1][key];
      }
      else if (("1.datasetData." + key) in datasetI[1]) {
        oneDataset[val]=datasetI[1][("1.datasetData." + key)];
      }
      else if (("1.eventData." + key) in datasetI[1]) {
        oneDataset[val]=datasetI[1][("1.eventData." + key)];
      }
      else if (!(val in oneDataset)) { // check if the field has not already been filled (like the detailed start/end date-time)
        console.log("key notfound "+key);
        oneDataset[val]="";
      }

      // split the startDate/time in colums
      if (key=="1.eventStartDate" && oneDataset[val]!="") {

        var splitDate=splitDateInArray(oneDataset[val]);

        if (splitDate.length>=3) {
          oneDataset["inventeringsstartår"]=splitDate[0];
          oneDataset["inventeringsstartmånad"]=splitDate[1];
          oneDataset["inventeringsstartdag"]=splitDate[2];

          if (splitDate.length==6) {
            oneDataset["inventeringsstarttid"]=splitDate[3]+":"+splitDate[4]+":"+splitDate[5];
          }

        }
      }


      // split the endDate/time in colums
      if (key=="1.eventEndDate" && oneDataset[val]!="") {

        var splitDate=splitDateInArray(oneDataset[val]);

        if (splitDate.length>=3) {

          oneDataset["inventeringsslutår"]=splitDate[0];
          oneDataset["inventeringsslutmånad"]=splitDate[1];
          oneDataset["inventeringsslutdag"]=splitDate[2];

          if (splitDate.length==6) {
            oneDataset["inventeringssluttid"]=splitDate[3]+":"+splitDate[4]+":"+splitDate[5];
          }

        }
      }

      // gather the coordinates
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
          oneDataset["lokal:position:punkt_1"]=coordX + ", " + coordY;
        }
      }

    });
    dataTemplateOk.push(oneDataset);
  });


  return dataTemplateOk;
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

      // remove occurences details from events
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


// get /about
app.get('/about', function(req, res) {
  res.render('pages/about');
});

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
      taxonIds = req.body.inputTaxon;
    }
    // only one item
    else {
      if (req.body.inputTaxon != "None selected")
        taxonIds.push(req.body.inputTaxon);
    }

    if (taxonIds.length>=1) {
      dataInput.taxon = {
        ids : []
      };

      taxonIds.forEach((element) => {
        if (element!="None selected") {

          // the taxon hierarchy is managed from the server side 
          dataInput.taxon.ids.push(parseInt(element.trim()));
        }
      });
    }

    inputTaxon = req.body.inputTaxon;

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

  // CALL THE API

  if (dataInputLength.length>=1) {

    var inputObject = req.body.inputObject;

    let apiInstance, opts, getResultsBySearch;

    switch(inputObject) {
      case "Dataset":
        apiInstance = new LuApiDocumentationTemplate.DatasetApi();

        opts = { 
          'body': LuApiDocumentationTemplate.DatasetFilter.constructFromObject(dataInput),
          'skip': 0, // Number | Start index
          'take': 100, // Number | Number of items to return. 1000 items is the max to return in one call.
          'exportMode': exportMode
        };

        getResultsBySearch="getDatasetsBySearch";
        break;

      case "Occurrence":
        apiInstance = new LuApiDocumentationTemplate.OccurrenceApi();

        opts = { 
          'body': LuApiDocumentationTemplate.OccurrenceFilter.constructFromObject(dataInput),
          'skip': 0, // Number | Start index
          'take': 100, // Number | Number of items to return. 1000 items is the max to return in one call.
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
          'take': 100, // Number | Number of items to return. 1000 items is the max to return in one call.
          'exportMode': exportMode
        };

        getResultsBySearch="getEventsBySearch";

        break;
    }

    //apiInstance.getEventsBySearch(opts, (error, data, response) => {
    // dynamic method name called
    apiInstance[getResultsBySearch](opts, (error, data, response) => {
      if (error) {
        console.error(error);
        console.error(error.code);

        if (error.code=="ETOOLARGE") {
          // Maximum response size reached 
          errorMsg="[Maximum response size reached] Förfina din sökning för att minska urvalet. För hjälp med större datauttag kontakta datavärden på naturdatavardskap@biol.lu.se.";
        }
        else if (error.code=="ECONNABORTED") {
          // Timeout as specified in luApiDocumentationTemplate, src/ApiClient.js
          errorMsg="[Timeout] Förfina din sökning för att minska urvalet. För hjälp med större datauttag kontakta datavärden på naturdatavardskap@biol.lu.se.";
        }
        else {
          errorMsg="Error received from the server";
        }

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

      } else {

        errorMsg="";
        
        //console.log('API POST called successfully. Returned data: ' + data);
        console.log('API POST called successfully');
        //console.log(opts);

        //var_dump(data);

        tableColumns =[];
        tableData =[];



        if (inputSourceSubmit=="exportCsv") {

          totalResults = data.length;
          console.log(totalResults+" result(s)");

          let ts = Date.now();
          let date_ob = new Date(ts);

          var filenameCsv="data_"+inputObject+"_"+date_ob.getFullYear()+(("0" + (date_ob.getMonth() + 1)).slice(-2))+(("0" + date_ob.getDate()).slice(-2))+"_"+date_ob.getHours()+date_ob.getMinutes()+date_ob.getSeconds()+".csv";
          var csvPath=config.downloadFolderUrl+filenameCsv;

          // async create csv file
          (async () => {

            fs.writeFileSync(csvPath, data);

            downloadFile = "http://" + req.get('host') + "/" + filenameCsv;

            // Return the CSV file as string:
            //console.log(await csv.toString());
            console.log("Data saved in "+csvPath+" ("+totalResults+" row(s))");

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

              //renderIndex(res, false, "xlsxdataset");
              console.log("renderIndex from error xlsxdataset");
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
                'take': 100, // Number | Number of items to return. 1000 items is the max to return in one call.
                'exportMode': exportMode
              };

              getResultsBySearch="getEventsBySearch";

              apiInstance[getResultsBySearch](opts, (error, data, response) => {
                if (error) {
                  console.error(error);

                } else {
                  //console.log('API POST called successfully. Returned data: ' + data);
                  console.log('API POST called again (events) successfully');
                  console.log(data.totalCount+" result(s)");

                  dataEvent=transformEventData(data.results);

                  //console.log("data event obtained !");

                  getDatasetDataForXlsx(res, req.get('host'), inputObject, dataEvent, dataOccurrence, inputDatasetList, inputSourceSubmit, inputTaxon, inputCounty, inputArea, inputStartDate, inputEndDate, inputDateType);
                  
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
            Object.keys(dataCut[0]).forEach(key => {
              //console.log(key, dataCut[key]);
              // add only thr columns to be displayed
              if (inputObject=="Event" && eventColumnsTable.includes(key)) {
                tableColumns.push(key);
              }
              else if (inputObject=="Dataset" && datasetColumnsTable.includes(key)) {
                tableColumns.push(key);
              }
              else if (inputObject=="Occurrence" && occurrenceColumnsTable.includes(key)) {

                if (key=="taxon") {
                  tableColumns.push("taxon");
                  tableColumns.push("Dyntaxa ID");
                  tableColumns.push("Scientific Name");
                }
                else {
                  tableColumns.push(key);
                }
              }
            });

            //var_dump(tableColumns);

            Object.entries(dataCut).forEach(elt => {
              const row = [];
              Object.entries(elt[1]).forEach(entry => {
                const [key, value] = entry;

                if (inputObject=="Event" && eventColumnsTable.includes(key)) {

                  if (key=="occurrenceIds") {
                    row["occurrenceIds"]=value.length;
                  }
                  else {
                    row[key]=value;
                  }
                }
                else if (inputObject=="Dataset" && datasetColumnsTable.includes(key)) {

                  if (key=="eventIds") {
                    row["eventIds"]=value.length;
                  }
                  else {
                    row[key]=value;
                  }
                }
                else if (inputObject=="Occurrence" && occurrenceColumnsTable.includes(key)) {

                  if (key=="taxon") {
                    row["Dyntaxa ID"]=value.dyntaxaId;
                    row["Scientific Name"]=value.scientificName;
                  }
                  else {
                    row[key]=value;
                  }

                  row[key]=value;
            
                }
              });
              tableData.push(row);

            });

            //renderIndex(res, true, "tableviewOK");
            console.log("renderIndex from tableviewOK");

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
    });

  }

  else { // empty request, dataInput.length = 0
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

  app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
      console.log(`Now listening on port ${port} => http://localhost:${port}`); 
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

        /*
        var dataChain=val.dyntaxaId + " - " + val.scientificName;

        if (val.swedishName != null && val.swedishName!="null") {
          dataChain= dataChain + " - " + val.swedishName;
        }
        */
        var dataChain = val.swedishName + " - " + val.scientificName + " - " + val.dyntaxaId;

        var obj={
          id: val.dyntaxaId,
          data: dataChain
        };
        //console.log(obj);

        tableTaxon.push(obj);
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
      //resolve(1);

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
