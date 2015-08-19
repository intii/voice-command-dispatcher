var MessageRegistry = function() {

  /**
   * A pairing 'message' : [component1, ..., componentN], matching a message to an
   * array of listening components
   * @type {Object}
   */
  var register = {};

  /**
   * Adds a component to the registry, so it can be notified when the given message is received
   * @param  {Object} component The web component
   * @param  {String} message   A message that will be associated with an action
   */
  function subscribe(component, message) {
    if (register[message]) {
      register[message].push(component);
    } else {
      register[message] = [];
      register[message].push(component);
    }
  }

  /**
   * Removes a component from a given message queue
   * @param  {Object} component The web component
   * @param  {String} message   The message to stop listening to
   */
  function unsubscribe(component, message) {
    var index;
    if (register[message]) {
      index = register[message].indexOf(component);
      if (index !== -1) {
        register[message].splice(index, 1);
      }
    }
  }

  /**
   * Notifies all componentes waiting for the received message
   * @param  {String} message The received message
   */
  function notify(message) {
    var index, length;
    if (register[message]) {
      length = register[message].length;
      for(index = 0; index <= length; index ++) {
        register[message][index].notify(message);
      }
    }
  }
}

module.exports = MessageRegistry;