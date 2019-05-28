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

    defaultView: 'resourceTimeGridFiveDay',
    datesAboveResources: true,
    
    timezone : 'local',
    locale: 'fr',
    firstDay: 1,
    editable: true,
    droppable: true, 
    displayEventTime: true,
    displayEventEnd: true,
    disableDragging: true,
    minTime:"08:00:00",
    // maxTime:"19:00:00",

    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'resourceTimeGridDay,resourceTimeGridFiveDay'
    },
    
    views: {
      resourceTimeGridFiveDay: {
        type: 'resourceTimeGrid',
        duration: { days: 5 },
        buttonText: '5 days'
      }
    },

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
        start = arg.date;
        let eventsToRemove = thisDateHasEvent(start,start)

        if(eventsToRemove.length > 0 && eventsToRemove[eventsToRemove.length -1] != true){
          $('#modalDemandeConge').modal({backdrop: 'static'});
          $('#modalDemandeConge').modal('show');
          $('#dateDebut').val(arg["dateStr"].slice(0,10));
          $('#dateFin').val(arg["dateStr"].slice(0,10));  
        }
        else{
          displayError();
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
          displayError()
        }
      }

      else{
        let start = new Date(arg["dateStr"]);
        let eventsToRemove = thisDateHasEvent(start,start);
        let _ID = ID();

        setTimeout(function(){
          $('#eventReceive').val().setExtendedProp('ID',_ID);
        }, 10);

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
      
      // ajoute un listener pour le click droit sur certains évenements
      if(event.event.classNames[0] != 'present' && event.event.classNames[0] != 'ferie_WE' && event.event.classNames[0] != 'specialPresent'){
        element[0].children[0].addEventListener('contextmenu', function(ev){
          ev.preventDefault();
          $('#eventRightClicked').val(event.event)
          $('#modalDelete').modal('show');
          return false;
        }, false);
      }

      // Changer le Titre lorsque l'événement s'étale sur plusieurs jours
    //   if(event.event.classNames =='demandeConge' || event.event.classNames == 'conge'){
    //     let nbrOfEventsSharingSameID = calendar.getEvents().filter(e=> e.extendedProps.ID == event.event.extendedProps.ID)
    //     if(moment(event.event.start).isBefore(moment(event.event.end),'day')){
    //       let nbrOfDays =  moment(event.event.end).dayOfYear() - moment(event.event.start).dayOfYear()
    //       let str = '';  
    //       if(nbrOfEventsSharingSameID.length > 4){
    //         str = ((nbrOfDays+1)/2).toString()+' jours'
    //         element[0].children[0].children[0].innerText = str
    //       }
    //       else if(nbrOfEventsSharingSameID.length == 4){
    //         let nxtIsSpecial = calendar.getEvents().findIndex(e => moment(e.start).isSame(moment(event.event.start)),'day') +1;
    //         if(calendar.getEvents()[nxtIsSpecial].classNames[0] === 'specialdemandeConge'){
    //           str = (nbrOfDays+1).toString()+' jours'
    //           element[0].children[0].children[0].innerText = str 
    //         }
    //         else{
    //           str = ((nbrOfDays+1)/2).toString()+' jours'
    //           element[0].children[0].children[0].innerText = str
    //         }
    //       }
    //       else if(nbrOfEventsSharingSameID.length == 3){
    //         str = '1 jour'
    //         element[0].children[0].children[0].innerText = str
    //       }
    //       else if(nbrOfEventsSharingSameID.length == 2){
    //         str = (nbrOfDays + 1 - 1/2).toString()+' jours'
    //           element[0].children[0].children[0].innerText = str
    //       }
    //     }
    //   }
    },

    eventDrop: function(e){
      if(e.event.classNames[0] == 'demandeConge' || e.event.classNames[0] == 'conge' || e.event.classNames[0] == 'congeDeny' || e.event.classNames[0] == 'specialPresent'){
        e.event.remove();
        calendar.addEvent(e.oldEvent);
      }
      else{
        let oldEvent = e.oldEvent;
        let indexOfEvent = calendar.getEvents().findIndex(event => event._instance.instanceId === e.event._instance.instanceId)
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
          if(eventsToReplace.findIndex(event => event == true) != -1){
            e.event.remove();
            calendar.addEvent(oldEvent);
          }
          else{
            let iterator;
            if(moment(e.event.start).isBefore(moment(oldEvent.start),'day')){
              iterator = datesToReplace.length -1;
              eventsToReplace.forEach(function(event){
                event.setDates(datesToReplace[iterator],datesToReplace[iterator]);
                event.setAllDay(true);
                iterator--;
              })
            }
            else{
              iterator = 0;
              eventsToReplace.forEach(function(event){
                event.setDates(datesToReplace[iterator],datesToReplace[iterator]);
                event.setAllDay(true);
                iterator++;
              })
            }
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



