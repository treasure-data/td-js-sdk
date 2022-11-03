# Streaming Ingestion

## Configurations

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
    host: 'us01.records.in.treasuredata.com'
  });
```

## Limitations & Changed behavior

Using Real-time segmentation requires routing enablement from the Backend. Please reach out to **Treasure Data Support** and give us the `account`, `database`, and `table` to enable routing for, and we can do that from the backend.
We will remove this limitation in the future release.
