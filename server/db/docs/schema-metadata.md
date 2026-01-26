# Morningstar Schema Metadata

Generated: 2026-01-25T18:52:26.494Z

Total Tables/Views: 14

---

## annual_report_fees_ca_openend

**Type:** BASE TABLE
**Size:** 1744 kB
**Estimated Rows:** 9732

**Total Columns:** 20

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| annualreportdate | text | Yes | - |
| interimnetexpenseratio | text | Yes | - |
| interimnetexpenseratiodate | text | Yes | - |
| mer | text | Yes | - |
| tradingexpenseratio | text | Yes | - |
| _name | text | Yes | - |
| semi_annual_report_net_expense_ratio_date | text | Yes | - |
| semi_annual_report_turnover_ratio_date | text | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |
| fault_faultstring | text | Yes | - |
| fault_detail_errorcode | text | Yes | - |
| _currencyid | text | Yes | - |

---

## fee_levels_ca_openend

**Type:** BASE TABLE
**Size:** 9296 kB
**Estimated Rows:** 60026

**Total Columns:** 15

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| feelevel | text | Yes | - |
| feeleveldate | text | Yes | - |
| feelevelrank | text | Yes | - |
| _name | text | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |
| fault_faultstring | text | Yes | - |
| fault_detail_errorcode | text | Yes | - |

---

## fund_attributes_ca_openend

**Type:** BASE TABLE
**Size:** 1856 kB
**Estimated Rows:** 5063

**Total Columns:** 67

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| activenontransparent | boolean | Yes | - |
| availablefor529only | boolean | Yes | - |
| availableinsuranceproduct | boolean | Yes | - |
| availablepensionplan | boolean | Yes | - |
| availableregularinvestment | boolean | Yes | - |
| availableretirementplan | boolean | Yes | - |
| continuouslyoffered | text | Yes | - |
| coveredcall | text | Yes | - |
| currencyhedged | text | Yes | - |
| currencyhedgedto | text | Yes | - |
| delayedpricing | text | Yes | - |
| dividendinvestmentplan | boolean | Yes | - |
| etfmanagedportfolio | text | Yes | - |
| exchangetradednotes | boolean | Yes | - |
| exchangetradedshare | boolean | Yes | - |
| fclass | boolean | Yes | - |
| fundlevelcategorycode | text | Yes | - |
| fundlevelcategoryname | text | Yes | - |
| fundoffunds | text | Yes | - |
| holdr | boolean | Yes | - |
| indexfund | boolean | Yes | - |
| indexingapproachcensusreplication | text | Yes | - |
| indexingapproachderivativebased | text | Yes | - |
| indexingapproachphysicalfull | text | Yes | - |
| indexingapproachphysicalsample | text | Yes | - |
| indexingapproachstratefiedsampling | text | Yes | - |
| indexingapproachstructured | text | Yes | - |
| indexingapproachsyntheticreplication | text | Yes | - |
| institutional | text | Yes | - |
| inversefund | boolean | Yes | - |
| investmentarea | text | Yes | - |
| leveragedfund | boolean | Yes | - |
| lifecyclefund | text | Yes | - |
| mptriskfreerateid | text | Yes | - |
| mptriskfreeratename | text | Yes | - |
| manageddistribution | text | Yes | - |
| masterfeeder | boolean | Yes | - |
| masterfundid | text | Yes | - |
| masterfundname | text | Yes | - |
| moneymarketfund | text | Yes | - |
| nondiversifiedfund | text | Yes | - |
| offshorevehicle | text | Yes | - |
| oldestshareclassid | text | Yes | - |
| oldestshareclassinceptiondate | text | Yes | - |
| overlaymanaged | text | Yes | - |
| peaindicator | text | Yes | - |
| portfolioconstructionprocess | text | Yes | - |
| rrsp | boolean | Yes | - |
| shariacompliant | boolean | Yes | - |
| strategymanagementapproachstrategicbeta | text | Yes | - |
| sustainableinvestmentoverall | text | Yes | - |
| syntheticreplication | boolean | Yes | - |
| targetmaturitybondindicator | text | Yes | - |
| targetmaturitybondyear | text | Yes | - |
| truenoload | text | Yes | - |
| usesetfsonly | text | Yes | - |
| _name | text | Yes | - |
| india_purchase_and_redemption_options | jsonb | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |

