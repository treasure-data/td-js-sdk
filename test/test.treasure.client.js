var expect = chai.expect;

var treasureHelper = {
  database: 'testDB',
  writeKey: '91/96da3cfb876cc50724d0dddef670d95eea2a0018',
  protocol: 'http',
  host: 'in-staging.treasuredata.com',
  table: 'testTB',
  properties: { username: 'treasure', color: 'blue' },
  responses: {
    success: '{\"created\": true }',
    error: '{\"error\": true }'
  }
};
// console.log(treasureHelper);

describe("Treasure Client", function() {

  beforeEach(function() {
    this.treasure = new Treasure({
      database: treasureHelper.database,
      writeKey: treasureHelper.writeKey
    });
  });

  describe("constructor", function() {

    it("should create a new Treasure instance", function(){
      expect(this.treasure).to.be.an.instanceof(Treasure);
    });

    it("should error if no configuration object", function() {
      expect(function() {
        (treasure = new Treasure());
      }).to.throw(Error);
    });

    it("should create a new client object", function(){
      expect(this.treasure.client).to.be.ok;
    });

    describe("validates database", function(){

      it("should error if database is absent", function() {

        expect(function() {
          (treasure = new Treasure());
        }).to.throw(Error);

      });

      it("should error if database is empty", function() {

        expect(function() {
          (treasure = new Treasure({database:''}));
        }).to.throw(Error);

      });

      it("should error if database is of incorrect type", function() {

        // Number
        expect(function() {
          (treasure = new Treasure({database:0}));
        }).to.throw(Error);

        // Boolean
        expect(function() {
          (treasure = new Treasure({database:false}));
        }).to.throw(Error);

        // Array
        expect(function() {
          (treasure = new Treasure({database:['array']}));
        }).to.throw(Error);

        // Object
        expect(function() {
          (treasure = new Treasure({database:{}}));
        }).to.throw(Error);

      });

      it('should error if database is invalid', function() {

        // Under 3 characters
        expect(function() {
          (treasure = new Treasure({database:'12'}));
        }).to.throw(Error);

        // Over 255 characters
        expect(function() {
          (treasure = new Treasure({database:'1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'}));
        }).to.throw(Error);

        // Uppercase chracters
        expect(function() {
          (treasure = new Treasure({database:'FOO_BAR'}));
        }).to.throw(Error);

        // Special characters
        expect(function() {
          (treasure = new Treasure({database:'!@#$%ˆ&*()-+='}));
        }).to.throw(Error);

      });

      it("should set the database (string)", function() {

        expect(this.treasure.client)
          .to.have.property('database')
          .that.is.a('string')
          .that.equals(treasureHelper.database);

      });

    });

    describe("validates writeKey", function(){

      it("should set the writeKey (string)", function() {
        expect(this.treasure.client)
          .to.have.property('writeKey')
          .that.is.a('string')
          .that.equals(treasureHelper.writeKey);

      });

    });

    describe("validates endpoint", function(){

      it("should default to \"https\" if protocol is absent or of incorrect type", function(){

        // Empty
        var treasure_empty = new Treasure({ database: '123', protocol: '' });
        expect(treasure_empty.client.endpoint.indexOf('https://')).to.equal(0);

        // Number
        var treasure_number = new Treasure({ database: '123', protocol: 0 });
        expect(treasure_number.client.endpoint.indexOf('https://')).to.equal(0);

        // Boolean
        var treasure_boolean = new Treasure({ database: '123', protocol: true });
        expect(treasure_boolean.client.endpoint.indexOf('https://')).to.equal(0);

        // Array
        var treasure_array = new Treasure({ database: '123', protocol: [] });
        expect(treasure_array.client.endpoint.indexOf('https://')).to.equal(0);

        // Object
        var treasure_object = new Treasure({ database: '123', protocol: {} });
        expect(treasure_object.client.endpoint.indexOf('https://')).to.equal(0);

      });

      it("should set protocol to \"https\" if designated", function(){

        var treasure = new Treasure({ database: '123', protocol: 'https' });
        expect(treasure.client.endpoint.indexOf('https://')).to.equal(0);

      });

      it("should set protocol to \"http\" if designated", function(){

        var treasure = new Treasure({ database: '123', protocol: 'http' });
        expect(treasure.client.endpoint.indexOf('http://')).to.equal(0);

      });

    });

    describe("validates request type", function(){

      it("should set request type to \"jsonp\" by default", function(){

        var treasure = new Treasure({ database: '123' });
        expect(treasure.client)
          .to.have.property('requestType')
          .that.is.a('string')
          .that.equals('jsonp');

        /*if ('withCredentials' in new XMLHttpRequest()) {
          expect(treasure.client)
            .to.have.property('requestType')
            .that.is.a('string')
            .that.equals('xhr');
        } else {
          expect(treasure.client)
            .to.have.property('requestType')
            .that.is.a('string')
            .that.equals('jsonp');
        }*/

      });

      it("should set request type to \"xhr\" if designated and CORS supported, otherwise fall back \"JSONP\"", function(){

        var treasure = new Treasure({ database: '123', requestType: 'xhr' });
        if ('withCredentials' in new XMLHttpRequest()) {
          expect(treasure.client)
            .to.have.property('requestType')
            .that.is.a('string')
            .that.equals('xhr');
        } else {
          expect(treasure.client)
            .to.have.property('requestType')
            .that.is.a('string')
            .that.equals('jsonp');
        }

      });

      it("should set request type to \"jsonp\" if designated", function(){

        var treasure = new Treasure({ database: '123', requestType: 'jsonp' });
        expect(treasure.client)
          .to.have.property('requestType')
          .that.is.a('string')
          .that.equals('jsonp');

      });

      it("should set request type to \"beacon\" if designated", function(){

        var treasure = new Treasure({ database: '123', requestType: 'beacon' });
        expect(treasure.client)
          .to.have.property('requestType')
          .that.is.a('string')
          .that.equals('beacon');

      });

    });

  });
});
