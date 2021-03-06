/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var memMgr = Cc["@mozilla.org/memory-reporter-manager;1"].
             getService(Ci.nsIMemoryReporterManager);

/**
 * PERFORMANCE TRACER
 *
 * Keeps a trace log of both actions and performance statistics
 * throughout a test run.
 *
 * Performance stats currently include explicit and resident memory.
 * More stats will be added as methods to read them are discovered.
 *
 * Usage:
 *   Before test, create a new PerfTracer named after the test.
 *     Ex: var perf = new performance.PerfTracer("MyTestFunc");
 *
 *   During test, after notable actions call PerfTracer.addCheckpoint(label)
 *     Ex: perf.addCheckpoint("Opened preferences dialog");
 *
 *   After test, call PerfTracer.finish()
 *     Ex: perf.finish();
 */

/**
 * PerfTracer constructor
 *
 * @param {string} name
 *        Name of the tracer, currently used in the output title
 */
function PerfTracer(name) {
  if (!name) {
    throw new Error(arguments.callee.name + ": name not supplied.");
  }

  this.clearLog();
  this._name = name;
}

PerfTracer.prototype = {
  // UTILITY METHODS

  /**
   * Format a single result for printing
   *
   * @param {object} result
   *        Result as created by addCheckpoint()
   *        Elements: timestamp {Date}   - date/time
   *                  explicit {number} - explicit memory allocated
   *                  resident {number} - resident memory allocated
   *                  label {string}     - label for result
   *
   * @returns Result string formatted for output
   * @type {string}
   */
  _formatResult : function PerfTracer_formatResult(result) {
    var resultString = result.timestamp.toUTCString() + " | " +
                       result.explicit + " | " +
                       result.resident + " | " +
                       result.label + "\n";

    return resultString;
  },

  // PUBLIC INTERFACE

  /**
   * Clears the tracker log and starts over
   */
  clearLog : function PerfTracer_clearLog() {
    this._log = new Array();
  },

  /**
   * Adds a checkpoint to the tracker log, with time and performance info
   *
   * @param {string} aLabel
   *        Label attached to performance results. Typically should be
   *        whatever the test just did.
   */
  addCheckpoint : function PerfTracer_addCheckpoint(aLabel) {
    var result = {
      label : aLabel,
      timestamp : new Date(),
      explicit : memMgr.explicit,
      resident : memMgr.resident
    };

    this._log.push(result);
  },

  /**
   * Prints all results to console.
   * XXX: make this work with output files
   */
  finish : function PerfTracer_finish() {
    // Title
    var title = "Performance Trace (" + this._name + ")";

    // Separator
    var sep = "";
    for(var i = 0; i < title.length; i++) {
      sep += "=";
    }

    dump(sep + "\n");
    dump(title + "\n");
    dump(sep + "\n");

    // Log
    for(i = 0; i < this._log.length; i++) {
      dump(this._formatResult(this._log[i]));
    }
  }
}

// Exported class
exports.PerfTracer = PerfTracer;
