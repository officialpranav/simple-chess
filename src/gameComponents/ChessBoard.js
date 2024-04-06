export default class ChessBoard {
  constructor(layoutOption="default"){
    if(layoutOption==="default"){
      this.board = [["wr","wn","wb","wq","wk","wb","wn","wr"],Array(8).fill("wp"),Array(8).fill("e"),Array(8).fill("e"),Array(8).fill("e"),Array(8).fill("e"),Array(8).fill("bp"),["br","bn","bb","bq","bk","bb","bn","br"]]
    }

    this.chessPieceToUnicode = {
      'bp': '♙',
      'bn': '♘',
      'bb': '♗',
      'br': '♖',
      'bq': '♕',
      'bk': '♔',
      'wp': '♟',
      'wn': '♞',
      'wb': '♝',
      'wr': '♜',
      'wq': '♛',
      'wk': '♚',
      'e' : '·',
      'X' : 'X',
      'S' : 'S',
      'C' : 'C'
    };

    this.moveList = ["Start"]
  }

  getBoard(asString = false){
    let boardAsString=""
    this.board.reverse().forEach(row => {
      row.forEach(piece => {
        boardAsString += (asString ? (piece == "e" ? "  " : piece) + " " : this.chessPieceToUnicode[piece] + " ")
      })
      boardAsString += "\n"
    })
    return boardAsString
  }

  movePiece(square1, square2){
    //check if squares are valid
    if(square1===square2) {
      throw new Error('Input is not a valid square')
    }
  
    [square1, square2].forEach((square) => {
      if(square.length != 2){
        throw new Error('Input is not a valid square')
      }
      square.forEach((num) => {
        if(num > 7 | num < 0 | num.toString().indexOf(".") == -1){
          throw new Error('Input is not a valid square')
        }
      })
    })

    //get pieces on each square
    piece1 = this.board[square1]
    piece2 = this.board[square2]

    //can't move into own piece
    if(piece1[0] == 'w' && piece2[0] == 'w'){
      return false
    }

    return false
  }

  scanDirection(direction, square, length = 9){
    if(length < 0){
      return {
        piecesFound: [],
        coordinatesScanned: [],
        distToClosestPiece: -1
      }
    }

    let piecesFound = []
    let coordinatesScanned = []
    let distToClosestPiece = -1

    //find which index of square will reach 8 first when going diagonally upwards east or west.
    //basically, we want to know if the row will reach board boundary before the column when travelling in a
    //cetain diagonal direction so that we can stop scanning when we reach the end of the board.
    //a 0 means the row will reach the boundary first, a 1 means the column will reach the boundary first.
    let eastFirstCollision = (square[0] > square[1]) ? 0 : 1
    let westFirstCollision = (square[0] + square[1] > 7) ? 0 : 1

    switch(direction){
      case "north":
        for(let i = square[0]; i < (square[0] + length + 1 > 8 ? 8 : square[0] + length + 1); i++){
          piecesFound.push(this.board[i][square[1]])
          coordinatesScanned.push([i,square[1]])
        }
        break
      case "east":
        for(let i = square[1]; i < (square[0] + length + 1 >= 8 ? 8 : square[0] + length + 1); i++){
          piecesFound.push(this.board[square[0]][i])
          coordinatesScanned.push([square[0],i])
        }
        break
      case "south":
        for(let i = square[0]; i >= (square[0] - length < 0 ? 0 : square[0] - length); i--){
          piecesFound.push(this.board[i][square[1]])
          coordinatesScanned.push([i,square[1]])
        }
        break
      case "west":
        for(let i = square[1]; i >= (square[1] - length < 0 ? 0 : square[1] - length); i--){
          piecesFound.push(this.board[square[0]][i])
          coordinatesScanned.push([square[0],i])
        }
        break
      case "northeast":
        for(let i = 0; i < (length + 1 > 8-square[eastFirstCollision] ? 8-square[eastFirstCollision] : length + 1); i++){
          piecesFound.push(this.board[square[0] + i][square[1] + i])
          coordinatesScanned.push([square[0] + i,square[1] + i])
        }
        break
      case "southeast":
        //let squaresUntilBoundarySE = westFirstCollision == 0 ? 8-square[1] : 1+square[0]
        let squaresUntilBoundarySE = 1
        if(westFirstCollision == 0){
          squaresUntilBoundarySE = length+1 > 8-square[1] ? 8-square[1] : length+1
        } else {
          //squaresUntilBoundaryNW = westFirstCollision == 0 ? 8-square[0] : 1+square[1]
          squaresUntilBoundarySE = length+1 > 1+square[0] ? 1+square[0] : length+1
        }
        for(let i = 0; i < squaresUntilBoundarySE; i++){
          piecesFound.push(this.board[square[0] - i][square[1] + i])
          coordinatesScanned.push([square[0] - i,square[1] + i])
        }
        break
      case "southwest":
        for(let i = 0; i <= (length > 0+square[eastFirstCollision^1] ? 0+square[eastFirstCollision^1] : length); i++){
          piecesFound.push(this.board[square[0] - i][square[1] - i])
          coordinatesScanned.push([square[0] - i,square[1] - i])
        }
        break
      case "northwest":
        let squaresUntilBoundaryNW = 1
        if(westFirstCollision == 0){
          squaresUntilBoundaryNW = length+1 > 8-square[0] ? 8-square[0] : length+1
        } else {
          //squaresUntilBoundaryNW = westFirstCollision == 0 ? 8-square[0] : 1+square[1]
          squaresUntilBoundaryNW = length+1 > 1+square[1] ? 1+square[1] : length+1
        }
        
        for(let i = 0; i < squaresUntilBoundaryNW; i++){
          piecesFound.push(this.board[square[0] + i][square[1] - i])
          coordinatesScanned.push([square[0] + i,square[1] - i])
        }
        break
      case "knight":
        piecesFound.push(this.board[square[0]][square[1]])
        coordinatesScanned.push([square[0],square[1]])
        let knightMoves = [[2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-1,-2],[1,-2],[2,-1]]
        for(let i = 0; i < 8; i++){
          let squareToCheck = [square[0] + knightMoves[i][0], square[1] + knightMoves[i][1]]
          if(squareToCheck[0] >= 0 && squareToCheck[0] < 8 && squareToCheck[1] >= 0 && squareToCheck[1] < 8){
            piecesFound.push(this.board[squareToCheck[0]][squareToCheck[1]])
            coordinatesScanned.push([squareToCheck[0],squareToCheck[1]])
          }
        }
        
      default:
        break
    }
    
    if(direction != "knight") {
      for(let i = 1; i < piecesFound.length; i++){
        if(piecesFound[i] != "e"){
          distToClosestPiece = i
          i = piecesFound.length
        }
      }
    }
    
    return {
      piecesFound: piecesFound,
      coordinatesScanned: coordinatesScanned,
      distToClosestPiece: distToClosestPiece
    }
  }

  getScannedBoard(direction, square, length = 9, asString = false){
    let line = this.scanDirection(direction, square, length)
    let scannedBoard = this.board.map(row => row.map(piece => piece)) // copy the board
    let boardAsString = ""

    for(const coord of line.coordinatesScanned) {
      scannedBoard[coord[0]][coord[1]] = "X"
    }

    //scannedBoard[square[0]][square[1]] = "S" // mark the selected square

    if (line.distToClosestPiece != -1) {
      scannedBoard[line.coordinatesScanned[line.distToClosestPiece][0]][line.coordinatesScanned[line.distToClosestPiece][1]] = "C"
    }

    scannedBoard.reverse().forEach(row => {
      row.forEach(piece => {
        boardAsString += (asString ? (piece == "e" ? "  " : (piece == "X" ? "X " : piece)) + " " : this.chessPieceToUnicode[piece] + " ")
      })
      boardAsString += "\n"
    })

    return boardAsString
  }

  getValidMoves(square){
    let currentPiece = this.board[square[0]][square[1]]

    if(currentPiece == "e"){
      return []
    }

    let color = currentPiece[0]
    let validMoves = []

    switch(currentPiece[1]){
      case "r": //rook
        let directions = ["north", "east", "south", "west"]

        for(const direction of directions){
          let scanResult = this.scanDirection(direction, square)
          if(scanResult[2] == -1){
            validMoves.push(...(scanResult[0].keys()))
          } else {
            
          }
        }

        break
    }

    return validMoves
  }
}

let chessBoard = new ChessBoard()
let square = [6,4]
let line = chessBoard.getScannedBoard("southeast", square)

console.log(line)
//console.log("selected: " + chessBoard.board[square[0]][square[1]])
//console.log(chessBoard.getBoard())