/*!
 * Simple-Jekyll-Search
 * Copyright 2015-2020, Christian Fei
 * Licensed under the MIT License.
 */
(function () {
  "use strict";

  // Template Compiler
  var f = {
    compile: function (data) {
      return i.template.replace(i.pattern, function (match, key) {
        var value = i.middleware(key, data[key], i.template);
        return value !== undefined ? value : data[key] || match;
      });
    },
    setOptions: function (options) {
      i.pattern = options.pattern || i.pattern;
      i.template = options.template || i.template;
      if (typeof options.middleware === "function") {
        i.middleware = options.middleware;
      }
    },
  };

  // Default template options
  const i = {
    pattern: /\{(.*?)\}/g,
    template: "",
    middleware: function () {},
  };

  // Fuzzy Search Algorithm
  var n = function (pattern, text) {
    var textLen = text.length,
      patternLen = pattern.length;
    if (patternLen > textLen) return false;
    if (patternLen === textLen) return pattern === text;

    let textIndex = 0;
    for (let i = 0; i < patternLen; i++) {
      let charCode = pattern.charCodeAt(i);
      while (textIndex < textLen) {
        if (text.charCodeAt(textIndex++) === charCode) break;
      }
      if (textIndex === textLen) return false;
    }
    return true;
  };

  // Exact match search
  var e = new (function () {
    this.matches = function (text, query) {
      return n(query.toLowerCase(), text.toLowerCase());
    };
  })();

  // Keyword match search
  var r = new (function () {
    this.matches = function (text, query) {
      if (!text) return false;
      text = text.trim().toLowerCase();
      query = query.trim().toLowerCase();
      return query
        .split(" ")
        .filter(function (word) {
          return text.includes(word);
        }).length === query.split(" ").length;
    };
  })();

  // Search index and engine
  var d = {
    put: function (data) {
      if (isValidObject(data)) return addToIndex(data);
      if (Array.isArray(data)) return data.map(addToIndex);
      return undefined;
    },
    clear: function () {
      return (u.length = 0), u;
    },
    search: function (query) {
      return query
        ? searchInIndex(u, query, c.searchStrategy, c).sort(c.sort)
        : [];
    },
    setOptions: function (options) {
      c = options || {};
      c.fuzzy = options.fuzzy || false;
      c.limit = options.limit || 10;
      c.searchStrategy = options.fuzzy ? e : r;
      c.sort = options.sort || defaultSort;
      c.exclude = options.exclude || [];
    },
  };

  // Utility functions
  function defaultSort() {
    return 0;
  }

  const u = [];
  let c = {};

  function isValidObject(obj) {
    return obj && Object.prototype.toString.call(obj) === "[object Object]";
  }

  function addToIndex(item) {
    u.push(item);
    return u;
  }

  function searchInIndex(index, query, strategy, options) {
    const results = [];
    for (let i = 0; i < index.length && results.length < options.limit; i++) {
      let match = findMatch(index[i], query, strategy, options);
      if (match) results.push(match);
    }
    return results;
  }

  function findMatch(item, query, strategy, options) {
    for (const key in item) {
      if (
        !isExcludedKey(key, options.exclude) &&
        strategy.matches(item[key], query)
      )
        return item;
    }
  }

  function isExcludedKey(key, excludeList) {
    return excludeList.some((pattern) => new RegExp(pattern).test(key));
  }

  // JSON Loader
  var p = {
    load: function (url, callback) {
      const xhr = window.XMLHttpRequest
        ? new XMLHttpRequest()
        : new ActiveXObject("Microsoft.XMLHTTP");
      xhr.open("GET", url, true);
      xhr.onreadystatechange = handleResponse(xhr, callback);
      xhr.send();
    },
  };

  function handleResponse(xhr, callback) {
    return function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try {
          callback(null, JSON.parse(xhr.responseText));
        } catch (err) {
          callback(err, null);
        }
      }
    };
  }

  // Initialization and Configuration
  (function (global) {
    let config = {
      searchInput: null,
      resultsContainer: null,
      json: [],
      success: Function.prototype,
      searchResultTemplate: '<li><a href="{url}" title="{desc}">{title}</a></li>',
      templateMiddleware: Function.prototype,
      sortMiddleware: function () {
        return 0;
      },
      noResultsText: "No results found",
      limit: 10,
      fuzzy: false,
      debounceTime: null,
      exclude: [],
    };

    const requiredOptions = ["searchInput", "resultsContainer", "json"];

    // Validate required options
    function validateOptions(options) {
      const missing = requiredOptions.filter((opt) => !options[opt]);
      if (missing.length > 0) {
        throw new Error(
          "SimpleJekyllSearch --- You must specify the following required options: " +
            missing.join(", ")
        );
      }
    }

    function init(options) {
      validateOptions(options);
      config = { ...config, ...options };
      f.setOptions({
        template: config.searchResultTemplate,
        middleware: config.templateMiddleware,
      });
      d.setOptions({
        fuzzy: config.fuzzy,
        limit: config.limit,
        sort: config.sortMiddleware,
        exclude: config.exclude,
      });
      if (Array.isArray(config.json)) {
        setupSearch(config.json);
      } else {
        p.load(config.json, function (err, data) {
          if (err) throw new Error("Failed to load JSON: " + config.json);
          setupSearch(data);
        });
      }
    }

    function setupSearch(data) {
      d.put(data);
      config.searchInput.addEventListener("input", function (event) {
        debounce(() => handleSearch(event.target.value), config.debounceTime)();
      });
    }

    function handleSearch(query) {
      const results = d.search(query);
      displayResults(results);
    }

    function displayResults(results) {
      config.resultsContainer.innerHTML = results.length
        ? results
            .map((result) => f.compile(result))
            .join("")
        : config.noResultsText;
    }

    function debounce(fn, delay) {
      let timer;
      return function () {
        clearTimeout(timer);
        timer = setTimeout(fn, delay || 0);
      };
    }

    global.SimpleJekyllSearch = init;
  })(window);
})();
