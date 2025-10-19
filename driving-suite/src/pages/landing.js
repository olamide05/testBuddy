import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { DirectionsCar, School, SwapHoriz, MonetizationOn, CheckCircle } from '@mui/icons-material';

export default function LandingPage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
          borderRadius: 2,
          mb: 6
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Your Complete Driving Journey Starts Here
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Book driving tests, swap appointments, learn theory, find instructors, and get insurance deals - all in one place
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            Get Started Free
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold" sx={{ mb: 5 }}>
          Everything You Need to Pass Your Test
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <DirectionsCar sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Find & Book Tests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Search available driving test slots across Ireland and book instantly
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <SwapHoriz sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Test Swap Market
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Trade test appointments with other learners to get your preferred date
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <School sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Theory & Simulator
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Practice theory tests and driving simulators to build confidence
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <MonetizationOn sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Insurance Deals
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Compare and save on learner and new driver insurance policies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Why Choose Us Section */}
        <Box sx={{ bgcolor: 'grey.50', p: 5, borderRadius: 2, mb: 6 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
            Why Choose DriveNow?
          </Typography>
          <Grid container spacing={3}>
            {[
              'Real-time test availability across all centers',
              'Secure test swap marketplace',
              'Verified driving instructors',
              'Comprehensive theory test practice',
              'Best insurance deals for learners',
              'Mobile-friendly platform'
            ].map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 30 }} />
                  <Typography variant="body1">{feature}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Ready to Start Your Driving Journey?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Join thousands of learners who have passed their test with DriveNow
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
          >
            Create Free Account
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
