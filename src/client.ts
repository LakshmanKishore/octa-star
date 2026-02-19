import "./styles.css"

import { PlayerId } from "rune-sdk"

import { StarCard } from "./assets/star.js"
import { GraphDisplay } from "./assets/graph.js"

const board = document.getElementById("board")!
const playersSection = document.getElementById("playersSection")!
const cardsContainer = document.getElementById("cardsContainer")!
const cycleContainer = document.getElementById("cycleContainer")!

let graphDisplay, starCards = [], playerContainers = [], selectedCardId = null
let lastBoardState = ""

function renderCycle() {
  if (!cycleContainer) return
  cycleContainer.innerHTML = ""

  StarCard.PHASES.forEach((filledIndices, index) => {
    const starDiv = document.createElement("div")
    starDiv.className = "cycle-star"
    // Use the getStarSvg helper which handles the filledIndices
    starDiv.innerHTML = StarCard.getStarSvg(filledIndices, 28)
    cycleContainer.appendChild(starDiv)
  })
}

function initUI(
  graph,
  cards,
  playerIds,
  yourPlayerId
) {
  // Render the cycle at the top
  renderCycle()

  // Clear the board
  board.innerHTML = ""

  // Create the graph display
  graphDisplay = new GraphDisplay(board, graph, {}, cards, (nodeId) => {
    // When a node is clicked, try to place the selected card
    if (selectedCardId !== null) {
      Rune.actions.placeCard(nodeId)
    }
  })

  // Set initial board state
  lastBoardState = JSON.stringify({ placedCards: {}, cards })

  // Create containers for star cards if we have a cards container
  if (cardsContainer) {
    cardsContainer.innerHTML = ""
    starCards = []

    // Filter cards to only show the current player's cards
    const playerCards = cards.filter(card => card.playerId === yourPlayerId)

    playerCards.forEach(card => {
      const container = document.createElement("div")
      container.className = "star-card-container"
      cardsContainer.appendChild(container)

      const starCard = new StarCard(
        container,
        card.id,
        card.playerId,
        card.starPhase,
        (cardId) => {
          // When a card is clicked, select it
          Rune.actions.selectCard(cardId)
        }
      )
      starCards.push(starCard)
    })
  }

  playerContainers = playerIds.map((playerId, index) => {
    const player = Rune.getPlayerInfo(playerId)

    const li = document.createElement("li")
    li.setAttribute("player", index.toString())
    li.innerHTML = `<span>${
      player.displayName +
      (player.playerId === yourPlayerId ? ` ${Rune.t("(You)")}` : "")
    }</span>`
    playersSection.appendChild(li)

    return li
  })
}

Rune.initClient({
  onChange: ({ game, yourPlayerId, action }) => {
    const { graph, cards, playerIds, selectedCardId: newSelectedCardId, placedCards } = game

    if (!graphDisplay) {
      initUI(graph, cards, playerIds, yourPlayerId)
    } else {
      // Only update the graph display if the board state changed (placed cards or card phases)
      const currentBoardState = JSON.stringify({ placedCards, cards })
      if (currentBoardState !== lastBoardState) {
        graphDisplay.updatePlacedCards(placedCards, cards)
        lastBoardState = currentBoardState
      }

      // Update star cards if needed
      if (starCards && cardsContainer) {
        const playerCards = cards.filter(card => card.playerId === yourPlayerId)
        playerCards.forEach((card, index) => {
          if (starCards[index]) {
            const oldPhase = starCards[index].starPhase;
            if (oldPhase !== card.starPhase) {
              starCards[index].updatePhase(card.starPhase);
              
              // Trigger entry animation
              const container = starCards[index].container;
              container.classList.remove("card-entering");
              void container.offsetWidth; // Force reflow
              container.classList.add("card-entering");
            }
          }
        })
      }
    }

    // Update selected card
    selectedCardId = newSelectedCardId
    
    // Update selection visual state
    if (starCards) {
      starCards.forEach(starCard => {
        if (starCard.cardId === selectedCardId) {
          starCard.container.classList.add("selected");
        } else {
          starCard.container.classList.remove("selected");
        }
      });
    }

    playerContainers.forEach((container, i) => {
      container.setAttribute(
        "your-turn",
        String(playerIds[i] === yourPlayerId)
      )
    })
  },
})