---

## fund_flow_details_ca_openend

**Type:** BASE TABLE
**Size:** 27 MB
**Estimated Rows:** 68177

**Total Columns:** 41

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| estfundlevelnetflow10yrmoend | text | Yes | - |
| estfundlevelnetflow15yrmoend | text | Yes | - |
| estfundlevelnetflow1momoend | text | Yes | - |
| estfundlevelnetflow1yrmoend | text | Yes | - |
| estfundlevelnetflow3momoend | text | Yes | - |
| estfundlevelnetflow3yrmoend | text | Yes | - |
| estfundlevelnetflow5yrmoend | text | Yes | - |
| estfundlevelnetflow6momoend | text | Yes | - |
| estfundlevelnetflowdatemoend | text | Yes | - |
| estfundlevelnetflowytdmoend | text | Yes | - |
| estnetflow10yrqtrend | text | Yes | - |
| estnetflow1moqtrend | text | Yes | - |
| estnetflow1yrqtrend | text | Yes | - |
| estnetflow3moqtrend | text | Yes | - |
| estnetflow3yrqtrend | text | Yes | - |
| estnetflow5yrqtrend | text | Yes | - |
| estnetflow6moqtrend | text | Yes | - |
| estnetflowdateqtrend | text | Yes | - |
| estshareclassnetflow10yrmoend | text | Yes | - |
| estshareclassnetflow15yrmoend | text | Yes | - |
| estshareclassnetflow1momoend | text | Yes | - |
| estshareclassnetflow1yrmoend | text | Yes | - |
| estshareclassnetflow3momoend | text | Yes | - |
| estshareclassnetflow3yrmoend | text | Yes | - |
| estshareclassnetflow5yrmoend | text | Yes | - |
| estshareclassnetflow6momoend | text | Yes | - |
| estshareclassnetflowdatemoend | text | Yes | - |
| estshareclassnetflowytdmoend | text | Yes | - |
| _name | text | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |
| fault_faultstring | text | Yes | - |
| fault_detail_errorcode | text | Yes | - |
| _currencyid | text | Yes | - |

---

## fund_level_net_assets_ca_openend

**Type:** BASE TABLE
**Size:** 184 MB
**Estimated Rows:** 800000

**Total Columns:** 18

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| asoforiginalreported | text | Yes | - |
| asoforiginalreportedcurrencyid | text | Yes | - |
| asoforiginalreporteddate | text | Yes | - |
| fundnetassets | text | Yes | - |
| netassetsdate | text | Yes | - |
| normalizedfundnetassets | text | Yes | - |
| surveyedfundnetassets | text | Yes | - |
| surveyedfundnetassetsdate | text | Yes | - |
| _name | text | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |

---

## fund_manager_ca_openend

**Type:** BASE TABLE
**Size:** 2240 kB
**Estimated Rows:** 5068

**Total Columns:** 23

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| firmassetsmanagerinvestment0 | text | Yes | - |
| firmassetsmanagerinvestment110000dollars | text | Yes | - |
| firmassetsmanagerinvestment100001500000dollars | text | Yes | - |
| firmassetsmanagerinvestment1000150000dollars | text | Yes | - |
| firmassetsmanagerinvestment5000011milliondollars | text | Yes | - |
| firmassetsmanagerinvestment50001100000dollars | text | Yes | - |
| firmassetsmanagerinvestmentnull | text | Yes | - |
| firmassetsmanagerinvestmentover1milliondollars | text | Yes | - |
| firmaveragemanagertenurelongest | text | Yes | - |
| fundmanagertenureaverage | text | Yes | - |
| managers | jsonb | Yes | - |
| _name | text | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |
| firmmanagerretentionrate5y | text | Yes | - |
| _currencyid | text | Yes | - |

---

## fund_share_class_basic_info_ca_openend

