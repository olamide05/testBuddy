import streamlit as st
import plotly.graph_objects as go
from datetime import datetime, timedelta

st.set_page_config(
    page_title="TestBuddy IE - Get Test-Ready Faster",
    page_icon="🚗",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS - Irish-themed, modern
st.markdown("""
<style>
    /* Main layout */
    .main {background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);}
    
    /* Headers */
    .main-header {
        font-size: 3.2rem; 
        font-weight: 800;
        color: #065f46;
        text-align: center; 
        margin-top: 0;
        margin-bottom: 0.5rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    .subtitle {
        text-align: center; 
        color: #475569; 
        font-size: 1.3rem;
        margin-bottom: 2rem;
        font-weight: 400;
    }
    
    /* Hero stats */
    .hero-stat {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        border-left: 4px solid #10b981;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        margin-bottom: 1rem;
    }
    .hero-stat-number {
        font-size: 2.5rem;
        font-weight: 700;
        color: #065f46;
        margin: 0;
    }
    .hero-stat-label {
        font-size: 0.95rem;
        color: #64748b;
        margin-top: 0.3rem;
    }
    
    /* Feature cards */
    .card {
        padding: 1.8rem;
        border: 2px solid #d1fae5;
        border-radius: 16px;
        background: white;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
        transition: all 0.3s ease;
        height: 100%;
        min-height: 180px;
    }
    .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
        border-color: #10b981;
    }
    .card-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        display: block;
    }
    .card-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: #065f46;
        margin-bottom: 0.8rem;
    }
    .card-text {
        color: #475569;
        line-height: 1.6;
        font-size: 1rem;
    }
    
    /* Problem/solution boxes */
    .problem-box {
        background: #fef2f2;
        border-left: 4px solid #ef4444;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
    }
    .solution-box {
        background: #f0fdf4;
        border-left: 4px solid #10b981;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
    }
    
    /* Call to action */
    .cta-box {
        background: linear-gradient(135deg, #065f46 0%, #047857 100%);
        color: white;
        padding: 2rem;
        border-radius: 16px;
        text-align: center;
        margin: 2rem 0;
        box-shadow: 0 8px 24px rgba(6, 95, 70, 0.3);
    }
    .cta-text {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }
    
    /* Sidebar styling */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #065f46 0%, #047857 100%);
    }
    [data-testid="stSidebar"] * {
        color: white !important;
    }
    
    /* Testimonial */
    .testimonial {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        border-left: 4px solid #f59e0b;
        font-style: italic;
        color: #475569;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'initialized' not in st.session_state:
    st.session_state.initialized = True
    st.session_state.user_name = None
    st.session_state.test_centre = None
    st.session_state.current_wait_weeks = None
    st.session_state.xp = 0
    st.session_state.sessions = 0
    st.session_state.readiness = 0
    st.session_state.badges = []

# Sidebar
with st.sidebar:
    st.markdown("## 🚗 TestBuddy IE")
    st.caption("Get test-ready faster — ethically.")
    st.markdown("---")
    
    # User profile (quick setup)
    st.markdown("### Quick Setup")
    user_name = st.text_input("Your name (optional)", value=st.session_state.get('user_name', ''))
    if user_name:
        st.session_state.user_name = user_name
    
    test_centre = st.selectbox(
        "Preferred test centre",
        ["", "Tallaght", "Rathgar", "Cork", "Wilton", "Galway", "Limerick", "Waterford"],
        index=0
    )
    if test_centre:
        st.session_state.test_centre = test_centre
    
    if st.session_state.test_centre:
        # Mock wait time based on centre
        wait_map = {
            "Tallaght": 24, "Rathgar": 18, "Cork": 14, 
            "Wilton": 12, "Galway": 16, "Limerick": 15, "Waterford": 13
        }
        st.session_state.current_wait_weeks = wait_map.get(st.session_state.test_centre, 16)
        st.metric("Current Wait", f"{st.session_state.current_wait_weeks} weeks")
        st.progress(min(st.session_state.current_wait_weeks / 30, 1.0), text="Wait burden")
    
    st.markdown("---")
    st.markdown("### Navigation")
    st.page_link("pages/1_🤖_AI_Coach.py", label="🤖 AI Coach", icon="🎮")
    st.page_link("pages/2_🎯_Slot_Watch.py", label="🎯 Slot Watch", icon="⏰")
    st.page_link("pages/3_🔄_Swap_Market.py", label="🔄 Swap Market", icon="🔄")
    st.page_link("pages/4_🗺️_Centres.py", label="🗺️ Test Centres", icon="📍")
    st.page_link("pages/5_📋_Prep_Checklist.py", label="📋 Prep Checklist", icon="✅")
    st.page_link("pages/6_📊_Dashboard.py", label="📊 Dashboard", icon="📈")
    
    st.markdown("---")
    st.caption("🇮🇪 Built for Irish learners")
    st.caption("BGN Hackathon 2025")

# Hero Section
greeting = f"Welcome back, {st.session_state.user_name}!" if st.session_state.user_name else "Welcome to TestBuddy IE"
st.markdown(f'<h1 class="main-header">{greeting}</h1>', unsafe_allow_html=True)
st.markdown('<p class="subtitle">The smart way to get your Irish driving licence — faster, fairer, and AI-powered.</p>', unsafe_allow_html=True)

# Hero stats row
if st.session_state.test_centre:
    stat_col1, stat_col2, stat_col3, stat_col4 = st.columns(4)
    
    with stat_col1:
        st.markdown(f"""
        <div class="hero-stat">
            <p class="hero-stat-number">{st.session_state.readiness}</p>
            <p class="hero-stat-label">Test Readiness Score</p>
        </div>
        """, unsafe_allow_html=True)
    
    with stat_col2:
        st.markdown(f"""
        <div class="hero-stat">
            <p class="hero-stat-number">{st.session_state.sessions}</p>
            <p class="hero-stat-label">Practice Sessions</p>
        </div>
        """, unsafe_allow_html=True)
    
    with stat_col3:
        target_date = (datetime.now() + timedelta(weeks=st.session_state.current_wait_weeks)).strftime("%b %d")
        st.markdown(f"""
        <div class="hero-stat">
            <p class="hero-stat-number">{target_date}</p>
            <p class="hero-stat-label">Earliest Test Slot</p>
        </div>
        """, unsafe_allow_html=True)
    
    with stat_col4:
        estimated_weeks = max(2, st.session_state.current_wait_weeks - 8)  # Mock improvement
        st.markdown(f"""
        <div class="hero-stat">
            <p class="hero-stat-number">{estimated_weeks}w</p>
            <p class="hero-stat-label">With TestBuddy</p>
        </div>
        """, unsafe_allow_html=True)

st.markdown("---")

# Problem/Solution
problem_col, solution_col = st.columns(2)

with problem_col:
    st.markdown("""
    <div class="problem-box">
        <h3 style="color:#dc2626; margin-top:0;">❌ The Problem</h3>
        <ul style="margin-bottom:0;">
            <li><b>6-12 month waits</b> for driving tests across Ireland</li>
            <li><b>Manual slot-hunting</b> at all hours — exhausting</li>
            <li><b>Shady bots</b> charging €50-200 with zero prep value</li>
            <li><b>50% fail rate</b> — people book before they're ready</li>
            <li><b>No official swap system</b> — wasted slots when people move</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

with solution_col:
    st.markdown("""
    <div class="solution-box">
        <h3 style="color:#059669; margin-top:0;">✅ TestBuddy IE</h3>
        <ul style="margin-bottom:0;">
            <li><b>AI Practice Sessions</b> — simulate real test routes</li>
            <li><b>Ethical Slot Watch</b> — user-authorized, rate-limited</li>
            <li><b>Readiness Scoring</b> — only book when you're prepared</li>
            <li><b>Test Swap Market</b> — peer-to-peer slot exchanges</li>
            <li><b>€4.99/month</b> — 10x cheaper than bots, 100x more value</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# Feature Cards
st.markdown("## 🎯 How It Works")

feature_col1, feature_col2, feature_col3 = st.columns(3)

with feature_col1:
    st.markdown("""
    <div class="card">
        <span class="card-icon">🤖</span>
        <div class="card-title">AI Driving Coach</div>
        <div class="card-text">
            Practice decision-making on real Irish test routes. Get instant AI feedback on roundabouts, 
            speed control, and manoeuvres. Level up your readiness score before booking.
        </div>
    </div>
    """, unsafe_allow_html=True)
    if st.button("🎮 Try AI Coach", key="cta_coach", use_container_width=True):
        st.switch_page("pages/1_🤖_AI_Coach.py")

with feature_col2:
    st.markdown("""
    <div class="card">
        <span class="card-icon">🎯</span>
        <div class="card-title">Smart Slot Watch</div>
        <div class="card-text">
            We monitor RSA bookings ethically (user-authorized). Get instant alerts when earlier slots 
            appear. No more 3am refresh marathons. Respectful rate-limiting.
        </div>
    </div>
    """, unsafe_allow_html=True)
    if st.button("⏰ Set Up Alerts", key="cta_slots", use_container_width=True):
        st.switch_page("pages/2_🎯_Slot_Watch.py")

with feature_col3:
    st.markdown("""
    <div class="card">
        <span class="card-icon">🔄</span>
        <div class="card-title">Test Swap Market</div>
        <div class="card-text">
            Need a Cork slot but have a Dublin one? Swap with another learner. We match compatible 
            swaps and guide you through the process. Reduce no-shows, help everyone.
        </div>
    </div>
    """, unsafe_allow_html=True)
    if st.button("🔄 Browse Swaps", key="cta_swap", use_container_width=True):
        st.switch_page("pages/3_🔄_Swap_Market.py")

st.markdown("---")

# Why We're Different (vs. Bots)
st.markdown("## 🛡️ Why TestBuddy ≠ Shady Bots")

comparison_col1, comparison_col2 = st.columns(2)

with comparison_col1:
    st.markdown("""
    ### ❌ Typical Bots
    - €50-200 one-off payment
    - Aggressive scraping (risk IP bans)
    - Zero preparation value
    - Book you even if unprepared
    - Adversarial to RSA
    - Black box operation
    """)

with comparison_col2:
    st.markdown("""
    ### ✅ TestBuddy IE
    - €4.99/month (cancel anytime)
    - User-authorized monitoring
    - AI coach + readiness scoring
    - Only suggests booking when ready
    - Partner-ready (helps RSA reduce fails)
    - Transparent about how we work
    """)

st.info("💡 **We don't just book slots — we prepare you to pass.** That's why insurance companies want to partner with us.")

st.markdown("---")

# Social Proof / Testimonial (Mock)
st.markdown("## 💬 Early User Feedback")

testimonial_col1, testimonial_col2, testimonial_col3 = st.columns(3)

with testimonial_col1:
    st.markdown("""
    <div class="testimonial">
        "The AI coach caught mistakes I didn't even know I was making. Passed first time!"<br/>
        <b>— Sarah M., Dublin</b>
    </div>
    """, unsafe_allow_html=True)

with testimonial_col2:
    st.markdown("""
    <div class="testimonial">
        "Got a slot 3 months earlier than my original date. The swap market actually works."<br/>
        <b>— Liam O., Cork</b>
    </div>
    """, unsafe_allow_html=True)

with testimonial_col3:
    st.markdown("""
    <div class="testimonial">
        "Way better than those dodgy bots. Feels good to use something that's actually ethical."<br/>
        <b>— Emma K., Galway</b>
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# Call to Action
st.markdown("""
<div class="cta-box">
    <p class="cta-text">🚀 Ready to cut your wait time in half?</p>
    <p style="font-size:1.1rem; margin-bottom:1.5rem;">Start with a free AI practice session. No credit card required.</p>
</div>
""", unsafe_allow_html=True)

cta_col1, cta_col2, cta_col3 = st.columns([1, 2, 1])
with cta_col2:
    if st.button("🎮 Start Free Practice Session", type="primary", use_container_width=True):
        st.switch_page("pages/1_🤖_AI_Coach.py")

st.markdown("---")

# How We Help Ireland Section
st.markdown("## 🇮🇪 Building a Smarter Ireland")

ireland_col1, ireland_col2, ireland_col3 = st.columns(3)

with ireland_col1:
    st.markdown("""
    ### 🌍 Urban & Rural Equity
    - Show rural learners shorter-wait centres nearby
    - Travel time + distance calculator
    - Centre-specific pass rate insights
    """)

with ireland_col2:
    st.markdown("""
    ### 🤝 Partner-Ready
    - Help RSA reduce fail rates (better-prepared learners)
    - Reduce no-shows via swap market
    - Anonymous insights on bottlenecks
    """)

with ireland_col3:
    st.markdown("""
    ### 💼 Insurance Partnerships
    - Insurers sponsor free access for members
    - Users pass faster → fewer unlicensed drivers
    - Lower claims risk = savings passed to you
    """)

# Quick Stats Visualization
st.markdown("---")
st.markdown("## 📊 Impact Potential")

fig = go.Figure()

fig.add_trace(go.Bar(
    x=['Without TestBuddy', 'With TestBuddy'],
    y=[6.5, 3.2],
    name='Months to Test',
    marker_color=['#ef4444', '#10b981'],
    text=[6.5, 3.2],
    textposition='outside',
))

fig.update_layout(
    title="Average Time to Get a Test Slot",
    yaxis_title="Months",
    showlegend=False,
    height=300,
    margin=dict(t=50, b=20, l=20, r=20),
    plot_bgcolor='rgba(0,0,0,0)',
    paper_bgcolor='rgba(0,0,0,0)',
)

st.plotly_chart(fig, use_container_width=True)

impact_col1, impact_col2, impact_col3 = st.columns(3)
with impact_col1:
    st.metric("Projected Users Year 1", "3,000+")
with impact_col2:
    st.metric("Avg. Time Saved", "12 weeks")
with impact_col3:
    st.metric("Pass Rate Improvement", "+18%")

st.markdown("---")

# Footer / Next Steps
st.markdown("## 🚦 Next Steps")

next_col1, next_col2, next_col3 = st.columns(3)

with next_col1:
    st.markdown("### 1️⃣ Setup")
    st.write("Complete your profile in the sidebar (30 seconds)")

with next_col2:
    st.markdown("### 2️⃣ Practice")
    st.write("Try the AI Coach on your test centre's route")

with next_col3:
    st.markdown("### 3️⃣ Watch")
    st.write("Enable slot monitoring once ready")

st.markdown("---")

# FAQ Expander
with st.expander("❓ Frequently Asked Questions"):
    st.markdown("""
    **Is this legal?**  
    Yes. We use user-authorized session monitoring. You log in to RSA, we watch *your* session with your permission.
    
    **How much does it cost?**  
    Free tier: 1 practice session + manual slot check.  
    Pro: €4.99/month for unlimited AI practice + auto slot watch + swap market.
    
    **What if RSA blocks you?**  
    We're designed to be partner-ready. Our rate-limiting is respectful. If needed, we pivot to pure prep + swap (still valuable).
    
    **Does the AI actually improve pass rates?**  
    Our beta users show 18% higher pass rates vs. control (mock data for demo; real study post-hackathon).
    
    **Can I really swap tests?**  
    Yes — we match compatible learners and guide the RSA rebooking process. Both parties confirm the swap.
    """)

# Disclaimer
st.caption("TestBuddy IE is an educational and scheduling assistant tool. Not affiliated with the RSA. "
           "Users are responsible for meeting all RSA requirements and confirming bookings directly on the RSA website.")

st.caption("© 2025 TestBuddy IE • Built with ❤️ in Ireland for BGN Hackathon")