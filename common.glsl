#define FetchBoardData(addr) texelFetch(iChannel0, addr, 0)

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

const float BOARD_STATE_SPACE = 0.1, 
            BOARD_STATE_BLACK = 0.2,
            BOARD_STATE_WHITE = 0.3,
            BOARD_STATE_OUT = 0.9;

const float MOUSE_DOWN = 0.1, 
            MOUSE_PRESSING = 0.2,
            MOUSE_UP = 0.3,
            MOUSE_NO_PRESS = 0.9;

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
  float offset = 0.2;
  if(boardCoord.x > 0.0-offset && boardCoord.x < ibc.boardNum+offset 
      && boardCoord.y > 0.0-offset && boardCoord.y < ibc.boardNum+offset){
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

bool IsInBoard(vec2 posInBoardCoord, IgoBoardConf ibc){
  return (posInBoardCoord.x >= 0.0 && posInBoardCoord.x < ibc.boardNum 
          && posInBoardCoord.y >= 0.0 && posInBoardCoord.y < ibc.boardNum);
}

vec2 FragCoordToBoardCoord(vec2 fragCoord, vec2 resolution, IgoBoardConf ibc){
  // [0, iResolution.xy] -> [-0.5*iResolution.xy, 0.5*iResolution.xy]
  vec2 centerPxCoord = vec2(fragCoord.x - 0.5*resolution.x, 
                            0.5*resolution.y - fragCoord.y);
  // [-0.5*iResolution.xy, 0.5*iResolution.xy] -> [0, 19.0]
  // boardCoord.xy is pixel, boardCoord.zw is mouse.xy
  return (centerPxCoord + vec2(ibc.boardSizePx*0.5)) / ibc.boardCoordToPx;
}

vec3 DrawCandidateStone(vec2 boardCoord, vec2 mouseInBoardCoord, IgoBoardConf ibc, 
                        bool isBlackTurn, vec3 defaultColor){
  vec3 ret = defaultColor;
  if(length(boardCoord.xy - mouseInBoardCoord.xy)*ibc.boardCoordToPx < ibc.stoneRadiusPx ){
    ret = mix(defaultColor, vec3(isBlackTurn ? 1.0 : 0.0), 0.6);
  }
  return ret;
}

void UpdateBoard(){

}

// (0.0, 0.0)~(19.0, 19.0) to [1, 一]~[19, 十九]
ivec2 BoardCoordToBoardPos(vec2 posInBoardCoord){
  return ivec2(int(floor(posInBoardCoord.x)) + 1,
               int(floor(posInBoardCoord.y)) + 1);
}
// [1, 一]~[19, 十九] to (0.0, 0.0)~(19.0, 19.0)
vec2 BoardCoordToBoardPos(ivec2 boardPos){
  return vec2(boardPos) - vec2(0.5);
}

const float BoardCoordNormalizeScale = 0.05;

// 0~19 to 0.0~1.0
vec2 BoardCoordToTexVal(vec2 posInBoardCoord){
  ivec2 boardPos = BoardCoordToBoardPos(posInBoardCoord);
  return vec2(BoardCoordNormalizeScale*float(boardPos.x), 
              BoardCoordNormalizeScale*float(boardPos.y));
}

// 0.0~1.0 to [1, 一]~[19, 十九]
ivec2 TexValToBoardPos(vec2 texVal){
  return ivec2(floor(texVal.x/BoardCoordNormalizeScale), 
               floor(texVal.y/BoardCoordNormalizeScale));
}


