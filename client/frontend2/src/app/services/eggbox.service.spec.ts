import { TestBed } from '@angular/core/testing';

import { EggboxService } from './eggbox.service';

describe('EggboxService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EggboxService = TestBed.get(EggboxService);
    expect(service).toBeTruthy();
  });
});
