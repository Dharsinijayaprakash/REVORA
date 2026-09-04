import React, { useEffect, useRef } from 'react';

export interface FluidCursorProps {
  enabled?: boolean;
  densityDissipation?: number;
  velocityDissipation?: number;
  pressure?: number;
  curl?: number;
  splatRadius?: number;
  splatForce?: number;
  transparent?: boolean;
  className?: string;
}

// Revora Warm Pigment Palette (Normalized RGB with low intensity for soft diffusion)
const REVORA_COLORS = [
  { r: 0.28, g: 0.23, b: 0.14 }, // Soft Warm Gold (#E5C378) - Primary
  { r: 0.24, g: 0.18, b: 0.09 }, // Subtle Warm Amber (#C89A4A) - Primary
  { r: 0.20, g: 0.09, b: 0.06 }, // Muted Terracotta (#C85A3E) - Secondary
  { r: 0.10, g: 0.12, b: 0.09 }, // Muted Moss/Olive (#6F7F5F) - Tertiary
];

export const FluidCursor: React.FC<FluidCursorProps> = ({
  enabled = true,
  densityDissipation = 3.5,
  velocityDissipation = 2.0,
  pressure = 0.1,
  curl = 3.0,
  splatRadius = 0.2,
  splatForce = 6000,
  transparent = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Detect WebGL context
    const params = {
      alpha: transparent,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    };

    let gl: any = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;
    if (!gl) {
      gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
    }

    if (!gl) {
      console.warn('REVORA: WebGL not supported on this device. FluidCursor disabled gracefully.');
      return;
    }

    // Check linear float texture extensions
    let halfFloat: any;
    let supportLinearFiltering: any;

    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    const halfFloatType = isWebGL2
      ? (gl as WebGL2RenderingContext).HALF_FLOAT
      : halfFloat?.HALF_FLOAT_OES || gl.FLOAT;

    // Shader compiler helper
    function compileShader(type: number, source: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function createProgram(vertexSource: string, fragmentSource: string) {
      const program = gl!.createProgram();
      if (!program) return null;
      const vs = compileShader(gl!.VERTEX_SHADER, vertexSource);
      const fs = compileShader(gl!.FRAGMENT_SHADER, fragmentSource);
      if (!vs || !fs) return null;

      gl!.attachShader(program, vs);
      gl!.attachShader(program, fs);
      gl!.linkProgram(program);

      if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
        console.error('Program link error:', gl!.getProgramInfoLog(program));
        return null;
      }

      // Collect uniforms
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const uniformCount = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS);
      for (let i = 0; i < uniformCount; i++) {
        const uniformInfo = gl!.getActiveUniform(program, i);
        if (uniformInfo) {
          uniforms[uniformInfo.name] = gl!.getUniformLocation(program, uniformInfo.name);
        }
      }

      return { program, uniforms };
    }

    // Common full-screen quad vertex shader
    const baseVertexShader = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // Clear shader
    const clearShader = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `;

    // Splat shader: injects velocity & warm dye
    const splatShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `;

    // Advection shader: transports field with dissipation
    const advectionShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;
      void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = dissipation * texture2D(uSource, coord);
        gl_FragColor.a = 1.0;
      }
    `;

    // Divergence shader
    const divergenceShader = `
      precision mediump float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `;

    // Curl shader
    const curlShader = `
      precision mediump float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `;

    // Vorticity confinement shader
    const vorticityShader = `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
      }
    `;

    // Pressure Poisson solver (Jacobi)
    const pressureShader = `
      precision mediump float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float p = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(p, 0.0, 0.0, 1.0);
      }
    `;

    // Gradient subtraction (projection)
    const gradientSubtractShader = `
      precision mediump float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `;

    // Display shader: renders warm pigment with soft transparency
    const displayShader = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        // Soft opacity based on luminance
        float a = clamp(max(c.r, max(c.g, c.b)) * 1.6, 0.0, 0.45);
        gl_FragColor = vec4(c, a);
      }
    `;

    // Compile programs
    const clearProgram = createProgram(baseVertexShader, clearShader);
    const splatProgram = createProgram(baseVertexShader, splatShader);
    const advectionProgram = createProgram(baseVertexShader, advectionShader);
    const divergenceProgram = createProgram(baseVertexShader, divergenceShader);
    const curlProgram = createProgram(baseVertexShader, curlShader);
    const vorticityProgram = createProgram(baseVertexShader, vorticityShader);
    const pressureProgram = createProgram(baseVertexShader, pressureShader);
    const gradSubProgram = createProgram(baseVertexShader, gradientSubtractShader);
    const displayProgram = createProgram(baseVertexShader, displayShader);

    if (
      !clearProgram ||
      !splatProgram ||
      !advectionProgram ||
      !divergenceProgram ||
      !curlProgram ||
      !vorticityProgram ||
      !pressureProgram ||
      !gradSubProgram ||
      !displayProgram
    ) {
      return;
    }

    // Full screen quad buffer
    const quadVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Framebuffer helper (Double FBO for ping-pong)
    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, filtering: number) {
      gl!.activeTexture(gl!.TEXTURE0);
      const texture = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, filtering);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, filtering);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

      const fbo = gl!.createFramebuffer();
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(
        gl!.FRAMEBUFFER,
        gl!.COLOR_ATTACHMENT0,
        gl!.TEXTURE_2D,
        texture,
        0
      );
      gl!.viewport(0, 0, w, h);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      return {
        texture,
        fbo,
        width: w,
        height: h,
        attach: (id: number) => {
          gl!.activeTexture(gl!.TEXTURE0 + id);
          gl!.bindTexture(gl!.TEXTURE_2D, texture);
          return id;
        },
      };
    }

    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, filtering: number) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, filtering);
      let fbo2 = createFBO(w, h, internalFormat, format, type, filtering);

      return {
        width: w,
        height: h,
        read: () => fbo1,
        write: () => fbo2,
        swap: () => {
          const temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        },
      };
    }

    // Grid resolutions (Downscaled simulation grid for fluid 60fps performance)
    const simRes = 128;
    const dyeRes = 512;
    const filtering = supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    const rgbaFormat = isWebGL2 ? (gl as WebGL2RenderingContext).RGBA16F : gl.RGBA;

    const density = createDoubleFBO(dyeRes, dyeRes, rgbaFormat, gl.RGBA, halfFloatType, filtering);
    const velocity = createDoubleFBO(simRes, simRes, rgbaFormat, gl.RGBA, halfFloatType, filtering);
    const divergence = createFBO(simRes, simRes, rgbaFormat, gl.RGBA, halfFloatType, gl.NEAREST);
    const curlFBO = createFBO(simRes, simRes, rgbaFormat, gl.RGBA, halfFloatType, gl.NEAREST);
    const pressureFBO = createDoubleFBO(simRes, simRes, rgbaFormat, gl.RGBA, halfFloatType, gl.NEAREST);

    // Blit helper
    function blit(destinationFBO: WebGLFramebuffer | null, w: number, h: number) {
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, destinationFBO);
      gl!.viewport(0, 0, w, h);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quadVBO);
      gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0);
      gl!.enableVertexAttribArray(0);
      gl!.drawArrays(gl!.TRIANGLE_FAN, 0, 4);
    }

    // Mouse & Splat tracking
    const pointer = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      moved: false,
      colorIndex: 0,
    };

    function splat(x: number, y: number, dx: number, dy: number, color: { r: number; g: number; b: number }) {
      const radius = splatRadius * 0.003;

      // Splat velocity
      gl!.useProgram(splatProgram!.program);
      gl!.uniform1i(splatProgram!.uniforms.uTarget, velocity.read().attach(0));
      gl!.uniform1f(splatProgram!.uniforms.aspectRatio, canvas!.width / canvas!.height);
      gl!.uniform2f(splatProgram!.uniforms.point, x, y);
      gl!.uniform3f(splatProgram!.uniforms.color, dx, dy, 0.0);
      gl!.uniform1f(splatProgram!.uniforms.radius, radius);
      blit(velocity.write().fbo, simRes, simRes);
      velocity.swap();

      // Splat density (color)
      gl!.uniform1i(splatProgram!.uniforms.uTarget, density.read().attach(0));
      gl!.uniform3f(splatProgram!.uniforms.color, color.r, color.g, color.b);
      blit(density.write().fbo, dyeRes, dyeRes);
      density.swap();
    }

    // Event listeners
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;

      pointer.dx = (x - pointer.x) * splatForce;
      pointer.dy = (y - pointer.y) * splatForce;
      pointer.x = x;
      pointer.y = y;
      pointer.moved = true;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Main animation loop
    let lastTime = performance.now();
    let animId: number;

    function render(currentTime: number) {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.02);
      lastTime = currentTime;

      // Inject cursor movement splats
      if (pointer.moved && (Math.abs(pointer.dx) > 0.1 || Math.abs(pointer.dy) > 0.1)) {
        pointer.colorIndex = (pointer.colorIndex + 0.05) % REVORA_COLORS.length;
        const color = REVORA_COLORS[Math.floor(pointer.colorIndex)];
        splat(pointer.x, pointer.y, pointer.dx, pointer.dy, color);
        pointer.moved = false;
      }

      // 1. Curl
      gl!.useProgram(curlProgram!.program);
      gl!.uniform2f(curlProgram!.uniforms.texelSize, 1.0 / simRes, 1.0 / simRes);
      gl!.uniform1i(curlProgram!.uniforms.uVelocity, velocity.read().attach(0));
      blit(curlFBO.fbo, simRes, simRes);

      // 2. Vorticity Confinement
      gl!.useProgram(vorticityProgram!.program);
      gl!.uniform2f(vorticityProgram!.uniforms.texelSize, 1.0 / simRes, 1.0 / simRes);
      gl!.uniform1i(vorticityProgram!.uniforms.uVelocity, velocity.read().attach(0));
      gl!.uniform1i(vorticityProgram!.uniforms.uCurl, curlFBO.attach(1));
      gl!.uniform1f(vorticityProgram!.uniforms.curl, curl);
      gl!.uniform1f(vorticityProgram!.uniforms.dt, dt);
      blit(velocity.write().fbo, simRes, simRes);
      velocity.swap();

      // 3. Divergence
      gl!.useProgram(divergenceProgram!.program);
      gl!.uniform2f(divergenceProgram!.uniforms.texelSize, 1.0 / simRes, 1.0 / simRes);
      gl!.uniform1i(divergenceProgram!.uniforms.uVelocity, velocity.read().attach(0));
      blit(divergence.fbo, simRes, simRes);

      // 4. Clear Pressure
      gl!.useProgram(clearProgram!.program);
      gl!.uniform1i(clearProgram!.uniforms.uTexture, pressureFBO.read().attach(0));
      gl!.uniform1f(clearProgram!.uniforms.value, pressure);
      blit(pressureFBO.write().fbo, simRes, simRes);
      pressureFBO.swap();

      // 5. Pressure Poisson solve (Jacobi)
      gl!.useProgram(pressureProgram!.program);
      gl!.uniform2f(pressureProgram!.uniforms.texelSize, 1.0 / simRes, 1.0 / simRes);
      gl!.uniform1i(pressureProgram!.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < 16; i++) {
        gl!.uniform1i(pressureProgram!.uniforms.uPressure, pressureFBO.read().attach(1));
        blit(pressureFBO.write().fbo, simRes, simRes);
        pressureFBO.swap();
      }

      // 6. Gradient Subtract (Projection)
      gl!.useProgram(gradSubProgram!.program);
      gl!.uniform2f(gradSubProgram!.uniforms.texelSize, 1.0 / simRes, 1.0 / simRes);
      gl!.uniform1i(gradSubProgram!.uniforms.uPressure, pressureFBO.read().attach(0));
      gl!.uniform1i(gradSubProgram!.uniforms.uVelocity, velocity.read().attach(1));
      blit(velocity.write().fbo, simRes, simRes);
      velocity.swap();

      // 7. Advection Velocity
      const velDissipation = Math.exp(-dt * velocityDissipation);
      gl!.useProgram(advectionProgram!.program);
      gl!.uniform2f(advectionProgram!.uniforms.texelSize, 1.0 / simRes, 1.0 / simRes);
      gl!.uniform1i(advectionProgram!.uniforms.uVelocity, velocity.read().attach(0));
      gl!.uniform1i(advectionProgram!.uniforms.uSource, velocity.read().attach(0));
      gl!.uniform1f(advectionProgram!.uniforms.dt, dt);
      gl!.uniform1f(advectionProgram!.uniforms.dissipation, velDissipation);
      blit(velocity.write().fbo, simRes, simRes);
      velocity.swap();

      // 8. Advection Density (Color)
      const denDissipation = Math.exp(-dt * densityDissipation);
      gl!.uniform2f(advectionProgram!.uniforms.texelSize, 1.0 / dyeRes, 1.0 / dyeRes);
      gl!.uniform1i(advectionProgram!.uniforms.uVelocity, velocity.read().attach(0));
      gl!.uniform1i(advectionProgram!.uniforms.uSource, density.read().attach(1));
      gl!.uniform1f(advectionProgram!.uniforms.dissipation, denDissipation);
      blit(density.write().fbo, dyeRes, dyeRes);
      density.swap();

      // 9. Display to Canvas
      gl!.useProgram(displayProgram!.program);
      gl!.uniform1i(displayProgram!.uniforms.uTexture, density.read().attach(0));
      gl!.enable(gl!.BLEND);
      gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA);
      blit(null, canvas!.width, canvas!.height);
      gl!.disable(gl!.BLEND);

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (gl && quadVBO) {
        gl.deleteBuffer(quadVBO);
      }
    };
  }, [enabled, densityDissipation, velocityDissipation, pressure, curl, splatRadius, splatForce, transparent]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-10 ${className}`}
      style={{
        pointerEvents: 'none',
      }}
    />
  );
};
