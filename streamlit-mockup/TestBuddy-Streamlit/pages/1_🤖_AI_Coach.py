import streamlit as st
import json
import random
from datetime import datetime
import plotly.graph_objects as go

st.set_page_config(page_title="AI Practice Drive - TestBuddy IE", page_icon="🎮", layout="wide")

# Custom CSS for game aesthetics
st.markdown("""
<style>
    .scenario-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 16px;
        margin: 1rem 0;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
    }
    .choice-button {
        background: white;
        color: #667eea;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        margin: 0.5rem 0;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .choice-button:hover {
        border-color: #667eea;
        transform: translateX(5px);
    }
    .correct {
        background: #10b981 !important;
        color: white !important;
    }
    .incorrect {
        background: #ef4444 !important;
        color: white !important;
    }
    .xp-gain {
        animation: bounce 0.5s ease;
    }
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    .map-marker {
        font-size: 2rem;
        animation: pulse 2s infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'game_started' not in st.session_state:
    st.session_state.game_started = False
    st.session_state.current_scenario_idx = 0
    st.session_state.session_xp = 0
    st.session_state.decisions = []
    st.session_state.xp = st.session_state.get('total_xp', 0)
    st.session_state.sessions_completed = st.session_state.get('sessions', 0)
    st.session_state.show_feedback = False
    st.session_state.last_choice = None

# Load route data
@st.cache_data
def load_route_data():
    try:
        with open('data/tallaght_route.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Fallback mock data
        return {
            "route_name": "Tallaght Test Route",
            "centre": "Tallaght",
            "difficulty": "Medium",
            "waypoints": [
                {"lat": 53.2876, "lng": -6.3730, "name": "Test Centre Exit"},
                {"lat": 53.2891, "lng": -6.3745, "name": "First Roundabout"},
                {"lat": 53.2903, "lng": -6.3758, "name": "N81 Entry"},
                {"lat": 53.2920, "lng": -6.3770, "name": "Residential Area"},
                {"lat": 53.2935, "lng": -6.3755, "name": "Return to Centre"}
            ]
        }

@st.cache_data
def load_scenarios():
    try:
        with open('data/scenarios.json', 'r') as f:
            return json.load(f)['scenarios']
    except FileNotFoundError:
        # Fallback scenarios
        return [
            {
                "id": "roundabout_1",
                "waypoint_idx": 1,
                "location": "First Roundabout Approach",
                "situation": "🚗 You're approaching a busy roundabout. Traffic is flowing steadily from the right. A cyclist is ahead of you.",
                "image_hint": "🔄",
                "choices": [
                    {
                        "text": "Slow to 20km/h, check right mirror, shoulder check, yield to traffic, then enter when clear",
                        "correct": True,
                        "feedback": "Perfect! Excellent observation and positioning. The shoulder check for the cyclist was crucial.",
                        "xp": 50,
                        "skill": "observation"
                    },
                    {
                        "text": "Maintain 40km/h and enter quickly to avoid holding up traffic behind",
                        "correct": False,
                        "feedback": "Dangerous! You must yield to traffic from the right. Speed and impatience cause fails. This would be marked as a Grade 3 fault.",
                        "xp": 0,
                        "penalty": "FAIL",
                        "skill": "observation"
                    },
                    {
                        "text": "Stop completely at the yield line and wait 5 seconds before proceeding",
                        "correct": False,
                        "feedback": "Over-cautious. You should yield but not stop unnecessarily when it's clear. This causes traffic disruption.",
                        "xp": 15,
                        "skill": "observation"
                    }
                ]
            },
            {
                "id": "speed_zone",
                "waypoint_idx": 2,
                "location": "N81 Dual Carriageway",
                "situation": "⚡ You're merging onto the N81. Speed limit is 80km/h. Traffic in the left lane is moving at 75km/h.",
                "image_hint": "🛣️",
                "choices": [
                    {
                        "text": "Accelerate smoothly to 75km/h, check mirrors, signal, and merge when safe gap appears",
                        "correct": True,
                        "feedback": "Excellent! You matched traffic speed and merged safely. Good use of mirrors and signals.",
                        "xp": 50,
                        "skill": "speed_control"
                    },
                    {
                        "text": "Merge at 50km/h - better to be safe than sorry",
                        "correct": False,
                        "feedback": "Too slow! Merging well below traffic speed creates a hazard. You need to match the flow of traffic.",
                        "xp": 10,
                        "skill": "speed_control"
                    },
                    {
                        "text": "Accelerate to 85km/h to get ahead of traffic before merging",
                        "correct": False,
                        "feedback": "Speeding! Never exceed the limit, even when merging. Match traffic speed within the legal limit.",
                        "xp": 5,
                        "penalty": "Grade 2 Fault",
                        "skill": "speed_control"
                    }
                ]
            },
            {
                "id": "residential",
                "waypoint_idx": 3,
                "location": "Narrow Residential Street",
                "situation": "🏘️ You're on a narrow street with cars parked on both sides. A child's ball rolls into the road 30m ahead.",
                "image_hint": "⚽",
                "choices": [
                    {
                        "text": "Immediately slow down, cover the brake, scan for the child, and be prepared to stop completely",
                        "correct": True,
                        "feedback": "Perfect hazard perception! You anticipated that a child might follow the ball. This is exactly what examiners look for.",
                        "xp": 60,
                        "skill": "hazard_perception"
                    },
                    {
                        "text": "Maintain speed but sound horn to warn any children",
                        "correct": False,
                        "feedback": "Wrong! Sounding the horn doesn't remove the danger. You must slow down. This shows poor hazard awareness.",
                        "xp": 0,
                        "penalty": "FAIL",
                        "skill": "hazard_perception"
                    },
                    {
                        "text": "Swerve around the ball to maintain progress",
                        "correct": False,
                        "feedback": "Dangerous! Never swerve suddenly - you could hit an oncoming car or lose control. Always slow down first.",
                        "xp": 5,
                        "skill": "hazard_perception"
                    }
                ]
            },
            {
                "id": "parking",
                "waypoint_idx": 3,
                "location": "Side Street - Parking Manoeuvre",
                "situation": "🅿️ The examiner asks you to reverse around the corner on your left. There's a lamppost on the corner.",
                "image_hint": "🔙",
                "choices": [
                    {
                        "text": "Check all mirrors, signal left, stop parallel to kerb, then reverse slowly with constant observation all around, keeping within 30cm of kerb",
                        "correct": True,
                        "feedback": "Textbook reversing! Constant observation and good positioning. You stayed close to the kerb without mounting it.",
                        "xp": 55,
                        "skill": "manoeuvres"
                    },
                    {
                        "text": "Reverse quickly to show confidence, steering sharply to get around fast",
                        "correct": False,
                        "feedback": "Too fast! Manoeuvres should be slow and controlled. You risk hitting the kerb or the lamppost. This would fail you.",
                        "xp": 0,
                        "penalty": "FAIL",
                        "skill": "manoeuvres"
                    },
                    {
                        "text": "Position 50cm from kerb and reverse, focusing mainly on the rear window",
                        "correct": False,
                        "feedback": "Poor positioning - you're too far from the kerb. You must also check all around, not just the rear.",
                        "xp": 20,
                        "skill": "manoeuvres"
                    }
                ]
            },
            {
                "id": "junction",
                "waypoint_idx": 4,
                "location": "T-Junction Turn",
                "situation": "↩️ You need to turn right at a T-junction onto a busy main road. Visibility is limited due to a hedge.",
                "image_hint": "🌳",
                "choices": [
                    {
                        "text": "Approach slowly, stop at the line, creep forward for better view, check both ways multiple times, wait for a safe gap",
                        "correct": True,
                        "feedback": "Excellent! You compensated for poor visibility by creeping forward. Patient waiting for a proper gap shows good judgement.",
                        "xp": 50,
                        "skill": "junctions"
                    },
                    {
                        "text": "Edge out quickly to get a view, then commit to the turn if there's any gap",
                        "correct": False,
                        "feedback": "Dangerous! 'Edging out quickly' with limited visibility could cause a collision. Always creep forward slowly.",
                        "xp": 5,
                        "penalty": "Grade 3 Fault",
                        "skill": "junctions"
                    },
                    {
                        "text": "Wait at the line for 30 seconds to be sure it's safe",
                        "correct": False,
                        "feedback": "Over-cautious. You must creep forward to improve visibility - you can't see properly from the line due to the hedge.",
                        "xp": 15,
                        "skill": "junctions"
                    }
                ]
            }
        ]

route = load_route_data()
scenarios = load_scenarios()

# Helper functions
def calculate_readiness():
    """Calculate readiness score based on performance"""
    base_score = min(100, st.session_state.xp // 10)
    session_bonus = st.session_state.sessions_completed * 5
    
    correct_pct = 0
    if st.session_state.decisions:
        correct = sum(1 for d in st.session_state.decisions if d['correct'])
        correct_pct = (correct / len(st.session_state.decisions)) * 20
    
    return min(100, int(base_score + session_bonus + correct_pct))

def get_level_info(xp):
    """Get current level based on XP"""
    if xp < 200: return {"level": 1, "title": "🟢 Learner", "next": 200}
    elif xp < 500: return {"level": 2, "title": "🟡 Novice", "next": 500}
    elif xp < 1000: return {"level": 3, "title": "🟠 Competent", "next": 1000}
    elif xp < 2000: return {"level": 4, "title": "🔵 Skilled", "next": 2000}
    else: return {"level": 5, "title": "🟣 Test Ready", "next": None}

# Header with stats
st.title("🎮 AI Driving Coach - Practice Session")

# Top stats bar
stat_col1, stat_col2, stat_col3, stat_col4 = st.columns(4)

level_info = get_level_info(st.session_state.xp)
readiness = calculate_readiness()

with stat_col1:
    st.metric("Level", f"{level_info['level']} - {level_info['title']}")

with stat_col2:
    st.metric("Total XP", st.session_state.xp, 
              delta=f"+{st.session_state.session_xp}" if st.session_state.session_xp > 0 else None)

with stat_col3:
    correct = sum(1 for d in st.session_state.decisions if d['correct'])
    total = len(st.session_state.decisions)
    st.metric("Session Score", f"{correct}/{total}" if total > 0 else "0/0")

with stat_col4:
    st.metric("Readiness", f"{readiness}/100", 
              delta="Ready!" if readiness >= 80 else f"{80-readiness} to go")

# Progress bar
if level_info['next']:
    progress = st.session_state.xp / level_info['next']
    st.progress(progress, text=f"Progress to Level {level_info['level'] + 1}")

st.markdown("---")

# Game not started - Show intro
if not st.session_state.game_started:
    intro_col1, intro_col2 = st.columns([2, 1])
    
    with intro_col1:
        st.subheader(f"📍 {route['route_name']}")
        st.write(f"**Test Centre:** {route['centre']}")
        st.write(f"**Difficulty:** {route['difficulty']}")
        st.write(f"**Scenarios:** {len(scenarios)}")
        
        st.info("""
        **How it works:**
        - Drive through real test route scenarios
        - Make the right decisions at critical moments
        - Get instant AI feedback
        - Earn XP and level up your readiness score
        
        **Reach 80+ readiness before booking your real test!**
        """)
        
        if st.button("🚗 Start Practice Drive", type="primary", use_container_width=True):
            st.session_state.game_started = True
            st.session_state.current_scenario_idx = 0
            st.session_state.session_xp = 0
            st.session_state.decisions = []
            st.session_state.show_feedback = False
            st.rerun()
    
    with intro_col2:
        # Mini route map
        st.write("**Route Overview:**")
        for i, wp in enumerate(route['waypoints']):
            icon = "🏁" if i == 0 else ("🎯" if i == len(route['waypoints'])-1 else "📍")
            st.write(f"{icon} {wp['name']}")
        
        # Recent stats
        if st.session_state.sessions_completed > 0:
            st.write("---")
            st.write("**Your Stats:**")
            st.write(f"Sessions: {st.session_state.sessions_completed}")
            st.write(f"Best Score: {max([readiness, 0])}/100")

# Game in progress
elif st.session_state.current_scenario_idx < len(scenarios):
    scenario = scenarios[st.session_state.current_scenario_idx]
    
    # Progress indicator
    progress_text = f"Scenario {st.session_state.current_scenario_idx + 1} of {len(scenarios)}"
    scenario_progress = st.session_state.current_scenario_idx / len(scenarios)
    st.progress(scenario_progress, text=progress_text)
    
    st.markdown("---")
    
    # Scenario card
    scenario_col1, scenario_col2 = st.columns([3, 1])
    
    with scenario_col1:
        st.markdown(f"""
        <div class="scenario-card">
            <h2>{scenario['image_hint']} {scenario['location']}</h2>
            <p style="font-size: 1.2rem; margin-top: 1rem;">{scenario['situation']}</p>
        </div>
        """, unsafe_allow_html=True)
    
    with scenario_col2:
        # Mini map showing current location
        st.write("**Current Location:**")
        for i, wp in enumerate(route['waypoints']):
            if i == scenario.get('waypoint_idx', 0):
                st.write(f"👉 **{wp['name']}**")
            else:
                st.write(f"   {wp['name']}")
    
    # Show feedback if last choice was made
    if st.session_state.show_feedback and st.session_state.last_choice:
        choice = st.session_state.last_choice
        
        if choice['correct']:
            st.success(f"""
            ✅ **Correct!** +{choice['xp']} XP
            
            {choice['feedback']}
            """)
            st.balloons()
        else:
            st.error(f"""
            ❌ **Incorrect** {'- ' + choice.get('penalty', '') if choice.get('penalty') else ''}
            
            {choice['feedback']}
            """)
            if choice.get('penalty') == 'FAIL':
                st.warning("⚠️ This would result in a test failure!")
        
        st.markdown("---")
        
        if st.button("Continue to Next Scenario →", type="primary", use_container_width=True):
            st.session_state.current_scenario_idx += 1
            st.session_state.show_feedback = False
            st.session_state.last_choice = None
            st.rerun()
    
    # Show choices
    else:
        st.subheader("🤔 What do you do?")
        
        for i, choice in enumerate(scenario['choices']):
            choice_key = f"choice_{st.session_state.current_scenario_idx}_{i}"
            
            if st.button(
                choice['text'],
                key=choice_key,
                use_container_width=True,
                type="primary" if i == 0 else "secondary"
            ):
                # Record decision
                decision = {
                    'scenario_id': scenario['id'],
                    'location': scenario['location'],
                    'correct': choice['correct'],
                    'xp_earned': choice['xp'],
                    'skill': choice.get('skill', 'general'),
                    'timestamp': datetime.now().isoformat()
                }
                
                st.session_state.decisions.append(decision)
                st.session_state.session_xp += choice['xp']
                st.session_state.last_choice = choice
                st.session_state.show_feedback = True
                st.rerun()

# Session complete
else:
    st.balloons()
    st.success("🎉 Practice Session Complete!")
    
    # Calculate final stats
    correct_decisions = sum(1 for d in st.session_state.decisions if d['correct'])
    total_decisions = len(st.session_state.decisions)
    accuracy = (correct_decisions / total_decisions * 100) if total_decisions > 0 else 0
    
    # Update global stats
    st.session_state.xp += st.session_state.session_xp
    st.session_state.sessions_completed += 1
    new_readiness = calculate_readiness()
    
    st.markdown("---")
    
    # Summary stats
    summary_col1, summary_col2, summary_col3 = st.columns(3)
    
    with summary_col1:
        st.metric("XP Earned", st.session_state.session_xp)
    
    with summary_col2:
        st.metric("Accuracy", f"{accuracy:.0f}%")
    
    with summary_col3:
        st.metric("New Readiness", f"{new_readiness}/100")
    
    # Performance gauge
    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=new_readiness,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': "Test Readiness", 'font': {'size': 24}},
        delta={'reference': 80, 'suffix': " to target"},
        gauge={
            'axis': {'range': [None, 100], 'tickwidth': 1},
            'bar': {'color': "#10b981" if new_readiness >= 80 else "#f59e0b"},
            'bgcolor': "white",
            'borderwidth': 2,
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
    
    fig.update_layout(
        height=300,
        margin=dict(l=20, r=20, t=60, b=20),
        paper_bgcolor="rgba(0,0,0,0)",
        font={'size': 16}
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Detailed feedback
    st.markdown("---")
    st.subheader("📊 Performance Breakdown")
    
    # Skills analysis
    skills = {}
    for d in st.session_state.decisions:
        skill = d.get('skill', 'general')
        if skill not in skills:
            skills[skill] = {'correct': 0, 'total': 0}
        skills[skill]['total'] += 1
        if d['correct']:
            skills[skill]['correct'] += 1
    
    skill_cols = st.columns(len(skills))
    for i, (skill, data) in enumerate(skills.items()):
        with skill_cols[i]:
            skill_pct = (data['correct'] / data['total'] * 100) if data['total'] > 0 else 0
            st.metric(
                skill.replace('_', ' ').title(),
                f"{skill_pct:.0f}%",
                f"{data['correct']}/{data['total']}"
            )
    
    # Personalized feedback
    st.markdown("---")
    st.subheader("🤖 AI Coach Feedback")
    
    if accuracy >= 80:
        st.success(f"""
        **Excellent work!** You got {correct_decisions} out of {total_decisions} scenarios correct.
        
        ✅ **Strengths:** Your decision-making is solid. You're showing good hazard awareness and proper observation.
        
        📋 **Next Steps:** 
        - Complete 1-2 more sessions to maintain sharpness
        - You're ready to book your test! Aim for a readiness score of 80+
        """)
    elif accuracy >= 60:
        st.info(f"""
        **Good progress!** You got {correct_decisions} out of {total_decisions} scenarios correct.
        
        ✅ **Strengths:** You're getting the fundamentals right.
        
        ⚠️ **Areas to improve:** Focus on the scenarios you got wrong. Review the feedback carefully.
        
        📋 **Next Steps:** 
        - Practice 2-3 more sessions focusing on your weak skills
        - Target: 80%+ accuracy before booking
        """)
    else:
        st.warning(f"""
        **Keep practicing!** You got {correct_decisions} out of {total_decisions} scenarios correct.
        
        ⚠️ **Areas to improve:** You need more practice on core skills like observation, speed control, and hazard perception.
        
        📋 **Next Steps:** 
        - Review the feedback for each scenario
        - Practice 5+ more sessions before considering booking
        - Consider professional lessons to reinforce these skills
        """)
    
    # Scenario review
    with st.expander("📋 Review All Scenarios"):
        for i, decision in enumerate(st.session_state.decisions):
            scenario = scenarios[i]
            icon = "✅" if decision['correct'] else "❌"
            st.write(f"{icon} **{scenario['location']}** - {decision['xp_earned']} XP - {decision['skill'].replace('_', ' ').title()}")
    
    # Action buttons
    st.markdown("---")
    action_col1, action_col2, action_col3 = st.columns(3)
    
    with action_col1:
        if st.button("🔄 Practice Again", use_container_width=True):
            st.session_state.game_started = False
            st.rerun()
    
    with action_col2:
        if st.button("📊 View Progress", use_container_width=True):
            st.switch_page("pages/6_📊_Dashboard.py")
    
    with action_col3:
        if new_readiness >= 80:
            if st.button("🎯 Find Test Slots", type="primary", use_container_width=True):
                st.switch_page("pages/2_🎯_Slot_Watch.py")

# Footer tips
if not st.session_state.game_started or st.session_state.current_scenario_idx >= len(scenarios):
    st.markdown("---")
    with st.expander("💡 Tips for Real Test Success"):
        st.write("""
        1. **Observation is key** - Examiners watch your mirror checks constantly
        2. **Smooth is fast** - Jerky movements show lack of control
        3. **Speed appropriately** - Match the speed limit and traffic flow
        4. **Communicate clearly** - Use signals early and obviously
        5. **Stay calm** - One minor fault won't fail you, but panicking might
        
        **Common fail reasons in Ireland:**
        - Failing to observe at junctions (38%)
        - Incorrect use of mirrors (24%)
        - Poor positioning (18%)
        - Speed inappropriate for conditions (12%)
        - Manoeuvres not completed safely (8%)
        """)