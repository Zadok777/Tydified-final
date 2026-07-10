import { usDateToIso } from '../../src/utils/date';

describe('usDateToIso', () => {
  it('converts MM-DD-YYYY and MM/DD/YYYY', () => {
    expect(usDateToIso('07-04-2018')).toBe('2018-07-04');
    expect(usDateToIso('7/4/2018')).toBe('2018-07-04');
    expect(usDateToIso('12-31-1999')).toBe('1999-12-31');
  });

  it('rejects impossible or malformed dates', () => {
    expect(usDateToIso('13-01-2018')).toBeNull();
    expect(usDateToIso('02-30-2018')).toBeNull();
    expect(usDateToIso('2018-07-04')).toBeNull();
    expect(usDateToIso('')).toBeNull();
  });
});
