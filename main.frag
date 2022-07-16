void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec3 backgroundColor = vec3(1.0);
  vec3 outPixel = backgroundColor;

  // Conf values
  IgoBoardConf ibc = CommonIgoConf(iResolution.xy);

  // boardCoord.xy is pixel, boardCoord.zw is mouse.xy
  vec2 boardCoord = FragCoordToBoardCoord(fragCoord.xy, iResolution.xy, ibc);
  vec4 currStoneData = FetchBoardData(ivec2(0,0));

  ivec2 mouseBoardPos = BoardCoordToBoardPos(currStoneData.xy);
  float mouseState = currStoneData.z;
  bool isBlackTurn = (currStoneData.w == BOARD_STATE_BLACK);

  outPixel = vec3(currStoneData.w == BOARD_STATE_BLACK,
                  currStoneData.w == BOARD_STATE_WHITE,
                  0.0);

  outPixel = DrawBoard(boardCoord.xy, ibc, outPixel);
  
  // Draw candidate stone
  if(mouseState == MOUSE_PRESSING){
    outPixel = DrawStone(boardCoord.xy, mouseBoardPos.xy, ibc, 
                         isBlackTurn, outPixel, 0.6);
  }

  // Draw current stone
  if(IsInBoard(boardCoord, ibc, 2.0)){
    ivec2 boardPos = BoardCoordToBoardPos(boardCoord);
    float boardState = FetchBoardData(boardPos).w;
    if(boardState == BOARD_STATE_BLACK || boardState == BOARD_STATE_WHITE){
      outPixel = DrawStone(boardCoord.xy, boardPos.xy, ibc, 
                           boardState == BOARD_STATE_BLACK, outPixel, 0.0);
    }
    
    if(boardState == BOARD_STATE_OUT){
      outPixel = DrawStone(boardCoord.xy, boardPos.xy, ibc, 
                           true, outPixel, 0.5);
    }
    if(boardState == BOARD_STATE_SPACE){
      outPixel = DrawStone(boardCoord.xy, boardPos.xy, ibc, 
                           false, outPixel, 0.5);
    }
  }
  fragColor = vec4(outPixel, 1.0);
}