import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Divider,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function BecomeInstructorPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    rsaNumber: '',
    drivingLicence: null,
    rsaCertificate: null,
    drivingRecord: null,
    declaration: false,
  });

  const [errors, setErrors] = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRemoveFile = (field) => {
    setFormData({ ...formData, [field]: null });
  };

  const validate = () => {
    const newErrors = {};

    if (formData.fullName.trim().length < 2)
      newErrors.fullName = 'Full name must be at least 2 characters.';
    if (!formData.email.includes('@'))
      newErrors.email = 'Please enter a valid email address.';
    if (!formData.rsaNumber.trim())
      newErrors.rsaNumber = 'RSA certification number is required.';

    const fileChecks = [
      { key: 'drivingLicence', label: 'Driving Licence' },
      { key: 'rsaCertificate', label: 'RSA Certificate' },
    ];

    fileChecks.forEach(({ key, label }) => {
      const file = formData[key]?.[0];
      if (!file) {
        newErrors[key] = `${label} is required.`;
      } else if (file.size > MAX_FILE_SIZE) {
        newErrors[key] = `${label} must be smaller than 5MB.`;
      } else if (!ACCEPTED_TYPES.includes(file.type)) {
        newErrors[key] = `${label} must be .jpg, .jpeg, .png, or .pdf.`;
      }
    });

    const optionalRecord = formData.drivingRecord?.[0];
    if (optionalRecord) {
      if (optionalRecord.size > MAX_FILE_SIZE)
        newErrors.drivingRecord = 'Driving Record must be smaller than 5MB.';
      else if (!ACCEPTED_TYPES.includes(optionalRecord.type))
        newErrors.drivingRecord = 'Only .jpg, .jpeg, .png, or .pdf allowed.';
    }

    if (!formData.declaration)
      newErrors.declaration = 'You must confirm this declaration to proceed.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submission = {
      ...formData,
      declarationTimestamp: new Date().toISOString(),
    };

    console.log('Submitted Instructor Data:', submission);
    setSuccessOpen(true);

    // Reset form
    setFormData({
      fullName: '',
      email: '',
      rsaNumber: '',
      drivingLicence: null,
      rsaCertificate: null,
      drivingRecord: null,
      declaration: false,
    });
    setErrors({});
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Become an Instructor
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Join our platform and start connecting with learner drivers today.
      </Typography>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardHeader
          title="Instructor Application"
          subheader="By creating an instructor account, you consent to the verification of your RSA certification and driving record (where legally permitted)."
        />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* --- Basic Info --- */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="RSA ADI Number"
                  name="rsaNumber"
                  value={formData.rsaNumber}
                  onChange={handleChange}
                  error={!!errors.rsaNumber}
                  helperText={errors.rsaNumber || 'Your Approved Driving Instructor number from the RSA.'}
                />
              </Grid>

              {/* --- Document Upload Section --- */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Document Upload
                </Typography>
              </Grid>

              {/* Driving Licence Upload */}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Driving Licence
                  <input
                    type="file"
                    hidden
                    name="drivingLicence"
                    onChange={handleChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                </Button>

                {/* ✅ Show uploaded file chip */}
                {formData.drivingLicence && formData.drivingLicence[0] && (
                  <Chip
                    label={`${formData.drivingLicence[0].name} uploaded`}
                    color="success"
                    variant="outlined"
                    size="small"
                    onDelete={() => handleRemoveFile('drivingLicence')}
                    sx={{ mt: 1 }}
                  />
                )}

                {errors.drivingLicence && (
                  <Typography color="error" variant="body2">{errors.drivingLicence}</Typography>
                )}
              </Grid>

              {/* RSA Certificate Upload */}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                >
                  Upload RSA Certificate
                  <input
                    type="file"
                    hidden
                    name="rsaCertificate"
                    onChange={handleChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                </Button>

                {/* ✅ Show uploaded file chip */}
                {formData.rsaCertificate && formData.rsaCertificate[0] && (
                  <Chip
                    label={`${formData.rsaCertificate[0].name} uploaded`}
                    color="success"
                    variant="outlined"
                    size="small"
                    onDelete={() => handleRemoveFile('rsaCertificate')}
                    sx={{ mt: 1 }}
                  />
                )}

                {errors.rsaCertificate && (
                  <Typography color="error" variant="body2">{errors.rsaCertificate}</Typography>
                )}
              </Grid>

              {/* Driving Record Upload (Optional) */}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Driving Record (Optional)
                  <input
                    type="file"
                    hidden
                    name="drivingRecord"
                    onChange={handleChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                </Button>

                {/* ✅ Show uploaded file chip */}
                {formData.drivingRecord && formData.drivingRecord[0] && (
                  <Chip
                    label={`${formData.drivingRecord[0].name} uploaded`}
                    color="success"
                    variant="outlined"
                    size="small"
                    onDelete={() => handleRemoveFile('drivingRecord')}
                    sx={{ mt: 1 }}
                  />
                )}

                {errors.drivingRecord && (
                  <Typography color="error" variant="body2">{errors.drivingRecord}</Typography>
                )}
              </Grid>

              {/* Declaration */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.declaration}
                      name="declaration"
                      onChange={handleChange}
                    />
                  }
                  label="I declare I have no active penalty points or pending warrants related to driving."
                />
                {errors.declaration && (
                  <Typography color="error" variant="body2">{errors.declaration}</Typography>
                )}
              </Grid>

              {/* Submit */}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" fullWidth size="large">
                  Submit Application
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Snackbar Confirmation */}
      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessOpen(false)}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Registration submitted! Your application is under review.
        </Alert>
      </Snackbar>
    </Box>
  );
}
