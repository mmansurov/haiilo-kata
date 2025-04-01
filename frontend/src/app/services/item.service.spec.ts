import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ItemService } from './item.service';
import { Item } from '../models/item.model';
import { environment } from '../../environments/environment';

describe('ItemService', () => {
  let service: ItemService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ItemService]
    });
    service = TestBed.inject(ItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getItemsValue', () => {
    it('should return the current value of items', () => {
      // Given
      const mockItems: Item[] = [
        {
          id: 1,
          name: 'Test Item',
          currentPriceValue: 10,
          currentOffer: null
        }
      ];
      service.loadItems();
      const req = httpMock.expectOne(`${environment.apiUrl}/items`);
      req.flush(mockItems);

      // When
      const result = service.getItemsValue();

      // Then
      expect(result).toEqual(mockItems);
    });
  });
});
