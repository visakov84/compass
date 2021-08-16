import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@leafygreen-ui/icon-button';
import Icon from '@leafygreen-ui/icon';
import { FavoriteModal } from '@mongodb-js/compass-connect';
import {
  LogoMark
} from '@leafygreen-ui/logo';

import styles from './sidebar-title.less';

function SidebarTitle({
  connectionModel,
  deleteFavorite,
  globalAppRegistryEmit,
  isModalVisible,
  isSidebarCollapsed,
  saveFavorite,
  toggleIsModalVisible
}) {
  /**
   * Deletes the current favorite.
   *
   * @param {Object} connection - The current connection.
   */
  const onDeleteFavorite = (connection) => {
    deleteFavorite(connection);
    toggleIsModalVisible(false);
    globalAppRegistryEmit('clear-current-favorite');
  };

  /**
   * Saves the current connection to favorites.
   *
   * @param {String} name - The favorite name.
   * @param {String} color - The favorite color.
   */
  const onSaveFavorite = (name, color) => {
    saveFavorite(connectionModel.connection, name, color);
    toggleIsModalVisible(false);
  };

  const isFavorite = connectionModel.connection.isFavorite;

  if (isSidebarCollapsed) {
    return (
      <div
        styles={isFavorite ? {
          backgroundColor: connectionModel.connection.color || 'transparent'
        } : {}}
        className={styles['sidebar-title-logo']}
      >
        <LogoMark
          darkMode
          knockout
        />
      </div>
    );
  }

  return (
    <div className={styles['sidebar-title']}>
      {isModalVisible && (
        <FavoriteModal
          connectionModel={connectionModel.connection}
          deleteFavorite={onDeleteFavorite}
          closeFavoriteModal={() => toggleIsModalVisible(false)}
          saveFavorite={onSaveFavorite}
        />
      )}
      {isFavorite && (
        <div
          className={styles['sidebar-title-connection-color']}
          style={{
            backgroundColor: connectionModel.connection.color || 'transparent'
          }}
        />
      )}
      <h5 className={styles['sidebar-title-name']}>
        {connectionModel.connection.name}
      </h5>
      <IconButton
        title="Edit Connection Name"
        aria-label="Edit Connection Name"
        onClick={() => toggleIsModalVisible(true)}
        darkMode
      >
        <Icon
          glyph="Edit"
          size="small"
        />
      </IconButton>
    </div>
  );
}

SidebarTitle.displayName = 'SidebarTitleComponent';
SidebarTitle.propTypes = {
  connectionModel: PropTypes.object.isRequired,
  deleteFavorite: PropTypes.func.isRequired,
  globalAppRegistryEmit: PropTypes.func.isRequired,
  isModalVisible: PropTypes.bool.isRequired,
  isSidebarCollapsed: PropTypes.bool.isRequired,
  saveFavorite: PropTypes.func.isRequired,
  toggleIsModalVisible: PropTypes.func.isRequired
};

export default SidebarTitle;
export { SidebarTitle };
