precision highp float;
struct IgoBoardConf {
  float boardNum;
  vec3 boardColor;
  vec3 boardLineColor;
  float boardLineWidth;
  float boardSizePx;
  float boardStarRadiusPx;
  float boardStarPos;
  float boardCoordToPx;
  float stoneRadiusPx;
};

IgoBoardConf CommonIgoConf(vec2 resolution){
  IgoBoardConf ibc;
  ibc.boardNum = 19.0; // 9.0 or 13.0 or 19.0
  ibc.boardColor = vec3(0.82, 0.64, 0.27);
  ibc.boardLineColor = vec3(0.1);
  ibc.boardLineWidth = 1.; // px
  ibc.boardSizePx = min(resolution.x, resolution.y) * 0.9;

  // const values
  ibc.boardStarPos = ibc.boardNum == 19.0 ? 6.0
                     : ibc.boardNum == 13.0 ? 3.0
                     : ibc.boardNum == 9.0 ? 2.0 : 0.0;
  ibc.boardCoordToPx = ibc.boardSizePx/ibc.boardNum;
  ibc.boardStarRadiusPx = ibc.boardCoordToPx * 0.15;
  ibc.stoneRadiusPx = ibc.boardCoordToPx * 0.45;
  return ibc;
}

vec3 DrawBoard(vec2 boardCoord, IgoBoardConf ibc, vec3 defaultColor){
  vec3 ret = defaultColor;
  // Draw boardbase
  if(boardCoord.x > 0.0 && boardCoord.x < ibc.boardNum 
      && boardCoord.y > 0.0 && boardCoord.y < ibc.boardNum){
    ret = ibc.boardColor;

    // Draw star
    vec2 boardCenteredCoord = boardCoord - vec2(ibc.boardNum*0.5);
    if(length(boardCenteredCoord)*ibc.boardCoordToPx < ibc.boardStarRadiusPx
      || length(abs(boardCenteredCoord) - vec2(ibc.boardStarPos))*ibc.boardCoordToPx < ibc.boardStarRadiusPx){
      ret = ibc.boardLineColor;
    }
    if(ibc.boardNum==19.0
      && (length(abs(boardCenteredCoord) - vec2(ibc.boardStarPos, 0.0))*ibc.boardCoordToPx < ibc.boardStarRadiusPx
          || length(abs(boardCenteredCoord) - vec2(0.0, ibc.boardStarPos))*ibc.boardCoordToPx < ibc.boardStarRadiusPx)){
      ret = ibc.boardLineColor;
    }
  }
  // Draw line
  if(boardCoord.x > 0.0 && boardCoord.x < ibc.boardNum
      && boardCoord.y >= 0.5 && boardCoord.y <= ibc.boardNum-0.5){
    if(abs(fract(boardCoord.x)-0.5)*2.0*ibc.boardCoordToPx < ibc.boardLineWidth){
      ret = ibc.boardLineColor;
    }
  }
  if(boardCoord.x >= 0.5 && boardCoord.x <= ibc.boardNum-0.5 
      && boardCoord.y > 0.0 && boardCoord.y < ibc.boardNum){
    if(abs(fract(boardCoord.y)-0.5)*2.0*ibc.boardCoordToPx < ibc.boardLineWidth){
      ret = ibc.boardLineColor;
    }
  }
  return ret;
}

bool isStonePixel(vec2 targetPosInBoardCoord, vec2 boardCoord, IgoBoardConf ibc){
  return length(boardCoord - (floor(targetPosInBoardCoord) + vec2(0.5)))*ibc.boardCoordToPx < ibc.stoneRadiusPx;
}

vec4 BoardCoord(vec2 fragCoord, vec2 resolution, vec2 mousePosInFragCoord, IgoBoardConf ibc){
  // [0, iResolution.xy] -> [-0.5*iResolution.xy, 0.5*iResolution.xy]
  vec4 centerPxCoord = vec4(fragCoord.x - 0.5*resolution.x, 
                            0.5*resolution.y - fragCoord.y,
                            mousePosInFragCoord.x - 0.5*resolution.x, 
                            0.5*resolution.y - mousePosInFragCoord.y);
  // [-0.5*iResolution.xy, 0.5*iResolution.xy] -> [0, 19.0]
  // boardCoord.xy is pixel, boardCoord.zw is mouse.xy
  return (centerPxCoord + vec4(ibc.boardSizePx*0.5)) / ibc.boardCoordToPx;
}


vec3 DrawCandidateStone(vec2 boardCoord, vec2 mousePosInBoardCoord, IgoBoardConf ibc, 
                        bool isBlackTurn, vec3 defaultColor){
  if(mousePosInBoardCoord.x < 0.0
      || mousePosInBoardCoord.y < 0.0
      || mousePosInBoardCoord.x > ibc.boardNum
      || mousePosInBoardCoord.y > ibc.boardNum){
    return defaultColor;
  }
  if(isStonePixel(mousePosInBoardCoord, boardCoord, ibc)){
    return mix(defaultColor, vec3(isBlackTurn ? 0.0 : 1.0), 0.6);
  }
  return defaultColor;
}

void UpdateBoard(){

}
