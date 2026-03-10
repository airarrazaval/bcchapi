import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SERIES } from '../../src/series/index.ts';

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

describe('SERIES', () => {
  it('is a plain object (not a class instance)', () => {
    assert.equal(Object.getPrototypeOf(SERIES), Object.prototype);
  });

  it('has all expected top-level groups', () => {
    const expected = [
      'EXCHANGE_RATE',
      'PRICES',
      'INTEREST_RATES',
      'MONEY',
      'NATIONAL_ACCOUNTS',
      'EXTERNAL_SECTOR',
      'EMPLOYMENT',
      'PUBLIC_FINANCES',
      'CAPITAL_MARKET',
    ];
    for (const key of expected) {
      assert.ok(key in SERIES, `Missing group: ${key}`);
    }
  });

  it('every group is a plain object', () => {
    for (const [group, members] of Object.entries(SERIES)) {
      assert.equal(
        Object.getPrototypeOf(members),
        Object.prototype,
        `Group ${group} is not a plain object`,
      );
    }
  });

  it('every series ID is a non-empty string', () => {
    for (const [group, members] of Object.entries(SERIES)) {
      for (const [key, value] of Object.entries(members as Record<string, unknown>)) {
        assert.equal(typeof value, 'string', `${group}.${key} is not a string`);
        assert.ok((value as string).length > 0, `${group}.${key} is empty`);
      }
    }
  });

  it('no duplicate series IDs within a group', () => {
    for (const [group, members] of Object.entries(SERIES)) {
      const values = Object.values(members as Record<string, string>);
      const unique = new Set(values);
      assert.equal(unique.size, values.length, `Duplicate IDs in group: ${group}`);
    }
  });
});

// ---------------------------------------------------------------------------
// EXCHANGE_RATE — spot-checks
// ---------------------------------------------------------------------------

describe('SERIES.EXCHANGE_RATE', () => {
  it('contains USD_CLP_OBSERVED', () => {
    assert.equal(SERIES.EXCHANGE_RATE.USD_CLP_OBSERVED, 'F073.TCO.PRE.Z.D');
  });

  it('contains EUR_USD', () => {
    assert.equal(SERIES.EXCHANGE_RATE.EUR_USD, 'F072.EUR.USD.N.O.D');
  });

  it('contains CNY_USD', () => {
    assert.equal(SERIES.EXCHANGE_RATE.CNY_USD, 'F072.CNY.USD.N.O.D');
  });

  it('contains BRL_USD', () => {
    assert.equal(SERIES.EXCHANGE_RATE.BRL_USD, 'F072.BRL.USD.N.O.D');
  });
});

// ---------------------------------------------------------------------------
// PRICES — spot-checks
// ---------------------------------------------------------------------------

describe('SERIES.PRICES', () => {
  it('contains UF', () => {
    assert.equal(SERIES.PRICES.UF, 'F073.UFF.PRE.Z.D');
  });

  it('contains UTM', () => {
    assert.equal(SERIES.PRICES.UTM, 'F073.UTR.PRE.Z.M');
  });

  it('contains CPI_MONTHLY_CHANGE', () => {
    assert.equal(SERIES.PRICES.CPI_MONTHLY_CHANGE, 'F074.IPC.VAR.Z.EP23.C.M');
  });

  it('contains CPI_ANNUAL_CHANGE', () => {
    assert.equal(SERIES.PRICES.CPI_ANNUAL_CHANGE, 'F074.IPC.V12.Z.EP23.C.M');
  });
});

// ---------------------------------------------------------------------------
// INTEREST_RATES — spot-checks
// ---------------------------------------------------------------------------

