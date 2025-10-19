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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Tooltip,
  Badge,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
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
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  LocationOn as LocationOnIcon,
  Verified as VerifiedIcon,
  EmojiEvents as TrophyIcon,
  Dashboard as DashboardIcon,
  Check as CheckIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [theoryTestDialogOpen, setTheoryTestDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonDetails, setLessonDetails] = useState({
    lessonNumber: 1,
    date: new Date().toISOString().split('T')[0],
    instructor: '',
    notes: '',
    completed: false,
  });
  const [theoryTestDetails, setTheoryTestDetails] = useState({
    passed: false,
    passDate: new Date().toISOString().split('T')[0],
    certificateNumber: '',
    expiryDate: '',
  });

  const auth = getAuth();
  const user = auth.currentUser;

  const edtLessons = [
    { id: 1, title: 'Car Controls, Instruments & Safety', required: true },
    { id: 2, title: 'Starting, Moving Off, Stopping', required: false },
    { id: 3, title: 'Safe & Legal Road Positioning', required: false },
    { id: 4, title: 'Understanding Mirrors & Signals', required: false },
    { id: 5, title: 'Turning Left & Right', required: false },
    { id: 6, title: 'Junctions & Roundabouts', required: false },
    { id: 7, title: 'Reversing', required: false },
    { id: 8, title: 'Speed & Progress Management', required: false },
    { id: 9, title: 'Driving on Different Road Types', required: false },
    { id: 10, title: 'Night Driving & Adverse Weather', required: false },
    { id: 11, title: 'Motorway Driving', required: false },
    { id: 12, title: 'Test Preparation & Independent Driving', required: false },
  ];

  const irishCounties = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway',
    'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick',
    'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
    'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath',
    'Wexford', 'Wicklow'
  ];

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
          if (!data.edtProgress?.lessons) {
            data.edtProgress = { ...data.edtProgress, lessons: [] };
          }
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

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

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
    setError('');
  };

  const handleOpenLessonDialog = (lessonNumber) => {
    const existingLesson = editedData.edtProgress?.lessons?.find(
      l => l.lessonNumber === lessonNumber
    );

    if (existingLesson) {
      setLessonDetails({
        lessonNumber: existingLesson.lessonNumber,
        date: existingLesson.date,
        instructor: existingLesson.instructor,
        notes: existingLesson.notes || '',
        completed: existingLesson.completed,
      });
    } else {
      setLessonDetails({
        lessonNumber: lessonNumber,
        date: new Date().toISOString().split('T')[0],
        instructor: editedData.edtProgress?.instructorName || '',
        notes: '',
        completed: false,
      });
    }

    setSelectedLesson(lessonNumber);
    setLessonDialogOpen(true);
  };

  const handleCloseLessonDialog = () => {
    setLessonDialogOpen(false);
    setSelectedLesson(null);
  };

  const handleOpenTheoryTestDialog = () => {
    if (editedData.theoryTest) {
      setTheoryTestDetails({
        passed: editedData.theoryTest.passed || false,
        passDate: editedData.theoryTest.passDate || new Date().toISOString().split('T')[0],
        certificateNumber: editedData.theoryTest.certificateNumber || '',
        expiryDate: editedData.theoryTest.expiryDate || '',
      });
    } else {
      setTheoryTestDetails({
        passed: false,
        passDate: new Date().toISOString().split('T')[0],
        certificateNumber: '',
        expiryDate: '',
      });
    }
    setTheoryTestDialogOpen(true);
  };

  const handleCloseTheoryTestDialog = () => {
    setTheoryTestDialogOpen(false);
  };

  const handleSaveTheoryTest = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const userRef = doc(db, 'users', user.uid);

      await updateDoc(userRef, {
        'theoryTest.passed': theoryTestDetails.passed,
        'theoryTest.passDate': theoryTestDetails.passDate,
        'theoryTest.certificateNumber': theoryTestDetails.certificateNumber,
        'theoryTest.expiryDate': theoryTestDetails.expiryDate,
        'account.updatedAt': new Date()
      });

      const updatedData = {
        ...editedData,
        theoryTest: {
          ...editedData.theoryTest,
          passed: theoryTestDetails.passed,
          passDate: theoryTestDetails.passDate,
          certificateNumber: theoryTestDetails.certificateNumber,
          expiryDate: theoryTestDetails.expiryDate,
        }
      };

      setEditedData(updatedData);
      setUserData(updatedData);
      setSuccess('Theory test information updated successfully!');
      handleCloseTheoryTestDialog();
    } catch (err) {
      setError('Failed to update theory test: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteLesson = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const userRef = doc(db, 'users', user.uid);
      const currentLessons = editedData.edtProgress?.lessons || [];
      const existingLessonIndex = currentLessons.findIndex(
        l => l.lessonNumber === lessonDetails.lessonNumber
      );

      let updatedLessons;
      let lessonsCompletedChange = 0;

      if (existingLessonIndex >= 0) {
        updatedLessons = [...currentLessons];
        const wasCompleted = updatedLessons[existingLessonIndex].completed;
        updatedLessons[existingLessonIndex] = {
          ...lessonDetails,
          completedAt: new Date().toISOString(),
        };
        
        if (lessonDetails.completed && !wasCompleted) {
          lessonsCompletedChange = 1;
        } else if (!lessonDetails.completed && wasCompleted) {
          lessonsCompletedChange = -1;
        }
      } else {
        updatedLessons = [
          ...currentLessons,
          { ...lessonDetails, completedAt: new Date().toISOString() }
        ];
        if (lessonDetails.completed) {
          lessonsCompletedChange = 1;
        }
      }

      const completedCount = (editedData.edtProgress?.lessonsCompleted || 0) + lessonsCompletedChange;
      const lessonsRemaining = Math.max(12 - completedCount, 0);

      await updateDoc(userRef, {
        'edtProgress.lessons': updatedLessons,
        'edtProgress.lessonsCompleted': completedCount,
        'edtProgress.lessonsRemaining': lessonsRemaining,
        'edtProgress.instructorName': lessonDetails.instructor,
        'account.updatedAt': new Date()
      });

      const updatedData = {
        ...editedData,
        edtProgress: {
          ...editedData.edtProgress,
          lessons: updatedLessons,
          lessonsCompleted: completedCount,
          lessonsRemaining: lessonsRemaining,
          instructorName: lessonDetails.instructor,
        }
      };

      setEditedData(updatedData);
      setUserData(updatedData);
      setSuccess(`Lesson ${lessonDetails.lessonNumber} updated successfully!`);
      handleCloseLessonDialog();
    } catch (err) {
      setError('Failed to update lesson: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickComplete = async (lessonNumber) => {
    setSaving(true);
    setError('');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const currentLessons = editedData.edtProgress?.lessons || [];
      const existingLessonIndex = currentLessons.findIndex(
        l => l.lessonNumber === lessonNumber
      );

      let updatedLessons = [...currentLessons];
      let lessonsCompletedChange = 0;
      let newCompletedStatus = false;

      if (existingLessonIndex >= 0) {
        const wasCompleted = updatedLessons[existingLessonIndex].completed;
        newCompletedStatus = !wasCompleted;
        
        updatedLessons[existingLessonIndex] = {
          ...updatedLessons[existingLessonIndex],
          completed: newCompletedStatus,
          completedAt: newCompletedStatus ? new Date().toISOString() : null,
        };
        
        lessonsCompletedChange = newCompletedStatus ? 1 : -1;
      } else {
        newCompletedStatus = true;
        updatedLessons.push({
          lessonNumber: lessonNumber,
          date: new Date().toISOString().split('T')[0],
          instructor: editedData.edtProgress?.instructorName || 'Not specified',
          notes: '',
          completed: true,
          completedAt: new Date().toISOString(),
        });
        lessonsCompletedChange = 1;
      }

      const completedCount = (editedData.edtProgress?.lessonsCompleted || 0) + lessonsCompletedChange;
      const lessonsRemaining = Math.max(12 - completedCount, 0);

      await updateDoc(userRef, {
        'edtProgress.lessons': updatedLessons,
        'edtProgress.lessonsCompleted': completedCount,
        'edtProgress.lessonsRemaining': lessonsRemaining,
        'account.updatedAt': new Date()
      });

      const updatedData = {
        ...editedData,
        edtProgress: {
          ...editedData.edtProgress,
          lessons: updatedLessons,
          lessonsCompleted: completedCount,
          lessonsRemaining: lessonsRemaining,
        }
      };

      setEditedData(updatedData);
      setUserData(updatedData);
      setSuccess(`Lesson ${lessonNumber} marked as ${newCompletedStatus ? 'complete' : 'incomplete'}!`);
    } catch (err) {
      setError('Failed to update lesson: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const isLessonCompleted = (lessonNumber) => {
    const lesson = editedData.edtProgress?.lessons?.find(
      l => l.lessonNumber === lessonNumber
    );
    return lesson?.completed || false;
  };

  const getLessonInfo = (lessonNumber) => {
    return editedData.edtProgress?.lessons?.find(
      l => l.lessonNumber === lessonNumber
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <LinearProgress sx={{ mb: 2, width: 300 }} />
          <Typography variant="h6" color="text.secondary">Loading your profile...</Typography>
        </Paper>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'No profile data found'}</Alert>
      </Container>
    );
  }

  const edtProgress = ((editedData.edtProgress?.lessonsCompleted || 0) / 12) * 100;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* ✨ Enhanced Top Navigation Bar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          borderBottom: '2px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 4 }, py: 1.5 }}>
          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.2rem',
                mr: 1.5
              }}
            >
              TB
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              TestBuddy
            </Typography>
          </Box>

          {/* Desktop Tabs */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  minHeight: 64,
                  px: 3,
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(102, 126, 234, 0.04)'
                  },
                  '&.Mui-selected': {
                    color: 'primary.main',
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                }
              }}
            >
              <Tab 
                label="Overview" 
                icon={<DashboardIcon sx={{ fontSize: 20 }} />} 
                iconPosition="start"
              />
              <Tab 
                label="EDT Lessons" 
                icon={<SchoolIcon sx={{ fontSize: 20 }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Personal Info" 
                icon={<PersonIcon sx={{ fontSize: 20 }} />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }} />

          {/* Right Side Actions */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={editedData.account?.subscriptionType?.toUpperCase() || 'FREE'}
              size="small"
              sx={{
                fontWeight: 700,
                display: { xs: 'none', sm: 'flex' },
                background: editedData.account?.subscriptionType === 'premium' 
                  ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                  : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                color: 'white'
              }}
            />
          </Stack>
        </Toolbar>

        {/* Mobile Tabs */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, bgcolor: 'white' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 56,
                fontSize: '0.875rem',
                '&.Mui-selected': {
                  color: 'primary.main',
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
              }
            }}
          >
            <Tab label="Overview" icon={<DashboardIcon sx={{ fontSize: 18 }} />} iconPosition="top" />
            <Tab label="EDT" icon={<SchoolIcon sx={{ fontSize: 18 }} />} iconPosition="top" />
            <Tab label="Personal" icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="top" />
          </Tabs>
        </Box>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 0 }}>
        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Tab 1: Overview */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Profile Header Card */}
            <Grid item xs={12}>
              <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        editedData.account?.isActive ? (
                          <VerifiedIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', p: 0.5, fontSize: 28 }} />
                        ) : null
                      }
                    >
                      <Avatar
                        sx={{
                          width: 100,
                          height: 100,
                          fontSize: '2.5rem',
                          fontWeight: 'bold',
                          bgcolor: 'rgba(255,255,255,0.2)',
                          border: '4px solid white'
                        }}
                      >
                        {editedData.firstName?.charAt(0)}{editedData.lastName?.charAt(0)}
                      </Avatar>
                    </Badge>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {editedData.firstName} {editedData.lastName}
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
                      <Chip
                        icon={<PersonIcon />}
                        label={`${editedData.age || 'N/A'} years old`}
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                      />
                      <Chip
                        icon={<CarIcon />}
                        label={`Category ${editedData.vehicleCategory || 'B'}`}
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                      />
                      <Chip
                        icon={<LocationOnIcon />}
                        label={editedData.address?.county || 'Not set'}
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      <SchoolIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {editedData.edtProgress?.lessonsCompleted || 0}/12
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        EDT Lessons
                      </Typography>
                    </Box>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={edtProgress} 
                    sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: editedData.theoryTest?.passed ? 'success.main' : 'warning.main', width: 56, height: 56 }}>
                      <DescriptionIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {editedData.theoryTest?.passed ? 'Passed' : 'Pending'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Theory Test
                      </Typography>
                      {editedData.theoryTest?.passed && (
                        <Chip
                          label={`Cert: ${editedData.theoryTest?.certificateNumber}`}
                          size="small"
                          color="success"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Stack>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleOpenTheoryTestDialog}
                    sx={{ mt: 2 }}
                  >
                    Update
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: editedData.drivingTest?.passed ? 'success.main' : 
                               editedData.drivingTest?.booked ? 'info.main' : 'grey.400',
                      width: 56,
                      height: 56
                    }}>
                      {editedData.drivingTest?.passed ? <TrophyIcon fontSize="large" /> : <CarIcon fontSize="large" />}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {editedData.drivingTest?.passed ? 'Passed!' : 
                         editedData.drivingTest?.booked ? 'Booked' : 'Not Booked'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Driving Test
                      </Typography>
                      {editedData.drivingTest?.testCentre && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {editedData.drivingTest.testCentre}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: EDT Lessons */}
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Essential Driver Training (EDT)
              </Typography>
              <Chip
                label={`${editedData.edtProgress?.lessonsCompleted || 0}/12 Complete`}
                color={edtProgress === 100 ? 'success' : 'primary'}
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <LinearProgress 
              variant="determinate" 
              value={edtProgress} 
              sx={{ mb: 4, height: 12, borderRadius: 6 }}
            />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Lesson</strong></TableCell>
                    <TableCell><strong>Title</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {edtLessons.map((lesson) => {
                    const completed = isLessonCompleted(lesson.id);
                    const lessonInfo = getLessonInfo(lesson.id);

                    return (
                      <TableRow 
                        key={lesson.id}
                        sx={{
                          bgcolor: completed ? 'success.lighter' : 'inherit',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: '0.875rem',
                                bgcolor: completed ? 'success.main' : 'grey.300'
                              }}
                            >
                              {lesson.id}
                            </Avatar>
                            {lesson.required && (
                              <Chip label="Required" size="small" color="error" />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={completed ? 600 : 400}>
                            {lesson.title}
                          </Typography>
                          {lessonInfo?.date && (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(lessonInfo.date).toLocaleDateString('en-IE')}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {completed ? (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Complete"
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Chip
                              icon={<RadioButtonUncheckedIcon />}
                              label="Pending"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title={completed ? 'Mark incomplete' : 'Mark complete'}>
                              <Button
                                size="small"
                                variant={completed ? 'outlined' : 'contained'}
                                color={completed ? 'error' : 'success'}
                                onClick={() => handleQuickComplete(lesson.id)}
                                startIcon={completed ? <CancelIcon /> : <CheckIcon />}
                              >
                                {completed ? 'Undo' : 'Complete'}
                              </Button>
                            </Tooltip>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenLessonDialog(lesson.id)}
                            >
                              Details
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Tab 3: Personal Info */}
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Personal Information
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
                <Stack direction="row" spacing={2}>
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
                </Stack>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {/* Basic Info */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon /> Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={editedData.firstName || ''}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editedData.lastName || ''}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={editedData.dateOfBirth || ''}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={editedData.age || ''}
                  onChange={(e) => handleChange('age', parseInt(e.target.value))}
                  disabled={!isEditing}
                />
              </Grid>

              {/* Contact Info */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon /> Contact Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editedData.email || ''}
                  disabled
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={editedData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon /> Address
                </Typography>
              </Grid>

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
                    onChange={(e) => handleNestedChange('address', 'county', e.target.value)}
                    label="County"
                  >
                    {irishCounties.map((county) => (
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

              {/* Driving Preferences */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CarIcon /> Driving Preferences
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Transmission</InputLabel>
                  <Select
                    value={editedData.transmissionPreference || 'manual'}
                    onChange={(e) => handleChange('transmissionPreference', e.target.value)}
                    label="Transmission"
                  >
                    <MenuItem value="manual">Manual</MenuItem>
                    <MenuItem value="automatic">Automatic</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Vehicle Category</InputLabel>
                  <Select
                    value={editedData.vehicleCategory || 'B'}
                    onChange={(e) => handleChange('vehicleCategory', e.target.value)}
                    label="Vehicle Category"
                  >
                    <MenuItem value="A">A - Motorcycle</MenuItem>
                    <MenuItem value="B">B - Car</MenuItem>
                    <MenuItem value="C">C - Truck</MenuItem>
                    <MenuItem value="D">D - Bus</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
      </Container>

      {/* Lesson Details Dialog */}
      <Dialog open={lessonDialogOpen} onClose={handleCloseLessonDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Lesson {selectedLesson} Details
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={lessonDetails.date}
              onChange={(e) => setLessonDetails({ ...lessonDetails, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Instructor"
              value={lessonDetails.instructor}
              onChange={(e) => setLessonDetails({ ...lessonDetails, instructor: e.target.value })}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={4}
              value={lessonDetails.notes}
              onChange={(e) => setLessonDetails({ ...lessonDetails, notes: e.target.value })}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={lessonDetails.completed}
                  onChange={(e) => setLessonDetails({ ...lessonDetails, completed: e.target.checked })}
                />
              }
              label="Mark as completed"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLessonDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCompleteLesson} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Theory Test Dialog */}
      <Dialog open={theoryTestDialogOpen} onClose={handleCloseTheoryTestDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Theory Test Information
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={theoryTestDetails.passed}
                  onChange={(e) => setTheoryTestDetails({ ...theoryTestDetails, passed: e.target.checked })}
                />
              }
              label="Passed Theory Test"
            />
            {theoryTestDetails.passed && (
              <>
                <TextField
                  fullWidth
                  label="Pass Date"
                  type="date"
                  value={theoryTestDetails.passDate}
                  onChange={(e) => setTheoryTestDetails({ ...theoryTestDetails, passDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Certificate Number"
                  value={theoryTestDetails.certificateNumber}
                  onChange={(e) => setTheoryTestDetails({ ...theoryTestDetails, certificateNumber: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="date"
                  value={theoryTestDetails.expiryDate}
                  onChange={(e) => setTheoryTestDetails({ ...theoryTestDetails, expiryDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTheoryTestDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTheoryTest} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
