/*global classie: false, eventie: false, EventEmitter: false */

( function( window ) { 'use strict';

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

var objToString = Object.prototype.toString;
function isArray( obj ) {
  return objToString.call( obj ) === '[object Array]';
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( typeof obj.length === 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}


// -------------------------- ButtonGroup -------------------------- //

function ButtonGroup( element, options ) {
  this.element = element;
  this.options = extend( {}, this.options );
  this.getDeclaredOptions();

  extend( this.options, options );

  this._create();
}

ButtonGroup.prototype = new EventEmitter();

ButtonGroup.prototype.options = {
};

ButtonGroup.prototype.settings = {
  namespace: 'button-group'
};

// get options set in HTML
ButtonGroup.prototype.getDeclaredOptions = function() {

  var elem = this.element;
  var attrName = 'data-' + this.settings.namespace + '-options';
  var attr = elem.getAttribute( attrName );
  var options;
  try {
    options = attr && JSON.parse( attr );
  } catch ( error ) {
    // log error, do not initialize
    if ( console ) {
      console.error( 'Error parsing ' + attrName + ' on ' +
        elem.nodeName.toLowerCase() + ( elem.id ? '#' + elem.id : '' ) + ': ' +
        error );
    }
  }

  extend( this.options, options );
};

ButtonGroup.prototype._create = function() {
  this.isRadio = this.options.behavior === 'radio';
  // check if first input is radio
  if ( !this.isRadio ) {
    var input = this.element.querySelector('input');
    var type = input && input.getAttribute('type');
    this.isRadio = type && type === 'radio';
  }

  this.getButtons();

  eventie.bind( this.element, 'click', this );
};

ButtonGroup.prototype.getButtons = function() {
  // debugger;
  var buttonSelector = this.options.buttonSelector;
  var buttonElems = buttonSelector ? this.element.querySelectorAll( buttonSelector ) :
    this.element.children;
  buttonElems = makeArray( buttonElems );
  this.buttons = [];
  for ( var i=0, len = buttonElems.length; i < len; i++ ) {
    var buttonElem = buttonElems[i];
    var button = new Button( buttonElem, this );
    this.buttons.push( button );
  }
};

// ----- events ----- //

// enable event handlers for listeners
// i.e. click -> onclick
ButtonGroup.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

ButtonGroup.prototype.onclick = function( event ) {
  // get clicked button
  // crawl up DOM until button is found
  var elem = event.target;
  var clickedButton, i, button;
  var len = this.buttons.length;
  while ( !clickedButton && elem !== this.element ) {
    for ( i=0; i < len; i++ ) {
      button = this.buttons[i];
      if ( elem === button.element ) {
        clickedButton = button;
        break;
      }
    }
    elem = elem.parentNode;
  }
  // bail if not a button clicked
  // or clicked button was already checked radio button
  if ( !clickedButton || ( this.isRadio && clickedButton.isChecked ) ) {
    return;
  }

  if ( this.isRadio ) {
    // uncheck other buttons
    for ( i=0; i < len; i++ ) {
      button = this.buttons[i];
      if ( button !== clickedButton ) {
        button.uncheck();
      }
    }
  }

  clickedButton.click();
  this.emit( 'change', this, event, clickedButton );
};

// -------------------------- Button -------------------------- //

function Button( element, group ) {
  this.element = element;
  this.group = group;
  this._create();
}

Button.prototype._create = function() {
  // get initial isChecked
  var input = this.element.querySelector('input');
  if ( input && input.checked ) {
    classie.add( this.element, 'is-checked' );
    this.isChecked = true;
    return;
  }

  this.isChecked = classie.has( this.element, 'is-checked' );
};

Button.prototype.click = function() {
  // only click once every thread
  // dismiss click if already checked and radio
  if ( this.isClicked || ( this.group.isRadio && this.isChecked ) ) {
    return;
  }

  this.toggle();

  // flag clicked
  this.isClicked = true;
  var _this = this;
  setTimeout( function() {
    delete _this.isClicked;
  });
};

Button.prototype.toggle = function() {
  this[ this.isChecked ? 'uncheck' : 'check' ]();
};

Button.prototype.check = function() {
  classie.add( this.element, 'is-checked' );
  this.isChecked = true;
};

Button.prototype.uncheck = function() {
  classie.remove( this.element, 'is-checked' );
  this.isChecked = false;
};

window.ButtonGroup = ButtonGroup;

})( window );
