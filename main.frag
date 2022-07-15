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

  outPixel = vec3(mouseState == MOUSE_NO_PRESS,
                  mouseState == MOUSE_PRESSING,
                  0.0);

  outPixel = DrawBoard(boardCoord.xy, ibc, outPixel);
  if(mouseState == MOUSE_PRESSING){
    outPixel = DrawCandidateStone(boardCoord.xy, mouseBoardPos.xy, ibc, 
                                  isBlackTurn, outPixel);
  }

  // if(length(boardCoord.xy - boardCoord.zw)*ibc.boardCoordToPx < ibc.stoneRadiusPx ){
  //   outPixel = mix(outPixel, vec3(isBlackTurn ? 1.0 : 0.0), 0.sssss);
  // }
  
  
//  if(length(boardCoord.xy - mouseInBoardCoord.xy)*ibc.boardCoordToPx < ibc.stoneRadiusPx ){
//    outPixel = mix(outPixel, vec3(isBlackTurn ? 1.0 : 0.0), 0.6);
//  }


  fragColor = vec4(outPixel, 1.0);
}