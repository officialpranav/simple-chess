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

    this.moveList = [{from: [], to: [], piece: "", type: ""}]
//update when a king moves
    this.kingLocations = {white: [0,4],
                          black: [7,4]}
  }

  getBoard(asString = false){
    let boardAsString=""
    let copy = JSON.parse(JSON.stringify(this.board))
    copy.reverse().forEach(row => {
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

  movePieceDirect(square1, square2){
    this.moveList.push({from: square1, to: square2, piece: this.board[square1[0]][square1[1]], type: "normal"})

    this.board[square2[0]][square2[1]] = this.board[square1[0]][square1[1]]
    this.board[square1[0]][square1[1]] = "e"
  }

  scanDirection(direction, square, length = 9, customBoard = null){
    let boardToScan = customBoard ? customBoard : this.board 

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
        for(let i = square[1]; i < (square[1] + length + 1 >= 8 ? 8 : square[1] + length + 1); i++){
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
    let scannedBoard = JSON.parse(JSON.stringify(this.board)) // copy the board
    let boardAsString = ""

    for(const coord of line.coordinatesScanned) {
      scannedBoard[coord[0]][coord[1]] = "X"
    }

    scannedBoard[square[0]][square[1]] = "S" // mark the selected square

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
    let directions = []
    const handleRookBishopQueen = (length = 9) => {
      for(const direction of directions){
        let scanResult = this.scanDirection(direction, square, length)
        for(let i = 1; i < scanResult.coordinatesScanned.length; i++){
          let piece = scanResult.piecesFound[i]
          if(piece == "e"){
            validMoves.push(scanResult.coordinatesScanned[i])
          } else if(piece[0] != color){
            validMoves.push(scanResult.coordinatesScanned[i])
            break
          } else {  
            break
          }
        }
      }
    }

    switch(currentPiece[1]){
      case "r": //rook
        directions = ["north", "east", "south", "west"]
        handleRookBishopQueen()
        break
      case "p":
        console.log("p")
        directions = color == "b" ? ["south", "southeast", "southwest"] : ["north", "northeast", "northwest"]
        if(color == "b" && square[0] == 6 || color == "w" && square[0] == 1){
          let scanResult = this.scanDirection(directions[0], square, 2)
          for(let i = 1; i < 3; i++){
            if(scanResult.piecesFound[i] == "e"){
              validMoves.push(scanResult.coordinatesScanned[i])
            } else {
              break
            }
          }
        } else {
          let scanResult = this.scanDirection(directions[0], square, 1)
          if(scanResult.distToClosestPiece == -1){
            validMoves.push(scanResult.coordinatesScanned[1])
          }
        }
        for(const direction of directions.slice(1)){
          let scanResult = this.scanDirection(direction, square, 1)
          if(scanResult.distToClosestPiece == 1 && scanResult.piecesFound[1][0] != color){
            validMoves.push(scanResult.coordinatesScanned[1])
          }
        }
        //check for en passant
        if(color = "b" && square[0] == 3 || color == "w" && square[0] == 4){
          let leftScan = this.scanDirection("west", square, 1)
          let rightScan = this.scanDirection("east", square, 1)
          if(this.moveList[this.moveList.length-1].piece[1] == "p" && Math.abs(this.moveList[this.moveList.length-1].from[0] - this.moveList[this.moveList.length-1].to[0]) == 2){
            if(leftScan.piecesFound[1][1] == "p" && leftScan.piecesFound[1][0] != color){
              validMoves.push([color == "b" ? 2 : 5, square[1] - 1])
            } else if(rightScan.piecesFound[1][1] == "p" && rightScan.piecesFound[1][0] != color) {
              validMoves.push([color == "b" ? 2 : 5, square[1] + 1])
            }
          }
        }

        break
      case "n":
        let scanResult = this.scanDirection("knight", square)
        for(let i = 1; i < scanResult.coordinatesScanned.length; i++){
          if(scanResult.piecesFound[i][0] != color || scanResult.piecesFound[i] == "e"){
            validMoves.push(scanResult.coordinatesScanned[i])
          }
        }
        break
      case "b":
        directions = ["northeast", "southeast", "southwest", "northwest"]
        handleRookBishopQueen()
        break
      case "q":
        directions = ["north", "east", "south", "west", "northeast", "southeast", "southwest", "northwest"]
        handleRookBishopQueen()
        break
      case "k":
        directions = ["north", "east", "south", "west", "northeast", "southeast", "southwest", "northwest"]
        handleRookBishopQueen(1)
        break

    }

    

    return validMoves
  }

  getBoardWithValidMoves(piecePosition, asString = false) {
    // First, get the valid moves for the piece at the given position
    let validMoves = this.getValidMoves(piecePosition);
    let boardAsString = ""
  
    // Then, create a new board that will show the valid moves
    let boardWithValidMoves = JSON.parse(JSON.stringify(this.board)); // Deep copy of the board
  
    // For each valid move, mark the corresponding square on the new board
    console.log(validMoves)
    for (let move of validMoves) {
      boardWithValidMoves[move[0]][move[1]] = 'X';
    }
  
    // Finally, return the new board
    boardWithValidMoves.reverse().forEach(row => {
      row.forEach(piece => {
        boardAsString += (asString ? (piece == "e" ? "  " : (piece == "X" ? "X " : piece)) + " " : this.chessPieceToUnicode[piece] + " ")
      })
      boardAsString += "\n"
    })

    return boardAsString
  }

  getKingStatus(color, position = null){
    let kingLocation = this.kingLocations[(color == "w" ? "white" : "black")]
    let kingStatus = "safe"
    let directions = ["north", "east", "south", "west", "northeast", "southeast", "southwest", "northwest", "knight"]
    for(let i = 0; i < 9; i++){
      let direction = directions[i]
      let scanResult = this.scanDirection(direction, kingLocation)
      if(scanResult.distToClosestPiece == -1 && direction != "knight"){
        continue
      } else if(direction=="knight"){
        for(let i = 1; i < scanResult.piecesFound.length; i++){
          let piece = scanResult.piecesFound[i]
          if(piece[0] != color && piece[1] == "n"){
            kingStatus = "check"
            break
          }
        }
      } else {
        let piece = scanResult.piecesFound[scanResult.distToClosestPiece]
        if(piece[0] != color){
          if((i <= 3 && (piece[1] == "q" || piece[1] == "r")) || (i >= 4 && i <= 7 && (piece[1] == "q" || piece[1] == "b")) || (["northeast", "northwest"].includes(direction) && piece[1] == "p" && color=="w") || (["southeast", "southwest"].includes(direction) && piece[1] == "p" && color=="b")){
            kingStatus = "check"
            break
          }
        }
      }
    }
    return {
      kingStatus: kingStatus,
      immovablePieces: []
    }
  }
} 

let chessBoard = new ChessBoard()
chessBoard.movePieceDirect([0,1],[6,6])
console.log(chessBoard.getBoard())
console.log(chessBoard.getKingStatus("b"))

