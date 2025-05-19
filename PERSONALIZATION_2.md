# Realtime Personalization 2.0

---

Introducing a new API, `fetchPersonalization`, allows customers to fetch personalization data to serve personalized content to consumers.

# API

## fetchPersonalization(configuration, data, successCallback, errorCallback)

- configuration: (Object) contains information needed for the request
  - endpoint: (String) Personalization endpoint
  - database: (String) Database name
  - table: (String) Table name
  - token: (String) Personalization token. Format `account_id/instance_id/xxxxx`
- data: (Object) payload data. This param is optional, passing `null` or `{}` for empty payload.
- successCallback: (Function) successful request callback function
- errorCallback: (Function) failed request callback function

Any information that is marked as sensitive information will be excluded from the response.

## Endpoints

- `us01.p13n.in.treasuredata.com`
- `eu01.p13n.in.treasuredata.com`
- `ap01.p13n.in.treasuredata.com`
- `ap03.p13n.in.treasuredata.com`
