class GrafMap

  found: false
  coords: null
  access_token: null
  map: null

  constructor: () ->

    Messenger().post
      message: 'Finding your location...'
      id: 'alerter'
      type: 'info'

    if navigator.geolocation 
      navigator.geolocation.getCurrentPosition @navigatorSuccess, @navigatorError
    else
      Messenger().post
        message: "Oops, your browser doesn't support geo-location."
        id: 'alerter'
        type: 'error'

  navigatorSuccess:(position) =>

    Messenger().post
      message: 'We found you!'
      id: 'alerter'
      type: 'success'
      showCloseButton: true

    @coords = position.coords

    latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
    myOptions =
      zoom: 15
      center: latlng
      mapTypeControl: false
      navigationControlOptions:
        style: google.maps.NavigationControlStyle.SMALL

      mapTypeId: google.maps.MapTypeId.ROADMAP

    @map = new google.maps.Map(document.getElementById("map"), myOptions)
    marker = new google.maps.Marker(
      position: latlng
      map: @map
      title: "You are here! (at least within a " + position.coords.accuracy + " meter radius)"
      animation: google.maps.Animation.DROP
    )

    @found = true
    @getNearbyPlaces() if @access_token

  navigatorError: (msg) ->
    Messenger().post
      message: 'Error trying to find your location...'
      id: 'alerter'
      type: 'error'

  addNearbyPlace: (place) =>
    console.log place

    tempalteSource = $("#info-window-template").html()
    template = Handlebars.compile(tempalteSource)
    contentHtmlString = template(place)

    latlng = new google.maps.LatLng(place.location.latitude, place.location.longitude)    
    marker = new google.maps.Marker(
      position: latlng
      map: @map
      icon:
        path: fontawesome.markers.STAR_EMPTY
        scale: 0.5
        strokeWeight: 0.2
        strokeColor: 'black'
        strokeOpacity: 1
        fillColor: '#D8432E'
        fillOpacity: 0.8
      animation: google.maps.Animation.DROP
    )
    # Create info window
    infowindow = new google.maps.InfoWindow(content: contentHtmlString)
    google.maps.event.addListener marker, "click", ->
      infowindow.open @map, marker



  getNearbyPlaces: () =>
    console.log 'Getting nearby places...'
    $.get "https://graph.facebook.com/search",
      type: 'place'
      fields: 'category,picture,name,can_post,phone,description,location,link'
      center: "#{@coords.latitude},#{@coords.longitude}"
      distance: 150
      limit: 25
      offset: 0
      access_token: @access_token
    , (data) =>
      console.log data
      @addNearbyPlace place for place in data.data
