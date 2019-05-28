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
          resourceId:'emp1'
        }
      });
    });

    /* initialize the calendar
    -----------------------------------------------------------------*/

    var calendarEl = document.getElementById('calendar');

    calendar = new Calendar(calendarEl, {
    plugins: [ 'resourceTimeGrid','interaction'],

    defaultView: 'resourceTimeGridWeek',
    datesAboveResources: true,
    
    timezone : 'local',
    locale: 'fr',
    firstDay: 1,
    hiddenDays:[0,6],
    editable: true,
    droppable: true, 
    displayEventTime: true,
    displayEventEnd: true,
    disableDragging: true,
    minTime:"08:00:00",
    // maxTime:"19:00:00",

    customButtons: {
      myCustomButton: {
        text: 'custom!',
        click: function() {
          $('#goToDate').modal('show');
        }
      }
    },

    header: {
      left: 'prev,next today, myCustomButton',
      center: 'title',
      right: 'resourceTimeGridDay,resourceTimeGridWeek'
    },
    
    // views: {
    //   resourceTimeGridFiveDays: {
    //     type: 'resourceTimeGrid',
    //     duration: { days: 5 },
    //     buttonText: '5 days',
    //   }
    // },

    resourceLabelText: 'Employés',

    resources: [
      { id: 'emp1', title: 'Jean Bombeur', eventColor: 'green' },
      { id: 'emp2', title: 'Jean Talu', eventColor: 'orange' },
    ],

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
        $('#modalDemandeConge').modal({backdrop: 'static'});
        $('#modalDemandeConge').modal('show');
        $('#dateDebut').val(arg["dateStr"].slice(0,10));
        $('#dateFin').val(arg["dateStr"].slice(0,10));     
      }

      else if(Cid == 'conge'){
        $('#modalConge').modal({backdrop: 'static'});
        $('#modalConge').modal('show');
        $('#CdateDebut').val(arg["dateStr"]);
        $('#CdateFin').val(arg["dateStr"]);
      }

      else{
        let start = arg.date;
        let eventAtDropPlace = calendar.getEvents().filter(e => moment(e.start).isSame(moment(start),'day'));
        eventAtDropPlace = eventAtDropPlace.filter(e => e.getResources()[0].id == $('#dropLocation').val());
        eventAtDropPlace[0].remove();         
      }
    },
    
    eventRender: function(event) {        
      let element = $(event.el);
      element.css('border','none');
      
      // ajoute un listener pour le click droit sur certains évenements
      if(event.event.classNames[0] != 'present' && event.event.classNames[0] != 'ferie_WE' && event.event.classNames[0] != 'specialPresent'){
        element[0].children[0].addEventListener('contextmenu', function(ev){
          ev.preventDefault();
          $('#eventRightClicked').val(event.event)
          $('#modalDelete').modal('show');
          return false;
        }, false);
      }
    },

    eventDrop: function(e){
      if(e.event.getResources()[0].id != e.oldEvent.getResources()[0].id){
        e.revert()
      }
      else{
        let eventAtDropPlace = calendar.getEvents().filter(event  => moment(event.start).isSame(moment(e.event.start),'day'))
        eventAtDropPlace.splice(eventAtDropPlace.length - 1)
        eventAtDropPlace = eventAtDropPlace.filter(event => event.getResources()[0].id == e.oldEvent.getResources()[0].id)
        eventAtDropPlace[0].setDates(e.oldEvent.start,e.oldEvent.end);
        eventAtDropPlace[0].setAllDay(true)
      }
     
    },
    
    eventResize: function(e){
      console.log('coucou')
    },
    // eventResize: function(e){
    //   if(e.endDelta.days > 0){
    //     let eventsToRemove = constrainResize(e.endDelta.days,e.event.start);
    //     if(eventsToRemove[eventsToRemove.length - 1] != true){
    //       eventsToRemove.forEach(event => event.remove())
    //     }
    //     else{
    //       setTimeout(function(){
    //         e.event.remove();
    //         calendar.addEvent(e.prevEvent);
    //       },10);
    //     }
    //   }

    //   else if(e.endDelta.days < 0){
    //     let event= []
    //     for(i = 1; i <= Math.abs(e.endDelta.days); i++){
    //       event = [
    //         {
    //           classNames: 'present',
    //           title: "Present(e)",
    //           start: moment(e.prevEvent.end).subtract(i, "days")._d,
    //           allDay: true,
    //         }
    //       ]
    //       calendar.addEventSource(event)
    //     }
    //   }
    // },

    eventAllow: function(dropLocation, draggedEvent){
      events = calendar.getEvents().filter( e => moment(e.start).isSame(moment(dropLocation.start),'day'))
      events = events.filter(e=>e.getResources()[0].id == dropLocation.resource.id)
      if(events.find(e=>e.classNames[0] != 'present') == undefined){
        $('#dropLocation').val(dropLocation.resource.id);
        return true;
      }      
      else{
        return false;
      }     
    }

  });
  calendar.render();
  CreateDefault();
  $('.fc-next-button').click(function(){
    CreateDefault();
  })
  $('.fc-prev-button').click(function(){
    CreateDefault();
  })
});



