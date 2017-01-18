import {Component, OnInit, Input} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {BaseCollection} from '../../collections/base.collection';
import {BaseModel} from '../../models/base.model';
import './collection-search.style.scss';

@Component({
  selector: 'collection-search',
  template: require('./collection-search.template.html'),
  styleUrls: ['/collection-search.style.css']
})

export class CollectionSearchComponent implements OnInit {
  private searchTerms = new Subject<string>();

  private query: string;

  @Input() collection: BaseCollection<BaseModel>;

  @Input() queryParam: string;

  // Push a search term into the observable stream.
  search(): void {
    this.searchTerms.next(this.query);
  }

  ngOnInit(): void {
    this.searchTerms
      .debounceTime(300)        // wait for 300ms pause in events
      .distinctUntilChanged()   // ignore if next search term is same as previous
      .switchMap(term => {
        if (term) {
          this.collection.queryParams[this.queryParam] = term;
          this.collection.fetch({reset: true});
          return Observable.of<BaseCollection<BaseModel>>(this.collection);
        }
      }).toPromise();

    this.query = this.collection.queryParams[this.queryParam];
  }

}