import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
    Box, TextField, Button, Typography, Grid, Card, CardContent, CardMedia, 
    CircularProgress, Paper, Avatar, Divider, Chip, InputAdornment, Tooltip 
} from '@mui/material';
import { 
    Star, Place as PlaceIcon, Shield as ShieldIcon, ArrowBack, Search as SearchIcon, GroupAdd as UserPlus
} from '@mui/icons-material';

// --- No Results Component ---
const NoResults = ({ query }) => (
    <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 'bold' }}>No Instructors Found</Typography>
        <Typography color="text.secondary">
            {query ? `Your search for "${query}" did not match any of our instructors.` : 'No instructors available.'}
        </Typography>
    </Box>
);

// --- Instructor Profile View Component ---
// --- Instructor Profile View Component ---
const InstructorProfileView = ({ instructor, onBack }) => (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Button 
            variant="outlined" 
            startIcon={<ArrowBack />} 
            onClick={onBack} 
            sx={{ 
                mb: 3,
                borderRadius: 2,
                px: 3,
                '&:hover': {
                    transform: 'translateX(-4px)',
                    transition: 'all 0.3s'
                }
            }}
        >
            Back to Search
        </Button>

        <Paper 
            elevation={0} 
            sx={{ 
                borderRadius: 4, 
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider'
            }}
        >
            {/* Header Section with Gradient Background */}
            <Box 
                sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    p: 4,
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '100px',
                        background: 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))'
                    }
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center', zIndex: 1 }}>
                        <Avatar 
                            src={instructor.imageUrl} 
                            alt={instructor.name} 
                            sx={{ 
                                width: 180, 
                                height: 180, 
                                mx: 'auto', 
                                border: '5px solid white',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                            }}
                            imgProps={{
                                style: { objectFit: 'cover' }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={8} sx={{ zIndex: 1 }}>
                        <Typography 
                            variant="h3" 
                            fontWeight="bold" 
                            sx={{ color: 'white', mb: 1 }}
                        >
                            {instructor.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(255,255,255,0.2)', px: 2, py: 1, borderRadius: 2 }}>
                                <Star sx={{ color: '#ffd700' }} />
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {instructor.rating}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                    ({instructor.reviews} reviews)
                                </Typography>
                            </Box>
                            {instructor.qualifications?.includes("Garda Vetted") && (
                                <Chip 
                                    icon={<ShieldIcon />} 
                                    label="Garda Vetted" 
                                    sx={{ 
                                        bgcolor: 'rgba(76, 175, 80, 0.9)', 
                                        color: 'white',
                                        fontWeight: 'bold',
                                        '& .MuiChip-icon': { color: 'white' }
                                    }} 
                                />
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PlaceIcon sx={{ color: 'rgba(255,255,255,0.9)' }} />
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                {instructor.areas.join(", ")}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Content Section */}
            <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                    {/* About Me Section */}
                    <Grid item xs={12}>
                        <Card 
                            elevation={0} 
                            sx={{ 
                                bgcolor: 'grey.50', 
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Box 
                                        sx={{ 
                                            width: 4, 
                                            height: 24, 
                                            bgcolor: 'primary.main', 
                                            borderRadius: 1 
                                        }} 
                                    />
                                    <Typography variant="h5" fontWeight="bold">
                                        About Me
                                    </Typography>
                                </Box>
                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                    {instructor.bio}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Details Section */}
                    <Grid item xs={12} md={6}>
                        <Card 
                            elevation={0} 
                            sx={{ 
                                height: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <Box 
                                        sx={{ 
                                            width: 4, 
                                            height: 24, 
                                            bgcolor: 'primary.main', 
                                            borderRadius: 1 
                                        }} 
                                    />
                                    <Typography variant="h5" fontWeight="bold">
                                        Details
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" fontWeight="bold">
                                            Pass Rate
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <Box 
                                                sx={{ 
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: 8,
                                                    bgcolor: 'grey.200',
                                                    borderRadius: 1,
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <Box 
                                                    sx={{ 
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: 0,
                                                        height: '100%',
                                                        width: `${instructor.passRate}%`,
                                                        bgcolor: 'success.main',
                                                        borderRadius: 1,
                                                        transition: 'width 0.5s ease'
                                                    }} 
                                                />
                                            </Box>
                                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                                {instructor.passRate}%
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography variant="overline" color="text.secondary" fontWeight="bold">
                                            Areas Covered
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                            {instructor.areas.map(area => (
                                                <Chip 
                                                    key={area}
                                                    label={area} 
                                                    size="medium"
                                                    icon={<PlaceIcon />}
                                                    sx={{ 
                                                        bgcolor: 'primary.50',
                                                        fontWeight: 500
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography variant="overline" color="text.secondary" fontWeight="bold">
                                            Qualifications
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                            {instructor.qualifications.map(q => (
                                                <Chip 
                                                    key={q} 
                                                    label={q} 
                                                    size="medium" 
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ fontWeight: 500 }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Availability Section */}
                    <Grid item xs={12} md={6}>
                        <Card 
                            elevation={0} 
                            sx={{ 
                                height: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <Box 
                                        sx={{ 
                                            width: 4, 
                                            height: 24, 
                                            bgcolor: 'primary.main', 
                                            borderRadius: 1 
                                        }} 
                                    />
                                    <Typography variant="h5" fontWeight="bold">
                                        Next 7 Days Availability
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {instructor.availability && instructor.availability.length > 0 ? (
                                        instructor.availability
                                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                                            .map(slot => (
                                                <Box 
                                                    key={`${slot.date}-${slot.time}`}
                                                    sx={{ 
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        p: 2,
                                                        bgcolor: slot.free ? 'success.50' : 'grey.100',
                                                        borderRadius: 2,
                                                        border: '1px solid',
                                                        borderColor: slot.free ? 'success.200' : 'grey.300'
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography variant="body1" fontWeight="bold">
                                                            {slot.date}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {slot.time}
                                                        </Typography>
                                                    </Box>
                                                    <Chip 
                                                        label={slot.free ? 'Available' : 'Booked'} 
                                                        color={slot.free ? 'success' : 'error'} 
                                                        size="small"
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                </Box>
                                            ))
                                    ) : (
                                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                            No availability information found.
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    </Box>
);



// --- Main Instructors Page Component ---
export default function InstructorsPage({ onRegisterClick }) {
    const [allInstructors, setAllInstructors] = useState([]);
    const [filteredInstructors, setFilteredInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [selectedInstructor, setSelectedInstructor] = useState(null);

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const instructorsCollection = collection(db, 'instructorInfo');
                const instructorSnapshot = await getDocs(instructorsCollection);
                const instructorList = await Promise.all(instructorSnapshot.docs.map(async (docSnap) => {
                    const instructorData = docSnap.data();
                    const availabilityCollection = collection(docSnap.ref, 'availability');
                    const availabilitySnapshot = await getDocs(availabilityCollection);
                    const availability = availabilitySnapshot.docs.map(d => d.data());
                    return { id: docSnap.id, ...instructorData, availability };
                }));
                setAllInstructors(instructorList);
                setFilteredInstructors(instructorList);
            } catch (error) {
                console.error("Error fetching instructors:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstructors();
    }, []);

    useEffect(() => {
        if (!query) {
            setFilteredInstructors(allInstructors);
            return;
        }
        const lowercasedQuery = query.toLowerCase();
        const results = allInstructors.filter(
            (inst) =>
                inst.name.toLowerCase().includes(lowercasedQuery) ||
                (inst.areas && inst.areas.some((a) => a.toLowerCase().includes(lowercasedQuery)))
        );
        setFilteredInstructors(results);
    }, [query, allInstructors]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (selectedInstructor) {
        return <InstructorProfileView instructor={selectedInstructor} onBack={() => setSelectedInstructor(null)} />;
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Find an Instructor</Typography>
                    <Typography color="text.secondary">Search for the perfect instructor to guide you on your journey.</Typography>
                </Box>
                <Button onClick={onRegisterClick} variant="contained" disableElevation startIcon={<UserPlus />}>
                    Become an Instructor
                </Button>
            </Box>

            {/* Search Bar */}
            <TextField
                fullWidth
                placeholder="Search by name or area..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ mb: 4 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

            {/* ✅ FIXED: 3 COLUMNS WITH EQUAL HEIGHT CARDS AND UNIFORM IMAGE SIZES */}
            {filteredInstructors.length > 0 ? (
                <Grid container spacing={3}>
                    {filteredInstructors.map((instructor) => (
                        <Grid 
                            item 
                            xs={12} 
                            sm={6} 
                            md={4} 
                            key={instructor.id}
                            sx={{ display: 'flex' }}
                        >
                            <Card sx={{ 
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4
                                }
                            }}>
                                {/* ✅ FIXED: Image with fixed height and proper object-fit */}
                                <CardMedia
                                    component="img"
                                    height="240"
                                    image={instructor.imageUrl}
                                    alt={instructor.name}
                                    sx={{ 
                                        objectFit: 'cover',
                                        height: '240px',
                                        width: '100%'
                                    }}
                                />
                                <CardContent sx={{ 
                                    flexGrow: 1, 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    p: 2.5 
                                }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                                        {instructor.name}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                                        <Star fontSize="small" sx={{ color: 'gold' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {instructor.rating} ({instructor.reviews} reviews)
                                        </Typography>
                                    </Box>

                                    {instructor.qualifications?.includes("Garda Vetted") && (
                                        <Chip 
                                            icon={<ShieldIcon />} 
                                            label="Garda Vetted" 
                                            size="small" 
                                            color="success" 
                                            variant="outlined" 
                                            sx={{ mb: 2, width: 'fit-content' }} 
                                        />
                                    )}

                                                                          {/* ✅ FIXED: Bio text with character limit and tooltip on hover */}
                                     {/* ✅ FIXED: 20-character limit with full text tooltip on hover */}
<Tooltip 
    title={instructor.bio} 
    arrow
    placement="top"
    enterDelay={300}
>
    <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
            mb: 2, 
            flexGrow: 1,
            cursor: 'pointer'
        }}
    >
        {instructor.bio.length > 20 
            ? `${instructor.bio.substring(0, 20)}...` 
            : instructor.bio
        }
    </Typography>
</Tooltip>



                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                                        <PlaceIcon fontSize="small" color="action" />
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            noWrap
                                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                                        >
                                            {instructor.areas.join(", ")}
                                        </Typography>
                                    </Box>

                                    <Button 
                                        variant="contained" 
                                        fullWidth 
                                        onClick={() => setSelectedInstructor(instructor)}
                                        sx={{ mt: 'auto' }}
                                    >
                                        View Profile
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <NoResults query={query} />
            )}
        </Box>
    );
}
