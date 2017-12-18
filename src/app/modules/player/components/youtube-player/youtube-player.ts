/// <reference types="youtube" />
import {
  Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2
} from '@angular/core';
import {Track} from '../../../tracks/models/track';
import {uniqueId} from 'underscore';
import {IPlayer, IPlayerOptions, IPlayerSize} from '../../src/player.interface';
import {Events} from 'backbone';
import {extend} from 'underscore';
import {AbstractPlayer} from '../../src/abstract-player.class';
import {TrackYoutube} from '../../../tracks/models/track-youtube';

@Component({
  selector: 'app-youtube-player',
  styleUrls: ['./youtube-player.scss'],
  templateUrl: './youtube-player.html'
})
export class YoutubePlayerComponent extends AbstractPlayer implements IPlayer, OnInit, OnDestroy {
  private _ytPlayer: YT.Player;
  private _timePoller: number;
  private _ytApiReady = false;
  private _eventHandler;

  @Input()
  public track: TrackYoutube;

  constructor(private el: ElementRef) {
    super();
    if ((<any>window).YT && (<any>window).YT.loaded) {
      this._ytApiReady = true;
    }
    this._eventHandler = extend({}, Events);
  }

  public id = uniqueId('yt_player');

  private pollCurrentTime() {
    if (this._ytPlayer && this._ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
      this.setCurrentTime(this._ytPlayer.getCurrentTime());
      clearTimeout(this._timePoller);
      this._timePoller = setTimeout(this.pollCurrentTime.bind(this), 500);
    }
  }

  private handleYtStatusChange(ev: YT.OnStateChangeEvent) {
    switch (ev.data) {
      case YT.PlayerState.BUFFERING:
        this.setDuration(this._ytPlayer.getDuration());
        this.onWaiting();
        break;
      case YT.PlayerState.CUED:
        this.onReady();
        break;
      case YT.PlayerState.PLAYING:
        this.setDuration(this._ytPlayer.getDuration());
        this.pollCurrentTime();
        this.onPlaying();
        break;
      case YT.PlayerState.PAUSED:
        this.onPaused();
        break;
      case YT.PlayerState.ENDED:
        this.onEnded();
        break;
      case YT.PlayerState.UNSTARTED:
        this.onPaused();
        break;
    }
  }

  protected bindListeners() {
    this.unBindListeners();

    this._eventHandler.on('onStateChange', this.handleYtStatusChange.bind(this));
    this._eventHandler.on('onError', this.onError.bind(this));
  }

  protected unBindListeners() {
    this._eventHandler.off();
  }

  protected initialisePlayerSDK(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const youtubeElId = 'youtubeJsSdk';
      const youtubeScriptEl = document.getElementById(youtubeElId);
      if (this._ytApiReady) {
        resolve(true);
      } else {
        (<any>window).onYouTubeIframeAPIReady = () => {
          this._ytApiReady = true;
          resolve(true);
        };
        let js: HTMLScriptElement;
        const scripts = document.getElementsByTagName('script')[0];
        js = document.createElement('script');
        js.id = youtubeElId;
        js.src = '//www.youtube.com/iframe_api';
        scripts.parentNode.insertBefore(js, youtubeScriptEl);
      }
    });
  }

  protected eventDelegator(type, args) {
    args.unshift(type);
    this._eventHandler.trigger.apply(this._eventHandler, args);
  }

  protected initialisePlayer(): Promise<YT.Player> {
    return new Promise((resolve) => {
      if (!document.getElementById(this.id)) {
        throw new Error('Youtube player element is not attached to the dom!');
      }
      const player = new YT.Player(this.id, {
        videoId: this.track.id,
        width: 320,
        height: 320,
        playerVars: {
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: () => {
            this._ytPlayer = player;
            resolve(this._ytPlayer);
          },
          onError: (...args) => {
            this.eventDelegator.call(this, 'onError', args);
          },
          onStateChange: (...args) => {
            this.eventDelegator.call(this, 'onStateChange', args);
          }
        }
      });
    });
  }

  protected deInitialisePlayer(): void {
    clearTimeout(this._timePoller);
  }

  protected setPlayerVolume(volume: number) {
    this._ytPlayer.setVolume(volume * 100);
  }

  protected preloadTrack(track: Track, startTime: number = 0) {
    this._ytPlayer.loadVideoById({
      videoId: track.id,
      startSeconds: startTime
    });
  }

  protected startPlayer(): void {
    this._ytPlayer.playVideo();
  }

  protected pausePlayer(): void {
    this._ytPlayer.pauseVideo();
  }

  protected stopPlayer(): void {
    this._ytPlayer.stopVideo();
  }

  protected seekPlayerTo(to: number) {
    this._ytPlayer.seekTo(to, true);
  }

  public getPlayerEl(): ElementRef {
    return this.el;
  }

  ngOnDestroy(): void {
    delete this._ytPlayer;
  }
}
