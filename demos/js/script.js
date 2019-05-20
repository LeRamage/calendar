var calendar ;
var demandeCongesInfo = [];


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
          allDay: false
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
        id:'ferie_WE',
        title:'Weekend',
        daysOfWeek: [0,6],
        classNames:'ferie_WE'
      }
    ],
    
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
        start.setHours(0,0,0,0)
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
  }

  // else{
  //   let abort = false;
  //   if(eventsToRemove[eventsToRemove.length-2].type == 'ferie_WE'){
  //     for(i=0; i < eventsToRemove.length-2;i++){
  //       if(eventsToRemove[i].classNames !='present' && eventsToRemove[i].type == undefined){
  //         abort = true;
  //         break;
  //       }
  //     }
  //     if(!abort){
  //       let index = 0;
  //       while(eventsToRemove[index].classNames == 'present'){
  //         index++;
  //       }
  //       let dateToBreak = eventsToRemove[index].start
  //       event.setEnd(dateToBreak)
  //       for(i=0;i < index;i++){
  //         eventsToRemove[i].remove();       
  //         $('#alertW').show();
  //         setTimeout(function(){
  //           $('#alertW').fadeOut(3000);
  //         },5000)
  //       }
  //       info['VdateFin'] = dateToBreak.toISOString().substring(0, 10);
  //       demandeCongesInfo.push(info);
  //     }
  //     else{
  //       $('#alertD').show();
  //       setTimeout(function(){
  //         $('#alertD').fadeOut(3000);
  //       },5000)
  //       setTimeout(function(){
  //         $('#eventReceive').val().remove();
  //       },10);
  //     }
  //   }
    else{
      $('#alertD').show();
      setTimeout(function(){
        $('#alertD').fadeOut(3000);
      },5000)
      setTimeout(function(){
        $('#eventReceive').val().remove();
      },10);
    }
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
  }

  else{
    let abort = false;
    if(eventsToRemove[eventsToRemove.length-2].type == 'ferie_WE'){
      for(i=0; i < eventsToRemove.length-2;i++){
        if(eventsToRemove[i].classNames !='present' && eventsToRemove[i].type == undefined){
          abort = true;
          break;
        }
      }
      if(!abort){
        let index = 0;
        // trier eventsToRemove pour corriger le post weekend 
        while(eventsToRemove[index].classNames == 'present'){
          index++;
        }
        let dateToBreak = eventsToRemove[index].start
        event.setEnd(dateToBreak)
        for(i=0;i < index;i++){
          eventsToRemove[i].remove();       
          $('#alertW').show();
          setTimeout(function(){
            $('#alertW').fadeOut(3000);
          },5000)
        }
        info['VdateFin'] = dateToBreak.toISOString().substring(0, 10);
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
             Si celui-ci est de type présent le drop est possible, sinon erreur --------- */
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
        if(event.classNames[0] == 'present')
          eventsToRemove.push(event);
        // else if(event.classNames[0] == 'ferie_WE'){
        //   nxtEventIsWE_Ferie = true;
        //   hasNext = true;
        //   let Content = {
        //     type: 'ferie_WE',
        //     start : event.start
        //   };
        //   nxtEventContent.push(Content)
        // }
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

// --------- Obtenir un évenement à une date [date] --------- //
// function getEventByDate(date){
//   let allEvents = calendar.getEvents();
//   let eventAtDate;

//   allEvents.forEach(function(event){    
//     if(event.start.getTime() === date.getTime()){
//       eventAtDate = event
//     }
//   }) 
//   return eventAtDate;
// }

// --------- Creer ID unique --------- //
function ID(){
  return '_' + Math.random().toString(36).substr(2, 9);
}

// --------- Tableau contenant toutes les dates de la page courantes / de start à end  --------- //
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


// --------- Ajout dynamique de l'évenement présence --------- //
function CreateEventPresence(){
  let view = calendar.view;
  let dates = createDateArray(view.activeStart, view.activeEnd)
  dates.forEach(function(date){
    if(![0,6].includes(date.getDay())){
      let event = [
        {
          classNames: 'present',
          title: "Present(e)",
          start: date
        }
      ]
      calendar.addEventSource(event)
    }   
  })
}

var ID = function () {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function compare() {
  if (a.start < b.start)
     return -1;
  if (a.start > b.start)
     return 1;
  if(a.start == b.start)
    return 0;
}