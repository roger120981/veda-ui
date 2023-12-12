import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { extent, scaleLinear, ScaleTime, line, ScaleLinear } from 'd3';
import { useAtomValue } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';

import { isExpandedAtom } from '../../atoms/timeline';
import { RIGHT_AXIS_SPACE } from '../../constants';
import { DatasetTrackMessage } from './dataset-track-message';
import { DataMetric } from './analysis-metrics';

import { getNumForChart } from '$components/common/chart/utils';
import {
  TimelineDatasetAnalysisSuccess,
  TimelineDatasetSuccess
} from '$components/exploration/types.d.ts';

const CHART_MARGIN = 8;

interface DatasetChartProps {
  width: number;
  xScaled: ScaleTime<number, number>;
  isVisible: boolean;
  dataset: TimelineDatasetSuccess;
  activeMetrics: DataMetric[];
  highlightDate?: Date;
}

export function DatasetChart(props: DatasetChartProps) {
  const { xScaled, width, isVisible, dataset, activeMetrics, highlightDate } =
    props;

  const analysisData = dataset.analysis as TimelineDatasetAnalysisSuccess;
  const timeseries = analysisData.data.timeseries;

  const theme = useTheme();

  const isExpanded = useAtomValue(isExpandedAtom);

  const height = isExpanded ? 180 : 70;

  const yExtent = useMemo(
    () =>
      extent(
        // Extent of all active metrics.
        timeseries.flatMap((d) => extent(activeMetrics.map((m) => d[m.id])))
      ) as [undefined, undefined] | [number, number],
    [timeseries, activeMetrics]
  );

  const y = useMemo(() => {
    const [min = 0, max = 0] = yExtent;
    return (
      scaleLinear()
        // Add 5% buffer
        .domain([min * 0.95, max * 1.05])
        .range([height - CHART_MARGIN * 2, 0])
    );
  }, [yExtent, height]);

  return (
    <div>
      {!activeMetrics.length && (
        <DatasetTrackMessage>
          There are no active metrics to visualize.
        </DatasetTrackMessage>
      )}
      <svg width={width + RIGHT_AXIS_SPACE} height={height}>
        <clipPath id='data-clip'>
          <rect width={width} height={height} />
        </clipPath>

        <g transform={`translate(0, ${CHART_MARGIN})`}>
          <AxisGrid
            yLabel={dataset.data.legend?.unit?.label}
            y={y}
            width={width}
            height={height}
            isVisible={isVisible}
            isExpanded={isExpanded}
          />
        </g>

        <g clipPath='url(#data-clip)'>
          <g transform={`translate(0, ${CHART_MARGIN})`}>
            {activeMetrics.map(
              (metric) =>
                timeseries.some((d) => !isNaN(d[metric.id])) && (
                  <DataLine
                    key={metric.id}
                    x={xScaled}
                    y={y}
                    prop={metric.id}
                    data={timeseries}
                    color={theme.color?.[metric.themeColor]}
                    isVisible={isVisible}
                    isExpanded={isExpanded}
                    highlightDate={highlightDate}
                  />
                )
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}

interface DateLineProps {
  x: ScaleTime<number, number>;
  y: ScaleLinear<number, number>;
  prop: string;
  data: any[];
  color: string;
  isVisible: boolean;
  isExpanded: boolean;
  highlightDate?: Date;
}

function DataLine(props: DateLineProps) {
  const { x, y, prop, data, color, isVisible, isExpanded, highlightDate } =
    props;

  const path = useMemo(
    () =>
      line<Record<string, Date | number | null>>()
        .defined((d) => d[prop] !== null)
        .x((d) => x(d.date ?? 0))
        .y((d) => y(d[prop] as number))(data),
    [x, y, prop, data]
  );

  const maxOpacity = isVisible ? 1 : 0.25;

  if (!path) return null;

  return (
    <g>
      <motion.path
        initial={{ opacity: 0 }}
        animate={{ opacity: maxOpacity }}
        transition={{ duration: 0.16 }}
        d={path}
        fill='none'
        stroke={color}
      />
      {data.map((d) => {
        if (typeof d[prop] !== 'number') return false;

        const highlight =
          isVisible && highlightDate?.getTime() === d.date.getTime();

        return (
          <motion.circle
            initial={{ opacity: 0 }}
            animate={{ opacity: isExpanded ? maxOpacity : 0 }}
            transition={{ duration: 0.16 }}
            key={d.date}
            cx={x(d.date)}
            cy={y(d[prop])}
            r={highlight ? 4 : 3}
            fill={highlight ? color : '#fff'}
            stroke={color}
          />
        );
      })}
    </g>
  );
}

interface AxisGridProps {
  y: ScaleLinear<number, number>;
  width: number;
  height: number;
  yLabel?: string;
  isVisible: boolean;
  isExpanded: boolean;
}

function AxisGrid(props: AxisGridProps) {
  const { y, width, height, isVisible, isExpanded, yLabel } = props;

  const theme = useTheme();

  const ticks = y.ticks(5);

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          {yLabel && (
            <text
              y={width + RIGHT_AXIS_SPACE - 20}
              x={-height / 2}
              transform='rotate(-90)'
              textAnchor='middle'
              fontSize='0.75rem'
              fill={theme.color?.base}
            >
              {yLabel}
            </text>
          )}
          {ticks.map((tick) => (
            <React.Fragment key={tick}>
              <line
                key={tick}
                x1={0}
                x2={width + 6}
                y1={y(tick)}
                y2={y(tick)}
                stroke={theme.color?.['base-100']}
                strokeOpacity={isVisible ? 1 : 0.5}
              />
              <text
                x={width + 8}
                y={y(tick)}
                fontSize='0.75rem'
                dy='0.25em'
                fill={theme.color?.base}
                fillOpacity={isVisible ? 1 : 0.5}
              >
                {getNumForChart(tick)}
              </text>
            </React.Fragment>
          ))}
        </motion.g>
      )}
    </AnimatePresence>
  );
}