import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import TextInput from '@leafygreen-ui/text-input';

import { filterDatabases } from '../../modules/databases';
import { changeFilterRegex } from '../../modules/filter-regex';

import styles from './sidebar-search.less';

function SidebarSearch(props) {
  const onChangeSearch = (event) => {
    const searchString = event.target.value;

    let re;
    try {
      re = new RegExp(searchString, 'i');
    } catch (e) {
      re = /(?:)/;
    }

    props.changeFilterRegex(re);
    props.filterDatabases(re, null, null);
  };

  return (
    <TextInput
      className={styles['compass-sidebar-search']}
      onChange={onChangeSearch}
      placeholder="Search"
    />
  );
}

SidebarSearch.propTypes = {
  changeFilterRegex: PropTypes.func.isRequired,
  filterDatabases: PropTypes.func.isRequired,
  filterRegex: PropTypes.any.isRequired
};

const mapStateToProps = (state) => ({
  databases: state.databases,
  filterRegex: state.filterRegex
});

/**
 * Connect the redux store to the component.
 * (dispatch)
 */
export default connect(
  mapStateToProps,
  {
    filterDatabases,
    changeFilterRegex
  }
)(SidebarSearch);
