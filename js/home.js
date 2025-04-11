document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map - Coordinates centered roughly on Syria
    const map = L.map('map').setView([35.0, 38.0], 6);

    // Optional: Add a base tile layer (e.g., OpenStreetMap)
    // Use Mapbox's satellite-streets style which combines satellite imagery with labels
    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFzYXNkMTIiLCJhIjoiY205ZDZrcW0zMDdkejJrc2F4ZTU0ZWRmNyJ9.lPUX9ceswcGjrjl2e-k3Bg', {
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
        maxZoom: 19
    }).addTo(map);
    
    // Add a scale control to the map
    L.control.scale({
        imperial: false,  // Only show metric scale
        position: 'bottomleft'
    }).addTo(map);
    
    let geojsonLayer;

    // --- Color mapping for governorates (Based on provided image) ---
    const governorateColors = {
        'Aleppo': '#F4A460',          // Sandy Brown / Pinkish
        'Damascus': '#9ACD32',        // YellowGreen (Distinct from Rif Dimashq)
        'Dar`a': '#D2B48C',           // Tan
        'Dayr Az Zawr': '#FFFACD',     // Lemon Chiffon / Pale Yellow
        'Hamah': '#E6E6FA',            // Lavender / Off-white gray
        'Hasaka (Al Haksa)': '#B0C4DE', // Light Steel Blue / Grayish Blue
        'Homs (Hims)': '#FFA07A',        // Light Salmon / Orange-Tan
        'Idlib': '#D8BFD8',            // Thistle / Light Purple-Gray
        'Lattakia': '#AFEEEE',          // Pale Turquoise / Light Blue-Aqua
        'Quneitra': '#D3D3D3',          // Light Gray
        'Ar Raqqah': '#DDA0DD',         // Plum / Lilac
        'Rif Dimashq': '#98FB98',       // Pale Green / Mint
        'As Suwayda': '#8FBC8F',      // Dark Sea Green / Tealish (Corrected quote)
        'Tartus': '#DB7093'            // Pale Violet Red / Purple-Pink
        // Verify these keys exactly match the names in your GeoJSON properties
    };

    // Function to style the governorates
    function style(feature) {
        const properties = feature.properties;
        // Use the exact name from properties as the key for colors
        const nameKey = properties.name || properties.NAME || properties.admin1Name || '';
        const fillColor = governorateColors[nameKey] || '#D3D3D3'; // Use mapped color or default gray

        return {
            fillColor: fillColor,
            weight: 2,
            opacity: 1,
            color: 'white', // Border color
            dashArray: '3',
            fillOpacity: 0.6 // Increased opacity for better visibility on satellite
        };
    }

    // Function to handle hover effects
    function highlightFeature(e) {
        const layer = e.target;
        layer.setStyle({
            weight: 3,
            color: '#ffffff', // White border on hover for better visibility on satellite
            dashArray: '',
            fillOpacity: 0.4 // Higher opacity on hover
        });
        layer.bringToFront();
    }

    function resetHighlight(e) {
        geojsonLayer.resetStyle(e.target);
    }

    // Function to handle clicks and navigation
    function navigateToCity(e) {
        const layer = e.target;
        const properties = layer.feature.properties;
        // Use the exact name for navigation link generation as well
        const engName = properties.name || properties.NAME || properties.admin1Name;

        if (engName) {
            // Convert to lowercase only for the URL, keep original for lookups
            const pageName = engName.toLowerCase().replace(/\s+/g, '-').replace(/\`/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/'/g, ''); // Basic sanitization for URL
            window.location.href = `cities/${pageName}.html`;
        } else {
            console.warn('Clicked feature does not have a recognizable English name property.', properties);
        }
    }

    // Function defining actions for each feature
    function onEachFeature(feature, layer) {
        // --- Translation Map (English to Arabic) ---
        // Add/modify translations as needed, matching the English names from GeoJSON
        const nameTranslations = {
            "Aleppo": "حلب",
            "Damascus": "دمشق",
            "Dar`a": "درعا",
            "Dayr Az Zawr": "دير الزور",
            "Hamah": "حماة",
            "Hasaka (Al Haksa)": "الحسكة",
            "Homs (Hims)": "حمص",
            "Idlib": "إدلب",
            "Lattakia": "اللاذقية",
            "Quneitra": "القنيطرة",
            "Ar Raqqah": "الرقة",
            "Rif Dimashq": "ريف دمشق",
            "As Suwayda": "السويداء",
            "Tartus": "طرطوس"
        };

        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: navigateToCity
        });

        // --- Tooltip using the translation map ---
        const properties = feature.properties;
        const englishName = properties.name || properties.NAME || properties.admin1Name; // Get the English name
        const arabicName = englishName ? nameTranslations[englishName] : undefined; // Look up translation

        const displayName = arabicName || englishName || 'منطقة غير معروفة'; // Use translated Arabic, fallback to English, then generic text

        // Create tooltip for hover effect
        layer.bindTooltip(displayName, { sticky: true });
        
        // Add permanent label over the center of each governorate
        if (layer.getBounds) {
            const center = layer.getBounds().getCenter();
            
            // Adjust font size based on the area size
            const bounds = layer.getBounds();
            const area = (bounds.getNorth() - bounds.getSouth()) * (bounds.getEast() - bounds.getWest());
            
            // Scale font size based on area for desktop and mobile
            let fontSize = 12;
            
            if (window.innerWidth <= 768) { // Mobile view
                fontSize = Math.max(8, Math.min(12, 12 + area * 500));
            } else { // Desktop/laptop view
                fontSize = Math.max(16, Math.min(22, 16 + area * 500));
            }
            
            // Create a div icon with the Arabic governorate name
            const icon = L.divIcon({
                className: 'governorate-label',
                html: `<div style="font-weight: bold; font-size: ${fontSize}px; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0px 0px 4px rgba(255,255,255,0.9); color: #000;">${displayName}</div>`,
                iconSize: [150, 40],
                iconAnchor: [75, 20]
            });
            
            // Add the label marker to the map
            L.marker(center, { 
                icon: icon, 
                interactive: false,
                zIndexOffset: 1000 // Ensure labels are on top
            }).addTo(map);
        }
    }

    // Fetch GeoJSON data and add it to the map
    fetch('syria-governorates.geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            geojsonLayer = L.geoJSON(data, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);

            // --- Focus map on Syria ---
            // 1. Get the bounds of the loaded governorates layer
            const bounds = geojsonLayer.getBounds();

            // 2. Fit the map view to these bounds initially
            map.fitBounds(bounds);

            // 3. Set the minimum zoom level to prevent zooming out too much
            //    (Use the zoom level determined by fitBounds as the minimum)
            map.setMinZoom(map.getZoom());

            // 4. Restrict panning outside the bounds (with a little padding)
            //    Adjust padding (e.g., 0.1) as needed
            map.setMaxBounds(bounds.pad(0.1));

        })
        .catch(error => {
            console.error('Error loading or parsing GeoJSON:', error);
            // Display error message to the user
            const mapDiv = document.getElementById('map');
            mapDiv.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Could not load map data. Please check the GeoJSON file or network connection.</p>';
            mapDiv.style.height = 'auto'; // Adjust height if map fails
        });
});