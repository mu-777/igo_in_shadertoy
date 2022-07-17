
bool IsSpace(ivec2 boardPos){
  return (FetchBoardData(boardPos).w == BOARD_STATE_SPACE);
}

// true if there is at least one space around boardPos
// Top is excepted when except==1, Right is 2, Bottom is 3 and Left is 4. No excepted when 0. Excepted will be BOARD_STATE_OUT
// arround.x is Top of boardPos, y is Right, z is Bottom, w is Left
bool CheckArround(ivec2 boardPos, int except, out vec4 arround){
  arround.x = (except == 1) ? BOARD_STATE_OUT : FetchBoardData(ivec2(boardPos.x, boardPos.y-1)).w;
  arround.y = (except == 2) ? BOARD_STATE_OUT : FetchBoardData(ivec2(boardPos.x+1, boardPos.y)).w;
  arround.z = (except == 3) ? BOARD_STATE_OUT : FetchBoardData(ivec2(boardPos.x, boardPos.y+1)).w;
  arround.w = (except == 4) ? BOARD_STATE_OUT : FetchBoardData(ivec2(boardPos.x-1, boardPos.y)).w;
  return (arround.x == BOARD_STATE_SPACE)
         || (arround.y == BOARD_STATE_SPACE)
         || (arround.z == BOARD_STATE_SPACE)
         || (arround.w == BOARD_STATE_SPACE);
}

bool IsArroundByTheOther(ivec2 newBoardPos, bool isBlack){
  vec4 arround;
  if(CheckArround(newBoardPos, 0, arround)){
    return false;
  }
  float thisSide = isBlack ? BOARD_STATE_BLACK : BOARD_STATE_WHITE;
  if((arround.x != thisSide) && (arround.y != thisSide)
     && (arround.z != thisSide) && (arround.w != thisSide)){
    return true;
  }
  
  int checkedLen = 0;
  ivec2 checked[400];
  checked[checkedLen++] = newBoardPos;
  
  int willCheckLen = 0;
  ivec2 willCheck[400];
  if(arround.x == thisSide){
    willCheck[willCheckLen++] = ivec2(newBoardPos.x, newBoardPos.y-1);
  }
  if(arround.y == thisSide){
    willCheck[willCheckLen++] = ivec2(newBoardPos.x+1, newBoardPos.y);
  }
  if(arround.z == thisSide){
    willCheck[willCheckLen++] = ivec2(newBoardPos.x, newBoardPos.y+1);
  }
  if(arround.w == thisSide){
    willCheck[willCheckLen++] = ivec2(newBoardPos.x-1, newBoardPos.y);
  }
  
  int cnt = 0;
  while(cnt != willCheckLen){
    ivec2 target = willCheck[cnt++];
    
    // 1. 自身がchecked と被ってないか確認して，被ってたらcontinue
    // 2. 周囲がchecked と被ってないか確認して，被ってたらCheckArroundのExceptに入れる
    // 3. CheckArround して，Spaceがあれば即return false，味方がいればwillCheckに足す（すでにwillCheckに入ってる可能性があるが，自身のchecked確認ではじける）
  }
  
  return true;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  ivec2 intFragCoord = ivec2(fragCoord.xy);
  vec4 outPixel = FetchBoardData(intFragCoord);

  IgoBoardConf ibc = CommonIgoConf(iResolution.xy);

  if(intFragCoord.x > int(ibc.boardNum)+1
     || intFragCoord.y > int(ibc.boardNum)+1){
    return;
  }
  
  vec2 mouseInBoardCoord = FragCoordToBoardCoord(iMouse.xy, iResolution.xy, ibc);
  ivec2 mouseBoardPos = BoardCoordToBoardPos(mouseInBoardCoord);
  vec4 prevStoneData = FetchBoardData(ivec2(0,0));
  bool isMousePressing = (iMouse.z > 0.0);
  
  float prevMouseState = prevStoneData.z;
  bool isFirstFrame = (prevMouseState == 0.0);
  float currMouseState = isFirstFrame ? MOUSE_NO_PRESS 
                    : (prevMouseState == MOUSE_NO_PRESS) && !isMousePressing ? MOUSE_NO_PRESS
                    : (prevMouseState == MOUSE_NO_PRESS) && isMousePressing ? MOUSE_DOWN
                    : (prevMouseState == MOUSE_DOWN || prevMouseState == MOUSE_PRESSING) && isMousePressing ? MOUSE_PRESSING
                    : (prevMouseState == MOUSE_DOWN || prevMouseState == MOUSE_PRESSING) && !isMousePressing ? MOUSE_UP
                    : (prevMouseState == MOUSE_UP) ? MOUSE_NO_PRESS
                    : prevMouseState;
  bool isPlaceable = isFirstFrame 
                     || IsSpace(mouseBoardPos);
  bool isUpdate = (currMouseState == MOUSE_UP && isPlaceable);
  
  if(isFirstFrame){
    if(intFragCoord.x == 0 || intFragCoord.x == int(ibc.boardNum)+1
           || intFragCoord.y == 0 || intFragCoord.y == int(ibc.boardNum)+1){
      outPixel.w = BOARD_STATE_OUT;
    }
    else{
      outPixel.w = BOARD_STATE_SPACE;
    }
  }

  // Store mouse state in [0, 0]
  if(intFragCoord.xy == ivec2(0, 0)){
    if(IsInBoard(mouseInBoardCoord, ibc, 0.0)){
      outPixel.xy = mouseInBoardCoord;
    }    
    outPixel.z = currMouseState;
    outPixel.w = isFirstFrame ? BOARD_STATE_BLACK 
                 : !isUpdate ? prevStoneData.w
                 : prevStoneData.w == BOARD_STATE_BLACK ? BOARD_STATE_WHITE : BOARD_STATE_BLACK;
  }
  // Store board state
  else{
    if(isUpdate && intFragCoord.xy == mouseBoardPos){
      outPixel.w = prevStoneData.w;
    }
  }
  fragColor = outPixel;
}