describe('SERIES.INTEREST_RATES', () => {
  it('contains MONETARY_POLICY_RATE', () => {
    assert.equal(SERIES.INTEREST_RATES.MONETARY_POLICY_RATE, 'F022.TPM.TIN.D001.NO.Z.D');
  });

  it('contains BCP_2Y', () => {
    assert.equal(SERIES.INTEREST_RATES.BCP_2Y, 'F022.BCLP.TIS.AN02.NO.Z.D');
  });

  it('contains BCP_10Y', () => {
    assert.equal(SERIES.INTEREST_RATES.BCP_10Y, 'F022.BCLP.TIS.AN10.NO.Z.D');
  });
});

// ---------------------------------------------------------------------------
// MONEY — spot-checks
// ---------------------------------------------------------------------------

describe('SERIES.MONEY', () => {
  it('contains M1', () => {
    assert.equal(SERIES.MONEY.M1, 'F021.M1.PRO.N.CLP.5.M');
  });

  it('contains M2', () => {
    assert.equal(SERIES.MONEY.M2, 'F021.M2.PRO.N.CLP.5.M');
  });

  it('contains M3', () => {
    assert.equal(SERIES.MONEY.M3, 'F021.M3.PRO.N.CLP.5.M');
  });
});

// ---------------------------------------------------------------------------
// NATIONAL_ACCOUNTS — spot-checks
// ---------------------------------------------------------------------------

describe('SERIES.NATIONAL_ACCOUNTS', () => {
  it('contains IMACEC', () => {
    assert.equal(SERIES.NATIONAL_ACCOUNTS.IMACEC, 'F032.IMC.IND.Z.Z.EP18.Z.Z.0.M');
  });

  it('contains IMACEC_ANNUAL_CHANGE', () => {
    assert.equal(SERIES.NATIONAL_ACCOUNTS.IMACEC_ANNUAL_CHANGE, 'F032.IMC.V12.Z.Z.2018.Z.Z.0.M');
  });
});

// ---------------------------------------------------------------------------
// EXTERNAL_SECTOR — spot-checks
// ---------------------------------------------------------------------------

describe('SERIES.EXTERNAL_SECTOR', () => {
  it('contains CURRENT_ACCOUNT', () => {
    assert.equal(SERIES.EXTERNAL_SECTOR.CURRENT_ACCOUNT, 'F068.A.FLU.Z.0.S.N.Z.Z.Z.Z.6.0.T');
  });

  it('contains EXPORTS', () => {
    assert.equal(SERIES.EXTERNAL_SECTOR.EXPORTS, 'F068.B1.FLU.Z.0.C.N.Z.Z.Z.Z.6.0.M');
  });

  it('contains IMPORTS', () => {
    assert.equal(SERIES.EXTERNAL_SECTOR.IMPORTS, 'F068.B1.FLU.Z.0.D.N.0.T.Z.Z.6.0.M');
  });
});

// ---------------------------------------------------------------------------
// EMPLOYMENT — spot-checks
// ---------------------------------------------------------------------------

describe('SERIES.EMPLOYMENT', () => {
  it('contains UNEMPLOYMENT_RATE', () => {
    assert.equal(SERIES.EMPLOYMENT.UNEMPLOYMENT_RATE, 'F049.DES.TAS.INE9.10.M');
  });
});

// ---------------------------------------------------------------------------
// PUBLIC_FINANCES — spot-checks
// ---------------------------------------------------------------------------

describe('SERIES.PUBLIC_FINANCES', () => {
  it('contains REVENUE', () => {
    assert.equal(SERIES.PUBLIC_FINANCES.REVENUE, 'F051.A01.FLU.G.C.CLP.T');
  });

  it('contains EXPENDITURE', () => {
    assert.equal(SERIES.PUBLIC_FINANCES.EXPENDITURE, 'F051.A02.FLU.G.C.CLP.T');
  });
});

// ---------------------------------------------------------------------------
// CAPITAL_MARKET — spot-checks
// ---------------------------------------------------------------------------

describe('SERIES.CAPITAL_MARKET', () => {
  it('contains IPSA', () => {
    assert.equal(SERIES.CAPITAL_MARKET.IPSA, 'F013.IBC.IND.N.7.LAC.CL.CLP.BLO.D');
  });
});
