# pages/2_🎯_Slot_Watch.py
import streamlit as st
import time
import random
from datetime import datetime, timedelta
import pandas as pd
import plotly.graph_objects as go

st.set_page_config(page_title="Slot Watch - TestBuddy IE", page_icon="🎯", layout="wide")

# Custom CSS
st.markdown("""
<style>
    .slot-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        margin: 0.5rem 0;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    .slot-available {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        animation: pulse-green 2s infinite;
    }
    @keyframes pulse-green {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }
    .alert-card {
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
    }
    .stat-box {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        border: 2px solid #e5e7eb;
        text-align: center;
    }
    .ethics-badge {
        display: inline-block;
        background: #10b981;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'watching_centres' not in st.session_state:
    st.session_state.watching_centres = []
if 'slot_history' not in st.session_state:
    st.session_state.slot_history = []
if 'last_check_time' not in st.session_state:
    st.session_state.last_check_time = None
if 'alerts_enabled' not in st.session_state:
    st.session_state.alerts_enabled = False

# Mock data for centres
CENTRES_DATA = {
    "Tallaght": {"wait_weeks": 24, "slots_per_week": 3.2, "avg_cancellations": 4, "difficulty": "High"},
    "Rathgar": {"wait_weeks": 18, "slots_per_week": 2.8, "avg_cancellations": 3, "difficulty": "Medium"},
    "Cork": {"wait_weeks": 14, "slots_per_week": 4.1, "avg_cancellations": 5, "difficulty": "Medium"},
    "Wilton": {"wait_weeks": 12, "slots_per_week": 3.5, "avg_cancellations": 4, "difficulty": "Low"},
    "Cavan": {"wait_weeks": 10, "slots_per_week": 2.1, "avg_cancellations": 2, "difficulty": "Low"},
    "Galway": {"wait_weeks": 16, "slots_per_week": 3.0, "avg_cancellations": 3, "difficulty": "Medium"},
    "Limerick": {"wait_weeks": 15, "slots_per_week": 2.9, "avg_cancellations": 3, "difficulty": "Medium"},
    "Waterford": {"wait_weeks": 13, "slots_per_week": 2.5, "avg_cancellations": 2, "difficulty": "Low"}
}

# Header
st.title("🎯 Smart Slot Watch")
st.markdown('<span class="ethics-badge">✓ Ethical • User-Authorized • Rate-Limited</span>', unsafe_allow_html=True)

st.markdown("---")

# Top Stats
stat_col1, stat_col2, stat_col3, stat_col4 = st.columns(4)

with stat_col1:
    watching_count = len(st.session_state.watching_centres)
    st.metric("Centres Watching", watching_count, delta="Active" if watching_count > 0 else None)

with stat_col2:
    slots_found = len(st.session_state.slot_history)
    st.metric("Slots Found", slots_found, delta="+1" if slots_found > 0 else None)

with stat_col3:
    if st.session_state.last_check_time:
        minutes_ago = int((datetime.now() - st.session_state.last_check_time).total_seconds() / 60)
        st.metric("Last Check", f"{minutes_ago}m ago")
    else:
        st.metric("Last Check", "Never")

with stat_col4:
    status = "🟢 Active" if st.session_state.alerts_enabled else "⚫ Paused"
    st.metric("Status", status)

st.markdown("---")

# Main content tabs
tab1, tab2, tab3, tab4 = st.tabs(["🔍 Find Slots", "⚙️ Watch Settings", "📊 Analytics", "💡 How It Works"])

# TAB 1: Find Slots
with tab1:
    st.subheader("Quick Slot Search")
    
    search_col1, search_col2 = st.columns([2, 1])
    
    with search_col1:
        selected_centre = st.selectbox(
            "Test Centre",
            options=list(CENTRES_DATA.keys()),
            help="Select your preferred test centre"
        )
        
        current_date = st.date_input(
            "Your Current Booking Date",
            value=datetime.now() + timedelta(weeks=CENTRES_DATA[selected_centre]["wait_weeks"]),
            help="When is your test currently scheduled?"
        )
        
        weeks_willing = st.slider(
            "How many weeks earlier are you willing to take?",
            min_value=1,
            max_value=12,
            value=4,
            help="We'll search for slots within this timeframe"
        )
    
    with search_col2:
        centre_info = CENTRES_DATA[selected_centre]
        
        st.markdown(f"""
        <div class="stat-box">
            <h4>{selected_centre}</h4>
            <p><strong>Current Wait:</strong> {centre_info['wait_weeks']} weeks</p>
            <p><strong>Weekly Cancellations:</strong> ~{centre_info['avg_cancellations']}</p>
            <p><strong>Difficulty:</strong> {centre_info['difficulty']}</p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Search button
    if st.button("🔍 Search for Earlier Slots", type="primary", use_container_width=True):
        with st.spinner("Scanning RSA booking system..."):
            # Simulate API call
            progress_bar = st.progress(0)
            for i in range(100):
                time.sleep(0.01)
                progress_bar.progress(i + 1)
            
            st.session_state.last_check_time = datetime.now()
            
            # Simulate finding slots (weighted by centre cancellation rate)
            found_count = random.choices(
                [0, 1, 2, 3, 4],
                weights=[30, 25, 20, 15, 10],
                k=1
            )[0]
            
            if found_count > 0:
                st.balloons()
                st.success(f"🎉 Found {found_count} earlier slot{'s' if found_count > 1 else ''}!")
                
                # Generate mock slots
                slots = []
                for i in range(found_count):
                    days_earlier = random.randint(7, weeks_willing * 7)
                    slot_date = current_date - timedelta(days=days_earlier)
                    slot_time = random.choice(["08:30", "09:40", "10:50", "13:20", "14:30", "15:40"])
                    
                    time_saved_weeks = days_earlier / 7
                    
                    slots.append({
                        "Date": slot_date.strftime("%a, %d %b %Y"),
                        "Time": slot_time,
                        "Weeks Earlier": f"{time_saved_weeks:.1f}",
                        "Centre": selected_centre
                    })
                    
                    # Add to history
                    st.session_state.slot_history.append({
                        "centre": selected_centre,
                        "date": slot_date,
                        "time": slot_time,
                        "found_at": datetime.now()
                    })
                
                # Display slots in cards
                for i, slot in enumerate(slots):
                    st.markdown(f"""
                    <div class="slot-card slot-available">
                        <h3>📅 Slot {i+1}</h3>
                        <p style="font-size: 1.2rem; margin: 0.5rem 0;">
                            <strong>{slot['Date']}</strong> at <strong>{slot['Time']}</strong>
                        </p>
                        <p style="margin: 0.5rem 0;">
                            ⏰ <strong>{slot['Weeks Earlier']} weeks earlier</strong> than your current booking
                        </p>
                        <p style="margin: 0; opacity: 0.9;">
                            📍 {slot['Centre']} Test Centre
                        </p>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    # Action buttons for each slot
                    btn_col1, btn_col2 = st.columns(2)
                    with btn_col1:
                        st.button(
                            f"📋 Book This Slot (RSA Website)",
                            key=f"book_{i}",
                            use_container_width=True,
                            help="Opens RSA booking page (demo)"
                        )
                    with btn_col2:
                        st.button(
                            f"⏰ Set Alert",
                            key=f"alert_{i}",
                            use_container_width=True,
                            help="Get notified if this slot becomes available again"
                        )
                
                # Explanation
                st.info("""
                **In Production:**
                - You'd authorize us to monitor your RSA session (via secure token)
                - We poll every 15 minutes (respectful rate-limiting)
                - Instant push notification when slots appear
                - One-click deep link to book on RSA site
                """)
                
            else:
                st.warning("😔 No earlier slots found right now")
                st.write(f"""
                Don't worry! Based on {selected_centre}'s cancellation rate 
                (~{centre_info['avg_cancellations']}/week), slots typically appear within 3-5 days.
                """)
                
                st.info("💡 **Tip:** Enable continuous watching below to get instant alerts when slots appear!")

# TAB 2: Watch Settings
with tab2:
    st.subheader("⚙️ Continuous Slot Monitoring")
    
    st.markdown("""
    <div class="alert-card">
        <strong>🛡️ How We Watch Ethically:</strong>
        <ul>
            <li>✅ User-authorized session tokens only</li>
            <li>✅ Rate-limited to 1 request per 15 minutes</li>
            <li>✅ Respect RSA server load</li>
            <li>✅ Deep links to RSA for final booking (we never auto-book)</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Enable/Disable watching
    watching_enabled = st.toggle(
        "🔔 Enable Continuous Watching",
        value=st.session_state.alerts_enabled,
        help="We'll monitor for cancellations 24/7 and alert you instantly"
    )
    
    if watching_enabled != st.session_state.alerts_enabled:
        st.session_state.alerts_enabled = watching_enabled
        if watching_enabled:
            st.success("✅ Watching enabled! You'll be notified of any cancellations.")
        else:
            st.info("⏸️ Watching paused. Re-enable anytime.")
    
    if watching_enabled:
        st.markdown("---")
        st.subheader("📍 Centres to Watch")
        
        # Multi-select for centres
        watch_centres = st.multiselect(
            "Select up to 3 centres to monitor",
            options=list(CENTRES_DATA.keys()),
            default=st.session_state.watching_centres[:3] if st.session_state.watching_centres else [],
            max_selections=3,
            help="Pro users can watch up to 3 centres simultaneously"
        )
        
        st.session_state.watching_centres = watch_centres
        
        if watch_centres:
            st.write("**Currently watching:**")
            for centre in watch_centres:
                info = CENTRES_DATA[centre]
                st.write(f"✓ {centre} - Wait: {info['wait_weeks']}w | Cancellations: ~{info['avg_cancellations']}/week")
        
        st.markdown("---")
        st.subheader("🔔 Alert Preferences")
        
        alert_col1, alert_col2 = st.columns(2)
        
        with alert_col1:
            st.checkbox("📱 Push Notifications", value=True, help="In-app + browser push")
            st.checkbox("📧 Email Alerts", value=True, help="Sent to your registered email")
            st.checkbox("💬 SMS Alerts (Pro)", value=False, disabled=True, help="Upgrade to Pro for SMS")
        
        with alert_col2:
            st.selectbox(
                "Alert Frequency",
                ["Instant (every slot)", "Digest (once daily)", "Smart (ML-filtered)"],
                help="How often do you want to be notified?"
            )
            
            st.time_input(
                "Quiet Hours Start",
                value=datetime.strptime("22:00", "%H:%M").time(),
                help="We won't alert you during quiet hours"
            )
        
        # Mock monitoring dashboard
        st.markdown("---")
        st.subheader("📊 Live Monitoring")
        
        monitor_col1, monitor_col2, monitor_col3 = st.columns(3)
        
        with monitor_col1:
            st.metric("Checks Today", random.randint(50, 96))
        with monitor_col2:
            st.metric("Slots Found", len(st.session_state.slot_history))
        with monitor_col3:
            st.metric("Next Check", "14m 22s")
        
        # Live activity log (mock)
        with st.expander("📜 Recent Activity Log"):
            for i in range(5):
                minutes_ago = i * 15
                time_str = f"{minutes_ago}m ago"
                centre_name = random.choice(watch_centres) if watch_centres else "Tallaght"
                status_icon = "🟢" if random.random() > 0.8 else "⚪"
                st.text(f"{status_icon} {time_str} - Checked {centre_name} - No new slots")
    
    else:
        st.info("👆 Enable watching above to set up continuous monitoring")

# TAB 3: Analytics
with tab3:
    st.subheader("📊 Slot Availability Analytics")
    
    if not st.session_state.slot_history:
        st.info("📭 No slot history yet. Run a search to start collecting data!")
    else:
        # Show history
        st.write(f"**Found {len(st.session_state.slot_history)} slots in your searches**")
        
        # Convert to dataframe
        history_df = pd.DataFrame([
            {
                "Centre": s["centre"],
                "Date": s["date"].strftime("%Y-%m-%d"),
                "Time": s["time"],
                "Found At": s["found_at"].strftime("%Y-%m-%d %H:%M")
            }
            for s in st.session_state.slot_history
        ])
        
        st.dataframe(history_df, use_container_width=True, hide_index=True)
    
    st.markdown("---")
    
    # Centre comparison chart
    st.subheader("🏆 Centre Comparison")
    
    centres = list(CENTRES_DATA.keys())
    wait_times = [CENTRES_DATA[c]["wait_weeks"] for c in centres]
    cancellations = [CENTRES_DATA[c]["avg_cancellations"] for c in centres]
    
    chart_col1, chart_col2 = st.columns(2)
    
    with chart_col1:
        # Wait times bar chart
        fig_wait = go.Figure(data=[
            go.Bar(
                x=centres,
                y=wait_times,
                marker_color=['#ef4444' if w >= 20 else '#f59e0b' if w >= 15 else '#10b981' for w in wait_times],
                text=wait_times,
                textposition='outside'
            )
        ])
        fig_wait.update_layout(
            title="Current Wait Times (weeks)",
            yaxis_title="Weeks",
            height=300,
            showlegend=False,
            margin=dict(l=20, r=20, t=40, b=20)
        )
        st.plotly_chart(fig_wait, use_container_width=True)
    
    with chart_col2:
        # Cancellation rate chart
        fig_cancel = go.Figure(data=[
            go.Bar(
                x=centres,
                y=cancellations,
                marker_color='#667eea',
                text=cancellations,
                textposition='outside'
            )
        ])
        fig_cancel.update_layout(
            title="Weekly Cancellations (avg)",
            yaxis_title="Slots/Week",
            height=300,
            showlegend=False,
            margin=dict(l=20, r=20, t=40, b=20)
        )
        st.plotly_chart(fig_cancel, use_container_width=True)
    
    # Best times to check
    st.markdown("---")
    st.subheader("⏰ Best Times to Check")
    
    st.info("""
    **Based on historical data:**
    - 🌅 **Early Morning (6-8 AM)**: Overnight cancellations appear
    - 🌆 **Evening (6-8 PM)**: People cancel after work
    - 🎯 **Monday mornings**: Weekend cancellations posted
    - 🔥 **2 weeks before test**: Peak cancellation period (nerves!)
    """)

# TAB 4: How It Works
with tab4:
    st.subheader("💡 How TestBuddy Slot Watch Works")
    
    st.markdown("""
    ### 🔐 The Ethical Approach
    
    Unlike shady bots that scrape aggressively, we use **user-authorized monitoring**:
    
    1. **You log into RSA** (not us - we never see your password)
    2. **You authorize us** to monitor your session (via secure token)
    3. **We poll respectfully** (max 1 request per 15 minutes)
    4. **We notify you instantly** when slots appear
    5. **You book yourself** (we deep-link to RSA site)
    
    ### 🤝 Why RSA Won't Block Us
    
    - ✅ We're **partner-ready** (helping reduce no-shows via better prep)
    - ✅ **Rate-limited** (lower load than manual refreshers)
    - ✅ **Transparent** (we'll approach RSA for official API post-hackathon)
    - ✅ **User-controlled** (they authorize us, not vice versa)
    
    ### 🆚 TestBuddy vs. Shady Bots
    """)
    
    comparison_df = pd.DataFrame({
        "Feature": ["Price", "Method", "Rate Limit", "Prep Value", "RSA Relationship", "Auto-Book"],
        "Shady Bots": ["€50-200", "Aggressive scraping", "None (risk IP ban)", "Zero", "Adversarial", "Yes (risky)"],
        "TestBuddy IE": ["€4.99/mo", "User-authorized", "1 req/15min", "AI Coach included", "Partner-ready", "No (you confirm)"]
    })
    
    st.dataframe(comparison_df, use_container_width=True, hide_index=True)
    
    st.markdown("""
    ### 🎯 What Makes Us Different
    
    **We don't just book slots - we prepare you to pass:**
    
    - 🤖 **AI Practice Coach** - Get test-ready before booking
    - 📊 **Readiness Score** - Know when you're actually prepared
    - 🔄 **Swap Market** - Trade slots with other learners
    - 🤝 **Insurance Partnerships** - Discounts for better-prepared drivers
    
    ### 🚀 Coming Soon
    
    - [ ] Multi-centre watching (up to 3 centres)
    - [ ] SMS alerts for Pro users
    - [ ] "Smart match" algorithm (ML-based slot prediction)
    - [ ] Centre-specific success tips
    - [ ] Official RSA API partnership (in progress)
    """)
    
    st.markdown("---")
    
    st.success("""
    **💚 Building a Smarter Ireland**
    
    By preparing learners better AND helping them find slots faster, we reduce:
    - ⏱️ Average wait time (6 months → 3 months)
    - 📉 Test fail rates (50% → 35% for our users)
    - 🚗 Time with unlicensed drivers on roads
    - 💰 Insurance claims from unprepared drivers
    """)

# Sidebar upgrade prompt
with st.sidebar:
    st.markdown("---")
    st.subheader("⚡ Upgrade to Pro")
    
    st.markdown("""
    **Free Tier:**
    - ✓ Manual slot checks
    - ✓ 1 centre watch
    - ✓ 1 AI practice session/week
    
    **Pro (€4.99/mo):**
    - ⚡ Auto slot monitoring
    - ⚡ Watch 3 centres
    - ⚡ Unlimited AI practice
    - ⚡ SMS alerts
    - ⚡ Priority support
    """)
    
    if st.button("🚀 Upgrade Now", use_container_width=True):
        st.info("Redirecting to payment... (demo)")

# Footer
st.markdown("---")
st.caption("TestBuddy IE Slot Watch is a booking assistant. We help you find slots faster, but you always confirm bookings directly on the RSA website.")