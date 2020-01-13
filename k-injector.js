var isAlarmStarted = false;
var mdRatioAlarmVariable = '';
var isInitHandshakeWithParent = false;
var objDate = new Date();
var dayNum = objDate.getDay();
var dayHours = objDate.getHours();
var showMarketDepth = true;
var currentInterval = 1;
var refreshChartRunning = false;
var isHotKeysInitiated = false;

if(dayNum > 5) {
  showMarketDepth = false;
}

if(dayHours < 9 || dayHours > 15) {
  showMarketDepth = false;
}

function fireEvent(node, eventName) {
    // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
    var doc;
    if (node.ownerDocument) {
        doc = node.ownerDocument;
    } else if (node.nodeType == 9){
        // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
        doc = node;
    } else {
        throw new Error("Invalid node passed to fireEvent: " + node.id);
    }

     if (node.dispatchEvent) {
        // Gecko-style approach (now the standard) takes more work
        var eventClass = "";
      
        // Different events have different event classes.
        // If this switch statement can't map an eventName to an eventClass,
        // the event firing is going to fail.
        switch (eventName) {
            case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
            case "mousedown":
            case "mouseup":
                eventClass = "MouseEvents";
                break;

            case "focus":
            case "change":
            case "stxtap":
            case "blur":
            case "select":
                eventClass = "HTMLEvents";
                break;

            default:
                throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
                break;
        }
        var event = doc.createEvent(eventClass);
        event.initEvent(eventName, true, true); // All events created as bubbling and cancelable.

        event.synthetic = true; // allow detection of synthetic events
        // The second parameter says go ahead with the default action
        node.dispatchEvent(event, true);
    } else  if (node.fireEvent) {
        // IE-old school style, you can drop this if you don't need to support IE8 and lower
        var event = doc.createEventObject();
        event.synthetic = true; // allow detection of synthetic events
        node.fireEvent("on" + eventName, event);
    }
};

// initiate marketdepth drawer on load.
var t =  setTimeout(function(){ 
  //openCloseDrawer();
}, 1000);

function openCloseDrawer() {
    //var t =  setTimeout(function(){ 
      var el = document.getElementsByClassName('drawer-menu');
      
      if(!showMarketDepth) {
        return false;
      }
        
      for (var i=0;i<el.length; i++) {
          fireEvent(el[i], 'click');
      }
    //}, 1000);
}

function buildCustomWrapper() {
  
  if(jQuery('#ms-customs-wrapper').length != 0) return false;
  
  var el = document.querySelectorAll(".market-depth");
  if(el.length > 0) {
    var mdRatio = document.querySelectorAll("#ms-customs-wrapper");

    var bmdiv = document.createElement('div');
    bmdiv.setAttribute('id', 'ms-customs-wrapper');
    var str = "<div class=\"ms-md-ratio\"><span class=\"ms-buy-ratio "+mdRatioAlarmVariable+"\">BR: <span class=\"buy-ratio-val\" style=\"color:green\"> </span></span>";
    str += "<span class=\"ms-sell-ratio "+mdRatioAlarmVariable+"\">SR: <span class=\"sell-ratio-val\" style=\"color:red\"></span></span>"
    str += "<span>VI: <b class=\"volume-index-val\"></b></span>";
    str += "<span>BV: <b class=\"buy-order-val\"></b></span>";
    str += "<span>SV: <b class=\"sell-order-val\"></b></span>";
    str += "</div>";
    bmdiv.innerHTML = str;
    document.querySelector(".depth-table").appendChild(bmdiv);
  }
}

//if(window.location.pathname.indexOf('/ext/ciq') !== -1) {
if(window.location.pathname.indexOf('/ext/chart') !== -1 || window.location.pathname.indexOf('/ext/ciq') !== -1) {
  window.parent.postMessage("update-frames", "http://minestocks.com");
  AddExternals();
  runScript();
} else if(window.location.pathname.indexOf('/positions') !== -1) {
  AddExternals();
  runPositionsScript();
} else if(window.location.pathname.indexOf('/orders') !== -1) {
  AddExternals();
  //runPositionsScript();
} else {
  //AddExternals();
  
}


