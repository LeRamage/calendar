// --------- Confirmation du formulaire de Demande de Congé --------- //
function confirm_form_Demandeconge(){

    let start = new Date($('#dateDebut').val());
    let end = new Date($('#dateFin').val());
    let startHour = $('#heureDebut').val();
    let endHour = $('#heureFin').val();
    let event = calendar.getEvents()[calendar.getEvents().length - 1];
    let info = [];
  
    if((start <= end) == false){
      $('.invalid').show()
      let element = document.getElementById('dateFin');
      element.classList.add('not-valid');
    }
  
    else if(
      (moment(start).isSame(moment(end),'day')) 
      && (startHour =='Après-midi' && endHour == 'Après-midi')
    ){
      $('.isTheSame').show()
      let element = document.getElementById('heureDebut');
      element.classList.add('not-valid');
      element = document.getElementById('heureFin');
      element.classList.add('not-valid');
    }
  
    else{
      $('.invalid').hide();
      $('#dateFin').removeClass('not-valid');
      $('.isTheSame').hide();
      $('#heureDebut').removeClass('not-valid');
      $('#heureFin').removeClass('not-valid');
  
      $("form#form-demandeConge :input").each(function(){
        let info_id = 'V'+$(this)[0].id;
        let val = $(this).val() ;
        info[info_id] = val;
      })
  
      let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
      EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event,'#modalDemandeConge');
      
    } 
  }
  
  // --------- Confirmation du formulaire de Congé --------- //
  function confirm_form_conge(){
    let start = new Date($('#CdateDebut').val());
    let end = new Date($('#CdateFin').val());
    let startHour = $('#CheureDebut').val();
    let endHour = $('#CheureFin').val();   
    let event = calendar.getEvents()[calendar.getEvents().length - 1];
    let info = []
  
    if((start <= end) == false){
      $('.invalid').show()
      var element = document.getElementById('CdateFin');
      element.classList.add('not-valid');
    }
  
    else if(
      (moment(start).isSame(moment(end),'day')) 
      && (startHour =='Après-midi' && endHour == 'Après-midi')
    ){
      $('.isTheSame').show()
      var element = document.getElementById('CheureDebut');
      element.classList.add('not-valid');
      element = document.getElementById('CheureFin');
      element.classList.add('not-valid');
    }
  
    else{
      $('.invalid').hide();
      $('#dateFin').removeClass('not-valid');
      $('.isTheSame').hide();
      $('#CheureDebut').removeClass('not-valid');
      $('#CheureFin').removeClass('not-valid');

      $("form#form-Conge :input").each(function(){
        let info_id = 'V'+$(this)[0].id.slice(1);
        let val = $(this).val() ;
        info[info_id] = val;
      })
      console.log(info)
      let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
      EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event,'#modalConge')
    } 
  }
  
  // --------- Annulation d'un Congé --------- //
  function cancel(event){
    $('#modalDemandeConge').modal('hide');
    $('#modalConge').modal('hide');
    $('.invalid').hide();
    $('#CdateFin').removeClass('not-valid');
    $('.require').hide();
    $('#CnbJours').removeClass('not-valid');
    $('.invalid').hide();
    $('#dateFin').removeClass('not-valid');
    $('.require').hide();
    $('#nbJours').removeClass('not-valid');
    $('.notEqual0').hide();
    event.remove();
  }
  
  // --------- Validation d'une Demande Congé --------- //
  function validation_demande_conge(event){
      let newEvent = {
        title:"Congé",
        start:event.start,
        end:event.end,
        classNames:'conge',
        extendedProps: {'ID':event.extendedProps.ID},
        resourceId:event.getResources()[0].id,
      }
  
      calendar.addEvent(newEvent);
      event.remove();
      $('#modalValidationConge').modal('hide'); 
  }
  
  // --------- Deny d'un Congé --------- //
  function denyDemandeConge(event){
    let newEvent = {
      title:"Congé Refusé",
      start:event.start,
      end:event.end,
      classNames:'congeDeny',
    }
    calendar.addEvent(newEvent);
    event.remove();
    $('#modalValidationConge').modal('hide'); 
  }