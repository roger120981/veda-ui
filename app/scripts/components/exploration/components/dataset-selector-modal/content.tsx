import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { glsp, themeVal, media } from '@devseed-ui/theme-provider';
import {
  CollecticonPlus,
  CollecticonTickSmall,
  iconDataURI
} from '@devseed-ui/collecticons';
import { DatasetData } from 'veda';
import { DatasetLayerCardProps } from './';

import { DatasetClassification } from '$components/common/dataset-classification';
import EmptyHub from '$components/common/empty-hub';
import { Card } from '$components/common/card';
import { CardListGrid, CardMeta, CardTopicsList } from '$components/common/card/styles';
import TextHighlight from '$components/common/text-highlight';
import { CardSourcesList } from '$components/common/card-sources';
import { CollecticonDatasetLayers } from '$components/common/icons/dataset-layers';
import { DATASETS_PATH, getDatasetPath } from '$utils/routes';
import {
  getTaxonomy,
  TAXONOMY_SOURCE,
  TAXONOMY_TOPICS
} from '$utils/veda-data';
import { Pill } from '$styles/pill';

const DatasetContainer = styled.div`
  height: auto;
  display: flex;
  margin-bottom: ${glsp(2)};

  ${CardListGrid} {
    width: 100%;
  }

  ${EmptyHub} {
    flex-grow: 1;
  }
`;

const SingleDataset = styled.div`
  padding-bottom : ${glsp(2)};
  &:not(:last-child) {
    border-bottom : 1px solid ${themeVal('color.base-200')};
  }
`;

const DatasetSelectedLayer = styled.div`
  background-color: ${themeVal('color.primary')};
  border-radius: ${themeVal('shape.ellipsoid')};
  padding: 0 ${glsp(0.5)};
  color: ${themeVal('color.surface')};
`;

const DatasetHeadline = styled.div`
  display: flex;
  gap: ${glsp(1)};
  height: 1.5rem;
  margin-bottom: ${glsp(1)};
`;
const DatasetDescription = styled.p`
  ${media.largeUp`
    width: 66%;
  `}
`;

const DatasetIntro = styled.div`
  padding: ${glsp(1)} 0;
`;

const EmptyInfoDiv = styled.div`
  width: 70%;
  text-align: center;
`;

export const ParentDatasetTitle = styled.h2<{size?: string}>`
  color: ${themeVal('color.primary')};
  text-align: left;
  font-size: ${(props => props.size=='small'? '0.75rem': '1rem')};
  line-height: 0.75rem;
  font-weight: normal; ${(props => props.size=='small'? '400': 'normal')};
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
  p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  > svg {
    fill: ${themeVal('color.primary')};
    min-width: ${(props => props.size=='small' ? '1rem': 'auto')};
  }
`;

const WarningPill = styled(Pill)`
  margin-left: 8px;
`;

interface ModalContentComponentProps {
  search: string;
  selectedIds: string[];
  displayDatasets?: (DatasetData & {
    countSelectedLayers: number;
  })[];
  onCheck: (id: string, currentDataset?: DatasetData & {countSelectedLayers: number}) => void;
}

export default function ModalContentComponent(props:ModalContentComponentProps) {
  const { search, selectedIds, displayDatasets, onCheck } = props;
  const exclusiveSourceWarning = "Can only be analyzed with layers from the same source";

  return(
  <DatasetContainer>
    {displayDatasets?.length ? (
      <div>
      {displayDatasets.map(currentDataset => (
        <SingleDataset key={currentDataset.id}>
          <DatasetIntro>
            <DatasetHeadline>
            <ParentDatasetTitle>
              <CollecticonDatasetLayers /> {currentDataset.name}
              {
                currentDataset.sourceExclusive && (
                  <WarningPill variation='warning'>
                    {exclusiveSourceWarning}
                  </WarningPill>
                )
              }
            </ParentDatasetTitle>
            {currentDataset.countSelectedLayers > 0 && <DatasetSelectedLayer><span>{currentDataset.countSelectedLayers} selected </span> </DatasetSelectedLayer>}
            </DatasetHeadline>
            <DatasetDescription>
              <TextHighlight
                value={search}
                disabled={search.length < 3}
              >
                {currentDataset.description}
              </TextHighlight>
            </DatasetDescription>
          </DatasetIntro>
        <CardListGrid key={currentDataset.id}>
        {currentDataset.layers.map((datasetLayer) => {
          return (
            <li key={datasetLayer.id}>
              <DatasetLayerCard
                searchTerm={search}
                layer={datasetLayer}
                parent={currentDataset}
                selected={selectedIds.includes(datasetLayer.id)}
                onDatasetClick={() => onCheck(datasetLayer.id, currentDataset)}
              />
            </li>
          );
        })}
        </CardListGrid>
        </SingleDataset>
      ))}
      </div>
    ) : (
      <EmptyHub>
        <EmptyInfoDiv>
          <p>There are no datasets to show with the selected filters.</p><br />
          <p>This tool allows the exploration and analysis of time-series datasets in raster format. For a comprehensive list of available datasets, please visit the <Link to={DATASETS_PATH} target='_blank'>Data Catalog</Link>.</p>
        </EmptyInfoDiv>
      </EmptyHub>
    )}
  </DatasetContainer>
        );
}

