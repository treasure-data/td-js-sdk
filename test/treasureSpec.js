describe("addEvent using CORS and fake Server", function() {
  
  beforeEach(function() {
    jasmine.util.extend(this, new TreasureSpecHelper());
  });

  describe("when XHR is used", function() {

    beforeEach(function() {
      this.TREASURE = new Treasure({
        database: this.database,
        writeKey: this.writeKey,
        protocol: this.protocol,
        host: this.host,
        requestType: 'xhr'
      });
      this.server = sinon.fakeServer.create();
      window.XMLHttpRequest.prototype.withCredentials = false;
      var self = this;
      this.respondWith = function(code, body) {
        self.server.respondWith("POST", this.postUrl,
        [code, { "Content-Type": "application/json"}, body]);
      };
    });

    afterEach(function() {
      this.server.restore();
    });

    it("should post to the API using xhr where CORS is supported", function() {
      var callback = sinon.spy(), errback = sinon.spy();
      this.respondWith(200, this.successfulResponse);
      this.TREASURE.addEvent(this.table, this.properties, callback, errback);
      this.server.respond();
      expect(this.server.requests[0].requestBody).toEqual(JSON.stringify(this.properties));
      expect(callback).toHaveBeenCalledOnce();
      expect(errback).not.toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(JSON.parse(this.successfulResponse));
    });

    it("should call the error callback on error", function() {
      var callback = sinon.spy(), errback = sinon.spy();
      this.respondWith(500, this.errorResponse);
      this.TREASURE.addEvent(this.table, this.properties, callback, errback);
      this.server.respond();
      expect(this.server.requests[0].requestBody).toEqual(JSON.stringify(this.properties));
      expect(errback).toHaveBeenCalledOnce();
      expect(callback).not.toHaveBeenCalledOnce();
    });
  });


  describe("when JSON is used", function() {
    
    beforeEach(function() {
      this.TREASURE = new Treasure({
        database: this.database,
        writeKey: this.writeKey, 
        protocol: this.protocol,
        host: this.host,
        requestType: 'jsonp'
      });
      this.server = sinon.fakeServer.create();
      delete window.XMLHttpRequest.prototype.withCredentials;
    });

    afterEach(function() {
      this.server.restore();
    });

    it("should add a script tag with a url that has data and modified params", function() {
      this.TREASURE.addEvent(this.table, this.properties);
      var jsonpScriptTag = document.getElementById("treasure-jsonp");
      expect(jsonpScriptTag).not.toBeNull();
      expect(jsonpScriptTag.src).toContain("data=");
      expect(jsonpScriptTag.src).toContain("modified=");
    });
    
  });

});
