'use strict';

describe('Treasure Tracking', function () {
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

  describe('#setGlobalProperties', function () {

    describe('function validation', function () {

      beforeEach(function () {
        treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          host: treasureHelper.host
        });
      });

      it('should accept a function', function () {
        expect(function () {
          treasure.setGlobalProperties(function () {});
        }).not.to.Throw(Error);
      });

      it('should error if function is absent', function () {

        expect(function () {
          treasure.setGlobalProperties();
        }).to.Throw(Error);

      });

      it('should error if event is of incorrect type', function () {

        // Number
        expect(function () {
          treasure.setGlobalProperties(0);
        }).to.Throw(Error);

        // Boolean
        expect(function () {
          treasure.setGlobalProperties(false);
        }).to.Throw(Error);

        // Array
        expect(function () {
          treasure.setGlobalProperties(['array']);
        }).to.Throw(Error);

        // String
        expect(function () {
          treasure.setGlobalProperties('String');
        }).to.Throw(Error);

        // Null
        expect(function () {
          treasure.setGlobalProperties(null);
        }).to.Throw(Error);

        // Object
        expect(function () {
          treasure.setGlobalProperties({});
        }).to.Throw(Error);

      });

    });

    describe('behavior', function () {

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

      it('lets you define a globalProperties function', function () {
        var noop = function () {};
        expect(treasure.setGlobalProperties).to.be.a('function');
        treasure.setGlobalProperties(noop);
        expect(treasure.client.globalProperties).to.equal(noop);
      });

      it('calls the globalProperties function before sending an event', function () {
        var stub = sinon.stub();
        stub.returns({
          name: 'foo'
        });
        treasure.setGlobalProperties(stub);
        respondWith(200, treasureHelper.responses.success);
        treasure.addRecord(treasureHelper.table, {age: 10});
        server.respond();
        expect(server.requests[0].requestBody).to.equal(JSON.stringify({name: 'foo', age: 10}));
        expect(stub.calledWith(treasureHelper.table)).to.equal(true);
      });

      it('calls the globalProperties function and works even if nothing is returned', function () {
        var stub = sinon.stub();
        stub.returns(undefined);
        treasure.setGlobalProperties(stub);
        respondWith(200, treasureHelper.responses.success);
        treasure.addRecord(treasureHelper.table, {age: 10});
        server.respond();
        expect(server.requests[0].requestBody).to.equal(JSON.stringify({age: 10}));
        expect(stub.calledWith(treasureHelper.table)).to.equal(true);
      });

      it('calls the globalProperties function and works even if null is returned', function () {
        var stub = sinon.stub();
        stub.returns(null);
        treasure.setGlobalProperties(stub);
        respondWith(200, treasureHelper.responses.success);
        treasure.addRecord(treasureHelper.table, {age: 10});
        server.respond();
        expect(server.requests[0].requestBody).to.equal(JSON.stringify({age: 10}));
        expect(stub.calledWith(treasureHelper.table)).to.equal(true);
      });

    });

  });

});
