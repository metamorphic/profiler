var Fluxy = require('fluxy');

var AppConstants = Fluxy.createConstants({
  serviceMessages: [
    'CREATE_ENTITY',
    'UPDATE_ENTITY',
    'DELETE_ENTITIES',
    'GET_ENTITY',
    'SAVE_VALUE',
    'GET_FORM_SCHEMA',
    'GET_SELECT_OPTIONS',
    'GET_PILLBOX_OPTIONS',
    'FETCH_PAGE'
  ],

  messages: [
    'ALERT'
  ]
});

module.exports = AppConstants;