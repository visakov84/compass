const React = require('react');
const Panel = require('react-bootstrap').Panel;

/**
 * Component for the status message.
 */
class StatusMessage extends React.Component {

  /**
   * The component constructor.
   *
   * @param {Object} props - The properties.
   */
  constructor(props) {
    super(props);
  }

  /**
   * Render the status message.
   *
   * @returns {React.Component} The status message component.
   */
  render() {
    // prefix for class names for css styling
    const classPrefix = `index-ddl-${this.props.type}`;
    return (
      <Panel className={classPrefix}>
        <div className="row">
          <div className="col-md-1">
            <i
              className={`fa fa-${this.props.icon} ${classPrefix}-icon`}
              aria-hidden="true"></i>
          </div>
          <div className="col-md-11">
            <p
              className={`${classPrefix}-message`}>
              {this.props.message}
            </p>
          </div>
        </div>
      </Panel>
    );
  }
}

StatusMessage.displayName = 'StatusMessage';

StatusMessage.propTypes = {
  icon: React.PropTypes.string.isRequired,
  message: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired
};

module.exports = StatusMessage;
