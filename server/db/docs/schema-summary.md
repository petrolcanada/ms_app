# Morningstar Schema Summary

Generated: 2026-01-25T18:52:26.500Z

## Overview

- **Total Objects:** 14
- **Base Tables:** 14
- **Views:** 0
- **Materialized Views:** 0

## Tables by Column Count

| Table Name | Type | Columns | Estimated Rows | Size |
|------------|------|---------|----------------|------|
| month_end_trailing_total_return_percentile_and_absolute_ranks_c | BASE TABLE | 173 | 70014 | 64 MB |
| fund_share_class_basic_info_ca_openend | BASE TABLE | 93 | 64149 | 104 MB |
| relative_risk_measure_prospectus_ca_openend | BASE TABLE | 73 | 37429 | 14 MB |
| fund_attributes_ca_openend | BASE TABLE | 67 | 5063 | 1856 kB |
| risk_measure_ca_openend | BASE TABLE | 54 | 68553 | 19 MB |
| morningstar_rating_ca_openend | BASE TABLE | 48 | 51519 | 16 MB |
| month_end_trailing_total_returns_ca_openend | BASE TABLE | 44 | 70024 | 22 MB |
| fund_flow_details_ca_openend | BASE TABLE | 41 | 68177 | 27 MB |
| prospectus_fees_ca_openend | BASE TABLE | 24 | 5068 | 872 kB |
| fund_manager_ca_openend | BASE TABLE | 23 | 5068 | 2240 kB |
| morningstar_rating_extended_performance_ca_openend | BASE TABLE | 23 | 51505 | 11 MB |
| annual_report_fees_ca_openend | BASE TABLE | 20 | 9732 | 1744 kB |
| fund_level_net_assets_ca_openend | BASE TABLE | 18 | 800000 | 184 MB |
| fee_levels_ca_openend | BASE TABLE | 15 | 60026 | 9296 kB |

## Common Column Names

| Column Name | Appears in N Tables |
|-------------|---------------------|
| data_inserted_at | 14 |
| status_code | 14 |
| status_message | 14 |
| _id | 14 |
| _idtype | 14 |
| _name | 14 |
| _hashkey | 14 |
| _runid | 14 |
| _timestampfrom | 14 |
| _timestampto | 14 |
| fault_faultstring | 5 |
| fault_detail_errorcode | 5 |
| _currencyid | 4 |
| monthenddate | 2 |
| rating10year | 2 |
| rating3year | 2 |
| rating5year | 2 |
| ratingdate | 2 |
| ratingoverall | 2 |
| return10year | 2 |

## Temporal Tracking

Tables with temporal tracking (_timestampfrom, _timestampto): 14

- annual_report_fees_ca_openend
- fee_levels_ca_openend
- fund_attributes_ca_openend
- fund_flow_details_ca_openend
- fund_level_net_assets_ca_openend
- fund_manager_ca_openend
- fund_share_class_basic_info_ca_openend
- month_end_trailing_total_return_percentile_and_absolute_ranks_c
- month_end_trailing_total_returns_ca_openend
- morningstar_rating_ca_openend
- morningstar_rating_extended_performance_ca_openend
- prospectus_fees_ca_openend
- relative_risk_measure_prospectus_ca_openend
- risk_measure_ca_openend

## Date/Time Columns by Table

Includes columns with date/time data types AND columns with "date" or "asof" in their names.

### annual_report_fees_ca_openend (last record annualreportdate<=asofdate per _ID)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📝 **annualreportdate** (text) - _Text field with date in name_
- 📝 **interimnetexpenseratiodate** (text) - _Text field with date in name_
- 📝 **semi_annual_report_net_expense_ratio_date** (text) - _Text field with date in name_
- 📝 **semi_annual_report_turnover_ratio_date** (text) - _Text field with date in name_
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

### fee_levels_ca_openend  (last record feeleveldate<=asofdate per _ID)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📝 **feeleveldate** (text) - _Text field with date in name_
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

### fund_attributes_ca_openend (last record _timestampfrom<=asofdate and asofdate<=data_inserted_at per _ID)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📝 **oldestshareclassinceptiondate** (text) - _Text field with date in name_
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

### fund_flow_details_ca_openend (last record estfundlevelnetflowdatemoend<=asofdate per _ID)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📝 **estfundlevelnetflowdatemoend** (text) - _Text field with date in name_
- 📝 **estnetflowdateqtrend** (text) - _Text field with date in name_
- 📝 **estshareclassnetflowdatemoend** (text) - _Text field with date in name_
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

### fund_level_net_assets_ca_openend (last record netassetsdate<=asofdate per _ID)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📝 **asoforiginalreported** (text) - _Text field with date in name_
- 📝 **asoforiginalreportedcurrencyid** (text) - _Text field with date in name_
- 📝 **asoforiginalreporteddate** (text) - _Text field with date in name_
- 📝 **netassetsdate** (text) - _Text field with date in name_
- 📝 **surveyedfundnetassetsdate** (text) - _Text field with date in name_
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

### fund_manager_ca_openend (last record _timestampfrom<=asofdate and asofdate<=data_inserted_at per _ID)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

### fund_share_class_basic_info_ca_openend (last record _timestampfrom<=asofdate and asofdate<=data_inserted_at per _ID)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📝 **inceptiondate** (text) - _Text field with date in name_
- 📝 **previousfundnameenddate** (text) - _Text field with date in name_
- 📝 **restructuredate** (text) - _Text field with date in name_
- 📝 **terminationdate** (text) - _Text field with date in name_
- 📝 **ukreportingstartdate** (text) - _Text field with date in name_
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

### month_end_trailing_total_return_percentile_and_absolute_ranks_c  (exactly monthenddate=asofdate, last record per _ID based on _timestampfrom)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📝 **monthenddate** (text) - _Text field with date in name_
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

