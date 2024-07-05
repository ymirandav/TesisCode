let map;
let directionsRenderers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: -16.394142, lng: -71.575583}
    });
    loadRoutes();
}

function loadRoutes() {
    fetch('http://localhost:3000/api/routes')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(rutas => {
            const selector = document.getElementById('routeSelector');
            rutas.forEach(ruta => {
                const option = document.createElement('option');
                option.value = ruta.ruta_id;
                option.textContent = ruta.nombre;
                selector.appendChild(option);
            });
            if (rutas.length === 0) {
                console.log('No routes found');
            }
        })
        .catch(error => console.error('Error loading routes:', error));
}
const routeImages = {
    '1': 'Images/MegaBus.png',
    '2': 'Images/COTUM.png',

};

function updateRouteImage(routeId) {
    const imageUrl = routeImages[routeId];
    const routeImageElement = document.getElementById('routeImage');
    if (imageUrl) {
        routeImageElement.src = imageUrl;
        routeImageElement.style.display = 'block';
    } else {
        routeImageElement.style.display = 'none';
    }
}

function loadRoute() {
    let routeKey = document.getElementById('routeSelector').value;
    let displayOption = document.querySelector('input[name="displayOption"]:checked').value;

    if (routeKey && displayOption) {
        let url = `http://localhost:3000/api/stops/${routeKey}/${displayOption}`;

        fetch(url)
            .then(response => response.json())
            .then(stops => {
                if (stops.length > 0) {
                    map.setCenter({ lat: stops[0].latitud, lng: stops[0].longitud });
                    clearRoutes();
                    calculateAndDisplayRoute(map, stops, displayOption === 'ida' ? 'green' : 'red');
                    updateRouteInfo(stops, displayOption);
                    updateRouteImage(routeKey);
                    document.getElementById('infoTable').style.display = 'block';
                    adjustVisibility(displayOption);
                } else {
                    console.log('No stops found for this route');
                }
            })
            .catch(error => console.error('Error loading the route:', error));
    } else {
        console.log('No route selected or direction not specified');
    }
}

function adjustVisibility(displayOption) {
    document.getElementById('idaColumn').style.display = displayOption === 'ida' ? '' : 'none';
    document.getElementById('idaInfo').style.display = displayOption === 'ida' ? '' : 'none';
    document.getElementById('vueltaColumn').style.display = displayOption === 'vuelta' ? '' : 'none';
    document.getElementById('vueltaInfo').style.display = displayOption === 'vuelta' ? '' : 'none';
}

function updateRouteInfo(stops, direction) {
    const idaInfo = document.getElementById('idaInfo');
    const vueltaInfo = document.getElementById('vueltaInfo');

    if (direction === 'ida') {
        idaInfo.textContent = `${stops[0].nombre} - ${stops[stops.length - 1].nombre}`;
        vueltaInfo.textContent = '-';
    } else {
        vueltaInfo.textContent = `${stops[0].nombre} - ${stops[stops.length - 1].nombre}`;
        idaInfo.textContent = '-';
    }
}
function clearRoutes() {
    for (let renderer of directionsRenderers) {
        renderer.setMap(null);
    }
    directionsRenderers = [];
}

function calculateAndDisplayRoute(map, stops, color) {
    const directionsService = new google.maps.DirectionsService();
    const MAX_WAYPOINTS = 22;
    const chunks = [];

    for (let i = 0; i < stops.length; i += MAX_WAYPOINTS) {
        chunks.push(stops.slice(i, Math.min(i + MAX_WAYPOINTS + 1, stops.length)));
    }

    chunks.forEach((chunk, index) => {
        const waypoints = chunk.slice(1, chunk.length - 1).map(stop => ({
            location: new google.maps.LatLng(stop.latitud, stop.longitud),
            stopover: true
        }));

        const origin = new google.maps.LatLng(chunk[0].latitud, chunk[0].longitud);
        const destination = new google.maps.LatLng(chunk[chunk.length - 1].latitud, chunk[chunk.length - 1].longitud);

        const request = {
            origin: origin,
            destination: destination,
            waypoints: waypoints,
            travelMode: 'DRIVING'
        };

        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: color,
                strokeOpacity: 0.6,
                strokeWeight: 5
            }
        });

        directionsRenderers.push(directionsRenderer);

        directionsService.route(request, function(response, status) {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
            } else {
                console.error('Directions request failed due to ' + status);
            }
        });
    });
}