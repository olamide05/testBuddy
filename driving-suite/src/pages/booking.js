import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle, Autocomplete } from '@react-google-maps/api';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Alert, Paper, Divider,
  List, ListItem, ListItemText, ListItemIcon, IconButton, Tabs, Tab
} from '@mui/material';
import {
  LocationOn, Phone, Schedule, TrendingUp, DirectionsCar, Star,
  Navigation, CheckCircle, Warning, Info, Search, MyLocation
} from '@mui/icons-material';

const CENTRES_DATA = [
  {
    id: 1,
    name: 'Tallaght',
    address: 'Airton Road, Tallaght, Dublin 24',
    lat: 53.2876,
    lng: -6.3730,
    waitWeeks: 24,
    passRate: 49.3,
    slotsPerWeek: 65,
    difficulty: 'High',
    phone: '01 602 7700',
    commonFails: ['Roundabout observation', 'Mirror checks', 'Speed control N81'],
    tips: 'Very busy centre. Book early morning slots for less traffic.',
    color: '#ef4444'
  },
  {
    id: 2,
    name: 'Rathgar',
    address: 'Orwell Road, Rathgar, Dublin 6',
    lat: 53.3140,
    lng: -6.2690,
    waitWeeks: 18,
    passRate: 54.1,
    slotsPerWeek: 55,
    difficulty: 'Medium',
    phone: '01 602 7700',
    commonFails: ['Reverse parking', 'Narrow streets', 'Cyclist awareness'],
    tips: 'Lots of cyclists and narrow Victorian streets.',
    color: '#f59e0b'
  },
  {
    id: 3,
    name: 'Cork',
    address: 'Blackash Road, Cork',
    lat: 51.8985,
    lng: -8.4756,
    waitWeeks: 14,
    passRate: 52.2,
    slotsPerWeek: 70,
    difficulty: 'Medium',
    phone: '021 431 2444',
    commonFails: ['Junction positioning', 'Gear control', 'Observation'],
    tips: 'Hilly terrain - practice hill starts.',
    color: '#f59e0b'
  },
  {
    id: 4,
    name: 'Wilton',
    address: 'Sarsfield Road, Wilton, Cork',
    lat: 51.8822,
    lng: -8.5051,
    waitWeeks: 12,
    passRate: 56.7,
    slotsPerWeek: 60,
    difficulty: 'Low',
    phone: '021 434 5677',
    commonFails: ['Speed management', 'Signaling', 'Manoeuvres'],
    tips: 'More suburban, less traffic. Good pass rates.',
    color: '#10b981'
  },
  {
    id: 5,
    name: 'Galway',
    address: 'Doughiska, Merlin Park, Galway',
    lat: 53.2889,
    lng: -8.9933,
    waitWeeks: 16,
    passRate: 51.8,
    slotsPerWeek: 50,
    difficulty: 'Medium',
    phone: '091 751 666',
    commonFails: ['Roundabout approach', 'Road positioning', 'Speed control'],
    tips: 'Wind can be a factor. Multiple roundabouts.',
    color: '#f59e0b'
  },
  {
    id: 6,
    name: 'Cavan',
    address: 'Dublin Road, Cavan',
    lat: 53.9908,
    lng: -7.3604,
    waitWeeks: 10,
    passRate: 58.2,
    slotsPerWeek: 35,
    difficulty: 'Low',
    phone: '049 436 1200',
    commonFails: ['Rural junctions', 'Speed adjustment', 'Observation'],
    tips: 'Highest pass rate! Less traffic.',
    color: '#10b981'
  }
];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 53.4129,
  lng: -8.2439
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true
};

// IMPORTANT: Add 'places' library
const libraries = ['places'];

