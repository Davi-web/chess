import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Color, Move, Square, Piece } from 'chess.js';
import socket from './socket';
import {
  BoardOrientation,
  BoardPosition,
  PromotionPieceOption,
  Piece as PieceType,
  Square as SquareType,
  PromotionStyle,
} from 'react-chessboard/dist/chessboard/types';
import { Clipboard } from 'lucide-react';
import { toast } from 'sonner';
import { Player } from './page';
import CustomDialogModal from '@/components/modals/customDialogModal';
import useCustomDialogModal from '@/zustand/useCustomDialogModal';
import PlayerTurnTimer from '@/components/PlayerTurnTimer';

interface GameProps {
  players: Player[];
  username: string;
  room: string;
  orientation: BoardOrientation;
  cleanup: () => void;
  roomId: string;
}

interface OptionSquares {
  [key: string]: {
    background: string;
    borderRadius?: string;
  };
}

interface RightClickedSquares {
  [key: string]: {
    backgroundColor: string;
  };
}

interface History {
  piece: Piece;
  fen: string;
}
const TIME_TOTAL = 30; // 1 minute

const Game: React.FC<GameProps> = ({
  players,
  username,
  room,
  orientation,
  cleanup,
  roomId,
}) => {
  const chess = useMemo(() => new Chess(), []); // <- 1
  const [fen, setFen] = useState<string | BoardPosition>(chess.fen()); // <- 2
  const [moveFrom, setMoveFrom] = useState<SquareType | null>(null);
  const [moveTo, setMoveTo] = useState<SquareType | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [optionSquares, setOptionSquares] = useState<OptionSquares>({});
  const [kingCheck, setKingCheck] = useState({}); // <- 3
  const [over, setOver] = useState('');
  const [history, setHistory] = useState<History[]>([]);
  const [rightClickedSquares, setRightClickedSquares] =
    useState<RightClickedSquares>({});
  const [p1TimeRemaining, setP1TimeRemaining] = useState(100);
  const [p2TimeRemaining, setP2TimeRemaining] = useState(100);
  const modal = useCustomDialogModal();

  const makeAMove = useCallback(
    (moveData: {
      from: Square;
      to: Square;
      color: Color;
      promotion?: string;
    }) => {
      try {
        const result = chess.move({
          from: moveData.from,
          to: moveData.to,
          promotion: moveData.promotion ?? 'q',
        }); // update Chess instance
        setFen(chess.fen()); // update fen state to trigger a re-render
        setHistory((prev) => [
          ...prev,
          {
            piece: {
              type: chess.get(moveData.to)?.type,
              color: chess.get(moveData.to)?.color,
            },
            fen: chess.fen(),
          },
        ]);
        if (chess.isCheck()) {
          //find king position from the board from the fen
          const king = chess
            .board()
            .flat()
            .find((p) => p?.type === 'k' && p?.color !== moveData.color);
          if (king) {
            setKingCheck({
              [king.square]: { background: 'rgba(255, 0, 0, 1)' },
            });
          }
        } else {
          setKingCheck({});
        }

        if (chess.isGameOver()) {
          // check if move led to "game over"
          if (chess.isCheckmate()) {
            // if reason for game over is a checkmate
            // Set message to checkmate.
            setOver(
              `Checkmate! ${chess.turn() === 'w' ? 'black' : 'white'} wins!`
            );
            modal.onOpen();
            // The winner is determined by checking for which side made the last move
          } else if (chess.isDraw()) {
            // if it is a draw
            setOver('Draw'); // set message to "Draw"
          } else {
            setOver('Game over');
          }
        }

        return result;
      } catch (e) {
        console.log(e);
        return null;
      } // null if the move was illegal, the move object if the move was legal
    },
    [chess, modal]
  );

  function getMoveOptions(square: Square) {
    const moves = chess.moves({
      square,
      verbose: true,
    });
    // console.log('getting move options', moves);
    if (moves.length === 0) {
      console.log('no moves');
      setOptionSquares({});
      return false;
    }

    const newSquares: OptionSquares = {};
    moves.map((move: Move) => {
      newSquares[move.to] = {
        background:
          chess.get(move.to) &&
          chess.get(move.to).color !== chess.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    setOptionSquares(newSquares);
    return true;
  }
  // console.log(history);

  function onPromotionPieceSelect(piece?: PromotionPieceOption) {
    // if no piece passed then user has cancelled dialog, don't make move and reset
    if (piece && moveFrom && moveTo) {
      console.log('promotion piece selected', piece);
      const move = makeAMove({
        from: moveFrom as Square,
        to: moveTo as Square,
        color: chess.turn(),
        promotion: piece[1].toLowerCase() ?? 'q',
      });
      socket.emit('move', {
        move,
        room,
      });
      setMoveFrom(null);
      setMoveTo(null);
      setOptionSquares({});
    }
    setShowPromotionDialog(false);
    return true;
  }

  function onPieceDragBegin(piece: PieceType, sourceSquare: SquareType) {
    if (piece[0] === orientation[0]) {
      getMoveOptions(sourceSquare);
    }
  }
  function onPieceDragEnd(piece: PieceType, sourceSquare: SquareType) {
    //get the target square from source square
    setOptionSquares({});
  }

  // onDrop function
  function onDrop(
    sourceSquare: SquareType,
    targetSquare: SquareType,
    piece: PieceType
  ) {
    // orientation is either 'white' or 'black'. game.turn() returns 'w' or 'b'
    if (piece[0] !== orientation[0]) return false; // <- 1 prohibit player from moving piece of other player

    if (players.length < 2) return false; // <- 2 disallow a move if the opponent has not joined
    //if not valid move
    if (
      !chess
        .moves({ verbose: true })
        .some((m) => m.from === sourceSquare && m.to === targetSquare)
    )
      return false;
    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      promotion: piece[1].toLowerCase() ?? 'q',
      // based on promotional dialog
    };

    const move = makeAMove(moveData);

    // illegal move
    if (move === null) return false;

    socket.emit('move', {
      // <- 3 emit a move event.
      move,
      room,
    }); // this event will be transmitted to the opponent via the server

    return true;
  }

  function onSquareclick(square: SquareType) {
    if (players.length < 2) return;

    if (square === moveFrom) {
      setMoveFrom(null);
      setOptionSquares({});
      return;
    }
    if (moveFrom && moveTo) {
      setMoveFrom(null);
      setMoveTo(null);
      setOptionSquares({});
    }

    // if clicked on a piece of the same color, setMoveFrom
    if (!moveFrom) {
      if (chess.get(square).color !== orientation[0]) return;
      else if (chess.get(square).color !== chess.turn()) {
        //enable premove for later
      } else {
        if (getMoveOptions(square)) {
          setMoveFrom(square);
        }
      }

      return;
    }
    // if valid move
    if (!moveTo) {
      // check if valid move before showing dialog
      const moves = chess.moves({
        square: moveFrom,
        verbose: true,
      });
      const foundMove = moves.find(
        (m) => m.from === moveFrom && m.to === square
      );
      // not a valid move
      if (!foundMove) {
        // check if clicked on new piece
        const hasMoveOptions = getMoveOptions(square);
        // if new piece, setMoveFrom, otherwise clear moveFrom
        setMoveFrom(hasMoveOptions ? square : null);
        return;
      }
      // if valid move
      setMoveTo(square);
      //if promotion move
      if (
        (chess.get(moveFrom).type === 'p' &&
          chess.get(moveFrom).color === 'w' &&
          square[1] === '8') ||
        (chess.get(moveFrom).type === 'p' &&
          chess.get(moveFrom).color === 'b' &&
          square[1] === '1')
      ) {
        setShowPromotionDialog(true);
        console.log('promotion move!!');
        return;
      }

      const moveData = {
        from: moveFrom as Square,
        to: square,
        color: chess.turn(),
        promotion: 'q',
      };
      const move = makeAMove(moveData);

      // if invalid, setMoveFrom and getMoveOptions
      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }
      socket.emit('move', {
        move,
        room,
      });

      setMoveFrom(null);
      setMoveTo(null);

      setOptionSquares({});
      return;
    }

    // // if promotion move
  }

  function copyRoomId() {
    navigator.clipboard.writeText(room);
    toast('Room ID copied to clipboard');
  }
  function handleClose() {
    socket.emit('closeRoom', { roomId: room });
    cleanup();
    modal.onClose();
  }

  useEffect(() => {
    socket.on('move', (move) => {
      console.log('opponent move', move);
      makeAMove(move); //
    });
    return () => {
      socket.off('move');
    };
  }, [makeAMove]);

  useEffect(() => {
    socket.on('playerDisconnected', (player) => {
      setOver(`${player.username} has disconnected`); // set game over
      modal.onOpen();
    });
    return () => {
      socket.off('playerDisconnected');
    };
  }, [modal]);

  useEffect(() => {
    socket.on('closeRoom', ({ roomId }) => {
      console.log('closeRoom', roomId, room);
      if (roomId === room) {
        cleanup();
        modal.onClose();
      }
    });
    return () => {
      socket.off('closeRoom');
    };
  }, [room, cleanup, modal]);
  //open the modal when the game is over

  useEffect(() => {
    if (players.length < 2) return;
    // Emit the 'getTimeRemaining' event to the server with the roomId and playerId
    socket.emit(
      'startTimers',
      roomId,
      players[0].id,
      players[1].id,
      'w',
      'b',
      () => {
        // Update the local state with the received time remaining value
        socket.emit(
          'getTimeRemaining',
          roomId,
          players[0].id,
          players[1].id,
          chess.turn(),
          (p1time: number, p2time: number) => {
            console.log('get time remaining callback', p1time, p2time);
            setP1TimeRemaining(p1time);
            setP2TimeRemaining(p2time);
          }
        );
        return () => {
          socket.off('getTimeRemaining');
        };
      }
    );
    return () => {
      socket.off('startTimers');
    };
  }, [players, roomId, chess]);

  // call getTimeRemaining every second for the current player or if the player made a move
  // know whos turn it is with chess.turn()
  useEffect(() => {
    if (players.length < 2) return;
    const interval = setInterval(() => {
      socket.emit(
        'getTimeRemaining',
        roomId,
        players[0].id,
        players[1].id,
        chess.turn(),
        (p1time: number, p2time: number) => {
          if (p1time <= 0 || p2time <= 0) {
            setOver('Time is up');
            modal.onOpen();
            return;
          }
          console.log('get time remaining callback', p1time, p2time);
          setP1TimeRemaining(p1time);
          setP2TimeRemaining(p2time);
        }
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [players, chess, roomId, modal]);
  useEffect(() => {
    if (players.length < 2) return;
    socket.emit(
      'switchTurn',
      roomId,
      chess.turn() === 'w' ? players[0].id : players[1].id
    );
    return () => {
      socket.off('switchTurn');
    };
  }, [chess.turn(), players, roomId]);

  // useEffect(() => {
  //   // Set up event listener for 'timeRemaining' event emitted by the server
  //   const handleTimeRemaining = (remaining: number) => {
  //     setTimeRemaining(remaining);
  //   };
  //   socket.on('timeRemaining', handleTimeRemaining);

  //   // Clean up event listener when component unmounts
  //   return () => {
  //     socket.off('timeRemaining', handleTimeRemaining);
  //   };
  // }, [timeRemaining]); // Empty dependency array ensures this effect runs only once, like componentDidMount

  // Game component returned jsx
  return (
    <div className="flex flex-col">
      <Card>
        <CardHeader>
          <CardTitle>Chess with a Twist</CardTitle>
        </CardHeader>
        <CardContent>
          <CardTitle className=" flex">
            Room ID:{' '}
            <div className="flex">
              {room}{' '}
              <Clipboard onClick={copyRoomId} className="cursor-pointer" />
            </div>
          </CardTitle>
          <CardDescription>
            <div className="flex flex-row pt-2"></div>
          </CardDescription>
        </CardContent>

        <CardFooter>
          <CardDescription>
            {players.length > 1 ? (
              <PlayerTurnTimer
                p1={players[0]}
                p2={players[1]}
                p1TimeRemaining={p1TimeRemaining}
                p2TimeRemaining={p2TimeRemaining}
                timeTotal={TIME_TOTAL}
              />
            ) : (
              'Waiting for opponent to join'
            )}
          </CardDescription>
        </CardFooter>
      </Card>
      <div className="sm:pt-2 flex flex-col  sm:flex-row">
        <div className="w-88 h-88 sm:w-[600px] sm:h-[600px] flex m-2">
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            onPieceDragBegin={onPieceDragBegin}
            boardOrientation={orientation}
            onPieceDragEnd={onPieceDragEnd}
            arePiecesDraggable={true}
            areArrowsAllowed={false}
            arePremovesAllowed={true}
            onSquareClick={onSquareclick}
            onPromotionPieceSelect={moveTo ? onPromotionPieceSelect : undefined}
            customBoardStyle={{
              borderRadius: '4px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            }}
            customSquareStyles={{
              ...optionSquares,
              ...rightClickedSquares,
              ...kingCheck,
            }}
            promotionToSquare={moveTo}
            showPromotionDialog={showPromotionDialog}
          />
        </div>
        {players.length > 0 && (
          <Card className="h-full justify-center flex w-88 sm:w-96  m-2">
            <CardContent>
              <CardDescription>Players</CardDescription>
              {players.map((p) => (
                <div key={p.id}>
                  <h1>
                    {p.username} - {p.rating}
                  </h1>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
      <CustomDialogModal
        modal={modal}
        title={over}
        contentText={over}
        handleClose={handleClose}
        handleContinue={handleClose}
      >
        {over}
      </CustomDialogModal>
    </div>
  );
};

export default Game;
