/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Include required modules
var {expect} = require("../assertions");
var modalDialog = require("../modal-dialog");
var search = require("../search");
var utils = require("../utils");

const gDelay = 0;
const gTimeout = 5000;

var setupModule = function(module)
{
  controller = mozmill.getBrowserController();

  searchBar = new search.searchBar(controller);
  searchBar.clear();
}

var teardownModule = function(module)
{
  searchBar.clear();
  searchBar.restoreDefaultEngines();
}

/**
 * Add a MozSearch Search plugin
 */
var testSearchAPI = function()
{
  // Check if Google is installed and there is no Googl engine present
  expect.ok(searchBar.isEngineInstalled("Google"), "Google search engine is installed");
  expect.ok(!searchBar.isEngineInstalled("Googl"), "Googl search engine is not present");

  // Do some stuff in the Search Engine Manager
  searchBar.openEngineManager(handlerManager);

  // Select another engine and start search
  searchBar.selectedEngine = "Yahoo";
  searchBar.search({text: "Firefox", action: "returnKey"});
}

var handlerManager = function(controller)
{
  var manager = new search.engineManager(controller);
  var engines = manager.engines;

  // Remove the first search engine
  manager.removeEngine(engines[3].name);
  manager.controller.sleep(500);

  // Move engines down / up
  manager.moveDownEngine(engines[0].name);
  manager.moveUpEngine(engines[2].name);
  manager.controller.sleep(500);

  // Add a keyword for the first engine
  manager.editKeyword(engines[0].name, handlerKeyword);
  manager.controller.sleep(500);

  // Restore the defaults
  manager.restoreDefaults();
  manager.controller.sleep(500);

  // Disable suggestions
  manager.suggestionsEnabled = false;
  manager.controller.sleep(500);

  manager.getMoreSearchEngines();

  // Dialog closes automatically
  //manager.close(true);
}

var handlerKeyword = function(controller)
{
  var textbox = new elementslib.ID(controller.window.document, "loginTextbox");
  controller.type(textbox, "g");

  var okButton = new elementslib.Lookup(controller.window.document,
                                        '/id("commonDialog")/anon({"anonid":"buttons"})/{"dlgtype":"accept"}');
  controller.click(okButton);
}
