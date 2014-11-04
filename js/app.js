( function( global, doc, $, ns ) {
  'use strict';
  ns = ns || {};  

  function EventDispatcher() {
    this._events = {};
  }

  EventDispatcher.prototype.checkEvent = function( eventName ) {
    return !!this._events[ eventName ];
  };

  EventDispatcher.prototype.listen = function( eventName, callback ) {
    if ( this.checkEvent(eventName) ) {
      var events = this._events[ eventName ];
      var i;
      var eventsLength = events.length;
      for ( i = 0; i < eventsLength; i++ ) {
        if ( events[ i ] === callback ) {
          return;
        }
      }
      events.push( callback );
    }
    else{
      this._events[ eventName ] = [ callback ];
    }
    return this;
  };

  EventDispatcher.prototype.removeEvent = function( eventName, callback ) {
    if ( !this.checkEvent(eventName) ) {
      return;
    }
    else{
      var events = this._events[ eventName ],
          i      = events.length,
          index;
      while ( i-- ) {
        if ( events[ i ] === callback ) {
          index = i;
        }
      }
      events.splice( index, 1 );
    }
    return this;
  };

  EventDispatcher.prototype.fire = function( eventName, opt_this ) {
    if ( !this.checkEvent(eventName) ) {
      return;
    }
    else{
      var events = this._events[ eventName ];
      var i;
      var copyEvents = $.merge( [], events );
      var copyEventsLength = copyEvents.length;
      var arg        = $.merge( [], arguments );
      arg.splice( 0, 2 );
      for ( i = 0; i < copyEventsLength; i++ ) {
        copyEvents[ i ].apply( opt_this || this, arg );
      }
    }
  };

  ns.EventDispatcher = EventDispatcher;
  global.yahoo = ns;
})( this, document, jQuery, this.yahoo );

( function( global, doc, $, ns ) {
  'use strict';
  ns = ns || {};  

  function Throttle( minInterval ){
    this.interval = minInterval;
    this.prevTime = 0;
    this.timer = function(){};
  }

  Throttle.prototype.exec = function( callback ){
    var now = + new Date(),
        delta = now - this.prevTime;

    clearTimeout( this.timer );
    if( delta >= this.interval ){
      this.prevTime = now;
      callback();
    }
    else{
      this.timer = setTimeout( callback, this.interval );
    }
  };

  ns.Throttle = Throttle;
  global.yahoo = ns;
})( this, document, jQuery, this.yahoo );

( function( global, doc, $, ns ) {
  'use strict';
  ns = ns || {};

  ns.transitionend = 'webkitTransitionEnd otransitionend ' +
                        'oTransitionEnd msTransitionEnd '     +
                        'transitionend';
  ns.animationend = 'webkitAnimationEnd oanimationend ' +
                        'oAnimationEnd msAnimationEnd '     +
                        'animationend';
  global.yahoo = ns;
})( this, document, jQuery, this.yahoo ); 

( function( global, doc, $, ns ) {
  'use strict';
  ns = ns || {};
  var	instance;
  var originalConstructor;

  /*-------------------------------------------
    PUBLIC
  -------------------------------------------*/
	function ScrollHandler(){
    ns.EventDispatcher.call( this );
 	}

  /*-------------------------------------------
    INHERIT
  -------------------------------------------*/
  originalConstructor = ScrollHandler.prototype.constructor;
  ScrollHandler.prototype = new ns.EventDispatcher();
  ScrollHandler.prototype.constructor = originalConstructor;

  /*-------------------------------------------
    PRIVATE
  -------------------------------------------*/
  ScrollHandler.prototype.exec = function(){
    var _this = this;
    var throttle = new ns.Throttle( 100 );

    $( global ).on( 'scroll', function(){
      throttle.exec( function(){
        _this.fire( 'SCROLLED', _this, $( global ).scrollTop() );
      } );
    } );
  };

  /*-------------------------------------------
    EXPORT (singleton)
  -------------------------------------------*/
  function _getInstance(){
    if (!instance) {
      instance = new ScrollHandler();
    }
    return instance;
  }

  ns.ScrollHandler = {
    getInstance: _getInstance
  };

	global.yahoo = ns;
})( this, document, jQuery, this.yahoo );

