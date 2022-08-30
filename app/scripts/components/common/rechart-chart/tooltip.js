import React from 'react';
import T from 'prop-types';
import styled from 'styled-components';
import { glsp, themeVal } from '@devseed-ui/theme-provider';
import { dateFormatter } from './utils';

const TooltipWrapper = styled.div`
  background-color: ${themeVal('color.surface')};
  border: 1px solid ${themeVal('color.base-300a')};
  padding: ${glsp(0.5)};
  border-radius: ${themeVal('shape.rounded')};
  font-size: 0.75rem;

  > div:not(:last-child) {
    padding-bottom: ${glsp(0.25)};
  }
`;

const TooltipItem = styled.div`
  width: 12px;
  height: 12px;
  background-color: ${(props) => props.color};
  display: inline-block;
  margin-right: ${glsp(0.5)};
`;

const TooltipComponent = ({
  chartData,
  colors,
  dateFormat,
  xKey,
  active,
  payload,
  label
}) => {
  if (active && payload && payload.length) {
    // slicing
    const currentData = chartData.filter((e) => e[xKey] === label);
    return (
      <TooltipWrapper>
        <div>
          <strong>{dateFormatter(label, dateFormat)}</strong>
        </div>
        {currentData.map((point, idx) => {
          const { [xKey]: xKeyVal, ...properties } = point;
          return (
            <div key={JSON.stringify(properties)}>
              <TooltipItem color={colors[idx]} />
              <strong>{Object.keys(properties)[0]}</strong> :
              {Object.values(properties)[0]}
            </div>
          );
        })}
      </TooltipWrapper>
    );
  }
  return null;
};

export default TooltipComponent;
