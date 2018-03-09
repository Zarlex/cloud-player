import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UserAnalyticsService} from '../../../user-analytics/services/user-analytics.service';
import {ITrack} from '../../../api/tracks/track.interface';
import {AuthenticatedUserModel} from '../../../api/authenticated-user/authenticated-user.model';
import {IFavouriteTracks} from '../../../api/favourite-tracks/favourite-tracks.interface';
import {IPlaylistItem} from '../../../api/playlists/playlist-item/playlist-item.interface';
import {FavouriteTracksCloudplayerModel} from '../../../api/favourite-tracks/favourite-tracks-cloudplayer.model';
import {AuthenticatedUserAccountCloudplayerModel} from '../../../api/authenticated-user/account/authenticated-user-account-cloudplayer.model';
import {debounce} from 'underscore';

@Component({
  selector: 'app-toggle-liked-track',
  styleUrls: ['./toggle-liked-track.scss'],
  templateUrl: './toggle-liked-track.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleLikedTrackComponent implements OnInit, OnDestroy {
  private _authenticatedUser: AuthenticatedUserModel;
  private _favouriteTracksPerProvider: Array<IFavouriteTracks>;
  private _cloudPlayerFavouriteTracks: FavouriteTracksCloudplayerModel;
  private _debouncedUpdate: Function;

  @Input() track: ITrack;

  constructor(private userAnalyticsService: UserAnalyticsService, private cdr: ChangeDetectorRef) {
    this._authenticatedUser = AuthenticatedUserModel.getInstance();
    this._debouncedUpdate = debounce(this.update, 10);
  }

  private update() {
    console.log('UPDATE');
    this.cdr.detectChanges();
  }

  hasLikedTrack(): boolean {
    if (this._cloudPlayerFavouriteTracks) {
      return this._cloudPlayerFavouriteTracks.trackIsFavourited(this.track);
    }
    return false;
  }

  like(): void {
    if (!this.hasLikedTrack()) {
      this._favouriteTracksPerProvider.forEach((favouriteTracks: IFavouriteTracks) => {
        favouriteTracks.items.create({
          track: this.track
        });
      });
    }
  }

  dislike(): void {
    const favouriteTrack = this._cloudPlayerFavouriteTracks.items.find((item: IPlaylistItem) => {
      return item.track.id === this.track.id;
    });
    if (favouriteTrack) {
      favouriteTrack.destroy();
    }
  }

  toggleLike(): void {
    if (!this.hasLikedTrack()) {
      this.like();
    } else {
      this.dislike();
    }
  }

  ngOnInit() {
    const providerAccount = this._authenticatedUser.accounts.getAccountForProvider(this.track.provider);
    const cloudplayerAccount = this._authenticatedUser.accounts.getAccountForProvider('cloudplayer');
    this._favouriteTracksPerProvider = [];
    if (providerAccount) {
      this._favouriteTracksPerProvider.push(providerAccount.favouriteTracks);
    }
    if (cloudplayerAccount && cloudplayerAccount instanceof AuthenticatedUserAccountCloudplayerModel) {
      this._cloudPlayerFavouriteTracks = cloudplayerAccount.favouriteTracks;
      this._favouriteTracksPerProvider.push(cloudplayerAccount.favouriteTracks);
    }
    this._cloudPlayerFavouriteTracks.items.on('add remove reset', this._debouncedUpdate, this);
  }

  ngOnDestroy() {
    this._cloudPlayerFavouriteTracks.items.off('add remove reset', this._debouncedUpdate, this);
  }

}
