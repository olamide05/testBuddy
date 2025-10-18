# pages/5_📋_Prep_Checklist.py
import streamlit as st

st.set_page_config(page_title="Prep Checklist - TestBuddy IE", page_icon="📋", layout="wide")
st.title("📋 Prep Checklist (Demo)")

centre = st.selectbox("Centre", ["Tallaght","Rathgar","Cork","Wilton"])
st.markdown("### Day-Before")
st.write("• NCT/insurance docs • L-plates front/rear • Tyres/lights • Clean windscreen")
st.markdown("### On the Route")
st.write("• Mirrors on approach to roundabouts • Speed control on dual carriageways")
st.markdown("### Manoeuvres")
st.write("• Reverse around corner (observation!) • Hill start • Parallel park if asked")
st.success("Tip: Practise the **decision points** in the AI Coach first, then book.")
