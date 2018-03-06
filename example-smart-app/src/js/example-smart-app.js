    var loc = '';
    var enc_text = '';
    var usr_name = '';

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
        usr_name = smart.tokenResponse.username;        
        var patient = smart.patient;
        var enc_json = {'type':'Encounter', 'id': ''};
        enc_json['id'] = smart.tokenResponse.encounter;
        var enc = smart.api.read(enc_json);
        var pt = patient.read();
        
        $.when(pt,enc).fail(onError);        
        $.when(pt,enc).done(function(patient,encounter){ 
        loc = encounter.data.location["0"].location.display;
        enc_text = encounter.data.identifier["0"].value;
        var mrn_text = patient.identifier["0"].value;
        ret.resolve();
        });                                      
      } else {
        onError();
      }
    }
    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();
  };

  window.loadDestinationApp = function() {
    $('#resp').show();
    $('#loading').hide();
    sendData(enc_text,loc,usr_name);
  };

            function postAjax(url,data,success) {
                var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
                xhr.open('POST', url,true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState > 3 && xhr.status == 200) {
                        success(this.responseText);
                    }
                };
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader("Accept", "text/plain");
                xhr.setRequestHeader("x-tafi-user-name", 'tafi');
                xhr.setRequestHeader("x-tafi-call-key", 'Qbi7lkjadf#aOIUKkky');
                xhr.send(JSON.stringify(data));
                return xhr;
            };

            function createJson(enctr,loc_fac,user) {
                // Create JSON to Post
                var jsonPost = {};

                // Setup API Tracking
                jsonPost.apiTrack = {};
                jsonPost.apiTrack.sequence = 1;
                jsonPost.apiTrack.destination = {};
                jsonPost.apiTrack.source = {};
                jsonPost.patient = {};
                jsonPost.provider = {};

                // Create Destination
                jsonPost.apiTrack.destination.id = "perfectServe";
                jsonPost.apiTrack.destination.name = "PerfectServe";
                
                // Create Source
                jsonPost.apiTrack.source.id = "memorialHerman";
                jsonPost.apiTrack.source.name = "Memorial Herman";
                
                // Setup Patient
                jsonPost.patient.mrns = [];
                jsonPost.patient.encounters = []; 
               
                // Create and push patient MRN
                var mrn = {};
                mrn.client = "memorialHerman";
		mrn.system = "cerner";
                mrn.number = "";
                jsonPost.patient.mrns.push(mrn);

                // Create and push locations
		locations = []
                var location = {};
                location.facility = loc_fac;
                location.transactionDateTime = "2017-01-22T14:45:48.032Z";
                location.client = "memorialHerman";
                location.building = "Main";
                location.nurseOrAmbulatoryUnit = "";
		locations.push(location);

                // Create and push encounters
                var encounter = {};
                encounter.client = "memorialHerman";
                encounter.fin = enctr;
		encounter.locations = locations;
                jsonPost.patient.encounters.push(encounter);

                // Setup Provider
                jsonPost.provider.userIds = [];

		            // Create and push provider ids
                var userId = {};
                userId.client = "memorialHerman";
		userId.system = "cerner";
                userId.id = user;
                jsonPost.provider.userIds.push(userId); 
                $('#resp').appdnd(JSON.stringify(jsonPost));
                return jsonPost;
            };
            
            function sendData(enctr,loc_fac,user) {
                var jsonPost = createJson(enctr, loc_fac,user);
                postAjax('https://emr.qa-ps.com/ws/api/v1/emrlink/',jsonPost,function (data) {
                       $('#resp').appdnd(data);
                       //window.location.href = data;
                });
            }

})(window);
