(function() {
  var GrafMap, grafmap, onFBConnected,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.fbAsyncInit = function() {
    FB.init({
      appId: "1418352478394130",
      channelUrl: "//connect.facebook.net/en_US/all.js",
      status: true,
      cookie: true,
      xfbml: true
    });
    return FB.Event.subscribe("auth.authResponseChange", function(response) {
      if (response.status === "connected") {
        return onFBConnected();
      } else if (response.status === "not_authorized") {
        return FB.login();
      } else {
        return FB.login();
      }
    });
  };

  (function(d) {
    var id, js, ref;
    js = void 0;
    id = "facebook-jssdk";
    ref = d.getElementsByTagName("script")[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement("script");
    js.id = id;
    js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    return ref.parentNode.insertBefore(js, ref);
  })(document);

  GrafMap = (function() {
    GrafMap.prototype.found = false;

    GrafMap.prototype.coords = null;

    GrafMap.prototype.access_token = null;

    GrafMap.prototype.map = null;

    function GrafMap() {
      this.getNearbyPlaces = __bind(this.getNearbyPlaces, this);
      this.addNearbyPlace = __bind(this.addNearbyPlace, this);
      this.navigatorSuccess = __bind(this.navigatorSuccess, this);
      Messenger().post({
        message: 'Finding your location...',
        id: 'alerter',
        type: 'info'
      });
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.navigatorSuccess, this.navigatorError);
      } else {
        Messenger().post({
          message: "Oops, your browser doesn't support geo-location.",
          id: 'alerter',
          type: 'error'
        });
      }
    }

    GrafMap.prototype.navigatorSuccess = function(position) {
      var latlng, marker, myOptions;
      Messenger().post({
        message: 'We found you!',
        id: 'alerter',
        type: 'success',
        showCloseButton: true
      });
      this.coords = position.coords;
      latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      myOptions = {
        zoom: 17,
        center: latlng,
        mapTypeControl: false,
        navigationControlOptions: {
          style: google.maps.NavigationControlStyle.SMALL
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      this.map = new google.maps.Map(document.getElementById("map"), myOptions);
      marker = new google.maps.Marker({
        position: latlng,
        map: this.map,
        title: "You are here! (at least within a " + position.coords.accuracy + " meter radius)",
        animation: google.maps.Animation.DROP
      });
      this.found = true;
      if (this.access_token) {
        return this.getNearbyPlaces();
      }
    };

    GrafMap.prototype.navigatorError = function(msg) {
      return Messenger().post({
        message: 'Error trying to find your location...',
        id: 'alerter',
        type: 'error'
      });
    };

    GrafMap.prototype.addNearbyPlace = function(place) {
      var contentHtmlString, infowindow, latlng, marker, tempalteSource, template;
      console.log(place);
      tempalteSource = $("#info-window-template").html();
      template = Handlebars.compile(tempalteSource);
      contentHtmlString = template(place);
      latlng = new google.maps.LatLng(place.location.latitude, place.location.longitude);
      marker = new google.maps.Marker({
        position: latlng,
        map: this.map,
        icon: {
          path: fontawesome.markers.STAR_EMPTY,
          scale: 0.5,
          strokeWeight: 0.2,
          strokeColor: 'black',
          strokeOpacity: 1,
          fillColor: '#D8432E',
          fillOpacity: 0.8
        },
        animation: google.maps.Animation.DROP
      });
      infowindow = new google.maps.InfoWindow({
        content: contentHtmlString
      });
      return google.maps.event.addListener(marker, "click", function() {
        return infowindow.open(this.map, marker);
      });
    };

    GrafMap.prototype.getNearbyPlaces = function() {
      var _this = this;
      console.log('Getting nearby places...');
      return $.get("https://graph.facebook.com/search", {
        type: 'place',
        fields: 'category,picture,name,can_post,phone,description,location,link',
        center: "" + this.coords.latitude + "," + this.coords.longitude,
        distance: 500,
        limit: 30,
        offset: 0,
        access_token: this.access_token
      }, function(data) {
        var place, _i, _len, _ref, _results;
        console.log(data);
        _ref = data.data;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          place = _ref[_i];
          _results.push(_this.addNearbyPlace(place));
        }
        return _results;
      });
    };

    return GrafMap;

  })();

  grafmap = null;

  $(function() {
    return grafmap = new GrafMap;
  });

  $(window).resize(function() {
    var h;
    h = $(window).height();
    return $("#map").css("height", h);
  }).resize();

  onFBConnected = function() {
    console.log("Welcome!  Fetching your information.... ");
    grafmap.access_token = FB.getAuthResponse()['accessToken'];
    if (grafmap.found) {
      grafmap.getNearbyPlaces();
    }
    return FB.api("/me", function(response) {
      return console.log("Good to see you, " + response.name + ".");
    });
  };

  String.prototype.truncate = function(n) {
    return this.substr(0, n - 1) + (this.length > n ? "..." : "");
  };

  Handlebars.registerHelper("truncate", function(str, len) {
    if (str != null) {
      return str.truncate(len);
    } else {
      return '';
    }
  });

  Messenger.options = {
    extraClasses: "messenger-fixed messenger-on-top",
    theme: "future"
  };

}).call(this);

/*
//@ sourceMappingURL=main.js.map
*/