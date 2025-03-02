/* eslint-disable valid-jsdoc */
import fs from 'fs';
import stream from 'stream';
import { promisify } from 'util';

import PROCESS_STATUS from '../constants/process-status';
import EXPORT_STEP from '../constants/export-step';
import FILE_TYPES from '../constants/file-types';
import { appRegistryEmit, globalAppRegistryEmit } from './compass';

import { createReadableCollectionStream } from '../utils/collection-stream';

const createProgressStream = require('progress-stream');

import createLogger from '@mongodb-js/compass-logging';
import { createCSVFormatter, createJSONFormatter } from '../utils/formatters';
import { loadFields, getSelectableFields } from './load-fields';

const { log, mongoLogId, debug } = createLogger('COMPASS-IMPORT-EXPORT-UI');

const PREFIX = 'import-export/export';

export const STARTED = `${PREFIX}/STARTED`;
export const CANCELED = `${PREFIX}/CANCELED`;

export const PROGRESS = `${PREFIX}/PROGRESS`;
export const FINISHED = `${PREFIX}/FINISHED`;
export const ERROR = `${PREFIX}/ERROR`;

export const SELECT_FILE_TYPE = `${PREFIX}/SELECT_FILE_TYPE`;
export const SELECT_FILE_NAME = `${PREFIX}/SELECT_FILE_NAME`;

export const ON_MODAL_OPEN = `${PREFIX}/ON_MODAL_OPEN`;
export const CLOSE = `${PREFIX}/CLOSE`;

export const CHANGE_EXPORT_STEP = `${PREFIX}/CHANGE_EXPORT_STEP`;

export const UPDATE_ALL_FIELDS = `${PREFIX}/UPDATE_ALL_FIELDS`;
export const UPDATE_SELECTED_FIELDS = `${PREFIX}/UPDATE_SELECTED_FIELDS`;

export const QUERY_CHANGED = `${PREFIX}/QUERY_CHANGED`;
export const TOGGLE_FULL_COLLECTION = `${PREFIX}/TOGGLE_FULL_COLLECTION`;

/**
 * A full collection query.
 */
const FULL_QUERY = {
  filter: {}
};

/**
 * The initial state.
 * @api private
 */
export const INITIAL_STATE = {
  isOpen: false,
  exportStep: EXPORT_STEP.QUERY,
  isFullCollection: false,
  progress: 0,
  query: FULL_QUERY,
  error: null,
  fields: {},
  allFields: {},
  fileName: '',
  fileType: FILE_TYPES.JSON,
  status: PROCESS_STATUS.UNSPECIFIED,
  exportedDocsCount: 0,
  count: 0
};

/**
 * @param {stream.Readable} source
 * @param {stream.Writable} dest
 * @api private
 */
export const onStarted = (source, dest, count) => ({
  type: STARTED,
  source: source,
  dest: dest,
  count: count
});

/**
 * @param {Object} progress
 * @api private
 */
export const onProgress = (progress, exportedDocsCount) => ({
  type: PROGRESS,
  progress: progress,
  exportedDocsCount: exportedDocsCount
});

/**
 * @api private
 */
export const onFinished = exportedDocsCount => ({
  type: FINISHED,
  exportedDocsCount: exportedDocsCount
});

/**
 * The error callback.
 * @param {Error} error
 * @api private
 */
export const onError = error => ({
  type: ERROR,
  error: error
});

