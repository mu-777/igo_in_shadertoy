#define ARRAY_SIZE 361

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

bool IsAroundByTheOther(ivec2 newBoardPos, bool isBlack, out ivec2[ARRAY_SIZE] aroundedStones, out int aroundedStonesLen){
  aroundedStonesLen = 0;

  vec4 around;
  if(CheckAround(newBoardPos, ivec4(0), around)){
    return false;
  }
  float thisSide = isBlack ? BOARD_STATE_BLACK : BOARD_STATE_WHITE;
  if((around.x != thisSide) && (around.y != thisSide)
     && (around.z != thisSide) && (around.w != thisSide)){
    aroundedStones[aroundedStonesLen++] = newBoardPos; 
    return true;
  }
  
//  int checkedLen = 0;
//  ivec2 checked[ARRAY_SIZE];
//  checked[checkedLen++] = newBoardPos;
  aroundedStones[aroundedStonesLen++] = newBoardPos;
  
  int willCheckLen = 0;
  ivec2 willCheck[ARRAY_SIZE];
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
    for(int i=0; i<aroundedStonesLen+1; i++){
      // 1. 自身がchecked と被ってないか確認して，被ってたら次のwillCheckに移る（continue）
      if(aroundedStones[i] == target){
        targetIsChecked = true;
        break;
      }      
      // 2. 周囲がchecked と被ってないか確認して，被ってたらCheckArroundのExceptに入れる
      else if(aroundedStones[i] == OffsetBoardPos(target, 1)){
        except.x = 1;
      }
      else if(aroundedStones[i] == OffsetBoardPos(target, 2)){
        except.y = 1;
      }
      else if(aroundedStones[i] == OffsetBoardPos(target, 3)){
        except.z = 1;
      }
      else if(aroundedStones[i] == OffsetBoardPos(target, 4)){
        except.w = 1;
      }
    }
    if(targetIsChecked){
      continue;
    }
    
    // 3. CheckArround して，Spaceがあれば即return false，味方がいればwillCheckに足す
    //（すでにwillCheckに入ってる可能性があるが，自身のchecked確認ではじける）
    if(CheckAround(target, except, around)){
      aroundedStonesLen = 0;
      return false;
    }
    aroundedStones[aroundedStonesLen++] = target;
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
//  aroundedStonesLen = checkedLen;
//  aroundedStones = checked;
  return true;
}

bool CanTakeStones(ivec2 newBoardPos, bool isBlack, out ivec2[ARRAY_SIZE] takenStones, out int takenStonesLen){
  takenStonesLen = 0;
  float otherSide = isBlack ? BOARD_STATE_WHITE : BOARD_STATE_BLACK;
  
  vec4 around;
  CheckAround(newBoardPos, ivec4(0), around);
  for(int i=1; i<5; i++){
    if(otherSide != (i==1 ? around.x : i==2 ? around.y : i==3 ? around.z : i==4 ? around.w : BOARD_STATE_OUT)){
      continue;
    }
    ivec2 target = OffsetBoardPos(newBoardPos, i);
    ivec2[ARRAY_SIZE] takenStones_temp;
    int takenStonesLen_temp;
    
    bool tempTakenStonesAlreadyIncluded = false;
    if(IsAroundByTheOther(target, !isBlack, takenStones_temp, takenStonesLen_temp)){
      // 既にチェック済みの石を入れないようにする（newBoardPosの4方向を独立に評価しているが、繋がっているときがある）
      for(int j=0; j<takenStonesLen; j++){
        if(takenStones[j] == takenStones_temp[0]){
          tempTakenStonesAlreadyIncluded = true;
          break;
        }
      }
      if(!tempTakenStonesAlreadyIncluded){
      for(int j=0; j<takenStonesLen_temp; j++){
        takenStones[takenStonesLen+j] = takenStones_temp[j];
      }
      takenStonesLen = takenStonesLen+takenStonesLen_temp;
      }
    }    
  }
  return (takenStonesLen != 0);
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
  // Update BufferB only when BufferA is updated
  if(FetchBoardData(GetBufferDataPos(ibc)).w != 1.0){
    fragColor = outPixel;
    return;
  }
  
  vec4 currStoneData = FetchBoardData(ivec2(0,0));
  vec4 kouData = FetchBoardData(GetKouDataPos(ibc));
  ivec2 kouBoardPos = ivec2(kouData.xy);
  float kouTurn = kouData.w;

  ivec2 currBoardPos = BoardCoordToBoardPos(currStoneData.xy);
  // currStoneData.w was fliped in BufferA
  bool isBlack = (currStoneData.w == BOARD_STATE_WHITE);
  
  ivec2[ARRAY_SIZE] takenStones;
  int takenStonesLen;
 
  // Check kou
  if(currBoardPos == kouBoardPos && kouTurn == (isBlack ? BOARD_STATE_BLACK :BOARD_STATE_WHITE )){
    if(intFragCoord.xy == ivec2(0, 0)){
      outPixel.z = MOUSE_NO_PRESS;
      // keep black turn
      outPixel.w = isBlack ? BOARD_STATE_BLACK : BOARD_STATE_WHITE;
    }
    if(intFragCoord.xy == currBoardPos){
      outPixel.w = BOARD_STATE_SPACE;
    }
  }
  // Check taking stones
  // 相手石に囲まれていても石が取れるなら置くことができるので、囲まれているかの確認の前に取れるかを確認する必要がある
  else if(CanTakeStones(currBoardPos, isBlack, takenStones, takenStonesLen)){
    for(int i=0; i<takenStonesLen; i++){
      if(intFragCoord.xy == takenStones[i]){
        outPixel.w = BOARD_STATE_SPACE;
      }
    }
    if(intFragCoord.xy == GetAgehamaDataPos(ibc)){
      // Count up agehama
      if(isBlack){
        outPixel.x = outPixel.x + float(takenStonesLen);
      }else{
        outPixel.y = outPixel.y + float(takenStonesLen);
      }
    }
    // Cache kou boardPos
    if(intFragCoord.xy == GetKouDataPos(ibc) && takenStonesLen == 1){
      outPixel.xy = vec2(takenStones[0].xy);
      outPixel.w = isBlack ? BOARD_STATE_WHITE : BOARD_STATE_BLACK;
    }   
  }
  // Check arounded by the other stones
  else if(IsAroundByTheOther(currBoardPos, isBlack, takenStones/*not used*/, takenStonesLen/*not used*/)){
    if(intFragCoord.xy == ivec2(0, 0)){
      outPixel.z = MOUSE_NO_PRESS;
      // keep black turn
      outPixel.w = isBlack ? BOARD_STATE_BLACK :BOARD_STATE_WHITE;
    }
    if(intFragCoord.xy == currBoardPos){
      outPixel.w = BOARD_STATE_SPACE;
    }
  }
  
  // Reset kou
  if(intFragCoord.xy == GetKouDataPos(ibc)){
    if(kouBoardPos != ivec2(0, 0) && kouTurn != (isBlack ? BOARD_STATE_BLACK :BOARD_STATE_WHITE)){
      outPixel.xy = vec2(0.0, 0.0);
      outPixel.w = BOARD_STATE_SPACE;
    }
  }
  
  fragColor = outPixel;
}