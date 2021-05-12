'use strict'

// eslint-disable-next-line no-control-regex
const CHARS_GLOBAL_BACKSLASH_SUPPORTED_RX = /[\0\b\t\n\r\x1a"'\\]/g
const CHARS_ESCAPE_BACKSLASH_SUPPORTED_MAP = {
    '\0'   : '\\0'
  , '\b'   : '\\b'
  , '\t'   : '\\t'
  , '\n'   : '\\n'
  , '\r'   : '\\r'
  , '\x1a' : '\\Z'
  , '"'    : '\\"'
  , '\''   : '\\\''
  , '\\'   : '\\\\'
}

/**
 * Escapes the given string to protect against SQL injection attacks.
 *
 * By default it assumes that backslashes are not supported as they are not part of the standard SQL spec.
 * Quoting from the [SQLlite web site](https://sqlite.org/lang_expr.html):
 *
 * > C-style escapes using the backslash character are not supported because they are not standard SQL.
 *
 * This means three things:
 *
 * - backslashes and double quotes `"` are not escaped by default
 * - single quotes are escaped via `''` instead of `\'`
 * - your sql engine should throw an error when encountering a backslash escape
 *   as part of a string, unless it is a literal backslash, i.e. `'backslash: \\'`.
 *
 * It is recommended to set the `backslashSupported` option `true` if your SQL
 * engine supports it. In that case backslash sequences are escaped and single
 * and double quotes are escaped via a backslash, i.e. `'\''`.
 *
 * @param {Array} val the original Array to be used in a SQL query
 * @param {Object} $0 opts
 * @param {Boolean} [$0.backslashSupported = false] if `true` backslashes are supported
 * @returns {Array} the original string escaped wrapped in single quotes, i.e. `'mystring'`
 */
function escapeString(val, opts) {
  let returnArry = val.map((value) => {
    if (typeof value !== 'string') {
      return value
    }
    opts = opts || {}
    const backslashSupported = !!opts.backslashSupported
    
    if (!backslashSupported) return value.replace(/'/g, ((value.includes(',') && val.length === 1) ?  "'" : "''"));
  
    const charsRx = CHARS_GLOBAL_BACKSLASH_SUPPORTED_RX
    const charsEscapeMap = CHARS_ESCAPE_BACKSLASH_SUPPORTED_MAP
    var chunkIndex = charsRx.lastIndex = 0
    var escapedVal = ''
    var match
  
    while ((match = charsRx.exec(value))) {
      escapedVal += value.slice(chunkIndex, match.index) + charsEscapeMap[match[0]]
      chunkIndex = charsRx.lastIndex
    }
  
    // Nothing was escaped
    if (chunkIndex === 0) return value

    if (chunkIndex < value.length) return escapedVal + value.slice(chunkIndex)

    return escapedVal
  });
  return returnArry;
}

module.exports = escapeString