**Type:** BASE TABLE
**Size:** 104 MB
**Estimated Rows:** 64149

**Total Columns:** 93

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| amfcategory | text | Yes | - |
| ausinvestmentvehicleregionareacode | text | Yes | - |
| ausinvestmentvehicleregionareacodeisoalpha2 | text | Yes | - |
| advisorycompanyid | text | Yes | - |
| advisorycompanyname | text | Yes | - |
| aggregatedcategoryname | text | Yes | - |
| brandingid | text | Yes | - |
| brandingname | text | Yes | - |
| broadassetclass | text | Yes | - |
| broadcategorygroup | text | Yes | - |
| broadcategorygroupid | text | Yes | - |
| canadarisklevelverbal | text | Yes | - |
| canadatimehorizon | text | Yes | - |
| categorycode | text | Yes | - |
| categorycurrencyid | text | Yes | - |
| categoryname | text | Yes | - |
| currency | text | Yes | - |
| currencyid | text | Yes | - |
| custodiancompanyid | text | Yes | - |
| custodiancompanyname | text | Yes | - |
| distributionfrequency | text | Yes | - |
| distributionstatus | text | Yes | - |
| distributorcompanies | jsonb | Yes | - |
| dividenddistributionfrequencydetails | text | Yes | - |
| domicile | text | Yes | - |
| domicileid | text | Yes | - |
| exchangeid | text | Yes | - |
| fixeddistribution | text | Yes | - |
| fundid | text | Yes | - |
| fundlegalname | text | Yes | - |
| fundname | text | Yes | - |
| fundservdetails | jsonb | Yes | - |
| fundservs | jsonb | Yes | - |
| fundstandardname | text | Yes | - |
| globalcategoryid | text | Yes | - |
| globalcategoryname | text | Yes | - |
| globalfundreports | jsonb | Yes | - |
| highnetworth | text | Yes | - |
| ific | text | Yes | - |
| inceptiondate | text | Yes | - |
| indexstrategybox | text | Yes | - |
| indexstrategyboxverbal | text | Yes | - |
| invesmtentdecisionmakingprocess | text | Yes | - |
| investmentphilsophy | text | Yes | - |
| legalname | text | Yes | - |
| legalstructure | text | Yes | - |
| localphone | text | Yes | - |
| mexcode | text | Yes | - |
| mstarid | text | Yes | - |
| morningstarindexid | text | Yes | - |
| morningstarindexname | text | Yes | - |
| multilingualnames | jsonb | Yes | - |
| operationready | text | Yes | - |
| performanceid | text | Yes | - |
| performanceready | text | Yes | - |
| previousfundname | text | Yes | - |
| previousfundnameenddate | text | Yes | - |
| productfocus | text | Yes | - |
| producttype | text | Yes | - |
| providercompanyid | text | Yes | - |
| providercompanyname | text | Yes | - |
| providercompanyphonenumber | text | Yes | - |
| providercompanywebsite | text | Yes | - |
| registeredunder1940act | text | Yes | - |
| restrictedfund | text | Yes | - |
| restructuredate | text | Yes | - |
| securitytype | text | Yes | - |
| shareclasstype | text | Yes | - |
| terminationdate | text | Yes | - |
| ticker | text | Yes | - |
| tollfreephone | text | Yes | - |
| ukreportingstartdate | text | Yes | - |
| ukreportingstatus | text | Yes | - |
| umbrellacompanyid | text | Yes | - |
| umbrellacompanyname | text | Yes | - |
| valor | text | Yes | - |
| wkn | text | Yes | - |
| _name | text | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |
| fault_faultstring | text | Yes | - |
| fault_detail_errorcode | text | Yes | - |
| morningstarcategorygroupid | text | Yes | - |
| morningstarcategorygroupname | text | Yes | - |
| _currencyid | text | Yes | - |
| prospectusobjective | text | Yes | - |

### Indexes

| Index Name | Columns | Type |
|------------|---------|------|
| idx_fund_share_class_basic_info_ca_openend__id | _id | INDEX |

---

## month_end_trailing_total_return_percentile_and_absolute_ranks_c

