import React, { useEffect, RefObject, MutableRefObject } from 'react';
import T from 'prop-types';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// TODO: Token from config
mapboxgl.accessToken =
  'pk.eyJ1IjoiY292aWQtbmFzYSIsImEiOiJja2F6eHBobTUwMzVzMzFueGJuczF6ZzdhIn0.8va1fkyaWgM57_gZ2rBMMg';

const SingleMapContainer = styled.div`
  && {
    position: absolute;
    inset: 0;
  }
`;

interface SimpleMapProps {
  [key: string]: unknown;
  mapRef: MutableRefObject<mapboxgl.Map>;
  containerRef: RefObject<HTMLDivElement>;
  onLoad(e: mapboxgl.EventData): void;
  mapOptions: any;
}

export function SimpleMap(props: SimpleMapProps): JSX.Element {
  const { mapRef, containerRef, onLoad, mapOptions, ...rest } = props;

  useEffect(() => {
    const mbMap = new mapboxgl.Map({
      container: containerRef.current,
      ...mapOptions
    });

    mapRef.current = mbMap;

    // Add zoom controls.
    mbMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
    // Remove compass.
    document.querySelector('.mapboxgl-ctrl .mapboxgl-ctrl-compass').remove();

    onLoad && mbMap.once('load', onLoad);

    // Trigger a resize to handle flex layout quirks.
    setTimeout(() => mbMap.resize(), 1);

    return () => mbMap.remove();
    // Only use the props on mount. We don't want to update the map if they
    // change.
  }, []);

  return <SingleMapContainer ref={containerRef} {...rest} />;
}

SimpleMap.propTypes = {
  mapRef: T.shape({
    current: T.object
  }).isRequired,
  containerRef: T.shape({
    current: T.object
  }).isRequired,
  onLoad: T.func,
  mapOptions: T.object.isRequired
};
