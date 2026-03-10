/**
 * Curated constants for commonly used BCCH series identifiers.
 *
 * This is not an exhaustive catalog — it covers the most frequently queried
 * series across key macroeconomic domains. Use {@link https://si3.bcentral.cl/siete | si3.bcentral.cl}
 * or {@link Client.searchSeries} to discover additional series IDs.
 *
 * @example
 * ```ts
 * import { Client } from 'bcch/client';
 * import { SERIES } from 'bcch/series';
 *
 * const client = new Client({ user: '...', pass: '...' });
 * const data = await client.getSeries(SERIES.PRICES.UF);
 * ```
 */
export const SERIES = {
  /**
   * Exchange rate series.
   *
   * USD/CLP is expressed as Chilean Pesos per USD.
   * All other pairs are expressed as foreign currency units per 1 USD.
   */
  EXCHANGE_RATE: {
    /** Observed (official) USD/CLP exchange rate — daily. */
    USD_CLP_OBSERVED: 'F073.TCO.PRE.Z.D',
    /** Argentine Peso per USD — daily. */
    ARS_USD: 'F072.ARS.USD.N.O.D',
    /** Australian Dollar per USD — daily. */
    AUD_USD: 'F072.AUD.USD.N.O.D',
    /** Brazilian Real per USD — daily. */
    BRL_USD: 'F072.BRL.USD.N.O.D',
    /** Canadian Dollar per USD — daily. */
    CAD_USD: 'F072.CAD.USD.N.O.D',
    /** Yuan Renminbi per USD — daily. */
    CNY_USD: 'F072.CNY.USD.N.O.D',
    /** Colombian Peso per USD — daily. */
    COP_USD: 'F072.COP.USD.N.O.D',
    /** Euro per USD — daily. */
    EUR_USD: 'F072.EUR.USD.N.O.D',
    /** Pound Sterling per USD — daily. */
    GBP_USD: 'F072.GBP.USD.N.O.D',
    /** Hong Kong Dollar per USD — daily. */
    HKD_USD: 'F072.HKD.USD.N.O.D',
    /** Japanese Yen per USD — daily. */
    JPY_USD: 'F072.JPY.USD.N.O.D',
    /** Mexican Peso per USD — daily. */
    MXN_USD: 'F072.MXN.USD.N.O.D',
    /** Norwegian Krone per USD — daily. */
    NOK_USD: 'F072.NOK.USD.N.O.D',
    /** Peruvian Sol per USD — daily. */
    PEN_USD: 'F072.PEN.USD.N.O.D',
    /** Swedish Krona per USD — daily. */
    SEK_USD: 'F072.SEK.USD.N.O.D',
    /** Swiss Franc per USD — daily. */
    CHF_USD: 'F072.CHF.USD.N.O.D',
    /** IMF Special Drawing Rights per USD — daily. */
    SDR_USD: 'F072.DEG.USD.N.O.D',
  },

  /**
   * Price index and inflation series.
   */
  PRICES: {
    /** Unidad de Fomento (UF) — daily. */
    UF: 'F073.UFF.PRE.Z.D',
    /** Average Value Index (IVP) — daily. */
    IVP: 'F073.IVP.PRE.Z.D',
    /** Monthly Tax Unit (UTM) — monthly. */
    UTM: 'F073.UTR.PRE.Z.M',
    /** Headline CPI index (base 2023) — monthly. */
    CPI_INDEX: 'F074.IPC.IND.Z.EP23.C.M',
    /** Headline CPI monthly change — monthly. */
    CPI_MONTHLY_CHANGE: 'F074.IPC.VAR.Z.EP23.C.M',
    /** Headline CPI annual change (12-month) — monthly. */
    CPI_ANNUAL_CHANGE: 'F074.IPC.V12.Z.EP23.C.M',
    /** CPI excluding food and energy (SAE) — monthly. */
    CPI_SAE: 'F074.IPCSAE.VAR.Z.2023.C.M',
    /** Tradable CPI — monthly. */
    CPI_TRADABLE: 'F074.IPCT.VAR.Z.2023.C.M',
    /** Non-tradable CPI — monthly. */
    CPI_NON_TRADABLE: 'F074.IPCN.VAR.Z.2023.C.M',
    /** CPI food — monthly. */
    CPI_FOOD: 'F074.IPCA.VAR.Z.2023.C.M',
    /** CPI energy — monthly. */
    CPI_ENERGY: 'F074.IPCE.VAR.Z.2023.C.M',
    /** CPI services — monthly. */
    CPI_SERVICES: 'F074.IPCS.VAR.Z.2023.C.M',
    /** CPI goods — monthly. */
    CPI_GOODS: 'F074.IPCB.VAR.Z.2023.C.M',
  },

  /**
   * Interest rate series (policy rates, sovereign bonds, money market instruments).
   */
  INTEREST_RATES: {
    /** Monetary Policy Rate (MPR/TPM) — daily. */
    MONETARY_POLICY_RATE: 'F022.TPM.TIN.D001.NO.Z.D',
    /** Permanent liquidity facility rate — daily. */
    LIQUIDITY_FACILITY: 'F022.TPL.TIN.Z.NO.Z.D',
    /** Permanent deposit facility rate — daily. */
    DEPOSIT_FACILITY: 'F022.TPD.TIN.Z.NO.Z.D',
    /** 2-year nominal BCP sovereign bond yield — daily. */
    BCP_2Y: 'F022.BCLP.TIS.AN02.NO.Z.D',
    /** 5-year nominal BCP sovereign bond yield — daily. */
    BCP_5Y: 'F022.BCLP.TIS.AN05.NO.Z.D',
    /** 10-year nominal BCP sovereign bond yield — daily. */
    BCP_10Y: 'F022.BCLP.TIS.AN10.NO.Z.D',
    /** 2-year inflation-linked BCU sovereign bond yield — daily. */
    BCU_2Y: 'F022.BUF.TIS.AN02.UF.Z.D',
    /** 5-year inflation-linked BCU sovereign bond yield — daily. */
    BCU_5Y: 'F022.BUF.TIS.AN05.UF.Z.D',
    /** 10-year inflation-linked BCU sovereign bond yield — daily. */
    BCU_10Y: 'F022.BUF.TIS.AN10.UF.Z.D',
    /** 30-day PDBC rate — monthly. */
    PDBC_30D: 'F022.PDBC.TIN.D030.NO.Z.M',
    /** 90-day PDBC rate — monthly. */
    PDBC_90D: 'F022.PDBC.TIN.D090.NO.Z.M',
    /** 180-day PDBC rate — monthly. */
    PDBC_180D: 'F022.PDBC.TIN.D180.NO.Z.M',
  },

  /**
   * Monetary aggregates and credit series.
   */
  MONEY: {
    /** Narrow money supply M1 — monthly. */
    M1: 'F021.M1.PRO.N.CLP.5.M',
    /** Broad money supply M2 — monthly. */
    M2: 'F021.M2.PRO.N.CLP.5.M',
    /** Broadest money supply M3 — monthly. */
    M3: 'F021.M3.PRO.N.CLP.5.M',
    /** Total real bank loans — monthly. */
    LOANS_TOTAL: 'F022.CTO.STO.TP.Z.P96R23.M',
    /** Real consumer loans — monthly. */
    LOANS_CONSUMER: 'F022.CON.STO.TP.Z.P96R23.M',
    /** Real mortgage loans — monthly. */
    LOANS_MORTGAGE: 'F022.VIV.STO.TP.Z.P96R23.M',
    /** Real commercial loans — monthly. */
    LOANS_COMMERCIAL: 'F022.CEM.STO.TP.Z.P96R23.M',
  },

  /**
   * National accounts and economic activity series.
   */
  NATIONAL_ACCOUNTS: {
    /** Imacec index (economic activity, 2018=100) — monthly. */
    IMACEC: 'F032.IMC.IND.Z.Z.EP18.Z.Z.0.M',
    /** Imacec 12-month annual change — monthly. */
    IMACEC_ANNUAL_CHANGE: 'F032.IMC.V12.Z.Z.2018.Z.Z.0.M',
    /** Non-mining Imacec index — monthly. */
    IMACEC_NON_MINING: 'F032.IMC.IND.Z.Z.EP18.N03.Z.0.M',
    /** Mining Imacec — monthly. */
    IMACEC_MINING: 'F032.IMC.IND.Z.Z.EP18.03.Z.0.M',
    /** Manufacturing Imacec — monthly. */
    IMACEC_MANUFACTURING: 'F032.IMC.IND.Z.Z.EP18.04.Z.0.M',
    /** Services Imacec — monthly. */
    IMACEC_SERVICES: 'F032.IMC.IND.Z.Z.EP18.SERV.Z.0.M',
  },

  /**
   * External sector and balance of payments series.
   */
  EXTERNAL_SECTOR: {
    /** Current account balance — quarterly. */
    CURRENT_ACCOUNT: 'F068.A.FLU.Z.0.S.N.Z.Z.Z.Z.6.0.T',
    /** Trade balance of goods and services — quarterly. */
    TRADE_BALANCE: 'F068.B.FLU.Z.0.S.N.Z.Z.Z.Z.6.0.T',
    /** Goods exports — monthly. */
    EXPORTS: 'F068.B1.FLU.Z.0.C.N.Z.Z.Z.Z.6.0.M',
    /** Goods imports (FOB) — monthly. */
    IMPORTS: 'F068.B1.FLU.Z.0.D.N.0.T.Z.Z.6.0.M',
    /** Financial account — monthly. */
    FINANCIAL_ACCOUNT: 'F068.G.FLU.Z.0.S.N.Z.T.Z.Z.6.0.M',
    /** Foreign direct investment (net) — monthly. */
    DIRECT_INVESTMENT: 'F068.G1.FLU.Z.0.S.N.Z.T.Z.Z.6.0.M',
    /** International reserve assets — monthly. */
    RESERVE_ASSETS: 'F068.G5.FLU.W.0.S.N.Z.T.Z.Z.6.0.M',
  },

  /**
   * Labour market series.
   */
  EMPLOYMENT: {
    /** Nationwide unemployment rate — monthly. */
    UNEMPLOYMENT_RATE: 'F049.DES.TAS.INE9.10.M',
    /** Total labour force (persons) — monthly. */
    LABOUR_FORCE: 'F049.FTR.PMT.INE9.01.M',
    /** Employed persons — monthly. */
    EMPLOYED: 'F049.OCU.PMT.INE9.01.M',
    /** Unemployed persons — monthly. */
    UNEMPLOYED: 'F049.DES.PMT.INE9.01.M',
  },

  /**
   * Central government fiscal series.
   */
  PUBLIC_FINANCES: {
    /** Total government revenue — annual. */
    REVENUE: 'F051.A01.FLU.G.C.CLP.T',
    /** Total government expenditure — annual. */
    EXPENDITURE: 'F051.A02.FLU.G.C.CLP.T',
    /** Net tax revenues — annual. */
    TAX_REVENUE: 'F051.A011.FLU.G.C.CLP.T',
    /** Net lending / net borrowing (fiscal balance) — annual. */
    FISCAL_BALANCE: 'F051.B04.FLU.G.C.CLP.T',
    /** Net foreign exchange reserves (central government) — annual. */
    FX_RESERVES: 'F051.E21.STO.H.Z.USD.T',
  },

  /**
   * Capital market series.
   */
  CAPITAL_MARKET: {
    /** IPSA equity index (base January 2003=100) — daily. */
    IPSA: 'F013.IBC.IND.N.7.LAC.CL.CLP.BLO.D',
    /** Total stock market capitalisation — monthly. */
    STOCK_MARKET_CAPITAL: 'F022.BCP.STO.Z.Z.CLP.D',
  },
} as const;
