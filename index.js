
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

//import TableFilter from 'tablefilter';

//const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 8080;                  //Save the port number where your server will be listening

const speciesListUrl= config.speciesListUrl;

app.set('view engine', 'ejs');

var maxResults = 1000;

var inputObject = "Event";
var inputSourceSubmit = "submit";
var inputTaxon = "";
var inputArea = "";
var inputDatasetList = [];
var inputCounty = ["None selected"];
var inputStartDate = "2020-06-12";
var inputEndDate = "2020-06-15";
var inputDatumType = "BetweenStartDateAndEndDate";

const eventColumnsTable = ["datasetID", "eventID", "eventStartDate", "eventEndDate", "Occurrences"];
const datasetColumnsTable = ["identifier", "title", "startDate", "endDate", "events"];
const occurrenceColumnsTable = ["occurrenceID", "observationTime", "taxon", "quantity", "unit", "event"];

const availableDatasets = config.availableDatasets;

const tableTaxon=[];

const tableCounty = [/*'None selected', */'Stockholms län', 'Västerbottens län', 'Norrbottens län', 'Uppsala län', 'Södermanlands län', 'Östergötlands län', 'Jönköpings län', 'Kronobergs län', 'Kalmar län', 'Gotlands län', 'Blekinge län', 'Skåne län', 'Hallands län', 'Västra Götalands län', 'Värmlands län', 'Örebro län', 'Västmanlands län', 'Dalarnas län', 'Gävleborgs län', 'Västernorrlands län', 'Jämtlands län'];
tableCounty.sort(); // alphaebetical sort

var downloadFile = "";

// get /
//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here

    //res.sendFile('index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
    //res.sendFile('mainForm.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser

  res.render('pages/index', {
    maxResults: maxResults,
    availableDatasets: availableDatasets, 
    tableCounty: tableCounty, 
    tableTaxon: tableTaxon,
    inputObject: inputObject,
    inputDatasetList: inputDatasetList,
    inputSourceSubmit: inputSourceSubmit,
    inputTaxon: inputTaxon,
    inputCounty: inputCounty,
    inputArea: inputArea,
    inputStartDate: inputStartDate,
    inputEndDate: inputEndDate,
    inputDatumType: inputDatumType,
    isDataTable: false
  });



});

// get /about
app.get('/about', function(req, res) {
  res.render('pages/about');
});


let encodeUrl = parseUrl.urlencoded({ extended: false });

