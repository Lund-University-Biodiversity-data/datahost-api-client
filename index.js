
import pkgVD from 'var_dump';
const var_dump = pkgVD;

//var LuApiDocumentationTemplate = require('lu_api_documentation_template');
import pkgLU from 'lu_api_documentation_template';
const LuApiDocumentationTemplate = pkgLU;

/*
console.log("GET TEST");

var api = new LuApiDocumentationTemplate.EventApi()
var id = "SFTstd:19960602:75"; // {String} ID of the event to get

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API GET called successfully. Returned data: ' + data);
    var_dump(data);
  }
};
api.getEventsByID(id, callback);

console.log("FIN GET TEST");
*/

/*
console.log("POST TEST");


const dataInput = {
    taxon : {
        ids : [100062]
    }
};

var_dump(dataInput);

let apiInstance = new LuApiDocumentationTemplate.EventApi();
let opts = { 
  'body': LuApiDocumentationTemplate.EventsFilter.constructFromObject(dataInput), // EventsFilter | Filter used to limit the search.
  'skip': 0, // Number | Start index
  'take': 100 // Number | Number of items to return. 1000 items is the max to return in one call.
};

apiInstance.getEventsBySearch(opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API POST called successfully. Returned data: ' + data);
    var_dump(data);
  }
});

console.log("FIN POST TEST");
*/

import pkgExpress from 'express';
const express = pkgExpress;

import pkgBP from 'body-parser';
const parseUrl = pkgBP;

//import TableFilter from 'tablefilter';

//const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 8080;                  //Save the port number where your server will be listening


app.set('view engine', 'ejs');

var maxResults = 1000;

var inputObject = "Event";
var inputTaxon = "100062;102933";
var inputArea = "";
var inputCounty = ["None selected"];
var inputStartDate = "1998-05-14";
var inputEndDate = "1999-05-14";
var inputDatumType = "BetweenStartDateAndEndDate";

const eventColumnsTable = ["datasetID", "eventID", "eventStartDate", "eventEndDate", "Occurrences"];
const datasetColumnsTable = ["identifier", "title", "startDate", "endDate", "events"];
const occurrenceColumnsTable = ["occurrenceID", "observationTime", "taxon", "quantity", "unit", "event"];

const tableCounty = [/*'None selected', */'Stockholms län', 'Västerbottens län', 'Norrbottens län', 'Uppsala län', 'Södermanlands län', 'Östergötlands län', 'Jönköpings län', 'Kronobergs län', 'Kalmar län', 'Gotlands län', 'Blekinge län', 'Skåne län', 'Hallands län', 'Västra Götalands län', 'Värmlands län', 'Örebro län', 'Västmanlands län', 'Dalarnas län', 'Gävleborgs län', 'Västernorrlands län', 'Jämtlands län'];

let tableTaxon = {
  100062: "100062 - Gavia arctica - Storlom",
  102933: "102933 - Anas platyrhynchos - Gräsand"
}
// get /
//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here

    //res.sendFile('index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
    //res.sendFile('mainForm.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
  
  var mascots = [
    { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
    { name: 'Tux', organization: "Linux", birth_year: 1996},
    { name: 'Moby Dock', organization: "Docker", birth_year: 2013}
  ];
  var tagline = "No programming concept is complete without a cute animal mascot.";


  res.render('pages/index', {
    maxResults: maxResults,
    tableCounty: tableCounty, 
    tableTaxon: tableTaxon,
    inputObject: inputObject,
    inputTaxon: inputTaxon,
    inputCounty: inputCounty,
    inputArea: inputArea,
    inputStartDate: inputStartDate,
    inputEndDate: inputEndDate,
    inputDatumType: inputDatumType,
    isData: false
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
        if (element!="None selected")
          dataInput.taxon.ids.push(parseInt(element.trim()));
      });
    }

    inputTaxon = req.body.inputTaxon;


    /*
    dataInput.taxon = {
      ids : []
    };

    const dyntaxaIds = req.body.inputTaxon.split(";");

    dyntaxaIds.forEach((element) => {
      dataInput.taxon.ids.push(parseInt(element.trim()));
    });

    inputTaxon = req.body.inputTaxon;
    */
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

    if (typeof req.body.inputStartDate !== 'undefined') {
      inputStartDate=req.body.inputStartDate;
    }
    if (typeof req.body.inputEndDate !== 'undefined') {
      inputEndDate=req.body.inputEndDate;
    }

    dataInput.datum={
      "startDate": inputStartDate,
      "endDate": inputEndDate,
      "datumFilterType":inputDatumType
    };
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
          tableCounty: tableCounty, 
          tableTaxon: tableTaxon,
          inputObject: inputObject,
          inputTaxon: inputTaxon,
          inputCounty: inputCounty,
          inputArea: inputArea,
          inputStartDate: inputStartDate,
          inputEndDate: inputEndDate,
          inputDatumType: inputDatumType,
          isData: false
        });

      } else {
        //console.log('API POST called successfully. Returned data: ' + data);
        console.log('API POST called successfully');
        //var_dump(data);

        const tableColumns =[];
        const tableData =[];

        console.log(data.length+" result(s)");

        if(data.length>0) {

          // get maximum XXX elements
          if(data.length>maxResults) {
            console.log("Cut data results to "+maxResults);
            data = data.slice(0, maxResults);
          }

          Object.keys(data[0]).forEach(key => {
            //console.log(key, data[key]);
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

          var_dump(tableColumns);

          Object.entries(data).forEach(elt => {
            const row = [];
            Object.entries(elt[1]).forEach(entry => {
              const [key, value] = entry;

              if (inputObject=="Event" && eventColumnsTable.includes(key)) {

                if (key=="Occurrences") {
                  row["Occurences"]=value.length;
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

        }
        

        res.render('pages/index', {
          maxResults: maxResults,
          tableCounty: tableCounty,
          tableTaxon: tableTaxon, 
          inputObject: inputObject,
          inputTaxon: inputTaxon,
          inputCounty: inputCounty,
          inputArea: inputArea,
          inputStartDate: inputStartDate,
          inputEndDate: inputEndDate,
          inputDatumType: inputDatumType,
          isData: true,
          tableColumns: tableColumns,
          tableData: tableData
        });
      }
    });

  }





  //res.sendStatus(200)
})


app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port} => http://localhost:${port}`); 
});



import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/node_modules/tablefilter/dist'));

