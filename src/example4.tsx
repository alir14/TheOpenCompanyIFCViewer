import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as WEBIFC from "web-ifc";
import * as OBC from "@thatopen/components";

const My3DComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Define the async init function
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

      const fragments = new OBC.FragmentsManager(components);
      const file = await fetch(
        "https://thatopen.github.io/engine_components/resources/small.frag"
      );
      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);
      const model = fragments.load(buffer);
      world.scene.three.add(model);

      const properties = await fetch(
        "https://thatopen.github.io/engine_components/resources/small.json"
      );
      model.setLocalProperties(await properties.json());

      const classifier = components.get(OBC.Classifier);

      classifier.byEntity(model);
      classifier.byIfcRel(
        model,
        WEBIFC.IFCRELCONTAINEDINSPATIALSTRUCTURE,
        "storeys"
      );
      classifier.byModel(model.uuid, model);

      const walls = classifier.find({
        entities: ["IFCWALLSTANDARDCASE"],
      });

      const slabs = classifier.find({
        entities: ["IFCSLAB"],
      });

      const curtainWalls = classifier.find({
        entities: ["IFCMEMBER", "IFCPLATE"],
      });

      const furniture = classifier.find({
        entities: ["IFCFURNISHINGELEMENT"],
      });

      const doors = classifier.find({
        entities: ["IFCDOOR"],
      });

      const all = classifier.find({
        models: [model.uuid],
      });

      BUI.Manager.init();

      const color = new THREE.Color();

      const panel = BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html`
          <bim-panel active label="Classifier Tutorial" class="options-menu">
            <bim-panel-section collapsed label="Controls">

              <bim-color-input 
                label="Walls Color" color="#202932" 
                @input="${({ target }: { target: BUI.ColorInput }) => {
                  color.set(target.color);
                  classifier.setColor(walls, color);
                }}">
              </bim-color-input>

              <bim-color-input 
                label="Slabs Color" color="#202932" 
                @input="${({ target }: { target: BUI.ColorInput }) => {
                  color.set(target.color);
                  classifier.setColor(slabs, color);
                }}">
              </bim-color-input>

              <bim-color-input 
                label="Curtain walls Color" color="#202932" 
                @input="${({ target }: { target: BUI.ColorInput }) => {
                  color.set(target.color);
                  classifier.setColor(curtainWalls, color);
                }}">
              </bim-color-input>

              <bim-color-input 
                label="Furniture Color" color="#202932" 
                @input="${({ target }: { target: BUI.ColorInput }) => {
                  color.set(target.color);
                  classifier.setColor(furniture, color);
                }}">
              </bim-color-input>

              <bim-color-input 
                label="Doors Color" color="#202932" 
                @input="${({ target }: { target: BUI.ColorInput }) => {
                  color.set(target.color);
                  classifier.setColor(doors, color);
                }}">
              </bim-color-input>
                        
              <bim-button 
                label="Reset walls color" 
                @click="${() => {
                  classifier.resetColor(all);
                }}">  
              </bim-button>  

            </bim-panel-section>
          </bim-panel>
          `;
      });

      containerRef.current?.appendChild(panel);

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

      containerRef.current?.appendChild(button);
    };

    // Call the init function
    init();
  }, []); // Empty dependency array means this effect only runs once, when the component mounts

  return <div id="container" ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default My3DComponent;
