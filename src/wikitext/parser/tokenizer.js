/* eslint-disable no-console, require-jsdoc */
/**
 * Tokenizer for wikitext, using WikiPEG and a
 * separate PEG grammar file
 * (pegTokenizer.pegjs)
 */
import * as Token from "./Token";

const HTMLTags = {
  HTML5: [
    "A",
    "ABBR",
    "ADDRESS",
    "AREA",
    "ARTICLE",
    "ASIDE",
    "AUDIO",
    "B",
    "BASE",
    "BDI",
    "BDO",
    "BLOCKQUOTE",
    "BODY",
    "BR",
    "BUTTON",
    "CANVAS",
    "CAPTION",
    "CITE",
    "CODE",
    "COL",
    "COLGROUP",
    "COMMAND",
    "DATA",
    "DATALIST",
    "DD",
    "DEL",
    "DETAILS",
    "DFN",
    "DIV",
    "DL",
    "DT",
    "EM",
    "EMBED",
    "FIELDSET",
    "FIGCAPTION",
    "FIGURE",
    "FOOTER",
    "FORM",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "HEAD",
    "HEADER",
    "HGROUP",
    "HR",
    "HTML",
    "I",
    "IFRAME",
    "IMG",
    "INPUT",
    "INS",
    "KBD",
    "KEYGEN",
    "LABEL",
    "LEGEND",
    "LI",
    "LINK",
    "MAP",
    "MARK",
    "MENU",
    "META",
    "METER",
    "NAV",
    "NOSCRIPT",
    "OBJECT",
    "OL",
    "OPTGROUP",
    "OPTION",
    "OUTPUT",
    "P",
    "PARAM",
    "PRE",
    "PROGRESS",
    "Q",
    "RB",
    "RP",
    "RT",
    "RTC",
    "RUBY",
    "S",
    "SAMP",
    "SCRIPT",
    "SECTION",
    "SELECT",
    "SMALL",
    "SOURCE",
    "SPAN",
    "STRONG",
    "STYLE",
    "SUB",
    "SUMMARY",
    "SUP",
    "TABLE",
    "TBODY",
    "TD",
    "TEXTAREA",
    "TFOOT",
    "TH",
    "THEAD",
    "TIME",
    "TITLE",
    "TR",
    "TRACK",
    "U",
    "UL",
    "VAR",
    "VIDEO",
    "WBR",
  ],
  DepHTML: ["STRIKE", "BIG", "CENTER", "FONT", "TT"],
  HTML4Block: [
    "DIV",
    "P",
    "TABLE",
    "TBODY",
    "THEAD",
    "TFOOT",
    "CAPTION",
    "TH",
    "TR",
    "TD",
    "UL",
    "OL",
    "LI",
    "DL",
    "DT",
    "DD",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "HGROUP",
    "ARTICLE",
    "ASIDE",
    "NAV",
    "SECTION",
    "FOOTER",
    "HEADER",
    "FIGURE",
    "FIGCAPTION",
    "FIELDSET",
    "DETAILS",
    "BLOCKQUOTE",
    "HR",
    "BUTTON",
    "CANVAS",
    "CENTER",
    "COL",
    "COLGROUP",
    "EMBED",
    "MAP",
    "OBJECT",
    "PRE",
    "PROGRESS",
    "VIDEO",
  ],
  HTML4Inline: [
    "A",
    "ABBR",
    /* 'ACRONYM', */ "B",
    "BIG",
    "BDO",
    "BR",
    "BUTTON",
    "CITE",
    "CODE",
    "DFN",
    "EM",
    "FONT",
    "I",
    "IMG",
    "INPUT",
    "KBD",
    "LABEL",
    "MAP",
    "Q",
    "OBJECT",
    "S",
    "SAMP",
    "SCRIPT",
    "SELECT",
    "SMALL",
    "SPAN",
    "STRIKE",
    "STRONG",
    "SUB",
    "SUP",
    "TEXTAREA",
    "TIME",
    "TT",
    "U",
    "VAR",
  ],
  Void: [
    "AREA",
    "BASE",
    "BR",
    "COL",
    "COMMAND",
    "EMBED",
    "HR",
    "IMG",
    "INPUT",
    "KEYGEN",
    "LINK",
    "META",
    "PARAM",
    "SOURCE",
    "TRACK",
    "WBR",
  ],
};

