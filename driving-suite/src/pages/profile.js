import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Your Firebase config

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState(null);
  const [editedData, setEditedData] = useState({});

  const auth = getAuth();
  const user = auth.currentUser;

  // Irish counties for dropdown
  const irishCounties = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway',
    'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick',
    'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
    'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath',
    'Wexford', 'Wicklow'
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setError('Please log in to view your profile');
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setEditedData(data);
        } else {
          setError('User profile not found');
        }
      } catch (err) {
        setError('Failed to load profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Handle input changes
  const handleChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle nested field changes
  const handleNestedChange = (parent, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Save changes to Firebase
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...editedData,
        'account.updatedAt': new Date()
      });

      setUserData(editedData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading profile...</Typography>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'No profile data found'}</Alert>
      </Container>
    );
  }

  const edtProgress = (editedData.edtProgress?.lessonsCompleted / 12) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          My Profile
        </Typography>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Profile Overview Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}
            >
              {editedData.firstName?.[0]}{editedData.lastName?.[0]}
            </Avatar>
            <Typography variant="h5" fontWeight="bold">
              {editedData.firstName} {editedData.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {editedData.email}
            </Typography>
            <Chip
              label={editedData.account?.subscriptionType?.toUpperCase()}
              color={editedData.account?.subscriptionType === 'premium' ? 'primary' : 'default'}
              size="small"
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            {/* Quick Stats */}
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Quick Stats
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Age:</strong> {editedData.age} years
                </Typography>
                <Typography variant="body2">
                  <strong>Transmission:</strong> {editedData.transmissionPreference}
                </Typography>
                <Typography variant="body2">
                  <strong>Theory Test:</strong> {editedData.theoryTest?.passed ? '✓ Passed' : '✗ Not Passed'}
                </Typography>
                <Typography variant="body2">
                  <strong>Learner Permit:</strong> {editedData.learnerPermit?.hasPermit ? '✓ Yes' : '✗ No'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* EDT Progress Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">EDT Progress</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Lessons Completed
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {editedData.edtProgress?.lessonsCompleted || 0}/12
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={edtProgress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              {editedData.edtProgress?.instructorName && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Instructor:</strong> {editedData.edtProgress.instructorName}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Personal Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Personal Information</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={editedData.firstName || ''}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editedData.lastName || ''}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={editedData.email || ''}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editedData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={editedData.dateOfBirth?.toDate?.()?.toISOString().split('T')[0] || ''}
                  disabled
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PPSN"
                  value={editedData.ppsn || ''}
                  disabled
                  helperText="PPSN cannot be changed"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Address */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Address
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={editedData.address?.street || ''}
                  onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={editedData.address?.city || ''}
                  onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>County</InputLabel>
                  <Select
                    value={editedData.address?.county || ''}
                    label="County"
                    onChange={(e) => handleNestedChange('address', 'county', e.target.value)}
                  >
                    {irishCounties.map(county => (
                      <MenuItem key={county} value={county}>{county}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Eircode"
                  value={editedData.address?.eircode || ''}
                  onChange={(e) => handleNestedChange('address', 'eircode', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Driving Details */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CarIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Driving Details</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Transmission Preference</InputLabel>
                  <Select
                    value={editedData.transmissionPreference || 'manual'}
                    label="Transmission Preference"
                    onChange={(e) => handleChange('transmissionPreference', e.target.value)}
                  >
                    <MenuItem value="manual">Manual</MenuItem>
                    <MenuItem value="automatic">Automatic</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vehicle Category"
                  value={editedData.vehicleCategory || ''}
                  onChange={(e) => handleChange('vehicleCategory', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Preferred Instructor"
                  value={editedData.preferences?.preferredInstructor || ''}
                  onChange={(e) => handleNestedChange('preferences', 'preferredInstructor', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Preferred Time</InputLabel>
                  <Select
                    value={editedData.preferences?.preferredTime || ''}
                    label="Preferred Time"
                    onChange={(e) => handleNestedChange('preferences', 'preferredTime', e.target.value)}
                  >
                    <MenuItem value="morning">Morning</MenuItem>
                    <MenuItem value="afternoon">Afternoon</MenuItem>
                    <MenuItem value="evening">Evening</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Theory Test & Permit */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Theory Test & Learner Permit</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Theory Certificate Number"
                  value={editedData.theoryTest?.certificateNumber || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Learner Permit Number"
                  value={editedData.learnerPermit?.permitNumber || ''}
                  disabled
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Emergency Contact */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Emergency Contact</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  value={editedData.emergencyContact?.name || ''}
                  onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={editedData.emergencyContact?.phone || ''}
                  onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Relationship"
                  value={editedData.emergencyContact?.relationship || ''}
                  onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
