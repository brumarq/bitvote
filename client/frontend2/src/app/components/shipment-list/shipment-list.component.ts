import { Component, OnInit } from '@angular/core';
import { EggShipmentService } from 'src/app/services/egg-shipment.service';
import { EventService } from 'src/app/services/event.service';
import { EggShipment } from 'src/app/model/EggShipment';

@Component({
  selector: 'app-shipment-list',
  templateUrl: './shipment-list.component.html',
  styleUrls: ['./shipment-list.component.css']
})
export class ShipmentListComponent implements OnInit {

  eggShipments: EggShipment[];
  selectedShipment: EggShipment;

  constructor(public service: EggShipmentService, public eventService: EventService) { }

  ngOnInit() {
    this.load();
    this.eventService.subject.subscribe(
      msg => this.load(),
      err => console.log(err),
      () => console.log('complete')
    )
  }

  load() {
    this.service.getShipment().subscribe((data) => {
      this.eggShipments = data;
    }, (error) => {
      console.error(error);
    });

  }

  selectShipment(shipment) {
    console.log('sel',this.selectShipment);
    this.selectedShipment = shipment;
  }

}
