import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Participant} from '../../model/participant';
import { ParticipantService } from 'src/app/services/participant.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  participant:Participant = new Participant();
  errorMessage: string;

  @ViewChild('f')
  myForm: NgForm;

  constructor(private authService: AuthService, private service:ParticipantService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.participant.id = params['id'];
        this.participant.name = params['id']
       });
  }

  onSubmit() {
    this.service.create(this.participant).subscribe( 
      (data) => {

        this.authService.auth(this.participant).subscribe( (data) => {
          this.router.navigate(['/']);
        }, (error) => {
          this.errorMessage = error.error.message;
        });
        
      },(error) => {
        this.errorMessage = error.error.message;
      }
    );

  }

}
