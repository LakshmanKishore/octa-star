import type { PlayerId, RuneClient } from "rune-sdk"

// Define the graph structure
interface GraphNode {
  id: number;
  x: number;
  y: number;
  connections: number[];
}

interface Card {
  id: number;
  playerId: PlayerId | null; // Which player owns this card
  starPhase: number; // Current phase of the star (0-7)
}

interface GameState {
  graph: GraphNode[];
  cards: Card[];
  playerIds: PlayerId[];
  currentPlayerId: PlayerId | null;
  selectedCardId: number | null; // Card currently selected by a player
  placedCards: { [nodeId: number]: { cardId: number, starPhase: number } }; // nodeId -> card info mapping
}

type GameActions = {
  selectCard: (cardId: number) => void;
  placeCard: (nodeId: number) => void;
  cycleCardPhase: (cardId: number) => void;
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

// Helper function to generate a non-intersecting graph
function generateNonIntersectingGraph(): GraphNode[] {
  // Create a smaller number of nodes (between 8 and 12) to make them larger
  const numNodes = Math.floor(Math.random() * 5) + 8;
  const nodes: GraphNode[] = [];

  // Create nodes in a grid-like pattern to keep them close together
  const gridSize = Math.ceil(Math.sqrt(numNodes));
  const spacing = 80 / gridSize; // Adjust spacing based on grid size

  for (let i = 0; i < numNodes; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;

    // Add slight randomness to positions to avoid perfectly aligned nodes
    const x = 10 + col * spacing + (Math.random() * spacing * 0.3);
    const y = 10 + row * spacing + (Math.random() * spacing * 0.3);

    nodes.push({
      id: i + 1,
      x,
      y,
      connections: []
    });
  }

  // Create connections between nearby nodes, limiting to max 3 per node
  for (let i = 0; i < numNodes; i++) {
    const currentNode = nodes[i];

    // Find closest nodes to connect to
    const distances = [];
    for (let j = 0; j < numNodes; j++) {
      if (i !== j) {
        const otherNode = nodes[j];
        const distance = Math.sqrt(
          Math.pow(currentNode.x - otherNode.x, 2) +
          Math.pow(currentNode.y - otherNode.y, 2)
        );
        distances.push({ id: j, distance });
      }
    }

    // Sort by distance and pick 1-3 closest nodes
    distances.sort((a, b) => a.distance - b.distance);
    const numConnections = Math.min(3, Math.floor(Math.random() * 3) + 1); // 1 to 3 connections

    for (let k = 0; k < numConnections; k++) {
      const targetIdx = distances[k].id;
      const targetNode = nodes[targetIdx];

      // Make sure the target node doesn't exceed its connection limit
      if (targetNode.connections.length < 3) {
        // Add connection if it doesn't already exist
        if (!currentNode.connections.includes(targetNode.id)) {
          currentNode.connections.push(targetNode.id);
          targetNode.connections.push(currentNode.id);
        }
      }
    }
  }

  return nodes;
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 6,
  setup: (allPlayerIds) => {
    const graph = generateNonIntersectingGraph();

    // Create 3 cards per player
    const cards: Card[] = [];
    for (let p = 0; p < allPlayerIds.length; p++) {
      for (let c = 0; c < 3; c++) {
        cards.push({
          id: p * 3 + c,
          playerId: allPlayerIds[p],
          starPhase: Math.floor(Math.random() * 10)
        });
      }
    }

    return {
      graph,
      cards,
      playerIds: allPlayerIds,
      currentPlayerId: null,
      selectedCardId: null,
      placedCards: {}
    };
  },
  actions: {
    selectCard: (cardId, { game, playerId }) => {
      // Only allow selection if it's the player's card
      const card = game.cards.find(c => c.id === cardId);
      if (!card || card.playerId !== playerId) {
        throw Rune.invalidAction();
      }

      game.selectedCardId = cardId;
    },

    placeCard: (nodeId, { game, playerId }) => {
      // Check if a card is selected
      if (game.selectedCardId === null) {
        throw Rune.invalidAction();
      }

      // Check if the node is already occupied
      if (game.placedCards[nodeId] !== undefined) {
        throw Rune.invalidAction();
      }

      // Check if the selected card belongs to the current player
      const selectedCard = game.cards.find(c => c.id === game.selectedCardId);
      if (!selectedCard || selectedCard.playerId !== playerId) {
        throw Rune.invalidAction();
      }

      // Place the card on the node (capture its current phase)
      game.placedCards[nodeId] = { 
        cardId: selectedCard.id, 
        starPhase: selectedCard.starPhase 
      };

      // Replenish the hand with a "new" card (same ID, new random phase)
      selectedCard.starPhase = Math.floor(Math.random() * 10);
      
      game.selectedCardId = null; // Deselect the card
    },

    cycleCardPhase: (cardId, { game, playerId }) => {
      // Only allow cycling if it's the player's card
      const card = game.cards.find(c => c.id === cardId);
      if (!card || card.playerId !== playerId) {
        throw Rune.invalidAction();
      }

      // Cycle the star phase (0-9)
      card.starPhase = (card.starPhase + 1) % 10;
    }
  },
})
