import React from 'react';
import styled from 'styled-components';
import { DatasetData, datasets } from 'veda';
import { Subtitle } from '@devseed-ui/typography';

import BrowseControls from './browse-controls';
import { useBrowserControls } from './use-browse-controls';

import { LayoutProps } from '$components/common/layout-root';
import PageHero from '$components/common/page-hero';
import { Fold, FoldHeader, FoldTitle } from '$components/common/fold';
import { Card, CardList } from '$components/common/card';
import EmptyHub from '$components/common/empty-hub';
import { PageMainContent } from '$styles/page';
import { DATASETS_PATH, getDatasetPath } from '$utils/routes';
import TextHighlight from '$components/common/text-highlight';
import Pluralize from '$utils/pluralize';

const allDatasets = Object.values(datasets).map((d) => d!.data);

const DatasetCount = styled(Subtitle)`
  grid-column: 1 / -1;
  text-transform: uppercase;
`;

const topicsOptions = [
  {
    id: 'all',
    name: 'All Topics'
  },
  // TODO: human readable values for Taxonomies
  ...Array.from(new Set(allDatasets.flatMap((d) => d.thematics))).map((t) => ({
    id: t,
    name: t
  })),
  {
    id: 'eis',
    name: 'Earth Information Systems'
  }
];

const sourcesOptions = [
  {
    id: 'all',
    name: 'All sources'
  },
  {
    id: 'eis',
    name: 'Earth Information Systems'
  }
];

const prepareDatasets = (data: DatasetData[], options) => {
  const { sortField, sortDir, search, topic, source } = options;

  let filtered = [...data];

  // Does the free text search appear in specific fields?
  if (search.length >= 3) {
    filtered = filtered.filter(
      (d) =>
        d.name.includes(search) ||
        d.description.includes(search) ||
        d.layers.some((l) => l.stacCol.includes(search))
    );
  }

  if (topic !== 'all') {
    filtered = filtered.filter((d) => d.thematics.includes(topic));
  }

  if (source !== 'all') {
    // TODO: Filter source
  }

  /* eslint-disable-next-line fp/no-mutating-methods */
  filtered.sort((a, b) => {
    if (!a[sortField]) return Infinity;

    return a[sortField]?.localeCompare(b[sortField]);
  });

  if (sortDir === 'desc') {
    /* eslint-disable-next-line fp/no-mutating-methods */
    filtered.reverse();
  }

  return filtered;
};

function DataCatalog() {
  const controlVars = useBrowserControls({
    topicsOptions,
    sourcesOptions
  });

  const { topic, source, sortField, sortDir } = controlVars;
  const search = controlVars.search ?? '';

  const displayDatasets = prepareDatasets(allDatasets, {
    search,
    topic,
    source,
    sortField,
    sortDir
  });

  return (
    <PageMainContent>
      <LayoutProps
        title='Data Catalog'
        description='This dashboard explores key indicators to track and compare changes over time.'
      />
      <PageHero
        title='Data Catalog'
        description='This dashboard explores key indicators to track and compare changes over time.'
      />
      <Fold>
        <FoldHeader>
          <FoldTitle>Browse</FoldTitle>
        </FoldHeader>

        <BrowseControls
          {...controlVars}
          topicsOptions={topicsOptions}
          sourcesOptions={sourcesOptions}
        />

        <DatasetCount>
          Showing{' '}
          <Pluralize
            singular='dataset'
            plural='datasets'
            count={displayDatasets.length}
            showCount={true}
          />
        </DatasetCount>

        {displayDatasets.length ? (
          <CardList>
            {displayDatasets.map((t) => (
              <li key={t.id}>
                <Card
                  cardType='cover'
                  linkLabel='View more'
                  linkTo={getDatasetPath(t)}
                  title={
                    <TextHighlight value={search} disabled={search.length < 3}>
                      {t.name}
                    </TextHighlight>
                  }
                  parentName='Dataset'
                  parentTo={DATASETS_PATH}
                  description={
                    <TextHighlight value={search} disabled={search.length < 3}>
                      {t.description}
                    </TextHighlight>
                  }
                  imgSrc={t.media?.src}
                  imgAlt={t.media?.alt}
                />
              </li>
            ))}
          </CardList>
        ) : (
          <EmptyHub>
            There are no datasets to show with the selected filters
          </EmptyHub>
        )}
      </Fold>
    </PageMainContent>
  );
}

export default DataCatalog;
