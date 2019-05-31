var calendar ;
var demandeCongesInfo = [];
var width_event;

document.addEventListener('DOMContentLoaded', function() {
    var Calendar = FullCalendar.Calendar;
    var Draggable = FullCalendarInteraction.Draggable;

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
    plugins: [ 'resourceTimeline','interaction'],
    
    defaultView: 'customWeek',
    datesAboveResources: true,
    timezone : 'local',
    locale: 'fr',
    editable: true,
    droppable: true, 
    displayEventTime: false,
    displayEventEnd: false,
    disableDragging: true,
    contentHeight: 'auto',
    resourceAreaWidth: '10%',

    customButtons: {
      myCustomButton: {
        text: 'go to date',
        click: function() {
          $('#goToDate').modal('show');
        }
      }
    },

    views: {
      customWeek:{
        type:'resourceTimeline',
        duration:{ months: 1 },
        slotDuration: { days:1 },
        buttonText: 'month',
      }
    },

    header: {
      left: 'prev,next today, myCustomButton',
      center: 'title',
      right: 'resourceTimeGridDay,customWeek'
    },

    resourceLabelText: 'Ressources',
    resourceGroupField: 'type',
    resources: [
      { id: 'emp1', type: 'Employés',title: 'Jean Bombeur' },
      { id: 'emp2', type: 'Employés',title: 'Jean Talu' },
      { id: 'emp3', type: 'Employés',title: 'Bowie Ken' },
      { id: 'emp4', type: 'Employés',title: 'Alain Dii' },
      { id: 'recap-present', type:'Récapitulatif', title: 'Total Présences'},
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
        $('#CdateDebut').val(arg["dateStr"].slice(0,10));
        $('#CdateFin').val(arg["dateStr"].slice(0,10));
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
      element.css('height','20px');
      
      // ajoute un listener pour le click droit sur certains évenements
      if(event.event.classNames[0] != 'present' && event.event.classNames[0] != 'ferie_WE' && event.event.classNames[0] != 'specialPresent'){
        element[0].addEventListener('contextmenu', function(ev){
          ev.preventDefault();
          $('#eventRightClicked').val(event.event)
          $('#modalDelete').modal('show');
          return false;
        }, false);
      }

      if(event.event.classNames[0] == 'specialPresent'){
        console.log('width_event : '+width_event)
        element.css('width',width_event / 2)
      }
    },

    eventDrop: function(e){
      if(e.event.getResources()[0].id != e.oldEvent.getResources()[0].id){
        e.revert()
      }
      else if(e.event.classNames[0] == 'demandeConge' || e.event.classNames[0] == 'conge' || e.event.classNames[0] == 'congeDeny'){
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
      console.log('coucou');
    },

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
    },

  });
  calendar.render();
  createDefault();
  addRecapInBackground();
  width_event = getWidthOfEvent();
  // $('.fc-next-button').click(function(){
  //   createDefault();
  // })
});



