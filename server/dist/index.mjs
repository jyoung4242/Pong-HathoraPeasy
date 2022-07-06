"use strict";
import { createRequire as topLevelCreateRequire } from 'module';
 const require = topLevelCreateRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));

// server/.hathora/node_modules/chance/chance.js
var require_chance = __commonJS({
  "server/.hathora/node_modules/chance/chance.js"(exports, module) {
    (function() {
      var MAX_INT = 9007199254740992;
      var MIN_INT = -MAX_INT;
      var NUMBERS = "0123456789";
      var CHARS_LOWER = "abcdefghijklmnopqrstuvwxyz";
      var CHARS_UPPER = CHARS_LOWER.toUpperCase();
      var HEX_POOL = NUMBERS + "abcdef";
      function UnsupportedError(message) {
        this.name = "UnsupportedError";
        this.message = message || "This feature is not supported on this platform";
      }
      UnsupportedError.prototype = new Error();
      UnsupportedError.prototype.constructor = UnsupportedError;
      var slice = Array.prototype.slice;
      function Chance2(seed) {
        if (!(this instanceof Chance2)) {
          if (!seed) {
            seed = null;
          }
          return seed === null ? new Chance2() : new Chance2(seed);
        }
        if (typeof seed === "function") {
          this.random = seed;
          return this;
        }
        if (arguments.length) {
          this.seed = 0;
        }
        for (var i = 0; i < arguments.length; i++) {
          var seedling = 0;
          if (Object.prototype.toString.call(arguments[i]) === "[object String]") {
            for (var j = 0; j < arguments[i].length; j++) {
              var hash = 0;
              for (var k = 0; k < arguments[i].length; k++) {
                hash = arguments[i].charCodeAt(k) + (hash << 6) + (hash << 16) - hash;
              }
              seedling += hash;
            }
          } else {
            seedling = arguments[i];
          }
          this.seed += (arguments.length - i) * seedling;
        }
        this.mt = this.mersenne_twister(this.seed);
        this.bimd5 = this.blueimp_md5();
        this.random = function() {
          return this.mt.random(this.seed);
        };
        return this;
      }
      Chance2.prototype.VERSION = "1.1.8";
      function initOptions(options, defaults) {
        options = options || {};
        if (defaults) {
          for (var i in defaults) {
            if (typeof options[i] === "undefined") {
              options[i] = defaults[i];
            }
          }
        }
        return options;
      }
      function range(size) {
        return Array.apply(null, Array(size)).map(function(_, i) {
          return i;
        });
      }
      function testRange(test, errorMessage) {
        if (test) {
          throw new RangeError(errorMessage);
        }
      }
      var base64 = function() {
        throw new Error("No Base64 encoder available.");
      };
      (function determineBase64Encoder() {
        if (typeof btoa === "function") {
          base64 = btoa;
        } else if (typeof Buffer === "function") {
          base64 = function(input) {
            return new Buffer(input).toString("base64");
          };
        }
      })();
      Chance2.prototype.bool = function(options) {
        options = initOptions(options, { likelihood: 50 });
        testRange(options.likelihood < 0 || options.likelihood > 100, "Chance: Likelihood accepts values from 0 to 100.");
        return this.random() * 100 < options.likelihood;
      };
      Chance2.prototype.falsy = function(options) {
        options = initOptions(options, { pool: [false, null, 0, NaN, ""] });
        var pool = options.pool, index = this.integer({ min: 0, max: pool.length }), value = pool[index];
        return value;
      };
      Chance2.prototype.animal = function(options) {
        options = initOptions(options);
        if (typeof options.type !== "undefined") {
          testRange(!this.get("animals")[options.type.toLowerCase()], "Please pick from desert, ocean, grassland, forest, zoo, pets, farm.");
          return this.pick(this.get("animals")[options.type.toLowerCase()]);
        }
        var animalTypeArray = ["desert", "forest", "ocean", "zoo", "farm", "pet", "grassland"];
        return this.pick(this.get("animals")[this.pick(animalTypeArray)]);
      };
      Chance2.prototype.character = function(options) {
        options = initOptions(options);
        var symbols = "!@#$%^&*()[]", letters, pool;
        if (options.casing === "lower") {
          letters = CHARS_LOWER;
        } else if (options.casing === "upper") {
          letters = CHARS_UPPER;
        } else {
          letters = CHARS_LOWER + CHARS_UPPER;
        }
        if (options.pool) {
          pool = options.pool;
        } else {
          pool = "";
          if (options.alpha) {
            pool += letters;
          }
          if (options.numeric) {
            pool += NUMBERS;
          }
          if (options.symbols) {
            pool += symbols;
          }
          if (!pool) {
            pool = letters + NUMBERS + symbols;
          }
        }
        return pool.charAt(this.natural({ max: pool.length - 1 }));
      };
      Chance2.prototype.floating = function(options) {
        options = initOptions(options, { fixed: 4 });
        testRange(options.fixed && options.precision, "Chance: Cannot specify both fixed and precision.");
        var num;
        var fixed = Math.pow(10, options.fixed);
        var max = MAX_INT / fixed;
        var min = -max;
        testRange(options.min && options.fixed && options.min < min, "Chance: Min specified is out of range with fixed. Min should be, at least, " + min);
        testRange(options.max && options.fixed && options.max > max, "Chance: Max specified is out of range with fixed. Max should be, at most, " + max);
        options = initOptions(options, { min, max });
        num = this.integer({ min: options.min * fixed, max: options.max * fixed });
        var num_fixed = (num / fixed).toFixed(options.fixed);
        return parseFloat(num_fixed);
      };
      Chance2.prototype.integer = function(options) {
        options = initOptions(options, { min: MIN_INT, max: MAX_INT });
        testRange(options.min > options.max, "Chance: Min cannot be greater than Max.");
        return Math.floor(this.random() * (options.max - options.min + 1) + options.min);
      };
      Chance2.prototype.natural = function(options) {
        options = initOptions(options, { min: 0, max: MAX_INT });
        if (typeof options.numerals === "number") {
          testRange(options.numerals < 1, "Chance: Numerals cannot be less than one.");
          options.min = Math.pow(10, options.numerals - 1);
          options.max = Math.pow(10, options.numerals) - 1;
        }
        testRange(options.min < 0, "Chance: Min cannot be less than zero.");
        if (options.exclude) {
          testRange(!Array.isArray(options.exclude), "Chance: exclude must be an array.");
          for (var exclusionIndex in options.exclude) {
            testRange(!Number.isInteger(options.exclude[exclusionIndex]), "Chance: exclude must be numbers.");
          }
          var random = options.min + this.natural({ max: options.max - options.min - options.exclude.length });
          var sortedExclusions = options.exclude.sort();
          for (var sortedExclusionIndex in sortedExclusions) {
            if (random < sortedExclusions[sortedExclusionIndex]) {
              break;
            }
            random++;
          }
          return random;
        }
        return this.integer(options);
      };
      Chance2.prototype.prime = function(options) {
        options = initOptions(options, { min: 0, max: 1e4 });
        testRange(options.min < 0, "Chance: Min cannot be less than zero.");
        testRange(options.min > options.max, "Chance: Min cannot be greater than Max.");
        var lastPrime = data.primes[data.primes.length - 1];
        if (options.max > lastPrime) {
          for (var i = lastPrime + 2; i <= options.max; ++i) {
            if (this.is_prime(i)) {
              data.primes.push(i);
            }
          }
        }
        var targetPrimes = data.primes.filter(function(prime) {
          return prime >= options.min && prime <= options.max;
        });
        return this.pick(targetPrimes);
      };
      Chance2.prototype.is_prime = function(n) {
        if (n % 1 || n < 2) {
          return false;
        }
        if (n % 2 === 0) {
          return n === 2;
        }
        if (n % 3 === 0) {
          return n === 3;
        }
        var m = Math.sqrt(n);
        for (var i = 5; i <= m; i += 6) {
          if (n % i === 0 || n % (i + 2) === 0) {
            return false;
          }
        }
        return true;
      };
      Chance2.prototype.hex = function(options) {
        options = initOptions(options, { min: 0, max: MAX_INT, casing: "lower" });
        testRange(options.min < 0, "Chance: Min cannot be less than zero.");
        var integer = this.natural({ min: options.min, max: options.max });
        if (options.casing === "upper") {
          return integer.toString(16).toUpperCase();
        }
        return integer.toString(16);
      };
      Chance2.prototype.letter = function(options) {
        options = initOptions(options, { casing: "lower" });
        var pool = "abcdefghijklmnopqrstuvwxyz";
        var letter = this.character({ pool });
        if (options.casing === "upper") {
          letter = letter.toUpperCase();
        }
        return letter;
      };
      Chance2.prototype.string = function(options) {
        options = initOptions(options, { min: 5, max: 20 });
        if (!options.length) {
          options.length = this.natural({ min: options.min, max: options.max });
        }
        testRange(options.length < 0, "Chance: Length cannot be less than zero.");
        var length = options.length, text = this.n(this.character, length, options);
        return text.join("");
      };
      function CopyToken(c) {
        this.c = c;
      }
      CopyToken.prototype = {
        substitute: function() {
          return this.c;
        }
      };
      function EscapeToken(c) {
        this.c = c;
      }
      EscapeToken.prototype = {
        substitute: function() {
          if (!/[{}\\]/.test(this.c)) {
            throw new Error('Invalid escape sequence: "\\' + this.c + '".');
          }
          return this.c;
        }
      };
      function ReplaceToken(c) {
        this.c = c;
      }
      ReplaceToken.prototype = {
        replacers: {
          "#": function(chance2) {
            return chance2.character({ pool: NUMBERS });
          },
          "A": function(chance2) {
            return chance2.character({ pool: CHARS_UPPER });
          },
          "a": function(chance2) {
            return chance2.character({ pool: CHARS_LOWER });
          }
        },
        substitute: function(chance2) {
          var replacer = this.replacers[this.c];
          if (!replacer) {
            throw new Error('Invalid replacement character: "' + this.c + '".');
          }
          return replacer(chance2);
        }
      };
      function parseTemplate(template) {
        var tokens = [];
        var mode = "identity";
        for (var i = 0; i < template.length; i++) {
          var c = template[i];
          switch (mode) {
            case "escape":
              tokens.push(new EscapeToken(c));
              mode = "identity";
              break;
            case "identity":
              if (c === "{") {
                mode = "replace";
              } else if (c === "\\") {
                mode = "escape";
              } else {
                tokens.push(new CopyToken(c));
              }
              break;
            case "replace":
              if (c === "}") {
                mode = "identity";
              } else {
                tokens.push(new ReplaceToken(c));
              }
              break;
          }
        }
        return tokens;
      }
      Chance2.prototype.template = function(template) {
        if (!template) {
          throw new Error("Template string is required");
        }
        var self2 = this;
        return parseTemplate(template).map(function(token) {
          return token.substitute(self2);
        }).join("");
      };
      Chance2.prototype.buffer = function(options) {
        if (typeof Buffer === "undefined") {
          throw new UnsupportedError("Sorry, the buffer() function is not supported on your platform");
        }
        options = initOptions(options, { length: this.natural({ min: 5, max: 20 }) });
        testRange(options.length < 0, "Chance: Length cannot be less than zero.");
        var length = options.length;
        var content = this.n(this.character, length, options);
        return Buffer.from(content);
      };
      Chance2.prototype.capitalize = function(word) {
        return word.charAt(0).toUpperCase() + word.substr(1);
      };
      Chance2.prototype.mixin = function(obj) {
        for (var func_name in obj) {
          Chance2.prototype[func_name] = obj[func_name];
        }
        return this;
      };
      Chance2.prototype.unique = function(fn, num, options) {
        testRange(typeof fn !== "function", "Chance: The first argument must be a function.");
        var comparator = function(arr2, val) {
          return arr2.indexOf(val) !== -1;
        };
        if (options) {
          comparator = options.comparator || comparator;
        }
        var arr = [], count = 0, result, MAX_DUPLICATES = num * 50, params = slice.call(arguments, 2);
        while (arr.length < num) {
          var clonedParams = JSON.parse(JSON.stringify(params));
          result = fn.apply(this, clonedParams);
          if (!comparator(arr, result)) {
            arr.push(result);
            count = 0;
          }
          if (++count > MAX_DUPLICATES) {
            throw new RangeError("Chance: num is likely too large for sample set");
          }
        }
        return arr;
      };
      Chance2.prototype.n = function(fn, n) {
        testRange(typeof fn !== "function", "Chance: The first argument must be a function.");
        if (typeof n === "undefined") {
          n = 1;
        }
        var i = n, arr = [], params = slice.call(arguments, 2);
        i = Math.max(0, i);
        for (null; i--; null) {
          arr.push(fn.apply(this, params));
        }
        return arr;
      };
      Chance2.prototype.pad = function(number, width, pad) {
        pad = pad || "0";
        number = number + "";
        return number.length >= width ? number : new Array(width - number.length + 1).join(pad) + number;
      };
      Chance2.prototype.pick = function(arr, count) {
        if (arr.length === 0) {
          throw new RangeError("Chance: Cannot pick() from an empty array");
        }
        if (!count || count === 1) {
          return arr[this.natural({ max: arr.length - 1 })];
        } else {
          return this.shuffle(arr).slice(0, count);
        }
      };
      Chance2.prototype.pickone = function(arr) {
        if (arr.length === 0) {
          throw new RangeError("Chance: Cannot pickone() from an empty array");
        }
        return arr[this.natural({ max: arr.length - 1 })];
      };
      Chance2.prototype.pickset = function(arr, count) {
        if (count === 0) {
          return [];
        }
        if (arr.length === 0) {
          throw new RangeError("Chance: Cannot pickset() from an empty array");
        }
        if (count < 0) {
          throw new RangeError("Chance: Count must be a positive number");
        }
        if (!count || count === 1) {
          return [this.pickone(arr)];
        } else {
          var array = arr.slice(0);
          var end = array.length;
          return this.n(function() {
            var index = this.natural({ max: --end });
            var value = array[index];
            array[index] = array[end];
            return value;
          }, Math.min(end, count));
        }
      };
      Chance2.prototype.shuffle = function(arr) {
        var new_array = [], j = 0, length = Number(arr.length), source_indexes = range(length), last_source_index = length - 1, selected_source_index;
        for (var i = 0; i < length; i++) {
          selected_source_index = this.natural({ max: last_source_index });
          j = source_indexes[selected_source_index];
          new_array[i] = arr[j];
          source_indexes[selected_source_index] = source_indexes[last_source_index];
          last_source_index -= 1;
        }
        return new_array;
      };
      Chance2.prototype.weighted = function(arr, weights, trim) {
        if (arr.length !== weights.length) {
          throw new RangeError("Chance: Length of array and weights must match");
        }
        var sum = 0;
        var val;
        for (var weightIndex = 0; weightIndex < weights.length; ++weightIndex) {
          val = weights[weightIndex];
          if (isNaN(val)) {
            throw new RangeError("Chance: All weights must be numbers");
          }
          if (val > 0) {
            sum += val;
          }
        }
        if (sum === 0) {
          throw new RangeError("Chance: No valid entries in array weights");
        }
        var selected = this.random() * sum;
        var total = 0;
        var lastGoodIdx = -1;
        var chosenIdx;
        for (weightIndex = 0; weightIndex < weights.length; ++weightIndex) {
          val = weights[weightIndex];
          total += val;
          if (val > 0) {
            if (selected <= total) {
              chosenIdx = weightIndex;
              break;
            }
            lastGoodIdx = weightIndex;
          }
          if (weightIndex === weights.length - 1) {
            chosenIdx = lastGoodIdx;
          }
        }
        var chosen = arr[chosenIdx];
        trim = typeof trim === "undefined" ? false : trim;
        if (trim) {
          arr.splice(chosenIdx, 1);
          weights.splice(chosenIdx, 1);
        }
        return chosen;
      };
      Chance2.prototype.paragraph = function(options) {
        options = initOptions(options);
        var sentences = options.sentences || this.natural({ min: 3, max: 7 }), sentence_array = this.n(this.sentence, sentences), separator = options.linebreak === true ? "\n" : " ";
        return sentence_array.join(separator);
      };
      Chance2.prototype.sentence = function(options) {
        options = initOptions(options);
        var words = options.words || this.natural({ min: 12, max: 18 }), punctuation = options.punctuation, text, word_array = this.n(this.word, words);
        text = word_array.join(" ");
        text = this.capitalize(text);
        if (punctuation !== false && !/^[.?;!:]$/.test(punctuation)) {
          punctuation = ".";
        }
        if (punctuation) {
          text += punctuation;
        }
        return text;
      };
      Chance2.prototype.syllable = function(options) {
        options = initOptions(options);
        var length = options.length || this.natural({ min: 2, max: 3 }), consonants = "bcdfghjklmnprstvwz", vowels = "aeiou", all = consonants + vowels, text = "", chr;
        for (var i = 0; i < length; i++) {
          if (i === 0) {
            chr = this.character({ pool: all });
          } else if (consonants.indexOf(chr) === -1) {
            chr = this.character({ pool: consonants });
          } else {
            chr = this.character({ pool: vowels });
          }
          text += chr;
        }
        if (options.capitalize) {
          text = this.capitalize(text);
        }
        return text;
      };
      Chance2.prototype.word = function(options) {
        options = initOptions(options);
        testRange(options.syllables && options.length, "Chance: Cannot specify both syllables AND length.");
        var syllables = options.syllables || this.natural({ min: 1, max: 3 }), text = "";
        if (options.length) {
          do {
            text += this.syllable();
          } while (text.length < options.length);
          text = text.substring(0, options.length);
        } else {
          for (var i = 0; i < syllables; i++) {
            text += this.syllable();
          }
        }
        if (options.capitalize) {
          text = this.capitalize(text);
        }
        return text;
      };
      Chance2.prototype.age = function(options) {
        options = initOptions(options);
        var ageRange;
        switch (options.type) {
          case "child":
            ageRange = { min: 0, max: 12 };
            break;
          case "teen":
            ageRange = { min: 13, max: 19 };
            break;
          case "adult":
            ageRange = { min: 18, max: 65 };
            break;
          case "senior":
            ageRange = { min: 65, max: 100 };
            break;
          case "all":
            ageRange = { min: 0, max: 100 };
            break;
          default:
            ageRange = { min: 18, max: 65 };
            break;
        }
        return this.natural(ageRange);
      };
      Chance2.prototype.birthday = function(options) {
        var age = this.age(options);
        var currentYear = new Date().getFullYear();
        if (options && options.type) {
          var min = new Date();
          var max = new Date();
          min.setFullYear(currentYear - age - 1);
          max.setFullYear(currentYear - age);
          options = initOptions(options, {
            min,
            max
          });
        } else {
          options = initOptions(options, {
            year: currentYear - age
          });
        }
        return this.date(options);
      };
      Chance2.prototype.cpf = function(options) {
        options = initOptions(options, {
          formatted: true
        });
        var n = this.n(this.natural, 9, { max: 9 });
        var d1 = n[8] * 2 + n[7] * 3 + n[6] * 4 + n[5] * 5 + n[4] * 6 + n[3] * 7 + n[2] * 8 + n[1] * 9 + n[0] * 10;
        d1 = 11 - d1 % 11;
        if (d1 >= 10) {
          d1 = 0;
        }
        var d2 = d1 * 2 + n[8] * 3 + n[7] * 4 + n[6] * 5 + n[5] * 6 + n[4] * 7 + n[3] * 8 + n[2] * 9 + n[1] * 10 + n[0] * 11;
        d2 = 11 - d2 % 11;
        if (d2 >= 10) {
          d2 = 0;
        }
        var cpf = "" + n[0] + n[1] + n[2] + "." + n[3] + n[4] + n[5] + "." + n[6] + n[7] + n[8] + "-" + d1 + d2;
        return options.formatted ? cpf : cpf.replace(/\D/g, "");
      };
      Chance2.prototype.cnpj = function(options) {
        options = initOptions(options, {
          formatted: true
        });
        var n = this.n(this.natural, 12, { max: 12 });
        var d1 = n[11] * 2 + n[10] * 3 + n[9] * 4 + n[8] * 5 + n[7] * 6 + n[6] * 7 + n[5] * 8 + n[4] * 9 + n[3] * 2 + n[2] * 3 + n[1] * 4 + n[0] * 5;
        d1 = 11 - d1 % 11;
        if (d1 < 2) {
          d1 = 0;
        }
        var d2 = d1 * 2 + n[11] * 3 + n[10] * 4 + n[9] * 5 + n[8] * 6 + n[7] * 7 + n[6] * 8 + n[5] * 9 + n[4] * 2 + n[3] * 3 + n[2] * 4 + n[1] * 5 + n[0] * 6;
        d2 = 11 - d2 % 11;
        if (d2 < 2) {
          d2 = 0;
        }
        var cnpj = "" + n[0] + n[1] + "." + n[2] + n[3] + n[4] + "." + n[5] + n[6] + n[7] + "/" + n[8] + n[9] + n[10] + n[11] + "-" + d1 + d2;
        return options.formatted ? cnpj : cnpj.replace(/\D/g, "");
      };
      Chance2.prototype.first = function(options) {
        options = initOptions(options, { gender: this.gender(), nationality: "en" });
        return this.pick(this.get("firstNames")[options.gender.toLowerCase()][options.nationality.toLowerCase()]);
      };
      Chance2.prototype.profession = function(options) {
        options = initOptions(options);
        if (options.rank) {
          return this.pick(["Apprentice ", "Junior ", "Senior ", "Lead "]) + this.pick(this.get("profession"));
        } else {
          return this.pick(this.get("profession"));
        }
      };
      Chance2.prototype.company = function() {
        return this.pick(this.get("company"));
      };
      Chance2.prototype.gender = function(options) {
        options = initOptions(options, { extraGenders: [] });
        return this.pick(["Male", "Female"].concat(options.extraGenders));
      };
      Chance2.prototype.last = function(options) {
        options = initOptions(options, { nationality: "*" });
        if (options.nationality === "*") {
          var allLastNames = [];
          var lastNames = this.get("lastNames");
          Object.keys(lastNames).forEach(function(key) {
            allLastNames = allLastNames.concat(lastNames[key]);
          });
          return this.pick(allLastNames);
        } else {
          return this.pick(this.get("lastNames")[options.nationality.toLowerCase()]);
        }
      };
      Chance2.prototype.israelId = function() {
        var x = this.string({ pool: "0123456789", length: 8 });
        var y = 0;
        for (var i = 0; i < x.length; i++) {
          var thisDigit = x[i] * (i / 2 === parseInt(i / 2) ? 1 : 2);
          thisDigit = this.pad(thisDigit, 2).toString();
          thisDigit = parseInt(thisDigit[0]) + parseInt(thisDigit[1]);
          y = y + thisDigit;
        }
        x = x + (10 - parseInt(y.toString().slice(-1))).toString().slice(-1);
        return x;
      };
      Chance2.prototype.mrz = function(options) {
        var checkDigit = function(input) {
          var alpha = "<ABCDEFGHIJKLMNOPQRSTUVWXYXZ".split(""), multipliers = [7, 3, 1], runningTotal = 0;
          if (typeof input !== "string") {
            input = input.toString();
          }
          input.split("").forEach(function(character, idx) {
            var pos = alpha.indexOf(character);
            if (pos !== -1) {
              character = pos === 0 ? 0 : pos + 9;
            } else {
              character = parseInt(character, 10);
            }
            character *= multipliers[idx % multipliers.length];
            runningTotal += character;
          });
          return runningTotal % 10;
        };
        var generate = function(opts) {
          var pad = function(length) {
            return new Array(length + 1).join("<");
          };
          var number = [
            "P<",
            opts.issuer,
            opts.last.toUpperCase(),
            "<<",
            opts.first.toUpperCase(),
            pad(39 - (opts.last.length + opts.first.length + 2)),
            opts.passportNumber,
            checkDigit(opts.passportNumber),
            opts.nationality,
            opts.dob,
            checkDigit(opts.dob),
            opts.gender,
            opts.expiry,
            checkDigit(opts.expiry),
            pad(14),
            checkDigit(pad(14))
          ].join("");
          return number + checkDigit(number.substr(44, 10) + number.substr(57, 7) + number.substr(65, 7));
        };
        var that = this;
        options = initOptions(options, {
          first: this.first(),
          last: this.last(),
          passportNumber: this.integer({ min: 1e8, max: 999999999 }),
          dob: function() {
            var date = that.birthday({ type: "adult" });
            return [
              date.getFullYear().toString().substr(2),
              that.pad(date.getMonth() + 1, 2),
              that.pad(date.getDate(), 2)
            ].join("");
          }(),
          expiry: function() {
            var date = new Date();
            return [
              (date.getFullYear() + 5).toString().substr(2),
              that.pad(date.getMonth() + 1, 2),
              that.pad(date.getDate(), 2)
            ].join("");
          }(),
          gender: this.gender() === "Female" ? "F" : "M",
          issuer: "GBR",
          nationality: "GBR"
        });
        return generate(options);
      };
      Chance2.prototype.name = function(options) {
        options = initOptions(options);
        var first = this.first(options), last = this.last(options), name;
        if (options.middle) {
          name = first + " " + this.first(options) + " " + last;
        } else if (options.middle_initial) {
          name = first + " " + this.character({ alpha: true, casing: "upper" }) + ". " + last;
        } else {
          name = first + " " + last;
        }
        if (options.prefix) {
          name = this.prefix(options) + " " + name;
        }
        if (options.suffix) {
          name = name + " " + this.suffix(options);
        }
        return name;
      };
      Chance2.prototype.name_prefixes = function(gender) {
        gender = gender || "all";
        gender = gender.toLowerCase();
        var prefixes = [
          { name: "Doctor", abbreviation: "Dr." }
        ];
        if (gender === "male" || gender === "all") {
          prefixes.push({ name: "Mister", abbreviation: "Mr." });
        }
        if (gender === "female" || gender === "all") {
          prefixes.push({ name: "Miss", abbreviation: "Miss" });
          prefixes.push({ name: "Misses", abbreviation: "Mrs." });
        }
        return prefixes;
      };
      Chance2.prototype.prefix = function(options) {
        return this.name_prefix(options);
      };
      Chance2.prototype.name_prefix = function(options) {
        options = initOptions(options, { gender: "all" });
        return options.full ? this.pick(this.name_prefixes(options.gender)).name : this.pick(this.name_prefixes(options.gender)).abbreviation;
      };
      Chance2.prototype.HIDN = function() {
        var idn_pool = "0123456789";
        var idn_chrs = "ABCDEFGHIJKLMNOPQRSTUVWXYXZ";
        var idn = "";
        idn += this.string({ pool: idn_pool, length: 6 });
        idn += this.string({ pool: idn_chrs, length: 2 });
        return idn;
      };
      Chance2.prototype.ssn = function(options) {
        options = initOptions(options, { ssnFour: false, dashes: true });
        var ssn_pool = "1234567890", ssn, dash = options.dashes ? "-" : "";
        if (!options.ssnFour) {
          ssn = this.string({ pool: ssn_pool, length: 3 }) + dash + this.string({ pool: ssn_pool, length: 2 }) + dash + this.string({ pool: ssn_pool, length: 4 });
        } else {
          ssn = this.string({ pool: ssn_pool, length: 4 });
        }
        return ssn;
      };
      Chance2.prototype.aadhar = function(options) {
        options = initOptions(options, { onlyLastFour: false, separatedByWhiteSpace: true });
        var aadhar_pool = "1234567890", aadhar, whiteSpace = options.separatedByWhiteSpace ? " " : "";
        if (!options.onlyLastFour) {
          aadhar = this.string({ pool: aadhar_pool, length: 4 }) + whiteSpace + this.string({ pool: aadhar_pool, length: 4 }) + whiteSpace + this.string({ pool: aadhar_pool, length: 4 });
        } else {
          aadhar = this.string({ pool: aadhar_pool, length: 4 });
        }
        return aadhar;
      };
      Chance2.prototype.name_suffixes = function() {
        var suffixes = [
          { name: "Doctor of Osteopathic Medicine", abbreviation: "D.O." },
          { name: "Doctor of Philosophy", abbreviation: "Ph.D." },
          { name: "Esquire", abbreviation: "Esq." },
          { name: "Junior", abbreviation: "Jr." },
          { name: "Juris Doctor", abbreviation: "J.D." },
          { name: "Master of Arts", abbreviation: "M.A." },
          { name: "Master of Business Administration", abbreviation: "M.B.A." },
          { name: "Master of Science", abbreviation: "M.S." },
          { name: "Medical Doctor", abbreviation: "M.D." },
          { name: "Senior", abbreviation: "Sr." },
          { name: "The Third", abbreviation: "III" },
          { name: "The Fourth", abbreviation: "IV" },
          { name: "Bachelor of Engineering", abbreviation: "B.E" },
          { name: "Bachelor of Technology", abbreviation: "B.TECH" }
        ];
        return suffixes;
      };
      Chance2.prototype.suffix = function(options) {
        return this.name_suffix(options);
      };
      Chance2.prototype.name_suffix = function(options) {
        options = initOptions(options);
        return options.full ? this.pick(this.name_suffixes()).name : this.pick(this.name_suffixes()).abbreviation;
      };
      Chance2.prototype.nationalities = function() {
        return this.get("nationalities");
      };
      Chance2.prototype.nationality = function() {
        var nationality = this.pick(this.nationalities());
        return nationality.name;
      };
      Chance2.prototype.android_id = function() {
        return "APA91" + this.string({ pool: "0123456789abcefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_", length: 178 });
      };
      Chance2.prototype.apple_token = function() {
        return this.string({ pool: "abcdef1234567890", length: 64 });
      };
      Chance2.prototype.wp8_anid2 = function() {
        return base64(this.hash({ length: 32 }));
      };
      Chance2.prototype.wp7_anid = function() {
        return "A=" + this.guid().replace(/-/g, "").toUpperCase() + "&E=" + this.hash({ length: 3 }) + "&W=" + this.integer({ min: 0, max: 9 });
      };
      Chance2.prototype.bb_pin = function() {
        return this.hash({ length: 8 });
      };
      Chance2.prototype.avatar = function(options) {
        var url = null;
        var URL_BASE = "//www.gravatar.com/avatar/";
        var PROTOCOLS = {
          http: "http",
          https: "https"
        };
        var FILE_TYPES = {
          bmp: "bmp",
          gif: "gif",
          jpg: "jpg",
          png: "png"
        };
        var FALLBACKS = {
          "404": "404",
          mm: "mm",
          identicon: "identicon",
          monsterid: "monsterid",
          wavatar: "wavatar",
          retro: "retro",
          blank: "blank"
        };
        var RATINGS = {
          g: "g",
          pg: "pg",
          r: "r",
          x: "x"
        };
        var opts = {
          protocol: null,
          email: null,
          fileExtension: null,
          size: null,
          fallback: null,
          rating: null
        };
        if (!options) {
          opts.email = this.email();
          options = {};
        } else if (typeof options === "string") {
          opts.email = options;
          options = {};
        } else if (typeof options !== "object") {
          return null;
        } else if (options.constructor === "Array") {
          return null;
        }
        opts = initOptions(options, opts);
        if (!opts.email) {
          opts.email = this.email();
        }
        opts.protocol = PROTOCOLS[opts.protocol] ? opts.protocol + ":" : "";
        opts.size = parseInt(opts.size, 0) ? opts.size : "";
        opts.rating = RATINGS[opts.rating] ? opts.rating : "";
        opts.fallback = FALLBACKS[opts.fallback] ? opts.fallback : "";
        opts.fileExtension = FILE_TYPES[opts.fileExtension] ? opts.fileExtension : "";
        url = opts.protocol + URL_BASE + this.bimd5.md5(opts.email) + (opts.fileExtension ? "." + opts.fileExtension : "") + (opts.size || opts.rating || opts.fallback ? "?" : "") + (opts.size ? "&s=" + opts.size.toString() : "") + (opts.rating ? "&r=" + opts.rating : "") + (opts.fallback ? "&d=" + opts.fallback : "");
        return url;
      };
      Chance2.prototype.color = function(options) {
        function gray(value, delimiter) {
          return [value, value, value].join(delimiter || "");
        }
        function rgb(hasAlpha) {
          var rgbValue = hasAlpha ? "rgba" : "rgb";
          var alphaChannel = hasAlpha ? "," + this.floating({ min: min_alpha, max: max_alpha }) : "";
          var colorValue2 = isGrayscale ? gray(this.natural({ min: min_rgb, max: max_rgb }), ",") : this.natural({ min: min_green, max: max_green }) + "," + this.natural({ min: min_blue, max: max_blue }) + "," + this.natural({ max: 255 });
          return rgbValue + "(" + colorValue2 + alphaChannel + ")";
        }
        function hex(start, end, withHash) {
          var symbol = withHash ? "#" : "";
          var hexstring = "";
          if (isGrayscale) {
            hexstring = gray(this.pad(this.hex({ min: min_rgb, max: max_rgb }), 2));
            if (options.format === "shorthex") {
              hexstring = gray(this.hex({ min: 0, max: 15 }));
            }
          } else {
            if (options.format === "shorthex") {
              hexstring = this.pad(this.hex({ min: Math.floor(min_red / 16), max: Math.floor(max_red / 16) }), 1) + this.pad(this.hex({ min: Math.floor(min_green / 16), max: Math.floor(max_green / 16) }), 1) + this.pad(this.hex({ min: Math.floor(min_blue / 16), max: Math.floor(max_blue / 16) }), 1);
            } else if (min_red !== void 0 || max_red !== void 0 || min_green !== void 0 || max_green !== void 0 || min_blue !== void 0 || max_blue !== void 0) {
              hexstring = this.pad(this.hex({ min: min_red, max: max_red }), 2) + this.pad(this.hex({ min: min_green, max: max_green }), 2) + this.pad(this.hex({ min: min_blue, max: max_blue }), 2);
            } else {
              hexstring = this.pad(this.hex({ min: min_rgb, max: max_rgb }), 2) + this.pad(this.hex({ min: min_rgb, max: max_rgb }), 2) + this.pad(this.hex({ min: min_rgb, max: max_rgb }), 2);
            }
          }
          return symbol + hexstring;
        }
        options = initOptions(options, {
          format: this.pick(["hex", "shorthex", "rgb", "rgba", "0x", "name"]),
          grayscale: false,
          casing: "lower",
          min: 0,
          max: 255,
          min_red: void 0,
          max_red: void 0,
          min_green: void 0,
          max_green: void 0,
          min_blue: void 0,
          max_blue: void 0,
          min_alpha: 0,
          max_alpha: 1
        });
        var isGrayscale = options.grayscale;
        var min_rgb = options.min;
        var max_rgb = options.max;
        var min_red = options.min_red;
        var max_red = options.max_red;
        var min_green = options.min_green;
        var max_green = options.max_green;
        var min_blue = options.min_blue;
        var max_blue = options.max_blue;
        var min_alpha = options.min_alpha;
        var max_alpha = options.max_alpha;
        if (options.min_red === void 0) {
          min_red = min_rgb;
        }
        if (options.max_red === void 0) {
          max_red = max_rgb;
        }
        if (options.min_green === void 0) {
          min_green = min_rgb;
        }
        if (options.max_green === void 0) {
          max_green = max_rgb;
        }
        if (options.min_blue === void 0) {
          min_blue = min_rgb;
        }
        if (options.max_blue === void 0) {
          max_blue = max_rgb;
        }
        if (options.min_alpha === void 0) {
          min_alpha = 0;
        }
        if (options.max_alpha === void 0) {
          max_alpha = 1;
        }
        if (isGrayscale && min_rgb === 0 && max_rgb === 255 && min_red !== void 0 && max_red !== void 0) {
          min_rgb = (min_red + min_green + min_blue) / 3;
          max_rgb = (max_red + max_green + max_blue) / 3;
        }
        var colorValue;
        if (options.format === "hex") {
          colorValue = hex.call(this, 2, 6, true);
        } else if (options.format === "shorthex") {
          colorValue = hex.call(this, 1, 3, true);
        } else if (options.format === "rgb") {
          colorValue = rgb.call(this, false);
        } else if (options.format === "rgba") {
          colorValue = rgb.call(this, true);
        } else if (options.format === "0x") {
          colorValue = "0x" + hex.call(this, 2, 6);
        } else if (options.format === "name") {
          return this.pick(this.get("colorNames"));
        } else {
          throw new RangeError('Invalid format provided. Please provide one of "hex", "shorthex", "rgb", "rgba", "0x" or "name".');
        }
        if (options.casing === "upper") {
          colorValue = colorValue.toUpperCase();
        }
        return colorValue;
      };
      Chance2.prototype.domain = function(options) {
        options = initOptions(options);
        return this.word() + "." + (options.tld || this.tld());
      };
      Chance2.prototype.email = function(options) {
        options = initOptions(options);
        return this.word({ length: options.length }) + "@" + (options.domain || this.domain());
      };
      Chance2.prototype.fbid = function() {
        return "10000" + this.string({ pool: "1234567890", length: 11 });
      };
      Chance2.prototype.google_analytics = function() {
        var account = this.pad(this.natural({ max: 999999 }), 6);
        var property = this.pad(this.natural({ max: 99 }), 2);
        return "UA-" + account + "-" + property;
      };
      Chance2.prototype.hashtag = function() {
        return "#" + this.word();
      };
      Chance2.prototype.ip = function() {
        return this.natural({ min: 1, max: 254 }) + "." + this.natural({ max: 255 }) + "." + this.natural({ max: 255 }) + "." + this.natural({ min: 1, max: 254 });
      };
      Chance2.prototype.ipv6 = function() {
        var ip_addr = this.n(this.hash, 8, { length: 4 });
        return ip_addr.join(":");
      };
      Chance2.prototype.klout = function() {
        return this.natural({ min: 1, max: 99 });
      };
      Chance2.prototype.mac = function(options) {
        options = initOptions(options, { delimiter: ":" });
        return this.pad(this.natural({ max: 255 }).toString(16), 2) + options.delimiter + this.pad(this.natural({ max: 255 }).toString(16), 2) + options.delimiter + this.pad(this.natural({ max: 255 }).toString(16), 2) + options.delimiter + this.pad(this.natural({ max: 255 }).toString(16), 2) + options.delimiter + this.pad(this.natural({ max: 255 }).toString(16), 2) + options.delimiter + this.pad(this.natural({ max: 255 }).toString(16), 2);
      };
      Chance2.prototype.semver = function(options) {
        options = initOptions(options, { include_prerelease: true });
        var range2 = this.pickone(["^", "~", "<", ">", "<=", ">=", "="]);
        if (options.range) {
          range2 = options.range;
        }
        var prerelease = "";
        if (options.include_prerelease) {
          prerelease = this.weighted(["", "-dev", "-beta", "-alpha"], [50, 10, 5, 1]);
        }
        return range2 + this.rpg("3d10").join(".") + prerelease;
      };
      Chance2.prototype.tlds = function() {
        return ["com", "org", "edu", "gov", "co.uk", "net", "io", "ac", "ad", "ae", "af", "ag", "ai", "al", "am", "ao", "aq", "ar", "as", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cr", "cu", "cv", "cw", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mk", "ml", "mm", "mn", "mo", "mp", "mq", "mr", "ms", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc", "ne", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "ss", "st", "su", "sv", "sx", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "ye", "yt", "za", "zm", "zw"];
      };
      Chance2.prototype.tld = function() {
        return this.pick(this.tlds());
      };
      Chance2.prototype.twitter = function() {
        return "@" + this.word();
      };
      Chance2.prototype.url = function(options) {
        options = initOptions(options, { protocol: "http", domain: this.domain(options), domain_prefix: "", path: this.word(), extensions: [] });
        var extension = options.extensions.length > 0 ? "." + this.pick(options.extensions) : "";
        var domain = options.domain_prefix ? options.domain_prefix + "." + options.domain : options.domain;
        return options.protocol + "://" + domain + "/" + options.path + extension;
      };
      Chance2.prototype.port = function() {
        return this.integer({ min: 0, max: 65535 });
      };
      Chance2.prototype.locale = function(options) {
        options = initOptions(options);
        if (options.region) {
          return this.pick(this.get("locale_regions"));
        } else {
          return this.pick(this.get("locale_languages"));
        }
      };
      Chance2.prototype.locales = function(options) {
        options = initOptions(options);
        if (options.region) {
          return this.get("locale_regions");
        } else {
          return this.get("locale_languages");
        }
      };
      Chance2.prototype.loremPicsum = function(options) {
        options = initOptions(options, { width: 500, height: 500, greyscale: false, blurred: false });
        var greyscale = options.greyscale ? "g/" : "";
        var query = options.blurred ? "/?blur" : "/?random";
        return "https://picsum.photos/" + greyscale + options.width + "/" + options.height + query;
      };
      Chance2.prototype.address = function(options) {
        options = initOptions(options);
        return this.natural({ min: 5, max: 2e3 }) + " " + this.street(options);
      };
      Chance2.prototype.altitude = function(options) {
        options = initOptions(options, { fixed: 5, min: 0, max: 8848 });
        return this.floating({
          min: options.min,
          max: options.max,
          fixed: options.fixed
        });
      };
      Chance2.prototype.areacode = function(options) {
        options = initOptions(options, { parens: true });
        var areacode = options.exampleNumber ? "555" : this.natural({ min: 2, max: 9 }).toString() + this.natural({ min: 0, max: 8 }).toString() + this.natural({ min: 0, max: 9 }).toString();
        return options.parens ? "(" + areacode + ")" : areacode;
      };
      Chance2.prototype.city = function() {
        return this.capitalize(this.word({ syllables: 3 }));
      };
      Chance2.prototype.coordinates = function(options) {
        return this.latitude(options) + ", " + this.longitude(options);
      };
      Chance2.prototype.countries = function() {
        return this.get("countries");
      };
      Chance2.prototype.country = function(options) {
        options = initOptions(options);
        var country = this.pick(this.countries());
        return options.raw ? country : options.full ? country.name : country.abbreviation;
      };
      Chance2.prototype.depth = function(options) {
        options = initOptions(options, { fixed: 5, min: -10994, max: 0 });
        return this.floating({
          min: options.min,
          max: options.max,
          fixed: options.fixed
        });
      };
      Chance2.prototype.geohash = function(options) {
        options = initOptions(options, { length: 7 });
        return this.string({ length: options.length, pool: "0123456789bcdefghjkmnpqrstuvwxyz" });
      };
      Chance2.prototype.geojson = function(options) {
        return this.latitude(options) + ", " + this.longitude(options) + ", " + this.altitude(options);
      };
      Chance2.prototype.latitude = function(options) {
        var [DDM, DMS, DD] = ["ddm", "dms", "dd"];
        options = initOptions(options, options && options.format && [DDM, DMS].includes(options.format.toLowerCase()) ? { min: 0, max: 89, fixed: 4 } : { fixed: 5, min: -90, max: 90, format: DD });
        var format = options.format.toLowerCase();
        if (format === DDM || format === DMS) {
          testRange(options.min < 0 || options.min > 89, "Chance: Min specified is out of range. Should be between 0 - 89");
          testRange(options.max < 0 || options.max > 89, "Chance: Max specified is out of range. Should be between 0 - 89");
          testRange(options.fixed > 4, "Chance: Fixed specified should be below or equal to 4");
        }
        switch (format) {
          case DDM: {
            return this.integer({ min: options.min, max: options.max }) + "\xB0" + this.floating({ min: 0, max: 59, fixed: options.fixed });
          }
          case DMS: {
            return this.integer({ min: options.min, max: options.max }) + "\xB0" + this.integer({ min: 0, max: 59 }) + "\u2019" + this.floating({ min: 0, max: 59, fixed: options.fixed }) + "\u201D";
          }
          case DD:
          default: {
            return this.floating({ min: options.min, max: options.max, fixed: options.fixed });
          }
        }
      };
      Chance2.prototype.longitude = function(options) {
        var [DDM, DMS, DD] = ["ddm", "dms", "dd"];
        options = initOptions(options, options && options.format && [DDM, DMS].includes(options.format.toLowerCase()) ? { min: 0, max: 179, fixed: 4 } : { fixed: 5, min: -180, max: 180, format: DD });
        var format = options.format.toLowerCase();
        if (format === DDM || format === DMS) {
          testRange(options.min < 0 || options.min > 179, "Chance: Min specified is out of range. Should be between 0 - 179");
          testRange(options.max < 0 || options.max > 179, "Chance: Max specified is out of range. Should be between 0 - 179");
          testRange(options.fixed > 4, "Chance: Fixed specified should be below or equal to 4");
        }
        switch (format) {
          case DDM: {
            return this.integer({ min: options.min, max: options.max }) + "\xB0" + this.floating({ min: 0, max: 59.9999, fixed: options.fixed });
          }
          case DMS: {
            return this.integer({ min: options.min, max: options.max }) + "\xB0" + this.integer({ min: 0, max: 59 }) + "\u2019" + this.floating({ min: 0, max: 59.9999, fixed: options.fixed }) + "\u201D";
          }
          case DD:
          default: {
            return this.floating({ min: options.min, max: options.max, fixed: options.fixed });
          }
        }
      };
      Chance2.prototype.phone = function(options) {
        var self2 = this, numPick, ukNum = function(parts) {
          var section = [];
          parts.sections.forEach(function(n) {
            section.push(self2.string({ pool: "0123456789", length: n }));
          });
          return parts.area + section.join(" ");
        };
        options = initOptions(options, {
          formatted: true,
          country: "us",
          mobile: false,
          exampleNumber: false
        });
        if (!options.formatted) {
          options.parens = false;
        }
        var phone;
        switch (options.country) {
          case "fr":
            if (!options.mobile) {
              numPick = this.pick([
                "01" + this.pick(["30", "34", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "53", "55", "56", "58", "60", "64", "69", "70", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83"]) + self2.string({ pool: "0123456789", length: 6 }),
                "02" + this.pick(["14", "18", "22", "23", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "40", "41", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "56", "57", "61", "62", "69", "72", "76", "77", "78", "85", "90", "96", "97", "98", "99"]) + self2.string({ pool: "0123456789", length: 6 }),
                "03" + this.pick(["10", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "39", "44", "45", "51", "52", "54", "55", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90"]) + self2.string({ pool: "0123456789", length: 6 }),
                "04" + this.pick(["11", "13", "15", "20", "22", "26", "27", "30", "32", "34", "37", "42", "43", "44", "50", "56", "57", "63", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "88", "89", "90", "91", "92", "93", "94", "95", "97", "98"]) + self2.string({ pool: "0123456789", length: 6 }),
                "05" + this.pick(["08", "16", "17", "19", "24", "31", "32", "33", "34", "35", "40", "45", "46", "47", "49", "53", "55", "56", "57", "58", "59", "61", "62", "63", "64", "65", "67", "79", "81", "82", "86", "87", "90", "94"]) + self2.string({ pool: "0123456789", length: 6 }),
                "09" + self2.string({ pool: "0123456789", length: 8 })
              ]);
              phone = options.formatted ? numPick.match(/../g).join(" ") : numPick;
            } else {
              numPick = this.pick(["06", "07"]) + self2.string({ pool: "0123456789", length: 8 });
              phone = options.formatted ? numPick.match(/../g).join(" ") : numPick;
            }
            break;
          case "uk":
            if (!options.mobile) {
              numPick = this.pick([
                { area: "01" + this.character({ pool: "234569" }) + "1 ", sections: [3, 4] },
                { area: "020 " + this.character({ pool: "378" }), sections: [3, 4] },
                { area: "023 " + this.character({ pool: "89" }), sections: [3, 4] },
                { area: "024 7", sections: [3, 4] },
                { area: "028 " + this.pick(["25", "28", "37", "71", "82", "90", "92", "95"]), sections: [2, 4] },
                { area: "012" + this.pick(["04", "08", "54", "76", "97", "98"]) + " ", sections: [6] },
                { area: "013" + this.pick(["63", "64", "84", "86"]) + " ", sections: [6] },
                { area: "014" + this.pick(["04", "20", "60", "61", "80", "88"]) + " ", sections: [6] },
                { area: "015" + this.pick(["24", "27", "62", "66"]) + " ", sections: [6] },
                { area: "016" + this.pick(["06", "29", "35", "47", "59", "95"]) + " ", sections: [6] },
                { area: "017" + this.pick(["26", "44", "50", "68"]) + " ", sections: [6] },
                { area: "018" + this.pick(["27", "37", "84", "97"]) + " ", sections: [6] },
                { area: "019" + this.pick(["00", "05", "35", "46", "49", "63", "95"]) + " ", sections: [6] }
              ]);
              phone = options.formatted ? ukNum(numPick) : ukNum(numPick).replace(" ", "", "g");
            } else {
              numPick = this.pick([
                { area: "07" + this.pick(["4", "5", "7", "8", "9"]), sections: [2, 6] },
                { area: "07624 ", sections: [6] }
              ]);
              phone = options.formatted ? ukNum(numPick) : ukNum(numPick).replace(" ", "");
            }
            break;
          case "za":
            if (!options.mobile) {
              numPick = this.pick([
                "01" + this.pick(["0", "1", "2", "3", "4", "5", "6", "7", "8"]) + self2.string({ pool: "0123456789", length: 7 }),
                "02" + this.pick(["1", "2", "3", "4", "7", "8"]) + self2.string({ pool: "0123456789", length: 7 }),
                "03" + this.pick(["1", "2", "3", "5", "6", "9"]) + self2.string({ pool: "0123456789", length: 7 }),
                "04" + this.pick(["1", "2", "3", "4", "5", "6", "7", "8", "9"]) + self2.string({ pool: "0123456789", length: 7 }),
                "05" + this.pick(["1", "3", "4", "6", "7", "8"]) + self2.string({ pool: "0123456789", length: 7 })
              ]);
              phone = options.formatted || numPick;
            } else {
              numPick = this.pick([
                "060" + this.pick(["3", "4", "5", "6", "7", "8", "9"]) + self2.string({ pool: "0123456789", length: 6 }),
                "061" + this.pick(["0", "1", "2", "3", "4", "5", "8"]) + self2.string({ pool: "0123456789", length: 6 }),
                "06" + self2.string({ pool: "0123456789", length: 7 }),
                "071" + this.pick(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]) + self2.string({ pool: "0123456789", length: 6 }),
                "07" + this.pick(["2", "3", "4", "6", "7", "8", "9"]) + self2.string({ pool: "0123456789", length: 7 }),
                "08" + this.pick(["0", "1", "2", "3", "4", "5"]) + self2.string({ pool: "0123456789", length: 7 })
              ]);
              phone = options.formatted || numPick;
            }
            break;
          case "us":
            var areacode = this.areacode(options).toString();
            var exchange = this.natural({ min: 2, max: 9 }).toString() + this.natural({ min: 0, max: 9 }).toString() + this.natural({ min: 0, max: 9 }).toString();
            var subscriber = this.natural({ min: 1e3, max: 9999 }).toString();
            phone = options.formatted ? areacode + " " + exchange + "-" + subscriber : areacode + exchange + subscriber;
            break;
          case "br":
            var areaCode = this.pick(["11", "12", "13", "14", "15", "16", "17", "18", "19", "21", "22", "24", "27", "28", "31", "32", "33", "34", "35", "37", "38", "41", "42", "43", "44", "45", "46", "47", "48", "49", "51", "53", "54", "55", "61", "62", "63", "64", "65", "66", "67", "68", "69", "71", "73", "74", "75", "77", "79", "81", "82", "83", "84", "85", "86", "87", "88", "89", "91", "92", "93", "94", "95", "96", "97", "98", "99"]);
            var prefix;
            if (options.mobile) {
              prefix = "9" + self2.string({ pool: "0123456789", length: 4 });
            } else {
              prefix = this.natural({ min: 2e3, max: 5999 }).toString();
            }
            var mcdu = self2.string({ pool: "0123456789", length: 4 });
            phone = options.formatted ? "(" + areaCode + ") " + prefix + "-" + mcdu : areaCode + prefix + mcdu;
            break;
        }
        return phone;
      };
      Chance2.prototype.postal = function() {
        var pd = this.character({ pool: "XVTSRPNKLMHJGECBA" });
        var fsa = pd + this.natural({ max: 9 }) + this.character({ alpha: true, casing: "upper" });
        var ldu = this.natural({ max: 9 }) + this.character({ alpha: true, casing: "upper" }) + this.natural({ max: 9 });
        return fsa + " " + ldu;
      };
      Chance2.prototype.postcode = function() {
        var area = this.pick(this.get("postcodeAreas")).code;
        var district = this.natural({ max: 9 });
        var subDistrict = this.bool() ? this.character({ alpha: true, casing: "upper" }) : "";
        var outward = area + district + subDistrict;
        var sector = this.natural({ max: 9 });
        var unit = this.character({ alpha: true, casing: "upper" }) + this.character({ alpha: true, casing: "upper" });
        var inward = sector + unit;
        return outward + " " + inward;
      };
      Chance2.prototype.counties = function(options) {
        options = initOptions(options, { country: "uk" });
        return this.get("counties")[options.country.toLowerCase()];
      };
      Chance2.prototype.county = function(options) {
        return this.pick(this.counties(options)).name;
      };
      Chance2.prototype.provinces = function(options) {
        options = initOptions(options, { country: "ca" });
        return this.get("provinces")[options.country.toLowerCase()];
      };
      Chance2.prototype.province = function(options) {
        return options && options.full ? this.pick(this.provinces(options)).name : this.pick(this.provinces(options)).abbreviation;
      };
      Chance2.prototype.state = function(options) {
        return options && options.full ? this.pick(this.states(options)).name : this.pick(this.states(options)).abbreviation;
      };
      Chance2.prototype.states = function(options) {
        options = initOptions(options, { country: "us", us_states_and_dc: true });
        var states;
        switch (options.country.toLowerCase()) {
          case "us":
            var us_states_and_dc = this.get("us_states_and_dc"), territories = this.get("territories"), armed_forces = this.get("armed_forces");
            states = [];
            if (options.us_states_and_dc) {
              states = states.concat(us_states_and_dc);
            }
            if (options.territories) {
              states = states.concat(territories);
            }
            if (options.armed_forces) {
              states = states.concat(armed_forces);
            }
            break;
          case "it":
          case "mx":
            states = this.get("country_regions")[options.country.toLowerCase()];
            break;
          case "uk":
            states = this.get("counties")[options.country.toLowerCase()];
            break;
        }
        return states;
      };
      Chance2.prototype.street = function(options) {
        options = initOptions(options, { country: "us", syllables: 2 });
        var street;
        switch (options.country.toLowerCase()) {
          case "us":
            street = this.word({ syllables: options.syllables });
            street = this.capitalize(street);
            street += " ";
            street += options.short_suffix ? this.street_suffix(options).abbreviation : this.street_suffix(options).name;
            break;
          case "it":
            street = this.word({ syllables: options.syllables });
            street = this.capitalize(street);
            street = (options.short_suffix ? this.street_suffix(options).abbreviation : this.street_suffix(options).name) + " " + street;
            break;
        }
        return street;
      };
      Chance2.prototype.street_suffix = function(options) {
        options = initOptions(options, { country: "us" });
        return this.pick(this.street_suffixes(options));
      };
      Chance2.prototype.street_suffixes = function(options) {
        options = initOptions(options, { country: "us" });
        return this.get("street_suffixes")[options.country.toLowerCase()];
      };
      Chance2.prototype.zip = function(options) {
        var zip = this.n(this.natural, 5, { max: 9 });
        if (options && options.plusfour === true) {
          zip.push("-");
          zip = zip.concat(this.n(this.natural, 4, { max: 9 }));
        }
        return zip.join("");
      };
      Chance2.prototype.ampm = function() {
        return this.bool() ? "am" : "pm";
      };
      Chance2.prototype.date = function(options) {
        var date_string, date;
        if (options && (options.min || options.max)) {
          options = initOptions(options, {
            american: true,
            string: false
          });
          var min = typeof options.min !== "undefined" ? options.min.getTime() : 1;
          var max = typeof options.max !== "undefined" ? options.max.getTime() : 864e13;
          date = new Date(this.integer({ min, max }));
        } else {
          var m = this.month({ raw: true });
          var daysInMonth = m.days;
          if (options && options.month) {
            daysInMonth = this.get("months")[(options.month % 12 + 12) % 12].days;
          }
          options = initOptions(options, {
            year: parseInt(this.year(), 10),
            month: m.numeric - 1,
            day: this.natural({ min: 1, max: daysInMonth }),
            hour: this.hour({ twentyfour: true }),
            minute: this.minute(),
            second: this.second(),
            millisecond: this.millisecond(),
            american: true,
            string: false
          });
          date = new Date(options.year, options.month, options.day, options.hour, options.minute, options.second, options.millisecond);
        }
        if (options.american) {
          date_string = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
        } else {
          date_string = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        }
        return options.string ? date_string : date;
      };
      Chance2.prototype.hammertime = function(options) {
        return this.date(options).getTime();
      };
      Chance2.prototype.hour = function(options) {
        options = initOptions(options, {
          min: options && options.twentyfour ? 0 : 1,
          max: options && options.twentyfour ? 23 : 12
        });
        testRange(options.min < 0, "Chance: Min cannot be less than 0.");
        testRange(options.twentyfour && options.max > 23, "Chance: Max cannot be greater than 23 for twentyfour option.");
        testRange(!options.twentyfour && options.max > 12, "Chance: Max cannot be greater than 12.");
        testRange(options.min > options.max, "Chance: Min cannot be greater than Max.");
        return this.natural({ min: options.min, max: options.max });
      };
      Chance2.prototype.millisecond = function() {
        return this.natural({ max: 999 });
      };
      Chance2.prototype.minute = Chance2.prototype.second = function(options) {
        options = initOptions(options, { min: 0, max: 59 });
        testRange(options.min < 0, "Chance: Min cannot be less than 0.");
        testRange(options.max > 59, "Chance: Max cannot be greater than 59.");
        testRange(options.min > options.max, "Chance: Min cannot be greater than Max.");
        return this.natural({ min: options.min, max: options.max });
      };
      Chance2.prototype.month = function(options) {
        options = initOptions(options, { min: 1, max: 12 });
        testRange(options.min < 1, "Chance: Min cannot be less than 1.");
        testRange(options.max > 12, "Chance: Max cannot be greater than 12.");
        testRange(options.min > options.max, "Chance: Min cannot be greater than Max.");
        var month = this.pick(this.months().slice(options.min - 1, options.max));
        return options.raw ? month : month.name;
      };
      Chance2.prototype.months = function() {
        return this.get("months");
      };
      Chance2.prototype.second = function() {
        return this.natural({ max: 59 });
      };
      Chance2.prototype.timestamp = function() {
        return this.natural({ min: 1, max: parseInt(new Date().getTime() / 1e3, 10) });
      };
      Chance2.prototype.weekday = function(options) {
        options = initOptions(options, { weekday_only: false });
        var weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        if (!options.weekday_only) {
          weekdays.push("Saturday");
          weekdays.push("Sunday");
        }
        return this.pickone(weekdays);
      };
      Chance2.prototype.year = function(options) {
        options = initOptions(options, { min: new Date().getFullYear() });
        options.max = typeof options.max !== "undefined" ? options.max : options.min + 100;
        return this.natural(options).toString();
      };
      Chance2.prototype.cc = function(options) {
        options = initOptions(options);
        var type, number, to_generate;
        type = options.type ? this.cc_type({ name: options.type, raw: true }) : this.cc_type({ raw: true });
        number = type.prefix.split("");
        to_generate = type.length - type.prefix.length - 1;
        number = number.concat(this.n(this.integer, to_generate, { min: 0, max: 9 }));
        number.push(this.luhn_calculate(number.join("")));
        return number.join("");
      };
      Chance2.prototype.cc_types = function() {
        return this.get("cc_types");
      };
      Chance2.prototype.cc_type = function(options) {
        options = initOptions(options);
        var types = this.cc_types(), type = null;
        if (options.name) {
          for (var i = 0; i < types.length; i++) {
            if (types[i].name === options.name || types[i].short_name === options.name) {
              type = types[i];
              break;
            }
          }
          if (type === null) {
            throw new RangeError("Chance: Credit card type '" + options.name + "' is not supported");
          }
        } else {
          type = this.pick(types);
        }
        return options.raw ? type : type.name;
      };
      Chance2.prototype.currency_types = function() {
        return this.get("currency_types");
      };
      Chance2.prototype.currency = function() {
        return this.pick(this.currency_types());
      };
      Chance2.prototype.timezones = function() {
        return this.get("timezones");
      };
      Chance2.prototype.timezone = function() {
        return this.pick(this.timezones());
      };
      Chance2.prototype.currency_pair = function(returnAsString) {
        var currencies = this.unique(this.currency, 2, {
          comparator: function(arr, val) {
            return arr.reduce(function(acc, item) {
              return acc || item.code === val.code;
            }, false);
          }
        });
        if (returnAsString) {
          return currencies[0].code + "/" + currencies[1].code;
        } else {
          return currencies;
        }
      };
      Chance2.prototype.dollar = function(options) {
        options = initOptions(options, { max: 1e4, min: 0 });
        var dollar = this.floating({ min: options.min, max: options.max, fixed: 2 }).toString(), cents = dollar.split(".")[1];
        if (cents === void 0) {
          dollar += ".00";
        } else if (cents.length < 2) {
          dollar = dollar + "0";
        }
        if (dollar < 0) {
          return "-$" + dollar.replace("-", "");
        } else {
          return "$" + dollar;
        }
      };
      Chance2.prototype.euro = function(options) {
        return Number(this.dollar(options).replace("$", "")).toLocaleString() + "\u20AC";
      };
      Chance2.prototype.exp = function(options) {
        options = initOptions(options);
        var exp = {};
        exp.year = this.exp_year();
        if (exp.year === new Date().getFullYear().toString()) {
          exp.month = this.exp_month({ future: true });
        } else {
          exp.month = this.exp_month();
        }
        return options.raw ? exp : exp.month + "/" + exp.year;
      };
      Chance2.prototype.exp_month = function(options) {
        options = initOptions(options);
        var month, month_int, curMonth = new Date().getMonth() + 1;
        if (options.future && curMonth !== 12) {
          do {
            month = this.month({ raw: true }).numeric;
            month_int = parseInt(month, 10);
          } while (month_int <= curMonth);
        } else {
          month = this.month({ raw: true }).numeric;
        }
        return month;
      };
      Chance2.prototype.exp_year = function() {
        var curMonth = new Date().getMonth() + 1, curYear = new Date().getFullYear();
        return this.year({ min: curMonth === 12 ? curYear + 1 : curYear, max: curYear + 10 });
      };
      Chance2.prototype.vat = function(options) {
        options = initOptions(options, { country: "it" });
        switch (options.country.toLowerCase()) {
          case "it":
            return this.it_vat();
        }
      };
      Chance2.prototype.iban = function() {
        var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var alphanum = alpha + "0123456789";
        var iban = this.string({ length: 2, pool: alpha }) + this.pad(this.integer({ min: 0, max: 99 }), 2) + this.string({ length: 4, pool: alphanum }) + this.pad(this.natural(), this.natural({ min: 6, max: 26 }));
        return iban;
      };
      Chance2.prototype.it_vat = function() {
        var it_vat = this.natural({ min: 1, max: 18e5 });
        it_vat = this.pad(it_vat, 7) + this.pad(this.pick(this.provinces({ country: "it" })).code, 3);
        return it_vat + this.luhn_calculate(it_vat);
      };
      Chance2.prototype.cf = function(options) {
        options = options || {};
        var gender = !!options.gender ? options.gender : this.gender(), first = !!options.first ? options.first : this.first({ gender, nationality: "it" }), last = !!options.last ? options.last : this.last({ nationality: "it" }), birthday = !!options.birthday ? options.birthday : this.birthday(), city = !!options.city ? options.city : this.pickone(["A", "B", "C", "D", "E", "F", "G", "H", "I", "L", "M", "Z"]) + this.pad(this.natural({ max: 999 }), 3), cf = [], name_generator = function(name, isLast) {
          var temp, return_value = [];
          if (name.length < 3) {
            return_value = name.split("").concat("XXX".split("")).splice(0, 3);
          } else {
            temp = name.toUpperCase().split("").map(function(c) {
              return "BCDFGHJKLMNPRSTVWZ".indexOf(c) !== -1 ? c : void 0;
            }).join("");
            if (temp.length > 3) {
              if (isLast) {
                temp = temp.substr(0, 3);
              } else {
                temp = temp[0] + temp.substr(2, 2);
              }
            }
            if (temp.length < 3) {
              return_value = temp;
              temp = name.toUpperCase().split("").map(function(c) {
                return "AEIOU".indexOf(c) !== -1 ? c : void 0;
              }).join("").substr(0, 3 - return_value.length);
            }
            return_value = return_value + temp;
          }
          return return_value;
        }, date_generator = function(birthday2, gender2, that) {
          var lettermonths = ["A", "B", "C", "D", "E", "H", "L", "M", "P", "R", "S", "T"];
          return birthday2.getFullYear().toString().substr(2) + lettermonths[birthday2.getMonth()] + that.pad(birthday2.getDate() + (gender2.toLowerCase() === "female" ? 40 : 0), 2);
        }, checkdigit_generator = function(cf2) {
          var range1 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", range2 = "ABCDEFGHIJABCDEFGHIJKLMNOPQRSTUVWXYZ", evens = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", odds = "BAKPLCQDREVOSFTGUHMINJWZYX", digit = 0;
          for (var i = 0; i < 15; i++) {
            if (i % 2 !== 0) {
              digit += evens.indexOf(range2[range1.indexOf(cf2[i])]);
            } else {
              digit += odds.indexOf(range2[range1.indexOf(cf2[i])]);
            }
          }
          return evens[digit % 26];
        };
        cf = cf.concat(name_generator(last, true), name_generator(first), date_generator(birthday, gender, this), city.toUpperCase().split("")).join("");
        cf += checkdigit_generator(cf.toUpperCase(), this);
        return cf.toUpperCase();
      };
      Chance2.prototype.pl_pesel = function() {
        var number = this.natural({ min: 1, max: 9999999999 });
        var arr = this.pad(number, 10).split("");
        for (var i = 0; i < arr.length; i++) {
          arr[i] = parseInt(arr[i]);
        }
        var controlNumber = (1 * arr[0] + 3 * arr[1] + 7 * arr[2] + 9 * arr[3] + 1 * arr[4] + 3 * arr[5] + 7 * arr[6] + 9 * arr[7] + 1 * arr[8] + 3 * arr[9]) % 10;
        if (controlNumber !== 0) {
          controlNumber = 10 - controlNumber;
        }
        return arr.join("") + controlNumber;
      };
      Chance2.prototype.pl_nip = function() {
        var number = this.natural({ min: 1, max: 999999999 });
        var arr = this.pad(number, 9).split("");
        for (var i = 0; i < arr.length; i++) {
          arr[i] = parseInt(arr[i]);
        }
        var controlNumber = (6 * arr[0] + 5 * arr[1] + 7 * arr[2] + 2 * arr[3] + 3 * arr[4] + 4 * arr[5] + 5 * arr[6] + 6 * arr[7] + 7 * arr[8]) % 11;
        if (controlNumber === 10) {
          return this.pl_nip();
        }
        return arr.join("") + controlNumber;
      };
      Chance2.prototype.pl_regon = function() {
        var number = this.natural({ min: 1, max: 99999999 });
        var arr = this.pad(number, 8).split("");
        for (var i = 0; i < arr.length; i++) {
          arr[i] = parseInt(arr[i]);
        }
        var controlNumber = (8 * arr[0] + 9 * arr[1] + 2 * arr[2] + 3 * arr[3] + 4 * arr[4] + 5 * arr[5] + 6 * arr[6] + 7 * arr[7]) % 11;
        if (controlNumber === 10) {
          controlNumber = 0;
        }
        return arr.join("") + controlNumber;
      };
      Chance2.prototype.note = function(options) {
        options = initOptions(options, { notes: "flatKey" });
        var scales = {
          naturals: ["C", "D", "E", "F", "G", "A", "B"],
          flats: ["D\u266D", "E\u266D", "G\u266D", "A\u266D", "B\u266D"],
          sharps: ["C\u266F", "D\u266F", "F\u266F", "G\u266F", "A\u266F"]
        };
        scales.all = scales.naturals.concat(scales.flats.concat(scales.sharps));
        scales.flatKey = scales.naturals.concat(scales.flats);
        scales.sharpKey = scales.naturals.concat(scales.sharps);
        return this.pickone(scales[options.notes]);
      };
      Chance2.prototype.midi_note = function(options) {
        var min = 0;
        var max = 127;
        options = initOptions(options, { min, max });
        return this.integer({ min: options.min, max: options.max });
      };
      Chance2.prototype.chord_quality = function(options) {
        options = initOptions(options, { jazz: true });
        var chord_qualities = ["maj", "min", "aug", "dim"];
        if (options.jazz) {
          chord_qualities = [
            "maj7",
            "min7",
            "7",
            "sus",
            "dim",
            "\xF8"
          ];
        }
        return this.pickone(chord_qualities);
      };
      Chance2.prototype.chord = function(options) {
        options = initOptions(options);
        return this.note(options) + this.chord_quality(options);
      };
      Chance2.prototype.tempo = function(options) {
        var min = 40;
        var max = 320;
        options = initOptions(options, { min, max });
        return this.integer({ min: options.min, max: options.max });
      };
      Chance2.prototype.coin = function() {
        return this.bool() ? "heads" : "tails";
      };
      function diceFn(range2) {
        return function() {
          return this.natural(range2);
        };
      }
      Chance2.prototype.d4 = diceFn({ min: 1, max: 4 });
      Chance2.prototype.d6 = diceFn({ min: 1, max: 6 });
      Chance2.prototype.d8 = diceFn({ min: 1, max: 8 });
      Chance2.prototype.d10 = diceFn({ min: 1, max: 10 });
      Chance2.prototype.d12 = diceFn({ min: 1, max: 12 });
      Chance2.prototype.d20 = diceFn({ min: 1, max: 20 });
      Chance2.prototype.d30 = diceFn({ min: 1, max: 30 });
      Chance2.prototype.d100 = diceFn({ min: 1, max: 100 });
      Chance2.prototype.rpg = function(thrown, options) {
        options = initOptions(options);
        if (!thrown) {
          throw new RangeError("Chance: A type of die roll must be included");
        } else {
          var bits = thrown.toLowerCase().split("d"), rolls = [];
          if (bits.length !== 2 || !parseInt(bits[0], 10) || !parseInt(bits[1], 10)) {
            throw new Error("Chance: Invalid format provided. Please provide #d# where the first # is the number of dice to roll, the second # is the max of each die");
          }
          for (var i = bits[0]; i > 0; i--) {
            rolls[i - 1] = this.natural({ min: 1, max: bits[1] });
          }
          return typeof options.sum !== "undefined" && options.sum ? rolls.reduce(function(p, c) {
            return p + c;
          }) : rolls;
        }
      };
      Chance2.prototype.guid = function(options) {
        options = initOptions(options, { version: 5 });
        var guid_pool = "abcdef1234567890", variant_pool = "ab89", guid = this.string({ pool: guid_pool, length: 8 }) + "-" + this.string({ pool: guid_pool, length: 4 }) + "-" + options.version + this.string({ pool: guid_pool, length: 3 }) + "-" + this.string({ pool: variant_pool, length: 1 }) + this.string({ pool: guid_pool, length: 3 }) + "-" + this.string({ pool: guid_pool, length: 12 });
        return guid;
      };
      Chance2.prototype.hash = function(options) {
        options = initOptions(options, { length: 40, casing: "lower" });
        var pool = options.casing === "upper" ? HEX_POOL.toUpperCase() : HEX_POOL;
        return this.string({ pool, length: options.length });
      };
      Chance2.prototype.luhn_check = function(num) {
        var str = num.toString();
        var checkDigit = +str.substring(str.length - 1);
        return checkDigit === this.luhn_calculate(+str.substring(0, str.length - 1));
      };
      Chance2.prototype.luhn_calculate = function(num) {
        var digits = num.toString().split("").reverse();
        var sum = 0;
        var digit;
        for (var i = 0, l = digits.length; l > i; ++i) {
          digit = +digits[i];
          if (i % 2 === 0) {
            digit *= 2;
            if (digit > 9) {
              digit -= 9;
            }
          }
          sum += digit;
        }
        return sum * 9 % 10;
      };
      Chance2.prototype.md5 = function(options) {
        var opts = { str: "", key: null, raw: false };
        if (!options) {
          opts.str = this.string();
          options = {};
        } else if (typeof options === "string") {
          opts.str = options;
          options = {};
        } else if (typeof options !== "object") {
          return null;
        } else if (options.constructor === "Array") {
          return null;
        }
        opts = initOptions(options, opts);
        if (!opts.str) {
          throw new Error("A parameter is required to return an md5 hash.");
        }
        return this.bimd5.md5(opts.str, opts.key, opts.raw);
      };
      Chance2.prototype.file = function(options) {
        var fileOptions = options || {};
        var poolCollectionKey = "fileExtension";
        var typeRange = Object.keys(this.get("fileExtension"));
        var fileName;
        var fileExtension;
        fileName = this.word({ length: fileOptions.length });
        if (fileOptions.extension) {
          fileExtension = fileOptions.extension;
          return fileName + "." + fileExtension;
        }
        if (fileOptions.extensions) {
          if (Array.isArray(fileOptions.extensions)) {
            fileExtension = this.pickone(fileOptions.extensions);
            return fileName + "." + fileExtension;
          } else if (fileOptions.extensions.constructor === Object) {
            var extensionObjectCollection = fileOptions.extensions;
            var keys = Object.keys(extensionObjectCollection);
            fileExtension = this.pickone(extensionObjectCollection[this.pickone(keys)]);
            return fileName + "." + fileExtension;
          }
          throw new Error("Chance: Extensions must be an Array or Object");
        }
        if (fileOptions.fileType) {
          var fileType = fileOptions.fileType;
          if (typeRange.indexOf(fileType) !== -1) {
            fileExtension = this.pickone(this.get(poolCollectionKey)[fileType]);
            return fileName + "." + fileExtension;
          }
          throw new RangeError("Chance: Expect file type value to be 'raster', 'vector', '3d' or 'document'");
        }
        fileExtension = this.pickone(this.get(poolCollectionKey)[this.pickone(typeRange)]);
        return fileName + "." + fileExtension;
      };
      var data = {
        firstNames: {
          "male": {
            "en": ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Charles", "Thomas", "Christopher", "Daniel", "Matthew", "George", "Donald", "Anthony", "Paul", "Mark", "Edward", "Steven", "Kenneth", "Andrew", "Brian", "Joshua", "Kevin", "Ronald", "Timothy", "Jason", "Jeffrey", "Frank", "Gary", "Ryan", "Nicholas", "Eric", "Stephen", "Jacob", "Larry", "Jonathan", "Scott", "Raymond", "Justin", "Brandon", "Gregory", "Samuel", "Benjamin", "Patrick", "Jack", "Henry", "Walter", "Dennis", "Jerry", "Alexander", "Peter", "Tyler", "Douglas", "Harold", "Aaron", "Jose", "Adam", "Arthur", "Zachary", "Carl", "Nathan", "Albert", "Kyle", "Lawrence", "Joe", "Willie", "Gerald", "Roger", "Keith", "Jeremy", "Terry", "Harry", "Ralph", "Sean", "Jesse", "Roy", "Louis", "Billy", "Austin", "Bruce", "Eugene", "Christian", "Bryan", "Wayne", "Russell", "Howard", "Fred", "Ethan", "Jordan", "Philip", "Alan", "Juan", "Randy", "Vincent", "Bobby", "Dylan", "Johnny", "Phillip", "Victor", "Clarence", "Ernest", "Martin", "Craig", "Stanley", "Shawn", "Travis", "Bradley", "Leonard", "Earl", "Gabriel", "Jimmy", "Francis", "Todd", "Noah", "Danny", "Dale", "Cody", "Carlos", "Allen", "Frederick", "Logan", "Curtis", "Alex", "Joel", "Luis", "Norman", "Marvin", "Glenn", "Tony", "Nathaniel", "Rodney", "Melvin", "Alfred", "Steve", "Cameron", "Chad", "Edwin", "Caleb", "Evan", "Antonio", "Lee", "Herbert", "Jeffery", "Isaac", "Derek", "Ricky", "Marcus", "Theodore", "Elijah", "Luke", "Jesus", "Eddie", "Troy", "Mike", "Dustin", "Ray", "Adrian", "Bernard", "Leroy", "Angel", "Randall", "Wesley", "Ian", "Jared", "Mason", "Hunter", "Calvin", "Oscar", "Clifford", "Jay", "Shane", "Ronnie", "Barry", "Lucas", "Corey", "Manuel", "Leo", "Tommy", "Warren", "Jackson", "Isaiah", "Connor", "Don", "Dean", "Jon", "Julian", "Miguel", "Bill", "Lloyd", "Charlie", "Mitchell", "Leon", "Jerome", "Darrell", "Jeremiah", "Alvin", "Brett", "Seth", "Floyd", "Jim", "Blake", "Micheal", "Gordon", "Trevor", "Lewis", "Erik", "Edgar", "Vernon", "Devin", "Gavin", "Jayden", "Chris", "Clyde", "Tom", "Derrick", "Mario", "Brent", "Marc", "Herman", "Chase", "Dominic", "Ricardo", "Franklin", "Maurice", "Max", "Aiden", "Owen", "Lester", "Gilbert", "Elmer", "Gene", "Francisco", "Glen", "Cory", "Garrett", "Clayton", "Sam", "Jorge", "Chester", "Alejandro", "Jeff", "Harvey", "Milton", "Cole", "Ivan", "Andre", "Duane", "Landon"],
            "it": ["Adolfo", "Alberto", "Aldo", "Alessandro", "Alessio", "Alfredo", "Alvaro", "Andrea", "Angelo", "Angiolo", "Antonino", "Antonio", "Attilio", "Benito", "Bernardo", "Bruno", "Carlo", "Cesare", "Christian", "Claudio", "Corrado", "Cosimo", "Cristian", "Cristiano", "Daniele", "Dario", "David", "Davide", "Diego", "Dino", "Domenico", "Duccio", "Edoardo", "Elia", "Elio", "Emanuele", "Emiliano", "Emilio", "Enrico", "Enzo", "Ettore", "Fabio", "Fabrizio", "Federico", "Ferdinando", "Fernando", "Filippo", "Francesco", "Franco", "Gabriele", "Giacomo", "Giampaolo", "Giampiero", "Giancarlo", "Gianfranco", "Gianluca", "Gianmarco", "Gianni", "Gino", "Giorgio", "Giovanni", "Giuliano", "Giulio", "Giuseppe", "Graziano", "Gregorio", "Guido", "Iacopo", "Jacopo", "Lapo", "Leonardo", "Lorenzo", "Luca", "Luciano", "Luigi", "Manuel", "Marcello", "Marco", "Marino", "Mario", "Massimiliano", "Massimo", "Matteo", "Mattia", "Maurizio", "Mauro", "Michele", "Mirko", "Mohamed", "Nello", "Neri", "Niccol\xF2", "Nicola", "Osvaldo", "Otello", "Paolo", "Pier Luigi", "Piero", "Pietro", "Raffaele", "Remo", "Renato", "Renzo", "Riccardo", "Roberto", "Rolando", "Romano", "Salvatore", "Samuele", "Sandro", "Sergio", "Silvano", "Simone", "Stefano", "Thomas", "Tommaso", "Ubaldo", "Ugo", "Umberto", "Valerio", "Valter", "Vasco", "Vincenzo", "Vittorio"],
            "nl": ["Aaron", "Abel", "Adam", "Adriaan", "Albert", "Alexander", "Ali", "Arjen", "Arno", "Bart", "Bas", "Bastiaan", "Benjamin", "Bob", "Boris", "Bram", "Brent", "Cas", "Casper", "Chris", "Christiaan", "Cornelis", "Daan", "Daley", "Damian", "Dani", "Daniel", "Dani\xEBl", "David", "Dean", "Dirk", "Dylan", "Egbert", "Elijah", "Erik", "Erwin", "Evert", "Ezra", "Fabian", "Fedde", "Finn", "Florian", "Floris", "Frank", "Frans", "Frederik", "Freek", "Geert", "Gerard", "Gerben", "Gerrit", "Gijs", "Guus", "Hans", "Hendrik", "Henk", "Herman", "Hidde", "Hugo", "Jaap", "Jan Jaap", "Jan-Willem", "Jack", "Jacob", "Jan", "Jason", "Jasper", "Jayden", "Jelle", "Jelte", "Jens", "Jeroen", "Jesse", "Jim", "Job", "Joep", "Johannes", "John", "Jonathan", "Joris", "Joshua", "Jo\xEBl", "Julian", "Kees", "Kevin", "Koen", "Lars", "Laurens", "Leendert", "Lennard", "Lodewijk", "Luc", "Luca", "Lucas", "Lukas", "Luuk", "Maarten", "Marcus", "Martijn", "Martin", "Matthijs", "Maurits", "Max", "Mees", "Melle", "Mick", "Mika", "Milan", "Mohamed", "Mohammed", "Morris", "Muhammed", "Nathan", "Nick", "Nico", "Niek", "Niels", "Noah", "Noud", "Olivier", "Oscar", "Owen", "Paul", "Pepijn", "Peter", "Pieter", "Pim", "Quinten", "Reinier", "Rens", "Robin", "Ruben", "Sam", "Samuel", "Sander", "Sebastiaan", "Sem", "Sep", "Sepp", "Siem", "Simon", "Stan", "Stef", "Steven", "Stijn", "Sven", "Teun", "Thijmen", "Thijs", "Thomas", "Tijn", "Tim", "Timo", "Tobias", "Tom", "Victor", "Vince", "Willem", "Wim", "Wouter", "Yusuf"],
            "fr": ["Aaron", "Abdon", "Abel", "Ab\xE9lard", "Abelin", "Abondance", "Abraham", "Absalon", "Acace", "Achaire", "Achille", "Adalard", "Adalbald", "Adalb\xE9ron", "Adalbert", "Adalric", "Adam", "Adegrin", "Adel", "Adelin", "Andelin", "Adelphe", "Adam", "Ad\xE9odat", "Adh\xE9mar", "Adjutor", "Adolphe", "Adonis", "Adon", "Adrien", "Agapet", "Agathange", "Agathon", "Agilbert", "Ag\xE9nor", "Agnan", "Aignan", "Agrippin", "Aimable", "Aim\xE9", "Alain", "Alban", "Albin", "Aubin", "Alb\xE9ric", "Albert", "Albertet", "Alcibiade", "Alcide", "Alc\xE9e", "Alcime", "Aldonce", "Aldric", "Ald\xE9ric", "Aleaume", "Alexandre", "Alexis", "Alix", "Alliaume", "Aleaume", "Almine", "Almire", "Alo\xEFs", "Alph\xE9e", "Alphonse", "Alpinien", "Alver\xE8de", "Amalric", "Amaury", "Amandin", "Amant", "Ambroise", "Am\xE9d\xE9e", "Am\xE9lien", "Amiel", "Amour", "Ana\xEBl", "Anastase", "Anatole", "Ancelin", "And\xE9ol", "Andoche", "Andr\xE9", "Andoche", "Ange", "Angelin", "Angilbe", "Anglebert", "Angoustan", "Anicet", "Anne", "Annibal", "Ansbert", "Anselme", "Anthelme", "Antheaume", "Anthime", "Antide", "Antoine", "Antonius", "Antonin", "Apollinaire", "Apollon", "Aquilin", "Arcade", "Archambaud", "Archambeau", "Archange", "Archibald", "Arian", "Ariel", "Ariste", "Aristide", "Armand", "Armel", "Armin", "Arnould", "Arnaud", "Arolde", "Ars\xE8ne", "Arsino\xE9", "Arthaud", "Arth\xE8me", "Arthur", "Ascelin", "Athanase", "Aubry", "Audebert", "Audouin", "Audran", "Audric", "Auguste", "Augustin", "Aur\xE8le", "Aur\xE9lien", "Aurian", "Auxence", "Axel", "Aymard", "Aymeric", "Aymon", "Aymond", "Balthazar", "Baptiste", "Barnab\xE9", "Barth\xE9lemy", "Bartim\xE9e", "Basile", "Bastien", "Baudouin", "B\xE9nigne", "Benjamin", "Beno\xEEt", "B\xE9renger", "B\xE9rard", "Bernard", "Bertrand", "Blaise", "Bon", "Boniface", "Bouchard", "Brice", "Brieuc", "Bruno", "Brunon", "Calixte", "Calliste", "Cam\xE9lien", "Camille", "Camillien", "Candide", "Caribert", "Carloman", "Cassandre", "Cassien", "C\xE9dric", "C\xE9leste", "C\xE9lestin", "C\xE9lien", "C\xE9saire", "C\xE9sar", "Charles", "Charlemagne", "Childebert", "Chilp\xE9ric", "Chr\xE9tien", "Christian", "Christodule", "Christophe", "Chrysostome", "Clarence", "Claude", "Claudien", "Cl\xE9andre", "Cl\xE9ment", "Clotaire", "C\xF4me", "Constance", "Constant", "Constantin", "Corentin", "Cyprien", "Cyriaque", "Cyrille", "Cyril", "Damien", "Daniel", "David", "Delphin", "Denis", "D\xE9sir\xE9", "Didier", "Dieudonn\xE9", "Dimitri", "Dominique", "Dorian", "Doroth\xE9e", "Edgard", "Edmond", "\xC9douard", "\xC9leuth\xE8re", "\xC9lie", "\xC9lis\xE9e", "\xC9meric", "\xC9mile", "\xC9milien", "Emmanuel", "Enguerrand", "\xC9piphane", "\xC9ric", "Esprit", "Ernest", "\xC9tienne", "Eubert", "Eudes", "Eudoxe", "Eug\xE8ne", "Eus\xE8be", "Eustache", "\xC9variste", "\xC9vrard", "Fabien", "Fabrice", "Falba", "F\xE9licit\xE9", "F\xE9lix", "Ferdinand", "Fiacre", "Fid\xE8le", "Firmin", "Flavien", "Flodoard", "Florent", "Florentin", "Florestan", "Florian", "Fortun\xE9", "Foulques", "Francisque", "Fran\xE7ois", "Fran\xE7ais", "Franciscus", "Francs", "Fr\xE9d\xE9ric", "Fulbert", "Fulcran", "Fulgence", "Gabin", "Gabriel", "Ga\xEBl", "Garnier", "Gaston", "Gaspard", "Gatien", "Gaud", "Gautier", "G\xE9d\xE9on", "Geoffroy", "Georges", "G\xE9raud", "G\xE9rard", "Gerbert", "Germain", "Gervais", "Ghislain", "Gilbert", "Gilles", "Girart", "Gislebert", "Gondebaud", "Gonthier", "Gontran", "Gonzague", "Gr\xE9goire", "Gu\xE9rin", "Gui", "Guillaume", "Gustave", "Guy", "Guyot", "Hardouin", "Hector", "H\xE9delin", "H\xE9lier", "Henri", "Herbert", "Herluin", "Herv\xE9", "Hilaire", "Hildebert", "Hincmar", "Hippolyte", "Honor\xE9", "Hubert", "Hugues", "Innocent", "Isabeau", "Isidore", "Jacques", "Japhet", "Jason", "Jean", "Jeannel", "Jeannot", "J\xE9r\xE9mie", "J\xE9r\xF4me", "Joachim", "Joanny", "Job", "Jocelyn", "Jo\xEBl", "Johan", "Jonas", "Jonathan", "Joseph", "Josse", "Josselin", "Jourdain", "Jude", "Judica\xEBl", "Jules", "Julien", "Juste", "Justin", "Lambert", "Landry", "Laurent", "Lazare", "L\xE9andre", "L\xE9on", "L\xE9onard", "L\xE9opold", "Leu", "Loup", "Leufroy", "Lib\xE8re", "Li\xE9tald", "Lionel", "Lo\xEFc", "Longin", "Lorrain", "Lorraine", "Lothaire", "Louis", "Loup", "Luc", "Lucas", "Lucien", "Ludolphe", "Ludovic", "Macaire", "Malo", "Mamert", "Manass\xE9", "Marc", "Marceau", "Marcel", "Marcelin", "Marius", "Marseille", "Martial", "Martin", "Mathurin", "Matthias", "Mathias", "Matthieu", "Maugis", "Maurice", "Mauricet", "Maxence", "Maxime", "Maximilien", "Mayeul", "M\xE9d\xE9ric", "Melchior", "Mence", "Merlin", "M\xE9rov\xE9e", "Micha\xEBl", "Michel", "Mo\xEFse", "Morgan", "Nathan", "Nathana\xEBl", "Narcisse", "N\xE9h\xE9mie", "Nestor", "Nestor", "Nic\xE9phore", "Nicolas", "No\xE9", "No\xEBl", "Norbert", "Normand", "Normands", "Octave", "Odilon", "Odon", "Oger", "Olivier", "Oury", "Pac\xF4me", "Pal\xE9mon", "Parfait", "Pascal", "Paterne", "Patrice", "Paul", "P\xE9pin", "Perceval", "Phil\xE9mon", "Philibert", "Philippe", "Philoth\xE9e", "Pie", "Pierre", "Pierrick", "Prosper", "Quentin", "Raoul", "Rapha\xEBl", "Raymond", "R\xE9gis", "R\xE9jean", "R\xE9mi", "Renaud", "Ren\xE9", "Reybaud", "Richard", "Robert", "Roch", "Rodolphe", "Rodrigue", "Roger", "Roland", "Romain", "Romuald", "Rom\xE9o", "Rome", "Ronan", "Roselin", "Salomon", "Samuel", "Savin", "Savinien", "Scholastique", "S\xE9bastien", "S\xE9raphin", "Serge", "S\xE9verin", "Sidoine", "Sigebert", "Sigismond", "Silv\xE8re", "Simon", "Sim\xE9on", "Sixte", "Stanislas", "St\xE9phane", "Stephan", "Sylvain", "Sylvestre", "Tancr\xE8de", "Tanguy", "Taurin", "Th\xE9odore", "Th\xE9odose", "Th\xE9ophile", "Th\xE9ophraste", "Thibault", "Thibert", "Thierry", "Thomas", "Timol\xE9on", "Timoth\xE9e", "Titien", "Tonnin", "Toussaint", "Trajan", "Tristan", "Turold", "Tim", "Ulysse", "Urbain", "Valentin", "Val\xE8re", "Val\xE9ry", "Venance", "Venant", "Venceslas", "Vianney", "Victor", "Victorien", "Victorin", "Vigile", "Vincent", "Vital", "Vitalien", "Vivien", "Waleran", "Wandrille", "Xavier", "X\xE9nophon", "Yves", "Zacharie", "Zach\xE9", "Z\xE9phirin"]
          },
          "female": {
            "en": ["Mary", "Emma", "Elizabeth", "Minnie", "Margaret", "Ida", "Alice", "Bertha", "Sarah", "Annie", "Clara", "Ella", "Florence", "Cora", "Martha", "Laura", "Nellie", "Grace", "Carrie", "Maude", "Mabel", "Bessie", "Jennie", "Gertrude", "Julia", "Hattie", "Edith", "Mattie", "Rose", "Catherine", "Lillian", "Ada", "Lillie", "Helen", "Jessie", "Louise", "Ethel", "Lula", "Myrtle", "Eva", "Frances", "Lena", "Lucy", "Edna", "Maggie", "Pearl", "Daisy", "Fannie", "Josephine", "Dora", "Rosa", "Katherine", "Agnes", "Marie", "Nora", "May", "Mamie", "Blanche", "Stella", "Ellen", "Nancy", "Effie", "Sallie", "Nettie", "Della", "Lizzie", "Flora", "Susie", "Maud", "Mae", "Etta", "Harriet", "Sadie", "Caroline", "Katie", "Lydia", "Elsie", "Kate", "Susan", "Mollie", "Alma", "Addie", "Georgia", "Eliza", "Lulu", "Nannie", "Lottie", "Amanda", "Belle", "Charlotte", "Rebecca", "Ruth", "Viola", "Olive", "Amelia", "Hannah", "Jane", "Virginia", "Emily", "Matilda", "Irene", "Kathryn", "Esther", "Willie", "Henrietta", "Ollie", "Amy", "Rachel", "Sara", "Estella", "Theresa", "Augusta", "Ora", "Pauline", "Josie", "Lola", "Sophia", "Leona", "Anne", "Mildred", "Ann", "Beulah", "Callie", "Lou", "Delia", "Eleanor", "Barbara", "Iva", "Louisa", "Maria", "Mayme", "Evelyn", "Estelle", "Nina", "Betty", "Marion", "Bettie", "Dorothy", "Luella", "Inez", "Lela", "Rosie", "Allie", "Millie", "Janie", "Cornelia", "Victoria", "Ruby", "Winifred", "Alta", "Celia", "Christine", "Beatrice", "Birdie", "Harriett", "Mable", "Myra", "Sophie", "Tillie", "Isabel", "Sylvia", "Carolyn", "Isabelle", "Leila", "Sally", "Ina", "Essie", "Bertie", "Nell", "Alberta", "Katharine", "Lora", "Rena", "Mina", "Rhoda", "Mathilda", "Abbie", "Eula", "Dollie", "Hettie", "Eunice", "Fanny", "Ola", "Lenora", "Adelaide", "Christina", "Lelia", "Nelle", "Sue", "Johanna", "Lilly", "Lucinda", "Minerva", "Lettie", "Roxie", "Cynthia", "Helena", "Hilda", "Hulda", "Bernice", "Genevieve", "Jean", "Cordelia", "Marian", "Francis", "Jeanette", "Adeline", "Gussie", "Leah", "Lois", "Lura", "Mittie", "Hallie", "Isabella", "Olga", "Phoebe", "Teresa", "Hester", "Lida", "Lina", "Winnie", "Claudia", "Marguerite", "Vera", "Cecelia", "Bess", "Emilie", "Rosetta", "Verna", "Myrtie", "Cecilia", "Elva", "Olivia", "Ophelia", "Georgie", "Elnora", "Violet", "Adele", "Lily", "Linnie", "Loretta", "Madge", "Polly", "Virgie", "Eugenia", "Lucile", "Lucille", "Mabelle", "Rosalie"],
            "it": ["Ada", "Adriana", "Alessandra", "Alessia", "Alice", "Angela", "Anna", "Anna Maria", "Annalisa", "Annita", "Annunziata", "Antonella", "Arianna", "Asia", "Assunta", "Aurora", "Barbara", "Beatrice", "Benedetta", "Bianca", "Bruna", "Camilla", "Carla", "Carlotta", "Carmela", "Carolina", "Caterina", "Catia", "Cecilia", "Chiara", "Cinzia", "Clara", "Claudia", "Costanza", "Cristina", "Daniela", "Debora", "Diletta", "Dina", "Donatella", "Elena", "Eleonora", "Elisa", "Elisabetta", "Emanuela", "Emma", "Eva", "Federica", "Fernanda", "Fiorella", "Fiorenza", "Flora", "Franca", "Francesca", "Gabriella", "Gaia", "Gemma", "Giada", "Gianna", "Gina", "Ginevra", "Giorgia", "Giovanna", "Giulia", "Giuliana", "Giuseppa", "Giuseppina", "Grazia", "Graziella", "Greta", "Ida", "Ilaria", "Ines", "Iolanda", "Irene", "Irma", "Isabella", "Jessica", "Laura", "Lea", "Letizia", "Licia", "Lidia", "Liliana", "Lina", "Linda", "Lisa", "Livia", "Loretta", "Luana", "Lucia", "Luciana", "Lucrezia", "Luisa", "Manuela", "Mara", "Marcella", "Margherita", "Maria", "Maria Cristina", "Maria Grazia", "Maria Luisa", "Maria Pia", "Maria Teresa", "Marina", "Marisa", "Marta", "Martina", "Marzia", "Matilde", "Melissa", "Michela", "Milena", "Mirella", "Monica", "Natalina", "Nella", "Nicoletta", "Noemi", "Olga", "Paola", "Patrizia", "Piera", "Pierina", "Raffaella", "Rebecca", "Renata", "Rina", "Rita", "Roberta", "Rosa", "Rosanna", "Rossana", "Rossella", "Sabrina", "Sandra", "Sara", "Serena", "Silvana", "Silvia", "Simona", "Simonetta", "Sofia", "Sonia", "Stefania", "Susanna", "Teresa", "Tina", "Tiziana", "Tosca", "Valentina", "Valeria", "Vanda", "Vanessa", "Vanna", "Vera", "Veronica", "Vilma", "Viola", "Virginia", "Vittoria"],
            "nl": ["Ada", "Arianne", "Afke", "Amanda", "Amber", "Amy", "Aniek", "Anita", "Anja", "Anna", "Anne", "Annelies", "Annemarie", "Annette", "Anouk", "Astrid", "Aukje", "Barbara", "Bianca", "Carla", "Carlijn", "Carolien", "Chantal", "Charlotte", "Claudia", "Dani\xEBlle", "Debora", "Diane", "Dora", "Eline", "Elise", "Ella", "Ellen", "Emma", "Esmee", "Evelien", "Esther", "Erica", "Eva", "Femke", "Fleur", "Floor", "Froukje", "Gea", "Gerda", "Hanna", "Hanneke", "Heleen", "Hilde", "Ilona", "Ina", "Inge", "Ingrid", "Iris", "Isabel", "Isabelle", "Janneke", "Jasmijn", "Jeanine", "Jennifer", "Jessica", "Johanna", "Joke", "Julia", "Julie", "Karen", "Karin", "Katja", "Kim", "Lara", "Laura", "Lena", "Lianne", "Lieke", "Lilian", "Linda", "Lisa", "Lisanne", "Lotte", "Louise", "Maaike", "Manon", "Marga", "Maria", "Marissa", "Marit", "Marjolein", "Martine", "Marleen", "Melissa", "Merel", "Miranda", "Michelle", "Mirjam", "Mirthe", "Naomi", "Natalie", "Nienke", "Nina", "Noortje", "Olivia", "Patricia", "Paula", "Paulien", "Ramona", "Ria", "Rianne", "Roos", "Rosanne", "Ruth", "Sabrina", "Sandra", "Sanne", "Sara", "Saskia", "Silvia", "Sofia", "Sophie", "Sonja", "Suzanne", "Tamara", "Tess", "Tessa", "Tineke", "Valerie", "Vanessa", "Veerle", "Vera", "Victoria", "Wendy", "Willeke", "Yvonne", "Zo\xEB"],
            "fr": ["Abdon", "Abel", "Abiga\xEBlle", "Abiga\xEFl", "Acacius", "Acanthe", "Adalbert", "Adalsinde", "Adegrine", "Ad\xE9la\xEFde", "Ad\xE8le", "Ad\xE9lie", "Adeline", "Adeltrude", "Adolphe", "Adonis", "Adrast\xE9e", "Adrehilde", "Adrienne", "Agathe", "Agilbert", "Agla\xE9", "Aignan", "Agnefl\xE8te", "Agn\xE8s", "Agrippine", "Aim\xE9", "Alaine", "Ala\xEFs", "Albane", "Alb\xE9rade", "Alberte", "Alcide", "Alcine", "Alcyone", "Aldegonde", "Aleth", "Alexandrine", "Alexine", "Alice", "Ali\xE9nor", "Aliette", "Aline", "Alix", "Aliz\xE9", "Alo\xEFse", "Aloyse", "Alphonsine", "Alth\xE9e", "Amaliane", "Amalth\xE9e", "Amande", "Amandine", "Amant", "Amarande", "Amaranthe", "Amaryllis", "Ambre", "Ambroisie", "Am\xE9lie", "Am\xE9thyste", "Aminte", "Ana\xEBl", "Ana\xEFs", "Anastasie", "Anatole", "Ancelin", "Andr\xE9e", "An\xE9mone", "Angadr\xEAme", "Ang\xE8le", "Angeline", "Ang\xE9lique", "Angilbert", "Anicet", "Annabelle", "Anne", "Annette", "Annick", "Annie", "Annonciade", "Ansbert", "Anstrudie", "Anthelme", "Antigone", "Antoinette", "Antonine", "Aph\xE9lie", "Apolline", "Apollonie", "Aquiline", "Arabelle", "Arcadie", "Archange", "Argine", "Ariane", "Aricie", "Ariel", "Arielle", "Arlette", "Armance", "Armande", "Armandine", "Armelle", "Armide", "Armelle", "Armin", "Arnaud", "Ars\xE8ne", "Arsino\xE9", "Art\xE9mis", "Arthur", "Ascelin", "Ascension", "Assomption", "Astart\xE9", "Ast\xE9rie", "Astr\xE9e", "Astrid", "Athalie", "Athanasie", "Athina", "Aube", "Albert", "Aude", "Audrey", "Augustine", "Aure", "Aur\xE9lie", "Aur\xE9lien", "Aur\xE8le", "Aurore", "Auxence", "Aveline", "Abiga\xEBlle", "Avoye", "Axelle", "Aymard", "Azal\xE9e", "Ad\xE8le", "Adeline", "Barbe", "Basilisse", "Bathilde", "B\xE9atrice", "B\xE9atrix", "B\xE9n\xE9dicte", "B\xE9reng\xE8re", "Bernadette", "Berthe", "Bertille", "Beuve", "Blanche", "Blanc", "Blandine", "Brigitte", "Brune", "Brunehilde", "Callista", "Camille", "Capucine", "Carine", "Caroline", "Cassandre", "Catherine", "C\xE9cile", "C\xE9leste", "C\xE9lestine", "C\xE9line", "Chantal", "Charl\xE8ne", "Charline", "Charlotte", "Chlo\xE9", "Christelle", "Christiane", "Christine", "Claire", "Clara", "Claude", "Claudine", "Clarisse", "Cl\xE9mence", "Cl\xE9mentine", "Cl\xE9o", "Clio", "Clotilde", "Coline", "Conception", "Constance", "Coralie", "Coraline", "Corentine", "Corinne", "Cyrielle", "Daniel", "Daniel", "Daphn\xE9", "D\xE9bora", "Delphine", "Denise", "Diane", "Dieudonn\xE9", "Dominique", "Doriane", "Doroth\xE9e", "Douce", "\xC9dith", "Edm\xE9e", "\xC9l\xE9onore", "\xC9liane", "\xC9lia", "\xC9liette", "\xC9lisabeth", "\xC9lise", "Ella", "\xC9lodie", "\xC9lo\xEFse", "Elsa", "\xC9meline", "\xC9m\xE9rance", "\xC9m\xE9rentienne", "\xC9m\xE9rencie", "\xC9milie", "Emma", "Emmanuelle", "Emmelie", "Ernestine", "Esther", "Estelle", "Eudoxie", "Eug\xE9nie", "Eulalie", "Euphrasie", "Eus\xE9bie", "\xC9vang\xE9line", "Eva", "\xC8ve", "\xC9velyne", "Fanny", "Fantine", "Faustine", "F\xE9licie", "Fernande", "Flavie", "Fleur", "Flore", "Florence", "Florie", "Fortun\xE9", "France", "Francia", "Fran\xE7oise", "Francine", "Gabrielle", "Ga\xEBlle", "Garance", "Genevi\xE8ve", "Georgette", "Gerberge", "Germaine", "Gertrude", "Gis\xE8le", "Gueni\xE8vre", "Guilhemine", "Guillemette", "Gustave", "Gwenael", "H\xE9l\xE8ne", "H\xE9lo\xEFse", "Henriette", "Hermine", "Hermione", "Hippolyte", "Honorine", "Hortense", "Huguette", "Ines", "Ir\xE8ne", "Irina", "Iris", "Isabeau", "Isabelle", "Iseult", "Isolde", "Ism\xE9rie", "Jacinthe", "Jacqueline", "Jade", "Janine", "Jeanne", "Jocelyne", "Jo\xEBlle", "Jos\xE9phine", "Judith", "Julia", "Julie", "Jules", "Juliette", "Justine", "Katy", "Kathy", "Katie", "Laura", "Laure", "Laureline", "Laurence", "Laurene", "Lauriane", "Laurianne", "Laurine", "L\xE9a", "L\xE9na", "L\xE9onie", "L\xE9on", "L\xE9ontine", "Lorraine", "Lucie", "Lucienne", "Lucille", "Ludivine", "Lydie", "Lydie", "Megane", "Madeleine", "Magali", "Maguelone", "Mallaury", "Manon", "Marceline", "Margot", "Marguerite", "Marianne", "Marie", "Myriam", "Marie", "Marine", "Marion", "Marl\xE8ne", "Marthe", "Martine", "Mathilde", "Maud", "Maureen", "Mauricette", "Maxime", "M\xE9lanie", "Melissa", "M\xE9lissandre", "M\xE9lisande", "M\xE9lodie", "Michel", "Micheline", "Mireille", "Miriam", "Mo\xEFse", "Monique", "Morgane", "Muriel", "Myl\xE8ne", "Nad\xE8ge", "Nadine", "Nathalie", "Nicole", "Nicolette", "Nine", "No\xEBl", "No\xE9mie", "Oc\xE9ane", "Odette", "Odile", "Olive", "Olivia", "Olympe", "Ombline", "Ombeline", "Oph\xE9lie", "Oriande", "Oriane", "Ozanne", "Pascale", "Pascaline", "Paule", "Paulette", "Pauline", "Priscille", "Prisca", "Prisque", "P\xE9cine", "P\xE9lagie", "P\xE9n\xE9lope", "Perrine", "P\xE9tronille", "Philippine", "Philom\xE8ne", "Philoth\xE9e", "Primerose", "Prudence", "Pulch\xE9rie", "Quentine", "Qui\xE9ta", "Quintia", "Quintilla", "Rachel", "Rapha\xEBlle", "Raymonde", "Rebecca", "R\xE9gine", "R\xE9jeanne", "Ren\xE9", "Rita", "Rita", "Rolande", "Romane", "Rosalie", "Rose", "Roseline", "Sabine", "Salom\xE9", "Sandra", "Sandrine", "Sarah", "S\xE9gol\xE8ne", "S\xE9verine", "Sibylle", "Simone", "Sixt", "Solange", "Soline", "Sol\xE8ne", "Sophie", "St\xE9phanie", "Suzanne", "Sylvain", "Sylvie", "Tatiana", "Tha\xEFs", "Th\xE9odora", "Th\xE9r\xE8se", "Tiphaine", "Ursule", "Valentine", "Val\xE9rie", "V\xE9ronique", "Victoire", "Victorine", "Vinciane", "Violette", "Virginie", "Viviane", "Xavi\xE8re", "Yolande", "Ysaline", "Yvette", "Yvonne", "Z\xE9lie", "Zita", "Zo\xE9"]
          }
        },
        lastNames: {
          "en": ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez", "James", "Watson", "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross", "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long", "Patterson", "Hughes", "Flores", "Washington", "Butler", "Simmons", "Foster", "Gonzales", "Bryant", "Alexander", "Russell", "Griffin", "Diaz", "Hayes", "Myers", "Ford", "Hamilton", "Graham", "Sullivan", "Wallace", "Woods", "Cole", "West", "Jordan", "Owens", "Reynolds", "Fisher", "Ellis", "Harrison", "Gibson", "McDonald", "Cruz", "Marshall", "Ortiz", "Gomez", "Murray", "Freeman", "Wells", "Webb", "Simpson", "Stevens", "Tucker", "Porter", "Hunter", "Hicks", "Crawford", "Henry", "Boyd", "Mason", "Morales", "Kennedy", "Warren", "Dixon", "Ramos", "Reyes", "Burns", "Gordon", "Shaw", "Holmes", "Rice", "Robertson", "Hunt", "Black", "Daniels", "Palmer", "Mills", "Nichols", "Grant", "Knight", "Ferguson", "Rose", "Stone", "Hawkins", "Dunn", "Perkins", "Hudson", "Spencer", "Gardner", "Stephens", "Payne", "Pierce", "Berry", "Matthews", "Arnold", "Wagner", "Willis", "Ray", "Watkins", "Olson", "Carroll", "Duncan", "Snyder", "Hart", "Cunningham", "Bradley", "Lane", "Andrews", "Ruiz", "Harper", "Fox", "Riley", "Armstrong", "Carpenter", "Weaver", "Greene", "Lawrence", "Elliott", "Chavez", "Sims", "Austin", "Peters", "Kelley", "Franklin", "Lawson", "Fields", "Gutierrez", "Ryan", "Schmidt", "Carr", "Vasquez", "Castillo", "Wheeler", "Chapman", "Oliver", "Montgomery", "Richards", "Williamson", "Johnston", "Banks", "Meyer", "Bishop", "McCoy", "Howell", "Alvarez", "Morrison", "Hansen", "Fernandez", "Garza", "Harvey", "Little", "Burton", "Stanley", "Nguyen", "George", "Jacobs", "Reid", "Kim", "Fuller", "Lynch", "Dean", "Gilbert", "Garrett", "Romero", "Welch", "Larson", "Frazier", "Burke", "Hanson", "Day", "Mendoza", "Moreno", "Bowman", "Medina", "Fowler", "Brewer", "Hoffman", "Carlson", "Silva", "Pearson", "Holland", "Douglas", "Fleming", "Jensen", "Vargas", "Byrd", "Davidson", "Hopkins", "May", "Terry", "Herrera", "Wade", "Soto", "Walters", "Curtis", "Neal", "Caldwell", "Lowe", "Jennings", "Barnett", "Graves", "Jimenez", "Horton", "Shelton", "Barrett", "Obrien", "Castro", "Sutton", "Gregory", "McKinney", "Lucas", "Miles", "Craig", "Rodriquez", "Chambers", "Holt", "Lambert", "Fletcher", "Watts", "Bates", "Hale", "Rhodes", "Pena", "Beck", "Newman", "Haynes", "McDaniel", "Mendez", "Bush", "Vaughn", "Parks", "Dawson", "Santiago", "Norris", "Hardy", "Love", "Steele", "Curry", "Powers", "Schultz", "Barker", "Guzman", "Page", "Munoz", "Ball", "Keller", "Chandler", "Weber", "Leonard", "Walsh", "Lyons", "Ramsey", "Wolfe", "Schneider", "Mullins", "Benson", "Sharp", "Bowen", "Daniel", "Barber", "Cummings", "Hines", "Baldwin", "Griffith", "Valdez", "Hubbard", "Salazar", "Reeves", "Warner", "Stevenson", "Burgess", "Santos", "Tate", "Cross", "Garner", "Mann", "Mack", "Moss", "Thornton", "Dennis", "McGee", "Farmer", "Delgado", "Aguilar", "Vega", "Glover", "Manning", "Cohen", "Harmon", "Rodgers", "Robbins", "Newton", "Todd", "Blair", "Higgins", "Ingram", "Reese", "Cannon", "Strickland", "Townsend", "Potter", "Goodwin", "Walton", "Rowe", "Hampton", "Ortega", "Patton", "Swanson", "Joseph", "Francis", "Goodman", "Maldonado", "Yates", "Becker", "Erickson", "Hodges", "Rios", "Conner", "Adkins", "Webster", "Norman", "Malone", "Hammond", "Flowers", "Cobb", "Moody", "Quinn", "Blake", "Maxwell", "Pope", "Floyd", "Osborne", "Paul", "McCarthy", "Guerrero", "Lindsey", "Estrada", "Sandoval", "Gibbs", "Tyler", "Gross", "Fitzgerald", "Stokes", "Doyle", "Sherman", "Saunders", "Wise", "Colon", "Gill", "Alvarado", "Greer", "Padilla", "Simon", "Waters", "Nunez", "Ballard", "Schwartz", "McBride", "Houston", "Christensen", "Klein", "Pratt", "Briggs", "Parsons", "McLaughlin", "Zimmerman", "French", "Buchanan", "Moran", "Copeland", "Roy", "Pittman", "Brady", "McCormick", "Holloway", "Brock", "Poole", "Frank", "Logan", "Owen", "Bass", "Marsh", "Drake", "Wong", "Jefferson", "Park", "Morton", "Abbott", "Sparks", "Patrick", "Norton", "Huff", "Clayton", "Massey", "Lloyd", "Figueroa", "Carson", "Bowers", "Roberson", "Barton", "Tran", "Lamb", "Harrington", "Casey", "Boone", "Cortez", "Clarke", "Mathis", "Singleton", "Wilkins", "Cain", "Bryan", "Underwood", "Hogan", "McKenzie", "Collier", "Luna", "Phelps", "McGuire", "Allison", "Bridges", "Wilkerson", "Nash", "Summers", "Atkins"],
          "it": ["Acciai", "Aglietti", "Agostini", "Agresti", "Ahmed", "Aiazzi", "Albanese", "Alberti", "Alessi", "Alfani", "Alinari", "Alterini", "Amato", "Ammannati", "Ancillotti", "Andrei", "Andreini", "Andreoni", "Angeli", "Anichini", "Antonelli", "Antonini", "Arena", "Ariani", "Arnetoli", "Arrighi", "Baccani", "Baccetti", "Bacci", "Bacherini", "Badii", "Baggiani", "Baglioni", "Bagni", "Bagnoli", "Baldassini", "Baldi", "Baldini", "Ballerini", "Balli", "Ballini", "Balloni", "Bambi", "Banchi", "Bandinelli", "Bandini", "Bani", "Barbetti", "Barbieri", "Barchielli", "Bardazzi", "Bardelli", "Bardi", "Barducci", "Bargellini", "Bargiacchi", "Barni", "Baroncelli", "Baroncini", "Barone", "Baroni", "Baronti", "Bartalesi", "Bartoletti", "Bartoli", "Bartolini", "Bartoloni", "Bartolozzi", "Basagni", "Basile", "Bassi", "Batacchi", "Battaglia", "Battaglini", "Bausi", "Becagli", "Becattini", "Becchi", "Becucci", "Bellandi", "Bellesi", "Belli", "Bellini", "Bellucci", "Bencini", "Benedetti", "Benelli", "Beni", "Benini", "Bensi", "Benucci", "Benvenuti", "Berlincioni", "Bernacchioni", "Bernardi", "Bernardini", "Berni", "Bernini", "Bertelli", "Berti", "Bertini", "Bessi", "Betti", "Bettini", "Biagi", "Biagini", "Biagioni", "Biagiotti", "Biancalani", "Bianchi", "Bianchini", "Bianco", "Biffoli", "Bigazzi", "Bigi", "Biliotti", "Billi", "Binazzi", "Bindi", "Bini", "Biondi", "Bizzarri", "Bocci", "Bogani", "Bolognesi", "Bonaiuti", "Bonanni", "Bonciani", "Boncinelli", "Bondi", "Bonechi", "Bongini", "Boni", "Bonini", "Borchi", "Boretti", "Borghi", "Borghini", "Borgioli", "Borri", "Borselli", "Boschi", "Bottai", "Bracci", "Braccini", "Brandi", "Braschi", "Bravi", "Brazzini", "Breschi", "Brilli", "Brizzi", "Brogelli", "Brogi", "Brogioni", "Brunelli", "Brunetti", "Bruni", "Bruno", "Brunori", "Bruschi", "Bucci", "Bucciarelli", "Buccioni", "Bucelli", "Bulli", "Burberi", "Burchi", "Burgassi", "Burroni", "Bussotti", "Buti", "Caciolli", "Caiani", "Calabrese", "Calamai", "Calamandrei", "Caldini", "Calo'", "Calonaci", "Calosi", "Calvelli", "Cambi", "Camiciottoli", "Cammelli", "Cammilli", "Campolmi", "Cantini", "Capanni", "Capecchi", "Caponi", "Cappelletti", "Cappelli", "Cappellini", "Cappugi", "Capretti", "Caputo", "Carbone", "Carboni", "Cardini", "Carlesi", "Carletti", "Carli", "Caroti", "Carotti", "Carrai", "Carraresi", "Carta", "Caruso", "Casalini", "Casati", "Caselli", "Casini", "Castagnoli", "Castellani", "Castelli", "Castellucci", "Catalano", "Catarzi", "Catelani", "Cavaciocchi", "Cavallaro", "Cavallini", "Cavicchi", "Cavini", "Ceccarelli", "Ceccatelli", "Ceccherelli", "Ceccherini", "Cecchi", "Cecchini", "Cecconi", "Cei", "Cellai", "Celli", "Cellini", "Cencetti", "Ceni", "Cenni", "Cerbai", "Cesari", "Ceseri", "Checcacci", "Checchi", "Checcucci", "Cheli", "Chellini", "Chen", "Cheng", "Cherici", "Cherubini", "Chiaramonti", "Chiarantini", "Chiarelli", "Chiari", "Chiarini", "Chiarugi", "Chiavacci", "Chiesi", "Chimenti", "Chini", "Chirici", "Chiti", "Ciabatti", "Ciampi", "Cianchi", "Cianfanelli", "Cianferoni", "Ciani", "Ciapetti", "Ciappi", "Ciardi", "Ciatti", "Cicali", "Ciccone", "Cinelli", "Cini", "Ciobanu", "Ciolli", "Cioni", "Cipriani", "Cirillo", "Cirri", "Ciucchi", "Ciuffi", "Ciulli", "Ciullini", "Clemente", "Cocchi", "Cognome", "Coli", "Collini", "Colombo", "Colzi", "Comparini", "Conforti", "Consigli", "Conte", "Conti", "Contini", "Coppini", "Coppola", "Corsi", "Corsini", "Corti", "Cortini", "Cosi", "Costa", "Costantini", "Costantino", "Cozzi", "Cresci", "Crescioli", "Cresti", "Crini", "Curradi", "D'Agostino", "D'Alessandro", "D'Amico", "D'Angelo", "Daddi", "Dainelli", "Dallai", "Danti", "Davitti", "De Angelis", "De Luca", "De Marco", "De Rosa", "De Santis", "De Simone", "De Vita", "Degl'Innocenti", "Degli Innocenti", "Dei", "Del Lungo", "Del Re", "Di Marco", "Di Stefano", "Dini", "Diop", "Dobre", "Dolfi", "Donati", "Dondoli", "Dong", "Donnini", "Ducci", "Dumitru", "Ermini", "Esposito", "Evangelisti", "Fabbri", "Fabbrini", "Fabbrizzi", "Fabbroni", "Fabbrucci", "Fabiani", "Facchini", "Faggi", "Fagioli", "Failli", "Faini", "Falciani", "Falcini", "Falcone", "Fallani", "Falorni", "Falsini", "Falugiani", "Fancelli", "Fanelli", "Fanetti", "Fanfani", "Fani", "Fantappie'", "Fantechi", "Fanti", "Fantini", "Fantoni", "Farina", "Fattori", "Favilli", "Fedi", "Fei", "Ferrante", "Ferrara", "Ferrari", "Ferraro", "Ferretti", "Ferri", "Ferrini", "Ferroni", "Fiaschi", "Fibbi", "Fiesoli", "Filippi", "Filippini", "Fini", "Fioravanti", "Fiore", "Fiorentini", "Fiorini", "Fissi", "Focardi", "Foggi", "Fontana", "Fontanelli", "Fontani", "Forconi", "Formigli", "Forte", "Forti", "Fortini", "Fossati", "Fossi", "Francalanci", "Franceschi", "Franceschini", "Franchi", "Franchini", "Franci", "Francini", "Francioni", "Franco", "Frassineti", "Frati", "Fratini", "Frilli", "Frizzi", "Frosali", "Frosini", "Frullini", "Fusco", "Fusi", "Gabbrielli", "Gabellini", "Gagliardi", "Galanti", "Galardi", "Galeotti", "Galletti", "Galli", "Gallo", "Gallori", "Gambacciani", "Gargani", "Garofalo", "Garuglieri", "Gashi", "Gasperini", "Gatti", "Gelli", "Gensini", "Gentile", "Gentili", "Geri", "Gerini", "Gheri", "Ghini", "Giachetti", "Giachi", "Giacomelli", "Gianassi", "Giani", "Giannelli", "Giannetti", "Gianni", "Giannini", "Giannoni", "Giannotti", "Giannozzi", "Gigli", "Giordano", "Giorgetti", "Giorgi", "Giovacchini", "Giovannelli", "Giovannetti", "Giovannini", "Giovannoni", "Giuliani", "Giunti", "Giuntini", "Giusti", "Gonnelli", "Goretti", "Gori", "Gradi", "Gramigni", "Grassi", "Grasso", "Graziani", "Grazzini", "Greco", "Grifoni", "Grillo", "Grimaldi", "Grossi", "Gualtieri", "Guarducci", "Guarino", "Guarnieri", "Guasti", "Guerra", "Guerri", "Guerrini", "Guidi", "Guidotti", "He", "Hoxha", "Hu", "Huang", "Iandelli", "Ignesti", "Innocenti", "Jin", "La Rosa", "Lai", "Landi", "Landini", "Lanini", "Lapi", "Lapini", "Lari", "Lascialfari", "Lastrucci", "Latini", "Lazzeri", "Lazzerini", "Lelli", "Lenzi", "Leonardi", "Leoncini", "Leone", "Leoni", "Lepri", "Li", "Liao", "Lin", "Linari", "Lippi", "Lisi", "Livi", "Lombardi", "Lombardini", "Lombardo", "Longo", "Lopez", "Lorenzi", "Lorenzini", "Lorini", "Lotti", "Lu", "Lucchesi", "Lucherini", "Lunghi", "Lupi", "Madiai", "Maestrini", "Maffei", "Maggi", "Maggini", "Magherini", "Magini", "Magnani", "Magnelli", "Magni", "Magnolfi", "Magrini", "Malavolti", "Malevolti", "Manca", "Mancini", "Manetti", "Manfredi", "Mangani", "Mannelli", "Manni", "Mannini", "Mannucci", "Manuelli", "Manzini", "Marcelli", "Marchese", "Marchetti", "Marchi", "Marchiani", "Marchionni", "Marconi", "Marcucci", "Margheri", "Mari", "Mariani", "Marilli", "Marinai", "Marinari", "Marinelli", "Marini", "Marino", "Mariotti", "Marsili", "Martelli", "Martinelli", "Martini", "Martino", "Marzi", "Masi", "Masini", "Masoni", "Massai", "Materassi", "Mattei", "Matteini", "Matteucci", "Matteuzzi", "Mattioli", "Mattolini", "Matucci", "Mauro", "Mazzanti", "Mazzei", "Mazzetti", "Mazzi", "Mazzini", "Mazzocchi", "Mazzoli", "Mazzoni", "Mazzuoli", "Meacci", "Mecocci", "Meini", "Melani", "Mele", "Meli", "Mengoni", "Menichetti", "Meoni", "Merlini", "Messeri", "Messina", "Meucci", "Miccinesi", "Miceli", "Micheli", "Michelini", "Michelozzi", "Migliori", "Migliorini", "Milani", "Miniati", "Misuri", "Monaco", "Montagnani", "Montagni", "Montanari", "Montelatici", "Monti", "Montigiani", "Montini", "Morandi", "Morandini", "Morelli", "Moretti", "Morganti", "Mori", "Morini", "Moroni", "Morozzi", "Mugnai", "Mugnaini", "Mustafa", "Naldi", "Naldini", "Nannelli", "Nanni", "Nannini", "Nannucci", "Nardi", "Nardini", "Nardoni", "Natali", "Ndiaye", "Nencetti", "Nencini", "Nencioni", "Neri", "Nesi", "Nesti", "Niccolai", "Niccoli", "Niccolini", "Nigi", "Nistri", "Nocentini", "Noferini", "Novelli", "Nucci", "Nuti", "Nutini", "Oliva", "Olivieri", "Olmi", "Orlandi", "Orlandini", "Orlando", "Orsini", "Ortolani", "Ottanelli", "Pacciani", "Pace", "Paci", "Pacini", "Pagani", "Pagano", "Paggetti", "Pagliai", "Pagni", "Pagnini", "Paladini", "Palagi", "Palchetti", "Palloni", "Palmieri", "Palumbo", "Pampaloni", "Pancani", "Pandolfi", "Pandolfini", "Panerai", "Panichi", "Paoletti", "Paoli", "Paolini", "Papi", "Papini", "Papucci", "Parenti", "Parigi", "Parisi", "Parri", "Parrini", "Pasquini", "Passeri", "Pecchioli", "Pecorini", "Pellegrini", "Pepi", "Perini", "Perrone", "Peruzzi", "Pesci", "Pestelli", "Petri", "Petrini", "Petrucci", "Pettini", "Pezzati", "Pezzatini", "Piani", "Piazza", "Piazzesi", "Piazzini", "Piccardi", "Picchi", "Piccini", "Piccioli", "Pieraccini", "Pieraccioni", "Pieralli", "Pierattini", "Pieri", "Pierini", "Pieroni", "Pietrini", "Pini", "Pinna", "Pinto", "Pinzani", "Pinzauti", "Piras", "Pisani", "Pistolesi", "Poggesi", "Poggi", "Poggiali", "Poggiolini", "Poli", "Pollastri", "Porciani", "Pozzi", "Pratellesi", "Pratesi", "Prosperi", "Pruneti", "Pucci", "Puccini", "Puccioni", "Pugi", "Pugliese", "Puliti", "Querci", "Quercioli", "Raddi", "Radu", "Raffaelli", "Ragazzini", "Ranfagni", "Ranieri", "Rastrelli", "Raugei", "Raveggi", "Renai", "Renzi", "Rettori", "Ricci", "Ricciardi", "Ridi", "Ridolfi", "Rigacci", "Righi", "Righini", "Rinaldi", "Risaliti", "Ristori", "Rizzo", "Rocchi", "Rocchini", "Rogai", "Romagnoli", "Romanelli", "Romani", "Romano", "Romei", "Romeo", "Romiti", "Romoli", "Romolini", "Rontini", "Rosati", "Roselli", "Rosi", "Rossetti", "Rossi", "Rossini", "Rovai", "Ruggeri", "Ruggiero", "Russo", "Sabatini", "Saccardi", "Sacchetti", "Sacchi", "Sacco", "Salerno", "Salimbeni", "Salucci", "Salvadori", "Salvestrini", "Salvi", "Salvini", "Sanesi", "Sani", "Sanna", "Santi", "Santini", "Santoni", "Santoro", "Santucci", "Sardi", "Sarri", "Sarti", "Sassi", "Sbolci", "Scali", "Scarpelli", "Scarselli", "Scopetani", "Secci", "Selvi", "Senatori", "Senesi", "Serafini", "Sereni", "Serra", "Sestini", "Sguanci", "Sieni", "Signorini", "Silvestri", "Simoncini", "Simonetti", "Simoni", "Singh", "Sodi", "Soldi", "Somigli", "Sorbi", "Sorelli", "Sorrentino", "Sottili", "Spina", "Spinelli", "Staccioli", "Staderini", "Stefanelli", "Stefani", "Stefanini", "Stella", "Susini", "Tacchi", "Tacconi", "Taddei", "Tagliaferri", "Tamburini", "Tanganelli", "Tani", "Tanini", "Tapinassi", "Tarchi", "Tarchiani", "Targioni", "Tassi", "Tassini", "Tempesti", "Terzani", "Tesi", "Testa", "Testi", "Tilli", "Tinti", "Tirinnanzi", "Toccafondi", "Tofanari", "Tofani", "Tognaccini", "Tonelli", "Tonini", "Torelli", "Torrini", "Tosi", "Toti", "Tozzi", "Trambusti", "Trapani", "Tucci", "Turchi", "Ugolini", "Ulivi", "Valente", "Valenti", "Valentini", "Vangelisti", "Vanni", "Vannini", "Vannoni", "Vannozzi", "Vannucchi", "Vannucci", "Ventura", "Venturi", "Venturini", "Vestri", "Vettori", "Vichi", "Viciani", "Vieri", "Vigiani", "Vignoli", "Vignolini", "Vignozzi", "Villani", "Vinci", "Visani", "Vitale", "Vitali", "Viti", "Viviani", "Vivoli", "Volpe", "Volpi", "Wang", "Wu", "Xu", "Yang", "Ye", "Zagli", "Zani", "Zanieri", "Zanobini", "Zecchi", "Zetti", "Zhang", "Zheng", "Zhou", "Zhu", "Zingoni", "Zini", "Zoppi"],
          "nl": ["Albers", "Alblas", "Appelman", "Baars", "Baas", "Bakker", "Blank", "Bleeker", "Blok", "Blom", "Boer", "Boers", "Boldewijn", "Boon", "Boot", "Bos", "Bosch", "Bosma", "Bosman", "Bouma", "Bouman", "Bouwman", "Brands", "Brouwer", "Burger", "Buijs", "Buitenhuis", "Ceder", "Cohen", "Dekker", "Dekkers", "Dijkman", "Dijkstra", "Driessen", "Drost", "Engel", "Evers", "Faber", "Franke", "Gerritsen", "Goedhart", "Goossens", "Groen", "Groenenberg", "Groot", "Haan", "Hart", "Heemskerk", "Hendriks", "Hermans", "Hoekstra", "Hofman", "Hopman", "Huisman", "Jacobs", "Jansen", "Janssen", "Jonker", "Jaspers", "Keijzer", "Klaassen", "Klein", "Koek", "Koenders", "Kok", "Kool", "Koopman", "Koopmans", "Koning", "Koster", "Kramer", "Kroon", "Kuijpers", "Kuiper", "Kuipers", "Kurt", "Koster", "Kwakman", "Los", "Lubbers", "Maas", "Markus", "Martens", "Meijer", "Mol", "Molenaar", "Mulder", "Nieuwenhuis", "Peeters", "Peters", "Pengel", "Pieters", "Pool", "Post", "Postma", "Prins", "Pronk", "Reijnders", "Rietveld", "Roest", "Roos", "Sanders", "Schaap", "Scheffer", "Schenk", "Schilder", "Schipper", "Schmidt", "Scholten", "Schouten", "Schut", "Schutte", "Schuurman", "Simons", "Smeets", "Smit", "Smits", "Snel", "Swinkels", "Tas", "Terpstra", "Timmermans", "Tol", "Tromp", "Troost", "Valk", "Veenstra", "Veldkamp", "Verbeek", "Verheul", "Verhoeven", "Vermeer", "Vermeulen", "Verweij", "Vink", "Visser", "Voorn", "Vos", "Wagenaar", "Wiersema", "Willems", "Willemsen", "Witteveen", "Wolff", "Wolters", "Zijlstra", "Zwart", "de Beer", "de Boer", "de Bruijn", "de Bruin", "de Graaf", "de Groot", "de Haan", "de Haas", "de Jager", "de Jong", "de Jonge", "de Koning", "de Lange", "de Leeuw", "de Ridder", "de Rooij", "de Ruiter", "de Vos", "de Vries", "de Waal", "de Wit", "de Zwart", "van Beek", "van Boven", "van Dam", "van Dijk", "van Dongen", "van Doorn", "van Egmond", "van Eijk", "van Es", "van Gelder", "van Gelderen", "van Houten", "van Hulst", "van Kempen", "van Kesteren", "van Leeuwen", "van Loon", "van Mill", "van Noord", "van Ommen", "van Ommeren", "van Oosten", "van Oostveen", "van Rijn", "van Schaik", "van Veen", "van Vliet", "van Wijk", "van Wijngaarden", "van den Poel", "van de Pol", "van den Ploeg", "van de Ven", "van den Berg", "van den Bosch", "van den Brink", "van den Broek", "van den Heuvel", "van der Heijden", "van der Horst", "van der Hulst", "van der Kroon", "van der Laan", "van der Linden", "van der Meer", "van der Meij", "van der Meulen", "van der Molen", "van der Sluis", "van der Spek", "van der Veen", "van der Velde", "van der Velden", "van der Vliet", "van der Wal"],
          "uk": ["Smith", "Jones", "Williams", "Taylor", "Brown", "Davies", "Evans", "Wilson", "Thomas", "Johnson", "Roberts", "Robinson", "Thompson", "Wright", "Walker", "White", "Edwards", "Hughes", "Green", "Hall", "Lewis", "Harris", "Clarke", "Patel", "Jackson", "Wood", "Turner", "Martin", "Cooper", "Hill", "Ward", "Morris", "Moore", "Clark", "Lee", "King", "Baker", "Harrison", "Morgan", "Allen", "James", "Scott", "Phillips", "Watson", "Davis", "Parker", "Price", "Bennett", "Young", "Griffiths", "Mitchell", "Kelly", "Cook", "Carter", "Richardson", "Bailey", "Collins", "Bell", "Shaw", "Murphy", "Miller", "Cox", "Richards", "Khan", "Marshall", "Anderson", "Simpson", "Ellis", "Adams", "Singh", "Begum", "Wilkinson", "Foster", "Chapman", "Powell", "Webb", "Rogers", "Gray", "Mason", "Ali", "Hunt", "Hussain", "Campbell", "Matthews", "Owen", "Palmer", "Holmes", "Mills", "Barnes", "Knight", "Lloyd", "Butler", "Russell", "Barker", "Fisher", "Stevens", "Jenkins", "Murray", "Dixon", "Harvey", "Graham", "Pearson", "Ahmed", "Fletcher", "Walsh", "Kaur", "Gibson", "Howard", "Andrews", "Stewart", "Elliott", "Reynolds", "Saunders", "Payne", "Fox", "Ford", "Pearce", "Day", "Brooks", "West", "Lawrence", "Cole", "Atkinson", "Bradley", "Spencer", "Gill", "Dawson", "Ball", "Burton", "O'brien", "Watts", "Rose", "Booth", "Perry", "Ryan", "Grant", "Wells", "Armstrong", "Francis", "Rees", "Hayes", "Hart", "Hudson", "Newman", "Barrett", "Webster", "Hunter", "Gregory", "Carr", "Lowe", "Page", "Marsh", "Riley", "Dunn", "Woods", "Parsons", "Berry", "Stone", "Reid", "Holland", "Hawkins", "Harding", "Porter", "Robertson", "Newton", "Oliver", "Reed", "Kennedy", "Williamson", "Bird", "Gardner", "Shah", "Dean", "Lane", "Cooke", "Bates", "Henderson", "Parry", "Burgess", "Bishop", "Walton", "Burns", "Nicholson", "Shepherd", "Ross", "Cross", "Long", "Freeman", "Warren", "Nicholls", "Hamilton", "Byrne", "Sutton", "Mcdonald", "Yates", "Hodgson", "Robson", "Curtis", "Hopkins", "O'connor", "Harper", "Coleman", "Watkins", "Moss", "Mccarthy", "Chambers", "O'neill", "Griffin", "Sharp", "Hardy", "Wheeler", "Potter", "Osborne", "Johnston", "Gordon", "Doyle", "Wallace", "George", "Jordan", "Hutchinson", "Rowe", "Burke", "May", "Pritchard", "Gilbert", "Willis", "Higgins", "Read", "Miles", "Stevenson", "Stephenson", "Hammond", "Arnold", "Buckley", "Walters", "Hewitt", "Barber", "Nelson", "Slater", "Austin", "Sullivan", "Whitehead", "Mann", "Frost", "Lambert", "Stephens", "Blake", "Akhtar", "Lynch", "Goodwin", "Barton", "Woodward", "Thomson", "Cunningham", "Quinn", "Barnett", "Baxter", "Bibi", "Clayton", "Nash", "Greenwood", "Jennings", "Holt", "Kemp", "Poole", "Gallagher", "Bond", "Stokes", "Tucker", "Davidson", "Fowler", "Heath", "Norman", "Middleton", "Lawson", "Banks", "French", "Stanley", "Jarvis", "Gibbs", "Ferguson", "Hayward", "Carroll", "Douglas", "Dickinson", "Todd", "Barlow", "Peters", "Lucas", "Knowles", "Hartley", "Miah", "Simmons", "Morton", "Alexander", "Field", "Morrison", "Norris", "Townsend", "Preston", "Hancock", "Thornton", "Baldwin", "Burrows", "Briggs", "Parkinson", "Reeves", "Macdonald", "Lamb", "Black", "Abbott", "Sanders", "Thorpe", "Holden", "Tomlinson", "Perkins", "Ashton", "Rhodes", "Fuller", "Howe", "Bryant", "Vaughan", "Dale", "Davey", "Weston", "Bartlett", "Whittaker", "Davison", "Kent", "Skinner", "Birch", "Morley", "Daniels", "Glover", "Howell", "Cartwright", "Pugh", "Humphreys", "Goddard", "Brennan", "Wall", "Kirby", "Bowen", "Savage", "Bull", "Wong", "Dobson", "Smart", "Wilkins", "Kirk", "Fraser", "Duffy", "Hicks", "Patterson", "Bradshaw", "Little", "Archer", "Warner", "Waters", "O'sullivan", "Farrell", "Brookes", "Atkins", "Kay", "Dodd", "Bentley", "Flynn", "John", "Schofield", "Short", "Haynes", "Wade", "Butcher", "Henry", "Sanderson", "Crawford", "Sheppard", "Bolton", "Coates", "Giles", "Gould", "Houghton", "Gibbons", "Pratt", "Manning", "Law", "Hooper", "Noble", "Dyer", "Rahman", "Clements", "Moran", "Sykes", "Chan", "Doherty", "Connolly", "Joyce", "Franklin", "Hobbs", "Coles", "Herbert", "Steele", "Kerr", "Leach", "Winter", "Owens", "Duncan", "Naylor", "Fleming", "Horton", "Finch", "Fitzgerald", "Randall", "Carpenter", "Marsden", "Browne", "Garner", "Pickering", "Hale", "Dennis", "Vincent", "Chadwick", "Chandler", "Sharpe", "Nolan", "Lyons", "Hurst", "Collier", "Peacock", "Howarth", "Faulkner", "Rice", "Pollard", "Welch", "Norton", "Gough", "Sinclair", "Blackburn", "Bryan", "Conway", "Power", "Cameron", "Daly", "Allan", "Hanson", "Gardiner", "Boyle", "Myers", "Turnbull", "Wallis", "Mahmood", "Sims", "Swift", "Iqbal", "Pope", "Brady", "Chamberlain", "Rowley", "Tyler", "Farmer", "Metcalfe", "Hilton", "Godfrey", "Holloway", "Parkin", "Bray", "Talbot", "Donnelly", "Nixon", "Charlton", "Benson", "Whitehouse", "Barry", "Hope", "Lord", "North", "Storey", "Connor", "Potts", "Bevan", "Hargreaves", "Mclean", "Mistry", "Bruce", "Howells", "Hyde", "Parkes", "Wyatt", "Fry", "Lees", "O'donnell", "Craig", "Forster", "Mckenzie", "Humphries", "Mellor", "Carey", "Ingram", "Summers", "Leonard"],
          "de": ["M\xFCller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Sch\xE4fer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schr\xF6der", "Neumann", "Schwarz", "Zimmermann", "Braun", "Kr\xFCger", "Hofmann", "Hartmann", "Lange", "Schmitt", "Werner", "Schmitz", "Krause", "Meier", "Lehmann", "Schmid", "Schulze", "Maier", "K\xF6hler", "Herrmann", "K\xF6nig", "Walter", "Mayer", "Huber", "Kaiser", "Fuchs", "Peters", "Lang", "Scholz", "M\xF6ller", "Wei\xDF", "Jung", "Hahn", "Schubert", "Vogel", "Friedrich", "Keller", "G\xFCnther", "Frank", "Berger", "Winkler", "Roth", "Beck", "Lorenz", "Baumann", "Franke", "Albrecht", "Schuster", "Simon", "Ludwig", "B\xF6hm", "Winter", "Kraus", "Martin", "Schumacher", "Kr\xE4mer", "Vogt", "Stein", "J\xE4ger", "Otto", "Sommer", "Gro\xDF", "Seidel", "Heinrich", "Brandt", "Haas", "Schreiber", "Graf", "Schulte", "Dietrich", "Ziegler", "Kuhn", "K\xFChn", "Pohl", "Engel", "Horn", "Busch", "Bergmann", "Thomas", "Voigt", "Sauer", "Arnold", "Wolff", "Pfeiffer"],
          "jp": ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Saito", "Matsumoto", "Inoue", "Kimura", "Hayashi", "Shimizu", "Yamazaki", "Mori", "Abe", "Ikeda", "Hashimoto", "Yamashita", "Ishikawa", "Nakajima", "Maeda", "Fujita", "Ogawa", "Goto", "Okada", "Hasegawa", "Murakami", "Kondo", "Ishii", "Saito", "Sakamoto", "Endo", "Aoki", "Fujii", "Nishimura", "Fukuda", "Ota", "Miura", "Fujiwara", "Okamoto", "Matsuda", "Nakagawa", "Nakano", "Harada", "Ono", "Tamura", "Takeuchi", "Kaneko", "Wada", "Nakayama", "Ishida", "Ueda", "Morita", "Hara", "Shibata", "Sakai", "Kudo", "Yokoyama", "Miyazaki", "Miyamoto", "Uchida", "Takagi", "Ando", "Taniguchi", "Ohno", "Maruyama", "Imai", "Takada", "Fujimoto", "Takeda", "Murata", "Ueno", "Sugiyama", "Masuda", "Sugawara", "Hirano", "Kojima", "Otsuka", "Chiba", "Kubo", "Matsui", "Iwasaki", "Sakurai", "Kinoshita", "Noguchi", "Matsuo", "Nomura", "Kikuchi", "Sano", "Onishi", "Sugimoto", "Arai"],
          "es": ["Garcia", "Fernandez", "Lopez", "Martinez", "Gonzalez", "Rodriguez", "Sanchez", "Perez", "Martin", "Gomez", "Ruiz", "Diaz", "Hernandez", "Alvarez", "Jimenez", "Moreno", "Munoz", "Alonso", "Romero", "Navarro", "Gutierrez", "Torres", "Dominguez", "Gil", "Vazquez", "Blanco", "Serrano", "Ramos", "Castro", "Suarez", "Sanz", "Rubio", "Ortega", "Molina", "Delgado", "Ortiz", "Morales", "Ramirez", "Marin", "Iglesias", "Santos", "Castillo", "Garrido", "Calvo", "Pena", "Cruz", "Cano", "Nunez", "Prieto", "Diez", "Lozano", "Vidal", "Pascual", "Ferrer", "Medina", "Vega", "Leon", "Herrero", "Vicente", "Mendez", "Guerrero", "Fuentes", "Campos", "Nieto", "Cortes", "Caballero", "Ibanez", "Lorenzo", "Pastor", "Gimenez", "Saez", "Soler", "Marquez", "Carrasco", "Herrera", "Montero", "Arias", "Crespo", "Flores", "Andres", "Aguilar", "Hidalgo", "Cabrera", "Mora", "Duran", "Velasco", "Rey", "Pardo", "Roman", "Vila", "Bravo", "Merino", "Moya", "Soto", "Izquierdo", "Reyes", "Redondo", "Marcos", "Carmona", "Menendez"],
          "fr": ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lef\xE8vre", "Leroy", "Roux", "David", "Bertrand", "Morel", "Fournier", "Girard", "Bonnet", "Dupont", "Lambert", "Fontaine", "Rousseau", "Vincent", "M\xFCller", "Lef\xE8vre", "Faure", "Andr\xE9", "Mercier", "Blanc", "Gu\xE9rin", "Boyer", "Garnier", "Chevalier", "Fran\xE7ois", "Legrand", "Gauthier", "Garcia", "Perrin", "Robin", "Cl\xE9ment", "Morin", "Nicolas", "Henry", "Roussel", "Matthieu", "Gautier", "Masson", "Marchand", "Duval", "Denis", "Dumont", "Marie", "Lemaire", "No\xEBl", "Meyer", "Dufour", "Meunier", "Brun", "Blanchard", "Giraud", "Joly", "Rivi\xE8re", "Lucas", "Brunet", "Gaillard", "Barbier", "Arnaud", "Mart\xEDnez", "G\xE9rard", "Roche", "Renard", "Schmitt", "Roy", "Leroux", "Colin", "Vidal", "Caron", "Picard", "Roger", "Fabre", "Aubert", "Lemoine", "Renaud", "Dumas", "Lacroix", "Olivier", "Philippe", "Bourgeois", "Pierre", "Beno\xEEt", "Rey", "Leclerc", "Payet", "Rolland", "Leclercq", "Guillaume", "Lecomte", "L\xF3pez", "Jean", "Dupuy", "Guillot", "Hubert", "Berger", "Carpentier", "S\xE1nchez", "Dupuis", "Moulin", "Louis", "Deschamps", "Huet", "Vasseur", "Perez", "Boucher", "Fleury", "Royer", "Klein", "Jacquet", "Adam", "Paris", "Poirier", "Marty", "Aubry", "Guyot", "Carr\xE9", "Charles", "Renault", "Charpentier", "M\xE9nard", "Maillard", "Baron", "Bertin", "Bailly", "Herv\xE9", "Schneider", "Fern\xE1ndez", "Le GallGall", "Collet", "L\xE9ger", "Bouvier", "Julien", "Pr\xE9vost", "Millet", "Perrot", "Daniel", "Le RouxRoux", "Cousin", "Germain", "Breton", "Besson", "Langlois", "R\xE9mi", "Le GoffGoff", "Pelletier", "L\xE9v\xEAque", "Perrier", "Leblanc", "Barr\xE9", "Lebrun", "Marchal", "Weber", "Mallet", "Hamon", "Boulanger", "Jacob", "Monnier", "Michaud", "Rodr\xEDguez", "Guichard", "Gillet", "\xC9tienne", "Grondin", "Poulain", "Tessier", "Chevallier", "Collin", "Chauvin", "Da SilvaSilva", "Bouchet", "Gay", "Lema\xEEtre", "B\xE9nard", "Mar\xE9chal", "Humbert", "Reynaud", "Antoine", "Hoarau", "Perret", "Barth\xE9lemy", "Cordier", "Pichon", "Lejeune", "Gilbert", "Lamy", "Delaunay", "Pasquier", "Carlier", "LaporteLaporte"]
        },
        postcodeAreas: [{ code: "AB" }, { code: "AL" }, { code: "B" }, { code: "BA" }, { code: "BB" }, { code: "BD" }, { code: "BH" }, { code: "BL" }, { code: "BN" }, { code: "BR" }, { code: "BS" }, { code: "BT" }, { code: "CA" }, { code: "CB" }, { code: "CF" }, { code: "CH" }, { code: "CM" }, { code: "CO" }, { code: "CR" }, { code: "CT" }, { code: "CV" }, { code: "CW" }, { code: "DA" }, { code: "DD" }, { code: "DE" }, { code: "DG" }, { code: "DH" }, { code: "DL" }, { code: "DN" }, { code: "DT" }, { code: "DY" }, { code: "E" }, { code: "EC" }, { code: "EH" }, { code: "EN" }, { code: "EX" }, { code: "FK" }, { code: "FY" }, { code: "G" }, { code: "GL" }, { code: "GU" }, { code: "GY" }, { code: "HA" }, { code: "HD" }, { code: "HG" }, { code: "HP" }, { code: "HR" }, { code: "HS" }, { code: "HU" }, { code: "HX" }, { code: "IG" }, { code: "IM" }, { code: "IP" }, { code: "IV" }, { code: "JE" }, { code: "KA" }, { code: "KT" }, { code: "KW" }, { code: "KY" }, { code: "L" }, { code: "LA" }, { code: "LD" }, { code: "LE" }, { code: "LL" }, { code: "LN" }, { code: "LS" }, { code: "LU" }, { code: "M" }, { code: "ME" }, { code: "MK" }, { code: "ML" }, { code: "N" }, { code: "NE" }, { code: "NG" }, { code: "NN" }, { code: "NP" }, { code: "NR" }, { code: "NW" }, { code: "OL" }, { code: "OX" }, { code: "PA" }, { code: "PE" }, { code: "PH" }, { code: "PL" }, { code: "PO" }, { code: "PR" }, { code: "RG" }, { code: "RH" }, { code: "RM" }, { code: "S" }, { code: "SA" }, { code: "SE" }, { code: "SG" }, { code: "SK" }, { code: "SL" }, { code: "SM" }, { code: "SN" }, { code: "SO" }, { code: "SP" }, { code: "SR" }, { code: "SS" }, { code: "ST" }, { code: "SW" }, { code: "SY" }, { code: "TA" }, { code: "TD" }, { code: "TF" }, { code: "TN" }, { code: "TQ" }, { code: "TR" }, { code: "TS" }, { code: "TW" }, { code: "UB" }, { code: "W" }, { code: "WA" }, { code: "WC" }, { code: "WD" }, { code: "WF" }, { code: "WN" }, { code: "WR" }, { code: "WS" }, { code: "WV" }, { code: "YO" }, { code: "ZE" }],
        countries: [{ "name": "Afghanistan", "abbreviation": "AF" }, { "name": "\xC5land Islands", "abbreviation": "AX" }, { "name": "Albania", "abbreviation": "AL" }, { "name": "Algeria", "abbreviation": "DZ" }, { "name": "American Samoa", "abbreviation": "AS" }, { "name": "Andorra", "abbreviation": "AD" }, { "name": "Angola", "abbreviation": "AO" }, { "name": "Anguilla", "abbreviation": "AI" }, { "name": "Antarctica", "abbreviation": "AQ" }, { "name": "Antigua & Barbuda", "abbreviation": "AG" }, { "name": "Argentina", "abbreviation": "AR" }, { "name": "Armenia", "abbreviation": "AM" }, { "name": "Aruba", "abbreviation": "AW" }, { "name": "Ascension Island", "abbreviation": "AC" }, { "name": "Australia", "abbreviation": "AU" }, { "name": "Austria", "abbreviation": "AT" }, { "name": "Azerbaijan", "abbreviation": "AZ" }, { "name": "Bahamas", "abbreviation": "BS" }, { "name": "Bahrain", "abbreviation": "BH" }, { "name": "Bangladesh", "abbreviation": "BD" }, { "name": "Barbados", "abbreviation": "BB" }, { "name": "Belarus", "abbreviation": "BY" }, { "name": "Belgium", "abbreviation": "BE" }, { "name": "Belize", "abbreviation": "BZ" }, { "name": "Benin", "abbreviation": "BJ" }, { "name": "Bermuda", "abbreviation": "BM" }, { "name": "Bhutan", "abbreviation": "BT" }, { "name": "Bolivia", "abbreviation": "BO" }, { "name": "Bosnia & Herzegovina", "abbreviation": "BA" }, { "name": "Botswana", "abbreviation": "BW" }, { "name": "Brazil", "abbreviation": "BR" }, { "name": "British Indian Ocean Territory", "abbreviation": "IO" }, { "name": "British Virgin Islands", "abbreviation": "VG" }, { "name": "Brunei", "abbreviation": "BN" }, { "name": "Bulgaria", "abbreviation": "BG" }, { "name": "Burkina Faso", "abbreviation": "BF" }, { "name": "Burundi", "abbreviation": "BI" }, { "name": "Cambodia", "abbreviation": "KH" }, { "name": "Cameroon", "abbreviation": "CM" }, { "name": "Canada", "abbreviation": "CA" }, { "name": "Canary Islands", "abbreviation": "IC" }, { "name": "Cape Verde", "abbreviation": "CV" }, { "name": "Caribbean Netherlands", "abbreviation": "BQ" }, { "name": "Cayman Islands", "abbreviation": "KY" }, { "name": "Central African Republic", "abbreviation": "CF" }, { "name": "Ceuta & Melilla", "abbreviation": "EA" }, { "name": "Chad", "abbreviation": "TD" }, { "name": "Chile", "abbreviation": "CL" }, { "name": "China", "abbreviation": "CN" }, { "name": "Christmas Island", "abbreviation": "CX" }, { "name": "Cocos (Keeling) Islands", "abbreviation": "CC" }, { "name": "Colombia", "abbreviation": "CO" }, { "name": "Comoros", "abbreviation": "KM" }, { "name": "Congo - Brazzaville", "abbreviation": "CG" }, { "name": "Congo - Kinshasa", "abbreviation": "CD" }, { "name": "Cook Islands", "abbreviation": "CK" }, { "name": "Costa Rica", "abbreviation": "CR" }, { "name": "C\xF4te d'Ivoire", "abbreviation": "CI" }, { "name": "Croatia", "abbreviation": "HR" }, { "name": "Cuba", "abbreviation": "CU" }, { "name": "Cura\xE7ao", "abbreviation": "CW" }, { "name": "Cyprus", "abbreviation": "CY" }, { "name": "Czech Republic", "abbreviation": "CZ" }, { "name": "Denmark", "abbreviation": "DK" }, { "name": "Diego Garcia", "abbreviation": "DG" }, { "name": "Djibouti", "abbreviation": "DJ" }, { "name": "Dominica", "abbreviation": "DM" }, { "name": "Dominican Republic", "abbreviation": "DO" }, { "name": "Ecuador", "abbreviation": "EC" }, { "name": "Egypt", "abbreviation": "EG" }, { "name": "El Salvador", "abbreviation": "SV" }, { "name": "Equatorial Guinea", "abbreviation": "GQ" }, { "name": "Eritrea", "abbreviation": "ER" }, { "name": "Estonia", "abbreviation": "EE" }, { "name": "Ethiopia", "abbreviation": "ET" }, { "name": "Falkland Islands", "abbreviation": "FK" }, { "name": "Faroe Islands", "abbreviation": "FO" }, { "name": "Fiji", "abbreviation": "FJ" }, { "name": "Finland", "abbreviation": "FI" }, { "name": "France", "abbreviation": "FR" }, { "name": "French Guiana", "abbreviation": "GF" }, { "name": "French Polynesia", "abbreviation": "PF" }, { "name": "French Southern Territories", "abbreviation": "TF" }, { "name": "Gabon", "abbreviation": "GA" }, { "name": "Gambia", "abbreviation": "GM" }, { "name": "Georgia", "abbreviation": "GE" }, { "name": "Germany", "abbreviation": "DE" }, { "name": "Ghana", "abbreviation": "GH" }, { "name": "Gibraltar", "abbreviation": "GI" }, { "name": "Greece", "abbreviation": "GR" }, { "name": "Greenland", "abbreviation": "GL" }, { "name": "Grenada", "abbreviation": "GD" }, { "name": "Guadeloupe", "abbreviation": "GP" }, { "name": "Guam", "abbreviation": "GU" }, { "name": "Guatemala", "abbreviation": "GT" }, { "name": "Guernsey", "abbreviation": "GG" }, { "name": "Guinea", "abbreviation": "GN" }, { "name": "Guinea-Bissau", "abbreviation": "GW" }, { "name": "Guyana", "abbreviation": "GY" }, { "name": "Haiti", "abbreviation": "HT" }, { "name": "Honduras", "abbreviation": "HN" }, { "name": "Hong Kong SAR China", "abbreviation": "HK" }, { "name": "Hungary", "abbreviation": "HU" }, { "name": "Iceland", "abbreviation": "IS" }, { "name": "India", "abbreviation": "IN" }, { "name": "Indonesia", "abbreviation": "ID" }, { "name": "Iran", "abbreviation": "IR" }, { "name": "Iraq", "abbreviation": "IQ" }, { "name": "Ireland", "abbreviation": "IE" }, { "name": "Isle of Man", "abbreviation": "IM" }, { "name": "Israel", "abbreviation": "IL" }, { "name": "Italy", "abbreviation": "IT" }, { "name": "Jamaica", "abbreviation": "JM" }, { "name": "Japan", "abbreviation": "JP" }, { "name": "Jersey", "abbreviation": "JE" }, { "name": "Jordan", "abbreviation": "JO" }, { "name": "Kazakhstan", "abbreviation": "KZ" }, { "name": "Kenya", "abbreviation": "KE" }, { "name": "Kiribati", "abbreviation": "KI" }, { "name": "Kosovo", "abbreviation": "XK" }, { "name": "Kuwait", "abbreviation": "KW" }, { "name": "Kyrgyzstan", "abbreviation": "KG" }, { "name": "Laos", "abbreviation": "LA" }, { "name": "Latvia", "abbreviation": "LV" }, { "name": "Lebanon", "abbreviation": "LB" }, { "name": "Lesotho", "abbreviation": "LS" }, { "name": "Liberia", "abbreviation": "LR" }, { "name": "Libya", "abbreviation": "LY" }, { "name": "Liechtenstein", "abbreviation": "LI" }, { "name": "Lithuania", "abbreviation": "LT" }, { "name": "Luxembourg", "abbreviation": "LU" }, { "name": "Macau SAR China", "abbreviation": "MO" }, { "name": "Macedonia", "abbreviation": "MK" }, { "name": "Madagascar", "abbreviation": "MG" }, { "name": "Malawi", "abbreviation": "MW" }, { "name": "Malaysia", "abbreviation": "MY" }, { "name": "Maldives", "abbreviation": "MV" }, { "name": "Mali", "abbreviation": "ML" }, { "name": "Malta", "abbreviation": "MT" }, { "name": "Marshall Islands", "abbreviation": "MH" }, { "name": "Martinique", "abbreviation": "MQ" }, { "name": "Mauritania", "abbreviation": "MR" }, { "name": "Mauritius", "abbreviation": "MU" }, { "name": "Mayotte", "abbreviation": "YT" }, { "name": "Mexico", "abbreviation": "MX" }, { "name": "Micronesia", "abbreviation": "FM" }, { "name": "Moldova", "abbreviation": "MD" }, { "name": "Monaco", "abbreviation": "MC" }, { "name": "Mongolia", "abbreviation": "MN" }, { "name": "Montenegro", "abbreviation": "ME" }, { "name": "Montserrat", "abbreviation": "MS" }, { "name": "Morocco", "abbreviation": "MA" }, { "name": "Mozambique", "abbreviation": "MZ" }, { "name": "Myanmar (Burma)", "abbreviation": "MM" }, { "name": "Namibia", "abbreviation": "NA" }, { "name": "Nauru", "abbreviation": "NR" }, { "name": "Nepal", "abbreviation": "NP" }, { "name": "Netherlands", "abbreviation": "NL" }, { "name": "New Caledonia", "abbreviation": "NC" }, { "name": "New Zealand", "abbreviation": "NZ" }, { "name": "Nicaragua", "abbreviation": "NI" }, { "name": "Niger", "abbreviation": "NE" }, { "name": "Nigeria", "abbreviation": "NG" }, { "name": "Niue", "abbreviation": "NU" }, { "name": "Norfolk Island", "abbreviation": "NF" }, { "name": "North Korea", "abbreviation": "KP" }, { "name": "Northern Mariana Islands", "abbreviation": "MP" }, { "name": "Norway", "abbreviation": "NO" }, { "name": "Oman", "abbreviation": "OM" }, { "name": "Pakistan", "abbreviation": "PK" }, { "name": "Palau", "abbreviation": "PW" }, { "name": "Palestinian Territories", "abbreviation": "PS" }, { "name": "Panama", "abbreviation": "PA" }, { "name": "Papua New Guinea", "abbreviation": "PG" }, { "name": "Paraguay", "abbreviation": "PY" }, { "name": "Peru", "abbreviation": "PE" }, { "name": "Philippines", "abbreviation": "PH" }, { "name": "Pitcairn Islands", "abbreviation": "PN" }, { "name": "Poland", "abbreviation": "PL" }, { "name": "Portugal", "abbreviation": "PT" }, { "name": "Puerto Rico", "abbreviation": "PR" }, { "name": "Qatar", "abbreviation": "QA" }, { "name": "R\xE9union", "abbreviation": "RE" }, { "name": "Romania", "abbreviation": "RO" }, { "name": "Russia", "abbreviation": "RU" }, { "name": "Rwanda", "abbreviation": "RW" }, { "name": "Samoa", "abbreviation": "WS" }, { "name": "San Marino", "abbreviation": "SM" }, { "name": "S\xE3o Tom\xE9 and Pr\xEDncipe", "abbreviation": "ST" }, { "name": "Saudi Arabia", "abbreviation": "SA" }, { "name": "Senegal", "abbreviation": "SN" }, { "name": "Serbia", "abbreviation": "RS" }, { "name": "Seychelles", "abbreviation": "SC" }, { "name": "Sierra Leone", "abbreviation": "SL" }, { "name": "Singapore", "abbreviation": "SG" }, { "name": "Sint Maarten", "abbreviation": "SX" }, { "name": "Slovakia", "abbreviation": "SK" }, { "name": "Slovenia", "abbreviation": "SI" }, { "name": "Solomon Islands", "abbreviation": "SB" }, { "name": "Somalia", "abbreviation": "SO" }, { "name": "South Africa", "abbreviation": "ZA" }, { "name": "South Georgia & South Sandwich Islands", "abbreviation": "GS" }, { "name": "South Korea", "abbreviation": "KR" }, { "name": "South Sudan", "abbreviation": "SS" }, { "name": "Spain", "abbreviation": "ES" }, { "name": "Sri Lanka", "abbreviation": "LK" }, { "name": "St. Barth\xE9lemy", "abbreviation": "BL" }, { "name": "St. Helena", "abbreviation": "SH" }, { "name": "St. Kitts & Nevis", "abbreviation": "KN" }, { "name": "St. Lucia", "abbreviation": "LC" }, { "name": "St. Martin", "abbreviation": "MF" }, { "name": "St. Pierre & Miquelon", "abbreviation": "PM" }, { "name": "St. Vincent & Grenadines", "abbreviation": "VC" }, { "name": "Sudan", "abbreviation": "SD" }, { "name": "Suriname", "abbreviation": "SR" }, { "name": "Svalbard & Jan Mayen", "abbreviation": "SJ" }, { "name": "Swaziland", "abbreviation": "SZ" }, { "name": "Sweden", "abbreviation": "SE" }, { "name": "Switzerland", "abbreviation": "CH" }, { "name": "Syria", "abbreviation": "SY" }, { "name": "Taiwan", "abbreviation": "TW" }, { "name": "Tajikistan", "abbreviation": "TJ" }, { "name": "Tanzania", "abbreviation": "TZ" }, { "name": "Thailand", "abbreviation": "TH" }, { "name": "Timor-Leste", "abbreviation": "TL" }, { "name": "Togo", "abbreviation": "TG" }, { "name": "Tokelau", "abbreviation": "TK" }, { "name": "Tonga", "abbreviation": "TO" }, { "name": "Trinidad & Tobago", "abbreviation": "TT" }, { "name": "Tristan da Cunha", "abbreviation": "TA" }, { "name": "Tunisia", "abbreviation": "TN" }, { "name": "Turkey", "abbreviation": "TR" }, { "name": "Turkmenistan", "abbreviation": "TM" }, { "name": "Turks & Caicos Islands", "abbreviation": "TC" }, { "name": "Tuvalu", "abbreviation": "TV" }, { "name": "U.S. Outlying Islands", "abbreviation": "UM" }, { "name": "U.S. Virgin Islands", "abbreviation": "VI" }, { "name": "Uganda", "abbreviation": "UG" }, { "name": "Ukraine", "abbreviation": "UA" }, { "name": "United Arab Emirates", "abbreviation": "AE" }, { "name": "United Kingdom", "abbreviation": "GB" }, { "name": "United States", "abbreviation": "US" }, { "name": "Uruguay", "abbreviation": "UY" }, { "name": "Uzbekistan", "abbreviation": "UZ" }, { "name": "Vanuatu", "abbreviation": "VU" }, { "name": "Vatican City", "abbreviation": "VA" }, { "name": "Venezuela", "abbreviation": "VE" }, { "name": "Vietnam", "abbreviation": "VN" }, { "name": "Wallis & Futuna", "abbreviation": "WF" }, { "name": "Western Sahara", "abbreviation": "EH" }, { "name": "Yemen", "abbreviation": "YE" }, { "name": "Zambia", "abbreviation": "ZM" }, { "name": "Zimbabwe", "abbreviation": "ZW" }],
        counties: {
          "uk": [
            { name: "Bath and North East Somerset" },
            { name: "Aberdeenshire" },
            { name: "Anglesey" },
            { name: "Angus" },
            { name: "Bedford" },
            { name: "Blackburn with Darwen" },
            { name: "Blackpool" },
            { name: "Bournemouth" },
            { name: "Bracknell Forest" },
            { name: "Brighton & Hove" },
            { name: "Bristol" },
            { name: "Buckinghamshire" },
            { name: "Cambridgeshire" },
            { name: "Carmarthenshire" },
            { name: "Central Bedfordshire" },
            { name: "Ceredigion" },
            { name: "Cheshire East" },
            { name: "Cheshire West and Chester" },
            { name: "Clackmannanshire" },
            { name: "Conwy" },
            { name: "Cornwall" },
            { name: "County Antrim" },
            { name: "County Armagh" },
            { name: "County Down" },
            { name: "County Durham" },
            { name: "County Fermanagh" },
            { name: "County Londonderry" },
            { name: "County Tyrone" },
            { name: "Cumbria" },
            { name: "Darlington" },
            { name: "Denbighshire" },
            { name: "Derby" },
            { name: "Derbyshire" },
            { name: "Devon" },
            { name: "Dorset" },
            { name: "Dumfries and Galloway" },
            { name: "Dundee" },
            { name: "East Lothian" },
            { name: "East Riding of Yorkshire" },
            { name: "East Sussex" },
            { name: "Edinburgh?" },
            { name: "Essex" },
            { name: "Falkirk" },
            { name: "Fife" },
            { name: "Flintshire" },
            { name: "Gloucestershire" },
            { name: "Greater London" },
            { name: "Greater Manchester" },
            { name: "Gwent" },
            { name: "Gwynedd" },
            { name: "Halton" },
            { name: "Hampshire" },
            { name: "Hartlepool" },
            { name: "Herefordshire" },
            { name: "Hertfordshire" },
            { name: "Highlands" },
            { name: "Hull" },
            { name: "Isle of Wight" },
            { name: "Isles of Scilly" },
            { name: "Kent" },
            { name: "Lancashire" },
            { name: "Leicester" },
            { name: "Leicestershire" },
            { name: "Lincolnshire" },
            { name: "Lothian" },
            { name: "Luton" },
            { name: "Medway" },
            { name: "Merseyside" },
            { name: "Mid Glamorgan" },
            { name: "Middlesbrough" },
            { name: "Milton Keynes" },
            { name: "Monmouthshire" },
            { name: "Moray" },
            { name: "Norfolk" },
            { name: "North East Lincolnshire" },
            { name: "North Lincolnshire" },
            { name: "North Somerset" },
            { name: "North Yorkshire" },
            { name: "Northamptonshire" },
            { name: "Northumberland" },
            { name: "Nottingham" },
            { name: "Nottinghamshire" },
            { name: "Oxfordshire" },
            { name: "Pembrokeshire" },
            { name: "Perth and Kinross" },
            { name: "Peterborough" },
            { name: "Plymouth" },
            { name: "Poole" },
            { name: "Portsmouth" },
            { name: "Powys" },
            { name: "Reading" },
            { name: "Redcar and Cleveland" },
            { name: "Rutland" },
            { name: "Scottish Borders" },
            { name: "Shropshire" },
            { name: "Slough" },
            { name: "Somerset" },
            { name: "South Glamorgan" },
            { name: "South Gloucestershire" },
            { name: "South Yorkshire" },
            { name: "Southampton" },
            { name: "Southend-on-Sea" },
            { name: "Staffordshire" },
            { name: "Stirlingshire" },
            { name: "Stockton-on-Tees" },
            { name: "Stoke-on-Trent" },
            { name: "Strathclyde" },
            { name: "Suffolk" },
            { name: "Surrey" },
            { name: "Swindon" },
            { name: "Telford and Wrekin" },
            { name: "Thurrock" },
            { name: "Torbay" },
            { name: "Tyne and Wear" },
            { name: "Warrington" },
            { name: "Warwickshire" },
            { name: "West Berkshire" },
            { name: "West Glamorgan" },
            { name: "West Lothian" },
            { name: "West Midlands" },
            { name: "West Sussex" },
            { name: "West Yorkshire" },
            { name: "Western Isles" },
            { name: "Wiltshire" },
            { name: "Windsor and Maidenhead" },
            { name: "Wokingham" },
            { name: "Worcestershire" },
            { name: "Wrexham" },
            { name: "York" }
          ]
        },
        provinces: {
          "ca": [
            { name: "Alberta", abbreviation: "AB" },
            { name: "British Columbia", abbreviation: "BC" },
            { name: "Manitoba", abbreviation: "MB" },
            { name: "New Brunswick", abbreviation: "NB" },
            { name: "Newfoundland and Labrador", abbreviation: "NL" },
            { name: "Nova Scotia", abbreviation: "NS" },
            { name: "Ontario", abbreviation: "ON" },
            { name: "Prince Edward Island", abbreviation: "PE" },
            { name: "Quebec", abbreviation: "QC" },
            { name: "Saskatchewan", abbreviation: "SK" },
            { name: "Northwest Territories", abbreviation: "NT" },
            { name: "Nunavut", abbreviation: "NU" },
            { name: "Yukon", abbreviation: "YT" }
          ],
          "it": [
            { name: "Agrigento", abbreviation: "AG", code: 84 },
            { name: "Alessandria", abbreviation: "AL", code: 6 },
            { name: "Ancona", abbreviation: "AN", code: 42 },
            { name: "Aosta", abbreviation: "AO", code: 7 },
            { name: "L'Aquila", abbreviation: "AQ", code: 66 },
            { name: "Arezzo", abbreviation: "AR", code: 51 },
            { name: "Ascoli-Piceno", abbreviation: "AP", code: 44 },
            { name: "Asti", abbreviation: "AT", code: 5 },
            { name: "Avellino", abbreviation: "AV", code: 64 },
            { name: "Bari", abbreviation: "BA", code: 72 },
            { name: "Barletta-Andria-Trani", abbreviation: "BT", code: 72 },
            { name: "Belluno", abbreviation: "BL", code: 25 },
            { name: "Benevento", abbreviation: "BN", code: 62 },
            { name: "Bergamo", abbreviation: "BG", code: 16 },
            { name: "Biella", abbreviation: "BI", code: 96 },
            { name: "Bologna", abbreviation: "BO", code: 37 },
            { name: "Bolzano", abbreviation: "BZ", code: 21 },
            { name: "Brescia", abbreviation: "BS", code: 17 },
            { name: "Brindisi", abbreviation: "BR", code: 74 },
            { name: "Cagliari", abbreviation: "CA", code: 92 },
            { name: "Caltanissetta", abbreviation: "CL", code: 85 },
            { name: "Campobasso", abbreviation: "CB", code: 70 },
            { name: "Carbonia Iglesias", abbreviation: "CI", code: 70 },
            { name: "Caserta", abbreviation: "CE", code: 61 },
            { name: "Catania", abbreviation: "CT", code: 87 },
            { name: "Catanzaro", abbreviation: "CZ", code: 79 },
            { name: "Chieti", abbreviation: "CH", code: 69 },
            { name: "Como", abbreviation: "CO", code: 13 },
            { name: "Cosenza", abbreviation: "CS", code: 78 },
            { name: "Cremona", abbreviation: "CR", code: 19 },
            { name: "Crotone", abbreviation: "KR", code: 101 },
            { name: "Cuneo", abbreviation: "CN", code: 4 },
            { name: "Enna", abbreviation: "EN", code: 86 },
            { name: "Fermo", abbreviation: "FM", code: 86 },
            { name: "Ferrara", abbreviation: "FE", code: 38 },
            { name: "Firenze", abbreviation: "FI", code: 48 },
            { name: "Foggia", abbreviation: "FG", code: 71 },
            { name: "Forli-Cesena", abbreviation: "FC", code: 71 },
            { name: "Frosinone", abbreviation: "FR", code: 60 },
            { name: "Genova", abbreviation: "GE", code: 10 },
            { name: "Gorizia", abbreviation: "GO", code: 31 },
            { name: "Grosseto", abbreviation: "GR", code: 53 },
            { name: "Imperia", abbreviation: "IM", code: 8 },
            { name: "Isernia", abbreviation: "IS", code: 94 },
            { name: "La-Spezia", abbreviation: "SP", code: 66 },
            { name: "Latina", abbreviation: "LT", code: 59 },
            { name: "Lecce", abbreviation: "LE", code: 75 },
            { name: "Lecco", abbreviation: "LC", code: 97 },
            { name: "Livorno", abbreviation: "LI", code: 49 },
            { name: "Lodi", abbreviation: "LO", code: 98 },
            { name: "Lucca", abbreviation: "LU", code: 46 },
            { name: "Macerata", abbreviation: "MC", code: 43 },
            { name: "Mantova", abbreviation: "MN", code: 20 },
            { name: "Massa-Carrara", abbreviation: "MS", code: 45 },
            { name: "Matera", abbreviation: "MT", code: 77 },
            { name: "Medio Campidano", abbreviation: "VS", code: 77 },
            { name: "Messina", abbreviation: "ME", code: 83 },
            { name: "Milano", abbreviation: "MI", code: 15 },
            { name: "Modena", abbreviation: "MO", code: 36 },
            { name: "Monza-Brianza", abbreviation: "MB", code: 36 },
            { name: "Napoli", abbreviation: "NA", code: 63 },
            { name: "Novara", abbreviation: "NO", code: 3 },
            { name: "Nuoro", abbreviation: "NU", code: 91 },
            { name: "Ogliastra", abbreviation: "OG", code: 91 },
            { name: "Olbia Tempio", abbreviation: "OT", code: 91 },
            { name: "Oristano", abbreviation: "OR", code: 95 },
            { name: "Padova", abbreviation: "PD", code: 28 },
            { name: "Palermo", abbreviation: "PA", code: 82 },
            { name: "Parma", abbreviation: "PR", code: 34 },
            { name: "Pavia", abbreviation: "PV", code: 18 },
            { name: "Perugia", abbreviation: "PG", code: 54 },
            { name: "Pesaro-Urbino", abbreviation: "PU", code: 41 },
            { name: "Pescara", abbreviation: "PE", code: 68 },
            { name: "Piacenza", abbreviation: "PC", code: 33 },
            { name: "Pisa", abbreviation: "PI", code: 50 },
            { name: "Pistoia", abbreviation: "PT", code: 47 },
            { name: "Pordenone", abbreviation: "PN", code: 93 },
            { name: "Potenza", abbreviation: "PZ", code: 76 },
            { name: "Prato", abbreviation: "PO", code: 100 },
            { name: "Ragusa", abbreviation: "RG", code: 88 },
            { name: "Ravenna", abbreviation: "RA", code: 39 },
            { name: "Reggio-Calabria", abbreviation: "RC", code: 35 },
            { name: "Reggio-Emilia", abbreviation: "RE", code: 35 },
            { name: "Rieti", abbreviation: "RI", code: 57 },
            { name: "Rimini", abbreviation: "RN", code: 99 },
            { name: "Roma", abbreviation: "Roma", code: 58 },
            { name: "Rovigo", abbreviation: "RO", code: 29 },
            { name: "Salerno", abbreviation: "SA", code: 65 },
            { name: "Sassari", abbreviation: "SS", code: 90 },
            { name: "Savona", abbreviation: "SV", code: 9 },
            { name: "Siena", abbreviation: "SI", code: 52 },
            { name: "Siracusa", abbreviation: "SR", code: 89 },
            { name: "Sondrio", abbreviation: "SO", code: 14 },
            { name: "Taranto", abbreviation: "TA", code: 73 },
            { name: "Teramo", abbreviation: "TE", code: 67 },
            { name: "Terni", abbreviation: "TR", code: 55 },
            { name: "Torino", abbreviation: "TO", code: 1 },
            { name: "Trapani", abbreviation: "TP", code: 81 },
            { name: "Trento", abbreviation: "TN", code: 22 },
            { name: "Treviso", abbreviation: "TV", code: 26 },
            { name: "Trieste", abbreviation: "TS", code: 32 },
            { name: "Udine", abbreviation: "UD", code: 30 },
            { name: "Varese", abbreviation: "VA", code: 12 },
            { name: "Venezia", abbreviation: "VE", code: 27 },
            { name: "Verbania", abbreviation: "VB", code: 27 },
            { name: "Vercelli", abbreviation: "VC", code: 2 },
            { name: "Verona", abbreviation: "VR", code: 23 },
            { name: "Vibo-Valentia", abbreviation: "VV", code: 102 },
            { name: "Vicenza", abbreviation: "VI", code: 24 },
            { name: "Viterbo", abbreviation: "VT", code: 56 }
          ]
        },
        nationalities: [
          { name: "Afghan" },
          { name: "Albanian" },
          { name: "Algerian" },
          { name: "American" },
          { name: "Andorran" },
          { name: "Angolan" },
          { name: "Antiguans" },
          { name: "Argentinean" },
          { name: "Armenian" },
          { name: "Australian" },
          { name: "Austrian" },
          { name: "Azerbaijani" },
          { name: "Bahami" },
          { name: "Bahraini" },
          { name: "Bangladeshi" },
          { name: "Barbadian" },
          { name: "Barbudans" },
          { name: "Batswana" },
          { name: "Belarusian" },
          { name: "Belgian" },
          { name: "Belizean" },
          { name: "Beninese" },
          { name: "Bhutanese" },
          { name: "Bolivian" },
          { name: "Bosnian" },
          { name: "Brazilian" },
          { name: "British" },
          { name: "Bruneian" },
          { name: "Bulgarian" },
          { name: "Burkinabe" },
          { name: "Burmese" },
          { name: "Burundian" },
          { name: "Cambodian" },
          { name: "Cameroonian" },
          { name: "Canadian" },
          { name: "Cape Verdean" },
          { name: "Central African" },
          { name: "Chadian" },
          { name: "Chilean" },
          { name: "Chinese" },
          { name: "Colombian" },
          { name: "Comoran" },
          { name: "Congolese" },
          { name: "Costa Rican" },
          { name: "Croatian" },
          { name: "Cuban" },
          { name: "Cypriot" },
          { name: "Czech" },
          { name: "Danish" },
          { name: "Djibouti" },
          { name: "Dominican" },
          { name: "Dutch" },
          { name: "East Timorese" },
          { name: "Ecuadorean" },
          { name: "Egyptian" },
          { name: "Emirian" },
          { name: "Equatorial Guinean" },
          { name: "Eritrean" },
          { name: "Estonian" },
          { name: "Ethiopian" },
          { name: "Fijian" },
          { name: "Filipino" },
          { name: "Finnish" },
          { name: "French" },
          { name: "Gabonese" },
          { name: "Gambian" },
          { name: "Georgian" },
          { name: "German" },
          { name: "Ghanaian" },
          { name: "Greek" },
          { name: "Grenadian" },
          { name: "Guatemalan" },
          { name: "Guinea-Bissauan" },
          { name: "Guinean" },
          { name: "Guyanese" },
          { name: "Haitian" },
          { name: "Herzegovinian" },
          { name: "Honduran" },
          { name: "Hungarian" },
          { name: "I-Kiribati" },
          { name: "Icelander" },
          { name: "Indian" },
          { name: "Indonesian" },
          { name: "Iranian" },
          { name: "Iraqi" },
          { name: "Irish" },
          { name: "Israeli" },
          { name: "Italian" },
          { name: "Ivorian" },
          { name: "Jamaican" },
          { name: "Japanese" },
          { name: "Jordanian" },
          { name: "Kazakhstani" },
          { name: "Kenyan" },
          { name: "Kittian and Nevisian" },
          { name: "Kuwaiti" },
          { name: "Kyrgyz" },
          { name: "Laotian" },
          { name: "Latvian" },
          { name: "Lebanese" },
          { name: "Liberian" },
          { name: "Libyan" },
          { name: "Liechtensteiner" },
          { name: "Lithuanian" },
          { name: "Luxembourger" },
          { name: "Macedonian" },
          { name: "Malagasy" },
          { name: "Malawian" },
          { name: "Malaysian" },
          { name: "Maldivan" },
          { name: "Malian" },
          { name: "Maltese" },
          { name: "Marshallese" },
          { name: "Mauritanian" },
          { name: "Mauritian" },
          { name: "Mexican" },
          { name: "Micronesian" },
          { name: "Moldovan" },
          { name: "Monacan" },
          { name: "Mongolian" },
          { name: "Moroccan" },
          { name: "Mosotho" },
          { name: "Motswana" },
          { name: "Mozambican" },
          { name: "Namibian" },
          { name: "Nauruan" },
          { name: "Nepalese" },
          { name: "New Zealander" },
          { name: "Nicaraguan" },
          { name: "Nigerian" },
          { name: "Nigerien" },
          { name: "North Korean" },
          { name: "Northern Irish" },
          { name: "Norwegian" },
          { name: "Omani" },
          { name: "Pakistani" },
          { name: "Palauan" },
          { name: "Panamanian" },
          { name: "Papua New Guinean" },
          { name: "Paraguayan" },
          { name: "Peruvian" },
          { name: "Polish" },
          { name: "Portuguese" },
          { name: "Qatari" },
          { name: "Romani" },
          { name: "Russian" },
          { name: "Rwandan" },
          { name: "Saint Lucian" },
          { name: "Salvadoran" },
          { name: "Samoan" },
          { name: "San Marinese" },
          { name: "Sao Tomean" },
          { name: "Saudi" },
          { name: "Scottish" },
          { name: "Senegalese" },
          { name: "Serbian" },
          { name: "Seychellois" },
          { name: "Sierra Leonean" },
          { name: "Singaporean" },
          { name: "Slovakian" },
          { name: "Slovenian" },
          { name: "Solomon Islander" },
          { name: "Somali" },
          { name: "South African" },
          { name: "South Korean" },
          { name: "Spanish" },
          { name: "Sri Lankan" },
          { name: "Sudanese" },
          { name: "Surinamer" },
          { name: "Swazi" },
          { name: "Swedish" },
          { name: "Swiss" },
          { name: "Syrian" },
          { name: "Taiwanese" },
          { name: "Tajik" },
          { name: "Tanzanian" },
          { name: "Thai" },
          { name: "Togolese" },
          { name: "Tongan" },
          { name: "Trinidadian or Tobagonian" },
          { name: "Tunisian" },
          { name: "Turkish" },
          { name: "Tuvaluan" },
          { name: "Ugandan" },
          { name: "Ukrainian" },
          { name: "Uruguaya" },
          { name: "Uzbekistani" },
          { name: "Venezuela" },
          { name: "Vietnamese" },
          { name: "Wels" },
          { name: "Yemenit" },
          { name: "Zambia" },
          { name: "Zimbabwe" }
        ],
        locale_languages: [
          "aa",
          "ab",
          "ae",
          "af",
          "ak",
          "am",
          "an",
          "ar",
          "as",
          "av",
          "ay",
          "az",
          "ba",
          "be",
          "bg",
          "bh",
          "bi",
          "bm",
          "bn",
          "bo",
          "br",
          "bs",
          "ca",
          "ce",
          "ch",
          "co",
          "cr",
          "cs",
          "cu",
          "cv",
          "cy",
          "da",
          "de",
          "dv",
          "dz",
          "ee",
          "el",
          "en",
          "eo",
          "es",
          "et",
          "eu",
          "fa",
          "ff",
          "fi",
          "fj",
          "fo",
          "fr",
          "fy",
          "ga",
          "gd",
          "gl",
          "gn",
          "gu",
          "gv",
          "ha",
          "he",
          "hi",
          "ho",
          "hr",
          "ht",
          "hu",
          "hy",
          "hz",
          "ia",
          "id",
          "ie",
          "ig",
          "ii",
          "ik",
          "io",
          "is",
          "it",
          "iu",
          "ja",
          "jv",
          "ka",
          "kg",
          "ki",
          "kj",
          "kk",
          "kl",
          "km",
          "kn",
          "ko",
          "kr",
          "ks",
          "ku",
          "kv",
          "kw",
          "ky",
          "la",
          "lb",
          "lg",
          "li",
          "ln",
          "lo",
          "lt",
          "lu",
          "lv",
          "mg",
          "mh",
          "mi",
          "mk",
          "ml",
          "mn",
          "mr",
          "ms",
          "mt",
          "my",
          "na",
          "nb",
          "nd",
          "ne",
          "ng",
          "nl",
          "nn",
          "no",
          "nr",
          "nv",
          "ny",
          "oc",
          "oj",
          "om",
          "or",
          "os",
          "pa",
          "pi",
          "pl",
          "ps",
          "pt",
          "qu",
          "rm",
          "rn",
          "ro",
          "ru",
          "rw",
          "sa",
          "sc",
          "sd",
          "se",
          "sg",
          "si",
          "sk",
          "sl",
          "sm",
          "sn",
          "so",
          "sq",
          "sr",
          "ss",
          "st",
          "su",
          "sv",
          "sw",
          "ta",
          "te",
          "tg",
          "th",
          "ti",
          "tk",
          "tl",
          "tn",
          "to",
          "tr",
          "ts",
          "tt",
          "tw",
          "ty",
          "ug",
          "uk",
          "ur",
          "uz",
          "ve",
          "vi",
          "vo",
          "wa",
          "wo",
          "xh",
          "yi",
          "yo",
          "za",
          "zh",
          "zu"
        ],
        locale_regions: [
          "agq-CM",
          "asa-TZ",
          "ast-ES",
          "bas-CM",
          "bem-ZM",
          "bez-TZ",
          "brx-IN",
          "cgg-UG",
          "chr-US",
          "dav-KE",
          "dje-NE",
          "dsb-DE",
          "dua-CM",
          "dyo-SN",
          "ebu-KE",
          "ewo-CM",
          "fil-PH",
          "fur-IT",
          "gsw-CH",
          "gsw-FR",
          "gsw-LI",
          "guz-KE",
          "haw-US",
          "hsb-DE",
          "jgo-CM",
          "jmc-TZ",
          "kab-DZ",
          "kam-KE",
          "kde-TZ",
          "kea-CV",
          "khq-ML",
          "kkj-CM",
          "kln-KE",
          "kok-IN",
          "ksb-TZ",
          "ksf-CM",
          "ksh-DE",
          "lag-TZ",
          "lkt-US",
          "luo-KE",
          "luy-KE",
          "mas-KE",
          "mas-TZ",
          "mer-KE",
          "mfe-MU",
          "mgh-MZ",
          "mgo-CM",
          "mua-CM",
          "naq-NA",
          "nmg-CM",
          "nnh-CM",
          "nus-SD",
          "nyn-UG",
          "rof-TZ",
          "rwk-TZ",
          "sah-RU",
          "saq-KE",
          "sbp-TZ",
          "seh-MZ",
          "ses-ML",
          "shi-Latn",
          "shi-Latn-MA",
          "shi-Tfng",
          "shi-Tfng-MA",
          "smn-FI",
          "teo-KE",
          "teo-UG",
          "twq-NE",
          "tzm-Latn",
          "tzm-Latn-MA",
          "vai-Latn",
          "vai-Latn-LR",
          "vai-Vaii",
          "vai-Vaii-LR",
          "vun-TZ",
          "wae-CH",
          "xog-UG",
          "yav-CM",
          "zgh-MA",
          "af-NA",
          "af-ZA",
          "ak-GH",
          "am-ET",
          "ar-001",
          "ar-AE",
          "ar-BH",
          "ar-DJ",
          "ar-DZ",
          "ar-EG",
          "ar-EH",
          "ar-ER",
          "ar-IL",
          "ar-IQ",
          "ar-JO",
          "ar-KM",
          "ar-KW",
          "ar-LB",
          "ar-LY",
          "ar-MA",
          "ar-MR",
          "ar-OM",
          "ar-PS",
          "ar-QA",
          "ar-SA",
          "ar-SD",
          "ar-SO",
          "ar-SS",
          "ar-SY",
          "ar-TD",
          "ar-TN",
          "ar-YE",
          "as-IN",
          "az-Cyrl",
          "az-Cyrl-AZ",
          "az-Latn",
          "az-Latn-AZ",
          "be-BY",
          "bg-BG",
          "bm-Latn",
          "bm-Latn-ML",
          "bn-BD",
          "bn-IN",
          "bo-CN",
          "bo-IN",
          "br-FR",
          "bs-Cyrl",
          "bs-Cyrl-BA",
          "bs-Latn",
          "bs-Latn-BA",
          "ca-AD",
          "ca-ES",
          "ca-ES-VALENCIA",
          "ca-FR",
          "ca-IT",
          "cs-CZ",
          "cy-GB",
          "da-DK",
          "da-GL",
          "de-AT",
          "de-BE",
          "de-CH",
          "de-DE",
          "de-LI",
          "de-LU",
          "dz-BT",
          "ee-GH",
          "ee-TG",
          "el-CY",
          "el-GR",
          "en-001",
          "en-150",
          "en-AG",
          "en-AI",
          "en-AS",
          "en-AU",
          "en-BB",
          "en-BE",
          "en-BM",
          "en-BS",
          "en-BW",
          "en-BZ",
          "en-CA",
          "en-CC",
          "en-CK",
          "en-CM",
          "en-CX",
          "en-DG",
          "en-DM",
          "en-ER",
          "en-FJ",
          "en-FK",
          "en-FM",
          "en-GB",
          "en-GD",
          "en-GG",
          "en-GH",
          "en-GI",
          "en-GM",
          "en-GU",
          "en-GY",
          "en-HK",
          "en-IE",
          "en-IM",
          "en-IN",
          "en-IO",
          "en-JE",
          "en-JM",
          "en-KE",
          "en-KI",
          "en-KN",
          "en-KY",
          "en-LC",
          "en-LR",
          "en-LS",
          "en-MG",
          "en-MH",
          "en-MO",
          "en-MP",
          "en-MS",
          "en-MT",
          "en-MU",
          "en-MW",
          "en-MY",
          "en-NA",
          "en-NF",
          "en-NG",
          "en-NR",
          "en-NU",
          "en-NZ",
          "en-PG",
          "en-PH",
          "en-PK",
          "en-PN",
          "en-PR",
          "en-PW",
          "en-RW",
          "en-SB",
          "en-SC",
          "en-SD",
          "en-SG",
          "en-SH",
          "en-SL",
          "en-SS",
          "en-SX",
          "en-SZ",
          "en-TC",
          "en-TK",
          "en-TO",
          "en-TT",
          "en-TV",
          "en-TZ",
          "en-UG",
          "en-UM",
          "en-US",
          "en-US-POSIX",
          "en-VC",
          "en-VG",
          "en-VI",
          "en-VU",
          "en-WS",
          "en-ZA",
          "en-ZM",
          "en-ZW",
          "eo-001",
          "es-419",
          "es-AR",
          "es-BO",
          "es-CL",
          "es-CO",
          "es-CR",
          "es-CU",
          "es-DO",
          "es-EA",
          "es-EC",
          "es-ES",
          "es-GQ",
          "es-GT",
          "es-HN",
          "es-IC",
          "es-MX",
          "es-NI",
          "es-PA",
          "es-PE",
          "es-PH",
          "es-PR",
          "es-PY",
          "es-SV",
          "es-US",
          "es-UY",
          "es-VE",
          "et-EE",
          "eu-ES",
          "fa-AF",
          "fa-IR",
          "ff-CM",
          "ff-GN",
          "ff-MR",
          "ff-SN",
          "fi-FI",
          "fo-FO",
          "fr-BE",
          "fr-BF",
          "fr-BI",
          "fr-BJ",
          "fr-BL",
          "fr-CA",
          "fr-CD",
          "fr-CF",
          "fr-CG",
          "fr-CH",
          "fr-CI",
          "fr-CM",
          "fr-DJ",
          "fr-DZ",
          "fr-FR",
          "fr-GA",
          "fr-GF",
          "fr-GN",
          "fr-GP",
          "fr-GQ",
          "fr-HT",
          "fr-KM",
          "fr-LU",
          "fr-MA",
          "fr-MC",
          "fr-MF",
          "fr-MG",
          "fr-ML",
          "fr-MQ",
          "fr-MR",
          "fr-MU",
          "fr-NC",
          "fr-NE",
          "fr-PF",
          "fr-PM",
          "fr-RE",
          "fr-RW",
          "fr-SC",
          "fr-SN",
          "fr-SY",
          "fr-TD",
          "fr-TG",
          "fr-TN",
          "fr-VU",
          "fr-WF",
          "fr-YT",
          "fy-NL",
          "ga-IE",
          "gd-GB",
          "gl-ES",
          "gu-IN",
          "gv-IM",
          "ha-Latn",
          "ha-Latn-GH",
          "ha-Latn-NE",
          "ha-Latn-NG",
          "he-IL",
          "hi-IN",
          "hr-BA",
          "hr-HR",
          "hu-HU",
          "hy-AM",
          "id-ID",
          "ig-NG",
          "ii-CN",
          "is-IS",
          "it-CH",
          "it-IT",
          "it-SM",
          "ja-JP",
          "ka-GE",
          "ki-KE",
          "kk-Cyrl",
          "kk-Cyrl-KZ",
          "kl-GL",
          "km-KH",
          "kn-IN",
          "ko-KP",
          "ko-KR",
          "ks-Arab",
          "ks-Arab-IN",
          "kw-GB",
          "ky-Cyrl",
          "ky-Cyrl-KG",
          "lb-LU",
          "lg-UG",
          "ln-AO",
          "ln-CD",
          "ln-CF",
          "ln-CG",
          "lo-LA",
          "lt-LT",
          "lu-CD",
          "lv-LV",
          "mg-MG",
          "mk-MK",
          "ml-IN",
          "mn-Cyrl",
          "mn-Cyrl-MN",
          "mr-IN",
          "ms-Latn",
          "ms-Latn-BN",
          "ms-Latn-MY",
          "ms-Latn-SG",
          "mt-MT",
          "my-MM",
          "nb-NO",
          "nb-SJ",
          "nd-ZW",
          "ne-IN",
          "ne-NP",
          "nl-AW",
          "nl-BE",
          "nl-BQ",
          "nl-CW",
          "nl-NL",
          "nl-SR",
          "nl-SX",
          "nn-NO",
          "om-ET",
          "om-KE",
          "or-IN",
          "os-GE",
          "os-RU",
          "pa-Arab",
          "pa-Arab-PK",
          "pa-Guru",
          "pa-Guru-IN",
          "pl-PL",
          "ps-AF",
          "pt-AO",
          "pt-BR",
          "pt-CV",
          "pt-GW",
          "pt-MO",
          "pt-MZ",
          "pt-PT",
          "pt-ST",
          "pt-TL",
          "qu-BO",
          "qu-EC",
          "qu-PE",
          "rm-CH",
          "rn-BI",
          "ro-MD",
          "ro-RO",
          "ru-BY",
          "ru-KG",
          "ru-KZ",
          "ru-MD",
          "ru-RU",
          "ru-UA",
          "rw-RW",
          "se-FI",
          "se-NO",
          "se-SE",
          "sg-CF",
          "si-LK",
          "sk-SK",
          "sl-SI",
          "sn-ZW",
          "so-DJ",
          "so-ET",
          "so-KE",
          "so-SO",
          "sq-AL",
          "sq-MK",
          "sq-XK",
          "sr-Cyrl",
          "sr-Cyrl-BA",
          "sr-Cyrl-ME",
          "sr-Cyrl-RS",
          "sr-Cyrl-XK",
          "sr-Latn",
          "sr-Latn-BA",
          "sr-Latn-ME",
          "sr-Latn-RS",
          "sr-Latn-XK",
          "sv-AX",
          "sv-FI",
          "sv-SE",
          "sw-CD",
          "sw-KE",
          "sw-TZ",
          "sw-UG",
          "ta-IN",
          "ta-LK",
          "ta-MY",
          "ta-SG",
          "te-IN",
          "th-TH",
          "ti-ER",
          "ti-ET",
          "to-TO",
          "tr-CY",
          "tr-TR",
          "ug-Arab",
          "ug-Arab-CN",
          "uk-UA",
          "ur-IN",
          "ur-PK",
          "uz-Arab",
          "uz-Arab-AF",
          "uz-Cyrl",
          "uz-Cyrl-UZ",
          "uz-Latn",
          "uz-Latn-UZ",
          "vi-VN",
          "yi-001",
          "yo-BJ",
          "yo-NG",
          "zh-Hans",
          "zh-Hans-CN",
          "zh-Hans-HK",
          "zh-Hans-MO",
          "zh-Hans-SG",
          "zh-Hant",
          "zh-Hant-HK",
          "zh-Hant-MO",
          "zh-Hant-TW",
          "zu-ZA"
        ],
        us_states_and_dc: [
          { name: "Alabama", abbreviation: "AL" },
          { name: "Alaska", abbreviation: "AK" },
          { name: "Arizona", abbreviation: "AZ" },
          { name: "Arkansas", abbreviation: "AR" },
          { name: "California", abbreviation: "CA" },
          { name: "Colorado", abbreviation: "CO" },
          { name: "Connecticut", abbreviation: "CT" },
          { name: "Delaware", abbreviation: "DE" },
          { name: "District of Columbia", abbreviation: "DC" },
          { name: "Florida", abbreviation: "FL" },
          { name: "Georgia", abbreviation: "GA" },
          { name: "Hawaii", abbreviation: "HI" },
          { name: "Idaho", abbreviation: "ID" },
          { name: "Illinois", abbreviation: "IL" },
          { name: "Indiana", abbreviation: "IN" },
          { name: "Iowa", abbreviation: "IA" },
          { name: "Kansas", abbreviation: "KS" },
          { name: "Kentucky", abbreviation: "KY" },
          { name: "Louisiana", abbreviation: "LA" },
          { name: "Maine", abbreviation: "ME" },
          { name: "Maryland", abbreviation: "MD" },
          { name: "Massachusetts", abbreviation: "MA" },
          { name: "Michigan", abbreviation: "MI" },
          { name: "Minnesota", abbreviation: "MN" },
          { name: "Mississippi", abbreviation: "MS" },
          { name: "Missouri", abbreviation: "MO" },
          { name: "Montana", abbreviation: "MT" },
          { name: "Nebraska", abbreviation: "NE" },
          { name: "Nevada", abbreviation: "NV" },
          { name: "New Hampshire", abbreviation: "NH" },
          { name: "New Jersey", abbreviation: "NJ" },
          { name: "New Mexico", abbreviation: "NM" },
          { name: "New York", abbreviation: "NY" },
          { name: "North Carolina", abbreviation: "NC" },
          { name: "North Dakota", abbreviation: "ND" },
          { name: "Ohio", abbreviation: "OH" },
          { name: "Oklahoma", abbreviation: "OK" },
          { name: "Oregon", abbreviation: "OR" },
          { name: "Pennsylvania", abbreviation: "PA" },
          { name: "Rhode Island", abbreviation: "RI" },
          { name: "South Carolina", abbreviation: "SC" },
          { name: "South Dakota", abbreviation: "SD" },
          { name: "Tennessee", abbreviation: "TN" },
          { name: "Texas", abbreviation: "TX" },
          { name: "Utah", abbreviation: "UT" },
          { name: "Vermont", abbreviation: "VT" },
          { name: "Virginia", abbreviation: "VA" },
          { name: "Washington", abbreviation: "WA" },
          { name: "West Virginia", abbreviation: "WV" },
          { name: "Wisconsin", abbreviation: "WI" },
          { name: "Wyoming", abbreviation: "WY" }
        ],
        territories: [
          { name: "American Samoa", abbreviation: "AS" },
          { name: "Federated States of Micronesia", abbreviation: "FM" },
          { name: "Guam", abbreviation: "GU" },
          { name: "Marshall Islands", abbreviation: "MH" },
          { name: "Northern Mariana Islands", abbreviation: "MP" },
          { name: "Puerto Rico", abbreviation: "PR" },
          { name: "Virgin Islands, U.S.", abbreviation: "VI" }
        ],
        armed_forces: [
          { name: "Armed Forces Europe", abbreviation: "AE" },
          { name: "Armed Forces Pacific", abbreviation: "AP" },
          { name: "Armed Forces the Americas", abbreviation: "AA" }
        ],
        country_regions: {
          it: [
            { name: "Valle d'Aosta", abbreviation: "VDA" },
            { name: "Piemonte", abbreviation: "PIE" },
            { name: "Lombardia", abbreviation: "LOM" },
            { name: "Veneto", abbreviation: "VEN" },
            { name: "Trentino Alto Adige", abbreviation: "TAA" },
            { name: "Friuli Venezia Giulia", abbreviation: "FVG" },
            { name: "Liguria", abbreviation: "LIG" },
            { name: "Emilia Romagna", abbreviation: "EMR" },
            { name: "Toscana", abbreviation: "TOS" },
            { name: "Umbria", abbreviation: "UMB" },
            { name: "Marche", abbreviation: "MAR" },
            { name: "Abruzzo", abbreviation: "ABR" },
            { name: "Lazio", abbreviation: "LAZ" },
            { name: "Campania", abbreviation: "CAM" },
            { name: "Puglia", abbreviation: "PUG" },
            { name: "Basilicata", abbreviation: "BAS" },
            { name: "Molise", abbreviation: "MOL" },
            { name: "Calabria", abbreviation: "CAL" },
            { name: "Sicilia", abbreviation: "SIC" },
            { name: "Sardegna", abbreviation: "SAR" }
          ],
          mx: [
            { name: "Aguascalientes", abbreviation: "AGU" },
            { name: "Baja California", abbreviation: "BCN" },
            { name: "Baja California Sur", abbreviation: "BCS" },
            { name: "Campeche", abbreviation: "CAM" },
            { name: "Chiapas", abbreviation: "CHP" },
            { name: "Chihuahua", abbreviation: "CHH" },
            { name: "Ciudad de M\xE9xico", abbreviation: "DIF" },
            { name: "Coahuila", abbreviation: "COA" },
            { name: "Colima", abbreviation: "COL" },
            { name: "Durango", abbreviation: "DUR" },
            { name: "Guanajuato", abbreviation: "GUA" },
            { name: "Guerrero", abbreviation: "GRO" },
            { name: "Hidalgo", abbreviation: "HID" },
            { name: "Jalisco", abbreviation: "JAL" },
            { name: "M\xE9xico", abbreviation: "MEX" },
            { name: "Michoac\xE1n", abbreviation: "MIC" },
            { name: "Morelos", abbreviation: "MOR" },
            { name: "Nayarit", abbreviation: "NAY" },
            { name: "Nuevo Le\xF3n", abbreviation: "NLE" },
            { name: "Oaxaca", abbreviation: "OAX" },
            { name: "Puebla", abbreviation: "PUE" },
            { name: "Quer\xE9taro", abbreviation: "QUE" },
            { name: "Quintana Roo", abbreviation: "ROO" },
            { name: "San Luis Potos\xED", abbreviation: "SLP" },
            { name: "Sinaloa", abbreviation: "SIN" },
            { name: "Sonora", abbreviation: "SON" },
            { name: "Tabasco", abbreviation: "TAB" },
            { name: "Tamaulipas", abbreviation: "TAM" },
            { name: "Tlaxcala", abbreviation: "TLA" },
            { name: "Veracruz", abbreviation: "VER" },
            { name: "Yucat\xE1n", abbreviation: "YUC" },
            { name: "Zacatecas", abbreviation: "ZAC" }
          ]
        },
        street_suffixes: {
          "us": [
            { name: "Avenue", abbreviation: "Ave" },
            { name: "Boulevard", abbreviation: "Blvd" },
            { name: "Center", abbreviation: "Ctr" },
            { name: "Circle", abbreviation: "Cir" },
            { name: "Court", abbreviation: "Ct" },
            { name: "Drive", abbreviation: "Dr" },
            { name: "Extension", abbreviation: "Ext" },
            { name: "Glen", abbreviation: "Gln" },
            { name: "Grove", abbreviation: "Grv" },
            { name: "Heights", abbreviation: "Hts" },
            { name: "Highway", abbreviation: "Hwy" },
            { name: "Junction", abbreviation: "Jct" },
            { name: "Key", abbreviation: "Key" },
            { name: "Lane", abbreviation: "Ln" },
            { name: "Loop", abbreviation: "Loop" },
            { name: "Manor", abbreviation: "Mnr" },
            { name: "Mill", abbreviation: "Mill" },
            { name: "Park", abbreviation: "Park" },
            { name: "Parkway", abbreviation: "Pkwy" },
            { name: "Pass", abbreviation: "Pass" },
            { name: "Path", abbreviation: "Path" },
            { name: "Pike", abbreviation: "Pike" },
            { name: "Place", abbreviation: "Pl" },
            { name: "Plaza", abbreviation: "Plz" },
            { name: "Point", abbreviation: "Pt" },
            { name: "Ridge", abbreviation: "Rdg" },
            { name: "River", abbreviation: "Riv" },
            { name: "Road", abbreviation: "Rd" },
            { name: "Square", abbreviation: "Sq" },
            { name: "Street", abbreviation: "St" },
            { name: "Terrace", abbreviation: "Ter" },
            { name: "Trail", abbreviation: "Trl" },
            { name: "Turnpike", abbreviation: "Tpke" },
            { name: "View", abbreviation: "Vw" },
            { name: "Way", abbreviation: "Way" }
          ],
          "it": [
            { name: "Accesso", abbreviation: "Acc." },
            { name: "Alzaia", abbreviation: "Alz." },
            { name: "Arco", abbreviation: "Arco" },
            { name: "Archivolto", abbreviation: "Acv." },
            { name: "Arena", abbreviation: "Arena" },
            { name: "Argine", abbreviation: "Argine" },
            { name: "Bacino", abbreviation: "Bacino" },
            { name: "Banchi", abbreviation: "Banchi" },
            { name: "Banchina", abbreviation: "Ban." },
            { name: "Bastioni", abbreviation: "Bas." },
            { name: "Belvedere", abbreviation: "Belv." },
            { name: "Borgata", abbreviation: "B.ta" },
            { name: "Borgo", abbreviation: "B.go" },
            { name: "Calata", abbreviation: "Cal." },
            { name: "Calle", abbreviation: "Calle" },
            { name: "Campiello", abbreviation: "Cam." },
            { name: "Campo", abbreviation: "Cam." },
            { name: "Canale", abbreviation: "Can." },
            { name: "Carraia", abbreviation: "Carr." },
            { name: "Cascina", abbreviation: "Cascina" },
            { name: "Case sparse", abbreviation: "c.s." },
            { name: "Cavalcavia", abbreviation: "Cv." },
            { name: "Circonvallazione", abbreviation: "Cv." },
            { name: "Complanare", abbreviation: "C.re" },
            { name: "Contrada", abbreviation: "C.da" },
            { name: "Corso", abbreviation: "C.so" },
            { name: "Corte", abbreviation: "C.te" },
            { name: "Cortile", abbreviation: "C.le" },
            { name: "Diramazione", abbreviation: "Dir." },
            { name: "Fondaco", abbreviation: "F.co" },
            { name: "Fondamenta", abbreviation: "F.ta" },
            { name: "Fondo", abbreviation: "F.do" },
            { name: "Frazione", abbreviation: "Fr." },
            { name: "Isola", abbreviation: "Is." },
            { name: "Largo", abbreviation: "L.go" },
            { name: "Litoranea", abbreviation: "Lit." },
            { name: "Lungolago", abbreviation: "L.go lago" },
            { name: "Lungo Po", abbreviation: "l.go Po" },
            { name: "Molo", abbreviation: "Molo" },
            { name: "Mura", abbreviation: "Mura" },
            { name: "Passaggio privato", abbreviation: "pass. priv." },
            { name: "Passeggiata", abbreviation: "Pass." },
            { name: "Piazza", abbreviation: "P.zza" },
            { name: "Piazzale", abbreviation: "P.le" },
            { name: "Ponte", abbreviation: "P.te" },
            { name: "Portico", abbreviation: "P.co" },
            { name: "Rampa", abbreviation: "Rampa" },
            { name: "Regione", abbreviation: "Reg." },
            { name: "Rione", abbreviation: "R.ne" },
            { name: "Rio", abbreviation: "Rio" },
            { name: "Ripa", abbreviation: "Ripa" },
            { name: "Riva", abbreviation: "Riva" },
            { name: "Rond\xF2", abbreviation: "Rond\xF2" },
            { name: "Rotonda", abbreviation: "Rot." },
            { name: "Sagrato", abbreviation: "Sagr." },
            { name: "Salita", abbreviation: "Sal." },
            { name: "Scalinata", abbreviation: "Scal." },
            { name: "Scalone", abbreviation: "Scal." },
            { name: "Slargo", abbreviation: "Sl." },
            { name: "Sottoportico", abbreviation: "Sott." },
            { name: "Strada", abbreviation: "Str." },
            { name: "Stradale", abbreviation: "Str.le" },
            { name: "Strettoia", abbreviation: "Strett." },
            { name: "Traversa", abbreviation: "Trav." },
            { name: "Via", abbreviation: "V." },
            { name: "Viale", abbreviation: "V.le" },
            { name: "Vicinale", abbreviation: "Vic.le" },
            { name: "Vicolo", abbreviation: "Vic." }
          ],
          "uk": [
            { name: "Avenue", abbreviation: "Ave" },
            { name: "Close", abbreviation: "Cl" },
            { name: "Court", abbreviation: "Ct" },
            { name: "Crescent", abbreviation: "Cr" },
            { name: "Drive", abbreviation: "Dr" },
            { name: "Garden", abbreviation: "Gdn" },
            { name: "Gardens", abbreviation: "Gdns" },
            { name: "Green", abbreviation: "Gn" },
            { name: "Grove", abbreviation: "Gr" },
            { name: "Lane", abbreviation: "Ln" },
            { name: "Mount", abbreviation: "Mt" },
            { name: "Place", abbreviation: "Pl" },
            { name: "Park", abbreviation: "Pk" },
            { name: "Ridge", abbreviation: "Rdg" },
            { name: "Road", abbreviation: "Rd" },
            { name: "Square", abbreviation: "Sq" },
            { name: "Street", abbreviation: "St" },
            { name: "Terrace", abbreviation: "Ter" },
            { name: "Valley", abbreviation: "Val" }
          ]
        },
        months: [
          { name: "January", short_name: "Jan", numeric: "01", days: 31 },
          { name: "February", short_name: "Feb", numeric: "02", days: 28 },
          { name: "March", short_name: "Mar", numeric: "03", days: 31 },
          { name: "April", short_name: "Apr", numeric: "04", days: 30 },
          { name: "May", short_name: "May", numeric: "05", days: 31 },
          { name: "June", short_name: "Jun", numeric: "06", days: 30 },
          { name: "July", short_name: "Jul", numeric: "07", days: 31 },
          { name: "August", short_name: "Aug", numeric: "08", days: 31 },
          { name: "September", short_name: "Sep", numeric: "09", days: 30 },
          { name: "October", short_name: "Oct", numeric: "10", days: 31 },
          { name: "November", short_name: "Nov", numeric: "11", days: 30 },
          { name: "December", short_name: "Dec", numeric: "12", days: 31 }
        ],
        cc_types: [
          { name: "American Express", short_name: "amex", prefix: "34", length: 15 },
          { name: "Bankcard", short_name: "bankcard", prefix: "5610", length: 16 },
          { name: "China UnionPay", short_name: "chinaunion", prefix: "62", length: 16 },
          { name: "Diners Club Carte Blanche", short_name: "dccarte", prefix: "300", length: 14 },
          { name: "Diners Club enRoute", short_name: "dcenroute", prefix: "2014", length: 15 },
          { name: "Diners Club International", short_name: "dcintl", prefix: "36", length: 14 },
          { name: "Diners Club United States & Canada", short_name: "dcusc", prefix: "54", length: 16 },
          { name: "Discover Card", short_name: "discover", prefix: "6011", length: 16 },
          { name: "InstaPayment", short_name: "instapay", prefix: "637", length: 16 },
          { name: "JCB", short_name: "jcb", prefix: "3528", length: 16 },
          { name: "Laser", short_name: "laser", prefix: "6304", length: 16 },
          { name: "Maestro", short_name: "maestro", prefix: "5018", length: 16 },
          { name: "Mastercard", short_name: "mc", prefix: "51", length: 16 },
          { name: "Solo", short_name: "solo", prefix: "6334", length: 16 },
          { name: "Switch", short_name: "switch", prefix: "4903", length: 16 },
          { name: "Visa", short_name: "visa", prefix: "4", length: 16 },
          { name: "Visa Electron", short_name: "electron", prefix: "4026", length: 16 }
        ],
        currency_types: [
          { "code": "AED", "name": "United Arab Emirates Dirham" },
          { "code": "AFN", "name": "Afghanistan Afghani" },
          { "code": "ALL", "name": "Albania Lek" },
          { "code": "AMD", "name": "Armenia Dram" },
          { "code": "ANG", "name": "Netherlands Antilles Guilder" },
          { "code": "AOA", "name": "Angola Kwanza" },
          { "code": "ARS", "name": "Argentina Peso" },
          { "code": "AUD", "name": "Australia Dollar" },
          { "code": "AWG", "name": "Aruba Guilder" },
          { "code": "AZN", "name": "Azerbaijan New Manat" },
          { "code": "BAM", "name": "Bosnia and Herzegovina Convertible Marka" },
          { "code": "BBD", "name": "Barbados Dollar" },
          { "code": "BDT", "name": "Bangladesh Taka" },
          { "code": "BGN", "name": "Bulgaria Lev" },
          { "code": "BHD", "name": "Bahrain Dinar" },
          { "code": "BIF", "name": "Burundi Franc" },
          { "code": "BMD", "name": "Bermuda Dollar" },
          { "code": "BND", "name": "Brunei Darussalam Dollar" },
          { "code": "BOB", "name": "Bolivia Boliviano" },
          { "code": "BRL", "name": "Brazil Real" },
          { "code": "BSD", "name": "Bahamas Dollar" },
          { "code": "BTN", "name": "Bhutan Ngultrum" },
          { "code": "BWP", "name": "Botswana Pula" },
          { "code": "BYR", "name": "Belarus Ruble" },
          { "code": "BZD", "name": "Belize Dollar" },
          { "code": "CAD", "name": "Canada Dollar" },
          { "code": "CDF", "name": "Congo/Kinshasa Franc" },
          { "code": "CHF", "name": "Switzerland Franc" },
          { "code": "CLP", "name": "Chile Peso" },
          { "code": "CNY", "name": "China Yuan Renminbi" },
          { "code": "COP", "name": "Colombia Peso" },
          { "code": "CRC", "name": "Costa Rica Colon" },
          { "code": "CUC", "name": "Cuba Convertible Peso" },
          { "code": "CUP", "name": "Cuba Peso" },
          { "code": "CVE", "name": "Cape Verde Escudo" },
          { "code": "CZK", "name": "Czech Republic Koruna" },
          { "code": "DJF", "name": "Djibouti Franc" },
          { "code": "DKK", "name": "Denmark Krone" },
          { "code": "DOP", "name": "Dominican Republic Peso" },
          { "code": "DZD", "name": "Algeria Dinar" },
          { "code": "EGP", "name": "Egypt Pound" },
          { "code": "ERN", "name": "Eritrea Nakfa" },
          { "code": "ETB", "name": "Ethiopia Birr" },
          { "code": "EUR", "name": "Euro Member Countries" },
          { "code": "FJD", "name": "Fiji Dollar" },
          { "code": "FKP", "name": "Falkland Islands (Malvinas) Pound" },
          { "code": "GBP", "name": "United Kingdom Pound" },
          { "code": "GEL", "name": "Georgia Lari" },
          { "code": "GGP", "name": "Guernsey Pound" },
          { "code": "GHS", "name": "Ghana Cedi" },
          { "code": "GIP", "name": "Gibraltar Pound" },
          { "code": "GMD", "name": "Gambia Dalasi" },
          { "code": "GNF", "name": "Guinea Franc" },
          { "code": "GTQ", "name": "Guatemala Quetzal" },
          { "code": "GYD", "name": "Guyana Dollar" },
          { "code": "HKD", "name": "Hong Kong Dollar" },
          { "code": "HNL", "name": "Honduras Lempira" },
          { "code": "HRK", "name": "Croatia Kuna" },
          { "code": "HTG", "name": "Haiti Gourde" },
          { "code": "HUF", "name": "Hungary Forint" },
          { "code": "IDR", "name": "Indonesia Rupiah" },
          { "code": "ILS", "name": "Israel Shekel" },
          { "code": "IMP", "name": "Isle of Man Pound" },
          { "code": "INR", "name": "India Rupee" },
          { "code": "IQD", "name": "Iraq Dinar" },
          { "code": "IRR", "name": "Iran Rial" },
          { "code": "ISK", "name": "Iceland Krona" },
          { "code": "JEP", "name": "Jersey Pound" },
          { "code": "JMD", "name": "Jamaica Dollar" },
          { "code": "JOD", "name": "Jordan Dinar" },
          { "code": "JPY", "name": "Japan Yen" },
          { "code": "KES", "name": "Kenya Shilling" },
          { "code": "KGS", "name": "Kyrgyzstan Som" },
          { "code": "KHR", "name": "Cambodia Riel" },
          { "code": "KMF", "name": "Comoros Franc" },
          { "code": "KPW", "name": "Korea (North) Won" },
          { "code": "KRW", "name": "Korea (South) Won" },
          { "code": "KWD", "name": "Kuwait Dinar" },
          { "code": "KYD", "name": "Cayman Islands Dollar" },
          { "code": "KZT", "name": "Kazakhstan Tenge" },
          { "code": "LAK", "name": "Laos Kip" },
          { "code": "LBP", "name": "Lebanon Pound" },
          { "code": "LKR", "name": "Sri Lanka Rupee" },
          { "code": "LRD", "name": "Liberia Dollar" },
          { "code": "LSL", "name": "Lesotho Loti" },
          { "code": "LTL", "name": "Lithuania Litas" },
          { "code": "LYD", "name": "Libya Dinar" },
          { "code": "MAD", "name": "Morocco Dirham" },
          { "code": "MDL", "name": "Moldova Leu" },
          { "code": "MGA", "name": "Madagascar Ariary" },
          { "code": "MKD", "name": "Macedonia Denar" },
          { "code": "MMK", "name": "Myanmar (Burma) Kyat" },
          { "code": "MNT", "name": "Mongolia Tughrik" },
          { "code": "MOP", "name": "Macau Pataca" },
          { "code": "MRO", "name": "Mauritania Ouguiya" },
          { "code": "MUR", "name": "Mauritius Rupee" },
          { "code": "MVR", "name": "Maldives (Maldive Islands) Rufiyaa" },
          { "code": "MWK", "name": "Malawi Kwacha" },
          { "code": "MXN", "name": "Mexico Peso" },
          { "code": "MYR", "name": "Malaysia Ringgit" },
          { "code": "MZN", "name": "Mozambique Metical" },
          { "code": "NAD", "name": "Namibia Dollar" },
          { "code": "NGN", "name": "Nigeria Naira" },
          { "code": "NIO", "name": "Nicaragua Cordoba" },
          { "code": "NOK", "name": "Norway Krone" },
          { "code": "NPR", "name": "Nepal Rupee" },
          { "code": "NZD", "name": "New Zealand Dollar" },
          { "code": "OMR", "name": "Oman Rial" },
          { "code": "PAB", "name": "Panama Balboa" },
          { "code": "PEN", "name": "Peru Nuevo Sol" },
          { "code": "PGK", "name": "Papua New Guinea Kina" },
          { "code": "PHP", "name": "Philippines Peso" },
          { "code": "PKR", "name": "Pakistan Rupee" },
          { "code": "PLN", "name": "Poland Zloty" },
          { "code": "PYG", "name": "Paraguay Guarani" },
          { "code": "QAR", "name": "Qatar Riyal" },
          { "code": "RON", "name": "Romania New Leu" },
          { "code": "RSD", "name": "Serbia Dinar" },
          { "code": "RUB", "name": "Russia Ruble" },
          { "code": "RWF", "name": "Rwanda Franc" },
          { "code": "SAR", "name": "Saudi Arabia Riyal" },
          { "code": "SBD", "name": "Solomon Islands Dollar" },
          { "code": "SCR", "name": "Seychelles Rupee" },
          { "code": "SDG", "name": "Sudan Pound" },
          { "code": "SEK", "name": "Sweden Krona" },
          { "code": "SGD", "name": "Singapore Dollar" },
          { "code": "SHP", "name": "Saint Helena Pound" },
          { "code": "SLL", "name": "Sierra Leone Leone" },
          { "code": "SOS", "name": "Somalia Shilling" },
          { "code": "SPL", "name": "Seborga Luigino" },
          { "code": "SRD", "name": "Suriname Dollar" },
          { "code": "STD", "name": "S\xE3o Tom\xE9 and Pr\xEDncipe Dobra" },
          { "code": "SVC", "name": "El Salvador Colon" },
          { "code": "SYP", "name": "Syria Pound" },
          { "code": "SZL", "name": "Swaziland Lilangeni" },
          { "code": "THB", "name": "Thailand Baht" },
          { "code": "TJS", "name": "Tajikistan Somoni" },
          { "code": "TMT", "name": "Turkmenistan Manat" },
          { "code": "TND", "name": "Tunisia Dinar" },
          { "code": "TOP", "name": "Tonga Pa'anga" },
          { "code": "TRY", "name": "Turkey Lira" },
          { "code": "TTD", "name": "Trinidad and Tobago Dollar" },
          { "code": "TVD", "name": "Tuvalu Dollar" },
          { "code": "TWD", "name": "Taiwan New Dollar" },
          { "code": "TZS", "name": "Tanzania Shilling" },
          { "code": "UAH", "name": "Ukraine Hryvnia" },
          { "code": "UGX", "name": "Uganda Shilling" },
          { "code": "USD", "name": "United States Dollar" },
          { "code": "UYU", "name": "Uruguay Peso" },
          { "code": "UZS", "name": "Uzbekistan Som" },
          { "code": "VEF", "name": "Venezuela Bolivar" },
          { "code": "VND", "name": "Viet Nam Dong" },
          { "code": "VUV", "name": "Vanuatu Vatu" },
          { "code": "WST", "name": "Samoa Tala" },
          { "code": "XAF", "name": "Communaut\xE9 Financi\xE8re Africaine (BEAC) CFA Franc BEAC" },
          { "code": "XCD", "name": "East Caribbean Dollar" },
          { "code": "XDR", "name": "International Monetary Fund (IMF) Special Drawing Rights" },
          { "code": "XOF", "name": "Communaut\xE9 Financi\xE8re Africaine (BCEAO) Franc" },
          { "code": "XPF", "name": "Comptoirs Fran\xE7ais du Pacifique (CFP) Franc" },
          { "code": "YER", "name": "Yemen Rial" },
          { "code": "ZAR", "name": "South Africa Rand" },
          { "code": "ZMW", "name": "Zambia Kwacha" },
          { "code": "ZWD", "name": "Zimbabwe Dollar" }
        ],
        colorNames: [
          "AliceBlue",
          "Black",
          "Navy",
          "DarkBlue",
          "MediumBlue",
          "Blue",
          "DarkGreen",
          "Green",
          "Teal",
          "DarkCyan",
          "DeepSkyBlue",
          "DarkTurquoise",
          "MediumSpringGreen",
          "Lime",
          "SpringGreen",
          "Aqua",
          "Cyan",
          "MidnightBlue",
          "DodgerBlue",
          "LightSeaGreen",
          "ForestGreen",
          "SeaGreen",
          "DarkSlateGray",
          "LimeGreen",
          "MediumSeaGreen",
          "Turquoise",
          "RoyalBlue",
          "SteelBlue",
          "DarkSlateBlue",
          "MediumTurquoise",
          "Indigo",
          "DarkOliveGreen",
          "CadetBlue",
          "CornflowerBlue",
          "RebeccaPurple",
          "MediumAquaMarine",
          "DimGray",
          "SlateBlue",
          "OliveDrab",
          "SlateGray",
          "LightSlateGray",
          "MediumSlateBlue",
          "LawnGreen",
          "Chartreuse",
          "Aquamarine",
          "Maroon",
          "Purple",
          "Olive",
          "Gray",
          "SkyBlue",
          "LightSkyBlue",
          "BlueViolet",
          "DarkRed",
          "DarkMagenta",
          "SaddleBrown",
          "Ivory",
          "White",
          "DarkSeaGreen",
          "LightGreen",
          "MediumPurple",
          "DarkViolet",
          "PaleGreen",
          "DarkOrchid",
          "YellowGreen",
          "Sienna",
          "Brown",
          "DarkGray",
          "LightBlue",
          "GreenYellow",
          "PaleTurquoise",
          "LightSteelBlue",
          "PowderBlue",
          "FireBrick",
          "DarkGoldenRod",
          "MediumOrchid",
          "RosyBrown",
          "DarkKhaki",
          "Silver",
          "MediumVioletRed",
          "IndianRed",
          "Peru",
          "Chocolate",
          "Tan",
          "LightGray",
          "Thistle",
          "Orchid",
          "GoldenRod",
          "PaleVioletRed",
          "Crimson",
          "Gainsboro",
          "Plum",
          "BurlyWood",
          "LightCyan",
          "Lavender",
          "DarkSalmon",
          "Violet",
          "PaleGoldenRod",
          "LightCoral",
          "Khaki",
          "AliceBlue",
          "HoneyDew",
          "Azure",
          "SandyBrown",
          "Wheat",
          "Beige",
          "WhiteSmoke",
          "MintCream",
          "GhostWhite",
          "Salmon",
          "AntiqueWhite",
          "Linen",
          "LightGoldenRodYellow",
          "OldLace",
          "Red",
          "Fuchsia",
          "Magenta",
          "DeepPink",
          "OrangeRed",
          "Tomato",
          "HotPink",
          "Coral",
          "DarkOrange",
          "LightSalmon",
          "Orange",
          "LightPink",
          "Pink",
          "Gold",
          "PeachPuff",
          "NavajoWhite",
          "Moccasin",
          "Bisque",
          "MistyRose",
          "BlanchedAlmond",
          "PapayaWhip",
          "LavenderBlush",
          "SeaShell",
          "Cornsilk",
          "LemonChiffon",
          "FloralWhite",
          "Snow",
          "Yellow",
          "LightYellow"
        ],
        company: [
          "3Com Corp",
          "3M Company",
          "A.G. Edwards Inc.",
          "Abbott Laboratories",
          "Abercrombie & Fitch Co.",
          "ABM Industries Incorporated",
          "Ace Hardware Corporation",
          "ACT Manufacturing Inc.",
          "Acterna Corp.",
          "Adams Resources & Energy, Inc.",
          "ADC Telecommunications, Inc.",
          "Adelphia Communications Corporation",
          "Administaff, Inc.",
          "Adobe Systems Incorporated",
          "Adolph Coors Company",
          "Advance Auto Parts, Inc.",
          "Advanced Micro Devices, Inc.",
          "AdvancePCS, Inc.",
          "Advantica Restaurant Group, Inc.",
          "The AES Corporation",
          "Aetna Inc.",
          "Affiliated Computer Services, Inc.",
          "AFLAC Incorporated",
          "AGCO Corporation",
          "Agilent Technologies, Inc.",
          "Agway Inc.",
          "Apartment Investment and Management Company",
          "Air Products and Chemicals, Inc.",
          "Airborne, Inc.",
          "Airgas, Inc.",
          "AK Steel Holding Corporation",
          "Alaska Air Group, Inc.",
          "Alberto-Culver Company",
          "Albertson's, Inc.",
          "Alcoa Inc.",
          "Alleghany Corporation",
          "Allegheny Energy, Inc.",
          "Allegheny Technologies Incorporated",
          "Allergan, Inc.",
          "ALLETE, Inc.",
          "Alliant Energy Corporation",
          "Allied Waste Industries, Inc.",
          "Allmerica Financial Corporation",
          "The Allstate Corporation",
          "ALLTEL Corporation",
          "The Alpine Group, Inc.",
          "Amazon.com, Inc.",
          "AMC Entertainment Inc.",
          "American Power Conversion Corporation",
          "Amerada Hess Corporation",
          "AMERCO",
          "Ameren Corporation",
          "America West Holdings Corporation",
          "American Axle & Manufacturing Holdings, Inc.",
          "American Eagle Outfitters, Inc.",
          "American Electric Power Company, Inc.",
          "American Express Company",
          "American Financial Group, Inc.",
          "American Greetings Corporation",
          "American International Group, Inc.",
          "American Standard Companies Inc.",
          "American Water Works Company, Inc.",
          "AmerisourceBergen Corporation",
          "Ames Department Stores, Inc.",
          "Amgen Inc.",
          "Amkor Technology, Inc.",
          "AMR Corporation",
          "AmSouth Bancorp.",
          "Amtran, Inc.",
          "Anadarko Petroleum Corporation",
          "Analog Devices, Inc.",
          "Anheuser-Busch Companies, Inc.",
          "Anixter International Inc.",
          "AnnTaylor Inc.",
          "Anthem, Inc.",
          "AOL Time Warner Inc.",
          "Aon Corporation",
          "Apache Corporation",
          "Apple Computer, Inc.",
          "Applera Corporation",
          "Applied Industrial Technologies, Inc.",
          "Applied Materials, Inc.",
          "Aquila, Inc.",
          "ARAMARK Corporation",
          "Arch Coal, Inc.",
          "Archer Daniels Midland Company",
          "Arkansas Best Corporation",
          "Armstrong Holdings, Inc.",
          "Arrow Electronics, Inc.",
          "ArvinMeritor, Inc.",
          "Ashland Inc.",
          "Astoria Financial Corporation",
          "AT&T Corp.",
          "Atmel Corporation",
          "Atmos Energy Corporation",
          "Audiovox Corporation",
          "Autoliv, Inc.",
          "Automatic Data Processing, Inc.",
          "AutoNation, Inc.",
          "AutoZone, Inc.",
          "Avaya Inc.",
          "Avery Dennison Corporation",
          "Avista Corporation",
          "Avnet, Inc.",
          "Avon Products, Inc.",
          "Baker Hughes Incorporated",
          "Ball Corporation",
          "Bank of America Corporation",
          "The Bank of New York Company, Inc.",
          "Bank One Corporation",
          "Banknorth Group, Inc.",
          "Banta Corporation",
          "Barnes & Noble, Inc.",
          "Bausch & Lomb Incorporated",
          "Baxter International Inc.",
          "BB&T Corporation",
          "The Bear Stearns Companies Inc.",
          "Beazer Homes USA, Inc.",
          "Beckman Coulter, Inc.",
          "Becton, Dickinson and Company",
          "Bed Bath & Beyond Inc.",
          "Belk, Inc.",
          "Bell Microproducts Inc.",
          "BellSouth Corporation",
          "Belo Corp.",
          "Bemis Company, Inc.",
          "Benchmark Electronics, Inc.",
          "Berkshire Hathaway Inc.",
          "Best Buy Co., Inc.",
          "Bethlehem Steel Corporation",
          "Beverly Enterprises, Inc.",
          "Big Lots, Inc.",
          "BJ Services Company",
          "BJ's Wholesale Club, Inc.",
          "The Black & Decker Corporation",
          "Black Hills Corporation",
          "BMC Software, Inc.",
          "The Boeing Company",
          "Boise Cascade Corporation",
          "Borders Group, Inc.",
          "BorgWarner Inc.",
          "Boston Scientific Corporation",
          "Bowater Incorporated",
          "Briggs & Stratton Corporation",
          "Brightpoint, Inc.",
          "Brinker International, Inc.",
          "Bristol-Myers Squibb Company",
          "Broadwing, Inc.",
          "Brown Shoe Company, Inc.",
          "Brown-Forman Corporation",
          "Brunswick Corporation",
          "Budget Group, Inc.",
          "Burlington Coat Factory Warehouse Corporation",
          "Burlington Industries, Inc.",
          "Burlington Northern Santa Fe Corporation",
          "Burlington Resources Inc.",
          "C. H. Robinson Worldwide Inc.",
          "Cablevision Systems Corp",
          "Cabot Corp",
          "Cadence Design Systems, Inc.",
          "Calpine Corp.",
          "Campbell Soup Co.",
          "Capital One Financial Corp.",
          "Cardinal Health Inc.",
          "Caremark Rx Inc.",
          "Carlisle Cos. Inc.",
          "Carpenter Technology Corp.",
          "Casey's General Stores Inc.",
          "Caterpillar Inc.",
          "CBRL Group Inc.",
          "CDI Corp.",
          "CDW Computer Centers Inc.",
          "CellStar Corp.",
          "Cendant Corp",
          "Cenex Harvest States Cooperatives",
          "Centex Corp.",
          "CenturyTel Inc.",
          "Ceridian Corp.",
          "CH2M Hill Cos. Ltd.",
          "Champion Enterprises Inc.",
          "Charles Schwab Corp.",
          "Charming Shoppes Inc.",
          "Charter Communications Inc.",
          "Charter One Financial Inc.",
          "ChevronTexaco Corp.",
          "Chiquita Brands International Inc.",
          "Chubb Corp",
          "Ciena Corp.",
          "Cigna Corp",
          "Cincinnati Financial Corp.",
          "Cinergy Corp.",
          "Cintas Corp.",
          "Circuit City Stores Inc.",
          "Cisco Systems Inc.",
          "Citigroup, Inc",
          "Citizens Communications Co.",
          "CKE Restaurants Inc.",
          "Clear Channel Communications Inc.",
          "The Clorox Co.",
          "CMGI Inc.",
          "CMS Energy Corp.",
          "CNF Inc.",
          "Coca-Cola Co.",
          "Coca-Cola Enterprises Inc.",
          "Colgate-Palmolive Co.",
          "Collins & Aikman Corp.",
          "Comcast Corp.",
          "Comdisco Inc.",
          "Comerica Inc.",
          "Comfort Systems USA Inc.",
          "Commercial Metals Co.",
          "Community Health Systems Inc.",
          "Compass Bancshares Inc",
          "Computer Associates International Inc.",
          "Computer Sciences Corp.",
          "Compuware Corp.",
          "Comverse Technology Inc.",
          "ConAgra Foods Inc.",
          "Concord EFS Inc.",
          "Conectiv, Inc",
          "Conoco Inc",
          "Conseco Inc.",
          "Consolidated Freightways Corp.",
          "Consolidated Edison Inc.",
          "Constellation Brands Inc.",
          "Constellation Emergy Group Inc.",
          "Continental Airlines Inc.",
          "Convergys Corp.",
          "Cooper Cameron Corp.",
          "Cooper Industries Ltd.",
          "Cooper Tire & Rubber Co.",
          "Corn Products International Inc.",
          "Corning Inc.",
          "Costco Wholesale Corp.",
          "Countrywide Credit Industries Inc.",
          "Coventry Health Care Inc.",
          "Cox Communications Inc.",
          "Crane Co.",
          "Crompton Corp.",
          "Crown Cork & Seal Co. Inc.",
          "CSK Auto Corp.",
          "CSX Corp.",
          "Cummins Inc.",
          "CVS Corp.",
          "Cytec Industries Inc.",
          "D&K Healthcare Resources, Inc.",
          "D.R. Horton Inc.",
          "Dana Corporation",
          "Danaher Corporation",
          "Darden Restaurants Inc.",
          "DaVita Inc.",
          "Dean Foods Company",
          "Deere & Company",
          "Del Monte Foods Co",
          "Dell Computer Corporation",
          "Delphi Corp.",
          "Delta Air Lines Inc.",
          "Deluxe Corporation",
          "Devon Energy Corporation",
          "Di Giorgio Corporation",
          "Dial Corporation",
          "Diebold Incorporated",
          "Dillard's Inc.",
          "DIMON Incorporated",
          "Dole Food Company, Inc.",
          "Dollar General Corporation",
          "Dollar Tree Stores, Inc.",
          "Dominion Resources, Inc.",
          "Domino's Pizza LLC",
          "Dover Corporation, Inc.",
          "Dow Chemical Company",
          "Dow Jones & Company, Inc.",
          "DPL Inc.",
          "DQE Inc.",
          "Dreyer's Grand Ice Cream, Inc.",
          "DST Systems, Inc.",
          "DTE Energy Co.",
          "E.I. Du Pont de Nemours and Company",
          "Duke Energy Corp",
          "Dun & Bradstreet Inc.",
          "DURA Automotive Systems Inc.",
          "DynCorp",
          "Dynegy Inc.",
          "E*Trade Group, Inc.",
          "E.W. Scripps Company",
          "Earthlink, Inc.",
          "Eastman Chemical Company",
          "Eastman Kodak Company",
          "Eaton Corporation",
          "Echostar Communications Corporation",
          "Ecolab Inc.",
          "Edison International",
          "EGL Inc.",
          "El Paso Corporation",
          "Electronic Arts Inc.",
          "Electronic Data Systems Corp.",
          "Eli Lilly and Company",
          "EMC Corporation",
          "Emcor Group Inc.",
          "Emerson Electric Co.",
          "Encompass Services Corporation",
          "Energizer Holdings Inc.",
          "Energy East Corporation",
          "Engelhard Corporation",
          "Enron Corp.",
          "Entergy Corporation",
          "Enterprise Products Partners L.P.",
          "EOG Resources, Inc.",
          "Equifax Inc.",
          "Equitable Resources Inc.",
          "Equity Office Properties Trust",
          "Equity Residential Properties Trust",
          "Estee Lauder Companies Inc.",
          "Exelon Corporation",
          "Exide Technologies",
          "Expeditors International of Washington Inc.",
          "Express Scripts Inc.",
          "ExxonMobil Corporation",
          "Fairchild Semiconductor International Inc.",
          "Family Dollar Stores Inc.",
          "Farmland Industries Inc.",
          "Federal Mogul Corp.",
          "Federated Department Stores Inc.",
          "Federal Express Corp.",
          "Felcor Lodging Trust Inc.",
          "Ferro Corp.",
          "Fidelity National Financial Inc.",
          "Fifth Third Bancorp",
          "First American Financial Corp.",
          "First Data Corp.",
          "First National of Nebraska Inc.",
          "First Tennessee National Corp.",
          "FirstEnergy Corp.",
          "Fiserv Inc.",
          "Fisher Scientific International Inc.",
          "FleetBoston Financial Co.",
          "Fleetwood Enterprises Inc.",
          "Fleming Companies Inc.",
          "Flowers Foods Inc.",
          "Flowserv Corp",
          "Fluor Corp",
          "FMC Corp",
          "Foamex International Inc",
          "Foot Locker Inc",
          "Footstar Inc.",
          "Ford Motor Co",
          "Forest Laboratories Inc.",
          "Fortune Brands Inc.",
          "Foster Wheeler Ltd.",
          "FPL Group Inc.",
          "Franklin Resources Inc.",
          "Freeport McMoran Copper & Gold Inc.",
          "Frontier Oil Corp",
          "Furniture Brands International Inc.",
          "Gannett Co., Inc.",
          "Gap Inc.",
          "Gateway Inc.",
          "GATX Corporation",
          "Gemstar-TV Guide International Inc.",
          "GenCorp Inc.",
          "General Cable Corporation",
          "General Dynamics Corporation",
          "General Electric Company",
          "General Mills Inc",
          "General Motors Corporation",
          "Genesis Health Ventures Inc.",
          "Gentek Inc.",
          "Gentiva Health Services Inc.",
          "Genuine Parts Company",
          "Genuity Inc.",
          "Genzyme Corporation",
          "Georgia Gulf Corporation",
          "Georgia-Pacific Corporation",
          "Gillette Company",
          "Gold Kist Inc.",
          "Golden State Bancorp Inc.",
          "Golden West Financial Corporation",
          "Goldman Sachs Group Inc.",
          "Goodrich Corporation",
          "The Goodyear Tire & Rubber Company",
          "Granite Construction Incorporated",
          "Graybar Electric Company Inc.",
          "Great Lakes Chemical Corporation",
          "Great Plains Energy Inc.",
          "GreenPoint Financial Corp.",
          "Greif Bros. Corporation",
          "Grey Global Group Inc.",
          "Group 1 Automotive Inc.",
          "Guidant Corporation",
          "H&R Block Inc.",
          "H.B. Fuller Company",
          "H.J. Heinz Company",
          "Halliburton Co.",
          "Harley-Davidson Inc.",
          "Harman International Industries Inc.",
          "Harrah's Entertainment Inc.",
          "Harris Corp.",
          "Harsco Corp.",
          "Hartford Financial Services Group Inc.",
          "Hasbro Inc.",
          "Hawaiian Electric Industries Inc.",
          "HCA Inc.",
          "Health Management Associates Inc.",
          "Health Net Inc.",
          "Healthsouth Corp",
          "Henry Schein Inc.",
          "Hercules Inc.",
          "Herman Miller Inc.",
          "Hershey Foods Corp.",
          "Hewlett-Packard Company",
          "Hibernia Corp.",
          "Hillenbrand Industries Inc.",
          "Hilton Hotels Corp.",
          "Hollywood Entertainment Corp.",
          "Home Depot Inc.",
          "Hon Industries Inc.",
          "Honeywell International Inc.",
          "Hormel Foods Corp.",
          "Host Marriott Corp.",
          "Household International Corp.",
          "Hovnanian Enterprises Inc.",
          "Hub Group Inc.",
          "Hubbell Inc.",
          "Hughes Supply Inc.",
          "Humana Inc.",
          "Huntington Bancshares Inc.",
          "Idacorp Inc.",
          "IDT Corporation",
          "IKON Office Solutions Inc.",
          "Illinois Tool Works Inc.",
          "IMC Global Inc.",
          "Imperial Sugar Company",
          "IMS Health Inc.",
          "Ingles Market Inc",
          "Ingram Micro Inc.",
          "Insight Enterprises Inc.",
          "Integrated Electrical Services Inc.",
          "Intel Corporation",
          "International Paper Co.",
          "Interpublic Group of Companies Inc.",
          "Interstate Bakeries Corporation",
          "International Business Machines Corp.",
          "International Flavors & Fragrances Inc.",
          "International Multifoods Corporation",
          "Intuit Inc.",
          "IT Group Inc.",
          "ITT Industries Inc.",
          "Ivax Corp.",
          "J.B. Hunt Transport Services Inc.",
          "J.C. Penny Co.",
          "J.P. Morgan Chase & Co.",
          "Jabil Circuit Inc.",
          "Jack In The Box Inc.",
          "Jacobs Engineering Group Inc.",
          "JDS Uniphase Corp.",
          "Jefferson-Pilot Co.",
          "John Hancock Financial Services Inc.",
          "Johnson & Johnson",
          "Johnson Controls Inc.",
          "Jones Apparel Group Inc.",
          "KB Home",
          "Kellogg Company",
          "Kellwood Company",
          "Kelly Services Inc.",
          "Kemet Corp.",
          "Kennametal Inc.",
          "Kerr-McGee Corporation",
          "KeyCorp",
          "KeySpan Corp.",
          "Kimball International Inc.",
          "Kimberly-Clark Corporation",
          "Kindred Healthcare Inc.",
          "KLA-Tencor Corporation",
          "K-Mart Corp.",
          "Knight-Ridder Inc.",
          "Kohl's Corp.",
          "KPMG Consulting Inc.",
          "Kroger Co.",
          "L-3 Communications Holdings Inc.",
          "Laboratory Corporation of America Holdings",
          "Lam Research Corporation",
          "LandAmerica Financial Group Inc.",
          "Lands' End Inc.",
          "Landstar System Inc.",
          "La-Z-Boy Inc.",
          "Lear Corporation",
          "Legg Mason Inc.",
          "Leggett & Platt Inc.",
          "Lehman Brothers Holdings Inc.",
          "Lennar Corporation",
          "Lennox International Inc.",
          "Level 3 Communications Inc.",
          "Levi Strauss & Co.",
          "Lexmark International Inc.",
          "Limited Inc.",
          "Lincoln National Corporation",
          "Linens 'n Things Inc.",
          "Lithia Motors Inc.",
          "Liz Claiborne Inc.",
          "Lockheed Martin Corporation",
          "Loews Corporation",
          "Longs Drug Stores Corporation",
          "Louisiana-Pacific Corporation",
          "Lowe's Companies Inc.",
          "LSI Logic Corporation",
          "The LTV Corporation",
          "The Lubrizol Corporation",
          "Lucent Technologies Inc.",
          "Lyondell Chemical Company",
          "M & T Bank Corporation",
          "Magellan Health Services Inc.",
          "Mail-Well Inc.",
          "Mandalay Resort Group",
          "Manor Care Inc.",
          "Manpower Inc.",
          "Marathon Oil Corporation",
          "Mariner Health Care Inc.",
          "Markel Corporation",
          "Marriott International Inc.",
          "Marsh & McLennan Companies Inc.",
          "Marsh Supermarkets Inc.",
          "Marshall & Ilsley Corporation",
          "Martin Marietta Materials Inc.",
          "Masco Corporation",
          "Massey Energy Company",
          "MasTec Inc.",
          "Mattel Inc.",
          "Maxim Integrated Products Inc.",
          "Maxtor Corporation",
          "Maxxam Inc.",
          "The May Department Stores Company",
          "Maytag Corporation",
          "MBNA Corporation",
          "McCormick & Company Incorporated",
          "McDonald's Corporation",
          "The McGraw-Hill Companies Inc.",
          "McKesson Corporation",
          "McLeodUSA Incorporated",
          "M.D.C. Holdings Inc.",
          "MDU Resources Group Inc.",
          "MeadWestvaco Corporation",
          "Medtronic Inc.",
          "Mellon Financial Corporation",
          "The Men's Wearhouse Inc.",
          "Merck & Co., Inc.",
          "Mercury General Corporation",
          "Merrill Lynch & Co. Inc.",
          "Metaldyne Corporation",
          "Metals USA Inc.",
          "MetLife Inc.",
          "Metris Companies Inc",
          "MGIC Investment Corporation",
          "MGM Mirage",
          "Michaels Stores Inc.",
          "Micron Technology Inc.",
          "Microsoft Corporation",
          "Milacron Inc.",
          "Millennium Chemicals Inc.",
          "Mirant Corporation",
          "Mohawk Industries Inc.",
          "Molex Incorporated",
          "The MONY Group Inc.",
          "Morgan Stanley Dean Witter & Co.",
          "Motorola Inc.",
          "MPS Group Inc.",
          "Murphy Oil Corporation",
          "Nabors Industries Inc",
          "Nacco Industries Inc",
          "Nash Finch Company",
          "National City Corp.",
          "National Commerce Financial Corporation",
          "National Fuel Gas Company",
          "National Oilwell Inc",
          "National Rural Utilities Cooperative Finance Corporation",
          "National Semiconductor Corporation",
          "National Service Industries Inc",
          "Navistar International Corporation",
          "NCR Corporation",
          "The Neiman Marcus Group Inc.",
          "New Jersey Resources Corporation",
          "New York Times Company",
          "Newell Rubbermaid Inc",
          "Newmont Mining Corporation",
          "Nextel Communications Inc",
          "Nicor Inc",
          "Nike Inc",
          "NiSource Inc",
          "Noble Energy Inc",
          "Nordstrom Inc",
          "Norfolk Southern Corporation",
          "Nortek Inc",
          "North Fork Bancorporation Inc",
          "Northeast Utilities System",
          "Northern Trust Corporation",
          "Northrop Grumman Corporation",
          "NorthWestern Corporation",
          "Novellus Systems Inc",
          "NSTAR",
          "NTL Incorporated",
          "Nucor Corp",
          "Nvidia Corp",
          "NVR Inc",
          "Northwest Airlines Corp",
          "Occidental Petroleum Corp",
          "Ocean Energy Inc",
          "Office Depot Inc.",
          "OfficeMax Inc",
          "OGE Energy Corp",
          "Oglethorpe Power Corp.",
          "Ohio Casualty Corp.",
          "Old Republic International Corp.",
          "Olin Corp.",
          "OM Group Inc",
          "Omnicare Inc",
          "Omnicom Group",
          "On Semiconductor Corp",
          "ONEOK Inc",
          "Oracle Corp",
          "Oshkosh Truck Corp",
          "Outback Steakhouse Inc.",
          "Owens & Minor Inc.",
          "Owens Corning",
          "Owens-Illinois Inc",
          "Oxford Health Plans Inc",
          "Paccar Inc",
          "PacifiCare Health Systems Inc",
          "Packaging Corp. of America",
          "Pactiv Corp",
          "Pall Corp",
          "Pantry Inc",
          "Park Place Entertainment Corp",
          "Parker Hannifin Corp.",
          "Pathmark Stores Inc.",
          "Paychex Inc",
          "Payless Shoesource Inc",
          "Penn Traffic Co.",
          "Pennzoil-Quaker State Company",
          "Pentair Inc",
          "Peoples Energy Corp.",
          "PeopleSoft Inc",
          "Pep Boys Manny, Moe & Jack",
          "Potomac Electric Power Co.",
          "Pepsi Bottling Group Inc.",
          "PepsiAmericas Inc.",
          "PepsiCo Inc.",
          "Performance Food Group Co.",
          "Perini Corp",
          "PerkinElmer Inc",
          "Perot Systems Corp",
          "Petco Animal Supplies Inc.",
          "Peter Kiewit Sons', Inc.",
          "PETsMART Inc",
          "Pfizer Inc",
          "Pacific Gas & Electric Corp.",
          "Pharmacia Corp",
          "Phar Mor Inc.",
          "Phelps Dodge Corp.",
          "Philip Morris Companies Inc.",
          "Phillips Petroleum Co",
          "Phillips Van Heusen Corp.",
          "Phoenix Companies Inc",
          "Pier 1 Imports Inc.",
          "Pilgrim's Pride Corporation",
          "Pinnacle West Capital Corp",
          "Pioneer-Standard Electronics Inc.",
          "Pitney Bowes Inc.",
          "Pittston Brinks Group",
          "Plains All American Pipeline LP",
          "PNC Financial Services Group Inc.",
          "PNM Resources Inc",
          "Polaris Industries Inc.",
          "Polo Ralph Lauren Corp",
          "PolyOne Corp",
          "Popular Inc",
          "Potlatch Corp",
          "PPG Industries Inc",
          "PPL Corp",
          "Praxair Inc",
          "Precision Castparts Corp",
          "Premcor Inc.",
          "Pride International Inc",
          "Primedia Inc",
          "Principal Financial Group Inc.",
          "Procter & Gamble Co.",
          "Pro-Fac Cooperative Inc.",
          "Progress Energy Inc",
          "Progressive Corporation",
          "Protective Life Corp",
          "Provident Financial Group",
          "Providian Financial Corp.",
          "Prudential Financial Inc.",
          "PSS World Medical Inc",
          "Public Service Enterprise Group Inc.",
          "Publix Super Markets Inc.",
          "Puget Energy Inc.",
          "Pulte Homes Inc",
          "Qualcomm Inc",
          "Quanta Services Inc.",
          "Quantum Corp",
          "Quest Diagnostics Inc.",
          "Questar Corp",
          "Quintiles Transnational",
          "Qwest Communications Intl Inc",
          "R.J. Reynolds Tobacco Company",
          "R.R. Donnelley & Sons Company",
          "Radio Shack Corporation",
          "Raymond James Financial Inc.",
          "Raytheon Company",
          "Reader's Digest Association Inc.",
          "Reebok International Ltd.",
          "Regions Financial Corp.",
          "Regis Corporation",
          "Reliance Steel & Aluminum Co.",
          "Reliant Energy Inc.",
          "Rent A Center Inc",
          "Republic Services Inc",
          "Revlon Inc",
          "RGS Energy Group Inc",
          "Rite Aid Corp",
          "Riverwood Holding Inc.",
          "RoadwayCorp",
          "Robert Half International Inc.",
          "Rock-Tenn Co",
          "Rockwell Automation Inc",
          "Rockwell Collins Inc",
          "Rohm & Haas Co.",
          "Ross Stores Inc",
          "RPM Inc.",
          "Ruddick Corp",
          "Ryder System Inc",
          "Ryerson Tull Inc",
          "Ryland Group Inc.",
          "Sabre Holdings Corp",
          "Safeco Corp",
          "Safeguard Scientifics Inc.",
          "Safeway Inc",
          "Saks Inc",
          "Sanmina-SCI Inc",
          "Sara Lee Corp",
          "SBC Communications Inc",
          "Scana Corp.",
          "Schering-Plough Corp",
          "Scholastic Corp",
          "SCI Systems Onc.",
          "Science Applications Intl. Inc.",
          "Scientific-Atlanta Inc",
          "Scotts Company",
          "Seaboard Corp",
          "Sealed Air Corp",
          "Sears Roebuck & Co",
          "Sempra Energy",
          "Sequa Corp",
          "Service Corp. International",
          "ServiceMaster Co",
          "Shaw Group Inc",
          "Sherwin-Williams Company",
          "Shopko Stores Inc",
          "Siebel Systems Inc",
          "Sierra Health Services Inc",
          "Sierra Pacific Resources",
          "Silgan Holdings Inc.",
          "Silicon Graphics Inc",
          "Simon Property Group Inc",
          "SLM Corporation",
          "Smith International Inc",
          "Smithfield Foods Inc",
          "Smurfit-Stone Container Corp",
          "Snap-On Inc",
          "Solectron Corp",
          "Solutia Inc",
          "Sonic Automotive Inc.",
          "Sonoco Products Co.",
          "Southern Company",
          "Southern Union Company",
          "SouthTrust Corp.",
          "Southwest Airlines Co",
          "Southwest Gas Corp",
          "Sovereign Bancorp Inc.",
          "Spartan Stores Inc",
          "Spherion Corp",
          "Sports Authority Inc",
          "Sprint Corp.",
          "SPX Corp",
          "St. Jude Medical Inc",
          "St. Paul Cos.",
          "Staff Leasing Inc.",
          "StanCorp Financial Group Inc",
          "Standard Pacific Corp.",
          "Stanley Works",
          "Staples Inc",
          "Starbucks Corp",
          "Starwood Hotels & Resorts Worldwide Inc",
          "State Street Corp.",
          "Stater Bros. Holdings Inc.",
          "Steelcase Inc",
          "Stein Mart Inc",
          "Stewart & Stevenson Services Inc",
          "Stewart Information Services Corp",
          "Stilwell Financial Inc",
          "Storage Technology Corporation",
          "Stryker Corp",
          "Sun Healthcare Group Inc.",
          "Sun Microsystems Inc.",
          "SunGard Data Systems Inc.",
          "Sunoco Inc.",
          "SunTrust Banks Inc",
          "Supervalu Inc",
          "Swift Transportation, Co., Inc",
          "Symbol Technologies Inc",
          "Synovus Financial Corp.",
          "Sysco Corp",
          "Systemax Inc.",
          "Target Corp.",
          "Tech Data Corporation",
          "TECO Energy Inc",
          "Tecumseh Products Company",
          "Tektronix Inc",
          "Teleflex Incorporated",
          "Telephone & Data Systems Inc",
          "Tellabs Inc.",
          "Temple-Inland Inc",
          "Tenet Healthcare Corporation",
          "Tenneco Automotive Inc.",
          "Teradyne Inc",
          "Terex Corp",
          "Tesoro Petroleum Corp.",
          "Texas Industries Inc.",
          "Texas Instruments Incorporated",
          "Textron Inc",
          "Thermo Electron Corporation",
          "Thomas & Betts Corporation",
          "Tiffany & Co",
          "Timken Company",
          "TJX Companies Inc",
          "TMP Worldwide Inc",
          "Toll Brothers Inc",
          "Torchmark Corporation",
          "Toro Company",
          "Tower Automotive Inc.",
          "Toys 'R' Us Inc",
          "Trans World Entertainment Corp.",
          "TransMontaigne Inc",
          "Transocean Inc",
          "TravelCenters of America Inc.",
          "Triad Hospitals Inc",
          "Tribune Company",
          "Trigon Healthcare Inc.",
          "Trinity Industries Inc",
          "Trump Hotels & Casino Resorts Inc.",
          "TruServ Corporation",
          "TRW Inc",
          "TXU Corp",
          "Tyson Foods Inc",
          "U.S. Bancorp",
          "U.S. Industries Inc.",
          "UAL Corporation",
          "UGI Corporation",
          "Unified Western Grocers Inc",
          "Union Pacific Corporation",
          "Union Planters Corp",
          "Unisource Energy Corp",
          "Unisys Corporation",
          "United Auto Group Inc",
          "United Defense Industries Inc.",
          "United Parcel Service Inc",
          "United Rentals Inc",
          "United Stationers Inc",
          "United Technologies Corporation",
          "UnitedHealth Group Incorporated",
          "Unitrin Inc",
          "Universal Corporation",
          "Universal Forest Products Inc",
          "Universal Health Services Inc",
          "Unocal Corporation",
          "Unova Inc",
          "UnumProvident Corporation",
          "URS Corporation",
          "US Airways Group Inc",
          "US Oncology Inc",
          "USA Interactive",
          "USFreighways Corporation",
          "USG Corporation",
          "UST Inc",
          "Valero Energy Corporation",
          "Valspar Corporation",
          "Value City Department Stores Inc",
          "Varco International Inc",
          "Vectren Corporation",
          "Veritas Software Corporation",
          "Verizon Communications Inc",
          "VF Corporation",
          "Viacom Inc",
          "Viad Corp",
          "Viasystems Group Inc",
          "Vishay Intertechnology Inc",
          "Visteon Corporation",
          "Volt Information Sciences Inc",
          "Vulcan Materials Company",
          "W.R. Berkley Corporation",
          "W.R. Grace & Co",
          "W.W. Grainger Inc",
          "Wachovia Corporation",
          "Wakenhut Corporation",
          "Walgreen Co",
          "Wallace Computer Services Inc",
          "Wal-Mart Stores Inc",
          "Walt Disney Co",
          "Walter Industries Inc",
          "Washington Mutual Inc",
          "Washington Post Co.",
          "Waste Management Inc",
          "Watsco Inc",
          "Weatherford International Inc",
          "Weis Markets Inc.",
          "Wellpoint Health Networks Inc",
          "Wells Fargo & Company",
          "Wendy's International Inc",
          "Werner Enterprises Inc",
          "WESCO International Inc",
          "Western Digital Inc",
          "Western Gas Resources Inc",
          "WestPoint Stevens Inc",
          "Weyerhauser Company",
          "WGL Holdings Inc",
          "Whirlpool Corporation",
          "Whole Foods Market Inc",
          "Willamette Industries Inc.",
          "Williams Companies Inc",
          "Williams Sonoma Inc",
          "Winn Dixie Stores Inc",
          "Wisconsin Energy Corporation",
          "Wm Wrigley Jr Company",
          "World Fuel Services Corporation",
          "WorldCom Inc",
          "Worthington Industries Inc",
          "WPS Resources Corporation",
          "Wyeth",
          "Wyndham International Inc",
          "Xcel Energy Inc",
          "Xerox Corp",
          "Xilinx Inc",
          "XO Communications Inc",
          "Yellow Corporation",
          "York International Corp",
          "Yum Brands Inc.",
          "Zale Corporation",
          "Zions Bancorporation"
        ],
        fileExtension: {
          "raster": ["bmp", "gif", "gpl", "ico", "jpeg", "psd", "png", "psp", "raw", "tiff"],
          "vector": ["3dv", "amf", "awg", "ai", "cgm", "cdr", "cmx", "dxf", "e2d", "egt", "eps", "fs", "odg", "svg", "xar"],
          "3d": ["3dmf", "3dm", "3mf", "3ds", "an8", "aoi", "blend", "cal3d", "cob", "ctm", "iob", "jas", "max", "mb", "mdx", "obj", "x", "x3d"],
          "document": ["doc", "docx", "dot", "html", "xml", "odt", "odm", "ott", "csv", "rtf", "tex", "xhtml", "xps"]
        },
        timezones: [
          {
            "name": "Dateline Standard Time",
            "abbr": "DST",
            "offset": -12,
            "isdst": false,
            "text": "(UTC-12:00) International Date Line West",
            "utc": [
              "Etc/GMT+12"
            ]
          },
          {
            "name": "UTC-11",
            "abbr": "U",
            "offset": -11,
            "isdst": false,
            "text": "(UTC-11:00) Coordinated Universal Time-11",
            "utc": [
              "Etc/GMT+11",
              "Pacific/Midway",
              "Pacific/Niue",
              "Pacific/Pago_Pago"
            ]
          },
          {
            "name": "Hawaiian Standard Time",
            "abbr": "HST",
            "offset": -10,
            "isdst": false,
            "text": "(UTC-10:00) Hawaii",
            "utc": [
              "Etc/GMT+10",
              "Pacific/Honolulu",
              "Pacific/Johnston",
              "Pacific/Rarotonga",
              "Pacific/Tahiti"
            ]
          },
          {
            "name": "Alaskan Standard Time",
            "abbr": "AKDT",
            "offset": -8,
            "isdst": true,
            "text": "(UTC-09:00) Alaska",
            "utc": [
              "America/Anchorage",
              "America/Juneau",
              "America/Nome",
              "America/Sitka",
              "America/Yakutat"
            ]
          },
          {
            "name": "Pacific Standard Time (Mexico)",
            "abbr": "PDT",
            "offset": -7,
            "isdst": true,
            "text": "(UTC-08:00) Baja California",
            "utc": [
              "America/Santa_Isabel"
            ]
          },
          {
            "name": "Pacific Daylight Time",
            "abbr": "PDT",
            "offset": -7,
            "isdst": true,
            "text": "(UTC-07:00) Pacific Time (US & Canada)",
            "utc": [
              "America/Dawson",
              "America/Los_Angeles",
              "America/Tijuana",
              "America/Vancouver",
              "America/Whitehorse"
            ]
          },
          {
            "name": "Pacific Standard Time",
            "abbr": "PST",
            "offset": -8,
            "isdst": false,
            "text": "(UTC-08:00) Pacific Time (US & Canada)",
            "utc": [
              "America/Dawson",
              "America/Los_Angeles",
              "America/Tijuana",
              "America/Vancouver",
              "America/Whitehorse",
              "PST8PDT"
            ]
          },
          {
            "name": "US Mountain Standard Time",
            "abbr": "UMST",
            "offset": -7,
            "isdst": false,
            "text": "(UTC-07:00) Arizona",
            "utc": [
              "America/Creston",
              "America/Dawson_Creek",
              "America/Hermosillo",
              "America/Phoenix",
              "Etc/GMT+7"
            ]
          },
          {
            "name": "Mountain Standard Time (Mexico)",
            "abbr": "MDT",
            "offset": -6,
            "isdst": true,
            "text": "(UTC-07:00) Chihuahua, La Paz, Mazatlan",
            "utc": [
              "America/Chihuahua",
              "America/Mazatlan"
            ]
          },
          {
            "name": "Mountain Standard Time",
            "abbr": "MDT",
            "offset": -6,
            "isdst": true,
            "text": "(UTC-07:00) Mountain Time (US & Canada)",
            "utc": [
              "America/Boise",
              "America/Cambridge_Bay",
              "America/Denver",
              "America/Edmonton",
              "America/Inuvik",
              "America/Ojinaga",
              "America/Yellowknife",
              "MST7MDT"
            ]
          },
          {
            "name": "Central America Standard Time",
            "abbr": "CAST",
            "offset": -6,
            "isdst": false,
            "text": "(UTC-06:00) Central America",
            "utc": [
              "America/Belize",
              "America/Costa_Rica",
              "America/El_Salvador",
              "America/Guatemala",
              "America/Managua",
              "America/Tegucigalpa",
              "Etc/GMT+6",
              "Pacific/Galapagos"
            ]
          },
          {
            "name": "Central Standard Time",
            "abbr": "CDT",
            "offset": -5,
            "isdst": true,
            "text": "(UTC-06:00) Central Time (US & Canada)",
            "utc": [
              "America/Chicago",
              "America/Indiana/Knox",
              "America/Indiana/Tell_City",
              "America/Matamoros",
              "America/Menominee",
              "America/North_Dakota/Beulah",
              "America/North_Dakota/Center",
              "America/North_Dakota/New_Salem",
              "America/Rainy_River",
              "America/Rankin_Inlet",
              "America/Resolute",
              "America/Winnipeg",
              "CST6CDT"
            ]
          },
          {
            "name": "Central Standard Time (Mexico)",
            "abbr": "CDT",
            "offset": -5,
            "isdst": true,
            "text": "(UTC-06:00) Guadalajara, Mexico City, Monterrey",
            "utc": [
              "America/Bahia_Banderas",
              "America/Cancun",
              "America/Merida",
              "America/Mexico_City",
              "America/Monterrey"
            ]
          },
          {
            "name": "Canada Central Standard Time",
            "abbr": "CCST",
            "offset": -6,
            "isdst": false,
            "text": "(UTC-06:00) Saskatchewan",
            "utc": [
              "America/Regina",
              "America/Swift_Current"
            ]
          },
          {
            "name": "SA Pacific Standard Time",
            "abbr": "SPST",
            "offset": -5,
            "isdst": false,
            "text": "(UTC-05:00) Bogota, Lima, Quito",
            "utc": [
              "America/Bogota",
              "America/Cayman",
              "America/Coral_Harbour",
              "America/Eirunepe",
              "America/Guayaquil",
              "America/Jamaica",
              "America/Lima",
              "America/Panama",
              "America/Rio_Branco",
              "Etc/GMT+5"
            ]
          },
          {
            "name": "Eastern Standard Time",
            "abbr": "EDT",
            "offset": -4,
            "isdst": true,
            "text": "(UTC-05:00) Eastern Time (US & Canada)",
            "utc": [
              "America/Detroit",
              "America/Havana",
              "America/Indiana/Petersburg",
              "America/Indiana/Vincennes",
              "America/Indiana/Winamac",
              "America/Iqaluit",
              "America/Kentucky/Monticello",
              "America/Louisville",
              "America/Montreal",
              "America/Nassau",
              "America/New_York",
              "America/Nipigon",
              "America/Pangnirtung",
              "America/Port-au-Prince",
              "America/Thunder_Bay",
              "America/Toronto",
              "EST5EDT"
            ]
          },
          {
            "name": "US Eastern Standard Time",
            "abbr": "UEDT",
            "offset": -4,
            "isdst": true,
            "text": "(UTC-05:00) Indiana (East)",
            "utc": [
              "America/Indiana/Marengo",
              "America/Indiana/Vevay",
              "America/Indianapolis"
            ]
          },
          {
            "name": "Venezuela Standard Time",
            "abbr": "VST",
            "offset": -4.5,
            "isdst": false,
            "text": "(UTC-04:30) Caracas",
            "utc": [
              "America/Caracas"
            ]
          },
          {
            "name": "Paraguay Standard Time",
            "abbr": "PYT",
            "offset": -4,
            "isdst": false,
            "text": "(UTC-04:00) Asuncion",
            "utc": [
              "America/Asuncion"
            ]
          },
          {
            "name": "Atlantic Standard Time",
            "abbr": "ADT",
            "offset": -3,
            "isdst": true,
            "text": "(UTC-04:00) Atlantic Time (Canada)",
            "utc": [
              "America/Glace_Bay",
              "America/Goose_Bay",
              "America/Halifax",
              "America/Moncton",
              "America/Thule",
              "Atlantic/Bermuda"
            ]
          },
          {
            "name": "Central Brazilian Standard Time",
            "abbr": "CBST",
            "offset": -4,
            "isdst": false,
            "text": "(UTC-04:00) Cuiaba",
            "utc": [
              "America/Campo_Grande",
              "America/Cuiaba"
            ]
          },
          {
            "name": "SA Western Standard Time",
            "abbr": "SWST",
            "offset": -4,
            "isdst": false,
            "text": "(UTC-04:00) Georgetown, La Paz, Manaus, San Juan",
            "utc": [
              "America/Anguilla",
              "America/Antigua",
              "America/Aruba",
              "America/Barbados",
              "America/Blanc-Sablon",
              "America/Boa_Vista",
              "America/Curacao",
              "America/Dominica",
              "America/Grand_Turk",
              "America/Grenada",
              "America/Guadeloupe",
              "America/Guyana",
              "America/Kralendijk",
              "America/La_Paz",
              "America/Lower_Princes",
              "America/Manaus",
              "America/Marigot",
              "America/Martinique",
              "America/Montserrat",
              "America/Port_of_Spain",
              "America/Porto_Velho",
              "America/Puerto_Rico",
              "America/Santo_Domingo",
              "America/St_Barthelemy",
              "America/St_Kitts",
              "America/St_Lucia",
              "America/St_Thomas",
              "America/St_Vincent",
              "America/Tortola",
              "Etc/GMT+4"
            ]
          },
          {
            "name": "Pacific SA Standard Time",
            "abbr": "PSST",
            "offset": -4,
            "isdst": false,
            "text": "(UTC-04:00) Santiago",
            "utc": [
              "America/Santiago",
              "Antarctica/Palmer"
            ]
          },
          {
            "name": "Newfoundland Standard Time",
            "abbr": "NDT",
            "offset": -2.5,
            "isdst": true,
            "text": "(UTC-03:30) Newfoundland",
            "utc": [
              "America/St_Johns"
            ]
          },
          {
            "name": "E. South America Standard Time",
            "abbr": "ESAST",
            "offset": -3,
            "isdst": false,
            "text": "(UTC-03:00) Brasilia",
            "utc": [
              "America/Sao_Paulo"
            ]
          },
          {
            "name": "Argentina Standard Time",
            "abbr": "AST",
            "offset": -3,
            "isdst": false,
            "text": "(UTC-03:00) Buenos Aires",
            "utc": [
              "America/Argentina/La_Rioja",
              "America/Argentina/Rio_Gallegos",
              "America/Argentina/Salta",
              "America/Argentina/San_Juan",
              "America/Argentina/San_Luis",
              "America/Argentina/Tucuman",
              "America/Argentina/Ushuaia",
              "America/Buenos_Aires",
              "America/Catamarca",
              "America/Cordoba",
              "America/Jujuy",
              "America/Mendoza"
            ]
          },
          {
            "name": "SA Eastern Standard Time",
            "abbr": "SEST",
            "offset": -3,
            "isdst": false,
            "text": "(UTC-03:00) Cayenne, Fortaleza",
            "utc": [
              "America/Araguaina",
              "America/Belem",
              "America/Cayenne",
              "America/Fortaleza",
              "America/Maceio",
              "America/Paramaribo",
              "America/Recife",
              "America/Santarem",
              "Antarctica/Rothera",
              "Atlantic/Stanley",
              "Etc/GMT+3"
            ]
          },
          {
            "name": "Greenland Standard Time",
            "abbr": "GDT",
            "offset": -3,
            "isdst": true,
            "text": "(UTC-03:00) Greenland",
            "utc": [
              "America/Godthab"
            ]
          },
          {
            "name": "Montevideo Standard Time",
            "abbr": "MST",
            "offset": -3,
            "isdst": false,
            "text": "(UTC-03:00) Montevideo",
            "utc": [
              "America/Montevideo"
            ]
          },
          {
            "name": "Bahia Standard Time",
            "abbr": "BST",
            "offset": -3,
            "isdst": false,
            "text": "(UTC-03:00) Salvador",
            "utc": [
              "America/Bahia"
            ]
          },
          {
            "name": "UTC-02",
            "abbr": "U",
            "offset": -2,
            "isdst": false,
            "text": "(UTC-02:00) Coordinated Universal Time-02",
            "utc": [
              "America/Noronha",
              "Atlantic/South_Georgia",
              "Etc/GMT+2"
            ]
          },
          {
            "name": "Mid-Atlantic Standard Time",
            "abbr": "MDT",
            "offset": -1,
            "isdst": true,
            "text": "(UTC-02:00) Mid-Atlantic - Old",
            "utc": []
          },
          {
            "name": "Azores Standard Time",
            "abbr": "ADT",
            "offset": 0,
            "isdst": true,
            "text": "(UTC-01:00) Azores",
            "utc": [
              "America/Scoresbysund",
              "Atlantic/Azores"
            ]
          },
          {
            "name": "Cape Verde Standard Time",
            "abbr": "CVST",
            "offset": -1,
            "isdst": false,
            "text": "(UTC-01:00) Cape Verde Is.",
            "utc": [
              "Atlantic/Cape_Verde",
              "Etc/GMT+1"
            ]
          },
          {
            "name": "Morocco Standard Time",
            "abbr": "MDT",
            "offset": 1,
            "isdst": true,
            "text": "(UTC) Casablanca",
            "utc": [
              "Africa/Casablanca",
              "Africa/El_Aaiun"
            ]
          },
          {
            "name": "UTC",
            "abbr": "UTC",
            "offset": 0,
            "isdst": false,
            "text": "(UTC) Coordinated Universal Time",
            "utc": [
              "America/Danmarkshavn",
              "Etc/GMT"
            ]
          },
          {
            "name": "GMT Standard Time",
            "abbr": "GMT",
            "offset": 0,
            "isdst": false,
            "text": "(UTC) Edinburgh, London",
            "utc": [
              "Europe/Isle_of_Man",
              "Europe/Guernsey",
              "Europe/Jersey",
              "Europe/London"
            ]
          },
          {
            "name": "British Summer Time",
            "abbr": "BST",
            "offset": 1,
            "isdst": true,
            "text": "(UTC+01:00) Edinburgh, London",
            "utc": [
              "Europe/Isle_of_Man",
              "Europe/Guernsey",
              "Europe/Jersey",
              "Europe/London"
            ]
          },
          {
            "name": "GMT Standard Time",
            "abbr": "GDT",
            "offset": 1,
            "isdst": true,
            "text": "(UTC) Dublin, Lisbon",
            "utc": [
              "Atlantic/Canary",
              "Atlantic/Faeroe",
              "Atlantic/Madeira",
              "Europe/Dublin",
              "Europe/Lisbon"
            ]
          },
          {
            "name": "Greenwich Standard Time",
            "abbr": "GST",
            "offset": 0,
            "isdst": false,
            "text": "(UTC) Monrovia, Reykjavik",
            "utc": [
              "Africa/Abidjan",
              "Africa/Accra",
              "Africa/Bamako",
              "Africa/Banjul",
              "Africa/Bissau",
              "Africa/Conakry",
              "Africa/Dakar",
              "Africa/Freetown",
              "Africa/Lome",
              "Africa/Monrovia",
              "Africa/Nouakchott",
              "Africa/Ouagadougou",
              "Africa/Sao_Tome",
              "Atlantic/Reykjavik",
              "Atlantic/St_Helena"
            ]
          },
          {
            "name": "W. Europe Standard Time",
            "abbr": "WEDT",
            "offset": 2,
            "isdst": true,
            "text": "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
            "utc": [
              "Arctic/Longyearbyen",
              "Europe/Amsterdam",
              "Europe/Andorra",
              "Europe/Berlin",
              "Europe/Busingen",
              "Europe/Gibraltar",
              "Europe/Luxembourg",
              "Europe/Malta",
              "Europe/Monaco",
              "Europe/Oslo",
              "Europe/Rome",
              "Europe/San_Marino",
              "Europe/Stockholm",
              "Europe/Vaduz",
              "Europe/Vatican",
              "Europe/Vienna",
              "Europe/Zurich"
            ]
          },
          {
            "name": "Central Europe Standard Time",
            "abbr": "CEDT",
            "offset": 2,
            "isdst": true,
            "text": "(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
            "utc": [
              "Europe/Belgrade",
              "Europe/Bratislava",
              "Europe/Budapest",
              "Europe/Ljubljana",
              "Europe/Podgorica",
              "Europe/Prague",
              "Europe/Tirane"
            ]
          },
          {
            "name": "Romance Standard Time",
            "abbr": "RDT",
            "offset": 2,
            "isdst": true,
            "text": "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris",
            "utc": [
              "Africa/Ceuta",
              "Europe/Brussels",
              "Europe/Copenhagen",
              "Europe/Madrid",
              "Europe/Paris"
            ]
          },
          {
            "name": "Central European Standard Time",
            "abbr": "CEDT",
            "offset": 2,
            "isdst": true,
            "text": "(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb",
            "utc": [
              "Europe/Sarajevo",
              "Europe/Skopje",
              "Europe/Warsaw",
              "Europe/Zagreb"
            ]
          },
          {
            "name": "W. Central Africa Standard Time",
            "abbr": "WCAST",
            "offset": 1,
            "isdst": false,
            "text": "(UTC+01:00) West Central Africa",
            "utc": [
              "Africa/Algiers",
              "Africa/Bangui",
              "Africa/Brazzaville",
              "Africa/Douala",
              "Africa/Kinshasa",
              "Africa/Lagos",
              "Africa/Libreville",
              "Africa/Luanda",
              "Africa/Malabo",
              "Africa/Ndjamena",
              "Africa/Niamey",
              "Africa/Porto-Novo",
              "Africa/Tunis",
              "Etc/GMT-1"
            ]
          },
          {
            "name": "Namibia Standard Time",
            "abbr": "NST",
            "offset": 1,
            "isdst": false,
            "text": "(UTC+01:00) Windhoek",
            "utc": [
              "Africa/Windhoek"
            ]
          },
          {
            "name": "GTB Standard Time",
            "abbr": "GDT",
            "offset": 3,
            "isdst": true,
            "text": "(UTC+02:00) Athens, Bucharest",
            "utc": [
              "Asia/Nicosia",
              "Europe/Athens",
              "Europe/Bucharest",
              "Europe/Chisinau"
            ]
          },
          {
            "name": "Middle East Standard Time",
            "abbr": "MEDT",
            "offset": 3,
            "isdst": true,
            "text": "(UTC+02:00) Beirut",
            "utc": [
              "Asia/Beirut"
            ]
          },
          {
            "name": "Egypt Standard Time",
            "abbr": "EST",
            "offset": 2,
            "isdst": false,
            "text": "(UTC+02:00) Cairo",
            "utc": [
              "Africa/Cairo"
            ]
          },
          {
            "name": "Syria Standard Time",
            "abbr": "SDT",
            "offset": 3,
            "isdst": true,
            "text": "(UTC+02:00) Damascus",
            "utc": [
              "Asia/Damascus"
            ]
          },
          {
            "name": "E. Europe Standard Time",
            "abbr": "EEDT",
            "offset": 3,
            "isdst": true,
            "text": "(UTC+02:00) E. Europe",
            "utc": [
              "Asia/Nicosia",
              "Europe/Athens",
              "Europe/Bucharest",
              "Europe/Chisinau",
              "Europe/Helsinki",
              "Europe/Kiev",
              "Europe/Mariehamn",
              "Europe/Nicosia",
              "Europe/Riga",
              "Europe/Sofia",
              "Europe/Tallinn",
              "Europe/Uzhgorod",
              "Europe/Vilnius",
              "Europe/Zaporozhye"
            ]
          },
          {
            "name": "South Africa Standard Time",
            "abbr": "SAST",
            "offset": 2,
            "isdst": false,
            "text": "(UTC+02:00) Harare, Pretoria",
            "utc": [
              "Africa/Blantyre",
              "Africa/Bujumbura",
              "Africa/Gaborone",
              "Africa/Harare",
              "Africa/Johannesburg",
              "Africa/Kigali",
              "Africa/Lubumbashi",
              "Africa/Lusaka",
              "Africa/Maputo",
              "Africa/Maseru",
              "Africa/Mbabane",
              "Etc/GMT-2"
            ]
          },
          {
            "name": "FLE Standard Time",
            "abbr": "FDT",
            "offset": 3,
            "isdst": true,
            "text": "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius",
            "utc": [
              "Europe/Helsinki",
              "Europe/Kiev",
              "Europe/Mariehamn",
              "Europe/Riga",
              "Europe/Sofia",
              "Europe/Tallinn",
              "Europe/Uzhgorod",
              "Europe/Vilnius",
              "Europe/Zaporozhye"
            ]
          },
          {
            "name": "Turkey Standard Time",
            "abbr": "TDT",
            "offset": 3,
            "isdst": false,
            "text": "(UTC+03:00) Istanbul",
            "utc": [
              "Europe/Istanbul"
            ]
          },
          {
            "name": "Israel Standard Time",
            "abbr": "JDT",
            "offset": 3,
            "isdst": true,
            "text": "(UTC+02:00) Jerusalem",
            "utc": [
              "Asia/Jerusalem"
            ]
          },
          {
            "name": "Libya Standard Time",
            "abbr": "LST",
            "offset": 2,
            "isdst": false,
            "text": "(UTC+02:00) Tripoli",
            "utc": [
              "Africa/Tripoli"
            ]
          },
          {
            "name": "Jordan Standard Time",
            "abbr": "JST",
            "offset": 3,
            "isdst": false,
            "text": "(UTC+03:00) Amman",
            "utc": [
              "Asia/Amman"
            ]
          },
          {
            "name": "Arabic Standard Time",
            "abbr": "AST",
            "offset": 3,
            "isdst": false,
            "text": "(UTC+03:00) Baghdad",
            "utc": [
              "Asia/Baghdad"
            ]
          },
          {
            "name": "Kaliningrad Standard Time",
            "abbr": "KST",
            "offset": 3,
            "isdst": false,
            "text": "(UTC+02:00) Kaliningrad",
            "utc": [
              "Europe/Kaliningrad"
            ]
          },
          {
            "name": "Arab Standard Time",
            "abbr": "AST",
            "offset": 3,
            "isdst": false,
            "text": "(UTC+03:00) Kuwait, Riyadh",
            "utc": [
              "Asia/Aden",
              "Asia/Bahrain",
              "Asia/Kuwait",
              "Asia/Qatar",
              "Asia/Riyadh"
            ]
          },
          {
            "name": "E. Africa Standard Time",
            "abbr": "EAST",
            "offset": 3,
            "isdst": false,
            "text": "(UTC+03:00) Nairobi",
            "utc": [
              "Africa/Addis_Ababa",
              "Africa/Asmera",
              "Africa/Dar_es_Salaam",
              "Africa/Djibouti",
              "Africa/Juba",
              "Africa/Kampala",
              "Africa/Khartoum",
              "Africa/Mogadishu",
              "Africa/Nairobi",
              "Antarctica/Syowa",
              "Etc/GMT-3",
              "Indian/Antananarivo",
              "Indian/Comoro",
              "Indian/Mayotte"
            ]
          },
          {
            "name": "Moscow Standard Time",
            "abbr": "MSK",
            "offset": 3,
            "isdst": false,
            "text": "(UTC+03:00) Moscow, St. Petersburg, Volgograd, Minsk",
            "utc": [
              "Europe/Kirov",
              "Europe/Moscow",
              "Europe/Simferopol",
              "Europe/Volgograd",
              "Europe/Minsk"
            ]
          },
          {
            "name": "Samara Time",
            "abbr": "SAMT",
            "offset": 4,
            "isdst": false,
            "text": "(UTC+04:00) Samara, Ulyanovsk, Saratov",
            "utc": [
              "Europe/Astrakhan",
              "Europe/Samara",
              "Europe/Ulyanovsk"
            ]
          },
          {
            "name": "Iran Standard Time",
            "abbr": "IDT",
            "offset": 4.5,
            "isdst": true,
            "text": "(UTC+03:30) Tehran",
            "utc": [
              "Asia/Tehran"
            ]
          },
          {
            "name": "Arabian Standard Time",
            "abbr": "AST",
            "offset": 4,
            "isdst": false,
            "text": "(UTC+04:00) Abu Dhabi, Muscat",
            "utc": [
              "Asia/Dubai",
              "Asia/Muscat",
              "Etc/GMT-4"
            ]
          },
          {
            "name": "Azerbaijan Standard Time",
            "abbr": "ADT",
            "offset": 5,
            "isdst": true,
            "text": "(UTC+04:00) Baku",
            "utc": [
              "Asia/Baku"
            ]
          },
          {
            "name": "Mauritius Standard Time",
            "abbr": "MST",
            "offset": 4,
            "isdst": false,
            "text": "(UTC+04:00) Port Louis",
            "utc": [
              "Indian/Mahe",
              "Indian/Mauritius",
              "Indian/Reunion"
            ]
          },
          {
            "name": "Georgian Standard Time",
            "abbr": "GET",
            "offset": 4,
            "isdst": false,
            "text": "(UTC+04:00) Tbilisi",
            "utc": [
              "Asia/Tbilisi"
            ]
          },
          {
            "name": "Caucasus Standard Time",
            "abbr": "CST",
            "offset": 4,
            "isdst": false,
            "text": "(UTC+04:00) Yerevan",
            "utc": [
              "Asia/Yerevan"
            ]
          },
          {
            "name": "Afghanistan Standard Time",
            "abbr": "AST",
            "offset": 4.5,
            "isdst": false,
            "text": "(UTC+04:30) Kabul",
            "utc": [
              "Asia/Kabul"
            ]
          },
          {
            "name": "West Asia Standard Time",
            "abbr": "WAST",
            "offset": 5,
            "isdst": false,
            "text": "(UTC+05:00) Ashgabat, Tashkent",
            "utc": [
              "Antarctica/Mawson",
              "Asia/Aqtau",
              "Asia/Aqtobe",
              "Asia/Ashgabat",
              "Asia/Dushanbe",
              "Asia/Oral",
              "Asia/Samarkand",
              "Asia/Tashkent",
              "Etc/GMT-5",
              "Indian/Kerguelen",
              "Indian/Maldives"
            ]
          },
          {
            "name": "Yekaterinburg Time",
            "abbr": "YEKT",
            "offset": 5,
            "isdst": false,
            "text": "(UTC+05:00) Yekaterinburg",
            "utc": [
              "Asia/Yekaterinburg"
            ]
          },
          {
            "name": "Pakistan Standard Time",
            "abbr": "PKT",
            "offset": 5,
            "isdst": false,
            "text": "(UTC+05:00) Islamabad, Karachi",
            "utc": [
              "Asia/Karachi"
            ]
          },
          {
            "name": "India Standard Time",
            "abbr": "IST",
            "offset": 5.5,
            "isdst": false,
            "text": "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi",
            "utc": [
              "Asia/Kolkata"
            ]
          },
          {
            "name": "Sri Lanka Standard Time",
            "abbr": "SLST",
            "offset": 5.5,
            "isdst": false,
            "text": "(UTC+05:30) Sri Jayawardenepura",
            "utc": [
              "Asia/Colombo"
            ]
          },
          {
            "name": "Nepal Standard Time",
            "abbr": "NST",
            "offset": 5.75,
            "isdst": false,
            "text": "(UTC+05:45) Kathmandu",
            "utc": [
              "Asia/Kathmandu"
            ]
          },
          {
            "name": "Central Asia Standard Time",
            "abbr": "CAST",
            "offset": 6,
            "isdst": false,
            "text": "(UTC+06:00) Nur-Sultan (Astana)",
            "utc": [
              "Antarctica/Vostok",
              "Asia/Almaty",
              "Asia/Bishkek",
              "Asia/Qyzylorda",
              "Asia/Urumqi",
              "Etc/GMT-6",
              "Indian/Chagos"
            ]
          },
          {
            "name": "Bangladesh Standard Time",
            "abbr": "BST",
            "offset": 6,
            "isdst": false,
            "text": "(UTC+06:00) Dhaka",
            "utc": [
              "Asia/Dhaka",
              "Asia/Thimphu"
            ]
          },
          {
            "name": "Myanmar Standard Time",
            "abbr": "MST",
            "offset": 6.5,
            "isdst": false,
            "text": "(UTC+06:30) Yangon (Rangoon)",
            "utc": [
              "Asia/Rangoon",
              "Indian/Cocos"
            ]
          },
          {
            "name": "SE Asia Standard Time",
            "abbr": "SAST",
            "offset": 7,
            "isdst": false,
            "text": "(UTC+07:00) Bangkok, Hanoi, Jakarta",
            "utc": [
              "Antarctica/Davis",
              "Asia/Bangkok",
              "Asia/Hovd",
              "Asia/Jakarta",
              "Asia/Phnom_Penh",
              "Asia/Pontianak",
              "Asia/Saigon",
              "Asia/Vientiane",
              "Etc/GMT-7",
              "Indian/Christmas"
            ]
          },
          {
            "name": "N. Central Asia Standard Time",
            "abbr": "NCAST",
            "offset": 7,
            "isdst": false,
            "text": "(UTC+07:00) Novosibirsk",
            "utc": [
              "Asia/Novokuznetsk",
              "Asia/Novosibirsk",
              "Asia/Omsk"
            ]
          },
          {
            "name": "China Standard Time",
            "abbr": "CST",
            "offset": 8,
            "isdst": false,
            "text": "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
            "utc": [
              "Asia/Hong_Kong",
              "Asia/Macau",
              "Asia/Shanghai"
            ]
          },
          {
            "name": "North Asia Standard Time",
            "abbr": "NAST",
            "offset": 8,
            "isdst": false,
            "text": "(UTC+08:00) Krasnoyarsk",
            "utc": [
              "Asia/Krasnoyarsk"
            ]
          },
          {
            "name": "Singapore Standard Time",
            "abbr": "MPST",
            "offset": 8,
            "isdst": false,
            "text": "(UTC+08:00) Kuala Lumpur, Singapore",
            "utc": [
              "Asia/Brunei",
              "Asia/Kuala_Lumpur",
              "Asia/Kuching",
              "Asia/Makassar",
              "Asia/Manila",
              "Asia/Singapore",
              "Etc/GMT-8"
            ]
          },
          {
            "name": "W. Australia Standard Time",
            "abbr": "WAST",
            "offset": 8,
            "isdst": false,
            "text": "(UTC+08:00) Perth",
            "utc": [
              "Antarctica/Casey",
              "Australia/Perth"
            ]
          },
          {
            "name": "Taipei Standard Time",
            "abbr": "TST",
            "offset": 8,
            "isdst": false,
            "text": "(UTC+08:00) Taipei",
            "utc": [
              "Asia/Taipei"
            ]
          },
          {
            "name": "Ulaanbaatar Standard Time",
            "abbr": "UST",
            "offset": 8,
            "isdst": false,
            "text": "(UTC+08:00) Ulaanbaatar",
            "utc": [
              "Asia/Choibalsan",
              "Asia/Ulaanbaatar"
            ]
          },
          {
            "name": "North Asia East Standard Time",
            "abbr": "NAEST",
            "offset": 8,
            "isdst": false,
            "text": "(UTC+08:00) Irkutsk",
            "utc": [
              "Asia/Irkutsk"
            ]
          },
          {
            "name": "Japan Standard Time",
            "abbr": "JST",
            "offset": 9,
            "isdst": false,
            "text": "(UTC+09:00) Osaka, Sapporo, Tokyo",
            "utc": [
              "Asia/Dili",
              "Asia/Jayapura",
              "Asia/Tokyo",
              "Etc/GMT-9",
              "Pacific/Palau"
            ]
          },
          {
            "name": "Korea Standard Time",
            "abbr": "KST",
            "offset": 9,
            "isdst": false,
            "text": "(UTC+09:00) Seoul",
            "utc": [
              "Asia/Pyongyang",
              "Asia/Seoul"
            ]
          },
          {
            "name": "Cen. Australia Standard Time",
            "abbr": "CAST",
            "offset": 9.5,
            "isdst": false,
            "text": "(UTC+09:30) Adelaide",
            "utc": [
              "Australia/Adelaide",
              "Australia/Broken_Hill"
            ]
          },
          {
            "name": "AUS Central Standard Time",
            "abbr": "ACST",
            "offset": 9.5,
            "isdst": false,
            "text": "(UTC+09:30) Darwin",
            "utc": [
              "Australia/Darwin"
            ]
          },
          {
            "name": "E. Australia Standard Time",
            "abbr": "EAST",
            "offset": 10,
            "isdst": false,
            "text": "(UTC+10:00) Brisbane",
            "utc": [
              "Australia/Brisbane",
              "Australia/Lindeman"
            ]
          },
          {
            "name": "AUS Eastern Standard Time",
            "abbr": "AEST",
            "offset": 10,
            "isdst": false,
            "text": "(UTC+10:00) Canberra, Melbourne, Sydney",
            "utc": [
              "Australia/Melbourne",
              "Australia/Sydney"
            ]
          },
          {
            "name": "West Pacific Standard Time",
            "abbr": "WPST",
            "offset": 10,
            "isdst": false,
            "text": "(UTC+10:00) Guam, Port Moresby",
            "utc": [
              "Antarctica/DumontDUrville",
              "Etc/GMT-10",
              "Pacific/Guam",
              "Pacific/Port_Moresby",
              "Pacific/Saipan",
              "Pacific/Truk"
            ]
          },
          {
            "name": "Tasmania Standard Time",
            "abbr": "TST",
            "offset": 10,
            "isdst": false,
            "text": "(UTC+10:00) Hobart",
            "utc": [
              "Australia/Currie",
              "Australia/Hobart"
            ]
          },
          {
            "name": "Yakutsk Standard Time",
            "abbr": "YST",
            "offset": 9,
            "isdst": false,
            "text": "(UTC+09:00) Yakutsk",
            "utc": [
              "Asia/Chita",
              "Asia/Khandyga",
              "Asia/Yakutsk"
            ]
          },
          {
            "name": "Central Pacific Standard Time",
            "abbr": "CPST",
            "offset": 11,
            "isdst": false,
            "text": "(UTC+11:00) Solomon Is., New Caledonia",
            "utc": [
              "Antarctica/Macquarie",
              "Etc/GMT-11",
              "Pacific/Efate",
              "Pacific/Guadalcanal",
              "Pacific/Kosrae",
              "Pacific/Noumea",
              "Pacific/Ponape"
            ]
          },
          {
            "name": "Vladivostok Standard Time",
            "abbr": "VST",
            "offset": 11,
            "isdst": false,
            "text": "(UTC+11:00) Vladivostok",
            "utc": [
              "Asia/Sakhalin",
              "Asia/Ust-Nera",
              "Asia/Vladivostok"
            ]
          },
          {
            "name": "New Zealand Standard Time",
            "abbr": "NZST",
            "offset": 12,
            "isdst": false,
            "text": "(UTC+12:00) Auckland, Wellington",
            "utc": [
              "Antarctica/McMurdo",
              "Pacific/Auckland"
            ]
          },
          {
            "name": "UTC+12",
            "abbr": "U",
            "offset": 12,
            "isdst": false,
            "text": "(UTC+12:00) Coordinated Universal Time+12",
            "utc": [
              "Etc/GMT-12",
              "Pacific/Funafuti",
              "Pacific/Kwajalein",
              "Pacific/Majuro",
              "Pacific/Nauru",
              "Pacific/Tarawa",
              "Pacific/Wake",
              "Pacific/Wallis"
            ]
          },
          {
            "name": "Fiji Standard Time",
            "abbr": "FST",
            "offset": 12,
            "isdst": false,
            "text": "(UTC+12:00) Fiji",
            "utc": [
              "Pacific/Fiji"
            ]
          },
          {
            "name": "Magadan Standard Time",
            "abbr": "MST",
            "offset": 12,
            "isdst": false,
            "text": "(UTC+12:00) Magadan",
            "utc": [
              "Asia/Anadyr",
              "Asia/Kamchatka",
              "Asia/Magadan",
              "Asia/Srednekolymsk"
            ]
          },
          {
            "name": "Kamchatka Standard Time",
            "abbr": "KDT",
            "offset": 13,
            "isdst": true,
            "text": "(UTC+12:00) Petropavlovsk-Kamchatsky - Old",
            "utc": [
              "Asia/Kamchatka"
            ]
          },
          {
            "name": "Tonga Standard Time",
            "abbr": "TST",
            "offset": 13,
            "isdst": false,
            "text": "(UTC+13:00) Nuku'alofa",
            "utc": [
              "Etc/GMT-13",
              "Pacific/Enderbury",
              "Pacific/Fakaofo",
              "Pacific/Tongatapu"
            ]
          },
          {
            "name": "Samoa Standard Time",
            "abbr": "SST",
            "offset": 13,
            "isdst": false,
            "text": "(UTC+13:00) Samoa",
            "utc": [
              "Pacific/Apia"
            ]
          }
        ],
        profession: [
          "Airline Pilot",
          "Academic Team",
          "Accountant",
          "Account Executive",
          "Actor",
          "Actuary",
          "Acquisition Analyst",
          "Administrative Asst.",
          "Administrative Analyst",
          "Administrator",
          "Advertising Director",
          "Aerospace Engineer",
          "Agent",
          "Agricultural Inspector",
          "Agricultural Scientist",
          "Air Traffic Controller",
          "Animal Trainer",
          "Anthropologist",
          "Appraiser",
          "Architect",
          "Art Director",
          "Artist",
          "Astronomer",
          "Athletic Coach",
          "Auditor",
          "Author",
          "Baker",
          "Banker",
          "Bankruptcy Attorney",
          "Benefits Manager",
          "Biologist",
          "Bio-feedback Specialist",
          "Biomedical Engineer",
          "Biotechnical Researcher",
          "Broadcaster",
          "Broker",
          "Building Manager",
          "Building Contractor",
          "Building Inspector",
          "Business Analyst",
          "Business Planner",
          "Business Manager",
          "Buyer",
          "Call Center Manager",
          "Career Counselor",
          "Cash Manager",
          "Ceramic Engineer",
          "Chief Executive Officer",
          "Chief Operation Officer",
          "Chef",
          "Chemical Engineer",
          "Chemist",
          "Child Care Manager",
          "Chief Medical Officer",
          "Chiropractor",
          "Cinematographer",
          "City Housing Manager",
          "City Manager",
          "Civil Engineer",
          "Claims Manager",
          "Clinical Research Assistant",
          "Collections Manager",
          "Compliance Manager",
          "Comptroller",
          "Computer Manager",
          "Commercial Artist",
          "Communications Affairs Director",
          "Communications Director",
          "Communications Engineer",
          "Compensation Analyst",
          "Computer Programmer",
          "Computer Ops. Manager",
          "Computer Engineer",
          "Computer Operator",
          "Computer Graphics Specialist",
          "Construction Engineer",
          "Construction Manager",
          "Consultant",
          "Consumer Relations Manager",
          "Contract Administrator",
          "Copyright Attorney",
          "Copywriter",
          "Corporate Planner",
          "Corrections Officer",
          "Cosmetologist",
          "Credit Analyst",
          "Cruise Director",
          "Chief Information Officer",
          "Chief Technology Officer",
          "Customer Service Manager",
          "Cryptologist",
          "Dancer",
          "Data Security Manager",
          "Database Manager",
          "Day Care Instructor",
          "Dentist",
          "Designer",
          "Design Engineer",
          "Desktop Publisher",
          "Developer",
          "Development Officer",
          "Diamond Merchant",
          "Dietitian",
          "Direct Marketer",
          "Director",
          "Distribution Manager",
          "Diversity Manager",
          "Economist",
          "EEO Compliance Manager",
          "Editor",
          "Education Adminator",
          "Electrical Engineer",
          "Electro Optical Engineer",
          "Electronics Engineer",
          "Embassy Management",
          "Employment Agent",
          "Engineer Technician",
          "Entrepreneur",
          "Environmental Analyst",
          "Environmental Attorney",
          "Environmental Engineer",
          "Environmental Specialist",
          "Escrow Officer",
          "Estimator",
          "Executive Assistant",
          "Executive Director",
          "Executive Recruiter",
          "Facilities Manager",
          "Family Counselor",
          "Fashion Events Manager",
          "Fashion Merchandiser",
          "Fast Food Manager",
          "Film Producer",
          "Film Production Assistant",
          "Financial Analyst",
          "Financial Planner",
          "Financier",
          "Fine Artist",
          "Wildlife Specialist",
          "Fitness Consultant",
          "Flight Attendant",
          "Flight Engineer",
          "Floral Designer",
          "Food & Beverage Director",
          "Food Service Manager",
          "Forestry Technician",
          "Franchise Management",
          "Franchise Sales",
          "Fraud Investigator",
          "Freelance Writer",
          "Fund Raiser",
          "General Manager",
          "Geologist",
          "General Counsel",
          "Geriatric Specialist",
          "Gerontologist",
          "Glamour Photographer",
          "Golf Club Manager",
          "Gourmet Chef",
          "Graphic Designer",
          "Grounds Keeper",
          "Hazardous Waste Manager",
          "Health Care Manager",
          "Health Therapist",
          "Health Service Administrator",
          "Hearing Officer",
          "Home Economist",
          "Horticulturist",
          "Hospital Administrator",
          "Hotel Manager",
          "Human Resources Manager",
          "Importer",
          "Industrial Designer",
          "Industrial Engineer",
          "Information Director",
          "Inside Sales",
          "Insurance Adjuster",
          "Interior Decorator",
          "Internal Controls Director",
          "International Acct.",
          "International Courier",
          "International Lawyer",
          "Interpreter",
          "Investigator",
          "Investment Banker",
          "Investment Manager",
          "IT Architect",
          "IT Project Manager",
          "IT Systems Analyst",
          "Jeweler",
          "Joint Venture Manager",
          "Journalist",
          "Labor Negotiator",
          "Labor Organizer",
          "Labor Relations Manager",
          "Lab Services Director",
          "Lab Technician",
          "Land Developer",
          "Landscape Architect",
          "Law Enforcement Officer",
          "Lawyer",
          "Lead Software Engineer",
          "Lead Software Test Engineer",
          "Leasing Manager",
          "Legal Secretary",
          "Library Manager",
          "Litigation Attorney",
          "Loan Officer",
          "Lobbyist",
          "Logistics Manager",
          "Maintenance Manager",
          "Management Consultant",
          "Managed Care Director",
          "Managing Partner",
          "Manufacturing Director",
          "Manpower Planner",
          "Marine Biologist",
          "Market Res. Analyst",
          "Marketing Director",
          "Materials Manager",
          "Mathematician",
          "Membership Chairman",
          "Mechanic",
          "Mechanical Engineer",
          "Media Buyer",
          "Medical Investor",
          "Medical Secretary",
          "Medical Technician",
          "Mental Health Counselor",
          "Merchandiser",
          "Metallurgical Engineering",
          "Meteorologist",
          "Microbiologist",
          "MIS Manager",
          "Motion Picture Director",
          "Multimedia Director",
          "Musician",
          "Network Administrator",
          "Network Specialist",
          "Network Operator",
          "New Product Manager",
          "Novelist",
          "Nuclear Engineer",
          "Nuclear Specialist",
          "Nutritionist",
          "Nursing Administrator",
          "Occupational Therapist",
          "Oceanographer",
          "Office Manager",
          "Operations Manager",
          "Operations Research Director",
          "Optical Technician",
          "Optometrist",
          "Organizational Development Manager",
          "Outplacement Specialist",
          "Paralegal",
          "Park Ranger",
          "Patent Attorney",
          "Payroll Specialist",
          "Personnel Specialist",
          "Petroleum Engineer",
          "Pharmacist",
          "Photographer",
          "Physical Therapist",
          "Physician",
          "Physician Assistant",
          "Physicist",
          "Planning Director",
          "Podiatrist",
          "Political Analyst",
          "Political Scientist",
          "Politician",
          "Portfolio Manager",
          "Preschool Management",
          "Preschool Teacher",
          "Principal",
          "Private Banker",
          "Private Investigator",
          "Probation Officer",
          "Process Engineer",
          "Producer",
          "Product Manager",
          "Product Engineer",
          "Production Engineer",
          "Production Planner",
          "Professional Athlete",
          "Professional Coach",
          "Professor",
          "Project Engineer",
          "Project Manager",
          "Program Manager",
          "Property Manager",
          "Public Administrator",
          "Public Safety Director",
          "PR Specialist",
          "Publisher",
          "Purchasing Agent",
          "Publishing Director",
          "Quality Assurance Specialist",
          "Quality Control Engineer",
          "Quality Control Inspector",
          "Radiology Manager",
          "Railroad Engineer",
          "Real Estate Broker",
          "Recreational Director",
          "Recruiter",
          "Redevelopment Specialist",
          "Regulatory Affairs Manager",
          "Registered Nurse",
          "Rehabilitation Counselor",
          "Relocation Manager",
          "Reporter",
          "Research Specialist",
          "Restaurant Manager",
          "Retail Store Manager",
          "Risk Analyst",
          "Safety Engineer",
          "Sales Engineer",
          "Sales Trainer",
          "Sales Promotion Manager",
          "Sales Representative",
          "Sales Manager",
          "Service Manager",
          "Sanitation Engineer",
          "Scientific Programmer",
          "Scientific Writer",
          "Securities Analyst",
          "Security Consultant",
          "Security Director",
          "Seminar Presenter",
          "Ship's Officer",
          "Singer",
          "Social Director",
          "Social Program Planner",
          "Social Research",
          "Social Scientist",
          "Social Worker",
          "Sociologist",
          "Software Developer",
          "Software Engineer",
          "Software Test Engineer",
          "Soil Scientist",
          "Special Events Manager",
          "Special Education Teacher",
          "Special Projects Director",
          "Speech Pathologist",
          "Speech Writer",
          "Sports Event Manager",
          "Statistician",
          "Store Manager",
          "Strategic Alliance Director",
          "Strategic Planning Director",
          "Stress Reduction Specialist",
          "Stockbroker",
          "Surveyor",
          "Structural Engineer",
          "Superintendent",
          "Supply Chain Director",
          "System Engineer",
          "Systems Analyst",
          "Systems Programmer",
          "System Administrator",
          "Tax Specialist",
          "Teacher",
          "Technical Support Specialist",
          "Technical Illustrator",
          "Technical Writer",
          "Technology Director",
          "Telecom Analyst",
          "Telemarketer",
          "Theatrical Director",
          "Title Examiner",
          "Tour Escort",
          "Tour Guide Director",
          "Traffic Manager",
          "Trainer Translator",
          "Transportation Manager",
          "Travel Agent",
          "Treasurer",
          "TV Programmer",
          "Underwriter",
          "Union Representative",
          "University Administrator",
          "University Dean",
          "Urban Planner",
          "Veterinarian",
          "Vendor Relations Director",
          "Viticulturist",
          "Warehouse Manager"
        ],
        animals: {
          "ocean": ["Acantharea", "Anemone", "Angelfish King", "Ahi Tuna", "Albacore", "American Oyster", "Anchovy", "Armored Snail", "Arctic Char", "Atlantic Bluefin Tuna", "Atlantic Cod", "Atlantic Goliath Grouper", "Atlantic Trumpetfish", "Atlantic Wolffish", "Baleen Whale", "Banded Butterflyfish", "Banded Coral Shrimp", "Banded Sea Krait", "Barnacle", "Barndoor Skate", "Barracuda", "Basking Shark", "Bass", "Beluga Whale", "Bluebanded Goby", "Bluehead Wrasse", "Bluefish", "Bluestreak Cleaner-Wrasse", "Blue Marlin", "Blue Shark", "Blue Spiny Lobster", "Blue Tang", "Blue Whale", "Broadclub Cuttlefish", "Bull Shark", "Chambered Nautilus", "Chilean Basket Star", "Chilean Jack Mackerel", "Chinook Salmon", "Christmas Tree Worm", "Clam", "Clown Anemonefish", "Clown Triggerfish", "Cod", "Coelacanth", "Cockscomb Cup Coral", "Common Fangtooth", "Conch", "Cookiecutter Shark", "Copepod", "Coral", "Corydoras", "Cownose Ray", "Crab", "Crown-of-Thorns Starfish", "Cushion Star", "Cuttlefish", "California Sea Otters", "Dolphin", "Dolphinfish", "Dory", "Devil Fish", "Dugong", "Dumbo Octopus", "Dungeness Crab", "Eccentric Sand Dollar", "Edible Sea Cucumber", "Eel", "Elephant Seal", "Elkhorn Coral", "Emperor Shrimp", "Estuarine Crocodile", "Fathead Sculpin", "Fiddler Crab", "Fin Whale", "Flameback", "Flamingo Tongue Snail", "Flashlight Fish", "Flatback Turtle", "Flatfish", "Flying Fish", "Flounder", "Fluke", "French Angelfish", "Frilled Shark", "Fugu (also called Pufferfish)", "Gar", "Geoduck", "Giant Barrel Sponge", "Giant Caribbean Sea Anemone", "Giant Clam", "Giant Isopod", "Giant Kingfish", "Giant Oarfish", "Giant Pacific Octopus", "Giant Pyrosome", "Giant Sea Star", "Giant Squid", "Glowing Sucker Octopus", "Giant Tube Worm", "Goblin Shark", "Goosefish", "Great White Shark", "Greenland Shark", "Grey Atlantic Seal", "Grouper", "Grunion", "Guineafowl Puffer", "Haddock", "Hake", "Halibut", "Hammerhead Shark", "Hapuka", "Harbor Porpoise", "Harbor Seal", "Hatchetfish", "Hawaiian Monk Seal", "Hawksbill Turtle", "Hector's Dolphin", "Hermit Crab", "Herring", "Hoki", "Horn Shark", "Horseshoe Crab", "Humpback Anglerfish", "Humpback Whale", "Icefish", "Imperator Angelfish", "Irukandji Jellyfish", "Isopod", "Ivory Bush Coral", "Japanese Spider Crab", "Jellyfish", "John Dory", "Juan Fernandez Fur Seal", "Killer Whale", "Kiwa Hirsuta", "Krill", "Lagoon Triggerfish", "Lamprey", "Leafy Seadragon", "Leopard Seal", "Limpet", "Ling", "Lionfish", "Lions Mane Jellyfish", "Lobe Coral", "Lobster", "Loggerhead Turtle", "Longnose Sawshark", "Longsnout Seahorse", "Lophelia Coral", "Marrus Orthocanna", "Manatee", "Manta Ray", "Marlin", "Megamouth Shark", "Mexican Lookdown", "Mimic Octopus", "Moon Jelly", "Mollusk", "Monkfish", "Moray Eel", "Mullet", "Mussel", "Megaladon", "Napoleon Wrasse", "Nassau Grouper", "Narwhal", "Nautilus", "Needlefish", "Northern Seahorse", "North Atlantic Right Whale", "Northern Red Snapper", "Norway Lobster", "Nudibranch", "Nurse Shark", "Oarfish", "Ocean Sunfish", "Oceanic Whitetip Shark", "Octopus", "Olive Sea Snake", "Orange Roughy", "Ostracod", "Otter", "Oyster", "Pacific Angelshark", "Pacific Blackdragon", "Pacific Halibut", "Pacific Sardine", "Pacific Sea Nettle Jellyfish", "Pacific White Sided Dolphin", "Pantropical Spotted Dolphin", "Patagonian Toothfish", "Peacock Mantis Shrimp", "Pelagic Thresher Shark", "Penguin", "Peruvian Anchoveta", "Pilchard", "Pink Salmon", "Pinniped", "Plankton", "Porpoise", "Polar Bear", "Portuguese Man o' War", "Pycnogonid Sea Spider", "Quahog", "Queen Angelfish", "Queen Conch", "Queen Parrotfish", "Queensland Grouper", "Ragfish", "Ratfish", "Rattail Fish", "Ray", "Red Drum", "Red King Crab", "Ringed Seal", "Risso's Dolphin", "Ross Seals", "Sablefish", "Salmon", "Sand Dollar", "Sandbar Shark", "Sawfish", "Sarcastic Fringehead", "Scalloped Hammerhead Shark", "Seahorse", "Sea Cucumber", "Sea Lion", "Sea Urchin", "Seal", "Shark", "Shortfin Mako Shark", "Shovelnose Guitarfish", "Shrimp", "Silverside Fish", "Skipjack Tuna", "Slender Snipe Eel", "Smalltooth Sawfish", "Smelts", "Sockeye Salmon", "Southern Stingray", "Sponge", "Spotted Porcupinefish", "Spotted Dolphin", "Spotted Eagle Ray", "Spotted Moray", "Squid", "Squidworm", "Starfish", "Stickleback", "Stonefish", "Stoplight Loosejaw", "Sturgeon", "Swordfish", "Tan Bristlemouth", "Tasseled Wobbegong", "Terrible Claw Lobster", "Threespot Damselfish", "Tiger Prawn", "Tiger Shark", "Tilefish", "Toadfish", "Tropical Two-Wing Flyfish", "Tuna", "Umbrella Squid", "Velvet Crab", "Venus Flytrap Sea Anemone", "Vigtorniella Worm", "Viperfish", "Vampire Squid", "Vaquita", "Wahoo", "Walrus", "West Indian Manatee", "Whale", "Whale Shark", "Whiptail Gulper", "White-Beaked Dolphin", "White-Ring Garden Eel", "White Shrimp", "Wobbegong", "Wrasse", "Wreckfish", "Xiphosura", "Yellowtail Damselfish", "Yelloweye Rockfish", "Yellow Cup Black Coral", "Yellow Tube Sponge", "Yellowfin Tuna", "Zebrashark", "Zooplankton"],
          "desert": ["Aardwolf", "Addax", "African Wild Ass", "Ant", "Antelope", "Armadillo", "Baboon", "Badger", "Bat", "Bearded Dragon", "Beetle", "Bird", "Black-footed Cat", "Boa", "Brown Bear", "Bustard", "Butterfly", "Camel", "Caracal", "Caracara", "Caterpillar", "Centipede", "Cheetah", "Chipmunk", "Chuckwalla", "Climbing Mouse", "Coati", "Cobra", "Cotton Rat", "Cougar", "Courser", "Crane Fly", "Crow", "Dassie Rat", "Dove", "Dunnart", "Eagle", "Echidna", "Elephant", "Emu", "Falcon", "Fly", "Fox", "Frogmouth", "Gecko", "Geoffroy's Cat", "Gerbil", "Grasshopper", "Guanaco", "Gundi", "Hamster", "Hawk", "Hedgehog", "Hyena", "Hyrax", "Jackal", "Kangaroo", "Kangaroo Rat", "Kestrel", "Kowari", "Kultarr", "Leopard", "Lion", "Macaw", "Meerkat", "Mouse", "Oryx", "Ostrich", "Owl", "Pronghorn", "Python", "Rabbit", "Raccoon", "Rattlesnake", "Rhinoceros", "Sand Cat", "Spectacled Bear", "Spiny Mouse", "Starling", "Stick Bug", "Tarantula", "Tit", "Toad", "Tortoise", "Tyrant Flycatcher", "Viper", "Vulture", "Waxwing", "Xerus", "Zebra"],
          "grassland": ["Aardvark", "Aardwolf", "Accentor", "African Buffalo", "African Wild Dog", "Alpaca", "Anaconda", "Ant", "Anteater", "Antelope", "Armadillo", "Baboon", "Badger", "Bandicoot", "Barbet", "Bat", "Bee", "Bee-eater", "Beetle", "Bird", "Bison", "Black-footed Cat", "Black-footed Ferret", "Bluebird", "Boa", "Bowerbird", "Brown Bear", "Bush Dog", "Bushshrike", "Bustard", "Butterfly", "Buzzard", "Caracal", "Caracara", "Cardinal", "Caterpillar", "Cheetah", "Chipmunk", "Civet", "Climbing Mouse", "Clouded Leopard", "Coati", "Cobra", "Cockatoo", "Cockroach", "Common Genet", "Cotton Rat", "Cougar", "Courser", "Coyote", "Crane", "Crane Fly", "Cricket", "Crow", "Culpeo", "Death Adder", "Deer", "Deer Mouse", "Dingo", "Dinosaur", "Dove", "Drongo", "Duck", "Duiker", "Dunnart", "Eagle", "Echidna", "Elephant", "Elk", "Emu", "Falcon", "Finch", "Flea", "Fly", "Flying Frog", "Fox", "Frog", "Frogmouth", "Garter Snake", "Gazelle", "Gecko", "Geoffroy's Cat", "Gerbil", "Giant Tortoise", "Giraffe", "Grasshopper", "Grison", "Groundhog", "Grouse", "Guanaco", "Guinea Pig", "Hamster", "Harrier", "Hartebeest", "Hawk", "Hedgehog", "Helmetshrike", "Hippopotamus", "Hornbill", "Hyena", "Hyrax", "Impala", "Jackal", "Jaguar", "Jaguarundi", "Kangaroo", "Kangaroo Rat", "Kestrel", "Kultarr", "Ladybug", "Leopard", "Lion", "Macaw", "Meerkat", "Mouse", "Newt", "Oryx", "Ostrich", "Owl", "Pangolin", "Pheasant", "Prairie Dog", "Pronghorn", "Przewalski's Horse", "Python", "Quoll", "Rabbit", "Raven", "Rhinoceros", "Shelduck", "Sloth Bear", "Spectacled Bear", "Squirrel", "Starling", "Stick Bug", "Tamandua", "Tasmanian Devil", "Thornbill", "Thrush", "Toad", "Tortoise"],
          "forest": ["Agouti", "Anaconda", "Anoa", "Ant", "Anteater", "Antelope", "Armadillo", "Asian Black Bear", "Aye-aye", "Babirusa", "Baboon", "Badger", "Bandicoot", "Banteng", "Barbet", "Basilisk", "Bat", "Bearded Dragon", "Bee", "Bee-eater", "Beetle", "Bettong", "Binturong", "Bird-of-paradise", "Bongo", "Bowerbird", "Bulbul", "Bush Dog", "Bushbaby", "Bushshrike", "Butterfly", "Buzzard", "Caecilian", "Cardinal", "Cassowary", "Caterpillar", "Centipede", "Chameleon", "Chimpanzee", "Cicada", "Civet", "Clouded Leopard", "Coati", "Cobra", "Cockatoo", "Cockroach", "Colugo", "Cotinga", "Cotton Rat", "Cougar", "Crane Fly", "Cricket", "Crocodile", "Crow", "Cuckoo", "Cuscus", "Death Adder", "Deer", "Dhole", "Dingo", "Dinosaur", "Drongo", "Duck", "Duiker", "Eagle", "Echidna", "Elephant", "Finch", "Flat-headed Cat", "Flea", "Flowerpecker", "Fly", "Flying Frog", "Fossa", "Frog", "Frogmouth", "Gaur", "Gecko", "Gorilla", "Grison", "Hawaiian Honeycreeper", "Hawk", "Hedgehog", "Helmetshrike", "Hornbill", "Hyrax", "Iguana", "Jackal", "Jaguar", "Jaguarundi", "Kestrel", "Ladybug", "Lemur", "Leopard", "Lion", "Macaw", "Mandrill", "Margay", "Monkey", "Mouse", "Mouse Deer", "Newt", "Okapi", "Old World Flycatcher", "Orangutan", "Owl", "Pangolin", "Peafowl", "Pheasant", "Possum", "Python", "Quokka", "Rabbit", "Raccoon", "Red Panda", "Red River Hog", "Rhinoceros", "Sloth Bear", "Spectacled Bear", "Squirrel", "Starling", "Stick Bug", "Sun Bear", "Tamandua", "Tamarin", "Tapir", "Tarantula", "Thrush", "Tiger", "Tit", "Toad", "Tortoise", "Toucan", "Trogon", "Trumpeter", "Turaco", "Turtle", "Tyrant Flycatcher", "Viper", "Vulture", "Wallaby", "Warbler", "Wasp", "Waxwing", "Weaver", "Weaver-finch", "Whistler", "White-eye", "Whydah", "Woodswallow", "Worm", "Wren", "Xenops", "Yellowjacket", "Accentor", "African Buffalo", "American Black Bear", "Anole", "Bird", "Bison", "Boa", "Brown Bear", "Chipmunk", "Common Genet", "Copperhead", "Coyote", "Deer Mouse", "Dormouse", "Elk", "Emu", "Fisher", "Fox", "Garter Snake", "Giant Panda", "Giant Tortoise", "Groundhog", "Grouse", "Guanaco", "Himalayan Tahr", "Kangaroo", "Koala", "Numbat", "Quoll", "Raccoon dog", "Tasmanian Devil", "Thornbill", "Turkey", "Vole", "Weasel", "Wildcat", "Wolf", "Wombat", "Woodchuck", "Woodpecker"],
          "farm": ["Alpaca", "Buffalo", "Banteng", "Cow", "Cat", "Chicken", "Carp", "Camel", "Donkey", "Dog", "Duck", "Emu", "Goat", "Gayal", "Guinea", "Goose", "Horse", "Honey", "Llama", "Pig", "Pigeon", "Rhea", "Rabbit", "Sheep", "Silkworm", "Turkey", "Yak", "Zebu"],
          "pet": ["Bearded Dragon", "Birds", "Burro", "Cats", "Chameleons", "Chickens", "Chinchillas", "Chinese Water Dragon", "Cows", "Dogs", "Donkey", "Ducks", "Ferrets", "Fish", "Geckos", "Geese", "Gerbils", "Goats", "Guinea Fowl", "Guinea Pigs", "Hamsters", "Hedgehogs", "Horses", "Iguanas", "Llamas", "Lizards", "Mice", "Mule", "Peafowl", "Pigs and Hogs", "Pigeons", "Ponies", "Pot Bellied Pig", "Rabbits", "Rats", "Sheep", "Skinks", "Snakes", "Stick Insects", "Sugar Gliders", "Tarantula", "Turkeys", "Turtles"],
          "zoo": ["Aardvark", "African Wild Dog", "Aldabra Tortoise", "American Alligator", "American Bison", "Amur Tiger", "Anaconda", "Andean Condor", "Asian Elephant", "Baby Doll Sheep", "Bald Eagle", "Barred Owl", "Blue Iguana", "Boer Goat", "California Sea Lion", "Caribbean Flamingo", "Chinchilla", "Collared Lemur", "Coquerel's Sifaka", "Cuban Amazon Parrot", "Ebony Langur", "Fennec Fox", "Fossa", "Gelada", "Giant Anteater", "Giraffe", "Gorilla", "Grizzly Bear", "Henkel's Leaf-tailed Gecko", "Indian Gharial", "Indian Rhinoceros", "King Cobra", "King Vulture", "Komodo Dragon", "Linne's Two-toed Sloth", "Lion", "Little Penguin", "Madagascar Tree Boa", "Magellanic Penguin", "Malayan Tapir", "Malayan Tiger", "Matschies Tree Kangaroo", "Mini Donkey", "Monarch Butterfly", "Nile crocodile", "North American Porcupine", "Nubian Ibex", "Okapi", "Poison Dart Frog", "Polar Bear", "Pygmy Marmoset", "Radiated Tortoise", "Red Panda", "Red Ruffed Lemur", "Ring-tailed Lemur", "Ring-tailed Mongoose", "Rock Hyrax", "Small Clawed Asian Otter", "Snow Leopard", "Snowy Owl", "Southern White-faced Owl", "Southern White Rhinocerous", "Squirrel Monkey", "Tufted Puffin", "White Cheeked Gibbon", "White-throated Bee Eater", "Zebra"]
        },
        primes: [
          2,
          3,
          5,
          7,
          11,
          13,
          17,
          19,
          23,
          29,
          31,
          37,
          41,
          43,
          47,
          53,
          59,
          61,
          67,
          71,
          73,
          79,
          83,
          89,
          97,
          101,
          103,
          107,
          109,
          113,
          127,
          131,
          137,
          139,
          149,
          151,
          157,
          163,
          167,
          173,
          179,
          181,
          191,
          193,
          197,
          199,
          211,
          223,
          227,
          229,
          233,
          239,
          241,
          251,
          257,
          263,
          269,
          271,
          277,
          281,
          283,
          293,
          307,
          311,
          313,
          317,
          331,
          337,
          347,
          349,
          353,
          359,
          367,
          373,
          379,
          383,
          389,
          397,
          401,
          409,
          419,
          421,
          431,
          433,
          439,
          443,
          449,
          457,
          461,
          463,
          467,
          479,
          487,
          491,
          499,
          503,
          509,
          521,
          523,
          541,
          547,
          557,
          563,
          569,
          571,
          577,
          587,
          593,
          599,
          601,
          607,
          613,
          617,
          619,
          631,
          641,
          643,
          647,
          653,
          659,
          661,
          673,
          677,
          683,
          691,
          701,
          709,
          719,
          727,
          733,
          739,
          743,
          751,
          757,
          761,
          769,
          773,
          787,
          797,
          809,
          811,
          821,
          823,
          827,
          829,
          839,
          853,
          857,
          859,
          863,
          877,
          881,
          883,
          887,
          907,
          911,
          919,
          929,
          937,
          941,
          947,
          953,
          967,
          971,
          977,
          983,
          991,
          997,
          1009,
          1013,
          1019,
          1021,
          1031,
          1033,
          1039,
          1049,
          1051,
          1061,
          1063,
          1069,
          1087,
          1091,
          1093,
          1097,
          1103,
          1109,
          1117,
          1123,
          1129,
          1151,
          1153,
          1163,
          1171,
          1181,
          1187,
          1193,
          1201,
          1213,
          1217,
          1223,
          1229,
          1231,
          1237,
          1249,
          1259,
          1277,
          1279,
          1283,
          1289,
          1291,
          1297,
          1301,
          1303,
          1307,
          1319,
          1321,
          1327,
          1361,
          1367,
          1373,
          1381,
          1399,
          1409,
          1423,
          1427,
          1429,
          1433,
          1439,
          1447,
          1451,
          1453,
          1459,
          1471,
          1481,
          1483,
          1487,
          1489,
          1493,
          1499,
          1511,
          1523,
          1531,
          1543,
          1549,
          1553,
          1559,
          1567,
          1571,
          1579,
          1583,
          1597,
          1601,
          1607,
          1609,
          1613,
          1619,
          1621,
          1627,
          1637,
          1657,
          1663,
          1667,
          1669,
          1693,
          1697,
          1699,
          1709,
          1721,
          1723,
          1733,
          1741,
          1747,
          1753,
          1759,
          1777,
          1783,
          1787,
          1789,
          1801,
          1811,
          1823,
          1831,
          1847,
          1861,
          1867,
          1871,
          1873,
          1877,
          1879,
          1889,
          1901,
          1907,
          1913,
          1931,
          1933,
          1949,
          1951,
          1973,
          1979,
          1987,
          1993,
          1997,
          1999,
          2003,
          2011,
          2017,
          2027,
          2029,
          2039,
          2053,
          2063,
          2069,
          2081,
          2083,
          2087,
          2089,
          2099,
          2111,
          2113,
          2129,
          2131,
          2137,
          2141,
          2143,
          2153,
          2161,
          2179,
          2203,
          2207,
          2213,
          2221,
          2237,
          2239,
          2243,
          2251,
          2267,
          2269,
          2273,
          2281,
          2287,
          2293,
          2297,
          2309,
          2311,
          2333,
          2339,
          2341,
          2347,
          2351,
          2357,
          2371,
          2377,
          2381,
          2383,
          2389,
          2393,
          2399,
          2411,
          2417,
          2423,
          2437,
          2441,
          2447,
          2459,
          2467,
          2473,
          2477,
          2503,
          2521,
          2531,
          2539,
          2543,
          2549,
          2551,
          2557,
          2579,
          2591,
          2593,
          2609,
          2617,
          2621,
          2633,
          2647,
          2657,
          2659,
          2663,
          2671,
          2677,
          2683,
          2687,
          2689,
          2693,
          2699,
          2707,
          2711,
          2713,
          2719,
          2729,
          2731,
          2741,
          2749,
          2753,
          2767,
          2777,
          2789,
          2791,
          2797,
          2801,
          2803,
          2819,
          2833,
          2837,
          2843,
          2851,
          2857,
          2861,
          2879,
          2887,
          2897,
          2903,
          2909,
          2917,
          2927,
          2939,
          2953,
          2957,
          2963,
          2969,
          2971,
          2999,
          3001,
          3011,
          3019,
          3023,
          3037,
          3041,
          3049,
          3061,
          3067,
          3079,
          3083,
          3089,
          3109,
          3119,
          3121,
          3137,
          3163,
          3167,
          3169,
          3181,
          3187,
          3191,
          3203,
          3209,
          3217,
          3221,
          3229,
          3251,
          3253,
          3257,
          3259,
          3271,
          3299,
          3301,
          3307,
          3313,
          3319,
          3323,
          3329,
          3331,
          3343,
          3347,
          3359,
          3361,
          3371,
          3373,
          3389,
          3391,
          3407,
          3413,
          3433,
          3449,
          3457,
          3461,
          3463,
          3467,
          3469,
          3491,
          3499,
          3511,
          3517,
          3527,
          3529,
          3533,
          3539,
          3541,
          3547,
          3557,
          3559,
          3571,
          3581,
          3583,
          3593,
          3607,
          3613,
          3617,
          3623,
          3631,
          3637,
          3643,
          3659,
          3671,
          3673,
          3677,
          3691,
          3697,
          3701,
          3709,
          3719,
          3727,
          3733,
          3739,
          3761,
          3767,
          3769,
          3779,
          3793,
          3797,
          3803,
          3821,
          3823,
          3833,
          3847,
          3851,
          3853,
          3863,
          3877,
          3881,
          3889,
          3907,
          3911,
          3917,
          3919,
          3923,
          3929,
          3931,
          3943,
          3947,
          3967,
          3989,
          4001,
          4003,
          4007,
          4013,
          4019,
          4021,
          4027,
          4049,
          4051,
          4057,
          4073,
          4079,
          4091,
          4093,
          4099,
          4111,
          4127,
          4129,
          4133,
          4139,
          4153,
          4157,
          4159,
          4177,
          4201,
          4211,
          4217,
          4219,
          4229,
          4231,
          4241,
          4243,
          4253,
          4259,
          4261,
          4271,
          4273,
          4283,
          4289,
          4297,
          4327,
          4337,
          4339,
          4349,
          4357,
          4363,
          4373,
          4391,
          4397,
          4409,
          4421,
          4423,
          4441,
          4447,
          4451,
          4457,
          4463,
          4481,
          4483,
          4493,
          4507,
          4513,
          4517,
          4519,
          4523,
          4547,
          4549,
          4561,
          4567,
          4583,
          4591,
          4597,
          4603,
          4621,
          4637,
          4639,
          4643,
          4649,
          4651,
          4657,
          4663,
          4673,
          4679,
          4691,
          4703,
          4721,
          4723,
          4729,
          4733,
          4751,
          4759,
          4783,
          4787,
          4789,
          4793,
          4799,
          4801,
          4813,
          4817,
          4831,
          4861,
          4871,
          4877,
          4889,
          4903,
          4909,
          4919,
          4931,
          4933,
          4937,
          4943,
          4951,
          4957,
          4967,
          4969,
          4973,
          4987,
          4993,
          4999,
          5003,
          5009,
          5011,
          5021,
          5023,
          5039,
          5051,
          5059,
          5077,
          5081,
          5087,
          5099,
          5101,
          5107,
          5113,
          5119,
          5147,
          5153,
          5167,
          5171,
          5179,
          5189,
          5197,
          5209,
          5227,
          5231,
          5233,
          5237,
          5261,
          5273,
          5279,
          5281,
          5297,
          5303,
          5309,
          5323,
          5333,
          5347,
          5351,
          5381,
          5387,
          5393,
          5399,
          5407,
          5413,
          5417,
          5419,
          5431,
          5437,
          5441,
          5443,
          5449,
          5471,
          5477,
          5479,
          5483,
          5501,
          5503,
          5507,
          5519,
          5521,
          5527,
          5531,
          5557,
          5563,
          5569,
          5573,
          5581,
          5591,
          5623,
          5639,
          5641,
          5647,
          5651,
          5653,
          5657,
          5659,
          5669,
          5683,
          5689,
          5693,
          5701,
          5711,
          5717,
          5737,
          5741,
          5743,
          5749,
          5779,
          5783,
          5791,
          5801,
          5807,
          5813,
          5821,
          5827,
          5839,
          5843,
          5849,
          5851,
          5857,
          5861,
          5867,
          5869,
          5879,
          5881,
          5897,
          5903,
          5923,
          5927,
          5939,
          5953,
          5981,
          5987,
          6007,
          6011,
          6029,
          6037,
          6043,
          6047,
          6053,
          6067,
          6073,
          6079,
          6089,
          6091,
          6101,
          6113,
          6121,
          6131,
          6133,
          6143,
          6151,
          6163,
          6173,
          6197,
          6199,
          6203,
          6211,
          6217,
          6221,
          6229,
          6247,
          6257,
          6263,
          6269,
          6271,
          6277,
          6287,
          6299,
          6301,
          6311,
          6317,
          6323,
          6329,
          6337,
          6343,
          6353,
          6359,
          6361,
          6367,
          6373,
          6379,
          6389,
          6397,
          6421,
          6427,
          6449,
          6451,
          6469,
          6473,
          6481,
          6491,
          6521,
          6529,
          6547,
          6551,
          6553,
          6563,
          6569,
          6571,
          6577,
          6581,
          6599,
          6607,
          6619,
          6637,
          6653,
          6659,
          6661,
          6673,
          6679,
          6689,
          6691,
          6701,
          6703,
          6709,
          6719,
          6733,
          6737,
          6761,
          6763,
          6779,
          6781,
          6791,
          6793,
          6803,
          6823,
          6827,
          6829,
          6833,
          6841,
          6857,
          6863,
          6869,
          6871,
          6883,
          6899,
          6907,
          6911,
          6917,
          6947,
          6949,
          6959,
          6961,
          6967,
          6971,
          6977,
          6983,
          6991,
          6997,
          7001,
          7013,
          7019,
          7027,
          7039,
          7043,
          7057,
          7069,
          7079,
          7103,
          7109,
          7121,
          7127,
          7129,
          7151,
          7159,
          7177,
          7187,
          7193,
          7207,
          7211,
          7213,
          7219,
          7229,
          7237,
          7243,
          7247,
          7253,
          7283,
          7297,
          7307,
          7309,
          7321,
          7331,
          7333,
          7349,
          7351,
          7369,
          7393,
          7411,
          7417,
          7433,
          7451,
          7457,
          7459,
          7477,
          7481,
          7487,
          7489,
          7499,
          7507,
          7517,
          7523,
          7529,
          7537,
          7541,
          7547,
          7549,
          7559,
          7561,
          7573,
          7577,
          7583,
          7589,
          7591,
          7603,
          7607,
          7621,
          7639,
          7643,
          7649,
          7669,
          7673,
          7681,
          7687,
          7691,
          7699,
          7703,
          7717,
          7723,
          7727,
          7741,
          7753,
          7757,
          7759,
          7789,
          7793,
          7817,
          7823,
          7829,
          7841,
          7853,
          7867,
          7873,
          7877,
          7879,
          7883,
          7901,
          7907,
          7919,
          7927,
          7933,
          7937,
          7949,
          7951,
          7963,
          7993,
          8009,
          8011,
          8017,
          8039,
          8053,
          8059,
          8069,
          8081,
          8087,
          8089,
          8093,
          8101,
          8111,
          8117,
          8123,
          8147,
          8161,
          8167,
          8171,
          8179,
          8191,
          8209,
          8219,
          8221,
          8231,
          8233,
          8237,
          8243,
          8263,
          8269,
          8273,
          8287,
          8291,
          8293,
          8297,
          8311,
          8317,
          8329,
          8353,
          8363,
          8369,
          8377,
          8387,
          8389,
          8419,
          8423,
          8429,
          8431,
          8443,
          8447,
          8461,
          8467,
          8501,
          8513,
          8521,
          8527,
          8537,
          8539,
          8543,
          8563,
          8573,
          8581,
          8597,
          8599,
          8609,
          8623,
          8627,
          8629,
          8641,
          8647,
          8663,
          8669,
          8677,
          8681,
          8689,
          8693,
          8699,
          8707,
          8713,
          8719,
          8731,
          8737,
          8741,
          8747,
          8753,
          8761,
          8779,
          8783,
          8803,
          8807,
          8819,
          8821,
          8831,
          8837,
          8839,
          8849,
          8861,
          8863,
          8867,
          8887,
          8893,
          8923,
          8929,
          8933,
          8941,
          8951,
          8963,
          8969,
          8971,
          8999,
          9001,
          9007,
          9011,
          9013,
          9029,
          9041,
          9043,
          9049,
          9059,
          9067,
          9091,
          9103,
          9109,
          9127,
          9133,
          9137,
          9151,
          9157,
          9161,
          9173,
          9181,
          9187,
          9199,
          9203,
          9209,
          9221,
          9227,
          9239,
          9241,
          9257,
          9277,
          9281,
          9283,
          9293,
          9311,
          9319,
          9323,
          9337,
          9341,
          9343,
          9349,
          9371,
          9377,
          9391,
          9397,
          9403,
          9413,
          9419,
          9421,
          9431,
          9433,
          9437,
          9439,
          9461,
          9463,
          9467,
          9473,
          9479,
          9491,
          9497,
          9511,
          9521,
          9533,
          9539,
          9547,
          9551,
          9587,
          9601,
          9613,
          9619,
          9623,
          9629,
          9631,
          9643,
          9649,
          9661,
          9677,
          9679,
          9689,
          9697,
          9719,
          9721,
          9733,
          9739,
          9743,
          9749,
          9767,
          9769,
          9781,
          9787,
          9791,
          9803,
          9811,
          9817,
          9829,
          9833,
          9839,
          9851,
          9857,
          9859,
          9871,
          9883,
          9887,
          9901,
          9907,
          9923,
          9929,
          9931,
          9941,
          9949,
          9967,
          9973,
          10007
        ],
        emotions: [
          "love",
          "joy",
          "surprise",
          "anger",
          "sadness",
          "fear"
        ]
      };
      var o_hasOwnProperty = Object.prototype.hasOwnProperty;
      var o_keys = Object.keys || function(obj) {
        var result = [];
        for (var key in obj) {
          if (o_hasOwnProperty.call(obj, key)) {
            result.push(key);
          }
        }
        return result;
      };
      function _copyObject(source, target) {
        var keys = o_keys(source);
        var key;
        for (var i = 0, l = keys.length; i < l; i++) {
          key = keys[i];
          target[key] = source[key] || target[key];
        }
      }
      function _copyArray(source, target) {
        for (var i = 0, l = source.length; i < l; i++) {
          target[i] = source[i];
        }
      }
      function copyObject(source, _target) {
        var isArray = Array.isArray(source);
        var target = _target || (isArray ? new Array(source.length) : {});
        if (isArray) {
          _copyArray(source, target);
        } else {
          _copyObject(source, target);
        }
        return target;
      }
      Chance2.prototype.get = function(name) {
        return copyObject(data[name]);
      };
      Chance2.prototype.mac_address = function(options) {
        options = initOptions(options);
        if (!options.separator) {
          options.separator = options.networkVersion ? "." : ":";
        }
        var mac_pool = "ABCDEF1234567890", mac = "";
        if (!options.networkVersion) {
          mac = this.n(this.string, 6, { pool: mac_pool, length: 2 }).join(options.separator);
        } else {
          mac = this.n(this.string, 3, { pool: mac_pool, length: 4 }).join(options.separator);
        }
        return mac;
      };
      Chance2.prototype.normal = function(options) {
        options = initOptions(options, { mean: 0, dev: 1, pool: [] });
        testRange(options.pool.constructor !== Array, "Chance: The pool option must be a valid array.");
        testRange(typeof options.mean !== "number", "Chance: Mean (mean) must be a number");
        testRange(typeof options.dev !== "number", "Chance: Standard deviation (dev) must be a number");
        if (options.pool.length > 0) {
          return this.normal_pool(options);
        }
        var s, u, v, norm, mean = options.mean, dev = options.dev;
        do {
          u = this.random() * 2 - 1;
          v = this.random() * 2 - 1;
          s = u * u + v * v;
        } while (s >= 1);
        norm = u * Math.sqrt(-2 * Math.log(s) / s);
        return dev * norm + mean;
      };
      Chance2.prototype.normal_pool = function(options) {
        var performanceCounter = 0;
        do {
          var idx = Math.round(this.normal({ mean: options.mean, dev: options.dev }));
          if (idx < options.pool.length && idx >= 0) {
            return options.pool[idx];
          } else {
            performanceCounter++;
          }
        } while (performanceCounter < 100);
        throw new RangeError("Chance: Your pool is too small for the given mean and standard deviation. Please adjust.");
      };
      Chance2.prototype.radio = function(options) {
        options = initOptions(options, { side: "?" });
        var fl = "";
        switch (options.side.toLowerCase()) {
          case "east":
          case "e":
            fl = "W";
            break;
          case "west":
          case "w":
            fl = "K";
            break;
          default:
            fl = this.character({ pool: "KW" });
            break;
        }
        return fl + this.character({ alpha: true, casing: "upper" }) + this.character({ alpha: true, casing: "upper" }) + this.character({ alpha: true, casing: "upper" });
      };
      Chance2.prototype.set = function(name, values) {
        if (typeof name === "string") {
          data[name] = values;
        } else {
          data = copyObject(name, data);
        }
      };
      Chance2.prototype.tv = function(options) {
        return this.radio(options);
      };
      Chance2.prototype.cnpj = function() {
        var n = this.n(this.natural, 8, { max: 9 });
        var d1 = 2 + n[7] * 6 + n[6] * 7 + n[5] * 8 + n[4] * 9 + n[3] * 2 + n[2] * 3 + n[1] * 4 + n[0] * 5;
        d1 = 11 - d1 % 11;
        if (d1 >= 10) {
          d1 = 0;
        }
        var d2 = d1 * 2 + 3 + n[7] * 7 + n[6] * 8 + n[5] * 9 + n[4] * 2 + n[3] * 3 + n[2] * 4 + n[1] * 5 + n[0] * 6;
        d2 = 11 - d2 % 11;
        if (d2 >= 10) {
          d2 = 0;
        }
        return "" + n[0] + n[1] + "." + n[2] + n[3] + n[4] + "." + n[5] + n[6] + n[7] + "/0001-" + d1 + d2;
      };
      Chance2.prototype.emotion = function() {
        return this.pick(this.get("emotions"));
      };
      Chance2.prototype.mersenne_twister = function(seed) {
        return new MersenneTwister(seed);
      };
      Chance2.prototype.blueimp_md5 = function() {
        return new BlueImpMD5();
      };
      var MersenneTwister = function(seed) {
        if (seed === void 0) {
          seed = Math.floor(Math.random() * Math.pow(10, 13));
        }
        this.N = 624;
        this.M = 397;
        this.MATRIX_A = 2567483615;
        this.UPPER_MASK = 2147483648;
        this.LOWER_MASK = 2147483647;
        this.mt = new Array(this.N);
        this.mti = this.N + 1;
        this.init_genrand(seed);
      };
      MersenneTwister.prototype.init_genrand = function(s) {
        this.mt[0] = s >>> 0;
        for (this.mti = 1; this.mti < this.N; this.mti++) {
          s = this.mt[this.mti - 1] ^ this.mt[this.mti - 1] >>> 30;
          this.mt[this.mti] = (((s & 4294901760) >>> 16) * 1812433253 << 16) + (s & 65535) * 1812433253 + this.mti;
          this.mt[this.mti] >>>= 0;
        }
      };
      MersenneTwister.prototype.init_by_array = function(init_key, key_length) {
        var i = 1, j = 0, k, s;
        this.init_genrand(19650218);
        k = this.N > key_length ? this.N : key_length;
        for (; k; k--) {
          s = this.mt[i - 1] ^ this.mt[i - 1] >>> 30;
          this.mt[i] = (this.mt[i] ^ (((s & 4294901760) >>> 16) * 1664525 << 16) + (s & 65535) * 1664525) + init_key[j] + j;
          this.mt[i] >>>= 0;
          i++;
          j++;
          if (i >= this.N) {
            this.mt[0] = this.mt[this.N - 1];
            i = 1;
          }
          if (j >= key_length) {
            j = 0;
          }
        }
        for (k = this.N - 1; k; k--) {
          s = this.mt[i - 1] ^ this.mt[i - 1] >>> 30;
          this.mt[i] = (this.mt[i] ^ (((s & 4294901760) >>> 16) * 1566083941 << 16) + (s & 65535) * 1566083941) - i;
          this.mt[i] >>>= 0;
          i++;
          if (i >= this.N) {
            this.mt[0] = this.mt[this.N - 1];
            i = 1;
          }
        }
        this.mt[0] = 2147483648;
      };
      MersenneTwister.prototype.genrand_int32 = function() {
        var y;
        var mag01 = new Array(0, this.MATRIX_A);
        if (this.mti >= this.N) {
          var kk;
          if (this.mti === this.N + 1) {
            this.init_genrand(5489);
          }
          for (kk = 0; kk < this.N - this.M; kk++) {
            y = this.mt[kk] & this.UPPER_MASK | this.mt[kk + 1] & this.LOWER_MASK;
            this.mt[kk] = this.mt[kk + this.M] ^ y >>> 1 ^ mag01[y & 1];
          }
          for (; kk < this.N - 1; kk++) {
            y = this.mt[kk] & this.UPPER_MASK | this.mt[kk + 1] & this.LOWER_MASK;
            this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ y >>> 1 ^ mag01[y & 1];
          }
          y = this.mt[this.N - 1] & this.UPPER_MASK | this.mt[0] & this.LOWER_MASK;
          this.mt[this.N - 1] = this.mt[this.M - 1] ^ y >>> 1 ^ mag01[y & 1];
          this.mti = 0;
        }
        y = this.mt[this.mti++];
        y ^= y >>> 11;
        y ^= y << 7 & 2636928640;
        y ^= y << 15 & 4022730752;
        y ^= y >>> 18;
        return y >>> 0;
      };
      MersenneTwister.prototype.genrand_int31 = function() {
        return this.genrand_int32() >>> 1;
      };
      MersenneTwister.prototype.genrand_real1 = function() {
        return this.genrand_int32() * (1 / 4294967295);
      };
      MersenneTwister.prototype.random = function() {
        return this.genrand_int32() * (1 / 4294967296);
      };
      MersenneTwister.prototype.genrand_real3 = function() {
        return (this.genrand_int32() + 0.5) * (1 / 4294967296);
      };
      MersenneTwister.prototype.genrand_res53 = function() {
        var a = this.genrand_int32() >>> 5, b = this.genrand_int32() >>> 6;
        return (a * 67108864 + b) * (1 / 9007199254740992);
      };
      var BlueImpMD5 = function() {
      };
      BlueImpMD5.prototype.VERSION = "1.0.1";
      BlueImpMD5.prototype.safe_add = function safe_add(x, y) {
        var lsw = (x & 65535) + (y & 65535), msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return msw << 16 | lsw & 65535;
      };
      BlueImpMD5.prototype.bit_roll = function(num, cnt) {
        return num << cnt | num >>> 32 - cnt;
      };
      BlueImpMD5.prototype.md5_cmn = function(q, a, b, x, s, t) {
        return this.safe_add(this.bit_roll(this.safe_add(this.safe_add(a, q), this.safe_add(x, t)), s), b);
      };
      BlueImpMD5.prototype.md5_ff = function(a, b, c, d, x, s, t) {
        return this.md5_cmn(b & c | ~b & d, a, b, x, s, t);
      };
      BlueImpMD5.prototype.md5_gg = function(a, b, c, d, x, s, t) {
        return this.md5_cmn(b & d | c & ~d, a, b, x, s, t);
      };
      BlueImpMD5.prototype.md5_hh = function(a, b, c, d, x, s, t) {
        return this.md5_cmn(b ^ c ^ d, a, b, x, s, t);
      };
      BlueImpMD5.prototype.md5_ii = function(a, b, c, d, x, s, t) {
        return this.md5_cmn(c ^ (b | ~d), a, b, x, s, t);
      };
      BlueImpMD5.prototype.binl_md5 = function(x, len) {
        x[len >> 5] |= 128 << len % 32;
        x[(len + 64 >>> 9 << 4) + 14] = len;
        var i, olda, oldb, oldc, oldd, a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
        for (i = 0; i < x.length; i += 16) {
          olda = a;
          oldb = b;
          oldc = c;
          oldd = d;
          a = this.md5_ff(a, b, c, d, x[i], 7, -680876936);
          d = this.md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
          c = this.md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
          b = this.md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
          a = this.md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
          d = this.md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
          c = this.md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
          b = this.md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
          a = this.md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
          d = this.md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
          c = this.md5_ff(c, d, a, b, x[i + 10], 17, -42063);
          b = this.md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
          a = this.md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
          d = this.md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
          c = this.md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
          b = this.md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
          a = this.md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
          d = this.md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
          c = this.md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
          b = this.md5_gg(b, c, d, a, x[i], 20, -373897302);
          a = this.md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
          d = this.md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
          c = this.md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
          b = this.md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
          a = this.md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
          d = this.md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
          c = this.md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
          b = this.md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
          a = this.md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
          d = this.md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
          c = this.md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
          b = this.md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
          a = this.md5_hh(a, b, c, d, x[i + 5], 4, -378558);
          d = this.md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
          c = this.md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
          b = this.md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
          a = this.md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
          d = this.md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
          c = this.md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
          b = this.md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
          a = this.md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
          d = this.md5_hh(d, a, b, c, x[i], 11, -358537222);
          c = this.md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
          b = this.md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
          a = this.md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
          d = this.md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
          c = this.md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
          b = this.md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
          a = this.md5_ii(a, b, c, d, x[i], 6, -198630844);
          d = this.md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
          c = this.md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
          b = this.md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
          a = this.md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
          d = this.md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
          c = this.md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
          b = this.md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
          a = this.md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
          d = this.md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
          c = this.md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
          b = this.md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
          a = this.md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
          d = this.md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
          c = this.md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
          b = this.md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
          a = this.safe_add(a, olda);
          b = this.safe_add(b, oldb);
          c = this.safe_add(c, oldc);
          d = this.safe_add(d, oldd);
        }
        return [a, b, c, d];
      };
      BlueImpMD5.prototype.binl2rstr = function(input) {
        var i, output = "";
        for (i = 0; i < input.length * 32; i += 8) {
          output += String.fromCharCode(input[i >> 5] >>> i % 32 & 255);
        }
        return output;
      };
      BlueImpMD5.prototype.rstr2binl = function(input) {
        var i, output = [];
        output[(input.length >> 2) - 1] = void 0;
        for (i = 0; i < output.length; i += 1) {
          output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
          output[i >> 5] |= (input.charCodeAt(i / 8) & 255) << i % 32;
        }
        return output;
      };
      BlueImpMD5.prototype.rstr_md5 = function(s) {
        return this.binl2rstr(this.binl_md5(this.rstr2binl(s), s.length * 8));
      };
      BlueImpMD5.prototype.rstr_hmac_md5 = function(key, data2) {
        var i, bkey = this.rstr2binl(key), ipad = [], opad = [], hash;
        ipad[15] = opad[15] = void 0;
        if (bkey.length > 16) {
          bkey = this.binl_md5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 909522486;
          opad[i] = bkey[i] ^ 1549556828;
        }
        hash = this.binl_md5(ipad.concat(this.rstr2binl(data2)), 512 + data2.length * 8);
        return this.binl2rstr(this.binl_md5(opad.concat(hash), 512 + 128));
      };
      BlueImpMD5.prototype.rstr2hex = function(input) {
        var hex_tab = "0123456789abcdef", output = "", x, i;
        for (i = 0; i < input.length; i += 1) {
          x = input.charCodeAt(i);
          output += hex_tab.charAt(x >>> 4 & 15) + hex_tab.charAt(x & 15);
        }
        return output;
      };
      BlueImpMD5.prototype.str2rstr_utf8 = function(input) {
        return unescape(encodeURIComponent(input));
      };
      BlueImpMD5.prototype.raw_md5 = function(s) {
        return this.rstr_md5(this.str2rstr_utf8(s));
      };
      BlueImpMD5.prototype.hex_md5 = function(s) {
        return this.rstr2hex(this.raw_md5(s));
      };
      BlueImpMD5.prototype.raw_hmac_md5 = function(k, d) {
        return this.rstr_hmac_md5(this.str2rstr_utf8(k), this.str2rstr_utf8(d));
      };
      BlueImpMD5.prototype.hex_hmac_md5 = function(k, d) {
        return this.rstr2hex(this.raw_hmac_md5(k, d));
      };
      BlueImpMD5.prototype.md5 = function(string, key, raw) {
        if (!key) {
          if (!raw) {
            return this.hex_md5(string);
          }
          return this.raw_md5(string);
        }
        if (!raw) {
          return this.hex_hmac_md5(key, string);
        }
        return this.raw_hmac_md5(key, string);
      };
      if (typeof exports !== "undefined") {
        if (typeof module !== "undefined" && module.exports) {
          exports = module.exports = Chance2;
        }
        exports.Chance = Chance2;
      }
      if (typeof define === "function" && define.amd) {
        define([], function() {
          return Chance2;
        });
      }
      if (typeof importScripts !== "undefined") {
        chance = new Chance2();
        self.Chance = Chance2;
      }
      if (typeof window === "object" && typeof window.document === "object") {
        window.Chance = Chance2;
        window.chance = new Chance2();
      }
    })();
  }
});

// server/.hathora/node_modules/utf8-buffer/dist/utf8-buffer.js
var require_utf8_buffer = __commonJS({
  "server/.hathora/node_modules/utf8-buffer/dist/utf8-buffer.js"(exports, module) {
    var $jscomp = $jscomp || {};
    $jscomp.scope = {};
    $jscomp.checkStringArgs = function(a, b, c) {
      if (a == null)
        throw new TypeError("The 'this' value for String.prototype." + c + " must not be null or undefined");
      if (b instanceof RegExp)
        throw new TypeError("First argument to String.prototype." + c + " must not be a regular expression");
      return a + "";
    };
    $jscomp.ASSUME_ES5 = false;
    $jscomp.ASSUME_NO_NATIVE_MAP = false;
    $jscomp.ASSUME_NO_NATIVE_SET = false;
    $jscomp.SIMPLE_FROUND_POLYFILL = false;
    $jscomp.defineProperty = $jscomp.ASSUME_ES5 || typeof Object.defineProperties == "function" ? Object.defineProperty : function(a, b, c) {
      a != Array.prototype && a != Object.prototype && (a[b] = c.value);
    };
    $jscomp.getGlobal = function(a) {
      return typeof window != "undefined" && window === a ? a : typeof global != "undefined" && global != null ? global : a;
    };
    $jscomp.global = $jscomp.getGlobal(exports);
    $jscomp.polyfill = function(a, b, c, d) {
      if (b) {
        c = $jscomp.global;
        a = a.split(".");
        for (d = 0; d < a.length - 1; d++) {
          var h = a[d];
          h in c || (c[h] = {});
          c = c[h];
        }
        a = a[a.length - 1];
        d = c[a];
        b = b(d);
        b != d && b != null && $jscomp.defineProperty(c, a, { configurable: true, writable: true, value: b });
      }
    };
    $jscomp.polyfill("String.prototype.codePointAt", function(a) {
      return a ? a : function(b) {
        var c = $jscomp.checkStringArgs(this, null, "codePointAt"), a2 = c.length;
        b = Number(b) || 0;
        if (0 <= b && b < a2) {
          b |= 0;
          var h = c.charCodeAt(b);
          if (55296 > h || 56319 < h || b + 1 === a2)
            return h;
          b = c.charCodeAt(b + 1);
          return 56320 > b || 57343 < b ? h : 1024 * (h - 55296) + b + 9216;
        }
      };
    }, "es6", "es3");
    (function(a, b) {
      typeof exports === "object" && typeof module !== "undefined" ? b(exports) : typeof define === "function" && define.amd ? define(["exports"], b) : (a = a || self, b(a.UTF8Buffer = {}));
    })(exports, function(a) {
      a.pack = function(b, a2, d) {
        d = d === void 0 ? 0 : d;
        for (var c = 0, k = b.length; c < k; c++) {
          var f = b.codePointAt(c);
          if (128 > f)
            a2[d] = f, d++;
          else {
            var g = 0, e = 0;
            2047 >= f ? (g = 1, e = 192) : 65535 >= f ? (g = 2, e = 224) : 1114111 >= f && (g = 3, e = 240, c++);
            a2[d] = (f >> 6 * g) + e;
            for (d++; 0 < g; )
              a2[d] = 128 | f >> 6 * (g - 1) & 63, d++, g--;
          }
        }
        return d;
      };
      a.unpack = function(b, a2, d) {
        d = d === void 0 ? b.length : d;
        var c = "";
        for (a2 = a2 === void 0 ? 0 : a2; a2 < d; ) {
          var k = 128, f = 191, g = false, e = b[a2++];
          if (0 <= e && 127 >= e)
            c += String.fromCharCode(e);
          else {
            var l = 0;
            194 <= e && 223 >= e ? l = 1 : 224 <= e && 239 >= e ? (l = 2, b[a2] === 224 && (k = 160), b[a2] === 237 && (f = 159)) : 240 <= e && 244 >= e ? (l = 3, b[a2] === 240 && (k = 144), b[a2] === 244 && (f = 143)) : g = true;
            e &= (1 << 8 - l - 1) - 1;
            for (var m = 0; m < l; m++) {
              if (b[a2] < k || b[a2] > f)
                g = true;
              e = e << 6 | b[a2] & 63;
              a2++;
            }
            g ? c += String.fromCharCode(65533) : 65535 >= e ? c += String.fromCharCode(e) : (e -= 65536, c += String.fromCharCode((e >> 10 & 1023) + 55296, (e & 1023) + 56320));
          }
        }
        return c;
      };
      Object.defineProperty(a, "__esModule", { value: true });
    });
  }
});

// server/.hathora/node_modules/utf8-buffer-size/dist/utf8-buffer-size.umd.js
var require_utf8_buffer_size_umd = __commonJS({
  "server/.hathora/node_modules/utf8-buffer-size/dist/utf8-buffer-size.umd.js"(exports, module) {
    String.prototype.codePointAt || function() {
      "use strict";
      var t = function() {
        try {
          var t2 = {}, e2 = Object.defineProperty, r = e2(t2, t2, t2) && e2;
        } catch (t3) {
        }
        return r;
      }(), e = function(t2) {
        if (this == null)
          throw TypeError();
        var e2 = String(this), r = e2.length, n = t2 ? Number(t2) : 0;
        if (n != n && (n = 0), !(n < 0 || n >= r)) {
          var o, i = e2.charCodeAt(n);
          return i >= 55296 && i <= 56319 && r > n + 1 && (o = e2.charCodeAt(n + 1)) >= 56320 && o <= 57343 ? 1024 * (i - 55296) + o - 56320 + 65536 : i;
        }
      };
      t ? t(String.prototype, "codePointAt", { value: e, configurable: true, writable: true }) : String.prototype.codePointAt = e;
    }(), function(t, e) {
      typeof exports == "object" && typeof module != "undefined" ? (module.exports = e(), module.exports.default = e()) : typeof define == "function" && define.amd ? define(e) : t.utf8BufferSize = e();
    }(exports, function() {
      "use strict";
      return function() {
        return function(t) {
          let e = 0;
          for (let r = 0, n = t.length; r < n; r++) {
            let n2 = t.codePointAt(r);
            n2 < 128 ? e++ : (n2 <= 2047 ? e++ : n2 <= 65535 ? e += 2 : n2 <= 1114111 && (r++, e += 3), e++);
          }
          return e;
        };
      }();
    });
  }
});

// server/.hathora/node_modules/bin-serde/lib/index.js
var require_lib = __commonJS({
  "server/.hathora/node_modules/bin-serde/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Reader = exports.Writer = void 0;
    var utf8 = require_utf8_buffer();
    var utf8_buffer_size_1 = require_utf8_buffer_size_umd();
    var { pack, unpack } = utf8.default ?? utf8;
    var Writer3 = class {
      pos = 0;
      view;
      bytes;
      constructor() {
        this.view = new DataView(new ArrayBuffer(64));
        this.bytes = new Uint8Array(this.view.buffer);
      }
      writeUInt8(val) {
        this.ensureSize(1);
        this.view.setUint8(this.pos, val);
        this.pos += 1;
        return this;
      }
      writeUInt32(val) {
        this.ensureSize(4);
        this.view.setUint32(this.pos, val);
        this.pos += 4;
        return this;
      }
      writeUInt64(val) {
        this.ensureSize(8);
        this.view.setBigUint64(this.pos, val);
        this.pos += 8;
        return this;
      }
      writeUVarint(val) {
        if (val < 128) {
          this.ensureSize(1);
          this.view.setUint8(this.pos, val);
          this.pos += 1;
        } else if (val < 16384) {
          this.ensureSize(2);
          this.view.setUint16(this.pos, val & 127 | (val & 16256) << 1 | 32768);
          this.pos += 2;
        } else if (val < 2097152) {
          this.ensureSize(3);
          this.view.setUint8(this.pos, val >> 14 | 128);
          this.view.setUint16(this.pos + 1, val & 127 | (val & 16256) << 1 | 32768);
          this.pos += 3;
        } else if (val < 268435456) {
          this.ensureSize(4);
          this.view.setUint32(this.pos, val & 127 | (val & 16256) << 1 | (val & 2080768) << 2 | (val & 266338304) << 3 | 2155905024);
          this.pos += 4;
        } else if (val < 34359738368) {
          this.ensureSize(5);
          this.view.setUint8(this.pos, Math.floor(val / Math.pow(2, 28)) | 128);
          this.view.setUint32(this.pos + 1, val & 127 | (val & 16256) << 1 | (val & 2080768) << 2 | (val & 266338304) << 3 | 2155905024);
          this.pos += 5;
        } else if (val < 4398046511104) {
          this.ensureSize(6);
          const shiftedVal = Math.floor(val / Math.pow(2, 28));
          this.view.setUint16(this.pos, shiftedVal & 127 | (shiftedVal & 16256) << 1 | 32896);
          this.view.setUint32(this.pos + 2, val & 127 | (val & 16256) << 1 | (val & 2080768) << 2 | (val & 266338304) << 3 | 2155905024);
          this.pos += 6;
        } else {
          throw new Error("Value out of range");
        }
        return this;
      }
      writeVarint(val) {
        const bigval = BigInt(val);
        this.writeUVarint(Number(bigval >> 63n ^ bigval << 1n));
        return this;
      }
      writeFloat(val) {
        this.ensureSize(4);
        this.view.setFloat32(this.pos, val, true);
        this.pos += 4;
        return this;
      }
      writeBits(bits) {
        for (let i = 0; i < bits.length; i += 8) {
          let byte = 0;
          for (let j = 0; j < 8; j++) {
            if (i + j == bits.length) {
              break;
            }
            byte |= (bits[i + j] ? 1 : 0) << j;
          }
          this.writeUInt8(byte);
        }
        return this;
      }
      writeString(val) {
        if (val.length > 0) {
          const byteSize = (0, utf8_buffer_size_1.default)(val);
          this.writeUVarint(byteSize);
          this.ensureSize(byteSize);
          pack(val, this.bytes, this.pos);
          this.pos += byteSize;
        } else {
          this.writeUInt8(0);
        }
        return this;
      }
      writeBuffer(buf) {
        this.ensureSize(buf.length);
        this.bytes.set(buf, this.pos);
        this.pos += buf.length;
        return this;
      }
      toBuffer() {
        return this.bytes.subarray(0, this.pos);
      }
      ensureSize(size) {
        while (this.view.byteLength < this.pos + size) {
          const newView = new DataView(new ArrayBuffer(this.view.byteLength * 2));
          const newBytes = new Uint8Array(newView.buffer);
          newBytes.set(this.bytes);
          this.view = newView;
          this.bytes = newBytes;
        }
      }
    };
    exports.Writer = Writer3;
    var Reader3 = class {
      pos = 0;
      view;
      bytes;
      constructor(buf) {
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        this.bytes = new Uint8Array(this.view.buffer, buf.byteOffset, buf.byteLength);
      }
      readUInt8() {
        const val = this.view.getUint8(this.pos);
        this.pos += 1;
        return val;
      }
      readUInt32() {
        const val = this.view.getUint32(this.pos);
        this.pos += 4;
        return val;
      }
      readUInt64() {
        const val = this.view.getBigUint64(this.pos);
        this.pos += 8;
        return val;
      }
      readUVarint() {
        let val = 0;
        while (true) {
          let byte = this.view.getUint8(this.pos++);
          if (byte < 128) {
            return val + byte;
          }
          val = (val + (byte & 127)) * 128;
        }
      }
      readVarint() {
        const val = BigInt(this.readUVarint());
        return Number(val >> 1n ^ -(val & 1n));
      }
      readFloat() {
        const val = this.view.getFloat32(this.pos, true);
        this.pos += 4;
        return val;
      }
      readBits(numBits) {
        const numBytes = Math.ceil(numBits / 8);
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        const bits = [];
        for (const byte of bytes) {
          for (let i = 0; i < 8 && bits.length < numBits; i++) {
            bits.push((byte >> i & 1) === 1);
          }
        }
        this.pos += numBytes;
        return bits;
      }
      readString() {
        const len = this.readUVarint();
        if (len === 0) {
          return "";
        }
        const val = unpack(this.bytes, this.pos, this.pos + len);
        this.pos += len;
        return val;
      }
      readBuffer(numBytes) {
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        this.pos += numBytes;
        return bytes;
      }
      remaining() {
        return this.view.byteLength - this.pos;
      }
    };
    exports.Reader = Reader3;
  }
});

// api/node_modules/axios/lib/helpers/bind.js
var require_bind = __commonJS({
  "api/node_modules/axios/lib/helpers/bind.js"(exports, module) {
    "use strict";
    module.exports = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };
  }
});

// api/node_modules/axios/lib/utils.js
var require_utils = __commonJS({
  "api/node_modules/axios/lib/utils.js"(exports, module) {
    "use strict";
    var bind = require_bind();
    var toString2 = Object.prototype.toString;
    function isArray(val) {
      return toString2.call(val) === "[object Array]";
    }
    function isUndefined(val) {
      return typeof val === "undefined";
    }
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && typeof val.constructor.isBuffer === "function" && val.constructor.isBuffer(val);
    }
    function isArrayBuffer(val) {
      return toString2.call(val) === "[object ArrayBuffer]";
    }
    function isFormData(val) {
      return typeof FormData !== "undefined" && val instanceof FormData;
    }
    function isArrayBufferView(val) {
      var result;
      if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
        result = ArrayBuffer.isView(val);
      } else {
        result = val && val.buffer && val.buffer instanceof ArrayBuffer;
      }
      return result;
    }
    function isString(val) {
      return typeof val === "string";
    }
    function isNumber(val) {
      return typeof val === "number";
    }
    function isObject2(val) {
      return val !== null && typeof val === "object";
    }
    function isPlainObject(val) {
      if (toString2.call(val) !== "[object Object]") {
        return false;
      }
      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }
    function isDate(val) {
      return toString2.call(val) === "[object Date]";
    }
    function isFile(val) {
      return toString2.call(val) === "[object File]";
    }
    function isBlob(val) {
      return toString2.call(val) === "[object Blob]";
    }
    function isFunction(val) {
      return toString2.call(val) === "[object Function]";
    }
    function isStream(val) {
      return isObject2(val) && isFunction(val.pipe);
    }
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== "undefined" && val instanceof URLSearchParams;
    }
    function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
    }
    function isStandardBrowserEnv() {
      if (typeof navigator !== "undefined" && (navigator.product === "ReactNative" || navigator.product === "NativeScript" || navigator.product === "NS")) {
        return false;
      }
      return typeof window !== "undefined" && typeof document !== "undefined";
    }
    function forEach(obj, fn) {
      if (obj === null || typeof obj === "undefined") {
        return;
      }
      if (typeof obj !== "object") {
        obj = [obj];
      }
      if (isArray(obj)) {
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }
    function merge() {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }
      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === "function") {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }
    function stripBOM(content) {
      if (content.charCodeAt(0) === 65279) {
        content = content.slice(1);
      }
      return content;
    }
    module.exports = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString,
      isNumber,
      isObject: isObject2,
      isPlainObject,
      isUndefined,
      isDate,
      isFile,
      isBlob,
      isFunction,
      isStream,
      isURLSearchParams,
      isStandardBrowserEnv,
      forEach,
      merge,
      extend,
      trim,
      stripBOM
    };
  }
});

// api/node_modules/axios/lib/helpers/buildURL.js
var require_buildURL = __commonJS({
  "api/node_modules/axios/lib/helpers/buildURL.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    function encode(val) {
      return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
    }
    module.exports = function buildURL(url, params, paramsSerializer) {
      if (!params) {
        return url;
      }
      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];
        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === "undefined") {
            return;
          }
          if (utils.isArray(val)) {
            key = key + "[]";
          } else {
            val = [val];
          }
          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + "=" + encode(v));
          });
        });
        serializedParams = parts.join("&");
      }
      if (serializedParams) {
        var hashmarkIndex = url.indexOf("#");
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
      }
      return url;
    };
  }
});

// api/node_modules/axios/lib/core/InterceptorManager.js
var require_InterceptorManager = __commonJS({
  "api/node_modules/axios/lib/core/InterceptorManager.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    function InterceptorManager() {
      this.handlers = [];
    }
    InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled,
        rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    };
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };
    module.exports = InterceptorManager;
  }
});

// api/node_modules/axios/lib/helpers/normalizeHeaderName.js
var require_normalizeHeaderName = __commonJS({
  "api/node_modules/axios/lib/helpers/normalizeHeaderName.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    module.exports = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };
  }
});

// api/node_modules/axios/lib/core/enhanceError.js
var require_enhanceError = __commonJS({
  "api/node_modules/axios/lib/core/enhanceError.js"(exports, module) {
    "use strict";
    module.exports = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }
      error.request = request;
      error.response = response;
      error.isAxiosError = true;
      error.toJSON = function toJSON() {
        return {
          message: this.message,
          name: this.name,
          description: this.description,
          number: this.number,
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          config: this.config,
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      };
      return error;
    };
  }
});

// api/node_modules/axios/lib/core/createError.js
var require_createError = __commonJS({
  "api/node_modules/axios/lib/core/createError.js"(exports, module) {
    "use strict";
    var enhanceError = require_enhanceError();
    module.exports = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };
  }
});

// api/node_modules/axios/lib/core/settle.js
var require_settle = __commonJS({
  "api/node_modules/axios/lib/core/settle.js"(exports, module) {
    "use strict";
    var createError = require_createError();
    module.exports = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError("Request failed with status code " + response.status, response.config, null, response.request, response));
      }
    };
  }
});

// api/node_modules/axios/lib/helpers/cookies.js
var require_cookies = __commonJS({
  "api/node_modules/axios/lib/helpers/cookies.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    module.exports = utils.isStandardBrowserEnv() ? function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path2, domain, secure) {
          var cookie = [];
          cookie.push(name + "=" + encodeURIComponent(value));
          if (utils.isNumber(expires)) {
            cookie.push("expires=" + new Date(expires).toGMTString());
          }
          if (utils.isString(path2)) {
            cookie.push("path=" + path2);
          }
          if (utils.isString(domain)) {
            cookie.push("domain=" + domain);
          }
          if (secure === true) {
            cookie.push("secure");
          }
          document.cookie = cookie.join("; ");
        },
        read: function read(name) {
          var match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
          return match ? decodeURIComponent(match[3]) : null;
        },
        remove: function remove(name) {
          this.write(name, "", Date.now() - 864e5);
        }
      };
    }() : function nonStandardBrowserEnv() {
      return {
        write: function write() {
        },
        read: function read() {
          return null;
        },
        remove: function remove() {
        }
      };
    }();
  }
});

// api/node_modules/axios/lib/helpers/isAbsoluteURL.js
var require_isAbsoluteURL = __commonJS({
  "api/node_modules/axios/lib/helpers/isAbsoluteURL.js"(exports, module) {
    "use strict";
    module.exports = function isAbsoluteURL(url) {
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };
  }
});

// api/node_modules/axios/lib/helpers/combineURLs.js
var require_combineURLs = __commonJS({
  "api/node_modules/axios/lib/helpers/combineURLs.js"(exports, module) {
    "use strict";
    module.exports = function combineURLs(baseURL, relativeURL) {
      return relativeURL ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
    };
  }
});

// api/node_modules/axios/lib/core/buildFullPath.js
var require_buildFullPath = __commonJS({
  "api/node_modules/axios/lib/core/buildFullPath.js"(exports, module) {
    "use strict";
    var isAbsoluteURL = require_isAbsoluteURL();
    var combineURLs = require_combineURLs();
    module.exports = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };
  }
});

// api/node_modules/axios/lib/helpers/parseHeaders.js
var require_parseHeaders = __commonJS({
  "api/node_modules/axios/lib/helpers/parseHeaders.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var ignoreDuplicateOf = [
      "age",
      "authorization",
      "content-length",
      "content-type",
      "etag",
      "expires",
      "from",
      "host",
      "if-modified-since",
      "if-unmodified-since",
      "last-modified",
      "location",
      "max-forwards",
      "proxy-authorization",
      "referer",
      "retry-after",
      "user-agent"
    ];
    module.exports = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;
      if (!headers) {
        return parsed;
      }
      utils.forEach(headers.split("\n"), function parser(line) {
        i = line.indexOf(":");
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));
        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === "set-cookie") {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
          }
        }
      });
      return parsed;
    };
  }
});

// api/node_modules/axios/lib/helpers/isURLSameOrigin.js
var require_isURLSameOrigin = __commonJS({
  "api/node_modules/axios/lib/helpers/isURLSameOrigin.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    module.exports = utils.isStandardBrowserEnv() ? function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement("a");
      var originURL;
      function resolveURL(url) {
        var href = url;
        if (msie) {
          urlParsingNode.setAttribute("href", href);
          href = urlParsingNode.href;
        }
        urlParsingNode.setAttribute("href", href);
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: urlParsingNode.pathname.charAt(0) === "/" ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
        };
      }
      originURL = resolveURL(window.location.href);
      return function isURLSameOrigin(requestURL) {
        var parsed = utils.isString(requestURL) ? resolveURL(requestURL) : requestURL;
        return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
      };
    }() : function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    }();
  }
});

// api/node_modules/axios/lib/cancel/Cancel.js
var require_Cancel = __commonJS({
  "api/node_modules/axios/lib/cancel/Cancel.js"(exports, module) {
    "use strict";
    function Cancel(message) {
      this.message = message;
    }
    Cancel.prototype.toString = function toString2() {
      return "Cancel" + (this.message ? ": " + this.message : "");
    };
    Cancel.prototype.__CANCEL__ = true;
    module.exports = Cancel;
  }
});

// api/node_modules/axios/lib/adapters/xhr.js
var require_xhr = __commonJS({
  "api/node_modules/axios/lib/adapters/xhr.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var settle = require_settle();
    var cookies = require_cookies();
    var buildURL = require_buildURL();
    var buildFullPath = require_buildFullPath();
    var parseHeaders = require_parseHeaders();
    var isURLSameOrigin = require_isURLSameOrigin();
    var createError = require_createError();
    var defaults = require_defaults();
    var Cancel = require_Cancel();
    module.exports = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        var responseType = config.responseType;
        var onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }
          if (config.signal) {
            config.signal.removeEventListener("abort", onCanceled);
          }
        }
        if (utils.isFormData(requestData)) {
          delete requestHeaders["Content-Type"];
        }
        var request = new XMLHttpRequest();
        if (config.auth) {
          var username = config.auth.username || "";
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : "";
          requestHeaders.Authorization = "Basic " + btoa(username + ":" + password);
        }
        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);
        request.timeout = config.timeout;
        function onloadend() {
          if (!request) {
            return;
          }
          var responseHeaders = "getAllResponseHeaders" in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request
          };
          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);
          request = null;
        }
        if ("onloadend" in request) {
          request.onloadend = onloadend;
        } else {
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
              return;
            }
            setTimeout(onloadend);
          };
        }
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }
          reject(createError("Request aborted", config, "ECONNABORTED", request));
          request = null;
        };
        request.onerror = function handleError() {
          reject(createError("Network Error", config, null, request));
          request = null;
        };
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = config.timeout ? "timeout of " + config.timeout + "ms exceeded" : "timeout exceeded";
          var transitional = config.transitional || defaults.transitional;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, transitional.clarifyTimeoutError ? "ETIMEDOUT" : "ECONNABORTED", request));
          request = null;
        };
        if (utils.isStandardBrowserEnv()) {
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ? cookies.read(config.xsrfCookieName) : void 0;
          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }
        if ("setRequestHeader" in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === "undefined" && key.toLowerCase() === "content-type") {
              delete requestHeaders[key];
            } else {
              request.setRequestHeader(key, val);
            }
          });
        }
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }
        if (responseType && responseType !== "json") {
          request.responseType = config.responseType;
        }
        if (typeof config.onDownloadProgress === "function") {
          request.addEventListener("progress", config.onDownloadProgress);
        }
        if (typeof config.onUploadProgress === "function" && request.upload) {
          request.upload.addEventListener("progress", config.onUploadProgress);
        }
        if (config.cancelToken || config.signal) {
          onCanceled = function(cancel) {
            if (!request) {
              return;
            }
            reject(!cancel || cancel && cancel.type ? new Cancel("canceled") : cancel);
            request.abort();
            request = null;
          };
          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener("abort", onCanceled);
          }
        }
        if (!requestData) {
          requestData = null;
        }
        request.send(requestData);
      });
    };
  }
});

// api/node_modules/follow-redirects/debug.js
var require_debug = __commonJS({
  "api/node_modules/follow-redirects/debug.js"(exports, module) {
    var debug;
    module.exports = function() {
      if (!debug) {
        try {
          debug = __require("debug")("follow-redirects");
        } catch (error) {
        }
        if (typeof debug !== "function") {
          debug = function() {
          };
        }
      }
      debug.apply(null, arguments);
    };
  }
});

// api/node_modules/follow-redirects/index.js
var require_follow_redirects = __commonJS({
  "api/node_modules/follow-redirects/index.js"(exports, module) {
    var url = __require("url");
    var URL = url.URL;
    var http = __require("http");
    var https = __require("https");
    var Writable = __require("stream").Writable;
    var assert = __require("assert");
    var debug = require_debug();
    var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
    var eventHandlers = /* @__PURE__ */ Object.create(null);
    events.forEach(function(event) {
      eventHandlers[event] = function(arg1, arg2, arg3) {
        this._redirectable.emit(event, arg1, arg2, arg3);
      };
    });
    var RedirectionError = createErrorType("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed");
    var TooManyRedirectsError = createErrorType("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded");
    var MaxBodyLengthExceededError = createErrorType("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit");
    var WriteAfterEndError = createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
    function RedirectableRequest(options, responseCallback) {
      Writable.call(this);
      this._sanitizeOptions(options);
      this._options = options;
      this._ended = false;
      this._ending = false;
      this._redirectCount = 0;
      this._redirects = [];
      this._requestBodyLength = 0;
      this._requestBodyBuffers = [];
      if (responseCallback) {
        this.on("response", responseCallback);
      }
      var self2 = this;
      this._onNativeResponse = function(response) {
        self2._processResponse(response);
      };
      this._performRequest();
    }
    RedirectableRequest.prototype = Object.create(Writable.prototype);
    RedirectableRequest.prototype.abort = function() {
      abortRequest(this._currentRequest);
      this.emit("abort");
    };
    RedirectableRequest.prototype.write = function(data, encoding, callback) {
      if (this._ending) {
        throw new WriteAfterEndError();
      }
      if (!(typeof data === "string" || typeof data === "object" && "length" in data)) {
        throw new TypeError("data should be a string, Buffer or Uint8Array");
      }
      if (typeof encoding === "function") {
        callback = encoding;
        encoding = null;
      }
      if (data.length === 0) {
        if (callback) {
          callback();
        }
        return;
      }
      if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
        this._requestBodyLength += data.length;
        this._requestBodyBuffers.push({ data, encoding });
        this._currentRequest.write(data, encoding, callback);
      } else {
        this.emit("error", new MaxBodyLengthExceededError());
        this.abort();
      }
    };
    RedirectableRequest.prototype.end = function(data, encoding, callback) {
      if (typeof data === "function") {
        callback = data;
        data = encoding = null;
      } else if (typeof encoding === "function") {
        callback = encoding;
        encoding = null;
      }
      if (!data) {
        this._ended = this._ending = true;
        this._currentRequest.end(null, null, callback);
      } else {
        var self2 = this;
        var currentRequest = this._currentRequest;
        this.write(data, encoding, function() {
          self2._ended = true;
          currentRequest.end(null, null, callback);
        });
        this._ending = true;
      }
    };
    RedirectableRequest.prototype.setHeader = function(name, value) {
      this._options.headers[name] = value;
      this._currentRequest.setHeader(name, value);
    };
    RedirectableRequest.prototype.removeHeader = function(name) {
      delete this._options.headers[name];
      this._currentRequest.removeHeader(name);
    };
    RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
      var self2 = this;
      function destroyOnTimeout(socket) {
        socket.setTimeout(msecs);
        socket.removeListener("timeout", socket.destroy);
        socket.addListener("timeout", socket.destroy);
      }
      function startTimer(socket) {
        if (self2._timeout) {
          clearTimeout(self2._timeout);
        }
        self2._timeout = setTimeout(function() {
          self2.emit("timeout");
          clearTimer();
        }, msecs);
        destroyOnTimeout(socket);
      }
      function clearTimer() {
        if (self2._timeout) {
          clearTimeout(self2._timeout);
          self2._timeout = null;
        }
        self2.removeListener("abort", clearTimer);
        self2.removeListener("error", clearTimer);
        self2.removeListener("response", clearTimer);
        if (callback) {
          self2.removeListener("timeout", callback);
        }
        if (!self2.socket) {
          self2._currentRequest.removeListener("socket", startTimer);
        }
      }
      if (callback) {
        this.on("timeout", callback);
      }
      if (this.socket) {
        startTimer(this.socket);
      } else {
        this._currentRequest.once("socket", startTimer);
      }
      this.on("socket", destroyOnTimeout);
      this.on("abort", clearTimer);
      this.on("error", clearTimer);
      this.on("response", clearTimer);
      return this;
    };
    [
      "flushHeaders",
      "getHeader",
      "setNoDelay",
      "setSocketKeepAlive"
    ].forEach(function(method) {
      RedirectableRequest.prototype[method] = function(a, b) {
        return this._currentRequest[method](a, b);
      };
    });
    ["aborted", "connection", "socket"].forEach(function(property) {
      Object.defineProperty(RedirectableRequest.prototype, property, {
        get: function() {
          return this._currentRequest[property];
        }
      });
    });
    RedirectableRequest.prototype._sanitizeOptions = function(options) {
      if (!options.headers) {
        options.headers = {};
      }
      if (options.host) {
        if (!options.hostname) {
          options.hostname = options.host;
        }
        delete options.host;
      }
      if (!options.pathname && options.path) {
        var searchPos = options.path.indexOf("?");
        if (searchPos < 0) {
          options.pathname = options.path;
        } else {
          options.pathname = options.path.substring(0, searchPos);
          options.search = options.path.substring(searchPos);
        }
      }
    };
    RedirectableRequest.prototype._performRequest = function() {
      var protocol = this._options.protocol;
      var nativeProtocol = this._options.nativeProtocols[protocol];
      if (!nativeProtocol) {
        this.emit("error", new TypeError("Unsupported protocol " + protocol));
        return;
      }
      if (this._options.agents) {
        var scheme = protocol.slice(0, -1);
        this._options.agent = this._options.agents[scheme];
      }
      var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
      request._redirectable = this;
      for (var event of events) {
        request.on(event, eventHandlers[event]);
      }
      this._currentUrl = /^\//.test(this._options.path) ? url.format(this._options) : this._currentUrl = this._options.path;
      if (this._isRedirect) {
        var i = 0;
        var self2 = this;
        var buffers = this._requestBodyBuffers;
        (function writeNext(error) {
          if (request === self2._currentRequest) {
            if (error) {
              self2.emit("error", error);
            } else if (i < buffers.length) {
              var buffer = buffers[i++];
              if (!request.finished) {
                request.write(buffer.data, buffer.encoding, writeNext);
              }
            } else if (self2._ended) {
              request.end();
            }
          }
        })();
      }
    };
    RedirectableRequest.prototype._processResponse = function(response) {
      var statusCode = response.statusCode;
      if (this._options.trackRedirects) {
        this._redirects.push({
          url: this._currentUrl,
          headers: response.headers,
          statusCode
        });
      }
      var location = response.headers.location;
      if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
        response.responseUrl = this._currentUrl;
        response.redirects = this._redirects;
        this.emit("response", response);
        this._requestBodyBuffers = [];
        return;
      }
      abortRequest(this._currentRequest);
      response.destroy();
      if (++this._redirectCount > this._options.maxRedirects) {
        this.emit("error", new TooManyRedirectsError());
        return;
      }
      var requestHeaders;
      var beforeRedirect = this._options.beforeRedirect;
      if (beforeRedirect) {
        requestHeaders = Object.assign({
          Host: response.req.getHeader("host")
        }, this._options.headers);
      }
      var method = this._options.method;
      if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
        this._options.method = "GET";
        this._requestBodyBuffers = [];
        removeMatchingHeaders(/^content-/i, this._options.headers);
      }
      var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
      var currentUrlParts = url.parse(this._currentUrl);
      var currentHost = currentHostHeader || currentUrlParts.host;
      var currentUrl = /^\w+:/.test(location) ? this._currentUrl : url.format(Object.assign(currentUrlParts, { host: currentHost }));
      var redirectUrl;
      try {
        redirectUrl = url.resolve(currentUrl, location);
      } catch (cause) {
        this.emit("error", new RedirectionError(cause));
        return;
      }
      debug("redirecting to", redirectUrl);
      this._isRedirect = true;
      var redirectUrlParts = url.parse(redirectUrl);
      Object.assign(this._options, redirectUrlParts);
      if (redirectUrlParts.protocol !== currentUrlParts.protocol && redirectUrlParts.protocol !== "https:" || redirectUrlParts.host !== currentHost && !isSubdomain(redirectUrlParts.host, currentHost)) {
        removeMatchingHeaders(/^(?:authorization|cookie)$/i, this._options.headers);
      }
      if (typeof beforeRedirect === "function") {
        var responseDetails = {
          headers: response.headers,
          statusCode
        };
        var requestDetails = {
          url: currentUrl,
          method,
          headers: requestHeaders
        };
        try {
          beforeRedirect(this._options, responseDetails, requestDetails);
        } catch (err) {
          this.emit("error", err);
          return;
        }
        this._sanitizeOptions(this._options);
      }
      try {
        this._performRequest();
      } catch (cause) {
        this.emit("error", new RedirectionError(cause));
      }
    };
    function wrap(protocols) {
      var exports2 = {
        maxRedirects: 21,
        maxBodyLength: 10 * 1024 * 1024
      };
      var nativeProtocols = {};
      Object.keys(protocols).forEach(function(scheme) {
        var protocol = scheme + ":";
        var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
        var wrappedProtocol = exports2[scheme] = Object.create(nativeProtocol);
        function request(input, options, callback) {
          if (typeof input === "string") {
            var urlStr = input;
            try {
              input = urlToOptions(new URL(urlStr));
            } catch (err) {
              input = url.parse(urlStr);
            }
          } else if (URL && input instanceof URL) {
            input = urlToOptions(input);
          } else {
            callback = options;
            options = input;
            input = { protocol };
          }
          if (typeof options === "function") {
            callback = options;
            options = null;
          }
          options = Object.assign({
            maxRedirects: exports2.maxRedirects,
            maxBodyLength: exports2.maxBodyLength
          }, input, options);
          options.nativeProtocols = nativeProtocols;
          assert.equal(options.protocol, protocol, "protocol mismatch");
          debug("options", options);
          return new RedirectableRequest(options, callback);
        }
        function get(input, options, callback) {
          var wrappedRequest = wrappedProtocol.request(input, options, callback);
          wrappedRequest.end();
          return wrappedRequest;
        }
        Object.defineProperties(wrappedProtocol, {
          request: { value: request, configurable: true, enumerable: true, writable: true },
          get: { value: get, configurable: true, enumerable: true, writable: true }
        });
      });
      return exports2;
    }
    function noop() {
    }
    function urlToOptions(urlObject) {
      var options = {
        protocol: urlObject.protocol,
        hostname: urlObject.hostname.startsWith("[") ? urlObject.hostname.slice(1, -1) : urlObject.hostname,
        hash: urlObject.hash,
        search: urlObject.search,
        pathname: urlObject.pathname,
        path: urlObject.pathname + urlObject.search,
        href: urlObject.href
      };
      if (urlObject.port !== "") {
        options.port = Number(urlObject.port);
      }
      return options;
    }
    function removeMatchingHeaders(regex, headers) {
      var lastValue;
      for (var header in headers) {
        if (regex.test(header)) {
          lastValue = headers[header];
          delete headers[header];
        }
      }
      return lastValue === null || typeof lastValue === "undefined" ? void 0 : String(lastValue).trim();
    }
    function createErrorType(code, defaultMessage) {
      function CustomError(cause) {
        Error.captureStackTrace(this, this.constructor);
        if (!cause) {
          this.message = defaultMessage;
        } else {
          this.message = defaultMessage + ": " + cause.message;
          this.cause = cause;
        }
      }
      CustomError.prototype = new Error();
      CustomError.prototype.constructor = CustomError;
      CustomError.prototype.name = "Error [" + code + "]";
      CustomError.prototype.code = code;
      return CustomError;
    }
    function abortRequest(request) {
      for (var event of events) {
        request.removeListener(event, eventHandlers[event]);
      }
      request.on("error", noop);
      request.abort();
    }
    function isSubdomain(subdomain, domain) {
      const dot = subdomain.length - domain.length - 1;
      return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
    }
    module.exports = wrap({ http, https });
    module.exports.wrap = wrap;
  }
});

// api/node_modules/axios/lib/env/data.js
var require_data = __commonJS({
  "api/node_modules/axios/lib/env/data.js"(exports, module) {
    module.exports = {
      "version": "0.24.0"
    };
  }
});

// api/node_modules/axios/lib/adapters/http.js
var require_http = __commonJS({
  "api/node_modules/axios/lib/adapters/http.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var settle = require_settle();
    var buildFullPath = require_buildFullPath();
    var buildURL = require_buildURL();
    var http = __require("http");
    var https = __require("https");
    var httpFollow = require_follow_redirects().http;
    var httpsFollow = require_follow_redirects().https;
    var url = __require("url");
    var zlib = __require("zlib");
    var VERSION = require_data().version;
    var createError = require_createError();
    var enhanceError = require_enhanceError();
    var defaults = require_defaults();
    var Cancel = require_Cancel();
    var isHttps = /https:?/;
    function setProxy(options, proxy, location) {
      options.hostname = proxy.host;
      options.host = proxy.host;
      options.port = proxy.port;
      options.path = location;
      if (proxy.auth) {
        var base64 = Buffer.from(proxy.auth.username + ":" + proxy.auth.password, "utf8").toString("base64");
        options.headers["Proxy-Authorization"] = "Basic " + base64;
      }
      options.beforeRedirect = function beforeRedirect(redirection) {
        redirection.headers.host = redirection.host;
        setProxy(redirection, proxy, redirection.href);
      };
    }
    module.exports = function httpAdapter(config) {
      return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
        var onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }
          if (config.signal) {
            config.signal.removeEventListener("abort", onCanceled);
          }
        }
        var resolve = function resolve2(value) {
          done();
          resolvePromise(value);
        };
        var reject = function reject2(value) {
          done();
          rejectPromise(value);
        };
        var data = config.data;
        var headers = config.headers;
        var headerNames = {};
        Object.keys(headers).forEach(function storeLowerName(name) {
          headerNames[name.toLowerCase()] = name;
        });
        if ("user-agent" in headerNames) {
          if (!headers[headerNames["user-agent"]]) {
            delete headers[headerNames["user-agent"]];
          }
        } else {
          headers["User-Agent"] = "axios/" + VERSION;
        }
        if (data && !utils.isStream(data)) {
          if (Buffer.isBuffer(data)) {
          } else if (utils.isArrayBuffer(data)) {
            data = Buffer.from(new Uint8Array(data));
          } else if (utils.isString(data)) {
            data = Buffer.from(data, "utf-8");
          } else {
            return reject(createError("Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream", config));
          }
          if (!headerNames["content-length"]) {
            headers["Content-Length"] = data.length;
          }
        }
        var auth = void 0;
        if (config.auth) {
          var username = config.auth.username || "";
          var password = config.auth.password || "";
          auth = username + ":" + password;
        }
        var fullPath = buildFullPath(config.baseURL, config.url);
        var parsed = url.parse(fullPath);
        var protocol = parsed.protocol || "http:";
        if (!auth && parsed.auth) {
          var urlAuth = parsed.auth.split(":");
          var urlUsername = urlAuth[0] || "";
          var urlPassword = urlAuth[1] || "";
          auth = urlUsername + ":" + urlPassword;
        }
        if (auth && headerNames.authorization) {
          delete headers[headerNames.authorization];
        }
        var isHttpsRequest = isHttps.test(protocol);
        var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;
        var options = {
          path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ""),
          method: config.method.toUpperCase(),
          headers,
          agent,
          agents: { http: config.httpAgent, https: config.httpsAgent },
          auth
        };
        if (config.socketPath) {
          options.socketPath = config.socketPath;
        } else {
          options.hostname = parsed.hostname;
          options.port = parsed.port;
        }
        var proxy = config.proxy;
        if (!proxy && proxy !== false) {
          var proxyEnv = protocol.slice(0, -1) + "_proxy";
          var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
          if (proxyUrl) {
            var parsedProxyUrl = url.parse(proxyUrl);
            var noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
            var shouldProxy = true;
            if (noProxyEnv) {
              var noProxy = noProxyEnv.split(",").map(function trim(s) {
                return s.trim();
              });
              shouldProxy = !noProxy.some(function proxyMatch(proxyElement) {
                if (!proxyElement) {
                  return false;
                }
                if (proxyElement === "*") {
                  return true;
                }
                if (proxyElement[0] === "." && parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement) {
                  return true;
                }
                return parsed.hostname === proxyElement;
              });
            }
            if (shouldProxy) {
              proxy = {
                host: parsedProxyUrl.hostname,
                port: parsedProxyUrl.port,
                protocol: parsedProxyUrl.protocol
              };
              if (parsedProxyUrl.auth) {
                var proxyUrlAuth = parsedProxyUrl.auth.split(":");
                proxy.auth = {
                  username: proxyUrlAuth[0],
                  password: proxyUrlAuth[1]
                };
              }
            }
          }
        }
        if (proxy) {
          options.headers.host = parsed.hostname + (parsed.port ? ":" + parsed.port : "");
          setProxy(options, proxy, protocol + "//" + parsed.hostname + (parsed.port ? ":" + parsed.port : "") + options.path);
        }
        var transport;
        var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
        if (config.transport) {
          transport = config.transport;
        } else if (config.maxRedirects === 0) {
          transport = isHttpsProxy ? https : http;
        } else {
          if (config.maxRedirects) {
            options.maxRedirects = config.maxRedirects;
          }
          transport = isHttpsProxy ? httpsFollow : httpFollow;
        }
        if (config.maxBodyLength > -1) {
          options.maxBodyLength = config.maxBodyLength;
        }
        if (config.insecureHTTPParser) {
          options.insecureHTTPParser = config.insecureHTTPParser;
        }
        var req = transport.request(options, function handleResponse(res) {
          if (req.aborted)
            return;
          var stream = res;
          var lastRequest = res.req || req;
          if (res.statusCode !== 204 && lastRequest.method !== "HEAD" && config.decompress !== false) {
            switch (res.headers["content-encoding"]) {
              case "gzip":
              case "compress":
              case "deflate":
                stream = stream.pipe(zlib.createUnzip());
                delete res.headers["content-encoding"];
                break;
            }
          }
          var response = {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            config,
            request: lastRequest
          };
          if (config.responseType === "stream") {
            response.data = stream;
            settle(resolve, reject, response);
          } else {
            var responseBuffer = [];
            var totalResponseBytes = 0;
            stream.on("data", function handleStreamData(chunk) {
              responseBuffer.push(chunk);
              totalResponseBytes += chunk.length;
              if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
                stream.destroy();
                reject(createError("maxContentLength size of " + config.maxContentLength + " exceeded", config, null, lastRequest));
              }
            });
            stream.on("error", function handleStreamError(err) {
              if (req.aborted)
                return;
              reject(enhanceError(err, config, null, lastRequest));
            });
            stream.on("end", function handleStreamEnd() {
              var responseData = Buffer.concat(responseBuffer);
              if (config.responseType !== "arraybuffer") {
                responseData = responseData.toString(config.responseEncoding);
                if (!config.responseEncoding || config.responseEncoding === "utf8") {
                  responseData = utils.stripBOM(responseData);
                }
              }
              response.data = responseData;
              settle(resolve, reject, response);
            });
          }
        });
        req.on("error", function handleRequestError(err) {
          if (req.aborted && err.code !== "ERR_FR_TOO_MANY_REDIRECTS")
            return;
          reject(enhanceError(err, config, null, req));
        });
        if (config.timeout) {
          var timeout = parseInt(config.timeout, 10);
          if (isNaN(timeout)) {
            reject(createError("error trying to parse `config.timeout` to int", config, "ERR_PARSE_TIMEOUT", req));
            return;
          }
          req.setTimeout(timeout, function handleRequestTimeout() {
            req.abort();
            var transitional = config.transitional || defaults.transitional;
            reject(createError("timeout of " + timeout + "ms exceeded", config, transitional.clarifyTimeoutError ? "ETIMEDOUT" : "ECONNABORTED", req));
          });
        }
        if (config.cancelToken || config.signal) {
          onCanceled = function(cancel) {
            if (req.aborted)
              return;
            req.abort();
            reject(!cancel || cancel && cancel.type ? new Cancel("canceled") : cancel);
          };
          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener("abort", onCanceled);
          }
        }
        if (utils.isStream(data)) {
          data.on("error", function handleStreamError(err) {
            reject(enhanceError(err, config, null, req));
          }).pipe(req);
        } else {
          req.end(data);
        }
      });
    };
  }
});

// api/node_modules/axios/lib/defaults.js
var require_defaults = __commonJS({
  "api/node_modules/axios/lib/defaults.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var normalizeHeaderName = require_normalizeHeaderName();
    var enhanceError = require_enhanceError();
    var DEFAULT_CONTENT_TYPE = {
      "Content-Type": "application/x-www-form-urlencoded"
    };
    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers["Content-Type"])) {
        headers["Content-Type"] = value;
      }
    }
    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== "undefined") {
        adapter = require_xhr();
      } else if (typeof process !== "undefined" && Object.prototype.toString.call(process) === "[object process]") {
        adapter = require_http();
      }
      return adapter;
    }
    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== "SyntaxError") {
            throw e;
          }
        }
      }
      return (encoder || JSON.stringify)(rawValue);
    }
    var defaults = {
      transitional: {
        silentJSONParsing: true,
        forcedJSONParsing: true,
        clarifyTimeoutError: false
      },
      adapter: getDefaultAdapter(),
      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, "Accept");
        normalizeHeaderName(headers, "Content-Type");
        if (utils.isFormData(data) || utils.isArrayBuffer(data) || utils.isBuffer(data) || utils.isStream(data) || utils.isFile(data) || utils.isBlob(data)) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, "application/x-www-form-urlencoded;charset=utf-8");
          return data.toString();
        }
        if (utils.isObject(data) || headers && headers["Content-Type"] === "application/json") {
          setContentTypeIfUnset(headers, "application/json");
          return stringifySafely(data);
        }
        return data;
      }],
      transformResponse: [function transformResponse(data) {
        var transitional = this.transitional || defaults.transitional;
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === "json";
        if (strictJSONParsing || forcedJSONParsing && utils.isString(data) && data.length) {
          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === "SyntaxError") {
                throw enhanceError(e, this, "E_JSON_PARSE");
              }
              throw e;
            }
          }
        }
        return data;
      }],
      timeout: 0,
      xsrfCookieName: "XSRF-TOKEN",
      xsrfHeaderName: "X-XSRF-TOKEN",
      maxContentLength: -1,
      maxBodyLength: -1,
      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },
      headers: {
        common: {
          "Accept": "application/json, text/plain, */*"
        }
      }
    };
    utils.forEach(["delete", "get", "head"], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });
    utils.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });
    module.exports = defaults;
  }
});

// api/node_modules/axios/lib/core/transformData.js
var require_transformData = __commonJS({
  "api/node_modules/axios/lib/core/transformData.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var defaults = require_defaults();
    module.exports = function transformData(data, headers, fns) {
      var context = this || defaults;
      utils.forEach(fns, function transform(fn) {
        data = fn.call(context, data, headers);
      });
      return data;
    };
  }
});

// api/node_modules/axios/lib/cancel/isCancel.js
var require_isCancel = __commonJS({
  "api/node_modules/axios/lib/cancel/isCancel.js"(exports, module) {
    "use strict";
    module.exports = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };
  }
});

// api/node_modules/axios/lib/core/dispatchRequest.js
var require_dispatchRequest = __commonJS({
  "api/node_modules/axios/lib/core/dispatchRequest.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var transformData = require_transformData();
    var isCancel = require_isCancel();
    var defaults = require_defaults();
    var Cancel = require_Cancel();
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
      if (config.signal && config.signal.aborted) {
        throw new Cancel("canceled");
      }
    }
    module.exports = function dispatchRequest(config) {
      throwIfCancellationRequested(config);
      config.headers = config.headers || {};
      config.data = transformData.call(config, config.data, config.headers, config.transformRequest);
      config.headers = utils.merge(config.headers.common || {}, config.headers[config.method] || {}, config.headers);
      utils.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function cleanHeaderConfig(method) {
        delete config.headers[method];
      });
      var adapter = config.adapter || defaults.adapter;
      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);
        response.data = transformData.call(config, response.data, response.headers, config.transformResponse);
        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);
          if (reason && reason.response) {
            reason.response.data = transformData.call(config, reason.response.data, reason.response.headers, config.transformResponse);
          }
        }
        return Promise.reject(reason);
      });
    };
  }
});

// api/node_modules/axios/lib/core/mergeConfig.js
var require_mergeConfig = __commonJS({
  "api/node_modules/axios/lib/core/mergeConfig.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    module.exports = function mergeConfig(config1, config2) {
      config2 = config2 || {};
      var config = {};
      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }
      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(void 0, config1[prop]);
        }
      }
      function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(void 0, config2[prop]);
        }
      }
      function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(void 0, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(void 0, config1[prop]);
        }
      }
      function mergeDirectKeys(prop) {
        if (prop in config2) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          return getMergedValue(void 0, config1[prop]);
        }
      }
      var mergeMap = {
        "url": valueFromConfig2,
        "method": valueFromConfig2,
        "data": valueFromConfig2,
        "baseURL": defaultToConfig2,
        "transformRequest": defaultToConfig2,
        "transformResponse": defaultToConfig2,
        "paramsSerializer": defaultToConfig2,
        "timeout": defaultToConfig2,
        "timeoutMessage": defaultToConfig2,
        "withCredentials": defaultToConfig2,
        "adapter": defaultToConfig2,
        "responseType": defaultToConfig2,
        "xsrfCookieName": defaultToConfig2,
        "xsrfHeaderName": defaultToConfig2,
        "onUploadProgress": defaultToConfig2,
        "onDownloadProgress": defaultToConfig2,
        "decompress": defaultToConfig2,
        "maxContentLength": defaultToConfig2,
        "maxBodyLength": defaultToConfig2,
        "transport": defaultToConfig2,
        "httpAgent": defaultToConfig2,
        "httpsAgent": defaultToConfig2,
        "cancelToken": defaultToConfig2,
        "socketPath": defaultToConfig2,
        "responseEncoding": defaultToConfig2,
        "validateStatus": mergeDirectKeys
      };
      utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        var merge = mergeMap[prop] || mergeDeepProperties;
        var configValue = merge(prop);
        utils.isUndefined(configValue) && merge !== mergeDirectKeys || (config[prop] = configValue);
      });
      return config;
    };
  }
});

// api/node_modules/axios/lib/helpers/validator.js
var require_validator = __commonJS({
  "api/node_modules/axios/lib/helpers/validator.js"(exports, module) {
    "use strict";
    var VERSION = require_data().version;
    var validators = {};
    ["object", "boolean", "number", "function", "string", "symbol"].forEach(function(type, i) {
      validators[type] = function validator(thing) {
        return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
      };
    });
    var deprecatedWarnings = {};
    validators.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
      }
      return function(value, opt, opts) {
        if (validator === false) {
          throw new Error(formatMessage(opt, " has been removed" + (version ? " in " + version : "")));
        }
        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          console.warn(formatMessage(opt, " has been deprecated since v" + version + " and will be removed in the near future"));
        }
        return validator ? validator(value, opt, opts) : true;
      };
    };
    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== "object") {
        throw new TypeError("options must be an object");
      }
      var keys = Object.keys(options);
      var i = keys.length;
      while (i-- > 0) {
        var opt = keys[i];
        var validator = schema[opt];
        if (validator) {
          var value = options[opt];
          var result = value === void 0 || validator(value, opt, options);
          if (result !== true) {
            throw new TypeError("option " + opt + " must be " + result);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw Error("Unknown option " + opt);
        }
      }
    }
    module.exports = {
      assertOptions,
      validators
    };
  }
});

// api/node_modules/axios/lib/core/Axios.js
var require_Axios = __commonJS({
  "api/node_modules/axios/lib/core/Axios.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var buildURL = require_buildURL();
    var InterceptorManager = require_InterceptorManager();
    var dispatchRequest = require_dispatchRequest();
    var mergeConfig = require_mergeConfig();
    var validator = require_validator();
    var validators = validator.validators;
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
      };
    }
    Axios.prototype.request = function request(config) {
      if (typeof config === "string") {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }
      config = mergeConfig(this.defaults, config);
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = "get";
      }
      var transitional = config.transitional;
      if (transitional !== void 0) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean)
        }, false);
      }
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
          return;
        }
        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });
      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });
      var promise;
      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest, void 0];
        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);
        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }
        return promise;
      }
      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }
      try {
        promise = dispatchRequest(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }
      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }
      return promise;
    };
    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, "");
    };
    utils.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          url,
          data: (config || {}).data
        }));
      };
    });
    utils.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          url,
          data
        }));
      };
    });
    module.exports = Axios;
  }
});

// api/node_modules/axios/lib/cancel/CancelToken.js
var require_CancelToken = __commonJS({
  "api/node_modules/axios/lib/cancel/CancelToken.js"(exports, module) {
    "use strict";
    var Cancel = require_Cancel();
    function CancelToken(executor) {
      if (typeof executor !== "function") {
        throw new TypeError("executor must be a function.");
      }
      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });
      var token = this;
      this.promise.then(function(cancel) {
        if (!token._listeners)
          return;
        var i;
        var l = token._listeners.length;
        for (i = 0; i < l; i++) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });
      this.promise.then = function(onfulfilled) {
        var _resolve;
        var promise = new Promise(function(resolve) {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);
        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };
        return promise;
      };
      executor(function cancel(message) {
        if (token.reason) {
          return;
        }
        token.reason = new Cancel(message);
        resolvePromise(token.reason);
      });
    }
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };
    CancelToken.prototype.subscribe = function subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }
      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    };
    CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      var index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    };
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token,
        cancel
      };
    };
    module.exports = CancelToken;
  }
});

// api/node_modules/axios/lib/helpers/spread.js
var require_spread = __commonJS({
  "api/node_modules/axios/lib/helpers/spread.js"(exports, module) {
    "use strict";
    module.exports = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };
  }
});

// api/node_modules/axios/lib/helpers/isAxiosError.js
var require_isAxiosError = __commonJS({
  "api/node_modules/axios/lib/helpers/isAxiosError.js"(exports, module) {
    "use strict";
    module.exports = function isAxiosError(payload) {
      return typeof payload === "object" && payload.isAxiosError === true;
    };
  }
});

// api/node_modules/axios/lib/axios.js
var require_axios = __commonJS({
  "api/node_modules/axios/lib/axios.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var bind = require_bind();
    var Axios = require_Axios();
    var mergeConfig = require_mergeConfig();
    var defaults = require_defaults();
    function createInstance(defaultConfig) {
      var context = new Axios(defaultConfig);
      var instance = bind(Axios.prototype.request, context);
      utils.extend(instance, Axios.prototype, context);
      utils.extend(instance, context);
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };
      return instance;
    }
    var axios2 = createInstance(defaults);
    axios2.Axios = Axios;
    axios2.Cancel = require_Cancel();
    axios2.CancelToken = require_CancelToken();
    axios2.isCancel = require_isCancel();
    axios2.VERSION = require_data().version;
    axios2.all = function all(promises) {
      return Promise.all(promises);
    };
    axios2.spread = require_spread();
    axios2.isAxiosError = require_isAxiosError();
    module.exports = axios2;
    module.exports.default = axios2;
  }
});

// api/node_modules/axios/index.js
var require_axios2 = __commonJS({
  "api/node_modules/axios/index.js"(exports, module) {
    module.exports = require_axios();
  }
});

// api/base.ts
var import_axios, COORDINATOR_HOST, MATCHMAKER_HOST, NO_DIFF, Response, Message;
var init_base = __esm({
  "api/base.ts"() {
    "use strict";
    import_axios = __toESM(require_axios2(), 1);
    COORDINATOR_HOST = process.env.COORDINATOR_HOST;
    MATCHMAKER_HOST = process.env.MATCHMAKER_HOST;
    NO_DIFF = Symbol("NODIFF");
    Response = {
      ok: () => ({ type: "ok" }),
      error: (error) => ({ type: "error", error })
    };
    Message = {
      response: (msgId, response) => ({ type: "response", msgId, response }),
      event: (event) => ({ type: "event", event })
    };
  }
});

// api/node_modules/utf8-buffer/dist/utf8-buffer.js
var require_utf8_buffer2 = __commonJS({
  "api/node_modules/utf8-buffer/dist/utf8-buffer.js"(exports, module) {
    var $jscomp = $jscomp || {};
    $jscomp.scope = {};
    $jscomp.checkStringArgs = function(a, b, c) {
      if (a == null)
        throw new TypeError("The 'this' value for String.prototype." + c + " must not be null or undefined");
      if (b instanceof RegExp)
        throw new TypeError("First argument to String.prototype." + c + " must not be a regular expression");
      return a + "";
    };
    $jscomp.ASSUME_ES5 = false;
    $jscomp.ASSUME_NO_NATIVE_MAP = false;
    $jscomp.ASSUME_NO_NATIVE_SET = false;
    $jscomp.SIMPLE_FROUND_POLYFILL = false;
    $jscomp.defineProperty = $jscomp.ASSUME_ES5 || typeof Object.defineProperties == "function" ? Object.defineProperty : function(a, b, c) {
      a != Array.prototype && a != Object.prototype && (a[b] = c.value);
    };
    $jscomp.getGlobal = function(a) {
      return typeof window != "undefined" && window === a ? a : typeof global != "undefined" && global != null ? global : a;
    };
    $jscomp.global = $jscomp.getGlobal(exports);
    $jscomp.polyfill = function(a, b, c, d) {
      if (b) {
        c = $jscomp.global;
        a = a.split(".");
        for (d = 0; d < a.length - 1; d++) {
          var h = a[d];
          h in c || (c[h] = {});
          c = c[h];
        }
        a = a[a.length - 1];
        d = c[a];
        b = b(d);
        b != d && b != null && $jscomp.defineProperty(c, a, { configurable: true, writable: true, value: b });
      }
    };
    $jscomp.polyfill("String.prototype.codePointAt", function(a) {
      return a ? a : function(b) {
        var c = $jscomp.checkStringArgs(this, null, "codePointAt"), a2 = c.length;
        b = Number(b) || 0;
        if (0 <= b && b < a2) {
          b |= 0;
          var h = c.charCodeAt(b);
          if (55296 > h || 56319 < h || b + 1 === a2)
            return h;
          b = c.charCodeAt(b + 1);
          return 56320 > b || 57343 < b ? h : 1024 * (h - 55296) + b + 9216;
        }
      };
    }, "es6", "es3");
    (function(a, b) {
      typeof exports === "object" && typeof module !== "undefined" ? b(exports) : typeof define === "function" && define.amd ? define(["exports"], b) : (a = a || self, b(a.UTF8Buffer = {}));
    })(exports, function(a) {
      a.pack = function(b, a2, d) {
        d = d === void 0 ? 0 : d;
        for (var c = 0, k = b.length; c < k; c++) {
          var f = b.codePointAt(c);
          if (128 > f)
            a2[d] = f, d++;
          else {
            var g = 0, e = 0;
            2047 >= f ? (g = 1, e = 192) : 65535 >= f ? (g = 2, e = 224) : 1114111 >= f && (g = 3, e = 240, c++);
            a2[d] = (f >> 6 * g) + e;
            for (d++; 0 < g; )
              a2[d] = 128 | f >> 6 * (g - 1) & 63, d++, g--;
          }
        }
        return d;
      };
      a.unpack = function(b, a2, d) {
        d = d === void 0 ? b.length : d;
        var c = "";
        for (a2 = a2 === void 0 ? 0 : a2; a2 < d; ) {
          var k = 128, f = 191, g = false, e = b[a2++];
          if (0 <= e && 127 >= e)
            c += String.fromCharCode(e);
          else {
            var l = 0;
            194 <= e && 223 >= e ? l = 1 : 224 <= e && 239 >= e ? (l = 2, b[a2] === 224 && (k = 160), b[a2] === 237 && (f = 159)) : 240 <= e && 244 >= e ? (l = 3, b[a2] === 240 && (k = 144), b[a2] === 244 && (f = 143)) : g = true;
            e &= (1 << 8 - l - 1) - 1;
            for (var m = 0; m < l; m++) {
              if (b[a2] < k || b[a2] > f)
                g = true;
              e = e << 6 | b[a2] & 63;
              a2++;
            }
            g ? c += String.fromCharCode(65533) : 65535 >= e ? c += String.fromCharCode(e) : (e -= 65536, c += String.fromCharCode((e >> 10 & 1023) + 55296, (e & 1023) + 56320));
          }
        }
        return c;
      };
      Object.defineProperty(a, "__esModule", { value: true });
    });
  }
});

// api/node_modules/utf8-buffer-size/dist/utf8-buffer-size.umd.js
var require_utf8_buffer_size_umd2 = __commonJS({
  "api/node_modules/utf8-buffer-size/dist/utf8-buffer-size.umd.js"(exports, module) {
    String.prototype.codePointAt || function() {
      "use strict";
      var t = function() {
        try {
          var t2 = {}, e2 = Object.defineProperty, r = e2(t2, t2, t2) && e2;
        } catch (t3) {
        }
        return r;
      }(), e = function(t2) {
        if (this == null)
          throw TypeError();
        var e2 = String(this), r = e2.length, n = t2 ? Number(t2) : 0;
        if (n != n && (n = 0), !(n < 0 || n >= r)) {
          var o, i = e2.charCodeAt(n);
          return i >= 55296 && i <= 56319 && r > n + 1 && (o = e2.charCodeAt(n + 1)) >= 56320 && o <= 57343 ? 1024 * (i - 55296) + o - 56320 + 65536 : i;
        }
      };
      t ? t(String.prototype, "codePointAt", { value: e, configurable: true, writable: true }) : String.prototype.codePointAt = e;
    }(), function(t, e) {
      typeof exports == "object" && typeof module != "undefined" ? (module.exports = e(), module.exports.default = e()) : typeof define == "function" && define.amd ? define(e) : t.utf8BufferSize = e();
    }(exports, function() {
      "use strict";
      return function() {
        return function(t) {
          let e = 0;
          for (let r = 0, n = t.length; r < n; r++) {
            let n2 = t.codePointAt(r);
            n2 < 128 ? e++ : (n2 <= 2047 ? e++ : n2 <= 65535 ? e += 2 : n2 <= 1114111 && (r++, e += 3), e++);
          }
          return e;
        };
      }();
    });
  }
});

// api/node_modules/bin-serde/lib/index.js
var require_lib2 = __commonJS({
  "api/node_modules/bin-serde/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Reader = exports.Writer = void 0;
    var utf8 = require_utf8_buffer2();
    var utf8_buffer_size_1 = require_utf8_buffer_size_umd2();
    var { pack, unpack } = utf8.default ?? utf8;
    var Writer3 = class {
      pos = 0;
      view;
      bytes;
      constructor() {
        this.view = new DataView(new ArrayBuffer(64));
        this.bytes = new Uint8Array(this.view.buffer);
      }
      writeUInt8(val) {
        this.ensureSize(1);
        this.view.setUint8(this.pos, val);
        this.pos += 1;
        return this;
      }
      writeUInt32(val) {
        this.ensureSize(4);
        this.view.setUint32(this.pos, val);
        this.pos += 4;
        return this;
      }
      writeUInt64(val) {
        this.ensureSize(8);
        this.view.setBigUint64(this.pos, val);
        this.pos += 8;
        return this;
      }
      writeUVarint(val) {
        if (val < 128) {
          this.ensureSize(1);
          this.view.setUint8(this.pos, val);
          this.pos += 1;
        } else if (val < 16384) {
          this.ensureSize(2);
          this.view.setUint16(this.pos, val & 127 | (val & 16256) << 1 | 32768);
          this.pos += 2;
        } else if (val < 2097152) {
          this.ensureSize(3);
          this.view.setUint8(this.pos, val >> 14 | 128);
          this.view.setUint16(this.pos + 1, val & 127 | (val & 16256) << 1 | 32768);
          this.pos += 3;
        } else if (val < 268435456) {
          this.ensureSize(4);
          this.view.setUint32(this.pos, val & 127 | (val & 16256) << 1 | (val & 2080768) << 2 | (val & 266338304) << 3 | 2155905024);
          this.pos += 4;
        } else if (val < 34359738368) {
          this.ensureSize(5);
          this.view.setUint8(this.pos, Math.floor(val / Math.pow(2, 28)) | 128);
          this.view.setUint32(this.pos + 1, val & 127 | (val & 16256) << 1 | (val & 2080768) << 2 | (val & 266338304) << 3 | 2155905024);
          this.pos += 5;
        } else if (val < 4398046511104) {
          this.ensureSize(6);
          const shiftedVal = Math.floor(val / Math.pow(2, 28));
          this.view.setUint16(this.pos, shiftedVal & 127 | (shiftedVal & 16256) << 1 | 32896);
          this.view.setUint32(this.pos + 2, val & 127 | (val & 16256) << 1 | (val & 2080768) << 2 | (val & 266338304) << 3 | 2155905024);
          this.pos += 6;
        } else {
          throw new Error("Value out of range");
        }
        return this;
      }
      writeVarint(val) {
        const bigval = BigInt(val);
        this.writeUVarint(Number(bigval >> 63n ^ bigval << 1n));
        return this;
      }
      writeFloat(val) {
        this.ensureSize(4);
        this.view.setFloat32(this.pos, val, true);
        this.pos += 4;
        return this;
      }
      writeBits(bits) {
        for (let i = 0; i < bits.length; i += 8) {
          let byte = 0;
          for (let j = 0; j < 8; j++) {
            if (i + j == bits.length) {
              break;
            }
            byte |= (bits[i + j] ? 1 : 0) << j;
          }
          this.writeUInt8(byte);
        }
        return this;
      }
      writeString(val) {
        if (val.length > 0) {
          const byteSize = (0, utf8_buffer_size_1.default)(val);
          this.writeUVarint(byteSize);
          this.ensureSize(byteSize);
          pack(val, this.bytes, this.pos);
          this.pos += byteSize;
        } else {
          this.writeUInt8(0);
        }
        return this;
      }
      writeBuffer(buf) {
        this.ensureSize(buf.length);
        this.bytes.set(buf, this.pos);
        this.pos += buf.length;
        return this;
      }
      toBuffer() {
        return this.bytes.subarray(0, this.pos);
      }
      ensureSize(size) {
        while (this.view.byteLength < this.pos + size) {
          const newView = new DataView(new ArrayBuffer(this.view.byteLength * 2));
          const newBytes = new Uint8Array(newView.buffer);
          newBytes.set(this.bytes);
          this.view = newView;
          this.bytes = newBytes;
        }
      }
    };
    exports.Writer = Writer3;
    var Reader3 = class {
      pos = 0;
      view;
      bytes;
      constructor(buf) {
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        this.bytes = new Uint8Array(this.view.buffer, buf.byteOffset, buf.byteLength);
      }
      readUInt8() {
        const val = this.view.getUint8(this.pos);
        this.pos += 1;
        return val;
      }
      readUInt32() {
        const val = this.view.getUint32(this.pos);
        this.pos += 4;
        return val;
      }
      readUInt64() {
        const val = this.view.getBigUint64(this.pos);
        this.pos += 8;
        return val;
      }
      readUVarint() {
        let val = 0;
        while (true) {
          let byte = this.view.getUint8(this.pos++);
          if (byte < 128) {
            return val + byte;
          }
          val = (val + (byte & 127)) * 128;
        }
      }
      readVarint() {
        const val = BigInt(this.readUVarint());
        return Number(val >> 1n ^ -(val & 1n));
      }
      readFloat() {
        const val = this.view.getFloat32(this.pos, true);
        this.pos += 4;
        return val;
      }
      readBits(numBits) {
        const numBytes = Math.ceil(numBits / 8);
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        const bits = [];
        for (const byte of bytes) {
          for (let i = 0; i < 8 && bits.length < numBits; i++) {
            bits.push((byte >> i & 1) === 1);
          }
        }
        this.pos += numBytes;
        return bits;
      }
      readString() {
        const len = this.readUVarint();
        if (len === 0) {
          return "";
        }
        const val = unpack(this.bytes, this.pos, this.pos + len);
        this.pos += len;
        return val;
      }
      readBuffer(numBytes) {
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        this.pos += numBytes;
        return bytes;
      }
      remaining() {
        return this.view.byteLength - this.pos;
      }
    };
    exports.Reader = Reader3;
  }
});

// api/types.ts
function encodeStateSnapshot(x) {
  const buf = new import_bin_serde.Writer();
  buf.writeUInt8(0);
  PlayerState.encode(x, buf);
  return buf.toBuffer();
}
function encodeStateUpdate(x, changedAtDiff, messages) {
  const buf = new import_bin_serde.Writer();
  buf.writeUInt8(1);
  buf.writeUVarint(changedAtDiff);
  const responses = messages.flatMap((msg) => msg.type === "response" ? msg : []);
  buf.writeUVarint(responses.length);
  responses.forEach(({ msgId, response }) => {
    buf.writeUInt32(Number(msgId));
    writeOptional(buf, response.type === "error" ? response.error : void 0, (x2) => writeString(buf, x2));
  });
  const events = messages.flatMap((msg) => msg.type === "event" ? msg : []);
  buf.writeUVarint(events.length);
  events.forEach(({ event }) => buf.writeString(event));
  if (x !== void 0) {
    PlayerState.encodeDiff(x, buf);
  }
  return buf.toBuffer();
}
function encodeStateError() {
  const buf = new import_bin_serde.Writer();
  buf.writeUInt8(2);
  return buf.toBuffer();
}
function validatePrimitive(isValid, errorMessage) {
  return isValid ? [] : [errorMessage];
}
function writeBoolean(buf, x) {
  buf.writeUInt8(x ? 1 : 0);
}
function writeInt(buf, x) {
  buf.writeVarint(x);
}
function writeFloat(buf, x) {
  buf.writeFloat(x);
}
function writeString(buf, x) {
  buf.writeString(x);
}
function writeOptional(buf, x, innerWrite) {
  writeBoolean(buf, x !== void 0);
  if (x !== void 0) {
    innerWrite(x);
  }
}
function parseInt2(buf) {
  return buf.readVarint();
}
function parseFloat2(buf) {
  return buf.readFloat();
}
var import_bin_serde, Vector, PlayerState, IUpdatePlayerVelocityRequest, IStartRoundRequest, IJoinGameRequest, IStartGameRequest, IInitializeRequest;
var init_types = __esm({
  "api/types.ts"() {
    "use strict";
    import_bin_serde = __toESM(require_lib2(), 1);
    init_base();
    Vector = {
      default() {
        return {
          x: 0,
          y: 0
        };
      },
      validate(obj) {
        if (typeof obj !== "object") {
          return [`Invalid Vector object: ${obj}`];
        }
        let validationErrors;
        validationErrors = validatePrimitive(typeof obj.x === "number", `Invalid float: ${obj.x}`);
        if (validationErrors.length > 0) {
          return validationErrors.concat("Invalid key: Vector.x");
        }
        validationErrors = validatePrimitive(typeof obj.y === "number", `Invalid float: ${obj.y}`);
        if (validationErrors.length > 0) {
          return validationErrors.concat("Invalid key: Vector.y");
        }
        return validationErrors;
      },
      encode(obj, writer) {
        const buf = writer ?? new import_bin_serde.Writer();
        writeFloat(buf, obj.x);
        writeFloat(buf, obj.y);
        return buf;
      },
      encodeDiff(obj, writer) {
        const buf = writer ?? new import_bin_serde.Writer();
        const tracker = [];
        tracker.push(obj.x !== NO_DIFF);
        tracker.push(obj.y !== NO_DIFF);
        buf.writeBits(tracker);
        if (obj.x !== NO_DIFF) {
          writeFloat(buf, obj.x);
        }
        if (obj.y !== NO_DIFF) {
          writeFloat(buf, obj.y);
        }
        return buf;
      },
      decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new import_bin_serde.Reader(buf) : buf;
        return {
          x: parseFloat2(sb),
          y: parseFloat2(sb)
        };
      },
      decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new import_bin_serde.Reader(buf) : buf;
        const tracker = sb.readBits(2);
        return {
          x: tracker.shift() ? parseFloat2(sb) : NO_DIFF,
          y: tracker.shift() ? parseFloat2(sb) : NO_DIFF
        };
      }
    };
    PlayerState = {
      default() {
        return {
          player1position: Vector.default(),
          player2position: Vector.default(),
          ballposition: Vector.default(),
          player1Lives: 0,
          player2Lives: 0
        };
      },
      validate(obj) {
        if (typeof obj !== "object") {
          return [`Invalid PlayerState object: ${obj}`];
        }
        let validationErrors;
        validationErrors = Vector.validate(obj.player1position);
        if (validationErrors.length > 0) {
          return validationErrors.concat("Invalid key: PlayerState.player1position");
        }
        validationErrors = Vector.validate(obj.player2position);
        if (validationErrors.length > 0) {
          return validationErrors.concat("Invalid key: PlayerState.player2position");
        }
        validationErrors = Vector.validate(obj.ballposition);
        if (validationErrors.length > 0) {
          return validationErrors.concat("Invalid key: PlayerState.ballposition");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.player1Lives), `Invalid int: ${obj.player1Lives}`);
        if (validationErrors.length > 0) {
          return validationErrors.concat("Invalid key: PlayerState.player1Lives");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.player2Lives), `Invalid int: ${obj.player2Lives}`);
        if (validationErrors.length > 0) {
          return validationErrors.concat("Invalid key: PlayerState.player2Lives");
        }
        return validationErrors;
      },
      encode(obj, writer) {
        const buf = writer ?? new import_bin_serde.Writer();
        Vector.encode(obj.player1position, buf);
        Vector.encode(obj.player2position, buf);
        Vector.encode(obj.ballposition, buf);
        writeInt(buf, obj.player1Lives);
        writeInt(buf, obj.player2Lives);
        return buf;
      },
      encodeDiff(obj, writer) {
        const buf = writer ?? new import_bin_serde.Writer();
        const tracker = [];
        tracker.push(obj.player1position !== NO_DIFF);
        tracker.push(obj.player2position !== NO_DIFF);
        tracker.push(obj.ballposition !== NO_DIFF);
        tracker.push(obj.player1Lives !== NO_DIFF);
        tracker.push(obj.player2Lives !== NO_DIFF);
        buf.writeBits(tracker);
        if (obj.player1position !== NO_DIFF) {
          Vector.encodeDiff(obj.player1position, buf);
        }
        if (obj.player2position !== NO_DIFF) {
          Vector.encodeDiff(obj.player2position, buf);
        }
        if (obj.ballposition !== NO_DIFF) {
          Vector.encodeDiff(obj.ballposition, buf);
        }
        if (obj.player1Lives !== NO_DIFF) {
          writeInt(buf, obj.player1Lives);
        }
        if (obj.player2Lives !== NO_DIFF) {
          writeInt(buf, obj.player2Lives);
        }
        return buf;
      },
      decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new import_bin_serde.Reader(buf) : buf;
        return {
          player1position: Vector.decode(sb),
          player2position: Vector.decode(sb),
          ballposition: Vector.decode(sb),
          player1Lives: parseInt2(sb),
          player2Lives: parseInt2(sb)
        };
      },
      decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new import_bin_serde.Reader(buf) : buf;
        const tracker = sb.readBits(5);
        return {
          player1position: tracker.shift() ? Vector.decodeDiff(sb) : NO_DIFF,
          player2position: tracker.shift() ? Vector.decodeDiff(sb) : NO_DIFF,
          ballposition: tracker.shift() ? Vector.decodeDiff(sb) : NO_DIFF,
          player1Lives: tracker.shift() ? parseInt2(sb) : NO_DIFF,
          player2Lives: tracker.shift() ? parseInt2(sb) : NO_DIFF
        };
      }
    };
    IUpdatePlayerVelocityRequest = {
      default() {
        return {
          velocity: Vector.default()
        };
      },
      encode(obj, writer) {
        const buf = writer ?? new import_bin_serde.Writer();
        Vector.encode(obj.velocity, buf);
        return buf;
      },
      decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new import_bin_serde.Reader(buf) : buf;
        return {
          velocity: Vector.decode(sb)
        };
      }
    };
    IStartRoundRequest = {
      default() {
        return {};
      },
      encode(obj, writer) {
        const buf = writer ?? new import_bin_serde.Writer();
        return buf;
      },
      decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new import_bin_serde.Reader(buf) : buf;
        return {};
      }
    };
    IJoinGameRequest = {
      default() {
        return {};
      },
      encode(obj, writer) {
        const buf = writer ?? new import_bin_serde.Writer();
        return buf;
      },
      decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new import_bin_serde.Reader(buf) : buf;
        return {};
      }
    };
    IStartGameRequest = {
      default() {
        return {};
      },
      encode(obj, writer) {
        const buf = writer ?? new import_bin_serde.Writer();
        return buf;
      },
      decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new import_bin_serde.Reader(buf) : buf;
        return {};
      }
    };
    IInitializeRequest = {
      default() {
        return {};
      },
      encode(x, buf) {
        return buf ?? new import_bin_serde.Writer();
      },
      decode(sb) {
        return {};
      }
    };
  }
});

// server/.hathora/node_modules/@hathora/log-store/lib/index.js
var require_lib3 = __commonJS({
  "server/.hathora/node_modules/@hathora/log-store/lib/index.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LogStore = void 0;
    var fs_1 = __importDefault(__require("fs"));
    var path_1 = __importDefault(__require("path"));
    var LogStore2 = class {
      constructor(storageDir) {
        this.storageDir = storageDir;
        this.partitionFiles = /* @__PURE__ */ new Map();
      }
      append(partitionId, time, record) {
        if (!this.partitionFiles.has(partitionId)) {
          this.partitionFiles.set(partitionId, fs_1.default.openSync(this.getPath(partitionId), "a"));
        }
        const fd = this.partitionFiles.get(partitionId);
        const header = Buffer.alloc(12);
        header.writeBigUInt64LE(BigInt(time));
        header.writeUInt16LE(record.byteLength, 8);
        fs_1.default.appendFileSync(fd, Buffer.concat([header, record]));
      }
      load(partitionId) {
        const fd = fs_1.default.openSync(this.getPath(partitionId), "r");
        const metadataBuf = Buffer.alloc(12);
        const rows = [];
        while (fs_1.default.readSync(fd, metadataBuf, 0, metadataBuf.length, null) > 0) {
          const time = metadataBuf.readBigUInt64LE();
          const len = metadataBuf.readUInt16LE(8);
          const recordBuf = Buffer.alloc(len);
          fs_1.default.readSync(fd, recordBuf, 0, recordBuf.length, null);
          rows.push({ time: Number(time), record: recordBuf });
        }
        fs_1.default.closeSync(fd);
        return rows;
      }
      unload(partitionId) {
        const fd = this.partitionFiles.get(partitionId);
        if (fd !== void 0) {
          this.partitionFiles.delete(partitionId);
          fs_1.default.closeSync(fd);
        }
      }
      getPath(partitionId) {
        return path_1.default.join(this.storageDir, partitionId.toString(36));
      }
    };
    exports.LogStore = LogStore2;
  }
});

// server/helper.ts
function detectCollisions(state) {
  let obj1;
  let obj2;
  for (let i = 0; i < state.Balls.length; i++) {
    state.Balls[i].isColliding = false;
  }
  for (let i = 0; i < state.Balls.length; i++) {
    obj1 = state.Balls[i];
    for (let j = i; j < state.Players.length; j++) {
      obj2 = state.Players[j];
      if (rectIntersect(obj1.position.x, obj1.position.y, obj1.radius, obj1.radius, obj2.position.x, obj2.position.y, obj2.size.x, obj2.size.y)) {
        obj1.isColliding = true;
        obj2.isColliding = true;
      }
    }
  }
}
function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
  if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
    return false;
  }
  return true;
}
function resetGame(state, side) {
  state.Balls.length = 0;
  let startPosition;
  if (side == "left")
    startPosition = { x: state.Players[0].position.x + 12, y: state.Players[0].position.y + 12 };
  else
    startPosition = { x: state.Players[1].position.x - 12, y: state.Players[1].position.y + 12 };
  state.Balls.push({
    position: startPosition,
    velocity: { x: 0, y: 0 },
    radius: 15,
    isColliding: false
  });
  state.gameState = 3 /* WaitingToStartRound */;
}
function changeVelocity(obj1, obj2) {
  if (obj2 == "top") {
    obj1.velocity.y = Math.abs(obj1.velocity.y);
  } else if (obj2 == "bottom") {
    obj1.velocity.y = -obj1.velocity.y;
  } else {
    obj1.velocity.x = -obj1.velocity.x;
    obj2.isColliding = false;
  }
  obj1.isColliding = false;
}
function toRads(anl) {
  return anl * Math.PI / 180;
}
var init_helper = __esm({
  "server/helper.ts"() {
    "use strict";
    init_types();
  }
});

// server/impl.ts
var impl_exports = {};
__export(impl_exports, {
  Impl: () => Impl
});
var screenHeight, screenWidth, firstPlayerX, secondPlayerX, ballSpeed, ballspeedAdjustment, paddlespeed, vollies, Impl;
var init_impl = __esm({
  "server/impl.ts"() {
    "use strict";
    init_base();
    init_types();
    init_helper();
    screenHeight = 400;
    screenWidth = 600;
    firstPlayerX = 15;
    secondPlayerX = 575;
    ballSpeed = 100;
    ballspeedAdjustment = 0;
    paddlespeed = 20;
    vollies = 0;
    Impl = class {
      initialize(ctx2, request) {
        return {
          Players: [],
          Balls: [],
          gameState: 1 /* PlayersJoining */
        };
      }
      joinGame(state, userId, ctx2, request) {
        if (state.gameState != 1 /* PlayersJoining */)
          return Response.error("Cannot allow players to join");
        if (state.Players.length >= 2)
          return Response.error("This game has maximum amount of players");
        let startingposition;
        if (state.Players.length == 1)
          startingposition = secondPlayerX;
        else
          startingposition = firstPlayerX;
        state.Players.push({
          id: userId,
          lives: 3,
          velocity: { x: 0, y: 0 },
          position: { x: startingposition, y: 0 },
          size: { x: 10, y: 48 },
          isColliding: false
        });
        if (state.Players.length == 2) {
          state.gameState = 2 /* WaitingToStartGame */;
          ctx2.broadcastEvent("P2");
        } else if (state.Players.length == 1) {
          ctx2.broadcastEvent("P1");
        }
        return Response.ok();
      }
      startGame(state, userId, ctx2, request) {
        if (state.Players.length != 2)
          return Response.error("Invalid number of players");
        if (state.gameState != 2 /* WaitingToStartGame */)
          return Response.error("Not ready to start game");
        const startPosition = { x: state.Players[0].position.x + 12, y: state.Players[0].position.y + 12 };
        state.Balls.push({
          position: startPosition,
          velocity: { x: 0, y: 0 },
          radius: 15,
          isColliding: false
        });
        state.gameState = 3 /* WaitingToStartRound */;
        ctx2.broadcastEvent("Ball");
        return Response.ok();
      }
      startRound(state, userId, ctx2, request) {
        if (state.gameState != 3 /* WaitingToStartRound */)
          return Response.error("Cannot start round");
        let startingAngle;
        if (state.Balls[0].position.x < 300)
          startingAngle = ctx2.chance.integer({ min: -75, max: 75 });
        else
          startingAngle = ctx2.chance.integer({ min: 115, max: 255 });
        let magnitude = ballSpeed;
        let xComponent = magnitude * Math.cos(toRads(startingAngle));
        let yComponent = magnitude * Math.sin(toRads(startingAngle));
        state.Balls[0].velocity = { x: xComponent, y: yComponent };
        state.gameState = 4 /* InProgress */;
        return Response.ok();
      }
      updatePlayerVelocity(state, userId, ctx2, request) {
        if (state.gameState != 4 /* InProgress */ && state.gameState != 3 /* WaitingToStartRound */ && state.gameState != 2 /* WaitingToStartGame */)
          return Response.error("Cannot update velocity");
        let pIndex = 0;
        if (state.Players[1]) {
          if (userId == state.Players[1].id)
            pIndex = 1;
        }
        state.Players[pIndex].velocity = request.velocity;
        return Response.ok();
      }
      getUserState(state, userId) {
        let clientState = {
          player1position: state.Players[0] ? state.Players[0].position : { x: 15, y: 10 },
          player2position: state.Players[1] ? state.Players[1].position : { x: 575, y: 10 },
          ballposition: state.Balls[0] ? state.Balls[0].position : { x: 25, y: 25 },
          player1Lives: state.Players[0] ? state.Players[0].lives : 3,
          player2Lives: state.Players[1] ? state.Players[1].lives : 3
        };
        return clientState;
      }
      onTick(state, ctx2, timeDelta) {
        if (vollies % 5 == 1) {
          ballspeedAdjustment += 0.5;
        }
        for (const player of state.Players) {
          const hittingTop = player.position.y < 0;
          const hittingBottom = player.position.y + player.size.y >= screenHeight;
          const pixelsToMove = paddlespeed * timeDelta;
          if (!hittingTop && player.velocity.y < 0) {
            player.position.y += player.velocity.y * pixelsToMove;
          } else if (!hittingBottom && player.velocity.y > 0) {
            player.position.y += player.velocity.y * pixelsToMove;
          }
          if (state.gameState == 3 /* WaitingToStartRound */) {
            if (state.Balls[0].position.x < 300) {
              if (player.id == state.Players[0].id)
                state.Balls[0].position.y += state.Players[0].velocity.y * pixelsToMove;
            } else {
              if (player.id == state.Players[1].id)
                state.Balls[0].position.y += state.Players[1].velocity.y * pixelsToMove;
            }
          }
        }
        if (state.gameState == 4 /* InProgress */) {
          for (const ball of state.Balls) {
            if (ball.velocity.x >= 0)
              ball.position.x += (ball.velocity.x + ballspeedAdjustment) * timeDelta;
            else
              ball.position.x += (ball.velocity.x - ballspeedAdjustment) * timeDelta;
            if (ball.velocity.y >= 0)
              ball.position.y += (ball.velocity.y + ballspeedAdjustment) * timeDelta;
            else
              ball.position.y += (ball.velocity.y - ballspeedAdjustment) * timeDelta;
          }
          detectCollisions(state);
          for (const player of state.Players) {
            if (player.isColliding) {
              vollies += 1;
              for (const ball of state.Balls) {
                if (ball.isColliding) {
                  changeVelocity(ball, player);
                }
              }
            }
          }
          for (const ball of state.Balls) {
            const hittingTop = ball.position.y <= 0;
            const hittingBottom = ball.position.y + ball.radius >= screenHeight;
            if (hittingTop) {
              vollies += 1;
              changeVelocity(ball, "top");
            } else if (hittingBottom) {
              vollies += 1;
              changeVelocity(ball, "bottom");
            }
          }
          for (const ball of state.Balls) {
            const hittingLeft = ball.position.x <= 0;
            const hittingRight = ball.position.x + ball.radius >= screenWidth;
            if (hittingLeft) {
              state.Players[0].lives -= 1;
              if (state.Players[0].lives == 0) {
                ctx2.broadcastEvent("Game Over");
                state.gameState = 5 /* GameOver */;
              } else
                resetGame(state, "left");
            } else if (hittingRight) {
              state.Players[1].lives -= 1;
              if (state.Players[1].lives == 0) {
                ctx2.broadcastEvent("Game Over");
                state.gameState = 5 /* GameOver */;
              } else
                resetGame(state, "right");
            }
          }
        }
      }
    };
  }
});

// server/.hathora/store.ts
var import_chance = __toESM(require_chance(), 1);
var import_bin_serde3 = __toESM(require_lib(), 1);
init_base();
init_types();
import { randomBytes } from "crypto";
import { existsSync, mkdirSync } from "fs";

// server/.hathora/protocol.ts
var import_bin_serde2 = __toESM(require_lib(), 1);
init_base();
import net from "net";
var NEW_STATE = 0;
var SUBSCRIBE_USER = 1;
var UNSUBSCRIBE_USER = 2;
var HANDLE_UPDATE = 3;
var PING_INTERVAL_MS = 1e4;
function readData(socket, onData) {
  let buf = Buffer.alloc(0);
  socket.on("data", (data) => {
    buf = Buffer.concat([buf, data]);
    while (buf.length >= 4) {
      const bufLen = buf.readUInt32BE();
      if (buf.length < 4 + bufLen) {
        return;
      }
      onData(buf.slice(4, 4 + bufLen));
      buf = buf.slice(4 + bufLen);
    }
  });
}
function register(store) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let pingTimer;
    socket.connect(7147, COORDINATOR_HOST);
    socket.on("connect", () => {
      socket.write(JSON.stringify({
        appSecret: "8779c59e-8759-4bc7-8c81-77892a389369",
        storeRegion: process.env.STORE_REGION ?? "unknown",
        authInfo: {
          anonymous: { separator: "-" }
        }
      }));
      console.log(`Connected to coordinator at ${COORDINATOR_HOST} with appId 13d6e53c3bb8f9e7064ab0a2c3796c1c98f0a375fdb7b39610191c3f38eda5f8`);
      const coordinatorClient = new CoordinatorClient(socket);
      pingTimer = setInterval(() => coordinatorClient.ping(), PING_INTERVAL_MS);
      resolve(coordinatorClient);
    });
    socket.on("error", (err) => {
      console.error("Coordinator connection error", err);
      if (pingTimer !== void 0) {
        clearInterval(pingTimer);
      }
      reject(err.message);
    });
    socket.on("close", () => {
      console.error("Coordinator connection closed, retrying...");
      store.unsubscribeAll();
      if (pingTimer !== void 0) {
        clearInterval(pingTimer);
      }
      setTimeout(() => socket.connect(7147, COORDINATOR_HOST), 1e3 + Math.random() * 1e3);
    });
    readData(socket, (data) => {
      const reader = new import_bin_serde2.Reader(data);
      const type = reader.readUInt8();
      if (type === NEW_STATE) {
        store.newState(reader.readUInt64(), reader.readString(), reader.readBuffer(reader.remaining()));
      } else if (type === SUBSCRIBE_USER) {
        store.subscribeUser(reader.readUInt64(), reader.readString());
      } else if (type === UNSUBSCRIBE_USER) {
        store.unsubscribeUser(reader.readUInt64(), reader.readString());
      } else if (type === HANDLE_UPDATE) {
        store.handleUpdate(reader.readUInt64(), reader.readString(), reader.readBuffer(reader.remaining()));
      } else {
        throw new Error("Unknown type: " + type);
      }
    });
  });
}
var CoordinatorClient = class {
  constructor(socket) {
    this.socket = socket;
  }
  stateUpdate(stateId, userId, data) {
    const userIdBuf = new import_bin_serde2.Writer().writeString(userId).toBuffer();
    this.socket.write(new import_bin_serde2.Writer().writeUInt32(9 + userIdBuf.length + data.length).writeUInt8(0 /* STATE_UPDATE */).writeUInt64(stateId).writeBuffer(userIdBuf).writeBuffer(data).toBuffer());
  }
  stateNotFound(stateId, userId) {
    const userIdBuf = new import_bin_serde2.Writer().writeString(userId).toBuffer();
    this.socket.write(new import_bin_serde2.Writer().writeUInt32(9 + userIdBuf.length).writeUInt8(1 /* STATE_NOT_FOUND */).writeUInt64(stateId).writeBuffer(userIdBuf).toBuffer());
  }
  ping() {
    this.socket.write(new import_bin_serde2.Writer().writeUInt32(1).writeUInt8(2 /* PING */).toBuffer());
  }
};

// server/.hathora/store.ts
var import_log_store = __toESM(require_lib3(), 1);

// server/.hathora/node_modules/on-change/lib/constants.js
var PATH_SEPARATOR = ".";
var TARGET = Symbol("target");
var UNSUBSCRIBE = Symbol("unsubscribe");

// server/.hathora/node_modules/on-change/lib/is-builtin.js
function isBuiltinWithMutableMethods(value) {
  return value instanceof Date || value instanceof Set || value instanceof Map || value instanceof WeakSet || value instanceof WeakMap || ArrayBuffer.isView(value);
}
function isBuiltinWithoutMutableMethods(value) {
  return (typeof value === "object" ? value === null : typeof value !== "function") || value instanceof RegExp;
}

// server/.hathora/node_modules/on-change/lib/is-array.js
var is_array_default = Array.isArray;

// server/.hathora/node_modules/on-change/lib/is-symbol.js
function isSymbol(value) {
  return typeof value === "symbol";
}

// server/.hathora/node_modules/on-change/lib/path.js
var path = {
  after: (path2, subPath) => {
    if (is_array_default(path2)) {
      return path2.slice(subPath.length);
    }
    if (subPath === "") {
      return path2;
    }
    return path2.slice(subPath.length + 1);
  },
  concat: (path2, key) => {
    if (is_array_default(path2)) {
      path2 = [...path2];
      if (key) {
        path2.push(key);
      }
      return path2;
    }
    if (key && key.toString !== void 0) {
      if (path2 !== "") {
        path2 += PATH_SEPARATOR;
      }
      if (isSymbol(key)) {
        return path2 + key.toString();
      }
      return path2 + key;
    }
    return path2;
  },
  initial: (path2) => {
    if (is_array_default(path2)) {
      return path2.slice(0, -1);
    }
    if (path2 === "") {
      return path2;
    }
    const index = path2.lastIndexOf(PATH_SEPARATOR);
    if (index === -1) {
      return "";
    }
    return path2.slice(0, index);
  },
  last: (path2) => {
    if (is_array_default(path2)) {
      return path2[path2.length - 1] || "";
    }
    if (path2 === "") {
      return path2;
    }
    const index = path2.lastIndexOf(PATH_SEPARATOR);
    if (index === -1) {
      return path2;
    }
    return path2.slice(index + 1);
  },
  walk: (path2, callback) => {
    if (is_array_default(path2)) {
      for (const key of path2) {
        callback(key);
      }
    } else if (path2 !== "") {
      let position = 0;
      let index = path2.indexOf(PATH_SEPARATOR);
      if (index === -1) {
        callback(path2);
      } else {
        while (position < path2.length) {
          if (index === -1) {
            index = path2.length;
          }
          callback(path2.slice(position, index));
          position = index + 1;
          index = path2.indexOf(PATH_SEPARATOR, position);
        }
      }
    }
  },
  get(object, path2) {
    this.walk(path2, (key) => {
      if (object) {
        object = object[key];
      }
    });
    return object;
  }
};
var path_default = path;

// server/.hathora/node_modules/on-change/lib/is-iterator.js
function isIterator(value) {
  return typeof value === "object" && typeof value.next === "function";
}

// server/.hathora/node_modules/on-change/lib/wrap-iterator.js
function wrapIterator(iterator, target, thisArg, applyPath, prepareValue) {
  const originalNext = iterator.next;
  if (target.name === "entries") {
    iterator.next = function() {
      const result = originalNext.call(this);
      if (result.done === false) {
        result.value[0] = prepareValue(result.value[0], target, result.value[0], applyPath);
        result.value[1] = prepareValue(result.value[1], target, result.value[0], applyPath);
      }
      return result;
    };
  } else if (target.name === "values") {
    const keyIterator = thisArg[TARGET].keys();
    iterator.next = function() {
      const result = originalNext.call(this);
      if (result.done === false) {
        result.value = prepareValue(result.value, target, keyIterator.next().value, applyPath);
      }
      return result;
    };
  } else {
    iterator.next = function() {
      const result = originalNext.call(this);
      if (result.done === false) {
        result.value = prepareValue(result.value, target, result.value, applyPath);
      }
      return result;
    };
  }
  return iterator;
}

// server/.hathora/node_modules/on-change/lib/ignore-property.js
function ignoreProperty(cache, options, property) {
  return cache.isUnsubscribed || options.ignoreSymbols && isSymbol(property) || options.ignoreUnderscores && property.charAt(0) === "_" || "ignoreKeys" in options && options.ignoreKeys.includes(property);
}

// server/.hathora/node_modules/on-change/lib/cache.js
var Cache = class {
  constructor(equals) {
    this._equals = equals;
    this._proxyCache = /* @__PURE__ */ new WeakMap();
    this._pathCache = /* @__PURE__ */ new WeakMap();
    this.isUnsubscribed = false;
  }
  _getDescriptorCache() {
    if (this._descriptorCache === void 0) {
      this._descriptorCache = /* @__PURE__ */ new WeakMap();
    }
    return this._descriptorCache;
  }
  _getProperties(target) {
    const descriptorCache = this._getDescriptorCache();
    let properties = descriptorCache.get(target);
    if (properties === void 0) {
      properties = {};
      descriptorCache.set(target, properties);
    }
    return properties;
  }
  _getOwnPropertyDescriptor(target, property) {
    if (this.isUnsubscribed) {
      return Reflect.getOwnPropertyDescriptor(target, property);
    }
    const properties = this._getProperties(target);
    let descriptor = properties[property];
    if (descriptor === void 0) {
      descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      properties[property] = descriptor;
    }
    return descriptor;
  }
  getProxy(target, path2, handler, proxyTarget) {
    if (this.isUnsubscribed) {
      return target;
    }
    const reflectTarget = target[proxyTarget];
    const source = reflectTarget || target;
    this._pathCache.set(source, path2);
    let proxy = this._proxyCache.get(source);
    if (proxy === void 0) {
      proxy = reflectTarget === void 0 ? new Proxy(target, handler) : target;
      this._proxyCache.set(source, proxy);
    }
    return proxy;
  }
  getPath(target) {
    return this.isUnsubscribed ? void 0 : this._pathCache.get(target);
  }
  isDetached(target, object) {
    return !Object.is(target, path_default.get(object, this.getPath(target)));
  }
  defineProperty(target, property, descriptor) {
    if (!Reflect.defineProperty(target, property, descriptor)) {
      return false;
    }
    if (!this.isUnsubscribed) {
      this._getProperties(target)[property] = descriptor;
    }
    return true;
  }
  setProperty(target, property, value, receiver, previous) {
    if (!this._equals(previous, value) || !(property in target)) {
      const descriptor = this._getOwnPropertyDescriptor(target, property);
      if (descriptor !== void 0 && "set" in descriptor) {
        return Reflect.set(target, property, value, receiver);
      }
      return Reflect.set(target, property, value);
    }
    return true;
  }
  deleteProperty(target, property, previous) {
    if (Reflect.deleteProperty(target, property)) {
      if (!this.isUnsubscribed) {
        const properties = this._getDescriptorCache().get(target);
        if (properties) {
          delete properties[property];
          this._pathCache.delete(previous);
        }
      }
      return true;
    }
    return false;
  }
  isSameDescriptor(a, target, property) {
    const b = this._getOwnPropertyDescriptor(target, property);
    return a !== void 0 && b !== void 0 && Object.is(a.value, b.value) && (a.writable || false) === (b.writable || false) && (a.enumerable || false) === (b.enumerable || false) && (a.configurable || false) === (b.configurable || false) && a.get === b.get && a.set === b.set;
  }
  isGetInvariant(target, property) {
    const descriptor = this._getOwnPropertyDescriptor(target, property);
    return descriptor !== void 0 && descriptor.configurable !== true && descriptor.writable !== true;
  }
  unsubscribe() {
    this._descriptorCache = null;
    this._pathCache = null;
    this._proxyCache = null;
    this.isUnsubscribed = true;
  }
};

// server/.hathora/node_modules/on-change/lib/is-object.js
function isObject(value) {
  return toString.call(value) === "[object Object]";
}

// server/.hathora/node_modules/on-change/lib/smart-clone/diff/is-diff-certain.js
function isDiffCertain() {
  return true;
}

// server/.hathora/node_modules/on-change/lib/smart-clone/diff/is-diff-arrays.js
function isDiffArrays(clone, value) {
  return clone.length !== value.length || clone.some((item, index) => value[index] !== item);
}

// server/.hathora/node_modules/on-change/lib/smart-clone/methods/object.js
var IMMUTABLE_OBJECT_METHODS = /* @__PURE__ */ new Set([
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toLocaleString",
  "toString",
  "valueOf"
]);

// server/.hathora/node_modules/on-change/lib/smart-clone/methods/array.js
var IMMUTABLE_ARRAY_METHODS = /* @__PURE__ */ new Set([
  "concat",
  "includes",
  "indexOf",
  "join",
  "keys",
  "lastIndexOf"
]);
var MUTABLE_ARRAY_METHODS = {
  push: isDiffCertain,
  pop: isDiffCertain,
  shift: isDiffCertain,
  unshift: isDiffCertain,
  copyWithin: isDiffArrays,
  reverse: isDiffArrays,
  sort: isDiffArrays,
  splice: isDiffArrays,
  flat: isDiffArrays,
  fill: isDiffArrays
};
var HANDLED_ARRAY_METHODS = /* @__PURE__ */ new Set([
  ...IMMUTABLE_OBJECT_METHODS,
  ...IMMUTABLE_ARRAY_METHODS,
  ...Object.keys(MUTABLE_ARRAY_METHODS)
]);

// server/.hathora/node_modules/on-change/lib/smart-clone/diff/is-diff-sets.js
function isDiffSets(clone, value) {
  if (clone.size !== value.size) {
    return true;
  }
  for (const element of clone) {
    if (!value.has(element)) {
      return true;
    }
  }
  return false;
}

// server/.hathora/node_modules/on-change/lib/smart-clone/methods/set.js
var COLLECTION_ITERATOR_METHODS = [
  "keys",
  "values",
  "entries"
];
var IMMUTABLE_SET_METHODS = /* @__PURE__ */ new Set([
  "has",
  "toString"
]);
var MUTABLE_SET_METHODS = {
  add: isDiffSets,
  clear: isDiffSets,
  delete: isDiffSets,
  forEach: isDiffSets
};
var HANDLED_SET_METHODS = /* @__PURE__ */ new Set([
  ...IMMUTABLE_SET_METHODS,
  ...Object.keys(MUTABLE_SET_METHODS),
  ...COLLECTION_ITERATOR_METHODS
]);

// server/.hathora/node_modules/on-change/lib/smart-clone/diff/is-diff-maps.js
function isDiffMaps(clone, value) {
  if (clone.size !== value.size) {
    return true;
  }
  let bValue;
  for (const [key, aValue] of clone) {
    bValue = value.get(key);
    if (bValue !== aValue || bValue === void 0 && !value.has(key)) {
      return true;
    }
  }
  return false;
}

// server/.hathora/node_modules/on-change/lib/smart-clone/methods/map.js
var IMMUTABLE_MAP_METHODS = /* @__PURE__ */ new Set([...IMMUTABLE_SET_METHODS, "get"]);
var MUTABLE_MAP_METHODS = {
  set: isDiffMaps,
  clear: isDiffMaps,
  delete: isDiffMaps,
  forEach: isDiffMaps
};
var HANDLED_MAP_METHODS = /* @__PURE__ */ new Set([
  ...IMMUTABLE_MAP_METHODS,
  ...Object.keys(MUTABLE_MAP_METHODS),
  ...COLLECTION_ITERATOR_METHODS
]);

// server/.hathora/node_modules/on-change/lib/smart-clone/clone/clone-object.js
var CloneObject = class {
  constructor(value, path2, argumentsList, hasOnValidate) {
    this._path = path2;
    this._isChanged = false;
    this._clonedCache = /* @__PURE__ */ new Set();
    this._hasOnValidate = hasOnValidate;
    this._changes = hasOnValidate ? [] : null;
    this.clone = path2 === void 0 ? value : this._shallowClone(value);
  }
  static isHandledMethod(name) {
    return IMMUTABLE_OBJECT_METHODS.has(name);
  }
  _shallowClone(value) {
    let clone = value;
    if (isObject(value)) {
      clone = { ...value };
    } else if (is_array_default(value) || ArrayBuffer.isView(value)) {
      clone = [...value];
    } else if (value instanceof Date) {
      clone = new Date(value);
    } else if (value instanceof Set) {
      clone = new Set([...value].map((item) => this._shallowClone(item)));
    } else if (value instanceof Map) {
      clone = /* @__PURE__ */ new Map();
      for (const [key, item] of value.entries()) {
        clone.set(key, this._shallowClone(item));
      }
    }
    this._clonedCache.add(clone);
    return clone;
  }
  preferredThisArg(isHandledMethod, name, thisArg, thisProxyTarget) {
    if (isHandledMethod) {
      if (is_array_default(thisProxyTarget)) {
        this._onIsChanged = MUTABLE_ARRAY_METHODS[name];
      } else if (thisProxyTarget instanceof Set) {
        this._onIsChanged = MUTABLE_SET_METHODS[name];
      } else if (thisProxyTarget instanceof Map) {
        this._onIsChanged = MUTABLE_MAP_METHODS[name];
      }
      return thisProxyTarget;
    }
    return thisArg;
  }
  update(fullPath, property, value) {
    const changePath = path_default.after(fullPath, this._path);
    if (property !== "length") {
      let object = this.clone;
      path_default.walk(changePath, (key) => {
        if (object && object[key]) {
          if (!this._clonedCache.has(object[key])) {
            object[key] = this._shallowClone(object[key]);
          }
          object = object[key];
        }
      });
      if (this._hasOnValidate) {
        this._changes.push({
          path: changePath,
          property,
          previous: value
        });
      }
      if (object && object[property]) {
        object[property] = value;
      }
    }
    this._isChanged = true;
  }
  undo(object) {
    let change;
    for (let index = this._changes.length - 1; index !== -1; index--) {
      change = this._changes[index];
      path_default.get(object, change.path)[change.property] = change.previous;
    }
  }
  isChanged(value) {
    return this._onIsChanged === void 0 ? this._isChanged : this._onIsChanged(this.clone, value);
  }
};

// server/.hathora/node_modules/on-change/lib/smart-clone/clone/clone-array.js
var CloneArray = class extends CloneObject {
  static isHandledMethod(name) {
    return HANDLED_ARRAY_METHODS.has(name);
  }
};

// server/.hathora/node_modules/on-change/lib/smart-clone/clone/clone-date.js
var CloneDate = class extends CloneObject {
  undo(object) {
    object.setTime(this.clone.getTime());
  }
  isChanged(value, equals) {
    return !equals(this.clone.valueOf(), value.valueOf());
  }
};

// server/.hathora/node_modules/on-change/lib/smart-clone/clone/clone-set.js
var CloneSet = class extends CloneObject {
  static isHandledMethod(name) {
    return HANDLED_SET_METHODS.has(name);
  }
  undo(object) {
    for (const value of this.clone) {
      object.add(value);
    }
    for (const value of object) {
      if (!this.clone.has(value)) {
        object.delete(value);
      }
    }
  }
};

// server/.hathora/node_modules/on-change/lib/smart-clone/clone/clone-map.js
var CloneMap = class extends CloneObject {
  static isHandledMethod(name) {
    return HANDLED_MAP_METHODS.has(name);
  }
  undo(object) {
    for (const [key, value] of this.clone.entries()) {
      object.set(key, value);
    }
    for (const key of object.keys()) {
      if (!this.clone.has(key)) {
        object.delete(key);
      }
    }
  }
};

// server/.hathora/node_modules/on-change/lib/smart-clone/clone/clone-weakset.js
var CloneWeakSet = class extends CloneObject {
  constructor(value, path2, argumentsList, hasOnValidate) {
    super(void 0, path2, argumentsList, hasOnValidate);
    this._arg1 = argumentsList[0];
    this._weakValue = value.has(this._arg1);
  }
  isChanged(value) {
    return this._weakValue !== value.has(this._arg1);
  }
  undo(object) {
    if (this._weakValue && !object.has(this._arg1)) {
      object.add(this._arg1);
    } else {
      object.delete(this._arg1);
    }
  }
};

// server/.hathora/node_modules/on-change/lib/smart-clone/clone/clone-weakmap.js
var CloneWeakMap = class extends CloneObject {
  constructor(value, path2, argumentsList, hasOnValidate) {
    super(void 0, path2, argumentsList, hasOnValidate);
    this._weakKey = argumentsList[0];
    this._weakHas = value.has(this._weakKey);
    this._weakValue = value.get(this._weakKey);
  }
  isChanged(value) {
    return this._weakValue !== value.get(this._weakKey);
  }
  undo(object) {
    const weakHas = object.has(this._weakKey);
    if (this._weakHas && !weakHas) {
      object.set(this._weakKey, this._weakValue);
    } else if (!this._weakHas && weakHas) {
      object.delete(this._weakKey);
    } else if (this._weakValue !== object.get(this._weakKey)) {
      object.set(this._weakKey, this._weakValue);
    }
  }
};

// server/.hathora/node_modules/on-change/lib/smart-clone/smart-clone.js
var SmartClone = class {
  constructor(hasOnValidate) {
    this._stack = [];
    this._hasOnValidate = hasOnValidate;
  }
  static isHandledType(value) {
    return isObject(value) || is_array_default(value) || isBuiltinWithMutableMethods(value);
  }
  static isHandledMethod(target, name) {
    if (isObject(target)) {
      return CloneObject.isHandledMethod(name);
    }
    if (is_array_default(target)) {
      return CloneArray.isHandledMethod(name);
    }
    if (target instanceof Set) {
      return CloneSet.isHandledMethod(name);
    }
    if (target instanceof Map) {
      return CloneMap.isHandledMethod(name);
    }
    return isBuiltinWithMutableMethods(target);
  }
  get isCloning() {
    return this._stack.length > 0;
  }
  start(value, path2, argumentsList) {
    let CloneClass = CloneObject;
    if (is_array_default(value)) {
      CloneClass = CloneArray;
    } else if (value instanceof Date) {
      CloneClass = CloneDate;
    } else if (value instanceof Set) {
      CloneClass = CloneSet;
    } else if (value instanceof Map) {
      CloneClass = CloneMap;
    } else if (value instanceof WeakSet) {
      CloneClass = CloneWeakSet;
    } else if (value instanceof WeakMap) {
      CloneClass = CloneWeakMap;
    }
    this._stack.push(new CloneClass(value, path2, argumentsList, this._hasOnValidate));
  }
  update(fullPath, property, value) {
    this._stack[this._stack.length - 1].update(fullPath, property, value);
  }
  preferredThisArg(target, thisArg, thisProxyTarget) {
    const { name } = target;
    const isHandledMethod = SmartClone.isHandledMethod(thisProxyTarget, name);
    return this._stack[this._stack.length - 1].preferredThisArg(isHandledMethod, name, thisArg, thisProxyTarget);
  }
  isChanged(isMutable, value, equals) {
    return this._stack[this._stack.length - 1].isChanged(isMutable, value, equals);
  }
  undo(object) {
    if (this._previousClone !== void 0) {
      this._previousClone.undo(object);
    }
  }
  stop() {
    this._previousClone = this._stack.pop();
    return this._previousClone.clone;
  }
};

// server/.hathora/node_modules/on-change/index.js
var defaultOptions = {
  equals: Object.is,
  isShallow: false,
  pathAsArray: false,
  ignoreSymbols: false,
  ignoreUnderscores: false,
  ignoreDetached: false,
  details: false
};
var onChange = (object, onChange2, options = {}) => {
  options = {
    ...defaultOptions,
    ...options
  };
  const proxyTarget = Symbol("ProxyTarget");
  const { equals, isShallow, ignoreDetached, details } = options;
  const cache = new Cache(equals);
  const hasOnValidate = typeof options.onValidate === "function";
  const smartClone = new SmartClone(hasOnValidate);
  const validate = (target, property, value, previous, applyData) => !hasOnValidate || smartClone.isCloning || options.onValidate(path_default.concat(cache.getPath(target), property), value, previous, applyData) === true;
  const handleChangeOnTarget = (target, property, value, previous) => {
    if (!ignoreProperty(cache, options, property) && !(ignoreDetached && cache.isDetached(target, object))) {
      handleChange(cache.getPath(target), property, value, previous);
    }
  };
  const handleChange = (changePath, property, value, previous, applyData) => {
    if (smartClone.isCloning) {
      smartClone.update(changePath, property, previous);
    } else {
      onChange2(path_default.concat(changePath, property), value, previous, applyData);
    }
  };
  const getProxyTarget = (value) => value ? value[proxyTarget] || value : value;
  const prepareValue = (value, target, property, basePath) => {
    if (isBuiltinWithoutMutableMethods(value) || property === "constructor" || isShallow && !SmartClone.isHandledMethod(target, property) || ignoreProperty(cache, options, property) || cache.isGetInvariant(target, property) || ignoreDetached && cache.isDetached(target, object)) {
      return value;
    }
    if (basePath === void 0) {
      basePath = cache.getPath(target);
    }
    return cache.getProxy(value, path_default.concat(basePath, property), handler, proxyTarget);
  };
  const handler = {
    get(target, property, receiver) {
      if (isSymbol(property)) {
        if (property === proxyTarget || property === TARGET) {
          return target;
        }
        if (property === UNSUBSCRIBE && !cache.isUnsubscribed && cache.getPath(target).length === 0) {
          cache.unsubscribe();
          return target;
        }
      }
      const value = isBuiltinWithMutableMethods(target) ? Reflect.get(target, property) : Reflect.get(target, property, receiver);
      return prepareValue(value, target, property);
    },
    set(target, property, value, receiver) {
      value = getProxyTarget(value);
      const reflectTarget = target[proxyTarget] || target;
      const previous = reflectTarget[property];
      if (equals(previous, value) && property in target) {
        return true;
      }
      const isValid = validate(target, property, value, previous);
      if (isValid && cache.setProperty(reflectTarget, property, value, receiver, previous)) {
        handleChangeOnTarget(target, property, target[property], previous);
        return true;
      }
      return !isValid;
    },
    defineProperty(target, property, descriptor) {
      if (!cache.isSameDescriptor(descriptor, target, property)) {
        const previous = target[property];
        if (validate(target, property, descriptor.value, previous) && cache.defineProperty(target, property, descriptor, previous)) {
          handleChangeOnTarget(target, property, descriptor.value, previous);
        }
      }
      return true;
    },
    deleteProperty(target, property) {
      if (!Reflect.has(target, property)) {
        return true;
      }
      const previous = Reflect.get(target, property);
      const isValid = validate(target, property, void 0, previous);
      if (isValid && cache.deleteProperty(target, property, previous)) {
        handleChangeOnTarget(target, property, void 0, previous);
        return true;
      }
      return !isValid;
    },
    apply(target, thisArg, argumentsList) {
      const thisProxyTarget = thisArg[proxyTarget] || thisArg;
      if (cache.isUnsubscribed) {
        return Reflect.apply(target, thisProxyTarget, argumentsList);
      }
      if ((details === false || details !== true && !details.includes(target.name)) && SmartClone.isHandledType(thisProxyTarget)) {
        let applyPath = path_default.initial(cache.getPath(target));
        const isHandledMethod = SmartClone.isHandledMethod(thisProxyTarget, target.name);
        smartClone.start(thisProxyTarget, applyPath, argumentsList);
        let result = Reflect.apply(target, smartClone.preferredThisArg(target, thisArg, thisProxyTarget), isHandledMethod ? argumentsList.map((argument) => getProxyTarget(argument)) : argumentsList);
        const isChanged = smartClone.isChanged(thisProxyTarget, equals);
        const previous = smartClone.stop();
        if (SmartClone.isHandledType(result) && isHandledMethod) {
          if (thisArg instanceof Map && target.name === "get") {
            applyPath = path_default.concat(applyPath, argumentsList[0]);
          }
          result = cache.getProxy(result, applyPath, handler);
        }
        if (isChanged) {
          const applyData = {
            name: target.name,
            args: argumentsList,
            result
          };
          const changePath = smartClone.isCloning ? path_default.initial(applyPath) : applyPath;
          const property = smartClone.isCloning ? path_default.last(applyPath) : "";
          if (validate(path_default.get(object, changePath), property, thisProxyTarget, previous, applyData)) {
            handleChange(changePath, property, thisProxyTarget, previous, applyData);
          } else {
            smartClone.undo(thisProxyTarget);
          }
        }
        if ((thisArg instanceof Map || thisArg instanceof Set) && isIterator(result)) {
          return wrapIterator(result, target, thisArg, applyPath, prepareValue);
        }
        return result;
      }
      return Reflect.apply(target, thisArg, argumentsList);
    }
  };
  const proxy = cache.getProxy(object, options.pathAsArray ? [] : "", handler);
  onChange2 = onChange2.bind(proxy);
  if (hasOnValidate) {
    options.onValidate = options.onValidate.bind(proxy);
  }
  return proxy;
};
onChange.target = (proxy) => proxy && proxy[TARGET] || proxy;
onChange.unsubscribe = (proxy) => proxy[UNSUBSCRIBE] || proxy;
var on_change_default = onChange;

// server/.hathora/wrapper.ts
init_base();
init_types();
var ImplWrapper = class {
  state;
  _changedAt;
  constructor(ctx2, argsBuffer) {
    monkeyPatchSideEffectFunctions(ctx2);
    const state = prevImpl.initialize(ctx2, IInitializeRequest.decode(argsBuffer));
    restoreSideEffectFunctions();
    this.state = on_change_default(state, () => this._changedAt = Date.now());
  }
  async getResult(userId, method, ctx2, argsBuffer) {
    monkeyPatchSideEffectFunctions(ctx2);
    const res = await this._getResult(userId, method, ctx2, argsBuffer);
    restoreSideEffectFunctions();
    return res;
  }
  async onTick(ctx2, timeDelta) {
    const impl = await getLatestImpl();
    monkeyPatchSideEffectFunctions(ctx2);
    impl.onTick(this.state, ctx2, timeDelta);
    restoreSideEffectFunctions();
  }
  async getUserState(userId) {
    const impl = await getLatestImpl();
    return impl.getUserState(on_change_default.target(this.state), userId);
  }
  changedAt() {
    const res = this._changedAt;
    this._changedAt = void 0;
    return res;
  }
  async _getResult(userId, method, ctx2, argsBuffer) {
    const impl = await getLatestImpl();
    switch (method) {
      case 0 /* UPDATE_PLAYER_VELOCITY */:
        return impl.updatePlayerVelocity(this.state, userId, ctx2, IUpdatePlayerVelocityRequest.decode(argsBuffer));
      case 1 /* START_ROUND */:
        return impl.startRound(this.state, userId, ctx2, IStartRoundRequest.decode(argsBuffer));
      case 2 /* JOIN_GAME */:
        return impl.joinGame(this.state, userId, ctx2, IJoinGameRequest.decode(argsBuffer));
      case 3 /* START_GAME */:
        return impl.startGame(this.state, userId, ctx2, IStartGameRequest.decode(argsBuffer));
    }
  }
};
var prevError = "";
var prevImpl = new (await Promise.resolve().then(() => (init_impl(), impl_exports))).Impl();
async function getLatestImpl() {
  try {
    prevImpl = new (await Promise.resolve().then(() => (init_impl(), impl_exports))).Impl();
    if (prevError !== "") {
      console.log("Successfully reloaded impl");
      prevError = "";
    }
  } catch (e) {
    const errorString = e.toString();
    if (errorString !== prevError) {
      console.error("Error reloading impl: " + e);
      prevError = errorString;
    }
  }
  return prevImpl;
}
var origMathRandom = Math.random;
var origDateNow = Date.now;
function monkeyPatchSideEffectFunctions(ctx2) {
  Math.random = () => ctx2.chance.random();
  Date.now = () => ctx2.time;
}
function restoreSideEffectFunctions() {
  Math.random = origMathRandom;
  Date.now = origDateNow;
}

// server/.hathora/diff.ts
init_base();
function diffVector(obj, prevObj) {
  return diffObj({
    x: diffPrimitive(obj.x, prevObj.x),
    y: diffPrimitive(obj.y, prevObj.y)
  });
}
function diffPlayerState(obj, prevObj) {
  return diffObj({
    player1position: diffVector(obj.player1position, prevObj.player1position),
    player2position: diffVector(obj.player2position, prevObj.player2position),
    ballposition: diffVector(obj.ballposition, prevObj.ballposition),
    player1Lives: diffPrimitive(obj.player1Lives, prevObj.player1Lives),
    player2Lives: diffPrimitive(obj.player2Lives, prevObj.player2Lives)
  });
}
function computeDiff(state, prevState) {
  try {
    return diffPlayerState(state, prevState);
  } catch (e) {
    console.error("Invalid user state", state);
    throw e;
  }
}
function diffPrimitive(a, b) {
  return a === b ? NO_DIFF : a;
}
function diffObj(obj) {
  return Object.values(obj).every((v) => v === NO_DIFF) ? NO_DIFF : obj;
}

// server/.hathora/store.ts
var stateInfo = /* @__PURE__ */ new Map();
var changedStates = /* @__PURE__ */ new Map();
var pendingMessages = /* @__PURE__ */ new Map();
var dataDir = process.env.DATA_DIR;
if (!existsSync(dataDir)) {
  mkdirSync(dataDir);
}
var log = new import_log_store.LogStore(dataDir);
var Store = class {
  constructor() {
    let prevUpdateTime = Date.now();
    setInterval(() => {
      const currTime = Date.now();
      stateInfo.forEach(async ({ impl, chance: chance2, subscriptions }, stateId) => {
        if (subscriptions.size > 0) {
          const timeDelta = currTime - prevUpdateTime;
          await impl.onTick(ctx(chance2, currTime, stateId), timeDelta / 1e3);
          const changedAt = impl.changedAt();
          if (changedAt !== void 0) {
            changedStates.set(stateId, changedAt);
            pendingMessages.delete(stateId);
            log.append(stateId, currTime, new import_bin_serde3.Writer().writeUInt8(255).writeUVarint(timeDelta).toBuffer());
          }
        }
      });
      prevUpdateTime = currTime;
      changedStates.forEach((changedAt, stateId) => sendUpdates(stateId, changedAt));
      changedStates.clear();
      pendingMessages.forEach((userIds, stateId) => userIds.forEach((userId) => sendMessages(stateId, userId)));
      pendingMessages.clear();
    }, 50);
    setInterval(() => {
      stateInfo.forEach(({ subscriptions }, stateId) => {
        if (subscriptions.size === 0) {
          stateInfo.delete(stateId);
          log.unload(stateId);
        }
      });
    }, 1e4);
  }
  async newState(stateId, userId, data) {
    const seed = randomBytes(8).readBigUInt64LE();
    const time = Date.now();
    const chance2 = (0, import_chance.Chance)(seed.toString());
    const impl = new ImplWrapper(ctx(chance2, time, stateId), data);
    stateInfo.set(stateId, { impl, chance: chance2, subscriptions: /* @__PURE__ */ new Map() });
    log.append(stateId, time, new import_bin_serde3.Writer().writeUInt64(seed).writeString(userId).writeUVarint(data.length).writeBuffer(data).toBuffer());
  }
  async subscribeUser(stateId, userId) {
    if (!stateInfo.has(stateId)) {
      const loaded = await loadState(stateId);
      if (loaded === void 0) {
        coordinator.stateNotFound(stateId, userId);
        return;
      }
      stateInfo.set(stateId, { impl: loaded.impl, chance: loaded.chance, subscriptions: /* @__PURE__ */ new Map() });
    }
    sendSnapshot(stateId, userId);
  }
  unsubscribeUser(stateId, userId) {
    if (!stateInfo.has(stateId)) {
      return;
    }
    const subscribers = stateInfo.get(stateId).subscriptions;
    subscribers.delete(userId);
    if (subscribers.size === 0) {
      changedStates.delete(stateId);
      pendingMessages.delete(stateId);
    }
  }
  unsubscribeAll() {
    stateInfo.forEach(({ subscriptions }, stateId) => {
      subscriptions.clear();
      changedStates.delete(stateId);
      pendingMessages.delete(stateId);
    });
  }
  async handleUpdate(stateId, userId, data) {
    if (!stateInfo.has(stateId)) {
      return;
    }
    const { impl, chance: chance2, subscriptions } = stateInfo.get(stateId);
    const reader = new import_bin_serde3.Reader(data);
    const [method, msgId, argsBuffer] = [
      reader.readUInt8(),
      reader.readUInt32(),
      reader.readBuffer(reader.remaining())
    ];
    const time = Date.now();
    const response = await impl.getResult(userId, method, ctx(chance2, time, stateId), argsBuffer);
    if (subscriptions.has(userId)) {
      subscriptions.get(userId).messages.push(Message.response(msgId, response));
      const changedAt = impl.changedAt();
      if (changedAt !== void 0) {
        changedStates.set(stateId, changedAt);
        pendingMessages.delete(stateId);
        log.append(stateId, time, new import_bin_serde3.Writer().writeUInt8(method).writeString(userId).writeUVarint(argsBuffer.length).writeBuffer(argsBuffer).toBuffer());
      } else {
        addPendingMessage(stateId, userId);
      }
    }
  }
};
var coordinator = await register(new Store());
async function loadState(stateId) {
  let rows;
  try {
    rows = log.load(stateId);
  } catch (e) {
    console.error("Unable to load state", stateId.toString(36));
    return;
  }
  const { time, record } = rows[0];
  const reader = new import_bin_serde3.Reader(record);
  const seed = reader.readUInt64();
  const userId = reader.readString();
  const argsBuffer = reader.readBuffer(reader.readUVarint());
  const chance2 = (0, import_chance.Chance)(seed.toString());
  const impl = new ImplWrapper(ctxNoEvents(chance2, time), argsBuffer);
  for (let i = 1; i < rows.length; i++) {
    const { time: time2, record: record2 } = rows[i];
    const reader2 = new import_bin_serde3.Reader(record2);
    const method = reader2.readUInt8();
    if (method === 255) {
      const timeDelta = reader2.readUVarint();
      await impl.onTick(ctxNoEvents(chance2, time2), timeDelta / 1e3);
      continue;
    }
    const userId2 = reader2.readString();
    const argsBuffer2 = reader2.readBuffer(reader2.readUVarint());
    await impl.getResult(userId2, method, ctxNoEvents(chance2, time2), argsBuffer2);
  }
  return { impl, chance: chance2 };
}
async function sendSnapshot(stateId, userId) {
  const { impl, subscriptions } = stateInfo.get(stateId);
  const userState = await impl.getUserState(userId);
  const validationErrors = PlayerState.validate(userState);
  if (validationErrors.length > 0) {
    console.error("Invalid user state: ", validationErrors);
    coordinator.stateUpdate(stateId, userId, Buffer.from(encodeStateError()));
    return;
  }
  subscriptions.set(userId, { userState: JSON.parse(JSON.stringify(userState)), changedAt: 0, messages: [] });
  const buf = encodeStateSnapshot(userState);
  coordinator.stateUpdate(stateId, userId, Buffer.from(buf));
}
async function sendUpdates(stateId, changedAt) {
  if (stateInfo.has(stateId)) {
    const { impl, subscriptions } = stateInfo.get(stateId);
    for (const [userId, userInfo] of subscriptions) {
      const { userState: prevUserState, changedAt: prevChangedAt, messages } = userInfo;
      const currUserState = await impl.getUserState(userId);
      const validationErrors = PlayerState.validate(currUserState);
      if (validationErrors.length > 0) {
        console.error("Invalid user state: ", validationErrors);
        coordinator.stateUpdate(stateId, userId, Buffer.from(encodeStateError()));
        return;
      }
      const diff = computeDiff(currUserState, prevUserState);
      if (diff !== NO_DIFF || messages.length > 0) {
        const buf = encodeStateUpdate(diff !== NO_DIFF ? diff : void 0, changedAt - prevChangedAt, messages);
        coordinator.stateUpdate(stateId, userId, Buffer.from(buf));
        subscriptions.set(userId, { userState: JSON.parse(JSON.stringify(currUserState)), changedAt, messages: [] });
      }
    }
  }
}
function sendMessages(stateId, userId) {
  const messages = stateInfo.get(stateId)?.subscriptions.get(userId)?.messages;
  if (messages !== void 0) {
    const buf = encodeStateUpdate(void 0, 0, messages);
    coordinator.stateUpdate(stateId, userId, Buffer.from(buf));
    messages.splice(0);
  }
}
function ctx(chance2, time, stateId) {
  return {
    chance: chance2,
    time,
    sendEvent(event, userId) {
      const userInfo = stateInfo.get(stateId)?.subscriptions.get(userId);
      if (userInfo !== void 0) {
        userInfo.messages.push(Message.event(event));
        if (!changedStates.has(stateId)) {
          addPendingMessage(stateId, userId);
        }
      }
    },
    broadcastEvent(event) {
      if (stateInfo.has(stateId)) {
        for (const [userId, { messages }] of stateInfo.get(stateId).subscriptions) {
          messages.push(Message.event(event));
          if (!changedStates.has(stateId)) {
            addPendingMessage(stateId, userId);
          }
        }
      }
    }
  };
}
function ctxNoEvents(chance2, time) {
  return { chance: chance2, time, sendEvent() {
  }, broadcastEvent() {
  } };
}
function addPendingMessage(stateId, userId) {
  if (!pendingMessages.has(stateId)) {
    pendingMessages.set(stateId, /* @__PURE__ */ new Set());
  }
  pendingMessages.get(stateId).add(userId);
}
export {
  loadState
};
/*!
 * Copyright (c) 2018 Rafael da Silva Rocha.
 */
/*! https://mths.be/codepointat v0.2.0 by @mathias */
