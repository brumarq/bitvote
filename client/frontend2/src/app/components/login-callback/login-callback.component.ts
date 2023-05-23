import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Participant } from 'src/app/model/participant';

@Component({
  selector: 'app-login-callback',
  templateUrl: './login-callback.component.html',
  styleUrls: ['./login-callback.component.css']
})
export class LoginCallbackComponent    {

  code = null;
  error = null;
  count = 0;

  constructor(public authService: AuthService, public route: ActivatedRoute, public router: Router) { }

  ngOnInit() {

    this.route.queryParams.subscribe(
      (params: Params) => {
        this.code = params['code'];
        this.count ++;
        console.log('before validating cde',this.count);
        this.authService.validateCode(this.code).subscribe(
          (data) => {
            console.log('data validating cde');

            const participant = new Participant();
            participant.id = data['email'];

            this.authService.auth(participant).subscribe( (data) => {
              console.log('LoginCallbackComponent',data);
              this.router.navigate(['/']);
            }, (error) => {
              console.log('auth failed',error);
              this.router.navigate(['/sign-up'],{queryParams: { id: participant.id }});
            });
          }, (error) => {
            console.log(error);
            this.error = error.error.error;
          }
        )        
       });


  }

}