export const pegIncludes = {
  HTMLTags,
  Token,
  TokenUtils: {
    shiftTokenTSR: function (tokens, offset, clearIfUnknownOffset) {
      // Bail early if we can
      if (offset === 0) return;

      // offset should either be a valid number or null
      if (offset === undefined) {
        if (clearIfUnknownOffset) {
          offset = null;
        } else {
          return;
        }
      }

      const THIS = this;

      function updateTsr(i, t) {
        const da = tokens[i].dataAttribs;
        const tsr = da.tsr;
        if (tsr) {
          if (offset !== null) {
            da.tsr = [tsr[0] + offset, tsr[1] + offset];
          } else {
            da.tsr = null;
          }
        }

        // SSS FIXME: offset will always be available in
        // chunky-tokenizer mode in which case we wont have
        // buggy offsets below.  The null scenario is only
        // for when the token-stream-patcher attempts to
        // reparse a string -- it is likely to only patch up
        // small string fragments and the complicated use cases
        // below should not materialize.

        // content offsets for ext-links
        if (offset && da.extLinkContentOffsets) {
          da.extLinkContentOffsets[0] += offset;
          da.extLinkContentOffsets[1] += offset;
        }

        //  Process attributes
        if (t.attribs) {
          for (let j = 0, m = t.attribs.length; j < m; j++) {
            const a = t.attribs[j];
            if (Array.isArray(a.k)) {
              THIS.shiftTokenTSR(a.k, offset, clearIfUnknownOffset);
            }
            if (Array.isArray(a.v)) {
              THIS.shiftTokenTSR(a.v, offset, clearIfUnknownOffset);
            }

            // src offsets used to set mw:TemplateParams
            if (offset === null) {
              a.srcOffsets = null;
            } else if (a.srcOffsets) {
              for (let k = 0; k < a.srcOffsets.length; k++) {
                a.srcOffsets[k] += offset;
              }
            }
          }
        }
      }

      // update/clear tsr
      for (let i = 0, n = tokens.length; i < n; i++) {
        const t = tokens[i];
        switch (t && t.constructor) {
          case Token.TagTk:
          case Token.SelfclosingTagTk:
          case Token.NlTk:
          case Token.CommentTk:
          case Token.EndTagTk:
            updateTsr(i, t);
            break;
          default:
            break;
        }
      }
    },

    // Trim space and newlines from leading and trailing text tokens.
    tokenTrim: function (tokens) {
      if (!Array.isArray(tokens)) {
        if (tokens.constructor === String) return tokens.trim();
        return tokens;
      }

      // Since the tokens array might be frozen,
      // we have to create a new array -- but, create it
      // only if needed
      //
      // FIXME: If tokens is not frozen, we can avoid
      // all this circus with leadingToks and trailingToks
      // but we will need a new function altogether -- so,
      // something worth considering if this is a perf. problem.

      let i;
      let token;
      const n = tokens.length;

      // strip leading space
      const leadingToks = [];
      for (i = 0; i < n; i++) {
        token = tokens[i];
        if (token.constructor === NlTk) {
          leadingToks.push("");
        } else if (token.constructor === String) {
          leadingToks.push(token.replace(/^\s+/, ""));
          if (token !== "") {
            break;
          }
        } else {
          break;
        }
      }

      i = leadingToks.length;
      if (i > 0) {
        tokens = leadingToks.concat(tokens.slice(i));
      }

      // strip trailing space
      const trailingToks = [];
      for (i = n - 1; i >= 0; i--) {
        token = tokens[i];
        if (token.constructor === Token.NlTk) {
          trailingToks.push(""); // replace newline with empty
        } else if (token.constructor === String) {
          trailingToks.push(token.replace(/\s+$/, ""));
          if (token !== "") {
            break;
          }
        } else {
          break;
        }
      }

      const j = trailingToks.length;
      if (j > 0) {
        tokens = tokens.slice(0, n - j).concat(trailingToks.reverse());
      }

      return tokens;
    },

    // Strip EOFTk token from token chunk.
    stripEOFTkfromTokens: function (tokens) {
      // this.dp( 'stripping end or whitespace tokens' );
      if (!Array.isArray(tokens)) {
        tokens = [tokens];
      }
      if (!tokens.length) {
        return tokens;
      }
      // Strip 'end' token
      if (
        tokens.length &&
        tokens[tokens.length - 1].constructor === Token.EOFTk
      ) {
        const rank = tokens.rank;
        tokens = tokens.slice(0, -1);
        tokens.rank = rank;
      }

      return tokens;
    },
  },
  tu: {
    flattenIfArray: function (a) {
      function internalFlatten(e, res) {
        // Don't bother flattening if we dont have an array
        if (!Array.isArray(e)) {
          return e;
        }

        for (let i = 0; i < e.length; i++) {
          const v = e[i];
          if (Array.isArray(v)) {
            // Change in assumption from a shallow array to a nested array.
            if (res === null) res = e.slice(0, i);
            internalFlatten(v, res);
          } else if (v !== null && v !== undefined) {
            if (res !== null) {
              res.push(v);
            }
          } else {
            // throw new Error('falsy ' + e);
          }
        }

        if (res) {
          e = res;
        }
        return e;
      }
      return internalFlatten(a, null);
    },

    flattenString: function (c) {
      const out = pegIncludes.tu.flattenStringlist(c);
      if (out.length === 1 && out[0].constructor === String) {
        return out[0];
      } else {
        return out;
      }
    },

    flattenStringlist: function (c) {
      const out = [];
      let text = "";
      // c will always be an array
      c = pegIncludes.tu.flattenIfArray(c);
      for (let i = 0, l = c.length; i < l; i++) {
        const ci = c[i];
        if (ci.constructor === String) {
          if (ci !== "") {
            text += ci;
          }
        } else {
          if (text !== "") {
            out.push(text);
            text = "";
          }
          out.push(ci);
        }
      }
      if (text !== "") {
        out.push(text);
      }
      return out;
    },

    // Simple string formatting using `%s`.
    sprintf: function (format, ...args) {
      args = Array.prototype.slice.call(args);
      return format.replace(/%s/g, () => (args.length ? args.shift() : ""));
    },

    getAttrVal: function (value, start, end) {
      return { value: value, srcOffsets: [start, end] };
    },

    buildTableTokens: function (
      tagName,
      wtChar,
      attrInfo,
      tsr,
      endPos,
      content,
      addEndTag
    ) {
      let a;
      const dp = { tsr: tsr };

      if (!attrInfo) {
        a = [];
        if (tagName === "td" || tagName === "th") {
          // Add a flag that indicates that the tokenizer didn't
          // encounter a '|...|' attribute box. This is useful when
          // deciding which <td>/<th> cells need attribute fixups.
          dp.tmp = { noAttrs: true };
        }
      } else {
        a = attrInfo[0];
        if (a.length === 0) {
          dp.startTagSrc = wtChar + attrInfo[1];
        }
        if ((a.length === 0 && attrInfo[2]) || attrInfo[2] !== "|") {
          // Variation from default
          // 1. Separator present with an empty attribute block
          // 2. Not '|'
          dp.attrSepSrc = attrInfo[2];
        }
      }

      const dataAttribs = { tsr: [endPos, endPos] };
      let endTag;
      if (addEndTag) {
        endTag = new Token.EndTagTk(tagName, [], dataAttribs);
      } else {
        // We rely on our tree builder to close the table cell (td/th) as needed.
        // We cannot close the cell here because cell content can come from
        // multiple parsing contexts and we cannot close the tag in the same
        // parsing context in which the td was opened:
        //   Ex: {{echo|{{!}}foo}}{{echo|bar}} has to output <td>foobar</td>
        //
        // But, add a marker meta-tag to capture tsr info.
        // FIXME: Unsure if this is helpful, but adding it in just in case.
        // Can test later and strip it out if it doesn't make any diff to rting.
        endTag = new Token.SelfclosingTagTk(
          "meta",
          [
            new Token.KV("typeof", "mw:TSRMarker"),
            new Token.KV("data-etag", tagName),
          ],
          dataAttribs
        );
      }

      return [new Token.TagTk(tagName, a, dp)].concat(content, endTag);
    },

    buildXMLTag: function (name, lcName, attribs, endTag, selfClose, tsr) {
      let tok;
      const da = { tsr: tsr, stx: "html" };

      if (name !== lcName) {
        da.srcTagName = name;
      }

      if (endTag !== null) {
        tok = new Token.EndTagTk(lcName, attribs, da);
      } else if (selfClose) {
        da.selfClose = true;
        tok = new Token.SelfclosingTagTk(lcName, attribs, da);
      } else {
        tok = new Token.TagTk(lcName, attribs, da);
      }

      return tok;
    },

    // Inline breaks, flag-enabled rule which detects end positions for
    // active higher-level rules in inline and other nested rules.
    // Those inner rules are then exited, so that the outer rule can
    // handle the end marker.
    inlineBreaks: function (input, pos, stops) {
      function handleEq() {
        if (stops.arrow && input[pos + 1] === ">") {
          return true;
        }
        // = <!-- something --> <!-- something -->
        // https://regexr.com/4cgpt
        const re = /^=*(?:[ \t]|<!--(?:(?!-->)[^])*-->)*(?:[\r\n]|$)/;

        const isLastChar = pos === input.length - 1;
        const isLastEqual = re.test(input.substr(pos + 1));
        return stops.equal || (stops.h && (isLastChar || isLastEqual));
      }

      function handleLeftCurly() {
        // {{!}} pipe templates..
        // FIXME: Presumably these should mix with and match | above.
        return (
          (stops.tableCellArg && input.substr(pos, 5) === "{{!}}") ||
          (stops.table && input.substr(pos, 10) === "{{!}}{{!}}")
        );
      }

      function handleRightCurly() {
        const c2 = input[pos + 1];
        const preproc = stops.preproc;
        return (
          (c2 === "}" && preproc === "}}") || (c2 === "-" && preproc === "}-")
        );
      }

      function handleLineFeed() {
        // The code below is just a manual / efficient
        // version of this check.
        //
        // stops.table && /^\n\s*[!|]/.test(input.substr(pos));
        //
        // It eliminates a substr on the string and eliminates
        // a potential perf problem since '\n' and the inline_breaks
        // test is common during tokenization.
        if (!stops.table) {
          return false;
        }

        // Allow leading whitespace in tables

        // Since we switched on 'c' which is input[pos],
        // we know that input[pos] is '\n'.
        // So, the /^\n/ part of the regexp is already satisfied.
        // Look for /\s*[!|]/ below.
        const n = input.length;
        for (let i = pos + 1; i < n; i++) {
          const d = input[i];
          if (/[!|]/.test(d)) {
            return true;
          } else if (!/\s/.test(d)) {
            return false;
          }
        }
        return false;
      }

      switch (input[pos]) {
        case "=":
          return handleEq();
        case "|":
          return (
            (stops.templateArg && !stops.extTag) ||
            stops.tableCellArg ||
            stops.linkdesc ||
            (stops.table &&
              pos < input.length - 1 &&
              /[}|]/.test(input[pos + 1]))
          );
        case "!":
          return stops.th && !stops.templatedepth && input[pos + 1] === "!";
        case "{":
          return handleLeftCurly();
        case "}":
          return handleRightCurly();
        case ":":
          return (
            stops.colon &&
            !stops.extlink &&
            !stops.templatedepth &&
            !stops.linkdesc &&
            !(stops.preproc === "}-")
          );
        case ";":
          return stops.semicolon;
        case "\r":
          return stops.table && /\r\n?\s*[!|]/.test(input.substr(pos));
        case "\n":
          return handleLineFeed();
        case "[":
          // This is a special case in php's doTableStuff, added in
          // response to T2553.  If it encounters a `[[`, it bails on
          // parsing attributes and interprets it all as content.
          return stops.tableCellArg && input.substr(pos, 2) === "[[";
        case "-":
          // Same as above: a special case in doTableStuff, added
          // as part of T153140
          return stops.tableCellArg && input.substr(pos, 2) === "-{";
        case "]":
          if (stops.extlink) return true;
          return stops.preproc === "]]" && input[pos + 1] === "]";
        default:
          throw new Error("Unhandled case!");
      }
    },

    // Pop off the end comments, if any.
    popComments: function (attrs) {
      const buf = [];
      for (let i = attrs.length - 1; i > -1; i--) {
        const kv = attrs[i];
        if (typeof kv.k === "string" && !kv.v && /^\s*$/.test(kv.k)) {
          // permit whitespace
          buf.unshift(kv.k);
        } else if (Array.isArray(kv.k) && !kv.v) {
          // all should be comments
          if (kv.k.some((k) => !(k instanceof CommentTk))) break;
          buf.unshift.apply(buf, kv.k);
        } else {
          break;
        }
      }
      // ensure we found a comment
      while (buf.length && !(buf[0] instanceof CommentTk)) {
        buf.shift();
      }
      if (buf.length) {
        attrs.splice(-buf.length, buf.length);
        return { buf: buf, commentStartPos: buf[0].dataAttribs.tsr[0] };
      } else {
        return null;
      }
    },

    tsrOffsets: function (startOffset, endOffset, flag) {
      switch (flag) {
        case "start":
          return [startOffset, startOffset];
        case "end":
          return [endOffset, endOffset];
        default:
          return [startOffset, endOffset];
      }
    },

    protectAttrsRegExp: new RegExp(
      `^(about|data-mw.*|data-parsoid.*|data-x.*|data-object-id|property|rel|typeof)$`,
      "i"
    ) /* eslint-disable-line */,
    protectAttrs: function (name) {
      return name.replace(this.protectAttrsRegExp, "data-x-$1");
    },

    isIncludeTag: function (name) {
      return (
        name === "includeonly" || name === "noinclude" || name === "onlyinclude"
      );
    },
  },
  Util: {
    // deep clones by default.
    clone: function (obj, deepClone) {
      if (deepClone === undefined) {
        deepClone = true;
      }
      if (Array.isArray(obj)) {
        if (deepClone) {
          return obj.map(function (el) {
            return pegIncludes.Util.clone(el, true);
          });
        } else {
          return obj.slice();
        }
      } else if (
        obj instanceof Object && // only "plain objects"
        Object.getPrototypeOf(obj) === Object.prototype
      ) {
        /* This definition of "plain object" comes from jquery,
         * via zepto.js.  But this is really a big hack; we should
         * probably put a console.assert() here and more precisely
         * delimit what we think is legit to clone. (Hint: not
         * DOM trees.) */
        if (deepClone) {
          return Object.keys(obj).reduce(function (nobj, key) {
            nobj[key] = pegIncludes.Util.clone(obj[key], true);
            return nobj;
          }, {});
        } else {
          return Object.assign({}, obj);
        }
      } else if (obj instanceof Token.Token || obj instanceof Token.KV) {
        // Allow cloning of Token and KV objects, since that is useful
        const nobj = new obj.constructor();
        for (const key in obj) {
          /* eslint-disable-line guard-for-in */
          nobj[key] = pegIncludes.Util.clone(obj[key], true);
        }
        return nobj;
      } else {
        return obj;
      }
    },

    extractExtBody: function (token) {
      const extSrc = token.getAttribute("source");
      const extTagOffsets = token.dataAttribs.extTagOffsets;
      return extSrc.substring(
        extTagOffsets[1] - extTagOffsets[0],
        extTagOffsets[2] - extTagOffsets[0]
      );
    },
  },
};

