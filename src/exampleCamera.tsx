import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";

const OrthoPerspectiveCameraApp: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const components = new OBC.Components();


    useEffect(() => {
        if (!containerRef.current) return;

        const worlds = components.get(OBC.Worlds);

        const world = worlds.create<
            OBC.SimpleScene,
            OBC.OrthoPerspectiveCamera,
            OBC.SimpleRenderer
        >();

        // Set up the world
        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
        world.camera = new OBC.OrthoPerspectiveCamera(components);
        components.init();

        // Set up the camera
        world.camera.controls.setLookAt(3, 3, 3, 0, 0, 0);
        world.scene.setup();

        // Transparent background
        world.scene.three.background = null;

        // Create cube
        const cubeGeometry = new THREE.BoxGeometry();
        const cubeMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(0, 0.5, 0);
        world.scene.three.add(cube);
        world.meshes.add(cube);

        // Create grid
        const grids = components.get(OBC.Grids);
        const grid = grids.create(world);

        // Camera projection change handler
        // world.camera.projection.onChanged.add(() => {
        //     const projection = world.camera.projection.current;
        //     grid.fade = projection === "Perspective";
        // });

        // Initialize UI
        BUI.Manager.init();

        const panel = BUI.Component.create<BUI.PanelSection>(() => {
            return BUI.html`
        <bim-panel active label="OrthoPerspective Camera Tutorial" class="options-menu">
          <bim-panel-section collapsed label="Controls">
            <bim-dropdown required label="Navigation mode"
              @change="${({ target }: { target: BUI.Dropdown }) => {

                    const selected = target.value[0] as OBC.NavModeID;
                    console.log({ 'b': target.value[0], 'a': target.value[0] as OBC.NavModeID })
                    const { current } = world.camera.projection;
                    const isOrtho = current === "Orthographic";
                    const isFirstPerson = selected === "FirstPerson";
                    if (isOrtho && isFirstPerson) {
                        alert("First person is not compatible with ortho!");
                        target.value[0] = world.camera.mode.id;
                        return;
                    }
                    world.camera.set(selected);
                }}"
            >
              <bim-option checked label="Orbit"></bim-option>
              <bim-option label="FirstPerson"></bim-option>
              <bim-option label="Plan"></bim-option>
            </bim-dropdown>

            <bim-dropdown required label="Camera projection"
              @change="${({ target }: { target: BUI.Dropdown }) => {
                    const selected = target.value[0] as OBC.CameraProjection;
                    const isOrtho = selected === "Orthographic";
                    const isFirstPerson = world.camera.mode.id === "FirstPerson";
                    if (isOrtho && isFirstPerson) {
                        alert("First person is not compatible with ortho!");
                        target.value[0] = world.camera.projection.current;
                        return;
                    }
                    world.camera.projection.set(selected);
                }}"
            >
              <bim-option checked label="Perspective"></bim-option>
              <bim-option label="Orthographic"></bim-option>
            </bim-dropdown>

            <bim-checkbox label="Allow user input" checked
              @change="${({ target }: { target: BUI.Checkbox }) => {
                    world.camera.setUserInput(target.checked);
                }}"
            ></bim-checkbox>

            <bim-button label="Fit cube"
              @click="${() => {
                    world.camera.fit([cube]);
                }}"
            ></bim-button>
          </bim-panel-section>
        </bim-panel>
      `;
        });
        document.body.appendChild(panel);

        return () => {
            // Cleanup resources
            components.dispose();
            document.body.removeChild(panel);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ width: "100%", height: "100vh", position: "relative" }}
        ></div>
    );
};

export default OrthoPerspectiveCameraApp;
