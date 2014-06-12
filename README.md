# td-js-sdk v0.1.0

**INCOMPLETE. DO NOT USE.**

## Getting started

### Get your read-only API key

Log in to [Treasure Data](console.treasure.com) and go to your [profile](console.treasuredata.com/users/current). The API key should show up right next to your full-access key.

### Setup

Install the td-js-sdk on your page by copying the JavaScript snippet below and pasting it into your page's `<head>` tag:

```html
<script type="text/javascript">
  // SNIPPET GOES HERE
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
  saleId: 10
  userId: 1,
};

// Send it to the 'sales' table
company.addEvent('sales', sale);
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

### Treasure#addEvent(table, eventData, success, error)

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
  itemId: 100
  saleId: 10,
  userId: 1
};

var successCallback = function () {
  // celebrate();
};

var errorCallback = function () {
  // cry();
}

company.addEvent('sales', sale, successCallback, errorCallback);
```

## Support

Need a hand with something? Join us in [IRC](http://webchat.freenode.net/?channels=treasuredata), or shoot us an email at [support@treasuredata.com](mailto:support@treasuredata.com)