**Type:** BASE TABLE
**Size:** 64 MB
**Estimated Rows:** 70014

**Total Columns:** 173

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| absrank10yr | text | Yes | - |
| absrank15yr | text | Yes | - |
| absrank1mth | text | Yes | - |
| absrank1yr | text | Yes | - |
| absrank20yr | text | Yes | - |
| absrank2mth | text | Yes | - |
| absrank2yr | text | Yes | - |
| absrank3mth | text | Yes | - |
| absrank3yr | text | Yes | - |
| absrank4yr | text | Yes | - |
| absrank5yr | text | Yes | - |
| absrank6mth | text | Yes | - |
| absrank6yr | text | Yes | - |
| absrank7yr | text | Yes | - |
| absrank8yr | text | Yes | - |
| absrank9mth | text | Yes | - |
| absrank9yr | text | Yes | - |
| absrankytd | text | Yes | - |
| categorysize10yr | text | Yes | - |
| categorysize15yr | text | Yes | - |
| categorysize1mth | text | Yes | - |
| categorysize1yr | text | Yes | - |
| categorysize20yr | text | Yes | - |
| categorysize2mth | text | Yes | - |
| categorysize2yr | text | Yes | - |
| categorysize3mth | text | Yes | - |
| categorysize3yr | text | Yes | - |
| categorysize4yr | text | Yes | - |
| categorysize5yr | text | Yes | - |
| categorysize6mth | text | Yes | - |
| categorysize6yr | text | Yes | - |
| categorysize7yr | text | Yes | - |
| categorysize8yr | text | Yes | - |
| categorysize9yr | text | Yes | - |
| categorysize9mth | text | Yes | - |
| categorysizeytd | text | Yes | - |
| monthenddate | text | Yes | - |
| rank10yr | text | Yes | - |
| rank10yrquartile | text | Yes | - |
| rank10yrquartilebreakpoint1 | text | Yes | - |
| rank10yrquartilebreakpoint25 | text | Yes | - |
| rank10yrquartilebreakpoint50 | text | Yes | - |
| rank10yrquartilebreakpoint75 | text | Yes | - |
| rank10yrquartilebreakpoint99 | text | Yes | - |
| rank15yr | text | Yes | - |
| rank15yrquartile | text | Yes | - |
| rank15yrquartilebreakpoint1 | text | Yes | - |
| rank15yrquartilebreakpoint25 | text | Yes | - |
| rank15yrquartilebreakpoint50 | text | Yes | - |
| rank15yrquartilebreakpoint75 | text | Yes | - |
| rank15yrquartilebreakpoint99 | text | Yes | - |
| rank1mth | text | Yes | - |
| rank1mthquartile | text | Yes | - |
| rank1mthquartilebreakpoint1 | text | Yes | - |
| rank1mthquartilebreakpoint25 | text | Yes | - |
| rank1mthquartilebreakpoint50 | text | Yes | - |
| rank1mthquartilebreakpoint75 | text | Yes | - |
| rank1mthquartilebreakpoint99 | text | Yes | - |
| rank1yr | text | Yes | - |
| rank1yrquartile | text | Yes | - |
| rank1yrquartilebreakpoint1 | text | Yes | - |
| rank1yrquartilebreakpoint25 | text | Yes | - |
| rank1yrquartilebreakpoint50 | text | Yes | - |
| rank1yrquartilebreakpoint75 | text | Yes | - |
| rank1yrquartilebreakpoint99 | text | Yes | - |
| rank20yr | text | Yes | - |
| rank20yrquartile | text | Yes | - |
| rank20yrquartilebreakpoint1 | text | Yes | - |
| rank20yrquartilebreakpoint25 | text | Yes | - |
| rank20yrquartilebreakpoint50 | text | Yes | - |
| rank20yrquartilebreakpoint75 | text | Yes | - |
| rank20yrquartilebreakpoint99 | text | Yes | - |
| rank2mth | text | Yes | - |
| rank2mthquartile | text | Yes | - |
| rank2mthquartilebreakpoint1 | text | Yes | - |
| rank2mthquartilebreakpoint25 | text | Yes | - |
| rank2mthquartilebreakpoint50 | text | Yes | - |
| rank2mthquartilebreakpoint75 | text | Yes | - |
| rank2mthquartilebreakpoint99 | text | Yes | - |
| rank2yr | text | Yes | - |
| rank2yrquartile | text | Yes | - |
| rank2yrquartilebreakpoint1 | text | Yes | - |
| rank2yrquartilebreakpoint25 | text | Yes | - |
| rank2yrquartilebreakpoint50 | text | Yes | - |
| rank2yrquartilebreakpoint75 | text | Yes | - |
| rank2yrquartilebreakpoint99 | text | Yes | - |
| rank3mth | text | Yes | - |
| rank3mthquartile | text | Yes | - |
| rank3mthquartilebreakpoint1 | text | Yes | - |
| rank3mthquartilebreakpoint25 | text | Yes | - |
| rank3mthquartilebreakpoint50 | text | Yes | - |
| rank3mthquartilebreakpoint75 | text | Yes | - |
| rank3mthquartilebreakpoint99 | text | Yes | - |
| rank3yr | text | Yes | - |
| rank3yrquartile | text | Yes | - |
| rank3yrquartilebreakpoint1 | text | Yes | - |
| rank3yrquartilebreakpoint25 | text | Yes | - |
| rank3yrquartilebreakpoint50 | text | Yes | - |
| rank3yrquartilebreakpoint75 | text | Yes | - |
| rank3yrquartilebreakpoint99 | text | Yes | - |
| rank4yr | text | Yes | - |
| rank4yrquartile | text | Yes | - |
| rank4yrquartilebreakpoint1 | text | Yes | - |
| rank4yrquartilebreakpoint25 | text | Yes | - |
| rank4yrquartilebreakpoint50 | text | Yes | - |
| rank4yrquartilebreakpoint75 | text | Yes | - |
| rank4yrquartilebreakpoint99 | text | Yes | - |
| rank5yr | text | Yes | - |
| rank5yrquartile | text | Yes | - |
| rank5yrquartilebreakpoint1 | text | Yes | - |
| rank5yrquartilebreakpoint25 | text | Yes | - |
| rank5yrquartilebreakpoint50 | text | Yes | - |
| rank5yrquartilebreakpoint75 | text | Yes | - |
| rank5yrquartilebreakpoint99 | text | Yes | - |
| rank6mth | text | Yes | - |
| rank6mthquartile | text | Yes | - |
| rank6mthquartilebreakpoint1 | text | Yes | - |
| rank6mthquartilebreakpoint25 | text | Yes | - |
| rank6mthquartilebreakpoint50 | text | Yes | - |
| rank6mthquartilebreakpoint75 | text | Yes | - |
| rank6mthquartilebreakpoint99 | text | Yes | - |
| rank6yr | text | Yes | - |
| rank6yrquartile | text | Yes | - |
| rank6yrquartilebreakpoint1 | text | Yes | - |
| rank6yrquartilebreakpoint25 | text | Yes | - |
| rank6yrquartilebreakpoint50 | text | Yes | - |
| rank6yrquartilebreakpoint75 | text | Yes | - |
| rank6yrquartilebreakpoint99 | text | Yes | - |
| rank7yr | text | Yes | - |
| rank7yrquartile | text | Yes | - |
| rank7yrquartilebreakpoint1 | text | Yes | - |
| rank7yrquartilebreakpoint25 | text | Yes | - |
| rank7yrquartilebreakpoint50 | text | Yes | - |
| rank7yrquartilebreakpoint75 | text | Yes | - |
| rank7yrquartilebreakpoint99 | text | Yes | - |
| rank8yr | text | Yes | - |
| rank8yrquartile | text | Yes | - |
| rank8yrquartilebreakpoint1 | text | Yes | - |
| rank8yrquartilebreakpoint25 | text | Yes | - |
| rank8yrquartilebreakpoint50 | text | Yes | - |
| rank8yrquartilebreakpoint75 | text | Yes | - |
| rank8yrquartilebreakpoint99 | text | Yes | - |
| rank9mth | text | Yes | - |
| rank9mthquartile | text | Yes | - |
| rank9mthquartilebreakpoint1 | text | Yes | - |
| rank9mthquartilebreakpoint25 | text | Yes | - |
| rank9mthquartilebreakpoint50 | text | Yes | - |
| rank9mthquartilebreakpoint75 | text | Yes | - |
| rank9mthquartilebreakpoint99 | text | Yes | - |
| rank9yr | text | Yes | - |
| rank9yrquartile | text | Yes | - |
| rank9yrquartilebreakpoint1 | text | Yes | - |
| rank9yrquartilebreakpoint25 | text | Yes | - |
| rank9yrquartilebreakpoint50 | text | Yes | - |
| rank9yrquartilebreakpoint75 | text | Yes | - |
| rank9yrquartilebreakpoint99 | text | Yes | - |
| rankytd | text | Yes | - |
| rankytdquartile | text | Yes | - |
| rankytdquartilebreakpoint1 | text | Yes | - |
| rankytdquartilebreakpoint25 | text | Yes | - |
| rankytdquartilebreakpoint50 | text | Yes | - |
| rankytdquartilebreakpoint75 | text | Yes | - |
| rankytdquartilebreakpoint99 | text | Yes | - |
| _name | text | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |

