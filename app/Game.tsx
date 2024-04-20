import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Color, Move, Square, Piece, PieceSymbol } from 'chess.js';
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
import axios from 'axios';
import domtoimage from 'dom-to-image';

interface GameProps {
  players: Player[];
  username: string;
  room: string;
  orientation: BoardOrientation;
  currUserId: string;
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
  pieceType: PieceSymbol | null;
  pieceColor: Color | null;
  fen: string;
  msg: string;
}
const mapSymbolToPiece = (symbol: PieceSymbol) => {
  switch (symbol) {
    case 'p':
      return 'Pawn';
    case 'n':
      return 'Knight';
    case 'b':
      return 'Bishop';
    case 'r':
      return 'Rook';
    case 'q':
      return 'Queen';
    case 'k':
      return 'King';
    default:
      return '';
  }
};

const Game: React.FC<GameProps> = ({
  players,
  username,
  room,
  orientation,
  currUserId,
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
  const [timeTotal, setTimeTotal] = useState(15);
  const canvasRef = useRef<HTMLDivElement>(null);

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
            pieceType: chess.get(moveData.to)?.type,
            pieceColor: chess.get(moveData.to)?.color,
            fen: chess.fen(),
            msg: `${
              chess.get(moveData.to)?.color === 'w' ? 'White' : 'Black'
            } moved ${mapSymbolToPiece(chess.get(moveData.to)?.type)} to ${
              moveData.to
            }`,
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
            // Set message to checkmate. The winner is determined by checking for which side made the last move
            setOver(
              `Checkmate! ${chess.turn() === 'w' ? 'black' : 'white'} wins!`
            );
            // The winner is determined by checking for which side made the last move
          } else if (chess.isDraw()) {
            // if it is a draw
            setOver('Draw'); // set message to "Draw"
          } else {
            setOver('Game over');
          }
          modal.onOpen();
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
    // Return if the player is not the current player
    if (chess.turn() !== orientation[0]) return;

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
    window.location.reload();
  }

  const takeScreenshot = (node: HTMLDivElement) => {
    if (!node) return null;
    // try {
    //   const dataUrl = await domtoimage.toPng(node);
    //   console.log('dom', dataUrl);
    //   let file = new File([dataUrl], fen as string, {
    //     type: 'image/png',
    //   });
    //   console.log('file', file);
    //   return file;
    // } catch (e) {
    //   console.log(`something went wrong for screenshot`, e);
    // }
    const dataUrl = domtoimage
      .toPng(node)
      .then(function (dataUrl) {
        // var img = new Image();
        // img.src = dataUrl;
        console.log('dataUrl', dataUrl);
        const file = dataURLtoFile(dataUrl, fen as string);
        const formData = new FormData();
        formData.append('file', file);
        axios
          .post('/api/upload-image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            transformRequest: (data) => {
              return data;
            },
          })
          .then((res) => {
            console.log('upload-image cb', res.data);
            const url =
              'https://chess-david.s3.us-west-1.amazonaws.com/' +
              res.data.fileName;

            const postData = {
              moves: history.map((h) => h.fen),
              msgs: history.map((h) => h.msg),
              result: over,
              playerIds: players.map((p) => p.id),
              draw: over === 'Draw',
              imageSrc: url,
            };
            console.log('posting data', postData);

            axios
              .post('/api/chess', postData)
              .then((res) => console.log(res.data))
              .catch((e) => console.log(e));
          })
          .catch((e) => console.log(e));

        return dataUrl;

        // saveAs(dataUrl, fen as string);
      })
      .catch((e) => console.log(e));
    return dataUrl;
  };
  function dataURLtoFile(dataUrl: string, filename: string) {
    let arr = dataUrl.split(','),
      mime = arr[0].match(/:(.*?);/)?.[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
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
        window.location.reload();
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
          (p1time: number, p2time: number, timeTotal: number) => {
            console.log('get time remaining callback', p1time, p2time);
            setP1TimeRemaining(p1time);
            setP2TimeRemaining(p2time);
            setTimeTotal(timeTotal / 1000);
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
    if (over) return;
    const interval = setInterval(() => {
      socket.emit(
        'getTimeRemaining',
        roomId,
        players[0].id,
        players[1].id,
        chess.turn(),
        (p1time: number, p2time: number) => {
          if (p1time <= 0 || p2time <= 0) {
            // We will flip the turn to go to the next player
            const updatedFen = chess.fen().split(' ');
            updatedFen[1] = chess.turn() === 'w' ? 'b' : 'w';
            chess.load(updatedFen.join(' '));
            setFen(chess.fen());
            setHistory((prev) => [
              ...prev,
              {
                pieceType: null,
                pieceColor: null,
                fen: chess.fen(),
                msg: `Skipped ${
                  chess.turn() === 'w' ? 'black' : 'white'
                }'s turn`,
              },
            ]);
            return;
          }
          // console.log('get time remaining callback', p1time, p2time);
          setP1TimeRemaining(p1time);
          setP2TimeRemaining(p2time);
        }
      );
    }, 500);
    return () => clearInterval(interval);
  }, [players, chess, roomId, modal, over, fen]);
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

  useEffect(() => {
    if (players.length < 2) return;
    if (history.length === 0) return;
    if (history[history.length - 1].msg) {
      toast(`Move #${history.length}: ${history[history.length - 1].msg}`);
    }
  }, [history, players]);

  useEffect(() => {
    if (over && orientation[0] === 'w') {
      const winner = over.includes('white') ? players[0].id : players[1].id;
      // only post if you are the winner
      if (winner === players.find((p) => p.username === username)?.id) {
        // take screenshot
        const dataUrl = takeScreenshot(canvasRef.current!);
        console.log('dataurl', dataUrl);
      }
    }
  }, [over, canvasRef]);

  console.log(timeTotal);

  return (
    <div className="h-full w-full overflow-clip">
      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
          Room ID:{' '}
          <span className="inline-block">
            {room}{' '}
            <Clipboard
              onClick={copyRoomId}
              className="cursor-pointer inline-block"
            />
          </span>
        </CardContent>
      </Card>
      <div className="sm:pt-2 flex flex-col w-full  sm:flex-row">
        {players.length > 1 && (
          <Card className="h-full w-88 sm:w-96  m-2">
            <CardHeader>
              <CardTitle>
                {chess.turn() === orientation[0] ? 'Your' : 'Opponent'} Turn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerTurnTimer
                p1={currUserId === players[0].id ? players[0] : players[1]}
                p2={currUserId === players[0].id ? players[1] : players[0]}
                p1TimeRemaining={
                  currUserId === players[0].id
                    ? p1TimeRemaining
                    : p2TimeRemaining
                }
                p2TimeRemaining={
                  currUserId === players[0].id
                    ? p2TimeRemaining
                    : p1TimeRemaining
                }
                timeTotal={timeTotal}
              />
            </CardContent>
          </Card>
        )}
        <div className="w-88 h-88 sm:w-[600px] sm:h-[600px] flex m-2">
          <div className="w-full h-full" ref={canvasRef}>
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
              onPromotionPieceSelect={
                moveTo ? onPromotionPieceSelect : undefined
              }
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
        </div>
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
