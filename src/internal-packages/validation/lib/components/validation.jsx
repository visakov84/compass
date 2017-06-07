const app = require('hadron-app');
const React = require('react');
const ValidationActions = require('../actions');
const ValidationStatusRow = require('./common/status-row');
const ViewSwitcher = require('./common/view-switcher');
const RuleBuilder = require('./rule-builder');
const JSONView = require('./json-view');

// const debug = require('debug')('mongodb-compass:validation');

/**
 * Top-level Validation component which includes status rows at the top,
 * the ViewSwitcher element to toggle Rule Builder vs. Raw JSON editor view,
 * and the actual view.
 */
class Validation extends React.Component {

  constructor(props) {
    super(props);
    this.CollectionStore = app.appRegistry.getStore('App.CollectionStore');
    this.StatusRow = app.appRegistry.getComponent('App.StatusRow');
  }

  /**
   * The view switcher was clicked, switch to the correct view.
   *
   * @param {String} viewName   Name of the clicked view: `Rule Builder` or `JSON`
   */
  switchView(viewName) {
    ValidationActions.switchView(viewName);
  }

  /**
   * Render ValidationComponent
   *
   * @returns {React.Component} The rendered component.
   */
  renderComponent() {
    const view = this.props.viewMode === 'Rule Builder' ?
      (
        <div className="validation validation-rule-builder-wrapper">
          <RuleBuilder
            validationRules={this.props.validationRules}
            validationAction={this.props.validationAction}
            validationLevel={this.props.validationLevel}
            editState={this.props.editState}
            serverVersion={this.props.serverVersion}
            isWritable={this.CollectionStore.isWritable()}
          />
        </div>
      ) : (
        <JSONView
          validatorDoc={this.props.validatorDoc}
          validationAction={this.props.validationAction}
          validationLevel={this.props.validationLevel}
          editState={this.props.editState}
          isWritable={this.CollectionStore.isWritable()}
        />
      );

    return (
      <div className="column-container">
        <div className="column main">
          {view}
        </div>
      </div>
    );
  }

  renderReadonly() {
    return (
      <this.StatusRow style="warning">
        Document validation rules may not be added to readonly views.
      </this.StatusRow>
    );
  }

  render() {
    const activeButton = this.props.isExpressibleByRules ?
      this.props.viewMode : 'JSON';
    return (
      <div className="validation-container">
        <div className="controls-container">
          <ValidationStatusRow>
            <ViewSwitcher
              label="View as:"
              buttonLabels={['Rule Builder', 'JSON']}
              activeButton={activeButton}
              onClick={this.switchView.bind(this)}
              disabled={!this.props.isExpressibleByRules}
            />
          </ValidationStatusRow>
        </div>
        {this.CollectionStore.isReadonly() ? this.renderReadonly() : this.renderComponent()}
      </div>
    );
  }
}

Validation.propTypes = {
  editState: React.PropTypes.oneOf(['unmodified', 'modified', 'updating', 'error', 'success']).isRequired,
  viewMode: React.PropTypes.oneOf(['Rule Builder', 'JSON']).isRequired,
  isExpressibleByRules: React.PropTypes.bool.isRequired,
  validationAction: React.PropTypes.oneOf(['warn', 'error']).isRequired,
  validatorDoc: React.PropTypes.object.isRequired,
  validationLevel: React.PropTypes.oneOf(['off', 'moderate', 'strict']).isRequired,
  validationRules: React.PropTypes.array.isRequired,
  serverVersion: React.PropTypes.string
};

Validation.defaultProps = {
  editState: 'unmodified',
  viewMode: 'Rule Builder',
  isExpressibleByRules: true,
  validationAction: 'warn',
  validatorDoc: {},
  validationLevel: 'off',
  validationRules: []
};

Validation.displayName = 'Validation';

module.exports = Validation;