import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EggBox } from '../model/eggbox';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EggboxService {

  constructor(private httpClient: HttpClient, private authService: AuthService) { }

  getEggBoxes() {

    const currentUser = this.authService.currentUser;

    if(!currentUser) {
      return null;
    }

    return this.httpClient.get<EggBox[]>(`http://localhost:8080/rest/participants/${currentUser.id}/eggboxes`);
  }
}
