import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import SidebarInstanceStats from '../sidebar-instance-stats';
import SidebarInstanceDetails from '../sidebar-instance-details';
import NonGenuineWarningPill from '../non-genuine-warning-pill';

import styles from './sidebar-instance.less';

class SidebarInstance extends PureComponent {
  static displayName = 'SidebarInstance';
  static propTypes = {
    instance: PropTypes.object,
    isExpanded: PropTypes.bool.isRequired,
    isSidebarCollapsed: PropTypes.bool.isRequired,
    isGenuineMongoDB: PropTypes.bool.isRequired,
    toggleIsDetailsExpanded: PropTypes.func.isRequired,
    globalAppRegistryEmit: PropTypes.func.isRequired,
    detailsPlugins: PropTypes.array.isRequired
  };

  /**
   * Renders the SidebarInstance component.
   *
   * @returns {React.Component}
   */
  render() {
    return (
      <div className={styles['sidebar-instance']}>
        <SidebarInstanceStats
          instance={this.props.instance}
          isExpanded={this.props.isExpanded}
          toggleIsExpanded={this.props.toggleIsDetailsExpanded}
          globalAppRegistryEmit={this.props.globalAppRegistryEmit} />
        <NonGenuineWarningPill
          isSidebarCollapsed={this.props.isSidebarCollapsed}
          isGenuineMongoDB={this.props.isGenuineMongoDB} />
        <SidebarInstanceDetails
          detailsPlugins={this.props.detailsPlugins}
          isSidebarCollapsed={this.props.isSidebarCollapsed}
          isExpanded={this.props.isExpanded} />
      </div>
    );
  }
}

export default SidebarInstance;
