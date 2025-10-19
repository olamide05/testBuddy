import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import { DirectionsCar, School, SwapHoriz, MonetizationOn, CheckCircle, Assignment, Assessment } from '@mui/icons-material';

const TESTBUDDY_COLOR = '#17a2b8';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${TESTBUDDY_COLOR} 0%, #138496 100%)`,
          color: 'white',
          py: 12,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 2,
                textShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              🚗 TestBuddy
            </Typography>
          </Box>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 2, 
              fontWeight: 600,
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            Your Complete Driving Journey Starts Here
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 5, 
              opacity: 0.95,
              fontWeight: 400,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            Book driving tests, swap appointments, learn theory, find instructors, and get insurance deals - all in one place
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate('/login')}
            sx={{ 
              bgcolor: 'white', 
              color: TESTBUDDY_COLOR,
              px: 5,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 700,
              borderRadius: '50px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              textTransform: 'none',
              '&:hover': { 
                bgcolor: 'grey.100',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.25)'
              },
              transition: 'all 0.3s'
            }}
          >
            Get Started Free
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          align="center" 
          gutterBottom 
          fontWeight="bold" 
          sx={{ 
            mb: 2,
            color: TESTBUDDY_COLOR
          }}
        >
          Everything You Need to Pass Your Test
        </Typography>
        <Typography 
          variant="body1" 
          align="center" 
          color="text.secondary" 
          sx={{ mb: 6, maxWidth: '600px', mx: 'auto' }}
        >
          TestBuddy provides all the tools and resources you need for a successful driving journey in Ireland
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6} lg={3}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center', 
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 8px 24px ${TESTBUDDY_COLOR}40`
                }
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${TESTBUDDY_COLOR}20`,
                  mx: 'auto',
                  mb: 2
                }}
              >
                <DirectionsCar sx={{ fontSize: 40, color: TESTBUDDY_COLOR }} />
              </Box>
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
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center', 
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 8px 24px ${TESTBUDDY_COLOR}40`
                }
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${TESTBUDDY_COLOR}20`,
                  mx: 'auto',
                  mb: 2
                }}
              >
                <SwapHoriz sx={{ fontSize: 40, color: TESTBUDDY_COLOR }} />
              </Box>
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
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center', 
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 8px 24px ${TESTBUDDY_COLOR}40`
                }
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${TESTBUDDY_COLOR}20`,
                  mx: 'auto',
                  mb: 2
                }}
              >
                <School sx={{ fontSize: 40, color: TESTBUDDY_COLOR }} />
              </Box>
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
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center', 
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 8px 24px ${TESTBUDDY_COLOR}40`
                }
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${TESTBUDDY_COLOR}20`,
                  mx: 'auto',
                  mb: 2
                }}
              >
                <Assignment sx={{ fontSize: 40, color: TESTBUDDY_COLOR }} />
              </Box>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Find Instructors
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connect with verified ADI instructors in your area
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Why Choose Us Section */}
        <Box 
          sx={{ 
            background: `linear-gradient(135deg, ${TESTBUDDY_COLOR}10 0%, ${TESTBUDDY_COLOR}05 100%)`,
            p: 6, 
            borderRadius: 4, 
            mb: 8,
            border: `1px solid ${TESTBUDDY_COLOR}20`
          }}
        >
          <Typography 
            variant="h4" 
            align="center" 
            gutterBottom 
            fontWeight="bold" 
            sx={{ mb: 5, color: TESTBUDDY_COLOR }}
          >
            Why Choose TestBuddy?
          </Typography>
          <Grid container spacing={3}>
            {[
              'Real-time test availability across all centers in Ireland',
              'Secure test swap marketplace with verified users',
              'Verified ADI driving instructors',
              'Comprehensive theory test practice materials',
              'Best insurance deals for learners and new drivers',
              'Mobile-friendly platform accessible anywhere'
            ].map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: TESTBUDDY_COLOR,
                      flexShrink: 0
                    }}
                  >
                    <CheckCircle sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    {feature}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${TESTBUDDY_COLOR} 0%, #138496 100%)`,
            color: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}
        >
          <Typography variant="h3" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
            Ready to Start Your Driving Journey?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.95, maxWidth: '600px', mx: 'auto' }}>
            Join thousands of learners across Ireland who have passed their test with TestBuddy
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/login')}
            sx={{ 
              bgcolor: 'white',
              color: TESTBUDDY_COLOR,
              px: 5, 
              py: 2, 
              fontSize: '1.2rem',
              fontWeight: 700,
              borderRadius: '50px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'grey.100',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.25)'
              },
              transition: 'all 0.3s'
            }}
          >
            Create Free Account →
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box 
        sx={{ 
          bgcolor: '#2c3e50',
          color: 'white',
          py: 4,
          mt: 8,
          textAlign: 'center'
        }}
      >
        <Container>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            🚗 TestBuddy
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2025 TestBuddy. Your complete driving test companion in Ireland.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
