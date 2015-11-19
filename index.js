var gettextParser = require('gettext-parser');
var loaderUtils = require('loader-utils');

function isEmptyMessage(msg) {
  for (var i = 0; i < msg.msgstr.length; i++) {
    if (msg.msgstr[i] === '' || msg.msgstr[i] === null) {
      return true;
    }
  }
  return false;
}

function messageIsExcluded(msg, extensions) {
  if (!extensions) {
    return false;
  }

  var reference = (msg.comments || {}).reference || '<unknown>';
  var filename = reference.split(/:/)[0];

  for (var i = 0; i < extensions.length; i++) {
    var ext = extensions[i];
    if (filename.substr(filename.length - ext.length) == ext) {
      return false;
    }
  }
  return true;
}

module.exports = function(source) {
  var options = loaderUtils.parseQuery(this.query);
  var catalog = gettextParser.po.parse(source, 'UTF-8');

  this.cacheable();

  var rv = {};
  for (var msgid in catalog.translations['']) {
    var msg = catalog.translations[''][msgid];
    if (msgid == '' || (!isEmptyMessage(msg)
        && !messageIsExcluded(msg, options.referenceExtensions))) {
      rv[msgid] = msg.msgstr;
    }
  }

  if (options.raw) {
    return rv;
  }

  return 'module.exports = ' + JSON.stringify(rv) + ';';
}