function escapeWindow(message) {
  if(message == undefined) {
    message = '';
  }
  jQuery(window).keyup(function (event) {
      var keycode = event.which;
      console.log(keycode);
      if(keycode == 27) {
        window.parent.postMessage('escape', "http://minestocks.com");
        event.preventDefault();
      }
  });
}

function initHotKeys() {
  
  jQuery(window).keyup(function (event) {
      var keycode = event.which;
      console.log(keycode);
      if(keycode == 66 || keycode == 83) {
        if(!jQuery('.order-window').hasClass('open')) {
          var highPrice = $('#chart-iframe').contents().find('cq-hu-high').html();
          var lowPrice = $('#chart-iframe').contents().find('cq-hu-low').html();
          
          // set the product as MIS by default
          fireEvent(jQuery('.order-window .content .products .su-radio-wrap .su-radio-label:eq(0)')[0], 'click');
          // this line is to set the order type as limit by default, UNCOMMENT TO ENABLE THIS
          fireEvent(jQuery('.order-window .content .order-types .su-radio-wrap .su-radio-label:eq(3)')[0], 'click');
          // set the order values in the window
          if(jQuery('.order-window .content .row-2 .quantity input').val() == 1) {
            // set the default amount of share quantity here.
            jQuery('.order-window .content .row-2 .quantity input').val(10);
            fireEvent(jQuery('.order-window .content .row-2 .quantity input')[0], 'change');
          }
          if(keycode == 83) {
              jQuery('.order-window .content .row-2 .price input').val(lowPrice);
              fireEvent(jQuery('.order-window .content .row-2 .price input')[0], 'change');
              var s = setTimeout(function() {
                jQuery('.order-window .content .row-2 .trigger-price input').val(parseFloat(lowPrice));
                fireEvent(jQuery('.order-window .content .row-2 .trigger-price input')[0], 'change');
              }, 100);
            } else if(keycode == 66) {
              jQuery('.order-window .content .row-2 .price input').val(highPrice);
              fireEvent(jQuery('.order-window .content .row-2 .price input')[0], 'change');
              var s = setTimeout(function() {
                jQuery('.order-window .content .row-2 .trigger-price input').val(parseFloat(highPrice));
                fireEvent(jQuery('.order-window .content .row-2 .trigger-price input')[0], 'change');
              }, 100);
            } 
          jQuery('.order-window .content .row-2 .quantity input').focus();
          jQuery('.order-window').addClass('open');
        } else if(jQuery('.order-window').hasClass('open')) {
          // execute of buy or sell order Key - double tap B or S
          if(keycode == 66) {
            fireEvent(jQuery('.order-window .content .actions button.place.button-blue')[0], 'click');
          } else if(keycode == 83) {
            fireEvent(jQuery('.order-window .content .actions button.place.button-orange')[0], 'click');
          }
        }
      } else if(keycode == 77) {
        // set order type as market Key - M
        fireEvent(jQuery('.order-window .content .order-types .su-radio-wrap .su-radio-label:eq(0)')[0], 'click');
      } else if(keycode == 76) {
        // set order type as Limit Key - L
        fireEvent(jQuery('.order-window .content .order-types .su-radio-wrap .su-radio-label:eq(1)')[0], 'click');
      } else if(keycode == 69) {
        // Exit single orders from the chart window. Key - E
        var symbol = window.location.pathname.split('/');
        symbol = symbol[(symbol.length - 2)];
        window.parent.postMessage('exit-order:' + symbol, "http://minestocks.com");
      } else if(keycode == 84) {
        // Cancel single orders from the chart window. Key - T
        var symbol = window.location.pathname.split('/');
        symbol = symbol[(symbol.length - 2)];
        window.parent.postMessage('cancel-order:' + symbol, "http://minestocks.com");
      } else if(keycode == 88) {
        // close a window, Key - X
        var symbol = window.location.pathname.split('/');
        symbol = symbol[(symbol.length - 2)];
        //jQuery(window.parent.getElementById(symbol)).remove();
        window.parent.postMessage('close-window:' + symbol, "http://minestocks.com");
      } else if(keycode > 48 && keycode < 58) {
        if(jQuery('.order-window').length == 0) {
          window.parent.postMessage('switch-window:' + keycode, "http://minestocks.com");
        }
        event.preventDefault();
      }
      event.preventDefault();
  });
  
  
  if($('#chart-iframe').contents().find('.stx_crosshair').length > 0) {
    $('#chart-iframe').contents().find('.stx_crosshair').on('dblclick', function() {
        
    });
  }
  
  if($('#chart-iframe').contents().find('.ciq-nav').length > 0) {
    $('#chart-iframe').contents().find('.ciq-nav').on('dblclick', function() {
      var RCl = jQuery('#chart-iframe').contents().find('.refresh-chart');
      for (var i=0;i<RCl.length; i++) {
          fireEvent(RCl[i], 'click');
      }
    });
  }
  
  if($('#chart-iframe').contents().find('.stx-subholder').length > 0) {
    
    
    
    $('#chart-iframe').contents().find('.stx-subholder').on('dblclick', function() {
      var RCl = jQuery('#chart-iframe').contents().find('.refresh-chart');
      for (var i=0;i<RCl.length; i++) {
          //fireEvent(RCl[i], 'click');
      }
      
      var highPrice = $('#chart-iframe').contents().find('cq-hu-high').html();
      var lowPrice = $('#chart-iframe').contents().find('cq-hu-low').html();
      var chartSymbolX = getParameterByName('symbol', $('#chart-iframe').attr('src')); 
      chartSymbolX = chartSymbolX.replace(/&/, '_');
      //alert(chartSymbolX);
      //var chartSymbolX = $('#chart-iframe').contents().find('cq-symbol-description').html();
      window.parent.postMessage('price-update:'+ chartSymbolX + ':' + highPrice + ',' + lowPrice, "http://minestocks.com");
      //openCloseDrawer();
    });
    isHotKeysInitiated = true;
  }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function initRefreshChart() {
  // refresh chart during market hours only.
  if(!showMarketDepth) {
    return false;
  }
  
  refreshChartRunning = true;
  
  var intervalArray = [];
  intervalArray[1] = 0;
  intervalArray[2] = 1;
  intervalArray[3] = 2;
  intervalArray[4] = 4;
  intervalArray[5] = 4;
  intervalArray[10] = 5;
  intervalArray[15] = 6;
  intervalArray[30] = 7;

  console.log('refresh chart initiated');
  var rct = setInterval(function() {
    var layoutInterval = jQuery.parseJSON(localStorage.getItem('layout'));
    
    var RCl = jQuery('#chart-iframe').contents().find('.refresh-chart');
    
    var chartInterval = jQuery('#chart-iframe').contents().find('.ciq-period cq-clickable');
    var saveLayoutButton = jQuery('#chart-iframe').contents().find('.save-layout-btn');
    var cDT = new Date();
    var cMin = cDT.getMinutes();
    var cSec = cDT.getSeconds();
    var intervalMenu = jQuery('#chart-iframe').contents().find('.ciq-period .ps-container cq-item');
    chartInterval = parseInt(chartInterval.html());
    //console.log('layout interval' + layoutInt.interval);
    if(chartInterval != currentInterval && saveLayoutButton) {
      if(saveLayoutButton.length > 0) {
        fireEvent(saveLayoutButton[0], 'click');
        currentInterval = chartInterval;
        //return;
      }
    }
    // change chart interval in all opened charts
    else if(currentInterval != layoutInterval.interval) {
      if(intervalMenu.length > 0) {
        fireEvent(intervalMenu[intervalArray[layoutInterval.interval]], 'stxtap');
        jQuery('#chart-iframe').contents().find('.ciq-menu.ciq-period').removeClass('stxMenuActive');
        currentInterval = layoutInterval.interval;
      }
      
      //return;
    }
    
    //console.log(intervalMenu[2].innerHTML);
    //fireEvent(intervalMenu[2], 'stxtap');
    if(chartInterval > 0  && cMin % chartInterval == 0 && cSec == 0 && RCl.length > 0) {
      console.log('refresh chart fired');
      for (var i=0;i<RCl.length; i++) {
          fireEvent(RCl[i], 'click');
      }
    }
  }, 1000);
}

function runScript() {

    var st = setInterval(function() {
        if(!isInitHandshakeWithParent) {
          /*var hksto = setTimeout(function() {
            initHotKeys();
          }, 10000);*/
          
          escapeWindow('');
          //alert('hello');
          
          isInitHandshakeWithParent = true;
        }
        
        if(!isHotKeysInitiated) {
          initHotKeys();
        }
        
        if(!refreshChartRunning) {
          initRefreshChart();
        }
        
        // comment out this to open the market depth window.
        buildCustomWrapper();
        if(!showMarketDepth) {
            return false;
        }
        
        if(jQuery('#ms-customs-wrapper').length == 0) return false;
        
        var el = document.querySelectorAll(".market-depth");
        var hash = window.location.hash.substr(1);
        
        var buyOrders  = jQuery(".market-depth .depth-table table.buy tfoot td.text-right");
        var sellOrders = jQuery(".market-depth .depth-table table.sell tfoot td.text-right");
        var buyR = 0;
        var sellR = 0;
        //console.log(window.location.pathname + ' > ' +buyOrders.html() + ' ' + sellOrders.html());
        if(hash == '') {
          if(buyOrders) {
            if(sellOrders.html() != 0) {
              buyR = parseInt(buyOrders.html().replace(/,/g, '')) / parseInt(sellOrders.html().replace(/,/g, ''));
            }
            if(buyOrders.html() != 0) {
              sellR = parseInt(sellOrders.html().replace(/,/g, '')) / parseInt(buyOrders.html().replace(/,/g, ''));
            }
          }
        }
        
        if(buyR > 2) {
          if(!jQuery('.ms-buy-ratio').hasClass('md-buy'))
                  jQuery('.ms-buy-ratio').addClass('md-buy');
          if(jQuery('.ms-sell-ratio').hasClass('md-sell'))
                  jQuery('.ms-sell-ratio').removeClass('md-sell');          
        } else if(sellR > 2) {
          if(!jQuery('.ms-sell-ratio').hasClass('md-sell'))
                  jQuery('.ms-sell-ratio').addClass('md-sell');
          if(jQuery('.ms-buy-ratio').hasClass('md-buy'))
                  jQuery('.ms-buy-ratio').removeClass('md-buy');        
        } else {
          if(jQuery('.ms-buy-ratio').hasClass('md-buy'))
                  jQuery('.ms-buy-ratio').removeClass('md-buy');
          if(jQuery('.ms-sell-ratio').hasClass('md-sell'))
                  jQuery('.ms-sell-ratio').removeClass('md-sell');        
        }
        if(el.length > 0) {
          jQuery('#ms-customs-wrapper .buy-ratio-val').html(buyR.toFixed(2));
          jQuery('#ms-customs-wrapper .sell-ratio-val').html(sellR.toFixed(2));
          jQuery('#ms-customs-wrapper .volume-index-val').html(msGetVolumeIndex());
          jQuery('#ms-customs-wrapper .buy-order-val').html(msOrdersValue(buyOrders.html()));
          jQuery('#ms-customs-wrapper .sell-order-val').html(msOrdersValue(sellOrders.html()));
          
          if(!isAlarmStarted) {
            msRunAlarm();
          }
          
        }
        
  }, 2000);
}

function msRunAlarm() {
  if(!isAlarmStarted) {
    var y = setInterval(function() {
      jQuery(".depth-table").toggleClass('ms-alarm-color');
      //msToggleAlarmFlash(document.querySelector(".depth-table"));
      isAlarmStarted = true;
    }, 3000);
  }
}

function AddExternals(){
  if (!window.jQuery){
    var jq = document.createElement("script");
    jq.type = "text/javascript";
    jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js";
    document.getElementsByTagName("head")[0].appendChild(jq);
    console.log("Added jQuery!");
    
    
  } else {
    console.log("jQuery already exists.")
  }
}

function msGetNumberFormat(num) {
  return parseFloat(num.replace(/,/g, ''));
}

function msOrdersValue(orders) {
  var refCapital = 100000;
  var refPrice = 100;
  var price;
  orders = msGetNumberFormat(orders);
  price = jQuery('.drawer .ohlc > .row:eq(1) > div:eq(1) > span.value').html();
	price = msGetNumberFormat(price);
	
	if(price == 0) return 0;
      
	var sharesForALac = refCapital / price;
	var oValue = (orders / sharesForALac) / 100;
	oValue = oValue.toFixed(2);
	
	return oValue;
}

function msGetVolumeIndex() {
      var price;
      var volume;
			var refCapital = 100000;
			var refPrice = 100;
			
			if(jQuery('.drawer .ohlc').length == 0) return 0;
			
			volume = jQuery('.drawer .ohlc > .row:eq(2) > div:eq(0) > span.value').html();
			volume = msGetNumberFormat(volume);
			price = jQuery('.drawer .ohlc > .row:eq(1) > div:eq(1) > span.value').html();
			price = msGetNumberFormat(price);
			
      if(price == 0) return 0;
      
			var sharesForALac = refCapital / price;
			var vIndex = (volume / sharesForALac) / 100;
			vIndex = vIndex.toFixed(2);
			
			return vIndex;
		}

function runPositionsScript() {
  var x = setTimeout(function() {
    
    escapeWindow('close-positions');
    
    jQuery(window).keyup(function (event) {

        var keycode = event.which;
        console.log(keycode);
        if(keycode == 69) {
          msExitOrders(jQuery('.open-positions table th .su-checkbox-box')[0]);
          event.preventDefault();
        }
    });
    
  }, 3000);
  
}

  function msExitOrders(obj) {
    fireEvent(obj, 'click');
    var g = setTimeout(function() {
      fireEvent(jQuery('.open-positions table tfoot td button.button-small')[0], 'click');
      var t = setTimeout(function() {
        fireEvent(jQuery('.orders-basket .modal-wrapper .modal-footer button.button-blue')[0], 'click');
      }, 200);
    }, 200);
  }
  
  function msCancelOrders(obj) {
    fireEvent(obj, 'click');
    var g = setTimeout(function() {
      fireEvent(jQuery('.pending-orders-wrap table tfoot td button.button-small')[0], 'click');
      var t = setTimeout(function() {
        fireEvent(jQuery('.orders-basket .modal-wrapper .modal-footer button.button-blue')[0], 'click');
      }, 200);
    }, 200);
  }

    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent, function (e) {
        console.log(e.data);
        if(e.data.indexOf('exit-order') != -1) {
          var symbol = e.data.split(':');
          symbol = symbol[1];
          console.log(symbol);
          msExitOrders(jQuery('section.open-positions table tbody tr:contains("' + symbol + '") td:eq(0) .su-checkbox-box')[0]);
        } else if(e.data == 'close-positions') {
            
        } else if(e.data.indexOf('cancel-order') != -1) {
          var symbol = e.data.split(':');
          symbol = symbol[1];
          console.log(symbol);
          msCancelOrders(jQuery('section.pending-orders-wrap table tbody tr:contains("' + symbol + '") td:eq(0) .su-checkbox-box')[0]);
        } else {
             
        }
    }, false); 
    
  
