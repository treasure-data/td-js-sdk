# Collecting third-party tags using `collectTags` method

The `collectTags` API automatically collects cookies and URL parameters from third-party advertising platforms (Meta, Google Ads, Yahoo! Ads, etc.) and sends them along with tracking events.

Collected tags are stored in the `$global` object and sent together with all tracking payloads. This enables efficient collection of tracking information required for conversion APIs across various advertising platforms.

## Basic Usage

### Collection by Vendor Names
```javascript
// Initialize TD JS SDK
var td = new Treasure({
  database: 'your_database',
  writeKey: 'your_write_key'
});

// Declare to collect Meta Click ID
td.collectTags({
  vendors: ['meta']
});

// Tag values will be sent together with the page view event
td.trackPageview('page_views');
```

### Collection by Specific Cookie/Parameter Names
```javascript
// Specify cookie names and URL parameter names directly
td.collectTags({
  cookies: ['_custom_cookie', '_another_cookie'],
  params: ['custom_param', 'tracking_id']
});
```

### Multiple Vendor Combinations
```javascript
// Collect from multiple platforms at once
td.collectTags({
  vendors: ['meta', 'google_ga', 'google_mp', 'x', 'tiktok']
});
```

Behind the scenes, the collectTags tries to collect platform-specific cookies and URL parameters (e.g., `fbclid` parameter, `_fbc` and `_fbp` cookies for Meta) and stores them in the `$global` object which will be sent together with any tracking payload.

## Supported Vendors

| Vendor Name | Platform  | Primary Use Case |
|---|---|---|
| `meta` | Meta (Facebook/Instagram) | Facebook advertising tracking |
| `google_ads` | Google Ads | Google advertising click tracking |
| `google_ga` | Google Analytics | Google Analytics user identification |
| `google_mp` | Google Marketing Platform | Google Marketing Platform |
| `instagram` | Instagram | Instagram advertising & user tracking |
| `yahoojp_ads` | Yahoo! JAPAN Ads | Yahoo! Ads & LINE Yahoo! |
| `line` | LINE | LINE advertising tracking |
| `x` | X (formerly Twitter) | X advertising click tracking |
| `pinterest` | Pinterest | Pinterest advertising & EPIK |
| `snapchat` | Snapchat | Snapchat campaign identification |
| `tiktok` | TikTok | TikTok user tracking |
| `marketo` | Marketo | Marketo lead tracking |
| `tealium` | Tealium | Enterprise TMS |

## API Reference

### `Treasure#collectTags(configs, options)`

**Parameters:**

- **configs** (Object, optional): Configuration object containing collection settings
  - `vendors`: Array of supported vendor names
  - `cookies`: Array of specific cookie names to collect
  - `params`: Array of specific URL parameter names to collect

- **options** (Object, optional): Additional configuration object
  - `gclPrefix`: Custom cookie prefix for Google Marketing Platform (default: `'_gcl'`)

**Returns:** void

**Examples:**

```javascript
// Collect from multiple platforms
td.collectTags({
  vendors: ['meta', 'google_ga', 'google_mp'],
  cookies: ['_custom_cookie'],
  params: ['custom_param']
}, {
  gclPrefix: '_custom_gcl'
});
```

## Vendor Details

### Meta (`meta`)
**Collected Data:**
- **Cookies:** `_fbp` (Facebook Browser Pixel), `_fbc` (Facebook Click)
- **URL Parameters:** `fbclid` (Facebook Click ID)
- **Use Case:** Facebook/Instagram advertising effectiveness measurement, Meta Conversion API integration

### Google Ads (`google_ads`)
**Collected Data:**
- **URL Parameters:** `gclid` (Google Click ID), `wbraid` (Web Conversion Browser ID)
- **Use Case:** Google Ads click tracking, iOS 14.5+ privacy compliance

### Google Analytics (`google_ga`)
**Collected Data:**
- **Cookies:** `_ga` (Google Analytics Client ID)
- **Use Case:** User identification between Google Analytics and Treasure Data

### Google Marketing Platform (`google_mp`)
**Collected Data:**
- **Cookies:** All cookies starting with `_gcl` prefix (dynamic collection)
- **Use Case:** Google Marketing Platform (formerly DoubleClick) Conversion Linker

