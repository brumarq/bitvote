import { TestBed } from '@angular/core/testing';

import { EggShipmentService } from './egg-shipment.service';

describe('EggShipmentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EggShipmentService = TestBed.get(EggShipmentService);
    expect(service).toBeTruthy();
  });
});
