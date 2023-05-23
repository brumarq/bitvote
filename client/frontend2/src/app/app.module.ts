import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { EggboxListComponent } from './components/eggbox-list/eggbox-list.component';
import { ShipmentListComponent } from './components/shipment-list/shipment-list.component';
import { ShipmentDetailsComponent } from './components/shipment-details/shipment-details.component';
import { LoginCallbackComponent } from './components/login-callback/login-callback.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptorService } from './services/auth-interceptor.service';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SignUpComponent,
    LoginComponent,
    HomeComponent,
    EggboxListComponent,
    ShipmentListComponent,
    ShipmentDetailsComponent,
    LoginCallbackComponent    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
