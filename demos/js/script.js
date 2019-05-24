var calendar ;
var demandeCongesInfo = [];

document.addEventListener('DOMContentLoaded', function() {
    var Calendar = FullCalendar.Calendar;
    var Draggable = FullCalendarInteraction.Draggable

    /* initialize the external events
    -----------------------------------------------------------------*/
    //// the individual way to do it
    var containerEl = document.getElementById('external-events-list');
    var eventEls = Array.prototype.slice.call(
      containerEl.querySelectorAll('.fc-event')
    );
    eventEls.forEach(function(eventEl) {
      _id = eventEl.id;
      new Draggable(eventEl, {
        eventData: {
          title: eventEl.innerText.trim(),
          classNames:_id,
          id:_id,
        }
      });
    });

    /* initialize the calendar
    -----------------------------------------------------------------*/

    var calendarEl = document.getElementById('calendar');

    calendar = new Calendar(calendarEl, {
    plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'list' ],

    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    
    locale: 'fr',
    firstDay: 1,
    editable: true,
    droppable: true, 
    displayEventTime: true,
    displayEventEnd: true,
    disableDragging: true,

    eventClick: function(e) {
      var eventClassNames = e.event.classNames[0];
      $('#eventClicked').val(e.event);

      if(eventClassNames == 'demandeConge'){
        demandeCongesInfo.forEach(function(conge){
          dateConge = new Date(conge["VdateDebut"]);
          if(moment(dateConge).isSame(moment(e.event.start),'day')){
            Object.keys(conge).forEach(function(element){
              $('#'+element).val(conge[element]);
            })
            return; // ?
          }
        }) 
        $('#modalValidationConge').modal('show')
      }

      else if(eventClassNames == 'conge'){
        demandeCongesInfo.forEach(function(conge){
          dateConge = new Date(conge["VdateDebut"]);
          if(moment(dateConge).isSame(moment(e.event.start),'day')){
            Object.keys(conge).forEach(function(element){
              $('#I'+element.slice(1)).val(conge[element]);
            })
            return; // ?
          }
        })
        $('#modalInfoConge').modal('show')
      }
    },

    eventReceive: function(e){
      $('#eventReceive').val(e.event);
    },

    drop: function(arg) {  
      let Cid = arg.draggedEl.id;
      
      if(Cid == 'demandeConge'){
        start = arg.date;
        let eventsToRemove = thisDateHasEvent(start,start)
        
        if(eventsToRemove.length > 0 && eventsToRemove[eventsToRemove.length -1] != true){
          $('#modalDemandeConge').modal({backdrop: 'static'});
          $('#modalDemandeConge').modal('show');
          $('#dateDebut').val(arg["dateStr"]);
          $('#dateFin').val(arg["dateStr"]);  
        }
        else{
          displayErrorDemandeConge();
        }       
      }

      else if(Cid == 'conge'){
        start = arg.date;
        let eventsToRemove = thisDateHasEvent(start,start)

        if(eventsToRemove.length > 0 && eventsToRemove[eventsToRemove.length -1] != true){
          $('#modalConge').modal({backdrop: 'static'});
          $('#modalConge').modal('show');
          $('#CdateDebut').val(arg["dateStr"]);
          $('#CdateFin').val(arg["dateStr"]);
        }
        else{
          displayErrorDemandeConge()
        }
      }

      else{
        start = new Date(arg["dateStr"]);
        let eventsToRemove = thisDateHasEvent(start,start);
        if(eventsToRemove.length>0 && eventsToRemove[0]!=true)
          eventsToRemove.forEach(eventToRemove => eventToRemove.remove());
        else{
          setTimeout(function(){
            $('#eventReceive').val().remove();
          }, 10);
        }
      }
    },
    
    eventRender: function(event) {        
      let element = $(event.el);
      element.css('border','none');
      
      if(event.event.classNames[0] != 'present' && event.event.classNames[0] != 'ferie_WE' && event.event.classNames[0] != 'specialPresent'){
        element[0].children[0].addEventListener('contextmenu', function(ev){
          ev.preventDefault();
          $('#eventRightClicked').val(event.event)
          $('#modalDelete').modal('show');
          return false;
        }, false);
      }

      // Changer le Titre lorsque l'événement s'étale sur plusieurs jours
      if(event.event.classNames =='demandeConge' || event.event.classNames == 'conge'){
        if(moment(event.event.start).isBefore(moment(event.event.end),'day')){
          let nbrOfDays =  moment(event.event.end).dayOfYear() - moment(event.event.start).dayOfYear()
          if(moment(event.event.end).hour() == 12 && moment(event.event.start).hour() == 9){
            let str = nbrOfDays.toString()+' jour(s) et demi'
            element[0].children[0].children[0].innerText = str
          }
          else if(moment(event.event.end).hour() == 12 && moment(event.event.start).hour() == 13){
            let str = nbrOfDays.toString()+' jour(s)'
            element[0].children[0].children[0].innerText = str
          }
          else if(moment(event.event.end).hour() == 18 && moment(event.event.start).hour() == 13){
            let str = nbrOfDays.toString()+' jour(s) et demi'
            element[0].children[0].children[0].innerText = str
          }  
          else{
            let str = (nbrOfDays+1).toString()+' jours complet'
            element[0].children[0].children[0].innerText = str
          } 
        }
      }
    },

    eventDrop: function(e){
      if(e.event.classNames[0] == 'demandeConge' || e.event.classNames[0] == 'conge' || e.event.classNames[0] == 'congeDeny' || e.event.classNames[0] == 'specialPresent'){
        e.event.remove();
        calendar.addEvent(e.oldEvent);
      }
      else{
        let oldEvent = e.oldEvent;
        let indexOfEvent = calendar.getEvents().findIndex(event => event._instance.instanceId === e.event._instance.instanceId)
        console.log('test');
        if(e.event.end === null){
          let eventToReplace = constrainDrop(e.event.start,e.event.start);
          if(eventToReplace[0] != true){
            eventToReplace[0].setDates(oldEvent.start,oldEvent.start);
            eventToReplace[0].setAllDay(true);
          }
          else{
            e.event.remove();
            calendar.addEvent(oldEvent);
          }
        }
        else{
          let datesToReplace = createDateArray(e.oldEvent.start,moment(e.oldEvent.end).subtract(1, "days")._d);
          let eventsToReplace = constrainDrop(e.event.start,e.event.end, indexOfEvent);
          if(eventsToReplace.findIndex(function(event){
            return event == true
          }) != -1){
            e.event.remove();
            calendar.addEvent(oldEvent);
          }
          else{
            let iterator = 0;
            eventsToReplace.forEach(function(event){
              event.setDates(datesToReplace[iterator],datesToReplace[iterator]);
              event.setAllDay(true);
              iterator++;
            })
          }
        } 
      }      
    },
    
    eventResize: function(e){
      if(e.endDelta.days > 0){
        let eventsToRemove = constrainResize(e.endDelta.days,e.event.start);
        if(eventsToRemove[eventsToRemove.length - 1] != true){
          eventsToRemove.forEach(event => event.remove())
        }
        else{
          setTimeout(function(){
            e.event.remove();
            calendar.addEvent(e.prevEvent);
          },10);
        }
      }

      else if(e.endDelta.days < 0){
        let event= []
        for(i = 1; i <= Math.abs(e.endDelta.days); i++){
          event = [
            {
              classNames: 'present',
              title: "Present(e)",
              start: moment(e.prevEvent.end).subtract(i, "days")._d,
              allDay: true,
            }
          ]
          calendar.addEventSource(event)
        }
      }
    },

  });
  calendar.render();
  CreateEventPresence();
});

