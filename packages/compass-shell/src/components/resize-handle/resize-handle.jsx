import React, { PureComponent } from 'react';
import styles from './resize-handle.module.less';

export default class ResizeHandle extends PureComponent {
  render() {
    return (
      <div data-test-id="resize-handle" className={styles['resize-handle']} />
    );
  }
}
