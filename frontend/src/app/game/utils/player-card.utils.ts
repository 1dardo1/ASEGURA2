import Phaser from 'phaser';

export interface PlayerCardData {
  name: string;
  money: number;
  salary: number;
  rent: number;
  insurances: string[];
  color: string;
}

export class PlayerCard {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private background: Phaser.GameObjects.Graphics | null = null;
  private nameText: Phaser.GameObjects.Text | null = null;
  private moneyText: Phaser.GameObjects.Text | null = null;
  private salaryText: Phaser.GameObjects.Text | null = null;
  private rentText: Phaser.GameObjects.Text | null = null;
  private insuranceIcons: Phaser.GameObjects.Image[] = [];
  private sceneWidth: number;
  private sceneHeight: number;

  constructor(scene: Phaser.Scene, sceneWidth: number, sceneHeight: number) {
    this.scene = scene;
    this.sceneWidth = sceneWidth;
    this.sceneHeight = sceneHeight;
  }

    show(playerData: PlayerCardData): void {
      this.hide();

      const boardImage = this.scene.children.getByName('boardImage') as Phaser.GameObjects.Image;
      if (!boardImage) return;

      const boardBounds = boardImage.getBounds();
      const cardWidth = boardBounds.width * 0.7;
      const cardHeight = boardBounds.height * 0.55;
      const cardX = boardBounds.x + boardBounds.width / 2;
      const cardY = boardBounds.y + boardBounds.height * 0.50;

      // Contenedor principal
      this.container = this.scene.add.container(cardX, cardY);
      this.container.setDepth(500);

      // Fondo con esquinas redondeadas (color del jugador)
      const cornerRadius = 20;
      const bgGraphics = this.scene.add.graphics();
      bgGraphics.fillStyle(parseInt(playerData.color.replace('#', '0x')), 1);
      bgGraphics.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, cornerRadius);
      this.container.add(bgGraphics);

      // Calcular tamaños responsivos
      const fontSize = Math.max(14, Math.floor(cardHeight * 0.12));
      const iconSize = Math.max(30, Math.floor(cardHeight * 0.15));
      
      // 2x2 compacto
      const colWidth = cardWidth * 0.495;
      const colGap = cardWidth * 0.01;
      const rowHeight = cardHeight * 0.24;     // un poco más alto para más padding
      const rowGap = cardHeight * 0.012;
      const gridY = -cardHeight * 0.20;

      // COLUMNA 1 (Izquierda)
      const col1X = -colWidth / 2 - colGap / 2;

      // Nombre: pastilla blanca, más alta
      const namePillWidth = colWidth * 0.8;
      const namePillHeight = rowHeight * 0.8;   // antes 0.55
      const namePillRadius = namePillHeight * 0.5;
      const nameY = gridY - rowHeight / 2;

      const namePill = this.scene.add.graphics();
      namePill.lineStyle(3, 0x000000, 1);
      namePill.fillStyle(0xffffff, 1);
      namePill.fillRoundedRect(
          col1X - namePillWidth / 2,
          nameY - namePillHeight / 2,
          namePillWidth,
          namePillHeight,
          namePillRadius
      );
      this.container.add(namePill);

      this.nameText = this.scene.add.text(
          col1X,
          nameY,
          playerData.name,
          {
          fontSize: `${fontSize * 1.1}px`,
          color: '#000000',
          fontStyle: 'bold'
          }
      );
      this.nameText.setOrigin(0.5);
      this.container.add(this.nameText);

      // Dinero: pastilla blanca, más alta
      const moneyPillWidth = colWidth * 0.7;
      const moneyPillHeight = rowHeight * 0.8;  // antes 0.55
      const moneyPillRadius = moneyPillHeight * 0.5;
      const moneyY = gridY + rowHeight / 2 + rowGap;

      const moneyPill = this.scene.add.graphics();
      moneyPill.lineStyle(3, 0x000000, 1);
      moneyPill.fillStyle(0xffffff, 1);
      moneyPill.fillRoundedRect(
          col1X - moneyPillWidth / 2,
          moneyY - moneyPillHeight / 2,
          moneyPillWidth,
          moneyPillHeight,
          moneyPillRadius
      );
      this.container.add(moneyPill);

      this.moneyText = this.scene.add.text(
          col1X,
          moneyY,
          `${playerData.money}€`,
          {
          fontSize: `${fontSize * 1.25}px`,
          color: '#000000',
          fontStyle: 'bold'
          }
      );
      this.moneyText.setOrigin(0.5);
      this.container.add(this.moneyText);

      // COLUMNA 2 (Derecha)
      const col2X = colWidth / 2 + colGap / 2;

      // Sueldo: pastilla verde más alta, borde blanco grueso
      const pillWidth = colWidth * 0.7;
      const pillHeight = rowHeight * 0.8;       // más altura = más padding vertical
      const pillRadius = pillHeight * 0.5;

      const salaryY = gridY - rowHeight / 2;
      const rentY = gridY + rowHeight / 2 + rowGap;

