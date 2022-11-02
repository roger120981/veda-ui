import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router';
import { Link } from 'react-router-dom';
import { media } from '@devseed-ui/theme-provider';
import { Button } from '@devseed-ui/button';
import { CollecticonPencil } from '@devseed-ui/collecticons';

import {
  analysisParams2QueryString,
  useAnalysisParams
} from './use-analysis-params';
import {
  requestStacDatasetsTimeseries,
  TimeseriesData,
  TIMESERIES_DATA_BASE_ID
} from './timeseries-data';
import ChartCard from './chart-card';
import AnalysisHeadActions, {
  DataMetric,
  dataMetrics
} from './analysis-head-actions';
import { LayoutProps } from '$components/common/layout-root';
import { CardList } from '$components/common/card';
import {
  Fold,
  FoldHeader,
  FoldHeadline,
  FoldTitle,
  FoldBody
} from '$components/common/fold';
import PageHeroAnalysis from '$components/analysis/page-hero-analysis';
import { resourceNotFound } from '$components/uhoh';
import { PageMainContent } from '$styles/page';
import { useThematicArea } from '$utils/thematics';
import { thematicAnalysisPath } from '$utils/routes';
import { formatDateRange } from '$utils/date';
import { pluralize } from '$utils/pluralize';
import { calcFeatArea } from '$components/common/aoi/utils';

const ChartCardList = styled(CardList)`
  > li {
    min-width: 0;
  }

  ${media.largeUp`
    grid-template-columns: repeat(2, 1fr);
  `}
`;

export default function AnalysisResults() {
  const thematic = useThematicArea();
  if (!thematic) throw resourceNotFound();

  const queryClient = useQueryClient();
  const [requestStatus, setRequestStatus] = useState<TimeseriesData[]>([]);
  const { params } = useAnalysisParams();
  const { start, end, datasetsLayers, aoi, errors } = params;

  const [activeMetrics, setActiveMetrics] = useState<DataMetric[]>(dataMetrics);

  useEffect(() => {
    if (!start || !end || !datasetsLayers || !aoi) return;

    setRequestStatus([]);
    queryClient.cancelQueries([TIMESERIES_DATA_BASE_ID]);
    const requester = requestStacDatasetsTimeseries({
      start,
      end,
      aoi,
      layers: datasetsLayers,
      queryClient
    });

    requester.on('data', (data, index) => {
      setRequestStatus((dataStore) =>
        Object.assign([], dataStore, {
          [index]: data
        })
      );
    });
  }, [queryClient, start, end, datasetsLayers, aoi]);

  // Textual description for the meta tags and element for the page hero.
  const descriptions = useMemo(() => {
    if (!start || !end || !datasetsLayers || !aoi)
      return { meta: '', page: '' };

    const dateLabel = formatDateRange(start, end);
    const area = calcFeatArea(aoi);
    const datasetCount = pluralize({
      singular: 'dataset',
      count: datasetsLayers.length,
      showCount: true
    });

    return {
      meta: `Covering ${datasetCount} over a ${area} km2 area from ${dateLabel}.`,
      page: (
        <>
          Covering <strong>{datasetCount}</strong> over a{' '}
          <strong>
            {area} km<sup>2</sup>
          </strong>{' '}
          area from <strong>{dateLabel}</strong>.
        </>
      )
    };
  }, [start, end, datasetsLayers, aoi]);

  if (errors?.length) {
    return <Navigate to={thematicAnalysisPath(thematic)} replace />;
  }

  const analysisParamsQs = analysisParams2QueryString({
    start,
    end,
    datasetsLayers,
    aoi
  });

  return (
    <PageMainContent>
      <LayoutProps
        title='Analysis'
        description={descriptions.meta}
        thumbnail={thematic.data.media?.src}
      />
      <PageHeroAnalysis
        title='Analysis'
        description={descriptions.page}
        isResults
        aoiFeature={aoi || undefined}
        renderActions={({ size }) => (
          <Button
            forwardedAs={Link}
            to={`${thematicAnalysisPath(thematic)}${analysisParamsQs}`}
            size={size}
            variation='achromic-outline'
          >
            <CollecticonPencil /> Refine
          </Button>
        )}
      />
      <Fold>
        <FoldHeader>
          <FoldHeadline>
            <FoldTitle>Results</FoldTitle>
          </FoldHeadline>
          <AnalysisHeadActions
            activeMetrics={activeMetrics}
            onMetricsChange={setActiveMetrics}
          />
        </FoldHeader>
        <FoldBody>
          {!!requestStatus.length && (
            <ChartCardList>
              {requestStatus.map((l) => (
                <li key={l.id}>
                  <ChartCard
                    title={l.name}
                    chartData={l}
                    activeMetrics={activeMetrics}
                  />
                </li>
              ))}
            </ChartCardList>
          )}
        </FoldBody>
      </Fold>
    </PageMainContent>
  );
}
