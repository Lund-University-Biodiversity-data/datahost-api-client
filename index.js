
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
const port = 5000;                  //Save the port number where your server will be listening


app.set('view engine', 'ejs');

//var inputTaxon = "100062;102933";
var inputTaxon = "100062";
var inputArea = "";
var inputStartDate = "1998-05-14";
var inputEndDate = "1999-05-14";
var inputDatumType = "BetweenStartDateAndEndDate";

const eventColumnsTable = ["datasetID", "eventID", "eventStartDate", "eventEndDate", "Occurrences"];

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
    inputTaxon: inputTaxon,
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

    dataInput.taxon = {
      ids : []
    };

    const dyntaxaIds = req.body.inputTaxon.split(";");

    dyntaxaIds.forEach((element) => {
      dataInput.taxon.ids.push(parseInt(element.trim()));
    });

    inputTaxon = req.body.inputTaxon;
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

    console.log("StartDate:"+inputStartDate);
    console.log("EndDate:"+inputEndDate);

    dataInput.datum={
      "startDate": inputStartDate,
      "endDate": inputEndDate,
      "datumFilterType":inputDatumType
    };
  }

  const dataInputLength = Object.getOwnPropertyNames(dataInput);
  console.log(dataInputLength.length); // 1


    console.log("dataInput array :");
    var_dump(dataInput);

  // CALL THE API

  if (dataInputLength.length>=1) {

    let apiInstance = new LuApiDocumentationTemplate.EventApi();


    let opts = { 
      'body': LuApiDocumentationTemplate.EventsFilter.constructFromObject(dataInput), // EventsFilter | Filter used to limit the search.
      'skip': 0, // Number | Start index
      'take': 100 // Number | Number of items to return. 1000 items is the max to return in one call.
    };

    apiInstance.getEventsBySearch(opts, (error, data, response) => {
      if (error) {
        console.error(error);

        res.render('pages/index', {
          inputTaxon: inputTaxon,
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

        Object.keys(data[0]).forEach(key => {
          //console.log(key, data[key]);
          // add only thr columns to be displayed
          if (eventColumnsTable.includes(key)) {
            tableColumns.push(key);
          }
        });

        var_dump(tableColumns);

        Object.entries(data).forEach(elt => {
          const row = [];
          Object.entries(elt[1]).forEach(entry => {
            const [key, value] = entry;
  
            if (eventColumnsTable.includes(key)) {

              if (key=="Occurrences") {
                row["Occurences"]=value.length;
              }
              else {
                row[key]=value;
              }
            }
          });
          tableData.push(row);
        });

        res.render('pages/index', {
          inputTaxon: inputTaxon,
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

