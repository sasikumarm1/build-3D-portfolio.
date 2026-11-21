import * as THREE from './assets/three/three.module.min.js';

(() => {
  const canvas = document.querySelector('#sculpture'), stage = canvas.parentNode;
  const button = document.querySelector('#motion'), pref = matchMedia('(prefers-reduced-motion: reduce)');
  const position = [], normal = [], shade = [], indices = [];

  function addShard(points, depth, bevel, angle) {
    const profile = new THREE.Shape(points.map(([x,y]) => new THREE.Vector2(x,y)));
    const geometry = new THREE.ExtrudeGeometry(profile, {
      depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel,
      bevelSegments: 1, steps: 1, curveSegments: 1
    });
    geometry.translate(0, 0, -depth / 2);
    geometry.rotateY(angle);
    const vertices = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    for (let i = 0; i < vertices.count; i++) {
      indices.push(position.length / 3);
      position.push(vertices.getX(i), vertices.getY(i), vertices.getZ(i));
      normal.push(normals.getX(i), normals.getY(i), normals.getZ(i));
      shade.push(Math.abs(normals.getZ(i)) > .95 ? .79 : 1);
    }
    geometry.dispose();
  }

  // Two beveled silver halves frame a suspended diamond.
  addShard([[-.30,1.92],[-1.48,.88],[-1.72,-.49],[-.58,-1.78],
            [-.35,-.89],[-.93,-.36],[-.79,.60],[-.15,1.19]], .52, .15, -.19);
  addShard([[.30,-1.92],[1.48,-.88],[1.72,.49],[.58,1.78],
            [.35,.89],[.93,.36],[.79,-.60],[.15,-1.19]], .52, .15, -.19);
  addShard([[0,.73],[.42,0],[0,-.73],[-.42,0]], .24, .09, .38);
  let x=.30,y=-.38,z=-.16,auto=!pref.matches,last=0,visible=true,raf=0,drag=null,render;
  function motionLabel(){button.classList.toggle('stopped',!auto);button.setAttribute('aria-label',auto?'Pause motion':'Play motion');button.title=button.getAttribute('aria-label')}
  motionLabel();
  button.onclick=()=>{auto=!auto;motionLabel();request()};
  pref.addEventListener('change',()=>{auto=!pref.matches;motionLabel();request()});
  const image=new Image();image.onload=init;image.src='assets/polished-chrome.jpg';
  function init(){
    const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
    if(gl) render=webGL(gl); else render=software();
    new ResizeObserver(request).observe(stage);
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request()}).observe(stage);
    request();
  }
  function matrix(rx,ry,rz) {
    const a=Math.cos(rx),b=Math.sin(rx),c=Math.cos(ry),d=Math.sin(ry),e=Math.cos(rz),f=Math.sin(rz);
    return [c*e,c*f,-d,b*d*e-a*f,b*d*f+a*e,b*c,a*d*e+b*f,a*d*f-b*e,a*c];
  }
  function request(){if(!raf&&render&&visible&&!document.hidden)raf=requestAnimationFrame(frame)}
  function frame(now){
    raf=0;if(!visible||document.hidden)return;
    if(last&&auto&&!drag)y+=Math.min(50,now-last)*.00011;
    last=now;const offset=pref.matches?0:Math.min(1.1,window.scrollY/(window.innerHeight||1));
    render(matrix(x+offset*.18,y+offset*.55,z));
    if(auto&&!drag)request();
  }
  addEventListener('scroll',request,{passive:true});document.addEventListener('visibilitychange',request);
  canvas.onpointerdown=e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)};
  canvas.onpointermove=e=>{if(!drag)return;y+=(e.clientX-drag[0])*.009;x+=(e.clientY-drag[1])*.009;drag=[e.clientX,e.clientY];request()};
  canvas.onlostpointercapture=()=>{drag=null;request()};
  canvas.onkeydown=e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    e.preventDefault();y+=(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0)*.15;x+=(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0)*.15;request();
  };
  function size(ratio){
    const w=Math.max(1,Math.round(canvas.clientWidth*ratio)),h=Math.max(1,Math.round(canvas.clientHeight*ratio));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
    return [w,h];
  }
  function webGL(gl){
    const renderer = new THREE.WebGLRenderer({canvas, context: gl, alpha: true, antialias: true});
    renderer.setClearColor(0, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(16, 1, .1, 30);
    camera.position.z = 1 / .065;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
    geometry.setAttribute('occlusion', new THREE.Float32BufferAttribute(shade, 1));
    geometry.setIndex(indices);
    const texture = new THREE.Texture(image);
    texture.flipY = false;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {chrome: {value: texture}},
      vertexShader: `
        attribute float occlusion;
        varying vec3 surfaceNormal;
        varying float shading;
        void main() {
          surfaceNormal = normalMatrix * normal;
          shading = occlusion;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform sampler2D chrome;
        varying vec3 surfaceNormal;
        varying float shading;
        void main() {
          vec3 n = normalize(surfaceNormal);
          vec2 uv = vec2(.5 + .498 * n.x, .5 - .498 * n.y);
          gl_FragColor = vec4(mix(vec3(.24), texture2D(chrome, uv).rgb, .82) * shading, 1.);
        }`
    });
    const knot = new THREE.Mesh(geometry, material);
    knot.matrixAutoUpdate = false;
    scene.add(knot);
    let width = 0, height = 0;
    return rotation => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      if (w !== width || h !== height) {
        renderer.setPixelRatio(Math.min(2, devicePixelRatio));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(h / (Math.min(w,h) * .46 * camera.position.z)));
        camera.updateProjectionMatrix();
        width = w; height = h;
      }
      knot.matrix.set(rotation[0], rotation[3], rotation[6], 0,
                      rotation[1], rotation[4], rotation[7], 0,
                      rotation[2], rotation[5], rotation[8], 0,
                      0, 0, 0, 1);
      knot.matrixWorldNeedsUpdate = true;
      renderer.render(scene, camera);
    };
  }
  // Rasterize the same mesh when a device cannot create a WebGL context.
  function software(){
    const ctx=canvas.getContext('2d'),tile=document.createElement('canvas');tile.width=tile.height=256;
    const tc=tile.getContext('2d');tc.drawImage(image,0,0,256,256);const pixels=tc.getImageData(0,0,256,256).data;
    const verts=new Float32Array(shade.length*6);let buffer,depth;
    return m=>{
      const [w,h]=size(Math.min(1.25,580/canvas.clientWidth)),s=Math.min(w,h)*.23;
      if(!buffer||buffer.width!==w||buffer.height!==h){buffer=ctx.createImageData(w,h);depth=new Float32Array(w*h)}
      buffer.data.fill(0);depth.fill(-Infinity);
      for(let i=0;i<shade.length;i++){
        const j=i*3,k=i*6,X=position[j],Y=position[j+1],Z=position[j+2],dz=m[2]*X+m[5]*Y+m[8]*Z,f=s/(1-dz*.065);
        verts[k]=w/2+(m[0]*X+m[3]*Y+m[6]*Z)*f;verts[k+1]=h/2-(m[1]*X+m[4]*Y+m[7]*Z)*f;verts[k+2]=dz;
        verts[k+3]=127.5+127*(m[0]*normal[j]+m[3]*normal[j+1]+m[6]*normal[j+2]);verts[k+4]=127.5-127*(m[1]*normal[j]+m[4]*normal[j+1]+m[7]*normal[j+2]);verts[k+5]=shade[i];
      }
      for(let i=0;i<indices.length;i+=3){
        const a=indices[i]*6,b=indices[i+1]*6,c=indices[i+2]*6,ax=verts[a],ay=verts[a+1],bx=verts[b],by=verts[b+1],cx=verts[c],cy=verts[c+1];
        const area=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(area)<.001)continue;
        for(let py=Math.max(0,Math.ceil(Math.min(ay,by,cy)));py<=Math.min(h-1,Math.max(ay,by,cy));py++)for(let px=Math.max(0,Math.ceil(Math.min(ax,bx,cx)));px<=Math.min(w-1,Math.max(ax,bx,cx));px++){
          const u=((by-cy)*(px-cx)+(cx-bx)*(py-cy))/area,v=((cy-ay)*(px-cx)+(ax-cx)*(py-cy))/area,t=1-u-v;if(u<0||v<0||t<0)continue;
          const idx=py*w+px,d=u*verts[a+2]+v*verts[b+2]+t*verts[c+2];if(d<=depth[idx])continue;depth[idx]=d;
          const tx=(u*verts[a+3]+v*verts[b+3]+t*verts[c+3])|0,ty=(u*verts[a+4]+v*verts[b+4]+t*verts[c+4])|0;
          const p=(ty*256+tx)*4,k=idx*4,sh=u*verts[a+5]+v*verts[b+5]+t*verts[c+5];
          buffer.data[k]=pixels[p]*sh;buffer.data[k+1]=pixels[p+1]*sh;buffer.data[k+2]=pixels[p+2]*sh;buffer.data[k+3]=255;
        }
      }
      ctx.putImageData(buffer,0,0);
    };
  }
})();