---

## month_end_trailing_total_returns_ca_openend

**Type:** BASE TABLE
**Size:** 22 MB
**Estimated Rows:** 70024

**Total Columns:** 44

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| cumulativereturn10yr | text | Yes | - |
| cumulativereturn15yr | text | Yes | - |
| cumulativereturn20yr | text | Yes | - |
| cumulativereturn2yr | text | Yes | - |
| cumulativereturn3yr | text | Yes | - |
| cumulativereturn4yr | text | Yes | - |
| cumulativereturn5yr | text | Yes | - |
| cumulativereturn6yr | text | Yes | - |
| cumulativereturn7yr | text | Yes | - |
| cumulativereturn8yr | text | Yes | - |
| cumulativereturn9yr | text | Yes | - |
| cumulativereturnsinceinception | text | Yes | - |
| monthenddate | text | Yes | - |
| return10yr | text | Yes | - |
| return15yr | text | Yes | - |
| return1mth | text | Yes | - |
| return1yr | text | Yes | - |
| return20yr | text | Yes | - |
| return2mth | text | Yes | - |
| return2yr | text | Yes | - |
| return3mth | text | Yes | - |
| return3yr | text | Yes | - |
| return4yr | text | Yes | - |
| return5yr | text | Yes | - |
| return6mth | text | Yes | - |
| return6yr | text | Yes | - |
| return7yr | text | Yes | - |
| return8yr | text | Yes | - |
| return9mth | text | Yes | - |
| return9yr | text | Yes | - |
| returnsinceinception | text | Yes | - |
| returnytd | text | Yes | - |
| _name | text | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |
| fault_faultstring | text | Yes | - |
| fault_detail_errorcode | text | Yes | - |

