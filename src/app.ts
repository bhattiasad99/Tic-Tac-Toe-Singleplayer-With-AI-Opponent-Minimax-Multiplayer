import { Cell, Dimensions, Players, Position, Symbols } from "./types";
import { config } from "./utils/canvas-config";
import { drawCircle, drawRectangle, drawSingleLine, drawX } from "./utils/canvas-utils";

const DEFAULT_APP_STATE = {
    player1: null as Symbols | null,
    player2: null as Symbols | null,
    currentTurn: 'player1' as Players,
    hoveredCell: null as null | Cell,
    moves: [] as Array<{ player: Players, cell: Cell }>
}

class State {
    private state: typeof DEFAULT_APP_STATE;

    constructor(initialState: typeof DEFAULT_APP_STATE) {
        this.state = { ...initialState };
    }

    getState() {
        return this.state;
    }

    setState(newState: Partial<typeof DEFAULT_APP_STATE>) {
        this.state = { ...this.state, ...newState };
    }

    resetState() {
        this.state = { ...DEFAULT_APP_STATE };
    }
}

const state = new State(DEFAULT_APP_STATE);

const togglePlayerTurn = () => {
    state.setState({ currentTurn: state.getState().currentTurn === 'player1' ? 'player2' : 'player1' });
}

// canvas
const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;

gameCanvas.height = gameCanvas.width;
const gameCtx = gameCanvas.getContext('2d')
if (!gameCtx) {
    throw new Error('Failed to get canvas context');
}

const cellDimensions: Dimensions = {
    width: gameCanvas.width / 3,
    height: gameCanvas.height / 3
}

// buttons
const singlePlayerButton = document.getElementById('singleplayer');
const multiplayerButton = document.getElementById('multiplayer');

// other-selections
const userSelectedSymbol = document.querySelector('.selected-symbol') as HTMLDivElement | null;

// node lists
const goHomeBtns = document.querySelectorAll('.go-home-btn');
const symbolBtns = document.querySelectorAll('.symbol-btn');

// screens
const mainMenuScreen = document.getElementById('main-menu');
const singlePlayerBaseScreen = document.getElementById('singleplayer-base');
const multiplayerBaseScreen = document.getElementById('multiplayer-base');
const gameScreen = document.getElementById('game');

const screens = [mainMenuScreen, singlePlayerBaseScreen, multiplayerBaseScreen, gameScreen];

const changeScreen = (newScreen: HTMLElement | null) => {
    screens.forEach(screen => {
        if (screen) {
            screen.classList.add('hidden');
        }
    });
    newScreen?.classList.remove('hidden');
}

singlePlayerButton?.addEventListener('click', () => {
    changeScreen(singlePlayerBaseScreen);

});

multiplayerButton?.addEventListener('click', () => {
    changeScreen(multiplayerBaseScreen);
});

goHomeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        state.resetState(); // reset app state
        userSelectedSymbol?.classList.add('hidden'); // hide the selected symbol
        changeScreen(mainMenuScreen);
    });
})

symbolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const symbol = btn.getAttribute('data-symbol');
        if (symbol) {
            state.setState({ player1: symbol as 'X' | 'O' });
        }

        initializeGame();
    });
});

const initializeGame = () => {
    changeScreen(gameScreen);
    init()
}

const colorCell = (ctx: CanvasRenderingContext2D, cell: Cell) => {
    const widthStart = cell.x * cellDimensions.width + config.padding;
    const heightStart = cell.y * cellDimensions.height + config.padding;

    const width = cellDimensions.width - 2 * config.padding;
    const height = cellDimensions.height - 2 * config.padding;

    drawRectangle(ctx, 'filled', [widthStart, heightStart], [width, height], {
        fillColor: state.getState().player1 === 'X' ? 'rgba(0, 0, 255, 0.3)' : 'rgba(255, 0, 0, 0.3)'
    });
}

const configureStroke = (color: string, width: number) => {
    // set brush properties
    gameCtx.strokeStyle = color;
    gameCtx.lineWidth = width;
}

