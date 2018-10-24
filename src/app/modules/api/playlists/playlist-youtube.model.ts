import {attributesKey} from '../../backbone/decorators/attributes-key.decorator';
import {defaultValue} from '../../backbone/decorators/default-value.decorator';
import {nested} from '../../backbone/decorators/nested.decorator';
import {IPlaylist} from './playlist.interface';
import {YoutubeProxyModel} from '../youtube/youtube-proxy.model';
import {ImageYoutubeModel} from '../image/image-youtube.model';
import {queryParam} from '../../backbone/decorators/query-param.decorator';
import {PlaylistItemYoutubeModel} from './playlist-item/playlist-item-youtube.model';
import {PlaylistItemsYoutubeCollection} from './playlist-item/playlist-items-youtube.collection';
import {ArtistYoutubeModel} from '../artist/artist-youtube.model';
import {ImageAuxappModel} from '../image/image-auxapp.model';
import {IPlaylistItem} from './playlist-item/playlist-item.interface';

export class PlaylistYoutubeModel extends YoutubeProxyModel implements IPlaylist {
  endpoint = '/playlists';

  @queryParam()
  part = 'snippet';

  @attributesKey('provider')
  @defaultValue('youtube')
  provider: string;

  @attributesKey('canEdit')
  @defaultValue(false)
  canEdit: boolean;

  @attributesKey('isPublic')
  @defaultValue(false)
  isPublic: boolean;

  @attributesKey('title')
  @defaultValue('')
  title: string;

  @attributesKey('description')
  description: string;

  @attributesKey('user')
  @nested()
  artist: ArtistYoutubeModel;

  @attributesKey('items')
  @nested()
  items: PlaylistItemsYoutubeCollection<PlaylistItemYoutubeModel>;

  @attributesKey('image')
  @nested()
  image: ImageAuxappModel;

  private setCover(item: IPlaylistItem) {
    if (item.track.image.getSmallSizeUrl()) {
      this.image.small = item.track.image.getSmallSizeUrl();
      this.image.medium = item.track.image.getMediumSizeUrl();
      this.image.large = item.track.image.getLargeSizeUrl();
    } else {
      item.track.image.on('change', () => {
        this.setCover(item);
      });
    }
  }

  parse(attributes) {
    delete attributes.items;
    return attributes;
  }

  initialize(): void {
    if (this.id) {
      this.items.setEndpoint(this.id);
    }
    this.on('change:id', () => {
      this.items.setEndpoint(this.id);
    });
    this.items.once('add', (item: IPlaylistItem) => {
      if (!this.image.getSmallSizeUrl()) {
        this.setCover(item);
      }
    });
  }
}
