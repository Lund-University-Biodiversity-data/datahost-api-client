var config = {};

config.speciesListUrl = "URL/speciesList";
config.downloadFolderUrl = "folder/"; // folder with access rights

config.defaultStartDate="1975-01-01";
config.defaultEndDate="2010-12-31";

config.defaultObject="Occurrence";
config.defaultSourceSubmit="Occurrence";
config.defaultTaxon="[100062, 102933]";
config.defaultArea = "";
config.defaultDatasetList = [];
config.defaultCounty = ["None selected"];
//config.defaultCounty = ["Skåne län"];
config.defaultDateType = "BetweenStartDateAndEndDate";

config.availableDatasets = [
	{
		"displayName": "super dataset",
		"datasetID": "crazy-id-here",
		"downloadPath" :""
	},
	{
		"displayName": "super dataset 2",
		"datasetID": "crazy-id-here",
		"downloadPath" :""
	},
];

export default config;