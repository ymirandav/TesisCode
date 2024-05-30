let map;
let directionsService;
let directionsRenderer;
let originMarker;
let destinationMarker;
let originStopMarker;
let destinationStopMarker;
let stopsRuta1 = [];
let stopsRuta2 = [];

function initMap() {
    var mapOptions = {
        zoom: 12,
        center: {lat: -16.394142, lng: -71.575583}
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
    });

    map.addListener('click', function(event) {
        placeMarker(event.latLng);
    });

    loadStops();
}

function loadStops() {
    fetch('http://localhost:3000/api/stops/1')
        .then(response => response.json())
        .then(data => {
            stopsRuta1 = data.map(stop => ({
                lat: stop.latitud,
                lng: stop.longitud,
                name: stop.nombre
            }));
        })
        .catch(error => console.error('Error loading stops for route 1:', error));

    fetch('http://localhost:3000/api/stops/2')
        .then(response => response.json())
        .then(data => {
            stopsRuta2 = data.map(stop => ({
                lat: stop.latitud,
                lng: stop.longitud,
                name: stop.nombre
            }));
        })
        .catch(error => console.error('Error loading stops for route 2:', error));
}

function placeMarker(location) {
    if (!originMarker) {
        originMarker = new google.maps.Marker({
            position: location,
            map: map,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });
    } else if (!destinationMarker) {
        destinationMarker = new google.maps.Marker({
            position: location,
            map: map,
            icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
        });
    } else {
        originMarker.setMap(null);
        destinationMarker.setMap(null);
        originMarker = new google.maps.Marker({
            position: location,
            map: map,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });
        destinationMarker = null;
    }
}

function findClosestStop(location, stops) {
    let closestStop = null;
    let closestDistance = Infinity;

    stops.forEach(stop => {
        let stopLocation = new google.maps.LatLng(stop.lat, stop.lng);
        let distance = google.maps.geometry.spherical.computeDistanceBetween(location, stopLocation);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestStop = stop;
        }
    });

    return closestStop;
}

function findBestRoute(origin, destination) {
    let originClosestRuta1 = findClosestStop(origin, stopsRuta1);
    let destinationClosestRuta1 = findClosestStop(destination, stopsRuta1);

    let originClosestRuta2 = findClosestStop(origin, stopsRuta2);
    let destinationClosestRuta2 = findClosestStop(destination, stopsRuta2);

    // Calcular distancias totales para cada ruta
    let distanceToOriginRuta1 = google.maps.geometry.spherical.computeDistanceBetween(origin, new google.maps.LatLng(originClosestRuta1.lat, originClosestRuta1.lng));
    let distanceToDestinationRuta1 = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(destinationClosestRuta1.lat, destinationClosestRuta1.lng), destination);

    let distanceToOriginRuta2 = google.maps.geometry.spherical.computeDistanceBetween(origin, new google.maps.LatLng(originClosestRuta2.lat, originClosestRuta2.lng));
    let distanceToDestinationRuta2 = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(destinationClosestRuta2.lat, destinationClosestRuta2.lng), destination);

    let totalDistanceRuta1 = distanceToOriginRuta1 + distanceToDestinationRuta1;
    let totalDistanceRuta2 = distanceToOriginRuta2 + distanceToDestinationRuta2;

    if (totalDistanceRuta1 <= totalDistanceRuta2) {
        return { ruta: "MegaBus Tiabaya A", originStop: originClosestRuta1, destinationStop: destinationClosestRuta1 };
    } else {
        return { ruta: "COTUM B", originStop: originClosestRuta2, destinationStop: destinationClosestRuta2 };
    }
}

function drawDashedLine(startPosition, endPosition, color, iconPattern = '20px') {
    const linePath = new google.maps.Polyline({
        path: [startPosition, endPosition],
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1,
        icons: iconPattern === '0' ? [] : [{
            icon: {
                path: 'M 0,-1 0,1',
                strokeOpacity: 1,
                scale: 4
            },
            offset: '0',
            repeat: iconPattern
        }],
        map: map
    });
    return linePath;
}