      const salaryPill = this.scene.add.graphics();
      salaryPill.lineStyle(5, 0xffffff, 1);     // borde blanco más visible
      salaryPill.fillStyle(0x27ae60, 1);
      salaryPill.fillRoundedRect(
          col2X - pillWidth / 2,
          salaryY - pillHeight / 2,
          pillWidth,
          pillHeight,
          pillRadius
      );
      this.container.add(salaryPill);

      this.salaryText = this.scene.add.text(
          col2X,
          salaryY,
          `+${playerData.salary}€`,
          {
          fontSize: `${fontSize * 1.1}px`,
          color: '#ffffff',
          fontStyle: 'bold'
          }
      );
      this.salaryText.setOrigin(0.5);
      this.container.add(this.salaryText);

      // Alquiler: pastilla roja más alta, borde blanco grueso
      const rentPill = this.scene.add.graphics();
      rentPill.lineStyle(5, 0xffffff, 1);       // borde blanco más visible
      rentPill.fillStyle(0xe74c3c, 1);
      rentPill.fillRoundedRect(
          col2X - pillWidth / 2,
          rentY - pillHeight / 2,
          pillWidth,
          pillHeight,
          pillRadius
      );
      this.container.add(rentPill);

      this.rentText = this.scene.add.text(
          col2X,
          rentY,
          `-${playerData.rent}€`,
          {
          fontSize: `${fontSize * 1.1}px`,
          color: '#ffffff',
          fontStyle: 'bold'
          }
      );
      this.rentText.setOrigin(0.5);
      this.container.add(this.rentText);

      // Seguros
      if (playerData.insurances.length > 0) {
        const container = this.container;
        if (!container) return;

        // Máximo 7 iconos: 4 arriba, 3 abajo
        const icons = playerData.insurances.slice(0, 7);

        // Fondo más estrecho
        const rowHeightForIcons = rowHeight * 0.9;
        const iconsBgWidth = cardWidth * 0.55;      // antes 0.9 → MUCHO más estrecho
        const iconsBgHeight = rowHeightForIcons * 1.7;
        const iconsBgY = gridY + rowHeight * 1.7 + rowGap * 4;

        const iconsBg = this.scene.add.graphics();
        iconsBg.fillStyle(0xffffff, 0.6);
        iconsBg.fillRoundedRect(
          -iconsBgWidth / 2,
          iconsBgY - iconsBgHeight / 2,
          iconsBgWidth,
          iconsBgHeight,
          iconsBgHeight * 0.4
        );
        container.add(iconsBg);

        // Parámetros de filas
        const maxTop = 4;
        const topRow = icons.slice(0, maxTop);
        const bottomRow = icons.slice(maxTop); // hasta 3

        const iconGap = iconSize + 30;
        const topCount = topRow.length;
        const bottomCount = bottomRow.length;

        const topY = iconsBgY - iconsBgHeight * 0.22;
        const bottomY = iconsBgY + iconsBgHeight * 0.22;

        // Fila superior (máx 4)
        if (topCount > 0) {
          const totalWidthTop = (topCount - 1) * iconGap;
          const startXTop = -totalWidthTop / 2;

          topRow.forEach((insurance, index) => {
            const icon = this.scene.add.image(
              startXTop + index * iconGap,
              topY,
              `insurance-${insurance}`
            );
            icon.setDisplaySize(iconSize, iconSize);
            this.insuranceIcons.push(icon);
            container.add(icon);
          });
        }

        // Fila inferior (máx 3)
        if (bottomCount > 0) {
          const totalWidthBottom = (bottomCount - 1) * iconGap;
          const startXBottom = -totalWidthBottom / 2;

          bottomRow.forEach((insurance, index) => {
            const icon = this.scene.add.image(
              startXBottom + index * iconGap,
              bottomY,
              `insurance-${insurance}`
            );
            icon.setDisplaySize(iconSize, iconSize);
            this.insuranceIcons.push(icon);
            container.add(icon);
          });
        }
      }
    }





  hide(): void {
    this.insuranceIcons.forEach(icon => icon.destroy());
    this.insuranceIcons = [];
    
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }

  updatePosition(sceneWidth: number, sceneHeight: number): void {
    this.sceneWidth = sceneWidth;
    this.sceneHeight = sceneHeight;
    // La tarjeta se reposiciona automáticamente en show() basada en boardImage
  }
}

export class PlayerCardManager {
  private static instance: PlayerCard | null = null;
  private static scene: Phaser.Scene | null = null;

  static setBoardScene(playerCard: PlayerCard, scene: Phaser.Scene): void {
    PlayerCardManager.instance = playerCard;
    PlayerCardManager.scene = scene;
  }

  static show(playerData: PlayerCardData): void {
    if (PlayerCardManager.instance) {
      PlayerCardManager.instance.show(playerData);
    }
  }

  static hide(): void {
    if (PlayerCardManager.instance) {
      PlayerCardManager.instance.hide();
    }
  }
}