/**
 * @class
 * @extends EventEmitter
 * @param {MWParserEnvironment} env
 * @param {Object} options
 */
export class PegTokenizer {
  constructor(tokenizer, env) {
    this.tokenizer = tokenizer ?? null;
    this.env = env;
    this.options = { tokenizer };
    this.offsets = {};
  }
  setPipelineId(id) {
    this.pipelineId = id;
  }
  _tokenize(text, args) {
    if (typeof text === "object") text = text.toString("utf8");
    const ret = this.tokenizer.parse(text, args);
    return ret;
  }
  onEnd() {
    // Reset source offsets
    this.offsets.startOffset = 0;
    this.offsets.endOffset = 0;
    this.emit("end");
  }

  /**
   * Tokenize via a rule passed in as an arg.
   * The text is tokenized synchronously in one shot.
   *
   * @param {string} text
   * @param {Object} [args]
   * @return {Array}
   */
  tokenizeSync(text, args) {
    if (!this.tokenizer) {
      throw new Error("No tokenizer");
    }
    let toks = [];
    args = Object.assign(
      {
        pipelineOffset: this.offsets.startOffset || 0,
        startRule: "start",
        sol: true,
      },
      {
        // Some rules use callbacks: start, tlb, toplevelblock.
        // All other rules return tokens directly.
        cb: function (r) {
          toks = toks.concat(r);
        } /* eslint-disable-line */,
        pegTokenizer: this,
        pegIncludes: pegIncludes,
      },
      args
    );
    const retToks = this._tokenize(text, args);
    if (Array.isArray(retToks) && retToks.length > 0) {
      toks = toks.concat(retToks);
    }
    return toks;
  }
  // Tokenizes a string as a rule, otherwise returns an `Error`
  tokenizeAs(text, rule, sol) {
    try {
      const args = {
        startRule: rule,
        sol: sol,
        pipelineOffset: 0,
      };
      return this.tokenizeSync(text, args);
    } catch (e) {
      // console.warn('Input: ' + text);
      // console.warn('Rule : ' + rule);
      // console.warn('ERROR: ' + e);
      // console.warn('Stack: ' + e.stack);
      return e instanceof Error ? e : new Error(e);
    }
  }
  setSourceOffsets(startOffset, endOffset) {
    this.offsets.startOffset = startOffset;
    this.offsets.endOffset = endOffset;
  }
}
pegIncludes.PegTokenizer = PegTokenizer;
