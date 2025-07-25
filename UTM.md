# UTM Parameters tracking

> [!IMPORTANT]
> This feature is supported in the td-js-sdk v4.4.0

Allow marketers to track performance across email and landing pages to measure engagement, conversion, and revenue attribution effectively.

The following UTM parameters will be tracked automatically:

- *utm_id*
- *utm_medium*
- *utm_source_platform*
- *utm_source*
- *utm_campaign*
- *utm_marketing_tactic*

### How does it work?

When a webpage is loaded with the UTM parameters, our JS SDK will collect these parameters automatically and add them to the $global table, as the result the parameters will be sent along with tracking requests, such as pageviews, tracking event…
