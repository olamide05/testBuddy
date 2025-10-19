import React from 'react';
import { Box, Grid, Paper, Typography, Card, Avatar } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DirectionsCar, CheckCircle, HourglassEmpty } from '@mui/icons-material';

// --- Sample Data for Charts ---
const monthlyTestData = [
  { name: 'Jan', 'Tests Taken': 40, 'Pass Rate %': 65 },
  { name: 'Feb', 'Tests Taken': 30, 'Pass Rate %': 70 },
  { name: 'Mar', 'Tests Taken': 55, 'Pass Rate %': 75 },
  { name: 'Apr', 'Tests Taken': 45, 'Pass Rate %': 80 },
  { name: 'May', 'Tests Taken': 60, 'Pass Rate %': 78 },
  { name: 'Jun', 'Tests Taken': 75, 'Pass Rate %': 85 },
];

const passFailData = [
  { name: 'Passed', value: 850 },
  { name: 'Failed', value: 350 },
];

// --- Reusable Stat Card Component ---
const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
    <Avatar sx={{ bgcolor: color, width: 56, height: 56, mr: 2 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="h6" color="text.secondary">{title}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </Box>
  </Card>
);

// --- Main Dashboard Component ---
export default function MainPage() {
  return (
    <Box sx={{ p: 3, bgcolor: '#f4f6f8' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Driving Test Dashboard
      </Typography>
      
      {/* Stat Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Tests Booked" value="1,200" icon={<DirectionsCar />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Tests Passed" value="850" icon={<CheckCircle />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Pending Tests" value="350" icon={<HourglassEmpty />} color="#ed6c02" />
        </Grid>
      </Grid>
      
      {/* Charts Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Monthly Test Performance
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={monthlyTestData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" label={{ value: 'Tests Taken', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Pass Rate %', angle: -90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Tests Taken" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="Pass Rate %" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Pass vs. Fail
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={passFailData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={60} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Total"/>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
