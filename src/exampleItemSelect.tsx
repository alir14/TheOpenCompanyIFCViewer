import React, { useEffect, useRef } from 'react'
import * as THREE from "three";
import * as OBC from "@thatopen/components";

const ExampleItemSelect = () => {
    const mountRef = useRef(null);

    useEffect(() => {

        if (!mountRef.current) return

        const components = new OBC.Components();
        const worlds = components.get(OBC.Worlds);
        const world = worlds.create<
            OBC.SimpleScene,
            OBC.SimpleCamera,
            OBC.SimpleRenderer
        >();
        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBC.SimpleRenderer(components, mountRef.current);
        world.camera = new OBC.SimpleCamera(components);

        components.init();

        world.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);

        world.scene.setup();

        //adding cubes
        const cubeMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });
        const greenMaterial = new THREE.MeshStandardMaterial({ color: "#BCF124" });

        const boxGeometry = new THREE.BoxGeometry(3, 3, 3);

        const cube1 = new THREE.Mesh(boxGeometry, cubeMaterial);
        const cube2 = new THREE.Mesh(boxGeometry, cubeMaterial);
        const cube3 = new THREE.Mesh(boxGeometry, cubeMaterial);
        world.scene.three.add(cube1, cube2, cube3);
        const cubes = [cube1, cube2, cube3];

        cube2.position.x = 5;
        cube3.position.x = -5;

        const oneDegree = Math.PI / 180;

        function rotateCubes() {
            cube1.rotation.x += oneDegree;
            cube1.rotation.y += oneDegree;
            cube2.rotation.x += oneDegree;
            cube2.rotation.z += oneDegree;
            cube3.rotation.y += oneDegree;
            cube3.rotation.z += oneDegree;
        }

        world.renderer.onBeforeUpdate.add(rotateCubes);

        const casters = components.get(OBC.Raycasters);

        const caster = casters.get(world);

        let previousSelection: THREE.Mesh | null = null;


        window.onmousedown = () => {
            const result = caster.castRay(cubes);

            if (previousSelection) {
                previousSelection.material = cubeMaterial;
            }

            if (!result || !(result.object instanceof THREE.Mesh)) {
                return;
            }

            result.object.material = greenMaterial;
            previousSelection = result.object;
        }
    })

    return <div id="container" ref={mountRef} style={{ width: '100%', height: '100vh' }} />;

}

export default ExampleItemSelect;
