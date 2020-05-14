import { SensorComponent } from './sensor/sensor.component';
import { AuthGuard } from './services/auth.guard';
import { MapComponent } from './map/map.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'map', component: MapComponent, canActivate: [ AuthGuard ] },
  { path: 'sensor', component: SensorComponent, data: { id: '' }, canActivate: [ AuthGuard ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
 