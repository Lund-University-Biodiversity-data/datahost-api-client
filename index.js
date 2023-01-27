
import configImp  from './config/config.js';
const config = configImp;

import templateXlsxImp  from './lib/functions/templateXlsx.js';
var templateXlsx = templateXlsxImp;

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



//const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 8089;                  //Save the port number where your server will be listening


//import pkgCors from 'cors';
//var cors = pkgCors;
//var cors = require('cors');



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

var fieldsTranslations=[];
fieldsTranslations["datasetName"]="datamängd";
//fieldsTranslations["observationTime"]="Datum";
fieldsTranslations["scientificName"]="vet. namn";
fieldsTranslations["vernacularName"]="sv. namn";
fieldsTranslations["quantity"]="kvantitet";
fieldsTranslations["occurrenceStatus"]="förekomst";
fieldsTranslations["dyntaxaId"]="taxon-id";
fieldsTranslations["eventStartDate"]="inv.datum";
fieldsTranslations["locationID"]="lokal ID";
fieldsTranslations["locationType"]="lokaltyp";
fieldsTranslations["county"]="län";
fieldsTranslations["samplingProtocol"]="metod";
fieldsTranslations["noObservations"]="nollbesök";
fieldsTranslations["assignerOrganisationCode"]="beställare";
fieldsTranslations["creatorOrganisationCode"]="utförare";
fieldsTranslations["purpose"]="syfte";
fieldsTranslations["description"]="beskrivning";
fieldsTranslations["startDate"]="startdatum";
fieldsTranslations["accessRights"]="åtkomst";
fieldsTranslations["descriptionAccessRights"]="åtkomst beskrivning";
fieldsTranslations["license"]="användningsrätt";
fieldsTranslations["locationProtected"]="lokal skyddad";
fieldsTranslations["coordinates1Point"]="koordinater";
fieldsTranslations["occurrenceRemarks"]="obs.kommentar";
fieldsTranslations["observationCertainty"]="obs.noggrannhet";


/*
const occurrenceColumnsTable = ["occurrenceID", "observationTime", "taxon", "quantity", "unit", "event"];

/*

DATASETS
datamängdnamn
projektnamn // takes too much space for no new information ("Svensk Fågeltaxering" already contained in the datasetName)
beställare:organisationsnamn
utförare:organisationsnamn
syfte 
datamängdbeskrivning
metodiknamn (kanske)
metodiklänk (kanske)
startdatum
åtkomsträttigheter
beskrivning åtkomsträttigheter // no more space ?
användningsrättigheter // no more space ?




EVENTS
d.datamängdnamn 
d.utförare:organisationsnamn (gärna) => not in event table
d.syfte (gärna)
d.åtkomsträttigheter => NO not in the event table
e.besökshierarki 1 (gärna)  
e.besökshierarki 2 (gärna)
e.inventeringsstartdatum
e.lokal skyddad (kanske)
e.lokal-id 1 +2 +3 +4
e.lokaltyp 1
e.lokal:position:punkt 1  => ??? which point is that ?
e.län
e.datainsamlingsmetod
e.inga observationer under besöket


RECORDS
d.datamängdnamn 
d.utförare:organisationsnamn (gärna)
d.syfte (gärna)
d.åtkomsträttigheter => NO not in the record table
d.BESKRIVNING AV ÅTKOMSTRÄTTIGHETER (kanske)
e.besökshierarki 1 (kanske)  
e.besökshierarki 2 (kanske)
e.inventeringsstartdatum => YES but we should use the observationTime stored in the record table isn't it ? and we don't have the event data
e.lokal-id 1 (kanske) +2 +3 +4
e.lokaltyp 1 (kanske)
e.lokal:position:punkt 1 (kanske)
e.län (kanske) => I think we deifinitely needs some geographic information. Either the sitename, the län, or something.
e.datainsamlingsmetod (kanske)
r.taxon-id
r.svenskt namn
r.vetenskapligt namn
r.förekomst
r.kvantitet
r.observationsnoggrannhet // no more space ?
r.kvalitetskontroll (kanske)
*/

const availableDatasets = config.availableDatasets;

const tableTaxon=[];

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

function capitalizeFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
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
  //console.log(datetimeTemp);
  var splitDate=scanf(datetimeTemp, "%d-%d-%d T%s:%s:%s");
  //console.log(splitDate);

  // FOR SOME REASON WHEN day = 09 => it breaks !
  //[WARN] scanf: Invalid char to Octal [9]
  //[WARN] scanf: Invalid octal [9]
  // WHY octal ???
  
  return splitDate;
}


function updateToTemplateXlsx (dataInput, inputObject) {

  var dataInTemplate=[];
  var dataInTemplateCleaned=[];

  var templateXlsxHeader=templateXlsx.getTemplateXlsxHeader(inputObject);

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
    dataInTemplate.push(oneDataset);
  });

  //console.log(emptyColumns);

  // remove the empty columns
  Object.entries(dataInTemplate).forEach((datasetline, indD) => {

    Object.entries(emptyColumns).forEach((emptyline, indE) => {
      const [key, value] = emptyline;

      if (value) {
        delete datasetline[1][key];
      }
    });

    dataInTemplateCleaned.push(datasetline[1]);
    //exit();

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
          errorMsg="[Maximum response size reached] Förfina din sökning för att minska urvalet. För hjälp med stora datauttag kontakta datavärden på naturdatavardskap@biol.lu.se.";
        }
        else if (error.code=="ECONNABORTED") {
          // Timeout as specified in luApiDocumentationTemplate, src/ApiClient.js
          errorMsg="[Timeout] Förfina din sökning för att minska urvalet. För hjälp med stora datauttag kontakta datavärden på naturdatavardskap@biol.lu.se.";
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
//console.log(elt);exit();

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
                  else if ("taxon" in elt[1] && fieldname in elt[1]["taxon"])
                    row[fieldname]=elt[1]["taxon"][fieldname];
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


            /*
            Object.keys(dataCut[0]).forEach(key => {
//console.log(key);
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
                  tableColumns.push("Vernacular Name");
                }
                else {
                  tableColumns.push(key);
                }
              }
            });
            //var_dump(tableColumns);

            */
/*
            Object.entries(dataCut).forEach(elt => {
              const row = [];
              //console.log(elt);exit();
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
                    row["Vernacular Name"]=value.vernacularName;
                  }
                  else {
                    row[key]=value;
                  }

                  row[key]=value;
            
                }
              });

              tableData.push(row);

            });
*/
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

/*
  app.use(cors({
    origin: "*"
  }));
console.log("cors enabled");
*/

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

        if (!isNaN(parseInt(val.dyntaxaId))) {

          var dataChain="";

          if (val.swedishName!= null) {
            dataChain=dataChain + capitalizeFirstLetter(val.swedishName) + " - ";
          }
          if (val.scientificName!= null) {
            dataChain=dataChain + capitalizeFirstLetter(val.scientificName) + " - ";
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
//console.log(tableTaxon);
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