export default function TestCentresPage() {
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [activeTab, setActiveTab] = useState(0);
  const [autocomplete, setAutocomplete] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries // Add this!
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle autocomplete load
  const onAutocompleteLoad = (autocompleteObj) => {
    setAutocomplete(autocompleteObj);
  };

  // Handle place selection from autocomplete
  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const pos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        setUserLocation(pos);
        setUserAddress(place.formatted_address || place.name);
        setSearchInput(place.formatted_address || place.name);
        
        if (map) {
          map.panTo(pos);
          map.setZoom(12);
        }
      } else {
        alert('No location details available for this address');
      }
    }
  };

  // Get user's current location via GPS
  const handleGetMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(pos);
          setUserAddress('Your current location');
          setSearchInput('');
          
          if (map) {
            map.panTo(pos);
            map.setZoom(12);
          }
        },
        () => {
          alert('Could not get your location. Please enter your address manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Sort centres by selected criteria
  const getSortedCentres = () => {
    let sorted = [...CENTRES_DATA];
    
    if (sortBy === 'distance' && userLocation) {
      sorted = sorted.map(c => ({
        ...c,
        distance: calculateDistance(userLocation.lat, userLocation.lng, c.lat, c.lng)
      })).sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'passRate') {
      sorted.sort((a, b) => b.passRate - a.passRate);
    } else if (sortBy === 'waitTime') {
      sorted.sort((a, b) => a.waitWeeks - b.waitWeeks);
    }
    
    return sorted;
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Low') return 'success';
    if (difficulty === 'Medium') return 'warning';
    return 'error';
  };

  const CentreCard = ({ centre }) => {
    const distance = userLocation 
      ? calculateDistance(userLocation.lat, userLocation.lng, centre.lat, centre.lng)
      : null;

    return (
      <Card sx={{ mb: 2, '&:hover': { boxShadow: 6 } }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Box>
              <Typography variant="h6">{centre.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {centre.address}
              </Typography>
            </Box>
            {distance && (
              <Chip 
                label={`${distance.toFixed(1)} km`} 
                color="primary" 
                icon={<Navigation />}
              />
            )}
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} md={3}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f9fafb', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Wait Time</Typography>
                <Typography variant="h6" color={centre.waitWeeks < 15 ? 'success.main' : 'error.main'}>
                  {centre.waitWeeks}w
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f9fafb', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Pass Rate</Typography>
                <Typography variant="h6" color={centre.passRate >= 55 ? 'success.main' : 'warning.main'}>
                  {centre.passRate}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f9fafb', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Difficulty</Typography>
                <Chip 
                  label={centre.difficulty} 
                  color={getDifficultyColor(centre.difficulty)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f9fafb', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Slots/Week</Typography>
                <Typography variant="h6">{centre.slotsPerWeek}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setSelectedCentre(centre);
                if (map) {
                  map.panTo({ lat: centre.lat, lng: centre.lng });
                  map.setZoom(14);
                }
                setActiveTab(0);
              }}
            >
              View on Map
            </Button>
            <Button
              variant="outlined"
              size="small"
              href={`tel:${centre.phone}`}
              startIcon={<Phone />}
            >
              Call
            </Button>
            <Button
              variant="outlined"
              size="small"
              href={userLocation 
                ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${centre.lat},${centre.lng}`
                : `https://www.google.com/maps/dir/?api=1&destination=${centre.lat},${centre.lng}`
              }
              target="_blank"
              startIcon={<DirectionsCar />}
            >
              Directions
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Typography>Loading map...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        🗺️ Find Test Centres
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Compare centres, check wait times, and find the best option for you
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Map View" />
        <Tab label="List View" />
        <Tab label="Compare" />
      </Tabs>

      {/* TAB 1: Map View */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* LEFT: fixed-width map on md+ */}
          <Grid
            item
            xs={12}
            md="auto"
            sx={{
              // fixed width at md and up, full width on small screens
              flex: { md: '0 0 720px' },
              maxWidth: { md: '720px' },
              width: { xs: '100%', md: '720px' },
            }}
          >
            <Box sx={{ width: '100%' }}>
              <GoogleMap
                mapContainerStyle={{ ...mapContainerStyle, width: '100%' }}
                center={userLocation || defaultCenter}
                zoom={userLocation ? 10 : 7}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
              >
                {/* User location marker */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }}
                    title="Your Location"
                  />
                )}

                {/* Centre markers */}
                {CENTRES_DATA.map((centre) => (
                  <Marker
                    key={centre.id}
                    position={{ lat: centre.lat, lng: centre.lng }}
                    onClick={() => setSelectedCentre(centre)}
                    icon={{
                      url: `https://maps.google.com/mapfiles/ms/icons/${centre.difficulty === 'Low' ? 'green' : centre.difficulty === 'Medium' ? 'yellow' : 'red'}-dot.png`
                    }}
                    title={centre.name}
                  />
                ))}

                {/* Info window */}
                {selectedCentre && (
                  <InfoWindow
                    position={{ lat: selectedCentre.lat, lng: selectedCentre.lng }}
                    onCloseClick={() => setSelectedCentre(null)}
                  >
                    <Box sx={{ p: 1, maxWidth: 250, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      <Typography variant="h6" gutterBottom>{selectedCentre.name}</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {selectedCentre.address}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2"><strong>Wait:</strong> {selectedCentre.waitWeeks} weeks</Typography>
                      <Typography variant="body2"><strong>Pass Rate:</strong> {selectedCentre.passRate}%</Typography>
                      <Typography variant="body2"><strong>Phone:</strong> {selectedCentre.phone}</Typography>
                    </Box>
                  </InfoWindow>
                )}

                {/* Circle around user location */}
                {userLocation && (
                  <Circle
                    center={userLocation}
                    radius={50000} // 50km radius
                    options={{
                      fillColor: '#667eea',
                      fillOpacity: 0.1,
                      strokeColor: '#667eea',
                      strokeOpacity: 0.3,
                      strokeWeight: 2
                    }}
                  />
                )}
              </GoogleMap>
            </Box>
          </Grid>

          {/* RIGHT: flexible panel that wraps text and scrolls if content is long */}
          <Grid
            item
            xs={12}
            md
            sx={{
              flex: { md: '1 1 0px' },
              minWidth: { md: 320 },
              overflow: 'hidden',
            }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                <Typography variant="h6" gutterBottom>
                  📍 Your Location
                </Typography>
                
                {/* ADDRESS SEARCH BOX */}
                <Box sx={{ mb: 2 }}>
                  <Autocomplete
                    onLoad={onAutocompleteLoad}
                    onPlaceChanged={onPlaceChanged}
                    options={{
                      componentRestrictions: { country: 'ie' }, // Restrict to Ireland
                      fields: ['geometry', 'formatted_address', 'name']
                    }}
                  >
                    <TextField
                      fullWidth
                      placeholder="Enter your address or city"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      InputProps={{
                        startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                      helperText="e.g., Dublin, Cork, or your exact address"
                    />
                  </Autocomplete>
                </Box>

                {/* OR DIVIDER */}
                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary' }}>OR</Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>

                {/* GPS LOCATION BUTTON */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<MyLocation />}
                  onClick={handleGetMyLocation}
                  sx={{ mb: 2 }}
                >
                  Use My Current Location
                </Button>

                {userLocation && userAddress && (
                  <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
                    <strong>Location set:</strong> {userAddress}
                  </Alert>
                )}

                {!userLocation && (
                  <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                    Enter your location to see distances and get directions
                  </Alert>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>Legend</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#10b981', borderRadius: '50%' }} />
                    <Typography variant="body2">Easy (High pass rate)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#f59e0b', borderRadius: '50%' }} />
                    <Typography variant="body2">Medium</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#ef4444', borderRadius: '50%' }} />
                    <Typography variant="body2">Challenging</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#3b82f6', borderRadius: '50%' }} />
                    <Typography variant="body2">Your Location</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* selectedCentre details card wrapped to prevent overflow */}
            {selectedCentre && (
              <Card sx={{ mt: 2, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Centre Details</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Tips:</strong> {selectedCentre.tips}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Common Fails:</strong>
                  </Typography>
                  <List dense>
                    {selectedCentre.commonFails.map((fail, i) => (
                      <ListItem key={i}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <Warning fontSize="small" color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={fail} primaryTypographyProps={{ variant: 'body2', sx: { wordBreak: 'break-word', overflowWrap: 'anywhere' } }} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}

      {/* TAB 2: List View */}
      {activeTab === 1 && (
        <Box>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                onLoad={onAutocompleteLoad}
                onPlaceChanged={onPlaceChanged}
                options={{
                  componentRestrictions: { country: 'ie' },
                  fields: ['geometry', 'formatted_address', 'name']
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Enter your address to see distances"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Autocomplete>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<MyLocation />}
                onClick={handleGetMyLocation}
                sx={{ height: '100%' }}
              >
                Use GPS
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
                  <MenuItem value="distance">Distance (nearest first)</MenuItem>
                  <MenuItem value="passRate">Pass Rate (highest first)</MenuItem>
                  <MenuItem value="waitTime">Wait Time (shortest first)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {getSortedCentres().map((centre) => (
            <CentreCard key={centre.id} centre={centre} />
          ))}
        </Box>
      )}

      {/* TAB 3: Compare */}
      {activeTab === 2 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            Compare multiple centres side-by-side to make the best decision
          </Alert>
          
          <Grid container spacing={2}>
            {CENTRES_DATA.slice(0, 3).map((centre) => (
              <Grid item xs={12} md={4} key={centre.id}>
                <CentreCard centre={centre} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}