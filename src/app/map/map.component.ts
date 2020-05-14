import { Router } from '@angular/router';
import { Channel } from './../models/channel.model';
import { Sensor } from './../models/sensor.model';
import { AuthService } from './../services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { LatLng } from '@agm/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  lat: number = 41.328287;
  lng: number = -105.586506;
  zoom: number = 17;

  sensors: Sensor[];

  point: LatLng;

  constructor(
    private db: AngularFirestore,
    private router: Router,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.getSensors();
  }

  getSensors() {
    this.authService.user$.subscribe(user => {
      this.db
        .collection('Data')
        .doc(user.uid)
        .collection('Sensors').snapshotChanges().subscribe(document => {
        const data = document.map(p => p.payload.doc.data());
        this.sensors = <Sensor[]> data.map(d => <Sensor> {
          id: d.id,
          location: <LatLng> { lat: d.location.Pc, lng: d.location.Vc },
          name: d.name,
          type: d.type,
          channels: []
        });

        this.sensors.forEach(sensor => {
          this.db
            .collection(`Data/${user.uid}/Sensors/${sensor.id}/Channels`).snapshotChanges().subscribe(cdata => {
              sensor.channels = <Channel[]> cdata.map(p => p.payload.doc.data());
            })
        });

        this.findCenter();
      });
    });
  }

  viewSensor(sensor: Sensor) {
    console.log(sensor);
    this.router.navigate([ '/sensor', { id: sensor.id } ])
  }

  findCenter() {
    const lats = <number[]> <unknown[]> this.sensors.map(s => s.location.lat);
    const lngs = <number[]> <unknown[]> this.sensors.map(s => s.location.lng);

    this.lat = (Math.min(...lats) + Math.max(...lats)) / 2
    this.lng = (Math.min(...lngs) + Math.max(...lngs)) / 2
  }
}
