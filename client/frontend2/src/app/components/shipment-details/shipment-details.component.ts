import { Component, OnInit, Input } from '@angular/core';
import { EggShipment } from 'src/app/model/EggShipment';

@Component({
  selector: 'app-shipment-details',
  templateUrl: './shipment-details.component.html',
  styleUrls: ['./shipment-details.component.css']
})
export class ShipmentDetailsComponent implements OnInit {

  @Input('eggShipment')
  element: EggShipment;

  constructor() { }

  ngOnInit() {
  }

}
