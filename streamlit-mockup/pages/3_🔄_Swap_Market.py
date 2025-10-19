# pages/3_🔄_Swap_Market.py
import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import random
import textwrap
import streamlit.components.v1 as components

st.set_page_config(page_title="Test Swap Market - TestBuddy IE", page_icon="🔄", layout="wide")

# Custom CSS
st.markdown("""
<style>
    .swap-card {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1rem 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        transition: all 0.3s ease;
    }
    .swap-card:hover {
        border-color: #667eea;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
        transform: translateY(-2px);
    }
    .match-badge {
        background: #10b981;
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        display: inline-block;
    }
    .pending-badge {
        background: #f59e0b;
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    .info-box {
        background: #f0f9ff;
        border-left: 4px solid #3b82f6;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
    }
    .success-box {
        background: #f0fdf4;
        border-left: 4px solid #10b981;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
    }
    .warning-box {
        background: #fffbeb;
        border-left: 4px solid #f59e0b;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
    }
    .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    .step-number {
        background: #667eea;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.2rem;
        margin-right: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'my_listings' not in st.session_state:
    st.session_state.my_listings = []
if 'swap_requests' not in st.session_state:
    st.session_state.swap_requests = []
if 'completed_swaps' not in st.session_state:
    st.session_state.completed_swaps = 0

# Mock swap listings data
MOCK_LISTINGS = [
    {
        "id": "SW001",
        "user": "Sarah M.",
        "user_location": "Dublin",
        "offering": {
            "centre": "Tallaght",
            "date": datetime.now() + timedelta(days=45),
            "time": "10:30"
        },
        "seeking": {
            "centres": ["Cork", "Wilton"],
            "date_range": (datetime.now() + timedelta(days=30), datetime.now() + timedelta(days=60)),
            "flexibility": "Weekends preferred"
        },
        "reason": "Moved to Cork for work",
        "posted": datetime.now() - timedelta(days=2),
        "match_score": 95
    },
    {
        "id": "SW002",
        "user": "Liam O.",
        "user_location": "Cork",
        "offering": {
            "centre": "Wilton",
            "date": datetime.now() + timedelta(days=38),
            "time": "14:30"
        },
        "seeking": {
            "centres": ["Tallaght", "Rathgar", "Dublin (any)"],
            "date_range": (datetime.now() + timedelta(days=35), datetime.now() + timedelta(days=50)),
            "flexibility": "Any weekday"
        },
        "reason": "Returning to Dublin",
        "posted": datetime.now() - timedelta(days=1),
        "match_score": 88
    },
    {
        "id": "SW003",
        "user": "Emma K.",
        "user_location": "Galway",
        "offering": {
            "centre": "Rathgar",
            "date": datetime.now() + timedelta(days=52),
            "time": "09:40"
        },
        "seeking": {
            "centres": ["Galway", "Limerick"],
            "date_range": (datetime.now() + timedelta(days=40), datetime.now() + timedelta(days=70)),
            "flexibility": "Mornings only"
        },
        "reason": "Studying in Galway",
        "posted": datetime.now() - timedelta(days=3),
        "match_score": 72
    },
    {
        "id": "SW004",
        "user": "Jack D.",
        "user_location": "Waterford",
        "offering": {
            "centre": "Cork",
            "date": datetime.now() + timedelta(days=41),
            "time": "13:20"
        },
        "seeking": {
            "centres": ["Waterford", "Kilkenny"],
            "date_range": (datetime.now() + timedelta(days=35), datetime.now() + timedelta(days=55)),
            "flexibility": "Weekends preferred"
        },
        "reason": "Closer to home",
        "posted": datetime.now() - timedelta(days=4),
        "match_score": 65
    },
    {
        "id": "SW005",
        "user": "Aoife B.",
        "user_location": "Limerick",
        "offering": {
            "centre": "Tallaght",
            "date": datetime.now() + timedelta(days=48),
            "time": "11:50"
        },
        "seeking": {
            "centres": ["Limerick", "Ennis"],
            "date_range": (datetime.now() + timedelta(days=40), datetime.now() + timedelta(days=60)),
            "flexibility": "Flexible"
        },
        "reason": "Family reasons",
        "posted": datetime.now() - timedelta(days=1),
        "match_score": 58
    }
]

# Header
st.title("🔄 Test Swap Market")
st.caption("Peer-to-peer test slot exchanges - Legal, guided, and safe")

# Top stats
stat_col1, stat_col2, stat_col3, stat_col4 = st.columns(4)

with stat_col1:
    st.markdown(f"""
    <div class="stat-card">
        <h3>{len(MOCK_LISTINGS)}</h3>
        <p style="margin:0; opacity:0.9;">Active Listings</p>
    </div>
    """, unsafe_allow_html=True)

with stat_col2:
    st.markdown(f"""
    <div class="stat-card">
        <h3>{len(st.session_state.my_listings)}</h3>
        <p style="margin:0; opacity:0.9;">Your Listings</p>
    </div>
    """, unsafe_allow_html=True)

with stat_col3:
    st.markdown(f"""
    <div class="stat-card">
        <h3>{len(st.session_state.swap_requests)}</h3>
        <p style="margin:0; opacity:0.9;">Pending Requests</p>
    </div>
    """, unsafe_allow_html=True)

with stat_col4:
    st.markdown(f"""
    <div class="stat-card">
        <h3>{st.session_state.completed_swaps}</h3>
        <p style="margin:0; opacity:0.9;">Swaps Completed</p>
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# Main tabs
tab1, tab2, tab3, tab4 = st.tabs(["🔍 Browse Swaps", "➕ List Your Test", "💬 My Requests", "❓ How It Works"])

# TAB 1: Browse Swaps
with tab1:
    st.subheader("Available Test Swaps")
    
    # Filters
    filter_col1, filter_col2, filter_col3 = st.columns(3)
    
    with filter_col1:
        filter_centre = st.multiselect(
            "Centres you want",
            ["Tallaght", "Rathgar", "Cork", "Wilton", "Galway", "Limerick", "Waterford", "Cavan"],
            help="Select centres you're looking for"
        )
    
    with filter_col2:
        filter_date_range = st.select_slider(
            "Date range (weeks from now)",
            options=["1-2", "3-4", "5-6", "7-8", "9+"],
            value="3-4"
        )
    
    with filter_col3:
        sort_by = st.selectbox(
            "Sort by",
            ["Match Score (High to Low)", "Date Posted (Recent)", "Date (Soonest)", "Location"]
        )
    
    # Filter listings based on selections
    filtered_listings = MOCK_LISTINGS.copy()
    
    if filter_centre:
        filtered_listings = [
            listing for listing in filtered_listings
            if listing["offering"]["centre"] in filter_centre
        ]
    
    # Sort listings
    if sort_by == "Match Score (High to Low)":
        filtered_listings.sort(key=lambda x: x["match_score"], reverse=True)
    elif sort_by == "Date Posted (Recent)":
        filtered_listings.sort(key=lambda x: x["posted"], reverse=True)
    elif sort_by == "Date (Soonest)":
        filtered_listings.sort(key=lambda x: x["offering"]["date"])
    
    st.markdown("---")
    
    if not filtered_listings:
        st.info("🔍 No swaps match your filters. Try adjusting your search criteria.")
    else:
        st.write(f"**Showing {len(filtered_listings)} swap{'s' if len(filtered_listings) > 1 else ''}**")
        
        # Display listings
        for listing in filtered_listings:
            offer_date = listing["offering"]["date"]
            seek_start = listing["seeking"]["date_range"][0]
            seek_end = listing["seeking"]["date_range"][1]
            days_ago = (datetime.now() - listing["posted"]).days
            
            # Match score color
            match_color = "#10b981" if listing["match_score"] >= 80 else "#f59e0b" if listing["match_score"] >= 60 else "#6b7280"
            
            # Create listing card with proper HTML rendering
            with st.container():
                components.html(
                    textwrap.dedent(f"""
                    <div class="swap-card">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <div>
                                <h3 style="margin: 0; color: #1f2937;">{listing["user"]} • {listing["user_location"]}</h3>
                                <p style="margin: 0.3rem 0 0 0; color: #6b7280; font-size: 0.9rem;">
                                    Posted {days_ago} day{"s" if days_ago != 1 else ""} ago
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <div style="background: {match_color}; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; display: inline-block;">
                                    {listing["match_score"]}% Match
                                </div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: center; margin: 1rem 0;">
                            <div style="background: #f9fafb; padding: 1rem; border-radius: 8px;">
                                <p style="margin: 0; font-weight: 600; color: #059669;">🎁 OFFERING:</p>
                                <p style="margin: 0.5rem 0 0 0; font-size: 1.1rem;"><strong>{listing["offering"]["centre"]}</strong></p>
                                <p style="margin: 0.3rem 0 0 0;">{offer_date.strftime("%a, %d %b %Y")}</p>
                                <p style="margin: 0.2rem 0 0 0; color: #6b7280;">{listing["offering"]["time"]}</p>
                            </div>
                            
                            <div style="text-align: center; font-size: 2rem;">
                                ↔️
                            </div>
                            
                            <div style="background: #f9fafb; padding: 1rem; border-radius: 8px;">
                                <p style="margin: 0; font-weight: 600; color: #dc2626;">🎯 SEEKING:</p>
                                <p style="margin: 0.5rem 0 0 0; font-size: 1.1rem;"><strong>{", ".join(listing["seeking"]["centres"])}</strong></p>
                                <p style="margin: 0.3rem 0 0 0;">{seek_start.strftime("%d %b")} - {seek_end.strftime("%d %b %Y")}</p>
                                <p style="margin: 0.2rem 0 0 0; color: #6b7280;">{listing["seeking"]["flexibility"]}</p>
                            </div>
                        </div>
                        
                        <p style="margin: 1rem 0 0.5rem 0; color: #6b7280;">
                            <strong>Reason:</strong> {listing["reason"]}
                        </p>
                    </div>
                    """),
                    height=300,
                    scrolling=True,
                )
                
                # Action buttons
                btn_col1, btn_col2, btn_col3 = st.columns([2, 2, 1])
                
                with btn_col1:
                    if st.button(f"💬 Propose Swap", key=f"propose_{listing['id']}", use_container_width=True):
                        st.session_state.swap_requests.append({
                            "listing_id": listing["id"],
                            "user": listing["user"],
                            "status": "pending",
                            "requested_at": datetime.now()
                        })
                        st.success(f"✅ Swap request sent to {listing['user']}!")
                        st.rerun()
                
                with btn_col2:
                    if st.button(f"📋 View Details", key=f"view_{listing['id']}", use_container_width=True):
                        with st.expander(f"Details for {listing['id']}", expanded=True):
                            st.write(f"""
                            **Full Details:**
                            - **Offering:** {listing["offering"]["centre"]} on {offer_date.strftime("%A, %d %B %Y")} at {listing["offering"]["time"]}
                            - **Seeking:** {", ".join(listing["seeking"]["centres"])}
                            - **Date Flexibility:** {seek_start.strftime("%d %b")} to {seek_end.strftime("%d %b %Y")}
                            - **Time Flexibility:** {listing["seeking"]["flexibility"]}
                            - **Reason:** {listing["reason"]}
                            - **Posted:** {days_ago} day{"s" if days_ago != 1 else ""} ago
                            - **User Location:** {listing["user_location"]}
                            
                            **Why this is a {listing["match_score"]}% match:**
                            - Centre compatibility
                            - Date range overlap
                            - Time flexibility alignment
                            """)
                
                with btn_col3:
                    if st.button("⭐", key=f"save_{listing['id']}", use_container_width=True, help="Save for later"):
                        st.toast("💾 Saved to your watchlist")
                
                st.markdown("<br>", unsafe_allow_html=True)  # Add spacing between cards

# TAB 2: List Your Test
with tab2:
    st.subheader("➕ List Your Test Slot for Swap")
    
    st.markdown("""
    <div class="info-box">
        <strong>ℹ️ Before listing:</strong>
        <ul>
            <li>Make sure you have a confirmed RSA test booking</li>
            <li>You'll need to coordinate the swap with your match via messages</li>
            <li>Both parties rebook on the RSA website - we guide the process</li>
            <li>Small escrow deposit (€10) held until swap confirmed</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Listing form
    with st.form("create_listing"):
        st.write("### 🎁 What You're Offering")
        
        offer_col1, offer_col2 = st.columns(2)
        
        with offer_col1:
            offer_centre = st.selectbox(
                "Test Centre",
                ["Tallaght", "Rathgar", "Cork", "Wilton", "Galway", "Limerick", "Waterford", "Cavan"]
            )
            offer_date = st.date_input(
                "Test Date",
                value=datetime.now() + timedelta(days=45),
                min_value=datetime.now() + timedelta(days=7)
            )
        
        with offer_col2:
            offer_time = st.time_input(
                "Test Time",
                value=datetime.strptime("10:30", "%H:%M").time()
            )
        
        st.markdown("---")
        st.write("### 🎯 What You're Seeking")
        
        seek_col1, seek_col2 = st.columns(2)
        
        with seek_col1:
            seek_centres = st.multiselect(
                "Preferred Centres",
                ["Tallaght", "Rathgar", "Cork", "Wilton", "Galway", "Limerick", "Waterford", "Cavan"],
                help="Select 1-3 centres you'd accept"
            )
            
            seek_date_start = st.date_input(
                "Earliest Date",
                value=datetime.now() + timedelta(days=30),
                min_value=datetime.now() + timedelta(days=7)
            )
        
        with seek_col2:
            flexibility = st.selectbox(
                "Time Flexibility",
                ["Any time", "Mornings only (before 12pm)", "Afternoons only (after 12pm)", "Weekends preferred", "Weekdays preferred"]
            )
            
            seek_date_end = st.date_input(
                "Latest Date",
                value=datetime.now() + timedelta(days=60),
                min_value=datetime.now() + timedelta(days=7)
            )
        
        reason = st.text_area(
            "Why are you swapping? (optional but helpful)",
            placeholder="e.g., Moved to Cork for work, need to be closer to home, etc.",
            max_chars=200
        )
        
        st.markdown("---")
        
        # Terms checkbox
        agree_terms = st.checkbox(
            "I agree to the swap terms (€10 escrow deposit, 48hr response time, RSA rebooking process)"
        )
        
        # Submit button
        submit_col1, submit_col2 = st.columns([3, 1])
        
        with submit_col1:
            submitted = st.form_submit_button(
                "🚀 List My Swap",
                type="primary",
                use_container_width=True,
                disabled=not agree_terms or not seek_centres
            )
        
        if submitted:
            if not seek_centres:
                st.error("❌ Please select at least one centre you're seeking")
            elif seek_date_start >= seek_date_end:
                st.error("❌ End date must be after start date")
            else:
                # Add to my listings
                new_listing = {
                    "id": f"SW{random.randint(100, 999)}",
                    "offering": {
                        "centre": offer_centre,
                        "date": offer_date,
                        "time": offer_time.strftime("%H:%M")
                    },
                    "seeking": {
                        "centres": seek_centres,
                        "date_range": (seek_date_start, seek_date_end),
                        "flexibility": flexibility
                    },
                    "reason": reason,
                    "posted": datetime.now(),
                    "status": "active"
                }
                
                st.session_state.my_listings.append(new_listing)
                st.success("✅ Your swap listing is now live!")
                st.balloons()
                
                st.info("""
                **Next steps:**
                1. ✅ Your listing is visible to all users
                2. 📬 You'll be notified when someone proposes a swap
                3. 💬 Review their offer and accept if it works
                4. 🔄 We'll guide you through the RSA rebooking process
                """)
    
    # Show user's active listings
    if st.session_state.my_listings:
        st.markdown("---")
        st.subheader("📋 Your Active Listings")
        
        for i, listing in enumerate(st.session_state.my_listings):
            st.markdown(f"""
            <div class="swap-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0;">{listing["offering"]["centre"]} → {", ".join(listing["seeking"]["centres"])}</h4>
                        <p style="margin: 0.3rem 0 0 0; color: #6b7280;">
                            Listed {(datetime.now() - listing["posted"]).days} day(s) ago
                        </p>
                    </div>
                    <span class="match-badge">Active</span>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            edit_col1, edit_col2 = st.columns(2)
            with edit_col1:
                if st.button(f"✏️ Edit", key=f"edit_listing_{i}", use_container_width=True):
                    st.info("Edit functionality coming soon!")
            with edit_col2:
                if st.button(f"🗑️ Remove", key=f"remove_listing_{i}", use_container_width=True):
                    st.session_state.my_listings.pop(i)
                    st.success("Listing removed")
                    st.rerun()

# TAB 3: My Requests
with tab3:
    st.subheader("💬 Swap Requests")
    
    if not st.session_state.swap_requests:
        st.info("📭 No swap requests yet. Browse available swaps and propose one!")
    else:
        st.write(f"**You have {len(st.session_state.swap_requests)} pending request(s)**")
        
        for i, request in enumerate(st.session_state.swap_requests):
            time_ago = datetime.now() - request["requested_at"]
            hours_ago = int(time_ago.total_seconds() / 3600)
            
            st.markdown(f"""
            <div class="swap-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0;">Swap with {request["user"]}</h4>
                        <p style="margin: 0.3rem 0 0 0; color: #6b7280;">
                            Requested {hours_ago} hour(s) ago • ID: {request["listing_id"]}
                        </p>
                    </div>
                    <span class="pending-badge">Pending</span>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            status_col1, status_col2, status_col3 = st.columns(3)
            
            with status_col1:
                if st.button(f"💬 Send Message", key=f"msg_{i}", use_container_width=True):
                    st.info("Messaging feature coming soon!")
            
            with status_col2:
                if st.button(f"🔔 Remind", key=f"remind_{i}", use_container_width=True):
                    st.success("Reminder sent!")
            
            with status_col3:
                if st.button(f"❌ Cancel", key=f"cancel_{i}", use_container_width=True):
                    st.session_state.swap_requests.pop(i)
                    st.warning("Request cancelled")
                    st.rerun()
        
        st.markdown("---")
        
        st.markdown("""
        <div class="info-box">
            <strong>⏱️ Response Times:</strong>
            <ul>
                <li>Users have 48 hours to respond to swap proposals</li>
                <li>You'll get email + push notification when they reply</li>
                <li>If no response after 48h, the request expires automatically</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

# TAB 4: How It Works
with tab4:
    st.subheader("❓ How Test Swaps Work")
    
    st.markdown("""
    ### 🤝 The Swap Process (Step-by-Step)
    """)
    
    # Step 1
    st.markdown("""
    <div style="display: flex; align-items: center; margin: 2rem 0;">
        <div class="step-number">1</div>
        <div>
            <h4 style="margin: 0;">List Your Test Slot</h4>
            <p style="margin: 0.3rem 0 0 0; color: #6b7280;">
                Post what you're offering and what you're looking for
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Step 2
    st.markdown("""
    <div style="display: flex; align-items: center; margin: 2rem 0;">
        <div class="step-number">2</div>
        <div>
            <h4 style="margin: 0;">Get Matched</h4>
            <p style="margin: 0.3rem 0 0 0; color: #6b7280;">
                Our algorithm finds compatible swaps and notifies both parties
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Step 3
    st.markdown("""
    <div style="display: flex; align-items: center; margin: 2rem 0;">
        <div class="step-number">3</div>
        <div>
            <h4 style="margin: 0;">Confirm Details</h4>
            <p style="margin: 0.3rem 0 0 0; color: #6b7280;">
                Message each other to confirm test details and exchange booking references
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Step 4
    st.markdown("""
    <div style="display: flex; align-items: center; margin: 2rem 0;">
        <div class="step-number">4</div>
        <div>
            <h4 style="margin: 0;">Pay Escrow (€10 each)</h4>
            <p style="margin: 0.3rem 0 0 0; color: #6b7280;">
                Small deposit ensures both parties follow through (refunded after swap)
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Step 5
    st.markdown("""
    <div style="display: flex; align-items: center; margin: 2rem 0;">
        <div class="step-number">5</div>
        <div>
            <h4 style="margin: 0;">Cancel Your Original Tests</h4>
            <p style="margin: 0.3rem 0 0 0; color: #6b7280;">
                Both of you cancel on the RSA website (we provide step-by-step guide)
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Step 6
    st.markdown("""
    <div style="display: flex; align-items: center; margin: 2rem 0;">
        <div class="step-number">6</div>
        <div>
            <h4 style="margin: 0;">Book Each Other's Slots</h4>
            <p style="margin: 0.3rem 0 0 0; color: #6b7280;">
                Once slots are freed up, quickly book the swapped times
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Step 7
    st.markdown("""
    <div style="display: flex; align-items: center; margin: 2rem 0;">
        <div class="step-number">7</div>
        <div>
            <h4 style="margin: 0;">Confirm & Get Refund</h4>
            <p style="margin: 0.3rem 0 0 0; color: #6b7280;">
                Upload proof of new booking, escrow released, swap complete! 🎉
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Legal & Safety
    st.subheader("⚖️ Is This Legal?")
    
    st.markdown("""
    <div class="success-box">
        <strong>✅ Yes, completely legal!</strong>
        <ul>
            <li><strong>You perform the actual rebooking</strong> - we just facilitate matching</li>
            <li><strong>No scalping</strong> - swaps are 1-for-1, no money changes hands (except escrow)</li>
            <li><strong>Mutual benefit</strong> - both parties want the swap</li>
            <li><strong>RSA-friendly</strong> - reduces no-shows and wasted slots</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Safety
    st.subheader("🛡️ Safety & Trust")
    
    st.markdown("""
    <div class="info-box">
        <strong>How we keep swaps safe:</strong>
        <ul>
            <li><strong>Verified bookings:</strong> Must upload RSA booking confirmation screenshot</li>
            <li><strong>Escrow protection:</strong> €10 deposit ensures both parties follow through</li>
            <li><strong>User ratings:</strong> Rate your swap partner after completion</li>
            <li><strong>Response deadlines:</strong> 48-hour response time keeps things moving</li>
            <li><strong>Dispute resolution:</strong> Support team available if issues arise</li>
            <li><strong>No cash exchanges:</strong> Only the 1-for-1 test swap (prevents scalping)</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Why This Helps Ireland
    st.subheader("🇮🇪 Why Swap Markets Help Ireland")
    
    st.markdown("""
    <div class="success-box">
        <strong>Benefits for everyone:</strong>
        <ul>
            <li><strong>Reduces no-shows:</strong> People who can't make their test can give it to someone who will</li>
            <li><strong>Fills wasted slots:</strong> ~5-8% of tests are no-shows - we recycle those</li>
            <li><strong>Helps rural learners:</strong> Trade Dublin slots for rural ones (or vice versa)</li>
            <li><strong>Speeds up licensing:</strong> Better slot utilization = shorter average wait times</li>
            <li><strong>RSA-friendly:</strong> We're solving their no-show problem, not creating it</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Common Questions
    st.subheader("💬 Common Questions")
    
    with st.expander("What if the other person doesn't cancel their test?"):
        st.write("""
        **Escrow protection covers this:**
        - Both parties pay €10 escrow when swap is confirmed
        - If someone doesn't follow through, they forfeit their deposit
        - The honest party gets refunded + compensation
        - Persistent offenders are banned from the platform
        """)
    
    with st.expander("Can I swap multiple times?"):
        st.write("""
        **Yes, but with limits:**
        - Free users: 1 active listing at a time
        - Pro users: 2 active listings
        - Must complete or cancel previous swap before listing again
        - This prevents gaming the system
        """)
    
    with st.expander("What if my test date changes after swapping?"):
        st.write("""
        **Life happens - we get it:**
        - You can list your newly-swapped slot for another swap
        - No penalty for genuine circumstances
        - Just be honest in your listing about why you're swapping again
        """)
    
    with st.expander("How quickly do swaps happen?"):
        st.write("""
        **Typical timeline:**
        - Match found: 2-5 days (depends on demand)
        - Confirmation: 1-2 days (both parties agree)
        - Rebooking: Same day (coordinated cancellation + booking)
        - **Total: 3-7 days** from listing to completed swap
        """)
    
    with st.expander("What if there's no perfect match?"):
        st.write("""
        **Our matching algorithm helps:**
        - We show "near matches" (85%+) where dates are close
        - You can adjust your preferences to increase matches
        - Set up alerts for new listings that match your criteria
        - Consider widening your date range or centre options
        """)
    
    with st.expander("Can I swap with someone outside Ireland?"):
        st.write("""
        **Currently Ireland-only:**
        - All swaps must be within Ireland's RSA system
        - UK expansion planned for 2026
        - Can't swap Irish test for UK test (different systems)
        """)
    
    st.markdown("---")
    
    # Fees
    st.subheader("💰 Fees & Pricing")
    
    fee_col1, fee_col2 = st.columns(2)
    
    with fee_col1:
        st.markdown("""
        **Free Tier:**
        - ✓ Browse all listings
        - ✓ List 1 swap at a time
        - ✓ Basic matching
        - ✓ €10 escrow (refunded)
        """)
    
    with fee_col2:
        st.markdown("""
        **Pro (€4.99/mo):**
        - ⚡ List 2 swaps simultaneously
        - ⚡ Priority matching
        - ⚡ Instant match alerts
        - ⚡ €5 escrow only
        """)
    
    st.info("💡 **No swap fees!** We only charge the monthly subscription. The escrow deposit is fully refunded after successful swaps.")
    
    st.markdown("---")
    
    # Success Stories
    st.subheader("⭐ Success Stories")
    
    story_col1, story_col2 = st.columns(2)
    
    with story_col1:
        st.markdown("""
        <div class="swap-card">
            <h4>"Saved me 8 weeks!"</h4>
            <p style="color: #6b7280; margin: 0.5rem 0;">
                "I was waiting till March but got a swap for late January. 
                The escrow system made me feel safe about the whole thing."
            </p>
            <p style="margin: 0.5rem 0 0 0;"><strong>- Sarah, Dublin → Cork swap</strong></p>
        </div>
        """, unsafe_allow_html=True)
    
    with story_col2:
        st.markdown("""
        <div class="swap-card">
            <h4>"Perfect for rural learners"</h4>
            <p style="color: #6b7280; margin: 0.5rem 0;">
                "Found someone in Dublin who wanted my Cavan slot. 
                We both got what we needed. Simple process!"
            </p>
            <p style="margin: 0.5rem 0 0 0;"><strong>- Liam, Cavan → Dublin swap</strong></p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Call to action
    st.markdown("""
    <div class="success-box" style="text-align: center; padding: 2rem;">
        <h3 style="margin: 0 0 1rem 0;">Ready to swap?</h3>
        <p style="margin: 0 0 1.5rem 0; font-size: 1.1rem;">
            Join hundreds of Irish learners who've found better test slots through swapping
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    action_col1, action_col2 = st.columns(2)
    
    with action_col1:
        if st.button("🔍 Browse Available Swaps", type="primary", use_container_width=True):
            st.session_state.active_tab = 0
            st.rerun()
    
    with action_col2:
        if st.button("➕ List Your Test", use_container_width=True):
            st.session_state.active_tab = 1
            st.rerun()

# Footer
st.markdown("---")
st.caption("""
**Legal Notice:** TestBuddy facilitates peer-to-peer test slot exchanges. Users are responsible for 
rebooking on the RSA website. We do not auto-book or handle RSA accounts. Escrow deposits are held 
by secure payment processor and released upon swap completion. All swaps are 1-for-1 with no cash 
exchange between parties.
""")

st.caption("🇮🇪 TestBuddy IE Swap Market • Making Irish driving tests more accessible")