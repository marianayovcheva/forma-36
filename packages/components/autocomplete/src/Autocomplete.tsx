import React, { useState } from 'react';
import { cx } from 'emotion';
import { useCombobox } from 'downshift';

import type { CommonProps } from '@contentful/f36-core';
import {
  TextInput,
  TextInputProps,
  useFormControl,
} from '@contentful/f36-forms';
import { Button } from '@contentful/f36-button';
import { CloseIcon, ChevronDownIcon } from '@contentful/f36-icons';
import { Popover } from '@contentful/f36-popover';

import { getAutocompleteStyles } from './Autocomplete.styles';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AutocompleteProps<ItemType = any>
  extends CommonProps,
    Pick<
      TextInputProps,
      'isDisabled' | 'isInvalid' | 'isReadOnly' | 'isRequired' | 'id'
    > {
  /**
   * It’s an array of data to be used as "options" by the autocomplete component.
   */
  items: ItemType[];
  /**
   * This is the function that will tell the component how the `items` should be filtered when the input value changes.
   * It will be used in the `filter()` method of the array passed in the `items` prop and it needs two arguments: an item and the inputValue.
   */
  onFilter: (item: ItemType, inputValue: string) => void;
  /**
   * This is the function that will be called when the user selects one of the "options" in the list.
   * It receives the selected item as an argument and it needs to return a string that will be set as the value of `TextInput`.
   */
  onSelectItem: (item: ItemType) => void;
  /**
   * This is the function that will be called for each "item" passed in the `items` prop.
   * It receives the "item" as an argument and returns a ReactNode.
   */
  renderItem: (item: ItemType) => React.ReactElement;
  /**
   * When using objects as `items`, we recommend passing a function that tells Downshift how to extract a string
   * from those objetcs to be used as inputValue
   */
  itemToString?: (item: ItemType) => string;
  /**
   * If this is set to `true` the text input will be cleared after an item is selected
   * @default false
   */
  clearAfterSelect?: boolean;
  /**
   * This is the value will be passed to the `placeholder` prop of the input.
   * @default "Search"
   */
  placeholder?: string;
  /**
   * A message that will be shown when it is not possible to find any option that matches the input value
   * @default "No matches"
   */
  noMatchesMessage?: string;
}

function _Autocomplete<ItemType>(
  props: AutocompleteProps<ItemType>,
  ref: React.Ref<HTMLDivElement>,
) {
  const {
    id,
    className,
    clearAfterSelect = false,
    items,
    onFilter,
    onSelectItem,
    renderItem,
    itemToString,
    isInvalid = false,
    isDisabled = false,
    isRequired = false,
    isReadOnly = false,
    noMatchesMessage = 'No Matches',
    placeholder = 'Search',
    testId = 'cf-autocomplete',
  } = props;

  const formProps = useFormControl({
    id,
    isInvalid,
    isDisabled,
    isRequired,
    isReadOnly,
  });

  const styles = getAutocompleteStyles();

  const [filteredItems, setFilteredItems] = useState(items);

  const {
    getComboboxProps,
    getInputProps,
    getItemProps,
    getMenuProps,
    getToggleButtonProps,
    highlightedIndex,
    isOpen,
    setInputValue,
    inputValue,
    toggleMenu,
  } = useCombobox({
    items,
    itemToString,
    onStateChange: ({ inputValue, type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange: {
          const newFilteredItems = items.filter((item) =>
            onFilter(item, inputValue),
          );
          setFilteredItems(newFilteredItems);
          break;
        }
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (selectedItem) {
            onSelectItem(selectedItem);
          }

          if (clearAfterSelect) {
            setInputValue('');
          }

          break;
        default:
          break;
      }
    },
  });

  const comboboxProps = getComboboxProps();
  const inputProps = getInputProps();
  const toggleProps = getToggleButtonProps();
  const menuProps = getMenuProps();

  return (
    <div
      data-test-id={testId}
      className={cx(styles.autocomplete, className)}
      ref={ref}
    >
      {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
      <Popover usePortal={false} autoFocus={false} isOpen={isOpen}>
        <Popover.Trigger>
          <div {...comboboxProps} className={styles.combobox}>
            <TextInput
              {...inputProps}
              {...formProps}
              testId="cf-autocomplete-input"
              placeholder={placeholder}
            />
            <Button
              {...toggleProps}
              aria-label="toggle menu"
              className={styles.toggleButton}
              variant="transparent"
              icon={
                inputValue ? (
                  <CloseIcon aria-label="Clear" />
                ) : (
                  <ChevronDownIcon aria-label="Show list" />
                )
              }
              onClick={() => (inputValue ? setInputValue('') : toggleMenu())}
              isDisabled={isDisabled}
              size="small"
            />
          </div>
        </Popover.Trigger>

        <Popover.Content>
          <ul
            {...menuProps}
            className={styles.list}
            data-test-id="cf-autocomplete-list"
          >
            {filteredItems.length === 0 && (
              <li className={cx(styles.item, styles.disabled)}>
                {noMatchesMessage}
              </li>
            )}

            {filteredItems.map((item, index) => {
              const itemProps = getItemProps({ item, index });
              return (
                <li
                  {...itemProps}
                  key={index}
                  className={cx([
                    styles.item,
                    highlightedIndex === index && styles.highlighted,
                  ])}
                  data-test-id="cf-autocomplete-list-item"
                >
                  {renderItem(item)}
                </li>
              );
            })}
          </ul>
        </Popover.Content>
      </Popover>
    </div>
  );
}

/**
 * The Autocomplete is a component that will show a `TextInput` where a user can type any word which will be used
 * to filter a list of items. That list of filtered items will be shown to the user as possible options for the input.
 * Once one of the options is selected, that option becomes the value of the `TextInput`.
 */
export const Autocomplete = React.forwardRef(_Autocomplete) as <T>(
  props: AutocompleteProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => ReturnType<typeof _Autocomplete>;
