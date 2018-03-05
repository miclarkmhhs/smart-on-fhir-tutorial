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
        var patient = smart.patient;
        var enc_json = {'type':'Encounter', 'id': ''};
        //var json_string = JSON.stringify(enc_json);
        //var enc_string = JSON.parse(json_string);
        enc_json['id'] = smart.tokenResponse.encounter;
        var enc = smart.api.read(enc_json);
        var pt = patient.read();
        
        $.when(pt,enc).fail(onError);        
        $.when(pt,enc).done(function(patient,encounter){ 
        var loc = encounter.data.location["0"].location.display;
        var enc_text = encounter.data.identifier["0"].value;
        var mrn_text = patient.identifier["0"].value;
        var p = defaultOutput();
        p.username = usr_name;
        p.fin_no = mrn_text;
        p.encounter_no = enc_text;
        p.fac_code = loc;
        p.birth_date = patient.birthDate;
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
      fac_code: {value: ''},
      birth_date: {value: ''}
    };
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#username').html(p.username);
    $('#fin').html(p.fin_no);
    $('#encounter').html(p.encounter_no);
    $('#birth_date').html(p.birth_date);
    $('#location').html(p.fac_code);
  };

})(window);
