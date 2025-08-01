# td-js-sdk

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/treasure-data/td-js-sdk/tree/master.svg?style=svg&circle-token=6fcc04c8184f1b266519f0d0f8901b043af421db)](https://dl.circleci.com/status-badge/redirect/gh/treasure-data/td-js-sdk/tree/master)

> :warning: NOTE: From the version 4.0, we will use our new JavaScript endpoint to log data. This new behavior requires configuration changes, see [Streaming Ingestion](STREAMING_INGESTION.md) for more information.

# Table of Contents
[Getting started](#getting-started)

[Tracking](#tracking)

[Data privacy](#data-privacy)

[SameSite Cookies](#samesite-cookies)

[Consent Management](CONSENTMANAGER.md)

[Streaming Ingestion](STREAMING_INGESTION.md)

[Collecting third-party tags](COLLECTING_TAGS.md)

[Personalization 2.0](PERSONALIZATION_2.md)

[UTM Parameters Tracking](UTM.md)

[API](#api)

[Others](#support)

---


## Build

The build script (`bin/build.sh`) can be used to configure several aspects of the SDK:

### GLOBAL
The global export that the SDK is exported on.  This is kept consistent between the full source and the loader's stub.
```sh
> bin/build.sh --GLOBAL=AlternateSDK
```
```js
var sdk = new AlternateSDK()
```

### FILENAME
The filename to be output, in both full and minified code. This is largely a convenience, and defaults to `td`
```sh
> bin/build.sh --FILENAME=foo
...
> ls dist/
foo.js      foo.min.js      loader.min.js
```

### URL
The URL of the hosted file. This will be defaulted to the URL for the Treasure Data CDN-hosted file.
```sh
> bin/build.sh --URL=//cdn.yourdomain.com/sdk/foo.min.js
```

## Installing

### Script snippet

Install td-js-sdk on your page by copying the appropriate JavaScript snippet below and pasting it into your page's `<head>` tag:

```html
<script type="text/javascript">
!function(t,e){if(void 0===e[t]){e[t]=function(){e[t].clients.push(this),this._init=[Array.prototype.slice.call(arguments)]},e[t].clients=[];for(var r=function(t){return function(){return this["_"+t]=this["_"+t]||[],this["_"+t].push(Array.prototype.slice.call(arguments)),this}},s=["collectTags","addRecord","blockEvents","fetchServerCookie","fetchGlobalID","fetchUserSegments","fetchPersonalization","resetUUID","ready","setSignedMode","setAnonymousMode","set","trackEvent","trackPageview","trackClicks","unblockEvents"],c=0;c<s.length;c++){var o=s[c];e[t].prototype[o]=r(o)}var n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=("https:"===document.location.protocol?"https:":"http:")+"//cdn.treasuredata.com/sdk/4.4/td.min.js";var i=document.getElementsByTagName("script")[0];i.parentNode.insertBefore(n,i)}}("Treasure",this);
</script>
```

### npm

Does not work with NodeJS. **Browser only**.

```sh
npm install --save td-js-sdk
```

Exports Treasure class using CommonJS. The entry point is `lib/treasure.js`. Usable with a build tool such as Browserify or Webpack.

```javascript
var Treasure = require('td-js-sdk')
```

## Getting started

### Get your write-only API key

Log in to [Treasure Data](https://console.treasuredata.com/) and go to your [profile](https://console.treasuredata.com/users/current). The API key should show up right next to your full-access key.

### Initializing

> :warning: NOTE: From the version 4.0, we will use our new JavaScript endpoint to log data. This new behavior requires configuration changes, see [Streaming Ingestion](STREAMING_INGESTION.md) for more information.

Our library works by creating an instance per database, and sending data into tables.

First install the library using any of the ways provided above.

After installing, initializing it is as simple as:

```javascript
  var foo = new Treasure({
    database: 'foo',
    writeKey: 'your_write_only_key'
  });
```

If you're an administrator, databases will automatically be created for you. Otherwise you'll need to ask an administrator to create the database and grant you `import only` or `full access` on it, otherwise you will be unable to send events.

### Sending your first event

```javascript
// Configure an instance for your database
var company = new Treasure({...});

// Create a data object with the properties you want to send
var sale = {
  itemId: 101,
  saleId: 10,
  userId: 1
};

// Send it to the 'sales' table
company.addRecord('sales', sale);
```

Send as many events as you like. Each event will fire off asynchronously.


## Tracking

td-js-sdk provides a way to track page impressions and events, as well as client information.

### Client ID and Storage

Each client requires a uuid. It may be set explicitly by setting `clientId` on the configuration object. Otherwise we search the cookies for a previously set uuid. If unable to find one, a uuid will be generated.

A cookie is set in order to track the client across sessions.

### Page impressions

Tracking page impressions is as easy as:

```javascript
/* insert javascript snippet */
var td = new Treasure({...});
td.trackPageview('pageviews');
```

This will send all the tracked information to the pageviews table.

### Event tracking

In addition to tracking pageviews, you can track events. The syntax is similar to `addRecord`, with the difference being that `trackEvent` will include all the tracked information.

```javascript
var td = new Treasure({});

var buttonEvent1 = function () {
  td.trackEvent('button', {
    number: 1
  });

  // doButtonEvent(1);
};

var buttonEvent2 = function () {
  td.trackEvent('button', {
    number: 2
  });

  // doButtonEvent(2);
};
```

### Tracked information

Every time a track functions is called, the following information is sent:

* **td_version** - td-js-sdk's version
* **td_client_id** - client's uuid*
* **td_charset** - character set
* **td_description** - description meta tag
* **td_language** - browser language
* **td_color** - screen color depth
* **td_screen** - screen resolution
* **td_viewport** - viewport size
* **td_title** - document title
* **td_url** - document url
* **td_user_agent** - browser user agent
* **td_platform** - browser platform
* **td_host** - document host
* **td_path** - document pathname
* **td_referrer** - document referrer

The following information will be populated by server-side

* **td_ip** - request IP (server)*. This information is only populated when `td_global_id` is enabled using `td.set('$global', 'td_global_id', 'td_global_id')` and is in signed mode.

All server values except `td_ip` are found by parsing the user-agent string. This is done server-side to ensure that it can be kept up to date.

<nowiki>*</nowiki> This is a personally identifiable column, and will be affected by whether or not the user is in Signed or Anonymous Mode.


## Default values

Set default values on a table by using `Treasure#set`. Set default values on *all* tables by passing `$global` as the table name.

Using `Treasure#get` you can view all global properties by passing the table name `$global`.

When a record is sent, an empty record object is created and properties are applied to it in the following order:

1. `$global` properties are applied to `record` object
2. Table properties are applied to `record` object, overwriting `$global` properties
3. Record properties passed to `addRecord` function are applied to `record` object, overwriting table properties

## Data Privacy

Treasure Data's SDK enables compliance with many common requirements of the EU's GDPR laws. Several methods have been enabled to help you comply with newer and more stringent data privacy policies:

* `blockEvents` / `unblockEvents` - non-argument methods to shut down or re-enable all sending of events to Treasure Data. No messages will be sent, no calls will be cached. Default is for events to be unblocked. See documentation around these methods: [`blockEvents`](#treasureblockevents), [`unblockEvents`](#treasureunblockevents), [`areEventsBlocked`](#treasureareeventsblocked)
* `setSignedMode` - non-argument method to enter "Signed Mode", where some PII may be collected automatically by the SDK. The data sent to Treasure Data will include `td_ip`, `td_client_id`, and `td_global_id`, if specified. See documentation around this method: [`setSignedMode`](#treasuresetsignedmode)
* `setAnonymousMode` - non-argument method to enter "Anonymous Mode", where PII will not be collected automatically by the SDK.  These data will specifically omit `td_ip`, `td_client_id`, and `td_global_id`, if specified.  This is the default behavior.  See documentation around this method: [`setAnonymousMode`](#treasuresetanonymousmode)
* `resetUUID` - method to reset the `td_client_id` value.  This will overwrite the original value stored on the user's cookie, and will likely appear in your data as a brand-new user.  It's possible to specify a client ID while resetting, as well as custom expiration times by passing in appropriate values.  See documentation around this method: [`resetUUID`](#treasureresetuuid)

A new configuration property has also been added: `config.startInSignedMode`.  This configuration option tells the SDK that, if no express decision has been made on whether the user wants to be in Signed or Anonymous modes, it should default into Signed Mode. The default behavior is to default the user into Anonymous Mode.

### Examples
Suppose a user first accesses your site, and you need to know if they have agreed to tracking for marketing purposes.  You contract with a Consent Management Vendor to maintain this information, and want to set appropriate values once you know their consent information.
```js
var foo = new Treasure({
  database: 'foo',
  writeKey: 'your_write_only_key'
});
td.trackClicks()

var successConsentCallback = function (consented) {
  if (consented) {
    td.setSignedMode()
  } else {
    td.setAnonymousMode()
  }
}

var failureConsentCallback = function () {
  // error occurred, consent unknown
  td.setAnonymousMode()
}

ConsentManagementVendor.getConsent(userId, successConsentCallback, failureConsentCallback)
```

In this scenario, the Consent Management Vendor returns a true or false value in the callback based on whether or not the user associated with the `userId` has consented to their PII being used for marketing purposes.  Non-PII data may still be collected.

Now suppose your Consent Management Vendor provides strings based on the consent level: `MARKETING`, `NON-MARKETING`, `REFUSED`, for "Consented to PII being used for marketing purposes", "Consented to data being collected for non-marketing purposes", and "Refused all data collection".  There's only a minor change to make in the `successConsentCallback`:

```js
var successConsentCallback = function (consented) {
  if (consented === 'MARKETING') {
    td.unblockEvents()
    td.setSignedMode()
  } else if (consented === 'NON-MARKETING') {
    td.unblockEvents()
    td.setAnonymousMode()
  } else if (consented === 'REFUSED') {
    td.blockEvents()
  }
}
```

This way, when emerging from Signed or Anonymous mode, you can be sure you'll actually be collecting data in Treasure Data. If the customer has refused all tracking, their events are blocked, and this status will be persisted across page refreshes.

## SameSite cookies

> :warning: **WARNING**: If you see the warnings about `SameSite` cookies in Chrome or Firefox, please upgrade the TreasureData JS SDK to version of at least `2.4.2`

In recent releases of Chrome and Firefox, they begin enforcing a new secure-by-default cookie classification system, treating cookies that have no declared SameSite value as `SameSite=Lax` cookies. Only cookies set as `SameSite=None; Secure` will be available in third-party contexts, provided they are being accessed from secure connections.

This affects the **td_client_id** and **td_global_id** cookies in previous versions of TreasureData JS SDK (< 2.4.2) as they are not set as secured cookies.

Starting from version `2.4.2`, TreasureData JS SDK uses `SameSite=None; Secure` cookies as default to adapt the new cookie enforcement.

For more information:

Firefox:

[Changes to SameSite Cookie Behavior](https://hacks.mozilla.org/2020/08/changes-to-samesite-cookie-behavior/)

Chrome:

[SameSite Cookie Changes in February 2020: What You Need to Know](https://blog.chromium.org/2020/02/samesite-cookie-changes-in-february.html)

## API

### Treasure(config)

Creates a new Treasure logger instance.
If the database does not exist and you have permissions, it will be created for you.

**Parameters:**

* **config** : Object (required) - instance configuration

**Core parameters:**

* **config.database** : String (required) - database name, must consist only of lower case letters, numbers, and `_`, must be longer than or equal to 3 chars, and the total length of database and table must be shorter than 129 chars.
* **config.writeKey** : String (required) - write-only key, get it from your [user profile](console.treasuredata.com/users/current)
* **config.pathname** : String (optional) - path to append after host. Default: `/js/v3/event`
* **config.host** : String (optional) - host to which events get sent. Default: `in.treasuredata.com`
* **config.development** : Boolean (optional) - triggers development mode which causes requests to be logged and not get sent. Default: `false`
* **config.logging** : Boolean (optional) - enable or disable logging. Default: `true`
* **config.globalIdCookie** : String (optional) - cookie td_globalid name. Default: `_td_global`
* **config.startInSignedMode** : Boolean (optional) - Tell the SDK to default to Signed Mode if no choice is already made. Default: `false`
* **config.jsonpTimeout** : Number (optional) - JSONP timeout (in milliseconds) Default: `10000`
* **config.storeConsentByLocalStorage** : Boolean (optional) - Tell the SDK to use localStorage to store user consent. Default: `false`

**Track/Storage parameters:**

* **config.clientId** : String (optional) - uuid for this client. When undefined it will attempt fetching the value from a cookie if storage is enabled, if none is found it will generate a v4 uuid
* **config.storage** : Object | String (optional) - storage configuration object. When `none` it will disable cookie storage
* **config.storage.name** : String (optional) - cookie name. Default: `_td`
* **config.storage.expires** : Number (optional) - cookie expiration in seconds. When 0 it will expire with the session. Default: `63072000` (2 years)
* **config.storage.domain** : String (optional) - cookie domain. Default: result of `document.location.hostname`
> :warning: NOTE: If **config.storage.domain** would be not set, td-js-sdk may create cookies against multiple domains.
> For example, suppose you have td-js-sdk located at foo.bar.com.
> If **config.storage.domain** is not set, td-js-sdk will create two cookies for foo.bar.com and bar.com.
> In other words, if you don't want cookies created for higher level domains, you need to set domain parameter to the specific domain.

**Server Side Cookie:**
* **config.useServerSideCookie** : Boolean (optional) - enables/disable using ServerSide Cookie. Default: `false`
* **config.sscDomain** : String | () => String (optional) - Domain against which the Server Side Cookie is set. Default: `window.location.hostname`
* **config.sscServer** : String | (String) => String (optional) - hostname to request server side cookie from. Default: `ssc.${sscDomain}`


**Personalization parameters**

* **config.cdpHost**: String (optional) - The host to use for the Personalization API. Default: 'cdp.in.treasuredata.com'

**Returns:**

* Treasure logger instance object

**Example:**

```javascript
var foo = new Treasure({
  database: 'foo',
  writeKey: 'your_write_only_key'
});
```

### Treasure#addRecord(table, record, success, error)

Sends an event to Treasure Data. If the table does not exist it will be created for you.

Records will have additional properties applied to them if `$global` or table-specific attributes are configured using `Treasure#set`.

:warning: NOTE: This function will not send `td_ip`, `td_client_id`, `td_global_id` automatically, so if you want to send those information along with this
function you have to do it manually, as following:

```
td.ready(function () {
   td.set('$global', 'td_ip', 'ip value');
   td.set('$global', 'td_client_id', td.getTrackValues().td_client_id);
   td.set('$global', 'td_global_id', 'global id value');
   
   td.addRecord(...)
});
```

**Parameters:**

* **table** : String (required) - table name, must consist only of lower case letters, numbers, and `_`, must be longer than or equal to 3 chars, the total length of database and table must be shorter than 129 chars.
* **record** : Object (required) - Object that will be serialized to JSON and sent to the server
* **success** : Function (optional) - Callback for when sending the event is successful
* **error** : Function (optional) - Callback for when sending the event is unsuccessful

**Example:**

```javascript
var company = new Treasure({...});

var sale = {
  itemId: 100,
  saleId: 10,
  userId: 1
};

var successCallback = function () {
  // celebrate();
};

var errorCallback = function () {
  // cry();
}

company.addRecord('sales', sale, successCallback, errorCallback);
```

### Treasure#fetchGlobalID(success, error, forceFetch, options)

**Parameters:**

* **success** : Function (optional) - Callback for when sending the event is successful
* **error** : Function (optional) - Callback for when sending the event is unsuccessful
* **forceFetch** : Boolean (optional) - Forces a refetch of global id and ignores cached version (default false)
* **options** : Object (optional) - Cookie options

**Cookie options:**
```javascript
{
  path: '/',
  domain: 'abc.com',
  secure: true|false,
  maxAge: Number | String | Date,
  sameSite: 'None | Lax | Strict'
}
```
**Note:**
If you set the `sameSite` value to `None`, the `Secure` property of the cookie will be set to true (it overwrites the `secure` option). More details on [SameSite cookies](https://web.dev/samesite-cookies-explained/).

**Example:**

```javascript
var td = new Treasure({...})

var successCallback = function (globalId) {
  // celebrate();
};

var errorCallback = function (error) {
  // cry();
}

td.fetchGlobalID(successCallback, errorCallback)

// with cookie options
td.fetchGlobalID(successCallback, errorCallback, false, {
  path: '/',
  secure: true,
  maxAge: 5 * 60 // 5 minutes,
  sameSite: 'None'
})

```

### Treasure#fetchUserSegments(options, success, error)

**Parameters:**

* **options** : Object (required) - User Segment object
  * **options.audienceToken** : String or Array (required) - Audience Token(s) for the userId
  * **options.keys** : Object (required) - Key Value to be sent for this segment
* **success** : Function (optional) - Callback for receiving the user key and segments
* **error** : Function (optional) - Callback for when sending the event is unsuccessful

**Example:**

```javascript
var td = new Treasure({...})

var successCallback = function (values) {
  /* values format => [... {
    key: {
      [key]:value
    },
    values: ["1234"],
    attributes: {
      age: 30
    },

  } ... ]*/
  // celebrate();
};

var errorCallback = function (error) {
  // cry();
};

td.fetchUserSegments({
  audienceToken: ['token1', 'token2'],
  keys: {
    someKey: 'someValue',
    someOtherKey: 'someOtherValue',
  }
}, successCallback, errorCallback)
```
*N.B.* This feature is not enabled on accounts by default, please contact support for more information.

### Treasure#blockEvents

Block all events from being sent to Treasure Data.

**Example:**

```javascript
var td = new Treasure({...})
td.trackEvent('customevent')
td.blockEvents()
td.trackEvent('willnotbetracked')
```

### Treasure#unblockEvents

Unblock all events; events will be sent to Treasure Data.

**Example:**

```javascript
var td = new Treasure({...})
td.blockEvents()
td.trackEvent('willnotbetracked')
td.unblockEvents()
td.trackEvent('willbetracked')
```

### Treasure#areEventsBlocked

Informational method, expressing whether events are blocked or not.

**Example:**

```javascript
var td = new Treasure({...})
td.areEventsBlocked() // false, default
td.blockEvents()
td.areEventsBlocked() // true
```

### Treasure#setSignedMode

Permit sending of Personally Identifying Information over the wire: td_ip, td_client_id, and td_global_id

**Example:**

```javascript
var td = new Treasure({...})
td.setSignedMode()
td.trackEvent('willbetracked') // will send td_ip and td_client_id; td_global_id will also be sent if set.
```

### Treasure#setAnonymousMode

Prohibit sending of Personally Identifying Information over the wire: td_ip, td_client_id, and td_global_id

**Parameters**:
* **keepIdentifier**: Boolean (optional) - Keep the cookies

By default `setAnonymousMode` will remove all cookies that are set by Treasure Data JavaScript SDK, you can set `keepIdentifier` parameter to `true` to not remove the cookies.

**Example:**

```javascript
var td = new Treasure({...})
td.setAnonymousMode()
td.trackEvent('willbetracked') // will NOT send td_ip and td_client_id; td_global_id will also NOT be sent if set.
```

### Treasure#inSignedMode

Informational method, indicating whether `trackEvents` method will automatically collect td_ip, td_client_id, and td_global_id if set.

**Example:**

```javascript
var td = new Treasure({...})
td.inSignedMode() // false, default
td.trackEvent('willbetracked') // will NOT send td_ip and td_client_id; td_global_id will also NOT be sent if set.
td.setSignedMode()
td.inSignedMode() // true
td.trackEvent('willbetracked') // will send td_ip and td_client_id; td_global_id will also be sent if set.
```

### Treasure#fetchServerCookie(success, error, forceFetch)
This functionality complies with ITP 1.2 tracking. Contact customer support for enabling this feature.

**Parameters:**

* **success** : Function (optional) - Callback for when sending the event is successful
* **error** : Function (optional) - Callback for when sending the event is unsuccessful
* **forceFetch** : Boolean (optional) - Forces a refetch of server side id and ignores cached version (default false)

**Example:**

```javascript
var td = new Treasure({...})

var successCallback = function (serverSideId) {
  // celebrate();
};

var errorCallback = function (error) {
  // cry();
}

td.fetchServerCookie(successCallback, errorCallback)
```


### Treasure#resetUUID

**Parameters:**

* **suggestedStorage** : Object (optional) - Custom storage configuration
* **suggestedClientId** : String (optional) - Custom client id

Reset the client's UUID, set to Treasure Data as `td_client_id`. You can specify custom storage and custom client id.

See **Track/Storage parameters** section for more information on storage's configuration

**Example:**

```javascript
var td = new Treasure({...})
td.resetUUID() // set td_client_id as random uuid
```

```javascript
var td = new Treasure({...})
td.resetUUID(
  {
    name: '_td', // cookie name
    expires: 63072000,
    domain: 'domain',
    customDomain: true/false
    path: '/'
  },
  'xxx-xxx-xxxx' // client id
)
```

### Treasure#trackClicks

Setup an event listener to automatically log clicks.
The event will be hooked only follows
- `role=button` or `role=link`
- `<a>`
- `<button>`
- `<input>)`. exclude for `<input type='password'>`

**Example:**
```javascript
var td = new Treasure({...})
td.trackClicks({
    element         : '...'
    extendClickData : '...'
    ignoreAttribute : '...'
    tableName       : '...'
    })
```
- element: HTMLElement -> Default is `window.document`. Default setting will observe all elements above. You can set an element if you want to focus on a particular element.
- extendClickData: Function -> Default is function to set element attributes. You can set function adding special tracking data by extending `function(e: event, elementData: ElementObject)`.
- ignoreAttribute: string -> Default is `"td-ignore"` You can set attribute name to ignore element. (e.g. `<span role='button' class='button-design' id='button-id' td-ignore />`)
- tableName: string -> Default tableName is `"clicks"`. Click tracking event will be stored into `tableName` in TreasureData


### Treasure#trackPageview(table, success, error)

Helper function that calls trackEvent with an empty record.

**Parameters:**

* **table** : String (required) - table name, must be between 3 and 255 characters and must consist only of lower case letters, numbers, and _
* **success** : Function (optional) - Callback for when sending the event is successful
* **error** : Function (optional) - Callback for when sending the event is unsuccessful

**Example:**

```javascript
var td = new Treasure({...});
td.trackPageview('pageviews');
```

### Treasure#trackEvent(table, record, success, error)

Creates an empty object, applies all tracked information values, and applies record values. Then it calls `addRecord` with the newly created object.

**Parameters:**

* **table** : String (required) - table name, must be between 3 and 255 characters and must consist only of lower case letters, numbers, and _
* **record** : Object (optional) - Additional key-value pairs that get sent with the tracked values. These values overwrite default tracking values
* **success** : Function (optional) - Callback for when sending the event is successful
* **error** : Function (optional) - Callback for when sending the event is unsuccessful

**Example:**

```javascript
var td = new Treasure({...});

td.trackEvent('events');
/* Sends:
{
  "td_ip": "192.168.0.1",
  ...
}
*/

td.trackEvent('events', {td_ip: '0.0.0.0'});
/* Sends:
{
  "td_ip": "0.0.0.0",
  ...
}
*/
```

### Treasure#set()

Default value setter for tables. Set default values for all tables by using `$global` as the setter's table name.

#### Treasure#set(table, key, value)

Useful when you want to set a single value.

**Parameters:**

* **table** : String (required) - table name
* **key** : String (required) - property name
* **value** : String | Number | Object (required) - property value

**Example:**

```javascript
var td = new Treasure({...})
td.set('table', 'foo', 'bar');
td.addRecord('table', {baz: 'qux'});
/* Sends:
{
  "foo": "bar",
  "baz": "qux"
}
*/
```

#### Treasure#set(table, properties)

Useful when you want to set multiple values.

**Parameters:**

* **table** : String (required) - table name
* **properties** : Object (required) - Object with keys and values that you wish applies on the table each time a record is sent

**Example:**

```javascript
var td = new Treasure({...})
td.set('table', {foo: 'foo', bar: 'bar'});
td.addRecord('table', {baz: 'baz'});
/* Sends:
{
  "foo": "foo",
  "bar": "bar",
  "baz": "baz"
}
*/
```


### Treasure#get(table)

Takes a table name and returns an object with its default values.

**NOTE:** This is only available once the library has loaded. Wrap any getter with a `Treasure#ready` callback to ensure the library is loaded.

**Parameters:**

* **table** : String (required) - table name

**Example:**

```javascript
var td = new Treasure({..});
td.set('table', 'foo', 'bar');
td.get('table');
// {foo: 'bar'}
```


### Treasure#ready(fn)

Takes a callback which gets called one the library and DOM have both finished loading.

**Parameters:**

* **fn** : Function (required) - callback function

```javascript
/* javascript snippet here */
var td = new Treasure({...})
td.set('table', 'foo', 'bar');

td.ready(function(){
  td.get('table');
  // {foo: 'bar'}
});
```

## Support

Need a hand with something? Shoot us an email at [support@treasuredata.com](mailto:support@treasuredata.com)


## FAQ

* How does the async script snippet work?

The async script snippet will create a fake Treasure object on the window and inject the async script tag with the td-js-sdk url. This fake Treasure object includes a fake of all the public methods exposed by the real version. As you call different methods, they will be buffered in memory until the real td-js-sdk has loaded. Upon td-js-sdk loading, it will look for existing clients and process their buffered actions.

The unminified script loader can be seen in [src/loader.js](src/loader.js). The code to load existing clients and their buffered actions once td-js-sdk has been loaded can be seen in [lib/loadClients.js](lib/loadClients.js).


## Other

### Dependency version notes

* `domready` is kept at `0.3.0` for IE6 and above support
* td-js-sdk doesn't support IE6,7 on version 1.5.2 or later.

## Contributing

### Running the test suite on BrowserStack

First you'll need to install `BrowserStackTunnel`. You can download the binary from [the BrowserStack website](https://www.browserstack.com/local-testing). If you're on Mac OS you can install it through homebrew: `brew install caskroom/cask/browserstacklocal`.

Next, you'll need to set the appropriate environment variables:
 - `BROWSER_STACK_BINARY_BASE_PATH`: This should be the directory you put the `BrowserStackTunnel` binary in. If you installed with homebrew you can run `which browserstacklocal` to find the directory.
 - `BROWSER_STACK_USERNAME`: You can find this under the *Automate* section of
the [BrowserStack account settings page](https://www.browserstack.com/accounts/settings)
 - `BROWSER_STACK_ACCESS_KEY`: You can find this under the *Automate* section of
the [BrowserStack account settings page](https://www.browserstack.com/accounts/settings)

Now, you can run the command `npm run test-full`.
