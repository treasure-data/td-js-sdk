# Treasure Data JavaScript Consent Extension

Treasure Data JavaScript Consent Extension (TD JS Consent Extension) is a set of APIs that implement consent management solutions on the client side. It allows the TD customers to define categories of data use as well as different context for consent collection. The Consent Extension also empowers website’s visitors to control and customize their consent preferences for how data should be collected about them. They can choose to opt out entirely or selectively opt out of data collection in specific context if they don’t consent to the purpose of data use

## Context and Consent

Treasure Data JavaScript Consent Extension has two concepts: Context and Consent that allows you to define the consent information for your website.

Context defines general information such as your brand, your domain, what type of consent collection. These information let you know that in which context user has agreed or disagreed with the consents. Each context consists the following fields:

1. **brand**: your company’s brand name
2. **domain_name**: website domain name that’s hosting the brand content as well as the TD-JS SDK
3. **collection_type**: different types of collection context, for example the consent collection context can be at the shopping cart page, a web form, or for the whole website. 
4. **collection_point_id**: the identifier for each collection point you can pass in from other system. For example, if the collection context is a shopping cart page, you can use the shopping cart transaction id for this collection_point_id. 
5. **context_id**: a auto-generated id for each context

Consent defines the semantics of a consent given by the consumer. Each consent consists the following fields:

1. *purpose*: category of data use
2. *status*: consent status, either given or refused or notgiven
3. *datatype*: a personal data type
4. *context_id*: context that the consent belongs to
5. *identifier*: user identifier
6. *expiry_date*: when the consent expires

The context and the purpose make the consent unique, so it could be used for filtering, querying for consented data.

Examples of context and consent

```javascript
// Context
{
  brand: 'A brand',
  domain_name: 'abrand.com',
  collection_type: 'shopping_cart',
  collection_point_id: 'shopping_trnx_id',
  context_id: 'xxxxxxxxxx'
}

// Consent
{
  purpose: 'analytics',
  status: 'given',
  datatype: 'Purchase',
  context_id: 'xxxxxxxxxx',
  identifier: 'client id',
  expiry_date: 'YYYY-MM-DD'
}
```


## Usage

## Configurations

The configuration is setup along with the TD JavaScript SDK initialization.

```javascript
var td = new Treasure({
  database: 'database',
  writeKey: '1/xxxxxxxxxx',
  host: 'in.treasuredata.com',
  consentManager: {
    storageKey: 'storage key',
    successConsentCallback: function () {},
    failureConsentCallback: function () {},
    expiredConsentsCallback: function () {},
    consentTable: 'consent_table_name',
    contextTable: 'context_table_name',
    issuer: 'name of the consent management platform',
    dateFormat: 'YYYY-MM-DD'
  }
})
```

**Parameters**:

- **storageKey**: String (optional) - Name of the local storage. Default: td_consent_preferences

- **consentTable**: String (optional) - Name of the consent table. Default: td_cm_consent

- **contextTable**: String (optional) - Name of the context table. Default: td_cm_context

- **issuer**: String (optional) - Name of the consent management platform. Default: treasuredata

- **dateFormat**: String (optional) - Date format string. Default: YYYY-MM-DD

- **successConsentCallback**: Function (optional) - Successful saving consent callback

- **failureConsentCallback**: Function (optional) - Failed to save consent callback

- **expiredConsentsCallback**: Function (optional) - Expired consent callback

Every time when a page is loaded, TD JS Consent Extension will check the consent expiry date and if there’s any expired consent, then the `expiredConsentCallback` is triggered. It also updates status of the expired consent to expired

## Date format