---

## morningstar_rating_ca_openend

**Type:** BASE TABLE
**Size:** 16 MB
**Estimated Rows:** 51519

**Total Columns:** 48

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| numberoffunds10year | text | Yes | - |
| numberoffunds3year | text | Yes | - |
| numberoffunds5year | text | Yes | - |
| numberoffundsoverall | text | Yes | - |
| perfcatrank10year | text | Yes | - |
| perfcatrank3year | text | Yes | - |
| perfcatrank5year | text | Yes | - |
| performancescore10yr | text | Yes | - |
| performancescore3yr | text | Yes | - |
| performancescore5yr | text | Yes | - |
| performancescoreoverall | text | Yes | - |
| rating10year | text | Yes | - |
| rating3year | text | Yes | - |
| rating5year | text | Yes | - |
| ratingcatrank10year | text | Yes | - |
| ratingcatrank3year | text | Yes | - |
| ratingcatrank5year | text | Yes | - |
| ratingdate | text | Yes | - |
| ratingoverall | text | Yes | - |
| return10year | text | Yes | - |
| return3year | text | Yes | - |
| return5year | text | Yes | - |
| returnoverall | text | Yes | - |
| risk10year | text | Yes | - |
| risk3year | text | Yes | - |
| risk5year | text | Yes | - |
| riskadjustedreturn10yr | text | Yes | - |
| riskadjustedreturn3yr | text | Yes | - |
| riskadjustedreturn5yr | text | Yes | - |
| riskadjustedreturnoverall | text | Yes | - |
| riskcatrank10year | text | Yes | - |
| riskcatrank3year | text | Yes | - |
| riskcatrank5year | text | Yes | - |
| riskoverall | text | Yes | - |
| riskscore10yr | text | Yes | - |
| riskscore3yr | text | Yes | - |
| riskscore5yr | text | Yes | - |
| riskscoreoverall | text | Yes | - |
| _name | text | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |

