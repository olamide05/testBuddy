# pages/4_🗺️_Centres.py
import streamlit as st
import pandas as pd
import folium
from streamlit_folium import folium_static
from folium.plugins import MarkerCluster, HeatMap
from datetime import datetime
import math

st.set_page_config(page_title="Test Centres - TestBuddy IE", page_icon="🗺️", layout="wide")

# Custom CSS
st.markdown("""
<style>
    .centre-card {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.5rem;
        margin: 0.5rem 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        transition: all 0.3s ease;
    }
    .centre-card:hover {
        border-color: #667eea;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
        transform: translateY(-2px);
    }
    .metric-box {
        background: #f9fafb;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        border: 1px solid #e5e7eb;
    }
    .stat-good {
        color: #10b981;
        font-weight: 600;
    }
    .stat-medium {
        color: #f59e0b;
        font-weight: 600;
    }
    .stat-bad {
        color: #ef4444;
        font-weight: 600;
    }
    .difficulty-badge {
        display: inline-block;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    .difficulty-low {
        background: #d1fae5;
        color: #065f46;
    }
    .difficulty-medium {
        background: #fef3c7;
        color: #92400e;
    }
    .difficulty-high {
        background: #fee2e2;
        color: #991b1b;
    }
</style>
""", unsafe_allow_html=True)

# Simple simulated locations for mock mode (no API needed)
SIMULATED_LOCATIONS = {
    "Dublin City Centre": (53.3498, -6.2603, "Dublin City Centre, Ireland"),
    "Cork City Centre": (51.8985, -8.4730, "Cork City Centre, Ireland"),
    "Galway City Centre": (53.2707, -9.0568, "Galway City Centre, Ireland"),
    "Limerick City Centre": (52.6638, -8.6267, "Limerick City Centre, Ireland"),
    "Waterford City Centre": (52.2593, -7.1101, "Waterford City Centre, Ireland"),
    "Tallaght, Dublin": (53.2876, -6.3730, "Tallaght, Dublin 24"),
    "Rathgar, Dublin": (53.3140, -6.2690, "Rathgar, Dublin 6"),
}

