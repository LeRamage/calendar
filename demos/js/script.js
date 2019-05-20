var calendar ;
var demandeCongesInfo = [];
var startTest = new Date('May 01, 2019 00:00:00');
var endTest = new Date('May May 01, 2019 23:59:59')

document.addEventListener('DOMContentLoaded', function() {
    var Calendar = FullCalendar.Calendar;
    var Draggable = FullCalendarInteraction.Draggable

    /* initialize the external events
    -----------------------------------------------------------------*/

    // var containerEl = document.getElementById('external-events-list');
    // new Draggable(containerEl, {
    //   itemSelector: '.fc-event',
    //   eventData: function(eventEl) {
    //     return {
    //       title: eventEl.innerText.trim()
    //     }
    //   },
    // });

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
    let Cid = "";
    let element = [];

    calendar = new Calendar(calendarEl, {
    plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'list' ],

    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    
    events: [
      {
        title: 'test',
        start: new Date('May 20, 2019 09:00:00'),
        end: new Date('May 20, 2019 18:00:00'),
        displayEventTime: true
      }
    ], 

    
    //allDay: true,
    firstDay: 1,
    editable: true,
    droppable: true, // this allows things to be dropped onto the calendar
    displayEventTime: false,
    disableDragging: true,

    eventClick: function(e) {
      var eventClassNames = e.event.classNames[0];
      $('#eventClicked').val(e.event);

      if(eventClassNames == 'demandeConge'){
        demandeCongesInfo.forEach(function(conge){
          dateConge = new Date(conge["VdateDebut"]);
          dateConge.setHours(0,0,0,0);
          if(dateConge.getTime() == e.event.start.getTime())
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
          dateConge.setHours(0,0,0,0);
          if(dateConge.getTime() == e.event.start.getTime())
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
      Cid = arg.draggedEl.id;

      if(Cid == 'demandeConge'){                 
        $('#modalDemandeConge').modal({backdrop: 'static'});
        $('#modalDemandeConge').modal('show');
        $('#dateDebut').val(arg["dateStr"]);
        $('#dateFin').val(arg["dateStr"]);                       
      }

      else if(Cid == 'conge'){
        $('#modalConge').modal({backdrop: 'static'});
        $('#modalConge').modal('show');
        $('#CdateDebut').val(arg["dateStr"]);
        $('#CdateFin').val(arg["dateStr"]);
      }

      else{
        start = new Date(arg["dateStr"]);
        start.setHours(0,0,0,0);
        let eventsToRemove = thisDateHasEvent(start,start);
        if(eventsToRemove.length>0){
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
      element = $(event.el);
      element.css('border','none'); 
    },

    eventDrop: function(e){
      let oldEvent = e.oldEvent;

      if(e.event.end === null){
        let eventToReplace = constrainDrop(e.event.start,e.event.start);
        eventToReplace[0].setDates(oldEvent.start,oldEvent.start);
      }
      else{
        let datesToReplace = createDateArray(e.oldEvent.start,moment(e.oldEvent.end).subtract(1, "days")._d);
        let eventsToReplace = constrainDrop(e.event.start,e.event.end, true);
        let iterator = 0;
        eventsToReplace.forEach(function(event){
          event.setDates(datesToReplace[iterator],datesToReplace[iterator]);
          iterator++;
        })
      }       
    },

    eventResize: function(e){
      if(e.endDelta.days > 0){
        let eventsToRemove = constrainResize(e.endDelta.days,e.event.start);
        eventsToRemove.forEach(function(event){
          event.remove();
        })
      }

      else if(e.endDelta.days < 0){
        console.log(Math.abs(e.endDelta.days))
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

    }

  });
  calendar.render();
  CreateEventPresence();
});

// --------- Confirmation du formulaire de Demande de Congé --------- //
function confirm_form_Demandeconge(){
  let event = calendar.getEvents()[calendar.getEvents().length - 1];
  let start = new Date($('#dateDebut').val());
  let end = new Date($('#dateFin').val());
  start.setHours(0,0,0,0);
  end.setHours(1,0,0,0);
  event.setDates(start,end);
 
  let info = []
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
    event.setAllDay(true);
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
  
  $('#modalDemandeConge').modal('hide');
}

// --------- Confirmation du formulaire de Congé --------- //
function confirm_form_conge(){
  let event = calendar.getEvents()[calendar.getEvents().length - 1];
  let start = new Date($('#CdateDebut').val());
  let end = new Date($('#CdateFin').val());
  start.setHours(0,0,0,0);
  end.setHours(1,0,0,0);
  event.setDates(start,end);
 
  let info = []
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
    event.setAllDay(true);
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
// --------- Annulation d'un Congé --------- //
function cancelDemandeConge(event){
  $('#modalDemandeConge').modal('hide');
  $('#modalConge').modal('hide');
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

  if(start.getTime() === end.getTime()  ){ // External Event = 1 journée
    allEvents.some(function(event){
      if(event.start.getTime() === start.getTime()){
        if(event.classNames[0] == 'present')
          eventsToRemove.push(event);
      }       
    })
  }

  else{ // External Event = plrs journées
    allEvents.some(function(event){ 
      if(daysToCheck.find(function(date){
        return date.getTime() === event.start.getTime();
      })){
        if(event.classNames[0] == 'present' || event.classNames[0] == 'ferie_WE')
          eventsToRemove.push(event);
        else{
          eventsToRemove.push(event);
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
function constrainDrop(start,end,isTrue = false){
  let allEvents = calendar.getEvents();
  let eventsToReplace = [];
  if(isTrue)
    allEvents.splice(allEvents.length - 1)
  
  if(start.getTime() === end.getTime()){
    index = allEvents.findIndex(function(event){
      return event.start.getTime() === start.getTime();
    })
    if(allEvents[index].classNames[0] == 'present'){
      eventsToReplace.push(allEvents[index]);
    }
  }

  else{
    end = moment(end).subtract(1, "days")._d;
    let dates = createDateArray(start,end)
    allEvents.findIndex(function(event){
      if(dates.find(function(date){
        return date.getTime() === event.start.getTime();
      })){
        if(event.classNames[0] == "present")
          eventsToReplace.push(event)
      }
    })
  }
  return eventsToReplace;
}

// --------- Contraintes pour les resizes  --------- //
function constrainResize(days,start){
  let allEvents = calendar.getEvents();
  let eventsToRemove = [];
  let eventsToRefill = [];
  allEvents.sort(function(a,b){
    return a.start.getTime() - b.start.getTime();
  })

  if(days > 0){
    index = allEvents.findIndex(function(event){
      return event.start.getTime() === start.getTime();
    })  
    for(i = 1; i <= days;i++){
      eventsToRemove.push(allEvents[index+i]);
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

  while (dt <= end) {
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
        }
      ]
      calendar.addEventSource(event)
    }
    else{
      event = [
        {
          classNames: 'ferie_WE',
          title: "Weekend",
          start: date
        }
      ]
      calendar.addEventSource(event)
    }   
  })
}

