# Changelog

## 1.4.0

* Remove has-cors
* Remove superagent
* Fix documentation link in Error
* Remove xhr requestType and force jsonp

## 1.3.0

* Bump cookies-js dependency to `^1.1.0`
* Bump jsonp dependency to `^0.1.0`
* Bump superagent dependency to `^0.21.0`
* Bump verge dependency to `^1.9.1`
* Expose DEFAULT_CONFIG for customizations, for usage look at examples/wrapper
* Add legacy and modern build
* Publish on npm

## 1.2.0

* Removed broken AMD snippet
* Manually set domain now overwrites default behavior
* IPv4 and localhost now gets cookie set as expected
* Cookie expiration is now set as expected
* When domain is not set it will attempt to recursively set the cookie on top domain until it succeeds. For example, with domains: `bar.foo.com`, `baz.foo.com`, `foo.com`. It will attempt setting the cookie on `.com` and it'll fail, then it'll try to set it on `.foo.com` and it'll succeed. All three domains will use the `.foo.com` cookie.

## 1.1.1

* td_referrer was not being set correctly, it should be using `document.referrer`

## 1.1.0

* Fix issue where domain and expiration were not passed to tracking cookie setter
* Tracking cookie is now always set on the top level qualified domain
* `expiration` key renamed to `expires`
* Remove `none` option from cookie domain settings

## 1.0.0

* Convert to CommonJS with Browserify
* Remove `auto` option from config.requestType. Leave undefined for auto-detection
* Remove `auto` option from config.protocol. Leave undefined for auto-detection
* Add E2E tests, runnable by doing `gulp e2e` after setting up webdriver
* Rename Treasure#addEvent to Treasure#addRecord
* Remove Treasure#setGlobalProperties - replaced by Treasure#get and Treasure#set
* Add Treasure#trackPageview - track client page impressions
* Add Treasure#trackEvent - track client information and events
* Add Treasure#ready - callback function once DOM and library have loaded
* Add Treasure#get - global and per value getter
* Add Treasure#set - global and per table value setter
* Add development option to prevent events from sending
* Add logging option to disable logging
* Add tracking functionality which includes uuid and cookie storage

## 0.1.1

* **core:** protocol should always be http or https
* **loader:** detect protocol in snippet

## 0.1.0

* Initial release
