import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Taxonomy } from 'veda';
import SearchField from '$components/common/search-field';
import CheckableFilters, { OptionItem } from '$components/common/form/checkable-filter';
import { Actions, useBrowserControls } from '$components/common/browse-controls/use-browse-controls';
import { useSlidingStickyHeader, HEADER_TRANSITION_DURATION } from '$utils/use-sliding-sticky-header';

const ControlsWrapper = styled.div<{ widthValue?: string; heightValue?: string; topValue: string }>`
  min-width: 20rem;
  width: ${props => props.widthValue ?? '20rem'};
  position: sticky;
  top: calc(${props => props.topValue} + 1rem);
  height: ${props => props.heightValue};
  transition: top ${HEADER_TRANSITION_DURATION}ms ease-out;
`;

interface FiltersMenuProps extends ReturnType<typeof useBrowserControls> {
  taxonomiesOptions: Taxonomy[];
  allSelected: OptionItem[];
  clearedTagItem?: OptionItem;
  setClearedTagItem?: React.Dispatch<React.SetStateAction<OptionItem | undefined>>;
  width?: string;
  onChangeToFilters?: (item: OptionItem, action: 'add' | 'remove') => void;
}

export default function FiltersControl(props: FiltersMenuProps) {
  const {
    allSelected,
    onAction,
    taxonomiesOptions,
    search,
    width,
    onChangeToFilters,
    clearedTagItem,
    setClearedTagItem
  } = props;

  const controlsRef = useRef<HTMLDivElement>(null);
  const [controlsHeight, setControlsHeight] =  useState<number>(0);
  const { isHeaderHidden, wrapperHeight } = useSlidingStickyHeader();

  const handleChanges = useCallback((item: OptionItem) => {
    if(allSelected.some((selected) => selected.id == item.id && selected.taxonomy == item.taxonomy)) {
      setClearedTagItem?.(undefined);
      if(onChangeToFilters) onChangeToFilters(item, 'remove');
    }
    else {
      setClearedTagItem?.(undefined);
      if(onChangeToFilters) onChangeToFilters(item, 'add');
    }
  }, [allSelected, setClearedTagItem, onChangeToFilters]);

  useEffect(() => {
    if (!controlsRef.current) return;

    const height = controlsRef.current.offsetHeight;
    setControlsHeight(height);
    // Observe the height change of controls (from accordion folding)
    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry.borderBoxSize.length > 0) {
        const borderBoxSize = entry.borderBoxSize[0];
         // blockSize: For boxes with a horizontal writing-mode, this is the vertical dimension
        setControlsHeight(borderBoxSize.blockSize);
      }
    });
    resizeObserver.observe(controlsRef.current);
    return () => resizeObserver.disconnect(); // clean up
  }, [controlsRef]);


  return (
    <ControlsWrapper widthValue={width} heightValue={controlsHeight+'px'} topValue={isHeaderHidden? '0px': `${wrapperHeight}px`}>
      <div ref={controlsRef}>
        <SearchField
          size='large'
          placeholder='Search by title, description'
          value={search ?? ''}
          onChange={(v) => onAction(Actions.SEARCH, v)}
        />
        {
          taxonomiesOptions.map((taxonomy) => {
            const items = taxonomy.values.map((t) => ({...t, taxonomy: taxonomy.name}));
            return (
              <CheckableFilters
                key={taxonomy.name}
                items={items}
                title={taxonomy.name}
                onChanges={handleChanges}
                globallySelected={allSelected}
                tagItemCleared={{item: clearedTagItem, callback: setClearedTagItem}}
              />
            );
          })
        }
      </div>
    </ControlsWrapper>
  );
}
