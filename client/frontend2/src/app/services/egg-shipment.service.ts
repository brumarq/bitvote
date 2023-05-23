import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { EggShipment } from '../model/EggShipment';

@Injectable({
  providedIn: 'root'
})
export class EggShipmentService {

  constructor(private httpClient: HttpClient, private authService: AuthService) { }

  getShipment() {

    const currentUser = this.authService.currentUser;

    if(!currentUser) {
      return null;
    }

    return this.httpClient.get<EggShipment[]>(`http://localhost:8080/rest/participants/${currentUser.id}/shipments`);
  }
}
