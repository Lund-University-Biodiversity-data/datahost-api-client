var config = {};

config.SLUAPIkey = "YOUR_KEY_HERE";
config.speciesFilePath = "PATH";
config.speciesHierarchyFilePath = "PATH";
config.urlAPIListsALABirds = "URL";
config.urlAPISLUdetails = "URLwith{taxonId}andyourkey=";+config.SLUAPIkey;
config.urlAPISLUgetTaxa = "URLwith{taxonId}andyourkey=";+config.SLUAPIkey;
config.dyntaxaIdAves=4000104;

export default config;