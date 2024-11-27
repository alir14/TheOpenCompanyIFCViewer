// import React, { useEffect, useRef } from 'react';
// import * as OBC from "@thatopen/components";
// import * as BUI from "@thatopen/ui";
// import * as THREE from 'three'

// const ModelViewer = () => {
//     const mount = useRef(null);

//     useEffect(() => {
//         const container = document.getElementById("container")!;
//         const components = new OBC.Components();
//         const worlds = components.get(OBC.Worlds);
//         const world = worlds.create<
//             OBC.SimpleScene,
//             OBC.SimpleCamera,
//             OBC.SimpleRenderer
//         >();
//         world.scene = new OBC.SimpleScene(components);
//         world.renderer = new OBC.SimpleRenderer(components, container);
//         world.camera = new OBC.SimpleCamera(components);

//         components.init();

//         world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

//         world.scene.setup();

//         const grids = components.get(OBC.Grids);
//         grids.create(world);

//         world.scene.three.background = null;
//         const fragments = components.get(OBC.FragmentsManager);

//         const loadModel = async () => {
//             const file = await fetch(
//                 "https://thatopen.github.io/engine_components/resources/small.ifc",
//             );
//             const data = await file.arrayBuffer();
//             const buffer = new Uint8Array(data);
//             const model = fragments.load(buffer);
//             world.scene.three.add(model);
//             const fragmentBbox = components.get(OBC.BoundingBoxer);
//             fragmentBbox.add(model);
//             const bbox = fragmentBbox.getMesh();
//             fragmentBbox.reset();
//             BUI.Manager.init();



//             const panel = BUI.Component.create<BUI.PanelSection>(() => {
//                 return BUI.html`
//               <bim-panel active label="Bounding Boxes Tutorial" class="options-menu">
//                 <bim-panel-section collapsed label="Controls">

//                   <bim-button 
//                     label="Fit BIM model" 
//                     @click="${() => {
//                         world.camera.controls.fitToSphere(bbox, true);
//                     }}">  
//                   </bim-button>  

//                 </bim-panel-section>
//               </bim-panel>
//               `;
//             });

//             document.body.append(panel);

//             const button = BUI.Component.create<BUI.PanelSection>(() => {
//                 return BUI.html`
//                     <bim-button class="phone-menu-toggler" icon="solar:settings-bold"
//                       @click="${() => {
//                         if (panel.classList.contains("options-menu-visible")) {
//                             panel.classList.remove("options-menu-visible");
//                         } else {
//                             panel.classList.add("options-menu-visible");
//                         }
//                     }}">
//                     </bim-button>
//                   `;
//             });

//             document.body.append(button);
//         };

//         loadModel();

//         return () => {
//         };
//     }, []);

//     return <div id="container" ref={mount}></div>;
// };

// export default ModelViewer;

import React, { useEffect, useRef } from 'react';
import * as OBC from '@thatopen/components';
import * as BUI from '@thatopen/ui';

const ModelViewer = () => {
    const mountRef = useRef(null);

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

        world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);
        world.scene.setup();

        const grids = components.get(OBC.Grids);
        grids.create(world);
        world.scene.three.background = null;

        const fragments = components.get(OBC.FragmentsManager);
        const fragmentBbox = components.get(OBC.BoundingBoxer);
        BUI.Manager.init();

        async function loadModel() {
            try {
                const response = await fetch("https://thatopen.github.io/engine_components/resources/small.frag");
                const data = await response.arrayBuffer();
                const buffer = new Uint8Array(data);
                const model = fragments.load(buffer);
                world.scene.three.add(model);
                fragmentBbox.add(model);
                const bbox = fragmentBbox.getMesh();
                fragmentBbox.reset();

                // Panel and button now handled via React state or potentially context
                BUI.Manager.init();

                const panel = BUI.Component.create<BUI.PanelSection>(() => {
                    return BUI.html`
              <bim-panel active label="Bounding Boxes Tutorial" class="options-menu">
                <bim-panel-section collapsed label="Controls">
                   
                  <bim-button 
                    label="Fit BIM model" 
                    @click="${() => {
                            world.camera.controls.fitToSphere(bbox, true);
                        }}">  
                  </bim-button>  
          
                </bim-panel-section>
              </bim-panel>
              `;
                });

                //document.body.append(panel);
                mountRef.current?.appendChild(panel);

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

                // document.body.append(button);
                mountRef.current?.appendChild(button);

            } catch (error) {
                console.error('Failed to load model:', error);
            }
        }

        loadModel();

        return () => {
            world.renderer.dispose();
            world.scene.dispose();
            world.camera.dispose();
            grids.dispose();
            fragments.dispose();
            fragmentBbox.dispose();
            components.dispose();
        };
    }, []);

    return <div id="container" ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ModelViewer;
