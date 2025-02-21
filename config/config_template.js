var config = {};

config.clientPort=1234;
config.clientUrl="http://localhost:"+config.clientPort;

config.speciesListUrl = "URL/speciesList";
config.downloadUrl = "localhost"; // specific url for download
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

config.maximumNumberRowsTake = 10000;

config.maximumSizeForLongFields = 100;

config.availableDatasets = [
	{
		"displayName": "Svensk Fågeltaxering: Standardrutter",
		"datasetID": "lu_sft_std",
		"downloadPathCsv" :"http://canmove-app.ekol.lu.se/datahostPublicArchives/a.zip",
		"downloadPathXls" :"http://canmove-app.ekol.lu.se/datahostPublicArchives/b.zip",
		"archiveSizeCsv" : "11.8Mb",
		"archiveSizeXlsx" : "48.8Mb"
	},
	{
		"displayName": "Super dataset 2",
		"datasetID": "id_dataset",
		"downloadPathCsv" :"https://www.gbif.se/ipt/resource?r=lu_sft_std",
		"downloadPathXls" :"https://www.gbif.se/ipt/resource?r=lu_sft_std",
		"archiveSizeCsv" : "11.8Mb",
		"archiveSizeXlsx" : "48.8Mb"
	},
];


// STATISTICS
config.databaseStatisticsUrl = "mongodb://localhost:27017";
config.databaseStatisticsName = "statsDB";
config.databaseStatisticsTable = "statsClient";

export default config;