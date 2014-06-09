describe("addEvent integration spec", function() {
  beforeEach(function() {
    jasmine.util.extend(this, new TreasureSpecHelper());

    this.TREASURE = new Treasure({
      database: 'testDB',
      writeKey: "91/96da3cfb876cc50724d0dddef670d95eea2a0018",
      host: "in-staging.treasuredata.com"
    });

    it("should post to the API and run success callback for good data", function() {
      var callback = sinon.spy();
      var errback = sinon.spy();

      var proxyCalled = false;
      var proxy = function(response) {
        proxyCalled = true;
        callback(response);
      };

      this.TREASURE.addEvent(this.table, this.properties, proxy, errback);

      waitsFor(function() { return proxyCalled; }, "Proxy never called", 3000);

      runs(function () {
        expect(callback).toHaveBeenCalledOnce();
        expect(errback).not.toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(JSON.parse(this.successfulResponse));
      });
    });

    it("should post to the API and run error callback for bad data", function() {
      var callback = sinon.spy();
      var errback = sinon.spy();

      var proxyCalled = false;
      var proxy = function(response) {
        proxyCalled = true;
        errback(response);
      };

      this.TREASURE.client.writeKey = '';
      Treasure.addEvent(this.table, this.properties, callback, proxy);

      waitsFor(function() { return proxyCalled; }, "Proxy never called", 3000);

      runs(function() {
        expect(errback).toHaveBeenCalledOnce();
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });
});
