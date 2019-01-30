# Changelog

## 2.1.0 (2018-05-24)
* Modifications to release scripts for test environments
* Add `startInSignedMode` property to select the default behavior

## 2.0.0 (2018-05-17)
* Web Personalization API v2 now provides key attribute values
* GDPR compliance methods added, see [README](README.md#dataprivacy)
* New Build system and process to help releases
* Add iOS and Android browsers to E2E test matrix
* Customizable table name for click events

## 1.9.1 (2017-11-17)
* Corrected cookie expiration date issue
* Always return key or keys from Personalization API
* Correct two possible scenarios for initialization failures

## 1.9.0 (2017-11-07)
* Add support for CDP segmentation token & keys to the Personalization API
* Add td_description tracked value

## 1.8.6 (2017-10-22)
* Full release of fix for td_client_id being set to `'undefined'`
* `https` protocol used for all JSONP requests
* `getCookie` method added to easily access cookie contents
* Modify build process to allow easier rebranding
* Allow CDP customers to configure hostname for Personalization API
* Changes to build process to allow for more reliable tests
* Fix e2e test broken by renaming of `onClick` handler to `extendClickData`

## 1.8.5-beta1 (2017-07-11)
* Beta test of fix for td_client_id being set to `'undefined'`

## 1.8.4 (2017-07-10)
* Full release of fix for IE8/9 support

## 1.8.4-beta1 (2017-06-23)
* Beta test of fix for IE8/9 support

## 1.8.3 (2017-05-22)
* Bumped version reported by `Treasure#version`

## 1.8.2 (2017-5-22)
* Added `hasAttribute` polyfill for IE8

## 1.8.1 (2017-5-01)
* Allow for CDP host to be configured

## 1.8.0 (2017-4-24)
* Add fetchUserSegments

## 1.7.2 (2016-12-15)

* When available, use record's time to overwrite the default import time

## 1.7.1 (2016-11-01)

* Refactor internal util usage to reduce resulting bundle size

## 1.7.0 (2016-10-25)

* Add fetchGlobalID
* Replace Buffer usage with toBase64 util

## 1.6.0 (2016-07-06)

* Add td_platform and td_user_agent tracked values
* Add clicks plugins, usable with trackClicks method
* Add scripts for building loader and uploading releases

## 1.5.2 (2016-03-08)

* Add global package for safely resolving the window object
* Strip null values from clientId
* Use performance.now when generating a UUID if it's available
* Remove bundle-collapser
* Always use http or https protocol

## 1.5.1 (2015-10-06)

* Use Buffer to get base64 string
* Remove Base64 dependency

## 1.5.0 (2015-10-05)

* Improve browser support to include IE8 without having to include polyfills
* Improve tests to run on older browsers
* Remove legacy version of td-js-sdk
* Remove bower support
* Replace karma with zuul
* Replace gulp with npm run-scripts
* Remove examples
* Replace chai with expect.js
* Replace lodash with lodash-compat
* Update lodash file so we only include the parts we need in order to reduce the bundle size
* Break out utility functions and add tests
* Update code to follow Standard style
* Add Base64 dependency
* Add invariant dependency
* Remove es5-shim dependency

## 1.4.0 (2015-08-28)

* Remove has-cors
* Remove superagent
* Fix documentation link in Error
* Remove xhr requestType and force jsonp

## 1.3.0 (2015-01-20)

* Bump cookies-js dependency to `^1.1.0`
* Bump jsonp dependency to `^0.1.0`
* Bump superagent dependency to `^0.21.0`
* Bump verge dependency to `^1.9.1`
* Expose DEFAULT_CONFIG for customizations, for usage look at examples/wrapper
* Add legacy and modern build
* Publish on npm

## 1.2.0 (2014-09-03)

* Removed broken AMD snippet
* Manually set domain now overwrites default behavior
* IPv4 and localhost now gets cookie set as expected
* Cookie expiration is now set as expected
* When domain is not set it will attempt to recursively set the cookie on top domain until it succeeds. For example, with domains: `bar.foo.com`, `baz.foo.com`, `foo.com`. It will attempt setting the cookie on `.com` and it'll fail, then it'll try to set it on `.foo.com` and it'll succeed. All three domains will use the `.foo.com` cookie.

## 1.1.1 (2014-08-18)

* td_referrer was not being set correctly, it should be using `document.referrer`

## 1.1.0 (2014-08-06)

* Fix issue where domain and expiration were not passed to tracking cookie setter
* Tracking cookie is now always set on the top level qualified domain
* `expiration` key renamed to `expires`
* Remove `none` option from cookie domain settings

## 1.0.0 (2014-07-16)

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

## 0.1.1 (2014-06-20)

* **core:** protocol should always be http or https
* **loader:** detect protocol in snippet

## 0.1.0 (2014-06-19)

* Initial release
