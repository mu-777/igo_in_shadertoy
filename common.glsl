#iChannel0 "file://./boardBuffer.frag"

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

bool isPixelInStoneArea(vec2 targetPosInBoardCoord, vec2 boardCoord, IgoBoardConf ibc){
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

vec3 DrawCandidateStone(vec2 boardCoord, ivec2 boardPos, IgoBoardConf ibc, 
                        bool isBlackTurn, vec3 defaultColor){
  if(boardPos.x < 1 
      || boardPos.x > int(ibc.boardNum)
      || boardPos.y < 1
      || boardPos.y > int(ibc.boardNum)){
    return defaultColor;
  }
  if(isPixelInStoneArea(vec2(boardPos) - vec2(0.5), boardCoord, ibc)){
    return mix(defaultColor, vec3(isBlackTurn ? 0.0 : 1.0), 0.6);
  }  
  return defaultColor;
}

void UpdateBoard(){

}

vec4 FetchBoardBuffer(vec2 fragCoord){
  return texelFetch(iChannel0, ivec2(fragCoord.xy), 0);
}

// [1, 一] ~ [19, 十九]
ivec2 BoardCoordToBoardPos(vec2 posInBoardCoord){
  return ivec2(int(floor(posInBoardCoord.x + 1.0)),
               int(floor(posInBoardCoord.y + 1.0)));
}

// 0~19 to 0.0~1.0
const float BoardCoordNormalizeScale = 0.05;
vec2 BoardCoordToTexVal(vec2 posInBoardCoord){
  ivec2 boardPos = BoardCoordToBoardPos(posInBoardCoord);
  return vec2(BoardCoordNormalizeScale*float(boardPos.x), 
              BoardCoordNormalizeScale*float(boardPos.y));
}

ivec2 TexValToBoardBufCoord(vec2 texVal){
  return ivec2(floor(texVal.x/BoardCoordNormalizeScale), 
               floor(texVal.y/BoardCoordNormalizeScale));
}


// [1, 一] ~ [19, 十九]
vec4 GetBoardData(ivec2 boardPos){
  return texelFetch(iChannel0, boardPos, 0);
}

vec4 GetCurrentStoneData(){
  vec4 ret = texelFetch(iChannel0, ivec2(0,0), 0);
  // ret.xy = vec2(TexValToBoardBufCoord(ret.xy));
  return ret;
}