( function( global, doc, $, ns ) {
  'use strict';
  ns = ns || {};
  var	instance;
  var originalConstructor;

  /*-------------------------------------------
    PUBLIC
  -------------------------------------------*/
	function ResizeHandler(){
    ns.EventDispatcher.call( this );
 	}

  /*-------------------------------------------
    INHERIT
  -------------------------------------------*/
  originalConstructor = ResizeHandler.prototype.constructor;
  ResizeHandler.prototype = new ns.EventDispatcher();
  ResizeHandler.prototype.constructor = originalConstructor;

  /*-------------------------------------------
    PRIVATE
  -------------------------------------------*/
  ResizeHandler.prototype.exec = function(){
    var _this = this;
    var throttle = new ns.Throttle( 200 );

    $( global ).on( 'resize', function(){
      throttle.exec( function(){
        _this.fire( 'RESIZED', _this );
      } );
    } );
  };

  /*-------------------------------------------
    EXPORT (singleton)
  -------------------------------------------*/
  function _getInstance(){
    if (!instance) {
      instance = new ResizeHandler();
    }
    return instance;
  }

  ns.ResizeHandler = {
    getInstance: _getInstance
  };

	global.yahoo = ns;
})( this, document, jQuery, this.yahoo );

( function( global, doc, $, ns ) {
  'use strict';
  ns = ns || {};
  ns.soundTotal = 30;

  var	instance;
  var originalConstructor;
  var sound = [];
  var timeout;

  /*-------------------------------------------
    PUBLIC
  -------------------------------------------*/
	function AudioPlayer(){
    var i;
    this.lastPlayed = -1;

    for ( i = 0; i < ns.soundTotal; i++ ){
      sound.push( new Audio( 'audio/' + 
                             ( '00' + i ).slice( -2 ) + '.mp3' ) );
    }

    ns.EventDispatcher.call( this );
 	}

  /*-------------------------------------------
    INHERIT
  -------------------------------------------*/
  originalConstructor = AudioPlayer.prototype.constructor;
  AudioPlayer.prototype = new ns.EventDispatcher();
  AudioPlayer.prototype.constructor = originalConstructor;

  /*-------------------------------------------
    PRIVATE
  -------------------------------------------*/
  AudioPlayer.prototype.play = function( audio_index ){
    if ( sound[ audio_index ] !== undefined &&
         audio_index !== this.lastPlayed ){
      sound[ audio_index ].currentTime = 0;
      sound[ audio_index ].play();

      $( '#right .sound-area' ).eq( audio_index ).
                              addClass( 'popup' );
      $( '#right .sound-area' ).eq( audio_index )
        .on( ns.animationend, function(){
          $( '#right .sound-area' ).eq( audio_index ).
                                  off( ns.transitionend );
          $( '#right .sound-area' ).eq( audio_index ).
                                  removeClass( 'popup' );
      } );

      $( '#board-container .board-on' ).css( {
        display: 'block',
        left: $( '#right .ball' ).eq( audio_index ).
              css( 'left' )
      } );

      clearTimeout( timeout );
      timeout = setTimeout( function(){
        $( '#board-container .board-on' ).hide();
      }, 100 );

      this.lastPlayed = audio_index;
      this.fire( 'AUDIO_PLAYED', this );
    }
  };

  /*-------------------------------------------
    EXPORT (singleton)
  -------------------------------------------*/
  function _getInstance(){
    if (!instance) {
      instance = new AudioPlayer();
    }
    return instance;
  }

  ns.AudioPlayer = {
    getInstance: _getInstance
  };

	global.yahoo = ns;
})( this, document, jQuery, this.yahoo );

