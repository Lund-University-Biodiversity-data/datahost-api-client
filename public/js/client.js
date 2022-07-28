//var LuApiDocumentationTemplate = require('lu_api_documentation_template');
//import pkg from 'lu_api_documentation_template';
//import pkg from '../lu_api_documentation_template/src/index.js';
//const { LuApiDocumentationTemplate } = pkg;

var LuApiDocumentationTemplate = require('./LuApiDocumentationTemplate');


console.error("coucou");
console.log("coucourequire");

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