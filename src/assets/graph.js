import { StarCard } from "./star.js"

// Graph display component to show the game board
export class GraphDisplay {
  constructor(container, graph, placedCards, cards, onNodeClickCallback) {
    this.container = container;
    this.graph = graph;
    this.placedCards = placedCards;
    this.cards = cards; // Store the full list of cards to look up phases
    this.onNodeClickCallback = onNodeClickCallback;
    this.render();
  }

  render() {
    // Create SVG for the graph
    const connectionsSvg = this.drawConnections();
    const nodesSvg = this.drawNodes();

    const svg = `
      <svg width="100%" height="400px" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="graph-display">
        ${connectionsSvg}
        ${nodesSvg}
      </svg>
    `;

    // Clear container and add the SVG
    this.container.innerHTML = svg;

    // Add click events to nodes
    this.graph.forEach(node => {
      const nodeElement = this.container.querySelector(`.node[data-node-id="${node.id}"]`);
      if (nodeElement) {
        nodeElement.addEventListener('click', () => {
          if (this.onNodeClickCallback) {
            this.onNodeClickCallback(node.id);
          }
        });
      }
    });
  }

  // Draw the connections between nodes
  drawConnections() {
    let connections = '';

    // Track which connections we've already drawn to avoid duplicates
    const drawnConnections = new Set();

    this.graph.forEach(node => {
      node.connections.forEach(connectedNodeId => {
        // Create a unique identifier for this connection regardless of order
        const connKey = [node.id, connectedNodeId].sort().join('-');

        if (!drawnConnections.has(connKey)) {
          const connectedNode = this.graph.find(n => n.id === connectedNodeId);
          if (connectedNode) {
            connections += `
              <line
                x1="${node.x}"
                y1="${node.y}"
                x2="${connectedNode.x}"
                y2="${connectedNode.y}"
                stroke="#00ffff"
                stroke-width="0.3"
                stroke-opacity="0.4"
                class="connection-line" />
            `;
            drawnConnections.add(connKey);
          }
        }
      });
    });

    return `<g class="connections">${connections}</g>`;
  }

  // Draw the nodes as squares
  drawNodes() {
    let nodes = '';

    this.graph.forEach(node => {
      // Check if there's a card placed on this node
      const placedInfo = this.placedCards[node.id];
      let cardRepresentation = '';
      let showNodeBase = true;

      if (placedInfo !== undefined) {
        const { cardId, starPhase } = placedInfo;
        const filledIndices = StarCard.getFilledIndices(starPhase);
        const scale = 0.12; // Slightly larger cards
        const offset = 50 * scale;
        showNodeBase = false; // Hide square when card is present
        
        cardRepresentation = `
          <g transform="translate(${node.x - offset}, ${node.y - offset}) scale(${scale})">
             <g class="placed-card-anim">
                ${StarCard.getStarSvg(filledIndices, 100, cardId).replace('<svg', '<g').replace('</svg>', '</g>')}
             </g>
          </g>
        `;
      }

      nodes += `
        <g class="node" data-node-id="${node.id}" style="cursor: pointer;">
          <!-- Node background (Square) - only show if no card -->
          ${showNodeBase ? `
          <rect
            x="${node.x - 2}"
            y="${node.y - 2}"
            width="4"
            height="4"
            fill="#ffffff"
            stroke="#bdc3c7"
            stroke-width="0.2"
            class="node-rect"
            rx="0.5" />
          ` : ''}
            
          ${cardRepresentation}
          
          <!-- Hover target (invisible but larger) -->
          <rect x="${node.x - 4}" y="${node.y - 4}" width="8" height="8" fill="transparent" />
        </g>
      `;
    });

    return `<g class="nodes">${nodes}</g>`;
  }

  // Update the placed cards
  updatePlacedCards(placedCards, cards) {
    this.placedCards = placedCards;
    if (cards) this.cards = cards;
    this.render();
  }
}