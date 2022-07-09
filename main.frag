void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  
  vec3 backgroundColor = vec3(1.0);
  vec3 outPixel = backgroundColor;

  // Conf values
  float boardNum = 19.0; // 9.0 or 13.0 or 19.0
  vec3 boardColor = vec3(0.82, 0.64, 0.27);
  vec3 boardLineColor = vec3(0.1);
  float boardLineWidth = 1.; // px
  float boardSizePx = min(iResolution.x, iResolution.y) * 0.9;
  float boardStarRadiusPx = 3.0;

  // const values
  float boardStarPos = boardNum == 19.0 ? 6.0
                       : boardNum == 13.0 ? 3.0
                       : boardNum == 9.0 ? 2.0 : 0.0;
  float boardCoordToPx = boardSizePx/boardNum;

  // [0, iResolution.xy] -> [-0.5*iResolution.xy, 0.5*iResolution.xy]
  vec2 centerPxCoord = vec2(fragCoord.x - 0.5*iResolution.x, 0.5*iResolution.y - fragCoord.y);
  // [-0.5*iResolution.xy, 0.5*iResolution.xy] -> [0, 19.0]
  vec2 boardCoord = (centerPxCoord + vec2(boardSizePx*0.5)) / boardCoordToPx;

  // Draw board  
  if(boardCoord.x > 0.0 && boardCoord.x < boardNum 
      && boardCoord.y > 0.0 && boardCoord.y < boardNum){
    outPixel = boardColor;

    // Draw star
    vec2 boardCenteredCoord = boardCoord - vec2(boardNum*0.5);
    if(length(boardCenteredCoord)*boardCoordToPx < boardStarRadiusPx
      || length(abs(boardCenteredCoord) - vec2(boardStarPos))*boardCoordToPx < boardStarRadiusPx){
      outPixel = boardLineColor;
    }
    if(boardNum==19.0
      && (length(abs(boardCenteredCoord) - vec2(boardStarPos, 0.0))*boardCoordToPx < boardStarRadiusPx
          || length(abs(boardCenteredCoord) - vec2(0.0, boardStarPos))*boardCoordToPx < boardStarRadiusPx)){
      outPixel = boardLineColor;
    }
  }
  // Draw line
  if(boardCoord.x > 0.0 && boardCoord.x < boardNum
      && boardCoord.y >= 0.5 && boardCoord.y <= boardNum-0.5){
    if(abs(fract(boardCoord.x)-0.5)*2.0*boardCoordToPx < boardLineWidth){
      outPixel = boardLineColor;
    }
  }
  if(boardCoord.x >= 0.5 && boardCoord.x <= boardNum-0.5 
      && boardCoord.y > 0.0 && boardCoord.y < boardNum){
    if(abs(fract(boardCoord.y)-0.5)*2.0*boardCoordToPx < boardLineWidth){
      outPixel = boardLineColor;
    }
  }
  
 
  fragColor = vec4(outPixel, 1.0);
}