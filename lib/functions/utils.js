// utils.js

import pkgScanf from 'sscanf';
var scanf = pkgScanf;

function capitalizeFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// input : date as yyyy-mm-ddThh:ii:ssZ
// returns an array with 3 (if no time) or 6 elements
function splitDateInArray (dateToSplit) {

  //var datetimeTemp = dateToSplit.replace("T", " T");
  //var datetimeTemp = datetimeTemp.replace("Z", " Z");
  var datetimeTemp = dateToSplit.replace("T", " ");
  datetimeTemp = datetimeTemp.replace("Z", "");
  //console.log(datetimeTemp);
  var splitDate=scanf(datetimeTemp, "%s-%s-%s %s:%s:%s");
  //console.log(splitDate);

  // FOR SOME REASON WHEN day = 09 => it breaks ! when using %d => %s
  //[WARN] scanf: Invalid char to Octal [9]
  //[WARN] scanf: Invalid octal [9]
  // WHY octal ???
  
  return splitDate;
}


export default { capitalizeFirstLetter, splitDateInArray };