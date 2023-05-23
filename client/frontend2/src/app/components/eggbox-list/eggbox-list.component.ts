import { Component, OnInit } from '@angular/core';
import { EggboxService } from 'src/app/services/eggbox.service';
import { EggBox } from 'src/app/model/eggbox';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-eggbox-list',
  templateUrl: './eggbox-list.component.html',
  styleUrls: ['./eggbox-list.component.css']
})
export class EggboxListComponent implements OnInit {

  eggBoxes: EggBox[];
  errorMessage = null;

  constructor(private service: EggboxService, private eventService: EventService) { }

  ngOnInit() {
    this.load();
    this.eventService.subject.subscribe(
      msg => this.load(),
      err => console.log(err),
      () => console.log('complete')
    )
  }

  load() {
    this.service.getEggBoxes().subscribe((data) => {
      this.eggBoxes = data;
    }, (error) => {
      console.log(error);
      this.errorMessage = error.error.message;
    });

  }

}
