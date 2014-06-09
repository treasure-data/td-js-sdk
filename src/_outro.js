
  // ----------------------
  // Utility Methods
  // ----------------------

  if (Treasure.loaded) {
    setTimeout(function(){
      Treasure.utils.domready(function(){
        Treasure.trigger('ready');
      });
    }, 0);
  }

  return Treasure;
});
