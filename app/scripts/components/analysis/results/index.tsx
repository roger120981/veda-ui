import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router';
import { useTheme } from 'styled-components';

import {
  Dropdown,
  DropMenu,
  DropMenuItem,
  DropTitle
} from '@devseed-ui/dropdown';
import { Button } from '@devseed-ui/button';
import {
  Toolbar,
  ToolbarIconButton,
  VerticalDivider
} from '@devseed-ui/toolbar';
import {
  CollecticonChevronDownSmall,
  CollecticonCircleInformation,
  CollecticonDownload2
} from '@devseed-ui/collecticons';

import { LayoutProps } from '$components/common/layout-root';
import {
  CardList,
  CardSelf,
  CardHeader,
  CardHeadline,
  CardTitle,
  CardActions,
  CardBody
} from '$components/common/card';
import {
  Fold,
  FoldHeader,
  FoldHeadline,
  FoldHeadActions,
  FoldTitle,
  FoldBody
} from '$components/common/fold';

import PageHeroAnalysis from '$components/analysis/page-hero-analysis';
import { resourceNotFound } from '$components/uhoh';

import { PageMainContent } from '$styles/page';
import {
  Legend,
  LegendTitle,
  LegendList,
  LegendSwatch,
  LegendLabel
} from '$styles/infographics';

import { useThematicArea } from '$utils/thematics';
import { thematicAnalysisPath } from '$utils/routes';
import { useAnalysisParams } from './use-analysis-params';
import {
  requestStacDatasetsTimeseries,
  TimeseriesData,
  TIMESERIES_DATA_BASE_ID
} from './timeseries-data';

export default function AnalysisResults() {
  const thematic = useThematicArea();
  if (!thematic) throw resourceNotFound();

  const theme = useTheme();

  const queryClient = useQueryClient();
  const [requestStatus, setRequestStatus] = useState<TimeseriesData[]>([]);
  const { date, datasetsLayers, aoi, errors } = useAnalysisParams();

  useEffect(() => {
    if (!date.start || !datasetsLayers || !aoi) return;

    setRequestStatus([]);
    queryClient.cancelQueries([TIMESERIES_DATA_BASE_ID]);
    const requester = requestStacDatasetsTimeseries({
      date,
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
  }, [queryClient, date, datasetsLayers, aoi]);

  if (errors) {
    return <Navigate to={thematicAnalysisPath(thematic)} replace />;
  }

  return (
    <PageMainContent>
      <LayoutProps
        title='Analysis'
        description='Covering 8 datasets over a 50 M km2 area from Apr 7 to Sep 7, 2022.'
        thumbnail={thematic.data.media?.src}
      />
      <PageHeroAnalysis
        title='Analysis'
        description='Covering 8 datasets over a 50 M km2 area from Apr 7 to Sep 7, 2022.'
      />
      <Fold>
        <FoldHeader>
          <FoldHeadline>
            <FoldTitle>Results</FoldTitle>
          </FoldHeadline>
          <FoldHeadActions>
            <Legend>
              <LegendTitle>Legend</LegendTitle>
              <LegendList>
                <LegendSwatch>
                  <svg height='8' width='8'>
                    <title>{theme.color.primary}</title>
                    <circle cx='4' cy='4' r='4' fill={theme.color.primary} />
                  </svg>
                </LegendSwatch>
                <LegendLabel>Min</LegendLabel>

                <LegendSwatch>
                  <svg height='8' width='8'>
                    <title>{theme.color.primary}</title>
                    <circle cx='4' cy='4' r='4' fill={theme.color.primary} />
                  </svg>
                </LegendSwatch>
                <LegendLabel>Average</LegendLabel>

                <LegendSwatch>
                  <svg height='8' width='8'>
                    <title>{theme.color.primary}</title>
                    <circle cx='4' cy='4' r='4' fill={theme.color.primary} />
                  </svg>
                </LegendSwatch>
                <LegendLabel>Max</LegendLabel>
              </LegendList>
            </Legend>

            <Dropdown
              alignment='right'
              triggerElement={(props) => (
                <Button variation='base-text' {...props}>
                  View <CollecticonChevronDownSmall />
                </Button>
              )}
            >
              <DropTitle>View options</DropTitle>
              <DropMenu>
                <li>
                  <DropMenuItem href='#'>Option A</DropMenuItem>
                </li>
                <li>
                  <DropMenuItem href='#'>Option B</DropMenuItem>
                </li>
                <li>
                  <DropMenuItem href='#'>Option C</DropMenuItem>
                </li>
              </DropMenu>
            </Dropdown>
          </FoldHeadActions>
        </FoldHeader>
        <FoldBody>
          {!!requestStatus.length && (
            <CardList>
              {requestStatus.map((l) => (
                <li key={l.id}>
                  <CardSelf>
                    <CardHeader>
                      <CardHeadline>
                        <CardTitle>{l.name}</CardTitle>
                      </CardHeadline>
                      <CardActions>
                        <Toolbar size='small'>
                          <ToolbarIconButton variation='base-text'>
                            <CollecticonDownload2 title='Download' meaningful />
                          </ToolbarIconButton>
                          <VerticalDivider variation='dark' />
                          <ToolbarIconButton variation='base-text'>
                            <CollecticonCircleInformation
                              title='More info'
                              meaningful
                            />
                          </ToolbarIconButton>
                        </Toolbar>
                      </CardActions>
                    </CardHeader>
                    <CardBody>
                      {l.status === 'errored' && (
                        <p>Something went wrong: {l.error.message}</p>
                      )}

                      {l.status === 'loading' && (
                        <p>
                          {l.meta.loaded} of {l.meta.total} loaded. Wait
                        </p>
                      )}

                      {l.status === 'succeeded' &&
                        !!l.data.timeseries.length && (
                          <p>All good. Can show data now.</p>
                        )}

                      {l.status === 'succeeded' &&
                        !l.data.timeseries.length && (
                          <p>There is no data available</p>
                        )}
                    </CardBody>
                  </CardSelf>
                </li>
              ))}
            </CardList>
          )}
        </FoldBody>
      </Fold>
    </PageMainContent>
  );
}
