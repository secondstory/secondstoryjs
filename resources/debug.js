var DEBUG_START_DATE = new Date(),
    DEBUG_START_MS   = DEBUG_START_DATE.valueOf();

function trace(msg) {
  //@steal-remove-start
  var now           = new Date(),
      ms            = now.valueOf(),
      ms_from_start = ms - DEBUG_START_MS;

  steal.debug.log(ms_from_start + ": " + msg);
  //@steal-remove-end
}

function dump(obj) {
  //@steal-remove-start
  console.debug(obj);
  //@steal-remove-end
}
