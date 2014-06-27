# td-js-sdk
[![Build Status](https://travis-ci.org/treasure-data/td-js-sdk.svg?branch=master)](https://travis-ci.org/treasure-data/td-js-sdk) 
[![Sauce Test Status](https://saucelabs.com/buildstatus/dev-treasuredata)](https://saucelabs.com/u/dev-treasuredata)

## Getting started

### Get your write-only API key

Log in to [Treasure Data](https://console.treasuredata.com/) and go to your [profile](https://console.treasuredata.com/users/current). The API key should show up right next to your full-access key.

### Setup

Install the td-js-sdk on your page by copying the JavaScript snippet below and pasting it into your page's `<head>` tag:

```html
<script type="text/javascript">
!function(t,e){if(void 0===e[t]){e["_"+t]={},e[t]=function(n){e["_"+t].clients=e["_"+t].clients||{},e["_"+t].clients[n.database]=this,this._config=n},e[t].ready=function(n){e["_"+t].ready=e["_"+t].ready||[],e["_"+t].ready.push(n)};for(var n=["addEvent","setGlobalProperties","on"],r=0;r<n.length;r++){var s=n[r],i=function(t){return function(){return this["_"+t]=this["_"+t]||[],this["_"+t].push(arguments),this}};e[t].prototype[s]=i(s)}var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=("https:"===document.location.protocol?"https:":"http:")+"//dyu0x0wekfgrg.cloudfront.net/sdk/td-0.1.1.js";var o=document.getElementsByTagName("script")[0];o.parentNode.insertBefore(a,o)}}("Treasure",this);
</script>
```

Our library works by creating an instances per database, and sending data into tables.

Initializing it is as simple as:

```javascript
  var foo = new Treasure({
    database: 'foo',
    writeKey: 'your_write_only_key'
  });
```

If you're an administrator, databases will automatically be created for you. Otherwise you'll need to ask an administrator to create the database and grant you import only or full access on it, otherwise you will be unable to send events.

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

## API

### Treasure(config)

Creates a new Treasure logger instance.
If the database does not exist and you have permissions, it will be created for you.

**Parameters:**

* config : Object (required) - instance configuration
* config.database : String (required) - database name, must be between 3 and 255 characters and must consist only of lower case letters, numbers, and _
* config.writeKey : String (required) - write-only key, get it from your [user profile](console.treasuredata.com/users/current)
* config.requestType : String (optional) - request type for sending events. Allowed values: `auto`, `xhr`, `jsonp`. Default: `auto` (NOTE: `auto` will set request type to `xhr` unless [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) is not supported, in which case it will use `jsonp`)
* config.protocol : String (optional) - protocol to use for sending events. Allowed values: `auto`, `http`, `https`. Default: `auto`
* config.host : String (optional) - host to which send events. Default: `in.treasuredata.com`

**Returns:**

* Treasure logger instance object

**Example:**

```javascript
var foo = new Treasure({
  database: 'foo',
  writeKey: 'your_write_only_key'
});
```

### Treasure#addRecord(table, eventData, success, error)

Sends an event to Treasure Data. If the table does not exist it will be created for you.

**Parameters:**

* table : String (required) - table name, must be between 3 and 255 characters and must consist only of lower case letters, numbers, and _
* eventData : Object (required) - JavaScript object that will be serialized to JSON and sent to the server
* eventData.time : Number (optional) - Unix timestamp in seconds. Default: current time
* success : Function (optional) - Callback for when sending the event is successful
* error : Function (optional) - Callback for when sending the event is unsuccessful

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

### Treasure#setGlobalProperties(fn)

Takes a callback which gets called with the table name every time an event is added.

Sample use-case: you want to set user attributes on all events that are going to certain tables.

**Parameters:**

* fn : Function (required) - callback, takes a table name as a parameter and must always return an object

**Example:**

```javascript
var company = new Treasure({...});

var sale = {
  itemId: 100,
  saleId: 10,
  userId: 1
};

var userProperties = function (table) {
  if (table === 'sales') {
    return {
      name: 'Foo',
      age: 10
    };
  } else {
    return {};
  }
};

company.setGlobalProperties(userProperties);

company.addRecord('sales', sale);
/* Sends:
{
  "name": "Foo",
  "age": 10,
  "itemId": 100,
  "salesId": 10,
  "userId": 1
}
*/

company.addRecord('other', sale);
/* Sends:
{
  "itemId": 100,
  "salesId": 10,
  "userId": 1
}
*/
```

## Support

Need a hand with something? Join us in [IRC](http://webchat.freenode.net/?channels=treasuredata), or shoot us an email at [support@treasuredata.com](mailto:support@treasuredata.com)
