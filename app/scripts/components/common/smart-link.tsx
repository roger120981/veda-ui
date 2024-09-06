import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { getLinkProps } from '$utils/url';

interface SmartLinkProps {
  to: string;
  onLinkClick?: ()=> void;
  children?: ReactNode;
}

/**
 * Switches between a `a` and a `Link` depending on the url.
 */
export default function SmartLink(props: SmartLinkProps) {
  const { to, onLinkClick, children, ...rest } = props;
  const isExternalLink = /^https?:\/\//.test(to);
  const linkProps = getLinkProps(to, undefined, onLinkClick);

  return isExternalLink ? ( 
    <a {...linkProps} {...rest}> {children} </a>
    ) : (
      <Link {...linkProps} {...rest}> {children} </Link>
    );
}


interface CustomLinkProps {
  href: string;
}

/**
 * For links defined as markdown, this component will open the external link in a new tab.
 */
export function CustomLink(props: CustomLinkProps) {
  const { href, ...rest } = props;
  const isExternalLink = /^https?:\/\//.test(href);
  const linkProps = getLinkProps(href);
  return isExternalLink ? (
      <a {...linkProps} {...rest} />
  ) : (
    <Link {...linkProps} {...rest} />
  );
}
