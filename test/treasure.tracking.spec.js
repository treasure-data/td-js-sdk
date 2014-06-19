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

  describe('#addEvent', function () {

    describe('validation', function () {

      beforeEach(function () {
        treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          host: treasureHelper.host
        });
      });

      describe('event', function () {

        it('should error if event is absent', function () {

          expect(function () {
            treasure.addEvent(treasureHelper.table, undefined);
          }).to.throw(Error);

        });

        it('should error if event is null', function () {

          expect(function () {
            treasure.addEvent(treasureHelper.table, null);
          }).to.throw(Error);

        });

        it('should error if event is of incorrect type', function () {

          // Number
          expect(function () {
            treasure.addEvent(treasureHelper.table, 0);
          }).to.throw(Error);

          // Boolean
          expect(function () {
            treasure.addEvent(treasureHelper.table, false);
          }).to.throw(Error);

          // Array
          expect(function () {
            treasure.addEvent(treasureHelper.table, ['array']);
          }).to.throw(Error);

          // String
          expect(function () {
            treasure.addEvent(treasureHelper.table, 'String');
          }).to.throw(Error);

        });

      });

      describe('table', function () {

        it('should error if table is absent', function () {

          expect(function () {
            treasure.addEvent(undefined);
          }).to.throw(Error);

        });

        it('should error if table is empty', function () {

          expect(function () {
            treasure.addEvent('');
          }).to.throw(Error);

        });

        it('should error if table is of incorrect type', function () {

          // Number
          expect(function () {
            treasure.addEvent(0);
          }).to.throw(Error);

          // Boolean
          expect(function () {
            treasure.addEvent(false);
          }).to.throw(Error);

          // Array
          expect(function () {
            treasure.addEvent(['array']);
          }).to.throw(Error);

          // Object
          expect(function () {
            treasure.addEvent({});
          }).to.throw(Error);

        });

        it('should error if table is invalid', function () {

          // Under 3 characters
          expect(function () {
            treasure.addEvent('12');
          }).to.throw(Error);

          // Over 255 characters
          expect(function () {
            treasure.addEvent('1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111');
          }).to.throw(Error);

          // Uppercase chracters
          expect(function () {
            treasure.addEvent('FOO_BAR');
          }).to.throw(Error);

          // Special characters
          expect(function () {
            treasure.addEvent('!@#$%ˆ&*()-+=');
          }).to.throw(Error);

        });

        it('should accept a valid table', function () {
          expect(function () {
            treasure.addEvent(treasureHelper.table, {});
          }).not.to.throw(Error);
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
          treasure.addEvent(treasureHelper.table, treasureHelper.properties, callbacks[0], callbacks[1]);
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
          treasure.addEvent(treasureHelper.table, treasureHelper.properties, callbacks[0], callbacks[1]);
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

        treasure.addEvent(treasureHelper.table, treasureHelper.properties);
        var tag = document.getElementById('td-js-sdk-jsonp');
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

        treasure.addEvent(
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
        }).not.to.throw(Error);
      });

      it('should error if function is absent', function () {

        expect(function () {
          treasure.setGlobalProperties();
        }).to.throw(Error);

      });

      it('should error if event is of incorrect type', function () {

        // Number
        expect(function () {
          treasure.setGlobalProperties(0);
        }).to.throw(Error);

        // Boolean
        expect(function () {
          treasure.setGlobalProperties(false);
        }).to.throw(Error);

        // Array
        expect(function () {
          treasure.setGlobalProperties(['array']);
        }).to.throw(Error);

        // String
        expect(function () {
          treasure.setGlobalProperties('String');
        }).to.throw(Error);

        // Null
        expect(function () {
          treasure.setGlobalProperties(null);
        }).to.throw(Error);

        // Object
        expect(function () {
          treasure.setGlobalProperties({});
        }).to.throw(Error);

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
        treasure.addEvent(treasureHelper.table, {age: 10});
        server.respond();
        expect(server.requests[0].requestBody).to.equal(JSON.stringify({name: 'foo', age: 10}));
        expect(stub.calledWith(treasureHelper.table)).to.equal(true);
      });

      it('calls the globalProperties function and works even if nothing is returned', function () {
        var stub = sinon.stub();
        stub.returns(undefined);
        treasure.setGlobalProperties(stub);
        respondWith(200, treasureHelper.responses.success);
        treasure.addEvent(treasureHelper.table, {age: 10});
        server.respond();
        expect(server.requests[0].requestBody).to.equal(JSON.stringify({age: 10}));
        expect(stub.calledWith(treasureHelper.table)).to.equal(true);
      });

      it('calls the globalProperties function and works even if null is returned', function () {
        var stub = sinon.stub();
        stub.returns(null);
        treasure.setGlobalProperties(stub);
        respondWith(200, treasureHelper.responses.success);
        treasure.addEvent(treasureHelper.table, {age: 10});
        server.respond();
        expect(server.requests[0].requestBody).to.equal(JSON.stringify({age: 10}));
        expect(stub.calledWith(treasureHelper.table)).to.equal(true);
      });

    });

  });

});
