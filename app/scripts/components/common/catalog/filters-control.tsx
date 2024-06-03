import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  onFilterChange?: (item: OptionItem, action: 'add' | 'remove') => void;
  exclusiveSourceSelected?: string | null;
}

export default function FiltersControl(props: FiltersMenuProps) {
  const {
    allSelected,
    onAction,
    taxonomiesOptions,
    search,
    width,
    onFilterChange,
    clearedTagItem,
    setClearedTagItem,
    exclusiveSourceSelected
  } = props;

  const controlsRef = useRef<HTMLDivElement>(null);
  const [controlsHeight, setControlsHeight] =  useState<number>(0);
  const { isHeaderHidden, wrapperHeight } = useSlidingStickyHeader();

  const handleChanges = useCallback((item: OptionItem, action: 'add' | 'remove') => {
    const isSelected = allSelected.some(selected => selected.id === item.id && selected.taxonomy === item.taxonomy);
    if ((action === 'remove' && isSelected) || (action === 'add' && !isSelected)) {
      onFilterChange?.(item, action);
    }
  }, [allSelected, onFilterChange]);

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
    return () => resizeObserver.disconnect();
  }, [controlsRef]);

  const taxonomiesItems = useMemo(() => taxonomiesOptions.map(taxonomy => ({
    title: taxonomy.name,
    items: taxonomy.values.map(value => ({ ...value, taxonomy: taxonomy.name }))
  })), [taxonomiesOptions]);

  useEffect(() => {
    // Pre-select the exclusive source if a card with it is selected
    if (exclusiveSourceSelected) {
      taxonomiesOptions.forEach((taxonomy) => {
        taxonomy.values.forEach((t) => {
          if (t.id === exclusiveSourceSelected) {
            handleChanges({ ...t, taxonomy: taxonomy.name }, 'add');
          }
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exclusiveSourceSelected]);

  return (
    <ControlsWrapper widthValue={width} heightValue={controlsHeight+'px'} topValue={isHeaderHidden? '0px': `${wrapperHeight}px`}>
      <div ref={controlsRef}>
        <SearchField
          size='large'
          placeholder='Search by title, description'
          value={search ?? ''}
          onChange={(v) => onAction(Actions.SEARCH, v)}
        />
        {taxonomiesItems.map(({ title, items }) => (
          <CheckableFilters
            key={title}
            items={items}
            title={title}
            onChanges={item => handleChanges(item, allSelected.some(selected => selected.id === item.id) ? 'remove' : 'add')}
            globallySelected={allSelected}
            tagItemCleared={{ item: clearedTagItem, callback: setClearedTagItem }}
          />
        ))}
      </div>
    </ControlsWrapper>
  );
}