# Test centres data (real Irish locations)
CENTRES_DATA = pd.DataFrame([
    {
        "centre": "Tallaght",
        "address": "Airton Road, Tallaght, Dublin 24",
        "lat": 53.2876,
        "lng": -6.3730,
        "avg_wait_weeks": 24,
        "pass_rate": 49.3,
        "slots_per_week": 65,
        "difficulty": "High",
        "phone": "01 602 7700",
        "common_fails": ["Roundabout observation", "Mirror checks", "Speed control N81"],
        "route_highlights": ["Belgard Road roundabout", "N81 dual carriageway", "Residential estates"],
        "tips": "Very busy centre. Book early morning slots for less traffic. Practice the Belgard roundabout extensively."
    },
    {
        "centre": "Rathgar",
        "address": "Orwell Road, Rathgar, Dublin 6",
        "lat": 53.3140,
        "lng": -6.2690,
        "avg_wait_weeks": 18,
        "pass_rate": 54.1,
        "slots_per_week": 55,
        "difficulty": "Medium",
        "phone": "01 602 7700",
        "common_fails": ["Reverse parking", "Narrow streets", "Cyclist awareness"],
        "route_highlights": ["Orwell Road", "Rathgar village", "Terenure"],
        "tips": "Lots of cyclists and narrow Victorian streets. Practice reversing around corners."
    },
    {
        "centre": "Cork",
        "address": "Blackash Road, Cork",
        "lat": 51.8985,
        "lng": -8.4756,
        "avg_wait_weeks": 14,
        "pass_rate": 52.2,
        "slots_per_week": 70,
        "difficulty": "Medium",
        "phone": "021 431 2444",
        "common_fails": ["Junction positioning", "Gear control", "Observation"],
        "route_highlights": ["Blackash roundabout", "South Link Road", "Residential areas"],
        "tips": "Hilly terrain - practice hill starts. Busy roundabouts require good observation."
    },
    {
        "centre": "Wilton",
        "address": "Sarsfield Road, Wilton, Cork",
        "lat": 51.8822,
        "lng": -8.5051,
        "avg_wait_weeks": 12,
        "pass_rate": 56.7,
        "slots_per_week": 60,
        "difficulty": "Low",
        "phone": "021 434 5677",
        "common_fails": ["Speed management", "Signaling", "Manoeuvres"],
        "route_highlights": ["Wilton Shopping Centre", "Bishopstown", "Model Farm Road"],
        "tips": "More suburban, less traffic than city centre. Good pass rates - popular choice."
    },
    {
        "centre": "Galway",
        "address": "Doughiska, Merlin Park, Galway",
        "lat": 53.2889,
        "lng": -8.9933,
        "avg_wait_weeks": 16,
        "pass_rate": 51.8,
        "slots_per_week": 50,
        "difficulty": "Medium",
        "phone": "091 751 666",
        "common_fails": ["Roundabout approach", "Road positioning", "Speed control"],
        "route_highlights": ["Doughiska roundabout", "Merlin Park", "Ballybrit"],
        "tips": "Wind can be a factor. Multiple roundabouts on test routes."
    },
    {
        "centre": "Limerick",
        "address": "Dooradoyle Road, Limerick",
        "lat": 52.6387,
        "lng": -8.6439,
        "avg_wait_weeks": 15,
        "pass_rate": 50.5,
        "slots_per_week": 48,
        "difficulty": "Medium",
        "phone": "061 227 555",
        "common_fails": ["Junction approach", "Observation", "Positioning"],
        "route_highlights": ["Dooradoyle", "Raheen", "Childers Road"],
        "tips": "Busy dual carriageways. Practice merging and lane discipline."
    },
    {
        "centre": "Waterford",
        "address": "Cork Road, Waterford",
        "lat": 52.2458,
        "lng": -7.1306,
        "avg_wait_weeks": 13,
        "pass_rate": 53.4,
        "slots_per_week": 42,
        "difficulty": "Low",
        "phone": "051 358 555",
        "common_fails": ["Mirror usage", "Speed", "Reverse parking"],
        "route_highlights": ["Cork Road", "Waterford Institute", "Residential areas"],
        "tips": "Good pass rates. Less traffic than larger cities. Comprehensive preparation recommended."
    },
    {
        "centre": "Cavan",
        "address": "Dublin Road, Cavan",
        "lat": 53.9908,
        "lng": -7.3604,
        "avg_wait_weeks": 10,
        "pass_rate": 58.2,
        "slots_per_week": 35,
        "difficulty": "Low",
        "phone": "049 436 1200",
        "common_fails": ["Rural junctions", "Speed adjustment", "Observation"],
        "route_highlights": ["Dublin Road", "Town centre", "Rural routes"],
        "tips": "Highest pass rate! Less traffic, but don't underestimate rural junction complexity."
    }
])

# Initialize session state
if 'selected_centre' not in st.session_state:
    st.session_state.selected_centre = None
if 'user_location' not in st.session_state:
    st.session_state.user_location = None

# Header
st.title("🗺️ Test Centre Intelligence")
st.caption("Smart insights to help you choose the right test centre")

st.markdown("---")

# Tabs
tab1, tab2, tab3, tab4 = st.tabs(["🗺️ Map View", "📊 Compare Centres", "📍 Find Nearest", "💡 Insights"])

