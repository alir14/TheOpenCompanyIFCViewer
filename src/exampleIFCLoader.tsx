import React, { useEffect, useRef } from 'react'
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as WEBIFC from "web-ifc";
import * as OBC from "@thatopen/components";

const ExampleIFCLoader: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const init = async () => {
            if (!containerRef.current) {
                return;
            }

            const container = containerRef.current;
            const components = new OBC.Components();
            const worlds = components.get(OBC.Worlds);

            const world = worlds.create<
                OBC.SimpleScene,
                OBC.SimpleCamera,
                OBC.SimpleRenderer
            >();

            world.scene = new OBC.SimpleScene(components);
            world.renderer = new OBC.SimpleRenderer(components, container);
            world.camera = new OBC.SimpleCamera(components);

            components.init();

            world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

            world.scene.setup();

            const grids = components.get(OBC.Grids);
            grids.create(world);

            world.scene.three.background = null;

            const fragments = components.get(OBC.FragmentsManager);

            const fragmentIfcLoader = components.get(OBC.IfcLoader);

            await fragmentIfcLoader.setup();

            const excludeedCats = [
                WEBIFC.IFCTENDONANCHOR,
                WEBIFC.IFCREINFORCINGBAR,
                WEBIFC.IFCREINFORCINGELEMENT
            ];

            for (const cat of excludeedCats) {
                fragmentIfcLoader.settings.excludedCategories.add(cat);
            }

            fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

            const loadIfc = async () => {
                const file = await fetch(
                    "https://thatopen.github.io/engine_components/resources/small.ifc",
                );
                const data = await file.arrayBuffer();
                const buffer = new Uint8Array(data);
                const model = await fragmentIfcLoader.load(buffer);
                model.name = "example";
                world.scene.three.add(model);
            }

            fragments.onFragmentsLoaded.add((model) => {
                console.log(model);
            });

            const disposeFragments = () => {
                fragments.dispose();
            }

            BUI.Manager.init();

            const panel = BUI.Component.create<BUI.PanelSection>(() => {
                return BUI.html`
                <bim-panel active label="IFC Loader Tutorial" class="options-menu">
                  <bim-panel-section collapsed label="Controls">
                    <bim-panel-section style="padding-top: 12px;">
                    
                      <bim-button label="Load IFC"
                        @click="${() => {
                        loadIfc();
                    }}">
                      </bim-button>  
                          
                          
                      <bim-button label="Dispose fragments"
                        @click="${() => {
                        disposeFragments();
                    }}">
                      </bim-button>
                    
                    </bim-panel-section>
                    
                  </bim-panel>
                `;
            });

            containerRef.current.appendChild(panel);

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

            containerRef.current.appendChild(button);

        };
        init();
    }, [])

    return <div id="container" ref={containerRef} style={{ width: '100%', height: '100vh' }} />;

}

export default ExampleIFCLoader;