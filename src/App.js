import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three";
import React, { Component, useState, useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import * as CANNON from "cannon";
// import CannonDebugRenderer from './utils/CannonDebugRenderer.js';

const App = () => {
  let renderer;
  const divRef = useRef();

  useEffect(() => {
    console.log("************   YES ***********");

    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.allowSleep = true;

    var scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xFF0000);
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    // var cannonDebugRenderer = CannonDebugRenderer( scene, world );

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
    
    divRef.current.innerHTML = "";
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
    let modelMesh;
    let cubeBody;

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
      walk: function () {
          setAction(animationActions[1])
      },
    }

    const gui = new GUI();
    const animationsFolder = gui.addFolder("Animations");
    animationsFolder.open();

    const sceneMeshes = new Array();
    const planeGeometry = new THREE.PlaneGeometry(25, 25);
    const plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial());
    plane.rotateX(-1.0 * Math.PI / 2);
    plane.receiveShadow = true;
    scene.add(plane);
    sceneMeshes.push(plane);

    const planeShape = new CANNON.Plane();
    const planeBody = new CANNON.Body({ mass: 0 });
    planeBody.addShape(planeShape);
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(planeBody);

    const fbxLoader = new FBXLoader();
    fbxLoader.load('models/kaya.fbx',
      (object) => {
        object.traverse(function (child) {
            if ((child).isMesh) {
                let m = child;
                m.receiveShadow = true;
                m.castShadow = true;
                m.frustumCulled = false;
                m.geometry.computeVertexNormals();

                sceneMeshes.push(m);
            }
        });

        const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
        cubeBody = new CANNON.Body({ mass: 1 });
        cubeBody.addShape(cubeShape);
        cubeBody.position.x = object.position.x;
        cubeBody.position.y = object.position.y;
        cubeBody.position.z = object.position.z;
        world.addBody(cubeBody);

        object.scale.set(.01, .01, .01);

        mixer = new THREE.AnimationMixer(object);
        let animationAction = mixer.clipAction(object.animations[0]);
        animationActions.push(animationAction);
        animationsFolder.add(animations, "default");
        activeAction = animationActions[0];

        scene.add(object);
        modelMesh = object;
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

        fbxLoader.load('models/Unarmed Walk Forward.fbx',
            (object) => {
              // object.scale.set(0.01, 0.01, 0.01);
              let animationAction = mixer.clipAction(object.animations[0]);
              animationActions.push(animationAction);
              animationsFolder.add(animations, "walk");

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

      let delta = clock.getDelta();
      if (delta > 0.1) {  // solve a weird issue happened when switching between browsers
        delta = 0.1;
      }

      world.step(delta);

      if (modelReady) {
        mixer.update(delta);

        // modelMesh.position.set(cubeBody.position.x, cubeBody.position.y, cubeBody.position.z);
        // modelMesh.quaternion.set(cubeBody.quaternion.x, cubeBody.quaternion.y, cubeBody.quaternion.z, cubeBody.quaternion.w);  

        if (!modelMesh.quaternion.equals(targetQuaternion)) {
          modelMesh.quaternion.rotateTowards(targetQuaternion, delta * 10);
        }
      }

      TWEEN.update();
      
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

    const raycaster = new THREE.Raycaster();
    const targetQuaternion = new THREE.Quaternion;

    const onMouseMove = (event) => {
      const mouse = {
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
      };

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(sceneMeshes, false);

      if (intersects.length > 0) {
        // console.log(sceneMeshes.length + " " + intersects.length);
        // console.log(intersects[0].object.name + " " + intersects[0].distance + " ");
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove, false);

    const onDoubleClick = (event) => {
      const mouse = {
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
      };
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(sceneMeshes, false);

      if (intersects.length > 0) {
        const p = intersects[0].point;

        // controls.target.set(p.x, p.y, p.z);

        // TWEEN.removeAll();
        // new TWEEN.Tween(controls.target)
        //     .to({
        //         x: p.x,
        //         y: p.y,
        //         z: p.z
        //     }, 500)
        //     //.delay (1000)
        //     .easing(TWEEN.Easing.Bounce.Out)
        //     // .onUpdate(() => render())
        //     .start();

        const distance = modelMesh.position.distanceTo(p);

        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.lookAt(p, modelMesh.position, modelMesh.up);
        targetQuaternion.setFromRotationMatrix(rotationMatrix);

        setAction(animationActions[1]);

        TWEEN.removeAll();
        new TWEEN.Tween(modelMesh.position)
            .to({
              x: p.x,
              y: p.y,
              z: p.z
            }, 1000 / 2.2 * distance)
            .onUpdate(() => {
              controls.target.set(
                modelMesh.position.x,
                modelMesh.position.y + 1,
                modelMesh.position.z
              );

              // You can change light position here so light follows the object
              // light1.target = modelMesh;
            })
            .start()
            .onComplete(() => {
              setAction(animationActions[0]);
              activeAction.clampWhenFinished = true;
              activeAction.loop = THREE.LoopOnce;
            });
      }
    };
    renderer.domElement.addEventListener('dblclick', onDoubleClick, false);


    render();

    return () => animationActions.forEach((clip) => mixer.uncacheClip(clip));

  }, []);

  return <div ref={divRef} />;
};

export default App;
