'use strict';

describe('Treasure Record', function () {
  var treasure, server, postUrl, respondWith, _log;

  // Disables logging temporarily
  before(function () {
    _log = Treasure.log;
    Treasure.log = function () {};
  });

  after(function () {
    Treasure.log = _log;
  });

  describe('#addRecord', function () {

    describe('validation', function () {

      beforeEach(function () {
        treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          host: treasureHelper.jsonphost,
          requestType: 'jsonp'
        });
      });

      describe('event', function () {

        it('should error if event is absent', function () {

          expect(function () {
            treasure.addRecord(treasureHelper.table, undefined);
          }).to.Throw(Error);

        });

        it('should error if event is null', function () {

          expect(function () {
            treasure.addRecord(treasureHelper.table, null);
          }).to.Throw(Error);

        });

        it('should error if event is of incorrect type', function () {

          // Number
          expect(function () {
            treasure.addRecord(treasureHelper.table, 0);
          }).to.Throw(Error);

          // Boolean
          expect(function () {
            treasure.addRecord(treasureHelper.table, false);
          }).to.Throw(Error);

          // Array
          expect(function () {
            treasure.addRecord(treasureHelper.table, ['array']);
          }).to.Throw(Error);

          // String
          expect(function () {
            treasure.addRecord(treasureHelper.table, 'String');
          }).to.Throw(Error);

        });
      });

      describe('table', function () {

        it('should error if table is absent', function () {

          expect(function () {
            treasure.addRecord(undefined);
          }).to.Throw(Error);

        });

        it('should error if table is empty', function () {

          expect(function () {
            treasure.addRecord('');
          }).to.Throw(Error);

        });

        it('should error if table is of incorrect type', function () {

          // Number
          expect(function () {
            treasure.addRecord(0);
          }).to.Throw(Error);

          // Boolean
          expect(function () {
            treasure.addRecord(false);
          }).to.Throw(Error);

          // Array
          expect(function () {
            treasure.addRecord(['array']);
          }).to.Throw(Error);

          // Object
          expect(function () {
            treasure.addRecord({});
          }).to.Throw(Error);

        });

        it('should error if table is invalid', function () {

          // Under 3 characters
          expect(function () {
            treasure.addRecord('12');
          }).to.Throw(Error);

          // Over 255 characters
          expect(function () {
            treasure.addRecord('1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111');
          }).to.Throw(Error);

          // Uppercase chracters
          expect(function () {
            treasure.addRecord('FOO_BAR');
          }).to.Throw(Error);

          // Special characters
          expect(function () {
            treasure.addRecord('!@#$%ˆ&*()-+=');
          }).to.Throw(Error);

        });

        it('should accept a valid table', function () {
          expect(function () {
            treasure.addRecord(treasureHelper.table, {});
          }).not.to.Throw(Error);
        });
      });

    });

    describe('globals (requires XHR support)', function () {
      beforeEach(function () {
        treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          host: treasureHelper.host,
          requestType: 'xhr'
        });
        postUrl = treasure.client.endpoint + '/js/v3/event/' + treasure.client.database + '/' + treasureHelper.table;
        server = sinon.fakeServer.create();
        respondWith = function (code, body) {
          server.respondWith('POST', postUrl, [code, { 'Content-Type': 'application/json'}, body]);
        };
      });

      afterEach(function () {
        server.restore();
      });

      if ('withCredentials' in new XMLHttpRequest()) {

        it('should send the object with $global attributes', function () {
          treasure.set('$global', {foo: 'foo'});

          respondWith(200, treasureHelper.responses.success);
          treasure.addRecord(treasureHelper.table, {});
          server.respond();

          expect(server.requests[0].requestBody)
            .to.equal(JSON.stringify({foo: 'foo'}));
        });

        it('should send the object with table attributes', function () {
          treasure.set(treasureHelper.table, {foo: 'foo'});

          respondWith(200, treasureHelper.responses.success);
          treasure.addRecord(treasureHelper.table, {});
          server.respond();

          expect(server.requests[0].requestBody)
            .to.equal(JSON.stringify({foo: 'foo'}));
        });

        it('should send the object with $global and table attributes', function () {
          treasure.set('$global', {foo: 'foo'});
          treasure.set(treasureHelper.table, {bar: 'bar'});

          respondWith(200, treasureHelper.responses.success);
          treasure.addRecord(treasureHelper.table, {});
          server.respond();

          expect(server.requests[0].requestBody)
            .to.equal(JSON.stringify({foo: 'foo', bar: 'bar'}));
        });

        it('should send the object with $global, table, and record attributes', function () {
          treasure.set('$global', {foo: 'foo'});
          treasure.set(treasureHelper.table, {bar: 'bar'});

          respondWith(200, treasureHelper.responses.success);
          treasure.addRecord(treasureHelper.table, {baz: 'baz'});
          server.respond();

          expect(server.requests[0].requestBody)
            .to.equal(JSON.stringify({foo: 'foo', bar: 'bar', baz: 'baz'}));
        });

        it('should send the object with record attributes overwriting globals', function () {
          treasure.set('$global', {foo: 'foo', bar: 'bar'});
          treasure.set(treasureHelper.table, {baz: 'baz'});

          respondWith(200, treasureHelper.responses.success);
          treasure.addRecord(treasureHelper.table, {bar: '1', baz: '2'});
          server.respond();

          expect(server.requests[0].requestBody)
            .to.equal(JSON.stringify({foo: 'foo', bar: '1', baz: '2'}));
        });

      }

    });

    describe('via XHR/CORS (if supported)', function () {

      beforeEach(function () {
        treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          host: treasureHelper.host,
          requestType: 'xhr'
        });
        postUrl = treasure.client.endpoint + '/js/v3/event/' + treasure.client.database + '/' + treasureHelper.table;
        server = sinon.fakeServer.create();
        respondWith = function (code, body) {
          server.respondWith('POST', postUrl, [code, { 'Content-Type': 'application/json'}, body]);
        };
      });

      afterEach(function () {
        server.restore();
      });

      if ('withCredentials' in new XMLHttpRequest()) {

        it('should post to the API using xhr where CORS is supported', function () {

          var successCallback = JSON.parse(treasureHelper.responses.success);

          var callbacks = [sinon.spy(), sinon.spy()];
          respondWith(200, treasureHelper.responses.success);
          treasure.addRecord(treasureHelper.table, treasureHelper.properties, callbacks[0], callbacks[1]);
          server.respond();

          expect(server.requests[0].requestBody)
            .to.equal(JSON.stringify(treasureHelper.properties));
          expect(callbacks[0].calledOnce).to.equal(true);
          expect(callbacks[0].calledWith(successCallback)).to.equal(true);
          expect(callbacks[1].calledOnce).not.to.equal(true);

        });

        it('should call the error callback on error', function () {

          var callbacks = [sinon.spy(), sinon.spy()];
          respondWith(500, treasureHelper.responses.error);
          treasure.addRecord(treasureHelper.table, treasureHelper.properties, callbacks[0], callbacks[1]);
          server.respond();

          expect(server.requests[0].requestBody)
            .to.equal(JSON.stringify(treasureHelper.properties));
          expect(callbacks[0].calledOnce).not.to.equal(true);
          expect(callbacks[1].calledOnce).to.equal(true);

        });

      }

    });

    describe('via JSONP to a server', function () {

      beforeEach(function () {
        treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          host: treasureHelper.jsonphost,
          requestType: 'jsonp'
        });
      });

      it('should add a script tag with a URL that has data and modified params', function () {

        treasure.addRecord(treasureHelper.table, treasureHelper.properties);
        var tag = document.getElementById('td-jsonp');
        expect(tag).to.exist.and.be.an('object');
        expect(tag.src).to.contain('data=');
        expect(tag.src).to.contain('modified=');

      });

      it('should call success callback if successful', function (done) {

        function spyCallback () {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          timeoutCallback();
        }

        function timeoutCallback () {
          var successCallback = JSON.parse(treasureHelper.responses.success);
          expect(callbacks[0].calledOnce).to.equal(true);
          expect(callbacks[1].calledOnce).not.to.equal(true);
          expect(callbacks[0].calledWith(successCallback)).to.equal(true);
          done();
        }

        var timeoutId, callbacks = [sinon.spy(spyCallback), sinon.spy(spyCallback)];

        treasure.addRecord(
          treasureHelper.table,
          treasureHelper.properties,
          callbacks[0],
          callbacks[1]
        );

        timeoutId = setTimeout(timeoutCallback, treasureHelper.TIMEOUT);
      });

    });

  });

  describe('#set', function () {
    beforeEach(function () {
      treasure = new Treasure({
        database: treasureHelper.database,
        writeKey: treasureHelper.writeKey,
        host: treasureHelper.host
      });
    });

    it('should let you set a $global attribute', function () {
      treasure.set('$global', 'attr', 'value');
      expect(treasure.get('$global', 'attr')).to.equal('value');
    });

    it('should let you set an attribute on a table', function () {
      treasure.set('table', 'attrA', 'valueA');
      treasure.set('table', 'attrB', 'valueB');
      expect(treasure.get('table', 'attrA')).to.equal('valueA');
      expect(treasure.get('table', 'attrB')).to.equal('valueB');
    });

    it('should let you set multiple $global attributes implicitly', function () {
      treasure.set({
        foo: '1',
        bar: '2'
      });
      expect(treasure.get('$global', 'foo')).to.equal('1');
      expect(treasure.get('$global', 'bar')).to.equal('2');
    });

    it('should let you set multiple $global attributes explicitly', function () {
      treasure.set('$global', {
        foo: '1',
        bar: '2'
      });
      expect(treasure.get('$global', 'foo')).to.equal('1');
      expect(treasure.get('$global', 'bar')).to.equal('2');
    });

    it('should let you set multiple $global attributes using both forms', function () {
      treasure.set('$global', {
        foo: '1',
        bar: '2'
      });
      treasure.set({
        baz: '3',
        qux: '4'
      });
      expect(treasure.get('$global', 'foo')).to.equal('1');
      expect(treasure.get('$global', 'bar')).to.equal('2');
      expect(treasure.get('$global', 'baz')).to.equal('3');
      expect(treasure.get('$global', 'qux')).to.equal('4');
    });

    it('should let you set multiple attributes on a table', function () {
      treasure.set('table', {
        foo: '1',
        bar: '2'
      });
      treasure.set('table', {
        baz: '3',
        qux: '4'
      });
      expect(treasure.get('table', 'foo')).to.equal('1');
      expect(treasure.get('table', 'bar')).to.equal('2');
      expect(treasure.get('table', 'baz')).to.equal('3');
      expect(treasure.get('table', 'qux')).to.equal('4');
    });

  });

  describe('#get', function () {
    beforeEach(function () {
      treasure = new Treasure({
        database: treasureHelper.database,
        writeKey: treasureHelper.writeKey,
        host: treasureHelper.host
      });
    });

    it('should return an empty object if nothing is set', function () {
      expect(treasure.get()).to.be.an('object');
      expect(treasure.get('table')).to.be.an('object');
      expect(Object.keys(treasure.get())).to.have.length(0);
      expect(Object.keys(treasure.get('table'))).to.have.length(0);
    });

    it('should let you get a $global attribute', function () {
      treasure.set('$global', 'attr', 'value');
      expect(treasure.get('$global', 'attr')).to.equal('value');
    });

    it('should let you get a table attribute', function () {
      treasure.set('table', 'attrA', 'valueA');
      treasure.set('table', 'attrB', 'valueB');
      expect(treasure.get('table', 'attrA')).to.equal('valueA');
      expect(treasure.get('table', 'attrB')).to.equal('valueB');
    });

    it('should let you get all $global attributes implicitly', function () {
      treasure.set({
        foo: '1',
        bar: '2'
      });
      expect(treasure.get()).to.be.an('object');
      expect(treasure.get()).to.have.property('foo', '1');
      expect(treasure.get()).to.have.property('bar', '2');
      expect(Object.keys(treasure.get())).to.have.length(2);
    });

    it('should let you get all $global attributes explicitly', function () {
      treasure.set({
        foo: '1',
        bar: '2'
      });
      expect(treasure.get('$global')).to.be.an('object');
      expect(treasure.get('$global')).to.have.property('foo', '1');
      expect(treasure.get('$global')).to.have.property('bar', '2');
      expect(Object.keys(treasure.get('$global'))).to.have.length(2);
    });

    it('should let you get all table attributes', function () {
      treasure.set('table', {
        foo: '1',
        bar: '2'
      });
      treasure.set('table', {
        baz: '3',
        qux: '4'
      });
      expect(treasure.get('table')).to.be.an('object');
      expect(treasure.get('table')).to.have.property('foo', '1');
      expect(treasure.get('table')).to.have.property('bar', '2');
      expect(treasure.get('table')).to.have.property('baz', '3');
      expect(treasure.get('table')).to.have.property('qux', '4');
    });
  });

  describe('#applyProperties', function () {
    beforeEach(function () {
      treasure = new Treasure({
        database: treasureHelper.database,
        writeKey: treasureHelper.writeKey,
        host: treasureHelper.host
      });
    });

    it('should apply $global properties', function () {
      treasure.set('$global', 'foo', 'bar');
      var result = treasure.applyProperties('table', {});
      expect(result).to.be.an('object');
      expect(result).to.have.property('foo', 'bar');
      expect(Object.keys(result)).to.have.length(1);
    });

    it('should apply table properties', function () {
      treasure.set('table', 'foo', 'bar');
      var result = treasure.applyProperties('table', {});
      expect(result).to.be.an('object');
      expect(result).to.have.property('foo', 'bar');
      expect(Object.keys(result)).to.have.length(1);
    });

    it('should apply both table and $global properties', function () {
      treasure.set('$global', 'foo', 'bar');
      treasure.set('table', 'bar', 'foo');
      var result = treasure.applyProperties('table', {});
      expect(result).to.be.an('object');
      expect(result).to.have.property('foo', 'bar');
      expect(result).to.have.property('bar', 'foo');
      expect(Object.keys(result)).to.have.length(2);
    });

    it('should apply $global, table, and payload properties', function () {
      treasure.set('$global', 'foo', 'bar');
      treasure.set('table', 'bar', 'foo');
      var result = treasure.applyProperties('table', {baz: 'qux'});
      expect(result).to.be.an('object');
      expect(result).to.have.property('foo', 'bar');
      expect(result).to.have.property('bar', 'foo');
      expect(result).to.have.property('baz', 'qux');
      expect(Object.keys(result)).to.have.length(3);
    });

    it('should favor table properties over $global', function () {
      treasure.set('$global', 'foo', 'bar');
      treasure.set('table', 'foo', 'foo');
      var result = treasure.applyProperties('table', {});
      expect(result).to.have.property('foo', 'foo');
      expect(Object.keys(result)).to.have.length(1);
    });

    it('should favor payload properties over table', function () {
      treasure.set('table', 'foo', 'bar');
      var result = treasure.applyProperties('table', {foo: 'foo'});
      expect(result).to.have.property('foo', 'foo');
      expect(Object.keys(result)).to.have.length(1);
    });

  });

});
