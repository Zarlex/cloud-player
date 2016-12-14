import {NgModule}      from '@angular/core';

import {DashboardIndexComponent}     from './components/index/index.component';

import {TracksModule} from '../tracks/tracks.module';

import {DashboardRoutingModule}     from './dashboard.routes';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {AudioPlayerModule} from '../audioplayer/audio-player.module';
import {SessionModule} from '../session/session.module';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    TracksModule,
    DashboardRoutingModule,
    AudioPlayerModule,
    SessionModule
  ],
  declarations: [
    DashboardIndexComponent
  ]
})

export class DashboardModule {
}
