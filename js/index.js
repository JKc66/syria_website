document.addEventListener('DOMContentLoaded', function () {
    // Always hide the transition overlay and clear mini-map on page load (including back/forward navigation)
    const pageTransition = document.getElementById('pageTransition');
    if (pageTransition) {
        pageTransition.classList.remove('active');
    }
    const transitionMap = document.getElementById('transitionMap');
    if (transitionMap) {
        transitionMap.innerHTML = '';
    }
});

// Also handle bfcache restores (back/forward navigation)
window.addEventListener('pageshow', function () {
    const pageTransition = document.getElementById('pageTransition');
    if (pageTransition) {
        pageTransition.classList.remove('active');
    }
    const transitionMap = document.getElementById('transitionMap');
    if (transitionMap) {
        transitionMap.innerHTML = '';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map with a more specific center point for Syria
    const map = L.map('map', {
        center: [35.0, 38.5], // Adjusted center coordinates
        zoom: 7,
        minZoom: 6.5,
        maxZoom: 10,
        attributionControl: true,
        zoomControl: true
    });

    // Use Mapbox's satellite-streets style with explicit retina parameter
    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoiamFzYXNkMTIiLCJhIjoiY205ZDZrcW0zMDdkejJrc2F4ZTU0ZWRmNyJ9.lPUX9ceswcGjrjl2e-k3Bg', {
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
        maxZoom: 19,
        tileSize: 512,
        zoomOffset: -1,
        detectRetina: true
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
        'Damascus': '#9ACD32',        // YellowGreen (Distinct from Rif_Dimashq)
        'Daraa': '#D2B48C',           // Tan
        'Dayr_Az_Zawr': '#FFFACD',     // Lemon Chiffon / Pale Yellow
        'Hamah': '#E6E6FA',            // Lavender / Off-white gray
        'Hasaka': '#B0C4DE', // Light Steel Blue / Grayish Blue
        'Homs': '#FFA07A',        // Light Salmon / Orange-Tan
        'Idlib': '#D8BFD8',            // Thistle / Light Purple-Gray
        'Lattakia': '#AFEEEE',          // Pale Turquoise / Light Blue-Aqua
        'Quneitra': '#D3D3D3',          // Light Gray
        'Ar_Raqqah': '#DDA0DD',         // Plum / Lilac
        'Rif_Dimashq': '#98FB98',       // Pale Green / Mint
        'As_Suwayda': '#8FBC8F',      // Dark Sea Green / Tealish (Corrected quote)
        'Tartus': '#DB7093'            // Pale Violet Red / Purple-Pink
        // Verify these keys exactly match the names in your GeoJSON properties
    };

    // Function to style the governorates
    function style(feature) {
        const properties = feature.properties;
        const nameKey = properties.name || properties.NAME || properties.admin1Name || '';
        const fillColor = governorateColors[nameKey] || '#D3D3D3';

        return {
            fillColor: fillColor,
            weight: 1.5,
            opacity: 1,
            color: '#fff',
            fillOpacity: 0.7,
            className: 'governorate-path'
        };
    }

    // Function to handle hover effects
    function highlightFeature(e) {
        const layer = e.target;
        const isTouchDevice = 'ontouchstart' in window;
        
        layer.setStyle({
            weight: isTouchDevice ? 3 : 2.5,
            color: '#FFD700',
            fillOpacity: 0.8,
            className: 'governorate-path-active'
        });
        
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    function resetHighlight(e) {
        const layer = e.target;
        geojsonLayer.resetStyle(layer);
        layer._path.classList.remove('governorate-path-active');
    }

    // Function to handle clicks and navigation
    function navigateToCity(e) {
        const layer = e.target;
        const properties = layer.feature.properties;
        const engName = properties.name || properties.NAME || properties.admin1Name;

        // Add visual feedback before navigation
        layer.setStyle({
            weight: 3,
            color: '#FFD700',
            fillOpacity: 0.9,
            className: 'governorate-path-clicked'
        });

        if (engName) {
            // Fix: Keep first letter capital, rest lowercase to match actual filenames
            const pageName = engName.charAt(0).toUpperCase() + engName.slice(1).toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[\`\(\)']/g, '')
                .replace(/_/g, '_'); // Preserve underscores
            
            // Get the Arabic name from the translation map
            const nameTranslations = {
                "Aleppo": "حلب",
                "Damascus": "دمشق",
                "Daraa": "درعا",
                "Dayr_Az_Zawr": "دير الزور",
                "Hamah": "حماة",
                "Hasaka": "الحسكة",
                "Homs": "حمص",
                "Idlib": "إدلب",
                "Lattakia": "اللاذقية",
                "Quneitra": "القنيطرة",
                "Ar_Raqqah": "الرقة",
                "Rif_Dimashq": "ريف دمشق",
                "As_Suwayda": "السويداء",
                "Tartus": "طرطوس"
            };
            
            const arabicName = nameTranslations[engName] || engName;
            
            // Create a transition effect
            const pageTransition = document.getElementById('pageTransition');
            const transitionTitle = document.getElementById('transitionTitle');
            const transitionSubtitle = document.getElementById('transitionSubtitle');
            const transitionMap = document.getElementById('transitionMap');
            
            // Set the content for the transition
            transitionTitle.textContent = arabicName;
            transitionSubtitle.textContent = "جاري الانتقال إلى صفحة المدينة...";
            
            // Create a mini map in the transition focused on the selected governorate
            const miniMap = L.map(transitionMap, {
                center: layer.getBounds().getCenter(),
                zoom: 8,
                zoomControl: false,
                attributionControl: false,
                dragging: false,
                touchZoom: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: false
            });
            
            // Add the tile layer to the mini map
            L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoiamFzYXNkMTIiLCJhIjoiY205ZDZrcW0zMDdkejJrc2F4ZTU0ZWRmNyJ9.lPUX9ceswcGjrjl2e-k3Bg', {
                maxZoom: 19,
                tileSize: 512,
                zoomOffset: -1
            }).addTo(miniMap);
            
            // Add the selected governorate to the mini map with a highlight style
            const selectedGeoJSON = L.geoJSON(layer.feature, {
                style: {
                    fillColor: governorateColors[engName] || '#F4A460',
                    weight: 2,
                    color: '#FFD700',
                    fillOpacity: 0.8
                }
            }).addTo(miniMap);
            
            // Fit the mini map to the governorate bounds with padding
            miniMap.fitBounds(selectedGeoJSON.getBounds().pad(0.1));
            
            // Show the transition
            pageTransition.classList.add('active');
            
            // Navigate after a delay
            setTimeout(() => {
                window.location.href = `cities/${pageName}.html`;
            }, 1500);
        }
    }

    // Function defining actions for each feature
    function onEachFeature(feature, layer) {
        // --- Translation Map (English to Arabic) ---
        // Add/modify translations as needed, matching the English names from GeoJSON
        const nameTranslations = {
            "Aleppo": "حلب",
            "Damascus": "دمشق",
            "Daraa": "درعا",
            "Dayr_Az_Zawr": "دير الزور",
            "Hamah": "حماة",
            "Hasaka": "الحسكة",
            "Homs": "حمص",
            "Idlib": "إدلب",
            "Lattakia": "اللاذقية",
            "Quneitra": "القنيطرة",
            "Ar_Raqqah": "الرقة",
            "Rif_Dimashq": "ريف دمشق",
            "As_Suwayda": "السويداء",
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
            
            // Standardized font sizing that works across environments
            let fontSize;
            
            if (window.innerWidth <= 768) { // Mobile view
                fontSize = Math.max(9, Math.min(14, 11 + Math.sqrt(area) * 10));
            } else { // Desktop/laptop view
                fontSize = Math.max(14, Math.min(22, 16 + Math.sqrt(area) * 10));
            }
            
            // Create a div icon with the Arabic governorate name - adding important to styles
            const icon = L.divIcon({
                className: 'governorate-label',
                html: `<div style="font-weight: bold !important; font-size: ${fontSize}px !important; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0px 0px 4px rgba(255,255,255,0.9) !important; color: #000 !important;">${displayName}</div>`,
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

            // Wait a moment for rendering and then adjust the view
            setTimeout(() => {
                // Get the bounds of the loaded governorates layer
                const bounds = geojsonLayer.getBounds();
                
                // Add a bit more padding to ensure everything is visible
                map.fitBounds(bounds.pad(0.1));
                
                // Force a refresh of the map
                map.invalidateSize();
            }, 300);
        })
        .catch(error => {
            console.error('Error loading or parsing GeoJSON:', error);
            // Display error message to the user
            const mapDiv = document.getElementById('map');
            mapDiv.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Could not load map data. Please check the GeoJSON file or network connection.</p>';
            mapDiv.style.height = 'auto'; // Adjust height if map fails
        });
});