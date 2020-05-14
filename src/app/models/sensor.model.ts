import { LatLng } from '@agm/core';
import { Channel } from './channel.model';

    export interface Sensor {
    id: string;
    location: LatLng;
    name: string;
    type: string;
    channels: Channel[];
}