// TODO: Refactor this so import and export reuse as much
// base logic as possible.
// eslint-disable-next-line complexity
const reducer = (state = INITIAL_STATE, action) => {
  if (action.type === TOGGLE_FULL_COLLECTION) {
    return {
      ...state,
      isFullCollection: !state.isFullCollection
    };
  }

  if (action.type === QUERY_CHANGED) {
    return {
      ...state,
      query: action.query
    };
  }

  if (action.type === ON_MODAL_OPEN) {
    return {
      ...INITIAL_STATE,
      count: action.count,
      query: action.query,
      isOpen: true
    };
  }

  if (action.type === CLOSE) {
    return {
      ...state,
      isOpen: false
    };
  }

  if (action.type === STARTED) {
    return {
      ...state,
      error: null,
      progress: 0,
      status: PROCESS_STATUS.STARTED,
      source: action.source,
      dest: action.dest,
      count: action.count
    };
  }

  if (action.type === PROGRESS) {
    return {
      ...state,
      progress: action.progress,
      exportedDocsCount: action.exportedDocsCount
    };
  }

  if (action.type === FINISHED) {
    const isComplete = !(
      state.error || state.status === PROCESS_STATUS.CANCELED
    );
    return {
      ...state,
      status: isComplete ? PROCESS_STATUS.COMPLETED : state.status,
      exportedDocsCount: action.exportedDocsCount,
      source: undefined,
      dest: undefined
    };
  }

  if (action.type === CANCELED) {
    return {
      ...state,
      status: PROCESS_STATUS.CANCELED,
      source: undefined,
      dest: undefined
    };
  }

  if (action.type === UPDATE_SELECTED_FIELDS) {
    return {
      ...state,
      fields: action.fields
    };
  }

  if (action.type === UPDATE_ALL_FIELDS) {
    return {
      ...state,
      allFields: action.fields
    };
  }

  if (action.type === SELECT_FILE_NAME) {
    return {
      ...state,
      fileName: action.fileName,
      status: PROCESS_STATUS.UNSPECIFIED,
      exportedDocsCount: 0,
      source: undefined,
      dest: undefined
    };
  }

  if (action.type === SELECT_FILE_TYPE) {
    return {
      ...state,
      fileType: action.fileType
    };
  }

  if (action.type === CHANGE_EXPORT_STEP) {
    return {
      ...state,
      exportStep: action.status,
    };
  }

  if (action.type === ERROR) {
    return {
      ...state,
      error: action.error,
      status: PROCESS_STATUS.FAILED
    };
  }

  return state;
};

/**
 * Toggle the full collection flag.
 * @api public
 */
export const toggleFullCollection = () => ({
  type: TOGGLE_FULL_COLLECTION
});

/**
 * Select the file type of the export.
 * @api public
 * @param {String} fileType
 */
export const selectExportFileType = fileType => ({
  type: SELECT_FILE_TYPE,
  fileType: fileType
});

/**
 * Select the file name to export to
 * @api public
 * @param {String} fileName
 */
export const selectExportFileName = fileName => ({
  type: SELECT_FILE_NAME,
  fileName: fileName
});

/**
 * Change the query.
 * @api public
 * @param {Object} query
 */
export const queryChanged = query => ({
  type: QUERY_CHANGED,
  query: query
});


/**
 * Populate export modal data on open.
 * @api private
 * @param {Number} document count given current query.
 * @param {Object} current query.
 */
export const onModalOpen = (count, query) => ({
  type: ON_MODAL_OPEN,
  count: count,
  query: query
});

/**
 * Close the export modal.
 * @api public
 */
export const closeExport = () => ({
  type: CLOSE
});

/**
 * Update export fields (list of truncated, selectable field names)
 * @api public
 * @param {Object} fields: currently selected/disselected fields to be exported
 */
export const updateSelectedFields = (fields) => ({
  type: UPDATE_SELECTED_FIELDS,
  fields: fields
});

/**
 * Update export fields (list of full field names)
 * @api public
 * @param {Object} fields: currently selected/disselected fields to be exported
 */
export const updateAllFields = (fields) => ({
  type: UPDATE_ALL_FIELDS,
  fields: fields
});

/**
 * Select fields to be exported
 * @api public
 * @param {String} status: next step in export
 */
export const changeExportStep = (status) => ({
  type: CHANGE_EXPORT_STEP,
  status: status
});

const fetchDocumentCount = async(dataService, ns, query) => {
  // When there is no filter/limit/skip try to use the estimated count.
  if (
    (!query.filter || Object.keys(query.filter).length < 1)
    && !query.limit
    && !query.skip
  ) {
    try {
      const runEstimatedDocumentCount = promisify(dataService.estimatedCount.bind(dataService));
      const count = await runEstimatedDocumentCount(ns, {});

      return count;
    } catch (estimatedCountErr) {
      // `estimatedDocumentCount` is currently unsupported for
      // views and time-series collections, so we can fallback to a full
      // count in these cases and ignore this error.
    }
  }

  const runCount = promisify(dataService.count.bind(dataService));

  const count = await runCount(
    ns,
    query.filter || {},
    {
      ...(query.limit ? { limit: query.limit } : {} ),
      ...(query.skip ? { skip: query.skip } : {} )
    }
  );
  return count;
};

/**
 * Open the export modal.
 *
 * @param {number} [count] - optional pre supplied count to shortcut and
 * avoid a possibly expensive re-count.
 *
 * Counts the documents to be exported given the current query on modal open to
 * provide user with accurate export data
 *
 * @api public
 */
