import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Paper,
    Avatar,
    Divider,
    Chip,
    InputAdornment,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
} from "@mui/material";
import {
    Star,
    Place as PlaceIcon,
    Shield as ShieldIcon,
    ArrowBack,
    Search as SearchIcon,
    GroupAdd as UserPlus,
    Close as CloseIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";



//  No Results Component
const NoResults = ({ query }) => (
    <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 8 }}>
        <Typography variant="h6" sx={{ mt: 3, fontWeight: "bold" }}>
            No Instructors Found
        </Typography>
        <Typography color="text.secondary">
            {query ? `Your search for "${query}" did not match any of our instructors.` : "No instructors available."}
        </Typography>
    </Box>
);

// --- Booking Modal (reused in Profile) ---
function BookingDialog({ open, onClose, instructor, slot, refresh, dbUser }) {
    const [location, setLocation] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

    useEffect(() => {
        if (!open) {
            setLocation("");
            setSubmitting(false);
        }
    }, [open]);

    const handleConfirm = async () => {
        if (!dbUser || !slot || !instructor) {
            setSnack({ open: true, severity: "error", message: "You must be signed in to book." });
            return;
        }
        if (!location.trim()) {
            setSnack({ open: true, severity: "error", message: "Please enter a location." });
            return;
        }

        setSubmitting(true);
        try {
            // add booking
            await addDoc(collection(db, "bookings"), {
                instructorId: instructor.id,
                instructorName: instructor.name,
                studentId: dbUser.uid,
                studentName: `${dbUser.firstName || ""} ${dbUser.lastName || ""}`.trim(),
                studentEmail: dbUser.email || "",
                date: slot.date, // use slot.date and slot.time (you said you store time as string)
                time: slot.time,
                location,
                createdAt: serverTimestamp(),
            });

            // update availability slot to booked
            const slotRef = doc(db, "instructorInfo", instructor.id, "availability", slot.id);
            await updateDoc(slotRef, { free: false });

            setSnack({ open: true, severity: "success", message: "Booking confirmed!" });
            refresh && refresh(); // refresh instructor data in parent
            onClose();
        } catch (err) {
            console.error("Booking error:", err);
            setSnack({ open: true, severity: "error", message: "Booking failed — try again." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>Confirm Booking</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
                        <Avatar src={instructor?.imageUrl} alt={instructor?.name} sx={{ width: 56, height: 56 }} />
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{instructor?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {slot ? `${dayjs(slot.date).format("MMM DD, YYYY")} • ${slot.time}` : ""}
                            </Typography>
                        </Box>
                    </Box>

                    <TextField
                        label="Location"
                        placeholder="E.g. 12 Main St, Dublin"
                        fullWidth
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Your name"
                        fullWidth
                        value={dbUser ? `${dbUser.firstName || ""} ${dbUser.lastName || ""}`.trim() : ""}
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Email"
                        fullWidth
                        value={dbUser?.email || ""}
                        InputProps={{ readOnly: true }}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button variant="contained" onClick={handleConfirm} disabled={submitting}>
                        {submitting ? "Booking..." : "Confirm Booking"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} sx={{ width: "100%" }}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </>
    );
}

//  Instructor Profile View (OG-inspired layout, cleaned)
const InstructorProfileView = ({ instructor, onBack, refreshInstructors, dbUser }) => {
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const openBooking = (slot) => {
        setSelectedSlot(slot);
        setDialogOpen(true);
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 2 }}>
            <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={onBack}
                sx={{
                    mb: 3,
                    borderRadius: 2,
                    px: 3,
                    '&:hover': { transform: 'translateX(-4px)', transition: 'all 0.3s' }
                }}
            >
                Back to Search
            </Button>

            <Paper elevation={0} sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>

                <Box sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    p: 4,
                    position: "relative",
                }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={4} sx={{ textAlign: "center", zIndex: 1 }}>
                            <Avatar src={instructor.imageUrl} alt={instructor.name} sx={{ width: 180, height: 180, mx: "auto", border: "5px solid white" }} />
                        </Grid>

                        <Grid item xs={12} md={8} sx={{ zIndex: 1 }}>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: "white", mb: 1 }}>{instructor.name}</Typography>
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2, alignItems: "center" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "rgba(255,255,255,0.18)", px: 2, py: 1, borderRadius: 2 }}>
                                    <Star sx={{ color: "#ffd700" }} />
                                    <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>{instructor.rating}</Typography>
                                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>({instructor.reviews} reviews)</Typography>
                                </Box>

                                {instructor.qualifications?.includes("Garda Vetted") && (
                                    <Chip icon={<ShieldIcon />} label="Garda Vetted" sx={{ bgcolor: "rgba(76,175,80,0.9)", color: "white", fontWeight: "bold" }} />
                                )}
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <PlaceIcon sx={{ color: "rgba(255,255,255,0.9)" }} />
                                <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)" }}>{(instructor.areas || []).join(", ")}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* content */}
                <Box sx={{ p: 4 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Card elevation={0} sx={{ bgcolor: "grey.50", border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                        <Box sx={{ width: 4, height: 24, bgcolor: "primary.main", borderRadius: 1 }} />
                                        <Typography variant="h5" fontWeight="bold">About Me</Typography>
                                    </Box>
                                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>{instructor.bio}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                        <Box sx={{ width: 4, height: 24, bgcolor: "primary.main", borderRadius: 1 }} />
                                        <Typography variant="h5" fontWeight="bold">Availability</Typography>
                                    </Box>

                                    {/* Calendar - highlight days with availability */}
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateCalendar
                                            value={dayjs()}
                                            slots={{
                                                day: (dayProps) => {
                                                    const dateStr = dayProps.day.format("YYYY-MM-DD");
                                                    const dayAvailability = (instructor.availability || []).filter(s => s.date === dateStr);
                                                    const hasAvailability = dayAvailability.length > 0;
                                                    const hasFreeSlots = dayAvailability.some(s => s.free);
                                                    const allBooked = hasAvailability && !hasFreeSlots;

                                                    return (
                                                        <Tooltip title={
                                                            hasAvailability
                                                                ? dayAvailability.map(s => `${s.time} - ${s.free ? 'Available' : 'Booked'}`).join(", ")
                                                                : "No availability"
                                                        } arrow>
                                                            <PickersDay
                                                                {...dayProps}
                                                                sx={{
                                                                    ...(hasFreeSlots && {
                                                                        bgcolor: 'success.100',
                                                                        color: 'success.dark',
                                                                        fontWeight: 'bold',
                                                                        border: '2px solid',
                                                                        borderColor: 'success.main',
                                                                        '&:hover': { bgcolor: 'success.200' }
                                                                    }),
                                                                    ...(allBooked && {
                                                                        bgcolor: 'error.50',
                                                                        color: 'error.main',
                                                                        opacity: 0.6,
                                                                        '&:hover': { bgcolor: 'error.100' }
                                                                    })
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    );
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>Upcoming Slots</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 240, overflowY: 'auto' }}>
                                        { (instructor.availability || [])
                                            .sort((a,b) => new Date(a.date) - new Date(b.date))
                                            .slice(0, 8)
                                            .map(slot => (
                                                <Box key={slot.id} sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    p: 1.5,
                                                    bgcolor: slot.free ? 'success.50' : 'grey.100',
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: slot.free ? 'success.200' : 'grey.300'
                                                }}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">{dayjs(slot.date).format('MMM DD, YYYY')}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{slot.time}</Typography>
                                                    </Box>
                                                    { slot.free ? (
                                                        <Button size="small" variant="contained" onClick={() => { setSelectedSlot(slot); setDialogOpen(true); }}>
                                                            Book Now
                                                        </Button>
                                                    ) : (
                                                        <Chip label="Booked" color="error" size="small" />
                                                    )}
                                                </Box>
                                            )) }
                                    </Box>
                                </CardContent>
                            </Card>

                            <BookingDialog
                                open={dialogOpen}
                                onClose={() => { setDialogOpen(false); setSelectedSlot(null); }}
                                instructor={instructor}
                                slot={selectedSlot}
                                refresh={refreshInstructors}
                                dbUser={dbUser}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};

// Main Instructors Page
export default function InstructorsPage({ onRegisterClick }) {
    const [allInstructors, setAllInstructors] = useState([]);
    const [filteredInstructors, setFilteredInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [dbUser, setDbUser] = useState(null);
    const navigate = useNavigate();

    // fetch current user info from users/{uid}
    const fetchCurrentUserData = async () => {
        try {
            const user = auth.currentUser;
            if (!user) { setDbUser(null); return; }
            const uRef = doc(db, "users", user.uid);
            const uSnap = await getDoc(uRef);
            if (uSnap.exists()) {
                setDbUser({ uid: user.uid, ...uSnap.data() });
            } else {
                setDbUser({ uid: user.uid, firstName: "", lastName: "", email: user.email || "" });
            }
        } catch (err) {
            console.error("fetchCurrentUserData:", err);
        }
    };

    // fetch instructors + availability
    const fetchInstructors = async () => {
        setLoading(true);
        try {
            const instructorsCollection = collection(db, "instructorInfo");
            const instructorSnapshot = await getDocs(instructorsCollection);
            const instructorList = await Promise.all(instructorSnapshot.docs.map(async (docSnap) => {
                const instructorData = docSnap.data();
                const availabilityCollection = collection(docSnap.ref, "availability");
                const availabilitySnapshot = await getDocs(availabilityCollection);
                const availability = availabilitySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
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

    useEffect(() => {
        fetchInstructors();
        fetchCurrentUserData();

        const unsub = auth.onAuthStateChanged(() => {
            fetchCurrentUserData();
        });
        return () => unsub();
    }, []);

    // filter
    useEffect(() => {
        if (!query) {
            setFilteredInstructors(allInstructors);
            return;
        }
        const lowercasedQuery = query.toLowerCase();
        const results = allInstructors.filter(inst =>
            inst.name.toLowerCase().includes(lowercasedQuery) ||
            (inst.areas && inst.areas.some(a => a.toLowerCase().includes(lowercasedQuery)))
        );
        setFilteredInstructors(results);
    }, [query, allInstructors]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    // refresh function for child to re-fetch after booking
    const refreshInstructors = async () => {
        await fetchInstructors();
    };

    if (selectedInstructor) {
        return <InstructorProfileView instructor={selectedInstructor} onBack={() => setSelectedInstructor(null)} refreshInstructors={refreshInstructors} dbUser={dbUser} />;
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Find an Instructor</Typography>
                    <Typography color="text.secondary">Search for the perfect instructor to guide you on your journey.</Typography>
                </Box>
                <Button variant="contained" disableElevation startIcon={<UserPlus />} onClick={() => navigate('/become-instructor')}>
                    Become an Instructor
                </Button>
            </Box>

            {/* Search bar */}
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

            {/* Grid of uniform cards */}
            {filteredInstructors.length > 0 ? (
                <Grid container spacing={3}>
                    {filteredInstructors.map(instructor => (
                        <Grid item xs={12} sm={6} md={4} key={instructor.id} sx={{ display: 'flex' }}>
                            <Card sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                            }}>
                                {/* fixed-height image for uniformity */}
                                <CardMedia
                                    component="img"
                                    height="220"
                                    image={instructor.imageUrl}
                                    alt={instructor.name}
                                    sx={{ objectFit: 'cover', height: 220, width: '100%' }}
                                />

                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2.5 }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>{instructor.name}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                            <Star fontSize="small" sx={{ color: 'gold' }} />
                                            <Typography variant="body2" color="text.secondary">{instructor.rating} ({instructor.reviews} reviews)</Typography>
                                        </Box>

                                        {instructor.qualifications?.includes("Garda Vetted") && (
                                            <Chip icon={<ShieldIcon />} label="Garda Vetted" size="small" color="success" variant="outlined" sx={{ mb: 1, width: 'fit-content' }} />
                                        )}

                                        <Tooltip title={instructor.bio} arrow placement="top" enterDelay={300}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, cursor: 'pointer' }}>
                                                {instructor.bio?.length > 60 ? `${instructor.bio.substring(0, 60)}...` : instructor.bio}
                                            </Typography>
                                        </Tooltip>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <PlaceIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {instructor.areas?.join(", ")}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setSelectedInstructor(instructor)}>
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
