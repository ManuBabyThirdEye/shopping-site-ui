import { TestBed } from '@angular/core/testing';

import { LocalStoreObjectService } from './local-store-object.service';

describe('LocalStoreObjectService', () => {
  let service: LocalStoreObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStoreObjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