const drawGrid = () => {
    // ⚠️ CLEAR the canvas before redrawing
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    configureStroke(config.strokeColor, config.lineWidth);

    const hoveredCell = state.getState().hoveredCell

    if (hoveredCell) {
        colorCell(gameCtx, hoveredCell)
    }

    // draw the grid
    drawSingleLine(gameCtx, gameCanvas.width / 3, config.padding, gameCanvas.width / 3, gameCanvas.height - config.padding);
    drawSingleLine(gameCtx, 2 * gameCanvas.width / 3, config.padding, 2 * gameCanvas.width / 3, gameCanvas.height - config.padding);
    drawSingleLine(gameCtx, config.padding, gameCanvas.height / 3, gameCanvas.width - config.padding, gameCanvas.height / 3);
    drawSingleLine(gameCtx, config.padding, 2 * gameCanvas.height / 3, gameCanvas.width - config.padding, 2 * gameCanvas.height / 3);
    drawMoves();
}

const getCellAddressFromDimensions = (mousePosition: Position): Cell => {
    const cellDimensions: Dimensions = {
        width: gameCanvas.width / 3,
        height: gameCanvas.height / 3
    }

    // calculation logic: Imagine you have a piece of paper full of 5cm boxes. If you put your finger lets say 22cms away from the left, how many boxes fully fit in that distance? You can divide 22 / 5.
    const cellX = Math.floor(mousePosition.x / cellDimensions.width);
    const cellY = Math.floor(mousePosition.y / cellDimensions.height);

    return { x: cellX, y: cellY };
}

const getMousePositionInCanvas = (client: Position): Position => {
    const rect = gameCanvas.getBoundingClientRect();
    return {
        x: client.x - rect.left,
        y: client.y - rect.top
    };
}

const handleMouseMove = (event: MouseEvent) => {
    const mousePositionInCanvas = getMousePositionInCanvas({
        x: event.clientX,
        y: event.clientY
    });

    const hoveredCell = getCellAddressFromDimensions(mousePositionInCanvas);

    state.setState({ hoveredCell });
}

const handleSelectCell = (selection: Position) => {
    const mousePositionInCanvas = getMousePositionInCanvas({
        x: selection.x,
        y: selection.y
    });

    const selectedCell = getCellAddressFromDimensions(mousePositionInCanvas);

    addMove(selectedCell);
}

const moveAlreadyExists = (selectedCell: Cell): boolean => {
    return state.getState().moves.some(move => move.cell.x === selectedCell.x && move.cell.y === selectedCell.y);
}

const addMove = (selectedCell: Cell) => {
    if (!state.getState().player1) {
        throw new Error("INVALID PLAYER")
    }

    if (moveAlreadyExists(selectedCell)) {
        return;
    }

    let temp = [...state.getState().moves];

    temp.push({
        cell: selectedCell,
        player: state.getState().currentTurn as Players
    });

    state.setState({ moves: temp });
}

const drawCell = (choice: Players, cell: Cell) => {
    const { x, y } = cell;
    const startPoint: Position = {
        x: cell.x * cellDimensions.width + config.padding,
        y: cell.y * cellDimensions.height + config.padding
    };

    switch (choice) {
        case "player1":
            // Draw "O"
            const centerPosition: Position = {
                x: cell.x * cellDimensions.width + cellDimensions.width / 2,
                y: cell.y * cellDimensions.height + cellDimensions.height / 2
            };
            const radius = (cellDimensions.width / 2 - config.padding) * config.symbolRatioToCellSize;
            drawCircle(gameCtx, centerPosition, radius);
            break;
        case "player2":
            // Draw "X"
            drawX(gameCtx, startPoint, cellDimensions.width / 2 - config.padding);
            break;
    }
}

const drawMoves = () => {
    state.getState().moves.forEach(move => {
        const { cell, player } = move;
        drawCell(player, cell);
    });
}

const init = () => {
    if (!state.getState().player1 || !userSelectedSymbol) {
        throw new Error('something went wrong')
    }

    userSelectedSymbol.innerHTML = `<h4>Your Symbol: ${state.getState().player1}</h4>`;

    drawGrid();

    gameCanvas.addEventListener('mousemove', (e) => {
        handleMouseMove(e);
        drawGrid();
    })

    gameCanvas.addEventListener('mouseleave', () => {
        state.setState({ hoveredCell: null });
        drawGrid();
    })

    gameCanvas.addEventListener('click', (e) => {
        handleSelectCell({
            x: e.clientX,
            y: e.clientY,
        });
        togglePlayerTurn();
    })
}

