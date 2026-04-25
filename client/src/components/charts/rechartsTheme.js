import { designTokens } from '../../design/tokens';

export const chartTheme = designTokens.chart;

export const chartGridStyle = chartTheme.grid;
export const axisStyle = chartTheme.axis;
export const defaultChartMargin = chartTheme.margin;

export const performanceSeriesStyles = {
  fund: {
    stroke: chartTheme.colors.primary,
    strokeWidth: 4,
  },
  category: {
    stroke: chartTheme.colors.comparison,
    strokeWidth: 2,
    opacity: 0.9,
  },
};

export default chartTheme;
