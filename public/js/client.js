
$(document).ready(function () {

  // initiate the different selectpickers
  $('.selectpicker').selectpicker();

  $('.datepicker').datepicker({
    format: 'yyyy-mm-dd'
  });

  $( "#selectAllDatasets").click(function() {
    $('input[name=datasetCheckB]').prop('checked', true); 
  });

  $( "#clearDatasets").click(function() {
    $('input[name=datasetCheckB]').prop('checked', false); 
  });

  $( "#clearCounties").click(function() {
    $('select[name=inputCounty]').val('').selectpicker('deselectAll');  
  });

  $( "#clearDates").click(function() {
    $('input[name=inputStartDate]').val(""); 
    $('input[name=inputEndDate]').val(""); 
  });

  $( "#clearTaxon").click(function() {
    $('select[name=inputTaxon]').val('').selectpicker('deselectAll'); 

    $('select[name=inputTaxon]').selectpicker("refresh");;
    $('#inputTaxon').selectpicker('destroy').selectpicker();
  });

  $('input[name="radioTaxon"]').on('click', function() {
    if ($(this).attr('id')!="radioTaxonAll") {
      //$("#divTaxonList").css("display", "none");
      $('select[name=inputTaxon]').val('').selectpicker('deselectAll');

      switch ($(this).attr('id')) {
        case "radioTaxonBirds":   
          $('select[name=inputTaxon]').val(4000104).selectpicker("refresh");;
          break;
        case "radioTaxonButterflies":
          $('select[name=inputTaxon]').val(3000188).selectpicker("refresh");;
          break;
        case "radioTaxonMammals":
          $('select[name=inputTaxon]').val(4000107).selectpicker("refresh");;
          break;
        case "radioTaxonAmphibians":
          $('select[name=inputTaxon]').val(4000105).selectpicker("refresh");;
          break;
        case "radioTaxonKrak":
          $('select[name=inputTaxon]').val(2002118).selectpicker("refresh");;
          break;
      }
      
    }
    else {
      $('select[name=inputTaxon]').val('').selectpicker('deselectAll');
    }

    // to avoid the duplicated list when refresh ! bug from selectpicker, no official fix so far
    $('#inputTaxon').selectpicker('destroy').selectpicker();

  });

  $('input[name="radioGeography"]').on('click', function() {
    if ($(this).val()=="lanmun") {
      $("#mapSection").addClass("disabledsection");
      $("#lanmunSection").removeClass("disabledsection");

    }
    else {
      $("#lanmunSection").addClass("disabledsection");
      $('select[name=inputCounty]').val('').selectpicker('deselectAll');  
      //$('select[name=inputMunicipality]').val('').selectpicker('deselectAll');  

      $("#mapSection").removeClass("disabledsection");
    }
  });

  $('#lanmunSection').on('click', function() {
    $('#radioGeographyLanmun').prop('checked', true);
    $("#mapSection").addClass("disabledsection");
    $("#lanmunSection").removeClass("disabledsection");
  });
  $('#mapSection').on('click', function() {
    $('#radioGeographyKarta').prop('checked', true);
    $("#lanmunSection").addClass("disabledsection");
    $('select[name=inputCounty]').val('').selectpicker('deselectAll');  
    //$('select[name=inputMunicipality]').val('').selectpicker('deselectAll');  

    $("#mapSection").removeClass("disabledsection");
  });


  /*
  $('#downloadButton').on('click', function() {
    $('#inputSourceSubmit').val("download");
  });
  */

  $('#buttonExportCsv').on('click', function() {
    $('#inputSourceSubmit').val("exportCsv");
  });
  $('#buttonExportXlsx').on('click', function() {
    $('#inputSourceSubmit').val("exportXlsx");
  });

  var map = L.map('map').setView([62.47204526039855, 16.149376718556645], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
  }).addTo(map);
  // FeatureGroup is to store editable layers
  //var drawnItems = new L.FeatureGroup();
  //map.addLayer(drawnItems);
  var drawControl = new L.Control.Draw({
     draw: {
        rectangle:false,
        polygon: true,
        marker: false,
        polyline: false,
        circle: false
     }
  });
  map.addControl(drawControl);

  
  if ($("#inputArea").val()!="") {
    
    $('#radioGeographyKarta').prop('checked', true);
    $("#lanmunSection").addClass("disabledsection");
    $('select[name=inputCounty]').val('').selectpicker('deselectAll');  
    //$('select[name=inputMunicipality]').val('').selectpicker('deselectAll');  

    $("#mapSection").removeClass("disabledsection");


    var boundsArr = $("#inputArea").val().split("#");
    var onePoint;
    if (boundsArr.length > 2) {
      var arrBounds=[];
      boundsArr.forEach(elt => {
        onePoint = elt.split(",");
        arrBounds.push(L.latLng(onePoint[0], onePoint[1]));
      });
      //console.log(arrBounds);

      var polyg = L.polygon(arrBounds, {color: 'green', weight: 1}).addTo(map);

    }

    /*
    // rectangle
    if (boundsArr.length == 8) {
      var bounds = L.latLngBounds(L.latLng(boundsArr[0], boundsArr[1]), L.latLng(boundsArr[4], boundsArr[5]));    
      console.log(bounds);

      var rect = L.rectangle(bounds, {color: 'blue', weight: 1}).on('click', function (e) {
          // There event is event object
          // there e.type === 'click'
          // there e.lanlng === L.LatLng on map
          // there e.target.getLatLngs() - your rectangle coordinates
          // but e.target !== rect
          console.info(e);
      }).addTo(map);
      //alert("rect");
    }
    */

    

  }
  

  // event when object drawn on the map
  map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

    if (type === 'marker') {
        // Do marker specific actions
    }

    if (type === 'rectangle' || type === 'polygon') {
      //layer.on('mouseover', function() {   });

      $('#inputArea').val(layer.getLatLngs());
    }

    // Do whatever else you need to. (save to db, add to map etc)
    map.addLayer(layer);
  });



  // check if the element exists
  if ($('#resultTable').length > 0) {

    var filtersConfig = {
        base_path: 'tablefilter/',
        paging: {
          results_per_page: ['Records: ', [10, 25, 50, 100]]
        },
        state: {
          types: ['local_storage'],
          filters: true,
          page_number: true,
          page_length: true,
          sort: true
        },
        alternate_rows: true,
        btn_reset: true,
        rows_counter: true,
        loader: {
          html: '<div id="lblMsg"></div>',
          css_class: 'myLoader'
        },
        status_bar: {
          target_id: 'lblMsg',
          css_class: 'myStatus'
        },
        col_0: 'select',
        col_1: 'select',
        col_2: 'select',
        col_types: [
            'string', 'string', 'number',
            'number', 'number', 'number',
            'number', 'number', 'number'
        ],
        extensions:[{
            name: 'sort'
        }]
    };
    var tf = new TableFilter('resultTable', filtersConfig);


    tf.init();

  }

});


