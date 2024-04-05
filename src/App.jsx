import ChessBoard from "./gameComponents/ChessBoard"

function App() {
  let myBoard = new ChessBoard()

  return (
    <>
      <button onClick={()=>{console.log(myBoard.getBoard(false))}}>press me</button>
    </>
  )
}

export default App
