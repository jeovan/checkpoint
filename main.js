var main = {
  card_area: function(dados){
    var cor = dados.status == 0 ? 'grey darken-3': 'green accent-4'
    var card = `<div class="col s6 m2" id="card_${dados.id}">
      <div class="card   ${cor}">
        <div class="card-content white-text">
          <span>${dados.titulo} </span> <a  data-key="${dados.id}" class="card_remove btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons">delete</i></a>
        </div>
      </div>
    </div>`

    $('#cardAreas').append(card)
  },
  carregar_cards:function(){ this.procurar_areas().map((m) => {return this.card_area(m.value) }) },
  procurar_areas:function(id = null){
    var areas = []
    for (var i = 0; i < localStorage.length; i++){
      var dados ={
        key: i,
        value: JSON.parse(localStorage.getItem(localStorage.key(i)))
      }
      areas.push(dados)
    }
    if(id){
      return areas.filter(function(v){return v.value.id == id});
    }else{
      return areas.sort(function(a,b){if(a.value.id > b.value.id) return 1; if(a.value.id < b.value.id) return -1; return 0;})
    }

  }
}


$( document ).ready(function() {
  $('.modal').modal();
  mapa.init('map');
  main.carregar_cards();
  console.log(main.procurar_areas().map(function(m){return m.value}))
});

$(document).on('click','#btn_salvar',function(){
  if(mapa.temp_geojson && $('#inpt_titulo').val().length > 0){
    var dados = {
      id:mapa.temp_feature.id,
      position: localStorage.length,
      geojson: mapa.temp_geojson,
      status: 0,
      titulo: $('#inpt_titulo').val()
    }
    localStorage.setItem(localStorage.length,JSON.stringify(dados));
    main.card_area(dados);
    mapa.temp_geojson = null;
    $('#inpt_titulo').val('');
  }else{
    alert('not ok')
  }
})

$(document).on('click','.card_remove',function(){
  var id = $(this).data('key')
  $('#area_modal_del').val(id)
  M.Modal.getInstance(document.querySelector('#modal1')).open()
})

$(document).on('click','#confirm_remove',function(){
  var id = $('#area_modal_del').val()
  localStorage.removeItem(main.procurar_areas(id)[0].value.position);
  $('#card_'+id).remove();
  mapa.source.removeFeature(mapa.source.getFeatures().filter(function(v){return v.id == id})[0]);
})