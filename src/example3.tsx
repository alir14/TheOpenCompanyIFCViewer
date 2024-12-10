import React, { useEffect, useRef } from 'react';
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";

const CudeModel = () => {
    const mountRef = useRef(null);
    // const container = document.getElementById("container")!;

    useEffect(() => {
        if (!mountRef.current) return;

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

        world.scene.setup();

        world.scene.three.background = null;

        const material = new THREE.MeshLambertMaterial({ color: "#6528D7" });
        const geometry = new THREE.BoxGeometry();
        const cude = new THREE.Mesh(geometry, material);
        world.scene.three.add(cude);

        world.camera.controls.setLookAt(3, 3, 3, 0, 0, 0);

        BUI.Manager.init();


        const panel = BUI.Component.create<BUI.PanelSection>(() => {
            return BUI.html`
              <bim-panel label="Worlds Tutorial" class="options-menu">
                <bim-panel-section collapsed label="Controls">
                
                  <bim-color-input 
                    label="Background Color" color="#202932" 
                    @input="${({ target }: { target: BUI.ColorInput }) => {
                    world.scene.config.backgroundColor = new THREE.Color(target.color);
                }}">
                  </bim-color-input>
                  
                  <bim-number-input 
                    slider step="0.1" label="Directional lights intensity" value="1.5" min="0.1" max="10"
                    @change="${({ target }: { target: BUI.NumberInput }) => {
                    world.scene.config.directionalLight.intensity = target.value;
                }}">
                  </bim-number-input>
                  
                  <bim-number-input 
                    slider step="0.1" label="Ambient light intensity" value="1" min="0.1" max="5"
                    @change="${({ target }: { target: BUI.NumberInput }) => {
                    world.scene.config.ambientLight.intensity = target.value;
                }}">
                  </bim-number-input>
                  
                </bim-panel-section>
              </bim-panel>
              `;
        });

        mountRef.current.appendChild(panel);

        const button = BUI.Component.create<BUI.PanelSection>(() => {
            return BUI.html`
                <bim-button class="phone-menu-toggler" icon="solar:settings-bold"
                  @click="${() => {
                    if (panel.classList.contains("options-menu-visible")) {
                        panel.classList.remove("options-menu-visible");
                    } else {
                        panel.classList.add("options-menu-visible");
                    }
                }}">
                </bim-button>
              `;
        });

        mountRef.current.appendChild(button);

        return () => {
            world.renderer.dispose();
            world.scene.dispose();
            world.camera.dispose();
            components.dispose();
        };
    }, []);

    return <div id="container" ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default CudeModel;
