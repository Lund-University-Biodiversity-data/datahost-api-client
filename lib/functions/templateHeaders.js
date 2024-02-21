// templateXlsx.js

function getHeadersHtmlView() {

  var fieldsTranslations=[];
  fieldsTranslations["datasetName"]="datamängd";
  //fieldsTranslations["observationTime"]="Datum";
  fieldsTranslations["scientificName"]="vet. namn";
  fieldsTranslations["vernacularName"]="sv. namn";
  fieldsTranslations["quantity"]="kvantitet";
  fieldsTranslations["occurrenceStatus"]="förekomst";
  fieldsTranslations["dyntaxaId"]="taxon-id";
  fieldsTranslations["eventStartDate"]="inv.datum";
  fieldsTranslations["locationID"]="lokal-id 1";
  fieldsTranslations["locationType"]="lokaltyp 1";
  fieldsTranslations["county"]="län";
  fieldsTranslations["samplingProtocol"]="metod";
  fieldsTranslations["noObservations"]="nollbesök";
  fieldsTranslations["assignerOrganisationCode"]="beställare";
  fieldsTranslations["creatorOrganisationCode"]="utförare";
  fieldsTranslations["purpose"]="syfte";
  fieldsTranslations["description"]="beskrivning";
  fieldsTranslations["startDate"]="startdatum";
  fieldsTranslations["accessRights"]="åtkomst";
  fieldsTranslations["descriptionAccessRights"]="åtkomst beskrivning";
  fieldsTranslations["license"]="användningsrätt";
  fieldsTranslations["locationProtected"]="lokal skyddad";
  fieldsTranslations["coordinates1Point"]="koordinater";
  fieldsTranslations["occurrenceRemarks"]="obs.kommentar";
  fieldsTranslations["observationCertainty"]="obs.noggrannhet";

  //csv
  fieldsTranslations["occurrenceID"]="observations-id";
  fieldsTranslations["basisOfRecord"]="observationsunderlag";
  //fieldsTranslations["observationTime"]="";
  //fieldsTranslations["observationPoint"]="";
  fieldsTranslations["taxon.taxonID"]="taxon-id";
  fieldsTranslations["taxon.euTaxonID"]="EU-artkod";
  fieldsTranslations["taxon.vernacularName"]="svenskt namn";
  fieldsTranslations["taxon.scientificName"]="vetenskapligt namn";
  //fieldsTranslations["taxon.genusName"]="";
  //fieldsTranslations["taxon.speciesName"]="";
  fieldsTranslations["taxon.taxonRank"]="taxonomisk nivå";
  fieldsTranslations["taxon.dyntaxaId"]="taxon-id";
  //fieldsTranslations["taxon.verbatimName"]="";
  //fieldsTranslations["taxon.verbatimTaxonID"]="";
  fieldsTranslations["quantityVariable"]="kvantitetsvariabel";
  fieldsTranslations["unit"]="enhet";
  //fieldsTranslations["organism"]="";
  fieldsTranslations["identificationVerificationStatus"]="kvalitetskontroll";
  //fieldsTranslations["associatedMedia"]="";
  //fieldsTranslations["eventID"]="";
  //fieldsTranslations["datasetID"]=""
  
  return fieldsTranslations;
}


