import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  CardContent,
  CardHeader,
  IconButton,
  Link
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  DirectionsCar,
  CheckCircle,
  HourglassEmpty,
  CalendarToday,
  LocationOn,
  TrendingUp,
  Article,
  Person,
  Speed,
  Event,
  School  // Add this import

} from '@mui/icons-material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase'; // Your Firebase config

// --- Stat Card Component ---
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
    <Avatar sx={{ bgcolor: color, width: 56, height: 56, mr: 2 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="h6" color="text.secondary">{title}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Box>
  </Card>
);

// --- Main Dashboard Component ---
export default function MainPage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [areaStats, setAreaStats] = useState(null);
  const [drivingNews, setDrivingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const auth = getAuth();

  // Fetch user data and related information
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
        await fetchUpcomingLessons(currentUser.uid);
      } else {
        setError('Please log in to view dashboard');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user profile data
  const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        
        // Fetch area statistics based on user's county
        if (data.address?.county) {
          await fetchAreaStats(data.address.county);
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    }
  };

  // Fetch upcoming lessons (you'll need to create a lessons collection)
  const fetchUpcomingLessons = async (uid) => {
    try {
      const lessonsRef = collection(db, 'lessons');
      const q = query(
        lessonsRef,
        where('userId', '==', uid),
        where('status', '==', 'scheduled'),
        orderBy('dateTime', 'asc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const lessons = [];
      querySnapshot.forEach((doc) => {
        lessons.push({ id: doc.id, ...doc.data() });
      });
      
      setUpcomingLessons(lessons);
    } catch (err) {
      console.error('Error fetching lessons:', err);
      // If lessons collection doesn't exist yet, set empty array
      setUpcomingLessons([]);
    }
  };

  // Fetch area statistics (you can aggregate this from your users collection)
  const fetchAreaStats = async (county) => {
    try {
      // Get all users in the same county
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('address.county', '==', county));
      const querySnapshot = await getDocs(q);
      
      let totalUsers = 0;
      let passedTests = 0;
      let pendingTests = 0;
      let completedEDT = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalUsers++;
        if (data.drivingTest?.passed) passedTests++;
        if (data.drivingTest?.booked && !data.drivingTest?.passed) pendingTests++;
        if (data.edtProgress?.lessonsCompleted >= 12) completedEDT++;
      });
      
      setAreaStats({
        county,
        totalLearners: totalUsers,
        passRate: totalUsers > 0 ? Math.round((passedTests / totalUsers) * 100) : 0,
        pendingTests,
        averageWaitTime: '6-8 weeks', // You can calculate this from test dates
        completedEDT
      });
    } catch (err) {
      console.error('Error fetching area stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Irish driving news
  useEffect(() => {
    const fetchDrivingNews = async () => {
      // Mock news data (you can integrate with RSA RSS feed or news API)
      const mockNews = [
        {
          id: 1,
          title: 'RSA Notes Further Improvement in Driving Test Waiting Times',
          source: 'Road Safety Authority',
          date: '2025-10-15',
          url: 'https://www.rsa.ie/news-events/news',
          summary: 'Average waiting times for driving tests have decreased to 6-8 weeks nationwide.'
        },
        {
          id: 2,
          title: 'New Safety Guidance for Driving at Work',
          source: 'Health and Safety Authority',
          date: '2025-10-10',
          url: 'https://www.hsa.ie',
          summary: 'HSA, RSA and Gardaí issue comprehensive safety guidance for work-related driving.'
        },
        {
          id: 3,
          title: 'Transport Statistics Ireland 2025 Update',
          source: 'Central Statistics Office',
          date: '2025-10-05',
          url: 'https://www.cso.ie',
          summary: '92,030 driving test applications received in first four months of 2025.'
        },
        {
          id: 4,
          title: 'Changes to Driving Test Routes in Major Cities',
          source: 'RSA',
          date: '2025-09-28',
          url: 'https://www.rsa.ie',
          summary: 'Updated test routes announced for Dublin, Cork, Galway, and Limerick test centres.'
        }
      ];
      
      setDrivingNews(mockNews);
    };

    fetchDrivingNews();
  }, []);

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Generate chart data based on user's county
  const generateAreaChartData = () => {
    if (!areaStats) return [];
    
    return [
      { name: 'Total Learners', value: areaStats.totalLearners },
      { name: 'Pending Tests', value: areaStats.pendingTests },
      { name: 'Completed EDT', value: areaStats.completedEDT },
    ];
  };

  // Monthly performance data (you can fetch this from your database)
  const monthlyTestData = [
    { name: 'Jan', 'Tests': 40, 'Pass Rate %': 65 },
    { name: 'Feb', 'Tests': 30, 'Pass Rate %': 70 },
    { name: 'Mar', 'Tests': 55, 'Pass Rate %': 75 },
    { name: 'Apr', 'Tests': 45, 'Pass Rate %': 80 },
    { name: 'May', 'Tests': 60, 'Pass Rate %': 78 },
    { name: 'Jun', 'Tests': 75, 'Pass Rate %': 85 },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !userData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome back, {userData?.firstName || 'Learner'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your driving journey overview
        </Typography>
      </Box>

      {/* Personal Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="EDT Progress"
            value={`${userData?.edtProgress?.lessonsCompleted || 0}/12`}
            icon={<School />}
            color="#1976d2"
            subtitle={`${userData?.edtProgress?.lessonsRemaining || 12} lessons remaining`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Theory Test"
            value={userData?.theoryTest?.passed ? 'Passed' : 'Pending'}
            icon={<CheckCircle />}
            color={userData?.theoryTest?.passed ? '#2e7d32' : '#ed6c02'}
            subtitle={userData?.theoryTest?.certificateNumber || 'Not taken yet'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Test Status"
            value={userData?.drivingTest?.passed ? 'Passed' : userData?.drivingTest?.booked ? 'Booked' : 'Not Booked'}
            icon={<DirectionsCar />}
            color={userData?.drivingTest?.passed ? '#2e7d32' : '#1976d2'}
            subtitle={userData?.drivingTest?.testCentre || 'No test centre selected'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Transmission"
            value={userData?.transmissionPreference || 'Manual'}
            icon={<Speed />}
            color="#9c27b0"
            subtitle={`Category ${userData?.vehicleCategory || 'B'}`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming Lessons */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Upcoming Lessons
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {upcomingLessons.length > 0 ? (
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {upcomingLessons.map((lesson, index) => (
                  <React.Fragment key={lesson.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Event />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={lesson.type || 'EDT Lesson'}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {lesson.instructor || userData?.edtProgress?.instructorName}
                            </Typography>
                            {` — ${new Date(lesson.dateTime?.toDate()).toLocaleDateString('en-IE', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}`}
                          </>
                        }
                      />
                    </ListItem>
                    {index < upcomingLessons.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CalendarToday sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No upcoming lessons scheduled
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Contact your instructor to book lessons
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Area Statistics */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Your Area: {areaStats?.county || userData?.address?.county}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {areaStats ? (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h4" color="primary" fontWeight="bold">
                          {areaStats.totalLearners}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Learners
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                          {areaStats.passRate}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pass Rate
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h4" color="warning.main" fontWeight="bold">
                          {areaStats.pendingTests}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pending Tests
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" color="info.main" fontWeight="bold">
                          {areaStats.averageWaitTime}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg. Wait Time
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Alert severity="info" icon={<TrendingUp />}>
                  Test demand in {areaStats.county} is currently{' '}
                  {areaStats.pendingTests > 50 ? 'high' : 'moderate'}.
                  Book early to secure your preferred date!
                </Alert>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Loading area statistics...
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Driving News */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Article sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Driving News Ireland
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {drivingNews.map((news, index) => (
                <React.Fragment key={news.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Link href={news.url} target="_blank" rel="noopener" underline="hover" color="primary">
                          {news.title}
                        </Link>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="caption" color="text.secondary" display="block">
                            {news.source} • {new Date(news.date).toLocaleDateString('en-IE')}
                          </Typography>
                          <Typography component="span" variant="body2" color="text.primary">
                            {news.summary}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < drivingNews.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Monthly Performance Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              {areaStats?.county || 'National'} - Monthly Test Performance
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={monthlyTestData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" label={{ value: 'Tests', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Pass Rate %', angle: -90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Tests" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="Pass Rate %" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Area Distribution Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Area Overview
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={generateAreaChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {generateAreaChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
