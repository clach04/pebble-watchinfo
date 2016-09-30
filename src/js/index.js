// https://gist.github.com/rwaldron/3350283
// https://github.com/DasRed/js-object.assign-polyfill
if (Object.assign === undefined) {
  Object.assign = function(target_obj, source_obj) {
    var target = Object(target_obj);
    var src = Object(source_obj);

    Object.getOwnPropertyNames(src).forEach(function(key) {
      target[key] = src[key];
    });

    return target;
  };
}

// -------------------------------------------------------------------------------- //

function merge_tokens(t1, t2) {
  var a, b, c, i, result = [];
  try {
    if ((typeof t1 === 'string') && (typeof t2 === 'string') && ((t1.length > 0) || (t2.length > 0))) {
      t1 = Array(32).join("0") + t1;
      t2 = Array(32).join("0") + t2;
      for (i = 0; i < 32; i++) {
        a = parseInt(t1.substr(i - 32, 1), 16);// || 0xF;
        b = parseInt(t2.substr(i - 32, 1), 16);// || 0xF;
        if (isNaN(a)) a = 0xF;
        if (isNaN(b)) b = 0xF;
        c = (a ^ b) & 0xF;
        //console.log(i - 32 + ": " + a + " ^ " + b + " = " + c);
        result.push(c.toString(16));
      }
      return result.join("");
    } else {
      console.log("watch_info: Invalid Token(s)");
    }
  } catch (e) {
    try {console.log("watch_info: Token Merge Error (" + e.message + ")");}
    catch(e){console.log("watch_info: Token Merge Error");}
  }
  return "";
}

// -------------------------------------------------------------------------------- //

// Watch info defaults
var info_default = {
      "detected" : false, // If detection succeeded
         "ready" : false, // If detection was attempted
         //"valid" : false, // If detection didn't fail due to an error (basically same as "detected")
      "emulator" : null,  // If app is running in an emulator (based on model beginning with "qemu")
      "platform" : "unknown",  // Watch platform (string, all lowercase)
         "model" : "unknown",  // Watch model    (string, all lowercase)
            "bw" : null,  // Watch has a 1 bit black and white screen (based on platform)
         "color" : null,  // Watch has a 6 bit color screen (based on platform)
         "round" : null,  // Watch has a round screen       (based on platform)
          "rect" : null,  // Watch has a rectangular screen (based on platform)
    "microphone" : null,  // Watch has a microphone  (based on platform)
       "compass" : null,  // Watch has a compass     (based on platform)
         "width" : null,  // Screen width in pixels  (based on platform)
        "height" : null,  // Screen height in pixels (based on platform)
    "WatchToken" : null,  // Unique string for one watch for any user
  "AccountToken" : null,  // Unique string for any watch and one user
    "MergeToken" : null,  // Unique string for one watch for one user
          "size" : null,  // If PTR (round), width of the watchband (based on model)
     "bodyColor" : null,  // Color of the plastic or metal body     (based on model)
};

var info = Object.assign({}, info_default);  // Set info as defaults
var ready_callbacks = [];

// -------------------------------------------------------------------------------- //

function add_callback(callback) {
  ready_callbacks.push(callback);
}

// -------------------------------------------------------------------------------- //

function remove_callback(callback) {
  var index;
  while ((index = ready_callbacks.indexOf(callback)) > -1)
    ready_callbacks.splice(index, 1);  
}

// -------------------------------------------------------------------------------- //

info.onDetect = function(callback) {
  add_callback(callback);
};

// -------------------------------------------------------------------------------- //

info.offDetect = function(callback) {
  remove_callback(callback);
};

// -------------------------------------------------------------------------------- //

function get_bodyColor(model) {
  switch(model) {
    case "pebble_black":  return "black";
    case "pebble_grey":   return "grey";
    case "pebble_white":  return "white";
    case "pebble_red":    return "red";
    case "pebble_orange": return "orange";
    case "pebble_green":  return "green";  // fresh
    case "pebble_pink":   return "pink";   // hot
    case "pebble_blue":   return "blue";   // fly
      
    case "pebble_steel_silver": return "silver";
    case "pebble_steel_black":  return "black";

    case "pebble_time_red":          return "red";
    case "pebble_time_white":        return "white";
    case "pebble_time_black":        return "black";
      
    case "pebble_time_steel_black":  return "black";
    case "pebble_time_steel_silver": return "silver";
    case "pebble_time_steel_gold":   return "gold";

    case "pebble_time_round_silver_14mm":    return "silver";
    case "pebble_time_round_black_14mm":     return "black";
    case "pebble_time_round_rose_gold_14mm": return "rosegold"; // HEX = #B76E79 RGB(183, 110, 121)  http://www.99colors.net/name/rose-gold
    case "pebble_time_round_silver_20mm":    return "silver";
    case "pebble_time_round_black_20mm":     return "black";

    default:
      return null;
  }
}

