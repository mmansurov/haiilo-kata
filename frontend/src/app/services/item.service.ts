import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Item } from '../models/item.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private itemsSubject = new BehaviorSubject<Item[]>([]);
  
  readonly items$ = this.itemsSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  loadItems(): void {
    this.http.get<Item[]>(`${environment.apiUrl}/items`).subscribe((items) => this.itemsSubject.next(items));
  }
}
