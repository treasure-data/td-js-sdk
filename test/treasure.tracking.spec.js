'use strict';

describe('Treasure Tracking', function () {
  var treasure, server, postUrl, respondWith;

  describe('#addEvent', function () {

    describe('table validation', function () {

      beforeEach(function () {
        treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          host: treasureHelper.host
        });
      });

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

    describe('via JSONP to a fake server', function () {

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
        var successCallback = JSON.parse(treasureHelper.responses.success);

        function spyCallback () {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          timeoutCallback();
        }

        function timeoutCallback () {
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

      it('should call error callback if unsuccessful', function (done) {

        function spyCallback () {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          timeoutCallback();
        }

        function timeoutCallback () {
          expect(callbacks[0].calledOnce).not.to.equal(true);
          expect(callbacks[1].calledOnce).to.equal(true);
          done();
        }

        var timeoutId, callbacks = [sinon.spy(spyCallback), sinon.spy(spyCallback)];

        treasure.addEvent(
          'error',
          treasureHelper.properties,
          callbacks[0],
          callbacks[1]
        );

        timeoutId = setTimeout(timeoutCallback, treasureHelper.TIMEOUT);
      });

    });

  });
});
