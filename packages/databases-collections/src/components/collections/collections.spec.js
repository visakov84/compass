import React from 'react';
import { mount } from 'enzyme';

import Collections from '.';
import Toolbar from './collections-toolbar';
import store from '../../stores/collections-store';
import styles from './collections.module.less';

describe('Collections [Component]', () => {
  let component;

  beforeEach(() => {
    component = mount(<Collections store={store} />);
  });

  afterEach(() => {
    component = null;
  });

  it('renders the correct root classname', () => {
    expect(component.find(`.${styles.collections}`)).to.be.present();
  });

  it('should contain the data-test-id', () => {
    expect(component.find('[data-test-id="collections-table"]')).to.be.present();
  });

  it('renders a toolbar', () => {
    expect(component.find(Toolbar)).to.be.present();
  });
});
