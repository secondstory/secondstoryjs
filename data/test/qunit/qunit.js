steal
  .plugins("ss/data") //load your app
  .plugins("funcunit/qunit")   //load qunit
  .then("models/Work", "models/Client")
  .then("data_test")