function getTemplateXlsxHeader (inputObject) {

  var templateXlsxHeader=[];

  //DATASET
  templateXlsxHeader["1.identifier"] = "datamängds-id";
  templateXlsxHeader["1.title"] = "datamängdnamn";

  if (inputObject!="Dataset") {

    //EVENT
    templateXlsxHeader["1.eventID"] = "besöks-id";
    templateXlsxHeader["1.eventType"] = "besökstyp";
    //templateXlsxHeader["1.parentEventID"] = "grupperingsbesöks-id";
    templateXlsxHeader["1.eventHierarchy1"] = "besökshierarki 1";
    templateXlsxHeader["1.eventHierarchy2"] = "besökshierarki 2";
    templateXlsxHeader["1.eventStartDate"] = "inventeringsstartdatum";
    templateXlsxHeader["1.eventStartTime"] = "inventeringsstarttid";
    templateXlsxHeader["1.eventStartDate_y"] = "inventeringsstartår";  // CUSTOM FIELD
    templateXlsxHeader["1.eventStartDate_m"] = "inventeringsstartmånad";  // CUSTOM FIELD
    templateXlsxHeader["1.eventStartDate_d"] = "inventeringsstartdag";  // CUSTOM FIELD
    templateXlsxHeader["1.eventEndDate"] = "inventeringsslutdatum";
    templateXlsxHeader["1.eventEndTime"] = "inventeringssluttid";
    templateXlsxHeader["1.eventEndDate_y"] = "inventeringsslutår";  // CUSTOM FIELD
    templateXlsxHeader["1.eventEndDate_m"] = "inventeringsslutmånad";  // CUSTOM FIELD
    templateXlsxHeader["1.eventEndDate_d"] = "inventeringsslutdag";  // CUSTOM FIELD
    templateXlsxHeader["1.locationProtected"] = "lokal skyddad";
    
    //SITE part 1
    templateXlsxHeader["1.site.locationID"]="lokal-id 1";
    templateXlsxHeader["1.site.locationID_internal"]="lokal-id internt 1";
    templateXlsxHeader["1.site.commonName"]="lokalnamn 1";
    templateXlsxHeader["1.site.locality"]="lokalnamn 1";
    templateXlsxHeader["1.site.locationType"]="lokaltyp 1";
    templateXlsxHeader["1.site.routetype"]="utsträckning 1";
    templateXlsxHeader["1.site.sampleSizeValue"]="lokal:storlek 1";
    templateXlsxHeader["1.site.sampleSizeUnit"]="lokal:enhet 1";

    templateXlsxHeader["1.site.emplacement.properties.dimension"]="lokal:dimension";
    templateXlsxHeader["1.site.emplacement.geometry.point1"]="lokal:position:punkt 1";  // CUSTOM FIELD
    templateXlsxHeader["1.site.emplacement.geometry.coordinates.0"]="lokal:position:punkt:koordinat NS 1";
    templateXlsxHeader["1.site.emplacement.geometry.coordinates.1"]="lokal:position:punkt:koordinat EW 1";
    //templateXlsxHeader["1.site.emplacement.properties.horizontalGeometryEstimatedAccuracy"]="lokal:absolut lägesosäkerhet plan";
    //templateXlsxHeader["1.site.emplacement.properties.verticalGeometryEstimatedAccuracy"]="lokal:absolut lägesosäkerhet höjd";    
    templateXlsxHeader["1.site.emplacement.properties.horizontalCoordinateSystem"]="lokal:koordinatsystem plan";
    //templateXlsxHeader["1.site.emplacement.properties.verticalCoordinateSystem"]="lokal:höjdsystem";

    //SITE - part 2
    templateXlsxHeader["1.site.locationID2"]="lokal-id 2";
    templateXlsxHeader["1.site.locationID_internal2"]="lokal-id internt 2";
    templateXlsxHeader["1.site.locality2"]="lokalnamn 2";
    templateXlsxHeader["1.site.locationType2"]="lokaltyp 2";
    templateXlsxHeader["1.site.routetype2"]="utsträckning 2";
    templateXlsxHeader["1.site.sampleSizeValue2"]="lokal:storlek 2";
    templateXlsxHeader["1.site.sampleSizeUnit2"]="lokal:enhet 2";

    templateXlsxHeader["1.site.emplacement2.properties.dimension"]="lokal:dimension 2";
    templateXlsxHeader["1.site.emplacement2.geometry.point2"]="lokal:position:punkt 2";  // CUSTOM FIELD
    templateXlsxHeader["1.site.emplacement2.geometry.coordinates.0"]="lokal:position:punkt:koordinat NS 2";
    templateXlsxHeader["1.site.emplacement2.geometry.coordinates.1"]="lokal:position:punkt:koordinat EW 2";
    //templateXlsxHeader["1.site.emplacement2.properties.horizontalGeometryEstimatedAccuracy"]="lokal:absolut lägesosäkerhet plan";
    //templateXlsxHeader["1.site.emplacement2.properties.verticalGeometryEstimatedAccuracy"]="lokal:absolut lägesosäkerhet höjd";    
    templateXlsxHeader["1.site.emplacement2.properties.horizontalCoordinateSystem"]="lokal:koordinatsystem plan 2";
    //templateXlsxHeader["1.site.emplacement.properties.verticalCoordinateSystem"]="lokal:höjdsystem";

    //SITE - part 3
    templateXlsxHeader["1.site.locationID3"]="lokal-id 3";
    templateXlsxHeader["1.site.locationID_internal3"]="lokal-id internt 3";
    templateXlsxHeader["1.site.locality3"]="lokalnamn 3";
    templateXlsxHeader["1.site.locationType3"]="lokaltyp 3";
    templateXlsxHeader["1.site.routetype3"]="utsträckning 3";
    templateXlsxHeader["1.site.sampleSizeValue3"]="lokal:storlek 3";
    templateXlsxHeader["1.site.sampleSizeUnit3"]="lokal:enhet 3";

    templateXlsxHeader["1.site.emplacement3.properties.dimension"]="lokal:dimension 3";
    templateXlsxHeader["1.site.emplacement3.geometry.point3"]="lokal:position:punkt 3";  // CUSTOM FIELD
    templateXlsxHeader["1.site.emplacement3.geometry.coordinates.0"]="lokal:position:punkt:koordinat NS 3";
    templateXlsxHeader["1.site.emplacement3.geometry.coordinates.1"]="lokal:position:punkt:koordinat EW 3";
    //templateXlsxHeader["1.site.emplacement3.properties.horizontalGeometryEstimatedAccuracy"]="lokal:absolut lägesosäkerhet plan 3";
    //templateXlsxHeader["1.site.emplacement3.properties.verticalGeometryEstimatedAccuracy"]="lokal:absolut lägesosäkerhet höjd 3";    
    templateXlsxHeader["1.site.emplacement3.properties.horizontalCoordinateSystem"]="lokal:koordinatsystem plan 3";
    //templateXlsxHeader["1.site.emplacement3.properties.verticalCoordinateSystem"]="lokal:höjdsystem 3";

    //SITE - part 4
    templateXlsxHeader["1.site.locationID4"]="lokal-id 4";
    templateXlsxHeader["1.site.locationID_internal4"]="lokal-id internt 4";
    templateXlsxHeader["1.site.locationType4"]="lokaltyp 4";


    templateXlsxHeader["1.site.province"]="landskap-provins";
    templateXlsxHeader["1.site.county"]="län";
    templateXlsxHeader["1.site.municipality"]="kommun";
    templateXlsxHeader["1.site.parish"]="socken";
    templateXlsxHeader["1.site.locationRemarks"]="lokalkommentar";

    // RE-EVENT
    templateXlsxHeader["1.recorderCode"] = "inventerare 1";
    templateXlsxHeader["1.recorderCode_2"] = "inventerare 2";
    templateXlsxHeader["1.recorderCode_3"] = "inventerare 3";
    templateXlsxHeader["1.recorderCode_4"] = "inventerare 4";

    templateXlsxHeader["1.recorderOrganisation.organisationCode"] = "inventeringsorganisation:organisationsnamn";
    templateXlsxHeader["1.recorderOrganisation.organisationID"] = "inventeringsorganisation:organisationsnummer";
    templateXlsxHeader["1.samplingProtocol"] = "datainsamlingsmetod";

    templateXlsxHeader["1.snowCover"] = "snötäcke";
    templateXlsxHeader["1.sunshineWeatherMeasure"] = "solsken:vädermått";
    templateXlsxHeader["1.sunshineUnit"] = "solsken:enhet";
    templateXlsxHeader["1.airTemperatureWeatherMeasure"] = "lufttemperatur:vädermått";
    templateXlsxHeader["1.airTemperatureUnit"] = "lufttemperatur:enhet";
    templateXlsxHeader["1.windDirectionCompass"] = "vindriktning kompass";
    templateXlsxHeader["1.windDirectionDegreesWeatherMesure"] = "vindriktning grader:vädermått";
    templateXlsxHeader["1.windDirectionDegreesUnit"] = "vindriktning grader:enhet";
    //templateXlsxHeader["1.windSpeedWeatherMesure"] = "vindhastighet:vädermått";
    //templateXlsxHeader["1.windSpeedUnit"] = "vindhastighet:enhet";
    templateXlsxHeader["1.windStrength"] = "vindstyrka";
    templateXlsxHeader["1.precipitation"] = "nederbörd";
    templateXlsxHeader["1.visibility"] = "sikt";
    templateXlsxHeader["1.cloudiness"] = "molnighet";
    templateXlsxHeader["1.weather"] = "väder";
    templateXlsxHeader["1.transportMethod"] = "transportmetod";
    templateXlsxHeader["1.eventRemarks"] = "inventeringskommentar";
    templateXlsxHeader["1.noObservations"] = "inga observationer under besöket";
    templateXlsxHeader["1.additionalAffiliation"] = "extra tillhörighet";

  }

  if (inputObject=="Occurrence") {
    
    // OCCURRENCE
    templateXlsxHeader["1.occurrenceID"] = "observations-id";
    templateXlsxHeader["1.basisOfRecord"] = "observationsunderlag";
    //templateXlsxHeader["1.observationTime"] = "";
    //templateXlsxHeader["1.observationPoint"] = "[]";
    templateXlsxHeader["1.taxon.taxonID"] = "taxon-id";
    templateXlsxHeader["1.taxon.euTaxonID"] = "EU-artkod";
    templateXlsxHeader["1.taxon.vernacularName"] = "svenskt namn";
    templateXlsxHeader["1.taxon.scientificName"] = "vetenskapligt namn";
    templateXlsxHeader["1.taxon.family"] = "släkte"; // CUSTOM FIELD
    templateXlsxHeader["1.taxon.species"] = "art"; // CUSTOM FIELD
    templateXlsxHeader["1.taxon.subspecies"] = "underart"; // CUSTOM FIELD
    templateXlsxHeader["1.taxon.taxonRank"] = "taxonomisk nivå";
    //templateXlsxHeader["1.taxon.verbatimName"] = "";
    //templateXlsxHeader["1.taxon.verbatimTaxonID"] = "";
    templateXlsxHeader["1.occurrenceStatus"] = "förekomst";
    templateXlsxHeader["1.quantityVariable"] = "kvantitetsvariabel";
    templateXlsxHeader["1.quantity"] = "kvantitet";
    templateXlsxHeader["1.unit"] = "enhet";
    templateXlsxHeader["1.organism.sex"] = "kön";
    templateXlsxHeader["1.organism.lifeStage"] = "ålder-stadium";
    templateXlsxHeader["1.organism.activity"] = "aktivitet";
    templateXlsxHeader["1.organism.size"] = "storlek";
    //templateXlsxHeader["1.organism"] = "[]";
    templateXlsxHeader["1.occurrenceRemarks"] = "observationskommentar";
    templateXlsxHeader["1.observationCertainty"] = "observationsnoggrannhet";
    templateXlsxHeader["1.identificationVerificationStatus"] = "kvalitetskontroll";

  }



  templateXlsxHeader["1.projectID"] = "projekt-id";
  templateXlsxHeader["1.projectCode"] = "projektnamn";
  templateXlsxHeader["1.projectType"] = "projekttyp";
  templateXlsxHeader["1.programmeArea"] = "programområde";
  templateXlsxHeader["1.assigner.organisationCode"] = "beställare:organisationsnamn";
  templateXlsxHeader["1.assigner.organisationID"] = "beställare:organisationsnummer";
  templateXlsxHeader["1.creator.organisationCode"] = "utförare:organisationsnamn";
  templateXlsxHeader["1.creator.organisationID"] = "utförare:organisationsnummer";
  templateXlsxHeader["1.ownerinstitutionCode.organisationCode"] = "informationsansvarig myndighet:organisationsnamn";
  templateXlsxHeader["1.ownerinstitutionCode.organisationID"] = "informationsansvarig myndighet:organisationsnummer";
  templateXlsxHeader["1.publisher.organisationCode"] = "datavärd:organisationsnamn";
  templateXlsxHeader["1.publisher.organisationID"] = "datavärd:organisationsnummer";
  templateXlsxHeader["1.dataStewardship"] = "datavärdskap";
  templateXlsxHeader["1.purpose"] = "syfte";
  templateXlsxHeader["1.description"] = "datamängdbeskrivning";
  templateXlsxHeader["1.methodology.methodologyName"] = "metodiknamn";
  templateXlsxHeader["1.methodology.methodologyDescription"] = "metodikbeskrivning";
  templateXlsxHeader["1.methodology.methodologyLink"] = "metodiklänk";
  templateXlsxHeader["1.methodology.speciesList"] = "artlista";
  templateXlsxHeader["1.startDate"] = "startdatum";
  templateXlsxHeader["1.endDate"] = "slutdatum";
  //templateXlsxHeader["1.latestDate"] = "senaste datum";
  templateXlsxHeader["1.spatial"] = "land";
  templateXlsxHeader["1.accessRights"] = "åtkomsträttigheter";
  templateXlsxHeader["1.descriptionAccessRights"] = "beskrivning åtkomsträttigheter";
  templateXlsxHeader["1.license"] = "användningsrättigheter";
  templateXlsxHeader["1.metadatalanguage"] = "metadataspråk";
  templateXlsxHeader["1.language"] = "datamängdspråk";

  return templateXlsxHeader;
}



export default { getTemplateXlsxHeader, getHeadersHtmlView };