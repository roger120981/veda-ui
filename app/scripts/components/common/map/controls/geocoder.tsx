import { useCallback } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import { useControl } from 'react-map-gl';


function getZoomFromBbox(bbox: [number, number, number, number]): number {
  const latMax = Math.max(bbox[3], bbox[1]);
  const lngMax = Math.max(bbox[2], bbox[0]);
  const latMin = Math.min(bbox[3], bbox[1]);
  const lngMin = Math.min(bbox[2], bbox[0]);
  const maxDiff = Math.max(latMax - latMin, lngMax - lngMin);
  if (maxDiff < 360 / Math.pow(2, 20)) {
    return 21;
} else {
    const zoomLevel = Math.floor(-1*( (Math.log(maxDiff)/Math.log(2)) - (Math.log(360)/Math.log(2))));
    if (zoomLevel < 1) return 1;
    else return zoomLevel;
  }
}

export default function GeocoderControl() {

  const handleGeocoderResult = useCallback((map) => ({ result }) => {
    const zoom = result.bbox? getZoomFromBbox(result.bbox): 14;
    map.flyTo({
      center: result.center,
      zoom
    });
  }, []);
  
  useControl(
    ({ map }) => {
      const geocoder = new MapboxGeocoder({
        accessToken: process.env.MAPBOX_TOKEN,
        marker: false,
        collapsed: true,
        flyTo: false
      });
      geocoder.on('result', handleGeocoderResult(map));
      return geocoder;
    },
    {
      position: 'top-right'
    }
  );

  return null;
}
