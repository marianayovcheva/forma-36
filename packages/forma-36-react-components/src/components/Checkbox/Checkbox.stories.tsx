import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import Checkbox from './Checkbox';

storiesOf('Components|Checkbox', module)
  .addParameters({
    propTypes: Checkbox['__docgenInfo'],
  })
  .add('default', () => (
    <Checkbox
      className={text('className', '')}
      id="Checkbox"
      isChecked={boolean('isChecked', false)}
      labelText={(text('labelText'), 'some label text')}
      isDisabled={boolean('isDisabled', false)}
      isRequired={boolean('isRequired', false)}
      name={text('name', 'some-name')}
      onChange={action('onChange')}
    />
  ));
