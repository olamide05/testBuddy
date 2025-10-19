import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Chip, Grid,
  Tabs, Tab, Select, MenuItem, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, LinearProgress,
  Divider, IconButton, Tooltip, FormControlLabel, Checkbox, Snackbar
} from '@mui/material';
import {
  SwapHoriz, Add, Search, FilterList, Schedule, LocationOn,
  CheckCircle, Star, Message, Close, Info, Send
} from '@mui/icons-material';

const TESTBUDDY_COLOR = '#17a2b8';

export default function TestSwapPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [myListings, setMyListings] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [completedSwaps] = useState(0);
  const [filterCentre, setFilterCentre] = useState([]);
  const [sortBy, setSortBy] = useState('match');
  const [listingDialogOpen, setListingDialogOpen] = useState(false);
  const [proposeDialogOpen, setProposeDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [proposeFormData, setProposeFormData] = useState({
    myTestCentre: '',
    myTestDate: '',
    myTestTime: '',
    message: '',
    agreeEscrow: false
  });

  // Mock data
  const mockListings = [
    {
      id: 'SW001',
      user: 'Sarah M.',
      userLocation: 'Dublin',
      offering: {
        centre: 'Tallaght',
        date: '2025-12-04',
        time: '10:30'
      },
      seeking: {
        centres: ['Cork', 'Wilton'],
        dateStart: '2025-11-20',
        dateEnd: '2025-12-20',
        flexibility: 'Weekends preferred'
      },
      reason: 'Moved to Cork for work',
      postedDaysAgo: 2,
      matchScore: 95
    },
    {
      id: 'SW002',
      user: 'Liam O.',
      userLocation: 'Cork',
      offering: {
        centre: 'Wilton',
        date: '2025-11-27',
        time: '14:30'
      },
      seeking: {
        centres: ['Tallaght', 'Rathgar', 'Dublin'],
        dateStart: '2025-11-24',
        dateEnd: '2025-12-09',
        flexibility: 'Any weekday'
      },
      reason: 'Returning to Dublin',
      postedDaysAgo: 1,
      matchScore: 88
    },
    {
      id: 'SW003',
      user: 'Emma K.',
      userLocation: 'Galway',
      offering: {
        centre: 'Rathgar',
        date: '2025-12-11',
        time: '09:40'
      },
      seeking: {
        centres: ['Galway', 'Limerick'],
        dateStart: '2025-11-29',
        dateEnd: '2025-12-29',
        flexibility: 'Mornings only'
      },
      reason: 'Studying in Galway',
      postedDaysAgo: 3,
      matchScore: 72
    }
  ];

  const centres = ['Tallaght', 'Rathgar', 'Cork', 'Wilton', 'Galway', 'Limerick', 'Waterford', 'Cavan'];

  const handleOpenProposeDialog = (listing) => {
    setSelectedListing(listing);
    setProposeFormData({
      myTestCentre: '',
      myTestDate: '',
      myTestTime: '',
      message: `Hi ${listing.user.split(' ')[0]}, I'm interested in swapping my test slot with yours. My test is in one of your preferred centres and the dates work well for me. Let's make this happen!`,
      agreeEscrow: false
    });
    setProposeDialogOpen(true);
  };

  const handleSubmitProposal = () => {
    if (!proposeFormData.myTestCentre || !proposeFormData.myTestDate || !proposeFormData.myTestTime) {
      setSnackbar({ open: true, message: 'Please fill in all your test details', severity: 'error' });
      return;
    }

    if (!proposeFormData.agreeEscrow) {
      setSnackbar({ open: true, message: 'Please agree to the escrow terms', severity: 'error' });
      return;
    }

    // Add to swap requests
    const newRequest = {
      id: `REQ${Date.now()}`,
      listingId: selectedListing.id,
      user: selectedListing.user,
      theirTest: selectedListing.offering,
      myTest: {
        centre: proposeFormData.myTestCentre,
        date: proposeFormData.myTestDate,
        time: proposeFormData.myTestTime
      },
      message: proposeFormData.message,
      status: 'pending',
      requestedAt: new Date()
    };

    setSwapRequests([...swapRequests, newRequest]);
    setProposeDialogOpen(false);
    setSnackbar({ 
      open: true, 
      message: `✅ Swap proposal sent to ${selectedListing.user}! They'll be notified.`, 
      severity: 'success' 
    });
    
    // Switch to "My Requests" tab
    setActiveTab(2);
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'default';
  };

  // Stats Cards
  const StatCard = ({ value, label, gradient }) => (
    <Card sx={{
      background: gradient || `linear-gradient(135deg, ${TESTBUDDY_COLOR} 0%, #138496 100%)`,
      color: 'white',
      textAlign: 'center'
    }}>
      <CardContent>
        <Typography variant="h3" fontWeight="bold">{value}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>{label}</Typography>
      </CardContent>
    </Card>
  );

  // Listing Card Component
  const ListingCard = ({ listing }) => (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 6 }, borderRadius: 3 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6">{listing.user} • {listing.userLocation}</Typography>
            <Typography variant="caption" color="text.secondary">
              Posted {listing.postedDaysAgo} day{listing.postedDaysAgo !== 1 ? 's' : ''} ago
            </Typography>
          </Box>
          <Chip
            label={`${listing.matchScore}% Match`}
            color={getMatchColor(listing.matchScore)}
            size="small"
          />
        </Box>

        {/* Swap Details */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <Box sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="success.main" fontWeight="bold">
                🎁 OFFERING:
              </Typography>
              <Typography variant="h6">{listing.offering.centre}</Typography>
              <Typography variant="body2">{listing.offering.date}</Typography>
              <Typography variant="body2" color="text.secondary">{listing.offering.time}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
            <SwapHoriz sx={{ fontSize: 40, color: TESTBUDDY_COLOR }} />
          </Grid>

          <Grid item xs={12} md={5}>
            <Box sx={{ bgcolor: '#fef2f2', p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="error.main" fontWeight="bold">
                🎯 SEEKING:
              </Typography>
              <Typography variant="h6">{listing.seeking.centres.join(', ')}</Typography>
              <Typography variant="body2">
                {listing.seeking.dateStart} - {listing.seeking.dateEnd}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {listing.seeking.flexibility}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>Reason:</strong> {listing.reason}
        </Typography>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => handleOpenProposeDialog(listing)}
            fullWidth
            sx={{ 
              bgcolor: TESTBUDDY_COLOR,
              '&:hover': { bgcolor: '#138496' }
            }}
          >
            Propose Swap
          </Button>
          <Button variant="outlined" fullWidth>
            View Details
          </Button>
          <Tooltip title="Save for later">
            <IconButton>
              <Star />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );

  // Propose Swap Dialog
  const ProposeSwapDialog = () => (
    <Dialog open={proposeDialogOpen} onClose={() => setProposeDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SwapHoriz sx={{ color: TESTBUDDY_COLOR }} />
          Propose Swap with {selectedListing?.user}
        </Box>
        <IconButton
          onClick={() => setProposeDialogOpen(false)}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>You're proposing to swap:</strong>
          <Box sx={{ mt: 1, pl: 2 }}>
            <Typography variant="body2">
              • <strong>They give you:</strong> {selectedListing?.offering.centre} on {selectedListing?.offering.date} at {selectedListing?.offering.time}
            </Typography>
            <Typography variant="body2">
              • <strong>You give them:</strong> Your test slot (enter below)
            </Typography>
          </Box>
        </Alert>

        <Typography variant="h6" gutterBottom sx={{ color: TESTBUDDY_COLOR }}>
          📝 Your Test Details
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Your Test Centre</InputLabel>
              <Select
                value={proposeFormData.myTestCentre}
                onChange={(e) => setProposeFormData({ ...proposeFormData, myTestCentre: e.target.value })}
                label="Your Test Centre"
              >
                {centres.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Your Test Date"
              value={proposeFormData.myTestDate}
              onChange={(e) => setProposeFormData({ ...proposeFormData, myTestDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="time"
              label="Your Test Time"
              value={proposeFormData.myTestTime}
              onChange={(e) => setProposeFormData({ ...proposeFormData, myTestTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ color: TESTBUDDY_COLOR }}>
          💬 Message to {selectedListing?.user}
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Introduce yourself and explain why this swap works for you..."
          value={proposeFormData.message}
          onChange={(e) => setProposeFormData({ ...proposeFormData, message: e.target.value })}
          sx={{ mb: 3 }}
        />

        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            💰 Escrow Protection (€10)
          </Typography>
          <Typography variant="body2">
            Both parties pay €10 held in escrow until swap is confirmed. This ensures commitment and prevents no-shows. Refunded immediately after successful swap.
          </Typography>
        </Alert>

        <FormControlLabel
          control={
            <Checkbox
              checked={proposeFormData.agreeEscrow}
              onChange={(e) => setProposeFormData({ ...proposeFormData, agreeEscrow: e.target.checked })}
            />
          }
          label="I agree to the €10 escrow deposit and swap terms"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setProposeDialogOpen(false)}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={handleSubmitProposal}
          disabled={!proposeFormData.agreeEscrow}
          sx={{ 
            bgcolor: TESTBUDDY_COLOR,
            '&:hover': { bgcolor: '#138496' }
          }}
        >
          Send Proposal
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Create Listing Dialog
  const CreateListingDialog = () => {
    const [formData, setFormData] = useState({
      offerCentre: '',
      offerDate: '',
      offerTime: '',
      seekCentres: [],
      seekDateStart: '',
      seekDateEnd: '',
      flexibility: '',
      reason: '',
      agreeTerms: false
    });

    const handleSubmit = () => {
      if (formData.seekCentres.length === 0) {
        setSnackbar({ open: true, message: 'Please select at least one centre', severity: 'error' });
        return;
      }
      
      setMyListings([...myListings, {
        id: `SW${Math.floor(Math.random() * 900) + 100}`,
        ...formData,
        postedAt: new Date(),
        status: 'active'
      }]);
      
      setListingDialogOpen(false);
      setSnackbar({ open: true, message: '✅ Your swap listing is now live!', severity: 'success' });
    };

    return (
      <Dialog open={listingDialogOpen} onClose={() => setListingDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          ➕ List Your Test Slot for Swap
          <IconButton
            onClick={() => setListingDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Before listing:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Make sure you have a confirmed RSA test booking</li>
              <li>Small escrow deposit (€10) held until swap confirmed</li>
            </ul>
          </Alert>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            🎁 What You're Offering
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Test Centre</InputLabel>
                <Select
                  value={formData.offerCentre}
                  onChange={(e) => setFormData({ ...formData, offerCentre: e.target.value })}
                  label="Test Centre"
                >
                  {centres.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Test Date"
                value={formData.offerDate}
                onChange={(e) => setFormData({ ...formData, offerDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="time"
                label="Test Time"
                value={formData.offerTime}
                onChange={(e) => setFormData({ ...formData, offerTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            🎯 What You're Seeking
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Preferred Centres</InputLabel>
                <Select
                  multiple
                  value={formData.seekCentres}
                  onChange={(e) => setFormData({ ...formData, seekCentres: e.target.value })}
                  label="Preferred Centres"
                  renderValue={(selected) => selected.join(', ')}
                >
                  {centres.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Earliest Date"
                value={formData.seekDateStart}
                onChange={(e) => setFormData({ ...formData, seekDateStart: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Latest Date"
                value={formData.seekDateEnd}
                onChange={(e) => setFormData({ ...formData, seekDateEnd: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Time Flexibility</InputLabel>
                <Select
                  value={formData.flexibility}
                  onChange={(e) => setFormData({ ...formData, flexibility: e.target.value })}
                  label="Time Flexibility"
                >
                  <MenuItem value="Any time">Any time</MenuItem>
                  <MenuItem value="Mornings only">Mornings only</MenuItem>
                  <MenuItem value="Afternoons only">Afternoons only</MenuItem>
                  <MenuItem value="Weekends preferred">Weekends preferred</MenuItem>
                  <MenuItem value="Weekdays preferred">Weekdays preferred</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Why are you swapping?"
                placeholder="e.g., Moved to Cork for work"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </Grid>
          </Grid>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
              />
            }
            label="I agree to swap terms (€10 escrow, 48hr response time)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setListingDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.agreeTerms || formData.seekCentres.length === 0}
            sx={{ 
              bgcolor: TESTBUDDY_COLOR,
              '&:hover': { bgcolor: '#138496' }
            }}
          >
            🚀 List My Swap
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        🔄 Test Swap Market
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Peer-to-peer test slot exchanges - Legal, guided, and safe
      </Typography>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard value={mockListings.length} label="Active Listings" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard value={myListings.length} label="Your Listings" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard value={swapRequests.length} label="Pending Requests" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard value={completedSwaps} label="Swaps Completed" />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Tabs */}
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
        <Tab icon={<Search />} label="Browse Swaps" />
        <Tab icon={<Add />} label="List Your Test" />
        <Tab icon={<Message />} label={`My Requests (${swapRequests.length})`} />
        <Tab icon={<Info />} label="How It Works" />
      </Tabs>

      {/* TAB 1: Browse Swaps */}
      {activeTab === 0 && (
        <Box>
          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Filter by Centre</InputLabel>
                <Select
                  multiple
                  value={filterCentre}
                  onChange={(e) => setFilterCentre(e.target.value)}
                  label="Filter by Centre"
                  renderValue={(selected) => selected.join(', ')}
                >
                  {centres.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
                  <MenuItem value="match">Match Score (High to Low)</MenuItem>
                  <MenuItem value="recent">Date Posted (Recent)</MenuItem>
                  <MenuItem value="soonest">Date (Soonest)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Listings */}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Showing {mockListings.length} swap{mockListings.length !== 1 ? 's' : ''}
          </Typography>
          {mockListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </Box>
      )}

      {/* TAB 2: List Your Test */}
      {activeTab === 1 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h5" gutterBottom>
            ➕ Ready to list your test slot?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Help others while finding a better slot for yourself
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => setListingDialogOpen(true)}
            sx={{ 
              bgcolor: TESTBUDDY_COLOR,
              '&:hover': { bgcolor: '#138496' }
            }}
          >
            Create Swap Listing
          </Button>

          {myListings.length > 0 && (
            <Box sx={{ mt: 4, textAlign: 'left' }}>
              <Typography variant="h6" gutterBottom>Your Active Listings</Typography>
              {myListings.map((listing, i) => (
                <Card key={i} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>
                        {listing.offerCentre} → {listing.seekCentres.join(', ')}
                      </Typography>
                      <Chip label="Active" color="success" size="small" />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* TAB 3: My Requests */}
      {activeTab === 2 && (
        <Box>
          {swapRequests.length === 0 ? (
            <Alert severity="info">
              📭 No swap requests yet. Browse available swaps and propose one!
            </Alert>
          ) : (
            swapRequests.map((req) => (
              <Card key={req.id} sx={{ mb: 2, borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">Swap with {req.user}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Request ID: {req.id}
                      </Typography>
                    </Box>
                    <Chip label="Pending" color="warning" />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">You Get:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {req.theirTest.centre} - {req.theirTest.date} at {req.theirTest.time}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">You Give:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {req.myTest.centre} - {req.myTest.date} at {req.myTest.time}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button variant="outlined" size="small" startIcon={<Message />}>
                      💬 Message
                    </Button>
                    <Button variant="outlined" size="small">
                      🔔 Remind
                    </Button>
                    <Button variant="outlined" color="error" size="small">
                      ❌ Cancel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* TAB 4: How It Works */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom>How Test Swaps Work</Typography>
          
          {[
            { num: 1, title: 'List Your Test Slot', desc: 'Post what you\'re offering and seeking' },
            { num: 2, title: 'Get Matched', desc: 'Our algorithm finds compatible swaps' },
            { num: 3, title: 'Confirm Details', desc: 'Message and exchange booking references' },
            { num: 4, title: 'Pay Escrow (€10)', desc: 'Ensures both parties follow through' },
            { num: 5, title: 'Cancel Original Tests', desc: 'Both cancel on RSA website' },
            { num: 6, title: 'Book Swapped Slots', desc: 'Quickly book each other\'s slots' },
            { num: 7, title: 'Confirm & Get Refund', desc: 'Upload proof, escrow released 🎉' }
          ].map(step => (
            <Card key={step.num} sx={{ mb: 2, borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    bgcolor: TESTBUDDY_COLOR,
                    color: 'white',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}
                >
                  {step.num}
                </Box>
                <Box>
                  <Typography variant="h6">{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{step.desc}</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}

          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography fontWeight="bold">✅ Completely legal!</Typography>
            <Typography variant="body2">
              You perform the actual rebooking - we just facilitate matching. No scalping, mutual benefit.
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Dialogs */}
      <CreateListingDialog />
      <ProposeSwapDialog />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
