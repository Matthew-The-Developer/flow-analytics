import { AuthService } from './../services/auth.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Series } from '../models/series.model';

import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import { tensor2d } from '@tensorflow/tfjs';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss']
})
export class SensorComponent implements OnInit, AfterViewInit {
  id: string = '';
  loading: boolean = false;
  
  knnModel: knnClassifier.KNNClassifier;
  linearModel: tf.Sequential;

  level: any[] = [];
  volume: any[] = [];
  flow: any[] = [];

  levelActive: any[] = [];

  levelScheme = { domain: [ '#f2cc8f' ] };
  volumeScheme = { domain: [ '#e07a5f' ] };
  flowScheme = { domain: [ '#81b29a' ] };

  levelAxis: string[] = [ 'Date Time', 'Inches' ];
  volumeAxis: string[] = [ 'Date Time', 'Inches' ];
  flowAxis: string[] = [ 'Date Time', 'GPM (Gallons per Minute)' ];

  flowBounds = [ 0, 1300 ];
  volumeBounds = [ 0, 12 ];
  levelBounds = [ 0, 12 ];

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private db: AngularFirestore,
  ) { }

  ngOnInit(): void {
    const pipe = new DatePipe('en-US');
    
    this.id = this.route.snapshot.params.id;
    this.loading = true;

    this.authService.user$.subscribe(user => {
      this.db.collection(`Data/${user.uid}/Sensors/${this.id}/Channels`).snapshotChanges().subscribe(data => {
        const channels = <any[]> data.map(c => c.payload.doc.data());

        const levelChannels = channels.filter(c => c.name == 'Level');
        const volumeChannels = channels.filter(c => c.name == 'Volume');
        const flowChannels = channels.filter(c => c.name == 'Flow');

        this.level = [{
          name: 'Level',
          series: levelChannels.map(lc => <Series> {
            name: pipe.transform(lc.time.seconds * 1000, 'short').toString(),
            value: lc.value
          })
        }];

        this.levelActive = [{
          name: 'Level',
          Series: [ this.level[0].series[3] ]
        }];

        this.volume = [{ 
          name: 'Volume', 
          series: volumeChannels.map(vc => <Series> {
            name: pipe.transform(vc.time.seconds * 1000, 'short').toString(),
            value: vc.value
          })
        }];

        this.flow = [{
          name: 'Flow',
          series: flowChannels.map(fc => <Series> {
            name: pipe.transform(fc.time.seconds * 1000, 'short').toString(),
            value: fc.value
          })
        }];

        this.loading = false;
      });
    });
    
  }

  ngAfterViewInit(): void {
    this.trainModel();

    console.log(this.knnModel.predictClass(tf.tensor2d([ 0, 0 ])));
  }

  async trainModel() {
    this.knnModel = knnClassifier.create();

    this.knnModel.addExample(tf.tensor1d([ 0, 0 ]), 'blockage');
    this.knnModel.addExample(tf.tensor1d([ 0, 2 ]), 'normal');
    this.knnModel.addExample(tf.tensor1d([ 3, 7 ]), 'overflow');
  }

  update() {
    this.level = [...this.level];
    this.volume = [...this.volume];
    this.flow = [...this.flow];
  }
}
