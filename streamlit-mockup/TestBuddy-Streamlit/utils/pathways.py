# utils/pathways.py
import networkx as nx
import matplotlib.pyplot as plt
import streamlit as st
from matplotlib.patches import FancyBboxPatch

def create_pathway_diagram(pathway_name: str, genes: list, cancer_type: str):
    """
    Create a simple pathway diagram for patient education.
    
    Args:
        pathway_name: e.g., "PI3K/AKT pathway"
        genes: List of genes, e.g., ["PIK3CA", "AKT1", "PTEN", "mTOR"]
        cancer_type: e.g., "TNBC"
    
    Returns:
        Matplotlib figure
    """
    
    # Create directed graph
    G = nx.DiGraph()
    
    # Define pathway structure (simplified for TNBC PI3K/AKT)
    if "PI3K" in pathway_name:
        # Growth signal receptor → PI3K → AKT → mTOR → Cell growth
        edges = [
            ("Growth\nSignal", "PIK3CA", {"label": "activates"}),
            ("PIK3CA", "AKT1", {"label": "phosphorylates"}),
            ("AKT1", "mTOR", {"label": "activates"}),
            ("mTOR", "Cell\nGrowth", {"label": "promotes"}),
            ("PTEN", "PIK3CA", {"label": "inhibits", "style": "dashed"})
        ]
        
        # Node colors (highlight mutated genes)
        node_colors = {
            "Growth\nSignal": "#B8D8E8",  # Light blue (input)
            "PIK3CA": "#FF6B6B",  # Red (often mutated in TNBC)
            "AKT1": "#4ECDC4",  # Teal (druggable)
            "mTOR": "#4ECDC4",  # Teal (druggable)
            "PTEN": "#FFD93D",  # Yellow (often lost)
            "Cell\nGrowth": "#95E1D3"  # Light green (output)
        }
        
        node_labels = {
            "Growth\nSignal": "Growth\nSignal",
            "PIK3CA": "PI3K\n(PIK3CA)",
            "AKT1": "AKT\n(AKT1)",
            "mTOR": "mTOR",
            "PTEN": "PTEN\n(brake)",
            "Cell\nGrowth": "Cell\nGrowth"
        }
    
    else:
        # Generic pathway
        edges = [(genes[i], genes[i+1], {"label": "→"}) for i in range(len(genes)-1)]
        node_colors = {gene: "#4ECDC4" for gene in genes}
        node_labels = {gene: gene for gene in genes}
    
    # Add edges to graph
    for source, target, attrs in edges:
        G.add_edge(source, target, **attrs)
    
    # Create figure
    fig, ax = plt.subplots(figsize=(12, 6), facecolor='white')
    
    # Layout
    pos = nx.spring_layout(G, k=2, iterations=50, seed=42)
    # Or use hierarchical layout for cleaner look:
    # pos = nx.nx_agraph.graphviz_layout(G, prog='dot')  # Requires pygraphviz
    
    # Draw nodes
    for node in G.nodes():
        x, y = pos[node]
        color = node_colors.get(node, "#B8D8E8")
        
        # Draw node as rounded rectangle
        bbox = FancyBboxPatch(
            (x - 0.15, y - 0.08), 0.3, 0.16,
            boxstyle="round,pad=0.01",
            edgecolor='black', facecolor=color,
            linewidth=2, transform=ax.transData
        )
        ax.add_patch(bbox)
        
        # Add text
        ax.text(x, y, node_labels.get(node, node),
               ha='center', va='center',
               fontsize=11, fontweight='bold',
               transform=ax.transData)
    
    # Draw edges
    for source, target, attrs in edges:
        x1, y1 = pos[source]
        x2, y2 = pos[target]
        
        style = attrs.get('style', 'solid')
        
        if style == 'dashed':
            # Inhibitory edge
            ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                       arrowprops=dict(
                           arrowstyle='-|>',
                           connectionstyle='arc3,rad=0.1',
                           linestyle='--',
                           color='red',
                           linewidth=2
                       ))
        else:
            # Activating edge
            ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                       arrowprops=dict(
                           arrowstyle='-|>',
                           connectionstyle='arc3,rad=0.1',
                           color='black',
                           linewidth=2
                       ))
    
    # Clean up axes
    ax.set_xlim(-0.5, 0.5)
    ax.set_ylim(-0.5, 0.5)
    ax.axis('off')
    
    # Add title
    ax.text(0, 0.45, f"{pathway_name} in {cancer_type}",
           ha='center', fontsize=14, fontweight='bold')
    
    # Add legend
    legend_elements = [
        plt.Line2D([0], [0], color='black', linewidth=2, label='Activates'),
        plt.Line2D([0], [0], color='red', linewidth=2, linestyle='--', label='Inhibits'),
        plt.scatter([], [], c='#FF6B6B', s=100, marker='s', label='Often mutated'),
        plt.scatter([], [], c='#4ECDC4', s=100, marker='s', label='Druggable target')
    ]
    ax.legend(handles=legend_elements, loc='lower right', fontsize=9)
    
    plt.tight_layout()
    return fig


def display_pathway_panel(cancer_type: str, pathways: dict):
    """
    Complete Panel 1: Biology with pathway visualization.
    
    Args:
        cancer_type: e.g., "TNBC"
        pathways: Dict with keys: ['name', 'genes', 'explanation', 'why_matters']
    """
    
    st.title("What Makes YOUR Cancer Unique 🧬")
    st.write(f"**Your diagnosis:** {cancer_type}")
    
    # Main pathway visualization
    st.subheader(f"Key Pathway: {pathways['name']}")
    
    fig = create_pathway_diagram(
        pathway_name=pathways['name'],
        genes=pathways['genes'],
        cancer_type=cancer_type
    )
    st.pyplot(fig)
    
    # Patient-friendly explanation
    st.markdown("---")
    st.subheader("What This Means for You")
    st.write(pathways['explanation'])
    
    # Why it matters for treatment
    st.info(f"**Why this matters:** {pathways['why_matters']}")
    
    # Gene details (expandable)
    with st.expander("🔬 Learn more about each gene"):
        for gene in pathways['genes']:
            st.markdown(f"**{gene}:**")
            # In real app, fetch from Open Targets or use Gemini
            if gene == "PIK3CA":
                st.write("PI3K is like a switch that tells cells to grow. When mutated, the switch gets stuck 'on'.")
            elif gene == "AKT1":
                st.write("AKT receives signals from PI3K and passes them along. Drugs blocking AKT are in trials.")
            elif gene == "PTEN":
                st.write("PTEN acts as a brake on PI3K. When lost, cancer cells grow unchecked.")
            elif gene == "mTOR":
                st.write("mTOR controls cell growth and division. It's a key target for many cancer drugs.")


# Test the visualization
if __name__ == "__main__":
    st.set_page_config(layout="wide")
    
    # Mock data for TNBC
    tnbc_pathways = {
        'name': 'PI3K/AKT Pathway',
        'genes': ['PIK3CA', 'AKT1', 'PTEN', 'mTOR'],
        'explanation': """Your cancer cells use the PI3K/AKT pathway to receive "grow faster" signals. 
        Think of PIK3CA and AKT1 like amplifiers that make those signals louder. When PTEN (a brake) 
        stops working, the amplifiers run full blast.""",
        'why_matters': """That's why drugs blocking AKT (like capivasertib) are being tested—they 
        turn down the volume on those growth signals. Chemotherapy also works because your cancer 
        cells are dividing rapidly."""
    }
    
    display_pathway_panel("Triple-Negative Breast Cancer (TNBC)", tnbc_pathways)