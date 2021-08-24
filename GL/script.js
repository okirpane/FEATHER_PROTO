console.log("Script Loaded");
import GlslCanvas from "./GlslCanvas.js";
var canvas = document.getElementById("feather_canvas");
var sandbox = new GlslCanvas(canvas);
sandbox.setUniform("u_tex0", "../assets/feather.jpg");
let fs = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;

  uniform sampler2D u_tex0;
  uniform vec2 u_tex0Resolution;
  float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
  }

    float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      // Four corners in 2D of a tile
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x) +
              (c - a)* u.y * (1.0 - u.x) +
              (d - b) * u.x * u.y;
  }  

  #define OCTAVES 6
  float fbm (in vec2 st) {
      // Initial values
      float value = 0.0;
      float amplitude = .5;
      float frequency = 0.;
      //
      // Loop of octaves
      for (int i = 0; i < OCTAVES; i++) {
          value += amplitude * noise(st);
          st *= 2.;
          amplitude *= .5;
      }
      return value;
  }

  void main(){
    vec2 st = gl_FragCoord.xy/u_tex0Resolution.xy;
    float edge = 0.8;
    float edge2 = st.y * 1.7;
    float s = smoothstep(u_mouse.y / st.y, 1.0, edge2);
    vec2 surface = s * vec2( 
        mix(-0.3, 0.3, fbm(st + u_time * 0.0075)), 
        mix(-0.3, 0.3, fbm(st + u_time * 0.0075))
    );
    st *= 1.7;
    st += refract(vec2(0.0, 0.0), surface, 1.0 / 1.33);
    vec4 color = vec4(st.x,st.y,0.0,0.0);
    color = texture2D(u_tex0,st);
    gl_FragColor = color;
  }
  `;
sandbox.load(fs);
