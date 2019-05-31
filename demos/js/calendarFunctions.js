/* --------- Check si un évenemment existe à/aux dates(s) du drop 
             Si celui-ci est de type présent ou weekend / ferié le drop est possible, sinon erreur --------- */
function thisDateHasEvent(start,end,resourceId,isTrue = false){
  let hasNext = false;
  let allEvents = calendar.getEvents();
  if(isTrue)
    allEvents.splice(allEvents.length - 1);
  let daysToCheck = createDateArray(start,end);
  let eventsToRemove = [];

  if(moment(start).isSame(moment(end),'day')){ // External Event = 1 journée
    let allEventsFilter = allEvents.filter(e => moment(e.start).isSame(moment(start),'day'))
    allEventsFilter = allEventsFilter.filter(e=>e.getResources()[0].id == resourceId)
    allEventsFilter.forEach(function(e){
      if(e.classNames[0] == 'present' || e.classNames[0] == 'ferie_WE' ){
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
      if(e.classNames[0] == 'present' || e.classNames[0] == 'ferie_WE' ){
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
function create_unique_ID(){
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
function createDefault(){
  let view = calendar.view;
  let event;
  let dates = createDateArray(view.activeStart, view.activeEnd);
  
  dates.forEach(function(date){
    if(![0,6].includes(date.getDay()) && calendar.getEvents().findIndex(e=>moment(e.start).isSame(moment(date),'day')) == -1){
      calendar.getResources().forEach(r=>{
        if(r.id.includes('emp')){
          event = [
            {
              classNames: ['present','pres'],
              title: "Present(e)",
              start: date,
              allDay: true,
              resourceId: r.id,          
            }   
          ]
          calendar.addEventSource(event)
        }
      })
    }
    else if([0,6].includes(date.getDay()) && calendar.getEvents().findIndex(e=>moment(e.start).isSame(moment(date),'day')) == -1){
      calendar.getResources().forEach(r=>{
        if(r.id.includes('emp')){
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
        }
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
        classNames: ['specialPresent','split-right'],
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
        classNames: ['specialPresent','split-left'],
        title: "Present(e)",
        start: startPresent,
        end: endPresent,
        extendedProps: {'ID':_ID},
        resourceId:event.getResources()[0].id,
    }
  }
  calendar.addEvent(eventPresent);
}

// --------- Ajout d'évenements present d'une demi journée ainsi que d'un demandeDeConge special --------- //
function addSpecialEventPresentIfMidDay(start,end,event){
  let _ID = event.extendedProps.ID;

  eventPresent1 = {
    classNames: ['specialPresent','split-right'],
    title: "Present(e)",
    start: new Date(start.setHours(9,0,0,0)),
    end: new Date(start.setHours(12,0,0,0)),
    extendedProps: {'ID':_ID},
    resourceId:event.getResources()[0].id,
  }

  eventPresent2 = {
    classNames: ['specialPresent','split-left'],
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
    event.setExtendedProp('ID',create_unique_ID());
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
        addSpecialEventPresentIfMidDay(event.start,event.end,event);
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
  let eventsToRemove
  if(eventRightClicked.classNames!='demandeConge' && eventRightClicked.classNames!='conge'){
    eventsToRemove = calendar.getEvents().filter(e => moment(e.start).isSame(moment(eventRightClicked.start),'day'));
    eventsToRemove = eventsToRemove.filter(e => e.getResources()[0].id == eventRightClicked.getResources()[0].id);
    dates = createDateArray(eventsToRemove[0].start,eventsToRemove[eventsToRemove.length -1].start);
  }
  else{
    eventsToRemove = calendar.getEvents().filter(e => e.extendedProps.ID == _ID);

    if(eventsToRemove.length == 2 && eventsToRemove[0].classNames[0] == 'demandeConge')
      dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].end);
    else if(eventsToRemove.length == 2 && eventsToRemove[0].classNames[0] == 'conge')
      dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].end);
    else if (eventsToRemove.length == 1 && !moment(eventsToRemove[0].start).isSame(moment(eventsToRemove[0].end),'day'))
      dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].end);
    else
      dates = createDateArray(eventsToRemove[0].start,eventsToRemove[eventsToRemove.length -1].start);
  }

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

function goToDate(date){
  dt = new Date(date)
  calendar.gotoDate(dt)
  $('#goToDate').modal('hide')
}

function getWidthOfEvent(){
  return width_event = $('.present').width();
}

function addRecapInBackground(){
  let view = calendar.view;
  let event;
  let dates = createDateArray(view.activeStart, view.activeEnd);

  dates.forEach(function(date){
    event = [
      {
        classNames:'test',
        start: date,
        resourceId: 'recap-present',
      }
    ]
    calendar.addEventSource(event);
  })
}