Internally, we use [dayjs](https://github.com/iamkun/dayjs) to handle date formatting, so the date format string should follow this document [string-format](https://day.js.org/docs/en/parse/string-format)

Full example of using TD JS Consent Extension to create default consent preferences for the consumer.

```javascript
function successCallback (preferences) {
  if (preferences['analytics'].status === 'given') {
    td.setSignedMode()
    td.unblockEvents()
  } else if (preferences['analytics'].status === 'refused') {
    td.setAnonymousMode()
    td.blockEvents()
  }

  td.trackPageview()
}

var td = new Treasure({
  database: 'database',
  writeKey: '1/xxxxxxxxxx',
  host: 'in.treasuredata.com',
  consentManager: {
    storageKey: 'consent_preferences',
    successConsentCallback: successCallback
  }
})

// we setup contexts and consents when the TD JavaScript SDK is ready
td.ready(function () {
  // check if the preferences exists
  // otherwise don't do the setup again.
  if (!td.getPreferences()) {
    var contextId = td.addContext({
      brand: 'A Brand',
      domain_name: 'abrand.com',
      collection_type: 'Whole website',
      collection_point_id: 'whole_website'
    })

    td.addConsents({
      analytics: {
        description:
          'We use browser cookies that are necessary for the site to work as intended.For example, we store your website data collection preferences so we can honor them if you return to our site. You can disable these cookies in your browser settings but if you do the site may not work as intended.',
        status: td.consentManager.states.GIVEN,
        datatype: 'Visits',
        context_id: contextId,
      }
    })

    contextId = td.addContext({
      brand: 'Treasure Data',
      domain_name: 'treasuredata.com',
      collection_type: 'Shopping Cart',
      collection_point_id: 'shopping_trnx_id'
    })

    td.addConsents({
      recommendations: {
        description: 'Description of the consent',
        status: td.consentManager.states.GIVEN,
        datatype: 'Purchases',
        context_id: contextId
      },
      storing: {
        description: 'Description',
        datatype: 'Purchases',
        status: td.consentManager.states.REFUSED,
        context_id: contextId
      }
    })
  }
})

// Later on, based on the user's interactions with your consent information
// you should save the preferences
td.saveContexts()
td.saveConsents()
```

### addContext(context)

Adding context for consents, the context will be included when we send data to TD platform (event-collector).  Users can specify their own context id otherwise a new context id will be generated.

**Parameters**:

- **context**: Object (required) - Context information

  - **brand**: String - brand name

  - **domain_name**: String - domain name

  - **collection_type**: String - consent collection type

  - **collection_point_id**: String - consent collection point id

  - **context_id**: String (optional) - Context Id

- Return context id

```javascrpt
sdk.addContext({
  brand: 'A Brand',
  domain_name: 'abrand.com',
  collection_type: 'shopping_cart',
  collection_point_id: 'shopping_trnx_id'
  context_id: 'uuid'
})
```

### addConsents(consents)

Adding consents. For the consents that don’t have context ID, they will be added to a default context

**Parameters**:

- **consents**: Object (required) - A map that contains multiple consent objects, each consent object has a key as consent’s purpose and a value as consent’s information

  - **consent**: Object - Specific consent

    - **key**: String - purpose of consent

    - **values**: Object - consent information

      - **description**: String - Consent’s description

      - **datatype**: String - data type

      - **status**: String - Consent’s status (given | refused | notgiven). Default: notgiven

      - **expiry_date**: (String|Number|Date) - expiry date

      - **context_id**: String - Context Id

```javascript
sdk.addConsents({
  'marketing': { // <--- purpose
    description: 'description of consent',
    datatype: 'Attibutes',
    status: 'given|refused',
    expiry_date: 'YYYY-MM-DD',
    context_id: 'context_id'
  },
  'storing': { // <--- purpose
    description: 'description',
    datatype: 'datatype',
    status: 'given|refused',
    expiry_date: 'YYYY-MM-DD',
    context_id: 'context_id'
  },
  'recommendations': { // <--- purpose
    description: 'description',
    datatype: 'datatype',
    status: 'given|refused',
    expiry_date: 'YYYY-MM-DD',
    context_id: 'context_id'
  }
)
```

### saveContexts(success, error)

Save the contexts to the local storage and to the Treasure Data platform

**Parameters**:

- **success**: Function (optional) - Callback for when saving the contexts successfully

- **error**: Function (optional) - Callback for when saving the contexts unsuccessfully

```javascript
function success () {
  // yay()
}

function error (err) {
  /**
  * err: { success: false, message: 'Timeout' }
  */
}

sdk.saveContexts(success, error)
```

### saveConsents(success, error)

Save the consents to the local storage and to the Treasure Data platform

**Parameters**:

- **success**: Function (optional) - Callback for when saving the consents successfully

- **error**: Function (optional) - Callback for when saving the consents unsuccessfully

If you don’t specify the callbacks, the callbacks that are configured in the Configurations section above will be called.

```javascript
function success (preferences) {
  // yay()
}

function error (err) {
  /**
  * err: { success: false, message: 'Timeout' }
  */
}

sdk.saveConsents(success, error)
```

### getConsents()

Return list of consents

### getContexts()

Return list of contexts

### updateConsent(contextId, consentObject)

Update a specific consent

**Parameters**:

- **contextId**: String (required) - Context Id

- **consentObject**: Object (required) - Consent that you want to update

```javascript
sdk.updateConsent('xxxxxx-context-id', {
  'recommendations': {
    status: 'refused'
  }
})
```

When you update a consent, only the updated consent is sent to the successConsentCallback after calling saveConsents

### updateContext(contextId, values)

Update a specific context

**Parameters**:

- **contextId**: String (required) - Context Id

- **values**: Object (required) - Values of context that you want to update

```javascript
sdk.updateContext('xxxxxx-context-id', {
  brand: 'Other brand',
  domain_name: 'otherdomain.com'
})
```

### getConsentExpiryDate(contextId, consentPurpose)

Get expiry date for a specific consent

**Parameters**:

- **contextId**: String (required) - Context Id

- **consentPurpose**: String (required) - The consent’s purpose

```javascript
sdk.getConsentExpiryDate('context_id', 'analytics')
```

### getExpiredConsents()

Returns expired consents

## Add-on Consent UIs
In addition to the consent extension, we also provide add-on UIs (a banner and a webform) as an example of how we can use a custom UI with TD JavaScript SDK Consent Extension.
For more information: [Treasure Data Consent UIs](https://github.com/treasure-data/td-js-consent)

## Support

Need a hand with something? Shoot us an email at support@treasuredata.com
