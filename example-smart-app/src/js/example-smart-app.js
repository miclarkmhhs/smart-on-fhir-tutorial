(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {                                
        $('#resp').html(JSON.stringify(smart));
        var usr_name = smart.tokenResponse.username;        
        var FIN_no = smart.tokenResponse.patient;        
        var ENC_no = smart.tokenResponse.encounter;
        var patient = smart.patient;
        var enc = smart.api.read({'type':'Encounter', 'id': '4027930'});
        var pt = patient.read();

        //var enc = smart.patient.api.search({
        //  type: 'Encounter'
        //});
        
        $.when(pt,enc).fail(onError);        
        $.when(pt,enc).done(function(patient,encounter) {
        var x = patient;
        var loc = encounter.data.location["0"].location.display;
        var enc_text = encounter.data.identifier["0"].value;
        var p = defaultOutput();
        p.username = usr_name;
        p.fin_no = FIN_no;
        p.encounter_no = enc_text;
        p.fac_code = loc;
        ret.resolve(p);
        });                                      
      } else {
        onError();
      }
    }
    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();
  };

  function defaultOutput(){
    return {
      username: {value: ''},
      fin_no: {value: ''},
      encounter_no: {value: ''},
      fac_code: {value: ''}
    };
  }
  
  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#username').html(p.username);
    $('#fin').html(p.fin_no);
    $('#encounter').html(p.encounter_no);
    $('#location').html(p.fac_code);
  };  };

})(window);
