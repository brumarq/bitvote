import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    console.log('intercept called');

    const token = this.authService.idToken;

    console.log('token? ' + token);

    if (token) {

      const headersConfig = {
        'Authorization': 'Bearer ' + token
      };

      const cloned = req.clone({
        setHeaders: headersConfig
      });

      let observable = next.handle(cloned).pipe(share()); // avoiding multiple http executions per observers

      observable.subscribe((data) => {
        // For future usage: if you want to intercept responses, this is the place :-)
        console.log('intercepting response',data);
      }, (error) => {
        console.error('error in interceptor:',error);
      })

      return observable;

    } else {
      return next.handle(req);
    }
  }

}