// -------------------------------------------------------------------------------- //

function get_size(model) {
  switch(model) {
    case "pebble_time_round_silver_14mm":
    case "pebble_time_round_black_14mm":
    case "pebble_time_round_rose_gold_14mm":
      return 14;
    case "pebble_time_round_silver_20mm":
    case "pebble_time_round_black_20mm":
      return 20;
    default:
      return null;
  }
}

// -------------------------------------------------------------------------------- //

// CONSIDER: Get some of this info from Pebble C

function get_details(platform) {
  switch(platform) {
    case "aplite":
      return {
        "detected" : true,
              "bw" : true,
           "color" : false,
           "width" : 144,
          "height" : 168,
           "round" : false,
            "rect" : true,
      "microphone" : false,
         "compass" : true,
      };

    case "basalt":
      return {
        "detected" : true,
              "bw" : false,
           "color" : true,
           "width" : 144,
          "height" : 168,
           "round" : false,
            "rect" : true,
      "microphone" : true,
         "compass" : true,
      };

    case "chalk":
      return {
        "detected" : true,
              "bw" : false,
           "color" : true,
           "width" : 180,
          "height" : 180,
           "round" : true,
            "rect" : false,
      "microphone" : true,
         "compass" : true,
      };

    case "diorite":
      return {
        "detected" : true,
              "bw" : true,
           "color" : false,
           "width" : 144,
          "height" : 168,
           "round" : false,
            "rect" : true,
      "microphone" : true,
         "compass" : false,
      };

    case "emery":
      return {
        "detected" : true,
              "bw" : false,
           "color" : true,
           "width" : 200,
          "height" : 228,
           "round" : false,
            "rect" : true,
      "microphone" : true,
         "compass" : true,
      };

    default:  // default = unknown
      return {
        "detected" : false
      };
  }
}

// -------------------------------------------------------------------------------- //

function get_pebble_info() {
  // Remove callback, since "ready" can fire multiple times
  Pebble.removeEventListener("ready", get_pebble_info);
  
  // Copy defaults into info, resetting old settings
  Object.assign(info, info_default);
  
  // "ready" appmessage has been called
  info.ready = true;

  try {
    // get all properties from ActiveWatchInfo, then copy them into info
    var ActiveWatchInfo = Pebble.getActiveWatchInfo ? Pebble.getActiveWatchInfo() : null;
    if (ActiveWatchInfo) Object.assign(info, ActiveWatchInfo);
    
    // assure lowercase (for comparisons)
    info.platform = info.platform.toLowerCase();
    info.model    = info.model.toLowerCase();

    // copy all additional details into info
    Object.assign(info, get_details(info.platform));

    // test if in emulator
    if(info.model.length>=4 && info.model.slice(0, 4) == "qemu")
      info.emulator = true;

    info.bodyColor = get_bodyColor(info.model);
    info.size      = get_size(info.model);

    info.WatchToken = Pebble.getWatchToken();      // TODO: validate
    info.AccountToken = Pebble.getAccountToken();  // TODO: If no pebble account, may return null
  } catch(e) {
    // There was an error, watch not correctly detected
    info.ready = true;
    info.detected = false;
    try {console.log("watch_info: Error (" + e.message + ")");}catch(e){console.log("watch_info: Error");}
    //console.log("info(err) = " + JSON.stringify(info));
  }

  info.MergeToken = merge_tokens(info.WatchToken, info.AccountToken);
    
  // If detection was successful, call each callback (if any exist)
  if (info.detected)
    for (var index in ready_callbacks)
      if (typeof (ready_callbacks[index]) == "function")
        ready_callbacks[index]();
}

// -------------------------------------------------------------------------------- //

Pebble.addEventListener("ready", get_pebble_info);

// -------------------------------------------------------------------------------- //

module.exports = info;
