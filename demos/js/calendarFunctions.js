/* --------- Check si un évenemment existe à/aux dates(s) du drop 
             Si celui-ci est de type présent ou weekend / ferié le drop est possible, sinon erreur --------- */
function thisDateHasEvent(start,end,resourceId,isTrue = false){
    let hasNext = false;
    let allEvents = calendar.getEvents();
    if(isTrue)
      allEvents.splice(allEvents.length - 1)
    let daysToCheck = createDateArray(start,end);
    let eventsToRemove = [];
  
    if(moment(start).isSame(moment(end),'day')){ // External Event = 1 journée
      let allEventsFilter = allEvents.filter(e => moment(e.start).isSame(moment(start),'day'))
      allEventsFilter = allEventsFilter.filter(e=>e.getResources()[0].id == resourceId)
      allEventsFilter.forEach(function(e){
        if(e.classNames[0] == 'present'){
            eventsToRemove.push(e); 
        }  
        else
          hasNext = true;
      })
    }
  
    else{ // External Event = plrs journées
      let allEventsFilter = allEvents.filter(e => daysToCheck.find(date => moment(date).isSame(moment(e.start),'day')))
      allEventsFilter = allEventsFilter.filter(e=>e.getResources()[0].id == resourceId)
      allEventsFilter.forEach(function(e){
        if(e.classNames[0] == 'present'){
            eventsToRemove.push(e); 
        }  
        else
          hasNext = true;
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
  
  
  // --------- Ajout dynamique de l'évenement Présence + Weekend --------- AJOUT DYNAMIQUE EN FONCTION DU NOMBRE D'EMPLOYES //
  function CreateDefault(){
    let view = calendar.view;
    let event
    let dates = createDateArray(view.activeStart, view.activeEnd)

    dates.forEach(function(date){
      if(![0,6].includes(date.getDay()) && calendar.getEvents().findIndex(e=>moment(e.start).isSame(moment(date),'day')) == -1){
        calendar.getResources().forEach(r=>{
          event = [
            {
              classNames: 'present',
              title: "Present(e)",
              start: date,
              allDay: true,
              resourceId: r.id,          
            }   
          ]
          calendar.addEventSource(event)
        })
      }
      else if([0,6].includes(date.getDay()) && calendar.getEvents().findIndex(e=>moment(e.start).isSame(moment(date),'day')) == -1){
        calendar.getResources().forEach(r=>{
          event = [
            {
              classNames: 'ferie_WE',
              title: "Weekend",
              start: date,
              allDay: true,
              resourceId:r.id,
              rendering:'background'
            }
          ]
          calendar.addEventSource(event)
        })
      }   
    })
  }
  
  // --------- display Erreur--------- //
  function displayError(){
    $('#alertD').show();
    $('#modalDemandeConge').modal('hide');
    setTimeout(function(){
      $('#alertD').fadeOut(3000);
    },5000)         
    setTimeout(function(){
      $('#eventReceive').val().remove();
    },10);
  }
  
  // --------- Ajout d'un évenement present qui prend une demi journée --------- //
  function addEventPresentIfMidDay(start,end,event){
    let _ID = event.extendedProps.ID;
    let eventPresent;
    let startPresent = start
    let endPresent = end
    if(moment(start).hour() == 13){    
      startPresent.setHours(9,0,0,0)
      endPresent.setHours(12,0,0,0)
      eventPresent = {
          classNames: 'specialPresent',
          title: "Present(e)",
          start: startPresent,
          end: endPresent,
          extendedProps: {'ID':_ID},
          resourceId:event.getResources()[0].id,
        }
    }
    else if(moment(end).hour() == 12){
      startPresent.setHours(13,0,0,0);
      endPresent.setHours(18,0,0,0);
      eventPresent = {
          classNames: 'specialPresent',
          title: "Present(e)",
          start: startPresent,
          end: endPresent,
          extendedProps: {'ID':_ID},
          resourceId:event.getResources()[0].id,
        }
    }
    calendar.addEvent(eventPresent);
  }
  
  // function ifAllMorningOrAprem(start,end,matineesIsChecked,apremsIsChecked,event){
  //   let _ID = event.extendedProps.ID;
  //   let eventPresent,eventSplited;
  //   let dates = createDateArray(start,end)
  //   let _title = event.title
  //   let _classNames = event.classNames[0]
  //   let _resourceId = event.getResources()[0].id
  
  //   if(matineesIsChecked){
  //     event.remove();
  //     dates.forEach(d => {
  //       eventPresent = {
  //         classNames: 'specialPresent',
  //         title: "Present(e)",
  //         start: d.setHours(13,0,0,0),
  //         end: d.setHours(18,0,0,0),
  //         extendedProps: {'ID':_ID},
  //         resourceId:_resourceId,
  //       }
  //       eventSplited = {
  //         classNames:_classNames,
  //         title:_title,
  //         extendedProps: {'ID':_ID},
  //         resourceId:_resourceId,
  //         start: d.setHours(9,0,0,0),
  //         end: d.setHours(12,0,0,0),
  //       }
  //       calendar.addEvent(eventPresent);
  //       calendar.addEvent(eventSplited);
  //     })
  //   }
  //   else if(apremsIsChecked){
  //     dates.forEach(d => {
  //       eventPresent = {
  //         classNames: 'specialPresent',
  //         title: "Present(e)",
  //         start: d.setHours(9,0,0,0),
  //         end: d.setHours(12,0,0,0),
  //         extendedProps: {'ID':_ID},
  //         resourceId:_resourceId,
  //       }
  //       eventSplited = {
  //         classNames:_classNames,
  //         title:_title,
  //         extendedProps: {'ID':_ID},
  //         resourceId:_resourceId,
  //         start: d.setHours(13,0,0,0),
  //         end: d.setHours(18,0,0,0),
  //       }
  //       calendar.addEvent(eventPresent);
  //       calendar.addEvent(eventSplited);
  //     })
  //   }
  // }
  
  // --------- Ajout d'évenements present d'une demi journée ainsi que d'un demandeDeConge special --------- //
  function specialAddEventPresentIfMidDay(start,end,event){
    let _ID = event.extendedProps.ID;
    let nbrOfDays = moment(end).dayOfYear() - moment(start).dayOfYear();
    let dtLeft = event.start
    
    dtLeft = new Date(dtLeft.setDate(dtLeft.getDate() + nbrOfDays - 1));
    dtLeft.setHours(18,0,0,0);
  
    eventPresent1 = {
      classNames: 'specialPresent',
      title: "Present(e)",
      start: new Date(start.setHours(9,0,0,0)),
      end: new Date(start.setHours(12,0,0,0)),
      extendedProps: {'ID':_ID},
      resourceId:event.getResources()[0].id,
    }

    eventPresent2 = {
      classNames: 'specialPresent',
      title: "Present(e)",
      start: end.setHours(13,0,0,0),
      end: end.setHours(18,0,0,0),
      extendedProps: {'ID':_ID},
      resourceId:event.getResources()[0].id,
    }
  
    calendar.addEvent(eventPresent1);
    calendar.addEvent(eventPresent2);
  }
  
  // --------- permet de modifier l'heure de départ et de fin d'un évenement --------- //
  function setHoursOfEvent(startHour,endHour,start,end,event,matineesIsChecked = false,apremsIsChecked = false){
    if(startHour == 'Matin' || matineesIsChecked)
      start.setHours(9,0,0,0);
    else
      start.setHours(13,0,0,0);
  
    if(endHour == 'Soir' || apremsIsChecked)
      end.setHours(18,0,0,0);
    else
      end.setHours(12,0,0,0);
  
    event.setDates(start,end); 
  }
  
  // --------- Gère tout ce qu'il faut lors de la création d'un nouvel évènement  --------- //
  function EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event,modal,matineesIsChecked,apremsIsChecked){
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
        // if(matineesIsChecked || apremsIsChecked){
        //   setHoursOfEvent(startHour,endHour,start,end,event,matineesIsChecked,apremsIsChecked);
        //   ifAllMorningOrAprem(event.start,event.end,matineesIsChecked,apremsIsChecked,event)
        // }
        if(startHour == 'Après-midi' && endHour == 'Après-midi'){
          specialAddEventPresentIfMidDay(event.start,event.end,event);
        }
        else if(startHour == 'Après-midi'){
          addEventPresentIfMidDay(event.start,event.start,event);
        }
        else if(endHour == 'Après-midi')
          addEventPresentIfMidDay(event.end,event.end,event);
      }
      $(modal).modal('hide');   
    }
    else{
      displayError();
    }  
  }
  
  // --------- Supprimer un évènement (sauf évenement present) --------- //
  function deleteEvent(eventRightClicked){
    let _ID = eventRightClicked.extendedProps.ID;
    let dates;
    if(eventRightClicked.classNames!='demandeConge' && eventRightClicked.classNames!='conge')
      eventRightClicked.setEnd(eventRightClicked.end.setDate(eventRightClicked.end.getDate()-1))
    let eventsToRemove = calendar.getEvents().filter(e => e.extendedProps.ID == _ID);
  
    if(eventsToRemove.length == 2 && eventsToRemove[0].classNames[0] == 'demandeConge')
      dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].end);
    else if (eventsToRemove.length == 1 && !moment(eventsToRemove[0].start).isSame(moment(eventsToRemove[0].end),'day'))
      dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].end);
    else
      dates = createDateArray(eventsToRemove[0].start,eventsToRemove[eventsToRemove.length -1].start);
  
    eventsToRemove.forEach(e => e.remove())
    dates.forEach(d => {
      event = {
        classNames: 'present',
        title: "Present(e)",
        start: d,
        allDay: true,
        resourceId: eventRightClicked.getResources()[0].id,
      };
      calendar.addEvent(event)
    }) 
  
    $('#modalDelete').modal('hide');
  }


  
  // --------- Gestions des congé de plusieurs jours uniquement l'après-midi ou uniquement le matin --------- //
  // $(document).ready(function(){
  //   $('#dateDebut').change(function(){
  //     let dd = moment($('#dateDebut').val());
  //     let df = moment($('#dateFin').val());
  //     if(dd.isBefore(df)){
  //       $('#matinees').attr("disabled", false);
  //       $('#apres-midis').attr("disabled",false);
  //     }
  //     else if(dd.isSame(df)){
  //       $('#matinees').attr("disabled", true);
  //       $('#apres-midis').attr("disabled",true);
  //     }
  //     else if(dd.isAfter(df)){
  //       $('#matinees').attr("disabled", true);
  //       $('#apres-midis').attr("disabled",true);
  //     }
  //   })
  
  //   $('#dateFin').change(function(){
  //     let dd = moment($('#dateDebut').val());
  //     let df = moment($('#dateFin').val());
  //     if(dd.isBefore(df)){
  //       $('#matinees').attr("disabled", false);
  //       $('#apres-midis').attr("disabled",false);
  //     }
  //     else if(dd.isSame(df)){
  //       $('#matinees').attr("disabled", true);
  //       $('#apres-midis').attr("disabled",true);
  //     }
  //     else if(dd.isAfter(df)){
  //       $('#matinees').attr("disabled", true);
  //       $('#apres-midis').removeAttribute("disabled",true);
  //     }
  //   })
  
  //   $('#matinees').change(function(){
  //     $('#apres-midis').prop( "checked", false );   
  //   })
  
  //   $('#apres-midis').change(function(){
  //     $('#matinees').prop( "checked", false );
  //   })
  
  // })

  function goToDate(date){
    dt = new Date(date)
    calendar.gotoDate(dt)
    $('#goToDate').modal('hide')
  }