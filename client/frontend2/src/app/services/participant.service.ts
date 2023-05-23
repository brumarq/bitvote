import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {

  constructor(private httpClient: HttpClient) { }

  create(participant) {
    return this.httpClient.post('http://localhost:8080/rest/participants', participant);
  }
}
