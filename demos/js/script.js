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
          if(moment(dateConge).dayOfYear() == moment(e.event.start).dayOfYear())
            Object.keys(conge).forEach(function(element){
              $('#'+element).val(conge[element]);
            })
            return;
        }) 
        $('#modalValidationConge').modal('show')
      }

      else if(eventClassNames == 'conge'){
        demandeCongesInfo.forEach(function(conge){
          dateConge = new Date(conge["VdateDebut"]);
          if(moment(dateConge).dayOfYear() == moment(e.event.start).dayOfYear())
            Object.keys(conge).forEach(function(element){
              $('#I'+element.slice(1)).val(conge[element]);
            })
            return;
        })
        $('#modalInfoConge').modal('show')
      }
    },

    eventReceive: function(e){
      $('#eventReceive').val(e.event);
    },

    drop: function(arg) {  
      let Cid = arg.draggedEl.id;
      // let allEvents = calendar.getEvents();
      // let eventAtDropPlace = []
      // allEvents.find(function(event){
      //   if(moment(event.start).dayOfYear() == moment(arg.date).dayOfYear())
      //     eventAtDropPlace.push(event)
        // if(moment(event.start).dayOfYear() != moment(event.end).dayOfYear())
        //   if(moment(event.end).dayOfYear() == moment(arg.date).dayOfYear())
        //     eventAtDropPlace.push(event)
      // })
      
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
        if(eventsToRemove.length>0 && eventsToRemove[0]!=true){
          eventsToRemove.forEach(function(eventToRemove){
            eventToRemove.remove();
          })
        }
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
    },

    eventDrop: function(e){
      if(e.event.classNames[0] == 'demandeConge' || e.event.classNames[0] == 'conge' || e.event.classNames[0] == 'congeDeny'){
        e.event.remove();
        calendar.addEvent(e.oldEvent);
      }
      else{
        let oldEvent = e.oldEvent;
        let indexOfEvent = calendar.getEvents().findIndex(function(event){
          return event._instance.instanceId === e.event._instance.instanceId;
        })
  
        if(e.event.end === null){
          let eventToReplace = constrainDrop(e.event.start,e.event.start);
          if(eventToReplace[0] != true)
            eventToReplace[0].setDates(oldEvent.start,oldEvent.start);
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
          eventsToRemove.forEach(function(event){
            event.remove();
          })
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

  if(start <= end == false){
    $('.invalid').show()
    var element = document.getElementById('dateFin');
    element.classList.add('not-valid');
  }
  // else if($('#nbJours').val().length == 0){
  //   $('.require').show()
  //   var element = document.getElementById('nbJours');
  //   element.classList.add('not-valid');
  // }
  // else if($('#nbJours').val() <= 0){
  //   $('.notEqual0').show()
  //   var element = document.getElementById('nbJours');
  //   element.classList.add('not-valid');
  // }
  else{
    $('.invalid').hide();
    $('#dateFin').removeClass('not-valid');
    $('.require').hide();
    // $('#nbJours').removeClass('not-valid');
    // $('.notEqual0').hide();

    let event = calendar.getEvents()[calendar.getEvents().length - 1];
    let startHour = $('#heureDebut').val();
    let endHour = $('#heureFin').val();
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

    $("form#form-demandeConge :input").each(function(){
      let info_id = 'V'+$(this)[0].id;
      let val = $(this).val() ;
      info[info_id] = val;
    })
    let eventsToRemove = thisDateHasEvent(start,end,true);
    if(eventsToRemove.length>0 && eventsToRemove[eventsToRemove.length-1] != true){
      eventsToRemove.forEach(function(eventToRemove){
        eventToRemove.remove();
      })
      demandeCongesInfo.push(info);
          let eventPresent;
    if(moment(start).hour() == 13){
      startPresent = start
      endPresent = end
      startPresent.setHours(9,0,0,0)
      endPresent.setHours(12,0,0,0)
      eventPresent = 
        {
          classNames: 'present',
          title: "Present(e)",
          start: startPresent,
          end: endPresent,
        }
    }
    else if(moment(end).hour() == 12){
      startPresent = start
      endPresent = end
      startPresent.setHours(13,0,0,0);
      endPresent.setHours(18,0,0,0);
      eventPresent = 
        {
          classNames: 'present',
          title: "Present(e)",
          start: startPresent,
          end: endPresent,
        }
    }
    
    calendar.addEvent(eventPresent);
      $('#modalDemandeConge').modal('hide');   
    }
    else{
      displayErrorDemandeConge();
    }
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
      eventsToRemove.forEach(function(eventToRemove){
        eventToRemove.remove();
      })
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
      id: ID(),
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
    id: ID(),
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

  if(moment(start).dayOfYear() === moment(end).dayOfYear()){ // External Event = 1 journée
    allEvents.some(function(event){
      if(moment(event.start).dayOfYear() === moment(start).dayOfYear()){
        if(event.classNames[0] == 'present')
          eventsToRemove.push(event);
        else
          hasNext = true;
      }       
    })
  }

  else{ // External Event = plrs journées
    allEvents.some(function(event){ 
      if(daysToCheck.find(function(date){
        return moment(date).dayOfYear() === moment(event.start).dayOfYear();
      })){
        console.log(event.classNames[0]);
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
  
  if(moment(start).dayOfYear() === moment(end).dayOfYear()){
    index = allEvents.findIndex(function(event){
      return moment(event.start).dayOfYear() === moment(start).dayOfYear();
    })
    if(allEvents[index].classNames[0] == 'present')
      eventsToReplace.push(allEvents[index]);
    else
      eventsToReplace.push(true)
  }

  else{
    end = moment(end).subtract(1, "days")._d;
    let dates = createDateArray(start,end)
    allEvents.findIndex(function(event){
      if(dates.find(function(date){
        return moment(date).dayOfYear() === moment(event.start).dayOfYear();
      })){
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

  allEvents.sort(function(a,b){
    return moment(a.start).dayOfYear() - moment(b.start).dayOfYear();
  })

  if(days > 0){
    index = allEvents.findIndex(function(event){
      return moment(event.start).dayOfYear() === moment(start).dayOfYear();
    })  
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

