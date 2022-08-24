
import configData  from './config/config.js';
const config = configData;

import pkgHttps from 'https';
const https = pkgHttps;

import pkgFs from 'fs';
const fs = pkgFs;

const speciesFilePath= config.speciesFilePath;

const speciesArr=[]; // final list with species
const speciesSupp=[]; // species added based on the hierarchical dependecies

const urlAPIListsALA=config.urlAPIListsALABirds;
var urlAPISLUparentsId=config.urlAPISLUparentsId;
var urlAPISLUgetTaxa=config.urlAPISLUgetTaxa;

const SLUAPIkey = config.SLUAPIkey;


async function testAsync (url) {
  return 1;
}

// function that get the parent dyntaxaIds of a dyntaxaAPI and update the global array speciesSupp
async function getDyntaxaAPIparentsId (url) {

  return new Promise((resolve) => {

    https.get(url,(res) => {
      let body = "";

      res.on("data", (chunk) => {
          body += chunk;
      });

      res.on("end", () => {
        try {
          let json = JSON.parse(body);

          //console.log("body:"+body);
          var avesFound = false; // boolean to stop when dyntaxaIdAves found (no need to go higher in hierarchy)

          Object.entries(json).forEach(([parentKey, parentVal]) => {
            
            //console.log("parentKey:"+parentKey);
            //console.log("parentVal:"+parentVal);
            Object.entries(parentVal).forEach(([taxKey, taxVal]) => {

              if(config.dyntaxaIdAves == taxVal) {
                //console.log("Aves trouvé => stop");
                avesFound=true;
              }

              if (taxVal!=0 && !avesFound && !speciesArr.includes(taxVal) && !speciesSupp.includes(taxVal)) {
                speciesSupp.push(taxVal);
                //console.log("elt added : "+taxVal);
              }
              else {
                //console.log("no need "+taxVal);
              }
            });
            //console.log(speciesArr);
          });
          //console.log("end, "+speciesArr.length+" elements in speciesArr now");
          resolve(1);

        } catch (error) {
            console.error(error.message);
            resolve(0);
        };
      });
    }).on("error", (error) => {
        console.error(error.message);
        resolve(0);
    });

    //console.log("c'est bon fini https.get");
  });
}

function writeFileSpecies() {

  let jsonForFile = JSON.stringify(speciesArr);
  fs.writeFile(speciesFilePath, jsonForFile, function (err) {
    if (err) return console.log(err);
    console.log('File created : '+speciesFilePath);
  });
}

// function that get the taxon details for a dyntaxaAPI and update the global array speciesArr
async function getDyntaxaAPIgetTaxa (url) {

  return new Promise((resolve) => {

    https.get(url,(res) => {
      let body = "";

      res.on("data", (chunk) => {
          body += chunk;
      });

      res.on("end", () => {
        try {
          let json = JSON.parse(body);

          Object.entries(json).forEach(([taxonKey, taxonVal]) => {
            addSpeciesToList (taxonVal.taxonId, taxonVal.scientificName, taxonVal.swedishName);
            //console.log(speciesArr);
          });
          //console.log("end, "+speciesArr.length+" elements in speciesArr now");
          resolve(1);

        } catch (error) {
            console.error(error.message);
            resolve(0);
        };
      });
    }).on("error", (error) => {
        console.error(error.message);
        resolve(0);
    });

    //console.log("c'est bon fini https.get");
  });
}


function addSpeciesToList (dyntaxaId, scientificName, swedishName) {
  speciesArr.push ({
    dyntaxaId: dyntaxaId,
    scientificName: scientificName,
    swedishName: swedishName
  });
}


https.get(urlAPIListsALA,(res) => {
    let body = "";

    res.on("data", (chunk) => {
        body += chunk;
    });

    res.on("end", () => {
      try {
        let json = JSON.parse(body);

        //var lsid="";
        var dyntaxaId="";
        var scientificName="";
        var swedishName="";

        Object.entries(json).forEach(element => {

          const [key, data] = element;

          //lsid=data.id;
          scientificName=data.name;
          Object.entries(data.kvpValues).forEach(([kvpKey, kvpVal]) => {

            if (kvpVal.key=="dyntaxa_id") {
              dyntaxaId=kvpVal.value;
            }
            else if (kvpVal.key=="arthela") {
              swedishName=kvpVal.value;
            }

          });
          
          addSpeciesToList (dyntaxaId, scientificName, swedishName);

          /*
          speciesArr.push ({
            lsid: lsid,
            scientificName: scientificName,
            swedishName: swedishName,
            dyntaxaId: dyntaxaId

          });
          */
          //console.log(speciesArr);

        });

        console.log(speciesArr.length+" element(s) in speciesArr");
        if (speciesArr.length>0) {

          if (speciesArr.length>0) {
            console.log("get dependecies for "+speciesArr.length+ " species");


            // async to make sure that the for Loop awaits all the results before doing more
            const asyncedLoopForGetTaxa = async _ => {
              for (const onespecies of speciesSupp) {
                var urlSLU=urlAPISLUgetTaxa.replace("{taxonId}", onespecies);
                let rtApi = await getDyntaxaAPIgetTaxa(urlSLU);
                //let rtApi = await testAsync(urlSLU);
                //console.log("rt GetTaxa after await : "+rtApi); 
              //});
              }
              console.log(speciesArr.length+" element(s) now in speciesArr");

              if (speciesArr.length>0) {
                writeFileSpecies();
              }
            }


            // async to make sure that the for Loop awaits all the results before doing more
            const asyncedLoopForParentsId = async _ => {
              //speciesArr.forEach(async function(onespecies) {
              for (const onespecies of speciesArr) {
                var urlSLU=urlAPISLUparentsId.replace("{taxonId}", onespecies.dyntaxaId);
                let rtApi = await getDyntaxaAPIparentsId(urlSLU);
                //let rtApi = await testAsync(urlSLU);
                //console.log("rt after await : "+rtApi); 
              //});
              }
              console.log(speciesSupp.length+" element(s) to add as higher hierarchical groups");
              // loop among the species to add to the list

              //console.log("avant asyncedLoopForGetTaxa"+speciesSupp.length);
              asyncedLoopForGetTaxa();
              //console.log("apres asyncedLoopForGetTaxa");
            }


            //console.log("avant asyncedLoopForParentsId");
            let rt=asyncedLoopForParentsId();
            //console.log("apres asyncedLoopForParentsId");

            // add one row for eachelemnt in speciesSupp





          }
        }




      } catch (error) {
          console.error(error.message);
      };
    });

}).on("error", (error) => {
    console.error(error.message);
});
