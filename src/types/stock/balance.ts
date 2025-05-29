export interface Position {
  pdno: string;
  prdt_name: string;
  hldg_qty: string;
  pchs_avg_pric: string;
  prpr: string;
  evlu_pfls_amt: string;
  evlu_pfls_rt: string;
  trad_dvsn_name: string;
  bfdy_buy_qty: string;
  bfdy_sll_qty: string;
  thdt_buyqty: string;
  thdt_sll_qty: string;
  ord_psbl_qty: string;
  pchs_amt: string;
  evlu_amt: string;
  loan_dt: string;
  loan_amt: string;
  stln_slng_chgs: string;
  expd_dt: string;
  fltt_rt: string;
  bfdy_cprs_icdc: string;
  item_mgna_rt_name: string;
  grta_rt_name: string;
  sbst_pric: string;
  stck_loan_unpr: string;
}

export interface Summary {
  dnca_tot_amt: string;
  scts_evlu_amt: string;
  tot_evlu_amt: string;
  nxdy_excc_amt: string;
  prvs_rcdl_excc_amt: string;
  cma_evlu_amt: string;
  bfdy_buy_amt: string;
  thdt_buy_amt: string;
  nxdy_auto_rdpt_amt: string;
  bfdy_sll_amt: string;
  thdt_sll_amt: string;
  d2_auto_rdpt_amt: string;
  bfdy_tlex_amt: string;
  thdt_tlex_amt: string;
  tot_loan_amt: string;
  nass_amt: string;
  fncg_gld_auto_rdpt_yn: string;
  pchs_amt_smtl_amt: string;
  evlu_amt_smtl_amt: string;
  evlu_pfls_smtl_amt: string;
  tot_stln_slng_chgs: string;
  bfdy_tot_asst_evlu_amt: string;
  asst_icdc_amt: string;
  asst_icdc_erng_rt: string;
}

export interface StockBalance {
  positions: Position[];
  summary: Summary;
}
