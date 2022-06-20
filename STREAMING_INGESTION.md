# Streaming Ingestion

## Configurations

We introduce new option to opt-in our new JavaScript endpoint, named `useNewJavaScriptEndpoint`, which has value of `true` or `false`.
When you enable this option, you need to change the `host` configuration as well, so that it will point to our new endpoint

The `host` configuration will have the following values, depending on which environment you want to ingest data.

- AP02 Region
  - **ap02.records.in.treasuredata.com**

- Tokyo Region
  - **ap01.records.in.treasuredata.com**

- US Region
  - **us01.records.in.treasuredata.com**

- EU01 Region
  - **eu01.records.in.treasuredata.com**

Example:

```javascript
  var foo = new Treasure({
    database: 'foo',
    writeKey: 'your_write_only_key',
    useNewJavaScriptEndpoint: true,
    host: 'us01.records.in.treasuredata.com'
  });
```
