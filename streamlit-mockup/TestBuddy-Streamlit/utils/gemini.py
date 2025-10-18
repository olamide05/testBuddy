# utils/gemini.py
import google.generativeai as genai
import streamlit as st
import os

# Configure Gemini (you'll need API key from Google Cloud)
# genai.configure(api_key=os.environ['GOOGLE_API_KEY'])

@st.cache_data(ttl=3600)
def explain_pathway(pathway_name: str, genes: list, cancer_type: str):
    """
    Generate patient-friendly explanation of a biological pathway.
    
    Args:
        pathway_name: e.g., "PI3K/AKT pathway"
        genes: List of genes involved, e.g., ["PIK3CA", "AKT1", "PTEN"]
        cancer_type: e.g., "triple-negative breast cancer"
    
    Returns:
        Patient-friendly explanation (8th grade reading level)
    """
    
    prompt = f"""You are a compassionate oncology educator. Explain the {pathway_name} to a patient with {cancer_type}.

**Context:**
- Key genes involved: {', '.join(genes)}
- Patient has no biology background
- Keep reading level at 8th grade
- Use analogies and metaphors
- Focus on "what this means for MY treatment"

**Requirements:**
1. Start with: "Your cancer cells use the {pathway_name} to..."
2. Explain in 3-4 sentences max
3. End with: "That's why drugs targeting [specific genes] are being tested"
4. Avoid jargon like "phosphorylation", "downstream effectors"
5. Do NOT speculate about outcomes or survival

**Example output:**
"Your cancer cells use the PI3K/AKT pathway to receive 'grow faster' signals. Think of PIK3CA and AKT1 like amplifiers that make those signals louder. When PTEN (a brake) stops working, the amplifiers run full blast. That's why drugs blocking AKT are being tested—they turn down the volume on those growth signals."

Now explain the {pathway_name} for {cancer_type}:"""

    try:
        # Mock response for testing (replace with real Gemini call)
        mock_response = f"""Your cancer cells use the {pathway_name} to receive "grow and divide" signals. Think of it like a chain of messengers passing notes—when one gene sends a signal, the next one amplifies it. In {cancer_type}, this pathway is often stuck "on" because genes like {genes[0]} are changed. That's why drugs targeting {genes[0]} or {genes[1]} are being tested—they interrupt those messages and slow down cancer growth."""
        
        # Real Gemini call (uncomment when you have API key):
        # model = genai.GenerativeModel('gemini-1.5-pro')
        # response = model.generate_content(prompt)
        # return response.text
        
        return mock_response
    
    except Exception as e:
        st.error(f"Gemini API error: {e}")
        return f"The {pathway_name} helps cancer cells grow. Drugs targeting this pathway are being tested."


@st.cache_data(ttl=3600)
def generate_drug_explanation(drug_name: str, mechanism: str, target: str):
    """
    Generate patient-friendly drug mechanism explanation.
    """
    
    prompt = f"""Explain how {drug_name} works to a cancer patient in ONE sentence.

**Drug details:**
- Mechanism: {mechanism}
- Target: {target}

**Requirements:**
- Maximum 15 words
- 8th grade reading level
- Use active voice ("blocks", "stops", "helps")
- No jargon

**Examples:**
- "Pembrolizumab blocks PD-1, helping your immune system recognize cancer cells"
- "Capivasertib stops AKT, turning off growth signals in cancer cells"
- "Carboplatin damages DNA when cancer cells try to divide"

Now explain {drug_name}:"""

    # Mock response (replace with real Gemini)
    mock_responses = {
        "Pembrolizumab": "Blocks PD-1, removing the brake on your immune system's cancer-fighting T cells",
        "Carboplatin": "Damages DNA in rapidly dividing cancer cells, preventing them from multiplying",
        "Capivasertib": "Blocks AKT, shutting down the pathway that tells cancer cells to grow",
        "Talazoparib": "Blocks PARP, preventing cancer cells from repairing DNA damage"
    }
    
    return mock_responses.get(drug_name, f"Targets {target} to stop cancer cell growth")


@st.cache_data(ttl=3600)
def generate_questions_for_oncologist(cancer_type: str, pathways: list, trials: list):
    """
    Generate personalized questions patient should ask their oncologist.
    """
    
    prompt = f"""Generate 5 specific questions a patient with {cancer_type} should ask their oncologist.

**Patient's context:**
- Pathways involved: {', '.join(pathways)}
- Nearby trials: {len(trials)} found
- Goal: Advocate for best treatment options

**Requirements:**
- Questions should be:
  * Specific to their biology (mention pathways)
  * Actionable (lead to testing or treatment decisions)
  * Respectful but assertive
  * Easy to remember
- Avoid yes/no questions
- Format: One question per line

**Example questions:**
1. "My cancer involves the PI3K/AKT pathway—am I a candidate for AKT inhibitor trials?"
2. "Should I get PD-L1 testing to see if immunotherapy might work?"
3. "Are there genomic tests that could find more targeted treatment options?"
4. "Why might Trial NCT02168825 be better than standard chemotherapy for me?"
5. "What biomarkers should we check before starting treatment?"

Generate questions for {cancer_type}:"""

    # Mock response
    mock_questions = [
        f"1. My cancer involves the {pathways[0]} pathway—am I a candidate for targeted therapy?",
        "2. Should I get biomarker testing (PD-L1, TMB) to guide treatment options?",
        "3. Are there genomic tests that could reveal more about my cancer's biology?",
        f"4. I found {len(trials)} trials nearby—which ones match my cancer's characteristics?",
        "5. What are the next steps if standard treatment doesn't work?"
    ]
    
    return '\n'.join(mock_questions)


# Test the prompts
if __name__ == "__main__":
    st.title("Gemini Explainer Test")
    
    # Test pathway explanation
    st.subheader("Pathway Explanation")
    explanation = explain_pathway(
        pathway_name="PI3K/AKT pathway",
        genes=["PIK3CA", "AKT1", "PTEN"],
        cancer_type="triple-negative breast cancer"
    )
    st.write(explanation)
    
    # Test drug explanation
    st.subheader("Drug Explanations")
    for drug in ["Pembrolizumab", "Carboplatin", "Capivasertib"]:
        st.write(f"**{drug}:** {generate_drug_explanation(drug, '', '')}")
    
    # Test questions
    st.subheader("Questions for Oncologist")
    questions = generate_questions_for_oncologist(
        cancer_type="TNBC",
        pathways=["PI3K/AKT", "DNA damage response"],
        trials=[{"nctId": "NCT02168825"}]
    )
    st.text(questions)