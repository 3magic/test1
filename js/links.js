/*
 * Internal link resolver — shared across every page.
 *
 * Authoring rule: give any internal link a `data-link` attribute holding its path
 * relative to the SITE ROOT (e.g. data-link="magazine/", data-link="product/3magic/",
 * data-link="" for the home page). Keep a normal root-relative href ("/…") as a
 * no-JS fallback for the deployed (http/https) site.
 *
 * This script lives at <site-root>/js/links.js, so it can recover the absolute site
 * root from its own <script src> — which works whether the site is served from a
 * domain root, a sub-path, or opened straight from disk (file://). Resolving links
 * against that absolute root means no page ever needs to know its own depth.
 *
 * A trailing "/" is expanded to "/index.html" because file:// has no directory index.
 */
(function () {
  var self = document.currentScript ||
    (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();

  // Strip the trailing "js/<file>" to get the site-root URL (keeps the trailing slash).
  var root = self.src.replace(/js\/[^/]*$/, '');

  function resolve() {
    document.querySelectorAll('[data-link]').forEach(function (a) {
      var href = root + a.getAttribute('data-link');
      if (href.charAt(href.length - 1) === '/') href += 'index.html';
      a.setAttribute('href', href);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resolve);
  } else {
    resolve();
  }
})();
