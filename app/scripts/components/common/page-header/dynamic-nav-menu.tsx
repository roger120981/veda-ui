import React from 'react';
import { LinkProperties } from '../card';
import { NavItem, NavItemType } from './types';
import { NavDropDownButton } from './nav-dropdown-button';
import { NavItemExternalLink, NavItemInternalLink } from './nav-item-links';
import { NavItemCTAAction, NavItemCTAButton } from './nav-item-cta';

export interface renderDynamicNavMenuProps {
  navItems: NavItem[];
  linkProperties: LinkProperties | null;
  isOpen;
  setIsOpen;
}

export const renderDynamicNavMenu = ({
  navItems,
  linkProperties,
  isOpen,
  setIsOpen
}): renderDynamicNavMenuProps => {
  return navItems.map((item, index) => {
    switch (item.type) {
      case NavItemType.DROPDOWN:
        return (
          <NavDropDownButton
            {...{
              item,
              isOpen,
              setIsOpen,
              index,
              linkProperties
            }}
          />
        );

      case NavItemType.INTERNAL_LINK:
        return (
          linkProperties && (
            <NavItemInternalLink {...{ item, linkProperties }} />
          )
        );

      case NavItemType.EXTERNAL_LINK:
        return <NavItemExternalLink {...{ item }} />;

      case NavItemType.BUTTON:
        return <NavItemCTAButton {...{ item }} />;

      case NavItemType.ACTION:
        return <NavItemCTAAction {...{ item }} />;

      default:
        return null;
    }
  });
};