### Instagram (`instagram`)
**Collected Data:**
- **Cookies:** `shbts` (Browser Timestamp), `shbid` (Browser ID), `ds_user_id` (User ID), `ig_did` (Device ID)
- **Use Case:** Instagram advertising effectiveness measurement, logged-in user tracking

### Yahoo! JAPAN Ads (`yahoojp_ads`)
**Collected Data:**
- **Cookies:** `_ycl_yjad`, `_yjr_yjad`, `_yjsu_yjad`, `_ly_c`, `_ly_r`, `_ly_su`
- **URL Parameters:** `yclid`, `yj_r`, `ly_c`
- **Use Case:** Yahoo! search ads, display ads, LINE Yahoo! integrated analysis

### LINE (`line`)
**Collected Data:**
- **Cookies:** `__lt__cid` (Customer ID), `__lt__sid` (Session ID)
- **URL Parameters:** `ldtag_cl` (Click ID)
- **Use Case:** LINE advertising effectiveness measurement, LINE Tag tracking

### X/Twitter (`x`)
**Collected Data:**
- **Cookies:** `_twclid` (Twitter Click ID Cookie)
- **URL Parameters:** `twclid` (Twitter Click ID Parameter)
- **Use Case:** X advertising click tracking, conversion measurement

### Pinterest (`pinterest`)
**Collected Data:**
- **Cookies:** `_epik` (Enhanced Partner Information Kit Cookie)
- **URL Parameters:** `epik` (Enhanced Partner Information Kit Parameter)
- **Use Case:** Pinterest advertising effectiveness measurement, Enhanced Matching

### Snapchat (`snapchat`)
**Collected Data:**
- **URL Parameters:** `ScCid` (Snapchat Campaign ID)
- **Use Case:** Snapchat campaign identification, advertising effectiveness measurement

### TikTok (`tiktok`)
**Collected Data:**
- **Cookies:** `_ttp` (TikTok Tracking Parameter)
- **Use Case:** TikTok user tracking, advertising effectiveness measurement

### Marketo (`marketo`)
**Collected Data:**
- **Cookies:** `_mkto_trk` (Marketo Lead ID)
- **Use Case:** Marketo lead tracking, marketing automation integration

### Tealium (`tealium`)
**Collected Data:**
- **Cookies:** `utag_main` (Universal Tag Main Cookie)
- **Use Case:** Enterprise Tag Management System, integrated data management

## Practical Examples

### Basic Multi-Platform Tracking
```javascript
var td = new Treasure({
  database: 'marketing_data',
  writeKey: 'your_write_key'
});

// Bulk collection from major platforms
td.collectTags({
  vendors: ['meta', 'google_ads', 'google_ga', 'x', 'tiktok']
});

td.trackPageview('page_views');
td.trackEvent('conversions', { action: 'purchase', amount: 100 });
```

### Region-Specific Configurations
```javascript
// Japanese market focus
td.collectTags({
  vendors: ['yahoojp_ads', 'line', 'meta', 'google_ga']
});

// Western market focus
td.collectTags({
  vendors: ['meta', 'google_ads', 'x', 'pinterest', 'snapchat']
});
```

### Social Media Focused Tracking
```javascript
// Social media platforms
td.collectTags({
  vendors: ['tiktok', 'snapchat', 'instagram', 'x']
});
```

## Important Notes

### Privacy and Compliance
- Ensure compliance with each platform's privacy policies
- Proper consent collection is required for GDPR, CCPA, and other regulations
- Browser privacy settings and ad blockers may affect data collection
- Consider implementing consent management platforms (CMPs) for compliance

### Technical Limitations
- `null` values are set when cookies or URL parameters don't exist
- Some platforms require corresponding Pixel or Tag implementations
- Cross-site tracking restrictions may prevent some cookie collection
- Third-party cookie deprecation may impact future functionality

### Performance Considerations
- Consider initialization time impact when specifying many vendors
- Recommend specifying only necessary platforms for your use case
- Monitor payload size when collecting extensive tag data