const LayerCard = styled(Card)<{ checked: boolean }>`
  outline: 4px solid transparent;
  ${({ checked }) =>
    checked &&
    css`
      outline-color: ${themeVal('color.primary')};
    `}

  &::before {
    content: '';
    position: absolute;
    top: 22%;
    left: 50%;
    height: 3rem;
    min-width: 3rem;
    transform: translate(-50%, -50%);
    padding: ${glsp(0.5, 1, 0.5, 1)};
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${themeVal('color.primary')};
    border-radius: ${themeVal('shape.ellipsoid')};
    font-weight: ${themeVal('type.base.bold')};
    line-height: 1rem;
    background-image: url(${({ theme }) =>
      iconDataURI(CollecticonPlus, {
        color: theme.color?.surface,
        size: 'large'
      })});
    background-repeat: no-repeat;
    background-position: 0.75rem center;
    pointer-events: none;
    transition: all 0.16s ease-in-out;
    opacity: 0;
  }

  &:hover ::before {
    opacity: 1;
  }

  ${({ checked }) =>
    checked &&
    css`
      &:before {
        opacity: 1;
        z-index: 10;
        content: 'Selected';
        color: ${themeVal('color.surface')};
        padding-left: 2.75rem;
        background-image: url(${({ theme }) =>
          iconDataURI(CollecticonTickSmall, {
            color: theme.color?.surface,
            size: 'large'
          })});
        background-color: ${themeVal('color.base')};
      }
      &:hover ::before {
        background-color: ${themeVal('color.primary')};
      }
    `}
`;

function DatasetLayerCard(props: DatasetLayerCardProps) {
  const { parent, layer, onDatasetClick, selected, searchTerm } = props;

  const topics = getTaxonomy(parent, TAXONOMY_TOPICS)?.values;
  const sources = getTaxonomy(parent, TAXONOMY_SOURCE)?.values;
  return (
    <LayerCard
      cardType='classic'
      checked={selected}
      overline={
        <CardMeta>
          <DatasetClassification dataset={parent} />
          <CardSourcesList
            sources={sources}
          />
        </CardMeta>
      }
      linkTo={getDatasetPath(parent)}
      linkLabel='View dataset'
      onLinkClick={(e) => {
        e.preventDefault();
        onDatasetClick();
      }}
      title={
        <TextHighlight value={searchTerm} disabled={searchTerm.length < 3}>
          {layer.name}
        </TextHighlight>
      }
      description={<TextHighlight value={searchTerm} disabled={searchTerm.length < 3}>{layer.description}</TextHighlight>}
      imgSrc={layer.media?.src ?? parent.media?.src}
      imgAlt={layer.media?.alt ?? parent.media?.alt}
      footerContent={
        <>
          {topics?.length ? (
            <CardTopicsList>
              <dt>Topics</dt>
              {topics.map((t) => (
                <dd key={t.id}>
                  <Pill variation='primary'>
                    <TextHighlight
                      value={searchTerm}
                      disabled={searchTerm.length < 3}
                    >
                      {t.name}
                    </TextHighlight>
                  </Pill>
                </dd>
              ))}
            </CardTopicsList>
          ) : null}
        </>
      }
    />
  );
}