### month_end_trailing_total_returns_ca_openend (exactly monthenddate=asofdate, last record per _ID based on _timestampfrom)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📝 **monthenddate** (text) - _Text field with date in name_
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

### morningstar_rating_ca_openend (exactly ratingdate=asofdate, last record per _ID based on _timestampfrom)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📝 **ratingdate** (text) - _Text field with date in name_
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

### morningstar_rating_extended_performance_ca_openend  (exactly ratingdate=asofdate, last record per _ID based on _timestampfrom)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📝 **ratingdate** (text) - _Text field with date in name_
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

### prospectus_fees_ca_openend (last record prospectusdate<=asofdate per _ID)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📝 **latestprospectusdate** (text) - _Text field with date in name_
- 📝 **prospectusdate** (text) - _Text field with date in name_
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

### relative_risk_measure_prospectus_ca_openend (exactly enddate=asofdate, last record per _ID based on _timestampfrom)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📝 **enddate** (text) - _Text field with date in name_
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

### risk_measure_ca_openend (exactly enddate=asofdate, last record per _ID based on _timestampfrom)

- 📅 **data_inserted_at** (timestamp without time zone)
- 📝 **enddate** (text) - _Text field with date in name_
- 📅 **_timestampfrom** (timestamp with time zone)
- 📅 **_timestampto** (timestamp with time zone)

## Date Column Analysis

### Time-Series Date Columns (for historical queries)

| Table | Column | Data Type |
|-------|--------|----------|
| fund_flow_details_ca_openend | estfundlevelnetflowdatemoend | text |
| fund_flow_details_ca_openend | estnetflowdateqtrend | text |
| fund_flow_details_ca_openend | estshareclassnetflowdatemoend | text |
| fund_share_class_basic_info_ca_openend | previousfundnameenddate | text |
| month_end_trailing_total_return_percentile_and_absolute_ranks_c | monthenddate | text |
| month_end_trailing_total_returns_ca_openend | monthenddate | text |
| morningstar_rating_ca_openend | ratingdate | text |
| morningstar_rating_extended_performance_ca_openend | ratingdate | text |
| relative_risk_measure_prospectus_ca_openend | enddate | text |
| risk_measure_ca_openend | enddate | text |

### Report Date Columns (periodic reports)

| Table | Column | Data Type |
|-------|--------|----------|
| annual_report_fees_ca_openend | annualreportdate | text |
| prospectus_fees_ca_openend | latestprospectusdate | text |
| prospectus_fees_ca_openend | prospectusdate | text |

### "As Of" Date Columns

| Table | Column | Data Type |
|-------|--------|----------|
| fund_level_net_assets_ca_openend | asoforiginalreported | text |
| fund_level_net_assets_ca_openend | asoforiginalreportedcurrencyid | text |
| fund_level_net_assets_ca_openend | asoforiginalreporteddate | text |

### Temporal Tracking Columns

| Table | Column | Data Type |
|-------|--------|----------|
| annual_report_fees_ca_openend | _timestampfrom | timestamp with time zone |
| annual_report_fees_ca_openend | _timestampto | timestamp with time zone |
| fee_levels_ca_openend | _timestampfrom | timestamp with time zone |
| fee_levels_ca_openend | _timestampto | timestamp with time zone |
| fund_attributes_ca_openend | _timestampfrom | timestamp with time zone |
| fund_attributes_ca_openend | _timestampto | timestamp with time zone |
| fund_flow_details_ca_openend | _timestampfrom | timestamp with time zone |
| fund_flow_details_ca_openend | _timestampto | timestamp with time zone |
| fund_level_net_assets_ca_openend | _timestampfrom | timestamp with time zone |
| fund_level_net_assets_ca_openend | _timestampto | timestamp with time zone |
| fund_manager_ca_openend | _timestampfrom | timestamp with time zone |
| fund_manager_ca_openend | _timestampto | timestamp with time zone |
| fund_share_class_basic_info_ca_openend | _timestampfrom | timestamp with time zone |
| fund_share_class_basic_info_ca_openend | _timestampto | timestamp with time zone |
| month_end_trailing_total_return_percentile_and_absolute_ranks_c | _timestampfrom | timestamp with time zone |
| month_end_trailing_total_return_percentile_and_absolute_ranks_c | _timestampto | timestamp with time zone |
| month_end_trailing_total_returns_ca_openend | _timestampfrom | timestamp with time zone |
| month_end_trailing_total_returns_ca_openend | _timestampto | timestamp with time zone |
| morningstar_rating_ca_openend | _timestampfrom | timestamp with time zone |
| morningstar_rating_ca_openend | _timestampto | timestamp with time zone |
| morningstar_rating_extended_performance_ca_openend | _timestampfrom | timestamp with time zone |
| morningstar_rating_extended_performance_ca_openend | _timestampto | timestamp with time zone |
| prospectus_fees_ca_openend | _timestampfrom | timestamp with time zone |
| prospectus_fees_ca_openend | _timestampto | timestamp with time zone |
| relative_risk_measure_prospectus_ca_openend | _timestampfrom | timestamp with time zone |
| relative_risk_measure_prospectus_ca_openend | _timestampto | timestamp with time zone |
| risk_measure_ca_openend | _timestampfrom | timestamp with time zone |
| risk_measure_ca_openend | _timestampto | timestamp with time zone |

### Summary

- **Total Date-Related Columns:** 69
- **Proper Date/Time Types:** 42
- **Text Fields with Date Names:** 27
- **Time-Series Columns:** 10
- **Report Date Columns:** 3
- **"As Of" Columns:** 3
- **Temporal Tracking Columns:** 28

