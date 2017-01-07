import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

import {Track} from '../../../tracks/models/track.model';
import {Tracks} from '../../../tracks/collections/tracks.collection';

@Component({
  moduleId: module.id,
  selector: 'track-list',
  templateUrl: 'track-list.template.html',
  styleUrls: ['track-list.style.css'],
  providers: [Tracks]
})
export class TrackListComponent {

  @Input() tracks: Tracks;

  constructor(private router: Router) { }

  gotoDetail(track: Track): void {
    let link = ['/tracks', track.id];
    this.router.navigate(link);
  }

}