# TAB 1: Map View
with tab1:
    st.subheader("Interactive Map of Irish Test Centres")
    
    # Map controls
    map_col1, map_col2, map_col3 = st.columns(3)
    
    with map_col1:
        map_mode = st.selectbox(
            "Color by",
            ["Wait Time", "Pass Rate", "Difficulty", "Slots/Week"]
        )
    
    with map_col2:
        show_clusters = st.checkbox("Cluster markers", value=False)
    
    with map_col3:
        show_heatmap = st.checkbox("Show heatmap (wait times)", value=False)
    
    # Create map
    ireland_center = [53.4129, -8.2439]
    m = folium.Map(
        location=ireland_center,
        zoom_start=7,
        tiles='OpenStreetMap'
    )
    
    # Add tile layers
    folium.TileLayer('cartodbpositron', name='Light Mode').add_to(m)
    folium.TileLayer('cartodbdark_matter', name='Dark Mode').add_to(m)
    
    # Determine marker colors based on selected mode
    def get_marker_color(row, mode):
        if mode == "Wait Time":
            weeks = row['avg_wait_weeks']
            if weeks >= 20: return 'red'
            elif weeks >= 15: return 'orange'
            else: return 'green'
        elif mode == "Pass Rate":
            rate = row['pass_rate']
            if rate >= 55: return 'green'
            elif rate >= 50: return 'orange'
            else: return 'red'
        elif mode == "Difficulty":
            diff = row['difficulty']
            if diff == "Low": return 'green'
            elif diff == "Medium": return 'orange'
            else: return 'red'
        else:  # Slots/Week
            slots = row['slots_per_week']
            if slots >= 60: return 'green'
            elif slots >= 50: return 'orange'
            else: return 'red'
    
    # Add markers
    if show_clusters:
        marker_cluster = MarkerCluster().add_to(m)
        target_map = marker_cluster
    else:
        target_map = m
    
    for _, row in CENTRES_DATA.iterrows():
        color = get_marker_color(row, map_mode)
        
        # Create popup content
        popup_html = f"""
        <div style="width: 250px; font-family: Arial;">
            <h4 style="margin: 0 0 0.5rem 0; color: #1f2937;">{row['centre']}</h4>
            <p style="margin: 0.3rem 0; font-size: 0.9rem; color: #6b7280;">{row['address']}</p>
            <hr style="margin: 0.5rem 0;">
            <p style="margin: 0.3rem 0;"><strong>Wait:</strong> {row['avg_wait_weeks']} weeks</p>
            <p style="margin: 0.3rem 0;"><strong>Pass Rate:</strong> {row['pass_rate']}%</p>
            <p style="margin: 0.3rem 0;"><strong>Difficulty:</strong> {row['difficulty']}</p>
            <p style="margin: 0.3rem 0;"><strong>Phone:</strong> {row['phone']}</p>
        </div>
        """
        
        folium.Marker(
            location=[row['lat'], row['lng']],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=f"{row['centre']} - {row['avg_wait_weeks']}w wait",
            icon=folium.Icon(color=color, icon='car', prefix='fa')
        ).add_to(target_map)
    
    # Add heatmap if enabled
    if show_heatmap:
        heat_data = [
            [row['lat'], row['lng'], row['avg_wait_weeks']]
            for _, row in CENTRES_DATA.iterrows()
        ]
        HeatMap(heat_data, radius=50, blur=40, max_zoom=10).add_to(m)
    
    # Add layer control
    folium.LayerControl().add_to(m)
    
    # Display map
    folium_static(m, width=1000, height=600)
    
    # Legend
    st.markdown("---")
    legend_col1, legend_col2, legend_col3 = st.columns(3)
    
    with legend_col1:
        st.markdown("🟢 **Green:** Good (short wait/high pass rate)")
    with legend_col2:
        st.markdown("🟠 **Orange:** Medium")
    with legend_col3:
        st.markdown("🔴 **Red:** Long wait/low pass rate")