// --------- Confirmation du formulaire de Demande de Congé --------- //
function confirm_form_Demandeconge(){

  let start = new Date($('#dateDebut').val());
  let end = new Date($('#dateFin').val());
  let startHour = $('#heureDebut').val();
  let endHour = $('#heureFin').val();

  if((start <= end) == false){
    $('.invalid').show()
    var element = document.getElementById('dateFin');
    element.classList.add('not-valid');
  }

  else if(
    (moment(start).isSame(moment(end),'day')) 
    && (startHour =='Après-midi' && endHour == 'Après-midi')
  ){
    $('.isTheSame').show()
    var element = document.getElementById('heureDebut');
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

    let event = calendar.getEvents()[calendar.getEvents().length - 1];

    let info = []
    $("form#form-demandeConge :input").each(function(){
      let info_id = 'V'+$(this)[0].id;
      let val = $(this).val() ;
      info[info_id] = val;
    })

    let eventsToRemove = thisDateHasEvent(start,end,true);
    EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event)
  } 
}

// --------- Confirmation du formulaire de Congé --------- //
function confirm_form_conge(){
  let start = new Date($('#CdateDebut').val());
  let end = new Date($('#CdateFin').val());

  if(start <= end == false){
    $('.invalid').show()
    var element = document.getElementById('CdateFin');
    element.classList.add('not-valid');
  }
  else if($('#CnbJours').val().length == 0){
    $('.require').show()
    var element = document.getElementById('CnbJours');
    element.classList.add('not-valid');
  }
  else if($('#CnbJours').val() <= 0){
    $('.notEqual0').show()
    var element = document.getElementById('CnbJours');
    element.classList.add('not-valid');
  }
  else{
    $('.invalid').hide();
    $('#CdateFin').removeClass('not-valid');
    $('.require').hide();
    $('#CnbJours').removeClass('not-valid');
    $('.notEqual0').hide();

    let event = calendar.getEvents()[calendar.getEvents().length - 1];
    let startHour = $('#CheureDebut').val();
    let endHour = $('#CheureFin').val();
    let info = []
    if(startHour == 'Matin')
      start.setHours(9,0,0,0);
    else
      start.setHours(13,0,0,0);
    
    if(endHour == 'Soir')
      end.setHours(18,0,0,0);
    else
      end.setHours(12,0,0,0);

    event.setDates(start,end);

    $("form#form-Conge :input").each(function(){
      let info_id = 'V'+$(this)[0].id.slice(1);
      let val = $(this).val() ;
      info[info_id] = val;
    })

    let eventsToRemove = thisDateHasEvent(start,end,true);
    
    if(eventsToRemove.length>0 && eventsToRemove[eventsToRemove.length-1] != true){
      eventsToRemove.forEach(eventToRemove => eventToRemove.remove());
      demandeCongesInfo.push(info);
    }

    else{
      $('#alertD').show();
      setTimeout(function(){
        $('#alertD').fadeOut(3000);
      },5000)
      setTimeout(function(){
        $('#eventReceive').val().remove();
      },10);
    }

    $('#modalConge').modal('hide');
  }
}
// --------- Annulation d'un Congé --------- //
function cancelDemandeConge(event){
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
    }
    allEvents = calendar.getEvents().sort( (a,b) => moment(a.start).dayOfYear() - moment(b.start).dayOfYear());
    let index = allEvents.findIndex(Event => moment(Event.start).isSame(moment(event.start),'day'))
    if(allEvents[index + 2].classNames[0] == 'specialDemandeConge'){
      let specialConge = {
        title:"Congé",
        start: allEvents[index + 2].start,
        end: allEvents[index + 2].end,
        classNames:'specialConge',
      }
      allEvents[index + 2].remove();
      calendar.addEvent(specialConge);
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

/* --------- Check si un évenemment existe à/aux dates(s) du drop 
             Si celui-ci est de type présent ou weekend / ferié le drop est possible, sinon erreur --------- */
function thisDateHasEvent(start,end,isTrue = false){
  let hasNext = false;
  let allEvents = calendar.getEvents();
  if(isTrue)
    allEvents.splice(allEvents.length - 1)
  let daysToCheck = createDateArray(start,end);
  let eventsToRemove = [];

  if(moment(start).isSame(moment(end),'day')){ // External Event = 1 journée
    allEvents.some(function(event){
      if(moment(event.start).isSame(moment(start),'day')){
        if(event.classNames[0] == 'present')
          eventsToRemove.push(event);
        else
          hasNext = true;
      }       
    })
  }

  else{ // External Event = plrs journées
    allEvents.some(function(event){ 
      if(daysToCheck.find(date => moment(date).isSame(moment(event.start),'day'))){
        if(event.classNames[0] == 'present' || event.classNames[0] == 'ferie_WE')
          eventsToRemove.push(event);
        else{
          hasNext = true;
        }        
      }   
    })
  }
  if(hasNext)
    eventsToRemove.push(hasNext);

  return eventsToRemove;
}

// --------- Contraintes pour les Drops  --------- //
function constrainDrop(start,end,indexOE = null){
  let allEvents = calendar.getEvents();
  let eventsToReplace = []; 

  if(indexOE != null)
    allEvents.splice(indexOE,1)
  
  if(moment(start).isSame(moment(end),'day')){
    index = allEvents.findIndex(event => moment(event.start).isSame(moment(start),'day'))
    if(allEvents[index].classNames[0] == 'present')
      eventsToReplace.push(allEvents[index]);
    else
      eventsToReplace.push(true)
  }

  else{
    end = moment(end).subtract(1, "days")._d;
    let dates = createDateArray(start,end)
    allEvents.findIndex(function(event){
      if(dates.find(date => moment(date).isSame(moment(event.start),'day'))){
        if(event.classNames[0] == "present")
          eventsToReplace.push(event)
        else  
          eventsToReplace.push(true)
      }
    })
  }
  return eventsToReplace;
}

// --------- Contraintes pour les resizes  --------- //
function constrainResize(days,start){
  let allEvents = calendar.getEvents();
  let eventsToRemove = [];

  allEvents.sort((a,b) => moment(a.start).dayOfYear() - moment(b.start).dayOfYear())

  if(days > 0){
    index = allEvents.findIndex(event => moment(event.start).isSame(moment(start),'day'))  
    for(i = 1; i <= days;i++){
      if(allEvents[index+i].classNames[0] === 'present')
        eventsToRemove.push(allEvents[index+i]);
      else{
        eventsToRemove.push(true);
        break;
      }        
    }
    return eventsToRemove;
  }

  else{
    return [];
  }
}

// --------- Creer ID unique --------- //
function ID(){
  return '_' + Math.random().toString(36).substr(2, 9);
}

// --------- Tableau contenant toutes les dates entre une start date et une end date  --------- //
function createDateArray(start,end){
  let
    dateArray = [],
    dt = new Date(start);

  while (moment(dt).dayOfYear() <= moment(end).dayOfYear()) {
    dateArray.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return dateArray;
}


// --------- Ajout dynamique de l'évenement Présence + Weekend--------- //
function CreateEventPresence(){
  let view = calendar.view;
  let event = [];
  let dates = createDateArray(view.activeStart, view.activeEnd)
  dates.forEach(function(date){
    if(![0,6].includes(date.getDay())){
      event = [
        {
          classNames: 'present',
          title: "Present(e)",
          start: date,
          allDay: true,
        }
      ]
      calendar.addEventSource(event)
    }
    else{
      event = [
        {
          classNames: 'ferie_WE',
          title: "Weekend",
          start: date,
          allDay: true,
        }
      ]
      calendar.addEventSource(event)
    }   
  })
}

function displayErrorDemandeConge(){
  $('#alertD').show();
  $('#modalDemandeConge').modal('hide');
  setTimeout(function(){
    $('#alertD').fadeOut(3000);
  },5000)         
  setTimeout(function(){
    $('#eventReceive').val().remove();
  },10);
}

function addEventPresentIfMidDay(start,end,event){
  let _ID = event.extendedProps.ID;
  let eventPresent;
  let startPresent = start
  let endPresent = end
  if(moment(start).hour() == 13){    
    startPresent.setHours(9,0,0,0)
    endPresent.setHours(12,0,0,0)
    eventPresent = 
      {
        classNames: 'specialPresent',
        title: "Present(e)",
        start: startPresent,
        end: endPresent,
        extendedProps: {'ID':_ID},
      }
  }
  else if(moment(end).hour() == 12){
    startPresent.setHours(13,0,0,0);
    endPresent.setHours(18,0,0,0);
    eventPresent = 
      {
        classNames: 'specialPresent',
        title: "Present(e)",
        start: startPresent,
        end: endPresent,
        extendedProps: {'ID':_ID},
      }
  }
  calendar.addEvent(eventPresent);
}

function specialAddEventPresentIfMidDay(start,end,event){
  let _ID = event.extendedProps.ID;
  let nbrOfDays = moment(end).dayOfYear() - moment(start).dayOfYear();
  let dtLeft = event.start
  let dtRight = new Date(end);
  
  dtLeft = new Date(dtLeft.setDate(dtLeft.getDate() + nbrOfDays - 1));
  dtLeft.setHours(18,0,0,0);

  eventPresent1 = {
    classNames: 'specialPresent',
    title: "Present(e)",
    start: new Date(start.setHours(9,0,0,0)),
    end: new Date(start.setHours(12,0,0,0)),
    extendedProps: {'ID':_ID},
  }
  eventSplitLeft = {
    title:'Demande de Congé',
    start:start,
    end:dtLeft,
    classNames:'demandeConge',
    extendedProps: {'ID':_ID},
  }
  eventSplitRight = {
    title:'test2',
    start:new Date(end.setHours(9,0,0,0)),
    end:dtRight,
    classNames:'specialDemandeConge',
    extendedProps: {'ID':_ID},
  }
  eventPresent2 = {
    classNames: 'specialPresent',
    title: "Present(e)",
    start: end.setHours(13,0,0,0),
    end: end.setHours(18,0,0,0),
    extendedProps: {'ID':_ID},
  }

  event.remove()
  calendar.addEvent(eventSplitLeft);
  calendar.addEvent(eventSplitRight);
  calendar.addEvent(eventPresent1);
  calendar.addEvent(eventPresent2);
}

function setHoursOfEvent(startHour,endHour,start,end,event){
  if(startHour == 'Matin')
    start.setHours(9,0,0,0);
  else
    start.setHours(13,0,0,0);

  if(endHour == 'Soir')
    end.setHours(18,0,0,0);
  else
    end.setHours(12,0,0,0);

  event.setDates(start,end); 
}

function EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event){
  if(eventsToRemove.length>0 && eventsToRemove[eventsToRemove.length-1] != true){
    event.setExtendedProp('ID',ID());
    eventsToRemove.forEach(eventToRemove => eventToRemove.remove());
    demandeCongesInfo.push(info);
    if(moment(start).isSame(moment(end),'day')){
      if(startHour=='Matin' && endHour=='Soir'){
        start.setHours(9,0,0,0);
        end.setHours(18,0,0,0);
        event.setDates(start,end); 
      }
      else{
        setHoursOfEvent(startHour,endHour,start,end,event);
        addEventPresentIfMidDay(start,end,event);
      }
    }
    else{
      setHoursOfEvent(startHour,endHour,start,end,event);
      if(startHour == 'Après-midi' && endHour == 'Après-midi'){
        specialAddEventPresentIfMidDay(event.start,event.end,event);
      }
      else if(startHour == 'Après-midi'){
        addEventPresentIfMidDay(event.start,event.start,event);
      }
      else if(endHour == 'Après-midi')
        addEventPresentIfMidDay(event.end,event.end,event);
    }
    $('#modalDemandeConge').modal('hide');   
  }
  else{
    displayErrorDemandeConge();
  }  
}

function deleteEvent(eventRightClicked){
  let _ID = eventRightClicked.extendedProps.ID
  let eventsToRemove = calendar.getEvents().filter(e => e.extendedProps.ID == _ID)
  let dates;
  if(eventsToRemove.length == 2 && eventsToRemove[0].classNames[0] == 'demandeConge')
    dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].end)
  else
    dates = createDateArray(eventsToRemove[0].start,eventsToRemove[eventsToRemove.length -1].start)

  eventsToRemove.forEach(e => e.remove())
  dates.forEach(d => {
    event = {
      classNames: 'present',
      title: "Present(e)",
      start: d,
      allDay: true,
    }
    calendar.addEvent(event)
  }) 

  $('#modalDelete').modal('hide')
}



