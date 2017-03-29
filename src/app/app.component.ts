import { Component, ElementRef } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

const baseEndpoint = `https://search.whaleslide.com/api/v1/search/{type}/{page}?q={search}&num=20&api_token={api_token}`;
const TYPES: Type[] = [
  {name:'web'},
  {name:'images'},
  {name:'videos'},
];

@Component({
  selector: 'my-app',
  templateUrl: './templates/search.html',
  styles: [`
    .selected {
      background-color: #CFD8DC;
      color: white;
    },
  `]
})

export class AppComponent  {
  types = TYPES;
  selectedType: Type = this.types[0];
  lastQuery: String = 'foo';
  results = {};
  searching: Boolean = false;
  page: number = 0;
  searchBox: String;

  constructor (
    private http: Http,
    private el:ElementRef
  ) {}

  search(clear: Boolean) {
    if (this.searching) {
      return false;
    }
    if (clear) {
      this.page = 0;
    }
    this.searching = true;
    var searchEndpoint = baseEndpoint
      .replace('{type}', this.selectedType.name)
      .replace('{page}', this.page.toString())
      .replace('{search}', encodeURIComponent(this.lastQuery.toString()));

    var self = this;

    return this.http.get(searchEndpoint)
      .map((res:Response) => res.json()).subscribe(
        res => {
          var viewHeight = window.innerHeight;
          var elementHeight = document.getElementById('backdrop').offsetHeight;
          if (clear || !Object.keys(self.results).length) {
            self.results = res.results;
          } else {
            self.results[self.selectedType.name] = self.results[self.selectedType.name].concat(res.results[self.selectedType.name]);
          }

          self.page++;
          self.searching = false;

          if (self.results && viewHeight > elementHeight - 150) {
            self.search(false);
          }
        },
        err => {
          console.error(err); //no other error handling for now
       });
  };

  onSelect(type: Type) {
    this.selectedType = type;
    this.results = {};
    this.lastQuery = this.searchBox;
    if (this.lastQuery) {
      this.search(true);
    }
  };

  onEnter(query: String) {
    this.lastQuery = query;
    this.search(true);
  };

  onKey(event: any) {
    this.searchBox = event.target.value;
  };

  onScroll(event: any) {
    var scrollOffset = event.target.scrollingElement.scrollTop;
    var viewHeight = window.innerHeight;
    var elementHeight = document.getElementById('backdrop').offsetHeight;
    if (this.results && scrollOffset + viewHeight > elementHeight - 150) {
      this.search(false);
    }
  };
}

export class Type {
  name: string;
}