# TAB 2: Compare Centres
with tab2:
    st.subheader("📊 Centre Comparison Tool")
    
    # Select centres to compare
    compare_centres = st.multiselect(
        "Select 2-4 centres to compare",
        CENTRES_DATA['centre'].tolist(),
        default=['Tallaght', 'Rathgar', 'Cork']
    )
    
    if len(compare_centres) < 2:
        st.info("👆 Select at least 2 centres to compare")
    else:
        # Filter data
        compare_df = CENTRES_DATA[CENTRES_DATA['centre'].isin(compare_centres)].copy()
        
        # Metrics comparison
        st.markdown("### Key Metrics")
        
        metric_cols = st.columns(len(compare_centres))
        
        for i, centre in enumerate(compare_centres):
            centre_data = compare_df[compare_df['centre'] == centre].iloc[0]
            
            with metric_cols[i]:
                st.markdown(f"""
                <div class="centre-card">
                    <h3 style="margin: 0 0 1rem 0; text-align: center;">{centre}</h3>
                    
                    <div class="metric-box" style="margin: 0.5rem 0;">
                        <p style="margin: 0; font-size: 0.9rem; color: #6b7280;">Wait Time</p>
                        <p class="{'stat-good' if centre_data['avg_wait_weeks'] < 15 else 'stat-medium' if centre_data['avg_wait_weeks'] < 20 else 'stat-bad'}" style="margin: 0.2rem 0 0 0; font-size: 1.5rem;">
                            {centre_data['avg_wait_weeks']}w
                        </p>
                    </div>
                    
                    <div class="metric-box" style="margin: 0.5rem 0;">
                        <p style="margin: 0; font-size: 0.9rem; color: #6b7280;">Pass Rate</p>
                        <p class="{'stat-good' if centre_data['pass_rate'] >= 55 else 'stat-medium' if centre_data['pass_rate'] >= 50 else 'stat-bad'}" style="margin: 0.2rem 0 0 0; font-size: 1.5rem;">
                            {centre_data['pass_rate']}%
                        </p>
                    </div>
                    
                    <div class="metric-box" style="margin: 0.5rem 0;">
                        <p style="margin: 0; font-size: 0.9rem; color: #6b7280;">Difficulty</p>
                        <p style="margin: 0.5rem 0 0 0;">
                            <span class="difficulty-badge difficulty-{centre_data['difficulty'].lower()}">
                                {centre_data['difficulty']}
                            </span>
                        </p>
                    </div>
                    
                    <div class="metric-box" style="margin: 0.5rem 0;">
                        <p style="margin: 0; font-size: 0.9rem; color: #6b7280;">Weekly Slots</p>
                        <p style="margin: 0.2rem 0 0 0; font-size: 1.3rem; font-weight: 600;">
                            {centre_data['slots_per_week']}
                        </p>
                    </div>
                </div>
                """, unsafe_allow_html=True)
        
        # Detailed comparison table
        st.markdown("---")
        st.markdown("### Detailed Comparison")
        
        comparison_table = compare_df[[
            'centre', 'avg_wait_weeks', 'pass_rate', 'difficulty',
            'slots_per_week', 'phone'
        ]].copy()
        
        comparison_table.columns = ['Centre', 'Wait (weeks)', 'Pass Rate (%)', 
                                   'Difficulty', 'Weekly Slots', 'Phone']
        
        st.dataframe(
            comparison_table,
            use_container_width=True,
            hide_index=True
        )
        
        # Common fails comparison
        st.markdown("---")
        st.markdown("### Common Fail Reasons by Centre")
        
        for centre in compare_centres:
            centre_data = compare_df[compare_df['centre'] == centre].iloc[0]
            
            with st.expander(f"📋 {centre} - Common Fails"):
                for i, fail in enumerate(centre_data['common_fails'], 1):
                    st.write(f"{i}. {fail}")
                
                st.info(f"**💡 Tip:** {centre_data['tips']}")

