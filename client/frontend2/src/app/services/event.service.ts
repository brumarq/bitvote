import { Injectable } from '@angular/core';

import { webSocket } from "rxjs/webSocket";


@Injectable({
  providedIn: 'root'
})
export class EventService {

  eventCount = -1;
  subject = null;

  constructor() { }

  subscribe(id) {
    this.subject = webSocket('ws://localhost:8081');

    this.subject.subscribe(
      msg => this.eventCount ++,
      err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      () => console.log('complete') // Called when connection is closed (for whatever reason).
    );

    let message = { id: id, events: ["packedEggs","shipmentCreated","boxesLoaded","boxesDelivered"]};
    console.log(message);
    this.subject.next(message);

  }

  unsubscribe() {
    this.subject.complete();
    this.eventCount = 0;
  } 

}