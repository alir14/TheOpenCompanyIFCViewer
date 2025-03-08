import React, { useEffect, useRef, useState } from 'react'
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as OBF from "@thatopen/components-front";

const ExampleMeasurement = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimentionsInstance, setDimentionsInstance] = useState<OBF.LengthMeasurement>();

  useEffect(() => {

    const components = new OBC.Components();

    const worlds = components.get(OBC.Worlds);
    const world = worlds.create<
      OBC.SimpleScene,
      OBC.SimpleCamera,
      OBC.SimpleRenderer
    >();

    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
    world.camera = new OBC.SimpleCamera(components);

    components.init();

    world.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);
    world.scene.setup();
    world.scene.three.background = null;

    const grids = components.get(OBC.Grids);
    grids.create(world);

    // Add a cube
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

    // Initialize length measurement
    const dimensions = components.get(OBF.LengthMeasurement);

    dimensions.world = world;
    dimensions.enabled = true;
    dimensions.snapDistance = 1;

    setDimentionsInstance(dimensions);

    containerRef.current.ondblclick = () => {
      dimensions.create();
      // console.log(dimensions?.list);

      // if (dimensions?.list && dimensions?.list.length > 0) {
      //   const listLength = dimensions?.list.length;
      //   const addedDimention: OBF.SimpleDimensionLine = dimensions?.list[listLength - 1];
      //   const midPoint = new THREE.Vector3()
      //     .addVectors(addedDimention.startPoint, addedDimention.endPoint)
      //     .multiplyScalar(0.5);

      //   const textSprite = createTextLabel(
      //     addedDimention.boundingBox.geometry?.parameters.depth
      //     , midPoint);
      //   world.scene.three.add(textSprite);
      // }
    }

    // const createTextLabel = (text: string, position: THREE.Vector3): THREE.Sprite => {
    //   const canvas = document.createElement("canvas");
    //   const context = canvas.getContext("2d")!;
    //   context.font = "32px Arial";
    //   context.fillStyle = "black";
    //   context.fillText(text, 20, 60);

    //   const texture = new THREE.CanvasTexture(canvas);
    //   const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    //   const sprite = new THREE.Sprite(spriteMaterial);
    //   sprite.position.copy(position);
    //   sprite.scale.set(0.5, 0.5, 0.5); 
    //   return sprite;
    // }

    const createTextLabel = (value: number, position: THREE.Vector3): THREE.Sprite => {
      const text = value.toFixed(2); // Format the value to 2 decimal places

      const canvas = document.createElement("canvas");

      // Set the canvas resolution (higher resolution reduces blurriness)
      const width = 256;  // Canvas width
      const height = 128; // Canvas height
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d")!;

      // Set black background
      context.fillStyle = "black";
      context.fillRect(0, 0, width, height); // Fill the entire canvas with black

      // Set white text with higher resolution scaling
      context.font = "48px Arial"; // Higher font size for better clarity
      context.fillStyle = "white";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, width / 2, height / 2); // Center the text

      // Create texture from the canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter; // Prevent texture aliasing
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;

      // Create sprite material
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });

      // Create the sprite
      const sprite = new THREE.Sprite(spriteMaterial);

      // Adjust the position of the label to stay above the line
      const labelPosition = position.clone();
      // Offset the label slightly above the line
      labelPosition.x += 0.1;
      labelPosition.y += 0.1; 
      labelPosition.z += 0.2; 

      sprite.position.copy(labelPosition);
      sprite.scale.set(2, 1, 1); // Adjust scale for the aspect ratio of the canvas

      return sprite;
    }


    window.onkeydown = (event) => {
      if (event.code === "Delete" || event.code === "Backspace") {
        dimensions.delete();
      }
    };

    // Initialize UI
    BUI.Manager.init();

    const panel = BUI.Component.create<BUI.PanelSection>(() => {
      return BUI.html`
          <bim-panel active label="Length Measurement" class="options-menu">
            <bim-panel-section collapsed label="Controls">
              <bim-label>Create dimension: Double click</bim-label>
              <bim-label>Delete dimension: Delete key</bim-label>
            </bim-panel-section>

            <bim-panel-section collapsed label="Options">
              <bim-checkbox checked label="Dimensions enabled"
                @change="${({ target }: { target: BUI.Checkbox }) => {
          dimensions.enabled = target.value;
        }}"
              ></bim-checkbox>
              <bim-checkbox checked label="Dimensions visible"
                @change="${({ target }: { target: BUI.Checkbox }) => {
          dimensions.visible = target.value;
        }}"
              ></bim-checkbox>

              <bim-color-input
                label="Dimensions Color"
                color="#202932"
                @input="${({ target }: { target: BUI.ColorInput }) => {
          dimensions.color.set(target.color);
        }}"
              ></bim-color-input>

              <bim-button label="Delete all"
                @click="${() => {
          dimensions.deleteAll();
        }}"
              ></bim-button>
            </bim-panel-section>
          </bim-panel>
        `;
    });

    containerRef.current.appendChild(panel);

  }, [])

  useEffect(() => {
    console.log(dimentionsInstance?.list);
  }, [dimentionsInstance?.list])
  return <div id="container" ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}

export default ExampleMeasurement;
