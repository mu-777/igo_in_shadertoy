void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  ivec2 intFragCoord = ivec2(fragCoord.xy);
  vec4 outPixel = FetchBoardData(intFragCoord);

  IgoBoardConf ibc = CommonIgoConf(iResolution.xy);

  if(intFragCoord.x > int(ibc.boardNum)+1
     || intFragCoord.y > int(ibc.boardNum)+1){
    return;
  }
  
  fragColor = outPixel;
}