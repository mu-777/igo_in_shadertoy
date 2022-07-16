void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec4 outPixel = FetchBoardData(ivec2(fragCoord.xy));

  IgoBoardConf ibc = CommonIgoConf(iResolution.xy);

  if(!IsInBoard(fragCoord, ibc, 1.0)){
    return;
  }

  vec2 mouseInBoardCoord = FragCoordToBoardCoord(iMouse.xy, iResolution.xy, ibc);
  vec4 currStoneData = FetchBoardData(ivec2(0,0));
  bool isMousePressing = (iMouse.z > 0.0);
  
  float prevMouse = currStoneData.z;
  bool isFirstFrame = (prevMouse == 0.0);
  float currMouse = isFirstFrame ? MOUSE_NO_PRESS 
                    : (prevMouse == MOUSE_NO_PRESS) && !isMousePressing ? MOUSE_NO_PRESS
                    : (prevMouse == MOUSE_NO_PRESS) && isMousePressing ? MOUSE_DOWN
                    : (prevMouse == MOUSE_DOWN || prevMouse == MOUSE_PRESSING) && isMousePressing ? MOUSE_PRESSING
                    : (prevMouse == MOUSE_DOWN || prevMouse == MOUSE_PRESSING) && !isMousePressing ? MOUSE_UP
                    : (prevMouse == MOUSE_UP) ? MOUSE_NO_PRESS
                    : prevMouse;


  // Store mouse state in [0, 0]
  if(ivec2(fragCoord.xy) == ivec2(0, 0)){
    if(IsInBoard(mouseInBoardCoord, ibc, 0.0)){
      outPixel.xy = mouseInBoardCoord;
    }    
    outPixel.z = currMouse;
    outPixel.w = isFirstFrame ? BOARD_STATE_BLACK 
                 : (prevMouse != MOUSE_UP) ? currStoneData.w 
                 : currStoneData.w == BOARD_STATE_BLACK ? BOARD_STATE_WHITE : BOARD_STATE_BLACK;
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
    if(currMouse == MOUSE_UP && ivec2(fragCoord.xy) == BoardCoordToBoardPos(mouseInBoardCoord)){
      outPixel.w = currStoneData.w;
    }
  }
  fragColor = outPixel;
}