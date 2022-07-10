void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  float speed = 0.4;
  fragColor = vec4(abs(sin(iTime * speed)),
                   abs(sin(iTime * speed * 2.0)),
                   abs(sin(iTime * speed * 3.0)),
                   1.0);
}