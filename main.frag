
vec3 drawBoard(vec2 centerNormalized){
  vec3 boardColor = vec3(0.82, 0.64, 0.27);
  vec3 lineColor = vec3(0.1);
  float tickWidth = 0.05263; //1.0/19.0
  float lineWidth = 0.005;

  vec3 retCol = boardColor;
  if( mod(centerNormalized.x, tickWidth) < lineWidth ) {
    retCol = lineColor;
  }
  if( mod(centerNormalized.y, tickWidth) < lineWidth ) {
    retCol = lineColor;
  }
  if( mod(centerNormalized.x, tickWidth) < lineWidth*0.2 ) {
    retCol = vec3(1.0,0.0,0.0);
  }
  if( mod(centerNormalized.y, tickWidth) < lineWidth*0.2 ) {
    retCol = vec3(1.0,0.0,0.0);
  }

  return retCol;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  // [0, iResolution.xy] -> [0.0, 1.0]
  vec2 normalizedCoord = fragCoord.xy / iResolution.xy;

  // [0, iResolution.xy] -> [-0.5*iResolution.xy, 0.5*iResolution.xy]
  vec2 r = vec2( fragCoord.xy - 0.5*iResolution.xy );
  // [-0.5*iResolution.x, 0.5*iResolution.x] -> [-1.0, 1.0]
  r = 2.0 * r.xy / iResolution.xy;
  
  vec3 backgroundColor = vec3(1.0);
  // vec3 axesColor = vec3(0.0, 0.0, 1.0);
  // vec3 gridColor = vec3(0.5);

  vec3 pixel = backgroundColor;
  // pixel = drawBoard(normalizedCoord);
 
  vec3 boardColor = vec3(0.82, 0.64, 0.27);
  vec3 lineColor = vec3(0.1);
  float lineWidth = 0.5; // half px

  vec2 centerPxCoord = fragCoord.xy - 0.5*iResolution.xy;
  float boardSizePx = iResolution.x > iResolution.y ? iResolution.y * 0.9 : iResolution.x * 0.9;
  if(abs(centerPxCoord.x)<boardSizePx*0.5 && abs(centerPxCoord.y)<boardSizePx*0.5){
    pixel = boardColor;
  }

  float outSquareSizePx = boardSizePx*0.9;
  float oneSquareSizePx = outSquareSizePx * 0.5 / 9.0;
  if((mod(abs(centerPxCoord.x) + lineWidth, oneSquareSizePx) < lineWidth*2.0
        || mod(abs(centerPxCoord.y) + lineWidth, oneSquareSizePx) < lineWidth*2.0)
      && abs(centerPxCoord.x) < outSquareSizePx*0.5 + lineWidth
      && abs(centerPxCoord.y) < outSquareSizePx*0.5 + lineWidth){
    pixel = lineColor;
  }




  // // Draw the grid lines
  // // This time instead of going over a loop for every pixel
  //   // we'll use mod operation to achieve the same result
  //   // with a single calculation (thanks to mikatalk)
  // const float tickWidth = 0.1;
  // if( mod(r.x, tickWidth) < 0.008 ) pixel = gridColor;
  //   if( mod(r.y, tickWidth) < 0.008 ) pixel = gridColor;
  //   // Draw the axes
  // if( abs(r.x)<0.006 ) pixel = axesColor;
  // if( abs(r.y)<0.007 ) pixel = axesColor;
  
  fragColor = vec4(pixel, 1.0);
}