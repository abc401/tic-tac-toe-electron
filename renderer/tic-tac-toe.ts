function makeCellSvg(type: CellValue): HTMLElement {
    let svg = document.createElement("svg");
    return svg;
}

enum CellValue {
    X = "images/x.svg",
    O = "images/o.svg",
    Empty = "images/empty.svg"
}

function CellValueToSVG(val: CellValue): Node {
    let ret;
    switch (val) {
        case CellValue.X:
            ret = XSvg.cloneNode(true);
            break;
        case CellValue.O:
            ret = OSvg.cloneNode(true);
            break;
        case CellValue.Empty:
            ret = EmptySvg.cloneNode(true);
    }
    return ret;
}

abstract class GameStrategy {
    abstract onClick(board: Array<Cell> , cellIndex: number): GameStrategy;
}

class Cell {
    private element: HTMLElement;
    private svg: Node;
    private _val: CellValue;

    constructor(element: HTMLElement, index: Number, onclick: () => void) {
        this.element = element;
        this._val = CellValue.Empty;
        this.svg = CellValueToSVG(CellValue.Empty);
        element.onclick = onclick;
        element.appendChild(this.svg);

    }

    isEmpty(): Boolean {
        return this._val === CellValue.Empty;
    }

    val(): CellValue{
        return this._val;
    }

    private setVal(turn: CellValue) {
        this._val = turn;
        this.svg = CellValueToSVG(turn);
        this.element.innerHTML = "";
        this.element.appendChild(this.svg);
    }

    fill(turn: CellValue) {
        if (this.isEmpty()) {
            this.setVal(turn)
        }
    }

    makeEmpty() {
        this.setVal(CellValue.Empty);
    }
}

class TicTacToe {
    board = new Array<Cell>(9);
    strategy: GameStrategy;
    winnerAlertTemplate: Element;
    gameContainer: Element;

    constructor(gameContainer: Element, winnerAlertTemplate: Element) {
        this.gameContainer = gameContainer;
        let board = gameContainer.querySelector(".board");
        if (board === null) throw new Error("No board element!");

        this.initBoard(board);


        let controlsContainer = gameContainer.querySelector(".game-controls");
        if (controlsContainer !== null) {
            this.initRestart(controlsContainer);
        }



        this.winnerAlertTemplate = winnerAlertTemplate;
        this.initWinnerAlertTemplate();
        

        this.strategy = new PlayingGame(this.winnerAlertTemplate);

    }

    initWinnerAlertTemplate() {
        // Set the close buttons to actally close the winner alert
        let closeButtons = this.winnerAlertTemplate.querySelectorAll<HTMLElement>(".close-alert");
        for (let button of closeButtons) {
            button.onclick = () => {
                this.winnerAlertTemplate.classList.add("hidden");
                this.reset();
            }
        }
    }

    reset() {
        this.initStrategy(
            new PlayingGame(this.winnerAlertTemplate)
        )
        this.clearBoard();
    }

    initBoard(board: Element) {
        let elements = board.querySelectorAll<HTMLElement>(".cell");
        if (elements.length !== 9) {
            throw new Error();
        }

        for (let i = 0; i < elements.length; i++) {
            this.board[i] = new Cell(elements[i], i, () => {
                this.strategy = this.strategy.onClick(this.board, i);
            })
        }
    }

    initStrategy(strategy: GameStrategy) {
        this.strategy = strategy;
    }

    initRestart(controlsContainer: Element) {
        let restart = controlsContainer.querySelector<HTMLElement>(".restart");
        if (restart !== null) {
            restart.onclick = () =>  this.reset()
        }
    }

    clearBoard() {
        for (let cell of this.board) {
            cell.makeEmpty();
        }
    }

}

class PlayingGame extends GameStrategy {
    turn: CellValue;
    winnerAlertTemplate: Element;

    constructor(winnerAlertTemplate: Element) {
        super();
        this.turn = CellValue.X;
        this.winnerAlertTemplate = winnerAlertTemplate;
    }

    onClick(board: Array<Cell> , cellIndex: number): GameStrategy {
        board[cellIndex].fill(this.turn);
        if (this.checkWin(board)) {
            return new WonGame(this.turn, this.winnerAlertTemplate);
        }
        this.switchTurn();
        return this;
    }

    switchTurn() {
        if (this.turn === CellValue.X) {
            this.turn = CellValue.O;
        } else {
            this.turn = CellValue.X;
        }
    }

    checkWin(board: Array<Cell>): Boolean {
        for (let i = 0; i < 3; i++) {
            if (this.checkWinRow(board, i) || this.checkWinCol(board, i)) {
                return true;
            }
        }

        for (let i = 0; i < 2; i++) {
            if (this.checkWinDiag(board, i)) {
                return true;
            }
        }

        return false;
    }

    checkWinRow(board: Array<Cell>, rowNum: number): Boolean {
        rowNum = rowNum*3;
        return (
            (board[rowNum].val() === board[rowNum+1].val())
            && (board[rowNum].val() === board[rowNum+2].val())
            && (!board[rowNum].isEmpty())
        )
    }

    checkWinCol(board: Array<Cell>, colNum: number): Boolean  {
        return (
            (board[colNum].val() === board[colNum+3].val())
            && (board[colNum].val() === board[colNum+6].val())
            && (!board[colNum].isEmpty())
        )
    }

    checkWinDiag(board: Array<Cell>, diagNum: number): Boolean  {
        if (diagNum === 0) {
            return (
                (board[0].val() === board[4].val())
                && (board[0].val() === board[8].val())
                && (!board[0].isEmpty())
            )
        }

        return (
            (board[2].val() === board[4].val())
            && (board[2].val() === board[6].val())
            && (!board[2].isEmpty())
        )
    }
}

class WonGame extends GameStrategy {
    winner: CellValue;
    winnerAlertTemplate: Element;

    constructor(winner: CellValue, winnerAlertTemplate: Element) {
        super();
        this.winner = winner;
        this.winnerAlertTemplate = winnerAlertTemplate;
        this.fillTemplate();
        this.displayAlert();
        // TODO: Get the close-alert button and add functionality to it
    }

    fillTemplate() {
        let winnerContainers = this.winnerAlertTemplate.querySelectorAll(".winner");
        for (let container of winnerContainers) {
            container.innerHTML = "";
            container.appendChild(CellValueToSVG(this.winner));
        }
    }

    displayAlert() {
        this.winnerAlertTemplate.classList.remove("hidden");
    }

    onClick(board: Cell[], cellIndex: number): GameStrategy {
        return this;
    }
}

let gameContainer = document.getElementsByClassName("game-container")[0];

const OSvg = gameContainer.querySelectorAll("svg.o")[0];
const XSvg = gameContainer.querySelectorAll("svg.x")[0];
const EmptySvg = gameContainer.querySelectorAll("svg.empty")[0];

let game = new TicTacToe(
    gameContainer,
    document.getElementsByClassName("winner-alert")[0]
);