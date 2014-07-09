'use strict';

describe('Treasure Library', function () {
  var treasure;

  beforeEach(function () {
    treasure = new Treasure({
      database: treasureHelper.database,
      writeKey: treasureHelper.writeKey
    });
  });

  describe('libs', function () {

    it('should have a Cookies object', function () {
      expect(Treasure).to.include.keys('Cookies');
      expect(Treasure.Cookies).to.include.keys(['set', 'get']);
    });

    it('should have a Base64 object', function () {
      expect(Treasure).to.include.keys('Base64');
      expect(Treasure.Base64).to.include.keys(['encode', 'decode']);
    });

    it('should have a UUID function', function () {
      expect(Treasure).to.include.keys('UUID');
      expect(Treasure.UUID).to.be.a('function');
      expect(Treasure.UUID()).to.be.a('string').and.have.length(36);
    });

  });

});
