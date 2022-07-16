void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec4 outPixel = FetchBoardData(ivec2(fragCoord.xy));

  IgoBoardConf ibc = CommonIgoConf(iResolution.xy);

  if(!IsInBoard(fragCoord, ibc, 1.0)){
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
  bool isPlaceable = (isFirstFrame || (FetchBoardData(mouseBoardPos).w == BOARD_STATE_SPACE));
  bool isUpdate = (currMouseState == MOUSE_UP && isPlaceable);
  
  if(isFirstFrame){
    if(int(fragCoord.x) == 0 || int(fragCoord.x) == int(ibc.boardNum)+1
           || int(fragCoord.y) == 0 || int(fragCoord.y) == int(ibc.boardNum)+1){
      outPixel.w = BOARD_STATE_OUT;
    }
    else{
      outPixel.w = BOARD_STATE_SPACE;
    }
  }

  // Store mouse state in [0, 0]
  if(ivec2(fragCoord.xy) == ivec2(0, 0)){
    if(IsInBoard(mouseInBoardCoord, ibc, 0.0)){
      outPixel.xy = mouseInBoardCoord;
    }    
    outPixel.z = currMouseState;
    outPixel.w = isFirstFrame ? BOARD_STATE_BLACK 
                 : !isUpdate ? prevStoneData.w
                 : prevStoneData.w == BOARD_STATE_BLACK ? BOARD_STATE_WHITE : BOARD_STATE_BLACK;
  }
  // Store outline
  else if(int(fragCoord.x) == 0
           || int(fragCoord.y) == 0
           || int(fragCoord.x) == int(ibc.boardNum)+1
           || int(fragCoord.y) == int(ibc.boardNum)+1){
    outPixel.w = BOARD_STATE_OUT;
  }
  // Store board state
  else{
    if(isUpdate && ivec2(fragCoord.xy) == mouseBoardPos){
      outPixel.w = prevStoneData.w;
    }
  }
  fragColor = outPixel;
}