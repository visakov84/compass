const React = require('react');
const CreateIndexModal = require('./create-index-modal');

/**
 * Component for the create index button.
 */
class CreateIndexButton extends React.Component {

  /**
   * The component constructor.
   *
   * @param {Object} props - The properties.
   */
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  /**
   * Show modal when create button is clicked.
   *
   * @param {Object} evt - The click event.
   */
  clickCreateHandler(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.setState({ showModal: true });
  }

  /**
   * Close the modal.
   */
  close() {
    this.setState({ showModal: false });
  }

  /**
   * Render the create index button.
   *
   * @returns {React.Component} The create index button.
   */
  render() {
    return (
      <div className="create-index-btn">
        <button
          className="btn btn-default btn-sm"
          type="button"
          onClick={this.clickCreateHandler.bind(this)}>
          Add Index
        </button>
        <CreateIndexModal
          open={this.state.showModal}
          close={this.close.bind(this)} />
      </div>
    );
  }
}

CreateIndexButton.displayName = 'CreateIndexButton';

module.exports = CreateIndexButton;
