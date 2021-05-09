import logo from './logo.svg';
import './App.css';
import * as THREE from "three";
import React, { Component, useEffect, useRef } from "react";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

const App = () => {

  let renderer;
  const divRef = useRef();

  useEffect(() => {
    var scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xFF0000);
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    // use ref as a mount point of the Three.js scene
    
    divRef.current.appendChild( renderer.domElement );

    var controls = new OrbitControls(camera, renderer.domElement);

    var boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    var icoGeometry = new THREE.IcosahedronGeometry(1, 0);

    var material = new THREE.MeshNormalMaterial( { color: 0x00ff00 } );
    material.transparent = true;
    material.opacity = 0.6;
    // material.depthTest = false;
    // material.depthWrite = false;
    material.side = THREE.BackSide;
    material.needsUpdate = true;

    var cube = new THREE.Mesh( boxGeometry, material );
    var icosah = new THREE.Mesh( icoGeometry, material );

    cube.position.x = 2;
    scene.add( cube );
    scene.add( icosah );
    
    camera.position.z = 5;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var animate = function () {
      requestAnimationFrame( animate );
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      controls.update();
      renderer.render( scene, camera );
    };
    // animate();

    const render = () => {
      renderer.render(scene, camera);
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      render();
    };

    controls.addEventListener('change', render);
    window.addEventListener('resize', onWindowResize, false);

    render();

  }, []);

  return (
    <div ref={divRef} />
  );
};

export default App;
