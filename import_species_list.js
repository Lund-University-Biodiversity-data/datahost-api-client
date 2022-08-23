
import configData  from './config/config.js';
const config = configData;

import pkgHttps from 'https';
const https = pkgHttps;

import pkgFs from 'fs';
const fs = pkgFs;

const speciesFilePath= config.speciesFilePath;

const speciesArr=[];
let urlAPIListsALA=config.urlAPIListsALABirds;

const SLUAPIkey = config.SLUAPIkey;


https.get(urlAPIListsALA,(res) => {
    let body = "";

    res.on("data", (chunk) => {
        body += chunk;
    });

    res.on("end", () => {
        try {
            let json = JSON.parse(body);
            // do something with JSON

            var lsid="";
            var dyntaxaId="";
            var scientificName="";
            var swedishName="";

            Object.entries(json).forEach(element => {

              const [key, data] = element;

              lsid=data.id;
              scientificName=data.name;
              Object.entries(data.kvpValues).forEach(([kvpKey, kvpVal]) => {

                if (kvpVal.key=="dyntaxa_id") {
                  dyntaxaId=kvpVal.value;
                }
                else if (kvpVal.key=="arthela") {
                  swedishName=kvpVal.value;
                }

              });
              
              speciesArr.push ({
                lsid: lsid,
                scientificName: scientificName,
                swedishName: swedishName,
                dyntaxaId: dyntaxaId

              });

              //console.log(speciesArr);

            });

            console.log(speciesArr);
            if (speciesArr.length>0) {

              let jsonForFile = JSON.stringify(speciesArr);
              fs.writeFile(speciesFilePath, jsonForFile, function (err) {
                if (err) return console.log(err);
                console.log('Files created : '+speciesFilePath);
              });
            }

        } catch (error) {
            console.error(error.message);
        };
    });

}).on("error", (error) => {
    console.error(error.message);
});
