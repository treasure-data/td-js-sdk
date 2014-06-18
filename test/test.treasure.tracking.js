'use strict';

describe('Treasure Tracking', function() {
  
  describe('#addEvent', function() {
    
    describe('via XHR/CORS (if supported)', function () {

      beforeEach(function() {
        var self = this;
        self.treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          host: treasureHelper.host,
          requestType: 'xhr'
        });
        self.postUrl = self.treasure.client.endpoint + '/js/v3/event/' + self.treasure.client.database + '/' + treasureHelper.table;
        self.server = sinon.fakeServer.create();
        self.respondWith = function(code, body){
          self.server.respondWith('POST', self.postUrl, 
            [code, { 'Content-Type': 'application/json'}, body]);
        };
      });
      
      afterEach(function(){
        this.server.restore();
      });
      
      if ('withCredentials' in new XMLHttpRequest()) {
      
        it('should post to the API using xhr where CORS is supported', function() {
          
          var callbacks = [sinon.spy(), sinon.spy()];
          this.respondWith(200, treasureHelper.responses.success);
          this.treasure.addEvent(treasureHelper.table, treasureHelper.properties, callbacks[0], callbacks[1]);
          this.server.respond();
          
          expect(this.server.requests[0].requestBody)
            .to.equal(JSON.stringify(treasureHelper.properties));  
          expect(callbacks[0].calledOnce).to.be.ok;
          expect(callbacks[0].calledWith(JSON.parse(treasureHelper.responses.success))).to.be.ok;
          expect(callbacks[1].calledOnce).not.to.be.ok;
          
        });
      
        it("should call the error callback on error", function() {
          
          var callbacks = [sinon.spy(), sinon.spy()];
          this.respondWith(500, treasureHelper.responses.error);
          this.treasure.addEvent(treasureHelper.table, treasureHelper.properties, callbacks[0], callbacks[1]);
          this.server.respond();
      
          expect(this.server.requests[0].requestBody)
            .to.equal(JSON.stringify(treasureHelper.properties));
          expect(callbacks[0].calledOnce).not.to.be.ok;
          expect(callbacks[1].calledOnce).to.be.ok;
        
        });
        
      }
      
    });
  
    describe('via JSONP to a fake server', function () {
      
      beforeEach(function() {
        this.treasure = new Treasure({
          database: treasureHelper.database,
          writeKey: treasureHelper.writeKey,
          host: treasureHelper.jsonphost,
          requestType: 'jsonp'
        });
      });
      
      it('should add a script tag with a URL that has data and modified params', function(){
        
        this.treasure.addEvent(treasureHelper.table, treasureHelper.properties);
        var tag = document.getElementById('td-js-sdk-jsonp');
        expect(tag).to.exist;
        expect(tag.src).to.contain('data=');
        expect(tag.src).to.contain('modified=');

      });

      it('should call success callback if successful', function (done) {
        var callbacks = [sinon.spy(), sinon.spy()];
        this.treasure.addEvent(treasureHelper.table, treasureHelper.properties, callbacks[0], callbacks[1]);
        setTimeout(function() {
          expect(callbacks[0].calledOnce).to.be.ok;
          expect(callbacks[1].calledOnce).not.to.be.ok;
          expect(callbacks[0].calledWith(JSON.parse(treasureHelper.responses.success))).to.be.ok;
          done();
        }, 300);
      });

      it('should call error callback if unsuccessful', function (done) {
        var callbacks = [sinon.spy(), sinon.spy()];
        this.treasure.addEvent('error', treasureHelper.properties, callbacks[0], callbacks[1]);
        setTimeout(function() {
          expect(callbacks[0].calledOnce).not.to.be.ok;
          expect(callbacks[1].calledOnce).to.be.ok;
          done();
        }, 300);        
      });

    });
    
    // describe("via Image Beacon to a fake server", function(){
      
      
    //   beforeEach(function() {
    //     this.treasure = new Treasure({
    //       database: treasureHelper.database,
    //       writeKey: treasureHelper.writeKey,
    //       host: treasureHelper.host,
    //       requestType: 'beacon'
    //     });
    //   });
      
    //   it("should add an image tag", function(){
        
    //     var callbacks = [function(){ console.log('here'); }, sinon.spy()];
    //     this.treasure.addEvent(treasureHelper.table, treasureHelper.properties, callbacks[0], callbacks[1]);
        
    //     var tag = document.getElementById("treasure-beacon");
    //     //expect(tag).to.exist;
    //     //expect(callbacks[0].calledOnce).to.be.ok;
        
    //   });
      
      
    // });
    
  });
});