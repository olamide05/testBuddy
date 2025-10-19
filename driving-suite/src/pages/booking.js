import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle, Autocomplete } from '@react-google-maps/api';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Alert, Paper, Divider,
  List, ListItem, ListItemText, ListItemIcon, Tabs, Tab, Snackbar
} from '@mui/material';
import {
  LocationOn, Phone, Schedule, TrendingUp, DirectionsCar, Star,
  Navigation, CheckCircle, Warning, Info, Search, MyLocation, Cancel
} from '@mui/icons-material';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './booking.css';

const TESTBUDDY_COLOR = '#17a2b8';

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

const libraries = ['places'];

export default function TestCentresPage() {
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [activeTab, setActiveTab] = useState(0);
  const [autocomplete, setAutocomplete] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [bookedTest, setBookedTest] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  // Load booking from Firebase when component mounts
  useEffect(() => {
    const loadBooking = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const bookingDoc = await getDoc(doc(db, 'bookings', user.uid));
        if (bookingDoc.exists()) {
          setBookedTest(bookingDoc.data());
        }
      } catch (error) {
        console.error('Error loading booking:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [user]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCQ30DmZrIFUO1TtdJs3h1xrnSP11uPMss',
    libraries
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onAutocompleteLoad = (autocompleteObj) => {
    setAutocomplete(autocompleteObj);
  };

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
        setSnackbar({ open: true, message: 'No location details available for this address', severity: 'error' });
      }
    }
  };

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
          
          setSnackbar({ open: true, message: '📍 Location set successfully!', severity: 'success' });
        },
        () => {
          setSnackbar({ open: true, message: 'Could not get your location. Please enter your address manually.', severity: 'error' });
        }
      );
    } else {
      setSnackbar({ open: true, message: 'Geolocation is not supported by your browser.', severity: 'error' });
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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

  // Book test and save to Firebase
  const handleBookTest = async (centre) => {
    if (!user) {
      setSnackbar({ open: true, message: 'Please log in to book a test', severity: 'error' });
      return;
    }

    try {
      const booking = {
        centreId: centre.id,
        centreName: centre.name,
        centreAddress: centre.address,
        waitWeeks: centre.waitWeeks,
        passRate: centre.passRate,
        phone: centre.phone,
        bookedAt: new Date().toISOString(),
        userId: user.uid,
        userEmail: user.email
      };

      // Save to Firebase
      await setDoc(doc(db, 'bookings', user.uid), booking);
      
      setBookedTest(booking);
      setSnackbar({ 
        open: true, 
        message: `✅ Test booked at ${centre.name}! Good luck!`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error booking test:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to book test. Please try again.', 
        severity: 'error' 
      });
    }
  };

  // Cancel booking and remove from Firebase
  const handleCancelBooking = async () => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'bookings', user.uid));
      setBookedTest(null);
      setSnackbar({ 
        open: true, 
        message: 'Booking cancelled successfully', 
        severity: 'info' 
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to cancel booking. Please try again.', 
        severity: 'error' 
      });
    }
  };

  const CentreCard = ({ centre }) => {
    const distance = userLocation 
      ? calculateDistance(userLocation.lat, userLocation.lng, centre.lat, centre.lng)
      : null;

    const isBooked = bookedTest?.centreId === centre.id;
    const isOtherBooked = bookedTest && bookedTest.centreId !== centre.id;

    return (
      <Card sx={{ mb: 2, '&:hover': { boxShadow: 6 }, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Box>
              <Typography variant="h6">{centre.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {centre.address}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
              {distance && (
                <Chip 
                  label={`${distance.toFixed(1)} km`} 
                  sx={{ bgcolor: TESTBUDDY_COLOR, color: 'white' }}
                  icon={<Navigation sx={{ color: 'white !important' }} />}
                />
              )}
              {isBooked && (
                <Chip 
                  label="✓ Booked" 
                  color="success"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} md={3}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f9fafb', textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Wait Time</Typography>
                <Typography variant="h6" color={centre.waitWeeks < 15 ? 'success.main' : 'error.main'}>
                  {centre.waitWeeks}w
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f9fafb', textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Pass Rate</Typography>
                <Typography variant="h6" color={centre.passRate >= 55 ? 'success.main' : 'warning.main'}>
                  {centre.passRate}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f9fafb', textAlign: 'center', borderRadius: 2 }}>
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
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f9fafb', textAlign: 'center', borderRadius: 2 }}>
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
              sx={{
                bgcolor: TESTBUDDY_COLOR,
                '&:hover': { bgcolor: '#138496' }
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

            {isBooked ? (
              <Button
                variant="contained"
                size="small"
                color="error"
                startIcon={<Cancel />}
                onClick={handleCancelBooking}
              >
                Cancel Booking
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                color={isOtherBooked ? 'inherit' : 'success'}
                startIcon={<CheckCircle />}
                disabled={isOtherBooked}
                onClick={() => handleBookTest(centre)}
              >
                {isOtherBooked ? 'Another Test Booked' : 'Book Test'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (!isLoaded || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Typography>Loading...</Typography>
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

      {bookedTest && (
        <Alert 
          severity="success" 
          sx={{ mt: 2, mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleCancelBooking}
              startIcon={<Cancel />}
            >
              Cancel
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>📍 Test Booked:</strong> {bookedTest.centreName} - {bookedTest.centreAddress}
          </Typography>
          <Typography variant="caption">
            Booked on {new Date(bookedTest.bookedAt).toLocaleDateString('en-IE')} • Wait time: {bookedTest.waitWeeks} weeks • Pass rate: {bookedTest.passRate}%
          </Typography>
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      <Tabs 
        value={activeTab} 
        onChange={(e, v) => setActiveTab(v)} 
        sx={{ 
          mb: 3,
          '& .MuiTab-root': {
            color: 'text.secondary',
            '&.Mui-selected': {
              color: TESTBUDDY_COLOR
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: TESTBUDDY_COLOR
          }
        }}
      >
        <Tab label="Map View" />
        <Tab label="List View" />
        <Tab label="Compare" />
      </Tabs>

      {/* TAB 1: Map View */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            md="auto"
            sx={{
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
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }}
                    title="Your Location"
                  />
                )}

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

                {selectedCentre && (
                  <InfoWindow
                    position={{ lat: selectedCentre.lat, lng: selectedCentre.lng }}
                    onCloseClick={() => setSelectedCentre(null)}
                  >
                    <Box 
                      sx={{ 
                        p: 1,
                        maxWidth: 250,
                        wordBreak: 'break-word', 
                        overflowWrap: 'anywhere',
                      }}
                    >
                      <Typography variant="h6" gutterBottom>{selectedCentre.name}</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {selectedCentre.address}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2"><strong>Wait:</strong> {selectedCentre.waitWeeks} weeks</Typography>
                      <Typography variant="body2"><strong>Pass Rate:</strong> {selectedCentre.passRate}%</Typography>
                      <Typography variant="body2"><strong>Phone:</strong> {selectedCentre.phone}</Typography>

                      {bookedTest?.centreId === selectedCentre.id ? (
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          fullWidth
                          sx={{ mt: 1 }}
                          startIcon={<Cancel />}
                          onClick={handleCancelBooking}
                        >
                          Cancel Booking
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          sx={{ 
                            mt: 1,
                            bgcolor: TESTBUDDY_COLOR,
                            '&:hover': { bgcolor: '#138496' }
                          }}
                          startIcon={<CheckCircle />}
                          onClick={() => handleBookTest(selectedCentre)}
                          disabled={bookedTest && bookedTest.centreId !== selectedCentre.id}
                        >
                          {bookedTest ? 'Another Test Booked' : 'Book Test'}
                        </Button>
                      )}
                    </Box>
                  </InfoWindow>
                )}

                {userLocation && (
                  <Circle
                    center={userLocation}
                    radius={50000}
                    options={{
                      fillColor: TESTBUDDY_COLOR,
                      fillOpacity: 0.1,
                      strokeColor: TESTBUDDY_COLOR,
                      strokeOpacity: 0.3,
                      strokeWeight: 2
                    }}
                  />
                )}
              </GoogleMap>
            </Box>
          </Grid>

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
                
                <Box sx={{ mb: 2 }}>
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

                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary' }}>OR</Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<MyLocation />}
                  onClick={handleGetMyLocation}
                  sx={{ 
                    mb: 2,
                    bgcolor: TESTBUDDY_COLOR,
                    '&:hover': { bgcolor: '#138496' }
                  }}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
