import React from 'react';
import T from 'prop-types';
import { MDXProvider } from '@mdx-js/react';

import { useMdxPageLoader } from '$utils/veda-data';
import { S_LOADING, S_SUCCEEDED } from '$utils/status';
import { ContentLoading } from '$components/common/loading-skeleton';
import Block from '$components/common/blocks';
import ContentBlockFigure from '$components/common/blocks/figure';
import { ContentBlockProse } from '$styles/content-block';
import Image, { Caption } from '$components/common/blocks/images';
import { Chapter } from '$components/common/blocks/scrollytelling/chapter';
import {
  LazyChart,
  LazyCompareImage,
  LazyScrollyTelling,
  LazyMap
} from '$components/common/blocks/lazy-components';
import { NotebookConnectCalloutBlock } from '$components/common/notebook-connect';

function MdxContent(props) {
  console.log(props.loader)
  const pageMdx = useMdxPageLoader(props.loader);

  if (pageMdx.status === S_LOADING) {
    return <ContentLoading />;
  }

  if (pageMdx.status === S_SUCCEEDED) {
    console.log(pageMdx.MdxContent())
    return (
      <MDXProvider
        components={{
          Block,
          Prose: ContentBlockProse,
          Figure: ContentBlockFigure,
          Caption,
          Chapter,
          Image,
          Map: LazyMap,
          ScrollytellingBlock: LazyScrollyTelling,
          Chart: LazyChart,
          CompareImage: LazyCompareImage,
          NotebookConnectCallout: NotebookConnectCalloutBlock
        }}
      >
        <pageMdx.MdxContent />
      </MDXProvider>
    );
  }

  return null;
}

MdxContent.propTypes = {
  loader: T.func
};

export default MdxContent;
