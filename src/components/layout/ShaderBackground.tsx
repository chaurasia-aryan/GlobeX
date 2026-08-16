import React, { useEffect, useRef } from 'react';

const ShaderBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) {
      console.warn("WebGL not supported");
      return;
    }

    function syncSize() {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        if (gl) gl.viewport(0, 0, w, h);
      }
    }

    window.addEventListener('resize', syncSize);
    syncSize();

    const vertexSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      // Simplex 2D noise
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
        vec2 pos = uv * aspect;
        
        // Add mouse interaction
        vec2 mousePos = u_mouse / u_resolution.xy * aspect;
        float distToMouse = distance(pos, mousePos);
        float mouseInfluence = smoothstep(0.5, 0.0, distToMouse) * 0.5;
        
        // Animated base coordinates
        vec2 tPos1 = pos * 1.5 + vec2(u_time * 0.05, u_time * 0.03) + mouseInfluence;
        vec2 tPos2 = pos * 2.5 - vec2(u_time * 0.04, u_time * 0.06) - mouseInfluence * 0.5;
        
        float n1 = snoise(tPos1);
        float n2 = snoise(tPos2);
        
        float pattern = (n1 + n2 * 0.5) * 0.5 + 0.5;
        pattern = smoothstep(0.2, 0.8, pattern);
        
        // Refined deep obsidian-midnight tech colors
        vec3 colorDark = vec3(0.018, 0.025, 0.038);    // Deep obsidian black-navy
        vec3 colorMid = vec3(0.042, 0.060, 0.092);     // Subtle midnight tech blue
        vec3 colorHighlight = vec3(0.0, 0.42, 0.62);   // Luminous restrained cyan highlight
        
        vec3 finalColor = mix(colorDark, colorMid, pattern);
        
        // Add ultra-subtle scanlines for tactile depth
        float scanline = sin(uv.y * u_resolution.y * 3.14159) * 0.012;
        finalColor += scanline;
        
        // Add subtle ambient luminosity near mouse
        finalColor += colorHighlight * mouseInfluence * 0.15;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function compileShader(src: string, type: number) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = compileShader(vertexSource, gl.VERTEX_SHADER);
    const fs = compileShader(fragmentSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const quad = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1, -1,
       1,  1,
      -1,  1
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    let animationFrameId: number;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      // Invert Y axis for WebGL
      mouseY = window.innerHeight - e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const start = performance.now();
    function render(time: number) {
      if (!gl) return;
      gl.viewport(0, 0, canvas!.width, canvas!.height);
      gl.uniform2f(uRes, canvas!.width, canvas!.height);
      gl.uniform1f(uTime, (time - start) * 0.001);
      gl.uniform2f(uMouse, mouseX, mouseY);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    }
    
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', syncSize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default ShaderBackground;