( function( global, doc, $, ns ) {
  'use strict';
  ns = ns || {};

  var	instance;
  var photo_total = 16;
  /*-------------------------------------------
    PUBLIC
  -------------------------------------------*/
	function Photo(){
    this.currentPhoto = 0;
    this.marginTop = 0;
 	}

  /*-------------------------------------------
    PRIVATE
  -------------------------------------------*/
  Photo.prototype.change = function(){
    this.currentPhoto += 1;
    if ( this.currentPhoto >= photo_total ){
      this.currentPhoto = 0;
    }
    $( '<img>' ).attr( {
      src: 'img/photo/' + ( '00' +
           this.currentPhoto ).slice( -2 ) + '.jpg',
      alt: '写真'
    } ).
    css( { marginTop: this.marginTop } ).
    addClass( 'show' ).
    appendTo( '#left .photo' );
  };

  Photo.prototype.setMargin = function( marginTop ){
    this.marginTop = marginTop;
  };

  /*-------------------------------------------
    EXPORT (singleton)
  -------------------------------------------*/
  function _getInstance(){
    if (!instance) {
      instance = new Photo();
    }
    return instance;
  }

  ns.Photo = {
    getInstance: _getInstance
  };

	global.yahoo = ns;
})( this, document, jQuery, this.yahoo );

( function( global, doc, $, ns ) {
  'use strict';
  ns = ns || {};

  $(function() {
    var scrollHandler = ns.ScrollHandler.getInstance();
    var audioPlayer   = ns.AudioPlayer.getInstance();
    var photo         = ns.Photo.getInstance();
    var resizeHandler = ns.ResizeHandler.getInstance();

    var ball_offset;
    var boardOn_offset;
    var photo_offset;

    var board_on = new Image();
    var board    = new Image();
    var photo_img    = new Image();
    var loadedImages = 0;

    var $ball = $( '<p class="ball"></p>' );
    var SCROLL_INTERVAL = 50;
    var BOARD_TOTAL = 24;
    var i;

    /*--------------------------------
      EVENT LISTENER 
    --------------------------------*/
    scrollHandler.listen( 'SCROLLED', function( scrollTop ){
      var audio_index = Math.floor( scrollTop / SCROLL_INTERVAL ) - 1; 
      audioPlayer.play( audio_index );
    } );

    audioPlayer.listen( 'AUDIO_PLAYED', function(){
      photo.change();
    } );

    resizeHandler.listen( 'RESIZED', function(){
      _reset();
    } );

    /*--------------------------------
      RESET 
    --------------------------------*/
    function _reset(){
      ball_offset = $( '#board-container .board' ).height();
      boardOn_offset = $( '#board-container .board' ).height() -
                           $( '#board-container .board-on' ).height();
      photo_offset = ( $( '#left .photo img' ).height() - 200 ) / 2;

      // SET RIGHT CONTAINER
      $( '#right .ball' ).remove();
      for ( i = 0; i < ns.soundTotal; i++ ){
        $ball.clone().
          css( {
            top: ball_offset + SCROLL_INTERVAL * ( i + 1 ),
            left: ( 100 * Math.floor( Math.random() * 
                  BOARD_TOTAL ) / BOARD_TOTAL ) + '%'
          } ).
          appendTo( '#right' );
      }

      photo.setMargin( -1 * photo_offset );
      $( '#left .photo img' ).css( {
        marginTop: -1 * photo_offset
      } );
      $( '#board-container .board-on' ).css( {
        top: boardOn_offset
      } );
    }

    /*--------------------------------
      INIT
    --------------------------------*/
    scrollHandler.exec();
    resizeHandler.exec();

    // LOAD IMAGE BEFORE LAYOUT 
    board.onload = function(){
      $( board ).appendTo( '#board-container .board' );
      _loadedImage();
    };
    board.src = 'img/orgel/board.jpg';

    board_on.onload = function(){
      $( board_on ).appendTo( '#board-container .board-on' );
      _loadedImage();
    };
    board_on.src = 'img/orgel/board-on.png';

    photo_img.onload = function(){
      $( photo_img ).appendTo( '#left .photo' );
      _loadedImage();
    };
    photo_img.src = 'img/photo/00.jpg';

    function _loadedImage(){
      loadedImages += 1;
      if ( loadedImages === 3 ){
        _reset();
      }
    }

  });
  global.yahoo = ns;
})( this, document, jQuery, this.yahoo );
