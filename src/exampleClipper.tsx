import React, { useEffect, useRef } from 'react'
import * as THREE from 'three';
import * as BUI from '@thatopen/ui';
import * as OBC from '@thatopen/components';


const CliperExample: React.FunctionComponent = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = document.getElementById("container")!;

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

    world.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);

    world.scene.setup();

    world.scene.three.background = null;

    const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 1.5, 0);
    world.scene.three.add(cube);
    world.meshes.add(cube);

    // const initModel = async () => {
    //   const fragmentIfcLoader = components.get(OBC.IfcLoader);
    //   await fragmentIfcLoader.setup();
    //   const file = await fetch(
    //     "https://thatopen.github.io/engine_components/resources/small.ifc",
    //   );
    //   const data = await file.arrayBuffer();
    //   const buffer = new Uint8Array(data);
    //   const model = await fragmentIfcLoader.load(buffer);
    //   model.name = "example";
    //   world.scene.three.add(model);

    //   for (const child of model.children) {
    //     if (child instanceof THREE.Mesh) {
    //       world.meshes.add(child);
    //     }
    //   }
    // }
    // initModel();

    const casters = components.get(OBC.Raycasters);
    casters.get(world);

    const clipper = components.get(OBC.Clipper);

    clipper.enabled = true;

    container.ondblclick = () => {
      if (clipper.enabled) {
        clipper.create(world);
      }
    };

    window.onkeydown = (event) => {
      if (event.code === "Delete" || event.code === "Backspace") {
        if (clipper.enabled) {
          clipper.delete(world);
        }
      }
    };

    BUI.Manager.init();

    const panel = BUI.Component.create<BUI.PanelSection>(() => {
      return BUI.html`
            <bim-panel label="Clipper Tutorial" class="options-menu">
                  <bim-panel-section collapsed label="Commands">
              
                <bim-label>Double click: Create clipping plane</bim-label>
                <bim-label>Delete key: Delete clipping plane</bim-label>
               
                
              </bim-panel-section>
              <bim-panel-section collapsed label="Others"">
                  
                <bim-checkbox label="Clipper enabled" checked 
                  @change="${({ target }: { target: BUI.Checkbox }) => {
          clipper.config.enabled = target.value;
        }}">
                </bim-checkbox>
                
                <bim-checkbox label="Clipper visible" checked 
                  @change="${({ target }: { target: BUI.Checkbox }) => {
          clipper.config.visible = target.value;
        }}">
                </bim-checkbox>
              
                <bim-color-input 
                  label="Planes Color" color="#202932" 
                  @input="${({ target }: { target: BUI.ColorInput }) => {
          clipper.config.color = new THREE.Color(target.color);
        }}">
                </bim-color-input>
                
                <bim-number-input 
                  slider step="0.01" label="Planes opacity" value="0.2" min="0.1" max="1"
                  @change="${({ target }: { target: BUI.NumberInput }) => {
          clipper.config.opacity = target.value;
        }}">
                </bim-number-input>
                
                <bim-number-input 
                  slider step="0.1" label="Planes size" value="5" min="2" max="10"
                  @change="${({ target }: { target: BUI.NumberInput }) => {
          clipper.config.size = target.value;
        }}">
                </bim-number-input>
                
                <bim-button 
                  label="Delete all" 
                  @click="${() => {
          clipper.deleteAll();
        }}">  
                </bim-button>        
                
                <bim-button 
                  label="Rotate cube" 
                  @click="${() => {
          cube.rotation.x = 2 * Math.PI * Math.random();
          cube.rotation.y = 2 * Math.PI * Math.random();
          cube.rotation.z = 2 * Math.PI * Math.random();
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

    return () => {
      world.renderer.dispose();
      world.scene.dispose();
      world.camera.dispose();
      components.dispose();
    }
  }, [])

  return <div id="container" ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}

export default CliperExample;


