void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec3 backgroundColor = vec3(sin(iTime*0.013 + fragCoord.x/iResolution.x),
                              sin(iTime*0.029 + fragCoord.y/iResolution.y),
                              cos(iTime*0.7));
  vec3 outPixel = backgroundColor;

  // Conf values
  IgoBoardConf ibc = CommonIgoConf(iResolution.xy);

  // boardCoord.xy is pixel, boardCoord.zw is mouse.xy
  vec2 boardCoord = FragCoordToBoardCoord(fragCoord.xy, iResolution.xy, ibc);
  ivec2 boardPos = BoardCoordToBoardPos(boardCoord);
  vec4 currStoneData = FetchBoardData(ivec2(0,0));

  ivec2 mouseBoardPos = BoardCoordToBoardPos(currStoneData.xy);
  float mouseState = currStoneData.z;
  bool isBlackTurn = (currStoneData.w == BOARD_STATE_BLACK);

//  outPixel = vec3(currStoneData.w == BOARD_STATE_BLACK,
//                  currStoneData.w == BOARD_STATE_WHITE,
//                  0.0);

  outPixel = DrawBoard(boardCoord.xy, ibc, outPixel);
  
  // Draw candidate stone
  if(mouseState == MOUSE_PRESSING){
    outPixel = DrawStone(boardCoord.xy, mouseBoardPos.xy, ibc, 
                         isBlackTurn, outPixel, 0.6);
  }

  // Draw current stone
  if(IsInBoard(boardCoord, ibc, 0.0)){    
    float boardState = FetchBoardData(boardPos).w;
    if(boardState == BOARD_STATE_BLACK || boardState == BOARD_STATE_WHITE){
      outPixel = DrawStone(boardCoord.xy, boardPos.xy, ibc, 
                           boardState == BOARD_STATE_BLACK, outPixel, 0.0);
    }
    
//    if(boardState == BOARD_STATE_OUT){
//      outPixel = DrawStone(boardCoord.xy, boardPos.xy, ibc, 
//                           true, outPixel, 0.5);
//    }
//    if(boardState == BOARD_STATE_SPACE){
//      outPixel = DrawStone(boardCoord.xy, boardPos.xy, ibc, 
//                           false, outPixel, 0.5);
//    }
  }
  
  vec4 agehamaCache = FetchBoardData(GetAgehamaDataPos(ibc));
  ivec2 luScrBoadPos = BoardCoordToBoardPos(ibc.screenRectInBoardCoord.xy);
  ivec2 rbScrBoadPos = BoardCoordToBoardPos(ibc.screenRectInBoardCoord.zw);
  if(boardPos.x >= 21 && boardPos.x <= rbScrBoadPos.x 
     && (rbScrBoadPos.x-21+1)*(rbScrBoadPos.y-boardPos.y) + (rbScrBoadPos.x-boardPos.x) < int(agehamaCache.x)){
    outPixel = DrawStone(boardCoord.xy, boardPos, ibc, false, outPixel, 0.0);
  }
  if(boardPos.x <= -1 && boardPos.x >= luScrBoadPos.x 
     && (-1-luScrBoadPos.x+1)*(boardPos.y-luScrBoadPos.y) + (boardPos.x - luScrBoadPos.x) < int(agehamaCache.y)){
    outPixel = DrawStone(boardCoord.xy, boardPos, ibc, true, outPixel, 0.0);
  }
//  outPixel = DrawStone(boardCoord.xy, luScrBoadPos, ibc, 
//                       true, outPixel, 0.0);
//  outPixel = DrawStone(boardCoord.xy, rbScrBoadPos, ibc, 
//                       false, outPixel, 0.0);
  fragColor = vec4(outPixel, 1.0);

}