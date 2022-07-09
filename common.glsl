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
