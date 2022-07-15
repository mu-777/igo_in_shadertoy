void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec3 backgroundColor = vec3(1.0);
  vec3 outPixel = backgroundColor;
  // outPixel = texelFetch(iChannel0, 
  //                       ivec2(0, 0), 
  //                       0).xyz;
  outPixel = FetchBoardData(ivec2(0,0)).xyz;

  // Conf values
  IgoBoardConf ibc = CommonIgoConf(iResolution.xy);

  // boardCoord.xy is pixel, boardCoord.zw is mouse.xy
  vec2 boardCoord = FragCoordToBoardCoord(fragCoord.xy, iResolution.xy, ibc);
  vec4 currStoneData = FetchBoardData(ivec2(0,0));
  bool isMousePressing = (currStoneData.z == MOUSE_PRESSING);
  bool isBlackTurn = (currStoneData.w == BOARD_STATE_BLACK);

  outPixel = vec3(currStoneData.z == MOUSE_NO_PRESS,
                  currStoneData.z == MOUSE_PRESSING,
                  0.0);

  outPixel = DrawBoard(boardCoord.xy, ibc, outPixel);
  // if(isMousePressing){
  //   outPixel = DrawCandidateStone(boardCoord.xy, ivec2(currStoneData.xy), ibc, 
  //                                 isBlackTurn, outPixel);
  // }

  // if(length(boardCoord.xy - boardCoord.zw)*ibc.boardCoordToPx < ibc.stoneRadiusPx ){
  //   outPixel = mix(outPixel, vec3(isBlackTurn ? 1.0 : 0.0), 0.6);
  // }
  
  
  vec2 mouseInBoardCoord = vec2(TexValToBoardBufCoord(currStoneData.xy)) - vec2(0.5);
  if(length(boardCoord.xy - mouseInBoardCoord.xy)*ibc.boardCoordToPx < ibc.stoneRadiusPx ){
    outPixel = mix(outPixel, vec3(isBlackTurn ? 1.0 : 0.0), 0.6);
  }


  fragColor = vec4(outPixel, 1.0);
}