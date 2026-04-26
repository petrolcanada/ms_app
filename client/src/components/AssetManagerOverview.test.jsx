import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AssetManagerOverview from './AssetManagerOverview';
import useAssetManagers from '../hooks/useAssetManagers';
import useAssetManagerOverview from '../hooks/useAssetManagerOverview';

jest.mock('../hooks/useAssetManagers', () => jest.fn());
jest.mock('../hooks/useAssetManagerOverview', () => jest.fn());
jest.mock('./SEO', () => () => null);
jest.mock('./charts/HorizontalBarChartPanel', () => ({ title, subtitle }) => (
  <div>
    <span>{title}</span>
    <span>{subtitle}</span>
  </div>
));
jest.mock('./AsOfDateSelector', () => ({ value, onChange }) => (
  <select aria-label="As of" value={value} onChange={(event) => onChange(event.target.value)}>
    <option value="">Latest</option>
    <option value="2026-03-31">Mar 31, 2026</option>
  </select>
));
jest.mock('./StatCard', () => ({ label, value }) => (
  <div>
    <span>{label}</span>
    <span>{value}</span>
  </div>
));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/asset-managers/RBC%20Global%20Asset%20Management']}>
      <Routes>
        <Route path="/asset-managers/:name" element={<AssetManagerOverview />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  useAssetManagers.mockReturnValue({
    data: ['AGF Investments Inc', 'RBC Global Asset Management'],
  });
});

test('renders loading state', () => {
  useAssetManagerOverview.mockReturnValue({ isLoading: true });

  renderPage();

  expect(screen.getAllByText('RBC Global Asset Management').length).toBeGreaterThan(0);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});

test('renders empty state', () => {
  useAssetManagerOverview.mockReturnValue({
    data: { totals: { fundCount: 0 }, categories: [], leaders: {} },
    isLoading: false,
    isError: false,
  });

  renderPage();

  expect(screen.getByText('No asset manager data is available for this date.')).toBeInTheDocument();
});

test('renders overview metrics and category footprint', () => {
  useAssetManagerOverview.mockReturnValue({
    isLoading: false,
    isError: false,
    data: {
      assetManager: 'RBC Global Asset Management',
      asofDate: '2026-03-31',
      totals: {
        fundCount: 2,
        categoryCount: 1,
        totalAum: 1500000000,
        avgReturn1yr: 8.2,
        avgRating: 4.1,
        medianMer: 0.72,
        flow1m: 1000000,
        flowYtd: 2500000,
        flow1yr: 10000000,
      },
      relativeQuality: {
        avgExcessReturn1yr: 1.2,
        avgRank1yr: 22,
        topQuartileCount: 1,
        topQuartileShare: 50,
      },
      categories: [
        {
          categorycode: 'CAEQ',
          categoryname: 'Canadian Equity',
          fundCount: 2,
          totalAum: 1500000000,
          aumShare: 100,
          excessReturn1yr: 1.2,
          avgRank1yr: 22,
          topQuartileCount: 1,
          flow1m: 1000000,
        },
      ],
      leaders: {
        bestOutperformers: [
          {
            _id: 'F1',
            fundname: 'RBC Canadian Equity Fund',
            categoryname: 'Canadian Equity',
            excessReturn1yr: 2.4,
          },
        ],
        bestRanked: [],
        largestFunds: [],
        largestInflows: [],
        largestOutflows: [],
        strongestCategories: [],
      },
    },
  });

  renderPage();

  expect(screen.getByText('Category footprint')).toBeInTheDocument();
  expect(screen.getAllByText('Canadian Equity')[0]).toBeInTheDocument();
  expect(screen.getByText('RBC Canadian Equity Fund')).toBeInTheDocument();
  expect(screen.getAllByText('+1.2%')[0]).toBeInTheDocument();
});

test('sorts the category footprint table when a header is clicked', () => {
  useAssetManagerOverview.mockReturnValue({
    isLoading: false,
    isError: false,
    data: {
      assetManager: 'RBC Global Asset Management',
      asofDate: '2026-03-31',
      totals: {
        fundCount: 3,
        categoryCount: 2,
        totalAum: 2000000000,
        avgReturn1yr: 7.8,
        avgRating: 4.0,
        medianMer: 0.72,
        flow1m: 1200000,
        flowYtd: 2400000,
        flow1yr: 9000000,
      },
      relativeQuality: {
        avgExcessReturn1yr: 1.6,
        avgRank1yr: 21,
        topQuartileCount: 2,
        topQuartileShare: 67,
      },
      categories: [
        {
          categorycode: 'CAEQ',
          categoryname: 'Canadian Equity',
          fundCount: 2,
          totalAum: 1500000000,
          aumShare: 75,
          excessReturn1yr: 1.2,
          avgRank1yr: 22,
          topQuartileCount: 1,
          flow1m: 1000000,
        },
        {
          categorycode: 'GLEQ',
          categoryname: 'Global Equity',
          fundCount: 1,
          totalAum: 500000000,
          aumShare: 25,
          excessReturn1yr: 2.4,
          avgRank1yr: 14,
          topQuartileCount: 1,
          flow1m: 200000,
        },
      ],
      leaders: {
        bestOutperformers: [],
        bestRanked: [],
        largestFunds: [],
        largestInflows: [],
        largestOutflows: [],
        strongestCategories: [],
      },
    },
  });

  renderPage();

  const getCategoryRows = () => screen.getAllByRole('row').slice(1, 3);

  expect(within(getCategoryRows()[0]).getByText('Canadian Equity')).toBeInTheDocument();
  expect(within(getCategoryRows()[1]).getByText('Global Equity')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '1Y vs Cat' }));

  expect(within(getCategoryRows()[0]).getByText('Global Equity')).toBeInTheDocument();
  expect(within(getCategoryRows()[1]).getByText('Canadian Equity')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '1Y vs Cat' }));

  expect(within(getCategoryRows()[0]).getByText('Canadian Equity')).toBeInTheDocument();
  expect(within(getCategoryRows()[1]).getByText('Global Equity')).toBeInTheDocument();
});
