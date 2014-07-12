'use strict';

describe('Treasure Client', function () {
  var treasure, configuration;

  function resetConfiguration () {
    configuration = {
      database: 'database',
      writeKey: 'writeKey',
      development: true,
      logging: false
    };
  }

  beforeEach(resetConfiguration);
  beforeEach(function () {
    treasure = new Treasure(configuration);
  });

  describe('constructor', function () {

    it('should create a new Treasure instance', function () {
      expect(treasure).to.be.an.instanceOf(Treasure);
    });

    it('should error if no configuration object', function () {
      expect(function () {
        (treasure = new Treasure());
      }).to.Throw(Error);
    });

    it('should create a new client object', function () {
      expect(treasure.client).to.be.an('object');
    });

    it('should create a globals object on client', function() {
      expect(treasure.client.globals).to.be.an('object');
    });

    it('should set defaults on client object', function () {
      var client = treasure.client;
      expect(client.protocol).to.be.a('string');
      expect(client.host).to.be.a('string');
      expect(client.pathname).to.be.a('string');
      expect(client.requestType).to.be.a('string');
      expect(client.development).to.be.a('boolean');
      expect(client.logging).to.be.a('boolean');
      expect(client.endpoint).to.be.a('string');
    });

    it('should allow you to manually set values on client', function () {
      configuration.host = configuration.pathname = configuration.endpoint = 'foo';
      treasure = new Treasure(configuration);
      expect(treasure.client.host).to.equal('foo');
      expect(treasure.client.pathname).to.equal('foo');
      expect(treasure.client.endpoint).to.equal('foo');
    });

    describe('validates database', function () {

      var tryWithDatabaseValue = function (value) {
        configuration.database = value;
        expect(function () {
          (treasure = new Treasure(configuration));
        }).to.Throw(Error);
      };

      it('should error if database is absent', function () {
        tryWithDatabaseValue(undefined);
      });

      it('should error if database is of incorrect type', function () {

        // Number
        tryWithDatabaseValue(0);

        // Boolean
        tryWithDatabaseValue(false);

        // Array
        tryWithDatabaseValue(['array']);

        // Object
        tryWithDatabaseValue({});

      });

      it('should error if database is invalid', function () {

        // Empty string
        tryWithDatabaseValue('');

        // Under 3 characters
        tryWithDatabaseValue('12');

        // Over 255 characters
        tryWithDatabaseValue('1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111');

        // Uppercase chracters
        tryWithDatabaseValue('FOO_BAR');

        // Special characters
        tryWithDatabaseValue('!@#$%ˆ&*()-+=');

      });

      it('should set the database (string)', function () {

        expect(treasure.client)
          .to.have.property('database')
          .that.is.a('string')
          .that.equals(configuration.database);

      });

    });

    describe('validates writeKey', function () {

      it('should error if writeKey is not set', function () {
        delete configuration.writeKey;
        expect(function () {
          (treasure = new Treasure(configuration));
        }).to.Throw(Error);

      });

      it('should set the writeKey (string)', function () {
        expect(treasure.client)
          .to.have.property('writeKey')
          .that.is.a('string')
          .that.equals(configuration.writeKey);

      });

    });

    describe('validates endpoint', function () {

      it('should set protocol to "https" if designated', function () {
        configuration.protocol = 'https';
        treasure = new Treasure(configuration);
        expect(treasure.client.endpoint.indexOf('https://')).to.equal(0);

      });

      it('should set protocol to "http" if designated', function () {
        configuration.protocol = 'http';
        treasure = new Treasure(configuration);
        expect(treasure.client.endpoint.indexOf('http://')).to.equal(0);

      });

    });

    describe('validates request type', function () {

      it('should set request type to "xhr" by default, if unsupported use "jsonp"', function () {

        expect(treasure.client)
          .to.have.property('requestType')
          .that.is.a('string')
          .that.equals('withCredentials' in new XMLHttpRequest() ? 'xhr' : 'jsonp');

      });

      it('should set request type to "xhr" if designated', function () {
        configuration.requestType = 'xhr';
        treasure = new Treasure(configuration);
        expect(treasure.client)
          .to.have.property('requestType')
          .that.is.a('string')
          .that.equals('xhr');

      });

      it('should set request type to "jsonp" if designated', function () {
        configuration.requestType = 'jsonp';
        treasure = new Treasure(configuration);
        expect(treasure.client)
          .to.have.property('requestType')
          .that.is.a('string')
          .that.equals('jsonp');

      });

    });

  });
});
