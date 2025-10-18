# pages/5_📊_Dashboard.py
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import pandas as pd

st.set_page_config(page_title="Dashboard - TestBuddy IE", page_icon="📊", layout="wide")

# Custom CSS
st.markdown("""
<style>
    .dashboard-card {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.5rem;
        margin: 0.5rem 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .achievement-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem;
        border-radius: 12px;
        margin: 0.5rem 0;
        text-align: center;
    }
    .stat-highlight {
        font-size: 2.5rem;
        font-weight: 700;
        color: #667eea;
    }
    .progress-ring {
        transform: rotate(-90deg);
    }
    .milestone-badge {
        display: inline-block;
        background: #10b981;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: 600;
        margin: 0.3rem;
    }
    .skill-bar {
        background: #e5e7eb;
        height: 24px;
        border-radius: 12px;
        overflow: hidden;
        margin: 0.5rem 0;
    }
    .skill-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 0.5rem;
        color: white;
        font-weight: 600;
        font-size: 0.85rem;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state defaults
if 'xp' not in st.session_state:
    st.session_state.xp = 0
if 'sessions_completed' not in st.session_state:
    st.session_state.sessions_completed = 0
if 'decisions' not in st.session_state:
    st.session_state.decisions = []
if 'slot_history' not in st.session_state:
    st.session_state.slot_history = []
if 'my_listings' not in st.session_state:
    st.session_state.my_listings = []
if 'completed_swaps' not in st.session_state:
    st.session_state.completed_swaps = 0

# Helper functions
def calculate_readiness():
    """Calculate overall readiness score"""
    base_score = min(100, st.session_state.xp // 10)
    session_bonus = st.session_state.sessions_completed * 5
    
    correct_pct = 0
    if st.session_state.decisions:
        correct = sum(1 for d in st.session_state.decisions if d['correct'])
        correct_pct = (correct / len(st.session_state.decisions)) * 20
    
    return min(100, int(base_score + session_bonus + correct_pct))

def get_level_info(xp):
    """Get current level based on XP"""
    if xp < 200: return {"level": 1, "title": "🟢 Learner", "next": 200, "color": "#10b981"}
    elif xp < 500: return {"level": 2, "title": "🟡 Novice", "next": 500, "color": "#f59e0b"}
    elif xp < 1000: return {"level": 3, "title": "🟠 Competent", "next": 1000, "color": "#f97316"}
    elif xp < 2000: return {"level": 4, "title": "🔵 Skilled", "next": 2000, "color": "#3b82f6"}
    else: return {"level": 5, "title": "🟣 Test Ready", "next": None, "color": "#a855f7"}

def get_achievements():
    """Calculate earned achievements"""
    achievements = []
    
    # XP milestones
    if st.session_state.xp >= 100:
        achievements.append({"icon": "🎯", "name": "First 100 XP", "desc": "You're on your way!"})
    if st.session_state.xp >= 500:
        achievements.append({"icon": "⭐", "name": "500 XP Master", "desc": "Consistent practice!"})
    if st.session_state.xp >= 1000:
        achievements.append({"icon": "🏆", "name": "1000 XP Champion", "desc": "Dedication pays off!"})
    
    # Session milestones
    if st.session_state.sessions_completed >= 1:
        achievements.append({"icon": "🚗", "name": "First Drive", "desc": "Completed first practice"})
    if st.session_state.sessions_completed >= 5:
        achievements.append({"icon": "🛣️", "name": "Regular Driver", "desc": "5 sessions completed"})
    if st.session_state.sessions_completed >= 10:
        achievements.append({"icon": "🎖️", "name": "Practice Pro", "desc": "10 sessions completed"})
    
    # Skill achievements
    if st.session_state.decisions:
        correct = sum(1 for d in st.session_state.decisions if d['correct'])
        accuracy = (correct / len(st.session_state.decisions)) * 100
        
        if accuracy >= 80:
            achievements.append({"icon": "🎓", "name": "High Achiever", "desc": "80%+ accuracy"})
        if accuracy == 100 and len(st.session_state.decisions) >= 5:
            achievements.append({"icon": "💎", "name": "Perfect Score", "desc": "100% on a session!"})
    
    # Readiness milestone
    readiness = calculate_readiness()
    if readiness >= 80:
        achievements.append({"icon": "✅", "name": "Test Ready", "desc": "Ready to book!"})
    
    # Swap achievements
    if st.session_state.completed_swaps >= 1:
        achievements.append({"icon": "🔄", "name": "Swap Success", "desc": "First swap completed"})
    
    # Slot achievements
    if len(st.session_state.slot_history) >= 1:
        achievements.append({"icon": "🔍", "name": "Slot Hunter", "desc": "Found your first slot"})
    
    return achievements

# Header
st.title("📊 Your TestBuddy Dashboard")
st.caption(f"Last updated: {datetime.now().strftime('%d %b %Y, %H:%M')}")

st.markdown("---")

# Top-level metrics
metric_col1, metric_col2, metric_col3, metric_col4 = st.columns(4)

level_info = get_level_info(st.session_state.xp)
readiness = calculate_readiness()
correct_decisions = sum(1 for d in st.session_state.decisions if d.get('correct', False))
total_decisions = len(st.session_state.decisions)

with metric_col1:
    st.metric(
        "Level",
        f"{level_info['level']} - {level_info['title'].split()[1]}",
        delta=f"{st.session_state.xp} XP"
    )

with metric_col2:
    st.metric(
        "Readiness Score",
        f"{readiness}/100",
        delta="Ready!" if readiness >= 80 else f"{80-readiness} to go",
        delta_color="normal" if readiness >= 80 else "off"
    )

with metric_col3:
    st.metric(
        "Practice Sessions",
        st.session_state.sessions_completed,
        delta="+1" if st.session_state.sessions_completed > 0 else None
    )

with metric_col4:
    accuracy = (correct_decisions / total_decisions * 100) if total_decisions > 0 else 0
    st.metric(
        "Overall Accuracy",
        f"{accuracy:.0f}%",
        delta=f"{correct_decisions}/{total_decisions}"
    )

st.markdown("---")

# Main dashboard content
tab1, tab2, tab3, tab4 = st.tabs(["📈 Progress", "🏆 Achievements", "📋 Activity", "🎯 Goals"])

# TAB 1: Progress
with tab1:
    progress_col1, progress_col2 = st.columns([2, 1])
    
    with progress_col1:
        st.subheader("Test Readiness")
        
        # Large readiness gauge
        fig_readiness = go.Figure(go.Indicator(
            mode="gauge+number+delta",
            value=readiness,
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': "Current Readiness", 'font': {'size': 24}},
            delta={'reference': 80, 'suffix': " to target"},
            number={'suffix': "/100", 'font': {'size': 48}},
            gauge={
                'axis': {'range': [None, 100], 'tickwidth': 2},
                'bar': {'color': level_info['color']},
                'bgcolor': "white",
                'borderwidth': 3,
                'bordercolor': "gray",
                'steps': [
                    {'range': [0, 40], 'color': '#fee2e2'},
                    {'range': [40, 70], 'color': '#fef3c7'},
                    {'range': [70, 100], 'color': '#d1fae5'}
                ],
                'threshold': {
                    'line': {'color': "red", 'width': 4},
                    'thickness': 0.75,
                    'value': 80
                }
            }
        ))
        
        fig_readiness.update_layout(
            height=350,
            margin=dict(l=20, r=20, t=60, b=20),
            paper_bgcolor="rgba(0,0,0,0)",
            font={'size': 16}
        )
        
        st.plotly_chart(fig_readiness, use_container_width=True)
        
        # Readiness breakdown
        st.markdown("#### Readiness Breakdown")
        
        breakdown_data = {
            "Component": ["Practice XP", "Session Bonus", "Accuracy Bonus"],
            "Score": [
                min(100, st.session_state.xp // 10),
                st.session_state.sessions_completed * 5,
                (correct_decisions / total_decisions * 20) if total_decisions > 0 else 0
            ]
        }
        
        fig_breakdown = px.bar(
            breakdown_data,
            x="Component",
            y="Score",
            color="Component",
            color_discrete_sequence=["#667eea", "#764ba2", "#10b981"]
        )
        
        fig_breakdown.update_layout(
            showlegend=False,
            height=250,
            margin=dict(l=20, r=20, t=20, b=20),
            yaxis_title="Points"
        )
        
        st.plotly_chart(fig_breakdown, use_container_width=True)
    
    with progress_col2:
        st.subheader("Level Progress")
        
        # XP progress to next level
        if level_info['next']:
            xp_progress = (st.session_state.xp / level_info['next']) * 100
            xp_remaining = level_info['next'] - st.session_state.xp
            
            st.markdown(f"""
            <div class="dashboard-card">
                <h2 style="margin: 0; text-align: center; color: {level_info['color']};">
                    Level {level_info['level']}
                </h2>
                <p style="text-align: center; color: #6b7280; margin: 0.5rem 0;">
                    {level_info['title']}
                </p>
                <hr>
                <p style="margin: 0.5rem 0;"><strong>Current XP:</strong> {st.session_state.xp}</p>
                <p style="margin: 0.5rem 0;"><strong>Next Level:</strong> {level_info['next']} XP</p>
                <p style="margin: 0.5rem 0;"><strong>Remaining:</strong> {xp_remaining} XP</p>
            </div>
            """, unsafe_allow_html=True)
            
            st.progress(xp_progress / 100, text=f"{xp_progress:.0f}% to Level {level_info['level'] + 1}")
        else:
            st.success("🎉 Maximum level reached!")
        
        st.markdown("---")
        
        # Quick stats
        st.markdown("#### Quick Stats")
        
        st.markdown(f"""
        <div class="dashboard-card">
            <p style="margin: 0.5rem 0;">
                <strong>Total Decisions:</strong> {total_decisions}
            </p>
            <p style="margin: 0.5rem 0;">
                <strong>Correct Decisions:</strong> {correct_decisions}
            </p>
            <p style="margin: 0.5rem 0;">
                <strong>Slots Found:</strong> {len(st.session_state.slot_history)}
            </p>
            <p style="margin: 0.5rem 0;">
                <strong>Swaps Listed:</strong> {len(st.session_state.my_listings)}
            </p>
            <p style="margin: 0.5rem 0;">
                <strong>Swaps Completed:</strong> {st.session_state.completed_swaps}
            </p>
        </div>
        """, unsafe_allow_html=True)
    
    # Skills analysis
    if st.session_state.decisions:
        st.markdown("---")
        st.subheader("📚 Skills Analysis")
        
        # Group decisions by skill
        skills = {}
        for d in st.session_state.decisions:
            skill = d.get('skill', 'general')
            if skill not in skills:
                skills[skill] = {'correct': 0, 'total': 0}
            skills[skill]['total'] += 1
            if d.get('correct', False):
                skills[skill]['correct'] += 1
        
        # Display skill bars
        for skill, data in skills.items():
            skill_pct = (data['correct'] / data['total'] * 100) if data['total'] > 0 else 0
            skill_name = skill.replace('_', ' ').title()
            
            st.markdown(f"**{skill_name}** ({data['correct']}/{data['total']})")
            st.markdown(f"""
            <div class="skill-bar">
                <div class="skill-fill" style="width: {skill_pct}%;">
                    {skill_pct:.0f}%
                </div>
            </div>
            """, unsafe_allow_html=True)

# TAB 2: Achievements
with tab2:
    st.subheader("🏆 Your Achievements")
    
    achievements = get_achievements()
    
    if not achievements:
        st.info("🎯 Complete your first practice session to start earning achievements!")
    else:
        st.write(f"**{len(achievements)} achievements unlocked!**")
        
        # Display achievements in grid
        ach_cols = st.columns(3)
        
        for i, achievement in enumerate(achievements):
            with ach_cols[i % 3]:
                st.markdown(f"""
                <div class="achievement-card">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">
                        {achievement['icon']}
                    </div>
                    <h4 style="margin: 0.5rem 0;">{achievement['name']}</h4>
                    <p style="margin: 0; opacity: 0.9; font-size: 0.9rem;">
                        {achievement['desc']}
                    </p>
                </div>
                """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Locked achievements (coming soon)
    st.subheader("🔒 Achievements to Unlock")
    
    locked_achievements = [
        {"icon": "🌟", "name": "2000 XP Legendary", "requirement": "Earn 2000+ XP"},
        {"icon": "🚀", "name": "Speed Runner", "requirement": "Complete 20 sessions"},
        {"icon": "🎯", "name": "Sharpshooter", "requirement": "Get 90%+ accuracy"},
        {"icon": "🤝", "name": "Swap Master", "requirement": "Complete 5 swaps"},
        {"icon": "📅", "name": "Test Booked", "requirement": "Book your driving test"},
        {"icon": "✅", "name": "Test Passed", "requirement": "Pass your driving test!"}
    ]
    
    locked_cols = st.columns(3)
    
    for i, locked in enumerate(locked_achievements):
        with locked_cols[i % 3]:
            st.markdown(f"""
            <div style="background: #f3f4f6; padding: 1rem; border-radius: 12px; text-align: center; opacity: 0.6;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem; filter: grayscale(100%);">
                    {locked['icon']}
                </div>
                <h5 style="margin: 0.5rem 0;">???</h5>
                <p style="margin: 0; font-size: 0.85rem; color: #6b7280;">
                    {locked['requirement']}
                </p>
            </div>
            """, unsafe_allow_html=True)

# TAB 3: Activity
with tab3:
    st.subheader("📋 Recent Activity")
    
    # Create activity timeline
    activities = []
    
    # Add practice sessions
    if st.session_state.sessions_completed > 0:
        for i in range(min(5, st.session_state.sessions_completed)):
            activities.append({
                "type": "Practice",
                "icon": "🎮",
                "desc": f"Completed practice session",
                "time": datetime.now() - timedelta(days=i*2, hours=i*3),
                "color": "#667eea"
            })
    
    # Add slot findings
    for slot in st.session_state.slot_history[-5:]:
        activities.append({
            "type": "Slot Found",
            "icon": "🎯",
            "desc": f"Found slot at {slot['centre']}",
            "time": slot.get('found_at', datetime.now()),
            "color": "#10b981"
        })
    
    # Add swap listings
    for listing in st.session_state.my_listings[-3:]:
        activities.append({
            "type": "Swap Listed",
            "icon": "🔄",
            "desc": f"Listed {listing['offering']['centre']} slot",
            "time": listing.get('posted', datetime.now()),
            "color": "#f59e0b"
        })
    
    # Sort by time
    activities.sort(key=lambda x: x['time'], reverse=True)
    
    if not activities:
        st.info("📭 No activity yet. Start practicing to see your activity here!")
    else:
        # Display timeline
        for activity in activities[:10]:  # Show last 10 activities
            time_ago = datetime.now() - activity['time']
            
            if time_ago.days > 0:
                time_str = f"{time_ago.days} day{'s' if time_ago.days > 1 else ''} ago"
            elif time_ago.seconds // 3600 > 0:
                hours = time_ago.seconds // 3600
                time_str = f"{hours} hour{'s' if hours > 1 else ''} ago"
            else:
                minutes = time_ago.seconds // 60
                time_str = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
            
            st.markdown(f"""
            <div class="dashboard-card" style="border-left: 4px solid {activity['color']};">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="font-size: 2rem;">{activity['icon']}</div>
                    <div style="flex: 1;">
                        <p style="margin: 0; font-weight: 600;">{activity['type']}</p>
                        <p style="margin: 0.2rem 0 0 0; color: #6b7280; font-size: 0.9rem;">
                            {activity['desc']}
                        </p>
                    </div>
                    <div style="text-align: right; color: #9ca3af; font-size: 0.85rem;">
                        {time_str}
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Activity stats
    st.subheader("📊 Activity Summary")
    
    summary_col1, summary_col2, summary_col3 = st.columns(3)
    
    with summary_col1:
        st.metric("This Week", "3 sessions", delta="+1")
    
    with summary_col2:
        st.metric("This Month", f"{st.session_state.sessions_completed} sessions")
    
    with summary_col3:
        st.metric("Streak", "5 days", delta="🔥")

# TAB 4: Goals
with tab4:
    st.subheader("🎯 Your Goals")
    
    # Main goal: Get test-ready
    st.markdown("### Primary Goal: Reach 80+ Readiness")
    
    goal_progress = (readiness / 80) * 100 if readiness < 80 else 100
    
    st.progress(goal_progress / 100, text=f"{readiness}/80 ({goal_progress:.0f}%)")
    
    if readiness >= 80:
        st.success("🎉 Goal achieved! You're ready to book your test!")
    else:
        remaining = 80 - readiness
        st.info(f"💪 {remaining} points to go! Keep practicing.")
    
    st.markdown("---")
    
    # Sub-goals
    st.markdown("### Weekly Goals")
    
    goals = [
        {
            "name": "Complete 3 Practice Sessions",
            "current": min(3, st.session_state.sessions_completed),
            "target": 3,
            "icon": "🎮"
        },
        {
            "name": "Earn 200 XP",
            "current": min(200, st.session_state.xp),
            "target": 200,
            "icon": "⭐"
        },
        {
            "name": "Find 2 Test Slots",
            "current": min(2, len(st.session_state.slot_history)),
            "target": 2,
            "icon": "🎯"
        }
    ]
    
    for goal in goals:
        goal_pct = (goal['current'] / goal['target']) * 100
        status = "✅" if goal_pct >= 100 else "⏳"
        
        st.markdown(f"""
        <div class="dashboard-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div>
                    <span style="font-size: 1.5rem; margin-right: 0.5rem;">{goal['icon']}</span>
                    <strong>{goal['name']}</strong>
                </div>
                <div style="font-size: 1.5rem;">{status}</div>
            </div>
            <p style="margin: 0.3rem 0; color: #6b7280; font-size: 0.9rem;">
                {goal['current']}/{goal['target']} complete
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        st.progress(min(1.0, goal_pct / 100))
    
    st.markdown("---")
    
    # Recommendations
    st.markdown("### 💡 Recommended Next Steps")
    
    if readiness < 50:
        st.warning("""
        **Focus on fundamentals:**
        1. Complete 5 more practice sessions
        2. Review feedback on incorrect scenarios
        3. Target 70%+ accuracy before moving forward
        """)
    elif readiness < 80:
        st.info("""
        **You're making progress:**
        1. Keep practicing to maintain consistency
        2. Focus on your weak skills (check Skills Analysis)
        3. Consider finding a test slot to motivate yourself
        """)
    else:
        st.success("""
        **You're ready!**
        1. ✅ Find and book your test slot
        2. 🎯 Do 1-2 practice sessions per week to stay sharp
        3. 📋 Review the prep checklist for your test centre
        4. 🤝 Consider listing your current slot for a better date via swap market
        """)

# Action buttons at bottom
st.markdown("---")

action_col1, action_col2, action_col3, action_col4 = st.columns(4)

with action_col1:
    if st.button("🎮 Practice Drive", use_container_width=True):
        st.switch_page("pages/1_🤖_AI_Coach.py")

with action_col2:
    if st.button("🎯 Find Slots", use_container_width=True):
        st.switch_page("pages/2_🎯_Slot_Watch.py")

with action_col3:
    if st.button("🔄 Swap Market", use_container_width=True):
        st.switch_page("pages/3_🔄_Swap_Market.py")

with action_col4:
    if st.button("🗺️ Test Centres", use_container_width=True):
        st.switch_page("pages/4_🗺️_Centres.py")

# Footer
st.markdown("---")
st.caption("💚 TestBuddy IE • Building a Smarter Ireland • Keep practicing, stay safe, and good luck!")