#include "./common.glsl"

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec3 backgroundColor = vec3(1.0);
  vec3 outPixel = backgroundColor;

  // Conf values
  IgoBoardConf ibc;
  ibc.boardNum = 19.0; // 9.0 or 13.0 or 19.0
  ibc.boardColor = vec3(0.82, 0.64, 0.27);
  ibc.boardLineColor = vec3(0.1);
  ibc.boardLineWidth = 1.; // px
  ibc.boardSizePx = min(iResolution.x, iResolution.y) * 0.9;

  // const values
  ibc.boardStarPos = ibc.boardNum == 19.0 ? 6.0
                     : ibc.boardNum == 13.0 ? 3.0
                     : ibc.boardNum == 9.0 ? 2.0 : 0.0;
  ibc.boardCoordToPx = ibc.boardSizePx/ibc.boardNum;
  ibc.boardStarRadiusPx = ibc.boardCoordToPx * 0.15;
  ibc.stoneRadiusPx = ibc.boardCoordToPx * 0.45;

  // [0, iResolution.xy] -> [-0.5*iResolution.xy, 0.5*iResolution.xy]
  vec4 centerPxCoord = vec4(fragCoord.x - 0.5*iResolution.x, 
                            0.5*iResolution.y - fragCoord.y,
                            iMouse.x - 0.5*iResolution.x, 
                            0.5*iResolution.y - iMouse.y);
  // [-0.5*iResolution.xy, 0.5*iResolution.xy] -> [0, 19.0]
  // boardCoord.xy is pixel, boardCoord.zw is mouse.xy
  vec4 boardCoord = (centerPxCoord + vec4(ibc.boardSizePx*0.5)) / ibc.boardCoordToPx;
  bool isMousePressing = iMouse.z > 0.0;
  bool isMouseDown = iMouse.w > 0.0;
  
  bool isBlackTurn = true;
  outPixel = DrawBoard(boardCoord.xy, ibc, outPixel);

  if(isMousePressing){
    outPixel = DrawCandidateStone(boardCoord.xy, boardCoord.zw, ibc, isBlackTurn, outPixel);
  } else {
    outPixel = DrawCandidateStone(boardCoord.xy, boardCoord.zw, ibc, false, outPixel);
    UpdateBoard();
  }
  fragColor = vec4(outPixel, 1.0);
}