app.post('/', encodeUrl, (req, res) => {
  console.log('Form request:', req.body);

  const dataInput = {};

  // CREATE THE dataInput based on the form

  // get the export Mode based on the clicked button
  inputSourceSubmit = req.body.inputSourceSubmit;
        

  if (inputSourceSubmit=="exportCsv") {
    dataInput.exportMode="csv";
  }
  else dataInput.exportMode="json";



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

      inputArea = coordArr;
    }
    else {
      console.log("Error, only "+coordArrSplit.length+" points in the bounding box");
      inputArea="";
    }

  }


  if ( (typeof req.body.inputStartDate !== 'undefined' && req.body.inputStartDate !="")
   || (typeof req.body.inputEndDate !== 'undefined' && req.body.inputEndDate !="")) {

    var inputStartDate="";
    var inputEndDate="";

    dataInput.datum={};

    if (typeof req.body.inputStartDate !== 'undefined' && req.body.inputStartDate !="") {
      inputStartDate=req.body.inputStartDate;
      dataInput.datum["startDate"] = inputStartDate;
    }
    if (typeof req.body.inputEndDate !== 'undefined' && req.body.inputEndDate !="") {
      inputEndDate=req.body.inputEndDate;
      dataInput.datum["endDate"] = inputEndDate;
    }

    dataInput.datum["datumFilterType"] = inputDatumType;

    //console.log("datum filter : ");
    //console.log(dataInput.datum);

  }

  inputDatasetList = []; // reinit
  if (typeof req.body.datasetCheckB !== 'undefined' && req.body.datasetCheckB.length>=1) {

    if (typeof req.body.datasetCheckB == "string") {
      inputDatasetList.push(req.body.datasetCheckB);
    }
    else { // object => several elements
      inputDatasetList=req.body.datasetCheckB;
    }

    dataInput.datasetList=inputDatasetList;
  }

  const dataInputLength = Object.getOwnPropertyNames(dataInput);

  console.log("dataInput array :");
  var_dump(dataInput);

  // CALL THE API

  if (dataInputLength.length>=1) {

    inputObject = req.body.inputObject;

    let apiInstance, opts, getResultsBySearch;

    switch(inputObject) {
      case "Dataset":
        apiInstance = new LuApiDocumentationTemplate.DatasetApi();

        opts = { 
          'body': LuApiDocumentationTemplate.DatasetFilter.constructFromObject(dataInput),
          'skip': 0, // Number | Start index
          'take': 100 // Number | Number of items to return. 1000 items is the max to return in one call.
        };

        getResultsBySearch="getDatasetsBySearch";
        break;

      case "Occurrence":
        apiInstance = new LuApiDocumentationTemplate.OccurrenceApi();

        opts = { 
          'body': LuApiDocumentationTemplate.OccurrenceFilter.constructFromObject(dataInput),
          'skip': 0, // Number | Start index
          'take': 100 // Number | Number of items to return. 1000 items is the max to return in one call.
        };

        getResultsBySearch="getOccurrencesBySearch";

        break;

      case "Event":
      default:
        apiInstance = new LuApiDocumentationTemplate.EventApi();

        opts = { 
          'body': LuApiDocumentationTemplate.EventsFilter.constructFromObject(dataInput), // EventsFilter | Filter used to limit the search.
          'skip': 0, // Number | Start index
          'take': 100 // Number | Number of items to return. 1000 items is the max to return in one call.
        };

        getResultsBySearch="getEventsBySearch";

        break;
    }

    //apiInstance.getEventsBySearch(opts, (error, data, response) => {
    // dynamic method name called
    apiInstance[getResultsBySearch](opts, (error, data, response) => {
      if (error) {
        console.error(error);

        res.render('pages/index', {
          maxResults: maxResults,
          availableDatasets: availableDatasets, 
          tableCounty: tableCounty, 
          tableTaxon: tableTaxon,
          inputObject: inputObject,
          inputSourceSubmit: inputSourceSubmit,
          inputTaxon: inputTaxon,
          inputCounty: inputCounty,
          inputArea: inputArea,
          inputStartDate: inputStartDate,
          inputEndDate: inputEndDate,
          inputDatumType: inputDatumType,
          isDataTable: false
        });

      } else {
        //console.log('API POST called successfully. Returned data: ' + data);
        console.log('API POST called successfully');
        //var_dump(data);



        const tableColumns =[];
        const tableData =[];

        var totalResults = data.length;
        console.log(totalResults+" result(s)");

        if (/*inputSourceSubmit=="download" || */inputSourceSubmit=="exportCsv") {
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
            console.log("Data saved in "+csvPath+" ("+data.length+" row(s))");

            res.render('pages/index', {
              maxResults: maxResults,
              availableDatasets: availableDatasets, 
              tableCounty: tableCounty,
              tableTaxon: tableTaxon, 
              inputObject: inputObject,
              inputDatasetList: inputDatasetList,
              inputSourceSubmit: inputSourceSubmit,
              inputTaxon: inputTaxon,
              inputCounty: inputCounty,
              inputArea: inputArea,
              inputStartDate: inputStartDate,
              inputEndDate: inputEndDate,
              inputDatumType: inputDatumType,
              isDataTable: false,
              tableColumns: tableColumns,
              tableData: tableData,
              totalResults: totalResults,
              downloadFile: downloadFile
            });

          })();
          // end async create csv file



        }
        else {


          // IF NOT EXPORTCSV

          if(data.length>0) {

            let dataCut;

            // get maximum XXX elements
            if(data.length>maxResults) {
              console.log("Cut data results to "+maxResults);
              dataCut = data.slice(0, maxResults);
            }
            else {
              dataCut = data;
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

                  if (key=="Occurrences") {
                    row["Occurrences"]=value.length;
                  }
                  else {
                    row[key]=value;
                  }
                }
                else if (inputObject=="Dataset" && datasetColumnsTable.includes(key)) {

                  if (key=="events") {
                    row["events"]=value.length;
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

            /* REMOVE OLD VERSION OF DOWNLOAD BUTTON
            if (inputSourceSubmit=="download") {

              (async () => {

                //console.log(data);

                //console.log(flat(data));

                const finalDataToCsv=[];

                Object.entries(data).forEach(elt => {
                  //console.log(elt);
                  const row = [];
                  Object.entries(elt[1]).forEach(entry => {
                    const [key, value] = entry;

                    if (inputObject=="Event" && eventColumnsTable.includes(key)) {

                    if (key=="Occurrences") {
                        row["Occurrences"]=value.length;
                      }
                      else {
                        row[key]=value;
                      }
                    }
                    else if (inputObject=="Dataset" && datasetColumnsTable.includes(key)) {

                      if (key=="events") {
                        row["events"]=value.length;
                      }
                      else {
                        row[key]=value;
                      }
                    }
                    else if (inputObject=="Occurrence" && occurrenceColumnsTable.includes(key)) {

                      if (key=="taxon") {
                        row["taxonID"]=value.taxonID;
                        row["dyntaxaId"]=value.dyntaxaId;
                        row["scientificName"]=value.scientificName;
                        row["vernacularName"]=value.vernacularName;
                        row["taxonRank"]=value.taxonRank;
                        row["verbatimName"]=value.verbatimName;
                        row["verbatimTaxonID"]=value.verbatimTaxonID;
                      }
                      else {
                        row[key]=value;
                      }

                      //row[key]=value;
                
                    }
                  });
                  finalDataToCsv.push(row);

                });

                //console.log(finalDataToCsv);


                // use the data uncut
                const csv = new ObjectsToCsv(finalDataToCsv);
               
                // Save to file:
                await csv.toDisk(csvPath);
                
                downloadFile = "http://" + req.get('host') + "/" + filenameCsv;

                // Return the CSV file as string:
                //console.log(await csv.toString());
                console.log("Data saved in "+csvPath+" ("+data.length+" row(s))");

                res.render('pages/index', {
                  maxResults: maxResults,
                  tableCounty: tableCounty,
                  tableTaxon: tableTaxon, 
                  inputObject: inputObject,
                  inputSourceSubmit: inputSourceSubmit,
                  inputTaxon: inputTaxon,
                  inputCounty: inputCounty,
                  inputArea: inputArea,
                  inputStartDate: inputStartDate,
                  inputEndDate: inputEndDate,
                  inputDatumType: inputDatumType,
                  isDataTable: true,
                  tableColumns: tableColumns,
                  tableData: tableData,
                  totalResults: totalResults,
                  downloadFile: downloadFile
                });

              })();

            }
            else {
            */
            res.render('pages/index', {
              maxResults: maxResults,
              availableDatasets: availableDatasets, 
              tableCounty: tableCounty,
              tableTaxon: tableTaxon, 
              inputObject: inputObject,
              inputDatasetList: inputDatasetList,
              inputSourceSubmit: inputSourceSubmit,
              inputTaxon: inputTaxon,
              inputCounty: inputCounty,
              inputArea: inputArea,
              inputStartDate: inputStartDate,
              inputEndDate: inputEndDate,
              inputDatumType: inputDatumType,
              isDataTable: true,
              tableColumns: tableColumns,
              tableData: tableData,
              totalResults: totalResults,
              downloadFile: ""
            });
            //} 

          }     
          else {
            res.render('pages/index', {
              maxResults: maxResults,
              availableDatasets: availableDatasets, 
              tableCounty: tableCounty, 
              tableTaxon: tableTaxon,
              inputObject: inputObject,
              inputDatasetList: inputDatasetList,
              inputSourceSubmit: inputSourceSubmit,
              inputTaxon: inputTaxon,
              inputCounty: inputCounty,
              inputArea: inputArea,
              inputStartDate: inputStartDate,
              inputEndDate: inputEndDate,
              inputDatumType: inputDatumType,
              isDataTable: false
            });
          }





          // END IF NOT DOWNLOAD

        }

      }
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

        var dataChain=val.dyntaxaId + " - " + val.scientificName;

        if (val.swedishName != null && val.swedishName!="null") {
          dataChain= dataChain + " - " + val.swedishName;
        }

        var obj={
          id: val.dyntaxaId,
          data: dataChain
        };
        //console.log(obj);

        tableTaxon.push(obj);
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
