// Star component with 8 points that can be filled in sequence
export class StarCard {
  // The 10 phases of the star cycle
  static PHASES = [
    [], // 0: Empty
    [6], // 1: Left 1
    [5, 6, 7], // 2: Left 3
    [4, 5, 6, 7, 0], // 3: Left 5
    [3, 4, 5, 6, 7, 0, 1], // 4: Left 7
    [0, 1, 2, 3, 4, 5, 6, 7], // 5: All 8
    [7, 0, 1, 2, 3, 4, 5], // 6: Right 7
    [0, 1, 2, 3, 4], // 7: Right 5
    [1, 2, 3], // 8: Right 3
    [2] // 9: Right 1
  ];

  constructor(container, cardId, playerId, starPhase, onClickCallback) {
    this.container = container;
    this.cardId = cardId;
    this.playerId = playerId;
    this.starPhase = starPhase;
    this.onClickCallback = onClickCallback;
    this.render();
  }

  static getFilledIndices(phaseIndex) {
    return StarCard.PHASES[phaseIndex] || [];
  }

  static getStarSvg(filledIndices = [], size = 100, cardId = null) {
    const filledSet = new Set(filledIndices);
    
    // Create a dynamic gradient center based on filled sides
    // Default to center (50, 50)
    let centerX = 50;
    let centerY = 50;
    
    if (filledIndices.length > 0) {
      // Calculate average angle of filled rhombuses to shift gradient
      let sumX = 0;
      let sumY = 0;
      filledIndices.forEach(idx => {
        const angle = (idx * 45 - 90) * (Math.PI / 180);
        sumX += Math.cos(angle);
        sumY += Math.sin(angle);
      });
      centerX = 50 + (sumX / filledIndices.length) * 20;
      centerY = 50 + (sumY / filledIndices.length) * 20;
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="star-card" ${cardId !== null ? `data-card-id="${cardId}"` : ''}>
        <defs>
          <radialGradient id="cardGrad-${cardId || 'temp'}" cx="${centerX}%" cy="${centerY}%" r="50%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="70%" stop-color="#e1e8ed" />
            <stop offset="100%" stop-color="#d1d9e6" />
          </radialGradient>
          
          <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="1" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- Elongated inward-pointing rhombus -->
          <polygon id="rhombus" points="
              50,2
              57,32
              50,49
              43,32
            " />
        </defs>

        <!-- Card Body -->
        <rect x="2" y="2" width="96" height="96" rx="12" fill="url(#cardGrad-${cardId || 'temp'})" stroke="#bdc3c7" stroke-width="1" filter="url(#cardShadow)" />

        <!-- 8-fold radial symmetry -->
        <g>
          <use href="#rhombus" transform="rotate(0 50 50)" fill="${filledSet.has(0) ? '#000000' : 'none'}" stroke="#000000" stroke-width="0.5"/>
          <use href="#rhombus" transform="rotate(45 50 50)" fill="${filledSet.has(1) ? '#000000' : 'none'}" stroke="#000000" stroke-width="0.5"/>
          <use href="#rhombus" transform="rotate(90 50 50)" fill="${filledSet.has(2) ? '#000000' : 'none'}" stroke="#000000" stroke-width="0.5"/>
          <use href="#rhombus" transform="rotate(135 50 50)" fill="${filledSet.has(3) ? '#000000' : 'none'}" stroke="#000000" stroke-width="0.5"/>
          <use href="#rhombus" transform="rotate(180 50 50)" fill="${filledSet.has(4) ? '#000000' : 'none'}" stroke="#000000" stroke-width="0.5"/>
          <use href="#rhombus" transform="rotate(225 50 50)" fill="${filledSet.has(5) ? '#000000' : 'none'}" stroke="#000000" stroke-width="0.5"/>
          <use href="#rhombus" transform="rotate(270 50 50)" fill="${filledSet.has(6) ? '#000000' : 'none'}" stroke="#000000" stroke-width="0.5"/>
          <use href="#rhombus" transform="rotate(315 50 50)" fill="${filledSet.has(7) ? '#000000' : 'none'}" stroke="#000000" stroke-width="0.5"/>
        </g>
      </svg>
    `;
  }

  // Render the star SVG
  render() {
    const filledIndices = StarCard.getFilledIndices(this.starPhase);
    
    // Clear container and add the SVG
    this.container.innerHTML = StarCard.getStarSvg(filledIndices, 100, this.cardId);

    // Add click event to select the card
    const starElement = this.container.querySelector('.star-card');
    starElement.addEventListener('click', () => {
      if (this.onClickCallback) {
        this.onClickCallback(this.cardId);
      }
    });
  }

  // Update the star phase
  updatePhase(starPhase) {
    this.starPhase = starPhase;
    this.render();
  }
}