bool IsSpace(ivec2 boardPos){
  return (FetchBoardData(boardPos).w == BOARD_STATE_SPACE);
}

// Top with offsetDir==1, Right with offsetDir==2, Bottom with offsetDir==3, Left with offsetDir==4
ivec2 OffsetBoardPos(ivec2 boardPos, int offsetDir){
  if(offsetDir == 1){
    return ivec2(boardPos.x, boardPos.y-1);
  }
  if(offsetDir == 2){
    return ivec2(boardPos.x+1, boardPos.y);
  }
  if(offsetDir == 3){
    return ivec2(boardPos.x, boardPos.y+1);
  }
  if(offsetDir == 4){
    return ivec2(boardPos.x-1, boardPos.y);
  }
  return boardPos;
}

// true if there is at least one space around boardPos
// arround.x is Top of boardPos, y is Right, z is Bottom, w is Left
bool CheckAround(ivec2 boardPos, ivec4 except, out vec4 around){
  around.x = (except.x == 1) ? BOARD_STATE_OUT : FetchBoardData(OffsetBoardPos(boardPos, 1)).w;
  around.y = (except.y == 1) ? BOARD_STATE_OUT : FetchBoardData(OffsetBoardPos(boardPos, 2)).w;
  around.z = (except.z == 1) ? BOARD_STATE_OUT : FetchBoardData(OffsetBoardPos(boardPos, 3)).w;
  around.w = (except.w == 1) ? BOARD_STATE_OUT : FetchBoardData(OffsetBoardPos(boardPos, 4)).w;
  return (around.x == BOARD_STATE_SPACE)
         || (around.y == BOARD_STATE_SPACE)
         || (around.z == BOARD_STATE_SPACE)
         || (around.w == BOARD_STATE_SPACE);
}

bool IsAroundByTheOther(ivec2 newBoardPos, bool isBlack){
  vec4 around;
  if(CheckAround(newBoardPos, ivec4(0), around)){
    return false;
  }
  float thisSide = isBlack ? BOARD_STATE_BLACK : BOARD_STATE_WHITE;
  if((around.x != thisSide) && (around.y != thisSide)
     && (around.z != thisSide) && (around.w != thisSide)){
    return true;
  }
  
  int checkedLen = 0;
  ivec2 checked[400];
  checked[checkedLen++] = newBoardPos;
  
  int willCheckLen = 0;
  ivec2 willCheck[400];
  if(around.x == thisSide){
    willCheck[willCheckLen++] = OffsetBoardPos(newBoardPos, 1);
  }
  if(around.y == thisSide){
    willCheck[willCheckLen++] = OffsetBoardPos(newBoardPos, 2);
  }
  if(around.z == thisSide){
    willCheck[willCheckLen++] = OffsetBoardPos(newBoardPos, 3);
  }
  if(around.w == thisSide){
    willCheck[willCheckLen++] = OffsetBoardPos(newBoardPos, 4);
  }
  
  int cnt = 0;   
  while(cnt != willCheckLen){
    ivec2 target = willCheck[cnt++];

    bool targetIsChecked = false;
    ivec4 except = ivec4(0);
    for(int i=0; i<checkedLen+1; i++){
      // 1. 自身がchecked と被ってないか確認して，被ってたら次のwillCheckに移る（continue）
      if(checked[i] == target){
        targetIsChecked = true;
        break;
      }      
      // 2. 周囲がchecked と被ってないか確認して，被ってたらCheckArroundのExceptに入れる
      else if(checked[i] == OffsetBoardPos(target, 1)){
        except.x = 1;
      }
      else if(checked[i] == OffsetBoardPos(target, 2)){
        except.y = 1;
      }
      else if(checked[i] == OffsetBoardPos(target, 3)){
        except.z = 1;
      }
      else if(checked[i] == OffsetBoardPos(target, 4)){
        except.w = 1;
      }
    }
    if(targetIsChecked){
      continue;
    }
    
    // 3. CheckArround して，Spaceがあれば即return false，味方がいればwillCheckに足す
    //（すでにwillCheckに入ってる可能性があるが，自身のchecked確認ではじける）
    if(CheckAround(target, except, around)){
      return false;
    }
    checked[checkedLen++] = target;
    if((around.x != thisSide) && (around.y != thisSide)
       && (around.z != thisSide) && (around.w != thisSide)){
      continue;
    }
    if(around.x == thisSide){
      willCheck[willCheckLen++] = ivec2(target.x, target.y-1);
    }
    if(around.y == thisSide){
      willCheck[willCheckLen++] = ivec2(target.x+1, target.y);
    }
    if(around.z == thisSide){
      willCheck[willCheckLen++] = ivec2(target.x, target.y+1);
    }
    if(around.w == thisSide){
      willCheck[willCheckLen++] = ivec2(target.x-1, target.y);
    }
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
                     || (IsSpace(mouseBoardPos) 
                         && !IsAroundByTheOther(mouseBoardPos, prevStoneData.w == BOARD_STATE_BLACK)
                         );
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