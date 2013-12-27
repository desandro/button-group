function onButtonGroupClick( event ) {

  'use strict';
  // dismiss label clicks
  var target = event.target;
  // ignore labels
  if ( target.nodeName === 'LABEL' &&
    ( target.getAttribute('for') ||target.querySelector('input') )
  ) {
    return;
  }
  
  
  var optionsAttr = this.getAttribute('data-button-group-options');
  var options = optionsAttr && JSON.parse( optionsAttr );
  options = options || {};
  var type = target.getAttribute('type');
  var isRadio = options.behavoir === 'radio' || type && type === 'radio';
  // isRadio = !!isRadio;
  // if ( !matchesSelector( event.target, 'input' ) ) {
  //   return;
  // }
  console.log( isRadio, target );
  classie.toggle( target, 'is-checked' );
  // event.preventDefault();
}
