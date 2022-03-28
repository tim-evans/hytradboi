import * as grammar from "./grammar";
import { PegTokenizer, pegIncludes } from "./tokenizer";

/**
 * Creates a wikitext parser and returns an object with a parse() function.
 *
 * This requires the tokenizer to have been compiled and available as <compiled/PegTokenizer.compiled.js>.
 */
export function parse(input) {
  let env = {
    log: () => {},
    conf: {
      wiki: {
        protocols: [
          "bitcoin:",
          "ftp://",
          "ftps://",
          "geo:",
          "git://",
          "gopher://",
          "http://",
          "https://",
          "irc://",
          "ircs://",
          "magnet:",
          "mailto:",
          "mms://",
          "news:",
          "nntp://",
          "redis://",
          "sftp://",
          "sip:",
          "sips:",
          "sms:",
          "ssh://",
          "svn://",
          "tel:",
          "telnet://",
          "urn:",
          "worldwind://",
          "xmpp:",
        ],
        extTags: [
          "pre",
          "nowiki",
          "gallery",
          "indicator",
          "timeline",
          "hiero",
          "charinsert",
          "ref",
          "references",
          "inputbox",
          "imagemap",
          "source",
          "syntaxhighlight",
          "poem",
          "section",
          "score",
          "templatedata",
          "math",
          "ce",
          "chem",
          "graph",
          "maplink",
          "categorytree",
        ],
        redirectWords: ["#REDIRECT"],
        redirectWordsIsCaseSensitive: true,
        // This might not be working correctly yet since it's disabled in wiki.ly's tests.
        // See <lib/parser/wiki.pegjs:892>.
        isMagicWord: () => false,
      },
      maxDepth: 60,
    },
    immutable: false,
    langConverterEnabled: () => true,
  };
  const parser = new PegTokenizer(grammar, env);

  /** Parses given input and returns an object of tokens. */
  const tokens = [];
  parser.tokenizeSync(input, {
    cb: (t) => tokens.push(...t),
    pegTokenizer: parser,
    pipelineOffset: 0,
    env,
    pegIncludes,
    startRule: "start",
  });
  return tokens;
}
