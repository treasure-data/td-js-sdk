'use strict';

describe('Treasure Tracker', function () {
  var treasure;

  beforeEach(function () {
    treasure = new Treasure({
      database: treasureHelper.database,
      writeKey: treasureHelper.writeKey
    });
  });

  describe('constructor', function () {
    it('should call configure', function () {
      var spy = sinon.spy(Treasure.Plugins.Track, 'configure');
      treasure = new Treasure({
        database: treasureHelper.database,
        writeKey: treasureHelper.writeKey
      });
      expect(spy.calledOnce).to.equal(true);
      expect(spy.firstCall.args).to.have.length(2);
      expect(spy.firstCall.args[0]).to.be.an.instanceOf(Treasure);
      expect(spy.firstCall.args[1]).to.be.an('object');
      Treasure.Plugins.Track.configure.restore();
    });

    it('should set track object', function () {
      expect(treasure.client.track).to.be.an('object');
    });

    it('should set default values', function () {
      var track = treasure.client.track;
      expect(track.pageviews).to.equal('pageviews');
      expect(track.events).to.equal('events');
      expect(track.cookies).to.be.an('object');
      expect(track.cookies.name).to.equal('_td');
      expect(track.cookies.expiration).to.equal(63072000);
      expect(track.cookies.domain).to.equal(document.location.hostname);
    });

    it('should set uuid to clientId if set manually', function () {
      var uuid = Treasure.UUID();
      treasure = new Treasure({
        database: treasureHelper.database,
        writeKey: treasureHelper.writeKey,
        clientId: uuid
      });

      expect(treasure.client.track.uuid).to.equal(uuid);
    });

    describe('cookies', function () {

      it('should let you disable storage by setting it to none', function() {
        treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          storage: 'none'
        });

        expect(treasure.client.track.cookies).to.equal(false);
      });

      it('should let you set expiration to 0', function() {
        treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          storage: {
            expiration: 0
          }
        });

        expect(treasure.client.track.cookies.expiration).to.equal(0);
      });

      it('should let you set expiration to an integer', function() {
        treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          storage: {
            expiration: 128
          }
        });

        expect(treasure.client.track.cookies.expiration).to.equal(128);
      });

      it('should let you set domain to none', function () {
        treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          storage: {
            domain: ''
          }
        });

        expect(treasure.client.track.cookies.domain).to.equal('');
      });

      it('should remember your previous clientId', function () {
        treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          clientId: 'foobar'
        });
        console.log(treasure.client.track, document.cookie);
        expect(treasure.client.track.uuid).to.equal('foobar');

        treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey
        });
        console.log(treasure.client.track, document.cookie);
        expect(treasure.client.track.uuid).to.equal('foobar');


      });

    });

  });

});
