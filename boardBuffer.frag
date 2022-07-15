void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec4 outPixel = FetchBoardData(ivec2(fragCoord.xy));

  float speed = 2.0;
  if(int(fragCoord.x) == 0 || int(fragCoord.y) == 0 ){
  // if(ivec2(fragCoord.xy) == ivec2(0, 0)){
    outPixel = vec4(abs(sin(iTime * speed * 0.13)),
                    abs(sin(iTime * speed * 0.29)),
                    abs(sin(iTime * speed * 0.73)),
                    1.0);
  } else {
    // outPixel = vec4(0.0, 0.0, 0.0, 1.0);
  }


  IgoBoardConf ibc = CommonIgoConf(iResolution.xy);
  vec2 mousePosInBoardCoord = FragCoordToBoardCoord(iMouse.xy, iResolution.xy, ibc);
  vec4 currStoneData = FetchBoardData(ivec2(0,0));
  bool isMousePressing = (iMouse.z > 0.0);
  bool isMouseUp = ((currStoneData.z == MOUSE_PRESSING) && !isMousePressing);

  if(fragCoord.x < 0.0 || fragCoord.x > ibc.boardNum 
      || fragCoord.y < 0.0 || fragCoord.y > ibc.boardNum){
    return;
  }

  // Store mouse info in [0, 0]
  if(ivec2(fragCoord.xy) == ivec2(0, 0)){
    // outPixel.xy = iMouse.xy/iChannelResolution[0].xy;
    outPixel.xy = BoardCoordToTexVal(mousePosInBoardCoord);

    float prevMouse = currStoneData.z;
    outPixel.z = (prevMouse == MOUSE_NO_PRESS) && !isMousePressing ? MOUSE_NO_PRESS
                 : (prevMouse == MOUSE_NO_PRESS) && isMousePressing ? MOUSE_DOWN
                 : (prevMouse == MOUSE_DOWN || prevMouse == MOUSE_PRESSING) && isMousePressing ? MOUSE_PRESSING
                 : (prevMouse == MOUSE_DOWN || prevMouse == MOUSE_PRESSING) && !isMousePressing ? MOUSE_UP
                 : prevMouse;
    outPixel.w = (outPixel.z == 0.0) ? BOARD_STATE_BLACK 
                 : (outPixel.z != MOUSE_UP) ? currStoneData.w 
                 : currStoneData.w == BOARD_STATE_BLACK ? BOARD_STATE_WHITE : BOARD_STATE_BLACK;
  }
  else if(int(fragCoord.x) == 0
           || int(fragCoord.y) == 0
           || int(fragCoord.x) == int(ibc.boardNum)+1
           || int(fragCoord.y) == int(ibc.boardNum)+1){
    outPixel.w = BOARD_STATE_OUT;
  }
  else{
    // if(isMouseUp
    //    && BoardCoordToBoardPos(boardCoord.xy) == BoardCoordToBoardPos(mousePosInBoardCoord)){
    //    outPixel.w = currStoneData.w; 
    // }
  }
  fragColor = outPixel;
}