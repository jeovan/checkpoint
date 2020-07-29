
var mapa = {
  map: null,
  drawing: false,
  source: new ol.source.Vector(),
  raster:new ol.layer.Tile({source: new ol.source.OSM()}),
  drawVector: null,
  drawInteraction:null,
  temp_geojson: null,
  temp_feature:null,
  usuario:null,
  init: function(id){
    var _this = this;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        _this.montarMapa(id,[position.coords.longitude, position.coords.latitude])
      });
    }else{ _this.montarMapa(id,[-63.8522404,-8.7544907])}
  },
  montarMapa: function(id,position){
    var _this = this;
    var center = ol.proj.fromLonLat(position);
    var format = new ol.format.GeoJSON();
    geojson_init = JSON.parse('{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[]},"properties":null}]}')
    geojson_init.features[0].geometry.coordinates =center
    _this.usuario = format.readFeatures(geojson_init)
    _this.usuario[0].id = 'usuario'
    _this.source.addFeatures( _this.usuario )
    main.procurar_areas().map(function(m){
      var feature = format.readFeatures(JSON.parse(m.value.geojson))
      feature[0].id = m.value.id
      if(m.value.status == 1){
        feature[0].setStyle(new ol.style.Style({
          stroke: new ol.style.Stroke({ color: 'rgba(214, 82, 266, 1)', width: 2 }),
          fill: new ol.style.Fill({ color: 'rgba(214, 82, 266, 0.3)' })
        }));
      }
      return _this.source.addFeatures( feature )
    })
    _this.drawVector = new ol.layer.Vector({
      source: _this.source,
      style: new ol.style.Style({
        image:new ol.style.Icon ({
          src: './icon-map.png',
          anchor: [0.5, 1],
          scale: 0.05
        }),
        stroke: new ol.style.Stroke({ color: 'rgba(45, 199, 211, 1)', width: 2 }),
        fill: new ol.style.Fill({ color: 'rgba(45, 199, 211, 0.3)' })
      })
    });

    _this.map = new ol.Map({
      layers: [_this.raster, _this.drawVector],
      target: id,
      view: new ol.View({ center:center, zoom: 14 })
    });

    _this.marcarArea()
    _this.map.on('click', function (event) {
      if (!_this.drawing) { 
      }
    });
    _this.map.on('postcompose',function(e){  document.querySelector('canvas').style.filter="invert(90%)"; });
    var geolocation = new ol.Geolocation({
      projection: _this.map.getView().getProjection(),
      tracking: true,
      trackingOptions: {
        enableHighAccuracy: true,
        maximumAge: 0  
      }
    });
    geolocation.on('change', function() {
      var pos = geolocation.getPosition();
      console.log(pos)
      _this.usuario[0].setGeometry(new ol.geom.Point(pos));
      // _this.map.view.setCenter(pos);
      // view.setZoom(18); 
    });
  },
  marcarArea: function(){
    var _this = this;
    
    function addInteraction() {
      _this.drawInteraction = new ol.interaction.Draw({
        source:  _this.source,
        type: 'Polygon'
      });
      _this.map.addInteraction(_this.drawInteraction);

      _this.drawInteraction.on('drawstart', function () {_this.drawing = true;_this.temp_geojson = null});
      _this.drawInteraction.on('drawend', function (e) {
      _this.drawing = false;
      var writer = new ol.format.GeoJSON();
      _this.temp_geojson = writer.writeFeatures([ e.feature])
      _this.temp_feature = e.feature;
      e.feature.id = Date.now()
    });
    }
    
    addInteraction();
  }
}


