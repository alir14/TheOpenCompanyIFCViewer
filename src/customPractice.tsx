import React, { useEffect, useRef, useState } from 'react';
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as THREE from 'three';

const CustomPractice: React.FC = () => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const components = new OBC.Components();

    const selectedItemsRef = useRef<string[]>([]);
    useEffect(() => {
        console.log("selectedItems", selectedItems);
        selectedItemsRef.current = selectedItems;
    }, [selectedItems]);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        const world = components.get(OBC.Worlds).create();

        const sceneComponent = new OBC.SimpleScene(components);
        sceneComponent.setup();
        world.scene = sceneComponent;

        const rendererComponent = new OBC.SimpleRenderer(components, container);
        world.renderer = rendererComponent;

        const cameraComponent = new OBC.SimpleCamera(components);
        world.camera = cameraComponent;

        container.addEventListener("resize", () => {
            rendererComponent.resize();
            cameraComponent.updateAspect();
        });


        components.init();

        const ifcLoader = components.get(OBC.IfcLoader);

        const highlighter = components.get(OBF.Highlighter);
        highlighter.setup({ world });
        highlighter.zoomToSelection = true;

        const fragmentsManager = components.get(OBC.FragmentsManager);
        fragmentsManager.onFragmentsLoaded.add(async (model) => {
            if (world.scene) {
                world.scene.three.add(model);
            }
        });

        // Click handler to perform a raycast and toggle the disabled state.
        const handleClick = (event: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1
            );
            const raycaster = new THREE.Raycaster();
            // Use the Three.js camera from the camera component.
            raycaster.setFromCamera(mouse, cameraComponent.three);
            // Check for intersections in the scene.
            const intersects = raycaster.intersectObjects(world.scene.three.children, true);
            if (intersects.length > 0) {
                const selectedMesh = intersects[0].object;
                // Toggle disabled state; here we always set it to disabled for demonstration.
                toggleDisabled(selectedMesh);
            }
        };

        container.addEventListener("click", handleClick);

        const fetchAndLoad = async () => {
            await ifcLoader.setup({
                autoSetWasm: false,
                wasm: {
                    path: "/",
                    absolute: false
                }
            });

            const file = await fetch("https://psiassetsapidev.blob.core.windows.net/ifcfiles/ifcBridgeSample.ifc");
            const buffer = await file.arrayBuffer();

            const typedArray = new Uint8Array(buffer);
            await ifcLoader.load(typedArray);
        }

        fetchAndLoad();

        return () => {
            container.removeEventListener("click", handleClick);
            highlighter.dispose();
            ifcLoader.dispose();
            rendererComponent.dispose();
            sceneComponent.dispose();
            cameraComponent.dispose();
            world.dispose();
            components.dispose();
        }

    }, []);

    // Define a function to toggle the mesh's material.
    const toggleDisabled = (mesh: THREE.Object3D) => {
        let isDisabled: boolean = false;
        console.log(selectedItemsRef.current);

        if (selectedItemsRef.current.includes(mesh.uuid)) {
            isDisabled = false;
        } else {
            isDisabled = true;
        }
        console.log("toggle", mesh.uuid, isDisabled);

        mesh.traverse((child: any) => {
            if (child.isMesh) {
                if (isDisabled) {
                    // Save the original material if it hasn't been saved yet.
                    if (!child.userData.originalMaterial) {
                        child.userData.originalMaterial = child.material;
                    }
                    // Set a wireframe material to simulate a "disabled" state.
                    child.material = new THREE.MeshBasicMaterial({
                        color: 0xcccccc,
                        wireframe: true,
                    });

                    setSelectedItems((prevData) => [...prevData, child.uuid]);
                } else {
                    // Restore the original material if it exists.
                    if (child.userData.originalMaterial) {
                        setSelectedItems((prevData) => prevData.filter((item) => item !== child.uuid));
                        child.material = child.userData.originalMaterial;
                    }
                }
            }
        });
    };

    return (
        <div >
            <div id="container" ref={containerRef} style={{ width: '100%', height: '100vh' }} />;

        </div>
    );
};

export default CustomPractice;
