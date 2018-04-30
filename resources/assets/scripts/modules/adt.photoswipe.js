import PhotoSwipe from 'photoswipe';
import PhotoSwipeUI_Default from './adt.photoswipeUI';

module.exports = window.initPhotoSwipeFromDOM = class {

  constructor( gallerySelector ) {
    if( typeof gallerySelector === 'undefined' ) {
      return;
    }

    // loop through all gallery elements and bind events
    let galleryElements = document.querySelectorAll( gallerySelector );

    for( let i = 0, l = galleryElements.length; i < l; i++ ) {
      galleryElements[i].setAttribute( 'data-pswp-uid', i+1 );
      galleryElements[i].onclick = this.onThumbnailsClick.bind( this );
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    let hashData = this.photoswipeParseHash();
    if( hashData.pid && hashData.gid ) {
      this.openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
    }
  }

  // parse slide data (url, title, size ...) from DOM elements
  // (children of gallerySelector)
  parseThumbnailElements() {
    let thumbElements = [].slice.call( document.querySelectorAll( 'figure.c-gallery__fig' ) );
    let numNodes = thumbElements.length;
    let items = [];
    let figureEl;
    let linkEl;
    let size;
    let item;

    for( let i = 0; i < numNodes; i++ ) {

      figureEl = thumbElements[i]; // <figure> element

      linkEl = figureEl.children[0]; // <a> element

      size = linkEl.dataset.size.split( 'x' );

      // create slide object
      item = {
        src: linkEl.getAttribute( 'href' ),
        w: parseInt( size[0], 10 ),
        h: parseInt( size[1], 10 )
      };

      if( figureEl.children.length > 1 ) {
        // <figcaption> content
        item.title = figureEl.children[1].innerHTML;
      }

      if( linkEl.children.length > 0 ) {
        // <img> thumbnail element, retrieving thumbnail url
        item.msrc = linkEl.children[0].children[0].getAttribute( 'src' );
      }

      item.el = figureEl; // save link to element for getThumbBoundsFn
      items.push( item );
    }

    return items;
  }

  // find nearest parent element
  closest( el, fn ) {
    return el && ( fn( el ) ? el : this.closest( el.parentNode, fn ) );
  }

  // triggers when user clicks on thumbnail
  onThumbnailsClick( e ) {
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : e.returnValue = false;

    let eTarget = e.target || e.srcElement;

    // find root element of slide
    let clickedListItem = this.closest( eTarget, function( el ) {
      return ( el.tagName && el.tagName.toUpperCase() === 'FIGURE' );
    });

    if( !clickedListItem ) {
      return;
    }

    let clickedGallery = clickedListItem.parentNode.parentNode.parentNode;
    let index;

    const items = [].slice.call( document.querySelectorAll( 'figure.c-gallery__fig' ) );

    for ( let i = 0; i < items.length; i++ ) {
      if( items[i] === clickedListItem ) {
        index = i;
        break;
      }
    }

    this.openPhotoSwipe( index, clickedGallery );
    return false;
  }

  // parse picture index and gallery index from URL (#&pid=1&gid=2)
  photoswipeParseHash() {
    let hash = window.location.hash.substring(1);
    let params = {};

    if( hash.length < 5 ) {
      return params;
    }

    let lets = hash.split( '&' );
    for ( let i = 0; i < lets.length; i++ ) {
      if( !lets[i] ) {
        continue;
      }
      let pair = lets[i].split( '=' );
      if( pair.length < 2 ) {
        continue;
      }
      params[pair[0]] = pair[1];
    }

    if( params.gid ) {
      params.gid = parseInt( params.gid, 10 );
    }

    return params;
  };

  openPhotoSwipe( index, galleryElement, disableAnimation, fromURL ) {

    let pswpElement = document.querySelectorAll( '.pswp' )[0];
    let gallery;
    let options;
    let items;

    items = this.parseThumbnailElements( galleryElement );

    // define options (if needed)
    options = {
      // define gallery index (for URL)
      galleryUID: galleryElement.getAttribute('data-pswp-uid'),
      getThumbBoundsFn( index ) {
        // See Options -> getThumbBoundsFn section of documentation for more info
        let thumbnail = items[index].el.getElementsByTagName('img')[0];
        let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
        let rect = thumbnail.getBoundingClientRect();

        return {
          x:rect.left,
          y:rect.top + pageYScroll,
          w:rect.width
        }
      }

    };

    // PhotoSwipe opened from URL
    if( fromURL ) {
      if( options.galleryPIDs ) {
        // parse real index when custom PIDs are used
        // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
        for( let j = 0; j < items.length; j++ ) {
          if( items[j].pid == index ) {
            options.index = j;
            break;
          }
        }
      } else {
        // in URL indexes start from 1
        options.index = parseInt( index, 10 ) - 1;
      }
    } else {
      options.index = parseInt( index, 10 );
    }

    // exit if index not found
    if( isNaN( options.index ) ) {
      return;
    }

    if( disableAnimation ) {
      options.showAnimationDuration = 0;
    }

    options.shareEl = false;
    options.history = false;

    // Pass data to PhotoSwipe and initialize it
    gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options );
    gallery.init();
  }
};