# TAB 3: Find Nearest
with tab3:
    st.subheader("📍 Find Your Nearest Test Centres")
    
    st.info("💡 Select your location to find test centres ranked by distance")
    
    # Location input (simulated - no API needed)
    input_col1, input_col2 = st.columns([3, 1])
    
    with input_col1:
        sim_choice = st.selectbox(
            "Select your location",
            list(SIMULATED_LOCATIONS.keys()),
            help="Choose the area closest to you"
        )
    
    with input_col2:
        search_btn = st.button("🔍 Find Centres", type="primary", use_container_width=True)
    
    if search_btn and sim_choice:
        user_lat, user_lng, user_formatted = SIMULATED_LOCATIONS[sim_choice]
        st.success(f"✅ Location: {user_formatted}")
        st.session_state.user_location = {'lat': user_lat, 'lng': user_lng, 'address': user_formatted}
        
        # Haversine distance function
        def haversine_distance(lat1, lon1, lat2, lon2):
            """Calculate distance between two points in km"""
            R = 6371  # Earth's radius in km
            lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            return R * c
        
        # Calculate distances
        distances = []
        drive_times = []
        
        for _, row in CENTRES_DATA.iterrows():
            dist = haversine_distance(user_lat, user_lng, row['lat'], row['lng'])
            distances.append(dist)
            # Estimate drive time (rough: avg 60km/h)
            drive_time_mins = int((dist / 60) * 60)
            drive_times.append(drive_time_mins)
        
        results_df = CENTRES_DATA.copy()
        results_df['distance_km'] = distances
        results_df['drive_time_mins'] = drive_times
        results_df = results_df.sort_values('distance_km')
        
        # Display results
        st.markdown("---")
        st.markdown("### 🎯 Recommended Centres (Nearest First)")
        
        for idx, (_, row) in enumerate(results_df.iterrows(), 1):
            rank_icon = "🥇" if idx == 1 else "🥈" if idx == 2 else "🥉" if idx == 3 else f"{idx}."
            
            st.markdown(f"""
            <div class="centre-card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin: 0;">{rank_icon} {row['centre']}</h3>
                        <p style="margin: 0.3rem 0; color: #6b7280;">{row['address']}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; font-size: 1.3rem; font-weight: 700; color: #667eea;">
                            {row['distance_km']:.1f} km
                        </p>
                        <p style="margin: 0.2rem 0 0 0; color: #6b7280;">
                            ~{row['drive_time_mins']} min drive
                        </p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-top: 1rem;">
                    <div class="metric-box">
                        <p style="margin: 0; font-size: 0.8rem; color: #6b7280;">Wait</p>
                        <p class="{'stat-good' if row['avg_wait_weeks'] < 15 else 'stat-medium' if row['avg_wait_weeks'] < 20 else 'stat-bad'}" style="margin: 0.2rem 0 0 0; font-size: 1.2rem;">
                            {row['avg_wait_weeks']}w
                        </p>
                    </div>
                    <div class="metric-box">
                        <p style="margin: 0; font-size: 0.8rem; color: #6b7280;">Pass Rate</p>
                        <p class="{'stat-good' if row['pass_rate'] >= 55 else 'stat-medium' if row['pass_rate'] >= 50 else 'stat-bad'}" style="margin: 0.2rem 0 0 0; font-size: 1.2rem;">
                            {row['pass_rate']}%
                        </p>
                    </div>
                    <div class="metric-box">
                        <p style="margin: 0; font-size: 0.8rem; color: #6b7280;">Difficulty</p>
                        <p style="margin: 0.3rem 0 0 0;">
                            <span class="difficulty-badge difficulty-{row['difficulty'].lower()}" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">
                                {row['difficulty']}
                            </span>
                        </p>
                    </div>
                    <div class="metric-box">
                        <p style="margin: 0; font-size: 0.8rem; color: #6b7280;">Slots/Week</p>
                        <p style="margin: 0.2rem 0 0 0; font-size: 1.2rem; font-weight: 600;">
                            {row['slots_per_week']}
                        </p>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            detail_col1, detail_col2 = st.columns([3, 1])
            
            with detail_col1:
                with st.expander(f"📋 View Details for {row['centre']}"):
                    st.write(f"**Phone:** {row['phone']}")
                    st.write(f"**Route Highlights:** {', '.join(row['route_highlights'])}")
                    st.write(f"**Common Fails:** {', '.join(row['common_fails'])}")
                    st.info(f"**💡 Tip:** {row['tips']}")
            
            with detail_col2:
                directions_url = f"https://www.google.com/maps/dir/?api=1&origin={user_lat},{user_lng}&destination={row['lat']},{row['lng']}"
                st.link_button(
                    "🗺️ Directions",
                    directions_url,
                    use_container_width=True
                )
        
        # Show map with user location
        st.markdown("---")
        st.markdown("### 📍 Your Location vs Test Centres")
        
        user_map = folium.Map(
            location=[user_lat, user_lng],
            zoom_start=9
        )
        
        # Add user location marker
        folium.Marker(
            location=[user_lat, user_lng],
            popup="Your Location",
            tooltip="You are here",
            icon=folium.Icon(color='blue', icon='home', prefix='fa')
        ).add_to(user_map)
        
        # Add centre markers
        for _, row in results_df.iterrows():
            folium.Marker(
                location=[row['lat'], row['lng']],
                popup=f"{row['centre']}<br>{row['distance_km']:.1f} km away",
                tooltip=f"{row['centre']} - {row['distance_km']:.1f} km",
                icon=folium.Icon(color='red', icon='car', prefix='fa')
            ).add_to(user_map)
            
            # Draw line from user to centre
            folium.PolyLine(
                locations=[[user_lat, user_lng], [row['lat'], row['lng']]],
                color='blue',
                weight=2,
                opacity=0.5,
                dash_array='5'
            ).add_to(user_map)
        
        folium_static(user_map, width=1000, height=500)

# TAB 4: Insights
with tab4:
    st.subheader("💡 Test Centre Insights & Tips")
    
    # Best/worst performers
    insight_col1, insight_col2 = st.columns(2)
    
    with insight_col1:
        st.markdown("### 🏆 Top Performers")
        
        # Shortest wait
        shortest_wait = CENTRES_DATA.nsmallest(3, 'avg_wait_weeks')
        st.write("**Shortest Wait Times:**")
        for _, row in shortest_wait.iterrows():
            st.write(f"• **{row['centre']}** - {row['avg_wait_weeks']} weeks")
        
        st.markdown("---")
        
        # Highest pass rate
        highest_pass = CENTRES_DATA.nsmallest(3, 'pass_rate', keep='last').sort_values('pass_rate', ascending=False)
        st.write("**Highest Pass Rates:**")
        for _, row in highest_pass.iterrows():
            st.write(f"• **{row['centre']}** - {row['pass_rate']}%")
    
    with insight_col2:
        st.markdown("### ⚠️ Challenging Centres")
        
        # Longest wait
        longest_wait = CENTRES_DATA.nlargest(3, 'avg_wait_weeks')
        st.write("**Longest Wait Times:**")
        for _, row in longest_wait.iterrows():
            st.write(f"• **{row['centre']}** - {row['avg_wait_weeks']} weeks")
        
        st.markdown("---")
        
        # Lowest pass rate
        lowest_pass = CENTRES_DATA.nsmallest(3, 'pass_rate')
        st.write("**Most Challenging (Pass Rate):**")
        for _, row in lowest_pass.iterrows():
            st.write(f"• **{row['centre']}** - {row['pass_rate']}%")
    
    st.markdown("---")
    
    # General tips
    st.markdown("### 📋 General Tips for All Centres")
    
    tip_col1, tip_col2 = st.columns(2)
    
    with tip_col1:
        st.markdown("""
        **Before Your Test:**
        - Practice on the actual test routes
        - Book early morning slots when possible
        - Ensure your car is in perfect condition
        - Bring all required documents
        - Get a good night's sleep
        """)
    
    with tip_col2:
        st.markdown("""
        **During Your Test:**
        - Check mirrors constantly (examiners watch this!)
        - Communicate with clear signals
        - Don't rush - smooth is better than fast
        - Stay calm if you make a minor mistake
        - Ask for clarification if needed
        """)
    
    st.info("💡 **Pro Tip:** Consider choosing a centre with a shorter wait time and good pass rate, even if it means traveling further. The extra preparation time is worth it!")

# Footer
st.markdown("---")
st.caption("🇮🇪 TestBuddy IE Test Centre Intelligence • Data updated regularly • Always verify with RSA directly")