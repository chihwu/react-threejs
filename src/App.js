import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three";
import React, { Component, useState, useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

const App = () => {
  let renderer;
  const divRef = useRef();
  // const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    console.log("************   YES ***********");

    var scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xFF0000);
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(10, 10, 10);
    scene.add(light);

    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // use ref as a mount point of the Three.js scene

    divRef.current.appendChild(renderer.domElement);

    var controls = new OrbitControls(camera, renderer.domElement);
    // controls.screenSpacePanning = true;

    var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    var icoGeometry = new THREE.IcosahedronGeometry(1, 0);

    // var material = new THREE.MeshNormalMaterial();
    // material.transparent = true;
    // material.opacity = 0.6;
    // // material.depthTest = false;
    // // material.depthWrite = false;
    // material.side = THREE.BackSide;
    // material.needsUpdate = true;

    // const material = new THREE.MeshBasicMaterial();
    // // const texture = new THREE.TextureLoader().load('img/grid.png');
    // // material.map = texture;
    // const envTexture = new THREE.CubeTextureLoader().load([
    //   "img/px_50.png",
    //   "img/nx_50.png",
    //   "img/py_50.png",
    //   "img/ny_50.png",
    //   "img/pz_50.png",
    //   "img/nz_50.png",
    // ], () => {
    //   render();
    // });
    // envTexture.mapping = THREE.CubeReflectionMapping;
    // material.envMap = envTexture;
    // material.needsUpdate = true;

    // const material = new THREE.MeshLambertMaterial();
    // const texture = new THREE.TextureLoader().load("img/grid.png", () => { render(); });
    // material.map = texture;
    
    
    const backGroundTexture = new THREE.CubeTextureLoader().load([
        "img/px_50.png",
        "img/nx_50.png",
        "img/py_50.png",
        "img/ny_50.png",
        "img/pz_50.png",
        "img/nz_50.png",
      ], () => {
        render();
      });
    scene.background = backGroundTexture;

    const threeTone = new THREE.TextureLoader().load("img/fiveTone.jpg", () => { render(); })
    threeTone.minFilter = THREE.NearestFilter;
    threeTone.magFilter = THREE.NearestFilter;

    const fourTone = new THREE.TextureLoader().load("img/fourTone.jpg", () => { render(); })
    fourTone.minFilter = THREE.NearestFilter;
    fourTone.magFilter = THREE.NearestFilter;
    
    const fiveTone = new THREE.TextureLoader().load("img/fiveTone.jpg", () => { render(); })
    fiveTone.minFilter = THREE.NearestFilter;
    fiveTone.magFilter = THREE.NearestFilter;

    const material = new THREE.MeshToonMaterial({ color: 0x49ef4, gradientMap: fourTone })


    // var cube = new THREE.Mesh(boxGeometry, material);
    // var icosah = new THREE.Mesh(icoGeometry, material);
    
    // const mtlLoader = new MTLLoader();
    // mtlLoader.load('models/monkey.mtl',
    //   (materials) => {
    //     materials.preload();

    //     const objLoader = new OBJLoader();
    //     objLoader.load(
    //         'models/monkey.obj',
    //         (object) => {
    //             // (object.children[0]).material = material
    //             // object.traverse(function (child) {
    //             //  if ((child).isMesh) {
    //             //      (child).material = material
    //             //  }
    //             // })
    //             object.position.x = -3;
    //             scene.add(object);
    //             render();
    //         },
    //         (xhr) => {
    //             console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    //         },
    //         (error) => {
    //             console.log(error);
    //         }
    //     )
    //     objLoader.setMaterials(materials);
    //     render();
    //   },
    //   (xhr) => {
    //       console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    //   },
    //   (error) => {
    //       console.log(error);
    //   }
    // );
    
    let mixer;
    let modelReady = false;
    let animationActions = new Array();
    let activeAction;
    let lastAction;

    const setAction = (toAction) => {
      if (toAction != activeAction) {
          lastAction = activeAction;
          activeAction = toAction;
          // lastAction.stop()
          lastAction.fadeOut(1);
          activeAction.reset();
          activeAction.fadeIn(1);
          activeAction.play();
      }
    }

    var animations = {
      default: function () {
          setAction(animationActions[0])
      },
      dance: function () {
          setAction(animationActions[1])
      },
    }

    const gui = new GUI()
    const animationsFolder = gui.addFolder("Animations")
    animationsFolder.open()

    const fbxLoader = new FBXLoader();
    fbxLoader.load('models/kaya.fbx',
      (object) => {
        // object.traverse(function (child) {
        //     if ((child).isMesh) {
        //         (child).material = material
        //         if ((child).material) {
        //             ((child).material).transparent = false
        //         }
        //     }
        // });

        object.scale.set(.01, .01, .01);

        mixer = new THREE.AnimationMixer(object);
        let animationAction = mixer.clipAction(object.animations[0]);
        animationActions.push(animationAction);
        animationsFolder.add(animations, "default");
        activeAction = animationActions[0];

        scene.add(object);

        // let display = new Promise((resolve, reject) => {
        //   scene.add(object);

        //   setTimeout(() => {
        //     resolve();
        //   }, 100); 
        // });

        // display.then(
        //   () => { render(); },
        //   () => {}
        // );

        fbxLoader.load('models/Dancing_Twerk.fbx',
            (object) => {
              // object.scale.set(0.01, 0.01, 0.01);
              let animationAction = mixer.clipAction(object.animations[0]);
              animationActions.push(animationAction);
              animationsFolder.add(animations, "dance");

              console.dir(animationAction);
              animationAction.play();

              // setTimeout(() => {
              //   console.log("+++++++++++++");
              //   console.log(animationAction);
              //   console.log("!!!! COOL !!!!");
              //   animationAction.enabled = true;
              //   animationAction.reset();
              //   animationAction.play();
              //   render();
                
              // }, 2000); 

              // animationAction.enabled = true;
              // animationAction.reset();
              // animationAction.play();
              // scene.add(object);
              modelReady = true;
            
            }
        );
      },
      (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded')
      },
      (error) => {
          console.log(error);
      }
    );

    console.log('-----------------');
    console.log(animationActions[0]);



    // setTimeout(() => {
    //   setAction(animationActions[0]);
    // }, 2000); 

    // cube.position.x = 2;
    // scene.add(cube);
    // scene.add(icosah);

    camera.position.z = 5;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const render = () => {
      renderer.render(scene, camera);
    };

    const clock = new THREE.Clock();

    var animate = function () {
      requestAnimationFrame(animate);
      // cube.rotation.x += 0.01;
      // cube.rotation.y += 0.01;
      controls.update();
      
      if (modelReady) {
        mixer.update(clock.getDelta());
        // console.log("Yes");
        // console.log("===============");
        // console.log(clock.getDelta());
      }
      
      render();
    };
    animate();

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight - 50);
      render();
    };

    controls.addEventListener("change", render);
    window.addEventListener("resize", onWindowResize, false);

    render();

    return () => animationActions.forEach((clip) => mixer.uncacheClip(clip));

  }, []);

  return <div ref={divRef} />;
};

export default App;
