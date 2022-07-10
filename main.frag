#include "./common.glsl"
#iChannel0 "file://./boardBuffer.frag"

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec3 backgroundColor = vec3(1.0);
  vec3 outPixel = texelFetch(iChannel0, 
                             ivec2(floor(fragCoord.x), floor(fragCoord.y)), 
                             0).xyz;
  // vec3 outPixel = backgroundColor;

  // Conf values
  IgoBoardConf ibc = CommonIgoConf(iResolution.xy);

  // [0, iResolution.xy] -> [-0.5*iResolution.xy, 0.5*iResolution.xy]
  vec4 centerPxCoord = vec4(fragCoord.x - 0.5*iResolution.x, 
                            0.5*iResolution.y - fragCoord.y,
                            iMouse.x - 0.5*iResolution.x, 
                            0.5*iResolution.y - iMouse.y);
  // [-0.5*iResolution.xy, 0.5*iResolution.xy] -> [0, 19.0]
  // boardCoord.xy is pixel, boardCoord.zw is mouse.xy
  vec4 boardCoord = BoardCoord(fragCoord, iResolution.xy, iMouse.xy, ibc);
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