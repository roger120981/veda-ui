import { useQuery } from '@tanstack/react-query';
import { AnySourceImpl, Layer, Style } from 'mapbox-gl';
import { useEffect, useState } from 'react';
import {
  BasemapId,
  BASEMAP_STYLES,
  getStyleUrl,
  GROUPS_BY_OPTION
} from '../controls/map-options/basemap';
import { useMapStyle } from '../styles';
import { ExtendedLayer } from '../types';

interface BasemapProps {
  basemapStyleId?: BasemapId;
  labelsOption?: boolean;
  boundariesOption?: boolean;
}

function mapGroupNameToGroupId(
  groupNames: string[],
  mapboxGroups: Record<string, { name: string }>
) {
  const groupsAsArray = Object.entries(mapboxGroups);

  return groupNames.map((groupName) => {
    return groupsAsArray.find(([, group]) => group.name === groupName)?.[0];
  });
}

export function Basemap({
  basemapStyleId = 'satellite',
  labelsOption = true,
  boundariesOption = true
}: BasemapProps) {
  const { updateStyle } = useMapStyle();

  const [baseStyle, setBaseStyle] = useState<Style | undefined>(undefined);

  const { data: styleJson } = useQuery(
    ['basemap', basemapStyleId],
    async ({ signal }) => {
      const mapboxId = basemapStyleId
        ? BASEMAP_STYLES.find((b) => b.id === basemapStyleId)!.mapboxId
        : BASEMAP_STYLES[0].mapboxId;

      try {
        const url = getStyleUrl(mapboxId);
        const styleRaw = await fetch(url, { signal });
        const styleJson = await styleRaw.json();
        return styleJson;
      } catch (e) {
        /* eslint-disable-next-line no-console */
        console.error(e);
      }
    }
  );

  useEffect(() => {
    setBaseStyle(styleJson as Style);
  }, [styleJson]);

  // Apply labels and boundaries options, by setting visibility on related
  // layers For simplicity's sake, the Mapbox layer group (as set in Mapbox
  // Studio) is used to determine whether a layer is a labels layer or
  // boundaries or none of those.
  useEffect(() => {
    if (!baseStyle) return;

    // Mapbox creates a groupId that can't be changed, so we need to get
    // this id from the list of groups in the metadata section of the style.
    const labelsGroupIds = mapGroupNameToGroupId(
      GROUPS_BY_OPTION.labels,
      baseStyle.metadata['mapbox:groups']
    );
    const boundariesGroupIds = mapGroupNameToGroupId(
      GROUPS_BY_OPTION.boundaries,
      baseStyle.metadata['mapbox:groups']
    );

    const layers = baseStyle.layers.map((layer) => {
      const layerGroup = (layer as Layer).metadata?.['mapbox:group'];

      if (layerGroup) {
        const isLabelsLayer = labelsGroupIds.includes(layerGroup);
        const isBoundariesLayer = boundariesGroupIds.includes(layerGroup);

        const visibility =
          (isLabelsLayer && labelsOption) ||
          (isBoundariesLayer && boundariesOption)
            ? 'visible'
            : 'none';

        if (isLabelsLayer || isBoundariesLayer) {
          return {
            ...layer,
            layout: {
              ...(layer as Layer).layout,
              visibility
            },
            metadata: {
              layerOrderPosition: 'basemap-foreground'
            }
          };
        }
        return { ...layer };
      }
      return { ...layer };
    });

    updateStyle({
      generatorId: 'basemap',
      sources: baseStyle.sources as Record<string, AnySourceImpl>,
      layers: layers as ExtendedLayer[]
    });
  }, [updateStyle, labelsOption, boundariesOption, baseStyle]);

  return null;
}