function handleRouteRequest() {
    if (!originMarker || !destinationMarker) {
        alert('Por favor seleccione el origen y destino haciendo clic en el mapa.');
        return;
    }

    let originLocation = originMarker.getPosition();
    let destinationLocation = destinationMarker.getPosition();
    let bestRoute = findBestRoute(originLocation, destinationLocation);

    document.getElementById('routeName').innerText = 'Ruta sugerida: ' + bestRoute.ruta;
    document.getElementById('originStop').innerText = 'Paradero más cercano al origen: ' + bestRoute.originStop.name;
    document.getElementById('destinationStop').innerText = 'Paradero más cercano al destino: ' + bestRoute.destinationStop.name;

    let busImageUrl;
    if (bestRoute.ruta === "MegaBus Tiabaya A") {
        busImageUrl = 'Images/MegaBus.png';
    } else {
        busImageUrl = 'Images/COTUM.png';
    }
    document.getElementById('busImage').src = busImageUrl;
    document.getElementById('busImage').style.display = 'block';

    if (originStopMarker) {
        originStopMarker.setMap(null);
    }
    originStopMarker = new google.maps.Marker({
        position: new google.maps.LatLng(bestRoute.originStop.lat, bestRoute.originStop.lng),
        map: map,
        title: 'Paradero más cercano al origen',
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    });
    drawDashedLine(originMarker.getPosition(), originStopMarker.getPosition(), '#FF0000');

    if (destinationStopMarker) {
        destinationStopMarker.setMap(null);
    }
    destinationStopMarker = new google.maps.Marker({
        position: new google.maps.LatLng(bestRoute.destinationStop.lat, bestRoute.destinationStop.lng),
        map: map,
        title: 'Paradero más cercano al destino',
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });
    drawDashedLine(destinationMarker.getPosition(), destinationStopMarker.getPosition(), '#FF0000');

    drawDashedLine(new google.maps.LatLng(bestRoute.originStop.lat, bestRoute.originStop.lng),
                new google.maps.LatLng(bestRoute.destinationStop.lat, bestRoute.destinationStop.lng),
                    '#00FF00', '0');
}

document.getElementById('saveFavoriteBtn').addEventListener('click', saveFavoriteRoute);

function saveFavoriteRoute() {
    console.log("Botón 'Guardar Ruta Favorita' presionado");

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Por favor, inicia sesión para guardar la ruta.');
        window.location.href = 'login.html'; // Redirigir a la página de inicio de sesión
        return;
    }

    const routeNameElement = document.getElementById('routeName');
    const originStopElement = document.getElementById('originStop');
    const destinationStopElement = document.getElementById('destinationStop');

    if (!routeNameElement || !originStopElement || !destinationStopElement) {
        console.error("No se encontraron los elementos HTML necesarios");
        alert('Error: No se encontraron los elementos necesarios para guardar la ruta.');
        return;
    }

    const routeName = routeNameElement.innerText.split(': ')[1];
    const originStop = originStopElement.innerText.split(': ')[1];
    const destinationStop = destinationStopElement.innerText.split(': ')[1];

    console.log("Route Name:", routeName);
    console.log("Origin Stop:", originStop);
    console.log("Destination Stop:", destinationStop);

    const price = 1.00; // Precio fijo o calculado

    fetch('http://localhost:3000/api/history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Asegúrate de incluir "Bearer"
        },
        body: JSON.stringify({ origen: originStop, destino: destinationStop, precio: price })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al guardar la ruta');
        }
        return response.json();
    })
    .then(data => {
        console.log("Ruta guardada exitosamente:", data);
        alert('Ruta guardada en favoritos.');
    })
    .catch(error => {
        console.error('Error al guardar la ruta:', error);
        alert('Error al guardar la ruta.');
    });
}
