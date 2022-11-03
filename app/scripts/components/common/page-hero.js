import React from 'react';
import T from 'prop-types';
import { format } from 'date-fns';
import styled, { css } from 'styled-components';

import {
  glsp,
  media,
  themeVal,
  visuallyHidden
} from '@devseed-ui/theme-provider';
import { reveal } from '@devseed-ui/animation';

import { Figcaption, Figure, FigureAttribution } from './figure';
import Try from './try-render';
import { PageLead, PageMainTitle, PageOverline } from '$styles/page';
import Constrainer from '$styles/constrainer';
import { variableGlsp } from '$styles/variable-utils';

const PageHeroSelf = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-flow: column nowrap;
  gap: ${glsp()};
  justify-content: flex-end;
  background: ${themeVal('color.primary')};
  color: ${themeVal('color.surface')};
  min-height: 12rem;
  animation: ${reveal} 0.32s ease 0s 1;

  ${({ isCover }) =>
    isCover &&
    css`
      min-height: 16rem;

      ${media.mediumUp`
        min-height: 20rem;
      `}

      ${media.largeUp`
        min-height: 24rem;
      `}

      ${media.xlargeUp`
        min-height: 28rem;
      `}

      &::before {
        position: absolute;
        z-index: 2;
        inset: 0 0 auto 0;
        height: ${themeVal('layout.border')};
        background: ${themeVal('color.base-300a')};
        content: '';
      }
    `}

  ${({ isHidden }) => isHidden && visuallyHidden()}

  ${FigureAttribution} {
    top: ${variableGlsp()};
    right: ${variableGlsp()};
  }
`;

const PageHeroInner = styled(Constrainer)`
  padding-top: ${variableGlsp(4)};
  padding-bottom: ${variableGlsp(2)};
  align-items: end;
`;

export const PageHeroHGroup = styled.div`
  display: flex;
  flex-flow: column;
  gap: ${variableGlsp(0.125)};
`;

const PageHeroCover = styled(Figure)`
  position: absolute;
  inset: 0;
  z-index: -1;
  background: ${themeVal('color.base-400')};

  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    mix-blend-mode: multiply;
  }
`;

const PageHeroBlockAlpha = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${variableGlsp()};

  grid-column: 1 / span 4;

  ${media.mediumUp`
    grid-column: 1 / span 6;
  `}

  ${media.largeUp`
    grid-column: 1 / span 6;
  `}
`;

const PageHeroBlockBeta = styled.div`
  grid-column: 1 / span 4;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  gap: ${variableGlsp()};

  ${media.mediumUp`
    grid-column: 1 / span 6;
    grid-row: 2;
  `}

  ${media.largeUp`
    grid-column: 7 / span 6;
    grid-row: 1;
  `}
`;

function PageHero(props) {
  const {
    title,
    description,
    renderAlphaBlock,
    renderBetaBlock,
    publishedDate,
    coverSrc,
    coverAlt,
    attributionAuthor,
    attributionUrl,
    isHidden
  } = props;

  const hasImage = coverSrc && coverAlt;

  const date =
    publishedDate && typeof publishedDate === 'string'
      ? new Date(publishedDate)
      : publishedDate;

  return (
    <PageHeroSelf isCover={hasImage} isHidden={isHidden}>
      <PageHeroInner>
        <Try fn={renderAlphaBlock} wrapWith={PageHeroBlockAlpha}>
          <PageHeroHGroup>
            <PageMainTitle>{title}</PageMainTitle>
            <PageOverlineDate date={date} />
          </PageHeroHGroup>
        </Try>
        <Try fn={renderBetaBlock} wrapWith={PageHeroBlockBeta}>
          {description && <PageLead>{description}</PageLead>}
        </Try>
        {hasImage && (
          <PageHeroCover>
            <img src={coverSrc} alt={coverAlt} />
            <Figcaption>
              <FigureAttribution
                author={attributionAuthor}
                url={attributionUrl}
              />
            </Figcaption>
          </PageHeroCover>
        )}
      </PageHeroInner>
    </PageHeroSelf>
  );
}

export default PageHero;

PageHero.propTypes = {
  title: T.string,
  description: T.string,
  renderAlphaBlock: T.func,
  renderBetaBlock: T.func,
  publishedDate: T.oneOfType([T.string, T.instanceOf(Date)]),
  coverSrc: T.string,
  coverAlt: T.string,
  attributionAuthor: T.string,
  attributionUrl: T.string,
  isHidden: T.bool
};

export function PageOverlineDate(props) {
  const { date } = props;
  if (!date) {
    return null;
  }

  return (
    <PageOverline>
      Published on{' '}
      <time dateTime={format(date, 'yyyy-MM-dd')}>
        {format(date, 'MMM d, yyyy')}
      </time>
    </PageOverline>
  );
}

PageOverlineDate.propTypes = {
  date: T.instanceOf(Date)
};
