import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Participant } from '../model/participant';
import { EventService } from './event.service';
import { share } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: Participant = null;
  email = null;
  idToken = null;

  constructor(private httpClient: HttpClient, private eventService: EventService) { }

  getIssuerAuthURL() {
    return this.httpClient.get('http://localhost:8080/rest/issuer/auth-url');
  }

  validateCode(code) {

    console.log('validateCode CALLED',code);
    let observable = this.httpClient.post<Participant>('http://localhost:8080/rest/issuer/validate-code', { code: code }).pipe(share());

    observable.subscribe((data) => {
      this.email = data['email'];
      this.idToken = data['id-token']
      console.log('token',this.idToken);
    },
    (err) => {  
      console.error(err);
    });

    return observable;
  }

  
  auth(participant) {

    console.log('called auth');
    let observable = this.httpClient.post<Participant>('http://localhost:8080/rest/participants/auth', { id: participant.id }).pipe(share());

    observable.subscribe((data) => {
      this.currentUser = data;
      this.eventService.subscribe(this.currentUser.id);
    },
    (err) => {  
      this.currentUser = null;
    })

    return observable;
  }

  logout() {
    this.currentUser = null;
    this.eventService.unsubscribe();
    this.idToken = null;
    this.email = null;
  }
}
