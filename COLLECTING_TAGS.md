# Collecting third-party tags using `collectTags` method

Third-party tags, such as a Meta Click ID, could be embedded in your website as cookies or
request parameters when the user lands on your website via advertising content. The code
below will try to collect the value of the Meta Click ID and upload it together with the page view
event.

```javascript
// Initilize the TD JS SDK
var td = new Treasure({...});

// Declare to collect Meta Click ID
td.collectT ags(
{
  vendors: ['meta']
}
);

// The tag value will be sent together with the page view event
td.trackPageview('page_views');
```

Behind the scenes, the collectTags tries to collect the `fbclid` request parameter, `_fbc` and
`_fbp` cookies, and store them in the `$global` object which will be sent all together with any
tracking payload. Other supported tags from common platforms can be found in the last section.

The exact names of the cookies or request parameters can be used if you are aware of them

```javascript
var td = new Treasure({...});
//Declare to collect cookies and url params using their names
td.collectTags( {
  cookies: ['_cookie_a', '_cookie_b'],
  params: ['param_a', 'param_b']
});

td.trackPageview('page_views');
```

## Supported vendor names
|Platform|Vendor Name|
|---|---|
|Google Ads|google_ads|
|Google Analytics|google_ga|
|Google Markting Cloud|google_mp|
|Meta|meta|
|Instagram|instagram|
|Yahoo! Ads|yahoojp_ads|
|Line|line|
|X(Twitter)|x|
|Pinterest|pinterest|
|Snapchat|snapchat|
|Tiktok|tiktok|
|Marketo|marketo|
|Tealium|tealium|

## API

### Treasure#collectTags(configs, options)

Collect Ads cookies and parameters for Conversion APIs

**Parameters:**

  **configs** : Object (optional) - (Optional) object containing configuration information  
  **options** : Object (optional) - (Optional) object containing extra configurations

  Extra configurations only support Google Marketing Platform (Conversion Linker) for setting
  custom cookie prefix
  
  Example:
 
```javascript
var td = new Treasure({...})

td.collectTags({
  vendors: ['meta', 'google_ga', 'google_mp'],
  cookies: ['_cookie_a', '_cookie_b'],
  params: ['paramA', 'paramB']
}, {
  gclPrefix: '_gcl2'
})
```
