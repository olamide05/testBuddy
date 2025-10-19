# utils/pdf.py
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import io

def generate_patient_report(patient_data: dict):
    """
    Generate comprehensive PDF report for patient.
    
    Args:
        patient_data: Dict containing:
            - cancer_type: str
            - location: str
            - pathways: list of dicts
            - drugs: list of dicts
            - trials: list of dicts
            - action_plan: list of str
    
    Returns:
        BytesIO buffer containing PDF
    """
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                           leftMargin=0.75*inch, rightMargin=0.75*inch,
                           topMargin=0.75*inch, bottomMargin=0.75*inch)
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2C7A7B'),  # Teal
        spaceAfter=12,
        alignment=TA_CENTER
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#2C7A7B'),
        spaceAfter=10,
        spaceBefore=12
    )
    body_style = styles['BodyText']
    
    # Build content
    story = []
    
    # Header
    story.append(Paragraph("PathwayPatient Report", title_style))
    story.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y')}", 
                          styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Patient info
    story.append(Paragraph("Your Information", heading_style))
    info_data = [
        ["Diagnosis:", patient_data['cancer_type']],
        ["Location:", patient_data['location']],
        ["Report Date:", datetime.now().strftime('%B %d, %Y')]
    ]
    info_table = Table(info_data, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E6FFFA')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.2*inch))
    
    # Panel 1: Biology
    story.append(Paragraph("1. What Makes Your Cancer Unique", heading_style))
    
    if patient_data.get('pathways'):
        pathway = patient_data['pathways'][0]
        story.append(Paragraph(f"<b>Key Pathway:</b> {pathway['name']}", body_style))
        story.append(Spacer(1, 0.1*inch))
        story.append(Paragraph(pathway['explanation'], body_style))
        story.append(Spacer(1, 0.1*inch))
        story.append(Paragraph(f"<i>Why this matters:</i> {pathway['why_matters']}", body_style))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Panel 2: Drugs
    story.append(Paragraph("2. Drugs That Target Your Biology", heading_style))
    
    if patient_data.get('drugs'):
        drug_data = [["Drug", "How It Works", "Status", "Targets"]]
        for drug in patient_data['drugs'][:5]:  # Limit to top 5
            drug_data.append([
                drug['name'],
                drug['mechanism'][:50] + "..." if len(drug['mechanism']) > 50 else drug['mechanism'],
                drug['status'],
                drug['targets']
            ])
        
        drug_table = Table(drug_data, colWidths=[1.5*inch, 2.5*inch, 1*inch, 1*inch])
        drug_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2C7A7B')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F7FAFC')])
        ]))
        story.append(drug_table)
    
    story.append(Spacer(1, 0.2*inch))
    
    # Panel 3: Trials
    story.append(Paragraph("3. Trials You Might Qualify For", heading_style))
    
    if patient_data.get('trials'):
        for i, trial in enumerate(patient_data['trials'][:3], 1):  # Top 3 trials
            story.append(Paragraph(f"<b>Trial {i}: {trial['nctId']}</b>", body_style))
            story.append(Paragraph(trial['title'], body_style))
            story.append(Spacer(1, 0.05*inch))
            
            story.append(Paragraph(f"<i>Location:</i> {trial['location']}", body_style))
            story.append(Paragraph(f"<i>Match Score:</i> {trial['match_score']}%", body_style))
            story.append(Paragraph(f"<i>Link:</i> clinicaltrials.gov/study/{trial['nctId']}", 
                                 body_style))
            story.append(Spacer(1, 0.15*inch))
    
    story.append(PageBreak())
    
    # Panel 4: Action Plan
    story.append(Paragraph("4. Your 30-Day Action Plan", heading_style))
    story.append(Spacer(1, 0.1*inch))
    
    if patient_data.get('action_plan'):
        for item in patient_data['action_plan']:
            story.append(Paragraph(f"• {item}", body_style))
            story.append(Spacer(1, 0.05*inch))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Disclaimer
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_LEFT
    )
    story.append(Paragraph(
        "<b>Disclaimer:</b> This report is for educational purposes only and does not constitute "
        "medical advice. Always consult with your healthcare provider before making treatment decisions. "
        "PathwayPatient is not a substitute for professional medical consultation.",
        disclaimer_style
    ))
    
    # Citations
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Data Sources", heading_style))
    citations = [
        "• Open Targets Platform (platform.opentargets.org)",
        "• ClinicalTrials.gov (clinicaltrials.gov)",
        "• Reactome Pathway Database (reactome.org)"
    ]
    for citation in citations:
        story.append(Paragraph(citation, styles['Normal']))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer


# Streamlit integration
def add_pdf_download_button(patient_data: dict):
    """
    Add download button to Streamlit app.
    """
    import streamlit as st
    
    pdf_buffer = generate_patient_report(patient_data)
    
    st.download_button(
        label="📄 Download PDF Summary",
        data=pdf_buffer,
        file_name=f"PathwayPatient_Report_{datetime.now().strftime('%Y%m%d')}.pdf",
        mime="application/pdf",
        type="primary"
    )


# Test PDF generation
if __name__ == "__main__":
    # Mock data
    mock_data = {
        'cancer_type': 'Triple-Negative Breast Cancer (TNBC), Stage II',
        'location': 'Dublin, Ireland',
        'pathways': [{
            'name': 'PI3K/AKT Pathway',
            'explanation': 'Your cancer cells use this pathway to receive growth signals...',
            'why_matters': 'Drugs blocking AKT are being tested in clinical trials...'
        }],
        'drugs': [
            {'name': 'Carboplatin', 'mechanism': 'Damages DNA in dividing cells', 
             'status': 'Approved', 'targets': 'DNA'},
            {'name': 'Pembrolizumab', 'mechanism': 'Blocks PD-1 (boosts immune system)', 
             'status': 'Phase III', 'targets': 'PD-1'},
            {'name': 'Capivasertib', 'mechanism': 'Blocks AKT (stops growth signals)', 
             'status': 'Phase II', 'targets': 'AKT'}
        ],
        'trials': [
            {'nctId': 'NCT02168825', 
             'title': 'Testing pembrolizumab + chemo for TNBC after surgery',
             'location': "St. James's Hospital, Dublin",
             'match_score': 95}
        ],
        'action_plan': [
            "Week 1: Review Panel 1 with your oncologist",
            "Week 2: Request biomarker testing (PD-L1, TMB)",
            "Week 3: Discuss trials from Panel 3",
            "Week 4: Contact trial coordinators"
        ]
    }
    
    # Generate PDF
    pdf_buffer = generate_patient_report(mock_data)
    
    # Save to file for testing
    with open("test_report.pdf", "wb") as f:
        f.write(pdf_buffer.read())
    
    print("✓ PDF generated: test_report.pdf")