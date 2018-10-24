import {PlaylistItemYoutubeModel} from './playlist-item-youtube.model';
import {IPlaylistItems} from './playlist-items.interface';
import {IPlaylistItem} from './playlist-item.interface';
import {SortPlaylistItemsComparator} from './sort-playlist-items-comparator';
import {AuxappCollection} from '../../auxapp/auxapp.collection';
import {AuxappModel} from '../../auxapp/auxapp.model';

export class PlaylistItemsYoutubeCollection<TModel extends PlaylistItemYoutubeModel>
  extends AuxappCollection<AuxappModel> implements IPlaylistItems<IPlaylistItem> {
  model = PlaylistItemYoutubeModel;

  hasCreatedAttribute = true;

  setEndpoint(playlistId: number) {
    this.endpoint = `/playlist/youtube/${playlistId}/item`;
  }

  public sort(options?: any) {
    const orgComparator = this.comparator;
    this.comparator = SortPlaylistItemsComparator.sortItems(this, orgComparator);
    const result = super.sort(options);
    this.comparator = orgComparator;
    return result;
  }
}
