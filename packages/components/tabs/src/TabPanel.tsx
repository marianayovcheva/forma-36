import React from 'react';
import type { CommonProps } from '@contentful/f36-core';
import { useTabsContext } from './tabsContext';

export interface TabPanelProps extends CommonProps {
  id: string;
  children: React.ReactNode;
}

function _TabPanel(
  {
    testId = 'cf-ui-tab-panel',
    className,
    children,
    id,
    ...otherProps
  }: TabPanelProps,
  ref: React.Ref<HTMLDivElement>,
): React.ReactElement {
  const { selectedTab } = useTabsContext();
  const elementProps = {
    'aria-labelledby': `${id}-control-tab`,
  };
  return selectedTab === id ? (
    <div
      {...elementProps}
      {...otherProps}
      id={id}
      role="tabpanel"
      data-test-id={testId}
      className={className}
      ref={ref}
    >
      {children}
    </div>
  ) : null;
}

export const TabPanel = React.forwardRef(_TabPanel);