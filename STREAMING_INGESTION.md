# Streaming Ingestion

## Configurations

We introduce a new option to opt-in our new JavaScript endpoint, named `useNewJavaScriptEndpoint`, which has a `true` or `false` value.
When you enable this option, you need to change the `host` configuration as well, so that it will point to our new endpoint

:information_source: This new feature won't impact the server side cookie and the personalization features

The `host` configuration will have the following values, depending on which environment you want to ingest data.

- AP02 Region
  - **ap02.records.in.treasuredata.com**

- Tokyo Region
  - **ap01.records.in.treasuredata.com**

- US Region
  - **us01.records.in.treasuredata.com**

- EU01 Region
  - **eu01.records.in.treasuredata.com**

When you opt-out of this feature by either setting the `useNewJavaScriptEndpoint` to `false` or not setting it, please make sure that
you update the host to the old configuration, as mentioned in [this section](README.md#api)

Example:

```javascript
  var foo = new Treasure({
    database: 'foo',
    writeKey: 'your_write_only_key',
    useNewJavaScriptEndpoint: true,
    host: 'us01.records.in.treasuredata.com'
  });
```

## Limitations & Changed behavior

Using Real-time segmentation requires routing enablement from the Backend. Please reach out to **Treasure Data Support** and give us the `account`, `database`, and `table` to enable routing for, and we can do that from the backend.
We will remove this limitation in the future release.