---

## morningstar_rating_extended_performance_ca_openend

**Type:** BASE TABLE
**Size:** 11 MB
**Estimated Rows:** 51505

**Total Columns:** 23

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| rating10year | text | Yes | - |
| rating3year | text | Yes | - |
| rating5year | text | Yes | - |
| ratingdate | text | Yes | - |
| ratingoverall | text | Yes | - |
| return10year | text | Yes | - |
| return3year | text | Yes | - |
| return5year | text | Yes | - |
| returnoverall | text | Yes | - |
| risk10year | text | Yes | - |
| risk3year | text | Yes | - |
| risk5year | text | Yes | - |
| riskoverall | text | Yes | - |
| _name | text | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |

---

## prospectus_fees_ca_openend

**Type:** BASE TABLE
**Size:** 872 kB
**Estimated Rows:** 5068

**Total Columns:** 24

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| actualmanagementfee | text | Yes | - |
| administrationfee | text | Yes | - |
| feenegotiable | text | Yes | - |
| grossexpenseratio | text | Yes | - |
| latestprospectusdate | text | Yes | - |
| netexpenseratio | text | Yes | - |
| performancefee | text | Yes | - |
| performancefeecharged | text | Yes | - |
| performancefeeindexname | text | Yes | - |
| performancefeeindexweighting | text | Yes | - |
| prospectusdate | text | Yes | - |
| switchingfee | text | Yes | - |
| transactionfee | text | Yes | - |
| trusteefee | text | Yes | - |
| _name | text | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |

---

## relative_risk_measure_prospectus_ca_openend

**Type:** BASE TABLE
**Size:** 14 MB
**Estimated Rows:** 37429

**Total Columns:** 73

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| alpha10yr | text | Yes | - |
| alpha15yr | text | Yes | - |
| alpha1yr | text | Yes | - |
| alpha20yr | text | Yes | - |
| alpha3yr | text | Yes | - |
| alpha5yr | text | Yes | - |
| battingaverage10yr | text | Yes | - |
| battingaverage15yr | text | Yes | - |
| battingaverage1yr | text | Yes | - |
| battingaverage20yr | text | Yes | - |
| battingaverage3yr | text | Yes | - |
| battingaverage5yr | text | Yes | - |
| beta10yr | text | Yes | - |
| beta15yr | text | Yes | - |
| beta1yr | text | Yes | - |
| beta20yr | text | Yes | - |
| beta3yr | text | Yes | - |
| beta5yr | text | Yes | - |
| captureratiodownside10yr | text | Yes | - |
| captureratiodownside15yr | text | Yes | - |
| captureratiodownside1yr | text | Yes | - |
| captureratiodownside20yr | text | Yes | - |
| captureratiodownside3yr | text | Yes | - |
| captureratiodownside5yr | text | Yes | - |
| captureratioupside10yr | text | Yes | - |
| captureratioupside15yr | text | Yes | - |
| captureratioupside1yr | text | Yes | - |
| captureratioupside20yr | text | Yes | - |
| captureratioupside3yr | text | Yes | - |
| captureratioupside5yr | text | Yes | - |
| correlation10yr | text | Yes | - |
| correlation15yr | text | Yes | - |
| correlation1yr | text | Yes | - |
| correlation20yr | text | Yes | - |
| correlation3yr | text | Yes | - |
| correlation5yr | text | Yes | - |
| enddate | text | Yes | - |
| indexid | text | Yes | - |
| indexname | text | Yes | - |
| informationratio10yr | text | Yes | - |
| informationratio15yr | text | Yes | - |
| informationratio1yr | text | Yes | - |
| informationratio20yr | text | Yes | - |
| informationratio3yr | text | Yes | - |
| informationratio5yr | text | Yes | - |
| rsquared10yr | text | Yes | - |
| rsquared15yr | text | Yes | - |
| rsquared1yr | text | Yes | - |
| rsquared20yr | text | Yes | - |
| rsquared3yr | text | Yes | - |
| rsquared5yr | text | Yes | - |
| trackingerror10yr | text | Yes | - |
| trackingerror15yr | text | Yes | - |
| trackingerror1yr | text | Yes | - |
| trackingerror20yr | text | Yes | - |
| trackingerror3yr | text | Yes | - |
| trackingerror5yr | text | Yes | - |
| treynorratio10yr | text | Yes | - |
| treynorratio15yr | text | Yes | - |
| treynorratio1yr | text | Yes | - |
| treynorratio20yr | text | Yes | - |
| treynorratio3yr | text | Yes | - |
| treynorratio5yr | text | Yes | - |
| _name | text | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |

---

## risk_measure_ca_openend

**Type:** BASE TABLE
**Size:** 19 MB
**Estimated Rows:** 68553

**Total Columns:** 54

### Columns

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|----------|
| data_inserted_at | timestamp without time zone | No | CURRENT_TIMESTAMP |
| status_code | numeric | Yes | - |
| status_message | text | Yes | - |
| _id | text | Yes | - |
| _idtype | text | Yes | - |
| enddate | text | Yes | - |
| kurtosis10yr | text | Yes | - |
| kurtosis15yr | text | Yes | - |
| kurtosis1yr | text | Yes | - |
| kurtosis20yr | text | Yes | - |
| kurtosis3yr | text | Yes | - |
| kurtosis5yr | text | Yes | - |
| maxdrawdown10yr | text | Yes | - |
| maxdrawdown15yr | text | Yes | - |
| maxdrawdown1yr | text | Yes | - |
| maxdrawdown20yr | text | Yes | - |
| maxdrawdown3yr | text | Yes | - |
| maxdrawdown5yr | text | Yes | - |
| mean10yr | text | Yes | - |
| mean15yr | text | Yes | - |
| mean1yr | text | Yes | - |
| mean20yr | text | Yes | - |
| mean3yr | text | Yes | - |
| mean5yr | text | Yes | - |
| riskcurrency | text | Yes | - |
| sharperatio10yr | text | Yes | - |
| sharperatio15yr | text | Yes | - |
| sharperatio1yr | text | Yes | - |
| sharperatio20yr | text | Yes | - |
| sharperatio3yr | text | Yes | - |
| sharperatio5yr | text | Yes | - |
| skewness10yr | text | Yes | - |
| skewness15yr | text | Yes | - |
| skewness1yr | text | Yes | - |
| skewness20yr | text | Yes | - |
| skewness3yr | text | Yes | - |
| skewness5yr | text | Yes | - |
| sortinoratio10yr | text | Yes | - |
| sortinoratio15yr | text | Yes | - |
| sortinoratio1yr | text | Yes | - |
| sortinoratio20yr | text | Yes | - |
| sortinoratio3yr | text | Yes | - |
| sortinoratio5yr | text | Yes | - |
| stddev10yr | text | Yes | - |
| stddev15yr | text | Yes | - |
| stddev1yr | text | Yes | - |
| stddev20yr | text | Yes | - |
| stddev3yr | text | Yes | - |
| stddev5yr | text | Yes | - |
| _name | text | Yes | - |
| _hashkey | numeric | Yes | - |
| _runid | text | Yes | - |
| _timestampfrom | timestamp with time zone | Yes | - |
| _timestampto | timestamp with time zone | Yes | - |

---

