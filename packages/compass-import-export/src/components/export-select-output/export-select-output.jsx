import SelectFileType from '../select-file-type';
import { IconTextButton } from 'hadron-react-buttons';
import toNS from 'mongodb-ns';
import fileSaveDialog from '../../utils/file-save-dialog';
import ProgressBar from '../progress-bar';
import { FILETYPE } from '../../constants/export-step';
import styles from './export-select-output.module.less';
import React, { PureComponent } from 'react';
import createStyler from '../../utils/styler.js';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {
  FormGroup,
  InputGroup,
  FormControl,
  ControlLabel
} from 'react-bootstrap';
import {
  STARTED,
  CANCELED,
  COMPLETED,
  UNSPECIFIED
} from '../../constants/process-status';

const style = createStyler(styles, 'export-select-output');

/**
 * Progress messages.
 */
const MESSAGES = {
  [UNSPECIFIED]: '',
  [CANCELED]: 'Export canceled',
  [COMPLETED]: 'Export completed',
  [STARTED]: 'Exporting documents...'
};

class ExportSelectOutput extends PureComponent {
  static propTypes = {
    count: PropTypes.number,
    fileType: PropTypes.string,
    fileName: PropTypes.string,
    ns: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    exportedDocsCount: PropTypes.number,
    progress: PropTypes.number.isRequired,
    startExport: PropTypes.func.isRequired,
    exportStep: PropTypes.string.isRequired,
    cancelExport: PropTypes.func.isRequired,
    selectExportFileType: PropTypes.func.isRequired,
    selectExportFileName: PropTypes.func.isRequired,
  };

  /**
   * Stop form default submission to a whitescreen
   * and start the export if ready.
   * @param {Object} evt - DOM event
   */
  handleOnSubmit = evt => {
    evt.preventDefault();
    evt.stopPropagation();
    if (this.props.fileName) {
      this.props.startExport();
    }
  };

  /**
   * Handle choosing a file from the file dialog.
   */
  handleChooseFile = () => {
    const fileNamePrefill = toNS(this.props.ns).collection;
    fileSaveDialog(this.props.fileType, fileNamePrefill).then(result => {
      if (result && result.filePath && !result.canceled) {
        this.props.selectExportFileName(result.filePath);
      }
    });
  };

  /**
   * Render the component.
   *
   * @returns {React.Component} The component.
   */
  render() {
    if (this.props.exportStep !== FILETYPE) return null;

    return (
      <div>
        <form onSubmit={this.handleOnSubmit} className={style('form')}>
          <SelectFileType
            fileType={this.props.fileType}
            label="Select Export File Type"
            onSelected={this.props.selectExportFileType}/>
          <FormGroup controlId="export-file">
            <ControlLabel>Output</ControlLabel>
            <InputGroup bsClass={style('browse-group')}>
              <FormControl type="text" value={this.props.fileName} readOnly />
              <IconTextButton
                text="Browse"
                iconClassName="fa fa-folder-open-o"
                clickHandler={this.handleChooseFile}
                className={classnames('btn btn-default btn-sm')}/>
            </InputGroup>
          </FormGroup>
        </form>
        <ProgressBar
          status={this.props.status}
          docsTotal={this.props.count}
          progress={this.props.progress}
          cancel={this.props.cancelExport}
          message={MESSAGES[this.props.status]}
          docsWritten={this.props.exportedDocsCount}/>
      </div>
    );
  }
}
export default ExportSelectOutput;
