import React from 'react';
import type { CommonProps } from '@contentful/f36-core';
import { TabsContextProvider } from './tabsContext';
export interface TabsProps extends CommonProps {
  children?: React.ReactNode;
  /**
   * default active Tab
   */
  defaultTab?: string;
  currentTab?: string;
}

function _Tabs(
  {
    className,
    children,
    testId = 'cf-ui-tabs',
    style,
    defaultTab,
    currentTab,
    ...otherProps
  }: TabsProps,
  ref: React.Ref<HTMLDivElement>,
): React.ReactElement {
  const elementProps = {
    'data-test-id': testId,
    style,
    ...otherProps,
  };

  return (
    <TabsContextProvider defaultTab={defaultTab} currentTab={currentTab}>
      <div {...elementProps} ref={ref}>
        {children}
      </div>
    </TabsContextProvider>
  );
}

export const Tabs = React.forwardRef(_Tabs);