export const openExport = (count) => {
  return async(dispatch, getState) => {
    const {
      ns,
      exportData,
      dataService: { dataService }
    } = getState();

    const spec = exportData.query;

    if (count) {
      return dispatch(onModalOpen(count, spec));
    }

    try {
      const docCount = await fetchDocumentCount(dataService, ns, spec);
      dispatch(onModalOpen(docCount, spec));
    } catch (e) {
      dispatch(onError(e));
    }
  };
};

export const sampleFields = () => {
  return async(dispatch, getState) => {
    const {
      ns,
      exportData,
      dataService: { dataService }
    } = getState();

    const spec = exportData.isFullCollection
      ? { filter: {} }
      : exportData.query;

    try {
      const allFields = await loadFields(
        dataService,
        ns,
        {
          filter: spec.filter,
          sampleSize: 50
        }
      );
      const selectedFields = getSelectableFields(allFields, {
        maxDepth: 2
      });

      dispatch(updateAllFields(allFields));
      dispatch(updateSelectedFields(selectedFields));
    } catch (err) {
      // ignoring the error here so users can still insert
      // fields manually
      debug('failed to load fields', err);
    }
  };
};

/**
 * Run the actual export to file.
 * @api public
 */
export const startExport = () => {
  return async(dispatch, getState) => {
    const {
      ns,
      exportData,
      dataService: { dataService }
    } = getState();

    const spec = exportData.isFullCollection
      ? { filter: {} }
      : exportData.query;

    const numDocsToExport = exportData.isFullCollection
      ? await fetchDocumentCount(dataService, ns, spec)
      : exportData.count;

    // filter out only the fields we want to include in our export data
    const projection = Object.fromEntries(
      Object.entries(exportData.fields)
        .filter((keyAndValue) => keyAndValue[1] === 1));

    log.info(mongoLogId(1001000083), 'Export', 'Start reading from collection', {
      ns,
      numDocsToExport,
      spec,
      projection
    });
    const source = createReadableCollectionStream(dataService, ns, spec, projection);

    const progress = createProgressStream({
      objectMode: true,
      length: numDocsToExport,
      time: 250 /* ms */
    });

    progress.on('progress', function(info) {
      dispatch(onProgress(info.percentage, info.transferred));
    });

    log.info(mongoLogId(1001000084), 'Export', 'Start writing to file', {
      ns,
      fileType: exportData.fileType,
      fileName: exportData.fileName,
      fields: Object.keys(exportData.allFields)
    });
    // Pick the columns that are going to be matched by the projection,
    // where some prefix the field (e.g. ['a', 'a.b', 'a.b.c'] for 'a.b.c')
    // has an entry in the projection object.
    const columns = Object.keys(exportData.allFields)
      .filter(field => field.split('.').some(
        (_part, index, parts) => projection[parts.slice(0, index + 1).join('.')]));
    let formatter;
    if (exportData.fileType === 'csv') {
      formatter = createCSVFormatter({ columns });
    } else {
      formatter = createJSONFormatter();
    }

    const dest = fs.createWriteStream(exportData.fileName);

    debug('executing pipeline');
    dispatch(onStarted(source, dest, numDocsToExport));
    stream.pipeline(source, progress, formatter, dest, function(err) {
      if (err) {
        log.error(mongoLogId(1001000085), 'Export', 'Export failed', {
          ns,
          error: err.message
        });
        debug('error running export pipeline', err);
        return dispatch(onError(err));
      }
      log.info(mongoLogId(1001000086), 'Export', 'Finished export', {
        ns,
        numDocsToExport,
        fileName: exportData.fileName,
      });
      dispatch(onFinished(numDocsToExport));
      dispatch(
        appRegistryEmit(
          'export-finished',
          numDocsToExport,
          exportData.fileType
        )
      );

      /**
       * TODO: lucas: For metrics:
       *
       * "resource": "Export",
       * "action": "completed",
       * "file_type": "<csv|json_array>",
       * "num_docs": "<how many docs exported>",
       * "full_collection": true|false
       * "filter": true|false,
       * "projection": true|false,
       * "skip": true|false,
       * "limit": true|false,
       * "fields_selected": true|false
       */
      dispatch(
        globalAppRegistryEmit(
          'export-finished',
          numDocsToExport,
          exportData.fileType
        )
      );
    });
  };
};

/**
 * Cancel the currently running export operation, if any.
 * @api public
 */
export const cancelExport = () => {
  return (dispatch, getState) => {
    const { exportData } = getState();
    const { source, dest } = exportData;

    if (!source || !dest) {
      debug('no active streams to cancel.');
      return;
    }
    log.info(mongoLogId(1001000088), 'Export', 'Cancelling export by user request');
    source.unpipe();

    dispatch({ type: CANCELED });
  };
};

export default reducer;
